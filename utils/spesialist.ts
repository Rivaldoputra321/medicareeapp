import axios from 'axios';
import { api } from './api';

export interface Spesialist {
  id: string;
  name: string;
  gambar?: string;
  deleted_at: string | null;
}

export interface SpesialistResponse {
  data: Spesialist[];
  total: string | number;
  page: string | number;
  limit: number;
  totalPages: number;
}

export const fetchSpesialists = async (): Promise<Spesialist[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/spesialist/patient`);
    return response.data;
  } catch (error) {
    console.error('Error fetching specialists:', error);
    return [];
  }
};
export const fetchSpesialistById = async (id: string): Promise<Spesialist> => {
  try {
    const response = await api.get<{spesialist: Spesialist}>(`/spesialist/by/${id}`);
    if (!response.data.spesialist) {
      throw new Error('spesialist data structure is invalid');
    }
    return response.data.spesialist;
  } catch (error) {
    console.error('Error fetching spesialist:', error);
    throw new Error('Failed to fetch spesialist details');
  }
};

export const fetchAdminSpesialists = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  withDeleted: boolean = false
): Promise<SpesialistResponse> => {
  try {
    const response = await api.get<SpesialistResponse>('/spesialist', {
      params: {
        page,
        limit,
        search: search?.trim(),
        withDeleted
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Network or server error:', error.message);
      throw new Error(`Failed to fetch spesialists: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching spesialists');
  }
};
export const createSpesialist = async (formData: FormData): Promise<Spesialist> => {
  try {
    const response = await api.post('/spesialist', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create doctor');
    }
    throw new Error('An unexpected error occurred while creating doctor');
  }
};

export const updateSpesialist = async (id: string, formData: FormData): Promise<Spesialist> => {
  try {
    const response = await api.patch(`/spesialist/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update doctor');
    }
    throw new Error('An unexpected error occurred while updating doctor');
  }
};

export const fetchDeletedSpesialists = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<SpesialistResponse> => {
  try {
    const response = await api.get<SpesialistResponse>('/spesialist/deleted', {
      params: {
        page,
        limit,
        search: search?.trim(),
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch deleted doctors: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching deleted doctors');
  }
};


export const deleteSpesialist = async (id: string): Promise<void> => {
  try {
    await api.delete(`/spesialist/delete/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete doctor');
    }
    throw new Error('An unexpected error occurred while deleting doctor');
  }
};

export const restoreSpesialist = async (id: string): Promise<void> => {
  try {
    await api.patch(`/spesialist/restore/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to restore doctor');
    }
    throw new Error('An unexpected error occurred while restoring doctor');
  }
};

