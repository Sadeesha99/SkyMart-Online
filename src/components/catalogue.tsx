"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  Bike,
  Cpu,
  Disc3,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  PackageCheck,
  MessageCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useStore } from "./store-provider";
import {
  type Product,
  type Category,
  categoryPath,
  descendants,
  money,
  productImage,
} from "@/lib/domain";
export function CategoryIcon({
  kind,
  size = 24,
}: {
  kind: string;
  size?: number;
}) {
  return kind === "battery" ? (
    <BatteryCharging size={size} />
  ) : kind === "mobility" ? (
    <Bike size={size} />
  ) : kind === "parts" ? (
    <Disc3 size={size} />
  ) : (
    <Cpu size={size} />
  );
}
export function StockBadge({ stock }: { stock: number }) {
  return (
    <span
      className={
        "stock-badge " + (stock === 0 ? "out" : stock < 5 ? "low" : "")
      }
    >
      <i />
      {stock === 0
        ? "Enquire for availability"
        : stock < 5
          ? "Limited stock"
          : "In stock"}
    </span>
  );
}
export function ProductCard({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  return (
    <Link className="product-card" href={"/products/" + product.id}>
      <div className="product-art">
        <span className="product-tag">
          {categoryPath(categories, product.categoryId)[0]?.name}
        </span>
        <img src={productImage(product, categories)} alt={product.name} />
        <span className="product-arrow">
          <ArrowUpRight size={19} />
        </span>
      </div>
      <div className="product-info">
        <StockBadge stock={product.stock} />
        <h3>{product.name}</h3>
        <p>{Object.values(product.specs).slice(0, 2).join(" · ")}</p>
        <strong>
          {product.price === null ? "Request a quote" : money(product.price)}
        </strong>
        {!product.image && <small>Illustrative category image</small>}
      </div>
    </Link>
  );
}
export function Home() {
  const { store } = useStore();
  return (
    <>
      <main className="home-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <i className="blue-dot" /> THE EVERYDAY, UPGRADED
            </span>
            <h1>
              Great products.
              <br />
              More <span>possibilities.</span>
            </h1>
            <p>
              Discover electronics, dependable batteries, vehicle essentials and
              a smarter way to move. All in one place.
            </p>
            <div className="hero-actions">
              <Link href="/products" className="button primary">
                Explore products <ArrowRight size={17} />
              </Link>
              <Link href="/about" className="text-link">
                Meet SkyMart <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="mini-line" />
              Thoughtfully sourced. Simply SkyMart.
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="vertical-label">MOVE DIFFERENTLY</span>
            <span className="hero-chip">
              <Zap size={14} /> A little electric. A lot of freedom.
            </span>
            <img
              src="/images/bike.svg"
              alt="Illustration of the Urban Glide electric bicycle"
            />
            <div className="hero-feature">
              <div>
                <span>ELECTRIC MOBILITY</span>
                <strong>
                  Your next chapter.
                  <br />
                  On two wheels.
                </strong>
              </div>
              <Link
                href="/products/urban-glide"
                aria-label="Explore Urban Glide electric bike"
              >
                <ArrowUpRight size={25} />
              </Link>
            </div>
            <span className="image-caption">
              Concept illustration · Sample product
            </span>
          </div>
        </section>
        <section className="benefits">
          <div>
            <PackageCheck />
            <span>
              <strong>Carefully selected</strong>
              <small>Products with a purpose</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <strong>Find the right fit</strong>
              <small>Specifications made simple</small>
            </span>
          </div>
          <div>
            <MessageCircle />
            <span>
              <strong>A team you can talk to</strong>
              <small>Real help, before you choose</small>
            </span>
          </div>
        </section>
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR EVERYDAY ESSENTIALS</span>
              <h2>A world of possibilities.</h2>
            </div>
            <Link href="/products" className="text-link">
              All categories <ArrowRight size={17} />
            </Link>
          </div>
          <div className="category-grid">
            {store.categories
              .filter((c) => !c.parentId)
              .map((c, i) => (
                <Link
                  href={"/products?category=" + c.id}
                  className={"category-tile category-" + i}
                  key={c.id}
                >
                  <CategoryIcon kind={c.icon} size={30} />
                  <div>
                    <h3>{c.name}</h3>
                    <span>
                      {
                        store.products.filter(
                          (p) =>
                            p.published &&
                            descendants(store.categories, c.id).has(
                              p.categoryId,
                            ),
                        ).length
                      }{" "}
                      products to explore
                    </span>
                  </div>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
          </div>
        </section>
        <section className="section featured-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WORTH A CLOSER LOOK</span>
              <h2>Meet your next upgrade.</h2>
            </div>
            <Link href="/products" className="text-link">
              View all products <ArrowRight size={17} />
            </Link>
          </div>
          <div className="product-grid">
            {store.products
              .filter((p) => p.published && p.featured)
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
        <section className="help-banner">
          <div>
            <span className="eyebrow">A LITTLE GUIDANCE GOES A LONG WAY</span>
            <h2>Not sure where to start?</h2>
            <p>Tell us what you need. We’ll help you find the right product.</p>
          </div>
          <Link className="button light" href="/contact">
            Let’s talk <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
    </>
  );
}
export function Catalogue({
  initialCategory = "",
}: {
  initialCategory?: string;
}) {
  const { store } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState("featured");
  const selected = category ? descendants(store.categories, category) : null;
  const products = store.products
    .filter(
      (p) =>
        p.published &&
        (!selected || selected.has(p.categoryId)) &&
        (!available || p.stock > 0) &&
        `${p.name} ${p.sku} ${p.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price-low"
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : sort === "price-high"
          ? (b.price ?? -1) - (a.price ?? -1)
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : Number(b.featured) - Number(a.featured),
    );
  return (
    <main className="page-main">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        Our catalogue
      </div>
      <div className="page-title">
        <span className="eyebrow">FIND SOMETHING THAT FITS</span>
        <h1>Explore the possibilities.</h1>
        <p>Good products. Clear details. A little help whenever you need it.</p>
      </div>
      <div className="catalogue-layout">
        <aside className="filters">
          <h3>
            <SlidersHorizontal size={18} /> Categories
          </h3>
          <button
            className={!category ? "selected" : ""}
            onClick={() => setCategory("")}
          >
            All products{" "}
            <span>{store.products.filter((p) => p.published).length}</span>
          </button>
          {store.categories.map((c) => (
            <button
              style={{
                paddingLeft:
                  14 + (categoryPath(store.categories, c.id).length - 1) * 14,
              }}
              key={c.id}
              className={category === c.id ? "selected" : ""}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
          <div className="filter-divider" />
          <label className="check">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />{" "}
            In stock only
          </label>
          <div className="filter-help">
            <MessageCircle size={24} />
            <h4>Looking for something?</h4>
            <p>We’re here to help you find it.</p>
            <Link href="/contact">
              Ask our team <ArrowUpRight size={15} />
            </Link>
          </div>
        </aside>
        <section>
          <div className="catalogue-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label="Search products"
                placeholder="Search products, keywords or SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
          <div className="results-count">
            {products.length} products <span>Sample catalogue · LKR</span>
          </div>
          <div className="product-grid catalogue-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categories={store.categories}
              />
            ))}
          </div>
          {!products.length && (
            <div className="empty">
              <Search size={32} />
              <h3>No products found</h3>
              <p>Try another keyword or choose a broader category.</p>
              <button
                className="button secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("");
                  setAvailable(false);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
