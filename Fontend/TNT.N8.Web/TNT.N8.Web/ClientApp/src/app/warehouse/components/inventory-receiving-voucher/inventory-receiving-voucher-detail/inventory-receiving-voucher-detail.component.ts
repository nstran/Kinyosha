import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import * as $ from 'jquery';
import { WarehouseService } from '../../../services/warehouse.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { SanPhamPhieuNhapKhoModel } from '../../../models/sanPhamPhieuNhapKhoModel.model';
import { InventoryReceivingVoucherModel } from '../../../models/InventoryReceivingVoucher.model';
import { InventoryReceivingVoucherMapping } from '../../../models/inventoryReceivingVoucherMapping.model';
import { TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { FileUpload } from 'primeng/fileupload';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';
import { TranslateService } from '@ngx-translate/core';
import { ImageUploadService } from '../../../../shared/services/imageupload.service';
import { NoteService } from '../../../../shared/services/note.service';
import { ForderConfigurationService } from '../../../../admin/components/folder-configuration/services/folder-configuration.service';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { AssetService } from '../../../../asset/services/asset.service';

class LoaiPhieuNhap {
  name: string;
  type: number;
}

class SanPhamPhieuNhapKhoModel {
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityActual: any;
  productName: any;
  unitName: any;
  listChiTietLotNo: Array<ChiTietLotNo>
}

class ChiTietLotNo {
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityActual: any;
  productName: any;
  description: any;
  unitName: any;
  packagingStatus: any;
  productStatus: any;
  lotNoName: any;
  lotNoId: any;
}


class DataMaping {
  inventoryReceivingVoucherMappingId: string
  inventoryReceivingVoucherId: string
  productCode: string
  productId: string;
  description: string;
  unitId: string;
  lotNoName: string;
  lotNoId: number;
  packagingStatus: boolean;
  productStatus: boolean;
  quantityActual: number;
  WarehouseId: string
}

class Vendor {
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  vendorCodeName: string;
}

class Warehouse {
  warehouseId: string;
  warehouseParent: string;
  hasChild: boolean;
  warehouseCode: string;
  warehouseName: string;
  warehouseCodeName: string;
}

class Customer {
  customerId: string;
  customerName: string;
  customerCode: string;
  customerCodeName: string;
}

class VendorOrder {
  vendorOrderId: string;
  vendorOrderCode: string;
  vendorDescripton: string;
}

class Product {
  productId: string;
  productName: string;
  productCode: string;
  productCodeName: string;
  productUnitName: string;
}


/*Ghi chu*/
class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}
class FileInFolder {
  fileInFolderId: string;
  folderId: string;
  fileName: string;
  objectId: string;
  objectType: string;
  size: string;
  active: boolean;
  fileExtension: string;
  createdById: string;
  createdDate: Date;
  uploadByName: string;
}
class NoteModel {
  NoteId: string;
  NoteTitle: string;
  Description: string;
  Type: string;
  ObjectId: string;
  ObjectType: string;
  Active: Boolean;
  CreatedById: string;
  CreatedDate: Date;
  UpdatedById: string;
  UpdatedDate: Date;
}
/* Begin: Ghi chú */
interface NoteDocument {
  active: boolean;
  base64Url: string;
  createdById: string;
  createdDate: Date;
  documentName: string;
  documentSize: string;
  documentUrl: string;
  noteDocumentId: string;
  noteId: string;
  updatedById: string;
  updatedDate: Date;
}
interface Note {
  active: boolean;
  createdById: string;
  createdDate: Date;
  description: string;
  noteDocList: Array<NoteDocument>;
  listFile: Array<FileInFolder>
  noteId: string;
  noteTitle: string;
  objectId: string;
  objectType: string;
  responsibleAvatar: string;
  responsibleName: string;
  type: string;
  updatedById: string;
  updatedDate: Date;
}

