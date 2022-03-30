import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NzMessageService } from 'ng-zorro-antd';
import { IVendor } from '../interfaces/vendor.type';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  constructor(private afs: AngularFirestore, private message: NzMessageService) { }

  getVendors() {
    const vendors = this.afs.collection('vendors');
    return vendors.snapshotChanges();
  }

  getVendor(vendorId: string) {
    const vendors = this.afs.collection('vendors').doc(vendorId);
    return vendors.snapshotChanges();
  }

  getVendorRoutesAccess(vendorId: string) {
    const vendorRoutes = this.afs.collection('vendors').doc(vendorId).collection('routesAccess');
    return vendorRoutes.snapshotChanges();
  }

  createVendor(vendor: any) {
    this.message.loading('Guardando ...');
    const newVendorRef = this.afs.collection('vendors');
    newVendorRef.add(vendor).then( () => {
      this.message.remove();
      this.message.success('Todo listo');
    }).catch( (err) => {
      this.message.remove();
      this.message.error('Hubo un error: ', err);
      console.log(err)
    })
  }

  updateVendor(vendorId: string, update: IVendor) {
    this.message.loading('Actualizando ...');
    const vendorRef = this.afs.collection('vendors').doc(vendorId);
    vendorRef.update(update).then( () => {
      this.message.remove();
      this.message.success('Todo listo');
    }).catch( (err) => {
      this.message.remove();
      this.message.error('Hubo un error: ', err);
      console.log(err)
    })
  }

  updateVendorAvatar(vendorId: string, avatar: string) {
    this.message.loading('Actualizando ...');
    const vendorRef = this.afs.collection('vendors').doc(vendorId);
    vendorRef.update({avatar}).then( () => {
      this.message.remove();
      this.message.success('Todo listo');
    }).catch( (err) => {
      this.message.remove();
      this.message.error('Hubo un error: ', err);
      console.log(err)
    })
  }

  deleteVendor(vendorId: string) {
    this.message.loading('Eliminando ...');
    const newVendorRef = this.afs.collection('vendors').doc(vendorId);
    newVendorRef.delete().then( () => {
      this.message.remove();
      this.message.success('Todo listo');
    }).catch( (err) => {
      this.message.remove();
      this.message.error('Hubo un error: ', err);
      console.log(err)
    })
  }
}
