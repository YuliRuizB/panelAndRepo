import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { NgChartjsModule } from 'ng-chartjs';
import { FleetComponent } from './fleet/fleet.component';
import { LogisticsComponent } from './logistics/logistics.component';
import { VendorRoutingModule } from './vendor-routing.module';
import { RoutesComponent } from './routes/routes.component';
import { RoutesNewComponent } from './routes/new/new.component';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { VehicleEditComponent } from './fleet/edit/edit.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { ProgramComponent } from './program/program.component';
import { VendorUsersListComponent } from './users/list/list.component';

@NgModule({
  declarations: [ 
    FleetComponent,
    LogisticsComponent,
    RoutesComponent,
    RoutesNewComponent,
    ListComponent,
    EditComponent,
    VehicleEditComponent,
    AssignmentComponent,
    ProgramComponent,
    VendorUsersListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgChartjsModule,
    VendorRoutingModule
  ],
  providers: [
    ThemeConstantService
  ]
})
export class VendorModule { }
