export interface Brigade {
  id: string;
  name: string;
  specialization?: string | null;
  foremanId?: string | null;
  foreman?: { id: string; fullName: string } | null;
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
