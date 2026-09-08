import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useBooth } from "@/lib/photobooth-context";
import { AppShell } from "@/components/AppShell";

const cell = "rounded-[2px] bg-border/70";

const templates = [
  {
    id: "grid",
    label: "2x2 Grid",
    preview: (
      <div className="grid size-full grid-cols-2 grid-rows-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cell} />
        ))}
      </div>
    ),
  },
  {
    id: "strip",
    label: "Photobooth Strip",
    preview: (
      <div className="mx-auto flex h-full w-1/2 flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${cell} flex-1`} />
        ))}
      </div>
    ),
  },
  {
    id: "mixed",
    label: "Mixed",
    preview: (
      <div className="flex size-full flex-col gap-2">
        <div className="flex flex-1 gap-2">
          <div className={`${cell} flex-[2]`} />
          <div className="flex flex-1 flex-col gap-2">
            <div className={`${cell} flex-1`} />
            <div className={`${cell} flex-1`} />
          </div>
        </div>
        <div className={`${cell} h-1/3`} />
      </div>
    ),
  },
  {
    id: "polyptych",
    label: "Polyptych",
    preview: (
      <div className="grid size-full grid-cols-3 grid-rows-2 gap-[6px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={cell} />
        ))}
      </div>
    ),
  },
];

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Choose Layout — Photobooth" },
      {
        name: "description",
        content: "Pick a photobooth layout: 2x2 grid, classic strip, mixed, or polyptych.",
      },
      { property: "og:title", content: "Choose Layout — Photobooth" },
      {
        property: "og:description",
        content: "Pick a photobooth layout: 2x2 grid, classic strip, mixed, or polyptych.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Templates,
});

function Templates() {
  const { selectedTemplate, setSelectedTemplate } = useBooth();
  const navigate = useNavigate();

  return (
    <AppShell>
      <section className="pt-6">
        <h1 className="type-h2">Choose Layout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick your style</p>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {templates.map((t) => {
          const active = selectedTemplate === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTemplate(t.id)}
              aria-pressed={active}
              className={`rounded-md p-2 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                active
                  ? "border-2 border-primary bg-primary/8 shadow-[0_4px_16px_rgba(217,112,64,0.15)]"
                  : "border border-border bg-card hover:border-secondary hover:shadow-[0_4px_12px_rgba(107,168,158,0.12)]"
              } ${selectedTemplate && !active ? "opacity-60" : ""}`}
            >
              <div className="aspect-square w-full p-1">{t.preview}</div>
              <p className="type-h3 mt-2 text-[14px]">{t.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex gap-4 pb-10">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => navigate({ to: "/" })}>
          Back
        </button>
        <button type="button" className="btn-primary flex-1" onClick={() => navigate({ to: "/gallery" })}>
          Build Collage
        </button>
      </div>
    </AppShell>
  );
}
