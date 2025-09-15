import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Falta OPENAI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const messages = (body?.messages ?? []) as { role: "user" | "assistant"; content: string }[];
    const promptId = body?.promptId;
    const vectorStoreId = body?.vectorStoreId;
    // Parse streaming flag robustly (supports boolean and "true"/"false" strings)
    let streamRequested: boolean = false;
    if (typeof body?.stream === "boolean") streamRequested = body.stream;
    else if (typeof body?.stream === "string") streamRequested = body.stream === "true";
    else if (typeof body?.Streaming === "boolean") streamRequested = body.Streaming;
    else if (typeof body?.Streaming === "string") streamRequested = body.Streaming === "true";
    const model: string = typeof body?.model === "string" && body.model.trim() ? body.model.trim() : "gpt-4.1";

    if (!promptId || !vectorStoreId) {
      return NextResponse.json(
        { error: "promptId y vectorStoreId son requeridos" },
        { status: 400 }
      );
    }

    console.log("PromptId recibido:", promptId);
    console.log("VectorStoreId recibido:", vectorStoreId);

    // Leer prompts del cliente desde Vercel Blob y prependerlos como mensajes role:user
    let promptMessages: { role: "user"; content: string }[] = [];
    try {
      const { blobs } = await list({ prefix: "data/userPrompts.json", limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          const fileData = await res.json();
          const userPrompts = Array.isArray(fileData?.prompts) ? fileData.prompts : [];
          promptMessages = userPrompts
            .filter((p: unknown) => typeof p === "string" && p.trim().length > 0)
            .map((p: string) => ({ role: "user" as const, content: p.trim() }));
        }
      }
    } catch (e) {
      console.warn("No se pudieron leer prompts desde Blob:", e);
    }

    const requestBody = {
      model,
      prompt: {
        id: promptId,
      },
      input: [...promptMessages, ...messages],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
        },
      ],
      stream: streamRequested,
    } as const;

    console.log("Body enviado a OpenAI:", JSON.stringify(requestBody, null, 2));

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: streamRequested ? "text/event-stream" : "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!upstream.ok || !upstream.body) {
      let errorPayload: any = undefined;
      try {
        errorPayload = await upstream.json();
      } catch {
        try {
          const txt = await upstream.text();
          errorPayload = { error: { message: txt } };
        } catch {}
      }
      console.error("Error de OpenAI Responses:", errorPayload);
      return NextResponse.json(
        { error: errorPayload?.error?.message ?? "Error de OpenAI" },
        { status: upstream.status || 500 }
      );
    }

    // If not streaming, just return JSON with consolidated text
    if (!streamRequested) {
      const data = await upstream.json();
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
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstream.body.getReader();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Procesar eventos SSE completos separados por doble salto de línea
            let eventBoundaryIndex = buffer.indexOf("\n\n");
            while (eventBoundaryIndex !== -1) {
              const rawEvent = buffer.slice(0, eventBoundaryIndex);
              buffer = buffer.slice(eventBoundaryIndex + 2);

              let eventType = "";
              const dataLines: string[] = [];
              for (const line of rawEvent.split("\n")) {
                if (line.startsWith("event:")) eventType = line.slice(6).trim();
                else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
              }
              const dataStr = dataLines.join("\n");

              if (eventType === "response.output_text.delta") {
                try {
                  const parsed = JSON.parse(dataStr);
                  const delta = parsed?.delta ?? parsed?.text ?? "";
                  if (typeof delta === "string" && delta.length > 0) {
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // Ignorar frames malformados
                }
              } else if (eventType === "error") {
                // Propagar error hacia el cliente y cortar
                try {
                  const parsed = JSON.parse(dataStr);
                  const message = parsed?.error?.message ?? dataStr;
                  controller.enqueue(encoder.encode(`\n[error]: ${message}`));
                } catch {
                  controller.enqueue(encoder.encode(`\n[error]: ${dataStr}`));
                }
                controller.close();
                return;
              }

              eventBoundaryIndex = buffer.indexOf("\n\n");
            }
          }
        } catch (err) {
          controller.error(err);
          return;
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Error con OpenAI Responses:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}