import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { increment, serverTimestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  //db = firebase.firestore();

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
    const last_updated = serverTimestamp();
    const newAccountRef = this.afs.collection('customers').doc(docId);
    const newPublicAccountRef = this.afs.collection('pCustomers').doc(docId);
    const stats = this.afs.collection('summarized').doc('ZcVXcD1p4O7mYjwBIiLv');
    const batch = this.afs.firestore.batch();
    
    batch.set(newAccountRef.ref, account);
    batch.set(newPublicAccountRef.ref, { name: account.name, active: false });
    batch.set(stats.ref, { currentAccounts: increment(1), last_updated }, {merge: true});

    return batch.commit();
  }

  deleteAccount(accountId: string ) {
    const docId = accountId;
   
    const last_updated = serverTimestamp();
    const accountRef = this.afs.collection('customers').doc(docId);
    const publicAccountRef = this.afs.collection('pCustomers').doc(docId);
    const stats = this.afs.collection('summarized').doc('ZcVXcD1p4O7mYjwBIiLv');
    const batch = this.afs.firestore.batch(); 
    batch.delete(accountRef.ref);
    batch.delete(publicAccountRef.ref);
    batch.set(stats.ref, { currentAccounts: decrement(1), last_updated }, {merge: true});
    return batch.commit();
  }

  toggleAccountActive(accountId: string, active: boolean) {
    const docId = accountId;
    const accountRef = this.afs.collection('customers').doc(docId);
    const publicAccountRef = this.afs.collection('pCustomers').doc(docId);
    const batch = this.afs.firestore.batch();
    batch.set(accountRef.ref, { active: !active}, { merge: true});
    batch.set(publicAccountRef.ref, { active: !active}, { merge: true});
    return batch.commit();
  }
}
function decrement(arg0: number) {
  throw new Error('Function not implemented.');
}

