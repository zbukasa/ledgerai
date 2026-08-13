
import { io, Socket } from 'socket.io-client';

class RealtimeService {
    private socket: Socket | null = null;
    private businessId: string | null = null;

    connect(businessId: string) {
        if (this.socket?.connected && this.businessId === businessId) return;
        
        if (this.socket) {
            this.socket.disconnect();
        }

        this.businessId = businessId;
        this.socket = io(window.location.origin);

        this.socket.on('connect', () => {
            console.log('Connected to realtime server');
            this.socket?.emit('join-business', businessId);
        });

        this.socket.on('data-sync', (payload) => {
            console.log('Received sync event:', payload);
            // Dispatch custom event for contexts to listen to
            window.dispatchEvent(new CustomEvent('realtime-sync', { detail: payload }));
        });
    }

    broadcast(type: string, data: any, businessId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('data-change', { type, data, businessId });
    }

    on(event: string, callback: (data: any) => void) {
        const handler = (e: any) => callback(e.detail);
        window.addEventListener(event, handler);
        return handler; // Return handler for off() if needed, but this is messy
    }

    // Better: just use window directly in App.tsx or fix RealtimeService
    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
        this.businessId = null;
    }
}

export const realtimeService = new RealtimeService();
