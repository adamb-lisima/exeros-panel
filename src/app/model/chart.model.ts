type Data = { x: string; y: number; unit?: string; name?: string };

export interface ChartOptions {
  series: { name: string; data: Data[] }[];
}
