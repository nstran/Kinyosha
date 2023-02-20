import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';
import { SalaryService } from '../../../services/salary.service';
import { CommonService } from '../../../../shared/services/common.service';
import { FormatDateService } from '../../../../shared/services/formatDate.services';
import { KyLuong } from '../../../models/ky-luong.model';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";

//model dùng để build template excel
class columnModel {
  column1: string;
  column2: string;
}

@Component({
  selector: 'app-ky-luong-list',
  templateUrl: './ky-luong-list.component.html',
  styleUrls: ['./ky-luong-list.component.css']
})
export class KyLuongListComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false;
  nowDate = new Date();

  actionAdd: boolean = false;
  actionDelete: boolean = false;

  filterGlobal: string = null;
  isShowFilterRight: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 4;

  baoCaoNumber: any = null;

  listData: Array<any> = [];
  tenKyLuong: string = null;
  listStatus: Array<any> = [];
  listSelectedStatus: Array<any> = [];

  @ViewChild('myTable') myTable: Table;
  colsList: any;

  showCreate: boolean = false;
  showChoseReport: boolean = false;

  createForm: FormGroup;
  tenKyLuongControl: FormControl;
  soNgayLamViecControl: FormControl;
  tuNgayControl: FormControl;
  denNgayControl: FormControl;

  listBaoCao = [
    { value: 5, name: "Allowances" },
    { value: 9, name: "OT" },
  ]

  constructor(
    private router: Router,
    private getPermission: GetPermission,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private encrDecrService: EncrDecrService,
    private salaryService: SalaryService,
    private commonService: CommonService,
    private formatDateService: FormatDateService,
  ) { }

  async ngOnInit() {
    this.initTable();
    this.initForm();

    await this._getPermission();

    this.search();
  }

  initTable() {
    this.colsList = [
      { field: 'index', header: '#', textAlign: 'center', display: 'table-cell' },
      { field: 'tenKyLuong', header: 'Tên kỳ lương', textAlign: 'left', display: 'table-cell' },
      { field: 'tuNgay', header: 'Ngày bắt đầu', textAlign: 'center', display: 'table-cell' },
      { field: 'denNgay', header: 'Ngày kết thúc', textAlign: 'center', display: 'table-cell' },
      { field: 'soNgayLamViec', header: 'Số ngày làm việc', textAlign: 'center', display: 'table-cell' },
      { field: 'tenTrangThai', header: 'Trạng thái', textAlign: 'center', display: 'table-cell' },
      { field: 'createdDate', header: 'Ngày tạo', textAlign: 'center', display: 'table-cell' },
      { field: 'actions', header: 'Thao tác', textAlign: 'center', display: 'table-cell' },
    ];
  }

  initForm() {
    this.tenKyLuongControl = new FormControl(null, [Validators.required, Validators.maxLength(500)]);
    this.soNgayLamViecControl = new FormControl(0, [Validators.required]);
    this.tuNgayControl = new FormControl(null, [Validators.required]);
    this.denNgayControl = new FormControl(null, [Validators.required]);

    this.createForm = new FormGroup({
      tenKyLuongControl: this.tenKyLuongControl,
      soNgayLamViecControl: this.soNgayLamViecControl,
      tuNgayControl: this.tuNgayControl,
      denNgayControl: this.denNgayControl
    });
  }

  async _getPermission() {
    let resource = "hrm/salary/ky-luong-list/";
    this.loading = true;
    let permission: any = await this.getPermission.getPermission(resource);
    this.loading = false;

    if (permission.status == false) {
      this.router.navigate(["/home"]);
      return;
    }

    if (permission.listCurrentActionResource.indexOf("add") != -1) {
      this.actionAdd = true;
    }

    if (permission.listCurrentActionResource.indexOf("delete") != -1) {
      this.actionDelete = true;
    }
  }

  async search() {
    this.loading = true;
    this.awaitResult = true;
    let result: any = await this.salaryService.getListKyLuong(this.tenKyLuong?.trim(), this.listSelectedStatus.map(x => x.value));
    this.loading = false;
    this.awaitResult = false;

    if (result.statusCode != 200) {
      this.showMessage("error", result.messageCode);
      return;
    }

    this.listStatus = result.listStatus;
    this.listData = result.listData;
  }

  openCreate() {
    this.createForm.reset();
    this.soNgayLamViecControl.setValue(0);
    this.showCreate = true;
  }

  closeCreate() {
    this.showCreate = false;
  }

  changeSoNgay() {
    if (this.soNgayLamViecControl.value == null || this.soNgayLamViecControl.value == '')
      this.soNgayLamViecControl.setValue('0');
  }

  async save() {
    if (!this.createForm.valid) {
      Object.keys(this.createForm.controls).forEach(key => {
        if (!this.createForm.controls[key].valid) {
          this.createForm.controls[key].markAsTouched();
        }
      });

      this.showMessage('warn', 'Bạn chưa nhập đủ thông tin');
      return;
    }

    let kyLuong = new KyLuong();
    kyLuong.tenKyLuong = this.tenKyLuongControl.value.trim();
    kyLuong.soNgayLamViec = this.commonService.convertStringToNumber(this.soNgayLamViecControl.value.toString());
    kyLuong.tuNgay = this.formatDateService.convertToUTCTime(this.tuNgayControl.value);
    kyLuong.denNgay = this.formatDateService.convertToUTCTime(this.denNgayControl.value);

    this.loading = true;
    this.awaitResult = true;
    let result: any = await this.salaryService.createOrUpdateKyLuong(kyLuong);

    if (result.statusCode != 200) {
      this.loading = false;
      this.awaitResult = false;
      this.showMessage("error", result.messageCode);
      return;
    }

    await this.search();
    this.showMessage("success", result.messageCode);
    this.showCreate = false;
  }

  async delete(data: KyLuong) {
    this.confirmationService.confirm({
      message: `Dữ liệu không thể hoàn tác, bạn chắc chắn muốn xóa?`,
      accept: async () => {
        this.loading = true;
        this.awaitResult = true;
        let result: any = await this.salaryService.deleteKyLuong(data.kyLuongId);

        if (result.statusCode != 200) {
          this.loading = false;
          this.awaitResult = false;
          this.showMessage("error", result.messageCode);
          return;
        }

        await this.search();
        this.showMessage("success", result.messageCode);
      },
    });
  }

  goToDetail(data: KyLuong) {
    this.router.navigate(['/salary/ky-luong-detail', { kyLuongId: this.encrDecrService.set(data.kyLuongId) }]);
  }

  refreshFilter() {
    this.filterGlobal = null;
    this.myTable.reset();
    this.tenKyLuong = null;
    this.listSelectedStatus = [];
    this.search();
  }

  showFilter() {
    this.isShowFilterRight = !this.isShowFilterRight;

    if (this.isShowFilterRight) this.leftColNumber = 8;
    else this.leftColNumber = 12;
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: "Thông báo:", detail: detail };
    this.messageService.add(msg);
  }

  getDataExportExcel(id) {

  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  async exportExcelBaoCao(value) {
    this.loading = true;
    this.awaitResult = true;
    let result: any = await this.salaryService.getDataExportOT(this.tenKyLuong?.trim(), this.listSelectedStatus.map(x => x.value), value);
    this.loading = false;
    this.awaitResult = false;
    let title = `OT`;
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    //Cột hàng 1
    let dataHeaderRow1: Array<string> = result.listDataHeader[0].map(e => e.columnValue);
    let headerRow1 = worksheet.addRow(dataHeaderRow1);
    headerRow1.font = { name: 'Time New Roman', size: 10, bold: true };
    this.mergeHearExportBaoCao(value, worksheet);
    dataHeaderRow1.forEach((item, index) => {
      this.setWidthColExportBaoCao(item, worksheet, index, headerRow1, dataHeaderRow1)
    });
    headerRow1.height = 27;

    //Cột hàng 2
    let dataHeaderRow2: Array<string> = result.listDataHeader[1].map(e => e.columnValue);
    let headerRow2 = worksheet.addRow(dataHeaderRow2);
    headerRow2.font = { name: 'Time New Roman', size: 10, bold: true };
    dataHeaderRow2.forEach((item, index) => {
      //merge header column row1 vs row2
      if (item == "") {
        // merge by start row, start column, end row, end column
        // worksheet.mergeCells(1, index + 1, 2, index + 1);
      }
      this.setWidthColExportBaoCao(item, worksheet, index, headerRow2, dataHeaderRow2)
    });
    headerRow2.height = 27;

    //Lấy data
    let dataExportExcel = [];
    result.listData.forEach(row => {
      let dataRow = {};
      row.forEach(item => {
        dataRow[item.columnKey] = item.columnValue;
      });

      dataExportExcel = [...[], dataRow];
    });

    let data = dataExportExcel.map((item, index) => {
      let row = [];
      Object.keys(item).forEach(key => {
        row.push(item[key]);
      });
      return row;
    });

    this.setBorderTungDong(data, worksheet, dataHeaderRow1);
    this.exportToExel(workBook, title);
  }

  //Chỉnh bordor và thuộc tính của từng cột của dòng
  setBorderTungDong(data, worksheet, dataHeaderRow1) {
    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      //Chỉnh bordor và thuộc tính của từng cột của dòng
      dataHeaderRow1.forEach((col, colIndex) => {
        row.font = { name: 'Times New Roman', size: 11 };
        row.getCell(colIndex + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(colIndex + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      })
    });
  }

  //merge header
  mergeHearExportBaoCao(value, worksheet) {
    if (value == 9) { //OT
      worksheet.mergeCells(`H${1}:K${1}`);
      worksheet.mergeCells(`L${1}:O${1}`);
      worksheet.mergeCells(`P${1}:S${1}`);

      worksheet.mergeCells(`T${1}:W${1}`);
      worksheet.mergeCells(`X${1}:AA${1}`);
      worksheet.mergeCells(`AB${1}:AE${1}`);

      worksheet.mergeCells(`AF${1}:AI${1}`);
      worksheet.mergeCells(`AJ${1}:AL${1}`);
      worksheet.mergeCells(`AQ${1}:AS${1}`);

      worksheet.mergeCells(`AT${1}:AV${1}`);
      worksheet.mergeCells(`AW${1}:AY${1}`);
      worksheet.mergeCells(`AZ${1}:BB${1}`);
    }
    if (value == 5) { //Allowances
      worksheet.mergeCells(`J${1}:O${1}`);
      worksheet.mergeCells(`P${1}:U${1}`);
      worksheet.mergeCells(`AF${1}:AK${1}`);
    }
  }

  setWidthColExportBaoCao(item, worksheet, index, headerRow1, dataHeaderRow1) {
    if (index + 1 < dataHeaderRow1.length + 1) {
      headerRow1.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow1.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow1.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8DB4E2' }
      };
    }

    // chỉnh độ rộng cột theo độ dài ký tự
    if (item.length >= 14) {
      worksheet.getColumn(index + 1).width = 15;
    } else if (item.length >= 30) {
      worksheet.getColumn(index + 1).width = 22;
    } else if (item.length >= 60) {
      worksheet.getColumn(index + 1).width = 27;
    } else if (item.length >= 80) {
      worksheet.getColumn(index + 1).width = 30;
    }
  }

  exportBaoCao() {
    if (this.baoCaoNumber == null) {
      this.showMessage("error", "Chọn loại báo cáo!");
      return;
    }
    this.exportExcelBaoCao(this.baoCaoNumber.value);
    this.baoCaoNumber = null;
  }
}
