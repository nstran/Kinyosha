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
  listChiTietLotNo:  Array<ChiTietLotNo>
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
}




class DataMaping {
  productId: string;
  description: string;
  unitId: string;
  lotNoName: string;
  packagingStatus: boolean;
  productStatus: boolean;
  quantityActual: number
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
  selector: "app-inventory-receiving-voucher-create",
  templateUrl: "./inventory-receiving-voucher-create.component.html",
  styleUrls: ["./inventory-receiving-voucher-create.component.css"],
})
export class InventoryReceivingVoucherCreateComponent implements OnInit {
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

  // listItemDetail: Array<SanPhamPhieuNhapKhoModel> = [];
  selectedIndex: number = null;

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
  // noteControl: FormControl;
  productControl: FormControl;

  dataDNXK: any;

  /*Popup Kho list Kho con*/
  choiceKho: boolean = false;
  listDetailWarehouse: TreeNode[];
  selectedWarehouseChilren: TreeNode;
  /*End*/

  /*Danh sach nguyen vat lieu*/
  colsGroupVatLieu: any;
  colsChiTietVatLieu: any;
  listItemGroup: Array<SanPhamPhieuNhapKhoModel> = [];
  listProduct:any=[];
  listKiemKe: any = [];
  listChiTietLotNo: Array<ChiTietLotNo> =[];
  listLotNo:any=[];

  productGroup: FormGroup;
  donViTinh: any = "";
  productSelected: Array<any> = [];
  isDisableMultiSelect = false;

  showDetailDialog: boolean = false;
  colVTNhapKho: any;

  colThungVo: any;
  listDataThungVo: any;
  minDate: Date;

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
  loaiPhieu: number = 0;
  tenNhaCungCap: any;
  tenNhaSanXuat: string;
  soDonHang: number;
  ngayDatHang: Date;
  daiDienGiaoHang: string;
  soHoaDon: number;
  ngay: Date;
  vatTu: FormGroup;
  vatTuEdit: FormGroup;
  vatTuControlEdit: FormControl;
  vatTuControl: FormControl;
  listVatTuCheck: Array<any> = [];
  noteControl: string

  khoForm: FormGroup;
  khoNhanControl: FormControl;

  ngayNhap: FormControl;
  loaiVL: number;
  checkEdit: boolean = false;

  listDataVendor: Array<any> = [];

  // action
  actionAdd: boolean = true

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
    let resource = "war/warehouse/inventory-receiving-voucher/create";
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

    this.vatTuControl = new FormControl(null, [Validators.required]);
    this.vatTu = new FormGroup({
      vatTuControl: this.vatTuControl,
    });

