import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {

    try {

        const { message } = await req.json();

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
        });

        return Response.json({
            reply: response.text
        });

    } catch (err) {

        return Response.json({
            error: err.message
        }, {
            status:500
        });

    }

}