import { Component, OnInit, ViewChild, ElementRef, Renderer2, EventEmitter, Output, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ChangepasswordComponent } from '../../../shared/components/changepassword/changepassword.component';
import { UserprofileComponent } from "../../../userprofile/userprofile.component";
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from "ngx-loading";
import { CompanyConfigModel } from '../../../shared/models/companyConfig.model';
import { BreadCrumMenuModel } from '../../../shared/models/breadCrumMenu.model';
import { interval } from 'rxjs';

import { EventEmitterService } from '../../../shared/services/event-emitter.service';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { TranslateService } from '@ngx-translate/core';
import { MenuComponent } from '../../../shared/components/menu/menu.component';
import { Location } from '@angular/common';
import { MenuModule } from '../../../admin/models/menu-module.model';
import { MenuSubModule } from '../../../admin/models/menu-sub-module.model';
import { MenuPage } from '../../../admin/models/menu-page.model';
import { ReSearchService } from '../../../services/re-search.service';
import { ProjectService } from '../../../project/services/project.service';

@Component({
  selector: "app-project-header",
  templateUrl: "./project-header.component.html",
  styleUrls: ["./project-header.component.css"],
})
export class ProjectHeaderComponent implements OnInit {
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
  moduleCrm = "crm"; //Module Qu???n tr??? quan h??? kh??ch h??ng
  moduleSal = "sal"; //Module Qu???n l?? b??n h??ng
  moduleBuy = "buy"; //Module Qu???n l?? mua h??ng
  moduleAcc = "acc"; //Module Qu???n l?? t??i ch??nh
  moduleHrm = "hrm"; //Module Qu???n tr??? nh??n s???
  moduleSys = "sys"; //Module Qu???n tr??? h??? th???ng
  moduleWar = "war"; //Module Qu???n l?? kho
  modulePro = "pro"; //Module Qu???n l?? d??? ??n
  moduleSalary = "salary"; //Module Qu???n l?? l????ng
  moduleAss = "ass"; //Module Qu???n l?? t??i s???n
  /*End*/

  /*Resource name*/

  //Qu???n l?? h??? th???ng
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
  isManufacture = false;
  companyConfigModel = new CompanyConfigModel();
  userAdmin = false;
  permissionAdmin = false;

  moduled: string;
  titleModuled: string = "MENU";
  lstBreadCrum: Array<BreadCrumMenuModel> = [];
  lstBreadCrumLeftMenu: Array<BreadCrumMenuModel> = [];

