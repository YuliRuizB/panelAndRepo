import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          title: 'General'
        }
      },
      {
        path: 'main',
        component: ListComponent,
        data: {
          title: 'General'
        }
      },
      {
        path: 'edit/:id/:index',
        component: EditComponent,
        data: {
          title: 'Editar',
          headerDisplay: "none"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class AccountsRoutingModule { }
