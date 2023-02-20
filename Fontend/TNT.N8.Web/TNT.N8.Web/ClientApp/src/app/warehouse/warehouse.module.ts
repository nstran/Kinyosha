import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
//import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { WarehouseRouting } from './warehouse.routing';

/* Services */
import { CategoryService } from "../shared/services/category.service";
import { WarehouseService } from "./services/warehouse.service";
import { EmployeeService } from "../employee/services/employee.service";
import { VendorService } from "./../vendor/services/vendor.service";
import { ProductCategoryService } from '../admin/components/product-category/services/product-category.service';
import { CustomerService } from '../customer/services/customer.service';
import { ProductService } from '../product/services/product.service';
import { GetPermission } from '../shared/permission/get-permission';
import { ImageUploadService } from '../shared/services/imageupload.service';
import { ForderConfigurationService } from '../admin/components/folder-configuration/services/folder-configuration.service';

/* End */

/* Component */
import { WarehouseComponent } from './warehouse.component';
import { WarehouseCreateUpdateComponent } from './components/warehouse/warehouse-create-update/warehouse-create-update.component';
import { WarehouseListComponent } from './components/warehouse/warehouse-list/warehouse-list.component';
import { PopupCreateSerialComponent } from './components/serial/pop-create-serial/pop-create-serial.component';
import { TreeWarehouseComponent } from './components/tree-warehouse/tree-warehouse.component';
import { InventoryReceivingVoucherListComponent } from './components/inventory-receiving-voucher/inventory-receiving-voucher-list/inventory-receiving-voucher-list.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { InventoryDeliveryVoucherCreateUpdateComponent } from './components/inventory-delivery-voucher/inventory-delivery-voucher-create-update/inventory-delivery-voucher-create-update.component';
import { InventoryDeliveryVoucherListComponent } from './components/inventory-delivery-voucher/inventory-delivery-voucher-list/inventory-delivery-voucher-list.component';
/* End */
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { EditableRow, TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TreeModule } from 'primeng/tree';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';

