import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import * as $ from 'jquery';
import { WarehouseService } from '../../../services/warehouse.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SanPhamPhieuNhapKhoModel } from '../../../models/sanPhamPhieuNhapKhoModel.model';
import { InventoryReceivingVoucherModel } from '../../../models/InventoryReceivingVoucher.model';
import { InventoryReceivingVoucherMapping } from '../../../models/inventoryReceivingVoucherMapping.model';
import { TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { FileUpload } from 'primeng/fileupload';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { ExportFileWordService } from "../../../../shared/services/exportFileWord.services";


class LoaiPhieuNhap {
  name: string;
  type: number;
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

class MapSerial {
  SerialId: string
  SerialCode: string
  ProductId: string
  StatusId: string
  Active: string
  CreatedDate: Date
  CreatedById: Date
}


class MapData {
  InventoryDeliveryVoucherId: string
  InventoryDeliveryVoucherCode: string
  StatusId: string
  InventoryDeliveryVoucherType: number
  WarehouseId: string
  ObjectId: string
  Reason: string
  InventoryDeliveryVoucherDate: Date
  InventoryDeliveryVoucherTime: Date
  Active: boolean
  CreatedDate: Date
  CreatedById: string
  UpdatedDate: Date
  UpdatedById: string
  // TenantId: string
  Description: string
  Note: string
  InventoryDeliveryVoucherCategory: number
  WarehouseRequest: number
  InventoryDeliveryVoucherReason: number
  Day: Date
  DateFrom: Date
  DateTo: Date
  Month: Date
  WarehouseReceivingId: string
  InventoryDeliveryVoucherScreenType: number
  WarehouseCategory: number
}

class MapDataList {
  inventoryDeliveryVoucherMappingId: string
  inventoryDeliveryVoucherId: string
  productId: string
  productCode: string
  quantityRequire: number //So luong de nghi
  quantityInventory: number
  quantity: number
  price: number
  warehouseId: string
  note: string
  active: boolean
  createdDate: Date
  createdById: string
  listSerial: Array<MapSerial>
  discountValue: number
  totalSerial: number
  quantityDelivery: number //So luong giao
  productReuse: string
  lotNoId: number
  lotNoName: string
  productName: string
  wareHouseName: string
  unitName: string
  nameMoneyUnit: string
  sumAmount: number
  wareHouseType: number
}

class mapDataDialog {
  lotNoId: any;
  lotNo: any;
  tonKho: number;
  soLuongDeNghi: number;
  soLuongGiao: number;
  ghiChu: string;
  thaoTac: any;
  dataLotNo: any;
}

class MapDataTable {
  productId: string;
  tenVatTu: string;
  donViTinh: string;
  soLuongDeNghi: number;
  soLuongGiao: number;
  tonKho: number;
  ghiChu: string;
}


@Component({
  selector: "app-de-nghi-xuat-kho-detail",
  templateUrl: "./de-nghi-xuat-kho-detail.component.html",
  styleUrls: ["./de-nghi-xuat-kho-detail.component.css"],
})
export class DeNghiXuatKhoDetailComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );
  noteHistory: any;
  totalRecordsNote: number;
  isGlobalFilter: any = "";

  // note, dÒng thời gian
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  pageSize = 20;

  /* Cố định thanh chứa button đầu trang */
  fixed: boolean = false;
  isShow: boolean = true;
  colLeft: number = 8;
  withFiexd: string = "";
  withFiexdCol: string = "";
  withColCN: number = 0;
  withCol: number = 0;
  colsDanhSach2: {
    field: string;
    header: string;
    width: string;
    textAlign: string;
    display: string;
    color: string;
  }[];
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
  @ViewChild("fileUpload") fileUpload: FileUpload;
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

  /*Dữ liệu*/

  loaiPhieuNhapType: number = 1;
  listCurrentChips: Array<string> = [];
  listVendor: Array<Vendor> = [];
  listWarehouseNhan: Array<Warehouse> = [];
  listWarehouseNhan2: Array<Warehouse> = [];
  listWarehouseXuat: Array<Warehouse> = [];
  listCustomer: Array<Customer> = [];
  listVendorOrder: Array<VendorOrder> = [];
  listProduct: Array<any> = [];
  listProductCheck: Array<any> = [];
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

  khoNhanControl: FormControl;
  khoNhanForm: FormGroup;

  dataDNXK: any;

  /*Popup Kho list Kho con*/
  choiceKho: boolean = false;
  listDetailWarehouse: TreeNode[];
  selectedWarehouseChilren: TreeNode;
  /*End*/

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
  lyDo: number;

  dateNgay: Date = new Date();
  dateTuNgay: Date;
  dateDenNgay: Date;
  dateThang: Date;

  deNghiXuatKho: boolean = false;
  colsDeNghiXuat: Array<any> = [];
  colsDeNghiXuat2: Array<any> = [];
  colsDeNghiXuat3: Array<any> = [];
  listDataDeNghi: Array<MapDataTable> = [];

  listDataDialog: Array<mapDataDialog> = [];
  tongTonKho: number = 0;
  tongGiao: number = 0;
  tongSoLuongDeNghi: number = 0;

  productName: any="";
  donViTinh: any = "";
  soLuongTon: any = "";
  selectVatTu: any;
  listLotNo: any;
  listLotNoCheck: any;
  selectLotNo: any;

  colsDanhSach: Array<any> = [];
  colsDanhSac2: Array<any> = [];
  colsDanhSach3: Array<any> = [];
  vatTu: FormGroup;
  vatTuControl: FormControl;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  listDataUse: Array<MapDataList> = [];
  deNghiXuatKhoEdit: boolean = false;
  deNghiXuatKhoEdit2: boolean = false;
  deNghiXuatKhoEdit3: boolean = false;
  id: string;

  inventoryDeliveryVoucher: any;
  khoNhanSelect: any;
  khoNhanSelect2: any;
  trangThaiText: string;
  trangThai: number;
  warehouseType: number;

  noteControl: string;

  hangTuanForm: FormGroup;
  tuNgayControl: FormControl;
  denNgayControl: FormControl;

  hangThangForm: FormGroup;
  hangThangControl: FormControl;

  noteContent: string = "";

  maHeThong: any;

  // action
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionDowload: boolean = true;
  actionApprove: boolean = true;
  actionSendApprove: boolean = true;
  actionReject: boolean = true;

  // export word
  nguoiDeNghi: any;
  boPhan: any;
  thoiGian: any;
  deNghiText: any;
  deNghiTextKhoSX: any;
  deNghiTextKhoHC: any;

  total: number = 0;
  listKiemKe: any = [];

  constructor(
    private getPermission: GetPermission,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
    private _warehouseService: WarehouseService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    public exportFileWordService: ExportFileWordService,
    private el: ElementRef
  ) {
    this.route.params.subscribe((params) => {
      if (params["inventoryDeliveryVoucherId"]) {
        this.id = params["inventoryDeliveryVoucherId"];
      }

      if (params["warehouseType"]) {
        this.warehouseType = params["warehouseType"];
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
    let resource = "war/warehouse/de-nghi-xuat-kho/detail";
   
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDowload = false;
      }
      if (listCurrentActionResource.indexOf("approve") == -1) {
        this.actionApprove = false;
      }
      if (listCurrentActionResource.indexOf("send_approve") == -1) {
        this.actionSendApprove = false;
      }
      if (listCurrentActionResource.indexOf("reject") == -1) {
        this.actionReject = false;
      }
    }

    this.initTable();
    this.getMasterData();
  }

  initTable() {
    this.colsDanhSach = [
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
        field: "soLuongDeNghi",
        header: "Số lượng đề nghị",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "ghiChu",
      //   header: "Ghi chú",
      //   width: "190px",
      //   textAlign: "center",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colsDanhSach2 = [
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
        field: "tonKho",
        header: "Tồn kho",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuongDeNghi",
        header: "Số lượng đề nghị",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuongGiao",
        header: "Số lượng giao",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "ghiChu",
      //   header: "Ghi chú",
      //   width: "190px",
      //   textAlign: "center",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colsDanhSach3 = [
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
        field: "soLuongDeNghi",
        header: "Số lượng đề nghị",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuongGiao",
        header: "Số lượng giao",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "ghiChu",
      //   header: "Ghi chú",
      //   width: "190px",
      //   textAlign: "center",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
      // {
      //   field: "thaoTac",
      //   header: "Thao tác",
      //   width: "80px",
      //   textAlign: "center",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
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
        header: "Tồn Kho",
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
        width: "40px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colsDeNghiXuat2 = [
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
        header: "Tồn Kho",
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
        field: "soLuongGiao",
        header: "Số lượng giao",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "ghiChu",
      //   header: "Ghi chú",
      //   width: "120px",
      //   textAlign: "right",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
      // {
      //   field: "thaoTac",
      //   header: "Thao tác",
      //   width: "40px",
      //   textAlign: "right",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
    ];

    this.colsDeNghiXuat3 = [
      {
        field: "lotNo",
        header: "Lot.No",
        width: "120px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "tonKho",
      //   header: "Tồn Kho",
      //   width: "100px",
      //   textAlign: "center",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
       {
        field: "soLuongDeNghi",
        header: "Số lượng đề nghị",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "soLuongGiao",
        header: "Số lượng giao",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      // {
      //   field: "ghiChu",
      //   header: "Ghi chú",
      //   width: "120px",
      //   textAlign: "right",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
      // {
      //   field: "thaoTac",
      //   header: "Thao tác",
      //   width: "40px",
      //   textAlign: "right",
      //   display: "table-cell",
      //   color: "#f44336",
      // },
    ];
  }

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
    this.productControl = new FormControl(null);

    this.createForm = new FormGroup({
      loaiPhieuNhapControl: this.loaiPhieuNhapControl,
      doiTacControl: this.doiTacControl,
      khoControl: this.khoControl,
      donHangMuaControl: this.donHangMuaControl,
      phieuXuatKhoChipsControl: this.phieuXuatKhoChipsControl,
      phieuKiemKeControl: this.phieuKiemKeControl,
      expectedDateControl: this.expectedDateControl,
      inventoryReceivingVoucherDateControl:
        this.inventoryReceivingVoucherDateControl,
      shiperNameControl: this.shiperNameControl,
      descriptionControl: this.descriptionControl,
      licenseNumberControl: this.licenseNumberControl,
      productControl: this.productControl,
    });

    this.vatTuControl = new FormControl(null, [Validators.required]);
    this.vatTu = new FormGroup({
      vatTuControl: this.vatTuControl,
    });

    this.vatTuControlEdit = new FormControl(null, [Validators.required]);
    this.vatTuEdit = new FormGroup({
      vatTuControlEdit: this.vatTuControlEdit,
    });

    this.tuNgayControl = new FormControl(null, [Validators.required]);
    this.denNgayControl = new FormControl(null, [Validators.required]);
    this.hangTuanForm = new FormGroup({
      tuNgayControl: this.tuNgayControl,
      denNgayControl: this.denNgayControl,
    });

    this.hangThangControl = new FormControl(null, [Validators.required]);
    this.hangThangForm = new FormGroup({
      hangThangControl: this.hangThangControl,
    });
  }

  refreshFilter() {}

  showFilter() {}

  async getMasterData() {
    this.loading = true;
    let [getMaterDataResult, getListWarehouse2]: any =
      await Promise.all([
        this._warehouseService.getInventoryDeliveryVoucherByIdAsync(
          this.id,
          this.warehouseType
        ),
        this._warehouseService.getListWareHouseAsync(this.warehouseType, ""),
      ]);
    if (
      getMaterDataResult.statusCode == 200 &&
      getListWarehouse2.statusCode == 200
    ) {
  
      this.inventoryDeliveryVoucher =
        getMaterDataResult.inventoryDeliveryVoucher;
      this.listProduct = getMaterDataResult.listProduct;
      this.listProductCheck = getMaterDataResult.listProduct;
      this.listDataUse = getMaterDataResult.inventoryDeliveryVoucherMappingModel;
      this.listKiemKe = getMaterDataResult.listDotKiemKe;

      this.listWarehouseNhan2 = getListWarehouse2.listWareHouse;

      let [getListWarehouse]: any =
        await Promise.all([
          this._warehouseService.getListWareHouseAsync(3, this.inventoryDeliveryVoucher.organizationId),
        ]);
      if ( getListWarehouse.statusCode == 200 ) {
        this.listWarehouseNhan = getListWarehouse.listWareHouse;
      }

      // export Word
      this.boPhan =
        getMaterDataResult.inventoryDeliveryVoucher.employeeDepartment;
      this.nguoiDeNghi = getMaterDataResult.inventoryDeliveryVoucher.nameCreate;
      this.thoiGian = getMaterDataResult.inventoryDeliveryVoucher.createdDate;
      this.deNghiText =
        getMaterDataResult.inventoryDeliveryVoucher.inventoryDeliveryVoucherTypeText;
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Lấy dữ liệu không thành công",
      };
      this.showMessage(msg);
    }
    this.setDefaultValue();
    this.loading = false;
  }

  setDefaultValue() {
    this.trangThaiText = this.inventoryDeliveryVoucher.nameStatus;
    this.trangThai = this.inventoryDeliveryVoucher.intStatusDnx;
    this.maHeThong = this.inventoryDeliveryVoucher.inventoryDeliveryVoucherCode;

    this.userName = this.inventoryDeliveryVoucher.nameCreate;
    this.department = this.inventoryDeliveryVoucher.employeeDepartment;

    this.ngayHienTai = formatDatetime(
      new Date(this.inventoryDeliveryVoucher.createdDate)
    );
    this.deNghi = this.inventoryDeliveryVoucher.inventoryDeliveryVoucherType;
    this.noteControl = this.inventoryDeliveryVoucher.note;
    this.lyDo = ParseStringToFloat(
      this.inventoryDeliveryVoucher.inventoryDeliveryVoucherReason
    );
    this.dateNgay = this.inventoryDeliveryVoucher.day
      ? new Date(this.inventoryDeliveryVoucher.day)
      : null;

    this.tuNgayControl.setValue(
      this.inventoryDeliveryVoucher.dateFrom
        ? new Date(this.inventoryDeliveryVoucher.dateFrom)
        : null
    );
    this.denNgayControl.setValue(
      this.inventoryDeliveryVoucher.dateTo
        ? new Date(this.inventoryDeliveryVoucher.dateTo)
        : null
    );
    this.hangThangControl.setValue(
      this.inventoryDeliveryVoucher.month
        ? new Date(this.inventoryDeliveryVoucher.month)
        : null
    );
    this.khoNhanSelect = this.listWarehouseNhan.find(
      (x) => x.warehouseId == this.inventoryDeliveryVoucher.warehouseReceivingId
    );
    if (this.trangThai == 2) {
      this.khoNhanSelect2 = this.listWarehouseNhan2.find(
        (x) => x.warehouseId == this.inventoryDeliveryVoucher.warehouseId
      );
    } else {
      this.khoNhanSelect2 = this.listWarehouseNhan2[0];
    }

    this.gopData();
  }

  onViewDetail(data: MapDataTable) {
   
    this.deNghiXuatKhoEdit = true;
    this.listDataDialog = [];
    this.vatTuControlEdit.disable();
    // let product = this.listProductCheck.find((x) => x.productId == data.productId);
    this.selectVatTu = this.listProductCheck.find((x) => x.productId == data.productId);
    this.addField();

    // this.listLotNo = this.vatTuControlEdit.value.listProductLotNoMapping
    this.tongSoLuongDeNghi = 0;
    this.tongTonKho = 0;
    this.listDataUse.forEach((x) => {
      if (x.productId == this.selectVatTu.productId) {
        let mapDataDialog: mapDataDialog = {
          lotNoId: this.selectVatTu.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ).lotNoId,
          lotNo: this.selectVatTu.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ),
          tonKho: x.quantityInventory,
          soLuongDeNghi: x.quantityRequire,
          soLuongGiao: x.quantityDelivery,
          ghiChu: x.note,
          thaoTac: null,
          dataLotNo: this.selectVatTu.listProductLotNoMapping,
        };
        this.listDataDialog.push(mapDataDialog);
      }
    });
    this.hiddenOption(null);
    // this.updateLotNo()
    this.tinhTong();
    this.donViTinh = this.selectVatTu.productUnitName;
    this.soLuongTon = this.selectVatTu.quantityInventory;
    this.productName = this.selectVatTu.productName;
  }

  onViewDetail2(data: MapDataTable) {
   
    this.deNghiXuatKhoEdit2 = true;
    this.listDataDialog = [];
    // this.vatTuControlEdit.disable();
    // this.vatTuControlEdit.setValue(
    //   this.listProductCheck.find((x) => x.productId == data.productId)
    // );
    this.selectVatTu = this.listProductCheck.find((x) => x.productId == data.productId);
    this.addField();

    // this.listLotNo = this.vatTuControlEdit.value.listProductLotNoMapping
    this.tongSoLuongDeNghi = 0;
    this.tongTonKho = 0;
    this.listDataUse.forEach((x) => {
      if (x.productId == this.selectVatTu.productId) {
        let mapDataDialog: mapDataDialog = {
          lotNoId: this.selectVatTu.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ).lotNoId,
          lotNo: this.selectVatTu.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ),
          tonKho: x.quantityInventory,
          soLuongDeNghi: x.quantityRequire,
          soLuongGiao: x.quantityDelivery,
          ghiChu: x.note,
          thaoTac: null,
          dataLotNo: this.selectVatTu.listProductLotNoMapping,
        };
        this.listDataDialog.push(mapDataDialog);
      }
    });
    this.hiddenOption(null);
    // this.updateLotNo()
    this.tinhTong();
    this.donViTinh = this.selectVatTu.productUnitName;
    this.soLuongTon = this.selectVatTu.quantityInventory;
    this.productName = this.selectVatTu.productName;
  }

  onViewDetail3(data: MapDataTable) {
    this.deNghiXuatKhoEdit3 = true;
    this.listDataDialog = [];
    this.vatTuControlEdit.disable();
    this.vatTuControlEdit.setValue(
      this.listProductCheck.find((x) => x.productId == data.productId)
    );
    this.selectVatTu = this.listProductCheck.find(
      (x) => x.productId == data.productId
    );
    this.addField();

    // this.listLotNo = this.vatTuControlEdit.value.listProductLotNoMapping
    this.tongSoLuongDeNghi = 0;
    this.tongTonKho = 0;
    this.listDataUse.forEach((x) => {
      if (x.productId == this.vatTuControlEdit.value.productId) {
        let mapDataDialog: mapDataDialog = {
          lotNoId: this.vatTuControlEdit.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ).lotNoId,
          lotNo: this.vatTuControlEdit.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ),
          tonKho: x.quantityInventory,
          soLuongDeNghi: x.quantityRequire,
          soLuongGiao: x.quantityDelivery,
          ghiChu: x.note,
          thaoTac: null,
          dataLotNo: this.selectVatTu.listProductLotNoMapping,
        };
        this.listDataDialog.push(mapDataDialog);
      }
    });
    this.hiddenOption(null);
    // this.updateLotNo()
    this.tinhTong();
    this.donViTinh = this.vatTuControlEdit.value.productUnitName;
    this.soLuongTon = this.vatTuControlEdit.value.quantityInventory;
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  goBack() {
    this.router.navigate(["/warehouse/de-nghi-xuat-kho/list"]);
  }
  huyPhieuXuat() {
    this._warehouseService.huyDeNghiXuat(this.id).subscribe((response) => {
      let result1: any = response;
      if (result1.statusCode == 200) {
        //Lưu và Thêm mới
        this.resetForm();
        let msg = {
          severity: "success",
          summary: "Thông báo:",
          detail: result1.messageCode,
        };
        this.showMessage(msg);
        this.getMasterData();
      } else {
        let msg = {
          severity: "error",
          summary: "Thông báo:",
          detail: result1.messageCode,
        };
        this.showMessage(msg);
      }
    });
  }

  /*Tạo mới phiếu nhập kho*/
  async taoPhieuNhapKho() {
    this.loading = true;
    if (this.listDataUse.length == 0) {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Danh sách đề nghị chưa có dữ liệu!",
      };
      this.showMessage(msg);
      return;
    }
    let inventoryReceivingVoucherModel = this.mapDataToModelPhieuNhapKho();

    let noteContent: string = "a";
    this._warehouseService
      .taoPhieuXuatKho(
        inventoryReceivingVoucherModel,
        this.listDataUse,
        noteContent
      )
      .subscribe((response) => {
        let result: any = response;

        if (result.statusCode == 200) {
          //Lưu và Thêm mới

          this.resetForm();
          let msg = {
            severity: "success",
            summary: "Thông báo:",
            detail: "Cập nhật thành công",
          };
          this.showMessage(msg);
        } else {
          let msg = {
            severity: "error",
            summary: "Thông báo:",
            detail: result.messageCode,
          };
          this.showMessage(msg);
        }
        this.getMasterData();
      });
  }

  mapDataToModelPhieuNhapKho() {
    let inventoryReceiving: MapData = {
      InventoryDeliveryVoucherId: this.id,
      InventoryDeliveryVoucherCode: null,
      StatusId: this.emptyGuid,
      InventoryDeliveryVoucherType: this.deNghi,
      WarehouseId: this.khoNhanSelect2.warehouseId,
      ObjectId: this.emptyGuid,
      Reason: null,
      InventoryDeliveryVoucherDate: this.ngayHienTai
        ? new Date(this.ngayHienTai)
        : null,
      InventoryDeliveryVoucherTime: null,
      Active: true,
      CreatedDate: new Date(),
      CreatedById: this.emptyGuid,
      UpdatedDate: null,
      UpdatedById: null,
      Description: null,
      Note: null,
      InventoryDeliveryVoucherCategory: null,
      WarehouseRequest: null,
      InventoryDeliveryVoucherReason: this.lyDo
        ? ParseStringToFloat(this.lyDo)
        : null,
      Day: this.dateNgay ? new Date(this.dateNgay) : null, //
      DateFrom: this.tuNgayControl ? new Date(this.tuNgayControl.value) : null, //
      DateTo: this.denNgayControl ? new Date(this.denNgayControl.value) : null, //
      Month: this.hangThangControl
        ? new Date(this.hangThangControl.value)
        : null, //
      WarehouseReceivingId: this.khoNhanSelect.warehouseId,
      InventoryDeliveryVoucherScreenType: null,
      WarehouseCategory: this.warehouseType,
    };

    return inventoryReceiving;
  }

  async guiPheDuyet() {
    this._warehouseService.guiDeNghiXuat(this.id).subscribe((response) => {
      let result1: any = response;
      if (result1.statusCode == 200) {
        //Lưu và Thêm mới
        this.resetForm();
        let msg = {
          severity: "success",
          summary: "Thông báo:",
          detail: result1.messageCode,
        };
        this.showMessage(msg);
        this.getMasterData();
      } else {
        let msg = {
          severity: "error",
          summary: "Thông báo:",
          detail: result1.messageCode,
        };
        this.showMessage(msg);
      }
    });
  }

  async pheDuyetPhieuXuat() {
    this._warehouseService.pheDuyetPhieuXuat(this.id).subscribe((response) => {
      let result1: any = response;
      if (result1.statusCode == 200) {
        //Lưu và Thêm mới
        this.resetForm();
        let msg = {
          severity: "success",
          summary: "Thông báo:",
          detail: result1.messageCode,
        };
        this.showMessage(msg);
        this.getMasterData();
      } else {
        let msg = {
          severity: "error",
          summary: "Thông báo:",
          detail: result1.messageCode,
        };
        this.showMessage(msg);
      }
    });
    this.getMasterData();
  }

  async luuVaGui(data) {
    /**Gửi phê duyệt */
    if (data == 0) {
      if (this.listDataUse.length == 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Danh sách đề nghị chưa có dữ liệu!",
        };
        this.showMessage(msg);
        return;
      }
      let inventoryReceivingVoucherModel = this.mapDataToModelPhieuNhapKho();

      let noteContent: string = "a";

      let result: any = await this._warehouseService.taoPhieuXuatKhoAsync(
        inventoryReceivingVoucherModel,
        this.listDataUse,
        noteContent
      );

      if (result.statusCode == 200) {
        await this.guiPheDuyet();
      } else {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Gửi phê duyệt không thành công!",
        };
        this.showMessage(msg);
        return;
      }
    }
    else {
      var isOK = false;
      var txtKho = '';
      var checkKiemKe = this.listKiemKe.find(c => c.warehouseId == this.khoNhanSelect2?.warehouseId);
      if (checkKiemKe != null && checkKiemKe != undefined) {
        txtKho = checkKiemKe.warehouseName;
        var dateNow = new Date();
        var thangKiemKe = new Date(checkKiemKe.thangKiemKe)
        var minDate = (new Date(thangKiemKe.setMonth(thangKiemKe.getMonth() + 1)));
        if (dateNow > minDate) {
          isOK = true;
        }
      }
      else {
        isOK = true;
      }

      if (isOK) {
        /**Đồng ý phê duyệt */
        if (this.listDataUse.length == 0) {
          let msg = {
            severity: "warn",
            summary: "Thông báo:",
            detail: "Danh sách đề nghị chưa có dữ liệu!",
          };
          this.showMessage(msg);
          return;
        }
        let inventoryReceivingVoucherModel = this.mapDataToModelPhieuNhapKho();

        let noteContent: string = "a";

        let result: any = await this._warehouseService.taoPhieuXuatKhoAsync(
          inventoryReceivingVoucherModel,
          this.listDataUse,
          noteContent
        );

        if (result.statusCode == 200) {
          await this.pheDuyetPhieuXuat();
        } else {
          let msg = {
            severity: "warn",
            summary: "Thông báo:",
            detail: "Gửi phê duyệt không thành công!",
          };
          this.showMessage(msg);
          return;
        }
      }
      else {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Ngày hiện tại thuộc đợt kiểm kê đã hoàn thành của kho " + txtKho + '. Không tạo được phiếu xuất.',
        };
        this.showMessage(msg);
      }
    }
  }

  resetForm() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
      this.isInvalidForm = false; //Ẩn icon-warning-active
    }

    //Đối tác
    this.doiTacControl.reset();

    //Nhập kho tại
    this.khoControl.reset();

    //Lấy dữ liệu từ đơn hàng mua
    this.donHangMuaControl.setValue(null);
    this.donHangMuaControl.disable();
    this.donHangMuaControl.setValidators([Validators.required]);
    this.donHangMuaControl.updateValueAndValidity();

    //Ngày dự kiến nhập
    this.expectedDateControl.setValue(new Date());

    //Ngày nhập kho
    this.inventoryReceivingVoucherDateControl.reset();

    //Diễn giải
    this.descriptionControl.setValue(null);

    //Ngày lập phiếu
    this.createdDate = new Date();

    //Số chứng từ gốc kèm theo
    this.licenseNumberControl.setValue("0");

    //list sản phẩm
    this.listItemDetail = [];

    //ghi chú
    this.noteControl = "";

    //list file
    this.uploadedFiles = [];
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  themDeNghi(data: any) {
    if (data == false) {
      this.deNghiXuatKho = !this.deNghiXuatKho;
      this.tongSoLuongDeNghi = 0;
      this.tongTonKho = 0;
      //loại bỏ sản phẩm đã được thêm vào danh sách trước đó khỏi dropdown
      this.listDataDeNghi.forEach((i) => {
        this.listProduct = this.listProduct.filter(
          (x) => x.productId != i.productId
        );
      });
    }
  }

  themMoiDialog() {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData();
      return;
    }

    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if(checkLotNo.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng chọn LotNo!",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if(checkSoLuong.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!",};
      this.showMessage(msg);
      return;
    }


    let check = this.listDataDialog.filter(
      (x) => x.lotNoId == "" || x.lotNo == null
    );
    if (check.length == 0) {
      let listId = [];
      this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
      let a = this.selectVatTu.listProductLotNoMapping.filter(
        (x, i) => listId.indexOf(x.lotNoId) == -1
      );
      let noiDUngTT: mapDataDialog = {
        lotNoId: "",
        lotNo: null,
        tonKho: 0,
        soLuongDeNghi: 0,
        soLuongGiao: 0,
        ghiChu: "",
        thaoTac: null,
        dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
          (x, i) => listId.indexOf(x.lotNoId) == -1
        ),
      };

      // this.listLotNo = this.selectVatTu.listProductLotNoMapping
      this.listLotNoCheck = this.selectVatTu.listProductLotNoMapping;
      this.listDataDialog.push(noiDUngTT);
      // this.hiddenOption()

      this.tinhTong();
      this.ref.detectChanges();

      let target;
      target = this.el.nativeElement.querySelector('.item-lot-no-' + (this.listDataDialog.length - 1) + ' input');
      if (target) {
        target.focus();
      }
    } else {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Vui lòng lựa chọn lot no trước khi thêm mới!",
      };
      this.showMessage(msg);
    }
  }

  themMoiDialogEdit() {

    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if(checkLotNo.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng chọn LotNo!",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if(checkSoLuong.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!",};
      this.showMessage(msg);
      return;
    }

    let listId = [];
    this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
    let a = this.selectVatTu.listProductLotNoMapping.filter(
      (x, i) => listId.indexOf(x.lotNoId) == -1
    );
    let noiDUngTT: mapDataDialog = {
      lotNoId: "",
      lotNo: null,
      tonKho: 0,
      soLuongDeNghi: 0,
      soLuongGiao: 0,
      ghiChu: "",
      thaoTac: null,
      dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
        (x, i) => listId.indexOf(x.lotNoId) == -1
      ),
    };

    // this.listLotNo = this.selectVatTu.listProductLotNoMapping
    this.listLotNoCheck = this.selectVatTu.listProductLotNoMapping;
    this.listDataDialog.push(noiDUngTT);
    // this.hiddenOption()

    this.tinhTong();
    this.ref.detectChanges();
  }

  xoaDeXuat(data, index) {
    this.listDataDialog = this.listDataDialog.filter((x) => x != data);
    this.tinhTong();
    this.hiddenOption(index);
  }

  changeLyDo() {
    this.hangThangControl.reset();
    this.tuNgayControl.reset();
    this.denNgayControl.reset();
  }

  changeLotNo(data, index) {
    this.listDataDialog.filter((e, i) => {
      if (i == index) {
        e.lotNoId = data.value.lotNoId;
        e.lotNo = data.value;
        e.tonKho = data.value.quantityInventory;
        e.soLuongDeNghi = 0;
        e.ghiChu = "";
      }
    });
    this.hiddenOption(index);
    this.tinhTong();
    this.ref.detectChanges();
  }

  tinhTong() {
    this.tongTonKho = 0;
    this.tongSoLuongDeNghi = 0;
    this.tongGiao = 0;
    this.total = 0;

    this.listDataDeNghi.forEach((x) => {
      this.total += ParseStringToFloat(x.soLuongDeNghi);
    });


    this.listDataDialog.forEach((i) => {
      // không tính tổng cho các lotno trống
      if (i.lotNo != "") {
        this.tongTonKho += ParseStringToFloat(i.tonKho);
        this.tongSoLuongDeNghi += ParseStringToFloat(i.soLuongDeNghi);
        this.tongGiao += ParseStringToFloat(i.soLuongGiao);
      }
    });
  }

  async exportWord() {
    var listData: Array<any> = [];

    let totalQuantity = 0;
    this.listDataDeNghi.forEach((e) => { 
      var dataItem = this.listDataUse.filter((c) => c.productId == e.productId);
      
      totalQuantity += ParseStringToFloat(e.soLuongDeNghi);
      if (dataItem != null && dataItem != undefined) {
        dataItem.forEach((item) => {
          let data = {
            tenHangHoa: e.tenVatTu ? e.tenVatTu : "",
            donViTinh: e.donViTinh ? e.donViTinh : "",
            soLuong: item.quantityRequire ? item.quantityRequire : "",
            lotNo: item.lotNoName ? item.lotNoName : "",
            ghiChu: item.note ? item.note : "",
            tongSoLuong: "",
          };
          listData.push(data);
        });
      }
    });

    let radioButton =
      this.inventoryDeliveryVoucher.inventoryDeliveryVoucherReason;

    let dateFrom = null;
    let dateTo = null;
    let dateFromTuan = null;
    let dateFromThang = null;
    
    if (radioButton == 1) {
      dateFrom = this.dateNgay;

    } else if (radioButton == 2) {
      dateFromTuan = this.hangTuanForm.controls.tuNgayControl.value;
      dateTo = this.hangTuanForm.controls.denNgayControl.value;

    } else if (radioButton == 3) {
      dateFromThang = this.hangThangControl.value;
    }

    let body = {
      template: 1,
      date: new Date(this.thoiGian).getDate(),
      month: new Date(this.thoiGian).getMonth() + 1,
      year: new Date(this.thoiGian).getFullYear(),
      boPhan: this.boPhan,
      nguoiDeNghi: this.nguoiDeNghi,
      deNghiTextKhoSX:
        this.inventoryDeliveryVoucher.inventoryDeliveryVoucherType,
      deNghiTextKhoHC:
        this.inventoryDeliveryVoucher.inventoryDeliveryVoucherType,
      xhn: this.inventoryDeliveryVoucher.inventoryDeliveryVoucherReason,
      xht: this.inventoryDeliveryVoucher.inventoryDeliveryVoucherReason,
      xhth: this.inventoryDeliveryVoucher.inventoryDeliveryVoucherReason,
      xvpp: this.inventoryDeliveryVoucher.inventoryDeliveryVoucherReason,
      dateN: dateFrom == null ? "" : new Date(dateFrom).getDate(),
      monthN: dateFrom == null ? "" : new Date(dateFrom).getMonth() + 1,
      yearN: dateFrom == null ? "" : new Date(dateFrom).getFullYear(),
      dateWF: dateFromTuan == null ? "" : new Date(dateFromTuan).getDate(),
      monthWF:
        dateFromTuan == null ? "" : new Date(dateFromTuan).getMonth() + 1,
      yearWF: dateFromTuan == null ? "" : new Date(dateFromTuan).getFullYear(),
      dateWT: dateTo == null ? "" : new Date(dateTo).getDate(),
      monthWT: dateTo == null ? "" : new Date(dateTo).getMonth() + 1,
      yearWT: dateTo == null ? "" : new Date(dateTo).getFullYear(),
      yearThang:
        dateFromThang == null ? "" : new Date(dateFromThang).getFullYear(),
      monthTh:
        dateFromThang == null ? "" : new Date(dateFromThang).getMonth() + 1,
      listData: listData ? listData : "",
      tongSoLuong: totalQuantity == 0 ? "" : totalQuantity,
    };

    this.exportFileWordService.saveFileWord(
      body,
      `Phiếu đề nghị xuất kho hàng hóa, vật tư, văn phòng phẩm.docx`
    );
  }

  addField() {
    this.selectVatTu.listProductLotNoMapping.forEach((y, index) => {
      this.selectVatTu.listProductLotNoMapping[index] = {
        lotNoId: y.lotNoId,
        lotNoName: y.lotNoName,
        note: y.note,
        packagingStatus: y.packagingStatus,
        productId: y.productId,
        productLotNoMappingId: y.productLotNoMappingId,
        productStatus: y.productStatus,
        quantity: y.quantity,
        quantityDelivery: y.quantityDelivery,
        quantityInventory: y.quantityInventory,
        quantityRequest: y.quantityRequest,
        dataLotNo: this.selectVatTu.listProductLotNoMapping,
      };
    });
  }

  luuDialog() {
    //loại bỏ data trống
    // this.listDataDialog = this.listDataDialog.filter(
    //   (x) =>
    //     x.lotNoId != "" &&
    //     x.lotNo != null &&
    //     x.soLuongDeNghi != 0 &&
    //     ParseStringToFloat(x.tonKho) >= ParseStringToFloat(x.soLuongDeNghi)
    // ); //&& ParseStringToFloat(x.tonKho) > ParseStringToFloat(x.soLuongDeNghi)

    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if(checkLotNo.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng chọn LotNo!",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if(checkSoLuong.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!",};
      this.showMessage(msg);
      return;
    }

    if (this.listDataDialog.length > 0) {
      let data: MapDataTable = {
        productId: this.selectVatTu.productId,
        tenVatTu: this.selectVatTu.productName,
        donViTinh: this.donViTinh,
        soLuongDeNghi: this.tongSoLuongDeNghi,
        ghiChu: "",
        soLuongGiao: 0,
        tonKho: 0,
      };
      this.listDataDeNghi.push(data);

      this.listDataDialog.forEach((i) => {
        let dataUse: MapDataList = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: this.selectVatTu.productId,
          productCode: "",
          quantityRequire: ParseStringToFloat(i.soLuongDeNghi), //So luong de nghi
          quantityInventory: ParseStringToFloat(i.tonKho),
          quantity: 0,
          price: 0,
          warehouseId: this.emptyGuid,
          note: i.ghiChu,
          active: true,
          createdDate: new Date(),
          createdById: this.emptyGuid,
          listSerial: [],
          discountValue: 0,
          totalSerial: 0,
          quantityDelivery: 0, //So luong giao
          productReuse: "",
          lotNoId: i.lotNoId,
          lotNoName: i.lotNo.lotNoName,
          productName: this.selectVatTu.productName,
          wareHouseName: "",
          unitName: this.donViTinh,
          nameMoneyUnit: "",
          sumAmount: 0,
          wareHouseType: 0,
        };
        this.listDataUse.push(dataUse);
      });

      // let msg = {
      //   severity: "success",
      //   summary: "Thông báo:",
      //   detail: "Thêm vật tư thành công!",
      // };
      // this.showMessage(msg);
    } else {
      // let msg = {
      //   severity: "warn",
      //   summary: "Thông báo:",
      //   detail: "Thêm mới vật từ không thành công!",
      // };
      // this.showMessage(msg);
    }

    this.huyDialog();
  }

  luuDialogEdit() {
   

    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if(checkLotNo.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng chọn LotNo.",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if(checkSoLuong.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho.",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuongGiao = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongGiao));
    if(checkSoLuongGiao.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng giao phải nhỏ hơn hoặc bằng tồn kho.",};
      this.showMessage(msg);
      return;
    }

    if (this.listDataDialog.length > 0) {
      this.tinhTong();

      this.listDataUse = this.listDataUse.filter((x) => x.productId != this.selectVatTu.productId);

      this.listDataDialog.forEach((z) => {
        let data: MapDataList = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: this.selectVatTu.productId,
          productCode: "",
          quantityRequire: ParseStringToFloat(z.soLuongDeNghi), //So luong de nghi
          quantityInventory: ParseStringToFloat(z.tonKho),
          quantity: 0,
          price: 0,
          warehouseId: this.emptyGuid,
          note: z.ghiChu,
          active: true,
          createdDate: new Date(),
          createdById: this.emptyGuid,
          listSerial: [],
          discountValue: 0,
          totalSerial: 0,
          quantityDelivery: ParseStringToFloat(z.soLuongGiao), //So luong giao
          productReuse: "",
          lotNoId: z.lotNoId,
          lotNoName: z.lotNo.lotNoName,
          productName: this.selectVatTu.productName,
          wareHouseName: "",
          unitName: this.donViTinh,
          nameMoneyUnit: "",
          sumAmount: 0,
          wareHouseType: 0,
        };
        this.listDataUse.push(data);
      });
      this.gopData();
      // let msg = {
      //   severity: "success",
      //   summary: "Thông báo:",
      //   detail: "Thêm vật tư thành công!",
      // };
      // this.showMessage(msg);
    } else {
      // let msg = {
      //   severity: "warn",
      //   summary: "Thông báo:",
      //   detail: "Thêm mới vật từ không thành công!",
      // };
      // this.showMessage(msg);
    }
    this.huyDialogEdit();
    this.huyDialogEdit2();
    this.huyDialogEdit3();
  }

  gopData() {
    let listId = [];
    let listIdUni = [];
    this.listDataDeNghi = [];
    this.listDataUse.forEach((x) => {
      listId.push(x.productId);
    });

    for (var i = 0; i < listId.length; i++) {
      if (listIdUni.indexOf(listId[i]) === -1) {
        listIdUni.push(listId[i]);
      }
    }

    listIdUni.forEach((y) => {
      let tongSoLuong = 0;
      let donViTinh = "";
      let vatTuName = "";
      let productId = "";
      let soLuongGiao = 0;
      let tonKho = 0;
      let ghiChu = "";
      this.listDataUse.forEach((z) => {
        if (y == z.productId) {
          tongSoLuong += ParseStringToFloat(z.quantityRequire);
          donViTinh = this.listProductCheck.find(
            (i) => i.productId == y
          ).productUnitName;
          productId = z.productId;
          soLuongGiao += ParseStringToFloat(z.quantityDelivery);
          tonKho += ParseStringToFloat(z.quantityInventory);
          // ghiChu = z.Note
        }
      });
      vatTuName = this.listProductCheck.find(
        (i) => i.productId == y
      ).productName;
      let data: MapDataTable = {
        // stt: null,
        // vatTuId: y,
        productId: productId,
        tenVatTu: vatTuName,
        donViTinh: donViTinh,
        soLuongDeNghi: tongSoLuong,
        ghiChu: null,
        soLuongGiao: soLuongGiao,
        tonKho: tonKho,
      };
      this.listDataDeNghi.push(data);
    });
  }

  huyDialogEdit() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTuEdit.reset();
    this.deNghiXuatKhoEdit = false;
  }

  huyDialogEdit2() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTuEdit.reset();
    this.deNghiXuatKhoEdit2 = false;
  }

  huyDialogEdit3() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTuEdit.reset();
    this.deNghiXuatKhoEdit3 = false;
  }

  checkVatTu(data) {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData();
      return;
    }

    if (data) {
      this.listDataDialog = [];
      this.donViTinh = data.value.productUnitName;
      this.soLuongTon = data.value.quantityInventory;
      // this.listDataDialog = data.listProductLotNoMapping
      this.selectVatTu = data.value;
      this.addField();
      this.themMoiDialog();
    }
  }

  hiddenOption(index) {
    if (index != null) {
      if (this.listDataDialog.length > 1) {
        this.listDataDialog.forEach((x, i) => {
          let listId = [];
          this.listDataDialog.forEach((y, z) => {
            if (z != i) {
              listId.push(y.lotNoId);
            }
          });
          if (i != index) {
            this.listDataDialog[i] = {
              lotNoId: x.lotNoId,
              lotNo: x.lotNo,
              tonKho: x.tonKho,
              soLuongDeNghi: x.soLuongDeNghi,
              soLuongGiao: x.soLuongGiao,
              ghiChu: x.ghiChu,
              thaoTac: null,
              dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
                (x, i) => listId.indexOf(x.lotNoId) == -1
              ), //listId.indexOf(x.lotNoId) == -1
            };
          }
        });
      }
    } else {
      if (this.listDataDialog.length > 1) {
        this.listDataDialog.forEach((x, i) => {
          let listId = [];
          this.listDataDialog.forEach((y, z) => {
            if (z != i) {
              listId.push(y.lotNoId);
            }
          });
          this.listDataDialog[i] = {
            lotNoId: x.lotNoId,
            lotNo: x.lotNo,
            tonKho: x.tonKho,
            soLuongDeNghi: x.soLuongDeNghi,
            soLuongGiao: x.soLuongGiao,
            ghiChu: x.ghiChu,
            thaoTac: null,
            dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
              (x, i) => listId.indexOf(x.lotNoId) == -1
            ), //listId.indexOf(x.lotNoId) == -1
          };
        });
      }
    }
  }

  huyDialog() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTu.reset();
    // this.getMasterData()
    this.deNghiXuatKho = false;
  }

  xoaDataTable(data, i) {
    this.listDataDeNghi = this.listDataDeNghi.filter(
      (x) => x.tenVatTu != data.tenVatTu
    );
    this.listDataUse = this.listDataUse.filter(
      (x) => x.productName != data.tenVatTu
    );
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

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
}

function formatDatetime(time: Date) {
  let date = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  return `${date}/${month}/${year}`;
}

function convertDate(time: any) {
  let ngay = time.getDate()
  let thang = time.getMonth() + 1
  let nam = time.getFullYear()
  return `${ngay}/${thang}/${nam}`
};
