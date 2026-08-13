import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const HapticService = {
  impactLight: async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
  },
  impactMedium: async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
  },
  impactHeavy: async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  },
  notificationSuccess: async () => {
    await Haptics.notification({ type: NotificationType.Success });
  },
  notificationWarning: async () => {
    await Haptics.notification({ type: NotificationType.Warning });
  },
  notificationError: async () => {
    await Haptics.notification({ type: NotificationType.Error });
  },
  selectionChanged: async () => {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  }
};
