import { useEffect } from 'react'

const SITE = 'বাঙালিয়ানা বাজার'

/** পাতার নাম ব্রাউজারের ট্যাবে বসায়। পাতা ছাড়লে আগের নাম ফেরে। */
export function useTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    const before = document.title
    document.title = `${title} | ${SITE}`
    return () => { document.title = before }
  }, [title])
}
