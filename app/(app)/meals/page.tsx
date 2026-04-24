import { SectionCard } from "@/components/ui/section-card";
import { MealEntryForm } from "@/features/meals/components/meal-entry-form";
import { getMealEntries } from "@/features/meals/server/actions";
import { requireCompletedOnboarding } from "@/lib/auth/session";

export default async function MealsPage() {
  const { user } = await requireCompletedOnboarding();
  const meals = await getMealEntries(user.id);

  return (
    <div className="grid gap-6">
      <MealEntryForm />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          description="Ideias base para quando queres tirar peso mental ao momento de decidir."
          eyebrow="Refeicoes que apoiam o teu ritmo natural"
          title="Estrutura simples para dias com menos energia mental."
        >
          <div className="mt-5 space-y-4 text-sm leading-8 text-[rgba(15,26,20,0.58)]">
            <p>Pequeno-almoco: iogurte, aveia, frutos vermelhos e canela.</p>
            <p>Almoco: arroz, legumes, proteina simples e gordura boa.</p>
            <p>Jantar: sopa, peixe ou ovos e algo leve para fechar o dia.</p>
          </div>
        </SectionCard>

        <SectionCard
          description="Uma base pequena e previsivel ajuda a reduzir decisoes em dias mais cheios."
          eyebrow="Lista basica de compras"
          title="O essencial para manter calma e consistencia."
        >
          <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-[rgba(15,26,20,0.56)]">
            {[
              "Ovos",
              "Iogurte natural",
              "Arroz",
              "Batata",
              "Peixe",
              "Fruta",
              "Legumes",
              "Azeite",
            ].map((item) => (
              <div
                className="rounded-full bg-[rgba(255,251,247,0.76)] px-4 py-3 ring-1 ring-[rgba(15,26,20,0.05)]"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        description="Uma memoria curta para perceberes o que te deu mais leveza e previsibilidade."
        eyebrow="Registos recentes"
        title="O teu historico sem culpa, so com contexto."
      >
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(meals.length > 0
            ? meals
            : [
                {
                  id: "fallback-meal",
                  meal_text: "Exemplo de refeicao guardada.",
                  interpretation: "Isto pode estar a manter o teu corpo em alerta.",
                },
              ]
          ).map((meal) => (
            <div
              key={meal.id}
              className="rounded-[28px] border border-[rgba(15,26,20,0.06)] bg-[rgba(255,251,247,0.74)] p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-[rgba(15,26,20,0.40)]">
                Refeicao guardada
              </p>
              <p className="text-sm font-medium text-[#0F1A14]">{meal.meal_text}</p>
              <p className="mt-3 text-sm leading-8 text-[rgba(15,26,20,0.58)]">
                {meal.interpretation}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
