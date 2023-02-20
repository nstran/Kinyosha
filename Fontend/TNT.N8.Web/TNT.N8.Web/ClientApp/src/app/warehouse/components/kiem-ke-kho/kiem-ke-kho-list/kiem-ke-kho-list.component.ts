import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { Table } from "primeng";
import { WarehouseService } from "../../../services/warehouse.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { CategoryService } from "../../../../shared/services/category.service";
import { VendorService } from "../../../../vendor/services/vendor.service";
import { ProductService } from "../../../../product/services/product.service";
import { AssetService } from "../../../../asset/services/asset.service";
import { MessageService, SortEvent, TreeNode } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from "../../../../shared/permission/get-permission";
import { DialogService } from "primeng/dynamicdialog";
import { NotificationService } from "../../../../shared/services/notification.service";
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@aspnet/signalr";

class Warehouse {
  warehouseId: string;
  warehouseParent: string;
  hasChild: boolean;
  warehouseCode: string;
  warehouseName: string;
  warehouseCodeName: string;
}

@Component({
  selector: 'app-kiem-ke-kho-list',
  templateUrl: './kiem-ke-kho-list.component.html',
  styleUrls: ['./kiem-ke-kho-list.component.css'],
  providers: [AssetService,
    {
      provide: HubConnection,
      useClass: HubConnectionBuilder,
    },
  ],
})
export class KiemKeKhoListComponent implements OnInit {
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
  dotKiemKeFormGroup: FormGroup;
  //tenDotKiemKeControl: FormControl = new FormControl(null);
  ngayBatDauControl: FormControl = new FormControl(null);
  //ngayKetThucControl: FormControl = new FormControl(null);
  khoKiemKeControl: FormControl = new FormControl(null);

  listData: TreeNode[] = [];
  todayDate: Date = new Date();
  listWarehouse: Array<Warehouse> = [];
  data: any;
  cols: any[];
  rows = 10;
  leftColNumber: number = 12;
  rightColNumber: number = 2;

  listPermissionResource: string = localStorage.getItem(
    "ListPermissionResource"
  );

  messages: string[] = [];
  message: string;
  notifications: any[] = [];
  showTaoMoi: boolean = false;

  selectKho: any

  /* action phan quyen */
  actionAdd: boolean = true;
  actionDelete: boolean = true;

