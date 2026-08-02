import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { StatCard } from '@/components/admin/StatCard';
import { formatPrice } from '@/lib/format';
import { products } from '@/lib/data';
import { DollarSign, TrendingUp, Package, Percent } from 'lucide-react';

const salesByCategory = [
  { name: 'নারী', sales: 42100 }, { name: 'পুরুষ', sales: 28900 }, { name: 'জুতা', sales: 31200 },
  { name: 'ব্যাগ', sales: 18700 }, { name: 'আনুষঙ্গিক', sales: 14300 }, { name: 'বিউটি', sales: 9800 },
];

const profitTrend = [
  { week: 'সপ্তাহ ১', profit: 4200 }, { week: 'সপ্তাহ ২', profit: 5100 }, { week: 'সপ্তাহ ৩', profit: 4800 },
  { week: 'সপ্তাহ ৪', profit: 6300 }, { week: 'সপ্তাহ ৫', profit: 5900 }, { week: 'সপ্তাহ ৬', profit: 7100 },
];

const topProducts = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6);

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <Seo title="Sales Reports" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">বিক্রয় প্রতিবেদন</h2>
          <p className="text-sm text-text-secondary mt-1">আয়, মুনাফার হার এবং শীর্ষ পারফর্মারদের বিস্তারিত বিশ্লেষণ।</p>
        </div>
        <button className="btn-outline btn-sm"><Download size={14} /> সিএসভি এক্সপোর্ট করুন</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="মোট আয়" value="$145,200" change={9.2} icon={DollarSign} />
        <StatCard label="নিট মুনাফা" value="$33,400" change={6.8} icon={TrendingUp} />
        <StatCard label="বিক্রিত ইউনিট" value="3,842" change={4.1} icon={Package} />
        <StatCard label="গড় মার্জিন" value="23.4%" change={-0.8} icon={Percent} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-surface p-5">
          <h3 className="font-bold mb-4">ক্যাটাগরি অনুযায়ী বিক্রয়</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesByCategory} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
              <Bar dataKey="sales" fill="#F778A1" radius={[0, 8, 8, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-bold mb-4">সাপ্তাহিক মুনাফার প্রবণতা</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={profitTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
              <Line type="monotone" dataKey="profit" stroke="#F778A1" strokeWidth={2.5} dot={{ r: 4, fill: '#F778A1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-bold mb-4">শীর্ষ পারফর্মিং পণ্য</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-text-secondary">
                <th className="py-2.5 pr-4">পণ্য</th>
                <th className="py-2.5 pr-4">বিক্রিত ইউনিট</th>
                <th className="py-2.5 pr-4">আয়</th>
                <th className="py-2.5">রেটিং</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover" />
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </td>
                  <td className="py-3 pr-4">{p.reviewCount}</td>
                  <td className="py-3 pr-4 font-semibold">{formatPrice(p.price * p.reviewCount)}</td>
                  <td className="py-3">{p.rating.toFixed(1)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
