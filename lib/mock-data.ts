export interface MockProduct {
  handle: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  currency: string;
  category: string;
  available: boolean;
  image: string;
  imageHover: string;
  options?: { name: string; values: string[] }[];
  aspect?: "large" | "small" | "square";
}

const CDN = "https://cdn.shopify.com/s/files/1/0665/1455/0837/files";

export const products: MockProduct[] = [
  {
    handle: "off-by-design",
    title: "Off by Design",
    description:
      "A soft reminder that not everything needs to be bold and urgent. Syntax break approved.",
    price: "36.50",
    currency: "USD",
    category: "Apparel",
    available: true,
    image: `${CDN}/t-shirt-time-off-outfit_dfee3661-54e4-43ab-8d38-34388179952d.jpg?v=1753359304`,
    imageHover: `${CDN}/t-shirt-time-off-outfit-2_6ed63e49-09af-4ab5-9994-7f1fef44c587.jpg?v=1753359304`,
    options: [
      { name: "Color", values: ["Black"] },
      { name: "Size", values: ["S", "M", "L", "XL", "2XL"] },
    ],
    aspect: "large",
  },
  {
    handle: "kerned-confidence",
    title: "Kerned Confidence",
    description:
      "Designed with enough spacing to keep your thoughts aligned. Perfect for grid minds and shady days.",
    price: "25.00",
    currency: "USD",
    category: "Apparel",
    available: true,
    image: `${CDN}/cap-_-black-outfit_9a3389f2-3570-4130-8abc-c7d891c7c073.jpg?v=1775830283`,
    imageHover: `${CDN}/cap-_-black-outfit-2_a4c86e6e-f97a-455c-ba4e-1bdca4ba2b86.jpg?v=1755282023`,
    aspect: "large",
  },
  {
    handle: "specimen-no-hh01",
    title: "Specimen No. HH01",
    description:
      "Minimal warmth, maximum context. Featuring our signature red patch—because contrast isn't optional, it's a lifestyle.",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/jersey-red-square-outfit_d6d9ae9b-b22d-4eed-93e2-8b0913b773f4.jpg?v=1753359372`,
    imageHover: `${CDN}/jersey-red-square-outfit-2_7d8ec371-d660-43a7-a08d-9ef1eb053caf.jpg?v=1753359372`,
    aspect: "large",
  },
  {
    handle: "grid-system-go",
    title: "Grid System Go",
    description:
      "One backpack. Infinite modules. Perfectly aligned for designers on the move (or on the run from deadlines).",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/mochila1.jpg?v=1775839677`,
    imageHover: `${CDN}/backpack-recycled-black-outfit-3_e9a01867-b304-4957-bb6f-e92759717401.jpg?v=1775839677`,
    aspect: "large",
  },
  {
    handle: "neutral-grotesk",
    title: "Neutral Grotesk",
    description:
      "Says hello so you don't have to. Swiss type, street energy, social anxiety certified.",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/totebag-sayhello-outfit_f241d637-643f-473c-b0ee-82402efd800a.jpg?v=1753359469`,
    imageHover: `${CDN}/totebag-sayhello-outfit-2.jpg?v=1753359469`,
  },
  {
    handle: "red-dot-not-award",
    title: "Red Dot Not Award",
    description:
      "Keep your head warm and your design principles warmer. Pantone? Nah, this is ++ red.",
    price: "20.00",
    currency: "USD",
    category: "Apparel",
    available: true,
    image: `${CDN}/beanie-_-red-outfit_2c3b211f-1507-4f73-817f-2b124d7daa33.jpg?v=1753306330`,
    imageHover: `${CDN}/beanie-_-red-outfit-PLSNOUSAR_d2a91372-9ff5-4285-bff4-4b44bb9b4ff8.jpg?v=1753306330`,
    options: [{ name: "Color", values: ["Black", "Red"] }],
    aspect: "small",
  },
  {
    handle: "gridlocked",
    title: "Gridlocked",
    description:
      "Reflects more than light—reflects your design beliefs. Built on Contrast, Grid, Typeface, and Spacing. Obviously.",
    price: "25.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/metalbag.jpg?v=1753359548`,
    imageHover: `${CDN}/totebag-metal-outfit-2_e18d8c17-2359-4dc2-9bf1-80277d681c17.jpg?v=1753359548`,
    aspect: "square",
  },
  {
    handle: "hello-week-001",
    title: "Hello Week 001",
    description:
      "Your week just got kerned. Comes with enough negative space to calm down even your most chaotic Mondays.",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/t-shirt-hello-week-white-outfit.jpg?v=1753359579`,
    imageHover: `${CDN}/t-shirt-hello-week-white-outfit-2_cc70839b-bea7-4957-9262-f38ff0e9f505.jpg?v=1753359579`,
    aspect: "small",
  },
  {
    handle: "hello-week-002",
    title: "Hello Week 002",
    description:
      "Because even your inner sun deserves PTO. Let the grid rest (just this once).",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/t-shirt-hello-week-dark-grey-outfit_ec196548-f6da-4682-8c5c-8714bd4ebdf5.jpg?v=1753359601`,
    imageHover: `${CDN}/t-shirt-hello-week-dark-grey-outfit-2_08bdbb8f-02f4-401d-afed-f07a4d29930d.jpg?v=1753359601`,
  },
  {
    handle: "monochrome-manifest",
    title: "Monochrome Manifest",
    description:
      "A whisper in black-on-black. For everything you bold enough to carry.",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: true,
    image: `${CDN}/totebag-_-black-outfit_850aaa09-ee65-42d9-8236-9579f797a2db.jpg?v=1753305812`,
    imageHover: `${CDN}/totebag-_-black-outfit-2.jpg?v=1753305812`,
    aspect: "small",
  },
  {
    handle: "positive-space",
    title: "Positive Space",
    description:
      "Bold. Basic. Necessary. This tote brings balance to your busy layout (and your groceries).",
    price: "30.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/totebag-_-white-outfit_461af856-288d-4e39-9913-4ce3febba67d.jpg?v=1753306427`,
    imageHover: `${CDN}/totebag-_-white-outfit-2.jpg?v=1753306427`,
  },
  {
    handle: "whitespace-matters",
    title: "Whitespace Matters",
    description:
      "Minimal enough to say everything. Maximum respect for negative space.",
    price: "30.00",
    compareAtPrice: "33.00",
    currency: "USD",
    category: "Apparel",
    available: true,
    image: `${CDN}/t-shirt-_-white-outfit.jpg?v=1753306027`,
    imageHover: `${CDN}/t-shirt-_-white-outfit-2_0b43b5d9-98ff-4e64-ada9-a205c95b70f1.jpg?v=1753306027`,
    options: [{ name: "Size", values: ["S", "M", "L", "XL", "2XL"] }],
    aspect: "small",
  },
  {
    handle: "command-k",
    title: "Command + K",
    description:
      "Form follows function—and function follows your keys. Designed to never ghost you, even when you forget your password.",
    price: "15.00",
    currency: "USD",
    category: "Apparel",
    available: false,
    image: `${CDN}/keychain-_-black-outfit.jpg?v=1753306385`,
    imageHover: `${CDN}/keychain-_-black-outfit-2_02a9a427-baa1-4c60-9d73-cae05294aea0.jpg?v=1753306385`,
  },
];

export function getProduct(handle: string): MockProduct | undefined {
  return products.find((p) => p.handle === handle);
}

export const featured = products.slice(0, 4);
