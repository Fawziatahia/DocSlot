const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const TOKEN_KEY = "docslot_token";
const USER_KEY = "docslot_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(partialUser) {
  const user = getUser();
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...partialUser }));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function hasRole(...roles) {
  const user = getUser();
  return Boolean(user && roles.includes(user.role));
}

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function apiFetch(path, { method = "GET", body, params } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  // FormData carries its own multipart boundary, so the browser must set
  // Content-Type itself — setting it here would corrupt the upload.
  const isFormData = body instanceof FormData;

  const headers = {
    Accept: "application/json",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const response = await fetch(url, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    throw new ApiError(data?.message || "Something went wrong.", response.status, data?.errors);
  }

  return data;
}

/**
 * POSTs to a server-sent-events endpoint (the symptom tracker's AI answer,
 * generated token-by-token) and invokes onEvent(eventName, payload) for each
 * `data:` chunk as it streams in.
 */
export async function apiStream(path, body, onEvent) {
  const headers = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) clearSession();
    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : null;
    throw new ApiError(data?.message || "Something went wrong.", response.status, data?.errors);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let eventEnd;
    while ((eventEnd = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, eventEnd);
      buffer = buffer.slice(eventEnd + 2);

      let eventName = "message";
      const dataLines = [];
      for (const line of rawEvent.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) continue;

      try {
        onEvent(eventName, JSON.parse(dataLines.join("")));
      } catch {
        // Malformed chunk — skip it rather than breaking the whole stream.
      }
    }
  }
}

/**
 * Fetch a private file (medical-record attachments) as a Blob. A plain <a href>
 * can't be used for these because the download route needs the bearer token.
 */
export async function apiBlob(path) {
  const headers = { Accept: "*/*" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError("Couldn't load the attachment.", response.status);
  }

  return response.blob();
}

export const api = {
  get: (path, params) => apiFetch(path, { method: "GET", params }),
  post: (path, body) => apiFetch(path, { method: "POST", body }),
  put: (path, body) => apiFetch(path, { method: "PUT", body }),
  patch: (path, body) => apiFetch(path, { method: "PATCH", body }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
  blob: apiBlob,
  stream: apiStream,
};
