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

class MapLotNo {
  lotNoId: number;
  lotNoName: string;
  productId: string;
  productLotNoMappingId: string;
  quantity: number;
  quantityDelivery: number;
  quantityInventory: number;
  quantityRequest: number;
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
  InventoryDeliveryVoucherMappingId: string
  InventoryDeliveryVoucherId: string
  ProductId: string
  ProductCode: string
  QuantityRequire: number //So luong de nghi
  QuantityInventory: number
  Quantity: number
  Price: number
  WarehouseId: string
  Note: string
  Active: boolean
  CreatedDate: Date
  CreatedById: string

  ListSerial: Array<MapSerial>
  DiscountValue: number
  TotalSerial: number
  QuantityDelivery: number //So luong giao
  ProductReuse: string
  LotNoId: number
  LotNoName: string
  ProductName: string
  WareHouseName: string
  UnitName: string
  NameMoneyUnit: string
  SumAmount: number
  WareHouseType: number
  ProductType: number
}

class mapDataDialog {
  lotNoId: any;
  lotNo: any;
  tonKho: number;
  soLuongDeNghi: number;
  ghiChu: string;
  thaoTac: any;
  dataLotNo: any
}


class MapDataTable {
  productId: string;
  tenVatTu: string;
  donViTinh: string;
  soLuongDeNghi: number;
  ghiChu: string;
}


@Component({
  selector: "app-de-nghi-xuat-kho-create",
  templateUrl: "./de-nghi-xuat-kho-create.component.html",
  styleUrls: ["./de-nghi-xuat-kho-create.component.css"],
})
export class DeNghiXuatKhoCreateComponent implements OnInit {
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
  // noteControl: FormControl;
  productControl: FormControl;

  noteControl: string;

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
  lyDo: number = 1;

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
  listLotNo: Array<any> = [];
  listLotNoCheck: any;
  selectLotNo: any;

  colsDanhSach: Array<any> = [];
  vatTu: FormGroup;
  vatTuControl: FormControl;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  listDataUse: Array<MapDataList> = [];
  deNghiXuatKhoEdit: boolean = false;
  warehouseType: number;
  productType: number;

  hangTuanForm: FormGroup;
  tuNgayControl: FormControl;
  denNgayControl: FormControl;

  hangThangForm: FormGroup;
  hangThangControl: FormControl;

  // action
  actionAdd: boolean = true;
  actionView: boolean = true;

  productName: any = "";
  indexChooseData: any = null;
  auth: any = JSON.parse(localStorage.getItem('auth'));

