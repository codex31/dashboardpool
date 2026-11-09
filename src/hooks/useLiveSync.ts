import { useState, useEffect, useCallback } from 'react';
import { liveSyncClient, ConnectionStatus, playNotificationSound } from '../services/liveSyncService';
import { StatusChangeNotification, UnlistedPendingDo, ContainerSyncInfo } from '../types';

export function useLiveSync(onDataChange?: () => void) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(liveSyncClient.connectionStatus);
  const [recentNotifications, setRecentNotifications] = useState<StatusChangeNotification[]>([]);
  const [unlistedPendingDos, setUnlistedPendingDos] = useState<UnlistedPendingDo[]>(liveSyncClient.unlistedPendingDos);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>(liveSyncClient.lastHeartbeat);
  const [activeToast, setActiveToast] = useState<StatusChangeNotification | null>(null);
  const [containerSync, setContainerSync] = useState<ContainerSyncInfo | null>(liveSyncClient.containerSync);

  useEffect(() => {
    // 1. Connection status listener
    const unsubStatus = liveSyncClient.onStatusChange((st) => {
      setConnectionStatus(st);
    });

    let lastDataChangeTime = 0;
    // 2. Notification listener (for status changes)
    const unsubNotif = liveSyncClient.onNotification((notif) => {
      setRecentNotifications((prev) => [notif, ...prev.slice(0, 29)]);
      setActiveToast(notif);

      // Trigger automatic data re-fetch if callback provided, throttled to prevent feedback loops
      const now = Date.now();
      if (onDataChange && now - lastDataChangeTime > 12000) {
        lastDataChangeTime = now;
        onDataChange();
      }
    });

    // 3. Audit listener (unlisted pending DOs)
    const unsubAudit = liveSyncClient.onAuditUpdate((list) => {
      setUnlistedPendingDos(list);
    });

    // 4. Heartbeat listener
    const unsubHeartbeat = liveSyncClient.onHeartbeat((t) => {
      setLastHeartbeat(t);
    });

    // 5. Container sync listener
    const unsubContainerSync = liveSyncClient.onContainerSyncChange((sync) => {
      setContainerSync(sync);
    });

    // Fallback fetch only after page is fully settled (8 seconds) if WebSocket disconnected
    const fallbackTimer = setTimeout(() => {
      if (liveSyncClient.connectionStatus !== 'connected') {
        fetch('/api/live-status')
          .then((res) => res.json())
          .then((data) => {
            if (data.unlistedPendingList && Array.isArray(data.unlistedPendingList)) {
              setUnlistedPendingDos(data.unlistedPendingList);
            }
            if (data.recentNotifications && Array.isArray(data.recentNotifications)) {
              setRecentNotifications(data.recentNotifications);
            }
          })
          .catch(() => {});

        fetch('/api/container-sync-status')
          .then((res) => res.json())
          .then((data) => {
            if (data && data.status) {
              setContainerSync(data);
            }
          })
          .catch(() => {});
      }
    }, 8000);

    return () => {
      clearTimeout(fallbackTimer);
      unsubStatus();
      unsubNotif();
      unsubAudit();
      unsubHeartbeat();
      unsubContainerSync();
    };
  }, [onDataChange]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const pushLocalNotification = useCallback((notif: StatusChangeNotification) => {
    setRecentNotifications((prev) => [notif, ...prev.slice(0, 29)]);
    setActiveToast(notif);
    playNotificationSound();
  }, []);

  const triggerPoll = useCallback(() => {
    liveSyncClient.triggerImmediatePoll();
  }, []);

  const triggerContainerSync = useCallback(async () => {
    try {
      const res = await fetch('/api/container-sync-trigger', { method: 'POST' });
      const data = await res.json();
      if (data && data.status) {
        setContainerSync(data);
      }
      return data;
    } catch (err) {
      console.warn('Failed to trigger container sync:', err);
    }
  }, []);

  // Simulate DO status change for testing
  const simulateStatusChange = useCallback(
    async (noDo = '5A.XH.000058', oldStatus = 'Finish', newStatus = 'Brg', sheetName = 'tgl 15') => {
      try {
        const res = await fetch('/api/test-simulate-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noDo, oldStatus, newStatus, sheetName }),
        });
        return await res.json();
      } catch (err) {
        console.error('Failed to simulate update:', err);
      }
    },
    []
  );

  const clearAllNotifications = useCallback(() => {
    setRecentNotifications([]);
    setActiveToast(null);
  }, []);

  return {
    connectionStatus,
    recentNotifications,
    unlistedPendingDos,
    lastHeartbeat,
    activeToast,
    containerSync,
    dismissToast,
    pushLocalNotification,
    triggerPoll,
    triggerContainerSync,
    simulateStatusChange,
    clearAllNotifications,
  };
}
