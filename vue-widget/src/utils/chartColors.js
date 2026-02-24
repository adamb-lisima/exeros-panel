export const CHART_COLORS = [
  '#FF3D00', '#2F80ED', '#7ED321', '#8A2BE2', '#FFD035', '#00C853',
  '#FF6A00', '#651FFF', '#00E5FF', '#FF32E7', '#F44336', '#2962FF',
  '#64DD17', '#AA00FF', '#FFC400', '#FF9100', '#0091EA', '#B2FF59',
  '#D500F9', '#FFD600', '#1976D2', '#76FF03', '#E91E63', '#FFEA00',
  '#673AB7', '#F57C00', '#00BFA5', '#F50057', '#FFA000', '#304FFE',
  '#4CAF50', '#9C27B0', '#FF5252', '#03A9F4', '#FF8F00', '#C0FF33',
  '#7B1FA2', '#D32F2F', '#18FFFF', '#EF6C00', '#3F51B5', '#69F0AE',
  '#C2185B', '#40C4FF', '#FFB300', '#1DE9B6', '#E040FB', '#FF7043',
  '#536DFE', '#FF6F00'
]

export const getChartColors = (count) => {
  if (count <= 0) return []

  if (count <= CHART_COLORS.length) {
    return CHART_COLORS.slice(0, count)
  }

  return Array(count)
    .fill(0)
    .map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
}
