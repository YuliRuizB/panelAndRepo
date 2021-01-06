import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultDashboardComponent } from './default/default-dashboard.component';
import { WithBreadcrumbDashboardComponent } from './with-breadcrumb/with-breadcrumb-dashboard.component';
import { AuthGuard } from 'src/app/shared/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    // canActivateChild: [ AuthGuard ],
    // canActivate: [NgxPermissionsGuard],
    // data: {
    //   permissions: {
    //     only: 'ADMIN',
    //     redirectTo: '/authentication/login'
    //   }
    // },
    children: [
      {
        path: '',
        redirectTo: 'default',
        pathMatch: 'full'
      },
      {
        path: 'admin',
        component: DefaultDashboardComponent,
        canActivate: [ AuthGuard ],
        data: {
          role: ['admin'],
          title: 'General'
        }
      },
      {
        path: 'default',
        component: DefaultDashboardComponent,
        canActivate: [ AuthGuard ],
        data: {
          role: ['admin', 'vendor'],
          title: 'General'
        }
      },
      {
        path: 'user',
        component: DefaultDashboardComponent,
        data: {
          role: ['user','anonymous'],
          title: 'Usuario'
        }
      },
      {
        path: 'vendor',
        component: DefaultDashboardComponent,
        data: {
          role: ['vendor','sales'],
          title: 'Transportista'
        }
      },
      {
        path: 'sales',
        component: WithBreadcrumbDashboardComponent,
        data: {
          role: ['sales','user'],
          title: 'Ventas'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
