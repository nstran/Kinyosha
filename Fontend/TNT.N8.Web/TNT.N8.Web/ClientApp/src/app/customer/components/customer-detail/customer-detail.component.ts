import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { Location } from '@angular/common';
import * as $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from "../../../shared/services/category.service";
import { CustomerService } from "../../services/customer.service";
import { ContactService } from "../../../shared/services/contact.service";
import { WardService } from '../../../shared/services/ward.service';
import { ProvinceService } from '../../../shared/services/province.service';
import { DistrictService } from '../../../shared/services/district.service';
import { ImageUploadService } from '../../../shared/services/imageupload.service';

import { CustomerModel } from "../../models/customer.model";
import { ContactModel } from "../../../shared/models/contact.model";
import { NoteModel } from '../../../shared/models/note.model';
import { NoteService } from '../../../shared/services/note.service';
import { BankService } from '../../../shared/services/bank.service';
import { EmployeeService } from "../../../employee/services/employee.service";
import { CustomerCareService } from '../../services/customer-care.service';
import { SendSmsDialogComponent } from '../../../shared/components/send-sms-dialog/send-sms-dialog.component';
import { SendEmailDialogComponent } from '../../../shared/components/send-email-dialog/send-email-dialog.component';
import { ContactpopupComponent } from '../../../shared/components/contactpopup/contactpopup.component';
import { BankpopupComponent } from '../../../shared/components/bankpopup/bankpopup.component';
import { GetPermission } from '../../../shared/permission/get-permission';
import { AddQuestionAnswerDialogComponent } from '../add-question-answer-dialog/add-question-answer-dialog.component';
import { TemplateQuickEmailComponent } from '../template-quick-email/template-quick-email.component';
import { TemplateQuickSmsComponent } from '../template-quick-sms/template-quick-sms.component';
import { TemplateQuickGiftComponent } from '../template-quick-gift/template-quick-gift.component';
import { MeetingDialogComponent } from '../../components/meeting-dialog/meeting-dialog.component';

import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ConfirmationService } from 'primeng/api';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { SendEmailModel } from '../../../admin/models/sendEmail.model';
import { DialogService } from 'primeng/dynamicdialog';
import { EmailConfigService } from '../../../admin/services/email-config.service';
import { GoogleService } from '../../../shared/services/google.service';

import { WarningComponent } from '../../../shared/toast/warning/warning.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TemplatePreviewEmailComponent } from '../../../shared/components/template-preview-email/template-preview-email.component';

declare var google: any;

interface Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isDefault: boolean;
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
}

interface Area {
  areaId: string;
  areaName: string;
}

interface Province {
  provinceId: string;
  provinceName: string;
}

interface District {
  districtId: string;
  districtName: string;
  provinceId: string;
}

interface Ward {
  wardId: string;
  wardName: string;
  districtId: string;
}

interface Note {
  active: boolean;
  createdById: string;
  createdDate: Date;
  description: string;
  noteDocList: Array<NoteDocument>;
  noteId: string;
  noteTitle: string;
  objectId: string;
  objectType: string;
  responsibleAvatar: string;
  responsibleName: string;
  type: string;
  updatedById: string;
  updatedDate: Date;
}

interface NoteDocument {
  active: boolean;
  base64Url: string;
  createdById: string;
  createdDate: Date;
  documentName: string;
  documentSize: string;
  documentUrl: string;
  noteDocumentId: string;
  noteId: string;
  updatedById: string;
  updatedDate: Date;
}

interface Country {
  countryId: string;
  countryName: string;
  countryCode: string;
}

interface CustomerAdditionalInformation {
  customerAdditionalInformationId: string,
  question: string,
  answer: string,
  customerId: string
}

interface OtherContact {
  contactId: string,
  objectId: string,
  objectType: string,
  firstName: string,
  lastName: string,
  contactName: string,
  gender: string,
  genderName: string,
  dateOfBirth: Date,
  address: string,
  role: string, //Ch???c v???
  phone: string,
  email: string,
  other: string,  //Th??ng tin kh??c
  provinceId: string,
  districtId: string,
  wardId: string
}

interface PersonalCustomerContact {
  ContactId: string,
  Email: string,
  WorkEmail: string,
  OtherEmail: string,
  Phone: string,
  WorkPhone: string,
  OtherPhone: string,
  AreaId: string,
  ProvinceId: string,
  DistrictId: string,
  WardId: string,
  Address: string,
  Other: string,
  Latitude: number,
  Longitude: number
}

interface OrderOfCustomer {
  orderId: string,
  orderCode: string,
  seller: string,
  sellerName: string,
  amount: string,
  statusId: string,
  statusName: string,
  createdDate: string,
  orderDate: string
}

interface BankAccount {
  bankAccountId: string,
  objectId: string,
  objectType: string,
  bankName: string, //T??n ng??n h??ng
  accountNumber: string,  //S??? t??i kho???n
  accountName: string,  //Ch??? t??i kho???n
  branchName: string, //Chi nh??nh
  bankDetail: string,  //Di???n gi???i
  createdById: string,
  createdDate: Date
}

interface CustomerCareForWeek {
  customerCareId: string,
  employeeCharge: string,
  title: string,
  type: number,
  feedBackStatus: number,
  background: string,
  subtitle: string,
  activeDate: Date
}

interface CustomerCareInfor {
  employeeName: string,
  employeePosition: string,
  employeeCharge: string,
  week1: Array<CustomerCareForWeek>,
  week2: Array<CustomerCareForWeek>,
  week3: Array<CustomerCareForWeek>,
  week4: Array<CustomerCareForWeek>,
  week5: Array<CustomerCareForWeek>
}

interface PreviewCustomerCare {
  effecttiveFromDate: Date,
  effecttiveToDate: Date,
  sendDate: Date,
  statusName: string,
  previewEmailContent: string,
  previewEmailName: string,
  previewEmailTitle: string,
  previewSmsPhone: string,
  previewSmsContent: string
}

interface CustomerCareFeedBack {
  customerCareFeedBackId: string,
  feedBackFromDate: Date,
  feedBackToDate: Date,
  feedBackType: string,
  feedBackCode: string,
  feedBackContent: string,
  customerId: string,
  customerCareId: string,
}

interface DataDialogCustomerFeedBack {
  name: string,
  fromDate: Date,
  toDate: Date,
  typeName: string,
  feedBackCode: string,
  feedbackContent: string
}

interface CustomerMeetingInfor {
  employeeName: string,
  employeePosition: string,
  employeeId: string,
  week1: Array<CustomerMeetingForWeek>,
  week2: Array<CustomerMeetingForWeek>,
  week3: Array<CustomerMeetingForWeek>,
  week4: Array<CustomerMeetingForWeek>,
  week5: Array<CustomerMeetingForWeek>
}

interface CustomerMeetingForWeek {
  customerMeetingId: string,
  employeeId: string,
  title: string,
  subTitle: string,
  background: string,
  startDate: Date,
  startHours: Date
}

interface DateInMonth {
  startDateWeek1: Date,
  endDateWeek1: Date,
  startDateWeek2: Date,
  endDateWeek2: Date,
  startDateWeek3: Date,
  endDateWeek3: Date,
  startDateWeek4: Date,
  endDateWeek4: Date,
  startDateWeek5: Date,
  endDateWeek5: Date,
}

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css'],
  providers: [GoogleService]
})
export class CustomerDetailComponent implements OnInit {
  /*Khai b??o bi???n*/
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  auth: any = JSON.parse(localStorage.getItem("auth"));

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionSMS: boolean = true;
  actionEmail: boolean = true;
  actionImport: boolean = true;
  /*END*/

  defaultNumberType = this.getDefaultNumberType();
  loading: boolean = false;
  listAction: MenuItem[];
  listCustomerGroup: Array<Category> = [];
  listCustomerStatus: Array<Category> = [];
  listPersonInCharge: Array<Employee> = [];
  listParticipants: Array<Employee> = [];
  customerTypeString: string = '';
  listStatusCustomerCare: Array<Category> = []; // List tr???ng th??i ch??m s??c kh??ch h??ng
  listBusinessSize: Array<Category> = []; //List Quy m?? doanh nghi???p
  listBusinessType: Array<Category> = []; //List L??nh v???c kinh doanh
  listPaymentMethod: Array<Category> = []; //List Ph????ng th???c thanh to??n
  listTypeOfBusiness: Array<Category> = []; //list Lo???i h??nh doanh nghi???p
  listCareStaff: Array<Employee> = []; //List nh??n vi??n ch??m s??c kh??ch h??ng
  listBusinessCareer: Array<Category> = []; //List Ng??nh ngh??? kinh doanh ch??nh
  listLocalTypeBusiness: Array<Category> = []; //List Lo???i doanh nghi???p
  listCustomerPosition: Array<Category> = []; //List Ch???c v??? c???a Kh??ch h??ng
  listArea: Array<Area> = [];
  listProvince: Array<Province> = [];
  listDistrict: Array<District> = [];
  listCurrentDistrict: Array<District> = [];
  listWard: Array<Ward> = [];
  listCurrentWard: Array<Ward> = [];
  noteContent: string = '';
  customerNameLabel: string = '';
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  noteDocumentModel: NoteDocumentModel = new NoteDocumentModel();
  listNoteDocumentModel: Array<NoteDocumentModel> = [];
  listUpdateNoteDocument: Array<NoteDocument> = [];
  noteHistory: Array<Note> = [];
  listGenders = [{ categoryCode: 'NAM', categoryName: 'Nam' }, { categoryCode: 'NU', categoryName: 'N????' }];
  listCountry: Array<Country> = [];
  listMaritalStatus: Array<Category> = [];
  customerId: string = '';
  noteId: string = null;
  isEditNote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  selectedCustomerList: Array<any> = [];
  countCustomer: number;
  defaultTab: number = 0;
  customerModel: CustomerModel = new CustomerModel();
  contactModel: ContactModel = new ContactModel();
  currentYear: number = (new Date()).getFullYear();
  listCustomerAdditionalInformation: Array<CustomerAdditionalInformation> = [];
  listSelectedCusAddInf: Array<CustomerAdditionalInformation> = [];
  listCusContact: Array<OtherContact> = []; //Danh s??ch ng?????i li??n h??? c???a kh??ch h??ng doanh nghi???p
  listOrderOfCustomer: Array<OrderOfCustomer> = []; //Danh s??ch ????n h??ng c???a kh??ch h??ng
  listBankAccount: Array<BankAccount> = [];
  listCustomerCareInfor: Array<CustomerCareInfor> = [];
  month: string = '';
  year: number = (new Date()).getFullYear();
  startDateWeek1: Date = null;
  endDateWeek1: Date = null;
  startDateWeek2: Date = null;
  endDateWeek2: Date = null;
  startDateWeek3: Date = null;
  endDateWeek3: Date = null;
  startDateWeek4: Date = null;
  endDateWeek4: Date = null;
  startDateWeek5: Date = null;
  endDateWeek5: Date = null;
  previewEmail: boolean = false;
  previewSMS: boolean = false;
  previewCustomerCare: PreviewCustomerCare = {
    effecttiveFromDate: new Date(),
    effecttiveToDate: new Date(),
    sendDate: new Date(),
    statusName: '',
    previewEmailName: '',
    previewEmailTitle: '',
    previewEmailContent: '',
    previewSmsContent: '',
    previewSmsPhone: '',
  }
  feedback: boolean = false;
  dataDialogCustomerFeedBack: DataDialogCustomerFeedBack = {
    name: '',
    fromDate: new Date(),
    toDate: new Date(),
    typeName: '',
    feedBackCode: '',
    feedbackContent: ''
  }
  listFeedBackCode: Array<Category> = [];
  customerCareFeedBack: CustomerCareFeedBack = {
    customerCareFeedBackId: this.emptyGuid,
    feedBackFromDate: new Date(),
    feedBackToDate: new Date(),
    feedBackType: '',
    feedBackCode: '',
    feedBackContent: '',
    customerId: '',
    customerCareId: '',
  }
  monthMeeting: string = '';
  yearMeeting: number = (new Date()).getFullYear();
  startDateWeek1Meeting: Date = null;
  endDateWeek1Meeting: Date = null;
  startDateWeek2Meeting: Date = null;
  endDateWeek2Meeting: Date = null;
  startDateWeek3Meeting: Date = null;
  endDateWeek3Meeting: Date = null;
  startDateWeek4Meeting: Date = null;
  endDateWeek4Meeting: Date = null;
  startDateWeek5Meeting: Date = null;
  endDateWeek5Meeting: Date = null;
  customerCodeOld: string = "";
  customerMeetingInfor: CustomerMeetingInfor = {
    employeeId: '',
    employeeName: '',
    employeePosition: '',
    week1: [],
    week2: [],
    week3: [],
    week4: [],
    week5: []
  }
  isExist: boolean = true;
  isApprovalWain: boolean = false;
  isSendApproval: boolean = false;
  isApprovalNew: boolean = false;
  isApprovalDD: boolean = false;
  listCustomerCode: any = []
  employeeId: string = JSON.parse(localStorage.getItem('auth')).EmployeeId;
  listSelect: Array<boolean> = [true, false, false, false, false, false, false, false];

  @ViewChild('fileUpload') fileUpload: FileUpload;

  /*Form th??ng tin c?? b???n*/
  customerBaseForm: FormGroup;

  cusFirstNameControl: FormControl;
  cusCodeControl: FormControl;
  cusLastNameControl: FormControl;
  cusGroupControl: FormControl;
  cusStatusControl: FormControl;
  cusStatusCareControl: FormControl;
  cusPersonInChargeControl: FormControl;
  /*End*/


  /*Form th??ng tin chung KH Doanh nghi???p*/
  customerInforForm: FormGroup;

  cusPhoneControl: FormControl;
  cusBusinessSizeControl: FormControl;
  cusBusinessTypeControl: FormControl;
  cusTaxControl: FormControl;
  cusEmailControl: FormControl;
  cusPaymentMethodControl: FormControl;
  cusMaxDebtDayControl: FormControl;
  cusMaxDebtValueControl: FormControl;
  cusLinkControl: FormControl;
  cusTypeOfBusinessControl: FormControl;
  cusTotalEmpSocialInsuranceControl: FormControl;
  cusCareStaffControl: FormControl;
  cusBusinessRegistrationDateControl: FormControl;
  cusTotalCapitalControl: FormControl;
  cusTotalRevenueLastYearControl: FormControl;
  cusMainBusinessSectorControl: FormControl;
  cusLocalTypeBusinessControl: FormControl;
  cusAreaControl: FormControl;
  cusProvinceControl: FormControl;
  cusDistrictControl: FormControl;
  cusWardControl: FormControl;
  cusAddressControl: FormControl;
  /*End*/

  /*Form th??ng tin chung KH C?? nh??n*/
  customerPersonalInforForm: FormGroup;

  cusPerGenderControl: FormControl;
  cusPerCountryControl: FormControl;
  cusPerTaxcodeControl: FormControl;
  cusPerBirthdayControl: FormControl;
  cusPerIdentityControl: FormControl;
  cusPerPaymentMethodControl: FormControl;
  cusPerBirthplaceControl: FormControl;
  cusPerMaritalStatusControl: FormControl;
  cusPerMaxDebtDayControl: FormControl;
  cusPerMaxDebtValueControl: FormControl;
  cusPerJobControl: FormControl;
  cusPerAgencyControl: FormControl;
  cusPerCareStaffControl: FormControl;
  cusPerCompanyNameControl: FormControl;
  cusPerCompanyAddressControl: FormControl;
  cusPerPositionControl: FormControl;
  /*End*/

  /*Form th??ng tin li??n h??? KH C?? nh??n*/
  customerPersonalContactForm: FormGroup;

  cusPerContPhoneControl: FormControl;
  cusPerContWorkPhoneControl: FormControl;
  cusPerContOtherPhoneControl: FormControl;
  cusPerContEmailControl: FormControl;
  cusPerContWorkEmailControl: FormControl;
  cusPerContOtherEmailControl: FormControl;
  cusPerContAreaControl: FormControl;
  cusPerContProvinceControl: FormControl;
  cusPerContDistrictControl: FormControl;
  cusPerContWardControl: FormControl;
  cusPerContAddressControl: FormControl;
  cusPerContOtherControl: FormControl;
  /*End*/

