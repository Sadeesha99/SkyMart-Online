import { PublicShell } from "@/components/shell";
import { Catalogue } from "@/components/catalogue";
export const metadata = { title: "Explore products" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return (
    <PublicShell>
      <Catalogue key={category} initialCategory={category} />
    </PublicShell>
  );
}
