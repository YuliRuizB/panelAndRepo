import * as firebase from 'firebase/app';

export interface IRoute {
    id: string;
    active: boolean;
    description: string;
    imageUrl: string;
    kmlUrl: string;
    name: string;
    customerName: string;
    customerId: string;
    routeId?: string;
}

export interface IStopPoint {
    id: string;
    active: boolean;
    description: string;
    geopoint: firebase.firestore.GeoPoint;
    imageUrl: string;
    name: string;
    order: number;
    rounds: IRound;

}

interface IRound {
    round1?: string;
    round2?: string;
    round3?: string;
    round4?: string;
}