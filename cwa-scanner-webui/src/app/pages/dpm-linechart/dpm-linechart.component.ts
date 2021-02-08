import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartType } from 'src/app/chart/chart.component';
import { AggregationPacket, DpmPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-dpm-linechart',
  templateUrl: './dpm-linechart.component.html',
  styleUrls: ['./dpm-linechart.component.scss']
})
export class DpmLinechartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Device count';
  aggregationType = AGGREGATION_TYPES.dpm;
  chartType = ChartType.linechart;

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  flattenData(data: AggregationPacket<DpmPacket>[]) {
    return data.reduce((previous, current) => {
      if (current.visisble) {
        Object.keys(current.data).forEach(t => {
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
      }
    ];
    Object.keys(flatData).forEach((k) => {
      chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k],
      });
    });
    return chartData;
  }
}
