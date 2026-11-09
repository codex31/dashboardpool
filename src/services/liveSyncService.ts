import { StatusChangeNotification, UnlistedPendingDo, ContainerSyncInfo } from '../types';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface LiveMessage {
  type: string;
  status?: string;
  timestamp?: string;
  notification?: StatusChangeNotification;
  recentNotifications?: StatusChangeNotification[];
  unlistedPendingCount?: number;
  unlistedPendingDos?: UnlistedPendingDo[];
  connectedClients?: number;
  version?: string;
  containerSync?: ContainerSyncInfo;
}

/**
 * Web Audio synthetic notification chime (pleasant 2-tone chime)
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880.0, now + 0.12); // A5

    osc2.frequency.setValueAtTime(440.0, now); // A4
    osc2.frequency.setValueAtTime(659.25, now + 0.12); // E5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch {
    // Audio may be blocked by browser policy until first interaction, safely ignore
  }
}

/**
 * Live WebSocket client manager
 */
export class LiveSyncClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private isDestroyed = false;
  private statusListeners = new Set<(status: ConnectionStatus) => void>();
  private notificationListeners = new Set<(notif: StatusChangeNotification) => void>();
  private auditListeners = new Set<(unlisted: UnlistedPendingDo[]) => void>();
  private heartbeatListeners = new Set<(time: string) => void>();
  private containerSyncListeners = new Set<(sync: ContainerSyncInfo) => void>();

  public connectionStatus: ConnectionStatus = 'connecting';
  public lastHeartbeat: string = new Date().toISOString();
  public unlistedPendingDos: UnlistedPendingDo[] = [];
  public containerSync: ContainerSyncInfo | null = null;
  public appVersion: string = '1.7.0';

  constructor() {
    this.connect();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/live`;
  }

  public connect() {
    if (this.isDestroyed) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.updateStatus('connecting');

    try {
      const url = this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.updateStatus('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: LiveMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (err) {
          console.warn('[LiveSync] Error parsing message:', err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.updateStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[LiveSync] WebSocket error:', err);
        this.ws?.close();
      };
    } catch (err) {
      console.warn('[LiveSync] Connection failed:', err);
      this.updateStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private handleMessage(msg: LiveMessage) {
    if (msg.timestamp) {
      this.lastHeartbeat = msg.timestamp;
      this.heartbeatListeners.forEach((fn) => fn(msg.timestamp!));
    }

    switch (msg.type) {
      case 'INITIAL_CONNECTION':
        if (Array.isArray(msg.unlistedPendingDos)) {
          this.unlistedPendingDos = msg.unlistedPendingDos;
          this.auditListeners.forEach((fn) => fn(msg.unlistedPendingDos!));
        }
        if (msg.version) {
          this.appVersion = msg.version;
        }
        if (msg.containerSync) {
          this.containerSync = msg.containerSync;
          this.containerSyncListeners.forEach((fn) => fn(msg.containerSync!));
        }
        break;

      case 'CONTAINER_SYNC_STATUS':
        if (msg.status) {
          const syncInfo: ContainerSyncInfo = {
            status: (msg.status as any) || 'synced',
            peerUrl: (msg as any).peerUrl || 'https://dashboardpool.ai.studio',
            lastSyncTime: (msg as any).lastSyncTime || new Date().toISOString(),
            message: `Sinkron dengan ${(msg as any).peerUrl || 'peer'}`,
            version: msg.version || this.appVersion,
          };
          this.containerSync = syncInfo;
          this.containerSyncListeners.forEach((fn) => fn(syncInfo));
        }
        break;

      case 'STATUS_CHANGED':
        if (msg.notification) {
          playNotificationSound();
          this.notificationListeners.forEach((fn) => fn(msg.notification!));
        }
        break;

      case 'PENDING_AUDIT_WARNING':
        if (Array.isArray(msg.unlistedPendingDos)) {
          this.unlistedPendingDos = msg.unlistedPendingDos;
          this.auditListeners.forEach((fn) => fn(msg.unlistedPendingDos!));
        }
        break;

      case 'LIVE_HEARTBEAT':
        if (Array.isArray(msg.unlistedPendingDos)) {
          this.unlistedPendingDos = msg.unlistedPendingDos;
          this.auditListeners.forEach((fn) => fn(msg.unlistedPendingDos!));
        }
        break;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed) return;
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private updateStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public onStatusChange(fn: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(fn);
    fn(this.connectionStatus);
    return () => this.statusListeners.delete(fn);
  }

  public onNotification(fn: (notif: StatusChangeNotification) => void): () => void {
    this.notificationListeners.add(fn);
    return () => this.notificationListeners.delete(fn);
  }

  public onAuditUpdate(fn: (unlisted: UnlistedPendingDo[]) => void): () => void {
    this.auditListeners.add(fn);
    if (this.unlistedPendingDos.length > 0) {
      fn(this.unlistedPendingDos);
    }
    return () => this.auditListeners.delete(fn);
  }

  public onHeartbeat(fn: (time: string) => void): () => void {
    this.heartbeatListeners.add(fn);
    return () => this.heartbeatListeners.delete(fn);
  }

  public onContainerSyncChange(fn: (sync: ContainerSyncInfo) => void): () => void {
    this.containerSyncListeners.add(fn);
    if (this.containerSync) {
      fn(this.containerSync);
    }
    return () => this.containerSyncListeners.delete(fn);
  }

  public triggerImmediatePoll() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'TRIGGER_POLL' }));
    }
  }

  public triggerContainerSync() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'TRIGGER_CONTAINER_SYNC' }));
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.statusListeners.clear();
    this.notificationListeners.clear();
    this.auditListeners.clear();
    this.heartbeatListeners.clear();
  }
}

// Global singleton instance
export const liveSyncClient = new LiveSyncClient();
