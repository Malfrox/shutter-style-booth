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
      { name: "description", content: "View your captured photos and photo strip." },
    ],
  }),
  component: GalleryPage,
});

const stripColors = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Cream", value: "#F9F7F3" },
  { name: "Vintage Yellow", value: "#F4E0A5" },
  { name: "Pastel Pink", value: "#F9D5E5" },
];

function GalleryPage() {
  const { photos, removePhoto, clearPhotos, stripColor, setStripColor, settings } = useBooth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);

  const buildCollage = useCallback(async (signal: AbortSignal) => {
    if (photos.length === 0) {
      setCollageUrl(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Standard 2x6 strip aspect ratio (scaled up for quality)
    const cw = 600;
    const ch = 1800;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = stripColor;
    ctx.fillRect(0, 0, cw, ch);

    const padding = 30; // Outer padding
    const gap = 30; // Gap between photos
    const bottomSpace = 150; // Extra space at bottom for text/logo
    
    const photoWidth = cw - padding * 2;
    // Calculate photo height based on available space minus gaps and bottom space
    const totalPhotoHeight = ch - padding - bottomSpace - (gap * 3);
    const photoHeight = totalPhotoHeight / 4; 

    const loadImg = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    // We only take up to 4 photos for a classic strip
    for (let i = 0; i < 4 && i < photos.length; i++) {
      if (signal.aborted) return;
      const photo = photos[i]!;
      const img = await loadImg(photo.dataUrl);
      if (signal.aborted) return;
      
      const dx = padding;
      const dy = padding + (i * (photoHeight + gap));
      const dw = photoWidth;
      const dh = photoHeight;

      // Cover-fit logic
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

      // If they used a filter, we apply it to the canvas context!
      // In photobooth-context, we save `filterCss`. We parse the string.
      ctx.filter = photo.filterCss === "none" ? "none" : photo.filterCss;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.filter = "none";
    }

    if (signal.aborted) return;

    // Draw some optional text at the bottom
    ctx.fillStyle = stripColor === "#000000" ? "#FFFFFF" : "#000000";
    ctx.font = "bold 32px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(settings.title || "PHOTOBOOTH", cw / 2, ch - (bottomSpace / 2));

    setCollageUrl(canvas.toDataURL(`image/${settings.format}`, 1.0));
  }, [photos, settings, stripColor]);

  useEffect(() => {
    const controller = new AbortController();
    buildCollage(controller.signal);
    return () => controller.abort();
  }, [buildCollage]);

  const handleDownload = () => {
    if (!collageUrl) return;
    const a = document.createElement("a");
    a.href = collageUrl;
    a.download = `photobooth-strip-${Date.now()}.${settings.format}`;
    a.click();
    toast.success("Photo strip downloaded!");
  };

  const isDarkBg = stripColor === "#000000";

  return (
    <AppShell>
      <div className="grid gap-8 pb-12 lg:grid-cols-[1fr_360px]">
        
        {/* Photo Strip Preview */}
        <section className="flex flex-col items-center">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="type-h2 mb-4 text-center">Your Photo Strip</h2>
            
            <div className="mx-auto overflow-hidden rounded shadow-lg transition-colors" style={{ backgroundColor: stripColor }}>
              {photos.length === 0 ? (
                <div className="flex aspect-[1/3] w-full flex-col items-center justify-center p-8 text-center" style={{ color: isDarkBg ? "#fff" : "var(--muted-foreground)" }}>
                  <ImageOff size={48} className="mb-4 opacity-50" />
                  <p className="text-sm">No photos yet.</p>
                  <button onClick={() => navigate({ to: "/" })} className="mt-4 text-primary hover:underline">
                    Take some photos
                  </button>
                </div>
              ) : (
                <img 
                  src={collageUrl || ""} 
                  alt="Photo Strip" 
                  className="w-full max-w-[240px] mx-auto block animate-in fade-in" 
                />
              )}
            </div>

            {photos.length > 0 && (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!collageUrl}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <Download size={18} />
                  Download Strip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear all photos?")) clearPhotos();
                  }}
                  className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Customization Sidebar */}
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-serif text-lg font-medium">Strip Color</h3>
            <div className="grid grid-cols-5 gap-3">
              {stripColors.map((sc) => (
                <button
                  key={sc.value}
                  type="button"
                  onClick={() => setStripColor(sc.value)}
                  className="group relative aspect-square rounded-full border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  style={{ 
                    backgroundColor: sc.value,
                    borderColor: stripColor === sc.value ? "var(--primary)" : "var(--border)" 
                  }}
                  aria-label={`Select ${sc.name} color`}
                >
                  {stripColor === sc.value && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-serif text-lg font-medium">Individual Photos</h3>
            {photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Photos will appear here.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((p, i) => (
                  <div key={p.id} className="group relative aspect-[3/4] overflow-hidden rounded bg-muted">
                    <img 
                      src={p.dataUrl} 
                      alt={`Shot ${i + 1}`} 
                      className="h-full w-full object-cover" 
                      style={{ filter: p.filterCss === "none" ? undefined : p.filterCss }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-destructive group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </AppShell>
  );
}
