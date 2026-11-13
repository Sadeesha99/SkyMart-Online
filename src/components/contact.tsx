"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  PackageSearch,
} from "lucide-react";
import { useStore } from "./store-provider";
export function Contact({ productId = "" }: { productId?: string }) {
  const { store, update } = useStore();
  const [saved, setSaved] = useState(false);
  return (
    <main className="page-main contact-page">
      <div className="contact-intro">
        <span className="eyebrow">GOOD CONVERSATIONS START HERE</span>
        <h1>
          Let’s find your
          <br />
          <span>next possibility.</span>
        </h1>
        <p>
          Need a product, a price or a little advice? Tell us what you have in
          mind.
        </p>
        <div className="contact-reason">
          <PackageSearch />
          <div>
            <h3>Find the right product</h3>
            <p>Share a model, specification or what you need it for.</p>
          </div>
        </div>
        <div className="contact-reason">
          <MessageCircle />
          <div>
            <h3>Make an enquiry</h3>
            <p>Ask about availability, quantities or compatibility.</p>
          </div>
        </div>
        <div className="preview-note">
          Preview mode: enquiries are saved in this browser for you to try in
          the staff workspace. No email or SMS is sent.
        </div>
      </div>
      <section className="form-panel">
        {saved ? (
          <div className="empty">
            <CheckCircle2 size={48} />
            <h2>Demo enquiry saved.</h2>
            <p>
              You can review it in the staff workspace. It has not been sent to
              SkyMart.
            </p>
            <Link className="button primary" href="/products">
              Keep exploring <ArrowRight size={16} />
            </Link>
            <button className="text-link" onClick={() => setSaved(false)}>
              Create another enquiry
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((s) => ({
                ...s,
                enquiries: [
                  {
                    id: crypto.randomUUID(),
                    name: String(f.get("name")).trim(),
                    email: String(f.get("email")).trim(),
                    phone: String(f.get("phone")).trim(),
                    productId: String(f.get("product")),
                    message: String(f.get("message")).trim(),
                    status: "New",
                    createdAt: new Date().toISOString(),
                    emailOptIn: f.get("emailOptIn") === "on",
                    smsOptIn: f.get("smsOptIn") === "on",
                  },
                  ...s.enquiries,
                ],
              }));
              setSaved(true);
            }}
          >
            <h2>How can we help?</h2>
            <p>A few details will help us understand your request.</p>
            <label>
              Your name
              <input
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Full name"
              />
            </label>
            <div className="form-row">
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Phone <small>(optional)</small>
                <input
                  name="phone"
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  placeholder="07X XXX XXXX"
                />
              </label>
            </div>
            <label>
              Product
              <select name="product" defaultValue={productId}>
                <option value="">General enquiry</option>
                {store.products
                  .filter((p) => p.published)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Your message
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={4}
                placeholder="Tell us what you’re looking for…"
              />
            </label>
            <label className="check">
              <input type="checkbox" name="emailOptIn" />
              I’d like product updates by email.
            </label>
            <label className="check">
              <input type="checkbox" name="smsOptIn" />
              I’d like product updates by SMS.
            </label>
            <button className="button primary" type="submit">
              Save demo enquiry <ArrowRight size={17} />
            </button>
            <small className="muted">
              Marketing preferences are optional and separate from your enquiry.
            </small>
          </form>
        )}
      </section>
    </main>
  );
}
