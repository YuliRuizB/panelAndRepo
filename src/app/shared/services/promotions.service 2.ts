import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { NzMessageService } from "ng-zorro-antd";

@Injectable({
    providedIn: 'root'
  })
  export class PromotionService{

    db = firebase.firestore(); 
    promotion: AngularFirestoreCollection<any>;
    promotionCollection: AngularFirestoreCollection<any>;

    constructor(private afs: AngularFirestore,
      public messageService: NzMessageService){
   

     this.promotion = this.afs.collection('customer');}
    
    getPromotionsList(accountId: string) {
        const promotionsCollection = this.afs.collection('customers').doc(accountId).collection('promotions', ref => ref.orderBy('date_created', 'asc'));
        return promotionsCollection.snapshotChanges();
      }

    savePromotion(promotion: any, customerID:string) {
      const docId = this.afs.createId();
      const newProductRef = this.db.collection('customers').doc(customerID).collection('promotions').doc(docId);
      const batch = this.db.batch();
      batch.set(newProductRef, promotion);
      return batch.commit();
    }

    editPromotion(promId:string, customerId:string, name:string, description:string, validFrom:any, validTo:any){
      const promRef = this.db.collection('customers').doc(customerId).collection('promotions').doc(promId);
      return promRef.update({
        name: name ,
        description: description,
        validFrom:validFrom,
        validTo:validFrom
      })
      .then(() => {
        this.sendMessage('success', '¡Listo! la promoción fue actualizada');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
      ;   
    }

    deactivePromotion(accountId: string,value:boolean,customerID:string ){
      const promRef = this.db.collection('customers').doc(customerID).collection('promotions').doc(accountId);
      return promRef.update({
        active: value       
      })
      .then(() => {
        this.sendMessage('success', '¡Listo! la promoción fue desactivada');
      }).catch(err => {
        this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`);
      });
      ;    
    }
    
    deletePromotion(customerID: string, promID:string){

      const promotionDelete = this.afs.collection('customers').doc(customerID).collection('promotions').doc(promID);
      promotionDelete.delete()
        .then(() => this.sendMessage('success', 'La Promocion a sido eliminada.'))
        .catch(err => this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`)); 
    }

    sendMessage(type: string, message: string): void {
      this.messageService.create(type, message);
    }
  }