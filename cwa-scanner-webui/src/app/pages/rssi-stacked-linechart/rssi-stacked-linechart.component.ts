import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AggregationPacket, RssiStackedPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-rssi-stacked-linechart',
  templateUrl: './rssi-stacked-linechart.component.html',
  styleUrls: ['./rssi-stacked-linechart.component.scss']
})
export class RssiStackedLinechartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Packet count per RSSI range';
  aggregationType = AGGREGATION_TYPES.rssi_stacked;

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  flattenData(data: AggregationPacket<RssiStackedPacket>[]) {
    return data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach((t) => {
          if (!(t in previous)) {
            previous[t] = {};
          }
          Object.keys(current.data[t]).forEach((range) => {
            if (range in previous[t]) {
              previous[t][range] += current.data[t][range];
            } else {
              previous[t][range] = current.data[t][range];
            }
          });
        });
      }
      return previous;
    }, {});
  }

  createChartSeries(flatData: RssiStackedPacket) {
    const chartData = [];
    Object.keys(flatData).forEach((t) => {
      Object.keys(flatData[t]).forEach((range) => {
        const series = chartData.find(s => s.name === range);
        if (series) {
          series.series.push({
            name: new Date(Number(t) * 1000),
            value: flatData[t][range]
          });
        } else {
          chartData.push({
            name: range,
            series: [{
              name: new Date(Number(t) * 1000),
              value: flatData[t][range]
            }],
            show: true,
          });
        }
      });
    });
    return chartData;
  }
}
