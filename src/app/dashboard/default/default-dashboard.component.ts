import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeConstantService } from '../../shared/services/theme-constant.service';
import { DashboardService } from 'src/app/shared/services/admin/dashboard.service';
import * as firebase from 'firebase';

@Component({
    templateUrl: './default-dashboard.component.html'
})

export class DefaultDashboardComponent implements OnInit, OnDestroy {

    themeColors = this.colorConfig.get().colors;
    blue = this.themeColors.blue;
    blueLight = this.themeColors.blueLight;
    cyan = this.themeColors.cyan;
    cyanLight = this.themeColors.cyanLight;
    gold = this.themeColors.gold;
    purple = this.themeColors.purple;
    purpleLight = this.themeColors.purpleLight;
    red = this.themeColors.red;

    taskListIndex = 0;
    isSpinning = true;
    dbInfo;
    sub: any;

    constructor(
        private colorConfig: ThemeConstantService,
        private dashboardService: DashboardService
    ) { }

    ratingChartFormat = 'revenueMonth';

    ratingChartData: Array<any> = [{
        data: [30, 60, 50, 85, 65, 75],
        label: 'Series A'
    }];
    currentratingChartLabelsIdx = 1;
    ratingChartLabels: Array<any> = ['16th',  '18th',  '20th',  '22th',  '24th',  '26th'];
    ratingChartOptions: any = {
        maintainAspectRatio: false,
        responsive: true,
        hover: {
            mode: 'nearest',
            intersect: true
        },
        tooltips: {
            mode: 'index'
        },
        elements: {
            line: {
                tension: 0.2,
                borderWidth: 2
            }
        },
        scales: {
            xAxes: [{
                gridLines: [{
                    display: false,
                }],
                ticks: {
                    display: true,
                    fontColor: this.themeColors.grayLight,
                    fontSize: 13,
                    padding: 10
                }
            }],
            yAxes: [{
                display: false
            }],
        }
    };
    ratingChartColors: Array<any> = [
        {
            backgroundColor: this.themeColors.transparent,
            borderColor: this.blue,
            pointBackgroundColor: this.blue,
            pointBorderColor: this.themeColors.white,
            pointHoverBackgroundColor: this.blueLight,
            pointHoverBorderColor: this.blueLight
        }
    ];
    ratingChartType = 'line';

