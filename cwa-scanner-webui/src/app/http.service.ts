import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  uploadFile(f: File) {
    const formData  = new FormData();
    formData.append('fileKey', f, f.name);
    return this.http.post('/api/upload-cwa-data', formData);
  }
}
