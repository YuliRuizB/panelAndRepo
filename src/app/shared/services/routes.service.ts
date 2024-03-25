import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
//import * as firebase from 'firebase/app';
import { GeoPoint } from 'firebase/firestore';
import { map, switchMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable, combineLatest, of } from 'rxjs';
import { IVendor } from '../interfaces/vendor.type';
import { IRoute } from '../interfaces/route.type';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {

  joined$: Observable<any>;

  constructor(private afs: AngularFirestore) { }

  getRoutes(customerId: string) {
    const routes = this.afs.collection('customers').doc(customerId).collection('routes');
    return routes.snapshotChanges();
  }

  setRoute(customerId: string, routeObj: any) {
    const key = this.afs.createId();
    routeObj.routeId = key;
    const route = this.afs.collection('customers').doc(customerId).collection('routes').doc(key);
    return route.set(routeObj);
  }

  duplicateRouteWithStops(routeSource: any) {
    let routeObj = { ...routeSource};
    const key = this.afs.createId();
    console.log(routeObj);
    const newRoute = {
      customerId: routeObj.newCustomerId,
      customerName: routeObj.newCustomerName,
      active: false,
      description: routeObj.description,
      name: routeObj.name,
      routeId: key
    }
    routeObj.routeId = key;
    const route = this.afs.collection('customers').doc(routeObj.newCustomerId).collection('routes').doc(key);
    /* const stops = firebase.firestore().collection('customers').doc(routeSource.customerId).collection('routes').doc(routeSource.routeId).collection('stops');
    return stops.get().then( querySnapShot => {
      console.log(querySnapShot.docs);
      route.set(newRoute).then( () => {
        if(!querySnapShot.empty) {
          const newStopsRef = this.afs.collection('customers').doc(routeObj.newCustomerId).collection('routes').doc(key).collection('stops');
          const docs = querySnapShot.docs;
          docs.forEach(doc => {
            const document = doc.data();
            newStopsRef.add(document);
          });
        }
      })
    }) */
    const stops = this.afs.collection('customers').doc(routeSource.customerId).collection('routes').doc(routeSource.routeId).collection('stops');

    return stops.get().toPromise().then(querySnapShot => {
      console.log(querySnapShot.docs);
      return route.set(newRoute).then(() => {
        if (!querySnapShot.empty) {
          const newStopsRef = this.afs.collection('customers').doc(routeObj.newCustomerId).collection('routes').doc(key).collection('stops');
          const docs = querySnapShot.docs;
          const promises: Promise<DocumentReference<any>>[] = docs.map(doc => {
            const document = doc.data();
            return newStopsRef.add(document);
          });
    
          return Promise.all(promises) as unknown as Promise<void>;
        }
        return Promise.resolve();
      });
    });
  }

  toggleActiveRoute(customerId: string, routeId: string, routeObj: any) {
    const route = this.afs.collection('customers').doc(customerId).collection('routes').doc(routeId);
    return route.update({ active: !routeObj.active});
  }

  deleteRoute(customerId: string, routeId: string) {
    const route = this.afs.collection('customers').doc(customerId).collection('routes').doc(routeId);
    return route.delete();
  }

  getAllRoutes() {
    const routes = this.afs.collectionGroup('routes', ref => ref.where('active', '==', true));
    return routes.snapshotChanges();
  }

  getRoutesByCustomer() {
    this.joined$ = this.afs.collection('customers', ref => ref.orderBy('name')).valueChanges({ idField: 'id'})
      .pipe(
        switchMap((customers:any) => {
          const customersIds = _.uniq(customers.map(c => c.id))
          return combineLatest(
            of(customers),
            combineLatest(
              customersIds.map( (customerId: string) =>
                this.afs.collection('customers').doc(customerId).collection('routes', ref => ref.orderBy('name')).valueChanges({ idField: 'id'}).pipe(
                  map((routes: IRoute[]) => {
                    return {...routes, customerId }
                  })
                )
              )
            )
          )
        }),
        map(([customers, routes]: [any[], any[]]) => { 
          console.log("rutasgetroutesbycustomer");
          console.log(routes);
          return routes.map((route:any) => {
            const customer = _.filter(customers, (c) => {
              return route.customerId === c.id
            })
            delete route.customerId;
            return {
              routes: _.values(route),
              customerId: customer[0].id,
              customerName: customer[0].name
            }
          });
        })
      )
      return this.joined$;
  }

  getAuthorizedRoutes(vendorId: string) {
    console.log("sssaqui?");
    console.log(vendorId);
    this.joined$ = this.afs.collection('vendors').doc(vendorId).collection('routesAccess').valueChanges({ idField: 'id'})
      .pipe(
        switchMap((permissions:any) => {
          console.log(permissions);
          const routeIds = _.uniq(permissions.map(p => p.routeId))
          console.log(routeIds.length);
          return routeIds.length === 0 ? of([]) :
          combineLatest(
            of(permissions),
            combineLatest(
              routeIds.map( (routeId: string) =>
                this.afs.collectionGroup('routes', ref => ref.where('routeId', '==', routeId)).valueChanges().pipe(
                  map((routes: IRoute[]) => routes[0])
                )
              )
            )
          )
        }),
        map(([permissions, routes]) => {
          console.log("parte2");
          console.log(routes); // Log the routes array
          
          return typeof routes !== "undefined" ? routes
            .filter((route: any) => route) // Remove undefined values from routes
            .map((route: any) => {
              console.log(route);
              const permission = _.filter(permissions, (p) => {
                return route && route.routeId === p.routeId;
              });
        
              // Ensure that permission[0] is defined before accessing its properties
              return permission[0] ? {
                ...route,
                permission: permission[0].active || false,
                permissionId: permission[0].id,
                customerId: permission[0].customerId || '',
                customerName: permission[0].customerName || ''
              } : null; // Return null for cases where permission[0] is undefined
            }).filter((result: any) => result !== null) // Remove null values from the result array
            : of([]);
        })       
      )
      return this.joined$;
  }
  
  getAllCustomersRoutes() {
    this.joined$ = this.afs.collection('customers').valueChanges({ idField: 'id'})
      .pipe(
        switchMap((customers:any) => {
          console.log(customers.length);
          return customers.length === 0 ? of([]) :
          combineLatest(
            of(customers),
            combineLatest(
              customers.map( (customer: any) =>
                this.afs.collection('customers').doc(customer.id).collection('routes').valueChanges().pipe(
                  map((routes: IRoute[]) => routes.map( route => {
                    return { customerId: customer.id, customerName: customer.name, ...route }
                  }))
                )
              )
            )
          )
        }),
        map(([customers, routes]) => {
          console.log(routes);
          return typeof routes != "undefined" ? _.flatten(routes) : of([])
        })
      )
      return this.joined$;
  }

  setAuthorizedRoutes(vendorId: string, record: any) {
    const vendorAuthorizedRoute = this.afs.collection('vendors').doc(vendorId).collection('routesAccess');
    return vendorAuthorizedRoute.add(record);
  }

  getVendorRoutes(vendorId: string) {
    return this.getRoutesArray(vendorId).pipe(
      map((actions:any) => actions.map(a => {
        return a.payload.doc.data().routeId;
      })),
      switchMap(permissions => {
        return this.afs.collectionGroup('routes', ref => ref.where('routeId', 'in', permissions)).valueChanges();
      })
    );
  }

  getRoutesArray(vendorId: string) {
    const routesAccess = this.afs.collection('vendors').doc(vendorId).collection('routesAccess');
    return routesAccess.snapshotChanges();
  }

  getRouteStopPoints(accountId: string, routeId: string) {
    const stopPoints = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('stops', ref => ref.orderBy('order', 'asc'));
    return stopPoints.snapshotChanges();
  }

  //Vehicle Assignments

  getRouteVehicleAssignments(accountId: string, routeId: string, assignmentId: string, vendorId: string) {
    const routeVehicleAssignments = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('vehicleAssignments', ref => ref.where('assignmentId','==',assignmentId).where('vendorId','==',vendorId));
    return routeVehicleAssignments.snapshotChanges();
  }

  setRouteVehicleAssignments(accountId: string, routeId: string, assignment: any) {
    const routeVehicleAssignments = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('vehicleAssignments');
    return routeVehicleAssignments.add(assignment);
  }

  updateRouteVehicleAssignment(accountId: string, routeId: string, assignmentId: string,  assignment: any) {
    const routeVehicleAssignment = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('vehicleAssignments').doc(assignmentId);
    return routeVehicleAssignment.update(assignment);
  }

  toggleRouteVehicleAssignment(accountId: string, routeId: string, assignmentId: string,  assignment: any) {
    const routeVehicleAssignment = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('vehicleAssignments').doc(assignmentId);
    return routeVehicleAssignment.update({ active: !assignment.active });
  }

  deleteRouteVehicleAssignments(accountId: string, routeId: string, assignmentId: string) {
    const routeVehicleAssignment = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('vehicleAssignments').doc(assignmentId);
    return routeVehicleAssignment.delete();
  }

  //Route Assignments

  getRouteAssignments(accountId: string, routeId: string) {
    const routeAssignments = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('assignments');
    return routeAssignments.snapshotChanges();
  }

  getCustomerVendorAssignments(accountId: string) {
    const routeAssignments = this.afs.collectionGroup('assignments', ref => ref.where('customerId','==',accountId).orderBy('time'));
    return routeAssignments.snapshotChanges();
  }

  deleteCustomerVendorAssignment(assignmentId: string, accountId: string) {
    const assignment = this.afs.collection('customers').doc(accountId).collection('program').doc(assignmentId);
    return assignment.delete();
  }

  getCustomerVendorAssignmentsByDay(date: Date) {
    let searchField = '';
    const dayNumber = date.getDay();

    switch (dayNumber) {
      case 0:
        searchField = 'isSunday';
        break;
      case 1:
        searchField = 'isMonday';
        break;
      case 2:
        searchField = 'isTuesday';
        break;
      case 3:
        searchField = 'isWednesday';
        break;
      case 4:
        searchField = 'isThursday';
        break;
      case 5:
        searchField = 'isFriday';
        break;
      case 6:
        searchField = 'isSaturday';
        break;
      default:
        break;
    }
    const routeAssignments = this.afs.collectionGroup('assignments', ref => ref.where(searchField,'==',true).where('active','==',true));
    return routeAssignments.snapshotChanges();
  }

  getVendorVehicleAssignments(vendorId: string) {
    const assignments = this.afs.collectionGroup('vehicleAssignments', ref => ref.where('vendorId','==',vendorId).where('active','==',true));
    return assignments.snapshotChanges();
  }

  setRouteAssignments(accountId: string, routeId: string, assignment: any) {
    const routeAssignments = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('assignments');
    return routeAssignments.add(assignment);
  }

  updateRouteAssignment(accountId: string, routeId: string, assignmentId: string,  assignment: any) {
    const routeAssignment = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('assignments').doc(assignmentId);
    return routeAssignment.update(assignment);
  }

  toggleRouteAssignment(accountId: string, routeId: string, assignmentId: string,  assignment: any) {
    const routeAssignment = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('assignments').doc(assignmentId);
    return routeAssignment.update({ active: !assignment.active });
  }

  deleteRouteAssignments(accountId: string, routeId: string, assignmentId: string) {
    const routeAssignment = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('assignments').doc(assignmentId);
    return routeAssignment.delete();
  }

  getRoute(accountId: string, routeId: string) {
    const routeRef = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId);
    return routeRef.snapshotChanges();
  }

  updateStopPoint(accountId: string, routeId: string, object: any) {
    let wrappedData = object;
    wrappedData.rounds = {
      round1: object.round1,
      round2: object.round2,
      round3: object.round3
    };
    //wrappedData.geopoint = new firebase.firestore.GeoPoint(+object.latitude, +object.longitude);
    wrappedData.geopoint = new GeoPoint(+object.latitude, +object.longitude);
    console.log(wrappedData);
    const stopPoint = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('stops').doc(object.id);
    return stopPoint.update(wrappedData);
  }

  createStopPoint(accountId: string, routeId: string, object: any) {
    let wrappedData = object;
    wrappedData.rounds = {
      round1: object.round1,
      round2: object.round2,
      round3: object.round3,
      round1MinutesSinceStart: object.round1MinutesSinceStart,
      round2MinutesSinceStart: object.round2MinutesSinceStart,
      round3MinutesSinceStart: object.round3MinutesSinceStart
    };
    //wrappedData.geopoint = new firebase.firestore.GeoPoint(+object.latitude, +object.longitude);
    wrappedData.geopoint = new GeoPoint(+object.latitude, +object.longitude);
    console.log(wrappedData);
    const stopPoint = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('stops').doc(object.id);
    return stopPoint.set(wrappedData);
  }

  toggleActiveStopPoint(accountId: string, routeId: string, object: any) {
    const state = !object.active;
    const stopPoint = this.afs.collection('customers').doc(accountId).collection('routes').doc(routeId).collection('stops').doc(object.id);
    return stopPoint.update({ active: state });
  }

  toggleActiveVendorRouteAccess(vendorId: string, routeId: string, object: any) {
    const state = !object.permission;
    const routeAccess = this.afs.collection('vendors').doc(vendorId).collection('routesAccess').doc(routeId);
    return routeAccess.update({ active: state });
  }

  deleteVendorRouteAccess(vendorId: string, routeId: string) {
    const routeAccess = this.afs.collection('vendors').doc(vendorId).collection('routesAccess').doc(routeId);
    return routeAccess.delete();
  }
}
