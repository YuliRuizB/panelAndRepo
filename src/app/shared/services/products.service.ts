import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Product } from '../interfaces/product.type';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  db = firebase.firestore();

  constructor(private afs: AngularFirestore) { }

  getActiveProducts(accountId: string) {
    const activeProducts = this.afs.collection('customers').doc(accountId).collection('products', ref => ref.where('active','==', true));
    return activeProducts.snapshotChanges();
  }

  setProduct(accountId: string, product: Product) {
    const docId = this.afs.createId();
    const newProductRef = this.db.collection('customers').doc(accountId).collection('products').doc(docId);
    const batch = this.db.batch();
    batch.set(newProductRef, product);
    return batch.commit();
  }

  deleteProduct(accountId: string, productId: string) {
    const productRef = this.db.collection('customers').doc(accountId).collection('products').doc(productId);
    const batch = this.db.batch();
    batch.delete(productRef);
    return batch.commit();
  }

  toggleProductActive(accountId: string, productId: string, active: boolean) {
    const productRef = this.db.collection('customers').doc(accountId).collection('products').doc(productId);
    const lastUpdatedAt = firebase.firestore.Timestamp.fromDate(new Date());
    const batch = this.db.batch();
    batch.set(productRef, { active: !active, lastUpdatedAt}, { merge: true});
    return batch.commit();
  }
}
