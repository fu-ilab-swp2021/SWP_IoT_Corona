import { Injectable } from '@angular/core';
import { BlePacket } from '../models/cwa-packet.model';
import { HttpService } from './http.service';
import { flatMap, map, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

export enum AGGREGATION_TYPES {
  ppm = 'packets_per_minute',
  rssi_dist = 'rssi_distribution',
  dpm = 'devices_per_minute',
}
export interface UploadedDataItem {
  data: BlePacket[];
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  dataFiles: UploadedDataItem[] = [];
  filenames: string[] = [];
  initialData = false;
  initialData$ = new Subject();
  dataChanged = new Subject();

  constructor(private httpService: HttpService) {}

  addDataFile(file: BlePacket[], filename: string) {
    if (!this.dataFiles.find(df => df.name === filename)) {
      this.dataFiles.push({
        data: file,
        name: filename,
      });
    }
  }

  getDataFiles() {
    return this.dataFiles;
  }

  updateDataFilesObs() {
    return this.getFilenamesRemote().pipe(
      map((filenames) => {
        const newFile = !filenames.every((f) => this.filenames.includes(f));
        this.filenames = filenames;
        if (newFile) {
          return this.httpService.getDataFiles().pipe(map((dataFiles) => {
            this.dataFiles = dataFiles;
            this.dataChanged.next(this.dataFiles);
            return this.dataFiles;
          }));
        } else {
          return of(this.dataFiles);
        }
      }),
      flatMap(v => v)
    );
  }

  updateDataFiles() {
    this.updateDataFilesObs().subscribe();
  }

  getFilenamesRemote() {
    return this.httpService.getFilenames();
  }
  updateFilenames() {
    return this.httpService.getFilenames().subscribe((filenames) => {
      this.filenames = filenames;
    });
  }

  deleteDataFile(name) {
    return this.httpService.deleteDatafile(name).pipe(tap(() => {
      this.dataFiles = this.dataFiles.filter((d) => d.name !== name);
      this.filenames = this.filenames.filter((f) => f !== name);
      this.dataChanged.next(this.dataFiles);
    }, (error) => {
      console.error(error);
    }));
  }

  getAggregatedData(aggregationType, options?) {
    return this.httpService.getAggregatedData(aggregationType, this.filenames, options);
  }
}
