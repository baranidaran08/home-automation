import { create } from 'zustand';

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

interface Selection {
  quantity: number;
  product: WizardProduct;
}

export const WIZARD_STEPS = ['Customer', 'Categories', 'Products', 'Preview'] as const;

const EMPTY_CUSTOMER: CustomerDetails = {
  customerName: '',
  phone: '',
  email: '',
  address: '',
  projectName: '',
  projectLocation: '',
};

interface QuotationDraftState {
  // Raw wizard state (persisted across in-app navigation via this module store).
  step: number;
  customer: CustomerDetails;
  selectedCategoryIds: string[];
  selections: Record<string, Selection>;
  serviceCharges: Record<string, number>;

  // Actions
  next: () => void;
  back: () => void;
  setCustomerField: (field: keyof CustomerDetails, value: string) => void;
  toggleCategory: (categoryId: string) => void;
  setQuantity: (product: WizardProduct, quantity: number) => void;
  removeSelection: (productId: string) => void;
  setServiceCharge: (categoryId: string, amount: number) => void;
  clearServiceCharge: (categoryId: string) => void;
  reset: () => void;
}

/**
 * Draft store for the Generate Quotation wizard. Because a Zustand store is a
 * module-level singleton, the draft (step, customer, categories, products,
 * service charges) survives navigating to other dashboard pages and back. It is
 * cleared on `reset()` (successful generate / New Quotation) and on a full page
 * refresh — no server-side persistence.
 */
export const useQuotationDraftStore = create<QuotationDraftState>((set) => ({
  step: 0,
  customer: EMPTY_CUSTOMER,
  selectedCategoryIds: [],
  selections: {},
  serviceCharges: {},

  next: () => set((s) => ({ step: Math.min(s.step + 1, WIZARD_STEPS.length - 1) })),
  back: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

  setCustomerField: (field, value) =>
    set((s) => ({ customer: { ...s.customer, [field]: value } })),

  toggleCategory: (categoryId) =>
    set((s) => {
      const isSelected = s.selectedCategoryIds.includes(categoryId);
      const selectedCategoryIds = isSelected
        ? s.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...s.selectedCategoryIds, categoryId];

      // Adding a category keeps everything else untouched.
      if (!isSelected) return { selectedCategoryIds };

      // Removing a category drops its products and its service charge.
      const selections = { ...s.selections };
      for (const [pid, sel] of Object.entries(s.selections)) {
        if (sel.product.categoryId === categoryId) delete selections[pid];
      }
      const serviceCharges = { ...s.serviceCharges };
      delete serviceCharges[categoryId];
      return { selectedCategoryIds, selections, serviceCharges };
    }),

  setQuantity: (product, quantity) =>
    set((s) => {
      const selections = { ...s.selections };
      if (quantity <= 0) delete selections[product._id];
      else selections[product._id] = { quantity, product };
      return { selections };
    }),

  removeSelection: (productId) =>
    set((s) => {
      const selections = { ...s.selections };
      delete selections[productId];
      return { selections };
    }),

  setServiceCharge: (categoryId, amount) =>
    set((s) => ({ serviceCharges: { ...s.serviceCharges, [categoryId]: Math.max(0, amount) || 0 } })),

  // Remove the key entirely so a blank field reads as "not entered" (≠ 0).
  clearServiceCharge: (categoryId) =>
    set((s) => {
      if (!(categoryId in s.serviceCharges)) return s;
      const serviceCharges = { ...s.serviceCharges };
      delete serviceCharges[categoryId];
      return { serviceCharges };
    }),

  reset: () =>
    set({
      step: 0,
      customer: EMPTY_CUSTOMER,
      selectedCategoryIds: [],
      selections: {},
      serviceCharges: {},
    }),
}));
