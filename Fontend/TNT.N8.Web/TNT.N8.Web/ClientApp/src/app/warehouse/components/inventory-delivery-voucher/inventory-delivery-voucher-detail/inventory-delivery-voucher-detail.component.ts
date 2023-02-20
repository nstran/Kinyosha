import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  HostListener,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { WarehouseService } from "../../../services/warehouse.service";
import { CategoryService } from "../../../../shared/services/category.service";
import { Router, ActivatedRoute } from "@angular/router";
import { GetPermission } from "../../../../shared/permission/get-permission";
import { TreeWarehouseComponent } from "../../tree-warehouse/tree-warehouse.component";
import { DeliveryvoucherCreateSerialComponent } from "../../serial/deliveryvoucher-create-serial/deliveryvoucher-create-serial.component";
import { AddProductComponent } from "../../add-product/add-product.component";
import { InventoryDeliveryVoucher, InventoryDeliveryVoucherModel } from "../../../models/InventoryDeliveryVoucher.model";
import { EmployeeService } from "../../../../employee/services/employee.service";
import * as $ from "jquery";
import { MessageService, TreeNode } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { CustomerService } from "../../../../customer/services/customer.service";
import { NoteModel } from "../../../../shared/models/note.model";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationService } from "primeng/api";
import { FileUpload, Table } from "primeng";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { ChonNhieuDvDialogComponent } from '../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';


class phieuXuatKhoModel{
  inventoryDeliveryVoucherMappingId: any;
  inventoryDeliveryVoucherId: any;
  productId: any;
  productName: any;
  productCode: any;
  quantityRequire: any;
  quantityDelivery: any;
  quantityInventory: any;
  unitName: any;
  listChiTietLotNo: Array<ChiTietLotNo>
}

class ChiTietLotNo{
  inventoryDeliveryVoucherMappingId: any;
  inventoryDeliveryVoucherId: any;
  productId: any;
  productName: any;
  productCode: any;
  quantityRequire: any;
  quantityDelivery: any;
  quantityInventory: any;
  unitName: any;
  lotNoName: any;
  lotNoId:any;
  listLotNo:any;
  lotNo:any;
}

class Warehouse {
  warehouseId: string;
  warehouseParent: string;
  hasChild: boolean;
  warehouseCode: string;
  warehouseName: string;
  warehouseCodeName: string;
}

