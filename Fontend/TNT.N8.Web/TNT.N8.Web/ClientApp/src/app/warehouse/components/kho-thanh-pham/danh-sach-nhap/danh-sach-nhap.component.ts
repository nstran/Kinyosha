import { Component, OnInit, HostListener, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Table } from "primeng";
import { WarehouseService } from "../../../services/warehouse.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { CategoryService } from "../../../../shared/services/category.service";
import { VendorService } from "../../../../vendor/services/vendor.service";
import { ProductService } from "../../../../product/services/product.service";
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from "../../../../shared/permission/get-permission";
import { DialogService } from "primeng/dynamicdialog";
import { NotificationService } from "../../../../shared/services/notification.service";



@Component({
  selector: "app-danh-sach-nhap",
  templateUrl: "./danh-sach-nhap.component.html",
  styleUrls: ["./danh-sach-nhap.component.css"],
})
export class DanhSachNhapComponent implements OnInit {
  cols: any;

  // getMasterData
  listData: Array<any> = [];
  listChiTiet: Array<any> = [];
  loading: boolean = false;
  displayType: number = 0;
  @ViewChild("myTable") myTable: Table;

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
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getMasterData();
    this.initTable();
  }

  save() {
    this.router.navigate(["/warehouse/tao-moi-nhap/create"]);
  }

  getMasterData() {
    this.loading = true;
    this.warehouseService
      .danhSachThanhPhamNhan(
        4,
        new Date(this.fromDate),
        new Date(this.toDate),
        this.emptyGuid
      )
      .subscribe((response) => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.listData = result.listPhieuNhapKho;
          this.listChiTiet = result.chiTietSanPhamPhieuNhapKhos;
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
    // this.listData = [
    //   { STT: 1, inventoryReceivingVoucherCode: 'a1', createdDate: new Date(), orderNumber: 10, },
    //   { STT: 1, inventoryReceivingVoucherCode: 'a2', createdDate: new Date(), orderNumber: 12, },
    // ]

    this.cols = [
      { field: "STT", header: "STT", width: "40px", textAlign: "center" },
      {
        field: "tenPhieuNhap",
        header: "Mã phiếu",
        width: "60px",
        textAlign: "center",
      },
      {
        field: "ngayNhap",
        header: "Ngày kiểm tra",
        width: "70px",
        textAlign: "center",
      },
      {
        field: "loaiPhieu",
        header: "Loại nhập",
        width: "80px",
        textAlign: "center",
      },
      {
        field: "productName",
        header: "Thành phẩm",
        width: "70px",
        textAlign: "center",
      },
      {
        field: "quantityOk",
        header: "Số lượng nhập",
        width: "140px",
        textAlign: "right",
      },
      {
        field: "TT",
        header: "Thao tác",
        width: "40px",
        textAlign: "right",
      },
    ];
  }

  xoaData(data) {
    if (data.inventoryReceivingVoucherId) {
      this.confirmationService.confirm({
        message: "Bạn chắc chắn muốn xóa phiếu nhập này?",
        accept: () => {
          this.warehouseService
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
        },
      });
    }
  }

  onViewDetail(rowData: any) {
    this.router.navigate([
      "/warehouse/thanh-pham-nhap/detail",
      {
        inventoryReceivingVoucherId: rowData.inventoryReceivingVoucherId,
      },
    ]);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }
}
