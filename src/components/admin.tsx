"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  Package,
  Layers3,
  ArrowLeftRight,
  MessagesSquare,
  Plus,
  Search,
  ChevronRight,
  TriangleAlert,
  TrendingUp,
  Pencil,
  X,
  Check,
  PanelLeftClose,
} from "lucide-react";
import { Brand } from "./shell";
import { StockBadge } from "./catalogue";
import { useStore } from "./store-provider";
import {
  type Product,
  type Category,
  categoryPath,
  descendants,
  money,
  moveStock,
  productImage,
  validateParent,
} from "@/lib/domain";
type Tab =
  "Overview" | "Products" | "Categories" | "Stock movements" | "Enquiries";
const tabs = [
  { name: "Overview" as Tab, icon: LayoutDashboard },
  { name: "Products" as Tab, icon: Package },
  { name: "Categories" as Tab, icon: Layers3 },
  { name: "Stock movements" as Tab, icon: ArrowLeftRight },
  { name: "Enquiries" as Tab, icon: MessagesSquare },
];
export function Admin() {
  const { store, update, ready } = useStore();
  const [tab, setTab] = useState<Tab>("Overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"product" | "category" | "stock" | null>(
    null,
  );
  const [editing, setEditing] = useState<Product | Category | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobile, setMobile] = useState(false);
  const low = store.products.filter((p) => p.stock < 5);
  const total = store.products.reduce((n, p) => n + p.stock, 0);
  const fresh = store.enquiries.filter((e) => e.status === "New").length;
  function open(kind: typeof modal, item: Product | Category | null = null) {
    setError("");
    setEditing(item);
    setModal(kind);
  }
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (k: string) => String(data.get(k) || "").trim();
    try {
      if (modal === "product") {
        const previous = editing as Product | null;
        const id = previous?.id || crypto.randomUUID();
        const sku = text("sku");
        if (
          store.products.some(
            (p) => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== id,
          )
        )
          throw new Error("This SKU already exists. Choose a unique SKU.");
        const price = text("price") ? Number(text("price")) : null;
        if (price !== null && (!Number.isFinite(price) || price < 0))
          throw new Error("Enter a valid price.");
        const image = text("image");
        if (
          image &&
          !image.startsWith("/images/") &&
          !/^https:\/\//.test(image)
        )
          throw new Error("Use an HTTPS image URL or a local /images/ path.");
        const specs: Record<string, string> = {};
        for (const line of text("specs").split("\n").filter(Boolean)) {
          const split = line.indexOf(":");
          if (split < 1)
            throw new Error("Use one specification per line: Name: Value");
          specs[line.slice(0, split).trim()] = line.slice(split + 1).trim();
        }
        const product: Product = {
          id,
          name: text("name"),
          sku,
          categoryId: text("category"),
          price,
          stock: previous?.stock || 0,
          image,
          description: text("description"),
          specs,
          featured: data.get("featured") === "on",
          published: data.get("published") === "on",
        };
        update((s) => ({
          ...s,
          products: previous
            ? s.products.map((p) => (p.id === id ? product : p))
            : [...s.products, product],
        }));
        setNotice(
          previous
            ? "Product updated."
            : "Product created. Record a stock receipt to add inventory.",
        );
      } else if (modal === "category") {
        const previous = editing as Category | null;
        const id = previous?.id || crypto.randomUUID();
        const parentId = text("parent") || null;
        validateParent(store.categories, id, parentId);
        if (
          store.categories.some(
            (c) =>
              c.id !== id &&
              c.parentId === parentId &&
              c.name.toLowerCase() === text("name").toLowerCase(),
          )
        )
          throw new Error(
            "A category with this name already exists under this parent.",
          );
        const image = text("image");
        if (
          image &&
          !image.startsWith("/images/") &&
          !/^https:\/\//.test(image)
        )
          throw new Error("Use an HTTPS image URL or a local /images/ path.");
        const category: Category = {
          id,
          name: text("name"),
          parentId,
          image,
          icon: previous?.icon || "electronics",
        };
        update((s) => ({
          ...s,
          categories: previous
            ? s.categories.map((c) => (c.id === id ? category : c))
            : [...s.categories, category],
        }));
        setNotice("Category saved.");
      } else if (modal === "stock") {
        const quantity = Number(text("quantity"));
        const reason = text("reason");
        const delta = ["Offline sale", "Damaged goods"].includes(reason)
          ? -quantity
          : quantity;
        update((s) =>
          moveStock(
            s,
            text("product"),
            delta,
            reason,
            text("reference"),
            crypto.randomUUID(),
          ),
        );
        setNotice("Stock updated. Movement added to the history.");
      }
      setModal(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save. Please try again.",
      );
    }
  }
  const matched = store.products.filter((p) =>
    `${p.name} ${p.sku}`.toLowerCase().includes(query.toLowerCase()),
  );
  function productTable(list: Product[], compact = false) {
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>{compact ? "Status" : "Price"}</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="table-product">
                    <img src={productImage(p, store.categories)} alt="" />
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {
                          store.categories.find((c) => c.id === p.categoryId)
                            ?.name
                        }
                        {!p.published ? " · Draft" : ""}
                      </small>
                    </div>
                  </div>
                </td>
                <td className="sku">{p.sku}</td>
                <td>
                  <strong>{p.stock}</strong>{" "}
                  <span className="muted">units</span>
                </td>
                <td>
                  {compact ? (
                    <StockBadge stock={p.stock} />
                  ) : p.price === null ? (
                    "On request"
                  ) : (
                    money(p.price)
                  )}
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={"Edit " + p.name}
                    onClick={() => open("product", p)}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && (
          <div className="empty">No products match your search.</div>
        )}
      </div>
    );
  }
  const activeProduct =
    modal === "product" ? (editing as Product | null) : null;
  const activeCategory =
    modal === "category" ? (editing as Category | null) : null;
  return (
    <div className="admin-shell">
      <aside className={"admin-sidebar " + (mobile ? "visible" : "")}>
        <Brand />
        <div className="workspace-label">
          WORKSPACE <span>DEMO</span>
        </div>
        <nav aria-label="Staff navigation">
          {tabs.map((t) => (
            <button
              key={t.name}
              className={tab === t.name ? "active" : ""}
              onClick={() => {
                setTab(t.name);
                setMobile(false);
                setQuery("");
              }}
            >
              <t.icon size={19} />
              {t.name}
              {t.name === "Enquiries" && fresh > 0 && <b>{fresh}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <span className="blue-dot" />
            <strong>Your preview workspace</strong>
            <p>
              Explore the tools with sample data. Changes stay in this browser.
            </p>
          </div>
          <Link href="/">
            View storefront <ArrowUpRight size={17} />
          </Link>
          <div className="staff-profile">
            <span>SM</span>
            <div>
              <strong>SkyMart team</strong>
              <small>Demo operator</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-header">
          <div>
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle workspace navigation"
              onClick={() => setMobile(!mobile)}
            >
              <PanelLeftClose size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{tab}</strong>
          </div>
          <span className="demo-pill">
            <i /> Local demo
          </span>
        </header>
        <main className="admin-main">
          <div className="admin-title">
            <div>
              <span className="eyebrow">YOUR BUSINESS, AT A GLANCE</span>
              <h1>{tab === "Overview" ? "Let’s make things happen." : tab}</h1>
              <p>
                {tab === "Overview"
                  ? "A clear view of your products, stock and customer conversations."
                  : tab === "Products"
                    ? "Keep your catalogue useful, accurate and easy to explore."
                    : tab === "Categories"
                      ? "Give every product a place. Nest categories as your catalogue grows."
                      : tab === "Stock movements"
                        ? "Every change has a reason. Keep the full story of your stock."
                        : "Turn customer questions into useful conversations."}
              </p>
            </div>
            {tab === "Categories" ? (
              <button
                className="button primary"
                onClick={() => open("category")}
              >
                <Plus size={17} /> Add category
              </button>
            ) : tab === "Stock movements" ? (
              <button className="button primary" onClick={() => open("stock")}>
                <Plus size={17} /> Record movement
              </button>
            ) : (
              tab !== "Enquiries" && (
                <button
                  className="button primary"
                  onClick={() => open("product")}
                >
                  <Plus size={17} /> Add product
                </button>
              )
            )}
          </div>
          {!ready && <p>Loading saved preview…</p>}
          {notice && (
            <div className="success-message" role="status">
              <Check size={17} />
              {notice}
              <button
                className="icon-button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tab === "Overview" && (
            <>
              <div className="stat-grid">
                {[
                  {
                    label: "Catalogue products",
                    value: store.products.length,
                    detail:
                      store.products.filter((p) => p.published).length +
                      " published",
                    icon: Package,
                  },
                  {
                    label: "Units in stock",
                    value: total,
                    detail: "Across all product SKUs",
                    icon: Layers3,
                  },
                  {
                    label: "Low stock items",
                    value: low.length,
                    detail: "Below 5 units available",
                    icon: TriangleAlert,
                  },
                  {
                    label: "New enquiries",
                    value: fresh,
                    detail: "Ready for a conversation",
                    icon: MessagesSquare,
                  },
                ].map((s, i) => (
                  <div className={"stat-card stat-" + i} key={s.label}>
                    <div>
                      <span>{s.label}</span>
                      <s.icon size={20} />
                    </div>
                    <strong>{s.value.toString().padStart(2, "0")}</strong>
                    <small>{s.detail}</small>
                  </div>
                ))}
              </div>
              <div className="dashboard-grid">
                <section className="admin-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Stock that needs attention</h2>
                      <p>A little action now keeps things moving.</p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => setTab("Stock movements")}
                    >
                      Manage stock <ArrowRight size={16} />
                    </button>
                  </div>
                  {productTable(low, true)}
                </section>
                <section className="admin-panel quick-actions">
                  <span className="eyebrow">KEEP THINGS MOVING</span>
                  <h2>What’s next?</h2>
                  <button onClick={() => open("product")}>
                    <span>
                      <Package size={20} />
                    </span>
                    <div>
                      <strong>Add a new product</strong>
                      <small>Make room for something new</small>
                    </div>
                    <ArrowUpRight size={17} />
                  </button>
                  <button onClick={() => open("stock")}>
                    <span>
                      <ArrowLeftRight size={20} />
                    </span>
                    <div>
                      <strong>Record stock movement</strong>
                      <small>Keep availability up to date</small>
                    </div>
                    <ArrowUpRight size={17} />
                  </button>
                  <button onClick={() => setTab("Enquiries")}>
                    <span>
                      <MessagesSquare size={20} />
                    </span>
                    <div>
                      <strong>Check your enquiries</strong>
                      <small>Start a good conversation</small>
                    </div>
                    <ArrowUpRight size={17} />
                  </button>
                </section>
              </div>
              <section className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent stock activity</h2>
                    <p>A running history of changes to your inventory.</p>
                  </div>
                  <TrendingUp size={20} />
                </div>
                {store.movements.length ? (
                  <div className="activity-list">
                    {store.movements.slice(0, 5).map((m) => (
                      <div key={m.id}>
                        <span className="activity-icon">
                          <ArrowLeftRight size={18} />
                        </span>
                        <div>
                          <strong>
                            {
                              store.products.find((p) => p.id === m.productId)
                                ?.name
                            }
                          </strong>
                          <small>
                            {m.reason} · {m.reference}
                          </small>
                        </div>
                        <b className={m.delta > 0 ? "positive" : "negative"}>
                          {m.delta > 0 ? "+" : ""}
                          {m.delta}
                        </b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty small">
                    <ArrowLeftRight size={28} />
                    <h3>A fresh start for your stock.</h3>
                    <p>Record your first movement to see the history here.</p>
                    <button className="text-link" onClick={() => open("stock")}>
                      Record a movement <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </section>
            </>
          )}
          {tab === "Products" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>
                  All products{" "}
                  <span className="count">{store.products.length}</span>
                </h2>
                <label className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search inventory"
                    placeholder="Search name or SKU…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              {productTable(matched)}
            </section>
          )}
          {tab === "Categories" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <h2>Your category tree</h2>
                  <p>Products inherit the nearest available category image.</p>
                </div>
                <span className="count">
                  {store.categories.length} categories
                </span>
              </div>
              <div className="category-tree">
                {[...store.categories]
                  .sort((a, b) =>
                    categoryPath(store.categories, a.id)
                      .map((c) => c.name)
                      .join("/")
                      .localeCompare(
                        categoryPath(store.categories, b.id)
                          .map((c) => c.name)
                          .join("/"),
                      ),
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      style={{
                        paddingLeft:
                          24 +
                          (categoryPath(store.categories, c.id).length - 1) *
                            28,
                      }}
                    >
                      <Layers3 size={18} />
                      <div>
                        <strong>{c.name}</strong>
                        <small>
                          {categoryPath(store.categories, c.id)
                            .map((a) => a.name)
                            .join(" / ")}
                        </small>
                      </div>
                      <span className="muted">
                        {
                          store.products.filter((p) =>
                            descendants(store.categories, c.id).has(
                              p.categoryId,
                            ),
                          ).length
                        }{" "}
                        products
                      </span>
                      <button
                        className="icon-button"
                        aria-label={"Edit " + c.name}
                        onClick={() => open("category", c)}
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}
          {tab === "Stock movements" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Movement history</h2>
                <span className="muted">Append-only · Demo operator</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Change</th>
                      <th>Reason / reference</th>
                      <th>Recorded by</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.movements.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <strong>
                            {
                              store.products.find((p) => p.id === m.productId)
                                ?.name
                            }
                          </strong>
                        </td>
                        <td className={m.delta > 0 ? "positive" : "negative"}>
                          {m.delta > 0 ? "+" : ""}
                          {m.delta}
                        </td>
                        <td>
                          {m.reason}
                          <small>{m.reference}</small>
                        </td>
                        <td>{m.actor}</td>
                        <td>{new Date(m.createdAt).toLocaleString("en-GB")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!store.movements.length && (
                <div className="empty">
                  <ArrowLeftRight size={36} />
                  <h3>No movements yet</h3>
                  <p>
                    The sample quantities are opening balances. New changes will
                    be recorded here.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => open("stock")}
                  >
                    Record first movement
                  </button>
                </div>
              )}
            </section>
          )}
          {tab === "Enquiries" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Customer conversations</h2>
                <span className="count">
                  {store.enquiries.length} enquiries
                </span>
              </div>
              {store.enquiries.map((enquiry) => (
                <article className="enquiry-card" key={enquiry.id}>
                  <div className="enquiry-heading">
                    <div>
                      <h3>{enquiry.name}</h3>
                      <span>
                        {enquiry.email}
                        {enquiry.phone ? " · " + enquiry.phone : ""}
                      </span>
                    </div>
                    <select
                      aria-label={"Status for " + enquiry.name}
                      value={enquiry.status}
                      onChange={(e) =>
                        update((s) => ({
                          ...s,
                          enquiries: s.enquiries.map((q) =>
                            q.id === enquiry.id
                              ? {
                                  ...q,
                                  status: e.target.value as typeof q.status,
                                }
                              : q,
                          ),
                        }))
                      }
                    >
                      <option>New</option>
                      <option>In progress</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                  <strong>
                    {store.products.find((p) => p.id === enquiry.productId)
                      ?.name || "General enquiry"}
                  </strong>
                  <p>{enquiry.message}</p>
                  <small>
                    {new Date(enquiry.createdAt).toLocaleString("en-GB")} ·
                    Marketing: email{" "}
                    {enquiry.emailOptIn ? "opted in" : "not opted in"}, SMS{" "}
                    {enquiry.smsOptIn ? "opted in" : "not opted in"}
                  </small>
                </article>
              ))}
              {!store.enquiries.length && (
                <div className="empty">
                  <MessagesSquare size={36} />
                  <h3>Room for a good conversation.</h3>
                  <p>
                    Enquiries saved through the demo contact form will appear
                    here.
                  </p>
                  <Link className="button secondary" href="/contact">
                    Try the enquiry form <ArrowUpRight size={16} />
                  </Link>
                </div>
              )}
            </section>
          )}
          <p className="admin-footnote">
            SkyMart workspace · Browser-only demo · No live customer or stock
            data
          </p>
        </main>
      </div>
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <dialog
            open
            className="modal"
            aria-labelledby="modal-title"
            ref={(node) => {
              node?.focus();
            }}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") setModal(null);
              if (e.key === "Tab") {
                const nodes = Array.from(
                  e.currentTarget.querySelectorAll<HTMLElement>(
                    'button,input,select,textarea,[tabindex="0"]',
                  ),
                );
                const first = nodes[0],
                  last = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className="modal-heading">
              <h2 id="modal-title">
                {modal === "stock"
                  ? "Record stock movement"
                  : `${editing ? "Edit" : "Add"} ${modal}`}
              </h2>
              <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setModal(null)}
              >
                <X size={21} />
              </button>
            </div>
            <form onSubmit={save}>
              {modal === "product" ? (
                <>
                  <label>
                    Product name
                    <input
                      name="name"
                      required
                      maxLength={150}
                      defaultValue={activeProduct?.name}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      SKU
                      <input
                        name="sku"
                        required
                        maxLength={50}
                        defaultValue={activeProduct?.sku}
                      />
                    </label>
                    <label>
                      Price (LKR)
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Blank for quote only"
                        defaultValue={activeProduct?.price ?? ""}
                      />
                    </label>
                  </div>
                  <label>
                    Category
                    <select
                      name="category"
                      required
                      defaultValue={activeProduct?.categoryId}
                    >
                      {store.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {categoryPath(store.categories, c.id)
                            .map((x) => x.name)
                            .join(" / ")}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Description
                    <textarea
                      name="description"
                      required
                      rows={3}
                      maxLength={2000}
                      defaultValue={activeProduct?.description}
                    />
                  </label>
                  <label>
                    Image URL{" "}
                    <small>(optional; category image is inherited)</small>
                    <input
                      name="image"
                      defaultValue={activeProduct?.image}
                      placeholder="https://… or /images/battery.svg"
                    />
                  </label>
                  <label>
                    Specifications <small>(one Name: Value per line)</small>
                    <textarea
                      name="specs"
                      rows={3}
                      defaultValue={
                        activeProduct
                          ? Object.entries(activeProduct.specs)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join("\n")
                          : ""
                      }
                    />
                  </label>
                  <div className="form-row">
                    <label className="check">
                      <input
                        type="checkbox"
                        name="published"
                        defaultChecked={activeProduct?.published ?? true}
                      />
                      Published
                    </label>
                    <label className="check">
                      <input
                        type="checkbox"
                        name="featured"
                        defaultChecked={activeProduct?.featured ?? false}
                      />
                      Featured
                    </label>
                  </div>
                  <p className="muted">
                    Stock is managed through movements to preserve its history.
                  </p>
                </>
              ) : modal === "category" ? (
                <>
                  <label>
                    Category name
                    <input
                      name="name"
                      required
                      maxLength={100}
                      defaultValue={activeCategory?.name}
                    />
                  </label>
                  <label>
                    Parent category
                    <select
                      name="parent"
                      defaultValue={activeCategory?.parentId || ""}
                    >
                      <option value="">None — top-level category</option>
                      {store.categories
                        .filter(
                          (c) =>
                            !activeCategory ||
                            !descendants(
                              store.categories,
                              activeCategory.id,
                            ).has(c.id),
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {categoryPath(store.categories, c.id)
                              .map((x) => x.name)
                              .join(" / ")}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Default image URL <small>(optional)</small>
                    <input
                      name="image"
                      defaultValue={activeCategory?.image}
                      placeholder="https://… or /images/battery.svg"
                    />
                  </label>
                  <p className="muted">
                    Leave the image empty to inherit a parent category image.
                  </p>
                </>
              ) : (
                <>
                  <label>
                    Product
                    <select name="product" required>
                      {store.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.stock} available
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Reason
                    <select name="reason">
                      <option>Stock received</option>
                      <option>Offline sale</option>
                      <option>Customer return</option>
                      <option>Damaged goods</option>
                      <option>Stock-count correction</option>
                    </select>
                  </label>
                  <label>
                    Quantity
                    <input
                      name="quantity"
                      type="number"
                      required
                      step="1"
                      min={-1000000}
                      max={1000000}
                      defaultValue={1}
                    />
                  </label>
                  <p className="muted">
                    Use positive quantities for receipts, sales, returns and
                    damage. For a stock-count correction, enter a signed change
                    (+ / −).
                  </p>
                  <label>
                    Reference / explanation
                    <textarea
                      name="reference"
                      required
                      maxLength={500}
                      rows={3}
                      placeholder="e.g. Supplier receipt GRN-001"
                    />
                  </label>
                </>
              )}
              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  {modal === "stock" ? "Record movement" : "Save " + modal}
                  <Check size={16} />
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}
