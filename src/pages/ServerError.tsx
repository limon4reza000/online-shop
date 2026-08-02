import { Link } from 'react-router-dom';
import { RefreshCcw, Home } from 'lucide-react';

export default function ServerError() {
  return (
    <div className="container-app section-y text-center py-24">
      <p className="text-8xl font-bold text-primary/20 font-display">৫০০</p>
      <h1 className="mt-2 text-3xl">কিছু একটা ভুল হয়েছে</h1>
      <p className="mt-2 text-text-secondary">আমাদের প্রান্তে একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।</p>
      <div className="mt-7 flex items-center justify-center gap-3">
        <button onClick={() => window.location.reload()} className="btn-primary"><RefreshCcw size={16} /> আবার চেষ্টা করুন</button>
        <Link to="/" className="btn-outline"><Home size={16} /> হোমে ফিরে যান</Link>
      </div>
    </div>
  );
}
