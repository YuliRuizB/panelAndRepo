export interface UserCredentials {
    id: number;
    username: string;
    password: string;
    token?: string;
}

export interface User {
    uid?: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    studentId?: number;
    emailVerified: boolean;
    paid?: boolean;
    paymentId?: string;
    defaultRoute?: string;
    defaultRound?: string;
    roles: string[];
    permissions?: Permission[];
  }

  export enum Role {
    user = 'user',
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

  export interface Roles {
    user?: boolean;
    manager?: boolean;
    admin?: boolean;
 }
