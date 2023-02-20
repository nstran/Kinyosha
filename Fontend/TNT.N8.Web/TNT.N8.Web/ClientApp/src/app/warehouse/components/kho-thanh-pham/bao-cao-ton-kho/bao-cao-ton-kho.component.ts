import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
//service
import { WarehouseService } from "../../../services/warehouse.service";
import { GetPermission } from "../../../../shared/permission/get-permission";

import { SortEvent } from "primeng/api";
import { Table } from "primeng/table";
import { MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { DatePipe } from "@angular/common";
import * as moment from "moment";
import "moment/locale/pt-br";
import { FormControl, FormGroup } from "@angular/forms";
import { CategoryService } from "../../../../shared/services/category.service";
import { ProductService } from "../../../../product/services/product.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { VendorService } from "../../../../vendor/services/vendor.service";
import { async } from "rxjs";

@Component({
  selector: "app-bao-cao-ton-kho",
  templateUrl: "./bao-cao-ton-kho.component.html",
  styleUrls: ["./bao-cao-ton-kho.component.css"],
})
export class BaoCaoTonKhoComponent implements OnInit {
  loading: boolean = false;
  actionAdd: boolean = true;
  baoCaoTongHop: number = 0;

  emptyGuid = "00000000-0000-0000-0000-000000000000";
  //khai báo cho table
  colsTongHop: Array<any> = [];
  colsTongHopLotno: Array<any> = [];
  listDataTongHop: any[] = [];
  listDataTongHopLotno: any[] = [];

  cols: Array<any> = [];
  frozenCols: Array<any> = [];
  trRowFrozen: Array<any> = [];
  trRow: Array<any> = [];

  trRow2: Array<any> = [];
  listData2: Array<any> = [];

  monthForm: FormGroup;
  rangeDateForm: FormGroup;
  rangeDateChiTietForm: FormGroup;
  showChitietDialog: boolean = false;

  colsDetailLotnoDialog: Array<any> = [];
  listDataChiTietLotno: any[] = [];

  tensanpham: any;
  productId: any;

  // action phân quyền
  actionDownload: boolean = true;

  constructor(
    private warehouseService: WarehouseService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private vendorService: VendorService,
    private productService: ProductService,
    public messageService: MessageService,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.initTable();
    this.setForm();
    let resource = "war/warehouse/kho-thanh-pham/bao-cao-ton-kho";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
    }
    this.loading = true;
    await this.getMasterData();
  }

  setForm() {
    this.monthForm = new FormGroup({
      month: new FormControl(new Date()),
    });
    this.rangeDateForm = new FormGroup({
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
    });

    this.rangeDateChiTietForm = new FormGroup({
      fromDate: new FormControl(new Date()),
      toDate: new FormControl(new Date()),
      productId: new FormControl(this.emptyGuid),
    });
  }

  onChangeDate() {
    this.getMasterData();
  }

  async getMasterData() {
    let thang = convertToUTCTime(this.monthForm.get("month").value);
    let tungay = convertToUTCTime(this.rangeDateForm.get("fromDate").value);
    let denngay = convertToUTCTime(this.rangeDateForm.get("toDate").value);

    if (this.baoCaoTongHop == 0) {
      let result: any = await Promise.all([
        this.warehouseService.getInventoryInfoTPAsync(thang, null, null),
      ]);

      this.loading = false;

      if (result[0].statusCode === 200) {
        this.listDataTongHop = result[0].listDataTongHop;
      } else {
        this.clearToast();
        this.showToast("error", "Thông báo", result[0].messageCode);
      }
    } else {
      let result: any = await Promise.all([
        this.warehouseService.getInventoryInfoTPAsync(null, tungay, denngay),
      ]);

      this.loading = false;

      if (result[0].statusCode === 200) {
        this.trRow = result[0].listDataHeader;
        this.trRow2 = result[0].listDataHeader2;
        this.buildData(result[0].listData);
      } else {
        this.clearToast();
        this.showToast("error", "Thông báo", result[0].messageCode);
      }
    }
  }

  clearToast() {
    this.messageService.clear();
  }

  selectTab(event) {
    this.baoCaoTongHop = event.index;
    this.getMasterData();
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }

  initTable() {
    this.colsTongHop = [
      {
        field: "productCode",
        header: "Mã sản phẩm",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "productName",
        header: "Tên sản phẩm",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "tonThangTruoc",
        header: "Tồn tháng trước",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "sanXuatThangNay",
        header: "Sản xuất tháng này",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "mauTest",
        header: "Mẫu limit/test/Tái kiểm tra",
        width: "200px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "pending",
        header: "Pending",
        width: "50px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "xuatDiThangNay",
        header: "Xuất đi tháng này",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "tonKhoHienTai",
        header: "Tồn tháng này",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
    ];

    this.colsTongHopLotno = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "date",
        header: "Ngày kiểm tra",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityReceiving",
        header: "Số lượng đầu vào",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityOK",
        header: "Số lượng OK",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityNG",
        header: "Số lượng NG",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
    ];

    this.colsDetailLotnoDialog = [
      {
        field: "lotNoName",
        header: "Lot.No",
        width: "80px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "date",
        header: "Ngày kiểm tra",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityReceiving",
        header: "Số lượng đầu vào",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "quantityDelivery",
        header: "Số lượng xuất",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
      {
        field: "endInventory",
        header: "Số lượng Tồn",
        width: "100px",
        textAlign: "center",
        display: "table-cell",
      },
    ];
  }

  chitietLotno(rowData: any) {
    console.log(rowData);
    this.listDataTongHopLotno = rowData.listInventoryInfoProductTPEntityModel;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  buildData(list: Array<any>) {
    this.cols = [];
    this.frozenCols = [];

    this.listData2 = [];
    if (list.length) {
      list[0].forEach((item) => {
        if (item.isShow) {
          let col = {
            field: item.columnKey,
            header: item.columnKey,
            width: item.width,
            textAlign: item.textAlign,
          };
          if (
            item.columnKey == "stt" ||
            item.columnKey == "name" ||
            item.columnKey == "code"
          ) {
            this.frozenCols.push(col);
          } else {
            this.cols.push(col);
          }
        }
      });

      list.forEach((row) => {
        let dataRow = {};
        row.forEach((item) => {
          //Nếu là number
          if (item.valueType == 1) {
            dataRow[item.columnKey] = item.columnValue; //this.commonService.convertStringToNumber(item.columnValue);
          } else {
            dataRow[item.columnKey] = item.columnValue;
          }
        });

        this.listData2 = [...this.listData2, dataRow];
      });
    }
  }
  xuatfilechitietdialog() {}
  async showChiTietDialog(rowData: any) {
    this.tensanpham = rowData.columnValue;
    this.productId = rowData.columnKey;

    this.showChitietDialog = true;
    this.loadDataChiTietDialog();
  }

  async loadDataChiTietDialog() {
    let tungay = convertToUTCTime(
      this.rangeDateChiTietForm.get("fromDate").value
    );
    let denngay = convertToUTCTime(
      this.rangeDateChiTietForm.get("toDate").value
    );

    let result: any = await Promise.all([
      this.warehouseService.getChiTietBaoCaoTPAsync(
        this.productId,
        tungay,
        denngay
      ),
    ]);

    this.loading = false;

    if (result[0].statusCode === 200) {
      this.listDataTongHop = result[0].listDataTongHop;
    } else {
      this.clearToast();
      this.showToast("error", "Thông báo", result[0].messageCode);
    }
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
