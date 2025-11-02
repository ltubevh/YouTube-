import { useState, useCallback, useRef, useEffect } from 'react';

// From Gemini API documentation for decoding raw PCM audio data
function decode(base64: string): Uint8Array {
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

// Create a single AudioContext for the application.
// TTS from Gemini is at 24000Hz.
let audioContext: AudioContext;
const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    return audioContext;
}

export const useAudioPlayer = (audioUrl?: string, onEnded?: () => void) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const playAudio = useCallback(async () => {
    // Ensure we don't play again if already playing.
    if (isPlaying) return;
    
    if (!audioUrl || !audioUrl.startsWith('data:audio/')) {
        return;
    }
    
    // Stop any previous audio that might be playing or paused.
    if (sourceRef.current) {
        sourceRef.current.onended = null;
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    
    const context = getAudioContext();

    try {
        const base64Audio = audioUrl.split(',')[1];
        if (!base64Audio) {
            console.error("Invalid audioUrl format");
            return;
        };

        const decodedBytes = decode(base64Audio);
        // Gemini TTS is 24000Hz, 1 channel
        const audioBuffer = await decodeAudioData(decodedBytes, context, 24000, 1);
        
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);

        source.onended = () => {
            setIsPlaying(false);
            if (sourceRef.current === source) { // Only call onEnded if it's the current source
                if (onEndedRef.current) {
                    onEndedRef.current();
                }
                sourceRef.current = null;
            }
        };
        
        if (context.state === 'suspended') {
            await context.resume();
        }

        source.start();
        setIsPlaying(true);
        sourceRef.current = source;
    } catch (error) {
        console.error("Audio play failed:", error);
        setIsPlaying(false);
    }
  }, [audioUrl, isPlaying]);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
      setIsPlaying(false);
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.onended = null;
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }
    };
  }, []);
  
  return { isPlaying, playAudio, stopAudio };
};
