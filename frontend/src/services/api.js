import { API_BASE_URL } from '../utils/constants.js';
import { storage } from '../utils/storage.js';

/**
 * Unified fetch wrapper for the DocSlot API.
 *
 * - Prepends API_BASE_URL to all paths
 * - Attaches Bearer token from localStorage when available
 * - Parses the { success, data, message } response envelope
 * - Throws on network errors and non-2xx statuses, unwrapping the API message
 */
export async function api(path, options = {}) {
    const { method = 'GET', body, params, ...custom } = options;

    const url = new URL(`${API_BASE_URL}${path}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, value);
            }
        });
    }

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...custom.headers,
    };

    const token = storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for GET/HEAD requests and remove it for FormData bodies
    if (method === 'GET' || method === 'HEAD') {
        delete headers['Content-Type'];
    }

    if (body && !(body instanceof FormData)) {
        custom.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
        delete headers['Content-Type'];
        custom.body = body;
    }

    let response;
    try {
        response = await fetch(url.toString(), {
            method,
            headers,
            ...custom,
        });
    } catch (error) {
        throw new Error('Network error. Please check your connection and try again.');
    }

    let json = null;
    try {
        json = await response.json();
    } catch {
        // Response wasn't JSON
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}.`);
        }
        return { success: true, data: null, message: 'OK' };
    }

    if (!response.ok) {
        const message = json?.message || `Request failed with status ${response.status}.`;
        const error = new Error(message);
        error.status = response.status;
        error.errors = json?.errors || null;
        error.response = json;
        throw error;
    }

    return json;
}

// Convenience methods
api.get = (path, options) => api(path, { ...options, method: 'GET' });
api.post = (path, body, options) => api(path, { ...options, method: 'POST', body });
api.put = (path, body, options) => api(path, { ...options, method: 'PUT', body });
api.patch = (path, body, options) => api(path, { ...options, method: 'PATCH', body });
api.delete = (path, options) => api(path, { ...options, method: 'DELETE' });
