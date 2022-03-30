import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { endOfDay, startOfDay, startOfToday, addDays } from 'date-fns';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LiveService {

  constructor(private afs: AngularFirestore) { }

  getLiveProgram() {
    const today = startOfToday();
    const liveProgram = this.afs.collectionGroup('live', ref => ref.where('startAt','>=',today).orderBy('startAt','desc'));
    return liveProgram.snapshotChanges().pipe(
      map(actions => actions.map( a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    )
  }
}
