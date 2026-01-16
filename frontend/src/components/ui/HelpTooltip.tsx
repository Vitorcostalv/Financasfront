type HelpTooltipProps = {
  text: string;
  label?: string;
};

const HelpTooltip = ({ text, label = 'Ajuda' }: HelpTooltipProps) => (
  <span className="relative inline-flex items-center group">
    <button
      type="button"
      aria-label={label}
      className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-app-border text-[10px] text-slate-300 transition hover:border-app-accent hover:text-white"
    >
      ?
    </button>
    <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 w-48 -translate-y-1/2 rounded-xl border border-app-border bg-app-panel px-3 py-2 text-xs text-slate-200 opacity-0 shadow-glow transition group-hover:opacity-100 group-focus-within:opacity-100">
      {text}
    </span>
  </span>
);

export default HelpTooltip;
