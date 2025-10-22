
import { GoogleGenAI, Type, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const generateCaptions = async (imageData: string, mimeType: string): Promise<string[]> => {
  try {
    const imagePart = fileToGenerativePart(imageData, mimeType);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { 
        parts: [
          imagePart,
          { text: "Analyze this image and generate 5 funny, one-line meme captions. The captions should be witty and relevant to the image content." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 5 witty meme captions."
            }
          },
          required: ["captions"]
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.captions || [];

  } catch (error) {
    console.error("Error in generateCaptions:", error);
    throw new Error("Failed to generate captions from Gemini API.");
  }
};

export const editImage = async (imageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const imagePart = fileToGenerativePart(imageData, mimeType);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            return firstPart.inlineData.data;
        }
        
        throw new Error("No image data found in the Gemini API response.");

    } catch(error) {
        console.error("Error in editImage:", error);
        throw new Error("Failed to edit image with Gemini API.");
    }
};

export const analyzeImage = async (imageData: string, mimeType: string): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(imageData, mimeType);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: "Describe this image in detail, focusing on elements that could be funny or interesting for a meme." }] },
    });
    return response.text;
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw new Error("Failed to analyze image with Gemini API.");
  }
};
