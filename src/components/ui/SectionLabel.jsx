export default function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-[18px] h-px bg-accent flex-shrink-0" />
      <span className="font-body text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
        {children}
      </span>
    </div>
  )
}
