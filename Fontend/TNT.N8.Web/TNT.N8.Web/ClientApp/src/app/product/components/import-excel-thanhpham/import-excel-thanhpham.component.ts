import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef, MessageService, Table } from "primeng";
import { DetailProductModel } from "../../models/product.model";
import { ProductService } from "../../services/product.service";

class Note {
  public code: string;
  public name: string;
}

interface ResultDialog {
  status: boolean;
  statusImport: boolean;
}

class ProductModel {
  productId: string;
  productCategoryId: string;
  productName: string;
  productCode: string;
  price1: number;
  price2: number;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: Date;
  active: Boolean;
  quantity: number;
  productUnitId: string;
  productUnitName: string;
  productDescription: string;
  vat: Number;
  minimumInventoryQuantity: Number;
  productMoneyUnitId: string;
  guaranteeTime: Number;
  productCategoryName: string;
  listVendorName: string;
  exWarehousePrice: number;
  countProductInformation: number;
  calculateInventoryPricesId: string;
  propertyId: string;
  warehouseAccountId: string;
  revenueAccountId: string;
  payableAccountId: string;
  importTax: number;
  costPriceAccountId: string;
  accountReturnsId: string;
  folowInventory: boolean;
  managerSerialNumber: boolean;
  loaiKinhDoanh: string;
  shortName: string;
  productType: Number;
  department: string;
  departmentName: string;
  accountingCode: string;
  referencedId: string;
  referencedName: string;

  listStatus: Array<Note>;
  isValid: boolean;
  selectionProductCategory: any;
  selectionProductUnit: any;
  selectionProductDepartment: any;
  selectionProductTSD: any;
}

