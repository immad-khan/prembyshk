import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addMemoryUpload, getMemoryUpload } from "@/lib/memory-store";

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
      return NextResponse.json({ error: "Image data is required." }, { status: 400 });
    }

    const mime = body.mimeType ?? "image/jpeg";
    const sizeBytes = Math.round((body.dataBase64.length * 3) / 4);

    if (!ALLOWED_TYPES.has(mime)) {
      return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed." }, { status: 415 });
    }
    if (sizeBytes > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 413 });
    }

    if (db) {
      try {
        const inserted = await db
          .insert(uploads)
          .values({ originalName: body.fileName ?? "upload", mimeType: mime, sizeBytes, dataBase64: body.dataBase64 })
          .returning();
        const url = `/api/admin/uploads/${inserted[0].id}`;
        return NextResponse.json({ url, id: inserted[0].id });
      } catch {
        // fall through to memory
      }
    }

    const mem = addMemoryUpload({
      originalName: body.fileName ?? "upload",
      mimeType: mime,
      sizeBytes,
      dataBase64: body.dataBase64,
    });
    return NextResponse.json({ url: `/api/admin/uploads/${mem.id}`, id: mem.id });
  } catch (error) {
    console.error("upload error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    let mimeType = "";
    let dataBase64 = "";

    if (db) {
      try {
        const rows = await db.select().from(uploads).where(eq(uploads.id, idNum));
        if (rows[0]) { mimeType = rows[0].mimeType; dataBase64 = rows[0].dataBase64; }
      } catch { /* fall through */ }
    }

    if (!dataBase64) {
      const mem = getMemoryUpload(idNum);
      if (mem) { mimeType = mem.mimeType; dataBase64 = mem.dataBase64; }
    }

    if (!dataBase64) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const buffer = Buffer.from(dataBase64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType || "image/jpeg",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
