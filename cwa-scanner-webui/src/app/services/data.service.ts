import { Injectable } from '@angular/core';
import { CwaPacket } from '../models/cwa-packet.model';
import { HttpService } from './http.service';
import { flatMap, map, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

export enum AGGREGATION_TYPES {
  ppm = 'packets_per_minute'
}
export interface UploadedDataItem {
  data: CwaPacket[];
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

  constructor(private httpService: HttpService) {}

  addDataFile(file: CwaPacket[], filename: string) {
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
    }, (error) => {
      console.error(error);
    }));
  }

  getAggregatedData(aggregationType) {
    return this.httpService.getAggregatedData(aggregationType, this.filenames);
  }
}
