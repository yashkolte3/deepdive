
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExpertiseLevel, LessonData, InterviewTurn, InterviewPrepData, ComparisonData } from "../types";

// Helper to get a fresh AI client instance
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    4. 'rabbitHoles': Suggest 5-6 diverse follow-up topics. 
       - 'Deep Dive': Advanced internals or specific sub-components.
       - 'Related': Tangential concepts often used together.
       - 'Prerequisite': Fundamental concepts required to fully understand this.
       - 'Similar': Comparable technologies or alternatives (e.g., if topic is React, suggest Vue or Svelte).
       Use "click-bait" style hooks for the titles.
    5. 'pitfalls': List 3 common engineering mistakes/anti-patterns related to this.
    6. 'popularity': A short phrase describing industry adoption (e.g. "Industry Standard", "Rapidly Evolving", "Legacy").
    7. 'coreConcepts': For each concept, if applicable, provide a short, runnable 'codeSnippet' (in Python, JS, Go, or SQL) that demonstrates the concept.
    
    Return the response in JSON format.
  `;

  try {
    const ai = getAIClient();
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
                  type: { type: Type.STRING, enum: ["Deep Dive", "Related", "Prerequisite", "Similar"] }
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

export const generateComparison = async (topicA: string, topicB: string, level: ExpertiseLevel): Promise<ComparisonData> => {
  const prompt = `
    You are a Senior Technical Consultant.
    Compare and contrast "${topicA}" vs "${topicB}".
    Target Audience Level: ${level}.
    
    Provide a "Tale of the Tape" style comparison.
    1. 'overview': A punchy executive summary of the relationship between them.
    2. 'similarities': What DNA do they share?
    3. 'differences': Create a strict point-by-point comparison (e.g., Performance, Scalability, Ease of Use, Cost).
    4. 'verdict': A final recommendation on how to choose between them.
    
    Return the response in JSON format.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicA: { type: Type.STRING },
            topicB: { type: Type.STRING },
            overview: { type: Type.STRING },
            similarities: { type: Type.ARRAY, items: { type: Type.STRING } },
            differences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING, description: "The attribute being compared (e.g. 'Latency', 'Consistency')" },
                  topicAValue: { type: Type.STRING, description: "How Topic A handles this." },
                  topicBValue: { type: Type.STRING, description: "How Topic B handles this." }
                },
                required: ["feature", "topicAValue", "topicBValue"]
              }
            },
            verdict: { type: Type.STRING, description: "The final conclusion/heuristic for choosing." },
            topicAUseCases: { type: Type.ARRAY, items: { type: Type.STRING } },
            topicBUseCases: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["topicA", "topicB", "overview", "similarities", "differences", "verdict", "topicAUseCases", "topicBUseCases"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as ComparisonData;

  } catch (error) {
    console.error("Error generating comparison:", error);
    throw error;
  }
};

export const generateTrendingTopics = async (domain: string): Promise<string[]> => {
  const prompt = `
    Generate a list of 7 trending, cutting-edge, or important engineering topics related to the domain: "${domain}".
    Examples for "General Tech": "System Design", "Rust vs Go", "Microservices".
    Examples for "Automotive": "AUTOSAR", "V2X Communication", "Tesla Vision", "CAN Bus Security".
    Keep the topic names short, punchy, and standard (max 4 words).
    Return a JSON array of strings.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text;
    if (!text) return ['System Design', 'LLM Architecture', 'Rust vs Go', 'Kubernetes Internals'];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating trending topics:", error);
    return ['System Design', 'LLM Architecture', 'Rust vs Go', 'Kubernetes Internals'];
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
    const ai = getAIClient();
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
    const ai = getAIClient();
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
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No output.";
  } catch (error) {
    return "Error executing code via AI service.";
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  // Strip Markdown for better speech synthesis
  const cleanText = text.replace(/[*#`]/g, '');
  const prompt = `Read the following educational content clearly and professionally, maintaining an engaging tone suitable for learning: "${cleanText}"`;
  
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: prompt,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    // Convert base64 to raw PCM
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert PCM to WAV (24kHz is standard for this model)
    const wavBytes = pcmToWav(bytes, 24000, 1, 16);
    const blob = new Blob([wavBytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitDepth: number): Uint8Array {
  const headerLength = 44;
  const dataLength = pcmData.length;
  const fileSize = headerLength + dataLength;
  const wavBuffer = new Uint8Array(fileSize);
  const view = new DataView(wavBuffer.buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  // write pcm data
  wavBuffer.set(pcmData, 44);

  return wavBuffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

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

  const ai = getAIClient();
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

  const ai = getAIClient();
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
