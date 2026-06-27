interface StatusBadgeProps {
  status:
    | "Scheduled"
    | "Needs Review"
    | "Approved"
    | "Draft"
    | "Idea"
    | "Published"
    | "Winning"
    | "Underperforming"
    | "Average"
    | "Planned"
    | "Missing";
  size?: "sm" | "md";
}

const statusStyles: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-700",
  "Needs Review": "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Draft: "bg-slate-100 text-slate-600",
  Idea: "bg-slate-100 text-slate-600",
  Published: "bg-green-100 text-green-700",
  Winning: "bg-green-100 text-green-700",
  Underperforming: "bg-red-100 text-red-700",
  Average: "bg-slate-100 text-slate-600",
  Planned: "bg-amber-100 text-amber-700",
  Missing: "bg-red-100 text-red-700",
};

export default function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const baseStyle = statusStyles[status] ?? "bg-slate-100 text-slate-600";
  const sizeStyle =
    size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${baseStyle} ${sizeStyle}`}>
      {status}
    </span>
  );
}