  constructor(
    private getPermission: GetPermission,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
    private _warehouseService: WarehouseService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private el: ElementRef
  ) {
    this.route.params.subscribe((params) => {
      if (params["WarehouseType"]) {
        this.warehouseType = params["WarehouseType"];
      }

      if (params["ProductType"]) {
        this.productType = params["ProductType"];
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

    let resource = "war/warehouse/de-nghi-xuat-kho/create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
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

  refreshFilter() { }

  showFilter() { }

  async getMasterData() {
    this.loading = true;

    let [getMaterDataResult]: any = await Promise.all([
      this._warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
        this.warehouseType,
        this.productType
      ),
    ]);
    if ( getMaterDataResult.statusCode == 200 ) {
      this.userName = getMaterDataResult.nameCreate;
      this.department = getMaterDataResult.employeeDepartment;
      this.listProduct = getMaterDataResult.listProduct;
      this.listProductCheck = getMaterDataResult.listProduct;

      let [getListWarehouse]: any = await Promise.all([
        this._warehouseService.getListWareHouseAsync(3, this.auth.OrganizationId),
      ]);
      if (getMaterDataResult.statusCode == 200) {
        this.listWarehouseNhan = getListWarehouse.listWareHouse;
        this.selectKhoNhan = this.listWarehouseNhan[0];
      }
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

  setDefaultValue() { }

  onViewDetail(data: MapDataTable) {
    this.indexChooseData = this.listDataDeNghi.indexOf(data);

    this.deNghiXuatKhoEdit = true;
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
      if (x.ProductId == this.vatTuControlEdit.value.productId) {
        let mapDataDialog: mapDataDialog = {
          lotNoId: this.vatTuControlEdit.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.LotNoId
          ).lotNoId,
          lotNo: this.vatTuControlEdit.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.LotNoId
          ),
          tonKho: x.QuantityInventory,
          soLuongDeNghi: x.QuantityRequire,
          ghiChu: x.Note,
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
    this.productName = this.vatTuControlEdit.value.productName;
  }

  updateLotNo() {
    // if (this.listDataDialog.length > 1) {
    //   this.listDataDialog.forEach(e => {
    //     this.listLotNo.forEach((x: MapLotNo, i) => {
    //       if (e.lotNo) {
    //         if (e.lotNo.lotNoId == x.lotNoId) {
    //           this.listLotNo[i] = {
    //             lotNoId: x.lotNoId,
    //             lotNoName: x.lotNoName,
    //             productId: x.productId,
    //             productLotNoMappingId: x.productLotNoMappingId,
    //             quantity: x.quantity,
    //             quantityDelivery: x.quantityDelivery,
    //             quantityInventory: x.quantityInventory,
    //             quantityRequest: x.quantityRequest,
    //           }
    //         }
    //       }
    //     })
    //   })
    // }
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  goBack() {
    this.router.navigate(["/warehouse/de-nghi-xuat-kho/list"]);
  }

  /*Tạo mới phiếu nhập kho*/
  taoPhieuNhapKho(mode: boolean) {
    /* check condition form */
    if (this.lyDo == 2) {
      if (!this.hangTuanForm.valid) {
        Object.keys(this.hangTuanForm.controls).forEach((key) => {
          if (this.hangTuanForm.controls[key].valid == false) {
            this.hangTuanForm.controls[key].markAsTouched();
          }
        });
        return;
      }
    } else if (this.lyDo == 3) {
      if (!this.hangThangForm.valid) {
        Object.keys(this.hangThangForm.controls).forEach((key) => {
          if (this.hangThangForm.controls[key].valid == false) {
            this.hangThangForm.controls[key].markAsTouched();
          }
        });
        return;
      }
    }

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
          if (mode) {
            this.resetForm();
            let msg = {
              severity: "success",
              summary: "Thông báo:",
              detail: "Thêm mới thành công",
            };
            this.showMessage(msg);
          }
          //Lưu
          else {
            //Chuyển đến trang chi tiết phiếu nhập kho
            this.router.navigate([
              "/warehouse/de-nghi-xuat-kho/detail",
              {
                inventoryDeliveryVoucherId: result.inventoryDeliveryVoucherId,
                warehouseType: this.warehouseType,
              },
            ]);
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

  mapDataToModelPhieuNhapKho() {
    let inventoryReceiving: MapData = {
      InventoryDeliveryVoucherId: this.emptyGuid,
      InventoryDeliveryVoucherCode: null,
      StatusId: this.emptyGuid,
      InventoryDeliveryVoucherType: this.deNghi,
      WarehouseId: this.emptyGuid,
      ObjectId: this.emptyGuid,
      Reason: null,
      InventoryDeliveryVoucherDate: new Date(), //this.ngayHienTai ? new Date(parseStringToDate(this.ngayHienTai)) : null
      InventoryDeliveryVoucherTime: null,
      Active: true,
      CreatedDate: new Date(),
      CreatedById: this.emptyGuid,
      UpdatedDate: null,
      UpdatedById: null,
      Description: null,
      InventoryDeliveryVoucherCategory: null,
      WarehouseRequest: null,
      Note: this.noteControl,
      InventoryDeliveryVoucherReason: this.lyDo
        ? ParseStringToFloat(this.lyDo)
        : null,
      Day: this.dateNgay ? new Date(this.dateNgay) : null, //
      DateFrom: this.tuNgayControl.value
        ? new Date(this.tuNgayControl.value)
        : null, //
      DateTo: this.denNgayControl.value
        ? new Date(this.denNgayControl.value)
        : null, //
      Month: this.hangThangControl.value
        ? new Date(this.hangThangControl.value)
        : null, //
      WarehouseReceivingId: this.selectKhoNhan.warehouseId,
      InventoryDeliveryVoucherScreenType: null,
      WarehouseCategory: this.warehouseType,
    };

    return inventoryReceiving;
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
    this.noteControl = '';

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
    this.indexChooseData = -1;
    if (data == false) {
      this.deNghiXuatKho = !this.deNghiXuatKho;
      this.tongSoLuongDeNghi = 0;
      this.tongTonKho = 0;
      //loại bỏ sản phẩm đã được thêm vào danh sách trước đó khỏi dropdown
      this.listDataDeNghi.forEach((i) => {
        this.listProduct = this.listProduct.filter(
          (x) => x.productName != i.tenVatTu
        );
      });
    }
  }

  changeLyDo() {
    this.hangThangControl.reset();
    this.tuNgayControl.reset();
    this.denNgayControl.reset();
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
    if (checkLotNo.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Vui lòng chọn LotNo!", };
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if (checkSoLuong.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!", };
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
  }

  themMoiDialogEdit() {

    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if (checkLotNo.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Vui lòng chọn LotNo!", };
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if (checkSoLuong.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!", };
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

  xoaDeXuat(data, index) {
    this.listDataDialog = this.listDataDialog.filter((x) => x != data);
    this.hiddenOption(index);
    this.tinhTong();
    // this.updateLotNo()
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

  tinhTong() {
    this.tongTonKho = 0;
    this.tongSoLuongDeNghi = 0;
    this.listDataDialog.forEach((i) => {
      // không tính tổng cho các lotno trống
      if (i.lotNo != "") {
        this.tongTonKho += ParseStringToFloat(i.tonKho);
        this.tongSoLuongDeNghi += ParseStringToFloat(i.soLuongDeNghi);
      }
    });
  }

  luuDialog() {

    //loại bỏ data trống
    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if (checkLotNo.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Vui lòng chọn LotNo!", };
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if (checkSoLuong.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!", };
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
      };
      this.listDataDeNghi.push(data);

      this.listDataDialog.forEach((i) => {
        let dataUse: MapDataList = {
          InventoryDeliveryVoucherMappingId: this.emptyGuid,
          InventoryDeliveryVoucherId: this.emptyGuid,
          ProductId: this.selectVatTu.productId,
          ProductCode: "",
          QuantityRequire: ParseStringToFloat(i.soLuongDeNghi), //So luong de nghi
          QuantityInventory: ParseStringToFloat(i.tonKho),
          Quantity: 0,
          Price: 0,
          WarehouseId: this.emptyGuid,
          Note: i.ghiChu,
          Active: true,
          CreatedDate: new Date(),
          CreatedById: this.emptyGuid,
          ListSerial: [],
          DiscountValue: 0,
          TotalSerial: 0,
          QuantityDelivery: 0, //So luong giao
          ProductReuse: "",
          LotNoId: i.lotNoId,
          LotNoName: i.lotNo.lotNoName,
          ProductName: this.selectVatTu.productName,
          WareHouseName: "",
          UnitName: this.donViTinh,
          NameMoneyUnit: "",
          SumAmount: 0,
          WareHouseType: this.warehouseType,
          ProductType: this.productType,
        };
        this.listDataUse.push(dataUse);
      });

      // let msg = {
      //   severity: "success",
      //   summary: "Thông báo:",
      //   detail: "Thêm vật tư thành công!",
      // };
      // this.showMessage(msg);
    }
    else {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Thêm mới vật tư không thành công!",
      };
      this.showMessage(msg);
      return;
    }

    this.huyDialog();
  }

  luuDialogEdit() {
    //loại bỏ data trống
    let checkLotNo = this.listDataDialog.filter((x) => x.lotNo == null);
    if (checkLotNo.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Vui lòng chọn LotNo!", };
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listDataDialog.filter((x) => ParseStringToFloat(x.tonKho) < ParseStringToFloat(x.soLuongDeNghi));
    if (checkSoLuong.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Số lượng đề nghị phải nhỏ hơn hoặc bằng tồn kho!", };
      this.showMessage(msg);
      return;
    }


    if (this.listDataDialog.length > 0) {
      this.listDataUse = this.listDataUse.filter(
        (x) => x.ProductId != this.selectVatTu.productId
      );

      this.listDataDialog.forEach((z) => {
        let data: MapDataList = {
          InventoryDeliveryVoucherMappingId: this.emptyGuid,
          InventoryDeliveryVoucherId: this.emptyGuid,
          ProductId: this.selectVatTu.productId,
          ProductCode: "",
          QuantityRequire: ParseStringToFloat(z.soLuongDeNghi), //So luong de nghi
          QuantityInventory: ParseStringToFloat(z.tonKho),
          Quantity: 0,
          Price: 0,
          WarehouseId: this.emptyGuid,
          Note: z.ghiChu,
          Active: true,
          CreatedDate: new Date(),
          CreatedById: this.emptyGuid,
          ListSerial: [],
          DiscountValue: 0,
          TotalSerial: 0,
          QuantityDelivery: 0, //So luong giao
          ProductReuse: "",
          LotNoId: z.lotNoId,
          LotNoName: z.lotNo.lotNoName,
          ProductName: this.selectVatTu.productName,
          WareHouseName: "",
          UnitName: this.donViTinh,
          NameMoneyUnit: "",
          SumAmount: 0,
          WareHouseType: this.warehouseType,
          ProductType: this.productType,
        };
        this.listDataUse.push(data);
      });

      this.tinhTong();
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
  }

  gopData() {
    if (this.indexChooseData != null && this.indexChooseData > -1) {
      this.listDataDeNghi[this.indexChooseData].soLuongDeNghi = this.tongSoLuongDeNghi;
    }

    //let listId = [];
    //let listIdUni = [];
    //this.listDataDeNghi = [];
    //this.listDataUse.forEach((x) => {
    //  listId.push(x.ProductId);
    //});

    //for (var i = 0; i < listId.length; i++) {
    //  if (listIdUni.indexOf(listId[i]) === -1) {
    //    listIdUni.push(listId[i]);
    //  }
    //}

    //listIdUni.forEach((y, index) => {
    //  let tongSoLuong = 0;
    //  let donViTinh = "";
    //  let vatTuName = "";
    //  let productId = "";
    //  let ghiChu = "";
    //  this.listDataUse.forEach((z) => {
    //    if (y == z.ProductId) {
    //      // tongSoLuong += ParseStringToFloat(z.QuantityActual)
    //      donViTinh = this.listProductCheck.find(
    //        (i) => i.productId == y
    //      ).productUnitName;
    //      productId = z.ProductId;
    //      tongSoLuong = z.QuantityRequire;
    //      ghiChu = z.Note
    //    }
    //  });
    //  vatTuName = this.listProductCheck.find(
    //    (i) => i.productId == y
    //  ).productName;
    //  let data: MapDataTable = {
    //    // stt: null,
    //    // vatTuId: y,
    //    productId: productId,
    //    tenVatTu: vatTuName,
    //    donViTinh: donViTinh,
    //    soLuongDeNghi: tongSoLuong,
    //    ghiChu: ghiChu,
    //  };

    //  if (this.indexChooseData != null && this.indexChooseData > -1) {
    //    data = {
    //      // stt: null,
    //      // vatTuId: y,
    //      productId: productId,
    //      tenVatTu: vatTuName,
    //      donViTinh: donViTinh,
    //      soLuongDeNghi: this.tongSoLuongDeNghi,
    //      ghiChu: ghiChu,
    //    };
    //  }
    //  this.listDataDeNghi.push(data);
    //});
  }

  huyDialogEdit() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTuEdit.reset();
    // this.getMasterData()
    this.deNghiXuatKhoEdit = false;
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
      this.listLotNo = [];
      this.listLotNo = data.value.listProductLotNoMapping;
      this.donViTinh = data.value.productUnitName;
      this.soLuongTon = data.value.quantityInventory;
      // this.listDataDialog = data.listProductLotNoMapping
      this.selectVatTu = data.value;
      this.addField();
      this.themMoiDialog();
    }
  }

  huyDialog() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTu.reset();
    this.deNghiXuatKho = false;
  }

  disableLotNo() {
    // this.listDataDialog.forEach(i => {
    //   this.listLotNo = this.listLotNoCheck.filter(x => x.lotNoId != i.lotNoId)
    // })
  }

  onRowEditSave(data, i) { }

  onRowEditCancel(data, i) { }

  onRowEditInit(data) { }

  xoaDataTable(data, i) {
    this.listDataDeNghi = this.listDataDeNghi.filter(
      (x) => x.tenVatTu != data.tenVatTu
    );
    this.listDataUse = this.listDataUse.filter(
      (x) => x.ProductName != data.tenVatTu
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

function parseStringToDate(data: string) {
  let a = data.split('/')
  let date = a[0]
  let month = a[1]
  let year = a[2]
  return new Date(`${month}/${date}/${year}`)
}
