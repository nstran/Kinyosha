import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { AddEditSerialComponent } from '../add-edit-serial/add-edit-serial.component';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  OrganizationModel
} from '../../models/product.model';
import * as $ from 'jquery';

import { ProductService } from '../../services/product.service';
import { TreeProductCategoryComponent } from '../tree-product-category/tree-product-category.component';
import { QuickCreateVendorComponent } from '../quick-create-vendor/quick-create-vendor.component';
import { VendorModel } from '../../../vendor/models/vendor.model';
import { ProductModel, ProductVendorMappingModel, ProductAttributeModel } from '../../models/product.model';
import { GetPermission } from '../../../shared/permission/get-permission';
import { ProductCategoryService } from '../../../admin/components/product-category/services/product-category.service';
import { WarehouseService } from "../../../warehouse/services/warehouse.service";

/* primeng api */
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VendorDetailDialogComponent } from '../vendor-detail-dialog/vendor-detail-dialog.component';
import { ProductBomDialogComponent } from '../product-bom-dialog/product-bom-dialog.component';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
/* end primeng api */

export class ProductImageModel {
  public ProductImageId: string;
  public ProductId: string;
  public ImageName: string;
  public ImageSize: string;
  public ImageUrl: string;
  public Active: boolean;
  public CreatedById: string;
  public CreatedDate: Date;
  public UpdatedById: string;
  public UpdatedDate: Date;
}

interface ResultDialog {
  status: boolean,  //L??u th?? true, H???y l?? false
  productVendorMappingModel: ProductVendorMappingModel,
}

interface Data {
  name: string;
  value: string;
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

class NoteErr {
  public code: string;
  public name: string;
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
    this.serialId = '00000000-0000-0000-0000-000000000000';
    this.statusId = '00000000-0000-0000-0000-000000000000';
    this.createdDate = new Date();
  }
}

class productCategoryModel {
  public productCategoryId: string;
  public productCategoryCode: string;
  public productCategoryName: string;
  public productCategoryLevel: string;
  public parentId: string;
  public hasChildren: boolean;
  public productCategoryNameByLevel: string; //t??n theo ph??n c???p
  public productCategoryListNameByLevel: Array<string>;

  constructor() {
    this.productCategoryListNameByLevel = [];
  }
}

class productAttributeCategoryModel {
  productAttributeCategoryId: string;
  productAttributeCategoryName: string;
  productAttributeCategoryValue: Array<productAttributeCategoryValueModel>;
  productAttributeCategoryValueDisplay: string;

  constructor() {
    this.productAttributeCategoryValue = [];
  }
}

class productAttributeCategoryValueModel {
  productAttributeCategoryValueId: string;
  productAttributeCategoryValue1: string;
  productAttributeCategoryId: string;
}

class customerOrderModel {
  customerId: string;
  customerName: string;
  orderCode: string;
  orderDate: string;
}

class productImageModel {
  imageName: string;
  imageSize: string;
  imageUrl: string;
  productId: string;
  productImageId: string;
}

class productBillOfMaterialsModel {
  productBillOfMaterialId: string;
  productId: string;
  productMaterialId: string;
  quantity: number;
  effectiveFromDate: Date;
  effectiveToDate: Date;
  active: boolean;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: Date;

  //show in table
  productCode: string;
  productName: string;
  productUnitName: string;
}

class productBillOfMaterialsModelRequest {
  ProductBillOfMaterialId: string;
  ProductId: string;
  ProductMaterialId: string;
  Quantity: number;
  EffectiveFromDate: Date;
  EffectiveToDate: Date;
  Active: boolean;
  CreatedById: string;
  CreatedDate: Date;
  UpdatedById: string;
  UpdatedDate: Date;
}