@Component({
  selector: "app-inventory-receiving-voucher-detail",
  templateUrl: "./inventory-receiving-voucher-detail.component.html",
  styleUrls: ["./inventory-receiving-voucher-detail.component.css"],
  providers: [AssetService],
})
export class InventoryReceivingVoucherDetailComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false;
  awaitResultLuu: boolean = false;

  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  defaultNumberType = this.getDefaultNumberType();
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );

  totalRecordsNote: number;
  isGlobalFilter: any = "";

  /* Cố định thanh chứa button đầu trang */
  fixed: boolean = false;
  isShow: boolean = true;
  colLeft: number = 8;
  withFiexd: string = "";
  withFiexdCol: string = "";
  withColCN: number = 0;
  withCol: number = 0;
  @HostListener("document:scroll", [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $("#parent").width();
      this.withFiexd = width + "px";
      var colT = 0;
      if (this.withColCN != width) {
        colT = this.withColCN - width;
        this.withColCN = width;
        this.withCol = $("#parentTH").width();
      }
      this.withFiexdCol = this.withCol + "px";
    } else {
      this.fixed = false;
      this.withFiexd = "";
      this.withCol = $("#parentTH").width();
      this.withColCN = $("#parent").width();
      this.withFiexdCol = "";
    }
  }
  /* End */

  /* Upload File */
  @ViewChild("fileNoteUpload", { static: true }) fileNoteUpload: FileUpload;
  defaultLimitedFileSize =
    Number(
      this.systemParameterList.find(
        (systemParameter) => systemParameter.systemKey == "LimitedFileSize"
      ).systemValueString
    ) *
    1024 *
    1024;
  strAcceptFile: string =
    "image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt";
  uploadedFiles: any[] = [];
  colsFile: any;
  listFileUpload: Array<any> = [];
  listUpdateFileNote: Array<FileInFolder> = [];
  colsNoteFile: Array<any> = [];
  noteHistory: Array<Note> = [];

  disableView: boolean = true;

  isEditNote: boolean = false;
  noteControl: string;

  messageConfirm: string = "";
  messageTitle: string = "";
  messageError: string = "";

  noteId: string = null;

  actionAdd: boolean = true;
  actionDelete: boolean = true;
  actionWarehouse: boolean = true;
  actionDowload: boolean = true;
  actionPrint: boolean = true;
  actionEditComplete: boolean = true;
  /* End */

  @ViewChild("myTable") myTable: Table;
  filterGlobal: string = "";

  /* Valid Form */
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild("toggleButton") toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild("notifi") notifi: ElementRef;
  @ViewChild("saveAndCreate") saveAndCreate: ElementRef;
  @ViewChild("save") save: ElementRef;
  /* End */

  colsDonHangMua: any;
  colsPhieuXuatKho: any;
  colsKiemKe: any;
  colsDieuChuyen: any;
  colsNhapKhac: any;

  listItemDetail: Array<SanPhamPhieuNhapKhoModel> = [];
  selectedIndex: number = null;

  /*Danh sach nguyen vat lieu*/
  colsGroupVatLieu: any;
  colsChiTietVatLieu: any;
  listItemGroup: Array<SanPhamPhieuNhapKhoModel> = [];

  listChiTietLotNo: Array<ChiTietLotNo> = [];
  listLotNo: any = [];

  listDotKiemKe: Array<any> = [];

  productGroup: FormGroup;
  donViTinh: any = "";
  productName: any = "";
  productSelected: Array<any> = [];
  listProduct: any = [];
  showDetailDialog: boolean = false;
  isDisableMultiSelect = false;

  /*Dữ liệu*/
  listCurrentChips: Array<string> = [];
  listVendor: Array<Vendor> = [];
  listWarehouse: Array<Warehouse> = [];
  listCustomer: Array<Customer> = [];
  listVendorOrder: Array<VendorOrder> = [];
  employeeCodeName: string = null;
  createdDate: Date = new Date(); //Ngày lập phiếu
  totalQuantityActual: number = 0; //Tổng số lượng thực nhập
  /*End*/

  createForm: FormGroup;
  loaiPhieuNhapControl: FormControl;
  doiTacControl: FormControl;
  khoControl: FormControl;
  donHangMuaControl: FormControl;
  phieuXuatKhoChipsControl: FormControl;
  phieuKiemKeControl: FormControl;
  expectedDateControl: FormControl;
  inventoryReceivingVoucherDateControl: FormControl;
  shiperNameControl: FormControl;
  descriptionControl: FormControl;
  licenseNumberControl: FormControl;
  productControl: FormControl;

  dataDNXK: any;

  /*Popup Kho list Kho con*/
  choiceKho: boolean = false;
  listDetailWarehouse: TreeNode[];
  selectedWarehouseChilren: TreeNode;
  /*End*/

  vtNhapKho: boolean = false;
  colVTNhapKho: any;

  listdataDiaglog: any;

  colThungVo: any;
  listDataThungVo: any;

  //data master
  khoNhanList: any = [
    { key: 1, name: "Kho 1" },
    { key: 2, name: "Kho 2" },
    { key: 3, name: "Kho 3" },
    { key: 4, name: "Kho 4" },
  ];
  selectKhoNhan: any;
  userName: any;
  department: any;
  ngayHienTai: any;
  val1: boolean = false;
  val2: boolean = false;
  val3: boolean = false;
  val4: boolean = false;
  deNghi: number = 0;

  listData: Array<any> = [];
  listDataLuu: Array<DataMaping> = [];

  dateNgay: Date = new Date();
  dateTuNgay: Date;
  dateDenNgay: Date;
  dateThang: Date;

  deNghiXuatKho: boolean = false;
  colsDeNghiXuat: Array<any> = [];

  tinhTrangBB: 1;
  tinhTrangNVL: 1;
  listDataDialog: Array<any> = [];
  tongTonKho: number = 0;
  tongSoLuongDeNghi: number = 0;

  listProductDeliveryEntityModel: any;
  soLuongTon: any = "";
  selectVatTu: any;
  selectLotNo: any;
  listVatTu: any;

  //khai báo thông tin chung
  loaiPhieu: number;
  tenNhaCungCap: any;
  tenNhaSanXuat: string;
  soDonHang: number;
  ngayDatHang: Date;
  daiDienGiaoHang: string;
  soHoaDon: number;
  ngay: Date;
  vatTu: FormGroup;
  vatTuControl: FormControl;
  listVatTuCheck: Array<any> = [];

  ngayNhap: FormControl;
  inventoryReceivingVoucherId: any;
  phieuNhapKho: any;
  listItem: Array<any> = [];
  itemShow: any;
  ListLotNoMap: Array<any> = [];
  checkEdit: boolean = false;
  status: number = 1;

  showsuakiemke: boolean = true;
  showluukiemke: boolean = false;

  maCode: string;
  loaiVL: number;

  listDataVendor: Array<any> = [];
  listKiemKe: any = [];

  minDate: Date;

  constructor(
    private folderService: ForderConfigurationService,
    private noteService: NoteService,
    private translate: TranslateService,
    private imageService: ImageUploadService,
    private getPermission: GetPermission,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
    private _warehouseService: WarehouseService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService,
    private el: ElementRef,
    private assetService: AssetService
  ) {
    this.route.params.subscribe((params) => {
      if (params["inventoryReceivingVoucherId"]) {
        this.inventoryReceivingVoucherId =
          params["inventoryReceivingVoucherId"];
      }
      if (params["loaiVL"]) {
        this.loaiVL = ParseStringToFloat(params["loaiVL"]);
      }
    });

    this.renderer.listen("window", "click", (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (this.saveAndCreate) {
          if (
            !this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target) &&
            !this.saveAndCreate.nativeElement.contains(e.target)
          ) {
            this.isOpenNotifiError = false;
          }
        } else {
          if (
            !this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target)
          ) {
            this.isOpenNotifiError = false;
          }
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm();
    this.ngayHienTai = formatDatetime(new Date());
    let resource = "war/warehouse/inventory-receiving-voucher/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("warehouse") == -1) {
        this.actionWarehouse = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDowload = false;
      }
      if (listCurrentActionResource.indexOf("print") == -1) {
        this.actionPrint = false;
      }
      if (listCurrentActionResource.indexOf("edit-complete") == -1) {
        this.actionEditComplete = false;
      }
    }

    this.initTable();
    this.getMasterData(true);
  }

  initTable() {
    this.colsGroupVatLieu = [
      {
        field: "stt",
        header: "STT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "productName",
        header: "Tên hàng hóa vật tư",
        width: "150px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "unitName",
        header: "Đơn vị tính",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityActual",
        header: "Số lượng",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colsChiTietVatLieu = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityActual",
        header: "Số lượng nhập",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "packagingStatus",
        header: "Tình trạng bao bì",
        width: "150px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "productStatus",
        header: "Tình trạng NVL",
        width: "200px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "description",
        header: "Diễn giải",
        width: "120px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "TT",
        header: "Thao tác",
        width: "70px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];
    this.colsNoteFile = [
      {
        field: "fileName",
        header: "Tên tài liệu",
        width: "50%",
        textAlign: "left",
      },
      { field: "size", header: "Kích thước", width: "50%", textAlign: "left" },
      {
        field: "createdDate",
        header: "Ngày tạo",
        width: "50%",
        textAlign: "left",
      },
    ];
    this.colsDonHangMua = [
      {
        field: "stt",
        header: "STT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "tenVatTu",
        header: "Tên hàng hóa vật tư",
        width: "150px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "donViTinh",
        header: "Đơn vị tính",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuong",
        header: "Số lượng",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colsDeNghiXuat = [
      {
        field: "lotNo",
        header: "Lot.No",
        width: "120px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "tonKho",
        header: "Tên hàng hóa vật tư",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuongDeNghi",
        header: "Số lượng đề nghị",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "ghiChu",
        header: "Ghi chú",
        width: "120px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "100px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.dataDNXK = [
      {
        STT: 1,
        productCode: "HC-600-10MB",
        description: "kg",
        unitName: "20.50",
        warehouseCodeName: "Đề nghị xuất kho này",
      },
    ];

    this.colsPhieuXuatKho = [
      {
        field: "orderCode",
        header: "Phiếu xuất kho",
        width: "150px",
        textAlign: "left",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "productCode",
        header: "Mã SP",
        width: "150px",
        textAlign: "left",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "description",
        header: "Diễn giải",
        width: "190px",
        textAlign: "left",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "unitName",
        header: "ĐV",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "warehouseCodeName",
        header: "Vị trí",
        width: "190px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityRequest",
        header: "SL cần nhập",
        width: "120px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityReservation",
        header: "Giữ trước",
        width: "120px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityActual",
        header: "SL thực nhập",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "averagePrice",
        header: "Giá trung bình",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "priceProduct",
        header: "Giá nhập",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "amount",
        header: "Thành tiền",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colVTNhapKho = [
      {
        field: "LotNo",
        header: "Lot.No",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "SLN",
        header: "Số lượng nhập",
        width: "80px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "TTBB",
        header: "Tình trạng bao bì",
        width: "150px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "TTNVL",
        header: "Tình trạng NVL",
        width: "200px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "DG",
        header: "Diễn giải",
        width: "120px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "TT",
        header: "Thao tác",
        width: "70px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.vatTuControl = new FormControl(null, [Validators.required]);
    this.vatTu = new FormGroup({
      vatTuControl: this.vatTuControl,
    });
  }

  themNVL(data) {
    this.listDataDialog = [];
    this.vatTu.reset();
    this.donViTinh = "";
    if (this.listData.length > 0) {
      this.listData.forEach((i) => {
        this.listVatTu = this.listVatTuCheck.filter(
          (x) => x.productName != i.tenVatTu
        );
      });
    }

    if (data != 0) {
      this.checkEdit = true;
      this.listDataLuu.forEach((x) => {
        if (x.productId == data.vatTuId) {
          this.ListLotNoMap = this.listVatTuCheck.filter(
            (y) => y.productId == x.productId
          )[0].listProductLotNoMapping;
          let data = {
            inventoryReceivingVoucherMappingId:
              x.inventoryReceivingVoucherMappingId
                ? x.inventoryReceivingVoucherMappingId
                : this.emptyGuid,
            inventoryReceivingVoucherId: x.inventoryReceivingVoucherId
              ? x.inventoryReceivingVoucherId
              : this.emptyGuid,
            DG: x.description,
            lotNoId: x.lotNoId ? x.lotNoId : null,
            LotNo: x.lotNoName, //this.ListLotNoMap.find((i) => i.lotNoId == x.lotNoId), // this.listVatTuCheck.filter(y => y.productId == this.listDataDialog[0].productId).listProductLotNoMapping
            TTBB: x.packagingStatus == true ? 1 : 2,
            TTNVL: x.productStatus == true ? 1 : 2,
            productCode: x.productCode,
            productId: x.productId,
            SLN: x.quantityActual,
          };
          this.listDataDialog.push(data);
          this.listVatTu = this.listVatTuCheck;
          this.vatTuControl.setValue(
            this.listVatTuCheck.find((z) => z.productId == x.productId)
          );
          this.donViTinh = this.vatTuControl.value.productUnitName;

          // this.vatTuControl.disable()
        }
      });
    } else {
      this.vatTuControl.reset();
      this.checkEdit = false;
    }

    this.vtNhapKho = true;
  }

  changeLotNo(data, i) {}

  setForm() {
    this.loaiPhieuNhapControl = new FormControl(null);
    this.doiTacControl = new FormControl(null, [Validators.required]);
    this.khoControl = new FormControl(null, [Validators.required]);
    this.donHangMuaControl = new FormControl({ value: null, disabled: true }, [
      Validators.required,
    ]);
    this.phieuXuatKhoChipsControl = new FormControl(null);
    this.phieuKiemKeControl = new FormControl(null);
    this.expectedDateControl = new FormControl(null, [Validators.required]);
    this.inventoryReceivingVoucherDateControl = new FormControl(null, [
      Validators.required,
    ]);
    this.shiperNameControl = new FormControl(null);
    this.descriptionControl = new FormControl(null);
    this.licenseNumberControl = new FormControl("0");
    // this.noteControl = new FormControl(null);
    this.productControl = new FormControl(null);

    this.ngayNhap = new FormControl(null, [Validators.required]);
    this.createForm = new FormGroup({
      ngayNhap: this.ngayNhap,
    });
    //set kho nhận
    // if (this.khoNhanList.length > 0) this.selectKhoNhan = this.khoNhanList[0];
  }

  suaKiemKe() {
    let month =
      new Date(this.phieuNhapKho.inventoryReceivingVoucherDate).getMonth() + 1;
    let year = new Date(
      this.phieuNhapKho.inventoryReceivingVoucherDate
    ).getFullYear();

    // if (this.status == 1) {
    this.listKiemKe.forEach((element) => {
      let monthkiemke = new Date(element.thangKiemKe).getMonth() + 1;
      let yearkiemke = new Date(element.thangKiemKe).getFullYear();
      if (
        month == monthkiemke &&
        year == yearkiemke &&
        element.warehouseId == this.phieuNhapKho.warehouseId
      ) {
        this.showsuakiemke = true;
        this.showluukiemke = false;
        // this.showluukiemke = true;
        // this.showsuakiemke = false;
        this.showToast(
          "error",
          "Thông báo: ",
          "Phiếu nhập này thuộc đợt kiểm kê đã hoàn thành nên không thể sửa được dữ liệu"
        );
      } else if (
        month != monthkiemke ||
        year != yearkiemke ||
        element.warehouseId != this.phieuNhapKho.warehouseId
      ) {
        this.showsuakiemke = false;
        this.showluukiemke = true;
        this.disableView = false;
        //this.luuKiemKe();
      }
    });
  }

  luuKiemKe() {
    this.showsuakiemke = false;
    this.loading = true;
    // call API
    this.taoPhieuNhapKho(true);
    this.loading = false;
  }

  refreshFilter() {}

  showFilter() {}

  async getMasterData(mode: any) {
    this.loading = true;
    let [result, result1]: any = await Promise.all([
      this._warehouseService.getDetailPhieuNhapKhoNVLCCDCAsync(
        this.loaiVL,
        this.inventoryReceivingVoucherId
      ),
      this._warehouseService.getVendorAsync(),
    ]);
    if (result.statusCode == 200 && result1.statusCode == 200) {
      this.listWarehouse = result.listWarehouse;
      this.listProduct = result.listProduct;

      /*Không cập nhật lại nếu chọn nhập kho*/
      if (mode) {
        result.listItemGroup.forEach((element) => {
          let itemGroup: SanPhamPhieuNhapKhoModel = {
            inventoryReceivingVoucherMappingId: this.emptyGuid,
            inventoryReceivingVoucherId: this.emptyGuid,
            productId: element.productId,
            quantityActual: element.quantityActual,
            productName: element.productName,
            unitName: element.unitName,
            listChiTietLotNo: [],
          };
          this.listItemGroup.push(itemGroup);
        });

        result.listItemDetail.forEach((element) => {
          // this.listItemGroup.find((i)=>i.productId == element.productId).listChiTietLotNo.push(element);
          let lotno: ChiTietLotNo = {
            inventoryReceivingVoucherMappingId: this.emptyGuid,
            inventoryReceivingVoucherId: this.emptyGuid,
            productId: element.productId,
            lotNoName: element.lotNoName,
            lotNoId: element.lotNoId,
            productName: element.productName,
            quantityActual: element.quantityActual,
            packagingStatus: element.packagingStatus,
            productStatus: element.productStatus,
            description: element.description,
            unitName: element.unitName,
          };

          let productGroup = this.listItemGroup.find(
            (i) => i.productId == element.productId
          );
          productGroup.listChiTietLotNo.push(lotno);
        });
      }

      this.listVatTuCheck = result.listProduct;
      this.phieuNhapKho = result.phieuNhapKho;
      this.status = result.phieuNhapKho.intStatus;
      this.listItem = result.listItemDetail;
      this.listDataLuu = result.listItemDetail;

      this.listDataVendor = result1.vendorList;
      this.listKiemKe = result.listDotKiemKe;

      if (this.status == 1) {
      }
      // let month =
      //   new Date(this.phieuNhapKho.inventoryReceivingVoucherDate).getMonth() +
      //   1;
      // let year = new Date(
      //   this.phieuNhapKho.inventoryReceivingVoucherDate
      // ).getFullYear();

      // if (this.status == 1) {
      //   this.listKiemKe.forEach((element) => {
      //     let monthkiemke = new Date(element.thangKiemKe).getMonth() + 1;
      //     let yearkiemke = new Date(element.thangKiemKe).getFullYear();
      //     if (
      //       month == monthkiemke &&
      //       year == yearkiemke &&
      //       element.warehouseId == this.phieuNhapKho.warehouseId
      //     )
      //       this.showsuakiemke = false;
      //   });
      // }

      this.setDefaultValue();
      this.loading = false;
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: result.messageCode,
      };
      this.showMessage(msg);
    }
  }

  setDefaultValue() {
    this.loaiPhieu = this.phieuNhapKho.inventoryReceivingVoucherType;
    this.maCode = this.phieuNhapKho.inventoryReceivingVoucherCode;
    this.userName = this.phieuNhapKho.employeeCodeName;
    this.ngayHienTai = formatDatetime(new Date(this.phieuNhapKho.createdDate));
    this.department = this.phieuNhapKho.employeeDepartment;

    this.selectKhoNhan = this.listWarehouse.find(
      (x) => x.warehouseId == this.phieuNhapKho.warehouseId
    );

    this.tenNhaCungCap = this.listDataVendor.find(
      (x) => x.vendorId == this.phieuNhapKho.vendorId
    );

    this.tenNhaSanXuat = this.phieuNhapKho.producerName;
    this.ngayNhap.setValue(
      new Date(this.phieuNhapKho.inventoryReceivingVoucherDate)
    );
    this.noteControl = this.phieuNhapKho.note;
    this.soDonHang = this.phieuNhapKho.invoiceNumber;
    this.soHoaDon = this.phieuNhapKho.orderNumber;
    this.ngayDatHang = this.phieuNhapKho.orderDate
      ? new Date(this.phieuNhapKho.orderDate)
      : null;
    this.daiDienGiaoHang = this.phieuNhapKho.shiperName;
    this.ngay = this.phieuNhapKho.invoiceDate
      ? new Date(this.phieuNhapKho.invoiceDate)
      : null;

    this.onChangeWarehouse();
  }

  /*Thay đổi phiếu kiểm kê*/
  changePhieuKiemKe() {}

  onViewDetail(data: any) {}

  list_to_tree(listWarehouse: Array<Warehouse>, selectedId: string) {
    let list: Array<TreeNode> = [];
    listWarehouse.forEach((item) => {
      let node: TreeNode = {
        label: item.warehouseCodeName,
        expanded: true,
        expandedIcon: "",
        collapsedIcon: "",
        data: {
          warehouseId: item.warehouseId,
          warehouseParent: item.warehouseParent,
          hasChild: item.hasChild,
        },
        children: [],
      };

      list = [...list, node];
    });

    var map = {},
      node,
      roots = [],
      i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].data.warehouseId] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.data.warehouseParent !== null) {
        // if you have dangling branches check that map[node.parentId] exists
        list[map[node.data.warehouseParent]].children.push(node);
      } else {
        roots.push(node);
      }

      // Vì selected trong trường hợp này luôn có children = [] nên ta có thể xác định nó tại đây
      if (node.data.warehouseId == selectedId) {
        this.selectedWarehouseChilren = node;
      }
    }
    return roots;
  }

  /*event: khi click vào node (kho)*/
  choiceKhoCon(data: any) {
    if (data.node.children.length != 0) {
      this.selectedWarehouseChilren = null;
    }
  }

  paginate(event) {}

  /*Hủy chọn kho con*/
  cancelSelectedKhoCon() {
    this.selectedIndex = null;
    this.selectedWarehouseChilren = null;
    this.choiceKho = false;
  }

  /*Thay đổi số lượng thực nhập*/
  changeQuantityActual(rowData: SanPhamPhieuNhapKhoModel) {
    if (rowData.quantityActual == "") {
      rowData.quantityActual = "0";
    }

    this.getTotalQuantityActual();
  }

  // /*Thêm sản phẩm*/
  // changeProduct(event: any) {
  //   let warehouse: Warehouse = this.khoControl.value;

  //   if (warehouse) {
  //     let product: Product = event.value;
  //     let total = this.listItemDetail.length;

  //     let newItem = new SanPhamPhieuNhapKhoModel();
  //     newItem.index = total + 1;
  //     newItem.warehouseId = warehouse.warehouseId;
  //     newItem.warehouseName = warehouse.warehouseName;
  //     newItem.warehouseCodeName = warehouse.warehouseCodeName;
  //     newItem.productId = product.productId;
  //     newItem.productCode = product.productCode;
  //     newItem.description = product.productName;
  //     newItem.unitName = product.productUnitName;
  //     newItem.quantityRequest = 0;
  //     newItem.quantityReservation = 0;
  //     newItem.quantityActual = "0";
  //     newItem.priceProduct = "0";
  //     newItem.amount = 0;

  //     this.listItemDetail = [...this.listItemDetail, newItem];

  //     //reset dropdown list
  //     this.productControl.reset();
  //   } else {
  //     let msg = {
  //       severity: "error",
  //       summary: "Thông báo:",
  //       detail: "Chưa chọn kho",
  //     };
  //     this.showMessage(msg);
  //   }
  // }

  /*Thay đổi Số chứng từ gốc kèm theo*/
  changeLicenseNumber() {
    let licenseNumber = this.licenseNumberControl.value;

    if (licenseNumber == "") {
      this.licenseNumberControl.setValue("0");
    }
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  goBack() {
    this.router.navigate(["/warehouse/inventory-receiving-voucher/list"]);
  }

  /*Event Lưu các file được chọn*/
  handleFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= this.defaultLimitedFileSize) {
        if (type.indexOf("/") != -1) {
          type = type.slice(0, type.indexOf("/"));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf("."));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedFiles.push(file);
          }
        }
      }
    }
  }

  /*Event Khi click xóa từng file*/
  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event Khi click xóa toàn bộ file*/
  clearAllFile() {
    this.uploadedFiles = [];
  }

  /*Tạo mới phiếu nhập kho*/
  taoPhieuNhapKho(mode: boolean) {
    if (!this.createForm.valid) {
      Object.keys(this.createForm.controls).forEach((key) => {
        if (this.createForm.controls[key].valid == false) {
          this.createForm.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true; //Hiển thị icon-warning-active
      this.isOpenNotifiError = true; //Hiển thị message lỗi
      this.emitStatusChangeForm = this.createForm.statusChanges.subscribe(
        (validity: string) => {
          switch (validity) {
            case "VALID":
              this.isInvalidForm = false;
              break;
            case "INVALID":
              this.isInvalidForm = true;
              break;
          }
        }
      );
    } else if (this.listItemGroup.length == 0) {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Chưa có sản phẩm",
      };
      this.showMessage(msg);
    } else {
      let inventoryReceivingVoucherModel = this.mapDataToModelPhieuNhapKho();
      let listChiTietLotNo = [];
      this.listItemGroup.forEach((element) => {
        element.listChiTietLotNo.forEach((lotno) => {
          listChiTietLotNo.push(lotno);
        });
      });

      let checkLotNo = listChiTietLotNo.filter(
        (x) => x.lotNoName == null || x.lotNoName == ""
      );
      if (checkLotNo.length > 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Vui lòng nhập LotNo.",
        };
        this.showMessage(msg);
        return;
      }
      let checkSoLuong = listChiTietLotNo.filter((x) => x.quantityActual <= 0);
      if (checkSoLuong.length > 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Số lượng nhập kho phải lớn hơn 0.",
        };
        this.showMessage(msg);
        return;
      }

      const duplicateLotNo = listChiTietLotNo.some((lotno) => {
        let counter = 0;
        for (const iterator of listChiTietLotNo) {
          if (
            iterator.lotNoName === lotno.lotNoName &&
            iterator.productId == lotno.productId
          ) {
            counter += 1;
          }
        }
        return counter > 1;
      });

      if (duplicateLotNo) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "LotNo là trùng lặp.",
        };
        this.showMessage(msg);
        return;
      }

      this._warehouseService
        .updateNhapKho(inventoryReceivingVoucherModel, listChiTietLotNo)
        .subscribe((response) => {
          let result: any = response;

          if (result.statusCode == 200) {
            if (mode) {
              /*Thay đổi trạng thái đã nhập kho*/
              this._warehouseService
                .guiNhapKho(this.inventoryReceivingVoucherId)
                .subscribe((response) => {
                  let result: any = response;
                  if (result.statusCode == 200) {
                    //Lưu và Thêm mới
                    this.resetForm();
                    let msg = {
                      severity: "success",
                      summary: "Thông báo:",
                      detail: "Nhập kho thành công",
                    };
                    this.showMessage(msg);
                    this.getMasterData(false);
                  } else {
                    let msg = {
                      severity: "error",
                      summary: "Thông báo:",
                      detail: result.messageCode,
                    };
                    this.showMessage(msg);
                  }
                });
            } else {
              //Lưu và Thêm mới
              this.resetForm();
              let msg = {
                severity: "success",
                summary: "Thông báo:",
                detail: "Cập nhật thành công",
              };
              this.showMessage(msg);
            }
          } else {
            let msg = {
              severity: "error",
              summary: "Thông báo:",
              detail: result.messageCode,
            };
            this.showMessage(msg);
          }
        });
    }
  }
  mapDataToModelPhieuNhapKho() {
    let inventoryReceivingVoucherModel: InventoryReceivingVoucherModel = {
      CreatedName: this.userName,
      InventoryReceivingVoucherDate: convertToUTCTime(
        new Date(this.ngayNhap.value)
      ),
      InventoryReceivingVoucherType: this.loaiPhieu,
      InventoryReceivingVoucherTypeName:
        this.loaiPhieu == 0 ? "Nhập mới" : "Nhập khác",
      OrderDate: this.ngayDatHang ? new Date(this.ngayDatHang) : null,
      InvoiceDate: this.ngay ? new Date(this.ngay) : null,
      InvoiceNumber: this.soDonHang,
      PartnersName: this.tenNhaCungCap
        ? (this.tenNhaCungCap as any).vendorName
        : null,
      ShiperName: this.daiDienGiaoHang,
      StatusName: "Mới",
      WarehouseCategoryTypeId: (this.selectKhoNhan as any).warehouseId,
      ProducerName: this.tenNhaSanXuat,
      OrderNumber: this.soHoaDon,
      WarehouseId: this.selectKhoNhan.warehouseId,

      InventoryReceivingVoucherId: this.inventoryReceivingVoucherId,
      InventoryReceivingVoucherCode: "",
      StatusId: this.emptyGuid,
      Active: true,
      CreatedDate: null,
      CreatedById: this.emptyGuid,
      UpdatedDate: null,
      UpdatedById: this.emptyGuid,
      Description: "",
      Note: this.noteControl,
      ObjectId: this.emptyGuid,
      Storekeeper: this.emptyGuid,
      InventoryReceivingVoucherTime: null,
      LicenseNumber: 0,
      ExpectedDate: null,
      PartnersId: this.emptyGuid,
      InventoryReceivingVoucherCategory: null,
      VendorId: this.tenNhaCungCap
        ? (this.tenNhaCungCap as any).vendorId
        : this.emptyGuid,

      // thêm thùng vỏ data fake
      BoxGreen: 1,
      BoxGreenMax: 2,
      PalletMax: 3,
      PalletNormal: 4,
      BoxBlue: 5,
      PalletSmall: 6,
    };

    return inventoryReceivingVoucherModel;
  }

  /*Lấy giờ nhập kho*/
  getTimeSpan(date: Date) {
    if (date) {
      let hours = date.getHours().toString();
      let minutes = date.getMinutes().toString();

      return hours + ":" + minutes;
    } else {
      return "00:00";
    }
  }

  resetForm() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
      this.isInvalidForm = false; //Ẩn icon-warning-active
    }
  }

  /*Tính tổng số lượng thực nhập*/
  getTotalQuantityActual() {}

  getDefaultNumberType() {
    return this.systemParameterList.find(
      (systemParameter) => systemParameter.systemKey == "DefaultNumberType"
    ).systemValueString;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 8 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0);
    }
  }

  themDeNghi(data: any) {
    if (data == false) {
      this.deNghiXuatKho = !this.deNghiXuatKho;
    }
  }

  // themMoiDialog() {
  //
  //   if (!this.vatTu.valid) {
  //     Object.keys(this.vatTu.controls).forEach(key => {
  //       if (this.vatTu.controls[key].valid == false) {
  //         this.vatTu.controls[key].markAsTouched();
  //       }
  //     });
  //     return;
  //   }
  //   // if (this.selectVatTu) {
  //   let noiDUngTT = {
  //     LotNo: '',
  //     SLN: 0,
  //     TTBB: 1,
  //     TTNVL: 1,
  //     DG: '',
  //     TT: null,
  //   };
  //   this.listLotNo = this.selectVatTu
  //   this.listDataDialog.push(noiDUngTT);
  //   // this.sapXepPhieuDanhGia();
  //   this.tinhTong()
  //   this.ref.detectChanges();
  // }

  themMoiDialog(data) {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      return;
    }
    if (data == 999) {
      let noiDUngTT = {
        LotNo: "",
        SLN: 0,
        TTBB: 1,
        TTNVL: 1,
        DG: "",
        TT: null,
      };
      this.listLotNo = this.selectVatTu;
      this.listDataDialog.push(noiDUngTT);
      this.tinhTong();
      this.ref.detectChanges();
    } else {
      if (this.listDataDialog.length == data + 1) {
        let noiDUngTT = {
          LotNo: "",
          SLN: 0,
          TTBB: 1,
          TTNVL: 1,
          DG: "",
          TT: null,
        };
        this.listLotNo = this.selectVatTu;
        this.listDataDialog.push(noiDUngTT);
      }
    }
  }

  xoaDeXuat(data) {
    this.listDataDialog = this.listDataDialog.filter((x) => x != data);
    this.tinhTong();
  }

  tinhTong() {
    this.tongTonKho = 0;
    this.tongSoLuongDeNghi = 0;
    this.listDataDialog.forEach((i) => {
      // this.tongTonKho += ParseStringToFloat(i.tonKho)
      this.tongSoLuongDeNghi += ParseStringToFloat(i.SLN);
    });
  }

  xoaNVL(data) {
    this.listData = this.listData.filter((x) => x.tenVatTu != data.tenVatTu);

    let productId = this.listVatTuCheck.filter(
      (i) => i.productName == data.tenVatTu
    )[0].productId;
    this.listDataLuu = this.listDataLuu.filter((x) => x.productId != productId);
  }

  nhapKho() {
    this.taoPhieuNhapKho(true);
  }

  downloadNoteFile(fileInfor: NoteDocument) {
    this.imageService
      .downloadFile(fileInfor.documentName, fileInfor.documentUrl)
      .subscribe((response) => {
        var result = <any>response;
        var binaryString = atob(result.fileAsBase64);
        var fileType = result.fileType;
        var name = fileInfor.documentName;

        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var idx = 0; idx < binaryLen; idx++) {
          var ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        var file = new Blob([bytes], { type: fileType });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        } else {
          var fileURL = URL.createObjectURL(file);
          if (fileType.indexOf("image") !== -1) {
            window.open(fileURL);
          } else {
            var anchor = document.createElement("a");
            anchor.download = name;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      });
  }

  exportExcel() {
    this.loading = true;
    let title = "Phiếu nhập kho nguyên vật liệu";
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);

    let line1 = [
      `Kinyosha Vietnam., Ltd`,
      "",
      "",
      "",
      "",
      "",
      "",
      "KIS V4-A030-01",
    ];
    let lineRow1 = worksheet.addRow(line1);
    worksheet.mergeCells(`A${lineRow1.number}:B${lineRow1.number}`);
    worksheet.mergeCells(`H${lineRow1.number}:J${lineRow1.number}`);
    lineRow1.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow1.getCell(1).font = {
      name: "Times New Roman",
      size: 10,
      bold: true,
    };
    lineRow1.getCell(8).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow1.getCell(8).font = {
      name: "Times New Roman",
      size: 12,
      bold: false,
    };
    lineRow1.height = 20;

    let line2 = [`Công ty TNHH Kinyosha Việt Nam`];
    let lineRow2 = worksheet.addRow(line2);
    worksheet.mergeCells(`A${lineRow2.number}:B${lineRow2.number}`);
    lineRow2.font = { name: "Times New Roman", size: 10, italic: true };
    lineRow2.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow2.height = 30;

    let line3 = ["INVENTORY RECEIVED"];
    let lineRow3 = worksheet.addRow(line3);
    worksheet.mergeCells(`A${lineRow3.number}:J${lineRow3.number}`);
    lineRow3.font = { name: "Times New Roman", size: 15, bold: true };
    lineRow3.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow3.height = 30;

    let line4 = ["PHIẾU NHẬP KHO NVL, CCDC"];
    let lineRow4 = worksheet.addRow(line4);
    worksheet.mergeCells(`A${lineRow4.number}:J${lineRow4.number}`);
    lineRow4.font = { name: "Times New Roman", size: 15, bold: true };
    lineRow4.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow4.height = 20;

    let line5 = [
      `Đại diện bên giao hàng: ` +
        (this.daiDienGiaoHang != null && this.daiDienGiaoHang != undefined
          ? this.daiDienGiaoHang
          : ""),
      "",
      "",
      "",
      "",
      "",
      `Số: ` +
        (this.maCode != null && this.maCode != undefined ? this.maCode : ""),
      "",
      `Ngày: ` +
        (this.ngayHienTai != null && this.ngayHienTai != undefined
          ? this.ngayHienTai
          : ""),
    ];
    let lineRow5 = worksheet.addRow(line5);
    worksheet.mergeCells(`A${lineRow5.number}:D${lineRow5.number}`);
    worksheet.mergeCells(`G${lineRow5.number}:H${lineRow5.number}`);
    worksheet.mergeCells(`I${lineRow5.number}:J${lineRow5.number}`);
    lineRow5.font = { name: "Times New Roman", size: 10, italic: true };
    lineRow5.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow5.getCell(1).font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      bold: true,
    };
    lineRow5.height = 20;

    let line6 = [
      `Tên nhà cung cấp: ` +
        (this.tenNhaCungCap?.vendorName != null &&
        this.tenNhaCungCap?.vendorName != undefined
          ? this.tenNhaCungCap?.vendorName
          : ""),
    ];
    let lineRow6 = worksheet.addRow(line6);
    worksheet.mergeCells(`A${lineRow6.number}:D${lineRow6.number}`);
    lineRow6.font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      bold: true,
    };
    lineRow6.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow6.height = 20;

    let line7 = [
      `Tên nhà sản xuất: ` +
        (this.tenNhaSanXuat != null && this.tenNhaSanXuat != undefined
          ? this.tenNhaSanXuat
          : ""),
    ];
    let lineRow7 = worksheet.addRow(line7);
    worksheet.mergeCells(`A${lineRow7.number}:D${lineRow7.number}`);
    lineRow7.font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      bold: true,
    };
    lineRow7.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow7.height = 20;

    let line8 = [
      `Số đơn đặt hàng: ` +
        (this.soDonHang != null && this.soDonHang != undefined
          ? this.soDonHang
          : ""),
      "",
      "",
      "",
      "",
      "",
      `Ngày: ` +
        (this.ngayDatHang != null && this.ngayDatHang != undefined
          ? formatDatetime(new Date(this.ngayDatHang))
          : ""),
    ];
    let lineRow8 = worksheet.addRow(line8);
    worksheet.mergeCells(`A${lineRow8.number}:D${lineRow8.number}`);
    worksheet.mergeCells(`G${lineRow8.number}:J${lineRow8.number}`);
    lineRow8.font = { name: "Times New Roman", size: 10, italic: true };
    lineRow8.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow8.getCell(1).font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      bold: true,
    };
    lineRow8.height = 20;

    let line9 = [
      `Số hóa đơn: ` +
        (this.soHoaDon != null && this.soHoaDon != undefined
          ? this.soHoaDon
          : ""),
      "",
      "",
      "",
      "",
      "",
      `Ngày: ` +
        (this.ngay != null && this.ngay != undefined
          ? formatDatetime(new Date(this.ngay))
          : ""),
    ];
    let lineRow9 = worksheet.addRow(line9);
    worksheet.mergeCells(`A${lineRow9.number}:D${lineRow9.number}`);
    worksheet.mergeCells(`G${lineRow9.number}:J${lineRow9.number}`);
    lineRow9.font = { name: "Times New Roman", size: 10, italic: true };
    lineRow9.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow9.getCell(1).font = {
      name: "Times New Roman",
      size: 10,
      italic: true,
      bold: true,
    };
    lineRow9.height = 20;
    worksheet.addRow([]);

    let dataHeaderRow1 = [
      "STT",
      `Tên nguyên vật liệu,Vật tư tiêu hao`,
      "Đơn vị tính",
      `Số lượng/Trọng lượng(Thực nhập)`,
      "Số Lot của nhà sản xuất",
      "Tình trạng bao bì",
      "",
      "",
      `Tình trạng nguyên vật liệu(Nếu có thể)`,
      "",
    ];
    let header1 = worksheet.addRow(dataHeaderRow1);
    header1.font = { name: "Times New Roman", size: 10, bold: true };
    dataHeaderRow1.forEach((item, index) => {
      header1.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      header1.getCell(index + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      header1.getCell(index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {},
      };
    });
    header1.height = 30;

    let dataHeaderRow2 = [
      "",
      "",
      "",
      "",
      "",
      "OK",
      "NG",
      "Diễn giải",
      "Còn hạn sử dụng",
      "Hết hạn sử dụng",
    ];
    let header2 = worksheet.addRow(dataHeaderRow2);
    header2.font = { name: "Times New Roman", size: 10, bold: true };
    dataHeaderRow2.forEach((item, index) => {
      header2.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      header2.getCell(index + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      header2.getCell(index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {},
      };
    });
    header2.height = 30;

    worksheet.mergeCells(`A${header1.number}:A${header2.number}`);
    worksheet.mergeCells(`B${header1.number}:B${header2.number}`);
    worksheet.mergeCells(`C${header1.number}:C${header2.number}`);
    worksheet.mergeCells(`D${header1.number}:D${header2.number}`);
    worksheet.mergeCells(`E${header1.number}:E${header2.number}`);
    worksheet.mergeCells(`F${header1.number}:H${header1.number}`);
    worksheet.mergeCells(`I${header1.number}:J${header1.number}`);

    let dataRow = [];
    this.listItemGroup.forEach((item) => {
      dataRow = dataRow.concat(item.listChiTietLotNo);
    });

    dataRow.forEach((item, index) => {
      let dataHeaderRowIndex = [
        index + 1,
        item.productName,
        item.unitName,
        item.quantityActual,
        item.lotNoName,
        item.packagingStatus == true ? "V" : "",
        !item.packagingStatus == false ? "" : "V",
        item.description,
        item.productStatus == true ? "V" : "",
        !item.productStatus == false ? "" : "V",
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

    let footer = [
      "",
      "Delivery person in charge",
      "",
      "",
      "",
      "Warehouse keeper",
      "",
      "",
      "PUR",
    ];
    let footerRow = worksheet.addRow(footer);
    worksheet.mergeCells(`F${footerRow.number}:H${footerRow.number}`);
    worksheet.mergeCells(`I${footerRow.number}:J${footerRow.number}`);

    footerRow.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow.height = 20;

    let footer2 = [
      "",
      "Bên bàn giao",
      "",
      "",
      "",
      "Thủ kho",
      "",
      "",
      "Bộ phận mua bán",
    ];
    let footerRow2 = worksheet.addRow(footer2);
    worksheet.mergeCells(`F${footerRow2.number}:H${footerRow2.number}`);
    worksheet.mergeCells(`I${footerRow2.number}:J${footerRow2.number}`);
    footerRow2.font = {
      name: "Times New Roman",
      size: 12,
      bold: true,
      italic: true,
    };
    footerRow2.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow2.height = 20;

    let footer3 = ["", "", "", "", "", "", "", "", "", ""];
    let footerRow3 = worksheet.addRow(footer3);

    let footer4 = ["", "", "", "", "", "", "", "", "", ""];
    let footerRow4 = worksheet.addRow(footer4);

    let footer5 = ["", "", "", "", "", "", "", "", "", ""];
    let footerRow5 = worksheet.addRow(footer5);

    let footer6 = ["", "", "", "", "", "", "", "", "", ""];
    let footerRow6 = worksheet.addRow(footer6);

    let footer7 = ["", "", "", "", "", "", "", "", "", ""];
    let footerRow7 = worksheet.addRow(footer7);

    let footer8 = ["", "", "", "", "", "", "", "", "", ""];
    let footerRow8 = worksheet.addRow(footer8);

    worksheet.mergeCells(`B${footerRow3.number}:B${footerRow8.number}`);
    worksheet.mergeCells(`F${footerRow3.number}:H${footerRow8.number}`);
    worksheet.mergeCells(`I${footerRow3.number}:J${footerRow8.number}`);

    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 5;
    worksheet.getColumn(7).width = 5;
    worksheet.getColumn(8).width = 15;
    worksheet.getColumn(9).width = 10;
    worksheet.getColumn(10).width = 10;

    this.exportToExel(workbook, title);
    this.loading = false;
    this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs.saveAs(blob, fileName);
    });
  }

  printFile(){
    
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  /* END: Chức năng Ghi chú */

  addNewDialog() {
    this.productSelected = [];
    this.donViTinh = "";
    this.listChiTietLotNo = new Array<ChiTietLotNo>();
    this.showDetailDialog = true;
    this.isDisableMultiSelect = false;
  }
  saveDialog() {
    let checkLotNo = this.listChiTietLotNo.filter(
      (x) => x.lotNoName == null || x.lotNoName == ""
    );
    if (checkLotNo.length > 0) {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Vui lòng nhập LotNo.",
      };
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listChiTietLotNo.filter(
      (x) => x.quantityActual <= 0
    );
    if (checkSoLuong.length > 0) {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Số lượng nhập kho phải lớn hơn 0.",
      };
      this.showMessage(msg);
      return;
    }

    const duplicateLotNo = this.listChiTietLotNo.some((lotno) => {
      let counter = 0;
      for (const iterator of this.listChiTietLotNo) {
        if (iterator.lotNoName === lotno.lotNoName) {
          counter += 1;
        }
      }
      return counter > 1;
    });

    if (duplicateLotNo) {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "LotNo là trùng lặp.",
      };
      this.showMessage(msg);
      return;
    }

    this.productSelected.forEach((x) => {
      let existsProduct = this.listItemGroup.find(
        (i) => i.productId == x.productId
      );
      if (existsProduct == null) {
        let itemGroup: SanPhamPhieuNhapKhoModel = {
          inventoryReceivingVoucherMappingId: this.emptyGuid,
          inventoryReceivingVoucherId: this.emptyGuid,
          productId: x.productId,
          quantityActual: this.listChiTietLotNo.reduce(
            (sum, current) =>
              ParseStringToFloat(sum) +
              ParseStringToFloat(current.quantityActual),
            0
          ),
          productName: this.listProduct.find((k) => k.productId == x.productId)
            .productName,
          unitName: this.listProduct.find((k) => k.productId == x.productId)
            .productUnitName,
          listChiTietLotNo: [],
        };

        this.listChiTietLotNo.forEach((element) => {
          let lotno: ChiTietLotNo = {
            inventoryReceivingVoucherMappingId: this.emptyGuid,
            inventoryReceivingVoucherId: this.emptyGuid,
            productId: x.productId,
            lotNoId: element.lotNoId,
            lotNoName: element.lotNoName,
            productName: "",
            quantityActual: element.quantityActual,
            packagingStatus: element.packagingStatus,
            productStatus: element.productStatus,
            description: element.description,
            unitName: "",
          };
          itemGroup.listChiTietLotNo.push(lotno);
        });
        this.listItemGroup.push(itemGroup);
      } else {
        this.listChiTietLotNo.forEach((lo) => {
          lo.productId = x.productId;
          let existLotno = this.listItemGroup
            .find((i) => i.productId == lo.productId)
            .listChiTietLotNo.find((k) => k.lotNoName == lo.lotNoName);
          if (existLotno == null) {
            /*thêm mới lotno vào sản phẩm đã tồn tại*/
            this.listItemGroup
              .find((i) => i.productId == x.productId)
              .listChiTietLotNo.push(lo);
          } else {
            /*cập nhật số lượng lotno nếu tồn tại*/
            this.listItemGroup
              .find((i) => i.productId == x.productId)
              .listChiTietLotNo.find(
                (k) => k.lotNoName == lo.lotNoName
              ).quantityActual = lo.quantityActual;
          }
        });
      }
    });

    /*Tinh lại số lượng nhập*/
    this.listItemGroup.forEach((x) => {
      x.quantityActual = x.listChiTietLotNo.reduce(
        (sum, current) =>
          ParseStringToFloat(sum) + ParseStringToFloat(current.quantityActual),
        0
      );
    });

    this.showDetailDialog = false;
  }

  huyDialog() {
    this.listDataDialog = [];
    this.vatTu.reset();
    this.donViTinh = "";
    this.showDetailDialog = false;
  }

  onChangeProductControl() {
    this.donViTinh = this.productSelected[0].productUnitName;
  }

  clickDetailLotNo(rowData: any) {
    this.isDisableMultiSelect = true;
    this.productSelected = [];
    this.productSelected.push(
      this.listProduct.find((y) => y.productId == rowData.productId)
    );
    // this.donViTinh = this.productSelected[0].productUnitName;

    this.listChiTietLotNo = [];

    rowData.listChiTietLotNo.forEach((element) => {
      let lotno: ChiTietLotNo = {
        inventoryReceivingVoucherMappingId:
          element.inventoryReceivingVoucherMappingId,
        inventoryReceivingVoucherId: element.inventoryReceivingVoucherId,
        productId: element.productId,
        lotNoName: element.lotNoName,
        productName: element.productName,
        quantityActual: element.quantityActual,
        packagingStatus: element.packagingStatus,
        productStatus: element.productStatus,
        description: element.description,
        unitName: element.unitName,
        lotNoId: element.lotNoId,
      };

      this.listChiTietLotNo.push(lotno);
    });

    this.showDetailDialog = true;
  }
  deleteItemGroup(rowData: any) {
    this.listItemGroup = this.listItemGroup.filter(
      (x) => x.productId != rowData.productId
    );
  }
  deleteLotNo(rowData: any) {
    this.listChiTietLotNo = this.listChiTietLotNo.filter(
      (x) => x.lotNoName != rowData.lotNoName
    );

    this.listItemGroup.find(
      (i) => i.productId == rowData.productId
    ).listChiTietLotNo = this.listItemGroup
      .find((i) => i.productId == rowData.productId)
      .listChiTietLotNo.filter((x) => x.lotNoName != rowData.lotNoName);
  }
  addNewLotNo() {
    if (this.status == 0) {
      if (this.productSelected.length == 0) {
        let msg = {
          severity: "error",
          summary: "Thông báo:",
          detail: "Chọn hàng hóa vật tư.",
        };
        this.showMessage(msg);
        return;
      }

      let checkLotNo = this.listChiTietLotNo.filter(
        (x) => x.lotNoName == null || x.lotNoName == ""
      );
      if (checkLotNo.length > 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Vui lòng nhập LotNo.",
        };
        this.showMessage(msg);
        return;
      }
      let checkSoLuong = this.listChiTietLotNo.filter(
        (x) => x.quantityActual <= 0
      );
      if (checkSoLuong.length > 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Số lượng nhập kho phải lớn hơn 0.",
        };
        this.showMessage(msg);
        return;
      }

      const duplicateLotNo = this.listChiTietLotNo.some((lotno) => {
        let counter = 0;
        for (const iterator of this.listChiTietLotNo) {
          if (iterator.lotNoName === lotno.lotNoName) {
            counter += 1;
          }
        }
        return counter > 1;
      });

      if (duplicateLotNo) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "LotNo là trùng lặp.",
        };
        this.showMessage(msg);
        return;
      }

      let lotno: ChiTietLotNo = {
        inventoryReceivingVoucherMappingId: this.emptyGuid,
        inventoryReceivingVoucherId: this.emptyGuid,
        productId: this.emptyGuid,
        lotNoId: null,
        lotNoName: "",
        productName: "",
        quantityActual: 0,
        packagingStatus: 1,
        productStatus: 1,
        description: "",
        unitName: "",
      };

      this.listChiTietLotNo.push(lotno);
      this.ref.detectChanges();

      let target;
      target = this.el.nativeElement.querySelector(
        ".item-lot-no-" + (this.listChiTietLotNo.length - 1)
      );
      if (target) {
        target.focus();
      }
    }
  }

  onChangeProduct() {
    if (this.listChiTietLotNo.length == 0) {
      this.addNewLotNo();
    }
  }

  onChangeWarehouse() {
    if (this.status == 0) {
      var checkKiemKe = this.listKiemKe.find(
        (c) => c.warehouseId == this.selectKhoNhan?.warehouseId
      );
      if (checkKiemKe != null && checkKiemKe != undefined) {
        var thangKiemKe = new Date(checkKiemKe.thangKiemKe);
        this.minDate = new Date(
          thangKiemKe.setMonth(thangKiemKe.getMonth() + 1)
        );
      } else {
        this.minDate = null;
      }
    }
  }
}

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, '');
  return parseFloat(str);
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

function convertToUTCTime(time: any): Date {
  let result: Date = null;
  if (time) {
    result = new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
  }
  return result;
};

function formatDatetime(time: Date) {
  let date = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  return `${date}/${month}/${year}`;
}

function convertDateToString(date: Date) {
  let result: string = "";

  if (date) {
    let day = date.getDate();
    let _day = "";
    if (day < 10) _day = "0" + day;
    else _day = day.toString();

    let month = date.getMonth() + 1;
    let _month = "";
    if (month < 10) _month = "0" + month;
    else _month = month.toString();

    let year = date.getFullYear();
    let _year = "";
    if (year < 10) _year = "0" + year;
    else _year = year.toString();

    result = _day + "/" + _month + "/" + _year;
  }

  return result;
}



