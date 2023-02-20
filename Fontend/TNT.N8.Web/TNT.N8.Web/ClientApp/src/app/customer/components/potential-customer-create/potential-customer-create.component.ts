import { Component, OnInit, ElementRef, HostListener, Inject, ViewChild, Renderer2, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { CustomerService } from '../../services/customer.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { CustomerModel } from "../../models/customer.model";
import { ContactModel } from "../../../shared/models/contact.model";

class investFund {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isDefault: boolean;
}

class category {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isDefault: boolean;
}

class Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  isManager: boolean;
  positionId: string;
  organizationId: string;
}

class GeographicalArea {
  geographicalAreaId: string;
  geographicalAreaCode: string;
  geographicalAreaName: string;
}
class Province {
  public provinceId: string;
  public provinceCode: string;
  public provinceName: string;
  public provinceType: string;
}

class District {
  public districtId: string;
  public districtName: string;
  public districtCode: string;
  public districtType: string;
  public provinceId: string;
}

class Ward {
  public wardId: string;
  public wardName: string;
  public wardCode: string;
  public wardType: string;
  public districtId: string;
}

@Component({
  selector: 'app-potential-customer-create',
  templateUrl: './potential-customer-create.component.html',
  styleUrls: ['./potential-customer-create.component.css']
})
export class PotentialCustomerCreateComponent implements OnInit, AfterViewChecked {
  emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  auth = JSON.parse(localStorage.getItem("auth"));
  applicationName = this.systemParameterList.find(x => x.systemKey == 'ApplicationName').systemValueString;
  currentEmployeeId = this.auth.EmployeeId;
  awaitResult: boolean = false;
  //list action in page
  actionAdd: boolean = true;
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  listGenders = [{ code: 'NAM', name: 'Nam' }, { code: 'NU', name: 'Nữ' }];
  isInland: number = 1;
  isInlandLH: number = 1;
  listProvincePersonalCustomer: Array<Province> = [];
  listDistrictPersonalCustomer: Array<District> = [];
  listWardPersonalCustomer: Array<Ward> = [];
  listPhoneContactCode: Array<any> = [];
  listEmailContactCode: Array<string> = [];
  listProvince: Array<Province> = []; //master data
  listDistrict: Array<District> = []; //master data
  listWard: Array<Ward> = []; //master data
  index: number = 0;
  indexContactNow: number;
  //form
  customerType: number = 1;
  potentialCustomerForm: FormGroup; //form khach hang doanh nghiep
  potentialAgentForm: FormGroup; //form khach hang đại lý
  potentialPersonalCustomerForm: FormGroup; //form khach hang ca nhan
  contactCustomerForm: FormGroup; // Thông tin liên he
  columns: Array<any> = [];
  selectedColumns: Array<any> = [];
  listContact: Array<ContactModel> = [];
  rows: number = 10;
  selectedContact: ContactModel;
  //master data
  listPersonalInChange: Array<Employee> = [];
  listEmployeeTakeCare: Array<Employee> = [];
  listInvestFund: Array<investFund> = [];
  listArea: Array<GeographicalArea> = [];
  listGroupCustomer: Array<category> = [];
  /* create valiable add class scroll */
  fixed: boolean = false;
  isInvalidForm: boolean = false;
  isInvalidAgentForm: boolean = false;
  isInvalidPersonalForm: boolean = false;
  isOpenNotifiError: boolean = false;
  isOpenNotifiErrorPersonal: boolean = false;
  isOpenNotifiErrorAgent: boolean = false;
  withFiexd: string = "";

  waitRouting: boolean = false;

  isContact: boolean = true;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;

  listCustomer: Array<any> = [];
  filteredCustomer: Array<any> = [];

  validEmailCustomer: boolean = true;
  validPhoneCustomer: boolean = true;

  khachDuAn: boolean = false;

  constructor(
    public messageService: MessageService,
    private getPermission: GetPermission,
    private route: ActivatedRoute,
    private router: Router,
    private el: ElementRef,
    private customerService: CustomerService,
    private confirmationService: ConfirmationService,
    public changeRef: ChangeDetectorRef
  ) {
  }

