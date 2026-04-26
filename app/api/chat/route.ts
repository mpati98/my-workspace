import { InferenceClient } from "@huggingface/inference";
import { NextRequest, NextResponse } from "next/server";

const hfToken = process.env.HF_TOKEN ?? process.env.HF_HUB_TOKEN;
const hf = hfToken ? new InferenceClient(hfToken) : null;

export async function POST(req: NextRequest) {
  try {
    if (!hf) {
      return NextResponse.json(
        { error: "Missing Hugging Face API token" },
        { status: 500 }
      );
    }

    const payload = await req.json();
    const message = payload?.message;
    const history = Array.isArray(payload?.history) ? payload.history : [];

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // Build messages array (OpenAI-compatible format)
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      ...history,
      { role: "user", content: message },
    ];

    const response = await hf.chatCompletion({
      model: "google/gemma-4-31B-it",
      messages,
      max_tokens: 500,
    });

    const reply = response?.choices?.[0]?.message?.content;
    if (!reply || typeof reply !== "string") {
      throw new Error("No reply returned from model");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Chat request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}