import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AggregationPacket, BlePacket, DataFileInfo } from '../models/cwa-packet.model';
import { HttpService } from './http.service';

export enum AGGREGATION_TYPES {
  ppm = 'packets_per_minute',
  rssi_dist = 'rssi_distribution',
  dpm = 'devices_per_minute',
  rssi_stacked = 'rssi_stacked_per_minute',
  avg_rssi = 'avg_rssi_per_minute',
  total_values = 'total_values'
}
export interface UploadedDataItem {
  data: BlePacket[];
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  dataFilesInfo: DataFileInfo[] = [];
  initialData = false;
  initialData$ = new Subject();
  newDataArrived = new Subject();
  dataChanged = new Subject();
  gpsChanged = new Subject();
  visibilityChanged = new Subject<DataFileInfo>();
  onlyCwaFC = new FormControl(true);
  optionChanged = new Subject();

  get filenames() {
    return this.dataFilesInfo.map((f) => f.filename);
  }

  constructor(private httpService: HttpService) {
    this.onlyCwaFC.valueChanges.subscribe(() => {
      this.optionChanged.next();
    });
  }

  getDataFiles(): Observable<UploadedDataItem[]> {
    return this.httpService.getDataFiles().pipe(
      tap((dataFiles: UploadedDataItem[]) => {
        this.newDataArrived.next(dataFiles);
      })
    );
  }

  updateDataFilesObs() {
    return this.getFilenamesRemote().pipe(
      map((info) => {
        const newFile = !info.every((f) => this.dataFilesInfo.find(df => df.filename === f.filename));
        info.forEach(f => {
          const f3 = this.dataFilesInfo.find(f2 => f2.filename === f.filename);
          f.visisble = f3 ? f3.visisble : false;
        });
        this.dataFilesInfo = info;
        if (newFile) {
          this.dataChanged.next();
        }
        return info;
      })
    );
  }

  updateFilenames() {
    this.updateDataFilesObs().subscribe();
  }

  getFilenamesRemote() {
    return this.httpService.getFilenames();
  }

  deleteDataFile(name: string) {
    return this.httpService.deleteDatafile(name).pipe(
      tap(
        () => {
          this.dataFilesInfo = this.dataFilesInfo.filter(
            (f) => f.filename !== name
          );
          this.dataChanged.next();
        },
        (error) => {
          console.error(error);
        }
      )
    );
  }

  getAggregatedData(aggregationType: AGGREGATION_TYPES, options?: any): Observable<AggregationPacket<any>[]> {
    return this.httpService.getAggregatedData(
      aggregationType,
      this.filenames,
      {
        ...options,
        only_cwa: this.onlyCwaFC.value
      }
    );
  }
}
