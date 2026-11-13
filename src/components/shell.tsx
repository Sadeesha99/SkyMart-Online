"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Menu,
  X,
  UserRound,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="SkyMart home">
      <span className="brand-mark">
        <Zap size={23} fill="currentColor" />
      </span>
      Sky<span>Mart</span>
      <span className="brand-dot">.</span>
    </Link>
  );
}
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>Thoughtfully sourced. Ready for your everyday.</span>
        <Link href="/contact">
          Let’s find what you need <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="site-header">
        <Brand />
        <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
          {[
            ["/", "Home"],
            ["/products", "Explore products"],
            ["/about", "About us"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              onClick={() => setOpen(false)}
              className={path === href ? "active" : ""}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/account" className="account-link">
            <UserRound size={18} />
            <span>My account</span>
          </Link>
          <button
            className="icon-button mobile-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Brand />
          <p>
            Powering possibilities.
            <br />
            For the road. For your home. For you.
          </p>
        </div>
        <div>
          <span className="eyebrow">DISCOVER</span>
          <Link href="/products">Our catalogue</Link>
          <Link href="/about">The SkyMart story</Link>
          <Link href="/contact">Get in touch</Link>
        </div>
        <div>
          <span className="eyebrow">LET’S TALK</span>
          <p>Need help finding the right fit?</p>
          <Link href="/contact" className="text-link">
            Talk to our team <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} SkyMart. All rights reserved.</span>
        <span>Local preview · Sample products & prices</span>
        <Link href="/admin">
          Staff workspace <ArrowUpRight size={13} />
        </Link>
      </div>
    </footer>
  );
}
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
