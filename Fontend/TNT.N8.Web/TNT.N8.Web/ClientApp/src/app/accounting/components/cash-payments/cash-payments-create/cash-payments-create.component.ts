import { Component, OnInit, ElementRef, ViewChild, HostListener, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../../shared/services/category.service';
import { OrganizationService } from '../../../../shared/services/organization.service';

import { AccountingService } from '../../../services/accounting.service';
import { EmployeeService } from '../../../../employee/services/employee.service';
import { CustomerService } from '../../../../customer/services/customer.service';
import { VendorService } from '../../../../vendor/services/vendor.service';
import { GetPermission } from '../../../../shared/permission/get-permission';

import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DecimalPipe, DatePipe } from '@angular/common';
import { OrganizationDialogComponent } from '../../../../shared/components/organization-dialog/organization-dialog.component';
import { CashPaymentModel } from '../../..//models/cashPayment.model';
import { CashPaymentMappingModel } from '../../..//models/cashPaymentMapping.model';
import * as $ from 'jquery';
import { async } from '@angular/core/testing';

interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string
}

@Component({
  selector: 'app-cash-payments-create',
  templateUrl: './cash-payments-create.component.html',
  styleUrls: ['./cash-payments-create.component.css'],
  providers: [
    DecimalPipe
  ]
})
export class CashPaymentsCreateComponent implements OnInit {

  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      this.withFiexd = $('#parent').width() + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;

  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();


  loading: boolean = false;
  awaitResult: boolean = false;// kh??a n??t l??u

