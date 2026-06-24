import api from './api';
import type { User } from '@campus-im/shared';

export async function getAllUsers(): Promise<User[]> {
  const { data: users } = await api.get('/users');
  return users;
}

export async function getOnlineUsers(): Promise<User[]> {
  const { data: users } = await api.get('/users/online');
  return users;
}

export async function getUserById(id: number): Promise<User> {
  const { data: user } = await api.get(`/users/${id}`);
  return user;
}
