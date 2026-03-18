"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const isFirstLoad = useRef(true);
  const prevUnreadCount = useRef(0);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        
        const newUnreadCount = data.unreadCount || 0;
        
        // Play sound if new unread notifications arrived
        if (!isFirstLoad.current && newUnreadCount > prevUnreadCount.current) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio playback failed:", e));
        }

        setUnreadCount(newUnreadCount);
        prevUnreadCount.current = newUnreadCount;
        isFirstLoad.current = false;
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Simple polling every 2 minutes for new notifications
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [session]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PUT" });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) {
          // Revert if failed
          fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      markAsRead, 
      markAllAsRead, 
      fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
