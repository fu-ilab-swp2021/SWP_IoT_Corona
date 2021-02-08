import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Subscription } from 'rxjs';
import { BlePacket } from '../../models/cwa-packet.model';
import { DataService, UploadedDataItem } from '../../services/data.service';

@Component({
  selector: 'app-map-timeline',
  templateUrl: './map-timeline.component.html',
  styleUrls: ['./map-timeline.component.scss'],
})
export class MapTimelineComponent
  implements OnInit, AfterViewInit, OnDestroy {

  options: google.maps.MapOptions = {
    center: {
      lat: 52.4403357,
      lng: 13.2416195
    },
    zoom: 12
  };
  heatmap: google.maps.visualization.HeatmapLayer = null;
  @ViewChild('map') map: GoogleMap;
  data: UploadedDataItem[] = [];
  dataSubscription: Subscription;
  visibleSupscription: Subscription;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false
  };
  markerPositions: google.maps.LatLngLiteral[] = [];
  get flatData(): BlePacket[] {
    // TODO
    return [];
  }

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataSubscription = this.dataService.dataChanged.subscribe(() => {
      this.dataService.getDataFiles().subscribe((dataFiles) => {
        this.newDataFromService(dataFiles);
      });
    });
    this.dataService.updateFilenames();
    this.visibleSupscription = this.dataService.visibilityChanged.subscribe((f) => {
      // this.data.find(df => df.filename === f.filename).visisble = f.visisble;
      this.chartAndHeatMapFromData();
    });
  }

  ngOnDestroy() {
    this.dataSubscription?.unsubscribe();
    this.visibleSupscription?.unsubscribe();
  }

  ngAfterViewInit() {
    this.setHeatmap();
  }

  setHeatmap() {
    this.heatmap?.setMap(null);
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map.googleMap,
      data: [new google.maps.LatLng(52.4403357, 13.2416195)],
      radius: 30,
    });
  }

  newDataFromService(dataFiles: UploadedDataItem[]) {
    this.chartAndHeatMapFromData();
  }

  chartAndHeatMapFromData() {
    if (this.map) {
      this.setHeatmap();
    }
  }

  addMarker(event: google.maps.MapMouseEvent) {
    this.markerPositions.push(event.latLng.toJSON());
  }
}
