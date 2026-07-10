'use client';

import { useCallback, useMemo, useState } from 'react';

export interface WizardProduct {
  _id: string;
  productName: string;
  price: number;
  categoryId: string;
  categoryName: string;
}

export interface CustomerDetails {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  projectName: string;
  projectLocation: string;
}

const EMPTY_CUSTOMER: CustomerDetails = {
  customerName: '',
  phone: '',
  email: '',
  address: '',
  projectName: '',
  projectLocation: '',
};

interface Selection {
  quantity: number;
  product: WizardProduct;
}

export const WIZARD_STEPS = ['Customer', 'Categories', 'Products', 'Preview'] as const;

/**
 * Local state machine for the quotation wizard: customer details, selected
 * categories, per-product quantities, and derived live totals (a client mirror
 * of the server-side calculation — the backend remains authoritative).
 */
export function useQuotationWizard() {
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  // Per-category service charges keyed by categoryId.
  const [serviceCharges, setServiceCharges] = useState<Record<string, number>>({});

  const setServiceCharge = useCallback(
    (categoryId: string, amount: number) =>
      setServiceCharges((sc) => ({ ...sc, [categoryId]: Math.max(0, amount) || 0 })),
    []
  );

  const setCustomerField = useCallback(
    (field: keyof CustomerDetails, value: string) =>
      setCustomer((c) => ({ ...c, [field]: value })),
    []
  );

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategoryIds((ids) =>
      ids.includes(categoryId) ? ids.filter((id) => id !== categoryId) : [...ids, categoryId]
    );
    // Drop selections belonging to a de-selected category.
    setSelections((sel) => {
      const next = { ...sel };
      for (const [pid, s] of Object.entries(sel)) {
        if (s.product.categoryId === categoryId) delete next[pid];
      }
      // If the category was NOT previously selected we keep everything.
      return Object.keys(next).length === Object.keys(sel).length ? sel : next;
    });
    // Drop its service charge too.
    setServiceCharges((sc) => {
      if (!(categoryId in sc)) return sc;
      const next = { ...sc };
      delete next[categoryId];
      return next;
    });
  }, []);

  const setQuantity = useCallback((product: WizardProduct, quantity: number) => {
    setSelections((sel) => {
      const next = { ...sel };
      if (quantity <= 0) delete next[product._id];
      else next[product._id] = { quantity, product };
      return next;
    });
  }, []);

  const removeSelection = useCallback((productId: string) => {
    setSelections((sel) => {
      const next = { ...sel };
      delete next[productId];
      return next;
    });
  }, []);

  const selectionList = useMemo(() => Object.values(selections), [selections]);

  // Per-category totals: productTotal (line items), serviceCharge (own), serviceTotal.
  const categoryTotals = useMemo(() => {
    const map = new Map<string, { categoryId: string; categoryName: string; productTotal: number }>();
    for (const { quantity, product } of selectionList) {
      const entry = map.get(product.categoryId) ?? {
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        productTotal: 0,
      };
      entry.productTotal += product.price * quantity;
      map.set(product.categoryId, entry);
    }
    return [...map.values()].map((c) => {
      const serviceCharge = Number(serviceCharges[c.categoryId]) || 0;
      return { ...c, serviceCharge, serviceTotal: c.productTotal + serviceCharge };
    });
  }, [selectionList, serviceCharges]);

  const productTotal = useMemo(
    () => categoryTotals.reduce((sum, c) => sum + c.productTotal, 0),
    [categoryTotals]
  );
  // Grand total = sum of each category's service total.
  const grandTotal = useMemo(
    () => categoryTotals.reduce((sum, c) => sum + c.serviceTotal, 0),
    [categoryTotals]
  );

  const itemsForApi = useMemo(
    () => selectionList.map((s) => ({ productId: s.product._id, quantity: s.quantity })),
    [selectionList]
  );

  // Only send charges for categories that currently have products.
  const serviceChargesForApi = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of categoryTotals) map[c.categoryId] = c.serviceCharge;
    return map;
  }, [categoryTotals]);

  // Email is optional, but if provided it must be a valid address.
  const emailValid = useMemo(() => {
    const v = customer.email.trim();
    return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [customer.email]);

  const canNext = useMemo(() => {
    if (step === 0) return customer.customerName.trim().length >= 2 && emailValid;
    if (step === 1) return selectedCategoryIds.length >= 1;
    if (step === 2) return itemsForApi.length >= 1;
    return true;
  }, [step, customer.customerName, emailValid, selectedCategoryIds.length, itemsForApi.length]);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const reset = useCallback(() => {
    setStep(0);
    setCustomer(EMPTY_CUSTOMER);
    setSelectedCategoryIds([]);
    setSelections({});
    setServiceCharges({});
  }, []);

  return {
    step,
    customer,
    setCustomerField,
    selectedCategoryIds,
    toggleCategory,
    emailValid,
    selections,
    selectionList,
    setQuantity,
    removeSelection,
    serviceCharges,
    setServiceCharge,
    categoryTotals,
    productTotal,
    grandTotal,
    itemsForApi,
    serviceChargesForApi,
    canNext,
    next,
    back,
    reset,
  };
}

export type QuotationWizardState = ReturnType<typeof useQuotationWizard>;
