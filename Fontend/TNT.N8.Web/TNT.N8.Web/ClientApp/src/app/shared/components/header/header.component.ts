import { Component, OnInit, ViewChild, ElementRef, Renderer2, EventEmitter, Output, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ChangepasswordComponent } from '../../../shared/components/changepassword/changepassword.component';
import { UserprofileComponent } from "../../../userprofile/userprofile.component"
import { PopupComponent } from "../popup/popup.component";
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from "ngx-loading";
import { CompanyConfigModel } from '../../../shared/models/companyConfig.model';
import { BreadCrumMenuModel } from '../../../shared/models/breadCrumMenu.model';
import { interval } from 'rxjs';

import { EventEmitterService } from '../../../shared/services/event-emitter.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { NotificationService } from '../../services/notification.service';
import { GetPermission } from '../../permission/get-permission';
import { TranslateService } from '@ngx-translate/core';
import { MenuComponent } from '../menu/menu.component';
import { Location } from '@angular/common';
import { MenuModule } from '../../../admin/models/menu-module.model';
import { MenuSubModule } from '../../../admin/models/menu-sub-module.model';
import { MenuPage } from '../../../admin/models/menu-page.model';
import { ListOrderSearch } from '../../models/re-search/list-order-search.model';
import { ReSearchService } from '../../../services/re-search.service';

@Component({
  selector: "main-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  host: {
    "(document:click)": "onClick($event)",
  },
})
export class HeaderComponent implements OnInit {
  @Output() updateLeftMenu = new EventEmitter<boolean>();

  username: string;
  userAvatar: string;
  userFullName: string;
  userEmail: string;
  dialogRef: MatDialogRef<ChangepasswordComponent>;
  dialogPopup: MatDialogRef<UserprofileComponent>;
  mouse_is_inside: boolean = false;
  notificationNumber: number = 0;
  NotificationContent: string;
  auth: any = JSON.parse(localStorage.getItem("auth"));
  notificationList: Array<any> = [];
  @ViewChild(MenuComponent) child;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  loadingConfig: any = {
    animationType: ngxLoadingAnimationTypes.circle,
    backdropBackgroundColour: "rgba(0,0,0,0.1)",
    backdropBorderRadius: "4px",
    primaryColour: "#ffffff",
    secondaryColour: "#999999",
    tertiaryColour: "#ffffff",
  };
  loading: boolean = false;

  /**/
  listPermissionResource: Array<string> = localStorage
    .getItem("ListPermissionResource")
    .split(",");
  listPermissionResourceActive: string = localStorage.getItem(
    "ListPermissionResource"
  );
  listModule: Array<string> = [];
  listResource: Array<string> = [];

  /*Module name*/
  moduleCrm = "crm"; //Module Quản trị quan hệ khách hàng
  moduleSal = "sal"; //Module Quản lý bán hàng
  moduleBuy = "buy"; //Module Quản lý mua hàng
  moduleAcc = "acc"; //Module Quản lý tài chính
  moduleHrm = "hrm"; //Module Quản trị nhân sự
  moduleSys = "sys"; //Module Quản trị hệ thống
  moduleWar = "war"; //Module Quản lý kho
  modulePro = "pro"; //Module Quản lý dự án
  /*End*/

  /*Resource name*/

  //Quản lý hệ thống
  systemConfig = "admin/company-config";
  systemParameter = "admin/system-parameter";
  organization = "admin/organization";
  masterdata = "admin/masterdata";
  permission = "admin/permission";
  configLeveCustomer = "admin/config-level-customer";
  workflow = "admin/workflow/workflow-list";

  /*End*/

  isCustomer = false;
  isSales = false;
  isShopping = false;
  isAccounting = false;
  isHrm = false;
  isAdmin2 = false;
  isWarehouse = false;
  isProject = false;
  isAsset = false;
  isSalary = false;
  isManufacture = false;
  isRecruitment = false;
  companyConfigModel = new CompanyConfigModel();
  userAdmin = false;
  permissionAdmin = false;

  /*  */

  moduled: string;
  titleModuled: string = "MENU";
  lstBreadCrum: Array<BreadCrumMenuModel> = [];
  lstBreadCrumLeftMenu: Array<BreadCrumMenuModel> = [];

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

  lstSubmenuLevel2: Array<BreadCrumMenuModel> = [
    //Module hàng hóa
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
    // Module Quản lý kho
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
    //Module quản lý sản xuất
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
  ];

  lstSubmenuLevel3: Array<BreadCrumMenuModel> = [
    // Module Quản lý kho
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
    //Module quản lý sản xuất
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
  ];

