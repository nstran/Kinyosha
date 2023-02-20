import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { WarehouseService } from "../../../services/warehouse.service";
import { CategoryService } from "../../../../shared/services/category.service";
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { TreeWarehouseComponent } from '../../tree-warehouse/tree-warehouse.component';
import { DeliveryvoucherCreateSerialComponent } from '../../serial/deliveryvoucher-create-serial/deliveryvoucher-create-serial.component';
import { AddProductComponent } from '../../add-product/add-product.component';
import { InventoryDeliveryVoucher, InventoryDeliveryVoucherModel } from '../../../models/InventoryDeliveryVoucher.model';
import { EmployeeService } from '../../../../employee/services/employee.service';
import * as $ from 'jquery';
import { MessageService, TreeNode } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CustomerService } from '../../../../customer/services/customer.service';
import { NoteModel } from '../../../../shared/models/note.model';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { FileUpload, Table } from 'primeng';
import { WarehouseModel } from "../../../../warehouse/models/warehouse.model";
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

class LoaiPhieuXuat {
  name: string;
  type: number;
}

class Warehouse {
  warehouseId: string;
  warehouseParent: string;
  hasChild: boolean;
  warehouseCode: string;
  warehouseName: string;
  warehouseCodeName: string;
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

class mapDataDialog {
  lotNoId: any;
  LotNo: any;
  tonKho: number;
  soLuongTon: number;
  soLuongGiao: number;
  // // soLuongDeNghi: number;
  // ghiChu: string;
  thaoTac: any;
  dataLotNo: any;
}

class MapDataTable {
  productId: string;
  tenHangHoa: string;
  donViTinh: string;
  tonKho: number;
  soLuongGiao: number
  soLuongTon: number;
}

class DataMaping {
  productId: string;
  unitId: string;
  lotNoName: string;
  soLuongGiao: number;
  tonKho: number;
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
  selector: "app-inventory-delivery-voucher-create-update",
  templateUrl: "./inventory-delivery-voucher-create-update.component.html",
  styleUrls: ["./inventory-delivery-voucher-create-update.component.css"],
  providers: [DialogService],
})
export class InventoryDeliveryVoucherCreateUpdateComponent implements OnInit {
  createForm: FormGroup;
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));

  // Thông tin chung
  loaiPhieu: number = 1;

    /*Danh sach nguyen vat lieu*/
    colsGroupVatLieu: any;
    colsChiTietVatLieu: any;
    listItemGroup: Array<phieuXuatKhoModel> = [];
 
    listChiTietLotNo: Array<ChiTietLotNo> =[];
    listLotNo:any=[];
  
    productGroup: FormGroup;
    productSelected: Array<any> = [];
    showDetailDialog: boolean = false;
    isDisableMultiSelect = false;


  // master data
  listProductLotNoMapping: Array<any> = [];
  ngayHienTai: any;
  userName: any;
  department: any;
  /* dropdown chọn kho nhận và kho xuất */
  listWarehouseReceiving: Array<Warehouse> = [];
  listWarehouseDelivery: Array<Warehouse> = [];
  listOrganization: Array<any> = [];
  listEmployee: Array<any> = [];
  listEmployee1: Array<any> = [];

  listDataUse: Array<MapDataList> = [];

  listLotNoCheck: any;

  listProduct: Array<any> = [];
  listAllProduct: Array<any> = [];

  loaiPhieuXuatType: number = 1;
  listProductDeliveryEntityModel: Array<any> = [];
  listPhieuNhapLai: Array<InventoryDeliveryVoucher> = [];

  inventoryDeliveryData: InventoryDeliveryVoucherModel =
    new InventoryDeliveryVoucherModel();

  selectKhoNhan: Array<any> = [];
  selectKhoXuat: Array<any> = [];
  selectPhieuNhapLai: Array<any> = [];

  // calendar
  dateNgayXuat: Date = new Date();

  typePage: number;

  /* Dữ liệu */

  /* Vat tu Form */
  vatTu: FormGroup;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  vatTuControl: FormControl;
  listVatTuCheck: Array<any> = [];
  listVatTu: Array<any> = [];
  ngayNhap: FormControl;
  loaiVL: number;
  checkEdit: boolean = false;
  donViTinh: any;

  deNghiXuatKhoEdit: boolean = false;

  soLuongTon: any = "";
  selectVatTu: any;
  selectLotNo: any;

  listDataDialog: Array<any> = [];
  listData: Array<any> = [];
  tongTonKho: number = 0;
  tongSoLuongDeNghi: number = 0;

  /* FORM */
  inventoryDeliveryForm: FormGroup;
  inventoryDeliveryVoucherCodeControl: FormControl;
  khoXuatControl: FormControl;
  khoNhanControl: FormControl;
  loaiPhieuNhapControl: FormControl;
  departmentControl: FormControl;
  // receiveControl: FormControl; // người nhận
  loaiPhieuXuatControl: FormControl;
  dateNgayXuatControl: FormControl;
  receiveControl: FormControl;

  //Code moi
  dateNow: any;
  inventoryVoucher: InventoryDeliveryVoucher = new InventoryDeliveryVoucher();
  listCategoryId: Array<string> = [];
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listVendor: Array<any> = [];
  listKhoNhan: Array<any> = [];
  listKhoNhanInit: Array<any> = [];
  listKhoXuat: Array<any> = [];

  listAllKho: Array<any> = [];
  listKhoNhanCSX: Array<any> = [];
  listKiemKe: any = [];
  minDate: Date;

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

  noteControl: string;

  warehouseType: number;
  productType: number;

  categoryTypeModelList: Array<any> = [];

  awaitResult: boolean = false;

  khoControl: FormControl;

  // open dialog
  xuatKho: any;

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

  /* action phân quyền */
  actionView: boolean = true;
  actionAdd: boolean = true;
  actionDelete: boolean = true;

  // Is possition fiexd
  fixed: boolean = false;
  withFiexd: string = "";

  /* Dữ liệu */
  loaiPhieuXuat: Array<LoaiPhieuXuat> = [
    {
      name: "Xuất lại",
      type: 2,
    },
    {
      name: "Xuất khác",
      type: 3,
    },
  ];

  /*Popup Kho list Kho con*/
  chonKho: boolean = false;
  listDetailWarehouse: TreeNode[];
  selectedWarehouseChilren: TreeNode;
  /*End*/

  rowDataChoose: any = null;
  selectOrg: FormControl;

  constructor(
    public employeeService: EmployeeService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private renderer: Renderer2,
    private router: Router,
    private confirmationService: ConfirmationService,
    private warehouseService: WarehouseService,
    private refe: ChangeDetectorRef,
    private el: ElementRef
  ) {
    // this.route.params.subscribe((params) => {
    //   if (params["WarehouseType"]) {
    //     this.warehouseType = params["WarehouseType"];
    //   }
    // });

    this.route.params.subscribe((params) => {
      if (params["WarehouseType"]) {
        this.warehouseType = params["WarehouseType"];
      }
      if (params["ProductType"]) {
        this.productType = params["ProductType"];
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
    this.vatTuControlEdit.disable();
    this.vatTuControlEdit.setValue(this.listAllProduct.find((x) => x.productId == rowData.productId));
    this.selectVatTu = this.listAllProduct.find((x) => x.productId == rowData.productId);

    this.donViTinh = this.vatTuControlEdit.value.productUnitName;
    this.soLuongTon = this.vatTuControlEdit.value.quantityInventory;

    this.listChiTietLotNo = [];
    rowData.listChiTietLotNo.forEach(element => {
      let _lotno : ChiTietLotNo = {
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
        lotNoId:element.lotNoId,
        listLotNo:element.listLotNo,
        lotNo: element.lotNo,
      };
      this.listChiTietLotNo.push(_lotno);
    });

    this.showDetailDialog = true;

    // this.tongSoLuongDeNghi = 0;
    // this.tongTonKho = 0;

    // this.listDataUse.forEach((x) => {
    //   if (x.productId == this.vatTuControlEdit.value.productId) {
    //     let mapDataDialog: mapDataDialog = {
    //       lotNoId: this.vatTuControlEdit.value.listProductLotNoMapping.find(
    //         (i) => i.lotNoId == x.lotNoId
    //       ).lotNoId,
    //       LotNo: this.vatTuControlEdit.value.listProductLotNoMapping.find(
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
    // this.tinhTong();
   
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
              soLuongTon: x.soLuongTon,
              // soLuongDeNghi: x.soLuongDeNghi,
              // ghiChu: x.ghiChu,
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
            soLuongTon: x.soLuongTon,
            // soLuongDeNghi: x.soLuongDeNghi,
            // ghiChu: x.ghiChu,
            thaoTac: null,
            dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
              (x, i) => listId.indexOf(x.lotNoId) == -1
            ), //listId.indexOf(x.lotNoId) == -1
          };
        });
      }
    }
  }

  async ngOnInit() {
    this.setForm();
    this.initTable();
    this.ngayHienTai = formatDatetime(new Date());
    this.route.params.subscribe((params) => {
      this.idInventoryDeliveryVoucher = params["id"];
    });
    let resource = "war/warehouse/inventory-delivery-voucher/create-update/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.actionView = false;
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
    }
    this.route.params.subscribe((params) => {
      if (params["type"]) {
        this.loaiPhieuXuat = params["type"];
      }
    });
    this.getMasterData();
  }

  onClickType() {
    if (this.loaiPhieuXuatControl.value == 2) {
      this.listKhoNhan = this.listKhoNhanCSX;
    }
    if (this.loaiPhieuXuatControl.value == 3) {
      this.listKhoNhan = this.listAllKho;
      this.changeDepartmentgetWH();
    }

  }

  initTable() {
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

    this.colsXuatKho = [
      {
        field: "STT",
        header: "STT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "TenHangHoa",
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
        width: "50px",
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

  async getMasterData() {
    this.loading = true;
    let [masterDataResult, getKhoXuat, getKhoNhan]: any = await Promise.all([
      this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(
        this.warehouseType,
        this.productType
      ),
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
      this.listProductDeliveryEntityModel = masterDataResult.listProduct;
      this.listProduct = masterDataResult.listProduct;
      this.listAllProduct = masterDataResult.listProduct;
      this.listOrganization = masterDataResult.listOrganization;
      this.listEmployee = masterDataResult.listEmployee;
      this.listKhoXuat = getKhoXuat.listWareHouse;
      this.listKhoNhan = getKhoNhan.listWareHouse;

      this.listKhoNhanCSX = getKhoNhan.listWareHouse;
      this.listKiemKe = masterDataResult.listDotKiemKe;

      this.setDefaultValue();
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

  async changeDepartmentgetWH() {
    //if (this.departmentControl.value == null) {
    //  this.listKhoNhan = this.listAllKho;
    //  this.listEmployee = [];
    //  return;
    //}

    this.loading = true;
    let [getListWarehouse, getEmployeeByOrganization]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(null, this.departmentControl.value?.organizationId),
      this.warehouseService.getEmployeeByOrganizationId(
        this.departmentControl.value?.organizationId
      ),
    ]);
    this.loading = false;
    if (
      getListWarehouse.statusCode == 200 &&
      getEmployeeByOrganization.statusCode == 200
    ) {
      this.listEmployee1 = getEmployeeByOrganization.listEmployee;
      this.listKhoNhan = getListWarehouse.listWareHouse;
      this.listKhoNhanInit = [...getListWarehouse.listWareHouse];

      if (this.departmentControl.value == null) {
        this.listEmployee1 = [];
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
      this.setDefaultValue();
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
    this.khoXuatControl.setValue(this.listKhoXuat[0]);
  }

  changeLoaiPhieuXuat() {
    // thay đổi form theo loại phiếu xuất
    let selectedLoaiPhieuXuat: LoaiPhieuXuat = this.loaiPhieuXuatControl.value;
    this.loaiPhieuXuatControl.setValue(1);
    this.refe.detectChanges();

    // reset list chon kho nhan
    this.khoNhanControl.reset();

    // reset list chon kho xuat
    this.khoXuatControl.reset();

    // reset list phieu nhap lai
    this.listPhieuNhapLai = [];
    this.loaiPhieuNhapControl.reset();

    // test dữ liệu
    if (this.loaiPhieuNhapControl.value == 1) {
      this.loading = false;
    }
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

  deleteLotNo(rowData: any) {
    this.listChiTietLotNo = this.listChiTietLotNo.filter((x) => x.lotNoId != rowData.lotNoId);
    this.listItemGroup.find((i)=>i.productId == rowData.productId).listChiTietLotNo = this.listItemGroup.find((i)=>i.productId == rowData.productId).listChiTietLotNo.filter((x) => x.lotNoId != rowData.lotNoId);
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
      soLuongGiao: 0,
      soLuongTon: 0,
      thaoTac: null,
      dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
        (x, i) => listId.indexOf(x.lotNoId) == -1
      ),
    };

    this.listLotNoCheck = this.selectVatTu.listProductLotNoMapping;
    this.listDataDialog.push(noiDUngTT);

    this.tinhTong();
    this.refe.detectChanges();
  }

  setForm() {
    // form control
    this.inventoryDeliveryVoucherCodeControl = new FormControl(null);
    this.khoXuatControl = new FormControl(null, Validators.required);
    this.khoNhanControl = new FormControl(null);
    this.loaiPhieuXuatControl = new FormControl(2);
    this.dateNgayXuatControl = new FormControl(new Date(), Validators.required);
    this.receiveControl = new FormControl(null);
    this.departmentControl = new FormControl(null);
    this.selectOrg = new FormControl(null);

    // form group
    this.inventoryDeliveryForm = new FormGroup({
      inventoryDeliveryVoucherCodeControl:
        this.inventoryDeliveryVoucherCodeControl,
      khoXuatControl: this.khoXuatControl,
      khoNhanControl: this.khoNhanControl,
      dateNgayXuatControl: this.dateNgayXuatControl,
      loaiPhieuXuatControl: this.loaiPhieuXuatControl,
      receiveControl: this.receiveControl,
      departmentControl: this.departmentControl,
      selectOrg: this.selectOrg,
    });

    // vat tu form control
    this.vatTuControl = new FormControl(null, [Validators.required]);
    this.vatTu = new FormGroup({
      vatTuControl: this.vatTuControl,
    });

    this.vatTuControlEdit = new FormControl(null, [Validators.required]);
    this.vatTuEdit = new FormGroup({
      vatTuControlEdit: this.vatTuControlEdit,
    });
  }

  taoPhieuXuatKho(mode: boolean) {    
    if (!this.inventoryDeliveryForm.valid) {
      Object.keys(this.inventoryDeliveryForm.controls).forEach((key) => {
        if (!this.inventoryDeliveryForm.controls[key].valid) {
          this.inventoryDeliveryForm.controls[key].markAsTouched();
        }
      });
    }
    else
    {
      if (this.listItemGroup.length == 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Danh sách xuất chưa có dữ liệu!",
        };
        this.showMessage(msg);
        return;
      }
      let inventoryDeliveryVoucherModel = this.mapDataToModelPhieuXuatKho();
      let noteContent: string = "a";
      this.loading = true;

      let listChiTietLotNo = [];
      this.listItemGroup.forEach((element) => {
        element.listChiTietLotNo.forEach((lotno) => {
          lotno.lotNoName = "";
          listChiTietLotNo.push(lotno);
        });
      });
    
    if (listChiTietLotNo.length == 0) {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Chưa có sản phẩm.",};
        this.showMessage(msg);
        return;
    }
      
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
                  productType: this.productType,
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
  }

  resetForm() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
      this.isInvalidForm = false;
    }

    // ngày xuất
    // this.dateNgayXuatControl.setValue(new Date());
  }

  mapDataToModelPhieuXuatKho() {
    let inventoryDeliveryVoucherModel = new InventoryDeliveryVoucherModel();
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherId = this.emptyGuid;
    inventoryDeliveryVoucherModel.nameCreate = this.userName;
    inventoryDeliveryVoucherModel.statusId = this.emptyGuid;
    inventoryDeliveryVoucherModel.organizationId =
      this.inventoryDeliveryForm.get("departmentControl").value?.organizationId;

    // console.log(
    //   this.inventoryDeliveryForm.get("receiveControl").value);

    if (this.loaiPhieuXuatControl.value == 3) {
      inventoryDeliveryVoucherModel.receiverId =
        this.inventoryDeliveryForm.get("receiveControl").value?.EmployeeId;
    } else {
      inventoryDeliveryVoucherModel.receiverId =
        this.inventoryDeliveryForm.get("receiveControl").value?.employeeId;
    }

    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherType =
      this.inventoryDeliveryForm.get(
        "inventoryDeliveryVoucherCodeControl"
      ).value;
    
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherType =
      this.loaiPhieuXuatControl.value;

    inventoryDeliveryVoucherModel.warehouseId =
      this.inventoryDeliveryForm.get("khoXuatControl").value?.warehouseId;

    inventoryDeliveryVoucherModel.wareHouseReceivingId =
      this.inventoryDeliveryForm.get("khoNhanControl").value?.warehouseId;

    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherDate =
      convertToUTCTime(
        this.inventoryDeliveryForm.get("dateNgayXuatControl").value
      );
    inventoryDeliveryVoucherModel.note = this.noteControl;
    // data default
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherTime = null;
    inventoryDeliveryVoucherModel.createdById = this.emptyGuid;
    inventoryDeliveryVoucherModel.createdDate = new Date();
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

  addNewDialog(){
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
  
  addNewLotNo(){
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData();
      return;
    }

    let checkLotNo = this.listChiTietLotNo.filter((x) => x.lotNo == null);
    if (checkLotNo.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo", detail: "Vui lòng chọn LotNo!" };
      this.showMessage(msg);
      return;
    }

    

    let listId = [];
    this.listChiTietLotNo.forEach((y)=> listId.push(y.lotNoId));

    let _lotno: ChiTietLotNo = {
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
      listLotNo: this.selectVatTu.listProductLotNoMapping.filter((x, i) => listId.indexOf(x.lotNoId) == -1),
    };

    this.listChiTietLotNo.push(_lotno);
    this.refe.detectChanges();

    let target;
    target = this.el.nativeElement.querySelector('.item-lot-no-' + (this.listChiTietLotNo.length - 1) + ' input');
    if (target) {
      target.focus();
    }

    // let checkSoLuong = this.listChiTietLotNo.filter((x) => ParseStringToFloat(x.quantityInventory) > ParseStringToFloat(x.quantityDelivery));
    // if (checkSoLuong.length > 0) {
    //   let msg = { severity: "warn", summary: "Thông báo", detail: "Số lượng giao phải nhỏ hơn hoặc bằng số lượng tồn kho!" };
    //   this.showMessage(msg);
    //   return
    // }
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
      (x) => x.lotNoId == "" || x.lotNo == null
    );
    if (check.length == 0) {
      let listId = [];
      this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
      let noiDUngTT: mapDataDialog = {
        lotNoId: "",
        LotNo: null,
        tonKho: 0,
        soLuongTon: 0,
        soLuongGiao: 0,
        thaoTac: null,
        dataLotNo: this.selectVatTu.listProductLotNoMapping.filter((x, i) => listId.indexOf(x.lotNoId) == -1),
      };
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

  changelotNo(data, index) {
    this.listChiTietLotNo.filter((e, i) => {
      if (i == index) {
        e.lotNoId = data.value.lotNoId;
        e.lotNo = data.value;
        e.lotNoName = data.value.lotNoName;
        e.quantityInventory = data.value.quantityInventory;
        e.quantityDelivery = data.value.quantityDelivery;
      }
    });

    //  this.hiddenOption(index);
    // this.tinhTong();
    this.refe.detectChanges();
  }

  tinhTong() {
    // this.tongTonKho = 0;
    this.tongSoLuongDeNghi = 0;
    this.listDataDialog.forEach((i) => {
      if (i.lotNo != "") {
        {
          // this.tongTonKho += ParseStringToFloat(i.tonKho)
          this.tongSoLuongDeNghi += ParseStringToFloat(i.soLuongGiao);
        }
      }
    });
  }

  goBack() {
    this.router.navigate(["/warehouse/inventory-delivery-voucher/list"]);
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

  xoaDeXuat(data, index) {
    this.listDataDialog = this.listDataDialog.filter((x) => x != data);
    this.hiddenOption(index);
    this.tinhTong();
    // this.updateLotNo()
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

  // saveNVL(data) {
  //   this.xuatKho = true;
  // }

  changeWarhouse(event: any) {
    if (event.value == null) return;
    this.inventoryVoucher.WarehouseId = event.value.warehouseId;
    if (this.listVendorOrderProduct != null) {
      for (let i = 0; i < this.listVendorOrderProduct.length; i++) {
        if (this.selectedWarehouse != null) {
          this.listVendorOrderProduct[i].wareHouseName =
            this.selectedWarehouse.warehouseName;
          this.listVendorOrderProduct[i].wareHouseId =
            this.selectedWarehouse.warehouseId;
        }
        this.listVendorOrderProduct[i].choose = true;
        this.listVendorOrderProduct[i].chooseChild = true;
      }
    }
    if (this.listVendorOrderProductType3and4 != null) {
      for (let i = 0; i < this.listVendorOrderProductType3and4.length; i++) {
        if (this.selectedWarehouse != null) {
          this.listVendorOrderProductType3and4[i].wareHouseName =
            this.selectedWarehouse.warehouseName;
          this.listVendorOrderProductType3and4[i].wareHouseId =
            this.selectedWarehouse.warehouseId;
          //}
        }
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

  showAddProduct() {
    this.ref = this.dialogService.open(AddProductComponent, {
      header: "THÊM SẢN PHẨM",
      width: "50%",
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

  xoaDataTable(rowData: any) {
    this.listItemGroup = this.listItemGroup.filter((x) => x.productId != rowData.productId);
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
      this.listChiTietLotNo = [];
      this.donViTinh = data.value.productUnitName;
      this.soLuongTon = data.value.quantityInventory;
      this.selectVatTu = data.value;
      // this.addField();
      this.addNewLotNo();
    }
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

  saveDialog() {
    let checkLotNo = this.listChiTietLotNo.filter(x => x.lotNo == null);
    if (checkLotNo.length > 0) {
      let msg = { severity: "warn", summary: "Thông báo:", detail: "Vui lòng chọn LotNo!", };
      this.showMessage(msg);
      return;
    }

    let checkSoLuong = this.listChiTietLotNo.filter((x) => ParseStringToFloat(x.quantityInventory) < ParseStringToFloat(x.quantityDelivery));
    if (checkSoLuong.length > 0) {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Số lượng giao phải nhỏ hơn hoặc bằng tồn kho!",
      };
      this.showMessage(msg);
      return;
    }


      let product = this.listItemGroup.find(
        (i) => i.productId == this.selectVatTu.productId
      );
    if(product == null)
    {
        let itemGroup: phieuXuatKhoModel = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: this.selectVatTu.productId,
          productName: this.selectVatTu.productName,
          productCode: this.selectVatTu.productCode,
          quantityRequire: 0,
          quantityDelivery: this.listChiTietLotNo.reduce((sum, current) => ParseStringToFloat(sum) + ParseStringToFloat(current.quantityDelivery), 0),
          quantityInventory: this.listChiTietLotNo.reduce((sum, current) => ParseStringToFloat(sum) + ParseStringToFloat(current.quantityInventory), 0),
          unitName: this.selectVatTu.productUnitName ,//this.listProduct.find((k) => k.productId == x.productId).productUnitName, element.unitName,
          listChiTietLotNo: []
        };

        this.listChiTietLotNo.forEach(element => {
          let _lotno : ChiTietLotNo = {
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
            lotNoId:element.lotNoId,
            listLotNo:element.listLotNo,
            lotNo: element.lotNo
          };
          itemGroup.listChiTietLotNo.push(_lotno)
        });
          this.listItemGroup.push(itemGroup)
          
    }
    else
    {
      this.listChiTietLotNo.forEach((lo) =>{
        lo.productId = product.productId;
        let existLotno = this.listItemGroup.find((i)=>i.productId == lo.productId).listChiTietLotNo.find((k) => k.lotNoId == lo.lotNoId);
        if(existLotno == null)
          {
           
            /*thêm mới lotno vào sản phẩm đã tồn tại*/
            this.listItemGroup.find((i)=>i.productId == product.productId).listChiTietLotNo.push(lo);
          }
          else
          {
            /*cập nhật số lượng lotno nếu tồn tại*/
            this.listItemGroup.find((i)=>i.productId == product.productId).listChiTietLotNo.find((k) => k.lotNoId == lo.lotNoId).quantityDelivery = lo.quantityDelivery;
          }
      })
    }

    /*Tinh lại số lượng giao*/
    this.listItemGroup.forEach((x)=>{
      x.quantityDelivery = x.listChiTietLotNo.reduce((sum, current) => ParseStringToFloat(sum) + ParseStringToFloat(current.quantityDelivery), 0);
    })

    this.showDetailDialog = false;

  }

  luuDialog() {

    // this.listDataDialog = this.listDataDialog.filter(
    //   (x) =>
    //     x.lotNo != null &&
    //     x.soLuongGiao != 0 &&
    //     ParseStringToFloat(x.tonKho) >= ParseStringToFloat(x.soLuongGiao)
    // );

    if (this.listDataDialog.length > 0) {
      this.listDataDialog.forEach((y) => {
        let dataUse: MapDataList = {
          inventoryDeliveryVoucherMappingId: this.emptyGuid,
          inventoryDeliveryVoucherId: this.emptyGuid,
          productId: y.LotNo.productId,
          productCode: null,
          quantityRequire: null, //So luong de nghi
          quantityInventory: ParseStringToFloat(y.tonKho),
          quantity: 0,
          price: 0,
          warehouseId: this.emptyGuid,
          note: y.note,
          active: true,
          createdDate: new Date(),
          createdById: this.emptyGuid,
          listSerial: [],
          discountValue: 0,
          totalSerial: 0,
          quantityDelivery: ParseStringToFloat(y.soLuongGiao), //So luong giao
          productReuse: "",
          lotNoId: y.LotNo.lotNoId,
          lotNoName: y.LotNo.lotNoName,
          productName: "",
          wareHouseName: "",
          unitName: this.donViTinh,
          nameMoneyUnit: "",
          sumAmount: 0,
          wareHouseType: 0,
        };
        this.listDataUse.push(dataUse);
      });

      let msg = {
        severity: "success",
        summary: "Thông báo:",
        detail: "Thêm vật tư thành công",
      };
      this.showMessage(msg);
    } else {
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "Thêm mới vật tư không thành công",
      };
      this.showMessage(msg);
    }
    this.gopData();

    this.huyDialog();
  }

  luuDialogEdit() {
    this.listDataDialog = this.listDataDialog.filter(
      (x) =>
        x.lotNo != null &&
        x.soLuongGiao != 0 &&
        ParseStringToFloat(x.tonKho) >= ParseStringToFloat(x.soLuongGiao)
    );

    if (this.listDataDialog.length > 0) {
      this.tinhTong();
      this.gopData();
      this.listDataUse = this.listDataUse.filter(
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
          productName: this.vatTuControlEdit.value.productName,
          wareHouseName: "",
          unitName: this.donViTinh,
          nameMoneyUnit: "",
          sumAmount: 0,
          wareHouseType: 0,
        };
        this.listDataUse.push(data);
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
    this.huyDialogEdit();
  }

  huyDialog() {
    // this.listDataDialog = [];
    // this.donViTinh = "";
    // this.soLuongTon = "";
    // this.vatTu.reset();
     this.getMasterData();
    this.showDetailDialog = false;
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

  gopData() {
    let listId = [];
    let listIdUni = [];
    this.listData = [];
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
      let soLuongTon = 0;
      this.listDataUse.forEach((z) => {
        if (y == z.productId) {
          // tongSoLuong += ParseStringToFloat(z.quantityActual)
          donViTinh = this.listProductDeliveryEntityModel.find(
            (i) => i.productId == y
          ).productUnitName;
          productId = z.productId;
        }
      });
      vatTuName = this.listProductDeliveryEntityModel.find(
        (i) => i.productId == y
      ).productName;
      let data = {
        stt: null,
        vatTuId: y,
        productId: productId,
        TenHangHoa: vatTuName,
        donViTinh: donViTinh,
        soLuongTon: this.soLuongTon,
        soLuongGiao: this.tongSoLuongDeNghi,
        // soLuong: tongSoLuong,
        thaoTac: null,
      };
      this.listData.push(data);
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
        this.inventoryVoucher.InventoryDeliveryVoucherId,
        ""
        // this.auth.UserId
      )
      .subscribe(
        (response) => {
          var result = <any>response;
          this.messageService.clear();
          this.isEdit = true;
          this.isNKH = true;
          this.messageService.add({
            key: "success",
            severity: "success",
            summary: "Thông báo:",
            detail: result.messageCode,
          });
          this.router.navigate([
            "/warehouse/inventory-delivery-voucher/detail",
            {
              inventoryDeliveryVoucherId: result.inventoryDeliveryVoucherId,
            },
          ]);
          window.location.reload();
        },
        (error) => {
          this.messageService.clear();
          this.messageService.add({
            key: "success",
            severity: "success",
            summary: "Thông báo:",
            detail: error.messageCode,
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

  onChangeWarehouse() {
    var checkKiemKe = this.listKiemKe.find(c => c.warehouseId == this.khoXuatControl.value?.warehouseId);
    if (checkKiemKe != null && checkKiemKe != undefined) {
      var thangKiemKe = new Date(checkKiemKe.thangKiemKe)
      this.minDate = (new Date(thangKiemKe.setMonth(thangKiemKe.getMonth() + 1)));
    }
    else {
      this.minDate = null;
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
}

function formatDatetime(time: Date) {
  let date = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  return `${date}/${month}/${year}`;
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate()));
};

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, "");
  return parseFloat(str);
}
