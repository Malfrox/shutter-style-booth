import { createFileRoute } from "@tanstack/react-router";
import { Camera, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FilterStrip } from "@/components/FilterStrip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Photobooth — Retro Camera Booth" },
      {
        name: "description",
        content:
          "A warm, retro photobooth: live preview, vintage film filters, and printable layouts.",
      },
      { property: "og:title", content: "Photobooth — Retro Camera Booth" },
      {
        property: "og:description",
        content:
          "A warm, retro photobooth: live preview, vintage film filters, and printable layouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Booth,
});

function Booth() {
  return (
    <AppShell>
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 py-4">
        <div className="min-w-0">
          <h1 className="type-h1 truncate text-[26px] sm:text-[32px]">Photobooth</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ready?</p>
        </div>
      </section>

      <div className="grid gap-4 pb-8 md:grid-cols-2 md:gap-8">
        <div className="relative overflow-hidden rounded-lg border border-border bg-card">
          <div className="relative aspect-[3/4] max-h-[min(64vh,560px)] w-full sm:aspect-[9/16] md:aspect-[3/4] md:max-h-none">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, #E7DFD4 0%, #CDBBA8 45%, #A99A8B 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 45%, rgba(61,56,48,0.35) 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(249,247,243,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(249,247,243,.5) 1px, transparent 1px)",
                backgroundSize: "33.33% 33.33%",
              }}
            />
            <span className="type-timer absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-background drop-shadow">
              3
            </span>

            <button
              type="button"
              aria-label="Capture photo"
              className="absolute bottom-6 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-capture)] transition-transform duration-200 ease-[var(--ease-spring)] hover:scale-105 hover:bg-primary-hover hover:shadow-[var(--shadow-capture-hover)] active:scale-95 active:shadow-[var(--shadow-capture-active)]"
            >
              <Camera size={28} />
            </button>
          </div>
        </div>

        <div className="min-w-0 space-y-4 md:space-y-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <FilterStrip />
          </div>

          <div
            className="flex items-center gap-2 rounded-md px-4 py-3 text-sm text-background"
            style={{ background: "rgba(212, 165, 116, 0.95)" }}
          >
            <Check size={18} />
            Photo captured!
          </div>
        </div>
      </div>
    </AppShell>
  );
}
