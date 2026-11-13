"use client";
import Link from "next/link";
import { useStore } from "./store-provider";
import { categoryPath, money, productImage } from "@/lib/domain";
import { StockBadge, ProductCard } from "./catalogue";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
export function ProductDetail({ id }: { id: string }) {
  const { store, ready } = useStore();
  const product = store.products.find((p) => p.id === id && p.published);
  if (!product)
    return (
      <main className="page-main empty">
        <h1>{ready ? "Product not found" : "Loading product…"}</h1>
        <Link href="/products">Back to catalogue</Link>
      </main>
    );
  return (
    <main className="page-main">
      <div className="breadcrumb">
        <Link href="/products">Catalogue</Link>
        {categoryPath(store.categories, product.categoryId).map((c) => (
          <span key={c.id}>
            <ChevronRight size={14} />
            <Link href={"/products?category=" + c.id}>{c.name}</Link>
          </span>
        ))}
      </div>
      <section className="detail-layout">
        <div className="detail-art">
          <img
            src={productImage(product, store.categories)}
            alt={product.name}
          />
          <small>
            {product.image
              ? "Sample product illustration"
              : "Illustrative category image"}
          </small>
        </div>
        <div className="detail-copy">
          <StockBadge stock={product.stock} />
          <h1>{product.name}</h1>
          <span className="sku">SKU: {product.sku}</span>
          <div className="detail-price">
            {product.price === null ? "Price on request" : money(product.price)}
          </div>
          <p>{product.description}</p>
          <Link
            className="button primary"
            href={"/contact?product=" + product.id}
          >
            Enquire about this product <ArrowRight size={18} />
          </Link>
          <div className="detail-note">
            <MessageCircle size={18} />
            Confirm price, availability and fitment with our team.
          </div>
          <h3>The details</h3>
          <dl>
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="detail-note">
            <ShieldCheck size={18} />
            Sample specifications for preview purposes.
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>A few more possibilities.</h2>
          <Link href="/products" className="text-link">
            Explore all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {store.products
            .filter((p) => p.published && p.id !== id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categories={store.categories}
              />
            ))}
        </div>
      </section>
    </main>
  );
}
