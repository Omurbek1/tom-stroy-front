export interface Brigade {
  id: string;
  name: string;
  specialization?: string | null;
  foremanId?: string | null;
  foreman?: { id: string; fullName: string } | null;
  warehouse?: { id: string; name: string } | null;
  _count?: { members: number; works: number };
}

export interface BrigadeMember {
  id: string;
  employee: { id: string; fullName: string; role: string };
  joinedAt: string;
}

export interface BrigadeDetail extends Brigade {
  members: BrigadeMember[];
}

export interface CreateBrigadePayload {
  name: string;
  specialization?: string;
  foremanId?: string;
}

export interface BrigadeStats {
  works: {
    count: number;
    totalAmount: number;
    totalVolume: number;
    byProject: Array<{ projectId: string; projectName: string; amount: number }>;
    recent: Array<{
      id: string;
      date: string;
      projectId: string;
      projectName: string;
      workType: string;
      unit: string;
      volume: number;
      price: number;
      amount: number;
      employeeName: string | null;
    }>;
  };
  finance: {
    earned: number;
    bonus: number;
    advance: number;
    fines: number;
    deductions: number;
    paid: number;
    netToPay: number;
    balance: number;
  };
  stock: {
    items: Array<{
      itemId: string;
      itemName: string;
      unit: string;
      qty: number;
      reserved: number;
      available: number;
      avgCost: number;
      value: number;
    }>;
    totalValue: number;
  };
  membersCount: number;
  isProjectScoped?: boolean;
}
