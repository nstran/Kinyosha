import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService, Table } from 'primeng';
import { WarehouseService } from "../../../warehouse/services/warehouse.service";
import { DetailProductModel, ProductModel2, ProductVendorMappingModel } from '../../models/product.model';
import { ProductService } from '../../services/product.service';


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
  vendorId: string;
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
  accountingCode: string;
  referencedId: string;

  listStatus: Array<Note>;
  isValid: boolean;
  selectionProductCategory: any;
  selectionProductUnit: any;
  selectionProductVendor: any
}

@Component({
  selector: "app-import-excel-nvl",
  templateUrl: "./import-excel-nvl.component.html",
  styleUrls: ["./import-excel-nvl.component.css"],
})
export class ImportExcelNvlComponent implements OnInit {
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));
  userId = this.auth.UserId;
  loading: boolean = false;
  @ViewChild("myTable") myTable: Table;

  today: Date = new Date();

  listNote: Array<Note> = [
    // Check m?? v???t li???u trong DB
    { code: "exist_inDB", name: "M?? h??ng h??a ???? c?? tr??n h??? th???ng" },

    /* required fields */
    { code: "required_productCode", name: "M?? v???t li???u kh??ng ???????c ????? tr???ng" },
    { code: "required_productName", name: "T??n v???t li???u kh??ng ???????c ????? tr???ng" },
    { code: "required_productUnit", name: "????n v??? t??nh kh??ng ???????c ????? tr???ng" },
    { code: "required_accountingCode", name: "M?? k??? to??n kh??ng ???????c ????? tr???ng" },
    { code: "required_vendorName", name: "Nh?? cung c???p kh??ng ???????c ????? tr???ng" },
    {
      code: "required_productCategoryName",
      name: "Lo???i h??ng kh??ng ???????c ????? tr???ng",
    },
    { code: "required_productMinimum", name: "T???n kho t???i thi???u kh??ng ???????c ????? tr???ng" },

    {
      code: "wrong_productCategory",
      name: "Lo???i h??ng kh??ng t???n t???i tr??n h??? th???ng",
    },
    {
      code: "wrong_productUnit",
      name: "????n v??? t??nh kh??ng t???n t???i tr??n h??? th???ng",
    },
    { code: "wrong_vendor", name: "Nh?? cung c???p kh??ng t???n t???i tr??n h??? th???ng" },

    // check s??? t???i thi???u l???n h??n 0
    { code: "wrong_productMinimum", name: "Gi?? tr??? nguy??n ph???i l???n h??n 0" },
  ];

  listProductNVLImport: Array<ProductModel> = [];

  //table
  rows: number = 10;
  columns: Array<any> = [];

  listLoaiHang: Array<any> = [];
  listDonVi: Array<any> = [];
  listNhaCungCap: Array<any> = [];
  listProductCode: Array<any> = [];

  selectedNVLImport: Array<ProductModel> = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private productService: ProductService
  ) {
    if (this.config.data) {
      this.listProductNVLImport = this.config.data.listProductNVLImport;
      if (this.listProductNVLImport != null && this.listProductNVLImport != undefined) {
        this.listProductNVLImport.forEach(item => {
          if (item.listStatus != null && item.listStatus != undefined && item.listStatus.length > 0) {
            item.isValid = true;
          }
          else {
            item.isValid = false;
          }
        });
      }
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
        header: "M?? VL",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: false,
      },
      {
        field: "accountingCode",
        header: "M?? k??? to??n",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: false,
      },
      {
        field: "productCategoryName",
        header: "Lo???i h??ng",
        textAlign: "left",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "productName",
        header: "T??n h??ng",
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
        field: "minimumInventoryQuantity",
        header: "T???n kho t???i thi???u",
        textAlign: "right",
        display: "table-cell",
        width: "150px",
        type: "number",
        isRequired: true,
        isList: false,
      },
      {
        field: "listVendorName",
        header: "Nh?? cung c???p",
        textAlign: "right",
        display: "table-cell",
        width: "150px",
        type: "text",
        isRequired: true,
        isList: true,
      },
      {
        field: "listStatus",
        header: "Ghi ch??",
        textAlign: "left",
        display: "table-cell",
        width: "250px",
        type: "listStatus",
      },
    ];
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.productService.getMasterdataCreateProduct(0);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listProductCode = result.listProductCode;
      this.listDonVi = result.listProductUnit;
      this.listLoaiHang = result.listProperty;
      this.listNhaCungCap = result.listVendor;
      this.listNhaCungCap.forEach(item => {
        item.vendorName = item.vendorCode + ' - ' + item.vendorName;
      })


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
      this.listProductNVLImport.forEach((product) => {
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

          product.listVendorName =
            product.selectionProductVendor != null
              ? product.selectionProductVendor.vendorName
              : product.listVendorName;
          
          product.vendorId =
            product.selectionProductVendor != null
              ? product.selectionProductVendor.vendorId
              : product.vendorId;
        }
      });
    }

    this.listProductNVLImport.forEach((nvl) => {
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

      if (!nvl.productName?.trim()) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_productName"),
        ];
        nvl.isValid = false;
      }

      if (!nvl.productUnitName) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_productUnit"),
        ];
        nvl.isValid = false;
      }

      if (!nvl.accountingCode?.trim()) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_accountingCode"),
        ];
        nvl.isValid = false;
      }

      if (!nvl.productCategoryName) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_productCategoryName"),
        ];
        nvl.isValid = false;
      }

      if (!nvl.minimumInventoryQuantity) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_productMinimum"),
        ];
        nvl.isValid = false;
      }

      if (!nvl.listVendorName) {
        nvl.listStatus = [
          ...nvl.listStatus,
          this.listNote.find((e) => e.code == "required_vendorName"),
        ];
        nvl.isValid = false;
      }

      // Check m?? t???n t???i
      if (nvl.productCode) {
        if (
          this.listProductCode.indexOf(nvl.productCode.toUpperCase().trim()) !=
          -1
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
          this.listProductNVLImport.filter(
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
            this.listNote.find((e) => e.code == "wrong_productCategory"),
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
            this.listNote.find((e) => e.code == "wrong_productUnit"),
          ];
          nvl.isValid = false;
        }
      }

      if (nvl.listVendorName) {
        let data = this.listNhaCungCap.find(x => x.vendorName.toLowerCase().trim() == nvl.listVendorName.toLowerCase().trim());
        if (!data) {
          nvl.listStatus = [...nvl.listStatus, this.listNote.find(e => e.code == "wrong_vendor")];
          nvl.isValid = false;
        }
      }

      // s??? l?????ng t???i thi???u ph???i l???n h??n 0
      if (nvl.minimumInventoryQuantity < 0) {
        if (Number(nvl.minimumInventoryQuantity) < 0) {
          if (
            Number(nvl.minimumInventoryQuantity) < 0 ||
            Number(nvl.minimumInventoryQuantity) == null
          ) {
            nvl.listStatus = [
              ...nvl.listStatus,
              this.listNote.find((e) => e.code == "wrong_productMinimum"),
            ];
            nvl.isValid = false;
          }
        }
      }
    });

    /* auto add to valid list */
    if (autoAdd)
      this.selectedNVLImport = this.listProductNVLImport.filter(
        (e) => e.isValid
      );
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
    if (this.selectedNVLImport.length == 0) {
      let msg = {
        severity: "warn",
        summary: "Th??ng b??o",
        detail: "Ch???n danh s??ch c???n import",
      };
      this.showMessage(msg);
      return;
    }
    let inValidRecord = this.selectedNVLImport.find((e) => !e.isValid);
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
    let listProductNVL: Array<DetailProductModel> = [];
    let listProductVendorMapping: Array<ProductVendorMappingModel> = [];
    this.selectedNVLImport.forEach((item) => {
      var newProduct = this.mapFormToProductModel(item);
      listProductNVL.push(newProduct);

      var productVendor = this.mapFormToVendor(item);
      listProductVendorMapping.push(productVendor);
    });
    this.loading = true;
    let result: any = await this.productService.importProductAsync(
      listProductNVL, listProductVendorMapping
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
    productModel.productType = 0;
    productModel.active = true;
    // productModel.canDelete = false;
    productModel.createdById = this.auth.UserId;
    productModel.createdDate = convertToUTCTime(new Date());
    productModel.updatedById = null;
    productModel.updatedDate = null;

    return productModel;
  }

  mapFormToVendor(vendor): ProductVendorMappingModel{
    let vendorModel = new ProductVendorMappingModel();
    vendorModel = vendor;
    vendorModel.CreatedById = this.auth.UserId;
    vendorModel.CreatedDate = convertToUTCTime(new Date());
    vendorModel.Active = true;

    return vendorModel;
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

