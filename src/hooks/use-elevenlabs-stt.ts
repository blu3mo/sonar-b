"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Scribe,
  CommitStrategy,
  RealtimeEvents,
  type RealtimeConnection,
} from "@elevenlabs/client";

interface UseElevenLabsSTTOptions {
  languageCode?: string;
}

interface UseElevenLabsSTTReturn {
  isConnected: boolean;
  isConnecting: boolean;
  partialTranscript: string;
  committedTranscript: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  clearTranscript: () => void;
}

export function useElevenLabsSTT(
  options: UseElevenLabsSTTOptions = {}
): UseElevenLabsSTTReturn {
  const { languageCode = "ja" } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [committedTranscript, setCommittedTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<RealtimeConnection | null>(null);

  const stop = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setIsConnected(false);
    setPartialTranscript("");
  }, []);

  const start = useCallback(async () => {
    if (connectionRef.current) {
      stop();
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Fetch single-use token from our API
      const tokenResponse = await fetch("/api/elevenlabs/token", {
        method: "POST",
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to obtain transcription token");
      }

      const { token } = await tokenResponse.json();

      const connection = Scribe.connect({
        token,
        modelId: "scribe_v2_realtime",
        commitStrategy: CommitStrategy.VAD,
        vadSilenceThresholdSecs: 1.0,
        vadThreshold: 0.3,
        languageCode,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      connectionRef.current = connection;

      connection.on(RealtimeEvents.OPEN, () => {
        setIsConnected(true);
        setIsConnecting(false);
      });

      connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
        setPartialTranscript(data.text ?? "");
      });

      connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
        const text = data.text ?? "";
        if (text.trim()) {
          setCommittedTranscript((prev) =>
            prev ? prev + " " + text.trim() : text.trim()
          );
        }
        setPartialTranscript("");
      });

      connection.on(RealtimeEvents.ERROR, () => {
        setError("音声認識でエラーが発生しました");
        setIsConnecting(false);
      });

      connection.on(RealtimeEvents.AUTH_ERROR, () => {
        setError("認証エラーが発生しました。再接続してください。");
        setIsConnected(false);
        setIsConnecting(false);
      });

      connection.on(RealtimeEvents.CLOSE, () => {
        setIsConnected(false);
        setIsConnecting(false);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "音声認識の開始に失敗しました"
      );
      setIsConnecting(false);
    }
  }, [languageCode, stop]);

  const clearTranscript = useCallback(() => {
    setCommittedTranscript("");
    setPartialTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
        connectionRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    partialTranscript,
    committedTranscript,
    error,
    start,
    stop,
    clearTranscript,
  };
}