class mapDataDialog {
  lotNoId: any;
  lotNo: any;
  tonKho: number;
  soLuongTon: number;
  soLuongGiao
  // ghiChu: string;
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

class MapDataTable {
  productId: string;
  tenVatTu: string;
  donViTinh: string;
  soLuongGiao: number;
  soLuongTon: number;
}

@Component({
  selector: "app-inventory-delivery-voucher-detail",
  templateUrl: "./inventory-delivery-voucher-detail.component.html",
  styleUrls: ["./inventory-delivery-voucher-detail.component.css"],
})
export class InventoryDeliveryVoucherDetailComponent implements OnInit {
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));

  // masterdata
  ngayHienTai: any;
  userName: any;
  department: any;
  inventoryDeliveryVoucher: any;
  // inventoryDeliveryVoucherMappingModel: Array<any> = [];
  productDeliveryEntityModel: Array<any> = [];
  listPhieuNhapLai: Array<InventoryDeliveryVoucher> = [];
  listProduct: Array<any> = [];
  listAllProduct: Array<any> = [];
  listDataDialog: Array<mapDataDialog> = [];

  listKhoNhan: Array<any> = [];
  listKhoNhanInit: Array<any> = [];
  listEmployee: Array<any> = [];
  listOrganization: Array<any> = [];
  listKhoXuat: Array<any> = [];
  listAllKho: Array<any> = [];
  listKhoNhanCSX: Array<any> = [];
  listKiemKe: any = [];
  minDate: Date;

  status: number = 1;

  trangThai: number;
  trangThaiText: string;
  maHeThong: any;
  selectVatTu: any;
  loaiPhieuText: any;

  warehouseType: number;

  listDataDeNghi: Array<MapDataTable> = [];
  inventoryDeliveryVoucherMappingModel: Array<MapDataList> = [];
  listLotNoCheck: any;

  tongTonKho: number = 0;
  tongSoLuongDeNghi: number = 0;

  donViTinh: any = "";
  soLuongTon: any = "";
  productName: any = "";

  /*Danh sach nguyen vat lieu*/
  colsGroupVatLieu: any;
  colsChiTietVatLieu: any;
  listItemGroup: Array<phieuXuatKhoModel> = [];

  listChiTietLotNo: Array<ChiTietLotNo> = [];
  listLotNo: any = [];

  productGroup: FormGroup;
  productSelected: Array<any> = [];
  showDetailDialog: boolean = false;
  isDisableMultiSelect = false;

  // Form group
  detailForm: FormGroup;
  khoXuatControl: FormControl;
  khoNhanControl: FormControl;
  loaiPhieuXuatControl: FormControl;
  inventoryDeliveryVoucherCodeControl: FormControl;
  dateNgayXuatControl: FormControl;
  receiveControl: FormControl;
  departmentControl: FormControl;
  selectOrg: FormControl;

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
  colsXuatKho: any;
  colsVatTu: any;
  data: any;
  dataVT: any;

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

  actionExport: boolean = true;
  actionAdd: boolean = true;
  actionDelete: boolean = true;
  actionPrint: boolean = true;
  actionDownload: boolean = true;
  actionEditComplete: boolean = true;

  // Is possition fiexd
  fixed: boolean = false;
  withFiexd: string = "";

  selectedIndex: number = null;

  xuatKho: boolean = false;

  noteControl: string;

  inventoryDeliveryVoucherId: any;

  /*Popup Kho list Kho con*/
  chonKho: boolean = false;
  listDetailWarehouse: TreeNode[];
  selectedWarehouseChilren: TreeNode;
  /*End*/

  showsuakiemke: boolean = true;
  showluukiemke: boolean = false;
  disableView: boolean = true;

  constructor(
    public employeeService: EmployeeService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    private refe: ChangeDetectorRef,
    private customerService: CustomerService,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private renderer: Renderer2,
    private router: Router,
    private confirmationService: ConfirmationService,
    private warehouseService: WarehouseService,
    private el: ElementRef
  ) {
    this.route.params.subscribe((params) => {
      if (params["inventoryDeliveryVoucherId"]) {
        this.inventoryDeliveryVoucherId = params["inventoryDeliveryVoucherId"];
      }

      if (params["warehouseType"]) {
        this.warehouseType = params["warehouseType"];
      }
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

  viewDetail(rowData: any) {
    this.isDisableMultiSelect = true;
    this.productSelected = [];
    if (this.trangThai == 2) {
      this.colsChiTietVatLieu = [
        {
          field: "lotNo",
          header: "Lot.No",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "quantityDelivery",
          header: "Số lượng giao",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
      ];
    }


    this.productSelected.push(
      this.listAllProduct.find((y) => y.productId == rowData.productId)
    );
    this.selectVatTu = this.listAllProduct.find(
      (x) => x.productId == rowData.productId
    );
    this.donViTinh = this.productSelected[0].productUnitName;
    this.productName = this.productSelected[0].productName;
    this.soLuongTon = this.productSelected[0].quantityInventory;
    this.listChiTietLotNo = [];
    rowData.listChiTietLotNo.forEach((element) => {
      let lotno: ChiTietLotNo = {
        inventoryDeliveryVoucherMappingId:
          element.inventoryDeliveryVoucherMappingId,
        inventoryDeliveryVoucherId: element.inventoryDeliveryVoucherId,
        productId: element.productId,
        productName: element.productName,
        productCode: element.productCode,
        quantityRequire: element.quantityRequire,
        quantityDelivery: element.quantityDelivery,
        quantityInventory: element.quantityInventory,
        unitName: element.unitName,
        lotNoName: element.lotNoName,
        lotNoId: element.lotNoId,
        listLotNo: element.listLotNo,
        lotNo: element.lotNo,
      };

      this.listChiTietLotNo.push(lotno);
    });

    this.showDetailDialog = true;

    // this.deNghiXuatKhoEdit = true;
    // this.listDataDialog = [];
    // this.vatTuControlEdit.disable();
    // this.vatTuControlEdit.setValue(
    //   this.listProductCheck.find((x) => x.productId == data.productId)
    // );
    // this.selectVatTu = this.listProductCheck.find(
    //   (x) => x.productId == data.productId
    // );
    // this.addField();

    // // this.listLotNo = this.vatTuControlEdit.value.listProductLotNoMapping
    // this.tongSoLuongDeNghi = 0;
    // this.tongTonKho = 0;
    // this.inventoryDeliveryVoucherMappingModel.forEach((x) => {
    //   if (x.productId == this.vatTuControlEdit.value.productId) {
    //     let mapDataDialog: mapDataDialog = {
    //       lotNoId: this.vatTuControlEdit.value.listProductLotNoMapping.find(
    //         (i) => i.lotNoId == x.lotNoId
    //       ).lotNoId,
    //       lotNo: this.vatTuControlEdit.value.listProductLotNoMapping.find(
    //         (i) => i.lotNoId == x.lotNoId
    //       ),
    //       tonKho: x.quantityInventory,
    //       soLuongTon: x.quantityInventory,
    //       soLuongGiao: x.quantityDelivery,
    //       thaoTac: null,
    //       dataLotNo: this.selectVatTu.listProductLotNoMapping,
    //     };
    //     this.listDataDialog.push(mapDataDialog);
    //   }
    // });
    // this.hiddenOption(null);
    // // this.updateLotNo()
    // this.tinhTong();
    // this.donViTinh = this.vatTuControlEdit.value.productUnitName;
    // this.soLuongTon = this.vatTuControlEdit.value.quantityInventory;
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
              tonKho: 0,
              soLuongTon: x.soLuongTon,
              soLuongGiao: x.soLuongGiao,
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
              lotNo: x.lotNo,
              tonKho: 0,
              soLuongTon: x.soLuongTon,
              soLuongGiao: x.soLuongGiao,
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
      if (i.lotNo != "") {
        this.tongTonKho += ParseStringToFloat(i.soLuongTon);
        this.tongSoLuongDeNghi += ParseStringToFloat(i.soLuongGiao);
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
    let resource = "war/warehouse/inventory-delivery-voucher/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("export") == -1) {
        this.actionExport = false;
      }
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("print") == -1) {
        this.actionPrint = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
      if (listCurrentActionResource.indexOf("edit-complete") == -1) {
        this.actionEditComplete = false;
      }
    }
    this.getMasterData(true);

    this.colsVatTu = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityInventory",
        header: "Tồn kho",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityDelivery",
        header: "Số lượng giao",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "40px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
    ];

    this.colsChiTietVatLieu = [
      {
        field: "lotNo",
        header: "Lot.No",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityInventory",
        header: "Tồn kho",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityDelivery",
        header: "Số lượng giao",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "20px",
        textAlign: "center",
        display: "table-cell",
      },
    ];

    this.colsGroupVatLieu = [
      {
        field: "STT",
        header: "STT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "productName",
        header: "Tên hàng hóa vật tư",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "unitName",
        header: "Đơn vị tính",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityInventory",
        header: "Số lượng tồn",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityDelivery",
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

  async getMasterData(mode: any) {
    this.loading = true;
    let [masterDataResult, getKhoXuat, getKhoNhan]: any = await Promise.all([
      this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(0, 1),
      this.warehouseService.getListWareHouseAsync(this.warehouseType, ""),
      this.warehouseService.getListWareHouseAsync(this.warehouseType, ""),
    ]);
    this.loading = false;
    if (
      masterDataResult.statusCode === 200 &&
      getKhoXuat.statusCode === 200 &&
      getKhoNhan.statusCode === 200
    ) {
      this.userName = masterDataResult.nameCreate;
      this.department = masterDataResult.employeeDepartment;
      this.listPhieuNhapLai = masterDataResult.listPhieuNhapLai;
      this.listOrganization = masterDataResult.listOrganization;
      this.listEmployee = masterDataResult.listEmployee;
      this.listKhoXuat = getKhoXuat.listWareHouse;
      this.listKhoNhan = getKhoNhan.listWareHouse;
      this.listKiemKe = masterDataResult.listDotKiemKe;
      this.listKhoNhanCSX = getKhoNhan.listWareHouse;

      this.getInfoDetail(mode);
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
      (x) => x.quantityDelivery <= 0
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
      let product = this.listItemGroup.find((i) => i.productId == x.productId);
      if (product == null) {
        let itemGroup: phieuXuatKhoModel = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: x.productId,
          productName: this.listProduct.find((k) => k.productId == x.productId)
            .productName,
          productCode: this.listProduct.find((k) => k.productId == x.productId)
            .productCode,
          quantityRequire: 0,
          quantityDelivery: this.listChiTietLotNo.reduce(
            (sum, current) =>
              ParseStringToFloat(sum) +
              ParseStringToFloat(current.quantityDelivery),
            0
          ),
          quantityInventory: this.listChiTietLotNo.reduce(
            (sum, current) =>
              ParseStringToFloat(sum) +
              ParseStringToFloat(current.quantityInventory),
            0
          ),
          unitName: this.listProduct.find((k) => k.productId == x.productId)
            .productUnitName, //this.listProduct.find((k) => k.productId == x.productId).productUnitName, element.unitName,
          listChiTietLotNo: [],
        };

        this.listChiTietLotNo.forEach((element) => {
          let _lotno: ChiTietLotNo = {
            inventoryDeliveryVoucherMappingId: this.emptyGuid,
            inventoryDeliveryVoucherId: this.emptyGuid,
            productId: element.productId,
            productName: element.productName,
            productCode: element.productCode,
            quantityRequire: element.quantityRequire,
            quantityDelivery: element.quantityDelivery,
            quantityInventory: element.quantityInventory,
            unitName: "",
            lotNoName: element.lotNoName,
            lotNoId: element.lotNoId,
            listLotNo: element.listLotNo,
            lotNo: element.lotNo,
          };
          itemGroup.listChiTietLotNo.push(_lotno);
        });
        this.listItemGroup.push(itemGroup);
      } else {
        this.listChiTietLotNo.forEach((lo) => {
          lo.productId = product.productId;
          let existLotno = this.listItemGroup
            .find((i) => i.productId == lo.productId)
            .listChiTietLotNo.find((k) => k.lotNoId == lo.lotNoId);
          if (existLotno == null) {
            /*thêm mới lotno vào sản phẩm đã tồn tại*/
            this.listItemGroup
              .find((i) => i.productId == product.productId)
              .listChiTietLotNo.push(lo);
          } else {
            /*cập nhật số lượng lotno nếu tồn tại*/
            this.listItemGroup
              .find((i) => i.productId == product.productId)
              .listChiTietLotNo.find(
                (k) => k.lotNoId == lo.lotNoId
              ).quantityDelivery = lo.quantityDelivery;
          }
        });
      }

      /*Tinh lại số lượng giao*/
      this.listItemGroup.forEach((x) => {
        x.quantityDelivery = x.listChiTietLotNo.reduce(
          (sum, current) =>
            ParseStringToFloat(sum) +
            ParseStringToFloat(current.quantityDelivery),
          0
        );
      });
      this.showDetailDialog = false;
    });
  }

  xoaDeXuat(rowData: any) {
    this.listChiTietLotNo = this.listChiTietLotNo.filter(
      (x) => x.lotNoName != rowData.lotNoName
    );
    this.listItemGroup.find(
      (i) => i.productId == rowData.productId
    ).listChiTietLotNo = this.listItemGroup
      .find((i) => i.productId == rowData.productId)
      .listChiTietLotNo.filter((x) => x.lotNoName != rowData.lotNoName);
  }

  huyDialogEdit() {
    // this.listDataDialog = [];
    // // this.vatTu.reset()
    // this.donViTinh = "";
    // this.soLuongTon = "";
    // this.vatTuEdit.reset();
    // this.getMasterData()
    this.showDetailDialog = false;
  }

  onChangeType() {
    if (this.loaiPhieuXuatControl.value == 2) {
      this.listKhoNhan = this.listKhoNhanCSX;
    }
    if (this.loaiPhieuXuatControl.value == 3) {
      this.listKhoNhan = this.listAllKho;
      this.changeDepartmentgetWH();
    }
  }

  getInfoDetail(mode: any) {
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
          this.listAllProduct = result.listProduct;
          this.status = result.inventoryDeliveryVoucher.intStatusDnx;

          if (this.status == 2) {

            this.colsGroupVatLieu = [
              {
                field: "STT",
                header: "STT",
                width: "50px",
                textAlign: "center",
                display: "table-cell",
              },
              {
                field: "productName",
                header: "Tên hàng hóa vật tư",
                width: "100px",
                textAlign: "center",
                display: "table-cell",
              },
              {
                field: "unitName",
                header: "Đơn vị tính",
                width: "50px",
                textAlign: "center",
                display: "table-cell",
              },
              {
                field: "quantityDelivery",
                header: "Số lượng giao",
                width: "50px",
                textAlign: "center",
                display: "table-cell",
              },
            ];
          }

          if (this.inventoryDeliveryVoucher.inventoryDeliveryVoucherType == 3) {
            this.listKhoNhan = this.listAllKho;
          }

          if (mode) {
            result.listItemGroup.forEach((element) => {
              let itemGroup: phieuXuatKhoModel = {
                inventoryDeliveryVoucherMappingId: this.emptyGuid,
                inventoryDeliveryVoucherId: this.emptyGuid,
                productId: element.productId,
                productName: element.productName,
                productCode: element.productCode,
                quantityRequire: element.quantityRequire,
                quantityDelivery: element.quantityDelivery,
                quantityInventory: element.quantityInventory,
                unitName: element.unitName,
                listChiTietLotNo: [],
              };
              this.listItemGroup.push(itemGroup);
            });
            result.inventoryDeliveryVoucherMappingModel.forEach((element) => {
              // this.listItemGroup.find((i)=>i.productId == element.productId).listChiTietLotNo.push(element);
              let lotno: ChiTietLotNo = {
                inventoryDeliveryVoucherMappingId: this.emptyGuid,
                inventoryDeliveryVoucherId: this.emptyGuid,
                productId: element.productId,
                productName: element.productName,
                productCode: element.productCode,
                quantityRequire: element.quantityRequire,
                quantityDelivery: element.quantityDelivery,
                quantityInventory: element.quantityInventory,
                unitName: element.unitName,
                lotNoName: element.lotNoName,
                lotNoId: element.lotNoId,
                listLotNo: this.listAllProduct.find(
                  (x) => x.productId == element.productId
                )?.listProductLotNoMapping,
                lotNo: this.listAllProduct
                  .find((x) => x.productId == element.productId)
                  ?.listProductLotNoMapping.find(
                    (x) => x.lotNoId == element.lotNoId
                  ),
              };

              let productGroup = this.listItemGroup.find(
                (i) => i.productId == element.productId
              );
              productGroup.listChiTietLotNo.push(lotno);
            });
          }

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
      });
  }

  async changeDepartmentgetWH() {
    //if (this.departmentControl.value == null) {
    //  this.listKhoNhan = this.listAllKho;
    //  this.listEmployee = [];
    //  return;
    //}
    this.loading = true;

    let [getListWarehouse, getEmployeeByOrganization]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(
        null,
        this.departmentControl.value.organizationId
      ),
      this.warehouseService.getEmployeeByOrganizationId(
        this.departmentControl.value.organizationId
      ),
    ]);
    this.loading = false;
    if (
      getListWarehouse.statusCode == 200 &&
      getEmployeeByOrganization.statusCode == 200
    ) {
      //this.listEmployee = getEmployeeByOrganization.listEmployee;
      if (getEmployeeByOrganization.listEmployee != null && getEmployeeByOrganization.listEmployee != undefined) {
        this.listEmployee = [];
        getEmployeeByOrganization.listEmployee.forEach(item => {
          this.listEmployee.push({ employeeId: item.EmployeeId, employeeName: item.EmployeeName })
        })
      }
      // console.log(getEmployeeByOrganization.listEmployee);
      this.listKhoNhan = getListWarehouse.listWareHouse;
      this.listKhoNhanInit = [...getListWarehouse.listWareHouse];

      if (this.departmentControl.value == null) {
        this.listEmployee = [];
        this.receiveControl.setValue(null);

        if (this.khoXuatControl.value != null && this.khoXuatControl.value != undefined) {
          var removeKN = this.listKhoNhan.find(c => c.warehouseId == this.khoXuatControl.value?.warehouseId);
          var remove = this.listKhoNhan.indexOf(removeKN);
          if (remove > -1) {
            this.listKhoNhan.splice(remove, 1);
          }
        }
      }
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

  async setDefaultValue() {
    this.trangThaiText = this.inventoryDeliveryVoucher.nameStatus;
    this.trangThai = this.inventoryDeliveryVoucher.intStatusDnx;
    this.maHeThong = this.inventoryDeliveryVoucher.inventoryDeliveryVoucherCode;
    this.loaiPhieuText =
      this.inventoryDeliveryVoucher.inventoryDeliveryVoucherTypeText;

    this.loaiPhieuXuatControl.setValue(
      this.inventoryDeliveryVoucher.inventoryDeliveryVoucherType
    );

    this.dateNgayXuatControl.setValue(
      new Date(this.inventoryDeliveryVoucher.inventoryDeliveryVoucherDate)
    );
    this.ngayHienTai = formatDatetime(
      new Date(this.inventoryDeliveryVoucher.createdDate)
    );

    var orgItem = this.listOrganization.find(
      (x) => x.organizationId == this.inventoryDeliveryVoucher.organizationId
    );

    this.departmentControl.setValue(orgItem);
    this.selectOrg.setValue(orgItem?.organizationName);

    this.receiveControl.setValue(
      this.listEmployee.find(
        (x) => x.employeeId == this.inventoryDeliveryVoucher.receiverId
      )
    );

    this.khoXuatControl.setValue(
      this.listKhoXuat.find(
        (x) => x.warehouseId == this.inventoryDeliveryVoucher.warehouseId
      )
    );

    this.khoNhanControl.setValue(
      this.listKhoNhan.find(
        (x) =>
          x.warehouseId == this.inventoryDeliveryVoucher.warehouseReceivingId
      )
    );

    this.noteControl = this.inventoryDeliveryVoucher.note;

    //this.gopData();

    let [getListWarehouse, getEmployeeByOrganization]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(
        null, this.inventoryDeliveryVoucher.organizationId
      ),
      this.warehouseService.getEmployeeByOrganizationId(
        this.inventoryDeliveryVoucher.organizationId
      ),
    ]);
    if (
      getListWarehouse.statusCode == 200 &&
      getEmployeeByOrganization.statusCode == 200
    ) {
      if (getEmployeeByOrganization.listEmployee != null && getEmployeeByOrganization.listEmployee != undefined) {
        this.listEmployee = [];
        getEmployeeByOrganization.listEmployee.forEach(item => {
          this.listEmployee.push({ employeeId: item.EmployeeId, employeeName: item.EmployeeName })
        })
      }
      // console.log(getEmployeeByOrganization.listEmployee);
      this.listKhoNhan = getListWarehouse.listWareHouse;

      if (this.departmentControl.value == null) {
        this.listEmployee = [];
        this.receiveControl.setValue(null);

        if (this.khoXuatControl.value != null && this.khoXuatControl.value != undefined) {
          var removeKN = this.listKhoNhan.find(c => c.warehouseId == this.khoXuatControl.value?.warehouseId);
          var remove = this.listKhoNhan.indexOf(removeKN);
          if (remove > -1) {
            this.listKhoNhan.splice(remove, 1);
          }
        }
      }
    }

    this.onChangeWarehouse();
  }

  gopData() {
    let listId = [];
    let listIdUni = [];
    this.listDataDeNghi = [];
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
      let soLuongGiao = 0;
      let soLuongTon = 0;

      this.inventoryDeliveryVoucherMappingModel.forEach((z) => {
        if (y == z.productId) {
          // tongSoLuong += ParseStringToFloat(z.quantityRequire);
          donViTinh = this.listAllProduct.find(
            (i) => i.productId == y
          ).productUnitName;
          productId = z.productId;
          soLuongTon += ParseStringToFloat(z.quantityInventory);
          soLuongGiao += ParseStringToFloat(z.quantityDelivery);
          // ghiChu = z.Note
        }
      });
      vatTuName = this.listAllProduct.find((i) => i.productId == y).productName;
      let data = {
        productId: productId,
        tenVatTu: vatTuName,
        donViTinh: donViTinh,
        soLuongGiao: soLuongGiao,
        soLuongTon: soLuongTon,
        // soLuongDeNghi: tongSoLuong,
        // ghiChu: null,
        // thaoTac: null,
      };
      this.listDataDeNghi.push(data);
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

  getNoteHistory() {
    //this.loading = true;
    this.customerService
      .getNoteHistory(this.idInventoryDeliveryVoucher)
      .subscribe((response) => {
        const result = <any>response;
        if (result.statusCode === 202 || result.statusCode === 200) {
          this.noteHistory = result.listNote;
          result.listNote.forEach((element) => {
            this.noteModel.Description = element.description;
            this.noteModel.NoteId = element.noteId;
            this.noteModel.NoteTitle = element.noteTitle;
            setTimeout(() => {
              $("#" + element.noteId)
                .find(".note-title")
                .append($.parseHTML(element.noteTitle));
              $("#" + element.noteId)
                .find(".short-content")
                .append($.parseHTML(element.description));
            }, 1000);
          });
        } else {
        }
      });
  }

  getFormControl() {
    this.inventoryDeliveryVoucherCodeControl = new FormControl(null);
    this.khoXuatControl = new FormControl(null, Validators.required);
    this.khoNhanControl = new FormControl(null, Validators.required);
    this.selectOrg = new FormControl(null);
    this.loaiPhieuXuatControl = new FormControl(2);
    this.dateNgayXuatControl = new FormControl(null);
    this.receiveControl = new FormControl(null);
    (this.departmentControl = new FormControl(null)),
      // form group
      (this.detailForm = new FormGroup({
        inventoryDeliveryVoucherCodeControl:
          this.inventoryDeliveryVoucherCodeControl,
        khoXuatControl: this.khoXuatControl,
        khoNhanControl: this.khoNhanControl,
        dateNgayXuatControl: this.dateNgayXuatControl,
        loaiPhieuXuatControl: this.loaiPhieuXuatControl,
        receiveControl: this.receiveControl,
        departmentControl: this.departmentControl,
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
        if (!this.detailForm.controls[key].valid) {
          this.detailForm.controls[key].markAsTouched();
        }
      });
    }
    else {
      let inventoryDeliveryVoucherModel = this.mapDataToModelPhieuXuatKho();
      let noteContent: string = "a";
      this.loading = true;

      let listChiTietLotNo = [];
      this.listItemGroup.forEach((element) => {
        element.listChiTietLotNo.forEach((lotno) => {
          listChiTietLotNo.push(lotno);
        });
      });

      this.warehouseService
        .createUpdateInventoryVoucher(
          inventoryDeliveryVoucherModel,
          listChiTietLotNo,
          noteContent,
          1
        )
        .subscribe((response) => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            let msg = {
              severity: "success",
              summary: "Thông báo:",
              detail: "cập nhật thành công",
            };
            this.showMessage(msg);
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
  }

  goBack() {
    this.router.navigate(["/warehouse/inventory-delivery-voucher/list"]);
  }

  mapDataToModelPhieuXuatKho() {
    let inventoryDeliveryVoucherModel = new InventoryDeliveryVoucherModel();
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherId =
      this.inventoryDeliveryVoucherId;
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

    if (this.warehouseType == 0) {
      inventoryDeliveryVoucherModel.warehouseCategory = 0;
    } else if (this.warehouseType == 1) {
      inventoryDeliveryVoucherModel.warehouseCategory = 1;
    }

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

  showTreeWarehouse(rowData) {
    if (
      this.inventoryVoucher.WarehouseId == null ||
      this.inventoryVoucher.WarehouseId == ""
    ) {
      this.messageService.clear();
      this.messageService.add({
        key: "error",
        severity: "error",
        summary: "Cần chọn kho cha trước",
        detail: "Danh sách sản phẩm",
      });
    } else {
      this.ref = this.dialogService.open(TreeWarehouseComponent, {
        header: "Chọn kho xuất",
        width: "30%",
        baseZIndex: 10000,
        data: {
          object: this.inventoryVoucher.WarehouseId,
          productId: rowData.productId,
        },
      });

      this.ref.onClose.subscribe((item: any) => {
        if (item) {
          rowData.wareHouseName = item.warhousename;
          rowData.wareHouseId = item.warhouseId;
        }
      });
    }
  }

  showCreateSerial(item: any) {
    this.ref = this.dialogService.open(DeliveryvoucherCreateSerialComponent, {
      header: "NHẬP SERIAL",
      width: "35%",
      //contentStyle: { "max-height": "350px" },
      baseZIndex: 10000,
      closable: false,
      data: { object: item },
    });
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

  deleteItemGroup(rowData: any) {
    this.listItemGroup = this.listItemGroup.filter(
      (x) => x.productId != rowData.productId
    );
  }

  exportExcel() {
    this.loading = true;
    let title = "Phiếu xuất kho nguyên vật liệu";
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);

    let line1 = ["", "", "", "", "KIS V4-A030-01"];
    let lineRow1 = worksheet.addRow(line1);
    lineRow1.font = { name: "Times New Roman", size: 12 };
    lineRow1.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow1.height = 20;
    worksheet.addRow([]);

    let line2 = [`Kinyosha Vietnam Co., Ltd`, "", "", "INVENTORY DELIVERY"];
    let lineRow2 = worksheet.addRow(line2);
    worksheet.mergeCells(`A${lineRow2.number}:C${lineRow2.number}`);
    worksheet.mergeCells(`D${lineRow2.number}:F${lineRow2.number}`);
    lineRow2.font = { name: "Times New Roman", size: 12, bold: true };
    lineRow2.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow2.getCell(4).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow2.height = 30;

    let line3 = [
      "CÔNG TY TNHH KINYOSHA VIỆT NAM",
      "",
      "",
      "PHIẾU XUẤT KHO NGUYÊN VẬT LIỆU",
    ];
    let lineRow3 = worksheet.addRow(line3);
    worksheet.mergeCells(`A${lineRow3.number}:C${lineRow3.number}`);
    worksheet.mergeCells(`D${lineRow3.number}:F${lineRow3.number}`);
    lineRow3.font = { name: "Times New Roman", size: 12, bold: true };
    lineRow3.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow3.getCell(4).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow3.height = 30;

    let line4 = [
      `Requisition Number/Yêu cầu số: `,
      "",
      "",
      "",
      `Date/Ngày: ` + formatDatetime(this.dateNgayXuatControl.value),
    ];
    let lineRow4 = worksheet.addRow(line4);
    worksheet.mergeCells(`A${lineRow4.number}:C${lineRow4.number}`);
    worksheet.mergeCells(`E${lineRow4.number}:F${lineRow4.number}`);
    lineRow4.font = { name: "Times New Roman", size: 12, italic: true };
    lineRow4.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow4.height = 20;

    let line5 = [
      `Người nhận/Person in charge: ` +
        (this.receiveControl.value?.employeeName != null &&
        this.receiveControl.value?.employeeName != undefined
          ? this.receiveControl.value?.employeeName
          : ""),
      "",
      "",
      "",
      `Bộ phận/Section: ` +
        (this.departmentControl.value?.organizationName != null &&
        this.departmentControl.value?.organizationName != undefined
          ? this.departmentControl.value?.organizationName
          : ""),
    ];
    let lineRow5 = worksheet.addRow(line5);
    worksheet.mergeCells(`A${lineRow5.number}:C${lineRow5.number}`);
    worksheet.mergeCells(`E${lineRow5.number}:F${lineRow5.number}`);
    lineRow5.font = { name: "Times New Roman", size: 12, italic: true };
    lineRow5.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    lineRow5.height = 20;
    worksheet.addRow([]);

    let dataHeaderRow1 = [
      "NO",
      "Material Name",
      "Unit",
      "Quantity delivery",
      `Lot No (Nếu có)`,
      "Yêu cầu số",
    ];
    let header1 = worksheet.addRow(dataHeaderRow1);
    header1.font = { name: "Times New Roman", size: 12, bold: true };
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
      "TT",
      "Tên nguyên vật liệu",
      "Đơn vị tính",
      "Lượng giao",
      "",
      "",
    ];
    let header2 = worksheet.addRow(dataHeaderRow2);
    header2.font = { name: "Times New Roman", size: 12, bold: true };
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

    worksheet.mergeCells(`E${header1.number}:E${header2.number}`);
    worksheet.mergeCells(`F${header1.number}:F${header2.number}`);

    let dataRow = [];
    this.listItemGroup.forEach((item) => {
      dataRow = dataRow.concat(item.listChiTietLotNo);
    });

    dataRow.forEach((item, index) => {
      let dataHeaderRowIndex = [
        index + 1,
        item.productName,
        item.unitName,
        item.quantityDelivery,
        item.lotNoName,
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

    let footer1 = ["", "", "","","Người nhận", "Nhân viên kho"];
    let footerRow1 = worksheet.addRow(footer1);
    footerRow1.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow1.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow1.height = 20;

    let footer2 = ["", "", "", "", "", ""]
    let footerRow2 = worksheet.addRow(footer2);
    footerRow2.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow2.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow2.height = 20;

    let footer3 = ["", "", "", "", "", ""];
    let footerRow3 = worksheet.addRow(footer3);
    footerRow3.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow3.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow3.height = 20;
    
    let footer4 = ["", "", "", "", "", ""];
    let footerRow4 = worksheet.addRow(footer4);
    footerRow4.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow4.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow4.height = 20;
    
    let footer5 = ["", "", "", "", "", ""];
    let footerRow5 = worksheet.addRow(footer5);
    footerRow5.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow5.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow5.height = 20;
    
    let footer6 = ["", "", "", "", "", ""];
    let footerRow6 = worksheet.addRow(footer6);
    footerRow6.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow6.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow6.height = 20;

    let footer7 = ["", "", "", "", `(Ký, ghi rõ họ tên)`, `(Ký, ghi rõ họ tên)`];
    let footerRow7 = worksheet.addRow(footer7);
    footerRow7.font = { name: "Times New Roman", size: 12, bold: true };
    footerRow7.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    footerRow7.height = 20;

    worksheet.mergeCells(`E${footerRow1.number}:E${footerRow6.number}`);
    worksheet.mergeCells(`F${footerRow1.number}:F${footerRow6.number}`);


    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 25;
    worksheet.getColumn(6).width = 20;

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

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
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

  showAddProduct() {
    this.ref = this.dialogService.open(AddProductComponent, {
      header: "THÊM SẢN PHẨM",
      width: "50%",
      //contentStyle: { "max-height": "350px" },
      baseZIndex: 10000,
      data: { object: 2 },
    });
    this.ref.onClose.subscribe((item: any) => {
      if (item) {
        this.listVendorOrderProductType3and4.push.apply(
          this.listVendorOrderProductType3and4,
          item.listVendorOrderProduct
        );

        if (this.listVendorOrderProductType3and4 != null) {
          for (
            let i = 0;
            i < this.listVendorOrderProductType3and4.length;
            i++
          ) {
            if (this.selectedWarehouse != null) {
              if (
                this.listVendorOrderProductType3and4[i].wareHouseId === null ||
                this.listVendorOrderProductType3and4[i].wareHouseId === ""
              ) {
                this.listVendorOrderProductType3and4[i].wareHouseName =
                  this.selectedWarehouse.warehouseName;
                this.listVendorOrderProductType3and4[i].wareHouseId =
                  this.selectedWarehouse.warehouseId;
              }
            }
            //this.listVendorOrderProduct[i].quantityInventory = 0;
            this.listVendorOrderProductType3and4[i].quantity =
              this.listVendorOrderProductType3and4[i].quantityRequire;
            this.listVendorOrderProductType3and4[i].quantityInventory = 0;
          }
        }
      }
    });
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

  addNewDialog() {
    this.isDisableMultiSelect = false;
    this.soLuongTon = "";
    this.donViTinh = "";
    this.listChiTietLotNo = new Array<ChiTietLotNo>();

    //loại bỏ sản phẩm đã được thêm vào danh sách trước đó khỏi dropdown
    this.listItemGroup.forEach((i) => {
      this.listProduct = this.listProduct.filter(
        (x) => x.productId != i.productId
      );
    });

    this.showDetailDialog = true;
  }

  themMoiDialogEdit() {
    let listId = [];
    this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
    let a = this.selectVatTu.listProductLotNoMapping.filter(
      (x, i) => listId.indexOf(x.lotNoId) == -1
    );
    let noiDUngTT: mapDataDialog = {
      lotNoId: "",
      lotNo: null,
      tonKho: 0,
      soLuongGiao: 0,
      soLuongTon: 0,
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

  addNewLotNo() {
    // if (!this.vatTu.valid) {
    //   Object.keys(this.vatTu.controls).forEach((key) => {
    //     if (this.vatTu.controls[key].valid == false) {
    //       this.vatTu.controls[key].markAsTouched();
    //     }
    //   });
    //   // this.getMasterData();
    //   return;
    // }

    let listId = [];
    this.listChiTietLotNo.forEach((y) => listId.push(y.lotNoId));

    let lotno: ChiTietLotNo = {
      inventoryDeliveryVoucherMappingId: this.emptyGuid,
      inventoryDeliveryVoucherId: this.emptyGuid,
      productId: this.selectVatTu.productId,
      productName: this.selectVatTu.productName,
      productCode: this.selectVatTu.productCode,
      quantityRequire: 0,
      quantityDelivery: 0,
      quantityInventory: 0,
      unitName: this.selectVatTu.productUnitName,
      lotNoName: "",
      lotNoId: 0,
      lotNo: null,
      listLotNo: this.selectVatTu.listProductLotNoMapping.filter(
        (x, i) => listId.indexOf(x.lotNoId) == -1
      ),
    };

    this.listChiTietLotNo.push(lotno);
    this.refe.detectChanges();

    let target;
    target = this.el.nativeElement.querySelector(
      ".item-lot-no-" + (this.listChiTietLotNo.length - 1) + " input"
    );
    if (target) {
      target.focus();
    }
  }

  themMoiDialog() {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData(false);
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
        tonKho: null,
        soLuongTon: 0,
        soLuongGiao: 0,
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
    this.listChiTietLotNo.filter((e, i) => {
      if (i == index) {
        e.lotNoId = data.value.lotNoId;
        e.lotNo = data.value;
        e.lotNoName = data.value.lotNoName;
        e.quantityInventory = data.value.quantityInventory;
        e.quantityDelivery = data.value.quantityDelivery;
      }
    });
    // this.hiddenOption(index);
    // this.tinhTong();
    this.refe.detectChanges();
  }

  luuDialog() {
    //loại bỏ data trống
    this.listDataDialog = this.listDataDialog.filter(
      (x) =>
        x.lotNoId != "" &&
        x.lotNo != null &&
        x.soLuongGiao != 0 &&
        ParseStringToFloat(x.soLuongTon) >= ParseStringToFloat(x.soLuongGiao)
    ); //&& ParseStringToFloat(x.tonKho) > ParseStringToFloat(x.soLuongDeNghi)

    if (this.listDataDialog.length > 0) {
      let data: MapDataTable = {
        productId: this.selectVatTu.productId,
        tenVatTu: this.selectVatTu.productName,
        donViTinh: this.donViTinh,
        soLuongGiao: this.tongSoLuongDeNghi,
        soLuongTon: this.tongTonKho,
      };
      this.listDataDeNghi.push(data);

      this.listDataDialog.forEach((i) => {
        let dataUse: MapDataList = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: this.selectVatTu.productId,
          productCode: "",
          quantityRequire: 0, //So luong de nghi
          quantityInventory: ParseStringToFloat(i.soLuongTon),
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
          quantityDelivery: ParseStringToFloat(i.soLuongGiao), //So luong giao
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
    // if (!this.vatTu.valid) {
    //   Object.keys(this.vatTu.controls).forEach((key) => {
    //     if (this.vatTu.controls[key].valid == false) {
    //       this.vatTu.controls[key].markAsTouched();
    //     }
    //   });
    //   // this.getMasterData();
    //   return;
    // }
    if (data) {
      this.listChiTietLotNo = [];
      this.donViTinh = data.value.productUnitName;
      this.soLuongTon = data.value.quantityInventory;
      this.selectVatTu = data.value;
      // this.addField();
      this.addNewLotNo();
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
          this.getMasterData(false);
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

  /*Hiển thị popup list kho con*/
  thayDoiKho(data) {
    // this.selectedIndex = data.index;
    // this.selectedWarehouseChilren = null;
    // let warehouse: Warehouse = this.wareControlType1.value;
    // switch (this.inventoryVoucher.InventoryDeliveryVoucherType.toString()) {
    //   case '2':
    //     warehouse = this.wareControlType2.value;
    //     break;
    //   case '3':
    //   case '4':
    //   case '5':
    //     warehouse = this.wareControlType3.value;
    //     break;
    // }
    // //Lấy list kho con nếu có
    // this.warehouseService.getDanhSachKhoCon(warehouse.warehouseId).subscribe(response => {
    //   let result: any = response;
    //   if (result.statusCode == 200) {
    //     let listWarehouse = result.listWarehouse;
    //     this.listDetailWarehouse = this.list_to_tree(listWarehouse, data.warehouseId);
    //     this.chonKho = true;
    //   }
    //   else {
    //     let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
    //     this.showMessage(msg);
    //   }
    // });
  }

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
  chonKhoCon(data: any) {
    if (data.node.children.length != 0) {
      this.selectedWarehouseChilren = null;
    }
  }

  /*Xác nhận Chọn kho con*/
  selectedKhoCon() {
    if (this.selectedWarehouseChilren) {
      let sanPhamPhieuNhapKho;
      switch (this.inventoryVoucher.InventoryDeliveryVoucherType.toString()) {
        case "1":
        case "2":
          sanPhamPhieuNhapKho = this.listVendorOrderProduct.find(
            (x) => x.index == this.selectedIndex
          );
          break;
        case "3":
        case "4":
        case "5":
          sanPhamPhieuNhapKho = this.listVendorOrderProductType3and4.find(
            (x) => x.index == this.selectedIndex
          );
          break;

        default:
          break;
      }

      sanPhamPhieuNhapKho.warehouseId =
        this.selectedWarehouseChilren.data.warehouseId;
      sanPhamPhieuNhapKho.wareHouseName =
        this.selectedWarehouseChilren.label.substring(
          this.selectedWarehouseChilren.label.lastIndexOf("-") + 2
        );
      sanPhamPhieuNhapKho.error = this.selectedWarehouseChilren.data.hasChild;
      this.chonKho = false;
    }
  }

  /*Hủy chọn kho con*/
  cancelSelectedKhoCon() {
    this.selectedIndex = null;
    this.selectedWarehouseChilren = null;
    this.chonKho = false;
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

  onChangeWarehouse() {
    if (this.inventoryDeliveryVoucher.nameStatus == "Mới") {
      var checkKiemKe = this.listKiemKe.find(
        (c) => c.warehouseId == this.khoXuatControl.value?.warehouseId
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

    if (this.departmentControl.value == null) {
      this.listKhoNhan = [...this.listKhoNhanInit];

      if (this.khoXuatControl.value != null && this.khoXuatControl.value != undefined) {
        var removeKN = this.listKhoNhan.find(c => c.warehouseId == this.khoXuatControl.value?.warehouseId);
        var remove = this.listKhoNhan.indexOf(removeKN);
        if (remove > -1) {
          this.listKhoNhan.splice(remove, 1);
        }
      }
    }
  }

  removeOrg() {
    this.selectOrg.setValue(null);
    this.departmentControl.setValue(null);
    this.changeDepartmentgetWH();
  }

  suaKiemKe() {
    let month =
      new Date(this.inventoryDeliveryVoucher.inventoryDeliveryVoucherDate).getMonth() + 1;
    let year = new Date(
      this.inventoryDeliveryVoucher.inventoryDeliveryVoucherDate
    ).getFullYear();

    // if (this.status == 1) {
    this.listKiemKe.forEach((element) => {
      let monthkiemke = new Date(element.thangKiemKe).getMonth() + 1;
      let yearkiemke = new Date(element.thangKiemKe).getFullYear();
      if (
        month == monthkiemke &&
        year == yearkiemke &&
        element.warehouseId == this.inventoryDeliveryVoucher.warehouseId
      ) {
        this.showsuakiemke = true;
        this.showluukiemke = false;
        // this.showluukiemke = true;
        // this.showsuakiemke = false;
        this.showToast(
          "error",
          "Thông báo: ",
          "Phiếu xuất này thuộc đợt kiểm kê đã hoàn thành nên không thể sửa được dữ liệu"
        );
      } else if (
        month != monthkiemke ||
        year != yearkiemke ||
        element.warehouseId != this.inventoryDeliveryVoucher.warehouseId
      ) {
        this.showsuakiemke = false;
        this.showluukiemke = true;
        this.disableView = false
        //this.luuKiemKe();
      }
    });
  }

  luuKiemKe() {
    this.showsuakiemke = false;
    this.loading = true;
    // call API
    this.changeStatus();
    this.loading = false;
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
