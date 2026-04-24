"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Play, Square, Waves, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function normaliseText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildVentText(writtenText: string, spokenText: string) {
  const cleanWrittenText = writtenText.trim();
  const cleanSpokenText = spokenText.trim();

  if (cleanWrittenText && cleanSpokenText) {
    return `${cleanWrittenText}\n\nDesabafo falado: ${cleanSpokenText}`;
  }

  return cleanWrittenText || cleanSpokenText;
}

function getAudioExtension(mimeType: string) {
  if (mimeType.includes("webm")) {
    return "webm";
  }

  if (mimeType.includes("mp4") || mimeType.includes("mpeg")) {
    return "mp4";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

export function VoiceJournalField({
  onVoiceCaptureChange,
}: {
  onVoiceCaptureChange?: (payload: {
    audioFile: File | null;
    transcript: string;
  }) => void;
}) {
  const [writtenText, setWrittenText] = useState("");
  const [spokenText, setSpokenText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isSupported =
    typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
  const canRecordAudio =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const SpeechRecognitionApi =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      return;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = "pt-PT";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscript += ` ${transcript}`;
        } else {
          interimTranscript += ` ${transcript}`;
        }
      }

      if (finalTranscript.trim()) {
        setSpokenText((previousValue) =>
          normaliseText(`${previousValue} ${finalTranscript}`),
        );
      }

      setInterimText(normaliseText(interimTranscript));
    };

    recognition.onerror = () => {
      setErrorMessage(
        "Nao foi possivel usar o microfone neste browser. Podes continuar a escrever.",
      );
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [isSupported]);

  const hiddenFieldValue = useMemo(
    () => buildVentText(writtenText, spokenText),
    [spokenText, writtenText],
  );

  useEffect(() => {
    onVoiceCaptureChange?.({
      audioFile,
      transcript: spokenText,
    });
  }, [audioFile, onVoiceCaptureChange, spokenText]);

  useEffect(() => {
    if (!audioUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Ignora erros de limpeza ao desmontar.
      }

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function handleStartRecording() {
    if (!canRecordAudio) {
      setErrorMessage(
        "A gravacao por voz ainda nao esta disponivel neste browser. Podes continuar a escrever.",
      );
      return;
    }

    setErrorMessage("");
    setInterimText("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        if (blob.size > 0) {
          const nextAudioFile = new File(
            [blob],
            `desabafo-${Date.now()}.${getAudioExtension(mimeType)}`,
            {
              type: mimeType,
            },
          );

          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }

          setAudioFile(nextAudioFile);
          setAudioUrl(URL.createObjectURL(blob));
        }

        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      };

      recorder.start();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Se a transcricao falhar, ainda mantemos a gravacao de audio.
        }
      }

      setIsRecording(true);
    } catch {
      setErrorMessage(
        "Nao foi possivel aceder ao microfone agora. Verifica as permissoes do browser.",
      );
    }
  }

  function handleStopRecording() {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  function handleClearSpokenText() {
    setSpokenText("");
    setInterimText("");
    setAudioFile(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl("");
    }
  }

  return (
    <Field
      hint={
        isSupported
          ? "Podes escrever ou tocar no microfone para falar. A transcricao e usada para gerar a resposta da Voz."
          : "Podes escrever livremente. A transcricao por voz depende do suporte do browser."
      }
      label="Queres desabafar?"
    >
      <input name="vent_text" type="hidden" value={hiddenFieldValue} />

      <Textarea
        onChange={(event) => setWrittenText(event.target.value)}
        placeholder="Opcional. Podes escrever o que sentiste hoje."
        value={writtenText}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          type="button"
          variant={isRecording ? "primary" : "secondary"}
        >
          {isRecording ? <Square className="mr-2 size-4" /> : <Mic className="mr-2 size-4" />}
          {isRecording ? "Parar e transcrever" : "Falar em vez de escrever"}
        </Button>

        {spokenText || audioFile ? (
          <Button onClick={handleClearSpokenText} type="button" variant="ghost">
            <X className="mr-2 size-4" />
            Limpar voz
          </Button>
        ) : null}
      </div>

      {spokenText || interimText ? (
        <div className="rounded-[24px] border border-[rgba(198,167,94,0.18)] bg-[rgba(255,251,247,0.76)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[rgba(15,26,20,0.42)]">
            <Waves className="size-4" />
            Desabafo falado
          </div>
          <p className="mt-3 text-sm leading-7 text-[rgba(15,26,20,0.64)]">
            {spokenText || "Estou a ouvir..."}
            {interimText ? ` ${interimText}` : ""}
          </p>
        </div>
      ) : null}

      {audioUrl ? (
        <div className="rounded-[24px] border border-[rgba(15,26,20,0.08)] bg-[rgba(255,251,247,0.78)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[rgba(15,26,20,0.42)]">
            <Play className="size-4" />
            Audio gravado
          </div>
          <audio className="mt-3 w-full" controls src={audioUrl}>
            O teu browser nao suporta reproducao de audio.
          </audio>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-sm leading-7 text-[rgba(140,78,56,0.92)]">{errorMessage}</p>
      ) : null}
    </Field>
  );
}
