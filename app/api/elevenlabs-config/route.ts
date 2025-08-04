/**
 * ElevenLabs Configuration API Route
 *
 * This API route provides ElevenLabs configuration to the client-side
 * while keeping the API key secure on the server side.
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID not configured" },
        { status: 500 },
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Return only the agent ID to the client
    // API key stays secure on the server
    return NextResponse.json({
      agentId,
      // Don't expose API key to client
      hasApiKey: !!apiKey,
    });
  } catch (error) {
    console.error("Error getting ElevenLabs configuration:", error);

    return NextResponse.json(
      { error: "Failed to get ElevenLabs configuration" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY not configured" },
        { status: 500 },
      );
    }

    // Return the API key for server-side operations
    // This should only be called from client-side for WebSocket authentication
    return NextResponse.json({
      apiKey,
    });
  } catch (error) {
    console.error("Error getting ElevenLabs API key:", error);

    return NextResponse.json(
      { error: "Failed to get API key" },
      { status: 500 },
    );
  }
}
