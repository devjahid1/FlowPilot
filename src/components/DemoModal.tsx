import { FiX } from "react-icons/fi";

export default function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-lg border border-white/10 bg-white p-3 shadow-2xl dark:bg-slate-950">
        <div className="mb-3 flex items-center justify-between px-2">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">FlowPilot product demo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demo"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white"
          >
            <FiX aria-hidden />
          </button>
        </div>
        <div className="aspect-video overflow-hidden rounded-lg bg-slate-950">
          <iframe
            title="FlowPilot demo video"
            className="h-full w-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
