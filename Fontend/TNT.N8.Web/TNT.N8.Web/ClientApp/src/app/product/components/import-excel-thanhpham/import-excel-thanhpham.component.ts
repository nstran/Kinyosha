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
    // check m?? s???n ph???m trong DB
    { code: "exist_inDB", name: "M?? s???n ph???m ???? t???n t???i tr??n h??? th???ng" },

    // check c??c s???n ph???m ???? t???n t???i tr??n h??? th???ng
    {
      code: "wrong_loaiTP",
      name: "Lo???i th??nh ph???m kh??ng t???n t???i tr??n h??? th???ng",
    },
    { code: "wrong_donVi", name: "????n v??? t??nh kh??ng t???n t???i tr??n h??? th???ng" },
    {
      code: "wrong_department",
      name: "B??? ph???n qu???n l?? kh??ng t???n t???i tr??n h??? th???ng",
    },
    {
      code: "wrong_productTSD",
      name: "Nguy??n v???t li???u t??i s??? d???ng kh??ng t???n t???i tr??n h??? th???ng",
    },

    /* required fields */
    { code: "required_productCode", name: "M?? s???n ph???m kh??ng ???????c ????? tr???ng" },
    { code: "required_productCategoryName", name: "Lo???i s???n ph???m kh??ng ???????c ????? tr???ng" },
    { code: "required_productName", name: "T??n th??nh ph???m kh??ng ???????c ????? tr???ng" },
    { code: "required_productUnitName", name: "????n v??? t??nh kh??ng ???????c ????? tr???ng" },
    { code: "required_productDepartment", name: "B??? ph???n qu???n l?? kh??ng ???????c ????? tr???ng" },
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
        header: "M?? s???n ph???m",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: false,
      },
      {
        field: "productCategoryName",
        header: "Lo???i th??nh ph???m",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "productName",
        header: "T??n th??nh ph???m",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: false,
      },
      {
        field: "productUnitName",
        header: "????n v??? t??nh",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "departmentName",
        header: "B??? ph??n qu???n l??",
        textAlign: "right",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "referencedName",
        header: "NVL t??i s??? d???ng c???a s???n ph???m NG",
        textAlign: "right",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: false,
        isList: true,
      },
      {
        field: "listStatus",
        header: "Tr???ng th??i",
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
        summary: "Th??ng b??o",
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

      // Check m?? t???n t???i
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
      

      // check lo???i h??ng c?? t???n t???i tr??n h??? th???ng kh??ng
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
        summary: "Th??ng b??o",
        detail: "Ch???n danh s??ch c???n import",
      };
      this.showMessage(msg);
      return;
    }
    let inValidRecord = this.selectedTPImport.find((e) => !e.isValid);
    if (inValidRecord) {
      let msg = {
        severity: "error",
        summary: "Th??ng b??o",
        detail: "Danh s??ch kh??ng h???p l???",
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
        summary: "Th??ng b??o",
        detail: result.messageCode,
      };
      result.status = true;
      this.showMessage(mgs);
      this.ref.close(result);
    } else {
      let mgs = {
        severity: "error",
        summary: "Th??ng b??o",
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