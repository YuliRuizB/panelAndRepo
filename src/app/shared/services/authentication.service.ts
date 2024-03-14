import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
//import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of } from 'rxjs';
import { switchMap, take, map, tap } from 'rxjs/operators';
//import * as firebase from 'firebase';
import { User1, Permission, Role } from 'src/app/shared/interfaces/user.type';
import * as _ from 'lodash';
import { GoogleAuthProvider } from 'firebase/auth';
import { getAuth, updateProfile, User } from 'firebase/auth';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  user: Observable<User1>;
  role: Role;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private ngZone: NgZone,
    private notification: NzNotificationService
  ) {
   
    //// Get auth data, then get firestore user document || null
    this.user = this.afAuth.authState.pipe(
      switchMap((user:any) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          const data = this.afs.doc<User1>(`users/${user.uid}`);
          return data.valueChanges();
        } else {         
          localStorage.setItem('user', null);
          return of(null);
        }
      })
    );
    
  }

  getUser() {
    return this.user;
  }

  // Sign in with email/password
  signIn(email, password) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result:any) => {
        this.ngZone.run(() => {
          if (!result.user.emailVerified) {
            this.notification.create(
              'warning',
              '¡Oops!, su cuenta no ha sido verificada',
              'Para continuar es necesario verificar su cuenta de correo electrónico.'
            );
            this.router.navigate(['authentication/please-verify-email']);
          } else {           
            this.getAccessLevel(result.user.uid);
          }
        });
        // if (result.user) { this.updateUserData(result.user) };
      }).catch((error) => {
        this.notification.create('error', '¡Oops!, algo salió mal ...', error.message);
      });
  }

  async getAccessLevel(userId: string) {
    const userRef$ = await this.afs.collection('users').doc(userId);
    userRef$.snapshotChanges().pipe(
      take(1),
      map( (a:any) => {
        const id = a.payload.id;
        const data = a.payload.data() as any;
        return { id: id, ...data }
      })
    ).subscribe( (user:any) => {     
      const hasRoleAccess = _.includes(['admin','vendor','sales','student','user'], user.roles[0]);
      if(!hasRoleAccess) {
        this.notification.create(
          'warning',
          '¡Oops!, su cuenta no tiene acceso a este sistema',
          'Si esto es un error, por favor contacte al administrador del sitio.'
        );
        this.signOut();
      } else {
        this.router.navigate([`/dashboard/${user.roles[0]}`]);
      }
    })
  }

  ///// Role-based Authorization //////


  canEnter(user: User1): boolean {
    const allowed = ['admin', 'vendor', 'sales'];
    return this.checkAuthorization(user, allowed);
  }

  canRead(user: User1): boolean {
    const allowed = ['admin', 'editor', 'subscriber'];
    return this.checkAuthorization(user, allowed);
  }

  canEdit(user: User1): boolean {
    const allowed = ['admin', 'editor'];
    return this.checkAuthorization(user, allowed);
  }

  canDelete(user: User1): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }

  // determines if user has matching role
  private checkAuthorization(user: User1, allowedRoles: string[]): boolean {
    if (!user) { return false; }
    for (const role of allowedRoles) {
      if ( user.roles[role] ) {
        return true;
      }
    }
    return false;
  }

  // Sign up with email/password
  signUp(form: any) {
    const email = form.email;
    const password = form.password;
    return this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign
        up and returns promise */
       // console.log(result);
        this.setUserData(result.user, form);
        this.sendVerificationMail();

        
      }).catch((error) => {
        this.notification.create('error', 'Error de creación de Usuario', error);
      });
  }

  async sendVerificationMail() {
    console.log("sendVerificationMail");
    try {
      const user = await this.afAuth.currentUser;
      
      if (user) {
        await user.sendEmailVerification();
        this.router.navigate(['authentication/verify-email']);
        this.notification.create('info', '¡Perfecto!', 'El correo ha sido enviado');
      } else {
        // Handle the case when there is no logged-in user
        this.notification.create('error', 'Error de verificación de correo', 'No hay usuario registrado');
      }
    } catch (error) {
      this.notification.create('error', 'Error de verificación de correo', error.message);
    }
  }

  // Send email verfificaiton when new user sign up
  /* sendVerificationMail() {
    console.log("sendverificationMail)");
    return this.afAuth.currentUser.sendEmailVerification()
      .then(() => {
        this.router.navigate(['authentication/verify-email']);
        this.notification.create('info', '¡Perfecto!', 'El correo ha sido enviado');
      }).catch((error) => {
        this.notification.create('error', 'Error de verificación de correo', error);
      });
  }
 */
  // Reset Forggot password
  forgotPassword(passwordResetEmail) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        // tslint:disable-next-line: max-line-length
        this.notification.create('info', '¡Listo!', 'Se ha enviado un correo electrónico a su cuenta con la información necesaria para recuperar su contraseña.');
      }).catch((error) => {
        this.notification.create('error', '¡Oops!, algo salió mal ...', error);
      });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    // const user = JSON.parse(localStorage.getItem('user'));
    // return (user !== null && user.emailVerified !== false) ? true : false;
    // return (user !== null) ? true : false;
    return (!!this.user);
  }

  // Sign in with Google
  googleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
      .then((result) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.setUserData(result.user);
      }).catch((error) => {
        this.notification.create('error', '¡Oops!, algo salió mal ...', error);
      });
  }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  setUserData(user, form?) {
    console.log(form);
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      phoneNumber: form && form.phoneNumber ? form.phoneNumber : null,
      displayName: form.firstName + ' ' + form.lastName,//user.displayName ? user.displayName : form && form.firstName ? form.lastName : null,
      studentId: form && form.studentId ? form.studentId : null,
      photoURL:   user.photoURL,
      roles: [Role.admin],
      permissions: [Permission.canRead],
      emailVerified: user.emailVerified,
      name: form.firstName,
      firstName: form.firstName,
      lastName: form.lastName,
      customerName: form.customerName,
      customerId: form.customerId,
      round: form.round,      
      status: form && form.status !== undefined ? form.status : 'active',
      rolId: form && form.rolId !== undefined ? form.rolId :  '54YNS3xlSLPc6UzNq2HJ',
      roundTrip: form.roundTrip,
      turno: form.turno,
      defaultRouteName: form.defaultRouteName,
      defaultRoute: form.defaultRoute,
      defaultRound: form.defaultRound
    };
    return userRef.set(userData, {
      merge: true
    }).then( (result) => {
      this.updateUserProfile(form);
    })
    .catch( err => console.log('err: ', err));
  }

  getUserFromDatabase(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    // tslint:disable-next-line: no-shadowed-variable
    userRef.snapshotChanges().subscribe(user => {
      return user.payload.data();
    });
  }

  updateUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData = {
      emailVerified: user.emailVerified
    };
    // this.updateRolesAndPermissions(user);
    return userRef.set(userData, {
      merge: true
    })
    .then( response => console.log('ok', response))
    .catch( err => console.log('err: ', err));
  }

  updateUserProfile(form) {
    /* const currentUser = firebase.auth().currentUser;
    currentUser.updateProfile({
      displayName: form && form.fullName ? form.fullName : null,
      photoURL: 'https://example.com/jane-q-user/profile.jpg',
    }).then(function() {
      console.log('update successfull');
    }).catch(function(error) {
      console.log('an error happened; ', error);
    }); */

    const auth = getAuth();
    const user: User = auth.currentUser;
  
    if (user) {
      updateProfile(user, {
        displayName: form && form.fullName ? form.fullName : null,
        photoURL: 'https://example.com/jane-q-user/profile.jpg',
      }).then(() => {
        console.log('Update successful');
      }).catch((error) => {
        console.log('An error occurred:', error);
      });
    } else {
      console.log('No user is currently signed in.');
    }
  }

  // updateRolesAndPermissions(user) {
  //   const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
  //   userRef.snapshotChanges().subscribe((data) => {
  //     const userData = data.payload.data() as User;
  //     const roles: Role[] = userData && userData.roles ? userData.roles : [];
  //     const permissions: Permission[] = userData && userData.permissions ? userData.permissions : [];
  //   },
  //   (error: any) => console.log('Error: ', error));
  // }

  googleLogin() {
    const provider = new GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential.user);
      });
  }

  signOut() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/authentication/login']);
    });
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// import { User } from '../interfaces/user.type';

// const USER_AUTH_API_URL = '/api-url';

// @Injectable()
// export class AuthenticationService {
//     private currentUserSubject: BehaviorSubject<User>;
//     public currentUser: Observable<User>;

//     constructor(private http: HttpClient) {
//         this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
//         this.currentUser = this.currentUserSubject.asObservable();
//     }

//     public get currentUserValue(): User {
//         return this.currentUserSubject.value;
//     }

//     login(username: string, password: string) {
//         return this.http.post<any>(USER_AUTH_API_URL, { username, password })
//         .pipe(map(user => {
//             if (user && user.token) {
//                 localStorage.setItem('currentUser', JSON.stringify(user));
//                 this.currentUserSubject.next(user);
//             }
//             return user;
//         }));
//     }

//     logout() {
//         localStorage.removeItem('currentUser');
//         this.currentUserSubject.next(null);
//     }
// }
