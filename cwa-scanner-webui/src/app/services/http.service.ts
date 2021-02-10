import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AggregationPacket, BlePacket, DataFileInfo } from '../models/cwa-packet.model';
import { UploadedDataItem } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  uploadFile(f: File, aggregate: boolean) {
    const formData = new FormData();
    formData.append('fileKey', f, f.name);
    return this.http.post('/api/upload-cwa-data-from-file' + (aggregate ? '?aggregate=true' : ''), formData);
  }

  getFilenames(): Observable<DataFileInfo[]> {
    return this.http.get<DataFileInfo[]>('/api/cwa-filenames');
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
