import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { CustomerImportComponent } from '../customer-import/customer-import.component';
import { CustomerDownloadTemplateComponent } from '../customer-download-template/customer-download-template.component';
import { SendEmailDialogComponent } from '../../../shared/components/send-email-dialog/send-email-dialog.component';
import { SendSmsDialogComponent } from '../../../shared/components/send-sms-dialog/send-sms-dialog.component';
import { EmployeeService } from "../../../employee/services/employee.service";
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from "../../../shared/services/category.service";
import { CustomerService } from '../../services/customer.service';
import { CustomerModel } from "../../models/customer.model";
import { GetPermission } from '../../../shared/permission/get-permission';

import { ngxLoadingAnimationTypes, NgxLoadingComponent } from "ngx-loading";
import { SortEvent } from 'primeng/api';
import { MenuItem } from "primeng/primeng";
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';

class NewCustomerModel {
  public index: number;
  public customerId: string;
  public contactId: string;
  public customerName: string;
  public customerCode: string;
  public picName: string;
  public customerEmail: string;
  public customerPhone: string;
  public countCustomerInfo: number;
  public statusName: string;
  public backgroupStatus: string;
}

class CustomerLevel {
  public customerServiceLevelId: string;
  public customerServiceLevelName: string;
}

class Employee {
  public employeeId: string;
  public employeeName: string;
  public employeeCode: string;
  public active: boolean
}

class CustomerGroup {
  public categoryId: string;
  public categoryName: string;
  public categoryCode: string;
}

class SearchCustomerModel {
  public FirstName: string;
  public LastName: string;
  public Phone: string;
  public Email: string;
  public CustomerServiceLevelIdList: Array<string>;
  public CustomerGroupIdList: Array<string>;
  public PersonInChargeIdList: Array<string>;
  public NoPic: boolean;
  public IsBusinessCus: boolean;
  public IsPersonalCus: boolean;
  public IsIdentificationCus : boolean;
  public IsFreeCus : boolean;
  public IsHKDCus: boolean;
  public CustomerCode: string;
  public TaxCode: string;
  public UserId: string;
  constructor() {
    this.CustomerServiceLevelIdList = [];
    this.CustomerGroupIdList = [];
    this.PersonInChargeIdList = [];
  }
}

@Component({
  selector: 'app-customer-request-approval',
  templateUrl: './customer-request-approval.component.html',
  styleUrls: ['./customer-request-approval.component.css'],
  providers: [DialogService]
})
export class CustomerRequestApprovalComponent implements OnInit {
  @ViewChild('table', { static: true }) table: Table;
  filterGlobal: string;
  innerWidth: number = 0; //number window size first
  loadingComponent: boolean = false;
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  customerCode: string = '';
  startDate: Date = new Date();
  minYear: number = 2015;
  currentYear: number = (new Date()).getFullYear();
  endDate: Date = new Date();
  maxEndDate: Date = new Date();
  selectedColumns: any[];
  colsCustomer: any[];
  newListCustomer: Array<NewCustomerModel> = [];
  rows = 10;
  selectedCustomers: Array<NewCustomerModel> = [];
  actions: MenuItem[] = [];
  filterForm: FormGroup;
  //master data
  customerGroups: Array<CustomerGroup> = [];
  serviceLevels: Array<CustomerLevel> = [];
  employees: Array<Employee> = [];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  isManager: boolean = null;
  employeeId: string = '';

  userPermission: any = localStorage.getItem("UserPermission").split(',');
  createPermission: string = 'customer/create';
  importPermission: string = 'import/create';
  exportPermission: string = 'export/create';
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listCustomer: Array<CustomerModel> = [];
  selection: SelectionModel<CustomerModel>;
  selectedCustomerIdList: Array<string> = [];

  customerGroupCode: string = 'NHA';
  pics: Array<any> = [];
  filteredServiceLevel: Observable<string[]>;
  filteredCustomerGroup: Observable<string[]>;
  filteredPic: Observable<string[]>;
  serviceLevelCtrl = new FormControl();
  customerGroupCtrl = new FormControl();
  picCtrl = new FormControl();
  selectedServiceLevel: Array<any> = [];
  selectedCustomerGroup: Array<any> = [];

  customerGroup: string = '';
  serviceLevel: string = '';
  taxCode: string = '';
  customerType: number = 2;
  isFreeCustomer: boolean = true;

