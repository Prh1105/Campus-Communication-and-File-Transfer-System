import api from './api';
import type { FileInfo } from '@campus-im/shared';

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<FileInfo> {
  const formData = new FormData();
  formData.append('file', file);

  const { data: result } = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return result;
}

export async function getFiles(my = false): Promise<FileInfo[]> {
  const { data: files } = await api.get('/files', { params: { my } });
  return files;
}
