import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Row, Workbook, Worksheet } from 'exceljs';
import { saveAs } from "file-saver";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DialogService, FileUpload } from 'primeng';
import { EncrDecrService } from '../../../../../src/app/shared/services/encrDecr.service';
import { AssetService } from '../../services/asset.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dot-kiem-ke-detail',
  templateUrl: './dot-kiem-ke-detail.component.html',
  styleUrls: ['./dot-kiem-ke-detail.component.css']
})

export class DotKiemKeDetailComponent implements OnInit {
  auth = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;
  filterGlobal: string = '';
  displayChooseFileImportDialog: boolean = false;
  fileName: string = '';
  selectedColumns: any[];
  cols: any[];
  listTaiSan: any[] = [];
  today = new Date();

  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 0;

  //Form của đợt kiểm kê
  dotKiemKeFormGroup: FormGroup;
  tenDotKiemKeControl: FormControl;
  ngayBatDauControl: FormControl;
  ngayKetThucControl: FormControl;

  loginEmpId: string = '';
  dotKiemKeId: number = 0;

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  companyConfig: any; // Thông tin vê cty
  isShowWorkFollowContract: boolean = true;
  emptyGuid = '00000000-0000-0000-0000-000000000000';
  defaultAvatar: string = '/assets/images/no-avatar.png';
  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  @ViewChild('myTable') myTable: Table;

  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionDownLoad: boolean = true;
  actionUpLoad: boolean = true;
  isManagerOfHR: boolean = false;
  isGD: boolean = false;
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  statusCode: string = null;
  pageSize = 20;
  trangThaiDeXuat: number = 1;

  listProvince: Array<any> = [];
  listPhanLoaiTaiSan: Array<any> = [];
  listHienTrangTaiSan: Array<any> = [];
  listNguoiKiemKe: Array<any> = [];

