import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';

import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { ManufactureService } from '../../services/manufacture.service';
import { DialogModule } from 'primeng/dialog';
import { TreeNode } from 'primeng/api';
import { async } from '@angular/core/testing';

interface StatusProductionOrder {
  categoryId: string;
  categoryName: string;
}

@Component({
  selector: 'app-production-order-list',
  templateUrl: './production-order-list.component.html',
  styleUrls: ['./production-order-list.component.css']
})

export class ProductionOrderListComponent implements OnInit {
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  loading: boolean = false;

  listProductOrder: Array<any> = [];
  productionOrderCode: string = "";
  selectedColumns: any[];
  colsListProductionOrder: any;
  innerWidth: number = 0;

  // Filter
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  emtyGuid: string = '00000000-0000-0000-0000-000000000000'

  // My table
  @ViewChild('myTable') myTable: Table;

  constructor(
    private manufactureService: ManufactureService,
    private messageService: MessageService,
    private router: Router,
    private getPermission: GetPermission,
    private confirmationService: ConfirmationService,
  ) {
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    let resource = "man/manufacture/production-order/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    } else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
    }

    this.initTable();
    this.loading = true;
    this.getMasterData();
  }

  initTable() {
    this.colsListProductionOrder = [
      { field: 'stt', header: 'stt', textAlign: 'center', display: 'table-cell', width: '5%' },
      { field: 'productionCode', header: 'M?? l???nh', textAlign: 'center', display: 'table-cell', width: '25%' },
      { field: 'createdDate', header: 'Ng??y t???o', textAlign: 'center', display: 'table-cell', width: '20%' },
      { field: 'productCount', header: 'S??? l?????ng s???n ph???m', textAlign: 'center', display: 'table-cell', width: '15%' },
      { field: 'lotNoCount', header: 'S??? l?? s???n xu???t', textAlign: 'center', display: 'table-cell', width: '15%' },
      { field: 'setting', header: 'Thao t??c', textAlign: 'center', display: 'table-cell', width: '20%' },
      // { field: 'isChangeTech', header: '?????i QT', textAlign: 'left', display: 'table-cell', width: '5%' },
    ];
    this.selectedColumns = this.colsListProductionOrder;
  }

  getMasterData() {
    this.loading = true;
    this.manufactureService.getAllProductionProcess(0, 0, this.productionOrderCode).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listProductOrder = result.processModels;
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
      }
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  refreshFilter() {
    this.productionOrderCode = "";
    this.listProductOrder = [];
    this.isShowFilterLeft = false;
    this.isShowFilterTop = false;
    this.leftColNumber = 12;
    this.rightColNumber = 0;

    this.loading = true;
    this.getMasterData();
  }

  // Show filter
  leftColNumber: number = 12;
  rightColNumber: number = 0;
  showFilter() {
    if (this.innerWidth < 1024) {
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

  searchProductionOrder() {
    this.loading = true;
    this.listProductOrder = [];
    this.getMasterData();
  }

  gotoProductionOrderDetail(productionOrderId: string) {
    this.router.navigate(['/manufacture/production-order/detail', { productionOrderId: productionOrderId }]);
    //let url = '/manufacture/production-order/detail' + ';productionOrderId=' + productionOrderId;
    //window.open(url, "_blank");
  }

  async goToCreate() {
    this.loading = true;
    let processModel = {
      id: 0,
      createdBy: this.emtyGuid,
      createdDate: new Date(),
      detailModels: [],
      productCount: 0,
      lotNoCount: 0
    };
    let [createResponse]: any = await Promise.all([
      this.manufactureService.saveProductionProcessAsync(processModel)
    ]);
    this.loading = false;
    if (createResponse.statusCode == 200) {
      this.router.navigate(['/manufacture/production-order/create', { productionOrderId: createResponse.model.id }]);
    }

    //this.router.navigate(['/manufacture/production-order/create']);
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

  removeRowData(rowData) {
    if (rowData.detailModels.filter(c => c.statusCode == "TTLNCSX").length == rowData.detailModels.length) {
      this.confirmationService.confirm({
        message: "B???n c?? ch???c ch???n mu???n x??a?",
        accept: () => {
          this.loading = true;
          this.manufactureService.deleteProductionProcess(rowData.id).subscribe(response => {
            let result: any = response;
            if (result.statusCode == 200) {
              this.getMasterData();
              this.showToast("success", "Th??ng b??o", "X??a th??nh c??ng");
            }
            else {
              this.clearToast();
              this.showToast("error", "Th??ng b??o", result.message);
            }

            this.loading = false;
          });
        },
      });
    }
    else {
      this.showToast("warn", "Th??ng b??o", "???? c?? l?? ??ang s???n xu???t, kh??ng ???????c ph??p x??a.");
    }
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = str.toString().replace(/,/g, '');
  return parseFloat(str);
};
