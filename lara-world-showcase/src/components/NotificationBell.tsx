import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NotificationCenter } from './NotificationCenter';
import { useNotificationContext } from '../contexts/NotificationContext';

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const { unreadCount } = useNotificationContext();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsNotificationCenterOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter
        userId={userId}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </>
  );
};
