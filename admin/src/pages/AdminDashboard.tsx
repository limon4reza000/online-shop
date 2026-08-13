import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Banknote, ShoppingCart, Users, Package, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { Seo } from '@/components/ui/Seo';
import { formatPrice } from '@/lib/format';
import { useAnalyticsSummary, useRevenueTrend, useCategorySales } from '@/hooks/useAnalytics';
import { useAdminOrders, type OrderStatus } from '@/hooks/useOrders';
import { useScrollTrack } from '@/hooks/useScrollTrack';

function ChartScrollBar({ thumbWidth, thumbLeft }: { thumbWidth: number; thumbLeft: number }) {
  return (
    <div className="mt-2 h-1.5 rounded-full bg-primary-light overflow-hidden" style={{ marginLeft: 56 }}>
      <div className="h-full bg-primary rounded-full" style={{ width: `${thumbWidth}%`, marginLeft: `${thumbLeft}%` }} />
    </div>
  );
}

// Full month name always shown; on mobile it's angled (rotated) so all 7 still fit without overlapping.
function MonthTick({ x = 0, y = 0, payload = { value: '' } }: { x?: number; y?: number; payload?: { value: string } }) {
  const isMobile = window.innerWidth < 640;
  return (
    <text
      x={x}
      y={y}
      dy={isMobile ? 15 : 12}
      textAnchor="middle"
      fill="#6B7280"
      fontSize={12}
      transform={isMobile ? `rotate(-35, ${x}, ${y + 15})` : undefined}
    >
      {payload.value}
    </text>
  );
}

const PIE_COLORS = ['#F778A1', '#E86492', '#FBB6CE', '#F3D6E2', '#C084FC', '#FDA4AF'];

// Minimum horizontal room per month tick — once the data won't fit the card at this
// width, the chart body scrolls sideways while the Y-axis (rendered as its own tiny
// fixed chart alongside) stays put.
const MIN_TICK_WIDTH = 90;

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'অপেক্ষমাণ',
  PROCESSING: 'প্রক্রিয়াধীন',
  SHIPPED: 'পাঠানো হয়েছে',
  OUT_FOR_DELIVERY: 'ডেলিভারির পথে',
  DELIVERED: 'ডেলিভারি সম্পন্ন',
  CANCELLED: 'বাতিল',
  REFUNDED: 'ফেরত দেওয়া হয়েছে',
};

export default function AdminDashboard() {
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueTrend(7);
  const { data: categoryData = [], isLoading: categoryLoading } = useCategorySales();
  const { data: recentOrders, isLoading: ordersLoading } = useAdminOrders({ page: 1, pageSize: 6 });
  const revenueScroll = useScrollTrack<HTMLDivElement>([revenueData.length]);
  const ordersScroll = useScrollTrack<HTMLDivElement>([revenueData.length]);

  return (
    <div className="space-y-6">
      <Seo title="Admin Analytics" />
      <div>
        <h2 className="text-2xl font-bold">ড্যাশবোর্ড বিশ্লেষণ</h2>
        <p className="text-sm text-text-secondary mt-1">আপনার দোকানের কার্যক্রমের লাইভ সারসংক্ষেপ।</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="মোট আয়" value={summaryLoading ? '...' : formatPrice(summary?.totalRevenue ?? 0)} change={summary?.revenueChange} icon={Banknote} />
        <StatCard label="মোট অর্ডার" value={summaryLoading ? '...' : String(summary?.totalOrders ?? 0)} change={summary?.ordersChange} icon={ShoppingCart} />
        <StatCard label="মোট গ্রাহক" value={summaryLoading ? '...' : (summary?.totalCustomers ?? 0).toLocaleString('bn-BD')} change={summary?.customersChange} icon={Users} />
        <StatCard label="মোট পণ্য" value={summaryLoading ? '...' : String(summary?.totalProducts ?? 0)} change={summary?.productsChange} icon={Package} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card-surface p-5 lg:col-span-2 min-w-0">
          <h3 className="font-bold mb-4">আয়ের সারসংক্ষেপ</h3>
          {revenueLoading ? (
            <div className="h-70 grid place-items-center"><Loader2 size={24} className="animate-spin text-primary/40" /></div>
          ) : (
            <div className="flex">
              <div className="shrink-0" style={{ width: 56 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${v / 1000}k`} width={56} />
                    {/* Invisible — only here so this chart computes the same domain/ticks as the real one alongside it. */}
                    <Area dataKey="revenue" stroke="none" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div ref={revenueScroll.ref} onScroll={revenueScroll.onScroll} className="flex-1 min-w-0 overflow-x-scroll chart-x-scroll">
                <div style={{ minWidth: revenueData.length * MIN_TICK_WIDTH, width: '100%' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={revenueData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F778A1" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#F778A1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" vertical={false} />
                      <XAxis dataKey="month" tick={<MonthTick />} interval={0} axisLine={false} tickLine={false} height={46} />
                      <YAxis hide width={0} />
                      <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#F778A1" strokeWidth={2.5} fill="url(#revGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {!revenueLoading && <ChartScrollBar thumbWidth={revenueScroll.metrics.thumbWidth} thumbLeft={revenueScroll.metrics.thumbLeft} />}
        </div>

        <div className="card-surface p-5">
          <h3 className="font-bold mb-4">ক্যাটাগরি অনুযায়ী বিক্রয়</h3>
          {categoryLoading ? (
            <div className="h-70 grid place-items-center"><Loader2 size={24} className="animate-spin text-primary/40" /></div>
          ) : categoryData.length === 0 ? (
            <div className="h-70 grid place-items-center text-sm text-text-secondary">এখনো কোনো বিক্রয় তথ্য নেই</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} dataKey="sales" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatPrice(Number(v))} contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-bold mb-4">মাস অনুযায়ী অর্ডার</h3>
        {revenueLoading ? (
          <div className="h-65 grid place-items-center"><Loader2 size={24} className="animate-spin text-primary/40" /></div>
        ) : (
          <div className="flex">
            <div className="shrink-0" style={{ width: 56 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={56} />
                  {/* Invisible — only here so this chart computes the same domain/ticks as the real one alongside it. */}
                  <Bar dataKey="orders" fill="none" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div ref={ordersScroll.ref} onScroll={ordersScroll.onScroll} className="flex-1 min-w-0 overflow-x-scroll chart-x-scroll">
              <div style={{ minWidth: revenueData.length * MIN_TICK_WIDTH, width: '100%' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3D6E2" vertical={false} />
                    <XAxis dataKey="month" tick={<MonthTick />} interval={0} axisLine={false} tickLine={false} height={46} />
                    <YAxis hide width={0} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F3D6E2' }} />
                    <Bar dataKey="orders" fill="#F778A1" radius={[8, 8, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {!revenueLoading && <ChartScrollBar thumbWidth={ordersScroll.metrics.thumbWidth} thumbLeft={ordersScroll.metrics.thumbLeft} />}
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
              {ordersLoading ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 size={20} className="mx-auto animate-spin text-primary/40" /></td></tr>
              ) : (recentOrders?.data.length ?? 0) === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-text-secondary">এখনো কোনো অর্ডার নেই</td></tr>
              ) : (
                recentOrders!.data.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-semibold">{o.id.slice(0, 10).toUpperCase()}</td>
                    <td className="py-3 pr-4">{orderStatusLabels[o.status] ?? o.status}</td>
                    <td className="py-3 pr-4">{o.items.length}</td>
                    <td className="py-3 font-semibold">{formatPrice(Number(o.total))}</td>
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
