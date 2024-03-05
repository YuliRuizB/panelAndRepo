import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { NzModalService, NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { IRoute } from 'src/app/shared/interfaces/route.type';
import { AccountsService } from 'src/app/shared/services/accounts.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { RolService } from 'src/app/shared/services/roles.service';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css']
})
export class RoutesComponent implements OnInit, OnDestroy {

  view: string = 'cardView';
  isVisible: boolean = false;
  isOkLoading: boolean = false;
  user: any;
  stopSubscription$: Subject<boolean> = new Subject();
  routesList: any = [];
  accountsList: any = [];
  objectForm: UntypedFormGroup;

  confirmModal: NzModalRef;
  duplicateVisible: boolean = false;
  duplicateCustomerId: string = '';
  isDuplicateLoading: boolean = false;
  selectedData: any = {};
  newCustomerName: any;
  infoLoad: any = [];
  userlevelAccess:string;

  constructor(
    private modalService: NzModalService,
    private routesService: RoutesService,
    private authService: AuthenticationService,
    private accountsService: AccountsService,
    private messageService: NzMessageService,
    private rolService: RolService,
    private fb: UntypedFormBuilder,
    private modal: NzModalService
  ) { }

  ngOnInit() {
    this.authService.user.subscribe(user => {
      this.getSubscriptions();
      this.user = user;
      if (this.user.rolId != undefined) { // get rol assigned               
        this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
            this.infoLoad = item;
            this.userlevelAccess = this.infoLoad.optionAccessLavel;                 
        });
    }
    });
    this.objectForm = this.fb.group({
      active: [false, [Validators.required]],
      description: ['', [Validators.required]],
      imageUrl: [''],
      kmzUrl: [''],
      name: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.required]],
      routeId: [''],
      customerId: ['', [Validators.required]],
      customerName: ['', [Validators.required]]
    });
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
}

  getSubscriptions() {
    this.routesService.getAllCustomersRoutes().pipe(
      takeUntil(this.stopSubscription$),
    ).subscribe((routes: IRoute[]) => {
      console.log(routes);
      this.routesList = routes;
    });
    this.accountsService.getAccounts().pipe(
      takeUntil(this.stopSubscription$),
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id, ...data }
      }))
    ).subscribe((accounts) => {
      this.accountsList = accounts;
    });
  }

  setCustomerName(event) {

    const recordArray = _.filter(this.accountsList, r => {
      return r.id == event;
    });
    const record = recordArray[0];
    this.objectForm.controls['customerName'].setValue(record.name);
  }

  toggleActive(data) {
    console.log(data);
    this.routesService.toggleActiveRoute(data.customerId, data.routeId, data).then(() => {
      console.log('done');
    })
      .catch(err => console.log(err));
  }

  deleteRoute(data) {
    if (this.userlevelAccess == "1") {
      this.routesService.deleteRoute(data.customerId, data.routeId).then(() => {
        console.log('done');
      })
        .catch(err => console.log(err));
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
    }   
  }

  duplicate(data) {
    this.duplicateVisible = true;
    this.selectedData = data;
    this.isDuplicateLoading = false;
  }

  onCustomerChange(event) {
    if(event) {
      const recordArray = _.filter(this.accountsList, s => {
        return s.id == event;
      });
      const record = recordArray[0];
      //.log(record);
      this.selectedData.newCustomerName = record.name;
      this.newCustomerName = record.name;
    }
  }

  createDuplicated() {
    this.selectedData.newCustomerId = this.duplicateCustomerId;
    //console.log(this.selectedData);
    this.isDuplicateLoading = true;
    if (this.userlevelAccess != "3") {
      this.routesService.duplicateRouteWithStops(this.selectedData).then( () => {
        this.isDuplicateLoading = false;
        this.duplicateVisible = false;
      });
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para actualizar datos, favor de contactar al administrador.");
    }   
  }

  handleCancel() {
    this.duplicateVisible = false;
    this.isDuplicateLoading = false;
  }


  addNewRoute(newProjectContent: TemplateRef<{}>) {
    const modal = this.modalService.create({
      nzTitle: 'Nueva Ruta',
      nzContent: newProjectContent,
      nzFooter: [
        {
          label: 'Crear Ruta',
          type: 'primary',
          onClick: () => this.modalService.confirm({
            nzTitle: 'Está la información completa?',
            nzOnOk: () => {
              console.log(this.objectForm.value);
              console.log(this.objectForm.valid);
              if (this.objectForm.valid) {
                console.log(this.objectForm.value);
                if (this.userlevelAccess != "3") {
                  this.routesService.setRoute(this.objectForm.controls['customerId'].value, this.objectForm.value)
                  .then(() => {
                    this.modalService.closeAll();
                  });
                } else {
                  this.sendMessage('error', "El usuario no tiene permisos para agregar datos, favor de contactar al administrador.");
                }
                
              }
            }
          }
          )
        },
      ],
      nzWidth: 500
    })
  }

}
