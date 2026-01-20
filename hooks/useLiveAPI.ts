
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface LiveAPIConfig {
  model: string;
  systemInstruction: string;
  voiceName?: string;
}

export interface LiveTranscript {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const useLiveAPI = (config: LiveAPIConfig) => {
  const [connected, setConnected] = useState(false);
  const [isVolume, setIsVolume] = useState(0); // 0-1 range for visualization
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);
  const [currentText, setCurrentText] = useState(""); // Real-time text
  const [error, setError] = useState<string | null>(null);

  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSessionRef = useRef<any>(null);
  
  // Output audio queue
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Transcription accumulation
  const currentModelTranscriptRef = useRef("");
  const currentUserTranscriptRef = useRef("");
  
  const isConnectingRef = useRef(false);

  const connect = useCallback(async () => {
    if (isConnectingRef.current || activeSessionRef.current) return;
    
    isConnectingRef.current = true;
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      
      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true
      }});
      mediaStreamRef.current = stream;

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: config.model,
        callbacks: {
          onopen: () => {
            setConnected(true);
            
            // Setup Input Streaming
            if (!audioContextRef.current || !mediaStreamRef.current) return;
            
            const inputContext = new AudioContextClass({ sampleRate: 16000 });
            const source = inputContext.createMediaStreamSource(mediaStreamRef.current);
            const processor = inputContext.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for viz
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setIsVolume(Math.min(rms * 5, 1)); // Amplify a bit for visualizer

              // Send to API
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                // Check if we are still "active" before sending
                if (activeSessionRef.current === session) {
                   try {
                     session.sendRealtimeInput({ media: pcmBlob });
                   } catch (e) {
                     // Session might be closing
                   }
                }
              }).catch(e => {
                  // Ignore errors from session promise if it was rejected (connection failed)
              });
            };

            source.connect(processor);
            processor.connect(inputContext.destination);
            
            processorRef.current = processor;
            sourceRef.current = source;
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!audioContextRef.current) return;

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1
              );
              
              // Schedule playback
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              
              const currentTime = audioContextRef.current.currentTime;
              const startTime = Math.max(currentTime, nextStartTimeRef.current);
              source.start(startTime);
              
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              scheduledSourcesRef.current.push(source);
              
              // Clean up source when done
              source.onended = () => {
                const index = scheduledSourcesRef.current.indexOf(source);
                if (index > -1) scheduledSourcesRef.current.splice(index, 1);
              };
            }

            // Real-time transcription updates
            let newText = "";
            if (message.serverContent?.outputTranscription) {
               currentModelTranscriptRef.current += message.serverContent.outputTranscription.text;
               newText = currentModelTranscriptRef.current;
            }
            if (message.serverContent?.inputTranscription) {
               currentUserTranscriptRef.current += message.serverContent.inputTranscription.text;
               newText = currentUserTranscriptRef.current;
            }
            
            if (newText) {
                setCurrentText(newText);
            }

            // Turn Complete - Commit transcripts
            if (message.serverContent?.turnComplete) {
               const timestamp = Date.now();
               
               // Capture ref values locally before they are cleared, to ensure the state update closure
               // has access to the string data.
               const userText = currentUserTranscriptRef.current;
               if (userText.trim()) {
                 setTranscripts(prev => [...prev, {
                   id: `user-${timestamp}`,
                   role: 'user',
                   text: userText,
                   timestamp
                 }]);
                 currentUserTranscriptRef.current = "";
               }
               
               const modelText = currentModelTranscriptRef.current;
               if (modelText.trim()) {
                 setTranscripts(prev => [...prev, {
                   id: `model-${timestamp}`,
                   role: 'model',
                   text: modelText,
                   timestamp: timestamp + 1
                 }]);
                 currentModelTranscriptRef.current = "";
               }
               setCurrentText("");
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              scheduledSourcesRef.current.forEach(s => s.stop());
              scheduledSourcesRef.current = [];
              nextStartTimeRef.current = 0;
              currentModelTranscriptRef.current = "";
              setCurrentText("");
            }
          },
          onclose: () => {
            setConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection error");
            setConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName || 'Kore' } }
          },
          systemInstruction: { parts: [{ text: config.systemInstruction }] },
          inputAudioTranscription: { },
          outputAudioTranscription: { } 
        }
      });
      
      // Wait for session to be established to catch initial connection errors
      const sess = await sessionPromise;
      
      // Check if we have been disconnected while waiting for connection
      if (!isConnectingRef.current) {
          sess.close();
          return;
      }
      
      activeSessionRef.current = sess;
      
    } catch (e) {
      console.error("Failed to connect", e);
      setError("Failed to initialize audio session");
      // Cleanup if partial
      disconnect();
    } finally {
      isConnectingRef.current = false;
    }
  }, [config]);

  const disconnect = useCallback(() => {
    isConnectingRef.current = false;
    
    // Close session first
    if (activeSessionRef.current) {
        try {
            activeSessionRef.current.close();
        } catch (e) {
            console.error("Error closing session", e);
        }
        activeSessionRef.current = null;
    }

    // Close media streams
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Disconnect processors
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    
    // Stop audio context
    audioContextRef.current?.close();
    
    // Clear state
    setConnected(false);
    setIsVolume(0);
    setCurrentText("");
    
    scheduledSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    scheduledSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    connect,
    disconnect,
    connected,
    isVolume,
    transcripts,
    currentText,
    error
  };
};

// --- Helpers ---

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  // Manual base64 encode for performance/compatibility
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return {
    data: btoa(binary),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
