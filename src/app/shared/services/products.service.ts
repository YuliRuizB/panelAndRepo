import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
//import * as firebase from 'firebase';
import { Product } from '../interfaces/product.type';
import { serverTimestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  //db = firebase.firestore();

  constructor(private afs: AngularFirestore) { }

  getActiveProducts(accountId: string) {
    const activeProducts = this.afs.collection('customers').doc(accountId).collection('products', ref => ref.where('active','==', true));
    return activeProducts.snapshotChanges();
  }

  setProduct(accountId: string, product: Product) {
    const docId = this.afs.createId();
    const newProductRef = this.afs.collection('customers').doc(accountId).collection('products').doc(docId);
    const batch = this.afs.firestore.batch();
    batch.set(newProductRef.ref, product);
    return batch.commit();
  }

  deleteProduct(accountId: string, productId: string) {
    const productRef = this.afs.collection('customers').doc(accountId).collection('products').doc(productId);
    const batch = this.afs.firestore.batch();
    batch.delete(productRef.ref);
    return batch.commit();
  }

  toggleProductActive(accountId: string, productId: string, active: boolean) {
    const productRef = this.afs.collection('customers').doc(accountId).collection('products').doc(productId);
    const lastUpdatedAt =  serverTimestamp(); //firebase.firestore.Timestamp.fromDate(new Date());
    const batch = this.afs.firestore.batch();
    batch.set(productRef.ref, { active: !active, lastUpdatedAt}, { merge: true});
    return batch.commit();
  }
}
