import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ProductService } from '../../../product/services/product.service';
import { SuggestedSupplierQuotesDetailModel, SuggestedSupplierQuotesModel } from '../../models/vendor.model';
import { VendorService } from '../../services/vendor.service';
import * as $ from 'jquery';
import { ActivatedRoute, Router } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';
import * as moment from 'moment';
import 'moment/locale/pt-br';


interface Vendor {
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  vendorCodeName: string;
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeCodeName: string;
}

interface Product{
  productId: string;
  productCode: string;
  productName: string;
  productCodeName: string;
}

class NoteErr {
  public code: string;
  public name: string;
}

interface ProcurementRequest {
  procurementRequestId: string;
  procurementCode: string;
  procurementContent: string;
  requestEmployeeId: string;
  employeePhone: string;
  createdById: string;
  createdDate: string;
  listProcurementRequestItem: Array<ProcurementRequestItem>;
}

interface ProcurementRequestItem {
  procurementRequestItemId: string;
  productId: string;
  productName: string;
  productCode: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  unitName: string;
  procurementRequestId: string;
  procurementPlanId: string;
  procurementPlanCode: string;
  createdById: string;
  createdDate: string;
  currencyUnit: string;
  exchangeRate: number;
  productUnitId: string;
  quantityApproval: number;
}

interface productVendorMapping {
  productVendorMappingId: string;
  productId: string;
  vendorId: string;
}

class suggestedSupplierQuotesDetailModel {
  suggestedSupplierQuoteDetailId: string;
  suggestedSupplierQuoteId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: string;
  note: string;
  active: boolean;
  quoteName: string;
  saleBiddingName: string;
  procurenmentRequest: string;
  vendorId: string;

  status: boolean;
  public listNoteErr: Array<string>;
  constructor() {
    this.listNoteErr = [];
  }
}

@Component({
  selector: 'app-vendor-quote-create',
  templateUrl: './vendor-quote-create.component.html',
  styleUrls: ['./vendor-quote-create.component.css']
})
export class VendorQuoteCreateComponent implements OnInit {

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  //Bi???n ??i???u ki???n
  loading: boolean = false;
  defaultNumberType = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  //param
  procurementRequestId: string;
  auth: any = JSON.parse(localStorage.getItem("auth"));
  minYear: number = 2000;
  currentYear: number = (new Date()).getFullYear();
  maxEndDate: Date = new Date();
  isCreate: boolean = true;
  cols: any[];
  selectedColumns: any[];
  @ViewChild('myTable') myTable: Table;

  /*BI???N L??U GI?? TR??? TR??? V???*/
  listVendor: Array<Vendor> = [];
  listProduct: Array<any> = [];
  listProcurementRequest: Array<ProcurementRequest> = [];
  listProcurementRequestItem: Array<ProcurementRequestItem> = [];
  listSuggestedSupplierQuotesDetail: Array<suggestedSupplierQuotesDetailModel> = [];
  listEmployee: Array<Employee> = [];
  listProductVendorMapping: Array<productVendorMapping> = [];
  /*END*/

  /*MODEL*/
  suggestedSupplierQuoteRequestModel = new SuggestedSupplierQuotesModel();
  /*END*/
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  //define note
  listNoteErr: Array<NoteErr> = [
    { code: "quantity_error", name: "S??? l?????ng kh??ng ???????c ????? tr???ng" },
  ];

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;

  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i
  /*FORM DIALOG*/
  SupplierQuoteForm: FormGroup;
  vendorControl: FormControl;
  picControl: FormControl;
  recommendedDateControl: FormControl;
  quoteTemDateControl: FormControl;
  procurementRequestControl: FormControl;
  descriptionControl: FormControl;
  /*END*/

