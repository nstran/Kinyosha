import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GetPermission } from '../../../shared/permission/get-permission';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts/highstock';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TaskModel } from '../../models/ProjectTask.model';
import { ReSearchService } from '../../../services/re-search.service';
import { ProjectService } from '../../services/project.service';
import 'moment/locale/pt-br';
import { ProjectModel } from '../../models/project.model';
import { SetIconTaskType } from '../../setIcon/setIcon';

// Full canlendar
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendar } from 'primeng';


class dataChart {
  name: string;
  y: number;
  color: string;
}

class ChooseTime {
  label: string;
  value: string;
}

class ChartTaskFollowStatus {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  countTask: number;
  color: string;

  percentValue: number;
}

class ChartTaskFollowTime {
  timeCode: string;
  timeName: string;
  countTask: number;
  color: string;

  percentValue: number;
}

class CharFollowTaskType {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  countTask: number;
}

class ChartTaskFollowResource {
  resouceId: string;
  employeeId: string;
  employeeCodeName: string;
  countTaskComplete: number;
  countTaskNotComplete: number;
  total: number;
}

class ChartTimeFollowResource {
  employeeId: string;
  employeeCodeName: string;
  totalHour: number;
  hourUsed: number;
  hourNotUsed: number;
}

class ChartEvn {
  dateStr: string;
  pv: number;
  ac: number;
  ev: number;
}

class ChartProjectFollowResource {
  projectCode: string;
  projectName: string;
  color: string;
  allowcation: number;
}

class PerformanceCost {
  dateStr: string;
  cpi: number;
  spi: number;
  maxYAxis: number;
}

class Calendar {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  allDay: boolean;
}

class ChartBudget {
  budgetName: string;
  budgetValue: number;
}

@Component({
  selector: 'app-dashboard-project',
  templateUrl: './dashboard-project.component.html',
  styleUrls: ['./dashboard-project.component.css'],
  providers: [DialogService, DatePipe, DecimalPipe]
})
export class DashboardProjectComponent implements OnInit {
  @ViewChild('myTable') myTable: Table;
  @ViewChild('calendar') calendar: FullCalendar;
  auth = JSON.parse(localStorage.getItem("auth"));

  filterGlobal: string;
  innerWidth: number = 0; //number window size first
  loading: boolean = false;
  startDate: Date = new Date();
  minYear: number = 2015;
  currentYear: number = (new Date()).getFullYear();
  currentTimeString = this.convertTimeToString();

  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  projectId: string = '00000000-0000-0000-0000-000000000000';

  today: Date = new Date();
  isShow: boolean = true;

  isManager: boolean = null;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  paramUrl: any;

  //START: BI???N ??I???U KI???N
  fixed: boolean = false;
  withFiexd: string = "";
  //END : BI???N ??I???U KI???N

  /*START: BI???N L??U GI?? TR??? TR??? V???*/
  listTaskOverdue: Array<TaskModel> = []; // Danh s??ch c??ng vi???c qu?? h???n - order by : priority => th???i gian
  listTaskComplete: Array<TaskModel> = []; // Danh s??ch c??ng vi???c c???n ho??n th??nh trong ng??y - order by : priority => th???i gian

  project: ProjectModel = null;
  listProject: Array<ProjectModel> = [];
  selectedProject: ProjectModel = null;

  totalPercent: number = 0; // Ti???n ????? d??? ??n
  totalEstimateTime: string = '0';
  totalHourUsed: string = '0';
  totalEE: number = 0;
  isContainResource: boolean = false;

  listTaskFollowTime: Array<ChartTaskFollowTime> = [];
  listProjectFollowResource: Array<ChartProjectFollowResource> = [];
  listTaskFollowStatus: Array<ChartTaskFollowStatus> = [];
  listTaskFollowTaskType: Array<CharFollowTaskType> = [];
  listTaskFollowResource: Array<ChartTaskFollowResource> = [];
  listChartTimeFollowResource: Array<ChartTimeFollowResource> = [];
  listChartBudget: Array<ChartBudget> = [];

  listChartEvn: Array<ChartEvn> = [];
  listPerformanceCost: Array<PerformanceCost> = [];
  /*END: BI???N L??U GI?? TR??? TR??? V???*/

  /*TABLE*/
  selectedColumnsOverdue: any[];
  colsTaskOverdue: any[];

