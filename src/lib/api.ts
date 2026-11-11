/** সার্ভারের সাথে কথা বলা। ভুল হলে সার্ভারের বাংলা বাক্যসহ ApiError ছোড়ে। */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const OFFLINE = 'সার্ভারে পৌঁছানো গেল না। ইন্টারনেট দেখে একটু পরে আবার চেষ্টা করুন।'

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(OFFLINE, 0)
  }
  const data = (await res.json().catch(() => null)) as { error?: string } | null
  if (!res.ok) throw new ApiError(data?.error ?? OFFLINE, res.status)
  return data as T
}

export const api = {
  get: <T>(path: string) => call<T>('GET', path),
  post: <T>(path: string, body: unknown = {}) => call<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => call<T>('PATCH', path, body),
  put: <T>(path: string, body: unknown) => call<T>('PUT', path, body),
  del: <T>(path: string) => call<T>('DELETE', path),
}

/** ভুল থেকে দেখানোর মতো বাক্য */
export const errorText = (e: unknown) => (e instanceof ApiError ? e.message : OFFLINE)

/** ছবি সার্ভারে তোলে, ঠিকানা ফেরত দেয় */
export async function uploadImage(dataUrl: string) {
  return (await api.post<{ url: string }>('/files', { dataUrl })).url
}
