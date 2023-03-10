import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GetPermission } from '../../../shared/permission/get-permission';

import { SelectItem, SortEvent } from 'primeng/api';
import { MenuItem, OverlayPanel } from "primeng/primeng";
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import * as $ from 'jquery';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { DatePipe, DecimalPipe, formatNumber } from '@angular/common';
import { TaskModel } from '../../models/ProjectTask.model';
import { ReSearchService } from '../../../services/re-search.service';
import { ProjectService } from '../../services/project.service';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { ProjectModel } from '../../models/project.model';
import { TimeSheet } from '../../models/timeSheet.model';
import { TimeSheetDialogComponent } from '../time-sheet-dialog/time-sheet-dialog.component';
import { runInThisContext } from 'vm';

class Project {
  projectId: string;
  projectCode: string;
  projectName: string;
  projectCodeName: string;
}

class Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
}

class Employee {
  public employeeId: string;
  public employeeName: string;
  public employeeCode: string;
  public active: boolean;
}

class InforExportExcel {
  companyName: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  textTotalMoney: string
}

@Component({
  selector: 'app-search-time-sheet',
  templateUrl: './search-time-sheet.component.html',
  styleUrls: ['./search-time-sheet.component.css'],
  providers: [DialogService, DatePipe, DecimalPipe]
})
export class SearchTimeSheetComponent implements OnInit {
  listProjectTitle: Array<Project> = [];
  selectedProject: Project = null;

  @ViewChild('myTable') myTable: Table;
  auth = JSON.parse(localStorage.getItem("auth"));
  filterGlobal: string;
  innerWidth: number = 0; //number window size first
  loading: boolean = false;
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  customerCode: string = '';
  startDate: Date = new Date();
  minYear: number = 2015;
  currentYear: number = (new Date()).getFullYear();
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  isManager: boolean = null;
  isGlobalFilter: string = '';
  actions: MenuItem[] = [];
  projectId: string = '00000000-0000-0000-0000-000000000000';
  today: Date = new Date();
  isShow: boolean = true;

  week: string = '';

  stateOptions: SelectItem[];
  selectedOption: string = "week";
  selectedTimeSheet: Array<TimeSheet> = [];

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  paramUrl: any;
  inforExportExcel: InforExportExcel;


  //START: BI???N ??I???U KI???N
  fixed: boolean = false;
  withFiexd: string = "";
  //END : BI???N ??I???U KI???N

  /* Action*/
  actionAdd: boolean = true;
  actionDownload: boolean = true;
  actionDelete: boolean = true;
  actionEdit: boolean = true;
  /*END*/

  /*TABLE*/
  selectedColumns: any[];
  cols: any[];

  /*START: BI???N L??U GI?? TR??? TR??? V???*/
  listTimeStyle: Array<Category> = [];
  listStatus: Array<Category> = [];
  listPersionInCharged: Array<Employee> = [];
  employee: Employee;

  project: ProjectModel = null;
  totalPercent: number = 0; // Ti???n ????? d??? ??n
  totalEstimateTime: string = '0';
  isContainResource: boolean = false;
  rowGroupMetadata: any;

  listTimeSheet: Array<TimeSheet> = [];
  isRoot: boolean = false;
  totalHourUsed: number = 0;
  /*END: BI???N L??U GI?? TR??? TR??? V???*/

  /*SEARCH VALUE*/
  fromDate: Date = null;
  toDate: Date = null;
  listSeletedStatus: Array<Category> = [];
  listSelectedTimeType: Array<Category> = [];
  listSelectedEmployee: Array<Employee> = [];

  /*T??? CH???I*/
  displayReject: boolean = false;
  descriptionReject: string = '';

  /*PH?? DUY???T*/
  displayApproval: boolean = false;
  descriptionApproval: string = '';

  isSingle: boolean = false;

  timeSheet: TimeSheet;

  //Id c???a ng??y mu???n ph?? duy???t
  dayId = '';

