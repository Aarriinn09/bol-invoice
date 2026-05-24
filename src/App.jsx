import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import GSTDashboard from "./pages/GSTDashboard";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import CustomerRegisterPage from "./pages/CustomerRegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import PublicInvoicePage from "./pages/PublicInvoicePage";
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import InputPanel from "./components/InputPanel";
import InvoiceSettings from "./components/InvoiceSettings";
import InvoicePreview from "./components/InvoicePreview";
import ActionBar from "./components/ActionBar";
import ProductManager from "./components/ProductManager";
import OnboardingWizard from "./components/OnboardingWizard";
import EmptyState from "./components/EmptyState";
import { parseInvoiceText } from "./utils/parser";
import { matchAllItems } from "./utils/fuzzyMatcher";
import { convertDevanagari } from "./utils/devanagari";
import { useProductDB } from "./hooks/useProductDB";
import { invoicesAPI, customerAPI } from "./api/client";
import { generateInvoiceNumber, formatDate } from "./utils/helpers";
import {
  AlignEndVerticalIcon,
  AlignVerticalJustifyStartIcon,
  ArrowBigDown,
  Frown,
} from "lucide-react";

const ONBOARDING_KEY = "bol_onboarding_done";

function freshMeta() {
  return { number: generateInvoiceNumber(), date: formatDate() };
}

