import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, doc, setDoc, DocumentData } from 'firebase/firestore';

//import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {

  constructor(private afs: AngularFirestore) { }

  getAssignment(vendorId: string, assignmentId: string) {
    const assignment = this.afs.collection('vendors').doc(vendorId).collection('assignments').doc(assignmentId);
    return assignment.snapshotChanges();
  }

  getAssignments(vendorId: string) {
    const assignments = this.afs.collection('vendors').doc(vendorId).collection('assignments');
    return assignments.snapshotChanges();
  }

  getActiveAssignments(vendorId: string) {
    const assignments = this.afs.collection('vendors').doc(vendorId).collection('assignments', ref => ref.where('active','==',true));
    return assignments.snapshotChanges();
  }

  getActiveAssignmentsRoute(vendorId: string, routeId: string) {
    const assignments = this.afs.collectionGroup('assignments', ref => 
    ref.where('routeId','==', routeId)
      .where('active','==',true)
    );
    return assignments.snapshotChanges();
  }

  createAssigment(vendorId: string, assignment: any) {
    const assignmentsRef = this.afs.collection('vendors').doc(vendorId).collection('assignments');
    return assignmentsRef.add(assignment);
  }

  updateAssignment(vendorId: string, assignmentId: string, assignment: any) {
    const assignmentRef = this.afs.collection('vendors').doc(vendorId).collection('assignments').doc(assignmentId);
    return assignmentRef.update(assignment);
  }

  deleteAssignment(vendorId: string, assignmentId: string, assignment: any) {
    const assignmentRef = this.afs.collection('vendors').doc(vendorId).collection('assignments').doc(assignmentId);
    return assignmentRef.delete();
  }

  batchCreateAssignment(batchAssignments: Array<any>) {
    const batch = this.afs.firestore.batch();
    batchAssignments.forEach( (assignment: any) => {
      batch.set(assignment, {merge: true});
    });
    return batch.commit();
  }
}
