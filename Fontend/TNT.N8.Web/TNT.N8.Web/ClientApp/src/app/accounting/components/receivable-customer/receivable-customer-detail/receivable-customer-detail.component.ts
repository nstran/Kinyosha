import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CategoryService } from '../../../../shared/services/category.service';
import { AuthenticationService } from '../../../../shared/services/authentication.service';
import { AccountingService } from '../../../services/accounting.service';
import { FormControl, FormGroup } from '@angular/forms';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { Table } from 'primeng/table';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { SortEvent, MessageService } from 'primeng/api';

class receivableCustomerDetailModel {
  createDateOrder: Date;
  createDateReceiptInvoice: Date;
  createdBy: string;
  createdByName: string;
  customerCode: string;
  customerId: string;
  customerName: string;
  customerOrderId: string;
  descriptionReceipt: string;
  nearestTransaction: Date;
  orderCode: string;
  orderName: string;
  orderValue: number;
  productId: string;
  receiptCode: string;
  receiptId: string;
  receiptInvoiceValue: number;
  status: string;
  totalPaid: number;
  totalReceipt: number;
  totalSales: number;
  totalUnpaid: number;
}

class receiptModel {
  createDateOrder: Date;
  createDateReceiptInvoice: Date;
  createdBy: string;
  createdByName: string;
  customerCode: string;
  customerId: string;
  customerName: string;
  customerOrderId: string;
  descriptionReceipt: string;
  nearestTransaction: Date;
  orderCode: string;
  orderName: string;
  orderValue: number;
  productId: string;
  receiptCode: string;
  receiptId: string;
  receiptInvoiceValue: number;
  status: string;
  totalPaid: number;
  totalReceipt: number;
  totalSales: number;
  totalUnpaid: number;
}

@Component({
  selector: 'app-receivable-customer-detail',
  templateUrl: './receivable-customer-detail.component.html',
  styleUrls: ['./receivable-customer-detail.component.css'],
})
export class ReceivableCustomerDetailComponent implements OnInit {
  loading: boolean = false;
  //params variable
  customerId: string;
  paramFromDate: Date;
  paramToDate: Date;

  auth: any = JSON.parse(localStorage.getItem('auth'));
  //messages: any;

  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 0;
  colSumarySection: number = 3;
  //table
  colsList: any;
  selectedColumns: any[];
  colsList2: any;
  selectedColumns2: any[];
  @ViewChild('myTable1', { static: true }) myTable1: Table;
  @ViewChild('myTable2', { static: true }) myTable2: Table;
  //search form and filter
  searchForm: FormGroup;
  currentYear: number = new Date().getFullYear();
  minYear: number = this.currentYear - 10;
  maxStartDate: Date = new Date();
  maxEndDate: Date = new Date();
  //master data

  customerName: string = '';
  customerContactId: string = '';

  totalReceivableBefore: number = 0; //d?? n??? ?????u k???
  totalValueOrder: number = 0; //d?? n??? ph??t sinh trong k???
  totalValueReceipt: number = 0;// thanh to??n trong k???
  totalReceivable: number = 0; //d?? n??? cu???i k???

  listReceivableCustomerDetail: Array<receivableCustomerDetailModel> = [];
  listReceipt: Array<receiptModel> = [];

