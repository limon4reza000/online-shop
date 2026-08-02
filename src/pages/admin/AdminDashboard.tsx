import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Seo } from '@/components/ui/Seo';
import { mockOrders, products, categories } from '@/lib/data';
import { formatPrice } from '@/lib/format';

const revenueData = [
  { month: 'জানু', revenue: 18400, orders: 210 },
  { month: 'ফেব্রু', revenue: 21200, orders: 245 },
  { month: 'মার্চ', revenue: 19800, orders: 228 },
  { month: 'এপ্রি', revenue: 24600, orders: 271 },
  { month: 'মে', revenue: 28100, orders: 305 },
  { month: 'জুন', revenue: 26300, orders: 290 },
  { month: 'জুলা', revenue: 31500, orders: 334 },
];

const categoryData = categories.slice(0, 6).map((c) => ({ name: c.name, value: c.count }));
const PIE_COLORS = ['#F778A1', '#E86492', '#FBB6CE', '#F3D6E2', '#C084FC', '#FDA4AF'];

const orderStatusLabels: Record<string, string> = {
  processing: 'প্রক্রিয়াধীন',
  shipped: 'পাঠানো হয়েছে',
  'out-for-delivery': 'ডেলিভারির পথে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

export default function AdminDashboard() {
  const totalRevenue = mockOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <Seo title="Admin Analytics" />
      <div>
        <h2 className="text-2xl font-bold">ড্যাশবোর্ড বিশ্লেষণ</h2>
        <p className="text-sm text-text-secondary mt-1">এই মাসে আপনার দোকানের কার্যক্রমের সারসংক্ষেপ।</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="মোট আয়" value={formatPrice(totalRevenue)} change={12.4} icon={DollarSign} />
        <StatCard label="মোট অর্ডার" value={String(mockOrders.length * 84)} change={8.1} icon={ShoppingCart} />
        <StatCard label="মোট গ্রাহক" value="4,218" change={5.6} icon={Users} />
        <StatCard label="মোট পণ্য" value={String(products.length)} change={-1.2} icon={Package} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card-surface p-5 lg:col-span-2">
          <h3 className="font-bold mb-4">আয়ের সারসংক্ষেপ</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F778A1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F778A1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
              <Area type="monotone" dataKey="revenue" stroke="#F778A1" strokeWidth={2.5} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-bold mb-4">ক্যাটাগরি অনুযায়ী বিক্রয়</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-bold mb-4">মাস অনুযায়ী অর্ডার</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
            <Bar dataKey="orders" fill="#F778A1" radius={[8, 8, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-bold mb-4">সাম্প্রতিক অর্ডার</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-text-secondary">
                <th className="py-2.5 pr-4">অর্ডার আইডি</th>
                <th className="py-2.5 pr-4">অবস্থা</th>
                <th className="py-2.5 pr-4">আইটেম</th>
                <th className="py-2.5">মোট</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-semibold">{o.id}</td>
                  <td className="py-3 pr-4">{orderStatusLabels[o.status] ?? o.status}</td>
                  <td className="py-3 pr-4">{o.items.length}</td>
                  <td className="py-3 font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
