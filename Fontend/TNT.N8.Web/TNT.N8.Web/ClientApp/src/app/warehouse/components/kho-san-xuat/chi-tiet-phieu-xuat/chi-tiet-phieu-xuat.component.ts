import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  Renderer2,
  HostListener,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationService, DialogService, DynamicDialogRef, FileUpload, MessageService, Table } from "primeng";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { NoteModel } from "../../../../shared/models/note.model";
import { GetPermission } from "../../../../shared/permission/get-permission";
import { CategoryService } from "../../../../shared/services/category.service";
import { InventoryDeliveryVoucher, InventoryDeliveryVoucherModel } from "../../../models/InventoryDeliveryVoucher.model";
import { WarehouseService } from "../../../services/warehouse.service";
import { ChonNhieuDvDialogComponent } from '../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';


class LoaiPhieuXuat {
  name: string;
  type: number;
}

class mapDataDialog {
  lotNoId: any;
  LotNo: any;
  tonKho: number;
  sLuongGiao: number;
  thaoTac: any;
  dataLotNo: any;
}

class MapSerial {
  SerialId: string;
  SerialCode: string;
  ProductId: string;
  StatusId: string;
  Active: string;
  CreatedDate: Date;
  CreatedById: Date;
}

class MapDataTable {
  productId: string;
  tenHangHoa: string;
  donViTinh: string;
  tonKho: number;
  soLuongGiao: number;
  soLuongTon: number;
}

class MapDataList {
  inventoryDeliveryVoucherMappingId: string;
  inventoryDeliveryVoucherId: string;
  productId: string;
  productCode: string;
  quantityRequire: number; //So luong de nghi
  quantityInventory: number;
  quantity: number;
  price: number;
  warehouseId: string;
  note: string;
  active: boolean;
  createdDate: Date;
  createdById: string;
  listSerial: Array<MapSerial>;
  discountValue: number;
  totalSerial: number;
  quantityDelivery: number; //So luong giao
  productReuse: string;
  lotNoId: number;
  lotNoName: string;
  productName: string;
  wareHouseName: string;
  unitName: string;
  nameMoneyUnit: string;
  sumAmount: number;
  wareHouseType: number;
}

