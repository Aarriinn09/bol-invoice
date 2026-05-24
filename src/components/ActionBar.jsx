import React, { useState } from "react";
import {
  Download,
  MessageCircle,
  Copy,
  Check,
  PlusCircle,
  Save,
  Loader,
} from "lucide-react";
import { generateInvoicePDF, generateInvoiceBlob } from "../utils/pdfGenerator";
import { invoicesAPI } from "../api/client";
import SendInvoicePanel from "./SendInvoicePanel";

export default function ActionBar({
  result,
  settings,
  invoiceNumber,
  date,
  onNewOrder,
  onSave,
  saving,
  savedInvoiceId,
}) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  if (!result || result.items.length === 0) return null;

  const { items, subtotal } = result;
  const gst = parseFloat(((subtotal * settings.gstRate) / 100).toFixed(2));
  const total = parseFloat((subtotal + gst).toFixed(2));

  function handleDownload() {
    generateInvoicePDF({
      items,
      subtotal,
      invoiceNumber,
      date,
      shopName: settings.shopName || "My Shop",
      buyerName: settings.buyerName || "Customer",
      gstRate: settings.gstRate,
    });
  }

  async function handleWhatsApp() {
    setSharing(true);
    setShareMsg("");

    try {
      // Step 1 — generate PDF as blob
      const blob = generateInvoiceBlob({
        items,
        subtotal,
        invoiceNumber,
        date,
        shopName: settings.shopName || "My Shop",
        buyerName: settings.buyerName || "Customer",
        gstRate: settings.gstRate,
      });

      // Step 2 — upload to backend, get public URL
      const { url } = await invoicesAPI.uploadPDF(blob, invoiceNumber);

      // Step 3 — build WhatsApp message with PDF link
      const shopName = settings.shopName || "BOL Invoice";
      const buyer = settings.buyerName || "Customer";
      const itemLines = items
        .map(
          (i, idx) =>
            `${idx + 1}. ${i.name}  x${i.qty}  Rs.${i.total.toFixed(2)}`,
        )
        .join("\n");

      const totalLine =
        settings.gstRate > 0
          ? [
              `Subtotal  :  Rs.${subtotal.toFixed(2)}`,
              `GST (${settings.gstRate}%)  :  Rs.${gst.toFixed(2)}`,
              `──────────────────`,
              `TOTAL     :  Rs.${total.toFixed(2)}`,
            ].join("\n")
          : `TOTAL  :  Rs.${total.toFixed(2)}`;

      const msg = [
        `*${shopName}*`,
        `─────────────────────`,
        `Invoice  : ${invoiceNumber}`,
        `Date     : ${date}`,
        `Customer : ${buyer}`,
        `─────────────────────`,
        `*ITEMS*`,
        itemLines,
        `─────────────────────`,
        totalLine,
        `─────────────────────`,
        `*View Invoice PDF:*`,
        url,
        ``,
        `_Sent via BOL Invoice_`,
      ].join("\n");

      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (e) {
      console.error(e);
      setShareMsg("Could not generate PDF link. Try again.");
    } finally {
      setSharing(false);
    }
  }

  function buildText() {
    const lines = [
      `*${settings.shopName || "BOL Invoice"}*`,
      `Invoice: ${invoiceNumber}`,
      `Date: ${date}`,
      "",
      ...items.map((i) => `• ${i.name} x${i.qty} = Rs.${i.total.toFixed(2)}`),
      "",
      ...(settings.gstRate > 0
        ? [`GST (${settings.gstRate}%): Rs.${gst.toFixed(2)}`]
        : []),
      `*Total: Rs.${total.toFixed(2)}*`,
      "",
      "_Sent via BOL Invoice_",
    ];
    return lines.join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const btn = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-head)",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    border: "none",
    transition: "all 0.18s",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        animation: "fadeUp 0.4s ease both",
      }}
    >
      {/* Row 1 — main actions */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleDownload}
          style={{
            ...btn,
            flex: 1,
            background: "var(--accent)",
            color: "#0a0a0a",
          }}
        >
          <Download size={15} /> Download PDF
        </button>

        <button
          onClick={handleWhatsApp}
          disabled={sharing}
          style={{
            ...btn,
            background: "rgba(37,211,102,0.1)",
            color: "#25D366",
            border: "1px solid rgba(37,211,102,0.25)",
            cursor: sharing ? "not-allowed" : "pointer",
            opacity: sharing ? 0.7 : 1,
          }}
        >
          {sharing ? (
            <Loader
              size={15}
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <MessageCircle size={15} />
          )}
          {sharing ? "Uploading..." : "WhatsApp PDF"}
        </button>

        <button
          onClick={handleCopy}
          style={{
            ...btn,
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            color: copied ? "var(--success)" : "var(--muted)",
            padding: "12px 16px",
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>

      {/* Share error */}
      {shareMsg && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--danger)",
            textAlign: "center",
          }}
        >
          {shareMsg}
        </p>
      )}

      {/* Row 2 — save */}
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          ...btn,
          width: "100%",
          justifyContent: "center",
          background: saving ? "var(--bg3)" : "rgba(74,222,128,0.1)",
          border: "1px solid rgba(74,222,128,0.25)",
          color: saving ? "var(--muted)" : "var(--success)",
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        <Save size={14} />
        {saving ? "Saving..." : "Save Invoice"}
      </button>

      {/* Send to customer — only shown after invoice is saved */}
      <SendInvoicePanel
        invoiceId={savedInvoiceId}
        invoiceNumber={invoiceNumber}
        invoiceData={{
          items,
          total,
          shopName: settings.shopName || "BOL Invoice",
        }}
      />

      {/* Row 3 — new order */}
      <button
        onClick={onNewOrder}
        style={{
          ...btn,
          width: "100%",
          justifyContent: "center",
          background: "none",
          border: "1px dashed var(--border2)",
          color: "var(--muted)",
          fontSize: "13px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border2)";
          e.currentTarget.style.color = "var(--muted)";
        }}
      >
        <PlusCircle size={14} /> Start New Order
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
