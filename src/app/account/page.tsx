import Link from "next/link";
import { UserRound, ArrowRight, LockKeyhole } from "lucide-react";
import { PublicShell } from "@/components/shell";
export const metadata = { title: "Your account" };
export default function Page() {
  return (
    <PublicShell>
      <main className="page-main account-page">
        <div className="form-panel">
          <span className="account-emblem">
            <UserRound size={30} />
          </span>
          <span className="eyebrow">YOUR SKYMART</span>
          <h1>A place for your possibilities.</h1>
          <p>
            Customer accounts will bring your enquiries, saved details and
            communication preferences together.
          </p>
          <div className="preview-note">
            <LockKeyhole size={20} />
            <div>
              <strong>Account setup is coming next.</strong>
              <p>
                Sign-in, registration and password resets will be enabled when
                secure authentication is connected.
              </p>
            </div>
          </div>
          <Link href="/products" className="button primary">
            Browse without an account <ArrowRight size={17} />
          </Link>
          <Link href="/admin" className="text-link">
            Explore the demo staff workspace <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}
