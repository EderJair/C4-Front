// src/types/auth.ts
export enum UserRole {
  ADMIN = 'admin',
  INGENIERO = 'ingeniero',
  TRABAJADOR = 'trabajador',
  CONDUCTOR = 'conductor'
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  dni?: string;
  isActive: boolean;
  companyName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}