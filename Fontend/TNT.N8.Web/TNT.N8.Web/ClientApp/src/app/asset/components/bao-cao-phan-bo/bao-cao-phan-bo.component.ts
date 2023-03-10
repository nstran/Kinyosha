import * as $ from 'jquery';
import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import 'moment/locale/pt-br';
import { FormControl, FormGroup } from '@angular/forms';
import { Workbook } from 'exceljs';
import { AssetService } from '../../services/asset.service';
import { TaiSanModel } from '../../models/taisan.model';
import { columnModel } from '../../models/bao-cao.model';
import { companyConfigModel } from '../../models/bao-cao.model';
import { BaoCaoPhanBoModel } from '../../models/bao-cao.model';
import { Table } from 'primeng/table';
import { saveAs } from "file-saver";


@Component({
  selector: 'app-bao-cao-phan-bo',
  templateUrl: './bao-cao-phan-bo.component.html',
  styleUrls: ['./bao-cao-phan-bo.component.css'],
  providers: [
    DatePipe,
  ]
})
export class BaoCaoPhanBoComponent implements OnInit {
  fixed: boolean = false;
  withFiexd: string = "";

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  auth: any = JSON.parse(localStorage.getItem('auth'));
  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  loading: boolean = false;

  listTaiSanPhanBo: Array<BaoCaoPhanBoModel> = [];
  taiSanDetail: TaiSanModel = new TaiSanModel();
  selectedColumns: any[];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  isUpdate: boolean = false;
  isDisplayName: boolean = false;

  /*START : FORM PriceList*/
  searchForm: FormGroup;
  /*END : FORM PriceList*/

  //responsive
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 4;
  today: string = '';
  colsList: any[];

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('myTable') myTable: Table;
  filterGlobal: string = '';

  companyConfig = new companyConfigModel();

  listHienTrangTS = [
    {
      id: 1, name: '??ang s??? d???ng'
    },
    {
      id: 0, name: 'Kh??ng s??? d???ng'
    }];
  listPhanLoaiTaiSan: any[];
  listOrganization: any[];
  listEmployee: any[];
  /* Form searcg */
  searchAssetForm: FormGroup;
  phanLoaiTaiSanControl: FormControl;
  organizationControl: FormControl;
  employeeControl: FormControl;
  hienTrangTaiSanControl: FormControl;

