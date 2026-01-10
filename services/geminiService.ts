import { GoogleGenAI, Type } from "@google/genai";
import { ExpertiseLevel, LessonData, InterviewTurn, InterviewPrepData } from "../types";

// Initialize the client.
// Note: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLesson = async (topic: string, level: ExpertiseLevel): Promise<LessonData> => {
  const prompt = `
    You are a world-class Computer Science professor and Senior Staff Software Engineer. 
    Create a highly engaging, interactive learning module about the topic: "${topic}".
    
    Target Audience Level: ${level}.
    
    Structure the content specifically for this level. 
    - For EL5: Use analogies (e.g., traffic, food, post office).
    - For Junior: Focus on implementation and basic 'how-to'.
    - For Senior: Focus on trade-offs, scalability, edge cases, and performance.
    - For Principal: Focus on historical evolution, deep internals, distributed systems implications, and future trends.

    CRITICAL INSTRUCTIONS:
    1. 'diagramMermaid': 
       - If the topic is a PROCESS or PROTOCOL (e.g., OAuth, TCP Handshake, Request Lifecycle), generate a 'sequenceDiagram'.
       - If the topic is a SYSTEM STRUCTURE (e.g., Kubernetes Arch, Database Internals), generate a 'graph TD'.
       - USE LOWERCASE KEYWORDS (e.g., 'subgraph', 'end', 'graph', 'participant').
       - Avoid complex styling or classes.
    2. 'hotTake': Provide a spicy, nuanced, or controversial engineering opinion about this topic (e.g., "Why X is often overuse").
    3. 'quiz': Create a scenario-based multiple choice question to test understanding.
    4. 'rabbitHoles': Suggest 3 related topics with "click-bait" style hooks.
    5. 'pitfalls': List 3 common engineering mistakes/anti-patterns related to this.
    6. 'popularity': A short phrase describing industry adoption (e.g. "Industry Standard", "Rapidly Evolving", "Legacy").
    7. 'coreConcepts': For each concept, if applicable, provide a short, runnable 'codeSnippet' (in Python, JS, Go, or SQL) that demonstrates the concept.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            expertiseLevel: { type: Type.STRING },
            summary: { type: Type.STRING, description: "A high-level executive summary of the topic." },
            historicalContext: { type: Type.STRING, description: "Why was this invented? What problem did it solve?" },
            coreConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING, description: "The explanation. Use Markdown." },
                  icon: { type: Type.STRING, description: "A suggested Lucide icon name." },
                  codeSnippet: {
                    type: Type.OBJECT,
                    properties: {
                      language: { type: Type.STRING },
                      code: { type: Type.STRING }
                    },
                    required: ["language", "code"]
                  }
                },
                required: ["title", "content"]
              }
            },
            diagramMermaid: { type: Type.STRING, description: "Valid mermaid.js code block (no backticks)." },
            realWorldExample: { type: Type.STRING },
            commonUseCases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-4 specific real-world applications." },
            pitfalls: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Common mistakes or anti-patterns." },
            popularity: { type: Type.STRING, description: "Adoption status." },
            hotTake: { type: Type.STRING, description: "A controversial or counter-intuitive opinion on this topic." },
            quiz: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            },
            rabbitHoles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: "The exact topic name to search next." },
                  hook: { type: Type.STRING, description: "A catchy title like 'Why X is dying' or 'The hidden cost of Y'." },
                  type: { type: Type.STRING, enum: ["Deep Dive", "Tangent", "Prerequisite"] }
                },
                required: ["topic", "hook", "type"]
              }
            },
            followUpSuggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 curious follow-up questions." 
            }
          },
          required: ["topic", "summary", "coreConcepts", "diagramMermaid", "realWorldExample", "commonUseCases", "pitfalls", "popularity", "hotTake", "quiz", "rabbitHoles", "followUpSuggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as LessonData;

  } catch (error) {
    console.error("Error generating lesson:", error);
    throw error;
  }
};

export const generateInterviewPrep = async (topic: string, level: ExpertiseLevel): Promise<InterviewPrepData> => {
  const prompt = `
    You are a hiring manager at a top tech company (FAANG).
    Create a comprehensive "Interview Prep Guide" for the topic: "${topic}".
    Target Candidate Level: ${level}.
    
    1. 'technicalQuestions': Provide 5-7 challenging technical questions often asked in interviews about this topic. Include the "Gold Standard" answer.
    2. 'systemDesignChallenge': A scenario where this topic is a key component. How should the candidate approach designing it?
    3. 'resumeBulletPoints': 3 impactful bullet points a candidate could put on their resume to show mastery of this.
    4. 'starExample': A behavioral answer example using Situation, Task, Action, Result format about a challenge with this topic.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            technicalQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING, description: "Detailed model answer." },
                  keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords interviewers listen for." }
                },
                required: ["question", "answer", "keyPoints"]
              }
            },
            systemDesignChallenge: {
              type: Type.OBJECT,
              properties: {
                scenario: { type: Type.STRING },
                constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
                approach: { type: Type.STRING, description: "Step-by-step solution approach in Markdown." }
              },
              required: ["scenario", "constraints", "approach"]
            },
            resumeBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            starExample: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING }
              },
              required: ["situation", "task", "action", "result"]
            }
          },
          required: ["topic", "technicalQuestions", "systemDesignChallenge", "resumeBulletPoints", "starExample"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as InterviewPrepData;
  } catch (error) {
    console.error("Error generating interview prep:", error);
    throw error;
  }
};

