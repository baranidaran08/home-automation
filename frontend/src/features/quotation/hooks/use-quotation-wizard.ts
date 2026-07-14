'use client';

import { useMemo } from 'react';
import {
  useQuotationDraftStore,
  WIZARD_STEPS,
  type CustomerDetails,
  type WizardProduct,
} from '../store/quotation-draft.store';

// Re-export so existing imports (`from '../hooks/use-quotation-wizard'`) keep working.
export { WIZARD_STEPS };
export type { CustomerDetails, WizardProduct };

/**
 * Wizard facade over the persisted draft store: exposes the raw draft state,
 * the actions, and derived live totals (a client mirror of the server-side
 * calculation — the backend remains authoritative). The draft itself survives
 * dashboard navigation because it lives in the module-level Zustand store.
 */
export function useQuotationWizard() {
  const step = useQuotationDraftStore((s) => s.step);
  const customer = useQuotationDraftStore((s) => s.customer);
  const selectedCategoryIds = useQuotationDraftStore((s) => s.selectedCategoryIds);
  const selections = useQuotationDraftStore((s) => s.selections);
  const serviceCharges = useQuotationDraftStore((s) => s.serviceCharges);

  const next = useQuotationDraftStore((s) => s.next);
  const back = useQuotationDraftStore((s) => s.back);
  const reset = useQuotationDraftStore((s) => s.reset);
  const setCustomerField = useQuotationDraftStore((s) => s.setCustomerField);
  const toggleCategory = useQuotationDraftStore((s) => s.toggleCategory);
  const setQuantity = useQuotationDraftStore((s) => s.setQuantity);
  const removeSelection = useQuotationDraftStore((s) => s.removeSelection);
  const setServiceCharge = useQuotationDraftStore((s) => s.setServiceCharge);
  const clearServiceCharge = useQuotationDraftStore((s) => s.clearServiceCharge);

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

  // Every product-bearing category must have an EXPLICIT service charge entered
  // (0 counts; a blank/absent value does not).
  const serviceChargesComplete = useMemo(
    () => categoryTotals.every((c) => typeof serviceCharges[c.categoryId] === 'number'),
    [categoryTotals, serviceCharges]
  );

  // Email is optional, but if provided it must be a valid address.
  const emailValid = useMemo(() => {
    const v = customer.email.trim();
    return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [customer.email]);

  // Phone must be exactly 10 digits.
  const phoneValid = useMemo(() => /^\d{10}$/.test(customer.phone), [customer.phone]);

  const canNext = useMemo(() => {
    if (step === 0) return customer.customerName.trim().length >= 2 && emailValid && phoneValid;
    if (step === 1) return selectedCategoryIds.length >= 1;
    if (step === 2) return itemsForApi.length >= 1 && serviceChargesComplete;
    return true;
  }, [
    step,
    customer.customerName,
    emailValid,
    phoneValid,
    selectedCategoryIds.length,
    itemsForApi.length,
    serviceChargesComplete,
  ]);

  return {
    step,
    customer,
    setCustomerField,
    selectedCategoryIds,
    toggleCategory,
    emailValid,
    phoneValid,
    selections,
    selectionList,
    setQuantity,
    removeSelection,
    serviceCharges,
    setServiceCharge,
    clearServiceCharge,
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
