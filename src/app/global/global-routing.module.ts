import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlobalUsersListComponent } from './users/list/list.component';
import { RolesComponent } from './roles/roles-dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile-dashboard.component';

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
        {
          path: 'roles/dashboard',
          component: RolesComponent,
          data: {
            title: 'Roles'
          }
        },
        {
          path: 'my-profile/dashboard',
          component: MyProfileComponent,
          data: {
            title: 'Mi Perfil'
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
