import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { BlePacket } from '../models/cwa-packet.model';
import { DataService } from '../services/data.service';

interface ChartSeries {
  show: boolean;
  name: string;
  series: {
    name: any;
    value: any;
  }[];
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit, AfterViewInit {
  fileControl = new FormControl();
  file: File;

  constructor(
    private httpService: HttpService,
    private cdr: ChangeDetectorRef,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.fileControl.valueChanges.subscribe((file) => {
      this.file = file;
    });
  }

  ngAfterViewInit() {}

  upload() {
    this.httpService.uploadFile(this.file).subscribe(
      (d: BlePacket[]) => {
        this.dataService.updateFilenames();
      },
      (e) => {
        console.error(e);
      }
    );
  }
}
