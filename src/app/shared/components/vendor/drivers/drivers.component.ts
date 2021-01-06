import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DriversService } from 'src/app/shared/services/drivers.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-shared-vendor-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class SharedVendorDriversComponent implements OnInit, OnDestroy {

  @Input() vendorId: string = '';
  driversList: any;
  driversSubscription: Subscription;
  
  view: string = 'cardView';

  constructor(private driversService: DriversService) { }

  ngOnInit(): void {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    if(this.driversSubscription) {
      this.driversSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.driversService.getDrivers(this.vendorId).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ...data }
      }))
    ).subscribe((drivers) => {
      console.log(drivers);
      this.driversList = drivers;
    })
  }

  toggleActive(data) {
    this.driversService.toggleActiveDriver(data.uid, data.active)
  }

  deletePermission(data) {
    this.driversService.deleteDriver(data.uid)
  }

}
