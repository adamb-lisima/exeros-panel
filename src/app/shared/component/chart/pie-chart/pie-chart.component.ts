import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexResponsive, ApexStroke, ApexTooltip, ChartComponent } from 'ng-apexcharts';

export interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  colors: string[];
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
}

export interface PieChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent implements OnChanges, OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  @Input() data: PieChartData[] = [];
  @Input() title = '';
  @Input() height = 300;
  @Input() colors: string[] = [];

  chartOptions: PieChartOptions = {
    series: [],
    chart: {
      type: 'pie',
      height: this.height,
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    labels: [],
    colors: [],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        if (typeof val === 'number') {
          return `${val.toFixed(1)}%`;
        }
        return `${val}%`;
      }
    },
    legend: {
      position: 'bottom',
      markers: {
        width: 12,
        height: 12,
        radius: 2
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      labels: {
        colors: 'var(--black)'
      }
    },
    stroke: {
      width: 2,
      colors: ['#fff']
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          if (typeof val === 'number') {
            return `${val.toFixed(1)}%`;
          }
          return `${val}%`;
        }
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data || changes.title || changes.colors || changes.height) {
      this.initChart();
    }
  }

  private initChart(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const labels = this.data.map(item => item.name);
    const series = this.data.map(item => item.value);

    this.chartOptions = {
      ...this.chartOptions,
      series: series,
      labels: labels,
      chart: {
        ...this.chartOptions.chart,
        height: this.height
      }
    };

    if (this.colors && this.colors.length > 0) {
      this.chartOptions.colors = this.colors;
    }
  }
}
