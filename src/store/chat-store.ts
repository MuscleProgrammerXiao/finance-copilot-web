import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer, UserPermissions } from '@/src/types/business';

interface ChatStore {
  selectedCustomer: Customer | null;
  permissions: UserPermissions | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  setPermissions: (permissions: UserPermissions | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      selectedCustomer: null,
      permissions: null,
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setPermissions: (permissions) => set({ permissions }),
      reset: () => set({ selectedCustomer: null, permissions: null }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
