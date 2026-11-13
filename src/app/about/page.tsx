import Link from "next/link";
import { ArrowRight, BatteryCharging, Bike, Cpu, Disc3 } from "lucide-react";
import { PublicShell } from "@/components/shell";
export const metadata = { title: "Our story" };
export default function Page() {
  return (
    <PublicShell>
      <main className="page-main about-page">
        <span className="eyebrow">HELLO, WE’RE SKYMART</span>
        <h1>
          More useful things.
          <br />
          <span>More everyday possibilities.</span>
        </h1>
        <p className="about-lead">
          We’re building a simpler way to discover the products that power your
          day, keep you moving and make life a little better.
        </p>
        <div className="about-grid">
          <div className="about-art">
            <BatteryCharging />
            <Bike />
            <Cpu />
            <Disc3 />
          </div>
          <div>
            <span className="eyebrow">SOURCED WITH PURPOSE</span>
            <h2>
              From a wider world.
              <br />
              To your everyday.
            </h2>
            <p>
              SkyMart imports products from China, with a focus on electronics,
              vehicle batteries, spare parts and electric mobility. Our
              catalogue is built to grow as your needs do.
            </p>
            <p>
              We believe choosing a product should feel straightforward. Browse
              the details, check availability, and speak to our team about the
              right fit.
            </p>
            <Link href="/products" className="button primary">
              Explore our catalogue <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <section className="help-banner">
          <div>
            <span className="eyebrow">LET’S START WITH WHAT YOU NEED</span>
            <h2>Good choices start with a conversation.</h2>
          </div>
          <Link href="/contact" className="button light">
            Get in touch <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </PublicShell>
  );
}
