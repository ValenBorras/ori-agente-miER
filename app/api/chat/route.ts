import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Falta OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const messages = (body?.messages ?? []) as { role: "user" | "assistant"; content: string }[];
    const promptId = typeof body?.promptId === "string" && body.promptId.length > 0
      ? body.promptId
      : "pmpt_68c08415be248196bbac0c2d47fd275f0b113e42284663e1";
    const vectorStoreId = typeof body?.vectorStoreId === "string" && body.vectorStoreId.length > 0
      ? body.vectorStoreId
      : "vs_68c07fd04c348191ab3e91538baf73ef";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5",
        prompt: {
          id: promptId,
        },
        instructions:
          "Format all outputs in Markdown with clear headings, bold for key terms, bullet lists with proper indentation, and fenced code blocks for code. Keep answers concise unless the user requests detail.",
        input: messages,
        tools: [
          {
            type: "file_search",
            vector_store_ids: [vectorStoreId],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de OpenAI Responses:", data);
      return NextResponse.json(
        { error: (data as any)?.error?.message ?? "Error de OpenAI" },
        { status: response.status }
      );
    }
    console.log("Respuesta OpenAI Responses:", JSON.stringify(data, null, 2));

    // Agregar texto de salida del modelo de forma segura
    let reply = "";
    if (typeof data.output_text === "string" && data.output_text.length > 0) {
      reply = data.output_text;
    } else if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item?.type === "message" && item?.role === "assistant" && Array.isArray(item?.content)) {
          for (const part of item.content) {
            if (part?.type === "output_text" && typeof part?.text === "string") {
              reply += part.text;
            }
          }
        }
      }
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error con OpenAI Responses:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}