import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ShopVisitPlannerComponent } from './shop-visit-planner.component';

const routes: Routes = [
  { path: '', component: ShopVisitPlannerComponent }
];

@NgModule({
  declarations: [ShopVisitPlannerComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ShopVisitPlannerModule { }