  //list action in page
  actionDownload: boolean = true;
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  //warningConfig: MatSnackBarConfig = { panelClass: 'warning-dialog', horizontalPosition: 'end', duration: 5000 };
  constructor(private translate: TranslateService,
    private route: ActivatedRoute,
    private getPermission: GetPermission,
    private accountingService: AccountingService,
    private categoryService: CategoryService,
    private authenticationService: AuthenticationService,
    public messageService: MessageService,
    //public snackBar: MatSnackBar,
    private router: Router) {
    this.translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() { //Check permission
    let resource = "acc/accounting/receivable-customer-detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      //this.snackBar.openFromComponent(WarningComponent, { data: "B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???", ...this.warningConfig });
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }

      this.initSearchForm();
      this.initTable();
      this.route.params.subscribe(params => {
        let fromDate = params['fromDate'];
        let toDate = params['toDate'];

        this.customerId = params['id'];
        this.paramFromDate = new Date(fromDate);
        this.paramToDate = new Date(toDate);
      });
      this.initFilter();
      this.search();
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  initSearchForm() {
    this.searchForm = new FormGroup({
      'FromDate': new FormControl(null),
      'ToDate': new FormControl(null),
    });
  }

  initTable() {
    //danh s??ch t???ng mua h??ng trong k???
    this.colsList = [
      { field: 'createDateOrder', header: 'Ng??y t???o', textAlign: 'right', display: 'table-cell' },
      { field: 'orderCode', header: 'M?? phi???u', textAlign: 'left', display: 'table-cell' },
      { field: 'orderName', header: 'S???n ph???m, d???ch v???', textAlign: 'left', display: 'table-cell' },
      { field: 'createdByName', header: 'Ng?????i t???o', textAlign: 'left', display: 'table-cell' },
      { field: 'orderValue', header: 'T???ng gi?? tr???', textAlign: 'right', display: 'table-cell' },
    ];

    this.selectedColumns = this.colsList;

    //danh s??ch t???ng ???? thanh to??n trong k???
    this.colsList2 = [
      { field: 'createDateReceiptInvoice', header: 'Ng??y h???ch to??n', textAlign: 'right', display: 'table-cell' },
      { field: 'receiptCode', header: 'M?? phi???u', textAlign: 'left', display: 'table-cell' },
      { field: 'descriptionReceipt', header: 'Di???n gi???i', textAlign: 'left', display: 'table-cell' },
      { field: 'createdByName', header: 'Ng?????i t???o', textAlign: 'left', display: 'table-cell' },
      { field: 'receiptInvoiceValue', header: 'T???ng gi?? tr???', textAlign: 'right', display: 'table-cell' },
    ];

    this.selectedColumns2 = this.colsList2;
  }

  initFilter() {
    this.searchForm.get('FromDate').setValue(this.paramFromDate);
    this.searchForm.get('ToDate').setValue(this.paramToDate);
  }

  search() {
    let fromDate: Date = this.searchForm.get('FromDate').value;
    let toDate: Date = this.searchForm.get('ToDate').value;

    this.loading = true;
    this.accountingService.searchReceivableCustomerDetail(this.customerId, fromDate, toDate).subscribe(response => {
      const result = <any>response;
      if (result.statusCode === 200) {

        //this.totalReceivableInPeriod = result.totalReceivableInPeriod; //kh??ng d??ng
        this.customerName = result.customerName; //t??n + m?? kh??ch h??n
        this.customerContactId = result.customerContactId; // id kh??ch h??ng

        this.totalReceivableBefore = result.totalReceivableBefore; //d?? n??? ?????u k???
        this.totalValueOrder = result.totalPurchaseProduct; //n??? ph??t sinh trong k???
        this.totalValueReceipt = result.totalReceipt;
        this.totalReceivable = result.totalReceivable;

        this.listReceipt = result.receiptsList; //t???ng ???? thanh to??n trong k???
        this.listReceivableCustomerDetail = result.receivableCustomerDetail;  //t???ng mua h??ng trong k???
      } else {
        this.showToast('error', 'Th??ng b??o', result.messageCode);
      }

      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  refreshFilter() {
    this.listReceipt = [];
    this.listReceivableCustomerDetail
    this.searchForm.reset();
    this.initFilter();
    this.search();
  }

  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 9;
        this.rightColNumber = 3;
        this.colSumarySection = 4;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
        this.colSumarySection = 3;
      }
    }
  }

  // Back to list vendor receivable
  cancel() {
    this.router.navigate(['/accounting/receivable-customer-report']);
  }

  dateFieldFormat: string = 'DD/MM/YYYY';
  sortColumnInList(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      /**Customize sort date */
      if (event.field == 'createdDate') {
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

  goToOrderDetail(rowdata: any) {
    this.router.navigate(['/order/order-detail', { customerOrderID: rowdata.customerOrderId }]);
  }

  goToReceiptDetail(rowdata: any) {
    if (rowdata.router === 'BC') {
      this.router.navigate(['/accounting/bank-receipts-detail', {id: rowdata.receiptId}]);
    }
    else {
      this.router.navigate(['/accounting/cash-receipts-view', {receiptInvoiceId: rowdata.receiptId}]);
    }
  }

  export() {
    // this.loading = true;
    // this.accountingService.exportExcelReceivableReport(this.listReceivableCustomerDetail, this.listReceipt, this.auth.UserId, this.customerId,
    //   new Date(this.receivalbeDateFrom), new Date(this.receivalbeDateTo), this.totalReceivableBefore).subscribe(response => {
    //     const result = <any>response;
    //     if (result.excelFile != null && result.statusCode === 202 || result.statusCode === 200) {
    //       const binaryString = window.atob(result.excelFile);
    //       const binaryLen = binaryString.length;
    //       const bytes = new Uint8Array(binaryLen);
    //       for (let idx = 0; idx < binaryLen; idx++) {
    //         const ascii = binaryString.charCodeAt(idx);
    //         bytes[idx] = ascii;
    //       }
    //       const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //       const link = document.createElement('a');
    //       link.href = window.URL.createObjectURL(blob);
    //       const fileName = result.customerName + ".xlsx";
    //       link.download = fileName;
    //       link.click();
    //     } else {
    //       this.snackBar.openFromComponent(FailComponent, { data: result.messageCode, ...this.failConfig });
    //     }
    //     this.loading = false;
    //   }, error => {
    //     const result = <any>error;
    //     this.snackBar.openFromComponent(FailComponent, { data: result.messageCode, ...this.failConfig });
    //   });
  }
}
