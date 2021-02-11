import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import {
  AggregationPacket,
  TotalValuesPacket
} from '../../models/cwa-packet.model';
import { AGGREGATION_TYPES, DataService } from '../../services/data.service';

@Component({
  selector: 'app-map-timeline',
  templateUrl: './map-timeline.component.html',
  styleUrls: ['./map-timeline.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  aggregationType = AGGREGATION_TYPES.total_values;
  options: google.maps.MapOptions = {
    center: {
      lat: 52.4403357,
      lng: 13.2416195,
    },
    zoom: 12,
  };
  heatmap: google.maps.visualization.HeatmapLayer = null;
  @ViewChild('map') map: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  selectedFile: AggregationPacket<TotalValuesPacket> = null;
  unfilteredData: AggregationPacket<TotalValuesPacket>[] = [];
  subscriptions: Subscription[] = [];
  isLoading = false;
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
  };
  get data(): AggregationPacket<TotalValuesPacket>[] {
    return this.unfilteredData.filter((p) => p.visisble);
  }

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.updateFilenames();
    this.subscriptions.push(
      this.dataService.dataChanged.subscribe(() => this.updateData())
    );
    this.subscriptions.push(
      this.dataService.gpsChanged.subscribe(() => this.updateData(true))
    );
    this.subscriptions.push(
      this.dataService.visibilityChanged.subscribe((f) => {
        const d = this.unfilteredData.find((df) => df.filename === f.filename);
        if (d) {
          d.visisble = f.visisble;
          this.heatMapFromData();
        }
      })
    );
    this.subscriptions.push(
      this.dataService.optionChanged.subscribe(() => {
        this.updateData(true);
      })
    );
    this.updateData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit() {
    this.heatMapFromData();
  }

  setHeatmap() {
    this.heatmap?.setMap(null);
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map.googleMap,
      data: this.data
        .filter((f) => !!f.data.location)
        .map((f) => ({
          location: new google.maps.LatLng(
            f.data.location.lat,
            f.data.location.lng
          ),
          weight: f.data.cwa_per_min,
        })),
      radius: 70,
    });
  }

  newDataFromService(data: AggregationPacket<TotalValuesPacket>[]) {
    this.dataChanged(data);
    this.heatMapFromData();
  }

  heatMapFromData() {
    if (this.map) {
      this.setHeatmap();
    }
  }

  positionFromFile(f: AggregationPacket<TotalValuesPacket>) {
    return f.data.location;
  }

  updateData(optionChanged?: boolean) {
    if (
      !_.isEmpty(
        _.xor(
          this.data.map((d) => d.filename),
          this.dataService.filenames
        )
      ) ||
      optionChanged
    ) {
      this.isLoading = true;
      this.dataService.getAggregatedData(this.aggregationType, {}).subscribe(
        (data: AggregationPacket<TotalValuesPacket>[]) => {
          setTimeout(() => (this.isLoading = false), 50);
          this.newDataFromService(data);
        },
        (error) => {
          console.error(error);
          setTimeout(() => (this.isLoading = false), 50);
        }
      );
    }
  }

  dataChanged(d: AggregationPacket<TotalValuesPacket>[]) {
    this.unfilteredData = d.map((df) => ({
      filename: df.filename,
      data: df.data,
      visisble: this.dataService.dataFilesInfo.find(
        (f) => f.filename === df.filename
      ).visisble,
    }));
  }

  openInfoWindow(
    marker: MapMarker,
    file: AggregationPacket<TotalValuesPacket>
  ) {
    this.infoWindow.open(marker);
    this.selectedFile = file;
  }
}
