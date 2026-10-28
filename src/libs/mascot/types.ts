export type MascotMood = 'neutral' | 'happy' | 'sad'
/** ঝুড়ি কতটা ভরা: ০ খালি, ১ একটু, ২ অর্ধেক, ৩ প্রায় ভরা */
export type JhuriFill = 0 | 1 | 2 | 3

/** কয়টা জিনিস ঝুড়িতে, সেই হিসাবে ঝুড়ি কতটা ভরা। */
export function jhuriFill(count: number): JhuriFill {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  return 3
}
