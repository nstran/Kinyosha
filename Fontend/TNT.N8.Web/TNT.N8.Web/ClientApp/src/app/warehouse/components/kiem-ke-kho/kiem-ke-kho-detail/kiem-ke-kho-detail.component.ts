import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { WarehouseService } from "../../../services/warehouse.service";
import { Table } from 'primeng/table';
import { Row, Workbook, Worksheet } from 'exceljs';
import { saveAs } from "file-saver";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DialogService, FileUpload } from 'primeng';
import { DatePipe } from '@angular/common';
import { EncrDecrService } from '../../../../../../src/app/shared/services/encrDecr.service';
import { AssetService } from "../../../../asset/services/asset.service";
import { MenuItem } from 'primeng/api';
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@aspnet/signalr";
import { Console } from 'console';
import { GetPermission } from "../../../../shared/permission/get-permission";

class mapDataDialog {
  lotNoId: any;
  lotNo: any;
  soLuongNhap: number;
  thaoTac: any;
}

class productLotNoPhieuCanBang
{
  productId: any;
  lotNoId: any;
  lotNoName: any;
  soLuongTon: any;
  soLuong: any;
  thaoTac: any;
}

class ColumnExcel {
  code: string;
  name: string;
  width: number;
}

class chiTietPhieuCanBang
{
  dotKiemKeChiTietId: any;
  productId: any;
  productCode: any;
  productName: any;
  donVi: any;
  soLuongCanNhap: any;
  soLuongCanXuat: any;
  soLuongConLai: any;
  trangThaiId: any;
  trangThaiName: any;
  listProductLotNoPhieuCanBang:  Array<productLotNoPhieuCanBang>
  thaoTac: any;
}

@Component({
  selector: "app-kiem-ke-kho-detail",
  templateUrl: "./kiem-ke-kho-detail.component.html",
  styleUrls: ["./kiem-ke-kho-detail.component.css"],
  providers: [
    AssetService,
    {
      provide: HubConnection,
      useClass: HubConnectionBuilder,
    },
  ],
})
export class KiemKeKhoDetailComponent implements OnInit {
  auth = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;
  filterGlobal: string = "";
  displayChooseFileImportDialog: boolean = false;
  fileName: string = "";
  selectedColumns: any[];
  // cols: any[];
  cols: Array<any> = [];
  frozenCols: Array<any> = [];
  trRowFrozen: Array<any> = [];
  trRow: Array<any> = [];
  listDetail: any[] = [];
  listDetailTable: any[] = [];
  today = new Date();
  checkStatus: boolean = null;
  isClickSave: boolean = false;

  listPhieuCanBangNhap: Array<chiTietPhieuCanBang> = [];
  selectedItemPhieuCanBangNhap: chiTietPhieuCanBang;
  colsNhapCanBang: any[];

  listPhieuCanBangXuat: Array<chiTietPhieuCanBang> = [];
  selectedItemPhieuCanBangXuat: chiTietPhieuCanBang;
  colsXuatCanBang: any[];
  withFiexd: any = '';

