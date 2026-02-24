import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { ChartOptions } from '../../../../model/chart.model';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  colors: string[];
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

export interface LineChartData {
  series: {
    name: string;
    data: { x: string | Date; y: number; unit?: string }[];
  }[];
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements OnChanges {
  @ViewChild('chart') chart!: ChartComponent;
  @HostBinding('class') hostClass = 'block w-full h-full';

  @Input() data: ChartOptions['series'] = [];
  @Input() options: Partial<{
    lineColor: string;
    showYAxis: boolean;
    invertedYAxis: boolean;
    xAxisFormat: Intl.DateTimeFormatOptions;
    yAxisTicks?: number[];
    yAxisMin?: number;
    yAxisMax?: number;
    forceYScale?: boolean;
    overlayTemplate?: TemplateRef<any>;
  }> = {};

  @Input() title: string = '';
  @Input() height: number = 300;
  @Input() colors: string[] = [];

  public chartOptions: LineChartOptions = {
    series: [],
    chart: {
      height: 350,
      type: 'line',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['var(--brand-500)'],
    title: {
      text: '',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    fill: {
      opacity: 0.2,
      type: 'solid'
    },
    markers: {
      size: 4,
      hover: {
        size: 6
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
        style: {
          colors: 'var(--black)'
        }
      }
    },
    yaxis: {
      show: true,
      reversed: false,
      labels: {
        formatter: val => val.toFixed(2)
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 6,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      enabled: true,
      shared: false,
      x: {
        format: 'dd MMM yyyy'
      },
      theme: 'light'
    },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: 'var(--black)'
      }
    }
  };

  constructor() {
    this.initChartOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['options'] || changes['title'] || changes['height'] || changes['colors']) {
      this.updateChartOptions();
    }
  }

  private initChartOptions(): void {
    this.chartOptions.chart.height = this.height;
    this.chartOptions.title.text = this.title;

    if (this.colors.length) {
      this.chartOptions.colors = this.colors;
    }

    this.updateChartOptions();
  }

  private updateChartOptions(): void {
    if (this.chartOptions) {
      this.chartOptions.series = this.data.map(series => ({
        name: series.name,
        data: series.data.map(point => ({
          x: new Date(point.x),
          y: point.y
        }))
      }));

      if (this.options) {
        if (this.options.lineColor) {
          this.chartOptions.colors = [this.options.lineColor];
        }

        if (this.options.showYAxis !== undefined) {
          this.chartOptions.yaxis.show = this.options.showYAxis;
        }

        if (this.options.invertedYAxis !== undefined) {
          this.chartOptions.yaxis.reversed = this.options.invertedYAxis;
        }

        if (this.options.xAxisFormat && this.chartOptions.xaxis && this.chartOptions.xaxis.labels) {
          const formatter = new Intl.DateTimeFormat(undefined, this.options.xAxisFormat);
          this.chartOptions.xaxis.labels.formatter = val => formatter.format(new Date(val));
        }

        if (this.options.yAxisTicks) {
          this.chartOptions.yaxis.tickAmount = this.options.yAxisTicks.length;

          if (this.options.forceYScale && this.options.yAxisTicks.length > 0) {
            this.chartOptions.yaxis.min = Math.min(...this.options.yAxisTicks);
            this.chartOptions.yaxis.max = Math.max(...this.options.yAxisTicks);
            this.chartOptions.yaxis.forceNiceScale = false;
          }
        }

        if (this.options.yAxisMin !== undefined) {
          this.chartOptions.yaxis.min = this.options.yAxisMin;
        }

        if (this.options.yAxisMax !== undefined) {
          this.chartOptions.yaxis.max = this.options.yAxisMax;
        }

        if (this.options.forceYScale !== undefined) {
          this.chartOptions.yaxis.forceNiceScale = !this.options.forceYScale;
        }
      }

      this.chartOptions.title.text = this.title;
      this.chartOptions.chart.height = this.height;

      if (this.colors.length) {
        this.chartOptions.colors = this.colors;
      }

      const isDarkMode = document.documentElement.classList.contains('dark');
      this.chartOptions.tooltip.theme = isDarkMode ? 'dark' : 'light';

      if (this.chart) {
        this.chart.updateOptions(this.chartOptions);
      }
    }
  }
}
