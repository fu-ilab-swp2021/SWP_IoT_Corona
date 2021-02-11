import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { AggregationPacket, DeviceInfo } from '../../models/cwa-packet.model';
import { AGGREGATION_TYPES, DataService } from '../../services/data.service';

@Component({
  selector: 'app-device-table',
  templateUrl: './device-table.component.html',
  styleUrls: ['./device-table.component.scss'],
})
export class DeviceTableComponent implements OnInit, AfterViewInit, OnDestroy {
  aggregationType = AGGREGATION_TYPES.device_info;
  dataSources = new Map<string, MatTableDataSource<DeviceInfo>>();
  @ViewChildren(MatSort) sorts!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) paginators: QueryList<MatPaginator>;
  unfilteredData: AggregationPacket<DeviceInfo[]>[] = [];
  subscriptions: Subscription[] = [];
  isLoading = false;
  get data(): AggregationPacket<DeviceInfo[]>[] {
    return this.unfilteredData.filter((p) => p.visisble);
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
        const d = this.unfilteredData.find((df) => df.filename === f.filename);
        if (d) {
          d.visisble = f.visisble;
          this.buildTables();
        }
      })
    );
    this.subscriptions.push(
      this.dataService.optionChanged.subscribe(() => {
        this.updateData(true);
      })
    );
    this.updateData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngAfterViewInit() {}

  newDataFromService(data: AggregationPacket<DeviceInfo[]>[]) {
    this.dataChanged(data);
    this.buildTables();
  }

  buildTables() {
    this.cdr.detectChanges();
    this.dataSources.clear();
    this.data.forEach((p, i) => {
      const dataSource = new MatTableDataSource<DeviceInfo>();
      dataSource.data = p.data;
      dataSource.sort = this.sorts.get(i);
      dataSource.paginator = this.paginators.get(i);
      dataSource.sort.sort({
        id: 'count',
        disableClear: false,
        start: 'desc',
      });
      this.dataSources.set(p.filename, dataSource);
    });
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
      this.dataService.getAggregatedData(this.aggregationType, {}).subscribe(
        (data: AggregationPacket<DeviceInfo[]>[]) => {
          setTimeout(() => (this.isLoading = false), 50);
          this.newDataFromService(data);
        },
        (error) => {
          console.error(error);
          setTimeout(() => (this.isLoading = false), 50);
        }
      );
    }
  }

  dataChanged(d: AggregationPacket<DeviceInfo[]>[]) {
    this.unfilteredData = d.map((df) => ({
      filename: df.filename,
      data: df.data,
      visisble: this.dataService.dataFilesInfo.find(
        (f) => f.filename === df.filename
      ).visisble,
    }));
  }

  identify(index, item) {
    return item.filename;
  }
}
