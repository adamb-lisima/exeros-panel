import env from './environment.json';

export const environment = {
  production: false,
  baseUrl: env.API_URL || 'https://api-prod.exeros.cloud/api',
  reportsAlarmsShowExportWithoutFilters: env.REPORTS_ALARMS_SHOW_EXPORT_WITHOUT_FILTERS || false,
  pusherAppChannel: 'private_dev',
  pusherAppKey: '4d6c2d556fb01daf0c37',
  guideApiUrl: env.GUIDE_API_URL || 'https://cms.vidematics.cloud',
  guideApiToken: env.GUIDE_API_TOKEN || 'f9f615ff277171fdb3be311cbf0e80c242dabb4fcbf88dfd7782bbd0a7ed3018f317d6ab361c883726fab6917172a5f437286fdadecc140df37896f13ba8721372d9859a3988d43668787a4b1e23775daf5812513dcc0f1f6ceecebf51d8292e1fd0604c6f0c90c1547a6b019220b56409fcdb289a1b56b060584b6fb7949a68'
};
