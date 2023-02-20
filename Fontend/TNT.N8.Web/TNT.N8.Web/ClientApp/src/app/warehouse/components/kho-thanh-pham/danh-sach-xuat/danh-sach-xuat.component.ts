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

@Component({
  selector: "app-danh-sach-xuat",
  templateUrl: "./danh-sach-xuat.component.html",
  styleUrls: ["./danh-sach-xuat.component.css"],
})
export class DanhSachXuatComponent implements OnInit {
  cols: any;
  listData: Array<any> = [];
  loading: boolean = false;
  displayType: number = 0;
  @ViewChild("myTable") myTable: Table;

  /* action phân quyền */
  actionAdd: boolean = true;

  //get data
  fromDate: Date = new Date();
  toDate: Date = new Date();

  emptyGuid: string = "00000000-0000-0000-0000-000000000000";

  constructor(
    private warehouseService: WarehouseService,
    private getPermission: GetPermission,
    public dialogService: DialogService,
    public messageService: MessageService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    let resource = "war/warehouse/thanh-pham-xuat/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(["/home"]);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
    }
    this.getMasterData();
    this.initTable();
  }

  getMasterData() {
    this.loading = true;
    this.warehouseService
      .danhSachThanhPhamXuat(
        4,
        new Date(this.fromDate),
        new Date(this.toDate),
        this.emptyGuid
      )
      .subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.listData = result.lstResult;
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

  initTable() {
    this.cols = [
      { field: "STT", header: "STT", width: "40px", textAlign: "center" },
      {
        field: "maPhieu",
        header: "Mã phiếu",
        width: "100px",
        textAlign: "center",
      },
      {
        field: "loaiPhieu",
        header: "Loại phiếu",
        width: "100px",
        textAlign: "center",
      },
      {
        field: "ngayXuat",
        header: "Ngày xuất",
        width: "100px",
        textAlign: "center",
      },
      {
        field: "soLuongXuat",
        header: "Số lượng xuất",
        width: "100px",
        textAlign: "center",
      },
      {
        field: "soDonHang",
        header: "Số đơn hàng",
        width: "100px",
        textAlign: "center",
      },
    ];
  }

  masoDetail(rowData) {}
  onViewDetail(rowData) {
    this.router.navigate([
      "/warehouse/thanh-pham-xuat/detail",
      { inventoryDeliveryVoucherId: rowData.inventoryDeliveryVoucherId },
    ]);
  }

  taoMoiXuat(data) {
    this.router.navigate([
      "/warehouse/thanh-pham-xuat/create",
      { typePhieu: data },
    ]);
  }
  showMessage(msg: any) {
    this.messageService.add(msg);
  }
}
