export type MemoryOrderItem = {
  id: number;
  orderNumber: string;
  productSlug: string;
  name: string;
  variant: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

export type MemoryOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  note: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: Date;
  items?: MemoryOrderItem[];
};

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
    uploads: MemoryUpload[];
    nextUploadId: number;
    orders: MemoryOrder[];
    orderItems: MemoryOrderItem[];
    nextOrderId: number;
    nextOrderItemId: number;
  };
};

function getStore() {
  if (!globalForStore.__memoryStore) {
    globalForStore.__memoryStore = {
      uploads: [],
      nextUploadId: 1,
      orders: [],
      orderItems: [],
      nextOrderId: 1,
      nextOrderItemId: 1,
    };
  }

  return globalForStore.__memoryStore;
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

export function addMemoryOrder(
  order: Omit<MemoryOrder, "id" | "createdAt" | "items">,
  items: Omit<MemoryOrderItem, "id">[],
): MemoryOrder {
  const store = getStore();
  const created: MemoryOrder = {
    ...order,
    id: store.nextOrderId++,
    createdAt: new Date(),
  };
  store.orders.unshift(created);

  for (const item of items) {
    store.orderItems.push({
      ...item,
      id: store.nextOrderItemId++,
      orderNumber: order.orderNumber,
    });
  }

  return {
    ...created,
    items: store.orderItems.filter((i) => i.orderNumber === order.orderNumber),
  };
}

export function getMemoryOrders(): (MemoryOrder & { items: MemoryOrderItem[] })[] {
  const store = getStore();
  return store.orders.map((order) => ({
    ...order,
    items: store.orderItems.filter((i) => i.orderNumber === order.orderNumber),
  }));
}

export function getMemoryOrderByNumber(orderNumber: string): (MemoryOrder & { items: MemoryOrderItem[] }) | null {
  const store = getStore();
  const order = store.orders.find((o) => o.orderNumber === orderNumber);
  if (!order) return null;
  return {
    ...order,
    items: store.orderItems.filter((i) => i.orderNumber === orderNumber),
  };
}

export function updateMemoryOrderStatus(orderNumber: string, status: string): boolean {
  const store = getStore();
  const order = store.orders.find((o) => o.orderNumber === orderNumber);
  if (!order) return false;
  order.status = status;
  return true;
}

export function deleteMemoryOrder(orderNumber: string): boolean {
  const store = getStore();
  const initialLength = store.orders.length;
  store.orders = store.orders.filter((o) => o.orderNumber !== orderNumber);
  store.orderItems = store.orderItems.filter((i) => i.orderNumber !== orderNumber);
  return store.orders.length < initialLength;
}