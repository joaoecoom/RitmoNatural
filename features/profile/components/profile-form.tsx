"use client";

import type { ChangeEvent } from "react";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Camera, Heart, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { InputField } from "@/components/ui/input-field";
import { OptionCard } from "@/components/ui/option-card";
import { ProfilePhotoCropModal } from "@/features/profile/components/profile-photo-crop-modal";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/features/profile/server/actions";
import { getLifePhaseLabel } from "@/lib/utils/progress";
import type { LifePhase, Profile } from "@/types/domain";

const initialState: ProfileActionState = {
  success: false,
  message: "",
};

const lifePhaseOptions: { id: LifePhase; label: string }[] = [
  { id: "postpartum", label: "Pos-parto" },
  { id: "menopause", label: "Menopausa ou pre-menopausa" },
  { id: "high_stress", label: "Stress elevado" },
  { id: "none", label: "Nenhuma em particular" },
];

export function ProfileForm({
  profile,
  avatarSignedUrl,
}: {
  profile: Profile | null;
  avatarSignedUrl: string | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [age, setAge] = useState(profile?.age ? String(profile.age) : "");
  const [primaryGoal, setPrimaryGoal] = useState(profile?.primary_goal ?? "");
  const [lifePhase, setLifePhase] = useState<LifePhase>(
    (profile?.life_phase as LifePhase) ?? "none",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);
  const cropModalSrcRef = useRef<string | null>(null);

  const closeCropModal = useCallback(() => {
    setCropModalSrc((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    cropModalSrcRef.current = cropModalSrc;
  }, [cropModalSrc]);

  useEffect(() => {
    return () => {
      const url = cropModalSrcRef.current;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  const avatarPreviewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : avatarSignedUrl),
    [avatarFile, avatarSignedUrl],
  );

  useEffect(() => {
    if (!avatarFile || !avatarPreviewUrl?.startsWith("blob:")) {
      return;
    }

    return () => {
      URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarFile, avatarPreviewUrl]);

  function handleSubmit(formData: FormData) {
    if (avatarFile) {
      formData.set("avatar_file", avatarFile);
    }

    action(formData);
  }

  function handleAvatarFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    setCropModalSrc((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
  }

  return (
    <div className="grid gap-6">
      {cropModalSrc ? (
        <ProfilePhotoCropModal
          imageSrc={cropModalSrc}
          onClose={closeCropModal}
          onCropped={(file) => {
            setAvatarFile(file);
            closeCropModal();
          }}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          description="Edita os dados principais da tua conta e mantém a experiência alinhada com o teu momento."
          eyebrow="Perfil"
          title="Este espaço é teu."
        >
          <div className="grid gap-5">
            <div className="flex flex-col items-center justify-center rounded-[30px] border border-[rgba(198,167,94,0.16)] bg-[rgba(255,251,247,0.74)] px-6 py-7 text-center">
              <div className="soft-orb flex size-24 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#0F1A14,#203027)] text-xl font-semibold text-[#F6F1EA]">
                {avatarPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Fotografia de perfil"
                    className="h-full w-full object-cover"
                    src={avatarPreviewUrl}
                  />
                ) : (
                  <span>{(fullName.trim()[0] ?? "R").toUpperCase()}</span>
                )}
              </div>

              <p className="mt-5 text-base font-medium text-[#0F1A14]">
                {fullName || "Ritmo Natural"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[rgba(15,26,20,0.58)]">
                Uma presença suave que te acompanha ao longo da app.
              </p>

              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[rgba(236,213,177,0.42)] px-4 py-3 text-sm font-medium text-[#201B16] shadow-[0_10px_22px_rgba(198,168,128,0.18)] transition hover:brightness-[1.02]">
                <Camera className="size-4" />
                Mudar fotografia
                <input
                  accept="image/*"
                  className="hidden"
                  type="file"
                  onChange={handleAvatarFileInput}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                  Fase atual
                </p>
                <p className="mt-3 text-base font-medium text-[#0F1A14]">
                  {getLifePhaseLabel(profile?.life_phase ?? "none")}
                </p>
              </div>
              <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                  Objetivo principal
                </p>
                <p className="mt-3 text-base font-medium text-[#0F1A14]">
                  {profile?.primary_goal ?? "Definir um foco simples para esta fase."}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          description="Ajusta a forma como queres ser vista pela app e o contexto que ajuda a personalizar a tua experiência."
          eyebrow="Dados pessoais"
          title="Atualiza o que faz sentido agora."
        >
          <form action={handleSubmit} className="space-y-5">
            <InputField
              label="Nome"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setFullName(event.currentTarget.value)
              }
              placeholder="Como gostas de ser chamada?"
              value={fullName}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Idade"
                max={90}
                min={18}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setAge(event.currentTarget.value)
                }
                type="number"
                value={age}
              />
              <InputField
                label="Objetivo principal"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPrimaryGoal(event.currentTarget.value)
                }
                placeholder="Ex.: sentir menos pressao e mais leveza"
                value={primaryGoal}
              />
            </div>

            <div className="grid gap-3">
              <p className="text-sm font-medium tracking-[0.01em] text-[rgba(77,70,53,0.92)]">
                Fase da vida
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {lifePhaseOptions.map((option) => (
                  <OptionCard
                    description="Podes alterar esta leitura sempre que precisares."
                    icon={<Heart className="size-4 text-[#735C00]" />}
                    key={option.id}
                    selected={lifePhase === option.id}
                    title={option.label}
                    onClick={() => setLifePhase(option.id)}
                  />
                ))}
              </div>
            </div>

            <input name="full_name" readOnly type="hidden" value={fullName} />
            <input name="age" readOnly type="hidden" value={age} />
            <input name="primary_goal" readOnly type="hidden" value={primaryGoal} />
            <input name="life_phase" readOnly type="hidden" value={lifePhase} />

            {state.message ? (
              <p className="rounded-[24px] bg-[rgba(255,251,247,0.82)] px-4 py-4 text-sm text-[rgba(15,26,20,0.60)]">
                {state.message}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                className="inline-flex items-center gap-2 text-sm text-[rgba(15,26,20,0.54)] underline decoration-[rgba(198,167,94,0.42)] underline-offset-4"
                href="/logout"
              >
                <LogOut className="size-4" />
                Sair da conta
              </Link>

              <Button disabled={pending} size="lg" variant="gold">
                {pending ? "A guardar..." : "Guardar perfil"}
              </Button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        description="Uma leitura simples do teu momento ajuda a Ritmo Natural a manter o tom certo e a resposta mais útil."
        eyebrow="Resumo atual"
        title="O que a app sabe sobre ti."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
              Nome
            </p>
            <p className="mt-3 text-base font-medium text-[#0F1A14]">{fullName || "—"}</p>
          </div>
          <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
              Idade
            </p>
            <p className="mt-3 text-base font-medium text-[#0F1A14]">{age || "—"}</p>
          </div>
          <div className="rounded-[26px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
              Fase
            </p>
            <p className="mt-3 text-base font-medium text-[#0F1A14]">
              {getLifePhaseLabel(lifePhase)}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