  fixed: boolean = false;
  withFiexd: string = "";
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 110) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private vendorService: VendorService,
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private getPermission: GetPermission,
  ) { }

  async ngOnInit() {
    this.setForm();
    this.route.params.subscribe(async params => {
      this.procurementRequestId = params['procurementRequestId'];
      let resource = "buy/vendor/vendor-quote-create/";
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
        } else {
          this.actionAdd = true;
        }
        this.actionDelete = true; //quy???n x??a s???n ph???m d???ch v??? l?? m???c ?????nh c?? khi t???o m???i ????? ngh??? b??o gi??
        this.actionEdit = true; //quy???n s???a b??o gi?? l?? m???c ?????nh khi t???o m???i
      }
    });
   // this.setForm();
    this.setTable();
    await this.getMasterData();
    this.setDefault();
  }

  setForm() {
    this.vendorControl = new FormControl(null, [Validators.required]);
    this.picControl = new FormControl(null);
    this.recommendedDateControl = new FormControl(new Date(), [Validators.required]);
    this.quoteTemDateControl = new FormControl(new Date(), [Validators.required]);
    this.procurementRequestControl = new FormControl(null);
    this.descriptionControl = new FormControl('');

    this.SupplierQuoteForm = new FormGroup({
      vendorControl: this.vendorControl,
      picControl: this.picControl,
      recommendedDateControl: this.recommendedDateControl,
      quoteTemDateControl: this.quoteTemDateControl,
      procurementRequestControl: this.procurementRequestControl,
      descriptionControl: this.descriptionControl
    });
  }

  setTable() {
    this.cols = [
      { field: 'productCode', header: 'M?? h??ng', textAlign: 'left', color: '#f44336', width: '200px' },
      { field: 'productName', header: 'T??n h??ng', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'S??? l?????ng', textAlign: 'right', color: '#f44336', width: '120px' },
      { field: 'note', header: 'Ghi ch??', textAlign: 'left', color: '#f44336' },
      { field: 'noteErr', header: 'Th??ng b??o', textAlign: 'left', color: '#f44336' }
    ];
    this.selectedColumns = this.cols.filter(c => c.field == 'productCode' || c.field == 'productName' || c.field == 'note' || c.field == 'quantity'
      || c.field == "noteErr");
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.vendorService.getMasterDataCreateSuggestedSupplierQuoteAsync(this.suggestedSupplierQuoteRequestModel.suggestedSupplierQuoteId, this.auth.UserId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listVendor = result.listVendor;
      this.listProduct = result.listProduct;
      this.listProcurementRequest = result.listProcurementRequest;
      this.listProcurementRequestItem = result.listProcurementRequestItem;
      this.listEmployee = result.listEmployee;
      this.listProductVendorMapping = result.listProductVendorMapping;

      this.listEmployee.forEach(item => {
        item.employeeCodeName = item.employeeCode + ' - ' + item.employeeName;
      });
      this.listVendor.forEach(item => {
        item.vendorCodeName = item.vendorCode + ' - ' + item.vendorName;
      });
      this.listProduct.forEach(item => {
        item.productCodeName = item.productCode + ' - ' + item.productName;
      })
    }
  }

  setDefault() {
    if (this.procurementRequestId) {
      let procurementRequest = this.listProcurementRequest.find(c => c.procurementRequestId == this.procurementRequestId);

      if (procurementRequest) {
        this.procurementRequestControl.setValue(procurementRequest);
        let personInCharge = this.listEmployee.find(c => c.employeeId == procurementRequest.requestEmployeeId);
        this.picControl.setValue(personInCharge);

        let listProcurementRequestItem = this.listProcurementRequestItem.filter(c => c.procurementRequestId == procurementRequest.procurementRequestId);
        this.listSuggestedSupplierQuotesDetail = this.mappingProcurementRequestItemToSupplierItem(listProcurementRequestItem);
      }
    } else {
      let employee = this.listEmployee.find(c => c.employeeId == this.auth.EmployeeId);
      this.picControl.setValue(employee);
    }
  }

  changeProduct(event: any) {
    if (event.value == null) return;

    let model = this.mappingProductToSupplierQuoteDetailModel(event.value);
    this.listSuggestedSupplierQuotesDetail.push(model);
  }

  mappingProductToSupplierQuoteDetailModel(product: any): suggestedSupplierQuotesDetailModel {
    let model = new suggestedSupplierQuotesDetailModel();
    model.productId = product.productId;
    model.productCode = product.productCode;
    model.productName = product.productName;
    model.quantity = '';
    model.note = '';
    return model;
  }

  mappingProcurementRequestItemToSupplierItem(array: Array<ProcurementRequestItem>): suggestedSupplierQuotesDetailModel[] {
    let listSuggestedSupplierQuotesDetailTemp = new Array<suggestedSupplierQuotesDetailModel>();
    if (array != null) {
      array.forEach(item => {
        let model = new suggestedSupplierQuotesDetailModel();
        model.productId = item.productId;
        model.productCode = item.productCode;
        model.productName = item.productName;
        model.quantity = item.quantity.toString();
        model.note = '';

        listSuggestedSupplierQuotesDetailTemp.push(model);
      });
    }

    return listSuggestedSupplierQuotesDetailTemp;
  }

  mappingSuggestedSupplierQuoteDetailModel(array: Array<suggestedSupplierQuotesDetailModel>): Array<SuggestedSupplierQuotesDetailModel> {
    let listSuggestedSupplierQuotesDetailTemp = new Array<SuggestedSupplierQuotesDetailModel>();
    if (array != null) {
      array.forEach(item => {
        let model = new SuggestedSupplierQuotesDetailModel();
        model.productId = item.productId;
        model.productCode = item.productCode;
        model.productName = item.productName;
        model.quantity = parseFloat(item.quantity.toString().replace(/,/g, ''));
        model.note = item.note;
        model.createdById = this.auth.UserId;
        model.active = true;
        listSuggestedSupplierQuotesDetailTemp.push(model);
      });
    }

    return listSuggestedSupplierQuotesDetailTemp;
  }

  mappingForm(): SuggestedSupplierQuotesModel {
    let model = new SuggestedSupplierQuotesModel();

    model.suggestedSupplierQuoteId = this.suggestedSupplierQuoteRequestModel.suggestedSupplierQuoteId;
    let vendor = this.vendorControl.value;
    model.vendorId = vendor == null ? model.vendorId : vendor.vendorId;
    let pic = this.picControl.value;
    model.personInChargeId = pic == null ? null : pic.employeeId;
    model.recommendedDate = convertToUTCTime(this.recommendedDateControl.value);
    model.quoteTermDate = convertToUTCTime(this.quoteTemDateControl.value);
    model.note = this.descriptionControl.value;
    let procurementRequest = this.procurementRequestControl.value;
    model.procurementRequestId = procurementRequest == null ? model.procurementRequestId : procurementRequest.procurementRequestId;

    return model;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  createVendorQuote(value: boolean) {
    if (!this.SupplierQuoteForm.valid) {
      Object.keys(this.SupplierQuoteForm.controls).forEach(key => {
        if (!this.SupplierQuoteForm.controls[key].valid) {
          this.SupplierQuoteForm.controls[key].markAsTouched();
        }
      });

      this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
      this.isOpenNotifiError = true;  //Hi???n th??? message l???i
      this.emitStatusChangeForm = this.SupplierQuoteForm.statusChanges.subscribe((validity: string) => {
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

      if (this.listSuggestedSupplierQuotesDetail.length == 0) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: "Danh s???n ph???m b??o gi?? NCC kh??ng th??? tr???ng!" };
        this.showMessage(msg);
        return;
      }

      let check_quantity = this.checkStatusQuantity();
      if (check_quantity === false) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: "Danh s??ch s???n ph???m b??o gi?? NCC kh??ng h???p l???!" };
        this.showMessage(msg);
        return;
      }

      let suggestedSupplierQuoteModel = this.mappingForm();
      let suggestedSupplierQuoteDetail = this.mappingSuggestedSupplierQuoteDetailModel(this.listSuggestedSupplierQuotesDetail);

      let isCheckProductOfVendor: boolean = true;
      let listProductIdOfVendor = this.listProductVendorMapping.filter(c => c.vendorId == suggestedSupplierQuoteModel.vendorId).map(c => c.productId);
      suggestedSupplierQuoteDetail.forEach(item => {
        if (!listProductIdOfVendor.includes(item.productId)) {
          isCheckProductOfVendor = false;
        }
      });
      if (!isCheckProductOfVendor) {
        this.confirmationService.confirm({
          message: 'C?? s???n ph???m kh??ng thu???c nh?? cung c???p ???? ch???n. B???n c?? ch???c mu???n ti???p t???c?',
          key: "popup",
          accept: () => {
            this.loading = true;
            this.vendorService.createOrUpdateSuggestedSupplierQuote(suggestedSupplierQuoteModel, suggestedSupplierQuoteDetail, this.auth.UserId).subscribe(reponse => {
              let result: any = reponse;
              this.loading = false;
              if (result.statusCode == 200) {
                let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
                this.showMessage(mgs);
                if (value) {
                  //L??u v?? th??m m???i
                  if (this.emitStatusChangeForm) {
                    this.emitStatusChangeForm.unsubscribe();
                    this.isInvalidForm = false; //???n icon-warning-active
                  }
                  this.resetForm();
                  this.awaitResult = false;
                } else {
                  //L??u
                  this.router.navigate(['/vendor/vendor-quote-detail', { SuggestedSupplierQuoteId: result.suggestedSupplierQuoteId }]);
                }
              } else {
                let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
                this.showMessage(mgs);
              }
            });
          }
        });
      } else {
        this.loading = true;
        this.vendorService.createOrUpdateSuggestedSupplierQuote(suggestedSupplierQuoteModel, suggestedSupplierQuoteDetail, this.auth.UserId).subscribe(reponse => {
          let result: any = reponse;
          this.loading = false;
          if (result.statusCode == 200) {
            let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(mgs);
            if (value) {
              //L??u v?? th??m m???i
              if (this.emitStatusChangeForm) {
                this.emitStatusChangeForm.unsubscribe();
                this.isInvalidForm = false; //???n icon-warning-active
              }
              this.resetForm();
              this.awaitResult = false;
            } else {
              //L??u
              this.router.navigate(['/vendor/vendor-quote-detail', { SuggestedSupplierQuoteId: result.suggestedSupplierQuoteId }]);
            }
          } else {
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(mgs);
          }
        });
      }
    }
  }

  resetForm() {
    this.vendorControl.setValue(null);
    let employee = this.listEmployee.find(c => c.employeeId == this.auth.EmployeeId);
    this.picControl.setValue(employee);
    this.procurementRequestControl.setValue(null);
    this.recommendedDateControl.setValue(new Date());
    this.quoteTemDateControl.setValue(new Date());
    this.descriptionControl.setValue('');

    this.SupplierQuoteForm.updateValueAndValidity();

    this.listSuggestedSupplierQuotesDetail = [];
  }

  checkDifferentProductVendor(): boolean {
    let check: boolean = false;
    for (let i = 0; i < this.listSuggestedSupplierQuotesDetail.length; i++) {
      if (i == this.listSuggestedSupplierQuotesDetail.length) break;
      if (this.listSuggestedSupplierQuotesDetail[i].vendorId != this.listSuggestedSupplierQuotesDetail[i + 1].vendorId) {
        check = true;
        break;
      }
    }
    return check;
  }

  del_product(rowData: suggestedSupplierQuotesDetailModel) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      key: "popup",
      accept: () => {
        let index = this.listSuggestedSupplierQuotesDetail.indexOf(rowData);
        this.listSuggestedSupplierQuotesDetail.splice(index, 1);
      }
    });
  }

  checkStatusQuantity(): boolean {
    let dataStatus = true;
    this.listSuggestedSupplierQuotesDetail.forEach(rowData => {
      //reset status
      rowData.status = true;
      rowData.listNoteErr = [];
      //check empty string
      if (rowData.quantity.toString() === '') {
        rowData.status = false;
        rowData.listNoteErr = [...rowData.listNoteErr, this.listNoteErr.find(e => e.code == 'quantity_error').name];
      }
      //check dataStatus
      if (rowData.status === false) dataStatus = false;
    });
    return dataStatus;
  }

  changeProcurementRequest(event: any) {
    if (event.value == null) {
      this.picControl.setValue(null);
      this.vendorControl.setValue(null);
      this.listSuggestedSupplierQuotesDetail = [];
      return;
    }
    let personInCharge = this.listEmployee.find(c => c.employeeId == event.value.requestEmployeeId);
    this.picControl.setValue(personInCharge);

    let listProcurementRequestItem = this.listProcurementRequestItem.filter(c => c.procurementRequestId == event.value.procurementRequestId);
    this.listSuggestedSupplierQuotesDetail = this.mappingProcurementRequestItemToSupplierItem(listProcurementRequestItem);
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

  goBackToList(){
    this.router.navigate(['vendor/list-vendor-quote']);
  }

}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};