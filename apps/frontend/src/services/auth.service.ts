import api from './api';
import type { LoginDto, RegisterDto, AuthToken, AuthUser } from '@campus-im/shared';

interface LoginResult extends AuthToken {
  user: AuthUser;
}

export async function login(dto: LoginDto): Promise<LoginResult> {
  const { data: result } = await api.post('/auth/login', dto);
  return result;
}

export async function register(dto: RegisterDto): Promise<LoginResult> {
  const { data: result } = await api.post('/auth/register', dto);
  return result;
}

export async function getMe(): Promise<AuthUser> {
  const { data: user } = await api.get('/auth/me');
  return user;
}
