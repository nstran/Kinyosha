import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Renderer2,
  ChangeDetectorRef
} from "@angular/core";
import { AddEditSerialComponent } from "../add-edit-serial/add-edit-serial.component";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  AbstractControl,
  FormArray,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  DetailProductModel,
  ProductModel2,
  productMoneyUnitModel,
  productUnitModel,
  vendorModel,
  warehouseModel,
  ProductQuantityInWarehouseModel,
  ProductAttributeCategory,
  ProductAttributeCategoryValueModel,
  Serial,
  InventoryReportModel,
  productLoaiHinhKinhDoanhModel,
  CategoryModel,
  OrganizationModel,
} from "../../models/product.model";
import * as $ from "jquery";

import { ProductService } from "../../services/product.service";
import { TreeProductCategoryComponent } from "../tree-product-category/tree-product-category.component";
import { QuickCreateVendorComponent } from "../quick-create-vendor/quick-create-vendor.component";
import { VendorModel } from "../../../vendor/models/vendor.model";
import {
  ProductModel,
  ProductVendorMappingModel,
  ProductAttributeModel,
} from "../../models/product.model";
import { GetPermission } from "../../../shared/permission/get-permission";
import { ProductCategoryService } from "../../../admin/components/product-category/services/product-category.service";
import { WarehouseService } from "../../../warehouse/services/warehouse.service";

/* primeng api */
import { DialogService } from "primeng/dynamicdialog";
import { MessageService, ConfirmationService } from "primeng/api";
import { VendorDetailDialogComponent } from "../vendor-detail-dialog/vendor-detail-dialog.component";
import { ProductBomDialogComponent } from "../product-bom-dialog/product-bom-dialog.component";
import { ImageUploadService } from "../../../shared/services/imageupload.service";
import { ChonNhieuDvDialogComponent } from "../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component";

/* end primeng api */

class NoteErr {
  public code: string;
  public name: string;
}

class configurationProductEntityModel
{
  configurationProductId: any;
  productId: any;
  configurationName: any;
  startDate: any;
  endDate: any;
  listConfigurationProductMapping:  Array<configurationProductMappingEntityModel>
}
class configurationProductMappingEntityModel
{
  configurationProductMappingId: any;
  configurationProductId: any;
  product: any;
  productId: any;
  productCode:any;
  productName:any;
  productUnitName:any;
  stageGroup: any;
  stageGroupId:any;
  quota: any;
  consumption: any;
  tong: any;
}


class productCategoryModel {
  public productCategoryId: string;
  public productCategoryCode: string;
  public productCategoryName: string;
  public productCategoryLevel: string;
  public parentId: string;
  public hasChildren: boolean;
  public productCategoryNameByLevel: string; //tên theo phân cấp
  public productCategoryListNameByLevel: Array<string>;

  constructor() {
    this.productCategoryListNameByLevel = [];
  }
}

interface ResultDialog {
  status: boolean; //Lưu thì true, Hủy là false
  productVendorMappingModel: ProductVendorMappingModel;
}

interface Data {
  name: string;
  value: string;
}

class InventoryReport {
  public inventoryReportId: string;
  public warehouseId: string;
  public productId: string;
  public warehouseNameByLevel: string;
  public quantityMinimum: string;
  public quantityMaximum: string;
  public startQuantity: string;
  public openingBalance: string;
  public listSerial: Array<serialModel>;
  public note: string;

  public isError: boolean;

  constructor() {
    this.listSerial = [];
  }
}

class serialModel {
  public serialId: string;
  public serialCode: string;
  public productId: string;
  public warehouseId: string;
  public statusId: string;
  public createdDate: Date;

  constructor() {
    this.serialId = "00000000-0000-0000-0000-000000000000";
    this.statusId = "00000000-0000-0000-0000-000000000000";
    this.createdDate = new Date();
  }
}

interface ProductVendorMapping {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  vendorProductName: string;
  miniumQuantity: number;
  price: number;
  unitPriceId: string;
  moneyUnitName: string;
  fromDate: Date;
  toDate: Date;
  createdById: string;
  createdDate: Date;
  orderNumber: number;
  exchangeRate: number;
}

