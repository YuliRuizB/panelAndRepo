import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class SummarizeService {

  constructor(private afs: AngularFirestore) { }

  getSummarized() {
    const summarized = this.afs.collection('summarized');
    return summarized.valueChanges();
  }

  setAccounts() {
    
  }
}
