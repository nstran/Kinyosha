import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeViewComponent, NodeSelectEventArgs } from "@syncfusion/ej2-angular-navigations"
import { Router, ActivatedRoute } from '@angular/router';

/*COMPONENTS*/
import { PopupComponent } from '../../../../shared/components/popup/popup.component';
import { WarehouseCreateUpdateComponent } from '../warehouse-create-update/warehouse-create-update.component';
/*END*/

/*MODELS*/
import { WarehouseModel } from '../../../models/warehouse.model';
/*END*/

/*SERVICES*/
import { GetPermission } from '../../../../shared/permission/get-permission'
import { WarehouseService } from "../../../services/warehouse.service";
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
/*END*/

class warehouseModel {
  warehouseName: string;
  warehouseAddress: string;
  canAddChild: boolean;
  canRemove: boolean;
  hasChild: boolean;
  storagekeeper: string;
  storagekeeperName: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseDescription: string;
  warehouseParent: string;
  department: string;
  wareHouseType: string;
}

@Component({
  selector: 'app-warehouse-list',
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css'],
  providers: [DialogService, MessageService, ConfirmationService]
})

export class WarehouseListComponent implements OnInit {
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  loading: boolean = false;
  //action variables
  actionAdd: boolean = true;
  actionDelete: boolean = true;
  actionEdit: boolean = true;
  //tree variables
  selectedWarehouse: Array<any> = [];
  childOfSelectedWarehouse: Array<any> = [];
  //table
  cols: any;
  selectedColumns: any;
  colsChild: any;
  selectedColumnsChild: any;
  listDetailWarehouse: Array<warehouseModel> = [];
  listChildWarehouse: Array<warehouseModel> = [];
  //master data
  listWareHouse: Array<warehouseModel> = [];
  @ViewChild('tree')
  public tree: TreeViewComponent;
  public listfields: Object;
  public loadRoutingContent(args: NodeSelectEventArgs): void {
    let data: any = this.tree.getTreeData(args.node)[0];
    this.listDetailWarehouse = [data];
    this.listChildWarehouse = this.listWareHouse.filter(e => e.warehouseParent == data.warehouseId);
  }

  constructor(
    private router: Router,
    private warehouseService: WarehouseService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    public messageService: MessageService,
    private getPermission: GetPermission,
  ) { }

  async ngOnInit() {
    let resource = "war/warehouse/list";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let msg = {
        severity: 'warn',
        summary: 'Th??ng b??o:',
        detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???'
      };
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
      this.initTable();
      this.getMasterdata();
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  initTable() {
    this.cols = [
      { field: 'warehouseName', header: 'T??n', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'warehouseCode', header: 'M??', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'warehouseCodeName', header: 'Lo???i kho', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'departmentName', header: 'B??? ph???n qu???n l??', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'action', header: 'Ch???c n??ng', width: '50px', textAlign: 'center', color: '#f44336' },
    ];
    this.selectedColumns = this.cols;

    // this.colsChild = [
    //   { field: 'warehouseName', header: 'T??n', width: '150px', textAlign: 'left', color: '#f44336' },
    //   { field: 'warehouseCode', header: 'M??', width: '150px', textAlign: 'left', color: '#f44336' },
    //   { field: 'warehouseCodeName', header: 'Lo???i kho', width: '50px', textAlign: 'left', color: '#f44336' },
    //   { field: 'departmentName', header: 'B??? ph???n qu???n l??', width: '50px', textAlign: 'left', color: '#f44336' },
    //   { field: 'action', header: 'Ch???c n??ng', width: '50px', textAlign: 'center', color: '#f44336' },
    // ];
    // this.selectedColumnsChild = this.cols;
  }

  async getMasterdata() {
    this.loading = true;
    let result: any = await this.warehouseService.searchWareHouseAsync();
    this.loading = false;
    if (result.statusCode === 200) {
      this.listWareHouse = result.listWareHouse;
      this.listfields = { dataSource: this.listWareHouse, id: 'warehouseId', parentID: 'warehouseParent', text: 'warehouseName', hasChildren: 'hasChild' };
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  resetState() {
    this.listWareHouse = [];
    this.listDetailWarehouse = [];
    this.listChildWarehouse = [];
  }

  addWareHouse(rowData: warehouseModel) {
    let header: string;
    let listWarehouseNameEqualLevel: Array<string> = [];
    let parentId: string;
    if (rowData == null) {
      listWarehouseNameEqualLevel = this.listWareHouse.filter(e => e.warehouseParent == null).map(e => e.warehouseName);
      parentId = null;
      header = 'Th??m kho';
    } else {
      listWarehouseNameEqualLevel = this.listWareHouse.filter(e => e.warehouseParent == rowData.warehouseId).map(e => e.warehouseName);
      parentId = rowData.warehouseId;
      header = 'Th??m v??? tr??';
    }

    let ref = this.dialogService.open(WarehouseCreateUpdateComponent, {
      header: header,
      data: {
        isEdit: false,
        parentId: parentId,
        listWarehouseNameEqualLevel: listWarehouseNameEqualLevel
      },
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          //tao thanh cong
          this.resetState();
          this.getMasterdata();
          this.clearToast();
          this.showToast('success', 'Th??ng b??o', result.message);
        } else {
          //tao that bai
          this.clearToast();
          this.showToast('error', 'Th??ng b??o', result.message);
        }
      }
    });
  }

  editWarehouse(rowData: warehouseModel) {
    let header: string;
    if (rowData.warehouseParent == null) {
      header = 'Ch???nh s???a kho'
    } else {
      header = 'Ch???nh s???a v??? tr??'
    }

    let listWarehouseNameEqualLevel: Array<string> = [];
    listWarehouseNameEqualLevel = this.listWareHouse.filter(e => e.warehouseParent == rowData.warehouseParent).map(e => e.warehouseName);
    let ref = this.dialogService.open(WarehouseCreateUpdateComponent, {
      header: header,
      data: {
        isEdit: true,
        parentId: rowData.warehouseParent,
        editedWarehouseModel: rowData,
        listWarehouseNameEqualLevel: listWarehouseNameEqualLevel
      },
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          //edit thanh cong
          this.resetState();
          this.getMasterdata();
          this.clearToast();
          this.showToast('success', 'Th??ng b??o', result.message);
        } else {
          //edit that bai
          this.clearToast();
          this.showToast('error', 'Th??ng b??o', result.message);
        }
      }
    });
  }

  removeWarehouse(rowData: warehouseModel) {
    this.confirmationService.confirm({
      message: 'C??c d??? li???u s??? b??? xo??. H??nh ?????ng n??y kh??ng th??? ???????c ho??n t??c, b???n c?? ch???c ch???n mu???n xo???',
      accept: () => {
        this.loading = true;
        this.warehouseService.removeWareHouse(rowData.warehouseId).subscribe(response => {
          this.loading = false;
          let result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.resetState();
            this.getMasterdata();
            this.clearToast();
            this.showToast('success', 'Th??ng b??o', 'X??a th??nh c??ng');
          } else {
            this.clearToast();
            this.showToast('error', 'Th??ng b??o', result.messageCode);
          }
        }, () => this.loading = false);
      }
    });
  }
}


