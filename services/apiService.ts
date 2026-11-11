
import { Transaction, FilterState, User, SavedRoute, RecurringTrip } from '../types';

const API_BASE_URL = ''; // Use relative paths since we are on the same origin
const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';

/** Fired when the session can't be renewed and the user has to sign in again. */
export const AUTH_EXPIRED_EVENT = 'auth-expired';

// --- Types ---

export interface AccountInfo {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  mfaEnabled: boolean;
}

interface SessionResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AccountInfo;
}

export type SignInResult =
  | { mfaRequired: false; user: AccountInfo }
  | { mfaRequired: true; mfaToken: string };

// --- Helper Utilities ---

export class ServiceError extends Error {
  public status: number;
  public detail: any;

  constructor(status: number, message: string, detail?: any) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Helper to parse ISO date strings in JSON back to Date objects
 */
const parseDateFields = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(parseDateFields);
  } else if (data !== null && typeof data === 'object') {
    for (const key in data) {
      if (typeof data[key] === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(data[key])) {
        data[key] = new Date(data[key]);
      } else if (typeof data[key] === 'object') {
        data[key] = parseDateFields(data[key]);
      }
    }
  }
  return data;
};

const storeSession = (session: { access_token: string; refresh_token?: string }) => {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  if (session.refresh_token) localStorage.setItem(REFRESH_KEY, session.refresh_token);
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// Single in-flight refresh shared by every request that hits a 401 at the same time, so
// the rotating refresh token is only spent once.
let refreshInFlight: Promise<AccountInfo | null> | null = null;

/**
 * Renew the access token. Resolves with the account, or null if the session is gone
 * (signed out elsewhere, expired, account deleted). Rejects on network errors so callers
 * can tell "offline" apart from "signed out".
 */
function refreshSession(): Promise<AccountInfo | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return Promise.resolve(null);

  refreshInFlight = (async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (response.status === 401) {
      clearSession();
      return null;
    }
    if (!response.ok) throw new ServiceError(response.status, 'Could not refresh session');
    const session: SessionResponse = await response.json();
    storeSession(session);
    return session.user;
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * fetch() with the access token attached. On a 401 it renews the session once and retries;
 * if the session can't be renewed it signals AUTH_EXPIRED_EVENT.
 */
export async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const send = () => {
    const headers = new Headers(options.headers);
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  };

  let response = await send();
  if (response.status === 401 && localStorage.getItem(REFRESH_KEY)) {
    const account = await refreshSession().catch(() => undefined);
    if (account) {
      response = await send();
    } else if (account === null) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
  }
  return response;
}

const errorMessage = (data: any, fallback = 'An unexpected error occurred'): string => {
  if (data?.error && typeof data.error === 'string') return data.error;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail)) return data.detail.map((err: any) => err.msg).join(', ');
  return fallback;
};

/**
 * Generic API Client wrapper
 */
async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  // Set Content-Type to JSON unless we are sending FormData (file uploads)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await authFetch(endpoint, { ...options, headers });
  } catch (error) {
    // Network errors
    throw new ServiceError(0, error instanceof Error ? error.message : 'Network error');
  }

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ServiceError(response.status, errorMessage(responseData), responseData);
  }

  return parseDateFields(responseData) as T;
}

// Auth calls go straight to fetch: they must not trigger the refresh-and-retry logic.
async function authRequest<T>(endpoint: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new ServiceError(0, error instanceof Error ? error.message : 'Network error');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ServiceError(response.status, errorMessage(data), data);
  return data as T;
}

// --- Service Modules ---

export const authService = {
  /** Create an account. `profileId` keeps an existing on-device profile's data attached. */
  async register(email: string, password: string, name: string, profileId?: string): Promise<AccountInfo> {
    const session = await authRequest<SessionResponse>('/auth/register', { email, password, name, id: profileId });
    storeSession(session);
    return session.user;
  },

  async login(email: string, password: string): Promise<SignInResult> {
    const result = await authRequest<SessionResponse & { mfa_required?: boolean; mfa_token?: string }>(
      '/auth/token', { username: email, password }
    );
    if (result.mfa_required && result.mfa_token) {
      return { mfaRequired: true, mfaToken: result.mfa_token };
    }
    storeSession(result);
    return { mfaRequired: false, user: result.user };
  },

  /** Second sign-in step: an authenticator code or a recovery code. */
  async verifyMfa(mfaToken: string, code: string): Promise<AccountInfo> {
    const session = await authRequest<SessionResponse>('/auth/mfa/verify', { mfa_token: mfaToken, code });
    storeSession(session);
    return session.user;
  },

  refresh: refreshSession,

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    clearSession();
    if (refreshToken) {
      // Best effort: the session is already gone from this device either way.
      await authRequest('/auth/logout', { refresh_token: refreshToken }).catch(() => undefined);
    }
  },

  clearLocalSession: clearSession,

  hasSession(): boolean {
    return !!localStorage.getItem(REFRESH_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  async mfaSetup(): Promise<{ secret: string; otpauth_url: string; qr_data_url: string }> {
    return apiClient('/auth/mfa/setup', { method: 'POST' });
  },

  async mfaEnable(code: string): Promise<{ enabled: true; recovery_codes: string[] }> {
    return apiClient('/auth/mfa/enable', { method: 'POST', body: JSON.stringify({ code }) });
  },

  async mfaDisable(password: string, code: string): Promise<{ enabled: false }> {
    return apiClient('/auth/mfa/disable', { method: 'POST', body: JSON.stringify({ password, code }) });
  },

  /** Permanently delete the account and everything the server holds for it. */
  async deleteAccount(password: string, code?: string): Promise<void> {
    await apiClient('/account', { method: 'DELETE', body: JSON.stringify({ password, code }) });
    clearSession();
  },
};

export const transactionService = {
  async list(filters?: FilterState): Promise<Transaction[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.categoryId && filters.categoryId !== 'all') params.append('category_id', filters.categoryId);
      if (filters.startDate) params.append('start_date', filters.startDate.toISOString());
      if (filters.endDate) params.append('end_date', filters.endDate.toISOString());
      if (filters.showArchived !== undefined) params.append('isArchived', filters.showArchived.toString());
    }

    return apiClient<Transaction[]>(`/transactions?${params.toString()}`, {
      method: 'GET',
    });
  },

  async create(data: Omit<Transaction, 'id' | 'date' | 'userId'>): Promise<Transaction> {
    return apiClient<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return apiClient<Transaction>(`/transactions/${id}`, {
      method: 'PUT', // or PATCH depending on backend implementation
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiClient<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }
};

export const voiceService = {
  async uploadAndProcess(audioBlob: Blob): Promise<{ text: string; intent: any }> {
    const formData = new FormData();
    // Backend expects an UploadFile named 'file'
    formData.append('file', audioBlob, 'voice_command.webm'); 

    return apiClient<{ text: string; intent: any }>('/voice/process', {
      method: 'POST',
      body: formData,
    });
  }
};

export const receiptService = {
  async uploadAndScan(imageBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageBlob, 'receipt.jpg');

    return apiClient<any>('/receipts/scan', {
      method: 'POST',
      body: formData,
    });
  }
};

