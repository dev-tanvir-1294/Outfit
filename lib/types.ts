export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: WooImage | null;
}

export interface WooProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooProductVariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooProductVariation {
  id: number;
  attributes: WooProductVariationAttribute[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  type: "simple" | "variable" | "grouped" | "external";
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  categories: WooProductCategory[];
  images: WooImage[];
  average_rating: string;
  rating_count: number;
  attributes: WooProductAttribute[];
  variations: number[];
}

export interface WooLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  sku: string;
  price: number;
}

export interface WooBillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  payment_method: string;
  payment_method_title: string;
  customer_id: number;
  customer_note: string;
  billing: WooBillingAddress;
  shipping: WooBillingAddress;
  line_items: WooLineItem[];
}

export interface WooPaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
}
