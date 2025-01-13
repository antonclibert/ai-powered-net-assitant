import { NextResponse } from "next/server";

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const userMessage = messages[messages.length - 1]?.content || "";

    // Update context: Remove the first question (answered question)
    const updatedQuestions = context.questions.slice(1);

    // Build the prompt for the Gemini API
    const systemPrompt = `
      You are a network design assistant helping non-technical users. 
      The user is answering questions to help design their network. 
      Your role is to:
      - Provide guidance based on the collected information so far.
      - Avoid repeating questions already answered.
      - Ask the next pending question or summarize collected data if all questions are answered.

      CURRENT COLLECTED INFORMATION: ${JSON.stringify(context.collectedInfo)}
      PENDING QUESTIONS: ${JSON.stringify(updatedQuestions)}
      LATEST USER MESSAGE: ${userMessage}

      RESPONSE STRATEGY:
      - If there are pending questions, ask the next one.
      - If all questions are answered, provide a clear, non-technical summary and recommendations.
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      },
    };

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      // Update collected information if necessary
      const updatedContext = {
        ...context,
        questions: updatedQuestions,
        stage: updatedQuestions.length === 0 ? "recommending" : "gathering",
      };

      // Return the assistant's response and the updated context
      return NextResponse.json({
        content: data.candidates[0].content.parts[0].text,
        context: updatedContext,
      });
    } else {
      throw new Error("Invalid response from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", (error as Error).message);
    return NextResponse.json(
      { error: "Failed to generate response", details: (error as Error).message },
      { status: 500 }
    );

  }
}
