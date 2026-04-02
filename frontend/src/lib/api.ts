import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/admin') && path !== '/admin/login') {
        Cookies.remove('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string }>('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// ─── RSVP ─────────────────────────────────────────────────────────────────────

export interface RsvpPayload {
  name: string;
  phone: string;
  guests_count: number;
  status: 'yes' | 'no' | 'maybe';
  notes?: string;
  dietary?: string;
}

export interface Attendee {
  id: number;
  name: string;
  phone: string;
  guests_count: number;
  status: 'yes' | 'no' | 'maybe' | 'pending';
  notes?: string;
  dietary?: string;
  invite_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendeeListResponse {
  total: number;
  confirmed: number;
  not_coming: number;
  maybe: number;
  pending: number;
  total_guests: number;
  attendees: Attendee[];
}

export const rsvpApi = {
  submit: (payload: RsvpPayload) =>
    api.post<Attendee>('/rsvp', payload),

  getAll: (params?: { search?: string; status?: string; skip?: number; limit?: number }) =>
    api.get<AttendeeListResponse>('/rsvp/all', { params }),

  getOne: (id: number) =>
    api.get<Attendee>(`/rsvp/${id}`),

  update: (id: number, payload: Partial<RsvpPayload> & { invite_sent?: boolean }) =>
    api.put<Attendee>(`/rsvp/${id}`, payload),

  delete: (id: number) =>
    api.delete(`/rsvp/${id}`),

  exportCsv: () =>
    api.get('/rsvp/export/csv', { responseType: 'blob' }),
};

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export const waApi = {
  sendInvite: (phone: string, name?: string) =>
    api.post('/whatsapp/send', { phone, name }),

  sendBulk: (phones: string[]) =>
    api.post('/whatsapp/send-bulk', { phones }),

  getQrCode: () =>
    api.get<{ qr_data_url: string; rsvp_url: string }>('/whatsapp/qr-code'),
};

export default api;
