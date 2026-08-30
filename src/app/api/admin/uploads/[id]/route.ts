import { NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, idNum));

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = Buffer.from(row.dataBase64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": row.mimeType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
