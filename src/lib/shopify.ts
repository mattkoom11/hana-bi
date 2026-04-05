/**
 * Shopify Storefront API Client
 *
 * This module provides a typed GraphQL client for Shopify Storefront API.
 *
 * Setup:
 * 1. Add to .env.local:
 *    - SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *    - SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
 *    - SHOPIFY_API_VERSION=2025-01 (optional, defaults to 2025-01)
 *
 * 2. Get your Storefront API token from:
 *    Shopify Admin → Settings → Apps and sales channels → Develop apps → Storefront API
 */

import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_API_VERSION,
} from "@/lib/env";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn(
    "Shopify credentials not found. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local"
  );
}

const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

interface ShopifyError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}

interface ShopifyResponse<T> {
  data?: T;
  errors?: ShopifyError[];
}

/**
 * Generic GraphQL fetch function for Shopify Storefront API
 *
 * @throws {Error} If the response contains errors or network fails
 */
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Shopify credentials not configured. Check your .env.local file."
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      // Next.js will cache by default, but we can control it per-request
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const json: ShopifyResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      const errorMessages = json.errors.map((e) => e.message).join(", ");
      throw new Error(`Shopify GraphQL errors: ${errorMessages}`);
    }

    if (!json.data) {
      throw new Error("Shopify API returned no data");
    }

    return json.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unknown error fetching from Shopify: ${String(error)}`);
  }
}

// ============================================================================
// TypeScript Types for Shopify GraphQL Responses
// ============================================================================

export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image: ShopifyImage | null;
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  // Metafields (customize these based on your Shopify metafield definitions)
  metafields?: {
    edges: Array<{
      node: {
        namespace: string;
        key: string;
        value: string;
      };
    }>;
  };
  // Collections this product belongs to
  collections?: {
    edges: Array<{
      node: {
        handle: string;
        title: string;
      };
    }>;
  };
}

export interface ShopifyProductConnection {
  products: {
    edges: Array<{
      node: ShopifyProductNode;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

export interface ShopifyProductResponse {
  product: ShopifyProductNode | null;
}

export interface ShopifyCheckoutCreateResponse {
  checkoutCreate: {
    checkout: {
      id: string;
      webUrl: string;
    } | null;
    checkoutUserErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

// ============================================================================
// GraphQL Queries
// ============================================================================

const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
    tags
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    metafields(identifiers: [
      {namespace: "hana_bi", key: "story"},
      {namespace: "hana_bi", key: "materials"},
      {namespace: "hana_bi", key: "care"},
      {namespace: "hana_bi", key: "year"},
      {namespace: "hana_bi", key: "notes"},
      {namespace: "hana_bi", key: "collection"},
      {namespace: "hana_bi", key: "status"}
    ]) {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
    collections(first: 5) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

/**
 * Fetch all products from Shopify
 *
 * Note: This fetches the first 250 products. For pagination, extend with cursor-based pagination.
 * Customize the query to filter by collection, tags, or availability as needed.
 */
export async function getAllProducts(): Promise<ShopifyProductNode[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetAllProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ products: ShopifyProductConnection["products"] }>(
    query,
    { first: 250 }
  );

  return data.products.edges.map((edge) => edge.node);
}

/**
 * Fetch products from a specific collection
 *
 * @param collectionHandle - The handle (slug) of the collection, e.g. "featured" or "archive"
 */
export async function getCollectionProducts(
  collectionHandle: string
): Promise<ShopifyProductNode[]> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetCollectionProducts($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first) {
          edges {
            node {
              ...ProductFragment
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    collection: {
      products: ShopifyProductConnection["products"];
    } | null;
  }>(query, { handle: collectionHandle, first: 250 });

  if (!data.collection) {
    return [];
  }

  return data.collection.products.edges.map((edge) => edge.node);
}

/**
 * Fetch a single product by handle (slug)
 */
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProductNode | null> {
  const query = `
    ${PRODUCT_FRAGMENT}
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        ...ProductFragment
      }
    }
  `;

  const data = await shopifyFetch<ShopifyProductResponse>(query, { handle });

  return data.product;
}

/**
 * Create a Shopify checkout with line items
 *
 * @param lineItems - Array of { variantId, quantity }
 * @returns Checkout URL to redirect the user to
 */
export async function createCheckout(
  lineItems: Array<{ variantId: string; quantity: number }>
): Promise<string> {
  const query = `
    mutation CheckoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<ShopifyCheckoutCreateResponse>(query, {
    input: {
      lineItems,
    },
  });

  if (data.checkoutCreate.checkoutUserErrors.length > 0) {
    const errors = data.checkoutCreate.checkoutUserErrors
      .map((e) => e.message)
      .join(", ");
    throw new Error(`Checkout creation failed: ${errors}`);
  }

  if (!data.checkoutCreate.checkout?.webUrl) {
    throw new Error("Checkout created but no webUrl returned");
  }

  return data.checkoutCreate.checkout.webUrl;
}
