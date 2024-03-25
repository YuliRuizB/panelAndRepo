import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import 'firebase/firestore'
import { bufferCount, mergeMap, reduce, switchMap, take } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
  })
  export class MessageCenterService {
    constructor( 
        private afs: AngularFirestore,
        private aff: AngularFireFunctions
        ) { }


     getUsersByCustomer(customerID:string){
         let listOfUsers:any[] = [];
       // bring list of users per CostumerID
       const listUsersbyCustomer =  this.afs.collection('users', (ref) => ref
      .where('customerId', '==', customerID)
      // .where('active', '==', true)
        ).snapshotChanges();
        
        return listUsersbyCustomer;
    }
   getUserByRouteRound(round:string, idRoute:string){

        const today = new Date();
        const usersBoardingPassesByCustomer = this.afs.collectionGroup('boardingPasses', ref => 
            ref
            .where('routeId', '==', idRoute)
            .where('round', '==', round)
           .where('validTo', '>=', today)
        );
       return usersBoardingPassesByCustomer;
    }

    getUserToken(userID:string){
      const RefUser  = this.afs.collection("users").doc(userID); 
   return RefUser.snapshotChanges();
  }
}