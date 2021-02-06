import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AggregationPacket, PpmPacket, RssiDistPacket } from 'src/app/models/cwa-packet.model';
import { AGGREGATION_TYPES } from '../../services/data.service';

@Component({
  selector: 'app-rssi-distribution',
  templateUrl: './rssi-distribution.component.html',
  styleUrls: ['./rssi-distribution.component.scss']
})
export class RssiDistributionComponent
  implements OnInit, AfterViewInit, OnDestroy {
  showIntervalSlider = false;
  xAxisLabel = 'RSSI range';
  yAxisLabel = 'Packet count';
  aggregationType = AGGREGATION_TYPES.rssi_dist;
  legend = false;

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  flattenData(data: AggregationPacket<RssiDistPacket>[]) {
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

  createChartSeries(flatData: RssiDistPacket) {
    const chartData = [];
    Object.keys(flatData).forEach((k) => {
      chartData.push({
        name: k,
        value: flatData[k],
      });
    });
    chartData.sort((a, b) => Number(a.name) - Number(b.name));
    return chartData;
  }
}
