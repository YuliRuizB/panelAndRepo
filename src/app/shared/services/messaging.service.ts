import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
//import * as firebase from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  messaging = getMessaging();
  currentMessage = new BehaviorSubject(null);

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth) { }

  private updateToken(token) {
    this.afAuth.authState.pipe(take(1)).subscribe();
  }
}
