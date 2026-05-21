export interface Income {
  id: string;
  projectId?: string | null;
  clientId?: string | null;
  amount: number;
  date: string;
  comment?: string | null;
  project?: { id: string; name: string } | null;
  client?: { id: string; name: string } | null;
}
