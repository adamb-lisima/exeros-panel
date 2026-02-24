import { createAction, props } from '@ngrx/store';
import { DateTime } from 'luxon';
import { AlarmsElement, AlarmsMeta, AlarmsParams, CreateMessageBody, MapVehiclesElement, MapVehiclesParams, Playback, PlaybackParams, PlaybackScope, PlaybackScopeParams, PlaybackTimeline, PlaybackTimelineParams, TelemetryData, TelemetryTimeline, TelemetryTimelinePoint, Trip, VehiclesElement, VehiclesMeta, VehiclesParams } from 'src/app/screen/stream/stream.model';
import { VideoSource } from 'src/app/shared/component/smax-video/smax-video.model';
import { MapCoordinates } from '../../model/map.model';
import { Camera, LiveFeed, TelemetryUpdate } from '../../service/http/live-feeds/live-feeds.model';
import { PolygonPoints } from '../../store/common-objects/common-objects.model';
import { ClipToEvent, ExtendEvent, SharedClipCreateBody, SharedClipResponse } from '../../store/download-task/download-task.model';

export const StreamActions = {
  setSelectedId: createAction('[Stream] SetSelectedId', props<{ id?: VehiclesElement['id'] }>()),
  setPlaybackActive: createAction('[Stream] SetPlayback', props<{ playbackActive: boolean }>()),

  setVehiclesLoading: createAction('[Stream] SetVehiclesLoading', props<{ loading: boolean }>()),
  setVehiclesParams: createAction('[Stream] SetVehiclesParams', props<{ params: VehiclesParams }>()),
  fetchVehicles: createAction('[Stream] FetchVehicles', props<{ params: Partial<VehiclesParams> }>()),
  fetchVehiclesSuccess: createAction('[Stream] FetchVehicles Success', props<{ data: VehiclesElement[]; meta: VehiclesMeta }>()),
  setUpdatedVehicles: createAction('[Stream] SetUpdatedVehicles', props<{ data: VehiclesElement[] }>()),

  setAlarmsLoading: createAction('[Stream] SetAlarmsLoading', props<{ loading: boolean }>()),
  setAlarmsParams: createAction('[Stream] SetAlarmsParams', props<{ params: AlarmsParams }>()),
  fetchAlarms: createAction('[Stream] FetchAlarms', props<{ params: Partial<AlarmsParams> }>()),
  fetchAlarmsSuccess: createAction('[Stream] FetchAlarms Success', props<{ data: AlarmsElement[]; meta: AlarmsMeta }>()),

  fetchLiveFeed: createAction('[Stream] FetchLiveFeed'),
  fetchLiveFeedSuccess: createAction('[Stream] FetchLiveFeed Success', props<{ data: LiveFeed }>()),
  setUpdatedLiveFeed: createAction('[Stream] SetUpdatedLiveFeed', props<{ data: LiveFeed }>()),

  createMessage: createAction('[Stream] CreateMessage', props<{ body: CreateMessageBody }>()),
  createMessageSuccess: createAction('[Stream] CreateMessageSuccess'),

  setPlaybackParams: createAction('[Stream] SetPlaybackParams', props<{ params: PlaybackParams }>()),
  fetchPlayback: createAction('[Stream] FetchPlayback', props<{ params: Partial<PlaybackParams> }>()),
  fetchPlaybackSuccess: createAction('[Stream] FetchPlayback Success', props<{ data: Playback }>()),

  setPlaybackTimelineParams: createAction('[Stream] SetPlaybackTimelineParams', props<{ params: PlaybackTimelineParams }>()),
  fetchPlaybackTimeline: createAction('[Stream] FetchPlaybackTimeline', props<{ params: PlaybackTimelineParams }>()),
  fetchPlaybackTimelineSuccess: createAction('[Stream] FetchPlaybackTimeline Success', props<{ data: PlaybackTimeline }>()),

  setPlaybackScopeParams: createAction('[Stream] SetPlaybackScopeParams', props<{ params: PlaybackScopeParams }>()),
  fetchPlaybackScope: createAction('[Stream] FetchPlaybackScope', props<{ params: PlaybackScopeParams }>()),
  fetchPlaybackScopeSuccess: createAction('[Stream] FetchPlaybackScope Success', props<{ data: PlaybackScope }>()),
  exportTelemetry: createAction('[Stream] ExportTelemetry'),
  exportTelemetrySuccess: createAction('[Stream] ExportTelemetrySuccess'),

  setPlaybackVideoCurrentTime: createAction('[Stream] SetPlaybackVideoCurrentTime', props<{ playbackVideoCurrentTime: DateTime }>()),
  setPlaybackVideoStartTime: createAction('[Stream] SetPlaybackVideoStartTime', props<{ playbackVideoStartTime: DateTime }>()),
  setPlaybackSelectedSources: createAction('[Stream] SetPlaybackSelectedSources', props<{ playbackSelectedSources: VideoSource[] }>()),
  setPreviousPlaybackSelectedSources: createAction('[Stream] Set Previous Playback Selected Sources', props<{ previousPlaybackSelectedSources: VideoSource[] }>()),

  fetchMapVehicles: createAction('[Stream] FetchMapVehicles', props<{ params: MapVehiclesParams }>()),
  fetchMapVehiclesSuccess: createAction('[Stream] FetchMapVehicles Success', props<{ data: MapVehiclesElement[] }>()),

  setPlaybackDownloadActive: createAction('[Stream] SetPlaybackDownload', props<{ playbackDownloadActive: boolean }>()),

  setTimelineFullscreen: createAction('[Stream] SetTimelineFullscreen', props<{ isTimelineFullscreen: boolean }>()),

  setTimelineZoom: createAction('[Stream] Set Timeline Zoom', props<{ zoom: number }>()),

  setSelectedTrip: createAction('[Stream] Set Selected Trip', props<{ tripIndex: number | null }>()),

  setTrips: createAction('[Stream] Set Trips', props<{ trips: Trip[] }>()),

  resetLiveFeed: createAction('[Stream] ResetLiveFeed'),
  resetAlarms: createAction('[Stream] ResetAlarms'),
  resetAllPlayback: createAction('[Stream] ResetAllPlayback'),
  resetPlaybackTimeline: createAction('[Stream] ResetPlaybackTimeline'),
  resetPlaybackScope: createAction('[Stream] ResetPlaybackScope'),
  resetPlaybackVideoCurrentTime: createAction('[Stream] ResetPlaybackVideoCurrentTime'),
  resetPlaybackSelectedSources: createAction('[Stream] ResetPlaybackSelectedSources'),

  reset: createAction('[Stream] Reset'),

  fetchTelemetryTimeline: createAction('[Stream] FetchTelemetryTimeline', props<{ vehicleId: number; date: string }>()),
  fetchTelemetryTimelineSuccess: createAction('[Stream] FetchTelemetryTimelineSuccess', props<{ data: TelemetryTimeline }>()),

  setCurrentTelemetryPoint: createAction('[Stream] SetCurrentTelemetryPoint', props<{ point: TelemetryTimelinePoint | null }>()),

  updateTelemetry: createAction('[Stream] UpdateTelemetry', props<{ currentTime: DateTime }>()),
  updateTelemetrySuccess: createAction('[Stream] UpdateTelemetrySuccess', props<{ telemetryData: TelemetryData }>()),

  resetTelemetryTimeline: createAction('[Stream] ResetTelemetryTimeline'),

  setPlaybackPlaying: createAction('[Stream] SetPlaybackPlaying', props<{ isPlaying: boolean }>()),

  setDeviceStreamInitialized: createAction('[Stream] Set Device Stream Initialized', props<{ sn?: string; deviceId: number; initialized: boolean }>()),
  resetInitializedStreams: createAction('[Stream] Reset Initialized Streams'),

  fetchTelemetryUpdate: createAction('[Stream] fetchTelemetryUpdate', props<{ vehicleId: number }>()),
  fetchTelemetryUpdateSuccess: createAction('[Stream] fetchTelemetryUpdateSuccess', props<{ data: TelemetryUpdate }>()),

  setLiveFeedStreamType: createAction('[Stream] Set LiveFeed Stream Type', props<{ streamType: keyof Pick<Camera, 'main_stream' | 'sub_stream'> }>()),

  checkAndSelectTripForPosition: createAction('[Stream] Check And Select Trip For Position', props<{ position: DateTime }>()),

  setPlaybackShareActive: createAction('[Stream] Set PlaybackShareActive', props<{ isActive: boolean }>()),
  sharedClip: createAction('[Stream] SharedClip', props<{ vehicleId: number; body: SharedClipCreateBody }>()),
  sharedClipSuccess: createAction('[Stream] SharedClipSuccess', props<{ response: SharedClipResponse[] }>()),
  watchClip: createAction('[Stream] WatchClip', props<{ slug: string; params: { password?: string } }>()),
  watchClipSuccess: createAction('[Stream] WatchClipSuccess', props<{ response: SharedClipResponse }>()),

  setPlaybackClipToEventActive: createAction('[Stream] Set PlaybackClipToEventActive', props<{ isActive: boolean }>()),

  clipToEvent: createAction('[Stream] clipToEvent', props<{ vehicleId: number; body: ClipToEvent }>()),
  clipToEventSuccess: createAction('[Stream] clipToEventSuccess'),

  extendEvent: createAction('[Stream] extendEvent', props<{ eventId: string; body: ExtendEvent }>()),
  extendEventSuccess: createAction('[Stream] extendEventSuccess'),

  setMapDateTime: createAction('[Dashboard] SetMapDateTime', props<{ from: string | null; to: string | null }>()),
  setMapFilterParams: createAction('[Stream] SetMapFilterParams', props<{ params: Partial<MapVehiclesParams> }>()),
  setMapPolygon: createAction('[Stream] SetMapPolygon', props<{ polygon: PolygonPoints[] | undefined }>()),

  setMapLocation: createAction('[Stream] SetMapLocation', props<{ location: { latitude: number; longitude: number; displayName: string; zoom: number } }>()),
  resetMapLocation: createAction('[Stream] ResetMapLocation'),
  focusMapOnVehicle: createAction('[Stream] FocusOnVehicle', props<{ coordinates: MapCoordinates; zoom: number }>()),

  setLastVisitedTab: createAction('[Stream] SetLastTab', props<{ route: string }>()),

  fetchVehiclesInBackground: createAction('[Stream] FetchVehiclesInBackground'),
  fetchVehiclesInBackgroundSuccess: createAction('[Stream] FetchVehiclesInBackground Success', props<{ data: VehiclesElement[]; meta: VehiclesMeta }>())
};
