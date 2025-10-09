import { Tips, CreateTipDto, UpdateTipDto } from '@/types/tips';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Lấy danh sách tất cả tips
export async function getTips(): Promise<Tips[]> {
  const response = await fetch(`${API_URL}/tips`);
  if (!response.ok) {
    throw new Error('Không thể lấy danh sách tips');
  }
  return response.json();
}

// Lấy chi tiết một tip theo id
export async function getTip(id: number): Promise<Tips> {
  const response = await fetch(`${API_URL}/tips/${id}`);
  if (!response.ok) {
    throw new Error('Không thể lấy thông tin tip');
  }
  return response.json();
}

// Tạo tip mới (chỉ dành cho mentor)
export async function createTip(data: CreateTipDto): Promise<Tips> {
  const session = await getSession();
  
  if (!session?.accessToken || session?.user?.role?.toLowerCase() !== 'mentor') {
    throw new Error('Bạn cần đăng nhập với quyền mentor');
  }

  const response = await fetch(`${API_URL}/tips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Không thể tạo tip mới');
  }
  
  return response.json();
}

// Cập nhật tip (chỉ dành cho mentor và chủ sở hữu)
export async function updateTip(id: number, data: UpdateTipDto): Promise<void> {
  const session = await getSession();
  
  if (!session?.accessToken || session?.user?.role?.toLowerCase() !== 'mentor') {
    throw new Error('Bạn cần đăng nhập với quyền mentor');
  }

  const response = await fetch(`${API_URL}/Tips/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Không thể cập nhật tip');
  }
}

// Xóa tip (chỉ dành cho mentor và chủ sở hữu)
export async function deleteTip(id: number): Promise<void> {
  const session = await getSession();
  
  if (!session?.accessToken || session?.user?.role?.toLowerCase() !== 'mentor') {
    throw new Error('Bạn cần đăng nhập với quyền mentor');
  }

  const response = await fetch(`${API_URL}/Tips/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Không thể xóa tip');
  }
}