  // currentProductCodeUpdate: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.withFiexd = $('#table-scoll').width() + 'px';
  }

  tenNVLNhap: any;
  soluongCanNhap: number;
  soluongCanNhapConLai: number;
  colsDetailLotNoNhap: Array<any> = [];
  colsDetailLotNoXuat: Array<any> = [];
  listDetailLotNoDialogNhap: Array<mapDataDialog> = [];
  listProductLotNoPhieuCanBang: Array<productLotNoPhieuCanBang> = [];
  tenNVLXuat: any;
  soluongCanXuat: number;
  soluongCanXuatConLai: number;
  colsXuatLotNo: Array<any> = [];

  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 0;

  //Form của đợt kiểm kê
  dotKiemKeFormGroup: FormGroup;
  canBangFormGroup: FormGroup;
  // tenDotKiemKeControl: FormControl;
  ngayBatDauControl: FormControl;
  ngayKetThucControl: FormControl;

  showCanBangDialog: boolean = false;
  showDetailLotNoNhap: boolean = false;
  showDetailLotNoXuat: boolean = false;

  loginEmpId: string = "";
  dotKiemKeId: number;
  warehouseId: any;
  dotKiemKeModel: any;
  trangThaiId: number;

  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  companyConfig: any; // Thông tin vê cty
  isShowWorkFollowContract: boolean = true;
  emptyGuid = "00000000-0000-0000-0000-000000000000";
  defaultAvatar: string = "/assets/images/no-avatar.png";
  @ViewChild("fileNoteUpload") fileNoteUpload: FileUpload;
  @ViewChild("fileUpload") fileUpload: FileUpload;
  @ViewChild("myTable") myTable: Table;

  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );

  /* action phân quyền */
  actionAdd: boolean = true;
  actionBalance: boolean = true;
  actionComplete: boolean = true;
  actionEdit: boolean = true;
  actionDownLoad: boolean = true;
  actionUpLoad: boolean = true;

  isManagerOfHR: boolean = false;
  isGD: boolean = false;
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  statusCode: string = null;
  pageSize = 20;
  trangThaiDeXuat: number = 1;
  listAction: MenuItem[];

  listProvince: Array<any> = [];
  listPhanLoaiTaiSan: Array<any> = [];
  listHienTrangTaiSan: Array<any> = [];
  listNguoiKiemKe: Array<any> = [];
  listProductLoNoMapping: Array<any> = [];

  ngayKiemKeSearch: any = null;
  provinceSearch: any = null;
  phanLoaiTaiSanSearch: any = null;
  hienTrangTaiSanSearch: any = null;
  nguoiKiemKeSearch: any = null;
  constructor(
    private warehouseService: WarehouseService,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService,
    public messageService: MessageService,
    private assetService: AssetService,
    private getPermission: GetPermission,
  ) {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 768) {
      this.isShowWorkFollowContract = false;
    }

    this.withFiexd = $('#table-scoll').width() + 'px';
  }

  async ngOnInit() {
    this.setForm();
    let resource = "war/warehouse/kiem-ke-kho/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("balance") == -1) {
        this.actionBalance = false;
      }
      if (listCurrentActionResource.indexOf("complete") == -1) {
        this.actionComplete = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownLoad = false;
      }
      if (listCurrentActionResource.indexOf("import") == -1) {
        this.actionUpLoad = false;
      }
    }
    this.setCols();
    this.route.params.subscribe((params) => {
      if (params["dotkiemkeId"]) {
        this.dotKiemKeId = params["dotkiemkeId"];
      }
      if (params["warehouseId"]) {
        this.warehouseId = params["warehouseId"];
      }
    });

    this.getMasterData();
  }
  showMessage(msg: any) {
    this.messageService.add(msg);
  }
  setCols() {
    // this.cols = [
    //   { field: "no", header: "No", textAlign: "center", display: "table-cell", width: "30px", rowspan: 2, colspan: 1 },
    //   { field: "productCode", header: "Ma_vt", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "productName", header: "Tên NVL, CCDC", textAlign: "left", display: "table-cell", width: "150px", rowspan: 2, colspan: 1 },
    //   { field: "productUnitName", header: "ĐVT", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "tondauky", header: "Tồn đầu kỳ", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "nhapkho", header: "Nhập kho", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "xuatkho", header: "Xuất kho", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "toncuoiky", header: "Tồn cuối kỳ", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "checkkiemtra", header: "Kiểm tra", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "ckecknhapga", header: "Nhập lõi TSD", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "checktra", header: "BP.TRẢ", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "checkpending", header: "Pending", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "checkTncc", header: "TNCC", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "tong", header: "Tổng", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "chenhlech", header: "Chênh lệch", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "tenLoaihang", header: "Loại hàng", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "note", header: "Note", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "cf", header: "CF", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "mb", header: "MB", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "mbpfc", header: "MB-PFC", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "pfa", header: "PFA", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "gianhua", header: "GÁ NHỰA", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "pfc", header: "PFC", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "kjp", header: "KJP", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "qamb", header: "QA(MB)", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "qacf", header: "QA(CF)", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "ktsx", header: "KT SX", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "iso", header: "ISO", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "hk", header: "HK", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "tiouhuy", header: "TIÊU HUỶ", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    //   { field: "adm", header: "ADM", textAlign: "center", display: "table-cell", width: "100px", rowspan: 2, colspan: 1 },
    // ];
    // this.selectedColumns = this.cols;

    this.colsNhapCanBang = [
      { field: "STT", header: "STT", width: "15px", textAlign: "center" },
      {
        field: "productCode",
        header: "Mã VL",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "productName",
        header: "Tên VL",
        width: "80px",
        textAlign: "center",
      },
      {
        field: "donVi",
        header: "Đơn vị",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "soLuongCanNhap",
        header: "Số lượng cần nhập",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "trangThaiName",
        header: "Trạng thái",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "40px",
        textAlign: "center",
      },
    ];
    this.colsXuatCanBang = [
      { field: "STT", header: "STT", width: "15px", textAlign: "center" },
      {
        field: "productCode",
        header: "Mã VL",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "productName",
        header: "Tên VL",
        width: "80px",
        textAlign: "center",
      },
      {
        field: "donVi",
        header: "Đơn vị",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "soLuongCanXuat",
        header: "Số lượng cần xuất",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "trangThaiName",
        header: "Trạng thái",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "40px",
        textAlign: "center",
      },
    ];

    this.colsDetailLotNoNhap = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "120px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuong",
        header: "Số lượng nhập",
        textAlign: "center",
        width: "120px",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "120px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];
    this.colsDetailLotNoXuat = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "120px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuongTon",
        header: "Số lượng Tồn",
        textAlign: "center",
        width: "120px",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuong",
        header: "Số lượng nhập",
        textAlign: "center",
        width: "120px",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "thaoTac",
      //   header: "Thao tác",
      //   width: "120px",
      //   textAlign: "center",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
    ];
  }
  setForm() {
    this.dotKiemKeFormGroup = new FormGroup({});
    this.canBangFormGroup = new FormGroup({});

    /*Nếu là VNS thì không có tính năng xuất PDF*/
    this.listAction = [];

    let optionSuaPhieuNhap = {
      label: "Sửa phiếu nhập kho",
      icon: "pi pi-file",
      command: () => {
        this.gotoPhieuNhap();
      },
    };

    let optionSuaPhieuXuat = {
      label: "Sửa phiếu xuất kho",
      icon: "pi pi-file",
      command: () => {
        this.gotoPhieuXuat();
      },
    };

    let optionCanBang = {
      label: "Tạo phiếu cân bằng",
      icon: "pi pi-file",
      command: () => {
        this.phieuCanBangKho();
      },
    };

    this.listAction.push(optionSuaPhieuNhap);
    this.listAction.push(optionSuaPhieuXuat);
    this.listAction.push(optionCanBang);
    /* END */
  }
  gotoPhieuNhap() {
    this.router.navigate(["/warehouse/inventory-receiving-voucher/list"]);
  }
  gotoPhieuXuat() {
    this.router.navigate(["/warehouse/inventory-delivery-voucher/list"]);
  }
  phieuCanBangKho() {
    this.mappingListData();
    this.assetService
      .canBangDotKiemKeDetail(this.listDetail)
      .subscribe((response) => {
        var result = <any>response;
        if (result.statusCode == 200) {
          let mgs = {
            severity: "success",
            summary: "Thông báo:",
            detail: result.message,
          };
          // this.showMessage(mgs);
          this.getMasterData();
          this.showCanBangDialog = true;
          this.listPhieuCanBangNhap = result.listNhapCanBang;
          this.listPhieuCanBangXuat = result.listXuatCanBang;
        } else {
          let mgs = {
            severity: "error",
            summary: "Thông báo:",
            detail: result.message,
          };
          this.showMessage(mgs);
        }
      });
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
  refreshFilter() {}
  exportExcel() {
    this.loading = true;
    this.mappingListData();

    let title = "Kiểm kê kho";
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);

    let line1 = ["", "", "", "", "", "", "", "", "KIS V4-A 032-01"];
    let lineRow1 = worksheet.addRow(line1);
    lineRow1.font = { name: "Times New Roman", size: 11, bold: true };
    lineRow1.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow1.height = 20;

    let line2 = ["KINYOSHA VIETNAM CO LTD"];
    let lineRow2 = worksheet.addRow(line2);
    lineRow2.font = { name: "Times New Roman", size: 12 };
    lineRow2.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow2.height = 20;

    let line3 = ["DAILY STOCK OUT REPORT"];
    let lineRow3 = worksheet.addRow(line3);
    worksheet.mergeCells(`A${lineRow3.number}:J${lineRow3.number}`);
    lineRow3.font = { name: "Times New Roman", size: 14, bold: true };
    lineRow3.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow3.height = 30;

    let line4 = ["BÁO CÁO TỒN KHO HÀNG NGÀY"];
    let lineRow4 = worksheet.addRow(line4);
    worksheet.mergeCells(`A${lineRow4.number}:J${lineRow4.number}`);
    lineRow4.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      italic: true,
    };
    lineRow4.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow4.height = 30;
    worksheet.addRow([]);

    let dataHeaderRow1 = [
      "NO",
      "Ma_vt",
      "Mã kế toán",
      `Name(Eng)`,
      "ĐVT",
      "Tên nhà cung cấp",
      `Stock quality/Tồn đầu kỳ`,
      "Stock in",
      "Stock out",
      `Closing balance/Tồn cuối kỳ`,
      "Check",
      "",
      "",
      "",
      "",
      "Tong",
      "Chênh lệch",
      "Tên hàng",
    ];
    let lineHd1 = worksheet.addRow(dataHeaderRow1);
    lineHd1.font = { name: "Times New Roman", size: 11, bold: true };
    dataHeaderRow1.forEach((item, index) => {
      lineHd1.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      lineHd1.getCell(index + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      lineHd1.getCell(index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "8DB4E2" },
      };
    });
    lineHd1.height = 30;

    let dataHeaderRow2 = [
      "",
      "",
      "",
      `Tên NVL, CCDC`,
      "",
      "",
      "",
      "Nhập kho",
      "Xuất kho",
      "",
      "Kiểm tra",
      `Nhập lõi TSD / Nhập gá KVN SX`,
      "BP.TRẢ",
      "Pending",
      "TNCC",
      "",
      "",
      "",
    ];
    let lineHd2 = worksheet.addRow(dataHeaderRow2);
    lineHd2.font = { name: "Times New Roman", size: 11, bold: true };
    dataHeaderRow2.forEach((item, index) => {
      lineHd2.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      lineHd2.getCell(index + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      lineHd2.getCell(index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "8DB4E2" },
      };
    });
    lineHd2.height = 30;

    let dataHeaderRow3 = [
      "",
      "",
      "",
      ``,
      "",
      "",
      "1/11/2022",
      "",
      "",
      "30/11/2022",
      "",
      ``,
      "",
      "",
      "",
      "",
      "",
      "",
    ];
    let lineHd3 = worksheet.addRow(dataHeaderRow3);
    lineHd3.font = { name: "Times New Roman", size: 11, bold: true };
    dataHeaderRow3.forEach((item, index) => {
      lineHd3.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      lineHd3.getCell(index + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      lineHd3.getCell(index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "8DB4E2" },
      };
    });
    lineHd3.height = 30;

    worksheet.mergeCells(`A${lineHd1.number}:A${lineHd3.number}`);
    worksheet.mergeCells(`B${lineHd1.number}:B${lineHd3.number}`);
    worksheet.mergeCells(`C${lineHd1.number}:C${lineHd3.number}`);
    worksheet.mergeCells(`D${lineHd2.number}:D${lineHd3.number}`);
    worksheet.mergeCells(`E${lineHd1.number}:E${lineHd3.number}`);
    worksheet.mergeCells(`G${lineHd1.number}:G${lineHd2.number}`);
    worksheet.mergeCells(`H${lineHd2.number}:H${lineHd3.number}`);
    worksheet.mergeCells(`I${lineHd2.number}:I${lineHd3.number}`);
    worksheet.mergeCells(`J${lineHd1.number}:J${lineHd2.number}`);
    worksheet.mergeCells(`K${lineHd1.number}:O${lineHd1.number}`);
    worksheet.mergeCells(`K${lineHd2.number}:K${lineHd3.number}`);
    worksheet.mergeCells(`L${lineHd2.number}:L${lineHd3.number}`);
    worksheet.mergeCells(`M${lineHd2.number}:M${lineHd3.number}`);
    worksheet.mergeCells(`N${lineHd2.number}:N${lineHd3.number}`);
    worksheet.mergeCells(`O${lineHd2.number}:O${lineHd3.number}`);
    worksheet.mergeCells(`P${lineHd1.number}:P${lineHd3.number}`);
    worksheet.mergeCells(`Q${lineHd2.number}:Q${lineHd3.number}`);
    worksheet.mergeCells(`R${lineHd2.number}:R${lineHd3.number}`);

    this.listDetail.forEach((item, index) => {
      let dataHeaderRowIndex = [
        index + 1,
        item.productCode,
        item.accountingCode,
        item.productName,
        item.productUnitName,
        item.vendorName,
        item.tondauky,
        item.nhapkho,
        item.xuatkho,
        item.toncuoiky,
        item.checkkiemtra,
        item.ckecknhapga,
        item.checktra,
        item.checkpending,
        item.checkTncc,
        item.tong,
        item.chenhlech,
        item.tenLoaihang,
      ];
      let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
      headerRowIndex.font = { name: "Times New Roman", size: 11 };
      dataHeaderRowIndex.forEach((item, index) => {
        headerRowIndex.getCell(index + 1).border = {
          left: { style: "thin" },
          top: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        headerRowIndex.getCell(index + 1).alignment = {
          vertical: "top",
          horizontal: "center",
          wrapText: true,
        };
      });
    });

    worksheet.addRow([]);
    let dataFooterRow = ["", "Người lập", "", "", "", "", "", "", "Kết toán"];
    let footerHd = worksheet.addRow(dataFooterRow);
    footerHd.font = { name: "Times New Roman", size: 12 };
    dataFooterRow.forEach((item, index) => {
      footerHd.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      footerHd.getCell(index + 1).alignment = {
        vertical: "top",
        horizontal: "center",
        wrapText: true,
      };
    });

    let dataFooterRow1 = [
      "",
      "(Ký, ghi rõ họ tên)",
      "",
      "",
      "",
      "",
      "",
      "",
      "(Ký, ghi rõ họ tên)",
    ];
    let footerHd1 = worksheet.addRow(dataFooterRow1);
    footerHd1.font = { name: "Times New Roman", size: 11 };
    dataFooterRow1.forEach((item, index) => {
      footerHd1.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      footerHd1.getCell(index + 1).alignment = {
        vertical: "top",
        horizontal: "center",
        wrapText: true,
      };
    });
    worksheet.mergeCells(`B${footerHd.number}:D${footerHd.number}`);
    worksheet.mergeCells(`I${footerHd.number}:J${footerHd.number}`);
    worksheet.mergeCells(`B${footerHd1.number}:D${footerHd1.number}`);
    worksheet.mergeCells(`I${footerHd1.number}:J${footerHd1.number}`);

    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 25;
    worksheet.getColumn(6).width = 25;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(8).width = 25;
    worksheet.getColumn(9).width = 25;
    worksheet.getColumn(10).width = 25;
    worksheet.getColumn(11).width = 25;
    worksheet.getColumn(12).width = 25;
    worksheet.getColumn(13).width = 25;
    worksheet.getColumn(14).width = 25;
    worksheet.getColumn(15).width = 25;
    worksheet.getColumn(16).width = 25;
    worksheet.getColumn(17).width = 25;
    worksheet.getColumn(18).width = 25;

    this.exportToExel(workbook, title);
    this.loading = false;
    this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
  }

  buildData(list: Array<any>) {
    this.cols = [];
    this.frozenCols = [];

    this.listDetailTable = [];
    if (list.length) {
      list[0].forEach(item => {
        if (item.isShow) {
          let col = {
            field: item.columnKey,
            header: item.columnKey,
            width: item.width,
            textAlign: item.textAlign
          };
          if (item.columnKey == 'stt' || item.columnKey == 'name' || item.columnKey == 'code') {
            this.frozenCols.push(col);
          } else {
            this.cols.push(col);
          }
        }
      });

      list.forEach(row => {
        let dataRow = {};
        row.forEach(item => {
          //Nếu là number
          if (item.valueType == 1) {
            dataRow[item.columnKey] = item.columnValue;//this.commonService.convertStringToNumber(item.columnValue);
          }
          else {
            dataRow[item.columnKey] = item.columnValue;
          }
        });

        this.listDetailTable = [...this.listDetailTable, dataRow];
      });
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs.saveAs(blob, fileName);
    });
  }

  importExcel() {}

  capnhatdulieu() {
    this.loading = true;
    this.mappingListData();
    this.assetService
      .dotKiemKeDetail(this.dotKiemKeId, this.warehouseId, true)
      .subscribe((response) => {
        var result = <any>response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.dotKiemKeModel = result.dotKiemKe;
          this.trangThaiId = this.dotKiemKeModel.trangThaiId;
          this.listDetail = result.listDotKiemKeChiTiet;
        }
      });
  }
  tinhTong() {
    debugger
    this.listDetailTable.forEach((i) => {
      i.index_13 =
        ParseStringToFloat(i.index$_8) +
        ParseStringToFloat(i.index$_9) +
        ParseStringToFloat(i.index$_10) +
        ParseStringToFloat(i.index$_11) +
        ParseStringToFloat(i.index$_12);
      i.index_14 = parseFloat(i.index_13) - parseFloat(i.index_7);
    });
  }
  async getMasterData() {
    this.loading = true;
    this.assetService
      .dotKiemKeDetail(this.dotKiemKeId, this.warehouseId, false)
      .subscribe((response) => {
        var result = <any>response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.dotKiemKeModel = result.dotKiemKe;
          this.trangThaiId = this.dotKiemKeModel.trangThaiId;
          this.listDetail = result.listDotKiemKeChiTiet;

          this.trRow = result.listDataHeader;
          this.buildData(result.listData);
          //this.mappingListData();
        }
      });
  }

  mappingListData() {
    this.listDetail.forEach(item => {
      var data = this.listDetailTable.find(t => t.index_1 == item.productCode);
      if (data != null && data != undefined) {
        item.checkkiemtra = data.index$_8;
        item.ckecknhapga = data.index$_9;
        item.checktra = data.index$_10;
        item.checkpending = data.index$_11;
        item.checkTncc = data.index$_12;
        item.note = data.indexNote_16;
        item.tong = data.index_13;
        item.chenhlech = data.index_14;
      }
    });


    console.log(this.listDetail)
    console.log(this.listDetailTable)
  }

  thoat() {
    this.router.navigate(["/warehouse/kiem-ke-kho/list"]);
  }

  luu() {
    this.mappingListData();

    this.assetService
      .updateDotKiemKeDetail(this.listDetail)
      .subscribe((response) => {
        var result = <any>response;
        if (result.statusCode == 200) {
          let mgs = {
            severity: "success",
            summary: "Thông báo:",
            detail: result.message,
          };
          this.showMessage(mgs);
          this.getMasterData();
        } else {
          let mgs = {
            severity: "error",
            summary: "Thông báo:",
            detail: result.message,
          };
          this.showMessage(mgs);
        }
      });
  }
  hoanthanh() {
    this.assetService
      .changeTrangThaiDotKiemKe(this.dotKiemKeId)
      .subscribe((response) => {
        var result = <any>response;
        if (result.statusCode == 200) {
          let mgs = {
            severity: "success",
            summary: "Thông báo:",
            detail: result.message,
          };
          this.showMessage(mgs);
          this.getMasterData();
        } else {
          let mgs = {
            severity: "error",
            summary: "Thông báo:",
            detail: result.message,
          };
          this.showMessage(mgs);
        }
      });
  }
  showLotLoNhap(data) {
    this.showDetailLotNoNhap = true;
    this.isClickSave = false;
    // this.tenNVLNhap = data.productName;
    // this.soluongCanNhap = data.soLuongCanNhap;
    // this.soluongCanNhapConLai = 0;
    // this.currentProductCodeUpdate = data.productCode;
    this.selectedItemPhieuCanBangNhap = data;
    if (this.selectedItemPhieuCanBangNhap.soLuongConLai == null || this.selectedItemPhieuCanBangNhap.soLuongConLai == undefined) {
      this.selectedItemPhieuCanBangNhap.soLuongConLai = this.selectedItemPhieuCanBangNhap.soLuongCanNhap;
    }
    // this.listDetailLotNoDialogNhap = [];
  }
  showLotLoXuat(data) {
    this.showDetailLotNoXuat = true;
    this.isClickSave = false;
    // this.tenNVLXuat = data.productName;
    // this.soluongCanXuat = data.soLuongCanXuat;
    // this.soluongCanXuatConLai = 0;
    this.selectedItemPhieuCanBangXuat = data;
    if (this.selectedItemPhieuCanBangXuat.soLuongConLai == null || this.selectedItemPhieuCanBangXuat.soLuongConLai == undefined) {
      this.selectedItemPhieuCanBangXuat.soLuongConLai = this.selectedItemPhieuCanBangXuat.soLuongCanXuat;
    }
  }
  addItemLotNoNhap() {
    let productLotNoPhieuCanBang: productLotNoPhieuCanBang = {
      productId: this.selectedItemPhieuCanBangNhap.productId,
      lotNoId: "",
      lotNoName: "",
      soLuongTon: 0,
      soLuong: 0,
      thaoTac: null,
    };
    this.selectedItemPhieuCanBangNhap.listProductLotNoPhieuCanBang.push(
      productLotNoPhieuCanBang
    );
  }
  addItemLotNoXuat() {
    let productLotNoPhieuCanBang: productLotNoPhieuCanBang = {
      productId: this.selectedItemPhieuCanBangXuat.productId,
      lotNoId: "",
      lotNoName: "",
      soLuongTon: 0,
      soLuong: 0,
      thaoTac: null,
    };
    this.selectedItemPhieuCanBangXuat.listProductLotNoPhieuCanBang.push(
      productLotNoPhieuCanBang
    );
  }
  deleteItemLotNoNhap(rowData) {
    var removeItem = this.selectedItemPhieuCanBangNhap.listProductLotNoPhieuCanBang.indexOf(rowData);
    if (removeItem > -1) {
      this.selectedItemPhieuCanBangNhap.soLuongConLai += parseFloat(rowData.soLuong);
      this.selectedItemPhieuCanBangNhap.listProductLotNoPhieuCanBang.splice(removeItem, 1);
    }
  }

  saveDialogLotNoNhap() {
    this.isClickSave = true;
    if (this.selectedItemPhieuCanBangNhap.soLuongConLai == 0) {
      this.selectedItemPhieuCanBangNhap.trangThaiName = "Đã cập nhật Lot.No";


      // this.listPhieuCanBangNhap.forEach(i=>{
      //   if(i.productCode == this.currentProductCodeUpdate)
      //   {
      //     i.trangThaiName = "Đã cập nhật Lot.No"
      //   }
      // });
      this.showDetailLotNoNhap = false;
    }
  }

  cancelDialogLotNoNhap() {
    // this.selectedItemPhieuCanBangNhap.listProductLotNoPhieuCanBang = [];
    this.showDetailLotNoNhap = false;
  }

  saveDialogLotNoXuat() {
    this.isClickSave = true;
    if (this.selectedItemPhieuCanBangXuat.soLuongConLai == 0) {
      this.selectedItemPhieuCanBangXuat.trangThaiName = "Đã cập nhật Lot.No";
      this.showDetailLotNoXuat = false;
    }
  }
  cancelDialogLotNoXuat() {
    // this.selectedItemPhieuCanBangXuat.listProductLotNoPhieuCanBang = [];
    this.showDetailLotNoXuat = false;
  }
  tinhTongCanNhap() {
    let nhap = 0;
    this.selectedItemPhieuCanBangNhap.listProductLotNoPhieuCanBang.forEach(
      (i) => {
        nhap += ParseStringToFloat(i.soLuong);
      }
    );
    this.selectedItemPhieuCanBangNhap.soLuongConLai =
      this.selectedItemPhieuCanBangNhap.soLuongCanNhap - nhap;
  }
  tinhTongCanXuat() {
    let nhap = 0;
    this.selectedItemPhieuCanBangXuat.listProductLotNoPhieuCanBang.forEach(
      (i) => {
        nhap += ParseStringToFloat(i.soLuong);
      }
    );
    this.selectedItemPhieuCanBangXuat.soLuongConLai =
      this.selectedItemPhieuCanBangXuat.soLuongCanXuat - nhap;
  }

  huyTaoPhieuCanBangXuat() {
    this.showCanBangDialog = false;
  }
  taoPhieuCanBangXuat() {
    this.mappingListData();

    this.checkStatus = null;
    this.listPhieuCanBangXuat.forEach(item => {
      if (!this.checkStatus) {
        if (item.trangThaiName == 'Chưa cập nhật Lot.No') {
          this.checkStatus = false;
        }
        if (item.trangThaiName == 'Đã cập nhật Lot.No') {
          this.checkStatus = true;
        }
      }
    })

    if (this.checkStatus) {
      this.assetService
        .taoPhieuXuatCanBangKho(this.warehouseId, this.listPhieuCanBangXuat)
        .subscribe((response) => {
          var result = <any>response;
          if (result.statusCode == 200) {
            let mgs = {
              severity: "success",
              summary: "Thông báo:",
              detail: result.message,
            };
            // this.showMessage(mgs);
            // this.getMasterData();

            this.loading = true;
            //lam moi danh sach kiem ke
            this.assetService
              .dotKiemKeDetail(this.dotKiemKeId, this.warehouseId, false)
              .subscribe((response) => {
                var result = <any>response;
                this.loading = false;
                if (result.statusCode == 200) {
                  this.dotKiemKeModel = result.dotKiemKe;
                  this.trangThaiId = this.dotKiemKeModel.trangThaiId;
                  this.listDetail = result.listDotKiemKeChiTiet;
                }
              });

            this.showCanBangDialog = false;
          } else {
            let mgs = {
              severity: "error",
              summary: "Thông báo:",
              detail: result.message,
            };
            this.showMessage(mgs);
          }
        });
    }
  }

  taoPhieuCanBangNhap() {
    this.mappingListData();

    this.checkStatus = null;
    this.listPhieuCanBangNhap.forEach(item => {
      if (!this.checkStatus) {
        if (item.trangThaiName == 'Chưa cập nhật Lot.No') {
          this.checkStatus = false;
        }
        if (item.trangThaiName == 'Đã cập nhật Lot.No') {
          this.checkStatus = true;
        }
      }
    })

    if (this.checkStatus) {
      this.assetService
        .taoPhieuNhapCanBangKho(this.warehouseId, this.listPhieuCanBangNhap)
        .subscribe((response) => {
          var result = <any>response;
          if (result.statusCode == 200) {
            let mgs = {
              severity: "success",
              summary: "Thông báo:",
              detail: result.message,
            };
            // this.showMessage(mgs);
            // this.getMasterData();

            this.loading = true;
            //lam moi danh sach kiem ke
            this.assetService
              .dotKiemKeDetail(this.dotKiemKeId, this.warehouseId, false)
              .subscribe((response) => {
                var result = <any>response;
                this.loading = false;
                if (result.statusCode == 200) {
                  this.dotKiemKeModel = result.dotKiemKe;
                  this.trangThaiId = this.dotKiemKeModel.trangThaiId;
                  this.listDetail = result.listDotKiemKeChiTiet;
                }
              });

            this.showCanBangDialog = false;
          } else {
            let mgs = {
              severity: "error",
              summary: "Thông báo:",
              detail: result.message,
            };
            this.showMessage(mgs);
          }
        });
    }
  }
  huyTaoPhieuCanNhap() {
    this.showCanBangDialog = false;
  }
  onChangeTabView(e) {
    this.checkStatus = null;
  }
}

function convertDate(time: any) {
  let ngay = time.getDate()
  let thang = time.getMonth() + 1
  let nam = time.getFullYear()
  return `${ngay}/${thang}/${nam}`
};

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
