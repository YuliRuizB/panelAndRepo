import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FleetComponent } from './fleet/fleet.component';
import { LogisticsComponent } from './logistics/logistics.component';
import { RoutesComponent } from './routes/routes.component';
import { RoutesNewComponent } from './routes/new/new.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { VehicleEditComponent } from './fleet/edit/edit.component';
import { ProgramComponent } from './program/program.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { VendorUsersListComponent } from './users/list/list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'fleet',
        pathMatch: 'full'
      },
      {
        path: 'program',
        component: ProgramComponent,
        data: {
          title: 'Programa'
        }
      },
      {
        path: 'assignment',
        component: AssignmentComponent,
        data: {
          title: 'Asignación'
        }
      },
      {
        path: 'list',
        component: ListComponent,
        data: {
          title: 'Listado'
        }
      },
      {
        path: 'edit/:id',
        component: EditComponent,
        data: {
          title: 'Editar'
        }
      },
      {
        path: 'fleet',
        component: FleetComponent,
        data: {
          title: 'Flota Vehicular'
        }
      },
      {
        path: 'vehicle/edit/:id',
        component: VehicleEditComponent,
        data: {
          title: 'Editar'
        }
      },
      {
        path: 'logistics',
        component: LogisticsComponent,
        data: {
            title: 'En vivo'
        }
      },
      {
        path: 'routes',
        component: RoutesComponent,
        data: {
            title: 'Rutas'
        }
      },
      {
        path: 'routes/new',
        component: RoutesNewComponent,
        data: {
            title: 'Rutas'
        }
      },
      {
        path: 'users',
        component: VendorUsersListComponent,
        data: {
          title: 'Usuarios'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class VendorRoutingModule { }
