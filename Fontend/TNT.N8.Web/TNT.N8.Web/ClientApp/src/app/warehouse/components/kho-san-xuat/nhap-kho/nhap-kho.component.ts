import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//service
import { WarehouseService } from "../../../services/warehouse.service";
import { GetPermission } from '../../../../shared/permission/get-permission';

import { SortEvent } from 'primeng/api';
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
import { ChonNhieuDvDialogComponent } from "../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component";

@Component({
  selector: 'app-nhap-kho',
  templateUrl: './nhap-kho.component.html',
  styleUrls: ['./nhap-kho.component.css']
})
export class NhapKhoComponent implements OnInit {
  innerWidth: number = 0; //number window size first
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    //if (this.innerWidth < )
  }
  @ViewChild("myTable") myTable: Table;
  @ViewChild("inventoryCreateDate") private inventoryCreateDateCalendar: any;
  @ViewChild("inventoryReceivingDate")
  private inventoryReceivingDateCalendar: any;

  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  actionAdd: boolean = true;
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

  nhapKhoForm: FormGroup;

  colsListXuatKho: any;
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
  loaiVL: number
  rows = 10;
  displayTypeNVL: number
  displayTypeCCDC: number
  fromDate: Date = new Date()
  toDate: Date = new Date()
  chiTietSanPhamPhieuNhapKhos: Array<any> = []
  chiTietSanPhamPhieuNhapKhos2: Array<any> = []
  colsTheoNVL: any;
  dataListCCDC: Array<any> = []

  statuses: Array<any> = []
  statuses1: Array<any> = []
  statuses2: Array<any> = []

  statusesx: Array<any> = []
  statuses1x: Array<any> = []
  statuses2x: Array<any> = []

  listOrg: Array<any> = []
  selectOrg: any
  listSelectedDonVi: Array<any> = []
  idOrg: any;

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
    private dialogService: DialogService,
  ) {
    this.route.params.subscribe(params => {
      if (params['loaiVL']) {
        this.loaiVL = ParseStringToFloat(params['loaiVL']);
      }
    });
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    let date = new Date()
    this.fromDate = new Date(date.getFullYear(), date.getMonth(), 1); //new Date(date.setMonth(date.getMonth() - 1))
    this.getFormControl();
    let resource = "war/warehouse/inventory-receiving-voucher/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }

      this.colsListXuatKho = [
        {
          field: "STT",
          header: "STT",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "inventoryReceivingVoucherCode",
          header: "Mã phiếu",
          width: "80px",
          textAlign: "center",
          display: "table-cell",
        },
        // {
        //   field: "inventoryReceivingVoucherTypeName",
        //   header: "Loại phiếu",
        //   width: "50px",
        //   textAlign: "center",
        //   display: "table-cell",
        // },
        {
          field: "inventoryReceivingVoucherDate",
          header: "Ngày nhập",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        // {
        //   field: "vendorName",
        //   header: "Nhà cung cấp",
        //   width: "50px",
        //   textAlign: "center",
        //   display: "table-cell",
        // },
        // {
        //   field: "orderNumber",
        //   header: "Số đơn hàng",
        //   width: "50px",
        //   textAlign: "center",
        //   display: "table-cell",
        // },
        // {
        //   field: "invoiceNumber",
        //   header: "Số hóa đơn",
        //   width: "50px",
        //   textAlign: "center",
        //   display: "table-cell",
        // },
        // {
        //   field: "statusName",
        //   header: "Trạng thái",
        //   width: "50px",
        //   textAlign: "center",
        //   display: "table-cell",
        // },
        // {
        //   field: "thaoTac",
        //   header: "Thao tác",
        //   width: "50px",
        //   textAlign: "center",
        //   display: "table-cell",
        // },
      ];
      this.colsTheoNVL = [
        {
          field: "tenPhieuNhap",
          header: "PNK",
          width: "50px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "ngayNhap",
          header: "Ngày nhập",
          width: "80px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "productName",
          header: "Mã chi tiết",
          width: "150px",
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
          header: "Số lượng nhập",
          width: "100px",
          textAlign: "center",
          display: "table-cell",
        },
        {
          field: "loaiPhieu",
          header: "loại phiếu",
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
      await this.setDefaultValue();
    }
  }

  maSoDetail(rowData, i) {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/detail",
      {
        inventoryDeliveryVoucherId:
          rowData.productId,
        loaiVL: i
      },
    ]);
  }

  maSoXuatDetail(rowData, i) {
    this.router.navigate([
      "/warehouse/kho-san-xuat-nhap/detail",
      {
        inventoryReceivingVoucherId:
          rowData.inventoryReceivingVoucherId,
        loaiVL: i
      },
    ]);
  }

  createInventoryVoucher() {
    this.router.navigate([
      "/warehouse/inventory-delivery-voucher/create-update",
    ]);
  }

  onDateSelect(value) {
    this.myTable.filter(this.formatDate(value), 'ngayNhap', 'startsWith')
  }

  formatDate(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }

    return day + '/' + month + '/' + date.getFullYear()
  }

  theoNVL(data) {
    this.loading = true
    this._warehouseService.searchListPhieuNhapKhoNVLCCDC(data, new Date(this.fromDate), new Date(this.toDate)).subscribe((response) => {
      let result: any = response;
      if (result.statusCode == 200) {
        this.statuses = []
        this.statuses1 = []
        this.statuses2 = []
        let list = []
        let list1 = []
        let list2 = []
        result.chiTietSanPhamPhieuNhapKhos.forEach(x => {
          let data = {
            loaiPhieu: x.loaiPhieu,
            ngayNhap: formatDatetime(new Date(x.ngayNhap)),
            productCategoryName: x.productCategoryName,
            productId: x.productId,
            productName: x.productName,
            productUnitName: x.productUnitName,
            quantity: x.quantity,
            tenPhieuNhap: x.tenPhieuNhap,
            inventoryReceivingVoucherId: x.inventoryReceivingVoucherId
          }

          this.chiTietSanPhamPhieuNhapKhos.push(data)
        })
        this.chiTietSanPhamPhieuNhapKhos.forEach(x => {
          let data = { value: x.productUnitName, label: x.productUnitName }
          if (data.value != null) list.push(data)
          let data1 = { value: x.loaiPhieu, label: x.loaiPhieu }
          if (data1.value != null) list1.push(data1)
          let data2 = { value: x.productCategoryName, label: x.productCategoryName }
          if (data2.value != null) list2.push(data2)
        })
        this.gopData(list, list1, list2)
        this.loading = false;
      } else {
        let msg = {
          severity: "error",
          summary: "Thông báo:",
          detail: result.messageCode,
        };
        this.showMessage(msg);
      }
    });
  }

  gopData(data, data1, data2) {
   
    let listId = []
    let listIdUni = []
    data.forEach(x => {
      listId.push(x.value)
    })

    for (var i = 0; i < listId.length; i++) {
      if (listIdUni.indexOf(listId[i]) === -1) {
        listIdUni.push(listId[i])
      }
    }
    listIdUni.forEach(x => {
      let a = { value: x, label: x }
      this.statuses.push(a)
    })

    let listId1 = []
    let listIdUni1 = []
    data1.forEach(x => {
      listId1.push(x.value)
    })

    for (var i = 0; i < listId1.length; i++) {
      if (listIdUni1.indexOf(listId1[i]) === -1) {
        listIdUni1.push(listId1[i])
      }
    }
    listIdUni1.forEach(x => {
      let a = { value: x, label: x }
      this.statuses1.push(a)
    })

    let listId2 = []
    let listIdUni2 = []
    data2.forEach(x => {
      listId2.push(x.value)
    })

    for (var i = 0; i < listId2.length; i++) {
      if (listIdUni2.indexOf(listId2[i]) === -1) {
        listIdUni2.push(listId2[i])
      }
    }
    listIdUni2.forEach(x => {
      let a = { value: x, label: x }
      this.statuses2.push(a)
    })

  }

  gopData2(data, data1, data2) {
   
    let listId = []
    let listIdUni = []
    data.forEach(x => {
      listId.push(x.value)
    })

    for (var i = 0; i < listId.length; i++) {
      if (listIdUni.indexOf(listId[i]) === -1) {
        listIdUni.push(listId[i])
      }
    }
    listIdUni.forEach(x => {
      let a = { value: x, label: x }
      this.statusesx.push(a)
    })

    let listId1 = []
    let listIdUni1 = []
    data1.forEach(x => {
      listId1.push(x.value)
    })

    for (var i = 0; i < listId1.length; i++) {
      if (listIdUni1.indexOf(listId1[i]) === -1) {
        listIdUni1.push(listId1[i])
      }
    }
    listIdUni1.forEach(x => {
      let a = { value: x, label: x }
      this.statuses1x.push(a)
    })

    let listId2 = []
    let listIdUni2 = []
    data2.forEach(x => {
      listId2.push(x.value)
    })

    for (var i = 0; i < listId2.length; i++) {
      if (listIdUni2.indexOf(listId2[i]) === -1) {
        listIdUni2.push(listId2[i])
      }
    }
    listIdUni2.forEach(x => {
      let a = { value: x, label: x }
      this.statuses2x.push(a)
    })

  }

  async getMasterData() {
    this.loading = true
    this.chiTietSanPhamPhieuNhapKhos = []
    let [result1, result2]: any = await Promise.all([
      this._warehouseService.searchListPhieuNhapKhoSXAsync(this.idOrg, 3, convertToUTCTime(this.fromDate), convertToUTCTime(this.toDate)),
      this._warehouseService.searchListPhieuNhapKhoSXAsync(this.idOrg, 2, convertToUTCTime(this.fromDate), convertToUTCTime(this.toDate)),
    ])
    if (result1.statusCode == 200 && result2.statusCode == 200) {
     
      this.statuses = []
      this.statuses1 = []
      this.statuses2 = []
      let list = []
      let list1 = []
      let list2 = []

      this.statusesx = []
      this.statuses1x = []
      this.statuses2x = []
      let listx = []
      let list1x = []
      let list2x = []

      /** setup ngày nhập sang string **/
      result1.chiTietSanPhamPhieuNhapKhos.forEach(x => {
        let data = {
          loaiPhieu: x.loaiPhieu,
          ngayNhap: formatDatetime(new Date(x.ngayNhap)),
          productCategoryName: x.productCategoryName,
          productId: x.productId,
          productName: x.productName,
          productUnitName: x.productUnitName,
          quantity: x.quantity,
          tenPhieuNhap: x.tenPhieuNhap,
          inventoryReceivingVoucherId: x.inventoryReceivingVoucherId
        }

        this.chiTietSanPhamPhieuNhapKhos.push(data)
      })

      /** Set data cho bộ lọc **/
      this.chiTietSanPhamPhieuNhapKhos.forEach(x => {
        let data = { value: x.productUnitName, label: x.productUnitName }
        if (data.value != null) list.push(data)
        let data1 = { value: x.loaiPhieu, label: x.loaiPhieu }
        if (data1.value != null) list1.push(data1)
        let data2 = { value: x.productCategoryName, label: x.productCategoryName }
        if (data2.value != null) list2.push(data2)
      })
      this.gopData(list, list1, list2)

      /** setup ngày nhập sang string **/
      result2.chiTietSanPhamPhieuNhapKhos.forEach(x => {
        let data = {
          loaiPhieu: x.loaiPhieu,
          ngayNhap: formatDatetime(new Date(x.ngayNhap)),
          productCategoryName: x.productCategoryName,
          productId: x.productId,
          productName: x.productName,
          productUnitName: x.productUnitName,
          quantity: x.quantity,
          tenPhieuNhap: x.tenPhieuNhap,
        }

        this.chiTietSanPhamPhieuNhapKhos2.push(data)
      })

      /** Set data cho bộ lọc **/
      this.chiTietSanPhamPhieuNhapKhos2.forEach(x => {
        let data = { value: x.productUnitName, label: x.productUnitName }
        if (data.value != null) listx.push(data)
        let data1 = { value: x.loaiPhieu, label: x.loaiPhieu }
        if (data1.value != null) list1x.push(data1)
        let data2 = { value: x.productCategoryName, label: x.productCategoryName }
        if (data2.value != null) list2x.push(data2)
      })
      this.gopData2(listx, list1x, list2x)


      this.dataList = result1.listPhieuNhapKho
      this.dataListCCDC = result2.listPhieuNhapKho

    } else {
      let msg = {
        severity: "error",
        summary: "Thông báo:",
        detail: 'Lấy dữ liệu không thành công!',
      };
      this.showMessage(msg);
    }
    this.loading = false
  }

  async setDefaultValue() {
    this.idOrg = this.auth.OrganizationId;
    this.loading = true
    this.displayTypeNVL = 0
    this.displayTypeCCDC = 0
    let result3: any = await this._warehouseService.getAllOrganizationAsync()
    if (result3.statusCode == 200) {
     
      this.listOrg = result3.listAll;
      this.selectOrg = this.listOrg.find(o => o.organizationId == this.idOrg)?.organizationName;
      await this.getMasterData()
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
    if (selectedId == null) {
      selectedId = this.auth.OrganizationId
    }
    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        permissionByLogin: true,
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
          this.idOrg = this.listSelectedDonVi[0].organizationId
          let listSelectedTenDonVi = this.listSelectedDonVi.map(
            (x) => x.organizationName
          );
          this.selectOrg = listSelectedTenDonVi
          this.getMasterData()
          // this.error["OrganizationId"] = null;
        } else {
          this.listSelectedDonVi = [];
          this.selectOrg = null
          // this.error["OrganizationId"] = "Không được để trống";
        }
      }
    });
  }

  xoaData(data) {
    if (data.inventoryReceivingVoucherId) {
      this._warehouseService.deleteInventoryReceivingVoucher(data.inventoryReceivingVoucherId).subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          let msg = {
            severity: "success",
            summary: "Thông báo:",
            detail: result.messageCode,
          };
          this.showMessage(msg);
        }
        else {
          let msg = {
            severity: "error",
            summary: "Thông báo:",
            detail: result.messageCode,
          };
          this.showMessage(msg);
        }
      })
    }
    this.getMasterData()
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  getFormControl() {
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

    this.nhapKhoForm = new FormGroup({

    });

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
        loaiVL: data
      }
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

  }
  leftColNumber: number = 12;
  rightColNumber: number = 2;

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
  pageChange(event: any) { }
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
}
function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, '');
  return parseFloat(str);
}
function formatDatetime(time: Date) {
  let date: any = time.getDate();
  let month: any = time.getMonth() + 1;
  let year = time.getFullYear();
  if (month < 10) {
    month = '0' + month;
  }

  if (date < 10) {
    date = '0' + date;
  }
  return `${date}/${month}/${year}`;
}


function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