@Component({
  selector: "app-import-excel-thanhpham",
  templateUrl: "./import-excel-thanhpham.component.html",
  styleUrls: ["./import-excel-thanhpham.component.css"],
})
export class ImportExcelThanhphamComponent implements OnInit {
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));
  userId = this.auth.UserId;
  loading: boolean = false;
  @ViewChild("myTable") myTable: Table;

  todate: Date = new Date();

  listNote: Array<Note> = [
    // check mã sản phẩm trong DB
    { code: "exist_inDB", name: "Mã sản phẩm đã tồn tại trên hệ thống" },

    // check các sản phẩm đã tồn tại trên hệ thống
    {
      code: "wrong_loaiTP",
      name: "Loại thành phẩm không tồn tại trên hệ thống",
    },
    { code: "wrong_donVi", name: "Đơn vị tính không tồn tại trên hệ thống" },
    {
      code: "wrong_department",
      name: "Bộ phận quản lý không tồn tại trên hệ thống",
    },
    {
      code: "wrong_productTSD",
      name: "Nguyên vật liệu tái sử dụng không tồn tại trên hệ thống",
    },

    /* required fields */
    { code: "required_productCode", name: "Mã sản phẩm không được để trống" },
    { code: "required_productCategoryName", name: "Loại sản phẩm không được để trống" },
    { code: "required_productName", name: "Tên thành phẩm không được để trống" },
    { code: "required_productUnitName", name: "Đơn vị tính không được để trống" },
    { code: "required_productDepartment", name: "Bộ phận quản lý không được để trống" },
  ];

  listProductTPImport: Array<ProductModel> = [];

  //table
  rows: number = 10;
  columns: Array<any> = [];

  listLoaiHang: Array<any> = [];
  listDonVi: Array<any> = [];
  listBoPhan: Array<any> = [];
  listProductCode: Array<any> = [];
  listProductTSD: Array<any> = [];

  selectedTPImport: Array<ProductModel> = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private productService: ProductService
  ) {
    if (this.config.data) {
      this.listProductTPImport = this.config.data.listProductTPImport;
    }
  }

  async ngOnInit() {
    this.initTable();
    await this.getMasterData();
    this.checkStatus(true, null);

  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  initTable() {
    this.columns = [
      {
        field: "productCode",
        header: "Mã sản phẩm",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: false,
      },
      {
        field: "productCategoryName",
        header: "Loại thành phẩm",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "productName",
        header: "Tên thành phẩm",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: false,
      },
      {
        field: "productUnitName",
        header: "Đơn vị tính",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "departmentName",
        header: "Bộ phân quản lý",
        textAlign: "right",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "referencedName",
        header: "NVL tái sử dụng của sản phẩm NG",
        textAlign: "right",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: false,
        isList: true,
      },
      {
        field: "listStatus",
        header: "Trạng thái",
        textAlign: "left",
        display: "table-cell",
        width: "250px",
        type: "listStatus",
      },
    ];
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.productService.getMasterdataCreateProduct(1);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listDonVi = result.listProductUnit;
      this.listLoaiHang = result.listProperty;
      this.listBoPhan = result.listOrganization;
      this.listProductTSD = result.listProductEntityModel;
      this.listProductCode = result.listProductCode;
    } else {
      let mgs = {
        severity: "error",
        summary: "Thông báo",
        detail: result.messageCode,
      };
      this.showMessage(mgs);
    }
  }

  checkStatus(autoAdd: boolean, rowData) {
    if (rowData != null && rowData != undefined) {
      this.listProductTPImport.forEach((product) => {
        if (product.productCode == rowData.productCode) {
          product.productCategoryName =
            product.selectionProductCategory != null
              ? product.selectionProductCategory.categoryName
              : product.productCategoryName;

          product.productCategoryId =
            product.selectionProductCategory != null
              ? product.selectionProductCategory.categoryId
              : product.productCategoryId;

          product.productUnitName =
            product.selectionProductUnit != null
              ? product.selectionProductUnit.categoryName
              : product.productUnitName;

          product.productUnitId =
            product.selectionProductUnit != null
              ? product.selectionProductUnit.categoryId
              : product.productUnitId;

          product.departmentName =
            product.selectionProductDepartment != null
              ? product.selectionProductDepartment.organizationName
              : product.departmentName;
          
          product.department =
            product.selectionProductDepartment != null
              ? product.selectionProductDepartment.organizationId
              : product.department;
          
          product.referencedName =
            product.selectionProductTSD != null
              ? product.selectionProductTSD.productName
              : product.referencedName;
          
          product.referencedId =
            product.selectionProductTSD != null
              ? product.selectionProductTSD.productId
              : product.referencedId;
        }
      });
    }

    this.listProductTPImport.forEach((nvl) => {
      nvl.listStatus = [];
      nvl.isValid = true;

      /* required fields */
      if (!nvl.productCode?.trim()) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_productCode"),
        ];
        nvl.isValid = false;
      }

      if (!nvl.productCategoryName) {
        nvl.listStatus = [ ...nvl.listStatus, this.listNote.find((e) => e.code == "required_productCategoryName")];
        nvl.isValid = false;
      }

      if (!nvl.productName?.trim()) {
        nvl.listStatus = [ ...nvl.listStatus, this.listNote.find((e) => e.code == "required_productCode")];
        nvl.isValid = false;
      }

      if (!nvl.productUnitName) {
        nvl.listStatus = [ ...nvl.listStatus, this.listNote.find((e) => e.code == "required_productUnitName")];
        nvl.isValid = false;
      }

      if (!nvl.departmentName) {
        nvl.listStatus = [ ...nvl.listStatus, this.listNote.find((e) => e.code == "required_productDepartment")];
        nvl.isValid = false;
      }

      // Check mã tồn tại
      if (nvl.productCode) {
        if (
          this.listProductCode.indexOf(nvl.productCode.toUpperCase().trim()) != -1
        ) {
          nvl.listStatus = [
            ...nvl.listStatus,
            this.listNote.find((e) => e.code == "exist_inDB"),
          ];
          nvl.isValid = false;
        }
      }

      if (nvl.productCode) {
        if (
          this.listProductTPImport.filter(
            (x) =>
              x.productCode.toUpperCase().trim() ==
              nvl.productCode.toUpperCase().trim()
          ).length > 1
        ) {
          nvl.listStatus = [
            ...nvl.listStatus,
            this.listNote.find((e) => e.code == "exist_inDB"),
          ];
          nvl.isValid = false;
        }
      }
      

      // check loại hàng có tồn tại trên hệ thống không
      if (nvl.productCategoryName) {
        let data = this.listLoaiHang.find(
          (x) =>
            x.categoryName.toLowerCase().trim() ==
            nvl.productCategoryName.toLowerCase().trim()
        );
        if (!data) {
          nvl.listStatus = [
            ...nvl.listStatus,
            this.listNote.find((e) => e.code == "wrong_loaiTP"),
          ];
          nvl.isValid = false;
        }
      }

      if (nvl.productUnitName) {
        let data = this.listDonVi.find(
          (x) =>
            x.categoryName.toLowerCase().trim() ==
            nvl.productUnitName.toLowerCase().trim()
        );
        if (!data) {
          nvl.listStatus = [
            ...nvl.listStatus,
            this.listNote.find((e) => e.code == "wrong_donVi"),
          ];
          nvl.isValid = false;
        }
      }

      if (nvl.departmentName) {
        let data = this.listBoPhan.find(
          (x) =>
            x.organizationName.toLowerCase().trim() ==
            nvl.departmentName.toLowerCase().trim()
        );
        if (!data) {
          nvl.listStatus = [
            ...nvl.listStatus,
            this.listNote.find((e) => e.code == "wrong_department"),
          ];
          nvl.isValid = false;
        }
      }

      // if (nvl.referencedName) {
      //   let data = this.listProductTSD.find(
      //     (x) =>
      //       x.categoryName.toLowerCase().trim() ==
      //       nvl.referencedName.toLowerCase().trim()
      //   );
      //   if (!data) {
      //     nvl.listStatus = [
      //       ...nvl.listStatus,
      //       this.listNote.find((e) => e.code == "wrong_productTSD"),
      //     ];
      //     nvl.isValid = false;
      //   }
      // }
    });

    /* auto add to valid list */
    if (autoAdd)
      this.selectedTPImport = this.listProductTPImport.filter((e) => e.isValid);
  }

  onCancel() {
    let result: ResultDialog = {
      status: false,
      statusImport: false,
    };
    this.ref.close(result);
  }

  async importProduct() {
    /* check valid list selected */
    if (this.selectedTPImport.length == 0) {
      let msg = {
        severity: "warn",
        summary: "Thông báo",
        detail: "Chọn danh sách cần import",
      };
      this.showMessage(msg);
      return;
    }
    let inValidRecord = this.selectedTPImport.find((e) => !e.isValid);
    if (inValidRecord) {
      let msg = {
        severity: "error",
        summary: "Thông báo",
        detail: "Danh sách không hợp lệ",
      };
      this.showMessage(msg);
      return;
    }
    this.checkStatus(false, null);
    let listProductTP: Array<DetailProductModel> = [];
    this.selectedTPImport.forEach((item) => {
      var newProduct = this.mapFormToProductModel(item);
      listProductTP.push(newProduct);
    });
    this.loading = true;
    let result: any = await this.productService.importProductAsync(
      listProductTP, []
    );
    this.loading = false;
    if (result.statusCode == 200) {
      let mgs = {
        severity: "success",
        summary: "Thông báo",
        detail: result.messageCode,
      };
      result.status = true;
      this.showMessage(mgs);
      this.ref.close(result);
    } else {
      let mgs = {
        severity: "error",
        summary: "Thông báo",
        detail: result.messageCode,
      };
      this.showMessage(mgs);
    }
  }

  mapFormToProductModel(product): DetailProductModel {
    let productModel = new DetailProductModel();
    productModel = product;
    productModel.productId = this.emptyGuid;
    productModel.productType = 1;
    productModel.active = true;
    productModel.canDelete = false;
    productModel.createdById = this.auth.UserId;
    productModel.createdDate = convertToUTCTime(new Date());
    productModel.updatedById = null;
    productModel.updatedDate = null;

    console.log(productModel);
    return productModel;
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};