import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { LineChartComponent } from '@swimlane/ngx-charts';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { AggregationPacket, PpmPacket } from '../models/cwa-packet.model';
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
  styleUrls: ['./ppm-linechart.component.scss'],
})
export class PpmLinechartComponent implements OnInit, AfterViewInit, OnDestroy {
  aggregationType = AGGREGATION_TYPES.ppm;
  sliderFC = new FormControl(60);
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
  colorScheme = 'cool';
  @ViewChild('ngx_chart') chart: LineChartComponent;
  data: AggregationPacket<PpmPacket>[] = [];
  chartData: ChartSeries[] = [];
  chartDataCopy: ChartSeries[] = [];
  hideSeries: any[] = [];
  dataSubscription: Subscription;
  visibleSupscription: Subscription;
  get flatData() {
    return this.data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach(t => {
          if (t in previous) {
            previous[t].total += current.data[t].total;
            previous[t].cwa += current.data[t].cwa;
            previous[t].non_cwa += current.data[t].non_cwa;
          } else {
            previous[t] = current.data[t];
          }
        });
      }
      return previous;
    }, {});
  }

  constructor(private dataService: DataService) {}

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
    this.dataService.updateFilenames();
    this.dataSubscription = this.dataService.dataChanged.subscribe(() => this.updateData());
    this.visibleSupscription = this.dataService.visibilityChanged.subscribe(f => {
      this.data.find(df => df.filename === f.filename).visisble = f.visisble;
      this.chartDataFromData();
    });
    this.updateData();
  }

  updateData() {
    if (!_.isEmpty(_.xor(this.data.map(d => d.filename), this.dataService.filenames))) {
      this.dataService
        .getAggregatedData(this.aggregationType, {interval: this.sliderFC.value})
        .subscribe((data: AggregationPacket<PpmPacket>[]) => {
          this.newDataFromService(data);
        });
    }
  }

  ngOnDestroy() {
    this.dataSubscription?.unsubscribe();
    this.visibleSupscription?.unsubscribe();
  }

  ngAfterViewInit() {}

  formatXAxisLabel(value: Date) {
    return value.toLocaleTimeString();
  }

  newDataFromService(data: AggregationPacket<PpmPacket>[]) {
    this.dataChanged(data);
  }

  dataChanged(d: AggregationPacket<PpmPacket>[]) {
    this.data = d.map((df) => ({
      filename: df.filename,
      data: df.data,
      visisble: this.dataService.dataFilesInfo.find(
        (f) => f.filename === df.filename
      ).visisble,
    }));
    this.chartDataFromData();
  }

  chartDataFromData() {
    this.chartData = [
      {
        name: 'Total packets per interval',
        series: [],
        show: true,
      },
      {
        name: 'CWA packets per interval',
        series: [],
        show: true,
      },
      {
        name: 'Non-CWA packets per interval',
        series: [],
        show: true,
      },
    ];
    Object.keys(this.flatData).forEach((k) => {
      this.chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: this.flatData[k].total,
      });
      this.chartData[1].series.push({
        name: new Date(Number(k) * 1000),
        value: this.flatData[k].cwa,
      });
      this.chartData[2].series.push({
        name: new Date(Number(k) * 1000),
        value: this.flatData[k].non_cwa,
      });
    });
    this.chartData = [...this.chartData];
  }

  changeInterval(interval: number) {
    this.dataService
      .getAggregatedData(this.aggregationType, {interval})
      .subscribe((data: AggregationPacket<PpmPacket>[]) => {
        this.newDataFromService(data);
      });
  }
}
