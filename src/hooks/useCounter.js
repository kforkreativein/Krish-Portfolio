import { useState, useEffect, useRef } from 'react'

const useCounter = (target, duration = 1000) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let startTime = null
    let animationFrame = null

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.unobserve(element)

          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3)
            
            setCount(Math.floor(easeOut * target))

            if (progress < 1) {
              animationFrame = requestAnimationFrame(animate)
            } else {
              setCount(target) // Ensure exact target on completion
            }
          }

          animationFrame = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [target, duration])

  return { count, ref }
}

export default useCounter
