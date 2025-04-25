interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  percentChange?: number;
  changeText?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  percentChange,
  changeText = "from last month"
}: StatCardProps) {
  const isPositiveChange = percentChange && percentChange > 0;
  const isNegativeChange = percentChange && percentChange < 0;
  
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="stat-value mt-1">{value}</p>
        </div>
        <div className={`${iconBgColor} p-3 rounded-full opacity-90`}>
          <span className={`material-icons ${iconColor}`}>{icon}</span>
        </div>
      </div>
      {percentChange !== undefined && (
        <div className="flex items-center mt-4 text-sm">
          <span className={`flex items-center ${isPositiveChange ? 'text-success' : isNegativeChange ? 'text-destructive' : 'text-muted-foreground'}`}>
            <span className="material-icons text-sm mr-1">
              {isPositiveChange ? 'arrow_upward' : isNegativeChange ? 'arrow_downward' : 'remove'}
            </span>
            {Math.abs(percentChange)}%
          </span>
          <span className="text-muted-foreground ml-2">{changeText}</span>
        </div>
      )}
    </div>
  );
}
