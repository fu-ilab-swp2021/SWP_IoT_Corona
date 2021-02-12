import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartType } from 'src/app/chart/chart.component';
import { AggregationPacket, AvgRssiPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-avg-rssi-linechart',
  templateUrl: './avg-rssi-linechart.component.html',
  styleUrls: ['./avg-rssi-linechart.component.scss']
})
export class AvgRssiLinechartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Average RSSI value';
  aggregationType = AGGREGATION_TYPES.avg_rssi;
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

  flattenData(data: AggregationPacket<AvgRssiPacket>[]) {
    return data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach((t) => {
          if (!(t in previous)) {
            previous[t] = {
              sum: 0,
              count: 0,
              avg: 0
            };
          }
          previous[t].sum += current.data[t].sum;
          previous[t].count += current.data[t].count;
          previous[t].avg = previous[t].sum / previous[t].count;
        });
      }
      return previous;
    }, {});
  }

  createChartSeries(flatData: AvgRssiPacket) {
    const chartData = [{
      name: 'Average RSSI value',
      series: [],
      show: true
    }];
    Object.keys(flatData).forEach((t) => {
      chartData[0].series.push({
        name: new Date(Number(t) * 1000),
        value: flatData[t].avg
      });
    });
    return chartData;
  }

  createRelativeChartSeries(
    data: AggregationPacket<AvgRssiPacket>[],
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
            value: p.data[String(k)].avg,
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
            value: p.data[k].avg,
          })),
        }));
    }
  }
}
