import { AlarmTimeline } from '../../../screen/stream/stream.model';

export type TimelineTab = 'timeline' | 'speed graph' | 'driver' | 'fuel graph';

export interface IconGroup {
  x: number;
  icons: Icon[];
  isExpanded?: boolean;
}

export interface Icon {
  x: number;
  icon: string;
  eventId?: string;
  eventName: string;
  eventIcon: string;
  date: Date | (string & Date);
  speed?: number;
  temperature?: number;
  thumbnail?: string | null | undefined;
}

export interface HighlightMarkers {
  icons: Icon[];
  flip: boolean;
  position: number;
}

export interface Icon {
  x: number;
  icon: string;
  eventName: string;
  eventIcon: string;
  date: Date | (string & Date);
  speed?: number;
  temperature?: number;
  thumbnail?: string | null | undefined;
}

export interface TimelineIcon {
  eventName: string;
  eventIcon: string;
  eventId?: string;
  date: string | Date;
  icon: string;
  speed?: number;
  temperature?: number;
  thumbnail?: string | null | undefined;
}

export interface TimelineEvent {
  name: string;
  startTime: string | Date;
  endTime: string | Date;
  filetype: number;
}

export interface SpeedDataPoint {
  time: string | Date;
  speed: number;
  rpm: number;
}

export interface FuelDataPoint {
  time: string | Date;
  fuelVolume: number;
  fuelLevel: number;
}

export interface HybridDataPoint {
  time: string | Date;
  hybridLevel: number;
}

export interface TimelineData {
  date: string | Date;
  eventTimeline?: { events: TimelineEvent[]; icons: TimelineIcon[] };
  speedTimeline?: SpeedDataPoint[];
  fuelTimeline?: FuelDataPoint[];
  hybridTimeline?: HybridDataPoint[];
  maxFuel?: number | null;
  driverTimeline?: { events: TimelineEvent[]; icons: TimelineIcon[] };
  alarmTimeline?: AlarmTimeline[];
}

export interface TimelineClip {
  startTime: Date;
  endTime: Date;
}
