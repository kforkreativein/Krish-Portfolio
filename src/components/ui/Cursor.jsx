import { useRef } from 'react'
import useCursor from '../../hooks/useCursor'

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useCursor(dotRef, ringRef)

  if (isTouchDevice) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 h-2 w-2 rounded-full transition-[width,height] duration-200 ease-out"
        style={{ zIndex: 2147483647, backgroundColor: 'var(--accent-color, var(--accent))' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 h-[34px] w-[34px] rounded-full transition-opacity duration-200 ease-out"
        style={{ zIndex: 2147483646, border: '1px solid var(--accent-border)' }}
      />
    </>
  )
}
