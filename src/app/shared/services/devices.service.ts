import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  constructor(private afs: AngularFirestore) { }

  getDevices(vendorId: string) {
    const devices = this.afs.collection('vendors').doc(vendorId).collection('fleet');
    return devices.snapshotChanges();
  }

  addDevice(vendorId: string, device: any) {
    const devicesRef = this.afs.collection('vendors').doc(vendorId).collection('fleet');
    return devicesRef.add(device);
  }

  deleteDevice(vendorId: string, deviceId: string) {
    const deviceRef = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(deviceId);
    return deviceRef.delete();
  }
}
