import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PAGES } from './pages/pages.model';
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
  ...PAGES.map(p => ({
    path: p.path,
    component: p.component
  }))
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
