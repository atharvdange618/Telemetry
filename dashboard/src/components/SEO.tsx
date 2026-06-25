import React, { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonicalPath?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogType = "website",
  ogImage = "/og-image.png",
  canonicalPath,
  schema,
  noindex = false,
}) => {
  useEffect(() => {
    const formattedTitle = title.includes("Telemetry")
      ? title
      : `${title} | Telemetry`;
    document.title = formattedTitle;

    const setMetaTag = (
      attrName: string,
      attrValue: string,
      content: string,
    ) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMetaTag("name", "description", description);

    if (noindex) {
      setMetaTag("name", "robots", "noindex, nofollow");
    } else {
      setMetaTag("name", "robots", "index, follow");
    }

    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    } else {
      const existingKeywords = document.querySelector('meta[name="keywords"]');
      if (existingKeywords) {
        existingKeywords.remove();
      }
    }

    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);

    const absoluteOgImage = ogImage.startsWith("http")
      ? ogImage
      : `${window.location.origin}${ogImage}`;
    setMetaTag("property", "og:image", absoluteOgImage);

    const currentUrl = canonicalPath
      ? `${window.location.origin}${canonicalPath}`
      : window.location.href;
    setMetaTag("property", "og:url", currentUrl);

    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", absoluteOgImage);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", currentUrl);

    const existingSchema = document.getElementById("seo-schema");
    if (existingSchema) {
      existingSchema.remove();
    }

    if (schema) {
      const script = document.createElement("script");
      script.id = "seo-schema";
      script.type = "application/ld+json";
      script.innerHTML = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const cleanupSchema = document.getElementById("seo-schema");
      if (cleanupSchema) {
        cleanupSchema.remove();
      }
    };
  }, [
    title,
    description,
    keywords,
    ogType,
    ogImage,
    canonicalPath,
    schema,
    noindex,
  ]);

  return null;
};
