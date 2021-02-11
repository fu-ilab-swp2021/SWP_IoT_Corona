import { RssiDistributionComponent } from './rssi-distribution/rssi-distribution.component';
import { MapComponent } from './map-timeline/map-timeline.component';
import { DpmLinechartComponent } from './dpm-linechart/dpm-linechart.component';
import { PpmLinechartComponent } from './ppm-linechart/ppm-linechart.component';
import { RssiStackedLinechartComponent } from './rssi-stacked-linechart/rssi-stacked-linechart.component';
import { AvgRssiLinechartComponent } from './avg-rssi-linechart/avg-rssi-linechart.component';

export const PAGES = [
  {
    path: 'map',
    icon: 'place',
    title: 'Map',
    previewPath: 'assets/img/map_preview.png',
    component: MapComponent
  },
  {
    path: 'ppm-linechart',
    icon: 'stacked_line_chart',
    title: '#Packets per interval',
    previewPath: 'assets/img/ppm_linechart_preview.png',
    component: PpmLinechartComponent
  },
  {
    path: 'rssi-distribution',
    icon: 'leaderboard',
    title: 'RSSI distribution',
    previewPath: 'assets/img/rssi_distribution_preview.png',
    component: RssiDistributionComponent
  },
  {
    path: 'dpm-linechart',
    icon: 'show_chart',
    title: '#Devices per interval',
    previewPath: 'assets/img/dpm_linechart_preview.png',
    component: DpmLinechartComponent
  },
  {
    path: 'rssi-stacked-linechart',
    icon: 'stacked_line_chart',
    title: '#RSSI ranges per interval',
    previewPath: 'assets/img/rssi_stacked_linechart_preview.png',
    component: RssiStackedLinechartComponent
  },
  {
    path: 'avg-rssi-linechart',
    icon: 'show_chart',
    title: 'Average RSSI value per interval',
    previewPath: 'assets/img/avg_rssi_linechart_preview.png',
    component: AvgRssiLinechartComponent
  },
];
