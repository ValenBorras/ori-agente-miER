import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Falta OPENAI_API_KEY" }, { status: 500 });
    }

    const formData = await req.formData();
    const filePart = formData.get("file");

    if (!filePart || typeof (filePart as any).arrayBuffer !== "function") {
      return NextResponse.json({ error: "Archivo no provisto" }, { status: 400 });
    }

    const filename = (filePart as any)?.name ?? "recording.webm";
    const fd = new FormData();
    fd.append("file", filePart as Blob, filename);
    // Prefer a modern model if available; fallback whisper-1
    fd.append("model", "gpt-4o-mini-transcribe");

    const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: fd,
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("Error de OpenAI Transcriptions:", data);
      return NextResponse.json(
        { error: (data as any)?.error?.message ?? "Error de OpenAI" },
        { status: openaiRes.status }
      );
    }

    const text = (data as any)?.text ?? "";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error transcribiendo:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}