  selectedColumnsTaskCompleteInDay: any[];
  colsTaskCompleteInDay: any[];

  /*Declare chart*/
  doughnutChartStatus: Chart;
  doughnutChartFollowTime: Chart;



  listTime: Array<ChooseTime> = [
    { label: "Ng??y", value: "Day" },
    { label: "Tu???n", value: "Week" },
    { label: "Th??ng", value: "Month" },
    { label: "N??m", value: "Year" },
  ]

  selectedTime: ChooseTime = this.listTime[1];

  // TH??NG TIN L???CH L??M VI???C
  events: Array<Calendar> = [];
  options: any;

  listEmployee: Array<any> = [];
  selectedEmployee: Array<any> = [];
  totalEvents: Array<Calendar> = [];

  listTaskFollowRerouse: Array<TaskModel> = [];
  listAllTask: Array<TaskModel> = [];

  employee: any;
  isReadonly: boolean = false;
  isShowClear: boolean = true;
  listPermissionResourceActive: string = localStorage.getItem("ListPermissionResource");

  constructor(
    private ref: ChangeDetectorRef,
    private dialogService: DialogService,
    private router: Router,
    private getPermission: GetPermission,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    public reSearchService: ReSearchService,
    private projectService: ProjectService,
    private setIconTaskType: SetIconTaskType
  ) {
    translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.initTable();
    this.setOptionCalendar();
    this.route.params.subscribe(async params => {
      this.projectId = params['projectId'];
      this.getMasterData();
    });
  }

