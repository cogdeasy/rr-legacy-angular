import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HealthTrendingComponent } from './health-trending.component';

const routes: Routes = [
  { path: '', component: HealthTrendingComponent }
];

@NgModule({
  declarations: [HealthTrendingComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class HealthTrendingModule { }
