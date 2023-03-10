import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { CustomerOrderService } from '../../services/customer-order.service';
import { SortEvent } from 'primeng/api';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { FormControl, Validators, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { saveAs } from "file-saver";
import { DecimalPipe } from '@angular/common';

class LocalAddress {
  localAddressId: string;
  localAddressCode: string;
  localAddressName: string;
  address: string;
  description: string;
  branchId: string;
  active: boolean;

  listLocalPoint: Array<LocalPoint>;
}

class LocalPoint {
  localPointId: string;
  localPointCode: string;
  localPointName: string;
  address: string;
  description: string;
  statusId: number;
  localAddressId: string;
  statusName: string;
  active: boolean;
}

class Customer {
  customerId: string;
  customerCode: string;
  customerName: string;
  point: number;
  payPoint: number;
}

@Component({
  selector: 'app-pay-order-service',
  templateUrl: './pay-order-service.component.html',
  styleUrls: ['./pay-order-service.component.css'],
  providers: [
    DatePipe, DecimalPipe
  ]
})
export class PayOrderServiceComponent implements OnInit {
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();
  awaitResult: boolean = false;

  @ViewChild('myTable') myTable: Table;
  @ViewChild('tableOrderetail') tableOrderetail: Table;

  colsListOrder: any;
  selectedColumns: any[];
  colsOrderDetail: any;

  listLocalAddress: Array<LocalAddress> = []; //list Khu v???c
  listLocalPoint: Array<LocalPoint> = []; //list t???t c??? ??i???m
  listCurrentLocalPoint: Array<LocalPoint> = []; //list ??i???m hi???n t???i

  listOrder: Array<any> = [];
  isGlobalFilter: string = null;

  listOrderDetail: Array<any> = [];

  dialogCustomer: boolean = false;

  payOrderForm: FormGroup;
  customerNameControl: FormControl;
  customerPhoneControl: FormControl;
  discountTypeControl: FormControl;
  discountValueControl: FormControl;
  pointControl: FormControl;
  customerMoneyControl: FormControl;
  pointAfterControl: FormControl;
  feedbackMoneyControl: FormControl;

  customer: Customer = null;
  totalPrice: number = 0;
  listDiscountType: Array<any> = [
    {
      name: 'Theo %',
      value: true
    },
    {
      name: 'Theo s??? ti???n',
      value: false
    }
  ];
  isShowPointCustomer: boolean = false;
  pointCustomer: number = 0;
  pointRate: number = 0;
  moneyRate: number = 0;
  totalPriceAfter: number = 0;

  constructor(
    private router: Router,
    private customerOrderService: CustomerOrderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe
  ) { }

  ngOnInit(): void {
    this.setForm();
    this.initTable();
    this.getDataDefault();
  }

  setForm() {
    this.customerNameControl = new FormControl({value: null, disabled: true});
    this.customerPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern())]);
    this.discountTypeControl = new FormControl(null);
    this.discountValueControl = new FormControl('0');
    this.pointControl = new FormControl('0');
    this.customerMoneyControl = new FormControl('0');
    this.pointAfterControl = new FormControl({value: '0', disabled: true});
    this.feedbackMoneyControl = new FormControl({value: '0', disabled: true});


    this.payOrderForm = new FormGroup({
      customerNameControl: this.customerNameControl,
      customerPhoneControl: this.customerPhoneControl,
      discountTypeControl: this.discountTypeControl,
      discountValueControl: this.discountValueControl,
      pointControl: this.pointControl,
      customerMoneyControl: this.customerMoneyControl,
      pointAfterControl: this.pointAfterControl,
      feedbackMoneyControl: this.feedbackMoneyControl
    });
  }

  initTable() {
    this.colsListOrder = [
      { field: 'orderCode', header: 'M??', textAlign: 'left', display: 'table-cell' },
      // { field: 'customerName', header: 'Kh??ch h??ng', textAlign: 'left', display: 'table-cell' },
      { field: 'orderDate', header: 'Ng??y ?????t h??ng', textAlign: 'right', display: 'table-cell' },
      // { field: 'orderStatusName', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell' },
      { field: 'amount', header: 'T???ng gi?? tr???', textAlign: 'right', display: 'table-cell' },
      // { field: 'sellerName', header: 'Nh??n vi??n', textAlign: 'left', display: 'table-cell' },
      // { field: 'listOrderDetail', header: 'Chi ti???t', textAlign: 'left', display: 'table-cell' },
    ];
    this.selectedColumns = this.colsListOrder;

    this.colsOrderDetail = [
      { field: 'productName', header: 'M???t h??ng', textAlign: 'left', width: '120px', display: 'table-cell' },
      { field: 'unitPrice', header: '????n gi??', textAlign: 'right', width: '75px', display: 'table-cell' },
      { field: 'quantity', header: 'SL', textAlign: 'right', width: '45px', display: 'table-cell' },
      { field: 'sumAmount', header: 'Th??nh ti???n', textAlign: 'right', width: '75px', display: 'table-cell' },
    ];
  }

  getDataDefault() {
    this.loading = true;
    this.customerOrderService.getMasterDataPayOrderService().subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        this.listLocalAddress = result.listLocalAddress;
        this.listLocalPoint = result.listLocalPoint;
        this.pointRate = result.pointRate;
        this.moneyRate = result.moneyRate;

        this.setDefaultValue();
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  setDefaultValue() {
    this.listLocalAddress.forEach(item => {
      item.active = false;
    });
    //Th??m option T???t c??? v??o Khu v???c
    let item: LocalAddress = {
      localAddressId: this.emptyGuid,
      localAddressCode: 'all',
      localAddressName: 'T???t c???',
      address: null,
      branchId: this.emptyGuid,
      description: null,
      listLocalPoint: [],
      active: true
    }
    this.listLocalAddress.unshift(item);
    this.listCurrentLocalPoint = this.listLocalPoint;

    let defaultDiscountType = this.listDiscountType.find(x => x.value == true);
    this.discountTypeControl.setValue(defaultDiscountType);
  }

  /*Thay ?????i khu v???c*/
  changeLocalAddress(localAddress: LocalAddress) {
    //reset list ????n h??ng
    this.listOrder = [];

    //highlight Khu v???c ???????c ch???n
    this.listLocalAddress.forEach(item => {
      item.active = false;
      if (item.localAddressId == localAddress.localAddressId) {
        item.active = true;
      }
    });

    //L???y c??c ??i???m theo Khu v???c
    this.customerOrderService.getLocalPointByLocalAddress(localAddress.localAddressId).subscribe(response => {
      let result: any = response;

      if (result.statusCode == 200) {
        this.listCurrentLocalPoint = result.listLocalPoint;
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });

    //b??? ch???n t???t c??? c??c ??i???m
    this.listCurrentLocalPoint.forEach(item => {
      item.active = false;
    });
  }

  /*Thay ?????i ??i???m*/
  changeLocalPoint(localPoint: LocalPoint) {
    //highlight ??i???m ???????c ch???n
    this.listCurrentLocalPoint.forEach(item => {
      item.active = false;
      if (item.localPointId == localPoint.localPointId) {
        item.active = true;
      }
    });

    //L???y listOrder theo ??i???m
    this.customerOrderService.getListOrderByLocalPoint(localPoint.localPointId).subscribe(response => {
      let result: any = response;

      if (result.statusCode == 200) {
        this.listOrder = result.listOrder;
        this.listOrder.forEach(item => {
          item.orderDate = this.datePipe.transform(item.orderDate, 'dd/MM/yyyy');
        });
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*M??? popup thanh to??n ????n h??ng*/
  openDialog() {
    this.totalPrice = 0;
    this.tableOrderetail.reset();
    let listOrderId = this.listOrder.map(x => x.orderId);
    this.listOrderDetail = [];
    if (listOrderId?.length > 0) {
      this.customer = null;

      //L???y list s???n ph???m theo ????n h??ng
      this.customerOrderService.getListOrderDetailByOrder(listOrderId[0]).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.listOrderDetail = result.listOrderDetail;
          this.listOrderDetail.forEach(item => {
            this.totalPrice += item.sumAmount;
          });

          //T??nh l???i T???ng ??i???m sau h??a ????n
          this.calculPointAfter();

          this.dialogCustomer = true;
        }
        else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
    else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Kh??ng c?? ????n h??ng ????? thanh to??n' };
      this.showMessage(msg);
    }
  }

  /*Ki???m tra xem kh??ch h??ng c?? s??? ??i???n tho???i ???????c nh???p ???? t???n t???i tr??n h??? th???ng hay kh??ng*/
  checkExistsCustomer() {
    this.customer = null;
    let customerPhone: string = null;
    this.isShowPointCustomer = false;
    this.pointCustomer = 0;
    this.pointControl.setValue('0');
    this.pointAfterControl.setValue('0');
    this.discountValueControl.setValue('0');
    this.customerMoneyControl.setValue('0');
    this.feedbackMoneyControl.setValue('0');

    customerPhone = this.customerPhoneControl.value?.trim();

    if (customerPhone && customerPhone != "" && this.customerPhoneControl.valid) {
      this.customerOrderService.checkExistsCustomerByPhone(customerPhone).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          //Tr??? v??? Kh??ch h??ng
          this.customer = result.customer;

          this.customerNameControl.setValue(this.customer.customerName);
          this.customerNameControl.enable();

          //N???u l?? kh??ch h??ng m???i th?? kh??ng show ??i???m c???a kh??ch h??ng
          if (this.customer.customerCode == "KHL001") {
            this.isShowPointCustomer = false;
            this.pointCustomer = 0;
            this.pointAfterControl.setValue('0');
          }
          //N???u l?? kh??ch h??ng c?? th?? show ??i???m c???a kh??ch h??ng
          else {
            this.isShowPointCustomer = true;
            this.pointCustomer = this.customer.point;

            //T??nh ??i???m sau h??a ????n cho kh??ch h??ng
            let pointAfter = this.pointCustomer + this.roundNumber(this.totalPrice / this.pointRate, 0);
            this.pointAfterControl.setValue(pointAfter.toString());
          }

          //T??nh l???i T???ng ??i???m sau h??a ????n
          this.calculPointAfter();
        }
        else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
    else {
      this.customerNameControl.setValue(null);
      this.customerNameControl.disable();
      this.isShowPointCustomer = false;
      this.pointCustomer = 0;
      this.pointControl.setValue('0');
      this.pointAfterControl.setValue('0');
      this.discountValueControl.setValue('0');
      this.customerMoneyControl.setValue('0');
      this.feedbackMoneyControl.setValue('0');

      //T??nh l???i T???ng ??i???m sau h??a ????n
      this.calculPointAfter();
    }
  }

  /*Thay ?????i lo???i chi???t kh???u*/
  changeDiscountType() {
    this.discountValueControl.setValue('0');

    //T??nh l???i T???ng ??i???m sau h??a ????n
    this.calculPointAfter();
  }

  /*Thay ?????i gi?? tr??? chi???t kh???u*/
  changeDiscountValue() {
    let discountValueString = this.discountValueControl.value;
    let discountValue = 0;
    if (discountValueString && discountValueString.trim() != "") {
      discountValue = ParseStringToFloat(discountValueString);
    }
    else {
      this.discountValueControl.setValue('0');
      discountValue = 0;
    }

    if (this.discountTypeControl.value.value) {
      if (discountValue > 100) {
        this.discountValueControl.setValue('100');
      }
    }
    else {
      if (discountValue > this.totalPrice) {
        this.discountValueControl.setValue(this.totalPrice.toString());
      }
    }

    //T??nh l???i T???ng ??i???m sau h??a ????n
    this.calculPointAfter();
  }

  /*Thay ?????i s??? thanh to??n b???ng ??i???m*/
  changePoint() {
    let pointString = this.pointControl.value;
    if (pointString && pointString.trim() != "") {
      let point = ParseStringToFloat(pointString);

      if (point > this.pointCustomer) {
        this.pointControl.setValue(this.pointCustomer.toString());
      }
      else {
        this.pointControl.setValue(point.toString());
      }

      //T??nh l???i T???ng ??i???m sau h??a ????n
      this.calculPointAfter();
    }
    else {
      this.pointControl.setValue('0');
    }
  }

  /*Thay ?????i s??? ti???n kh??ch ????a*/
  changeCustomerMoney() {
    let moneyString = this.customerMoneyControl.value;
    let money = 0;
    if (moneyString && moneyString.trim() != "") {
      money = ParseStringToFloat(moneyString);
    }
    else {
      this.customerMoneyControl.setValue('0');
    }

    this.calculPointAfter();
  }

  /*T??nh l???i T???ng ??i???m sau h??a ????n*/
  calculPointAfter() {
    //T???ng ??i???m sau h??a ????n
    let point = ParseStringToFloat(this.pointControl.value);
    let discount = 0;
    if (this.discountTypeControl.value.value) {
      discount = this.totalPrice * ParseStringToFloat(this.discountValueControl.value) / 100;
    }
    else {
      discount = ParseStringToFloat(this.discountValueControl.value);
    }

    //T??nh ti???n ph???i thanh to??n th???c t???
    this.totalPriceAfter = this.roundNumber(this.totalPrice - discount - point * this.moneyRate, parseInt(this.defaultNumberType, 10));

    //T??nh T???ng ??i???m sau h??a ????n
    let currentPoint = this.roundNumber(this.totalPriceAfter / this.pointRate, 0);
    let pointAfter = this.roundNumber(this.pointCustomer - (discount / this.pointRate) - point + currentPoint, 0);
    this.pointAfterControl.setValue(pointAfter.toString());

    let moneyString = this.customerMoneyControl.value;
    let money = ParseStringToFloat(moneyString);
    if (money < this.totalPriceAfter) {
      this.feedbackMoneyControl.setValue('0');
    }
    else {
      let feedbackMoney = this.roundNumber((this.totalPriceAfter - money), parseInt(this.defaultNumberType, 10));
      this.feedbackMoneyControl.setValue(feedbackMoney.toString());

      this.customerMoneyControl.setValidators(null);
      this.customerMoneyControl.updateValueAndValidity();
    }
  }

  /*Thanh to??n ????n h??ng c???a ??i???m hi???n t???i*/
  payOrder() {
    let listOrderId = this.listOrder.map(x => x.orderId);
    let localPoint = this.listCurrentLocalPoint.find(x => x.active == true);
    let discountType: boolean = this.discountTypeControl.value.value;
    let discountValue: number = ParseStringToFloat(this.discountValueControl.value.toString());
    let point: number = ParseStringToFloat(this.pointAfterControl.value); //T???ng ??i???m sau khi thanh to??n (??i???m hi???n t???i)
    let payPoint: number = ParseStringToFloat(this.pointControl.value); //??i???m ???? d??ng ????? thanh to??n

    if (listOrderId.length > 0 && localPoint) {
      //ki???m tra s??? ti???n thanh to??n c???a kh??ch h??ng
      let moneyString = this.customerMoneyControl.value;
      let money = ParseStringToFloat(moneyString);
      if (this.totalPriceAfter < 0) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? ti???n ph???i thanh to??n kh??ng h??p l???' };
        this.showMessage(msg);
      }
      else if (money < this.totalPriceAfter) {
        /*B???t validator ki???m tra*/
        this.customerMoneyControl.setValidators([compareNumberValidator(this.totalPriceAfter)]);
        this.customerMoneyControl.updateValueAndValidity();
        /*End*/
      }
      else {
        this.awaitResult = true;
        this.loading = true;
        this.customerOrderService.payOrderByLocalPoint(listOrderId,
          this.customer?.customerId, this.customerNameControl.value?.trim(), this.customerPhoneControl.value?.trim(),
          discountType, discountValue, point, payPoint).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            this.exportPdf(new Date(result.orderDate), result.customerName, result.customerPhone, result.cashierName);

            let listLocalPointId = result.listLocalPointId;
            //reset list ????n h??ng
            this.listOrder = [];

            //reset form Th??ng tin thanh to??n
            this.refreshPayForm();

            //reset customer
            this.customer = null;

            //reset status c???a c??c ??i???m thu???c Khu v???c hi???n t???i v??? tr???ng th??i s???n s??ng
            this.listCurrentLocalPoint.forEach(item => {
              var exists = listLocalPointId.find(x => x == item.localPointId);
              if (exists) {
                item.statusId = 1;
              }
            });

            this.awaitResult = false;

            //????ng popup
            this.dialogCustomer = false;

            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Thanh to??n th??nh c??ng' };
            this.showMessage(msg);
          }
          else {
            this.awaitResult = false;
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    }
    else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Kh??ng c?? ????n h??ng ????? thanh to??n' };
      this.showMessage(msg);
    }
  }

  /*H???y Dialog thanh to??n*/
  cancelPayOrder() {
    this.refreshPayForm();

    this.dialogCustomer = false;
  }

  refreshPayForm() {
    this.payOrderForm.reset();
    this.customerNameControl.disable();
    let defaultDiscountType = this.listDiscountType.find(x => x.value == true);
    this.discountTypeControl.setValue(defaultDiscountType);
    this.pointControl.setValue('0');
    this.pointAfterControl.setValue('0');
    this.discountValueControl.setValue('0');
    this.customerMoneyControl.setValue('0');
    this.customerMoneyControl.setValidators(null);
    this.customerMoneyControl.updateValueAndValidity();
    this.feedbackMoneyControl.setValue('0');
    this.isShowPointCustomer = false;
    this.pointCustomer = 0;
  }

  exportPdf(orderDate: Date, customerName: string, customerPhone: string, cashierName: string) {
    //T??nh ti???n chi???t kh???u
    let discount = 0;
    if (this.discountTypeControl.value.value) {
      discount = this.totalPrice * ParseStringToFloat(this.discountValueControl.value) / 100;
    }
    else {
      discount = ParseStringToFloat(this.discountValueControl.value);
    }

    //Thanh to??n b???ng ??i???m
    let point = ParseStringToFloat(this.pointControl.value);

    //T???ng thanh to??n
    let totalPriceAfter = this.totalPriceAfter;

    //Ti???n kh??ch ????a
    let customerMoney = ParseStringToFloat(this.customerMoneyControl.value);

    //Ti???n th???a tr??? kh??ch
    let feedbackMoney = ParseStringToFloat(this.feedbackMoneyControl.value);

    //T???ng ??i???m sau h??a ????n
    let pointAfter = ParseStringToFloat(this.pointAfterControl.value);

    let documentDefinition: any = {
      pageSize: {
        width: 300.75,
        height: 'auto'
      },
      pageMargins: [5, 5, 5, 5],
      content: [
        {
          table: {
            widths: [50, 200],
            body: [
              [
                {
                  stack: [
                    {
                      text: "" + "?????C QU??N".toUpperCase(),
                      style: { fontSize: 7 },
                      alignment: 'left',
                      lineHeight: 0.75
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: "Chi nh??nh: " + "81 ???????ng Phan K??? B??nh, Ph?????ng C???ng V???, Qu???n Ba ????nh H?? N???i",
                      style: { fontSize: 7 },
                      alignment: 'left'
                    },
                    {
                      text: '',
                      margin: [0, 2, 0, 2]
                    },
                    {
                      text: '??i???n tho???i: ' + "097 881 58 95",
                      style: { fontSize: 7 },
                      alignment: 'left'
                    }
                  ],
                }
              ],
            ]
          },
          layout: {
            defaultBorder: false
          },
          lineHeight: 1
        },
        {
          text: '',
          margin: [0, 10, 0, 10]
        },
        {
          text: 'Ng??y b??n: ' + this.convertDateToString(orderDate),
          style: { fontSize: 7 },
          alignment: 'left',
          margin: [0, 4, 0, 4]
        },
        {
          text: 'H??A ????N B??N H??NG',
          style: 'header',
          alignment: 'center',
          margin: [0, 4, 0, 4]
        },
        {
          text: 'Kh??ch h??ng: ' + customerName,
          style: { fontSize: 7 },
          alignment: 'left',
          margin: [0, 2, 0, 2]
        },
        {
          text: "S??? ??i???n tho???i: " + customerPhone,
          style: { fontSize: 7 },
          alignment: 'left',
          margin: [0, 2, 0, 2]
        },
        {
          text: "Nh??n vi??n thu ng??n: " + cashierName,
          style: { fontSize: 7 },
          alignment: 'left',
          margin: [0, 2, 0, 2]
        },
        {
          style: 'table',
          table: {
            widths: [80, 40, 50, 85],
            headerRows: 1,
            dontBreakRows: true,
            body: [
              [
                { text: 'M???t h??ng', style: 'tableHeader', alignment: 'center' },
                { text: '????n gi??', style: 'tableHeader', alignment: 'center' },
                { text: 'S??? l?????ng', style: 'tableHeader', alignment: 'center' },
                { text: 'Th??nh ti???n', style: 'tableHeader', alignment: 'center' },
              ],
            ]
          },
          layout: {
            defaultBorder: true,
            paddingTop: function (i, node) { return 2; },
            paddingBottom: function (i, node) { return 2; }
          }
        },
        {
          text: '',
          margin: [0, -15.5, 0, -15.5]
        },
        {
          style: 'table',
          table: {
            widths: [188, 85],
            headerRows: 1,
            dontBreakRows: true,
            body: [
              [
                { text: 'T???ng ti???n h??ng:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(this.totalPrice), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
              [
                { text: 'Chi???t kh???u:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(discount), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
              [
                { text: 'Thanh to??n b???ng ??i???m:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(point), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
              [
                { text: 'T???ng thanh to??n:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(totalPriceAfter), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
              [
                { text: 'Ti???n kh??ch ????a:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(customerMoney), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
              [
                { text: 'Ti???n th???a tr??? kh??ch:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(feedbackMoney), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
              [
                { text: 'T???ng ??i???m sau h??a ????n:', style: 'tableHeader', alignment: 'right' },
                { text: this.decimalPipe.transform(pointAfter), style: { fontSize: 7, bold: true }, alignment: 'right' },
              ],
            ]
          },
          layout: {
            defaultBorder: true,
            paddingTop: function (i, node) { return 2; },
            paddingBottom: function (i, node) { return 2; }
          }
        },
        {
          text: '',
          style: { fontSize: 7 },
          alignment: 'left',
          margin: [0, 2, 0, 2]
        },
        {
          text: 'H??a ????n ch??? xu???t trong ng??y',
          style: { fontSize: 7, italics: true, bold: true },
          alignment: 'left',
          margin: [0, 2, 0, 2]
        },
        {
          text: 'H??a ????n VAT xin li??n h??? 0976392466',
          style: { fontSize: 7, italics: true, bold: true },
          alignment: 'left',
          margin: [0, 2, 0, 2]
        },
        {
          text: 'C???m ??n qu?? kh??ch h??ng',
          style: { fontSize: 7, italics: true, bold: true },
          alignment: 'center',
          margin: [0, 2, 0, 2]
        },
      ],
      styles: {
        header: {
          fontSize: 10,
          bold: true
        },
        timer: {
          fontSize: 10,
          italics: true
        },
        table: {
          margin: [0, 15, 0, 15]
        },
        tableHeader: {
          fontSize: 7,
          bold: true
        },
        tableLines: {
          fontSize: 7,
        },
        StyleItalics: {
          italics: true
        }
      }
    };

    this.listOrderDetail.forEach(item => {
      let option = [
        { text: item.productName, style: 'tableLines', alignment: 'left' },
        { text: this.decimalPipe.transform(item.unitPrice), style: 'tableLines', alignment: 'right' },
        { text: this.decimalPipe.transform(item.quantity), style: 'tableLines', alignment: 'right' },
        { text: this.decimalPipe.transform(item.sumAmount), style: 'tableLines', alignment: 'right' },
      ];
      documentDefinition.content[7].table.body.push(option);
    });

    pdfMake.createPdf(documentDefinition).open();
  }

  goToOrderDetail(orderId: string) {
    this.router.navigate(['/order/order-detail', { customerOrderID: orderId }]);
  }

  goToCustomerDetail(customerId: string) {

  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
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

  dateFieldFormat: string = 'DD/MM/YYYY';
  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];

      /**Customize sort date */
      if (event.field == 'orderDate') {
        const date1 = moment(value1, this.dateFieldFormat);
        const date2 = moment(value2, this.dateFieldFormat);

        let result: number = -1;
        if (moment(date2).isBefore(date1, 'day')) { result = 1; }

        return result * event.order;
      }
      /**End */

      let result = null;

      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
    });
  }

  convertDateToString(date: Date) {
    return this.datePipe.transform(date, "dd/MM/yyyy HH:mm");
  }
}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

//So s??nh gi?? tr??? nh???p v??o v???i m???t gi?? tr??? x??c ?????nh
function compareNumberValidator(number: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value && (parseFloat(control.value.replace(/,/g, '')) < number)) {
      return { 'numberInvalid': true };
    }
    return null;
  };
}
