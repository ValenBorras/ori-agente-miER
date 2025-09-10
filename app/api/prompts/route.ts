import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "userPrompts.json");

function ensureFile() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({ prompts: [] }, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("No se pudo asegurar el archivo de prompts:", error);
  }
}

function readData(): { prompts: string[] } {
  ensureFile();
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !Array.isArray(data.prompts)) {
      return { prompts: [] };
    }
    return { prompts: data.prompts as string[] };
  } catch (error) {
    console.error("Error leyendo prompts:", error);
    return { prompts: [] };
  }
}

function writeData(data: { prompts: string[] }) {
  ensureFile();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error escribiendo prompts:", error);
  }
}

export async function GET() {
  const data = readData();
  return NextResponse.json(data.prompts);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "prompt inválido" }, { status: 400 });
    }
    const data = readData();
    data.prompts.push(prompt.trim());
    writeData(data);
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
    const data = readData();
    if (i < 0 || i >= data.prompts.length) {
      return NextResponse.json({ error: "índice fuera de rango" }, { status: 400 });
    }
    data.prompts[i] = prompt.trim();
    writeData(data);
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
    const data = readData();
    if (i < 0 || i >= data.prompts.length) {
      return NextResponse.json({ error: "índice fuera de rango" }, { status: 400 });
    }
    data.prompts.splice(i, 1);
    writeData(data);
    return NextResponse.json({ success: true, prompts: data.prompts });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


