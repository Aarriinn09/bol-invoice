const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Vendor request (uses bol_token) ──────────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem("bol_token");

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

// ── Customer request (uses bol_customer_token) ────────────────────────────────
async function customerRequest(path, options = {}) {
  const token = localStorage.getItem("bol_customer_token");

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

// ── Auth (vendor) ─────────────────────────────────────────────────────────────
export const authAPI = {
  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => request("/auth/me"),
  updateProfile: (body) =>
    request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// ── Customer auth ─────────────────────────────────────────────────────────────
export const customerAPI = {
  register: (body) =>
    customerRequest("/customers/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    customerRequest("/customers/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => customerRequest("/customers/me"),
  getInvoices: () => customerRequest("/customers/invoices"),
  getAnalytics: (period = "month") =>
    customerRequest(`/customers/analytics?period=${period}`),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: () => request("/products/"),
  add: (body) =>
    request("/products/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

// ── Invoices ──────────────────────────────────────────────────────────────────
export const invoicesAPI = {
  save: (body) =>
    request("/invoices/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    request(`/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getAll: () => request("/invoices/"),
  getOne: (id) => request(`/invoices/${id}`),
  getAnalytics: (period = "month") =>
    request(`/invoices/analytics/summary?period=${period}`),
  updateStatus: (id, status) =>
    request(`/invoices/${id}/status?status=${status}`, { method: "PATCH" }),
  sendToCustomer: (invoiceId, phone) =>
    request(`/invoices/${invoiceId}/send?phone=${encodeURIComponent(phone)}`, {
      method: "POST",
    }),
  getPublic: (invoiceNumber) =>
    fetch(`${BASE}/invoices/public/${invoiceNumber}`).then((r) => r.json()),
  getInsights: () => request("/invoices/analytics/insights"),
  getCreditAnalysis: () => request("/invoices/analytics/credit"),
  // Add inside invoicesAPI
  lookupGST: (items) =>
    request("/invoices/gst/lookup", {
      method: "POST",
      body: JSON.stringify({ items }), // ← wrap in object
    }),

  getGSTSummary: (period = "month") =>
    request(`/invoices/analytics/gst-summary?period=${period}`),

  downloadGSTR1: (period = "month") =>
    `${BASE}/invoices/analytics/gstr1-export?period=${period}`,
  uploadPDF: async (pdfBlob, invoiceNumber) => {
    const token = localStorage.getItem("bol_token");
    const formData = new FormData();
    formData.append("file", pdfBlob, `${invoiceNumber}.pdf`);
    formData.append("invoice_number", invoiceNumber);

    const res = await fetch(`${BASE}/invoices/upload-pdf`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Upload failed");
    return data;
  },

  generatePublicLink: (invoiceNumber) => {
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
    return `${frontendUrl}/#invoice/${invoiceNumber}`;
  },
};

// ── Voice ─────────────────────────────────────────────────────────────────────
export const voiceAPI = {
  transcribe: async (audioBlob) => {
    const token = localStorage.getItem("bol_token");
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const res = await fetch(`${BASE}/transcribe`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Transcription failed");
    return data;
  },
};
