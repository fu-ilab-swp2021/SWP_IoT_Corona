import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartType } from 'src/app/chart/chart.component';
import { AggregationPacket, DeviceSharePacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-device-share',
  templateUrl: './device-share.component.html',
  styleUrls: ['./device-share.component.scss'],
})
export class DeviceShareComponent implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Share of CWA devices';
  aggregationType = AGGREGATION_TYPES.device_share;
  chartType = ChartType.linechart;
  showRelativeToggle = true;

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  relativeScaleChanged(v) {
    if (v) {
      this.xAxisLabel = 'Time since start (s)';
    } else {
      this.xAxisLabel = 'Time';
    }
  }

  flattenData(data: AggregationPacket<DeviceSharePacket>[]) {
    return data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach((t) => {
          if (t in previous) {
            previous[t].cwa += current.data[t].cwa;
            previous[t].not_cwa += current.data[t].not_cwa;
          } else {
            previous[t] = current.data[t];
          }
        });
      }
      return previous;
    }, {});
  }

  createChartSeries(flatData: DeviceSharePacket) {
    const chartData = [
      {
        name: 'Share of CWA devices',
        series: [],
        show: true,
      },
    ];
    Object.keys(flatData).forEach((k) => {
      chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k].cwa / (flatData[k].cwa + flatData[k].not_cwa),
      });
    });
    return chartData;
  }

  createRelativeChartSeries(
    data: AggregationPacket<DeviceSharePacket>[],
    relative: boolean
  ) {
    if (relative) {
      return data
        .filter((p) => p.visisble)
        .map((p) => {
          const sortedKeys = Object.keys(p.data)
            .map((k) => Number(k))
            .sort();
          const series = sortedKeys.map((k) => ({
            name: k - sortedKeys[0],
            value: p.data[String(k)].cwa / (p.data[String(k)].cwa + p.data[String(k)].not_cwa),
          }));
          return {
            name: p.filename,
            show: true,
            series,
          };
        });
    } else {
      return data
        .filter((p) => p.visisble)
        .map((p) => ({
          name: p.filename,
          show: true,
          series: Object.keys(p.data).map((k) => ({
            name: new Date(Number(k) * 1000),
            value: p.data[k].cwa / (p.data[k].cwa + p.data[k].not_cwa),
          })),
        }));
    }
  }
}
