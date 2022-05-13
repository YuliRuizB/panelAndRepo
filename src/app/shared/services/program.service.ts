import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';
import { take, map } from 'rxjs/operators';
import { addDays, addMinutes } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  constructor(private afs: AngularFirestore,public messageService: NzMessageService) { }

  setProgram(data: any) {
    console.log(data);

    const assignmentRef = this.afs.collection('customers').doc(data.customerId).collection('routes').doc(data.routeId).collection('assignments').doc(data.assignmentId);
    const driverRef = this.afs.collection('drivers').doc(data.driverId);

    let driverConfirmationAt = new Date(data.date);
    let startAt = new Date(data.date);
    let endAt = new Date(data.date);

    return assignmentRef.get().pipe(
      take(1),
      map( (assign:any) => {
        let a = assign.data();
        console.log('assignment data: ', a);
        let startTime = a.stopBeginHour.substring(0,5);
        let endTime = a.stopEndHour.substring(0,5);
      
        let startTimeArray = startTime.split(':');
        let endTimeArray = endTime.split(':');

        startAt.setHours(startTimeArray[0], startTimeArray[1], 0, 0);
        endAt.setHours(endTimeArray[0], endTimeArray[1], 0, 0);

        console.log(a);
        driverConfirmationAt.setHours(startTimeArray[0], startTimeArray[1], 0, 0);
        driverConfirmationAt.setMinutes(+driverConfirmationAt.getMinutes()-15,0,0);

        if(a.program == 'S') {
          let time = new Date(a.time.toDate());
          driverConfirmationAt = addMinutes(time, -15);
        }
        return {
          active: a.active,
          capacity: data.vehicleCapacity,
          count: 0,
          customerId: data.customerId,
          customerName: data.customerName,
          driver: data.driverName,
          driverConfirmationAt: firestore.Timestamp.fromDate(driverConfirmationAt),
          driverConfirmedAt: null,
          driverId: data.driverId,
          endAt: firestore.Timestamp.fromDate(endAt),
          endedAt: null,
          geofenceBegin: a.stopBeginId,
          geofenceEnd: a.stopEndId,
          geopoint: null,
          hasEnded: false,
          isConfirmed: false,
          isLive: false,
          isRejected: false,
          isTaskIn: a.program == 'M' ? true : false,
          isTaskOut: a.program == 'M' ? false: true,
          isWithTrouble: false,
          lastUpdatedAt: null,
          name: data.routeName,
          program: a.program,
          rating: 0,
          rejectedReason: null,
          round: a.round,
          routeDescription: data.routeName,
          routeId: data.routeId,
          routeName: data.routeName,
          startAt: firestore.Timestamp.fromDate(startAt),
          started: false,
          startedAt: null,
          troubleMessage: null,
          troubleType: null,
          type: a.type,
          time: a.time,
          vehicleId: data.vehicleId,
          vehicleName: data.vehicleName
        }
      })
    ).subscribe( assignment => {
      console.log(assignment);
      const programRef = this.afs.collection('customers').doc(data.customerId).collection('program');
      return programRef.add(assignment);
      // return true;
    });
  }

  getProgramsByDay(date: Date) {

    let start = date;
    let end = addDays(start, 1);
    console.log(start, end);
    
    const programmedAssignments = this.afs.collectionGroup('program', ref => 
    ref.where('startAt','>=', start)
       .where('startAt','<=', end)
      .where('active','==',true)
      .orderBy('startAt','asc')
    );
    return programmedAssignments.snapshotChanges();
  }

  editProgram(vendorId:string, data: any) {
    console.log(data);
    const programRef = this.afs.collection('customers').doc(data.value.customerId).collection('program').doc(data.value.idProgram);
      return programRef.update({driver: data.value.driverEdit , driverId: data.value.driverId ,
        vehicleId: data.value.vehicleId ,vehicleName:data.value.vehicleEdit})
        .then(() => this.sendMessage('success', 'La Programacion ha sido modificada.'))
        .catch(err => this.sendMessage('error', `¡Oops! Algo salió mal ... ${err}`));
  }

  sendMessage(type: string, message: string): void {
    this.messageService.create(type, message);
  }
}
