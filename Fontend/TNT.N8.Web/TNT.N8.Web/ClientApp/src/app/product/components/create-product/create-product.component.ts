import * as $ from 'jquery';
import { Component, OnInit, ViewChild, ElementRef, HostListener, ViewRef, OnDestroy, Renderer2 } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { TreeProductCategoryComponent } from '../tree-product-category/tree-product-category.component';
import { AddEditSerialComponent } from '../add-edit-serial/add-edit-serial.component';
import { QuickCreateVendorComponent } from '../quick-create-vendor/quick-create-vendor.component';

import {
  ProductModel2,
  productMoneyUnitModel,
  productUnitModel,
  vendorModel,
  warehouseModel,
  ProductQuantityInWarehouseModel,
  ProductAttributeCategory,
  ProductAttributeCategoryValueModel,
  Serial,
  ProductImageModel, ProductVendorMappingModel, productLoaiHinhKinhDoanhModel, CategoryModel, OrganizationModel
} from '../../models/product.model';

import { ProductService } from '../../services/product.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { TranslateService } from '@ngx-translate/core';

import { ImageUploadService } from '../../../shared/services/imageupload.service';

/* primeng api */
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VendorDetailDialogComponent } from '../vendor-detail-dialog/vendor-detail-dialog.component';
import { ProductBomDialogComponent } from '../product-bom-dialog/product-bom-dialog.component';

/* end primeng api */

interface Data {
  name: string;
  value: string;
}

interface ResultDialog {
  status: boolean; //Lưu thì true, Hủy là false
  productVendorMappingModel: ProductVendorMappingModel;
  message: string;
}

class image {
  source: string;
  imageSize: string;
  imageName: string;
  imageType: string;
  imageUrl: string;
  alt: string;
  title: string;
}

class NoteErr {
  public code: string;
  public name: string;
}

class InventoryReport {
  public warehouseId: string;
  public warehouseNameByLevel: string;
  public quantityMinimum: string;
  public quantityMaximum: string;
  public startQuantity: string;
  public openingBalance: string;
  public listSerial: Array<serialModel>;
  public note: string;

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
}

class productCategoryModel {
  public productCategoryId: string;
  public productCategoryCode: string;
  public productCategoryName: string;
  public productCategoryLevel: string;
  public hasChildren: boolean;
  public productCategoryNameByLevel: string; //tên theo phân cấp
  public productCategoryListNameByLevel: Array<string>;

  constructor() {
    this.productCategoryListNameByLevel = [];
  }
}

class productAttributeModel {
  productAttributeName: string;
  productAttributeValue: Array<string>;

  constructor() {
    this.productAttributeValue = [];
  }
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

interface ProductVendorMapping {
  productVendorMappingId: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  productCode: string;
  productId: string;
  productName: string;
  productUnitName: string;
  vendorProductName: string;
  miniumQuantity: number;
  price: number;
  moneyUnitId: string;
  moneyUnitName: string;
  fromDate: Date;
  toDate: Date;
  createdById: string;
  createdDate: Date;
  listSuggestedSupplierQuoteId: Array<string>;
}

@Component({
  selector: "app-create-product",
  templateUrl: "./create-product.component.html",
  styleUrls: ["./create-product.component.css"],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class CreateProductComponent implements OnInit {
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));

  /* Action*/
  actionAdd: boolean = true;
  /*END*/

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );

  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  defaultNumberType = this.systemParameterList.find(
    (systemParameter) => systemParameter.systemKey == "DefaultNumberType"
  ).systemValueString;

  productType: number;

  //master data
  listProperty: Array<productMoneyUnitModel> = [];
  listProductUnit: Array<productUnitModel> = [];
  listProductCode: Array<string> = [];
  listProductUnitName: Array<string> = [];
  listStageGroup: Array<CategoryModel> = [];
  listOrganization: Array<OrganizationModel> = [];

  listVendorProductPrice: Array<ProductVendorMapping> = [];
  productVendorMapping = new ProductVendorMappingModel();

  listProductVendorMapping: Array<ProductVendorMappingModel> = [];

  // form controls

  //table
  rows: number = 10;
  colsLotNo: any;
  selectedColsLotNo: any;
  dataLotNo: any = [];
  selectedColumns: any;
  colVentor: any;

