import { useEffect } from 'react'

const useCursor = (dotRef, ringRef) => {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = window.innerWidth  / 2
    let mouseY = window.innerHeight / 2
    let rx     = mouseX
    let ry     = mouseY
    let dotRadius = 4 // half of default 8px size
    let rafId

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX - dotRadius}px, ${mouseY - dotRadius}px)`
    }

    const onMouseOver = (e) => {
      if (e.target.closest('a, button')) {
        dotRadius = 8
        dot.style.width  = '16px'
        dot.style.height = '16px'
        ring.style.opacity = '0.1'
      }
    }

    const onMouseOut = (e) => {
      const from = e.target.closest('a, button')
      const to   = e.relatedTarget?.closest('a, button')
      if (from && !to) {
        dotRadius = 4
        dot.style.width  = '8px'
        dot.style.height = '8px'
        ring.style.opacity = '0.4'
      }
    }

    const loop = () => {
      rx += (mouseX - rx) * 0.12
      ry += (mouseY - ry) * 0.12
      ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`
      rafId = requestAnimationFrame(loop)
    }

    loop()
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout',  onMouseOut)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout',  onMouseOut)
    }
  }, [dotRef, ringRef])
}

export default useCursor
