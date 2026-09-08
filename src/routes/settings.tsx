import { createFileRoute } from "@tanstack/react-router";
import { Download, Lock, SwitchCamera } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Photobooth" },
      {
        name: "description",
        content: "Timer, camera, quality and export preferences for your photobooth.",
      },
      { property: "og:title", content: "Settings — Photobooth" },
      {
        property: "og:description",
        content: "Timer, camera, quality and export preferences for your photobooth.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <section className="pt-6">
        <h1 className="type-h2">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tune your booth</p>
      </section>

      <div className="mt-6 grid gap-6 pb-12 md:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4">
          <h2 className="type-h3">Capture</h2>

          <div className="mt-4">
            <p className="type-label mb-1.5">Timer</p>
            <div className="grid grid-cols-4 gap-2">
              {["Off", "3s", "5s", "10s"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="btn-secondary justify-center px-2 hover:border-secondary hover:bg-secondary/8"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="type-label mb-1.5 block" htmlFor="title">
              Photo title
            </label>
            <input
              id="title"
              className="field-input"
              placeholder="Saturday at the booth"
            />
          </div>

          <button type="button" className="btn-secondary mt-4 w-full justify-center">
            <SwitchCamera size={18} />
            Flip camera
          </button>
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <h2 className="type-h3">Export</h2>

          <div className="mt-4">
            <label className="type-label mb-1.5 block" htmlFor="format">
              Format
            </label>
            <select id="format" className="field-input">
              <option>PNG — best quality</option>
              <option>JPG — smaller file</option>
            </select>
          </div>

          <div className="mt-4">
            <label className="type-label mb-1.5 block" htmlFor="size">
              Resolution
            </label>
            <select id="size" className="field-input">
              <option>1080 × 1920</option>
              <option>1440 × 2560</option>
            </select>
          </div>

          <button type="button" className="btn-primary mt-4 w-full">
            <Download size={18} />
            Get your photos
          </button>
        </div>

        <div className="rounded-md border border-border p-6 text-center md:col-span-2">
          <Lock size={48} className="mx-auto text-destructive" />
          <h2 className="type-h2 mt-6">Camera access needed</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Allow camera access in settings to use photobooth
          </p>
          <button type="button" className="btn-primary mt-6">
            Open Settings
          </button>
        </div>
      </div>
    </AppShell>
  );
}
