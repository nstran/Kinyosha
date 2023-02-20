import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
//service
import { VendorService } from "../../../../vendor/services/vendor.service";
import { WarehouseService } from "../../../services/warehouse.service";
import { CategoryService } from "../../../../shared/services/category.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { ProductService } from "../../../../product/services/product.service";
import { GetPermission } from "../../../../shared/permission/get-permission";
import { Observable } from "rxjs";

import { ConfirmationService, MessageService } from "primeng/api";
import { SortEvent } from "primeng/api";
import { Table } from "primeng/table";
import { DatePipe } from "@angular/common";
import * as moment from "moment";
import "moment/locale/pt-br";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";


@Component({
  selector: "app-inventory-delivery-voucher-list",
  templateUrl: "./inventory-delivery-voucher-list.component.html",
  styleUrls: ["./inventory-delivery-voucher-list.component.css"],
})
export class InventoryDeliveryVoucherListComponent implements OnInit {
  innerWidth: number = 0; //number window size first
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    //if (this.innerWidth < )
  }
  @ViewChild("myTable") myTable: Table;
  @ViewChild("myTableCCDC") myTableCCDC: Table;
  @ViewChild("myTableNVL1") myTableNVL1: Table;

  @ViewChild("inventoryCreateDate")
  private inventoryCreateDateCalendar: any;
  @ViewChild("inventoryReceivingDate")
  private inventoryReceivingDateCalendar: any;

  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  actionAdd: boolean = true;
  actionDelete: boolean = true;

  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listCategoryId: Array<string> = [];
  cols: any[];
  listInventoryDeliveryVoucher: Array<any> = [];

  chiTietSanPhamPhieuXuatKhos: Array<any> = [];

  visibleSidebar2: Boolean = false;

  displayTypeNVL: number;
  displayCCDC: number;

  voucherCode: string = "";
  serial: string = "";

  data: number;
  loaiVL: number;

  statuses: Array<any> = [];
  statuses1: Array<any> = [];
  statuses2: Array<any> = [];

  statusesx: Array<any> = [];
  statuses1x: Array<any> = [];
  statuses2x: Array<any> = [];

  fromDate: Date = new Date();
  toDate: Date = new Date();

  listStatus: Array<any> = [];
  listStatusSelected: Array<any> = [];
  listStatusSelectedId: Array<any> = [];

  listWarehouse: Array<any> = [];
  listWarehouseSelected: Array<any> = [];
  listWarehouseSelectedId: Array<any> = [];

  listCreateVoucher: Array<any> = [];
  listCreateVoucherSelected: Array<any> = [];
  listCreateVoucherSelectedId: Array<any> = [];

  listStorekeeper: Array<any> = [];
  listStorekeeperSelected: Array<any> = [];
  listStorekeeperSelectedId: Array<any> = [];

  listCustomer: Array<any> = [];
  listVendorSelected: Array<any> = [];
  listVendorSelectedId: Array<any> = [];

  listProduct: Array<any> = [];
  listProductSelected: Array<any> = [];
  listProductSelectedId: Array<any> = [];

  listCreateDate: Date[];
  listInventoryReceivingDate: Date[];

  SumRow: number = 0;
  currentDate: Date;

  xuatKhoForm: FormGroup;
  colsListXuatKho: any;
  colsTheoNVL: any;
  dataList: Array<any> = [];
  dataListCCDC: Array<any> = [];

  createParameterForm: FormGroup;
  voucherCodeControl: FormControl;
  createDateControl: FormControl;
  inventoryDeliveryDate: FormControl;
  statusControl: FormControl;
  warehouseControl: FormControl;
  createVoucherControl: FormControl;
  storekeeperControl: FormControl;
  vendorControl: FormControl;
  productControl: FormControl;
  serialControl: FormControl;

  warehouseType: number = 0;
  productType: number;

  monthDate: Date = new Date();

  rows: number = 10;

  filterGlobal: string = "";

  first: number = 0;

  selectedColumn: Array<any> = [];

  constructor(
    private warehouseService: WarehouseService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private vendorService: VendorService,
    private productService: ProductService,
    public messageService: MessageService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {
    this.route.params.subscribe((params) => {
      if (params["WarehouseType"]) {
        this.warehouseType = params["WarehouseType"];
      }
      if (params["ProductType"]) {
        this.productType = params["ProductType"];
      }
    });
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.getFormControl();
    let resource = "war/warehouse/inventory-delivery-voucher/list";
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

      this.colsListXuatKho = [
        {
          field: "STT",
          header: "STT",
          width: "10px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "inventoryDeliveryVoucherCode",
          header: "Mã số",
          width: "45px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "inventoryDeliveryVoucherTypeText",
          header: "Loại phiếu",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "employeeDepartment",
          header: "Bộ phận",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "inventoryDeliveryVoucherDate",
          header: "Ngày xuất",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "nameStatus",
          header: "Trạng thái",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "thaoTac",
          header: "Thao tác",
          width: "10px",
          textAlign: "center",
          display: "table-cell",
        },
      ];
      this.colsTheoNVL = [
        {
          field: "maTheKho",
          header: "Mã thẻ kho",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "boPhan",
          header: "Bộ phận",
          width: "100px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "ngayXuat",
          header: "Ngày xuất",
          width: "80px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "productName",
          header: "Mã chi tiết",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "productUnitName",
          header: "ĐVT",
          width: "100px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "quantity",
          header: "Số lượng xuất",
          width: "100px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "productCategoryName",
          header: "Loại hàng",
          width: "100px",
          textAlign: "center",
          display: "table-cell",
        },
      ];
      this.loading = true;
      await this.getMasterData();
    }
  }

  setDefaultValue() {
    let date = new Date();
    this.fromDate = new Date(date.setMonth(date.getMonth(), 1));
    this.displayTypeNVL = 1;
    this.displayCCDC = 1;
  }

  onDateSelect(value) {
    if (this.displayTypeNVL == 0 && this.warehouseType == 0) {
      this.myTable.filter(
        this.formatDate(value),
        "inventoryDeliveryVoucherDateString",
        "equals"
      );
    } else if (this.displayTypeNVL == 1 && this.warehouseType == 0) {
      this.myTableNVL1.filter(this.formatDate(value), "ngayXuat", "equals");
    } else if (this.displayCCDC == 1 && this.warehouseType == 1) {
      this.myTableCCDC.filter(this.formatDate(value), "ngayXuat", "equals");
    }
  }

  formatDate(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
      month = "0" + month;
    }

    if (day < 10) {
      day = "0" + day;
    }

    return day + "/" + month + "/" + date.getFullYear();
  }

  async searchPhieuXuat() {
    this.loading = true;
    this.dataList = [];
    this.chiTietSanPhamPhieuXuatKhos = [];
    let result: any =
      await this.warehouseService.searchInventoryDeliveryVoucherNVLCCDCAsync(
        this.warehouseType,
        convertToUTCTime(new Date(this.fromDate)),
        convertToUTCTime(new Date(this.toDate))
      );
    if (result.statusCode == 200) {
      this.dataList = result.lstResult;

      this.dataList.forEach((item) => {
        if (
          item.inventoryDeliveryVoucherDate == null ||
          item.inventoryDeliveryVoucherDate == undefined
        ) {
          item.inventoryDeliveryVoucherDateString = null;
        } else {
          item.inventoryDeliveryVoucherDateString = this.formatDate(
            new Date(item.inventoryDeliveryVoucherDate)
          );
        }
      });

      this.statuses = [];
      this.statuses1 = [];
      this.statuses2 = [];
      let list = [];
      let list1 = [];
      let list2 = [];

      this.statusesx = [];
      this.statuses1x = [];
      this.statuses2x = [];
      let listx = [];
      let list1x = [];
      let list2x = [];

      result.chiTietSanPhamPhieuXuatKhos.forEach((x) => {
        let data = {
          productId: x.productId,
          maTheKho: null,
          boPhan: x.organizationName,
          ngayXuat: formatDatetime(new Date(x.ngayXuat)),
          productName: x.productName,
          productUnitName: x.productUnitName,
          quantity: x.quantity,
          productCategoryName: x.productCategoryName,
          inventoryDeliveryVoucherId: x.inventoryDeliveryVoucherId,
        };

        this.chiTietSanPhamPhieuXuatKhos.push(data);
      });
      this.chiTietSanPhamPhieuXuatKhos.forEach((x) => {
        let data = { value: x.productUnitName, label: x.productUnitName };
        if (data.value != null) list.push(data);

        let data1 = { value: x.boPhan, label: x.boPhan };
        if (data1.value != null) list1.push(data1);

        let data2 = {
          value: x.productCategoryName,
          label: x.productCategoryName,
        };
        if (data2.value != null) list2.push(data2);

        if (x.ngayXuat == null || x.ngayXuat == undefined) {
          x.ngayXuatSring = null;
        } else {
          x.ngayXuatSring = this.formatDate(new Date(x.ngayXuat));
        }

        if (x.ngayXuat == null || x.ngayXuat == undefined) {
          x.ngayXuatSringCCDC = null;
        } else {
          x.ngayXuatSringCCDC = this.formatDate(new Date(x.ngayXuat));
        }
      });
      this.gopData(list, list1, list2);

      this.dataList.forEach((x) => {
        let datax = {
          value: x.inventoryDeliveryVoucherTypeText,
          label: x.inventoryDeliveryVoucherTypeText,
        };
        if (datax.value != null) listx.push(datax);
        let data1x = {
          value: x.employeeDepartment,
          label: x.inventoryDeliveryVoucherTypeText,
        };
        if (data1x.value != null) list1x.push(data1x);
        let data2x = { value: x.nameStatus, label: x.nameStatus };
        if (data2x.value != null) list2x.push(data2x);
      });
      this.gopData2(listx, list1x, list2x);
      this.loading = false;
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: result.messageCode,
      };
      this.showMessage(msg);
    }
    this.loading = false;
  }

  gopData2(datax, data1x, data2x) {
    let listId = [];
    let listIdUni = [];
    datax.forEach((x) => {
      listId.push(x.value);
    });

    for (var i = 0; i < listId.length; i++) {
      if (listIdUni.indexOf(listId[i]) === -1) {
        listIdUni.push(listId[i]);
      }
    }
    listIdUni.forEach((x) => {
      let a = { value: x, label: x };
      this.statusesx.push(a);
    });

    let listId1 = [];
    let listIdUni1 = [];
    data1x.forEach((x) => {
      listId1.push(x.value);
    });

    for (var i = 0; i < listId1.length; i++) {
      if (listIdUni1.indexOf(listId1[i]) === -1) {
        listIdUni1.push(listId1[i]);
      }
    }
    listIdUni1.forEach((x) => {
      let a = { value: x, label: x };
      this.statuses1x.push(a);
    });

    let listId2 = [];
    let listIdUni2 = [];
    data2x.forEach((x) => {
      listId2.push(x.value);
    });

    for (var i = 0; i < listId2.length; i++) {
      if (listIdUni2.indexOf(listId2[i]) === -1) {
        listIdUni2.push(listId2[i]);
      }
    }
    listIdUni2.forEach((x) => {
      let a = { value: x, label: x };
      this.statuses2x.push(a);
    });
  }

  NVL() {
    this.chiTietSanPhamPhieuXuatKhos = [];
    this.searchPhieuXuat();
  }

  gopData(data, data1, data2) {
    let listId = [];
    let listIdUni = [];
    data.forEach((x) => {
      listId.push(x.value);
    });

    for (var i = 0; i < listId.length; i++) {
      if (listIdUni.indexOf(listId[i]) === -1) {
        listIdUni.push(listId[i]);
      }
    }
    listIdUni.forEach((x) => {
      let a = { value: x, label: x };
      this.statuses.push(a);
    });

    let listId1 = [];
    let listIdUni1 = [];
    data1.forEach((x) => {
      listId1.push(x.value);
    });

    for (var i = 0; i < listId1.length; i++) {
      if (listIdUni1.indexOf(listId1[i]) === -1) {
        listIdUni1.push(listId1[i]);
      }
    }
    listIdUni1.forEach((x) => {
      let a = { value: x, label: x };
      this.statuses1.push(a);
    });

    let listId2 = [];
    let listIdUni2 = [];
    data2.forEach((x) => {
      listId2.push(x.value);
    });

    for (var i = 0; i < listId2.length; i++) {
      if (listIdUni2.indexOf(listId2[i]) === -1) {
        listIdUni2.push(listId2[i]);
      }
    }
    listIdUni2.forEach((x) => {
      let a = { value: x, label: x };
      this.statuses2.push(a);
    });
  }

  maSoDetail(rowData) {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/detail",
      {
        inventoryDeliveryVoucherId: rowData.inventoryDeliveryVoucherId,
        warehouseType: this.warehouseType,
      },
    ]);
  }

  createInventoryVoucher() {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/warhousecreate-update",
    ]);
  }

  async getMasterData() {
    this.setDefaultValue();
    this.loading = true;
    this.searchPhieuXuat();
    this.loading = false;
  }

  getFormControl() {
    this.voucherCodeControl = new FormControl();
    this.createDateControl = new FormControl();
    this.inventoryDeliveryDate = new FormControl();
    this.statusControl = new FormControl();
    this.warehouseControl = new FormControl();
    this.createVoucherControl = new FormControl();
    this.vendorControl = new FormControl();
    this.productControl = new FormControl();
    this.serialControl = new FormControl();

    this.xuatKhoForm = new FormGroup({});
  }

  closePanelStatus() {
    this.listStatusSelectedId = [];
    let categoryList: any[] = [];
    this.listStatusSelected.forEach(function (item) {
      categoryList.push(item.categoryId);
    });
    this.listStatusSelectedId.push.apply(
      this.listStatusSelectedId,
      categoryList
    );
  }

  closePanelCreateVoucher() {
    this.listCreateVoucherSelectedId = [];
    let employeeIdArr: any[] = [];
    this.listCreateVoucherSelected.forEach(function (item) {
      employeeIdArr.push(item.employeeId);
    });
    this.listCreateVoucherSelectedId.push.apply(
      this.listCreateVoucherSelectedId,
      employeeIdArr
    );
  }

  closePanelStorekeeper() {
    this.listStorekeeperSelectedId = [];
    let storekeeperIdArr: any[] = [];
    this.listStorekeeperSelected.forEach(function (item) {
      storekeeperIdArr.push(item.employeeId);
    });
    this.listStorekeeperSelectedId.push.apply(
      this.listStorekeeperSelectedId,
      storekeeperIdArr
    );
  }

  closePanelVendor() {
    this.listVendorSelectedId = [];
    let vendorIdArr: any[] = [];
    this.listVendorSelected.forEach(function (item) {
      vendorIdArr.push(item.customerId);
    });
    this.listVendorSelectedId.push.apply(
      this.listVendorSelectedId,
      vendorIdArr
    );
  }

  goBack() {}

  closePanelProduct() {
    this.listProductSelectedId = [];
    let productIdArr: any[] = [];
    this.listProductSelected.forEach(function (item) {
      productIdArr.push(item.productId);
    });
    this.listProductSelectedId.push.apply(
      this.listProductSelectedId,
      productIdArr
    );
  }
  filterInventoryVoucher() {
    this.loading = true;

    if (this.listCreateDate != null) {
      if (this.listCreateDate.length == 2) {
        if (this.listCreateDate[1] == null) {
          this.listCreateDate[1] = this.listCreateDate[0];
        }
      }
    }
    if (this.listInventoryReceivingDate != null) {
      if (this.listInventoryReceivingDate.length == 2) {
        if (this.listInventoryReceivingDate[1] == null) {
          this.listInventoryReceivingDate[1] =
            this.listInventoryReceivingDate[0];
        }
      }
    }
    this.listStatusSelectedId = [];
    let categoryList: any[] = [];
    this.listStatusSelected.forEach(function (item) {
      categoryList.push(item.categoryId);
    });
    this.listStatusSelectedId.push.apply(
      this.listStatusSelectedId,
      categoryList
    );

    this.listCreateVoucherSelectedId = [];
    let employeeIdArr: any[] = [];
    this.listCreateVoucherSelected.forEach(function (item) {
      employeeIdArr.push(item.employeeId);
    });
    this.listCreateVoucherSelectedId.push.apply(
      this.listCreateVoucherSelectedId,
      employeeIdArr
    );

    // this.warehouseService
    //   .searchInventoryDeliveryVoucher(
    //     this.voucherCode,
    //     this.listStatusSelectedId,
    //     this.listWarehouseSelectedId,
    //     this.listCreateVoucherSelectedId,
    //     this.listStorekeeperSelectedId,
    //     this.listVendorSelectedId,
    //     this.listProductSelectedId,
    //     this.listCreateDate,
    //     this.listInventoryReceivingDate,
    //     this.serial,
    //     this.auth.UserId
    //   )
    //   .subscribe(
    //     (response2) => {
    //       let result2 = <any>response2;
    //       this.listInventoryReceivingVoucher = result2.lstResult;
    //       if (result2.lstResult == null) {
    //         this.listInventoryReceivingVoucher = [];
    //       }
    //       this.SumRow = this.listInventoryReceivingVoucher.length;
    //       this.currentDate = new Date();
    //       this.listInventoryReceivingVoucher.forEach(function (item) {
    //         switch (item.inventoryDeliveryVoucherType) {
    //           case 1:
    //             item.inventoryDeliveryVoucherTypeName = "Xuất bán hàng";
    //             break;
    //           case 2:
    //             item.inventoryDeliveryVoucherTypeName =
    //               "Xuất trả lại nhà cung cấp";
    //             break;
    //           case 3:
    //             item.inventoryDeliveryVoucherTypeName = "Xuất hàng biếu tặng";
    //             break;
    //           case 4:
    //             item.inventoryDeliveryVoucherTypeName = "Xuất hàng kiểm định";
    //             break;
    //           default:
    //             item.inventoryDeliveryVoucherTypeName = "Khác";
    //         }
    //       });

    //       if (this.listInventoryReceivingVoucher.length == 0) {
    //         this.messageService.clear();
    //         this.messageService.add({
    //           key: "info",
    //           severity: "info",
    //           summary: " Không tìm thấy phiếu xuất kho",
    //           detail: "Danh sách xuất kho",
    //         });
    //       }

    //       this.visibleSidebar2 = true;
    //       this.loading = false;
    //     },
    //     (error) => {}
    //   );
  }

  cancelFilter() {
    this.voucherCode = "";
    this.listStatusSelectedId = [];
    this.listWarehouseSelectedId = [];
    this.listCreateVoucherSelectedId = [];
    this.listStorekeeperSelectedId = [];
    this.listVendorSelectedId = [];
    this.listProductSelectedId = [];
    this.listCreateDate = [];
    this.listInventoryReceivingDate = [];
    this.serial = "";
  }

  createOrUpdateInventoryVoucher() {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/create-update",
    ]);
  }

  goDetails(rowData) {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/detail",
      {
        inventoryDeliveryVoucherId: rowData.inventoryDeliveryVoucherId,
        warehouseType: this.warehouseType,
      },
    ]);
  }

  resetTable() {
    this.filterGlobal = "";
    this.first = 0;
  }

  refreshFilter() {
    this.listInventoryDeliveryVoucher = [];
    this.myTableCCDC.reset();
    this.myTable.reset();
    this.resetTable();
    // this.theoNVL(data);
  }

  checkEnterPress(event: any) {}

  leftColNumber: number = 12;
  rightColNumber: number = 2;

  save(data, warehouseType) {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/create-update",
      {
        ProductType: data,
        WarehouseType: warehouseType,
      },
    ]);
  }

  showFilter() {
    if (this.innerWidth < 1423) {
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
  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];

      ///**Customize sort  */
      //if (event.field == 'nameVendor') {

      //  let value1 = data1['vedorName'];
      //  let value2 = data2['vedorName'];
      //  let result = null;
      //  if (value1 == null && value2 != null)
      //    result = -1;
      //  else if (value1 != null && value2 == null)
      //    result = 1;
      //  else if (value1 == null && value2 == null)
      //    result = 0;
      //  else if (typeof value1 === 'string' && typeof value2 === 'string')
      //    result = value1.localeCompare(value2);
      //  else
      //    result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      //  return (event.order * result);
      //}

      //if (event.field == 'productName') {

      //  let value1 = data1['nameObject'];
      //  let value2 = data2['nameObject'];
      //  let result = null;
      //  if (value1 == null && value2 != null)
      //    result = -1;
      //  else if (value1 != null && value2 == null)
      //    result = 1;
      //  else if (value1 == null && value2 == null)
      //    result = 0;
      //  else if (typeof value1 === 'string' && typeof value2 === 'string')
      //    result = value1.localeCompare(value2);
      //  else
      //    result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      //  return (event.order * result);
      //}

      /**End */

      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === "string" && typeof value2 === "string")
        result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order * result;
    });
  }

  xoaData(data) {
    if (data.inventoryDeliveryVoucherId) {
      this.confirmationService.confirm({
        message: "Bạn có chắc chắn muốn xóa phiếu này?",
        accept: () => {
          this.loading = true;
          this.warehouseService
            .deleteInventoryDeliveryVoucher(data.inventoryDeliveryVoucherId)
            .subscribe(
              (response) => {
                let result: any = response;
                if (result.statusCode == 200) {
                  let msg = {
                    severity: "success",
                    summary: "Thông báo:",
                    detail: result.messageCode,
                  };
                  this.showMessage(msg);
                  this.getMasterData();
                } else {
                  if (result.statusCode == 200) {
                    let msg = {
                      severity: "error",
                      summary: "Thông báo:",
                      detail: result.messageCode,
                    };
                    this.showMessage(msg);
                  }
                }
              },
              () => (this.loading = false)
            );
        },
      });
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  pageChange(event: any) {}
  goToDetailObject(rowData: any) {
    if (rowData.inventoryDeliveryVoucherType == 2) {
      this.router.navigate([
        "/vendor/detail",
        { vendorId: rowData.vendorId, contactId: this.emptyGuid },
      ]);
    } else {
      this.router.navigate([
        "/customer/detail",
        { customerId: rowData.vendorId, contactId: this.emptyGuid },
      ]);
    }
  }

  goOrder(rowData: any) {
    if (rowData.inventoryDeliveryVoucherType == 1) {
      this.goToCustomerOrderDetail(rowData);
    } else if (rowData.inventoryDeliveryVoucherType == 2) {
      this.goToVendorOrderDetail(rowData);
    }
  }
  goToCustomerOrderDetail(resource: any) {
    this.router.navigate([
      "/order/order-detail",
      { customerOrderID: resource.objectId },
    ]);
  }
  goToVendorOrderDetail(resource: any) {
    this.router.navigate([
      "/vendor/detail-order",
      { vendorOrderId: resource.objectId },
    ]);
  }
  onDatesRangeinventoryCreateDateCalendar(selectedValue: Date) {
    if (this.listCreateDate[1]) {
      // If second date is selected
      this.inventoryCreateDateCalendar.hideOverlay();
    }
  }

  onDatesRangeinventoryReceivingDate(selectedValue: Date) {
    if (this.listInventoryReceivingDate[1]) {
      // If second date is selected
      this.inventoryReceivingDateCalendar.hideOverlay();
    }
  }

  selectTab(event) {
    this.warehouseType = event.index;
    this.searchPhieuXuat();
  }

  exportExcel() {
    if (this.selectedColumn.length > 0) {
      if (this.colsTheoNVL.length > 0) {
        this.loading = true;
        let title = "Xuất-Vật liệu";
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(title);

        worksheet.addRow([]);

        // dòng chữ đầu tiên trong file excel
        let line1 = [
          "",
          "",
          "XUẤT KHO NGUYÊN VẬT LIỆU THÁNG " +
            formatDate(this.fromDate, "/", true),
        ];
        let lineRow1 = worksheet.addRow(line1);
        lineRow1.font = { name: "Times New Roman", size: 13, bold: true };
        lineRow1.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 40;
        // worksheet.mergeCells(`A${lineRow1.number}:F${lineRow1.number}`);

        // dòng thứ
        let line2 = ["", "", "NGUYÊN VẬT LIỆU"];
        let lineRow2 = worksheet.addRow(line2);
        lineRow2.font = { name: "Times New Roman", size: 13, bold: true };
        lineRow2.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow2.height = 30;
        worksheet.addRow([]);

        /* Header row */
        let dataheaderRow = [
          "PNK",
          "BP",
          "Ngày xuất",
          "Mã chi tiết",
          "ĐVT",
          "Số lượng xuất",
        ];
        let headerRow = worksheet.addRow(dataheaderRow);
        headerRow.font = { name: "Times New Roman", size: 13, bold: true };
        dataheaderRow.forEach((item, index) => {
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
        headerRow.height = 30;

        this.selectedColumn.forEach((item, index) => {
          let dataHeaderRowIndex = [
            "",
            item.boPhan,
            item.ngayXuat,
            // formatDate(item.ngayXuat, "/", false),
            item.productName,
            item.productUnitName,
            item.quantity,
          ];

          console.log(this.chiTietSanPhamPhieuXuatKhos);

          let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
          headerRowIndex.font = { name: "Times New Roman", size: 13 };
          dataHeaderRowIndex.forEach((item, index) => {
            headerRowIndex.getCell(index + 1).border = {
              left: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            headerRowIndex.getCell(index + 1).alignment = {
              vertical: "top",
              horizontal: "center",
              wrapText: true,
            };
          });
        });

        worksheet.getColumn(1).width = 25;
        worksheet.getColumn(2).width = 25;
        worksheet.getColumn(3).width = 30;
        worksheet.getColumn(4).width = 25;
        worksheet.getColumn(5).width = 25;
        worksheet.getColumn(6).width = 25;

        this.exportToExel(workbook, title);
        this.loading = false;
        this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
      }
    } else {
      this.showToast("warn", "Thông báo", "Bạn phải chọn ít nhất 1 cột");
    }
  }

  exportExcelCCDC() {
    if (this.selectedColumn.length > 0) {
      if (this.colsTheoNVL.length > 0) {
        this.loading = true;
        let title = "Xuất-Công cụ, dụng cụ";
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(title);

        worksheet.addRow([]);

        // dòng chữ đầu tiên trong file excel
        let line1 = [
          "",
          "",
          "XUẤT KHO CÔNG CỤ DỤNG CỤ THÁNG " +
            formatDate(this.fromDate, "/", true),
        ];
        let lineRow1 = worksheet.addRow(line1);
        lineRow1.font = { name: "Times New Roman", size: 13, bold: true };
        lineRow1.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 40;
        // worksheet.mergeCells(`A${lineRow1.number}:F${lineRow1.number}`);

        // dòng thứ
        let line2 = ["", "", "CÔNG CỤ DỤNG CỤ"];
        let lineRow2 = worksheet.addRow(line2);
        lineRow2.font = { name: "Times New Roman", size: 13, bold: true };
        lineRow2.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow2.height = 30;
        worksheet.addRow([]);

        /* Header row */
        let dataheaderRow = [
          "PNK",
          "BP",
          "Ngày xuất",
          "Mã chi tiết",
          "ĐVT",
          "Số lượng xuất",
        ];
        let headerRow = worksheet.addRow(dataheaderRow);
        headerRow.font = { name: "Times New Roman", size: 13, bold: true };
        dataheaderRow.forEach((item, index) => {
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
        headerRow.height = 30;

        this.selectedColumn.forEach((item, index) => {
          let dataHeaderRowIndex = [
            item.maTheKho,
            item.boPhan,
            item.ngayXuat,
            // formatDate(item.ngayXuat, "/", false),
            item.productName,
            item.productUnitName,
            item.quantity,
          ];

          console.log(this.chiTietSanPhamPhieuXuatKhos);

          let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
          headerRowIndex.font = { name: "Times New Roman", size: 13 };
          dataHeaderRowIndex.forEach((item, index) => {
            headerRowIndex.getCell(index + 1).border = {
              left: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            headerRowIndex.getCell(index + 1).alignment = {
              vertical: "top",
              horizontal: "center",
              wrapText: true,
            };
          });
        });

        worksheet.getColumn(1).width = 25;
        worksheet.getColumn(2).width = 25;
        worksheet.getColumn(3).width = 30;
        worksheet.getColumn(4).width = 25;
        worksheet.getColumn(5).width = 25;
        worksheet.getColumn(6).width = 25;

        this.exportToExel(workbook, title);
        this.loading = false;
        this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
      }
    } else {
      this.showToast("warn", "Thông báo", "Bạn phải chọn ít nhất 1 cột");
    }
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs.saveAs(blob, fileName);
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }
}

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, "");
  return parseFloat(str);
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

function formatDatetime(time: Date) {
  let date: any = time.getDate();
  let month: any = time.getMonth() + 1;
  let year = time.getFullYear();
  if (month < 10) {
    month = "0" + month;
  }

  if (date < 10) {
    date = "0" + date;
  }
  return `${date}/${month}/${year}`;
}

function formatDate(date, txt, isMonth) {
  var dateItem = new Date(date);
  const yyyy = dateItem.getFullYear();
  let mm = dateItem.getMonth() + 1; // Months start at 0!
  let dd = dateItem.getDate();

  let ddtxt = "" + dd;
  let mmtxt = "" + mm;

  if (dd < 10) ddtxt = "0" + dd;
  if (mm < 10) mmtxt = "0" + mm;

  let formattedToday = ddtxt + txt + mmtxt + txt + yyyy;

  if (isMonth) {
    formattedToday = mmtxt + txt + yyyy;
  } else if (isMonth == false) {
    formattedToday = ddtxt + txt + mmtxt + txt + yyyy;
  }

  return formattedToday;
}

