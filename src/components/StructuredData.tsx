/**
 * Structured Data Component (Server Component)
 * Injects WebApplication schema.org JSON-LD for SEO
 */

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Sales Lead Qualifier",
    description:
      "Qualify sales leads with the BANT framework. Determine if a prospect is the right fit for your business using automated qualification scoring.",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    url: process.env.NEXT_PUBLIC_APP_URL || "https://slt.example.com",
    image: `${process.env.NEXT_PUBLIC_APP_URL || "https://slt.example.com"}/og-image.png`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
