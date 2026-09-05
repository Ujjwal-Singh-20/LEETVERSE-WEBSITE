import {
  DomainGroup,
  Project,
  GalleryListingItem,
  PublicMember,
  Reminder,
  AdminMember,
  DomainTreeNode,
  AdminUser,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const ADMIN_TOKEN_KEY = import.meta.env.VITE_ADMIN_TOKEN_KEY || 'leetverse_admin_token';

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

let onAuthFailureCallback: (() => void) | null = null;

export function setOnAuthFailure(callback: () => void): void {
  onAuthFailureCallback = callback;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth: boolean = false
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getAdminToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorCode = 'UNKNOWN_ERROR';
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const data = await response.json();
        if (data && data.error) {
          errorCode = data.error.code || errorCode;
          errorMessage = data.error.message || errorMessage;
        }
      } catch {
        // response wasn't json
      }

      if (
        (response.status === 401 || response.status === 403) &&
        requiresAuth
      ) {
        removeAdminToken();
        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }
      }

      throw new ApiError(response.status, errorCode, errorMessage);
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, 'NETWORK_ERROR', err.message || 'Network request failed');
  }
}

/* ----------------- Public API Endpoints ----------------- */

export async function fetchMembers(): Promise<DomainGroup[]> {
  const data = await request<{ domains: DomainGroup[] }>('/api/members');
  return data.domains || [];
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await request<{ projects: Project[] }>('/api/projects');
  return data.projects || [];
}

export async function fetchGallery(): Promise<GalleryListingItem[]> {
  const data = await request<{ events: GalleryListingItem[] }>('/api/gallery');
  return data.events || [];
}

export async function fetchGalleryImages(slug: string): Promise<{ slug: string; eventName: string; images: string[] }> {
  return request<{ slug: string; eventName: string; images: string[] }>(`/api/gallery/${slug}/images`);
}

export async function fetchBusinessCard(username: string): Promise<PublicMember> {
  return request<PublicMember>(`/api/u/${username}`);
}

export async function fetchReminders(): Promise<Reminder[]> {
  const data = await request<{ reminders: Reminder[] }>('/api/reminders');
  return data.reminders || [];
}

/* ----------------- Admin Auth Endpoints ----------------- */

export async function loginAdminSession(idToken: string): Promise<{ user: AdminUser }> {
  const res = await request<{ user: AdminUser }>(
    '/api/admin/session',
    {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    },
    false
  );
  setAdminToken(idToken);
  return res;
}

export async function fetchAdminMe(): Promise<{ user: AdminUser }> {
  return request<{ user: AdminUser }>('/api/admin/me', {}, true);
}

/* ----------------- Admin Members Endpoints ----------------- */

export async function fetchAdminMemberTree(): Promise<DomainTreeNode[]> {
  const data = await request<any>('/api/admin/members/tree', {}, true);
  if (Array.isArray(data)) return data;
  return data?.tree || [];
}

export async function checkUsernameAvailable(username: string): Promise<{ available: boolean; username: string }> {
  return request<{ available: boolean; username: string }>(
    `/api/admin/usernames/check?username=${encodeURIComponent(username)}`,
    {},
    true
  );
}

export async function createAdminMember(data: Record<string, any>): Promise<{ member: AdminMember }> {
  return request<{ member: AdminMember }>(
    '/api/admin/members',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );
}

export async function updateAdminMemberField(
  domain: string,
  docId: string,
  field: string,
  value: string | null
): Promise<{ member: AdminMember }> {
  return request<{ member: AdminMember }>(
    `/api/admin/members/${encodeURIComponent(domain)}/${encodeURIComponent(docId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ field, value }),
    },
    true
  );
}

export async function deleteAdminMember(domain: string, docId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/api/admin/members/${encodeURIComponent(domain)}/${encodeURIComponent(docId)}`,
    {
      method: 'DELETE',
    },
    true
  );
}

/* ----------------- Admin Projects Endpoints ----------------- */

export async function fetchAdminProjects(): Promise<Project[]> {
  const data = await request<any>('/api/admin/projects', {}, true);
  if (Array.isArray(data)) return data;
  return data?.projects || [];
}

export async function fetchAdminProject(slug: string): Promise<Project> {
  return request<Project>(`/api/admin/projects/${encodeURIComponent(slug)}`, {}, true);
}

export async function createAdminProject(data: Partial<Project>): Promise<Project> {
  return request<Project>(
    '/api/admin/projects',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );
}

export async function updateAdminProject(slug: string, data: Partial<Project>): Promise<Project> {
  return request<Project>(
    `/api/admin/projects/${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    true
  );
}

export async function deleteAdminProject(slug: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/api/admin/projects/${encodeURIComponent(slug)}`,
    {
      method: 'DELETE',
    },
    true
  );
}

/* ----------------- Admin Gallery Endpoints ----------------- */

export async function fetchAdminGallery(): Promise<GalleryListingItem[]> {
  const data = await request<any>('/api/admin/gallery', {}, true);
  if (Array.isArray(data)) return data;
  return data?.events || [];
}

export async function fetchAdminGalleryEvent(slug: string): Promise<any> {
  return request<any>(`/api/admin/gallery/${encodeURIComponent(slug)}`, {}, true);
}

export async function createAdminGalleryEvent(data: Record<string, any>): Promise<any> {
  return request<any>(
    '/api/admin/gallery',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );
}

export async function updateAdminGalleryEvent(slug: string, data: Record<string, any>): Promise<any> {
  return request<any>(
    `/api/admin/gallery/${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    true
  );
}

export async function deleteAdminGalleryEvent(slug: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/api/admin/gallery/${encodeURIComponent(slug)}`,
    {
      method: 'DELETE',
    },
    true
  );
}

/* ----------------- Admin Reminders Endpoints ----------------- */

export async function fetchAdminReminders(): Promise<Reminder[]> {
  const data = await request<{ reminders: Reminder[] }>('/api/admin/reminders', {}, true);
  return data.reminders || [];
}

export async function createAdminReminder(data: {
  text: string;
  startAt: string;
  endAt: string;
  targetSection?: string;
}): Promise<{ reminder: Reminder }> {
  return request<{ reminder: Reminder }>(
    '/api/admin/reminders',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );
}

export async function deleteAdminReminder(docId: string): Promise<{ success: boolean; docId: string }> {
  return request<{ success: boolean; docId: string }>(
    `/api/admin/reminders/${encodeURIComponent(docId)}`,
    {
      method: 'DELETE',
    },
    true
  );
}

/* ----------------- Upload Endpoints ----------------- */

export async function uploadSingleFile(file: File, folder: string = 'leetverse'): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('image', file);

  return request<{ url: string; publicId: string }>(
    `/api/admin/upload/single?folder=${encodeURIComponent(folder)}`,
    {
      method: 'POST',
      body: formData,
    },
    true
  );
}

export async function uploadMultipleFiles(files: File[], folder: string = 'leetverse'): Promise<{ urls: string[]; count: number }> {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));

  return request<{ urls: string[]; count: number }>(
    `/api/admin/upload/multiple?folder=${encodeURIComponent(folder)}`,
    {
      method: 'POST',
      body: formData,
    },
    true
  );
}

/* ----------------- Cache Refresh Endpoint ----------------- */

export async function triggerCacheRefresh(): Promise<{ message: string; timestamp: string; files: string[]; destination: string }> {
  return request<{ message: string; timestamp: string; files: string[]; destination: string }>(
    '/api/admin/cache/refresh',
    {
      method: 'POST',
    },
    true
  );
}
