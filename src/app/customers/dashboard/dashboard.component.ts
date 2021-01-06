import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as _ from 'lodash';
import { CustomersService } from 'src/app/customers/services/customers.service';
import { NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';
import { ProductsService } from 'src/app/shared/services/products.service';
import { IBoardingPass } from '../classes/customers';
import * as firebase from 'firebase/app';

export const months = {
  0: 'Enero',
  1: 'Febrero',
  2: 'Marzo',
  3: 'Abril',
  4: 'Mayo',
  5: 'Junio',
  6: 'Julio',
  7: 'Agosto',
  8: 'Septiembre',
  9: 'Octubre',
  10: 'Noviembre',
  11: 'Diciembre'
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild('searchBar', { static: false }) searchbar;

  search: any;

  usersCollection: AngularFirestoreCollection<any>;
  users: any;
  hasBeenFiltered = false;
  displayData;
  devicesList: any;
  loadedDevicesList: Array<any> = [];


  // modal Bulk create boardingPasses
  current = 0;
  isDone: boolean = false;
  isCreatingBoardingPasses: boolean = false;
  
  //Modal Bulk table
  listOfSelection = [
    {
      text: 'Seleccionar todas las páginas',
      onSelect: () => {
        this.checkAllData(true); 
      }
    },
    {
      text: 'Deseleccionar todas las páginas',
      onSelect: () => {
        this.checkAllData(false); 
        this.refreshStatus();
      }
    }
  ];
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};


  isContentOpen = false;
  isUserSelected = false;
  isLoadingUsers = false;
  currentUserSelected;
  currentSelectedCustomerId;
  loadingLastPurchase = false;
  lastPurchase: IBoardingPass;
  isBoardingPassSelected = false;
  isLoadingPayments = false;
  payments;
  hasBeenLoaded = false;
  latestBoardingPassesCollection: AngularFirestoreCollection<any>;
  latestBoardingPasses;
  loadingLatestBoardingPasses: boolean;

  latestUserPurchasesCollection: AngularFirestoreCollection<any>;
  latestPurchases;
  loadingLatestPurchases = false;

  isVisible = false;
  isProductVisible = false;
  isConfirmLoading = false;

  validateForm: FormGroup;
  checked = false;
  routes: any = [];
  products: any = [];
  stopPoints: any = [];

  routesSubscription: Subscription;
  productsSubscription: Subscription;
  stopPointsSubscription: Subscription;

  accountId$ = new Subject<string>();
  routeId$ = new Subject<string>();

  canUpdatePayment = false;
  canUpdateValidTo = false;

  elementType = 'url';

  customersList: any[] = [];
  stopSubscription$: Subject<any> = new Subject();

  isVisibleBulk: boolean = false;
  isLoadingBulk: boolean = false;
  isConfirmLoadingBulk: boolean = false;

  formatterPercent = (value: number) => `${value} %`;
  parserPercent = (value: string) => value.replace(' %', '');
  formatterDollar = (value: number) => `$ ${value}`;
  parserDollar = (value: string) => value.replace('$ ', '');
  actualSelectedRows: number;

  constructor(
    private afs: AngularFirestore,
    private customersService: CustomersService,
    public modalService: NzModalService,
    private productsService: ProductsService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    const routesObservable = this.accountId$.pipe(
      switchMap(accountId => this.afs.collection('customers').doc(accountId).collection('routes', ref => ref.where('active', '==', true)).valueChanges({ idField: 'routeId' })
    ));

    // subscribe to changes
    routesObservable.subscribe((routes:any) => {
      this.routes = routes;
    });

    const productsObservable = this.accountId$.pipe(
      switchMap(accountId => this.afs.collection('customers').doc(accountId).collection('products', ref => ref.where('active', '==', true)).valueChanges({ idField: 'productId' })
    ));

    const stopPointsObservable = this.routeId$.pipe(
      switchMap(routeId => this.afs.collection('customers').doc(this.currentSelectedCustomerId).collection('routes').doc(routeId).collection('stops', ref => ref.orderBy('order','asc').where('active', '==', true)).valueChanges({ idField: 'stopPointId' })
    ));

    // subscribe to changes
    productsObservable.subscribe((products:any) => {
      this.products = products;
    });

    stopPointsObservable.subscribe( (stopPoints:any) => {
      this.stopPoints = stopPoints;
    });

    this.getUsersList();
    this.getCustomersList();

    this.validateForm = this.fb.group({
      active: [true,[Validators.required]],
      amount: [0,[Validators.required]],
      authorization: [''],
      category: ['',[Validators.required]],
      conciliated: [false,[Validators.required]],
      creation_date: [new Date().toISOString(),[Validators.required]],
      currency: ['MXN',[Validators.required]],
      customer_id: ['',[Validators.required]],
      date_created: [new Date(),[Validators.required]],
      due_date: [new Date(),[Validators.required]],
      description: ['',[Validators.required]],
      error_message: [''],
      fee: this.fb.group({
        amount: [0],
        currency: ['MXN'],
        tax: [0]
      }),
      is_courtesy: [false],
      method: ['cash',[Validators.required]],
      name: ['',[Validators.required]],
      operation_date: [new Date().toISOString(),[Validators.required]],
      operation_type: ['in',[Validators.required]],
      order_id: [''],
      payment_method: this.fb.group({
        barcode_url: [''],
        reference: [''],
        type: ['cash']
      }),
      price: [0,[Validators.required]],
      product_description: ['',[Validators.required]],
      product_id: ['',[Validators.required]],
      round: ['',[Validators.required]],
      routeId: ['',[Validators.required]],
      routeName: ['',[Validators.required]],
      status: ['completed',[Validators.required]],
      stopDescription: ['',[Validators.required]],
      stopId: ['',[Validators.required]],
      stopName: ['',[Validators.required]],
      transaction_type: ['charge',[Validators.required]],
      validFrom: [new Date(),[Validators.required]],
      validTo: [new Date(),[Validators.required]],
      isTaskIn: [false, [Validators.required]],
      isTaskOut: [false, [Validators.required]],
      isOpenpay: [false, [Validators.required]],
      paidApp: ['web', [Validators.required]],
      realValidTo: []
    });

    for (let i = 0; i < 100; i++) {
      this.listOfAllData.push({
        id: i,
        name: `Edward King ${i}`,
        age: 32,
        address: `London, Park Lane no. ${i}`
      });
    }
  }

  ngOnDestroy() {
    this.hasBeenLoaded = false;
    this.loadedDevicesList = [];
    if (this.users) {
      this.users.unsubscribe();
    }
    if(this.routesSubscription) {
      this.routesSubscription.unsubscribe();
    }
    if(this.productsSubscription) {
    this.productsSubscription.unsubscribe();
    }
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  showModal(): void {
    this.isVisible = true;
  }

  showModalProduct(): void {
    this.isProductVisible = true;
  }

  onBulkBoardingPassSelected(customerId) {
    this.accountId$.next(customerId);
    this.currentSelectedCustomerId = customerId;
    this.isVisibleBulk = true;
  }

  onProductSelected(event, products) {
    const recordArray = _.filter(products, p => {
      return p.productId == event;
    });
    const record = recordArray[0];
    this.validateForm.controls['name'].setValue(record.name);
    this.validateForm.controls['description'].setValue(record.description);
    this.validateForm.controls['product_description'].setValue(record.description);
    this.validateForm.controls['amount'].setValue(record.price);
    this.validateForm.controls['is_courtesy'].setValue(false);
    this.validateForm.controls['price'].setValue(record.price);
    this.validateForm.controls['category'].setValue(record.category);
    this.validateForm.controls['validFrom'].setValue(record.validFrom.toDate());
    this.validateForm.controls['validTo'].setValue(record.validTo.toDate());
    this.validateForm.controls['realValidTo'].setValue((record.validTo.toDate()).toISOString());
    console.log(record.validTo, (record.validTo.toDate()).toISOString());
    this.validateForm.controls['isTaskIn'].setValue(record.isTaskIn);
    this.validateForm.controls['isTaskOut'].setValue(record.isTaskOut);
  }

  onRouteSelected(event, routes) {
    console.log('onRouteSelected');
    this.routeId$.next(event);
    const recordArray = _.filter(routes, r => {
      return r.routeId == event;
    });
    const record = recordArray[0];
    console.log('record found is: ', record);
    this.validateForm.controls['routeName'].setValue(record.name);
  }

  onStopPointSelected(event, stoppoints) {
    console.log('on stop point selected was clicked');
    const recordArray = _.filter(stoppoints, s => {
      return s.stopPointId == event;
    });
    const record = recordArray[0];
    this.validateForm.controls['stopName'].setValue(record.name);
    this.validateForm.controls['stopDescription'].setValue(record.description);
  }

  onCourtesyChange(isCourtesy: boolean) {
    if(isCourtesy) {
      this.validateForm.controls['amount'].setValue(0);
    }
  }

  onAmountChange(amount: number) {
    if(amount > 0) {
      this.validateForm.controls['is_courtesy'].setValue(false);
    }
  }

  onCanUpdatePayment() {
    this.canUpdatePayment = true;
  }

  onPaymentUpdated(event) {
    console.log(event);
    if(+this.lastPurchase.price === event) {
      console.log('full price has been reached');
      this.lastPurchase.status = 'completed';
      this.lastPurchase.amount = event;
      this.lastPurchase.active = true;
      this.lastPurchase.validTo = firebase.firestore.Timestamp.fromDate(new Date(this.lastPurchase.realValidTo));
    } else {
      this.lastPurchase.amount = event;
    }
    this.customersService.updateBoardingPassToUserPurchaseCollection(this.currentUserSelected.uid, this.lastPurchase)
      .then( (success) => {
        this.isVisible = false;
        this.isConfirmLoading = false;
      }).catch ( (err) => { this.isConfirmLoading = false; });
    this.canUpdatePayment = false;
  }

  onCanUpdateValidTo() {
    this.canUpdateValidTo = true;
  }

  onValidToUpdated(event) {
    console.log(event);
    
    console.log(this.lastPurchase);
    this.canUpdateValidTo = false;
  }

  submitForm(): void {
    this.validateForm.controls['customer_id'].setValue(this.currentUserSelected.customerId);
    const amount = this.validateForm.controls['amount'].value;
    const price = this.validateForm.controls['price'].value;
    const validTo = this.validateForm.controls['validTo'].value;
    const isCourtesy = this.validateForm.controls['is_courtesy'].value || false;
    this.validateForm.controls['due_date'].setValue(validTo.toISOString());
    if(amount != price && !isCourtesy) {
      this.validateForm.controls['status'].setValue('partial');
    }
    console.log(this.validateForm.valid);
    console.log(this.validateForm.value);
    // this.validateForm.controls['product_description'].setValue(`Pase de abordar ${this.products.name} turno de ${}`);
    // this.validateForm.controls['customer'].setValue(this.currentUserSelected.customerName);
    
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log(this.validateForm.value);

    if (this.validateForm.valid) {
      this.isConfirmLoading = true;
      // const fileName = this.validateForm.get('route').value;
      // const normalized = (fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')).toLowerCase();
      // const routeImageFile = 'ruta-' + normalized.split(' ').join('-') + '.jpg';
      // const status = this.validateForm.get('paymentAmount').value >= 1299 ? 'Pagado' : 'Pagado Parcial';
      // const paid = this.validateForm.get('paymentAmount').value >= 1299 ? true : false;
      // const addedMonthName = months[this.validateForm.get('month').value] + ' ' + '2019';

      // const purchase = {
      //   active: this.validateForm.get('active').value,
      //   amount: 1299,
      //   amountPaid: this.validateForm.get('paymentAmount').value,
      //   description: `Pases de abordar para el mes de ${addedMonthName}`,
      //   dop: new Date(),
      //   validDate: new Date().setFullYear(new Date().getFullYear(), 8),
      //   month: this.validateForm.get('month').value,
      //   monthName: addedMonthName,
      //   round: this.validateForm.get('round').value,
      //   route: this.validateForm.get('route').value,
      //   routeImage: routeImageFile,
      //   status: status,
      //   paid: paid,
      //   studentId: this.currentUserSelected.studentId,
      //   uid: this.currentUserSelected.uid,
      //   valid: true,
      //   year: 2019
      // };

      this.customersService.saveBoardingPassToUserPurchaseCollection(this.currentUserSelected.uid, this.validateForm.value)
      .then( (success) => {
        this.isVisible = false;
        this.isConfirmLoading = false;
      }).catch ( (err) => { this.isConfirmLoading = false; });
    }
  }

  submitFormProduct(): void {
    this.validateForm.controls['customer_id'].setValue(this.currentUserSelected.customerId);
    const amount = this.validateForm.controls['amount'].value;
    const price = this.validateForm.controls['price'].value;
    const validTo = this.validateForm.controls['validTo'].value;
    const isCourtesy = this.validateForm.controls['is_courtesy'].value || false;
    this.validateForm.controls['due_date'].setValue(validTo.toISOString());
    if(amount != price && !isCourtesy) {
      this.validateForm.controls['status'].setValue('partial');
    }
    console.log(this.validateForm.valid);
    console.log(this.validateForm.value);
    
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log(this.validateForm.value);

    if (this.validateForm.valid) {
      this.isConfirmLoading = true;

      this.customersService.saveBoardingPassToUserPurchaseCollection(this.currentUserSelected.uid, this.validateForm.value)
      .then( (success) => {
        this.isVisible = false;
        this.isConfirmLoading = false;
      }).catch ( (err) => { this.isConfirmLoading = false; });
    }
  }

  handleOk(): void {
    this.isConfirmLoading = true;

    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 3000);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isVisibleBulk = false;
  }

  handleCancelProduct(): void {
    this.isProductVisible = false;
  }

  getUsersList() {
    this.isLoadingUsers = true;
    this.usersCollection = this.afs.collection<any>('users', ref => ref.orderBy('displayName'));
    this.users = this.usersCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe(users => {
      this.loadUsers(users);
    });
  }

  getCustomersList() {
    const customersCollection = this.afs.collection('customers', ref => ref.orderBy('name'));
    customersCollection.snapshotChanges().pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      })),
      tap(customers => {
        this.customersList = customers;
        return customers;
      })
    ).subscribe();
  }

  reassingBoardingPass(id, set) {
    console.log('id: ', id);
    console.log(this.currentUserSelected)
    console.log(this.lastPurchase)
    const boardingPassRef = this.afs.collection('users').doc(this.currentUserSelected.id).collection('boardingPasses').doc(this.lastPurchase.id);
    boardingPassRef.set(this.lastPurchase).then( (response) => {
      const oldBoardingPassRef = this.afs.collection('users').doc(this.currentUserSelected.uid).collection('boardingPasses').doc(this.lastPurchase.id);
      oldBoardingPassRef.delete();
    });
  }

  refreshList() {
    this.hasBeenLoaded = false;
    this.getUsersList();
  }

  loadUsers(users) {
    if (this.loadedDevicesList.length <= 1) {
      this.displayData = users;
      this.devicesList = _.orderBy(JSON.parse(JSON.stringify(users)), ['displayName'], ['asc']);
      this.loadedDevicesList = this.devicesList;
    }
  }

  getItems(searchbar) {
    this.initializeItems();
    const q = searchbar;
    if (!q) { return; }
    const text = _.toLower(q);
    this.devicesList = _.filter(this.devicesList, function (object) {
      return _(object).some(function (string) {
        return _(string).toLower().includes(text);
      });
    });
  }

  initializeItems() {
    this.devicesList = this.loadedDevicesList;
  }

  userSelected(data) {
    this.currentUserSelected = data;
    this.currentSelectedCustomerId = this.currentUserSelected.customerId;
    console.log(data);
    this.accountId$.next(this.currentUserSelected.customerId);
    this.isUserSelected = true;
    this.isBoardingPassSelected = false;
    this.getLatestPurchases(data.uid);
    this.lastPurchase = null;
    
  }

  boardingPassSelected(purchase) {
    if (this.currentUserSelected) {
      this.isBoardingPassSelected = true;
      this.lastPurchase = purchase;
      console.log(this.lastPurchase);
    }
  }

  copyDataToUserCollection() {
    this.customersService.saveOldBoardingPassToUserCollection(this.currentUserSelected.paymentId);
  }

  showDeleteConfirm(): void {
    this.modalService.confirm({
      nzTitle: '¿Está seguro de eliminar esta cuenta?',
      nzContent: '<b style="color: red;">Toda la información relacionada a esta cuenta será eliminada permanentemente.</b>',
      nzOkText: 'Eliminar',
      nzOkType: 'danger',
      nzOnOk: () => {
        this.customersService.deleteUser(this.currentUserSelected.uid);
        this.currentUserSelected = null;
        this.isUserSelected = false;
      },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  getLastPurchase(purchaseId) {
    this.loadingLastPurchase = true;
    this.lastPurchase = null;
    this.customersService.getLastPurchase(purchaseId).valueChanges().subscribe( purchase => {
      this.lastPurchase = purchase;
      this.loadingLastPurchase = false;
    }, err => {
      this.loadingLastPurchase = false;
      this.lastPurchase = null;
    });
  }

  activatePurchase(purchaseId, paid) {
    console.log(this.currentUserSelected.uid, purchaseId, paid);
    this.customersService.activatePurchase(this.currentUserSelected.uid, purchaseId, paid);
    this.currentUserSelected.paymentId = purchaseId;
  }

  deletePurchase(purchaseId) {
    console.log(this.currentUserSelected.uid, purchaseId);
    this.customersService.deletePurchase(this.currentUserSelected.uid, purchaseId);
    this.isBoardingPassSelected = false;
  }

  setUserDisabled(disabled) {
    this.customersService.setUserDisabled(this.currentUserSelected.uid, disabled);
    this.currentUserSelected.disabled = disabled;
  }

  getLatestPurchases(userId) {
    this.loadingLatestPurchases = true;
    this.customersService.getLatestUserPurchases(userId, 10).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as IBoardingPass;
        return { id, ...data };
      }))
    )
    .subscribe( latestPurchases => {
      console.log(latestPurchases);
      this.latestPurchases = latestPurchases;
      this.loadingLatestPurchases = false;
    }, err => {
      this.latestPurchases = null;
      this.loadingLatestPurchases = false;
    });
  }

  //Wizard
  pre(): void {
    this.current -= 1;
  }

  next(): void {
    this.current += 1;
    console.log(Object.keys(this.mapOfCheckedId).length);
    this.actualSelectedRows = Object.keys(this.mapOfCheckedId).length;
  }

  done(): void {
    this.isVisibleBulk = false;
    setTimeout(() => {
      this.current = 0;
    this.isDone = true;
    }, 500);
  }

  createMultipleBoardingPasses() {
    this.isCreatingBoardingPasses = true;
    setTimeout(() => {
      this.isCreatingBoardingPasses = false;
      this.isDone = true;
    }, 2000);
  }

  currentPageDataChange($event:[]): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.devicesList.every(item => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.devicesList.some(item => this.mapOfCheckedId[item.id]) && !this.devicesList;
  }

  checkAllData(value: boolean): void {
    this.devicesList.forEach(item => (this.mapOfCheckedId[item.id] = value));
  }


}