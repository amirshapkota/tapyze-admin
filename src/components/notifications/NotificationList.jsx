import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

export default NotificationList;