@Component({
  selector: "app-chi-tiet-phieu-xuat",
  templateUrl: "./chi-tiet-phieu-xuat.component.html",
  styleUrls: ["./chi-tiet-phieu-xuat.component.css"],
})
export class ChiTietPhieuXuatComponent implements OnInit {
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));

  // masterdata
  ngayHienTai: any;
  userName: any;
  department: any;
  inventoryDeliveryVoucher: any;
  // inventoryDeliveryVoucherMappingModel: Array<any> = [];
  productDeliveryEntityModel: Array<any> = [];
  listProduct: Array<any> = [];
  listProductCheck: Array<any> = [];
  listDataDialog: Array<mapDataDialog> = [];

  listKhoNhan: Array<any> = [];
  listEmployee: Array<any> = [];
  listOrganization: Array<any> = [];
  listKhoXuat: Array<any> = [];

  listData: Array<any> = [];
  status: number = 1;

  trangThai: number;
  trangThaiText: string;
  maHeThong: any;
  selectVatTu: any;

  warehouseType: number;
  productType: number;

  listDataDeNghi: Array<MapDataTable> = [];
  inventoryDeliveryVoucherMappingModel: Array<MapDataList> = [];
  listLotNoCheck: any;

  tongTonKho: number = 0;
  tongSoLuongDeNghi: number = 0;

  donViTinh: any = "";
  soLuongTon: any = "";
  tenHangHoa: any = ""

  // Form group
  detailForm: FormGroup;
  khoXuatControl: FormControl;
  khoNhanControl: FormControl;
  loaiPhieuXuatControl: FormControl;
  inventoryDeliveryVoucherCodeControl: FormControl;
  dateNgayXuatControl: FormControl;
  receiveControl: FormControl;
  departmentControl: FormControl;

  listDataUse: Array<MapDataList> = [];

  vatTu: FormGroup;
  vatTuControl: FormControl;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  deNghiXuatKhoEdit: boolean = false;

  //Code moi
  dateNow: any;
  inventoryVoucher: InventoryDeliveryVoucher = new InventoryDeliveryVoucher();
  listCategoryId: Array<string> = [];
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listVendor: Array<any> = [];
  listWarehouse: Array<any> = [];
  noteHistory: Array<string> = [];
  createName: string;
  files: File[] = [];
  loading: boolean = false;

  filterVendorAutoComplete: any[];
  cols: any[];
  colsType3and4: any[];
  idVendorSelection: any;
  lstVendorOrder: any[];
  lstCustomerOrder: any[];

  awaitResult: boolean = false;

  /* option dropdown*/
  yeucau: any;
  khoxuat: any;
  nguoinhan: any;

  /* col */
  colsDanhSachXuat: any;
  colsVatTu: any;
  data: any;
  dataVT: any;

  loaiPhieu: number;

  selectVendor: any;
  selectCustomer: any;
  selectedWarehouse: any;
  selectedVendorOrder = [];
  selectVendorOrder: any;
  selectCustomerOrder: any;
  listVendorOrderProduct: Array<any> = [];
  listVendorOrderProductType3and4: Array<any> = [];
  listCustomer: any[] = [];
  frozenCols = [];
  ref: DynamicDialogRef;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  noteContent: string = "";
  idInventoryDeliveryVoucher: string = "";
  noteModel = new NoteModel();
  isEdit = false;
  isNKH = false;
  listStatus: Array<any> = [];
  createEmpAccountList: Array<any> = [];
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild("toggleButton") toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild("notifi") notifi: ElementRef;
  @ViewChild("myTable") myTable: Table;

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

  isEditDisableCreate: boolean = true;
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );
  actionView: boolean = true;
  // Is possition fiexd
  fixed: boolean = false;
  withFiexd: string = "";

  noteControl: FormControl;

  selectedIndex: number = null;

  xuatKho: boolean = false;

  inventoryDeliveryVoucherId: any;
  selectOrg: FormControl;
  isWarehouseNVL: boolean = true;

  constructor(
    public employeeService: EmployeeService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    private refe: ChangeDetectorRef,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private renderer: Renderer2,
    private router: Router,
    private confirmationService: ConfirmationService,
    private warehouseService: WarehouseService
  ) {
    this.route.params.subscribe((params) => {
      if (params["inventoryDeliveryVoucherId"]) {
        this.inventoryDeliveryVoucherId = params["inventoryDeliveryVoucherId"];
      }

      if (params["warehouseType"]) {
        this.warehouseType = params["warehouseType"];
      }

      // if (params["ProductType"]) {
      //   this.productType = params["ProductType"];
      // }
    });

    this.translate.setDefaultLang("vi");
    this.renderer.listen("window", "click", (e: Event) => {
      if (this.toggleButton && this.notifi) {
        if (
          !this.toggleButton.nativeElement.contains(e.target) &&
          !this.notifi.nativeElement.contains(e.target)
        ) {
          this.isOpenNotifiError = false;
        }
      }
    });
  }

  tenHangHoaDetail(data: MapDataTable) {
    this.deNghiXuatKhoEdit = true;
    if (this.trangThai == 2  ) {
      this.colsVatTu = [
        {
          field: "LotNo",
          header: "Lot.No",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "sLuongGiao",
          header: "Số lượng giao",
          width: "50px",
          textAlign: "right",
          display: "table-cell",
        },
      ];
    }

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
    this.inventoryDeliveryVoucherMappingModel.forEach((x) => {
      if (x.productId == this.vatTuControlEdit.value.productId) {
        let mapDataDialog: mapDataDialog = {
          lotNoId: this.vatTuControlEdit.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ).lotNoId,
          LotNo: this.vatTuControlEdit.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ),
          tonKho: x.quantityInventory,
          sLuongGiao: x.quantityDelivery,
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
    this.tenHangHoa = this.vatTuControlEdit.value.productCode;
    
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
              LotNo: x.LotNo,
              tonKho: 0,
              sLuongGiao: x.sLuongGiao,
              thaoTac: null,
              dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
                (x, i) => listId.indexOf(x.lotNoId) == -1
              ),
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
          if (i != index) {
            this.listDataDialog[i] = {
              lotNoId: x.lotNoId,
              LotNo: x.LotNo,
              tonKho: 0,
              sLuongGiao: x.sLuongGiao,
              thaoTac: null,
              dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
                (x, i) => listId.indexOf(x.lotNoId) == -1
              ),
            };
          }
        });
      }
    }
  }

  tinhTong() {
    this.tongTonKho = 0;
    this.tongSoLuongDeNghi = 0;
    this.listDataDialog.forEach((i) => {
      if (i.LotNo != "") {
        this.tongTonKho += ParseStringToFloat(i.tonKho);
        this.tongSoLuongDeNghi += ParseStringToFloat(i.sLuongGiao);
      }
    });
  }

  addField() {
    this.selectVatTu.listProductLotNoMapping.forEach((x, index) => {
      this.selectVatTu.listProductLotNoMapping[index] = {
        lotNoId: x.lotNoId,
        lotNoName: x.lotNoName,
        note: x.note,
        packagingStatus: x.packagingStatus,
        productId: x.productId,
        productLotNoMappingId: x.productLotNoMappingId,
        productStatus: x.productStatus,
        quantity: x.quantity,
        quantityDelivery: x.quantityDelivery,
        quantityInventory: x.quantityInventory,
        quantityRequest: x.quantityRequest,
        dataLotNo: this.selectVatTu.listProductLotNoMapping,
      };
    });
  }

  async ngOnInit() {
    this.getFormControl();
    this.ngayHienTai = formatDatetime(new Date());
    this.route.params.subscribe((params) => {
      this.idInventoryDeliveryVoucher = params["id"];
    });
    let resource = "war/warehouse/inventory-delivery-voucher/create-update/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate([]);
    } else {
    }
    this.getMasterData();

    this.colsVatTu = [
      {
        field: "LotNo",
        header: "Lot.No",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "tonKho",
        header: "Tồn kho",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "sLuongGiao",
        header: "Số lượng giao",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
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

    this.colsDanhSachXuat = [
      {
        field: "STT",
        header: "STT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "tenVatTu",
        header: "Tên hàng hóa vật tư",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "donViTinh",
        header: "Đơn vị tính",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "soLuongTon",
        header: "Số lượng tồn",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "soLuongGiao",
        header: "Số lượng giao",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
    ];
    this.dateNow = new Date();
  }

  @HostListener("document:scroll", [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $("#parent").width();
      this.withFiexd = width + "px";
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }

  async getMasterData() {
    this.loading = true;
    let [masterDataResult, getKhoXuat, getKhoNhan]: any = await Promise.all([
      this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
        this.warehouseType,
        this.productType
      ),
      this.warehouseService.getListWareHouseAsync(this.isWarehouseNVL ? 3 : 2, ""),
      this.warehouseService.getListWareHouseAsync(3, ""),
    ]);
    this.loading = false;
    if (
      masterDataResult.statusCode === 200 &&
      getKhoXuat.statusCode === 200 &&
      getKhoNhan.statusCode === 200
    ) {
      this.userName = masterDataResult.nameCreate;
      this.department = masterDataResult.employeeDepartment;
      this.listOrganization = masterDataResult.listOrganization;
      this.listKhoXuat = getKhoXuat.listWareHouse;
      // this.setDefaultValue()
      this.getInfoDetail();
    } else if (masterDataResult.statusCode != 200) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: masterDataResult.messageCode,
      };
      this.showMessage(msg);
    } else if (getKhoXuat.statusCode != 200) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: getKhoXuat.messageCode,
      };
      this.showMessage(msg);
    } else if (getKhoNhan.statusCode != 200) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: getKhoNhan.messageCode,
      };
      this.showMessage(msg);
    }
  }

  async onClickType(value: number) {
    if (value == 9) {
      let [masterDataNVL, resultKhoNhanNVL]: any = await Promise.all([
        this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
          0,
          0
        ),
        this.warehouseService.getListWareHouseAsync(0, ""),
      ]);
      if (
        masterDataNVL.statusCode == 200 &&
        resultKhoNhanNVL.statusCode == 200
      ) {
        this.listKhoNhan = resultKhoNhanNVL.listWareHouse;
        this.listProduct = masterDataNVL.listProduct;
        this.listProductCheck = masterDataNVL.listProduct;
      }
    }
    else if (value == 10) {
      let [masterDataCCDC, resultKhoNhanCCDC]: any = await Promise.all([
        this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
          1,
          2
        ),
        this.warehouseService.getListWareHouseAsync(1, ""),
      ]);
      if (
        masterDataCCDC.statusCode == 200 &&
        resultKhoNhanCCDC.statusCode == 200
      ) {
        this.listKhoNhan = resultKhoNhanCCDC.listWareHouse;
        this.listProduct = masterDataCCDC.listProduct;
        this.listProductCheck = masterDataCCDC.listProduct;
      }
    }
    else if (value == 11) {
      let [masterDataNVLTSD, resultKhoNhanNVLTSD]: any = await Promise.all([
        this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
          2,
          0
        ),
        this.warehouseService.getListWareHouseAsync(0, ""),
      ]);
      if (
        masterDataNVLTSD.statusCode == 200 &&
        resultKhoNhanNVLTSD.statusCode == 200
      ) {
        this.listKhoNhan = resultKhoNhanNVLTSD.listWareHouse;
        this.listProduct = masterDataNVLTSD.listProduct;
        this.listProductCheck = masterDataNVLTSD.listProduct;
      }
    }
    else if (value == 3) {
      this.isWarehouseNVL = false;
      let [masterDataHuy, resultKhoNhanHuy]: any = await Promise.all([
        this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
          2,
          0
        ),
        this.warehouseService.getListWareHouseAsync(5, ""),
      ]);
      if (
        masterDataHuy.statusCode == 200 &&
        resultKhoNhanHuy.statusCode == 200
      ) {
        this.listKhoNhan = resultKhoNhanHuy.listWareHouse;
        this.listProduct = masterDataHuy.listProduct;
        this.listProductCheck = masterDataHuy.listProduct;

        this.getMasterData();
      }
    }
  }

  luuDialogEdit() {
    //loại bỏ data trống
    this.listDataDialog = this.listDataDialog.filter(
      (x) =>
        x.lotNoId != "" &&
        x.LotNo != null &&
        x.sLuongGiao != 0 &&
        ParseStringToFloat(x.tonKho) >= ParseStringToFloat(x.sLuongGiao)
    ); //&& ParseStringToFloat(x.tonKho) > ParseStringToFloat(x.soLuongDeNghi)

    if (this.listDataDialog.length > 0) {
      this.tinhTong();

      this.inventoryDeliveryVoucherMappingModel =
        this.inventoryDeliveryVoucherMappingModel.filter(
          (x) => x.productId != this.vatTuControlEdit.value.productId
        );

      this.listDataDialog.forEach((z) => {
        let data: MapDataList = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: this.vatTuControlEdit.value.productId,
          productCode: "",
          quantityRequire: 0, //So luong de nghi
          quantityInventory: ParseStringToFloat(z.tonKho),
          quantity: 0,
          price: 0,
          warehouseId: this.emptyGuid,
          note: "",
          active: true,
          createdDate: new Date(),
          createdById: this.emptyGuid,
          listSerial: [],
          discountValue: 0,
          totalSerial: 0,
          quantityDelivery: ParseStringToFloat(z.sLuongGiao), //So luong giao
          productReuse: "",
          lotNoId: z.LotNo.lotNoId,
          lotNoName: z.LotNo.lotNoName,
          productName: this.vatTuControlEdit.value.productName,
          wareHouseName: "",
          unitName: this.donViTinh,
          nameMoneyUnit: "",
          sumAmount: 0,
          wareHouseType: 0,
        };
        this.listDataUse.push(data);
      });
      this.gopData();
      let msg = {
        severity: "success",
        summary: "Thông báo:",
        detail: "Thêm vật tư thành công!",
      };
      this.showMessage(msg);
    } else {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Thêm mới vật từ không thành công!",
      };
      this.showMessage(msg);
    }
    this.huyDialogEdit();
  }

  xoaDeXuat(data, index) {
    this.listDataDialog = this.listDataDialog.filter((x) => x != data);
    this.tinhTong();
    this.hiddenOption(index);
  }

  huyDialogEdit() {
    this.listDataDialog = [];
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTuEdit.reset();
    this.deNghiXuatKhoEdit = false;
  }

  getInfoDetail() {
    this.loading = false;
    this.warehouseService
      .getInventoryDeliveryVoucherById(
        this.inventoryDeliveryVoucherId,
        this.warehouseType
      )
      .subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.inventoryDeliveryVoucher = result.inventoryDeliveryVoucher;
          this.inventoryDeliveryVoucherMappingModel =
            result.inventoryDeliveryVoucherMappingModel;
          this.listProduct = result.listProduct;
          this.listProductCheck = result.listProduct;
          this.setDefaultValue();
          if (this.trangThai == 2) {
            this.colsDanhSachXuat = [
              {
                field: "STT",
                header: "STT",
                width: "50px",
                textAlign: "center",
                display: "table-cell",
              },
              {
                field: "tenVatTu",
                header: "Tên hàng hóa vật tư",
                width: "100px",
                textAlign: "center",
                display: "table-cell",
              },
              {
                field: "donViTinh",
                header: "Đơn vị tính",
                width: "50px",
                textAlign: "center",
                display: "table-cell",
              },
              {
                field: "soLuongGiao",
                header: "Số lượng giao",
                width: "50px",
                textAlign: "center",
                display: "table-cell",
              },
            ];
          }
          this.loading = false;
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

  async changeDepartmentgetWH() {
    //if (event.value == null) {
    //  this.listKhoNhan = [];
    //  this.listEmployee = [];
    //  return;
    //}
    this.loading = true;

    let [getListWarehouse, getEmployeeByOrganization]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(
        0,
        this.departmentControl.value?.organizationId
      ),
      this.warehouseService.getEmployeeByOrganizationId(
        this.departmentControl.value?.organizationId
      ),
    ]);
    this.loading = false;
    if (
      getListWarehouse.statusCode == 200 &&
      getEmployeeByOrganization.statusCode == 200
    ) {
      this.listEmployee = getEmployeeByOrganization.listEmployee;
      this.listKhoNhan = getListWarehouse.listWareHouse;
    } else if (getListWarehouse.statusCode != 200) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: getListWarehouse.messageCode,
      };
      this.showMessage(msg);
    } else if (getEmployeeByOrganization.statusCode != 200) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: getListWarehouse.messageCode,
      };
      this.showMessage(msg);
    }
  }

  setDefaultValue() {
    this.trangThaiText = this.inventoryDeliveryVoucher.nameStatus;
    this.trangThai = this.inventoryDeliveryVoucher.intStatusDnx;
    this.maHeThong = this.inventoryDeliveryVoucher.inventoryDeliveryVoucherCode;

    this.loaiPhieu = this.inventoryDeliveryVoucher.inventoryDeliveryVoucherTypeText;

    this.loaiPhieuXuatControl.setValue(
      this.inventoryDeliveryVoucher.inventoryDeliveryVoucherType
    );

    this.dateNgayXuatControl.setValue(
      new Date(this.inventoryDeliveryVoucher.inventoryDeliveryVoucherDate)
    );
    this.ngayHienTai = formatDatetime(
      new Date(this.inventoryDeliveryVoucher.createdDate)
    );

    this.khoXuatControl.setValue(this.listKhoXuat.find((x) => x.warehouseId == this.inventoryDeliveryVoucher.warehouseId));
    this.khoNhanControl.setValue(
      this.listKhoNhan.find(
        (x) =>
          x.warehouseId == this.inventoryDeliveryVoucher.warehouseReceivingId
      )
    );

    this.gopData();
  }

  gopData() {
    let listId = [];
    let listIdUni = [];
    this.listData = [];
    this.inventoryDeliveryVoucherMappingModel.forEach((x) => {
      listId.push(x.productId);
    });

    for (var i = 0; i < listId.length; i++) {
      if (listIdUni.indexOf(listId[i]) === -1) {
        listIdUni.push(listId[i]);
      }
    }

    listIdUni.forEach((y) => {
      let donViTinh = "";
      let vatTuName = "";
      let productId = "";
      let sLuongGiao = 0;
      let tonKho = 0;

      this.inventoryDeliveryVoucherMappingModel.forEach((z) => {
        if (y == z.productId) {
            donViTinh = this.listProduct.find((i) => i.productId == y)?.productUnitName;
            productId = z.productId;
            tonKho += ParseStringToFloat(z.quantityInventory);
            sLuongGiao += ParseStringToFloat(z.quantityDelivery);
            vatTuName = this.listProduct.find((i) => i.productId == y)?.productName;
        }
      });

      let data = {
        productId: productId,
        tenVatTu: vatTuName,
        donViTinh: donViTinh,
        soLuongGiao: sLuongGiao,
        soLuongTon: tonKho,
        // soLuongDeNghi: tongSoLuong,
        // ghiChu: null,
        thaoTac: null,
      };
      this.listData.push(data);
    });
  }

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

  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  clearAllFile() {
    this.uploadedFiles = [];
  }

  paginate(event) {}

  getFormControl() {
    this.loaiPhieuXuatControl = new FormControl();
    this.selectOrg = new FormControl(null);
    this.khoXuatControl = new FormControl(null, Validators.required);
    this.khoNhanControl = new FormControl(null, Validators.required);
    this.noteControl = new FormControl(null);
    this.dateNgayXuatControl = new FormControl(null);
    this.receiveControl = new FormControl(null);
    (this.departmentControl = new FormControl(null)),
      // form group
      (this.detailForm = new FormGroup({
        khoXuatControl: this.khoXuatControl,
        khoNhanControl: this.khoNhanControl,
        dateNgayXuatControl: this.dateNgayXuatControl,
        loaiPhieuXuatControl: this.loaiPhieuXuatControl,
        receiveControl: this.receiveControl,
        departmentControl: this.departmentControl,
        noteControl: this.noteControl,
        selectOrg: this.selectOrg,
      }));

    this.vatTuControl = new FormControl(null, [Validators.required]);
    this.vatTu = new FormGroup({
      vatTuControl: this.vatTuControl,
    });

    this.vatTuControlEdit = new FormControl(null, [Validators.required]);
    this.vatTuEdit = new FormGroup({
      vatTuControlEdit: this.vatTuControlEdit,
    });
  }

  resetForm() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
      this.isInvalidForm = false;
    }

    this.dateNgayXuatControl.reset();

    // ngày xuất
    // this.dateNgayXuatControl.setValue(new Date());
  }

  taoPhieuXuatKho(mode: boolean) {
    if (!this.detailForm.valid) {
      Object.keys(this.detailForm.controls).forEach((key) => {
        if (this.detailForm.controls[key].valid == false) {
          this.detailForm.controls[key].markAsTouched();
        }
      });
      return;
    }


    let inventoryDeliveryVoucherModel = this.mapDataToModelPhieuXuatKho();
    let noteContent: string = "a";
    this.loading = true;
    this.warehouseService
      .createUpdateInventoryVoucher(
        inventoryDeliveryVoucherModel,
        this.listDataUse,
        noteContent,
        2
      )
      .subscribe((response) => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          if (mode) {
            this.resetForm();
            let msg = {
              severity: "success",
              summary: "Thông báo:",
              detail: "Thêm mới thành công",
            };
            this.showMessage(msg);
          } else {
            this.router.navigate([
              "/warehouse/inventory-delivery-voucher/detail",
              {
                inventoryDeliveryVoucherId: result.inventoryDeliveryVoucherId,
                warehouseType: this.warehouseType,
              },
            ]);
          }
        } else {
          let msg = {
            severity: "error",
            summary: "Thông báo",
            detail: result.messageCode,
          };
          this.showMessage(msg);
        }
      });
  }

  goBack() {
    this.router.navigate(["/warehouse/danh-sach-xuat-kho/list"]);
  }

  mapDataToModelPhieuXuatKho() {
    let inventoryDeliveryVoucherModel = new InventoryDeliveryVoucherModel();
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherId = this.emptyGuid;
    inventoryDeliveryVoucherModel.nameCreate = this.userName;
    // inventoryDeliveryVoucherModel.inventoryDeliveryVoucherId = this.emptyGuid;
    inventoryDeliveryVoucherModel.statusId = this.emptyGuid;

    inventoryDeliveryVoucherModel.organizationId =
      this.detailForm.get("departmentControl").value?.organizationId;

    // console.log(
    //   this.inventoryDeliveryForm.get("receiveControl").value);

    if (this.loaiPhieuXuatControl.value == 3) {
      inventoryDeliveryVoucherModel.receiverId =
        this.detailForm.get("receiveControl").value?.EmployeeId;
    } else {
      inventoryDeliveryVoucherModel.receiverId =
        this.detailForm.get("receiveControl").value?.employeeId;
    }

    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherType =
      this.detailForm.get("inventoryDeliveryVoucherCodeControl").value;
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherType =
      this.loaiPhieuXuatControl.value;

    inventoryDeliveryVoucherModel.warehouseId =
      this.detailForm.get("khoXuatControl").value?.warehouseId;

    inventoryDeliveryVoucherModel.wareHouseReceivingId =
      this.detailForm.get("khoNhanControl").value?.warehouseId;

    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherDate =
      convertToUTCTime(this.detailForm.get("dateNgayXuatControl").value);

    // data default
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherTime = null;
    inventoryDeliveryVoucherModel.createdById = this.emptyGuid;
    inventoryDeliveryVoucherModel.createdDate = new Date();
    // inventoryDeliveryVoucherModel.inventoryDeliveryVoucherScreenType = 1;
    inventoryDeliveryVoucherModel.statusName = "Mới";
    inventoryDeliveryVoucherModel.active = true;
    inventoryDeliveryVoucherModel.warehouseCategory = 0;
    inventoryDeliveryVoucherModel.objectId = this.emptyGuid;
    inventoryDeliveryVoucherModel.reason = null;

    return inventoryDeliveryVoucherModel;
  }

  Create() {
    if (
      this.inventoryVoucher.InventoryDeliveryVoucherType == 1 ||
      this.inventoryVoucher.InventoryDeliveryVoucherType == 2
    ) {
      if (
        this.listVendorOrderProduct.length == 0 ||
        this.listVendorOrderProduct.length == null
      ) {
        this.messageService.clear();
        this.messageService.add({
          key: "error",
          severity: "error",
          summary: "Cần chọn ít nhất một sản phẩm",
          detail: "Lưu phiếu xuất kho",
        });
      } else {
        var isError = false;
        for (let i = 0; i < this.listVendorOrderProduct.length; i++) {
          if (this.listVendorOrderProduct[i].error == true) {
            isError = true;
            break;
          }
        }
        if (isError == true) {
          this.messageService.clear();
          this.messageService.add({
            key: "error",
            severity: "error",
            summary: "Có lỗi trong danh sách sản phẩm",
            detail: "Danh sách sản phẩm",
          });
          return;
        }

        this.loading = true;
        // this.warehouseService
        //   .createUpdateInventoryDeliveryVoucher(
        //     this.inventoryVoucher,
        //     this.listVendorOrderProduct,
        //     this.files,
        //     this.noteContent,
        //     this.auth.UserId
        //   )
        //   .subscribe(
        //     (response) => {
        //       var result = <any>response;
        //       this.messageService.clear();
        //       this.messageService.add({
        //         key: "success",
        //         severity: "success",
        //         summary: result.messageCode,
        //         detail: "Lưu phiếu xuất kho",
        //       });
        //       this.router.navigate([
        //         "/warehouse/inventory-delivery-voucher/details",
        //         { id: result.inventoryDeliveryVoucherId },
        //       ]);
        //       this.isEdit = true;
        //       this.loading = false;
        //     },
        //     (error) => {
        //       this.messageService.clear();
        //       this.messageService.add({
        //         key: "error",
        //         severity: "error",
        //         summary: error.messageCode,
        //         detail: "Lưu phiếu xuất kho",
        //       });
        //     }
        //   );
      }
    } else {
      if (
        this.listVendorOrderProductType3and4.length == 0 ||
        this.listVendorOrderProductType3and4.length == null
      ) {
        this.messageService.clear();
        this.messageService.add({
          key: "error",
          severity: "error",
          summary: "Cần chọn ít nhất một sản phẩm",
          detail: "Lưu phiếu xuất kho",
        });
      } else {
        var isError = false;
        for (let i = 0; i < this.listVendorOrderProductType3and4.length; i++) {
          if (this.listVendorOrderProductType3and4[i].error == true) {
            isError = true;
            break;
          }
        }
        if (isError == true) {
          this.messageService.clear();
          this.messageService.add({
            key: "error",
            severity: "error",
            summary: "Có lỗi trong danh sách sản phẩm",
            detail: "Danh sách sản phẩm",
          });
          return;
        }

        this.loading = true;
        // this.warehouseService
        //   .createUpdateInventoryDeliveryVoucher(
        //     this.inventoryVoucher,
        //     this.listVendorOrderProductType3and4,
        //     this.files,
        //     this.noteContent,
        //     this.auth.UserId
        //   )
        //   .subscribe(
        //     (response) => {
        //       var result = <any>response;
        //       this.messageService.clear();
        //       this.messageService.add({
        //         key: "success",
        //         severity: "success",
        //         summary: result.messageCode,
        //         detail: "Lưu phiếu xuất kho",
        //       });
        //       this.router.navigate([
        //         "/warehouse/inventory-delivery-voucher/details",
        //         { id: result.inventoryDeliveryVoucherId },
        //       ]);
        //       this.isEdit = true;
        //       this.loading = false;
        //     },
        //     (error) => {
        //       this.messageService.clear();
        //       this.messageService.add({
        //         key: "error",
        //         severity: "error",
        //         summary: error.messageCode,
        //         detail: "Lưu phiếu xuất kho",
        //       });
        //     }
        //   );
      }
    }
  }

  //code moi
  filterVendor(event) {
    this.filterVendorAutoComplete = [];
    for (let i = 0; i < this.listVendor.length; i++) {
      let vendor = this.listVendor[i];
      if (vendor.vendorName.toLowerCase().includes(event.query.toLowerCase())) {
        this.filterVendorAutoComplete.push(vendor);
      }
    }
  }

  changeVendorOrder(event: any) {
    if (event.value == null) return;
    let lstVendorOrderIdSelectedArray: any[] = [];
    lstVendorOrderIdSelectedArray.push(event.value.vendorOrderId);
    this.inventoryVoucher.ObjectId = event.value.vendorOrderId;

    // this.warehouseService
    //   .getVendorOrderDetailByVenderOrderId(lstVendorOrderIdSelectedArray, 2)
    //   .subscribe(
    //     (responseProduct) => {
    //       let resultProduct = <any>responseProduct;
    //       this.listVendorOrderProduct = resultProduct.listOrderProduct;
    //       for (let i = 0; i < this.listVendorOrderProduct.length; i++) {
    //         if (this.selectedWarehouse != null) {
    //           this.listVendorOrderProduct[i].wareHouseName =
    //             this.selectedWarehouse.warehouseName;
    //           this.listVendorOrderProduct[i].wareHouseId =
    //             this.selectedWarehouse.warehouseId;
    //         }
    //         this.listVendorOrderProduct[i].error = false;
    //         this.listVendorOrderProduct[i].choose = true;
    //         this.listVendorOrderProduct[i].chooseChild = true;
    //       }
    //     },
    //     (error) => {}
    //   );
  }

  changeCustomerOrder(event: any) {
    // if (event.value == null) return;
    // let lstCustomerOrderIdSelectedArray: any[] = [];
    // lstCustomerOrderIdSelectedArray.push(event.value.orderId);
    // this.inventoryVoucher.ObjectId = event.value.orderId;
    // this.warehouseService
    //   .getCustomerOrderDetailByCustomerOrderId(
    //     lstCustomerOrderIdSelectedArray,
    //     2
    //   )
    //   .subscribe(
    //     (responseProduct) => {
    //       let resultProduct = <any>responseProduct;
    //       this.listVendorOrderProduct = resultProduct.listOrderProduct;
    //       for (let i = 0; i < this.listVendorOrderProduct.length; i++) {
    //         if (this.selectedWarehouse != null) {
    //           this.listVendorOrderProduct[i].wareHouseName =
    //             this.selectedWarehouse.warehouseName;
    //           this.listVendorOrderProduct[i].wareHouseId =
    //             this.selectedWarehouse.warehouseId;
    //         }
    //         this.listVendorOrderProduct[i].error = false;
    //         this.listVendorOrderProduct[i].quantityInventory = 0;
    //         this.listVendorOrderProduct[i].choose = true;
    //         this.listVendorOrderProduct[i].chooseChild = true;
    //       }
    //     },
    //     (error) => {}
    //   );
  }

  onchangeWarehousedropdown(event) {
    for (let i = 0; i < this.listVendorOrderProduct.length; i++) {
      if (this.selectedWarehouse != null) {
        this.listVendorOrderProduct[i].wareHouseName =
          this.selectedWarehouse.warehouseName;
        this.listVendorOrderProduct[i].wareHouseId =
          this.selectedWarehouse.warehouseId;
      }
    }
  }

  changeWarhouse(event: any) {
    if (event.value == null) return;
    this.inventoryVoucher.WarehouseId = event.value.warehouseId;
    if (this.listVendorOrderProduct != null) {
      for (let i = 0; i < this.listVendorOrderProduct.length; i++) {
        if (this.selectedWarehouse != null) {
          //if (this.listVendorOrderProduct[i].wareHouseId === this.emptyGuid) {
          this.listVendorOrderProduct[i].wareHouseName =
            this.selectedWarehouse.warehouseName;
          this.listVendorOrderProduct[i].wareHouseId =
            this.selectedWarehouse.warehouseId;
          //}
        }
        this.listVendorOrderProduct[i].choose = true;
        this.listVendorOrderProduct[i].chooseChild = true;
      }
    }
    if (this.listVendorOrderProductType3and4 != null) {
      for (let i = 0; i < this.listVendorOrderProductType3and4.length; i++) {
        if (this.selectedWarehouse != null) {
          //if (this.listVendorOrderProductType3and4[i].wareHouseId === null || this.listVendorOrderProductType3and4[i].wareHouseId === '') {
          this.listVendorOrderProductType3and4[i].wareHouseName =
            this.selectedWarehouse.warehouseName;
          this.listVendorOrderProductType3and4[i].wareHouseId =
            this.selectedWarehouse.warehouseId;
          //}
        }
        //this.listVendorOrderProduct[i].choose = true;
        //this.listVendorOrderProduct[i].chooseChild = true;
      }
    }
  }

  convertToObjectTypeScript(object: any) {}

  // Kiem tra noteText > 250 hoac noteDocument > 3
  tooLong(note): boolean {
    if (note.noteDocList.length > 3) return true;
    var des = $.parseHTML(note.description);
    var count = 0;
    for (var i = 0; i < des.length; i++) {
      count += des[i].textContent.length;
      if (count > 250) return true;
    }
    return false;
  }

  cancelRow(rowData: any) {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác ,bạn có chắc chắn muốn hủy?",
      header: "Thông báo",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        var index = this.listVendorOrderProductType3and4.findIndex(
          (f) => f.productId == rowData.productId
        );
        this.listVendorOrderProductType3and4.splice(index, 1);
      },
      reject: () => {
        return;
      },
    });
  }

  cancelRowType1(rowData: any) {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác ,bạn có chắc chắn muốn hủy?",
      header: "Thông báo",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        var index = this.listVendorOrderProduct.findIndex(
          (f) => f.productId == rowData.productId
        );
        this.listVendorOrderProduct.splice(index, 1);
      },
      reject: () => {
        return;
      },
    });
  }

  clearAllData() {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác ,bạn có chắc chắn muốn hủy?",
      header: "Thông báo",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.listVendorOrderProductType3and4 = [];
      },
      reject: () => {
        return;
      },
    });
  }

  clearAllDataType1() {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác ,bạn có chắc chắn muốn hủy?",
      header: "Thông báo",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.listVendorOrderProduct = [];
      },
      reject: () => {
        return;
      },
    });
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  Edit() {
    this.isEdit = false;
  }

  Cancel() {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác ,bạn có chắc chắn muốn hủy?",
      header: "Thông báo",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (
          this.idInventoryDeliveryVoucher != "" &&
          this.idInventoryDeliveryVoucher != null
        ) {
          this.isEdit = true;
        } else {
          this.router.navigate(["/warehouse/inventory-delivery-voucher/list"]);
        }
      },
      reject: () => {
        return;
      },
    });
  }

  changeTable(code: any) {
    // this.listVendorOrderProduct = [];
    // this.listVendorOrderProductType3and4 = [];
    // switch (code) {
    //   case 1: {
    //     this.createInventoryDeliveryVoucherCusFormType2.reset();
    //     this.createInventoryDeliveryVoucherCusFormTypeAnother.reset();
    //     break;
    //   }
    //   case 2: {
    //     this.createInventoryDeliveryVoucherCusFormType1.reset();
    //     this.createInventoryDeliveryVoucherCusFormTypeAnother.reset();
    //     break;
    //   }
    //   default: {
    //     this.createInventoryDeliveryVoucherCusFormType1.reset();
    //     this.createInventoryDeliveryVoucherCusFormType2.reset();
    //     this.createInventoryDeliveryVoucherCusFormTypeAnother.reset();
    //     break;
    //   }
    // }
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  themDeNghi(data: any) {
    if (data == false) {
      this.xuatKho = !this.xuatKho;
      this.tongSoLuongDeNghi = 0;
      this.tongTonKho = 0;
      //loại bỏ sản phẩm đã được thêm vào danh sách trước đó khỏi dropdown
      this.listData.forEach((i) => {
        this.listProduct = this.listProduct.filter(
          (x) => x.productId != i.productId
        );
      });
    }
  }

  themMoiDialogEdit() {
    let listId = [];
    this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
    let a = this.selectVatTu.listProductLotNoMapping.filter(
      (x, i) => listId.indexOf(x.lotNoId) == -1
    );
    let noiDUngTT: mapDataDialog = {
      lotNoId: "",
      LotNo: null,
      tonKho: 0,
      sLuongGiao: 0,
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
    this.refe.detectChanges();
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
    let check = this.listDataDialog.filter(
      (x) => x.lotNoId == "" || x.LotNo == null
    );
    if (check.length == 0) {
      let listId = [];
      this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
      let a = this.selectVatTu.listProductLotNoMapping.filter(
        (x, i) => listId.indexOf(x.lotNoId) == -1
      );
      let noiDUngTT: mapDataDialog = {
        lotNoId: "",
        LotNo: null,
        tonKho: null,
        sLuongGiao: 0,
        // ghiChu: "",
        thaoTac: null,
        dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
          (x, i) => listId.indexOf(x.lotNoId) == -1
        ),
      };

      // this.listLotNoCheck = this.selectVatTu.listProductLotNoMapping;
      this.listDataDialog.push(noiDUngTT);

      this.tinhTong();
      this.refe.detectChanges();
    } else {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Vui lòng lựa chọn lot no trước khi thêm mới!",
      };
      this.showMessage(msg);
    }
  }

  changeLotNo(data, index) {
    this.listDataDialog.filter((e, i) => {
      if (i == index) {
        e.lotNoId = data.value.lotNoId;
        e.LotNo = data.value;
        e.tonKho = data.value.quantityInventory;
        e.sLuongGiao = data.value.quantityDelivery;
        // e.ghiChu = "";
      }
    });
    this.hiddenOption(index);
    this.tinhTong();
    this.refe.detectChanges();
  }

  luuDialog() {
    //loại bỏ data trống
    this.listDataDialog = this.listDataDialog.filter(
      (x) =>
        x.lotNoId != "" &&
        x.LotNo != null &&
        x.sLuongGiao != 0 &&
        ParseStringToFloat(x.tonKho) >= ParseStringToFloat(x.sLuongGiao)
    ); //&& ParseStringToFloat(x.tonKho) > ParseStringToFloat(x.soLuongDeNghi)

    if (this.listDataDialog.length > 0) {
      let data: MapDataTable = {
        productId: this.selectVatTu.productId,
        tenHangHoa: this.selectVatTu.productName,
        donViTinh: this.donViTinh,
        soLuongGiao: this.tongSoLuongDeNghi,
        soLuongTon: this.tongTonKho,
        tonKho: this.soLuongTon,
      };
      this.listData.push(data);

      this.listDataDialog.forEach((i) => {
        let dataUse: MapDataList = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: this.selectVatTu.productId,
          productCode: "",
          quantityRequire: 0, //So luong de nghi
          quantityInventory: ParseStringToFloat(i.tonKho),
          quantity: 0,
          price: 0,
          warehouseId: this.emptyGuid,
          note: "",
          active: true,
          createdDate: new Date(),
          createdById: this.emptyGuid,
          listSerial: [],
          discountValue: 0,
          totalSerial: 0,
          quantityDelivery: ParseStringToFloat(i.sLuongGiao), //So luong giao
          productReuse: "",
          lotNoId: i.LotNo.lotNoId,
          lotNoName: i.LotNo.lotNoName,
          productName: this.selectVatTu.productName,
          wareHouseName: "",
          unitName: this.donViTinh,
          nameMoneyUnit: "",
          sumAmount: 0,
          wareHouseType: 0,
        };
        this.inventoryDeliveryVoucherMappingModel.push(dataUse);
      });

      let msg = {
        severity: "success",
        summary: "Thông báo:",
        detail: "Thêm vật tư thành công!",
      };
      this.showMessage(msg);
    } else {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Thêm mới vật từ không thành công!",
      };
      this.showMessage(msg);
    }

    this.huyDialog();
  }

  huyDialog() {
    this.listDataDialog = [];
    // this.vatTu.reset()
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTu.reset();
    // this.getMasterData()
    this.xuatKho = false;
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
    }
  }

  Delete() {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác ,bạn có chắc chắn muốn hủy?",
      header: "Thông báo",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (
          this.idInventoryDeliveryVoucher != "" &&
          this.idInventoryDeliveryVoucher != null
        ) {
          // this.warehouseService
          //   .deleteInventoryDeliveryVoucher(
          //     this.inventoryVoucher.InventoryDeliveryVoucherId
          //   )
          //   .subscribe(
          //     (response) => {
          //       var result = <any>response;
          //       this.messageService.clear();
          //       this.messageService.add({
          //         key: "success",
          //         severity: "success",
          //         summary: result.messageCode,
          //         detail: "Xóa phiếu xuất kho",
          //       });
          //       this.router.navigate([
          //         "/warehouse/inventory-delivery-voucher/list",
          //       ]);
          //     },
          //     (error) => {
          //       this.messageService.clear();
          //       this.messageService.add({
          //         key: "error",
          //         severity: "error",
          //         summary: error.messageCode,
          //         detail: "Xóa phiếu xuất kho",
          //       });
          //     }
          //   );
        } else {
          this.router.navigate(["/warehouse/inventory-delivery-voucher/list"]);
        }
      },
      reject: () => {
        return;
      },
    });
  }

  changeStatus() {
    this.warehouseService
      .changeStatusInventoryDeliveryVoucher(
        this.inventoryDeliveryVoucherId,
        this.auth.UserId
      )
      .subscribe(
        (response) => {
          var result = <any>response;
          this.messageService.clear();
          this.resetForm();
          this.isEdit = true;
          this.isNKH = true;
          this.messageService.add({
            key: "success",
            severity: "success",
            summary: result.messageCode,
            detail: "Xuất kho",
          });
          // this.router.navigate([
          //   "/warehouse/inventory-delivery-voucher/details",
          //   { id: this.inventoryDeliveryVoucherId },
          // ]);
          this.getMasterData();
          // window.location.reload();
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

  onSearchNote() {}

  refreshSearchFilter() {}

  sumTotal(rowdata: any) {
    let quantity = 0;
    let price = 0;
    let exchangeRate = 0;
    if (
      rowdata.quantity <= 0
      //|| rowdata.price <= 0
      //|| rowdata.quantity == null || rowdata.price == null
    ) {
      rowdata.error = true;
      this.messageService.clear();
      this.messageService.add({
        key: "error",
        severity: "error",
        summary:
          "Số lượng xuất cần lớn hơn 0 và nhỏ hơn hoặc bằng số lượng cần xuất",
        detail: "Danh sách ",
      });
      return;
    }
    //product Amount
    quantity = parseFloat(rowdata.quantity.replace(/,/g, ""));
    price = parseFloat(rowdata.price);

    if (quantity <= 0 || price <= 0) return;
    if (quantity > rowdata.quantityRequire || quantity <= 0) {
      rowdata.error = true;
      this.messageService.clear();
      this.messageService.add({
        key: "error",
        severity: "error",
        summary:
          "Số lượng xuất cần lớn hơn 0 và nhỏ hơn hoặc bằng số lượng cần xuất",
        detail: "Danh sách ",
      });
      return;
    } else {
      rowdata.error = false;
    }
    if (rowdata.exchangeRate == null) {
      exchangeRate = 1;
    } else {
      exchangeRate = parseFloat(rowdata.exchangeRate);
      if (exchangeRate <= 0) {
        exchangeRate = 1;
      }
    }
    //var productAmount = rowdata.quantity * rowdata.price * rowdata.exchangeRate;
    var productAmount = quantity * price * exchangeRate;
    //Vat
    var Vat = 0;
    if (rowdata.vat !== null) {
      let vat = parseFloat(rowdata.vat);
      if (vat > 0) {
        Vat = (productAmount * vat) / 100;
      }
    }
    var discountAcmount = 0;
    //Discount
    if (rowdata.discountType == true) {
      if (rowdata.discountValue !== null) {
        let discountValue = parseFloat(rowdata.discountValue);
        if (discountValue > 0) {
          discountAcmount = (productAmount * discountValue) / 100;
        }
      }
    } else {
      if (rowdata.discountValue !== null) {
        let discountValue = parseFloat(rowdata.discountValue.replace(/,/g, ""));
        discountAcmount = discountValue;
      }
    }
    rowdata.sumAmount = productAmount + Vat - discountAcmount;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  openOrgPopup() {
    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 2,
        selectedId: this.departmentControl.value?.organizationId,
      },
      header: "Chọn đơn vị",
      width: "40%",
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        overflow: "auto",
      },
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result?.length > 0) {
          this.selectOrg.setValue(result[0].organizationName);
          this.departmentControl.setValue(result[0]);
          // this.error["OrganizationId"] = null;
          this.changeDepartmentgetWH();
        }
      }
    });
  }

  removeOrg() {
    this.selectOrg.setValue(null);
    this.departmentControl.setValue(null);
    this.changeDepartmentgetWH();
  }
}

function formatDatetime(time: Date) {
  let date = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  return `${date}/${month}/${year}`;
}

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, "");
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
