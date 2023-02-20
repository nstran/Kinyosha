import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener,ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { data } from 'jquery';
import { ConfirmationService, DialogService, MessageService, Table } from 'primeng';
import { ChonNhieuDvDialogComponent } from "../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component";
import { GetPermission } from '../../../shared/permission/get-permission';
import { CategoryModel, OrganizationModel, ProductModel2, productMoneyUnitModel, productUnitModel, ProductVendorMappingModel } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductBomDialogComponent } from '../product-bom-dialog/product-bom-dialog.component';

class Product {
  public productId: string;
  public productCode: string;
  public productName: string;
  public productCategoryName: string;
  public listVendorName: string;
  public productUnitName: string;
  public propertyName: string;
  public calculateInventoryPricesName: string;
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
  // stageGroupName:any;
  quota: any;
  consumption: any;
  tong: any;
}

@Component({
  selector: "app-thanhpham",
  templateUrl: "./thanhpham.component.html",
  styleUrls: ["./thanhpham.component.css"],
  styles: [`
      :host ::ng-deep .p-cell-editing {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
      }
  `]
})
export class ThanhphamComponent implements OnInit {
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));

  /* Action*/
  actionAdd: boolean = true;
  /*END*/

  fromDate: Date = new Date();
  toDate: Date = new Date();

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );

  editing: boolean = false;

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
  listProductEntityModel: Array<any> = [];

  listVendorProductPrice: Array<ProductVendorMappingModel> = [];
  productVendorMapping = new ProductVendorMappingModel();

  listProductVendorMapping: Array<ProductVendorMappingModel> = [];

  colsDinhMucVNL: Array<any> = []
  colsChiTietDinhMucVNL: Array<any> = []
  error: any = {
    EmployeeCode: "",
    IsAccessable: "",
    FirstName: "",
    LastName: "",
    TenTiengAnh: "",
    Gender: "",
    DateOfBirth: "",
    QuocTich: "",
    DanToc: "",
    TonGiao: "",
    OrganizationId: "",
    StartedDate: "",
    PositionId: "",
    ViTriLamViec: "",
    Phone: "",
    OtherPhone: "",
    WorkPhone: "",
    Email: "",
    WorkEmail: "",
  };

  // form controls

  //table
  rows: number = 10;
  colsProductBOM: any;
  selectedColsProductBOM: any;

  //form controls
  chitietdinhmucForm: FormGroup;
  thanhphamForm: FormGroup;
  ProductCategory: FormControl;
  ProductCode: FormControl;
  ProductName: FormControl;
  ProductUnit: FormControl;
  Referenced: FormControl;
  Department: FormControl;

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

  listSelectedDonVi: Array<any> = [];
  listDinhMuc: Array<configurationProductEntityModel> = [];
  listChiTietDinhMuc: Array<configurationProductMappingEntityModel> = [];
  selectedConfigurationProductEntityModel: any;
  // clonedChiTietDinhMuc: { [s: string]: configurationProductMappingEntityModel; } = {};
  clonedData: { [s: string]: any; } = {}

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
    private renderer: Renderer2,
    private ref: ChangeDetectorRef,
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
      this.route.params.subscribe((params) => {
        if (params["ProductType"]) {
          this.productType = params["ProductType"];
        }
      });
    }
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
    this.colsDinhMucVNL = [
      // { field: 'configurationProductId', header: 'Id', textAlign: 'center', display: 'table-cell', width: "100px" },
      // { field: 'productId', header: 'ProductId', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'configurationName', header: 'Cấu hình định mức', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'startDate', header: 'Ngày bắt đầu hiệu lực', textAlign: 'center', display: 'table-cell', width: '100px' },
      { field: 'endDate', header: 'Ngày kết thúc hiệu lực', textAlign: 'center', display: 'table-cell', width: '100px' }
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
  }

  initForm() {
    this.thanhphamForm = new FormGroup({
      ProductCategory: new FormControl(null, Validators.required),
      ProductCode: new FormControl("", [
        Validators.required,
        checkBlankString(),
      ]),
      ProductName: new FormControl(null, Validators.required),
      ProductUnit: new FormControl(null, Validators.required),
      Referenced: new FormControl(null, Validators.required),
      Department: new FormControl(
        { value: null, disabled: true },
        Validators.required
      ),
    });

      this.chitietdinhmucForm = new FormGroup({
      TenCauHinh: new FormControl(null, Validators.required),
      StartDate: new FormControl(new Date()),
      EndDate: new FormControl(new Date())
    });
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

  luuchitietcauhinh(){

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
      productUnitName: "",
      quota: 0,
      consumption: 0,
      tong:0
    }

    this.listChiTietDinhMuc.push(configurationProductMappingEntityModel); 

    this.editing = false;
    this.onRowEditInitChild(configurationProductMappingEntityModel);

    
  }
  xoachitietdinhmuc(){

  }
  tinhTong(rowData: any){
    rowData.tong = ParseStringToFloat(rowData.quota) + ((ParseStringToFloat(rowData.quota) * ParseStringToFloat(rowData.consumption)) / 100);
  }

  onChangeProduct(rowData: any){
    
  }

  // onRowEditInit(rowData){
  //   console.log(rowData);

  //   // this.clonedChiTietDinhMuc[configurationProductMappingEntityModel.configurationProductMappingId] = {...configurationProductMappingEntityModel};
  // }
  // onRowEditSave(configurationProductMappingEntityModel: configurationProductMappingEntityModel){
    
  // }
  // onRowEditCancel(configurationProductMappingEntityModel: configurationProductMappingEntityModel, index: number){
    
  // }

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

        this.tinhTong(rowData);
      }
     
    });
  }

  resetProductForm() {
    this.thanhphamForm.reset();
    this.thanhphamForm.patchValue({
      ProductCategory: "",
      ProductCode: "",
      ProductUnit: null,
      Department: [],
      ProductName: "",
      Referenced: [],
    });
  }

  async getMasterData() {
    this.loading = true;
   
    let result: any = await this.productService.getMasterdataCreateProduct(1);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listProductCode = result.listProductCode;
      this.listProductUnit = result.listProductUnit;
      this.listProductUnitName = result.listProductUnitName;
      this.listProperty = result.listProperty;
      this.listStageGroup = result.listStageGroup;
      this.listOrganization = result.listOrganization;
      this.listProductEntityModel = result.listProductEntityModel;
      //set duplicate code validation
      this.thanhphamForm
        .get("ProductCode")
        .setValidators([
          Validators.required,
          checkDuplicateCode(this.listProductCode),
          checkBlankString(),
        ]);
      this.thanhphamForm.updateValueAndValidity();
    } else {
      this.clearToast();
      this.showToast("error", "Thông báo", result.messageCode);
    }
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  isDisplayRequired: boolean = true;

  async createProduct() {
    //type = true: Lưu và thêm mới; type = false: Lưu;

    if (!this.thanhphamForm.valid) {
      Object.keys(this.thanhphamForm.controls).forEach((key) => {
        if (!this.thanhphamForm.controls[key].valid) {
          this.thanhphamForm.controls[key].markAsTouched();
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
        // this.getMasterData();
        // this.resetProductForm();
        this.showToast("success", "Thông báo", "Tạo sản phẩm thành công");
        this.router.navigate([
          "/product/detail-thanhpham",
          { productId: result.productId },
        ]);
      } else {
        this.isInvalidForm = false;
        this.isOpenNotifiError = false;
        this.clearToast();
        this.showToast("error", "Thông báo", result.messageCode);
      }
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
          this.thanhphamForm.controls.Department.patchValue(
            listSelectedTenDonVi
          );
          this.error["OrganizationId"] = null;
        } else {
          this.listSelectedDonVi = [];
          this.thanhphamForm.controls.Department.patchValue(null);
          this.error["OrganizationId"] = "Không được để trống";
        }
      }
    });
  }

  cancel() {
    this.confirmationService.confirm({
      message:
        "Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác, bạn có chắc chắn muốn hủy?",
      accept: () => {
        this.router.navigate(["/product/list-thanhpham"]);
      },
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

  checkStatusStartQuanty(): boolean {
    let dataStatus = true;
    return dataStatus;
  }

  mappingProductForm(): ProductModel2 {
    let newProduct = new ProductModel2();
    newProduct.ProductId = this.emptyGuid;
    newProduct.ProductCategoryId =
      this.thanhphamForm.get("ProductCategory").value.categoryId;
    newProduct.ProductName = this.thanhphamForm.get("ProductName").value;
    newProduct.ProductCode = this.thanhphamForm.get("ProductCode").value;
    newProduct.ReferencedId =
      this.thanhphamForm.get("Referenced").value.productId;
    newProduct.ProductUnitId =
      this.thanhphamForm.get("ProductUnit").value.categoryId;
    newProduct.Department =
      this.listSelectedDonVi != null && this.listSelectedDonVi.length > 0
        ? this.listSelectedDonVi[0]?.organizationId
        : this.emptyGuid;
    //default values
    newProduct.ProductType = 1;
    newProduct.CreatedById = this.emptyGuid;
    newProduct.CreatedDate = new Date();
    newProduct.UpdatedById = null;
    newProduct.UpdatedDate = null;
    newProduct.Active = true;
    newProduct.MinimumInventoryQuantity = 0;
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
  // addBillOfMaterial() {
  //   let ref = this.dialogService.open(ProductBomDialogComponent, {
  //     data: {
  //       listProductBillOfMaterials: this.listProductBillOfMaterials,
  //     },
  //     header: "Thêm mới định mức nguyên vật liệu",
  //     width: "50%",
  //     baseZIndex: 999,
  //     contentStyle: {
  //       "min-height": "380px",
  //       "max-height": "600px",
  //       overflow: "auto",
  //     },
  //   });

  //   ref.onClose.subscribe((result: any) => {
  //     if (result) {
  //       let productBillOfMaterial: productBillOfMaterialsModel =
  //         result.productBillOfMaterial;
  //       this.listProductBillOfMaterials = [
  //         productBillOfMaterial,
  //         ...this.listProductBillOfMaterials,
  //       ];
  //     }
  //   });
  // }
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

function checkEmptyControl(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (array.length === 0) {
      return { checkEmptyControl: true };
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
      let value = ParseStringToFloat(control.value);
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