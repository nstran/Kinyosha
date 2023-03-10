import { Component, OnInit, Input, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { CompanyService } from '../../services/company.service';
import { ChangepasswordComponent } from '../changepassword/changepassword.component';
import { UserprofileComponent } from "../../../userprofile/userprofile.component"
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { AuthenticationService } from '../../services/authentication.service';

import { BreadCrumMenuModel } from '../../models/breadCrumMenu.model';
import { CompanyConfigModel } from '../../models/companyConfig.model';
import { MenuItem } from 'primeng/api';

import * as $ from 'jquery';
import { GetPermission } from '../../permission/get-permission';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  @ViewChild(MenuComponent, { static: true }) menuComponent;

  @ViewChild('toggleNotifi') toggleNotifi: ElementRef;
  isOpenNotifi: boolean = false;

  @ViewChild('toggleConfig') toggleConfig: ElementRef;
  isOpenConfig: boolean = false;

  @ViewChild('toggleCreateElement') toggleCreateElement: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu: ElementRef;
  isOpenCreateElement: boolean = false;

  @ViewChild('toggleUser') toggleUser: ElementRef;
  isOpenUser: boolean = false;

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  applicationName = this.getDefaultApplicationName();



  companyConfigModel = new CompanyConfigModel();
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

  lstSubmenuLevel3: Array<BreadCrumMenuModel> = [
    //Quan ly he thong
    { Name: "S?? ????? t???? ch????c", Path: "/admin/organization", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "device_hub", IsDefault: true, CodeParent: "sys_sdtc", LstChildren: [], Display: "none", Code: '' },
    { Name: "Tham s??? h??? th???ng", Path: "/admin/system-parameter", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings_applications", IsDefault: true, CodeParent: "sys_tsht", LstChildren: [], Display: "none", Code: '' },
    { Name: "Qu???n l?? ng?????i d??ng", Path: "/employee/list", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "filter_list", IsDefault: true, CodeParent: "sys_phkh", LstChildren: [], Display: "none", Code: '' },
    { Name: "Qu???n l?? nh??m quy???n", Path: "/admin/permission", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "sys_nq", LstChildren: [], Display: "none", Code: '' },
    { Name: "Qua??n ly?? danh m???c", Path: "/admin/masterdata", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "category", IsDefault: true, CodeParent: "sys_dldm", LstChildren: [], Display: "none", Code: '' },
    { Name: "Qu???n l?? th??ng b??o", Path: "/admin/notifi-setting-list", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_tb", LstChildren: [], Display: "none", Code: '' },
    { Name: "Qua??n ly?? quy tr??nh", Path: "/admin/danh-sach-quy-trinh", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "swap_horiz", IsDefault: true, CodeParent: "sys_qtlv", LstChildren: [], Display: "none", Code: '' },

    //{ Name: "C???u h??nh th??ng tin chung", Path: "/admin/company-config", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_chttc", LstChildren: [], Display: "none", Code: '' },
    //{ Name: "C???u h??nh th?? m???c", Path: "/admin/folder-config", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_chtm", LstChildren: [], Display: "none", Code: '' },
    //{ Name: "Qua??n ly?? m???u Email", Path: "/admin/email-configuration", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "device_hub", IsDefault: true, CodeParent: "Systems_QLE", LstChildren: [], Display: "none", Code: '' },
    //{ Name: "Ph??n ha??ng kha??ch ha??ng", Path: "/admin/config-level-customer", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "filter_list", IsDefault: true, CodeParent: "sys_phkh", LstChildren: [], Display: "none", Code: '' },
    //{ Name: "Nh???t k?? h??? th???ng", Path: "/admin/audit-trace", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "menu_book", IsDefault: true, CodeParent: "sys_log", LstChildren: [], Display: "none", Code: '' },
    //{ Name: "K??? ho???ch kinh doanh", Path: "/admin/business-goals", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "menu_book", IsDefault: true, CodeParent: "sys_khkd", LstChildren: [], Display: "none", Code: '' },
  ];

  // lstSubmenuLevel3Create: Array<BreadCrumMenuModel> = [
  //   //Quan ly he thong
  //   { Name: "T???o c?? h???i", Path: "/lead/create-lead", ObjectType: "crm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "crm_ch", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o b??o gi??", Path: "/customer/quote-create", ObjectType: "crm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "crm_bg", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o kh??ch h??ng", Path: "/customer/create", ObjectType: "crm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "crm_kh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o s???n ph???m", Path: "/product/create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_spdv", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o h???p ?????ng b??n", Path: "/sales/contract-create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_hdb", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o ????n h??ng", Path: "/order/create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_dh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o h??a ????n", Path: "/bill-sale/create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_hd", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Ta??o nh?? cung c????p", Path: "/vendor/create", ObjectType: "buy", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "buy_ncc", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o ????? xu???t mua h??ng", Path: "/procurement-request/create", ObjectType: "buy", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "buy_dxmh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o phi???u thu", Path: "/accounting/cash-receipts-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_tm", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o phi???u chi", Path: "/accounting/cash-payments-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_tm", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o b??o c??", Path: "/accounting/bank-receipts-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_nh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o UNC", Path: "/accounting/bank-payments-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_nh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o nh??n vi??n", Path: "/employee/create", ObjectType: "hrm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "hrm_nv", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o phi???u nh???p kho", Path: "/warehouse/inventory-receiving-voucher/create", ObjectType: "war", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "war_nk", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "T???o phi???u xu???t kho", Path: "/warehouse/inventory-delivery-voucher/create-update", ObjectType: "war", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "war_xk", LstChildren: [], Display: "none", Code: '' },
  // ];

  items: MenuItem[] = [
    {
      label: 'CRM',
      items: [
        // { label: 'T???o kh??ch h??ng ti???m n??ng', url: '/customer/potential-customer-create' },
        { label: 'T???o c?? h???i', routerLink: '/lead/create-lead' },
        { label: 'T???o b??o gi??', routerLink: '/customer/quote-create' },
        { label: 'T???o Kh??ch h??ng', routerLink: '/customer/create' },
      ]
    },
    {
      label: 'B??n h??ng',
      items: [
        { label: 'T???o s???n ph???m', routerLink: '/product/create' },
        { label: 'T???o h???p ?????ng b??n', routerLink: '/sales/contract-create' },
        { label: 'T???o ????n h??ng', routerLink: '/order/create' },
        { label: 'T???o h??a ????n', routerLink: '/bill-sale/create' },
      ]
    },
    {
      label: 'Mua h??ng',
      items: [
        { label: 'T???o nh?? cung c???p', routerLink: '/vendor/create' },
        { label: 'T???o ????? xu???t mua h??ng', routerLink: '/procurement-request/create' },
      ]
    },
    {
      label: 'T??i ch??nh',
      items: [
        { label: 'T???o phi???u thu', routerLink: '/accounting/cash-receipts-create' },
        { label: 'T???o phi???u chi', routerLink: '/accounting/cash-payments-create' },
        { label: 'T???o b??o c??', routerLink: '/accounting/bank-receipts-create' },
        { label: 'T???o UNC', routerLink: '/accounting/bank-payments-create' },
      ]
    },
    {
      label: 'Nh??n s???',
      items: [
        { label: 'Nh??n vi??n', routerLink: '/employee/create' },
      ]
    },
    {
      label: 'Kho',
      items: [
        { label: 'T???o phi???u nh???p kho', routerLink: '/warehouse/inventory-receiving-voucher/create' },
        { label: 'T???o phi???u xu???t kho', routerLink: '/warehouse/inventory-delivery-voucher/create-update' }
      ]
    },
    {
      label: 'D??? ??n',
      items: [
        { label: 'T???o m???c d??? ??n', routerLink: '/home' },
        { label: 'T???o h???ng m???c', routerLink: '/home' },
        { label: 'T???o ngu???n l???c', routerLink: '/home' },
        { label: 'T???o c??ng vi???c', routerLink: '/project/create-project-task' },
        { label: 'T???o t??i li???u', routerLink: '/home' },
      ]
    }
  ];

  listPermissionResourceActive: string = localStorage.getItem("ListPermissionResource");
  constructor(
    private router: Router,
    private getPermission: GetPermission,
    private notiService: NotificationService,
    private authenticationService: AuthenticationService,
    private companyService: CompanyService,
    public dialog: MatDialog,
    private renderer: Renderer2,
  ) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.toggleNotifi) {
        //???n hi???n khi click Th??ng b??o
        if (this.toggleNotifi.nativeElement.contains(e.target)) {
          this.isOpenNotifi = !this.isOpenNotifi;
        } else {
          this.isOpenNotifi = false;
        }

        //???n hi???n khi click T???o m???i
        if (this.toggleCreateElement.nativeElement.contains(e.target)) {
          this.isOpenCreateElement = !this.isOpenCreateElement;
        } else {
          this.isOpenCreateElement = false;
        }

        //???n hi???n khi click Config
        if (this.toggleConfig.nativeElement.contains(e.target)) {
          this.isOpenConfig = !this.isOpenConfig;
        } else {
          this.isOpenConfig = false;
        }

        //???n hi???n khi click User
        if (this.toggleUser.nativeElement.contains(e.target)) {
          this.isOpenUser = !this.isOpenUser;
        } else {
          this.isOpenUser = false;
        }
      }
      if (this.dropdownMenu) {
        //???n hi???n khi click menu item t???o m???i
        if (this.dropdownMenu.nativeElement.contains(e.target)) {
          this.isOpenCreateElement = !this.isOpenCreateElement;
        } else {
          this.isOpenCreateElement = false;
        }
      }
    });
  }

  ngOnInit() {
    this.getCompany();
    this.getNotification();

    this.username = localStorage.getItem("Username");
    // this.userAvatar = localStorage.getItem("UserAvatar");
    this.userAvatar = '';
    this.userFullName = localStorage.getItem("UserFullName");
    this.userEmail = localStorage.getItem("UserEmail");

    // this.getPemistionMenu2();
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

  getCompany() {
    this.companyService.getCompanyConfig().subscribe(response => {
      const result = <any>response;
      this.companyConfigModel = result.companyConfig;
      this.companyConfigModel = <CompanyConfigModel>({
        companyId: result.companyConfig.companyId,
        companyName: result.companyConfig.companyName,
        email: result.companyConfig.email,
        phone: result.companyConfig.phone,
        taxCode: result.companyConfig.taxCode,
        bankAccountId: result.companyConfig.bankAccountId,
        companyAddress: result.companyConfig.companyAddress,
        contactName: result.companyConfig.contactName,
        contactRole: result.companyConfig.contactRole
      });
    }, error => { });
  }

  getNotification() {
    this.notiService.getNotification(this.auth.EmployeeId, this.auth.UserId).subscribe(response => {
      var result = <any>response;
      this.notificationNumber = result.numberOfUncheckedNoti;
      this.notificationList = result.shortNotificationList;
    }, error => { })
  }

  // openConfigElement() {
  //   $("#sys-config").toggle();
  // }

  // openCreateElement() {
  //   $("#create-config").toggle();
  // }

  // openNotification() {
  //   $("#notification-content").toggle();
  // }

  goToNotiUrl(item: any, notificationId: string, id: string, code: string) {
    this.notiService.removeNotification(notificationId, this.auth.UserId).subscribe(response => {
      this.loading = true;
      if (code == "PRO_REQ") {
        this.router.navigate(['/procurement-request/view', { id: id }]);
      }
      if (code == "PAY_REQ") {
        this.router.navigate(['/accounting/payment-request-detail', { requestId: id }]);
      }
      if (code == "EMP_REQ") {
        this.router.navigate(['/employee/request/detail', { requestId: id }]);
      }
      if (code == "EMP_SLR") {
        this.NotificationContent = item.content;
        let month = this.NotificationContent.split(" ")[this.NotificationContent.split(" ").indexOf("th??ng") + 1];
        this.router.navigate(['employee/employee-salary/list', { MonthSalaryRequestParam: month }]);
      }
      if (code == "TEA_SLR") {
        this.router.navigate(['/employee/teacher-salary/list']);
      }
      if (code == "AST_SLR") {
        this.router.navigate(['/employee/assistant-salary/list']);
      }
      this.loading = false;
    }, error => {
    });
  }

  goToNotification() {
    //this.notificationNumber = 0;
    this.router.navigate(['/notification']);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  // M??? giao di???n ?????i Password
  openChangePassword() {
    let account = this.username;
    let _name = this.userFullName;
    let _email = this.userEmail;
    let _avatar = this.userAvatar;
    this.dialogRef = this.dialog.open(ChangepasswordComponent,
      {
        data: { accountName: account, name: _name, email: _email, avatar: _avatar }
      });
    this.dialogRef.afterClosed().subscribe(result => {
    });
    $("#user-content").toggle();

  }
  //Ket thuc

  // Mo giao dien UserProfile
  goToViewProfile() {
    this.router.navigate(['/userprofile']);
  }

  goToUrlSysConfig(Path) {
    this.router.navigate([Path]);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  onUpdateLeftMenu(event: boolean) {
    if (event) {
      this.menuComponent.updateLeftMenu();
    }
  }

  getDefaultApplicationName() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "ApplicationName").systemValueString;
  }
}
