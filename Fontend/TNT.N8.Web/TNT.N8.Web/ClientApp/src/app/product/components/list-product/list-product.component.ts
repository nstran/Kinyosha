import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ProductService } from '../../services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GetPermission } from '../../../shared/permission/get-permission';
import { CategoryModel, DetailProductModel, OrganizationModel, productLoaiHinhKinhDoanhModel, ProductModel2 } from '../../models/product.model';

import * as $ from 'jquery';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { DialogService } from 'primeng';
import { ImportExcelNvlComponent } from "../import-excel-nvl/import-excel-nvl.component";
import { CategoryService } from '../../../shared/services/category.service';



class ProductCategory {
  public productCategoryId: string;
  public productCategoryName: string;
}

class Vendor {
  public vendorId: string;
  public vendorName: string;
}

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

@Component({
  selector: "app-list-product",
  templateUrl: "./list-product.component.html",
  styleUrls: ["./list-product.component.css"],
})
export class ListProductComponent implements OnInit {
  first: number = 0;
  @ViewChild("myTable") myTable: Table;
  loading: boolean = false;
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );
  userPermission: any = localStorage.getItem("UserPermission").split(",");
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));
  createPermission: string = "pns/create";
  viewPermission: string = "pns/view";
  editPermission: string = "pns/edit";
  /* Action*/
  actionAdd: boolean = true;
  actionDelete: boolean = true;
  /*END*/

  //Import data
  listProductImport: Array<ProductModel2> = [];

  listData: Array<any> = [];
  listLoaiHinh: Array<productLoaiHinhKinhDoanhModel> = [];

  //master data
  categoryTypeList: any;

  listUnitCategory: Array<any> = [];
  listNhomSPCategory: Array<any> = [];
  listVendor: Array<any> = [];

  listProductCategory: Array<ProductCategory> = [];
  listProduct: Array<Product> = [];

  listUnit: Array<CategoryModel> = [];
  listProperty: Array<CategoryModel> = [];
  listOrganization: Array<OrganizationModel> = [];
  listStageGroup: Array<CategoryModel> = [];

  //table
  rows: number = 10;
  colsListProduct: any;
  selectedColumns: any[];
  filterGlobal: string = "";
  data: any;

  productType: number;
  activeIndex: number = 0;
  productName: string = "";
  productCode: string = "";

  //search form
  searchForm: FormGroup;
  ProductCategory: FormControl;
  ProductCode: FormControl;
  ProductName: FormControl;
  ProductUnit: FormControl;
  MinimumInventoryQuantity: FormControl;

  //responsive
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 2;

  //Import export excel
  displayDialog: boolean = false;
  importFileExcel: any = null;
  messErrFile: any = [];
  cellErrFile: any = [];
  fileName: string = "";
  // Thông báo lỗi
  isOpenNotifiError: boolean = false;
  isInvalidForm: boolean = false;

  @ViewChild("toggleButton") toggleButton: ElementRef;
  @ViewChild("notifi") notifi: ElementRef;
  @ViewChild("save", { static: true }) save: ElementRef;

  constructor(
    private translate: TranslateService,
    private getPermission: GetPermission,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
    private dialogService: DialogService,
    private categoryService: CategoryService
  ) {
    translate.setDefaultLang("vi");
    this.innerWidth = window.innerWidth;
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
    //Check permission
    let resource = "sal/product/list";
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
      this.route.params.subscribe((params) => {
        if (params["ProductType"]) {
          this.activeIndex = params["ProductType"];
        }
      });
    }
    this.initSearchForm();
    this.initTable();
    this.getMasterdata();
  }

  initSearchForm() {
    this.searchForm = new FormGroup({
      ProductName: new FormControl(""),
      ProductCode: new FormControl(""),
      ProductCategory: new FormControl([""]),
      ProductUnit: new FormControl([""]),
      MinimumInventoryQuantity: new FormControl([""]),
    });
  }

  initTable() {
    this.colsListProduct = [
      {
        field: "STT",
        header: "STT",
        textAlign: "center",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productCode",
        header: "Mã hàng hóa",
        textAlign: "center",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productName",
        header: "Tên hàng hóa",
        textAlign: "left",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productUnitName",
        header: "Đơn vị tính",
        textAlign: "center",
        display: "table-cell",
        width: "20px",
      },
    ];
  }

  patchValueForm() {
    this.searchForm.patchValue({
      ProductName: "",
      ProductCode: "",
      ProductCategory: [],
      ProductUnit: [],
      MinimumInventoryQuantity: "",
    });
  }

  refreshFilter() {
    this.listProduct = [];
    this.myTable.reset();
    this.searchForm.reset();
    this.patchValueForm();
    this.resetTable();
    this.searchProduct();
  }

  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 8;
        this.rightColNumber = 4;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
  }

  resetTable() {
    this.filterGlobal = "";
    this.first = 0;
  }

  async getMasterdata() {
    let productName = "";
    let productCode = "";
    let listVendor: Array<string> = [];
    this.loading = true;
    let [masterDataResult, searchResult]: any = await Promise.all([
      this.productService.getListProduct(0),
      this.productService.searchProductAsync(0, productName, productCode),
    ]);
    if (
      masterDataResult.statusCode === 200 &&
      searchResult.statusCode === 200
    ) {
      this.listLoaiHinh = masterDataResult.listLoaiHinh;
      this.listProductCategory = masterDataResult.listProductCategory;
      // this.listVendor = masterDataResult.listVendor;
      this.listProduct = searchResult.productList;
      this.listUnit = masterDataResult.listUnit;
      this.listProperty = masterDataResult.listProperty;
      this.getAllCategory();
      this.loading = false; 
    } else if (masterDataResult.statusCode !== 200) {
      let mgs = {
        severity: "error",
        summary: "Thông báo",
        detail: masterDataResult.messageCode,
      };
      this.showMessage(mgs);
    } else if (searchResult.statusCode !== 200) {
      let mgs = {
        severity: "error",
        summary: "Thông báo",
        detail: searchResult.messageCode,
      };
      this.showMessage(mgs);
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

  async searchProduct() {
    let productName = this.searchForm.get("ProductName").value;
    let productCode = this.searchForm.get("ProductCode").value;
    let listProductCategory: Array<string> = [];
    let listVendor: Array<string> = [];
    let productCategoryFormValue: Array<ProductCategory> =
      this.searchForm.get("ProductCategory").value;
    productCategoryFormValue.forEach((e) => {
      listProductCategory.push(e.productCategoryId);
    });
    let vendorFormValue: Array<Vendor> = this.searchForm.get("Vendor")?.value;
    vendorFormValue?.forEach((e) => {
      listVendor.push(e.vendorId);
    });
    this.loading = true;
    let result: any = await this.productService.searchProductAsync(
      0,
      productName,
      productCode
    );
    this.loading = false;
    if (result.statusCode === 200) {
      this.listProduct = result.productList;
      this.resetTable(); //reset state of table
      if (this.listProduct.length == 0) {
        let mgs = {
          severity: "warn",
          summary: "Thông báo",
          detail: "Không tìm thấy sản phẩm nào!",
        };
        this.showMessage(mgs);
      }
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  goToCreate() {
    this.router.navigate(["/product/create", { type: 0 }]);
  }

  goToDetail(productId: string) {
    this.router.navigate([
      "/product/detail",
      { productId: productId, type: 0 },
    ]);
  }

  checkEnterPress(event: any) {
    if (event.code === "Enter") {
      // this.searchProduct();
    }
  }

  deleteProduct(productId: string) {
    this.confirmationService.confirm({
      message: "Bạn có chắc chắn muốn xóa?",
      accept: () => {
        this.loading = true;
        this.productService.updateActiveProduct(productId).subscribe(
          (response) => {
            this.loading = false;
            let result = <any>response;
            if (result.statusCode === 202 || result.statusCode === 200) {
              this.listProduct = this.listProduct.filter(
                (e) => e.productId !== productId
              );
              let mgs = {
                severity: "success",
                summary: "Thông báo",
                detail: "Xóa sản phẩm thành công",
              };
              this.showMessage(mgs);
            } else {
              let mgs = {
                severity: "error",
                summary: "Thông báo",
                detail: result.messageCode,
              };
              this.showMessage(mgs);
            }
          },
          () => (this.loading = false)
        );
      },
    });
  }

  showDialogImport() {
    this.displayDialog = true;
  }

  downloadTemplateExcel() {
    this.productService.downloadTemplateProduct().subscribe(
      (response) => {
        this.loading = false;
        const result = <any>response;
        if (
          (result.templateExcel != null && result.statusCode === 202) ||
          result.statusCode === 200
        ) {
          const binaryString = window.atob(result.templateExcel);
          const binaryLen = binaryString.length;
          const bytes = new Uint8Array(binaryLen);
          for (let idx = 0; idx < binaryLen; idx++) {
            const ascii = binaryString.charCodeAt(idx);
            bytes[idx] = ascii;
          }
          const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          const fileName = result.fileName + ".xls";
          //const fileName = result.nameFile  + ".xlsx";
          link.download = fileName;
          link.click();
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  async getAllCategory() {
    this.loading = true;
    let result: any = await this.categoryService.getAllCategoryAsync()
    if (result.statusCode == 200) {
      this.categoryTypeList = result.categoryTypeList;
      this.listUnitCategory = result.categoryTypeList.find(c => c.categoryTypeCode == 'DNH')?.categoryList ?? [];
      this.listNhomSPCategory = result.categoryTypeList.find(c => c.categoryTypeCode == 'NVL').categoryList ?? [];
    }
    this.loading = false;
  }

  chooseFile(event: any) {
    this.fileName = event.target.files[0].name;
    this.importFileExcel = event.target;
  }

  cancelFile() {
    $("#importFileProduct").val("");
    this.fileName = "";
  }

  validateFile(data) {
    this.messErrFile = [];
    this.cellErrFile = [];

    // data.forEach((row, i) => {
    //   if (i > 3) {
    //     if (
    //       (row[0] === null ||
    //         row[0] === undefined ||
    //         row[0].toString().trim() == "") &&
    //       (row[1] === null ||
    //         row[1] === undefined ||
    //         row[1].toString().trim() == "")
    //     ) {
    //       this.messErrFile.push(
    //         "Dòng { " + (i + 3) + " } chưa nhập Mã sp hoặc Tên sản phẩm!"
    //       );
    //     }
    //     if (row[2] === null || row[2] === undefined || row[2] == "") {
    //       this.messErrFile.push(
    //         "Cột đơn vị tính tại dòng " + (i + 2) + " không được để trống"
    //       );
    //     }
    //     if (
    //       parseFloat(row[5]) == undefined ||
    //       parseFloat(row[5]).toString() == "NaN" ||
    //       parseFloat(row[5]) == null
    //     ) {
    //       this.messErrFile.push(
    //         "Thời gian bảo hành tại dòng" + (i + 2) + " sai định dạng"
    //       );
    //     }
    //     if (
    //       parseFloat(row[8]) == undefined ||
    //       parseFloat(row[8]).toString() == "NaN" ||
    //       parseFloat(row[8]) == null
    //     ) {
    //       this.messErrFile.push(
    //         "Thuế GTGT tại dòng " + (i + 2) + " sai định dạng"
    //       );
    //     }
    //     if (
    //       parseFloat(row[9]) == undefined ||
    //       parseFloat(row[9]).toString() == "NaN" ||
    //       parseFloat(row[9]) == null
    //     ) {
    //       this.messErrFile.push(
    //         "Thuế nhập khẩu mặc định tại dòng " + (i + 2) + " sai định dạng"
    //       );
    //     }
    //     if (row[13] === null || row[13] === undefined || row[13] == "") {
    //       this.messErrFile.push(
    //         "Nhóm SP/DV tại dòng " + (i + 2) + " không được để trống"
    //       );
    //     }
    //   }
    // });
    if (this.messErrFile.length != 0) return true;
    else return false;
  }

  onClickImportBtn(event: any) {
    event.target.value = "";
  }

  async importExcel() {
    if (this.fileName == "") {
      let mgs = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Chưa chọn file cần nhập",
      };
      this.showMessage(mgs);
      return;
    }
    const targetFiles: DataTransfer = <DataTransfer>this.importFileExcel;
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(targetFiles.files[0]);

    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: "binary" });

      let code = workbook.SheetNames[0];

      if (!workbook.Sheets[code]) {
        let msg: {
          severity: "error";
          summary: "Thông báo:";
          detail: "File không hợp lệ";
        };
        this.showMessage(msg);
        return;
      }

      // lấy data từ file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];

      /* save data */
      let listImport: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, {
        header: 1,
      });
      listImport = listImport.filter((e, index) => index != 0);
      
      listImport.shift();  
      let listProductImport: Array<DetailProductModel> = [];
      if (listImport && listImport.length > 0) {
        listImport.length &&
          listImport.forEach((_rawData) => {
            let product = new DetailProductModel();
            product.productCode = _rawData[0]
              ? _rawData[0].toString().trim()
              : "";
            
            product.accountingCode = _rawData[1]
              ? _rawData[1].toString().trim()
              : "";
            product.productCategoryName = _rawData[2]
            product.productName = _rawData[3]
              ? _rawData[3].toString().trim()
              : "";
            product.productUnitName = _rawData[4]
            product.minimumInventoryQuantity = _rawData[5]
              ? parseInt(_rawData[5].toString().trim().split(",").join(""))
              : null;
            product.listVendorName = _rawData[6]
              ? _rawData[6].toString().trim()
              : "";
            
            product.productUnitId = this.listUnitCategory.find(c => c.categoryName.trim().toLowerCase() === product.productUnitName?.trim().toLowerCase())?.categoryId;
            // product.listVendorName = this.listVendor.find(c => c.vendorName.trim().toLowerCase() === product.listVendorName?.trim().toLowerCase())?.vendorId;
            product.vendorId = this.listVendor.find(c => c.vendorName.trim().toLowerCase() === product.listVendorName?.trim().toLowerCase())?.vendorId;

            product.productCategoryId = this.listNhomSPCategory.find(
              (c) =>
                c.categoryName.trim().toLowerCase() ===
                product.productCategoryName?.trim().toLowerCase()
            )?.categoryId;
            
            listProductImport.push(product);
          });
        this.displayDialog = false;
        this.openDetailImportDialog(listProductImport);
      }
    }
  }

  openDetailImportDialog(listProductImport: Array<any>) {
    let ref = this.dialogService.open(ImportExcelNvlComponent, {
      data: {
        listProductNVLImport: listProductImport,
      },
      header: 'Import nguyên vật liệu',
      width: '85%',
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px"
      }
    });
    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result?.status) {
          this.getMasterdata();
        }
      }
    });

  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  exportExcel() {
    let dateUTC = new Date();
    // getMonth() trả về index trong mảng nên cần cộng thêm 1
    let title =
      "Danh sách sản phẩm dịch vụ " +
      dateUTC.getDate() +
      "_" +
      (dateUTC.getMonth() + 1) +
      "_" +
      dateUTC.getUTCFullYear();
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet("Sheet1");
    worksheet.pageSetup.margins = {
      left: 0.25,
      right: 0.25,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    };
    worksheet.pageSetup.paperSize = 9; //A4 : 9

    let dataRow1 = [];
    dataRow1[1] = `    `;
    let row1 = worksheet.addRow(dataRow1);
    row1.font = { name: "Arial", size: 18, bold: true };
    row1.alignment = {
      vertical: "bottom",
      horizontal: "center",
      wrapText: true,
    };

    let dataRow2 = [];
    dataRow2[1] = `    `;
    dataRow2[3] = `Danh sách sản phẩm dịch vụ`;
    let row2 = worksheet.addRow(dataRow2);
    row2.font = { name: "Arial", size: 18, bold: true };
    worksheet.mergeCells(`C${row2.number}:D${row2.number}`);
    row2.alignment = {
      vertical: "bottom",
      horizontal: "center",
      wrapText: true,
    };

    worksheet.addRow([]);

    // let dataRow4 = [];
    // dataRow4[2] = `- Các cột màu đỏ là các cột bắt buộc nhập
    // - Các cột có ký hiệu (*) là các cột bắt buộc nhập theo điều kiện`
    // let row4 = worksheet.addRow(dataRow4);
    // row4.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    // row4.alignment = { vertical: 'bottom', horizontal: 'left', wrapText: true };

    // worksheet.addRow([]);

    /* Header row */
    let dataHeaderRow = [
      "STT",
      "Mã sản phẩm",
      "Tên sản phẩm/Mô tả",
      "Nhóm sản phẩm dịch vụ",
      "Nhà cung cấp",
      "Đơn vị tính",
      "Tính chất",
      "Cách tính giá tồn kho",
    ];
    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: "Arial", size: 10, bold: true };
    dataHeaderRow.forEach((item, index) => {
      headerRow.getCell(index + 1).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      headerRow.getCell(index + 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      headerRow.getCell(index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "8DB4E2" },
      };
    });
    headerRow.height = 40;

    this.listProduct.forEach((item, index) => {
      let productCode = item.productCode;
      let productName = item.productName;
      let productCategoryName = item.productCategoryName;
      let vendorName = item.listVendorName;
      let productUnitName = item.productUnitName;
      let propertyName = item.propertyName;
      let calculateInventoryPricesName = item.calculateInventoryPricesName;
      /* Header row */
      let dataHeaderRowIndex = [
        index + 1,
        productCode,
        productName,
        productCategoryName,
        vendorName,
        productUnitName,
        propertyName,
        calculateInventoryPricesName,
      ];
      let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
      headerRowIndex.font = { name: "Arial", size: 10 };
      dataHeaderRowIndex.forEach((item, index) => {
        headerRowIndex.getCell(index + 1).border = {
          left: { style: "thin" },
          top: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        headerRowIndex.getCell(index + 1).alignment = {
          vertical: "top",
          horizontal: "left",
          wrapText: true,
        };
      });
      // headerRowIndex.height = 40;
    });

    worksheet.addRow([]);
    worksheet.getRow(2).height = 47;
    worksheet.getRow(4).height = 30;
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 50;
    worksheet.getColumn(4).width = 50;
    worksheet.getColumn(5).width = 50;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 30;

    this.exportToExel(workbook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs.saveAs(blob, fileName);
    });
  }
}
