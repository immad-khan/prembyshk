import { NextResponse } from "next/server";
import { desc, inArray } from "drizzle-orm";
import { db, withRetry } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMemoryOrders } from "@/lib/memory-store";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export type AdminOrderWithItems = typeof orders.$inferSelect & {
  items: (typeof orderItems.$inferSelect)[];
};

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();

  try {
    if (db) {
      const allOrders = await withRetry(() =>
        db!.select().from(orders).orderBy(desc(orders.createdAt)),
      );

      const orderNumbers = allOrders.map((o) => o.orderNumber);
      let allItems: (typeof orderItems.$inferSelect)[] = [];

      if (orderNumbers.length > 0) {
        allItems = await withRetry(() =>
          db!
            .select()
            .from(orderItems)
            .where(inArray(orderItems.orderNumber, orderNumbers)),
        );
      }

      const itemsByOrder = new Map<string, typeof allItems>();
      for (const item of allItems) {
        const list = itemsByOrder.get(item.orderNumber) || [];
        list.push(item);
        itemsByOrder.set(item.orderNumber, list);
      }

      const mergedDbOrders: AdminOrderWithItems[] = allOrders.map((o) => ({
        ...o,
        items: itemsByOrder.get(o.orderNumber) || [],
      }));

      // Also merge any memory orders that may not be in DB yet
      const memOrders = getMemoryOrders();
      const existingNumbers = new Set(mergedDbOrders.map((o) => o.orderNumber));
      const extraMemOrders: AdminOrderWithItems[] = memOrders
        .filter((mo) => !existingNumbers.has(mo.orderNumber))
        .map((mo) => ({
          id: mo.id,
          orderNumber: mo.orderNumber,
          customerName: mo.customerName,
          email: mo.email,
          phone: mo.phone,
          address: mo.address,
          city: mo.city,
          postalCode: mo.postalCode,
          country: mo.country,
          note: mo.note,
          subtotal: mo.subtotal,
          shipping: mo.shipping,
          total: mo.total,
          status: mo.status,
          createdAt: mo.createdAt,
          items: (mo.items || []).map((it) => ({
            id: it.id,
            orderNumber: it.orderNumber,
            productSlug: it.productSlug,
            name: it.name,
            variant: it.variant,
            image: it.image,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
          })),
        }));

      return NextResponse.json({
        orders: [...mergedDbOrders, ...extraMemOrders],
      });
    }

    // DB not available: return memory orders
    const memOrders = getMemoryOrders();
    return NextResponse.json({
      orders: memOrders.map((mo) => ({
        id: mo.id,
        orderNumber: mo.orderNumber,
        customerName: mo.customerName,
        email: mo.email,
        phone: mo.phone,
        address: mo.address,
        city: mo.city,
        postalCode: mo.postalCode,
        country: mo.country,
        note: mo.note,
        subtotal: mo.subtotal,
        shipping: mo.shipping,
        total: mo.total,
        status: mo.status,
        createdAt: mo.createdAt,
        items: mo.items || [],
      })),
    });
  } catch (error) {
    console.error("admin get orders error", error);
    // fallback to memory
    const memOrders = getMemoryOrders();
    return NextResponse.json({ orders: memOrders });
  }
}
