import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//service
import { WarehouseService } from "../../../services/warehouse.service";
import { GetPermission } from '../../../../shared/permission/get-permission';

import { ConfirmationService, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { FormControl, FormGroup } from '@angular/forms';
import { CategoryService } from "../../../../shared/services/category.service";
import { ProductService } from "../../../../product/services/product.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { VendorService } from "../../../../vendor/services/vendor.service";
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { AssetService } from "../../../../asset/services/asset.service";

class ColumnExcel {
  code: string;
  name: string;
  width: number;
}


@Component({
  selector: "app-inventory-receiving-voucher-list",
  templateUrl: "./inventory-receiving-voucher-list.component.html",
  styleUrls: ["./inventory-receiving-voucher-list.component.css"],
  providers: [AssetService],
})
export class InventoryReceivingVoucherListComponent implements OnInit {
  innerWidth: number = 0; //number window size first
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    //if (this.innerWidth < )
  }
  @ViewChild("myTable") myTable: Table;
  @ViewChild("myTableNVL1") myTableNVL1: Table;
  @ViewChild("myTableNVL") myTableNVL: Table;
  @ViewChild("inventoryCreateDate")
  private inventoryCreateDateCalendar: any;
  @ViewChild("inventoryReceivingDate")
  private inventoryReceivingDateCalendar: any;

  searchForm: FormGroup;
  wearhouseType: any;
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  // action
  actionAdd: boolean = true;
  actionDelete: boolean = true;
  actionDownload: boolean = true;

  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );
  auth: any = JSON.parse(localStorage.getItem("auth"));
  listCategoryId: Array<string> = [];
  cols: any[];
  listInventoryReceivingVoucher: Array<any> = [];
  visibleSidebar2: Boolean = false;

  voucherCode: string = "";
  serial: string = "";

  filterGlobal: string = "";
  first: number = 0;

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
  listVendor: Array<any> = [];
  listVendorSelected: Array<any> = [];
  listVendorSelectedId: Array<any> = [];

  listProduct: Array<any> = [];
  listProductSelected: Array<any> = [];
  listProductSelectedId: Array<any> = [];

  listCreateDate: Date[];
  listInventoryReceivingDate: Date[];

  listProductSearch: Array<any> = [];
  listProductSelectedSearch: any;

  SumRow: number = 0;
  currentDate: Date;

  nhapKhoForm: FormGroup;

  colsListNhapKho: any;
  dataList: Array<any> = [];

  createParameterForm: FormGroup;
  voucherCodeControl: FormControl;
  createDateControl: FormControl;
  inventoryReceivingDate: FormControl;
  statusControl: FormControl;
  warehouseControl: FormControl;
  createVoucherControl: FormControl;
  storekeeperControl: FormControl;
  vendorControl: FormControl;
  productControl: FormControl;
  serialControl: FormControl;
  loaiVL: number;
  rows = 10;
  displayTypeNVL: number;
  displayTypeCCDC: number;

  // defaultValue: number;
  // defaultValueCCDC: number

  fromDate: Date = new Date();
  toDate: Date = new Date();
  chiTietSanPhamPhieuNhapKhos: Array<any> = [];
  colsTheoNVL: any;
  dataListCCDC: Array<any> = [];

  statuses: Array<any> = [];
  statuses1: Array<any> = [];
  statuses2: Array<any> = [];

  statusesx: Array<any> = [];
  statuses1x: Array<any> = [];
  statuses2x: Array<any> = [];
  currentYear: number = new Date().getFullYear();
  maxStartDate: Date = new Date();
  maxEndDate: Date = new Date();
  // fromDateSearch: Date = null;
  // toDateSearch: Date = null;

  monthDate: Date = new Date();

  selectedColumn: Array<any> = [];

  data: any;

  constructor(
    private _warehouseService: WarehouseService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private vendorService: VendorService,
    private productService: ProductService,
    public messageService: MessageService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private assetService: AssetService
  ) {
    this.route.params.subscribe((params) => {
      if (params["loaiVL"]) {
        this.loaiVL = ParseStringToFloat(params["loaiVL"]);
      }
    });
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.getFormControl();
    this.initTable();
    let resource = "war/warehouse/inventory-receiving-voucher/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }

      this.loading = true;
      await this.getMasterData();
    }
  }
  initTable() {
    this.colsListNhapKho = [
      {
        field: "STT",
        header: "STT",
        width: "30px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "inventoryReceivingVoucherCode",
        header: "Mã phiếu",
        width: "40px",
        textAlign: "left",
        display: "table-cell",
        control: "input-text",
      },
      {
        field: "inventoryReceivingVoucherTypeName",
        header: "Loại phiếu",
        width: "60px",
        textAlign: "left",
        display: "table-cell",
        control: "dropdow",
      },
      {
        field: "inventoryReceivingVoucherDate",
        header: "Ngày nhập",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
        control: "date",
      },
      {
        field: "vendorName",
        header: "Nhà cung cấp",
        width: "60px",
        textAlign: "left",
        display: "table-cell",
        control: "dropdow",
      },
      {
        field: "orderNumber",
        header: "Số đơn hàng",
        width: "40px",
        textAlign: "left",
        display: "table-cell",
        control: "input-number",
      },
      {
        field: "invoiceNumber",
        header: "Số hóa đơn",
        width: "40px",
        textAlign: "left",
        display: "table-cell",
        control: "input-number",
      },
      {
        field: "statusName",
        header: "Trạng thái",
        width: "60px",
        textAlign: "left",
        display: "table-cell",
        control: "dropdown",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
    ];
    this.colsTheoNVL = [
      {
        field: "tenPhieuNhap",
        header: "PNK",
        width: "50px",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "ngayNhap",
        header: "Ngày nhập",
        width: "80px",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "productName",
        header: "Mã chi tiết",
        width: "100px",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "productUnitName",
        header: "ĐVT",
        width: "100px",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "quantity",
        header: "Số lượng nhập",
        width: "36px",
        textAlign: "right",
        display: "table-cell",
      },
      {
        field: "loaiPhieu",
        header: "loại phiếu",
        width: "100px",
        textAlign: "left",
        display: "table-cell",
      },
      {
        field: "productCategoryName",
        header: "Loại hàng",
        width: "100px",
        textAlign: "left",
        display: "table-cell",
      },
    ];
  }

  maSoDetail(rowData, i) {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/detail",
      {
        inventoryDeliveryVoucherId: rowData.productId,
        loaiVL: i,
      },
    ]);
  }

  maSoXuatDetail(rowData, i) {
    this.router.navigate([
      "/warehouse/inventory-receiving-voucher/detail",
      {
        inventoryReceivingVoucherId: rowData.inventoryReceivingVoucherId,
        loaiVL: i,
      },
    ]);
  }

  createInventoryVoucher() {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/create-update",
    ]);
  }

  onDateSelect(value) {
    debugger;
    if (this.displayTypeNVL == 0) {
      this.myTable.filter(
        this.formatDate(value),
        "inventoryReceivingVoucherDateString",
        "equals"
      );
    } else if (this.displayTypeNVL == 1) {
      this.myTableNVL1.filter(
        this.formatDate(value),
        "ngayNhapString",
        "equals"
      );
    }
  }

  onDateSelectCCDC(value) {
    if (this.displayTypeCCDC == 1) {
      this.myTableNVL.filter(
        this.formatDate(value),
        "ngayNhapStringCCDC",
        "equals"
      );
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

  async getMasterData() {
    this.setDefaultValue();
    this.loading = true;
    let [result]: any = await Promise.all([
      this._warehouseService.getMasterDataListPhieuNhapKhoAsync(0, 0),
    ]);
    if (result.statusCode == 200) {
      this.listProductSearch = result.listProduct;
      this.listVendor = result.listVendor;

      this.searchPhieuNhap();
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Lấy dữ liệu không thành công!",
      };
      this.showMessage(msg);
    }
    this.loading = false;
  }

  // suaKiemKe() {
  //   this.loading = true;
  //   this.assetService.dotKiemKeSearch("", "", "", "").subscribe(response => {
  //     var result = <any>response;
  //     this.loading = false;
  //     if (result.statusCode == 200) {
  //       this.data = result.listDotKiemKe;
  //       console.log(this.data);

  //     }
  //   })
  // }

  async searchPhieuNhap() {
    this.chiTietSanPhamPhieuNhapKhos = [];
    this.dataList = [];
    this.loading = true;

    let result: any =
      await this._warehouseService.searchListPhieuNhapKhoNVLCCDCAsync(
        this.wearhouseType,
        convertToUTCTime(new Date(this.fromDate)),
        convertToUTCTime(new Date(this.toDate))
      );

    if (result.statusCode == 200) {
      this.dataList = result.listPhieuNhapKho;

      this.dataList.forEach((item) => {
        if (
          item.inventoryReceivingVoucherDate == null ||
          item.inventoryReceivingVoucherDate == undefined
        ) {
          item.inventoryReceivingVoucherDateString = null;
        } else {
          item.inventoryReceivingVoucherDateString = this.formatDate(
            new Date(item.inventoryReceivingVoucherDate)
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

      result.chiTietSanPhamPhieuNhapKhos.forEach((x) => {
        let data = {
          inventoryReceivingVoucherId: x.inventoryReceivingVoucherId,
          loaiPhieu: x.loaiPhieu,
          ngayNhap: x.ngayNhap,
          productCategoryName: x.productCategoryName,
          productId: x.productId,
          productName: x.productName,
          productUnitName: x.productUnitName,
          quantity: x.quantity,
          tenPhieuNhap: x.tenPhieuNhap,
        };

        this.chiTietSanPhamPhieuNhapKhos.push(data);
      });

      this.chiTietSanPhamPhieuNhapKhos.forEach((x) => {
        let data = { value: x.productUnitName, label: x.productUnitName };
        if (data.value != null) list.push(data);
        let data1 = { value: x.loaiPhieu, label: x.loaiPhieu };
        if (data1.value != null) list1.push(data1);
        let data2 = {
          value: x.productCategoryName,
          label: x.productCategoryName,
        };
        if (data2.value != null) list2.push(data2);

        if (x.ngayNhap == null || x.ngayNhap == undefined) {
          x.ngayNhapString = null;
        } else {
          x.ngayNhapString = this.formatDate(new Date(x.ngayNhap));
        }

        if (x.ngayNhap == null || x.ngayNhap == undefined) {
          x.ngayNhapStringCCDC = null;
        } else {
          x.ngayNhapStringCCDC = this.formatDate(new Date(x.ngayNhap));
        }
      });
      this.gopData(list, list1, list2);

      this.dataList.forEach((x) => {
        let datax = {
          value: x.inventoryReceivingVoucherTypeName,
          lable: x.inventoryReceivingVoucherTypeName,
        };
        if (datax.value != null) listx.push(datax);
        let data1x = { value: x.vendorName, label: x.vendorName };
        if (data1x.value != null) list1x.push(data1x);
        let data2x = { value: x.statusName, label: x.statusName };
        if (data2x.value != null) list2x.push(data2x);
      });
      this.gopData2(listx, list1x, list2x);

      this.loading = false;
    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: "Lấy dữ liệu không thành công!",
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

  setDefaultValue() {
    let date = new Date();
    this.fromDate = new Date(date.getFullYear(), date.getMonth(), 1);
    this.displayTypeNVL = 1;
    this.displayTypeCCDC = 1;
  }

  selectTab(event) {
    this.wearhouseType = event.index;
    this.searchPhieuNhap();
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  getFormControl() {
    this.searchForm = new FormGroup({
      FromDateSearch: new FormControl(),
      ToDateSearch: new FormControl(),
      ProductGroup: new FormControl([]),
      VendorGroup: new FormControl([]),
    });
    this.voucherCodeControl = new FormControl();
    this.createDateControl = new FormControl();
    this.inventoryReceivingDate = new FormControl();
    this.statusControl = new FormControl();
    this.warehouseControl = new FormControl();
    this.createVoucherControl = new FormControl();
    this.storekeeperControl = new FormControl();
    this.vendorControl = new FormControl();
    this.productControl = new FormControl();
    this.serialControl = new FormControl();

    this.nhapKhoForm = new FormGroup({});

    this.createParameterForm = new FormGroup({
      voucherCodeControl: this.voucherCodeControl,
      createDateControl: this.createDateControl,
      inventoryReceivingDate: this.inventoryReceivingDate,
      statusControl: this.statusControl,
      warehouseControl: this.warehouseControl,
      createVoucherControl: this.createVoucherControl,
      storekeeperControl: this.storekeeperControl,
      vendorControl: this.vendorControl,
      productControl: this.productControl,
      serialControl: this.serialControl,
    });
  }

  patchValueForm() {
    this.searchForm.reset();
    this.searchForm.patchValue({
      // "VendorName": '',
      // "VendorCode": '',
      ProductGroup: [],
      VendorGroup: [],
    });
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

  save(data) {
    this.router.navigate([
      "/warehouse/inventory-receiving-voucher/create",
      {
        loaiVL: data,
      },
    ]);
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
    //     },
    //     (error) => {}
    //   );
  }

  // createOrUpdateInventoryVoucher() {
  //   this.router.navigate([
  //     "/warehouse/inventory-delivery-voucher/create-update",
  //   ]);
  // }

  goDetails(Id: any) {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/detail",
      { id: Id },
    ]);
  }

  refreshFilter() {
    this.dataList = [];
    this.myTable.reset();
    this.searchForm.reset();
    this.patchValueForm();
    this.resetTable();
    this.searchPhieuNhap();
  }

  leftColNumber: number = 12;
  rightColNumber: number = 2;

  resetTable() {
    this.filterGlobal = "";
    this.first = 0;
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

  exportExcel() {
    if (this.selectedColumn.length > 0) {
      if (this.colsTheoNVL.length > 0) {
        this.loading = true;
        let title = "Nhập-Vật liệu";
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(title);

        worksheet.addRow([]);
        let line1 = [
          "",
          "",
          "NHẬP KHO THÁNG " + formatDate(this.fromDate, "/", true),
        ];
        let lineRow1 = worksheet.addRow(line1);
        lineRow1.font = { name: "Times New Roman", size: 11, bold: true };
        lineRow1.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 30;

        let line = ["", "", "NGUYÊN VẬT LIỆU"];
        let lineRow = worksheet.addRow(line);
        lineRow.font = { name: "Times New Roman", size: 11, bold: true };
        lineRow.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow.height = 30;
        worksheet.addRow([]);

        /* Header row */
        let dataHeaderRow = [
          "PNK",
          "Ngày nhập",
          "Mã chi tiết",
          "ĐVT",
          "Số lượng nhập",
          "Nhà cc trả lại hàng",
        ];
        let headerRow = worksheet.addRow(dataHeaderRow);
        headerRow.font = { name: "Times New Roman", size: 13, bold: true };
        dataHeaderRow.forEach((item, index) => {
          headerRow.getCell(index + 1).border = {
            left: { style: "thin" },
            top: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          headerRow.getCell(index + 1).alignment = {
            vertical: "middle",
            horizontal: "left",
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
            item.tenPhieuNhap,
            formatDate(item.ngayNhap, "/", false),
            item.productName,
            item.productUnitName,
            item.quantity,
          ];
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
              horizontal: "left",
              wrapText: true,
            };
          });
        });

        worksheet.addRow([]);
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
        let title = "Nhập-Công cụ dụng cụ";
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(title);

        worksheet.addRow([]);
        let line1 = [
          "",
          "",
          "NHẬP KHO THÁNG " + formatDate(this.fromDate, "/", true),
        ];
        let lineRow1 = worksheet.addRow(line1);
        lineRow1.font = { name: "Times New Roman", size: 11, bold: true };
        lineRow1.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 30;

        let line = ["", "", "CÔNG CỤ, DỤNG CỤ"];
        let lineRow = worksheet.addRow(line);
        lineRow.font = { name: "Times New Roman", size: 11, bold: true };
        lineRow.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow.height = 30;
        worksheet.addRow([]);

        /* Header row */
        /* Header row */
        let dataHeaderRow = [
          "PNK",
          "Ngày nhập",
          "Mã chi tiết",
          "ĐVT",
          "Số lượng nhập",
          "Nhà cc trả lại hàng",
        ];

        let headerRow = worksheet.addRow(dataHeaderRow);
        headerRow.font = { name: "Times New Roman", size: 13, bold: true };
        dataHeaderRow.forEach((item, index) => {
          headerRow.getCell(index + 1).border = {
            left: { style: "thin" },
            top: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          headerRow.getCell(index + 1).alignment = {
            vertical: "middle",
            horizontal: "left",
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
            item.tenPhieuNhap,
            formatDate(item.ngayNhap, "/", false),
            item.productName,
            item.productUnitName,
            item.quantity,
          ];
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
              horizontal: "left",
              wrapText: true,
            };
          });
        });

        worksheet.addRow([]);
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

  xoaData(data) {
    if (data.inventoryReceivingVoucherId) {
      this.confirmationService.confirm({
        message: "Bạn chắc chắn muốn xóa phiếu nhập này?",
        accept: () => {
          this._warehouseService
            .deleteInventoryReceivingVoucher(data.inventoryReceivingVoucherId)
            .subscribe((response) => {
              let result: any = response;
              if (result.statusCode == 200) {
                let msg = {
                  severity: "success",
                  summary: "Thông báo:",
                  detail: result.messageCode,
                };
                this.showMessage(msg);
                this.searchPhieuNhap();
              } else {
                let msg = {
                  severity: "error",
                  summary: "Thông báo:",
                  detail: result.messageCode,
                };
                this.showMessage(msg);
              }
            });
        },
      });
    }
  }
}

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, '');
  return parseFloat(str);
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

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
  }
  return formattedToday;
}
