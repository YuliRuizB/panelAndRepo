import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, pipe } from 'rxjs';
import { IRoute } from 'src/app/shared/interfaces/route.type';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { map } from 'rxjs/operators';
import { _ } from 'ag-grid-community';

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

  constructor(
    private routesService: RoutesService,
    public modalService: NzModalService,
    public message: NzMessageService
  ) { }

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
    this.routesService.toggleActiveVendorRouteAccess(this.vendorId, data.permissionId, data)
  }

  deletePermission(data) {
    this.routesService.deleteVendorRouteAccess(this.vendorId, data.permissionId)
  }

  getSubscriptions() {
    this.allRoutesSubscription = this.routesService.getRoutesByCustomer().subscribe((routes: any[]) => {
      this.allRoutesList = routes;
    }, err =>  {
      console.log('algo pasó: ', err);
      this.loading = false;
    })

    this.vendorRoutesSubscription = this.routesService.getAuthorizedRoutes(this.vendorId).subscribe((routes: any) => {
      console.log(typeof routes);
      console.log(routes.length);
      this.vendorRoutesList = !!routes && routes.length > 0 ? routes : [];
      console.log(this.vendorRoutesList);
      this.loading = false;
    }, err =>  {
      this.vendorRoutesList = [];
      console.log('algo pasó: ', err);
      this.loading = false;
    });

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
    console.log(record);

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
