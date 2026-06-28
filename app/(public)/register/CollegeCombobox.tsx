"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"

export function CollegeCombobox({
  id,
  value,
  onChange,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  // Track the query we actually searched so picking a suggestion (which sets
  // `value`) doesn't immediately re-trigger a fetch / reopen the list.
  const lastQuery = React.useRef("")

  React.useEffect(() => {
    const query = value.trim()
    if (query === lastQuery.current) return
    lastQuery.current = query

    if (query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        setResults((data.colleges as string[]) ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  function select(name: string) {
    lastQuery.current = name.trim()
    onChange(name)
    setResults([])
    setOpen(false)
  }

  const showDropdown = open && value.trim().length >= 2

  return (
    <div className="relative">
      <Input
        id={id}
        name="college"
        autoComplete="off"
        value={value}
        placeholder="Search your college / university"
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
        required
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto border bg-popover text-popover-foreground shadow-md">
          {loading && (
            <div className="flex items-center gap-2 px-2.5 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Searching…
            </div>
          )}
          {!loading &&
            results.map((name) => (
              <button
                key={name}
                type="button"
                // onMouseDown fires before the input's onBlur, so the click registers.
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(name)
                }}
                className="block w-full px-2.5 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {name}
              </button>
            ))}
          {!loading && results.length === 0 && (
            <div className="px-2.5 py-2 text-xs text-muted-foreground">
              No matches — your typed name will be used.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
