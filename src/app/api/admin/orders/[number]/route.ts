import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, withRetry } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteMemoryOrder, updateMemoryOrderStatus } from "@/lib/memory-store";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();

  try {
    const { number } = await params;
    const body = (await request.json()) as { status?: string; note?: string };

    if (!body.status && body.note === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updates: Partial<typeof orders.$inferInsert> = {};
    if (body.status) updates.status = body.status;
    if (body.note !== undefined) updates.note = body.note;

    if (db) {
      const updated = await withRetry(() =>
        db!
          .update(orders)
          .set(updates)
          .where(eq(orders.orderNumber, number))
          .returning(),
      );

      if (body.status) {
        updateMemoryOrderStatus(number, body.status);
      }

      if (updated.length > 0) {
        return NextResponse.json({ order: updated[0] });
      }
    }

    if (body.status) {
      const ok = updateMemoryOrderStatus(number, body.status);
      if (ok) return NextResponse.json({ ok: true, status: body.status });
    }

    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  } catch (error) {
    console.error("admin update order error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();

  try {
    const { number } = await params;

    if (db) {
      await withRetry(async () => {
        await db!.delete(orderItems).where(eq(orderItems.orderNumber, number));
        await db!.delete(orders).where(eq(orders.orderNumber, number));
      });
    }

    deleteMemoryOrder(number);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin delete order error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
