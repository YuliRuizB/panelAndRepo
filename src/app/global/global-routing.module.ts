import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlobalUsersListComponent } from './users/list/list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'users/dashboard',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: GlobalUsersListComponent,
        data: {
          title: 'Usuarios'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GlobalRoutingModule { }
