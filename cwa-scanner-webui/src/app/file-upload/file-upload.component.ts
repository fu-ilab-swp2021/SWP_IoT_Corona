import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import * as Chart from 'chart.js';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit, AfterViewInit {
  fileControl = new FormControl();
  @ViewChild('cwa_chart') chartEl: ElementRef;
  chart: Chart;
  file: File;
  data;
  chartType = 'line';
  chartDatasets: Chart.ChartDataSets[] = [
    {
      data: [],
      label: 'CWA Packets',
      backgroundColor: 'rgba(105, 0, 132, .2)',
      borderColor: 'rgba(200, 99, 132, .7)',
      borderWidth: 2,
    },
  ];
  chartLabels: Array<any> = [];
  chartOptions: Chart.ChartConfiguration = {
    type: this.chartType,
    options: {
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Time'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'RSSI'
          }
        }],
      }
    }
  };

  constructor(
    private httpService: HttpService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fileControl.valueChanges.subscribe((file) => {
      this.file = file;
    });
  }

  ngAfterViewInit() {
  }

  upload() {
    this.httpService.uploadFile(this.file).subscribe(
      (d: any[]) => {
        this.chart = new Chart(this.chartEl.nativeElement, this.chartOptions);
        this.data = d.slice(0, 100);
        this.cdr.detectChanges();
        this.chartDatasets[0].data = this.data.map((p) => p.rssi);
        this.chartLabels = this.data.map((p) => p.time);
        this.chart.data = {
          datasets: this.chartDatasets,
          labels: this.chartLabels,
        };
        this.chart.update();
      },
      (e) => {
        console.error(e);
      }
    );
  }
  chartClicked(e: any): void {}
  chartHovered(e: any): void {}
}
