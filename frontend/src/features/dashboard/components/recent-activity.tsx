import { Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Shape a real activity entry will take once activity tracking exists. */
export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
}

interface RecentActivityProps {
  items?: ActivityItem[];
}

/**
 * Recent activity feed. Renders an empty state today; pass `items` later (from
 * a future activity API) and the list renders automatically — no restructure
 * needed.
 */
export function RecentActivity({ items = [] }: RecentActivityProps) {
  const isEmpty = items.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" aria-hidden />
            <p className="text-sm">No activity available</p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 text-sm">
                <span>{item.title}</span>
                <span className="text-muted-foreground">{item.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
