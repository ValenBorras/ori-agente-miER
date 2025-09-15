import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";

const BLOB_PATH = "data/userPrompts.json";

async function readData(): Promise<{ prompts: string[] }> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object" && Array.isArray(data.prompts)) {
          return { prompts: data.prompts as string[] };
        }
      }
    }
  } catch (error) {
    console.error("Error leyendo prompts desde Blob:", error);
  }
  return { prompts: [] };
}

async function writeData(data: { prompts: string[] }): Promise<void> {
  try {
    await put(BLOB_PATH, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    console.error("Error escribiendo prompts a Blob:", error);
    throw error;
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.prompts);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "prompt inválido" }, { status: 400 });
    }
    const data = await readData();
    data.prompts.push(prompt.trim());
    await writeData(data);
    return NextResponse.json({ success: true, prompts: data.prompts });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { index, prompt } = await req.json();
    const i = Number(index);
    if (!Number.isInteger(i)) {
      return NextResponse.json({ error: "index inválido" }, { status: 400 });
    }
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "prompt inválido" }, { status: 400 });
    }
    const data = await readData();
    if (i < 0 || i >= data.prompts.length) {
      return NextResponse.json({ error: "índice fuera de rango" }, { status: 400 });
    }
    data.prompts[i] = prompt.trim();
    await writeData(data);
    return NextResponse.json({ success: true, prompts: data.prompts });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { index } = await req.json();
    const i = Number(index);
    if (!Number.isInteger(i)) {
      return NextResponse.json({ error: "index inválido" }, { status: 400 });
    }
    const data = await readData();
    if (i < 0 || i >= data.prompts.length) {
      return NextResponse.json({ error: "índice fuera de rango" }, { status: 400 });
    }
    data.prompts.splice(i, 1);
    await writeData(data);
    return NextResponse.json({ success: true, prompts: data.prompts });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


