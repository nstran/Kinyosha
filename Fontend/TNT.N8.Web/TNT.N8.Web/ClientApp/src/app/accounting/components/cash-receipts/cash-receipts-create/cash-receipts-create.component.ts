import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterContentChecked, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../../shared/services/category.service';
import { OrganizationService } from '../../../../shared/services/organization.service';
import { CashReceiptModel } from '../../../models/cashReceipt.model';
import { AccountingService } from '../../../services/accounting.service';
import { DatePipe } from '@angular/common';

import * as $ from 'jquery';
import { CashReceiptMappingModel } from '../../../models/cashReceiptMapping.model';
import { EmployeeService } from '../../../../employee/services/employee.service';
import { CustomerService } from '../../../../customer/services/customer.service';
import { VendorService } from '../../../../vendor/services/vendor.service';
import { ValidatorsCommon } from '../../../../shared/CustomValidation/ValidationCommon';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { CustomerOrderService } from '../../../../order/services/customer-order.service';

import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DecimalPipe } from '@angular/common';
import { OrganizationDialogComponent } from '../../../../shared/components/organization-dialog/organization-dialog.component';

interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string,
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
}

interface Order {
  orderId: string,
  orderCode: string,
  amountCollected: string,  //S??? ti???n nh???n
  amountReceivable: number, //S??? ph???i ti???n ph???i thu
  total: number,
  orderDate: Date,
  error: boolean
}

@Component({
  selector: 'app-cash-receipts-create',
  templateUrl: './cash-receipts-create.component.html',
  styleUrls: ['./cash-receipts-create.component.css'],
  providers: [
    DecimalPipe,
  ]
})
export class CashReceiptsCreateComponent implements OnInit, AfterContentChecked {

  awaitResult: boolean = false;
  errorEmail: boolean = false;
  typesOfReceipt: Array<any> = [];
  organizationList: Array<any> = [];
  statusOfReceipt: Array<any> = [];
  unitMoney: Array<any> = [];
  auth: any = JSON.parse(localStorage.getItem('auth'));
  currentUserName: string = localStorage.getItem('Username') + '-' + localStorage.getItem('UserFullName');
  currentDate: Date = new Date();
  cashReceiptModel = new CashReceiptModel();
  cashReceiptMappingModel = new CashReceiptMappingModel();
  reasonOfReceipt: any[];
  receipter: any;
  receipterList: Array<any> = [];
  currencyCode: any;
  isShowExchangeRate = false;
  isShowPriceForeign = false;
  priceForeign: number;
  currencyLabel: string = 'VND';
  listCurrency: Array<MenuItem> = [];
  cols: any[];
  selectedColumns: any[];

  createReceiptForm: FormGroup;
  reasonControl: FormControl;
  registerTypeControl: FormControl;
  receipters: FormControl;
  organizationName: FormControl;
  status: FormControl;
  receiptDate: FormControl;
  voucherDate: FormControl;
  receiptName: FormControl;
  recipientAddressControl: FormControl;
  content: FormControl;
  unitPrice: FormControl;
  currencyUnit: FormControl;
  exchangeRate: FormControl;
  noteControl: FormControl;
  isSendMailControl: FormControl;


  currentDatestring: string;
  voucherDateString: string;

  customerId: string = null;
  orderId: string = null;

  loading: boolean = false;
  actionAdd: boolean = true;
  isCheckAmountGreater: boolean = false;
  isShowAllocation: boolean = false;
  listOrder: Array<any> = [];
  listOrderHistory: Array<any> = [];
  isAllocationFollowMoney: boolean = true;

  totalAmountReceivable: number = 0;
  maxVouchersDate: Date = new Date();
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;

  fixed: boolean = false;
  withFiexd: string = "";
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

  colLeft: number = 9;
  isShow: boolean = true;
  isSendMail: boolean = true;

