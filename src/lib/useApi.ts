import { useCallback, useEffect, useState } from 'react'
import { api, errorText } from './api'

/** একটা GET ডাকে। path বদলালে আবার আনে, পুরনো উত্তর ফেলে দেয়। path null হলে কিছু করে না। */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string }>({ path: null, data: null, error: '' })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (path === null) return
    let stale = false
    api.get<T>(path).then(
      (data) => { if (!stale) setState({ path, data, error: '' }) },
      (e) => { if (!stale) setState({ path, data: null, error: errorText(e) }) },
    )
    return () => { stale = true }
  }, [path, tick])

  const reload = useCallback(() => setTick((n) => n + 1), [])
  // অন্য path-এর পুরনো তথ্য দেখানো হয় না; নতুন আসা পর্যন্ত loading
  const fresh = state.path === path && path !== null
  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : '',
    loading: path !== null && !(fresh && (state.data !== null || state.error !== '')),
    reload,
  }
}
