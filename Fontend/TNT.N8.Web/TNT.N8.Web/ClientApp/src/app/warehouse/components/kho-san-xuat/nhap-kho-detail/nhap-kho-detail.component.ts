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

class LoaiPhieuNhap {
  name: string;
  type: number;
}
class SanPhamPhieuNhapKhoModel{
  inventoryReceivingVoucherMappingId: any;
  inventoryReceivingVoucherId: any;
  productId: any;
  quantityActual: any;
  productName: any;
  unitName: any;
  listChiTietLotNo: Array<ChiTietLotNo>
}
class ChiTietLotNo{
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
  lotNoId:any;
}

class mapDataDialog {
  lotNoId: any;
  lotNo: any;
  tonKho: number;
  soLuongDeNghi: number;
  soLuongGiao: number;
  ghiChu: string;
  thaoTac: any;
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

@Component({
  selector: "app-nhap-kho-detail",
  templateUrl: "./nhap-kho-detail.component.html",
  styleUrls: ["./nhap-kho-detail.component.css"],
})
export class NhapKhoDetailComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  defaultNumberType = this.getDefaultNumberType();
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




  listItemGroup: Array<SanPhamPhieuNhapKhoModel> = [];
  listChiTietLotNo: Array<ChiTietLotNo> =[];
  colsChiTietVatLieu: any;
  colsGroupVatLieu: any;
  donViTinh: any = "";
  productName: any = "";







  /*Dữ liệu*/
  inventoryVoucherDate: any;
  listCurrentChips: Array<string> = [];
  listVendor: Array<any> = [];
  warehouseReceive: any;
  warehouseDelevery: any;
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
  noteControl: FormControl;
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
  listLotNo: any;
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
  listProduct: Array<any> = [];
  ListLotNoMap: Array<any> = [];
  checkEdit: boolean = false;
  status: number;
  statusName: string;
  maCode: string;
  loaiVL: number;

  listDataVendor: Array<any> = [];
  listDataUse: Array<any> = [];
  tuKhoNVL: any;
  ngayNhapText: any;

  // action phân quyền
  actionWarehouse: boolean = true;

