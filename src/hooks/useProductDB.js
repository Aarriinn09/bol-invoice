import { useState, useEffect } from "react";
import { productsAPI } from "../api/client";

export function useProductDB(sessionKey = 0) {
  const [customProducts, setCustomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Clear immediately when session changes
    setCustomProducts([]);
    setError("");

    const token = localStorage.getItem("bol_token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    productsAPI
      .getAll()
      .then((data) => {
        const normalized = data.map((p) => ({
          id: p.id,
          name: p.name,
          aliases: p.aliases || [],
          category: p.category,
          defaultPrice: parseFloat(p.default_price) || 0,
          custom: true,
        }));
        setCustomProducts(normalized);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load products:", e);
        setError(e.message);
        setLoading(false);
      });
  }, [sessionKey]); // ← re-runs when session changes

  async function addProduct(product) {
    if (!product.name?.trim()) {
      return { success: false, error: "Product name is required" };
    }

    try {
      const created = await productsAPI.add({
        name: product.name.trim(),
        default_price: parseFloat(product.defaultPrice) || 0,
        category: product.category || "custom",
        aliases: product.aliases || [],
      });

      const normalized = {
        id: created.id,
        name: created.name,
        aliases: created.aliases || [],
        category: created.category,
        defaultPrice: parseFloat(created.default_price) || 0,
        custom: true,
      };

      setCustomProducts((prev) => [normalized, ...prev]);
      return { success: true, product: normalized };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function removeProduct(id) {
    try {
      await productsAPI.delete(id);
      setCustomProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  }

  return { customProducts, loading, error, addProduct, removeProduct };
}
