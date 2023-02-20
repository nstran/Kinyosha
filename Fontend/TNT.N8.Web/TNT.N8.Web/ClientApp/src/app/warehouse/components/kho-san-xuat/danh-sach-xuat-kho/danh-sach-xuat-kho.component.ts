import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Route, Router } from '@angular/router';
import { DialogService, MessageService, Table } from 'primeng';
import { WarehouseService } from "../../../services/warehouse.service";
import { ChonNhieuDvDialogComponent } from '../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';
import { GetPermission } from "../../../../shared/permission/get-permission";


@Component({
  selector: "app-danh-sach-xuat-kho",
  templateUrl: "./danh-sach-xuat-kho.component.html",
  styleUrls: ["./danh-sach-xuat-kho.component.css"],
})
export class DanhSachXuatKhoComponent implements OnInit {
  @ViewChild("myTable") myTable: Table;

  loading: boolean = false;

  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  // khai báo bộ phận
  listSelectedDonVi: Array<any> = [];
  idOrg: any;
  selectOrg: any;
  listOrg: Array<any> = [];

  chiTietSanPhamPhieuXuatKhos: Array<any> = [];
  chiTietSanPhamPhieuNhapKhos2: Array<any> = [];

  loaiVL: number;

  // type kho
  displayTypeCSX: number;
  displayTypeTSD: number;

  //
  fromDate: Date = new Date();
  toDate: Date = new Date();

  //masterdata
  dataListCSX: Array<any> = [];
  dataListTSD: Array<any> = [];

  statuses: Array<any> = [];
  statuses1: Array<any> = [];
  statuses2: Array<any> = [];

  statusesx: Array<any> = [];
  statuses1x: Array<any> = [];
  statuses2x: Array<any> = [];

  // col
  colsTheoNVL: any;
  colsListXuatKho: any;

  productType: number;
  warehouseType: number;
  KhoType: number;

  // action phân quyền
  actionAdd: boolean = true;
  actionDelete: boolean = true;

  auth: any = JSON.parse(localStorage.getItem('auth'));

  constructor(
    private dialogService: DialogService,
    public route: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
    private getPermission: GetPermission
  ) {
    this.route.params.subscribe((params) => {
      if (params["WarehouseType"]) {
        this.warehouseType = params["WarehouseType"];
      }
      if (params["ProductType"]) {
        this.productType = params["ProductType"];
      }
      if (params["KhoType"]) {
        this.KhoType = params["KhoType"];
      }
    });
  }

  async ngOnInit() {
    let date = new Date();
    this.fromDate = new Date(date.getFullYear(), date.getMonth(), 1); // new Date(date.setMonth(date.getMonth() - 1));
    let resource = "war/warehouse/danh-sach-xuat-kho/list";
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
    }

