import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';

import { WarehouseComponent } from './warehouse.component';
import { WarehouseCreateUpdateComponent } from './components/warehouse/warehouse-create-update/warehouse-create-update.component';
import { WarehouseListComponent } from './components/warehouse/warehouse-list/warehouse-list.component';
import { InventoryReceivingVoucherListComponent } from './components/inventory-receiving-voucher/inventory-receiving-voucher-list/inventory-receiving-voucher-list.component';
import { InventoryDeliveryVoucherCreateUpdateComponent } from './components/inventory-delivery-voucher/inventory-delivery-voucher-create-update/inventory-delivery-voucher-create-update.component';
import { InventoryDeliveryVoucherListComponent } from './components/inventory-delivery-voucher/inventory-delivery-voucher-list/inventory-delivery-voucher-list.component';
import { InStockReportComponent } from './components/in-stock-report/in-stock-report.component';
import { InventoryReceivingVoucherCreateComponent } from './components/inventory-receiving-voucher/inventory-receiving-voucher-create/inventory-receiving-voucher-create.component';
import { InventoryReceivingVoucherDetailComponent } from './components/inventory-receiving-voucher/inventory-receiving-voucher-detail/inventory-receiving-voucher-detail.component';
import { InventoryDeliveryVoucherDetailComponent } from './components/inventory-delivery-voucher/inventory-delivery-voucher-detail/inventory-delivery-voucher-detail.component';
import { DeNghiXuatKhoListComponent } from './components/de-nghi-xuat-kho/de-nghi-xuat-kho-list/de-nghi-xuat-kho-list.component';
import { DeNghiXuatKhoCreateComponent } from './components/de-nghi-xuat-kho/de-nghi-xuat-kho-create/de-nghi-xuat-kho-create.component';
import { DeNghiXuatKhoDetailComponent } from './components/de-nghi-xuat-kho/de-nghi-xuat-kho-detail/de-nghi-xuat-kho-detail.component';
import { KiemKeKhoListComponent } from './components/kiem-ke-kho/kiem-ke-kho-list/kiem-ke-kho-list.component';
import { KiemKeKhoDetailComponent } from './components/kiem-ke-kho/kiem-ke-kho-detail/kiem-ke-kho-detail.component';
import { DanhSachXuatComponent } from './components/kho-thanh-pham/danh-sach-xuat/danh-sach-xuat.component';
import { DanhSachNhapComponent } from './components/kho-thanh-pham/danh-sach-nhap/danh-sach-nhap.component';
import { ChiTetNhapComponent } from './components/kho-thanh-pham/chi-tet-nhap/chi-tet-nhap.component';
import { ChiTietXuatComponent } from './components/kho-thanh-pham/chi-tiet-xuat/chi-tiet-xuat.component';
import { TaoMoiXuatComponent } from './components/kho-thanh-pham/tao-moi-xuat/tao-moi-xuat.component';
import { NhapKhoComponent } from './components/kho-san-xuat/nhap-kho/nhap-kho.component';
import { NhapKhoDetailComponent } from './components/kho-san-xuat/nhap-kho-detail/nhap-kho-detail.component';
import { BaoCaoTonKhoComponent } from './components/kho-thanh-pham/bao-cao-ton-kho/bao-cao-ton-kho.component';
import { DanhSachXuatKhoComponent } from './components/kho-san-xuat/danh-sach-xuat-kho/danh-sach-xuat-kho.component';
import { TaoMoiXuatKhoComponent } from './components/kho-san-xuat/tao-moi-xuat-kho/tao-moi-xuat-kho.component';
import { ChiTietPhieuXuatComponent } from './components/kho-san-xuat/chi-tiet-phieu-xuat/chi-tiet-phieu-xuat.component';
import { BaoCaoTonKhoSanXuatComponent } from './components/kho-san-xuat/bao-cao-ton-kho-san-xuat/bao-cao-ton-kho-san-xuat.component';
import { TaoMoiNhapComponent } from './components/kho-thanh-pham/tao-moi-nhap/tao-moi-nhap.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "",
        component: WarehouseComponent,
        children: [
          {
            path: "warehouse",
            component: WarehouseCreateUpdateComponent,
            canActivate: [AuthGuard],
          },
          // {
          //   path: "inventory-receiving-voucher/create-update",
          //   component: InventoryReceivingVoucherCreateUpdateComponent,
          //   canActivate: [AuthGuard],
          // },
          {
            path: "inventory-receiving-voucher/create",
            component: InventoryReceivingVoucherCreateComponent,
            canActivate: [AuthGuard],
          },

          {
            path: "inventory-receiving-voucher/detail",
            component: InventoryReceivingVoucherDetailComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "inventory-receiving-voucher/list",
            component: InventoryReceivingVoucherListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "list",
            component: WarehouseListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "inventory-delivery-voucher/create-update",
            component: InventoryDeliveryVoucherCreateUpdateComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "inventory-delivery-voucher/detail",
            component: InventoryDeliveryVoucherDetailComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "inventory-delivery-voucher/list",
            component: InventoryDeliveryVoucherListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "in-stock-report/list",
            component: InStockReportComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "de-nghi-xuat-kho/list",
            component: DeNghiXuatKhoListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "de-nghi-xuat-kho/detail",
            component: DeNghiXuatKhoDetailComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "de-nghi-xuat-kho/create",
            component: DeNghiXuatKhoCreateComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "kiem-ke-kho/list",
            component: KiemKeKhoListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "kiem-ke-kho/detail",
            component: KiemKeKhoDetailComponent,
            canActivate: [AuthGuard],
          },

          {
            path: "thanh-pham-xuat/list",
            component: DanhSachXuatComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "thanh-pham-nhap/list",
            component: DanhSachNhapComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "tao-moi-nhap/create",
            component: TaoMoiNhapComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "thanh-pham-nhap/detail",
            component: ChiTetNhapComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "thanh-pham-xuat/detail",
            component: ChiTietXuatComponent,
            canActivate: [AuthGuard],
          },

          {
            path: "thanh-pham-xuat/create",
            component: TaoMoiXuatComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "kho-thanh-pham/bao-cao-ton-kho",
            component: BaoCaoTonKhoComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "kho-san-xuat-nhap/list",
            component: NhapKhoComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "kho-san-xuat-nhap/detail",
            component: NhapKhoDetailComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "danh-sach-xuat-kho/list",
            component: DanhSachXuatKhoComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "tao-moi-xuat-kho/create",
            component: TaoMoiXuatKhoComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "chi-tiet-phieu-xuat/detail",
            component: ChiTietPhieuXuatComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "bao-cao-ton-kho-san-xuat/list",
            component: BaoCaoTonKhoSanXuatComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class WarehouseRouting {}
