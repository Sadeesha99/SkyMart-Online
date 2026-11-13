import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  check,
  index,
  pgEnum,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
export const staffRole = pgEnum("staff_role", [
  "owner",
  "admin",
  "catalogue_editor",
  "stock_operator",
]);
export const movementReason = pgEnum("movement_reason", [
  "receipt",
  "offline_sale",
  "return",
  "damage",
  "correction",
]);
export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "in_progress",
  "resolved",
]);
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  authUserId: text("auth_user_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  emailOptIn: boolean("email_opt_in").notNull().default(false),
  smsOptIn: boolean("sms_opt_in").notNull().default(false),
  consentUpdatedAt: timestamp("consent_updated_at", { withTimezone: true }),
  createdAt: createdAt(),
});
export const staffMemberships = pgTable("staff_memberships", {
  profileId: uuid("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  role: staffRole("role").notNull(),
  createdAt: createdAt(),
});
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "restrict",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    defaultImageUrl: text("default_image_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("categories_parent_idx").on(t.parentId),
    check(
      "category_not_self_parent",
      sql`${t.parentId} IS NULL OR ${t.parentId} <> ${t.id}`,
    ),
  ],
);
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    specifications: jsonb("specifications")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    published: boolean("published").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);
export const skus = pgTable(
  "skus",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    code: text("code").notNull().unique(),
    name: text("name").notNull().default("Default"),
    priceMinor: integer("price_minor"),
    currency: text("currency").notNull().default("LKR"),
    imageUrl: text("image_url"),
    stockOnHand: integer("stock_on_hand").notNull().default(0),
    reorderLevel: integer("reorder_level").notNull().default(5),
    attributes: jsonb("attributes")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("skus_product_idx").on(t.productId),
    check("sku_stock_nonnegative", sql`${t.stockOnHand} >= 0`),
    check(
      "sku_price_nonnegative",
      sql`${t.priceMinor} IS NULL OR ${t.priceMinor} >= 0`,
    ),
    check("sku_reorder_nonnegative", sql`${t.reorderLevel} >= 0`),
  ],
);
export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    skuId: uuid("sku_id")
      .notNull()
      .references(() => skus.id, { onDelete: "restrict" }),
    delta: integer("delta").notNull(),
    reason: movementReason("reason").notNull(),
    reference: text("reference").notNull(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    idempotencyKey: uuid("idempotency_key").notNull().unique(),
    createdAt: createdAt(),
  },
  (t) => [
    index("movements_sku_date_idx").on(t.skuId, t.createdAt),
    check("movement_nonzero", sql`${t.delta} <> 0`),
    check(
      "movement_sign",
      sql`(${t.reason} IN ('receipt','return') AND ${t.delta} > 0) OR (${t.reason} IN ('offline_sale','damage') AND ${t.delta} < 0) OR ${t.reason} = 'correction'`,
    ),
  ],
);
export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    status: enquiryStatus("status").notNull().default("new"),
    emailOptIn: boolean("email_opt_in").notNull().default(false),
    smsOptIn: boolean("sms_opt_in").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("enquiries_status_date_idx").on(t.status, t.createdAt)],
);
export const notificationOutbox = pgTable(
  "notification_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    enquiryId: uuid("enquiry_id").references(() => enquiries.id, {
      onDelete: "restrict",
    }),
    channel: text("channel").notNull(),
    kind: text("kind").notNull(),
    recipient: text("recipient").notNull(),
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastError: text("last_error"),
    createdAt: createdAt(),
  },
  (t) => [
    index("notification_pending_idx").on(t.status, t.nextAttemptAt),
    check("notification_channel", sql`${t.channel} IN ('email','sms')`),
  ],
);
