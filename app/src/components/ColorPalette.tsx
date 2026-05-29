interface Props {
  onPick: (hex: string, hsl: string) => void
}

const COLORS: { hex: string; hsl: string; label: string }[] = [
  { hex: '#000000', hsl: 'hsl(0, 0%, 0%)',  label: 'Black' },
  { hex: '#dc2626', hsl: 'hsl(0, 84%, 51%)', label: 'Red' },
  { hex: '#fbbf24', hsl: 'hsl(43, 96%, 56%)', label: 'Yellow' },
  { hex: '#16a34a', hsl: 'hsl(142, 76%, 36%)', label: 'Green' },
  { hex: '#3b6dc9', hsl: 'hsl(217, 56%, 51%)', label: 'Blue' },
  { hex: '#a855f7', hsl: 'hsl(271, 91%, 65%)', label: 'Purple' },
]

export default function ColorPalette({ onPick }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {COLORS.map((c) => (
        <button
          key={c.hex}
          onClick={() => onPick(c.hex, c.hsl)}
          className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
          style={{ backgroundColor: c.hex }}
          aria-label={c.label}
        />
      ))}
    </div>
  )
}
