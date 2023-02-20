import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import * as $ from 'jquery';
import { WarehouseService } from '../../../services/warehouse.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InventoryReceivingVoucherModel } from '../../../models/InventoryReceivingVoucher.model';
import { InventoryReceivingVoucherMapping } from '../../../models/inventoryReceivingVoucherMapping.model';
import { TreeNode } from 'primeng/api';
import { Table } from 'primeng/table';
import { FileUpload } from 'primeng/fileupload';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';

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
  ghiChu: string;
  thaoTac: any;
  dataLotNo: any;
}

class MapDataTable {
  productId: string;
  tenVatTu: string;
  donViTinh: string;
  soLuongDeNghi: number;
  ghiChu: string;
}

class ChiTietLotNo {
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityActual: any;
  quantityProduct: any;
  quantityOK: any;
  quantityNG: any;
  quantityPending: any;
  productName: any;
  unitName: any;
  lotNoName: any;
  lotNoId: any;
}

class SanPhamPhieuNhapKhoModel {
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityActual: any;
  quantityProduct: any;
  quantityOK: any;
  quantityNG: any;
  quantityPending: any;
  productName: any;
  unitName: any;
  listChiTietLotNo: Array<ChiTietLotNo>;
  lotNoId: any;
  lotNoName: any;
}


@Component({
  selector: "app-chi-tet-nhap",
  templateUrl: "./chi-tet-nhap.component.html",
  styleUrls: ["./chi-tet-nhap.component.css"],
})
export class ChiTetNhapComponent implements OnInit {
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
  listItemGroup: Array<SanPhamPhieuNhapKhoModel> = [];

  selectedIndex: number = null;

  /*Dữ liệu*/

  loaiPhieuNhapType: number = 1;
  listCurrentChips: Array<string> = [];
  listVendor: Array<Vendor> = [];
  listWarehouseNhan: Array<Warehouse> = [];
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
  noteControl: FormControl;
  productControl: FormControl;

  khoNhanControl: FormControl;
  khoNhanForm: FormGroup;

  dataDNXK: any;

  /*Popup Kho list Kho con*/
  choiceKho: boolean = false;
  listDetailWarehouse: TreeNode[];
  selectedWarehouseChilren: TreeNode;
  /*End*/

  status: any;

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
  listDataDeNghi: Array<any> = [];

  listDataDialog: Array<mapDataDialog> = [];
  tongTonKho: number = 0;
  tongSoLuongDeNghi: number = 0;

  donViTinh: any = "";
  soLuongTon: any = "";
  selectVatTu: any;
  listLotNo: any;
  listLotNoCheck: any;
  selectLotNo: any;

  colsDanhSach: Array<any> = [];
  vatTu: FormGroup;
  vatTuControl: FormControl;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  listDataUse: Array<MapDataList> = [];
  deNghiXuatKhoEdit: boolean = false;
  id: string;

  inventoryDeliveryVoucher: any;
  khoNhanSelect: any;
  trangThaiText: string;
  trangThai: number;
  warehouseType: number;

  hangTuanForm: FormGroup;
  tuNgayControl: FormControl;
  denNgayControl: FormControl;

  hangThangForm: FormGroup;
  hangThangControl: FormControl;

  maHeThong: any;

  khoNhap: string;
  ngayNhap: string;
  loaiPhieu: number;

