import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { HomeComponent } from './home/home.component';
import { PpmLinechartComponent } from './ppm-linechart/ppm-linechart.component';
import { RssiLinechartMapComponent } from './rssi-linechart-map/rssi-linechart-map.component';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'swagger-ui',
    component: SwaggerUiComponent
  },
  {
    path: 'ppm-linechart',
    component: PpmLinechartComponent
  },
  {
    path: 'rssi-linechart-map',
    component: RssiLinechartMapComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