  constructor(
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private accountingService: AccountingService,
    private employeeService: EmployeeService,
    private customerService: CustomerService,
    private decimalPipe: DecimalPipe,
    private vendorService: VendorService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private renderer: Renderer2,
    public dialogService: DialogService,
    private customerOrderService: CustomerOrderService,
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
        if (!this.toggleButton.nativeElement.contains(e.target) &&
          !this.notifi.nativeElement.contains(e.target) &&
          !this.save.nativeElement.contains(e.target) &&
          !this.saveAndCreate.nativeElement.contains(e.target)) {
          this.isOpenNotifiError = false;
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
    let resource = "acc/accounting/cash-receipts-create/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    }
    else {
      //$("body").addClass("sidebar-collapse"); //Thu g???n left menu
      // this.setForm();

      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      this.route.params.subscribe(params => {
        this.customerId = params['customerId'];
        this.orderId = params['orderId'];
      });

      this.loading = true;
      await this.getMasterData();
      this.loading = false;

      this.cols = [
        { field: 'orderCode', header: 'M?? ????n h??ng', width: '15%', textAlign: 'left', color: '#f44336' },
        { field: 'amountCollected', header: 'Thanh to??n', width: '20%', textAlign: 'right', color: '#f44336' },
        { field: 'amountReceivable', header: 'S??? ph???i thu', width: '20%', textAlign: 'right', color: '#f44336' },
        { field: 'total', header: 'T???ng gi?? tr??? ????n h??ng', width: '25%', textAlign: 'right', color: '#f44336' },
        { field: 'orderDate', header: 'Ng??y mua', width: '20%', textAlign: 'center', color: '#f44336' }
      ];

      this.selectedColumns = this.cols;

    }
  }

  setForm() {
    this.reasonControl = new FormControl('');
    this.registerTypeControl = new FormControl('');
    this.receipters = new FormControl('', [Validators.required]);
    this.organizationName = new FormControl('', [Validators.required]);
    this.status = new FormControl('', [Validators.required]);
    this.receiptDate = new FormControl(new Date(), [Validators.required, ValidatorsCommon.formatDate]);
    this.voucherDate = new FormControl(new Date(), [Validators.required, ValidatorsCommon.formatDate]);
    this.receiptName = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
    this.recipientAddressControl = new FormControl('', [Validators.maxLength(250), forbiddenSpaceText]);
    this.content = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
    this.unitPrice = new FormControl('0', [Validators.required]);
    // this.currencyUnit = new FormControl('', [Validators.required]);
    this.exchangeRate = new FormControl('1', [Validators.required]);
    this.noteControl = new FormControl('');
    this.isSendMailControl = new FormControl(true);

    this.createReceiptForm = this.formBuilder.group({
      reasonControl: this.reasonControl,
      registerTypeControl: this.registerTypeControl,
      receipters: this.receipters,
      organizationName: this.organizationName,
      status: this.status,
      receiptDate: this.receiptDate,
      voucherDate: this.voucherDate,
      receiptName: this.receiptName,
      recipientAddressControl: this.recipientAddressControl,
      content: this.content,
      unitPrice: this.unitPrice,
      // currencyUnit: this.currencyUnit,
      exchangeRate: this.exchangeRate,
      noteControl: this.noteControl,
      isSendMailControl: this.isSendMailControl,
    });
  }

  ngAfterContentChecked(): void {
    this.ref.detectChanges();
  }

  async getMasterData() {
    this.loading = true;
    var result: any = await this.accountingService.getMasterDataReceiptInvoice();
    this.reasonOfReceipt = result.listReason;
    this.reasonOfReceipt.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    this.typesOfReceipt = result.typesOfReceiptList;
    this.typesOfReceipt.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    this.statusOfReceipt = result.listStatus;

    this.unitMoney = result.unitMoneyList;
    this.organizationList = result.organizationList;

    this.receipterList = result.customerList;

    this.receipterList.forEach(item => {
      item.customerName = item.customerCode + ' - ' + item.customerName;
    });

    this.unitMoney.forEach(item => {
      let optionMenu: MenuItem = {
        label: item.categoryCode,
        command: () => {
          this.currencyLabel = item.categoryCode;
          this.setExchangeRate();
        }
      }
      this.listCurrency.push(optionMenu);
    });


    this.setDefaultPaidDate();
    //Set gi?? tr??? m???c ?????nh cho ????n v??? ti???n:
    this.setDefaultCurrencyUnit();
    //Set gi?? tr??? m???c ?????nh cho T??? gi??:
    this.setDefaultExchangeRate();
    //L?? do thu v?? ?????i t?????ng thu
    this.setDefaultReason();
    //N??i chi
    this.setDefaultOrg(); //Gia tri mac dinh
    //Tr???ng th??i
    this.setDefaultStatus();  //Gia tri mac dinh
    this.setDefaultObject();
    this.loading = false;
  }

  async setDefaultReason() {
    const reasonCode = this.reasonOfReceipt.find(r => r.categoryCode === 'THA');
    this.createReceiptForm.controls['reasonControl'].setValue(reasonCode);

    this.receipter = 'THA';
  }

  async setDefaultObject() {
    if (this.customerId) {
      let customer: Customer = this.receipterList.find(c => c.customerId == this.customerId);
      this.createReceiptForm.controls['receipters'].setValue(customer);
      this.createReceiptForm.controls['receipters'].updateValueAndValidity();
      this.changeCustomer(customer);
    } else if (this.orderId) {
      let order: any = await this.customerOrderService.GetCustomerOrderByIDAsync(this.orderId);
      let customer: Customer = this.receipterList.find(c => c.customerId == order.customerOrderObject.customerId);
      this.createReceiptForm.controls['receipters'].setValue(customer);
      this.createReceiptForm.controls['receipters'].updateValueAndValidity();
      this.changeCustomer(customer);
      this.createReceiptForm.controls['receiptName'].setValue(order.customerOrderObject.recipientName);
      this.createReceiptForm.controls['recipientAddressControl'].setValue(order.customerOrderObject.customerAddress);
      this.createReceiptForm.controls['content'].setValue('Thu ti???n kh??ch h??ng - ' + order.customerOrderObject.recipientName);
      let discountType = order.customerOrderObject.discountType;
      if (discountType) {
        order.customerOrderObject.amount = order.customerOrderObject.amount - (order.customerOrderObject.amount * order.customerOrderObject.discountValue / 100);
      } else {
        order.customerOrderObject.amount = order.customerOrderObject.amount - order.customerOrderObject.discountValue;
      }
      this.unitPrice.setValue(order.customerOrderObject.amount);

      // T??nh l???i ti???n khi thay ?????i lo???i ti???n t???
      this.calculatorMoney();
    }


  }

  setDefaultRegisterType() {
    this.createReceiptForm.controls['registerTypeControl'].setValue("");
    this.createReceiptForm.controls['registerTypeControl'].updateValueAndValidity();
  }

  setDefaultOrg() {
    const org = this.organizationList.find(o => o.parentId === null);
    this.cashReceiptModel.OrganizationId = org.organizationId;
    this.createReceiptForm.controls['organizationName'].setValidators(null);
    this.createReceiptForm.controls['organizationName'].setValue(org.organizationName);
    this.createReceiptForm.controls['organizationName'].updateValueAndValidity();
  }

  setDefaultStatus() {
    const toSelectOrderStatus = this.statusOfReceipt.find(stt => stt.categoryCode === "DSO");
    this.createReceiptForm.controls['status'].setValue(toSelectOrderStatus);
  }

  setDefaultPaidDate() {
    var datePipe = new DatePipe("en-US");
    var today = new Date();
    let formatedyear = datePipe.transform(today, 'yyyy-MM-dd');
    this.currentDatestring = formatedyear;
    this.voucherDateString = formatedyear;
  }

  setDefaultCurrencyUnit() {
    const toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === 'VND');
    this.currencyLabel = toSelectMoneyUnit.categoryCode;
  }

