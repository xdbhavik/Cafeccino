const BASE_URL = "http://localhost:8080";

const getHeaders = () => {
  const token = localStorage.getItem("cafe_admin_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.message || errData.error || errorMsg;
    } catch (e) {
      try {
        const text = await response.text();
        if (text) errorMsg = text;
      } catch (inner) {}
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    return null;
  }
};
