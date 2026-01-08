import { create } from 'zustand';
import { Customer, UserPermissions } from '@/src/types/business';

interface ChatStore {
  selectedCustomer: Customer | null;
  permissions: UserPermissions | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  setPermissions: (permissions: UserPermissions | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedCustomer: null,
  permissions: null,
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setPermissions: (permissions) => set({ permissions }),
  reset: () => set({ selectedCustomer: null, permissions: null }),
}));
