export const BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "https://nupat-ai-clone-production.up.railway.app");

// ─── Fetch helpers ────────────────────────────────────────────

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  // Don't timeout if we are streaming
  const isStream = options.headers?.['Accept'] === 'text/event-stream' || options.isStream;
  
  let timer;
  if (!isStream) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Is the backend server running?");
    }
    const isLocal = url.includes('localhost');
    throw new Error(
      isLocal 
        ? "Cannot reach the local server. Make sure the backend is running on port 3001."
        : `Cannot reach the API at ${new URL(url).hostname}. Please check your connection or backend status.`
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function handleResponse(res) {
  // If it's a stream, don't try to parse as JSON here
  if (res.headers.get('Content-Type')?.includes('text/event-stream')) {
    return res; 
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}). Please try again.`);
    }
    return data;
  }

  if (!res.ok) {
    if (Array.isArray(data.detail)) {
      throw new Error(data.detail.map((e) => e.msg).join(" | "));
    }
    if (typeof data.detail === "string") {
      throw new Error(data.detail);
    }
    throw new Error(`Server error (${res.status}). Please try again.`);
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────

export async function signup(data) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function login(data) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function logout(token) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(res);
}

export async function getCurrentUser(token) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

// ─── Chats ────────────────────────────────────────────────────

export async function createChat(token, title) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  return handleResponse(res);
}

export async function getUserChats(token) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function getChatById(token, chatId) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/chats/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

export async function updateChat(token, chatId, newTitle) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/chats/${chatId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: newTitle }),
  });
  return handleResponse(res);
}

export async function deleteChat(token, chatId) {
  const res = await fetchWithTimeout(`${BASE_URL}/api/v1/chats/${chatId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}

// ─── Messages ─────────────────────────────────────────────────

/**
 * Sends a message and returns the response object.
 * If the response is a stream, the caller should handle it.
 */
export async function sendMessage(token, chatId, content) {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/v1/chats/${chatId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
      isStream: true
    },
    60000
  );
  return handleResponse(res);
}

export async function getMessages(token, chatId) {
  const res = await fetchWithTimeout(
    `${BASE_URL}/api/v1/chats/${chatId}/messages`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return handleResponse(res);
}
