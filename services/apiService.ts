
import { Transaction, FilterState, User, SavedRoute, RecurringTrip } from '../types';

const API_BASE_URL = ''; // Use relative paths since we are on the same origin
const TOKEN_KEY = 'auth_token';

// --- Types ---

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[];
}

// --- Helper Utilities ---

class ServiceError extends Error {
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

/**
 * Generic API Client wrapper
 */
async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type to JSON unless we are sending FormData (file uploads)
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      // Optional: Dispatch a global event or redirect to login
      window.location.href = '/login'; 
      throw new ServiceError(401, "Session expired. Please login again.");
    }

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred';
      
      if (responseData && responseData.detail) {
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          // Handle FastAPI validation errors
          errorMessage = responseData.detail.map((err: any) => err.msg).join(', ');
        }
      }
      
      throw new ServiceError(response.status, errorMessage, responseData);
    }

    return parseDateFields(responseData) as T;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    // Network errors
    throw new ServiceError(500, error instanceof Error ? error.message : 'Network error');
  }
}

// --- Service Modules ---

export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    return apiClient<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    // FastAPI OAuth2PasswordRequestForm usually expects form-data, 
    // but we'll use JSON for this service layer implementation unless strict OAuth2 compliance is needed.
    const response = await apiClient<AuthResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ username, password }), // Mapping email to username
    });
    
    if (response.access_token) {
      localStorage.setItem(TOKEN_KEY, response.access_token);
    }
    return response;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
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
