'use strict';

const Product = require('../models/product.model');
const Template = require('../models/template.model');
const { Quotation, QUOTATION_STATUS } = require('../models/quotation.model');
const { getNextSequence } = require('../models/counter.model');
const ApiError = require('../utils/ApiError');
const { escapeRegExp } = require('../utils/text');
const { resolvePagination, buildPaginationMeta } = require('../utils/pagination');
const cloudinaryService = require('./cloudinary.service');
const docService = require('./quotation-document.service');
const logger = require('../utils/logger');
const { MESSAGES } = require('../constants');

const CATEGORY_POPULATE = { path: 'categories', select: 'categoryName slug' };

/** Format QTN-000001 from the atomic counter. */
const nextQuotationNumber = async () => {
  const seq = await getNextSequence('quotation');
  return `QTN-${String(seq).padStart(6, '0')}`;
};

/**
 * Build server-authoritative line items and totals from the raw input.
 * Unit prices are ALWAYS taken from the Product (admin cannot edit prices).
 */
const computeTotals = async (rawItems = [], serviceCharges = {}) => {
  const ids = [...new Set(rawItems.map((i) => String(i.productId)))];
  const products = await Product.find({ _id: { $in: ids } }).populate('category', 'categoryName');
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  const catMap = new Map(); // categoryId -> { category, categoryName, productTotal }

  for (const raw of rawItems) {
    const product = byId.get(String(raw.productId));
    if (!product) {
      throw ApiError.badRequest(`${MESSAGES.PRODUCT_NOT_FOUND}: ${raw.productId}`);
    }
    const quantity = Number(raw.quantity);
    const unitPrice = product.price;
    const totalPrice = unitPrice * quantity;
    const categoryId = String(product.category?._id ?? product.category);

    items.push({
      product: product._id,
      productName: product.productName,
      category: product.category?._id ?? product.category,
      quantity,
      unitPrice,
      totalPrice,
    });

    const entry = catMap.get(categoryId) || {
      category: product.category?._id ?? product.category,
      categoryName: product.category?.categoryName ?? '',
      productTotal: 0,
    };
    entry.productTotal += totalPrice;
    catMap.set(categoryId, entry);
  }

  // Attach each category's own service charge and derive its service total.
  const categoryTotals = [...catMap.entries()].map(([categoryId, c]) => {
    const serviceCharge = Number(serviceCharges?.[categoryId]) || 0;
    return {
      category: c.category,
      categoryName: c.categoryName,
      productTotal: c.productTotal,
      serviceCharge,
      serviceTotal: c.productTotal + serviceCharge,
    };
  });

  const productTotal = categoryTotals.reduce((s, c) => s + c.productTotal, 0);
  const serviceCharge = categoryTotals.reduce((s, c) => s + c.serviceCharge, 0);
  const grandTotal = categoryTotals.reduce((s, c) => s + c.serviceTotal, 0);
  const categories = categoryTotals.map((c) => c.category);

  return {
    items,
    categoryTotals,
    productTotal,
    serviceCharge,
    serviceTotal: grandTotal,
    grandTotal,
    categories,
  };
};

const applyCustomerFields = (target, data) => {
  const FIELDS = ['customerName', 'phone', 'email', 'address', 'projectName', 'projectLocation'];
  FIELDS.forEach((f) => {
    if (data[f] !== undefined) target[f] = data[f];
  });
};

const findByIdOrFail = async (id, { populate = false } = {}) => {
  const query = Quotation.findById(id);
  if (populate) query.populate(CATEGORY_POPULATE);
  const quotation = await query;
  if (!quotation) {
    throw ApiError.notFound(MESSAGES.QUOTATION_NOT_FOUND);
  }
  return quotation;
};

const assignTotals = (quotation, computed) => {
  quotation.items = computed.items;
  quotation.categories = computed.categories;
  quotation.categoryTotals = computed.categoryTotals;
  quotation.productTotal = computed.productTotal;
  quotation.serviceCharge = computed.serviceCharge;
  quotation.serviceTotal = computed.serviceTotal;
  quotation.grandTotal = computed.grandTotal;
};

const createQuotation = async (data) => {
  const computed = await computeTotals(data.items, data.serviceCharges);
  const quotationNumber = await nextQuotationNumber();

  const quotation = new Quotation({
    quotationNumber,
    quotationDate: new Date(),
    status: QUOTATION_STATUS.DRAFT,
  });
  assignTotals(quotation, computed);
  applyCustomerFields(quotation, data);
  await quotation.save();
  return quotation.populate(CATEGORY_POPULATE);
};

