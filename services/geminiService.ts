import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Define the response schema strictly to ensure UI consistency
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "0 to 100 score of the assessment quality" },
    bloomsLevel: { type: Type.STRING, description: "Dominant Bloom's Taxonomy level (e.g., Analyze, Evaluate) across the questions" },
    summary: { type: Type.STRING, description: "A brief summary of the analysis for the provided questions/paper" },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of strengths found in the assessment"
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of weaknesses or violations of principles"
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "General suggestions for improvement"
    },
    questionImprovements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING, description: "The identifier of the question (e.g., '第 5 題', 'Q12')" },
          issue: { type: Type.STRING, description: "The specific problem identified with this question" },
          suggestion: { type: Type.STRING, description: "Concrete advice on how to fix this specific question" }
        },
        required: ["questionId", "issue", "suggestion"]
      },
      description: "List of specific questions that need improvement, with concrete advice"
    },
    criteriaBreakdown: {
      type: Type.OBJECT,
      properties: {
        realContext: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["excellent", "good", "warning", "critical"] }
          },
          required: ["score", "title", "description", "status"]
        },
        problemSolving: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["excellent", "good", "warning", "critical"] }
          },
          required: ["score", "title", "description", "status"]
        },
        interdisciplinary: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["excellent", "good", "warning", "critical"] }
          },
          required: ["score", "title", "description", "status"]
        },
        technicalQuality: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["excellent", "good", "warning", "critical"] }
          },
          required: ["score", "title", "description", "status"]
        },
        editorialQuality: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["excellent", "good", "warning", "critical"] }
          },
          required: ["score", "title", "description", "status"]
        },
        contentReview: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["excellent", "good", "warning", "critical"] }
          },
          required: ["score", "title", "description", "status"]
        }
      },
      required: ["realContext", "problemSolving", "interdisciplinary", "technicalQuality", "editorialQuality", "contentReview"]
    }
  },
  required: ["overallScore", "bloomsLevel", "summary", "strengths", "weaknesses", "suggestions", "questionImprovements", "criteriaBreakdown"]
};

// Convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeQuestion = async (text: string, file: File | null): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    You are an expert consultant in "Competency-Based Assessment" (素養導向評量) and Item Design (試題設計) for Junior High School Social Studies in Taiwan.
    Your task is to analyze assessment materials provided by teachers.
    
    You must evaluate them against strict pedagogical principles (based on experts like Chen Po-Hsi and NAER guidelines) and perform a detailed content review.

    **Core Principles for Evaluation:**

    1. **Real Context (真實情境):** 
       - Does the question use a realistic scenario?
       - Is the context *necessary* to answer the question?
       - Avoid "fake contexts" where the context is irrelevant to the answer.

    2. **Problem Solving (問題解決):**
       - Does the student need to apply knowledge to solve a specific problem?
       - Assesses "Learning Performance" + "Learning Content".

    3. **Cross-Discipline/Core Competencies (跨領域/核心素養):**
       - Involves reading comprehension, chart analysis, or critical thinking.

    4. **Technical Quality (一般命題原則):**
       - **Multiple Choice:** Clear stem, logical option order, similar length/grammar for options. Avoid "All of the above/None of the above". Options should be mutually exclusive. Avoid specific determinants (hints).
       - **True/False:** Avoid double negatives. Should test a single concept per item.
       - **Matching:** Items should be homogeneous. Reaction items > Problem items (to reduce guessing).
       - **Item Sets:** 3-5 sub-questions per stem. Answers should be independent (one answer shouldn't depend on another).

    5. **Editorial & Formatting Check (文句與格式檢核):**
       - **Question Numbers:** Check if numbers are sequential, missing, or duplicated.
       - **Options:** Check if options (A, B, C, D) are missing, mislabeled, or inconsistent.
       - **Language Flow:** Check for incomplete sentences, awkward phrasing, or grammatical errors.
       - **Typos (錯別字):** Identify any incorrect Chinese characters or typos.
       - *Strictly report any findings in this category.*

    6. **Content Review (內容審查 - 善良風俗/邏輯/價值觀):**
       - **Public Morals (善良風俗):** Ensure content is appropriate for students. No violence, explicit content, controversial political propaganda without academic context, or offensive material.
       - **Logical Correctness (邏輯正確性):** Check if the question premise leads logically to the answer. Are there logical fallacies? Is the cause-and-effect relationship valid?
       - **Correct Values (價值觀正確性):** Ensure the content promotes correct societal values (e.g., gender equality, human rights, environmental protection). Avoid stereotypes (gender, race, indigenous people), discrimination, or incorrect legal interpretations.

    **Instructions for Analysis:**
    - If a PDF/Image is provided, analyze the *overall quality* of the questions within it.
    - **CRITICAL:** In the 'editorialQuality' and 'contentReview' sections, you MUST explicitly state any violations found.
    - **Specific Improvements:** You MUST populate the 'questionImprovements' list. Identify specific questions (e.g., "第 3 題", "Q5") that violate principles or contain errors. Describe the specific issue and provide a concrete suggestion for how to rewrite or fix it.
    - Providing a "Score" should reflect the overall adherence to the principles above.

    **Tone:** Professional, constructive, yet critical of common pitfalls.
    **Output Language:** Traditional Chinese (繁體中文).
  `;

  const isPdf = file?.type === 'application/pdf';
  const fileTypeDesc = isPdf ? "A PDF assessment file" : "An image";
  
  const userPrompt = `Please analyze the following social studies assessment material.
  
  ${text ? `Teacher's Note/Question Text:\n${text}` : ''}
  
  ${file ? `${fileTypeDesc} is attached. Please analyze the content within this file, focusing on competency-based principles, editorial accuracy, and content ethics (logic, values, morals). Identify specific questions that need improvement.` : "No file provided."}
  `;

  const parts: any[] = [{ text: userPrompt }];
  
  if (file) {
    const filePart = await fileToGenerativePart(file);
    parts.unshift(filePart);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      }
    });

    if (response.text) {
      // Remove any markdown formatting if present (e.g., ```json ... ```)
      const cleanText = response.text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText) as AnalysisResult;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};