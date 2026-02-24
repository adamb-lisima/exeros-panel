import { NotificationType } from '../screen/settings/settings.model';

const NotificationUtil = {
  getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.VEHICLE_CHECKS:
        return 'assets/svg/icons-gray-back/55.svg';
      case NotificationType.EVENT_OCCURRED:
        return 'assets/svg/icons-gray-back/49.svg';
      case NotificationType.EVENT_ESCALATED:
        return 'assets/svg/icons-gray-back/49.svg';
      case NotificationType.ACCIDENTS:
        return 'assets/svg/icons-gray-back/54.svg';
      case NotificationType.VEHICLE_ISSUES:
        return 'assets/svg/icons-gray-back/56.svg';
    }
  },
  getName(type: NotificationType): string {
    switch (type) {
      case NotificationType.ACCIDENTS:
        return 'Accidents';
      case NotificationType.VEHICLE_CHECKS:
        return 'Vehicle checks';
      case NotificationType.EVENT_OCCURRED:
        return 'Event occurred';
      case NotificationType.EVENT_ESCALATED:
        return 'Event escalated';
      case NotificationType.VEHICLE_ISSUES:
        return 'Vehicle issues';
    }
  }
};

export default NotificationUtil;
