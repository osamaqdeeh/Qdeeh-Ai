import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  createdAt: Date;
  student: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface RecentActivityProps {
  payments: Payment[];
}

export function RecentActivity({ payments }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={payment.student.image || undefined} />
            <AvatarFallback>
              {payment.student.name?.charAt(0).toUpperCase() || 
               payment.student.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {payment.student.name || payment.student.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(payment.createdAt)}
            </p>
          </div>
          <div className="font-medium">{formatPrice(payment.amount)}</div>
        </div>
      ))}
    </div>
  );
}
