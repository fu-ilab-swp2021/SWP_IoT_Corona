import { RssiDistributionComponent } from './rssi-distribution/rssi-distribution.component';
import { MapComponent } from './map-timeline/map-timeline.component';
import { DpmLinechartComponent } from './dpm-linechart/dpm-linechart.component';
import { PpmLinechartComponent } from './ppm-linechart/ppm-linechart.component';
import { RssiStackedLinechartComponent } from './rssi-stacked-linechart/rssi-stacked-linechart.component';
import { AvgRssiLinechartComponent } from './avg-rssi-linechart/avg-rssi-linechart.component';
import { DeviceTableComponent } from './device-table/device-table.component';
import { CwaShareLinechartComponent } from './cwa-share-linechart/cwa-share-linechart.component';
import { DeviceShareComponent } from './device-share/device-share.component';

export const PAGES = [
  {
    path: 'map',
    icon: 'place',
    title: 'Map',
    previewPath: 'assets/img/map_preview.png',
    component: MapComponent
  },
  {
    path: 'device-table',
    icon: 'device_unknown',
    title: 'Device info',
    previewPath: 'assets/img/device_table_preview.png',
    component: DeviceTableComponent
  },
  {
    path: 'ppm-linechart',
    icon: 'stacked_line_chart',
    title: '#Packets per interval',
    previewPath: 'assets/img/ppm_linechart_preview.png',
    component: PpmLinechartComponent
  },
  {
    path: 'cwa-share-linechart',
    icon: 'show_chart',
    title: 'CWA share per interval',
    previewPath: 'assets/img/cwa_share_linechart_preview.png',
    component: CwaShareLinechartComponent
  },
  {
    path: 'dpm-linechart',
    icon: 'show_chart',
    title: '#Devices per interval',
    previewPath: 'assets/img/dpm_linechart_preview.png',
    component: DpmLinechartComponent
  },
  {
    path: 'device-share',
    icon: 'show_chart',
    title: 'Share of CWA devices',
    previewPath: 'assets/img/device_share_preview.png',
    component: DeviceShareComponent
  },
  {
    path: 'avg-rssi-linechart',
    icon: 'show_chart',
    title: 'Average RSSI value per interval',
    previewPath: 'assets/img/avg_rssi_linechart_preview.png',
    component: AvgRssiLinechartComponent
  },
  {
    path: 'rssi-distribution',
    icon: 'leaderboard',
    title: 'RSSI distribution',
    previewPath: 'assets/img/rssi_distribution_preview.png',
    component: RssiDistributionComponent
  },
  {
    path: 'rssi-stacked-linechart',
    icon: 'stacked_line_chart',
    title: '#RSSI ranges per interval',
    previewPath: 'assets/img/rssi_stacked_linechart_preview.png',
    component: RssiStackedLinechartComponent
  },
];
