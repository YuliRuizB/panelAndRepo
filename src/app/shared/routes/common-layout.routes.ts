import { Routes } from '@angular/router';
import { canActivate } from '@angular/fire/auth-guard';

export const CommonLayout_ROUTES: Routes = [
    {
        path: 'accounts',
        loadChildren: () => import('../../accounts/accounts.module').then(m => m.AccountsModule),
        data: {
            title: 'Cuentas'
        }
    },
    {
        path: 'dashboard',
        loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
        path: 'customers',
        loadChildren: () => import('../../customers/customers.module').then(m => m.CustomersModule)
    },
    {
        path: 'global',
        loadChildren: () => import('../../global/global.module').then(m => m.GlobalModule)
    },
    {
        path: 'logistics',
        loadChildren: () => import('../../logistics/logistics.module').then(m => m.LogisticsModule)
    },
    {
        path: 'vendor',
        data: {
            title: 'Transportistas'
          },
        loadChildren: () => import('../../vendor/vendor.module').then(m => m.VendorModule)
    }
];