  selectedLoaiTS: Array<any> = [];
  selectedPhongBan: Array<any> = [];
  selectedTrangThai: Array<any> = [];
  selectedNguoiSD: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private getPermission: GetPermission,
    private el: ElementRef,
    private messageService: MessageService,
    public dialogService: DialogService,
    private assetService: AssetService,
    private datePipe: DatePipe,
    private router: Router,
  ) {
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    let resource = "hrm/asset/bao-cao-phan-bo/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    } else {

      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("view") == -1) {
        let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
        this.showMessage(mgs);
        this.router.navigate(['/home']);
      }
    // this.setForm();
    // this.setTable();
    this.getMasterData();
    this.setDefaultPaidDate();
    }
  }

  setForm() {
    this.phanLoaiTaiSanControl = new FormControl(null);
    this.organizationControl = new FormControl(null);
    this.employeeControl = new FormControl(null);
    this.hienTrangTaiSanControl = new FormControl(null);

    this.searchAssetForm = new FormGroup({
      phanLoaiTaiSanControl: this.phanLoaiTaiSanControl,
      organizationControl: this.organizationControl,
      employeeControl: this.employeeControl,
      hienTrangTaiSanControl: this.hienTrangTaiSanControl
    });
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

  setDefaultPaidDate() {
    var datePipe = new DatePipe("en-US");
    var _today = new Date();
    this.today = datePipe.transform(_today, 'dd-MM-yyyy');
  }

  setTable() {
    this.colsList = [
      { field: 'maTaiSan', header: 'M?? t??i s???n', width: '100px', textAlign: 'left', color: '#f44336' },
      { field: 'tenTaiSan', header: 'T??n t??i s???n', width: '250px', textAlign: 'left', color: '#f44336' },
      { field: 'phanLoaiTaiSan', header: 'Lo???i t??i s???n', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'hienTrangTaiSanString', header: 'Tr???ng th??i', width: '100px', textAlign: 'center', color: '#f44336' },
      { field: 'ngayVaoSo', header: 'Ng??y v??o s???', width: '100px', textAlign: 'center', color: '#f44336' },
      { field: 'maNhanVien', header: 'M?? NV s??? d???ng', width: '100px', textAlign: 'center', color: '#f44336' },
      { field: 'tenNhanVien', header: 'H??? t??n', width: '150px', textAlign: 'center', color: '#f44336' },
      { field: 'phongBan', header: 'Ph??ng ban', width: '100px', textAlign: 'center', color: '#f44336' },
      { field: 'viTriLamViec', header: 'V??? tr?? vi???c l??m', width: '100px', textAlign: 'center', color: '#f44336' },
      { field: 'moTa', header: 'M?? t???', width: '100px', textAlign: 'center', color: '#f44336' },
    ];
    this.selectedColumns = this.colsList;
  }

  async getMasterData() {
    this.loading = true;
    let [result, resultSearch]: any = await Promise.all([
      this.assetService.getMasterDataBaoCaoPhanBo(),
      this.assetService.baoCaoPhanBo([], [], [], [])
    ]);

    this.loading = false;
    if (result.statusCode === 200 && resultSearch.statusCode == 200) {
      this.listPhanLoaiTaiSan = result.listPhanLoaiTaiSan;
      this.listOrganization = result.listOrganization;
      this.listEmployee = result.listEmployee;
      this.companyConfig = result.companyConfig;

      this.listTaiSanPhanBo = resultSearch.listTaiSanPhanBo;

      this.resetTable(); //reset state of table
      if (this.listTaiSanPhanBo.length == 0) {
        let mgs = { severity: 'warn', summary: 'Th??ng b??o', detail: 'Kh??ng t??m th???y t??i s???n n??o!' };
        this.showMessage(mgs);
      }
    }
  }

  checkEnterPress(event: any) {
    if (event.code === "Enter") {
      this.searchAsset();
    }
  }

  refreshFilter() {
    this.filterGlobal = '';
    this.selectedNguoiSD = [];
    this.selectedLoaiTS = [];
    this.selectedTrangThai = [];
    this.selectedPhongBan = [];
    this.searchAssetForm.reset();
    if (this.listTaiSanPhanBo.length > 0) {
      this.myTable.reset();
    }
    this.searchAsset();
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

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }


  // T??m ki???m t??i s???n
  async searchAsset() {
    this.loading = true;
    let selectedNguoiSDId = this.selectedNguoiSD.map(p => p.employeeId);
    let selectedLoaiTSId = this.selectedLoaiTS.map(p => p.categoryId);
    let selectedPhongBanId = this.selectedPhongBan.map(p => p.organizationId);
    let selectedTrangThaiId = this.selectedTrangThai.map(p => p.id);
    let result: any = await this.assetService.baoCaoPhanBo(selectedNguoiSDId, selectedPhongBanId, selectedLoaiTSId, selectedTrangThaiId);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listTaiSanPhanBo = result.listTaiSanPhanBo;
      this.resetTable(); //reset state of table
      if (this.listTaiSanPhanBo.length == 0) {
        let mgs = { severity: 'warn', summary: 'Th??ng b??o', detail: 'Kh??ng t??m th???y t??i s???n n??o!' };
        this.showMessage(mgs);
      }
    }
  }

  resetTable() {
    this.filterGlobal = '';
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  getBase64Logo() {
    let base64Logo = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "Logo");
    return base64Logo ?.systemValueString;
  }


  getListExcelColumns(): Array<columnModel> {
    let listColumns: Array<columnModel> = [];
    let columGroup_0 = new columnModel();
    columGroup_0.column1 = "M?? t??i s???n";

    let columGroup_1 = new columnModel();
    columGroup_1.column1 = "T??n t??i s???n";

    let columGroup_2 = new columnModel();
    columGroup_2.column1 = "Lo???i t??i s???n";

    let columGroup_3 = new columnModel();
    columGroup_3.column1 = "Tr???ng th??i s??? d???ng";

    let columGroup_4 = new columnModel();
    columGroup_4.column1 = "Ng??y v??o s???";

    let columGroup_5 = new columnModel();
    columGroup_5.column1 = "M?? NV s??? d???ng";

    let columGroup_6 = new columnModel();
    columGroup_6.column1 = "H??? t??n";

    let columGroup_7 = new columnModel();
    columGroup_7.column1 = "Ph??ng ban";

    let columGroup_8 = new columnModel();
    columGroup_8.column1 = "V??? tr?? vi???c l??m";

    let columGroup_9 = new columnModel();
    columGroup_9.column1 = "M?? t???";

    listColumns = [columGroup_0, columGroup_1, columGroup_2, columGroup_3, columGroup_4, columGroup_5
      , columGroup_6, columGroup_7, columGroup_8, columGroup_9];

    return listColumns;
  }

  getDataExportExcel(listTaiSanPhanBo: Array<BaoCaoPhanBoModel>) {
    let result = [];
    listTaiSanPhanBo ?.forEach(asset => {
      let newItem = new BaoCaoPhanBoModel();
      newItem.maTaiSan = asset.maTaiSan;
      newItem.tenTaiSan = asset.tenTaiSan;
      newItem.phanLoaiTaiSan = asset.phanLoaiTaiSan;
      newItem.hienTrangTaiSanString = asset.hienTrangTaiSanString;
      newItem.ngayVaoSo = this.datePipe.transform(asset.ngayVaoSo, 'dd/MM/yyyy');
      newItem.maNhanVien = asset.maNhanVien;
      newItem.tenNhanVien = asset.tenNhanVien;
      newItem.phongBan = asset.phongBan;
      newItem.viTriLamViec = asset.viTriLamViec;
      newItem.moTa = asset.moTa;
      result = [...result, newItem];
    });
    return result;
  }

  exportExcel() {
    let title = `B??o c??o ph??n b??? t??i s???n`;

    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    //LOGO - infor section
    let imgBase64 = this.getBase64Logo();
    var imgLogo = workBook.addImage({
      base64: imgBase64,
      extension: 'png',
    });
    worksheet.addImage(imgLogo, {
      tl: { col: 0.5, row: 0.5 },
      ext: { width: 140, height: 95 }
    });

    let dataInforRow_1 = `${this.companyConfig.companyName}`
    let dataInforRow_2 = `?????a ch???: ${this.companyConfig.companyAddress}`;
    let dataInforRow_3 = `??i???n tho???i: ${this.companyConfig.phone}`;
    let dataInforRow_4 = `Email: ${this.companyConfig.email}`;
    let dataInforRow_5 = `Website d???ch v???: `
    let inforRow_1 = worksheet.addRow(['', '', dataInforRow_1]);
    let inforRow_2 = worksheet.addRow(['', '', dataInforRow_2]);
    let inforRow_3 = worksheet.addRow(['', '', dataInforRow_3]);
    let inforRow_4 = worksheet.addRow(['', '', dataInforRow_4]);
    let inforRow_5 = worksheet.addRow(['', '', dataInforRow_5]);

    inforRow_1.font = { size: 14, bold: true };
    worksheet.mergeCells(`C${1}:G${1}`);
    worksheet.mergeCells(`C${2}:${2}`);
    worksheet.mergeCells(`C${3}:E${3}`);
    worksheet.mergeCells(`C${4}:E${4}`);
    worksheet.mergeCells(`C${5}:E${5}`);

    worksheet.addRow([]);
    /* title */
    let dataHeaderMain = "B??o c??o ph??n b??? t??i s???n".toUpperCase();
    let headerMain = worksheet.addRow([dataHeaderMain]);
    headerMain.font = { size: 18, bold: true };
    worksheet.mergeCells(`A${7}:J${7}`);
    headerMain.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.addRow([]);

    let listExcelColumns = this.getListExcelColumns();
    let dataHeaderRow1: Array<string> = listExcelColumns.map(e => e.column1);
    let headerRow1 = worksheet.addRow(dataHeaderRow1);
    headerRow1.font = { name: 'Time New Roman', size: 10, bold: true };

    //merge header column
    worksheet.mergeCells(`A${9}:A${9}`);
    worksheet.mergeCells(`B${9}:B${9}`);
    worksheet.mergeCells(`C${9}:C${9}`);
    worksheet.mergeCells(`D${9}:D${9}`);
    worksheet.mergeCells(`E${9}:E${9}`);

    headerRow1.font = { name: 'Time New Roman', size: 10, bold: true };
    dataHeaderRow1.forEach((item, index) => {
      if (index + 1 < dataHeaderRow1.length + 1) {
        headerRow1.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        headerRow1.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRow1.getCell(index + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '8DB4E2' }
        };
      }
    });

    let data: Array<any> = [];
    let dataExportExcel: Array<BaoCaoPhanBoModel> = this.getDataExportExcel(this.listTaiSanPhanBo);
    // G??n n???i dung cho c??c c???t
    dataExportExcel ?.forEach((item, index) => {
      let row: Array<any> = [];
      //row[0] = '';
      row[0] = item.maTaiSan;
      row[1] = item.tenTaiSan;
      row[2] = item.phanLoaiTaiSan;
      row[3] = item.hienTrangTaiSanString;
      row[4] = item.ngayVaoSo;
      row[5] = item.maNhanVien;
      row[6] = item.tenNhanVien;
      row[7] = item.phongBan;
      row[8] = item.viTriLamViec;
      row[9] = item.moTa;
      data.push(row);
    });

    // Format ti??u ????? c??c c???t. C?? time c???n t???i ??u code ??o???n n??y cho ng???n l???i
    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };
      row.getCell(1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(2).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(3).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(4).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(5).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      row.getCell(6).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      row.getCell(7).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(8).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(8).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(9).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(9).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(10).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(10).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });

    /* fix with for column */

    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 30;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 15;


    this.exportToExel(workBook, title);

  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

}
// function forbiddenSpaceText(control: FormControl) {
//   let text = control.value;
//   if (text && text.trim() == "") {
//     return {
//       forbiddenSpaceText: {
//         parsedDomain: text
//       }
//     }
//   }
//   return null;
// }

// function convertToUTCTime(time: any) {
//   return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
// };


// function ExcelDateToJSDate(serial) {
//   var utc_days = Math.floor(serial - 25569);
//   var utc_value = utc_days * 86400;
//   var date_info = new Date(utc_value * 1000);

//   var fractional_day = serial - Math.floor(serial) + 0.0000001;

//   var total_seconds = Math.floor(86400 * fractional_day);

//   var seconds = total_seconds % 60;

//   total_seconds -= seconds;

//   var hours = Math.floor(total_seconds / (60 * 60));
//   var minutes = Math.floor(total_seconds / 60) % 60;

//   return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
// }
// function ParseStringToFloat(str: any) {
//   if (str === "") return 0;
//   str = str.toString().replace(/,/g, '');
//   return parseFloat(str);
// }
