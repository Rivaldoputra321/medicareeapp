import axios from 'axios';
import Cookies from 'js-cookie';

export interface Patient {
  patient: {
    id: string;
    date_of_birth: string;
    gender: string;
    height: number | null;
    weight: number | null;
    deleted_at: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      photo_profile: string | null;
      status: number;
    };
  }
}
export interface PatientResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchPatients = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  withDeleted: boolean = false
): Promise<PatientResponse> => {
  try {
    const response = await api.get<PatientResponse>('/patient', {
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
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching patients');
  }
};

export const fetchPatientId = async (userId: string): Promise<Patient> => {
  try {
    const response = await api.get<Patient>(`/patient/by/${userId}`);
    if (!response.data) {
      throw new Error('Patient data not found');
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch patient details';
      console.error('Error fetching patient:', errorMessage);
      throw new Error(errorMessage);
    }
    throw new Error('Failed to fetch patient details');
  }
};

export const updatePatientProfile = async (id: string, formData: FormData): Promise<Patient> => {
  try {
    const response = await api.patch(`/patient/profile/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update patient profile');
    }
    throw new Error('An unexpected error occurred while updating patient profile');
  }
};

export const fetchDeletedPatients = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PatientResponse> => {
  try {
    const response = await api.get<PatientResponse>('/patient/deleted', {
      params: {
        page,
        limit,
        search: search?.trim(),
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch deleted patients: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching deleted patients');
  }
};


export const deletePatient = async (id: string): Promise<void> => {
  try {
    await api.delete(`/patient/delete/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete Patients');
    }
    throw new Error('An unexpected error occurred while deleting Patients');
  }
};

export const restorePatient = async (id: string): Promise<void> => {
  try {
    await api.patch(`/patient/restore/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to restore Patient');
    }
    throw new Error('An unexpected error occurred while restoring Patient');
  }
};