const updateQuotation = async (id, data) => {
  const quotation = await findByIdOrFail(id);
  applyCustomerFields(quotation, data);

  // Recompute when items or any per-category service charge changes. Missing
  // pieces fall back to the current quotation's stored values.
  if (data.items || data.serviceCharges) {
    const rawItems =
      data.items ?? quotation.items.map((i) => ({ productId: i.product, quantity: i.quantity }));
    const serviceCharges =
      data.serviceCharges ??
      Object.fromEntries(
        quotation.categoryTotals.map((c) => [String(c.category), c.serviceCharge])
      );

    const computed = await computeTotals(rawItems, serviceCharges);
    assignTotals(quotation, computed);
    quotation.status = QUOTATION_STATUS.DRAFT; // stale PDF
  }

  await quotation.save();
  return quotation.populate(CATEGORY_POPULATE);
};

const getQuotationById = async (id) => findByIdOrFail(id, { populate: true });

const getQuotations = async ({ page, limit, search, status } = {}) => {
  const { page: safePage, limit: safeLimit, skip } = resolvePagination({ page, limit });

  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const rx = { $regex: escapeRegExp(search), $options: 'i' };
    filter.$or = [{ quotationNumber: rx }, { customerName: rx }];
  }

  const [items, total] = await Promise.all([
    Quotation.find(filter)
      .populate(CATEGORY_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Quotation.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ page: safePage, limit: safeLimit, total }) };
};

/**
 * Generate the quotation document:
 *  - fill each selected category's Word template (customer + product table + totals),
 *  - merge all category documents into one .docx,
 *  - convert to a single PDF, upload it, and persist the URL.
 */
const generateQuotation = async (id) => {
  const quotation = await findByIdOrFail(id, { populate: true });

  if (!quotation.items.length) {
    throw ApiError.badRequest(MESSAGES.QUOTATION_NO_ITEMS);
  }

  // Auto-detect one template per selected category.
  const templates = await Template.find({
    category: { $in: quotation.categoryTotals.map((c) => c.category) },
  });
  const templateByCat = new Map(templates.map((t) => [String(t.category), t]));

  const missing = quotation.categoryTotals.filter((c) => !templateByCat.has(String(c.category)));
  if (missing.length) {
    const names = missing.map((c) => c.categoryName).join(', ');
    throw ApiError.badRequest(`${MESSAGES.QUOTATION_TEMPLATE_MISSING}: ${names}`);
  }

  const quotationDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    quotation.quotationDate
  );

  // Fill one document per category using ONLY that category's own totals.
  const buffers = [];
  for (const cat of quotation.categoryTotals) {
    const template = templateByCat.get(String(cat.category));
    // eslint-disable-next-line no-await-in-loop
    const templateBuffer = await docService.fetchBuffer(template.templateFile.secureUrl);
    const catItems = quotation.items.filter((i) => String(i.category) === String(cat.category));

    const mergeData = {
      customer_name: quotation.customerName,
      phone: quotation.phone,
      email: quotation.email,
      address: quotation.address,
      project_name: quotation.projectName,
      project_location: quotation.projectLocation,
      quotation_number: quotation.quotationNumber,
      quotation_date: quotationDate,
      // Current category's own totals (not the quotation-wide totals).
      product_total: docService.money(cat.productTotal),
      service_charge: docService.money(cat.serviceCharge),
      service_total: docService.money(cat.serviceTotal),
    };
    buffers.push(docService.fillCategoryDocx(templateBuffer, mergeData, catItems));
  }

  // Append a final summary page listing every service + the grand total.
  buffers.push(
    docService.buildSummaryDocx(
      quotation.categoryTotals.map((c) => ({
        name: c.categoryName,
        productTotal: c.productTotal,
        serviceCharge: c.serviceCharge,
        serviceTotal: c.serviceTotal,
      })),
      quotation.grandTotal
    )
  );

  const mergedDocx = docService.mergeDocx(buffers);
  const pdfBuffer = await docService.convertToPdf(mergedDocx);

  logger.info(
    `[quotation] ${quotation.quotationNumber}: generated PDF (${pdfBuffer.length} bytes)`
  );

  const uploaded = await cloudinaryService.uploadRawFile(
    { buffer: pdfBuffer, originalname: `${quotation.quotationNumber}.pdf` },
    'quotations'
  );

  quotation.pdf = { publicId: uploaded.publicId, secureUrl: uploaded.secureUrl };
  quotation.status = QUOTATION_STATUS.GENERATED;
  await quotation.save();
  return quotation.populate(CATEGORY_POPULATE);
};

/**
 * Fetch the generated PDF and the download filename. The endpoint streams this
 * through our server so we control the Content-Type / Content-Disposition and
 * the browser saves it as `quotation-QTN-000001.pdf`.
 */
const getPdfDownload = async (id) => {
  const quotation = await findByIdOrFail(id);
  if (!quotation.pdf?.secureUrl) {
    throw ApiError.badRequest('This quotation has not been generated yet');
  }
  const res = await fetch(quotation.pdf.secureUrl);
  if (!res.ok) {
    throw ApiError.internal('Failed to fetch the generated PDF');
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = `quotation-${quotation.quotationNumber}.pdf`;
  return { buffer, filename };
};

module.exports = {
  createQuotation,
  updateQuotation,
  getQuotationById,
  getQuotations,
  generateQuotation,
  getPdfDownload,
};
