export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full bg-bgsoft shadow-neumo-out" />
        <div className="absolute inset-1 rounded-full border-2 border-white/10 border-t-accent animate-spin" />
      </div>
      {label && <div className="text-sm text-[#8B8FC0]">{label}</div>}
    </div>
  )
}