import { DeliveryvoucherCreateSerialComponent } from './components/serial/deliveryvoucher-create-serial/deliveryvoucher-create-serial.component';
import { InStockReportComponent } from './components/in-stock-report/in-stock-report.component';
import { InventoryReceivingVoucherCreateComponent } from './components/inventory-receiving-voucher/inventory-receiving-voucher-create/inventory-receiving-voucher-create.component';
import { InventoryReceivingVoucherDetailComponent } from './components/inventory-receiving-voucher/inventory-receiving-voucher-detail/inventory-receiving-voucher-detail.component';
import { DeNghiXuatKhoListComponent } from './components/de-nghi-xuat-kho/de-nghi-xuat-kho-list/de-nghi-xuat-kho-list.component';
import { DeNghiXuatKhoCreateComponent } from './components/de-nghi-xuat-kho/de-nghi-xuat-kho-create/de-nghi-xuat-kho-create.component';
import { InventoryDeliveryVoucherDetailComponent } from './components/inventory-delivery-voucher/inventory-delivery-voucher-detail/inventory-delivery-voucher-detail.component';
import { DeNghiXuatKhoDetailComponent } from './components/de-nghi-xuat-kho/de-nghi-xuat-kho-detail/de-nghi-xuat-kho-detail.component';
import { DanhSachXuatComponent } from './components/kho-thanh-pham/danh-sach-xuat/danh-sach-xuat.component';
import { ChiTietXuatComponent } from './components/kho-thanh-pham/chi-tiet-xuat/chi-tiet-xuat.component';
import { DanhSachNhapComponent } from './components/kho-thanh-pham/danh-sach-nhap/danh-sach-nhap.component';
import { ChiTetNhapComponent } from './components/kho-thanh-pham/chi-tet-nhap/chi-tet-nhap.component';
import { TaoMoiXuatComponent } from './components/kho-thanh-pham/tao-moi-xuat/tao-moi-xuat.component';
import { KiemKeKhoListComponent } from './components/kiem-ke-kho/kiem-ke-kho-list/kiem-ke-kho-list.component';
import { KiemKeKhoDetailComponent } from './components/kiem-ke-kho/kiem-ke-kho-detail/kiem-ke-kho-detail.component';
import { NhapKhoComponent } from './components/kho-san-xuat/nhap-kho/nhap-kho.component';
import { BaoCaoTonKhoComponent } from './components/kho-thanh-pham/bao-cao-ton-kho/bao-cao-ton-kho.component';
import { NhapKhoDetailComponent } from './components/kho-san-xuat/nhap-kho-detail/nhap-kho-detail.component';
import { DanhSachXuatKhoComponent } from './components/kho-san-xuat/danh-sach-xuat-kho/danh-sach-xuat-kho.component';
import { TaoMoiXuatKhoComponent } from './components/kho-san-xuat/tao-moi-xuat-kho/tao-moi-xuat-kho.component';
import { ChiTietPhieuXuatComponent } from './components/kho-san-xuat/chi-tiet-phieu-xuat/chi-tiet-phieu-xuat.component';
import { BaoCaoTonKhoSanXuatComponent } from './components/kho-san-xuat/bao-cao-ton-kho-san-xuat/bao-cao-ton-kho-san-xuat.component';
import { TaoMoiNhapComponent } from './components/kho-thanh-pham/tao-moi-nhap/tao-moi-nhap.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    WarehouseRouting,
    FormsModule,
    ReactiveFormsModule,
    //TreeViewModule,
    PanelModule,
    FieldsetModule,
    AccordionModule,
    RadioButtonModule,
    InputTextModule,
    DropdownModule,
    AutoCompleteModule,
    TableModule,
    TreeTableModule,
    CalendarModule,
    MultiSelectModule,
    DynamicDialogModule,
    TreeModule,
    DialogModule,
    EditorModule,
    FileUploadModule,
    ToastModule,
    SidebarModule,
    ConfirmDialogModule,
    NgxLoadingModule.forRoot({}),
  ],
  declarations: [
    WarehouseComponent,
    WarehouseCreateUpdateComponent,
    WarehouseListComponent,
    //TreeViewComponent
    PopupCreateSerialComponent,
    TreeWarehouseComponent,
    InventoryReceivingVoucherListComponent,
    AddProductComponent,
    InventoryDeliveryVoucherCreateUpdateComponent,
    InventoryDeliveryVoucherListComponent,
    InventoryDeliveryVoucherDetailComponent,
    DeliveryvoucherCreateSerialComponent,
    InStockReportComponent,
    InventoryReceivingVoucherCreateComponent,
    InventoryReceivingVoucherDetailComponent,
    DeNghiXuatKhoListComponent,
    DeNghiXuatKhoCreateComponent,
    DeNghiXuatKhoDetailComponent,
    DanhSachXuatComponent,
    ChiTietXuatComponent,
    DanhSachNhapComponent,
    ChiTetNhapComponent,
    TaoMoiXuatComponent,
    KiemKeKhoListComponent,
    KiemKeKhoDetailComponent,
    BaoCaoTonKhoComponent,
    NhapKhoComponent,
    NhapKhoDetailComponent,
    DanhSachXuatKhoComponent,
    TaoMoiXuatKhoComponent,
    ChiTietPhieuXuatComponent,
    BaoCaoTonKhoSanXuatComponent,
    TaoMoiNhapComponent,
  ],
  providers: [
    WarehouseComponent,
    WarehouseService,
    VendorService,
    CategoryService,
    DynamicDialogRef,
    DialogService,
    MessageService,
    EmployeeService,
    ProductCategoryService,
    CustomerService,
    ProductService,
    GetPermission,
    ConfirmationService,
    ImageUploadService,
    // EditableRow,
    ForderConfigurationService,
  ],
  bootstrap: [PopupCreateSerialComponent, TreeWarehouseComponent],
  entryComponents: [
    PopupCreateSerialComponent,
    TreeWarehouseComponent,
    AddProductComponent,
    DeliveryvoucherCreateSerialComponent,
  ],
})
export class WarehouseModule {}
