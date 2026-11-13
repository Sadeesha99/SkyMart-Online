import { PublicShell } from "@/components/shell";
import { Contact } from "@/components/contact";
export const metadata = { title: "Get in touch" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  return (
    <PublicShell>
      <Contact key={product} productId={product} />
    </PublicShell>
  );
}
