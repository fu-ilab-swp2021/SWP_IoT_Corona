import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { ChartsModule, MDBBootstrapModule } from 'angular-bootstrap-md';
import { HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PpmLinechartComponent } from './ppm-linechart/ppm-linechart.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RssiLinechartMapComponent } from './rssi-linechart-map/rssi-linechart-map.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { FileUploadDialogComponent } from './file-upload/file-upload-dialog.component';
import { HomeComponent } from './home/home.component';
import { RssiDistributionComponent } from './rssi-distribution/rssi-distribution.component';
import { DpmLinechartComponent } from './dpm-linechart/dpm-linechart.component';

@NgModule({
  declarations: [
    AppComponent,
    SwaggerUiComponent,
    FileUploadComponent,
    PpmLinechartComponent,
    FileUploadDialogComponent,
    RssiLinechartMapComponent,
    HomeComponent,
    RssiDistributionComponent,
    DpmLinechartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    NgxMatFileInputModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatCardModule,
    MatSliderModule,
    MDBBootstrapModule.forRoot(),
    ChartsModule,
    HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey:
        'AIzaSyCdTfIec7tel-8LtwjDfueUOlE3TCWoyrY' + '&libraries=visualization',
    }),
    NgxChartsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
