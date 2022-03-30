import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PaymentsComponent } from './payments/payments.component';
import { PayeeComponent } from './payments/payee/payee.component';
import { ListComponent } from './list/list.component';
import { RoutesComponent } from './routes/routes.component';
import { RouteEditComponent } from './routes/edit/edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: ListComponent,
        data: {
          title: 'Clientes'
        }
      },
      {
        path: 'list',
        component: DashboardComponent,
        data: {
          title: 'Clientes'
        }
      },
      {
        path: 'payments',
        component: PaymentsComponent,
        data: {
          title: 'Pagos'
        }
      },
      {
        path: 'payment/:id',
        component: PayeeComponent,
        data: {
          title: 'Recibir pago'
        }
      },
      {
        path: 'routes',
        component: RoutesComponent,
        data: {
          title: 'Rutas'
        }
      },{
        path: 'routes/edit/:accountId/:routeId',
        component: RouteEditComponent,
        data: {
          title: 'Editar'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersRoutingModule { }
