import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  Renderer2,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { MessageService, ConfirmationService } from "primeng/api";
import { Table } from "primeng/table";
import { ProductService } from "../../services/product.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { GetPermission } from "../../../shared/permission/get-permission";
import {
  CategoryModel,
  DetailProductModel,
  OrganizationModel,
  productLoaiHinhKinhDoanhModel,
  ProductModel2,
} from "../../models/product.model";

import * as $ from "jquery";
import * as XLSX from "xlsx";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { DialogService } from "primeng";
import { ImportExcelThanhphamComponent } from "../import-excel-thanhpham/import-excel-thanhpham.component";
import { CategoryService } from "../../../shared/services/category.service";

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
  selector: "app-list-thanhpham",
  templateUrl: "./list-thanhpham.component.html",
  styleUrls: ["./list-thanhpham.component.css"],
})
export class ListThanhphamComponent implements OnInit {
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
  listLoaiHinh: Array<productLoaiHinhKinhDoanhModel> = [];

  //master data
  listProductCategory: Array<ProductCategory> = [];
  listProduct: Array<Product> = [];

  listUnit: Array<CategoryModel> = [];
  listProperty: Array<CategoryModel> = [];
  listOrganization: Array<OrganizationModel> = [];
  listStageGroup: Array<CategoryModel> = [];

  listOrganizationCategory: Array<any> = [];
  listProductEntityCategory: Array<any> = [];

  // get category
  categoryTypeList: any;

  listNhomTpCategory: Array<any> = [];
  listUnitCategory: Array<any> = [];
  listDepartmentCategory: Array<any> = [];
  listNVLCategory: Array<any> = [];
  
