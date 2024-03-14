import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { NzMessageService } from 'ng-zorro-antd/message';
//import * as firebase from 'firebase/app';
import { Timestamp } from 'firebase/firestore';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICredential } from '../classes/customers';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  user: AngularFirestoreDocument<any>;
  purchase: AngularFirestoreDocument<any>;
  payment: AngularFirestoreDocument<any>;
  userBoardingPass: AngularFirestoreDocument<any>;
  userPurchase: AngularFirestoreDocument<any>;
  userPurchasePayment: AngularFirestoreDocument<any>;
  usersCollection: AngularFirestoreCollection<any>;
  paymentsCollection: AngularFirestoreCollection<any>;
  purchasesCollection: AngularFirestoreCollection<any>;
  routesCollection: AngularFirestoreCollection<any>;
  userBoardingPassesCollection: AngularFirestoreCollection<any>;
  userBoardingPassesDetailCollection : AngularFirestoreCollection<any>;
  userPurchasesCollection: AngularFirestoreCollection<any>;
  userPurchasesDetailCollection: AngularFirestoreCollection<any>;
  userPurchasePaymentsCollection: AngularFirestoreCollection<any>;

  constructor(
    private afs: AngularFirestore,
    public messageService: NzMessageService, 
    private aff: AngularFireFunctions
  ) {
    this.usersCollection = this.afs.collection('users');
    this.paymentsCollection = this.afs.collection('payments');
    this.purchasesCollection = this.afs.collection('purchases');
    this.routesCollection = this.afs.collection('routes');
    // this.userBoardingPassesCollection = this.usersCollection.doc().collection('boardingPass');
    // this.userPurchasesCollection = this.usersCollection.doc().collection('purchases');
    // this.userPurchasePaymentsCollection = this.userPurchasesCollection.doc().collection('payments');
  }

  getUser(uid: string) {
    this.user = this.usersCollection.doc(uid);
    return this.user;
  }

  getUsers() {
    const users = this.usersCollection.get();
    return users.toPromise();
  }

  updateUser(userId: string, updatedUser: any) {
    const userRef = this.usersCollection.doc(userId);
    return userRef.set(updatedUser, { merge: true});
  }

  getAccountUsers(accountId: string) {
    const users = this.afs.collection('users', ref =>
      ref.where('customerId', '==', accountId)
    );
    return users.snapshotChanges();
  }

  getAccountSystemUsers(accountId: string, userType: string) {
    const users = this.afs.collection('users', ref =>
      ref.where('customerId', '==', accountId).where('occupation','==',userType)
    );
    return users.snapshotChanges();
  }

  getAccountUsersWithCredential(accountId: string, userType: string) {
    const users = this.afs.collection('users', ref =>
      ref.where('customerId', '==', accountId).where('occupation','==',userType).where('hasCredential','==', true)
    );
    return users.snapshotChanges();
  }

  getAccountProducts(accountId: string) {
    const products = this.afs.collection('customers').doc(accountId).collection('products', ref => ref.orderBy('date_created', 'asc'));
    return products.snapshotChanges();
  }

  deleteUser(uid: string) {
    this.user = this.usersCollection.doc(uid);
    this.user.delete()
      .then(() => this.sendMessage('success', 'La cuenta ha sido eliminada.'))
      .catch(err => this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`));
  }

  setUserDisabled(uid: string, disabled: boolean) {
    this.user = this.usersCollection.doc(uid);
    const lastUpdatedAt = Timestamp.fromDate(new Date());
    this.user.update({ disabled, lastUpdatedAt })
      .then(() => this.sendMessage('success', 'La cuenta ha sido modificada.'))
      .catch(err => this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`));
  }

  getLastPurchase(purchaseId: string) {
    this.purchase = this.purchasesCollection.doc(purchaseId);
    return this.purchase;
  }

  getRoutes() {
    return this.routesCollection;
  }

  createUserWithoutApp(newUser: any) {
    const newId = this.afs.createId();
    newUser.uid = newId;   
    const user = this.afs.collection('users').doc(newId);
    return user.set(newUser).then(() => {
      return newId;
    })
  }

  createSystemUser(newUser: any) {
    const newId = this.afs.createId();
    newUser.uid = newId;  
    const user = this.afs.collection('bulkusers').doc(newId);
    return user.set(newUser);
  }


  createSystemDeleteUser(newUserD: any) {
    const newId = this.afs.createId();
  //  newUserD.uid = newId; 
    const user = this.afs.collection('deleteUsers').doc(newId).set(newUserD)
    .then(() => {
      console.log('Document successfully written!');
    })
    .catch((error) => {
      console.error('Error writing document: ', error);
    });
  }
  createPurchaseRequest(userID: string, purchaseDetail:any) {
    const newId = this.afs.createId();
    const user = this.afs.collection('users').doc(userID).collection("purchaseRequests").doc(newId).set(purchaseDetail)
    .then(() => {
      console.log('Purchase Request  successfully written!');
      return newId;
    })
    .catch((error) => {
      console.error('Error writing document: ', error);

      return "";
    });
  }


  saveOldBoardingPassToUserCollection(purchaseId: string) {
    this.purchase = this.purchasesCollection.doc(purchaseId);
    this.purchase.valueChanges().subscribe((document) => {
      const uid = document.uid;
      document.active = true;
      this.userPurchasesCollection = this.usersCollection.doc(uid).collection('purchases');
      this.userPurchase = this.userPurchasesCollection.doc(purchaseId);
      return this.userPurchase.set(document).then(() => {
        this.sendMessage('success', '¡Listo!');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
    });

  }

  createCredential(userId: string, studentId: string, validFrom: any, validTo: any, active: boolean) {
    const credential: ICredential = {
      active,
      disabled: false,
      studentId: studentId,
      userId,
      validFrom,
      validTo
    };
    
    const userCredentialRef = this.afs.collection('users').doc(userId).collection('credentials');
    return userCredentialRef.add(credential).then((response) => {
      const userRef = this.afs.collection('users').doc(userId);
      userRef.update({
        hasCredential: true,
        credentialId: response.id
      });  
    })
  }

  saveUserProductPurchase(uid: string, purchase: object) {
    this.userPurchasesCollection = this.usersCollection.doc(uid).collection('purchasedProducts');
    return this.userPurchasesCollection.add(purchase).then(() => {
      this.sendMessage('success', '¡Listo!');
    }).catch(err => {
      this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
    });
  }

  activatePurchase(uid: string, purchaseId: string, active: boolean) {
    this.user = this.usersCollection.doc(uid);   
    this.purchase = this.user.collection('boardingPasses').doc(purchaseId);
    const lastUpdatedAt = Timestamp.fromDate(new Date());
    this.purchase.update({active, lastUpdatedAt})
      .then(() => {
        this.sendMessage('success', '¡Listo!');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
  }

  deletePurchase(uid: string, purchaseId: string) {
    this.user = this.usersCollection.doc(uid);   
    this.purchase = this.user.collection('boardingPasses').doc(purchaseId);
    this.purchase.delete()
      .then(() => {
        this.sendMessage('success', '¡Listo!');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
  }

  activateCredential(uid: string, credentialId: string, active: boolean) {
    const userCredential = this.usersCollection.doc(uid).collection('credentials').doc(credentialId);
    return userCredential.update({
      active,
      disabled: !active
    })
      .then(() => {
        this.sendMessage('success', '¡Listo!');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
  }

  deleteCredential(uid: string, credentialId: string) {
    const userCredential = this.usersCollection.doc(uid).collection('credentials').doc(credentialId);
    return userCredential.delete()
      .then(() => {
        this.sendMessage('success', '¡Listo!');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
  }

  saveBoardingPassToUserPurchaseCollection(uid: string, purchase: object) {
    this.userPurchasesCollection = this.usersCollection.doc(uid).collection('boardingPasses');
    return this.userPurchasesCollection.add(purchase).then(() => {
      this.sendMessage('success', 'Se creo el pase de abordar.!');
    }).catch(err => {
      this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
    });
  }

  async createPurchaseCloud(send:any, currentUser:any , idBoardingPass: string) {  
    const purchaseRequest44 = await  this.aff.httpsCallable('createPurchaseRequest');
    purchaseRequest44({ purchaseRequestData: send, user:currentUser , idBoardingPass: idBoardingPass }).toPromise().then((response: any) => {
      console.log(response);
    //  this.sendMessage(success("El registro se hizo con exito");
    }).catch((err) => {
      console.log(err);
    })
  }

  saveBoardingPassDetailToUserPurchaseCollection(uid: string, purchaseId: string, purchaseDetail : object) {
    return new Promise(async (resolve, reject) => {
      const aux1 = await this.usersCollection.doc(uid).collection('boardingPasses').doc(purchaseId).collection('boardingPassesDetail');
      aux1.add(purchaseDetail).then(() => {
        this.sendMessage('success', 'Purchase Order Detail Creado!');
        resolve(true)
      }).catch(err => {
        resolve(false)
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
    })
 
  }

  updateBoardingPassToUserPurchaseCollection(uid: string, purchase: any) {  
    this.purchase = this.usersCollection.doc(uid).collection('boardingPasses').doc(purchase.id);
    return this.purchase.update(purchase).then(() => {
      this.sendMessage('success', 'Se actualizo con exito el pago,  favor de refrescar la pagina.!');
    }).catch(err => {
      this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
    });
  }

  getLatestUserPurchases(uid: string, limit?: number) {   
    this.userBoardingPassesCollection = this.usersCollection.doc(uid)
      .collection('boardingPasses', ref =>
        ref.limit(limit).orderBy('creation_date', 'desc')
      );
    return this.userBoardingPassesCollection.snapshotChanges();
  }

  getLatestUserPurchasesRequest(uid: string, limit?: number) {   
    this.userBoardingPassesCollection = this.usersCollection.doc(uid)
      .collection('purchaseRequests', ref =>
        ref.limit(limit).orderBy('creation_date', 'desc')
      );
    return this.userBoardingPassesCollection.snapshotChanges();
  }

  getLatestUserPurchaseDetail(uid: string, limit?: number, purchaseId?: string) {
    this.userBoardingPassesDetailCollection = this.usersCollection.doc(uid).collection('boardingPasses').doc(purchaseId)
      .collection('boardingPassesDetail', ref =>
        ref.limit(limit).orderBy('creation_date', 'desc')
      );
    return this.userBoardingPassesDetailCollection.snapshotChanges();
  }

  getLatestValidUserPurchases(uid: string, limit: number = 10) {  
    this.userBoardingPassesCollection = this.usersCollection.doc(uid)
      .collection('boardingPasses', ref =>
        ref.where('validTo','<=', new Date())
        .limit(limit).orderBy('validTo', 'desc')
      );
    return this.userBoardingPassesCollection.snapshotChanges();
  }


  getLatestValidUserPurchasesAdvance(uid: string, limit: number = 10, promiseDate: string, paymentSelected: string,creation_date :string) {
  
   
    if (paymentSelected == "Mensualidad") {
    
      this.userBoardingPassesCollection =  this.afs.collection('users').doc(uid).collection('boardingPasses', ref => {
        let filterData = ref.where('creation_date','==', creation_date);
        return filterData;
      })
      // this.userBoardingPassesCollection = this.usersCollection.doc(uid).collection('boardingPasses');
      // this.userBoardingPassesCollection.ref.where('creation_date','==', creation_date);
      // .collection('boardingPasses', ref =>
      //   ref.where('creation_date','==', creation_date)
        // .limit(limit).orderBy('creation_date', 'desc')
      //);    
      return this.userBoardingPassesCollection.snapshotChanges();

    } else {
      this.userBoardingPassesCollection = this.usersCollection.doc(uid)
      .collection('boardingPasses', ref =>
        ref.where('promiseDate','<=', promiseDate)
        .limit(limit).orderBy('promiseDate', 'desc')
      );
    return this.userBoardingPassesCollection.snapshotChanges();
    }
   
  }

  setUserPurchasePayment(uid: string, purchaseId: string, data: object) {
    const object = {
      amount: 500,
      deleted: false,
      isPartial: true,
      lastUpdatedAt: new Date(),
      method: 'cash',
      receivedAt: 'Banregio',
      timestamp: new Date(),
      transactionId: '284934581',
      userCreated: 'Ernesto Vallejo',
      userModified: 'Ernesto Vallejo',
      valid: true
    };
  }

  setUserCredential(uid: string, credential: any) {
    const userCredential = this.usersCollection.doc(uid).collection('credentials');
    return userCredential.add(credential);
  }

  getUserCredentials(uid: string) {
    const userCredentials = this.usersCollection.doc(uid).collection('credentials');
    return userCredentials.snapshotChanges().pipe(
      map((actions:any) => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    )
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }
}