export const inventoryService = {
  async listProducts(): Promise<any[]> {
    return apiClient<any[]>('/inventory/products');
  },
  async updateInventoryItem(data: any): Promise<any> {
    return apiClient<any>('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async listBatches(): Promise<any[]> {
    return apiClient<any[]>('/inventory/batches');
  },
  async createBatch(data: any): Promise<any> {
    return apiClient<any>('/inventory/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateBatch(id: string, data: any): Promise<any> {
    return apiClient<any>(`/inventory/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteBatch(id: string): Promise<any> {
    return apiClient<any>(`/inventory/batches/${id}`, {
      method: 'DELETE',
    });
  },
  async listCatalog(): Promise<any[]> {
    return apiClient<any[]>('/inventory/catalog');
  },
  async saveProduct(data: any): Promise<any> {
    return apiClient<any>('/inventory/catalog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async deleteProduct(id: string): Promise<any> {
    return apiClient<any>(`/inventory/catalog/${id}`, {
      method: 'DELETE',
    });
  }
};

export const tripService = {
  async list(): Promise<any[]> {
    return apiClient<any[]>('/trips');
  },
  async save(data: any): Promise<any> {
    return apiClient<any>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<any> {
    return apiClient<any>(`/trips/${id}`, {
      method: 'DELETE',
    });
  }
};

export const routeService = {
  async list(): Promise<SavedRoute[]> {
    return apiClient<SavedRoute[]>('/routes');
  },
  async save(data: SavedRoute): Promise<SavedRoute> {
    return apiClient<SavedRoute>('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiClient<void>(`/routes/${id}`, {
      method: 'DELETE',
    });
  }
};

export const recurringTripService = {
  async list(): Promise<RecurringTrip[]> {
    return apiClient<RecurringTrip[]>('/recurring-trips');
  },
  async save(data: RecurringTrip): Promise<RecurringTrip> {
    return apiClient<RecurringTrip>('/recurring-trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    return apiClient<void>(`/recurring-trips/${id}`, {
      method: 'DELETE',
    });
  }
};

export const mapsService = {
  async autocomplete(input: string): Promise<any> {
    return apiClient<any>(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`);
  },
  async calculateDistance(origin: string, destination: string): Promise<any> {
    return apiClient<any>(`/api/maps/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  }
};

export const promoService = {
  async validate(code: string): Promise<any> {
    return apiClient<any>(`/promo/validate/${code}`);
  },
  async apply(code: string): Promise<{ success: boolean; user: User; expiresAt: Date }> {
    return apiClient<{ success: boolean; user: User; expiresAt: Date }>('/promo/apply', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
};

export const aiService = {
  /**
   * Proxy a Gemini generateContent request through the server (the API key stays server-side).
   * `metric` selects which usage bucket to meter against ('receiptScans' | 'aiInsights').
   * Returns the model's text output.
   */
  async generate(payload: { model: string; contents: any; config?: any; metric?: 'receiptScans' | 'aiInsights' }): Promise<string> {
    const res = await apiClient<{ text: string }>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.text ?? '';
  },
  /** Mint a short-lived ephemeral token for a live voice session. */
  async liveToken(): Promise<{ token: string; expireTime: string }> {
    return apiClient<{ token: string; expireTime: string }>('/api/ai/live-token', { method: 'POST' });
  },
};

export const apiService = {
    auth: authService,
    transactions: transactionService,
    voice: voiceService,
    receipts: receiptService,
    inventory: inventoryService,
    trips: tripService,
    routes: routeService,
    recurringTrips: recurringTripService,
    maps: mapsService,
    promo: promoService,
    ai: aiService
};
