export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  inn: string | null;
  address: string | null;
  rating: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  name: string;
  phone?: string;
  email?: string;
  inn?: string;
  address?: string;
  notes?: string;
  rating?: number;
}

export type UpdateSupplierPayload = Partial<CreateSupplierPayload> & {
  isActive?: boolean;
};
