export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  tel: string;
  imageUrl: string | null;
  signatureUrl?: string | null;
  position?: string | null;
  lineUserId: string | null;
  roleId: number;
  role: Role;
  hospitalId?: number | null;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

