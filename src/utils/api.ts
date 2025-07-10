const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      return { data };
    } else {
      return { error: data.error || 'Request failed' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function apiPost<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    
    if (response.ok) {
      return { data, message: data.message };
    } else {
      return { error: data.error || 'Request failed' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function apiPut<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    
    if (response.ok) {
      return { data, message: data.message };
    } else {
      return { error: data.error || 'Request failed' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    
    if (response.ok) {
      return { data, message: data.message };
    } else {
      return { error: data.error || 'Request failed' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
} 