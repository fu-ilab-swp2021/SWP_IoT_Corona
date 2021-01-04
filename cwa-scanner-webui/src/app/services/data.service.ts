import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CwaPacket } from '../models/cwa-packet.model';

interface UploadedDataItem {
  data: CwaPacket[];
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  dataFiles: UploadedDataItem[] = [];
  dataChanged: Subject<UploadedDataItem[]> = new Subject();

  constructor() { }

  addDataFile(file: CwaPacket[], filename: string) {
    this.dataFiles.push({
      data: file,
      name: filename
    });
    this.dataChanged.next(this.dataFiles);
  }

  getDataFiles() {
    return this.dataFiles;
  }

  deleteDataFile(name) {
    this.dataFiles = this.dataFiles.filter(d => d.name !== name);
    this.dataChanged.next(this.dataFiles);
  }
}
