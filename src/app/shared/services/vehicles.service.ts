import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NzMessageService } from 'ng-zorro-antd/message';
@Injectable({
  providedIn: 'root'
})
export class VehiclesService {

  constructor(private afs: AngularFirestore, private message: NzMessageService) { }

  getVendorVehicles(vendorId: string) {
    const vehicles = this.afs.collection('vendors').doc(vendorId).collection('fleet');
    return vehicles.snapshotChanges();
  }

  getVehicle(vendorId: string, vehicleId: string) {
    const vehicle = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(vehicleId);
    return vehicle.snapshotChanges();
  }

  addVehicle(vendorId: string, vehicle: any) {
    const vehiclesRef = this.afs.collection('vendors').doc(vendorId).collection('fleet');
    return vehiclesRef.add(vehicle);
  }

  deleteVehicle(vendorId: string, vehicleId: string) {
    const vehicleRef = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(vehicleId);
    return vehicleRef.delete();
  }

  updateVehicle(vendorId: string, vehicleId: string, vehicle:any) {
    const vehiclesRef = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(vehicleId);
    return vehiclesRef.update(vehicle);
  }

  updateVehicleAvatar(vendorId: string, vehicleId: string, avatar: string) {
    this.message.loading('Actualizando ...');
    const vehicleRef = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(vehicleId);
    vehicleRef.update({avatar}).then( () => {
      this.message.remove();
      this.message.success('Todo listo');
    }).catch( (err) => {
      this.message.remove();
      this.message.error('Hubo un error: ', err);
      console.log(err)
    })
  }

  toggleActive(vendorId: string, vehicleId: string, active: boolean) {
    const vehicleRef = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(vehicleId);
    return vehicleRef.update({ active: !active})
  }

  toggleDisabled(vendorId: string, vehicleId: string, disabled: boolean) {
    const vehicleRef = this.afs.collection('vendors').doc(vendorId).collection('fleet').doc(vehicleId);
    return vehicleRef.update({ disabled: !disabled})
  }
}
