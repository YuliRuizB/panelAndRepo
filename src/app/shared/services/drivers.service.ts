import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class DriversService {

  constructor( 
    private afs: AngularFirestore,
    private aff: AngularFireFunctions
    ) { }

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

  updateDriver(driverId: string, driver: any) {
    const driverRef = this.afs.collection('drivers').doc(driverId);
    return driverRef.update({ ...driver});
  }
  
  resetPassword(uid:string, password:string){
    const data = {uid, password}
    const driverResetPassword = this.aff.httpsCallable('onDriverResetPassword');
    return driverResetPassword(data).toPromise().then((respone:any) => {
      console.log(respone);
    });
  }

  toggleActiveDriver(driverId: string, state: boolean) {
    const status = !state;
    console.log('status to set: ', status);
    console.log('current state: ', state);
    const driver = this.afs.collection('drivers').doc(driverId);
    return driver.update({ active: status});
  }

  deleteDriver(driverId: string) {
    const driverRef = this.afs.collection('drivers').doc(driverId);
    return driverRef.delete();
  }

  async createDriver(driver: any): Promise<any> {
    console.log(driver);
    const createNewDriver = this.aff.httpsCallable('createDriver');
    return createNewDriver(driver).toPromise().then((response:any) => {
      console.log(response);
    });
  }

}