  initTable() {
    this.colsTaskOverdue = [
      { field: 'taskCode', header: 'M?? #', textAlign: 'center', display: 'table-cell', width: '140px', excelWidth: 20, },
      { field: 'taskName', header: 'T??n c??ng vi???c', textAlign: 'left', display: 'table-cell', width: '200px', excelWidth: 30, },
      { field: 'taskTypeName', header: 'Lo???i c??ng vi???c', textAlign: 'left', display: 'table-cell', width: '150px', excelWidth: 25, },
      { field: 'statusName', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell', width: '120px', excelWidth: 25, },
      { field: 'priorityName', header: 'M???c ????? ??u ti??n', textAlign: 'center', display: 'table-cell', width: '160px', excelWidth: 20, },
      { field: 'persionInChargedName', header: 'Ng?????i ph??? tr??ch', textAlign: 'left', display: 'table-cell', width: '160px', excelWidth: 30, },
      { field: 'planEndTimeStr', header: 'Ng??y d??? ki???n h???t h???n', textAlign: 'right', display: 'table-cell', width: '180px', excelWidth: 25, },
      { field: 'actualEndTimeStr', header: 'Ng??y k???t th??c th???c t???', textAlign: 'right', display: 'table-cell', width: '180px', excelWidth: 25, },
    ];
    this.selectedColumnsOverdue = this.colsTaskOverdue;

    this.colsTaskCompleteInDay = [
      { field: 'taskCode', header: 'M?? #', textAlign: 'center', display: 'table-cell', width: '140px', excelWidth: 20, },
      { field: 'taskName', header: 'T??n c??ng vi???c', textAlign: 'left', display: 'table-cell', width: '200px', excelWidth: 30, },
      { field: 'taskTypeName', header: 'Lo???i c??ng vi???c', textAlign: 'left', display: 'table-cell', width: '150px', excelWidth: 25, },
      { field: 'statusName', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell', width: '120px', excelWidth: 25, },
      { field: 'priorityName', header: 'M???c ????? ??u ti??n', textAlign: 'center', display: 'table-cell', width: '160px', excelWidth: 20, },
      { field: 'persionInChargedName', header: 'Ng?????i ph??? tr??ch', textAlign: 'left', display: 'table-cell', width: '160px', excelWidth: 30, },
      { field: 'planEndTimeStr', header: 'Ng??y d??? ki???n h???t h???n', textAlign: 'right', display: 'table-cell', width: '180px', excelWidth: 25, },
    ];

    this.selectedColumnsTaskCompleteInDay = this.colsTaskCompleteInDay;
  }

  getMasterData() {
    this.loading = true;
    this.projectService.getMasterDataCommonDashboardProject(this.projectId, this.auth.UserId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode != 200) {
        this.showMessage('error', result.messageCode);
        return;
      }

      this.isManager = result.isManager;
      this.listTaskOverdue = this.setIconTaskType.setIconTaskTypeInListTask(result.listTaskOverdue);
      this.listTaskComplete = this.setIconTaskType.setIconTaskTypeInListTask(result.listTaskComplete);
      this.project = result.project;
      this.totalEstimateTime = result.totalEstimateHour;
      this.totalHourUsed = result.totalHourUsed;
      this.totalEE = result.totalEE;
      this.totalPercent = result.projectTaskComplete.toFixed(2);
      this.listProject = result.listProject;
      this.selectedProject = this.listProject.find(c => c.projectId == this.projectId);
      this.listAllTask = result.listAllTask;
      this.listEmployee = result.listEmployee;
      this.listTaskFollowRerouse = this.listAllTask;
      this.listChartBudget = result.listChartBudget;

      if (this.listChartBudget.length > 0 && this.isManager) {
        setTimeout(() => {
          this.createBarChartBudget(this.listChartBudget);
        }, 0);
      }

      this.setCalendar();
      // API c???a qu???n l??
      if (this.isManager) {
        this.projectService.getDataDashboardProjectFollowManager(this.projectId, this.selectedTime.value, this.auth.UserId).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.listTaskFollowStatus = result.listTaskFollowStatus ?? [];
            this.listTaskFollowTime = result.listTaskFollowTime ?? [];
            this.listTaskFollowTaskType = result.listTaskFollowTaskType ?? [];
            this.listTaskFollowResource = result.listTaskFollowResource ?? [];
            this.listChartTimeFollowResource = result.listChartTimeFollowResource ?? [];

            setTimeout(() => {
              if (this.listTaskFollowStatus.length > 0) this.createTaskFollowStatusDoughnutChart(this.listTaskFollowStatus);
              if (this.listTaskFollowTime.length > 0) this.createTaskFollowTimeDoughnutChart(this.listTaskFollowTime);
              if (this.listTaskFollowTaskType.length > 0) this.createBarChart(this.listTaskFollowTaskType);
              if (this.listTaskFollowResource.length > 0) this.createBarChartResource(this.listTaskFollowResource);
              if (this.listChartTimeFollowResource.length > 0) this.createBarChartTimeNotUsedOfResource(this.listChartTimeFollowResource);
            }, 0);
          }
        });

        this.projectService.getDataEVNProjectDashboard(this.projectId, this.selectedTime.value, this.auth.UserId).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.listChartEvn = result.listChartEvn ?? [];
            this.listPerformanceCost = result.listPerformanceCost ?? [];
            setTimeout(() => {
              if (this.listChartEvn.length > 0) this.createLineChartEvn(this.listChartEvn);
              if (this.listPerformanceCost.length > 0) this.createLineChartPerformance(this.listPerformanceCost)
            }, 0);
          }
        });
      }
      // API c???a nh??n vi??n
      else {
        this.employee = this.listEmployee.find(x => x.employeeId == this.auth.EmployeeId);
        this.isReadonly = true;
        this.isShowClear = false;

        this.projectService.getDataDashboardProjectFollowEmployee(this.projectId, this.selectedTime.value, this.auth.UserId).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.listTaskFollowTime = result.listTaskFollowTime ?? [];
            this.listProjectFollowResource = result.listProjectFollowResource ?? [];

            setTimeout(() => {
              if (this.listTaskFollowTime.length > 0) this.createTaskFollowTimeDoughnutChart(this.listTaskFollowTime);
              if (this.listProjectFollowResource.length > 0) this.createAuthorizedProjectsBarChart(this.listProjectFollowResource);
            }, 0);
          }
        });
      }
    });
  }

  showMessage(severity: string, detail: string) {
    this.messageService.add({ severity: severity, summary: 'Th??ng b??o', detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  convertTimeToString(): string {
    let now = new Date();
    let day = now.getDay() + 1;
    let stringDay = '';
    let date = now.getDate();
    let stringDate = '';
    let month = now.getMonth() + 1;
    let stringMonth = '';
    let year = now.getFullYear();
    let stringYear = '';

    if (day == 1) {
      stringDay = "Ch??? nh???t"
    } else {
      stringDay = "Th??? " + day;
    }
    stringDate = "ng??y " + date;
    stringMonth = "th??ng " + month;
    stringYear = "n??m " + year;

    return stringDay + ", " + stringDate + " " + stringMonth + " " + stringYear;
  }

  goToListAllTask() {
    this.router.navigate(['/project/list-project-task', { 'projectId': this.projectId }]);
  }

  goToDetail(taskId: string) {
    this.router.navigate(['/project/detail-project-task', { 'taskId': taskId, 'projectId': this.projectId }]);
  }

  onChangeProject(projectId: string) {
    this.router.navigate(['/project/dashboard', { 'projectId': projectId }]);
  }

  /*START: T???O CHART CHO PM*/
  // T???o Doughnut Chart cho t???ng quan t??nh tr???ng c??ng vi???c
  createTaskFollowStatusDoughnutChart(array: Array<ChartTaskFollowStatus>) {
    let height = '';
    if (this.innerWidth <= 1370) {
      height = '100%';
    } else {
      height = '70%';
    }

    let data: Array<dataChart> = [];
    array.forEach((e, index) => {
      let item = new dataChart();
      item.name = `${e.categoryName}`;
      item.y = e.countTask;
      item.color = e.color;

      data = [item, ...data];
    });
    let chart = new Chart({
      chart: {
        type: 'pie',
        alignTicks: false,
        height: height
      },
      title: {
        text: '', //text in center
        align: 'center',
        verticalAlign: 'middle',
        style: { 'color': '#6D98E7', 'font-size': '20px', 'line-height': '10px' }
      },
      credits: {
        enabled: false
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.2f}%'
      },
      series: [{
        name: 'Ti?? l????',
        innerSize: '50%',
        data: data,
      }],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          }
        }
      }
    });
    this.doughnutChartStatus = chart;
  }

  // T???o Doughnut Chart cho ti???n tr??nh c??ng vi???c
  createTaskFollowTimeDoughnutChart(array: Array<ChartTaskFollowTime>) {
    let height = '';
    if (this.innerWidth <= 1370) {
      height = '100%';
    } else {
      height = '70%';
    }

    let data: Array<dataChart> = [];
    array.forEach((e, index) => {
      let item = new dataChart();
      item.name = `${e.timeName}`;
      item.y = e.countTask;
      item.color = e.color;

      data = [item, ...data];
    });
    let chart = new Chart({
      chart: {
        type: 'pie',
        height: height
      },
      title: {
        text: '', //text in center
        align: 'center',
        verticalAlign: 'middle',
        style: { 'color': '#6D98E7', 'font-size': '20px', 'line-height': '10px' }
      },
      credits: {
        enabled: false
      },
      tooltip: {
        pointFormat: '{series.name}: {point.percentage:.2f}%'
      },
      series: [{
        name: 'Ti?? l????',
        innerSize: '50%',
        data: data,
      }],
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          }
        }
      }
    });
    this.doughnutChartFollowTime = chart;
  }

  // T???o Bar Chart ph??n lo???i c??ng vi???c
  createBarChart(array: Array<CharFollowTaskType>) {
    let arrayCate: Array<string> = array.map(x => x.categoryName);
    let data: Array<any> = array.map(x => x.countTask);
    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI'
        }
      }
    });

    Highcharts.chart('container', {
      chart: {
        type: 'column'
      },
      title: {
        style: {
          display: 'none'
        }
      },

      xAxis: {
        categories: arrayCate,
        crosshair: true,
        title: {
          text: ''
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0;font-family:Inter UI">{series.name}: </td>' +
          '<td style="padding:0;font-family:Inter UI"><b> {point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "C??ng vi???c",
        data: data,
      }]
    });
  }

  // T???o Bar Chart ti???n ????? c??ng vi???c theo nh??n vi??n
  createBarChartResource(array: Array<ChartTaskFollowResource>) {
    let arrayCate: Array<string> = array.map(x => x.employeeCodeName);
    let dataComplete: Array<any> = array.map(x => x.countTaskComplete);
    let dataNotComplete: Array<any> = array.map(x => x.countTaskNotComplete);

    let yMax = ParseStringToFloat(array[0].total.toString()) + 10;

    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI'
        }
      }
    });

    (Highcharts as any).chart('container2', {
      chart: {
        type: 'bar'
      },
      title: {
        style: {
          display: 'none'
        }
      },
      xAxis: {
        type: 'category',
        categories: arrayCate,
        tickLength: 0,
        min: 0,
        max: 3,
        scrollbar: {
          enabled: true
        },
      },
      yAxis: {
        min: 0,
        max: yMax,
        title: {
          text: '',
        },
      },
      colors: ['#d7d7d7', '#71b603'],
      plotOptions: {
        bar: {
          allowPointSelect: false,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
          }
        },
        series: {
          stacking: 'normal'
        },
      },
      legend: {
        reversed: true
      },
      series: [
        {
          name: "Ch??a ho??n th??nh",
          data: dataNotComplete,
        },
        {
          name: "Ho??n th??nh",
          data: dataComplete,
        },
      ]
    });
  }

  // T???o Bar Chart th???i gian nh??n r???i c???a nh??n vi??n
  createBarChartTimeNotUsedOfResource(array: Array<ChartTimeFollowResource>) {
    let arrayCate: Array<string> = array.map(x => x.employeeCodeName);
    let data: Array<any> = array.map(x => x.hourNotUsed);
    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI'
        }
      }
    });

    Highcharts.chart('container5', {
      chart: {
        type: 'column'
      },
      title: {
        style: {
          display: 'none'
        }
      },
      xAxis: {
        categories: arrayCate,
        crosshair: true,
        title: {
          text: ''
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0;font-family:Inter UI">{series.name}: </td>' +
          '<td style="padding:0;font-family:Inter UI"><b> {point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "Th???i gian r???nh",
        data: data,
      }]
    });
  }

  // T???o Line chart, ????? th??? ti???n ????? - chi ph?? theo evn
  createLineChartEvn(array: Array<ChartEvn>) {
    let arrayCate: Array<string> = array.map(x => x.dateStr);
    let lstPV: Array<any> = array.map(x => x.pv);
    let lstAC: Array<any> = array.map(x => x.ac);
    let lstEV: Array<any> = array.map(x => x.ev);

    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI'
        }
      }
    });

    Highcharts.chart('container3', {
      title: {
        style: {
          display: 'none'
        }
      },
      xAxis: {
        categories: arrayCate,
        crosshair: true,
        title: {
          text: ''
        }
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom'
      },
      plotOptions: {
        series: {
          // label: {
          //   connectorAllowed: false
          // },
          // pointStart: 2010
        }
      },
      series: [{
        name: 'Gi?? tr??? d??? ki???n (PV)',
        data: lstPV
      }, {
        name: 'Chi ph?? th???c t??? (AC)',
        data: lstAC
      }, {
        name: 'Gi?? tr??? thu ???????c(EV)',
        data: lstEV
      }],
    });
  }

  // T???o line chart, ch??? s??? hi???u su???t chi ph??
  createLineChartPerformance(array: Array<PerformanceCost>) {
    let arrayCate: Array<string> = array.map(x => x.dateStr);
    let lstCPI: Array<any> = array.map(x => x.cpi);
    let lstSPI: Array<any> = array.map(x => x.spi);
    let maxYAxis: number = array.map(x => x.maxYAxis)[0];

    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI'
        }
      }
    });

    Highcharts.chart('container4', {
      title: {
        style: {
          display: 'none'
        }
      },
      xAxis: {
        categories: arrayCate,
        crosshair: true,
        title: {
          text: ''
        }
      },
      yAxis: {
        min: 0,
        max: maxYAxis,
        title: {
          text: '',
        },

      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom'
      },
      plotOptions: {
        series: {
          // general options for all series
        },
        line: {
          // shared options for all line series
        }
      },
      series: [{
        name: 'CPI',
        data: lstCPI,
        type: 'line'
      }, {
        name: 'SPI',
        data: lstSPI,
        type: 'line'
      }],
    });
  }

  changeChooseTime(time: ChooseTime) {
    if (this.isManager) {
      this.loading = true;
      this.projectService.getDataDashboardProjectFollowManager(this.projectId, time.value, this.auth.UserId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listTaskFollowStatus = result.listTaskFollowStatus ?? [];
          this.listTaskFollowTime = result.listTaskFollowTime ?? [];
          this.listTaskFollowTaskType = result.listTaskFollowTaskType ?? [];
          this.listTaskFollowResource = result.listTaskFollowResource ?? [];
          this.listChartTimeFollowResource = result.listChartTimeFollowResource ?? [];

          setTimeout(() => {
            if (this.listTaskFollowStatus.length > 0) this.createTaskFollowStatusDoughnutChart(this.listTaskFollowStatus);
            if (this.listTaskFollowTime.length > 0) this.createTaskFollowTimeDoughnutChart(this.listTaskFollowTime);
            if (this.listTaskFollowTaskType.length > 0) this.createBarChart(this.listTaskFollowTaskType);
            if (this.listTaskFollowResource.length > 0) this.createBarChartResource(this.listTaskFollowResource);
            if (this.listChartTimeFollowResource.length > 0) this.createBarChartTimeNotUsedOfResource(this.listChartTimeFollowResource);
          }, 0);
        }
      });

      this.projectService.getDataEVNProjectDashboard(this.projectId, time.value, this.auth.UserId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listChartEvn = result.listChartEvn ?? [];
          this.listPerformanceCost = result.listPerformanceCost ?? [];
          setTimeout(() => {
            if (this.listChartEvn.length > 0) this.createLineChartEvn(this.listChartEvn);
            if (this.listPerformanceCost.length > 0) this.createLineChartPerformance(this.listPerformanceCost)
          }, 0);
        }
      });
    }
    else {
      this.employee = this.listEmployee.find(x => x.employeeId == this.auth.EmployeeId);
      this.isReadonly = true;
      this.isShowClear = false;

      this.projectService.getDataDashboardProjectFollowEmployee(this.projectId, this.selectedTime.value, this.auth.UserId).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.listTaskFollowTime = result.listTaskFollowTime ?? [];
          this.listProjectFollowResource = result.listProjectFollowResource ?? [];

          setTimeout(() => {
            if (this.listTaskFollowTime.length > 0) this.createTaskFollowTimeDoughnutChart(this.listTaskFollowTime);
            if (this.listProjectFollowResource.length > 0) this.createAuthorizedProjectsBarChart(this.listProjectFollowResource);
          }, 0);
        }
      });
    }
  }
  /*END: T???O CHART CHO PM*/

  /*START: TH??NG TIN L???CH L??M VI???C*/
  setOptionCalendar() {
    this.options = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locale: 'vi',
      defaultDate: new Date(),
      defaultView: 'timeGridWeek',
      eventMinHeight: 50,
      weekends: false,
      // height: 350,
      header: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,
      buttonText: {
        dayGridMonth: 'Th??ng',
        timeGridWeek: 'Tu???n',
        timeGridDay: 'Ng??y',
      },
      eventClick: (event) => {
        this.goToDetail(event.event.id);
      }

    }
  }

  // T???o Bar Chart cho c??c d??? ??n ??c giao
  createAuthorizedProjectsBarChart(array: Array<ChartProjectFollowResource>) {
    let arrayCate: Array<string> = array.map(x => x.projectCode);
    let data: Array<any> = array.map(x => x.allowcation);
    let total = data.reduce((total, currentValue) => total + currentValue);
    let color = '';

    arrayCate.push('T???ng');
    data.push(total);

    if (total > 100) {
      color = '#E30B0B';
    }
    else if (85 <= total && total <= 100) {
      color = '#70B603';
    }
    else {
      color = '#ffce3b';
    }

    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI'
        }
      }
    });

    Highcharts.chart('container7', {
      chart: {
        type: 'column'
      },
      title: {
        style: {
          display: 'none'
        }
      },
      colors: [color],
      xAxis: {
        categories: arrayCate,
        crosshair: true,
        title: {
          text: ''
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0;font-family:Inter UI">{series.name}: </td>' +
          '<td style="padding:0;font-family:Inter UI"><b> {point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      legend: {
        enabled: false
      },
      series: [{
        name: "% Ph??n b???",
        data: data,
      }]
    });
  }

  setCalendar() {
    this.events = [];
    if (this.listTaskFollowRerouse) {
      this.listTaskFollowRerouse.forEach(item => {
        let meeting = new Calendar();
        meeting.id = item.taskId;
        meeting.start = new Date(item.planStartTime);
        meeting.end = new Date(new Date(item.planEndTime).setDate(new Date(item.planEndTime).getDate() + 1));
        meeting.allDay = true;
        meeting.backgroundColor = item.backgroundColorForStatus;
        if (item.includeWeekend) {
          if (item.persionInChargedName) {
            meeting.title = ` ${item.persionInChargedName} - ${item.taskCode} - ${item.taskName}, ${item.estimateHour} gi???, T??nh cu???i tu???n`;
          }
          else {
            meeting.title = ` ${item.taskCode} - ${item.taskName}, ${item.estimateHour} gi???, T??nh cu???i tu???n`;
          }
        }
        else {
          if (item.persionInChargedName) {
            meeting.title = ` ${item.persionInChargedName} - ${item.taskCode} - ${item.taskName}, ${item.estimateHour} gi???`;
          }
          else {
            meeting.title = ` ${item.taskCode} - ${item.taskName}, ${item.estimateHour} gi???`;
          }
        }

        this.events = [...this.events, meeting];
      });
    }
    this.totalEvents = this.events;
  }

  changeEventFullCalendar(els: any) {
    if (els) {
      let task = this.listAllTask.find(c => c.taskId == els.event.id);
      if (task.statusCode == "NEW") {
        let startDate = null
        if (els.event.start) {
          startDate = convertToUTCTime(els.event.start)
        }
        let endDate = null;
        if (els.event.end) {
          endDate = convertToUTCTime(els.event.end);
        }
        let message: string = '';
        if (els.event.end) {
          // message = "B???n c?? mu???n ch???nh s???a th???i gian l???ch h???n b???t ?????u t??? : " + this.datePipe.transform(els.event.start, "h:mm dd/MM/yyyy ") + " ?????n " + this.datePipe.transform(els.event.end, "h:mm dd/MM/yyyy");
        } else {
          // message = "B???n c?? mu???n ch???nh s???a th???i gian l???ch h???n b???t ?????u t??? : " + this.datePipe.transform(els.event.start, "h:mm dd/MM/yyyy ");
        }
      } else {
        this.loading = true;
        this.projectService.getMasterDataCommonDashboardProject(this.projectId, this.auth.UserId).subscribe(response => {
          let result: any = response;
          this.loading = false;
          this.isManager = result.isManager;
          this.listTaskOverdue = this.setIconTaskType.setIconTaskTypeInListTask(result.listTaskOverdue);
          this.project = result.project;
          this.totalEstimateTime = result.totalEstimateHour;
          this.totalHourUsed = result.totalHourUsed;
          this.totalEE = result.totalEE;
          this.totalPercent = result.projectTaskComplete.toFixed(2);
          this.listProject = result.listProject;
          this.selectedProject = this.listProject.find(c => c.projectId == this.projectId);
          this.listAllTask = result.listAllTask;
          this.listEmployee = result.listEmployee;
          this.listTaskFollowRerouse = this.listAllTask;
          this.setCalendar();
          // API c???a qu???n l??
        });
      }
    }
  }

  handleEventClick(eventClick: any) {
    if (eventClick) {
    }
  }

  changeEmployee(employee: any) {
    if (employee) {
      this.listTaskFollowRerouse = this.listAllTask.filter(c => employee.listTaskId.includes(c.taskId));
      this.setCalendar();
    } else {
      this.listTaskFollowRerouse = this.listAllTask;
      this.setCalendar();
    }
  }

  /*END: TH??NG TIN L???CH L??M VI???C*/

  // T???o Bar Chart ng??n s??ch d??? ??n
  createBarChartBudget(array: Array<ChartBudget>) {
    let arrayCate: Array<string> = array.map(x => x.budgetName);
    let dataBudget: Array<any> = array.map(x => x.budgetValue);

    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'Inter UI',
        },
      }
    });

    Highcharts.chart('container6', {
      chart: {
        type: 'bar',
        height: 200
      },
      title: {
        style: {
          display: 'none'
        }
      },
      xAxis: {
        type: 'category',
        categories: arrayCate,
        tickLength: 0,
        min: 0,
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
      },
      // colors: ['#d7d7d7', '#71b603'],
      plotOptions: {
        bar: {
          allowPointSelect: false,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
          }
        },
        series: {
          stacking: 'normal'
        },
      },
      legend: {
        reversed: true
      },
      series: [
        {
          name: "Ng??n s??ch",
          data: dataBudget,
        },
      ]
    });
  }
}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
