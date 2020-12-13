import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { HttpService } from '../http.service';
import { CwaPacket } from '../models/cwa-packet.model';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit, AfterViewInit {
  lat = 52.4403357;
  lng = 13.2416195;
  zoom = 8;
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
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
  map: google.maps.Map = null;
  heatmap: google.maps.visualization.HeatmapLayer = null;
  fileControl = new FormControl();
  @ViewChild('ngx_chart') chart: LineChartComponent;
  file: File;
  data: CwaPacket[];
  ngxData = [];

  constructor(
    private httpService: HttpService,
    private cdr: ChangeDetectorRef
  ) {}

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  ngOnInit(): void {
    this.fileControl.valueChanges.subscribe((file) => {
      this.file = file;
    });
  }

  ngAfterViewInit() {}

  formatXAxisLabel(value: Date) {
    return value.toLocaleTimeString();
  }

  upload() {
    this.httpService.uploadFile(this.file).subscribe(
      (d: any[]) => {
        this.noData = false;
        this.data = d.slice(0, 100);
        this.ngxData = [];
        for (const p of this.data) {
          let s = this.ngxData.find((p2) => p2.name === p.addr);
          if (!s) {
            s = {
              name: p.addr,
              series: [],
            };
            this.ngxData.push(s);
          }
          s.series.push({
            value: p.rssi,
            name: new Date(p.time * 1000),
          });
        }
        this.ngxData = [...this.ngxData];
        if (this.map) {
          this.heatmap.setMap(null);
          this.heatmap = new google.maps.visualization.HeatmapLayer({
            map: this.map,
            data: this.data.map(
              (p) => new google.maps.LatLng(p.location.lat, p.location.lng)
            ),
            radius: 30,
          });
        }
      },
      (e) => {
        console.error(e);
      }
    );
  }

  onMapLoad(mapInstance: google.maps.Map) {
    this.map = mapInstance;
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: this.data.map(
        (p) => new google.maps.LatLng(p.location.lat, p.location.lng)
      ),
      radius: 30,
    });
  }
}
