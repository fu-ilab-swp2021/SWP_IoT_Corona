import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../services/data.service';
import { HttpService } from '../services/http.service';

interface ChartSeries {
  show: boolean;
  name: string;
  series: {
    name: any;
    value: any;
  }[];
}

@Component({
  selector: 'app-gps-upload',
  templateUrl: './gps-upload.component.html',
  styleUrls: ['./gps-upload.component.scss'],
})
export class GpsUploadComponent implements OnInit, AfterViewInit {
  fileControl = new FormControl();
  file: File;
  isLoading = false;

  constructor(
    private httpService: HttpService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.fileControl.valueChanges.subscribe((file) => {
      this.file = file;
    });
  }

  ngAfterViewInit() {}

  upload() {
    if (!this.file) {
      return;
    }
    this.isLoading = true;
    this.httpService.uploadGpsFile(this.file).subscribe(
      () => {
        this.isLoading = false;
        this.dataService.gpsChanged.next();
      },
      (e) => {
        this.isLoading = false;
        console.error(e);
      }
    );
  }
}
