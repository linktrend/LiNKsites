import { useCallback, useRef, useState } from 'react'

export type ConcurrencySnapshot = {
  lastModified?: string
  lastModifiedBy?: string
}

export const useConcurrentEditGuard = (initial?: ConcurrencySnapshot) => {
  const baseline = useRef<ConcurrencySnapshot | undefined>(initial)
  const [warning, setWarning] = useState<ConcurrencySnapshot | null>(null)

  const updateBaseline = useCallback((next?: ConcurrencySnapshot) => {
    baseline.current = next
    setWarning(null)
  }, [])

  const compare = useCallback(
    (latest?: ConcurrencySnapshot) => {
      if (!latest || !latest.lastModified) {
        updateBaseline(latest)
        return { conflict: false, latest }
      }

      if (
        baseline.current?.lastModified &&
        latest.lastModified &&
        baseline.current.lastModified !== latest.lastModified
      ) {
        setWarning(latest)
        return { conflict: true, latest }
      }

      updateBaseline(latest)
      return { conflict: false, latest }
    },
    [updateBaseline],
  )

  return {
    warning,
    baseline: baseline.current,
    updateBaseline,
    compare,
  }
}