  colsNhapXuatKho: any;
  selectedColsNhapXuatKho: any;
  dataNhapXuatKho: any = [];

  colsProductBOM: any;
  selectedColsProductBOM: any;

  //form controls
  productForm: FormGroup;
  ProductCategory: FormControl;
  ProductCode: FormControl;
  ProductName: FormControl;
  ProductUnit: FormControl;
  MinimumInventoryQuantity: FormControl;

  //tab Thông tin chung
  selectedProductCategory: productCategoryModel;

  activeIndex: number = 0;

  //tab thuộc tính
  listProductAttribute: Array<productAttributeModel> = [];

  //tab BOM
  listProductBillOfMaterials: Array<productBillOfMaterialsModel> = [];

  // is possition fiexd
  fixed: boolean = false;
  withFiexd: string = "";
  actionEdit: boolean = true;
  followInventory: boolean = true;
  serialNumer: boolean = false;
  minYear: number = 2000;
  currentYear: number = new Date().getFullYear();
  maxEndDate: Date = new Date();
  isSerialNumberRequired: boolean;
  isOpenNotifiError: boolean = false;
  isInvalidForm: boolean = false;

  productName: string = "";
  vendorName: string = "";
  typePage: number = 0;

  @ViewChild("toggleButton") toggleButton: ElementRef;
  @ViewChild("notifi") notifi: ElementRef;
  @ViewChild("saveAndCreate", { static: true }) saveAndCreate: ElementRef;
  @ViewChild("save", { static: true }) save: ElementRef;

