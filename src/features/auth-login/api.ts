import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import type { CurrentUser, Tokens } from '@app-init/store/auth-store';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: CurrentUser;
  tokens: Tokens;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await http.post<ItemResponse<LoginResponse>>(apiRoutes.auth.login, payload);
  return res.data.data;
}
