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
  selector: 'app-hr-report',
  templateUrl: './hr-report.component.html',
  styleUrls: ['./hr-report.component.css']
})


export class HrReportComponent implements OnInit {
  actionExport: boolean = true;
  displayReport: boolean = false;
  chooseRowData: any = null;
  dataReportDialog: any = [];

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
  monthDate: Date = new Date();
  selectedColumns: any;
  listHrReport: any = [];

  totalCore: any = { totalNV: 0, totalV: 0, totalSGLV: 0, totalVS: 0, totalDM: 0, totalSGLT: 0, totalTSGLV: 0 };
  totalInsVisual: any = { totalNV: 0, totalV: 0, totalSGLV: 0, totalVS: 0, totalDM: 0, totalSGLT: 0, totalTSGLV: 0 };;
  totalCf: any = { totalNV: 0, totalV: 0, totalSGLV: 0, totalVS: 0, totalDM: 0, totalSGLT: 0, totalTSGLV: 0 };;

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
      { field: 'timeSheetDate', header: 'Ngày', textAlign: 'left', display: 'table-cell', width: '20%', rowspan: 2 },
      { field: 'process', header: 'Process', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalNV', header: 'Tổng số nhân viên', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalV', header: 'Vắng', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalSGLV', header: 'Số giờ làm việc', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalVS', header: 'Về sớm', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalDM', header: 'Đến muộn', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalSGLT', header: 'Số giờ làm thêm', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
      { field: 'totalTSGLV', header: 'Tổng số giờ làm việc', textAlign: 'center', display: 'table-cell', width: '20%', rowspan: 1 },
    ];
  }

  async getMasterData() {
    this.loading = true;
    let [detailResponse]: any = await Promise.all([
      this.manufactureService.getTimeSheetDailyMonthAsync(this.monthDate)
    ]);

    if (detailResponse.statusCode == 200) {
      this.listHrReport = [];
      if (detailResponse.models != null && detailResponse.models != undefined) {
        detailResponse.models.forEach(item => {
          var tongCoreNS = (item.nv1coreCa1 ?? 0) + (item.nv1coreCa2 ?? 0) + (item.nv1coreCa3 ?? 0);
          var tongCoreV = (item.vm1coreCa1 ?? 0) + (item.vm1coreCa2 ?? 0) + (item.vm1coreCa3 ?? 0);
          var tongCoreSGLV = (tongCoreNS - tongCoreV) * 8;
          var tongCoreVS = (item.vs1coreCa1 ?? 0) + (item.vs1coreCa2 ?? 0) + (item.vs1coreCa3 ?? 0);
          var tongCoreDM = (item.dm1coreCa1 ?? 0) + (item.dm1coreCa2 ?? 0) + (item.dm1coreCa3 ?? 0);
          var tongCoreOT = (item.ot1coreCa1 ?? 0) + (item.ot1coreCa2 ?? 0) + (item.ot1coreCa3 ?? 0);
          var tongCoreTSGLV = tongCoreSGLV - tongCoreDM - tongCoreVS + tongCoreOT;

          this.totalCore.totalNV += tongCoreNS;
          this.totalCore.totalV += tongCoreV;
          this.totalCore.totalSGLV += tongCoreSGLV;
          this.totalCore.totalVS += tongCoreVS;
          this.totalCore.totalDM += tongCoreDM;
          this.totalCore.totalSGLT += tongCoreOT;
          this.totalCore.totalTSGLV += tongCoreTSGLV;

          var rowData = {
            dataModel: item,
            timeSheetDate: item.timeSheetDate,
            process: '(1CORE)',
            totalNV: tongCoreNS,
            totalV: tongCoreV,
            totalSGLV: tongCoreSGLV,
            totalVS: tongCoreVS,
            totalDM: tongCoreDM,
            totalSGLT: tongCoreOT,
            totalTSGLV: tongCoreTSGLV,
          };

          this.listHrReport.push(rowData);

          var tongNS = (item.nv7isnVisualCa1 ?? 0) + (item.nv7isnVisualCa2 ?? 0) + (item.nv7isnVisualCa3 ?? 0);
          var tongV = (item.vm7isnVisualCa1 ?? 0) + (item.vm7isnVisualCa2 ?? 0) + (item.vm7isnVisualCa3 ?? 0);
          var tongSGLV = (tongNS - tongV) * 8;
          var tongVS = (item.vs7isnVisualCa1 ?? 0) + (item.vs7isnVisualCa2 ?? 0) + (item.vs7isnVisualCa3 ?? 0);
          var tongDM = (item.dm7isnVisualCa1 ?? 0) + (item.dm7isnVisualCa2 ?? 0) + (item.dm7isnVisualCa3 ?? 0);
          var tongOT = (item.ot7isnVisualCa1 ?? 0) + (item.ot7isnVisualCa2 ?? 0) + (item.ot7isnVisualCa3 ?? 0);
          var tongTSGLV = tongSGLV - tongDM - tongVS + tongOT;

          this.totalInsVisual.totalNV += tongNS;
          this.totalInsVisual.totalV += tongV;
          this.totalInsVisual.totalSGLV += tongSGLV;
          this.totalInsVisual.totalVS += tongVS;
          this.totalInsVisual.totalDM += tongDM;
          this.totalInsVisual.totalSGLT += tongOT;
          this.totalInsVisual.totalTSGLV += tongTSGLV;

          rowData = {
            dataModel: item,
            timeSheetDate: null,
            process: '(7 Isn(Visual))',
            totalNV: tongNS,
            totalV: tongV,
            totalSGLV: tongSGLV,
            totalVS: tongVS,
            totalDM: tongDM,
            totalSGLT: tongOT,
            totalTSGLV: tongTSGLV,
          };

          this.listHrReport.push(rowData);
        });

        this.totalCf.totalNV = this.totalCore.totalNV + this.totalInsVisual.totalNV;
        this.totalCf.totalV = this.totalCore.totalV + this.totalInsVisual.totalV;
        this.totalCf.totalSGLV = this.totalCore.totalSGLV + this.totalInsVisual.totalSGLV;
        this.totalCf.totalVS = this.totalCore.totalVS + this.totalInsVisual.totalVS;
        this.totalCf.totalDM = this.totalCore.totalDM + this.totalInsVisual.totalDM;
        this.totalCf.totalSGLT = this.totalCore.totalSGLT + this.totalInsVisual.totalSGLT;
        this.totalCf.totalTSGLV = this.totalCore.totalTSGLV + this.totalInsVisual.totalTSGLV;
      }
    }
    this.loading = false;
  }

  exportExcel() {
    let title = "Báo cáo nhân sự tháng " + formatDate(this.monthDate, '-', true);
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    let line = ['CF MONTHLY WORK TIME ' + formatDate(this.monthDate, '/', true)];
    let lineRow = worksheet.addRow(line);
    worksheet.mergeCells(`A${lineRow.number}:I${lineRow.number}`);
    lineRow.font = { name: 'Calibri Light', size: 20 };
    lineRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    lineRow.height = 20;

    let dataHeaderRow = [`日付 \n (Date) `, '工程   Process', `人数 \n No.operator`, `休み \n Absence`, `定時労働時間 \n Regular HR`, `早退 \n Leave Early`, `遅出 \n Late coming`, `残業 \n OT HR`, '総労働時間（Total Opration HR)'];
    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: 'Calibri', size: 11 };
    dataHeaderRow.forEach((item, index) => {
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
    });
    headerRow.height = 50;

    var lineMerge = [];
    this.listHrReport.forEach((item, index) => {
      let dataItem = [formatDate(item.timeSheetDate, '/', false), item.process, item.totalNV, item.totalV, item.totalSGLV, item.totalVS, item.totalDM, item.totalSGLT, item.totalTSGLV];
      let itemRow = worksheet.addRow(dataItem);
      itemRow.font = { name: 'Calibri', size: 11 };
      dataItem.forEach((item, index) => {
        itemRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        if (index + 1 == 1) {
          itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
        else if (index + 1 == 2) {
          itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }
        else {
          itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
        }
        itemRow.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }
        };
      });

      if (item.timeSheetDate != null) {
        lineMerge.push(itemRow.number)
      }
    });

    lineMerge.forEach(item => {
      worksheet.mergeCells(`A${item}:A${item + 1}`);
    });

    let totalCoreRow = [`(1CORE)`, '', this.totalCore.totalNV, this.totalCore.totalV, this.totalCore.totalSGLV, this.totalCore.totalVS, this.totalCore.totalDM, this.totalCore.totalSGLT, this.totalCore.totalTSGLV];
    let coreRow = worksheet.addRow(totalCoreRow);
    worksheet.mergeCells(`A${coreRow.number}:B${coreRow.number}`);
    coreRow.font = { name: 'Calibri', size: 12 };
    totalCoreRow.forEach((item, index) => {
      coreRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      if (index + 1 == 1 || index + 1 == 2) {
        coreRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
      else {
        coreRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      }
      coreRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
    });

    let totalIsnRow = [`7 Isn(Visual)`, '', this.totalInsVisual.totalNV, this.totalInsVisual.totalV, this.totalInsVisual.totalSGLV, this.totalInsVisual.totalVS, this.totalInsVisual.totalDM, this.totalInsVisual.totalSGLT, this.totalInsVisual.totalTSGLV];
    let isnRow = worksheet.addRow(totalIsnRow);
    worksheet.mergeCells(`A${isnRow.number}:B${isnRow.number}`);
    isnRow.font = { name: 'Calibri', size: 12 };
    totalIsnRow.forEach((item, index) => {
      isnRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      if (index + 1 == 1 || index + 1 == 2) {
        isnRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
      else {
        isnRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      }
      isnRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
    });

    let totalCFRow = [`CF`, '', this.totalCf.totalNV, this.totalCf.totalV, this.totalCf.totalSGLV, this.totalCf.totalVS, this.totalCf.totalDM, this.totalCf.totalSGLT, this.totalCf.totalTSGLV];
    let cfRow = worksheet.addRow(totalCFRow);
    worksheet.mergeCells(`A${cfRow.number}:B${cfRow.number}`);
    cfRow.font = { name: 'Calibri', size: 12, bold: true };
    totalCFRow.forEach((item, index) => {
      cfRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      if (index + 1 == 1 || index + 1 == 2) {
        cfRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
      else {
        cfRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      }
      cfRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
    });

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    let footerRow = ['', '', '', '', '', 'CHECKED date: ' + formatDate(new Date(), '/', false), '', 'ISSUED date: ' + formatDate(new Date(), '/', false), ''];
    let ftRow = worksheet.addRow(footerRow);
    worksheet.mergeCells(`F${ftRow.number}:G${ftRow.number}`);
    worksheet.mergeCells(`H${ftRow.number}:I${ftRow.number}`);
    ftRow.font = { name: 'Calibri', size: 8 };
    footerRow.forEach((item, index) => {
      if (index + 1 > 5) {
        ftRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        ftRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        ftRow.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }
        };
      }
    });

    footerRow = ['', '', '', '', '', 'Phạm Thành Long', '', 'Lê Minh Chiến', ''];
    ftRow = worksheet.addRow(footerRow);
    worksheet.mergeCells(`F${ftRow.number}:G${ftRow.number}`);
    worksheet.mergeCells(`H${ftRow.number}:I${ftRow.number}`);
    ftRow.font = { name: 'Calibri', size: 8 };
    footerRow.forEach((item, index) => {
      if (index + 1 > 5) {
        ftRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        ftRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        ftRow.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' }
        };
      }
    });

    /* fix with for column */
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 12;
    worksheet.getColumn(5).width = 12;
    worksheet.getColumn(6).width = 12;
    worksheet.getColumn(7).width = 12;
    worksheet.getColumn(8).width = 12;
    worksheet.getColumn(9).width = 12;

    this.exportToExel(workBook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  selectDate() {
    this.getMasterData();
  }

  goToDetail(rowData) {
    this.chooseRowData = rowData;
    console.log(this.chooseRowData)

    var rowItem = {
      text: '(1) Tổng số nhân sự',
      coreCa1: this.chooseRowData.dataModel.nv1coreCa1,
      coreCa2: this.chooseRowData.dataModel.nv1coreCa2,
      coreCa3: this.chooseRowData.dataModel.nv1coreCa3,
      isnVisualCa1: this.chooseRowData.dataModel.nv7isnVisualCa1,
      isnVisualCa2: this.chooseRowData.dataModel.nv7isnVisualCa2,
      isnVisualCa3: this.chooseRowData.dataModel.nv7isnVisualCa3,
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: '(2) Vắng mặt',
      coreCa1: this.chooseRowData.dataModel.vm1coreCa1,
      coreCa2: this.chooseRowData.dataModel.vm1coreCa2,
      coreCa3: this.chooseRowData.dataModel.vm1coreCa3,
      isnVisualCa1: this.chooseRowData.dataModel.vm7isnVisualCa1,
      isnVisualCa2: this.chooseRowData.dataModel.vm7isnVisualCa2,
      isnVisualCa3: this.chooseRowData.dataModel.vm7isnVisualCa3,
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: '(3) Số giờ làm việc =  [(1) - (2)]*8',
      coreCa1: ((this.chooseRowData.dataModel.nv1coreCa1 ?? 0) - (this.chooseRowData.dataModel.vm1coreCa1 ?? 0)) * 8,
      coreCa2: ((this.chooseRowData.dataModel.nv1coreCa2 ?? 0) - (this.chooseRowData.dataModel.vm1coreCa2 ?? 0)) * 8,
      coreCa3: ((this.chooseRowData.dataModel.nv1coreCa3 ?? 0) - (this.chooseRowData.dataModel.vm1coreCa3 ?? 0)) * 8,
      isnVisualCa1: ((this.chooseRowData.dataModel.nv7isnVisualCa1 ?? 0) - (this.chooseRowData.dataModel.vm7isnVisualCa1 ?? 0)) * 8,
      isnVisualCa2: ((this.chooseRowData.dataModel.nv7isnVisualCa2 ?? 0) - (this.chooseRowData.dataModel.vm7isnVisualCa2 ?? 0)) * 8,
      isnVisualCa3: ((this.chooseRowData.dataModel.nv7isnVisualCa3 ?? 0) - (this.chooseRowData.dataModel.vm7isnVisualCa3 ?? 0)) * 8,
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: '(4) Đi muộn',
      coreCa1: this.chooseRowData.dataModel.dm1coreCa1,
      coreCa2: this.chooseRowData.dataModel.dm1coreCa2,
      coreCa3: this.chooseRowData.dataModel.dm1coreCa3,
      isnVisualCa1: this.chooseRowData.dataModel.dm7isnVisualCa1,
      isnVisualCa2: this.chooseRowData.dataModel.dm7isnVisualCa2,
      isnVisualCa3: this.chooseRowData.dataModel.dm7isnVisualCa3,
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: '(5) Về sớm',
      coreCa1: this.chooseRowData.dataModel.vs1coreCa1,
      coreCa2: this.chooseRowData.dataModel.vs1coreCa2,
      coreCa3: this.chooseRowData.dataModel.vs1coreCa3,
      isnVisualCa1: this.chooseRowData.dataModel.vs7isnVisualCa1,
      isnVisualCa2: this.chooseRowData.dataModel.vs7isnVisualCa2,
      isnVisualCa3: this.chooseRowData.dataModel.vs7isnVisualCa3,
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: '(6) OT',
      coreCa1: this.chooseRowData.dataModel.ot1coreCa1,
      coreCa2: this.chooseRowData.dataModel.ot1coreCa2,
      coreCa3: this.chooseRowData.dataModel.ot1coreCa3,
      isnVisualCa1: this.chooseRowData.dataModel.ot7isnVisualCa1,
      isnVisualCa2: this.chooseRowData.dataModel.ot7isnVisualCa2,
      isnVisualCa3: this.chooseRowData.dataModel.ot7isnVisualCa3,
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: '(7) Tổng số giờ làm việc = (3) - (4) -(5) + (6)',
      coreCa1: (((this.chooseRowData.dataModel.nv1coreCa1 ?? 0) - (this.chooseRowData.dataModel.vm1coreCa1 ?? 0)) * 8) - (this.chooseRowData.dataModel.dm1coreCa1 ?? 0) - (this.chooseRowData.dataModel.vs1coreCa1 ?? 0) + (this.chooseRowData.dataModel.ot1coreCa1 ?? 0),
      coreCa2: (((this.chooseRowData.dataModel.nv1coreCa2 ?? 0) - (this.chooseRowData.dataModel.vm1coreCa2 ?? 0)) * 8) - (this.chooseRowData.dataModel.dm1coreCa2 ?? 0) - (this.chooseRowData.dataModel.vs1coreCa2 ?? 0) + (this.chooseRowData.dataModel.ot1coreCa2 ?? 0),
      coreCa3: (((this.chooseRowData.dataModel.nv1coreCa3 ?? 0) - (this.chooseRowData.dataModel.vm1coreCa3 ?? 0)) * 8) - (this.chooseRowData.dataModel.dm1coreCa3 ?? 0) - (this.chooseRowData.dataModel.vs1coreCa3 ?? 0) + (this.chooseRowData.dataModel.ot1coreCa3 ?? 0),
      isnVisualCa1: (((this.chooseRowData.dataModel.nv7isnVisualCa1 ?? 0) - (this.chooseRowData.dataModel.vm7isnVisualCa1 ?? 0)) * 8) - (this.chooseRowData.dataModel.dm7isnVisualCa1 ?? 0) - (this.chooseRowData.dataModel.vs7isnVisualCa1 ?? 0) + (this.chooseRowData.dataModel.ot7isnVisualCa1 ?? 0),
      isnVisualCa2: (((this.chooseRowData.dataModel.nv7isnVisualCa2 ?? 0) - (this.chooseRowData.dataModel.vm7isnVisualCa2 ?? 0)) * 8) - (this.chooseRowData.dataModel.dm7isnVisualCa2 ?? 0) - (this.chooseRowData.dataModel.vs7isnVisualCa2 ?? 0) + (this.chooseRowData.dataModel.ot7isnVisualCa2 ?? 0),
      isnVisualCa3: (((this.chooseRowData.dataModel.nv7isnVisualCa3 ?? 0) - (this.chooseRowData.dataModel.vm7isnVisualCa3 ?? 0)) * 8) - (this.chooseRowData.dataModel.dm7isnVisualCa3 ?? 0) - (this.chooseRowData.dataModel.vs7isnVisualCa3 ?? 0) + (this.chooseRowData.dataModel.ot7isnVisualCa3 ?? 0),
    }
    this.dataReportDialog.push(rowItem);

    rowItem = {
      text: 'Ghi chú',
      coreCa1: this.chooseRowData.dataModel.gc1coreCa1,
      coreCa2: this.chooseRowData.dataModel.gc1coreCa2,
      coreCa3: this.chooseRowData.dataModel.gc1coreCa3,
      isnVisualCa1: this.chooseRowData.dataModel.gc7isnVisualCa1,
      isnVisualCa2: this.chooseRowData.dataModel.gc7isnVisualCa2,
      isnVisualCa3: this.chooseRowData.dataModel.gc7isnVisualCa3,
    }
    this.dataReportDialog.push(rowItem);

    this.displayReport = true;
  }
}

function formatDate(date, txt, isMonth) {
  var dateItem = new Date(date);
  const yyyy = dateItem.getFullYear();
  let mm = dateItem.getMonth() + 1; // Months start at 0!
  let dd = dateItem.getDate();

  let ddtxt = '' + dd;
  let mmtxt = '' + mm;

  if (dd < 10) ddtxt = '0' + dd;
  if (mm < 10) mmtxt = '0' + mm;

  let formattedToday = ddtxt + txt + mmtxt + txt + yyyy;

  if (isMonth) {
    formattedToday = mmtxt + txt + yyyy;
  }
  return formattedToday;
}

