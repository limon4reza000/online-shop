import { useEffect, useState } from 'react';

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ target, light = false }: { target: number; light?: boolean }) {
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = [['দিন', time.d], ['ঘণ্টা', time.h], ['মিনিট', time.m], ['সেকেন্ড', time.s]];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map(([label, value]) => (
        <div
          key={label}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 min-w-[58px] sm:min-w-[68px] ${
            light ? 'bg-white/15 backdrop-blur text-white' : 'bg-text-primary text-white'
          }`}
        >
          <span className="text-lg sm:text-2xl font-bold font-display tabular-nums">{String(value).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-wide opacity-80">{label}</span>
        </div>
      ))}
    </div>
  );
}
