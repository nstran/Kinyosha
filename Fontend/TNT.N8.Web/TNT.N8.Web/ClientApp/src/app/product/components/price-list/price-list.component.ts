import * as $ from 'jquery';
import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import 'moment/locale/pt-br';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { PriceProductModel } from '../../models/product.model';

import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";


interface PriceProduct {
  priceProductId: string,
  productId: string,
  productCode: string,
  productName: string,
  effectiveDate: Date,
  priceVnd: string,
  minQuantity: number,
  priceForeignMoney: string,
  customerGroupCategory: string,
  customerGroupCategoryName: string,
  createdById: string,
  createdDate: Date,
  ngayHetHan: Date,
  tiLeChietKhau: number
}

interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string,
}

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.css'],
  providers: [
    DatePipe,
  ]
})
export class PriceListComponent implements OnInit {
  fixed: boolean = false;
  withFiexd: string = "";

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  auth: any = JSON.parse(localStorage.getItem('auth'));
  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();
  loading: boolean = false;
  awaitResult: boolean = false;// kh??a n??t l??u
  cols: any[];
  selectedColumns: any[];
  listPrice: Array<PriceProduct> = [];
  listPriceForUpdate: Array<PriceProduct> = [];
  listStatus: Array<Category> = [];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  priveListId: string;
  isUpdate: boolean = false;
  isDisplayName: boolean = false;
  priceProductId: string;

  listProduct: Array<any> = [];
  listGroupCustomer: Array<Category> = [];

  /*START : FORM PriceList*/
  priceProductForm: FormGroup;
  productControl: FormControl;
  effectiveDateControl: FormControl;
  priceVNDControl: FormControl;
  MinimumQuantityControl: FormControl;
  priceForeignMoneyControl: FormControl;
  customerGroupCategoryControl: FormControl;
  ngayHetHanControl: FormControl;
  tiLeChietKhauControl: FormControl;
  /*END : FORM PriceList*/

  isUpdateAI: boolean = false;

  productName: string;
  productId: string;
  effectiveDate: string;
  priceVND: string;
  priceForeignMoney: string;
  customerGroupCategory: string;

  minYear: number = 2000;
  currentYear: number = (new Date()).getFullYear();
  maxEndDate: Date = new Date();

