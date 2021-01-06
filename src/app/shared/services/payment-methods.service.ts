import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

export const paymentMethods = [
  {
    name: 'Tienda de conveniencia',
    description: 'Pago en tienda de conveniencia',
    icon: 'pricetag',
    method: 'store',
    userNavigation: 'reference/list',
    active: false
  },
  {
    name: 'Tarjeta de crédito/débito',
    description: 'Pago en línea con tarjeta',
    icon: 'card',
    method: 'card',
    userNavigation: 'card/purchase',
    active: false
  }
]

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  constructor(
    private afs: AngularFirestore
  ) { }

  getAccountPaymentMethods(accountId: string) {
    const paymentMethods = this.afs.collection('customers').doc(accountId).collection('paymentMethods');
    return paymentMethods.snapshotChanges();
  }

  getPaymentMethods() {
    return of(paymentMethods);
  }

  createDefaultPaymentMethods(accountId: string) {
    return paymentMethods.forEach(paymentMethod => {
    this.setAccountPaymentMethod(accountId, paymentMethod);   
    });
  }

  setAccountPaymentMethod(accountId: string, paymentMethod: any) {
    const paymentMethodsRef = this.afs.collection('customers').doc(accountId).collection('paymentMethods');
    return paymentMethodsRef.add(paymentMethod);
  }

  toggleActiveAccountPaymentMethod(accountId: string, paymentMethodId: string, active: boolean) {
    const paymentMethod = this.afs.collection('customers').doc(accountId).collection('paymentMethods').doc(paymentMethodId);
    return paymentMethod.update({
      active: active
    });
  }

  deleteAccountPaymentMethod(accountId: string, paymentMethodId: string) {
    const paymentMethod = this.afs.collection('customers').doc(accountId).collection('paymentMethods').doc(paymentMethodId);
    return paymentMethod.delete();
  }
}
