/** localStorage পড়া-লেখা। জায়গা না থাকলে বা বন্ধ থাকলে চুপচাপ আগের মানে থাকে। */
export function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* জায়গা ফুরালে শুধু এই ব্রাউজারে থাকবে না */ }
}

/** বাংলা অঙ্ক ইংরেজি অঙ্কে, যাতে দাম বা স্টক হিসাব করা যায় */
export const asciiDigits = (v: string) => v.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))

/** ছবি ছোট করে data URL বানায়, যাতে localStorage-এ ধরে */
export function shrinkImage(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')) }
    img.src = url
  })
}

/** অর্ডার নম্বর, যেমন BB৪৮২০১৯ */
export const newOrderId = () => `BB${Date.now().toString().slice(-6)}`