  /*Import*/
  displayDialog: boolean = false;
  importFileExcel: any = null;
  messErrFile: any = [];
  cellErrFile: any = [];
  fileName: string = '';
  listPriceProductImport: Array<PriceProductModel> = [];

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('save') save: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private productService: ProductService,
    private el: ElementRef,
    private renderer: Renderer2,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService,
    private router: Router,
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
          !this.save.nativeElement.contains(e.target)) {
          this.isOpenNotifiError = false;
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm();
    let resource = "sal/product/price-list/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    } else {

      this.setTable();
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
      this.getMasterData();
    }
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

  setTable() {
    this.cols = [
      { field: 'productCode', header: 'M?? h??ng h??a', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'productName', header: 'T??n h??ng h??a', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'priceVnd', header: 'Gi?? b??n', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'minQuantity', header: 'S??? l?????ng t???i thi???u', width: '150px', textAlign: 'right', color: '#f44336' },
      { field: 'priceForeignMoney', header: 'Gi?? b??n ngo???i t???', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'effectiveDate', header: 'Ng??y hi???u l???c', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'customerGroupCategoryName', header: 'Nh??m kh??ch h??ng', width: '50px', textAlign: 'left', color: '#f44336' },
    ];

    this.selectedColumns = this.cols.filter(e => e.field == "productCode" || e.field == "productName" || e.field == "priceVnd"
      || e.field == "minQuantity" || e.field == "effectiveDate");
  }

  createPrice() {
    if (!this.priceProductForm.valid) {
      Object.keys(this.priceProductForm.controls).forEach(key => {
        if (this.priceProductForm.controls[key].valid == false) {
          this.priceProductForm.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
      this.emitStatusChangeForm = this.priceProductForm.statusChanges.subscribe((validity: string) => {
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
      let newPriceProduct: PriceProductModel = this.mappingPiceProductFormCreate();
      this.productId = this.priceProductForm.controls['productControl'].value.productId;
      // L???y gi?? tr??? ????? truy???n xu???ng db
      let check = this.listPrice.find(x => x.productId == newPriceProduct.ProductId &&
        this.calcDaysDiff(new Date(x.effectiveDate), newPriceProduct.EffectiveDate) === 0 &&
        x.customerGroupCategory == newPriceProduct.CustomerGroupCategory && x.minQuantity == newPriceProduct.MinQuantity);
      if (check) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: '???? t???n t???i b???n ghi trong h??? th???ng!' };
        this.showMessage(msg);
      } else {
        this.savePrice(newPriceProduct);
      }
    }
  }

  mappingPiceProductFormCreate(): PriceProductModel {
    let newPriceProduct = new PriceProductModel();

    newPriceProduct.ProductId = this.priceProductForm.controls['productControl'].value.productId;
    let efectiveDate = this.priceProductForm.controls['effectiveDateControl'].value;
    newPriceProduct.EffectiveDate = convertToUTCTime(efectiveDate);
    newPriceProduct.PriceVnd = this.priceProductForm.controls['priceVNDControl'].value;
    newPriceProduct.MinQuantity = this.MinimumQuantityControl.value;
    newPriceProduct.PriceForeignMoney = this.priceProductForm.controls['priceForeignMoneyControl'].value;
    let customerGroup = this.priceProductForm.controls['customerGroupCategoryControl'].value;
    newPriceProduct.CustomerGroupCategory = customerGroup === null ? null : customerGroup.categoryId;
    newPriceProduct.TiLeChietKhau = this.priceProductForm.controls['tiLeChietKhauControl'].value;

    let ngayHetHan = this.priceProductForm.controls['ngayHetHanControl'].value;
    if (ngayHetHan) {
      newPriceProduct.NgayHetHan = convertToUTCTime(ngayHetHan);
    }
    return newPriceProduct;
  }

  mappingPiceProductFormUpdate(): PriceProductModel {
    let newPriceProduct = new PriceProductModel();
    newPriceProduct.PriceProductId = this.priceProductId;
    newPriceProduct.ProductId = this.priceProductForm.controls['productControl'].value.productId;
    let efectiveDate = this.priceProductForm.controls['effectiveDateControl'].value;
    newPriceProduct.EffectiveDate = convertToUTCTime(efectiveDate);
    newPriceProduct.PriceVnd = this.priceProductForm.controls['priceVNDControl'].value;
    newPriceProduct.MinQuantity = this.MinimumQuantityControl.value;
    newPriceProduct.PriceForeignMoney = this.priceProductForm.controls['priceForeignMoneyControl'].value;
    let customerGroup = this.priceProductForm.controls['customerGroupCategoryControl'].value;
    newPriceProduct.CustomerGroupCategory = customerGroup === null ? null : customerGroup.categoryId;
    newPriceProduct.TiLeChietKhau = this.priceProductForm.controls['tiLeChietKhauControl'].value;

    let ngayHetHan = this.priceProductForm.controls['ngayHetHanControl'].value;
    if (ngayHetHan) {
      newPriceProduct.NgayHetHan = convertToUTCTime(ngayHetHan);
    }
    return newPriceProduct;
  }

  savePrice(priceProduct: PriceProductModel) {
    this.awaitResult = true;
    this.loading = true;
    this.productService.createOrUpdatePriceProduct(priceProduct).subscribe(response => {
      var result = <any>response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listPrice = [];
        // this.listPrice = result.listPrice;
        result.listPrice.forEach(item => {
          let priceProduct: PriceProduct = {
            priceProductId: item.priceProductId,
            productCode: item.productCode,
            productName: item.productName,
            productId: item.productId,
            effectiveDate: item.effectiveDate,
            priceVnd: item.priceVnd,
            minQuantity: item.minQuantity,
            priceForeignMoney: item.priceForeignMoney,
            customerGroupCategory: item.customerGroupCategory,
            customerGroupCategoryName: item.customerGroupCategoryName,
            createdById: item.createdById,
            createdDate: item.createdDate,
            ngayHetHan: item.ngayHetHan,
            tiLeChietKhau: item.tiLeChietKhau
          }
          this.listPrice.push(priceProduct);
        });
        let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Th??m chi ph?? th??nh c??ng' };
        this.showMessage(mgs);
        this.awaitResult = false;
        this.resetForm();
        if (this.emitStatusChangeForm) {
          this.emitStatusChangeForm.unsubscribe();
          this.isInvalidForm = false; //???n icon-warning-active
        }
      } else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
        this.awaitResult = false;
      }

    }, error => { });
  }
  changMin() {
    if (this.MinimumQuantityControl.value) {
      let number = ParseStringToFloat(this.MinimumQuantityControl.value);
      if (number == 0) {
        this.MinimumQuantityControl.setValue('1');
      }
    } else {
      this.MinimumQuantityControl.setValue('1');
    }

  }
  updatePrice() {
    if (!this.priceProductForm.valid) {
      Object.keys(this.priceProductForm.controls).forEach(key => {
        if (this.priceProductForm.controls[key].valid == false) {
          this.priceProductForm.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
      this.emitStatusChangeForm = this.priceProductForm.statusChanges.subscribe((validity: string) => {
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
      // L???y gi?? tr??? ????? truy???n xu???ng db
      let newPriceProduct: PriceProductModel = this.mappingPiceProductFormUpdate();
      let newProductId = this.priceProductForm.controls['productControl'].value.productId;
      // L???y gi?? tr??? ????? truy???n xu???ng db
      let check: PriceProduct;

      check = this.listPriceForUpdate.find(x => x.productId == newProductId && this.calcDaysDiff(new Date(x.effectiveDate), newPriceProduct.EffectiveDate) === 0 && x.customerGroupCategory == newPriceProduct.CustomerGroupCategory);
      if (check) {
        //N???u t???n t???i r???i th?? kh??ng cho th??m v?? hi???n th??? c???nh b??o
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: '???? t???n t???i b???n ghi trong h??? th???ng!' };
        this.showMessage(msg);
      } else {
        this.awaitResult = true;
        this.loading = true;
        this.productService.createOrUpdatePriceProduct(newPriceProduct).subscribe(response => {
          var result = <any>response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.listPrice = [];
            // this.listPrice = result.listPrice;
            result.listPrice.forEach(item => {
              let priceProduct: PriceProduct = {
                priceProductId: item.priceProductId,
                productCode: item.productCode,
                productName: item.productName,
                productId: item.productId,
                effectiveDate: item.effectiveDate,
                priceVnd: item.priceVnd,
                minQuantity: item.minQuantity,
                priceForeignMoney: item.priceForeignMoney,
                customerGroupCategory: item.customerGroupCategory,
                customerGroupCategoryName: item.customerGroupCategoryName,
                createdById: item.createdById,
                createdDate: item.createdDate,
                ngayHetHan: item.ngayHetHan,
                tiLeChietKhau: item.tiLeChietKhau
              }
              this.listPrice.push(priceProduct);
            });
            let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t chi ph?? th??nh c??ng' };
            this.showMessage(mgs);
            this.awaitResult = false;
            if (this.emitStatusChangeForm) {
              this.emitStatusChangeForm.unsubscribe();
              this.isInvalidForm = false; //???n icon-warning-active
            }
          } else {
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(mgs);
            this.awaitResult = false;
          }
        }, error => { });
      }
    }
  }

  delPriceProduct(rowData) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.productService.deletePriceProduct(rowData.priceProductId).subscribe(response => {
          var result = <any>response;
          if (result.statusCode == 200) {
            this.listPrice = this.listPrice.filter(c => c != rowData);
            let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(mgs);
          } else {
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(mgs);
          }
        });
      }
    });
  }

  cancel() {
    this.isUpdate = false;
    this.resetForm();
  }

  /*Hi???n th??? l???i th??ng tin b??? sung*/
  reShowNote(event: any) {
    this.listPriceForUpdate = [];
    let rowData: PriceProduct = event.data;
    this.isUpdate = true;
    this.priceProductId = rowData.priceProductId;
    this.productId = rowData.productId;
    let product = this.listProduct.find(c => c.productId == rowData.productId);
    let customerGroup = this.listGroupCustomer.find(c => c.categoryId == rowData.customerGroupCategory);
    customerGroup = customerGroup === undefined ? null : customerGroup;
    this.productName = product.productName;
    this.isDisplayName = true;
    this.priceProductForm.controls['productControl'].setValue(product);
    this.priceProductForm.controls['effectiveDateControl'].setValue(new Date(rowData.effectiveDate));
    this.priceProductForm.controls['priceVNDControl'].setValue(rowData.priceVnd);
    this.priceProductForm.controls['MinimumQuantityControl'].setValue(rowData.minQuantity);
    this.priceProductForm.controls['priceForeignMoneyControl'].setValue(rowData.priceForeignMoney);
    this.priceProductForm.controls['customerGroupCategoryControl'].setValue(customerGroup);
    this.priceProductForm.controls['priceForeignMoneyControl'].setValue(rowData.priceForeignMoney);
    if (rowData.ngayHetHan) {
      this.priceProductForm.controls['ngayHetHanControl'].setValue(new Date(rowData.ngayHetHan));
    }
    this.priceProductForm.controls['tiLeChietKhauControl'].setValue(rowData.tiLeChietKhau);

    this.priceProductForm.controls['productControl'].updateValueAndValidity();
    this.priceProductForm.controls['effectiveDateControl'].updateValueAndValidity();
    this.priceProductForm.controls['priceVNDControl'].updateValueAndValidity();
    this.priceProductForm.controls['priceForeignMoneyControl'].updateValueAndValidity();
    this.priceProductForm.controls['customerGroupCategoryControl'].updateValueAndValidity();
    this.priceProductForm.controls['ngayHetHanControl'].updateValueAndValidity();
    this.priceProductForm.controls['tiLeChietKhauControl'].updateValueAndValidity();

    this.listPriceForUpdate = this.listPrice.filter(c => c != rowData);
  }

  getMasterData() {
    this.loading = true;
    this.productService.getMasterDataPriceList().subscribe(response => {
      var result = <any>response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listPrice = result.listPrice;
        this.listProduct = result.listProduct;
        this.listProduct.forEach(item => {
          item.productCodeName = item.productCode + ' - ' + item.productName;
        });

        this.listGroupCustomer = result.listCategory;
      }
    });
  }

  resetForm() {
    this.priceProductForm.controls['productControl'].reset();
    this.priceProductForm.controls['effectiveDateControl'].reset();
    this.priceProductForm.controls['priceVNDControl'].setValue('0');
    this.priceProductForm.controls['tiLeChietKhauControl'].setValue('0');
    this.priceProductForm.controls['MinimumQuantityControl'].setValue('1');
    this.priceProductForm.controls['priceForeignMoneyControl'].reset();
    this.priceProductForm.controls['customerGroupCategoryControl'].setValue(null);
    this.priceProductForm.controls['ngayHetHanControl'].setValue(null);
    this.priceProductForm.controls['effectiveDateControl'].setValue(new Date());
    this.isDisplayName = false;
    this.productId = '';
    this.productName = '';
    this.isInvalidForm = false;
    this.isOpenNotifiError = false;
    this.listPriceForUpdate = [];
  }

  changeProduct(event: any) {
    if (event.value === null) {
      this.productId = '';
      return;
    }
    this.productName = event.value.productName;
    this.isDisplayName = true;
  }

  setForm() {
    this.productControl = new FormControl(null, [Validators.required]);
    this.effectiveDateControl = new FormControl(new Date(), [Validators.required]);
    this.priceVNDControl = new FormControl('0', [Validators.required]);
    this.tiLeChietKhauControl = new FormControl('0', [Validators.required]);
    this.MinimumQuantityControl = new FormControl('1', [Validators.required]);
    this.priceForeignMoneyControl = new FormControl('');
    this.customerGroupCategoryControl = new FormControl(null, [Validators.required]);
    this.ngayHetHanControl = new FormControl(null);
    this.priceProductForm = new FormGroup({
      productControl: this.productControl,
      effectiveDateControl: this.effectiveDateControl,
      priceVNDControl: this.priceVNDControl,
      MinimumQuantityControl: this.MinimumQuantityControl,
      priceForeignMoneyControl: this.priceForeignMoneyControl,
      customerGroupCategoryControl: this.customerGroupCategoryControl,
      tiLeChietKhauControl: this.tiLeChietKhauControl,
      ngayHetHanControl: this.ngayHetHanControl
    });
  }

  calcDaysDiff(dateFrom, dateTo): number {
    let currentDate = new Date(dateTo);
    let dateSent = new Date(dateFrom);

    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  showDialogImport() {
    this.displayDialog = true;
  }

  downloadTemplateExcel() {
    let dateUTC = new Date();
    let title = "Template_Import_Bng_Gia";
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');
    worksheet.pageSetup.margins = {
      left: 0.25, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.pageSetup.paperSize = 9;  //A4 : 9


    let dataRow1 = [];
    dataRow1[1] = `Template import B???ng gi?? b??n`
    let row1 = worksheet.addRow(dataRow1);
    row1.font = { name: 'Arial', size: 15, bold: true };
    worksheet.mergeCells(`A${row1.number}:F${row1.number}`);
    row1.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };
    worksheet.addRow([]);

    // let dataRow2 = [];
    // dataRow2[1] = `    `
    // let row2 = worksheet.addRow(dataRow2);
    // row2.font = { name: 'Arial', size: 18, bold: true };
    // row2.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };

    let dataRow3 = [];
    dataRow3[2] = `- C??c c???t m??u ????? l?? c??c c???t b???t bu???c nh???p.
    - C??c c???t c?? k?? hi???u (*) l?? c??c c???t b???t bu???c nh???p theo ??i???u ki???n.
    - M?? s???n ph???m, ng??y hi???u l???c v?? M?? nh??m kh??ch h??ng kh??ng ???????c tr??ng nhau ho??n to??n gi???a 2 b???n ghi.`
    let row3 = worksheet.addRow(dataRow3);
    row3.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    worksheet.mergeCells(`B${row3.number}:F${row3.number}`);
    row3.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow4 = [];
    dataRow4[2] = `- T???t c??? d??? li???u nh???p c???n tr??ng v???i d??? li???u trong h??? th???ng.
    - C??c tr?????ng d??? li???u l?? ki???u s??? kh??ng nh???p d??? li???u c???n ????? m???c ?????nh l?? 0.`
    let row4 = worksheet.addRow(dataRow4);
    row4.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    worksheet.mergeCells(`B${row4.number}:F${row4.number}`);
    row4.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataHeaderRow = ['M?? s???n ph???m*', 'Ng??y hi???u l???c*', 'Gi?? b??n VND*', 'S??? l?????ng t???i thi???u*', 'Gi?? b??n ngo???i t???', 'Nh??m kh??ch h??ng'];
    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: '0D0904' } };
    dataHeaderRow.forEach((item, index) => {
      if (index !== 4 && index !== 5) {
        headerRow.getCell(index + 1).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'ff0000' } };
      }
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C6E2FF' }
      };
    });
    headerRow.height = 25;

    let dataHeaderRow2 = ['BKAV-ANTIVIRUS', '11-04-2021', '300000', '1', '0', 'UTA'];
    let headerRow2 = worksheet.addRow(dataHeaderRow2);
    headerRow2.font = { name: 'Arial', size: 10, bold: false };
    dataHeaderRow2.forEach((item, index) => {
      headerRow2.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow2.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
      if (index == 0 || index == 5) {
        headerRow2.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      } else {
        headerRow2.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      }

    });
    headerRow2.height = 18;

    worksheet.addRow([]);
    worksheet.getRow(3).height = 50;
    worksheet.getRow(4).height = 50;
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;

    this.exportToExel(workbook, title);
    // this.productService.downloadPriceProductTemplate().subscribe(response => {
    //   this.loading = false;
    //   const result = <any>response;
    //   if (result.templateExcel != null && result.statusCode === 200) {
    //     const binaryString = window.atob(result.templateExcel);
    //     const binaryLen = binaryString.length;
    //     const bytes = new Uint8Array(binaryLen);
    //     for (let idx = 0; idx < binaryLen; idx++) {
    //       const ascii = binaryString.charCodeAt(idx);
    //       bytes[idx] = ascii;
    //     }
    //     const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //     const link = document.createElement('a');
    //     link.href = window.URL.createObjectURL(blob);
    //     const fileName = result.fileName + ".xls";
    //     //const fileName = result.nameFile  + ".xlsx";
    //     link.download = fileName;
    //     link.click();
    //   }
    // }, error => { this.loading = false; });
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  chooseFile(event: any) {
    this.fileName = event.target.files[0].name;
    this.importFileExcel = event.target;
  }

  cancelFile() {
    $("#importFilePriceProduct").val("")
    this.fileName = "";
  }

  validateFile(data) {
    this.messErrFile = [];
    this.cellErrFile = [];

    data.forEach((row, i) => {
      if (i > 3) {
        if ((row[0] === null || row[0] === undefined || row[0].toString().trim() == "")) {
          this.messErrFile.push('D??ng { ' + (i + 2) + ' } ch??a nh???p M?? sp ho???c T??n s???n ph???m!');
        }
        if (row[1] === null || row[1] === undefined || row[1] == "") {
          this.messErrFile.push('Ng??y hi???u l???c t???i d??ng ' + (i + 2) + ' kh??ng ???????c ????? tr???ng');
        }
        // if (typeof (row[1]) !== 'number') {
        //   this.messErrFile.push('Ng??y hi???u l???c t???i d??ng ' + (i + 2) + ' sai ?????nh d???ng');
        // }
        if (new Date(row[1].replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")).toString() == "Invalid Date") {
          this.messErrFile.push('Ng??y hi???u l???c t??? t???i d??ng { ' + (i + 2) + ' } kh??ng ????ng format');
        }
        if (row[2] === null || row[2] === undefined || row[2] == "") {
          this.messErrFile.push('Gi?? b??n t???i d??ng ' + (i + 2) + ' kh??ng ???????c ????? tr???ng');
        }
        if (parseFloat(row[2]) == undefined || parseFloat(row[2]).toString() == "NaN" || parseFloat(row[2]) == null) {
          this.messErrFile.push('G??i b??n t???i d??ng ' + (i + 2) + ' sai ?????nh d???ng');
        }
        if (row[3] === null || row[3] === undefined || row[3] == "") {
          this.messErrFile.push('S??? l?????ng t???i thi???u t???i d??ng ' + (i + 2) + ' kh??ng ???????c ????? tr???ng');
        }
        if (parseFloat(row[3]) == undefined || parseFloat(row[3]).toString() == "NaN" || parseFloat(row[3]) == null) {
          this.messErrFile.push('S??? l?????ng t???i thi???u t???i d??ng ' + (i + 2) + ' sai ?????nh d???ng');
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
    } else {

      const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(targetFiles.files[0]);

      reader.onload = (e: any) => {

        /* read workbook */
        const bstr: string = e.target.result;

        const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        // ki???m tra form value v?? file excel c?? kh???p m?? v???i nhau hay kh??ng
        let code = 'Sheet1';
        if (workbook.Sheets[code] === undefined) {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
          this.showMessage(mgs);
          return;
        }

        //l???y data t??? file excel c???a product
        const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
        /* save data */
        let dataPriceProduct: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
        dataPriceProduct.shift();
        let productCodeList: string[] = [];
        let cusGroupCodeList: string[] = [];
        let isValidation = this.validateFile(dataPriceProduct);
        if (isValidation) {
          this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = true;  //Hi???n th??? message l???i
        } else {
          var messProCodeErr = [];
          var messCusGroupErr = [];
          var messErrExist = [];
          var messErrExistExcel = [];

          this.isInvalidForm = false;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = false;  //Hi???n th??? message l???i
          dataPriceProduct.forEach((row, i) => {
            if (i > 3 && row.length != 0) {
              if (row[0] !== null || row[0] !== undefined && row[0].trim() != "") {
                let isProducCode = productCodeList.find(c => c.trim() == row[0].trim());
                if (isProducCode == null || isProducCode == undefined) {
                  productCodeList.push(row[0]);
                  let check = this.listProduct.find(c => c.productCode.toLowerCase().trim() == row[0].trim().toLowerCase());
                  if (check === undefined || check === null) {
                    messProCodeErr.push(i + 2);
                  }
                }
              }
              if (row[5]) {
                if (row[5] !== null || row[5] !== undefined && row[5].trim() != "") {
                  let isCusGroup = cusGroupCodeList.find(c => c.trim() == row[5].trim());
                  if (isCusGroup == null || isCusGroup == undefined) {
                    cusGroupCodeList.push(row[5]);
                    let check = this.listGroupCustomer.find(c => c.categoryCode.toLowerCase().trim() == row[5].trim().toLowerCase());
                    if (check === undefined || check === null) {
                      messCusGroupErr.push(i + 2);
                    }

                  }
                }
              }

            }
          });

          let countProCode = this.listProduct.filter(c => productCodeList.includes(c.productCode));
          let countCusGroup = this.listGroupCustomer.filter(c => cusGroupCodeList.includes(c.categoryCode));
          if (countProCode.length == productCodeList.length && countCusGroup.length == cusGroupCodeList.length) {
            this.listPriceProductImport = [];
            dataPriceProduct.forEach((row, i) => {
              if (i > 3 && row.length != 0) {
                let priceProduct = new PriceProductModel();
                let _product = this.listProduct.find(c => c.productCode == row[0].trim());
                if (_product) {
                  priceProduct.ProductId = _product.productId;
                }
                // let _time = ExcelDateToJSDate(row[1]);
                let date = new Date(row[1].replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
                priceProduct.EffectiveDate = convertToUTCTime(date);
                priceProduct.PriceVnd = row[2];
                priceProduct.MinQuantity = row[3];
                priceProduct.PriceForeignMoney = row[4];
                priceProduct.CustomerGroupCategory = this.listGroupCustomer.find(c => c.categoryCode == row[5]) ?.categoryId;

                // Ki???m tra ???? t???n t???i trong h??? th???ng
                let check = this.listPrice.find(x => x.productId == priceProduct.ProductId &&
                  this.calcDaysDiff(new Date(x.effectiveDate), priceProduct.EffectiveDate) === 0 &&
                  x.customerGroupCategory == priceProduct.CustomerGroupCategory);
                if (check) {
                  messErrExist.push(i + 2);
                } else {
                  this.listPriceProductImport.push(priceProduct);

                  // Ki???m tra tr??ng l???p trong file excel
                  let checkExcel = this.listPriceProductImport.filter(x => x.ProductId == priceProduct.ProductId &&
                    this.calcDaysDiff(new Date(x.EffectiveDate), priceProduct.EffectiveDate) === 0 &&
                    x.CustomerGroupCategory == priceProduct.CustomerGroupCategory);
                  if (checkExcel.length > 1) {
                    messErrExistExcel.push(i + 2);
                  }
                }
              }
            });
            if (messErrExist.length > 0) {
              this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
              this.isOpenNotifiError = true;  //Hi???n th??? message l???i
              messErrExist.forEach(item => {
                this.messErrFile.push('Gi?? b??n t???i d??ng ' + item + ' ???? t???n t???i trong h??? th???ng')
              });
            } else if (messErrExistExcel.length > 0) {
              this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
              this.isOpenNotifiError = true;  //Hi???n th??? message l???i
              messErrExistExcel.forEach(item => {
                this.messErrFile.push('Gi?? b??n t???i d??ng ' + item + ' b??? tr??ng l???p trong file excel');
              });
            } else {
              if (this.listPriceProductImport.length > 0) {
                this.productService.importPriceProduct(this.listPriceProductImport).subscribe(response => {
                  var result = <any>response;
                  if (result.statusCode == 200) {
                    let mgs = { severity: 'success', summary: 'Th??ng b??o', detail: "Nh???p excel gi?? s???n ph???m th??nh c??ng!" };
                    this.showMessage(mgs);
                    this.getMasterData();
                  } else {
                    let mgs = { severity: 'warn', summary: 'Th??ng b??o', detail: result.messageCode };
                    this.showMessage(mgs);
                  }
                });
              }
            }
          }

          if (countProCode.length != productCodeList.length) {
            this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = true;  //Hi???n th??? message l???i
            messProCodeErr.forEach(item => {
              this.messErrFile.push('S???n ph???m t???i d??ng ' + item + ' kh??ng t???n t???i trong h??? th???ng')
            });
          }
          if (countCusGroup.length != cusGroupCodeList.length) {
            this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
            this.isOpenNotifiError = true;  //Hi???n th??? message l???i
            messCusGroupErr.forEach(item => {
              this.messErrFile.push('Nh??m KH t???i d??ng ' + item + ' kh??ng t???n t???i trong h??? th???ng')
            });
          }
        }
        this.displayDialog = false;
      }
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


function ExcelDateToJSDate(serial) {
  var utc_days = Math.floor(serial - 25569);
  var utc_value = utc_days * 86400;
  var date_info = new Date(utc_value * 1000);

  var fractional_day = serial - Math.floor(serial) + 0.0000001;

  var total_seconds = Math.floor(86400 * fractional_day);

  var seconds = total_seconds % 60;

  total_seconds -= seconds;

  var hours = Math.floor(total_seconds / (60 * 60));
  var minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}
function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = str.toString().replace(/,/g, '');
  return parseFloat(str);
}