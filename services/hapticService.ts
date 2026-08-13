import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class HapticService {
    static async impactLight() {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async impactMedium() {
        try {
            await Haptics.impact({ style: ImpactStyle.Medium });
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async impactHeavy() {
        try {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async notificationSuccess() {
        try {
            await Haptics.notification({ type: NotificationType.Success });
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async notificationWarning() {
        try {
            await Haptics.notification({ type: NotificationType.Warning });
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async notificationError() {
        try {
            await Haptics.notification({ type: NotificationType.Error });
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async selectionStart() {
        try {
            await Haptics.selectionStart();
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async selectionChanged() {
        try {
            await Haptics.selectionChanged();
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }

    static async selectionEnd() {
        try {
            await Haptics.selectionEnd();
        } catch (e) {
            // Silently fail if not on a mobile device
        }
    }
}
