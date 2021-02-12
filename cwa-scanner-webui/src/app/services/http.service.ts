import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AggregationPacket, BlePacket, DataFileInfo, DevicePacket } from '../models/cwa-packet.model';
import { UploadedDataItem } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  uploadFile(files: File[], aggregate: boolean) {
    const formData = new FormData();
    files.forEach((f, i) => {
      formData.append('fileKey_' + i, f, f.name);
    });
    return this.http.post('/api/upload-cwa-data-from-file' + (aggregate ? '?aggregate=true' : ''), formData);
  }

  uploadGpsFile(file: File) {
    const formData = new FormData();
    formData.append('fileKey', file, file.name);
    return this.http.post('/api/upload-gps-data-from-file', formData);
  }

  deleteGpsData() {
    return this.http.delete('/api/gps-data');
  }

  getFilenames(): Observable<DataFileInfo[]> {
    return this.http.get<DataFileInfo[]>('/api/cwa-filenames');
  }

  getDevicePackets(filename, address): Observable<DevicePacket[]> {
    return this.http.get<DevicePacket[]>('/api/cwa-device-data/' + filename + '/' + address);
  }

  deleteDatafile(name: string) {
    return this.http.delete('/api/cwa-data/' + name);
  }

  getDataFiles() {
    return this.http.get<UploadedDataItem[]>('/api/cwa-data', {
      headers: { Accept: 'application/json' },
    });
  }

  getAggregatedData(aggregationType, filenames, options?): Observable<AggregationPacket<any>[]> {
    return this.http.post<AggregationPacket<any>[]>('/api/aggregate-data', {
      dataFiles: filenames,
      type: aggregationType,
      options
    });
  }
}
