import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Gemini API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build system prompt for network design assistant
    const systemPrompt = `You are an expert Network Design Assistant. Your role is to help users design robust, scalable, and secure network infrastructure for SMEs and enterprises.

When helping users:
1. Ask clarifying questions about their requirements (company size, budget, users, office locations, etc.)
2. Provide specific device recommendations with realistic costs
3. Consider redundancy, security, and scalability in your designs
4. Estimate costs and suggest budget allocation (core infrastructure 35%, security 25%, wireless 20%, redundancy 20%)
5. Suggest best practices for their specific scenario
6. Provide network topology recommendations
7. Help with IP allocation strategies

Example device recommendations by category:
- Core Switches: Cisco Catalyst 9200, Dell PowerConnect, Arista CloudVision
- Security: Fortinet FortiGate, Cisco ASA, Palo Alto Networks
- Wireless: Cisco Aironet, Ubiquiti UniFi, TP-Link EAP series
- Routers: Cisco ISR, Juniper SRX, Fortinet FortiRouter

Always be professional, technical yet accessible, and provide actionable recommendations with cost estimates.`;

    // Convert messages to Gemini format
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Get Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Start a chat session
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // All messages except the last
    });

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage.content;

    // Create a readable stream for streaming response
    const encoder = new TextEncoder();
    let assistantContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Call the API with streaming
          const stream = await chat.sendMessageStream(userInput);

          for await (const chunk of stream.stream) {
            const text = chunk.text();
            assistantContent += text;

            // Send each chunk as SSE
            const data = {
              type: "text-delta",
              delta: text,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          }

          // Send completion message
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text-finish", finishReason: "stop" })}\n\n`
            )
          );

          // Save the conversation to database if conversationId is provided
          if (conversationId) {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // Save user message
                await supabase.from("chat_messages").insert([
                  {
                    conversation_id: conversationId,
                    user_id: user.id,
                    role: "user",
                    content: userInput,
                  },
                ]);

                // Save assistant message
                await supabase.from("chat_messages").insert([
                  {
                    conversation_id: conversationId,
                    user_id: user.id,
                    role: "assistant",
                    content: assistantContent,
                  },
                ]);
              }
            } catch (dbError) {
              console.error("Error saving to database:", dbError);
              // Continue even if database save fails
            }
          }

          controller.close();
        } catch (error) {
          console.error("Error in chat stream:", error);
          const errorData = {
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unknown error occurred",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
