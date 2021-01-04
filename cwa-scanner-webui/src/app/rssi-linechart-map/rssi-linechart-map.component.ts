import {
  AfterViewInit,

  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { Subscription } from 'rxjs';
import { CwaPacket } from '../models/cwa-packet.model';
import { DataService } from '../services/data.service';

interface ChartSeries {
  show: boolean;
  name: string;
  series: {
    name: any;
    value: any;
  }[];
}

@Component({
  selector: 'app-rssi-linechart-map',
  templateUrl: './rssi-linechart-map.component.html',
  styleUrls: ['./rssi-linechart-map.component.scss'],
})
export class RssiLinechartMapComponent implements OnInit, AfterViewInit, OnDestroy {
  lat = 52.4403357;
  lng = 13.2416195;
  zoom = 12;
  noData = true;
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'RSSI';
  timeline = true;
  autoScale = true;
  activeEntries: any[] = [];
  // colorScheme = {
  //   domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  // };
  colorScheme = 'vivid';
  map: google.maps.Map = null;
  heatmap: google.maps.visualization.HeatmapLayer = null;
  @ViewChild('ngx_chart') chart: LineChartComponent;
  data: CwaPacket[];
  chartData: ChartSeries[] = [];
  chartDataCopy: ChartSeries[] = [];
  hideSeries: any[] = [];
  colors;
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
    this.setHeatmap();
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

  // colors() {
  //   return new ColorHelper(this.colorScheme, 'ordinal', this.chartNames());
  // }

  ngOnInit(): void {
    this.newDataFromService(this.dataService.dataFiles);
    this.dataSubscription = this.dataService.dataChanged.subscribe(this.newDataFromService.bind(this));
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

  setHeatmap() {
    this.heatmap?.setMap(null);
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: this.data
        .filter((p) => !this.hideSeries.includes(p.addr))
        .map((p) => new google.maps.LatLng(p.location.lat, p.location.lng)),
      radius: 30,
    });
  }

  newDataFromService(dataFiles) {
    let d: CwaPacket[] = [];
    dataFiles.forEach((f) => (d = d.concat(f.data)));
    this.dataChanged(d);
  }

  dataChanged(d: CwaPacket[]) {
    this.noData = false;
    this.data = d.slice(0, 100);
    this.chartData = [];
    for (const p of this.data) {
      let s = this.chartData.find((p2) => p2.name === p.addr);
      if (!s) {
        s = {
          name: p.addr,
          series: [],
          show: true,
        };
        this.chartData.push(s);
      }
      s.series.push({
        value: p.rssi,
        name: new Date(p.time * 1000),
      });
    }
    this.chartData = [...this.chartData];
    this.chartDataCopy = this.copyData(this.chartData);
    if (this.map) {
      this.setHeatmap();
    }
    // this.colors.domain = this.chartNames();
  }

  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
    this.setHeatmap();
  }
}
