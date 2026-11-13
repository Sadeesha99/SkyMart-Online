# Requirements and milestone status

Source: the user's existing **SkyMart Technical Plan** chat, reviewed 13 November 2026.

## Business scope

SkyMart imports electronics, batteries, vehicle spare parts and electric bikes from China. The initial website presents a growing catalogue, stock availability and enquiries. Customers can browse without an account. Cart, checkout, payments and delivery management belong to later phases.

## Current first milestone

The deliverable is a local, interactive UI and data-model foundation. Implemented demo workflows: public browsing and search; nested categories; product details; enquiry capture and status tracking; staff product/category editing; stock movements and history. Branding direction: blue, warm white, navy and soft sage; simple layouts with clear hierarchy.

## Acceptance checks

- A parent-category filter includes every descendant.
- Reparenting a category cannot create a cycle.
- Products without their own image inherit the closest category image.
- Out-of-stock products remain discoverable for an availability enquiry.
- A draft product is hidden from public demo listings.
- Newly created products start at zero stock; additions use a stock receipt.
- Stock cannot go negative; movement reasons enforce the correct sign.
- Repeated movement IDs are idempotent in the domain function.
- Corrections append history instead of editing old movements.
- Enquiry success text explicitly states that the record is local and no message was sent.
- Email and SMS marketing preferences are independent and unchecked by default.
- Sample content is labelled; unconnected login never accepts passwords.

## Production phase 1 still required

Server-side persistence and authorization; real customer/staff identity; role provisioning; verification and password resets; SKU variation UI; image upload/storage; transactional stock updates; idempotency across concurrent requests; database-enforced category-cycle safety; durable notification workers; email/SMS integrations; anti-spam/rate limiting; audit privileges; live-data migration; production QA and deployment.

Initial roles: owner, admin and customer. Schema allows catalogue editor and stock operator as staff roles; a customer has no staff membership. Enforce these permissions on the server before exposing shared data.

Production business details requiring confirmation: actual phone/email/address, logo, product catalogue/photos/prices, warranty/returns terms, enquiry response ownership, administrative MFA requirement, message providers and hosting accounts. No fabricated contact information appears in the UI.