  ngayKiemKeSearch: any = null;
  provinceSearch: any = null;
  phanLoaiTaiSanSearch: any = null;
  hienTrangTaiSanSearch: any = null;
  nguoiKiemKeSearch: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private def: ChangeDetectorRef,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private ref: ChangeDetectorRef,
    private encrDecrService: EncrDecrService,
    private assetService: AssetService,
    private getPermission: GetPermission,
    private datePipe: DatePipe,
  ) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 768) {
      this.isShowWorkFollowContract = false;
    }
  }

  async ngOnInit() {
    this.setForm();
    this.route.params.subscribe(params => {
      if (params['dotKiemKeId']) {
        this.dotKiemKeId = Number(this.encrDecrService.get(params['dotKiemKeId']));
      }
    });

    let resource = "hrm/asset/chi-tiet-dot-kiem-ke";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Thông báo:', detail: 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("view") == -1) {
        this.router.navigate(['/home']);
      }
    }

    this.getMasterData();

  }


  setForm() {
    this.tenDotKiemKeControl = new FormControl(null, Validators.required);
    this.ngayBatDauControl = new FormControl(null, Validators.required);
    this.ngayKetThucControl = new FormControl(null, Validators.required);

    this.dotKiemKeFormGroup = new FormGroup({
      tenDotKiemKeControl: this.tenDotKiemKeControl,
      ngayBatDauControl: this.ngayBatDauControl,
      ngayKetThucControl: this.ngayKetThucControl
    });
  }

  setCols() {
    this.cols = [
      { field: 'createdDate', header: 'Ngày kiểm kê', textAlign: 'center', display: 'table-cell', width: "150px" },
      { field: 'nguoiKiemKeName', header: 'NV kiểm kê', textAlign: 'left', display: 'table-cell', width: '200px' },
      { field: 'maTaiSan', header: 'Mã tài sản', textAlign: 'center', display: 'table-cell', width: '130px' },
      { field: 'serialNumber', header: 'Serial Number', textAlign: 'center', display: 'table-cell', width: '140px' },
      { field: 'ownerShip', header: 'OwnerShip', textAlign: 'center', display: 'table-cell', width: '120px' },
      { field: 'legalCode', header: 'LegalCode', textAlign: 'center', display: 'table-cell', width: '120px' },
      { field: 'assetType', header: 'AssetType', textAlign: 'center', display: 'table-cell', width: '120px' },
      { field: 'moTaTaiSan', header: 'Mô tả tài sản', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'nguoiDungName', header: 'Fullname', textAlign: 'center', display: 'table-cell', width: '110px' },
      { field: 'nguoiDungUserName', header: 'Account', textAlign: 'center', display: 'table-cell', width: '110px' },
      { field: 'nguoiDungOrg', header: 'Phòng ban người sử dụng', textAlign: 'center', display: 'table-cell', width: '125px' },
      { field: 'expenseUnit', header: 'ExpenseUnit', textAlign: 'center', display: 'table-cell', width: '120px' },
      { field: 'giaTriNguyenGia', header: 'Nguyên giá', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'khauHaoLuyKe', header: 'Khấu hao lũy kế', textAlign: 'right', display: 'table-cell', width: '150px' },
      { field: 'giaTriTinhKhauHao', header: 'Giá trị tính khấu hao', textAlign: 'right', display: 'table-cell', width: '180px' },
      { field: 'giaTriConLai', header: 'Giá trị còn lại', textAlign: 'right', display: 'table-cell', width: '150px' },
      { field: 'tgianKhauHao', header: 'Thời gian khấu hao', textAlign: 'right', display: 'table-cell', width: '150px' },
      { field: 'tgianDaKhauHao', header: 'Thời gian đã khấu hao', textAlign: 'right', display: 'table-cell', width: '180px' },
      { field: 'tgianKhauHaoCL', header: 'Thời gian còn lại', textAlign: 'right', display: 'table-cell', width: '180px' },
      { field: 'khauHaoKyHt', header: 'Khấu hao kỳ hiện tại', textAlign: 'right', display: 'table-cell', width: '180px' },
      { field: 'ngayKetThucKhauHao', header: 'Ngày kết thúc khấu hao', textAlign: 'right', display: 'table-cell', width: '120px' },
      { field: 'ngayNhapKho', header: 'Ngày nhập kho', textAlign: 'right', display: 'table-cell', width: '150px' },
      { field: 'khuVucName', header: 'Khu vực', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'tang', header: 'Floor', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'vỉTriTs', header: 'Vị trí tài sản', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'tinhTrangName', header: 'Tình trạng', textAlign: 'center', display: 'table-cell', width: '110px' },
      { field: 'mucDichTS', header: 'Mục đích tài sản', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'userConfirm', header: 'UserConfirm', textAlign: 'center', display: 'table-cell', width: '150px' },
    ];
    this.selectedColumns = this.cols;
  }

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  async getMasterData() {
    this.loading = true;
    let ngayKiemKe = this.ngayKiemKeSearch != null ? convertToUTCTime(new Date(this.ngayKiemKeSearch)) : null;
    let provincecId = this.provinceSearch != null ? this.provinceSearch.map(x => x.provinceId) : null;
    let phanLoaiTaiSanId = this.phanLoaiTaiSanSearch != null ? this.phanLoaiTaiSanSearch.map(x => x.categoryId) : null;
    let hienTrangTaiSan = this.hienTrangTaiSanSearch != null ? this.hienTrangTaiSanSearch.value : null;
    let nguoiKiemKeId = this.nguoiKiemKeSearch != null ? this.nguoiKiemKeSearch.map(x => x.employeeId) : null;
    // this.assetService.dotKiemKeDetail(this.dotKiemKeId, provincecId, phanLoaiTaiSanId, hienTrangTaiSan, ngayKiemKe, nguoiKiemKeId).subscribe(response => {
    //   var result = <any>response;
    //   this.loading = false;
    //   if (result.statusCode == 200) {
    //     this.setDefaultValue(result);
    //   }
    // });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  refreshFilter() {
    this.filterGlobal = '';
    this.provinceSearch = null;
    this.phanLoaiTaiSanSearch = null;
    this.listHienTrangTaiSan = null;
    this.nguoiKiemKeSearch = null;
    this.ngayKiemKeSearch = null;
    if (this.listTaiSan.length > 0) {
      this.myTable.reset();
    }
    this.getMasterData();
  }

  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 8;
        this.rightColNumber = 4;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
  }



  setDefaultValue(result) {
    this.trangThaiDeXuat = result.dotKiemKe.trangThaiId;
    this.tenDotKiemKeControl.setValue(result.dotKiemKe.tenDoiKiemKe);
    this.ngayBatDauControl.setValue(new Date(result.dotKiemKe.ngayBatDau));
    this.ngayKetThucControl.setValue(new Date(result.dotKiemKe.ngayKetThuc));
    this.listTaiSan = result.listDotKiemKeChiTiet;
    this.listProvince = result.listAllProvince;
    this.listPhanLoaiTaiSan = result.listPhanLoaiTaiSan;
    this.listHienTrangTaiSan = result.listHienTrangTaiSan;
    this.listNguoiKiemKe = result.listAllNguoiKiemKe;
    if (this.trangThaiDeXuat == 1) {
      this.tenDotKiemKeControl.enable();
      this.ngayBatDauControl.enable();
      this.ngayKetThucControl.enable();
    }
    if (this.trangThaiDeXuat == 2) {
      this.tenDotKiemKeControl.disable();
      this.ngayBatDauControl.disable();
      this.ngayKetThucControl.enable();
    }

    if (this.trangThaiDeXuat == 3) {
      this.tenDotKiemKeControl.disable();
      this.ngayBatDauControl.disable();
      this.ngayKetThucControl.disable();
    }

    this.setCols();
  }

  thoat() {
    this.router.navigate(['/asset/danh-sach-dot-kiem-ke']);
  }

  capNhatDoiKiemKe() {
    if (!this.dotKiemKeFormGroup.valid) {
      Object.keys(this.dotKiemKeFormGroup.controls).forEach(key => {
        if (this.dotKiemKeFormGroup.controls[key].valid == false) {
          this.dotKiemKeFormGroup.controls[key].markAsTouched();
        }
      });
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng nhập đầy đủ thông tin các trường dữ liệu.' };
      this.showMessage(msg);
      return;
    }
    let tenDotKiemKe = this.tenDotKiemKeControl.value;
    let ngayBatDau = convertToUTCTime(new Date(this.ngayBatDauControl.value));
    let ngayKetThuc = convertToUTCTime(new Date(this.ngayKetThucControl.value));
    if (ngayBatDau > ngayKetThuc) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Ngày bắt đầu không được lớn hơn ngày kết thúc!' };
      this.showMessage(msg);
      return;
    }
    // this.assetService.taoDotKiemKe(tenDotKiemKe, ngayBatDau, ngayKetThuc, this.dotKiemKeId).subscribe(response => {
    //   var result = <any>response;
    //   if (result.statusCode == 200) {
    //     let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.message };
    //     this.showMessage(mgs);
    //     this.getMasterData();
    //   } else {
    //     let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.message };
    //     this.showMessage(mgs);
    //   }
    // });
  }

  getBase64Logo() {
    let base64Logo = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "Logo");
    return base64Logo?.systemValueString;
  }

  exportExcel() {
    let title = this.tenDotKiemKeControl.value;
    let titleChange = title.replaceAll('/', '-')
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(titleChange);

    let titleTableRow = worksheet.addRow(["Danh sách tài sản kiểm kê"]);
    titleTableRow.font = { name: 'Times New Roman', family: 4, size: 18, bold: true };
    titleTableRow.height = 40;
    titleTableRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells(`A1:AC1`)

    /* header table */
    let headerBaoCao = ["STT", "Ngày kiểm kê", "NV kiểm kê", "Mã tài sản", "Serial number", "OwnerShip",
      "LegalCode", "AssetType", "Mô tả tài sản", "Fullname", "Account", "Phòng ban người sử dụng",
      "ExpenseUnit", "Nguyên giá", "Khấu hao lũy kế", "Gía trị tính khấu hao", "Gía trị còn lại",
      "Thời gian khấu hao", "Thời gian đã khấu hao", "Thời gian còn lại", "Khấu hao kỳ hiện tại",
      "Ngày kết thúc khấu hao", "Ngày nhập kho", "Khu vực", "Floor", "Vị trí tài sản", "Tình trạng",
      "Mục đích tài sản", "UserConfirm"];

    let headerRow = worksheet.addRow(headerBaoCao);

    headerRow.height = 40;
    headerRow.font = { name: 'Times New Roman', size: 11, bold: true };

    headerBaoCao.forEach((item, index) => {
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8DB4E2' }
      };
    });

    let data: Array<any> = [];
    var datePipe = new DatePipe("en-US");
    this.listTaiSan?.forEach((item, index) => {
      let row: Array<any> = [];
      row[0] = index + 1;
      row[1] = datePipe.transform(new Date(item.createdDate), 'dd-MM-yyyy');
      row[2] = item.nguoiKiemKeName;
      row[3] = item.maTaiSan;
      row[4] = item.serialNumber;
      row[5] = item.ownerShip;
      row[6] = item.legalCode;
      row[7] = item.assetType;
      row[8] = item.moTaTaiSan;
      row[9] = item.nguoiDungName;
      row[10] = item.nguoiDungUserName;
      row[11] = item.nguoiDungOrg;
      row[12] = item.expenseUnit;
      row[13] = item.giaTriNguyenGia;
      row[14] = item.khauHaoLuyKe;
      row[15] = item.giaTriTinhKhauHao;
      row[16] = item.giaTriConLai;
      row[17] = item.tgianKhauHao;
      row[18] = item.tgianDaKhauHao;
      row[19] = item.tgianKhauHaoCL;
      row[20] = item.khauHaoKyHt;
      row[21] = datePipe.transform(new Date(item.ngayKetThucKhauHao), 'dd-MM-yyyy');
      row[22] = datePipe.transform(new Date(item.ngayNhapKho), 'dd-MM-yyyy');
      row[23] = item.khuVucName;
      row[24] = item.tang;
      row[25] = item.vỉTriTs;
      row[26] = item.tinhTrangName;
      row[27] = item.mucDichTS;
      row[28] = item.userConfirm;
      data.push(row);
    })

    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };

      el.forEach((e, index) => {
        row.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      })

      row.getCell(3).numFmt = '[$-en-US]mmm/yy;@';
      row.getCell(13).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(14).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(15).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(16).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(17).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(18).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(19).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(20).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
      row.getCell(21).numFmt = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';
    });


    /* fix with for column */
    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 10;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 10;
    worksheet.getColumn(8).width = 10;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 15;
    worksheet.getColumn(12).width = 10;
    worksheet.getColumn(13).width = 15;
    worksheet.getColumn(14).width = 15;
    worksheet.getColumn(15).width = 15;
    worksheet.getColumn(16).width = 15;
    worksheet.getColumn(17).width = 15;
    worksheet.getColumn(18).width = 15;
    worksheet.getColumn(19).width = 15;
    worksheet.getColumn(20).width = 15;
    worksheet.getColumn(21).width = 15;
    worksheet.getColumn(22).width = 15;
    worksheet.getColumn(23).width = 15;
    worksheet.getColumn(24).width = 15;
    worksheet.getColumn(25).width = 15;
    worksheet.getColumn(26).width = 15;
    worksheet.getColumn(27).width = 15;
    worksheet.getColumn(28).width = 15;
    worksheet.getColumn(29).width = 15;

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, title);
    });

  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })

  }

}

function convertDate(time: any) {
  let ngay = time.getDate()
  let thang = time.getMonth() + 1
  let nam = time.getFullYear()
  return `${ngay}/${thang}/${nam}`
};

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