@Component({
  selector: "app-detail-product",
  templateUrl: "./detail-product.component.html",
  styleUrls: ["./detail-product.component.css"],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class DetailProductComponent implements OnInit {
  loading: boolean = false;
  paramProductId: string;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listNoteErr: Array<NoteErr> = [
    {
      code: "required_min_quanty",
      name: "Kh??ng ???????c ????? tr???ng s??? l?????ng t???n kho t???i thi???u",
    },
    {
      code: "min_quantity_less_max_quantity",
      name: "S??? l?????ng t???i thi???u kh??ng ???????c l???n h??n s??? l?????ng t???i ??a",
    },
    {
      code: "required_start_quanty",
      name: "Kh??ng ???????c ????? tr???ng s??? l?????ng t???n kho ?????u k???",
    },
  ];

  /* Action*/
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
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
  listProperty: Array<any> = [];
  listPriceInventory: Array<productMoneyUnitModel> = [];
  listProductCategory: Array<productCategoryModel> = [];
  listProductMoneyUnit: Array<productMoneyUnitModel> = [];
  listProductUnit: Array<any> = [];
  listProductUnitName: Array<string> = [];
  listOrganization: Array<OrganizationModel> = [];

  listVendor: Array<vendorModel> = [];
  listWarehouse: Array<warehouseModel> = [];
  listWarehouseLevel0: Array<warehouseModel> = []; //danh s??ch kho cho t???n kho t???i thi???u
  listWarehouseStartQuantity1: Array<warehouseModel> = []; //danh s??ch kho cho t???n kho ?????u k???
  listWarehouseStartQuantity: Array<warehouseModel> = []; //danh s??ch kho cho t???n kho ?????u k???
  listProductCode: Array<string> = [];
  productCategoryList: Array<productCategoryModel> = [];
  listCustomerOrder: Array<customerOrderModel> = [];
  listProductImage: Array<productImageModel> = [];

  listLoaiHinh: Array<productLoaiHinhKinhDoanhModel> = [];

  activeIndex: number = 0;
  productType: number;

  productCategoty: CategoryModel;
  selectedProductCategory: productCategoryModel;

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
  productForm: FormGroup;
  ProductCode: FormControl;
  ProductName: FormControl;
  MinimumInventoryQuantity: FormControl;
  ProductCategoty: FormControl;
  ProductUnit: FormControl;
  AccountingCode: FormControl;
  ProductCategory: FormControl;
  //tab Th??ng tin chung
  productVendorMapping: ProductVendorMappingModel =
    new ProductVendorMappingModel();
  listProductVendorMapping: Array<ProductVendorMappingModel> = [];
  //tab Th??ng tin kho
  selectedWarehouseForMinQuanty: warehouseModel;
  selectedWarehouseStartQuantity: warehouseModel;
  //tab thu???c t??nh
  listProductAttribute: Array<productAttributeCategoryModel> = [];
  //tab BOM
  listProductBillOfMaterials: Array<productBillOfMaterialsModel> = [];
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

  /*Th??ng tin kho*/
  listWarehouseInventory: Array<warehouseModel> = [];
  selectedWarehouseInventory: warehouseModel;
  colsInventory: any;
  listInventory: Array<InventoryReport> = [];
  /*End*/

  typePage: number = 0;

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
    private imageService: ImageUploadService
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
        if (params["type"]) {
          this.typePage = params["type"];
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
      ProductName: new FormControl(null, [Validators.required]),
      MinimumInventoryQuantity: new FormControl(null, [Validators.required]),
      ProductCategory: new FormControl(null, [Validators.required]),
      ProductUnit: new FormControl(null, [Validators.required]),
      AccountingCode: new FormControl(null, [Validators.required]),
    });
    this.productForm.get("ProductCategory").setValue(this.listProperty[0]);
    this.productForm.get("ProductUnit").setValue(this.listProductUnit[0]);
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
        header: "S??? l?????ng t???n",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
    ];
    this.selectedColsLotNo = this.colsLotNo;

    //table Th??ng tin nh???p/ xu???t kho
    this.colsNhapXuatKho = [
      { field: "STT", header: "STT", textAlign: "left", display: "table-cell" },
      {
        field: "MaPhieu",
        header: "M?? phi???u",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "LoaiPhieu",
        header: "Lo???i phi???u",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "SoLuong",
        header: "S??? l?????ng",
        textAlign: "right",
        display: "table-cell",
      },
      {
        field: "KhoNX",
        header: "Kho nh???p/xu???t",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "NgayNX",
        header: "Ng??y xu???t/nh???p",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "NhaCungCap",
        header: "Nh?? cung c???p",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "SoHoaDon",
        header: "S??? h??a ????n",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "SoDonHang",
        header: "S??? ????n h??ng",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "TrangThai",
        header: "Tr???ng th??i",
        textAlign: "left",
        display: "table-cell",
      },
    ];
    this.selectedColsNhapXuatKho = this.colsNhapXuatKho;
    this.dataNhapXuatKho = [
      {
        STT: 1,
        MaPhieu: "VL 9878",
        LoaiPhieu: "Phi???u nh???p kho",
        SoLuong: 10.0,
        KhoNX: "Kho s???n xu???t",
        NgayNX: "11/11/2022",
        NhaCungCap: "C??ng ty A",
        SoHoaDon: "HD123",
        SoDonHang: "PO221",
        TrangThai: "???? nh???p",
      },
    ];
    // table Nh?? cung c???p
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
        header: "M?? nh?? cung c???p",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "productName",
        header: "T??n nh?? cung c???p",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "productUnitName",
        header: "?????a ch???",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "quantity",
        header: "S??? l?????ng nh???p",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
    ];
    this.selectedColsProductBOM = this.colsProductBOM;

    this.colVentor = [
      { field: "STT", header: "STT", textAlign: "center", width: "20px" },
      {
        field: "VendorProductCode",
        header: "M?? nh?? cung c???p",
        textAlign: "left",
        width: "100px",
      },
      {
        field: "VendorProductName",
        header: "T??n nh?? cung c???p",
        textAlign: "left",
        width: "100px",
      },
      {
        field: "VendorDescription",
        header: "?????a ch???",
        textAlign: "left",
        width: "100px",
      },
      {
        field: "ThaoTac",
        header: "Thao t??c",
        textAlign: "center",
        width: "80px",
      },
    ];
    this.selectedColumns = this.colVentor;
  }

  deleteItem(dataRow) {
    this.confirmationService.confirm({
      message: "B???n ch???c ch???n mu???n x??a?",
      accept: () => {
        this.listProductVendorMapping = this.listProductVendorMapping.filter(
          (e) => e != dataRow
        );
      },
    });
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  async getMasterData() {
    this.loading = true;

    let [masterdataResponse, productByIdResponse]: any = await Promise.all([
      this.productService.getMasterdataCreateProduct(0),
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

      // product by Id
      let productModel: DetailProductModel = productByIdResponse.product;
      let tempProductVendorMapping: Array<any> =
        productByIdResponse.lstProductVendorMapping;

      tempProductVendorMapping.forEach((item, index) => {
        let temp = new ProductVendorMappingModel();
        // let vendor = this.listVendor.find((c) => c.vendorId == item.vendorId);
        // if (vendor) {
        //   temp.VendorName = vendor.vendorName;
        //   temp.VendorCode = vendor.vendorCode;
        // }
        temp.VendorId = item.vendorId;
        temp.VendorProductCode = item.vendorProductCode;
        temp.VendorProductName = item.vendorProductName;
        temp.Price = item.price;
        temp.MoneyUnitId = item.unitPriceId;
        temp.MiniumQuantity = item.miniumQuantity;
        temp.FromDate = item.fromDate;
        temp.ToDate = item.toDate;
        temp.CreatedById = item.createdById;
        temp.CreatedDate = item.createdDate;
        temp.OrderNumber = item.orderNumber ? item.orderNumber : index + 1;
        temp.ExchangeRate = item.exchangeRate ? item.exchangeRate : 1;

        this.listProductVendorMapping.push(temp);
      });

      // this.setInventoryReportData(productByIdResponse.listInventory);
      this.canDeleteProduct = productByIdResponse.canDelete;
      // end

      var productCategory = this.listProperty.find(
        (c) => c.categoryId == productByIdResponse.product.productCategoryId
      );
      this.productForm.get("ProductCategory").setValue(productCategory);

      var productUnit = this.listProductUnit.find(
        (c) => c.categoryId == productByIdResponse.product.productUnitId
      );

      this.productForm.get("ProductUnit").setValue(productUnit);

      this.productForm
        .get("ProductCode")
        .setValue(productByIdResponse.product.productCode);

      this.productForm
        .get("ProductName")
        .setValue(productByIdResponse.product.productName);

      this.productForm
        .get("MinimumInventoryQuantity")
        .setValue(productByIdResponse.product.minimumInventoryQuantity);

      this.productForm
        .get("AccountingCode")
        .setValue(productByIdResponse.product.accountingCode);

      //set duplicate code validation
      //remove code c???a s???n ph???m hi???n t???i trong danh s??ch check tr??ng
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
      this.showToast("error", "Th??ng b??o", masterdataResponse.messageCode);
    } else if (productByIdResponse.statusCode !== 200) {
      this.loading = false;
      this.clearToast();
      this.showToast("error", "Th??ng b??o", productByIdResponse.messageCode);
    }
  }

  // setInventoryReportData(listInventory: Array<InventoryReport>) {
  //   listInventory.forEach((item) => {
  //     let newRecord = new InventoryReport();
  //     newRecord.inventoryReportId = item.inventoryReportId;
  //     newRecord.warehouseId = item.warehouseId;
  //     newRecord.productId = item.productId;
  //     let warhouseNameByLevel = this.listWarehouseInventory.find(
  //       (e) => e.warehouseId == item.warehouseId
  //     );
  //     newRecord.warehouseNameByLevel = warhouseNameByLevel
  //       ? warhouseNameByLevel.warehouseNameByLevel
  //       : "";
  //     newRecord.quantityMinimum = item.quantityMinimum.toString();
  //     newRecord.quantityMaximum =
  //       item.quantityMaximum == null ? "" : item.quantityMaximum.toString();
  //     newRecord.startQuantity = item.startQuantity.toString();
  //     newRecord.openingBalance = item.openingBalance.toString();
  //     newRecord.note = item.note;
  //     newRecord.listSerial = item.listSerial;

  //     //Th??m v??o list
  //     this.listInventory = [...this.listInventory, newRecord];

  //     //x??a kho trong drop down list n???u kho ???? t???n t???i trong b???ng
  //     this.listWarehouseInventory = this.listWarehouseInventory.filter(
  //       (e) => e.warehouseId !== item.warehouseId
  //     );
  //   });
  // }

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

  async updateProduct(type: boolean) {
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
        this.listProductVendorMapping
      );
      this.loading = false;
      if (result.statusCode === 200) {
        this.paramProductId = result.productId;

        this.showToast("success", "Th??ng b??o", "Ch???nh s???a th??nh c??ng");
      } else {
        this.clearToast();
        this.showToast("error", "Th??ng b??o", result.messageCode);
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
      MinimumInventoryQuantity: "",
      ProductCategory: "",
    });
  }

  mappingProductForm(): ProductModel2 {
    let newProduct = new ProductModel2();
    newProduct.ProductId = this.paramProductId;
    newProduct.ProductCategoryId =
      this.productForm.value.ProductCategory.categoryId != null
        ? this.productForm.value.ProductCategory.categoryId
        : "";
    newProduct.ProductName =
      this.productForm.value.ProductName != null
        ? this.productForm.value.ProductName.trim()
        : "";
    newProduct.ProductCode =
      this.productForm.value.ProductCode != null
        ? this.productForm.value.ProductCode.trim()
        : "";
    newProduct.ProductUnitId =
      this.productForm.value.ProductUnit.categoryId != null
        ? this.productForm.value.ProductUnit.categoryId
        : "";
    newProduct.AccountingCode =
      this.productForm.value.AccountingCode != null
        ? this.productForm.value.AccountingCode.trim()
        : "";
    newProduct.MinimumInventoryQuantity =
      this.productForm.value.MinimumInventoryQuantity;
    //default values
    newProduct.ProductType = this.typePage;
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
    if (this.typePage == 0) { 
      this.router.navigate(["/product/list"]);
    } else if (this.typePage == 2) {
      this.router.navigate(["/product/list-congcu"]);
    }
  }

  addVendorProductDetail() {
    let ref = this.dialogService.open(VendorDetailDialogComponent, {
      data: {
        isCreate: true,
      },
      header: "Th??m chi ti???t s???n ph???m nh?? cung c???p",
      width: "70%",
      baseZIndex: 999,
      contentStyle: {
        "min-height": "250px",
        "max-height": "600px",
        overflow: "auto",
      },
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          this.productVendorMapping = result.productVendorMappingModel;
          this.listProductVendorMapping.push(this.productVendorMapping);
        }
      }
    });
  }

  onCreateNewVendor() {
    let ref = this.dialogService.open(QuickCreateVendorComponent, {
      header: "T???o nhanh nh?? cung c???p",
      width: "40%",
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "100px",
        "max-height": "600px",
      },
    });
    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status === true) {
          let newVendor: vendorModel = result.vendorModel;
          this.listVendor = [newVendor, ...this.listVendor];
          let listOldVendors = this.productForm.get("Vendors").value;
          let listNewVendors = [newVendor, ...listOldVendors];
          this.productForm.get("Vendors").setValue(listNewVendors);
        }
      }
    });
  }

  onRowSelect(dataRow) {
    if (this.actionEdit) {
      var index = this.listProductVendorMapping.indexOf(dataRow);
      var OldArray = this.listProductVendorMapping[index];
      let ref = this.dialogService.open(VendorDetailDialogComponent, {
        data: {
          isCreate: false,
          productVendorMappingModel: OldArray,
        },
        header: "S???a chi ti???t s???n ph???m nh?? cung c???p",
        width: "70%",
        baseZIndex: 1030,
        contentStyle: {
          "min-height": "280px",
          "max-height": "600px",
          overflow: "auto",
        },
      });

      ref.onClose.subscribe((result: ResultDialog) => {
        if (result) {
          if (result.status) {
            this.listProductVendorMapping[index] =
              result.productVendorMappingModel;

            // this.listProductVendorMapping[index].OrderNumber = index + 1;
          }
        }
      });
    }
  }
}

function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() !== "") {
        let duplicateCode = array.find(e => e.trim().toLowerCase() === control.value.trim().toLowerCase());
        if (duplicateCode !== undefined) {
          return { 'duplicateCode': true };
        }
      }
    }
    return null;
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}

function checkBlankString(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() === "") {
        return { 'blankString': true };
      }
    }
    return null;
  }
}

function ValidationMaxValue(max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      let value = control.value.toString().replace(/,/g, '');
      if (value > max) return { 'maxValue': true }
    }
    return null;
  }
}
