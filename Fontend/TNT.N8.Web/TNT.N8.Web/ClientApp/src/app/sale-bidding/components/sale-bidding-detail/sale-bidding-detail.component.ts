import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import * as $ from 'jquery';
import { MenuItem } from 'primeng/api';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import { SaleBiddingService } from '../../services/sale-bidding.service';
import { CustomerService } from "../../../customer/services/customer.service";
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { saveAs } from "file-saver";
import { Workbook } from 'exceljs';
import { TemplateQuickEmailComponent } from '../../../customer/components/template-quick-email/template-quick-email.component';
import { TemplateQuickSmsComponent } from '../../../customer/components/template-quick-sms/template-quick-sms.component';
import { TemplateQuickGiftComponent } from '../../../customer/components/template-quick-gift/template-quick-gift.component';
import { CustomerModel } from "../../../customer/models/customer.model";
import { MeetingDialogComponent } from '../../../customer/components/meeting-dialog/meeting-dialog.component';
import { CostsQuocte } from "../../models/costs-quocte.model";
import { SaleBiddingDetailProductAttribute } from "../../models/product-attribute-category-value.model";
import { SaleBiddingDialogComponent } from '../sale-bidding-dialog/sale-bidding-dialog.component';
import { SaleBiddingVendorDialogComponent } from '../sale-bidding-vendor-dialog/sale-bidding-vendor-dialog.component';
import { ProductService } from '../../../product/services/product.service';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { NoteModel } from '../../../shared/models/note.model';
import { NoteService } from '../../../shared/services/note.service';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { ForderConfigurationService } from '../../../admin/components/folder-configuration/services/folder-configuration.service';
import * as XLSX from 'xlsx';
import { ContactModel } from "../../../shared/models/contact.model";
import { CustomerCareService } from '../../../customer/services/customer-care.service';
import { TemplatePreviewEmailComponent } from '../../../shared/components/template-preview-email/template-preview-email.component';

interface ResultDialog {
  status: boolean,  //L??u th?? true, H???y l?? false
  CostsQuocteModel: any,
}

interface FileNameExists {
  oldFileName: string;
  newFileName: string
}
class StatusSaleBiddingModel {
  saleBiddingId: string;
  statusId: string;
  note: string
}

class Product {
  price1: number;
  price2: number;
  productCategoryId: string;
  productCategoryName: string;
  productCode: string;
  productDescription: string;
  productId: string;
  productMoneyUnitId: string;
  productName: string
  productUnitId: string;
  quantity: string;
}


interface CostsQuoteExcel {
  STT: string,
  ProductCode: string,
  ProductName: string,
  Quantity: number,
  UnitPrice: number,
  CurrencyUnit: string,
  Amount: number,
  Tax: number,
  TaxAmount: number,
  DiscountType: boolean,
  DiscountValue: number,
  TotalAmount: number
}


class discountType {
  name: string;
  code: string;
  value: boolean;
}

class Vendor {
  listProductId: Array<string>;
  vendorId: string;
  vendorName: string;
}

class Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  active: boolean;
}

class Customer {
  customerCode: string;
  customerId: string;
  customerName: string;
  displayName: string;
  customerGroup: string;
  customerPhone: string;
  fullAddress: string;
  taxCode: string;
  personInCharge: string;
}

class UnitMoney {
  categoryCode: string;
  categoryId: string;
  categoryName: string;
}

class SaleBiddingDetail {
  saleBiddingDetailId: string
  saleBiddingId: string;
  category: string;
  content: string;
  note: string;
  file: File[];
  listFile: Array<FileInFolder>;
  index: number;
}

class SaleBidding {
  saleBiddingId: string;
  saleBiddingName: string;
  saleBiddingCode: string;
  leadId: string;
  customerId: string;
  valueBid: number;
  startDate: Date;
  address: string;
  bidStartDate: Date;
  personInChargeId: string;
  effecTime: number;
  endDate: Date;
  typeContractId: string;
  formOfBid: string;
  currencyUnitId: string;
  ros: number;
  provisionalGrossProfit: number;
  typeContractName: string;
  slowDay: number;
  contactId: string;
  employeeId: string; // Nh??n vi??n b??n h??ng
  statusId: string;
  leadName: string;
  leadCode: string;
  updatedById: string;
}

class FileInFolder {
  fileInFolderId: string;
  folderId: string;
  fileName: string;
  objectId: string;
  objectType: string;
  size: string;
  active: boolean;
  fileExtension: string;
  createdById: string;
  createdDate: Date; ??
  index: number;
}
class Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isDefault: boolean;
  categoryTypeId: string;
  categoryTypeName: string;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: Date;
  active: boolean;
  isEdit: boolean;
  categoryTypeCode: string;
  countCategoryById: string;
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

@Component({
  selector: 'app-sale-bidding-detail',
  templateUrl: './sale-bidding-detail.component.html',
  styleUrls: ['./sale-bidding-detail.component.css']
})
export class SaleBiddingDetailComponent implements OnInit {
  fixed: boolean = false;
  withFiexd: string = "";
  tabMenu: MenuItem[];
  displayDialogImport: boolean = false;
  displayDialogStatus: boolean = false;
  displayDialogStatusAppr: boolean = false;
  displayDialog: boolean = false;
  colsProduct: any[];
  colsProductAttr: any[];
  selectedProduct: any[];
  selectedProductAttr: any[];
  colsNoteFile: any = [];
  colsCategory: any[];
  activeIndex: number = 0;
  selectedCategory: any[];
  listProduct: Array<Product> = [];
  selectedOrderDetailType: number = 0;
  displayCustomerDetail: boolean = false;
  loading: boolean = false;
  saleBiddingDetail: SaleBiddingDetail = new SaleBiddingDetail();
  listVendor: Array<Vendor> = [];
  listVendorCommon: Array<Vendor> = [];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth = JSON.parse(localStorage.getItem('auth'));
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  currentEmployeeId = this.auth.EmployeeId;  //employeeId c???a ng?????i ??ang ????ng nh???p
  statusSaleBidding: Category = new Category();
  statusCode: string = null;
  listStatusSaleBidding: Array<Category> = [];
  saleBiddingId: string = "";
  stepStatus: MenuItem[];
  listQuoteDetailModel: Array<CostsQuocte> = [];
  // L?? do t??? ch???i
  reasonRefuse: string = "";

  fileName: string = '';