  constructor(
    public messageService: MessageService,
    private translate: TranslateService,
    private el: ElementRef,
    private getPermission: GetPermission,
    private dialogService: DialogService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2
  ) {
    translate.setDefaultLang("vi");
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
          !this.save.nativeElement.contains(e.target) &&
          !this.saveAndCreate.nativeElement.contains(e.target)
        ) {
          this.isOpenNotifiError = false;
        }
      }
    });
  }

  async ngOnInit() {
    this.initForm();
    //Check permission
    let resource = "sal/product/create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
    }

    this.route.params.subscribe((params) => {
      if (params["type"]) {
        this.typePage = params["type"];
      }
    });

    this.initTable();
    this.getMasterData();
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

  initTable() {
    //Bảng tồn kho
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

    this.colsProductBOM = [
      {
        field: "productCode",
        header: "Mã nguyên vật liệu",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "productName",
        header: "Tên nguyên vật liệu",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "productUnitName",
        header: "Đơn vị tính",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "quantity",
        header: "Số lượng",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "effectiveFromDate",
        header: "Hiệu lực từ",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "effectiveToDate",
        header: "Hiệu lực đến",
        textAlign: "right",
        display: "table-cell",
        width: "100px",
      },
    ];
    this.selectedColsProductBOM = this.colsProductBOM;

    // table Nhà cung cấp
    this.colVentor = [
      {
        field: "STT",
        header: "STT",
        textAlign: "center",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "VendorProductCode",
        header: "Mã nhà cung cấp",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "VendorProductName",
        header: "Tên nhà cung cấp",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "VendorDescription",
        header: "Địa chỉ",
        textAlign: "left",
        display: "table-cell",
        width: "100px",
      },
      {
        field: "ThaoTac",
        header: "Thao tác",
        textAlign: "center",
        display: "table-cell",
        width: "100px",
      },
    ];
    this.selectedColumns = this.colVentor;
  }

  initForm() {
    this.productForm = new FormGroup({
      ProductCategory: new FormControl(null, Validators.required),
      ProductCode: new FormControl("", [
        Validators.required,
        checkBlankString(),
      ]),
      AccountingCode: new FormControl("", [
        Validators.required,
        checkBlankString(),
      ]),
      ProductName: new FormControl(null, Validators.required),
      ProductUnit: new FormControl(null, Validators.required),
      MinimumInventoryQuantity: new FormControl(null, Validators.required),
    });
  }

  resetProductForm() {
    this.productForm.reset();
    this.selectedProductCategory = undefined;
    this.productForm.patchValue({
      ProductCategory: "",
      ProductCode: "",
      AccountingCode: "",
      ProductUnit: null,
      ProductName: " ",
      MinimumInventoryQuantity: ""
    });
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.productService.getMasterdataCreateProduct(0);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listProductCode = result.listProductCode;
      this.listProductUnit = result.listProductUnit;
      this.listProductUnitName = result.listProductUnitName;
      this.listProperty = result.listProperty;
      this.listStageGroup = result.listStageGroup;
      this.listOrganization = result.listOrganization;

      //set duplicate code validation
      this.productForm
        .get("ProductCode")
        .setValidators([
          Validators.required,
          checkDuplicateCode(this.listProductCode),
          checkBlankString(),
        ]);
      this.productForm.updateValueAndValidity();
    } else {
      this.clearToast();
      this.showToast("error", "Thông báo", result.messageCode);
    }
  }

  deleteItem(dataRow) {
    this.confirmationService.confirm({
      message: "Bạn chắc chắn muốn xóa?",
      accept: () => {
        this.listProductVendorMapping = this.listProductVendorMapping.filter(
          (e) => e != dataRow
        );
        //Đánh lại số OrderNumber
        this.listProductVendorMapping.forEach((item, index) => {
          item.OrderNumber = index + 1;
        });
      },
    });
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  isDisplayRequired: boolean = true;

  async createProduct() {
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
      let result: any = await this.productService.createProductAsync(
        productModel,
        null,
        this.listProductVendorMapping,
        this.auth.userId
      );
      this.loading = false;
      if (result.statusCode === 200) {
        this.getMasterData();
        this.resetProductForm();
        this.showToast("success", "Thông báo", "Tạo sản phẩm thành công");

        if (this.typePage == 0) {
          this.router.navigate([
            "/product/detail",
            { productId: result.productId, type: 0 },
          ]);
        } else if (this.typePage == 2) {
          this.router.navigate([
            "/product/detail",
            { productId: result.productId, type: 2 },
          ]);
        }
        

      } else {
        this.isInvalidForm = false;
        this.isOpenNotifiError = false;
        this.clearToast();
        this.showToast("error", "Thông báo", result.messageCode);
      }
    }
  }

  /*Sửa một sản phẩm nhà cung cấp*/
  onRowSelect(dataRow) {
    //Nếu có quyền sửa thì mới cho sửa
    if (this.actionEdit) {
      var index = this.listProductVendorMapping.indexOf(dataRow);
      var OldArray = this.listProductVendorMapping[index];

      let ref = this.dialogService.open(VendorDetailDialogComponent, {
        data: {
          isCreate: false,
          productVendorMappingModel: OldArray,
        },
        header: "Sửa chi tiết sản phẩm nhà cung cấp",
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
          }
        }
      });
    }
  }

  onCreateNewVendor() {
    let ref = this.dialogService.open(QuickCreateVendorComponent, {
      header: "Tạo nhanh nhà cung cấp",
      width: "50%",
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
        }
      }
    });
  }

  cancel() {
    if (this.typePage == 0) {
      this.confirmationService.confirm({
        message:
          "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác, bạn có chắc chắn muốn hủy?",
        accept: () => {
          this.router.navigate(["/product/list"]);
        },
      });
    } else if (this.typePage == 2) {
      this.confirmationService.confirm({
        message:
          "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác, bạn có chắc chắn muốn hủy?",
        accept: () => {
          this.router.navigate(["/product/list-congcu"]);
        },
      });
    }
  }

  addVendorProductDetail() {
    let ref = this.dialogService.open(VendorDetailDialogComponent, {
      data: {
        isCreate: true,
      },
      header: "Thêm chi tiết sản phẩm nhà cung cấp",
      width: "70%",
      baseZIndex: 999,
      contentStyle: {
        "min-height": "175px",
        "max-height": "600px",
        overflow: "auto",
      },
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          this.productVendorMapping = result.productVendorMappingModel;
          this.productVendorMapping.OrderNumber =
            this.listProductVendorMapping.length + 1;
          this.listProductVendorMapping.push(this.productVendorMapping);
        }
      }
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  searchVendorProductPrice() {
    if (this.vendorName) {
      this.vendorName = this.vendorName.trim();
    }
    if (this.productName) {
      this.productName = this.productName.trim();
    }
  }

  checkStatusMinQuanty(): boolean {
    let dataStatus = true;

    // this.listMinQuantityProduct.forEach(rowData => {
    //   //reset status
    //   rowData.status = true;
    //   rowData.listNoteErr = [];
    //   //check empty string
    //   if (rowData.minQuantity.trim() === '') {
    //     rowData.status = false;
    //     rowData.listNoteErr = [...rowData.listNoteErr, this.listNoteErr.find(e => e.code == 'required_min_quanty').name];
    //   }
    //   if (rowData.maxQuantity != null && rowData.maxQuantity != undefined) {
    //     if (rowData.maxQuantity.trim() !== '' && rowData.minQuantity.trim() !== '') {
    //       let minQuantity = ParseStringToFloat(rowData.minQuantity);
    //       let maxQuantity = ParseStringToFloat(rowData.maxQuantity);
    //       if (minQuantity > maxQuantity) {
    //         rowData.status = false;
    //         rowData.listNoteErr = [...rowData.listNoteErr, this.listNoteErr.find(e => e.code == 'min_quantity_less_max_quantity').name];
    //       }
    //     }
    //   }
    //   //check dataStatus
    //   if (rowData.status === false) dataStatus = false;
    // });

    return dataStatus;
  }

  checkStatusStartQuanty(): boolean {
    let dataStatus = true;
    return dataStatus;
  }

  mappingProductForm(): ProductModel2 {
    let newProduct = new ProductModel2();
    newProduct.ProductId = this.emptyGuid;
    newProduct.ProductCategoryId =
      this.productForm.get("ProductCategory").value.categoryId;
    newProduct.ProductName = this.productForm.get("ProductName").value;
    newProduct.AccountingCode = this.productForm.get("AccountingCode").value;
    newProduct.ProductCode = this.productForm.get("ProductCode").value;
    newProduct.ProductUnitId =
      this.productForm.get("ProductUnit").value.categoryId;
    //default values
    newProduct.ProductType = this.typePage;
    newProduct.CreatedById = this.emptyGuid;
    newProduct.CreatedDate = new Date();
    newProduct.UpdatedById = null;
    newProduct.UpdatedDate = null;
    newProduct.Active = true;
    newProduct.MinimumInventoryQuantity = this.productForm.get(
      "MinimumInventoryQuantity"
    ).value;
    return newProduct;
  }

  hashImageName(imageName: string, index: number): string {
    let newName = imageName;
    let hash = Date.parse(new Date().toString()).toString() + index.toString();
    let lastIndex = imageName.lastIndexOf(".");
    let array1 = newName.slice(0, lastIndex);
    let array2 = newName.slice(lastIndex);
    newName = array1 + "_" + hash + array2;
    return newName;
  }

  convertDataURItoFile(dataURI, fileName, type) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(",")[1]);
    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    var blob: any = new Blob([ia], { type: mimeString });
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    blob.lastModifiedDate = new Date();
    blob.name = fileName;
    //Cast to a File() type
    let file = new File([blob], fileName, { type: type });
    return file;
  }

  /* Mở dialog thêm nguyên vật liệu sản phẩm */
  addBillOfMaterial() {
    let ref = this.dialogService.open(ProductBomDialogComponent, {
      data: {
        listProductBillOfMaterials: this.listProductBillOfMaterials,
      },
      header: "Thêm mới định mức nguyên vật liệu",
      width: "50%",
      baseZIndex: 999,
      contentStyle: {
        "min-height": "380px",
        "max-height": "600px",
        overflow: "auto",
      },
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        let productBillOfMaterial: productBillOfMaterialsModel =
          result.productBillOfMaterial;
        this.listProductBillOfMaterials = [
          productBillOfMaterial,
          ...this.listProductBillOfMaterials,
        ];
      }
    });
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

function checkEmptyControl(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (array.length === 0) {
      return { 'checkEmptyControl': true };
    }
    return null;
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function ParseStringToFloat(str: string) {
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
      let value = ParseStringToFloat(control.value);
      if (value > max) return { 'maxValue': true }
    }
    return null;
  }
}

