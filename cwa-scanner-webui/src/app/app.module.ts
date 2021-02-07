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
import { HttpClientModule } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RssiLinechartMapComponent } from './pages/rssi-linechart-map/rssi-linechart-map.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileUploadDialogComponent } from './file-upload/file-upload-dialog.component';
import { HomeComponent } from './home/home.component';
import { RssiDistributionComponent } from './pages/rssi-distribution/rssi-distribution.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChartComponent } from './chart/chart.component';
import { RssiStackedLinechartComponent } from './pages/rssi-stacked-linechart/rssi-stacked-linechart.component';
import { PpmLinechartComponent } from './pages/ppm-linechart/ppm-linechart.component';
import { DpmLinechartComponent } from './pages/dpm-linechart/dpm-linechart.component';
import { AvgRssiLinechartComponent } from './pages/avg-rssi-linechart/avg-rssi-linechart.component';
import { GoogleMapsModule } from '@angular/google-maps';

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
    ChartComponent,
    RssiStackedLinechartComponent,
    AvgRssiLinechartComponent
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
    GoogleMapsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
