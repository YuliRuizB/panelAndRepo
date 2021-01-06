import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountsService } from 'src/app/shared/services/accounts.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  accountsList: any;
  public popupParent;
  columnDefs = [
    { headerName: '#', checkboxSelection: true, suppressSizeToFit: true, suppressSorting: true },
    { headerName: 'Id', field: 'id', hide: true },
    { headerName: 'Nombre', field: 'name', enableRowGroup: true },
    { headerName: 'Recorrido', field: 'description', enableRowGroup: true, filter: 'text' },
    { headerName: 'Tipo', field: 'routeType', enableRowGroup: true, filter: 'text' },
    {
      headerName: 'Clima', field: 'has_ac', enableRowGroup: true, filter: 'text',
      cellRenderer: function (params) {
        let color = params.value === true ? 'color--behance' : 'ag-faded';
        let cellContent: string = '';
        cellContent = `<i class="material-icons ${color}">ac_unit</i>`;
        return cellContent;
      }
    },
    {
      headerName: 'Control de ruta', headerClass: 'centered',
      children: [
        {
          headerName: 'Kmz', field: 'kmzUrl',
          cellRenderer: function (params) {
            let icon = typeof (params.value) != 'undefined' && params.value != 'no route designated' ? 'check_circle' : 'cancel';
            let color = typeof (params.value) != 'undefined' && params.value != 'no route designated' ? 'color--success' : 'color--dark';
            let cellContent: string = '';
            cellContent = `<i class="material-icons ${color}">${icon}</i>`;
            return cellContent;
          }
        },
        {
          headerName: 'Geocerca partida', field: 'geofenceBegin',
          cellRenderer: function (params) {
            let icon = typeof (params.value) != 'undefined' && (params.value).length > 0 ? 'check_circle' : 'cancel';
            let color = typeof (params.value) != 'undefined' && (params.value).length > 0 ? 'color--success' : 'color--dark';
            let cellContent: string = '';
            cellContent = `<i class="material-icons ${color}">${icon}</i>`;
            return cellContent;
          }
        },
        {
          headerName: 'Geocerca destino', field: 'geofenceEnd',
          cellRenderer: function (params) {
            let icon = typeof (params.value) != 'undefined' && (params.value).length > 0 ? 'check_circle' : 'cancel';
            let color = typeof (params.value) != 'undefined' && (params.value).length > 0 ? 'color--success' : 'color--dark';
            let cellContent: string = '';
            cellContent = `<i class="material-icons ${color}">${icon}</i>`;
            return cellContent;
          }
        },
        {
          headerName: 'Activa',
          field: 'active',
          cellEditor: 'popupSelect',
          editable: true,
          cellRenderer: function (params) {
            let icon = typeof (params.value) == 'undefined' ? 'cancel' : params.value ? 'check_circle' : 'cancel';
            let color = typeof (params.value) == 'undefined' ? 'color-dark' : params.value ? 'color--success' : 'color--dark';
            let cellContent: string = '';
            cellContent = `<i class="material-icons ${color}">${icon}</i>`;
            return cellContent;
          },
          cellEditorParams: {
            values: ['Si', 'No']
          }
        }
      ]
    }
  ];

  constructor(private accountsService: AccountsService) {
    this.popupParent = document.querySelector("body");
   }

  ngOnInit() {
    this.getSubscriptions();
  }

  getSubscriptions() {
    this.accountsService.getAccounts().pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ...data }
      }))
    ).subscribe((accounts) => {
      this.accountsList = accounts;
    });
  }

}
