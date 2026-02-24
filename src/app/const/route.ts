const RouteConst = {
  login: 'login',
  resetPassword: 'reset-password',
  resetPasswordToken: 'reset-password-token/:token',
  dashboard: 'dashboard',
  stream: 'stream',
  playbacks: 'playbacks',
  drivers: 'drivers',
  vehicles: 'vehicles',
  events: 'events',
  settings: 'settings',
  telematics: 'telematics',
  reports: 'reports',
  iframeApiLiveStream: 'iframe-api-live-stream',
  iframeApiPlayback: 'iframe-api-playback',
  iframeApiEvents: 'iframe-api-events',
  fleets: 'fleets',
  liveVideo: 'stream/:id',
  clip: 'clip',
  mapView: 'map-view',
  guide: 'guide/:slug',
  leaderboard: 'leaderboard'
};

export const SubRouteConst = {
  playback: 'playback'
};

export default RouteConst;
