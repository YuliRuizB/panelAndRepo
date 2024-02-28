import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  db = firebase.firestore();

  constructor(private afs: AngularFirestore) { }

  getAccounts() {
    const accounts = this.afs.collection('customers', ref => 
    ref.orderBy('active', 'desc').orderBy('name', 'desc')
  );
  return accounts.snapshotChanges();
  
  }

  getAccount(accountId: string) {
    const account = this.afs.collection('customers').doc(accountId);
    return account.snapshotChanges();
  }

  updateAccount(accountId: string, updatedAccount: any) {
    const account = this.afs.collection('customers').doc(accountId);
    return account.update(updatedAccount);
  }

  setAccount(account: any) {
    const docId = this.afs.createId();
    const increment = firebase.firestore.FieldValue.increment(1);
    const last_updated = new firebase.firestore.Timestamp(new Date().getTime() / 1000, 0);
    const newAccountRef = this.db.collection('customers').doc(docId);
    const newPublicAccountRef = this.db.collection('pCustomers').doc(docId);
    const stats = this.db.collection('summarized').doc('ZcVXcD1p4O7mYjwBIiLv');
    const batch = this.db.batch();
    batch.set(newAccountRef, account);
    batch.set(newPublicAccountRef, { name: account.name, active: false });
    batch.set(stats, { currentAccounts: increment, last_updated }, {merge: true});
    return batch.commit();
  }

  deleteAccount(accountId: string ) {
    const docId = accountId;
    const decrement = firebase.firestore.FieldValue.increment(-1);
    const last_updated = new firebase.firestore.Timestamp(new Date().getTime() / 1000, 0);
    const accountRef = this.db.collection('customers').doc(docId);
    const publicAccountRef = this.db.collection('pCustomers').doc(docId);
    const stats = this.db.collection('summarized').doc('ZcVXcD1p4O7mYjwBIiLv');
    const batch = this.db.batch();
    batch.delete(accountRef);
    batch.delete(publicAccountRef);
    batch.set(stats, { currentAccounts: decrement, last_updated }, {merge: true});
    return batch.commit();
  }

  toggleAccountActive(accountId: string, active: boolean) {
    const docId = accountId;
    const accountRef = this.db.collection('customers').doc(docId);
    const publicAccountRef = this.db.collection('pCustomers').doc(docId);
    const batch = this.db.batch();
    batch.set(accountRef, { active: !active}, { merge: true});
    batch.set(publicAccountRef, { active: !active}, { merge: true});
    return batch.commit();
  }
}
