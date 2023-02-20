import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, Table, DialogService } from 'primeng';
import { GetPermission } from "../../../../shared/permission/get-permission";
import { InventoryDeliveryVoucherModel } from "../../../models/InventoryDeliveryVoucher.model";
import { WarehouseService } from '../../../services/warehouse.service';
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
  selector: "app-tao-moi-xuat-kho",
  templateUrl: "./tao-moi-xuat-kho.component.html",
  styleUrls: ["./tao-moi-xuat-kho.component.css"],
})
export class TaoMoiXuatKhoComponent implements OnInit {
  @ViewChild("myTable") myTable: Table;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  loading: boolean = false;
  deNghiXuatKhoEdit: boolean = false;
  isInvalidForm: boolean = false;

  // is possition fixed
  fixed: boolean = false;
  withFiexd: string = "";

  awaitResult: boolean = false;

  // formGroup and formControl
  xuatkhoSXForm: FormGroup;
  loaiPhieuXuatControl: FormControl;
  inventoryDeliveryVoucherCodeControl: FormControl;
  khoXuatControl: FormControl;
  dateNgayXuatControl: FormControl;
  khoNhanControl: FormControl;
  departmentControl: FormControl;
  receiveControl: FormControl;

  vatTu: FormGroup;
  vatTuControl: FormControl;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  // End form

  // dữ liệu masterdata
  ngayHienTai: any;
  userName: any;
  department: any;
  listKhoXuat: Array<any> = [];
  listKhoNhan: Array<any> = [];
  listProductCheck: Array<any> = [];
  listProduct: Array<any> = [];
  listOrganization: Array<any> = [];
  listEmployee: Array<any> = [];
  listDataUse: Array<any> = [];

  // type
  warehouseType: number;
  productType: number;

  /* col */
  colsDanhSachXuat: any;
  listData: Array<any> = [];
  colsVatTu: any;

  // dialog
  xuatKho: any;
  listDataDialog: Array<any> = [];
  donViTinh: any;
  soLuongTon: any = "";
  selectVatTu: any;

  tongSoLuongGiao: number = 0;

  emitStatusChangeForm: any;

  // action phân quyền
  actionAdd: boolean = true;
  actionDelete: boolean = true;
  inventoryType: any;
  isEdit: boolean = false;

  selectOrg: FormControl;
  isWarehouseNVL: boolean = true;

  constructor(
    private router: Router,
    private warehouseService: WarehouseService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private ref: ChangeDetectorRef,
    public dialogService: DialogService,
    private getPermission: GetPermission
  ) {
    this.route.params.subscribe((params) => {
      if (params["WarehouseType"]) {
        this.warehouseType = params["WarehouseType"];
      }

      if (params["ProductType"]) {
        this.productType = params["ProductType"];
      }

      if (params["KhoType"]) {
        this.inventoryType = params["KhoType"];
      }
    });
  }

  async ngOnInit() {
    this.initForm();
    this.initTable();
    this.ngayHienTai = formatDatetime(new Date());
    let resource = "war/warehouse/tao-moi-xuat-kho/create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
    }

