import { useState } from "react";

type Group = {
  title: string;
  serif: boolean;
  accent: string;
  filters: { name: string; css: string }[];
};

const groups: Group[] = [
  {
    title: "Vintage",
    serif: true,
    accent: "var(--primary)",
    filters: [
      { name: "Kodak Gold 200", css: "sepia(.35) saturate(1.2) contrast(.95)" },
      { name: "Fujifilm Superia", css: "hue-rotate(-12deg) saturate(1.15)" },
      { name: "Agfa Precisa", css: "hue-rotate(12deg) saturate(.9)" },
      { name: "Polaroid SX70", css: "sepia(.45) contrast(.85) brightness(1.08)" },
      { name: "Film Noir", css: "grayscale(1) contrast(1.35)" },
      { name: "Cinestill 800T", css: "hue-rotate(-20deg) saturate(1.3) brightness(1.05)" },
    ],
  },
  {
    title: "Modern",
    serif: false,
    accent: "var(--secondary)",
    filters: [
      { name: "Vibrant", css: "saturate(1.4) contrast(1.2)" },
      { name: "Pastel", css: "saturate(.7) contrast(.9) brightness(1.1)" },
      { name: "Neon 80s", css: "saturate(1.6) contrast(1.3) hue-rotate(-25deg)" },
      { name: "Moody Blue", css: "saturate(.8) contrast(1.15) hue-rotate(20deg)" },
      { name: "Golden Hour", css: "sepia(.2) saturate(1.15) brightness(1.05)" },
      { name: "Cyberpunk", css: "saturate(1.2) contrast(1.5) hue-rotate(-40deg)" },
    ],
  },
  {
    title: "Effects",
    serif: false,
    accent: "var(--gold)",
    filters: [
      { name: "Light Leak", css: "brightness(1.15) sepia(.25)" },
      { name: "Cool Leak", css: "brightness(1.1) hue-rotate(35deg)" },
      { name: "Film Grain", css: "contrast(1.1)" },
      { name: "Vignette", css: "brightness(.92)" },
      { name: "Glitch", css: "saturate(1.5) hue-rotate(-60deg)" },
      { name: "Bokeh", css: "blur(1px) brightness(1.06)" },
    ],
  },
];

const swatch =
  "linear-gradient(135deg, #D4A574 0%, #D97040 45%, #6BA89E 100%)";

export function FilterStrip() {
  const [selected, setSelected] = useState("Kodak Gold 200");

  return (
    <div className="border-t border-border bg-border/30">
      <div className="space-y-3 px-4 py-3">
        {groups.map((group) => (
          <div key={group.title}>
            <p
              className="mb-2 text-[12px] text-muted-foreground"
              style={{
                fontFamily: group.serif ? "var(--font-serif)" : "var(--font-sans)",
                fontWeight: group.serif ? 500 : 600,
                letterSpacing: "0.3px",
              }}
            >
              {group.title}
            </p>
            <div className="scroll-x flex gap-3 pb-1">
              {group.filters.map((filter) => {
                const active = selected === filter.name;
                return (
                  <button
                    key={filter.name}
                    type="button"
                    onClick={() => setSelected(filter.name)}
                    className="shrink-0 rounded-[4px] bg-card p-1 transition-shadow"
                    style={{
                      width: 70,
                      border: active
                        ? `2px solid ${group.accent}`
                        : "1px solid var(--border)",
                      background: active ? "rgba(217,112,64,0.05)" : "var(--card)",
                    }}
                    aria-pressed={active}
                  >
                    <div
                      className="mx-auto rounded-[2px]"
                      style={{
                        width: 62,
                        height: 56,
                        background: swatch,
                        filter: filter.css,
                      }}
                    />
                    <p className="mt-1 truncate text-center text-[11px] text-muted-foreground">
                      {filter.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
