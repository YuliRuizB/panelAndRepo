import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { NgChartjsModule } from 'ng-chartjs';
import { DefaultDashboardComponent } from './default/default-dashboard.component';
import { WithBreadcrumbDashboardComponent } from './with-breadcrumb/with-breadcrumb-dashboard.component';
import { QualityDashboardComponent } from './quality/quality-dashboard.component';
import { ReportsDashboardComponent } from './reports/reports-dashboard.component';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        DashboardRoutingModule,
        NgChartjsModule
    ],
    exports: [],
    declarations: [
        DefaultDashboardComponent,
        QualityDashboardComponent,
        ReportsDashboardComponent,
        WithBreadcrumbDashboardComponent
    ],
    providers: [
        ThemeConstantService
    ],
})
export class DashboardModule { }