  @ViewChild('fileUpload') fileUpload: FileUpload;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];

  file: File;
  arrayBuffer: any;
  filelist: any;
  titleText: string = '';
  isUpdateAI: boolean = false;
  importFileExcel: any = null;
  messErrFile: any = [];
  cellErrFile: any = [];
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;

  listCostsQuoteExcel: Array<CostsQuoteExcel> = [];
  isImportCost: boolean = false;
  isAddCategory: boolean = true;
  isEditCategory: boolean = false;
  isLoginEmployeeJoin: boolean = false;


  // Form h??? s?? th???u

  saleBiddingForm: FormGroup;
  employeeControl: FormControl;
  personInChargeControl: FormControl;
  customerControl: FormControl;
  saleBiddingNameControl: FormControl;
  startDateControl: FormControl;
  addressControl: FormControl;
  bidStartDateControl: FormControl;
  effecTimeControl: FormControl;
  endDateControl: FormControl;
  typeContractControl: FormControl;
  formOfBidControl: FormControl;
  currencyUnitControl: FormControl;
  listEmployeeControl: FormControl;

  // End

  activeItem: MenuItem;
  salebiddingModel: SaleBidding = new SaleBidding();
  listCostsQuote: Array<CostsQuocte> = [];
  listQuocteDetail: Array<CostsQuocte> = [];
  employee: Employee;
  listEmployee: Array<Employee> = [];
  listEmployeeJoin: Array<Employee> = [];
  listPerson: Array<Employee> = [];
  listCustomer: Array<Customer> = [];
  listMoneyUnit: Array<UnitMoney> = [];
  valueBid: number = 0;
  customerSelected: Customer = new Customer();
  sumMoneyCostBeforVAT: number = 0;
  sumCostVAT: number = 0;
  sumCostMoneyAfterVAT: number = 0;
  sumMoneyQuoteBeforVAT: number = 0;
  sumQuocteVAT: number = 0;
  sumQuocteMoneyAfterVAT: number = 0;
  ROS: number = 0;
  provisionalGrossProfit: number = 0;
  listFormOfBid: Array<any> = [
    { label: 'Online', value: "Online" },
    { label: 'Tr???c ti???p', value: 'Tr???c ti???p' }
  ];

  discountTypeList: Array<discountType> = [
    { "name": "Theo %", "code": "PT", "value": true },
    { "name": "S??? ti???n", "code": "ST", "value": false }
  ];
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  isProduct1: boolean = true;
  isProduct2: boolean = true;
  isApproved: boolean = false;
  isEdit: boolean = false;
  listCategory: Array<SaleBiddingDetail> = [];

  actionImport: boolean = true;
  actionDelete: boolean = true;
  actionEdit: boolean = true;
  isShowButtonSave: boolean = true;
  isPersonInCharge: boolean = false;
  costsQuote: CostsQuocte = new CostsQuocte();
  listCostsQuoteModelOrderBy: Array<CostsQuocte> = [];
  listUnitMoney: Array<Category> = [];
  listUnitProduct: Array<Category> = [];
  productCodeSystemList: string[] = [];
  listProductUnitName: string[] = [];

  amountVatProduct: number = 0;
  amountProduct: number = 0;
  amountDiscountProduct: number = 0;

  amountVatOC: number = 0;
  amountDiscountOC: number = 0;
  amountOC: number = 0;

  minYear: number = 2010;
  currentYear: number = (new Date()).getFullYear();

  // CSKH
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
  productType: number;

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
  actionApprove: boolean = true;
  actionReject: boolean = true;
  listCustomerCode: any = []
  contactModel: ContactModel = new ContactModel();
  customerModel: CustomerModel = new CustomerModel();

  /*NOTE*/
  listNoteDocumentModel: Array<NoteDocumentModel> = [];
  listUpdateNoteDocument: Array<NoteDocument> = [];
  noteHistory: Array<Note> = [];

  noteId: string = null;
  noteContent: string = '';
  isEditNote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  uploadedNoteFiles: any[] = [];
  /*End : Note*/

  /*Form th??ng tin li??n h??? KH C?? nh??n*/
  feedbackForm: FormGroup;

  feedbackCodeControl: FormControl;
  feedbackContentControl: FormControl;
  /*End*/

  listTypeContact: Array<Category> = [];

  isUserSendAproval: boolean = false; // c?? ph???i ng?????i g???i ph?? duy???t kh??ng

  constructor(
    private renderer: Renderer2,
    private saleBiddingService: SaleBiddingService,
    private messageService: MessageService,
    private getPermission: GetPermission,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private noteService: NoteService,
    private productService: ProductService,
    private confirmationService: ConfirmationService,
    private imageService: ImageUploadService,
    private folderService: ForderConfigurationService,
    private customerCareService: CustomerCareService
  ) {
    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (this.save) {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        } else {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm();
    let resource = "crm/sale-bidding/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false; //Th??m s???n ph???m d???ch v???, T???o ????n h??ng
      }
      if (listCurrentActionResource.indexOf("import") == -1) {
        this.actionImport = false;  //import file upload
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;  //X??a s???n ph???m d???ch v???, x??a file upload ???? l??u
      }
      if (listCurrentActionResource.indexOf("approve") == -1) {
        this.actionApprove = false;
      }
      if (listCurrentActionResource.indexOf("reject") == -1) {
        this.actionReject = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        //S???a b??o gi??, s???a s???n ph???m d???ch v???
        this.actionEdit = false;
        this.isShowButtonSave = false;  //???n n??t l??u
      }


      this.route.params.subscribe(params => { this.saleBiddingId = params['saleBiddingId'] });
      this.setMenuTab();
      this.setTable();
      //this.setForm();
      this.getMasterData();
    }
  }

  getMasterData() {
    this.loading = true;
    this.saleBiddingService.getMasterDataSaleBiddingDetail(this.saleBiddingId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.salebiddingModel = result.saleBidding;

        if (!this.salebiddingModel.leadCode) this.salebiddingModel.leadCode = '';

        if (this.auth.UserId == this.salebiddingModel.updatedById) {
          this.isUserSendAproval = true;
        }

        this.listProduct = result.listProduct;
        this.listPerson = result.listPerson;
        this.listEmployee = this.listPerson;
        this.listEmployeeJoin = result.listEmployee;
        this.isApproved = result.isApproved;
        this.listCustomer = result.listCustomer;
        this.listTypeContact = result.listTypeContact;
        this.listCustomer.forEach(item => {
          item.displayName = item.customerCode + ' - ' + item.customerName;
        });
        this.isEdit = result.isEdit;
        this.isLoginEmployeeJoin = result.isLoginEmployeeJoin;
        let tempTypeContact: Category = this.listTypeContact.find(x => x.categoryId == this.salebiddingModel.typeContractId);
        this.typeContractControl.setValue(tempTypeContact);
        this.typeContractControl.updateValueAndValidity();

        // T??m ng?????i ph??? tr??ch
        let personInCharge = this.listPerson.find(x => x.employeeId == this.salebiddingModel.personInChargeId);
        // G??n list tab chi ph?? ?????u v??o
        this.listCostsQuote = result.saleBidding.saleBiddingDetail.filter(x => x.costsQuoteType == 1);
        let index = 0;
        this.listCostsQuote.forEach((item, i) => {
          item.index = index + 1;
          index++;
          item.orderNumber = item.orderNumber ? item.orderNumber : i +1;
        });
        this.caculatorMoneyCost();

        // G??n tab chi ph?? ng?????i ph??? tr??ch
        this.listQuocteDetail = result.saleBidding.saleBiddingDetail.filter(x => x.costsQuoteType == 2);
        index = 0;
        this.listQuocteDetail.forEach(item => {
          item.index = index + 1;
          index++;
        })
        this.caculatorMoneyQuocte();
        // G??n danh s??ch chi ti???t h??? s?? th???u tab chi ti???t h??? s?? th???u
        this.listCategory = result.listSaleBiddingDetail;
        // L???y danh s??ch lis
        this.listMoneyUnit = result.listMoneyUnit;

        this.personInChargeControl.setValue(personInCharge);
        // T??m nh??n vi??n b??n h??ng
        let employee = this.listEmployee.find(x => x.employeeId == this.salebiddingModel.employeeId);
        this.employeeControl.setValue(employee);
        let unitMoney = this.listMoneyUnit.find(x => x.categoryCode == "VND");
        this.currencyUnitControl.setValue(unitMoney);

        // G??n t??n h??? s?? th???u
        this.saleBiddingNameControl.setValue(this.salebiddingModel.saleBiddingName);
        // G??n t??n kh??ch h??ng
        let customer = result.listCustomer.find(x => x.customerId == this.salebiddingModel.customerId);
        this.customerControl.setValue(customer);
        let startDate = this.salebiddingModel.startDate == null ? null : new Date(this.salebiddingModel.startDate);
        this.startDateControl.setValue(startDate);

        // G??n note
        this.noteHistory = result.listNote;
        this.handleNoteContent();

        this.addressControl.setValue(this.salebiddingModel.address == null ? "" : this.salebiddingModel.address);
        let bidStart = this.salebiddingModel.bidStartDate == null ? null : new Date(this.salebiddingModel.bidStartDate);
        this.bidStartDateControl.setValue(bidStart);
        this.effecTimeControl.setValue(this.salebiddingModel.effecTime);
        let endDate = this.salebiddingModel.endDate == null ? null : new Date(this.salebiddingModel.endDate);
        this.endDateControl.setValue(endDate);

        let formOfBid = this.listFormOfBid.find(x => x.value == this.salebiddingModel.formOfBid);
        this.formOfBidControl.setValue(formOfBid);
        // X??t tr???ng th??i h??? s?? th???u
        this.listStatusSaleBidding = result.listStatus;
        let status: Category = this.listStatusSaleBidding.find(x => x.categoryId == this.salebiddingModel.statusId);
        if (status != null && status != undefined) {
          this.statusSaleBidding = status;
          this.statusCode = this.statusSaleBidding.categoryCode;
        }

        // L???y danh s??ch tr???ng th??i h??? s?? th???u
        this.stepStatus = [
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'NEW').categoryName
          },
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'CHO').categoryName
          },
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'REFU').categoryName
          },
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'APPR').categoryName
          },
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'LOSE').categoryName
          },
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'WIN').categoryName
          }
          ,
          {
            label: this.listStatusSaleBidding.find(x => x.categoryCode == 'CANC').categoryName
          }
        ];

        this.setStatusActive(status.categoryCode);

        let listEmployeeJoin: Array<Employee> = this.listEmployeeJoin.filter(x => result.listEmployeeMapping.includes(x.employeeId));
        this.listEmployeeControl.setValue(listEmployeeJoin);

        this.listCustomerCareInfor = result.listCustomerCareInfor;

        //L???ch h???n
        this.customerMeetingInfor = result.customerMeetingInfor;

        this.contactModel = <ContactModel>({
          ContactId: result.contact.contactId,
          ObjectId: result.contact.objectId,
          ObjectType: result.contact.objectType,
          FirstName: result.contact.firstName != null ? result.contact.firstName.trim() : "",
          LastName: result.contact.lastName != null ? result.contact.lastName.trim() : "",
          Phone: result.contact.phone != null ? result.contact.phone.trim() : "",
          Email: result.contact.email != null ? result.contact.email.trim() : "",
          Address: result.contact.address != null ? result.contact.address.trim() : "",
          Gender: result.contact.gender,
          DateOfBirth: result.contact.dateOfBirth != null ? new Date(result.contact.dateOfBirth) : null,
          WorkPhone: result.contact.workPhone,
          OtherPhone: result.contact.otherPhone,
          WorkEmail: result.contact.workEmail,
          OtherEmail: result.contact.otherEmail,
          IdentityID: result.contact.identityId,
          AvatarUrl: result.contact.avatarUrl,
          CountryId: result.contact.countryId,
          DistrictId: result.contact.districtId,
          ProvinceId: result.contact.provinceId,
          WebsiteUrl: result.contact.websiteUrl,
          WardId: result.contact.wardId,
          MaritalStatusId: result.contact.maritalStatusId,
          PostCode: result.contact.postCode,
          Note: result.contact.note,
          Role: result.contact.role,
          TaxCode: result.contact.taxCode,
          Job: result.contact.job,
          Agency: result.contact.agency,
          CompanyName: result.contact.companyName,
          CompanyAddress: result.contact.companyAddress,
          CustomerPosition: result.contact.customerPosition,
          Birthplace: result.contact.birthplace,
          CreatedById: result.contact.createdById,
          CreatedDate: result.contact.createdDate,
          UpdatedById: result.contact.updatedById,
          UpdatedDate: result.contact.updatedDate,
          Active: result.contact.active,
          Other: result.contact.other
        });
      }
    });
  }

  setStatusActive(code: string) {

    switch (code) {
      case 'NEW':
        this.activeIndex = 0;
        break;

      case 'CHO':
        this.activeIndex = 1;
        break;

      case 'REFU':
        this.activeIndex = 2;
        break;

      case 'APPR':
        this.activeIndex = 3;
        break;

      case 'LOSE':
        this.activeIndex = 4;
        break;
      case 'WIN':
        this.activeIndex = 5;
        break;

      case 'CANC':
        this.activeIndex = 6;
        break;
      default:
        break;

    }
  }
  /*End*/

  setForm() {
    /* Form th??ng tin h??? s?? th???u */
    this.employeeControl = new FormControl(null); // Nh??n vi??n b??n h??ng
    this.personInChargeControl = new FormControl(null, [Validators.required]); // Ng?????i ph??? tr??ch
    this.customerControl = new FormControl(null, [Validators.required]);  // Kh??ch h??ng b??n ?????u th???u
    this.saleBiddingNameControl = new FormControl(null, [Validators.required, forbiddenSpaceText]); // T??n g??i th???u
    this.startDateControl = new FormControl(new Date(), [Validators.required]); // Ng??y m??? th???u
    this.addressControl = new FormControl(null); // ?????a ch???
    this.bidStartDateControl = new FormControl(new Date(), [Validators.required]); // Ng??y n???p th???u
    this.effecTimeControl = new FormControl(0, [Validators.required]); // Th???i gian c?? hi???u l???c
    this.endDateControl = new FormControl(null); // Ng??y c?? k???t qu??? d??? ki???n
    this.typeContractControl = new FormControl(null, [Validators.required]); // Loai h???p ?????ng
    this.formOfBidControl = new FormControl(null, [Validators.required]); // H??nh th???c nh???n th???u
    this.currencyUnitControl = new FormControl(null); // ????n v??? ti???n
    this.listEmployeeControl = new FormControl(null); // Danh sach nh??n vi??n tham gia

    this.saleBiddingForm = new FormGroup({
      employeeControl: this.employeeControl,
      personInChargeControl: this.personInChargeControl,
      saleBiddingNameControl: this.saleBiddingNameControl,
      startDateControl: this.startDateControl,
      addressControl: this.addressControl,
      bidStartDateControl: this.bidStartDateControl,
      effecTimeControl: this.effecTimeControl,
      endDateControl: this.endDateControl,
      typeContractControl: this.typeContractControl,
      formOfBidControl: this.formOfBidControl,
      currencyUnitControl: this.currencyUnitControl,
      listEmployeeControl: this.listEmployeeControl,
      customerControl: this.customerControl
    });
    /* End */

    // CSKH
    this.feedbackCodeControl = new FormControl(null, [Validators.required]);
    this.feedbackContentControl = new FormControl(null, [Validators.required]);

    this.feedbackForm = new FormGroup({
      feedbackCodeControl: this.feedbackCodeControl,
      feedbackContentControl: this.feedbackContentControl
    });

    this.month = ((new Date()).getMonth() + 1).toString().length == 1 ? ('0' + ((new Date()).getMonth() + 1).toString()) : ((new Date()).getMonth() + 1).toString();
    this.getDateByTime(parseFloat(this.month), this.year, 'cus_care');

    this.monthMeeting = ((new Date()).getMonth() + 1).toString().length == 1 ? ('0' + ((new Date()).getMonth() + 1).toString()) : ((new Date()).getMonth() + 1).toString();
    this.getDateByTime(parseFloat(this.monthMeeting), this.yearMeeting, 'cus_meeting');
  }

  setMenuTab() {
    this.tabMenu = [
      { label: 'Chi ti???t CP ?????u v??o', icon: 'fas fa-dollar-sign' },
      { label: 'Chi ti???t b??o gi??', icon: 'fas fa-quote-right' },
      { label: 'Chi ti???t h??? s?? th???u', icon: 'fas fa-info-circle' },
      { label: 'Th??ng tin CSKH', icon: 'fas fa-users' },
    ];
    this.activeItem = this.tabMenu[0];
  }

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

  /*Thay ?????i ng??y m??? th???u*/
  changeStartDate() {
    this.endDateControl.setValue(null);
  }

  moveQuocte() {
    this.listQuocteDetail = [];
    this.listQuocteDetail = this.listCostsQuote.filter(x => x != null);
    this.activeItem = this.tabMenu[1];
    this.caculatorMoneyQuocte();
  }

  saveSaleBidding() {
    if (!this.saleBiddingForm.valid) {
      Object.keys(this.saleBiddingForm.controls).forEach(key => {
        if (this.saleBiddingForm.controls[key].valid == false) {
          this.saleBiddingForm.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
    }
    else {
      let isAdd = true;
      let saleBidding: SaleBidding = new SaleBidding();

      let startDate = this.startDateControl.value;
      let endDate = this.endDateControl.value;
      let bidStartDate = this.bidStartDateControl.value;

      if (endDate != null) {
        if (this.calcDaysDiff(startDate, endDate) < 0) {
          let msg = { severity: 'error', summary: 'Th??ng b??o', detail: "Ng??y c?? k???t qu??? d??? ki???n ph???i l???n h??n ho???c b???ng ng??y m??? th???u!" };
          this.showMessage(msg);
          isAdd = false;
        }
      }
      if (startDate) {
        startDate = convertToUTCTime(startDate);
      }
      if (bidStartDate) {
        bidStartDate = convertToUTCTime(bidStartDate);
      }

      if (this.effecTimeControl.value <= 0) {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: "Th???i gian hi???u l???c ph???i l???n h??n 0!" };
        this.showMessage(msg);
        isAdd = false;
      }
      if (endDate != null && endDate) {
        endDate = convertToUTCTime(endDate);
      }

      if (isAdd) {
        saleBidding.saleBiddingName = this.saleBiddingNameControl.value;
        saleBidding.saleBiddingCode = this.salebiddingModel.saleBiddingCode;
        saleBidding.customerId = this.customerControl.value.customerId;
        saleBidding.startDate = this.startDateControl.value;
        saleBidding.address = this.addressControl.value;
        saleBidding.bidStartDate = this.bidStartDateControl.value;
        saleBidding.effecTime = this.effecTimeControl.value;
        saleBidding.endDate = endDate;
        saleBidding.typeContractId = this.typeContractControl.value.categoryId;
        saleBidding.formOfBid = this.formOfBidControl.value.label;
        saleBidding.currencyUnitId = this.currencyUnitControl.value.categoryId;
        saleBidding.personInChargeId = this.personInChargeControl.value.employeeId;
        saleBidding.leadId = this.salebiddingModel.leadId;
        saleBidding.valueBid = this.sumQuocteMoneyAfterVAT;
        saleBidding.provisionalGrossProfit = this.provisionalGrossProfit;
        saleBidding.employeeId = this.employeeControl.value ? this.employeeControl.value.employeeId : null;

        saleBidding.saleBiddingId = this.salebiddingModel.saleBiddingId;
        saleBidding.statusId = this.statusSaleBidding.categoryId;

        this.loading = true;
        let listEmployee: Array<Employee> = this.listEmployeeControl.value;
        if (listEmployee == null) {
          listEmployee = [];
        }
        this.saleBiddingService.editSaleBidding(saleBidding, listEmployee, this.listCostsQuote, this.listQuocteDetail, this.listCategory).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.listCategory = [];
            this.listCategory = result.listSaleBiddingDetail;
            let msg = { severity: 'success', summary: 'Th??ng b??o', detail: "S???a th??nh c??ng!" };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    }
  }

  addProduct(number: number) {
    /*Th??m s???n ph???m d???ch v???*/
    let isCosts = false;
    if (number == 1) {
      isCosts = true;
    }
    let ref = this.dialogService.open(SaleBiddingDialogComponent, {
      data: {
        isCreate: true,
        isCosts: isCosts
      },
      header: 'Th??m s???n ph???m d???ch v???',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {

      if (result) {
        if (result.status) {
          if (number == 1) {
            this.costsQuote = result.CostsQuocteModel;
            this.costsQuote.vendorId = result.CostsQuocteModel.vendorId;
            this.costsQuote.saleBiddingId = result.CostsQuocteModel.saleBiddingId;
            this.costsQuote.productId = result.CostsQuocteModel.productId;
            this.costsQuote.quantity = result.CostsQuocteModel.quantity;
            this.costsQuote.unitPrice = result.CostsQuocteModel.unitPrice;
            this.costsQuote.currencyUnit = result.CostsQuocteModel.currencyUnit;
            this.costsQuote.exchangeRate = result.CostsQuocteModel.exchangeRate;
            this.costsQuote.vat = result.CostsQuocteModel.vat;
            this.costsQuote.discountType = result.CostsQuocteModel.discountType;
            this.costsQuote.discountValue = result.CostsQuocteModel.discountValue;
            this.costsQuote.description = result.CostsQuocteModel.description;
            this.costsQuote.orderDetailType = result.CostsQuocteModel.orderDetailType;
            this.costsQuote.unitId = result.CostsQuocteModel.unitId;
            this.costsQuote.incurredUnit = result.CostsQuocteModel.incurredUnit;
            this.costsQuote.nameVendor = result.CostsQuocteModel.nameVendor;
            this.costsQuote.productNameUnit = result.CostsQuocteModel.productNameUnit;
            this.costsQuote.nameMoneyUnit = result.CostsQuocteModel.nameMoneyUnit;
            this.costsQuote.sumAmount = result.CostsQuocteModel.sumAmount;
            this.costsQuote.amountDiscount = result.CostsQuocteModel.amountDiscount;
            this.costsQuote.productName = result.CostsQuocteModel.productName;
            this.costsQuote.productCode = result.CostsQuocteModel.productCode;
            this.costsQuote.saleBiddingDetailProductAttribute = [];
            result.CostsQuocteModel.saleBiddingDetailProductAttribute.forEach(item => {
              let temp: SaleBiddingDetailProductAttribute = new SaleBiddingDetailProductAttribute();
              temp.productAttributeCategoryId = item.productAttributeCategoryId;
              temp.productAttributeCategoryValueId = item.productAttributeCategoryValueId;
              temp.productId = item.productId;
              this.costsQuote.saleBiddingDetailProductAttribute.push(temp);
            });
            let index = 0;
            if (this.listCostsQuote.length > 0) {
              index = this.listCostsQuote.sort(x => x.index)[this.listCostsQuote.length - 1].index;
            }
            this.costsQuote.index = index + 1;
            //set orderNumber cho s???n ph???m/d???ch v??? m???i th??m
            this.costsQuote.orderNumber = this.listCostsQuote.length + 1;
            this.listCostsQuote.push(this.costsQuote);
            this.caculatorMoneyCost();
          } else {
            this.costsQuote = result.CostsQuocteModel;
            this.costsQuote = result.CostsQuocteModel;
            this.costsQuote.vendorId = result.CostsQuocteModel.vendorId;
            this.costsQuote.saleBiddingId = result.CostsQuocteModel.saleBiddingId;
            this.costsQuote.productId = result.CostsQuocteModel.productId;
            this.costsQuote.quantity = result.CostsQuocteModel.quantity;
            this.costsQuote.unitPrice = result.CostsQuocteModel.unitPrice;
            this.costsQuote.currencyUnit = result.CostsQuocteModel.currencyUnit;
            this.costsQuote.exchangeRate = result.CostsQuocteModel.exchangeRate;
            this.costsQuote.vat = result.CostsQuocteModel.vat;
            this.costsQuote.discountType = result.CostsQuocteModel.discountType;
            this.costsQuote.discountValue = result.CostsQuocteModel.discountValue;
            this.costsQuote.description = result.CostsQuocteModel.description;
            this.costsQuote.orderDetailType = result.CostsQuocteModel.orderDetailType;
            this.costsQuote.unitId = result.CostsQuocteModel.unitId;
            this.costsQuote.incurredUnit = result.CostsQuocteModel.incurredUnit;
            this.costsQuote.nameVendor = result.CostsQuocteModel.nameVendor;
            this.costsQuote.productNameUnit = result.CostsQuocteModel.productNameUnit;
            this.costsQuote.nameMoneyUnit = result.CostsQuocteModel.nameMoneyUnit;
            this.costsQuote.sumAmount = result.CostsQuocteModel.sumAmount;
            this.costsQuote.amountDiscount = result.CostsQuocteModel.amountDiscount;
            this.costsQuote.productName = result.CostsQuocteModel.productName;
            this.costsQuote.productCode = result.CostsQuocteModel.productCode;
            this.costsQuote.saleBiddingDetailProductAttribute = [];
            result.CostsQuocteModel.saleBiddingDetailProductAttribute.forEach(item => {
              let temp: SaleBiddingDetailProductAttribute = new SaleBiddingDetailProductAttribute();
              temp.productAttributeCategoryId = item.productAttributeCategoryId;
              temp.productAttributeCategoryValueId = item.productAttributeCategoryValueId;
              temp.productId = item.productId;
              this.costsQuote.saleBiddingDetailProductAttribute.push(temp);
            });
            let index = 0;
            if (this.listQuocteDetail.length > 0) {
              index = this.listQuocteDetail.sort(x => x.index)[this.listQuocteDetail.length - 1].index;
            }
            this.costsQuote.index = index + 1;
            //set orderNumber cho s???n ph???m/d???ch v??? m???i th??m
            this.costsQuote.orderNumber = this.listQuocteDetail.length + 1;
            this.listQuocteDetail.push(this.costsQuote);
            this.caculatorMoneyQuocte();
          }

          this.costsQuote = new CostsQuocte();
        }
      }
    });
  }

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  changePerson() {
    if (this.customerControl.value) {
      this.loading = true;
      this.saleBiddingService.getPersonInChargeByCustomerId(this.customerControl.value.customerId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listPerson = result.listPersonInCharge;
          this.listEmployee = this.listPerson;
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    } else {

    }
  }

  showDialog(dataRow: CostsQuocte, number) {
    //N???u c?? quy???n s???a th?? m???i cho s???a
    let isCosts = false;
    if (number == 1) {
      isCosts = true;
    }
    this.actionEdit = true;
    if (this.actionEdit) {
      let OldArray: CostsQuocte = new CostsQuocte();
      let index = dataRow.index;
      if (number == 1) {
        OldArray = dataRow;
      } else {
        OldArray = dataRow;
      }

      let ref = this.dialogService.open(SaleBiddingDialogComponent, {
        data: {
          isCreate: false,
          isCosts: isCosts,
          CostsQuocteModel: OldArray,
          actionNumber: this.activeIndex,
        },
        header: 'S???a s???n ph???m d???ch v???',
        width: '70%',
        baseZIndex: 1030,
        contentStyle: {
          "min-height": "280px",
          "max-height": "600px",
          "overflow": "auto"
        }
      });

      ref.onClose.subscribe((result: ResultDialog) => {
        if (result) {
          if (result.status) {
            if (number == 1) {
              this.costsQuote = result.CostsQuocteModel;
              this.costsQuote.index = index;
              let temp = index = this.listCostsQuote.indexOf(dataRow);
              this.listCostsQuote[temp] = this.costsQuote;
              this.listCostsQuote = this.listCostsQuote.sort(x => x.index);
              this.listCostsQuote = [...this.listCostsQuote];
              this.caculatorMoneyCost();
            } else {
              this.costsQuote = result.CostsQuocteModel;
              this.costsQuote.index = index;
              let temp = index = this.listQuocteDetail.indexOf(dataRow);
              this.listQuocteDetail[temp] = this.costsQuote;
              this.listQuocteDetail = this.listQuocteDetail.sort(x => x.index);
              this.listQuocteDetail = [...this.listQuocteDetail]
              this.caculatorMoneyQuocte();
            }
          }
          this.costsQuote = new CostsQuocte();
          this.restartCustomerOrderDetailModel();
        }
      });
    }
    this.actionEdit = false;
  }
  gotoQuote() {
    let bidStartDate = this.bidStartDateControl.value;
    if (this.calcDaysDiff(bidStartDate, new Date()) <= this.effecTimeControl.value) {
      this.router.navigate(['/customer/quote-create', { saleBiddingId: this.saleBiddingId }]);
    }
    else {
      let msg = { severity: 'error', summary: 'Th??ng b??o', detail: "H??? s?? th???u ???? h???t hi???u l???c" };
      this.showMessage(msg);
    }
  }

  // Y??u c???u h??? tr???
  requireSupport() {
    this.loading = true;
    this.saleBiddingService.sendEmailEmployee(this.saleBiddingId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  restartCustomerOrderDetailModel() {
    var item: CostsQuocte = {
      costsQuocteId: this.emptyGuid,
      explainStr: "",
      vendorId: null,
      saleBiddingId: this.emptyGuid,
      productId: null,
      quantity: null,
      unitPrice: null,
      currencyUnit: null,
      exchangeRate: 1,
      vat: null,
      discountType: true,
      discountValue: null,
      description: '',
      orderDetailType: 0,
      createdById: this.auth.UserId,
      createdDate: new Date(),
      updatedById: this.emptyGuid,
      productCategory: this.emptyGuid,
      updatedDate: new Date(),
      active: true,
      unitId: null,
      incurredUnit: '',
      saleBiddingDetailProductAttribute: null,
      nameVendor: '',
      productNameUnit: '',
      nameMoneyUnit: '',
      sumAmount: 0,
      amountDiscount: 0,
      productCode: '',
      productName: '',
      taxMoney: 0,
      index: 0,
      orderNumber: 0,
      unitLaborNumber: 0,
      unitLaborPrice: 0,
      sumAmountLabor: 0,
    };
  }


  showCustomerDetail() {
    this.displayCustomerDetail = true;
    this.customerSelected = this.customerControl.value;
  }

  setTable() {
    this.colsProductAttr = [
      { field: 'productAttributeCategoryName', header: 'T??n thu???c t??nh', textAlign: 'left', color: '#f44336' },
      { field: 'productAttributeCategoryValue', header: 'Gi?? tr???', textAlign: 'right', color: '#f44336' }
    ];
    this.selectedProductAttr = this.colsProductAttr;

    this.colsProduct = [
      { field: 'Move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
      { field: 'productCode', header: 'M?? s???n ph???m', textAlign: 'left', color: '#f44336' },
      { field: 'productName', header: 'T??n s???n ph???m', textAlign: 'left', color: '#f44336' },
      { field: 'productNameUnit', header: '????n v??? t??nh', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'S??? l?????ng', textAlign: 'right', color: '#f44336' },
      { field: 'unitPrice', header: '????n gi??', textAlign: 'right', color: '#f44336' },
      { field: 'vat', header: 'Thu??? su???t', textAlign: 'right', color: '#f44336' },
      { field: 'taxMoney', header: 'Ti???n thu???', textAlign: 'right', color: '#f44336' },
      { field: 'sumAmount', header: 'T???ng ti???n', textAlign: 'right', color: '#f44336' },
      { field: 'delete', header: 'Thao t??c', textAlign: 'right', color: '#f44336' }
    ];
    this.selectedProduct = this.colsProduct;

    this.colsCategory = [
      { field: 'category', header: 'H???ng m???c', textAlign: 'left', color: '#f44336' },
      { field: 'content', header: 'N???i dung', textAlign: 'left', color: '#f44336' },
      { field: 'note', header: 'Ghi ch??', textAlign: 'left', color: '#f44336' }
    ];

    this.colsNoteFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'left' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'left' },
    ];
  }

  removeProduct(data) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.listCostsQuote = this.listCostsQuote.filter(x => x.index != data.index);
        this.caculatorMoneyCost();
      }
    });
  }
  removeProductQuote(data) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.listQuocteDetail = this.listQuocteDetail.filter(x => x.index != data.index);
        this.caculatorMoneyQuocte();
      }
    });

  }

  calcDaysDiff(dateFrom, dateTo): number {
    let currentDate = new Date(dateTo);
    let dateSent = new Date(dateFrom);

    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
  }

  getActiveItem(activeItem) {
    this.activeItem = activeItem.activeItem;
  }

  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case -1: {
        result = result;
        break;
      }
      case 0: {
        result = Math.round(result);
        break;
      }
      case 1: {
        result = Math.round(number * 10) / 10;
        break;
      }
      case 2: {
        result = Math.round(number * 100) / 100;
        break;
      }
      case 3: {
        result = Math.round(number * 1000) / 1000;
        break;
      }
      case 4: {
        result = Math.round(number * 10000) / 10000;
        break;
      }
      default: {
        result = result;
        break;
      }
    }
    return result;
  }

  /*Event L??u c??c file ???????c ch???n*/
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

  chooseFile(event) {
    this.fileName = event.target.files[0].name;
    this.importFileExcel = event.target;

    this.getInforDetailQuote();
  }

  async getInforDetailQuote() {
    let result: any = await this.productService.getMasterdataCreateProduct(this.productType);
    if (result.statusCode === 200) {
      this.productCodeSystemList = result.listProductCode;
      this.listProductUnitName = result.listProductUnitName;
    };

    this.saleBiddingService.getMasterDataSaleBiddingAddEditProductDialog().subscribe(response => {
      let resultListProduct: any = response;
      if (resultListProduct.statusCode == 200) {
        this.listProduct = resultListProduct.listProduct;
        this.listUnitMoney = resultListProduct.listUnitMoney;
        this.listUnitProduct = resultListProduct.listUnitProduct;
      }
    });
  }

  showDialogImportExcel(number) {
    this.displayDialogImport = true;
    if (number == 1) {
      this.isImportCost = true;
    } else {
      this.isImportCost = false;
    }
    this.fileName = "";
  }

  downloadTemplateExcel() {
    this.saleBiddingService.downloadTemplateProduct().subscribe(response => {
      this.loading = false;
      const result = <any>response;
      if (result.templateExcel != null && result.statusCode === 202 || result.statusCode === 200) {
        const binaryString = window.atob(result.templateExcel);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let idx = 0; idx < binaryLen; idx++) {
          const ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        const fileName = result.fileName + ".xls";
        //const fileName = result.nameFile  + ".xlsx";
        link.download = fileName;
        link.click();
      }
    }, error => { this.loading = false; });
  }

  validateFile(data) {
    this.messErrFile = [];
    this.cellErrFile = [];

    data.forEach((row, i) => {
      if (i > 4) {
        if ((row[1] === null || row[1] === undefined || row[1].toString().trim() == "") && (row[2] === null || row[2] === undefined || row[2].toString().trim() == "")) {
          this.messErrFile.push('D??ng { ' + (i + 2) + ' } ch??a nh???p M?? sp ho???c T??n s???n ph???m!');
        }
        if (row[3] === null || row[3] === undefined || row[3] == "") {
          this.messErrFile.push('C???t s??? l?????ng t???i d??ng ' + (i + 2) + ' kh??ng ???????c ????? tr???ng');
        }
        else {
          if (parseFloat(row[3]) == undefined || parseFloat(row[3]).toString() == "NaN" || parseFloat(row[3]) == null) {
            this.messErrFile.push('C???t s??? l?????ng t???i d??ng ' + (i + 2) + ' sai ?????nh d???ng');
          }
        }
        if (row[4] === null || row[4] === undefined || row[4] == "") {
          this.messErrFile.push('C???t ????n gi?? t???i d??ng ' + (i + 2) + ' kh??ng ???????c ????? tr???ng');
        }
        else {
          if (parseFloat(row[4]) == undefined || parseFloat(row[4]).toString() == "NaN" || parseFloat(row[4]) == null) {
            this.messErrFile.push('C???t ????n gi?? t???i d??ng ' + (i + 2) + ' sai ?????nh d???ng');
          }
        }
      }
    });
    if (this.messErrFile.length != 0) return true;
    else return false;
  }

  importExcel() {
    if (this.fileName == "") {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "Ch??a ch???n file c???n nh???p" };
      this.showMessage(mgs);
    }
    else {
      const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(targetFiles.files[0]);

      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;

        const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        // ki???m tra form value v?? file excel c?? kh???p m?? v???i nhau hay kh??ng
        let customerCode = 'BOM Lines';
        if (workbook.Sheets[customerCode] === undefined) {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
          this.showMessage(mgs);
          return;
        }

        //l???y data t??? file excel c???a kh??ch h??ng doanh nghi???p
        const worksheetCompanyCustomer: XLSX.WorkSheet = workbook.Sheets[customerCode];
        /* save data */
        let dataCompanyCustomer: Array<any> = XLSX.utils.sheet_to_json(worksheetCompanyCustomer, { header: 1 });
        //remove header row
        dataCompanyCustomer.shift();
        let productCodeList: string[] = [];
        let productUnitList: string[] = [];
        let isValidation = this.validateFile(dataCompanyCustomer);
        if (isValidation) {
          this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = true;  //Hi???n th??? message l???i
          this.messErrFile.forEach(element => {
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: element };
            this.showMessage(mgs);
          });
        }
        else {
          this.isInvalidForm = false;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = false;  //Hi???n th??? message l???i
          dataCompanyCustomer.forEach((row, i) => {
            // L???y gi?? tr??? b???n ghi trong excel b???t ?????u t??? line 6
            if (i > 4 && row.length != 0) {
              if (row[1] !== null && row[1] !== undefined && row[1].trim() != "") {
                productCodeList.push(row[1])
              };
              if (row[5] !== null && row[5] !== undefined && row[5].trim() != "" &&
                (row[1] !== null && row[1] !== undefined && row[1].trim() != "")) {
                let isProduct = productUnitList.find(i => i.trim() == row[5].trim());
                if (isProduct == null || isProduct == undefined) {
                  productUnitList.push(row[5]);
                }
              };
            }
          });

          let countCode = this.productCodeSystemList.filter(c => productCodeList.includes(c));
          let countUnit = this.listProductUnitName.filter(u => productUnitList.includes(u));

          if (countCode.length == productCodeList.length && countUnit.length == productUnitList.length) {
            this.listCostsQuoteExcel = [];
            dataCompanyCustomer.forEach((row, i) => {
              // L???y gi?? tr??? b???n ghi trong excel b???t ?????u t??? line 6
              if (i > 4 && row.length != 0 && (
                (row[1] !== null && row[1] !== undefined && row[1].trim() != "") || (row[2] !== null && row[2] !== undefined && row[2].trim() != "") || (row[5] !== null && row[5] !== undefined && row[5].trim() != "")
              )
              ) {
                let newCustomer: CostsQuoteExcel = {
                  STT: row[0],
                  ProductCode: row[1],
                  ProductName: row[2],
                  Quantity: (row[3] === null || row[3] === undefined || row[3] == "") ? 0 : row[3],
                  UnitPrice: (row[4] === null || row[4] === undefined || row[4] == "") ? 0 : row[4],
                  CurrencyUnit: row[5],
                  Amount: (row[6] === null || row[6] === undefined || row[6] == "") ? 0 : row[6],
                  Tax: (row[7] === null || row[7] === undefined || row[7] == "") ? 0 : row[7],
                  TaxAmount: (row[8] === null || row[8] === undefined || row[8] == "") ? 0 : row[8],
                  DiscountType: row[9] == "%" ? true : false,
                  DiscountValue: (row[10] === null || row[10] === undefined || row[10] == "" || row[9] === null || row[9] === undefined || row[9].trim() == "") ? 0 : row[10],
                  TotalAmount: (row[11] === null || row[11] === undefined || row[11] == "") ? 0 : row[11]
                }
                this.listCostsQuoteExcel.push(newCustomer);
              }
            });
            // l???y ti???n VND
            var moneyUnit = this.listUnitMoney.find(c => c.categoryCode == "VND");

            this.listCostsQuoteExcel.forEach(item => {
              let detailProduct = new CostsQuocte();
              if (item.ProductCode == null || item.ProductCode.trim() == "" || item.ProductCode == undefined) {
                detailProduct.orderDetailType = 1;
                detailProduct.active = true;
                detailProduct.currencyUnit = moneyUnit.categoryId;
                detailProduct.discountType = item.DiscountType;
                detailProduct.exchangeRate = 1;
                detailProduct.incurredUnit = item.CurrencyUnit;
                detailProduct.nameMoneyUnit = moneyUnit.categoryCode;
                detailProduct.description = item.ProductName;
                detailProduct.productName = null;
                detailProduct.quantity = item.Quantity;
                detailProduct.unitPrice = item.UnitPrice;
                detailProduct.vat = item.Tax;
                detailProduct.discountValue = item.DiscountValue;
                detailProduct.sumAmount = item.TotalAmount;
                detailProduct.saleBiddingDetailProductAttribute = [];
                if (this.isImportCost) {
                  this.listCostsQuote.push(detailProduct);
                  this.caculatorMoneyCost();

                } else {
                  this.listQuocteDetail.push(detailProduct);
                  this.caculatorMoneyQuocte();
                }
              }
              else {
                detailProduct.orderDetailType = 0;
                detailProduct.active = true;
                detailProduct.currencyUnit = moneyUnit.categoryId;
                detailProduct.discountType = item.DiscountType;
                detailProduct.exchangeRate = 1;
                detailProduct.incurredUnit = "CCCCC";
                detailProduct.nameMoneyUnit = moneyUnit.categoryCode;
                detailProduct.description = "";

                detailProduct.quantity = item.Quantity;
                detailProduct.unitPrice = item.UnitPrice;
                detailProduct.vat = item.Tax;
                detailProduct.discountValue = item.DiscountValue;
                detailProduct.sumAmount = item.TotalAmount;

                let product = this.listProduct.find(p => p.productCode.trim() == item.ProductCode.trim());
                detailProduct.productId = product.productId;
                detailProduct.productName = product.productName;
                detailProduct.productCode = product.productCode;

                //L???y ????n v??? t??nh
                let productUnitId = product.productUnitId;
                let productUnitName = this.listUnitProduct.find(x => x.categoryId == productUnitId).categoryName;
                detailProduct.productNameUnit = productUnitName;
                detailProduct.unitId = productUnitId;
                detailProduct.saleBiddingDetailProductAttribute = [];


                //L???y list nh?? cung c???p
                this.saleBiddingService.getVendorByProductId(product.productId).subscribe(response => {
                  let result: any = response;
                  if (result.statusCode == 200) {
                    let listVendor = result.listVendor;
                    /*N???u listVendor ch??? c?? 1 gi?? tr??? duy nh???t th?? l???y lu??n gi?? tr??? ???? l??m default value*/
                    if (listVendor.length == 1) {
                      let toSelectVendor = listVendor[0];
                      detailProduct.vendorId = toSelectVendor.vendorId;
                      detailProduct.nameVendor = toSelectVendor.vendorCode + " - " + toSelectVendor.vendorName;
                      // this.vendorControl.setValue(toSelectVendor);
                    }

                    /*End*/
                  } else {
                    let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
                    this.showMessage(msg);
                  }
                  if (this.isImportCost) {
                    this.listCostsQuote.push(detailProduct);
                    this.caculatorMoneyCost();
                  } else {
                    this.listQuocteDetail.push(detailProduct);
                    this.caculatorMoneyQuocte();

                  }
                  this.cancelFile();
                });
                this.isInvalidForm = false;  //Hi???n th??? icon-warning-active
                this.isOpenNotifiError = false;  //Hi???n th??? message l???i
                this.cancelFile();
                //set gi?? tr??? cho ????n gi?? n???u s???n ph???m c?? gi?? tr??? ????n gi??(price1)
                if (product.price1 != null) {
                  // this.priceProductControl.setValue(product.price1.toString());
                }

              }
            })
          }
          if (countCode.length != productCodeList.length) {
            this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = true;  //Hi???n th??? message l???i
            this.messErrFile.push('M?? s???n ph???m kh??ng c?? t???n t???i trong h??? th???ng')
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "M?? s???n ph???m kh??ng c?? t???n t???i trong h??? th???ng" };
            this.showMessage(mgs);
          }
          if (countUnit.length != productUnitList.length) {
            this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = true;  //Hi???n th??? message l???i
            this.messErrFile.push('????n v??? t??nh kh??ng c?? t???n t???i trong h??? th???ng')
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "????n v??? t??nh kh??ng c?? t???n t???i trong h??? th???ng" };
            this.showMessage(mgs);
          }
        }
        this.cancelFile();
        this.displayDialogImport = false;
      }
    }
  }

  cancel() {
    this.router.navigate(['/sale-bidding/list']);
  }

  cancelFile() {
    $("#importFileProduct").val("")
    this.fileName = "";
  }

  exportExcel(number) {
    let isExport = true;
    if (number == 1 && this.listCostsQuote.length == 0) {
      isExport = false;
    } else if (number == 2 && this.listQuocteDetail.length == 0) {
      isExport = false;
    }
    if (!isExport) {
      this.confirmationService.confirm({
        message: 'Kh??ng c?? s???n ph???m n??o b???n c?? mu???n xu???t excel kh??ng?',
        accept: () => {
          this.exportFileExcel(number);
        }
      });
    }
    else {
      this.exportFileExcel(number);
    }

  }

  exportFileExcel(number) {
    let dateUTC = new Date();
    // getMonth() tr??? v??? index trong m???ng n??n c???n c???ng th??m 1
    let title = "Danh s??ch s???n ph???m d???ch v??? " + dateUTC.getDate() + '_' + (dateUTC.getMonth() + 1) + '_' + dateUTC.getUTCFullYear();
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('BOM Lines');
    worksheet.pageSetup.margins = {
      left: 0.25, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.pageSetup.paperSize = 9;  //A4 : 9

    let dataRow1 = [];
    dataRow1[1] = `    `
    let row1 = worksheet.addRow(dataRow1);
    row1.font = { name: 'Arial', size: 18, bold: true };
    row1.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };

    let dataRow2 = [];
    dataRow2[1] = `    `
    dataRow2[5] = `Danh s??ch BOM h??ng h??a
    (BOM Line)`
    let row2 = worksheet.addRow(dataRow2);
    row2.font = { name: 'Arial', size: 18, bold: true };
    worksheet.mergeCells(`E${row2.number}:H${row2.number}`);
    row2.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };

    worksheet.addRow([]);

    let dataRow4 = [];
    dataRow4[2] = `- C??c c???t m??u ????? l?? c??c c???t b???t bu???c nh???p
    - C??c c???t c?? k?? hi???u (*) l?? c??c c???t b???t bu???c nh???p theo ??i???u ki???n`
    let row4 = worksheet.addRow(dataRow4);
    row4.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    row4.alignment = { vertical: 'bottom', horizontal: 'left', wrapText: true };

    worksheet.addRow([]);

    /* Header row */
    let dataHeaderRow = ['STT', 'M?? s???n ph???m', 'T??n s???n ph???m/M?? t???', 'S??? l?????ng', '????n gi??', '????n v??? t??nh', 'Th??nh ti???n (VND)', `Thu??? su???t`, `Ti???n thu???`, 'Lo???i chi???t kh???u', 'Chi???t kh???u', 'T???ng ti???n'];
    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: 'Arial', size: 10, bold: true };
    dataHeaderRow.forEach((item, index) => {
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      if (index + 1 == 4 || index + 1 == 5) {
        headerRow.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'ff0000' }
        };
      }
      else {
        headerRow.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '8DB4E2' }
        };
      }
    });
    headerRow.height = 40;
    if (number == 1) {
      this.listCostsQuote.forEach((item, index) => {
        let productCode = "";
        let productName = "";
        let productQuantity = item.quantity;
        let productPriceAmount = item.unitPrice;
        let productUnit = item.productNameUnit;
        let productAmount = productQuantity * productPriceAmount;
        let productVat = item.vat;
        let productAmountVat = (productAmount * productVat) / 100;
        let productDiscountType = item.discountType ? "%" : "Ti???n";
        let productDiscountValue = item.discountValue;
        let productSumAmount = item.sumAmount;
        if (item.productId !== null) {
          productCode = this.listProduct.find(p => p.productId == item.productId).productCode;
          productName = item.productName;
        }
        else {
          productName = item.description;
          productUnit = item.incurredUnit
        }

        /* Header row */
        let dataHeaderRowIndex = [index + 1, productCode, productName, productQuantity, productPriceAmount, productUnit, productAmount, productVat, productAmountVat, productDiscountType, productDiscountValue, productSumAmount];
        let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
        headerRowIndex.font = { name: 'Arial', size: 10 };
        dataHeaderRowIndex.forEach((item, index) => {
          // headerRowIndex.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          headerRowIndex.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          if (index == 1 || index == 2 || index == 5 || index == 9) {
            headerRowIndex.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: 'left' };
          }
          if (index == 3 || index == 4 || index == 6 || index == 7 || index == 8 || index == 10 || index == 11) {
            headerRowIndex.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: 'right' };
          }
        });
        // headerRowIndex.height = 40;
      });
    }
    else {
      this.listQuocteDetail.forEach((item, index) => {
        let productCode = "";
        let productName = "";
        let productQuantity = item.quantity;
        let productPriceAmount = item.unitPrice;
        let productUnit = item.productNameUnit;
        let productAmount = productQuantity * productPriceAmount;
        let productVat = item.vat;
        let productAmountVat = (productAmount * productVat) / 100;
        let productDiscountType = item.discountType ? "%" : "Ti???n";
        let productDiscountValue = item.discountValue;
        let productSumAmount = item.sumAmount;
        if (item.productId !== null) {
          productCode = this.listProduct.find(p => p.productId == item.productId).productCode;
          productName = item.productName;
        }
        else {
          productName = item.description;
          productUnit = item.incurredUnit
        }

        /* Header row */
        let dataHeaderRowIndex = [index + 1, productCode, productName, productQuantity, productPriceAmount, productUnit, productAmount, productVat, productAmountVat, productDiscountType, productDiscountValue, productSumAmount];
        let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
        headerRowIndex.font = { name: 'Arial', size: 10 };
        dataHeaderRowIndex.forEach((item, index) => {
          // headerRowIndex.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          headerRowIndex.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          if (index == 1 || index == 2 || index == 5 || index == 9) {
            headerRowIndex.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: 'left' };
          }
          if (index == 3 || index == 4 || index == 6 || index == 7 || index == 8 || index == 10 || index == 11) {
            headerRowIndex.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: 'right' };
          }
        });
        // headerRowIndex.height = 40;
      });
    }


    worksheet.addRow([]);
    worksheet.getRow(2).height = 47;
    worksheet.getRow(4).height = 70;
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 25;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 25;
    worksheet.getColumn(6).width = 25;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(8).width = 25;
    worksheet.getColumn(9).width = 25;
    worksheet.getColumn(10).width = 25;
    worksheet.getColumn(11).width = 25;
    worksheet.getColumn(12).width = 25;

    worksheet.getColumn(5).numFmt = '#,##0.00';
    worksheet.getColumn(7).numFmt = '#,##0.00';
    worksheet.getColumn(9).numFmt = '#,##0.00';
    worksheet.getColumn(11).numFmt = '#,##0.00';
    worksheet.getColumn(12).numFmt = '#,##0.00';

    this.exportToExel(workbook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  addCategory() {
    let saleBiddingDetail: SaleBiddingDetail = new SaleBiddingDetail();
    let isAdd = true;
    if (this.saleBiddingDetail.category == null || this.saleBiddingDetail.category == "" || this.saleBiddingDetail.category.trim().length == 0) {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "H???ng m???c kh??ng ???????c ????? tr???ng" };
      this.showMessage(mgs);
      isAdd = false;
    }
    if (this.saleBiddingDetail.content == null || this.saleBiddingDetail.content == "" || this.saleBiddingDetail.content.trim().length == 0) {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "N???i dung kh??ng ???????c ????? tr???ng" };
      this.showMessage(mgs);
      isAdd = false;
    }
    if (isAdd) {
      saleBiddingDetail.category = this.saleBiddingDetail.category;
      saleBiddingDetail.content = this.saleBiddingDetail.content;
      saleBiddingDetail.note = "";
      saleBiddingDetail.file = new Array<File>();
      this.uploadedFiles.forEach(item => {
        saleBiddingDetail.file.push(item);
      });
      let index = 0;
      if (this.listCategory.length == 0) {
        index = 0;
      }
      else {
        index = this.listCategory.sort(x => x.index)[this.listCategory.length - 1].index + 1;
      }
      saleBiddingDetail.index = index;
      this.listCategory.push(saleBiddingDetail);
      this.saleBiddingDetail = new SaleBiddingDetail();
      this.uploadedFiles = [];
      this.fileUpload.files = [];
    }
  }

  cancelNoteEdit() {
    this.saleBiddingDetail = new SaleBiddingDetail();
    this.isAddCategory = true;
    this.isEditCategory = false;
    this.uploadedFiles = [];
    this.fileUpload.files = [];
  }

  deleteNoteFile(data) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.saleBiddingDetail.listFile = this.saleBiddingDetail.listFile.filter(x => x.fileInFolderId != data.fileInFolderId);
      }
    });
  }

  downloadNoteFile(data: FileInFolder) {
    this.folderService.downloadFile(data.fileInFolderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
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
            anchor.download = data.fileName.substring(0, data.fileName.lastIndexOf('_')) + "." + data.fileExtension;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  saveCategory() {
    let saleBiddingDetail: SaleBiddingDetail = new SaleBiddingDetail();
    let isSave = true;
    if (this.saleBiddingDetail.category == null || this.saleBiddingDetail.category == "" || this.saleBiddingDetail.category.trim().length == 0) {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "H???ng m???c kh??ng ???????c ????? tr???ng" };
      this.showMessage(mgs);
      isSave = false;
    }
    if (this.saleBiddingDetail.content == null || this.saleBiddingDetail.content == "" || this.saleBiddingDetail.content.trim().length == 0) {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "N???i dung kh??ng ???????c ????? tr???ng" };
      this.showMessage(mgs);
      isSave = false;
    }
    if (isSave) {
      saleBiddingDetail.index = this.saleBiddingDetail.index;
      saleBiddingDetail.category = this.saleBiddingDetail.category;
      saleBiddingDetail.content = this.saleBiddingDetail.content;
      saleBiddingDetail.listFile = this.saleBiddingDetail.listFile;
      saleBiddingDetail.file = new Array<File>();
      this.uploadedFiles.forEach(item => {
        saleBiddingDetail.file.push(item);
      });

      let new_data = this.listCategory.find(x => x.index == saleBiddingDetail.index);
      new_data.category = saleBiddingDetail.category;
      new_data.content = saleBiddingDetail.content;
      new_data.note = saleBiddingDetail.note;
      new_data.file = saleBiddingDetail.file;
      new_data.listFile = saleBiddingDetail.listFile;
      this.listCategory = [...this.listCategory];
      this.saleBiddingDetail = new SaleBiddingDetail();
      this.uploadedFiles = [];
      this.fileUpload.files = [];

      this.isEditCategory = false;
      this.isAddCategory = true;

      let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: "C???p nh???t th??nh c??ng" };
      this.showMessage(mgs);
    }
  }

  removeCategory(data: SaleBiddingDetail) {
    this.listCategory = this.listCategory.filter(x => x.index != data.index);
  }

  editCategory(data: SaleBiddingDetail) {
    this.isAddCategory = false;
    this.isEditCategory = true;
    this.saleBiddingDetail.content = data.content;
    this.saleBiddingDetail.category = data.category;
    this.saleBiddingDetail.index = data.index;
    this.saleBiddingDetail.file = new Array<File>();
    this.saleBiddingDetail.listFile = data.listFile;
    if (data.file != null) {
      data.file.forEach(item => {
        this.fileUpload.files.push(item);
        this.uploadedFiles.push(item);
        this.saleBiddingDetail.file.push(item);
      });
    }
  }

  /*T??nh s??? th???ng k?? tab Chi ti???t CP ?????u v??o*/
  caculatorMoneyCost() {
    let index = 0;
    //Ti???n thu???
    this.sumCostVAT = 0;

    //Gi?? tr??? tr?????c thu???
    this.sumMoneyCostBeforVAT = 0;

    //Gi?? tr??? sau thu???
    this.sumCostMoneyAfterVAT = 0;

    this.listCostsQuote.forEach(item => {
      let cacuDiscount = 0
      let caculateVAT: number = 0;
      let price = item.quantity * item.unitPrice * item.exchangeRate;
      let unitLabor = item.unitLaborNumber * item.unitLaborPrice * item.exchangeRate;
      item.index = index + 1;

      if (item.discountValue != null) {
        if (item.discountType == true) {
          cacuDiscount = (((price + unitLabor) * item.discountValue) / 100);
        }
        else {
          cacuDiscount = item.discountValue;
        }
      }

      if (item.vat != null) {
        caculateVAT = ((price + unitLabor - cacuDiscount) * item.vat) / 100;
      }

      this.sumMoneyCostBeforVAT = this.sumMoneyCostBeforVAT + price + unitLabor - cacuDiscount;
      item.taxMoney = caculateVAT;
      this.sumCostVAT = this.sumCostVAT + caculateVAT;
      item.sumAmount = price + unitLabor + caculateVAT - cacuDiscount;
      this.sumCostMoneyAfterVAT = this.sumCostMoneyAfterVAT + price + unitLabor - cacuDiscount + caculateVAT;
      index++;
    });

    if (this.listQuocteDetail.length == 0 || this.listCostsQuote.length == 0) {
      this.ROS = 0;
      this.provisionalGrossProfit = 0;
    } else {
      this.ROS = this.roundNumber((this.sumQuocteMoneyAfterVAT - this.sumCostMoneyAfterVAT) * 100 / this.sumQuocteMoneyAfterVAT, 2);
      this.provisionalGrossProfit = this.sumQuocteMoneyAfterVAT - this.sumCostMoneyAfterVAT;
    }
  }

  /*T??nh s??? th???ng k?? tab Chi ti???t b??o gi??*/
  caculatorMoneyQuocte() {
    let index = 0;
    //Ti???n thu???
    this.sumQuocteVAT = 0;

    //Gi?? tr??? sau thu???
    this.sumQuocteMoneyAfterVAT = 0;

    //Gi?? tr??? tr?????c thu???
    this.sumMoneyQuoteBeforVAT = 0;

    this.listQuocteDetail.forEach(item => {
      let cacuDiscount = 0
      let caculateVAT: number = 0;
      let price = item.quantity * item.unitPrice * item.exchangeRate;
      let unitLabor = item.unitLaborNumber * item.unitLaborPrice * item.exchangeRate;
      item.index = index + 1;

      if (item.discountValue != null) {
        if (item.discountType == true) {
          cacuDiscount = (((price + unitLabor) * item.discountValue) / 100);
        }
        else {
          cacuDiscount = item.discountValue;
        }
      }

      if (item.vat != null) {
        caculateVAT = ((price + unitLabor - cacuDiscount) * item.vat) / 100;
      }

      item.sumAmount = price + unitLabor + caculateVAT - cacuDiscount;
      this.sumMoneyQuoteBeforVAT = this.sumMoneyQuoteBeforVAT + price + unitLabor - cacuDiscount;
      item.taxMoney = caculateVAT;
      this.sumQuocteVAT = this.sumQuocteVAT + caculateVAT;
      this.sumQuocteMoneyAfterVAT = this.sumQuocteMoneyAfterVAT + price + unitLabor - cacuDiscount + caculateVAT;
      index++;
    });

    if (this.listQuocteDetail.length == 0 || this.listCostsQuote.length == 0) {
      this.ROS = 0;
      this.provisionalGrossProfit = 0;
    } else {
      if (this.sumQuocteMoneyAfterVAT == 0) {
        this.ROS = 0;
      } else {
        this.ROS = this.roundNumber((this.sumQuocteMoneyAfterVAT - this.sumCostMoneyAfterVAT) * 100 / this.sumQuocteMoneyAfterVAT, 2);
      }
      this.provisionalGrossProfit = this.sumQuocteMoneyAfterVAT - this.sumCostMoneyAfterVAT;
    }
  }

  updateStatusSaleBidding(type: number) {
    let isUpdateStatus: boolean = false;
    let statusId: string = "";
    let listSaleBiddingUpdate: Array<StatusSaleBiddingModel> = [];
    let saleBiddingUpdate: StatusSaleBiddingModel = new StatusSaleBiddingModel();
    // ?????i tr???ng th??i h??? s?? th???u sang h???y
    if (type == 0) {
      // X??t tr???ng th??i h??? s?? th???u
      let status = this.listStatusSaleBidding.find(x => x.categoryCode == "CANC");
      statusId = status.categoryId;
      isUpdateStatus = true;
    }
    // ?????i tr???ng th??i h??? s?? th???u sang m???i
    else if (type == 1) {
      let status = this.listStatusSaleBidding.find(x => x.categoryCode == "NEW");
      statusId = status.categoryId;
      isUpdateStatus = true;
    }
    // ?????i tr???ng th??i h??? s?? th???u sang y??u c???u ph?? duy???t
    else if (type == 2) {
      let status = this.listStatusSaleBidding.find(x => x.categoryCode == "CHO");
      statusId = status.categoryId;
      isUpdateStatus = true;
    }
    else if (type == 3) {
      if (this.reasonRefuse == null || this.reasonRefuse.trim().length == 0) {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "B???n ch??a nh???p l?? do t??? ch???i" };
        this.showMessage(mgs);
      } else {
        let status = this.listStatusSaleBidding.find(x => x.categoryCode == "REFU");
        statusId = status.categoryId;
        isUpdateStatus = true;
        this.displayDialogStatus = false;
      }
    }
    else if (type == 4) {
      let status = this.listStatusSaleBidding.find(x => x.categoryCode == "APPR");
      statusId = status.categoryId;
      isUpdateStatus = true;

    }
    else if (type == 5) {
      let status = this.listStatusSaleBidding.find(x => x.categoryCode == "LOSE");
      statusId = status.categoryId;
      isUpdateStatus = true;
    }
    if (isUpdateStatus) {
      this.loading = true;
      saleBiddingUpdate.note = this.reasonRefuse;
      saleBiddingUpdate.saleBiddingId = this.saleBiddingId;
      saleBiddingUpdate.statusId = statusId;
      listSaleBiddingUpdate.push(saleBiddingUpdate);
      this.saleBiddingService.updateStatusSaleBidding(listSaleBiddingUpdate).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.displayDialogStatus = false;
          this.displayDialogStatusAppr = false;
          let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: "S???a tr???ng th??i th??nh c??ng" };
          this.showMessage(mgs);
          let status = this.listStatusSaleBidding.find(x => x.categoryId == statusId);
          this.statusSaleBidding = status;
          if (type == 0) {
            this.activeIndex = 6;
          }
          else if (type == 1) {
            this.activeIndex = 0;
          }
          else if (type == 2) {
            this.activeIndex = 1;
          }
          else if (type == 3) {
            this.activeIndex = 2;

          }
          else if (type == 4) {
            this.activeIndex = 3;
          }
          else if (type == 4) {
            this.activeIndex = 4;
          }
          let note: Note = result.note;
          this.noteHistory.push(note);
          this.handleNoteContent();

          this.reasonRefuse = "";

          this.getMasterData();
        }
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(mgs);
        }
      });
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  showDialogQuoteVendor() {
    if (this.statusSaleBidding.categoryCode === 'NEW') {
      var listQuoteVendor: Array<CostsQuocte> = [];
      this.listCostsQuote.forEach(item => {
        let obj: CostsQuocte = new CostsQuocte();
        obj.costsQuocteId = item.costsQuocteId;
        obj.vendorId = item.vendorId;
        obj.saleBiddingId = item.saleBiddingId;
        obj.productId = item.productId;
        obj.productName = item.productName;
        obj.description = item.description;
        obj.quantity = item.quantity;
        obj.unitPrice = item.unitPrice;
        obj.currencyUnit = item.currencyUnit;
        obj.exchangeRate = item.exchangeRate;
        obj.vat = item.vat;
        obj.discountType = item.discountType;
        obj.discountValue = item.discountValue;
        obj.description = item.description;
        obj.orderDetailType = item.orderDetailType;
        obj.unitId = item.unitId;
        obj.active = item.active;
        obj.explainStr = item.productName;
        obj.createdById = item.createdById;
        obj.createdDate = item.createdDate;
        obj.updatedById = item.updatedById;
        obj.updatedDate = item.updatedDate;
        obj.saleBiddingDetailProductAttribute = item.saleBiddingDetailProductAttribute;
        obj.nameVendor = item.nameVendor;
        obj.productNameUnit = item.productNameUnit;
        obj.nameMoneyUnit = item.nameMoneyUnit;
        obj.sumAmount = item.sumAmount;
        obj.amountDiscount = item.amountDiscount;

        if (item.orderDetailType == 0) {
          obj.incurredUnit = this.listProduct.find(p => p.productId == item.productId).productCode;
        }
        else {
          obj.incurredUnit = "";
          obj.explainStr = item.description;
          obj.description = "";
        }

        listQuoteVendor.push(obj);
      });

      let ref = this.dialogService.open(SaleBiddingVendorDialogComponent, {
        data: {
          listCostsQuocteModel: listQuoteVendor,
          saleBiddingId: this.saleBiddingId
        },
        header: 'T???o ????? ngh??? b??o gi?? nh?? cung c???p',
        width: '70%',
        baseZIndex: 1030,
        contentStyle: {
          "min-height": "280px",
          "max-height": "600px",
          "overflow": "auto"
        }
      });

      ref.onClose.subscribe((result: ResultDialog) => {
        if (result) {
          if (result.status) {
            this.restartCustomerOrderDetailModel();
          }
        }
      });
    }
  }

  // Ch??m s??c kh??ch h??ng

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

    //Ki???m tra n???u l?? th??ng hi???n t???i v?? n??m hi???n t???i th?? kh??ng next ti???p
    if (current_month != ((new Date).getMonth() + 1) || this.year != (new Date).getFullYear()) {
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
  }

  getHistoryCustomerCare(month: number, year: number) {
    this.loading = true;
    this.customerService.getHistoryCustomerCare(month, year, this.salebiddingModel.customerId).subscribe(response => {
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
        customerId: this.salebiddingModel.customerId,
        disableEmail: false
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

          if(listInvalidEmail.length > 0){
            this.confirmationService.confirm({
              message: message,
              rejectVisible: false,
            });
          }

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'G???i email th??nh c??ng' };
          this.showMessage(msg);
        }
      }
    });
  }

  send_quick_sms() {
    let ref = this.dialogService.open(TemplateQuickSmsComponent, {
      data: {
        sendTo: this.contactModel.Phone,
        customerId: this.salebiddingModel.customerId
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
        customerId: this.salebiddingModel.customerId
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
        this.customerService.getDataPreviewCustomerCare('SMS', this.salebiddingModel.customerId, week.customerCareId).subscribe(response => {
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
        // this.customerService.getDataPreviewCustomerCare('Email', this.salebiddingModel.customerId, week.customerCareId).subscribe(response => {
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
            customerId: this.salebiddingModel.customerId
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
        this.customerService.getDataCustomerCareFeedBack(week.customerCareId, this.salebiddingModel.customerId).subscribe(response => {
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
        this.customerService.getDataCustomerCareFeedBack(week.customerCareId, this.salebiddingModel.customerId).subscribe(response => {
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
      this.customerCareFeedBack.customerId = this.salebiddingModel.customerId;

      this.loading = true;
      this.awaitSaveFeedBack = true;
      this.customerService.saveCustomerCareFeedBack(this.customerCareFeedBack).subscribe(response => {
        let result1: any = response;

        if (result1.statusCode == 200) {
          let month = parseFloat(this.month);
          this.customerService.getHistoryCustomerCare(month, this.year, this.salebiddingModel.customerId).subscribe(response => {
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
  removeCustomerMeeting(week: CustomerMeetingForWeek){
    if(week){
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
    this.customerService.getHistoryCustomerMeeting(month, year, this.salebiddingModel.customerId).subscribe(response => {
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
        customerId: this.salebiddingModel.customerId,
        customerMeetingId: null,
        listParticipants: this.listEmployeeJoin,
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
        customerId: this.salebiddingModel.customerId,
        customerMeetingId: week.customerMeetingId,
        listParticipants: this.listEmployeeJoin,
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

  // Event thay ?????i n???i dung ghi ch??
  currentTextChange: string = '';
  changeNoteContent(event) {
    let htmlValue = event.htmlValue;
    this.currentTextChange = event.textValue;
  }

  cancelNote() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c mu???n h???y ghi ch?? n??y?',
      accept: () => {
        this.noteId = null;
        this.noteContent = null;
        this.uploadedNoteFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();
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
    if (this.uploadedNoteFiles.length > 0) {
      let listFileNameExists: Array<FileNameExists> = [];
      let result: any = await this.imageService.uploadFileForOptionAsync(this.uploadedNoteFiles, 'HST');

      listFileNameExists = result.listFileNameExists;

      for (var x = 0; x < this.uploadedNoteFiles.length; ++x) {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = this.uploadedNoteFiles[x].name;
        let fileExists = listFileNameExists.find(f => f.oldFileName == this.uploadedNoteFiles[x].name);
        if (fileExists) {
          noteDocument.DocumentName = fileExists.newFileName;
        }
        noteDocument.DocumentSize = this.uploadedNoteFiles[x].size.toString();
        this.listNoteDocumentModel.push(noteDocument);
      }
    }
    let noteModel = new NoteModel();
    if (!this.noteId) {
      /*T???o m???i ghi ch??*/
      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.salebiddingModel.saleBiddingId;
      noteModel.ObjectType = 'HST';
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi ch??*/
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.salebiddingModel.saleBiddingId;
      noteModel.ObjectType = 'HST';
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();

      //Th??m file c?? ???? l??u n???u c??
      this.listUpdateNoteDocument.forEach(item => {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = item.documentName;
        noteDocument.DocumentSize = item.documentSize;
        noteDocument.UpdatedById = item.updatedById;
        noteDocument.UpdatedDate = item.updatedDate;

        this.listNoteDocumentModel.push(noteDocument);
      });
    }
    if (noteModel.Description == "" && this.listNoteDocumentModel.length == 0) {

      this.loading = false;
      return;
    }

    this.noteService.createNoteForSaleBiddingDetail(noteModel, this.listNoteDocumentModel).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedNoteFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();  //X??a to??n b??? file trong control
        }
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;

        /*Reshow Time Line*/
        this.noteHistory = result.listNote;
        this.handleNoteContent();
        let messageCode = "Th??m ghi ch?? th??nh c??ng";
        let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: messageCode };
        this.showMessage(mgs);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
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

  /* Event th??m file d?????c ch???n v??o list file note */
  handleNoteFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= 10000000) {
        if (type.indexOf('/') != -1) {
          type = type.slice(0, type.indexOf('/'));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedNoteFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf('.'));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedNoteFiles.push(file);
          }
        }
      }
    }
  }

  /*Event khi click x??a t???ng file */
  removeNoteFile(event) {
    let index = this.uploadedNoteFiles.indexOf(event.file);
    this.uploadedNoteFiles.splice(index, 1);
  }

  /*Event khi click x??a to??n b??? file */
  clearAllNoteFile() {
    this.uploadedNoteFiles = [];
  }

  /* Chuy???n item l??n m???t c???p */
  moveUp(data: CostsQuocte) {
    let currentOrderNumber = data.orderNumber;
    let preOrderNumber = currentOrderNumber - 1;
    let pre_data = this.listCostsQuote.find(x => x.orderNumber == preOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    pre_data.orderNumber = currentOrderNumber;
    data.orderNumber = preOrderNumber;

    //X??a 2 item
    this.listCostsQuote = this.listCostsQuote.filter(x =>
      x.orderNumber != preOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listCostsQuote = [...this.listCostsQuote, pre_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listCostsQuote.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Chuy???n item xu???ng m???t c???p */
  moveDown(data: CostsQuocte) {
    let currentOrderNumber = data.orderNumber;
    let nextOrderNumber = currentOrderNumber + 1;
    let next_data = this.listCostsQuote.find(x => x.orderNumber == nextOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    next_data.orderNumber = currentOrderNumber;
    data.orderNumber = nextOrderNumber;

    //X??a 2 item
    this.listCostsQuote = this.listCostsQuote.filter(x =>
      x.orderNumber != nextOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listCostsQuote = [...this.listCostsQuote, next_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listCostsQuote.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Chuy???n item l??n m???t c???p */
  moveUpQuocteDetail(data: CostsQuocte) {
    let currentOrderNumber = data.orderNumber;
    let preOrderNumber = currentOrderNumber - 1;
    let pre_data = this.listQuocteDetail.find(x => x.orderNumber == preOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    pre_data.orderNumber = currentOrderNumber;
    data.orderNumber = preOrderNumber;

    //X??a 2 item
    this.listQuocteDetail = this.listQuocteDetail.filter(x =>
      x.orderNumber != preOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listQuocteDetail = [...this.listQuocteDetail, pre_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listQuocteDetail.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Chuy???n item xu???ng m???t c???p */
  moveDownQuocteDetail(data: CostsQuocte) {
    let currentOrderNumber = data.orderNumber;
    let nextOrderNumber = currentOrderNumber + 1;
    let next_data = this.listQuocteDetail.find(x => x.orderNumber == nextOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    next_data.orderNumber = currentOrderNumber;
    data.orderNumber = nextOrderNumber;

    //X??a 2 item
    this.listQuocteDetail = this.listQuocteDetail.filter(x =>
      x.orderNumber != nextOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listQuocteDetail = [...this.listQuocteDetail, next_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listQuocteDetail.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

}

//So s??nh gi?? tr??? nh???p v??o v???i m???t gi?? tr??? x??c ?????nh
function compareNumberValidator(number: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (parseFloat(control.value.replace(/,/g, '')) > number)) {
      return { 'numberInvalid': true };
    }
    return null;
  };
}

//Kh??ng ???????c nh???p ch??? c?? kho???ng tr???ng
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

//So s??nh gi?? tr??? nh???p v??o c?? thu???c kho???ng x??c ?????nh hay kh??ng?
function ageRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (isNaN(control.value) || control.value < min || control.value > max)) {
      return { 'ageRange': true };
    }
    return null;
  };
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
