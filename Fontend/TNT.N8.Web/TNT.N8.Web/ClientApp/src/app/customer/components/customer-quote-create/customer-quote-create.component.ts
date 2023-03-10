import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { NumberToStringPipe } from '../../../shared/ConvertMoneyToString/numberToString.pipe';
import { saveAs } from "file-saver";
import { Workbook } from 'exceljs';
import { DecimalPipe } from '@angular/common';
import * as $ from 'jquery';
import * as XLSX from 'xlsx';

/** PRIMENG */
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';

/** MODEL */
import { QuoteCostDetail } from '../../models/quote-cost-detail.model';
import { PromotionObjectApply } from '../../../promotion/models/promotion-object-apply.model';
import { PromotionApply } from '../../../promotion/models/promotion-apply.model';
import { PromotionObjectApplyMapping } from '../../../promotion/models/promotion-object-apply-mapping.model';
import { QuotePlanModel } from '../../models/quote-plan.model';
import { QuotePaymentTerm } from '../../models/quote-payment-term.model';
import { Quote } from '../../models/quote.model';
import { QuoteDetail } from "../../models/quote-detail.model";
import { QuoteDocument } from "../../models/quote-document.model";
import { QuoteProductDetailProductAttributeValue } from "../../models/quote-product-detail-product-attribute-value.model";

//SERVICES
import { BankService } from '../../../shared/services/bank.service';
import { QuoteService } from '../../services/quote.service';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { ProductService } from '../../../product/services/product.service';
import { PromotionService } from '../../../promotion/services/promotion.service';
import { ContactService } from '../../../shared/services/contact.service';


//DIALOG COMPONENT
import { AddEditProductDialogComponent } from '../add-edit-product-dialog/add-edit-product-dialog.component';
import { GetPermission } from '../../../shared/permission/get-permission';
import { PopupAddEditCostQuoteDialogComponent } from '../../../shared/components/add-edit-cost-quote/add-edit-cost-quote.component';
import { PromotionApplyPopupComponent } from '../../../shared/components/promotion-apply-popup/promotion-apply-popup.component';
import { QuoteScopeModel } from '../../models/QuoteScopeModel';


interface Customer {
  customerId: string;
  sheetName: string;
  customerName: string;
  sheetNameName: string;
  customerEmail: string;
  customerPhone: string;
  fullAddress: string;
  customerGroupId: string;
  maximumDebtDays: number;
  maximumDebtValue: number;
  personInChargeId: string;
  customerCodeName: string;
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeCodeName: string;
  isManager: boolean;
  positionId: string;
  organizationId: string;
}

interface Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isDefault: boolean;
}

interface DiscountType {
  name: string;
  code: string;
  value: boolean;
}

interface BankAccount {
  bankAccountId: string;
  bankName: string; //Ng??n h??ng
  accountNumber: string;  //S??? t??i kho???n
  branchName: string; //Chi nh??nh
  accountName: string; //Ch??? t??i kho???n
  labelShow: string; //Text hi???n th??? tr??n giao di???n
}

interface ResultDialog {
  status: boolean,  //L??u th?? true, H???y l?? false
  quoteDetailModel: QuoteDetail,
}

interface ResultCostDialog {
  status: boolean,  //L??u th?? true, H???y l?? false
  quoteDetailModel: QuoteCostDetail,
}

interface AdditionalInformation {
  ordinal: number,
  additionalInformationId: string,
  objectId: string,
  objectType: string,
  title: string,
  content: string,
  active: boolean,
  createdDate: Date,
  createdById: string,
  updatedDate: Date,
  updatedById: string,
  orderNumber: number,
}

interface QuoteDetailExcel {
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

@Component({
  selector: 'app-customer-quote-create',
  templateUrl: './customer-quote-create.component.html',
  styleUrls: ['./customer-quote-create.component.css'],
  providers: [
    DecimalPipe
  ]
})
export class CustomerQuoteCreateComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i

