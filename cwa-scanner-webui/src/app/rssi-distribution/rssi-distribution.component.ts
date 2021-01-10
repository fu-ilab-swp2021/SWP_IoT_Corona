import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BarVerticalComponent } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { RssiDistPacket } from '../models/cwa-packet.model';
import { AGGREGATION_TYPES, DataService } from '../services/data.service';

interface ChartSeries {
  name: any;
  value: any;
}

@Component({
  selector: 'app-rssi-distribution',
  templateUrl: './rssi-distribution.component.html',
  styleUrls: ['./rssi-distribution.component.scss'],
})
export class RssiDistributionComponent
  implements OnInit, AfterViewInit, OnDestroy {
  aggregationType = AGGREGATION_TYPES.rssi_dist;
  sliderFC = new FormControl(60);
  noData = true;
  legend = false;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'RSSI value';
  yAxisLabel = 'Packet count';
  timeline = true;
  autoScale = true;
  activeEntries: any[] = [];
  colorScheme = 'cool';
  @ViewChild('ngx_chart') chart: BarVerticalComponent;
  data: RssiDistPacket;
  chartData: ChartSeries[] = [];
  chartDataCopy: ChartSeries[] = [];
  hideSeries: any[] = [];
  dataSubscription: Subscription;

  constructor(private dataService: DataService) {}

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
    this.dataService
      .getAggregatedData(this.aggregationType, {
        interval: this.sliderFC.value,
      })
      .subscribe((data: RssiDistPacket) => {
        this.newDataFromService(data);
      });
    this.dataSubscription = this.dataService.dataChanged.subscribe(() => {
      this.dataService
        .getAggregatedData(this.aggregationType, {
          interval: this.sliderFC.value,
        })
        .subscribe((data: RssiDistPacket) => {
          this.newDataFromService(data);
        });
    });
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
      dataCopy.push(s);
    }
    return dataCopy;
  }

  newDataFromService(data) {
    this.dataChanged(data);
  }

  dataChanged(d: RssiDistPacket) {
    this.noData = false;
    this.data = d;
    this.chartData = [];
    Object.keys(this.data).forEach((k) => {
      this.chartData.push({
        name: k,
        value: this.data[k],
      });
    });
    this.chartData.sort((a, b) => Number(a.name) - Number(b.name));
    this.chartData = [...this.chartData];
    this.chartDataCopy = this.copyData(this.chartData);
  }

  changeInterval(interval: number) {
    this.dataService
      .getAggregatedData(this.aggregationType, { interval })
      .subscribe((data: RssiDistPacket) => {
        this.newDataFromService(data);
      });
  }
}
