import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { CustomersRoutingModule } from './customers-routing.module';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TableService } from '../shared/services/table.service';
import { PaymentsComponent } from './payments/payments.component';
import { PayeeComponent } from './payments/payee/payee.component';
import { CustomersService } from './services/customers.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppsService } from '../shared/services/apps.service';
import { ListComponent } from './list/list.component';
import { RoutesComponent } from './routes/routes.component';
import { RouteEditComponent } from './routes/edit/edit.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CustomersRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [
    DashboardComponent,
    PaymentsComponent,
    PayeeComponent,
    ListComponent,
    RoutesComponent,
    RouteEditComponent
  ],
  providers: [
    ThemeConstantService,
    TableService,
    CustomersService,
    AppsService
  ]
})
export class CustomersModule { }
