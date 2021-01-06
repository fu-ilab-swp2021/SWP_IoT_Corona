import {
  AfterViewInit,

  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { PpmPacket } from '../models/cwa-packet.model';
import { AGGREGATION_TYPES, DataService } from '../services/data.service';

interface ChartSeries {
  show: boolean;
  name: string;
  series: {
    name: any;
    value: any;
  }[];
}

@Component({
  selector: 'app-ppm-linechart',
  templateUrl: './ppm-linechart.component.html',
  styleUrls: ['./ppm-linechart.component.scss']
})
export class PpmLinechartComponent implements OnInit, AfterViewInit, OnDestroy {
  aggregationType = AGGREGATION_TYPES.ppm;
  noData = true;
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Packet count';
  timeline = true;
  autoScale = true;
  activeEntries: any[] = [];
  colorScheme = 'vivid';
  @ViewChild('ngx_chart') chart: LineChartComponent;
  data: PpmPacket;
  chartData: ChartSeries[] = [];
  chartDataCopy: ChartSeries[] = [];
  hideSeries: any[] = [];
  dataSubscription: Subscription;

  constructor(
    private dataService: DataService
  ) {}

  onSelect(data: any): void {
    const p = this.chartData.find((pp) => pp.name === data);
    p.show = !p?.show;
    if (!p.show) {
      p.series = [];
      this.hideSeries.push(data);
    } else {
      this.hideSeries = this.hideSeries.filter((s) => s !== data);
      p.series = this.chartDataCopy.find((pp) => pp.name === data)?.series;
    }
    this.chartData = [...this.chartData];
  }

  onActivate(data): void {
    // this.activeEntries = [data];
  }

  onDeactivate(data): void {
    // this.activeEntries = [];
  }

  chartNames() {
    return this.chartData.map((p) => p.name);
  }

  ngOnInit(): void {
    if (this.dataService.initialData) {
      this.dataService.getAggregatedData(this.aggregationType).subscribe((data: PpmPacket) => {
        this.newDataFromService(data);
      });
    } else {
      this.dataService.initialData$.pipe(take(1)).subscribe(() => {
        this.dataService.getAggregatedData(this.aggregationType).subscribe((data: PpmPacket) => {
          this.newDataFromService(data);
        });
      });
    }
  }

  ngOnDestroy() {
    this.dataSubscription?.unsubscribe();
  }

  ngAfterViewInit() {}

  formatXAxisLabel(value: Date) {
    return value.toLocaleTimeString();
  }

  copyData(data: ChartSeries[]): ChartSeries[] {
    const dataCopy = [];
    for (const s of data) {
      const s2 = {
        name: s.name,
        show: s.show,
        series: [],
      };
      for (const p of s.series) {
        s2.series.push(p);
      }
      dataCopy.push(s2);
    }
    return dataCopy;
  }

  newDataFromService(data) {
    this.dataChanged(data);
  }

  dataChanged(d: PpmPacket) {
    this.noData = false;
    this.data = d;
    this.chartData = [{
      name: 'Packets per minute',
      series: [],
      show: true,
    }];
    Object.keys(this.data).forEach(k => {
      this.chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: this.data[k]
      });
    });
    this.chartData = [...this.chartData];
    this.chartDataCopy = this.copyData(this.chartData);
  }
}
