import { DpmLinechartComponent } from '../dpm-linechart/dpm-linechart.component';
import { RssiDistributionComponent } from '../rssi-distribution/rssi-distribution.component';
import { RssiLinechartMapComponent } from '../rssi-linechart-map/rssi-linechart-map.component';
import { PpmLinechartComponent } from './ppm-linechart/ppm-linechart.component';
import { RssiStackedLinechartComponent } from './rssi-stacked-linechart/rssi-stacked-linechart.component';

export const PAGES = [
  {
    path: 'ppm-linechart',
    icon: 'stacked_line_chart',
    title: '#Packets per interval',
    previewPath: 'assets/img/ppm_linechart_preview.png',
    component: PpmLinechartComponent
  },
  {
    path: 'rssi-linechart-map',
    icon: 'place',
    title: 'RSSI over time & map',
    previewPath: 'assets/img/rssi_linechart_map_preview.png',
    component: RssiLinechartMapComponent
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
];
