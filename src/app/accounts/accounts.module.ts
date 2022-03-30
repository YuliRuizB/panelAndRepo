import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { NgChartjsModule } from 'ng-chartjs';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountsRoutingModule } from './accounts-routing.module';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [DashboardComponent, ListComponent, EditComponent],
  imports: [
    CommonModule,
    AccountsRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgChartjsModule
  ],
  providers: [
    ThemeConstantService
  ]
})
export class AccountsModule { }
