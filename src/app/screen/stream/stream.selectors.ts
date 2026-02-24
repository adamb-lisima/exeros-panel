import { createFeatureSelector, createSelector } from '@ngrx/store';
import { STREAM_FEATURE_KEY, StreamState } from 'src/app/screen/stream/stream.reducer';

const getState = createFeatureSelector<StreamState>(STREAM_FEATURE_KEY);

export const StreamSelectors = {
  selectedId: createSelector(getState, state => state.selectedId),
  playbackActive: createSelector(getState, state => state.playbackActive),

  vehiclesLoading: createSelector(getState, state => state.vehiclesLoading),
  vehiclesParams: createSelector(getState, state => state.vehiclesParams),
  vehicles: createSelector(getState, state => state.vehicles),
  updatedVehicles: createSelector(getState, state => state.updatedVehicles),
  vehiclesMeta: createSelector(getState, state => state.vehiclesMeta),

  liveFeed: createSelector(getState, state => state.liveFeed),
  updatedLiveFeed: createSelector(getState, state => state.updatedLiveFeed),

  alarmsLoading: createSelector(getState, state => state.alarmsLoading),
  alarmsParams: createSelector(getState, state => state.alarmsParams),
  alarms: createSelector(getState, state => state.alarms),
  alarmsMeta: createSelector(getState, state => state.alarmsMeta),

  playback: createSelector(getState, state => state.playback),
  playbackParams: createSelector(getState, state => state.playbackParams),

  playbackTimeline: createSelector(getState, state => state.playbackTimeline),
  playbackTimelineParams: createSelector(getState, state => state.playbackTimelineParams),

  playbackScope: createSelector(getState, state => state.playbackScope),
  playbackScopeParams: createSelector(getState, state => state.playbackScopeParams),

  playbackVideoCurrentTime: createSelector(getState, state => state.playbackVideoCurrentTime),
  playbackVideoStartTime: createSelector(getState, state => state.playbackVideoStartTime),
  playbackSelectedSources: createSelector(getState, state => state.playbackSelectedSources),
  previousPlaybackSelectedSources: createSelector(getState, state => state.previousPlaybackSelectedSources),

  mapVehicles: createSelector(getState, state => state.mapVehicles),

  playbackDownloadActive: createSelector(getState, state => state.playbackDownloadActive),
  isTimelineFullscreen: createSelector(getState, state => state.isTimelineFullscreen),

  selectedTripIndex: createSelector(getState, state => state.selectedTripIndex),
  trips: createSelector(getState, state => state.trips),

  telemetryTimeline: createSelector(getState, state => state.telemetryTimeline),
  currentTelemetryPoint: createSelector(getState, state => state.currentTelemetryPoint),

  isPlaybackPlaying: createSelector(getState, state => state.isPlaybackPlaying),

  selectedCalendarEntry: createSelector(getState, state => state.playback?.calendar.find(entry => entry.date === state.playbackTimelineParams?.date)),

  initializedStreams: createSelector(getState, state => state.initializedStreams),
  isDeviceStreamInitialized: createSelector(getState, (state: StreamState, props: { deviceId: string }) => state.initializedStreams[props.deviceId]),

  liveFeedStreamType: createSelector(getState, state => state.streamType),

  playbackStreamType: createSelector(getState, state => state.playbackParams?.st),

  playbackShareActive: createSelector(getState, state => state.playbackShareActive),
  sharedClipResponse: createSelector(getState, state => state.sharedClipResponse),

  clipToEventActive: createSelector(getState, state => state.clipToEventActive),

  mapTimeRange: createSelector(getState, state => ({ from: state.mapFromTime ?? null, to: state.mapToTime ?? null })),
  mapFilterParams: createSelector(getState, state => state.mapFilterParams),

  getLastTab: createSelector(getState, state => state.lastTab)
};