export const generateFollowUpAnswer = async (
  topic: string, 
  history: {role: string, text: string}[], 
  question: string,
  currentLevel: ExpertiseLevel
): Promise<string> => {
  
  const historyText = history.map(h => `${h.role}: ${h.text}`).join('\n');

  const prompt = `
    Context Topic: ${topic}
    Current Expertise Level: ${currentLevel}
    
    Conversation History:
    ${historyText}
    
    User Question: ${question}
    
    Please answer the user's question concisely but accurately, maintaining the persona of a helpful senior engineer mentor. 
    Use Markdown for code snippets or emphasis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "I couldn't generate an answer at this moment.";
  } catch (error) {
    console.error("Error answering follow-up:", error);
    return "Sorry, I encountered an error while processing your question.";
  }
};

export const executeCodeSnippet = async (code: string, language: string): Promise<string> => {
  const prompt = `
    You are a code execution engine and compiler.
    Language: ${language}
    Code:
    ${code}

    Execute the code mentally and return the output (stdout).
    If there is a compilation error or runtime error, return the error message.
    If the code is a snippet without print statements, explain what the result of the last expression would be.
    
    Return ONLY the output text. No markdown formatting blocks around it.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No output.";
  } catch (error) {
    return "Error executing code via AI service.";
  }
};

// --- INTERVIEW SERVICES ---

export const startInterviewSession = async (topic: string, level: ExpertiseLevel): Promise<string> => {
  const prompt = `
    You are interviewing a candidate for a Software Engineering role. 
    The topic is: ${topic}.
    The expected level is: ${level}.
    
    Generate the first interview question. 
    It should be open-ended and challenging enough for the level.
    Do not greet. Just ask the question directly.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text || "Tell me about your experience with this topic.";
};

export const evaluateInterviewAnswer = async (
  topic: string,
  question: string,
  answer: string
): Promise<{ feedback: { rating: number; critique: string; betterAnswer: string; }; nextQuestion: string }> => {
  
  const prompt = `
    Topic: ${topic}
    Interview Question: ${question}
    Candidate Answer: ${answer}
    
    Task:
    1. Evaluate the answer (1-10).
    2. Provide a short critique (what was missing?).
    3. Provide a concise better answer (the 'gold standard').
    4. Generate the NEXT question (related but exploring a different angle or deeper).
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.INTEGER },
              critique: { type: Type.STRING },
              betterAnswer: { type: Type.STRING }
            },
            required: ["rating", "critique", "betterAnswer"]
          },
          nextQuestion: { type: Type.STRING }
        },
        required: ["feedback", "nextQuestion"]
      }
    }
  });

  const text = response.text;
  return JSON.parse(text || "{}");
};
