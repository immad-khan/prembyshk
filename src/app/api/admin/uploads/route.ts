import { NextResponse } from "next/server";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addMemoryUpload } from "@/lib/memory-store";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as {
      fileName?: string;
      mimeType?: string;
      dataBase64?: string;
    };

    if (!body.dataBase64) {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 },
      );
    }

    const mime = body.mimeType ?? "image/jpeg";
    const sizeBytes = Math.round((body.dataBase64.length * 3) / 4);
    if (!ALLOWED_TYPES.has(mime)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP images are allowed." },
        { status: 415 },
      );
    }
    if (sizeBytes > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 5 MB." },
        { status: 413 },
      );
    }

    try {
      const inserted = await db
        .insert(uploads)
        .values({
          originalName: body.fileName ?? "upload",
          mimeType: mime,
          sizeBytes,
          dataBase64: body.dataBase64,
        })
        .returning();

      const url = `/api/admin/uploads/${inserted[0].id}`;
      return NextResponse.json({ url, id: inserted[0].id });
    } catch {
      const memoryItem = addMemoryUpload({
        originalName: body.fileName ?? "upload",
        mimeType: mime,
        sizeBytes,
        dataBase64: body.dataBase64,
      });

      const url = `/api/admin/uploads/${memoryItem.id}`;
      return NextResponse.json({ url, id: memoryItem.id });
    }
  } catch (error) {
    console.error("upload error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
