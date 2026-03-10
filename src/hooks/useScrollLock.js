import { useEffect } from 'react'

const useScrollLock = (isLocked) => {
  useEffect(() => {
    document.body.style.overflow = isLocked ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isLocked])
}

export default useScrollLock
