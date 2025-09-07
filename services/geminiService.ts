
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';
import { GEMINI_MODEL } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock barcode database lookup
export const MOCK_BARCODE_LOOKUP: Record<string, {name: string, label: string}> = {
    '012345678905': {
        name: 'Organic Tomato & Basil Pasta Sauce',
        label: `Ingredients: Organic Diced Tomatoes, Organic Tomato Puree, Organic Basil, Organic Onions, Organic Extra Virgin Olive Oil, Organic Garlic, Sea Salt, Organic Black Pepper. Nutrition Facts: Serving Size 1/2 cup (125g), Calories 70, Total Fat 2.5g (3% DV), Saturated Fat 0g, Trans Fat 0g, Cholesterol 0mg, Sodium 480mg (21% DV), Total Carbohydrate 10g (4% DV), Dietary Fiber 2g (7% DV), Total Sugars 7g (Includes 0g Added Sugars), Protein 2g.`
    },
    '5449000054227': {
        name: 'Crispy Salted Potato Chips',
        label: `Ingredients: Potatoes, Vegetable Oil (Sunflower, Corn, and/or Canola Oil), Salt. Nutrition Facts: Serving Size 1 oz (28g / about 15 chips), Calories 160, Total Fat 10g (13% DV), Saturated Fat 1.5g (8% DV), Trans Fat 0g, Polyunsaturated Fat 6g, Monounsaturated Fat 2.5g, Cholesterol 0mg, Sodium 170mg (7% DV), Total Carbohydrate 15g (5% DV), Dietary Fiber 1g (4% DV), Total Sugars <1g, Protein 2g.`
    }
};


const responseSchema: any = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: "The product's name, if identifiable." },
        normalizedData: {
            type: Type.OBJECT,
            properties: {
                servingSize: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                nutrients: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            amount: { type: Type.STRING },
                            dailyValue: { type: Type.STRING, nullable: true },
                        },
                        required: ["name", "amount"]
                    },
                },
            },
            required: ["servingSize", "calories", "ingredients", "nutrients"]
        },
        missingInfo: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of important missing information, like serving size or key nutrients."
        },
        healthScore: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "A score from 0-100, where 100 is healthiest." },
                band: { type: Type.STRING, enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'] },
                drivers: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['positive', 'negative'] },
                            explanation: { type: Type.STRING, description: "A plain-language reason for the score." },
                        },
                        required: ["type", "explanation"]
                    },
                },
            },
            required: ["score", "band", "drivers"]
        },
        evidencePanel: {
            type: Type.OBJECT,
            properties: {
                rules: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rule: { type: Type.STRING, description: "The specific rule/threshold checked, e.g., 'Sodium > 480mg per serving'." },
                            status: { type: Type.STRING, enum: ['fired', 'not_fired', 'not_applicable'] },
                            value: { type: Type.STRING, description: "The actual value found in the product label." }
                        },
                         required: ["rule", "status", "value"]
                    },
                },
                sources: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Name of the source, e.g., 'FDA Daily Value Reference'." },
                            url: { type: Type.STRING, nullable: true },
                        },
                        required: ["name"]
                    },
                },
            },
            required: ["rules", "sources"]
        },
        healthSuggestions: {
            type: Type.ARRAY,
            description: "A list of 2-3 healthier alternatives or recipe modifications.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, catchy title for the suggestion." },
                    description: { type: Type.STRING, description: "A detailed explanation of the healthier alternative or modification." }
                },
                required: ["title", "description"]
            }
        }
    },
    required: ["normalizedData", "missingInfo", "healthScore", "evidencePanel", "healthSuggestions"]
};


const systemInstruction = `You are a food science and nutrition expert. Your goal is to analyze food product labels and provide a clear, evidence-based health score from 0-100.
You must only use reliable, medically practical sources like official government databases (e.g., FDA, USDA), standards from health organizations (e.g., WHO), or peer-reviewed scientific guidance.
- The score should reflect overall healthiness. Penalize for high levels of sodium, added sugars, saturated fats, and ultra-processed ingredients. Reward for fiber, protein, vitamins, and whole food ingredients.
- The score of 100 is for exceptionally healthy, minimally processed foods (e.g., plain rolled oats). The score of 0 is for items with virtually no nutritional value and high levels of unhealthy components (e.g., pure sugar candy). A typical packaged snack might fall in the 30-60 range.
- Your analysis must be grounded in the provided label text.
- If data is incomplete (e.g., missing 'added sugars'), you MUST state this in the 'missingInfo' field. Do not guess.
- Provide clear, simple explanations. Cite your sources.
- Additionally, provide 2-3 concrete suggestions for healthier alternatives or simple recipe modifications. For example, if analyzing a sugary cereal, suggest oatmeal with fresh fruit. If analyzing a high-sodium sauce, suggest a homemade version with herbs.
- The output MUST conform to the provided JSON schema.
`;

export const analyzeProductLabel = async (labelText: string, image?: { base64: string, mimeType: string }): Promise<AnalysisResult> => {
    try {
        const contents: any = [{ text: `Analyze the following food label text:\n\n---\n${labelText}\n---` }];

        if (image) {
            contents.unshift({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType
                }
            });
            contents[1].text = `Analyze the food label in the image. If the text below is also provided, use it to supplement the image information. \n\n---\n${labelText}\n---`;
        }
        
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: { parts: contents },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as AnalysisResult;
        return parsedResult;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("The AI returned an invalid analysis format. Please try again with a clearer image or more complete text.");
        }
        throw new Error("Failed to analyze the product. The AI service may be temporarily unavailable.");
    }
};