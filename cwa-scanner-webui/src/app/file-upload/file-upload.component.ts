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
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit, AfterViewInit {
  fileControl = new FormControl();
  files: File[] = [];
  aggFC = new FormControl(false);
  isLoading = false;

  constructor(
    private httpService: HttpService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.fileControl.valueChanges.subscribe((files) => {
      this.files = files;
    });
  }

  ngAfterViewInit() {}

  upload() {
    if (this.files.length < 1) {
      return;
    }
    this.isLoading = true;
    this.httpService.uploadFile(this.files, this.aggFC.value).subscribe(
      () => {
        this.isLoading = false;
        this.dataService.updateFilenames();
      },
      (e) => {
        this.isLoading = false;
        console.error(e);
      }
    );
  }
}
