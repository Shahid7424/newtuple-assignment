import { NextRequest } from "next/server";

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  message: string;
  history?: Message[];
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Type-safe parsing
        const body: RequestBody = await req.json();
        const { message, history } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");

        // Build prompt
        let prompt = "";
        if (Array.isArray(history)) {
          prompt += "Previous conversation:\n";
          history.forEach((m) => {
            const role = m.role === "user" ? "User" : "Assistant";
            prompt += `${role}: ${m.content}\n`;
          });
        }
        prompt += `\nUser: ${message}\nAssistant:`;

        // Gemini endpoint
        const modelName = "gemini-2.0-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        // Stream SSE chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            const data = line.slice(6); // remove 'data: '

            if (data === "[DONE]") continue;

            try {
              const json: GeminiResponse = JSON.parse(data);
              const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            } catch {
              continue;
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ text: "Error: " + errorMessage })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
