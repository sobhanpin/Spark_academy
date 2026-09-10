export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-accent animate-spin" />
      {label && <div className="text-sm text-[#8B8FC0]">{label}</div>}
    </div>
  )
}