  /*Form th??ng tin li??n h??? KH C?? nh??n*/
  feedbackForm: FormGroup;

  feedbackCodeControl: FormControl;
  feedbackContentControl: FormControl;
  /*End*/

  /*Table*/
  colsFile: any;
  colsCustomerAdditionalInformation: any;
  colsCusContact: any;
  colsCusLead: any;
  colsCusQuote: Array<any> = [];
  colsCustomerOrderHistory: any;
  colsBankAccount: any;
  /*End*/

  /* create valiable add class scroll */
  fixed: boolean = false;
  withFiexd: string = "";

  //map
  options: any = {};
  overlays: any[] = [];
  map: google.maps.Map;
  zoom: number = 16;

  point: number = 0; //??i???m t??ch l??y
  payPoint: number = 0; //??i???m ???? thanh to??n

  warningConfig: MatSnackBarConfig = { panelClass: 'warning-dialog', horizontalPosition: 'end', duration: 5000 };

  validEmailCustomer: boolean = true;

  validPhoneCustomer: boolean = true;

  listCustomerLead: Array<any> = [];

  listCustomerQuote: Array<any> = [];

  applicationName = this.systemParameterList.find(x => x.systemKey == 'ApplicationName').systemValueString;
  isEdit: boolean = false;
  cusGroupLableName: string = '';
  cusStatusLableName: string = '';
  cusStatusCareLableName: string = '';
  personInChargeLableName: string = '';
  careStaffLableName: string = '';
  provinceLableName: string = '';
  districtLableName: string = '';
  wardLableName: string = '';
  areaLableName: string = '';
  cusLocalTypeBusinessLableName: string = '';
  cusBusinessSizeLableName: string = '';
  cusPaymentMethodLableName: string = '';
  cusBusinessTypeLableName: string = '';
  cusMainBusinessSectorLableName: string = '';
  cusTypeOfBusinessLableName: string = '';
  cusPerGenderLableName: string = '';
  cusPerCountryLableName: string = '';
  cusPerMaritalStatusLableName: string = '';
  cusPerPositionLableName: string = '';

  khachDuAn: boolean = false;

  constructor(
    private translate: TranslateService,
    private getPermission: GetPermission,
    private customerService: CustomerService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private wardService: WardService,
    private districtService: DistrictService,
    private provinceService: ProvinceService,
    private employeeService: EmployeeService,
    private customerCareService: CustomerCareService,
    private contactService: ContactService,
    private bankService: BankService,
    private router: Router,
    private fb: FormBuilder,
    private imageService: ImageUploadService,
    private noteService: NoteService,
    private el: ElementRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private emailConfigService: EmailConfigService,
    private googleService: GoogleService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar,
    public location: Location
  ) {
    this.translate.setDefaultLang('vi');
  }

  async ngOnInit() {
    this.setForm();
    //Check permission
    let resource = "crm/customer/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      this.snackBar.openFromComponent(WarningComponent, { data: 'B???n kh??ng c?? quy???n truy c???p', ... this.warningConfig });
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("sms") == -1) {
        this.actionSMS = false;
      }
      if (listCurrentActionResource.indexOf("email") == -1) {
        this.actionEmail = false;
      }
      if (listCurrentActionResource.indexOf("import") == -1) {
        this.actionImport = false;
      }

      this.route.params.subscribe(params => {
        this.customerId = params['customerId'];
        this.defaultTab = params['defaultTab'] != undefined ? params['defaultTab'] : 0;
      });

