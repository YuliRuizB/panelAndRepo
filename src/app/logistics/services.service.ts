import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { NzMessageService } from 'ng-zorro-antd/message';
import { switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject, combineLatest} from 'rxjs';
import { IActivityLog } from './classes';

@Injectable({
  providedIn: 'root'
})
export class LogisticsService {

  activityLogCollection: AngularFirestoreCollection<IActivityLog[]>;
  activity: Observable<IActivityLog>;
  collection = 'activityLog';
  

  constructor(
    private afs: AngularFirestore,
    public messageService: NzMessageService
  ) {
    this.activityLogCollection = this.afs.collection(this.collection);
  }

  getActivityLog(start: Date, end: Date) {
    console.log(start, end);
    return this.afs.collection(this.collection, (ref) => ref
      .where('created', '>', start)
      .where('created', '<', end)
      .orderBy('created','desc')
    ).snapshotChanges();
  }

  getMarkers(start: Date, end: Date) {
    return this.afs.collection(this.collection, (ref) => ref
      .where('created', '>', start)
      .where('created', '<', end)
      .orderBy('created','desc')
    ).snapshotChanges();
  }

  getChartData(start: Date, end: Date) {
    return this.afs.collection(this.collection, (ref) => ref
      .where('created', '>', start)
      .where('created', '<', end)
      .orderBy('created','desc')
    ).snapshotChanges();
  }

}