    this.vatTuControlEdit = new FormControl(null, [Validators.required]);
    this.vatTuEdit = new FormGroup({
      vatTuControlEdit: this.vatTuControlEdit,
    });
  }


  clickDetailLotNo(rowData: any){

    
    this.isDisableMultiSelect = true;
    this.productSelected = [];
    this.productSelected.push(this.listProduct.find((y) => y.productId == rowData.productId));
    this.donViTinh = this.productSelected[0].productUnitName;
    // this.listChiTietLotNo = rowData.listChiTietLotNo;

    this.listChiTietLotNo = [];
    rowData.listChiTietLotNo.forEach((element) =>{
      let lotno : ChiTietLotNo = {
        inventoryReceivingVoucherMappingId: element.inventoryReceivingVoucherMappingId,
        inventoryReceivingVoucherId: element.inventoryReceivingVoucherId,
        productId: element.productId,
        lotNoName: element.lotNoName,
        productName:element.productName,
        quantityActual: element.quantityActual,
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
    this.checkEdit = true;
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
          SLN: x.quantityActual,
          TTBB: x.packagingStatus == true ? 1 : 2,
          TTNVL: x.productStatus == true ? 1 : 2,
          DG: x.description,
          TT: null,
        };
        this.listDataDialog.push(noiDUngTT);
        this.donViTinh = this.vatTuControlEdit.value.productUnitName;
      }
    });

    this.showDetailDialog = true;
  }

  saveDialog(){

    let checkLotNo = this.listChiTietLotNo.filter((x) => x.lotNoName == null || x.lotNoName == "");
    if(checkLotNo.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng nhập LotNo.",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listChiTietLotNo.filter((x) => x.quantityActual <= 0);
    if(checkSoLuong.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng nhập kho phải lớn hơn 0.",};
      this.showMessage(msg);
      return;
    }
    const duplicateLotNo = this.listChiTietLotNo.some(lotno => {
      let counter  = 0;
      for (const iterator of this.listChiTietLotNo) {
        if (iterator.lotNoName === lotno.lotNoName) {
          counter += 1;
        }
      }
      return counter > 1;
    });

    if(duplicateLotNo){
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "LotNo là trùng lặp.",
      };
      this.showMessage(msg);
      return;
    }

    this.productSelected.forEach((x) =>{

      let existsProduct = this.listItemGroup.find((i)=>i.productId == x.productId)
      if(existsProduct == null){

      let itemGroup: SanPhamPhieuNhapKhoModel = {
        inventoryReceivingVoucherMappingId:this.emptyGuid,
        inventoryReceivingVoucherId:this.emptyGuid,
        productId: x.productId,
        quantityActual: this.listChiTietLotNo.reduce((sum, current) => ParseStringToFloat(sum) + ParseStringToFloat(current.quantityActual), 0),
        productName: this.listProduct.find((k) => k.productId == x.productId).productName,
        unitName: this.listProduct.find((k) => k.productId == x.productId).productUnitName,
        listChiTietLotNo : []
      };

      this.listChiTietLotNo.forEach(element => {
        let lotno : ChiTietLotNo = {
          inventoryReceivingVoucherMappingId: this.emptyGuid,
          inventoryReceivingVoucherId: this.emptyGuid,
          productId: x.productId,
          lotNoName: element.lotNoName,
          productName: "",
          quantityActual: element.quantityActual,
          packagingStatus: element.packagingStatus,
          productStatus: element.productStatus,
          description: element.description,
          unitName: "",
        };
        itemGroup.listChiTietLotNo.push(lotno)
      });
        this.listItemGroup.push(itemGroup)
      }
      else{
        this.listChiTietLotNo.forEach((lo) =>{
          lo.productId = x.productId;
          let existLotno = this.listItemGroup.find((i)=>i.productId == lo.productId).listChiTietLotNo.find((k) => k.lotNoName == lo.lotNoName);
          if(existLotno == null)
            {
             
              /*thêm mới lotno vào sản phẩm đã tồn tại*/
              this.listItemGroup.find((i)=>i.productId == x.productId).listChiTietLotNo.push(lo);
            }
            else
            {
              /*cập nhật số lượng lotno nếu tồn tại*/
              this.listItemGroup.find((i)=>i.productId == x.productId).listChiTietLotNo.find((k) => k.lotNoName == lo.lotNoName).quantityActual = lo.quantityActual;
            }
        })
      }
    })

    /*Tinh lại số lượng nhập*/
    this.listItemGroup.forEach((x)=>{
      x.quantityActual = x.listChiTietLotNo.reduce((sum, current) => ParseStringToFloat(sum) + ParseStringToFloat(current.quantityActual), 0);
    })

    this.showDetailDialog = false;
  }

  updateDialog() {

    if (this.vatTuControlEdit.value) {
      this.listDataLuu.forEach((x, i) => {
        if (x.productId == this.vatTuControlEdit.value.productId) {
          if (this.listDataDialog.length > 0) {
            this.listDataLuu = this.listDataLuu.filter(
              (k) => k.productId != this.vatTuControlEdit.value.productId
            );
            this.listDataDialog.forEach((y) => {
              let data = {
                productId: x.productId,
                description: y.DG,
                unitId: this.vatTuControlEdit.value.productUnitId,
                lotNoName: y.LotNo,
                packagingStatus: ParseStringToFloat(y.TTBB) == 1 ? true : false,
                productStatus: ParseStringToFloat(y.TTNVL) == 1 ? true : false,
                quantityActual: y.SLN,
              };
              this.listDataLuu.push(data);
            });
          } else {
          }
        }
      });
    }
    this.gopData();
    this.showDetailDialog = false;
  }

  addNewDialog() {
    this.isDisableMultiSelect = false;
    this.productSelected = [];
    this.donViTinh = "";
    this.listChiTietLotNo = new Array<ChiTietLotNo>();
    this.showDetailDialog = true;
  }

  saveNVL(data) {
    this.checkEdit = false;
    if (this.listData.length > 0) {
      this.listData.forEach((i) => {
        this.listVatTu = this.listVatTuCheck.filter(
          (x) => x.productName != i.tenVatTu
        );
      });
    }

    this.showDetailDialog = true;
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
    // this.noteControl = new FormControl(null);
    this.productControl = new FormControl(null);

    this.ngayNhap = new FormControl(null, [Validators.required]);
    this.createForm = new FormGroup({
      ngayNhap: this.ngayNhap,
    });
    this.ngayNhap.setValue(new Date());

    this.khoNhanControl = new FormControl(null, [Validators.required]);
    this.khoForm = new FormGroup({
      khoNhanControl: this.khoNhanControl,
    });


    this.productGroup = new FormGroup({
      productControl : new FormControl(null, [Validators.required])
    });
  }

  refreshFilter() {}

  showFilter() {}

  async getMasterData() {
    this.loading = true;

    let [result, result1]: any = await Promise.all([
      this._warehouseService.getMasterCreatePhieuNhapKhoNVLCCDCAsync(
        this.loaiVL
      ),
      this._warehouseService.getVendorAsync(),
    ]);
    if (result.statusCode == 200 && result1.statusCode == 200) {


      this.listProduct = result.listProduct;
      this.listKiemKe = result.listDotKiemKe;

      this.listWarehouse = result.listWarehouse;
      this.listVatTu = result.listProduct;
      this.listVatTuCheck = result.listProduct;
      this.userName = result.nameCreate;
      this.department = result.employeeDepartment;
      this.listDataVendor = result1.vendorList;
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
    //Loại phiếu nhập
    this.loaiPhieu = 0;
    // this.ngayNhap.setValue(new Date())
    this.khoNhanControl.setValue(this.listWarehouse[0]);
    //Ngày dự kiến nhập
    this.expectedDateControl.setValue(new Date());
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
      this.listItemGroup.forEach((element)=>{
        element.listChiTietLotNo.forEach((lotno)=>{
          listChiTietLotNo.push(lotno)
        })
      })

      if(listChiTietLotNo.length == 0){
        let msg = {severity: "warn",summary: "Thông báo:", detail: "Chưa có sản phẩm.",};
        this.showMessage(msg);
        return;
      }

      let checkLotNo = listChiTietLotNo.filter((x) => x.lotNoName == null || x.lotNoName == "");
      if(checkLotNo.length > 0)
      {
        let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng nhập LotNo.",};
        this.showMessage(msg);
        return;
      }
      let checkSoLuong = listChiTietLotNo.filter((x) => x.quantityActual <= 0);
      if(checkSoLuong.length > 0)
      {
        let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng nhập kho phải lớn hơn 0.",};
        this.showMessage(msg);
        return;
      }
      const duplicateLotNo = listChiTietLotNo.some(lotno => {
        let counter  = 0;
        for (const iterator of listChiTietLotNo) {
          if (iterator.lotNoName === lotno.lotNoName && iterator.productId == lotno.productId) {
            counter += 1;
          }
        }
        return counter > 1;
      });

      if(duplicateLotNo){
        let msg = {
          severity: "warn",
          summary: "Thông báo:",
          detail: "LotNo là trùng lặp.",
        };
        this.showMessage(msg);
        return;
      }

      this._warehouseService
        .createPhieuNhapKho(
          this.loaiVL,
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
              //Chuyển đến trang chi tiết phiếu nhập kho
              this.router.navigate([
                "/warehouse/inventory-receiving-voucher/detail",
                {
                  inventoryReceivingVoucherId:
                    result.inventoryReceivingVoucherId,
                  loaiVL: this.loaiVL,
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

  mapDataToModelPhieuNhapKho() {
    let inventoryReceivingVoucherModel = new InventoryReceivingVoucherModel();

    inventoryReceivingVoucherModel.CreatedName = this.userName;
    inventoryReceivingVoucherModel.InventoryReceivingVoucherDate =
      convertToUTCTime(this.ngayNhap.value);
    inventoryReceivingVoucherModel.InventoryReceivingVoucherType =
      this.loaiPhieu;
    inventoryReceivingVoucherModel.InventoryReceivingVoucherTypeName =
      this.loaiPhieu == 0 ? "Nhập mới" : "Nhập khác";
    inventoryReceivingVoucherModel.OrderDate = this.ngayDatHang
      ? this.ngayDatHang
      : null;
    inventoryReceivingVoucherModel.InvoiceDate = this.ngay ? this.ngay : null;
    inventoryReceivingVoucherModel.InvoiceNumber = this.soDonHang;
    inventoryReceivingVoucherModel.PartnersName = this.tenNhaCungCap
      ? (this.tenNhaCungCap as any).vendorName
      : null;
    inventoryReceivingVoucherModel.ShiperName = this.daiDienGiaoHang;
    inventoryReceivingVoucherModel.StatusName = "Mới";
    inventoryReceivingVoucherModel.WarehouseCategoryTypeId =
      this.khoNhanControl.value.warehouseId;
    inventoryReceivingVoucherModel.ProducerName = this.tenNhaSanXuat;
    inventoryReceivingVoucherModel.OrderNumber = this.soHoaDon;
    inventoryReceivingVoucherModel.WarehouseId =
      this.khoNhanControl.value.warehouseId;
    inventoryReceivingVoucherModel.VendorId = this.tenNhaCungCap
      ? (this.tenNhaCungCap as any).vendorId
      : this.emptyGuid;
    inventoryReceivingVoucherModel.Note = this.noteControl;

    // thêm thùng vỏ data fake
    inventoryReceivingVoucherModel.BoxGreen = 1;
    inventoryReceivingVoucherModel.BoxGreenMax = 2;
    inventoryReceivingVoucherModel.PalletMax = 3;
    inventoryReceivingVoucherModel.PalletNormal = 4;
    inventoryReceivingVoucherModel.BoxBlue = 5;
    inventoryReceivingVoucherModel.PalletSmall = 6;

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

  addNewLotNo(){
    if(this.productSelected.length == 0)
      return;

    let checkLotNo = this.listChiTietLotNo.filter((x) => x.lotNoName == null || x.lotNoName == "");
    if(checkLotNo.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Vui lòng nhập LotNo.",};
      this.showMessage(msg);
      return;
    }
    let checkSoLuong = this.listChiTietLotNo.filter((x) => x.quantityActual <= 0);
    if(checkSoLuong.length > 0)
    {
      let msg = {severity: "warn",summary: "Thông báo:", detail: "Số lượng nhập kho phải lớn hơn 0.",};
      this.showMessage(msg);
      return;
    }

    const duplicateLotNo = this.listChiTietLotNo.some(lotno => {
      let counter  = 0;
      for (const iterator of this.listChiTietLotNo) {
        if (iterator.lotNoName === lotno.lotNoName) {
          counter += 1;
        }
      }
      return counter > 1;
    });

    if(duplicateLotNo){
      let msg = {
        severity: "warn",
        summary: "Thông báo:",
        detail: "LotNo là trùng lặp.",
      };
      this.showMessage(msg);
      return;
    }

    let lotno : ChiTietLotNo = {
      inventoryReceivingVoucherMappingId: this.emptyGuid,
      inventoryReceivingVoucherId: this.emptyGuid,
      productId: this.emptyGuid,
      lotNoName: "",
      productName:"",
      quantityActual: 0,
      packagingStatus: 1,
      productStatus: 1,
      description: "",
      unitName:"",
    };

    this.listChiTietLotNo.push(lotno);
    this.ref.detectChanges();

    let target;
    target = this.el.nativeElement.querySelector('.item-lot-no-' + (this.listChiTietLotNo.length - 1));
    if (target) {
      target.focus();
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

  deleteLotNo(rowData : any)
  {
    this.listChiTietLotNo = this.listChiTietLotNo.filter((x) => x.lotNoName != rowData.lotNoName);
    if (this.listItemGroup != null && this.listItemGroup != undefined && this.listItemGroup.length > 0) {
      this.listItemGroup.find((i) => i.productId == rowData.productId).listChiTietLotNo = this.listItemGroup.find((i) => i.productId == rowData.productId).listChiTietLotNo.filter((x) => x.lotNoName != rowData.lotNoName);
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

  luuDialog() {
    this.listData = [];

    if (this.vatTuControl.value.length > 0 && this.listDataDialog.length > 0) {
      this.vatTuControl.value.forEach((x) => {
        this.listDataDialog.forEach((y) => {
          let data: DataMaping = {
            productId: x.productId,
            description: y.DG,
            unitId: x.productUnitId,
            lotNoName: y.LotNo,
            packagingStatus: ParseStringToFloat(y.TTBB) == 1 ? true : false,
            productStatus: ParseStringToFloat(y.TTNVL) == 1 ? true : false,
            quantityActual: y.SLN,
          };
          this.listDataLuu.push(data);
        });
      });
      //map data vào bảng
      if (this.listDataLuu.length > 0) {
        this.gopData();
      }
    }
    this.huyDialog();
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
      let productId = "";
      this.listDataLuu.forEach((z) => {
        if (y == z.productId) {
          tongSoLuong += ParseStringToFloat(z.quantityActual);
          donViTinh = this.listVatTuCheck.find(
            (i) => i.productId == y
          ).productUnitName;
          productId = z.productId;
        }
      });
      vatTuName = this.listVatTuCheck.find((i) => i.productId == y).productName;
      let data = {
        stt: null,
        vatTuId: y,
        productId: productId,
        tenVatTu: vatTuName,
        donViTinh: donViTinh,
        soLuong: tongSoLuong,
        thaoTac: null,
      };
      this.listData.push(data);
    });
  }

  onChangeProductControl(){
    //
    // if (!this.productGroup.valid) {
    //   Object.keys(this.productGroup.controls).forEach((key) => {
    //     if (this.productGroup.controls[key].valid == false) {
    //       this.productGroup.controls[key].markAsTouched();
    //     }
    //   });

    //   this.donViTinh = "";
    //   return;
    // }

    // this.listProduct = this.listVatTu.filter(
    //   (x) => x.productUnitId == this.productControl.value[0].productUnitId
    // );
    // let productSelected = this.productSelected;//this.productGroup.get("productControl").value;
    this.donViTinh = this.productSelected[0].productUnitName;
  }

  checkVatTu() {
    if (!this.vatTu.valid) {
      Object.keys(this.vatTu.controls).forEach((key) => {
        if (this.vatTu.controls[key].valid == false) {
          this.vatTu.controls[key].markAsTouched();
        }
      });
      this.getMasterData();
      return;
    }
    this.listVatTu = this.listVatTu.filter(
      (x) => x.productUnitId == this.vatTuControl.value[0].productUnitId
    );
    // this.vatTuControl.setValue()
    this.donViTinh = this.vatTuControl.value[0].productUnitName;
  }

  huyDialog() {
    this.listDataDialog = [];
    this.vatTu.reset();
    this.donViTinh = "";
    this.getMasterData();
    this.showDetailDialog = false;
  }

  xoaNVL(data) {
    this.listData = this.listData.filter((x) => x.tenVatTu != data.tenVatTu);

    let productId = this.listVatTuCheck.filter(
      (i) => i.productName == data.tenVatTu
    )[0].productId;
    this.listDataLuu = this.listDataLuu.filter((x) => x.productId != productId);
  }

  deleteItemGroup(rowData: any){
   
      this.listItemGroup = this.listItemGroup.filter((x) => x.productId != rowData.productId);
  }

  onChangeProduct() {
    if (this.listChiTietLotNo.length == 0) {
      this.addNewLotNo();
    }
  }

  onChangeWarehouse() {
    var checkKiemKe = this.listKiemKe.find(c => c.warehouseId == this.khoNhanControl.value?.warehouseId);
    if (checkKiemKe != null && checkKiemKe != undefined) {
      var thangKiemKe = new Date(checkKiemKe.thangKiemKe)
      this.minDate = (new Date(thangKiemKe.setMonth(thangKiemKe.getMonth() + 1)));
    }
    else {
      this.minDate = null;
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

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
}

function formatDatetime(time: Date) {
  let date = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  return `${date}/${month}/${year}`;
}
