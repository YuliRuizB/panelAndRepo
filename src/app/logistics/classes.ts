import { format, fromUnixTime } from 'date-fns';
import esLocale from 'date-fns/locale/es';

export interface IActivityLog {
    actualKey?: string;
    code?: string;
    created?: string;
    description?: string;
    driver?: string;
    event?: string;
    format?: string;
    icon?: string;
    location?: string;
    program?: string;
    round?: string;
    route?: string;
    studentId?: string;
    studentName?: string;
    type?: string;
    updateData?: boolean;
    valid?: boolean;
    validUsage?: boolean;
    vehicle?: string;
  }

  export var ColumnDefs = [
    { headerName: 'Fecha', field: 'created', cellRenderer: (params) => { 
      if (params && params.value) {
        return format( fromUnixTime(params.value.seconds), 'MM/dd/yyyy HH:mm', { locale: esLocale })
      }
    }},
    // { headerName: 'Fecha', field: 'created' },
    { headerName: 'Alumno', field: 'studentName', sortable: true },
    { headerName: 'Matrícula', field: 'studentId', sortable: true, enableValue: true, allowedAggFuncs: ['count'] },
    { headerName: 'Ingreso con', field: 'studentId', sortable: true, enableValue: true, allowedAggFuncs: ['count'] },
    { headerName: 'Evento', field: 'event', sortable: true, enableRowGroup: true },
    { headerName: 'Tipo', field: 'type', sortable: true, enableRowGroup: true },
    { headerName: 'Descripción', field: 'description', sortable: true },
    { headerName: 'Ruta', field: 'route', enableRowGroup: true },
    { headerName: 'Turno', field: 'round', enableRowGroup: true },
    { headerName: 'Programa', field: 'program', enableRowGroup: true },
    { headerName: 'Vehículo', field: 'vehicle', enableRowGroup: true },
    { headerName: '¿Subió?', field: 'allowedOnBoard', enableRowGroup: true }
  ];

  export var LiveProgramColumnDefs = [
    { headerName: 'Fecha', field: 'created', cellRenderer: (params) => { 
      if (params && params.value) {
        return format( fromUnixTime(params.value.seconds), 'MM/dd/yyyy HH:mm', { locale: esLocale })
      }
    }},
    // { headerName: 'Fecha', field: 'created' },
    { headerName: 'Conductor', field: 'driver', sortable: true },
    { headerName: 'Vehículo', field: 'vehicleName', sortable: true },
    { headerName: 'Programa', field: 'program', sortable: true, enableValue: true },
    { headerName: 'Turno', field: 'round', sortable: true, enableRowGroup: true },
    { headerName: 'Ruta', field: 'routeName', sortable: true, enableRowGroup: true },
    { headerName: 'Descripción', field: 'description', sortable: true },
    { headerName: 'Ruta', field: 'route', enableRowGroup: true },
    { headerName: 'Tipo', field: 'type', enableRowGroup: true },
    { headerName: 'Capacidad', field: 'capacity', enableRowGroup: true },
    { headerName: 'Usuarios', field: 'count', enableRowGroup: true },
    { headerName: 'Arrancó?', field: 'isLice', enableRowGroup: true }
  ]