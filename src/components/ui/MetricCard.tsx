interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ElementType;
  iconBgColor: string;
}

export default function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  iconBgColor,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0F172A] mb-1">{value}</p>
      <p className="text-xs text-[#64748B]">{trend}</p>
    </div>
  );
}
