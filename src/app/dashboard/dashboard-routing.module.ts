import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultDashboardComponent } from './default/default-dashboard.component';
import { WithBreadcrumbDashboardComponent } from './with-breadcrumb/with-breadcrumb-dashboard.component';
import { AuthGuard } from 'src/app/shared/guard/auth.guard';
import { QualityDashboardComponent } from './quality/quality-dashboard.component';
import { ReportsDashboardComponent } from './reports/reports-dashboard.component';

const routes: Routes = [
  {
    path: '',
   
    children: [
      {
        path: '',
        redirectTo: 'default',
        pathMatch: 'full'
      },
      {
        path: 'admin',
        component: DefaultDashboardComponent,
       
      },
      {
        path: 'admin',
        component: QualityDashboardComponent,
      
      },
      {
        path: 'admin',
        component: ReportsDashboardComponent,
      
      },
      {
        path: 'default',
        component: DefaultDashboardComponent,
     
      },
      {
        path: 'quality',
        component: QualityDashboardComponent,
     
      },
      {
        path: 'reports',
        component: ReportsDashboardComponent,
    
      },
      {
        path: 'user',
        component: DefaultDashboardComponent,
    
      },
      {
        path: 'vendor',
        component: DefaultDashboardComponent,
        },
      {
        path: 'sales',
        component: WithBreadcrumbDashboardComponent,
     
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
