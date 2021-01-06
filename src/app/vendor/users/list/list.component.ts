import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';

//AMCharts 4
import * as am4core from "@amcharts/amcharts4/core";
am4core.options.autoSetClassName = true;
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";

import { UsersService } from 'src/app/shared/services/users.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import * as _ from 'lodash';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

/* Chart code */
// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class VendorUsersListComponent implements OnInit, OnDestroy {

  search;
  private chart;
  stopSubscription$: Subject<any> = new Subject();
  user: any;
  usersList: any = [];
  routesList: any = [];

  gridApi;
  gridColumnApi;
  columnDefs;
  defaultColDef;
  detailCellRendererParams;
  rowData: any = [];
  usersColumnDefs;

  constructor(
    private zone: NgZone,
    private usersService: UsersService,
    private authService: AuthenticationService
  ) {
    this.columnDefs = [
      {
        headerName: 'Cliente', field: 'customerName',
        cellRenderer: 'agGroupCellRenderer', sortable: true
      },
      { headerName: 'Ruta', sortable: true, field: 'routeName' },
      { headerName: 'Usuarios Mete', field: 'customerName', cellRenderer: (params) => {
        const passes = params.data.passes;
        const isTaskIn = _.filter(passes, (p) => {
          return !!p.isTaskIn;
        })
        return isTaskIn.length;
      }},
      { headerName: 'Usuarios Saca', field: 'customerName', cellRenderer: (params) => {
        const passes = params.data.passes;
        const isTaskOut = _.filter(passes, (p) => {
          return !!p.isTaskOut;
        })
        return isTaskOut.length;
      }},
      { headerName: 'Activa', field: 'permission', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }}
    ];

    this.usersColumnDefs = [
      { headerName: 'Cliente', field: 'customerName', enableRowGroup: true },
      { headerName: 'Ruta', field: 'routeName', enableRowGroup: true },
      { headerName: 'Turno', field: 'round', enableRowGroup: true },
      { headerName: 'Parada', field: 'stopName', enableRowGroup: true },
      { headerName: 'Pase de abordar', field: 'name' },
      { headerName: 'Mete', field: 'isTaskIn', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }},
      { headerName: 'Saca', field: 'isTaskOut', cellRenderer: (params) => {
        return !!params.value ? 'Si' : 'No'
      }},
      { headerName: 'Pase Cortesía', field: 'is_courtesy', cellRenderer: (params) => {
        return !!params.value ? 'Si':'No'
      }},
      { headerName: 'Válido desde', field: 'validFrom', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }},
      { headerName: 'Válido hasta', field: 'validTo', cellRenderer: (params) => {
        const date = (params.value).toDate();
        return format(date, 'MMMM dd yyyy', {
          locale: es
        })
      }}
    ];
    
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true,
     };
    this.detailCellRendererParams = {
      detailGridOptions: {
        columnDefs: [
          { headerName: 'Pase de abordar', field: 'name' },
          { headerName: 'Mete', field: 'isTaskIn', cellRenderer: (params) => {
            return !!params.value ? 'Si' : 'No'
          }},
          { headerName: 'Saca', field: 'isTaskOut', cellRenderer: (params) => {
            return !!params.value ? 'Si' : 'No'
          }},
          { headerName: 'Pase Cortesía', field: 'is_courtesy', cellRenderer: (params) => {
            return !!params.value ? 'Si':'No'
          }},
          { headerName: 'Parada', field: 'stopName' },
          { headerName: 'Válido desde', field: 'validFrom', cellRenderer: (params) => {
            const date = (params.value).toDate();
            return format(date, 'MMMM dd yyyy', {
              locale: es
            })
          }},
          { headerName: 'Válido hasta', field: 'validTo', cellRenderer: (params) => {
            const date = (params.value).toDate();
            return format(date, 'MMMM dd yyyy', {
              locale: es
            })
          }}
        ],
        defaultColDef: { flex: 1 },
      },
      getDetailRowData: function (params) {
        params.successCallback(params.data.passes);
      },
    };
  }

  onFirstDataRendered(params) {
    setTimeout(function () {
      params.api.getDisplayedRowAtIndex(1).setExpanded(false);
    }, 0);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.rowData = this.routesList;
  }

  ngOnInit() {
    this.authService.user.subscribe((user: any) => {
      this.getSubscriptions(user.vendorId);
      this.user = user;
    });

  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();

    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  getSubscriptions(vendorId: string) {
    this.usersService.getBoardingPassesByRoute(vendorId).pipe(
      takeUntil(this.stopSubscription$)
    ).subscribe(data => {
      console.log(data);
      this.rowData = data;
      this.createNestedTableData(data);
      this.createChart(data);
    })
  }

  createNestedTableData(data: any) {
    this.routesList = [];
    this.usersList = [];
    for (let i = 0; i < data.length; ++i) {
      data[i].key = i;
      data[i].expand = false;
      data[i].routeName = data[i].passes[0].routeName;
      for (let x = 0; x < data[i].passes.length; ++x) {
        data[i].passes[x].key = i;
        data[i].passes[x].customerName = data[i].customerName;
        this.usersList.push(data[i].passes[x]);
      }
    }
    console.log(data);
    this.routesList = data;
  }

  createChart(data: any) {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);
      let networkSeries = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries());
      networkSeries.maxLevels = 2;
      networkSeries.minRadius = 20
      networkSeries.maxRadius = 90

      let chartData = [];
      chartData = [{
        name: 'Usuarios',
        children: []
      }];
      data.forEach((route: any) => {

        let object: any = {};
        const passes = route.passes;

        const round1 = _.filter(passes, (p: any) => {
          return p.round == 'Día'
        });
        const round2 = _.filter(passes, (p: any) => {
          return p.round == 'Tarde'
        });

        const stopsRound1 = _(round1)
          .groupBy('stopName')
          .map((items, name) => ({ name, value: items.length }))
          .value();

        const stopsRound2 = _(round2)
          .groupBy('stopName')
          .map((items, name) => ({ name, value: items.length }))
          .value();

        object = {
          name: `${route.customerName} ${passes[0].routeName}`,
          children: [
            {
              name: 'Día',
              children: [...stopsRound1]
            },
            {
              name: 'Tarde',
              children: [...stopsRound2]
            }
          ]
        };
        chartData[0].children.push(object);
      });

      chart.data = chartData;

      networkSeries.dataFields.value = "value";
      networkSeries.dataFields.name = "name";
      networkSeries.dataFields.children = "children";
      networkSeries.nodes.template.tooltipText = "{name}:{value}";
      networkSeries.nodes.template.fillOpacity = 1;

      networkSeries.nodes.template.label.text = "{name}"
      networkSeries.fontSize = 10;

      networkSeries.links.template.strokeWidth = 1;

      let hoverState = networkSeries.links.template.states.create("hover");
      hoverState.properties.strokeWidth = 3;
      hoverState.properties.strokeOpacity = 1;

      networkSeries.nodes.template.events.on("over", function (event) {
        event.target.dataItem.childLinks.each(function (link) {
          link.isHover = true;
        })
        if (event.target.dataItem.parentLink) {
          event.target.dataItem.parentLink.isHover = true;
        }

      })

      networkSeries.nodes.template.events.on("out", function (event) {
        event.target.dataItem.childLinks.each(function (link) {
          link.isHover = false;
        })
        if (event.target.dataItem.parentLink) {
          event.target.dataItem.parentLink.isHover = false;
        }
      })
      this.chart = chart;
    });
  }

}
