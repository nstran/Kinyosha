import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
//service
import { WarehouseService } from "../../services/warehouse.service";
import { GetPermission } from '../../../shared/permission/get-permission';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import 'moment/locale/pt-br';
import { HubConnection, HubConnectionBuilder, HttpTransportType } from '@aspnet/signalr';
import { NotificationService } from '../../../shared/services/notification.service';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { iterator } from 'rxjs/internal-compatibility';

class mapDataDialog {
  inventoryInfoLotNoEntityModelId: string;
  inventoryInfoEntityModelId: string;
  productId: string;
  lotNoId: any;
  lotNoName: string;
  startInventory: number;
  endInventory: number;
  quantityDelivery: number;
  quantityReceiving: number;
}

interface CategoryModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  categoryTypeId: CategoryTypeModel["categoryTypeId"];
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: string;
  active: Boolean;
  isEdit: Boolean;
  isDefault: Boolean;
  statusName: string;
  potentialName: string;
  sortOrder: number;
  categoryTypeName: string;
}

interface CategoryTypeModel {
  categoryTypeId: string,
  categoryTypeName: string;
  categoryTypeCode: string;
  categoryList: Array<CategoryModel>;
  active: boolean,
}

@Component({
  selector: "app-in-stock-report",
  templateUrl: "./in-stock-report.component.html",
  styleUrls: ["./in-stock-report.component.css"],
  providers: [
    {
      provide: HubConnection,
      useClass: HubConnectionBuilder,
    },
  ],
})
export class InStockReportComponent implements OnInit {
  innerWidth: number = 0; //number window size first
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    //if (this.innerWidth < )
  }
  @ViewChild("myTable") myTable: Table;
  @ViewChild("myTableCCDC") myTableCCDC: Table;
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  isGlobalFilter: any = "";
  loading: boolean = false;
  emptyGuid: string = "00000000-0000-0000-0000-000000000000";
  auth: any = JSON.parse(localStorage.getItem("auth"));

  displayTypeNVL: number;
  displayTypeCCDC: number;

  statuses: Array<any> = [];
  statuses1: Array<any> = [];
  statuses2: Array<any> = [];

  lotNo: boolean = false;
  chiTietLotNo: boolean = false;

  chooseRowData: any = null;
  tableLotNo: boolean = false;
  tableLotNoDetail: boolean = false;

  listInventoryInfoEntityModel: Array<any> = [];
  listProductLotNoMapping: Array<any> = [];
  listInventoryInfoProduct: Array<any> = [];

  categoryTypeModellist: Array<CategoryTypeModel> = [];
  categoryModelList: Array<CategoryModel> = [];

  /* Code mới */

  warehouseType: number = 0;
  fromDate: Date = new Date();
  toDate: Date = new Date();
  warehouseId: any;

  dataList: Array<any> = [];
  dataListCCDC: any = [];

  highlighted: any;
  /* End code mới */

  data: any;
  colsTheoNVL: any[];
  colsTheoCCDC: any[];
  colsLotNo: any[];
  colsChiTiet: any[];
  rows = 10;
  leftColNumber: number = 12;
  rightColNumber: number = 2;

  tuNgay: Date = new Date();
  denNgay: Date = new Date();

  listProductCategory: Array<any> = [];
  selectedProductCategory: any = null;

  listWareHouseNVL: Array<any> = [];
  listWareHouseCCDC: Array<any> = [];
  selectedWareHouse: any = null;

  listResult: Array<any> = [];
  SumRow: number = 0;
  currentDate: Date = new Date();

  actionDowload: boolean = true;

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

  selectedColumn: Array<any> = [];
  selectedCheckBox: boolean = false;
  wareHouse: any = null;

  constructor(
    private warehouseService: WarehouseService,
    private getPermission: GetPermission,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private hubConnection: HubConnection,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      if (params["warehouseType"]) {
        this.warehouseType = params["warehouseType"];
      }
    });

    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.initTable();
    let resource = "war/warehouse/in-stock-report/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDowload = false;
      }

      // this.getMasterData();

      // let url = localStorage.getItem('ApiEndPoint') + '/notification';
      // this.hubConnection = new HubConnectionBuilder()
      // .withUrl(url, {})
      // .build();

      // this.hubConnection.on("ReceiveNotifications", (listNotifications) => {
      //   this.notifications = listNotifications;
      // });

      // this.hubConnection
      //   .start()
      //   .then(() => console.log('Connection started'))
      //   .catch(err => console.log('Error while starting connection: ' + err));
    }
    this.getDay();
    this.getMasterData();
  }

  initTable() {
    this.colsTheoNVL = [
      { field: "STT", header: "STT", width: "15px", textAlign: "center" },
      {
        field: "productCode",
        header: "Mã VT",
        width: "50px",
        textAlign: "left",
      },
      {
        field: "productName",
        header: "Tên NVl,CCDC",
        width: "40px",
        textAlign: "left",
      },
      {
        field: "productUnitName",
        header: "Đơn vị tính",
        width: "60px",
        textAlign: "left",
      },
      {
        field: "vendorName",
        header: "Nhà cung cấp",
        width: "60px",
        textAlign: "left",
      },
      {
        field: "startInventory",
        header: "Tồn đầu kỳ",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "quantityReceiving",
        header: "Nhập kho",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "quantityDelivery",
        header: "Xuất kho",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "endInventory",
        header: "Tồn cuối kỳ",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "thucTe",
        header: "Thực tế",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "tncc",
        header: "TNCC",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "productCategoryName",
        header: "Loại hàng",
        width: "60px",
        textAlign: "left",
      },
    ];

    this.colsTheoCCDC = [
      { field: "STT", header: "STT", width: "15px", textAlign: "center" },
      {
        field: "productCode",
        header: "Mã VT",
        width: "50px",
        textAlign: "left",
      },
      {
        field: "productName",
        header: "Tên NVl,CCDC",
        width: "40px",
        textAlign: "left",
      },
      {
        field: "productUnitName",
        header: "Đơn vị tính",
        width: "60px",
        textAlign: "left",
      },
      {
        field: "vendorName",
        header: "Nhà cung cấp",
        width: "60px",
        textAlign: "left",
      },
      {
        field: "startInventory",
        header: "Tồn đầu kỳ",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "quantityReceiving",
        header: "Nhập kho",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "quantityDelivery",
        header: "Xuất kho",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "endInventory",
        header: "Tồn cuối kỳ",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "thucTe",
        header: "Thực tế",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "tncc",
        header: "TNCC",
        width: "30px",
        textAlign: "center",
      },
      {
        field: "productCategoryName",
        header: "Loại hàng",
        width: "60px",
        textAlign: "left",
      },
    ];

    this.colsLotNo = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "startInventory",
        header: "Tồn đầu kỳ",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "quantityReceiving",
        header: "Nhập kho",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "quantityDelivery",
        header: "Xuất kho",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "endInventory",
        header: "Tồn cuối kì",
        width: "40px",
        textAlign: "center",
      },
    ];

    this.colsChiTiet = [
      {
        field: "productName",
        header: "Tên hàng",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "productUnitName",
        header: "Đơn vị",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "inventoryReceivingVoucherDate",
        header: "Ngày nhập",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "quantityReceiving",
        header: "Số lượng nhập",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "inventoryDeliveryVoucherDate",
        header: "Ngày xuất",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "quantityDelivery",
        header: "Số lượng xuất",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "quanlityInventory",
        header: "Tồn kho",
        width: "40px",
        textAlign: "center",
      },
    ];
  }

  async getMasterData() {
    let [getListWarehouse, getListWarehouseCCDC]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(0, ""),
      this.warehouseService.getListWareHouseAsync(1, ""),
    ])
    this.listWareHouseNVL = [];
    if (getListWarehouse.statusCode == 200) {
      this.listWareHouseNVL = getListWarehouse.listWareHouse;
      this.wareHouse = this.listWareHouseNVL[0];
    }
    if (getListWarehouseCCDC.statusCode == 200) {
      this.listWareHouseCCDC = getListWarehouseCCDC.listWareHouse;
      this.wareHouse = this.listWareHouseCCDC[0];
    }

    this.getWearhouse();
  }

  save() {
    this.router.navigate(["/warehouse/inventory-receiving-voucher/create"]);
  }

  masoDetail() {
    this.router.navigate(["/warehouse/inventory-receiving-voucher/create"]);
  }

  maVatTuDetail(rowData) {
    this.tableLotNo = true;
    // this.lotNo = true;
    this.listProductLotNoMapping = [];
    this.listInventoryInfoProduct = [];
    this.listProductLotNoMapping = rowData.listInventoryInfoLotNoEntityModel;
    this.chooseRowData = rowData;
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

  nvl() {
    this.listInventoryInfoEntityModel = [];
    // this.getMasterData();
    this.getWearhouse();
  }

  setDefaultValue() {
    // this.warehouseType = 0
    this.displayTypeNVL = 0;
    this.displayTypeCCDC = 0;
  }

  tenLotNo(chooseRowData) {
    // console.log(chooseRowData);
    this.listProductLotNoMapping.forEach(item => {
      item.selected = false;
      if (item.lotNoName == chooseRowData.lotNoName) {
        item.selected = true;
      }
    });

    this.tableLotNoDetail = true;
    // this.chiTietLotNo = true;
    this.listInventoryInfoProduct =
      chooseRowData.listInventoryInfoProductEntityModel;
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

  selectTab(event) {
    this.warehouseType = event.index;
    this.getWearhouse();
  }

  // checkBox() {
  //   let check = false;
  //   this.listInventoryInfoEntityModel.forEach(item => {
  //     if (item.endInventory > 0) {
  //       check = true;
  //     }
  //   });
  //   this.getWearhouse();
  // }

  async getWearhouse() {
    this.setDefaultValue();
    this.loading = true;
    let wareHouseId = (this.wareHouse != null && this.wareHouse != undefined) ? this.wareHouse.warehouseId : this.emptyGuid;
    let result: any = await this.warehouseService.getInventoryInfoAsync(
      this.warehouseType, convertToUTCTime(new Date(this.fromDate)), convertToUTCTime(new Date(this.toDate)), wareHouseId, this.selectedCheckBox
    );
    if (result.statusCode === 200) {
      this.listInventoryInfoEntityModel = result.listInventoryInfoEntityModel;

      this.listProductLotNoMapping = [];
      this.listInventoryInfoProduct = [];
      this.statuses = [];
      this.statuses1 = [];
      this.statuses2 = [];
      let list = [];
      let list1 = [];
      let list2 = [];

      this.listInventoryInfoEntityModel.forEach((x) => {
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

      if (this.listInventoryInfoEntityModel.length == 0) {
        this.messageService.clear();
        this.messageService.add({
          key: "info",
          severity: "info",
          summary: "Không tìm thấy danh sách báo cáo",
          detail: "Báo cáo tồn kho",
        });
      }
      this.loading = false;
    }
  }

  clearToast() {
    this.messageService.clear();
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }

  refreshFilter() {
    this.selectedYear = this.listYear.find((x) => x.value == this.currentYear);
    this.selectedMonth = this.listMonth.find(
      (x) => x.value == this.currentMonth
    );

    this.getDay();
    this.productNameCode = null;
    this.selectedProductCategory = null;
    this.selectedWareHouse = null;
    this.isGlobalFilter = "";
  }

  changeYear(event: any) {
    this.getDay();
  }

  changeMonth(event: any) {
    this.getDay();
  }

  // onKeydown($event: KeyboardEvent) {
  //   if ($event.key === 'Enter') {
  //     this.findInstock();
  //   }
  // }

  /*Tính ngày khi thay đổi Năm hoặc Tháng*/
  getDay() {
    // let year = this.selectedYear.value;
    // let month = this.selectedMonth.value;

    // //Lấy ra ngày cuối cùng của tháng đang được chọn
    // if (month == 12) {
    //   //Ngày đầu tiên của tháng tiếp theo
    //   let firstDay = new Date(year + 1, 0, 1, 0, 0, 0, 0);
    //   let time_first_day = firstDay.getTime();
    //   let time_last_day = time_first_day - 24 * 60 * 60 * 1000;
    //   let lastDay = new Date(time_last_day);
    //   //Vậy ngày cuối của tháng
    //   this.selectedDay = lastDay;
    // } else {
    //   //Ngày đầu tiên của tháng tiếp theo
    //   let firstDay = new Date(year, month, 1, 0, 0, 0, 0);
    //   let time_first_day = firstDay.getTime();
    //   let time_last_day = time_first_day - 24 * 60 * 60 * 1000;
    //   let lastDay = new Date(time_last_day);
    //   //Vậy ngày cuối của tháng
    //   this.selectedDay = lastDay;
    // }

    let dateNow = new Date();
    this.fromDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
    this.toDate = new Date();
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

  exportExcelLotNo() {
    if (this.selectedColumn.length > 0) {
      if (this.colsTheoNVL.length > 0) {
        this.loading = true;
        let title = "Tồn kho theo Lot No";
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(title);

        worksheet.addRow([]);
        let line1 = ["", "BẢNG THEO DÕI LOT.NO"];
        let lineRow1 = worksheet.addRow(line1);
        lineRow1.font = { name: "Calibri", size: 13, bold: true };
        lineRow1.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 30;

        let line2 = [
          "",
          "Từ ngày " +
            this.fromDate.toLocaleDateString("en-GB") +
            " đến " +
            this.toDate.toLocaleDateString("en-GB"),
        ];
        let lineRow2 = worksheet.addRow(line2);
        lineRow2.font = { name: "Calibri", size: 13 };
        lineRow2.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 30;
        worksheet.addRow([]);

        let dataHeaderRow = [
          "Mã hàng",
          "Tên hàng",
          "Đơn vị tính",
          "Ngày nhập",
          "Số lượng nhập",
          "Ngày xuất",
          "Số lượng xuất",
          "Tồn",
        ];

        let headerRow = worksheet.addRow(dataHeaderRow);
        headerRow.font = { name: "Calibri", size: 13, bold: true };
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

        let dataRow = [];
        this.selectedColumn.forEach((item) => {
          if (
            item.listInventoryInfoLotNoEntityModel != null &&
            item.listInventoryInfoLotNoEntityModel != undefined
          ) {
            item.listInventoryInfoLotNoEntityModel.forEach((dt) => {
              dataRow = dataRow.concat(dt.listInventoryInfoProductEntityModel);
            });
          }
        });

        // dataRow = this.selectedColumn;
        dataRow.forEach((item, index) => {
          let dataHeaderRowIndex = [
            item.productCode,
            item.productName,
            item.productUnitName,
            item.inventoryReceivingVoucherDate == null ||
            item.inventoryReceivingVoucherDate == undefined ||
            item.inventoryReceivingVoucherDate == ""
              ? ""
              : formatDate(item.inventoryReceivingVoucherDate, "/", false),
            item.quantityReceiving,
            item.inventoryDeliveryVoucherDate == null ||
            item.inventoryDeliveryVoucherDate == undefined ||
            item.inventoryDeliveryVoucherDate == ""
              ? ""
              : formatDate(item.inventoryDeliveryVoucherDate, "/", false),
            item.quantityDelivery,
            item.quanlityInventory,
          ];
          let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
          headerRowIndex.font = { name: "Calibri", size: 13 };
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
        worksheet.getColumn(7).width = 25;

        this.exportToExel(workbook, title);
        this.loading = false;
        this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
      } else if (this.colsTheoCCDC.length > 0) {
        this.loading = true;
        let title = "Tồn kho theo Lot No";
        let workbook = new Workbook();
        let worksheet = workbook.addWorksheet(title);

        worksheet.addRow([]);
        let line1 = ["", "BẢNG THEO DÕI LOT.NO"];
        let lineRow1 = worksheet.addRow(line1);
        lineRow1.font = { name: "Calibri", size: 13, bold: true };
        lineRow1.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 30;

        let line2 = [
          "",
          "Từ ngày " +
            this.fromDate.toLocaleDateString("en-GB") +
            " đến " +
            this.toDate.toLocaleDateString("en-GB"),
        ];
        let lineRow2 = worksheet.addRow(line2);
        lineRow2.font = { name: "Calibri", size: 13 };
        lineRow2.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        lineRow1.height = 30;
        worksheet.addRow([]);

        let dataHeaderRow = [
          "Mã hàng",
          "Tên hàng",
          "Đơn vị tính",
          "Ngày nhập",
          "Số lượng nhập",
          "Ngày xuất",
          "Số lượng xuất",
          "Tồn",
        ];

        let headerRow = worksheet.addRow(dataHeaderRow);
        headerRow.font = { name: "Calibri", size: 13, bold: true };
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

        let dataRow = [];
        this.selectedColumn.forEach((item) => {
          if (
            item.listInventoryInfoLotNoEntityModel != null &&
            item.listInventoryInfoLotNoEntityModel != undefined
          ) {
            item.listInventoryInfoLotNoEntityModel.forEach((dt) => {
              dataRow = dataRow.concat(dt.listInventoryInfoProductEntityModel);
            });
          }
        });

        // dataRow = this.selectedColumn;
        dataRow.forEach((item, index) => {
          let dataHeaderRowIndex = [
            item.productCode,
            item.productName,
            item.productUnitName,
            item.inventoryReceivingVoucherDate == null ||
            item.inventoryReceivingVoucherDate == undefined ||
            item.inventoryReceivingVoucherDate == ""
              ? ""
              : formatDate(item.inventoryReceivingVoucherDate, "/", false),
            item.quantityReceiving,
            item.inventoryDeliveryVoucherDate == null ||
            item.inventoryDeliveryVoucherDate == undefined ||
            item.inventoryDeliveryVoucherDate == ""
              ? ""
              : formatDate(item.inventoryDeliveryVoucherDate, "/", false),
            item.quantityDelivery,
            item.quanlityInventory,
          ];
          let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
          headerRowIndex.font = { name: "Calibri", size: 13 };
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
        worksheet.getColumn(7).width = 25;

        this.exportToExel(workbook, title);
        this.loading = false;
        this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
      }
    } else {
    }
  }

  exportExcelTong() {
    this.loading = true;
    let title = "Tồn kho tổng";
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);

    worksheet.addRow([]);
    let line1 = ["", "BẢNG THEO DÕI LOT.NO"];
    let lineRow1 = worksheet.addRow(line1);
    lineRow1.font = { name: "Calibri", size: 11, bold: true };
    lineRow1.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow1.height = 30;

    let line2 = [
      "",
      "Từ ngày " +
        this.fromDate.toLocaleDateString("en-GB") +
        " đến " +
        this.toDate.toLocaleDateString("en-GB"),
    ];
    let lineRow2 = worksheet.addRow(line2);
    lineRow2.font = { name: "Calibri", size: 13 };
    lineRow2.getCell(1).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    lineRow1.height = 30;
    worksheet.addRow([]);

    let dataHeaderRow = [
      "Mã hàng hóa",
      "Tên hàng hóa",
      "Đơn vị tính",
      "Nhà cung cấp",
      "Tồn đầu kỳ",
      "Nhập kho",
      "Xuất kho",
      "Tồn cuối kỳ",
      "Thực tế",
      "TNCC",
    ];
    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: "Calibri", size: 13, bold: true };
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

    this.listInventoryInfoEntityModel.forEach((item, index) => {
      let dataHeaderRowIndex = [
        item.productCode,
        item.productName,
        item.productUnitName,
        item.vendorName,
        item.startInventory,
        item.quantityReceiving,
        item.quantityDelivery,
        item.endInventory,
        item.thucTe,
        item.tncc,
      ];
      let headerRowIndex = worksheet.addRow(dataHeaderRowIndex);
      headerRowIndex.font = { name: "Calibri", size: 13 };
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
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(8).width = 25;
    worksheet.getColumn(9).width = 25;
    worksheet.getColumn(10).width = 25;

    this.exportToExel(workbook, title);
    this.loading = false;
    this.showToast("success", "Thông báo:", "Xuất báo cáo thành công");
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs.saveAs(blob, fileName);
    });
  }

  onRowSelect(rowdata) {
    this.listInventoryInfoEntityModel.forEach(item => {
      item.selected = false;
      if (item.productCode == rowdata.productCode) {
        item.selected = true;
      }
    });

    this.maVatTuDetail(rowdata)
  }
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
  else {
    formattedToday = ddtxt + txt + mmtxt + txt + yyyy;
  }
  return formattedToday;
}
