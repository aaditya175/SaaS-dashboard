import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  iconBg?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  highlight?: boolean;
}

export default function KPICard({ title, value, change, changeLabel, icon, iconBg = 'bg-primary/10', subtitle, trend, highlight }: KPICardProps) {
  const isPositive = (change ?? 0) >= 0;
  const trendDir = trend ?? (isPositive ? 'up' : 'down');

  return (
    <div className={`
      rounded-xl border border-border bg-card p-5 flex flex-col gap-3 transition-all duration-200
      hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-default group
      ${highlight ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-card' : ''}
    `}>
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendDir === 'up' ? 'bg-emerald-500/15 text-emerald-400' :
            trendDir === 'down' ? 'bg-red-500/15 text-red-400' :
            'bg-muted text-muted-foreground'
          }`}>
            {trendDir === 'up' ? <TrendingUp className="w-3 h-3" /> :
             trendDir === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground font-display leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        {(subtitle || changeLabel) && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle ?? changeLabel}</p>
        )}
      </div>
    </div>
  );
}
