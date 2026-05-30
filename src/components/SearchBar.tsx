import { Search } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = "ค้นหา..." }: SearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-all outline-none"
      />
    </div>
  )
}
