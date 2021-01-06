import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { NgChartjsModule } from 'ng-chartjs';
import { LogisticsRoutingModule } from './logistics-routing.module';
import { LogisticsMainComponent } from './main/main.component';
import { LogisticsService } from './services.service';

@NgModule({
  declarations: [
    LogisticsMainComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    LogisticsRoutingModule,
    NgChartjsModule
  ],
  providers: [
    ThemeConstantService,
    LogisticsService
  ]
})
export class LogisticsModule { }
