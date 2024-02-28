import { SideNavInterface } from '../../interfaces/side-nav.type';

export const ROUTES: SideNavInterface[] = [
    {
        path: '/dashboard/default',
        title: 'Principal',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: 'PP6jeKT4ZlySNRGT7S3Y',
        icon: 'home',
       // roles: ['admin','comercial','administracion','operacion'],
        submenu: [
            {
                path: '/dashboard/default',
                title: 'General',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: 'LOjYgBhCOl20fyajfgLp',
                submenu: []
            },
            {
                path: '/dashboard/quality',
                title: 'Calidad',
                iconType: '',
                icon: '', 
                iconTheme: '',
                idRol: 'FUUUPXbCS8KDWGWerj3Z',
                submenu: []
            },
            {
                path: '/dashboard/reports',
                title: 'Reportes',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: '6t4q4tFEiqT3utK9XWDi',
                submenu: []
            },
        ]
    },
    {
        path: '',
        title: 'Comercial',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: 'r8bv5GZVS9wwMvvaCm9a',
        icon: 'shop',       
        submenu: [
          /*   {
                path: '/vendor/logistics',
                title: 'En vivo',
                iconType: 'nzIcon',
                icon: 'environment',
                iconTheme: 'outline',
                idRol: 'N6haaZR254lOYKtZSZ4a',
                submenu: []
            } */
        ]
    },
    {
        path: '',
        title: 'Administración',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: '7B4MX1pimUfITP1JwPqw',
        icon: 'global',
      //  roles: ['admin','vendor'],
        submenu: [
            {
                path: '/admin/payments',
                title: 'Pagos',
                iconType: 'nzIcon',
                icon: 'profile',
                iconTheme: 'outline',
                idRol: 'YaaZhwAVJYw8oFWHIZ3h',
                submenu: []
            },{
                path: '/admin/organigrama',
                title: 'Organigrama de Rutas',
                iconType: 'nzIcon',
                icon: 'profile',
                iconTheme: 'outline',
                idRol: 'T2dnL8BKEykzs6oP7vAZ',
                submenu: []
            },
            {
                path: '/admin/evidence',
                title: 'Evidencias',
                iconType: 'nzIcon',
                icon: 'profile',
                iconTheme: 'outline',
                idRol: 'w0Qg3s4GhGEliUSrfJmB',
                submenu: []
            }
        ]
    },
    {
        path: '',
        title: 'Logística',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: 'r8bv5GZVS9wwMvvaCm9a',
        icon: 'global',
      //  roles: ['admin','vendor'],
        submenu: [
            {
                path: '/vendor/logistics',
                title: 'En vivo',
                iconType: 'nzIcon',
                icon: 'environment',
                iconTheme: 'outline',
                idRol: 'N6haaZR254lOYKtZSZ4a',
                submenu: []
            },
            {
                path: '/vendor/program',
                title: 'Programación',
                iconType: 'nzIcon',
                icon: 'profile',
                iconTheme: 'outline',
                idRol:'HqLseV1Dw0QHjZtjlM39',
                submenu: []
            },
            {
                path: '/vendor/assignment',
                title: 'Asignación',
                iconType: 'nzIcon',
                icon: 'form',
                iconTheme: 'outline',
                idRol:'hw5ENLMNNjdo73kuWGh7',
                submenu: []
            },
            {
                path: '/vendor/fleet',
                title: 'Vehículos',
                iconType: 'nzIcon',
                icon: 'car',
                iconTheme: 'outline',
                idRol:'G9l9JNQD1UEvevr2ZLC0',
                submenu: []
            },
            {
                path: '/vendor/routes',
                title: 'Rutas',
                iconType: 'nzIcon',
                icon: 'build',
                iconTheme: 'outline',
                idRol:'e5qwn7ttKegGvGJ8eTcU',
                submenu: []
            },
            /* {
                path: '/vendor/guards',
                title: 'Guardias',
                iconType: 'nzIcon',
                icon: 'alert',
                iconTheme: 'outline',
                idRol: '6t4q4tFEiqT3utK9XWDi',
                submenu: []
            }, */
            {
                path: '/vendor/users',
                title: 'Usuarios',
                iconType: 'nzIcon',
                icon: 'solution',
                iconTheme: 'outline',
                idRol: 'NNaY0RK2JHnMFlXgxxvP',
                submenu: []
            }
        ]
    },
    {
        path: '/accounts/dashboard',
        title: 'CRM',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: 'XxKPVPJtpBbGTzHBsIbT',
        icon: 'shop',
      //  roles: ['admin'],
        submenu: [
            // {
            //     path: '/accounts/main',
            //     title: 'Cuentas',
            //     iconType: '',
            //     icon: '',
            //     iconTheme: '',
            //     submenu: []
            // },
            // {
            //     path: '/users/main',
            //     title: 'Usuarios',
            //     iconType: '',
            //     icon: '',
            //     iconTheme: '',
            //     submenu: []
            // },
            // {
            //     path: '/customers/payments',
            //     title: 'Pagos',
            //     iconType: '',
            //     icon: '',
            //     iconTheme: '',
            //     submenu: []
            // }
        ]
    },
    {
        path: '',
        title: 'Sistema',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: '4w3lNlD2Y2zVI18eXxby',
        icon: 'file',
    //    roles: ['admin'],
        submenu: [
            {
                path: '/vendor/list',
                title: 'Clientes',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: 'WL4xhAtcgBYKPtC977SP',
                submenu: []
            },
            {
                path: '/vendor/fleet',
                title: 'Vehículos',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol:'G9l9JNQD1UEvevr2ZLC0',
                submenu: []
            },
            {
                path: '/customers/routes',
                title: 'Rutas',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: 'e5qwn7ttKegGvGJ8eTcU',
                submenu: []
            }
        ]
    },
    {
        path: '',
        title: 'Configuración',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        idRol: 'QlE2Q7Z6KiaFb3EHslyn',
        icon: 'setting',
      //  roles: ['admin'],
        submenu: [
           /*  {
                path: '/authentication/login-1',
                title: 'Servicios',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/authentication/login-2',
                title: 'Precios',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/authentication/login-3',
                title: 'Global',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            }, */
            {
                path: '/global/roles/dashboard',
                title: 'Roles',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: 'zXUdtKTWhNNWE7xcbUYe',
                submenu: []
            },
            {
                path: '/global/users/dashboard',
                title: 'Perfiles',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: 'eeTeXw40uLOUq4dXuSnQ',
                submenu: []
            },
            {
                path: '/global/my-profile/dashboard',
                title: 'Mi Perfil',
                iconType: '',
                icon: '',
                iconTheme: '',
                idRol: 'ttOv6Pj2ue6eSsMCt6qv',
                submenu: []
            }
        ]
    }
];
