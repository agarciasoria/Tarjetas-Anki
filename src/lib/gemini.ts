import { GoogleGenAI, Type } from "@google/genai";

export interface AnkiCardData {
  frances: string;
  ipa: string;
  espanol: string;
  ingles: string;
  ejemplo: string;
  aclaracion: string;
}

// Ahora pasamos la API key como parámetro
export async function generateAnkiCard(word: string, apiKey: string): Promise<AnkiCardData> {
  // Inicializamos el cliente en el momento de la petición con la key que recibe
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera datos para una tarjeta de Anki de la palabra "${word}". La palabra puede estar en español, inglés o francés.`,
    config: {
      systemInstruction: `You are an expert French teacher. Your task is to generate data for an Anki flashcard.
You will receive a word in Spanish, English, or French. 
Return a JSON object with the exact following fields:
- frances: The French translation or the word itself if it's already in French. Capitalize the first letter.
- ipa: The International Phonetic Alphabet (IPA) pronunciation for the French word. Return the raw IPA string (e.g. aɡʁikyltˈyʁ).
- espanol: The Spanish translation. Capitalize the first letter.
- ingles: The English translation. Capitalize the first letter.
- ejemplo: A cohesive French example sentence using the word, followed by its Spanish translation in parentheses. Example: "L'agriculture est essentielle (La agricultura es esencial)"
- aclaracion: A short clarification or definition in Spanish explaining the context or meaning of the word.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          frances: { type: Type.STRING },
          ipa: { type: Type.STRING },
          espanol: { type: Type.STRING },
          ingles: { type: Type.STRING },
          ejemplo: { type: Type.STRING },
          aclaracion: { type: Type.STRING },
        },
        required: ["frances", "ipa", "espanol", "ingles", "ejemplo", "aclaracion"],
      },
    },
  });

  if (!response.text) {
      throw new Error("No response from AI model.");
  }

  return JSON.parse(response.text.trim());
}