  fixed: boolean = false;
  withFiexd: string = "";
  withFiexdCol: string = "";
  withColCN: number = 0;
  withCol: number = 0;
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
      var colT = 0;
      if (this.withColCN != width) {
        colT = this.withColCN - width;
        this.withColCN = width;
        this.withCol = $('#parentTH').width();
      }
      this.withFiexdCol = (this.withCol) + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
      this.withCol = $('#parentTH').width();
      this.withColCN = $('#parent').width();
      this.withFiexdCol = "";
    }
  }

  /*Get Global Parameter*/
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();  //S??? ch??? s??? th???p ph??n sau d???u ph???y
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  appName = this.systemParameterList.find(x => x.systemKey == 'ApplicationName').systemValueString;
  minimumProfit = this.systemParameterList.find(x => x.systemKey == 'MinimumProfitExpect').systemValueString;
  /*End*/

  /*Get Current EmployeeId*/
  auth = JSON.parse(localStorage.getItem('auth'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  /*End*/

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionImport: boolean = true;
  /*End*/

  /*Form B??o gi??*/
  quoteForm: FormGroup;
  objectControl: FormControl; //?????i t?????ng b??o gi??
  paymentMethodControl: FormControl;  //Ph????ng th???c thanh to??n
  bankAccountControl: FormControl;  //T??i kho???n ng??n h??ng
  daysAreOwedControl: FormControl;  //S??? ng??y ???????c n???
  maxDebtControl: FormControl;  //S??? n??? t???i ??a
  quoteStatusControl: FormControl;  //Tr???ng th??i
  intendedDateControl: FormControl; //Ng??y g???i d??? ki???n
  sendDateControl: FormControl; //Ng??y g???i
  effectiveDateControl: FormControl; //Ng??y hi???u l???c
  personInChargeControl: FormControl; //Ng?????i ph??? tr??ch
  nameQuoteControl: FormControl; //T??n b??o gi??
  hoSoThauControl: FormControl; //Ng?????i ph??? tr??ch
  coHoiControl: FormControl; //Ng?????i ph??? tr??ch
  kenhControl: FormControl; //Ng?????i ph??? tr??ch
  descriptionControl: FormControl;  //Di???n gi???i
  noteControl: FormControl; //Ghi ch??
  discountTypeControl: FormControl; //Lo???i chi???t kh???u (% - S??? ti???n)
  discountValueControl: FormControl; //Gi?? tr??? t???ng chi???t kh???u c???a b??o gi??
  participantControl: FormControl; //Ng?????i tham gia
  vatControl: FormControl;
  percentAdvanceControl: FormControl; //% T???m ???ng
  percentAdvanceTypeControl: FormControl; //Lo???i T???m ???ng
  constructionTimeControl: FormControl; //
  /*End*/

  /*Valid Form*/
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  /*End*/

  /*Bi???n ??i???u ki???n*/
  customerId: string = null;
  occasionId: string = null;
  saleBiddingId: string = null;
  createObjectId: string = null;
  createObjectType: string = null;
  selectedObjectType: string = 'cus';
  isShowBankAccount: boolean = false;
  customerContactCode: string = 'CUS';
  uploadedFiles: any[] = [];
  cols: any[];
  colsCost: any[];
  colsPlan: any = [];
  colsPayment: any = [];

  listQuotePlans: Array<QuotePlanModel> = [];
  listQuotePaymentTerm: Array<QuotePaymentTerm> = [];
  selectedColumns: any[];
  selectedColumnsCost: any[];
  selectedItem: any;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  colsFile: any[];
  colsNote: any[];
  maxOrdinal: number = 0;
  AIUpdate: AdditionalInformation = {
    ordinal: null,
    additionalInformationId: this.emptyGuid,
    objectId: this.emptyGuid,
    objectType: '',
    title: '',
    content: '',
    active: true,
    createdDate: new Date(),
    createdById: this.emptyGuid,
    updatedDate: null,
    updatedById: null,
    orderNumber: null
  };
  listAdditionalInformation: Array<AdditionalInformation> = [];
  titleText: string = '';
  contentText: string = '';
  isUpdateAI: boolean = false;
  displayDialog: boolean = false;
  importFileExcel: any = null;
  messErrFile: any = [];
  cellErrFile: any = [];
  /*End*/

  /*Bi???n l??u gi?? tr??? tr??? v???*/
  objectList = <any>[];
  objCustomer: Customer = null;

  productCodeSystemList: string[] = [];
  listProductUnitName: string[] = [];
  listProduct: any[] = [];
  listUnitProduct: any[] = [];
  listUnitMoney: Array<any> = [];
  minDate: Date = new Date();

  /* M???i */
  listInvestFund: Array<Category> = []; //list k??nh b??n h??ng
  listAdditionalInformationTemplates: Array<Category> = []; //list th??ng tin b??? sung m???u c???a b??o gi??
  listPaymentMethod: Array<Category> = []; //list Ph????ng th???c thanh to??n
  listQuoteStatus: Array<Category> = []; //list Tr???ng th??i c???a b??o gi??
  listEmployee: Array<Employee> = [];  //list nh??n vi??n b??n h??ng ph??n quy???n d??? li???u theo ng?????i ??ang ????ng nh???p
  listEmpSale: Array<Employee> = []; //list nh??n vi??n b??n h??ng (c?? th??? thay ?????i)
  listCustomer: Array<Customer> = [];  //list kh??ch h??ng ?????nh danh
  listCustomerNew: Array<Customer> = []; //list Kh??ch h??ng ti???m n??ng
  listAllLead: Array<any> = []; //list H??? s?? th???u ph??n quy???n d??? li???u theo ng?????i ??ang ????ng nh???p
  listLead: Array<any> = []; //list c?? h???i (c?? th??? thay ?????i)
  listAllSaleBidding: Array<any> = []; //list H??? s?? th???u ph??n quy???n d??? li???u theo ng?????i ??ang ????ng nh???p
  listSaleBidding: Array<any> = []; //list h??? s?? th???u (c?? th??? thay ?????i)
  listParticipant: Array<Employee> = []; //list ng?????i tham gia
  /* End */

  tooltipSelectedParticipant: string = null; //tooltip cho dropdown list ng?????i tham gia

  colLeft: number = 8;
  isShow: boolean = true;
  email: string = '';
  phone: string = '';
  fileName: string = '';
  fullAddress: string = '';
  listBankAccount: Array<BankAccount> = [];
  quoteDate: Date = new Date();
  expirationDate: Date = null; //Ng??y h???t hi???u l???c c???a b??o gi??
  discountTypeList: Array<DiscountType> = [
    { "name": "Theo %", "code": "PT", "value": true },
    { "name": "S??? ti???n", "code": "ST", "value": false }
  ];
  arrayQuoteDocumentModel: Array<QuoteDocument> = [];
  listQuoteDetailModel: Array<QuoteDetail> = [];
  listQuoteCostDetailModel: Array<QuoteCostDetail> = [];
  listQuoteDetailExcelModel: Array<QuoteDetailExcel> = [];

  productType: number;

  amount: number = 0; //T???ng gi?? tr??? h??ng h??a b??n ra
  amountPriceInitial: number = 0; //T???ng gi?? tr??? h??ng h??a ?????u v??o
  amountPriceCost: number = 0; //T???ng chi ph??
  amountPriceCostNotInclude: number = 0; //T???ng chi ph??
  totalAmountVat: number = 0; //T???ng thu??? VAT
  totalAmountAfterVat: number = 0; //T???ng ti???n sau thu???
  totalAmountBeforeVat: number = 0; // T???ng ti???n tr?????c thu???
  totalAmountPromotion: number = 0; //T???ng ti???n khuy???n m???i
  totalAmountDiscount: number = 0; //T???ng th??nh ti???n chi???t kh???u
  customerOrderAmountAfterDiscount: number = 0; //T???ng thanh to??n
  amountPriceProfit: number = 0; //L???i nhu???n t???m t??nh
  valuePriceProfit: number = 0; //% l???i nhu???n t???m t??nh
  amountAdvance: number = 0; //Ti???n t???m ???ng
  totalSumAmountLabor: number = 0; //T???ng th??nh ti???n nh??n c??ng
  vatMessage: string = ''; //T???n t???i s???n ph???m c?? thu???

  /*Ch????ng tr??nh khuy???n m???i*/
  isPromotionCustomer: boolean = false;
  isPromotionAmount: boolean = false;
  colsPromotion: any[];
  listPromotionApply: Array<PromotionObjectApply> = [];
  listPromotionApplyProduct: Array<PromotionObjectApply> = [];
  /*End*/

  tools: object = {
    type: 'Expand',
    items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
      'Outdent', 'Indent', '|',
      'CreateLink']
  };

  constructor(
    private router: Router,
    private el: ElementRef,
    private route: ActivatedRoute,
    private productService: ProductService,
    private bankService: BankService,
    private imageService: ImageUploadService,
    private quoteService: QuoteService,
    private getPermission: GetPermission,
    private messageService: MessageService,
    private dialogService: DialogService,
    private renderer: Renderer2,
    private confirmationService: ConfirmationService,
    private promotionService: PromotionService,
    private contactService: ContactService,
    private CDRef: ChangeDetectorRef
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
        if (this.saveAndCreate) {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target) &&
            !this.saveAndCreate.nativeElement.contains(e.target)) {
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

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  async ngOnInit() {
    this.setForm();

    /*T???o b??o gi??*/
    this.route.params.subscribe(async params => {
      /*T??? C?? h???i*/
      this.occasionId = params['occasionId'];
      /*End*/

      /*T??? Kh??ch h??ng (Kh??ch h??ng ?????nh danh ho???c Kh??ch h??ng ti???m n??ng*/
      this.customerId = params['customerId'];
      /*End*/

      /*T??? H??? s?? th???u*/
      this.saleBiddingId = params['saleBiddingId'];
      /*End*/

      let resource = "crm/customer/quote-create";
      let permission: any = await this.getPermission.getPermission(resource);
      if (permission.status == false) {
        let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
        setTimeout(() => {
          this.showMessage(msg);
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        }, 0);
      } else {
        let listCurrentActionResource = permission.listCurrentActionResource;
        if (listCurrentActionResource.indexOf("add") == -1) {
          this.actionAdd = false;
        }
        if (listCurrentActionResource.indexOf("import") == -1) {
          this.actionImport = false; //import file upload
        }
      }
    });
    /*End*/
    this.setTable();
    this.getDataDefault();
  }

  ngAfterViewInit() {
    this.CDRef.detectChanges();
  }

  setForm() {
    this.objectControl = new FormControl(null, [Validators.required]);
    this.paymentMethodControl = new FormControl(null);
    this.bankAccountControl = new FormControl(null);
    this.daysAreOwedControl = new FormControl('0');
    this.maxDebtControl = new FormControl('0');
    this.quoteStatusControl = new FormControl(null);
    this.intendedDateControl = new FormControl(new Date());
    this.sendDateControl = new FormControl(null);
    this.effectiveDateControl = new FormControl('30', [Validators.required, ageRangeValidator(1, 365)]);
    this.personInChargeControl = new FormControl(null, [Validators.required]);
    this.nameQuoteControl = new FormControl(null, [Validators.required]);
    this.hoSoThauControl = new FormControl(null);
    this.coHoiControl = new FormControl(null);
    this.kenhControl = new FormControl(null);
    this.descriptionControl = new FormControl('');
    this.noteControl = new FormControl('');
    this.discountTypeControl = new FormControl(this.discountTypeList.find(x => x.code == "PT"));
    this.discountValueControl = new FormControl('0');
    this.participantControl = new FormControl(null);
    this.vatControl = new FormControl('0');
    this.percentAdvanceControl = new FormControl('0');
    this.percentAdvanceTypeControl = new FormControl(this.discountTypeList.find(x => x.code == "PT"));
    this.constructionTimeControl = new FormControl(null);

    this.quoteForm = new FormGroup({
      objectControl: this.objectControl,
      paymentMethodControl: this.paymentMethodControl,
      bankAccountControl: this.bankAccountControl,
      daysAreOwedControl: this.daysAreOwedControl,
      maxDebtControl: this.maxDebtControl,
      quoteStatusControl: this.quoteStatusControl,
      intendedDateControl: this.intendedDateControl,
      sendDateControl: this.sendDateControl,
      effectiveDateControl: this.effectiveDateControl,
      personInChargeControl: this.personInChargeControl,
      nameQuoteControl: this.nameQuoteControl,
      hoSoThauControl: this.hoSoThauControl,
      coHoiControl: this.coHoiControl,
      kenhControl: this.kenhControl,
      descriptionControl: this.descriptionControl,
      noteControl: this.noteControl,
      discountTypeControl: this.discountTypeControl,
      discountValueControl: this.discountValueControl,
      participantControl: this.participantControl,
      vatControl: this.vatControl,
      percentAdvanceControl: this.percentAdvanceControl,
      percentAdvanceTypeControl: this.percentAdvanceTypeControl,
      constructionTimeControl: this.constructionTimeControl,
    });
  }

  setTable() {
    if (this.appName == 'VNS') {
      this.cols = [
        { field: 'move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
        { field: 'productCode', header: 'M?? s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'productName', header: 'T??n s???n ph???m d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'nameVendor', header: 'Nh?? cung c???p', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
        { field: 'productNameUnit', header: '????n v??? t??nh', width: '95px', textAlign: 'left', color: '#f44336' },
        { field: 'unitPrice', header: '????n gi??', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'unitLaborPrice', header: 'Nh??n c??ng', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'sumAmountLabor', header: 'Th??nh ti???n nh??n c??ng', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'nameMoneyUnit', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
        { field: 'exchangeRate', header: 'T??? gi??', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'vat', header: 'Thu??? GTGT (%)', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'discountValue', header: 'Chi???t kh???u', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'sumAmount', header: 'Th??nh ti???n (VND)', width: '130px', textAlign: 'right', color: '#f44336' },
        { field: 'delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
      ];
      this.selectedColumns = [
        { field: 'move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
        { field: 'productCode', header: 'M?? s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'productName', header: 'T??n s???n ph???m d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
        { field: 'productNameUnit', header: '????n v??? t??nh', width: '95px', textAlign: 'left', color: '#f44336' },
        { field: 'unitPrice', header: '????n gi??', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'unitLaborPrice', header: 'Nh??n c??ng', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'sumAmountLabor', header: 'Th??nh ti???n nh??n c??ng', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'nameMoneyUnit', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
        { field: 'exchangeRate', header: 'T??? gi??', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'sumAmount', header: 'Th??nh ti???n (VND)', width: '130px', textAlign: 'right', color: '#f44336' },
        { field: 'delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
      ];
    }
    else {
      this.cols = [
        { field: 'move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
        { field: 'productCode', header: 'M?? s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'productName', header: 'T??n s???n ph???m d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'nameVendor', header: 'Nh?? cung c???p', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
        { field: 'productNameUnit', header: '????n v??? t??nh', width: '95px', textAlign: 'left', color: '#f44336' },
        { field: 'unitPrice', header: '????n gi??', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'nameMoneyUnit', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
        { field: 'exchangeRate', header: 'T??? gi??', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'vat', header: 'Thu??? GTGT (%)', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'discountValue', header: 'Chi???t kh???u', width: '170px', textAlign: 'right', color: '#f44336' },
        { field: 'sumAmount', header: 'Th??nh ti???n (VND)', width: '130px', textAlign: 'right', color: '#f44336' },
        { field: 'delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
      ];
      this.selectedColumns = [
        { field: 'move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
        { field: 'productCode', header: 'M?? s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'productName', header: 'T??n s???n ph???m d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
        { field: 'quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
        { field: 'productNameUnit', header: '????n v??? t??nh', width: '95px', textAlign: 'left', color: '#f44336' },
        { field: 'unitPrice', header: '????n gi??', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'nameMoneyUnit', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
        { field: 'exchangeRate', header: 'T??? gi??', width: '90px', textAlign: 'right', color: '#f44336' },
        { field: 'sumAmount', header: 'Th??nh ti???n (VND)', width: '150px', textAlign: 'right', color: '#f44336' },
        { field: 'delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
      ];
    }

    this.colsFile = [
      { field: 'DocumentName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left' },
      { field: 'DocumentSize', header: 'K??ch th?????c t??i li???u', width: '50%', textAlign: 'left' },
    ];

    this.colsNote = [
      { field: 'title', header: 'Ti??u ?????', width: '30%', textAlign: 'left' },
      { field: 'content', header: 'N???i dung', width: '70%', textAlign: 'left' },
    ];

    this.colsCost = [
      { field: 'costCode', header: 'M?? chi ph??', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'costName', header: 'T??n chi ph??', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'S??? l?????ng', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'unitPrice', header: '????n gi??', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'sumAmount', header: 'Th??nh ti???n (VND)', width: '60px', textAlign: 'right', color: '#f44336' },
      { field: 'isInclude', header: 'Bao g???m trong gi?? b??n', width: '195px', textAlign: 'center', color: '#f44336' },
      { field: 'delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
    ];
    this.selectedColumnsCost = this.colsCost;

    this.colsPromotion = [
      { field: 'promotionName', header: 'CTKM', width: '150px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'promotionProductName', header: 'T??n s???n ph???m d???ch v???', width: '160px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'productUnitName', header: '????n v??? t??nh', width: '110px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'soLuongTang', header: 'S??? l?????ng', width: '100px', textAlign: 'right', display: 'table-cell', color: '#f44336' },
      { field: 'giaTri', header: 'Gi?? tr???', width: '140px', textAlign: 'right', display: 'table-cell', color: '#f44336' },
      { field: 'loaiGiaTri', header: 'Lo???i gi?? tr???', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'amount', header: 'Th??nh ti???n', width: '100px', textAlign: 'right', display: 'table-cell', color: '#f44336' },
    ];
    this.colsPlan = [
      { field: 'tt', header: 'TT', width: '50px', textAlign: 'left', type: 'string' },
      { field: 'finished', header: 'M???c ho??n th??nh', width: '300px', textAlign: 'left', type: 'string' },
      { field: 'execTime', header: 'Th???i gian th???c hi???n', width: '200px', textAlign: 'left', type: 'string' },
      { field: 'sumExecTime', header: 'T???ng th???i gian th???c hi???n', width: '200px', textAlign: 'left', type: 'string' },
    ];
    this.colsPayment = [
      { field: 'orderNumber', header: 'STT', width: '50px', textAlign: 'center', display: 'table-cell' },
      { field: 'milestone', header: 'M???c', width: '300px', textAlign: 'left', display: 'table-cell' },
      { field: 'paymentPercentage', header: '%Thanh to??n', width: '200px', textAlign: 'center', display: 'table-cell' },
    ];
  }

  getDataDefault() {
    if (this.occasionId) {
      this.createObjectType = "LEAD";
      this.createObjectId = this.occasionId;
    }
    else if (this.saleBiddingId) {
      this.createObjectType = "SALEBIDDING";
      this.createObjectId = this.saleBiddingId;
    }
    else if (this.customerId) {
      this.createObjectType = "CUSTOMER";
      this.createObjectId = this.customerId;
    }

    this.loading = true;
    this.quoteService.getMasterDataCreateQuote(this.createObjectId, this.createObjectType).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listInvestFund = result.listInvestFund;  //list k??nh b??n h??ng
        this.listAdditionalInformationTemplates = result.listAdditionalInformationTemplates;  //list th??ng tin b??? sung m???u c???a b??o gi??
        this.listPaymentMethod = result.listPaymentMethod; //list Ph????ng th???c thanh to??n
        this.listQuoteStatus = result.listQuoteStatus; //list Tr???ng th??i c???a b??o gi??
        this.listEmployee = result.listEmployee;  //list nh??n vi??n b??n h??ng
        this.listCustomer = result.listCustomer;  //list kh??ch h??ng ?????nh danh
        this.listCustomerNew = result.listCustomerNew; //list Kh??ch h??ng ti???m n??ng
        this.listAllLead = result.listAllLead; //list H??? s?? th???u
        this.listAllSaleBidding = result.listAllSaleBidding; //list H??? s?? th???u
        this.listParticipant = result.listParticipant; //list ng?????i tham gia

        this.setDefaultValueForm();
      }
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }

  goDetailLead() {
    if (this.coHoiControl.value) {
      let lead = this.coHoiControl.value;
      let url = this.router.serializeUrl(this.router.createUrlTree(['/lead/detail', { leadId: lead.leadId }]));
      window.open(url, '_blank');
    }
  }

  goDetaiSaleding() {
    if (this.hoSoThauControl.value) {
      let salebidding = this.hoSoThauControl.value;
      let url = this.router.serializeUrl(this.router.createUrlTree(['/sale-bidding/detail', { saleBiddingId: salebidding.saleBiddingId }]));
      window.open(url, '_blank');
    }
  }

  setDefaultValueForm() {
    //Tr???ng th??i b??o gi??
    const toSelectQuoteStatus: Category = this.listQuoteStatus.find(x => x.categoryCode == "MTA");
    this.quoteStatusControl.setValue(toSelectQuoteStatus);

    //Ph????ng th???c thanh to??n
    const toSelectPaymentMethod = this.listPaymentMethod.find(c => c.isDefault === true);
    this.quoteForm.controls['paymentMethodControl'].setValue(toSelectPaymentMethod);

    if (toSelectPaymentMethod?.categoryCode == "CASH") {
      this.isShowBankAccount = false;
    }
    else if (toSelectPaymentMethod?.categoryCode == "BANK") {
      this.isShowBankAccount = true;
    }
    else {
      this.isShowBankAccount = false;
    }

    //Th??ng tin b??? sung
    this.listAdditionalInformationTemplates = this.listAdditionalInformationTemplates;
    this.listAdditionalInformationTemplates.forEach(item => {
      this.maxOrdinal++;
      let additionalInformation: AdditionalInformation = {
        ordinal: this.maxOrdinal,
        additionalInformationId: this.emptyGuid,
        objectId: this.emptyGuid,
        objectType: '',
        title: item.categoryCode.trim(),
        content: item.categoryName.trim(),
        active: true,
        createdDate: new Date(),
        createdById: this.emptyGuid,
        updatedDate: null,
        updatedById: null,
        orderNumber: null
      };
      this.listAdditionalInformation.push(additionalInformation);
    });


    /*N???u b??o gi?? ???????c t???o t??? m???t ngu???n n??o ????*/
    if (this.createObjectId) {
      //T??? C?? h???i
      if (this.createObjectType == "LEAD") {
        let lead = this.listAllLead.find(x => x.leadId == this.occasionId);

        //Ki???m tra xem kh??ch h??ng c???a C?? h???i l?? ?????nh danh hay Ti???m n??ng
        let customerType = this.getCustomerType(lead.customerId);

        //L?? kh??ch h??ng ?????nh danh
        if (customerType == 1) {
          this.objectList = this.listCustomer;
          let customerIdentity = this.listCustomer.find(x => x.customerId == lead.customerId);

          this.mapDataToQuote(customerIdentity);
        }
        //L?? kh??ch h??ng Ti???m n??ng
        else if (customerType == 0) {
          let customerNew = this.listCustomerNew.find(x => x.customerId == lead.customerId);
          this.selectedObjectType = 'lea';
          this.objectList = this.listCustomerNew;

          this.mapDataToQuote(customerNew);
        }
        //kh??ch h??ng kh??ng x??c ?????nh
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ng x??c ?????nh ???????c kh??ch h??ng c???a C?? h???i' };
          this.showMessage(mgs);
        }
      }
      //T??? H??? s?? th???u
      else if (this.createObjectType == "SALEBIDDING") {
        let saleBidding = this.listAllSaleBidding.find(x => x.saleBiddingId == this.saleBiddingId);

        //Ki???m tra xem kh??ch h??ng c???a C?? h???i l?? ?????nh danh hay Ti???m n??ng
        let customerType = this.getCustomerType(saleBidding.customerId);

        //L?? kh??ch h??ng ?????nh danh
        if (customerType == 1) {
          this.objectList = this.listCustomer;
          let customerIdentity = this.listCustomer.find(x => x.customerId == saleBidding.customerId);

          this.mapDataToQuote(customerIdentity);
        }
        //L?? kh??ch h??ng Ti???m n??ng
        else if (customerType == 0) {
          let customerNew = this.listCustomerNew.find(x => x.customerId == saleBidding.customerId);
          this.selectedObjectType = 'lea';
          this.objectList = this.listCustomerNew;

          this.mapDataToQuote(customerNew);
        }
        //kh??ch h??ng kh??ng x??c ?????nh
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ng x??c ?????nh ???????c kh??ch h??ng c???a C?? h???i' };
          this.showMessage(mgs);
        }
      }
      //T??? kh??ch h??ng (?????nh danh ho???c Ti???m n??ng)
      else if (this.createObjectType == "CUSTOMER") {
        //Ki???m tra xem kh??ch h??ng c???a C?? h???i l?? ?????nh danh hay Ti???m n??ng
        let customerType = this.getCustomerType(this.customerId);

        //L?? kh??ch h??ng ?????nh danh
        if (customerType == 1) {
          this.objectList = this.listCustomer;
          let customerIdentity = this.listCustomer.find(x => x.customerId == this.customerId);

          this.mapDataToQuote(customerIdentity);
        }
        //L?? kh??ch h??ng Ti???m n??ng
        else if (customerType == 0) {
          let customerNew = this.listCustomerNew.find(x => x.customerId == this.customerId);
          this.selectedObjectType = 'lea';
          this.objectList = this.listCustomerNew;

          this.mapDataToQuote(customerNew);
        }
        //kh??ch h??ng kh??ng x??c ?????nh
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ng x??c ?????nh ???????c kh??ch h??ng c???a b??o gi??' };
          this.showMessage(mgs);
        }
      }
    }
    /*N???u b??o gi?? ???????c t???o tr???c ti???p kh??ng qua m???t ngu???n n??o kh??c*/
    else {
      //Kh??ch h??ng ?????nh danh
      this.objectList = this.listCustomer;

      //Nh??n vi??n b??n h??ng (ng?????i ph??? tr??ch)
      this.listEmpSale = this.listEmployee;

      let emp = this.listEmployee.find(x => x.employeeId == this.auth.EmployeeId);
      this.personInChargeControl.setValue(emp);

      //H??? s?? th???u
      // this.listSaleBidding = this.listAllSaleBidding;
      this.listSaleBidding = [];

      //C?? h???i
      // this.listLead = this.listAllLead;
      this.listLead = [];
    }
  }

  /*Ki???m tra lo???i kh??ch h??ng*/
  getCustomerType(customerId: string): number {
    let object_1 = this.listCustomer.find(x => x.customerId == customerId);
    let object_2 = this.listCustomerNew.find(x => x.customerId == customerId);

    //L?? kh??ch h??ng ?????nh danh
    if (object_1 && !object_2) {
      return 1;
    }
    //L?? kh??ch h??ng Ti???m n??ng
    else if (!object_1 && object_2) {
      return 0;
    }
    //kh??ch h??ng kh??ng x??c ?????nh
    else {
      return -1;
    }
  }

  /*Mapdata v??o B??o gi??*/
  async mapDataToQuote(customer: Customer) {
    //N???u kh??ch h??ng c?? trong t???p kh??ch h??ng c???a ng?????i ??ang ????ng nh???p
    if (customer) {
      this.objectControl.setValue(customer);

      this.objCustomer = customer;
      this.email = customer.customerEmail;
      this.phone = customer.customerPhone;

      /** L???y ?????a ch??? c???a kh??ch h??ng */
      this.contactService.getAddressByObject(customer.customerId, "CUS").subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.fullAddress = result.address;
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
      /** End */

      //S??? ng??y ???????c n???
      let daysAreOwed = customer.maximumDebtDays ? customer.maximumDebtDays : 0;
      this.daysAreOwedControl.setValue(daysAreOwed);

      //S??? n??? t???i ??a
      let maxAmount = customer.maximumDebtValue ? customer.maximumDebtValue : 0;
      this.maxDebtControl.setValue(maxAmount);

      //N???u Ph????ng th???c thanh to??n l?? Chuy???n kho???n th?? l???y ra list account bank
      if (this.isShowBankAccount == true) {
        this.bankService.getAllBankAccountByObject(customer.customerId, this.customerContactCode).subscribe(response => {
          let result = <any>response;

          this.listBankAccount = result.bankAccountList;
          if (this.listBankAccount.length > 0) {
            let toSelectBankAccount = this.listBankAccount[0];
            this.bankAccountControl.setValue(toSelectBankAccount);
          }
        });
      }

      //L???y list nh??n vi??n b??n h??ng m???i (ph??n quy???n d??? li???u theo ng?????i ph??? tr??ch c???a kh??ch h??ng)
      this.listEmpSale = [];
      this.loading = true;
      let result: any = await this.quoteService.getEmployeeByPersonInCharge(customer.personInChargeId, null);
      this.loading = false;
      if (result.statusCode == 200) {
        this.listEmpSale = result.listEmployee;
        this.personInChargeControl.setValue(this.listEmpSale[0]);
      }
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
      }

      //L???y list C?? h???i theo kh??ch h??ng ???????c ch???n
      this.listLead = this.listAllLead.filter(x => x.customerId == customer.customerId);

      //L???y list H??? s?? th???u theo kh??ch h??ng ???????c ch???n
      this.listSaleBidding = this.listAllSaleBidding.filter(x => x.customerId == customer.customerId);

      if (this.createObjectType == "LEAD") {
        /*Set value cho C?? h???i*/
        let defaultLead = this.listLead.find(x => x.leadId == this.occasionId);

        //N???u c?? h???i c???a kh??ch h??ng n???m trong t???p c?? h???i c???a ng?????i ????ng nh???p
        if (defaultLead) {
          this.coHoiControl.setValue(defaultLead);

          let defaultNumberType = parseInt(this.defaultNumberType, 10);
          this.listSaleBidding = this.listAllSaleBidding.filter(h => h.leadId == defaultLead.leadId);

          let personInChargeId = defaultLead.personInChargeId ?? null;
          if (personInChargeId) {
            let personInCharge: Employee = this.listEmpSale.find(x => x.employeeId == personInChargeId);

            if (personInCharge) {
              this.personInChargeControl.setValue(personInCharge);
            }
            else {
              let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Nh??n vi??n ph??? tr??ch c???a C?? h???i kh??ng n???m trong t???p nh??n vi??n c???a ng?????i ph??? tr??ch kh??ch h??ng' };
              this.showMessage(mgs);
            }
          }

          /*Th??m list s???n ph???m d???ch v??? c???a C?? h???i v??o list s???n ph???m d???ch v??? c???a B??o gi??*/
          defaultLead.listLeadDetail.forEach((element, index) => {
            let obj: QuoteDetail = new QuoteDetail;
            obj.productCategoryId = element.productCategory;
            obj.vendorId = element.vendorId;
            obj.productId = element.productId;
            obj.quantity = element.quantity;
            obj.unitPrice = element.unitPrice;
            obj.currencyUnit = element.currencyUnit;
            obj.exchangeRate = element.exchangeRate;
            obj.vat = element.vat;
            obj.discountType = element.discountType;
            obj.discountValue = element.discountValue;
            obj.description = element.description;
            obj.orderDetailType = element.orderDetailType;
            obj.unitId = element.unitId;
            obj.incurredUnit = element.incurredUnit;
            obj.productCode = element.productCode;
            obj.nameMoneyUnit = element.nameMoneyUnit;
            obj.nameVendor = element.nameVendor;
            obj.productNameUnit = element.productNameUnit;
            obj.productName = element.productName;
            obj.unitLaborPrice = element.unitLaborPrice;
            obj.unitLaborNumber = element.unitLaborNumber;
            obj.orderNumber = index + 1;

            let sumprice = element.quantity * element.unitPrice * element.exchangeRate;
            let sumLabor = obj.unitLaborPrice * obj.unitLaborNumber * obj.exchangeRate;

            if (this.appName == 'VNS') {
              if (obj.discountType) {
                obj.amountDiscount = sumprice * element.discountValue / 100;
              }
              else {
                obj.amountDiscount = sumprice - element.discountValue;
              }

              let vatAmount = (sumprice - obj.amountDiscount) * element.vat / 100;
              obj.sumAmount = this.roundNumber(sumprice - obj.amountDiscount + vatAmount, defaultNumberType);
            }
            else {
              if (obj.discountType) {
                obj.amountDiscount = (sumprice + sumLabor) * element.discountValue / 100;
              }
              else {
                obj.amountDiscount = element.discountValue;
              }

              let vatAmount = (sumprice + sumLabor - obj.amountDiscount) * element.vat / 100;
              obj.sumAmount = this.roundNumber(sumprice + sumLabor - obj.amountDiscount + vatAmount, defaultNumberType);
            }

            element.leadProductDetailProductAttributeValue.forEach(item => {
              let attributeValue: QuoteProductDetailProductAttributeValue = new QuoteProductDetailProductAttributeValue;
              attributeValue.productId = item.productId;
              attributeValue.productAttributeCategoryId = item.productAttributeCategoryId;
              attributeValue.productAttributeCategoryValueId = item.productAttributeCategoryValueId;
              obj.quoteProductDetailProductAttributeValue.push(attributeValue);
            });

            this.listQuoteDetailModel = [...this.listQuoteDetailModel, obj];
          });
          /*End*/

          this.calculatorAmount();
        }
        //Ng?????c l???i
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'C?? h???i c???a kh??ch h??ng n??y kh??ng thu???c quy???n ph??? tr??ch c???a b???n' };
          this.showMessage(mgs);
        }
        /*End*/
      }
      else if (this.createObjectType == "SALEBIDDING") {
        /*Set value cho B??o gi??*/
        let defaultSalebidding = this.listSaleBidding.find(x => x.saleBiddingId == this.saleBiddingId);

        //N???u H??? s?? th???u c???a kh??ch h??ng n???m trong t???p c?? h???i c???a ng?????i ????ng nh???p
        if (defaultSalebidding) {
          this.hoSoThauControl.setValue(defaultSalebidding);

          let defaultNumberType = parseInt(this.defaultNumberType, 10);

          //list C?? h???i s??? b??? x??a ??i
          this.listLead = [];
          this.coHoiControl.reset();

          //Ch???n C?? h???i g???n v???i H??? s?? th???u
          let leadObj = this.listAllLead.find(l => l.leadId == defaultSalebidding.leadId);
          if (leadObj) {
            this.listLead.push(leadObj);
            this.coHoiControl.setValue(leadObj);
          }

          let personInChargeId = defaultSalebidding.personInChargeId ?? null;
          if (personInChargeId) {
            let personInCharge: Employee = this.listEmpSale.find(x => x.employeeId == personInChargeId);

            if (personInCharge) {
              this.personInChargeControl.setValue(personInCharge);
            }
            else {
              let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Nh??n vi??n ph??? tr??ch c???a H??? s?? th???u kh??ng n???m trong t???p nh??n vi??n c???a ng?????i ph??? tr??ch kh??ch h??ng' };
              this.showMessage(mgs);
            }
          }

          /*Th??m list s???n ph???m d???ch v??? c???a C?? h???i v??o list s???n ph???m d???ch v??? c???a B??o gi??*/
          defaultSalebidding.saleBiddingDetail.forEach((element, index) => {
            let obj: QuoteDetail = new QuoteDetail;
            obj.productCategoryId = element.productCategory;
            obj.vendorId = element.vendorId;
            obj.productId = element.productId;
            obj.quantity = element.quantity;
            obj.unitPrice = element.unitPrice;
            obj.currencyUnit = element.currencyUnit;
            obj.exchangeRate = element.exchangeRate;
            obj.vat = element.vat;
            obj.discountType = element.discountType;
            obj.discountValue = element.discountValue;
            obj.description = element.description;
            obj.orderDetailType = element.orderDetailType;
            obj.unitId = element.unitId;
            obj.incurredUnit = element.incurredUnit;
            obj.productCode = element.productCode;
            obj.nameMoneyUnit = element.nameMoneyUnit;
            obj.nameVendor = element.nameVendor;
            obj.productNameUnit = element.productNameUnit;
            obj.productName = element.productName;
            obj.unitLaborPrice = element.unitLaborPrice;
            obj.unitLaborNumber = element.unitLaborNumber;
            obj.orderNumber = index + 1;

            let sumprice = element.quantity * element.unitPrice * element.exchangeRate;
            let sumLabor = obj.unitLaborPrice * obj.unitLaborNumber * obj.exchangeRate;

            if (this.appName == 'VNS') {
              if (obj.discountType) {
                obj.amountDiscount = sumprice * element.discountValue / 100;
              }
              else {
                obj.amountDiscount = sumprice - element.discountValue;
              }

              let vatAmount = (sumprice - obj.amountDiscount) * element.vat / 100;
              obj.sumAmount = this.roundNumber(sumprice - obj.amountDiscount + vatAmount, defaultNumberType);
            }
            else {
              if (obj.discountType) {
                obj.amountDiscount = (sumprice + sumLabor) * element.discountValue / 100;
              }
              else {
                obj.amountDiscount = element.discountValue;
              }

              let vatAmount = (sumprice + sumLabor - obj.amountDiscount) * element.vat / 100;
              obj.sumAmount = this.roundNumber(sumprice - obj.amountDiscount + sumLabor + vatAmount, defaultNumberType);
            }

            element.saleBiddingDetailProductAttribute.forEach(item => {
              let attributeValue: QuoteProductDetailProductAttributeValue = new QuoteProductDetailProductAttributeValue;
              attributeValue.productId = item.productId;
              attributeValue.productAttributeCategoryId = item.productAttributeCategoryId;
              attributeValue.productAttributeCategoryValueId = item.productAttributeCategoryValueId;
              obj.quoteProductDetailProductAttributeValue.push(attributeValue);
            });

            this.listQuoteDetailModel = [...this.listQuoteDetailModel, obj];
          });
          /*End*/

          this.calculatorAmount();
        }
        //Ng?????c l???i
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'H??? s?? th???u c???a kh??ch h??ng n??y kh??ng thu???c quy???n ph??? tr??ch c???a b???n' };
          this.showMessage(mgs);
        }
        /*End*/
      }
    }
    //N???u kh??ch h??ng kh??ng c?? trong t???p kh??ch h??ng c???a ng?????i ??ang ????ng nh???p
    else {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ch h??ng g???n v???i H??? s?? th???u n??y kh??ng thu???c quy???n ph??? tr??ch c???a b???n' };
      this.showMessage(mgs);
    }
  }

  /*Event chuy???n lo???i kh??ch h??ng (Kh??ch h??ng ho???c Kh??ch h??ng ti???m n??ng)*/
  changeObjectType(objecType: any) {
    if (objecType == 'cus') {
      this.objectList = this.listCustomer;
    } else if (objecType == 'lea') {
      this.objectList = this.listCustomerNew;
    }

    //???n H???p qu?? CTKM
    this.isPromotionCustomer = false;

    //X??a nh???ng s???n ph???m khuy???n m???i theo kh??ch h??ng
    this.listPromotionApply = this.listPromotionApply.filter(x => x.conditionsType != 1);

    if (!this.objectList.find(x => x == this.objectControl.value)) {
      //N???u kh??ch h??ng hi???n t???i ??ang ???????c ch???n kh??ng thu???c objectList th?? reset c??c tr?????ng
      this.objCustomer = null;
      this.objectControl.setValue(null);
      this.email = '';
      this.phone = '';
      this.fullAddress = '';

      //Reset Ph????ng th???c thanh to??n
      const toSelectPaymentMethod = this.listPaymentMethod.find(c => c.isDefault === true);
      this.paymentMethodControl.setValue(toSelectPaymentMethod);
      //End

      this.daysAreOwedControl.setValue('0');  //Reset S??? ng??y ???????c n???
      this.maxDebtControl.setValue('0');  //Reset S??? n??? t???i ??a

      //Reset T??i kho???n ng??n h??ng
      this.isShowBankAccount = false;
      this.listBankAccount = [];
      this.bankAccountControl.setValue(null);
      //End

      //X??a list s???n ph???m d???ch v???
      this.listQuoteDetailModel = [];

      //b??? ch???n nh??n vi??n b??n h??ng
      this.personInChargeControl.reset();

      //reset list nh??n vi??n b??n h??ng
      this.listEmpSale = this.listEmployee;

      //b??? ch???n C?? h???i
      this.coHoiControl.reset();

      //reset list C?? h???i
      // this.listLead = this.listAllLead;
      this.listLead = [];

      //b??? ch???n H??? s?? th???u
      this.hoSoThauControl.reset();

      //reset list H??? s?? th???u
      // this.listSaleBidding = this.listAllSaleBidding;
      this.listSaleBidding = [];

      this.calculatorAmount();
    }
  }

  /*Event thay ?????i kh??ch h??ng*/
  async changeCustomer(value: Customer) {
    this.objCustomer = null;
    this.email = '';
    this.phone = '';
    this.fullAddress = '';

    //Reset Ph????ng th???c thanh to??n
    const toSelectPaymentMethod = this.listPaymentMethod.find(c => c.isDefault === true);
    this.paymentMethodControl.setValue(toSelectPaymentMethod ?? null);
    //End

    this.daysAreOwedControl.setValue('0');  //Reset S??? ng??y ???????c n???
    this.maxDebtControl.setValue('0');  //Reset S??? n??? t???i ??a

    //Reset T??i kho???n ng??n h??ng
    this.listBankAccount = [];
    this.bankAccountControl.reset();
    if (toSelectPaymentMethod?.categoryCode == "CASH") {
      this.isShowBankAccount = false;
    }
    else if (toSelectPaymentMethod?.categoryCode == "BANK") {
      this.isShowBankAccount = true;
    }
    else {
      this.isShowBankAccount = false;
    }

    //reset nh??n vi??n b??n h??ng (ng?????i ph??? tr??ch)
    this.listEmpSale = this.listEmployee;
    this.personInChargeControl.reset();

    //reset c?? h???i
    // // this.listLead = this.listAllLead;
    this.listLead = [];
    this.coHoiControl.reset();

    //reset h??? s?? th???u
    // this.listSaleBidding = this.listAllSaleBidding;
    this.listSaleBidding = [];
    this.hoSoThauControl.reset();

    //Danh s??ch s???n ph???m d???ch v???
    this.listQuoteDetailModel = [];

    //???n H???p qu?? CTKM
    this.isPromotionCustomer = false;

    //X??a nh???ng s???n ph???m khuy???n m???i theo kh??ch h??ng
    this.listPromotionApply = this.listPromotionApply.filter(x => x.conditionsType != 1);

    //T??nh l???i ph???n T???ng h???p b??o gi??
    this.calculatorAmount();

    /*N???u ch???n kh??ch h??ng*/
    if (value) {
      this.objCustomer = value;
      this.email = value.customerEmail;
      this.phone = value.customerPhone;

      /** L???y ?????a ch??? c???a kh??ch h??ng */
      this.contactService.getAddressByObject(value.customerId, "CUS").subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.fullAddress = result.address;
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
      /** End */

      //S??? ng??y ???????c n???
      let daysAreOwed = value.maximumDebtDays ? value.maximumDebtDays : 0;
      this.daysAreOwedControl.setValue(daysAreOwed);

      //S??? n??? t???i ??a
      let maxAmount = value.maximumDebtValue ? value.maximumDebtValue : 0;
      this.maxDebtControl.setValue(maxAmount);

      //N???u Ph????ng th???c thanh to??n l?? Chuy???n kho???n th?? l???y ra list account bank
      if (this.isShowBankAccount == true) {
        this.bankService.getAllBankAccountByObject(value.customerId, this.customerContactCode).subscribe(response => {
          let result = <any>response;

          this.listBankAccount = result.bankAccountList;
          if (this.listBankAccount.length > 0) {
            let toSelectBankAccount = this.listBankAccount[0];
            this.bankAccountControl.setValue(toSelectBankAccount);
          }
        });
      }

      //L???y list C?? h???i theo kh??ch h??ng ???????c ch???n
      this.listLead = this.listAllLead.filter(x => x.customerId == value.customerId);

      //L???y list H??? s?? th???u theo kh??ch h??ng ???????c ch???n
      this.listSaleBidding = this.listAllSaleBidding.filter(x => x.customerId == value.customerId);

      //L???y list nh??n vi??n b??n h??ng m???i (ph??n quy???n d??? li???u theo ng?????i ph??? tr??ch c???a kh??ch h??ng)
      this.listEmpSale = [];
      this.loading = true;
      let result: any = await this.quoteService.getEmployeeByPersonInCharge(value.personInChargeId, null);
      if (result.statusCode == 200) {
        this.listEmpSale = result.listEmployee;

        //set default value l?? ng?????i ph??? tr??ch c???a kh??ch h??ng ???????c ch???n
        let emp = this.listEmpSale.find(e => e.employeeId == value.personInChargeId);
        this.personInChargeControl.setValue(emp);
      }
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
      }

      let _result: any = await this.promotionService.checkPromotionByCustomer(value.customerId);
      this.loading = false;
      if (_result.statusCode == 200) {
        this.isPromotionCustomer = _result.isPromotionCustomer;
      }
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: _result.messageCode };
        this.showMessage(mgs);
      }
    }
  }

  /*T??nh c??c gi?? tr??? c???a T???ng h???p b??o gi??*/
  calculatorAmount() {
    if (this.appName != 'VNS') {
      let defaultNumberType = parseInt(this.defaultNumberType, 10);

      this.amount = 0; //T???ng gi?? tr??? h??ng h??a b??n ra
      this.amountPriceInitial = 0; //T???ng gi?? tr??? h??ng h??a ?????u v??o
      this.amountPriceCost = 0; //T???ng chi ph??
      this.amountPriceCostNotInclude = 0; //T???ng chi ph??
      this.totalAmountVat = 0; //T???ng thu??? VAT
      this.totalAmountAfterVat = 0; //T???ng ti???n sau thu???
      this.totalAmountBeforeVat = 0; // T???ng ti???n tr?????c thu???

      this.totalAmountPromotion = 0; //T???ng ti???n khuy???n m???i
      this.totalAmountDiscount = 0; //T???ng th??nh ti???n chi???t kh???u
      this.customerOrderAmountAfterDiscount = 0; //T???ng thanh to??n
      this.amountPriceProfit = 0; //L???i nhu???n t???m t??nh
      this.valuePriceProfit = 0; //% l???i nhu???n t???m t??nh

      //Danh s??ch s???n ph???m d???ch v???
      this.listQuoteDetailModel.forEach(item => {
        let price = item.quantity * item.unitPrice * item.exchangeRate;
        let laborPrice = item.unitLaborPrice * item.unitLaborNumber * item.exchangeRate;

        /*Th??nh ti???n chi???t kh???u*/
        if (item.discountType) {
          item.amountDiscount = ((price + laborPrice) * item.discountValue) / 100;
        }
        else {
          item.amountDiscount = item.discountValue;
        }
        /*End*/

        /*Th??nh ti???n thu??? VAT*/
        let amountVAT = ((price + laborPrice - item.amountDiscount) * item.vat) / 100;
        /*End*/

        /*T???ng thu??? VAT*/
        this.totalAmountVat += amountVAT;
        /*End*/

        /*Th??nh ti???n*/
        item.sumAmount = price + laborPrice - item.amountDiscount + amountVAT;
        /*End*/

        /*Ti???n v???n*/
        let amountInitial = item.quantity * item.priceInitial * item.exchangeRate;
        /*End*/

        /*T???ng gi?? tr??? h??ng h??a b??n ra*/
        this.amount += this.roundNumber((price + laborPrice - item.amountDiscount), defaultNumberType);
        /*End*/

        /*T???ng gi?? tr??? h??ng h??a ?????u v??o*/
        this.amountPriceInitial += this.roundNumber(amountInitial, defaultNumberType);
        /*End*/
      });

      //Danh s??ch chi ph??
      this.listQuoteCostDetailModel.forEach(item => {
        this.amountPriceCost += this.roundNumber(item.quantity * item.unitPrice, defaultNumberType);
        if (!item.isInclude) {
          this.amountPriceCostNotInclude += this.roundNumber(item.quantity * item.unitPrice, defaultNumberType);
        }
      });

      /*T???ng ti???n sau thu???*/
      this.totalAmountAfterVat = this.amount + this.totalAmountVat + this.amountPriceCostNotInclude;

      //Ki???m tra c?? ????? ??i???u ki???n nh???n qu?? khuy???n m???i kh??ng
      this.promotionService.checkPromotionByAmount(this.totalAmountAfterVat).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.isPromotionAmount = result.isPromotionAmount;
        }
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(mgs);
        }
      });
      /*End*/

      //N???u kh??ng ????? ??i???u ki???n nh???n khuy???n m???i th?? x??a c??c qu?? khuy???n m???i ????
      let ignoreList = this.listPromotionApply.filter(x => x.conditionsType == 3 && x.soTienTu > this.totalAmountAfterVat);
      this.listPromotionApply = this.listPromotionApply.filter(x => !ignoreList.includes(x));

      /*T??nh l???i th??nh ti???n c???a Tab khuy???n m???i*/
      this.listPromotionApply.forEach(item => {
        //N???u l?? phi???u gi???m gi??
        if (!item.productId) {
          //N???u l?? s??? ti???n
          if (!item.loaiGiaTri) {
            item.amount = item.giaTri * item.soLuongTang;
          }
          //N???u l?? %
          else {
            item.amount = this.roundNumber((this.totalAmountAfterVat * item.giaTri / 100) * item.soLuongTang, defaultNumberType);
          }
        }
        //N???u l?? s???n ph???m
        else {
          item.amount = item.giaTri * item.soLuongTang;
        }
      });
      /*End*/

      /*T???ng ti???n khuy???n m???i*/
      let totalAmountPhieuGiamGia = 0;  //T???ng th??nh ti???n c???a t???t c??? phi???u gi???m gi?? trong tab khuy???n m???i
      this.listPromotionApply.forEach(item => {
        //Ch??? t??nh v???i phi???u gi???m gi??
        if (!item.productId) {
          totalAmountPhieuGiamGia += item.amount;
          this.totalAmountPromotion += item.amount;
        }
      });
      /*End*/

      /*T???ng th??nh ti???n chi???t kh???u*/
      let discountType: DiscountType = this.discountTypeControl.value;
      let discountValue = ParseStringToFloat(this.discountValueControl.value);

      if (discountType.value) {
        this.totalAmountDiscount = this.totalAmountAfterVat * discountValue / 100;
      }
      else {
        this.totalAmountDiscount = discountValue;
      }
      /*End*/
      //
      /*T???ng ti???n tr?????c thu???*/
      this.totalAmountBeforeVat = this.amount;
      /*T???ng thanh to??n*/
      this.customerOrderAmountAfterDiscount = this.roundNumber(this.totalAmountAfterVat - this.totalAmountDiscount - totalAmountPhieuGiamGia, defaultNumberType);
      // T???ng
      let total = this.roundNumber(this.totalAmountBeforeVat, defaultNumberType);
      /*End*/

      /*N???u T???ng thanh to??n kh??ng ??m v?? kh??c 0*/
      if (total > 0) {
        /*L???i nhu???n t???m t??nh*/
        this.amountPriceProfit = this.roundNumber(this.customerOrderAmountAfterDiscount - this.amountPriceInitial - this.amountPriceCost, defaultNumberType);
        /*End*/
        /*% l???i nhu???n t???m t??nh*/
        this.valuePriceProfit = this.roundNumber((this.amountPriceProfit / this.customerOrderAmountAfterDiscount) * 100, defaultNumberType);
        /*End*/
      }
      //N???u T???ng thanh to??n ??m ho???c b???ng 0
      else {
        this.customerOrderAmountAfterDiscount = 0;
        this.amountPriceProfit = 0;
        this.valuePriceProfit = 0;
      }
      /*End*/
    }
    else if (this.appName == 'VNS') {
      let defaultNumberType = parseInt(this.defaultNumberType, 10);

      this.amount = 0; //T???ng gi?? tr??? h??ng h??a b??n ra
      this.amountPriceInitial = 0; //T???ng gi?? tr??? h??ng h??a ?????u v??o
      this.amountPriceCost = 0; //T???ng chi ph??
      this.totalAmountVat = 0; //T???ng thu??? VAT
      this.totalAmountAfterVat = 0; //T???ng ti???n sau thu???
      this.totalAmountPromotion = 0; //T???ng ti???n khuy???n m???i
      this.totalAmountDiscount = 0; //T???ng th??nh ti???n chi???t kh???u
      this.customerOrderAmountAfterDiscount = 0; //T???ng thanh to??n
      this.amountPriceProfit = 0; //L???i nhu???n t???m t??nh
      this.valuePriceProfit = 0; //% l???i nhu???n t???m t??nh
      this.totalSumAmountLabor = 0; //T???ng th??nh ti???n nh??n c??ng
      this.amountAdvance = 0; //Ti???n t???m ???ng

      //Danh s??ch s???n ph???m d???ch v???
      this.listQuoteDetailModel.forEach(item => {
        let price = item.quantity * item.unitPrice * item.exchangeRate;

        /*T???ng gi?? tr??? h??ng h??a b??n ra*/
        this.amount += this.roundNumber(price, defaultNumberType);
        /*End*/

        /*Ti???n v???n*/
        let amountInitial = item.quantity * item.priceInitial * item.exchangeRate;
        /*End*/

        /*T???ng gi?? tr??? h??ng h??a ?????u v??o*/
        this.amountPriceInitial += this.roundNumber(amountInitial, defaultNumberType);
        /*End*/

        /*Ti???n chi???t kh???u*/
        if (item.discountType) {
          item.amountDiscount = price * item.discountValue / 100;
        }
        else {
          item.amountDiscount = item.discountValue;
        }
        /*End*/

        /*T???ng th??nh ti???n chi???t kh???u*/
        this.totalAmountDiscount += item.amountDiscount;
        /*End*/

        /*Ti???n thu??? VAT*/
        let amountVAT = (price - item.amountDiscount + item.sumAmountLabor) * item.vat / 100;
        /*End*/

        /*T???ng thu??? VAT*/
        this.totalAmountVat += amountVAT;
        /*End*/

        /*Th??nh ti???n*/
        item.sumAmount = price - item.amountDiscount + amountVAT + item.sumAmountLabor;
        /*End*/

        /*T???ng th??nh ti???n nh??n c??ng*/
        this.totalSumAmountLabor += item.sumAmountLabor;
        /*End*/
      });

      //Danh s??ch chi ph??
      this.listQuoteCostDetailModel.forEach(item => {
        let price = item.quantity * item.unitPrice;

        /*T???ng chi ph??*/
        this.amountPriceCost += this.roundNumber(price, defaultNumberType);
        /*End*/
      });

      //Ki???m tra c?? ????? ??i???u ki???n nh???n qu?? khuy???n m???i kh??ng
      this.promotionService.checkPromotionByAmount(this.amount).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.isPromotionAmount = result.isPromotionAmount;
        }
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(mgs);
        }
      });
      /*End*/

      //N???u kh??ng ????? ??i???u ki???n nh???n khuy???n m???i th?? x??a c??c qu?? khuy???n m???i ????
      let ignoreList = this.listPromotionApply.filter(x => x.conditionsType == 3 && x.soTienTu > this.amount);
      this.listPromotionApply = this.listPromotionApply.filter(x => !ignoreList.includes(x));

      /*T??nh l???i th??nh ti???n c???a Tab khuy???n m???i*/
      this.listPromotionApply.forEach(item => {
        //N???u l?? phi???u gi???m gi??
        if (!item.productId) {
          //N???u l?? s??? ti???n
          if (!item.loaiGiaTri) {
            item.amount = item.giaTri * item.soLuongTang;
          }
          //N???u l?? %
          else {
            item.amount = this.roundNumber((this.amount * item.giaTri / 100) * item.soLuongTang, defaultNumberType);
          }
        }
        //N???u l?? s???n ph???m
        else {
          item.amount = item.giaTri * item.soLuongTang;
        }
      });
      /*End*/

      /*T???ng ti???n khuy???n m???i*/
      this.listPromotionApply.forEach(item => {
        //Ch??? t??nh v???i phi???u gi???m gi??
        if (!item.productId) {
          this.totalAmountPromotion += item.amount;
        }
      });
      /*End*/

      /*Ki???m tra n???u c?? ??t nh???t 1 s???n ph???m c?? chi???t kh???u > 0 ho???c vat > 0*/
      let hasDiscount = false;
      let hasVat = false;
      this.listQuoteDetailModel.forEach(item => {
        if (item.discountValue > 0) {
          hasDiscount = true;
        }

        if (item.vat > 0) {
          hasVat = true;
        }
      });

      if (hasDiscount) {
        //Lo???i chi???t kh???u: Theo ti???n
        this.discountTypeControl.setValue(this.discountTypeList.find(x => x.value == false));

        //T???ng th??nh ti???n chi???t kh???u
        this.discountValueControl.setValue(this.totalAmountDiscount);
      }
      else {
        /*T???ng th??nh ti???n chi???t kh???u*/
        let discountType: DiscountType = this.discountTypeControl.value;
        let discountValue = ParseStringToFloat(this.discountValueControl.value);

        if (discountType.value) {
          this.totalAmountDiscount = this.amount * discountValue / 100;
        }
        else {
          this.totalAmountDiscount = discountValue;
        }
        /*End*/
      }
      /*End*/

      if (hasVat) {
        this.vatMessage = 'T???n t???i s???n ph???m c?? thu???';
        this.vatControl.setValue('0');
      }
      else {
        this.vatMessage = '';
        let vat = ParseStringToFloat(this.vatControl.value);
        this.totalAmountVat = (this.amount + this.totalSumAmountLabor - this.totalAmountDiscount - this.totalAmountPromotion) * vat / 100;
      }

      /*T???ng ti???n sau thu???
      = T???ng GTHH b??n ra + T???ng th??nh ti???n nh??n c??ng - T???ng chi???t kh???u - T???ng khuy???n m???i + T???ng thu??? VAT + T???ng chi ph??
      */
      this.totalAmountAfterVat = this.amount + this.totalSumAmountLabor
        - this.totalAmountDiscount - this.totalAmountPromotion + this.totalAmountVat + this.amountPriceCost;

      /*Ti???n t???m ???ng*/
      let percentAdvanceType: DiscountType = this.percentAdvanceTypeControl.value;
      let percentAdvance = ParseStringToFloat(this.percentAdvanceControl.value);

      if (percentAdvanceType.value) {
        this.amountAdvance = this.totalAmountAfterVat * percentAdvance / 100;
      } else {
        this.amountAdvance = percentAdvance
      }
      /*End*/

      /*N???u T???ng thanh to??n kh??ng ??m v?? kh??c 0*/
      if (this.totalAmountAfterVat > 0) {
        /*L???i nhu???n t???m t??nh*/
        this.amountPriceProfit = this.roundNumber(this.totalAmountAfterVat - this.amountPriceInitial, defaultNumberType);
        /*End*/

        /*% l???i nhu???n t???m t??nh*/
        this.valuePriceProfit = this.roundNumber((this.amountPriceProfit / this.totalAmountAfterVat) * 100, defaultNumberType);
        /*End*/
      }
      //N???u T???ng thanh to??n ??m ho???c b???ng 0
      else {
        this.totalAmountAfterVat = 0;
        this.amountPriceProfit = 0;
        this.valuePriceProfit = 0;
      }
      /*End*/
    }
  }

  /*Event thay ?????i c?? h???i*/
  changeLead(value: any) {
    this.hoSoThauControl.reset();
    this.personInChargeControl.reset();
    this.listQuoteDetailModel = [];

    if (value) {
      /*Kh??ch h??ng s??? l?? kh??ch h??ng c???a H??? s?? th???u*/
      let customerType = this.getCustomerType(value.customerId);
      //L?? kh??ch h??ng ?????nh danh
      if (customerType == 1) {
        this.objectList = this.listCustomer;
        let customer = this.listCustomer.find(x => x.customerId == value.customerId);

        if (customer) {
          this.setDataFormCustomer(customer);
        }
      }
      //L?? kh??ch h??ng Ti???m n??ng
      else if (customerType == 0) {
        this.selectedObjectType = 'lea';
        this.objectList = this.listCustomerNew;
        let customerNew = this.listCustomerNew.find(x => x.customerId == value.customerId);

        if (customerNew) {
          this.setDataFormCustomer(customerNew);
        }
      }
      //kh??ch h??ng kh??ng x??c ?????nh
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ng x??c ?????nh ???????c kh??ch h??ng c???a C?? h???i' };
        this.showMessage(mgs);
      }
      /*End*/

      let defaultNumberType = parseInt(this.defaultNumberType, 10);
      this.listSaleBidding = this.listAllSaleBidding.filter(h => h.leadId == value.leadId);

      let personInChargeId = value.personInChargeId ?? null;
      if (personInChargeId) {
        let personInCharge: Employee = this.listEmpSale.find(x => x.employeeId == personInChargeId);
        this.personInChargeControl.setValue(personInCharge);
      }

      /*Th??m list s???n ph???m d???ch v??? c???a C?? h???i v??o list s???n ph???m d???ch v??? c???a B??o gi??*/
      value.listLeadDetail.forEach((element, index) => {
        let obj: QuoteDetail = new QuoteDetail;
        obj.productCategoryId = element.productCategory;
        obj.vendorId = element.vendorId;
        obj.productId = element.productId;
        obj.quantity = element.quantity;
        obj.unitPrice = element.unitPrice;
        obj.currencyUnit = element.currencyUnit;
        obj.exchangeRate = element.exchangeRate;
        obj.vat = element.vat;
        obj.discountType = element.discountType;
        obj.discountValue = element.discountValue;
        obj.description = element.description;
        obj.orderDetailType = element.orderDetailType;
        obj.unitId = element.unitId;
        obj.incurredUnit = element.incurredUnit;
        obj.productCode = element.productCode;
        obj.nameMoneyUnit = element.nameMoneyUnit;
        obj.nameVendor = element.nameVendor;
        obj.productNameUnit = element.productNameUnit;
        obj.productName = element.productName;
        obj.unitLaborPrice = element.unitLaborPrice;
        obj.unitLaborNumber = element.unitLaborNumber;
        obj.orderNumber = index + 1;

        let sumprice = element.quantity * element.unitPrice * element.exchangeRate;
        if (obj.discountType) {
          obj.amountDiscount = sumprice * element.discountValue / 100;
        }
        else {
          obj.amountDiscount = sumprice - element.discountValue;
        }
        let vatAmount = (sumprice - obj.amountDiscount) * element.vat / 100;
        obj.sumAmount = this.roundNumber(sumprice - obj.amountDiscount + vatAmount, defaultNumberType);

        element.leadProductDetailProductAttributeValue.forEach(item => {
          let attributeValue: QuoteProductDetailProductAttributeValue = new QuoteProductDetailProductAttributeValue;
          attributeValue.productId = item.productId;
          attributeValue.productAttributeCategoryId = item.productAttributeCategoryId;
          attributeValue.productAttributeCategoryValueId = item.productAttributeCategoryValueId;
          obj.quoteProductDetailProductAttributeValue.push(attributeValue);
        });

        this.listQuoteDetailModel = [...this.listQuoteDetailModel, obj];
      });
      /*End*/
    }
    else {
      //N???u c?? kh??ch h??ng ??ang ???????c ch???n th?? list H??? s?? th???u s??? l???y theo kh??ch h??ng ??ang ???????c ch???n
      if (this.objCustomer) {
        this.listSaleBidding = this.listAllSaleBidding.filter(x => x.customerId == this.objCustomer.customerId);
      }
      //N???u kh??ng c?? kh??ch h??ng ??ang ???????c ch???n th?? list H??? s?? th???u s??? l???y theo ng?????i ??ang ????ng nh???p
      else {
        this.listSaleBidding = this.listAllSaleBidding;
      }
    }

    this.calculatorAmount();
  }

  /*Hi???n th??? l???i Kh??ch h??ng, Email, S??t, ?????a ch???, S??? ng??y ???????c n???, S??? n??? t???i ??a theo CustomerId*/
  setDataFormCustomer(customer: Customer) {
    this.objectControl.setValue(customer);
    this.objCustomer = customer;
    this.email = customer.customerEmail;
    this.phone = customer.customerPhone;
    this.fullAddress = customer.fullAddress;

    //S??? ng??y ???????c n???
    let daysAreOwed = customer.maximumDebtDays ? customer.maximumDebtDays : 0;
    this.daysAreOwedControl.setValue(daysAreOwed);

    //S??? n??? t???i ??a
    let maxAmount = customer.maximumDebtValue ? customer.maximumDebtValue : 0;
    this.maxDebtControl.setValue(maxAmount);

    //Reset T??i kho???n ng??n h??ng
    this.isShowBankAccount = false;
    this.listBankAccount = [];
    this.bankAccountControl.setValue(null);
    //End

    //Ph????ng th???c thanh to??n
    const toSelectPaymentMethod = this.listPaymentMethod.find(c => c.isDefault === true);
    this.paymentMethodControl.setValue(toSelectPaymentMethod);

    if (toSelectPaymentMethod?.categoryCode == "CASH") {
      this.isShowBankAccount = false;
    }
    else if (toSelectPaymentMethod?.categoryCode == "BANK") {
      this.isShowBankAccount = true;
    }
    else {
      this.isShowBankAccount = false;
    }

    //N???u Ph????ng th???c thanh to??n l?? Chuy???n kho???n th?? l???y ra list account bank
    if (this.isShowBankAccount == true) {
      this.bankService.getAllBankAccountByObject(customer.customerId, this.customerContactCode).subscribe(response => {
        let result = <any>response;

        this.listBankAccount = result.bankAccountList;
        if (this.listBankAccount.length > 0) {
          let toSelectBankAccount = this.listBankAccount[0];
          this.bankAccountControl.setValue(toSelectBankAccount);
        }
      });
    }
  }

  /*Event thay ?????i H??? s?? th???u*/
  changeSaleBidding(value: any) {
    //list s???n ph???m d???ch v??? c???a b??o gi?? s??? b??? x??a ??i
    this.listQuoteDetailModel = [];

    //list C?? h???i s??? b??? x??a ??i
    this.listLead = [];
    this.coHoiControl.reset();

    this.personInChargeControl.reset();

    //N???u ch???n H??? s?? th???u
    if (value) {
      /*Kh??ch h??ng s??? l?? kh??ch h??ng c???a H??? s?? th???u*/
      let customerType = this.getCustomerType(value.customerId);
      //L?? kh??ch h??ng ?????nh danh
      if (customerType == 1) {
        this.objectList = this.listCustomer;
        let customer = this.listCustomer.find(x => x.customerId == value.customerId);

        if (customer) {
          this.setDataFormCustomer(customer);
        }
      }
      //L?? kh??ch h??ng Ti???m n??ng
      else if (customerType == 0) {
        this.selectedObjectType = 'lea';
        this.objectList = this.listCustomerNew;
        let customerNew = this.listCustomerNew.find(x => x.customerId == value.customerId);

        if (customerNew) {
          this.setDataFormCustomer(customerNew);
        }
      }
      //kh??ch h??ng kh??ng x??c ?????nh
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ng x??c ?????nh ???????c kh??ch h??ng c???a C?? h???i' };
        this.showMessage(mgs);
      }
      /*End*/

      //Ch???n C?? h???i g???n v???i H??? s?? th???u
      let leadObj = this.listAllLead.find(l => l.leadId == value.leadId);
      if (leadObj) {
        this.listLead.push(leadObj);
        this.coHoiControl.setValue(leadObj);
      }

      //Nh??n vi??n b??n h??ng (ng?????i ph??? tr??ch) c???a b??o gi?? s??? l?? ng?????i ph??? tr??ch c???a H??? s?? th???u
      if (value.personInChargeId !== null) {
        let emp = this.listEmpSale.find(e => e.employeeId == value.personInChargeId);
        this.personInChargeControl.setValue(emp);
      }

      /*
      * Th??m c??c s???n ph???m d???ch v??? trong H??? s?? v??o list s???n ph???m d???ch v??? c???a B??o gi??
      * Nh??n vi??n b??n h??ng s??? thay ?????i l?? nh??n vi??n ph??? tr??ch H??? s?? th???u
      */
      value.saleBiddingDetail.forEach((element, index) => {
        let obj: QuoteDetail = new QuoteDetail;
        obj.productCategoryId = element.productCategory;
        obj.vendorId = element.vendorId;
        obj.productId = element.productId;
        obj.quantity = element.quantity;
        obj.unitPrice = element.unitPrice;
        obj.currencyUnit = element.currencyUnit;
        obj.exchangeRate = element.exchangeRate;
        obj.vat = element.vat;
        obj.discountType = element.discountType;
        obj.discountValue = element.discountValue;
        obj.description = element.description;
        obj.orderDetailType = element.orderDetailType;
        obj.unitId = element.unitId;
        obj.incurredUnit = element.incurredUnit;
        obj.productCode = element.productCode;
        obj.productName = element.productName;
        obj.nameMoneyUnit = element.nameMoneyUnit;
        obj.nameVendor = element.nameVendor;
        obj.productNameUnit = element.productNameUnit;
        obj.unitLaborPrice = element.unitLaborPrice;
        obj.unitLaborNumber = element.unitLaborNumber;
        obj.orderNumber = index + 1;

        let sumprice = element.quantity * element.unitPrice * element.exchangeRate;
        if (obj.discountType) {
          obj.amountDiscount = sumprice * element.discountValue / 100;
        }
        else {
          obj.amountDiscount = sumprice - element.discountValue;
        }
        let vatAmount = (sumprice - obj.amountDiscount) * element.vat / 100;
        obj.sumAmount = sumprice - obj.amountDiscount + vatAmount;

        element.saleBiddingDetailProductAttribute.forEach(item => {
          let attributeValue: QuoteProductDetailProductAttributeValue = new QuoteProductDetailProductAttributeValue;
          attributeValue.productId = item.productId;
          attributeValue.productAttributeCategoryId = item.productAttributeCategoryId;
          attributeValue.productAttributeCategoryValueId = item.productAttributeCategoryValueId;
          obj.quoteProductDetailProductAttributeValue.push(attributeValue);
        });

        this.listQuoteDetailModel = [...this.listQuoteDetailModel, obj];
      });
    }
    //N???u b??? ch???n H??? s?? th???u
    else {
      //N???u c?? kh??ch h??ng ??ang ???????c ch???n th?? list C?? h???i s??? l???y theo kh??ch h??ng ??ang ???????c ch???n
      if (this.objCustomer) {
        this.listLead = this.listAllLead.filter(x => x.customerId == this.objCustomer.customerId);
      }
      //N???u kh??ng c?? kh??ch h??ng ??ang ???????c ch???n th?? list C?? h???i s??? l???y theo ng?????i ??ang ????ng nh???p
      else {
        this.listLead = this.listAllLead;
      }
    }

    this.calculatorAmount();
  }

  /*Event thay ?????i ph????ng th???c thanh to??n*/
  changeMethodControl(value: Category) {
    if (value.categoryCode == "BANK") {
      let customer: Customer = this.objectControl.value;

      if (customer && this.selectedObjectType == 'cus') {
        //N???u ???? ch???n kh??ch h??ng
        this.isShowBankAccount = true;
        let customerId = customer.customerId;

        this.bankService.getAllBankAccountByObject(customerId, this.customerContactCode).subscribe(response => {
          let result = <any>response;

          this.listBankAccount = result.bankAccountList;
          if (this.listBankAccount.length > 0) {
            let toSelectBankAccount = this.listBankAccount[0];
            this.bankAccountControl.setValue(toSelectBankAccount);
          }
        });
      }
    } else {
      this.isShowBankAccount = false;
      this.listBankAccount = [];
      this.bankAccountControl.setValue(null);
    }
  }

  quoteStatusBeforeClear: string = null;  //Bi???n l??u m?? tr???ng th??i b??o gi?? tr?????c khi compareDate() ???????c th???c hi???n
  /*Event thay ?????i Ng??y g???i d??? ki???n v?? ng??y hi???u l???c*/
  compareDate() {
    let sendDate: Date = this.sendDateControl.value;
    let effectiveDate = this.effectiveDateControl.value;
    if (effectiveDate == null || effectiveDate == '') {
      this.effectiveDateControl.setValue('30');
      effectiveDate = 30;
    } else {
      effectiveDate = parseFloat(this.effectiveDateControl.value.replace(/,/g, ''));
    }

    let quoteStatus: Category = this.quoteStatusControl.value;
    this.quoteStatusBeforeClear = quoteStatus.categoryCode; //L??u l???i m?? tr???ng th??i
    if (sendDate) {
      //T??nh: ng??y h???t h???n c???a b??o gi?? = ng??y g???i + ng??y hi???u l???c
      let current_miliseconds = sendDate.getTime();
      let result_miliseconds = current_miliseconds + effectiveDate * 1000 * 60 * 60 * 24;
      this.expirationDate = convertToUTCTime(new Date(result_miliseconds));
    }
  }

  /*Event Khi x??a ng??y g???i (event n??y lu??n ???????c g???i sau event onBlur v?? onSelect)
  * X??? d???ng event n??y trong tr?????ng h???p tr???ng th??i c???a b??o gi?? kh??ng thay ?????i khi n?? thu???c m???t trong c??c
  * tr???ng th??i ???????c quy ?????nh
  */
  clearSendDate() {
    //X??a ng??y h???t h???n c???a b??o gi?? v?? ng??y g???i hi???n t???i ???? null
    this.expirationDate = null;
  }

  /*Event L??u c??c file ???????c ch???n*/
  handleFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= this.defaultLimitedFileSize) {
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

  /*Th??m m???t th??ng tin b??? sung*/
  addAI() {
    if (this.titleText == null || this.titleText.trim() == '') {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ti??u ????? kh??ng ???????c ????? tr???ng' };
      this.showMessage(msg);
    } else if (this.contentText == null || this.contentText.trim() == '') {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'N???i dung kh??ng ???????c ????? tr???ng' };
      this.showMessage(msg);
    } else {
      this.maxOrdinal++;
      let note: AdditionalInformation = {
        ordinal: this.maxOrdinal,
        additionalInformationId: this.emptyGuid,
        objectId: this.emptyGuid,
        objectType: '',
        title: this.titleText.trim(),
        content: this.contentText.trim(),
        active: true,
        createdDate: new Date(),
        createdById: this.emptyGuid,
        updatedDate: null,
        updatedById: null,
        orderNumber: null
      };

      //Ki???m tra xem title ???? t???n t???i ch??a
      let check = this.listAdditionalInformation.find(x => x.title == note.title);
      if (check) {
        //N???u t???n t???i r???i th?? kh??ng cho th??m v?? hi???n th??? c???nh b??o
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ti??u ????? n??y ???? t???n t???i' };
        this.showMessage(msg);
      } else {
        this.listAdditionalInformation.push(note);

        this.titleText = '';
        this.contentText = '';
      }
    }
  }

  /*Hi???n th??? l???i th??ng tin b??? sung*/
  reShowNote(event: any) {
    let rowData = event.data;
    this.isUpdateAI = true;
    this.AIUpdate.ordinal = rowData.ordinal;
    this.AIUpdate.title = rowData.title;

    this.titleText = rowData.title;
    this.contentText = rowData.content;
  }

  /*H???y c???p nh???t th??ng tin b??? sung*/
  cancelAI() {
    this.isUpdateAI = false;
    this.AIUpdate = {
      ordinal: null,
      additionalInformationId: this.emptyGuid,
      objectId: this.emptyGuid,
      objectType: '',
      title: null,
      content: null,
      active: true,
      createdDate: new Date(),
      createdById: this.emptyGuid,
      updatedDate: null,
      updatedById: null,
      orderNumber: null
    };
    this.titleText = '';
    this.contentText = '';
  }

  /*C???p nh???t th??ng tin b??? sung*/
  updateContentAI() {
    if (this.titleText == null || this.titleText.trim() == '') {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ti??u ????? kh??ng ???????c ????? tr???ng' };
      this.showMessage(msg);
    } else if (this.contentText == null || this.contentText.trim() == '') {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'N???i dung kh??ng ???????c ????? tr???ng' };
      this.showMessage(msg);
    } else {
      var check = this.listAdditionalInformation.find(x => x.title == this.AIUpdate.title);
      if (check) {
        //Ki???m tra xem title ???? t???n t???i ch??a
        let checkDublicate = this.listAdditionalInformation.find(x => x.title == this.titleText.trim() && x.ordinal != this.AIUpdate.ordinal);

        if (checkDublicate) {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ti??u ????? n??y ???? t???n t???i' };
          this.showMessage(msg);
        } else {
          this.listAdditionalInformation.forEach(item => {
            if (item.title == this.AIUpdate.title) {
              item.title = this.titleText.trim();
              item.content = this.contentText.trim();
            }
          });

          //reset form
          this.isUpdateAI = false;
          this.AIUpdate = {
            ordinal: null,
            additionalInformationId: this.emptyGuid,
            objectId: this.emptyGuid,
            objectType: '',
            title: null,
            content: null,
            active: true,
            createdDate: new Date(),
            createdById: this.emptyGuid,
            updatedDate: null,
            updatedById: null,
            orderNumber: null
          };
          this.titleText = '';
          this.contentText = '';
        }
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Kh??ng t???n t???i th??ng tin b??? sung n??y' };
        this.showMessage(msg);
      }
    }
  }

  /*X??a th??ng tin b??? sung*/
  deleteAI(rowData) {

    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        let index = this.listAdditionalInformation.indexOf(rowData);
        this.listAdditionalInformation.splice(index, 1);
      }
    });
  }

  /*Th??m s???n ph???m d???ch v???*/
  addCustomerOrderDetail() {
    let cusGroupId = null;
    if (this.objCustomer !== null && this.objCustomer !== undefined) cusGroupId = this.objCustomer.customerGroupId;
    let ref = this.dialogService.open(AddEditProductDialogComponent, {
      data: {
        isCreate: true,
        cusGroupId: cusGroupId,
        orderDate: new Date(),
        type : 'SALE',
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

    ref.onClose.subscribe(async (result: ResultDialog) => {
      if (result) {
        if (result.status) {
          let quoteDetailModel: QuoteDetail = result.quoteDetailModel;

          //set orderNumber cho s???n ph???m/d???ch v??? m???i th??m
          quoteDetailModel.orderNumber = this.listQuoteDetailModel.length + 1;

          //Ki???m tra s???n ph???m c?? ????? ??i???u ki???n nh???n qu?? KM?
          if (quoteDetailModel.productId != null && quoteDetailModel.productId != this.emptyGuid) {
            let response: any = await this.promotionService.checkPromotionByProduct(quoteDetailModel.productId, quoteDetailModel.quantity);
            quoteDetailModel.isPromotionProduct = response.isPromotionProduct;
          }

          this.listQuoteDetailModel = [...this.listQuoteDetailModel, quoteDetailModel];
          this.calculatorAmount();
        }
      }
    });
  }

  /*S???a m???t s???n ph???m d???ch v???*/
  onRowSelect(dataRow) {
    //N???u c?? quy???n s???a th?? m???i cho s???a
    var index = this.listQuoteDetailModel.indexOf(dataRow);
    var OldArray = this.listQuoteDetailModel[index];

    let cusGroupId = null;
    if (this.objCustomer !== null && this.objCustomer !== undefined) cusGroupId = this.objCustomer.customerGroupId;
    let ref = this.dialogService.open(AddEditProductDialogComponent, {
      data: {
        isCreate: false,
        cusGroupId: cusGroupId,
        quoteDetailModel: OldArray,
        orderDate: new Date()
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

    ref.onClose.subscribe(async (result: ResultDialog) => {
      if (result) {
        if (result.status) {
          this.listQuoteDetailModel.splice(index, 1);
          let quoteDetailModel = result.quoteDetailModel;

          //Ki???m tra s???n ph???m c?? ????? ??i???u ki???n nh???n qu?? KM?
          if (quoteDetailModel.productId != null && quoteDetailModel.productId != this.emptyGuid) {
            let response: any = await this.promotionService.checkPromotionByProduct(quoteDetailModel.productId, quoteDetailModel.quantity);
            quoteDetailModel.isPromotionProduct = response.isPromotionProduct;
          }

          this.listQuoteDetailModel = [...this.listQuoteDetailModel, quoteDetailModel];
          this.reOrderListQuoteDetail();

          this.calculatorAmount();
        }
      }
    });
  }

  /*X??a m???t s???n ph???m d???ch v???*/
  deleteItem(dataRow) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.listQuoteDetailModel = this.listQuoteDetailModel.filter(e => e != dataRow);
        //????nh l???i s??? OrderNumber
        this.listQuoteDetailModel.forEach((item, index) => {
          item.orderNumber = index + 1;
        });

        this.calculatorAmount();
      }
    });
  }

  /*Th??m m???t chi ph??*/
  addCostQuote() {
    let ref = this.dialogService.open(PopupAddEditCostQuoteDialogComponent, {
      data: {
        isCreate: true
      },
      header: 'Th??m chi ph??',
      width: '30%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultCostDialog) => {
      if (result) {
        if (result.status) {
          let quoteCostDetailModel: QuoteCostDetail = result.quoteDetailModel;
          this.listQuoteCostDetailModel = [...this.listQuoteCostDetailModel, quoteCostDetailModel];

          this.calculatorAmount();
        }
      }
    });
  }

  /*S???a m???t chi ph??*/
  onRowCostSelect(dataRow) {
    //N???u c?? quy???n s???a th?? m???i cho s???a
    var index = this.listQuoteCostDetailModel.indexOf(dataRow);
    var OldArray = this.listQuoteCostDetailModel[index];

    let titlePopup = 'S???a chi ph??';

    let ref = this.dialogService.open(PopupAddEditCostQuoteDialogComponent, {
      data: {
        isCreate: false,
        quoteDetailModel: OldArray
      },
      header: titlePopup,
      width: '30%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultCostDialog) => {
      if (result) {
        if (result.status) {
          let quoteCostDetailModel: QuoteCostDetail = result.quoteDetailModel;
          this.listQuoteCostDetailModel[index] = quoteCostDetailModel;

          this.calculatorAmount();
        }
      }
    });
  }

  /*X??a m???t chi ph??*/
  deleteCostItem(dataRow) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        let index = this.listQuoteCostDetailModel.indexOf(dataRow);
        this.listQuoteCostDetailModel.splice(index, 1);
        this.listQuoteCostDetailModel = [...this.listQuoteCostDetailModel];

        this.calculatorAmount();
      }
    });
  }

  showTotalQuote() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 8 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  /*Event khi thay ?????i lo???i chi???t kh???u: Theo % ho???c Theo s??? ti???n*/
  changeDiscountType(value: DiscountType) {
    this.discountValueControl.setValue('0');

    if (this.appName == 'VNS') {
      //Danh s??ch s???n ph???m d???ch v???: Reset chi???t kh???u c???a t???t c??? s???n ph???m v??? 0
      this.listQuoteDetailModel.forEach(item => {
        item.discountValue = 0;
      });
    }

    this.calculatorAmount();
  }

  /*Event khi thay ?????i gi?? tr??? chi???t kh???u*/
  changeDiscountValue() {
    if (this.appName == 'VNS') {
      //Danh s??ch s???n ph???m d???ch v???: Reset chi???t kh???u c???a t???t c??? s???n ph???m v??? 0
      this.listQuoteDetailModel.forEach(item => {
        item.discountValue = 0;
      });
    }

    let discountValue = 0;
    if (this.discountValueControl.value.trim() == '') {
      discountValue = 0;
      this.discountValueControl.setValue('0');
    } else {
      discountValue = parseFloat(this.discountValueControl.value.replace(/,/g, ''));
    }

    let discountType = this.discountTypeControl.value;
    let codeDiscountType = discountType.code;
    //N???u lo???i chi???t kh???u l?? theo % th?? gi?? tr??? discountValue kh??ng ???????c l???n h??n 100%
    if (codeDiscountType == "PT") {
      if (discountValue > 100) {
        discountValue = 100;
        this.discountValueControl.setValue('100');
      }
    }

    this.calculatorAmount();
  }

  addPlan() {
    let item = new QuotePlanModel();
    item.tt = this.listQuotePlans.length + 1;
    this.listQuotePlans = [...this.listQuotePlans, item];
  }
  deletePlan(rowData: QuotePlanModel) {
    this.listQuotePlans = this.listQuotePlans.filter(e => e != rowData);
    var index = 1;
    this.listQuotePlans.forEach(item => { item.tt = index; index++; })
  }

  /*T???o b??o gi??*/
  createQuote(value: boolean) {
    if (!this.quoteForm.valid) {
      Object.keys(this.quoteForm.controls).forEach(key => {
        if (this.quoteForm.controls[key].valid == false) {
          this.quoteForm.controls[key].markAsTouched();
        }
      });

      this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
      this.isOpenNotifiError = true;  //Hi???n th??? message l???i
      this.emitStatusChangeForm = this.quoteForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });
    } else if (this.listQuoteDetailModel.length == 0) {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ph???i c?? ??t nh???t m???t s???n ph???m d???ch v??? ???????c ch???n' };
      this.showMessage(mgs);
    } else {
      if (this.uploadedFiles.length > 0) {
        this.uploadFiles(this.uploadedFiles);
        this.converToArrayQuoteDocument(this.uploadedFiles);
      }

      /*Binding data for quoteModel*/
      let quote = this.mapDataToModel();

      //List Ng?????i tham gia
      let listSelectedParticipant: Array<Employee> = this.participantControl.value;
      let listParticipant = listSelectedParticipant?.map(x => x.employeeId) ?? [];

      let minProfitExpect = parseFloat(this.minimumProfit.replace(/%/g, ''));
      let minProfit = this.valuePriceProfit;

      if (minProfit < minProfitExpect) {
        this.confirmationService.confirm({
          message: 'M???c l???i nhu???n t???m t??nh th???p h??n m???c k??? v???ng (' + minProfitExpect + '%), b???n c?? mu???n ti???p t???c kh??ng?',
          accept: () => {
            this.awaitResult = false;
            this.loading = true;
            this.CreateQuote(quote, this.listQuoteDetailModel, 1, this.arrayQuoteDocumentModel,
              this.listAdditionalInformation, this.listQuoteCostDetailModel,
              false, this.emptyGuid, listParticipant, this.listPromotionApply, this.listQuotePlans, [], this.listQuotePaymentTerm, value);
          },
          // reject: () => {
          //   this.router.navigate(['/customer/quote-detail', { quoteId: result.quoteID }]);
          // }
        });
      } else {
        this.awaitResult = false;
        this.loading = true;
        this.CreateQuote(quote, this.listQuoteDetailModel, 1, this.arrayQuoteDocumentModel,
          this.listAdditionalInformation, this.listQuoteCostDetailModel,
          false, this.emptyGuid, listParticipant, this.listPromotionApply, this.listQuotePlans, [], this.listQuotePaymentTerm, value);
      }
    }
  }


  CreateQuote(quote: Quote, listQuoteDetailModel: Array<QuoteDetail>, typeAccount: number, arrayQuoteDocumentModel: Array<QuoteDocument>,
    listAdditionalInformation: Array<any>, listQuoteCostDetailModel: Array<QuoteCostDetail>, isClone: boolean, quoteIdClone: string,
    listParticipant: string[], listPromotionApply: Array<PromotionObjectApply>, listQuotePlans: Array<QuotePlanModel>,
    listQuoteScopes: Array<QuoteScopeModel>, listQuotePaymentTerm: Array<QuotePaymentTerm>, isSaveAndNew: boolean) {

    this.quoteService.CreateQuote(quote, listQuoteDetailModel, typeAccount, arrayQuoteDocumentModel,
      listAdditionalInformation, listQuoteCostDetailModel,
      isClone, quoteIdClone, listParticipant, listPromotionApply, listQuotePlans, listQuoteScopes, listQuotePaymentTerm).subscribe(response => {
        let result = <any>response;
        this.loading = false;
        if (result.statusCode == 200) {
          let messageCode = "T???o b??o gi?? th??nh c??ng";
          let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: messageCode };
          this.showMessage(mgs);

          if (isSaveAndNew) {
            //L??u v?? th??m m???i
            if (this.emitStatusChangeForm) {
              this.emitStatusChangeForm.unsubscribe();
              this.isInvalidForm = false; //???n icon-warning-active
            }
            this.resetForm();
            this.awaitResult = false;
          } else {
            //L??u
            this.router.navigate(['/customer/quote-detail', { quoteId: result.quoteID }]);
          }
        } else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(mgs);
        }
      });
  }

  mapDataToModel(): Quote {
    let quote = new Quote();

    quote.quoteId = this.emptyGuid;
    quote.quoteCode = '';
    quote.quoteName = this.nameQuoteControl.value?.trim();
    quote.quoteDate = convertToUTCTime(new Date);
    let sendQuoteDate = (this.sendDateControl != null ? this.sendDateControl.value : null);
    if (sendQuoteDate) {
      sendQuoteDate = convertToUTCTime(sendQuoteDate);
      quote.sendQuoteDate = sendQuoteDate;
    } else {
      quote.sendQuoteDate = null;
    }

    let personInCharge: Employee = this.personInChargeControl.value != null ? this.personInChargeControl.value : null;
    if (personInCharge) {
      quote.personInChargeId = personInCharge.employeeId;
    } else {
      quote.personInChargeId = null;
    }
    quote.seller = quote.personInChargeId;

    let effectiveQuoteDate = parseFloat(this.effectiveDateControl.value.replace(/,/g, ''));
    quote.effectiveQuoteDate = effectiveQuoteDate;

    quote.expirationDate = this.expirationDate;

    let description = this.descriptionControl.value != null ? this.descriptionControl.value.trim() : '';
    quote.description = description;

    let note = this.noteControl.value != null ? this.noteControl.value.trim() : '';
    quote.note = note;

    quote.objectType = 'CUSTOMER';

    let object: Customer = this.objectControl.value;
    quote.objectTypeId = object.customerId;

    let paymentMethod: Category = this.paymentMethodControl.value != null ? this.paymentMethodControl.value : null;
    if (paymentMethod) {
      quote.paymentMethod = paymentMethod.categoryId;
    } else {
      quote.paymentMethod = null;
    }

    let discountType: DiscountType = this.discountTypeControl.value;
    quote.discountType = discountType.value;

    let bankAccount: BankAccount = this.bankAccountControl.value;
    if (bankAccount) {
      quote.bankAccountId = bankAccount.bankAccountId;
    } else {
      quote.bankAccountId = null;
    }

    let daysAreOwed = this.daysAreOwedControl.value != null ? parseFloat(this.daysAreOwedControl.value.replace(/,/g, '')) : 0;
    quote.daysAreOwed = daysAreOwed;

    let maxDebt = this.maxDebtControl.value != null ? parseFloat(this.maxDebtControl.value.replace(/,/g, '')) : 0;
    quote.maxDebt = maxDebt;

    quote.receivedDate = convertToUTCTime(new Date());
    quote.receivedHour = null;
    quote.recipientName = '';
    quote.locationOfShipment = '';
    quote.shippingNote = '';
    quote.recipientPhone = '';
    quote.recipientEmail = '';
    quote.placeOfDelivery = '';

    let intendedQuoteDate = this.intendedDateControl.value;
    quote.intendedQuoteDate = convertToUTCTime(intendedQuoteDate);

    quote.amount = this.amount;

    let discountValue = this.discountValueControl.value != null ? this.discountValueControl.value : '0';
    discountValue = parseFloat(discountValue.replace(/,/g, ''));
    quote.discountValue = discountValue;

    let statusQuote: Category = this.quoteStatusControl.value;
    quote.statusId = statusQuote.categoryId;

    let lead: any = this.coHoiControl.value != null ? this.coHoiControl.value : null;
    if (lead) {
      quote.leadId = lead.leadId;
    } else {
      quote.leadId = null;
    }

    let saleBillding: any = this.hoSoThauControl.value != null ? this.hoSoThauControl.value : null;
    if (saleBillding) {
      quote.saleBiddingId = saleBillding.saleBiddingId;
    } else {
      quote.saleBiddingId = null;
    }

    let investmentFundId: any = this.kenhControl.value != null ? this.kenhControl.value : null;
    if (investmentFundId) {
      quote.investmentFundId = investmentFundId.categoryId;
    } else {
      quote.investmentFundId = null;
    }

    quote.vat = ParseStringToFloat(this.vatControl.value.toString());

    let type: DiscountType = this.percentAdvanceTypeControl.value;
    quote.percentAdvanceType = type.value;

    quote.percentAdvance = ParseStringToFloat(this.percentAdvanceControl.value.toString());

    quote.constructionTime = this.constructionTimeControl.value != null ? this.constructionTimeControl.value : null;

    quote.active = true;
    quote.createdById = this.emptyGuid;
    quote.createdDate = convertToUTCTime(new Date());
    quote.updatedById = this.emptyGuid;
    quote.updatedDate = convertToUTCTime(new Date());

    return quote;
  }

  resetForm() {
    this.objCustomer = null;
    this.selectedObjectType = 'cus';  //Lo???i kh??ch h??ng (Kh??ch h??ng ti???m n??ng ho???c Kh??ch h??ng)
    this.objectList = this.listCustomer;
    this.objectControl.reset();
    this.phone = '';
    this.email = '';
    this.fullAddress = '';
    this.paymentMethodControl.setValue(this.listPaymentMethod.find(x => x.isDefault == true));
    this.daysAreOwedControl.setValue('0');
    this.maxDebtControl.setValue('0');
    this.listBankAccount = [];
    this.bankAccountControl.setValue(null);
    this.isShowBankAccount = false;
    this.quoteStatusControl.setValue(this.listQuoteStatus.find(x => x.isDefault == true));
    this.intendedDateControl.setValue(new Date());
    this.sendDateControl.setValue(null);
    this.sendDateControl.setValidators(null);
    this.sendDateControl.updateValueAndValidity();
    this.effectiveDateControl.setValue('30');
    this.expirationDate = null;
    this.personInChargeControl.reset();
    this.hoSoThauControl.reset();
    this.coHoiControl.reset();
    this.kenhControl.reset();
    this.nameQuoteControl.reset();
    this.descriptionControl.setValue('');
    this.noteControl.setValue('');
    this.uploadedFiles = [];
    if (this.fileUpload) {
      this.fileUpload.clear();  //X??a to??n b??? file trong control
    }
    this.titleText = '';
    this.contentText = '';
    this.isUpdateAI = false;
    this.listAdditionalInformation = [];
    this.arrayQuoteDocumentModel = [];
    this.listQuoteDetailModel = [];
    this.listQuoteCostDetailModel = [];
    this.discountTypeControl.setValue(this.discountTypeList.find(x => x.code == "PT"));
    this.discountValueControl.setValue('0');

    this.amount = 0; //T???ng gi?? tr??? h??ng h??a b??n ra
    this.amountPriceInitial = 0; //T???ng gi?? tr??? h??ng h??a ?????u v??o
    this.amountPriceCost = 0; //T???ng chi ph??
    this.amountPriceCostNotInclude = 0; //T???ng chi ph??
    this.totalAmountVat = 0; //T???ng thu??? VAT
    this.totalAmountAfterVat = 0; //T???ng ti???n sau thu???
    this.totalAmountPromotion = 0; //T???ng ti???n khuy???n m???i
    this.totalAmountDiscount = 0; //T???ng th??nh ti???n chi???t kh???u
    this.customerOrderAmountAfterDiscount = 0; //T???ng thanh to??n
    this.amountPriceProfit = 0; //L???i nhu???n t???m t??nh
    this.valuePriceProfit = 0; //% l???i nhu???n t???m t??nh
  }

  // Upload file to server
  uploadFiles(files: File[]) {
    this.imageService.uploadFile(files).subscribe(response => { });
  }

  cancel() {
    this.router.navigate(['/customer/quote-list']);
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  converToArrayQuoteDocument(fileList: File[]) {
    for (var x = 0; x < fileList.length; ++x) {
      let quoteDocumentModel = new QuoteDocument();
      quoteDocumentModel.documentName = fileList[x].name;
      quoteDocumentModel.documentSize = fileList[x].size + '';
      quoteDocumentModel.createdDate = convertToUTCTime(new Date());
      quoteDocumentModel.updatedDate = convertToUTCTime(new Date());
      this.arrayQuoteDocumentModel.push(quoteDocumentModel);
    }
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  async showDialogImport() {
    await this.getInforDetailQuote();
    this.displayDialog = true;
  }

  downloadTemplateExcel() {
    this.quoteService.downloadTemplateProduct().subscribe(response => {
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
        link.download = fileName;
        link.click();
      }
    }, error => { this.loading = false; });
  }

  chooseFile(event: any) {
    this.fileName = event.target.files[0].name;
    this.importFileExcel = event.target;
  }

  cancelFile() {
    $("#importFileProduct").val("")
    this.fileName = "";
  }

  /* L???y master data ????? import v?? export s???n ph???m d???ch v??? */
  async getInforDetailQuote() {
    let result: any = await this.productService.getMasterdataCreateProduct(this.productType);
    if (result.statusCode === 200) {
      this.productCodeSystemList = result.listProductCode;
      this.listProductUnitName = result.listProductUnitName;
    };

    let result_2: any = await this.quoteService.getDataQuoteAddEditProductDialogAsync();
    if (result_2.statusCode == 200) {
      this.listProduct = result_2.listProduct;
      this.listUnitMoney = result_2.listUnitMoney;
      this.listUnitProduct = result_2.listUnitProduct;
    }
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
          let isPattermSL = /^\d+$/.test(row[3].toString().trim());

          if (!isPattermSL) {
            this.messErrFile.push('C???t s??? l?????ng t???i d??ng ' + (i + 2) + ' sai ?????nh d???ng');
          }
        }
        if (row[4] === null || row[4] === undefined || row[4] == "") {
          this.messErrFile.push('C???t ????n gi?? t???i d??ng ' + (i + 2) + ' kh??ng ???????c ????? tr???ng');
        }
        else {
          let isPattermDG = /^\d+$/.test(row[4].toString().trim());

          if (!isPattermDG) {
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
        let sheetName = 'BOM Lines';
        if (workbook.Sheets[sheetName] === undefined) {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
          this.showMessage(mgs);
          return;
        }

        //l???y data t??? file excel c???a kh??ch h??ng doanh nghi???p
        const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[sheetName];
        /* save data */
        let listProductImport: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
        //remove header row
        listProductImport.shift();
        let productCodeList: string[] = [];
        let productUnitList: string[] = [];

        let isValidation = this.validateFile(listProductImport);
        if (isValidation) {
          this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = true;  //Hi???n th??? message l???i
        }
        else {
          var messCodeErr = [];
          var messUnitErr = [];
          this.isInvalidForm = false;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = false;  //Hi???n th??? message l???i

          listProductImport.forEach((row, i) => {
            // L???y gi?? tr??? b???n ghi trong excel b???t ?????u t??? line 6
            if (i > 4 && row.length != 0) {
              if (row[1] !== null && row[1] !== undefined && row[1].trim() != "") {
                let rowObj = productCodeList.filter(p => p.trim().toUpperCase() == row[1].trim().toUpperCase());
                if (rowObj.length === 0) {
                  productCodeList.push(row[1].toLowerCase().trim());
                }
                let check = this.productCodeSystemList.find(d => d.toLowerCase().trim() == row[1].trim().toLowerCase());
                if (check === undefined || check === null) {
                  messCodeErr.push(i + 2);
                }
              };
              if (row[5] !== null && row[5] !== undefined && row[5].trim() != "" &&
                (row[1] !== null && row[1] !== undefined && row[1].trim() != "")) {
                let rowObj = productUnitList.filter(p => p.trim().toUpperCase() == row[5].trim().toUpperCase());
                if (rowObj.length === 0) {
                  productUnitList.push(row[5].toLowerCase().trim());
                  let check = this.listProductUnitName.find(d => d.toLowerCase().trim() == row[5].trim().toLowerCase());
                  if (check === undefined || check === null) {
                    messUnitErr.push(i + 2);
                  }
                }
              };
            }
          });

          let countCode = this.productCodeSystemList.filter(c => productCodeList.includes(c.toLowerCase().trim()));
          let countUnit = this.listProductUnitName.filter(u => productUnitList.includes(u.toLowerCase().trim()));

          //chu???n h??a m???ng
          productCodeList = [...new Set(productCodeList.map(e => Boolean(e) === true && e.trim().toLowerCase()))];
          countCode = [...new Set(countCode.map(e => Boolean(e) === true && e.trim().toLowerCase()))];
          countUnit = [...new Set(countUnit.map(e => Boolean(e) === true && e.trim().toLowerCase()))];

          if (countCode.length == productCodeList.length && countUnit.length == productUnitList.length) {
            this.listQuoteDetailExcelModel = [];

            listProductImport.forEach((row, i) => {
              // L???y gi?? tr??? b???n ghi trong excel b???t ?????u t??? line 6
              if (i > 4 && row.length != 0 && (
                (row[1] !== null && row[1] !== undefined && row[1].trim() != "") || (row[2] !== null && row[2] !== undefined && row[2].trim() != "") || (row[5] !== null && row[5] !== undefined && row[5].trim() != "")
              )
              ) {
                let newCustomer: QuoteDetailExcel = {
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
                this.listQuoteDetailExcelModel.push(newCustomer);
              }
            });
            // l???y ti???n VND
            var moneyUnit = this.listUnitMoney.find(c => c.categoryCode == "VND");

            this.listQuoteDetailExcelModel.forEach(item => {
              let detailProduct = new QuoteDetail();
              if (item.ProductCode == null || item.ProductCode.trim() == "" || item.ProductCode == undefined) {
                /* d???ch v??? */

                detailProduct.orderDetailType = 1;
                detailProduct.active = true;
                detailProduct.currencyUnit = moneyUnit.categoryId;
                detailProduct.discountType = item.DiscountType;
                detailProduct.exchangeRate = 1;
                detailProduct.incurredUnit = item.CurrencyUnit;
                detailProduct.nameMoneyUnit = moneyUnit.categoryCode;
                detailProduct.description = item.ProductName;
                detailProduct.productName = item.ProductName;
                detailProduct.quantity = item.Quantity;
                detailProduct.unitPrice = item.UnitPrice;
                detailProduct.vat = item.Tax;
                detailProduct.discountValue = item.DiscountValue;
                detailProduct.sumAmount = item.TotalAmount;
                detailProduct.priceInitial = 0;
                detailProduct.isPriceInitial = false;

                this.listQuoteDetailModel = [...this.listQuoteDetailModel, detailProduct];
                this.reOrderListQuoteDetail();
              }
              else {
                /* s???n ph???m, h??ng h??a */

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
                detailProduct.priceInitial = 0;
                detailProduct.isPriceInitial = false;

                let product = this.listProduct.find(p => p.productCode.trim() == item.ProductCode.trim());
                detailProduct.productId = product.productId;
                detailProduct.productCode = product.productCode;
                detailProduct.productName = item.ProductName;

                //L???y ????n v??? t??nh
                let productUnitId = product.productUnitId;
                let productUnitName = this.listUnitProduct.find(x => x.categoryId == productUnitId).categoryName;
                detailProduct.productNameUnit = productUnitName;
                detailProduct.unitId = productUnitId;

                this.listQuoteDetailModel = [...this.listQuoteDetailModel, detailProduct];
                this.reOrderListQuoteDetail();
              }
            });

            //set l???i orderNumber
            this.listQuoteDetailModel.forEach((item, index) => {
              item.orderNumber = index + 1;
            });

            this.calculatorAmount();

            this.cancelFile();
            this.isInvalidForm = false;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = false;  //Hi???n th??? message l???i
          }
          if (countCode.length != productCodeList.length) {
            this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = true;  //Hi???n th??? message l???i
            messCodeErr.forEach(item => {
              this.messErrFile.push('M?? s???n ph???m t???i d??ng ' + item + ' kh??ng t???n t???i trong h??? th???ng')
            })
          }
          if (countUnit.length != productUnitList.length) {
            this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = true;  //Hi???n th??? message l???i
            messUnitErr.forEach(item => {
              this.messErrFile.push('????n v??? t??nh t???i d??ng ' + item + ' kh??ng t???n t???i trong h??? th???ng')
            })
          }
        }
        this.displayDialog = false;
      }
    }
  }

  async exportExcel() {
    await this.getInforDetailQuote();
    let dateUTC = new Date();
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

    this.listQuoteDetailModel.forEach((item, index) => {
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
        headerRowIndex.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        if (index == 1 || index == 2 || index == 5 || index == 9) {
          headerRowIndex.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: 'left' };
        }
        if (index == 3 || index == 4 || index == 6 || index == 7 || index == 8 || index == 10 || index == 11) {
          headerRowIndex.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: 'right' };
        }
      });
    })

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

  /* Chuy???n item l??n m???t c???p */
  moveUp(data: QuoteDetail) {
    let currentOrderNumber = data.orderNumber;
    let preOrderNumber = currentOrderNumber - 1;
    let pre_data = this.listQuoteDetailModel.find(x => x.orderNumber == preOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    pre_data.orderNumber = currentOrderNumber;
    data.orderNumber = preOrderNumber;

    //X??a 2 item
    this.listQuoteDetailModel = this.listQuoteDetailModel.filter(x =>
      x.orderNumber != preOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listQuoteDetailModel = [...this.listQuoteDetailModel, pre_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listQuoteDetailModel.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Chuy???n item xu???ng m???t c???p */
  moveDown(data: QuoteDetail) {
    let currentOrderNumber = data.orderNumber;
    let nextOrderNumber = currentOrderNumber + 1;
    let next_data = this.listQuoteDetailModel.find(x => x.orderNumber == nextOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    next_data.orderNumber = currentOrderNumber;
    data.orderNumber = nextOrderNumber;

    //X??a 2 item
    this.listQuoteDetailModel = this.listQuoteDetailModel.filter(x =>
      x.orderNumber != nextOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listQuoteDetailModel = [...this.listQuoteDetailModel, next_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listQuoteDetailModel.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Thay ?????i ng?????i ph??? tr??ch */
  changeParticipant() {
    if (this.participantControl.value?.length > 0) {
      this.tooltipSelectedParticipant = this.participantControl.value?.map(x => x.employeeCode).join(', ');
    }
    else {
      this.tooltipSelectedParticipant = null;
    }
  }

  gotoViewCustomer() {
    this.router.navigate(['/customer/detail', { customerId: this.objCustomer.customerId }]);
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

  reOrderListQuoteDetail() {
    this.listQuoteDetailModel.forEach((item, index) => item.orderNumber = index + 1);
    this.listQuoteDetailModel.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /*Show popup c??c CTKM c?? th??? ??p d???ng*/
  showPromotion(conditionsType: number, productId?: string, quantity?: number, productName?: string) {
    let titleHeader = '';
    let listReshowPromotionApply: Array<PromotionObjectApply> = [];

    if (conditionsType == 1) {
      titleHeader = 'khuy???n m???i d??nh cho ' + this.objCustomer.customerCodeName;
      listReshowPromotionApply = [...this.listPromotionApply];
    }
    else if (conditionsType == 2) {
      titleHeader = 'khuy???n m???i d??nh cho ' + productName;

      if (this.listPromotionApplyProduct.length > 0) {
        listReshowPromotionApply = [...this.listPromotionApply, ...this.listPromotionApplyProduct];
      }
    }
    else if (conditionsType == 3) {
      titleHeader = 'khuy???n m???i d??nh cho T???ng gi?? tr??? s???n ph???m';
      listReshowPromotionApply = [...this.listPromotionApply];
    }

    let ref = this.dialogService.open(PromotionApplyPopupComponent, {
      data: {
        conditionsType: conditionsType,
        customerId: this.objCustomer?.customerId,
        listReshowPromotionApply: listReshowPromotionApply,
        totalAmountAfterVat: this.totalAmountAfterVat,
        productId: productId,
        quantity: quantity
      },
      header: titleHeader,
      width: '50%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe(result => {
      if (result) {
        let selectedPromotionApply: Array<PromotionApply> = result;

        if (conditionsType == 1) {
          this.listPromotionApply = this.listPromotionApply.filter(x => x.conditionsType != 1);

          selectedPromotionApply.forEach(item => {
            item.selectedPromotionProductApply.forEach(product => {
              let promotionApply = new PromotionObjectApply();
              promotionApply.promotionId = item.promotionId;
              promotionApply.promotionName = item.promotionName;
              promotionApply.conditionsType = item.conditionsType;
              promotionApply.propertyType = item.propertyType;
              promotionApply.propertyTypeName = item.propertyTypeName;
              promotionApply.notMultiplition = item.notMultiplition;
              promotionApply.promotionMappingId = product.promotionMappingId;
              promotionApply.productId = product.productId;
              promotionApply.productUnitName = product.productUnitName;
              promotionApply.promotionProductName = product.promotionProductName;
              promotionApply.promotionProductNameConvert = product.promotionProductNameConvert;
              promotionApply.soLuongTang = product.soLuongTang;
              promotionApply.loaiGiaTri = product.loaiGiaTri;
              promotionApply.giaTri = product.giaTri;
              promotionApply.soTienTu = product.soTienTu;

              this.listPromotionApply = [...this.listPromotionApply, promotionApply];
            });
          });
        }
        else if (conditionsType == 3) {
          this.listPromotionApply = this.listPromotionApply.filter(x => x.conditionsType != 3);

          selectedPromotionApply.forEach(item => {
            item.selectedPromotionProductApply.forEach(product => {
              let promotionApply = new PromotionObjectApply();
              promotionApply.promotionId = item.promotionId;
              promotionApply.promotionName = item.promotionName;
              promotionApply.conditionsType = item.conditionsType;
              promotionApply.propertyType = item.propertyType;
              promotionApply.propertyTypeName = item.propertyTypeName;
              promotionApply.notMultiplition = item.notMultiplition;
              promotionApply.promotionMappingId = product.promotionMappingId;
              promotionApply.productId = product.productId;
              promotionApply.productUnitName = product.productUnitName;
              promotionApply.promotionProductName = product.promotionProductName;
              promotionApply.promotionProductNameConvert = product.promotionProductNameConvert;
              promotionApply.soLuongTang = product.soLuongTang;
              promotionApply.loaiGiaTri = product.loaiGiaTri;
              promotionApply.giaTri = product.giaTri;
              promotionApply.soTienTu = product.soTienTu;

              this.listPromotionApply = [...this.listPromotionApply, promotionApply];
            });
          });
        }
        else if (conditionsType == 2) {
          this.listPromotionApply = this.listPromotionApply.filter(x => x.conditionsType != 2);
          this.listPromotionApplyProduct = [];

          selectedPromotionApply.forEach(item => {
            //mua h??ng t??ng phi???u gi???m gi??
            if (item.propertyType == 3) {
              item.selectedPromotionProductApply.forEach(product => {
                let promotionApply = new PromotionObjectApply();
                promotionApply.promotionId = item.promotionId;
                promotionApply.promotionName = item.promotionName;
                promotionApply.conditionsType = item.conditionsType;
                promotionApply.propertyType = item.propertyType;
                promotionApply.propertyTypeName = item.propertyTypeName;
                promotionApply.notMultiplition = item.notMultiplition;
                promotionApply.promotionMappingId = product.promotionMappingId;
                promotionApply.productId = product.productId;
                promotionApply.productUnitName = product.productUnitName;
                promotionApply.promotionProductName = product.promotionProductName;
                promotionApply.promotionProductNameConvert = product.promotionProductNameConvert;
                promotionApply.soLuongTang = product.soLuongTang;
                promotionApply.loaiGiaTri = product.loaiGiaTri;
                promotionApply.giaTri = product.giaTri;
                promotionApply.soTienTu = product.soTienTu;

                this.listPromotionApply = [...this.listPromotionApply, promotionApply];
              });
            }
            //mua h??ng gi???m gi?? h??ng
            else if (item.propertyType == 1) {
              let promotionApply = new PromotionObjectApply();
              promotionApply.promotionId = item.promotionId;
              promotionApply.promotionName = item.promotionName;
              promotionApply.conditionsType = item.conditionsType;
              promotionApply.propertyType = item.propertyType;
              promotionApply.propertyTypeName = item.propertyTypeName;
              promotionApply.notMultiplition = item.notMultiplition;
              promotionApply.promotionMappingId = null;
              promotionApply.productId = null;
              promotionApply.productUnitName = null;
              promotionApply.promotionProductName = null;
              promotionApply.promotionProductNameConvert = null;
              promotionApply.soLuongTang = 0;
              promotionApply.loaiGiaTri = false;
              promotionApply.giaTri = 0;
              promotionApply.soTienTu = 0;
              promotionApply.selectedDetail = item.selectedDetail;

              promotionApply.selectedPromotionObjectApplyMapping = [];

              item.selectedPromotionProductMappingApply.forEach(product => {
                let selected = new PromotionObjectApplyMapping();

                selected.promotionMappingId = product.promotionMappingId;
                selected.productId = product.productId;
                selected.quantity = product.quantity;

                promotionApply.selectedPromotionObjectApplyMapping.push(selected);
              });

              this.listPromotionApplyProduct = [...this.listPromotionApplyProduct, promotionApply];
            }
            //mua h??ng t???ng h??ng
            else if (item.propertyType == 2) {
              item.selectedPromotionProductMappingApply.forEach(product => {
                let promotionApply = new PromotionObjectApply();
                promotionApply.promotionId = item.promotionId;
                promotionApply.promotionName = item.promotionName;
                promotionApply.conditionsType = item.conditionsType;
                promotionApply.propertyType = item.propertyType;
                promotionApply.propertyTypeName = item.propertyTypeName;
                promotionApply.notMultiplition = item.notMultiplition;
                promotionApply.promotionMappingId = product.promotionMappingId;
                promotionApply.productId = product.productId;
                promotionApply.productUnitName = product.productUnitName;
                promotionApply.promotionProductName = product.productName;
                promotionApply.soLuongTang = product.quantity;
                promotionApply.loaiGiaTri = false;
                promotionApply.giaTri = 0;
                promotionApply.soTienTu = 0;
                promotionApply.selectedDetail = item.selectedDetail;

                this.listPromotionApply = [...this.listPromotionApply, promotionApply];
              });
            }
          });
        }

        this.calculatorAmount();
      }
    });
  }

  /*Thay ?????i vat c???a c??? ????n h??ng*/
  changeVatValue() {
    if (this.appName == 'VNS') {
      //Danh s??ch s???n ph???m d???ch v???: Reset vat c???a t???t c??? s???n ph???m v??? 0
      this.listQuoteDetailModel.forEach(item => {
        item.vat = 0;
      });
    }

    let value = this.vatControl.value;

    if (value == '') {
      this.vatControl.setValue('0');
    }
    else {
      let vat = ParseStringToFloat(value);

      if (vat > 100) {
        this.vatControl.setValue('100');
      }
    }

    this.calculatorAmount();
  }

  /*Event khi thay ?????i lo???i t???m ???ng: Theo % ho???c Theo s??? ti???n*/
  changePercentAdvanceType(value: DiscountType) {
    this.percentAdvanceControl.setValue('0');

    this.calculatorAmount();
  }

  /* Thay ?????i % t???m ???ng */
  changePercentAdvance() {
    if (this.appName == 'VNS') {
      let value = 0;
      if (this.percentAdvanceControl.value.trim() == '') {
        value = 0;
        this.percentAdvanceControl.setValue('0');
      } else {
        value = parseFloat(this.percentAdvanceControl.value.replace(/,/g, ''));
      }

      let type = this.percentAdvanceTypeControl.value;
      let codeType = type.code;
      //N???u l?? theo % th?? gi?? tr??? kh??ng ???????c l???n h??n 100%
      if (codeType == "PT") {
        if (value > 100) {
          value = 100;
          this.percentAdvanceControl.setValue('100');
        }
      }
    }
    else {
      let value = this.percentAdvanceControl.value;

      if (value == '') {
        this.percentAdvanceControl.setValue('0');
      }
      else {
        let percentAdvance = ParseStringToFloat(this.percentAdvanceControl.value);

        if (percentAdvance > 100) {
          this.percentAdvanceControl.setValue('100');
        }
      }
    }

    this.calculatorAmount();
  }

  addPaymentTerm() {
    let item = new QuotePaymentTerm();
    item.orderNumber = this.listQuotePaymentTerm.length + 1;
    this.listQuotePaymentTerm = [...this.listQuotePaymentTerm, item];
  }

  deletePaymentTerm(rowData: QuotePaymentTerm) {
    this.listQuotePaymentTerm = this.listQuotePaymentTerm.filter(e => e != rowData);
    var index = 1;
    this.listQuotePaymentTerm.forEach(item => { item.orderNumber = index; index++; })
  }

  handleChange(event) {
    this.CDRef.detectChanges();
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

//So s??nh gi?? tr??? nh???p v??o c?? thu???c kho???ng x??c ?????nh hay kh??ng?
function ageRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (isNaN(control.value) ||
      parseFloat(control.value.replace(/,/g, '')) < min ||
      parseFloat(control.value.replace(/,/g, '')) > max)) {
      return { 'ageRange': true };
    }
    return null;
  };
}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}