  async  ngOnInit() {
    //Check permission
    let resource = "crm/customer/potential-customer-create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }

      this.initForm();
      this.initTable();
      this.getMasterData();
    }
  }

  initForm() {
    let KHDN_contact_phone = null;
    if (this.applicationName == "VNS") {
      KHDN_contact_phone = new FormControl("", [Validators.pattern(this.getPhonePattern()), checkDuplicateCode(this.listPhoneContactCode)]);

      //đại lý
      this.potentialAgentForm = new FormGroup({
        'PotentialCustomerName': new FormControl('', [Validators.required, forbiddenSpaceText]), //ten doanh nghiep
        'Phone': new FormControl('', [Validators.pattern(this.getPhonePattern())]),
        'Email': new FormControl('', [Validators.pattern(this.emailPattern)]),
        'Address': new FormControl(''),
        'SocialLink': new FormControl(''),
        'CustomerGroup': new FormControl(null, [Validators.required]), //nhom khach hang
        'InvestFund': new FormControl(null, [Validators.required]), //Nguon tiem nang
        'Pic': new FormControl(null, [Validators.required]), //nguoi phu trach
        'Area': new FormControl(null),
        'Note': new FormControl(''),
        'EmployeeTakeCare': new FormControl(null),
        'ContactDate': new FormControl(null),
        'SalesUpdate': new FormControl(null),
        'EvaluateCompany': new FormControl(null),
        'SalesUpdateAfterMeeting': new FormControl(null)
      });
    }
    else {
      KHDN_contact_phone = new FormControl("", [Validators.required, Validators.pattern(this.getPhonePattern()), checkDuplicateCode(this.listPhoneContactCode)]);
    }

    this.potentialCustomerForm = new FormGroup({
      'PotentialCustomerName': new FormControl('', [Validators.required, forbiddenSpaceText]), //ten doanh nghiep
      'Phone': new FormControl('', [Validators.pattern(this.getPhonePattern())]),
      'Email': new FormControl('', [Validators.pattern(this.emailPattern)]),
      'Address': new FormControl(''),
      'SocialLink': new FormControl(''),
      'CustomerGroup': new FormControl(null), //nhom khach hang
      'InvestFund': new FormControl(null, [Validators.required]), //Nguon tiem nang
      'Pic': new FormControl(null, [Validators.required]), //nguoi phu trach
      'Area': new FormControl(null),
      'Note': new FormControl(''),
      'EmployeeTakeCare': new FormControl(null),
      'ContactDate': new FormControl(null),
      'SalesUpdate': new FormControl(null),
      'EvaluateCompany': new FormControl(null),
      'SalesUpdateAfterMeeting': new FormControl(null)
    });


    this.contactCustomerForm = new FormGroup({
      "FirstName": new FormControl("", [Validators.required, checkBlankString()]),
      "Email": new FormControl("", [Validators.pattern(this.emailPattern), checkDuplicateCode(this.listEmailContactCode)]),
      "Position": new FormControl(""),
      "DateOfBirth": new FormControl(null),
      "Phone": KHDN_contact_phone,
      "OtherInfor": new FormControl(""),
      "Gender": new FormControl("NAM"),
      "isInlandLHControl": new FormControl(''),
      "provinceControl": new FormControl(""),
      "districtControl": new FormControl(""),
      "wardControl": new FormControl(""),
      "addressControl": new FormControl(""),
      'LinkFace': new FormControl(""),
      'EvaluateContactPeople': new FormControl("")
    });

    this.potentialPersonalCustomerForm = new FormGroup({
      'FirstName': new FormControl(''),
      'LastName': new FormControl('', [Validators.required, forbiddenSpaceText]),
      'Phone': new FormControl('', [Validators.pattern(this.getPhonePattern())]),
      'Email': new FormControl('', [Validators.pattern(this.emailPattern)]),
      'Address': new FormControl(''),
      'SocialLink': new FormControl(''),
      'CustomerGroup': new FormControl(null), //nhom khach hang
      'InvestFund': new FormControl(null, [Validators.required]), //Nguon tiem nang
      'Pic': new FormControl(null, [Validators.required]), //nguoi phu trach
      'Area': new FormControl(null),
      'Note': new FormControl(''),
    });
  }

  initTable() {
    this.columns = [
      { field: 'FullName', header: 'Người liên hệ', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'GenderDisplay', header: 'Giới tính', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'Role', header: 'Chức vụ', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'Phone', header: 'Số điện thoại', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'Email', header: 'Email', width: '50px', textAlign: 'left', color: '#f44336' },
      // { field: 'LinkFace', header: 'Link face', width: '50px', textAlign: 'left', color: '#f44336' }
    ];
    this.selectedColumns = this.columns;
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.customerService.getDataCreatePotentialCustomer(this.currentEmployeeId);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listPersonalInChange = result.listEmployeeModel;
      this.listGroupCustomer = result.listGroupCustomer;
      this.listInvestFund = result.listInvestFund;
      this.listArea = result.listArea;
      this.listProvince = result.listProvinceEntityModel;
      this.listWard = result.listWardEntityModel;
      this.listDistrict = result.listDistrictEntityModel;
      this.listCustomer = result.listCustomer;
      this.listProvincePersonalCustomer = [...this.listProvince.sort((a, b) => a.provinceName.localeCompare(b.provinceName))];
      this.listEmployeeTakeCare = result.listEmployeeTakeCare;
      if (this.listEmployeeTakeCare) {
        this.listEmployeeTakeCare.forEach(item => {
          item.employeeName = item.employeeCode + '-' + item.employeeName;
        });
      }
      //hiển thị người phụ trách theo định dạng mã - tên
      this.listPersonalInChange.forEach(item => item.employeeName = `${item.employeeCode} - ${item.employeeName}`);
      this.patchDefaultFormValue();
    } else {
      this.showToast('error', 'Thông báo', 'Lấy dữ liệu thất bại')
    }
  }

  patchDefaultFormValue() {
    let employeeId = this.auth.EmployeeId;
    let employee = this.listPersonalInChange.find(e => e.employeeId == employeeId);
    if (employee) {
      this.potentialCustomerForm.get('Pic').setValue(employee);
      this.potentialPersonalCustomerForm.get('Pic').setValue(employee);
      if (this.applicationName == "VNS") this.potentialAgentForm.get('Pic').setValue(employee);
    }
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  cancel() {
    this.confirmationService.confirm({
      message: `Hành động này không thể được hoàn tác, bạn có chắc chắn muốn huỷ?`,
      accept: () => {
        setTimeout(() => {
          this.router.navigate(['/customer/potential-customer-list']);
        }, 1000);
      }
    });
  }

  changeCustomerType(event: any) {
  this.potentialCustomerForm.reset();
  if (this.applicationName == "VNS") this.potentialAgentForm.reset();
  this.potentialPersonalCustomerForm.reset();
  this.resetNotification();
  }

  async createPotentialCustomer(type: string) {
    this.resetNotification();
    let customerType = Number(this.customerType);
    switch (customerType) {
      case 1:
        //khách hàng doanh nghiệp;
        this.handlePotentialCustomer(type);
        break;
      case 2:
        //khách hàng cá nhân
        this.handlePotentialPersonalCustomer(type);
        break;
      case 3:
        if (this.applicationName == "VNS") {
          //khách hàng đại lý
          this.handlePotentialCustomerAgent(type);
          break;
        }
    }
  }

  async handlePotentialCustomer(type) {
    if (!this.potentialCustomerForm.valid) {
      Object.keys(this.potentialCustomerForm.controls).forEach(key => {
        if (!this.potentialCustomerForm.controls[key].valid) {
          this.potentialCustomerForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }

      this.isInvalidForm = true;
      this.isOpenNotifiError = true;  //Hiển thị message lỗi
      return;
    }
    else if (!this.validEmailCustomer || !this.validPhoneCustomer) {
      this.showMessageErr();
      return;
    }

    let customer: CustomerModel = this.mappingPotentialCustomerFormToModel();
    let contact: ContactModel = this.mappingPotentialCustomerFormToContactModel();
    if (this.listContact) {
      if (this.listContact.length == 0) {
        let name = this.contactCustomerForm.get('FirstName').value ? this.contactCustomerForm.get('FirstName').value : null;
        let phone = this.contactCustomerForm.get('Phone').value ? this.contactCustomerForm.get('Phone').value : null;

        if (name == null && phone == null) {
          this.resetCompanyCustomerForm();
        }
        else if (name != null && phone != null) {
          this.addContactWhenSave();
          this.resetCompanyCustomerForm();
        }
        else{
          if (!this.contactCustomerForm.valid) {
            Object.keys(this.contactCustomerForm.controls).forEach(key => {
              if (!this.contactCustomerForm.controls[key].valid) {
                this.contactCustomerForm.controls[key].markAsTouched();
              }
            });
            let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
            if (target) {
              $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
              target.focus();
            }
            return;
          }
        }
      }
    }
    let companyContactList: Array<ContactModel> = this.listContact;
    companyContactList.forEach(item => {
      if (item.DateOfBirth) {
        item.DateOfBirth = convertToUTCTime(item.DateOfBirth);
      }
    });
    this.loading = true;
    let result: any = await this.customerService.createCustomerAsync(customer, contact, companyContactList, this.auth.userId, false, true);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listCustomer = result.listCustomer;
      let customerId = result.customerId;

      switch (type) {
        case "save":
          this.waitRouting = true;
          this.showToast('success', 'Thông báo', 'Tạo khách hàng tiềm năng thành công');
          setTimeout(() => {
            this.router.navigate(['/customer/potential-customer-detail', { customerId: customerId }]);
          }, 2000);
          break;
        case "save_new":
          if (result.duplicateContact == true) {
            this.showToast('warn', 'Thông báo', 'Người liên hệ đã tồn tại trong hệ thống');
          }
          this.showToast('success', 'Thông báo', 'Tạo khách hàng tiềm năng thành công');
          this.resetCustomerForm();
          this.listContact = [];
          this.isInvalidForm = false;
          this.khachDuAn = false;
          break;
        default:
          break;
      }
      this.loading = false;
    } else {
      this.showToast('error', 'Thông báo', result.messageCode);
      this.loading = false;
    }
  }
  // đại lý
  async handlePotentialCustomerAgent(type) {
    if (!this.potentialAgentForm.valid) {
      Object.keys(this.potentialAgentForm.controls).forEach(key => {
        if (!this.potentialAgentForm.controls[key].valid) {
          this.potentialAgentForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }

      this.isInvalidAgentForm = true;
      this.isOpenNotifiErrorAgent = true;   //Hiển thị message lỗi
      return;
    }
    else if (!this.validEmailCustomer || !this.validPhoneCustomer) {
      this.showMessageErr();
      return;
    }

    let customer: CustomerModel = this.mappingPotentialCustomerAgentFormToModel();
    let contact: ContactModel = this.mappingPotentialCustomerAgentFormToContactModel();
    if (this.listContact) {
      if (this.listContact.length == 0) {
        let name = this.contactCustomerForm.get('FirstName').value ? this.contactCustomerForm.get('FirstName').value : null;
        let phone = this.contactCustomerForm.get('Phone').value ? this.contactCustomerForm.get('Phone').value : null;

        if (name == null && phone == null) {
          this.resetCompanyCustomerForm();
        }
        else if (name != null && phone != null) {
          this.addContactWhenSave();
          this.resetCompanyCustomerForm();
        }
        else{
          if (!this.contactCustomerForm.valid) {
            Object.keys(this.contactCustomerForm.controls).forEach(key => {
              if (!this.contactCustomerForm.controls[key].valid) {
                this.contactCustomerForm.controls[key].markAsTouched();
              }
            });
            let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
            if (target) {
              $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
              target.focus();
            }
            return;
          }
        }
      }
    }
    let companyContactList: Array<ContactModel> = this.listContact;
    companyContactList.forEach(item => {
      if (item.DateOfBirth) {
        item.DateOfBirth = convertToUTCTime(item.DateOfBirth);
      }
    });
    this.loading = true;
    let result: any = await this.customerService.createCustomerAsync(customer, contact, companyContactList, this.auth.userId, false, true);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listCustomer = result.listCustomer;
      let customerId = result.customerId;

      switch (type) {
        case "save":
          this.waitRouting = true;
          this.showToast('success', 'Thông báo', 'Tạo khách hàng tiềm năng thành công');
          setTimeout(() => {
            this.router.navigate(['/customer/potential-customer-detail', { customerId: customerId }]);
          }, 2000);
          break;
        case "save_new":
          if (result.duplicateContact == true) {
            this.showToast('warn', 'Thông báo', 'Người liên hệ đã tồn tại trong hệ thống');
          }
          this.showToast('success', 'Thông báo', 'Tạo khách hàng tiềm năng thành công');
          this.resetAgentForm();
          this.listContact = [];
          this.isInvalidAgentForm = false;
          this.khachDuAn = false;
          break;
        default:
          break;
      }
      this.loading = false;
    } else {
      this.showToast('error', 'Thông báo', result.messageCode);
      this.loading = false;
    }
  }

  async handlePotentialPersonalCustomer(type) {
    if (!this.potentialPersonalCustomerForm.valid) {
      Object.keys(this.potentialPersonalCustomerForm.controls).forEach(key => {
        if (!this.potentialPersonalCustomerForm.controls[key].valid) {
          this.potentialPersonalCustomerForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }

      this.isInvalidPersonalForm = true;
      this.isOpenNotifiErrorPersonal = true;  //Hiển thị message lỗi
      return;
    }
    else if (!this.validEmailCustomer || !this.validPhoneCustomer) {
      this.showMessageErr();
      return;
    }

    let customer: CustomerModel = this.mappingPotentialPersonalCustomerFormToModel();
    let contact: ContactModel = this.mappingPotentialPersonalCustomerFormToContactModel();
    this.loading = true;
    let result: any = await this.customerService.createCustomerAsync(customer, contact, [], this.auth.userId, false, true);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listCustomer = result.listCustomer;
      let customerId = result.customerId;

      switch (type) {
        case "save":
          this.waitRouting = true;
          this.showToast('success', 'Thông báo', 'Tạo khách hàng tiềm năng thành công');
          setTimeout(() => {
            this.router.navigate(['/customer/potential-customer-detail', { customerId: customerId }]);
          }, 2000);
          break;
        case "save_new":
          if (result.duplicateContact == true) {
            this.showToast('warn', 'Thông báo', 'Người liên hệ đã tồn tại trong hệ thống');
          }
          this.showToast('success', 'Thông báo', 'Tạo khách hàng tiềm năng thành công');
          this.resetPersonalCustomerForm();
          this.isInvalidForm = false;
          this.khachDuAn = false;
          break;
        default:
          break;
      }
      this.loading = false;
    } else {
      this.showToast('error', 'Thông báo', result.messageCode);
      this.loading = false;
    }

  }

  mappingPotentialCustomerFormToModel(): CustomerModel {
    let _potentialCustomerName = this.potentialCustomerForm.get('PotentialCustomerName').value;
    let _pic = this.potentialCustomerForm.get('Pic').value || null;
    let _investFund = this.potentialCustomerForm.get('InvestFund').value || null;
    let _customerGroup = this.potentialCustomerForm.get('CustomerGroup').value || null;
    let _empTakeCare = this.potentialCustomerForm.get('EmployeeTakeCare').value || null;
    let _contactDate = this.potentialCustomerForm.get('ContactDate').value || null;
    let _evaluateCompany = this.potentialCustomerForm.get('EvaluateCompany').value || null;
    let _salesUpdate = this.potentialCustomerForm.get('SalesUpdate').value || null;
    let _salesUpdateAfterMeeting = this.potentialCustomerForm.get('SalesUpdateAfterMeeting').value || null;
    let customer = new CustomerModel();

    customer.CustomerId = this.emptyGuid;
    customer.LeadId = null;
    customer.CustomerCode = '';
    customer.CustomerGroupId = _customerGroup ? _customerGroup.categoryId : null;
    customer.CustomerName = typeof (_potentialCustomerName) == "string" ? (_potentialCustomerName ? _potentialCustomerName.trim() : '') : _potentialCustomerName.customerName;
    customer.EmployeeTakeCareId = _empTakeCare ? _empTakeCare.employeeId : null;
    customer.StatusId = this.emptyGuid;
    customer.CustomerServiceLevelId = null;
    customer.InvestmentFundId = _investFund ? _investFund.categoryId : null;
    customer.PersonInChargeId = _pic ? _pic.employeeId : null;
    customer.CustomerCareStaff = null;
    customer.CustomerType = Number(this.customerType);
    customer.PaymentId = null;
    customer.FieldId = null;
    customer.ScaleId = null;
    customer.MaximumDebtDays = null;
    customer.MaximumDebtValue = null;
    customer.TotalSaleValue = 0;
    customer.TotalReceivable = 0;
    customer.NearestDateTransaction = null;
    customer.TotalCapital = null;
    customer.BusinessRegistrationDate = null;
    customer.EnterpriseType = null;
    customer.TotalEmployeeParticipateSocialInsurance = null;
    customer.TotalRevenueLastYear = null;
    customer.BusinessType = null;
    customer.BusinessScale = null;
    customer.CreatedById = this.auth.UserId;
    customer.Active = true;
    customer.ContactDate = _contactDate ? convertToUTCTime(_contactDate) : null;
    customer.EvaluateCompany = _evaluateCompany ? _evaluateCompany.trim() : null;
    customer.SalesUpdate = _salesUpdate ? _salesUpdate.trim() : null;
    customer.SalesUpdateAfterMeeting = _salesUpdateAfterMeeting ? _salesUpdateAfterMeeting.trim() : null;
    customer.KhachDuAn = this.khachDuAn;

    customer.CreatedDate = new Date();
    customer.CustomerCareStaff = null;
    customer.TotalCapital = 0;

    return customer;
  }

  mappingPotentialCustomerFormToContactModel(): ContactModel {
    let _potentialCustomerName = this.potentialCustomerForm.get('PotentialCustomerName').value;
    let _phone = this.potentialCustomerForm.get('Phone').value || '';
    let _email = this.potentialCustomerForm.get('Email').value || '';
    let _socialLink = this.potentialCustomerForm.get('SocialLink').value || '';
    let _address = this.potentialCustomerForm.get('Address').value || '';
    let _area = this.potentialCustomerForm.get('Area').value;


    let _note = this.potentialCustomerForm.get('Note').value || null;
    let contactModel = new ContactModel;

    contactModel.ContactId = this.emptyGuid;
    contactModel.ObjectId = this.emptyGuid;
    contactModel.FirstName = typeof (_potentialCustomerName) == "string" ? (_potentialCustomerName ? _potentialCustomerName.trim() : '') : _potentialCustomerName.customerName;
    contactModel.LastName = '';
    contactModel.Phone = _phone;
    contactModel.Email = _email;
    contactModel.WorkEmail = '';
    contactModel.Note = _note;
    contactModel.Gender = '';
    contactModel.SocialUrl = _socialLink;
    contactModel.Address = _address;
    contactModel.CreatedDate = new Date();
    contactModel.Active = true;
    contactModel.GeographicalAreaId = _area ? _area.geographicalAreaId : null;


    contactModel.CompanyAddress = '';
    contactModel.CompanyName = '';
    contactModel.DistrictId = null;
    contactModel.ProvinceId = null;
    contactModel.WardId = null;
    contactModel.IdentityID = '';
    contactModel.MaritalStatusId = null;
    contactModel.ObjectType = '';
    contactModel.OptionPosition = '';

    return contactModel;
  }

  //đại lý
  mappingPotentialCustomerAgentFormToModel(): CustomerModel {
    let _potentialCustomerName = this.potentialAgentForm.get('PotentialCustomerName').value;
    let _pic = this.potentialAgentForm.get('Pic').value || null;
    let _investFund = this.potentialAgentForm.get('InvestFund').value || null;
    let _customerGroup = this.potentialAgentForm.get('CustomerGroup').value || null;
    let _empTakeCare = this.potentialAgentForm.get('EmployeeTakeCare').value || null;
    let _contactDate = this.potentialAgentForm.get('ContactDate').value || null;
    let _evaluateCompany = this.potentialAgentForm.get('EvaluateCompany').value || null;
    let _salesUpdate = this.potentialAgentForm.get('SalesUpdate').value || null;
    let _salesUpdateAfterMeeting = this.potentialAgentForm.get('SalesUpdateAfterMeeting').value || null;
    let customer = new CustomerModel();

    customer.CustomerId = this.emptyGuid;
    customer.LeadId = null;
    customer.CustomerCode = '';
    customer.CustomerGroupId = _customerGroup ? _customerGroup.categoryId : null;
    customer.CustomerName = typeof (_potentialCustomerName) == "string" ? (_potentialCustomerName ? _potentialCustomerName.trim() : '') : _potentialCustomerName.customerName;
    customer.EmployeeTakeCareId = _empTakeCare ? _empTakeCare.employeeId : null;
    customer.StatusId = this.emptyGuid;
    customer.CustomerServiceLevelId = null;
    customer.InvestmentFundId = _investFund ? _investFund.categoryId : null;
    customer.PersonInChargeId = _pic ? _pic.employeeId : null;
    customer.CustomerCareStaff = null;
    customer.CustomerType = Number(this.customerType);
    customer.PaymentId = null;
    customer.FieldId = null;
    customer.ScaleId = null;
    customer.MaximumDebtDays = null;
    customer.MaximumDebtValue = null;
    customer.TotalSaleValue = 0;
    customer.TotalReceivable = 0;
    customer.NearestDateTransaction = null;
    customer.TotalCapital = null;
    customer.BusinessRegistrationDate = null;
    customer.EnterpriseType = null;
    customer.TotalEmployeeParticipateSocialInsurance = null;
    customer.TotalRevenueLastYear = null;
    customer.BusinessType = null;
    customer.BusinessScale = null;
    customer.CreatedById = this.auth.UserId;
    customer.Active = true;
    customer.ContactDate = _contactDate ? convertToUTCTime(_contactDate) : null;
    customer.EvaluateCompany = _evaluateCompany ? _evaluateCompany.trim() : null;
    customer.SalesUpdate = _salesUpdate ? _salesUpdate.trim() : null;
    customer.SalesUpdateAfterMeeting = _salesUpdateAfterMeeting ? _salesUpdateAfterMeeting.trim() : null;
    customer.KhachDuAn = this.khachDuAn;

    customer.CreatedDate = new Date();
    customer.CustomerCareStaff = null;
    customer.TotalCapital = 0;

    return customer;
  }

  mappingPotentialCustomerAgentFormToContactModel(): ContactModel {
    let _potentialCustomerName = this.potentialAgentForm.get('PotentialCustomerName').value;
    let _phone = this.potentialAgentForm.get('Phone').value || '';
    let _email = this.potentialAgentForm.get('Email').value || '';
    let _socialLink = this.potentialAgentForm.get('SocialLink').value || '';
    let _address = this.potentialAgentForm.get('Address').value || '';
    let _area = this.potentialAgentForm.get('Area').value;


    let _note = this.potentialAgentForm.get('Note').value || null;
    let contactModel = new ContactModel;

    contactModel.ContactId = this.emptyGuid;
    contactModel.ObjectId = this.emptyGuid;
    contactModel.FirstName = typeof (_potentialCustomerName) == "string" ? (_potentialCustomerName ? _potentialCustomerName.trim() : '') : _potentialCustomerName.customerName;
    contactModel.LastName = '';
    contactModel.Phone = _phone;
    contactModel.Email = _email;
    contactModel.WorkEmail = '';
    contactModel.Note = _note;
    contactModel.Gender = '';
    contactModel.SocialUrl = _socialLink;
    contactModel.Address = _address;
    contactModel.CreatedDate = new Date();
    contactModel.Active = true;
    contactModel.GeographicalAreaId = _area ? _area.geographicalAreaId : null;


    contactModel.CompanyAddress = '';
    contactModel.CompanyName = '';
    contactModel.DistrictId = null;
    contactModel.ProvinceId = null;
    contactModel.WardId = null;
    contactModel.IdentityID = '';
    contactModel.MaritalStatusId = null;
    contactModel.ObjectType = '';
    contactModel.OptionPosition = '';

    return contactModel;
  }

  mappingPotentialPersonalCustomerFormToModel(): CustomerModel {
    let _firstName = this.potentialPersonalCustomerForm.get('FirstName').value.trim();
    let _lastName = this.potentialPersonalCustomerForm.get('LastName').value.trim();
    let _fullName = _firstName + " " + _lastName;
    let _pic = this.potentialPersonalCustomerForm.get('Pic').value || null;
    let _customerGroup = this.potentialPersonalCustomerForm.get('CustomerGroup').value || null;
    let _investFund = this.potentialPersonalCustomerForm.get('InvestFund').value || null;
    let customer = new CustomerModel();
    customer.CustomerId = this.emptyGuid;
    customer.LeadId = null;
    customer.CustomerCode = '';
    customer.CustomerGroupId = _customerGroup ? _customerGroup.categoryId : null;
    customer.CustomerName = _fullName ? _fullName.trim() : '';
    customer.StatusId = this.emptyGuid;
    customer.CustomerServiceLevelId = null;
    customer.InvestmentFundId = _investFund ? _investFund.categoryId : null;
    customer.PersonInChargeId = _pic ? _pic.employeeId : null;
    customer.CustomerCareStaff = null;
    customer.CustomerType = Number(this.customerType);
    customer.PaymentId = null;
    customer.FieldId = null;
    customer.ScaleId = null;
    customer.MaximumDebtDays = null;
    customer.MaximumDebtValue = null;
    customer.TotalSaleValue = 0;
    customer.TotalReceivable = 0;
    customer.NearestDateTransaction = null;
    customer.TotalCapital = null;
    customer.BusinessRegistrationDate = null;
    customer.EnterpriseType = null;
    customer.TotalEmployeeParticipateSocialInsurance = null;
    customer.TotalRevenueLastYear = null;
    customer.BusinessType = null;
    customer.BusinessScale = null;
    customer.CreatedById = this.auth.UserId;
    customer.Active = true;
    customer.KhachDuAn = this.khachDuAn;

    customer.CreatedDate = new Date();
    customer.CustomerCareStaff = null;
    customer.TotalCapital = 0;

    return customer;
  }

  mappingPotentialPersonalCustomerFormToContactModel(): ContactModel {
    let _firstName = this.potentialPersonalCustomerForm.get('FirstName').value.trim();
    let _lastName = this.potentialPersonalCustomerForm.get('LastName').value.trim();
    let _phone = this.potentialPersonalCustomerForm.get('Phone').value || '';
    let _email = this.potentialPersonalCustomerForm.get('Email').value || '';
    let _socialLink = this.potentialPersonalCustomerForm.get('SocialLink').value || '';
    let _address = this.potentialPersonalCustomerForm.get('Address').value || '';
    let _area = this.potentialPersonalCustomerForm.get('Area').value;

    let _note = this.potentialPersonalCustomerForm.get('Note').value || null;
    let contactModel = new ContactModel;

    contactModel.ContactId = this.emptyGuid;
    contactModel.ObjectId = this.emptyGuid;
    contactModel.FirstName = _firstName ? _firstName.trim() : '';
    contactModel.LastName = _lastName ? _lastName.trim() : '';
    contactModel.Phone = _phone;
    contactModel.Email = _email;
    contactModel.Note = _note;
    contactModel.Gender = '';
    contactModel.SocialUrl = _socialLink;
    contactModel.Address = _address;
    contactModel.CreatedDate = new Date();
    contactModel.Active = true;
    contactModel.GeographicalAreaId = _area ? _area.geographicalAreaId : null;

    contactModel.CompanyAddress = '';
    contactModel.CompanyName = '';
    contactModel.DistrictId = null;
    contactModel.ProvinceId = null;
    contactModel.WardId = null;
    contactModel.IdentityID = '';
    contactModel.MaritalStatusId = null;
    contactModel.ObjectType = '';
    contactModel.OptionPosition = '';


    return contactModel;
  }

  resetCustomerForm() {
    this.potentialCustomerForm.reset();
    this.potentialCustomerForm.patchValue({
      'PotentialCustomerName': '',
      'Phone': '',
      'Email': '',
      'SocialLink': '',
      'CustomerGroup': null,
      'InvestFund': null,
      'Pic': this.listPersonalInChange.find(x => x.employeeId == this.auth.EmployeeId),
      'Note': '',
      'Address': '',
    });
  }

  resetAgentForm() {
    this.potentialAgentForm.reset();
    this.potentialAgentForm.patchValue({
      'PotentialCustomerName': '',
      'Phone': '',
      'Email': '',
      'SocialLink': '',
      'CustomerGroup': null,
      'InvestFund': null,
      'Pic': this.listPersonalInChange.find(x => x.employeeId == this.auth.EmployeeId),
      'Note': '',
      'Address': '',
    });
  }

  resetPersonalCustomerForm() {
    this.potentialPersonalCustomerForm.reset();
    this.potentialPersonalCustomerForm.patchValue({
      'FirstName': '',
      'LastName': '',
      'Phone': '',
      'Email': '',
      'SocialLink': '',
      'CustomerGroup': null,
      'InvestFund': null,
      'Pic': this.listPersonalInChange.find(x => x.employeeId == this.auth.EmployeeId),
      'Note': '',
      'Address': ''
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  resetNotification() {
    this.isInvalidForm = false;
    this.isInvalidPersonalForm = false;
    if (this.applicationName == "VNS") {
      this.isInvalidAgentForm = false;
      this.isOpenNotifiErrorAgent = false;
    }
    this.isOpenNotifiError = false;
    this.isOpenNotifiErrorPersonal = false;
  }

  changeProvinceContact(e) {
    if (e.value == null) {
      this.listDistrictPersonalCustomer = [];
      this.listWardPersonalCustomer = [];
    }
    else this.listDistrictPersonalCustomer = e.value.districtList;
  }
  changeDistrictContact(e) {
    if (e.value == null) this.listWardPersonalCustomer = [];
    else this.listWardPersonalCustomer = e.value.wardList;
  }

  addContactWhenSave() {
    let contactModel: ContactModel = this.mappingFormToContactModel();
    this.listContact = [...this.listContact, contactModel];
    this.listPhoneContactCode = this.listContact.map(c => c.Phone);
    this.listEmailContactCode = this.listContact.map(c => c.Email);
    this.contactCustomerForm.get('Phone').setValidators([Validators.pattern(this.getPhonePattern()), checkDuplicateCode(this.listPhoneContactCode)]);
    this.contactCustomerForm.get('Email').setValidators([Validators.pattern(this.emailPattern), checkDuplicateCode(this.listEmailContactCode)]);
    this.contactCustomerForm.updateValueAndValidity();
  }

  addCustomerContact() {
    if (!this.contactCustomerForm.valid) {
      Object.keys(this.contactCustomerForm.controls).forEach(key => {
        if (!this.contactCustomerForm.controls[key].valid) {
          this.contactCustomerForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }
    } else {
      let contactModel: ContactModel = this.mappingFormToContactModel();
      this.listContact = [...this.listContact, contactModel];
      this.listPhoneContactCode = this.listContact.map(c => c.Phone);
      this.listEmailContactCode = this.listContact.map(c => c.Email);
      this.contactCustomerForm.get('Phone').setValidators([Validators.pattern(this.getPhonePattern()), checkDuplicateCode(this.listPhoneContactCode)]);
      this.contactCustomerForm.get('Email').setValidators([Validators.pattern(this.emailPattern), checkDuplicateCode(this.listEmailContactCode)]);
      this.contactCustomerForm.updateValueAndValidity();
      this.resetCompanyCustomerForm();
    }
  }

  mappingFormToContactModel(): ContactModel {
    this.index++;
    let _linkFace = this.contactCustomerForm.get('LinkFace').value || null;
    let _evaluateContactPeople = this.contactCustomerForm.get('EvaluateContactPeople').value || null;
    let contactModel = new ContactModel;
    contactModel.Index = this.index;
    contactModel.FirstName = this.contactCustomerForm.get('FirstName').value;
    // contactModel.LastName = this.contactCustomerForm.get('LastName').value;
    (contactModel as any).FullName = contactModel.FirstName;
    contactModel.Email = this.contactCustomerForm.get('Email').value;
    contactModel.Role = this.contactCustomerForm.get('Position').value;
    contactModel.DateOfBirth = this.contactCustomerForm.get('DateOfBirth').value;
    contactModel.Phone = this.contactCustomerForm.get('Phone').value;
    contactModel.Other = this.contactCustomerForm.get('OtherInfor').value;
    contactModel.Gender = this.contactCustomerForm.get('Gender').value;
    contactModel.GenderDisplay = contactModel.Gender == 'NAM' ? 'Nam' : 'Nữ';
    contactModel.ProvinceId = this.contactCustomerForm.get('provinceControl').value ? this.contactCustomerForm.get('provinceControl').value.provinceId : null;
    contactModel.DistrictId = this.contactCustomerForm.get('districtControl').value ? this.contactCustomerForm.get('districtControl').value.districtId : null;
    contactModel.WardId = this.contactCustomerForm.get('wardControl').value ? this.contactCustomerForm.get('wardControl').value.wardId : null;
    contactModel.Address = this.contactCustomerForm.get('addressControl').value;
    contactModel.LinkFace = _linkFace ? _linkFace.trim() : null;
    contactModel.EvaluateContactPeople = _evaluateContactPeople ? _evaluateContactPeople.trim() : null;
    contactModel.IsInlandLH = this.isInlandLH;

    return contactModel;
  }

  editContact(rowData: ContactModel) {
    this.isContact = false;
    this.isInlandLH = rowData.IsInlandLH;
    this.indexContactNow = rowData.Index;

    this.contactCustomerForm.get('FirstName').setValue(rowData.FirstName);
    // this.contactCustomerForm.get('LastName').setValue(rowData.LastName);
    this.contactCustomerForm.get('Email').setValue(rowData.Email);
    this.contactCustomerForm.get('Position').setValue(rowData.Role);
    this.contactCustomerForm.get('DateOfBirth').setValue(rowData.DateOfBirth);
    this.contactCustomerForm.get('Phone').setValue(rowData.Phone);
    this.contactCustomerForm.get('OtherInfor').setValue(rowData.Other);
    this.contactCustomerForm.get('Gender').setValue(rowData.Gender);
    if (rowData.IsInlandLH == 1) {
      if (rowData.ProvinceId) {
        let province: any = this.listProvince.find(c => c.provinceId == rowData.ProvinceId);
        this.contactCustomerForm.get('provinceControl').setValue(province);
        this.listDistrictPersonalCustomer = province.districtList;
        if (rowData.DistrictId) {
          let district: any = province.districtList.find(c => c.districtId == rowData.DistrictId);
          this.contactCustomerForm.get('districtControl').setValue(district);
          this.listWardPersonalCustomer = district.wardList;
          if (rowData.WardId) {
            let ward = district.wardList.find(c => c.wardId == rowData.WardId);
            this.contactCustomerForm.get('wardControl').setValue(ward);
          }
        }
      }
    }
    this.contactCustomerForm.get('addressControl').setValue(rowData.Address);
    this.contactCustomerForm.get('LinkFace').setValue(rowData.LinkFace);
    this.contactCustomerForm.get('EvaluateContactPeople').setValue(rowData.EvaluateContactPeople);
  }

  updateCustomerContact() {
    this.listContact.forEach(item => {
      if (item.Index == this.indexContactNow) {
        let _linkFace = this.contactCustomerForm.get('LinkFace').value || null;
        let _evaluateContactPeople = this.contactCustomerForm.get('EvaluateContactPeople').value || null;
        item.FirstName = this.contactCustomerForm.get('FirstName').value;
        // item.LastName = this.contactCustomerForm.get('LastName').value;
        (item as any).FullName = this.contactCustomerForm.get('FirstName').value;
        item.Email = this.contactCustomerForm.get('Email').value;
        item.Role = this.contactCustomerForm.get('Position').value;
        item.DateOfBirth = this.contactCustomerForm.get('DateOfBirth').value;
        item.Phone = this.contactCustomerForm.get('Phone').value;
        item.Other = this.contactCustomerForm.get('OtherInfor').value;
        item.Gender = this.contactCustomerForm.get('Gender').value;
        item.GenderDisplay = item.Gender == 'NAM' ? 'Nam' : 'Nữ';
        item.ProvinceId = this.contactCustomerForm.get('provinceControl').value ? this.contactCustomerForm.get('provinceControl').value.provinceId : null;
        item.DistrictId = this.contactCustomerForm.get('districtControl').value ? this.contactCustomerForm.get('districtControl').value.districtId : null;
        item.WardId = this.contactCustomerForm.get('wardControl').value ? this.contactCustomerForm.get('wardControl').value.wardId : null;
        item.Address = this.contactCustomerForm.get('addressControl').value;
        item.LinkFace = _linkFace ? _linkFace.trim() : null;
        item.EvaluateContactPeople = _evaluateContactPeople ? _evaluateContactPeople.trim() : null;
        item.IsInlandLH = this.isInlandLH;
      }
    });
    this.isContact = true;
    this.resetCompanyCustomerForm();
  }

  cancelContact() {
    this.isContact = true;
    this.resetCompanyCustomerForm();
  }

  onDeleteContact(rowData: ContactModel) {
    this.listContact = this.listContact.filter(e => e != rowData);
  }

  resetCompanyCustomerForm() {
    this.contactCustomerForm.reset();
    this.contactCustomerForm.patchValue({
      "FirstName": "",
      // "LastName": "",
      "Email": "",
      "Position": "",
      "DateOfBirth": null,
      "Phone": "",
      "OtherInfor": "",
      "Gender": "NAM",
      "isInlandLHControl": 1,
      "provinceControl": null,
      "districtControl": null,
      "wardControl": null,
      "addressControl": null,
    });
  }
  /* end */

  filterCustomerName(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.listCustomer.length; i++) {
      let customer = this.listCustomer[i];
      if (customer.customerName.toLowerCase().indexOf(query.toLowerCase()) != -1) {
        filtered.push(customer);
      }
    }

    this.filteredCustomer = filtered;
  }

  goToDetail(customer: any) {
    if (customer.statusCode == 'HDO') {
      let url = this.router.serializeUrl(this.router.createUrlTree(['/customer/detail', { customerId: customer.customerId }]));
      window.open(url, '_blank');
    }
    else {
      let url = this.router.serializeUrl(this.router.createUrlTree(['/customer/potential-customer-detail', { customerId: customer.customerId }]));
      window.open(url, '_blank');
    }
  }

  checkDuplicateInforCustomer(checkType: number, formControl: FormControl) {
    if (formControl.valid) {
      let email = '';
      let phone = '';

      //Nếu là khách hàng doanh nghiệp
      if (Number(this.customerType) == 1) {
        email = this.potentialCustomerForm.get('Email').value;
        phone = this.potentialCustomerForm.get('Phone').value;
      }
      //Nếu là khách hàng cá nhân
      else if (Number(this.customerType) == 2) {
        email = this.potentialPersonalCustomerForm.get('Email').value;
        phone = this.potentialPersonalCustomerForm.get('Phone').value;
      }
      //Nếu là khách hàng đại lý
      else if (Number(this.customerType) == 3) {
        email = this.potentialAgentForm.get('Email').value;
        phone = this.potentialAgentForm.get('Phone').value;
      }

      this.customerService.checkDuplicateInforCustomer(null, Number(checkType), email, phone).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          if (result.valid == false) {
            if (Number(checkType) == 1) {
              this.validEmailCustomer = result.valid;
            }
            else if (Number(checkType) == 2) {
              this.validPhoneCustomer = result.valid;
            }
            this.showMessageErr();
          }
          else {
            if (Number(checkType) == 1) {
              this.validEmailCustomer = result.valid;
            }
            else if (Number(checkType) == 2) {
              this.validPhoneCustomer = result.valid;
            }
          }
        }
        else {
          this.showToast('error', 'Thông báo', result.messageCode);
        }
      });
    }
  }

  showMessageErr() {
    //Nếu là Email
    if (!this.validEmailCustomer) {
      this.showToast('error', 'Thông báo', 'Email khách hàng đã tồn tại trên hệ thống');
    }
    //Nếu là Số điện thoại
    if (!this.validPhoneCustomer) {
      this.showToast('error', 'Thông báo', 'Số điện thoại khách hàng đã tồn tại trên hệ thống');
    }
  }

  ngAfterViewChecked() {
    this.changeRef.detectChanges();
  }

  toggleNotifiError() {
    if(this.customerType == 1) this.isOpenNotifiError = !this.isOpenNotifiError;
    if(this.customerType == 2) this.isOpenNotifiErrorPersonal = !this.isOpenNotifiErrorPersonal;
    if(this.customerType == 3 && this.applicationName == "VNS") this.isOpenNotifiErrorAgent = !this.isOpenNotifiErrorAgent;
  }
}


function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() !== "") {
        let duplicateCode = array.find(e => e === control.value.trim());
        if (duplicateCode !== undefined) {
          return { 'duplicateCode': true };
        }
      }
    }
    return null;
  }
}

function checkBlankString(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() === "") {
        return { 'blankString': true };
      }
    }
    return null;
  }
}

function forbiddenSpaceText(control: FormControl) {
  if (typeof (control.value) === "string") {
    let text = control.value;
    if (text && text.trim() == "") {
      return {
        forbiddenSpaceText: {
          parsedDomain: text
        }
      }
    }
  }

  return null;
}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
