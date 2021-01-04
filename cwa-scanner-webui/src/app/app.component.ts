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

  constructor(private dataService: DataService) {}

  ngOnInit() {}

  deleteData(name) {
    this.dataService.deleteDataFile(name);
    if (this.dataFiles?.length < 1) {
      this.menuTrigger.closeMenu();
    }
  }
}
