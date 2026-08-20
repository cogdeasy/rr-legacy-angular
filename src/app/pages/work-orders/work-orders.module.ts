import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { WorkOrdersComponent } from './work-orders.component';

const routes: Routes = [
  { path: '', component: WorkOrdersComponent }
];

@NgModule({
  declarations: [WorkOrdersComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class WorkOrdersModule { }
