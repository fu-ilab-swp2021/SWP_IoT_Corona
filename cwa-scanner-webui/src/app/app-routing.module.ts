import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';


const routes: Routes = [
  {
    path: '',
    component: FileUploadComponent,
    pathMatch: 'full'
  },
  {
    path: 'swagger-ui',
    component: SwaggerUiComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