  constructor(private warehouseService: WarehouseService,
    private getPermission: GetPermission,
    public dialogService: DialogService,
    public messageService: MessageService,
    private assetService: AssetService,
    private router: Router,
    private hubConnection: HubConnection,
    private notificationService: NotificationService) {
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.setForm();
    let resource = "war/warehouse/kiem-ke-kho/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
    };
    this.initTable();
    this.getMasterData();
  }

  initTable() {
    this.cols = [
      //{ field: "STT", header: "STT", width: "15px", textAlign: "center" },
      { field: "tenDotKiemKe", header: "Đợt kiểm kê", width: "80px", textAlign: "left" },
      {
        field: "tenTrangThai",
        header: "Trạng thái",
        width: "40px",
        textAlign: "center",
      },
      {
        field: "thaoTac",
        header: "Thao tác",
        width: "40px",
        textAlign: "center",
      },
      // { field: 'productPrice', header: 'Giá bán', width: '60px', textAlign: 'right' },
    ];

    this.data = [
      {
        STT: 1,
        dotKiemKeId: 0,
        tenDotKiemKe: "Thang 11/2022",
        tenTrangThai: "Đang thực hiện",
        warehouseId: this.emptyGuid
      },
    ];
  }
  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  setForm() {
    this.ngayBatDauControl = new FormControl(null, [Validators.required]);
    this.khoKiemKeControl = new FormControl(null, [Validators.required])

    this.dotKiemKeFormGroup = new FormGroup({
      ngayBatDauControl: this.ngayBatDauControl,
      khoKiemKeControl: this.khoKiemKeControl
    });

    // if (this.khoNhanList.length > 0) this.selectKho = this.khoNhanList[0]
  }

  async getMasterData() {
    this.loading = true;
    let [getListWarehouse, getListWarehouseCCDC]: any = await Promise.all([
      this.warehouseService.getListWareHouseAsync(0, ""),
      this.warehouseService.getListWareHouseAsync(1, ""),
    ])
    this.listWarehouse = [];
    if (getListWarehouse.statusCode == 200) {
      this.listWarehouse = getListWarehouse.listWareHouse;
    }
    if (getListWarehouseCCDC.statusCode == 200) {
      this.listWarehouse = this.listWarehouse.concat(getListWarehouseCCDC.listWareHouse);
    }
    this.selectKho = this.listWarehouse[0]
    // let tenDotKiemKe = this.tenDotKiemKe;
    // let ngayBatDau = this.ngayBatDau ? convertToUTCTime(new Date(this.ngayBatDau)) : null;
    // let ngayKetThuc = this.ngayKetThuc ? convertToUTCTime(new Date(this.ngayKetThuc)) : null;
    // let listTrangThai = this.listTrangThai ? this.listTrangThai.map(x => x.value) : [];
    this.assetService.dotKiemKeSearch("", "", "", "").subscribe(response => {
      var result = <any>response;
      this.loading = false;
      if (result.statusCode == 200) {
        console.log(result.listDotKiemKe);
        this.data = result.listDotKiemKe;

        this.listData = [];

        this.data.forEach(item => {
          item.level = 1;
          let nodeRoot: TreeNode = { data: item, children: this.mappingTreeData(item.listDotKiemKeChild, item.level + 1) }
          this.listData.push(nodeRoot);
        });
        console.log(this.listData);
      }
    });
  }

  mappingTreeData(lstChildren, level) {
    let result: Array<TreeNode> = [];
    if (lstChildren != null) {
      lstChildren.forEach(item => {
        item.level = level;
        let nodeRoot: TreeNode = { data: item, children: this.mappingTreeData(item.listDotKiemKeChild, level + 1) };
        result.push(nodeRoot);
      });
    }
    return result;
  }

  changeKho(event) {
    this.selectKho = event.value
  }
  save() {


  }

  goToDetail(data) {
    if (data.warehouseId != null)
      this.router.navigate(["/warehouse/kiem-ke-kho/detail", { dotkiemkeId: data.dotKiemKeId, warehouseId: data.warehouseId }]);
  }
  xoaData() {

  }
  TaoDotKiemKe() {
    if (!this.dotKiemKeFormGroup.valid) {
      Object.keys(this.dotKiemKeFormGroup.controls).forEach(key => {
        if (this.dotKiemKeFormGroup.controls[key].valid == false) {
          this.dotKiemKeFormGroup.controls[key].markAsTouched();
        }
      });
    } else {
      let ngayBatDau = convertToUTCTime(new Date(this.ngayBatDauControl.value));
      this.assetService.taoDotKiemKe(ngayBatDau, this.khoKiemKeControl.value?.warehouseId, null).subscribe(response => {
        var result = <any>response;
        if (result.statusCode == 200) {
          let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.message };
          this.showMessage(mgs);
          this.getMasterData();
          this.showTaoMoi = false;
        } else {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.message };
          this.showMessage(mgs);
        }
      });
    }
  }

}

// mappingModeltoForm(){
//   let kiemKeModel = new KiemKeModel();

//   kiemKeModel.DotKiemKeId = null;
//   kiemKeModel.ThangKiemKe = this.

// }

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

function getCountMonth(startDate, endDate) {
  if (startDate == null || startDate == undefined)
    return 0;
  else
    return (
      endDate.getMonth() -
      startDate.getMonth() +
      12 * (endDate.getFullYear() - startDate.getFullYear())
    );
}
function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
