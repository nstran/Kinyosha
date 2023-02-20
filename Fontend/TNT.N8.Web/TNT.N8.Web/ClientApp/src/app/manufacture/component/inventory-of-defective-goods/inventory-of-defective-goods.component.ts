import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ManufactureService } from '../../services/manufacture.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import * as $ from 'jquery';
import { CategoryService } from '../../../shared/services/category.service';
import { ProductService } from '../../../product/services/product.service';
import { DescriptionErrorDialogComponent } from '../../component/description-error-dialog/description-error-dialog.component';
import { ViewRememberItemDialogComponent } from '../../component/view-remember-item-dialog/view-remember-item-dialog.component';
import { DialogService } from 'primeng';
import { TreeNode } from 'primeng/api';
import { WarehouseService } from '../../../warehouse/services/warehouse.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerCareService } from '../../../customer/services/customer-care.service';

@Component({
  selector: 'app-inventory-of-defective-goods',
  templateUrl: './inventory-of-defective-goods.component.html',
  styleUrls: ['./inventory-of-defective-goods.component.css']
})


export class InventoryOfDefectiveGoodsComponent implements OnInit {
  loading: boolean = false;
  actionDownload: boolean = true;

  selectedColumns: any;
  listStatisticalError: any = [];
  listStatisticalErrorName: any = [];
  idLotNo: any;

  inforStatisticalError: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private getPermission: GetPermission,
    private manufactureService: ManufactureService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private warehouseService: WarehouseService,
    private customerCareService: CustomerCareService,
  ) {
  }

  async ngOnInit() {
    this.initTable();
    let resource = "man/manufacture/inventory-of-defective-goods/create-update";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
    }
    this.route.params.subscribe(params => { this.idLotNo = params['loNoId']; });

    this.getMasterData();
  }

  initTable() {
    this.selectedColumns = [
      { field: 'errorItemName', header: 'Hạng mục lỗi', textAlign: 'left', display: 'table-cell', width: '20%' },
    ];
  }

  async getMasterData() {
    this.loading = true;
    let [detailResponse]: any = await Promise.all([
      this.manufactureService.getProductionProcessDetailErrorByIdAsync(this.idLotNo)
    ]);

    if (detailResponse.statusCode == 200) {
      this.inforStatisticalError = detailResponse;
      this.setColumTable();
      this.setRowTable();
    }
    this.loading = false;
  }

  setColumTable() {
    if (this.inforStatisticalError != null && this.inforStatisticalError != undefined
      && this.inforStatisticalError.errorStageModels != null && this.inforStatisticalError.errorStageModels != undefined) {

      this.initTable();
      var cols = [];
      this.listStatisticalErrorName = [];
      this.inforStatisticalError.errorStageModels.forEach(item => {
        var exitColumn = cols.find(c => c == item.stageGroupCode);
        if (exitColumn == null || exitColumn == undefined) {
          cols.push(item.stageGroupCode);
          var col = { field: item.stageGroupCode, header: item.stageGroupName, textAlign: 'center', display: 'table-cell', width: '20%' };
          this.selectedColumns.push(col);
        }
        var exitRow = this.listStatisticalErrorName.find(c => c == item.errorItemCode);
        if (exitRow == null || exitRow == undefined) {
          this.listStatisticalErrorName.push(item.errorItemCode);
        }
      });
      var col = { field: 'sum', header: 'Tổng số', textAlign: 'center', display: 'table-cell', width: '20%' };
      this.selectedColumns.push(col);
    }
  }

  setRowTable() {
    if (this.inforStatisticalError != null && this.inforStatisticalError != undefined
      && this.inforStatisticalError.errorStageModels != null && this.inforStatisticalError.errorStageModels != undefined) {
      this.listStatisticalError = [];
      var groupLineEror = [];
      this.listStatisticalErrorName.forEach(rw => {
        groupLineEror.push(this.inforStatisticalError.errorStageModels.filter(c => c.errorItemCode == rw).sort((a, b) => a.errorItemCode > b.errorItemCode ? 1 : -1));
      });

      groupLineEror.forEach(row => {
        var rowData = new Object();
        this.selectedColumns.forEach(col => {
          if (col.field != 'errorItemName' && col.field != 'sum') {
            row.forEach(item => {
              if (col.field == item.stageGroupCode) {
                rowData[col.field] = item.errorNumber ?? 0;
              }
            });
          } else {
            if (col.field == 'errorItemName') {
              rowData['errorItemName'] = row[0].errorItemName;
            }
            if (col.field == 'sum') {
              rowData['sum'] = row.reduce((accumulator, object) => {
                return accumulator + object.errorNumber;
              }, 0);
            }
          }
        });
        this.listStatisticalError.push(rowData);
      });
    }
  }
  goToBack() {
    this.router.navigate(['/manufacture/lot-no/information', { id: this.idLotNo, type: 3 }]);
  }
}