  lstSubmenuLevel4: Array<BreadCrumMenuModel> = [
    {
      Name: "Dashboard",
      Path: "/employee/dashboard-chien-dich",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "dashboard",
      IsDefault: true,
      CodeParent: "hrm_qltd_cdtd",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Tạo mới",
      Path: "/employee/tao-chien-dich",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "person_add",
      IsDefault: true,
      CodeParent: "hrm_qltd_cdtd",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Danh sách",
      Path: "/employee/danh-sach-chien-dich",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "hrm_qltd_cdtd",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Báo cáo",
      Path: "/employee/bao-cao-cong-viec-tuyen-dung",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "hrm_qltd_cdtd",
      LstChildren: [],
      Display: "none",
      Code: "",
    },

    {
      Name: "Tạo mới",
      Path: "/employee/tao-cong-viec-tuyen-dung",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "person_add",
      IsDefault: true,
      CodeParent: "hrm_qltd_vttd",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Danh sách",
      Path: "/employee/danh-sach-cong-viec-tuyen-dung",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "hrm_qltd_vttd",
      LstChildren: [],
      Display: "none",
      Code: "",
    },

    {
      Name: "Tạo mới",
      Path: "/employee/tao-ung-vien",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "person_add",
      IsDefault: true,
      CodeParent: "hrm_qltd_uv",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Danh sách",
      Path: "/employee/danh-sach-ung-vien",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "hrm_qltd_uv",
      LstChildren: [],
      Display: "none",
      Code: "",
    },

    // { Name: "Cấu hình", Path: "/salary/cau-hinh-chung", ObjectType: "HRM", LevelMenu: 4, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "hrm_qll_chc", LstChildren: [], Display: "none", Code: '' },

    // { Name: "Chấm công", Path: "/salary/tk-cham-cong", ObjectType: "HRM", LevelMenu: 4, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "hrm_qll_dmvs", LstChildren: [], Display: "none", Code: '' },

    // { Name: "Danh sách kỳ lương", Path: "/salary/ky-luong-list", ObjectType: "HRM", LevelMenu: 4, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "hrm_qll_kl", LstChildren: [], Display: "none", Code: '' },

    // { Name: "Danh sách phiếu lương", Path: "/salary/phieu-luong-list", ObjectType: "HRM", LevelMenu: 4, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "hrm_qll_pl", LstChildren: [], Display: "none", Code: '' },

    // { Name: "Báo cáo chi phí", Path: "/salary/bao-cao-chi-phi", ObjectType: "HRM", LevelMenu: 4, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "hrm_qll_bccp", LstChildren: [], Display: "none", Code: '' },

    {
      Name: "Danh sách",
      Path: "/asset/list",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: true,
      CodeParent: "hrm_qlts_ts",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Tạo mới",
      Path: "/asset/create",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: false,
      CodeParent: "hrm_qlts_ts",
      LstChildren: [],
      Display: "none",
      Code: "",
    },

    {
      Name: "Danh sách",
      Path: "/asset/danh-sach-yeu-cau-cap-phat",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: true,
      CodeParent: "hrm_qlts_yccp",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Tạo mới",
      Path: "/asset/yeu-cau-cap-phat-tai-san",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: false,
      CodeParent: "hrm_qlts_yccp",
      LstChildren: [],
      Display: "none",
      Code: "",
    },

    {
      Name: "Kiểm kê tài sản",
      Path: "/asset/danh-sach-dot-kiem-ke",
      ObjectType: "HRM",
      LevelMenu: 4,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: true,
      CodeParent: "hrm_qlts_kkts",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
  ];

  lstSubmenuDetailURL: Array<BreadCrumMenuModel> = [
    {
      Name: "Chi tiết hồ sơ thầu",
      Path: "/sale-bidding/detail",
      ObjectType: "cus",
      LevelMenu: 4,
      Active: false,
      nameIcon: "u41.png",
      IsDefault: false,
      CodeParent: "SaleBidding_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết cơ hội",
      Path: "/lead/detail",
      ObjectType: "cus",
      LevelMenu: 4,
      Active: false,
      nameIcon: "u41.png",
      IsDefault: false,
      CodeParent: "Lead_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết báo giá",
      Path: "/customer/quote-detail",
      ObjectType: "cus",
      LevelMenu: 4,
      Active: false,
      nameIcon: "u41.png",
      IsDefault: false,
      CodeParent: "Quote_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết khách hàng",
      Path: "/customer/detail",
      ObjectType: "cus",
      LevelMenu: 4,
      Active: false,
      nameIcon: "u41.png",
      IsDefault: false,
      CodeParent: "Customer_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết chăm sóc khách hàng",
      Path: "/customer/care-detail",
      ObjectType: "cus",
      LevelMenu: 3,
      Active: false,
      nameIcon: "u41.png",
      IsDefault: false,
      CodeParent: "customer_CSKH_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết sản phẩm dịch vụ",
      Path: "/product/detail",
      ObjectType: "sale",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "Sale_Product_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết hợp đồng",
      Path: "/sales/contract-detail",
      ObjectType: "sale",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: false,
      CodeParent: "sal_hdB_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết đơn hàng",
      Path: "/order/order-detail",
      ObjectType: "sale",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: false,
      CodeParent: "Sale_Order_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết đặt hàng",
      Path: "/vendor/detail-order",
      ObjectType: "shop",
      LevelMenu: 4,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "Shop_VendorOrder_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết nhân viên",
      Path: "/employee/detail",
      ObjectType: "HRM",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: false,
      CodeParent: "HRM_EmployeeTK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết xin nghỉ",
      Path: "/employee/request/detail",
      ObjectType: "HRM",
      LevelMenu: 3,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: false,
      CodeParent: "HRM_Request_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết phiếu thu",
      Path: "/accounting/cash-receipts-view",
      ObjectType: "accouting",
      LevelMenu: 3,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: true,
      CodeParent: "Accounting_cash-receipts_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết phiếu chi",
      Path: "/accounting/cash-payments-view",
      ObjectType: "accouting",
      LevelMenu: 3,
      Active: false,
      nameIcon: "format_list_bulleted",
      IsDefault: false,
      CodeParent: "Accounting_cash-payment_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết báo có",
      Path: "/accounting/bank-receipts-detail",
      ObjectType: "accouting",
      LevelMenu: 3,
      Active: false,
      nameIcon: "list",
      IsDefault: true,
      CodeParent: "accounting_bank-receipts_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết UNC",
      Path: "/accounting/bank-payments-detail",
      ObjectType: "accouting",
      LevelMenu: 3,
      Active: false,
      nameIcon: "list",
      IsDefault: false,
      CodeParent: "Accounting_bank-payments-TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết phải trả nhà cung cấp",
      Path: "/accounting/receivable-vendor-detail",
      ObjectType: "accouting",
      LevelMenu: 3,
      Active: false,
      nameIcon: "monetization_on",
      IsDefault: true,
      CodeParent: "Accounting_Vendor_Report",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết phải thu khách hàng",
      Path: "/accounting/receivable-customer-detail",
      ObjectType: "accouting",
      LevelMenu: 3,
      Active: false,
      nameIcon: "monetization_on",
      IsDefault: false,
      CodeParent: "Accounting_Customer_Report",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết nhà cung cấp",
      Path: "/vendor/detail",
      ObjectType: "shop",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "Shop_Vendor_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết đề xuất mua hàng",
      Path: "/procurement-request/view",
      ObjectType: "shop",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "Shop_procurement-request_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết đề nghị báo giá NCC",
      Path: "/vendor/vendor-quote-detail",
      ObjectType: "shop",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: false,
      CodeParent: "Shop_vendor_quote_request_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết phiếu nhập kho",
      Path: "/warehouse/inventory-receiving-voucher/details",
      ObjectType: "warehouse",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "WH_QLNTK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết phiếu xuất kho",
      Path: "/warehouse/inventory-delivery-voucher/details",
      ObjectType: "warehouse",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "WH_QLNXK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết quy trình",
      Path: "/manufacture/product-order-workflow/detail",
      ObjectType: "manufacture",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "MAN_QLQT_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết tiến trình",
      Path: "/manufacture/technique-request/detail",
      ObjectType: "manufacture",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "MAN_QLTT_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết lệnh tổng",
      Path: "/manufacture/total-production-order/detail",
      ObjectType: "manufacture",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "MAN_QLLT_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
    {
      Name: "Chi tiết lệnh sản xuất",
      Path: "/manufacture/production-order/detail",
      ObjectType: "manufacture",
      LevelMenu: 3,
      Active: false,
      nameIcon: "search",
      IsDefault: true,
      CodeParent: "MAN_QLLSX_TK",
      LstChildren: [],
      Display: "none",
      Code: "",
    },
  ];

  currentURl: string = "";
  isClickMiniLogo: false;
  isToggle: Boolean = false;
  @ViewChild("menuLevel2") menuLevel2: ElementRef;
  @ViewChild("contentBreadCrub", { static: true }) contentBreadCrub: ElementRef;

  listMenuModule: Array<MenuModule> = [];

  listMenuSubModule: Array<MenuSubModule> = [];

  listMenuPage: Array<MenuPage> = [];

  /*Menu Bar*/
  listMenuBar: Array<MenuSubModule> = [];
  /*End*/

  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private getPermission: GetPermission,
    private authenticationService: AuthenticationService,
    private notiService: NotificationService,
    private eventEmitterService: EventEmitterService,
    private renderer: Renderer2,
    private _eref: ElementRef,
    public location: Location,
    public reSearchService: ReSearchService
  ) {
    this.listMenuModule = JSON.parse(localStorage.getItem("ListMenuModule"));
    this.listMenuSubModule = JSON.parse(
      localStorage.getItem("ListMenuSubModule")
    );
    this.listMenuPage = JSON.parse(localStorage.getItem("ListMenuPage"));
    this.router.events.subscribe((event) => {
      let url = this.location.path();

      this.buildMenuBar(url);
    });
  }

  ngOnInit() {
    this.username = localStorage.getItem("Username");
    // this.userAvatar = localStorage.getItem("UserAvatar");
    this.userAvatar = "";
    this.userFullName = localStorage.getItem("UserFullName");
    this.userEmail = localStorage.getItem("UserEmail");
    this.getNotification();
    this.getListModuleAndResource();

    localStorage.setItem("menuIndexTree", this.router.url);

    if (localStorage.getItem("IsAdmin") == "true") {
      this.moduled = "admin";
      localStorage.setItem("menuIndex", "admin");
    }

    var listdata = [
      this.systemConfig,
      this.systemParameter,
      this.organization,
      this.masterdata,
      this.permission,
      this.configLeveCustomer,
      this.workflow,
    ];
    if (this.checkUserResourceModule(listdata)) {
      this.moduled = "admin-con";
      localStorage.setItem("menuIndex", "admin-con");
    }

    $("body").mouseup((e) => {
      //Đóng menu Level 1 khi di ra ngoài
      var logo = $("#logo");
      var module_content = $("#module-content");
      if (!logo.is(e.target) && !module_content.is(e.target)) {
        this.module_display_value = "none";
        this.updateLeftMenu.emit(false);
      }

      //Đóng menu Level 2 khi di ra ngoài cùng
      var containerMenuLevel2 = $("#menu-level2");
      var breadcrumbX = $("#breadcrumbX");
      if (!containerMenuLevel2.is(e.target) && !breadcrumbX.is(e.target)) {
        this.setDefaultViewMenu();
      }
    });

    //this.createBreadCrum();

    //kiem tra xem co toggle ko
    if ($("body").hasClass("sidebar-collapse")) {
      this.isToggle = true;
    } else {
      this.isToggle = false;
    }

    // if (this.eventEmitterService.subsVar == undefined) {
    //   this.eventEmitterService.subsVar = this.eventEmitterService.
    //     invokeUpdateMathPathFunction.subscribe((name: string) => {
    //       var X = localStorage.getItem('menuMapPath');
    //       this.lstBreadCrum = JSON.parse(X);
    //     });
    // }

    //const secondsCounter = interval(1000);
    //secondsCounter.subscribe(n => this.createBreadCrum());

    this.createBreadCrum();
  }

  isHomepage() {
    if (this.router.url === "/home") {
      return true;
    } else {
      return false;
    }
  }

  goToEmployee() {
    this.router.navigate(["/employee/list"]);
  }

  goToLead() {
    this.router.navigate(["/lead/list"]);
  }

  goToSaleBidding() {
    this.router.navigate(["/sale-bidding/list"]);
  }

  module_display: boolean = false;
  module_display_value: string = "none";
  module_display_menu_level2_value: string = "none";

  openModule() {
    this.setDefaultViewMenu();
    this.module_display = !this.module_display;
    if (this.module_display) {
      this.module_display_value = "block";
    } else {
      this.module_display_value = "none";
      this.updateLeftMenu.emit(false);
    }
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
    this.dialogRef.afterClosed().subscribe((result) => { });
    $("#user-content").toggle();
  }
  //Ket thuc

  // Mo giao dien UserProfile
  goToViewProfile() {
    this.router.navigate(["/userprofile"]);
  }

  getNotification() {
    this.notiService
      .getNotification(this.auth.EmployeeId, this.auth.UserId)
      .subscribe(
        (response) => {
          var result = <any>response;
          this.notificationNumber = result.numberOfUncheckedNoti;
          this.notificationList = result.shortNotificationList;
        },
        (error) => { }
      );
  }

  goToNotification() {
    this.router.navigate(["/notification"]);
  }

  goToNotiUrl(item: any, notificationId: string, id: string, code: string) {
    this.notiService
      .removeNotification(notificationId, this.auth.UserId)
      .subscribe(
        (response) => {
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
            this.router.navigate([
              "/employee/request/detail",
              { requestId: id },
            ]);
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
        },
        (error) => { }
      );
  }

  //Lấy ra list module và list resource của user
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

  showSubMenu(module) {
    this.updateLeftMenu.emit(true);

    var Title = "";
    this.setDefaultViewMenu();
    this.lstBreadCrum = [];
    this.setModuleToFalse();

    let oldParam: string = "";
    switch (module) {
      case "crm":
        this.isCustomer = true;
        this.translate.get("module_system.title.crm").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý khách hàng";
        oldParam = "customer";
        break;
      case "sal":
        this.isSales = true;
        this.translate.get("module_system.title.sal").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý hàng hóa";
        oldParam = "sales";
        break;
      case "buy":
        this.isShopping = true;
        this.translate.get("module_system.title.pay").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý mua hàng";
        oldParam = "shopping";
        break;
      case "acc":
        this.isAccounting = true;
        this.translate.get("module_system.title.acc").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý tài chính";
        oldParam = "accounting";
        break;
      case "hrm":
        this.isHrm = true;
        this.translate.get("module_system.title.emp").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý nhân sự";
        oldParam = "employee";
        break;
      case "war":
        this.isWarehouse = true;
        this.translate.get("module_system.title.war").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý kho";
        oldParam = "warehouse";
        break;
      case "man":
        this.isManufacture = true;
        this.translate.get("module_system.title.man").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản lý sản xuất";
        oldParam = "manufacture";
        break;
      case "pro":
        this.isProject = true;
        this.translate.get("module_system.title.pro").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Quản trị dự án";
        oldParam = "pro_du_an";
        break;
      default:
        break;
    }
    module = oldParam;
    var breadCrumMenuitem = new BreadCrumMenuModel();
    breadCrumMenuitem.Name = Title;
    breadCrumMenuitem.LevelMenu = 1;
    breadCrumMenuitem.ObjectType = module;
    breadCrumMenuitem.Path = "";
    breadCrumMenuitem.Active = true;
    breadCrumMenuitem.LstChildren = [];
    this.lstBreadCrum.push(breadCrumMenuitem);
    //---------------Đóng Menu Level 1-----------
    this.module_display = !this.module_display;
    if (this.module_display) {
      this.module_display_value = "block";
    } else {
      this.module_display_value = "none";
    }
    localStorage.setItem("menuMapPath", JSON.stringify(this.lstBreadCrum));

    this.updateLeftMenuFromHead(
      module,
      this.lstSubmenuLevel3,
      this.lstSubmenuLevel4
    );
  }

  getMenuAllowAccess(
    lstBreadCrumX: Array<BreadCrumMenuModel>,
    listResource: Array<string>
  ) {
    var ResultFilter = lstBreadCrumX.filter(function (item) {
      return listResource.indexOf(item.Path.substring(1)) !== -1;
    });
    return ResultFilter;
  }

  checkUserResource(resourceName) {
    let result = false;
    if (this.listResource.indexOf(resourceName) !== -1) {
      result = true;
    }
    return result;
  }

  checkUserResourceModule(resourceName: string[]) {
    let result = false;
    for (var i = 0; i < resourceName.length; i++) {
      if (this.listResource.indexOf(resourceName[i]) !== -1) {
        result = true;
        return result;
      }
    }
    return result;
  }

  setModuleToFalse() {
    this.isCustomer = false;
    this.isSales = false;
    this.isShopping = false;
    this.isAccounting = false;
    this.isHrm = false;
    this.isWarehouse = false;
    this.isManufacture = false;
    this.isProject = false;
    this.isAsset = false;
    this.isSalary = false;
    this.isRecruitment = false;
  }

  setDefaultViewMenu() {
    this.isCustomer = false;
    this.isSales = false;
    this.isShopping = false;
    this.isAccounting = false;
    this.isHrm = false;
    this.isAdmin2 = false;
    this.isWarehouse = false;
    this.isManufacture = false;
    this.isProject = false;
    this.isAsset = false;
    this.isSalary = false;
    this.isRecruitment = false;
  }

  openMenuLevel2(item) {
    //---------------Đóng Menu Level 1-----------
    this.module_display_value = "none";

    switch (item.ObjectType) {
      case "admin":
        if (this.isAdmin2 == true) {
          this.isAdmin2 = false;
        } else {
          this.isAdmin2 = true;
        }
        break;
      case "customer":
        if (this.isCustomer == true) {
          this.isCustomer = false;
          item.Active = false;
        } else {
          this.isCustomer = true;
          item.Active = true;
        }

        break;
      case "sales":
        if (this.isSales == true) {
          this.isSales = false;
        } else {
          this.isSales = true;
        }

        break;
      case "shopping":
        if (this.isShopping == true) {
          this.isShopping = false;
        } else {
          this.isShopping = true;
        }

        break;
      case "accounting":
        if (this.isAccounting == true) {
          this.isAccounting = false;
        } else {
          this.isAccounting = true;
        }

        break;
      case "employee":
        if (this.isHrm == true) {
          this.isHrm = false;
        } else {
          this.isHrm = true;
        }
        break;
      case "warehouse":
        if (this.isWarehouse == true) {
          this.isWarehouse = false;
        } else {
          this.isWarehouse = true;
        }
        break;
      case "manufacture":
        if (this.isManufacture == true) {
          this.isManufacture = false;
        } else {
          this.isManufacture = true;
        }
        break;
      case "pro_du_an":
        if (this.isProject == true) {
          this.isProject = false;
        } else {
          this.isProject = true;
        }
        break;
      default:
        break;
    }
  }

  openMenuLevel3(MenuCode, Title, module, IsOpenAlways, lvMenu = 0) {
    if (!IsOpenAlways) {
      //kiem tra co menu level 2 chua
      let checkexistMenulevel2 = this.lstBreadCrum.findIndex(
        (e) => e.LevelMenu == 2
      );
      if (checkexistMenulevel2 < 0) {
        let FindtMenulevel1 = this.lstBreadCrum.find((e) => e.LevelMenu == 1);
        FindtMenulevel1.Active = false;
        this.lstBreadCrum = [];
        this.lstBreadCrum.push(FindtMenulevel1);

        let submenulevel3 = this.lstSubmenuLevel2.filter(
          (e) => e.CodeParent == MenuCode
        );
        if (lvMenu != 0) {
          submenulevel3 = this.lstSubmenuLevel3.filter(
            (e) => e.CodeParent == MenuCode
          );
        }
        var breadCrumMenuitem = new BreadCrumMenuModel();
        breadCrumMenuitem.Name = Title;
        breadCrumMenuitem.LevelMenu = 2;
        breadCrumMenuitem.ObjectType = module;
        breadCrumMenuitem.Path = "";
        breadCrumMenuitem.Active = true;
        breadCrumMenuitem.LstChildren = [];
        var fillterResourceAllow = this.getMenuAllowAccess(
          submenulevel3,
          this.listResource
        );
        breadCrumMenuitem.LstChildren.push.apply(
          breadCrumMenuitem.LstChildren,
          fillterResourceAllow
        );
        this.lstBreadCrum.push(breadCrumMenuitem);
        ///Check Have Link Default ko
        let menuDefaultIndex = submenulevel3.findIndex(
          (e) => e.IsDefault == true
        );
        if (menuDefaultIndex >= 0) {
          this.openMenuLevel4(submenulevel3[menuDefaultIndex]);
        }
      } else {
        let FindtMenulevel1 = this.lstBreadCrum.find((e) => e.LevelMenu == 1);
        FindtMenulevel1.Active = false;
        this.lstBreadCrum = [];
        this.lstBreadCrum.push(FindtMenulevel1);
        let submenulevel3 = this.lstSubmenuLevel3.filter(
          (e) => e.CodeParent == MenuCode
        );
        var breadCrumMenuitem = new BreadCrumMenuModel();
        breadCrumMenuitem.Name = Title;
        breadCrumMenuitem.LevelMenu = 2;
        breadCrumMenuitem.ObjectType = module;
        breadCrumMenuitem.Path = "";
        breadCrumMenuitem.Active = true;
        breadCrumMenuitem.LstChildren = [];
        var fillterResourceAllow = this.getMenuAllowAccess(
          submenulevel3,
          this.listResource
        );
        breadCrumMenuitem.LstChildren.push.apply(
          breadCrumMenuitem.LstChildren,
          fillterResourceAllow
        );

        breadCrumMenuitem.LstChildren.forEach((item) => {
          if (item.LevelMenu == 2) {
            item.LevelMenu = 3;
          }
        });
        this.lstBreadCrum.push(breadCrumMenuitem);
        ///Check Have Link Default ko
        let menuDefaultIndex = submenulevel3.findIndex(
          (e) => e.IsDefault == true
        );
        if (menuDefaultIndex >= 0) {
          this.openMenuLevel4(submenulevel3[menuDefaultIndex]);
        }
      }
    } else {
      let FindtMenulevel1 = this.lstBreadCrum.find((e) => e.LevelMenu == 1);
      FindtMenulevel1.Active = false;
      this.lstBreadCrum = [];
      this.lstBreadCrum.push(FindtMenulevel1);
      let submenulevel3 = this.lstSubmenuLevel3.filter(
        (e) => e.CodeParent == MenuCode
      );
      ///Check Have Link Default ko
      let menuDefaultIndex = submenulevel3.findIndex(
        (e) => e.IsDefault == true
      );
      if (menuDefaultIndex >= 0) {
        this.openMenuLevel4(submenulevel3[menuDefaultIndex]);
      }
    }

    localStorage.setItem("menuMapPath", JSON.stringify(this.lstBreadCrum));
    this.setDefaultViewMenu();
  }

  openMenuLevel4(resource) {
    //kiem tra co menu level 3 chua
    let checkexistMenulevel3 = this.lstBreadCrum.findIndex(
      (e) => e.LevelMenu == 3
    );
    if (checkexistMenulevel3 < 0) {
      var breadCrumMenuitem = new BreadCrumMenuModel();
      breadCrumMenuitem.Name = resource.Name;
      breadCrumMenuitem.LevelMenu = 3;
      breadCrumMenuitem.ObjectType = resource.ObjectType;
      breadCrumMenuitem.Path = resource.Path;
      breadCrumMenuitem.CodeParent = resource.CodeParent;
      breadCrumMenuitem.Active = true;
      breadCrumMenuitem.LstChildren = [];
      this.lstBreadCrum.push(breadCrumMenuitem);
    } else {
      this.lstBreadCrum.splice(checkexistMenulevel3, 1);
      var breadCrumMenuitem = new BreadCrumMenuModel();
      breadCrumMenuitem.Name = resource.Name;
      breadCrumMenuitem.LevelMenu = 3;
      breadCrumMenuitem.ObjectType = resource.ObjectType;
      breadCrumMenuitem.Path = resource.Path;
      breadCrumMenuitem.CodeParent = resource.CodeParent;
      breadCrumMenuitem.Active = true;
      breadCrumMenuitem.LstChildren = [];
      this.lstBreadCrum.push(breadCrumMenuitem);
    }

    localStorage.setItem("menuMapPath", JSON.stringify(this.lstBreadCrum));
    //Update Active cho LeftMenu
    this.lstBreadCrumLeftMenu.forEach(function (itemX) {
      let FindMenuActive = itemX.LstChildren.filter(
        (e) => e.Path == resource.Path && e.CodeParent == resource.CodeParent
      );
      if (FindMenuActive.length > 0) {
        FindMenuActive.forEach(function (item) {
          item.Active = false;
        });
      }
    });

    localStorage.setItem(
      "lstBreadCrumLeftMenu",
      JSON.stringify(this.lstBreadCrumLeftMenu)
    );
    this.eventEmitterService.updateLeftMenuClick();
    // this.router.navigate([resource.Path]);
    let path = this.listMenuSubModule.find(
      (x) => x.code == resource.CodeParent
    ).path;

    //Kiểm tra reset bộ lọc
    this.resetSearchModel(path);
    this.router.navigate([path]);
  }

  updateLeftMenuFromHead(
    module: string,
    lstSubmenuLevel3: Array<BreadCrumMenuModel>,
    lstSubmenuLevel4: Array<BreadCrumMenuModel>
  ) {
    let MenuLevel2 = this.lstSubmenuLevel2.filter(
      (e) => e.ObjectType == module
    );
    if (MenuLevel2.length > 0) {
      //list menu level 2
      MenuLevel2.forEach((item) => {
        item.LstChildren = [];

        ////Lấy list menu level 3 theo menu level 2
        let MenuLevel3 = lstSubmenuLevel3.filter(
          (e) => e.CodeParent == item.CodeParent
        );

        //Nếu có list menu level 3
        if (MenuLevel3.length > 0) {
          MenuLevel3.forEach((resource) => {
            resource.LstChildren = [];

            //Lấy list menu level 4
            let MenuLevel4 = lstSubmenuLevel4.filter(
              (e) => e.CodeParent == resource.Code
            );

            //gán list menu level 4 vào list menu level 3
            resource.LstChildren.push.apply(resource.LstChildren, MenuLevel4);
          });
        }

        //Gán list menu level 3 vào list menu level 2
        item.LstChildren.push.apply(item.LstChildren, MenuLevel3);
      });
    }
    // this.getPemistion();
    this.getPemistionMenu2(MenuLevel2);
    this.lstBreadCrumLeftMenu = [];
    this.lstBreadCrumLeftMenu.push.apply(this.lstBreadCrumLeftMenu, MenuLevel2);
    localStorage.setItem(
      "lstBreadCrumLeftMenu",
      JSON.stringify(this.lstBreadCrumLeftMenu)
    );
    this.eventEmitterService.updateLeftMenuClick();
  }

  // async getPemistion() {
  //   this.lstSubmenuLevel1.forEach(async item => {
  //     item.LstChildren.forEach(async element => {
  //       element.LstChildren.forEach(async role => {
  //         let resource = item.ObjectType + role.Path;
  //         let permission: any = await this.getPermission.getPermissionLocal(this.listPermissionResourceActive, resource);
  //         if (permission.status == false) {
  //           role.Active = true;
  //         }
  //         else {
  //           role.Active = false;
  //         }
  //       });
  //       let countElement = element.LstChildren.filter(f => f.Active == true);
  //       if (countElement.length == element.LstChildren.length) {
  //         element.Active = true;
  //       }
  //       else element.Active = false;
  //     });
  //     let countItem = item.LstChildren.filter(f => f.Active == true);
  //     if (countItem.length == item.LstChildren.length) {
  //       item.Active = true;
  //     }
  //     else item.Active = false;
  //   });
  // }

  getPemistionMenu2(obj) {
    //level 2
    obj.forEach((item) => {
      let resource = item.Path;

      let permission: any = this.getPermission.getPermissionLocal(
        this.listPermissionResourceActive,
        resource
      );
      if (permission.status == false) {
        item.Active = true;
      } else {
        item.Active = false;
      }
    });

    ////level 2
    //obj.forEach(item => {
    //  //level 3
    //  item.LstChildren.forEach(element => {
    //    let resource = element.ObjectType + element.Path;
    //    if (element.LstChildren.length) {
    //      //level 4
    //      element.LstChildren.forEach(lv4 => {
    //        let resourceLevel4 = element.ObjectType + lv4.Path;

    //        let permission: any = this.getPermission.getPermissionLocal(this.listPermissionResourceActive, resourceLevel4);
    //        if (permission.status == false) {
    //          lv4.Active = true;
    //        }
    //        else {
    //          lv4.Active = false;
    //        }
    //      });

    //      let countLevel4 = element.LstChildren.filter(x => x.Active == true).length;
    //      if (element.LstChildren.length == countLevel4) element.Active = true;
    //      else element.Active = false;
    //    }
    //    else {
    //      let permission: any = this.getPermission.getPermissionLocal(this.listPermissionResourceActive, resource);
    //      if (permission.status == false) {
    //        element.Active = true;
    //      }
    //      else {
    //        element.Active = false;
    //      }
    //    }
    //  });
    //  let countElement = item.LstChildren.filter(f => f.Active == true);
    //  if (countElement.length == item.LstChildren.length) {
    //    item.Active = true;
    //  }
    //  else item.Active = false;
    //});
  }

  IsToggleCick() {
    if (this.isToggle == true) {
      this.isToggle = false;
    } else {
      this.isToggle = true;
    }
    localStorage.setItem("isToggleCick", this.isToggle.toString());
    this.eventEmitterService.updateIsToggleClick2();
  }

  comeBackMenuLevel1() {
    this.setDefaultViewMenu();
    this.module_display = true;
    this.module_display_value = "block";
  }

  createBreadCrum() {
    var urlTree = this.router.parseUrl(this.router.url);
    const urlWithoutParams = urlTree.root.children["primary"].segments
      .map((it) => it.path)
      .join("/")
      .split("/");

    var path = "";
    if (urlWithoutParams.length == 3) {
      if (this.isGuid(urlWithoutParams[2])) {
        path = "/" + urlWithoutParams[0] + "/" + urlWithoutParams[1];
      } else {
        path =
          "/" +
          urlWithoutParams[0] +
          "/" +
          urlWithoutParams[1] +
          "/" +
          urlWithoutParams[2];
      }
    } else {
      path = "/" + urlWithoutParams[0] + "/" + urlWithoutParams[1];
    }

    if (this.currentURl == "" || this.currentURl == null) {
      this.currentURl = path;
      this.lstBreadCrum = [];
      var findLevel3 = this.lstSubmenuLevel3.find((e) => e.Path == path);
      var findDetailURl = this.lstSubmenuDetailURL.find((e) => e.Path == path);

      var findLevelMenu2 = this.lstSubmenuLevel2.find((e) => e.Path == path);

      //Nếu màn hình hiện tại không phải màn hình chi tiết (là các màn hình có trên menu)
      if (findLevel3 != null || findLevelMenu2 != null) {
        //Tìm menu level 2 của nó
        var findLevel2 = findLevelMenu2;

        if (findLevel3 != null) {
          findLevel2 = this.lstSubmenuLevel2.find(
            (e) => e.CodeParent == findLevel3.CodeParent
          );
        } else {
          findLevel3 = findLevel2;
        }

        //Nếu tìm thấy menu level 2
        if (findLevel2 != null) {
          var Title = "";
          switch (findLevel2.ObjectType) {
            case "admin":
              this.translate
                .get("module_system.title.sys")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý hệ thống";
              break;
            case "customer":
              this.translate
                .get("module_system.title.crm")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý khách hàng";
              break;
            case "sales":
              this.translate
                .get("module_system.title.sal")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý hàng hóa";
              break;
            case "shopping":
              this.translate
                .get("module_system.title.pay")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý mua hàng";
              break;
            case "accounting":
              this.translate
                .get("module_system.title.acc")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý tài chính";
              break;
            case "employee":
              this.translate
                .get("module_system.title.emp")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý nhân sự";
              break;
            case "warehouse":
              this.translate
                .get("module_system.title.war")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý kho";
              break;
            case "manufacture":
              this.translate
                .get("module_system.title.man")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản lý sản xuất";
              break;
            case "project":
              this.translate
                .get("module_system.title.pro")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Quản trị dự án";
              break;
            default:
              break;
          }

          //day vao Menu Level 1
          var breadCrumMenuitem = new BreadCrumMenuModel();
          breadCrumMenuitem.Name = Title;
          breadCrumMenuitem.LevelMenu = 1;
          breadCrumMenuitem.ObjectType = findLevel2.ObjectType;
          breadCrumMenuitem.Path = "";
          breadCrumMenuitem.Active = false;
          breadCrumMenuitem.LstChildren = [];
          this.lstBreadCrum.push(breadCrumMenuitem);

          //Day vao menu Level 2
          let submenulevel3 = this.lstSubmenuLevel3.filter(
            (e) => e.CodeParent == findLevel2.CodeParent
          );
          var fillterResourceAllow = this.getMenuAllowAccess(
            submenulevel3,
            this.listResource
          );
          findLevel2.LstChildren.push.apply(
            findLevel2.LstChildren,
            fillterResourceAllow
          );
          this.lstBreadCrum.push(findLevel2);
          findLevel3.Active = false;
          this.lstBreadCrum.push(findLevel3);

          this.updateLeftMenuFromHead(
            findLevel2.ObjectType,
            this.lstSubmenuLevel3,
            this.lstSubmenuLevel4
          );
        }
      }
      //Nếu màn hình hiện tại là màn hình chi tiết (là các màn hình không có trên menu)
      else if (findDetailURl != null) {
        //Tìm màn hình chi tiết
        var findMenuDeail = this.lstSubmenuDetailURL.find(
          (e) => e.Path == path
        );

        //Nếu màn hình chi tiết đã được định nghĩa
        if (findMenuDeail != null) {
          //Tìm menu level 3 của nó
          var findLevel3 = this.lstSubmenuLevel3.find(
            (e) => e.Code == findMenuDeail.CodeParent
          );

          //Nếu có menu level 3
          if (findLevel3 != null) {
            var findLevel2 = this.lstSubmenuLevel2.find(
              (e) => e.CodeParent == findLevel3.CodeParent
            );

            //Nếu có menu Level 2
            if (findLevel2 != null) {
              var Title = "";
              switch (findLevel2.ObjectType) {
                case "admin":
                  this.translate
                    .get("module_system.title.sys")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý hệ thống";
                  break;
                case "customer":
                  this.translate
                    .get("module_system.title.crm")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý khách hàng";

                  break;
                case "sales":
                  this.translate
                    .get("module_system.title.sal")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý hàng hóa";
                  break;
                case "shopping":
                  this.translate
                    .get("module_system.title.pay")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý mua hàng";
                  break;
                case "accounting":
                  this.translate
                    .get("module_system.title.acc")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý tài chính";
                  break;
                case "employee":
                  this.translate
                    .get("module_system.title.emp")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý nhân sự";
                  break;
                case "warehouse":
                  this.translate
                    .get("module_system.title.war")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý kho";
                  break;
                case "man":
                  this.translate
                    .get("module_system.title.man")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản lý sản xuất";
                  break;
                case "project":
                  this.translate
                    .get("module_system.title.pro")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Quản trị dự án";
                  break;
                default:
                  break;
              }

              //day vao Menu Level 1
              var breadCrumMenuitem = new BreadCrumMenuModel();
              breadCrumMenuitem.Name = Title;
              breadCrumMenuitem.LevelMenu = 1;
              breadCrumMenuitem.ObjectType = findLevel2.ObjectType;
              breadCrumMenuitem.Path = "";
              breadCrumMenuitem.Active = false;
              breadCrumMenuitem.LstChildren = [];
              this.lstBreadCrum.push(breadCrumMenuitem);

              //Day vao menu Level 2
              let submenulevel3 = this.lstSubmenuLevel3.filter(
                (e) => e.CodeParent == findLevel2.CodeParent
              );
              var fillterResourceAllow = this.getMenuAllowAccess(
                submenulevel3,
                this.listResource
              );
              findLevel2.LstChildren.push.apply(
                findLevel2.LstChildren,
                fillterResourceAllow
              );
              this.lstBreadCrum.push(findLevel2);
              this.lstBreadCrum.push(findLevel3);
              findMenuDeail.Active = true;
              this.lstBreadCrum.push(findMenuDeail);

              this.updateLeftMenuFromHead(
                findLevel2.ObjectType,
                this.lstSubmenuLevel3,
                this.lstSubmenuLevel4
              );
            }
          }
        }
      }
    } else {
      if (this.currentURl != path) {
        this.currentURl = path;
        this.lstBreadCrum = [];
        var findLevel3 = this.lstSubmenuLevel3.find((e) => e.Path == path);
        var findDetailURl = this.lstSubmenuDetailURL.find(
          (e) => e.Path == path
        );
        if (findLevel3 != null) {
          var findLevel2 = this.lstSubmenuLevel2.find(
            (e) => e.CodeParent == findLevel3.CodeParent
          );
          //find Menu Level 1
          if (findLevel2 != null) {
            var Title = "";
            switch (findLevel2.ObjectType) {
              case "admin":
                this.translate
                  .get("module_system.title.sys")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý hệ thống";
                break;
              case "customer":
                this.translate
                  .get("module_system.title.crm")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý khách hàng";

                break;
              case "sales":
                this.translate
                  .get("module_system.title.sal")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý hàng hóa";
                break;
              case "shopping":
                this.translate
                  .get("module_system.title.pay")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý mua hàng";
                break;
              case "accounting":
                this.translate
                  .get("module_system.title.acc")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý tài chính";
                break;
              case "employee":
                this.translate
                  .get("module_system.title.emp")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý nhân sự";
                break;
              case "warehouse":
                this.translate
                  .get("module_system.title.war")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý kho";
                break;
              case "man":
                this.translate
                  .get("module_system.title.man")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản lý sản xuất";
                break;
              case "project":
                this.translate
                  .get("module_system.title.pro")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Quản trị dự án";
                break;
              default:
                break;
            }

            //day vao Menu Level 1
            var breadCrumMenuitem = new BreadCrumMenuModel();
            breadCrumMenuitem.Name = Title;
            breadCrumMenuitem.LevelMenu = 1;
            breadCrumMenuitem.ObjectType = findLevel2.ObjectType;
            breadCrumMenuitem.Path = "";
            breadCrumMenuitem.Active = false;
            breadCrumMenuitem.LstChildren = [];
            this.lstBreadCrum.push(breadCrumMenuitem);

            //Day vao menu Level2
            let submenulevel3 = this.lstSubmenuLevel3.filter(
              (e) => e.CodeParent == findLevel2.CodeParent
            );
            var fillterResourceAllow = this.getMenuAllowAccess(
              submenulevel3,
              this.listResource
            );
            findLevel2.LstChildren.push.apply(
              findLevel2.LstChildren,
              fillterResourceAllow
            );
            this.lstBreadCrum.push(findLevel2);
            findLevel3.Active = true;
            this.lstBreadCrum.push(findLevel3);

            this.updateLeftMenuFromHead(
              findLevel2.ObjectType,
              this.lstSubmenuLevel3,
              this.lstSubmenuLevel4
            );
          }
        } else if (findDetailURl != null) {
          var findMenuDeail = this.lstSubmenuDetailURL.find(
            (e) => e.Path == path
          );
          if (findMenuDeail != null) {
            var findLevel3 = this.lstSubmenuLevel3.find(
              (e) => e.Code == findMenuDeail.CodeParent
            );
            if (findLevel3 != null) {
              var findLevel2 = this.lstSubmenuLevel2.find(
                (e) => e.CodeParent == findLevel3.CodeParent
              );
              //find Menu Level 1
              if (findLevel2 != null) {
                var Title = "";
                switch (findLevel2.ObjectType) {
                  case "admin":
                    this.translate
                      .get("module_system.title.sys")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý hệ thống";
                    break;
                  case "customer":
                    this.translate
                      .get("module_system.title.crm")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý khách hàng";

                    break;
                  case "sales":
                    this.translate
                      .get("module_system.title.sal")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý hàng hóa";
                    break;
                  case "shopping":
                    this.translate
                      .get("module_system.title.pay")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý mua hàng";
                    break;
                  case "accounting":
                    this.translate
                      .get("module_system.title.acc")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý tài chính";
                    break;
                  case "employee":
                    this.translate
                      .get("module_system.title.emp")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý nhân sự";
                    break;
                  case "warehouse":
                    this.translate
                      .get("module_system.title.war")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý kho";
                    break;
                  case "man":
                    this.translate
                      .get("module_system.title.man")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản lý sản xuất";
                    break;
                  case "project":
                    this.translate
                      .get("module_system.title.pro")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Quản trị dự án";
                    break;
                  default:
                    break;
                }

                //day vao Menu Level 1
                var breadCrumMenuitem = new BreadCrumMenuModel();
                breadCrumMenuitem.Name = Title;
                breadCrumMenuitem.LevelMenu = 1;
                breadCrumMenuitem.ObjectType = findLevel2.ObjectType;
                breadCrumMenuitem.Path = "";
                breadCrumMenuitem.Active = false;
                breadCrumMenuitem.LstChildren = [];
                this.lstBreadCrum.push(breadCrumMenuitem);

                //Day vao menu Level2
                let submenulevel3 = this.lstSubmenuLevel3.filter(
                  (e) => e.CodeParent == findLevel2.CodeParent
                );
                var fillterResourceAllow = this.getMenuAllowAccess(
                  submenulevel3,
                  this.listResource
                );
                findLevel2.LstChildren.push.apply(
                  findLevel2.LstChildren,
                  fillterResourceAllow
                );
                this.lstBreadCrum.push(findLevel2);
                this.lstBreadCrum.push(findLevel3);
                findMenuDeail.Active = true;
                this.lstBreadCrum.push(findMenuDeail);

                this.updateLeftMenuFromHead(
                  findLevel2.ObjectType,
                  this.lstSubmenuLevel3,
                  this.lstSubmenuLevel4
                );
              }
            }
          }
        }
      }
    }
  }

  isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid =
      /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

  buildMenuBar(currentUrl: string) {
    let isMenuProject = false;
    if (currentUrl.includes("projectId")) {
      isMenuProject = true;
    }
    //format currentUrl
    if (currentUrl.indexOf(";") != -1) {
      currentUrl = currentUrl.substring(0, currentUrl.indexOf(";"));
    }
    //Reset active list menu bar
    this.listMenuBar = [];

    var page = this.listMenuPage.find((x) => x.path == currentUrl);
    if (page) {
      let subMenu = this.listMenuSubModule.find(
        (x) => x.code == page.codeParent
      );
      this.listMenuBar = this.listMenuSubModule.filter(
        (x) => x.codeParent == subMenu.codeParent
      );
      this.listMenuBar.forEach((item) => {
        item.active = false;
        item.children.forEach((_item) => {
          _item.active = false;
        });
        if (
          (item.code.includes("pro_sub") && !isMenuProject) ||
          (item.code.includes("_pro") && isMenuProject)
        ) {
          item.isShow = false;
        }
      });

      this.listMenuBar.forEach((item) => {
        item.children = this.listMenuPage.filter(
          (x) => x.codeParent == item.code
        );

        if (item.children.includes(page)) {
          item.active = true;

          let _page = item.children.find((x) => x == page);
          if (_page) {
            _page.active = true;
          }
        }
      });
    }
  }

  toggleMenuBarContent(item) {
    this.listMenuBar.forEach((_item) => {
      if (_item != item) {
        _item.isShowChildren = false;
      }
    });
    item.isShowChildren = !item.isShowChildren;
  }

  onClick(event) {
    if (!this._eref.nativeElement.contains(event.target)) {
      let menuContent = this.listMenuBar.find((x) => x.isShowChildren == true);

      if (menuContent) menuContent.isShowChildren = false;
    }
  }

  goToPath(item: MenuSubModule) {
    //Nếu không phải item mask
    if (item.indexOrder != 1) {
      this.listMenuBar.forEach((x) => (x.isShowChildren = false));
      if (item.path != null && item.path?.trim() != "") {
        //Kiểm tra reset bộ lọc
        this.resetSearchModel(item.path);

        this.route.params.subscribe((params) => {
          let projectId = params["projectId"];

          if (projectId) {
            this.router.navigate([item.path, { projectId: projectId }]);
          } else {
            this.router.navigate([item.path]);
          }
        });
      }
    }
  }

  goToMenuPage(menuPage: MenuPage) {
    this.listMenuBar.forEach((x) => (x.isShowChildren = false));

    //Kiểm tra reset bộ lọc
    this.resetSearchModel(menuPage.path);

    this.route.params.subscribe((params) => {
      let projectId = params["projectId"];

      if (projectId) {
        this.router.navigate([menuPage.path, { projectId: projectId }]);
      } else {
        this.router.navigate([menuPage.path]);
      }
    });
  }

  //Kiểm tra reset bộ lọc
  resetSearchModel(path) {
    this.reSearchService.resetSearchModel(path);
  }

  checkActiveMenuLevel2(codeMenuLevel2: string) {
    let menuLevel2 = this.lstBreadCrumLeftMenu.find(
      (x) => x.Code == codeMenuLevel2
    );
    return !menuLevel2.Active;
  }
}
