import type { Metadata } from "next";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "SkyMart — More possibilities.", template: "%s | SkyMart" },
  description:
    "Explore electronics, batteries, vehicle parts and electric mobility with SkyMart.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <StoreProvider>
          <div id="content">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