  constructor(
    private getPermission: GetPermission,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
    private _warehouseService: WarehouseService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      if (params["inventoryReceivingVoucherId"]) {
        this.id = params["inventoryReceivingVoucherId"];
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
    this.initTable();
    this.setForm();
    this.ngayHienTai = formatDatetime(new Date());
    let resource = "war/warehouse/inventory-receiving-voucher/create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
    }

    this.getMasterData(true);
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
        field: "productName",
        header: "Tên thành phẩm",
        width: "150px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "unitName",
        header: "Đơn vị tính",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityProduct",
        header: "Số lượng sản xuất",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityOK",
        header: "Số lượng OK",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityPending",
        header: "Số lượng pending",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      }
    ];
  }

  setForm() {}

  refreshFilter() {}

  showFilter() {}

  async getMasterData(mode: any) {
    this.loading = true;
    debugger
    let [getMaterDataResult, getListWarehouse]: any = await Promise.all([
      this._warehouseService.getDetailPhieuNhapKhoTPAsync(this.id, 4),

      this._warehouseService.getListWareHouseAsync(4, ""),
    ]);
    if (
      getMaterDataResult.statusCode == 200 &&
      getListWarehouse.statusCode == 200
    ) {
      this.inventoryDeliveryVoucher = getMaterDataResult.phieuNhapKho;
      this.listDataDeNghi = getMaterDataResult.listItemDetail;
      this.listProduct = getMaterDataResult.listProduct;
      this.listWarehouseNhan = getListWarehouse.listWareHouse;

      this.status = getMaterDataResult.phieuNhapKho.intStatus;

      if (mode) {
        getMaterDataResult.listItemGroup.forEach((element) => {
          getMaterDataResult.listItemDetail.forEach((item) => {
            let itemGroup: SanPhamPhieuNhapKhoModel = {
              inventoryReceivingVoucherMappingId: this.emptyGuid,
              inventoryReceivingVoucherId: this.emptyGuid,
              productId: element.productId,
              quantityActual: element.quantityActual,
              quantityProduct: element.quantityProduct,
              quantityOK: element.quantityOK,
              quantityNG: element.quantityNG,
              quantityPending: element.quantityPending,
              productName: element.productName,
              unitName: element.unitName,
              lotNoId: item.lotNoId,
              lotNoName: item.lotNoName,
              listChiTietLotNo: [],
            };
            this.listItemGroup.push(itemGroup);
          });
          })

        getMaterDataResult.listItemDetail.forEach((element) => {
          let lotno: ChiTietLotNo = {
            inventoryReceivingVoucherMappingId: this.emptyGuid,
            inventoryReceivingVoucherId: this.emptyGuid,
            productId: element.productId,
            lotNoId: element.lotNoId,
            lotNoName: element.lotNoName,
            quantityActual: element.quantityActual,
            quantityProduct: element.quantityProduct,
            quantityOK: element.quantityOK,
            quantityNG: element.quantityNG,
            quantityPending: element.quantityPending,
            unitName: element.unitName,
            productName: element.productName,
          };
          let productGroup = this.listItemGroup.find(
            (i) => i.productId == element.productId
          );
          productGroup.listChiTietLotNo.push(lotno);
        });
      }
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Lấy dữ liệu không thành công",
      };
      this.showMessage(msg);
      this.loading = false;
    }
    this.setDefaultValue();
    this.loading = false;
  }

  onViewDetail(rowData: any) {
  }

  deleteItemGroup(rowData: any) {
    this.listItemGroup = this.listItemGroup.filter((x) => x.productId != rowData.productId);
  }

  setDefaultValue() {
    this.khoNhap = this.listWarehouseNhan.find(
      (x) => x.warehouseId == this.inventoryDeliveryVoucher.warehouseId
    ).warehouseName;
    this.ngayNhap = formatDatetime(
      new Date(this.inventoryDeliveryVoucher.inventoryReceivingVoucherDate)
    );
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  goBack() {
    this.router.navigate(["/warehouse/thanh-pham-nhap/list"]);
  }

  nhapKho() {
    this._warehouseService.guiNhapKhoTP(this.id).subscribe(
      (response) => {
        var result = <any>response;
        this.messageService.clear();
        // this.resetForm();
        this.messageService.add({
          key: "success",
          severity: "success",
          summary: result.messageCode,
          detail: "Xuất kho",
        });
        this.getMasterData(false);
      },
      (error) => {
        this.messageService.clear();
        this.messageService.add({
          key: "error",
          severity: "error",
          summary: error.messageCode,
          detail: "Xuất kho",
        });
      }
    );
  }

  mapDataToModelPhieuNhapKho() {
    let inventoryReceivingVoucherModel: InventoryReceivingVoucherModel = {
      CreatedName: this.userName,
      InventoryReceivingVoucherDate: convertToUTCTime(new Date(this.ngayNhap)),
      InventoryReceivingVoucherType: this.loaiPhieu,
      InventoryReceivingVoucherTypeName:
        this.loaiPhieu == 6
          ? "Nhập thành phẩm sau đóng gói"
          : "Nhập thành phẩm sau kiểm tra",
      OrderDate: null,
      InvoiceDate: null,
      InvoiceNumber: null,
      PartnersName: null,
      ShiperName: null,
      StatusName: "Mới",
      WarehouseCategoryTypeId: this.emptyGuid,
      ProducerName: null,
      OrderNumber: null,
      WarehouseId: this.khoNhap,
      InventoryReceivingVoucherId: this.id,
      InventoryReceivingVoucherCode: "",
      StatusId: this.emptyGuid,
      Active: true,
      CreatedDate: null,
      CreatedById: this.emptyGuid,
      UpdatedDate: null,
      UpdatedById: this.emptyGuid,
      Description: "",
      ObjectId: this.emptyGuid,
      Storekeeper: this.emptyGuid,
      InventoryReceivingVoucherTime: null,
      LicenseNumber: 0,
      ExpectedDate: null,
      PartnersId: this.emptyGuid,
      InventoryReceivingVoucherCategory: null,
      VendorId: null,
      Note: "",

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
    this.noteControl.reset();

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
      let ghiChu = "";
      this.listDataUse.forEach((z) => {
        if (y == z.productId) {
          tongSoLuong += ParseStringToFloat(z.quantityRequire);
          donViTinh = this.listProductCheck.find(
            (i) => i.productId == y
          ).productUnitName;
          productId = z.productId;
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
      };
      this.listDataDeNghi.push(data);
    });
  }

  onRowEditSave(data, i) {}

  onRowEditCancel(data, i) {}

  onRowEditInit(data) {}

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