  //hash infor
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem('auth'));
  currentUserName: string = localStorage.getItem('UserFullName');
  currentDate: Date = new Date();

  maxVouchersDate: Date = new Date();
  price: number;
  reasonOfPayment: Array<any> = [];
  typesOfPayment: Array<any> = [];
  organizationList: Array<any> = [];
  statusOfPayment: Array<any> = [];
  unitMoney: Array<any> = [];

  currentDatestring: string;
  voucherDateString: string;


  messageError: Array<string> = [];

  cashPaymentModel = new CashPaymentModel();
  cashPaymentMappingModel = new CashPaymentMappingModel();
  isShowExchangeRate = false;
  reasonId = null;
  categoryId = null;
  payer = '';
  payerList: any[];
  userId = this.auth.UserId;
  currencyCode: any;
  //exchangeRate: number;
  priceForeign: number;
  isShowPriceForeign = false;
  priceForeignString: string;

  /*FORM T???O PHI???U CHI TI???N M???T*/
  createPayableForm: FormGroup;
  reasonControl: FormControl;
  registerTypeControl: FormControl;
  payers: FormControl;
  organizationName: FormControl;
  status: FormControl;
  paidDate: FormControl;
  vouchersDate: FormControl;
  receiptName: FormControl;
  recipientAddressControl: FormControl;
  content: FormControl;
  unitPrice: FormControl;
  currencyUnit: FormControl;
  exchangeRate: FormControl;
  noteControl: FormControl;

  submitted = false;
  withFiexd: string;

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;


  fixed: boolean = false;
  listCurrency: Array<MenuItem> = [];
  currencyLabel: string = 'VND';
  /*Check user permission*/

  vendorOrderId: string;
  isShow: boolean = true;
  colLeft: number = 9;
  totalUnitPrice: number = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private el: ElementRef,
    private accountingService: AccountingService,
    private employeeService: EmployeeService,
    private customerService: CustomerService,
    private vendorService: VendorService,
    private formBuilder: FormBuilder,
    private decimalPipe: DecimalPipe,
    private renderer: Renderer2,
    private messageService: MessageService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService
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

  async ngOnInit() {
    this.setForm();
    let resource = "acc/accounting/cash-payments-create/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    }
    else {
      // this.setForm();

      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      this.loading = true;

      this.route.params.subscribe(params => { this.vendorOrderId = params['vendorOrderId'] });
      await this.getMasterData();
      this.loading = false;
    }
  }

  setForm() {
    this.reasonControl = new FormControl('');
    this.registerTypeControl = new FormControl('');
    this.payers = new FormControl('', [Validators.required]);
    this.organizationName = new FormControl('', [Validators.required]);
    this.status = new FormControl('', [Validators.required]);
    this.paidDate = new FormControl(new Date(), [Validators.required]);
    this.vouchersDate = new FormControl(new Date(), [Validators.required]);
    this.receiptName = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
    this.recipientAddressControl = new FormControl('', [Validators.maxLength(250), forbiddenSpaceText]);
    this.content = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
    this.unitPrice = new FormControl('0', [Validators.required]);
    this.exchangeRate = new FormControl('', [Validators.required]);
    this.noteControl = new FormControl('');

    this.createPayableForm = new FormGroup({
      reasonControl: this.reasonControl,
      registerTypeControl: this.registerTypeControl,
      payers: this.payers,
      organizationName: this.organizationName,
      status: this.status,
      paidDate: this.paidDate,    //ValidatorsCommon.formatDate
      vouchersDate: this.vouchersDate,
      receiptName: this.receiptName,
      recipientAddressControl: this.recipientAddressControl,
      content: this.content,
      unitPrice: this.unitPrice,
      exchangeRate: this.exchangeRate,
      noteControl: this.noteControl
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  ngAfterContentChecked(): void {
    this.ref.detectChanges();
  }

  async getMasterData() {
    this.loading = true;
    var result: any = await this.accountingService.getMasterDataPayableInvoice(this.vendorOrderId);

    this.reasonOfPayment = result.reasonOfPaymentList;
    this.reasonOfPayment.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    this.typesOfPayment = result.typesOfPaymentList;
    this.typesOfPayment.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    this.statusOfPayment = result.statusOfPaymentList;
    this.unitMoney = result.unitMoneyList;
    this.organizationList = result.organizationList;
    this.payerList = result.customerList;
    this.payerList.forEach(item => {
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

    if (this.vendorOrderId) {
      this.setDefaultPayableInvoice(result.payableInvoice);
    }
    this.loading = false;
  }

  async setDefaultReason() {
    const reasonCode = this.reasonOfPayment.find(r => r.categoryCode === 'CHA');
    this.createPayableForm.controls['reasonControl'].setValue(reasonCode);

    this.payer = 'CHA';
  }

  setDefaultRegisterType() {
    this.createPayableForm.controls['registerTypeControl'].setValue("");
    this.createPayableForm.controls['registerTypeControl'].updateValueAndValidity();
  }

  setDefaultOrg() {
    const org = this.organizationList.find(o => o.parentId === null);
    this.cashPaymentModel.OrganizationId = org.organizationId;
    this.createPayableForm.controls['organizationName'].setValidators(null);
    this.createPayableForm.controls['organizationName'].setValue(org.organizationName);
    this.createPayableForm.controls['organizationName'].updateValueAndValidity();
  }

  setDefaultStatus() {
    const toSelectOrderStatus = this.statusOfPayment.find(stt => stt.categoryCode === "DSO");
    this.createPayableForm.controls['status'].setValue(toSelectOrderStatus);
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
    this.createPayableForm.controls['exchangeRate'].setValue('1');
    this.createPayableForm.controls['exchangeRate'].setValidators(null);
    this.createPayableForm.controls['exchangeRate'].updateValueAndValidity();
  }

  async setDefaultPayableInvoice(value: any) {
    // l?? do chi
    let reasonCode = this.reasonOfPayment.find(r => r.categoryId === value.payableInvoiceReason);
    this.createPayableForm.controls['reasonControl'].setValue(reasonCode);
    this.payer = reasonCode.categoryCode;

    // ?????i t?????ng chi
    this.vendorService.getAllVendorToPay().subscribe(async response2 => {
      const result2 = <any>await response2;
      this.loading = false;
      this.payerList = result2.vendorList;
      this.payerList.forEach(item => {
        item.vendorName = item.vendorCode + ' - ' + item.vendorName;
      });

      let payer = this.payerList.find(x => x.vendorId == value.objectId);
      if (payer) {
        this.createPayableForm.controls['payers'].setValue(payer);
      }
    });

    // ng?????i nh???n
    this.createPayableForm.controls['receiptName'].setValue(value.recipientName);

    // ?????a ch???
    this.createPayableForm.controls['recipientAddressControl'].setValue(value.recipientAddress);

    // N???i dung
    this.createPayableForm.controls['content'].setValue(value.payableInvoiceDetail);

    // s??? ti???n
    this.createPayableForm.controls['unitPrice'].setValue(value.payableInvoicePrice);
    this.totalUnitPrice = value.payableInvoicePrice;
    this.calculatorMoney()
  }

  selectPaidDate() {
    let paidDate: Date = this.paidDate.value;
    this.maxVouchersDate = paidDate;
    if (paidDate < this.vouchersDate.value) {
      this.vouchersDate.setValue(paidDate);
    }
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
    if (this.unitPrice.value.trim() == '') {
      unitPrice = 0;
      this.unitPrice.setValue('0');
    } else {
      unitPrice = parseFloat(this.unitPrice.value.replace(/,/g, ''));
    }

    if (this.vendorOrderId) {
      if (this.totalUnitPrice < unitPrice) {
        this.unitPrice.setValue(this.totalUnitPrice);
        unitPrice = this.totalUnitPrice;
      }
    }

    if (this.currencyLabel == 'VND') {
      this.cashPaymentModel.Amount = unitPrice;
    } else {
      let exchangeRate = 1;
      if (this.exchangeRate.value.trim() == '') {
        exchangeRate = 1;
        this.exchangeRate.setValue('1');
      } else {
        exchangeRate = parseFloat(this.exchangeRate.value.replace(/,/g, ''));
      }
      this.cashPaymentModel.Amount = unitPrice * exchangeRate;
    }
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
          this.cashPaymentModel.OrganizationId = result.selectedOrgId;
          this.createPayableForm.controls['organizationName'].setValue(result.selectedOrgName);
        }
      }
    });
  }

  // convenience getter for easy access to form field
  get f() { return this.createPayableForm.controls; }

  createPayable(value: boolean) {
    if (!this.createPayableForm.valid) {
      Object.keys(this.createPayableForm.controls).forEach(key => {
        if (this.createPayableForm.controls[key].valid == false) {
          this.createPayableForm.controls[key].markAsTouched();
        }
      });

      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
      this.emitStatusChangeForm = this.createPayableForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });
    } else {
      // L?? do chi
      this.cashPaymentModel.PayableInvoiceReason = this.reasonControl.value.categoryId;

      // S??? chi
      this.cashPaymentModel.RegisterType = this.registerTypeControl.value.categoryId;

      // ?????i t?????ng chi
      let payer = this.payers.value;
      if (this.payer === 'CHA') {
        this.cashPaymentMappingModel.ObjectId = payer ? payer.customerId : null;
      } else if (this.payer === 'CTA') {
        this.cashPaymentMappingModel.ObjectId = payer ? payer.vendorId : null;
      } else {
        this.cashPaymentMappingModel.ObjectId = payer ? payer.employeeId : null;
      }

      //????n h??ng
      let orderId = this.vendorOrderId ? this.vendorOrderId : null;
      this.cashPaymentModel.ObjectId = orderId;

      //Tr???ng th??i
      let status = this.status.value;
      this.cashPaymentModel.StatusId = status ? status.categoryId : null;

      //Ng??y h???ch to??n
      let paidDate = this.paidDate.value;
      paidDate = convertToUTCTime(paidDate);
      this.cashPaymentModel.PaidDate = paidDate;

      // Ng??y ch???ng t???
      let vouchersDate = this.vouchersDate.value;
      vouchersDate = convertToUTCTime(vouchersDate);
      this.cashPaymentModel.VouchersDate = vouchersDate;

      this.cashPaymentModel.RecipientName = this.receiptName.value ? this.receiptName.value.trim() : "";
      this.cashPaymentModel.RecipientAddress = this.recipientAddressControl.value ? this.recipientAddressControl.value.trim() : "";
      this.cashPaymentModel.PayableInvoiceDetail = this.content.value ? this.content.value.trim() : "";
      this.cashPaymentModel.PayableInvoiceNote = this.noteControl.value ? this.noteControl.value.trim() : "";

      //N???i dung
      this.cashPaymentModel.PayableInvoiceDetail = this.content.value.trim();

      //Lo???i ti???n (VND, USD,...)
      let toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === this.currencyLabel);
      this.cashPaymentModel.PayableInvoicePriceCurrency = toSelectMoneyUnit.categoryId;

      //Ti???n (ch??a t??nh t??? gi??)
      this.cashPaymentModel.PayableInvoicePrice = parseFloat(this.unitPrice.value.replace(/,/g, ''));

      //T??? gi??
      this.cashPaymentModel.ExchangeRate = parseFloat(this.exchangeRate.value.replace(/,/g, ''));

      //Th??nh ti???n (???? t??nh t??? gi??)
      if (!this.cashPaymentModel.Amount) {
        this.cashPaymentModel.Amount = 0;
      }

      this.saveCashPayment(value);
    }
  }

  saveCashPayment(value: boolean) {
    this.awaitResult = true;
    this.loading = true;
    this.accountingService.createPayableInvoice(this.cashPaymentModel, this.cashPaymentMappingModel,
      this.auth.UserId).subscribe(response => {
        const result = <any>response;
        this.loading = false;
        if (result.statusCode === 200) {
          let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o phi???u chi th??nh c??ng' };
          this.showMessage(mgs);
          if (value) {
            if (this.emitStatusChangeForm) {
              this.emitStatusChangeForm.unsubscribe();
              this.isInvalidForm = false; //???n icon-warning-active
            } else {
              this.resetFormAndModel();
              this.awaitResult = false;
            }
          } else {
            if (this.vendorOrderId) {
              this.router.navigate(['/vendor/detail-order', { vendorOrderId: this.vendorOrderId }]);
            } else {
              this.router.navigate(['/accounting/cash-payments-list']);
            }
            this.awaitResult = false;
          }
        } else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(mgs);
          this.awaitResult = false;
        }
      });
  }

  cancel() {
    this.router.navigate(['/accounting/cash-payments-list']);
  }

  showErrorMessage(msg: Array<string>) {
    msg.forEach(item => {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: item });
    });
  }
  resetFormAndModel() {
    /*Reset form and set default value*/
    this.setDefaultReason();  //L?? do chi
    this.payers.reset();  //?????i t?????ng chi
    this.setDefaultRegisterType();  //Lo???i s???
    this.setDefaultOrg(); //N??i chi
    this.setDefaultStatus(); //Tr???ng th??i
    this.setDefaultPaidDate();  //Ng??y h???ch to??n
    this.receiptName.reset(); //Ng?????i nh???n
    this.createPayableForm.controls['recipientAddressControl'].reset(); //?????a ch???
    this.createPayableForm.controls['content'].reset(); //N???i dung chi
    this.createPayableForm.controls['unitPrice'].reset(); //S??? ti???n
    this.setDefaultCurrencyUnit();  //set default value: ????n v??? ti???n
    this.setDefaultExchangeRate();  //T??? gi??
    this.isShowExchangeRate = false;
    this.isShowPriceForeign = false;
    this.createPayableForm.controls['noteControl'].reset();
    this.unitPrice.setValue('0');
    /*End*/


    /*Reset model*/
    this.cashPaymentModel.RegisterType = null;  //Lo???i s???
    this.cashPaymentMappingModel.ObjectId = null; //?????i t?????ng chi
    this.cashPaymentModel.RecipientName = null; //Ng?????i nh???n
    this.cashPaymentModel.RecipientAddress = null; //?????a ch???
    this.cashPaymentModel.PayableInvoiceDetail = null;  //N???i dung chi
    this.cashPaymentModel.PayableInvoicePrice = null; //S??? ti???n
    const toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === 'VND');
    this.cashPaymentModel.PayableInvoicePriceCurrency = toSelectMoneyUnit.categoryId; //????n v??? ti???n
    this.priceForeign = null; //S??? ti???n quy ra VND n???u ????n v??? ti???n kh??ng ph???i VND
    this.cashPaymentModel.PayableInvoiceNote = '';
    this.cashPaymentMappingModel.ObjectId = null;
    /*End*/
  }

  // Check Reason Pay Code
  async changeReasonPay(value: any) {
    this.loading = true;
    this.payerList = [];
    this.unitPrice.setValue('0');
    this.exchangeRate.setValue('1');

    await this.categoryService.getCategoryById(value.categoryId).subscribe(async response => {
      const result = <any>response;
      this.loading = false;
      this.payer = result.category.categoryCode;
      if (this.payer === 'CVI') {
        this.payers.setValue('');
        this.createPayableForm.controls['payers'].setValidators(Validators.required);
        this.createPayableForm.controls['payers'].updateValueAndValidity();
        this.loading = true;
        this.employeeService.searchEmployee('', '', '', '', [], '').subscribe(response1 => {
          const result1 = <any>response1;
          this.loading = false;
          this.payerList = result1.employeeList;
          this.payerList.forEach(item => {
            item.employeeName = item.employeeCode + ' - ' + item.employeeName;
          });
        });
      } else if (this.payer === 'CTA') {
        this.payers.setValue('');
        this.createPayableForm.controls['payers'].setValidators(Validators.required);
        this.createPayableForm.controls['payers'].updateValueAndValidity();
        this.loading = true;
        await this.vendorService.getAllVendorToPay().subscribe(response2 => {
          const result2 = <any>response2;
          this.loading = false;
          this.payerList = result2.vendorList;
          this.payerList.forEach(item => {
            item.vendorName = item.vendorCode + ' - ' + item.vendorName;
          });
        });
      } else if (this.payer === 'CHA') {
        this.payers.setValue('');
        this.createPayableForm.controls['payers'].setValidators(Validators.required);
        this.createPayableForm.controls['payers'].updateValueAndValidity();
        this.customerService.getAllCustomer().subscribe(response3 => {
          const result3 = <any>response3;
          this.loading = false;
          this.payerList = result3.customerList;
          this.payerList.forEach(item => {
            item.customerName = item.customerCode + ' - ' + item.customerName;
          });
        });
      } else {
        this.createPayableForm.controls['payers'].setValidators(null);
        this.createPayableForm.controls['payers'].updateValueAndValidity();
      }
    });
    this.loading = false;
  }

  // Check currency code
  changeCurrencyCode(value: any) {
    this.categoryService.getCategoryById(value).subscribe(response => {
      const result = <any>response;
      this.currencyCode = result.category.categoryCode;
      if (this.currencyCode !== 'VND') {
        this.createPayableForm.controls['exchangeRate'].setValidators([Validators.required]);
        this.createPayableForm.controls['exchangeRate'].updateValueAndValidity();
        this.isShowExchangeRate = true;
        this.isShowPriceForeign = true;
      } else if (this.currencyCode === 'VND') {
        this.createPayableForm.controls['exchangeRate'].setValidators(null);
        this.createPayableForm.controls['exchangeRate'].updateValueAndValidity();
        this.isShowExchangeRate = false;
        this.isShowPriceForeign = false;
        this.cashPaymentModel.ExchangeRate = 1;
      }
    });
  }

  // Convert Currency
  convertCurrency() {
    this.priceForeign = this.cashPaymentModel.PayableInvoicePrice *
      (this.cashPaymentModel.ExchangeRate == null ? 1 : this.cashPaymentModel.ExchangeRate);
    return this.priceForeign;
  }

  //Filter Validator ng??y h???ch to??n kh??ng < ng??y hi???n t???i
  myFilter = (d: Date): boolean => {
    let day = d;
    var n = day.setHours(23, 59, 59);
    const now = new Date();
    return (day >= now);
  }

  onKeyPress(event: any) {
    const pattern = /^[0-9\.]$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  clearDataPayer() {
    this.payers.reset();
    this.cashPaymentMappingModel.ObjectId = null;
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
