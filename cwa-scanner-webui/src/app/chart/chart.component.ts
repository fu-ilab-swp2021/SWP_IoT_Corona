import { ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { AggregationPacket } from '../models/cwa-packet.model';
import { AGGREGATION_TYPES, DataService } from '../services/data.service';

interface ChartSeries {
  show: boolean;
  name: string;
  series: {
    name: any;
    value: any;
  }[];
}

export enum ChartType {
  linechart = 'linechart',
  barchart = 'barchart',
}

const STANDARD_INTERVAL = 60;

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent<T> implements OnInit, AfterViewInit, OnDestroy {
  @Input() aggregationType: AGGREGATION_TYPES;
  @Input() showIntervalSlider = true;
  @Input() createChartSeries: (flatData: T[]) => ChartSeries[];
  @Input() flattenData: (data: AggregationPacket<T>[]) => T[];
  @Input() xAxisLabel = 'Time';
  @Input() yAxisLabel = 'Count';
  @Input() legend = true;
  @Input() showLabels = true;
  @Input() animations = true;
  @Input() xAxis = true;
  @Input() yAxis = true;
  @Input() showYAxisLabel = true;
  @Input() showXAxisLabel = true;
  @Input() timeline = true;
  @Input() autoScale = true;
  @Input() colorScheme = 'cool';
  @Input() chartType: ChartType = ChartType.linechart;
  @ViewChild('linechartTemplate') linechartTemplate: TemplateRef<any>;
  @ViewChild('barchartTemplate') barchartTemplate: TemplateRef<any>;
  sliderFC = new FormControl(STANDARD_INTERVAL);
  data: AggregationPacket<T>[] = [];
  chartData: ChartSeries[] = [];
  subscriptions: Subscription[] = [];
  isLoading = false;
  context = {
    colorScheme: this.colorScheme,
    legend: this.legend,
    autoScale: this.autoScale,
    showXAxisLabel: this.showXAxisLabel,
    showYAxisLabel: this.showXAxisLabel,
    xAxis: this.xAxis,
    formatXAxisLabel: this.formatXAxisLabel,
    yAxis: this.yAxis,
    xAxisLabel: this.xAxisLabel,
    yAxisLabel: this.yAxisLabel,
    chartData: this.chartData,
    timeline: this.timeline,
  };
  get flatData() {
    return this.flattenData(this.data);
  }
  get chartTemplate() {
    switch (this.chartType) {
      case ChartType.linechart:
        return this.linechartTemplate;
      case ChartType.barchart:
        return this.barchartTemplate;
      default:
        return null;
    }
  }

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dataService.updateFilenames();
    this.subscriptions.push(
      this.dataService.dataChanged.subscribe(() => this.updateData())
    );
    this.subscriptions.push(
      this.dataService.visibilityChanged.subscribe((f) => {
        const d = this.data.find((df) => df.filename === f.filename);
        if (d) {
          d.visisble = f.visisble;
        }
        this.chartDataFromData();
      })
    );
    this.subscriptions.push(
      this.dataService.optionChanged.subscribe(() => {
        this.updateData(true);
      })
    );
    this.updateData();
    this.updateContext();
  }

  updateData(optionChanged?: boolean) {
    if (
      !_.isEmpty(
        _.xor(
          this.data.map((d) => d.filename),
          this.dataService.filenames
        )
      ) ||
      optionChanged
    ) {
      this.isLoading = true;
      this.dataService
        .getAggregatedData(this.aggregationType, {
          interval: this.sliderFC.value,
        })
        .subscribe(
          (data: AggregationPacket<T>[]) => {
            this.isLoading = false;
            this.newDataFromService(data);
          },
          (error) => {
            console.error(error);
            this.isLoading = false;
          }
        );
    }
  }

  updateContext() {
    this.context = {
      colorScheme: this.colorScheme,
      legend: this.legend,
      autoScale: this.autoScale,
      showXAxisLabel: this.showXAxisLabel,
      showYAxisLabel: this.showXAxisLabel,
      xAxis: this.xAxis,
      formatXAxisLabel: this.formatXAxisLabel,
      yAxis: this.yAxis,
      xAxisLabel: this.xAxisLabel,
      yAxisLabel: this.yAxisLabel,
      chartData: this.chartData,
      timeline: this.timeline,
    };
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  formatXAxisLabel(value: Date) {
    return value.toLocaleTimeString();
  }

  newDataFromService(data: AggregationPacket<T>[]) {
    this.dataChanged(data);
  }

  dataChanged(d: AggregationPacket<T>[]) {
    this.data = d.map((df) => ({
      filename: df.filename,
      data: df.data,
      visisble: this.dataService.dataFilesInfo.find(
        (f) => f.filename === df.filename
      ).visisble,
    }));
    this.chartDataFromData();
  }

  chartDataFromData() {
    this.chartData = this.createChartSeries(this.flatData);
    this.context.chartData = this.chartData;
  }

  changeInterval(interval: number) {
    this.dataService
      .getAggregatedData(this.aggregationType, { interval })
      .subscribe((data: AggregationPacket<T>[]) => {
        this.newDataFromService(data);
      });
  }

  show(v) {
    console.log(v);
  }

  keys(o) {
    return Object.keys(o);
  }
}
