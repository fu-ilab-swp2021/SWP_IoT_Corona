import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AggregationPacket, PpmPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-ppm-linechart',
  templateUrl: './ppm-linechart.component.html',
  styleUrls: ['./ppm-linechart.component.scss']
})
export class PpmLinechartComponent
  implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Packet count';
  aggregationType = AGGREGATION_TYPES.ppm;

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

  createChartSeries(flatData: PpmPacket) {
    const chartData = [
      {
        name: 'Total packets per interval',
        series: [],
        show: true,
      },
      {
        name: 'CWA packets per interval',
        series: [],
        show: true,
      },
      {
        name: 'Non-CWA packets per interval',
        series: [],
        show: true,
      },
    ];
    Object.keys(flatData).forEach((k) => {
      chartData[0].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k].total,
      });
      chartData[1].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k].cwa,
      });
      chartData[2].series.push({
        name: new Date(Number(k) * 1000),
        value: flatData[k].non_cwa,
      });
    });
    return chartData;
  }
}
