import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  DeviceInfo,
  DevicePacket
} from '../../../models/cwa-packet.model';
import { DataService } from '../../../services/data.service';

interface ChartSeries {
  show: boolean;
  name: string;
  series: {
    name: any;
    value: any;
  }[];
}

@Component({
  selector: 'app-device-linechart',
  templateUrl: './device-linechart.component.html',
  styleUrls: ['./device-linechart.component.scss'],
})
export class DeviceLinechartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input() filename: string;
  @Input() address: string;
  @Input() packet: DeviceInfo;
  @Output() back = new EventEmitter();
  packetDatasource: MatTableDataSource<DeviceInfo>;
  xAxisLabel = 'Time';
  yAxisLabel = 'RSSI';
  legend = false;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  timeline = true;
  autoScale = true;
  colorScheme = 'cool';
  formatXAxisTicks = this._formatXAxisTicks.bind(this);
  data: DevicePacket[] = [];
  chartData: ChartSeries[] = [];
  isLoading = false;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.packetDatasource = new MatTableDataSource([this.packet]);
    this.updateData();
  }

  updateData() {
    this.isLoading = true;
    this.dataService.getDevicePackets(this.filename, this.address).subscribe(
      (data: DevicePacket[]) => {
        this.isLoading = false;
        this.newDataFromService(data);
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
      }
    );
  }
  ngOnDestroy() {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  _formatXAxisTicks(value: Date) {
      return (value as Date).toLocaleTimeString();
  }

  newDataFromService(data: DevicePacket[]) {
    this.dataChanged(data);
  }

  dataChanged(d: DevicePacket[]) {
    this.data = d;
    this.chartDataFromData();
  }

  chartDataFromData() {
    const chartData = [{
      name: 'RSSI values',
      show: true,
      series: this.data.map(p => ({
        name: new Date(p.time * 1000),
        value: p.rssi
      }))
    }];
    this.chartData = chartData;
  }

  onBack() {
    this.back.emit();
  }
}
