import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, pipe } from 'rxjs';
import { IRoute } from 'src/app/shared/interfaces/route.type';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map } from 'rxjs/operators';
import { _ } from 'ag-grid-community';
import { RolService } from 'src/app/shared/services/roles.service';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-shared-vendor-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SharedVendorSettingsComponent implements OnInit, OnDestroy {

  @Input() vendorId: string = '';
  @Input() userCanUpdate: boolean = false;

  allRoutesSubscription: Subscription;
  allRoutesList: any[] = [];
  vendorRoutesSubscription: Subscription;
  vendorRoutesList: any[] = [];
  permissionsSubscription: Subscription;
  permissionsList: any = [];
  loading = true;
  time = new Date();
  isModalVisible: boolean = false;
  isConfirmLoading: boolean = false;
  selectedRoute: any = null;
  infoLoad: any = [];
  userlevelAccess:string;
 user: any;


  constructor(
    private routesService: RoutesService,
    public modalService: NzModalService,
    public message: NzMessageService,private rolService: RolService,
    public authService: AuthenticationService
  ) { 
    this.authService.user.subscribe((user) => {
      this.user = user;
      if (this.user.rolId != undefined) { // get rol assigned               
          this.rolService.getRol(this.user.rolId).valueChanges().subscribe(item => {
              this.infoLoad = item;
              this.userlevelAccess = this.infoLoad.optionAccessLavel;                 
          });
      }
  });
  }
  sendMessage(type: string, message: string): void {
    this.message.create(type, message);
}

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    if(this.allRoutesSubscription) {
      this.allRoutesSubscription.unsubscribe();
    }
    if(this.vendorRoutesSubscription) {
      this.vendorRoutesSubscription.unsubscribe();
    }
    if(this.permissionsSubscription) {
      this.permissionsSubscription.unsubscribe();
    }
  }

  toggleActive(data) {
    this.routesService.toggleActiveVendorRouteAccess(this.vendorId, data.permissionId, data);
  }

  deletePermission(data) {
    if (this.userlevelAccess == "1") {
      this.routesService.deleteVendorRouteAccess(this.vendorId, data.permissionId);
    } else {
      this.sendMessage('error', "El usuario no tiene permisos para borrar datos, favor de contactar al administrador.");
    }
  }

  getSubscriptions() {
    console.log("settings");
    this.allRoutesSubscription = this.routesService.getRoutesByCustomer().subscribe((routes: any[]) => {
      this.allRoutesList = routes;
    }, err =>  {
      console.log('algo pasó2: ', err);
      this.loading = false;
    })
    this.vendorRoutesSubscription = this.routesService.getAuthorizedRoutes(this.vendorId).subscribe((routes: any) => {
      console.log("settings33");
      console.log(routes.length);
      console.log("settings44");
      this.vendorRoutesList = !!routes && routes.length > 0 ? routes : [];
      console.log(this.vendorRoutesList);
      console.log("settings55");
      this.loading = false;
    }, err =>  {
      this.vendorRoutesList = [];
      console.log('algo pasó1: ', err);
      this.loading = false;
    });
    console.log("settingsfin");
  }

  showModal(): void {
    this.isModalVisible = true;
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    if(this.selectedRoute) {
    const dataArray = this.selectedRoute.split(',');
    const customerId = dataArray[0];
    const customerName = dataArray[1];
    const routeId = dataArray[2];
    const routeName = dataArray[3];
    const routePath = `customers/${customerId}/routes/${routeId}`;
    const record = {
      active: true,
      routeId,
      routeName,
      routePath,
      customerId,
      customerName
    };
    console.log("settings4");
    console.log(record);
    console.log("settings5");
    this.routesService.setAuthorizedRoutes(this.vendorId, record).then( () => {
      this.isModalVisible = false;
      this.isConfirmLoading = false;
    });
  }
    // setTimeout(() => {
    //   this.isModalVisible = false;
    //   this.isConfirmLoading = false;
    // }, 3000);
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

}