    salesChartOptions: any = {
        scaleShowVerticalLines: false,
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            xAxes: [{
                categoryPercentage: 0.35,
                barPercentage: 0.70,
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: 'Month'
                },
                gridLines: false,
                ticks: {
                    display: true,
                    beginAtZero: true,
                    fontSize: 13,
                    padding: 10
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: 'Value'
                },
                gridLines: {
                    drawBorder: false,
                    offsetGridLines: false,
                    drawTicks: false,
                    borderDash: [3, 4],
                    zeroLineWidth: 1,
                    zeroLineBorderDash: [3, 4]
                },
                ticks: {
                    max: 80,
                    stepSize: 20,
                    display: true,
                    beginAtZero: true,
                    fontSize: 13,
                    padding: 10
                }
            }]
        }
    };
    salesChartLabels: string[] = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    salesChartType = 'bar';
    salesChartColors: Array<any> = [
        {
            backgroundColor: this.themeColors.purple,
            borderWidth: 0
        },
        {
            backgroundColor: this.themeColors.purpleLight,
            borderWidth: 0
        }
    ];
    salesChartData: any[] = [
        {
            data: [20, 30, 35, 45, 55, 45],
            label: 'Online'
        },
        {
            data: [25, 35, 40, 50, 60, 50],
            label: 'Offline'
        }
    ];

    ordersList = [
        {
            id: 5331,
            name: 'Erin Gonzales',
            avatar: 'assets/images/avatars/thumb-1.jpg',
            date: '8 May 2019',
            amount: 137,
            status: 'approved',
            checked : false
        },
        {
            id: 5375,
            name: 'Darryl Day',
            avatar: 'assets/images/avatars/thumb-2.jpg',
            date: '6 May 2019',
            amount: 322,
            status: 'approved',
            checked : false
        },
        {
            id: 5762,
            name: 'Marshall Nichols',
            avatar: 'assets/images/avatars/thumb-3.jpg',
            date: '1 May 2019',
            amount: 543,
            status: 'approved',
            checked : false
        },
        {
            id: 5865,
            name: 'Virgil Gonzales',
            avatar: 'assets/images/avatars/thumb-4.jpg',
            date: '28 April 2019',
            amount: 876,
            status: 'pending',
            checked : false
        },
        {
            id: 5213,
            name: 'Nicole Wyne',
            avatar: 'assets/images/avatars/thumb-5.jpg',
            date: '28 April 2019',
            amount: 241,
            status: 'approved',
            checked : false
        }
    ];

    summaryFormat = () => `$3,531`;

    ngOnInit() {
        this.sub = this.dashboardService.getDashboardItems().subscribe((dashboard) => {
            this.dbInfo = dashboard;
            this.isSpinning = false;
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    async testFunction() {
        // Example to test function
        // example document found in /customers/bhVPtLhw799SafldadsM/live/MyrZvNh4bBzQ1Dm9ogUK
        // bring snap data into a controllable const
        const createdProgram: any = {
            active: true,
            capacity: 1,
            startAt: firebase.firestore.Timestamp.fromDate(new Date()),
            count: 0,
            customerId: 'bhVPtLhw799SafldadsM',
            round: 'Día',
            routeDescription: 'Universidad',
            routeId: '9IvEW4xvvvvciSVm6x5m',
            routeName: 'Universidad'
        };

  // get all users that are to be notified
  const usersSnapshot = await firebase.firestore()
    .collection('users')
    .where('customerId', '==', createdProgram.customerId).get();
 

  // if there are users to be notified
  if (!usersSnapshot.empty) {
      
      // clear tokens list
      let tokens: any[] = [];
      
      usersSnapshot.forEach((userDoc:any) => {

        const id = userDoc.id;
        const data = userDoc.data();
        const user = {id, ...data };
        let userNotificationToken = user.token ? user.token : null;
        let routeDesc: String = "";
        // check if the user actually have a notification token to create him/her a custom notification payload
        if(userNotificationToken) {
          const hasPassValidation = !!user.passValidation || false;
          const defaultRoundValue = user.defaultRound ? user.defaultRound : "";
          const defaultRoute = user.defaultRoute ? user.defaultRoute : "";
          
          if(hasPassValidation){
            const areEqualRound = user.defaultRound == user.passValidation.lastUsedRound || false;
            const areEqualRoute = user.defaultRoute == user.passValidation.lastUsedRoute || false;
            const lastValidUsageValue =  user.passValidation.lastValidUsage ? user.passValidation.lastValidUsage : false;
            const lastUsedRoundValue = user.passValidation.lastUsedRound ? user.passValidation.lastUsedRound : "";
            const lastUsedRouteValue = user.passValidation.lastUsedRoute ? user.passValidation.lastUsedRoute : "";
            if (areEqualRound && areEqualRoute ){ 
              // any is valid dafault or pass validation
              if (defaultRoundValue== createdProgram.round && defaultRoute == createdProgram.routeId)
              {
                routeDesc = createdProgram.routeName;
              }
            } else {
              // use pass validation
              if (lastUsedRoundValue == createdProgram.round && lastUsedRouteValue == createdProgram.routeId && lastValidUsageValue == true)
              {
                routeDesc = createdProgram.routeName;
              }
            }
          } else {
            // no valid pass use default
              if (defaultRoundValue == createdProgram.round && defaultRoute == createdProgram.routeId)
              {
                routeDesc = createdProgram.routeName;
              }
          }
          

          var usertime = new Date(createdProgram.startAt);
          // create custom notification payload
          const payload = {
            notification: {
              title: `¡La ruta ${routeDesc} está por iniciar`,
              body: `${user.firstName}, La ruta  ${routeDesc}, esta por comenzar, hora estimada de inicio :  ${usertime.toLocaleTimeString('es-MX')} , recuerda estar en la parada 10 min antes.`
            },
            data: {
              title: '¡Tu ruta esta por iniciar',
              body: `${user.firstName}, La ruta  ${routeDesc}, esta por comenzar, hora estimada de inicio :  ${usertime.toLocaleTimeString('es-MX')} , recuerda estar en la parada 10 min antes.`,
              color: 'primary',
              position: 'top',
              buttons: JSON.stringify([{
                  text: 'Ok',
                  role: 'cancel',
                  handler: "console.log('Cancel clicked')",
              }])
            }
          };
          // This user will be added to tokens notifications array 
          if (routeDesc.length > 0){
          tokens.push({
            token: userNotificationToken,
            payload: payload
          });
        }
        } else {
          // TODO: Once we can be sure it all works, we can remove console.log
          console.log('User ' + user.displayName + 'userId: ', user.uid,  ' found, but does not have a token to be used for notification');
        }
      });

      //Check tokens array has elements
      if(tokens.length > 0) {

        //TODO: Remove this once we can check notifications where sent
        console.log('tokens and users payload created: ', JSON.stringify(tokens));
        
        return tokens.forEach( async (userToNotify:any) => {
          // send a FCM (Firebase Cloud Messaging)
        //   const sendFCMNotification = await admin.messaging().sendToDevice(userToNotify.token, userToNotify.payload)
        //   sendFCMNotification
        console.log('send notification to user: ', userToNotify.token, userToNotify.payload);
        
        })
      } else {
        // Users found does not have a token to be used for notification, so no user will be notified
        // TODO: Once we can be sure it all works, we can remove console.log
        console.log('Users found but none have a token to be used for notification');
        return;
        
      }
    } else {
      // No users to be notified
      // TODO: Once we can be sure it all works, we can remove console.log
      console.log('No users found to be notified.');
      return;
    }
    }
}
