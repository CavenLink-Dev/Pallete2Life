export const PREVIEW_FIT_MIN_ZOOM = 0.2
export const PREVIEW_FIT_MAX_ZOOM = 1.5
export const PREVIEW_FIT_INSET = 32

export function clampPreviewZoom(value: number) {
  return Math.min(PREVIEW_FIT_MAX_ZOOM, Math.max(PREVIEW_FIT_MIN_ZOOM, Math.round(value * 100) / 100))
}

export function computeFitZoom(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  inset = PREVIEW_FIT_INSET,
) {
  const availableWidth = viewportWidth - inset
  const availableHeight = viewportHeight - inset
  if (availableWidth <= 0 || availableHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) return 1
  return clampPreviewZoom(Math.min(availableWidth / contentWidth, availableHeight / contentHeight))
}