@Component({
  selector: "app-detail-thanhpham",
  templateUrl: "./detail-thanhpham.component.html",
  styleUrls: ["./detail-thanhpham.component.css"],
})
export class DetailThanhphamComponent implements OnInit {
  loading: boolean = false;
  paramProductId: string;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listNoteErr: Array<NoteErr> = [
    {
      code: "required_min_quanty",
      name: "Không được để trống số lượng tồn kho tối thiểu",
    },
    {
      code: "min_quantity_less_max_quantity",
      name: "Số lượng tối thiểu không được lớn hơn số lượng tối đa",
    },
    {
      code: "required_start_quanty",
      name: "Không được để trống số lượng tồn kho đầu kỳ",
    },
  ];

  /* Action*/
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  editing: boolean = false;
  /*END*/
  dataLotNo: any = [];
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );
  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));

  isOpenNotifiError: boolean = false;
  isInvalidForm: boolean = false;
  //master data
  listStageGroup: Array<CategoryModel> = [];
  colsDinhMucVNL: Array<any> = []
  colsChiTietDinhMucVNL: Array<any> = []


  listProperty: Array<any> = [];
  listPriceInventory: Array<productMoneyUnitModel> = [];
  listProductCategory: Array<productCategoryModel> = [];
  listProductMoneyUnit: Array<productMoneyUnitModel> = [];
  listProductUnit: Array<any> = [];
  listProductUnitName: Array<string> = [];
  listOrganization: Array<any> = [];
  listProductEntityModel: Array<any> = [];

  listVendor: Array<vendorModel> = [];
  listWarehouse: Array<warehouseModel> = [];
  listWarehouseLevel0: Array<warehouseModel> = []; //danh sách kho cho tồn kho tối thiểu
  listWarehouseStartQuantity1: Array<warehouseModel> = []; //danh sách kho cho tồn kho đầu kỳ
  listWarehouseStartQuantity: Array<warehouseModel> = []; //danh sách kho cho tồn kho đầu kỳ
  listProductCode: Array<string> = [];
  productCategoryList: Array<productCategoryModel> = [];

  listLoaiHinh: Array<productLoaiHinhKinhDoanhModel> = [];

  activeIndex: number = 0;
  productType: number;

  productCategoty: CategoryModel;
  selectedProductCategory: productCategoryModel;

  listSelectedDonVi: Array<any> = [];

  canDeleteProduct: boolean;

  //table
  rows: number = 10;
  selectedColumns: any;
  colsProductBOM: any;
  colsNhapXuatKho: any;
  colsLotNo: any;
  colVentor: any;
  selectedColsLotNo: any;
  selectedColsProductBOM: any;
  selectedColsNhapXuatKho: any;
  dataNhapXuatKho: any = [];
  //form controls
  chitietdinhmucForm: FormGroup;
  productForm: FormGroup;
  ProductCode: FormControl;
  ProductName: FormControl;
  MinimumInventoryQuantity: FormControl;
  ProductCategoty: FormControl;
  Referenced: FormControl;
  ProductUnit: FormControl;
  Department: FormControl;
  //tab Thông tin chung
  productVendorMapping: ProductVendorMappingModel =
    new ProductVendorMappingModel();
  listProductVendorMapping: Array<ProductVendorMappingModel> = [];
  //tab Thông tin kho
  selectedWarehouseForMinQuanty: warehouseModel;
  selectedWarehouseStartQuantity: warehouseModel;

  listDinhMuc: Array<configurationProductEntityModel> = [];
  listChiTietDinhMuc: Array<configurationProductMappingEntityModel> = [];
  selectedConfigurationProductEntityModel: any;
  // clonedChiTietDinhMuc: { [s: string]: configurationProductMappingEntityModel; } = {};
  clonedData: { [s: string]: any; } = {}

  //upload
  //listImageUploaded: Array<productImageModel> = [];
  // is possition fiexd
  fixed: boolean = false;
  withFiexd: string = "";
  isSerialNumberRequired: boolean;
  data: Array<Data> = [
    { name: "1561", value: "NY" },
    { name: "1672", value: "RM" },
  ];
  @ViewChild("toggleButton") toggleButton: ElementRef;
  @ViewChild("notifi") notifi: ElementRef;
  @ViewChild("save") save: ElementRef;

  /*Thông tin kho*/
  listWarehouseInventory: Array<warehouseModel> = [];
  selectedWarehouseInventory: warehouseModel;
  colsInventory: any;
  listInventory: Array<InventoryReport> = [];
  /*End*/

  constructor(
    private translate: TranslateService,
    private el: ElementRef,
    private getPermission: GetPermission,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    public messageService: MessageService,
    private productCategoryService: ProductCategoryService,
    private warehouseService: WarehouseService,
    private renderer: Renderer2,
    private imageService: ImageUploadService,
    private ref: ChangeDetectorRef,
  ) {
    this.translate.setDefaultLang("vi");
    this.renderer.listen("window", "click", (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (
          !this.toggleButton.nativeElement.contains(e.target) &&
          !this.notifi.nativeElement.contains(e.target) &&
          !this.save.nativeElement.contains(e.target)
        ) {
          this.isOpenNotifiError = false;
        }
      }
    });
  }

  async ngOnInit() {
    this.initForm();
    //Check permission
    let resource = "sal/product/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      this.route.params.subscribe((params) => {
        if (params["ProductType"]) {
          this.activeIndex = params["ProductType"];
        }

        this.paramProductId = params["productId"];
      });
      this.initTable();
      this.getMasterData();
    }
  }

  initForm() {
    this.productForm = new FormGroup({
      ProductCode: new FormControl(null, [Validators.required]),
      ProductCategory: new FormControl(null, [Validators.required]),
      ProductUnit: new FormControl(null, [Validators.required]),
      ProductName: new FormControl(null, [Validators.required]),
      Referenced: new FormControl(null, [Validators.required]),
      Department: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
    });
    this.productForm.get("ProductCategory").setValue(this.listProperty[0]);
    this.productForm.get("Referenced").setValue(this.listProductEntityModel[0]);
    this.productForm.get("ProductUnit").setValue(this.listProductUnit[0]);

    this.chitietdinhmucForm = new FormGroup({
      TenCauHinh: new FormControl(null, Validators.required),
      StartDate: new FormControl(new Date()),
      EndDate: new FormControl(new Date())
    });
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

  initTable() {
    //table LotNo
    this.colsLotNo = [
      {
        field: "STT",
        header: "STT",
        textAlign: "left",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "LotNo",
        header: "Lot.No",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "quantity",
        header: "Số lượng tồn",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
    ];
    this.selectedColsLotNo = this.colsLotNo;
    this.dataLotNo = [{ STT: 1, LotNo: "920302", quantity: 120.9 }];

    //table Thông tin nhập/ xuất kho
    this.colsNhapXuatKho = [
      { field: "STT", header: "STT", textAlign: "left", display: "table-cell" },
      {
        field: "MaPhieu",
        header: "Mã phiếu",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "LoaiPhieu",
        header: "Loại phiếu",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "SoLuong",
        header: "Số lượng",
        textAlign: "right",
        display: "table-cell",
      },
      {
        field: "KhoNX",
        header: "Kho nhập/xuất",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "NgayNX",
        header: "Ngày xuất/nhập",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "NhaCungCap",
        header: "Nhà cung cấp",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "SoHoaDon",
        header: "Số hóa đơn",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "SoDonHang",
        header: "Số đơn hàng",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "TrangThai",
        header: "Trạng thái",
        textAlign: "left",
        display: "table-cell",
      },
    ];
    this.selectedColsNhapXuatKho = this.colsNhapXuatKho;
    this.dataNhapXuatKho = [
      {
        STT: 1,
        MaPhieu: "VL 9878",
        LoaiPhieu: "Phiếu nhập kho",
        SoLuong: 10.0,
        KhoNX: "Kho sản xuất",
        NgayNX: "11/11/2022",
        NhaCungCap: "Công ty A",
        SoHoaDon: "HD123",
        SoDonHang: "PO221",
        TrangThai: "Đã nhập",
      },
    ];
    // table Nhà cung cấp
    this.colsProductBOM = [
      {
        field: "STT",
        header: "STT",
        textAlign: "left",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productCode",
        header: "Mã nhà cung cấp",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "productName",
        header: "Tên nhà cung cấp",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "productUnitName",
        header: "Địa chỉ",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "quantity",
        header: "Số lượng nhập",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
    ];
    this.selectedColsProductBOM = this.colsProductBOM;

    this.colVentor = [
      { field: "Move", header: "#", textAlign: "center", width: "20px" },
      {
        field: "VendorName",
        header: "Tên NCC",
        textAlign: "left",
        width: "100px",
      },
      {
        field: "VendorProductName",
        header: "Sản phẩm phía NCC",
        textAlign: "left",
        width: "100px",
      },
      {
        field: "FromDate",
        header: "Ngày hiệu lực từ",
        textAlign: "right",
        width: "100px",
      },
      {
        field: "ToDate",
        header: "Ngày hiệu lực đến",
        textAlign: "right",
        width: "100px",
      },
      {
        field: "MiniumQuantity",
        header: "Số lượng tối thiểu",
        textAlign: "right",
        width: "100px",
      },
      { field: "Price", header: "Giá", textAlign: "right", width: "100px" },
      {
        field: "MoneyUnitName",
        header: "Tiền tệ",
        textAlign: "left",
        width: "100px",
      },
    ];
    this.colsDinhMucVNL = [
      // { field: 'configurationProductId', header: 'Id', textAlign: 'center', display: 'table-cell', width: "100px" },
      // { field: 'productId', header: 'ProductId', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'configurationName', header: 'Cấu hình định mức', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'startDate', header: 'Ngày bắt đầu', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'endDate', header: 'Ngày kết thúc', textAlign: 'center', display: 'table-cell', width: '100px' }
    ];

    this.colsChiTietDinhMucVNL = [
      { field: 'stageGroupName', header: 'Công đoạn', textAlign: 'center', display: 'table-cell', width: "100px" },
      { field: 'productCode', header: 'Mã', textAlign: 'left', display: 'table-cell', width: '100px' },
      { field: 'productName', header: 'Tên nguyên vật liệu', textAlign: 'center', display: 'table-cell', width: '150px' },
      { field: 'productUnitName', header: 'Đơn vị', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'quota', header: 'Định mức', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'consumption', header: 'Tiêu hao (%)', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'tong', header: 'Tổng', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'thaoTac', header: 'Thao tác', textAlign: 'center', display: 'table-cell', width: '100px' },
    ];
    this.selectedColumns = this.colVentor;
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  async getMasterData() {
    this.loading = true;
    let [masterdataResponse, productByIdResponse]: any = await Promise.all([
      this.productService.getMasterdataCreateProduct(1),
      this.productService.getProductByIDAsync(this.paramProductId),
    ]);
    if (
      masterdataResponse.statusCode == 200 &&
      productByIdResponse.statusCode === 200
    ) {
      this.loading = false;
      this.listProductUnit = masterdataResponse.listProductUnit;
      this.listProductCode = masterdataResponse.listProductCode;
      this.listProductUnitName = masterdataResponse.listProductUnitName;
      this.listProperty = masterdataResponse.listProperty;
      this.listStageGroup = masterdataResponse.listStageGroup;
      this.listOrganization = masterdataResponse.listOrganization;
      this.listProductEntityModel = masterdataResponse.listProductEntityModel;
      
      // product by Id
      let productModel: DetailProductModel = productByIdResponse.product;
      let tempProductVendorMapping: Array<ProductVendorMapping> =
        productByIdResponse.lstProductVendorMapping;

      this.listDinhMuc = productByIdResponse.listConfigurationProduct;

      this.listDinhMuc.forEach(x=>{
        x.listConfigurationProductMapping.forEach(c=>{
          c.product = this.listProductEntityModel.find(f=>f.productId == c.productId)
          c.stageGroup = this.listStageGroup.find(f=>f.categoryId == c.stageGroupId)
          c.tong = c.quota + ((c.quota * c.consumption) / 100);
        })
      })

      if(this.listDinhMuc.length > 0)
        {
          this.chitietdinhmuc(this.listDinhMuc[this.listDinhMuc.length - 1])
        }

      this.canDeleteProduct = productByIdResponse.canDelete;
      // end
      var productCategory = this.listProperty.find(
        (c) => c.categoryId == productModel.productCategoryId
      );
      this.productForm.get("ProductCategory").setValue(productCategory);

      var reference = this.listProductEntityModel.find(
        (c) => c.productId == productModel.referencedId
      );

      this.productForm.get("Referenced").setValue(reference);

      var productUnit = this.listProductUnit.find(
        (c) => c.categoryId == productModel.productUnitId
      );
      this.productForm.get("ProductUnit").setValue(productUnit);

      var departmentName = this.listOrganization.find((c) => c.organizationId == productModel.department).organizationName;
      this.productForm.get("Department").setValue(departmentName);
      
      
      this.productForm.get("ProductCode").setValue(productModel.productCode);
      this.productForm.get("ProductName").setValue(productModel.productName);
      //set duplicate code validation
      //remove code của sản phẩm hiện tại trong danh sách check trùng
      this.listProductCode = this.listProductCode.filter(
        (e) => e !== productModel.productCode
      );
      this.productForm
        .get("ProductCode")
        .setValidators([
          Validators.required,
          checkDuplicateCode(this.listProductCode),
          checkBlankString(),
        ]);
    } else if (masterdataResponse.statusCode !== 200) {
      this.loading = false;
      this.clearToast();
      this.showToast("error", "Thông báo", masterdataResponse.messageCode);
    } else if (productByIdResponse.statusCode !== 200) {
      this.loading = false;
      this.clearToast();
      this.showToast("error", "Thông báo", productByIdResponse.messageCode);
    }
  }

  openOrgPopup() {
    let listSelectedId = this.listSelectedDonVi.map(
      (item) => item.organizationId
    );
    let selectedId = null;
    if (listSelectedId.length > 0) {
      selectedId = listSelectedId[0];
    }
    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 2,
        selectedId: selectedId,
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
          this.listSelectedDonVi = result;
          let listSelectedTenDonVi = this.listSelectedDonVi.map(
            (x) => x.organizationName
          );
          this.Department.setValue(listSelectedTenDonVi);
          // this.Department.setValue()
        } else {
          this.listSelectedDonVi = [];
          this.Department.setValue([]);
        }
      }
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }

  clearToast() {
    this.messageService.clear();
  }

  async updateProduct() {
    if (!this.productForm.valid) {
      Object.keys(this.productForm.controls).forEach((key) => {
        if (!this.productForm.controls[key].valid) {
          this.productForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector(
        ".form-control.ng-invalid"
      );
      if (target) {
        $("html,body").animate({ scrollTop: $(target).offset().top }, "slow");
        target.focus();
      }
      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
    } else {
      let productModel: ProductModel2 = this.mappingProductForm();
      this.loading = true;
      let result: any = await this.productService.updateProductAsync(
        productModel,
        [],
      );
      this.loading = false;
      if (result.statusCode === 200) {
        this.paramProductId = result.productId;

        this.showToast("success", "Thông báo", "Chỉnh sửa thành công");
      } else {
        this.clearToast();
        this.showToast("error", "Thông báo", result.messageCode);
      }
    }
  }

  resetProductForm() {
    this.productForm.reset();
    this.selectedProductCategory = undefined;
    this.productForm.patchValue({
      ProductCode: "",
      ProductName: "",
      ProductUnit: "",
      Department: "",
      ProductCategory: "",
      Referenced: "",
    });
  }

  mappingProductForm(): ProductModel2 {
    let newProduct = new ProductModel2();
    newProduct.ProductId = this.paramProductId;
    newProduct.ProductCategoryId = this.productForm.value.ProductCategory.categoryId != null ? this.productForm.value.ProductCategory.categoryId : "";
    newProduct.ProductName = this.productForm.value.ProductName != null ? this.productForm.value.ProductName.trim() : "";
    newProduct.ProductCode = this.productForm.value.ProductCode != null ? this.productForm.value.ProductCode.trim() : "";
    newProduct.ReferencedId = this.productForm.value.Referenced.productId != null ? this.productForm.value.Referenced.productId : "";
    newProduct.ProductUnitId = this.productForm.value.ProductUnit.categoryId != null ? this.productForm.value.ProductUnit.categoryId : "";
    newProduct.AccountingCode = this.productForm.value.AccountingCode != null ? this.productForm.value.AccountingCode.trim() : "";
    newProduct.Department =
      this.listSelectedDonVi[0].organizationId != null && this.listSelectedDonVi[0].organizationId.length > 0
        ? this.listSelectedDonVi[0]?.organizationId
        : this.emptyGuid;
    newProduct.MinimumInventoryQuantity = 0;

    //default values
    newProduct.CreatedById = this.emptyGuid;
    newProduct.CreatedDate = new Date();
    newProduct.UpdatedById = null;
    newProduct.UpdatedDate = null;
    newProduct.Active = true;
    return newProduct;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView(true);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  cancel() {
    this.router.navigate(["/product/list-thanhpham"]);
  }

  themmoicauhinh(){
    this.chitietdinhmucForm.reset();
    this.chitietdinhmucForm.patchValue({
      TenCauHinh: "",
      StartDate:  new Date(),
      EndDate:  new Date(),
    });

    this.listChiTietDinhMuc = [];
    this.selectedConfigurationProductEntityModel = null;
  }
  chitietdinhmuc(data){
    this.chitietdinhmucForm.patchValue({
      TenCauHinh: data.configurationName,
      StartDate:  new Date(data.startDate),
      EndDate:  new Date(data.endDate),
    });

    this.listChiTietDinhMuc = data.listConfigurationProductMapping;
    this.selectedConfigurationProductEntityModel = data;
  }

  async luuchitietcauhinh(){

    let tendinhmuc =  this.chitietdinhmucForm.get("TenCauHinh").value;
    let ngaybatdau =  this.chitietdinhmucForm.get("StartDate").value;
    let ngayketthuc =  this.chitietdinhmucForm.get("EndDate").value;

    if (tendinhmuc == '' || tendinhmuc == null || convertToUTCTime(ngaybatdau) > convertToUTCTime(ngayketthuc)) {
      return;
    }

    if(this.selectedConfigurationProductEntityModel == null)
    {
      let configurationProductEntityModel: configurationProductEntityModel = {
        configurationProductId: GuidGenerator.newGuid(),
        productId: this.emptyGuid,
        configurationName: tendinhmuc,
        startDate: ngaybatdau,
        endDate: ngayketthuc,
        listConfigurationProductMapping:  []
      }

      configurationProductEntityModel.listConfigurationProductMapping = this.listChiTietDinhMuc;

      this.listDinhMuc.push(configurationProductEntityModel); 

      this.selectedConfigurationProductEntityModel = configurationProductEntityModel;
    }
    else{
      this.listDinhMuc.forEach(x=>{
          if(x.configurationProductId == this.selectedConfigurationProductEntityModel.configurationProductId)
          {
              x.configurationName = tendinhmuc;
              x.startDate = ngaybatdau;
              x.endDate = ngayketthuc;
              x.listConfigurationProductMapping = this.listChiTietDinhMuc;
          }
      });
    }

    this.listDinhMuc.forEach(x=>{
      x.listConfigurationProductMapping.forEach(c=>{
        c.productId = c.product.productId,
        c.stageGroupId = c.stageGroup.categoryId
      })
    })
   
    let result: any = await this.productService.updateConfigurationProductMappingAsync(
      this.paramProductId,
      this.listDinhMuc
    );
    this.loading = false;
    
    if (result.statusCode === 200) {
      this.showToast("success", "Thông báo", "Cập nhật định mức nguyên vật liệu thành công.");
    } else {
      this.isInvalidForm = false;
      this.isOpenNotifiError = false;
      this.clearToast();
      this.showToast("error", "Thông báo", result.messageCode);
    }
  }
 

  themmoichitietcauhinh(){
    let configurationProductMappingEntityModel: configurationProductMappingEntityModel = {
      configurationProductMappingId: GuidGenerator.newGuid(),
      configurationProductId: this.emptyGuid,
      product:null,
      productId: this.emptyGuid,
      productCode: "",
      productName: "",
      stageGroup: null,
      stageGroupId: this.emptyGuid,
      productUnitName: "",
      quota: 0,
      consumption: 0,
      tong:0
    }

    this.listChiTietDinhMuc.push(configurationProductMappingEntityModel); 

    this.onRowEditInitChild(configurationProductMappingEntityModel);
  }
  async xoadinhmuc(){

    this.confirmationService.confirm({
      message: `Bạn có chắc chắn xóa cấu hình định mức này?`,
      accept: async () => {
        this.listDinhMuc = this.listDinhMuc.filter(e => e.configurationProductId != this.selectedConfigurationProductEntityModel.configurationProductId);

        let result: any = await this.productService.deleteConfigurationProductAsync(
          this.selectedConfigurationProductEntityModel.configurationProductId,
        );
        this.loading = false;
       
        if (result.statusCode === 200) {
          this.showToast("success", "Thông báo", result.messageCode);
        } else {
          this.isInvalidForm = false;
          this.isOpenNotifiError = false;
          this.clearToast();
          this.showToast("error", "Thông báo", result.messageCode);
        }

        if(this.listDinhMuc.length > 0)
        {
          this.chitietdinhmuc(this.listDinhMuc[this.listDinhMuc.length - 1])
        }
        else{
         this.themmoicauhinh();
        }
      }
    });

    
  }
  tinhTong(rowData: any){
    rowData.tong = ParseStringToFloat(rowData.quota) + ((ParseStringToFloat(rowData.quota) * ParseStringToFloat(rowData.consumption)) / 100);
  }
  onRowEditInitChild(rowData: any){

    this.editing = !this.editing;

    this.clonedData[rowData.configurationProductMappingId] = { ...rowData };
    this.ref.detectChanges();
  }
  onRowRemoveChild(rowData: any){
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn xóa dòng này?`,
      accept: async () => {
        this.listChiTietDinhMuc = this.listChiTietDinhMuc.filter(e => e != rowData);
      }
    });
  }
  onRowEditSaveChild(rowData: any){
    if ( !rowData.product || rowData.product == '') {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Hãy nhập đầy đủ thông tin!' };
      this.showMessage(msg);
      return;
    }
    if (!rowData.stageGroup || rowData.stageGroup == '') {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Hãy nhập đầy đủ thông tin!' };
      this.showMessage(msg);
      return;
    }
    this.editing = !this.editing;
  }
  onRowEditCancelChild(rowData: any){
    this.editing = !this.editing;

    Object.keys(this.clonedData).forEach(key => {
      if (key == rowData.configurationProductMappingId && rowData.configurationProductMappingId != 0) {
        rowData.configurationProductMappingId = this.clonedData[key].configurationProductMappingId;
        rowData.product = this.clonedData[key].product;
        rowData.stageGroup = this.clonedData[key].stageGroup;
        rowData.quota = this.clonedData[key].quota;
        rowData.consumption = this.clonedData[key].consumption;
        rowData.productId = this.clonedData[key].product.productId;
        this.tinhTong(rowData);
      }
     
    });
  }
}

function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() !== "") {
        let duplicateCode = array.find(
          (e) => e.trim().toLowerCase() === control.value.trim().toLowerCase()
        );
        if (duplicateCode !== undefined) {
          return { duplicateCode: true };
        }
      }
    }
    return null;
  };
}

function convertToUTCTime(time: any) {
  return new Date(
    Date.UTC(
      time.getFullYear(),
      time.getMonth(),
      time.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    )
  );
}

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = str.replace(/,/g, "");
  return parseFloat(str);
}

function checkBlankString(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() === "") {
        return { blankString: true };
      }
    }
    return null;
  };
}

function ValidationMaxValue(max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      let value = control.value.toString().replace(/,/g, "");
      if (value > max) return { maxValue: true };
    }
    return null;
  };
}
class GuidGenerator {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
