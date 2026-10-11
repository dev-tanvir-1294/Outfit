# OUTFIT® — Headless Storefront (WooCommerce)

A faithful clone of the `outfit.hellohello.is` design, rebuilt on **Next.js + Tailwind CSS** and powered by a **WordPress + WooCommerce** backend through the REST API.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** WordPress + WooCommerce (REST API)

## Setup

### 1. Create WooCommerce API keys

In WordPress admin: **WooCommerce → Settings → Advanced → REST API → Add key**.
Set permissions to **Read/Write** and copy the **Consumer key** (`ck_…`) and
**Consumer secret** (`cs_…`). Your store must be reachable over HTTPS.

### 2. Import the products

**WooCommerce → Products → Import** and upload `woocommerce-products.csv`.
On the mapping step, map **Name**, **Regular price**, **Short description**,
**Description**, **In stock?**, **Categories**, and **Images** to "Import as…",
then run the importer. Product images are downloaded from their source URLs.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Description |
| --- | --- |
| `WOOCOMMERCE_URL` | Store root URL, e.g. `https://redbox.page.gd/outfit` |
| `WOOCOMMERCE_CONSUMER_KEY` | The `ck_…` key |
| `WOOCOMMERCE_CONSUMER_SECRET` | The `cs_…` secret |
| `WOOCOMMERCE_CURRENCY` | Currency code, e.g. `USD` |

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy with GitHub and Netlify

1. Create a GitHub repository and push this project. Do not commit `.env.local`
   or paste secret values into source files. `.env*` files are ignored by Git;
   `.env.example` contains placeholders only.
2. In Netlify, choose **Add new site → Import an existing project** and connect
   the GitHub repository. Netlify detects Next.js and uses its Next.js adapter;
   the included `netlify.toml` sets the build command to `npm run build`.
3. In **Site configuration → Environment variables**, add these variables for
   the Netlify site:

   | Variable | Value |
   | --- | --- |
   | `WOOCOMMERCE_URL` | WooCommerce site root URL, with no trailing slash |
   | `WOOCOMMERCE_CONSUMER_KEY` | WooCommerce REST API consumer key |
   | `WOOCOMMERCE_CONSUMER_SECRET` | WooCommerce REST API consumer secret |
   | `WOOCOMMERCE_CURRENCY` | Store currency code, such as `BDT` or `USD` |
   | `WORDPRESS_URL` | Optional; WordPress site root if different from WooCommerce |
   | `WORDPRESS_JWT_PATH` | Optional; JWT endpoint path if not the default |

   The consumer key and secret must remain server-side. Do not prefix them with
   `NEXT_PUBLIC_`; never place their real values in `.env.example`, GitHub, or
   `netlify.toml`. Enter actual values only in Netlify's environment-variable
   settings (mark secrets as secret when Netlify offers that option).
4. Trigger a deploy. After changing environment variables, redeploy the site so
   the Next.js server functions receive the updated values.

## Data flow

- `lib/catalog.ts` is the single data source for the storefront. It fetches live
  products from WooCommerce, and falls back to the bundled mock data
  (`lib/mock-data.ts`) when `.env.local` is not configured — so the site previews
  immediately, then goes live once you add your keys.
- `lib/woocommerce.ts` is the REST client (products, categories, orders, customers).
- `woocommerce-products.csv` is the import file for your WooCommerce catalog.

## Notes

- The reference site runs Shopify headless; this project keeps the same frontend
  but swaps the commerce layer to WooCommerce.
- Sizes/colors are imported as product attributes. If you need purchasable
  variations (e.g. selectable sizes with per-size pricing), the CSV can be
  extended to variable products.
