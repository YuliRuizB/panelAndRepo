import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogisticsMainComponent } from './main/main.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: LogisticsMainComponent,
        data: {
          title: 'Logística'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogisticsRoutingModule { }
