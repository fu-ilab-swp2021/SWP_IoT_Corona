import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartType } from 'src/app/chart/chart.component';
import { AggregationPacket, DpmPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-dpm-linechart',
  templateUrl: './dpm-linechart.component.html',
  styleUrls: ['./dpm-linechart.component.scss'],
})
export class DpmLinechartComponent implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Device count';
  aggregationType = AGGREGATION_TYPES.dpm;
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

  flattenData(data: AggregationPacket<DpmPacket>[]) {
    return data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach((t) => {
          if (t in previous) {
            previous[t] += current.data[t];
          } else {
            previous[t] = current.data[t];
          }
        });
      }
      return previous;
    }, {});
  }

  createChartSeries(flatData: DpmPacket) {
    const chartData = [
      {
        name: '#Devices per interval',
        series: [],
        show: true,
      },
    ];
    Object.keys(flatData).forEach((k) => {
      chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k],
      });
    });
    return chartData;
  }

  createRelativeChartSeries(
    data: AggregationPacket<DpmPacket>[],
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
            value: p.data[String(k)],
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
            value: p.data[k],
          })),
        }));
    }
  }
}