export default function App() {
  const { vendor, loading, sessionKey } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [page, setPage] = useState("main");
  const [meta, setMeta] = useState(freshMeta());
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [appLoading, setAppLoading] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [customerPage, setCustomerPage] = useState("login");
  const [customer, setCustomer] = useState(null);
  const [hash, setHash] = useState(window.location.hash);
  const [settings, setSettings] = useState({
    shopName: "",
    buyerName: "",
    gstRate: 0,
  });

  const {
    customProducts,
    loading: productsLoading,
    addProduct,
    removeProduct,
  } = useProductDB(sessionKey);

  const customProductsRef = useRef(customProducts);
  useEffect(() => {
    customProductsRef.current = customProducts;
  }, [customProducts]);

  // ── On vendor change ───────────────────────────────────────────────────────
  useEffect(() => {
    if (vendor) {
      setSettings((s) => ({ ...s, shopName: vendor.shop_name }));

      const doneKey = `${ONBOARDING_KEY}_${vendor.email}`;

      if (!localStorage.getItem(doneKey)) {
        // Only show onboarding if account created in last 10 minutes
        // This prevents showing onboarding on existing accounts
        // that just haven't had the key set yet
        const createdAt = new Date(vendor.created_at);
        const now = new Date();
        const minsAgo = (now - createdAt) / 1000 / 60;

        if (minsAgo < 10) {
          setShowOnboarding(true);
        } else {
          // Old account — mark as done silently
          localStorage.setItem(doneKey, "true");
          setShowOnboarding(false);
        }
      } else {
        setShowOnboarding(false);
      }
    }
  }, [vendor, sessionKey]);

  // ── On session change — reset invoice state ────────────────────────────────
  useEffect(() => {
    setResult(null);
    setMeta(freshMeta());
    setSaveMsg("");
    setSavedInvoiceId(null);
    setPage("main");
    setSettings((s) => ({ ...s, buyerName: "", gstRate: 0 }));
  }, [sessionKey]);

  // ── Hash routing ───────────────────────────────────────────────────────────
  useEffect(() => {
    function onHashChange() {
      const newHash = window.location.hash;
      setHash(newHash);
      if (newHash.startsWith("#invoice/")) {
        setCustomer(null);
      }
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ── Load customer from token ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("bol_customer_token");
    if (!token) return;
    customerAPI
      .me()
      .then((c) => setCustomer(c))
      .catch(() => localStorage.removeItem("bol_customer_token"));
  }, [hash]);

  // ── Global loading screen ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontSize: "32px",
            fontWeight: 800,
            color: "var(--accent)",
          }}
        >
          BOL
        </span>
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid var(--border)",
            borderTop: "2px solid var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  // ── Public invoice page ────────────────────────────────────────────────────
  if (hash.startsWith("#invoice/")) {
    const invoiceNumber = hash.replace("#invoice/", "");
    return (
      <PublicInvoicePage
        invoiceNumber={invoiceNumber}
        onCreateAccount={() => {
          setCustomer(null);
          localStorage.removeItem("bol_customer_token");
          setCustomerPage("register");
          window.location.hash = "#customer";
        }}
      />
    );
  }

  // ── Customer portal ────────────────────────────────────────────────────────
  if (hash === "#customer" || hash.startsWith("#customer")) {
    if (customer) {
      return (
        <CustomerDashboard
          customer={customer}
          onLogout={() => {
            localStorage.removeItem("bol_customer_token");
            setCustomer(null);
            window.location.hash = "";
          }}
        />
      );
    }
    if (customerPage === "register") {
      return (
        <CustomerRegisterPage
          onSuccess={(c) => setCustomer(c)}
          onGoLogin={() => setCustomerPage("login")}
        />
      );
    }
    return (
      <CustomerLoginPage
        onSuccess={(c) => setCustomer(c)}
        onGoRegister={() => setCustomerPage("register")}
      />
    );
  }

  // ── Vendor auth ────────────────────────────────────────────────────────────
  if (!vendor) {
    if (page === "register") {
      return (
        <RegisterPage
          onSuccess={() => setPage("main")}
          onGoLogin={() => setPage("login")}
        />
      );
    }
    return (
      <LoginPage
        onSuccess={() => setPage("main")}
        onGoRegister={() => setPage("register")}
      />
    );
  }

  // ── Onboarding — only for new vendors ─────────────────────────────────────
  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => {
          localStorage.setItem(`${ONBOARDING_KEY}_${vendor.email}`, "true");
          setShowOnboarding(false);
        }}
      />
    );
  }

  // ── Core invoice functions ─────────────────────────────────────────────────
  function appendItems(rawText) {
    const cleaned = convertDevanagari(rawText);
    const parsed = parseInvoiceText(cleaned);
    if (parsed.items.length === 0) return;

    const matched = matchAllItems(parsed.items, customProductsRef.current);
    setResult((prev) => {
      const existing = prev?.items || [];
      const merged = [...existing, ...matched];
      const subtotal = parseFloat(
        merged.reduce((s, i) => s + i.total, 0).toFixed(2),
      );
      return {
        items: merged,
        subtotal,
        errors: [...(prev?.errors || []), ...parsed.errors],
      };
    });
    setTimeout(() => {
      document
        .getElementById("preview")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  function handleTypedParse(text) {
    setAppLoading(true);
    setTimeout(() => {
      appendItems(text);
      setAppLoading(false);
    }, 200);
  }

  function handleVoiceAdd(text) {
    appendItems(text);
  }

  function handleNewOrder() {
    setResult(null);
    setMeta(freshMeta());
    setSaveMsg("");
    setSavedInvoiceId(null);
    setSettings((s) => ({ ...s, buyerName: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSaveInvoice() {
    if (!result || result.items.length === 0) return;
    setSaving(true);
    setSaveMsg("");

    const gstAmount = parseFloat(
      ((result.subtotal * settings.gstRate) / 100).toFixed(2),
    );
    const total = parseFloat((result.subtotal + gstAmount).toFixed(2));

    const payload = {
      invoice_number: meta.number,
      buyer_name: settings.buyerName || "Customer",
      buyer_phone: null,
      items: result.items.map((i) => ({
        product_name: i.name,
        qty: i.qty,
        unit: i.unit || null,
        price: i.price,
        total: i.total,
      })),
      subtotal: result.subtotal,
      gst_rate: settings.gstRate,
      gst_amount: gstAmount,
      total,
    };

    try {
      let saved;
      if (savedInvoiceId) {
        saved = await invoicesAPI.update(savedInvoiceId, payload);
        setSaveMsg("Invoice updated!");
      } else {
        saved = await invoicesAPI.save(payload);
        setSavedInvoiceId(saved.id);
        setSaveMsg("Invoice saved!");
      }
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── All vendor pages share ONE Layout ──────────────────────────────────────
  // Layout renders nav + wraps children
  // Page content switches via `page` state
  return (
    <Layout
      page={page}
      onNavigate={(newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      hasActiveOrder={!!(result?.items?.length > 0)}
      vendor={vendor}
    >
      {/* ── History page ── */}
      {page === "history" && <HistoryPage />}

      {/* ── Analytics page ── */}
      {page === "analytics" && <AnalyticsPage vendor={vendor} />}

      {/* ── GST page ── */}
      {page === "gst" && <GSTDashboard vendor={vendor} />}

      {/* ── Main invoice page ── */}
      {page === "main" && (
        <>
          {/* Hero only when no invoice in progress */}
          {!result && <Hero />}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <InputPanel
              onParse={handleTypedParse}
              onVoiceAdd={handleVoiceAdd}
              loading={appLoading}
            />
            <InvoiceSettings settings={settings} onChange={setSettings} />
            <ProductManager
              customProducts={customProducts}
              loading={productsLoading}
              onAdd={addProduct}
              onRemove={removeProduct}
            />
          </div>

          {result && result.items.length > 0 && (
            <div
              id="preview"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <InvoicePreview
                result={result}
                settings={settings}
                invoiceNumber={meta.number}
                date={meta.date}
                onUpdate={setResult}
                vendor={vendor}
              />

              {saveMsg && (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: saveMsg.startsWith("Error")
                      ? "var(--danger)"
                      : "var(--success)",
                    textAlign: "center",
                    animation: "fadeIn 0.2s ease both",
                  }}
                >
                  {saveMsg}
                </p>
              )}

              <ActionBar
                result={result}
                settings={settings}
                invoiceNumber={meta.number}
                date={meta.date}
                onNewOrder={handleNewOrder}
                onSave={handleSaveInvoice}
                saving={saving}
                savedInvoiceId={savedInvoiceId}
              />
            </div>
          )}

          {result && result.items.length === 0 && (
            <EmptyState
              illustration="invoice"
              title="Nothing parsed"
              description='Could not read any items. Try: "lays 10, pepsi 20"'
            />
          )}
        </>
      )}
    </Layout>
  );
}
