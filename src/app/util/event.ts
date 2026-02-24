import { Event } from '../screen/events/events.model';
import { UserData } from '../store/auth/auth.model';

const EventUtil = {
  isStatusSelected(status: string, loggedInUser: UserData, event: Event): boolean {
    if (event.last_status) {
      return status === event.last_status;
    }

    if (loggedInUser.reviewer_level === 'LEVEL_1') {
      return status === event.status;
    }
    if (loggedInUser.reviewer_level === 'LEVEL_2') {
      return status === event.level2_status;
    }
    return false;
  }
};

export default EventUtil;
