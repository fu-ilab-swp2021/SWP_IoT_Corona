import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { FileUploadDialogComponent } from './file-upload/file-upload-dialog.component';
import { DataFileInfo } from './models/cwa-packet.model';
import { DataService } from './services/data.service';

export const PAGES = [
  {
    path: 'ppm-linechart',
    icon: 'stacked_line_chart',
    title: '#Packets per interval',
    previewPath: 'assets/img/ppm_linechart_preview.png',
  },
  {
    path: 'rssi-linechart-map',
    icon: 'place',
    title: 'RSSI over time & map',
    previewPath: 'assets/img/rssi_linechart_map_preview.png',
  },
  {
    path: 'rssi-distribution',
    icon: 'leaderboard',
    title: 'RSSI distribution',
    previewPath: 'assets/img/rssi_distribution_preview.png',
  },
  {
    path: 'dpm-linechart',
    icon: 'show_chart',
    title: '#Devices per interval',
    previewPath: 'assets/img/dpm_linechart_preview.png',
  },
];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  pages = PAGES;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  visibleMap: Map<string, FormControl> = new Map();
  dataFilesInfo: DataFileInfo[] = [];

  constructor(
    public dataService: DataService,
    private uploadDialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataService.dataChanged.subscribe(() => {
      this.setDataFilesInfo(this.dataService.dataFilesInfo);
    });
  }

  deleteData(name) {
    this.dataService.deleteDataFile(name).subscribe(
      () => {
        this.dataService.updateFilenames();
      },
      () => {
        this.dataService.updateFilenames();
      }
    );
  }

  updateFilenames() {
    this.dataService.updateFilenames();
  }

  setDataFilesInfo(info: DataFileInfo[]) {
    this.visibleMap = new Map<string, FormControl>();
    info.forEach((f) => {
      const fc = new FormControl(f.visisble);
      fc.valueChanges.subscribe((v) => {
        const f3 = this.dataService.dataFilesInfo.find(
          (f2) => f2.filename === f.filename
        );
        if (f3) {
          f3.visisble = v;
          this.dataService.visibilityChanged.next(f3);
        }
      });
      this.visibleMap.set(f.filename, fc);
    });
    this.dataFilesInfo = info;
  }

  openUploadDialog() {
    this.uploadDialog.open(FileUploadDialogComponent);
  }

  getDateLabel(f: DataFileInfo) {
    if (f.first - (f.first % 86400000) === f.last - (f.last % 86400000)) {
      return new Date(f.first).toLocaleDateString();
    } else {
      return (
        new Date(f.first).toLocaleDateString() +
        ' - ' +
        new Date(f.last).toLocaleDateString()
      );
    }
  }

  getFullDateLabel(f: DataFileInfo) {
    return (
      new Date(f.first).toLocaleString() +
      ' - ' +
      new Date(f.last).toLocaleString()
    );
  }
}
