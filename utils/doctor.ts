import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from './api';

export interface Doctor {
  id: string;
  experience: string;
  alumnus: string;
  no_str: string;
  price: number;
  file_str: string;
  deleted_at: string | null;
  user: {
    name: string;
    email: string;
    photo_profile: string | null;
    status: number;
  };
  spesialist: {
    name: string;
  };
}

export interface DoctorResponse {
  data: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDoctorDto {
  name: string;
  email: string;
  password: string;
  photo_profile?: string;
  experience: string;
  alumnus: string;
  no_str: string;
  price: number;
  spesialist: string;
}

// Create axios instance with default config
export const updateDoctor = async (id: string, formData: FormData): Promise<Doctor> => {
  try {
    const response = await api.put(`/doctors/update/${id}`, formData, {
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

export const updateDoctorProfile = async (id: string, formData: FormData): Promise<Doctor> => {
  try {
    const response = await api.patch(`/doctors/profile/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update doctor profile');
    }
    throw new Error('An unexpected error occurred while updating doctor profile');
  }
};


export const fetchDoctors = async (
  spesialistId?: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
  withDeleted: boolean = false
): Promise<DoctorResponse> => {
  try {
    const response = await api.get<DoctorResponse>('/spesialist/doctor', {
      params: {
        spesialistId,
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
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching doctors');
  }
};

export const fetchDoctorId = async (id: string): Promise<Doctor> => {
  try {
    const response = await api.get<{doctor: Doctor}>(`/doctors/by/${id}`);
    if (!response.data.doctor) {
      throw new Error('Doctor data structure is invalid');
    }
    return response.data.doctor;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw new Error('Failed to fetch doctor details');
  }
};

export const fetchDeletedDoctors = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<DoctorResponse> => {
  try {
    const response = await api.get<DoctorResponse>('/doctors/deleted', {
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

export const createDoctor = async (formData: FormData): Promise<Doctor> => {
  try {
    const response = await api.post('/doctors', formData, {
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

export const deleteDoctor = async (id: string): Promise<void> => {
  try {
    await api.delete(`/doctors/delete/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete doctor');
    }
    throw new Error('An unexpected error occurred while deleting doctor');
  }
};

export const restoreDoctor = async (id: string): Promise<void> => {
  try {
    await api.patch(`/doctors/restore/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to restore doctor');
    }
    throw new Error('An unexpected error occurred while restoring doctor');
  }
};