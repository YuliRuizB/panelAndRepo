export interface UserCredentials {
    id: number;
    username: string;
    password: string;
    token?: string;
}

export interface User1 {
    uid?: string;
    email?: string;
    displayName?: string;
    name?:string;
    lastName?:string;
    photoURL?: string;
    phoneNumber?: string;
    studentId?: number;
    emailVerified: boolean;
    paid?: boolean;
    paymentId?: string;
    defaultRoute?: string;
    defaultRound?: string;
    roles: string[];
    rolId?:string;
    permissions?: Permission[];
    customerName?:string;
    customerId?:string;
    round?:string;
  }

   export enum Role {
    user = 'user',
    student = 'student',
    manager = 'manager',
    admin = 'admin'
  } 

  export enum Permission {
    canRead = 'canRead',
    canList = 'canList',
    canUpdate = 'canUpdate',
    canWrite = 'canWrite',
    canCreate = 'canCreate',
    canDelete = 'canDelete'
  }

/*   export interface Roles {
    user?: boolean;
    manager?: boolean;
    admin?: boolean;
    student?: boolean;
 }
 */