    this.initTable();
    await this.setDefaultValue();
    this.getMasterData();
  }

  initTable() {
    this.colsListXuatKho = [
      { field: "STT", header: "STT", width: "40px", textAlign: "center" },
      {
        field: "inventoryDeliveryVoucherCode",
        header: "Mã số",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "inventoryDeliveryVoucherTypeText",
        header: "Loại phiếu",
        width: "60px",
        textAlign: "center",
      },
      {
        field: "inventoryDeliveryVoucherDate",
        header: "Ngày xuất",
        width: "50px",
        textAlign: "center",
      },
      {
        field: "nameStatus",
        header: "Trạng thái",
        width: "50px",
        textAlign: "center",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "30px",
        textAlign: "center",
      },
    ];

    this.colsTheoNVL = [
      {
        field: "tenPhieuXuat",
        header: "PNK",
        width: "50px",
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
        field: "organizationName",
        header: "Bộ phận",
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
  }

  onDateSelect(value) {
    this.myTable.filter(this.formatDate(value), "ngayXuat", "startsWith");
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
          this.idOrg = this.listSelectedDonVi[0].organizationId;
          let listSelectedTenDonVi = this.listSelectedDonVi.map(
            (x) => x.organizationName
          );
          this.selectOrg = listSelectedTenDonVi;
          this.getMasterData();
          // this.error["OrganizationId"] = null;
        } else {
          this.listSelectedDonVi = [];
          this.selectOrg = null;
          // this.error["OrganizationId"] = "Không được để trống";
        }
      }
    });
  }

  async getMasterData() {
    // this.setDefaultValue();
    this.loading = true;
    let [resultCSX, resultTSD]: any = await Promise.all([
      this.warehouseService.searchInventoryDeliveryVoucherSXAsync(
        this.idOrg,
        3,
        convertToUTCTime(this.fromDate),
        convertToUTCTime(this.toDate)
      ),
      this.warehouseService.searchInventoryDeliveryVoucherSXAsync(
        this.idOrg,
        2,
        convertToUTCTime(this.fromDate),
        convertToUTCTime(this.toDate)
      ),
    ]);
    if (resultCSX.statusCode == 200 && resultTSD.statusCode == 200) {

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

      resultCSX.chiTietSanPhamPhieuXuatKhos.forEach((x) => {
        let dataUse = {
          organizationName: x.organizationName,
          ngayXuat: formatDatetime(new Date(x.ngayXuat)),
          productCategoryName: x.productCategoryName,
          productId: x.productId,
          productName: x.productName,
          productUnitName: x.productUnitName,
          quantity: x.quantity,
          tenPhieuXuat: x.tenPhieuXuat,
        };
        this.chiTietSanPhamPhieuXuatKhos.push(dataUse);
      });

      this.chiTietSanPhamPhieuXuatKhos.forEach((x) => {
        let data = { value: x.productUnitName, label: x.productUnitName };
        if (data.value != null) list.push(data);

        let data1 = { value: x.organizationName, label: x.organizationName };
        if (data1.value != null) list1.push(data1);

        let data2 = {
          value: x.productCategoryName,
          label: x.productCategoryName,
        };
        if (data2.value != null) list2.push(data2);
      });
      this.gopData(list, list1, list2);

      this.dataListCSX = resultCSX.lstResult;
      this.dataListTSD = resultTSD.lstResult;
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

  theoNVL(data) {
    this.loading = true;
    this.warehouseService
      .searchInventoryDeliveryVoucherSX(
        this.idOrg,
        data,
        convertToUTCTime(this.fromDate),
        convertToUTCTime(this.toDate)
      )
      .subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          // this.dataListCSX = resultCSX.lstResult;
          // this.dataListTSD = resultTSD.lstResult;
          this.statuses = [];
          this.statuses1 = [];
          this.statuses2 = [];
          let list = [];
          let list1 = [];
          let list2 = [];

          result.chiTietSanPhamPhieuXuatKhos.forEach((x) => {
            let dataUse = {
              productId: x.productId,
              tenPhieuXuat: x.tenPhieuXuat,
              boPhan: x.organizationName,
              ngayXuat: formatDatetime(new Date(x.ngayXuat)),
              productName: x.productName,
              productUnitName: x.productUnitName,
              quantity: x.quantity,
              productCategoryName: x.productCategoryName
            };

            this.chiTietSanPhamPhieuXuatKhos.push(dataUse);
          });

          this.chiTietSanPhamPhieuXuatKhos.forEach((x) => {
            let data = { value: x.productUnitName, label: x.productUnitName };
            if (data.value != null) list.push(data);

            let data1 = {
              value: x.organizationName,
              label: x.organizationName,
            };
            if (data1.value != null) list1.push(data1);

            let data2 = {
              value: x.productCategoryName,
              label: x.productCategoryName,
            };
            if (data2.value != null) list2.push(data2);
          });
          this.gopData(list, list1, list2);
          this.loading = false;
        } else {
          let msg = {
            severity: "error",
            summary: "Thông báo:",
            detail: "Lấy dữ liệu không thành công!",
          };
          this.showMessage(msg);
        }
      });
  }

  NVL() {
    this.chiTietSanPhamPhieuXuatKhos = [];
    this.theoNVL(0);
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

  async setDefaultValue() {
    // this.loading = true;
    this.displayTypeCSX = 0;
    this.displayTypeTSD = 0;
    this.idOrg = this.auth.OrganizationId;
    let resultOrgan: any =
      await this.warehouseService.getAllOrganizationAsync();
    if (resultOrgan.statusCode == 200) {
      this.listOrg = resultOrgan.listAll;
      this.selectOrg = this.listOrg.find(o => o.organizationId == this.idOrg)?.organizationName;
    }
  }

  save(data, wareType, khoType) {
    this.router.navigate([
      "/warehouse/tao-moi-xuat-kho/create",
      { ProductType: data, WarehouseType: wareType, KhoType: khoType },
    ]);
  }

  xoaData(data) {
    if (data.inventoryDeliveryVoucherId) {
      this.warehouseService
        .deleteInventoryDeliveryVoucher(data.inventoryDeliveryVoucherId)
        .subscribe((response) => {
          let result: any = response;
          if (result.statusCode == 200) {
            let msg = {
              severity: "success",
              summary: "Thông báo:",
              detail: result.messageCode,
            };
            this.showMessage(msg);
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
    this.getMasterData();
  }

  selectTab(event) {
    this.theoNVL(event.index);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  maSoXuatDetail(rowData) {
    console.log(rowData);
    if (rowData.inventoryDeliveryVoucherType == 4) {
      this.router.navigate([
        "/warehouse/chi-tiet-phieu-xuat/detail",
        {
          inventoryDeliveryVoucherId: rowData.inventoryDeliveryVoucherId,
          warehouseType: 0,
        },
      ]);
    } else if (rowData.inventoryDeliveryVoucherType == 9) {
      this.router.navigate([
        "/warehouse/chi-tiet-phieu-xuat/detail",
        {
          inventoryDeliveryVoucherId: rowData.inventoryDeliveryVoucherId,
          warehouseType: 0,
        },
      ]);
    } else if (rowData.inventoryDeliveryVoucherType == 10) {
      this.router.navigate([
        "/warehouse/chi-tiet-phieu-xuat/detail",
        {
          inventoryDeliveryVoucherId: rowData.inventoryDeliveryVoucherId,
          warehouseType: 1,
        },
      ]);
    }
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, "");
  return parseFloat(str);
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


