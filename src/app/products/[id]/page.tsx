import { PublicShell } from "@/components/shell";
import { ProductDetail } from "@/components/product-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PublicShell>
      <ProductDetail key={id} id={id} />
    </PublicShell>
  );
}
