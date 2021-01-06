import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { RoutesService } from 'src/app/shared/services/routes.service';
import { IStopPoint } from 'src/app/shared/interfaces/route.type';
import { map, takeUntil, tap } from 'rxjs/operators';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { SharedStopPointsNewComponent } from '../new/new.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { SharedStopPointsEditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-shared-stoppoints-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class SharedStopPointsListComponent implements OnInit, OnDestroy {

  @Input() accountId: string = '';
  @Input() routeId: string = '';

  sub: Subscription;
  stopPointsList: IStopPoint[] = [];
  loading = true;
  time = new Date();
  isEditing = false;
  item; //route record

  stopSubscriptions$: Subject<boolean> = new Subject();

  constructor(
    private routesService: RoutesService,
    public modalService: NzModalService,
    public message: NzMessageService,
    private afs: AngularFirestore
  ) { }

  ngOnInit() {
    this.getSubscriptions();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.stopSubscriptions$.next();
    this.stopSubscriptions$.complete();
  }

  timePickerChange(event) {
    console.log(event);
  }

  toggleActive(data) {
    // this.routesService.toggleActiveRoute(this.accountId, this.routeId, data)
    this.routesService.toggleActiveStopPoint(this.accountId, this.routeId, data);
  }

  deleteRoute(data) {
    this.routesService.deleteRoute(data.customerId, data.routeId).then(() => {
      console.log('done');
    })
      .catch(err => console.log(err));
  }

  getSubscriptions() {
    this.sub = this.routesService.getRouteStopPoints(this.accountId, this.routeId).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as IStopPoint;
        return { id: id, ...data }
      }))
    ).subscribe((stopPoints: IStopPoint[]) => {
      this.stopPointsList = stopPoints;
      this.loading = false;
    })

    this.routesService.getRoute(this.accountId, this.routeId).pipe(
      takeUntil(this.stopSubscriptions$),
      map(a => {
        const id = a.payload.id;
        const data = a.payload.data() as IStopPoint;
        return { id: id, ...data }
      }),
      tap(route => {
        this.item = route;
        console.log(this.item);
        return route;
      })
    ).subscribe();
  }

  showModalEdit(data) {
    let modal = this.modalService.create({
      nzTitle: 'Editar ' + data.description,
      nzContent: SharedStopPointsEditComponent,
      nzComponentParams: {
        stopPoint: data
      },
      nzOkText: 'Guardar',
      nzCancelText: 'Cancelar',
      nzOkLoading: this.isEditing,
      nzOnOk: () => new Promise( async (resolve) => {
        this.isEditing = true;
        const updated = modal.getContentComponent().validateForm.value;
        updated.id = data.id;
        await this.routesService.updateStopPoint(this.accountId, this.routeId, updated).then( () => {
          resolve;
          this.isEditing = false;
          modal.destroy();
          this.message.success('¡Listo!');
        }).catch( err => {
          this.isEditing = false;
          this.message.error('Ocurrió un error: ', err);
          resolve;
        })
      }),
      nzOnCancel: () => console.log('cancel')
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
    // modal.afterClose.subscribe(result => console.log('[afterClose] The result is:', result));
    
  }

  showModalCreate() {
    let modal = this.modalService.create({
      nzTitle: 'Nueva Parada',
      nzContent: SharedStopPointsNewComponent,
      nzComponentParams: {
        stopPoint: {}
      },
      nzOkText: 'Crear',
      nzCancelText: 'Cancelar',
      nzOkLoading: this.isEditing,
      nzOnOk: () => new Promise( async (resolve) => {
        this.isEditing = true;
        const record = modal.getContentComponent().validateForm.value;
        record.id = this.afs.createId();
        console.log(record);
        await this.routesService.createStopPoint(this.accountId, this.routeId, record).then( () => {
          resolve;
          this.isEditing = false;
          modal.destroy();
          this.message.success('¡Listo!');
        }).catch( err => {
          this.isEditing = false;
          this.message.error('Ocurrió un error: ', err);
          resolve;
        })
      }),
      nzOnCancel: () => console.log('cancel')
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
    // modal.afterClose.subscribe(result => console.log('[afterClose] The result is:', result));
    
  }

  onEditOk() {

  }

}
