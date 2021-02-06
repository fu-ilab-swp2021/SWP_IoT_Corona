import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

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
}
