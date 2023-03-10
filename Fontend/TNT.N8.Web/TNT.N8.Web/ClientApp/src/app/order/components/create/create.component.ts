import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { NumberToStringPipe } from '../../../shared/ConvertMoneyToString/numberToString.pipe';
import { CustomerOrder } from '../../models/customer-order.model';
import { OrderProductDetailProductAttributeValue } from '../../models/order-product-detail-product-attribute-value.model';
import { ContactModel } from '../../../shared/models/contact.model';
import { CustomerService } from '../../../customer/services/customer.service';
import { CustomerOrderService } from '../../services/customer-order.service';
import { BankService } from '../../../shared/services/bank.service';
import { ContactService } from '../../../shared/services/contact.service';
import { QuoteService } from '../../../customer/services/quote.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { EmailConfigService } from '../../../admin/services/email-config.service';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component';
import { CustomerOrderDetail } from '../../models/customer-order-detail.model';
import * as $ from 'jquery';
import { PopupAddEditCostQuoteDialogComponent } from '../../../shared/components/add-edit-cost-quote/add-edit-cost-quote.component';
import { OrderCostDetail } from '../../models/customer-order-cost-detail.model';
import { TranslateService } from '@ngx-translate/core';

interface ResultDialog {
  status: boolean,
  customerOrderDetailModel: CustomerOrderDetail,
}

interface DiscountType {
  name: string;
  code: string;
  value: boolean;
}

interface OrderStatus {
  orderStatusId: string;
  orderStatusCode: string;
  description: string;
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
}

interface Customer {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fullAddress: string;
  paymentId: string;
  maximumDebtDays: number;
  maximumDebtValue: number;
  taxCode: string;
  personInChargeId: string;
}

interface Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isDefault: boolean;
}

interface BankAccount {
  bankAccountId: string;
  bankName: string; //Ng??n h??ng
  accountNumber: string;  //S??? t??i kho???n
  branchName: string; //Chi nh??nh
  accountName: string; //Ch??? t??i kho???n
  objectId: string;
}

interface CustomerType {
  typeValue: number;
  typeName: string;
}

interface QuoteResponse {
  quoteId: string;
  quoteCode: string;
  quoteDate: Date;
  sendQuoteDate: Date;
  seller: string;
  effectiveQuoteDate: number;
  expirationDate: Date;
  description: string;
  note: string;
  objectTypeId: string;
  objectType: string;
  customerContactId: string;
  paymentMethod: string;
  discountType: boolean;
  bankAccountId: string;
  daysAreOwed: number;
  maxDebt: number;
  receivedDate: Date;
  amount: number;
  discountValue: number;
  intendedQuoteDate: Date;
  statusId: string;
  createdDate: Date;
  personInChargeId: string;
  sellerName: string;
}

interface ResultCostDialog {
  status: boolean,  //L??u th?? true, H???y l?? false
  quoteDetailModel: OrderCostDetail,
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  /*Khai b??o bi???n*/
  auth: any = JSON.parse(localStorage.getItem("auth"));
  employeeId: string = JSON.parse(localStorage.getItem('auth')).EmployeeId;
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  minimumProfit = this.systemParameterList.find(x => x.systemKey == 'MinimumProfitExpect').systemValueString;
  defaultNumberType = this.getDefaultNumberType();
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  awaitResult: boolean = false;

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

  // fixed: boolean = false;
  // withFiexd: string = "";
  // @HostListener('document:scroll', [])
  // onScroll(): void {
  //   let num = window.pageYOffset;
  //   if (num > 100) {
  //     this.fixed = true;
  //     var width: number = $('#parent').width();
  //     this.withFiexd = width + 'px';
  //   } else {
  //     this.fixed = false;
  //     this.withFiexd = "";
  //   }
  // }

  /* Form */
  colLeft: number = 8;
  isShow: boolean = true;
  createOrderForm: FormGroup;
  orderDateControl: FormControl;
  quoteControl: FormControl;
  orderContractControl: FormControl;
  orderStatusControl: FormControl;
  sellerControl: FormControl;
  descriptionControl: FormControl;
  noteControl: FormControl;
  customerControl: FormControl;
  cusNameControl: FormControl;
  customerMSTControl: FormControl;
  customerPhoneControl: FormControl;
  customerAddressControl: FormControl;
  paymentMethodControl: FormControl;
  daysAreOwedControl: FormControl;
  maxDebtControl: FormControl;
  bankAccountControl: FormControl;
  customerGroupControl: FormControl;
  customerCodeControl: FormControl;
  customerNameControl: FormControl;
  customerTypeControl: FormControl;
  newCusPaymentMethodControl: FormControl;
  newCusDaysAreOwedControl: FormControl;
  newCusMaxDebtControl: FormControl;
  paymentMethodQuoteControl: FormControl;
  daysAreOwedQuoteControl: FormControl;
  maxDebtQuoteControl: FormControl;
  receivedDateControl: FormControl;
  receivedHourControl: FormControl;
  recipientNameControl: FormControl;
  locationOfShipmentControl: FormControl;
  placeOfDeliveryControl: FormControl;
  recipientPhoneControl: FormControl;
  recipientEmailControl: FormControl;
  shippingNoteControl: FormControl;
  discountTypeControl: FormControl;
  discountValueControl: FormControl;
  wareHouseControl: FormControl;
  /* End */

  /* Valid Form */
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  /* End */

  listOrderCostDetailModel: Array<OrderCostDetail> = [];
  listOrderStatus: Array<OrderStatus> = [];
  listProduct: Array<any> = [];
  listQuote: Array<any> = [];
  listQuoteObj: Array<any> = [];
  listWare: Array<any> = [];
  listOrderContract: Array<any> = []; // List h???p ?????ng
  listContract: Array<any> = []; // List h???p ?????ng
  listEmployee: Array<Employee> = [];
  listPersonInCharge: Array<Employee> = [];
  optionCustomer: string = '2';
  listCustomer: Array<any> = [];
  cusObj: any = null;
  customerEmail: string = '';
  customerPhone: string = '';
  fullAddress: string = '';
  leadName: string = '';
  leadEmail: string = '';
  leadPhone: string = '';
  leadFullAddress: string = '';
  listPaymentMethod: Array<Category> = [];
  listCustomerBankAccount: Array<BankAccount> = [];
  isShowBankAccount: boolean = false;
  listBankAccount: Array<BankAccount> = [];
  customerContactCode: string = 'CUS';
  listUnitMoney: Array<Category> = [];
  unitMoneyLabel: string = 'VND';
  listCustomerGroup: Array<Category> = [];
  listCustomerCode: Array<string> = [];
  listCustomerType: Array<CustomerType> = [
    {
      typeValue: 2,
      typeName: 'Kh??ch h??ng c?? nh??n'
    },
    {
      typeValue: 1,
      typeName: 'Kh??ch h??ng doanh nghi???p'
    }
  ];
  quoteObj: any;
  contractObj: any;
  warehouseName: string = '';
  cols: any[];
  selectedColumns: any[];
  colsCost: any[];
  selectedColumnsCost: any[];
  selectedItem: any;
  listCustomerOrderDetailModel: Array<CustomerOrderDetail> = [];
  discountTypeList: Array<DiscountType> = [
    { "name": "Theo %", "code": "PT", "value": true },
    { "name": "S??? ti???n", "code": "ST", "value": false }
  ];

  autoGenValue: boolean = true;

  customerId: string = null;
  quoteId: string = null;
  contractId: string = null;

  typeAccount: number = 2;

  customerOrderModel: CustomerOrder = {
    OrderId: this.emptyGuid,
    OrderCode: '',
    OrderDate: new Date(),
    Seller: this.auth.UserId,
    Description: '',
    Note: '',
    CustomerId: this.emptyGuid,
    CustomerContactId: null,
    PaymentMethod: this.emptyGuid,
    DaysAreOwed: null,
    MaxDebt: 0,
    ReceivedDate: new Date(),
    ReceivedHour: null,
    RecipientName: '',
    LocationOfShipment: '',
    ShippingNote: '',
    RecipientPhone: '',
    RecipientEmail: '',
    PlaceOfDelivery: '',
    Amount: 0,
    DiscountValue: 0,
    ReceiptInvoiceAmount: null,
    StatusId: null,
    CreatedById: this.auth.UserId,
    CreatedDate: new Date(),
    UpdatedById: this.emptyGuid,
    UpdatedDate: new Date(),
    Active: true,
    DiscountType: true,
    BankAccountId: null,
    QuoteId: null,
    ReasonCancel: null,
    IsAutoGenReceiveInfor: true,
    CustomerName: null,
    CustomerAddress: null,
    OrderContractId: null,
    WarehouseId: null,
  };

  contactModel = new ContactModel();

  arrayCustomerOrderDetailModel: Array<CustomerOrderDetail> = [];
  arrayOrderProductDetailProductAttributeValueModel: Array<OrderProductDetailProductAttributeValue> = [];

  CustomerOrderAmountAfterDiscount: number = 0;
  TotalSumAmountProduct: number = 0;
  TotalSumAmountCost: number = 0;
  TotalSumAmountCostNotInclude: number = 0;
  TotalSumVatProduct: number = 0;
  TotalPriceInitial: number = 0;
  AmountPriceProfit: number = 0;
  ValuePriceProfit: number = 0;
  CustomerOrderTotalDiscount: number = 0;
  messageConfirm: string = '';