  /* Action*/
  actionApproval: boolean = true;
  actionReject: boolean = true;
  actionAdd: boolean = true;
  actionDownload: boolean = true;
  actionDelete: boolean = true;
  actionEdit: boolean = true;
  actionImport: boolean = true;
  actionSMS: boolean = true;
  actionEmail: boolean = true;
  /*END*/

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  paramUrl : any;
  noPic: boolean = false;
  businessOnly: boolean = true;
  personalOnly: boolean = true;
  hkd: boolean = true;
  customerLevelName: string;

  @ViewChild('ngxLoading') ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  loadingConfig: any = {
    'animationType': ngxLoadingAnimationTypes.circle,
    'backdropBackgroundColour': 'rgba(0,0,0,0.1)',
    'backdropBorderRadius': '4px',
    'primaryColour': '#ffffff',
    'secondaryColour': '#999999',
    'tertiaryColour': '#ffffff'
  }
  selectedCustomerList: Array<any> = [];

  constructor(
    private dialogService: DialogService,
    private router: Router,
    private getPermission: GetPermission,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private customerService: CustomerService,
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) {
    translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    //Kiểm tra nhân viên hoặc quản lý
    this.isManager = localStorage.getItem('IsManager') === "true" ? true : false;
    this.employeeId = JSON.parse(localStorage.getItem('auth')).EmployeeId;

    //Check permission
    let resource = "crm/customer/request-approval";
    let permission: any = await this.getPermission.getPermission(resource);

    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("approve") == -1) {
        this.actionApproval = false;
      }
      if (listCurrentActionResource.indexOf("reject") == -1) {
        this.actionReject = false;
      }
      // if (listCurrentActionResource.indexOf("add") == -1) {
      //   this.actionAdd = false;
      // }
      // if (listCurrentActionResource.indexOf("download") == -1) {
      //   this.actionDownload = false;
      // }
      // if (listCurrentActionResource.indexOf("delete") == -1) {
      //   this.actionDelete = false;
      // }
      // if (listCurrentActionResource.indexOf("edit") == -1) {
      //   this.actionEdit = false;
      // }
      // if (listCurrentActionResource.indexOf("import") == -1) {
      //   this.actionImport = false;
      // }
      // if (listCurrentActionResource.indexOf("sms") == -1) {
      //   this.actionSMS = false;
      // }
      // if (listCurrentActionResource.indexOf("email") == -1) {
      //   this.actionEmail = false;
      // }
      this.initTable();
      this.initForm();
      this.paramUrl = this.route.params.subscribe(param =>{
        if(param['mode']){
          if(param['mode'] == 'Identification'){
            this.filterForm.controls['IsIdentificationCustomer'].setValue(true);
            this.filterForm.controls['IsFreeCustomer'].setValue(false);
            this.filterForm.updateValueAndValidity();
          }else if(param['mode'] == 'Free'){
            this.filterForm.controls['IsIdentificationCustomer'].setValue(false);
            this.filterForm.controls['IsFreeCustomer'].setValue(true);
            this.filterForm.updateValueAndValidity();
          }
          this.getMasterData();
        }else{
          this.filterForm.controls['IsIdentificationCustomer'].setValue(true);
          this.filterForm.controls['IsFreeCustomer'].setValue(true);
          this.filterForm.updateValueAndValidity();
          this.getMasterData();
        }
      });
    }
  }

  initTable() {
    this.selectedColumns = [
      { field: 'customerName', header: 'Tên khách hàng', textAlign: 'left', display: 'table-cell' },
      { field: 'customerEmail', header: 'Email', textAlign: 'left', display: 'table-cell' },
      { field: 'customerPhone', header: 'Số điện thoại', textAlign: 'left', display: 'table-cell' },
      { field: 'statusName', header: 'Trạng thái', textAlign: 'center', display: 'table-cell' },
      { field: 'picName', header: 'Người phụ trách', textAlign: 'left', display: 'table-cell' },
    ];
    this.colsCustomer = this.selectedColumns;
  }

  initForm() {
    this.filterForm = new FormGroup({
      'Name': new FormControl(''),
      'Phone': new FormControl(''),
      'Email': new FormControl(''),
      'Level': new FormControl(null),
      'Group': new FormControl(null),
      'Pic': new FormControl(null),
      'CustomerCode': new FormControl(''),
      'TaxCode': new FormControl(''),
      'HavePic': new FormControl(false),
      'IsCompanyCustomer': new FormControl(true),
      'IsPersonalCustomer': new FormControl(true),
      'IsHouseCustomer': new FormControl(true),
      'IsIdentificationCustomer' : new FormControl(true),
      'IsFreeCustomer' : new FormControl(true),
    });
  }

  resetTable() {
    this.filterGlobal = '';
    this.table.sortOrder = 0;
    this.table.sortField = '';
    this.table.reset();
  }

  resetForm() {
    this.filterForm.patchValue({
      'Name': '',
      'Phone': '',
      'Email': '',
      'Level': null,
      'Group': null,
      'Pic': null,
      'CustomerCode': '',
      'TaxCode': '',
      'HavePic': false,
      'IsCompanyCustomer': true,
      'IsPersonalCustomer': true,
      'IsHouseCustomer': true,
      'IsIdentificationCustomer': true,
      'IsFreeCustomer': 2,
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  searchCustomer() {
    //reset table
    this.resetTable();
    this.isFreeCustomer = this.customerType == 2 ? true : false;

    let searchCustomerModel = this.mappingFomrToModel();
    this.loadingComponent = true;
    this.customerService.searchCustomerApproval(searchCustomerModel.FirstName, searchCustomerModel.LastName, searchCustomerModel.Phone,
      searchCustomerModel.Email, searchCustomerModel.CustomerServiceLevelIdList,
      searchCustomerModel.CustomerGroupIdList, searchCustomerModel.PersonInChargeIdList,
      searchCustomerModel.NoPic, searchCustomerModel.IsBusinessCus, searchCustomerModel.IsPersonalCus, searchCustomerModel.IsIdentificationCus, searchCustomerModel.IsFreeCus,
      searchCustomerModel.IsHKDCus, searchCustomerModel.CustomerCode, searchCustomerModel.TaxCode, searchCustomerModel.UserId).subscribe(response => {
        this.loadingComponent = false;
        let result = <any>response;
        if (result.statusCode === 200) {
          this.newListCustomer = result.listCustomer;
          this.setIndex();
          if (this.newListCustomer.length === 0) {
            let mgs = { severity: 'warn', summary: 'Thông báo:', detail: 'Không tìm thấy khách hàng nào!' };
            this.showMessage(mgs);
          }
        } else {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(mgs);
        }
      });
  }

  setIndex(){
    this.newListCustomer.forEach((customer, index) => {
      customer.index = index + 1;
    });
  }

  async getMasterData() {
    this.loadingComponent = true;
    let [getListCustomerAsyncResponse, getEmployeeCareStaffAsyncResponse]: any = await Promise.all([
      this.customerService.getListCustomerAsync("NHA"),
      this.employeeService.getEmployeeCareStaffAsyc(this.isManager, this.employeeId)
    ]);
    //loai khach  hang portal
    this.customerGroups = getListCustomerAsyncResponse.listCategoryModel.filter(e => e.categoryCode !== "POR");
    this.serviceLevels = getListCustomerAsyncResponse.listCustomerServiceLevelModel;
    this.employees = getEmployeeCareStaffAsyncResponse.employeeList;

    this.searchCustomer();
  }

  mappingFomrToModel(): SearchCustomerModel {
    let searchCustomer = new SearchCustomerModel();
    searchCustomer.FirstName = this.filterForm.get('Name').value;
    searchCustomer.LastName = ''; //default value = empty
    searchCustomer.Phone = this.filterForm.get('Phone').value;
    searchCustomer.Email = this.filterForm.get('Email').value;

    //get level id
    let levelIdFormValue = this.filterForm.get('Level').value;
    let levelId = levelIdFormValue === null ? this.emptyGuid : levelIdFormValue.customerServiceLevelId;
    if (levelId !== this.emptyGuid) {
      searchCustomer.CustomerServiceLevelIdList.push(levelId);
    }

    //get customer group id
    let groupIdFormValue = this.filterForm.get('Group').value;
    let groupId = groupIdFormValue === null ? this.emptyGuid : groupIdFormValue.categoryId;
    if (groupId !== this.emptyGuid) {
      searchCustomer.CustomerGroupIdList.push(groupId);
    }

    //get pic id
    let picIdValue = this.filterForm.get('Pic').value;
    let picId = picIdValue === null ? this.emptyGuid : picIdValue.employeeId;
    if (picId !== this.emptyGuid) {
      searchCustomer.PersonInChargeIdList.push(picId);
    }
    searchCustomer.NoPic = this.filterForm.get('HavePic').value;
    searchCustomer.IsBusinessCus = this.filterForm.get('IsCompanyCustomer').value;
    searchCustomer.IsPersonalCus = this.filterForm.get('IsPersonalCustomer').value;
    searchCustomer.IsHKDCus = this.filterForm.get('IsHouseCustomer').value;
    searchCustomer.CustomerCode = this.filterForm.get('CustomerCode').value;
    searchCustomer.TaxCode = this.filterForm.get('TaxCode').value;
    searchCustomer.UserId = this.auth.UserId;
    searchCustomer.IsIdentificationCus = this.customerType == 1 ? true : false; // this.filterForm.get('IsIdentificationCustomer').value;
    searchCustomer.IsFreeCus = this.customerType == 2 ? true : false; // this.filterForm.get('IsFreeCustomer').value;

    return searchCustomer;
  }

  goToCreate() {
    this.router.navigate(['/customer/create']);
  }

  //redirect đến trang tạo báo giá
  goToNewCustomerQuote() {
    this.router.navigate(['/customer/quote-create']);
  }

  goToCustomerQuote(customerId: string) {
    this.router.navigate(['/customer/quote-create', {
      customerId: customerId
    }]);
  }

  //redirect đến trang tạo Don Hang
  goToNewCustomerOrder() {
    this.router.navigate(['/order/create']);
  }


  goToCustomerOrder(customerId: string) {
    this.router.navigate(['/order/create', {
      customerId: customerId
    }]);
  }

  //send email
  send_email(customerId: any) {
    this.selectedCustomerList = [];
    this.selectedCustomerList.push(customerId);

    let ref = this.dialogService.open(SendEmailDialogComponent, {
      data: {
        leadIdList: this.selectedCustomerList
      },
      header: 'Gửi email',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "800px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          switch (result.message) {
            case "success":
              let msg1 = { severity:'success', summary: 'Thông báo:', detail: 'Gửi email thành công'};
              this.showMessage(msg1);
              break;
              case "warning":
                let msg2 = { severity:'warn', summary: 'Thông báo:', detail: result.messageCode};
                this.showMessage(msg2);
                break;
            default:
              let msg3 = { severity:'error', summary: 'Thông báo:', detail: result.messageCode};
              this.showMessage(msg3);
              break;
          }
        }
      }
    });

  }

  //send sms
  send_sms(customerId: any) {
    this.selectedCustomerList = [];
    this.selectedCustomerList.push(customerId);
    let ref = this.dialogService.open(SendSmsDialogComponent, {
      data: {
        leadIdList: this.selectedCustomerList
      },
      header: 'Gửi SMS',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          if (result.message == "success") {
            let msg = { severity:'success', summary: 'Thông báo:', detail: 'Gửi SMS thành công'};
            this.showMessage(msg);
          } else {
            let msg = { severity:'error', summary: 'Thông báo:', detail: result.messageCode};
            this.showMessage(msg);
          }
        }
      }
    });
  }

  importCustomer() {
    let ref = this.dialogService.open(CustomerImportComponent, {
      header: 'Import khách hàng',
      width: '50%',
      baseZIndex: 1030,
      contentStyle: {
        "max-height": "800px",
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.statusImport == true) {
          this.getMasterData();
        }
      }
    });
  }

  del_customer(customerId: string) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.loadingComponent = true;
        this.customerService.changeCustomerStatusToDelete(customerId, this.auth.UserId).subscribe(response => {
          this.loadingComponent = false;
          let result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
          //remove from list
          this.newListCustomer = this.newListCustomer.filter(e => e.customerId != customerId);
          let mgs = { severity: 'success', summary: 'Thông báo', detail: 'Xóa khách hàng thành công' };
          this.showMessage(mgs);
          } else {
           let mgs = { severity: 'error', summary: 'Thông báo', detail: result.messageCode };
           this.showMessage(mgs);
          }
        }, error => {this.loadingComponent = false; });
      }
     });
  }

  downloadTemplate() {
    let ref = this.dialogService.open(CustomerDownloadTemplateComponent, {
      header: 'Tải mẫu Excel',
      width: '50%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "200px",
        "max-height": "600px"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          if (result.message == "success") {
            let msg = { severity: 'success', summary: 'Thông báo:', detail: 'Tải thành công' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
        }
      }
    });
  }

  //apply new UI
  refreshFilter() {
    this.customerType = 2;
    this.resetForm();
    this.searchCustomer();
  }

  leftColNumber: number = 12;
  rightColNumber: number = 0;
  showFilter() {
    if (this.innerWidth < 768) {
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

  pageChange(event: any) {
  }

  goToDetail(rowData: any) {
    this.router.navigate(['/customer/detail', { customerId: rowData.customerId, contactId: rowData.contactId }]);
  }

  onChangeAction(rowData: any) {
    this.actions = [];
    let createQuote: MenuItem = {
      id: '1', label: 'Tạo báo giá', icon: 'pi pi-clone', command: () => {
        this.goToCustomerQuote(rowData.customerId);
      }
    }

    let createOrder: MenuItem = {
      id: '2', label: 'Thêm đơn hàng', icon: 'pi pi-shopping-cart', command: () => {
        this.goToCustomerOrder(rowData.customerId);
      }
    }
    let sendSMS: MenuItem = {
      id: '3', label: 'Gửi SMS', icon: 'pi pi-envelope', command: () => {
        this.send_sms(rowData.customerId);
      }
    }

    let sendEmail: MenuItem = {
      id: '4', label: 'Gửi Email', icon: 'pi pi-comment', command: () => {
        this.send_email(rowData.customerId);
      }
    }

    let deleteCustomer: MenuItem = {
      id: '5', label: 'Xóa khách hàng', icon: 'pi pi-trash', command: () => {
        this.del_customer(rowData.customerId);
      }
    }

    if (this.actionAdd === true) {
      this.actions.push(createQuote);
      this.actions.push(createOrder);
    }

    if (this.actionSMS === true) {
      this.actions.push(sendSMS);
    }

    if (this.actionEmail === true) {
      this.actions.push(sendEmail);
    }

    if (this.actionDelete === true && rowData.countCustomerInfo === 0) {
      this.actions.push(deleteCustomer);
    }
  }

  checkEnterPress(event: any){
    if (event.code === "Enter") {
      this.searchCustomer();
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  approveOrReject(isApprove, listCus){
    let listSelectCus = [];
    if(listCus == null){
      if (this.selectedCustomers.length === 0) {
        this.clearToast();
        this.showToast('warn', 'Thông báo', 'Chọn khách hàng cần phê duyệt');
        return;
      }
      listSelectCus = this.selectedCustomers
    }
    else{
      listSelectCus.push(listCus);
    }
    let listIdCus: Array<string> = listSelectCus.map(e => e.customerId);
    if(isApprove !== null){
      if(isApprove){
        let count = listSelectCus.filter(f=>f.picName.trim() == "");
        if(count.length != 0){
          if(listSelectCus.length == 1){
            this.showToast('warn', 'Thông báo', "Khách hàng " + listSelectCus[0].customerName + " chưa được gán người phụ trách, không thể chuyển định danh");
          }
          else{
            this.showToast('warn', 'Thông báo', "Danh sách có khách hàng chưa được gán người phụ trách, không thể chuyển định danh");
          }
        }
        else{
          this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn định danh khách hàng này?',
            accept: () => {
              this.loadingComponent = true;
              this.customerService.approvalOrRejectCustomer(listIdCus, isApprove, true, this.auth.UserId).subscribe(response => {
                this.loadingComponent = false;
                let result = <any>response;
                if (result.statusCode === 202 || result.statusCode === 200) {
                  this.selectedCustomers = [];
                  // this.listLead = this.listLead.filter(e => !leadListId.includes(e.leadId));
                  this.getMasterData();
                  this.showToast('success', 'Thông báo', result.messageCode);
                } else {
                  this.showToast('error', 'Thông báo', result.messageCode);
                }
              }, error => { this.loadingComponent = false; });
            }
          });
        }
      }
      else{
        this.confirmationService.confirm({
          message: 'Bạn có chắc chắn muốn từ chối danh sách này?',
          accept: () => {
            this.loadingComponent = true;
            this.customerService.approvalOrRejectCustomer(listIdCus, isApprove, true, this.auth.UserId).subscribe(response => {
              this.loadingComponent = false;
              let result = <any>response;
              if (result.statusCode === 202 || result.statusCode === 200) {
                this.selectedCustomers = [];
                this.getMasterData();
                // this.listLead = this.listLead.filter(e => !leadListId.includes(e.leadId));
                this.showToast('success', 'Thông báo', result.messageCode);
              } else {
                this.showToast('error', 'Thông báo', result.messageCode);
              }
            }, error => { this.loadingComponent = false; });
          }
        });
      }
    }
    else{
      this.confirmationService.confirm({
        message: 'Bạn có chắc chắn muốn phê duyệt danh sách này?',
        accept: () => {
          this.loadingComponent = true;
          this.customerService.approvalOrRejectCustomer(listIdCus, true, false, this.auth.UserId).subscribe(response => {
            this.loadingComponent = false;
            let result = <any>response;
            if (result.statusCode === 202 || result.statusCode === 200) {
              this.selectedCustomers = [];
              // this.listLead = this.listLead.filter(e => !leadListId.includes(e.leadId));
              this.getMasterData();
              this.showToast('success', 'Thông báo', result.messageCode);
            } else {
              this.showToast('error', 'Thông báo', result.messageCode);
            }
          }, error => { this.loadingComponent = false; });
        }
      });
    }
  }
}
