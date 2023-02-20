import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Chart, ChartData } from 'chart.js';

import { Router, ActivatedRoute } from '@angular/router';
import { CompanyConfigModel } from '../shared/models/companyConfig.model';
import { BreadCrumMenuModel } from '../shared/models/breadCrumMenu.model';
import { ChangepasswordComponent } from '../shared/components/changepassword/changepassword.component';
import { UserprofileComponent } from "../userprofile/userprofile.component"
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { EventEmitterService } from '../shared/services/event-emitter.service';
import { NotificationService } from '../shared/services/notification.service';
import { DashboardHomeService } from '../shared/services/dashboard-home.service';
import { AuthenticationService } from '../shared/services/authentication.service';
// Full canlendar
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';

import * as $ from 'jquery';
import { GetPermission } from '../shared/permission/get-permission';
import { FullCalendar } from 'primeng/fullcalendar';
import { title } from 'process';
import { utc } from 'moment';
import { MeetingDialogComponent } from '../customer/components/meeting-dialog/meeting-dialog.component';
import { DialogService } from 'primeng';
import { ListOrderSearch } from '../shared/models/re-search/list-order-search.model';
import { ReSearchService } from '../services/re-search.service';
import { ChartEvents } from 'highcharts';

class delayProductionOrder {
  productionOrderId: string;
  productionOrderCode: string;
  customerName: string;
  areaRemain: number;
  endDate: Date;
}

class totalProductionOrderInDashBoard {
  customerName: string;
  endDate: Date;
  statusCode: string;
  listTotalQuantityByTechniqueRequest: Array<totalQuantityByTechniqueRequestModel>;
  productionOrderCode: string;
  productionOrderId: string;
  statusName: string;
  isDeplay: boolean;
  constructor() {
    this.listTotalQuantityByTechniqueRequest = [];
    this.isDeplay = true;
  }
}

class totalQuantityByTechniqueRequestModel {
  techniqueRequestId: string;
  totalQuantityCompleted: number;
  totalQuantityHaveToComplete: number;
  statusName: string;//trạng thái hiển thị trên table
}

class techniqueRequest {
  techniqueRequestId: string;
  techniqueName: string;
  techniqueRequestCode: string;
  completeAreaInDay: number;
}

interface Quote {
  quoteId: string;
  quoteCode: string;
  amount: number;
  objectTypeId: string;
  objectType: string;
  customerName: string;
  customerContactId: string;
  seller: string;
  sellerName: string;
  quoteDate: Date;
}

interface Customer {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  picName: string;
  picContactId: string;
  dateOfBirth: Date;
}

interface Order {
  orderId: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  amount: number;
  seller: string;
  sellerName: string;
  sellerContactId: string;
}

interface CustomerMeeting {
  customerMeetingId: string;
  customerId: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  title: string;
  content: string;
  locationMeeting: string;
  customerName: string;
  employeeName: string;
  createByName: string;
  participants: string;
  isCreateByUser: boolean;
}

interface LeadMeeting {
  leadMeetingId: string;
  leadId: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  title: string;
  content: string;
  locationMeeting: string;
  leadName: string;
  employeeName: string;
  createByName: string;
  isShowLink: boolean;
}

interface Employee {
  employeeId: string;
  employeeName: string;
  organizationId: string;
  organizationName: string;
  positionId: string;
  positionName: string;
  dateOfBirth: Date;
  contactId: string;
}

class Calendar {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  participants: string;
  isCreateByUser: boolean;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  providers: [DatePipe],
})
export class HomeComponent implements OnInit {
  @ViewChild("toggleNotifi") toggleNotifi: ElementRef;
  isOpenNotifi: boolean = false;

  @ViewChild("toggleConfig") toggleConfig: ElementRef;
  isOpenConfig: boolean = false;

  @ViewChild("toggleCreateElement") toggleCreateElement: ElementRef;
  isOpenCreateElement: boolean = false;

  @ViewChild("toggleUser") toggleUser: ElementRef;
  isOpenUser: boolean = false;

  @ViewChild("dropdownMenus") dropdownMenus: ElementRef;

  @ViewChild("calendar") calendar: FullCalendar;
  /**/
  listPermissionResource: Array<string> = localStorage
    .getItem("ListPermissionResource")
    .split(",");
  listPermissionResourceActive: string = localStorage.getItem(
    "ListPermissionResource"
  );
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  applicationName = this.getDefaultApplicationName();
  listModule: Array<string> = [];
  listResource: Array<string> = [];
  lstBreadCrumLeftMenu: Array<BreadCrumMenuModel> = [];
  lstBreadCrum: Array<BreadCrumMenuModel> = [];
  listParticipants: Array<Employee> = [];
  /*Module name*/
  moduleCrm = "crm"; //Module Quản trị quan hệ khách hàng
  moduleSal = "sal"; //Module Quản lý bán hàng
  moduleBuy = "buy"; //Module Quản lý mua hàng
  moduleAcc = "acc"; //Module Quản lý tài chính
  moduleRec = "rec"; //Module Quản lý tuyển dụng
  moduleHrm = "hrm"; //Module Quản trị nhân sự
  moduleSalary = "salary"; //Module Quản lý lương
  moduleAss = "ass"; //Module Quản lý tài sản
  moduleSys = "sys"; //Module Quản trị hệ thống

  /*End*/

  isCustomer = false;
  isSales = false;
  isShopping = false;
  isAccounting = false;
  isHrm = false;
  isWarehouse = false;
  isProject = false;
  companyConfigModel = new CompanyConfigModel();
  isToggleCick: Boolean = false;

  notificationNumber: number = 0;
  NotificationContent: string;
  notificationList: Array<any> = [];
  auth: any = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;

  username: string;
  userAvatar: string;
  userFullName: string;
  userEmail: string;
  dialogRef: MatDialogRef<ChangepasswordComponent>;
  dialogPopup: MatDialogRef<UserprofileComponent>;

  // full calendar
  events: Array<Calendar> = [];
  options: any;

