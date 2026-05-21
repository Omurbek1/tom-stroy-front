export type ProjectMemberRole = 'FOREMAN' | 'MASTER' | 'WORKER' | 'OBSERVER';

export interface ProjectMember {
  projectId: string;
  employeeId: string;
  role: ProjectMemberRole;
  assignedAt: string;
  removedAt: string | null;
  employee: {
    id: string;
    fullName: string;
    phone: string | null;
    role: string;
    photoUrl: string | null;
    isActive: boolean;
  };
}
