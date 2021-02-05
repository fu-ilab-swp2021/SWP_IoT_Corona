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
import { AggregationPacket, RssiDistPacket } from '../models/cwa-packet.model';
import { AGGREGATION_TYPES, DataService } from '../services/data.service';
import * as _ from 'lodash';
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
  data: AggregationPacket<RssiDistPacket>[] = [];
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
            previous[t] += current.data[t];
          } else {
            previous[t] = current.data[t];
          }
        });
      }
      return previous;
    }, {});
  }

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
    this.dataService.updateFilenames();
    this.dataSubscription = this.dataService.dataChanged.subscribe(() => this.updateData());
    this.visibleSupscription = this.dataService.visibilityChanged.subscribe(f => {
      const changedFile = this.data.find(df => df.filename === f.filename);
      if (changedFile) {
        changedFile.visisble = f.visisble;
      }
      this.chartDataFromData();
    });
    this.updateData();
  }

  updateData() {
    if (!_.isEmpty(_.xor(this.data.map(d => d.filename), this.dataService.filenames))) {
      this.dataService
        .getAggregatedData(this.aggregationType, {
          interval: this.sliderFC.value,
        })
        .subscribe((data: AggregationPacket<RssiDistPacket>[]) => {
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

  newDataFromService(data: AggregationPacket<RssiDistPacket>[]) {
    this.dataChanged(data);
  }

  dataChanged(d: AggregationPacket<RssiDistPacket>[]) {
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
    this.chartData = [];
    Object.keys(this.flatData).forEach((k) => {
      this.chartData.push({
        name: k,
        value: this.flatData[k],
      });
    });
    this.chartData.sort((a, b) => Number(a.name) - Number(b.name));
    this.chartData = [...this.chartData];
  }

  changeInterval(interval: number) {
    this.dataService
      .getAggregatedData(this.aggregationType, { interval })
      .subscribe((data: AggregationPacket<RssiDistPacket>[]) => {
        this.newDataFromService(data);
      });
  }
}
