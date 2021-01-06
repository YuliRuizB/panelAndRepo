import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NzNotificationService } from 'ng-zorro-antd';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  documentPath = 'admin/dashboard';
  dashboardItems: any;

  constructor(
    private afs: AngularFirestore,
    private notification: NzNotificationService
  ) {
    this.dashboardItems = this.afs.doc<any>(this.documentPath).valueChanges();
  }

  getDashboardItems() {
    return this.dashboardItems;
  }
}
