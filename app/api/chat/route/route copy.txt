import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    // Parse incoming messages
    const { messages } = await req.json();

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || '';

    // Select the model and configure generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256
      }
    });

    // Prepare chat history
    const chatHistory = messages.map((msg: any) => {
      // Map roles to match Gemini API expectations
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });

    // Ensure the first message is from the user
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      // If the first message is not from the user, prepend an initial user message
      chatHistory.unshift({
        role: 'user',
        parts: [{ text: 'Hello, I need help with network design.' }]
      });
    }

    // Start a chat session with corrected history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256
      }
    });

    // Send the latest user message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Return the generated text
    return NextResponse.json({ content: text });

  } catch (error: unknown) {
    // Proper error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error calling Gemini API:', errorMessage);
    
    return NextResponse.json({ 
      error: 'Failed to generate response', 
      details: errorMessage 
    }, { status: 500 });
  }
}