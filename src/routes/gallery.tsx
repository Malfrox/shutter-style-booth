import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Trash2, ImageOff, X } from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useBooth, type Photo } from "@/lib/photobooth-context";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Photobooth" },
      {
        name: "description",
        content: "View your captured photos and build collages.",
      },
    ],
  }),
  component: GalleryPage,
});

// ponytail: template layouts defined as fractional rects [x, y, w, h] in 0-1 space
const templateLayouts: Record<string, { x: number; y: number; w: number; h: number }[]> = {
  grid: [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  strip: [
    { x: 0, y: 0, w: 1, h: 0.25 },
    { x: 0, y: 0.25, w: 1, h: 0.25 },
    { x: 0, y: 0.5, w: 1, h: 0.25 },
    { x: 0, y: 0.75, w: 1, h: 0.25 },
  ],
  mixed: [
    { x: 0, y: 0, w: 0.6, h: 0.65 },
    { x: 0.6, y: 0, w: 0.4, h: 0.325 },
    { x: 0.6, y: 0.325, w: 0.4, h: 0.325 },
    { x: 0, y: 0.65, w: 1, h: 0.35 },
  ],
  polyptych: [
    { x: 0, y: 0, w: 0.333, h: 0.5 },
    { x: 0.333, y: 0, w: 0.333, h: 0.5 },
    { x: 0.666, y: 0, w: 0.334, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
};

function GalleryPage() {
  const { photos, removePhoto, clearPhotos, selectedTemplate, settings } = useBooth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);

  const layout = templateLayouts[selectedTemplate] ?? templateLayouts["strip"]!;

  const buildCollage = useCallback(async (signal: AbortSignal) => {
    if (photos.length === 0) {
      setCollageUrl(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w: cw, h: ch } = settings.resolution;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#F9F7F3"; // cream background
    ctx.fillRect(0, 0, cw, ch);

    const gap = 8;

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    for (let i = 0; i < layout.length && i < photos.length; i++) {
      if (signal.aborted) return;
      const rect = layout[i]!;
      const photo = photos[i]!;
      const img = await loadImg(photo.dataUrl);
      if (signal.aborted) return;
      const dx = Math.round(rect.x * cw) + gap;
      const dy = Math.round(rect.y * ch) + gap;
      const dw = Math.round(rect.w * cw) - gap * 2;
      const dh = Math.round(rect.h * ch) - gap * 2;

      // cover-fit the image into the rect
      const imgRatio = img.width / img.height;
      const rectRatio = dw / dh;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > rectRatio) {
        sw = img.height * rectRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / rectRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    if (signal.aborted) return;
    setCollageUrl(canvas.toDataURL(`image/${settings.format}`));
  }, [photos, layout, settings]);

  useEffect(() => {
    const controller = new AbortController();
    buildCollage(controller.signal);
    return () => controller.abort();
  }, [buildCollage]);

  const handleDownloadCollage = () => {
    if (!collageUrl) return;
    const a = document.createElement("a");
    a.href = collageUrl;
    a.download = `${settings.title || "photobooth-collage"}.${settings.format}`;
    a.click();
    toast.success("Collage downloaded!");
  };

  return (
    <AppShell>
      <section className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="type-h2">Gallery</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} captured
            </p>
          </div>
          {photos.length > 0 && (
            <button
              type="button"
              className="btn-secondary text-destructive hover:border-destructive"
              onClick={() => {
                clearPhotos();
                toast.info("Gallery cleared");
              }}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
        </div>
      </section>

      {photos.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <ImageOff size={48} className="text-secondary" />
          <h2 className="type-h2">No photos yet</h2>
          <p className="text-sm text-muted-foreground">
            Press the button to capture your first shot
          </p>
          <button type="button" className="btn-primary" onClick={() => navigate({ to: "/" })}>
            Ready to capture?
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 pb-12 lg:grid-cols-[1fr_auto]">
          {/* Collage preview */}
          <div className="space-y-4">
            <h2 className="type-h3">Collage Preview</h2>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <canvas ref={canvasRef} className="hidden" />
              {collageUrl ? (
                <img src={collageUrl} alt="Collage preview" className="w-full" />
              ) : (
                <div className="flex aspect-[9/16] items-center justify-center text-sm text-muted-foreground">
                  Take some photos to build a collage
                </div>
              )}
            </div>
            <button type="button" className="btn-primary w-full" onClick={handleDownloadCollage} disabled={!collageUrl}>
              <Download size={18} />
              Download Collage
            </button>
          </div>

          {/* Photo grid */}
          <div className="space-y-4 lg:w-72">
            <h2 className="type-h3">Your Photos</h2>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative overflow-hidden rounded-md border border-border">
                  <img src={photo.dataUrl} alt="Captured" className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Delete photo"
                    onClick={() => {
                      removePhoto(photo.id);
                      toast.info("Photo removed");
                    }}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
