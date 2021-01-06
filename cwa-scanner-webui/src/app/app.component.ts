import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  get dataFiles() {
    return this.dataService.getDataFiles();
  }

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.updateDataFilesObs().subscribe(() => {
      this.dataService.initialData = true;
      this.dataService.initialData$.next(true);
    });
  }

  deleteData(name) {
    this.dataService.deleteDataFile(name).subscribe(() => {
      this.dataService.updateDataFiles();
    }, () => {
      this.dataService.updateDataFiles();
    });
  }

  updateFilenames() {
    this.dataService.updateFilenames();
  }
}
