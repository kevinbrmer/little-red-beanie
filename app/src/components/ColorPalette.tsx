interface Props {
  onPick: (hex: string, hsl: string) => void
  selected?: string | null
}

const COLORS: { hex: string; hsl: string; label: string }[] = [
  { hex: '#1F1B16', hsl: 'hsl(30, 6%, 10%)',   label: 'Ink' },
  { hex: '#C7503A', hsl: 'hsl(9, 56%, 50%)',   label: 'Warm Red' },
  { hex: '#B89668', hsl: 'hsl(33, 36%, 56%)',  label: 'Old Gold' },
  { hex: '#6F8868', hsl: 'hsl(108, 13%, 47%)', label: 'Soft Green' },
  { hex: '#2C4A7A', hsl: 'hsl(214, 47%, 33%)', label: 'Deep Blue' },
  { hex: '#7A5A8C', hsl: 'hsl(280, 19%, 45%)', label: 'Plum' },
]

export default function ColorPalette({ onPick, selected }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-7">
      {COLORS.map((c) => {
        const isSelected = selected === c.hex
        return (
          <button
            key={c.hex}
            type="button"
            onClick={() => onPick(c.hex, c.hsl)}
            className="group flex flex-col items-center gap-3 focus:outline-none"
            aria-label={c.label}
            aria-pressed={isSelected}
          >
            <span
              className="relative flex h-[72px] w-[72px] items-center justify-center transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] group-hover:-translate-y-0.5 group-active:scale-95"
            >
              {/* Selection ring — hairline gold at a 6px gap (brooch look) */}
              <span
                aria-hidden="true"
                className="absolute -inset-[7px] rounded-full transition-opacity duration-300"
                style={{
                  opacity: isSelected ? 1 : 0,
                  border: '1px solid var(--color-old-gold)',
                }}
              />
              {/* Color disc — flat, single hairline edge */}
              <span
                aria-hidden="true"
                className="h-full w-full rounded-full"
                style={{
                  backgroundColor: c.hex,
                  boxShadow:
                    'inset 0 0 0 1px rgba(31, 27, 22, 0.10), 0 1px 2px rgba(31, 27, 22, 0.06)',
                }}
              />
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.30em] transition-colors duration-300"
              style={{
                color: isSelected ? 'var(--color-ink)' : 'var(--color-ink-soft)',
                opacity: isSelected ? 1 : 0.6,
              }}
            >
              {c.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
