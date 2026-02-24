import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexPlotOptions, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';

export type SpiderChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  colors: string[];
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

export interface SpiderChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

@Component({
  selector: 'app-spider-chart',
  templateUrl: './spider-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpiderChartComponent implements OnChanges {
  @ViewChild('chart') chart!: ChartComponent;

  @Input() data: SpiderChartData = {
    categories: [],
    series: []
  };

  @Input() title: string = '';
  @Input() height: number = 350;
  @Input() colors: string[] = [];

  public chartOptions: SpiderChartOptions = {
    series: [],
    chart: {
      height: 350,
      type: 'radar',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true
      }
    },
    dataLabels: {
      enabled: true,
      background: {
        enabled: true,
        borderRadius: 2
      }
    },
    plotOptions: {
      radar: {
        size: undefined,
        polygons: {
          strokeColors: '#e9e9e9',
          fill: {
            colors: ['#f8f8f8', '#fff']
          }
        }
      }
    },
    colors: ['#FF4560'],
    title: {
      text: '',
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    stroke: {
      width: 2
    },
    fill: {
      opacity: 0.1
    },
    markers: {
      size: 5
    },
    xaxis: {
      categories: []
    },
    yaxis: {
      show: false
    },
    grid: {
      show: false
    },
    tooltip: {
      enabled: true,
      shared: false,
      intersect: true,
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
    if (changes['data'] || changes['title'] || changes['height'] || changes['colors']) {
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
      const clonedData = {
        series: this.data.series.map(series => ({ ...series, data: [...series.data] })),
        categories: [...this.data.categories]
      };

      this.chartOptions.series = clonedData.series;
      this.chartOptions.xaxis = {
        ...this.chartOptions.xaxis,
        categories: clonedData.categories
      };
      this.chartOptions.title.text = this.title;
      this.chartOptions.chart.height = this.height;

      if (this.colors.length) {
        this.chartOptions.colors = [...this.colors];
      }

      const isDarkMode = document.documentElement.classList.contains('dark');
      this.chartOptions.tooltip.theme = isDarkMode ? 'dark' : 'light';

      if (this.chartOptions?.plotOptions.radar) {
        this.chartOptions.plotOptions.radar.polygons = {
          strokeColors: isDarkMode ? '#444444' : '#e9e9e9',
          fill: {
            colors: isDarkMode ? ['#2d3748', '#1a202c'] : ['#f8f8f8', '#fff']
          }
        };
      }

      if (this.chart) {
        this.chart.updateOptions(this.chartOptions);
      }
    }
  }
}
