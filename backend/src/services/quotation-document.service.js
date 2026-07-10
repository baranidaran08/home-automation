'use strict';

const { promisify } = require('util');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const libre = require('libreoffice-convert');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { MESSAGES } = require('../constants');

const convertAsync = promisify(libre.convert);

// Sentinel inserted for {{product_table}} then swapped for a real Word table.
const TABLE_MARKER = 'PRODUCTTABLEMARKERX9Z';

/** Money formatter (INR). */
const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Download a remote file (Cloudinary secureUrl) into a Buffer. */
const fetchBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch template (HTTP ${res.status})`);
  return Buffer.from(await res.arrayBuffer());
};

// ---- Word table XML for {{product_table}} ----------------------------------

const tableCell = (text, { bold = false, width, align = 'left' } = {}) => {
  const rpr = bold ? '<w:rPr><w:b/></w:rPr>' : '';
  const jc = align !== 'left' ? `<w:jc w:val="${align}"/>` : '';
  return (
    `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>` +
    `<w:p><w:pPr>${jc}</w:pPr><w:r>${rpr}<w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p></w:tc>`
  );
};

const tableRow = (cells) => `<w:tr>${cells.join('')}</w:tr>`;

const TABLE_BORDERS =
  '<w:tblBorders>' +
  ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="auto"/>`)
    .join('') +
  '</w:tblBorders>';

const COLS = { product: 4600, qty: 1100, price: 1650, total: 1650 };

const buildProductTableXml = (items) => {
  const borders = TABLE_BORDERS;

  const header = tableRow([
    tableCell('Product', { bold: true, width: COLS.product }),
    tableCell('Qty', { bold: true, width: COLS.qty, align: 'center' }),
    tableCell('Price', { bold: true, width: COLS.price, align: 'right' }),
    tableCell('Total', { bold: true, width: COLS.total, align: 'right' }),
  ]);

  const rows = items.map((it) =>
    tableRow([
      tableCell(it.productName, { width: COLS.product }),
      tableCell(String(it.quantity), { width: COLS.qty, align: 'center' }),
      tableCell(money(it.unitPrice), { width: COLS.price, align: 'right' }),
      tableCell(money(it.totalPrice), { width: COLS.total, align: 'right' }),
    ])
  );

  return (
    `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>${borders}</w:tblPr>` +
    header +
    rows.join('') +
    '</w:tbl>'
  );
};

// ---- Final summary page (per-service totals + grand total) -----------------

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const SUMMARY_COLS = { name: 3600, product: 1800, service: 1800, total: 1800 };

/**
 * Build a standalone .docx with a "Quotation Summary" heading and a table of
 * every service's Product Total / Service Charge / Service Total plus the grand
 * total. Merged in as the final page.
 */