  lstSubmenuLevel3: Array<BreadCrumMenuModel> = [
    //Quan ly he thong
    //{
    //  Name: "Cấu hình thông tin chung",
    //  Path: "/admin/company-config",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "settings",
    //  IsDefault: true,
    //  CodeParent: "sys_chttc",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
    //{
    //  Name: "Cấu hình thư mục",
    //  Path: "/admin/folder-config",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "settings",
    //  IsDefault: true,
    //  CodeParent: "sys_chtm",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
    //{
    //  Name: "Quản lý thông báo",
    //  Path: "/admin/notifi-setting-list",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "settings",
    //  IsDefault: true,
    //  CodeParent: "sys_tb",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
    //{
    //  Name: "Quản lý mẫu Email",
    //  Path: "/admin/email-configuration",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "device_hub",
    //  IsDefault: true,
    //  CodeParent: "Systems_QLE",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
    {
      Name: "Sơ đồ tổ chức",
      Path: "/admin/organization",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "device_hub",
      IsDefault: true,
      CodeParent: "sys_sdtc",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Tham số hệ thống",
      Path: "/admin/system-parameter",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "settings_applications",
      IsDefault: true,
      CodeParent: "sys_tsht",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Quản lý người dùng",
      Path: "/employee/list",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "filter_list",
      IsDefault: true,
      CodeParent: "sys_phkh",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Quản lý nhóm quyền",
      Path: "/admin/permission",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: true,
      CodeParent: "sys_nq",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Quản lý danh mục",
      Path: "/admin/masterdata",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "category",
      IsDefault: true,
      CodeParent: "sys_dldm",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Quản lý thông báo",
      Path: "/admin/notifi-setting-list",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "settings",
      IsDefault: true,
      CodeParent: "sys_tb",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Quản lý quy trình",
      Path: "/admin/danh-sach-quy-trinh",
      ObjectType: "sys",
      LevelMenu: 3,
      Active: false,
      nameIcon: "swap_horiz",
      IsDefault: true,
      CodeParent: "sys_qtlv",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    //{
    //  Name: "Phân hạng khách hàng",
    //  Path: "/admin/config-level-customer",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "filter_list",
    //  IsDefault: true,
    //  CodeParent: "sys_phkh",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
    //{
    //  Name: "Nhật ký hệ thống",
    //  Path: "/admin/audit-trace",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "menu_book",
    //  IsDefault: true,
    //  CodeParent: "sys_log",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
    //{
    //  Name: "Kế hoạch kinh doanh",
    //  Path: "/admin/business-goals",
    //  ObjectType: "sys",
    //  LevelMenu: 3,
    //  Active: false,
    //  nameIcon: "menu_book",
    //  IsDefault: true,
    //  CodeParent: "sys_khkd",
    //  LstChildren: [],
    //  Display: "none",
    //  Code: "",
    //},
  ];

  /*Data chart revenue employee*/
  dataRevenueEmployee: any;
  optionsRevenueEmployee: any;
  /*End*/

  /*Data chart Chance*/
  dataChance: any;
  optionsDataChance: any;
  /*End*/

  isManager: boolean = false;

  colsQuote: Array<any> = [];
  colsCustomer: Array<any> = [];
  colsOrder: Array<any> = [];
  colsCustomerMeeting: Array<any> = [];
  colsCusBirthdayOfWeek: Array<any> = [];
  colsEmployeeBirthDayOfWeek: Array<any> = [];
  selectedColsCustomerMeeting: Array<any> = [];
  colsLeadMeeting: Array<any> = [];
  selectedColsLeadMeeting: Array<any> = [];

  totalSalesOfWeek: number = 0;
  totalSalesOfMonth: number = 0;
  totalSalesOfQuarter: number = 0;
  totalSalesOfYear: number = 0;
  chiTieuDoanhThuTuan: number = 0;
  chiTieuDoanhThuThang: number = 0;
  chiTieuDoanhThuQuy: number = 0;
  chiTieuDoanhThuNam: number = 0;

  totalSalesOfWeekPress: number = 0;
  totalSalesOfMonthPress: number = 0;
  totalSalesOfQuarterPress: number = 0;
  totalSalesOfYearPress: number = 0;

  salesOfWeek: number = 0;
  salesOfMonth: number = 0;
  salesOfQuarter: number = 0;
  salesOfYear: number = 0;

  listQuote: Array<Quote> = [];
  listCustomer: Array<Customer> = [];
  listOrderNew: Array<Order> = [];
  listCustomerMeeting: Array<CustomerMeeting> = [];
  listLeadMeeting: Array<LeadMeeting> = [];
  listCusBirthdayOfWeek: Array<Customer> = [];
  listEmployeeBirthDayOfWeek: Array<Employee> = [];

  lstSubmenuLevel1: Array<BreadCrumMenuModel> = [
    //Module Home
    {
      Name: "Trang chủ",
      Path: "",
      ObjectType: "hrm",
      LevelMenu: 1,
      Active: true,
      nameIcon: "fa-home",
      IsDefault: true,
      CodeParent: "Employee_Module",
      Display: "block",
      LstChildren: [],
      Code: "",
    },
    //Module hàng hóa
    {
      Name: "Quản lý hàng hóa",
      Path: "",
      ObjectType: "sal",
      LevelMenu: 1,
      Active: false,
      nameIcon: "fa-street-view",
      IsDefault: false,
      CodeParent: "Sale_Module",
      Display: "none",
      LstChildren: [
        {
          Name: "Nguyên vật liệu",
          Path: "/product/list",
          ObjectType: "sales",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-binoculars",
          IsDefault: false,
          CodeParent: "sal_spdv",
          Display: "none",
          LstChildren: [],
          Code: "",
        },
        {
          Name: "Công cụ/Dụng cụ",
          Path: "/product/list-congcu",
          ObjectType: "sales",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-file-archive-o",
          IsDefault: false,
          CodeParent: "sal_spdv",
          Display: "none",
          LstChildren: [],
          Code: "",
        },
        {
          Name: "Thành phẩm",
          Path: "/product/list-thanhpham",
          ObjectType: "sales",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-file-archive-o",
          IsDefault: false,
          CodeParent: "sal_spdv",
          Display: "none",
          LstChildren: [],
          Code: "",
        },
      ],
      Code: "",
    },
    // Module Quản lý kho
    {
      Name: "Quản lý kho",
      Path: "",
      ObjectType: "war",
      LevelMenu: 1,
      Active: false,
      nameIcon: "fa-cubes",
      IsDefault: false,
      CodeParent: "Warehouse_Module",
      Display: "none",
      LstChildren: [
        {
          Name: "Quản lý kho",
          Path: "",
          ObjectType: "warehouse",
          LevelMenu: 2,
          Active: true,
          nameIcon: "fa-binoculars",
          IsDefault: false,
          Display: "none",
          CodeParent: "war_kho",
          LstChildren: [
            {
              Name: "Danh sách kho",
              Path: "/warehouse/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-binoculars",
              IsDefault: true,
              CodeParent: "war_kho",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Đề nghị xuất kho",
          Path: "",
          ObjectType: "warehouse",
          LevelMenu: 2,
          Active: true,
          nameIcon: "fa-file-archive-o",
          IsDefault: false,
          Display: "none",
          CodeParent: "war_dnxk",
          LstChildren: [
            {
              Name: "Danh sách đề nghị",
              Path: "/warehouse/de-nghi-xuat-kho/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-binoculars",
              IsDefault: true,
              CodeParent: "war_dnxk",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Kho NVL, CCDC",
          Path: "",
          ObjectType: "warehouse",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-quote-right",
          IsDefault: false,
          CodeParent: "war_nvl_ccdc",
          Display: "none",
          LstChildren: [
            {
              Name: "Nhập kho",
              Path: "/warehouse/inventory-receiving-voucher/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-binoculars",
              IsDefault: true,
              CodeParent: "war_nvl_ccdc",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Xuất kho",
              Path: "/warehouse/inventory-delivery-voucher/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-binoculars",
              IsDefault: true,
              CodeParent: "war_nvl_ccdc",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Báo cáo tồn kho",
              Path: "/warehouse/in-stock-report/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-binoculars",
              IsDefault: true,
              CodeParent: "war_nvl_ccdc",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Kiểm kê kho",
              Path: "/warehouse/kiem-ke-kho/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-binoculars",
              IsDefault: true,
              CodeParent: "war_nvl_ccdc",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Kho thành phẩm",
          Path: "",
          ObjectType: "warehouse",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-pencil-square-o",
          IsDefault: false,
          CodeParent: "war_ktp",
          Display: "none",
          LstChildren: [
            {
              Name: "Kho xuất",
              Path: "/warehouse/thanh-pham-xuat/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "war_ktp",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Kho nhập",
              Path: "/warehouse/thanh-pham-nhap/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-terminal",
              IsDefault: true,
              CodeParent: "war_ktp",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Báo cáo tồn kho",
              Path: "/warehouse/kho-thanh-pham/bao-cao-ton-kho",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-terminal",
              IsDefault: true,
              CodeParent: "war_ktp",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Kho sản xuất",
          Path: "",
          ObjectType: "warehouse",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-cog",
          IsDefault: false,
          CodeParent: "war_ksx",
          Display: "none",
          LstChildren: [
            {
              Name: "Nhập kho",
              Path: "/warehouse/kho-san-xuat-nhap/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "war_ksx",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Xuất kho",
              Path: "/warehouse/danh-sach-xuat-kho/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-terminal",
              IsDefault: true,
              CodeParent: "war_ksx",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Tồn Kho",
              Path: "/warehouse/bao-cao-ton-kho-san-xuat/list",
              ObjectType: "warehouse",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-terminal",
              IsDefault: true,
              CodeParent: "war_ksx",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
      ],
      Code: "",
    },
    //Module quản lý sản xuất
    {
      Name: "Quản lý sản xuất",
      Path: "",
      ObjectType: "man",
      LevelMenu: 1,
      Active: false,
      nameIcon: "fa fa-cogs",
      IsDefault: false,
      CodeParent: "Manufacturing_Module",
      Display: "none",
      LstChildren: [
        {
          Name: "Quản lý quy trình",
          Path: "",
          ObjectType: "manufacture",
          LevelMenu: 2,
          Active: true,
          nameIcon: "fa fa-exchange",
          IsDefault: false,
          Display: "none",
          CodeParent: "MAN_QLQT",
          LstChildren: [
            {
              Name: "Quản lý danh mục",
              Path: "/manufacture/process-management/list",
              ObjectType: "manufacture",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "MAN_QLQT",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
            {
              Name: "Cấu hình quy trình",
              Path: "/manufacture/product-order-workflow/list",
              ObjectType: "manufacture",
              LevelMenu: 3,
              Active: false,
              nameIcon: "fa-terminal",
              IsDefault: true,
              CodeParent: "MAN_QLQT",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Lệnh sản xuất",
          Path: "",
          ObjectType: "manufacture",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-cog",
          IsDefault: false,
          Display: "none",
          CodeParent: "MAN_TDSX",
          LstChildren: [
            {
              Name: "Danh sách lệnh sản xuất",
              Path: "/manufacture/production-order/list",
              ObjectType: "manufacture",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "MAN_TDSX",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Theo dõi sản xuất",
          Path: "",
          ObjectType: "manufacture",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-pencil-square-o",
          IsDefault: false,
          Display: "none",
          CodeParent: "MAN_RP_QC",
          LstChildren: [
            {
              Name: "Danh sách theo dõi",
              Path: "/manufacture/track-production/track",
              ObjectType: "manufacture",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "MAN_RP_QC",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Báo cáo nhân sự",
          Path: "",
          ObjectType: "manufacture",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-file-archive-o",
          IsDefault: false,
          Display: "none",
          CodeParent: "MAN_RP_NS",
          LstChildren: [
            {
              Name: "Danh sách báo cáo",
              Path: "/manufacture/hr-report/list",
              ObjectType: "manufacture",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "MAN_RP_NS",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
        {
          Name: "Nhật ký sản xuất",
          Path: "",
          ObjectType: "manufacture",
          LevelMenu: 2,
          Active: false,
          nameIcon: "fa-quote-right",
          IsDefault: false,
          Display: "none",
          CodeParent: "MAN_RP_SX",
          LstChildren: [
            {
              Name: "Danh sách báo cáo",
              Path: "/manufacture/manufacture-report/list",
              ObjectType: "manufacture",
              LevelMenu: 3,
              Active: false,
              nameIcon: "u39.png",
              IsDefault: true,
              CodeParent: "MAN_RP_SX",
              LstChildren: [],
              Display: "none",
              Code: "",
            },
          ],
          Code: "",
        },
      ],
      Code: "",
    },
  ];

  listEmployee: Array<any> = [];
  selectedEmployee: Array<any> = [];
  totalEvents: Array<Calendar> = [];

  productionStatusModel: any = [];
  productionStatusData: any = [];

  /*BAR CHART*/
  @ViewChild("canvas_2") canvas_2: ElementRef;
  @ViewChild("canvas") canvas: ElementRef;
  barChart: Chart;
  barChartData: ChartData = {
    datasets: [],
    labels: [],
  };

  barChartStage: Chart;
  barChartDataStage: ChartData = {
    datasets: [],
    labels: [],
  };

  stateList: any = [];
  selectColBarChart: any;
  lstDetailBarChart: any = [];
  displayDetail: boolean = false;
  colDetailBar: any;
  colors = [
    "#7cb5ec",
    "#434348",
    "#00aefd",
    "#ffa400",
    "#07a787",
    "#ff7870",
    "yellow",
    "#e74c3c",
    "#2979ff",
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventEmitterService: EventEmitterService,
    private getPermission: GetPermission,
    private notiService: NotificationService,
    private dashboardHomeService: DashboardHomeService,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private renderer: Renderer2,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    public reSearchService: ReSearchService
  ) {
    $("body").addClass("sidebar-collapse");
    this.renderer.listen("window", "click", (e: Event) => {
      if (this.toggleNotifi) {
        //ẩn hiện khi click Thông báo
        if (this.toggleNotifi.nativeElement.contains(e.target)) {
          this.isOpenNotifi = !this.isOpenNotifi;
        } else {
          this.isOpenNotifi = false;
        }

        //ẩn hiện khi click Tạo mới
        if (this.toggleCreateElement.nativeElement.contains(e.target)) {
          this.isOpenCreateElement = !this.isOpenCreateElement;
        } else {
          this.isOpenCreateElement = false;
        }

        //ẩn hiện khi click Config
        if (this.toggleConfig.nativeElement.contains(e.target)) {
          this.isOpenConfig = !this.isOpenConfig;
        } else {
          this.isOpenConfig = false;
        }

        //ẩn hiện khi click User
        if (this.toggleUser.nativeElement.contains(e.target)) {
          this.isOpenUser = !this.isOpenUser;
        } else {
          this.isOpenUser = false;
        }
      }

      if (this.dropdownMenus) {
        // ẩn hiện khi click menu items Tạo mới
        if (this.dropdownMenus.nativeElement.contains(e.target)) {
          this.isOpenCreateElement = !this.isOpenCreateElement;
        } else {
          this.isOpenCreateElement = false;
        }
      }
    });
  }

  ngOnInit() {
    this.getPemistion();
    this.getListModuleAndResource();
    this.getNotification();
    this.isManager =
      localStorage.getItem("IsManager") === "true" ? true : false;
    this.username = localStorage.getItem("Username");
    // this.userAvatar = localStorage.getItem("UserAvatar");
    this.userAvatar = "";
    this.userFullName = localStorage.getItem("UserFullName");
    this.userEmail = localStorage.getItem("UserEmail");

    //var leftMenu = localStorage.getItem('lstBreadCrumLeftMenu');

    var leftMenu = JSON.stringify(this.lstSubmenuLevel1);

    this.lstBreadCrumLeftMenu = [];
    this.lstBreadCrumLeftMenu = JSON.parse(leftMenu);

    var X = localStorage.getItem("menuMapPath");
    this.lstBreadCrum = JSON.parse(X);

    //kiem tra xem co toggle ko
    if ($("body").hasClass("sidebar-collapse")) {
      this.isToggleCick = true;
    } else {
      this.isToggleCick = false;
    }

    if (localStorage.getItem("IsAdmin") == "true") {
      localStorage.setItem("menuIndex", "admin");
    }

    if (this.eventEmitterService.subsVar == undefined) {
      this.eventEmitterService.subsVar =
        this.eventEmitterService.invokeFirstComponentFunction.subscribe(
          (name: string) => {
            this.updateLeftMenu();
          }
        );
    }

    //Call Update IsToggle với eventEmitterService
    if (this.eventEmitterService.subsVar2 == undefined) {
      this.eventEmitterService.subsVar2 =
        this.eventEmitterService.invokeUpdateIsToggleFunction.subscribe(
          (name: string) => {
            this.updateLeftIsToggle();
          }
        );
    }

    this.getMasterData();

    //setting full calendar
    this.options = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      defaultDate: new Date(),
      header: {
        left: "prev,next",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      editable: true,
      buttonText: {
        dayGridMonth: "Tháng",
        timeGridWeek: "Tuần",
        timeGridDay: "Ngày",
      },
      eventClick: this.handleEventClick.bind(this),
      eventDrop: (event) => {
        // if (event.event._def.extendedProps.isCreateByUser) {
        // } else {
        //   let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Bạn không có quyền sửa lịch hẹn này' };
        //   this.showMessage(msg);
        // }
        this.changeEventFullCalendar(event);
      },
      eventResize: (event) => {
        // if (event.event._def.extendedProps.isCreateByUser) {
        // } else {
        //   let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Bạn không có quyền sửa lịch hẹn này' };
        //   this.showMessage(msg);
        // }
        this.changeEventFullCalendar(event);
      },
      selectOverlap: true,
    };
  }

  async getMasterData() {
    this.setTable();
    this.loading = true;
    let [dashboardResponse]: any = await Promise.all([
      this.dashboardHomeService.getMainHomeAsync(),
    ]);
    this.productionStatusModel = dashboardResponse.models;
    this.stateList = [];
    this.productionStatusModel.forEach((item, index) => {
      if (index == 0) {
        item.groupModels.forEach((stage) => {
          this.stateList.push({
            code: stage.stageCode,
            name: stage.stageName,
            id: stage.stageNameId,
            data: [],
          });
        });
      }
      this.productionStatusData.push({
        name: item.productCode,
        csx: item.totalWaiting,
        dsx: item.totalProduction,
      });
    });

    this.setBar();
    this.loading = false;
  }

  setBar() {
    setTimeout(() => {
      if (this.barChart) {
        this.barChart.destroy();
      }
      if (this.barChartStage) {
        this.barChartStage.destroy();
      }
      var labels = [];
      var datasetProductionStatusDSX = [];
      var datasetProductionStatusCSX = [];
      this.productionStatusData = [];

      this.productionStatusModel.forEach((item, index) => {
        labels.push(item.productName);
        datasetProductionStatusDSX.push(item.totalProduction);
        datasetProductionStatusCSX.push(item.totalWaiting);
        this.productionStatusData.push({
          name: item.productName,
          csx: item.totalWaiting,
          dsx: item.totalProduction,
        });

        this.stateList.forEach((dt) => {
          var dataItem = item.groupModels.find((c) => c.stageNameId == dt.id);
          var number = 0;
          if (dataItem != null && dataItem != undefined) {
            number = dataItem.totalLotNo;
          }
          dt.data.push(number);
        });
      });

      const maxwidthofLabel = 19 - labels.length;
      if (this.canvas_2 != null) {
        this.barChart = new Chart(
          this.canvas_2.nativeElement.getContext("2d"),
          {
            type: "bar",
            data: {
              labels: labels.map((t) => this.formatLabel(t, maxwidthofLabel)),
              datasets: [
                {
                  label: "Số lô đang sản xuất",
                  data: datasetProductionStatusDSX,
                  fill: false,
                  backgroundColor: "#7cb5ec",
                  borderWidth: 1,
                },
                {
                  label: "Số lô chưa sản xuất",
                  data: datasetProductionStatusCSX,
                  fill: false,
                  backgroundColor: "#434348",
                  borderWidth: 1,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                },
                title: {
                  display: true,
                  text: "Chart.js Floating Bar Chart",
                },
              },
              legend: {
                display: true,
                position: "bottom",
              },
              tooltips: {
                titleFontSize: 0,
                enabled: true,
                mode: "single",
                callbacks: {
                  label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var datasetLabel =
                      data.datasets[tooltipItem.datasetIndex].data[
                        tooltipItem.index
                      ];
                    datasetLabel += "";
                    var x = datasetLabel.split(".");
                    var x1 = x[0];
                    var x2 = x.length > 1 ? "." + x[1] : "";
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                      x1 = x1.replace(rgx, "$1" + "," + "$2");
                    }
                    var new_data = x1 + x2;
                    return label + ": " + new_data;
                  },
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: function (value, index, values) {
                        // add comma as thousand separator
                        value += "";
                        var x = value.split(".");
                        var x1 = x[0];
                        var x2 = x.length > 1 ? "." + x[1] : "";
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                          x1 = x1.replace(rgx, "$1" + "," + "$2");
                        }
                        var new_data = x1 + x2;
                        return new_data;
                      },
                      min: 0, //Giá trị min của mốc dữ liệu
                      stepSize: this.setStepSize(datasetProductionStatusDSX), //Khoảng cách giữa các mốc dữ liệu
                    },
                  },
                ],
                xAxes: [
                  {
                    barPercentage: 0.5,
                    gridLines: {
                      display: false,
                    },
                  },
                ],
              },
              animation: {
                duration: 0,
                onComplete: function () {
                  var chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                  ctx.textAlign = "center";
                  ctx.fillStyle = "rgba(0, 0, 0, 1)";
                  ctx.textBaseline = "bottom";

                  // Loop through each data in the datasets

                  this.data.datasets.forEach(function (dataset, i) {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function (bar, index) {
                      var data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                  });
                },
              },
            },
          }
        );
      }

      var datasetsCavar = [];
      this.stateList.forEach((item, index) => {
        var data = {
          label: item.name,
          data: item.data,
          fill: false,
          backgroundColor: "#" + makeid(6), // this.colors[index],
          borderWidth: 1,
        };

        datasetsCavar.push(data);
      });

      var dataCanvar = {
        labels: labels.map((t) => this.formatLabel(t, maxwidthofLabel)),
        datasets: datasetsCavar,
      };
      var dataChoose = null;
      if (this.canvas != null) {
        this.barChartStage = new Chart(
          this.canvas.nativeElement.getContext("2d"),
          {
            type: "bar",
            data: dataCanvar,
            options: {
              responsive: true,
              legend: {
                display: true,
                position: "bottom",
              },
              tooltips: {
                titleFontSize: 0,
                enabled: true,
                mode: "single",
                callbacks: {
                  label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    dataChoose = tooltipItem.datasetIndex;
                    var datasetLabel =
                      data.datasets[tooltipItem.datasetIndex].data[
                        tooltipItem.index
                      ];
                    datasetLabel += "";
                    var x = datasetLabel.split(".");
                    var x1 = x[0];
                    var x2 = x.length > 1 ? "." + x[1] : "";
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                      x1 = x1.replace(rgx, "$1" + "," + "$2");
                    }
                    var new_data = x1 + x2;
                    return label + ": " + new_data;
                  },
                },
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: function (value, index, values) {
                        // add comma as thousand separator
                        value += "";
                        var x = value.split(".");
                        var x1 = x[0];
                        var x2 = x.length > 1 ? "." + x[1] : "";
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                          x1 = x1.replace(rgx, "$1" + "," + "$2");
                        }
                        var new_data = x1 + x2;
                        return new_data;
                      },
                      min: 0, //Giá trị min của mốc dữ liệu
                      //stepSize: this.setStepSize(datasetProductionStatusDSX),  //Khoảng cách giữa các mốc dữ liệu
                    },
                  },
                ],
                xAxes: [
                  {
                    barPercentage: 0.5,
                    gridLines: {
                      display: false,
                    },
                  },
                ],
              },
              animation: {
                duration: 0.1,
                onComplete: function () {
                  var chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                  ctx.textAlign = "center";
                  ctx.fillStyle = "rgba(0, 0, 0, 1)";
                  ctx.textBaseline = "bottom";

                  // Loop through each data in the datasets

                  this.data.datasets.forEach(function (dataset, i) {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function (bar, index) {
                      var data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                  });
                },
              },
              onClick: (event, elements, chart: Chart<"bar">) => {
                if (elements[0]) {
                  if (dataChoose != null && dataChoose != undefined) {
                    this.selectColBarChart = this.productionStatusModel[elements[0]._index];
                    if (this.selectColBarChart != null) {
                      this.lstDetailBarChart =
                        this.selectColBarChart.groupModels[dataChoose];
                    }
                    this.displayDetail = true;
                  }
                }
              },
            },
          }
        );
      }
    }, 200);
  }

  initTable() {
    this.colDetailBar = [
      {
        field: "lotNoName",
        header: "Lot.No",
        textAlign: "center",
        display: "table-cell",
        width: "33%",
        rowspan: 2,
      },
      {
        field: "totalQuantity",
        header: "Số lượng",
        textAlign: "center",
        display: "table-cell",
        width: "33%",
        rowspan: 1,
      },
      {
        field: "description",
        header: "Ghi chú",
        textAlign: "center",
        display: "table-cell",
        width: "34%",
        rowspan: 1,
      },
    ];
  }

  formatLabel(str, maxwidth) {
    let sections = [];
    let words = str.split(" ");
    let temp = "";

    words.forEach((item, index) => {
      if ((temp + " " + item).trim().length <= maxwidth) {
        temp = (temp + " " + item).trim();
      } else {
        if (temp.trim() != "") sections.push(temp);
        temp = item;
      }
      if (index == words.length - 1 && temp.trim() != "") {
        sections.push(temp);
      }
    });

    return sections;
  }

  changeEventFullCalendar(els: any) {
    if (els) {
      let startDate = null;
      if (els.event.start) {
        startDate = convertToUTCTime(els.event.start);
      }
      let endDate = null;
      if (els.event.end) {
        endDate = convertToUTCTime(els.event.end);
      }
      let message: string = "";
      if (els.event.end) {
        message =
          "Bạn có muốn chỉnh sửa thời gian lịch hẹn bắt đầu từ : " +
          this.datePipe.transform(els.event.start, "h:mm dd/MM/yyyy ") +
          " đến " +
          this.datePipe.transform(els.event.end, "h:mm dd/MM/yyyy");
      } else {
        message =
          "Bạn có muốn chỉnh sửa thời gian lịch hẹn bắt đầu từ : " +
          this.datePipe.transform(els.event.start, "h:mm dd/MM/yyyy ");
      }
      this.confirmationService.confirm({
        message: message,
        accept: () => {
          this.loading = true;
          this.dashboardHomeService
            .updateCustomerMeeting(
              els.event.id,
              startDate,
              endDate,
              this.auth.UserId
            )
            .subscribe((response) => {
              let result: any = response;
              this.loading = false;
              if (result.statusCode == 200) {
                this.getMasterData();
                let msg = {
                  severity: "success",
                  summary: "Thông báo:",
                  detail: "Cập nhật lịch hẹn thành công",
                };
                this.showMessage(msg);
              } else {
                let msg = {
                  severity: "error",
                  summary: "Thông báo:",
                  detail: result.messageCode,
                };
                this.showMessage(msg);
              }
            });
        },
        reject: () => {
          this.getMasterData();
        },
      });
    }
  }

  // changeTimeEventFullCalendar(els: any) {
  //   if (els) {
  //     let startDate = null;
  //     if (els.event.start) {
  //       startDate = convertToUTCTime(els.event.start)
  //     }
  //     let endDate = null;
  //     if (els.event.end) {
  //       endDate = convertToUTCTime(els.event.end);
  //     }
  //     let message: string = '';
  //     if (els.event.end) {
  //       message = "Bạn có muốn chỉnh sửa thời gian lịch hẹn bắt đầu từ : " + this.datePipe.transform(els.event.start, "h:mm dd/MM/yyyy ") + " đến " + this.datePipe.transform(els.event.end, "h:mm dd/MM/yyyy");
  //     } else {
  //       message = "Bạn có muốn chỉnh sửa thời gian lịch hẹn bắt đầu từ : " + this.datePipe.transform(els.event.start, "h:mm dd/MM/yyyy ");
  //     }
  //     this.confirmationService.confirm({
  //       message: message,
  //       accept: () => {
  //         this.loading = true;
  //         this.dashboardHomeService.updateCustomerMeeting(els.event.id, startDate, endDate).subscribe(response => {
  //           let result: any = response;
  //           this.loading = false;
  //           if (result.statusCode == 200) {
  //             this.getMasterData();
  //             let msg = { severity: 'success', summary: 'Thông báo:', detail: 'Cập nhật lịch hẹn thành công' };
  //             this.showMessage(msg);
  //           } else {
  //             let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
  //             this.showMessage(msg);
  //           }
  //         });
  //       }
  //     });
  //   }
  // }

  handleEventClick(eventClick) {
    if (eventClick) {
      let id = eventClick.event.id;
      let ref = this.dialogService.open(MeetingDialogComponent, {
        data: {
          // customerId: this.customerId,
          customerMeetingId: id,
          listParticipants: this.listParticipants,
        },
        header: "Cập nhật lịch hẹn",
        width: "800px",
        baseZIndex: 1030,
        contentStyle: {
          "min-height": "300px",
          "max-height": "900px",
          overflow: "auto",
        },
      });

      ref.onClose.subscribe((result: any) => {
        if (result) {
          if (result.status) {
            this.getMasterData();
            let msg = {
              severity: "success",
              summary: "Thông báo:",
              detail: "Cập nhật lịch hẹn thành công",
            };
            this.showMessage(msg);
          }
        }
      });
    }
  }

  setCalendar() {
    this.events = [];
    if (this.listCustomerMeeting) {
      this.listCustomerMeeting.forEach((item) => {
        let meeting = new Calendar();
        meeting.id = item.customerMeetingId;
        meeting.title = item.customerName;
        meeting.start = item.startDate;
        meeting.end = item.endDate;
        meeting.participants = item.participants;
        meeting.isCreateByUser = item.isCreateByUser;

        if (meeting.start < new Date()) {
          meeting.backgroundColor = "#DD0000";
        }
        this.events = [...this.events, meeting];
      });
    }
    // if (this.listLeadMeeting) {
    //   this.listLeadMeeting.forEach(item => {
    //     let meeting = new Calendar();
    //     meeting.id = item.leadMeetingId;
    //     meeting.title = item.leadName;
    //     meeting.start = item.startDate;
    //     meeting.end = item.endDate;
    //     meeting.employeeId = item.employeeId;

    //     if (meeting.start < new Date()) {
    //       meeting.backgroundColor = "#DD0000";
    //     }
    //     this.events = [...this.events, meeting];
    //   });
    // }

    this.totalEvents = this.events;
  }

  // getPemistionMenu2() {
  //   this.lstSubmenuLevel3Create.forEach(element => {
  //     let resource = element.ObjectType + element.Path;
  //     let permission: any = this.getPermission.getPermission(this.listPermissionResourceActive, resource);
  //     if (permission.status == false) {
  //       element.Active = true;
  //     }
  //     else {
  //       element.Active = false;
  //     }
  //   });
  // }

  getPemistion() {
    //level 1
    this.lstSubmenuLevel1.forEach((item) => {
      //level 2
      item.LstChildren.forEach((element) => {
        let resource = item.ObjectType + element.Path;

        let permission: any = this.getPermission.getPermissionLocal(
          this.listPermissionResourceActive,
          resource
        );
        if (permission.status == false) {
          element.Active = true;
        } else {
          element.Active = false;
        }
      });

      let countItem = item.LstChildren.filter((f) => f.Active == true);
      if (countItem.length == item.LstChildren.length) {
        item.Active = true;
      } else item.Active = false;
    });

    ////level 1
    //this.lstSubmenuLevel1.forEach(item => {
    //  //level 2
    //  item.LstChildren.forEach(element => {
    //    //level 3
    //    element.LstChildren.forEach(role => {
    //      if (role.LstChildren.length > 0) {
    //        //level 4
    //        role.LstChildren.forEach(lv4 => {
    //          let resource = item.ObjectType + lv4.Path;

    //          let permission: any = this.getPermission.getPermissionLocal(this.listPermissionResourceActive, resource);
    //          if (permission.status == false) {
    //            lv4.Active = true;
    //          }
    //          else {
    //            lv4.Active = false;
    //          }
    //        });

    //        let countLevel4 = role.LstChildren.filter(x => x.Active == true).length;
    //        if (role.LstChildren.length == countLevel4) role.Active = true;
    //        else role.Active = false;
    //      }
    //      else {
    //        let resource = item.ObjectType + role.Path;
    //        let permission: any = this.getPermission.getPermissionLocal(this.listPermissionResourceActive, resource);
    //        if (permission.status == false) {
    //          role.Active = true;
    //        }
    //        else {
    //          role.Active = false;
    //        }
    //      }
    //    });

    //    let countElement = element.LstChildren.filter(f => f.Active == true);
    //    if (countElement.length == element.LstChildren.length) {
    //      element.Active = true;
    //    }
    //    else element.Active = false;
    //  });

    //  let countItem = item.LstChildren.filter(f => f.Active == true);
    //  if (countItem.length == item.LstChildren.length) {
    //    item.Active = true;
    //  }
    //  else item.Active = false;
    //});
  }

  setTable() {
    if (this.applicationName == "VNS") {
      this.colsQuote = [
        { field: "quoteCode", header: "Mã báo giá", textAlign: "left" },
        {
          field: "totalAmountAfterVat",
          header: "Trị giá báo giá",
          textAlign: "right",
        },
        { field: "customerName", header: "Khách hàng", textAlign: "left" },
      ];
    } else {
      this.colsQuote = [
        { field: "quoteCode", header: "Mã báo giá", textAlign: "left" },
        { field: "totalAmount", header: "Trị giá báo giá", textAlign: "right" },
        { field: "customerName", header: "Khách hàng", textAlign: "left" },
      ];
    }

    this.colsCustomer = [
      { field: "customerName", header: "Tên khách hàng", textAlign: "left" },
      { field: "customerPhone", header: "Số điện thoại", textAlign: "right" },
      { field: "customerEmail", header: "Email", textAlign: "left" },
    ];

    this.colsOrder = [
      { field: "orderCode", header: "Mã đơn hàng", textAlign: "left" },
      { field: "amount", header: "Trị giá đơn hàng", textAlign: "right" },
      { field: "customerName", header: "Khách hàng", textAlign: "left" },
    ];

    this.colsCustomerMeeting = [
      { field: "customerName", header: "Tên khách hàng", textAlign: "left" },
      { field: "title", header: "Tiêu đề", textAlign: "left" },
      {
        field: "createByName",
        header: "Người tạo lịch hẹn",
        textAlign: "left",
      },
      { field: "startDate", header: "Thời gian", textAlign: "left" },
      { field: "locationMeeting", header: "Địa điểm", textAlign: "left" },
      { field: "content", header: "Nội dung", textAlign: "left" },
    ];
    this.selectedColsCustomerMeeting = this.colsCustomerMeeting.filter(
      (e) =>
        e.field == "customerName" ||
        e.field == "title" ||
        e.field == "startDate" ||
        e.field == "locationMeeting" ||
        e.field == "content"
    );

    this.colsLeadMeeting = [
      { field: "leadName", header: "Tên cơ hội", textAlign: "left" },
      { field: "title", header: "Tiêu đề", textAlign: "left" },
      {
        field: "createByName",
        header: "Người tạo lịch hẹn",
        textAlign: "left",
      },
      { field: "startDate", header: "Thời gian", textAlign: "left" },
      { field: "startDate", header: "Địa điểm", textAlign: "left" },
      { field: "content", header: "Nội dung", textAlign: "left" },
    ];
    this.selectedColsLeadMeeting = this.colsLeadMeeting.filter(
      (e) =>
        e.field == "leadName" ||
        e.field == "title" ||
        e.field == "startDate" ||
        e.field == "startDate" ||
        e.field == "content"
    );

    this.colsCusBirthdayOfWeek = [
      { field: "customerName", header: "Tên khách hàng", textAlign: "left" },
      { field: "customerPhone", header: "Số điện thoại", textAlign: "right" },
      { field: "customerEmail", header: "Email", textAlign: "left" },
      { field: "dateOfBirth", header: "Sinh nhật", textAlign: "left" },
    ];

    this.colsEmployeeBirthDayOfWeek = [
      { field: "employeeName", header: "Tên khách hàng", textAlign: "left" },
      { field: "organizationName", header: "Phòng ban", textAlign: "right" },
      { field: "positionName", header: "Chức vụ", textAlign: "left" },
      { field: "dateOfBirth", header: "Sinh nhật", textAlign: "left" },
    ];
    this.initTable();
  }

  setStepSize(data) {
    //Chia nhiều nhất là 10 mốc dữ liệu
    return this.formatRoundNumber(data[0] / 10);
  }

  //Làm tròn số
  formatRoundNumber(number) {
    number = number.toString();
    let stt = number.length;
    let first_number = number.slice(0, 1);
    let result: number;
    switch (first_number) {
      case "1":
        result = this.addZero(2, stt);
        break;
      case "2":
        result = this.addZero(3, stt);
        break;
      case "3":
        result = this.addZero(4, stt);
        break;
      case "4":
        result = this.addZero(5, stt);
        break;
      case "5":
        result = this.addZero(6, stt);
        break;
      case "6":
        result = this.addZero(7, stt);
        break;
      case "7":
        result = this.addZero(8, stt);
        break;
      case "9":
        result = this.addZero(9, stt);
        break;
      default:
        break;
    }
    return result;
  }

  //Thêm số chữ số 0 vào sau một ký tự
  addZero(tmp: number, stt: number) {
    if (tmp == 9) {
      stt = stt + 1;
      tmp = 1;
    }
    let num = tmp.toString();
    for (let i = 0; i < stt - 1; i++) {
      num += "0";
    }
    return Number(num);
  }

  //Lấy ra list module của user
  getListModuleAndResource() {
    if (this.listPermissionResource.length > 0) {
      this.listPermissionResource.forEach((item) => {
        let moduleName = item.slice(0, item.indexOf("/"));
        if (this.listModule.indexOf(moduleName) == -1) {
          this.listModule.push(moduleName);
        }

        let resourceName = item.slice(
          item.indexOf("/") + 1,
          item.lastIndexOf("/")
        );
        if (this.listResource.indexOf(resourceName) == -1) {
          this.listResource.push(resourceName);
        }
      });
    }
  }

  //Kiểm tra user được quyền thấy các module nào trên trang home:
  checkModule(moduleName) {
    let result = false;
    if (this.listModule.indexOf(moduleName) !== -1) {
      result = true;
    }
    return result;
  }

  //Kiểm tra user có được quyền nhìn thấy các resource nào trên menu:
  checkUserResource(resourceName) {
    let result = false;
    if (this.listResource.indexOf(resourceName) !== -1) {
      result = true;
    }
    return result;
  }

  // checkUserResourceModule(resourceName: string[]) {
  //   let result = false;
  //   for (var i = 0; i < resourceName.length; i++) {
  //     if (this.listResource.indexOf(resourceName[i]) !== -1) {
  //       result = true;
  //       return result;
  //     }
  //   }
  //   return result;
  // }

  updateLeftMenu() {
    var leftMenu = localStorage.getItem("lstBreadCrumLeftMenu");
    this.lstBreadCrumLeftMenu = [];
    this.lstBreadCrumLeftMenu = JSON.parse(leftMenu);
  }

  updateLeftIsToggle() {
    this.isToggleCick = JSON.parse(localStorage.getItem("isToggleCick"));
  }

  openMenuLevel1(resource) {
    //Kiểm tra reset bộ lọc
    this.resetSearchModel(resource.Path);
    this.router.navigate([resource.Path]);
  }

  openMenuLevel2(resource, resourceParent: BreadCrumMenuModel) {
    //Kiểm tra reset bộ lọc
    this.resetSearchModel(resource.Path);
    this.router.navigate([resource.Path]);
  }

  openMenuLevel3(resource, resourceParent: BreadCrumMenuModel) {
    if (resource.LstChildren.length == 1) {
      this.router.navigate([resource.LstChildren[0].Path]);
    } else if (resource.LstChildren.length == 0) {
      //Kiểm tra reset bộ lọc
      this.resetSearchModel(resource.Path);
      this.router.navigate([resource.Path]);
    }
  }

  openMenuLevel4(menuLevel4) {
    this.router.navigate([menuLevel4.Path]);
  }

  getNotification() {
    this.notiService
      .getNotification(this.auth.EmployeeId, this.auth.UserId)
      .subscribe((response) => {
        var result = <any>response;
        this.notificationNumber = result.numberOfUncheckedNoti;
        this.notificationList = result.shortNotificationList;
      });
  }

  goToNotiUrl(item: any, notificationId: string, id: string, code: string) {
    this.notiService
      .removeNotification(notificationId, this.auth.UserId)
      .subscribe((response) => {
        this.loading = true;
        if (code == "PRO_REQ") {
          this.router.navigate(["/procurement-request/view", { id: id }]);
        }
        if (code == "PAY_REQ") {
          this.router.navigate([
            "/accounting/payment-request-detail",
            { requestId: id },
          ]);
        }
        if (code == "EMP_REQ") {
          this.router.navigate(["/employee/request/detail", { requestId: id }]);
        }
        if (code == "EMP_SLR") {
          this.NotificationContent = item.content;
          let month =
            this.NotificationContent.split(" ")[
              this.NotificationContent.split(" ").indexOf("tháng") + 1
            ];
          this.router.navigate([
            "employee/employee-salary/list",
            { MonthSalaryRequestParam: month },
          ]);
        }
        if (code == "TEA_SLR") {
          this.router.navigate(["/employee/teacher-salary/list"]);
        }
        if (code == "AST_SLR") {
          this.router.navigate(["/employee/assistant-salary/list"]);
        }
        this.loading = false;
      });
  }

  goToNotification() {
    //this.notificationNumber = 0;
    this.router.navigate(["/notification"]);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(["/login"]);
  }

  // Mở giao diện đổi Password
  openChangePassword() {
    let account = this.username;
    let _name = this.userFullName;
    let _email = this.userEmail;
    let _avatar = this.userAvatar;
    this.dialogRef = this.dialog.open(ChangepasswordComponent, {
      data: {
        accountName: account,
        name: _name,
        email: _email,
        avatar: _avatar,
      },
    });
    this.dialogRef.afterClosed().subscribe((result) => {});
  }
  //Ket thuc

  // Mo giao dien UserProfile
  goToViewProfile() {
    this.router.navigate(["/userprofile"]);
  }

  goToUrlSysConfig(Path) {
    this.router.navigate([Path]);
  }

  goListQuote() {
    this.router.navigate(["/customer/quote-list"]);
  }

  onViewQuoteDetail(id: string) {
    this.router.navigate(["/customer/quote-detail", { quoteId: id }]);
  }

  goListCustomer() {
    this.router.navigate(["/customer/list"]);
  }

  onViewCustomerDetail(id: string) {
    this.router.navigate(["/customer/detail", { customerId: id }]);
  }

  onViewLeadDetail(id: string) {}

  onViewObjectDetail(id: string, contactId: string, type: string) {
    if (type == "CUSTOMER") {
      this.router.navigate(["/customer/detail", { customerId: id }]);
    } else if ((type = "LEAD")) {
      this.router.navigate(["/lead/detail", { leadId: id }]);
    }
  }

  goListOrder() {
    this.router.navigate(["/order/list"]);
  }

  onViewOrderDetail(id: string) {
    this.router.navigate(["/order/order-detail", { customerOrderID: id }]);
  }

  onViewEmployeeDetail(employeeId: string, contactId: string) {
    this.router.navigate([
      "/employee/detail",
      { employeeId: employeeId, contactId: contactId },
    ]);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  isHomepage() {
    if (this.router.url === "/home") {
      return true;
    } else {
      return false;
    }
  }

  rowclick: number = -1;
  rowclickParent: number = -1;
  rowclickGrandparent: number = -1;
  active: boolean = true;
  activeParent: boolean = true;
  activeGrandparent: boolean = true;
  countLengthParrent: number = 0;
  countLengthGrandparent: number = 0;

  addRemoveIcon(index) {
    for (let i = 0; i < this.lstBreadCrumLeftMenu.length; i++) {
      $(".module-remove" + i).hide();
      $(".module-add" + i).show();
    }
    if (this.rowclick !== index) {
      $(".module-remove" + index).show();
      $(".module-add" + index).hide();
      this.active = true;

      for (let i = 0; i < this.countLengthParrent; i++) {
        $(".module-remove-parent" + i).hide();
        $(".module-add-parent" + i).show();
      }
      this.activeParent = true;
    } else {
      if (!this.active) {
        $(".module-remove" + index).show();
        $(".module-add" + index).hide();
      } else {
        $(".module-remove" + index).hide();
        $(".module-add" + index).show();
      }
      this.active = !this.active;
    }

    this.rowclick = index;
  }

  addRemoveIconParren(index, countLength) {
    this.countLengthParrent = countLength;
    for (let i = 0; i < countLength; i++) {
      $(".module-remove-parent" + i).hide();
      $(".module-add-parent" + i).show();
    }
    if (this.rowclickParent !== index) {
      $(".module-remove-parent" + index).show();
      $(".module-add-parent" + index).hide();
      this.activeParent = true;

      for (let i = 0; i < this.countLengthGrandparent; i++) {
        $(".module-remove-grandparent" + i).hide();
        $(".module-add-grandparent" + i).show();
      }
      this.activeGrandparent = true;
    } else {
      if (!this.activeParent) {
        $(".module-remove-parent" + index).show();
        $(".module-add-parent" + index).hide();
      } else {
        $(".module-remove-parent" + index).hide();
        $(".module-add-parent" + index).show();
      }
      this.activeParent = !this.activeParent;
    }

    this.rowclickParent = index;
  }

  addRemoveIconGrandparent(index, countLength) {
    this.countLengthGrandparent = countLength;
    for (let i = 0; i < countLength; i++) {
      $(".module-remove-grandparent" + i).hide();
      $(".module-add-grandparent" + i).show();
    }
    if (this.rowclickGrandparent !== index) {
      $(".module-remove-grandparent" + index).show();
      $(".module-add-grandparent" + index).hide();
      this.activeGrandparent = true;
    } else {
      if (!this.activeGrandparent) {
        $(".module-remove-grandparent" + index).show();
        $(".module-add-grandparent" + index).hide();
      } else {
        $(".module-remove-grandparent" + index).hide();
        $(".module-add-grandparent" + index).show();
      }
      this.activeGrandparent = !this.activeGrandparent;
    }

    this.rowclickGrandparent = index;
  }

  getDefaultApplicationName() {
    return this.systemParameterList.find(
      (systemParameter) => systemParameter.systemKey == "ApplicationName"
    )?.systemValueString;
  }

  searchMeetingForEmployee() {
    this.events = this.totalEvents;
    let listEmployeeId = this.selectedEmployee.map((x) => x.employeeId);

    if (listEmployeeId.length > 0) {
      let currentEvent: Array<any> = [];
      this.events.forEach((item) => {
        let listParticipants = item.participants.split(";");

        let flag = false;
        listEmployeeId.forEach((_item) => {
          if (listParticipants.includes(_item)) {
            flag = true;
          }
        });

        if (flag) {
          currentEvent.push(item);
        }
      });

      this.events = [];
      this.events = [...currentEvent];
    } else {
      this.events = this.totalEvents;
    }
  }

  //Kiểm tra reset bộ lọc
  resetSearchModel(path) {
    this.reSearchService.resetSearchModel(path);
  }

  gotoProductionDetailDelay(rowData: delayProductionOrder) {
    this.router.navigate([
      "/manufacture/production-order/detail",
      { productionOrderId: rowData.productionOrderId },
    ]);
  }

  gotoProductionDetail(rowData: totalProductionOrderInDashBoard) {
    this.router.navigate([
      "/manufacture/production-order/detail",
      { productionOrderId: rowData.productionOrderId },
    ]);
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
}

function makeid(length) {
  var result = '';
  var characters = 'abcdef0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

