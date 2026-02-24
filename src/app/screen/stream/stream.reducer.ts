import { createReducer, on } from '@ngrx/store';
import { DateTime } from 'luxon';
import DateConst from 'src/app/const/date';
import { StreamActions } from 'src/app/screen/stream/stream.actions';

import { AlarmsElement, AlarmsMeta, AlarmsParams, InitializedStreams, MapVehiclesElement, Playback, PlaybackParams, PlaybackScope, PlaybackScopeParams, PlaybackTimeline, PlaybackTimelineParams, TelemetryTimeline, TelemetryTimelinePoint, Trip, VehiclesElement, VehiclesMeta, VehiclesParams } from 'src/app/screen/stream/stream.model';
import { VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import RouteConst from '../../const/route';
import { Camera, LiveFeed } from '../../service/http/live-feeds/live-feeds.model';
import { MapVehiclesParams } from '../../store/common-objects/common-objects.model';
import { DEFAULT_FLEET_ID } from '../../store/common-objects/common-objects.service';
import { SharedClipResponse } from '../../store/download-task/download-task.model';

export const STREAM_FEATURE_KEY = 'stream';

export interface StreamState {
  selectedId?: VehiclesElement['id'];
  playbackActive: boolean;

  vehiclesLoading: boolean;
  vehiclesParams: VehiclesParams;
  vehicles: VehiclesElement[];
  updatedVehicles: VehiclesElement[];
  vehiclesMeta: VehiclesMeta | undefined;

  mapVehicles: MapVehiclesElement[];

  alarmsLoading: boolean;
  alarmsParams: AlarmsParams;
  alarms: AlarmsElement[];
  alarmsMeta: AlarmsMeta | undefined;

  liveFeed: LiveFeed | undefined;
  updatedLiveFeed: LiveFeed | undefined;

  playbackParams: PlaybackParams;
  playback: Playback | undefined;

  playbackTimelineParams: PlaybackTimelineParams | undefined;
  playbackTimeline: PlaybackTimeline | undefined;

  playbackScopeParams: PlaybackScopeParams | undefined;
  playbackScope: PlaybackScope | undefined;

  playbackVideoCurrentTime: DateTime | undefined;
  playbackVideoStartTime: DateTime | undefined;
  playbackSelectedSources: VideoSource[];
  previousPlaybackSelectedSources: VideoSource[];

  playbackDownloadActive: boolean;
  isTimelineFullscreen: boolean;
  timelineZoom: number;

  selectedTripIndex: number | null;
  trips: Trip[];

  telemetryTimeline: TelemetryTimeline | null;
  currentTelemetryPoint: TelemetryTimelinePoint | null;

  isPlaybackPlaying: boolean;

  initializedStreams: InitializedStreams;

  streamType: keyof Pick<Camera, 'sub_stream' | 'main_stream'>;

  playbackShareActive: boolean;
  sharedClipResponse?: SharedClipResponse[];

  clipToEventActive: boolean;

  mapFromTime: string | null;
  mapToTime: string | null;
  mapFilterParams: Partial<MapVehiclesParams>;

  lastTab: string;
}

export const streamInitialState: StreamState = {
  selectedId: undefined,
  playbackActive: false,

  vehiclesLoading: false,
  vehiclesParams: { fleet_id: DEFAULT_FLEET_ID, driver_id: undefined, vehicle_id: undefined, order: 'active-first', with_driver: true },
  vehicles: [],
  updatedVehicles: [],
  vehiclesMeta: undefined,

  mapVehicles: [],

  alarmsLoading: false,
  alarmsParams: {
    page: 1,
    per_page: 30,
    from: DateTime.now().setZone('Europe/London').minus({ day: 10 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    to: DateTime.now().setZone('Europe/London').toFormat(DateConst.serverDateTimeFormat),
    vehicle_id: undefined
  },
  alarms: [],
  alarmsMeta: undefined,

  liveFeed: undefined,
  updatedLiveFeed: undefined,

  playbackParams: {
    date: DateTime.now().setZone('Europe/London').toFormat(DateConst.serverDateFormat),
    st: '0'
  },
  playback: undefined,

  playbackTimelineParams: undefined,
  playbackTimeline: undefined,

  playbackScopeParams: undefined,
  playbackScope: undefined,

  playbackVideoCurrentTime: undefined,
  playbackVideoStartTime: undefined,
  playbackSelectedSources: [],
  previousPlaybackSelectedSources: [],

  playbackDownloadActive: false,
  isTimelineFullscreen: false,
  timelineZoom: 1,

  selectedTripIndex: null,
  trips: [],

  telemetryTimeline: null,
  currentTelemetryPoint: null,

  isPlaybackPlaying: false,

  initializedStreams: {},

  streamType: 'main_stream',

  playbackShareActive: false,
  sharedClipResponse: undefined,

  clipToEventActive: false,

  mapFromTime: null,
  mapToTime: null,

  mapFilterParams: {
    fleet_id: undefined,
    driver_id: undefined,
    vehicle_id: undefined,
    polygon: undefined
  },

  lastTab: RouteConst.stream
};

export const streamReducer = createReducer(
  streamInitialState,

  on(StreamActions.setSelectedId, (state, { id }): StreamState => ({ ...state, selectedId: id })),
  on(StreamActions.setPlaybackActive, (state, { playbackActive }): StreamState => ({ ...state, playbackActive })),

  on(StreamActions.setVehiclesLoading, (state, { loading }): StreamState => ({ ...state, vehiclesLoading: loading })),
  on(StreamActions.setVehiclesParams, (state, { params }): StreamState => ({ ...state, vehiclesParams: params })),
  on(StreamActions.fetchVehiclesSuccess, (state, { data, meta }): StreamState => ({ ...state, vehicles: data, vehiclesMeta: meta, updatedVehicles: data })),
  on(StreamActions.setUpdatedVehicles, (state, { data }): StreamState => ({ ...state, updatedVehicles: data })),

  on(StreamActions.setAlarmsLoading, (state, { loading }): StreamState => ({ ...state, alarmsLoading: loading })),
  on(StreamActions.setAlarmsParams, (state, { params }): StreamState => ({ ...state, alarmsParams: params })),
  on(StreamActions.fetchAlarmsSuccess, (state, { data, meta }): StreamState => ({ ...state, alarms: data, alarmsMeta: meta })),

  on(StreamActions.fetchLiveFeedSuccess, (state, { data }): StreamState => ({ ...state, liveFeed: data, updatedLiveFeed: data })),
  on(StreamActions.setUpdatedLiveFeed, (state, { data }): StreamState => ({ ...state, updatedLiveFeed: data })),

  on(StreamActions.setPlaybackParams, (state, { params }): StreamState => ({ ...state, playbackParams: params })),
  on(StreamActions.fetchPlaybackSuccess, (state, { data }): StreamState => ({ ...state, playback: data, playbackTimelineParams: undefined, playbackTimeline: undefined, playbackScopeParams: undefined, playbackScope: undefined, playbackVideoCurrentTime: undefined })),

  on(StreamActions.setPlaybackTimelineParams, (state, { params }): StreamState => ({ ...state, playbackTimelineParams: params })),
  on(StreamActions.fetchPlaybackTimelineSuccess, (state, { data }): StreamState => ({ ...state, playbackTimeline: data, playbackScopeParams: undefined, playbackScope: undefined, playbackVideoCurrentTime: undefined })),

  on(StreamActions.setPlaybackScopeParams, (state, { params }): StreamState => ({ ...state, playbackScopeParams: params })),
  on(StreamActions.fetchPlaybackScopeSuccess, (state, { data }): StreamState => ({ ...state, playbackScope: data })),

  on(StreamActions.setPlaybackVideoCurrentTime, (state, { playbackVideoCurrentTime }): StreamState => ({ ...state, playbackVideoCurrentTime })),
  on(StreamActions.setPlaybackVideoStartTime, (state, { playbackVideoStartTime }): StreamState => {
    return { ...state, playbackVideoStartTime };
  }),
  on(StreamActions.setPlaybackSelectedSources, (state, { playbackSelectedSources }): StreamState => ({ ...state, playbackSelectedSources })),
  on(StreamActions.setPreviousPlaybackSelectedSources, (state, { previousPlaybackSelectedSources }) => ({
    ...state,
    previousPlaybackSelectedSources
  })),

  on(StreamActions.fetchMapVehiclesSuccess, (state, props): StreamState => ({ ...state, mapVehicles: props.data })),

  on(
    StreamActions.setDeviceStreamInitialized,
    (state, { deviceId, initialized, sn }): StreamState => ({
      ...state,
      initializedStreams: {
        ...state.initializedStreams,
        [deviceId]: {
          initialized,
          sn
        }
      }
    })
  ),
  on(
    StreamActions.resetInitializedStreams,
    (state): StreamState => ({
      ...state,
      initializedStreams: {}
    })
  ),

  on(StreamActions.resetLiveFeed, (state): StreamState => ({ ...state, liveFeed: undefined, updatedLiveFeed: undefined })),
  on(StreamActions.resetAlarms, (state): StreamState => ({ ...state, alarmsParams: { ...streamInitialState.alarmsParams }, alarms: [], alarmsMeta: undefined })),
  on(StreamActions.resetAllPlayback, (state): StreamState => ({ ...state, playbackParams: { ...streamInitialState.playbackParams }, playback: undefined, playbackTimelineParams: undefined, playbackTimeline: undefined, playbackScopeParams: undefined, playbackScope: undefined, playbackVideoCurrentTime: undefined, playbackSelectedSources: [], previousPlaybackSelectedSources: [] })),
  on(StreamActions.resetPlaybackTimeline, (state): StreamState => ({ ...state, playbackTimelineParams: undefined, playbackTimeline: undefined })),
  on(StreamActions.resetPlaybackScope, (state): StreamState => ({ ...state, playbackScopeParams: undefined, playbackScope: undefined })),
  on(StreamActions.resetPlaybackVideoCurrentTime, (state): StreamState => ({ ...state, playbackVideoCurrentTime: undefined })),
  on(StreamActions.resetPlaybackSelectedSources, (state): StreamState => ({ ...state, playbackSelectedSources: [], previousPlaybackSelectedSources: [] })),
  on(StreamActions.reset, (): StreamState => ({ ...streamInitialState })),

  on(StreamActions.setPlaybackDownloadActive, (state, { playbackDownloadActive }): StreamState => ({ ...state, playbackDownloadActive })),

  on(
    StreamActions.setTimelineFullscreen,
    (state, { isTimelineFullscreen }): StreamState => ({
      ...state,
      isTimelineFullscreen
    })
  ),

  on(StreamActions.setTimelineZoom, (state, { zoom }) => ({
    ...state,
    timelineZoom: zoom
  })),

  on(StreamActions.setSelectedTrip, (state, { tripIndex }): StreamState => ({ ...state, selectedTripIndex: tripIndex })),
  on(StreamActions.fetchPlaybackTimelineSuccess, (state, { data }): StreamState => ({ ...state, playbackTimeline: data, trips: data.trips ?? [], selectedTripIndex: null, playbackScopeParams: undefined, playbackScope: undefined, playbackVideoCurrentTime: undefined })),
  on(StreamActions.setSelectedTrip, (state, { tripIndex }): StreamState => {
    return { ...state, selectedTripIndex: tripIndex };
  }),

  on(StreamActions.fetchTelemetryTimelineSuccess, (state, { data }): StreamState => ({ ...state, telemetryTimeline: data })),
  on(StreamActions.setCurrentTelemetryPoint, (state, { point }): StreamState => ({ ...state, currentTelemetryPoint: point })),
  on(StreamActions.resetTelemetryTimeline, (state): StreamState => ({ ...state, telemetryTimeline: null, currentTelemetryPoint: null })),

  on(StreamActions.setPlaybackPlaying, (state, { isPlaying }) => ({ ...state, isPlaybackPlaying: isPlaying })),

  on(StreamActions.fetchTelemetryUpdateSuccess, (state, { data }): StreamState => {
    if (!state.updatedLiveFeed) return state;
    return { ...state, updatedLiveFeed: { ...state.updatedLiveFeed, telemetry_timeline: data.telemetry_timeline, telemetry_signal: data.telemetry_signal } };
  }),
  on(StreamActions.setLiveFeedStreamType, (state, { streamType }): StreamState => ({ ...state, streamType: streamType })),

  on(StreamActions.reset, (state): StreamState => {
    const savedVehiclesParams = { ...state.vehiclesParams };
    return {
      ...streamInitialState,
      vehiclesParams: savedVehiclesParams
    };
  }),

  on(StreamActions.setPlaybackShareActive, (state, { isActive }) => ({ ...state, playbackShareActive: isActive })),
  on(StreamActions.sharedClip, (state): StreamState => ({ ...state })),
  on(StreamActions.sharedClipSuccess, (state): StreamState => ({ ...state })),

  on(StreamActions.setPlaybackClipToEventActive, (state, { isActive }) => ({ ...state, clipToEventActive: isActive })),
  on(StreamActions.setMapDateTime, (state, { from, to }) => ({ ...state, mapFromTime: from, mapToTime: to })),
  on(StreamActions.setMapFilterParams, (state, { params }): StreamState => ({ ...state, mapFilterParams: { ...state.mapFilterParams, ...params } })),
  on(StreamActions.setMapPolygon, (state, { polygon }): StreamState => ({ ...state, mapFilterParams: { ...state.mapFilterParams, polygon } })),

  on(StreamActions.setLastVisitedTab, (state, { route }) => ({ ...state, lastTab: route })),
  on(StreamActions.fetchVehiclesInBackgroundSuccess, (state, { data, meta }): StreamState => ({ ...state, vehicles: data, vehiclesMeta: meta, updatedVehicles: data }))
);