    this.getMasterData();
  }

  goBack() {
    this.router.navigate(["/warehouse/danh-sach-xuat-kho/list"]);
  }

  initTable() {
    this.colsDanhSachXuat = [
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
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
    ];
  }

  taoPhieuXuatKho(mode: boolean) {
    if (!this.xuatkhoSXForm.valid) {
      Object.keys(this.xuatkhoSXForm.controls).forEach((key) => {
        if (this.xuatkhoSXForm.controls[key].valid == false) {
          this.xuatkhoSXForm.controls[key].markAsTouched();
        }
      });
      return;
    }

    if (this.listDataUse.length == 0) {
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
              "/warehouse/chi-tiet-phieu-xuat/detail",
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
    inventoryDeliveryVoucherModel.organizationId = this.emptyGuid;
    inventoryDeliveryVoucherModel.receiverId = this.emptyGuid;

    // inventoryDeliveryVoucherModel.inventoryDeliveryVoucherType =
    //   this.xuatkhoSXForm.get("inventoryDeliveryVoucherCodeControl").value;

    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherType =
      this.loaiPhieuXuatControl.value;

    inventoryDeliveryVoucherModel.warehouseId =
      this.xuatkhoSXForm.get("khoXuatControl").value?.warehouseId;

    inventoryDeliveryVoucherModel.wareHouseReceivingId =
      this.xuatkhoSXForm.get("khoNhanControl").value?.warehouseId;

    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherDate =
      convertToUTCTime(this.xuatkhoSXForm.get("dateNgayXuatControl").value);

    // data default
    inventoryDeliveryVoucherModel.inventoryDeliveryVoucherTime = null;
    inventoryDeliveryVoucherModel.createdById = this.emptyGuid;
    inventoryDeliveryVoucherModel.createdDate = new Date();
    inventoryDeliveryVoucherModel.statusName = "Mới";
    inventoryDeliveryVoucherModel.active = true;
    inventoryDeliveryVoucherModel.warehouseCategory = 0;
    inventoryDeliveryVoucherModel.objectId = this.emptyGuid;
    inventoryDeliveryVoucherModel.reason = null;

    return inventoryDeliveryVoucherModel;
  }

  onInitForm(type) {
    this.khoXuatControl = new FormControl(null, Validators.required);
    this.khoNhanControl = new FormControl(null, Validators.required);
    this.dateNgayXuatControl = new FormControl(null, Validators.required);
    this.departmentControl = new FormControl(null);
    this.receiveControl = new FormControl(null);
    this.selectOrg = new FormControl(null);
    if (type == 3) {
      this.khoNhanControl = new FormControl(null);
    }
    this.xuatkhoSXForm = new FormGroup({
      loaiPhieuXuatControl: this.loaiPhieuXuatControl,
      khoXuatControl: this.khoXuatControl,
      khoNhanControl: this.khoNhanControl,
      dateNgayXuatControl: this.dateNgayXuatControl,
      departmentControl: this.departmentControl,
      receiveControl: this.receiveControl,
      selectOrg: this.selectOrg,
    });
  }

  initForm() {
    // this.route.params.subscribe(params => {
    //   if (params['WarehouseType']) {
    //     this.warehouseType = params['WarehouseType'];
    //   }
    // }
    if (this.route.snapshot.params.KhoType == 10) {
      this.loaiPhieuXuatControl = new FormControl(10);
      this.onClickType(10);
    } else if (this.route.snapshot.params.KhoType == 9) {
      this.loaiPhieuXuatControl = new FormControl(9);
      this.onClickType(9);
    } else if (this.route.snapshot.params.KhoType == 11) {
      this.loaiPhieuXuatControl = new FormControl(11);
      this.onClickType(11);
    } else if (this.route.snapshot.params.KhoType == 3) {
      this.loaiPhieuXuatControl = new FormControl(3);
      this.onClickType(3);
    }

    this.onInitForm(this.route.snapshot.params.KhoType);

    this.vatTuControl = new FormControl(null, Validators.required);
    this.vatTu = new FormGroup({
      vatTuControl: this.vatTuControl,
    });

    this.vatTuControlEdit = new FormControl(null, Validators.required);
    this.vatTuEdit = new FormGroup({
      vatTuControlEdit: this.vatTuControlEdit,
    });
  }

  async getMasterData() {
    this.loading = true;
    let [masterDataResult, getKhoXuat]: any = await Promise.all([
      this.warehouseService.getMasterInventoryDeliveryVoucherRequestAsync(this.warehouseType, this.productType
      ),
      this.warehouseService.getListWareHouseAsync(this.isWarehouseNVL ? 3 : 2, ""),
    ]);
    if (
      masterDataResult.statusCode == 200 &&
      getKhoXuat.statusCode == 200
    ) {
      this.userName = masterDataResult.nameCreate;
      this.department = masterDataResult.employeeDepartment;
      // this.listProductCheck = masterDataResult.listProduct;
      // this.listProduct = masterDataResult.listProduct;
      this.listKhoXuat = getKhoXuat.listWareHouse;
      this.listOrganization = masterDataResult.listOrganization;
      // this.listKhoNhan = getKhoNhan.listWareHouse;

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
    } 
  }

  async onClickType(value: number) {
    this.inventoryType = value;
    this.onInitForm(this.inventoryType);

    if (value == 9) {
      this.isWarehouseNVL = true;
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

        this.getMasterData()
      }
    }
    else if (value == 10) {
      this.isWarehouseNVL = true;
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

        this.getMasterData()
      }
    }
    else if (value == 11) {
      this.isWarehouseNVL = false;
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

        if (this.listKhoNhan != null && this.listKhoNhan != undefined && this.listKhoNhan.length > 0) {
          this.khoNhanControl.setValue(this.listKhoNhan[0]);
        }

        this.getMasterData();
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

    this.onChangeWarehoueDelivery();
  }

  checkVatTu(data) {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData;
      return;
    }

    if (data) {
      this.listDataDialog = [];
      this.donViTinh = data.value.productUnitName;
      this.soLuongTon = data.value.quantityInventory;
      this.selectVatTu = data.value;
      this.addField();
    }
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

  themMoiDialog() {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData;
      return;
    }
    let check = this.listDataDialog.filter(
      (x) => x.lotNoId == "" || x.LotNo == null
    );
    if (check.length == 0) {
      let listId = [];
      this.listDataDialog.forEach((x) => listId.push(x.lotNoId));
      let noidungTT: mapDataDialog = {
        lotNoId: "",
        LotNo: null,
        tonKho: 0,
        sLuongGiao: 0,
        thaoTac: null,
        dataLotNo: this.selectVatTu.listProductLotNoMapping.filter(
          (x, i) => listId.indexOf(x.lotNoId) == -1
        ),
      };
      this.listDataDialog.push(noidungTT);
      this.tinhTong();
      this.ref.detectChanges();
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
    this.listDataDialog.filter((e, i) => {
      if (i == index) {
        e.lotNoId = data.value.lotNoId;
        e.Lotno = data.value;
        e.tonKho = data.value.quantityInventory;
        e.sLuongGiao = data.value.quantityDelivery;
      }
    });
    this.hiddenOption(index);
    this.tinhTong();
    this.ref.detectChanges();
  }

  changeLoaiPhieuXuat() {
    // thay đổi form theo loại phiếu xuất
    let selectedLoaiPhieuXuat: LoaiPhieuXuat = this.loaiPhieuXuatControl.value;
    this.loaiPhieuXuatControl.setValue(1);
    this.ref.detectChanges();

    this.khoNhanControl.reset();

    this.khoXuatControl.reset();

    // this.loaiPhieuXuatControl.reset;
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
              tonKho: x.tonKho,
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
              tonKho: x.tonKho,
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

  luuDialog() {
    this.listDataDialog = this.listDataDialog.filter(
      (x) =>
        x.LotNo != null &&
        x.sLuongGiao != 0 &&
        ParseStringToFloat(x.tonKho) >= ParseStringToFloat(x.sLuongGiao)
    );

    if (this.listDataDialog.length > 0) {
      if (this.isEdit) {
        var lstItem = this.listDataUse.filter(c => c.productId == this.vatTuControl.value.productId)
        if (lstItem != null && lstItem != undefined) {
          lstItem.forEach(item => {
            var removeItem = this.listDataUse.indexOf(item);
            if (removeItem > -1) {
              this.listDataUse.splice(removeItem, 1);
            }
          })
        }

        this.listDataDialog.forEach((y) => {
          let data: MapDataList = {
            inventoryDeliveryVoucherMappingId: this.emptyGuid,
            inventoryDeliveryVoucherId: this.emptyGuid,
            productId: y.LotNo.productId,
            productCode: null,
            quantityRequire: null,
            quantityInventory: ParseStringToFloat(y.tonKho),
            quantity: 0,
            price: 0,
            warehouseId: this.emptyGuid,
            note: null,
            active: true,
            createdDate: new Date(),
            createdById: this.emptyGuid,
            listSerial: [],
            discountValue: 0,
            totalSerial: 0,
            quantityDelivery: ParseStringToFloat(y.sLuongGiao),
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
          this.listDataUse.push(data);
        });
      }
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
      let donViTinh = "";
      let vatTuName = "";
      let productId = "";
      let tonKho = 0;
      let sLuongGiao = 0;
      this.listDataUse.forEach((z) => {
        if (y == z.productId) {
          donViTinh = this.listProductCheck.find(
            (i) => i.productId == y
          )?.productUnitName;
          productId = z.productId;
          tonKho += ParseStringToFloat(z.quantityInventory);
          sLuongGiao += ParseStringToFloat(z.quantityDelivery);
        }
      });
      vatTuName = this.listProductCheck.find(
        (i) => i.productId == y
      ).productName;
      let data = {
        stt: null,
        vatTuId: y,
        productId: productId,
        TenHangHoa: vatTuName,
        donViTinh: donViTinh,
        soLuongTon: tonKho,
        soLuongGiao: sLuongGiao,
        thaoTac: null,
      };
      this.listData.push(data);
    });

    this.listData = this.listData.sort((a, b) => a.TenHangHoa.localeCompare(b.TenHangHoa));
  }

  huyDialog() {
    this.listDataDialog = [];
    this.donViTinh = "";
    this.soLuongTon = "";
    this.vatTu.reset();
    this.getMasterData();
    this.xuatKho = false;
  }

  tenHangHoaDetail(data: MapDataTable) {
    this.isEdit = true;
    this.xuatKho = true;
    this.listDataDialog = [];
    this.vatTuControl.disable();
    this.vatTuControl.setValue(
      this.listProduct.find((x) => x.productId == data.productId)
    );
    this.selectVatTu = this.listProduct.find(
      (x) => x.productId == data.productId
    );
    this.addField();
    this.tongSoLuongGiao = 0;
    this.listDataUse.forEach((x) => {
      if (x.productId == this.vatTuControl.value.productId) {
        let mapDataDialog: mapDataDialog = {
          lotNoId: this.vatTuControl.value.listProductLotNoMapping.find(
            (i) => i.lotNoId == x.lotNoId
          ).lotNoId,
          LotNo: this.vatTuControl.value.listProductLotNoMapping.find(
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
    //this.hiddenOption(null);
    this.tinhTong();
    this.donViTinh = this.vatTuControl.value.productUnitName;
    this.soLuongTon = this.vatTuControl.value.quantityInventory;
  }

  onRowRemove(data) {
    this.listDataDialog = this.listDataDialog.filter((x) => x != data);
    this.tinhTong();
  }

  async changeDepartmentgetWH() {
    this.loading = true;
    var typeWare = this.inventoryType == 3 ? 5 : 0;
    let [getListWarehouse, getEmployeeByOrganization]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(
        typeWare,
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
    } else if (getEmployeeByOrganization.statusCode == 200) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: getEmployeeByOrganization.messageCode,
      };
      this.showMessage(msg);
    }
  }

  xoaDataTable(data, i) {
    this.listData = this.listData.filter(
      (x) => x.TenHangHoa != data.TenHangHoa
    );
    this.listDataUse = this.listDataUse.filter(
      (x) => x.productName != data.TenHangHoa
    );
  }

  tinhTong() {
    this.tongSoLuongGiao = 0;
    this.listDataDialog.forEach((i) => {
      if (i.LotNo != "") {
        {
          this.tongSoLuongGiao += ParseStringToFloat(i.sLuongGiao);
        }
      }
    });
  }

  saveNVL(data) {
    this.isEdit = false;
    this.xuatKho = true;
    this.vatTuControl.setValue(null);
    this.listDataDialog = [];
  }

  setDefaultValue() {}

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  async onChangeWarehoueDelivery() {
    if (this.khoXuatControl.value != null && this.khoXuatControl.value != undefined) {
      this.loading = true;
      let [resultInventoryStock]: any = await Promise.all([
        this.warehouseService.getInventoryStockByWarehouseAsync(this.khoXuatControl.value.warehouseId, this.inventoryType),
      ]);
      this.listDataUse = resultInventoryStock.inventoryDeliveryVoucherMappingModel;
      this.gopData();
      this.loading = false;
    }
    else {
      this.listDataUse = [];
    }
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

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, "");
  return parseFloat(str);
}
