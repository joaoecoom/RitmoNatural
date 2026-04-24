"use client";

import type { Area } from "react-easy-crop";
import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";

import { Button } from "@/components/ui/button";
import { getCroppedImageBlob } from "@/lib/utils/crop-image";

const OUTPUT_SIZE = 896;

interface ProfilePhotoCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropped: (file: File) => void;
}

export function ProfilePhotoCropModal({
  imageSrc,
  onClose,
  onCropped,
}: ProfilePhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleApply() {
    if (!croppedAreaPixels) {
      return;
    }

    setApplying(true);
    setError(null);

    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, OUTPUT_SIZE);
      const file = new File([blob], "perfil.jpg", { type: "image/jpeg" });
      onCropped(file);
    } catch {
      setError("Nao foi possivel aplicar o recorte. Tenta outra imagem.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div
      aria-labelledby="crop-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
    >
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-[rgba(15,26,20,0.45)] backdrop-blur-[2px]"
        type="button"
        onClick={onClose}
      />

      <div className="relative z-[101] m-0 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[#FFF8F5] shadow-[0_-8px_40px_rgba(32,27,22,0.12)] ring-1 ring-[rgba(198,167,94,0.2)] sm:m-4 sm:rounded-[28px]">
        <div className="border-b border-[rgba(15,26,20,0.06)] px-5 py-4 sm:px-6">
          <h2
            className="font-serif text-xl text-[#0F1A14]"
            id="crop-modal-title"
          >
            Ajustar fotografia
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[rgba(15,26,20,0.55)]">
            Arrasta para centralizar e usa o zoom para enquadrar o rosto ou o corpo
            como quiseres. O resultado sera um quadrado ideal para o circulo do perfil.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md px-4 pt-4">
          <div className="relative h-[min(52vh,360px)] w-full overflow-hidden rounded-[22px] bg-[#1a1612]">
            <Cropper
              aspect={1}
              crop={crop}
              cropShape="round"
              image={imageSrc}
              showGrid={false}
              zoom={zoom}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="py-4">
            <label className="flex items-center gap-3 text-sm text-[rgba(15,26,20,0.62)]">
              <span className="w-14 shrink-0 font-medium">Zoom</span>
              <input
                aria-label="Zoom do recorte"
                className="range-input h-2 flex-1"
                max={3}
                min={1}
                step={0.02}
                type="range"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
          </div>
        </div>

        {error ? (
          <p className="px-5 pb-2 text-sm text-[#8b4513] sm:px-6">{error}</p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 border-t border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.92)] px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            className="sm:min-w-[7rem]"
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="sm:min-w-[10rem]"
            disabled={!croppedAreaPixels || applying}
            type="button"
            variant="gold"
            onClick={() => void handleApply()}
          >
            {applying ? "A preparar..." : "Aplicar recorte"}
          </Button>
        </div>
      </div>
    </div>
  );
}
