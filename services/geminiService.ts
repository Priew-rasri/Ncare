import { GoogleGenAI } from "@google/genai";
import { GlobalState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBusinessData = async (
  prompt: string,
  contextData: GlobalState
): Promise<string> => {
  try {
    // Serialize a summary of the data to avoid token limits with large datasets
    const summary = {
      inventoryStatus: contextData.inventory.map(p => ({
        name: p.name,
        stock: p.stock,
        minStock: p.minStock,
        salesPotential: p.stock < p.minStock ? 'Low Stock' : 'OK'
      })),
      recentSalesTotal: contextData.sales.reduce((acc, curr) => acc + curr.total, 0),
      salesCount: contextData.sales.length,
      topCustomers: contextData.customers.slice(0, 5).map(c => c.name)
    };

    const dataContext = JSON.stringify(summary);

    const fullPrompt = `
      Context Data (Pharmacy System): ${dataContext}
      
      User Question: "${prompt}"
      
      Role: You are an expert Pharmacy Manager Consultant AI named "PharmaAI".
      Task: Provide a concise, helpful, and professional answer based on the context data provided. 
      If the stock is low, warn them. If sales are good, congratulate them.
      Answer in Thai language.
      Format: Use Markdown for readability.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text || "ขออภัย ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Assistant";
  }
};
