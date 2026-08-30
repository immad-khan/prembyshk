import { CATEGORY_SEED, PRODUCT_SEED } from "@/db/seed";
import type { Category, Product, Review } from "@/db/schema";

type MemoryUpload = {
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  dataBase64: string;
  createdAt: Date;
};

const globalForStore = globalThis as typeof globalThis & {
  __memoryStore?: {
    products: Product[];
    categories: Category[];
    reviews: Review[];
    uploads: MemoryUpload[];
    nextId: number;
    nextUploadId: number;
  };
};

function getStore() {
  if (!globalForStore.__memoryStore) {
    let currentId = 1;
    const initialCategories: Category[] = CATEGORY_SEED.map((c, i) => ({
      id: i + 1,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      imageUrl: c.imageUrl,
      sortOrder: c.sortOrder,
    }));

    const initialProducts: Product[] = PRODUCT_SEED.map((p) => ({
      id: currentId++,
      slug: p.slug,
      name: p.name,
      categorySlug: p.categorySlug,
      categorySlugs: p.categorySlugs ?? [p.categorySlug],
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      shortDescription: p.shortDescription,
      description: p.description,
      material: p.material,
      images: p.images,
      colors: p.colors,
      details: p.details,
      rating: p.rating,
      reviewCount: p.reviewCount,
      badge: p.badge ?? null,
      isBestSeller: Boolean(p.isBestSeller),
      isNew: Boolean(p.isNew),
      stock: 24,
      createdAt: new Date(),
    }));

    globalForStore.__memoryStore = {
      products: initialProducts,
      categories: initialCategories,
      reviews: [],
      uploads: [],
      nextId: currentId,
      nextUploadId: 1,
    };
  }

  return globalForStore.__memoryStore;
}

export function getMemoryProducts(): Product[] {
  return getStore().products;
}

export function getMemoryProductBySlug(slug: string): Product | null {
  return getStore().products.find((p) => p.slug === slug) ?? null;
}

export function getMemoryCategories(): Category[] {
  return getStore().categories;
}

export function addMemoryProduct(data: Omit<Product, "id" | "createdAt">): Product {
  const store = getStore();
  const newProduct: Product = {
    ...data,
    id: store.nextId++,
    createdAt: new Date(),
  };
  store.products.unshift(newProduct);
  return newProduct;
}

export function updateMemoryProduct(id: number, data: Partial<Product>): Product | null {
  const store = getStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  store.products[index] = {
    ...store.products[index],
    ...data,
  };
  return store.products[index];
}

export function deleteMemoryProduct(id: number): boolean {
  const store = getStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  store.products.splice(index, 1);
  return true;
}

export function addMemoryUpload(payload: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  dataBase64: string;
}): MemoryUpload {
  const store = getStore();
  const upload: MemoryUpload = {
    id: store.nextUploadId++,
    originalName: payload.originalName,
    mimeType: payload.mimeType,
    sizeBytes: payload.sizeBytes,
    dataBase64: payload.dataBase64,
    createdAt: new Date(),
  };
  store.uploads.push(upload);
  return upload;
}

export function getMemoryUpload(id: number): MemoryUpload | null {
  const store = getStore();
  return store.uploads.find((u) => u.id === id) ?? null;
}