  constructor(private translate: TranslateService,
    private router: Router,
    private getPermission: GetPermission,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private bankService: BankService,
    private customerOrderService: CustomerOrderService,
    private quoteService: QuoteService,
    private contactService: ContactService,
    public cdRef: ChangeDetectorRef,
    private emailConfigService: EmailConfigService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
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

  async ngOnInit() {
    /*Ki???m tra nh??n vi??n ho???c qu???n l??*/
    this.setForm();
    let resource = "sal/order/create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }

      this.route.params.subscribe(params => {
        this.quoteId = params['quoteID'];
        this.customerId = params['customerId'];
        this.contractId = params['contractId'];
      });

      //this.setForm();
      this.setTable();

      this.loading = true;

      let createType = 1;
      let createObjectId = null;
      if (this.customerId) {
        createType = 2;
        createObjectId = this.customerId;
      }
      else if (this.quoteId) {
        createType = 3;
        createObjectId = this.quoteId;
      }
      else if (this.contractId) {
        createType = 4;
        createObjectId = this.contractId;
      }

      this.customerOrderService.getMasterDataOrderCreate(createType, createObjectId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listOrderStatus = result.listOrderStatus;
          this.listEmployee = result.listEmployee;
          this.listPersonInCharge = result.listEmployee;
          this.listCustomer = result.listCustomer;
          this.listPaymentMethod = result.listPaymentMethod;
          this.listCustomerBankAccount = result.listCustomerBankAccount;
          this.listCustomerGroup = result.listCustomerGroup;
          this.listCustomerCode = result.listCustomerCode;
          this.listQuote = result.listQuote;
          // this.listQuoteObj = result.listQuote;
          this.listWare = result.listWare;
          this.listProduct = result.listProduct;
          this.listOrderContract = result.listContract;
          // this.listContract = result.listContract;
          this.setDefaultValue();
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }
  changeWare(event) {
    if (event) {
      this.warehouseName = event.warehouseName;
    }
    else {
      this.warehouseName = '';
    }
  }
  setForm() {
    let emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';

    this.orderDateControl = new FormControl(new Date(), [Validators.required]);
    this.orderStatusControl = new FormControl(null, [Validators.required]);
    this.sellerControl = new FormControl(null, [Validators.required]);
    this.descriptionControl = new FormControl(null);
    this.quoteControl = new FormControl(null);
    this.wareHouseControl = new FormControl(null);
    this.orderContractControl = new FormControl(null);
    this.noteControl = new FormControl(null);
    this.customerControl = new FormControl(null, [Validators.required]);
    this.cusNameControl = new FormControl(null, [Validators.required]);
    this.customerMSTControl = new FormControl(null);
    this.customerPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern())]);
    this.customerAddressControl = new FormControl(null);
    this.paymentMethodControl = new FormControl(null);
    this.daysAreOwedControl = new FormControl(null);
    this.maxDebtControl = new FormControl(null);
    this.bankAccountControl = new FormControl(null);
    this.customerGroupControl = new FormControl(null);
    this.customerCodeControl = new FormControl(null);
    this.customerNameControl = new FormControl(null, [Validators.required, forbiddenSpaceText]);
    this.customerTypeControl = new FormControl(this.listCustomerType[0]);
    this.newCusPaymentMethodControl = new FormControl(null);
    this.newCusDaysAreOwedControl = new FormControl(null);
    this.newCusMaxDebtControl = new FormControl(null);
    this.paymentMethodQuoteControl = new FormControl(null);
    this.daysAreOwedQuoteControl = new FormControl(null);
    this.maxDebtQuoteControl = new FormControl(null);
    this.receivedDateControl = new FormControl(new Date(), [Validators.required]);
    this.receivedHourControl = new FormControl(null);
    this.recipientNameControl = new FormControl(null, [forbiddenSpaceText]);
    this.locationOfShipmentControl = new FormControl(null);
    this.placeOfDeliveryControl = new FormControl(null);
    this.recipientPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern())]);
    this.recipientEmailControl = new FormControl(null, [Validators.pattern(emailPattern)]);
    this.shippingNoteControl = new FormControl(null);
    this.discountTypeControl = new FormControl(this.discountTypeList.find(x => x.code == "PT"));
    this.discountValueControl = new FormControl('0');

    this.createOrderForm = new FormGroup({
      orderDateControl: this.orderDateControl,
      wareHouseControl: this.wareHouseControl,
      orderStatusControl: this.orderStatusControl,
      quoteControl: this.quoteControl,
      orderContractControl: this.orderContractControl,
      sellerControl: this.sellerControl,
      descriptionControl: this.descriptionControl,
      noteControl: this.noteControl,
      customerControl: this.customerControl,
      cusNameControl: this.cusNameControl,
      customerMSTControl: this.customerMSTControl,
      customerPhoneControl: this.customerPhoneControl,
      customerAddressControl: this.customerAddressControl,
      paymentMethodControl: this.paymentMethodControl,
      daysAreOwedControl: this.daysAreOwedControl,
      maxDebtControl: this.maxDebtControl,
      bankAccountControl: this.bankAccountControl,
      customerGroupControl: this.customerGroupControl,
      customerCodeControl: this.customerCodeControl,
      customerNameControl: this.customerNameControl,
      customerTypeControl: this.customerTypeControl,
      newCusPaymentMethodControl: this.newCusPaymentMethodControl,
      newCusDaysAreOwedControl: this.newCusDaysAreOwedControl,
      newCusMaxDebtControl: this.newCusMaxDebtControl,
      paymentMethodQuoteControl: this.paymentMethodQuoteControl,
      daysAreOwedQuoteControl: this.daysAreOwedQuoteControl,
      maxDebtQuoteControl: this.maxDebtQuoteControl,
      receivedDateControl: this.receivedDateControl,
      receivedHourControl: this.receivedHourControl,
      recipientNameControl: this.recipientNameControl,
      locationOfShipmentControl: this.locationOfShipmentControl,
      placeOfDeliveryControl: this.placeOfDeliveryControl,
      recipientPhoneControl: this.recipientPhoneControl,
      recipientEmailControl: this.recipientEmailControl,
      shippingNoteControl: this.shippingNoteControl,
      discountTypeControl: this.discountTypeControl,
      discountValueControl: this.discountValueControl
    });

    this.customerMSTControl.disable();
    this.daysAreOwedControl.disable();
    this.maxDebtControl.disable();

    if ((this.quoteId != null && this.quoteId != undefined) || (this.customerId != null && this.customerId != undefined) || (this.contractId != null && this.contractId != undefined)) {
      this.customerControl.disable();
    }
  }

  setTable() {
    this.cols = [
      { field: 'Move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
      { field: 'ProductCode', header: 'M?? s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'ProductName', header: 'T??n s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'NameVendor', header: 'Nh?? cung c???p', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'WareCode', header: 'M?? kho', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'ActualInventory', header: 'T???n kho th???c t???', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'BusinessInventory', header: 'T???n kho kinh doanh', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'Quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
      { field: 'ProductNameUnit', header: '????n v??? t??nh', width: '95px', textAlign: 'left', color: '#f44336' },
      { field: 'UnitPrice', header: '????n gi??', width: '120px', textAlign: 'right', color: '#f44336' },
      { field: 'NameMoneyUnit', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
      { field: 'ExchangeRate', header: 'T??? gi??', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'DiscountValue', header: 'Chi???t kh???u', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'Vat', header: 'Thu??? GTGT (%)', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'PriceInitial', header: 'Gi?? v???n', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'GuaranteeTime', header: 'Th???i h???n b???o h??nh', width: '170px', textAlign: 'right', color: '#f44336' },
      { field: 'SumAmount', header: 'Th??nh ti???n (VND)', width: '130px', textAlign: 'right', color: '#f44336' },
      { field: 'Delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
    ];
    this.selectedColumns = [
      { field: 'Move', header: '#', width: '95px', textAlign: 'center', color: '#f44336' },
      { field: 'ProductCode', header: 'M?? s???n ph???m/d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'ProductName', header: 'T??n s???n ph???m d???ch v???', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'Quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
      { field: 'ProductNameUnit', header: '????n v??? t??nh', width: '95px', textAlign: 'left', color: '#f44336' },
      { field: 'UnitPrice', header: '????n gi??', width: '120px', textAlign: 'right', color: '#f44336' },
      { field: 'NameMoneyUnit', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
      { field: 'SumAmount', header: 'Th??nh ti???n (VND)', width: '130px', textAlign: 'right', color: '#f44336' },
      { field: 'Delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
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

  setDefaultValue() {
    let defaultOrderStatus = this.listOrderStatus.find(x => x.orderStatusCode == "DRA");
    if (defaultOrderStatus) this.orderStatusControl.setValue(defaultOrderStatus);

    let defaultSeller = this.listEmployee.find(x => x.employeeId == this.employeeId);
    if (defaultSeller) this.sellerControl.setValue(defaultSeller);

    let defaultCustomerGroup = this.listCustomerGroup.find(x => x.categoryCode == 'MPH');
    if (defaultCustomerGroup) this.customerGroupControl.setValue(defaultCustomerGroup);

    this.customerCodeControl.setValidators([Validators.required, checkDuplicateCode(this.listCustomerCode), forbiddenSpaceText]);
    this.customerCodeControl.updateValueAndValidity();

    //T???o ????n h??ng t??? Kh??ch h??ng
    if (this.customerId) {
      this.loading = false;
      //N???u t???o ????n h??ng t??? m???t kh??ch h??ng
      let customer: Customer = this.listCustomer.find(x => x.customerId == this.customerId);
      if (customer) {
        // ma khach hang
        this.customerControl.setValue(customer);

        // ten khach hang
        this.cusNameControl.setValue(customer.customerName);

        // ma so thue
        this.customerMSTControl.setValue(customer.taxCode);

        // dien thoai
        this.customerPhoneControl.setValue(customer.customerPhone);

        // nguoi nhan hang
        this.recipientNameControl.setValue(customer.customerName);

        // dia chi
        //L???y ?????a ch??? c???a kh??ch h??ng
        this.contactService.getAddressByObject(customer.customerId, "CUS").subscribe(response => {
          let result: any = response;

          if (result.statusCode == 200) {
            this.fullAddress = result.address;
            this.customerAddressControl.setValue(this.fullAddress);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    }
    //T???o ????n h??ng t??? B??o gi??
    else if (this.quoteId) {
      let quoteModel = this.listQuote.find(q => q.quoteId == this.quoteId);
      this.quoteObj = quoteModel;
      this.quoteControl.setValue(quoteModel);

      this.listContract = this.listOrderContract.filter(oc => oc.quoteId == this.quoteId);

      this.customerOrderModel.Seller = quoteModel.seller;
      if (quoteModel.objectType == 'CUSTOMER') {
        this.customerOrderModel.CustomerId = quoteModel.objectTypeId;
      }

      let customer: Customer = this.listCustomer.find(x => x.customerId == this.customerOrderModel.CustomerId);
      if (customer) {
        this.customerControl.setValue(customer);
      }

      this.customerOrderModel.CustomerContactId = quoteModel.customerContactId;
      this.customerOrderModel.Description = quoteModel.description;
      this.customerOrderModel.Note = quoteModel.note;
      this.customerOrderModel.PaymentMethod = quoteModel.paymentMethod;
      this.customerOrderModel.DaysAreOwed = quoteModel.daysAreOwed;
      this.customerOrderModel.MaxDebt = quoteModel.maxDebt;
      this.customerOrderModel.ReceivedDate = new Date(quoteModel.receivedDate);
      this.customerOrderModel.ReceivedHour = null;
      this.customerOrderModel.RecipientName = null;
      this.customerOrderModel.LocationOfShipment = null;
      this.customerOrderModel.ShippingNote = null;
      this.customerOrderModel.RecipientPhone = null;
      this.customerOrderModel.RecipientEmail = null;
      this.customerOrderModel.PlaceOfDelivery = null;
      this.customerOrderModel.Amount = quoteModel.amount;
      this.customerOrderModel.DiscountValue = quoteModel.discountValue;
      this.customerOrderModel.CreatedById = this.emptyGuid;
      this.customerOrderModel.CreatedDate = new Date();
      this.customerOrderModel.UpdatedById = null;
      this.customerOrderModel.UpdatedDate = null;
      this.customerOrderModel.DiscountType = quoteModel.discountType;
      this.customerOrderModel.BankAccountId = quoteModel.bankAccountId;
      this.customerOrderModel.QuoteId = this.quoteId;
      this.customerOrderModel.DiscountType = quoteModel.discountType;
      this.customerOrderModel.DiscountValue = quoteModel.discountValue;
      /* End */

      quoteModel.listDetail.forEach((element, index) => {
        let obj = new CustomerOrderDetail();
        // obj.OrderDetailId = element.orderDetailId;
        // obj.OrderId = element.orderId;
        obj.VendorId = element.vendorId;
        obj.ProductId = element.productId;
        obj.Quantity = element.quantity;
        obj.UnitPrice = element.unitPrice;
        obj.CurrencyUnit = element.currencyUnit;
        obj.ExchangeRate = element.exchangeRate;
        obj.Vat = element.vat;
        obj.DiscountType = element.discountType;
        obj.DiscountValue = element.discountValue;
        obj.Description = element.description;
        obj.OrderDetailType = element.orderDetailType;
        obj.UnitId = element.unitId;
        obj.IncurredUnit = element.incurredUnit;
        obj.Active = element.active;
        obj.ExplainStr = element.nameProduct;
        obj.ProductName = element.productName;
        obj.NameVendor = element.nameVendor;
        obj.ProductNameUnit = element.nameProductUnit;
        obj.NameMoneyUnit = element.nameMoneyUnit;
        obj.AmountDiscount = obj.DiscountType == true ? (element.quantity * element.unitPrice * element.exchangeRate * element.discountValue / 100) : (element.discountValue);
        obj.PriceInitial = element.priceInitial;
        obj.IsPriceInitial = element.isPriceInitial;
        obj.WarrantyPeriod = element.warrantyPeriod;
        obj.ProductCode = element.productId ? this.listProduct.find(p => p.productId == element.productId).productCode : "";
        obj.OrderNumber = index + 1;
        obj.UnitLaborPrice = element.unitLaborPrice;
        obj.UnitLaborNumber = element.unitLaborNumber;
        obj.SumAmount = (element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount + ((element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount) * element.vat / 100;
        obj.GuaranteeTime = element.guaranteeTime;
        obj.ProductCategoryId = element.productCategoryId;

        element.quoteProductDetailProductAttributeValue.forEach(item => {
          let obtAttribute = new OrderProductDetailProductAttributeValue();
          obtAttribute.ProductId = item.productId;
          obtAttribute.ProductAttributeCategoryValueId = item.productAttributeCategoryValueId;
          obtAttribute.ProductAttributeCategoryId = item.productAttributeCategoryId;
          obj.OrderProductDetailProductAttributeValue.push(obtAttribute);
        });

        this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, obj];
      });

      quoteModel.listCostDetail.forEach(element => {
        let costObj = new OrderCostDetail();
        // costObj.OrderCostDetailId = element.orderCostDetailId;
        costObj.costId = element.costId;
        // costObj.OrderId = element.orderId;
        costObj.quantity = element.quantity;
        costObj.unitPrice = element.unitPrice;
        costObj.costName = element.costName;
        costObj.costCode = element.costCode;
        costObj.active = element.active;
        costObj.isInclude = element.isInclude;
        costObj.sumAmount = element.quantity * element.unitPrice;

        this.listOrderCostDetailModel = [...this.listOrderCostDetailModel, costObj];
      });

      //Nh??n vi??n b??n h??ng
      let seller: Employee = this.listEmployee.find(x => x.employeeId == this.customerOrderModel.Seller);
      if (seller) this.sellerControl.setValue(seller);

      //M?? t???
      this.descriptionControl.setValue(this.customerOrderModel.Description);

      //Ghi ch??
      this.noteControl.setValue(this.customerOrderModel.Note);

      //Chi???t kh???u
      let discountType: DiscountType = this.discountTypeList.find(x => x.value == this.customerOrderModel.DiscountType);
      if (discountType) this.discountTypeControl.setValue(discountType);

      //Gi?? tri chi???t kh???u
      let discountValue = this.customerOrderModel.DiscountValue;
      if (discountValue) {
        this.discountValueControl.setValue(discountValue);
      } else {
        this.discountValueControl.setValue(0);
      }

      //N???u b??o gi?? cho kh??ch h??ng
      this.optionCustomer = '2';

      this.customerEmail = customer.customerEmail;
      this.customerPhone = customer.customerPhone;
      this.cusNameControl.setValue(this.customerEmail);
      this.customerPhoneControl.setValue(this.customerPhone);
      this.cusNameControl.setValue(customer.customerName);
      this.customerMSTControl.setValue(customer.taxCode);
      this.daysAreOwedControl.setValue(customer.maximumDebtDays);
      this.maxDebtControl.setValue(customer.maximumDebtValue);

      //L???y ?????a ch??? c???a kh??ch h??ng
      this.contactService.getAddressByObject(customer.customerId, "CUS").subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.fullAddress = result.address;
          this.customerAddressControl.setValue(this.fullAddress);
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });


      //Ph????ng th???c thanh to??n
      let paymentMethod = this.listPaymentMethod.find(x => x.categoryId == this.customerOrderModel.PaymentMethod);
      if (paymentMethod) {
        this.paymentMethodControl.setValue(paymentMethod);
        if (paymentMethod.categoryCode == "BANK") {
          this.isShowBankAccount = true;
          this.listBankAccount = this.listCustomerBankAccount.filter(x => x.objectId == customer.customerId);
          if (this.listBankAccount.length > 0) {
            let toSelectBankAccount = this.listBankAccount.find(x => x.bankAccountId == this.customerOrderModel.BankAccountId);
            this.bankAccountControl.setValue(toSelectBankAccount);
          } else {
            this.listBankAccount = [];
          }
        }
      }
      // if (this.quoteId === null || this.quoteId === undefined || this.quoteId === '') {
      //   //S??? ng??y ???????c n???
      //   let daysAreOwed = this.customerOrderModel.DaysAreOwed;
      //   this.daysAreOwedControl.setValue(daysAreOwed);

      //   //S??? n??? t???i ??a
      //   let maxDebt = this.customerOrderModel.MaxDebt;
      //   this.maxDebtControl.setValue(maxDebt);
      // }
      this.autoGen(); //L???y th??ng tin giao h??ng

      this.calculatorAll();

      this.loading = false;

    }
    //T???o ????n h??ng t??? H???p ?????ng
    else if (this.contractId) {
      let objContract = this.listOrderContract.find(c => c.contractId == this.contractId);

      this.contractObj = objContract;
      this.contractObj.contractCodeName = this.contractObj.contractCode + ' - ' + this.contractObj.contractName
      this.orderContractControl.setValue(objContract);

      this.customerOrderModel.Seller = objContract.employeeId;

      this.customerOrderModel.CustomerId = objContract.customerId;

      let customer: Customer = this.listCustomer.find(x => x.customerId == objContract.customerId);

      if (customer) {
        this.customerControl.setValue(customer);
      }

      this.customerOrderModel.OrderContractId = objContract.contractId;
      this.customerOrderModel.Description = objContract.contractDescription;
      this.customerOrderModel.Note = objContract.contractNote;
      this.customerOrderModel.PaymentMethod = objContract.paymentMethodId;
      this.customerOrderModel.DaysAreOwed = null;
      this.customerOrderModel.MaxDebt = null;
      this.customerOrderModel.ReceivedDate = null;
      this.customerOrderModel.ReceivedHour = null;
      this.customerOrderModel.RecipientName = null;
      this.customerOrderModel.LocationOfShipment = null;
      this.customerOrderModel.ShippingNote = null;
      this.customerOrderModel.RecipientPhone = null;
      this.customerOrderModel.RecipientEmail = null;
      this.customerOrderModel.PlaceOfDelivery = null;
      this.customerOrderModel.Amount = objContract.amount;
      this.customerOrderModel.DiscountValue = objContract.discountValue;
      this.customerOrderModel.CreatedById = this.emptyGuid;
      this.customerOrderModel.CreatedDate = new Date();
      this.customerOrderModel.UpdatedById = null;
      this.customerOrderModel.UpdatedDate = null;
      this.customerOrderModel.DiscountType = objContract.discountType;
      this.customerOrderModel.BankAccountId = objContract.bankAccountId;
      this.customerOrderModel.QuoteId = objContract.quoteId;
      /* End */

      let quote = this.listQuote.find(q => q.quoteId === this.customerOrderModel.QuoteId);
      this.quoteControl.setValue(quote);
      this.quoteObj = quote;

      objContract.listDetail.forEach((element, index) => {
        let obj = new CustomerOrderDetail();
        // obj.OrderDetailId = element.orderDetailId;
        // obj.OrderId = element.orderId;
        obj.VendorId = element.vendorId;
        obj.ProductId = element.productId;
        obj.Quantity = element.quantity;
        obj.UnitPrice = element.unitPrice;
        obj.CurrencyUnit = element.currencyUnit;
        obj.ExchangeRate = element.exchangeRate;
        obj.Vat = element.vat;
        obj.DiscountType = element.discountType;
        obj.DiscountValue = element.discountValue;
        obj.Description = element.description;
        obj.OrderDetailType = element.orderDetailType;
        obj.UnitId = element.unitId;
        obj.IncurredUnit = element.incurredUnit;
        obj.Active = element.active;
        obj.ExplainStr = element.nameProduct;
        obj.NameVendor = element.nameVendor;
        obj.ProductNameUnit = element.nameProductUnit;
        obj.NameMoneyUnit = element.nameMoneyUnit;
        obj.AmountDiscount = obj.DiscountType == true ? (element.quantity * element.unitPrice * element.exchangeRate * element.discountValue / 100) : (element.discountValue);
        obj.SumAmount = (element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount + ((element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount) * element.vat / 100;
        obj.PriceInitial = element.priceInitial;
        obj.IsPriceInitial = element.isPriceInitial;
        obj.ProductName = element.productName;
        obj.WarrantyPeriod = element.warrantyPeriod;
        obj.ProductCode = element.productId ? this.listProduct.find(p => p.productId == element.productId).productCode : "";
        obj.UnitLaborPrice = element.unitLaborPrice;
        obj.UnitLaborNumber = element.unitLaborNumber;
        obj.OrderNumber = index + 1;
        obj.GuaranteeTime = element.guaranteeTime;
        obj.ProductCategoryId = element.productCategoryId;

        element.contractProductDetailProductAttributeValue.forEach(item => {
          let obtAttribute = new OrderProductDetailProductAttributeValue();
          obtAttribute.ProductId = item.productId;
          obtAttribute.ProductAttributeCategoryValueId = item.productAttributeCategoryValueId;
          obtAttribute.ProductAttributeCategoryId = item.productAttributeCategoryId;
          obj.OrderProductDetailProductAttributeValue.push(obtAttribute);
        });

        this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, obj];

        this.listOrderCostDetailModel = [];

        objContract.listCostDetail.forEach(element => {
          let costObj = new OrderCostDetail();
          // costObj.OrderCostDetailId = element.orderCostDetailId;
          costObj.costId = element.costId;
          // costObj.OrderId = element.orderId;
          costObj.quantity = element.quantity;
          costObj.unitPrice = element.unitPrice;
          costObj.costName = element.costName;
          costObj.costCode = element.costCode;
          costObj.active = element.active;
          costObj.isInclude = element.isInclude;
          costObj.sumAmount = element.quantity * element.unitPrice;

          this.listOrderCostDetailModel = [...this.listOrderCostDetailModel, costObj];
        });
      });

      //Nh??n vi??n b??n h??ng
      let seller: Employee = this.listEmployee.find(x => x.employeeId == this.customerOrderModel.Seller);
      if (seller) this.sellerControl.setValue(seller);

      //M?? t???
      this.descriptionControl.setValue(this.customerOrderModel.Description);

      //Ghi ch??
      this.noteControl.setValue(this.customerOrderModel.Note);

      //Chi???t kh???u
      let discountType: DiscountType = this.discountTypeList.find(x => x.value == this.customerOrderModel.DiscountType);
      if (discountType) this.discountTypeControl.setValue(discountType);

      //Gi?? tri chi???t kh???u
      let discountValue = this.customerOrderModel.DiscountValue;
      if (discountValue) {
        this.discountValueControl.setValue(discountValue);
      } else {
        this.discountValueControl.setValue(0);
      }

      this.optionCustomer = '2';

      this.customerEmail = customer.customerEmail;
      this.customerPhone = customer.customerPhone;
      this.cusNameControl.setValue(this.customerEmail);
      this.customerPhoneControl.setValue(this.customerPhone);
      this.cusNameControl.setValue(customer.customerName);
      this.customerMSTControl.setValue(customer.taxCode);
      this.daysAreOwedControl.setValue(customer.maximumDebtDays);
      this.maxDebtControl.setValue(customer.maximumDebtValue);

      //L???y ?????a ch??? c???a kh??ch h??ng
      this.contactService.getAddressByObject(customer.customerId, "CUS").subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.fullAddress = result.address;
          this.customerAddressControl.setValue(this.fullAddress);
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });

      //Ph????ng th???c thanh to??n
      let paymentMethod = this.listPaymentMethod.find(x => x.categoryId == this.customerOrderModel.PaymentMethod);
      if (paymentMethod) {
        this.paymentMethodControl.setValue(paymentMethod);
        if (paymentMethod.categoryCode == "BANK") {
          this.isShowBankAccount = true;
          this.listBankAccount = this.listCustomerBankAccount.filter(x => x.objectId == customer.customerId);
          if (this.listBankAccount.length > 0) {
            let toSelectBankAccount = this.listBankAccount.find(x => x.bankAccountId == this.customerOrderModel.BankAccountId);
            this.bankAccountControl.setValue(toSelectBankAccount);
          } else {
            this.listBankAccount = [];
          }
        }
      }
      // if (this.quoteId === null || this.quoteId === undefined || this.quoteId === '') {
      //   //S??? ng??y ???????c n???
      //   let daysAreOwed = this.customerOrderModel.DaysAreOwed;
      //   this.daysAreOwedControl.setValue(daysAreOwed);

      //   //S??? n??? t???i ??a
      //   let maxDebt = this.customerOrderModel.MaxDebt;
      //   this.maxDebtControl.setValue(maxDebt);
      // }

      this.autoGen();

      this.calculatorAll();

      this.loading = false;
    }
    else {
      this.loading = false;
    }
  }

  goDetailQuote() {
    let url = this.router.serializeUrl(this.router.createUrlTree(['/customer/quote-detail', { quoteId: this.quoteObj.quoteId }]));
    window.open(url, '_blank');
  }

  goDetaiContract() {
    let url = this.router.serializeUrl(this.router.createUrlTree(['/sales/contract-detail', { contractId: this.contractId }]));
    window.open(url, '_blank');
  }

  /*Event ch???n radio button: Kh??ch l???, Ch???n kh??ch h??ng, Kh??ch h??ng m???i*/
  chooseOptionCustomer() {
    this.autoGen(); //L???y th??ng tin giao h??ng
  }

  changeCustomer(customer: Customer, clear?: string) {
    //N???u thay ?????i kh??ch h??ng tr??n giao di???n th?? clear h???t s???n ph???m d???ch v???
    if (clear) {
      this.listCustomerOrderDetailModel = [];
      this.calculatorAll();
    }

    this.paymentMethodControl.setValue(null);
    this.daysAreOwedControl.setValue(null);
    this.maxDebtControl.setValue(null);
    this.isShowBankAccount = false;
    this.listBankAccount = [];
    this.bankAccountControl.setValue(null);
    this.customerEmail = '';
    this.customerPhone = '';
    this.fullAddress = '';

    if (customer) {
      this.customerEmail = customer.customerEmail;
      this.customerPhone = customer.customerPhone;
      this.cusObj = customer;
      this.customerPhoneControl.setValue(this.customerPhone);
      this.cusNameControl.setValue(customer.customerName);
      this.customerMSTControl.setValue(customer.taxCode);
      this.listQuoteObj = this.listQuote.filter(q => q.objectTypeId == customer.customerId);
      this.listContract = this.listOrderContract.filter(c => c.customerId == customer.customerId);

      if (customer.personInChargeId !== null) {
        this.quoteService.getEmployeeSale(this.listPersonInCharge, customer.personInChargeId,null).subscribe(response => {
          let result: any = response;
          if (result.listEmployee !== null && result.listEmployee !== undefined) {
            this.listEmployee = result.listEmployee;

            let emp = this.listEmployee.find(e => e.employeeId == customer.personInChargeId);
            this.sellerControl.setValue(emp);
          }
        });
      }
      else {
        this.cusObj = null;
        this.listEmployee = [];
        this.sellerControl.setValue(null);
      }

      //L???y ?????a ch??? c???a kh??ch h??ng
      this.contactService.getAddressByObject(customer.customerId, "CUS").subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.fullAddress = result.address;
          this.customerAddressControl.setValue(this.fullAddress);
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });

      let paymentMethod = this.listPaymentMethod.find(x => x.categoryId == customer.paymentId);
      if (paymentMethod) {
        this.paymentMethodControl.setValue(paymentMethod);
        if (paymentMethod.categoryCode == "BANK") {
          this.changeMethodControl(paymentMethod);
        }
      }
      let daysAreOwed = customer.maximumDebtDays ? customer.maximumDebtDays : 0;
      this.daysAreOwedControl.setValue(daysAreOwed);
      let maxAmount = customer.maximumDebtValue ? customer.maximumDebtValue : 0;
      this.maxDebtControl.setValue(maxAmount);

      this.autoGen(); //L???y th??ng tin giao h??ng
    }
    else {
      this.cusNameControl.setValue('');
      this.customerAddressControl.setValue('');
      this.customerMSTControl.setValue('');
      this.customerPhoneControl.setValue('');
      this.recipientNameControl.setValue('');
      this.daysAreOwedControl.setValue('');
      this.maxDebtControl.setValue('');
      this.paymentMethodControl.setValue(null);
    }
  }

  changeQuote(event) {
    let contract = this.orderContractControl.value;

    if (contract) {
      if (event) {
        this.listContract = this.listOrderContract.filter(oc => oc.quoteId == event.quoteId);
      } else {
        this.changeContract(contract);
        this.listContract = this.listOrderContract.filter(c => c.customerId == this.cusObj.customerId);
      }
    } else {
      this.listCustomerOrderDetailModel = [];
      if (event) {

        //Chi???t kh???u
        let discountType: DiscountType = this.discountTypeList.find(x => x.value == event.discountType);
        if (discountType) this.discountTypeControl.setValue(discountType);

        //Gi?? tri chi???t kh???u
        let discountValue = event.discountValue;
        if (discountValue) {
          this.discountValueControl.setValue(discountValue);
        } else {
          this.discountValueControl.setValue(0);
        }

        event.listDetail.forEach((element, index) => {
          let obj = new CustomerOrderDetail();
          // obj.OrderDetailId = element.orderDetailId;
          // obj.OrderId = element.orderId;
          obj.ProductCategoryId = element.productCategoryId;
          obj.VendorId = element.vendorId;
          obj.ProductId = element.productId;
          obj.Quantity = element.quantity;
          obj.UnitPrice = element.unitPrice;
          obj.CurrencyUnit = element.currencyUnit;
          obj.ExchangeRate = element.exchangeRate;
          obj.Vat = element.vat;
          obj.DiscountType = element.discountType;
          obj.DiscountValue = element.discountValue;
          obj.Description = element.description;
          obj.OrderDetailType = element.orderDetailType;
          obj.UnitId = element.unitId;
          obj.IncurredUnit = element.incurredUnit;
          obj.Active = element.active;
          obj.ExplainStr = element.nameProduct;
          obj.NameVendor = element.nameVendor;
          obj.ProductNameUnit = element.nameProductUnit;
          obj.ProductName = element.productName;
          obj.NameMoneyUnit = element.nameMoneyUnit;
          // obj.GuaranteeTime = element.guaranteeTime;
          // obj.GuaranteeDatetime = element.guaranteeDatetime;
          obj.AmountDiscount = obj.DiscountType == true ? (element.quantity * element.unitPrice * element.exchangeRate * element.discountValue / 100) : (element.discountValue);
          obj.SumAmount = (element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount + ((element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount) * element.vat / 100;
          // obj.ExpirationDate = element.expirationDate;
          // obj.WarehouseId = element.warehouseId;
          obj.PriceInitial = element.priceInitial;
          obj.IsPriceInitial = element.isPriceInitial;
          obj.WarrantyPeriod = element.warrantyPeriod;
          // obj.ActualInventory = element.actualInventory;
          // obj.BusinessInventory = element.businessInventory;
          obj.ProductCode = element.productId ? this.listProduct.find(p => p.productId == element.productId).productCode : "";
          obj.UnitLaborPrice = element.unitLaborPrice;
          obj.UnitLaborNumber = element.unitLaborNumber;
          obj.OrderNumber = index + 1;

          element.quoteProductDetailProductAttributeValue.forEach(item => {
            let obtAttribute = new OrderProductDetailProductAttributeValue();
            obtAttribute.ProductId = item.productId;
            obtAttribute.ProductAttributeCategoryValueId = item.productAttributeCategoryValueId;
            obtAttribute.ProductAttributeCategoryId = item.productAttributeCategoryId;
            obj.OrderProductDetailProductAttributeValue.push(obtAttribute);
          });

          this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, obj];
        });

        this.listOrderCostDetailModel = [];

        event.listCostDetail.forEach(element => {
          let costObj = new OrderCostDetail();
          // costObj.OrderCostDetailId = element.orderCostDetailId;
          costObj.costId = element.costId;
          // costObj.OrderId = element.orderId;
          costObj.quantity = element.quantity;
          costObj.unitPrice = element.unitPrice;
          costObj.costName = element.costName;
          costObj.costCode = element.costCode;
          costObj.active = element.active;
          costObj.isInclude = element.isInclude;
          costObj.sumAmount = element.quantity * element.unitPrice;

          this.listOrderCostDetailModel = [...this.listOrderCostDetailModel, costObj];
        });
        this.listContract = this.listOrderContract.filter(oc => oc.quoteId == event.quoteId);
      } else {
        this.discountValueControl.setValue(0);
        this.listContract = this.listOrderContract.filter(c => c.customerId == this.cusObj.customerId);
      }
    }

    this.calculatorAll();
  }

  /*Event thay ?????i h???p ?????ng*/
  changeContract(value: any) {
    this.listCustomerOrderDetailModel = [];

    if (value) {

      //Chi???t kh???u
      let discountType: DiscountType = this.discountTypeList.find(x => x.value == value.discountType);
      if (discountType) this.discountTypeControl.setValue(discountType);

      //Gi?? tri chi???t kh???u
      let discountValue = value.discountValue;
      if (discountValue) {
        this.discountValueControl.setValue(discountValue);
      } else {
        this.discountValueControl.setValue(0);
      }

      value.listDetail.forEach((element, index) => {
        let obj = new CustomerOrderDetail();
        // obj.OrderDetailId = element.orderDetailId;
        // obj.OrderId = element.orderId;
        obj.ProductCategoryId = element.productCategoryId;
        obj.VendorId = element.vendorId;
        obj.ProductId = element.productId;
        obj.Quantity = element.quantity;
        obj.UnitPrice = element.unitPrice;
        obj.CurrencyUnit = element.currencyUnit;
        obj.ExchangeRate = element.exchangeRate;
        obj.Vat = element.vat;
        obj.DiscountType = element.discountType;
        obj.DiscountValue = element.discountValue;
        obj.Description = element.description;
        obj.OrderDetailType = element.orderDetailType;
        obj.UnitId = element.unitId;
        obj.IncurredUnit = element.incurredUnit;
        obj.Active = element.active;
        obj.ExplainStr = element.nameProduct;
        obj.NameVendor = element.nameVendor;
        obj.ProductNameUnit = element.nameProductUnit;
        obj.ProductName = element.nameProduct;
        obj.NameMoneyUnit = element.nameMoneyUnit;
        // obj.GuaranteeTime = element.guaranteeTime;
        // obj.GuaranteeDatetime = element.guaranteeDatetime;
        obj.AmountDiscount = obj.DiscountType == true ? (element.quantity * element.unitPrice * element.exchangeRate * element.discountValue / 100) : (element.discountValue);
        obj.SumAmount = (element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount + ((element.quantity * element.unitPrice * element.exchangeRate) - obj.AmountDiscount) * element.vat / 100;
        // obj.ExpirationDate = element.expirationDate;
        // obj.WarehouseId = element.warehouseId;
        obj.PriceInitial = element.priceInitial;
        obj.IsPriceInitial = element.isPriceInitial;
        obj.WarrantyPeriod = element.warrantyPeriod;
        // obj.ActualInventory = element.actualInventory;
        // obj.BusinessInventory = element.businessInventory;
        obj.ProductCode = element.productId ? this.listProduct.find(p => p.productId == element.productId).productCode : "";
        obj.UnitLaborPrice = element.unitLaborPrice;
        obj.UnitLaborNumber = element.unitLaborNumber;
        obj.OrderNumber = index + 1;

        element.contractProductDetailProductAttributeValue.forEach(item => {
          let obtAttribute = new OrderProductDetailProductAttributeValue();
          obtAttribute.ProductId = item.productId;
          obtAttribute.ProductAttributeCategoryValueId = item.productAttributeCategoryValueId;
          obtAttribute.ProductAttributeCategoryId = item.productAttributeCategoryId;
          obj.OrderProductDetailProductAttributeValue.push(obtAttribute);
        });

        this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, obj];
      });

      this.listOrderCostDetailModel = [];

      value.listCostDetail.forEach(element => {
        let costObj = new OrderCostDetail();
        // costObj.OrderCostDetailId = element.orderCostDetailId;
        costObj.costId = element.costId;
        // costObj.OrderId = element.orderId;
        costObj.quantity = element.quantity;
        costObj.unitPrice = element.unitPrice;
        costObj.costName = element.costName;
        costObj.costCode = element.costCode;
        costObj.active = element.active;
        costObj.isInclude = element.isInclude;
        costObj.sumAmount = element.quantity * element.unitPrice;

        this.listOrderCostDetailModel = [...this.listOrderCostDetailModel, costObj];
      });

      // ch???n b??o gi?? g???n v???i h???p ?????ng
      let quoteObj = this.listQuote.find(c => c.quoteId == value.quoteId);
      if (quoteObj) {
        this.listQuoteObj = this.listQuote.filter(x => x.quoteId == quoteObj.quoteId);
        this.quoteControl.setValue(quoteObj);
      } else {
        this.quoteControl.setValue(null);
        this.listQuoteObj = [];
      }
    } else {
      if (this.quoteControl.value) {
        let quote = this.quoteControl.value;
        this.changeQuote(quote);
      }
      else {
        this.discountValueControl.setValue(0);
        this.listCustomerOrderDetailModel = [];
        this.listOrderCostDetailModel = [];
        this.TotalSumAmountProduct = 0;
        this.TotalSumAmountCost = 0;
        this.TotalSumAmountCostNotInclude = 0;
        this.TotalSumVatProduct = 0;
      }
      this.listQuoteObj = this.listQuote.filter(q => q.objectTypeId == this.cusObj.customerId);
    }

    this.calculatorAll();
  }

  /*Event thay ?????i Ph????ng th???c thanh to??n*/
  changeMethodControl(value: Category) {
    if (value) {
      if (value.categoryCode == "BANK") {
        let customer: Customer = this.customerControl.value;

        if (customer) {
          //N???u ???? ch???n kh??ch h??ng
          this.isShowBankAccount = true;
          let customerId = customer.customerId;

          this.listBankAccount = this.listCustomerBankAccount.filter(x => x.objectId == customerId);
          if (this.listBankAccount.length > 0) {
            let toSelectBankAccount = this.listBankAccount[0];
            this.bankAccountControl.setValue(toSelectBankAccount);
          } else {
            this.listBankAccount = [];
          }
        }
      } else if (value.categoryCode == "CASH") {
        this.isShowBankAccount = false;
        this.listBankAccount = [];
        this.bankAccountControl.setValue(null);
      }
    } else {
      this.isShowBankAccount = false;
      this.listBankAccount = [];
      this.bankAccountControl.setValue(null);
    }
  }

  /*Event khi nh???p t??n kh??ch h??ng*/
  changeCustomerName() {
    if (this.autoGenValue) {
      let customerName = this.customerNameControl.value;
      this.recipientNameControl.setValue(customerName);
    }
  }

  /*L???y t??n ng?????i nh???n h??ng*/
  autoGen() {
    if (this.autoGenValue) {
      switch (this.optionCustomer) {
        case "1":
          // this.recipientNameControl.setValue('Kh??ch l???');
          // this.recipientPhoneControl.setValue(null);
          // this.recipientEmailControl.setValue(null);
          break;
        case "2":
          let selectCustomer: Customer = this.customerControl.value;
          if (selectCustomer) {
            this.recipientNameControl.setValue(selectCustomer.customerName);
            // this.recipientPhoneControl.setValue(selectCustomer.customerPhone);
            // this.recipientEmailControl.setValue(selectCustomer.customerEmail);
          } else {
            this.recipientNameControl.setValue(null);
            // this.recipientPhoneControl.setValue(null);
            // this.recipientEmailControl.setValue(null);
          }
          break;
        case "3":
          // let newCustomerName = this.customerNameControl.value;
          // this.recipientNameControl.setValue(newCustomerName);
          // this.recipientPhoneControl.setValue(null);
          // this.recipientEmailControl.setValue(null);
          break;
        case "4":
          // this.recipientNameControl.setValue(this.leadName);
          // this.recipientPhoneControl.setValue(this.leadPhone);
          // this.recipientEmailControl.setValue(this.leadEmail);
          break;
      }
    }
  }

  /*Th??m s???n ph???m d???ch v???*/
  addCustomerOrderDetail() {
    let cusGroupId = null;
    if (this.cusObj !== null && this.cusObj !== undefined) cusGroupId = this.cusObj.customerGroupId;
    let date = convertToUTCTime(this.orderDateControl.value);
    let wareHouse = this.wareHouseControl.value ? this.wareHouseControl.value.warehouseId : null;
    let ref = this.dialogService.open(OrderDetailDialogComponent, {
      data: {
        isCreate: true,
        cusGroupId: cusGroupId,
        dateOrder: date,
        warehouse: wareHouse,
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

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          let customerOrderDetailModel: CustomerOrderDetail = result.customerOrderDetailModel;

          //set orderNumber cho s???n ph???m/d???ch v??? m???i th??m
          customerOrderDetailModel.OrderNumber = this.listCustomerOrderDetailModel.length + 1;

          this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, customerOrderDetailModel];

          this.calculatorAll();
        }
      }
    });
  }

  /*S???a m???t s???n ph???m d???ch v???*/
  onRowSelect(dataRow) {
    var index = this.listCustomerOrderDetailModel.indexOf(dataRow);
    var OldArray = this.listCustomerOrderDetailModel[index];

    let cusGroupId = null;
    if (this.cusObj !== null && this.cusObj !== undefined) cusGroupId = this.cusObj.customerGroupId;
    let date = convertToUTCTime(this.orderDateControl.value);
    let wareHouse = this.wareHouseControl.value ? this.wareHouseControl.value.warehouseId : null;

    let ref = this.dialogService.open(OrderDetailDialogComponent, {
      data: {
        isCreate: false,
        customerOrderDetailModel: OldArray,
        dateOrder: date,
        cusGroupId: cusGroupId,
        // warehouse: wareHouse
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
          this.listCustomerOrderDetailModel.splice(index, 1);
          let customerOrderDetailModel: CustomerOrderDetail = result.customerOrderDetailModel;
          this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, customerOrderDetailModel];

          //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
          this.listCustomerOrderDetailModel.sort((a, b) =>
            (a.OrderNumber > b.OrderNumber) ? 1 : ((b.OrderNumber > a.OrderNumber) ? -1 : 0));

          this.calculatorAll();
        }
      }
    });
  }

  /*X??a m???t s???n ph???m d???ch v???*/
  deleteItem(dataRow, event: Event) {
    //this.translate.get('order.messages_confirm.delete_confirm').subscribe(value => { this.messageConfirm = value; });
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.listCustomerOrderDetailModel = this.listCustomerOrderDetailModel.filter(x => x != dataRow);

        //????nh l???i s??? OrderNumber
        this.listCustomerOrderDetailModel.forEach((item, index) => {
          item.OrderNumber = index + 1;
        });

        this.calculatorAll();
      }
    });
  }

  /*Th??m chi ph??*/
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
          this.listOrderCostDetailModel.push(result.quoteDetailModel);

          this.calculatorAll();
        }
      }
    });
  }

  /*S???a m???t chi ph??*/
  onRowCostSelect(dataRow) {
    //N???u c?? quy???n s???a th?? m???i cho s???a
    var index = this.listOrderCostDetailModel.indexOf(dataRow);
    var OldArray = this.listOrderCostDetailModel[index];

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
          this.listOrderCostDetailModel.splice(index, 1);
          this.listOrderCostDetailModel.push(result.quoteDetailModel);

          this.calculatorAll();
        }
      }
    });
  }

  /*X??a m???t chi ph??*/
  deleteCostItem(dataRow) {
    //this.translate.get('order.messages_confirm.delete_confirm').subscribe(value => { this.messageConfirm = value; });
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        let index = this.listOrderCostDetailModel.indexOf(dataRow);
        this.listOrderCostDetailModel.splice(index, 1);

        this.calculatorAll();
      }
    });
  }

  /*Event khi thay ?????i lo???i chi???t kh???u: Theo % ho???c Theo s??? ti???n*/
  changeDiscountType(value: DiscountType) {
    this.discountValueControl.setValue('0');

    this.calculatorAll();
  }

  /*Event khi thay ?????i gi?? tr??? chi???t kh???u*/
  changeDiscountValue() {
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

    this.calculatorAll();
  }

  /*T??nh l???i t???t c??? c??c s??? ph???n t???ng h???p ????n h??ng*/
  calculatorAll() {
    //T???ng ti???n h??ng tr?????c thu???: TotalSumAmountProduct = SUM(????n gi?? sp * s??? l?????ng sp * t??? gi?? sp - chi???t kh???u)
    //T???ng chi ph??: TotalSumAmountCost = SUM(s??? l?????ng cp * ????n gi?? cp)
    //T???ng thu??? VAT: TotalSumVatProduct = SUM(ti???n thu??? c???a sp/d???ch v???)
    //T???ng ti???n chi???t kh???u: CustomerOrderTotalDiscount
    //  + N???u chi???t kh???u l?? % = (T???ng ti???n h??ng tr?????c thu??? + T???ng chi ph?? + T???ng thu??? VAT) * (% chi???t kh???u) / 100
    //  + N???u chi???t kh???u l?? s??? ti???n = S??? ti???n chi???t kh???u
    //T???ng thanh to??n: CustomerOrderAmountAfterDiscount = T???ng ti???n h??ng tr?????c thu??? + T???ng thu??? VAT + T???ng chi ph??- T???ng ti???n chi???t kh???u
    //T???ng ti???n v???n: TotalPriceInitial = SUM(s??? l?????ng sp * gi?? v???n)
    //L???i nhu???n t???m t??nh: AmountPriceProfit = T???ng thanh to??n - T???ng ti???n v???n - T???ng chi ph??
    //% L???i nhu???n t???m t??nh: ValuePriceProfit = L???i nhu???n t???m t??nh / T???ng thanh to??n * 100

    let defaultNumberType = ParseStringToFloat(this.defaultNumberType);
    let isIncludeCost: boolean = false;
    let totalSumAmountCost = 0;

    this.TotalSumAmountProduct = 0;
    this.TotalSumAmountCost = 0;
    this.TotalSumAmountCostNotInclude = 0;
    this.TotalSumVatProduct = 0;
    this.CustomerOrderTotalDiscount = 0;
    this.CustomerOrderAmountAfterDiscount = 0;
    this.TotalPriceInitial = 0;
    this.AmountPriceProfit = 0;
    this.ValuePriceProfit = 0;

    //T???ng ti???n h??ng tr?????c thu???: TotalSumAmountProduct = SUM(????n gi?? sp * s??? l?????ng sp * t??? gi?? sp - chi???t kh???u)
    //T???ng thu??? VAT: TotalSumVatProduct = SUM(ti???n thu??? c???a sp/d???ch v???)
    this.listCustomerOrderDetailModel.forEach(item => {
      let price = item.UnitPrice * item.Quantity * item.ExchangeRate;
      let unitLabor = item.UnitLaborNumber * item.UnitLaborPrice * item.ExchangeRate;

      let discount = 0;
      if (item.DiscountType == true) {
        discount = ((price + unitLabor) * item.DiscountValue) / 100;
      }
      else {
        discount = item.DiscountValue;
      }
      item.SumAmount = this.roundNumber(price + unitLabor - discount + (price + unitLabor - discount) * item.Vat / 100, defaultNumberType);

      this.TotalSumAmountProduct += this.roundNumber(price + unitLabor - discount, defaultNumberType);
      this.TotalSumVatProduct += this.roundNumber((((price + unitLabor - discount) * item.Vat) / 100), defaultNumberType);
    });

    //T???ng chi ph??: TotalSumAmountCost = SUM(s??? l?????ng cp * ????n gi?? cp)
    this.listOrderCostDetailModel.forEach(item => {
      this.TotalSumAmountCost += this.roundNumber(item.quantity * item.unitPrice, defaultNumberType);
      if (!item.isInclude) {
        this.TotalSumAmountCostNotInclude += this.roundNumber(item.quantity * item.unitPrice, defaultNumberType);
      }
    });

    //T???ng ti???n chi???t kh???u: CustomerOrderTotalDiscount
    //  + N???u chi???t kh???u l?? % = (T???ng ti???n h??ng tr?????c thu??? + T???ng chi ph?? + T???ng thu??? VAT) * (% chi???t kh???u) / 100
    let discountType: DiscountType = this.discountTypeControl.value;
    if (discountType.value == true) {
      this.CustomerOrderTotalDiscount = (this.TotalSumAmountProduct + this.TotalSumAmountCostNotInclude + this.TotalSumVatProduct) *
        ParseStringToFloat(this.discountValueControl.value.toString()) / 100;
      this.CustomerOrderTotalDiscount = this.roundNumber(this.CustomerOrderTotalDiscount, defaultNumberType);
    }
    //  + N???u chi???t kh???u l?? s??? ti???n = S??? ti???n chi???t kh???u
    else {
      this.CustomerOrderTotalDiscount = ParseStringToFloat(this.discountValueControl.value.toString());
      this.CustomerOrderTotalDiscount = this.roundNumber(this.CustomerOrderTotalDiscount, defaultNumberType);
    }

    //T???ng thanh to??n: CustomerOrderAmountAfterDiscount = T???ng ti???n h??ng tr?????c thu??? + T???ng thu??? VAT + T???ng chi ph??- T???ng ti???n chi???t kh???u
    this.CustomerOrderAmountAfterDiscount = this.roundNumber(this.TotalSumAmountProduct + this.TotalSumVatProduct + this.TotalSumAmountCostNotInclude - this.CustomerOrderTotalDiscount, defaultNumberType);
    let toltal = this.roundNumber(this.TotalSumAmountProduct, defaultNumberType);

    //T???ng ti???n v???n: TotalPriceInitial = SUM(s??? l?????ng sp * gi?? v???n)
    this.listCustomerOrderDetailModel.forEach(item => {
      //Ch??? t??nh gi?? v???n c???a s???n ph???m
      // if (item.OrderDetailType == 0) {
      // }
      this.TotalPriceInitial += this.roundNumber(item.Quantity * (item.PriceInitial ?? 0) * (item.ExchangeRate ?? 1), defaultNumberType);
    });

    //L???i nhu???n t???m t??nh: AmountPriceProfit = T???ng thanh to??n - T???ng ti???n v???n - T???ng chi ph??
    this.AmountPriceProfit = this.roundNumber(this.CustomerOrderAmountAfterDiscount - this.TotalPriceInitial - this.TotalSumAmountCost, defaultNumberType);

    //% L???i nhu???n t???m t??nh: ValuePriceProfit = L???i nhu???n t???m t??nh / T???ng thanh to??n * 100
    this.ValuePriceProfit = this.roundNumber(this.AmountPriceProfit / this.CustomerOrderAmountAfterDiscount * 100, defaultNumberType);
  }

  createOrder(value: boolean) {
    /* T???t/B???t validate Form theo lo???i Th??ng tin kh??ch h??ng */
    switch (this.optionCustomer) {
      case '1':
        //Kh??ch l???

        this.customerControl.setValidators(null);
        this.customerControl.updateValueAndValidity();

        this.customerGroupControl.setValidators(null);
        this.customerGroupControl.updateValueAndValidity();

        this.customerCodeControl.setValidators(null);
        this.customerCodeControl.updateValueAndValidity();

        this.customerNameControl.setValidators(null);
        this.customerNameControl.updateValueAndValidity();
        break;
      case '2':
        //Ch???n kh??ch h??ng

        //T???t validate form Th??m kh??ch h??ng m???i
        this.customerGroupControl.setValidators(null);
        this.customerGroupControl.updateValueAndValidity();

        this.customerCodeControl.setValidators(null);
        this.customerCodeControl.updateValueAndValidity();

        this.customerNameControl.setValidators(null);
        this.customerNameControl.updateValueAndValidity();

        //B???t validate form Ch???n kh??ch h??ng
        this.customerControl.setValidators([Validators.required]);
        this.customerControl.updateValueAndValidity();
        break;
      case '3':
        //Th??m kh??ch h??ng m???i

        //T???t validate form Ch???n kh??ch h??ng
        this.customerControl.setValidators(null);
        this.customerControl.updateValueAndValidity();

        //B???t validate form Th??m kh??ch h??ng m???i
        this.customerGroupControl.setValidators([Validators.required]);
        this.customerGroupControl.updateValueAndValidity();

        this.customerCodeControl.setValidators([Validators.required, checkDuplicateCode(this.listCustomerCode), forbiddenSpaceText]);
        this.customerCodeControl.updateValueAndValidity();

        this.customerNameControl.setValidators([Validators.required, forbiddenSpaceText]);
        this.customerNameControl.updateValueAndValidity();
        break;
      case '4':
        //B??o gi?? Kh??ch h??ng ti???m n??ng

        this.customerControl.setValidators(null);
        this.customerControl.updateValueAndValidity();

        this.customerCodeControl.setValidators(null);
        this.customerCodeControl.updateValueAndValidity();

        this.customerNameControl.setValidators(null);
        this.customerNameControl.updateValueAndValidity();
        break;
    }
    /*End*/

    if (!this.createOrderForm.valid) {
      Object.keys(this.createOrderForm.controls).forEach(key => {
        if (this.createOrderForm.controls[key].valid == false) {
          this.createOrderForm.controls[key].markAsTouched();
        }
      });

      this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
      this.isOpenNotifiError = true;  //Hi???n th??? message l???i
      this.emitStatusChangeForm = this.createOrderForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });
    } else if (this.listCustomerOrderDetailModel.length == 0) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ph???i c?? ??t nh???t m???t s???n ph???m d???ch v??? ???????c ch???n' };
      this.showMessage(msg);
    } else {
      /* Convert Time */
      this.listCustomerOrderDetailModel.forEach(item => {
        let guaranteeDatetime = item.GuaranteeDatetime;
        if (guaranteeDatetime) item.GuaranteeDatetime = convertToUTCTime(guaranteeDatetime);

        let expirationDate = item.ExpirationDate;
        if (expirationDate) item.ExpirationDate = convertToUTCTime(expirationDate);
      });
      /* End */

      if (this.optionCustomer == '2') {
        this.typeAccount = 2;

        this.customerOrderModel.OrderDate = convertToUTCTime(this.orderDateControl.value);
        let seller: Employee = this.sellerControl.value;
        if (seller) this.customerOrderModel.Seller = seller.employeeId;
        this.customerOrderModel.Description = this.descriptionControl.value == null ? null : this.descriptionControl.value.trim();
        this.customerOrderModel.Note = this.noteControl.value == null ? null : this.noteControl.value.trim();
        let selectCustomer: Customer = this.customerControl.value;
        if (selectCustomer) this.customerOrderModel.CustomerId = selectCustomer.customerId;
        let selectPaymentMethod: Category = this.paymentMethodControl.value;
        if (selectPaymentMethod) this.customerOrderModel.PaymentMethod = selectPaymentMethod.categoryId;
        let discountType: DiscountType = this.discountTypeControl.value;
        this.customerOrderModel.DiscountType = discountType.value;
        let selectBankAccount: BankAccount = this.bankAccountControl.value;
        if (selectBankAccount) this.customerOrderModel.BankAccountId = selectBankAccount.bankAccountId;
        let daysAreOwed = this.daysAreOwedControl.value;
        if (daysAreOwed) {
          this.customerOrderModel.DaysAreOwed = ParseStringToFloat(daysAreOwed);
        } else {
          this.customerOrderModel.DaysAreOwed = 0;
        }
        let maxDebt = this.maxDebtControl.value;
        if (maxDebt) {
          this.customerOrderModel.MaxDebt = ParseStringToFloat(maxDebt);
        }
        else {
          this.customerOrderModel.MaxDebt = 0;
        }
        let receivedDate = this.receivedDateControl.value;
        if (receivedDate) {
          receivedDate = convertToUTCTime(receivedDate);
          this.customerOrderModel.ReceivedDate = receivedDate;
        }
        let receivedHour = this.receivedHourControl.value;
        if (receivedHour) {
          receivedHour = this.convertDateToTimeSpan(receivedHour);
          this.customerOrderModel.ReceivedHour = receivedHour;
        }

        let contractObj = this.orderContractControl.value;
        if (contractObj) {
          this.customerOrderModel.OrderContractId = contractObj.contractId;
        }

        this.customerOrderModel.RecipientName = this.recipientNameControl.value ? this.recipientNameControl.value.trim() : "";
        this.customerOrderModel.LocationOfShipment = this.locationOfShipmentControl.value == null ? null : this.locationOfShipmentControl.value.trim();
        this.customerOrderModel.ShippingNote = this.shippingNoteControl.value == null ? null : this.shippingNoteControl.value.trim();
        this.customerOrderModel.RecipientEmail = this.recipientEmailControl.value == null ? null : this.recipientEmailControl.value.trim();
        this.customerOrderModel.PlaceOfDelivery = this.placeOfDeliveryControl.value == null ? null : this.placeOfDeliveryControl.value.trim();

        //Amount = T???ng ti???n h??ng tr?????c thu??? + T???ng ti???n thu??? VAT + T???ng chi ph??
        this.customerOrderModel.Amount = this.TotalSumAmountProduct + this.TotalSumVatProduct + this.TotalSumAmountCostNotInclude;

        this.customerOrderModel.DiscountValue = ParseStringToFloat(this.discountValueControl.value);
        let status: OrderStatus = this.orderStatusControl.value;
        this.customerOrderModel.StatusId = status.orderStatusId;
        this.customerOrderModel.CustomerName = this.cusNameControl.value ? this.cusNameControl.value.trim() : "";
        this.customerOrderModel.CustomerAddress = this.customerAddressControl.value ? this.customerAddressControl.value.trim() : "";
        this.customerOrderModel.RecipientPhone = this.customerPhoneControl.value ? this.customerPhoneControl.value.trim() : ""; // L??u s??? ??i???n tho???i th??ng tin kh??ch h??ng
        this.customerOrderModel.QuoteId = this.quoteControl.value ? this.quoteControl.value.quoteId : null;
        this.customerOrderModel.WarehouseId = this.wareHouseControl.value ? this.wareHouseControl.value.warehouseId : null;

        //th??m autoGenValue v??o model
        this.customerOrderModel.IsAutoGenReceiveInfor = this.autoGenValue;
        this.translate.get('order.messages_confirm.confirm_check').subscribe(value => {
          //Kh??ch h??ng n??y ???? v?????t qu?? s??? ti???n n??? t???i ??a! B???n c?? ch???c ch???n ti???p t???c?
          this.messageConfirm = value;
        });

        //Ki???m tra s??? n??? t???i ??a c???a kh??ch h??ng
        this.loading = true;
        this.customerOrderService.checkBeforCreateOrUpdateOrder(this.customerOrderModel.CustomerId, this.customerOrderModel.MaxDebt, this.CustomerOrderAmountAfterDiscount).subscribe(responseCheck => {
          let resultCheck: any = responseCheck;
          this.loading = false;
          if (resultCheck.statusCode == 200) {

            //N???u s??? n??? t???i ??a c??n l???i c???a kh??ch h??ng nh??? h??n t???ng thanh to??n c???a ????n h??ng th?? hi???n th??? c???nh b??o
            if (resultCheck.isCheckMaxDebt == true) {
              this.confirmationService.confirm({
                message: this.messageConfirm,
                accept: () => {
                  this.loading = true;
                  this.awaitResult = true;
                  this.customerOrderService.CreateCustomerOrder(
                    this.customerOrderModel,
                    this.listCustomerOrderDetailModel,
                    this.listOrderCostDetailModel,
                    this.typeAccount,
                    this.contactModel,
                    this.quoteId
                  ).subscribe(response => {
                    let result: any = response;
                    if (result.statusCode == 200) {
                      // this.sendEmail(result);
                      this.loading = false;
                      this.checkMinimumProfit(value, result);
                    } else {
                      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
                      this.showMessage(msg);
                      this.awaitResult = false;
                      this.loading = false;
                    }
                  });
                }
              });
            }
            else {
              this.awaitResult = true;
              this.loading=true;
              this.customerOrderService.CreateCustomerOrder(
                this.customerOrderModel,
                this.listCustomerOrderDetailModel,
                this.listOrderCostDetailModel,
                this.typeAccount,
                this.contactModel,
                this.quoteId
              ).subscribe(response => {
                let result: any = response;
                this.loading = false;
                if (result.statusCode == 200) {
                  // this.sendEmail(result);
                  this.loading = false;
                  this.checkMinimumProfit(value, result);
                } else {
                  let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
                  this.showMessage(msg);
                  this.awaitResult = false;
                }
              });
            }
          }
          else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: resultCheck.messageCode };
            this.showMessage(msg);
            this.awaitResult = false;
            this.loading = false;
          }
        });
      }
    }
  }

  /* Reset form t???o ????n h??ng */
  resetForm() {
    if (this.quoteId || this.customerId)
      this.router.navigate(['/order/create']);
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
      this.isInvalidForm = false; //???n icon-warning-active
    }

    //Reset c??c control trong Section Th??ng tin kh??ch h??ng
    this.resetSectionCusInforControl();

    //Ng??y ?????t h??ng
    this.orderDateControl.setValue(new Date());

    //Tr???ng th??i ????n h??ng
    let defaultOrderStatus = this.listOrderStatus.find(x => x.orderStatusCode == "DRA");
    if (defaultOrderStatus) this.orderStatusControl.setValue(defaultOrderStatus);

    //Nh??n vi??n b??n h??ng
    let defaultSeller = this.listEmployee.find(x => x.employeeId == this.employeeId);
    if (defaultSeller) this.sellerControl.setValue(defaultSeller);

    //S??? b??o gi??
    this.quoteControl.reset();

    //S??? h???p ?????ng
    this.orderContractControl.reset();

    //M?? kho
    this.wareHouseControl.reset();

    //T??n kho
    this.warehouseName = '';

    //?????a ch??? giao h??ng
    this.placeOfDeliveryControl.reset();

    //Di???n gi???i
    this.descriptionControl.setValue(null);

    //Ghi ch??
    this.noteControl.setValue(null);

    this.optionCustomer = '2';

    this.autoGenValue = true;

    //Lo???i chi???t kh???u theo t???ng ????n h??ng
    this.discountTypeControl.setValue(this.discountTypeList.find(x => x.code == "PT"));

    //G??a tr??? chi???t kh???u theo t???ng ????n h??ng
    this.discountValueControl.setValue('0');

    //Danh s??ch s???n ph???m d???ch v???
    this.listCustomerOrderDetailModel = [];

    //Danh s??ch chi ph??
    this.listOrderCostDetailModel = [];

    //T??nh l???i c??c gi?? tr??? ph???n t???ng h???p
    this.calculatorAll();

    this.customerOrderModel = new CustomerOrder();
    this.contactModel = new ContactModel();

    this.awaitResult = false;
    this.loading = false;
  }

  checkMinimumProfit(value: any, result: any) {
    let minProfitExpect = parseFloat(this.minimumProfit.replace(/%/g, ''));
    let minProfit = this.ValuePriceProfit;

    if (minProfit < minProfitExpect) {
      this.confirmationService.confirm({
        message: 'M???c l???i nhu???n t???m t??nh th???p h??n m???c k??? v???ng (' + minProfitExpect + '%), b???n c?? mu???n ti???p t???c kh??ng?',
        accept: () => {
          if (value) {
            //L??u v?? th??m m???i
            this.resetForm();
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
            //L??u
            setTimeout(() =>{
              this.router.navigate(['/order/order-detail', { customerOrderID: result.customerOrderID }]);
            } ,1000)

          }
        },
        reject: () => {
          this.awaitResult = false;
          //L??u
          // this.router.navigate(['/order/order-detail', { customerOrderID: result.customerOrderID }]);
        }
      });
    } else {
      if (value) {
        //L??u v?? th??m m???i
        this.resetForm();
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
        //L??u
        this.router.navigate(['/order/order-detail', { customerOrderID: result.customerOrderID }]);
      }
    }
  }


  /* Reset c??c control trong Section Th??ng tin kh??ch h??ng */
  resetSectionCusInforControl() {
    switch (this.optionCustomer) {
      case '1':
        //Kh??ch l???
        // this.customerControl.setValidators(null);
        // this.customerControl.updateValueAndValidity();

        // this.customerGroupControl.setValidators(null);
        // this.customerGroupControl.updateValueAndValidity();

        // this.customerCodeControl.setValidators(null);
        // this.customerCodeControl.updateValueAndValidity();

        // this.customerNameControl.setValidators(null);
        // this.customerNameControl.updateValueAndValidity();

        // this.customerTypeControl.setValue(this.listCustomerType[0]);

        // this.leadName = '';
        // this.leadEmail = '';
        // this.leadPhone = '';
        // this.leadFullAddress = '';
        // this.paymentMethodQuoteControl.setValue(null);
        // this.daysAreOwedQuoteControl.setValue(null);
        // this.maxDebtQuoteControl.setValue(null);
        break;
      case '2':
        //Ch???n kh??ch h??ng

        //B???t validate form Ch???n kh??ch h??ng
        this.customerControl.reset();
        this.customerControl.setValidators([Validators.required]);
        this.customerControl.updateValueAndValidity();

        //T??n kh??ch h??ng
        this.cusNameControl.reset();

        //?????a ch???
        this.customerAddressControl.reset();

        //M?? s??? thu???
        this.customerMSTControl.reset();

        //??i???n tho???i
        this.customerPhoneControl.reset();

        //Ng?????i nh???n h??ng
        this.recipientNameControl.reset();

        //S??? ng??y ???????c n???
        this.daysAreOwedControl.setValue('0');

        //S??? n??? t???i ??a
        this.maxDebtControl.setValue('0');

        //Ph????ng th???c thanh to??n
        this.paymentMethodControl.setValue(null);

        //T??i kho???n ng??n h??ng
        this.isShowBankAccount = false;
        this.listBankAccount = [];
        this.bankAccountControl.setValue(null);

        break;
      case '3':
        //Th??m kh??ch h??ng m???i

        // //T???t validate form Ch???n kh??ch h??ng
        // this.customerControl.setValidators(null);
        // this.customerControl.updateValueAndValidity();

        // //B???t validate form Th??m kh??ch h??ng m???i
        // this.customerGroupControl.setValidators([Validators.required]);
        // this.customerGroupControl.updateValueAndValidity();

        // this.customerCodeControl.setValidators([Validators.required, checkDuplicateCode(this.listCustomerCode), forbiddenSpaceText]);
        // this.customerCodeControl.updateValueAndValidity();

        // this.customerNameControl.setValidators([Validators.required, forbiddenSpaceText]);
        // this.customerNameControl.updateValueAndValidity();

        // this.leadName = '';
        // this.leadEmail = '';
        // this.leadPhone = '';
        // this.leadFullAddress = '';
        // this.paymentMethodQuoteControl.setValue(null);
        // this.daysAreOwedQuoteControl.setValue(null);
        // this.maxDebtQuoteControl.setValue(null);
        break;
      case '4':
        //B??o gi?? Kh??ch h??ng ti???m n??ng

        // this.customerControl.setValidators(null);
        // this.customerControl.updateValueAndValidity();

        // this.customerCodeControl.setValidators(null);
        // this.customerCodeControl.updateValueAndValidity();

        // this.customerNameControl.setValidators(null);
        // this.customerNameControl.updateValueAndValidity();
        break;
    }
  }

  convertDateToTimeSpan(Time: Date): string {
    let result = '';
    let Hour = Time.getHours().toString();
    let Minute = Time.getMinutes().toString();
    result = Hour + ":" + Minute;

    return result;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  cancel() {
    this.router.navigate(['order/list']);
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  showTotalOrder() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 8 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  // sendEmail(result: any) {
  //   const moneyPipe = new NumberToStringPipe();
  //   let sendEmailModel: SendEmailModel = result.sendEmailEntityModel;
  //   let sumAmountDiscount_temp = 0;
  //   let sumAmount_temp = 0;
  //   sendEmailModel.ListDetailToSendEmailInOrder = [];//reset
  //   this.listCustomerOrderDetailModel.forEach(orderDetail => {
  //     let newOrderDetail = new OrderDetailToSendEmailModel();
  //     newOrderDetail.ProductName = orderDetail.ExplainStr ? orderDetail.ExplainStr : "";
  //     newOrderDetail.ProductNameUnit = orderDetail.ProductNameUnit ? orderDetail.ProductNameUnit : "";
  //     newOrderDetail.UnitPrice = orderDetail.UnitPrice ? orderDetail.UnitPrice.toLocaleString('en') : "0";
  //     newOrderDetail.Quantity = orderDetail.Quantity ? orderDetail.Quantity.toLocaleString('en') : "0";
  //     newOrderDetail.Vat = orderDetail.Quantity ? orderDetail.Vat.toLocaleString('en') : "0";
  //     newOrderDetail.DiscountValue = orderDetail.DiscountValue ? orderDetail.DiscountValue.toLocaleString('en') : "0";
  //     if (orderDetail.DiscountType == true) {
  //       newOrderDetail.DiscountValue += "%";
  //     }
  //     newOrderDetail.SumAmount = orderDetail.SumAmount ? orderDetail.SumAmount.toLocaleString('en') : "0";
  //     newOrderDetail.AmountDiscountPerProduct = orderDetail.AmountDiscount ? orderDetail.AmountDiscount.toLocaleString('en') : "0";;
  //     sumAmountDiscount_temp += ParseStringToFloat(newOrderDetail.AmountDiscountPerProduct);
  //     sumAmount_temp += ParseStringToFloat(newOrderDetail.SumAmount);
  //     sendEmailModel.ListDetailToSendEmailInOrder.push(newOrderDetail);
  //   });
  //   sendEmailModel.SumAmountDiscountByProductInOder = sumAmountDiscount_temp.toLocaleString('en');  //t???ng ti???n chi???t kh???u theo s???n ph???m
  //   sendEmailModel.SumAmountBeforeDiscount = sumAmount_temp.toLocaleString('en') + " VND";
  //   //l???y chi???t kh???u t???ng v?? t???ng ti???n sau khi tr??? chi???t kh???u t???ng
  //   sendEmailModel.SumAmountBeforeDiscount = this.customerOrderModel.Amount.toLocaleString('en') + " VND";
  //   sendEmailModel.SumAmountDiscountByOrder = this.customerOrderModel.DiscountValue.toLocaleString('en');
  //   if (this.customerOrderModel.DiscountType == true) {
  //     sendEmailModel.SumAmountDiscountByOrder += "%";
  //   }
  //   sendEmailModel.SumAmountAfterDiscount = this.CustomerOrderAmountAfterDiscount.toLocaleString('en');
  //   sendEmailModel.SumAmountTransformInOrder = moneyPipe.transform(this.CustomerOrderAmountAfterDiscount, this.defaultNumberType);
  //   sendEmailModel.SendDetailProductInOrder = true;
  //   this.emailConfigService.sendEmail(8, sendEmailModel).subscribe(reponse => {
  //     //let result = <any>response;
  //   });
  // }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  /* Chuy???n item l??n m???t c???p */
  moveUp(data: CustomerOrderDetail) {
    let currentOrderNumber = data.OrderNumber;
    let preOrderNumber = currentOrderNumber - 1;
    let pre_data = this.listCustomerOrderDetailModel.find(x => x.OrderNumber == preOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    pre_data.OrderNumber = currentOrderNumber;
    data.OrderNumber = preOrderNumber;

    //X??a 2 item
    this.listCustomerOrderDetailModel = this.listCustomerOrderDetailModel.filter(x =>
      x.OrderNumber != preOrderNumber && x.OrderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, pre_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listCustomerOrderDetailModel.sort((a, b) =>
      (a.OrderNumber > b.OrderNumber) ? 1 : ((b.OrderNumber > a.OrderNumber) ? -1 : 0));
  }

  /* Chuy???n item xu???ng m???t c???p */
  moveDown(data: CustomerOrderDetail) {
    let currentOrderNumber = data.OrderNumber;
    let nextOrderNumber = currentOrderNumber + 1;
    let next_data = this.listCustomerOrderDetailModel.find(x => x.OrderNumber == nextOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    next_data.OrderNumber = currentOrderNumber;
    data.OrderNumber = nextOrderNumber;

    //X??a 2 item
    this.listCustomerOrderDetailModel = this.listCustomerOrderDetailModel.filter(x =>
      x.OrderNumber != nextOrderNumber && x.OrderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listCustomerOrderDetailModel = [...this.listCustomerOrderDetailModel, next_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listCustomerOrderDetailModel.sort((a, b) =>
      (a.OrderNumber > b.OrderNumber) ? 1 : ((b.OrderNumber > a.OrderNumber) ? -1 : 0));
  }
}

function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null) {
      if (array.indexOf(control.value.toLowerCase()) !== -1 && control.value.toLowerCase() !== "") {
        return { 'duplicateCode': true };
      }
      return null;
    }
  }
}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
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


