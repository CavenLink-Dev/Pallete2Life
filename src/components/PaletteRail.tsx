import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { createPortal } from "react-dom"
import { type RoleBindings, type Swatch } from "../lib/color"
import ColorEditor from "./ColorEditor"

type Props = {
  palette: Swatch[]
  onAdd: () => void
  onChange: (id: string, hex: string) => void
  onRename: (id: string, name: string) => void
  onRemove: (id: string) => void
  onToggleLock: (id: string) => void
  onReorder?: (activeId: string, overId: string) => void
  roleBindings?: RoleBindings
  roleOptions?: readonly string[]
  defaultRoleByIndex?: readonly string[]
  unassignedRoleSwatchIds?: readonly string[]
  onRoleChange?: (role: string, swatchId: string) => void
  onClose?: () => void
  className?: string
}

export default function PaletteRail({
  palette,
  onAdd,
  onChange,
  onRename,
  onRemove,
  onToggleLock,
  onReorder,
  roleBindings = {},
  roleOptions = [],
  defaultRoleByIndex = [],
  unassignedRoleSwatchIds = [],
  onRoleChange,
  onClose,
  className = "",
}: Props) {
  const [editorId, setEditorId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const editorSwatch = palette.find((s) => s.id === editorId)
  const dragSwatch = palette.find((s) => s.id === dragId)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setEditorId(null)
    setDragId(String(active.id))
  }
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragId(null)
    if (over && active.id !== over.id) onReorder?.(String(active.id), String(over.id))
  }

  const swatchRole = (swatchId: string) => {
    const entry = Object.entries(roleBindings).find(([, id]) => id === swatchId)
    if (entry) return entry[0]
    if (unassignedRoleSwatchIds.includes(swatchId)) return ""
    const index = palette.findIndex((s) => s.id === swatchId)
    return index >= 0 && index < defaultRoleByIndex.length ? defaultRoleByIndex[index] : ""
  }

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden bg-white ${className}`} aria-label="Palette">
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-softgrey px-2">
        <h2 className="min-w-0 flex-1 truncate px-1 text-[13px] font-bold">Palette</h2>
        <RailAction label="Add colour" onClick={onAdd}><PlusIcon /></RailAction>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Collapse palette"
            title="Collapse palette"
          >
            <CollapseIcon />
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={palette.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-0.5">
              {palette.map((swatch) => (
                <SortableRow
                  key={swatch.id}
                  swatch={swatch}
                  open={swatch.id === editorId}
                  dragging={swatch.id === dragId}
                  role={swatchRole(swatch.id)}
                  roleOptions={roleOptions}
                  onRoleChange={onRoleChange}
                  onToggleEditor={() => setEditorId(editorId === swatch.id ? null : swatch.id)}
                  onRename={onRename}
                  onToggleLock={onToggleLock}
                  onRemove={onRemove}
                  canRemove={palette.length > 1}
                />
              ))}
            </div>
          </SortableContext>
          {createPortal(
            <DragOverlay dropAnimation={null}>
              {dragSwatch && (
                <SwatchRow
                  swatch={dragSwatch}
                  role={swatchRole(dragSwatch.id)}
                  roleOptions={roleOptions}
                  overlay
                />
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>

      {editorSwatch && createPortal(
        <ColorEditor
          hex={editorSwatch.hex}
          alpha={1}
          onChange={(hex) => onChange(editorSwatch.id, hex)}
          onClose={() => setEditorId(null)}
        />,
        document.body,
      )}
    </section>
  )
}

function SortableRow({ swatch, open, dragging, role, roleOptions, onRoleChange, onToggleEditor, onRename, onToggleLock, onRemove, canRemove }: {
  swatch: Swatch; open: boolean; dragging: boolean; role: string
  roleOptions: readonly string[]
  onRoleChange?: (role: string, swatchId: string) => void
  onToggleEditor: () => void; onRename: (id: string, name: string) => void
  onToggleLock: (id: string) => void; onRemove: (id: string) => void; canRemove: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: swatch.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: dragging ? 0.35 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SwatchRow
        swatch={swatch}
        open={open}
        role={role}
        roleOptions={roleOptions}
        onRoleChange={onRoleChange}
        onToggleEditor={onToggleEditor}
        onRename={onRename}
        onToggleLock={onToggleLock}
        onRemove={onRemove}
        canRemove={canRemove}
        dragListeners={listeners}
      />
    </div>
  )
}

function SwatchRow({ swatch, open, role, roleOptions, overlay, onRoleChange, onToggleEditor, onRename, onToggleLock, onRemove, canRemove, dragListeners }: {
  swatch: Swatch; open?: boolean; role: string; roleOptions: readonly string[]
  overlay?: boolean
  onRoleChange?: (role: string, swatchId: string) => void
  onToggleEditor?: () => void; onRename?: (id: string, name: string) => void
  onToggleLock?: (id: string) => void; onRemove?: (id: string) => void; canRemove?: boolean
  dragListeners?: Record<string, unknown>
}) {
  return (
    <div className={`group relative flex items-start gap-1.5 rounded-[7px] border p-1.5 ${overlay ? "border-brand bg-white shadow-lg" : open ? "border-brand/30 bg-brand/5" : "border-transparent hover:border-softgrey hover:bg-offwhite"}`}>
      <button
        type="button"
        className="mt-0.5 h-10 w-10 shrink-0 rounded-[6px] border border-charcoal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
        style={{ backgroundColor: swatch.hex }}
        onClick={onToggleEditor}
        aria-expanded={open}
        aria-label={`Edit ${swatch.name}`}
        title={`Edit ${swatch.name}`}
      />
      <div className="min-w-0 flex-1">
        <input
          value={swatch.name}
          onChange={(e) => onRename?.(swatch.id, e.target.value)}
          className="h-5 w-full truncate rounded-[3px] bg-transparent px-0.5 text-[11px] font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand"
          aria-label={`Name for ${swatch.hex}`}
        />
        <span className="block px-0.5 font-mono text-[10px] uppercase text-charcoal/50">{swatch.hex}</span>
        {onRoleChange && roleOptions.length > 0 && (
          <label className="mt-1 block">
            <span className="sr-only">Role for {swatch.name}</span>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value, swatch.id)}
              className="h-7 w-full rounded-[5px] border border-softgrey bg-offwhite px-1.5 text-[10px] font-semibold text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`Role for ${swatch.name}`}
            >
              <option value="">No role</option>
              {roleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-center">
        {onRemove && canRemove && (
          <button
            type="button"
            onClick={() => onRemove(swatch.id)}
            className="grid h-7 w-7 place-items-center rounded-[5px] text-charcoal/40 opacity-0 hover:bg-white hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand group-hover:opacity-100"
            aria-label={`Remove ${swatch.name}`}
            title="Remove colour"
          >
            <TrashIcon />
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggleLock?.(swatch.id)}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] text-charcoal/45 hover:bg-white hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-pressed={!!swatch.locked}
          aria-label={`${swatch.locked ? "Unlock" : "Lock"} ${swatch.name}`}
          title={`${swatch.locked ? "Unlock" : "Lock"} colour`}
        >
          {swatch.locked ? <LockedIcon /> : <UnlockedIcon />}
        </button>
        <button
          type="button"
          {...dragListeners}
          className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded-[5px] text-charcoal/30 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:cursor-grabbing"
          aria-label={`Drag to reorder ${swatch.name}`}
          title="Drag to reorder"
        >
          <GripIcon />
        </button>
      </div>
    </div>
  )
}

function RailAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="grid h-11 w-11 shrink-0 place-items-center rounded-[7px] text-charcoal/55 hover:bg-offwhite hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">{children}</button>
}

const PlusIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
const CollapseIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 18 6-6-6-6" /><path d="M4 4v16" /></svg>
const LockedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
const UnlockedIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.5-2" /></svg>
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
const GripIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