      this.getMasterData();
    }
  }

  setMap(event) {
    this.map = event.map;
    this.patchGeoCodingForMap(this.contactModel.Latitude, this.contactModel.Longitude, this.customerNameLabel);
  }


  getMasterData() {
    this.loading = true;
    this.customerService.getCustomerById(this.customerId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        // danh s??ch c?? h???i
        this.listCustomerLead = result.listCustomerLead;

        // danh s??ch b??o gi??
        this.listCustomerQuote = result.listCustomerQuote;

        //Nh??m kh??ch h??ng
        this.listCustomerGroup = result.listCustomerGroup;

        //Tr???ng th??i kh??ch h??ng
        this.listCustomerStatus = result.listCustomerStatus;

        //Tr???ng th??i ch??m s??c kh??ch h??ng
        this.listStatusCustomerCare = result.listStatusCustomerCare;

        //List nh??n vi??n ph??? tr??ch
        this.listPersonInCharge = result.listPersonInCharge;
        this.listPersonInCharge.forEach(item => {
          item.employeeName = item.employeeCode + ' - ' + item.employeeName;
        });

        this.listBusinessSize = result.listBusinessSize;
        this.listBusinessType = result.listBusinessType;
        this.listPaymentMethod = result.listPaymentMethod;
        this.listTypeOfBusiness = result.listTypeOfBusiness;
        this.listBusinessCareer = result.listBusinessCareer;
        this.listLocalTypeBusiness = result.listLocalTypeBusiness;
        this.listCustomerPosition = result.listCustomerPosition;
        this.listArea = result.listArea;
        this.listProvince = result.listProvince;
        this.listDistrict = result.listDistrict;
        this.listWard = result.listWard;
        this.listCountry = result.countryList;
        this.listMaritalStatus = result.listMaritalStatus;
        this.isSendApproval = result.isSendApproval;
        this.isApprovalNew = result.isApprovalNew;
        this.isApprovalDD = result.isApprovalDD;
        this.listParticipants = result.listParticipants;
        this.listParticipants.forEach(item => {
          item.employeeName = item.employeeCode + ' - ' + item.employeeName;
        });

        //Th??ng tin kh??c (C??u h???i/C??u tr??? l???i)
        this.listCustomerAdditionalInformation = result.listCustomerAdditionalInformation;

        //Danh s??ch ng?????i li??n h??? (KHDN)
        this.listCusContact = result.listCusContact;

        //Danh s??ch ????n h??ng c???a kh??ch h??ng
        this.listOrderOfCustomer = result.listOrderOfCustomer;

        //Danh s??ch th??ng tin thanh to??n c???a kh??ch h??ng
        this.listBankAccount = result.listBankAccount;

        //Danh s??ch th??ng tin CSKH
        this.listCustomerCareInfor = result.listCustomerCareInfor;

        //L???ch h???n
        this.customerMeetingInfor = result.customerMeetingInfor;

        this.listCareStaff = result.listCareStaff;
        this.listCareStaff.forEach(item => {
          item.employeeName = item.employeeCode + ' - ' + item.employeeName;
        });

        this.mapDataResponse(result.customer, result.contact, false);

        /*Reshow Time Line */
        this.noteHistory = result.listNote;
        this.handleNoteContent();

        // this.getListCustomerValidate();
        this.listCustomerCode = result.customerCode;
        this.customerBaseForm.get('cusCodeControl').setValidators([Validators.required, checkDuplicateCustomeCode(this.listCustomerCode, this.customerCodeOld)]);
        this.customerBaseForm.updateValueAndValidity();

      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  approveOrReject(isApprove) {
    let listSelectCus = [];
    listSelectCus.push(this.customerModel)
    let listIdCus: Array<string> = listSelectCus.map(e => e.CustomerId);
    if (isApprove !== null) {
      if (isApprove) {
        let count = listSelectCus.filter(f => f.PersonInChargeId.trim() == "");
        if (count.length != 0) {
          if (listSelectCus.length == 1) {
            this.showToast('warn', 'Th??ng b??o', "Kh??ch h??ng " + listSelectCus[0].customerName + " ch??a ???????c g??n ng?????i ph??? tr??ch, kh??ng th??? chuy???n ?????nh danh");
          }
          else {
            this.showToast('warn', 'Th??ng b??o', "Danh s??ch c?? kh??ch h??ng ch??a ???????c g??n ng?????i ph??? tr??ch, kh??ng th??? chuy???n ?????nh danh");
          }
        }
        else {
          this.confirmationService.confirm({
            message: 'B???n c?? ch???c ch???n mu???n ?????nh danh kh??ch h??ng n??y?',
            accept: () => {
              this.loading = true;
              this.customerService.approvalOrRejectCustomer(listIdCus, isApprove, true, this.auth.UserId).subscribe(response => {
                this.loading = false;
                let result = <any>response;
                if (result.statusCode === 202 || result.statusCode === 200) {
                  // this.listLead = this.listLead.filter(e => !leadListId.includes(e.leadId));
                  this.getMasterData();
                  this.showToast('success', 'Th??ng b??o', result.messageCode);
                } else {
                  this.showToast('error', 'Th??ng b??o', result.messageCode);
                }
              }, error => { this.loading = false; });
            }
          });
        }
      }
      else {
        this.confirmationService.confirm({
          message: 'B???n c?? ch???c ch???n mu???n t??? ch???i danh s??ch n??y?',
          accept: () => {
            this.loading = true;
            this.customerService.approvalOrRejectCustomer(listIdCus, isApprove, true, this.auth.UserId).subscribe(response => {
              this.loading = false;
              let result = <any>response;
              if (result.statusCode === 202 || result.statusCode === 200) {
                this.getMasterData();
                // this.listLead = this.listLead.filter(e => !leadListId.includes(e.leadId));
                this.showToast('success', 'Th??ng b??o', result.messageCode);
              } else {
                this.showToast('error', 'Th??ng b??o', result.messageCode);
              }
            }, error => { this.loading = false; });
          }
        });
      }
    }
    else {
      this.confirmationService.confirm({
        message: 'B???n c?? ch???c ch???n mu???n ph?? duy???t danh s??ch n??y?',
        accept: () => {
          this.loading = true;
          this.customerService.approvalOrRejectCustomer(listIdCus, true, false, this.auth.UserId).subscribe(response => {
            this.loading = false;
            let result = <any>response;
            if (result.statusCode === 202 || result.statusCode === 200) {
              // this.listLead = this.listLead.filter(e => !leadListId.includes(e.leadId));
              this.getMasterData();
              this.showToast('success', 'Th??ng b??o', result.messageCode);
            } else {
              this.showToast('error', 'Th??ng b??o', result.messageCode);
            }
          }, error => { this.loading = false; });
        }
      });
    }
  }

  statusCustomer() {

  }

  // async getListCustomerValidate() {
  //   this.loading = true;
  //   let result: any = await this.customerService.createCustomerMasterDataAsync(this.employeeId);
  //   this.loading = false;
  //   if (result.statusCode === 200) {
  //     this.listCustomerCode = result.listCustomerCode;
  //     this.customerBaseForm.get('cusCodeControl').setValidators([Validators.required, checkDuplicateCustomeCode(this.listCustomerCode, this.customerCodeOld)]);
  //     this.customerBaseForm.updateValueAndValidity();
  //   }
  // }

  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }

  setForm() {
    this.listAction = [
      {
        label: 'T???o c?? h???i', icon: 'pi pi-plus-circle', command: () => {
          if (this.actionAdd) {
            this.goToLead();
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n T???o ????n h??ng' };
            this.showMessage(msg);
          }
        }
      },
      {
        label: 'T???o ????n h??ng', icon: 'pi pi-plus-circle', command: () => {
          if (this.actionAdd) {
            this.goToOrderCreate();
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n T???o ????n h??ng' };
            this.showMessage(msg);
          }
        }
      },
      {
        label: 'T???o phi???u thu', icon: 'pi pi-plus-circle', command: () => {
          if (this.actionAdd) {
            this.goToCashReceiptsCreate();
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n T???o phi???u thu' };
            this.showMessage(msg);
          }
        }
      },
      {
        label: 'T???o b??o c??', icon: 'pi pi-plus-circle', command: () => {
          if (this.actionAdd) {
            this.goToBankReceiptsCreate();
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n T???o b??o c??' };
            this.showMessage(msg);
          }
        }
      },
      {
        label: 'T???o b??o gi??', icon: 'pi pi-plus-circle', command: () => {
          if (this.actionAdd) {
            if (this.cusPersonInChargeControl.value === null || this.cusPersonInChargeControl.value === undefined) {
              let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Kh??ch h??ng ch??a ???????c g??n ng?????i ph??? tr??ch!' };
              this.showMessage(mgs);
            } else {
              this.goToQuoteCreate();
            }
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n T???o b??o gi??' };
            this.showMessage(msg);
          }
        }
      },
      {
        label: 'Chi ti???t c??ng n???', icon: 'pi pi-plus-circle', command: () => {
          this.goToReceivableCustomerDetail();
        }
      },
      {
        label: 'G???i Email', icon: 'pi pi-plus', command: () => {
          if (this.actionEmail) {
            this.sendEmail();
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n G???i Email' };
            this.showMessage(msg);
          }
        }
      },
      {
        label: 'G???i SMS', icon: 'pi pi-plus', command: () => {
          if (this.actionSMS) {
            this.sendSMS();
          } else {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n G???i SMS' };
            this.showMessage(msg);
          }
        }
      },
    ];

    /*Table*/
    this.colsFile = [
      { field: 'documentName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left' },
      { field: 'documentSize', header: 'K??ch th?????c t??i li???u', width: '50%', textAlign: 'left' },
    ];

    //Th??ng tin kh??c (B??? C??u h???i/C??u tr??? l???i)
    this.colsCustomerAdditionalInformation = [
      { field: 'question', header: 'C??u h???i', width: '45%', textAlign: 'left' },
      { field: 'answer', header: 'C??u tr??? l???i', width: '45%', textAlign: 'left' },
    ];

    //Th??ng tin li??n h???
    this.colsCusContact = [
      { field: 'contactName', header: 'H??? v?? T??n', width: '15%', textAlign: 'left' },
      { field: 'genderName', header: 'Gi???i t??nh', width: '7%', textAlign: 'left' },
      { field: 'dateOfBirth', header: 'Ng??y sinh', width: '7%', textAlign: 'left' },
      { field: 'role', header: 'Ch???c v???', width: '15%', textAlign: 'left' },
      { field: 'phone', header: 'S??? ??i???n tho???i', width: '10%', textAlign: 'left' },
      { field: 'email', header: 'Email', width: '15%', textAlign: 'left' },
      { field: 'address', header: '?????a ch???', width: '20%', textAlign: 'left' },
      { field: 'other', header: 'Th??ng tin kh??c', width: '11%', textAlign: 'left' },
    ];

    //C?? h???i
    this.colsCusLead = [
      { field: 'leadCode', header: 'M?? c?? h???i', width: '150px', textAlign: 'left' },
      { field: 'fullName', header: 'T??n c?? h???i', width: '200px', textAlign: 'left' },
      { field: 'personInChargeFullName', header: 'Ng?????i ph??? tr??ch', width: '200px', textAlign: 'left' },
      { field: 'requirementDetail', header: 'Chi ti???t y??u c???u', width: '250px', textAlign: 'left' },
      { field: 'expectedSale', header: 'Doanh thu mong ?????i', width: '150px', textAlign: 'right' },
      { field: 'statusName', header: 'T??nh tr???ng', width: '100px', textAlign: 'center' },
    ];

    // B??o gi??
    this.colsCusQuote = [
      { field: 'quoteCode', header: 'S??? b??o gi??', width: '100px', textAlign: 'left' },
      { field: 'sendQuoteDate', header: 'Ng??y b??o gi??', width: '100px', textAlign: 'right' },
      { field: 'expirationDate', header: 'Hi???u l???c ?????n', width: '100px', textAlign: 'right' },
      { field: 'totalAmountAfterVat', header: 'T???ng ti???n', width: '100px', textAlign: 'right' },
      { field: 'statusName', header: 'T??nh tr???ng', width: '100px', textAlign: 'center' },
      { field: 'quoteName', header: 'M?? t???', width: '200px', textAlign: 'left' },
    ];

    //L???ch s??? mua h??ng
    this.colsCustomerOrderHistory = [
      { field: 'orderCode', header: 'M?? ????n h??ng', width: '20%', textAlign: 'left' },
      { field: 'orderDate', header: 'Ng??y ?????t h??ng', width: '10%', textAlign: 'right' },
      { field: 'statusName', header: 'Tr???ng th??i', width: '15%', textAlign: 'center' },
      { field: 'amount', header: 'Gi?? tr???', width: '25%', textAlign: 'right' },
      { field: 'sellerName', header: 'Nh??n vi??n b??n h??ng', width: '30%', textAlign: 'left' },
    ];

    //Th??ng tin thanh to??n
    this.colsBankAccount = [
      { field: 'bankName', header: 'T??n ng??n h??ng', width: '25%', textAlign: 'left' },
      { field: 'accountNumber', header: 'S??? t??i kho???n', width: '20%', textAlign: 'left' },
      { field: 'accountName', header: 'Ch??? t??i kho???n', width: '20%', textAlign: 'left' },
      { field: 'branchName', header: 'Chi nh??nh', width: '25%', textAlign: 'left' },
    ];
    /*End*/

    this.cusFirstNameControl = new FormControl(null, [Validators.maxLength(100)]);
    this.cusCodeControl = new FormControl(null, [Validators.required, checkDuplicateCode(this.listCustomerCode), forbiddenSpaceText]);
    this.cusLastNameControl = new FormControl(null, [Validators.maxLength(50), Validators.required, forbiddenSpaceText]);
    this.cusGroupControl = new FormControl(null);
    this.cusStatusControl = new FormControl(null);
    this.cusStatusCareControl = new FormControl(null);
    this.cusPersonInChargeControl = new FormControl(null, [Validators.required]);

    this.customerBaseForm = new FormGroup({
      cusFirstNameControl: this.cusFirstNameControl,
      cusCodeControl: this.cusCodeControl,
      cusLastNameControl: this.cusLastNameControl,
      cusGroupControl: this.cusGroupControl,
      cusStatusControl: this.cusStatusControl,
      cusStatusCareControl: this.cusStatusCareControl,
      cusPersonInChargeControl: this.cusPersonInChargeControl,
    });

    let emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';
    this.cusPhoneControl = new FormControl('', [Validators.required, Validators.pattern(this.getPhonePattern()), Validators.maxLength(50)]);
    this.cusBusinessSizeControl = new FormControl(null);
    this.cusBusinessTypeControl = new FormControl(null);
    this.cusTaxControl = new FormControl(null, [Validators.pattern('[a-zA-Z0-9-]+$'), Validators.maxLength(50)]);
    this.cusEmailControl = new FormControl('', [Validators.pattern(emailPattern), Validators.maxLength(100)]);
    this.cusPaymentMethodControl = new FormControl(null);
    this.cusMaxDebtDayControl = new FormControl(null);
    this.cusMaxDebtValueControl = new FormControl(null);
    this.cusLinkControl = new FormControl(null);
    this.cusTypeOfBusinessControl = new FormControl(null);
    this.cusTotalEmpSocialInsuranceControl = new FormControl(null);
    this.cusCareStaffControl = new FormControl(null, [Validators.required]);
    this.cusBusinessRegistrationDateControl = new FormControl(null);
    this.cusTotalCapitalControl = new FormControl(null);
    this.cusTotalRevenueLastYearControl = new FormControl(null);
    this.cusMainBusinessSectorControl = new FormControl(null);
    this.cusLocalTypeBusinessControl = new FormControl(null);
    this.cusAreaControl = new FormControl(null);
    this.cusProvinceControl = new FormControl(null);
    this.cusDistrictControl = new FormControl(null);
    this.cusWardControl = new FormControl(null);
    this.cusAddressControl = new FormControl(null, [Validators.maxLength(250)]);

    this.customerInforForm = new FormGroup({
      cusPhoneControl: this.cusPhoneControl,
      cusBusinessSizeControl: this.cusBusinessSizeControl,
      cusBusinessTypeControl: this.cusBusinessTypeControl,
      cusTaxControl: this.cusTaxControl,
      cusEmailControl: this.cusEmailControl,
      cusPaymentMethodControl: this.cusPaymentMethodControl,
      cusMaxDebtDayControl: this.cusMaxDebtDayControl,
      cusMaxDebtValueControl: this.cusMaxDebtValueControl,
      cusLinkControl: this.cusLinkControl,
      cusTypeOfBusinessControl: this.cusTypeOfBusinessControl,
      cusTotalEmpSocialInsuranceControl: this.cusTotalEmpSocialInsuranceControl,
      cusCareStaffControl: this.cusCareStaffControl,
      cusBusinessRegistrationDateControl: this.cusBusinessRegistrationDateControl,
      cusTotalCapitalControl: this.cusTotalCapitalControl,
      cusTotalRevenueLastYearControl: this.cusTotalRevenueLastYearControl,
      cusMainBusinessSectorControl: this.cusMainBusinessSectorControl,
      cusLocalTypeBusinessControl: this.cusLocalTypeBusinessControl,
      cusAreaControl: this.cusAreaControl,
      cusProvinceControl: this.cusProvinceControl,
      cusDistrictControl: this.cusDistrictControl,
      cusWardControl: this.cusWardControl,
      cusAddressControl: this.cusAddressControl,
    });

    /*FORM KH??CH H??NG C?? NH??N*/
    let prc = '[a-zA-Z0-9-]+$';
    let prc_1 = '[a-zA-Z0-9]+$';
    this.cusPerGenderControl = new FormControl(null);
    this.cusPerCountryControl = new FormControl(null);
    this.cusPerTaxcodeControl = new FormControl(null, [Validators.maxLength(50), Validators.pattern(prc)]);
    this.cusPerBirthdayControl = new FormControl(null);
    this.cusPerIdentityControl = new FormControl(null, [Validators.maxLength(20), Validators.pattern(prc_1)]);
    this.cusPerPaymentMethodControl = new FormControl(null);
    this.cusPerBirthplaceControl = new FormControl(null, [Validators.maxLength(100)]);
    this.cusPerMaritalStatusControl = new FormControl(null);
    this.cusPerMaxDebtDayControl = new FormControl(null);
    this.cusPerMaxDebtValueControl = new FormControl(null);
    this.cusPerJobControl = new FormControl(null, [Validators.maxLength(100)]);
    this.cusPerAgencyControl = new FormControl(null, [Validators.maxLength(100)]);
    this.cusPerCareStaffControl = new FormControl(null, [Validators.required]);
    this.cusPerCompanyNameControl = new FormControl(null, [Validators.maxLength(500)]);
    this.cusPerCompanyAddressControl = new FormControl(null, [Validators.maxLength(250)]);
    this.cusPerPositionControl = new FormControl(null);

    this.customerPersonalInforForm = new FormGroup({
      cusPerGenderControl: this.cusPerGenderControl,
      cusPerCountryControl: this.cusPerCountryControl,
      cusPerTaxcodeControl: this.cusPerTaxcodeControl,
      cusPerBirthdayControl: this.cusPerBirthdayControl,
      cusPerIdentityControl: this.cusPerIdentityControl,
      cusPerPaymentMethodControl: this.cusPerPaymentMethodControl,
      cusPerBirthplaceControl: this.cusPerBirthplaceControl,
      cusPerMaritalStatusControl: this.cusPerMaritalStatusControl,
      cusPerMaxDebtDayControl: this.cusPerMaxDebtDayControl,
      cusPerMaxDebtValueControl: this.cusPerMaxDebtValueControl,
      cusPerJobControl: this.cusPerJobControl,
      cusPerAgencyControl: this.cusPerAgencyControl,
      cusPerCareStaffControl: this.cusPerCareStaffControl,
      cusPerCompanyNameControl: this.cusPerCompanyNameControl,
      cusPerCompanyAddressControl: this.cusPerCompanyAddressControl,
      cusPerPositionControl: this.cusPerPositionControl
    });
    /*END*/

    /*FORM TH??NG TIN LI??N H??? KH??CH H??NG C?? NH??N*/
    this.cusPerContPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern()), Validators.maxLength(50), Validators.required]);
    this.cusPerContWorkPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern()), Validators.maxLength(50)]);
    this.cusPerContOtherPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern()), Validators.maxLength(50)]);
    this.cusPerContEmailControl = new FormControl(null, [Validators.pattern(emailPattern), Validators.maxLength(100)]);
    this.cusPerContWorkEmailControl = new FormControl(null, [Validators.pattern(emailPattern), Validators.maxLength(100)]);
    this.cusPerContOtherEmailControl = new FormControl(null, [Validators.pattern(emailPattern), Validators.maxLength(100)]);
    this.cusPerContAreaControl = new FormControl(null);
    this.cusPerContProvinceControl = new FormControl(null);
    this.cusPerContDistrictControl = new FormControl(null);
    this.cusPerContWardControl = new FormControl(null);
    this.cusPerContAddressControl = new FormControl(null, [Validators.maxLength(250)]);
    this.cusPerContOtherControl = new FormControl(null, [Validators.maxLength(500)]);

    this.customerPersonalContactForm = this.fb.group({
      'cusPerContPhoneControl': this.cusPerContPhoneControl,
      'cusPerContWorkPhoneControl': this.cusPerContWorkPhoneControl,
      'cusPerContOtherPhoneControl': this.cusPerContOtherPhoneControl,
      'cusPerContEmailControl': this.cusPerContEmailControl,
      'cusPerContWorkEmailControl': this.cusPerContWorkEmailControl,
      'cusPerContOtherEmailControl': this.cusPerContOtherEmailControl,
      'cusPerContAreaControl': this.cusPerContAreaControl,
      'cusPerContProvinceControl': this.cusPerContProvinceControl,
      'cusPerContDistrictControl': this.cusPerContDistrictControl,
      'cusPerContWardControl': this.cusPerContWardControl,
      'cusPerContAddressControl': this.cusPerContAddressControl,
      'cusPerContOtherControl': this.cusPerContOtherControl
    });
    /*END*/

    /*FORM FEED BACK*/
    this.feedbackCodeControl = new FormControl(null, [Validators.required]);
    this.feedbackContentControl = new FormControl(null, [Validators.required]);

    this.feedbackForm = new FormGroup({
      feedbackCodeControl: this.feedbackCodeControl,
      feedbackContentControl: this.feedbackContentControl
    });
    /*END*/

    this.month = ((new Date()).getMonth() + 1).toString().length == 1 ? ('0' + ((new Date()).getMonth() + 1).toString()) : ((new Date()).getMonth() + 1).toString();
    this.getDateByTime(parseFloat(this.month), this.year, 'cus_care');

    this.monthMeeting = ((new Date()).getMonth() + 1).toString().length == 1 ? ('0' + ((new Date()).getMonth() + 1).toString()) : ((new Date()).getMonth() + 1).toString();
    this.getDateByTime(parseFloat(this.monthMeeting), this.yearMeeting, 'cus_meeting');

  }

  mapDataResponse(customer: any, contact: any, isEdit: boolean) {
    this.khachDuAn = customer.khachDuAn;

    if (!isEdit) {
      //??i???m t??ch l??y
      this.point = customer.point;

      this.countCustomer = customer.countCustomerInfo;
      this.customerCodeOld = customer.customerCode;

      this.customerModel = <CustomerModel>({
        CustomerId: this.customerId,
        CustomerCode: customer.customerCode,
        CustomerGroupId: customer.customerGroupId,
        CustomerName: customer.customerName,
        CustomerCareStaff: customer.customerCareStaff,
        StatusId: customer.statusId,
        CustomerServiceLevelId: customer.customerServiceLevelId,
        CustomerServiceLevelName: customer.customerServiceLevelName,
        PersonInChargeId: customer.personInChargeId,
        CustomerType: customer.customerType,
        PaymentId: customer.paymentId,
        MaximumDebtValue: customer.maximumDebtValue,
        MaximumDebtDays: customer.maximumDebtDays,
        MainBusinessSector: customer.mainBusinessSector,
        FieldId: customer.fieldId,
        ScaleId: customer.scaleId,
        TotalSaleValue: customer.totalSaleValue,
        TotalReceivable: customer.totalReceivable,
        NearestDateTransaction: customer.nearestDateTransaction,
        BusinessRegistrationDate: customer.businessRegistrationDate,
        EnterpriseType: customer.enterpriseType,
        BusinessScale: customer.businessScale,
        BusinessType: customer.businessType,
        TotalEmployeeParticipateSocialInsurance: customer.totalEmployeeParticipateSocialInsurance,
        TotalCapital: customer.totalCapital,
        TotalRevenueLastYear: customer.totalRevenueLastYear,
        CreatedById: customer.createdById,
        CreatedDate: customer.createdDate,
        UpdatedById: customer.updatedById,
        UpdatedDate: customer.updatedDate,
        Active: customer.active,
        IsGraduated: customer.isGraduated,
        IsApproval: customer.isApproval,
        ApprovalStep: customer.approvalStep,
        StatusCareId: customer.statusCareId,
        KhachDuAn: customer.khachDuAn
      });

      //Th??ng tin chi ti???t kh??ch h??ng
      this.contactModel = <ContactModel>({
        ContactId: contact.contactId,
        ObjectId: contact.objectId,
        ObjectType: contact.objectType,
        FirstName: contact.firstName != null ? contact.firstName.trim() : "",
        LastName: contact.lastName != null ? contact.lastName.trim() : "",
        Phone: contact.phone != null ? contact.phone.trim() : "",
        Email: contact.email != null ? contact.email.trim() : "",
        Address: contact.address != null ? contact.address.trim() : "",
        Gender: contact.gender,
        DateOfBirth: contact.dateOfBirth != null ? new Date(contact.dateOfBirth) : null,
        WorkPhone: contact.workPhone,
        OtherPhone: contact.otherPhone,
        WorkEmail: contact.workEmail,
        OtherEmail: contact.otherEmail,
        IdentityID: contact.identityId,
        AvatarUrl: contact.avatarUrl,
        CountryId: contact.countryId,
        DistrictId: contact.districtId,
        ProvinceId: contact.provinceId,
        WebsiteUrl: contact.websiteUrl,
        WardId: contact.wardId,
        MaritalStatusId: contact.maritalStatusId,
        PostCode: contact.postCode,
        Note: contact.note,
        Role: contact.role,
        TaxCode: contact.taxCode,
        Job: contact.job,
        Agency: contact.agency,
        CompanyName: contact.companyName,
        CompanyAddress: contact.companyAddress,
        CustomerPosition: contact.customerPosition,
        Birthplace: contact.birthplace,
        CreatedById: contact.createdById,
        CreatedDate: contact.createdDate,
        UpdatedById: contact.updatedById,
        UpdatedDate: contact.updatedDate,
        Active: contact.active,
        Other: contact.other,
        Longitude: contact.longitude,
        Latitude: contact.latitude,
        AreaId: contact.areaId,
      });
    }

    if (this.isSendApproval && this.customerModel.IsApproval) {
      this.isApprovalWain = true;
    }
    else { this.isApprovalWain = false }

    //customerType: Kh??ch h??ng doanh nghi???p, kh??ch h??ng c?? nh??n, h??? kinh doanh
    switch (this.customerModel.CustomerType) {
      case 1:
        this.customerTypeString = "Kh??ch h??ng doanh nghi???p";
        break;

      case 2:
        this.customerTypeString = "Kh??ch h??ng c?? nh??n";
        break;

      case 3:
        this.customerTypeString = "Kh??ch h??ng ?????i l??";
        break;

      default:
        break;
    }

    //Full Name
    this.customerNameLabel = this.customerModel.CustomerName ?? null;

    //M?? kh??ch h??ng
    this.cusCodeControl.setValue(this.customerModel.CustomerCode);

    //H??? v?? T??n ?????m
    this.cusFirstNameControl.setValue(this.contactModel.FirstName);

    //T??n
    this.cusLastNameControl.setValue(this.contactModel.LastName);

    //Nh??m kh??ch h??ng
    let toSelectedCusGroup = this.listCustomerGroup.find(x => x.categoryId == this.customerModel.CustomerGroupId);
    this.cusGroupControl.setValue(toSelectedCusGroup);
    this.cusGroupLableName = toSelectedCusGroup ? toSelectedCusGroup.categoryName : null;

    //Tr???ng th??i kh??ch h??ng
    let toSelectedCusStatus = this.listCustomerStatus.find(x => x.categoryId == this.customerModel.StatusId);
    this.cusStatusControl.setValue(toSelectedCusStatus);
    this.cusStatusLableName = toSelectedCusStatus.categoryName;

    //Tr???ng th??i ch??m s??c kh??ch h??ng
    let toSelectedCusStatusCare = this.listStatusCustomerCare.find(x => x.categoryId == this.customerModel.StatusCareId);
    if (toSelectedCusStatusCare) {
      this.cusStatusCareControl.setValue(toSelectedCusStatusCare);
      this.cusStatusCareLableName = toSelectedCusStatusCare.categoryName;
    } else {
      this.cusStatusCareControl.setValue(null);
      this.cusStatusCareLableName = '';
    }

    //Nh??n vi??n ph??? tr??ch
    let toSelectedPersonInCharge = this.listPersonInCharge.find(x => x.employeeId == this.customerModel.PersonInChargeId);
    this.cusPersonInChargeControl.setValue(toSelectedPersonInCharge);
    this.personInChargeLableName = toSelectedPersonInCharge.employeeName;

    /*Kh??ch h??ng doanh nghi???p*/

    if (this.customerModel.CustomerType == 1) {
      //S??? ??i???n tho???i
      this.cusPhoneControl.setValue(this.contactModel.Phone);

      //L??nh v???c kinh doanh
      let toSelectedBusinessType = this.listBusinessType.find(x => x.categoryId == this.customerModel.FieldId);
      if (toSelectedBusinessType) {
        this.cusBusinessTypeControl.setValue(toSelectedBusinessType);
        this.cusBusinessTypeLableName = toSelectedBusinessType.categoryName;
      }

      //M?? s??? thu???
      this.cusTaxControl.setValue(this.contactModel.TaxCode);

      //Email
      this.cusEmailControl.setValue(this.contactModel.Email);

      //Quy M??
      let toSelectedBussineeSize = this.listBusinessSize.find(x => x.categoryId == this.customerModel.BusinessScale);
      if (toSelectedBussineeSize) {
        this.cusBusinessSizeControl.setValue(toSelectedBussineeSize);
        this.cusBusinessSizeLableName = toSelectedBussineeSize.categoryName;
      }

      //Ph????ng th???c thanh to??n
      let toSelectedPaymentMethod = this.listPaymentMethod.find(x => x.categoryId == this.customerModel.PaymentId);
      if (toSelectedPaymentMethod) {
        this.cusPaymentMethodControl.setValue(toSelectedPaymentMethod);
        this.cusPaymentMethodLableName = toSelectedPaymentMethod.categoryName;
      }

      //S??? ng??y ???????c n???
      this.cusMaxDebtDayControl.setValue(this.customerModel.MaximumDebtDays);

      //S??? n??? t???i ??a
      this.cusMaxDebtValueControl.setValue(this.customerModel.MaximumDebtValue);

      //Link
      this.cusLinkControl.setValue(this.contactModel.WebsiteUrl);

      //Lo???i h??nh doanh nghi???p
      let toSelectedTypeOfBusiness = this.listTypeOfBusiness.find(x => x.categoryId == this.customerModel.EnterpriseType);
      if (toSelectedTypeOfBusiness) {
        this.cusTypeOfBusinessControl.setValue(toSelectedTypeOfBusiness);
        this.cusTypeOfBusinessLableName = toSelectedTypeOfBusiness.categoryName;
      }

      //S??? lao ?????ng tham gia b???o hi???m
      this.cusTotalEmpSocialInsuranceControl.setValue(this.customerModel.TotalEmployeeParticipateSocialInsurance);

      //Nh??n vi??n ch??m s??c kh??ch h??ng
      let toSelectedCareStaff = this.listCareStaff.find(x => x.employeeId == this.customerModel.CustomerCareStaff);
      if (toSelectedCareStaff) {
        this.cusCareStaffControl.setValue(toSelectedCareStaff);
        this.careStaffLableName = toSelectedCareStaff.employeeName;
      }

      //Ng??y c???p
      let businessRegistrationDate = this.customerModel.BusinessRegistrationDate;
      if (businessRegistrationDate) {
        this.cusBusinessRegistrationDateControl.setValue(new Date(businessRegistrationDate))
      }

      //T???ng ngu???n v???n
      this.cusTotalCapitalControl.setValue(this.customerModel.TotalCapital);

      //T???ng doanh thu n??m tr?????c
      this.cusTotalRevenueLastYearControl.setValue(this.customerModel.TotalRevenueLastYear);

      //Ng??nh ngh??? kinh doanh ch??nh
      let toSelectedMainBusinessSector = this.listBusinessCareer.find(x => x.categoryId == this.customerModel.MainBusinessSector);
      if (toSelectedMainBusinessSector) {
        this.cusMainBusinessSectorControl.setValue(toSelectedMainBusinessSector);
        this.cusMainBusinessSectorLableName = toSelectedMainBusinessSector.categoryName;
      }

      //Lo???i doanh nghi???p
      let toSelectLocalTypeBusiness = this.listLocalTypeBusiness.find(x => x.categoryId == this.customerModel.BusinessType);
      if (toSelectLocalTypeBusiness) {
        this.cusLocalTypeBusinessControl.setValue(toSelectLocalTypeBusiness);
        this.cusLocalTypeBusinessLableName = toSelectLocalTypeBusiness.categoryName;
      }

      //Khu vuc
      let toSelectedArea: Area = this.listArea.find(x => x.areaId == this.contactModel.AreaId);
      if (toSelectedArea) {
        this.cusAreaControl.setValue(toSelectedArea);
        this.areaLableName = toSelectedArea.areaName;
      }

      //T???nh
      let toSelectedProvince: Province = this.listProvince.find(x => x.provinceId == this.contactModel.ProvinceId);
      if (toSelectedProvince) {
        this.cusProvinceControl.setValue(toSelectedProvince);
        this.listCurrentDistrict = this.listDistrict.filter(x => x.provinceId == toSelectedProvince.provinceId);
        this.provinceLableName = toSelectedProvince.provinceName;
      }

      //Qu???n/Huy???n
      let toSelectedDistrict = this.listCurrentDistrict.find(x => x.districtId == this.contactModel.DistrictId);
      if (toSelectedDistrict) {
        this.cusDistrictControl.setValue(toSelectedDistrict);
        this.listCurrentWard = this.listWard.filter(x => x.districtId == toSelectedDistrict.districtId);
        this.districtLableName = toSelectedDistrict.districtName;
      }

      //Ph?????ng/X??
      let toSelectedWard = this.listCurrentWard.find(x => x.wardId == this.contactModel.WardId);
      if (toSelectedWard) {
        this.cusWardControl.setValue(toSelectedWard);
        this.wardLableName = toSelectedWard.wardName;
      }

      //?????a ch???
      this.cusAddressControl.setValue(this.contactModel.Address);

    }

    /*End*/

    /*Kh??ch h??ng C?? nh??n*/

    if (this.customerModel.CustomerType != 1) {
      //Gi???i t??nh
      let toSelectedGender = this.listGenders.find(x => x.categoryCode == this.contactModel.Gender);
      if (toSelectedGender) {
        this.cusPerGenderControl.setValue(toSelectedGender);
        this.cusPerGenderLableName = toSelectedGender.categoryName;
      }

      //Qu???c t???ch
      let toSelectedCountry = this.listCountry.find(x => x.countryId == this.contactModel.CountryId);
      if (toSelectedCountry) {
        this.cusPerCountryControl.setValue(toSelectedCountry);
        this.cusPerCountryLableName = toSelectedCountry.countryName;
      }

      //M?? s??? thu???
      this.cusPerTaxcodeControl.setValue(this.contactModel.TaxCode);

      //Ng??y sinh
      this.cusPerBirthdayControl.setValue(this.contactModel.DateOfBirth);

      //S??? ?????n danh c?? nh??n
      this.cusPerIdentityControl.setValue(this.contactModel.IdentityID);

      //Ph????ng th???c thanh to??n
      let toSelectedPerPaymentMethod = this.listPaymentMethod.find(x => x.categoryId == this.customerModel.PaymentId);
      if (toSelectedPerPaymentMethod) {
        this.cusPerPaymentMethodControl.setValue(toSelectedPerPaymentMethod);
        this.cusPaymentMethodLableName = toSelectedPerPaymentMethod.categoryName;
      }

      //N??i sinh
      this.cusPerBirthplaceControl.setValue(this.contactModel.Birthplace);

      //T??nh tr???ng h??n nh??n
      let toSelectedMaritalStatus = this.listMaritalStatus.find(x => x.categoryId == this.contactModel.MaritalStatusId);
      if (toSelectedMaritalStatus) {
        this.cusPerMaritalStatusControl.setValue(toSelectedMaritalStatus);
        this.cusPerMaritalStatusLableName = toSelectedMaritalStatus.categoryName;
      }

      //S??? ng??y ???????c n???
      this.cusPerMaxDebtDayControl.setValue(this.customerModel.MaximumDebtDays);

      //S??? n??? t???i ??a
      this.cusPerMaxDebtValueControl.setValue(this.customerModel.MaximumDebtValue);

      //Ngh??? nghi???p
      this.cusPerJobControl.setValue(this.contactModel.Job);

      //C?? quan
      this.cusPerAgencyControl.setValue(this.contactModel.Agency);

      //Nh??n vi??n ch??m s??c kh??ch h??ng
      let toSelectedPerCareStaff = this.listCareStaff.find(x => x.employeeId == this.customerModel.CustomerCareStaff);
      if (toSelectedPerCareStaff) {
        this.cusPerCareStaffControl.setValue(toSelectedPerCareStaff);
        this.careStaffLableName = toSelectedPerCareStaff.employeeName;
      }

      //T??n c??ng ty
      this.cusPerCompanyNameControl.setValue(this.contactModel.CompanyName);

      //?????a ch??? c??ng ty
      this.cusPerCompanyAddressControl.setValue(this.contactModel.CompanyAddress);

      //Ch???c v???
      let toSelectedPosition = this.listCustomerPosition.find(x => x.categoryId == this.contactModel.CustomerPosition);
      if (toSelectedPosition) {
        this.cusPerPositionControl.setValue(toSelectedPosition);
        this.cusPerPositionLableName = toSelectedPosition.categoryName;
      }

      /*Th??ng tin li??n h???*/

      if (this.contactModel.Phone) {
        this.cusPerContPhoneControl.setValue(this.contactModel.Phone.trim());
      }

      if (this.contactModel.WorkPhone) {
        this.cusPerContWorkPhoneControl.setValue(this.contactModel.WorkPhone.trim());
      }

      if (this.contactModel.OtherPhone) {
        this.cusPerContOtherPhoneControl.setValue(this.contactModel.OtherPhone.trim());
      }

      if (this.contactModel.Email) {
        this.cusPerContEmailControl.setValue(this.contactModel.Email.trim());
      }

      if (this.contactModel.WorkEmail) {
        this.cusPerContWorkEmailControl.setValue(this.contactModel.WorkEmail.trim());
      }

      if (this.contactModel.OtherEmail) {
        this.cusPerContOtherEmailControl.setValue(this.contactModel.OtherEmail.trim());
      }

      //Khu v???c
      let toSelectedArea: Area = this.listArea.find(x => x.areaId == this.contactModel.AreaId);
      if (toSelectedArea) {
        this.cusPerContAreaControl.setValue(toSelectedArea);
        this.areaLableName = toSelectedArea.areaName;
      }

      //T???nh
      let toSelectedProvince: Province = this.listProvince.find(x => x.provinceId == this.contactModel.ProvinceId);
      if (toSelectedProvince) {
        this.cusPerContProvinceControl.setValue(toSelectedProvince);
        this.listCurrentDistrict = this.listDistrict.filter(x => x.provinceId == toSelectedProvince.provinceId);
        this.provinceLableName = toSelectedProvince.provinceName;
      }

      //Qu???n/Huy???n
      let toSelectedDistrict = this.listCurrentDistrict.find(x => x.districtId == this.contactModel.DistrictId);
      if (toSelectedDistrict) {
        this.cusPerContDistrictControl.setValue(toSelectedDistrict);
        this.listCurrentWard = this.listWard.filter(x => x.districtId == toSelectedDistrict.districtId);
        this.districtLableName = toSelectedDistrict.districtName;
      }

      //Ph?????ng/X??
      let toSelectedWard = this.listCurrentWard.find(x => x.wardId == this.contactModel.WardId);
      if (toSelectedWard) {
        this.cusPerContWardControl.setValue(toSelectedWard);
        this.wardLableName = toSelectedWard.wardName;
      }

      //?????a ch???
      if (this.contactModel.Address) {
        this.cusPerContAddressControl.setValue(this.contactModel.Address.trim());
      }

      //Th??ng tin kh??c
      if (this.contactModel.Other) {
        this.cusPerContOtherControl.setValue(this.contactModel.Other.trim());
      }

      /*End*/
    }

    //patch v??? tr?? kh??ch h??ng tr??n b???n ?????
    this.patchGeoCodingForMap(contact.latitude, contact.longitude, this.customerNameLabel);
    /*End*/
  }

  /*?????n trang t???o c?? h???i*/
  goToLead() {
    this.router.navigate(['/lead/create-lead', {
      customerId: this.customerId
    }]);
  }

  /*?????n trang t???o ????n h??ng*/
  goToOrderCreate() {
    this.router.navigate(['/order/create', { customerId: this.customerId }]);
  }

  /*?????n trang t???o phi???u thu*/
  goToCashReceiptsCreate() {
    this.router.navigate(['/accounting/cash-receipts-create', { customerId: this.customerId }]);
  }

  /*?????n trang t???o b??o c??*/
  goToBankReceiptsCreate() {
    this.router.navigate(['/accounting/bank-receipts-create', { customerId: this.customerId }]);
  }

  /*?????n trang t???o b??o gi??*/
  goToQuoteCreate() {
    this.router.navigate(['/customer/quote-create', { customerId: this.customerId }]);
  }

  /*?????n trang chi ti???t c??ng n??? kh??ch h??ng*/
  goToReceivableCustomerDetail() {
    this.router.navigate(['/accounting/receivable-customer-detail', { id: this.customerId }]);
  }

  /*G???i Email*/
  sendEmail() {
    this.selectedCustomerList = [];
    this.selectedCustomerList.push(this.customerId);

    let ref = this.dialogService.open(TemplateQuickEmailComponent, {
      data: {
        leadIdList: this.selectedCustomerList
      },
      header: 'G???i email',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "900px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          if (result.message == "success") {
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'G???i email th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        }
      }
    });
  }

  /*G???i SMS*/
  sendSMS() {
    this.selectedCustomerList = [];
    this.selectedCustomerList.push(this.customerId);

    let ref = this.dialogService.open(SendSmsDialogComponent, {
      data: {
        leadIdList: this.selectedCustomerList
      },
      header: 'G???i SMS',
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
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'G???i SMS th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        }
      }
    });
  }

  /*Event thay ?????i T???nh/Th??nh ph???*/
  async changeProvince() {
    let toSelectedProvince: Province = this.cusProvinceControl.value;
    this.cusDistrictControl.setValue(null);
    this.cusWardControl.setValue(null);
    if (toSelectedProvince) {
      this.loading = true;
      let result: any = await this.districtService.getAllDistrictByProvinceIdAsync(toSelectedProvince.provinceId);
      this.loading = false;
      if (result.statusCode === 200) {
        this.listCurrentDistrict = result.listDistrict;
      }
    } else {
      this.listCurrentDistrict = [];
      this.listCurrentWard = [];
    }
  }

  /*Event thay ?????i Qu???n/Huy???n*/
  async changeDistrict() {
    let toSelectedDistrict: District = this.cusDistrictControl.value;
    this.cusWardControl.setValue(null);
    if (toSelectedDistrict) {
      this.loading = true;
      let result: any = await this.wardService.getAllWardByDistrictIdAsync(toSelectedDistrict.districtId);
      this.loading = false;
      if (result.statusCode === 200) {
        this.listCurrentWard = result.listWard;
      }
    } else {
      this.listCurrentWard = [];
    }
  }

  /*Event thay ?????i n???i dung ghi ch??*/
  currentTextChange: string = '';
  changeNoteContent(event) {
    let htmlValue = event.htmlValue;
    this.currentTextChange = event.textValue;
  }

  /*Event Th??m c??c file ???????c ch???n v??o list file*/
  handleFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= 10000000) {
        if (type.indexOf('/') != -1) {
          type = type.slice(0, type.indexOf('/'));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf('.'));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedFiles.push(file);
          }
        }
      }
    }
  }

  /*Event Khi click x??a t???ng file*/
  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event Khi click x??a to??n b??? file*/
  clearAllFile() {
    this.uploadedFiles = [];
  }

  /*H???y s???a ghi ch??*/
  cancelNote() {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n h???y ghi ch?? n??y?',
      accept: () => {
        this.noteId = null;
        this.noteContent = null;
        this.uploadedFiles = [];
        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }
        this.listUpdateNoteDocument = [];
        this.isEditNote = false;
      }
    });
  }

  /*L??u file v?? ghi ch?? v??o Db*/
  async saveNote() {
    this.loading = true;
    this.listNoteDocumentModel = [];

    /*Upload file m???i n???u c??*/
    if (this.uploadedFiles.length > 0) {
      await this.uploadFilesAsync(this.uploadedFiles);

      for (var x = 0; x < this.uploadedFiles.length; ++x) {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = this.uploadedFiles[x].name;
        noteDocument.DocumentSize = this.uploadedFiles[x].size.toString();

        this.listNoteDocumentModel.push(noteDocument);
      }
    }

    let noteModel = new NoteModel();

    if (!this.noteId) {
      /*T???o m???i ghi ch??*/

      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.customerId;
      noteModel.ObjectType = 'CUS';
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi ch??*/

      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.customerId;
      noteModel.ObjectType = 'CUS';
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();

      //Th??m file c?? ???? l??u n???u c??
      this.listUpdateNoteDocument.forEach(item => {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = item.documentName;
        noteDocument.DocumentSize = item.documentSize;

        this.listNoteDocumentModel.push(noteDocument);
      });
    }

    this.noteService.createNoteForCustomerDetail(noteModel, this.listNoteDocumentModel).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedFiles = [];
        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;

        /*Reshow Time Line */
        this.noteHistory = result.listNote;
        this.handleNoteContent();

        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: "L??u ghi ch?? th??nh c??ng" };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  async uploadFilesAsync(files: File[]) {
    await this.imageService.uploadFileAsync(files);
  }

  // Upload file to server
  uploadFiles(files: File[]) {
    this.imageService.uploadFile(files).subscribe(response => { });
  }

  /*X??? l?? v?? hi???n th??? l???i n???i dung ghi ch??*/
  handleNoteContent() {

    this.noteHistory.forEach(element => {
      setTimeout(() => {
        let count = 0;
        if (element.description == null) {
          element.description = "";
        }

        let des = $.parseHTML(element.description);
        let newTextContent = '';
        for (let i = 0; i < des.length; i++) {
          count += des[i].textContent.length;
          newTextContent += des[i].textContent;
        }

        if (count > 250) {
          newTextContent = newTextContent.substr(0, 250) + '<b>...</b>';
          $('#' + element.noteId).find('.short-content').append($.parseHTML(newTextContent));
        } else {
          $('#' + element.noteId).find('.short-content').append($.parseHTML(element.description));
        }

        // $('#' + element.noteId).find('.note-title').append($.parseHTML(element.noteTitle));
        $('#' + element.noteId).find('.full-content').append($.parseHTML(element.description));
      }, 1000);
    });
  }
  /*End*/

  /*Event M??? r???ng/Thu g???n n???i dung c???a ghi ch??*/
  toggle_note_label: string = 'M??? r???ng';
  trigger_node(nodeid: string, event) {
    // noteContent
    let shortcontent_ = $('#' + nodeid).find('.short-content');
    let fullcontent_ = $('#' + nodeid).find('.full-content');
    if (shortcontent_.css("display") === "none") {
      fullcontent_.css("display", "none");
      shortcontent_.css("display", "block");
    } else {
      fullcontent_.css("display", "block");
      shortcontent_.css("display", "none");
    }
    // noteFile
    let shortcontent_file = $('#' + nodeid).find('.short-content-file');
    let fullcontent_file = $('#' + nodeid).find('.full-content-file');
    let continue_ = $('#' + nodeid).find('.continue')
    if (shortcontent_file.css("display") === "none") {
      continue_.css("display", "block");
      fullcontent_file.css("display", "none");
      shortcontent_file.css("display", "block");
    } else {
      continue_.css("display", "none");
      fullcontent_file.css("display", "block");
      shortcontent_file.css("display", "none");
    }
    let curr = $(event.target);

    if (curr.attr('class').indexOf('pi-chevron-right') != -1) {
      this.toggle_note_label = 'Thu g???n';
      curr.removeClass('pi-chevron-right');
      curr.addClass('pi-chevron-down');
    } else {
      this.toggle_note_label = 'M??? r???ng';
      curr.removeClass('pi-chevron-down');
      curr.addClass('pi-chevron-right');
    }
  }
  /*End */

  /*Ki???m tra noteText > 250 k?? t??? ho???c noteDocument > 3 th?? ???n ??i m???t ph???n n???i dung*/
  tooLong(note): boolean {
    if (note.noteDocList.length > 3) return true;
    var des = $.parseHTML(note.description);
    var count = 0;
    for (var i = 0; i < des.length; i++) {
      count += des[i].textContent.length;
      if (count > 250) return true;
    }
    return false;
  }

  openItem(name, url) {
    this.imageService.downloadFile(name, url).subscribe(response => {
      var result = <any>response;
      var binaryString = atob(result.fileAsBase64);
      var fileType = result.fileType;

      var binaryLen = binaryString.length;
      var bytes = new Uint8Array(binaryLen);
      for (var idx = 0; idx < binaryLen; idx++) {
        var ascii = binaryString.charCodeAt(idx);
        bytes[idx] = ascii;
      }
      var file = new Blob([bytes], { type: fileType });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file);
      } else {
        var fileURL = URL.createObjectURL(file);
        if (fileType.indexOf('image') !== -1) {
          window.open(fileURL);
        } else {
          var anchor = document.createElement("a");
          anchor.download = name;
          anchor.href = fileURL;
          anchor.click();
        }
      }
    }, error => { });
  }

  /*Event S????a ghi chu??*/
  onClickEditNote(noteId: string, noteDes: string) {
    this.noteContent = noteDes;
    this.noteId = noteId;
    this.listUpdateNoteDocument = this.noteHistory.find(x => x.noteId == this.noteId).noteDocList;
    this.isEditNote = true;
  }
  /*End*/

  /*Event X??a ghi ch??*/
  onClickDeleteNote(noteId: string) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a ghi ch?? n??y?',
      accept: () => {
        this.loading = true;
        this.noteService.disableNote(noteId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            let note = this.noteHistory.find(x => x.noteId == noteId);
            let index = this.noteHistory.lastIndexOf(note);
            this.noteHistory.splice(index, 1);

            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a ghi ch?? th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }
  /*End*/

  /*Event khi x??a 1 file ???? l??u tr??n server*/
  deleteFile(file: NoteDocument) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        let index = this.listUpdateNoteDocument.indexOf(file);
        this.listUpdateNoteDocument.splice(index, 1);
      }
    });
  }

  /*Event khi download 1 file ???? l??u tr??n server*/
  downloadFile(fileInfor: NoteDocument) {
    this.imageService.downloadFile(fileInfor.documentName, fileInfor.documentUrl).subscribe(response => {
      var result = <any>response;
      var binaryString = atob(result.fileAsBase64);
      var fileType = result.fileType;

      var binaryLen = binaryString.length;
      var bytes = new Uint8Array(binaryLen);
      for (var idx = 0; idx < binaryLen; idx++) {
        var ascii = binaryString.charCodeAt(idx);
        bytes[idx] = ascii;
      }
      var file = new Blob([bytes], { type: fileType });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file);
      } else {
        var fileURL = URL.createObjectURL(file);
        if (fileType.indexOf('image') !== -1) {
          window.open(fileURL);
        } else {
          var anchor: any = document.createElement("a");
          anchor.download = name;
          anchor.href = fileURL;
          anchor.click();
        }
      }
    });
  }

  sendApprovalCustomer() {
    this.customerService.sendApprovalCustomer(this.customerModel.CustomerId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.getMasterData();
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'G???i ph?? duy???t th??nh c??ng' };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*L??u th??ng tin kh??ch h??ng*/
  async saveCustomer() {
    let isValid = this.checkValidator();

    if (!this.validEmailCustomer || !this.validPhoneCustomer) {
      this.showMessageErr();
    }
    else if (isValid) {
      /*Form chung*/

      let fullName = '';
      let firstName = this.cusFirstNameControl.value != null ? this.cusFirstNameControl.value.trim() : "";
      let lastName = this.cusLastNameControl.value != null ? this.cusLastNameControl.value.trim() : "";
      fullName = (firstName + " " + lastName).trim();

      this.customerModel.CustomerName = fullName;
      this.customerModel.CustomerCode = this.cusCodeControl.value != null ? this.cusCodeControl.value.trim() : "";

      this.contactModel.FirstName = firstName;
      this.contactModel.LastName = lastName;

      if (this.cusGroupControl.value) {
        let group: Category = this.cusGroupControl.value;
        this.customerModel.CustomerGroupId = group.categoryId;
      }

      if (this.cusStatusControl.value) {
        let status: Category = this.cusStatusControl.value;
        this.customerModel.StatusId = status.categoryId;
      }

      if (this.cusStatusCareControl.value) {
        let status: Category = this.cusStatusCareControl.value;
        this.customerModel.StatusCareId = status.categoryId;
      }

      if (this.cusPersonInChargeControl.value) {
        let personInCharge: Employee = this.cusPersonInChargeControl.value;
        this.customerModel.PersonInChargeId = personInCharge.employeeId;
      }
      /*End Form chung*/

      if (this.customerModel.CustomerType == 1) {
        /*Kh??ch h??ng doanh nghi???p*/

        this.contactModel.Phone = this.cusPhoneControl.value;

        if (this.cusBusinessTypeControl.value) {
          let field: Category = this.cusBusinessTypeControl.value;
          this.customerModel.FieldId = field.categoryId;
        } else {
          this.customerModel.FieldId = null;
        }

        this.contactModel.TaxCode = this.cusTaxControl.value != null ? this.cusTaxControl.value.trim() : null;

        this.contactModel.Email = this.cusEmailControl.value.trim();

        if (this.cusBusinessSizeControl.value) {
          let businessScale: Category = this.cusBusinessSizeControl.value;
          this.customerModel.BusinessScale = businessScale.categoryId;
        } else {
          this.customerModel.BusinessScale = null;
        }

        if (this.cusPaymentMethodControl.value) {
          let payment: Category = this.cusPaymentMethodControl.value;
          this.customerModel.PaymentId = payment.categoryId;
        } else {
          this.customerModel.PaymentId = null;
        }

        this.customerModel.MaximumDebtDays = this.cusMaxDebtDayControl.value != null ? parseFloat(this.cusMaxDebtDayControl.value.replace(/,/g, '')) : 0;
        this.customerModel.MaximumDebtValue = this.cusMaxDebtValueControl.value != null ? parseFloat(this.cusMaxDebtValueControl.value.replace(/,/g, '')) : 0;

        this.contactModel.WebsiteUrl = this.cusLinkControl.value != null ? this.cusLinkControl.value.trim() : null;

        if (this.cusTypeOfBusinessControl.value) {
          let enterpriseType: Category = this.cusTypeOfBusinessControl.value;
          this.customerModel.EnterpriseType = enterpriseType.categoryId;
        } else {
          this.customerModel.EnterpriseType = null;
        }

        this.customerModel.TotalEmployeeParticipateSocialInsurance = this.cusTotalEmpSocialInsuranceControl.value != null ? parseFloat(this.cusTotalEmpSocialInsuranceControl.value.replace(/,/g, '')) : 0;

        if (this.cusCareStaffControl.value) {
          let careStaff: Employee = this.cusCareStaffControl.value;
          this.customerModel.CustomerCareStaff = careStaff.employeeId;
        } else {
          this.customerModel.CustomerCareStaff = null;
        }

        if (this.cusBusinessRegistrationDateControl.value) {
          this.customerModel.BusinessRegistrationDate = convertToUTCTime(this.cusBusinessRegistrationDateControl.value);
        } else {
          this.customerModel.BusinessRegistrationDate = null;
        }

        this.customerModel.TotalCapital = this.cusTotalCapitalControl.value != null ?
          parseFloat(this.cusTotalCapitalControl.value.replace(/,/g, '')) : null;

        this.customerModel.TotalRevenueLastYear = this.cusTotalRevenueLastYearControl.value != null ?
          parseFloat(this.cusTotalRevenueLastYearControl.value.replace(/,/g, '')) : null;

        if (this.cusMainBusinessSectorControl.value) {
          let MainBusinessSector: Category = this.cusMainBusinessSectorControl.value;
          this.customerModel.MainBusinessSector = MainBusinessSector.categoryId;
        } else {
          this.customerModel.MainBusinessSector = null;
        }

        if (this.cusLocalTypeBusinessControl.value) {
          let businessType: Category = this.cusLocalTypeBusinessControl.value;
          this.customerModel.BusinessType = businessType.categoryId;
        } else {
          this.customerModel.BusinessType = null;
        }

        if (this.cusAreaControl.value) {
          let area: Area = this.cusAreaControl.value;
          this.contactModel.AreaId = area.areaId;
        } else {
          this.contactModel.AreaId = null;
        }

        if (this.cusProvinceControl.value) {
          let province: Province = this.cusProvinceControl.value;
          this.contactModel.ProvinceId = province.provinceId;
        } else {
          this.contactModel.ProvinceId = null;
        }

        if (this.cusDistrictControl.value) {
          let district: District = this.cusDistrictControl.value;
          this.contactModel.DistrictId = district.districtId;
        } else {
          this.contactModel.DistrictId = null;
        }

        if (this.cusWardControl.value) {
          let Ward: Ward = this.cusWardControl.value;
          this.contactModel.WardId = Ward.wardId;
        } else {
          this.contactModel.WardId = null;
        }

        this.contactModel.Address = this.cusAddressControl.value != null ?
          this.cusAddressControl.value.trim() : "";

      } else {
        /*Kh??ch h??ng c?? nh??n*/
        this.saveContact();

        if (this.cusPerGenderControl.value) {
          let gender = this.cusPerGenderControl.value.categoryCode;
          this.contactModel.Gender = gender;
        } else {
          this.contactModel.Gender = null;
        }

        if (this.cusPerCountryControl.value) {
          let country: Country = this.cusPerCountryControl.value;
          this.contactModel.CountryId = country.countryId;
        } else {
          this.contactModel.CountryId = null;
        }

        this.contactModel.TaxCode = this.cusPerTaxcodeControl.value != null ?
          this.cusPerTaxcodeControl.value.trim() : null;

        this.contactModel.DateOfBirth = this.cusPerBirthdayControl.value != null ?
          convertToUTCTime(this.cusPerBirthdayControl.value) : null;

        this.contactModel.IdentityID = this.cusPerIdentityControl.value != null ?
          this.cusPerIdentityControl.value.trim() : null;

        if (this.cusPerPaymentMethodControl.value) {
          let paymentMethod: Category = this.cusPerPaymentMethodControl.value;
          this.customerModel.PaymentId = paymentMethod.categoryId;
        } else {
          this.customerModel.PaymentId = null;
        }

        this.contactModel.Birthplace = this.cusPerBirthplaceControl.value != null ?
          this.cusPerBirthplaceControl.value.trim() : "";

        if (this.cusPerMaritalStatusControl.value) {
          let maritalStatus: Category = this.cusPerMaritalStatusControl.value;
          this.contactModel.MaritalStatusId = maritalStatus.categoryId;
        } else {
          this.contactModel.MaritalStatusId = null;
        }

        this.customerModel.MaximumDebtDays = this.cusPerMaxDebtDayControl.value != null ?
          parseFloat(this.cusPerMaxDebtDayControl.value.replace(/,/g, '')) : 0;
        this.customerModel.MaximumDebtValue = this.cusPerMaxDebtValueControl.value != null ?
          parseFloat(this.cusPerMaxDebtValueControl.value.replace(/,/g, '')) : 0;

        this.contactModel.Job = this.cusPerJobControl.value != null ?
          this.cusPerJobControl.value.trim() : "";

        this.contactModel.Agency = this.cusPerAgencyControl.value != null ?
          this.cusPerAgencyControl.value.trim() : "";

        if (this.cusPerCareStaffControl.value) {
          let careStaff: Employee = this.cusPerCareStaffControl.value;
          this.customerModel.CustomerCareStaff = careStaff.employeeId;
        } else {
          this.customerModel.CustomerCareStaff = null;
        }

        this.contactModel.CompanyName = this.cusPerCompanyNameControl.value != null ?
          this.cusPerCompanyNameControl.value.trim() : "";

        this.contactModel.CompanyAddress = this.cusPerCompanyAddressControl.value != null ?
          this.cusPerCompanyAddressControl.value.trim() : "";

        if (this.cusPerPositionControl.value) {
          let customerPosition: Category = this.cusPerPositionControl.value;
          this.contactModel.CustomerPosition = customerPosition.categoryId;
        } else {
          this.contactModel.CustomerPosition = null;
        }
      }

      this.loading = true;
      //c???p nh???t google map
      await this.getCustomerGeoCoding();
      let lat = this.overlays.length > 0 ? this.overlays[0].position.lat() : null;
      let lng = this.overlays.length > 0 ? this.overlays[0].position.lng() : null;
      this.contactModel.Longitude = lng;
      this.contactModel.Latitude = lat;
      this.customerModel.KhachDuAn = this.khachDuAn;

      this.customerService.updateCustomerById(this.customerModel, this.contactModel).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: "C???p nh???p kh??ch h??ng th??nh c??ng" };
          this.showMessage(msg);
          //send email after edit
          let sendMailModel: SendEmailModel = result.sendEmailEntityModel;
          this.emailConfigService.sendEmail(6, sendMailModel).subscribe(reponse => { });
          this.isEdit = false;
          this.getMasterData();
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  /*C???p nh???t li??n h??? KHCN*/
  async saveContact() {
    if (!this.customerPersonalContactForm.valid) {
      Object.keys(this.customerPersonalContactForm.controls).forEach(key => {
        if (this.customerPersonalContactForm.controls[key].valid == false) {
          this.customerPersonalContactForm.controls[key].markAsTouched();
        }
      });
    } else {
      let contact: PersonalCustomerContact = {
        ContactId: this.contactModel.ContactId,
        Email: this.contactModel.Email,
        WorkEmail: this.contactModel.WorkEmail,
        OtherEmail: this.contactModel.OtherEmail,
        Phone: this.contactModel.Phone,
        WorkPhone: this.contactModel.WorkPhone,
        OtherPhone: this.contactModel.OtherPhone,
        AreaId: this.contactModel.AreaId,
        ProvinceId: this.contactModel.ProvinceId,
        DistrictId: this.contactModel.DistrictId,
        WardId: this.contactModel.WardId,
        Address: this.contactModel.Address,
        Other: this.contactModel.Other,
        Latitude: null,
        Longitude: null,
      };

      if (this.cusPerContPhoneControl.value) {
        contact.Phone = this.cusPerContPhoneControl.value.trim();
      } else {
        contact.Phone = null;
      }

      if (this.cusPerContWorkPhoneControl.value) {
        contact.WorkPhone = this.cusPerContWorkPhoneControl.value.trim();
      } else {
        contact.WorkPhone = null;
      }

      if (this.cusPerContOtherPhoneControl.value) {
        contact.OtherPhone = this.cusPerContOtherPhoneControl.value.trim();
      } else {
        contact.OtherPhone = null;
      }

      if (this.cusPerContEmailControl.value) {
        contact.Email = this.cusPerContEmailControl.value.trim();
      } else {
        contact.Email = null;
      }

      if (this.cusPerContWorkEmailControl.value) {
        contact.WorkEmail = this.cusPerContWorkEmailControl.value.trim();
      } else {
        contact.WorkEmail = null;
      }

      if (this.cusPerContOtherEmailControl.value) {
        contact.OtherEmail = this.cusPerContOtherEmailControl.value.trim();
      } else {
        contact.OtherEmail = null;
      }

      let toSelectedArea: Area = this.cusPerContAreaControl.value;
      if (toSelectedArea) {
        contact.AreaId = toSelectedArea.areaId;
      } else {
        contact.AreaId = null;
      }

      let toSelectedProvince: Province = this.cusPerContProvinceControl.value;
      if (toSelectedProvince) {
        contact.ProvinceId = toSelectedProvince.provinceId;
      } else {
        contact.ProvinceId = null;
      }

      let toSelectedDistrict: District = this.cusPerContDistrictControl.value;
      if (toSelectedDistrict) {
        contact.DistrictId = toSelectedDistrict.districtId;
      } else {
        contact.DistrictId = null;
      }

      let toSelectedWard: Ward = this.cusPerContWardControl.value;
      if (toSelectedWard) {
        contact.WardId = toSelectedWard.wardId;
      } else {
        contact.WardId = null;
      }

      if (this.cusPerContAddressControl.value) {
        contact.Address = this.cusPerContAddressControl.value.trim();
      } else {
        contact.Address = null;
      }

      if (this.cusPerContOtherControl.value) {
        contact.Other = this.cusPerContOtherControl.value.trim();
      } else {
        contact.Other = null;
      }

      //n???i ?????a ch??? kh??ch h??ng c?? nh??n
      let AreaCusPer: Area = this.cusPerContAreaControl.value;
      let proviceCusPer: Province = this.cusPerContProvinceControl.value;
      let districtCusPer: District = this.cusPerContDistrictControl.value;
      let wardCusPer: Ward = this.cusPerContWardControl.value;
      let detailAddressCusPer = this.cusPerContAddressControl.value;
      let proviceCusPerName = proviceCusPer ? proviceCusPer.provinceName : "";
      let districtCusPerName = districtCusPer ? districtCusPer.districtName : "";
      let wardCusPerName = wardCusPer ? wardCusPer.wardName : "";
      let address = `${detailAddressCusPer},${wardCusPerName},${districtCusPerName},${proviceCusPerName}`;

      this.loading = true;
      await this.getCustomerGeoCodingUpdateContact(address, this.customerNameLabel);
      let lat = this.overlays.length > 0 ? this.overlays[0].position.lat() : null;
      let lng = this.overlays.length > 0 ? this.overlays[0].position.lng() : null;
      contact.Latitude = lat;
      contact.Longitude = lng;

      this.contactService.updatePersonalCustomerContact(contact).subscribe(response => {
        this.loading = false;
        let result: any = response;

        if (result.statusCode == 200) {
          this.contactModel.Phone = contact.Phone; //G??n l???i ????? trong Tab Ti???n tr??nh CSKH -> G???i SMS l???y ???????c s??? ??i???n tho???i m???i
          this.contactModel.Email = contact.Email; //G??n l???i ????? trong Tab Ti???n tr??nh CSKH -> G???i Email l???y ???????c email m???i
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t th??nh c??ng' };
          this.showMessage(msg);
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  removeCustomerMeeting(week: CustomerMeetingForWeek) {
    if (week) {
      this.confirmationService.confirm({
        message: 'B???n c?? ch???c ch???n mu???n x??a l???ch h???n?',
        accept: () => {
          this.loading = true;
          this.customerCareService.removeCustomerMeeting(week.customerMeetingId, this.auth.UserId).subscribe(response => {
            this.loading = false;
            let result = <any>response;
            if (result.statusCode === 200) {
              this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
              let mgs = { severity: 'success', summary: 'Th??ng b??o', detail: 'X??a l???ch h???n th??nh c??ng' };
              this.showMessage(mgs);
            } else {
              let mgs = { severity: 'error', summary: 'Th??ng b??o', detail: 'X??a l???ch h???n th???t b???i' };
              this.showMessage(mgs);
            }
          }, error => { this.loading = false; });
        }
      });
    }
  }

  checkValidator(): boolean {
    let result: boolean = true;

    if (this.customerModel.CustomerType == 1) {
      if (!this.customerInforForm.valid) {
        Object.keys(this.customerInforForm.controls).forEach(key => {
          if (this.customerInforForm.controls[key].valid == false) {
            this.customerInforForm.controls[key].markAsTouched();
          }
        });
        this.listSelect = [true, false, false, false, false, false, false]
        result = false;
      }
    } else {
      if (!this.customerBaseForm.valid) {
        Object.keys(this.customerBaseForm.controls).forEach(key => {
          if (this.customerBaseForm.controls[key].valid == false) {
            this.customerBaseForm.controls[key].markAsTouched();
          }
        });

        result = false;
      }

      if (!this.customerPersonalInforForm.valid) {
        Object.keys(this.customerPersonalInforForm.controls).forEach(key => {
          if (this.customerPersonalInforForm.controls[key].valid == false) {
            this.customerPersonalInforForm.controls[key].markAsTouched();
          }
        });
        this.listSelect = [true, false, false, false, false, false, false, false]
        result = false;
      }

      if (!this.customerPersonalContactForm.valid) {
        Object.keys(this.customerPersonalContactForm.controls).forEach(key => {
          if (this.customerPersonalContactForm.controls[key].valid == false) {
            this.customerPersonalContactForm.controls[key].markAsTouched();
          }
        });
        this.listSelect = [false, true, false, false, false, false, false, false]
        result = false;
      }
    }

    return result;
  }

  del_customer() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a kh??ch h??ng n??y?',
      accept: () => {
        this.customerService.changeCustomerStatusToDelete(this.customerId, this.auth.UserId).subscribe(response => {
          let result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.router.navigate(['/customer/list']);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }

  /*Th??m b??? c??u h???i t??? db*/
  AddQAList() {
    this.loading = true;
    this.customerService.createListQuestion(this.customerId, this.auth.UserId).subscribe(response => {
      let result = <any>response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listCustomerAdditionalInformation = result.listCustomerAdditionalInformation;
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o m???i th??nh c??ng' };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*T???o m???t b??? c??u h???i/c??u tr??? l???i m???i ??? tab Th??ng tin kh??c*/
  createAddition() {
    let ref = this.dialogService.open(AddQuestionAnswerDialogComponent, {
      data: {
        customerAdditionalInformationId: null,
        customerId: this.customerId
      },
      header: 'Th??m th??ng tin',
      width: '450px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.listCustomerAdditionalInformation = result.listCustomerAdditionalInformation;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o m???i th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  /*S???a c??u h???i/c??u tr??? l???i ??? tab Th??ng tin kh??c*/
  editAddition(rowData: CustomerAdditionalInformation) {
    let ref = this.dialogService.open(AddQuestionAnswerDialogComponent, {
      data: {
        customerAdditionalInformationId: rowData.customerAdditionalInformationId,
        customerId: this.customerId,
        question: rowData.question,
        answer: rowData.answer
      },
      header: 'C???p nh???t th??ng tin',
      width: '450px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.listCustomerAdditionalInformation = result.listCustomerAdditionalInformation;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  /*X??a c??u h???i/c??u tr??? l???i ??? tab Th??ng tin kh??c*/
  deleteAddition(rowData: CustomerAdditionalInformation) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a th??ng tin n??y?',
      accept: () => {
        this.customerService.deleteCustomerAdditional(rowData.customerAdditionalInformationId, rowData.customerId, this.auth.UserId).subscribe(response => {
          let result = <any>response;
          if (result.statusCode == 200) {
            this.listCustomerAdditionalInformation = result.listCustomerAdditionalInformation;
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }

  /*X??a list c??u h???i/c??u tr??? l???i ???????c ch???n ??? tab Th??ng tin kh??c*/
  deleteSelectedQAList() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a c??c th??ng tin ???????c ch???n n??y?',
      accept: () => {
        let listCusAddInfId = this.listSelectedCusAddInf.map(x => x.customerAdditionalInformationId);
        this.customerService.deleteListCustomerAdditional(listCusAddInfId, this.customerId).subscribe(response => {
          let result = <any>response;
          if (result.statusCode == 200) {
            this.listSelectedCusAddInf.length = 0;
            this.listCustomerAdditionalInformation = result.listCustomerAdditionalInformation;
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }

  /*Th??m ng?????i li??n h??? KHDN*/
  AddCusContact() {
    let cusContact: OtherContact = {
      contactId: null,
      objectId: this.customerId,
      objectType: "CUS_CON",
      firstName: null,
      lastName: null,
      contactName: null,
      gender: null,
      genderName: null,
      dateOfBirth: null,
      address: null,
      email: null,
      other: null,
      phone: null,
      role: null,
      provinceId: null,
      districtId: null,
      wardId: null
    };

    let ref = this.dialogService.open(ContactpopupComponent, {
      data: {
        contact: cusContact,
      },
      header: 'Th??m li??n h???',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.listCusContact = result.listContact;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o m???i th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  /*S???a ng?????i li??n h??? KHDN*/
  editCusContact(rowData: OtherContact) {
    let cusContact: OtherContact = {
      contactId: rowData.contactId,
      objectId: this.customerId,
      objectType: "CUS_CON",
      firstName: rowData.firstName,
      lastName: rowData.lastName,
      contactName: rowData.contactName,
      gender: rowData.gender,
      genderName: rowData.genderName,
      dateOfBirth: rowData.dateOfBirth,
      address: rowData.address,
      email: rowData.email,
      other: rowData.other,
      phone: rowData.phone,
      role: rowData.role,
      provinceId: rowData.provinceId,
      districtId: rowData.districtId,
      wardId: rowData.wardId
    };

    let ref = this.dialogService.open(ContactpopupComponent, {
      data: {
        contact: cusContact,
      },
      header: 'C???p nh???t li??n h???',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.listCusContact = result.listContact;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  /*X??a ng?????i li??n h??? KHDN*/
  deleteCusContact(rowData: OtherContact) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a li??n h??? n??y?',
      accept: () => {
        this.contactService.deleteContactById(rowData.contactId, rowData.objectId, rowData.objectType)
          .subscribe(response => {
            let result: any = response;

            if (result.statusCode == 200) {
              this.listCusContact = result.listContact;
              let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a th??nh c??ng' };
              this.showMessage(msg);
            } else {
              let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
              this.showMessage(msg);
            }
          });
      }
    });
  }

  /*Event thay ?????i T???nh/Th??nh ph??? c???a KHCN*/
  async changeCusPerProvince() {
    let toSelectedProvince: Province = this.cusPerContProvinceControl.value;
    this.cusPerContDistrictControl.setValue(null);
    this.cusPerContWardControl.setValue(null);
    if (toSelectedProvince) {
      this.loading = true;
      let result: any = await this.districtService.getAllDistrictByProvinceIdAsync(toSelectedProvince.provinceId);
      this.loading = false;
      if (result.statusCode === 200) {
        this.listCurrentDistrict = result.listDistrict;
      }
    } else {
      this.listCurrentDistrict = [];
      this.listCurrentWard = [];
    }
  }

  /*Event thay ?????i Qu???n/Huy???n c???a KHCN*/
  async changeCusPerDistrict() {
    let toSelectedDistrict: District = this.cusPerContDistrictControl.value;
    this.cusPerContWardControl.setValue(null);
    if (toSelectedDistrict) {
      this.loading = true;
      let result: any = await this.wardService.getAllWardByDistrictIdAsync(toSelectedDistrict.districtId);
      this.loading = false;
      if (result.statusCode === 200) {
        this.listCurrentWard = result.listWard;
      }
    } else {
      this.listCurrentWard = [];
    }
  }

  changeCustomerName() {
    let firstName = this.cusFirstNameControl.value != null ? this.cusFirstNameControl.value.trim() : "";
    let lastName = this.cusLastNameControl.value != null ? this.cusLastNameControl.value.trim() : "";
    this.customerNameLabel = (firstName + " " + lastName).trim();
  }

  /*Event Th??m t??i kho???n thanh to??n*/
  AddBankAccount() {
    let bankAccount: BankAccount = {
      bankAccountId: null,
      objectId: this.customerId,
      objectType: "CUS",
      bankName: "", //T??n ng??n h??ng
      accountNumber: "",  //S??? t??i kho???n
      accountName: "",  //Ch??? t??i kho???n
      branchName: "", //Chi nh??nh
      bankDetail: "",  //Di???n gi???i
      createdById: this.emptyGuid,
      createdDate: new Date()
    };

    let ref = this.dialogService.open(BankpopupComponent, {
      data: {
        bankAccount: bankAccount,
      },
      header: 'Th??m th??ng tin thanh to??n',
      width: '55%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.listBankAccount = result.listBankAccount;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o m???i th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  /*Event S???a t??i kho???n thanh to??n*/
  editBankAccount(rowData: BankAccount) {
    let bankAccount: BankAccount = {
      bankAccountId: rowData.bankAccountId,
      objectId: this.customerId,
      objectType: rowData.objectType,
      bankName: rowData.bankName, //T??n ng??n h??ng
      accountNumber: rowData.accountNumber,  //S??? t??i kho???n
      accountName: rowData.accountName,  //Ch??? t??i kho???n
      branchName: rowData.bankName, //Chi nh??nh
      bankDetail: rowData.bankDetail,  //Di???n gi???i
      createdById: rowData.createdById,
      createdDate: rowData.createdDate
    };

    let ref = this.dialogService.open(BankpopupComponent, {
      data: {
        bankAccount: bankAccount,
      },
      header: 'C???p nh???t th??ng tin thanh to??n',
      width: '55%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.listBankAccount = result.listBankAccount;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  /*Event X??a t??i kho???n thanh to??n*/
  deleteBankAccount(rowData: BankAccount) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a th??ng tin thanh to??n n??y?',
      accept: () => {
        this.bankService.deleteBankById(rowData.bankAccountId, rowData.objectId, rowData.objectType)
          .subscribe(response => {
            let result: any = response;

            if (result.statusCode == 200) {
              this.listBankAccount = result.listBankAccount;
              let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a th??nh c??ng' };
              this.showMessage(msg);
            } else {
              let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
              this.showMessage(msg);
            }
          });
      }
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }


  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  goToOrderDetail(orderId) {
    this.router.navigate(['/order/order-detail', { customerOrderID: orderId }]);
  }

  /*Ch???n th??ng tr?????c*/
  preMonth() {
    this.isExist = false;
    //Chuy???n th??ng t??? string -> number
    let current_month = parseFloat(this.month);

    if (current_month != 1) {
      //N???u kh??ng ph???i th??ng 1 th?? tr??? ??i 1
      current_month = current_month - 1;
    } else {
      //N???u l?? th??ng th?? chuy???n th??nh th??ng 12
      current_month = 12;
      //Gi???m n??m ??i 1
      this.year = this.year - 1;
      this.yearMeeting = this.yearMeeting - 1;
    }
    //Chuy???n l???i th??nh string
    this.month = current_month.toString().length == 1 ? ('0' + current_month.toString()) : current_month.toString();
    this.monthMeeting = current_month.toString().length == 1 ? ('0' + current_month.toString()) : current_month.toString();

    //L???y l???i c??c ng??y trong th??ng
    this.getDateByTime(parseFloat(this.month), this.year, 'cus_care');
    this.getDateByTime(parseFloat(this.monthMeeting), this.yearMeeting, 'cus_meeting');

    //L???y d??? li???u
    this.getHistoryCustomerCare(parseFloat(this.month), this.year);
    this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
  }

  /*Ch???n th??ng ti???p theo*/
  nextMonth() {
    //Chuy???n th??ng t??? string -> number
    let current_month = parseFloat(this.month);
    // Ki???m tra n???u l?? th??ng hi???n t???i v?? n??m hi???n t???i th?? kh??ng next ti???p
    // if (current_month != ((new Date).getMonth() + 1) || this.year != (new Date).getFullYear()) {
    // }

    this.isExist = false;
    if (current_month != 12) {
      //N???u kh??ng ph???i th??ng 12 th?? c???ng th??m 1
      current_month = current_month + 1;
    } else {
      //N???u l?? th??ng 12 th?? chuy???n th??nh th??ng 1
      current_month = 1;
      //T??ng n??m th??m 1
      this.year = this.year + 1;
      this.yearMeeting = this.yearMeeting + 1;
    }
    //Chuy???n l???i th??nh string
    this.month = current_month.toString().length == 1 ? ('0' + current_month.toString()) : current_month.toString();
    this.monthMeeting = current_month.toString().length == 1 ? ('0' + current_month.toString()) : current_month.toString();

    //L???y l???i c??c ng??y trong th??ng
    this.getDateByTime(parseFloat(this.month), this.year, 'cus_care');
    this.getDateByTime(parseFloat(this.monthMeeting), this.yearMeeting, 'cus_meeting');

    //L???y d??? li???u
    this.getHistoryCustomerCare(parseFloat(this.month), this.year);
    this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
  }

  getHistoryCustomerCare(month: number, year: number) {
    this.loading = true;
    this.customerService.getHistoryCustomerCare(month, year, this.customerId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listCustomerCareInfor = result.listCustomerCareInfor;
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  send_quick_email() {
    let ref = this.dialogService.open(TemplateQuickEmailComponent, {
      data: {
        sendTo: this.contactModel.Email,
        customerId: this.customerId
      },
      header: 'G???i Email',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "800px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.month = ((new Date).getMonth() + 1).toString();
          this.year = (new Date).getFullYear();
          this.getHistoryCustomerCare((new Date).getMonth() + 1, this.year);

          let listInvalidEmail: Array<string> = result.listInvalidEmail;
          let message = `G???i email th??nh c??ng. C?? <strong>${listInvalidEmail.length} email</strong> kh??ng h???p l???:<br/>`
          listInvalidEmail.forEach(item => {
            message += `<div style="padding-left: 30px;"> -<strong>${item}</strong></div>`
          })

          if (listInvalidEmail.length > 0) {
            this.confirmationService.confirm({
              message: message,
              rejectVisible: false,
            });
          }

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
          this.showMessage(msg);
        }
      }
    });
  }

  send_quick_sms() {
    let ref = this.dialogService.open(TemplateQuickSmsComponent, {
      data: {
        sendTo: this.contactModel.Phone,
        customerId: this.customerId
      },
      header: 'G???i SMS',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.month = ((new Date).getMonth() + 1).toString();
          this.year = (new Date).getFullYear();
          this.getHistoryCustomerCare((new Date).getMonth() + 1, this.year);

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'G???i SMS th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  send_quick_gift() {
    let ref = this.dialogService.open(TemplateQuickGiftComponent, {
      data: {
        customerType: this.customerModel.CustomerType,
        customerId: this.customerId
      },
      header: 'T???ng qu??',
      width: '700px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "300px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.month = ((new Date).getMonth() + 1).toString();
          this.year = (new Date).getFullYear();
          this.getHistoryCustomerCare((new Date).getMonth() + 1, this.year);

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o Ch????ng tr??nh CSKH th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  showPreview(week: CustomerCareForWeek) {
    switch (week.type) {
      case 1:
        this.loading = true;
        this.customerService.getDataPreviewCustomerCare('SMS', this.customerId, week.customerCareId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            this.previewCustomerCare.effecttiveFromDate = result.effecttiveFromDate;
            this.previewCustomerCare.effecttiveToDate = result.effecttiveToDate;
            this.previewCustomerCare.sendDate = result.sendDate;
            this.previewCustomerCare.statusName = result.statusName;
            this.previewCustomerCare.previewSmsContent = result.previewSmsContent;
            this.previewSMS = true; //M??? popup
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
        break;

      case 2:
        // this.loading = true;
        // this.customerService.getDataPreviewCustomerCare('Email', this.customerId, week.customerCareId).subscribe(response => {
        //   let result: any = response;
        //   this.loading = false;

        //   if (result.statusCode == 200) {
        //     this.previewCustomerCare.effecttiveFromDate = result.effecttiveFromDate;
        //     this.previewCustomerCare.effecttiveToDate = result.effecttiveToDate;
        //     this.previewCustomerCare.sendDate = result.sendDate;
        //     this.previewCustomerCare.statusName = result.statusName;
        //     this.previewCustomerCare.previewEmailTitle = result.previewEmailTitle;
        //     this.previewCustomerCare.previewEmailContent = result.previewEmailContent;
        //     this.previewEmail = true; //M??? popup
        //   } else {
        //     let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        //     this.showMessage(msg);
        //   }
        // });
        let ref = this.dialogService.open(TemplatePreviewEmailComponent, {
          data: {
            customerCareId: week.customerCareId,
            customerId: this.customerId
          },
          header: 'Email',
          width: '900px',
          baseZIndex: 1030,
          contentStyle: {
            "min-height": "200px",
            "max-height": "900px",
            "overflow": "auto"
          }
        });
        break;

      case 3:
        this.loading = true;
        this.customerCareFeedBack.customerCareId = week.customerCareId;
        this.customerService.getDataCustomerCareFeedBack(week.customerCareId, this.customerId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            this.dataDialogCustomerFeedBack.name = result.name;
            this.dataDialogCustomerFeedBack.fromDate = result.fromDate;
            this.dataDialogCustomerFeedBack.toDate = result.toDate;
            this.dataDialogCustomerFeedBack.typeName = result.typeName;
            this.dataDialogCustomerFeedBack.feedBackCode = result.feedBackCode;
            this.dataDialogCustomerFeedBack.feedbackContent = result.feedBackContent;
            this.listFeedBackCode = result.listFeedBackCode;

            let toSelectedFeedBackCode = this.listFeedBackCode.find(x => x.categoryId == result.feedBackCode);
            if (toSelectedFeedBackCode) {
              this.feedbackCodeControl.setValue(toSelectedFeedBackCode);
            }

            this.feedbackContentControl.setValue(result.feedBackContent);

            this.feedback = true; //M??? popup
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
        break;

      case 4:
        this.loading = true;
        this.customerCareFeedBack.customerCareId = week.customerCareId;
        this.customerService.getDataCustomerCareFeedBack(week.customerCareId, this.customerId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            this.dataDialogCustomerFeedBack.name = result.name;
            this.dataDialogCustomerFeedBack.fromDate = result.fromDate;
            this.dataDialogCustomerFeedBack.toDate = result.toDate;
            this.dataDialogCustomerFeedBack.typeName = result.typeName;
            this.dataDialogCustomerFeedBack.feedBackCode = result.feedBackCode;
            this.dataDialogCustomerFeedBack.feedbackContent = result.feedBackContent;
            this.listFeedBackCode = result.listFeedBackCode;

            let toSelectedFeedBackCode = this.listFeedBackCode.find(x => x.categoryId == result.feedBackCode);
            if (toSelectedFeedBackCode) {
              this.feedbackCodeControl.setValue(toSelectedFeedBackCode);
            }

            this.feedbackContentControl.setValue(result.feedBackContent);

            this.feedback = true; //M??? popup
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
        break;

      default:
        break;
    }
  }

  awaitSaveFeedBack: boolean = false;
  saveFeedBack() {
    if (!this.feedbackForm.valid) {
      Object.keys(this.feedbackForm.controls).forEach(key => {
        if (this.feedbackForm.controls[key].valid == false) {
          this.feedbackForm.controls[key].markAsTouched();
        }
      });
    } else {
      let feedBackCode: Category = this.feedbackCodeControl.value;
      this.customerCareFeedBack.feedBackCode = feedBackCode.categoryId;
      this.customerCareFeedBack.feedBackContent = this.feedbackContentControl.value;
      this.customerCareFeedBack.customerId = this.customerId;

      this.loading = true;
      this.awaitSaveFeedBack = true;
      this.customerService.saveCustomerCareFeedBack(this.customerCareFeedBack).subscribe(response => {
        let result1: any = response;

        if (result1.statusCode == 200) {
          let month = parseFloat(this.month);
          this.customerService.getHistoryCustomerCare(month, this.year, this.customerId).subscribe(response => {
            let result: any = response;
            this.loading = false;

            if (result.statusCode == 200) {
              this.listCustomerCareInfor = result.listCustomerCareInfor;
            } else {
              let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
              this.showMessage(msg);
            }
          });

          this.closeFeedBack();
        } else {
          this.loading = false;
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result1.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  closePreview(type: string) {
    switch (type) {
      case "Email":
        this.previewEmail = false;
        break;

      case "SMS":
        this.previewSMS = false;
        break;
    }

    this.previewCustomerCare = {
      effecttiveFromDate: new Date(),
      effecttiveToDate: new Date(),
      sendDate: new Date(),
      statusName: '',
      previewEmailName: '',
      previewEmailTitle: '',
      previewEmailContent: '',
      previewSmsContent: '',
      previewSmsPhone: '',
    };
  }

  closeFeedBack() {
    this.feedback = false;
    this.dataDialogCustomerFeedBack = {
      name: '',
      fromDate: new Date(),
      toDate: new Date(),
      typeName: '',
      feedBackCode: '',
      feedbackContent: ''
    };
    this.customerCareFeedBack = {
      customerCareFeedBackId: this.emptyGuid,
      feedBackFromDate: new Date(),
      feedBackToDate: new Date(),
      feedBackType: '',
      feedBackCode: '',
      feedBackContent: '',
      customerId: '',
      customerCareId: '',
    }
    this.feedbackForm.reset();
    this.feedbackCodeControl.reset();
    this.feedbackContentControl.reset();
    this.awaitSaveFeedBack = false;
  }

  customerCodePattern(event: any) {
    const pattern = /^[a-zA-Z0-9-]$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  /*Ch???n th??ng tr?????c*/
  preMonthMeeting() {
    //Chuy???n th??ng t??? string -> number
    let current_month = parseFloat(this.monthMeeting);

    if (current_month != 1) {
      //N???u kh??ng ph???i th??ng 1 th?? tr??? ??i 1
      current_month = current_month - 1;
    } else {
      //N???u l?? th??ng th?? chuy???n th??nh th??ng 12
      current_month = 12;
      //Gi???m n??m ??i 1
      this.yearMeeting = this.yearMeeting - 1;
    }
    //Chuy???n l???i th??nh string
    this.monthMeeting = current_month.toString().length == 1 ? ('0' + current_month.toString()) : current_month.toString();

    //L???y l???i c??c ng??y trong th??ng
    this.getDateByTime(parseFloat(this.monthMeeting), this.yearMeeting, 'cus_meeting');

    //L???y d??? li???u
    this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
  }

  /*Ch???n th??ng ti???p theo*/
  nextMonthMeeting() {
    //Chuy???n th??ng t??? string -> number
    let current_month = parseFloat(this.monthMeeting);

    if (current_month != 12) {
      //N???u kh??ng ph???i th??ng 12 th?? c???ng th??m 1
      current_month = current_month + 1;
    } else {
      //N???u l?? th??ng 12 th?? chuy???n th??nh th??ng 1
      current_month = 1;
      //T??ng n??m th??m 1
      this.yearMeeting = this.yearMeeting + 1;
    }
    //Chuy???n l???i th??nh string
    this.monthMeeting = current_month.toString().length == 1 ? ('0' + current_month.toString()) : current_month.toString();

    //L???y l???i c??c ng??y trong th??ng
    this.getDateByTime(parseFloat(this.monthMeeting), this.yearMeeting, 'cus_meeting');

    //L???y d??? li???u
    this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
  }

  getHistoryCustomerMeeting(month: number, year: number) {
    this.loading = true;
    this.customerService.getHistoryCustomerMeeting(month, year, this.customerId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.customerMeetingInfor = result.customerMeetingInfor;
        if (this.customerMeetingInfor.week1.length != 0 || this.customerMeetingInfor.week2.length != 0 || this.customerMeetingInfor.week3.length != 0
          || this.customerMeetingInfor.week4.length != 0 || this.customerMeetingInfor.week5.length != 0) {
          this.isExist = true;
        }
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  add_meeting() {
    let ref = this.dialogService.open(MeetingDialogComponent, {
      data: {
        customerId: this.customerId,
        customerMeetingId: null,
        listParticipants: this.listParticipants
      },
      header: 'T???o l???ch h???n',
      width: '800px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "300px",
        "max-height": "900px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o l???ch h???n th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  showPreviewMeeting(week: CustomerMeetingForWeek) {
    let ref = this.dialogService.open(MeetingDialogComponent, {
      data: {
        customerId: this.customerId,
        customerMeetingId: week.customerMeetingId,
        listParticipants: this.listParticipants
      },
      header: 'C???p nh???t l???ch h???n',
      width: '800px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "300px",
        "max-height": "900px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.getHistoryCustomerMeeting(parseFloat(this.monthMeeting), this.yearMeeting);
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t l???ch h???n th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  getDateByTime(month: number, year: number, mode: string) {
    switch (mode) {
      case 'cus_care':
        this.startDateWeek1 = new Date();
        this.startDateWeek1.setDate(1);
        this.startDateWeek1.setMonth(month - 1);
        this.startDateWeek1.setFullYear(year);
        let dateInMonth = this.getDateInMonth(this.startDateWeek1);
        this.endDateWeek1 = dateInMonth.endDateWeek1;
        this.startDateWeek2 = dateInMonth.startDateWeek2;
        this.endDateWeek2 = dateInMonth.endDateWeek2;
        this.startDateWeek3 = dateInMonth.startDateWeek3;
        this.endDateWeek3 = dateInMonth.endDateWeek3;
        this.startDateWeek4 = dateInMonth.startDateWeek4;
        this.endDateWeek4 = dateInMonth.endDateWeek4;
        this.startDateWeek5 = dateInMonth.startDateWeek5;
        this.endDateWeek5 = dateInMonth.endDateWeek5;
        break;
      case 'cus_meeting':
        this.startDateWeek1Meeting = new Date();
        this.startDateWeek1Meeting.setDate(1);
        this.startDateWeek1Meeting.setMonth(month - 1);
        this.startDateWeek1Meeting.setFullYear(year);
        let dateInMonthMeeting = this.getDateInMonth(this.startDateWeek1Meeting);
        this.endDateWeek1Meeting = dateInMonthMeeting.endDateWeek1;
        this.startDateWeek2Meeting = dateInMonthMeeting.startDateWeek2;
        this.endDateWeek2Meeting = dateInMonthMeeting.endDateWeek2;
        this.startDateWeek3Meeting = dateInMonthMeeting.startDateWeek3;
        this.endDateWeek3Meeting = dateInMonthMeeting.endDateWeek3;
        this.startDateWeek4Meeting = dateInMonthMeeting.startDateWeek4;
        this.endDateWeek4Meeting = dateInMonthMeeting.endDateWeek4;
        this.startDateWeek5Meeting = dateInMonthMeeting.startDateWeek5;
        this.endDateWeek5Meeting = dateInMonthMeeting.endDateWeek5;
        break;
    }
  }

  getDateInMonth(date: Date): DateInMonth {
    let result: Date = new Date();
    let day = date.getDay() + 1;  //Ng??y trong tu???n (Ch??? nh???t = 1)
    let dateInMonth: DateInMonth = {
      startDateWeek1: new Date(),
      endDateWeek1: new Date(),
      startDateWeek2: new Date(),
      endDateWeek2: new Date(),
      startDateWeek3: new Date(),
      endDateWeek3: new Date(),
      startDateWeek4: new Date(),
      endDateWeek4: new Date(),
      startDateWeek5: new Date(),
      endDateWeek5: new Date(),
    }

    switch (day) {
      case 1:
        result = date;
        break;
      case 2:
        let timeMore1 = 6 * 24 * 60 * 60 * 1000;
        result.setTime(date.getTime() + timeMore1);
        break;
      case 3:
        let timeMore2 = 5 * 24 * 60 * 60 * 1000;
        result.setTime(date.getTime() + timeMore2);
        break;
      case 4:
        let timeMore3 = 4 * 24 * 60 * 60 * 1000;
        result.setTime(date.getTime() + timeMore3);
        break;
      case 5:
        let timeMore4 = 3 * 24 * 60 * 60 * 1000;
        result.setTime(date.getTime() + timeMore4);
        break;
      case 6:
        let timeMore5 = 2 * 24 * 60 * 60 * 1000;
        result.setTime(date.getTime() + timeMore5);
        break;
      case 7:
        let timeMore6 = 1 * 24 * 60 * 60 * 1000;
        result.setTime(date.getTime() + timeMore6);
        break;
    }

    //T??nh ng??y ?????u tu???n th??? 2
    let last_date_week1_number = result.getDate();
    let first_date_week2_number = last_date_week1_number + 1;
    let temp1 = new Date(result);
    temp1.setDate(first_date_week2_number);
    dateInMonth.startDateWeek2 = temp1;
    //T??nh ng??y cu???i tu???n th??? 2
    let last_date_week2_number = first_date_week2_number + 6;
    let temp2 = new Date(dateInMonth.startDateWeek2);
    temp2.setDate(last_date_week2_number);
    dateInMonth.endDateWeek2 = temp2;

    //T??nh ng??y ?????u tu???n th??? 3
    let first_date_week3_number = last_date_week2_number + 1;
    let temp3 = new Date(dateInMonth.endDateWeek2);
    temp3.setDate(first_date_week3_number);
    dateInMonth.startDateWeek3 = temp3;
    //T??nh ng??y cu???i tu???n th??? 3
    let last_date_week3_number = first_date_week3_number + 6;
    let temp4 = new Date(dateInMonth.startDateWeek3);
    temp4.setDate(last_date_week3_number);
    dateInMonth.endDateWeek3 = temp4;

    //T??nh ng??y ?????u tu???n th??? 4
    let first_date_week4_number = last_date_week3_number + 1;
    let temp5 = new Date(dateInMonth.endDateWeek3);
    temp5.setDate(first_date_week4_number);
    dateInMonth.startDateWeek4 = temp5;
    //T??nh ng??y cu???i tu???n th??? 4
    let last_date_week4_number = first_date_week4_number + 6;
    let temp6 = new Date(dateInMonth.startDateWeek4);
    temp6.setDate(last_date_week4_number);
    dateInMonth.endDateWeek4 = temp6;

    //Ki???m tra xem ng??y cu???i c???a tu???n th??? 4 c?? ph???i ng??y cu???i c??ng c???a th??ng hay kh??ng?
    let current_month = result.getMonth();
    let current_year = result.getFullYear();
    let first_date_of_next_month = new Date();
    first_date_of_next_month.setDate(1);
    first_date_of_next_month.setMonth(current_month + 1);
    if (current_month == 11) {
      current_year = current_year + 1;
    }
    first_date_of_next_month.setFullYear(current_year);
    let last_date_of_month = new Date(first_date_of_next_month);
    let time_number = first_date_of_next_month.getTime();
    last_date_of_month.setTime(time_number - 24 * 60 * 60 * 1000);

    if (dateInMonth.endDateWeek4.getDate() != last_date_of_month.getDate()) {
      //Ng??y cu???i c???a tu???n th??? 4 kh??ng ph???i ng??y cu???i c???a th??ng n??n s??? c?? tu???n th??? 5
      //T??nh ng??y ?????u tu???n th??? 5
      let first_date_week5_number = last_date_week4_number + 1;
      let temp6 = new Date(dateInMonth.endDateWeek4);
      temp6.setDate(first_date_week5_number);
      dateInMonth.startDateWeek5 = temp6;
      //Ng??y cu???i tu???n th??? 5 ch???c ch???n l?? ng??y cu???i th??ng
      dateInMonth.endDateWeek5 = last_date_of_month;
    } else {
      dateInMonth.startDateWeek5 = null;
      dateInMonth.endDateWeek5 = null;
    }

    dateInMonth.endDateWeek1 = result;

    return dateInMonth;
  }

  patchGeoCodingForMap(lat: number, long: number, customerName: string) {
    if (!lat && !long) return;
    this.overlays = [
      new google.maps.Marker({ position: { lat: lat, lng: long }, title: customerName }),
    ];

    let bounds = new google.maps.LatLngBounds();
    this.overlays.forEach(marker => {
      bounds.extend(marker.getPosition());
    });

    if (this.map) {
      setTimeout(() => { // map will need some time to load
        this.map.setCenter(bounds.getCenter());
        this.map.setZoom(this.zoom);
      }, 1);
    }
  }

  async getCustomerGeoCoding() {
    let address = '';
    let customerName = this.customerNameLabel;

    let customerType = Number(this.customerModel.CustomerType);
    switch (customerType) {
      case 1:
        //n???i ?????a ch??? kh??ch h??ng doanh nghi???p
        let area: Area = this.cusAreaControl.value;
        let provice: Province = this.cusProvinceControl.value;
        let district: District = this.cusDistrictControl.value;
        let ward: Ward = this.cusWardControl.value;
        let detailAddress = this.cusAddressControl.value;

        let proviceName = provice ? provice.provinceName : "";
        let districtName = district ? district.districtName : "";
        let wardName = ward ? ward.wardName : "";

        address = `${detailAddress},${wardName},${districtName},${proviceName}`;
        break
      case 2:
        //n???i ?????a ch??? kh??ch h??ng c?? nh??n
        let areaCusPer: Area = this.cusPerContAreaControl.value;
        let proviceCusPer: Province = this.cusPerContProvinceControl.value;
        let districtCusPer: District = this.cusPerContDistrictControl.value;
        let wardCusPer: Ward = this.cusPerContWardControl.value;
        let detailAddressCusPer = this.cusPerContAddressControl.value;

        let proviceCusPerName = proviceCusPer ? proviceCusPer.provinceName : "";
        let districtCusPerName = districtCusPer ? districtCusPer.districtName : "";
        let wardCusPerName = wardCusPer ? wardCusPer.wardName : "";

        address = `${detailAddressCusPer},${wardCusPerName},${districtCusPerName},${proviceCusPerName}`;
        break
    }
    //reset map position
    this.overlays = [];

    if (!address) return;

    try {
      let geoCodingResponse = await this.googleService.getGeoCoding(address);
      let listMatchPosition = geoCodingResponse.data.results;
      //l???y gi?? tr??? ?????u ti??n
      let position = listMatchPosition[0];
      this.overlays = [
        new google.maps.Marker({ position: { lat: position.geometry.lat, lng: position.geometry.lng }, title: customerName }),
      ];

      let bounds = new google.maps.LatLngBounds();
      this.overlays.forEach(marker => {
        bounds.extend(marker.getPosition());
      });

      if (this.map) {
        setTimeout(() => { // map will need some time to load
          this.map.setCenter(bounds.getCenter());
          this.map.setZoom(this.zoom);
        }, 1);
      }
    } catch (error) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Kh??ng t??m th???y v??? tr??' };
      this.showMessage(msg);
    }
  }

  async getCustomerGeoCodingUpdateContact(address, customerName) {
    if (!address) {
      this.overlays = [];
      return;
    }

    try {
      let geoCodingResponse = await this.googleService.getGeoCoding(address);
      let listMatchPosition = geoCodingResponse.data.results;
      //l???y gi?? tr??? ?????u ti??n
      let position = listMatchPosition[0];
      this.overlays = [
        new google.maps.Marker({ position: { lat: position.geometry.lat, lng: position.geometry.lng }, title: customerName }),
      ];

      let bounds = new google.maps.LatLngBounds();
      this.overlays.forEach(marker => {
        bounds.extend(marker.getPosition());
      });

      if (this.map) {
        setTimeout(() => { // map will need some time to load
          this.map.setCenter(bounds.getCenter());
          this.map.setZoom(this.zoom);
        }, 1000);
      }
    } catch (error) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Kh??ng t??m th???y v??? tr??' };
      this.showMessage(msg);
    }
  }

  checkDuplicateInforCustomer(checkType: number, formControl: FormControl) {
    if (formControl.valid) {
      let email = '';
      let phone = '';

      //N???u l?? kh??ch h??ng doanh nghi???p
      if (Number(this.customerModel.CustomerType) == 1) {
        email = this.cusEmailControl.value;
        phone = this.cusPhoneControl.value;
      }
      //N???u l?? kh??ch h??ng c?? nh??n
      else if (Number(this.customerModel.CustomerType) == 2) {
        email = this.cusPerContEmailControl.value;
        phone = this.cusPerContPhoneControl.value;
      }

      this.customerService.checkDuplicateInforCustomer(this.customerId, Number(checkType), email, phone).subscribe(response => {
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
          this.showToast('error', 'Th??ng b??o', result.messageCode);
        }
      });
    }
  }

  showMessageErr() {
    //N???u l?? Email
    if (!this.validEmailCustomer) {
      this.showToast('error', 'Th??ng b??o', 'Email kh??ch h??ng ???? t???n t???i tr??n h??? th???ng');
    }
    //N???u l?? S??? ??i???n tho???i
    if (!this.validPhoneCustomer) {
      this.showToast('error', 'Th??ng b??o', 'S??? ??i???n tho???i kh??ch h??ng ???? t???n t???i tr??n h??? th???ng');
    }
  }

  /* Disable Form */
  isEditCustomer() {
    this.isEdit = true;
    this.getMasterData();
  }

  /* Enable Form */
  isCancelEditCustomer() {
    this.isEdit = false;
    this.getMasterData();
  }

  onTabChange(event: any) {
    if (event.index === 0) {
      this.listSelect = [true, false, false, false, false, false, false, false];
    }
    else if (event.index === 1) {
      this.listSelect = [false, true, false, false, false, false, false, false];
    }
    else if (event.index === 2) {
      this.listSelect = [false, false, true, false, false, false, false, false];
    }
    else if (event.index === 3) {
      this.listSelect = [false, false, false, true, false, false, false, false];
    }
    else if (event.index === 4) {
      this.listSelect = [false, false, false, false, true, false, false], false;
    }
    else if (event.index === 5) {
      this.listSelect = [false, false, false, false, false, true, false, false];
    }
    else if (event.index === 6) {
      this.listSelect = [false, false, false, false, false, false, true, false];
    }
    else if (event.index === 7) {
      this.listSelect = [false, false, false, false, false, false, false, true];
    }
  }

  /** C???T CHU???I V?? TH??M '...' */
  formaterStr(str: string) {
    // n???u chu???i kh??c undefined
    if (str != undefined && str != null && str != '') {
      let strArray = str.split(' ');
      let result = '';
      let i = 0;
      // n???u chu???i l?? link
      if (str.search('/') > 1) {
        // n???u link df??i h??n 40 k?? t???
        if (str.length > 40) {
          result = str.substring(0, str.lastIndexOf('/')) + '/' + '...';
          return result;
        }
        // n???u link ng???n h??n 40 k?? t???
        else {
          result = str;
          return result;
        }
      }
      // n???u chu???i l?? m???t chu???i li???n d??i h??n 20 k?? t???
      else if (str.lastIndexOf(' ') === -1 && str.length > 20) {
        result = str.substring(0, 20)
      }
      // n???u chu???i ng???n h??n 20 t???
      else if (str.lastIndexOf(' ') <= 20) {
        result = str
      }
      else {
        // n???u chu???i ng???n h??n ho???c b???ng 20 t???
        if (strArray.length <= 20) {
          result = str
        }
        else {
          while (i < 20) {
            result += strArray[i] + ' ';
            if (result.indexOf('.') == result.length - 2) {
              result = result.trim() + '..';
              return result;
            } else if (result.indexOf(',') == result.length - 2) {
              result = result.substring(0, result.indexOf(',')) + '...';
              return result;
            }
            i++;
          }
          result = result.trim();

          if (result.charAt(result.lastIndexOf(' ') - 1) == '.') {
            result = result.substring(0, str.lastIndexOf(' ')) + '..';
          }
          else if (result.charAt(result.lastIndexOf(' ') - 1) == ',') {
            result = result.substring(0, str.lastIndexOf(' ') - 1) + '...'
          } else {
            result = result + '...'
          }
        }
      }
      return result;
    } else {
      return '';
    }
  }

  goBack() {
    this.location.back();
  }

}

function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null) {
      if (array.indexOf(control.value.toLowerCase()) !== -1 && control.value.toLowerCase() !== "") {
        return { 'checkDuplicateCode': true };
      }
      return null;
    }
  }
}
function checkDuplicateCustomeCode(array: Array<any>, customerCode: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined && customerCode !== null && customerCode !== undefined) {
      if (customerCode.toLowerCase() !== control.value.toLowerCase()) {
        if (control.value.trim() !== "") {
          let duplicateCode = array.find(e => e === control.value.trim());
          if (duplicateCode !== undefined) {
            return { 'duplicateCode': true };
          }
        }
      }
    }
    return null;
  }
}
function forbiddenSpaceText(control: FormControl) {
  let text = control.value;
  if (text && text.trim() == "") {
    return {
      forbiddenSpaceText: {
        parsedDomain: text
      }
    }
  }
  return null;
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
