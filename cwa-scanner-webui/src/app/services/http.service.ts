import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BlePacket } from '../models/cwa-packet.model';
import { UploadedDataItem } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  uploadFile(f: File) {
    const formData = new FormData();
    formData.append('fileKey', f, f.name);
    return this.http.post('/api/upload-cwa-data', formData);
  }

  getFilenames() {
    return this.http.get<string[]>('/api/cwa-filenames');
  }

  deleteDatafile(name: string) {
    return this.http.delete('/api/cwa-data/' + name);
  }

  getDataFiles() {
    return this.http.get<UploadedDataItem[]>('/api/cwa-data', {
      headers: { Accept: 'application/json' },
    });
  }

  getAggregatedData(aggregationType, filenames, options?) {
    return this.http.post<any>('/api/aggregate-data', {
      dataFiles: filenames,
      type: aggregationType,
      options
    });
  }
}
