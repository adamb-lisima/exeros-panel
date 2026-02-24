import { MapCoordinates, MapMarkerData } from 'src/app/model/map.model';
import { SelectControl } from 'src/app/shared/component/control/select-control/select-control.model';

export const vehicleOptions: SelectControl[] = [
  {
    value: '849JKA82K',
    label: '849JKA82K'
  }
];

export const driversOptions: SelectControl[] = [
  {
    value: 'John Smith',
    label: 'John Smith'
  }
];

export const mapCenter: MapCoordinates = [0, 0];

export const mapMarkers: MapMarkerData[] = [{ id: 0, coordinates: [0, 0], type: 'start' }];

export interface EventInformation {
  status: 'red' | 'green' | 'blue';
  date: string;
  event: string;
}

export const eventInformations: EventInformation[] = [
  {
    status: 'red',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'blue',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'green',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'green',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'blue',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'red',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'red',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'green',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  },
  {
    status: 'red',
    date: '21-08-2023 09:16:12',
    event: 'Harsh Braking'
  }
];

export type CrashType = 'flat-tire' | 'rear-mirror' | 'side-collision';
export interface CrashEvent {
  type: CrashType;
  name: string;
  date: string;
}

export const crashEvents: CrashEvent[] = [
  {
    type: 'flat-tire',
    name: 'Flat Tire',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'rear-mirror',
    name: 'Rear miror crash',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'side-collision',
    name: 'Side collision',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'flat-tire',
    name: 'Flat Tire',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'rear-mirror',
    name: 'Rear miror crash',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'side-collision',
    name: 'Side collision',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'flat-tire',
    name: 'Flat Tire',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'rear-mirror',
    name: 'Rear miror crash',
    date: '21-08-2023 09:16:12'
  },
  {
    type: 'side-collision',
    name: 'Side collision',
    date: '21-08-2023 09:16:12'
  }
];

export interface TripInfo {
  start: string;
  end: string;
  averageSpeed: string;
  distance: string;
  duration: string;
}

export const tripInfos: TripInfo[] = [
  {
    start: '2464 Royal Ln. Mesa, New Jersey 45463',
    end: '4414 Spring Haven Trail, New Jersey 07701',
    averageSpeed: '60 Mph',
    distance: '260 Km',
    duration: '7.18 Hrs'
  },
  {
    start: '2464 Royal Ln. Mesa, New Jersey 45463',
    end: '4414 Spring Haven Trail, New Jersey 07701',
    averageSpeed: '60 Mph',
    distance: '260 Km',
    duration: '7.18 Hrs'
  },
  {
    start: '2464 Royal Ln. Mesa, New Jersey 45463',
    end: '4414 Spring Haven Trail, New Jersey 07701',
    averageSpeed: '60 Mph',
    distance: '260 Km',
    duration: '7.18 Hrs'
  },
  {
    start: '2464 Royal Ln. Mesa',
    end: '4414 Spring Haven Trail',
    averageSpeed: '60 Mph',
    distance: '260 Km',
    duration: '7.18 Hrs'
  },
  {
    start: '2464 Royal Ln. Mesa, New Jersey 45463',
    end: '4414 Spring Haven Trail, New Jersey 07701',
    averageSpeed: '60 Mph',
    distance: '260 Km',
    duration: '7.18 Hrs'
  }
];
