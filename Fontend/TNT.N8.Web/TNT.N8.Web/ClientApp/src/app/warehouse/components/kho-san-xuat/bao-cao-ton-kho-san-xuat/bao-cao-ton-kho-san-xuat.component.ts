import { Component, OnInit, ViewChild } from "@angular/core";
import { DialogService, MessageService, Table } from 'primeng';
import { WarehouseService } from "../../../services/warehouse.service";
import { ChonNhieuDvDialogComponent } from "../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component";


@Component({
  selector: "app-bao-cao-ton-kho-san-xuat",
  templateUrl: "./bao-cao-ton-kho-san-xuat.component.html",
  styleUrls: ["./bao-cao-ton-kho-san-xuat.component.css"],
})
export class BaoCaoTonKhoSanXuatComponent implements OnInit {
  loading: boolean = false;

  @ViewChild("myTable") myTable: Table;

  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  colsListBaoCao: any;
  dataList: Array<any> = [];

  // bo phan
  listSelectedDonVi: Array<any> = [];
  idOrg: any;
  listOrg: Array<any> = [];
  selectOrg: any;

  fromDate: Date = new Date();
  toDate: Date = new Date();

  statuses: Array<any> = [];
  statuses1: Array<any> = [];
  statuses2: Array<any> = [];

  auth: any = JSON.parse(localStorage.getItem("auth"));
  constructor(
    private dialogService: DialogService,
    private warehouseService: WarehouseService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    let date = new Date();
    this.fromDate = new Date(date.getFullYear(), date.getMonth(), 1); //new Date(date.setMonth(date.getMonth() - 1));
    this.initTable();
    this.setDefaultValue();
    this.getMasterData();
  }

  initTable() {
    this.colsListBaoCao = [
      {
        field: "STT",
        header: "STT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "productCode",
        header: "Mã VT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "productName",
        header: "Tên VT",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "productUnitName",
        header: "Đơn vị tính",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "vendorName",
        header: "Nhà cung cấp",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "startInventory",
        header: "Tồn đầu kỳ",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityReceiving",
        header: "Nhập kho",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityDelivery",
        header: "Xuất kho",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "endInventory",
        header: "Tồn cuối kỳ",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "productCategoryName",
        header: "Loại hàng",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
    ];
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
      selectedId = this.auth.OrganizationId;
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
    this.loading = true;
    this.getReport();
    this.loading = false;
  }

  async getReport() {
    this.loading = true;
    this.dataList = [];
    let result: any = await this.warehouseService.getInventoryInfoSXAsync(
      this.idOrg,
      0,
      convertToUTCTime(this.fromDate),
      convertToUTCTime(this.toDate),
      this.emptyGuid
    );
    if (result.statusCode == 200) {
      this.dataList = result.listInventoryInfoEntityModel;

      this.statuses = [];
      this.statuses1 = [];
      this.statuses2 = [];
      let list = [];
      let list1 = [];
      let list2 = [];

      this.dataList.forEach((x) => {
        let data = { value: x.productUnitName, label: x.productUnitName };
        if (data.value != null) list.push(data);

        let data1 = { value: x.vendorName, label: x.vendorName };
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
      let mgs = {
        severity: "error",
        summary: "Thông báo",
        detail: result.messageCode,
      };
      this.showMessage(mgs);
    }
  }

  gopData(data, data1, data2) {
    let listId = [];
    let listIdUni = [];
    data.forEach((x) => {
      listId.push(x.value);
    });

    for (var i = 0; i < listId.length; i++){
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
    this.idOrg = this.auth.OrganizationId;
    this.loading = true;
    let result3: any = await this.warehouseService.getAllOrganizationAsync();
    if (result3.statusCode == 200) {
      this.listOrg = result3.listAll;
      this.selectOrg = this.listOrg.find(
        (o) => o.organizationId == this.idOrg
      )?.organizationName;
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }
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
