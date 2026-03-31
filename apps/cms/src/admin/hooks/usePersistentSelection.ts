import { useEffect, useMemo, useState } from 'react'

type PersistedSelectionOptions<T extends string> = {
  storageKey: string
  queryParam: string
  defaultValue?: T
}

const getFromQuery = (param: string): string | null => {
  if (typeof window === 'undefined') return null
  const searchParams = new URLSearchParams(window.location.search)
  const value = searchParams.get(param)
  return value
}

const writeToQuery = (param: string, value?: string | null) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (value) {
    url.searchParams.set(param, value)
  } else {
    url.searchParams.delete(param)
  }
  window.history.replaceState({}, '', url.toString())
}

const getFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeToStorage = (key: string, value?: string | null) => {
  if (typeof window === 'undefined') return
  try {
    if (!value) {
      window.localStorage.removeItem(key)
      return
    }
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage errors (e.g., private mode)
  }
}

export const usePersistentSelection = <T extends string>({
  storageKey,
  queryParam,
  defaultValue,
}: PersistedSelectionOptions<T>): [T | undefined, (next?: T) => void, { ready: boolean }] => {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fromQuery = getFromQuery(queryParam) as T | null
    const fromStorage = getFromStorage(storageKey) as T | null
    const initial = fromQuery ?? fromStorage ?? defaultValue
    if (initial) {
      setValue(initial)
    }
    setReady(true)
  }, [defaultValue, queryParam, storageKey])

  const setter = useMemo(
    () => (next?: T) => {
      setValue(next)
      writeToQuery(queryParam, next ?? null)
      writeToStorage(storageKey, next ?? null)
    },
    [queryParam, storageKey],
  )

  return [value, setter, { ready }]
}
