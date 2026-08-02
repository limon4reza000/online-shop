import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-app section-y text-center py-24">
      <p className="text-8xl font-bold text-primary/20 font-display">৪০৪</p>
      <h1 className="mt-2 text-3xl">পেজটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mt-2 text-text-secondary">আপনি যে পেজটি খুঁজছেন তা নেই অথবা সরিয়ে ফেলা হয়েছে।</p>
      <Link to="/" className="btn-primary mt-7 inline-flex"><Home size={16} /> হোমে ফিরে যান</Link>
    </div>
  );
}
