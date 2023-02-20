import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MessageService } from 'primeng';
import { InventoryReceivingVoucherModel } from "../../../../warehouse/models/InventoryReceivingVoucher.model";

import { WarehouseService } from '../../../services/warehouse.service';

class Warehouse {
  warehouseId: string;
  warehouseParent: string;
  hasChild: boolean;
  warehouseCode: string;
  warehouseName: string;
  warehouseCodeName: string;
}

class SanPhamPhieuNhapKhoModel {
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityActual: any;
  quantityProduct: any;
  quantityOK: any;
  quantityPending: any;
  quantityNG: any;
  productName: any;
  unitName: any;
  listChiTietLotNo: Array<ChiTietLotNo>;
}

class ChiTietLotNo {
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityProduct: any;
  quantityActual: any;
  quantityOK: any;
  quantityPending: any;
  quantityNG: any;
  productName: any;
  description: any;
  unitName: any;
  packagingStatus: any;
  productStatus: any;
  lotNoName: any;
}

class DataMaping {
  productId: string;
  description: string;
  unitId: string;
  lotNoName: string;
  quantityOK: number;
  quantityPending: number;
  quantityNG: number;
}

@Component({
  selector: "app-tao-moi-nhap",
  templateUrl: "./tao-moi-nhap.component.html",
  styleUrls: ["./tao-moi-nhap.component.css"],
})
export class TaoMoiNhapComponent implements OnInit {
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  fixed: boolean = false;
  withFiexd: string = "";

  isInvalidForm: boolean = false;

  // dong 1
  ngayHienTai: any;
  userName: any;
  department: any;

  // dong 2
  loaiPhieu: number = 0;

  // dong 3
  listWarehouse: Array<Warehouse> = [];
  minDate: Date;
  listDataVendor: Array<any> = [];

  // form
  khoForm: FormGroup;
  khoNhanControl: FormControl;

  vatTu: FormGroup;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  vatTuControl: FormControl;

  createForm: FormGroup;
  ngayNhap: FormControl;

  // Danh sach nguyen vat lieu
  colsGroupVatLieu: any;
  listItemGroup: Array<SanPhamPhieuNhapKhoModel> = [];
  colsChiTietVatLieu: any;
  listChiTietLotNo: Array<any> = [];
  listProduct: Array<any> = [];
  productSelected: Array<any> = [];

  noteControl: string;

  listDataDialog: Array<any> = [];

  // #
  showDetailDialog: boolean = false;
  isDisableMultiSelect = false;

  donViTinh: any = "";

  listLotNo: any = [];

  listVatTuCheck: Array<any> = [];
  listVatTu: any;
  listDataLuu: Array<DataMaping> = [];

  selectVatTu: any;

  emitStatusChangeForm: any;

  constructor(
    private warehouseService: WarehouseService,
    private messageService: MessageService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private el: ElementRef
  ) {}

  async ngOnInit() {
    this.setForm();
    this.ngayHienTai = formatDatetime(new Date());
    this.initTable();
    this.getMasterData();
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
        header: "Tên thành phẩm",
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
        header: "Số lượng Pending",
        width: "150px",
        textAlign: "right",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityNG",
        header: "Số lượng NG",
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
        field: "quantityProduct",
        header: "Số lượng sản xuất",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityOK",
        header: "Số lượng OK",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityPending",
        header: "Số lượng pending",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "quantityNG",
        header: "Số lượng NG",
        width: "100px",
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
  }

  setForm() {
    this.ngayNhap = new FormControl(null, [Validators.required]);
    this.createForm = new FormGroup({
      ngayNhap: this.ngayNhap,
    });
    this.ngayNhap.setValue(new Date());

    this.khoNhanControl = new FormControl(null, [Validators.required]);
    this.khoForm = new FormGroup({
      khoNhanControl: this.khoNhanControl,
    });
  }

