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
    <div className="flex flex-wrap justify-center gap-5">
      {COLORS.map((c) => {
        const isSelected = selected === c.hex
        return (
          <button
            key={c.hex}
            type="button"
            onClick={() => onPick(c.hex, c.hsl)}
            className="relative h-16 w-16 rounded-full transition-transform duration-200 hover:scale-105 focus:outline-none active:scale-95"
            style={{
              backgroundColor: c.hex,
              boxShadow: isSelected
                ? '0 0 0 3px var(--color-paper), 0 0 0 4px var(--color-old-gold), 0 4px 12px rgba(31, 27, 22, 0.18), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -3px 6px rgba(0, 0, 0, 0.12)'
                : '0 3px 8px rgba(31, 27, 22, 0.16), inset 0 2px 4px rgba(255, 255, 255, 0.30), inset 0 -3px 6px rgba(0, 0, 0, 0.10)',
            }}
            aria-label={c.label}
            aria-pressed={isSelected}
          />
        )
      })}
    </div>
  )
}
