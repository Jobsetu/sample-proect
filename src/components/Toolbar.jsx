import { useResumeStore } from '../stores/useResumeStore'

const NumberInput = ({ label, value, onChange, min = 0, max = 200, step = 1 }) => (
  <div className="grid gap-1">
    <span className="text-xs text-slate-600">{label}</span>
    <input type="number" className="w-24 border border-slate-200 rounded-md p-2 text-slate-800"
      value={value} min={min} max={max} step={step} onChange={e => onChange(parseFloat(e.target.value))} />
  </div>
)

const Toolbar = () => {
  const resume = useResumeStore(s => s.resume)
  const setResume = useResumeStore(s => s.setResume)

  const update = (partial) => setResume({ ...resume, ...partial })
  const updateMargin = (k, v) => setResume({ ...resume, margin: { ...resume.margin, [k]: v } })

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-4">
      <div className="grid gap-1">
        <span className="text-xs text-slate-600">Font</span>
        <select value={resume.font} onChange={e => update({ font: e.target.value })} className="border border-slate-200 rounded-md p-2 text-slate-800">
          <option value="Inter">Inter</option>
          <option value="Source Sans Pro">Source Sans Pro</option>
        </select>
      </div>
      <div className="grid gap-1">
        <span className="text-xs text-slate-600">Color</span>
        <input type="color" value={resume.color} onChange={e => update({ color: e.target.value })} className="h-10 w-16 border border-slate-200 rounded-md" />
      </div>
      <NumberInput label="Line Spacing" value={resume.spacing} step={0.1} min={1} max={2} onChange={v => update({ spacing: v })} />
      <div className="h-8 w-px bg-slate-200" />
      <NumberInput label="Top" value={resume.margin.top} onChange={v => updateMargin('top', v)} />
      <NumberInput label="Right" value={resume.margin.right} onChange={v => updateMargin('right', v)} />
      <NumberInput label="Bottom" value={resume.margin.bottom} onChange={v => updateMargin('bottom', v)} />
      <NumberInput label="Left" value={resume.margin.left} onChange={v => updateMargin('left', v)} />
    </div>
  )
}

export default Toolbar


