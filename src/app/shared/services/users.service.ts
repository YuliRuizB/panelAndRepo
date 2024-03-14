import { Injectable } from '@angular/core';
import { switchMap, map, take, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { of, combineLatest, Observable } from 'rxjs';
import { NzMessageDataOptions, NzMessageService } from 'ng-zorro-antd/message';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';




@Injectable({
  providedIn: 'root'
})
export class UsersService {
  joined$: Observable<any>;   
   user: AngularFirestoreDocument<any>;
   usersCollection: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore, private message: NzMessageService) { 
    
  }
  getBoardingPassesByRoute(vendorId: string) {
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => ref.where('active', '==', true)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {       
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
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
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });        
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
              customerName: permission[0].customerName || ''
            }
          }) : of([])
        }) 
      )
      return this.joined$;
  }

  getBoardingPassesByProduct(productId: string) {
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => ref.where('active', '==', true)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {        
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>                          
                //this.afs.collectionGroup('boardingPasses', ref => ref.where('routeId', '==', routeId)).snapshotChanges().pipe( //.where('product_id','==', productId)
                this.afs.collectionGroup('boardingPasses', ref => {
                  return ref
                    .where('routeId', '==', routeId)
                    .where('product_id', '==', productId);
                }).snapshotChanges().pipe(
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
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });      
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
              customerName: permission[0].customerName || ''
            }
          }) : of([])
        }) 
      )
      return this.joined$;
  }

  getBoardingPassesByTurn(productId: string, turno: string) {
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => ref.where('active', '==', true)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {       
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>                          
                //this.afs.collectionGroup('boardingPasses', ref => ref.where('routeId', '==', routeId)).snapshotChanges().pipe( //.where('product_id','==', productId)
                this.afs.collectionGroup('boardingPasses', ref => {
                  return ref
                    .where('routeId', '==', routeId)
                    .where('round', '==', turno)
                    .where('product_id', '==', productId);
                }).snapshotChanges().pipe(
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
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
              customerName: permission[0].customerName || ''
            }
          }) : of([])
        }) 
      )
      return this.joined$;

  }  

  getBoardingPassesByAnticipos(productId: string) {
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => ref.where('active', '==', true)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {         
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>                          
               this.afs.collectionGroup('boardingPasses', ref => {
                  return ref
                    .where('routeId', '==', routeId)
                    .where('product_id', '==', productId)
                    .where('payment', '==', 'Anticipo');
                }).snapshotChanges().pipe(
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
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });       
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
              customerName: permission[0].customerName || ''
            }
          }) : of([])
        }) 
      )
      return this.joined$;
  }

  getBoardingPassRoutes() {
    const routes = this.afs.collectionGroup('routesAccess', ref => 
    ref.where('active','==',true)
    );
    return routes.snapshotChanges();
  }

  getBoardingPassRoute(productId: string) {
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => ref.where('active', '==', true)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {         
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>                          
               this.afs.collectionGroup('boardingPasses', ref => {
                  return ref
                    .where('routeId', '==', routeId)
                    .where('product_id', '==', productId)
                    .where('payment', '==', 'Anticipo')   
                    .where('baja', '==', '')                  
                    .where('promiseDate', '<=', new Date());                    
                }).snapshotChanges().pipe(
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
          console.log("boarding pasess");
          console.log(boardingPasses);        
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });       
            return {
             // passes: [...boardingPass],
             //permissions:[...permissions]
             // permission: permission[0].active ? permission[0].active : false,
             // permissionId: permission[0].id,
             // customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
              routeId:permission[0].routeId || ''
              //customerName: permission[0].customerName || ''
            }
          }) : of([])
        }) 
      )
      return this.joined$;
  }

  getBoardingPassBySingleRoute(productId: string, routeIdPrincipal:string) {
    console.log(productId + " / " +routeIdPrincipal);
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => 
    ref.where('active', '==', true)
      .where('routeId', '==', routeIdPrincipal)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {         
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>                          
               this.afs.collectionGroup('boardingPasses', ref => {
                  return ref
                    .where('routeId', '==', routeId)
                    .where('product_id', '==', productId)
                    .where('payment', '==', 'Anticipo')   
                    .where('baja', '==', '')                  
                    .where('promiseDate', '<=', new Date());                    
                }).snapshotChanges().pipe(
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
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });       
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
              customerName: permission[0].customerName || ''
            }
          }) : of([])
        }) 
      )
      return this.joined$;
  }

  getBoardingPassesByCV(productId: string) {
    const today = new Date();
    this.joined$ = this.afs.collectionGroup('routesAccess', ref => ref.where('active', '==', true)).valueChanges()
      .pipe(
        take(1),
        switchMap((permissions:any) => {         
          const routeIds = _.uniq(permissions.map(p => p.routeId
           ));
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>                          
               this.afs.collectionGroup('boardingPasses', ref => {
                  return ref
                    .where('routeId', '==', routeId)
                    .where('product_id', '==', productId)
                    .where('payment', '==', 'Anticipo')   
                    .where('baja', '==', '')                  
                    .where('promiseDate', '<=', new Date());                    
                }).snapshotChanges().pipe(
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
        console.log("boarding pasess");
        console.log(boardingPasses);   
          const sanitized = boardingPasses.filter(item => !!item && item.length > 0);        
          return typeof sanitized != "undefined" ? sanitized.map((boardingPass:any) => {

            const permission = _.filter(permissions, (p) => {
                return boardingPass[0].routeId === p.routeId
            });       
            return {
              passes: [...boardingPass],
              permission: permission[0].active ? permission[0].active : false,
              permissionId: permission[0].id,
              customerId: permission[0].customerId || '',
              routeName:permission[0].routeName || '',
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

  getLastValidBoardingPass(userId: string) {
    const activityLogRef = this.afs.collection('users').doc(userId).collection('boardingPasses');
    return activityLogRef.stateChanges().pipe(
      take(1),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return {id, ...data}
      }))
    );
  }

  updateUserAvatar(userId: string, photoURL: string) {
   // this.message.loading('Actualizando ...');
    const vendorRef = this.afs.collection('users').doc(userId);
    vendorRef.update({photoURL}).then( () => {
     // this.message.remove();
     // this.message.success('Todo listo');
    }).catch( (err) => {
     // this.message.remove();
      this.message.error('Hubo un error: ', err);
      console.log(err)
    })
  }

  updateUserPreRegister(userId: string, status: string) {   
     const vendorRef = this.afs.collection('users').doc(userId);
     console.log("toChange " + userId +  " to status  " + status);
     vendorRef.update({status: status}).then( () => {      
     }).catch( (err) => {
      // this.message.remove();
       this.message.error('Hubo un error: ', err);
       console.log(err)
     })
   }
 

  updateUserCollection(uid: string, user: any) {   
    this.user =  this.afs.collection('users').doc(uid);
    return this.user.update(user).then(() => {
   //   this.message.success('Se actualizo con exito el usuario,  favor de refrescar la pagina.!');
    }).catch(err => {
      this.message.error(`¡Oops! Algo salió mal ... ${err}`);
    });
  }

  getUserInfo(userID:string){
    const InfoUser  = this.afs.collection("users").doc(userID); 
    return InfoUser.snapshotChanges();

  }
  getUserInfoByEmail(email:string) {
    const usersCollection = this.afs.collection("users", ref => ref.where('email', '==', email));
  return usersCollection.snapshotChanges();
  }

}