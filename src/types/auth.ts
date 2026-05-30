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
  imageUrl: string;
  lineUserId: string | null;
  roleId: number;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
