import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { GlobalRoutingModule } from './global-routing.module';
import { ThemeConstantService } from '../shared/services/theme-constant.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppsService } from '../shared/services/apps.service';
import { GlobalUsersListComponent } from './users/list/list.component';
import { RolesComponent } from './roles/roles-dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    GlobalRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [
    GlobalUsersListComponent,
    RolesComponent,
    MyProfileComponent
  ],
  providers: [
    ThemeConstantService,
    AppsService
  ]
})
export class GlobalModule { }