const buildSummaryDocx = (rows, grandTotal) => {
  const header = tableRow([
    tableCell('Service', { bold: true, width: SUMMARY_COLS.name }),
    tableCell('Product Total', { bold: true, width: SUMMARY_COLS.product, align: 'right' }),
    tableCell('Service Charge', { bold: true, width: SUMMARY_COLS.service, align: 'right' }),
    tableCell('Service Total', { bold: true, width: SUMMARY_COLS.total, align: 'right' }),
  ]);

  const bodyRows = rows.map((r) =>
    tableRow([
      tableCell(r.name, { width: SUMMARY_COLS.name }),
      tableCell(money(r.productTotal), { width: SUMMARY_COLS.product, align: 'right' }),
      tableCell(money(r.serviceCharge), { width: SUMMARY_COLS.service, align: 'right' }),
      tableCell(money(r.serviceTotal), { width: SUMMARY_COLS.total, align: 'right' }),
    ])
  );

  const grandRow = tableRow([
    tableCell('GRAND TOTAL', { bold: true, width: SUMMARY_COLS.name }),
    tableCell('', { width: SUMMARY_COLS.product }),
    tableCell('', { width: SUMMARY_COLS.service }),
    tableCell(money(grandTotal), { bold: true, width: SUMMARY_COLS.total, align: 'right' }),
  ]);

  const table =
    `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/>${TABLE_BORDERS}</w:tblPr>` +
    header +
    bodyRows.join('') +
    grandRow +
    '</w:tbl>';

  const heading =
    '<w:p><w:pPr><w:spacing w:before="200" w:after="200"/></w:pPr>' +
    '<w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Quotation Summary</w:t></w:r></w:p>';

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="${WORD_NS}"><w:body>${heading}${table}<w:sectPr/></w:body></w:document>`;

  const zip = new PizZip();
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '</Types>'
  );
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '</Relationships>'
  );
  zip.file('word/document.xml', documentXml);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
};

// ---- Fill one category template --------------------------------------------

/**
 * Render a single category's Word template: fill scalar placeholders via
 * docxtemplater, then swap the {{product_table}} marker for a real Word table.
 */
const fillCategoryDocx = (templateBuffer, mergeData, items) => {
  let buf;
  try {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      delimiters: { start: '{{', end: '}}' },
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
    });
    doc.render({ ...mergeData, product_table: TABLE_MARKER });
    buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  } catch (err) {
    logger.error(`[quotation] docxtemplater render failed: ${err.message}`);
    throw ApiError.internal(MESSAGES.QUOTATION_GENERATION_FAILED);
  }

  // Replace the paragraph that contains the marker with the generated table.
  const zip2 = new PizZip(buf);
  let xml = zip2.file('word/document.xml').asText();
  if (xml.includes(TABLE_MARKER)) {
    const paragraphRe = new RegExp(
      `<w:p\\b[^>]*>(?:(?!</w:p>)[\\s\\S])*?${TABLE_MARKER}(?:(?!</w:p>)[\\s\\S])*?</w:p>`
    );
    xml = xml.replace(paragraphRe, buildProductTableXml(items));
    zip2.file('word/document.xml', xml);
    buf = zip2.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
  return buf;
};

// ---- Merge multiple docx into one ------------------------------------------

const bodyInner = (xml) => {
  const open = xml.indexOf('<w:body');
  const start = xml.indexOf('>', open) + 1;
  let end = xml.lastIndexOf('<w:sectPr');
  if (end === -1) end = xml.lastIndexOf('</w:body>');
  return xml.substring(start, end);
};

const PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

/**
 * Merge multiple generated .docx buffers into one, separated by page breaks.
 * The first document's styles/section settings are kept as the base. Suitable
 * for text + generated tables (the quotation templates); images in secondary
 * docs are not remapped.
 */
const mergeDocx = (buffers) => {
  if (buffers.length === 1) return buffers[0];

  const baseZip = new PizZip(buffers[0]);
  let baseXml = baseZip.file('word/document.xml').asText();

  let insertAt = baseXml.lastIndexOf('<w:sectPr');
  if (insertAt === -1) insertAt = baseXml.lastIndexOf('</w:body>');

  const extra = buffers
    .slice(1)
    .map((b) => PAGE_BREAK + bodyInner(new PizZip(b).file('word/document.xml').asText()))
    .join('');

  baseXml = baseXml.slice(0, insertAt) + extra + baseXml.slice(insertAt);
  baseZip.file('word/document.xml', baseXml);
  return baseZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
};

// ---- DOCX -> PDF (LibreOffice) ---------------------------------------------

const convertToPdf = async (docxBuffer) => {
  try {
    return await convertAsync(docxBuffer, '.pdf', undefined);
  } catch (err) {
    logger.error(`[quotation] PDF conversion failed: ${err.message}`);
    // Operational so the actionable reason reaches the client (e.g. LibreOffice missing).
    throw ApiError.serviceUnavailable(MESSAGES.PDF_CONVERT_FAILED);
  }
};

module.exports = {
  money,
  fetchBuffer,
  fillCategoryDocx,
  mergeDocx,
  convertToPdf,
  buildSummaryDocx,
  TABLE_MARKER,
  buildProductTableXml,
};
