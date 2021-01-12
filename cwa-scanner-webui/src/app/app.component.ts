import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { FileUploadDialogComponent } from './file-upload/file-upload-dialog.component';
import { DataService } from './services/data.service';

export const PAGES = [
  {
    path: 'ppm-linechart',
    icon: 'stacked_line_chart',
    title: '#Packets per interval',
    previewPath: 'assets/img/ppm_linechart_preview.png'
  },
  {
    path: 'rssi-linechart-map',
    icon: 'place',
    title: 'RSSI over time & map',
    previewPath: 'assets/img/rssi_linechart_map_preview.png'
  },
  {
    path: 'rssi-distribution',
    icon: 'leaderboard',
    title: 'RSSI distribution',
    previewPath: 'assets/img/rssi_distribution_preview.png'
  },
  {
    path: 'dpm-linechart',
    icon: 'show_chart',
    title: '#Devices per interval',
    previewPath: 'assets/img/dpm_linechart_preview.png'
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
  get dataFiles() {
    return this.dataService.getDataFiles();
  }

  constructor(
    public dataService: DataService,
    private uploadDialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataService.updateDataFilesObs().subscribe(() => {
      this.dataService.initialData = true;
      this.dataService.initialData$.next(true);
    });
  }

  deleteData(name) {
    this.dataService.deleteDataFile(name).subscribe(
      () => {
        this.dataService.updateDataFiles();
      },
      () => {
        this.dataService.updateDataFiles();
      }
    );
  }

  updateFilenames() {
    this.dataService.updateFilenames();
  }

  openUploadDialog() {
    this.uploadDialog.open(FileUploadDialogComponent);
  }
}
