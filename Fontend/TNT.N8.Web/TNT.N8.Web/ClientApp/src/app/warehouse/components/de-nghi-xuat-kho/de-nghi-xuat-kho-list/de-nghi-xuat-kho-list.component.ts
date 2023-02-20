import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Table } from "primeng";
import { WarehouseService } from "../../../services/warehouse.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { CategoryService } from "../../../../shared/services/category.service";
import { VendorService } from "../../../../vendor/services/vendor.service";
import { ProductService } from "../../../../product/services/product.service";
import { MessageService, SortEvent } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from "../../../../shared/permission/get-permission";
import { DialogService } from "primeng/dynamicdialog";
import { NotificationService } from "../../../../shared/services/notification.service";
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@aspnet/signalr";
import { ExportFileWordService } from "../../../../shared/services/exportFileWord.services";


@Component({
  selector: "app-de-nghi-xuat-kho-list",
  templateUrl: "./de-nghi-xuat-kho-list.component.html",
  styleUrls: ["./de-nghi-xuat-kho-list.component.css"],
  providers: [
    {
      provide: HubConnection,
      useClass: HubConnectionBuilder,
    },
  ],
})
export class DeNghiXuatKhoListComponent implements OnInit {
  innerWidth: number = 0; //number window size first
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    //if (this.innerWidth < )
  }
  @ViewChild("myTable") myTable: Table;
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  isGlobalFilter: any = "";
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));

  filterGlobal: string = "";
  first: number = 0;

  data: any;
  cols: any[];
  rows = 10;
  leftColNumber: number = 12;
  rightColNumber: number = 2;

  listProductCategory: Array<any> = [];
  selectedProductCategory: any = null;

  listWareHouse: Array<any> = [];
  selectedWareHouse: any = null;

  listResult: Array<any> = [];
  SumRow: number = 0;
  currentDate: Date = new Date();

  actionAdd: boolean = true;
  actionDelete: boolean = true;

  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth() + 1;
  listYear = this.setListYear();
  selectedYear = this.listYear.find((x) => x.value == this.currentYear);
  listMonth = [
    {
      value: 1,
    },
    {
      value: 2,
    },
    {
      value: 3,
    },
    {
      value: 4,
    },
    {
      value: 5,
    },
    {
      value: 6,
    },
    {
      value: 7,
    },
    {
      value: 8,
    },
    {
      value: 9,
    },
    {
      value: 10,
    },
    {
      value: 11,
    },
    {
      value: 12,
    },
  ];
  selectedMonth = this.listMonth.find((x) => x.value == this.currentMonth);
  selectedDay: Date = new Date();
  productNameCode: string = null;

  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );

  messages: string[] = [];
  message: string;
  notifications: any[] = [];

  constructor(
    private warehouseService: WarehouseService,
    private getPermission: GetPermission,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private hubConnection: HubConnection,
    private notificationService: NotificationService,
    public exportFileWordService: ExportFileWordService
  ) {
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    let resource = "war/warehouse/de-nghi-xuat-kho/list";

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
    this.getDay();
    this.getMasterData();
  }

  /* Test connect real time */
  // send() {
  //   // // message sent from the client to the server
  //   // this.hubConnection.invoke("Echo", this.message);
  //   // this.message = "";
  //   this.notificationService.getNotification("EA944DC1-DD48-49FC-9A24-4B88B9A8D33A",
  //   "00000000-0000-0000-0000-000000000000").subscribe(response => {
  //     let result: any = response;
  //   });
  // }

  initTable() {
    this.cols = [
      { field: "STT", header: "STT", width: "10px", textAlign: "center" },
      {
        field: "inventoryDeliveryVoucherCode",
        header: "Mã số",
        width: "70px",
        textAlign: "left",
      },
      {
        field: "nameCreate",
        header: "Người đề nghị",
        width: "70px",
        textAlign: "left",
      },
      {
        field: "employeeDepartment",
        header: "Bộ phận",
        width: "80px",
        textAlign: "center",
      },
      {
        field: "createdDate",
        header: "Ngày đề nghị",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "inventoryDeliveryVoucherTypeText",
        header: "Kho đề nghị",
        width: "70px",
        textAlign: "center",
      },
      {
        field: "inventoryDeliveryVoucherReasonText",
        header: "Lý do",
        width: "80px",
        textAlign: "left",
      },
      {
        field: "nameStatus",
        header: "Trạng thái",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "ThaoTac",
        header: "Thao tác",
        width: "10px",
        textAlign: "center",
      },
      // { field: 'productPrice', header: 'Giá bán', width: '60px', textAlign: 'right' },
    ];
  }

  save(data, wareType) {
    this.router.navigate([
      "/warehouse/de-nghi-xuat-kho/create",
      { ProductType: data, WarehouseType: wareType },
    ]);
  }

  masoDetail(data) {
    this.router.navigate([
      "/warehouse/de-nghi-xuat-kho/detail",
      {
        inventoryDeliveryVoucherId: data.inventoryDeliveryVoucherId,
        warehouseType: data.warehouseCategory,
      },
    ]);
  }

  xoaData(data) {
    this.loading = true;
    this.warehouseService
      .deleteInventoryDeliveryVoucher(data.inventoryDeliveryVoucherId)
      .subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.getMasterData();
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

  getMasterData() {
    this.loading = true;
    this.warehouseService
      .searchInventoryDeliveryVoucherRequest(0)
      .subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.data = result.lstResult;
        } else {
          let msg = {
            severity: "error",
            summary: "Thông báo:",
            detail: result.messageCode,
          };
          this.showMessage(msg);
        }
      });
    this.loading = false;
  }

  findInstock(first: boolean) {
    this.isShowFilterLeft = false;
    this.leftColNumber = 12;
    this.rightColNumber = 0;

    let selectedDay = convertToUTCTime(this.selectedDay);
    let productNameCode = this.productNameCode?.trim() ?? "";
    let productCategoryId = this.selectedProductCategory?.productCategoryId;
    let warehouseId = this.selectedWareHouse?.warehouseId;

    if (first == false) {
      this.loading = true;
    }

    // this.warehouseService
    //   .searchInStockReport(
    //     selectedDay,
    //     productNameCode,
    //     productCategoryId,
    //     warehouseId
    //   )
    //   .subscribe((response) => {
    //     let result: any = response;
    //     this.loading = false;

    //     if (result.statusCode == 200) {
    //       this.listResult = result.listResult;
    //       this.SumRow = this.listResult?.length;
    //     } else {
    //       let msg = {
    //         severity: "error",
    //         summary: "Thông báo:",
    //         detail: result.messageCode,
    //       };
    //       this.showMessage(msg);
    //     }
    //   });
  }

  showFilter() {
    if (this.innerWidth < 1000) {
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

  refreshFilter() {
    this.loading = true;
    this.data = [];
    this.myTable.reset();
    this.resetTable();
    this.getMasterData();
    this.loading = false;
  }

  changeYear(event: any) {
    this.getDay();
  }

  changeMonth(event: any) {
    this.getDay();
  }

  resetTable() {
    this.filterGlobal = "";
    this.first = 0;
  }
  // onKeydown($event: KeyboardEvent) {
  //   if ($event.key === 'Enter') {
  //     this.findInstock();
  //   }
  // }

  /*Tính ngày khi thay đổi Năm hoặc Tháng*/
  getDay() {
    let year = this.selectedYear.value;
    let month = this.selectedMonth.value;

    //Lấy ra ngày cuối cùng của tháng đang được chọn
    if (month == 12) {
      //Ngày đầu tiên của tháng tiếp theo
      let firstDay = new Date(year + 1, 0, 1, 0, 0, 0, 0);
      let time_first_day = firstDay.getTime();
      let time_last_day = time_first_day - 24 * 60 * 60 * 1000;
      let lastDay = new Date(time_last_day);
      //Vậy ngày cuối của tháng
      this.selectedDay = lastDay;
    } else {
      //Ngày đầu tiên của tháng tiếp theo
      let firstDay = new Date(year, month, 1, 0, 0, 0, 0);
      let time_first_day = firstDay.getTime();
      let time_last_day = time_first_day - 24 * 60 * 60 * 1000;
      let lastDay = new Date(time_last_day);
      //Vậy ngày cuối của tháng
      this.selectedDay = lastDay;
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  setListYear() {
    let result = [];
    let length = this.currentYear - 2000;
    for (let i = 0; i <= length; i++) {
      let year = {
        value: 2000 + i,
      };

      result = [...result, year];
    }

    return result;
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