  lstSubmenuLevel1: Array<BreadCrumMenuModel> = [
    //Module Home
    {
      Name: "Trang ch???",
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
    //Module h??ng h??a
    {
      Name: "Qu???n l?? h??ng h??a",
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
          Name: "Nguy??n v???t li???u",
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
          Name: "C??ng c???/D???ng c???",
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
          Name: "Th??nh ph???m",
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
    // Module Qu???n l?? kho
    {
      Name: "Qu???n l?? kho",
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
          Name: "Qu???n l?? kho",
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
              Name: "Danh s??ch kho",
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
          Name: "????? ngh??? xu???t kho",
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
              Name: "Danh s??ch ????? ngh???",
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
              Name: "Nh???p kho",
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
              Name: "Xu???t kho",
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
              Name: "B??o c??o t???n kho",
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
              Name: "Ki???m k?? kho",
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
          Name: "Kho th??nh ph???m",
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
              Name: "Kho xu???t",
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
              Name: "Kho nh???p",
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
              Name: "B??o c??o t???n kho",
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
          Name: "Kho s???n xu???t",
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
              Name: "Nh???p kho",
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
              Name: "Xu???t kho",
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
              Name: "T???n Kho",
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
    //Module qu???n l?? s???n xu???t
    {
      Name: "Qu???n l?? s???n xu???t",
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
          Name: "Qu???n l?? quy tr??nh",
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
              Name: "Qu???n l?? danh m???c",
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
              Name: "C???u h??nh quy tr??nh",
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
          Name: "L???nh s???n xu???t",
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
              Name: "Danh s??ch l???nh s???n xu???t",
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
          Name: "Theo d??i s???n xu???t",
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
              Name: "Danh s??ch theo d??i",
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
          Name: "B??o c??o nh??n s???",
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
              Name: "Danh s??ch b??o c??o",
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
          Name: "Nh???t k?? s???n xu???t",
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
              Name: "Danh s??ch b??o c??o",
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
    //Module h??ng h??a
    {
      Name: "Nguy??n v???t li???u",
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
      Name: "C??ng c???/D???ng c???",
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
      Name: "Th??nh ph???m",
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
    // Module Qu???n l?? kho
    {
      Name: "Qu???n l?? kho",
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
          Name: "Danh s??ch kho",
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
      Name: "????? ngh??? xu???t kho",
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
          Name: "Danh s??ch ????? ngh???",
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
          Name: "Nh???p kho",
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
          Name: "Xu???t kho",
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
          Name: "B??o c??o t???n kho",
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
          Name: "Ki???m k?? kho",
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
      Name: "Kho th??nh ph???m",
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
          Name: "Kho xu???t",
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
          Name: "Kho nh???p",
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
          Name: "B??o c??o t???n kho",
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
      Name: "Kho s???n xu???t",
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
          Name: "Nh???p kho",
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
          Name: "Xu???t kho",
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
          Name: "T???n Kho",
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
    //Module qu???n l?? s???n xu???t
    {
      Name: "Qu???n l?? quy tr??nh",
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
          Name: "Qu???n l?? danh m???c",
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
          Name: "C???u h??nh quy tr??nh",
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
      Name: "L???nh s???n xu???t",
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
          Name: "Danh s??ch l???nh s???n xu???t",
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
      Name: "Theo d??i s???n xu???t",
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
          Name: "Danh s??ch theo d??i",
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
      Name: "B??o c??o nh??n s???",
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
          Name: "Danh s??ch b??o c??o",
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
      Name: "Nh???t k?? s???n xu???t",
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
          Name: "Danh s??ch b??o c??o",
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
    // Module Qu???n l?? kho
    {
      Name: "Danh s??ch kho",
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
      Name: "Danh s??ch ????? ngh???",
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
      Name: "Nh???p kho",
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
      Name: "Xu???t kho",
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
      Name: "B??o c??o t???n kho",
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
      Name: "Ki???m k?? kho",
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
      Name: "Kho xu???t",
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
      Name: "Kho nh???p",
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
      Name: "B??o c??o t???n kho",
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
      Name: "Nh???p kho",
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
      Name: "Xu???t kho",
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
      Name: "T???n Kho",
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
    //Module qu???n l?? s???n xu???t
    {
      Name: "Qu???n l?? danh m???c",
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
      Name: "C???u h??nh quy tr??nh",
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
      Name: "Danh s??ch l???nh s???n xu???t",
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
      Name: "Danh s??ch theo d??i",
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
      Name: "Danh s??ch b??o c??o",
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
      Name: "Danh s??ch b??o c??o",
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

  lstSubmenuDetailURL: Array<BreadCrumMenuModel> = [
    {
      Name: "Chi ti???t h???? s?? th????u",
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
      Name: "Chi ti???t c?? h???i",
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
      Name: "Chi ti???t b??o gi??",
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
      Name: "Chi ti???t kh??ch h??ng",
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
      Name: "Chi ti???t ch??m s??c kh??ch h??ng",
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
      Name: "Chi ti???t s???n ph???m d???ch v???",
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
      Name: "Chi ti???t h???p ?????ng",
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
      Name: "Chi ti???t ????n h??ng",
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
      Name: "Chi ti???t ?????t h??ng",
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
      Name: "Chi ti???t nh??n vi??n",
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
      Name: "Chi ti???t xin ngh???",
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
      Name: "Chi ti???t phi???u thu",
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
      Name: "Chi ti???t phi???u chi",
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
      Name: "Chi ti???t b??o c??",
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
      Name: "Chi ti???t UNC",
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
      Name: "Chi ti???t ph???i tr??? nh?? cung c???p",
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
      Name: "Chi ti???t ph???i thu kh??ch h??ng",
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
      Name: "Chi ti???t nh?? cung c???p",
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
      Name: "Chi ti???t ????? xu???t mua h??ng",
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
      Name: "Chi ti???t ????? ngh??? b??o gi?? NCC",
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
      Name: "Chi ti???t phi???u nh???p kho",
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
      Name: "Chi ti???t phi???u xu???t kho",
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
      Name: "Chi ti???t quy tr??nh",
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
      Name: "Chi ti???t ti???n tr??nh",
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
      Name: "Chi ti???t l???nh t???ng",
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
      Name: "Chi ti???t l???nh s???n xu???t",
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
  listMenuBarProject: Array<MenuSubModule> = [];
  /*End*/

  projectId: string = "";

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
    public reSearchService: ReSearchService,
    public projectService: ProjectService
  ) {
    this.listMenuModule = JSON.parse(localStorage.getItem("ListMenuModule"));
    this.listMenuSubModule = JSON.parse(
      localStorage.getItem("ListMenuSubModule")
    );
    this.listMenuPage = JSON.parse(localStorage.getItem("ListMenuPage"));

    this.route.params.subscribe((params) => {
      this.projectId = params["projectId"];
    });
  }

  async ngAfterViewInit() {
    let url = this.location.path();
    await this.buildMenuBar(url);
  }

  async ngOnInit() {
    this.username = localStorage.getItem("Username");
    // this.userAvatar = localStorage.getItem("UserAvatar");
    this.userAvatar = "";
    this.userFullName = localStorage.getItem("UserFullName");
    this.userEmail = localStorage.getItem("UserEmail");
    this.getNotification();
    await this.getListModuleAndResource();

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
      //????ng menu Level 1 khi di ra ngo??i
      var logo = $("#logo");
      var module_content = $("#module-content");
      if (!logo.is(e.target) && !module_content.is(e.target)) {
        this.module_display_value = "none";
        this.updateLeftMenu.emit(false);
      }

      //????ng menu Level 2 khi di ra ngo??i c??ng
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

    await this.createBreadCrum();
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

  // M??? giao di???n ?????i Password
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
        (error) => {}
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
                this.NotificationContent.split(" ").indexOf("th??ng") + 1
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
        (error) => {}
      );
  }

  //L???y ra list module v?? list resource c???a user
  async getListModuleAndResource() {
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

  //Ki???m tra user ???????c quy???n th???y c??c module n??o tr??n trang home:
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
        Title = "Qu???n l?? kh??ch h??ng";
        oldParam = "customer";
        break;
      case "sal":
        this.isSales = true;
        this.translate.get("module_system.title.sal").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n l?? h??ng h??a";
        oldParam = "sales";
        break;
      case "buy":
        this.isShopping = true;
        this.translate.get("module_system.title.pay").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n l?? mua h??ng";
        oldParam = "shopping";
        break;
      case "acc":
        this.isAccounting = true;
        this.translate.get("module_system.title.acc").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n l?? t??i ch??nh";
        oldParam = "accounting";
        break;
      case "hrm":
        this.isHrm = true;
        this.translate.get("module_system.title.emp").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n l?? nh??n s???";
        oldParam = "employee";
        break;
      case "war":
        this.isWarehouse = true;
        this.translate.get("module_system.title.war").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n l?? kho";
        oldParam = "warehouse";
        break;
      case "man":
        this.isManufacture = true;
        this.translate.get("module_system.title.man").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n l?? s???n xu???t";
        oldParam = "manufacture";
        break;
      case "pro":
        this.isProject = true;
        this.translate.get("module_system.title.pro").subscribe((value) => {
          this.titleModuled = value;
        });
        Title = "Qu???n tr??? d??? ??n";
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

    //---------------????ng Menu Level 1-----------
    this.module_display = !this.module_display;
    if (this.module_display) {
      this.module_display_value = "block";
    } else {
      this.module_display_value = "none";
    }
    localStorage.setItem("menuMapPath", JSON.stringify(this.lstBreadCrum));

    this.updateLeftMenuFromHead(module, this.lstSubmenuLevel3);
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
  }

  openMenuLevel2(item) {
    //---------------????ng Menu Level 1-----------
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

  openMenuLevel3(MenuCode, Title, module, IsOpenAlways) {
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

    //Ki???m tra reset b??? l???c
    this.resetSearchModel(path);

    this.router.navigate([path]);
  }

  updateLeftMenuFromHead(
    module: string,
    lstSubmenuLevel3: Array<BreadCrumMenuModel>
  ) {
    let MenuLevel2 = this.lstSubmenuLevel2.filter(
      (e) => e.ObjectType == module
    );
    if (MenuLevel2.length > 0) {
      MenuLevel2.forEach(function (item) {
        item.LstChildren = [];
        let MenuLevel3 = lstSubmenuLevel3.filter(
          (e) => e.CodeParent == item.CodeParent
        );
        item.LstChildren.push.apply(item.LstChildren, MenuLevel3);
      });
    }
    this.getPemistion();
    this.getPemistionMenu2(MenuLevel2);
    this.lstBreadCrumLeftMenu = [];
    this.lstBreadCrumLeftMenu.push.apply(this.lstBreadCrumLeftMenu, MenuLevel2);
    localStorage.setItem(
      "lstBreadCrumLeftMenu",
      JSON.stringify(this.lstBreadCrumLeftMenu)
    );
    this.eventEmitterService.updateLeftMenuClick();
  }

  getPemistion() {
    this.lstSubmenuLevel1.forEach((item) => {
      item.LstChildren.forEach((element) => {
        element.LstChildren.forEach((role) => {
          let resource = item.ObjectType + role.Path;
          let permission: any = this.getPermission.getPermissionLocal(
            this.listPermissionResourceActive,
            resource
          );
          if (permission.status == false) {
            role.Active = true;
          } else {
            role.Active = false;
          }
        });
        let countElement = element.LstChildren.filter((f) => f.Active == true);
        if (countElement.length == element.LstChildren.length) {
          element.Active = true;
        } else element.Active = false;
      });
      let countItem = item.LstChildren.filter((f) => f.Active == true);
      if (countItem.length == item.LstChildren.length) {
        item.Active = true;
      } else item.Active = false;
    });
  }

  getPemistionMenu2(obj) {
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
    //obj.forEach(item => {
    //  item.LstChildren.forEach(element => {
    //    let resource = element.ObjectType + element.Path;
    //    let permission: any = this.getPermission.getPermissionLocal(this.listPermissionResourceActive, resource);
    //    if (permission.status == false) {
    //      element.Active = true;
    //    }
    //    else {
    //      element.Active = false;
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

  async createBreadCrum() {
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
              Title = "Qu???n l?? h??? th???ng";
              break;
            case "customer":
              this.translate
                .get("module_system.title.crm")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? kh??ch h??ng";
              break;
            case "sales":
              this.translate
                .get("module_system.title.sal")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? h??ng h??a";
              break;
            case "shopping":
              this.translate
                .get("module_system.title.pay")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? mua h??ng";
              break;
            case "accounting":
              this.translate
                .get("module_system.title.acc")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? t??i ch??nh";
              break;
            case "employee":
              this.translate
                .get("module_system.title.emp")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? nh??n s???";
              break;
            case "warehouse":
              this.translate
                .get("module_system.title.war")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? kho";
              break;
            case "manufacture":
              this.translate
                .get("module_system.title.man")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n l?? s???n xu???t";
              break;
            case "project":
              this.translate
                .get("module_system.title.pro")
                .subscribe((value) => {
                  this.titleModuled = value;
                });
              Title = "Qu???n tr??? d??? ??n";
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
            this.lstSubmenuLevel3
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
                  Title = "Qu???n l?? h??? th???ng";
                  break;
                case "customer":
                  this.translate
                    .get("module_system.title.crm")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? kh??ch h??ng";

                  break;
                case "sales":
                  this.translate
                    .get("module_system.title.sal")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? h??ng h??a";
                  break;
                case "shopping":
                  this.translate
                    .get("module_system.title.pay")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? mua h??ng";
                  break;
                case "accounting":
                  this.translate
                    .get("module_system.title.acc")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? t??i ch??nh";
                  break;
                case "employee":
                  this.translate
                    .get("module_system.title.emp")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? nh??n s???";
                  break;
                case "warehouse":
                  this.translate
                    .get("module_system.title.war")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? kho";
                  break;
                case "man":
                  this.translate
                    .get("module_system.title.man")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n l?? s???n xu???t";
                  break;
                case "project":
                  this.translate
                    .get("module_system.title.pro")
                    .subscribe((value) => {
                      this.titleModuled = value;
                    });
                  Title = "Qu???n tr??? d??? ??n";
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
                this.lstSubmenuLevel3
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
                Title = "Qu???n l?? h??? th???ng";
                break;
              case "customer":
                this.translate
                  .get("module_system.title.crm")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? kh??ch h??ng";

                break;
              case "sales":
                this.translate
                  .get("module_system.title.sal")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? h??ng h??a";
                break;
              case "shopping":
                this.translate
                  .get("module_system.title.pay")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? mua h??ng";
                break;
              case "accounting":
                this.translate
                  .get("module_system.title.acc")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? t??i ch??nh";
                break;
              case "employee":
                this.translate
                  .get("module_system.title.emp")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? nh??n s???";
                break;
              case "warehouse":
                this.translate
                  .get("module_system.title.war")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? kho";
                break;
              case "man":
                this.translate
                  .get("module_system.title.man")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n l?? s???n xu???t";
                break;
              case "project":
                this.translate
                  .get("module_system.title.pro")
                  .subscribe((value) => {
                    this.titleModuled = value;
                  });
                Title = "Qu???n tr??? d??? ??n";
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
              this.lstSubmenuLevel3
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
                    Title = "Qu???n l?? h??? th???ng";
                    break;
                  case "customer":
                    this.translate
                      .get("module_system.title.crm")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? kh??ch h??ng";
                    break;
                  case "sales":
                    this.translate
                      .get("module_system.title.sal")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? h??ng h??a";
                    break;
                  case "shopping":
                    this.translate
                      .get("module_system.title.pay")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? mua h??ng";
                    break;
                  case "accounting":
                    this.translate
                      .get("module_system.title.acc")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? t??i ch??nh";
                    break;
                  case "employee":
                    this.translate
                      .get("module_system.title.emp")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? nh??n s???";
                    break;
                  case "warehouse":
                    this.translate
                      .get("module_system.title.war")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? kho";
                    break;
                  case "man":
                    this.translate
                      .get("module_system.title.man")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n l?? s???n xu???t";
                    break;
                  case "project":
                    this.translate
                      .get("module_system.title.pro")
                      .subscribe((value) => {
                        this.titleModuled = value;
                      });
                    Title = "Qu???n tr??? d??? ??n";
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
                  this.lstSubmenuLevel3
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

  async buildMenuBar(currentUrl: string) {
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
    this.listMenuBarProject = [];

    var page = this.listMenuPage.find((x) => x.path == currentUrl);

    if (page) {
      let subMenu = this.listMenuSubModule.find(
        (x) => x.code == page.codeParent
      );
      this.listMenuBarProject = this.listMenuSubModule.filter(
        (x) => x.codeParent == subMenu.codeParent
      );

      this.listMenuBarProject.forEach((item) => {
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

      this.listMenuBarProject.forEach((item) => {
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

      if (this.projectId) {
        await this.projectService
          .getPermission(this.projectId, this.auth.UserId)
          .subscribe((response) => {
            let result: any = response;
            if (result.statusCode == 200) {
              let permissionStr = result.permissionStr;
              this.listMenuBarProject.forEach((item) => {
                if (item.path != "" && !permissionStr.includes(item.path)) {
                  item.isShow = false;
                }
              });

              this.listMenuBar = this.listMenuBarProject;
            }
          });
      }
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
    //N???u kh??ng ph???i item mask
    if (item.indexOrder != 1) {
      this.listMenuBar.forEach((x) => (x.isShowChildren = false));
      if (item.path != null && item.path?.trim() != "") {
        //Ki???m tra reset b??? l???c
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

    //Ki???m tra reset b??? l???c
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

  //Ki???m tra reset b??? l???c
  resetSearchModel(path) {
    this.reSearchService.resetSearchModel(path);
  }
}
