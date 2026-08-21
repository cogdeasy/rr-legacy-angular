import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'engine-explorer',
    loadChildren: () =>
      import('./pages/engine-explorer/engine-explorer.module').then(m => m.EngineExplorerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'health-trending',
    loadChildren: () =>
      import('./pages/health-trending/health-trending.module').then(m => m.HealthTrendingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'shop-visit-planner',
    loadChildren: () =>
      import('./pages/shop-visit-planner/shop-visit-planner.module').then(m => m.ShopVisitPlannerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'work-orders',
    loadChildren: () => import('./pages/work-orders/work-orders.module').then(m => m.WorkOrdersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