  async getMasterData() {
    this.loading = true;
    let [masterDataResponse, getKhoResponse]: any = await Promise.all([
      this.warehouseService.getMasterCreatePhieuNhapKhoNVLCCDCAsync(4),
      this.warehouseService.getVendorAsync(),
    ]);

    if (
      masterDataResponse.statusCode == 200 &&
      getKhoResponse.statusCode == 200
    ) {
      this.listDataVendor = getKhoResponse.vendorList;
      this.listWarehouse = masterDataResponse.listWarehouse;
      this.userName = masterDataResponse.nameCreate;
      this.department = masterDataResponse.employeeDepartment;
      this.listProduct = masterDataResponse.listProduct;
      this.listVatTu = masterDataResponse.listProduct;
      this.listVatTuCheck = masterDataResponse.listProduct;
      this.setDefaultValue();
      this.loading = false;
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Lấy dữ liệu không thành công",
      };
      this.showMessage(msg);
    }
  }

  setDefaultValue() {
    this.loaiPhieu = 6;
    this.khoNhanControl.setValue(this.listWarehouse[0]);
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
          quantityProduct: this.listChiTietLotNo.reduce((sum, current) =>
            ParseStringToFloat(sum) + ParseStringToFloat(current.quantityProduct), 0
          ),
          quantityOK: this.listChiTietLotNo.reduce(
            (sum, current) =>
              ParseStringToFloat(sum) + ParseStringToFloat(current.quantityOK),
            0
          ),
          quantityNG: this.listChiTietLotNo.reduce(
            (sum, current) =>
              ParseStringToFloat(sum) + ParseStringToFloat(current.quantityNG),
            0
          ),
          quantityPending: this.listChiTietLotNo.reduce(
            (sum, current) =>
              ParseStringToFloat(sum) +
              ParseStringToFloat(current.quantityPending),
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
            lotNoName: element.lotNoName,
            productName: "",
            quantityNG: element.quantityNG,
            quantityOK: element.quantityOK,
            quantityPending: element.quantityPending,
            quantityActual: element.quantityActual,
            quantityProduct: element.quantityProduct,
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
            // this.listItemGroup
            //   .find((i) => i.productId == x.productId)
            //   .listChiTietLotNo.find(
            //     (k) => k.lotNoName == lo.lotNoName
            //   ).quantityActual = lo.quantityActual;
          }
        });
      }
    });
    this.showDetailDialog = false;
  }

  huyDialog() {
    this.listDataDialog = [];
    // this.vatTu.reset();
    this.donViTinh = "";
    this.getMasterData();
    this.showDetailDialog = false;
  }

  addNewDialog() {
    this.isDisableMultiSelect = false;
    this.productSelected = [];
    this.donViTinh = "";
    this.listChiTietLotNo = new Array<ChiTietLotNo>();

    this.showDetailDialog = true;
  }

  addNewLotNo() {
    if (this.productSelected.length == 0) return;

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
      lotNoName: "",
      productName: "",
      quantityActual: 0,
      quantityProduct: 0,
      quantityOK: 0,
      quantityNG: 0,
      quantityPending: 0,
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

  onChangeProduct() {
    if (this.listChiTietLotNo.length == 0) {
      this.donViTinh = this.productSelected[0].productUnitName;
      this.addNewLotNo();
    }
  }

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
        SLOK: 0,
        SLNG: 0,
        SLP: 0,
        TTBB: 1,
        TTNVL: 1,
        DG: "",
        TT: null,
      };
      this.listLotNo = this.selectVatTu;
      this.listDataDialog.push(noiDUngTT);
      this.ref.detectChanges();
    } else {
      if (this.listDataDialog.length == data + 1) {
        let noiDUngTT = {
          LotNo: "",
          SLN: 0,
          SLOK: 0,
          SLNG: 0,
          SLP: 0,
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

  clickDetailLotNo(rowData: any) {
    this.isDisableMultiSelect = true;
    this.productSelected = [];
    this.productSelected.push(
      this.listProduct.find((y) => y.productId == rowData.productId)
    );
    this.donViTinh = this.productSelected[0].productUnitName;
    // this.listChiTietLotNo = rowData.listChiTietLotNo;

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
        quantityProduct: element.quantityProduct,
        quantityNG: element.quantityNG,
        quantityOK: element.quantityOK,
        quantityPending: element.quantityPending,
        packagingStatus: element.packagingStatus,
        productStatus: element.productStatus,
        description: element.description,
        unitName: element.unitName,
      };

      this.listChiTietLotNo.push(lotno);
    });

    this.showDetailDialog = true;
  }

  updateNVL(data) {
    this.listDataDialog = [];
    this.listVatTu = this.listVatTuCheck;
    this.vatTuControlEdit.disable();
    this.vatTuControlEdit.setValue(
      this.listVatTuCheck.find((y) => y.productId == data.productId)
    );
    this.vatTuControl.setValue(
      this.listVatTuCheck.find((y) => y.productId == data.productId)
    );
    this.listDataLuu.forEach((x) => {
      if (x.productId == data.productId) {
        let noiDUngTT = {
          LotNo: x.lotNoName,
          SLOK: x.quantityOK,
          SLNG: x.quantityNG,
          SLP: x.quantityPending,
          DG: x.description,
          TT: null,
        };
        this.listDataDialog.push(noiDUngTT);
        this.donViTinh = this.vatTuControlEdit.value.productUnitName;
      }
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
    if (
      this.listItemGroup != null &&
      this.listItemGroup != undefined &&
      this.listItemGroup.length > 0
    ) {
      this.listItemGroup.find(
        (i) => i.productId == rowData.productId
      ).listChiTietLotNo = this.listItemGroup
        .find((i) => i.productId == rowData.productId)
        .listChiTietLotNo.filter((x) => x.lotNoName != rowData.lotNoName);
    }
  }

  taoPhieuNhapKho(mode: boolean) {
    if (!this.createForm.valid) {
      Object.keys(this.createForm.controls).forEach((key) => {
        if (this.createForm.controls[key].valid == false) {
          this.createForm.controls[key].markAsTouched();
        }
      });

      this.isInvalidForm = true; //Hiển thị icon-warning-active
    } else if (!this.khoForm.valid) {
      Object.keys(this.khoForm.controls).forEach((key) => {
        if (this.khoForm.controls[key].valid == false) {
          this.createForm.controls[key].markAsTouched();
          return;
        }
      });
    } else {
      let inventoryReceivingVoucherModel = this.mapDataToModelPhieuNhapKho();

      let listChiTietLotNo = [];
      this.listItemGroup.forEach((element) => {
        element.listChiTietLotNo.forEach((lotno) => {
          listChiTietLotNo.push(lotno);
        });
      });

      if (listChiTietLotNo.length == 0) {
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "Chưa có sản phẩm.",
        };
        this.showMessage(msg);
        return;
      }

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

      this.warehouseService
        .createPhieuNhapKhoTP(
          4,
          inventoryReceivingVoucherModel,
          listChiTietLotNo
        )
        .subscribe((response) => {
          let result: any = response;

          if (result.statusCode == 200) {
            this.showMessage(result.messageCode);
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
              this.router.navigate([
                "/warehouse/thanh-pham-nhap/detail",
                {
                  inventoryReceivingVoucherId:
                    result.inventoryReceivingVoucherId,
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
  }

  resetForm() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
      this.isInvalidForm = false; //Ẩn icon-warning-active
    }
  }

  mapDataToModelPhieuNhapKho() {
    let inventoryReceivingVoucherModel = new InventoryReceivingVoucherModel();
    inventoryReceivingVoucherModel.CreatedName = this.userName;
    inventoryReceivingVoucherModel.InventoryReceivingVoucherDate =
      convertToUTCTime(this.ngayNhap.value);
    inventoryReceivingVoucherModel.InventoryReceivingVoucherType =
      this.loaiPhieu;
    inventoryReceivingVoucherModel.InventoryReceivingVoucherTypeName =
      this.loaiPhieu == 6
        ? "Nhập thành phẩm sau đóng gói"
        : "Nhập thành phẩm sau kiểm tra";
    inventoryReceivingVoucherModel.OrderDate = null;
    inventoryReceivingVoucherModel.InvoiceDate = null;
    inventoryReceivingVoucherModel.InvoiceNumber = null;
    inventoryReceivingVoucherModel.PartnersName = null;
    inventoryReceivingVoucherModel.ShiperName = null;
    inventoryReceivingVoucherModel.StatusName = "Mới";
    inventoryReceivingVoucherModel.WarehouseCategoryTypeId =
      this.khoNhanControl.value.warehouseId;
    inventoryReceivingVoucherModel.ProducerName = null;
    inventoryReceivingVoucherModel.OrderNumber = null;
    inventoryReceivingVoucherModel.WarehouseId =
      this.khoNhanControl.value.warehouseId;
    inventoryReceivingVoucherModel.VendorId = null;
    inventoryReceivingVoucherModel.Note = this.noteControl;

    return inventoryReceivingVoucherModel;
  }

  goBack() {
    this.router.navigate(["/warehouse/thanh-pham-nhap/detail"]);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
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
}