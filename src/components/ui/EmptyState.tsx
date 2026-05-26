import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#9CA3AF]" />
      </div>
      <p className="text-base font-semibold text-[#111827] mb-1">{title}</p>
      {description && (
        <p className="text-sm text-[#6B7280] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
