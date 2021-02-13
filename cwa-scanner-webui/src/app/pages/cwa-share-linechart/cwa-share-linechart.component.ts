import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartType } from 'src/app/chart/chart.component';
import { AggregationPacket, PpmPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-cwa-share-linechart',
  templateUrl: './cwa-share-linechart.component.html',
  styleUrls: ['./cwa-share-linechart.component.scss']
})
export class CwaShareLinechartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'CWA packet share';
  aggregationType = AGGREGATION_TYPES.ppm;
  chartType = ChartType.linechart;
  showRelativeToggle = true;

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  flattenData(data: AggregationPacket<PpmPacket>[]) {
    return data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach(t => {
          if (t in previous) {
            previous[t].total += current.data[t].total;
            previous[t].cwa += current.data[t].cwa;
            previous[t].non_cwa += current.data[t].non_cwa;
          } else {
            previous[t] = current.data[t];
          }
        });
      }
      return previous;
    }, {});
  }

  relativeScaleChanged(v) {
    if (v) {
      this.xAxisLabel = 'Time since start (s)';
    } else {
      this.xAxisLabel = 'Time';
    }
  }

  createChartSeries(flatData: PpmPacket) {
    const chartData = [
      {
        name: 'CWA share of packets per interval',
        series: [],
        show: true,
      }
    ];
    Object.keys(flatData).forEach((k) => {
      chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k].cwa / flatData[k].total,
      });
    });
    return chartData;
  }

  createRelativeChartSeries(
    data: AggregationPacket<PpmPacket>[],
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
            value: p.data[String(k)].cwa / p.data[String(k)].total,
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
            value: p.data[k].cwa / p.data[k].total,
          })),
        }));
    }
  }
}
