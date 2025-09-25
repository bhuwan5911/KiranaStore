import { GoogleGenAI } from "@google/genai";

// IMPORTANT: In a real application, the API key should be handled securely
// and not be hardcoded. It is assumed that process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({apiKey: API_KEY});

const checkApiKey = () => {
    if (!API_KEY) {
        return "AI features are currently unavailable. API key is missing.";
    }
    return null;
}

export const generateRecipe = async (productName: string): Promise<string> => {
    const apiKeyError = checkApiKey();
    if (apiKeyError) return apiKeyError;

    try {
        const prompt = `Provide a simple and delicious recipe idea using ${productName}. The recipe should be easy to follow for a home cook. Format the response as markdown with headings for ingredients and instructions.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating recipe:", error);
        return "Sorry, I couldn't come up with a recipe right now. Please try again later.";
    }
};
