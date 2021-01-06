import { SideNavInterface } from '../../interfaces/side-nav.type';

export const ROUTES: SideNavInterface[] = [
    {
        path: '/dashboard/default',
        title: 'Principal',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'dashboard',
        roles: ['admin'],
        submenu: [
            {
                path: '/dashboard/default',
                title: 'General',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/dashboard/sales',
                title: 'Ventas',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/logistics/main',
                title: 'Logística',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/dashboard/projects',
                title: 'Servicios',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
        ]
    },
    {
        path: '',
        title: 'Logística',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'global',
        roles: ['admin','vendor'],
        submenu: [
            {
                path: '/vendor/logistics',
                title: 'En vivo',
                iconType: 'nzIcon',
                icon: 'environment',
                iconTheme: 'outline',
                submenu: []
            },
            {
                path: '/vendor/program',
                title: 'Programación',
                iconType: 'nzIcon',
                icon: 'profile',
                iconTheme: 'outline',
                submenu: []
            },
            {
                path: '/vendor/assignment',
                title: 'Asignación',
                iconType: 'nzIcon',
                icon: 'form',
                iconTheme: 'outline',
                submenu: []
            },
            {
                path: '/vendor/fleet',
                title: 'Vehículos',
                iconType: 'nzIcon',
                icon: 'car',
                iconTheme: 'outline',
                submenu: []
            },
            {
                path: '/vendor/routes',
                title: 'Rutas',
                iconType: 'nzIcon',
                icon: 'build',
                iconTheme: 'outline',
                submenu: []
            },
            {
                path: '/vendor/guards',
                title: 'Guardias',
                iconType: 'nzIcon',
                icon: 'alert',
                iconTheme: 'outline',
                submenu: []
            },
            {
                path: '/vendor/users',
                title: 'Usuarios',
                iconType: 'nzIcon',
                icon: 'solution',
                iconTheme: 'outline',
                submenu: []
            }
        ]
    },
    {
        path: '/accounts/dashboard',
        title: 'CRM',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'shop',
        roles: ['admin'],
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
        icon: 'file',
        roles: ['admin'],
        submenu: [
            {
                path: '/vendor/list',
                title: 'Transportistas',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/vendor/fleet',
                title: 'Vehículos',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            },
            {
                path: '/customers/routes',
                title: 'Rutas',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            }
        ]
    },
    {
        path: '',
        title: 'Configuración',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'setting',
        roles: ['admin'],
        submenu: [
            {
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
            },
            {
                path: '/global/users/dashboard',
                title: 'Usuarios',
                iconType: '',
                icon: '',
                iconTheme: '',
                submenu: []
            }
        ]
    }
];
