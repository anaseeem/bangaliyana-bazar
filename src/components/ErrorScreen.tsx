import { Component, type ErrorInfo, type ReactNode } from 'react'
import { MamaScene } from './MamaScenes'

/** কোনো পাতা ভেঙে পড়লে সাদা পর্দা না দেখিয়ে মামাকে দেখায় */
export default class ErrorScreen extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <MamaScene kind="khoj" as="h1" title="কিছু একটা গোলমাল হয়েছে" text="পাতাটা আবার খুলে দেখুন।">
          <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-rickshaw px-6 py-3 text-white hover:bg-rickshaw-dark">আবার চেষ্টা করুন</button>
          <a href="/" className="rounded-full border-2 border-rickshaw px-6 py-3 text-rickshaw hover:bg-holud-soft">হোমে ফিরুন</a>
        </MamaScene>
      </div>
    )
  }
}
