import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DriversService {

  constructor( private afs: AngularFirestore) { }

  getDriver(driverId: string) {
    const driver = this.afs.collection('drivers').doc(driverId);
    return driver.snapshotChanges();
  }

  getDrivers(vendorId: string) {
    const drivers = this.afs.collection('drivers', ref => ref.where('vendorId','==', vendorId));
    return drivers.snapshotChanges();
  }

  getAllDrivers() {
    const drivers = this.afs.collection('drivers');
    return drivers.snapshotChanges();
  }

  toggleActiveDriver(driverId: string, state: boolean) {
    const status = !state;
    console.log('status to set: ', status);
    console.log('current state: ', state);
    const driver = this.afs.collection('drivers').doc(driverId);
    return driver.update({ active: status});
  }

  deleteDriver(driverId: string) {
    const driver = this.afs.collection('drivers').doc(driverId);
    return driver.update({ deleted: true }); //TODO: Delete user from DB and remove user from Auth
  }

}
