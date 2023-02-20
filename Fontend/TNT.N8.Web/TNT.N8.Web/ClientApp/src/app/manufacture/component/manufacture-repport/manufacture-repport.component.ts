import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ManufactureService } from '../../services/manufacture.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import * as $ from 'jquery';
import { CategoryService } from '../../../shared/services/category.service';
import { ProductService } from '../../../product/services/product.service';
import { DescriptionErrorDialogComponent } from '../../component/description-error-dialog/description-error-dialog.component';
import { ViewRememberItemDialogComponent } from '../../component/view-remember-item-dialog/view-remember-item-dialog.component';
import { DialogService } from 'primeng';
import { TreeNode } from 'primeng/api';
import { WarehouseService } from '../../../warehouse/services/warehouse.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerCareService } from '../../../customer/services/customer-care.service';

import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import * as moment from 'moment';
import 'moment/locale/pt-br';

@Component({
  selector: 'app-manufacture-repport',
  templateUrl: './manufacture-repport.component.html',
  styleUrls: ['./manufacture-repport.component.css']
})


export class ManufactureReportComponent implements OnInit {
  actionExport: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private getPermission: GetPermission,
    private manufactureService: ManufactureService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private warehouseService: WarehouseService,
    private customerCareService: CustomerCareService,
  ) {
  }

  loading: boolean = false;
  startDate: Date = new Date();
  endDate: Date = new Date();

  productList: any = [];
  selectedProduct: any = [];

  selectedColumns: any;
  listManufactureReport: any = [];
  dateFieldFormat: string = 'DD/MM/YYYY';
  footerData: any;

  async ngOnInit() {
    this.initTable();
    let resource = "man/manufacture/manufacture-report/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionExport = false;
      }
    }
    this.getMasterData();
  }

  initTable() {
    this.selectedColumns = [
      { field: 'reportDate', header: 'Ngày', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 2 },
      { field: 'core', header: '(1 CORE)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'fromLtv', header: '(2FROM LTV)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'fromCf', header: '(3FROM CF)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'fini', header: '(4FINI)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'insHardness', header: '5 Ins(Hardness)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'insLaser', header: '6 Ins(Laser)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'insVisual', header: '7 Ins(Visual)', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'packing', header: '8 Packing', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'shiping', header: '9 Shipping', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'pending', header: 'Pending', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
      { field: 'stock', header: 'Tồn kho', textAlign: 'center', display: 'table-cell', width: '8%', rowspan: 1 },
    ];
  }

  async getMasterData() {
    this.loading = true;
    let [detailResponse]: any = await Promise.all([
      this.manufactureService.productionReportAsync(this.startDate, this.endDate),
    ]);
    this.productList = detailResponse.reportModels == null ? [] : detailResponse.reportModels;

    if (this.productList.length > 0) {
      this.selectedProduct = [];
      this.selectedProduct.push(this.productList[0]);

      this.onSelectionChange();
    }

    this.loading = false;
  }

  onSelectionChange() {
    this.listManufactureReport = [];
    this.selectedProduct.forEach(item => {
      this.listManufactureReport = this.listManufactureReport.concat(item.reportDetailModels);
    });

    this.footerData = new Object();
    this.footerData['reportDate'] = "Tổng";
    this.listManufactureReport.forEach(item => {
      this.footerData['core'] = (this.footerData['core'] != null && this.footerData['core'] != undefined) ? (this.footerData['core'] + item.core) : item.core;
      this.footerData['fini'] = (this.footerData['fini'] != null && this.footerData['fini'] != undefined) ? (this.footerData['fini'] + item.fini) : item.fini;
      this.footerData['fromCf'] = (this.footerData['fromCf'] != null && this.footerData['fromCf'] != undefined) ? (this.footerData['fromCf'] + item.fromCf) : item.fromCf;
      this.footerData['fromLtv'] = (this.footerData['fromLtv'] != null && this.footerData['fromLtv'] != undefined) ? (this.footerData['fromLtv'] + item.fromLtv) : item.fromLtv;
      this.footerData['insHardness'] = (this.footerData['insHardness'] != null && this.footerData['insHardness'] != undefined) ? (this.footerData['insHardness'] + item.insHardness) : item.insHardness;
      this.footerData['insLaser'] = (this.footerData['insLaser'] != null && this.footerData['insLaser'] != undefined) ? (this.footerData['insLaser'] + item.insLaser) : item.insLaser;
      this.footerData['insVisual'] = (this.footerData['insVisual'] != null && this.footerData['insVisual'] != undefined) ? (this.footerData['insVisual'] + item.insVisual) : item.insVisual;
      this.footerData['packing'] = (this.footerData['packing'] != null && this.footerData['packing'] != undefined) ? (this.footerData['packing'] + item.packing) : item.packing;
      this.footerData['pending'] = (this.footerData['pending'] != null && this.footerData['pending'] != undefined) ? (this.footerData['pending'] + item.pending) : item.pending;
      this.footerData['pfa'] = (this.footerData['pfa'] != null && this.footerData['pfa'] != undefined) ? (this.footerData['pfa'] + item.pfa) : item.pfa;
      this.footerData['shiping'] = (this.footerData['shiping'] != null && this.footerData['shiping'] != undefined) ? (this.footerData['shiping'] + item.shiping) : item.shiping;
      this.footerData['stock'] = null; // (this.footerData['stock'] != null && this.footerData['stock'] != undefined) ? (this.footerData['stock'] + item.stock) : item.stock;
    });

    this.listManufactureReport.push(this.footerData);
  }

  selectDate() {
    this.getMasterData();
  }

  exportExcel() {
    let title = "Báo cáo sản xuất ngày " + formatDate(this.startDate, '-') + " đến " + formatDate(this.endDate, '-');
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);
    let base64Img = 'data:image/png;base64,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';
    var imgLogo = workBook.addImage({
      base64: base64Img,
      extension: 'png',
    });
    worksheet.addImage(imgLogo, {
      tl: { col: 0, row: 0 },
      ext: { width: 65, height: 45 }
    });

    let line = ['', '', '', '', '', '', '', '', '', 'KIS V4-P0004-01'];
    let lineRow = worksheet.addRow(line);
    worksheet.mergeCells(`J${lineRow.number}:M${lineRow.number}`);
    lineRow.font = { name: 'Calibri Light', size: 16, bold: true };
    lineRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    lineRow.height = 20;

    worksheet.addRow([]);
    worksheet.addRow([]);

    line = ['DAILY PRODUCTION REPORT'];
    lineRow = worksheet.addRow(line);
    lineRow.font = { name: 'Calibri Light', size: 16, bold: true };
    lineRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

    worksheet.addRow([]);

    this.productList.forEach((item, index) => {
      let txtProduct = [item.productCode];
      let headerRowProduct = worksheet.addRow(txtProduct);
      worksheet.mergeCells(`A${headerRowProduct.number}:M${headerRowProduct.number}`);
      headerRowProduct.font = { name: 'Calibri Light', size: 20, bold: true };
      headerRowProduct.getCell(1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRowProduct.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRowProduct.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
      headerRowProduct.height = 20;

      let dataHeaderRow = ['部番（Model Name）', '日付(Date)', '(1CORE)', '(2FROM LTV)', '(3FROM CF)', '(4FINI)', '5 Ins (Hardness) ', '6 Ins(Laser)', '7 Isn(Visual)', '8 Packing', '9 Shiping', 'Pending', 'STOCK'];
      let headerRow = worksheet.addRow(dataHeaderRow);
      headerRow.font = { name: 'Calibri Light', size: 18 };
      dataHeaderRow.forEach((item, index) => {
        headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRow.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }
        };
      });
      headerRow.height = 40;

      if (item.reportDetailModels != null && item.reportDetailModels != undefined && item.reportDetailModels.length > 0) {
        let dataRow = ['', '', '', '', '', '', ' ', '', '', '', '', '', item.reportDetailModels[0].stock];
        let row = worksheet.addRow(dataRow);
        row.font = { name: 'Calibri', size: 16 };
        dataRow.forEach((item, index) => {
          row.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          row.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          row.getCell(index + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          };
        });

        let footerData = new Object();
        footerData['reportDate'] = "Tổng";
        item.reportDetailModels.forEach((dt, ind) => {
          footerData['core'] = (footerData['core'] != null && footerData['core'] != undefined) ? (footerData['core'] + dt.core) : dt.core;
          footerData['fini'] = (footerData['fini'] != null && footerData['fini'] != undefined) ? (footerData['fini'] + dt.fini) : dt.fini;
          footerData['fromCf'] = (footerData['fromCf'] != null && footerData['fromCf'] != undefined) ? (footerData['fromCf'] + dt.fromCf) : dt.fromCf;
          footerData['fromLtv'] = (footerData['fromLtv'] != null && footerData['fromLtv'] != undefined) ? (footerData['fromLtv'] + dt.fromLtv) : dt.fromLtv;
          footerData['insHardness'] = (footerData['insHardness'] != null && footerData['insHardness'] != undefined) ? (footerData['insHardness'] + dt.insHardness) : dt.insHardness;
          footerData['insLaser'] = (footerData['insLaser'] != null && footerData['insLaser'] != undefined) ? (footerData['insLaser'] + dt.insLaser) : dt.insLaser;
          footerData['insVisual'] = (footerData['insVisual'] != null && footerData['insVisual'] != undefined) ? (footerData['insVisual'] + dt.insVisual) : dt.insVisual;
          footerData['packing'] = (footerData['packing'] != null && footerData['packing'] != undefined) ? (footerData['packing'] + dt.packing) : dt.packing;
          footerData['pending'] = (footerData['pending'] != null && footerData['pending'] != undefined) ? (footerData['pending'] + dt.pending) : dt.pending;
          footerData['pfa'] = (footerData['pfa'] != null && footerData['pfa'] != undefined) ? (footerData['pfa'] + dt.pfa) : dt.pfa;
          footerData['shiping'] = (footerData['shiping'] != null && footerData['shiping'] != undefined) ? (footerData['shiping'] + dt.shiping) : dt.shiping;
          footerData['stock'] = null;

          let dataRowItem = [item.productCode, formatDate(dt.reportDate, '/'), dt.core, dt.fromLtv, dt.fromCf, dt.fini, dt.insHardness, dt.insLaser, dt.insVisual, dt.packing, dt.shiping, dt.pending, dt.stock];
          let rowItem = worksheet.addRow(dataRowItem);
          rowItem.font = { name: 'Calibri', size: 16 };
          dataRowItem.forEach((itDt, idx) => {
            rowItem.getCell(idx + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            rowItem.getCell(idx + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            rowItem.getCell(idx + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF' }
            };
          });
        });


        let dataRowFooter = [footerData['reportDate'], '', footerData['core'], footerData['fromLtv'], footerData['fromCf'], footerData['fini'], footerData['insHardness'], footerData['insLaser'], footerData['insVisual'], footerData['packing'], footerData['shiping'], footerData['pending'], footerData['stock']];
        let rowItemFooter = worksheet.addRow(dataRowFooter);
        worksheet.mergeCells(`A${rowItemFooter.number}:B${rowItemFooter.number}`);
        rowItemFooter.font = { name: 'Calibri', size: 16, bold: true };
        dataRowFooter.forEach((itDt, idx) => {
          rowItemFooter.getCell(idx + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          rowItemFooter.getCell(idx + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          rowItemFooter.getCell(idx + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          };
        });
      }
      worksheet.addRow([]);
    });

    /* fix with for column */
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 20;

    this.exportToExel(workBook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

}

function formatDate(date, txt) {
  var dateItem = new Date(date);
  const yyyy = dateItem.getFullYear();
  let mm = dateItem.getMonth() + 1; // Months start at 0!
  let dd = dateItem.getDate();

  let ddtxt = '' + dd;
  let mmtxt = '' + mm;

  if (dd < 10) ddtxt = '0' + dd;
  if (mm < 10) mmtxt = '0' + mm;

  const formattedToday = ddtxt + txt + mmtxt + txt + yyyy;
  return formattedToday;
}
