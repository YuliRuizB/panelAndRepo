import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { of, combineLatest, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  joined$: Observable<any>;

  constructor(private afs: AngularFirestore) { }

  getBoardingPassesByRoute(vendorId: string) {
    const today = new Date();
    this.joined$ = this.afs.collection('vendors').doc(vendorId).collection('routesAccess').valueChanges({ idField: 'id'})
      .pipe(
        switchMap((permissions:any) => {
          const routeIds = _.uniq(permissions.map(p => p.routeId));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>
                this.afs.collectionGroup('boardingPasses', ref => ref.where('routeId', '==', routeId)).snapshotChanges().pipe( //.where('validFrom','>=', today)
                  map((boardingPasses: any) => boardingPasses.map( bp => {
                    const id = bp.payload.doc.id;
                    const data = bp.payload.doc.data();
                    const uid = bp.payload.doc.ref.parent.parent.id;
                    return { id, uid, ...data}
                  }))
                )
              )
            )
          )
        }),
        map(([permissions, boardingPasses]) => {
          const sanitized = boardingPasses.filter(item => !!item && item.length > 0);
          console.log(sanitized);
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {
            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });
            
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              customerName: permission[0].customerName || ''
            }
          }) : of([])
        })
      )
      return this.joined$;
  }

  getBoardingPassActivityLog(userId: string, boardingPassId: string) {
    const activityLog = this.afs.collection('users').doc(userId).collection('boardingPasses').doc(boardingPassId).collection('activityLog', ref => ref.orderBy('created'));
    return activityLog.snapshotChanges();
  }
}