  //table
  rows: number = 10;
  colsListProduct: any;
  colsListThanhPham: any;
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
  // Th??ng b??o l???i
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
      ProductCategory: new FormControl([]),
      ProductUnit: new FormControl([]),
      MinimumInventoryQuantity: new FormControl([]),
    });
  }

  initTable() {
    this.colsListThanhPham = [
      {
        field: "STT",
        header: "STT",
        textAlign: "center",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productCode",
        header: "M?? th??nh ph???m",
        textAlign: "center",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productName",
        header: "T??n th??nh ph???m",
        textAlign: "left",
        display: "table-cell",
        width: "20px",
      },
      {
        field: "productUnitName",
        header: "????n v??? t??nh",
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
    // this.searchProduct();
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
      this.productService.getListProduct(1),
      this.productService.searchProductAsync(1, productName, productCode),
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
      // this.listPriceInventory = masterDataResult.listPriceInventory;
      this.listProperty = masterDataResult.listProperty;
      this.getAllCategory();
      this.loading = false;
    } else if (masterDataResult.statusCode !== 200) {
      let mgs = {
        severity: "error",
        summary: "Th??ng b??o",
        detail: masterDataResult.messageCode,
      };
      this.showMessage(mgs);
    } else if (searchResult.statusCode !== 200) {
      let mgs = {
        severity: "error",
        summary: "Th??ng b??o",
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
    let vendorFormValue: Array<Vendor> = this.searchForm.get("Vendor").value;
    vendorFormValue.forEach((e) => {
      listVendor.push(e.vendorId);
    });
    this.loading = true;
    let result: any = await this.productService.searchProductAsync(
      1,
      productName,
      productCode
    );
    if (result.statusCode === 200) {
      this.listProduct = result.productList;
      this.resetTable(); //reset state of table
      this.loading = false;
      if (this.listProduct.length == 0) {
        let mgs = {
          severity: "warn",
          summary: "Th??ng b??o",
          detail: "Kh??ng t??m th???y s???n ph???m n??o!",
        };
        this.showMessage(mgs);
      }
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  goToCreate() {
    this.router.navigate(["/product/thanhpham"]);
  }

  goToDetail(productId: string) {
    this.router.navigate([
      "/product/detail-thanhpham",
      { productId: productId },
    ]);
  }

  checkEnterPress(event: any) {
    if (event.code === "Enter") {
      // this.searchProduct();
    }
  }

  async getListCategory() {
    this.loading = true;
    let result: any = await this.productService.getMasterdataCreateProduct(1);
    if (result.statusCode == 200) {
      this.listOrganizationCategory = result.listOrganization.find(c => c.organizationId)
      this.listProductEntityCategory = result.listProductEntityModel.find(c => c.productId);
    }
    this.loading = false;
  }

  async getAllCategory() {
   
    this.loading = true;
    let result: any = await this.categoryService.getAllCategoryAsync();
    if (result.statusCode == 200) {
      this.categoryTypeList = result.categoryTypeList;
      this.listNhomTpCategory = result.categoryTypeList.find(c => c.categoryTypeCode == 'TP')?.categoryList ?? [];
      this.listUnitCategory = result.categoryTypeList.find(c => c.categoryTypeCode == 'DNH')?.categoryList ?? [];
    }
    this.loading = false;
  }

  deleteProduct(productId: string) {
    this.confirmationService.confirm({
      message: "B???n c?? ch???c ch???n mu???n x??a?",
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
                summary: "Th??ng b??o",
                detail: "X??a s???n ph???m th??nh c??ng",
              };
              this.showMessage(mgs);
            } else {
              let mgs = {
                severity: "error",
                summary: "Th??ng b??o",
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
    this.productService.downloadTemplateProductTP().subscribe(
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
  /* end */

  chooseFile(event: any) {
    this.fileName = event.target.files[0].name;
    this.importFileExcel = event.target;

    // this.getInforDetailQuote();
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
    //         "D??ng { " + (i + 3) + " } ch??a nh???p M?? sp ho???c T??n s???n ph???m!"
    //       );
    //     }
    //     if (row[2] === null || row[2] === undefined || row[2] == "") {
    //       this.messErrFile.push(
    //         "C???t ????n v??? t??nh t???i d??ng " + (i + 2) + " kh??ng ???????c ????? tr???ng"
    //       );
    //     }
    //     if (
    //       parseFloat(row[5]) == undefined ||
    //       parseFloat(row[5]).toString() == "NaN" ||
    //       parseFloat(row[5]) == null
    //     ) {
    //       this.messErrFile.push(
    //         "Th???i gian b???o h??nh t???i d??ng" + (i + 2) + " sai ?????nh d???ng"
    //       );
    //     }
    //     if (
    //       parseFloat(row[8]) == undefined ||
    //       parseFloat(row[8]).toString() == "NaN" ||
    //       parseFloat(row[8]) == null
    //     ) {
    //       this.messErrFile.push(
    //         "Thu??? GTGT t???i d??ng " + (i + 2) + " sai ?????nh d???ng"
    //       );
    //     }
    //     if (
    //       parseFloat(row[9]) == undefined ||
    //       parseFloat(row[9]).toString() == "NaN" ||
    //       parseFloat(row[9]) == null
    //     ) {
    //       this.messErrFile.push(
    //         "Thu??? nh???p kh???u m???c ?????nh t???i d??ng " + (i + 2) + " sai ?????nh d???ng"
    //       );
    //     }
    //     if (row[13] === null || row[13] === undefined || row[13] == "") {
    //       this.messErrFile.push(
    //         "Nh??m SP/DV t???i d??ng " + (i + 2) + " kh??ng ???????c ????? tr???ng"
    //       );
    //     }
    //   }
    // });
    if (this.messErrFile.length != 0) return true;
    else return false;
  }

  async importExcel() {
    if (this.fileName == "") {
      let mgs = {
        severity: "error",
        summary: "Th??ng b??o:",
        detail: "Ch??a ch???n file c???n nh???p",
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
          summary: "Th??ng b??o:";
          detail: "File kh??ng h???p l???";
        };
        this.showMessage(msg);
        return;
      }

      // l???y data t??? file excel
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
            product.productCategoryName = _rawData[1];
            // ? _rawData[2].toString().trim()
            // : "";
            product.productName = _rawData[2]
              ? _rawData[2].toString().trim()
              : "";
            product.productUnitName = _rawData[3];
            // ? _rawData[4].toString().trim()
            // : "";
            product.departmentName = _rawData[4];
            product.referencedName = _rawData[5];

            // lay id luu vao db
            product.productCategoryId = this.listNhomTpCategory.find(c => c.categoryName.trim().toLowerCase() ===
              product.productCategoryName?.trim().toLowerCase())?.categoryId;
            product.productUnitId = this.listUnitCategory.find(c => c.categoryName.trim().toLowerCase() === product.productUnitName?.trim().toLowerCase())?.categoryId;
            product.department = this.listOrganizationCategory.find(c => c.organizationName.trim().toLowerCase() === product.departmentName?.trim().toLowerCase())?.organizationId;
            product.referencedId = this.listProductEntityCategory.find(c => c.productName.trim().toLowerCase() === product.referencedName?.trim().toLowerCase())?.productId;      

            listProductImport.push(product);
          });
        this.displayDialog = false;
        this.openDetailImportDialog(listProductImport);
      }
    };
  }

  openDetailImportDialog(listProductImport: Array<any>) {
    let ref = this.dialogService.open(ImportExcelThanhphamComponent, {
      data: {
        listProductTPImport: listProductImport,
      },
      header: "Import th??nh ph???m",
      width: "85%",
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px",
      },
    });
    ref.onClose.subscribe((result: any) => {
      if (result?.status) {
        this.getMasterdata();
      }
    });
  }

  onClickImportBtn(event: any) {
    event.target.value = "";
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  exportExcel() {
    let dateUTC = new Date();
    // getMonth() tr??? v??? index trong m???ng n??n c???n c???ng th??m 1
    let title =
      "Danh s??ch s???n ph???m d???ch v??? " +
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
    dataRow2[3] = `Danh s??ch s???n ph???m d???ch v???`;
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
    // dataRow4[2] = `- C??c c???t m??u ????? l?? c??c c???t b???t bu???c nh???p
    // - C??c c???t c?? k?? hi???u (*) l?? c??c c???t b???t bu???c nh???p theo ??i???u ki???n`
    // let row4 = worksheet.addRow(dataRow4);
    // row4.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    // row4.alignment = { vertical: 'bottom', horizontal: 'left', wrapText: true };

    // worksheet.addRow([]);

    /* Header row */
    let dataHeaderRow = [
      "STT",
      "M?? s???n ph???m",
      "T??n s???n ph???m/M?? t???",
      "Nh??m s???n ph???m d???ch v???",
      "Nh?? cung c???p",
      "????n v??? t??nh",
      "T??nh ch???t",
      "C??ch t??nh gi?? t???n kho",
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
