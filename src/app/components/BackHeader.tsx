import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;         // bg color (hex o clase)
  textLight?: boolean;    // true → texto blanco
  rightElement?: React.ReactNode;
  onBack?: () => void;    // override del navigate(-1)
}

/**
 * Header reutilizable con flecha de navegación atrás.
 * Se aplica en todas las pantallas secundarias de la app.
 */
export function BackHeader({
  title, subtitle, color, textLight = false, rightElement, onBack
}: BackHeaderProps) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  const bg      = color ?? 'white';
  const txt     = textLight ? 'text-white' : 'text-slate-900';
  const subTxt  = textLight ? 'text-white/70' : 'text-slate-500';
  const btnBg   = textLight ? 'bg-white/15 border-white/25' : 'bg-slate-100 border-slate-200';
  const btnIcon = textLight ? 'text-white' : 'text-slate-700';
  const shadow  = textLight ? 'shadow-lg' : 'shadow-sm border-b border-slate-100';

  return (
    <div
      className={`flex items-center gap-3 px-5 pt-5 pb-4 shrink-0 ${shadow}`}
      style={{ background: bg }}
    >
      {/* ← Back button */}
      <button
        onClick={handleBack}
        className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform border ${btnBg}`}
      >
        <ChevronLeft className={`w-5 h-5 ${btnIcon}`} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className={`font-black text-base leading-tight truncate ${txt}`}>{title}</h1>
        {subtitle && (
          <p className={`text-[11px] font-medium truncate ${subTxt}`}>{subtitle}</p>
        )}
      </div>

      {/* Optional right element */}
      {rightElement ? (
        rightElement
      ) : (
        <div className="w-10" /> // spacer to keep title centered
      )}
    </div>
  );
}