  tools: object = {
    type: 'Expand',
    items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
      'Outdent', 'Indent', '|',
      'CreateLink']
  };

  ischeck = 0;

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
  ) {
    translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.initTable();
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      this.stateOptions = [
        { label: "T???t c???", value: "all" },
        { label: "Tu???n", value: "week" },
      ];
      this.getMasterData();
    });
  }

  ngAfterViewInit() {
    this.ref.detectChanges();
  }

  initTable() {
    this.cols = [
      // { field: 'statusName', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell', width: '120px', excelWidth: 20, },
      { field: 'weekName', header: 'Tu???n', textAlign: 'left', display: 'table-cell', width: '160px', excelWidth: 30, },
      { field: 'personInChargeName', header: 'Ng?????i ph??? tr??ch', textAlign: 'left', display: 'table-cell', width: '150px', excelWidth: 25, },
      { field: 'taskCodeName', header: 'C??ng vi???c', textAlign: 'left', display: 'table-cell', width: '220px', excelWidth: 40, },
      { field: 'timeTypeName', header: 'Lo???i th???i gian', textAlign: 'left', display: 'table-cell', width: '120px', excelWidth: 18, },
      { field: 'monday', header: 'Hai', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'tuesday', header: 'Ba', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'wednesday', header: 'T??', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'thursday', header: 'N??m', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'friday', header: 'S??u', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'saturday', header: 'B???y', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'sunday', header: 'CN', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
      { field: 'spentHour', header: 'T???ng', textAlign: 'center', display: 'table-cell', width: '60px', excelWidth: 10, },
    ];
    this.selectedColumns = this.cols;
  }

  getMasterData() {
    this.loading = true;
    this.projectService.getMasterDataSearchTimeSheet(this.projectId, this.auth.UserId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode === 200) {
        this.listProjectTitle = result.listProject;
        this.listProjectTitle.forEach(item => {
          item.projectCodeName = `[${item.projectCode}]: ${item.projectName}`;
        });
        this.selectedProject = this.listProjectTitle.find(c => c.projectId == this.projectId);
        this.listStatus = result.listStatus;
        this.listTimeStyle = result.listTimeStyle;
        this.listPersionInCharged = result.listEmployee;
        this.inforExportExcel = result.inforExportExcel;
        this.fromDate = result.fromDate;
        this.toDate = result.toDate;
        this.totalHourUsed = result.totalHourUsed;
        this.week = `Th??? 2 ng??y ${this.datePipe.transform(this.fromDate, 'dd/MM/yyyy')} - Ch??? nh???t ng??y ${this.datePipe.transform(this.toDate, 'dd/MM/yyyy')}`;

        this.isRoot = result.isRoot;
        this.project = result.project;
        this.totalPercent = result.projectTaskComplete.toFixed(2);
        this.totalEstimateTime = result.totalEstimateHour;
        this.searchTimeSheet();

      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', result.messageCode);
      }
    });
  }

  tickAllTimeSheet(checkValue){
    // this.selectedTimeSheet = this.listTimeSheet;
    // if (checkValue) {
    //   if(!this.isRoot) this.selectedTimeSheet = this.selectedTimeSheet.filter(x => x.statusCode != 'DPD' &&  x.statusCode != 'GPD');
    //   if(this.isRoot) this.selectedTimeSheet = this.selectedTimeSheet.filter(x =>  x.statusCode != 'TCKB' && x.statusCode != 'DPD');
    // }else{
    //   this.selectedTimeSheet = []
    // }
  }

  searchTimeSheet() {
    let fromDate = this.fromDate ? convertToUTCTime(new Date(this.fromDate)) : null;
    let toDate = this.toDate ? convertToUTCTime(new Date(this.toDate)) : null;

    let lstStatusId: Array<string> = [];
    if (this.listSeletedStatus) {
      lstStatusId = this.listSeletedStatus.map(c => c.categoryId);
    }
    let lstTimeTypeId: Array<string> = [];
    if (this.listSelectedTimeType) {
      lstTimeTypeId = this.listSelectedTimeType.map(c => c.categoryId);
    }
    let lstEmployeeId: Array<string> = [];
    if (this.listSelectedEmployee) {
      lstEmployeeId = this.listSelectedEmployee.map(c => c.employeeId);
    }
    let isShowAll = this.selectedOption == "all" ? true : false;
    this.loading = true;
    this.projectService.searchTimeSheet(this.projectId, fromDate, toDate, lstStatusId, lstTimeTypeId, lstEmployeeId, isShowAll, this.auth.UserId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode === 200) {
        this.listTimeSheet = result.listTimeSheet;
        if (this.listTimeSheet.length == 0) {
          this.clearToast();
          this.showToast('warn', 'Th??ng b??o', "Kh??ng t??m th???y b???n ghi n??o!");
        }
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', result.messageCode);
      }
    });
  }

  resetTable() {
    this.filterGlobal = '';
    if (!this.myTable) return;
    this.myTable.sortOrder = 0;
    this.myTable.sortField = '';
    this.myTable.reset();
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  goToCreate() {
    this.router.navigate(['/project/create-project-task']);
  }

  leftColNumber: number = 12;
  rightColNumber: number = 2;
  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 8;
        this.rightColNumber = 4;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
  }

  refreshFilter() {
    this.listSeletedStatus = [];
    this.listSelectedTimeType = [];
    this.listSelectedEmployee = [];

    this.isGlobalFilter = '';
    this.resetTable();

    this.searchTimeSheet();
  }

  dateFieldFormat: string = 'DD/MM/YYYY';
  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];

      /**Customize sort date */
      if (event.field == 'planEndTime') {
        const date1 = moment(value1, this.dateFieldFormat);
        const date2 = moment(value2, this.dateFieldFormat);

        let result: number = -1;
        if (moment(date2).isBefore(date1, 'day')) { result = 1; }

        return result * event.order;
      }
      /**End */

      let result = null;

      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
    });
  }

  nextWeek() {
    this.fromDate = addDays(this.fromDate, 7);
    this.toDate = addDays(this.toDate, 7);
    let weekName = `Th??? 2 ng??y ${this.datePipe.transform(this.fromDate, 'dd/MM/yyyy')} - Ch??? nh???t ng??y ${this.datePipe.transform(this.toDate, 'dd/MM/yyyy')}`;
    this.week = weekName;
    this.searchTimeSheet();
  }

  nextDoubleWeek() {
    this.fromDate = addDays(this.fromDate, 14);
    this.toDate = addDays(this.toDate, 14);
    let weekName = `Th??? 2 ng??y ${this.datePipe.transform(this.fromDate, 'dd/MM/yyyy')} - Ch??? nh???t ng??y ${this.datePipe.transform(this.toDate, 'dd/MM/yyyy')}`;
    this.week = weekName;
    this.searchTimeSheet();
  }

  previousWeek() {
    this.fromDate = addDays(this.fromDate, -7);
    this.toDate = addDays(this.toDate, -7);
    let weekName = `Th??? 2 ng??y ${this.datePipe.transform(this.fromDate, 'dd/MM/yyyy')} - Ch??? nh???t ng??y ${this.datePipe.transform(this.toDate, 'dd/MM/yyyy')}`;
    this.week = weekName;
    this.searchTimeSheet();
  }

  previousDoubleWeek() {
    this.fromDate = addDays(this.fromDate, -14);
    this.toDate = addDays(this.toDate, -14);
    let weekName = `Th??? 2 ng??y ${this.datePipe.transform(this.fromDate, 'dd/MM/yyyy')} - Ch??? nh???t ng??y ${this.datePipe.transform(this.toDate, 'dd/MM/yyyy')}`;
    this.week = weekName;
    this.searchTimeSheet();
  }

  sendApproval() {
    if (this.selectedTimeSheet.length == 0) {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', "Ch??a c?? b???n ghi n??o ???????c ch???n!");
    } else {
      this.confirmationService.confirm({
        message: 'B???n c?? ch???c ch???n mu???n g???i ph?? duy???t c??c b???n ghi ???? ch???n?',
        accept: () => {
          let timeSheet = new TimeSheet;

          let listTimeSheetSelectedId = this.selectedTimeSheet.map(c => c.timeSheetId);
          this.loading = true;
          this.projectService.updateStatusTimeSheet(listTimeSheetSelectedId, 'SEND_APPROVAL', '', this.auth.UserId,timeSheet).subscribe(response => {
            let result: any = response;
            this.loading = false;
            if (result.statusCode == 200) {
              this.clearToast();
              this.showToast('success', 'Th??ng b??o', "G???i ph?? duy???t th??nh c??ng.");
              this.getMasterData();
              this.selectedTimeSheet = [];
            } else {
              this.clearToast();
              this.showToast('error', 'Th??ng b??o', "G???i ph?? duy???t th???t b???i!");
            }
          });
        }
      });
    }
  }

  approvalSingleTimeSheet() {
    let timeSheet = new TimeSheet;
    let listTimeSheetSelectedId: Array<string> = [this.timeSheet.timeSheetId]
    this.loading = true;

    this.projectService.updateStatusTimeSheet(listTimeSheetSelectedId, 'APPROVAL', this.descriptionApproval, this.auth.UserId,timeSheet).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.clearToast();
        this.showToast('success', 'Th??ng b??o', "Ph?? duy???t khai b??o th??nh c??ng.");
        this.resetDataSelected();
        this.getMasterData();
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', "Ph?? duy???t khai b??o th???t b???i!");
      }
    });
  }

  rejectSingleTimeSheet() {
    let timeSheet = new TimeSheet;

    let listTimeSheetSelectedId: Array<string> = [this.timeSheet.timeSheetId]
    this.loading = true;
    this.projectService.updateStatusTimeSheet(listTimeSheetSelectedId, 'REJECT', this.descriptionReject, this.auth.UserId,timeSheet).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.clearToast();
        this.showToast('success', 'Th??ng b??o', "T??? ch???i khai b??o th??nh c??ng.");
        this.resetDataSelected();
        this.getMasterData();
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', "T??? ch???i khai b??o th???t b???i!");
      }
    });
  }

  confrimApprovalMutilTimeSheet() {
    if (this.selectedTimeSheet.length == 0) {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', "Ch??a c?? b???n ghi n??o ???????c ch???n!");
    } else {
      this.displayApproval = true;
      this.isSingle = false;
    }
  }

  approvalMultiTimeSheet() {
    let timeSheet = new TimeSheet;

    let listTimeSheetSelectedId = this.selectedTimeSheet.map(c => c.timeSheetId);
        this.loading = true;
        this.projectService.updateStatusTimeSheet(listTimeSheetSelectedId, 'APPROVAL', this.descriptionApproval, this.auth.UserId,timeSheet).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.clearToast();
            this.showToast('success', 'Th??ng b??o', "Ph?? duy???t khai b??o th??nh c??ng.");
            this.resetDataSelected();
            this.getMasterData();
          } else {
            this.clearToast();
            this.showToast('error', 'Th??ng b??o', "Ph?? duy???t khai b??o th???t b???i!");
          }
        });
  }

  confirmRejectMutilTimeSheet() {
    if (this.selectedTimeSheet.length == 0) {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', "Ch??a c?? b???n ghi n??o ???????c ch???n!");
    } else {
      this.displayReject = true;
      this.isSingle = false;
    }
  }

  rejectMultiTimeSheet() {
    let timeSheet = new TimeSheet;
    let listTimeSheetSelectedId = this.selectedTimeSheet.map(c => c.timeSheetId);
    this.loading = true;
    this.projectService.updateStatusTimeSheet(listTimeSheetSelectedId, 'REJECT', this.descriptionReject, this.auth.UserId,timeSheet).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.clearToast();
        this.showToast('success', 'Th??ng b??o', "T??? ch???i khai b??o th??nh c??ng.");
        this.resetDataSelected();
        this.getMasterData();
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', "T??? ch???i khai b??o th???t b???i!");
      }
    });
  }

  resetDataSelected() {
    this.selectedTimeSheet = [];
    this.displayApproval = false;
    this.displayReject = false;
    this.descriptionApproval = '';
    this.descriptionReject = '';
    this.isSingle = true;
  }

  goToTaskDetail(rowData: TimeSheet) {
    this.router.navigate(['/project/detail-project-task', { 'taskId': rowData.taskId, 'projectId': this.projectId }]);
  }

  createTimeSheet() {
    let width = '';
    if (window.innerWidth < 500) {
      width = '100%';
    } else {
      width = '60%';
    }

    let ref = this.dialogService.open(TimeSheetDialogComponent, {
      data: {
        projectId: this.projectId,
        taskId: null,
      },
      styleClass: 'timesheet-dialog',
      header: 'Th??m chi ti???t th???i gian',
      width: width,
      baseZIndex: 1030,
      closeOnEscape: true,
      closable: true,
      contentStyle: {
        "min-height": "300px",
        "max-height": "700px",
        "overflow": "auto !important",
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result == true) {
        this.getMasterData();
      }
    });
  }

  openTimeSheetDialog(rowData: TimeSheet) {
    let width = '';
    if (window.innerWidth < 500) {
      width = '100%';
    } else {
      width = '60%';
    }

    let ref = this.dialogService.open(TimeSheetDialogComponent, {
      data: {
        projectId: this.projectId,
        taskId: rowData.taskId,
        timeSheetId: rowData.timeSheetId,
      },
      styleClass: 'timesheet-dialog',
      header: 'Th??m chi ti???t th???i gian',
      width: width,
      baseZIndex: 1030,
      closeOnEscape: true,
      closable: true,
      contentStyle: {
        "min-height": "300px",
        "max-height": "700px",
        "overflow": "auto !important",
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result == true) {
        this.getMasterData();
      }
    });
  }

  selectCar(event,id, overlaypanel: OverlayPanel) {
    if(this.isRoot) overlaypanel.toggle(event);
    this.dayId = id;
  }

  //check == true: ph?? duy???t
  //check == false: t??? ch???i
  acceptOrRejectByDay(check){
    let message
    if(check) message = 'B???n c?? ch???c ch???n mu???n ph?? duy???t b???n ghi ???? ch???n?'
    if(!check) message = 'B???n c?? ch???c ch???n mu???n t??? ch???i ph?? duy???t b???n ghi ???? ch???n?'
    this.confirmationService.confirm({
      message: message,
      accept: () => {
        this.projectService.acceptOrRejectByDay(this.dayId,check).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.clearToast();
            this.showToast('success', 'Th??ng b??o', "T??c v??? th??nh c??ng.");
            this.resetDataSelected();
            this.getMasterData();
          } else {
            this.clearToast();
            this.showToast('error', 'Th??ng b??o', "T??c v??? kh??ng th??nh c??ng!");
          }
        });
      }
    });
  }

  onChangeAction(rowData: TimeSheet) {
    this.actions = [];
    let approval: MenuItem = {
      id: '1', label: 'Ph?? duy???t', icon: 'pi pi-check', command: () => {
        // this.approvalSingleTimeSheet(rowData);
        this.timeSheet = rowData;
        this.displayApproval = true;
        this.isSingle = true;
      }
    }
    let reject: MenuItem = {
      id: '2', label: 'T??? ch???i', icon: 'pi pi-times', command: () => {
        // this.rejectSingleTimeSheet(rowData);
        this.timeSheet = rowData;
        this.displayReject = true;
        this.isSingle = true;
      }
    }
    let detail: MenuItem = {
      id: '3', label: 'Chi ti???t', icon: 'pi pi-pencil', command: () => {
        this.openTimeSheetDialog(rowData);
      }
    }
    if (rowData.statusCode == "GPD") {
      this.actions.push(approval);
      this.actions.push(reject);
    }
    this.actions.push(detail);
  }

  getBase64Logo() {
    let base64Logo = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "Logo");
    return base64Logo?.systemValueString;
  }

  exportExcel() {
    let title = 'DANH S??CH KHAI B??O TH???I GIAN';

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('BAO_CAO');

    let imgBase64 = this.getBase64Logo();
    /* Image */
    var imgLogo = workbook.addImage({
      base64: imgBase64,
      extension: 'png',
    });
    worksheet.addImage(imgLogo, {
      tl: { col: 0, row: 0 },
      ext: { width: 200, height: 100 }
    });

    let dataRow1 = [];
    dataRow1[5] = this.inforExportExcel.companyName.toUpperCase();  //T??n c??ng ty
    let row1 = worksheet.addRow(dataRow1);
    row1.font = { name: 'Times New Roman', size: 10, bold: true };
    worksheet.mergeCells(`E${row1.number}:M${row1.number}`);
    row1.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow2 = [];
    dataRow2[5] = '?????a ch???: ' + this.inforExportExcel.address;  //?????a ch???
    let row2 = worksheet.addRow(dataRow2);
    row2.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`E${row2.number}:M${row2.number}`);
    row2.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow3 = [];
    dataRow3[5] = '??i???n tho???i: ' + this.inforExportExcel.phone;  //S??? ??i???n tho???i
    let row3 = worksheet.addRow(dataRow3);
    row3.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`E${row3.number}:M${row3.number}`);
    row3.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow4 = [];
    dataRow4[5] = 'Email: ' + this.inforExportExcel.email;
    let row4 = worksheet.addRow(dataRow4);
    row4.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`E${row4.number}:M${row4.number}`);
    row4.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow5 = [];
    dataRow5[5] = 'Website d???ch v???: ' + this.inforExportExcel.website;  //?????a ch??? website
    let row5 = worksheet.addRow(dataRow5);
    row5.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`E${row5.number}:M${row5.number}`);
    row5.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    /* title */
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { family: 4, size: 16, bold: true };
    titleRow.height = 25;
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells(`A${titleRow.number}:M${titleRow.number}`);

    /* header */
    const header = this.cols.map(e => e.header);
    let headerRow = worksheet.addRow(header);
    headerRow.font = { bold: true };
    header.forEach((item, index) => {
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    /* data table */
    let data = this.listTimeSheet.map((item, index) => {
      let row = [];
      row.push(item.statusName); /* Tr???ng th??i */
      row.push(item.weekName); /* Tu???n*/
      row.push(item.personInChargeName); /* Ng?????i khai b??o*/
      row.push(item.taskCodeName); /* C??ng vi???c*/
      row.push(item.timeTypeName); /* Lo???i th???i gian*/
      row.push(item.monday); /* Th??? 2*/
      row.push(item.tuesday);  /* Th??? 3*/
      row.push(item.wednesday);  /* Th??? 4*/
      row.push(item.thursday);  /* Th??? 5*/
      row.push(item.friday);  /* Th??? 6*/
      row.push(item.saturday);  /* Th??? 7*/
      row.push(item.sunday);  /* Ch??? nh???t*/
      row.push(item.spentHour);  /* T???ng*/
      return row;
    });

    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      this.cols.forEach((item, index) => {
        row.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: item.textAlign, wrapText: true };
        row.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
    });

    /* set width */
    this.cols.forEach((item, index) => {
      worksheet.getColumn(index + 1).width = item.excelWidth;
    });

    /* k?? t??n */

    worksheet.addRow([]);
    worksheet.addRow([]);

    let footer1 = [];
    footer1[5] = 'Ng??y.....th??ng.....n??m..........';
    let rowFooter1 = worksheet.addRow(footer1);
    worksheet.mergeCells(`E${rowFooter1.number}:F${rowFooter1.number}`);
    rowFooter1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    this.exportToExel(workbook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    });
  }

  onChangeProject(projectId: string) {
    this.router.navigate(['/project/search-time-sheet', { 'projectId': projectId }]);
  }
}

function addDays(dates: Date, days: number) {
  const date = new Date(dates);
  date.setDate(date.getDate() + days);
  return date;
};

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
