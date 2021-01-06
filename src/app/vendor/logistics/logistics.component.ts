import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core'
import { ThemeConstantService } from '../../shared/services/theme-constant.service';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { startOfToday, endOfToday, format, fromUnixTime } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import * as _ from 'lodash';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { IActivityLog, ColumnDefs } from 'src/app/logistics/classes';
import { LogisticsService } from 'src/app/logistics/services.service';
import { GeoJson, FeatureCollection } from 'src/app/logistics/map';

am4core.useTheme(am4themes_animated);

declare var mapboxgl: any;

@Component({
  selector: 'app-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.css']
})
export class LogisticsComponent implements OnInit {

  @ViewChild('map', { static: true }) mapElement: ElementRef;


  visible = false;

  lat = 37.75;
  lng = -122.41;
  loading = false;

  // mapData
  map: any = mapboxgl.Map;
  source: any;
  markers: any;


  columnDefs = ColumnDefs;

  rowData: IActivityLog[];
  activityList: IActivityLog[];
  startDate: Date;
  endDate: Date;

  private chart: am4charts.XYChart;
  chartData: any;
  gridApi: any;
  gridColumnApi: any;

  constructor(
    private logisticsService: LogisticsService,
    private zone: NgZone
  ) {
    this.markers = [] as GeoJson[];
    this.startDate = startOfToday()
    this.endDate = endOfToday();
  }

  ngOnInit() {
    this.markers = this.logisticsService.getMarkers(this.startDate, this.endDate);
    this.loadData();
    this.initializeMap();
  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  ngAfterViewInit() {


    // Add data
    // chart.data = this.chartData;

    // Create axes
    let chart = am4core.create("chartdiv", am4charts.SankeyDiagram);

    this.logisticsService.getChartData(this.startDate, this.endDate).pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { vehicle: data.vehicle, round: data.round, route: data.routeName, program: data.program, value: 1 }
        });
      })
    )
      .subscribe((result: any) => {
        console.log(result);
        // this.chartData = _.countBy(result, 'country');

        this.zone.runOutsideAngular(() => {

          
          chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

          let groupA = [...result.reduce((r, o) => {
            const key = o.round + '-' + o.program;
            
            const item = r.get(key) || Object.assign({}, o, {
              from: o.round,
              to: o.program,
              values: 0
            });
            
            item.values += o.value;
            
            return r.set(key, item);
          }, new Map).values()];

          let groupB = [...result.reduce((r, o) => {
            const key = o.round + '-' + o.program + '-' + o.route;
            
            const item = r.get(key) || Object.assign({}, o, {
              from: o.program,
              to: o.route,
              values: 0
            });
            
            item.values += o.value;
            
            return r.set(key, item);
          }, new Map).values()];

          let groupC = [...result.reduce((r, o) => {
            const key = o.round + '-' + o.program + '-' + o.route + '-' + o.vehicle;
            
            const item = r.get(key) || Object.assign({}, o, {
              from: o.route,
              to: o.vehicle,
              values: 0
            });
            
            item.values += o.value;
            
            return r.set(key, item);
          }, new Map).values()];

          let groupD = [...result.reduce((r, o) => {
            const key = o.round + '-' + o.program + '-' + o.route + '-' + o.vehicle;
            
            const item = r.get(key) || Object.assign({}, o, {
              from: o.vehicle,
              to: o.program == 'M' ? 'Prepa 2' : 'Salida',
              values: 0
            });
            
            item.values += o.value;
            
            return r.set(key, item);
          }, new Map).values()];

          // chart.data = [
          //   { from: "A", to: "D", value: 10 },
          //   { from: "B", to: "D", value: 8 },
          //   { from: "B", to: "E", value: 4 },
          //   { from: "C", to: "E", value: 3 },
          //   { from: "D", to: "G", value: 5 },
          //   { from: "D", to: "I", value: 2 },
          //   { from: "D", to: "H", value: 3 },
          //   { from: "E", to: "H", value: 6 },
          //   { from: "G", to: "J", value: 5 },
          //   { from: "I", to: "J", value: 1 },
          //   { from: "H", to: "J", value: 9 }
          // ];

          chart.data = groupA.concat(groupB, groupC, groupD);

          console.log(chart.data);
          let hoverState = chart.links.template.states.create("hover");
          hoverState.properties.fillOpacity = 0.6;

          chart.dataFields.fromName = "from";
          chart.dataFields.toName = "to";
          chart.dataFields.value = "values";

          // for right-most label to fit
          chart.paddingRight = 60;

          // make nodes draggable
          let nodeTemplate = chart.nodes.template;
          nodeTemplate.inert = true;
          nodeTemplate.readerTitle = "Drag me!";
          nodeTemplate.showSystemTooltip = true;
          nodeTemplate.width = 20;

          // make nodes draggable
          // let nodeTemplate = chart.nodes.template;
          nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
          nodeTemplate.showSystemTooltip = true;
          nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer
        });
      });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  initializeMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.map.flyTo({
          center: [this.lng, this.lat]
        })
      });
    }
    this.buildMap()

  }

  formatDate(date:any ) {
    return format(fromUnixTime(date.seconds), 'HH:mm', { locale: esLocale });
  }

  buildMap() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: this.mapElement.nativeElement,
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 10,
      pitch: 45,
      bearing: -17.6,
      center: [this.lng, this.lat]
    });


    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());

    /// Add realtime firebase data on map load
    this.map.on('load', (event) => {

      this.map.resize();

      /// register source
      this.map.addSource('firebase', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      /// get source
      this.source = this.map.getSource('firebase')

      /// subscribe to realtime database and set data source
      this.markers.pipe(
        map((actions: any) => {
          return actions.map(a => {
            const arrayLatLng = (a.payload.doc.data().location).split(',');
            const coordinates = [arrayLatLng[1], arrayLatLng[0]]
            const message = a.payload.doc.data().studentName;
            const newMarker = new GeoJson(coordinates, { message: message });
            return newMarker;
          });
        })
      )
        .subscribe(markers => {
          console.log(markers);
          let data = new FeatureCollection(markers)
          this.source.setData(data)
        })

      const layers = this.map.getStyle().layers;

      let labelLayerId;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      /// create map layers with realtime data
      this.map.addLayer({
        id: 'firebase',
        source: 'firebase',
        type: 'symbol',
        layout: {
          'text-field': '{message}',
          'text-size': 12,
          'icon-image': 'rocket-15',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#f16624',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      });

      this.map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': .6
        }
      }, labelLayerId);

    })

  }

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: data.geometry.coordinates
    })
  }

  loadMap() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    const map = new mapboxgl.Map({
      container: this.mapElement.nativeElement,
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      center: [this.lng, this.lat]
    });
    // Add map controls
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
      map.resize();

      // marker
      new mapboxgl.Marker()
        .setLngLat([this.lng, this.lat])
        .addTo(map);
      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;

      let labelLayerId;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': .6
        }
      }, labelLayerId);
    });
  }

  loadData() {
    this.logisticsService.getActivityLog(this.startDate, this.endDate).pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return data;
        });
      })
    )
      .subscribe((result: IActivityLog[]) => {
        console.log(result);
        this.rowData = result;
        this.activityList = this.rowData.slice(0, 5);
        this.chartData = _.map(x => {
          return { country: x.vehicle, visits: x.studentId }
        })
      });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
}

}