export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  image: string;
  icon: string;
};
export type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number | null;
  stock: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  featured: boolean;
  published: boolean;
};
export type Movement = {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  reference: string;
  actor: string;
  createdAt: string;
};
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  productId: string;
  message: string;
  status: "New" | "In progress" | "Resolved";
  createdAt: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
};
export type Store = {
  version: 1;
  categories: Category[];
  products: Product[];
  movements: Movement[];
  enquiries: Enquiry[];
};
export function descendants(categories: Category[], id: string): Set<string> {
  const found = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories)
      if (c.parentId && found.has(c.parentId) && !found.has(c.id)) {
        found.add(c.id);
        changed = true;
      }
  }
  return found;
}
export function validateParent(
  categories: Category[],
  id: string,
  parentId: string | null,
) {
  if (
    parentId &&
    (!categories.some((c) => c.id === parentId) ||
      descendants(categories, id).has(parentId))
  )
    throw new Error("Choose a parent outside this category’s own branch.");
}
export function categoryPath(categories: Category[], id: string): Category[] {
  const path: Category[] = [];
  const seen = new Set<string>();
  let current = categories.find((c) => c.id === id);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = categories.find((c) => c.id === current!.parentId);
  }
  return path;
}
export function productImage(product: Product, categories: Category[]) {
  return (
    product.image ||
    [...categoryPath(categories, product.categoryId)]
      .reverse()
      .find((c) => c.image)?.image ||
    "/images/placeholder.svg"
  );
}
export function moveStock(
  store: Store,
  productId: string,
  delta: number,
  reason: string,
  reference: string,
  id: string,
): Store {
  if (store.movements.some((m) => m.id === id)) return store;
  const product = store.products.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found.");
  if (!Number.isSafeInteger(delta) || delta === 0)
    throw new Error("Enter a non-zero whole quantity.");
  if (
    ![
      "Stock received",
      "Offline sale",
      "Customer return",
      "Damaged goods",
      "Stock-count correction",
    ].includes(reason)
  )
    throw new Error("Choose a valid movement reason.");
  if (["Stock received", "Customer return"].includes(reason) && delta < 0)
    throw new Error("Receipts and returns must add stock.");
  if (["Offline sale", "Damaged goods"].includes(reason) && delta > 0)
    throw new Error("Sales and damaged goods must remove stock.");
  if (product.stock + delta < 0)
    throw new Error("There is not enough stock for this movement.");
  if (!reference.trim())
    throw new Error("A reference or explanation is required.");
  return {
    ...store,
    products: store.products.map((p) =>
      p.id === productId ? { ...p, stock: p.stock + delta } : p,
    ),
    movements: [
      {
        id,
        productId,
        delta,
        reason,
        reference,
        actor: "Demo operator",
        createdAt: new Date().toISOString(),
      },
      ...store.movements,
    ],
  };
}
export const money = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
