import api from './api';
import type { Message } from '@campus-im/shared';

interface PaginatedMessages {
  data: Message[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function getPrivateHistory(
  userId: number,
  page = 1,
  pageSize = 50,
): Promise<PaginatedMessages> {
  const { data: result } = await api.get(`/chat/private/${userId}`, { params: { page, pageSize } });
  return result;
}

export async function getRoomHistory(
  roomId: number,
  page = 1,
  pageSize = 50,
): Promise<PaginatedMessages> {
  const { data: result } = await api.get(`/chat/room/${roomId}`, { params: { page, pageSize } });
  return result;
}