  setDefaultExchangeRate() {
    this.createReceiptForm.controls['exchangeRate'].setValue('1');
    this.createReceiptForm.controls['exchangeRate'].setValidators(null);
    this.createReceiptForm.controls['exchangeRate'].updateValueAndValidity();
  }

  // tslint:disable-next-line:member-ordering
  price: number;
  // convenience getter for easy access to form fields
  get f() { return this.createReceiptForm.controls; }

  createReceipt(value: boolean) {
    if (!this.createReceiptForm.valid) {
      Object.keys(this.createReceiptForm.controls).forEach(key => {
        if (this.createReceiptForm.controls[key].valid == false) {
          this.createReceiptForm.controls[key].markAsTouched();
        }
      });

      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
      this.emitStatusChangeForm = this.createReceiptForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });
    } else if (!this.validationListOrder()) {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? thanh to??n c???a ????n h??ng kh??ng h???p l???' };
      this.showMessage(mgs);
    }
    else {
      this.cashReceiptModel.ReceiptInvoiceReason = this.reasonControl.value.categoryId;

      this.cashReceiptModel.RegisterType = this.registerTypeControl.value.categoryId;

      let receipter = this.receipters.value;
      if (this.receipter === 'THA') {
        this.cashReceiptMappingModel.ObjectId = receipter ? receipter.customerId : null;
      } else if (this.receipter === 'TTA') {
        this.cashReceiptMappingModel.ObjectId = receipter ? receipter.vendorId : null;
      } else {
        this.cashReceiptMappingModel.ObjectId = receipter ? receipter.employeeId : null;
      }

      //Tr???ng th??i
      let status = this.status.value;
      this.cashReceiptModel.StatusId = status ? status.categoryId : null;

      //Ng??y h???ch to??n
      let paidDate = this.receiptDate.value;
      paidDate = convertToUTCTime(paidDate);
      this.cashReceiptModel.ReceiptDate = paidDate;

      // Ng??y ch???ng t???
      let vouchersDate = this.voucherDate.value;
      vouchersDate = convertToUTCTime(vouchersDate);
      this.cashReceiptModel.VouchersDate = vouchersDate;

      //N???i dung
      this.cashReceiptModel.ReceiptInvoiceDetail = this.content.value.trim();

      this.cashReceiptModel.RecipientName = this.receiptName.value.trim();

      this.cashReceiptModel.RecipientAddress = this.recipientAddressControl.value ? this.recipientAddressControl.value.trim() : '';

      this.cashReceiptModel.ReceiptInvoiceNote = this.noteControl.value ? this.noteControl.value.trim() : '';

      this.cashReceiptModel.IsSendMail = this.isSendMail;
      //Lo???i ti???n (VND, USD,...)
      let toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === this.currencyLabel);
      this.cashReceiptModel.CurrencyUnit = toSelectMoneyUnit.categoryId;

      //Ti???n (ch??a t??nh t??? gi??)
      this.cashReceiptModel.UnitPrice = parseFloat(this.unitPrice.value.replace(/,/g, ''));

      //T??? gi??
      this.cashReceiptModel.ExchangeRate = parseFloat(this.exchangeRate.value.replace(/,/g, ''));

      //Th??nh ti???n (???? t??nh t??? gi??)
      if (!this.cashReceiptModel.Amount) {
        this.cashReceiptModel.Amount = 0;
      }

      for (let i = 0; i < this.listOrder.length; i++) {
        let listHis = {
          orderId: this.listOrder[i].orderId,
          amountCollected: this.listOrder[i].amountCollected,
          amount: this.listOrder[i].amountReceivable
        }
        if (listHis.amountCollected > '0') {
          this.listOrderHistory.push(listHis);
        }

      }

      this.saveReceipt(value);
    }
  }

  saveReceipt(value: boolean) {
    this.awaitResult = true;
    this.loading = true;
    this.accountingService.createReceiptInvoice(this.cashReceiptModel, this.cashReceiptMappingModel,
      this.auth.UserId, this.listOrderHistory, this.orderId).subscribe(response => {
        const result = <any>response;
        this.loading = false;
        if (result.statusCode == 202 || result.statusCode == 200) {
          let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o phi???u thu ti???n m???t th??nh c??ng' };
          this.showMessage(mgs);

          if (value) {
            if (this.emitStatusChangeForm) {
              this.emitStatusChangeForm.unsubscribe();
              this.isInvalidForm = false; //???n icon-warning-active
            }
            this.resetFormAndModel();
            this.awaitResult = false;
          } else {
            if (this.orderId) {
              this.router.navigate(['/order/order-detail', { customerOrderID: this.orderId }]);
            } else {
              this.cancel();
            }
            this.awaitResult = false;
          }
        } else {
          this.listOrderHistory = [];
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(mgs);
          this.awaitResult = false;
        }
      }, error => { });
  }

  selectPaidDate() {
    let receiptDate: Date = this.receiptDate.value;
    this.maxVouchersDate = receiptDate;
    if (receiptDate < this.voucherDate.value) {
      this.voucherDate.setValue(receiptDate);
    }
  }

  resetFormAndModel() {
    /*Reset form and set default value*/
    this.setDefaultReason();  //L?? do chi
    this.receipters.reset();  //?????i t?????ng chi
    this.setDefaultRegisterType();  //Lo???i s???
    this.setDefaultOrg(); //N??i chi
    this.setDefaultStatus(); //Tr???ng th??i
    this.setDefaultPaidDate();  //Ng??y h???ch to??n
    this.receiptName.reset(); //Ng?????i nh???n
    this.createReceiptForm.controls['recipientAddressControl'].reset(); //?????a ch???
    this.createReceiptForm.controls['content'].reset(); //N???i dung chi
    this.createReceiptForm.controls['unitPrice'].reset(); //S??? ti???n
    this.setDefaultCurrencyUnit();  //set default value: ????n v??? ti???n
    this.setDefaultExchangeRate();  //T??? gi??
    this.isShowExchangeRate = false;
    this.isShowPriceForeign = false;
    this.createReceiptForm.controls['noteControl'].reset();
    this.unitPrice.setValue('0');
    /*End*/

    /*Reset model*/
    this.cashReceiptModel.RegisterType = null;  //Lo???i s???
    this.cashReceiptMappingModel.ObjectId = null; //?????i t?????ng chi
    this.cashReceiptModel.RecipientName = null; //Ng?????i nh???n
    this.cashReceiptModel.RecipientAddress = null; //?????a ch???
    this.cashReceiptModel.ReceiptInvoiceDetail = null;  //N???i dung chi
    this.cashReceiptModel.UnitPrice = null; //S??? ti???n
    const toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === 'VND');
    this.cashReceiptModel.CurrencyUnit = toSelectMoneyUnit.categoryId; //????n v??? ti???n
    this.priceForeign = null; //S??? ti???n quy ra VND n???u ????n v??? ti???n kh??ng ph???i VND
    this.cashReceiptModel.ReceiptInvoiceNote = '';
    this.cashReceiptMappingModel.ObjectId = null;
    this.cashReceiptModel.Amount = null;
    this.listOrder = [];
    /*End*/
  }

  // Check Reason Pay Code
  changeReasonPay(value: Category) {
    this.receipterList = [];
    this.unitPrice.setValue('0');
    this.exchangeRate.setValue('1');
    this.cashReceiptModel.Amount = 0;
    // this.bankPaymentModel.OrganizationId = null;
    this.loading = true;

    this.categoryService.getCategoryById(value.categoryId).subscribe(response => {
      const result = <any>response;
      this.loading = false;
      this.receipter = result.category.categoryCode;

      if (this.receipter === 'TVI') {
        this.receipters.setValue('');
        this.createReceiptForm.controls['receipters'].setValidators(Validators.required);
        this.createReceiptForm.controls['receipters'].updateValueAndValidity();
        this.loading = true;
        this.employeeService.searchEmployee('', '', '', '', [], '').subscribe(response1 => {
          const result1 = <any>response1;
          this.loading = false;
          this.receipterList = result1.employeeList;
          this.receipterList.forEach(item => {
            item.employeeName = item.employeeCode + ' - ' + item.employeeName;
          });
        }, error => { });
      } else if (this.receipter === 'TTA') {
        this.receipters.setValue('');
        this.createReceiptForm.controls['receipters'].setValidators(Validators.required);
        this.createReceiptForm.controls['receipters'].updateValueAndValidity();

        this.loading = true;
        this.vendorService.getAllVendorToPay().subscribe(response2 => {
          const result2 = <any>response2;
          this.loading = false;
          this.receipterList = result2.vendorList;
          this.receipterList.forEach(item => {
            item.vendorName = item.vendorCode + ' - ' + item.vendorName;
          });
        }, error => { });
      } else if (this.receipter === 'THA') {
        this.receipters.setValue('');
        this.createReceiptForm.controls['receipters'].setValidators(Validators.required);
        this.createReceiptForm.controls['receipters'].updateValueAndValidity();

        this.loading = true;
        this.customerService.getAllCustomer().subscribe(response3 => {
          const result3 = <any>response3;
          this.loading = false;
          this.receipterList = result3.customerList;
          this.receipterList.forEach(item => {
            item.customerName = item.customerCode + ' - ' + item.customerName;
          });
        }, error => { });
      } else {
        this.createReceiptForm.controls['receipters'].setValidators(null);
        this.createReceiptForm.controls['receipters'].updateValueAndValidity();
      }
    }, error => { });

  }

  displayCustomer(value: any) {
    return typeof value === 'string' ? value : (value == null ? '' : value.customerName);
  }

  private _filterCustomer(value: string, array: any) {
    return array.filter(state =>
      (state.customerName != null && state.customerName.toLowerCase().indexOf(value.toLowerCase()) >= 0) ||
      (state.customerCode != null && state.customerCode.toLowerCase().indexOf(value.toLowerCase()) >= 0)
    );
  }

  // Choose first item when press enter key
  chooseFirstOption(): void {
    //this.matAutocomplete.options.first.select();
  }

  async changeCustomer(value: Customer) {
    this.listOrder = [];
    if (value) {
      this.loading = true;
      let result: any = await this.accountingService.getOrderByCustomerIdAsync(this.auth.UserId, value.customerId, this.orderId);
      this.loading = false;
      if (result.statusCode == 200) {
        this.listOrder = result.listOrder;
        this.totalAmountReceivable = result.totalAmountReceivable;

        if (this.listOrder.length > 0) {
          this.listOrder.forEach(item => {
            item.amountCollected = this.decimalPipe.transform(item.amountCollected.toString());
            item.error = false;
          });
        }

      } else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    }

    this.handleMoney();
  }

  //T??nh l???i ?? S??? ti???n
  handleMoney() {
    let exchangeRate = 1;
    if (this.exchangeRate.value.trim() == '') {
      exchangeRate = 1;
    } else {
      exchangeRate = parseFloat(this.exchangeRate.value.replace(/,/g, ''));
    }

    let totalAmountCollected = 0;
    //T??nh t???ng ti???n nh???n c???a t???t c??? ????n h??ng
    this.listOrder.forEach(item => {
      if (item.amountCollected == '') {
        item.amountCollected = '0';
      } else {
        let amountCollected = parseFloat(item.amountCollected.replace(/,/g, ''));
        if (amountCollected > item.amountReceivable) {
          item.error = true;
        } else {
          item.error = false;
        }
      }
      let amountCollected = parseFloat(item.amountCollected.replace(/,/g, ''));
      totalAmountCollected += amountCollected;
    });

    //G??n l???i cho ?? S??? ti???n
    if (this.currencyLabel == 'VND') {
      this.unitPrice.setValue(totalAmountCollected.toString());
      this.cashReceiptModel.Amount = totalAmountCollected;
    } else {
      let unitPrice = this.roundNumber((totalAmountCollected / exchangeRate), parseInt(this.defaultNumberType, 10));
      this.unitPrice.setValue(unitPrice.toString());
      this.cashReceiptModel.Amount = totalAmountCollected;
    }
  }

  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case 0: {
        result = result;
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


  // Back to receipt list
  cancel() {
    this.router.navigate(['/accounting/cash-receipts-list']);
  }

  openOrgPopup() {
    let ref = this.dialogService.open(OrganizationDialogComponent, {
      data: {
        chooseFinancialIndependence: true //N???u ch??? ch???n ????n v??? ?????c l???p t??i ch??nh
      },
      header: 'Ch???n ????n v???',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.cashReceiptModel.OrganizationId = result.selectedOrgId;
          this.createReceiptForm.controls['organizationName'].setValue(result.selectedOrgName);
        }
      }
    });
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  clearDataReceipter() {
    this.receipters.reset();
    this.cashReceiptMappingModel.ObjectId = null;
    this.listOrder = [];
    this.unitPrice.reset();
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  ngOnDestroy() {
    $("body").removeClass("sidebar-collapse");
  }

  setExchangeRate() {
    //Set value
    this.exchangeRate.setValue('1');
    if (this.currencyLabel == 'VND') {
      //Remove validators for FormControl
      this.exchangeRate.setValidators(null);
      this.exchangeRate.updateValueAndValidity();
    } else {
      //Add validators for FormControl
      this.exchangeRate.setValidators([Validators.required]);
      this.exchangeRate.updateValueAndValidity();
    }

    //T??nh l???i ti???n khi thay ?????i lo???i ti???n t???
    this.calculatorMoney();
  }

  calculatorMoney() {
    let unitPrice = 0;

    if (this.unitPrice.value.toString().trim() == '') {
      unitPrice = 0;
      this.unitPrice.setValue('0');
    } else {
      unitPrice = parseFloat(this.unitPrice.value.toString().replace(/,/g, ''));
    }

    let exchangeRate = 1;
    if (this.exchangeRate.value.toString().trim() == '') {
      exchangeRate = 1;
      this.exchangeRate.setValue('1');
    } else {
      exchangeRate = parseFloat(this.exchangeRate.value.toString().replace(/,/g, ''));
    }

    if (this.currencyLabel == 'VND') {
      this.cashReceiptModel.Amount = unitPrice;
    } else {
      this.cashReceiptModel.Amount = unitPrice * exchangeRate;
    }

    this.reloadAmountCollected(this.cashReceiptModel.Amount);
  }

  //T??nh l???i s??? ti???n nh???n c???a c??c ????n h??ng
  reloadAmountCollected(totalAmountCollected: number) {
    let total = totalAmountCollected;
    if (this.receipter == 'THA' && this.listOrder.length > 0) {
      this.listOrder.forEach(item => {
        item.error = false;
        item.amountCollected = '0';
        if (total >= item.amountReceivable) {
          item.amountCollected = this.decimalPipe.transform((item.amountReceivable).toString());
          total = total - item.amountReceivable;
        } else if (total != 0 && total < item.amountReceivable) {
          item.amountCollected = this.decimalPipe.transform(total.toString());
          total = 0;
        }
      });
    }
  }

  confirm(value: boolean) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n thanh to??n v?????t qu?? c??ng n??? c???a kh??ch h??ng?',
      accept: () => {
        this.saveReceipt(value);
      }
    });
  }

  //Ki??m tra l???i ??? B???ng danh s??ch ????n h??ng
  validationListOrder(): boolean {
    let result = true;

    if (this.listOrder.length > 0) {
      let errorItem = this.listOrder.find(x => x.error == true);
      if (errorItem) {
        result = false;
        return result;
      }
    }
    return result;
  }

  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 9 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
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

