import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { FileUploadDialogComponent } from './file-upload/file-upload-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { GpsUploadDialogComponent } from './gps-upload/gps-upload-dialog.component';
import { GpsUploadComponent } from './gps-upload/gps-upload.component';
import { HomeComponent } from './home/home.component';
import { AvgRssiLinechartComponent } from './pages/avg-rssi-linechart/avg-rssi-linechart.component';
import { CwaShareLinechartComponent } from './pages/cwa-share-linechart/cwa-share-linechart.component';
import { DeviceTableComponent } from './pages/device-table/device-table.component';
import { DpmLinechartComponent } from './pages/dpm-linechart/dpm-linechart.component';
import { MapComponent } from './pages/map-timeline/map-timeline.component';
import { PpmLinechartComponent } from './pages/ppm-linechart/ppm-linechart.component';
import { RssiDistributionComponent } from './pages/rssi-distribution/rssi-distribution.component';
import { RssiStackedLinechartComponent } from './pages/rssi-stacked-linechart/rssi-stacked-linechart.component';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';
import { DeviceLinechartComponent } from './pages/device-table/device-linechart/device-linechart.component';
import { DeviceShareComponent } from './pages/device-share/device-share.component';

@NgModule({
  declarations: [
    AppComponent,
    SwaggerUiComponent,
    FileUploadComponent,
    PpmLinechartComponent,
    FileUploadDialogComponent,
    MapComponent,
    HomeComponent,
    RssiDistributionComponent,
    DpmLinechartComponent,
    ChartComponent,
    RssiStackedLinechartComponent,
    AvgRssiLinechartComponent,
    GpsUploadComponent,
    GpsUploadDialogComponent,
    DeviceTableComponent,
    CwaShareLinechartComponent,
    DeviceLinechartComponent,
    DeviceShareComponent
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
    HttpClientModule,
    NgxChartsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    GoogleMapsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatExpansionModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
