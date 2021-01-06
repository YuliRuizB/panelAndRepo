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

  // getUser(uid: string) {
  //   this.user = this.usersCollection.doc(uid);
  //   return this.user;
  // }

  // deleteUser(uid: string) {
  //   this.user = this.usersCollection.doc(uid);
  //   this.user.delete()
  //     .then( () => this.sendMessage('success', 'La cuenta ha sido eliminada.'))
  //     .catch( err => this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`));
  // }

  // getLastPurchase(purchaseId: string) {
  //   this.purchase = this.purchasesCollection.doc(purchaseId);
  //   return this.purchase;
  // }

  // getRoutes() {
  //   return this.routesCollection;
  // }

  // saveOldBoardingPassToUserCollection(purchaseId: string) {
  //   this.purchase = this.purchasesCollection.doc(purchaseId);
  //   this.purchase.valueChanges().subscribe( (document) => {
  //     const uid = document.uid;
  //     document.active = true;
  //     this.userPurchasesCollection = this.usersCollection.doc(uid).collection('purchases');
  //     this.userPurchase = this.userPurchasesCollection.doc(purchaseId);
  //     return this.userPurchase.set(document).then( () => {
  //       this.sendMessage('success', '¡Listo!');
  //     }).catch( err => {
  //       this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
  //     });
  //   });

  // }

  // activatePurchase(uid: string, purchaseId: string, paid: boolean) {
  //   this.user = this.usersCollection.doc(uid);
  //   this.purchase = this.user.collection('purchases').doc(purchaseId);
  //   this.purchase.valueChanges().subscribe( (purchase) => {
  //     console.log(purchase);
  //     this.user.update( {
  //       activeMonth: purchase.monthName,
  //       paid: paid,
  //       defaultRoute: purchase.route,
  //       defaultRound: purchase.round,
  //       paymentId: purchaseId,
  //       paidMonth: purchase.month,
  //       month: purchase.month
  //     }).then( () => {
  //       this.sendMessage('success', '¡Listo!');
  //     }).catch( err => {
  //       this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
  //     });
  //   }, err => { this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`); });
  // }

  // saveBoardingPassToUserPurchaseCollection(uid: string, purchase: object) {
  //   this.userPurchasesCollection = this.usersCollection.doc(uid).collection('purchases');
  //   return this.userPurchasesCollection.add(purchase).then( () => {
  //     this.sendMessage('success', '¡Listo!');
  //   }).catch( err => {
  //     this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
  //   });
  // }

  // getLatestUserPurchases(uid: string, limit?: number) {
  //   this.userBoardingPassesCollection = this.usersCollection.doc(uid)
  //     .collection('purchases', ref =>
  //       ref.limit(limit)
  //   );
  //   return this.userBoardingPassesCollection;
  // }

  // setUserPurchasePayment(uid: string, purchaseId: string, data: object) {
  //   const object = {
  //     amount: 500,
  //     deleted: false,
  //     isPartial: true,
  //     lastUpdatedAt: new Date(),
  //     method: 'cash',
  //     receivedAt: 'Banregio',
  //     timestamp: new Date(),
  //     transactionId: '284934581',
  //     userCreated: 'Ernesto Vallejo',
  //     userModified: 'Ernesto Vallejo',
  //     valid: true
  //   };
  // }

  // sendMessage(type: string, message: string): void {
  //   this.messageService.create(type, message);
  // }
}
