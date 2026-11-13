import { test } from "node:test";
import assert from "node:assert/strict";
import { seed } from "../src/lib/seed";
import {
  categoryPath,
  descendants,
  moveStock,
  productImage,
  validateParent,
} from "../src/lib/domain";
test("a parent category includes products in every nested descendant", () => {
  assert.deepEqual(
    [...descendants(seed.categories, "batteries")],
    ["batteries", "vehicle-batteries", "car-batteries"],
  );
});
test("category cycles and missing parents are rejected", () => {
  assert.throws(() =>
    validateParent(seed.categories, "batteries", "car-batteries"),
  );
  assert.throws(() =>
    validateParent(seed.categories, "batteries", "batteries"),
  );
  assert.throws(() => validateParent(seed.categories, "batteries", "missing"));
  assert.doesNotThrow(() => validateParent(seed.categories, "batteries", null));
});
test("category paths remain safe even if data contains a cycle", () => {
  const corrupt = seed.categories.map((c) =>
    c.id === "batteries" ? { ...c, parentId: "car-batteries" } : c,
  );
  assert.equal(categoryPath(corrupt, "car-batteries").length, 3);
});
test("missing photos inherit the nearest category image", () => {
  const p = { ...seed.products[1], image: "" };
  assert.equal(productImage(p, seed.categories), "/images/battery.svg");
  const categories = seed.categories.map((c) =>
    c.id === "car-batteries" ? { ...c, image: "/closer.svg" } : c,
  );
  assert.equal(productImage(p, categories), "/closer.svg");
  assert.equal(
    productImage({ ...p, categoryId: "missing" }, []),
    "/images/placeholder.svg",
  );
});
test("stock deductions are immutable and cannot make stock negative", () => {
  const next = moveStock(
    seed,
    "brake-kit",
    -4,
    "Offline sale",
    "INV-001",
    "one",
  );
  assert.equal(next.products.find((p) => p.id === "brake-kit")?.stock, 0);
  assert.equal(seed.products.find((p) => p.id === "brake-kit")?.stock, 4);
  assert.equal(next.movements[0].reference, "INV-001");
  assert.throws(() =>
    moveStock(next, "brake-kit", -1, "Offline sale", "INV-002", "two"),
  );
});
test("repeating a movement request does not apply it twice", () => {
  const once = moveStock(
    seed,
    "brake-kit",
    2,
    "Stock received",
    "GRN-001",
    "same",
  );
  assert.equal(
    moveStock(once, "brake-kit", 2, "Stock received", "GRN-001", "same"),
    once,
  );
});
test("invalid quantities, reasons and references are rejected", () => {
  for (const delta of [0, 1.5, NaN, Infinity])
    assert.throws(() =>
      moveStock(seed, "brake-kit", delta, "Stock received", "ref", "id"),
    );
  assert.throws(() =>
    moveStock(seed, "brake-kit", 1, "Stock received", " ", "id"),
  );
  assert.throws(() =>
    moveStock(seed, "brake-kit", 1, "Offline sale", "ref", "id"),
  );
  assert.throws(() =>
    moveStock(seed, "brake-kit", -1, "Customer return", "ref", "id"),
  );
  assert.throws(() => moveStock(seed, "brake-kit", 1, "Unknown", "ref", "id"));
});
test("stock corrections preserve history with a new signed movement", () => {
  const received = moveStock(
    seed,
    "brake-kit",
    4,
    "Stock received",
    "GRN-001",
    "first",
  );
  const corrected = moveStock(
    received,
    "brake-kit",
    -2,
    "Stock-count correction",
    "Count discrepancy",
    "second",
  );
  assert.equal(corrected.products.find((p) => p.id === "brake-kit")?.stock, 6);
  assert.equal(corrected.movements.length, 2);
  assert.equal(corrected.movements[1].delta, 4);
});
