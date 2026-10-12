import { fetchWooProductImage } from "@/lib/woocommerce";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("url");
  if (!src || src.length > 4096) {
    return Response.json(
      { error: "A valid product image URL is required" },
      { status: 400 }
    );
  }

  try {
    const image = await fetchWooProductImage(src);
    const headers = new Headers({
      "Content-Type": image.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    });
    const contentLength = image.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new Response(image.body, { headers });
  } catch (error) {
    console.error("Failed to load WooCommerce product image", error);
    return Response.json(
      { error: "Unable to load product image" },
      { status: 502 }
    );
  }
}
