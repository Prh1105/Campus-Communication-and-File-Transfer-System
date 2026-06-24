import api from './api';
import type { Room } from '@campus-im/shared';

export async function getRooms(): Promise<Room[]> {
  const { data: rooms } = await api.get('/rooms');
  return rooms;
}

export async function getRoom(id: number): Promise<Room> {
  const { data: room } = await api.get(`/rooms/${id}`);
  return room;
}

export async function createRoom(name: string, isGroup = false): Promise<Room> {
  const { data: room } = await api.post('/rooms', { name, isGroup });
  return room;
}
