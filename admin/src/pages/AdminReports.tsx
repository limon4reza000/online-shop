import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { StatCard } from '@/components/admin/StatCard';
import { formatPrice } from '@/lib/format';
import { Banknote, TrendingUp, Package, Percent } from 'lucide-react';
import { useSalesReport, useCategorySales, useWeeklyProfit, useTopProducts } from '@/hooks/useAnalytics';
import { useScrollTrack } from '@/hooks/useScrollTrack';

function ChartScrollBar({ thumbWidth, thumbLeft }: { thumbWidth: number; thumbLeft: number }) {
  return (
    <div className="mt-2 h-1.5 rounded-full bg-primary-light overflow-hidden" style={{ marginLeft: 56 }}>
      <div className="h-full bg-primary rounded-full" style={{ width: `${thumbWidth}%`, marginLeft: `${thumbLeft}%` }} />
    </div>
  );
}

// Minimum horizontal room per week tick — once the data won't fit the card at this
// width, the chart body scrolls sideways while the Y-axis (its own tiny fixed chart
// alongside) stays put.
const MIN_TICK_WIDTH = 90;

export default function AdminReports() {
  const { data: report, isLoading: reportLoading } = useSalesReport();
  const { data: salesByCategory = [], isLoading: categoryLoading } = useCategorySales();
  const { data: profitTrend = [], isLoading: profitLoading } = useWeeklyProfit(6);
  const { data: topProducts = [], isLoading: productsLoading } = useTopProducts(6);
  const profitScroll = useScrollTrack<HTMLDivElement>([profitTrend.length]);

  return (
    <div className="space-y-6">
      <Seo title="Sales Reports" />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">বিক্রয় প্রতিবেদন</h2>
          <p className="text-sm text-text-secondary mt-1">আয়, মুনাফার হার এবং শীর্ষ পারফর্মারদের বিস্তারিত বিশ্লেষণ (গত ৩০ দিন)।</p>
        </div>
        <button className="btn-outline btn-sm"><Download size={14} /> সিএসভি এক্সপোর্ট করুন</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="মোট আয়" value={reportLoading ? '...' : formatPrice(report?.totalRevenue ?? 0)} change={report?.revenueChange} icon={Banknote} />
        <StatCard label="নিট মুনাফা" value={reportLoading ? '...' : formatPrice(report?.netProfit ?? 0)} change={report?.netProfitChange} icon={TrendingUp} />
        <StatCard label="বিক্রিত ইউনিট" value={reportLoading ? '...' : (report?.unitsSold ?? 0).toLocaleString('bn-BD')} change={report?.unitsSoldChange} icon={Package} />
        <StatCard label="গড় মার্জিন" value={reportLoading ? '...' : `${report?.avgMargin ?? 0}%`} change={report?.avgMarginChange} icon={Percent} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-surface p-5">
          <h3 className="font-bold mb-4">ক্যাটাগরি অনুযায়ী বিক্রয়</h3>
          {categoryLoading ? (
            <div className="h-70 grid place-items-center"><Loader2 size={24} className="animate-spin text-primary/40" /></div>
          ) : salesByCategory.length === 0 ? (
            <div className="h-70 grid place-items-center text-sm text-text-secondary">এখনো কোনো বিক্রয় তথ্য নেই</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesByCategory} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
                <Bar dataKey="sales" fill="#F778A1" radius={[0, 8, 8, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card-surface p-5 min-w-0">
          <h3 className="font-bold mb-4">সাপ্তাহিক মুনাফার প্রবণতা</h3>
          {profitLoading ? (
            <div className="h-70 grid place-items-center"><Loader2 size={24} className="animate-spin text-primary/40" /></div>
          ) : (
            <div className="flex">
              <div className="shrink-0" style={{ width: 56 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={profitTrend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} width={56} />
                    {/* Invisible — only here so this chart computes the same domain/ticks as the real one alongside it. */}
                    <Line dataKey="profit" stroke="none" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div ref={profitScroll.ref} onScroll={profitScroll.onScroll} className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
                <div style={{ minWidth: profitTrend.length * MIN_TICK_WIDTH, width: '100%' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={profitTrend} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                      <YAxis hide width={0} />
                      <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
                      <Line type="monotone" dataKey="profit" stroke="#F778A1" strokeWidth={2.5} dot={{ r: 4, fill: '#F778A1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {!profitLoading && <ChartScrollBar thumbWidth={profitScroll.metrics.thumbWidth} thumbLeft={profitScroll.metrics.thumbLeft} />}
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
              {productsLoading ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 size={20} className="mx-auto animate-spin text-primary/40" /></td></tr>
              ) : topProducts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-text-secondary">এখনো কোনো বিক্রয় তথ্য নেই</td></tr>
              ) : (
                topProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                      <span className="font-medium line-clamp-1">{p.name}</span>
                    </td>
                    <td className="py-3 pr-4">{p.units}</td>
                    <td className="py-3 pr-4 font-semibold">{formatPrice(p.revenue)}</td>
                    <td className="py-3">{p.rating.toFixed(1)} ★</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
