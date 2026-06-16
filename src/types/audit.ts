export interface AuditLog {
  id: number;
  userId: number | null;
  actorName: string;
  actorRole: string;
  action: string;
  resourceName: string;
  resourceId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