  constructor(
    private getPermission: GetPermission,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
    private _warehouseService: WarehouseService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private encrDecrService: EncrDecrService
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
    this.initTable();
    this.setForm();
    this.ngayHienTai = formatDatetime(new Date());
    let resource = "war/warehouse/kho-san-xuat-nhap/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("warehouse") == -1) {
        this.actionWarehouse = false;
      }
    }
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
        textAlign: "left",
        display: "table-cell",
        color: "#f44336",
      },
      {
        field: "unitName",
        header: "Đơn vị tính",
        width: "80px",
        textAlign: "left",
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
        field: "description",
        header: "Diễn giải",
        width: "100px",
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
      // this.listDataDialog = this.listItem.filter(x => x.productId == data.vatTuId)
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
            LotNo: this.ListLotNoMap.find((i) => i.lotNoId == x.lotNoId), // this.listVatTuCheck.filter(y => y.productId == this.listDataDialog[0].productId).listProductLotNoMapping
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
      console.log("this.listDataDialog::: ", this.listDataDialog);
      console.log("this.ListLotNoMap::: ", this.ListLotNoMap);
    } else {
      this.vatTuControl.reset();
      this.checkEdit = false;
    }

    this.vtNhapKho = true;
  }

  changeLotNo(data, i) { }

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
    this.noteControl = new FormControl(null);
    this.productControl = new FormControl(null);

    this.ngayNhap = new FormControl(null, [Validators.required]);
    this.createForm = new FormGroup({
      ngayNhap: this.ngayNhap,
    });
    //set kho nhận
    // if (this.khoNhanList.length > 0) this.selectKhoNhan = this.khoNhanList[0];
  }

  refreshFilter() {
    this.loading = true;
    this.getMasterData(true);
  }

  showFilter() { }

  async getMasterData(mode: any) {
    this.loading = true;

    let result: any = await this._warehouseService.getDetailNhapKhoSXAsync(
      this.loaiVL,
      this.inventoryReceivingVoucherId
    );
    // let result2: any = await this._warehouseService.getListWareHouseAsync(0, "")
    // let result3: any = await this._warehouseService.getListWareHouseAsync(3, "")
    // this._warehouseService.getVendorAsync()
    if (result.statusCode == 200) {
  
      // this.listVendor = result.listVendor;
      // this.listWarehouse = result.listWarehouse;
      this.listProduct = result.listProduct;
      // this.listVatTuCheck = result.listProduct;
      this.phieuNhapKho = result.phieuNhapKho;

      if(mode){
          result.listItemGroup.forEach((element)=>{
            let itemGroup: SanPhamPhieuNhapKhoModel = {
              inventoryReceivingVoucherMappingId:this.emptyGuid,
              inventoryReceivingVoucherId:this.emptyGuid,
              productId: element.productId,
              quantityActual: element.quantityActual,
              productName: element.productName,
              unitName: element.unitName,
              listChiTietLotNo : []
            };
            this.listItemGroup.push(itemGroup)
          });

          result.listItemDetail.forEach((element)=>{
            let lotno: ChiTietLotNo = {
              inventoryReceivingVoucherMappingId: this.emptyGuid,
              inventoryReceivingVoucherId: this.emptyGuid,
              productId: element.productId,
              lotNoName: element.lotNoName,
              lotNoId: element.lotNoId,
              productName: "",
              quantityActual: element.quantityActual,
              packagingStatus: element.packagingStatus,
              productStatus: element.productStatus,
              description: element.description == "Reuse" ? "NG tái sử dụng" : (element.description == "Cancel" ? "NG hủy" : ""),
              unitName: "",
            };

            let productGroup = this.listItemGroup.find((i)=>i.productId == element.productId);
            productGroup.listChiTietLotNo.push(lotno)
          })
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
  }

  changeStatus() {
    this._warehouseService.changeStatusInventoryReceivingVoucher(this.inventoryReceivingVoucherId).subscribe((response) => {
      var result = <any>response;
      this.messageService.clear();
      this.resetForm();
      this.messageService.add({
        key: "success",
        severity: "success",
        summary: result.messageCode,
        detail: "Nhập kho",
      });
      this.getMasterData(false);
    }, (error) => {
      this.messageService.clear();
      this.messageService.add({
        key: "error",
        severity: "error",
        summary: error.messageCode,
        detail: "Nhập kho thất bại",
      });
    }
    );
  }

  setDefaultValue() {
   
    this.maCode = this.phieuNhapKho.inventoryReceivingVoucherCode;
    this.status = this.phieuNhapKho.intStatus;
    this.statusName = this.phieuNhapKho.statusName;
    this.tuKhoNVL = this.phieuNhapKho.fromInventoryDeliveryVoucherCode;
    this.ngayNhapText = formatDatetime(new Date(this.phieuNhapKho.createdDate));
    this.loaiPhieu = this.phieuNhapKho.inventoryReceivingVoucherTypeName;
    this.warehouseDelevery = this.phieuNhapKho.warehouseDelivery;
    this.warehouseReceive = this.phieuNhapKho.warehouseReceiving;
    this.inventoryVoucherDate = formatDatetime(
      new Date(this.phieuNhapKho.inventoryReceivingVoucherDate)
    );

    //gộp data
    this.gopData();
  }

  onViewDetail(rowData: any) {
    // console.log(data)
    // this.listDataDialog = [];
    // // this.vtNhapKho = true;
    // this.vatTu.reset();
    // this.donViTinh = '';

    // if (this.listItem.length > 0) {
    //   this.listItem.forEach(i => {
    //     this.listVatTu = this.listVatTuCheck.filter(x => x.productName != i.lotNoName)
    //   })
    // }
    // if (data != 0) {
    //   this.listItem.forEach((x) => {
    //     if (x.productId == data.productId) {
    //       this.ListLotNoMap = this.listVatTuCheck.filter(y => y.productId == x.productId)[0].listProductLotNoMapping
    //       let data = {
    //         inventoryReceivingVoucherMappingId: x.inventoryReceivingVoucherMappingId ? x.inventoryReceivingVoucherMappingId : this.emptyGuid,
    //         inventoryReceivingVoucherId: x.inventoryReceivingVoucherId ? x.inventoryReceivingVoucherId : this.emptyGuid,
    //         lotNoId: x.lotNoId ? x.lotNoId : null,
    //         LotNo: this.ListLotNoMap.find(i => i.lotNoId == x.lotNoId).lotNoName,
    //         SLN: x.quantityActual
    //       };
    //       this.listDataDialog.push(data)
    //       this.listVatTu = this.listVatTuCheck
    //       this.vatTuControl.setValue(this.listVatTuCheck.find(z => z.productId == x.productId))
    //       this.donViTinh = this.vatTuControl.value.productUnitName;
    //     }
    //   });
    // } else {
    //   this.vatTuControl.reset()
    // }

   
    let product = this.listProduct.find((y) => y.productId == rowData.productId);
    this.productName = product.productName;
    this.donViTinh = product.productUnitName;
    this.listChiTietLotNo = rowData.listChiTietLotNo;
    this.vtNhapKho = true
  }

  // /*Hiển thị popup list kho con*/
  // thayDoiKho(data: SanPhamPhieuNhapKhoModel) {
  //   this.selectedIndex = data.index;
  //   this.selectedWarehouseChilren = null;

  //   let warehouse: Warehouse = this.khoControl.value;

  //   //Lấy list kho con nếu có
  //   this._warehouseService
  //     .getDanhSachKhoCon(warehouse.warehouseId)
  //     .subscribe((response) => {
  //       let result: any = response;

  //       if (result.statusCode == 200) {
  //         let listWarehouse = result.listWarehouse;
  //         this.listDetailWarehouse = this.list_to_tree(
  //           listWarehouse,
  //           data.warehouseId
  //         );
  //         this.choiceKho = true;
  //       } else {
  //         let msg = {
  //           severity: "error",
  //           summary: "Thông báo:",
  //           detail: result.messageCode,
  //         };
  //         this.showMessage(msg);
  //       }
  //     });
  // }

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

  paginate(event) { }

  /*Xác nhận Chọn kho con*/
  // selectedKhoCon() {
  //   if (this.selectedWarehouseChilren) {
  //     let sanPhamPhieuNhapKho = this.listItemDetail.find(
  //       (x) => x.index == this.selectedIndex
  //     );
  //     sanPhamPhieuNhapKho.warehouseId =
  //       this.selectedWarehouseChilren.data.warehouseId;
  //     sanPhamPhieuNhapKho.warehouseCodeName =
  //       this.selectedWarehouseChilren.label;
  //     this.choiceKho = false;

  //     //Tính số giữ trước của sản phẩm
  //     // this._warehouseService.getSoGTCuaSanPhamTheoKho(sanPhamPhieuNhapKho.productId, this.selectedWarehouseChilren.data.warehouseId, sanPhamPhieuNhapKho.quantityRequest).subscribe(response => {
  //     //   let result: any = response;

  //     //   if (result.statusCode == 200) {
  //     //     sanPhamPhieuNhapKho.warehouseId = this.selectedWarehouseChilren.data.warehouseId;
  //     //     sanPhamPhieuNhapKho.warehouseCodeName = this.selectedWarehouseChilren.label;
  //     //     sanPhamPhieuNhapKho.quantityReservation = result.quantityReservation;
  //     //     sanPhamPhieuNhapKho.error = this.selectedWarehouseChilren.data.hasChild;
  //     //     this.choiceKho = false;
  //     //   }
  //     //   else {
  //     //     let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
  //     //     this.showMessage(msg);
  //     //   }
  //     // });
  //   }
  // }

  /*Hủy chọn kho con*/
  cancelSelectedKhoCon() {
    this.selectedIndex = null;
    this.selectedWarehouseChilren = null;
    this.choiceKho = false;
  }

  /*Thay đổi số lượng cần nhập*/
  // changeQuantityRequest(rowData: SanPhamPhieuNhapKhoModel) {
  //   if (rowData.quantityRequest.toString() == "") {
  //     rowData.quantityRequest = 0;
  //   }
  // }

  /*Thay đổi số lượng thực nhập*/
  changeQuantityActual(rowData: SanPhamPhieuNhapKhoModel) {
    if (rowData.quantityActual == "") {
      rowData.quantityActual = "0";
    }

    this.getTotalQuantityActual();
  }

  /*Thay đổi Giá nhập*/
  // changePriceProduct(rowData: SanPhamPhieuNhapKhoModel) {
  //   if (rowData.priceProduct == "") {
  //     rowData.priceProduct = "0";
  //   }

  //   this.getTotalQuantityActual();
  // }

  /*Thêm sản phẩm*/
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
    this.router.navigate(["/warehouse/kho-san-xuat-nhap/list"]);
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
    } else if (this.listData.length == 0) {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Chưa có sản phẩm",
      };
      this.showMessage(msg);
    } else {
      let inventoryReceivingVoucherModel = this.mapDataToModelPhieuNhapKho();
      console.log("this.listDataLuu", this.listDataLuu);

      this._warehouseService
        .updateNhapKho(inventoryReceivingVoucherModel, this.listDataLuu)
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
            //Lưu
            //Chuyển đến trang chi tiết phiếu nhập kho
            // this.router.navigate([
            //   "/warehouse/inventory-receiving-voucher/detail",
            //   {
            //     inventoryReceivingVoucherId:
            //       result.inventoryReceivingVoucherId,
            //   },
            // ]);
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

  /*Kiểm tra list sản phẩm*/
  // checkListItemDetail(): boolean {
  //   let result = true;

  //   //Nếu có ít nhất 1 sản phẩm lỗi thì trả về false
  //   if (this.listItemDetail.find((x) => x.error == true)) {
  //     result = false;
  //   }

  //   return result;
  // }

  mapDataToModelPhieuNhapKho() {
    let inventoryReceivingVoucherModel: InventoryReceivingVoucherModel = {
      CreatedName: this.userName,
      InventoryReceivingVoucherDate: convertToUTCTime(
        new Date(this.ngayNhap.value)
      ),
      InventoryReceivingVoucherType: this.loaiPhieu,
      InventoryReceivingVoucherTypeName:
        this.loaiPhieu == 0 ? "Nhập mới" : "Nhập khác",
      OrderDate: convertToUTCTime(new Date(this.ngayDatHang)),
      InvoiceDate: convertToUTCTime(new Date(this.ngay)),
      InvoiceNumber: this.soDonHang,
      PartnersName: (this.tenNhaCungCap as any).vendorName,
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
      Note: "",
      ObjectId: this.emptyGuid,
      Storekeeper: this.emptyGuid,
      InventoryReceivingVoucherTime: null,
      LicenseNumber: 0,
      ExpectedDate: null,
      PartnersId: this.emptyGuid,
      InventoryReceivingVoucherCategory: null,
      VendorId: (this.tenNhaCungCap as any).vendorId,

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
  getTotalQuantityActual() { }

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


  tinhTong() {
    this.tongTonKho = 0;
    this.tongSoLuongDeNghi = 0;
    this.listDataDialog.forEach((i) => {
      // this.tongTonKho += ParseStringToFloat(i.tonKho)
      this.tongSoLuongDeNghi += ParseStringToFloat(i.SLN);
    });
  }

  luuDialog() {
    this.listData = [];
    let dataUpdate: Array<any> = [];
    if (this.vatTuControl.value.length > 1) {
      this.vatTuControl.value.forEach((x) => {
        if (this.listDataDialog.length > 0) {
          this.listDataDialog.forEach((y) => {
            let dataMap: DataMaping = {
              inventoryReceivingVoucherMappingId:
                y.inventoryReceivingVoucherMappingId
                  ? y.inventoryReceivingVoucherMappingId
                  : this.emptyGuid,
              inventoryReceivingVoucherId: y.inventoryReceivingVoucherId
                ? y.inventoryReceivingVoucherId
                : this.emptyGuid,
              productCode: y.productCode ? y.productCode : "",
              lotNoId: y.lotNoId ? y.lotNoId : null,
              productId: x.productId,
              description: y.DG,
              unitId: x.productUnitId,
              lotNoName: y.LotNo,
              packagingStatus: ParseStringToFloat(y.TTBB) == 1 ? true : false,
              productStatus: ParseStringToFloat(y.TTNVL) == 1 ? true : false,
              quantityActual: ParseStringToFloat(y.SLN),
              WarehouseId: this.emptyGuid,
            };
            this.listDataLuu = this.listDataLuu.filter(
              (e) =>
                e.lotNoName != dataMap.lotNoName &&
                e.quantityActual != dataMap.quantityActual
            );
            this.listDataLuu.push(dataMap);
          });
        }
      });
    } else {
      if (this.listDataDialog.length > 0) {
        this.listDataDialog.forEach((y) => {
          console.log(this.listDataDialog);
          let dataMap: DataMaping = {
            inventoryReceivingVoucherMappingId:
              y.inventoryReceivingVoucherMappingId
                ? y.inventoryReceivingVoucherMappingId
                : this.emptyGuid,
            inventoryReceivingVoucherId: y.inventoryReceivingVoucherId
              ? y.inventoryReceivingVoucherId
              : this.emptyGuid,
            productCode: y.productCode ? y.productCode : "",
            lotNoId: y.lotNoId
              ? y.lotNoId
              : y.LotNo.lotNoId
                ? y.LotNo.lotNoId
                : null,
            productId: this.vatTuControl.value.productId
              ? this.vatTuControl.value.productId
              : this.vatTuControl.value[0].productId,
            description: y.DG,
            unitId: this.vatTuControl.value.productUnitId
              ? this.vatTuControl.value.productUnitId
              : this.vatTuControl.value[0].productUnitId,
            lotNoName: y.LotNo.lotNoName,
            packagingStatus: ParseStringToFloat(y.TTBB) == 1 ? true : false,
            productStatus: ParseStringToFloat(y.TTNVL) == 1 ? true : false,
            quantityActual: ParseStringToFloat(y.SLN),
            WarehouseId: this.emptyGuid,
          };
          this.listDataLuu = this.listDataLuu.filter(
            (e) =>
              e.lotNoName != dataMap.lotNoName &&
              e.quantityActual != dataMap.quantityActual
          );
          this.listDataLuu.push(dataMap);
        });
      }
    }

    //map data vào bảng
    if (this.listDataLuu.length > 0) {
      this.listDataLuu.forEach((z) => {
        let data = {
          stt: null,
          vatTuId: z.productId,
          lotNoName: this.listVatTuCheck.find((i) => i.productId == z.productId)
            .productName,
          unitName: this.donViTinh,
          quantityActual: z.quantityActual,
        };
        this.listData.push(data);
      });
      this.gopData();
    }
    this.huyDialog();
  }

  // checkVatTu(data, i) {
  //   if (!this.vatTu.valid) {
  //     Object.keys(this.vatTu.controls).forEach((key) => {
  //       if (this.vatTu.controls[key].valid == false) {
  //         this.vatTu.controls[key].markAsTouched();
  //       }
  //     });
  //     this.getMasterData();
  //     return;
  //   }

  //   this.listVatTu = this.listVatTuCheck.filter(
  //     (x) => x.productUnitId == this.vatTuControl.value.productUnitId
  //   );
  //   if (i != 0) {
  //     this.ListLotNoMap = data.value.listProductLotNoMapping;
  //   }
  //   this.donViTinh = this.vatTuControl.value.productUnitName;
  // }

  huyDialog() {
    this.listDataDialog = [];
    this.vatTu.reset();
    this.donViTinh = "";
    // this.getMasterData()
    this.vtNhapKho = false;
  }

  xoaNVL(data) {
    this.listData = this.listData.filter((x) => x.tenVatTu != data.tenVatTu);

    let productId = this.listVatTuCheck.filter(
      (i) => i.productName == data.tenVatTu
    )[0].productId;
    this.listDataLuu = this.listDataLuu.filter((x) => x.productId != productId);
  }

  gopData() {

    let listId = [];
    let listIdUni = [];
    this.listData = [];
    this.listDataLuu.forEach((x) => {
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
      this.listDataLuu.forEach((z) => {
        if (y == z.productId) {
          tongSoLuong += ParseStringToFloat(z.quantityActual);
          donViTinh = this.listVatTuCheck.find(
            (i) => i.productId == y
          ).productUnitName;
        }
      });
      vatTuName = this.listVatTuCheck.find((i) => i.productId == y).productName;
      let data = {
        stt: null,
        vatTuId: y,
        tenVatTu: vatTuName,
        donViTinh: donViTinh,
        soLuong: tongSoLuong,
        thaoTac: null,
      };
      this.listData.push(data);
    });
  }

  nhapKho() {
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
