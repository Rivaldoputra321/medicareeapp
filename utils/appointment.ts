// src/services/appointment.ts
import axios from 'axios';
import { api } from './api';

// Enums
export enum AppointmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  RESCHEDULED = 'RESCHEDULED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SETTLEMENT = 'SETTLEMENT',
  CAPTURE = 'CAPTURE',
  DENY = 'DENY',
  CANCEL = 'CANCEL',
  EXPIRE = 'EXPIRE',
  REFUND = 'REFUND'
}

// Interfaces
export interface Transaction {
  id: string;
  appointment_id: string;
  amount: number;
  adminFee: number;
  doctorFee: number;
  status: PaymentStatus;
  midtransOrderId: string;
  paidAt?: Date;
}

export interface Doctor {
  id: string;
  price: string;
  user: {
    id: string;
    name: string;
    photo_profile: string;
  };
}

export interface Patient {
  id: string;
  user: {
    id: string;
    name: string;
    photo_profile: string;
  };
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  schedule: Date;
  status: AppointmentStatus;
  meeting_link?: string;
  link_sent_at?: Date;
  meeting_link_expired?: Date;
  is_doctor_present: boolean;
  is_patient_present: boolean;
  reschedule_count: number;
  rejection_reason?: string;
  created_at: Date;
  transaction?: Transaction;
  doctor?: Doctor;
  patient?: Patient;
}

// DTOs
export interface CreateAppointmentDto {
  doctorId: string;
  schedule: string;
}

export interface UpdateAppointmentStatusDto {
  action: 'approve' | 'reject';
  rejectionReason?: string;
  reschedule?: Date;
}

export interface SetMeetingLinkDto {
  meetingLink: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Functions
export const createAppointment = async (appointmentData: CreateAppointmentDto): Promise<Appointment> => {
  try {
    const response = await api.post<Appointment>('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
    throw error;
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  updateData: UpdateAppointmentStatusDto
): Promise<Appointment> => {
  try {
    const response = await api.put<Appointment>(
      `/appointments/status/${appointmentId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
    throw error;
  }
};

export const rescheduleAppointment = async (
  appointmentId: string,
  updateData: UpdateAppointmentStatusDto
): Promise<Appointment> => {
  try {
    const response = await api.put<Appointment>(
      `/appointments/reschedule/${appointmentId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to reschedule appointment');
    }
    throw error;
  }
};

export const setMeetingLink = async (
  appointmentId: string,
  linkData: SetMeetingLinkDto
): Promise<Appointment> => {
  try {
    const response = await api.put<Appointment>(
      `/appointments/meeting-link/${appointmentId}`,
      linkData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to set meeting link');
    }
    throw error;
  }
};

export const recordPresence = async (appointmentId: string): Promise<Appointment> => {
  try {
    const response = await api.post<Appointment>(
      `/appointments/presence/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to record presence');
    }
    throw error;
  }
};

export const getAppointmentsByStatus = async (
  statusGroup: 'waiting' | 'failed' | 'completed',
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Appointment>> => {
  try {
    const response = await api.get<PaginatedResponse<Appointment>>(
      `/appointments/list/${statusGroup}`,
      {
        params: { page, limit }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
    throw error;
  }
};