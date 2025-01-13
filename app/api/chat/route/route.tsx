import { NextResponse } from 'next/server';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const userMessage = messages[messages.length - 1]?.content || '';

    // Prepare the body for the API request
    const requestBody = {
      prompt: {
        text: `You are a network design assistant. The user is asking about network requirements. 
               Current conversation: ${JSON.stringify(messages.slice(0, -1))}. 
               User's latest message: ${userMessage}. 
               Provide a helpful response to guide the user in specifying their network requirements.`,
      },
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is not OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response JSON
    const data = await response.json();

    // Check for valid response content
    if (data.candidates && data.candidates[0] && data.candidates[0].text) {
      return NextResponse.json({ content: data.candidates[0].text });
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', (error as Error).message);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
