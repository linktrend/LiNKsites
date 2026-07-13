'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Bell, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Project Updated',
      message: 'Website Redesign project has been updated with new design files. The team has added comprehensive wireframes, user flow diagrams, and high-fidelity mockups for the homepage, about page, and product catalog sections.',
      time: '5 minutes ago',
      read: false,
      type: 'info',
    },
    {
      id: '2',
      title: 'Task Completed',
      message: 'Your team member completed the API Integration task',
      time: '1 hour ago',
      read: false,
      type: 'success',
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM UTC',
      time: '3 hours ago',
      read: true,
      type: 'warning',
    },
    {
      id: '4',
      title: 'New Team Member',
      message: 'Sarah Johnson has joined your team',
      time: '1 day ago',
      read: true,
      type: 'info',
    },
    {
      id: '5',
      title: 'Payment Received',
      message: 'Monthly subscription payment has been processed successfully',
      time: '2 days ago',
      read: true,
      type: 'success',
    },
    {
      id: '6',
      title: 'Security Alert',
      message: 'New login detected from an unrecognized device',
      time: '3 days ago',
      read: true,
      type: 'error',
    },
  ];

  if (!isOpen) return null;

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-danger'; // Urgent messages
      case 'warning':
        return 'bg-warning'; // System maintenance
      case 'success':
        return 'bg-success'; // Success messages
      case 'info':
      default:
        return 'bg-primary'; // Normal messages
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 modal-backdrop z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        tabIndex={-1}
        className="fixed top-20 right-6 w-[36rem] max-h-[600px] rounded-lg shadow-2xl z-50 overflow-hidden modal-bg text-card-foreground border"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="notifications-title" className="text-lg font-semibold text-card-foreground">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5 text-card-foreground/70" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-card-foreground/30 mb-3" />
              <p className="text-card-foreground/70">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-all group",
                    !notification.read && "bg-accent/20"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0", 
                      notification.read ? "bg-gray-400" : getTypeColor(notification.type)
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={cn(
                          "text-sm text-card-foreground truncate",
                          notification.read ? "font-normal" : "font-semibold"
                        )}>
                          {notification.title}
                        </h3>
                      </div>
                      <p className={cn(
                        "text-xs text-card-foreground/70 mb-2",
                        !expandedNotifications.has(notification.id) && notification.message.length > 100 && "line-clamp-2"
                      )}>
                        {notification.message}
                      </p>
                      {notification.message.length > 100 && (
                        <button
                          onClick={() => toggleExpand(notification.id)}
                          className="text-xs text-primary font-medium hover:underline mb-2 flex items-center gap-1"
                        >
                          {expandedNotifications.has(notification.id) ? (
                            <>Show Less <ChevronUp className="h-3 w-3" /></>
                          ) : (
                            <>Expand Message <ChevronDown className="h-3 w-3" /></>
                          )}
                        </button>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-card-foreground/50">{notification.time}</span>
                        <div className="flex gap-1">
                          <button
                            className="p-1 hover:bg-white/20 rounded transition-all"
                            aria-label="Mark as read"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5 text-card-foreground/70" />
                          </button>
                          <button
                            className="p-1 hover:bg-red-500/20 rounded transition-all"
                            aria-label="Delete notification"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
