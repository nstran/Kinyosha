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
import { ExportTrackProductionDialogComponent } from '../../component/export-track-production-dialog/export-track-production-dialog.component';
import { ViewRememberItemDialogComponent } from '../../component/view-remember-item-dialog/view-remember-item-dialog.component';
import { DialogService } from 'primeng';
import { TreeNode } from 'primeng/api';
import { WarehouseService } from '../../../warehouse/services/warehouse.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//import { TIME_REFRESH } from '../../../../assets/config/setTimeRefresh';

@Component({
  selector: 'app-track-production',
  templateUrl: './track-production.component.html',
  styleUrls: ['./track-production.component.css']
})
export class TrackProductionComponent implements OnInit {
  id_page: any;
  loading: boolean = false;
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  cols: any;
  selectedColumns: any[];

  listSpecifications: any;
  colNotUsed: any;

  categoryTypeModellist: any = [];
  comfirmCancelForm: FormGroup;
  productionNumberReuse: FormControl;
  selectWareHouseTSD: FormControl;
  selectWareHouseCSX: FormControl;

  //Search
  lotNo: string;
  selectProduct: any;
  selectStatus: any;
  startDate: any;
  endDate: any;

  first: number = 0;

  // Droplist
  productList: any = [];
  statusList: Array<any> = new Array<any>();

  //Table
  @ViewChild('myTable') myTable: Table;
  listProductionTracking: TreeNode[] = [];
  level: number = 0;

  displayCreateLo: boolean = false;
  displayStart: boolean = false;
  chooseRowData: any = null;
  numberNeedManufacturingDialog: number = 0;
  displayCancelLo: boolean = false;
  productionNumber: number;
  productionNumberRemaining: number;

  wareHouseTSD: any;
  wareHouseCSX: any;

  constructor(
    private router: Router,
    private getPermission: GetPermission,
    private manufactureService: ManufactureService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private categoryService: CategoryService,
  ) { }

  async ngOnInit() {
    this.initForm();
    let resource = "man/manufacture/track-production/track";
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

    $("body").addClass("sidebar-collapse");
    this.initTable();

    this.getMasterData();
  }

  initTable() {
    this.cols = [
      { field: 'lotNoName', header: 'LOT.NO', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'productName', header: 'Tên thành phẩm', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'startDate', header: 'Ngày bắt đầu', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'endDate', header: 'Ngày dự kiến kết thúc/Ngày kết thúc', width: '10%', textAlign: 'left', display: 'table-cell' },
      { field: 'stageProgress', header: 'Công đoạn đang thực hiện', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'statusName', header: 'Trạng thái', width: '8%', textAlign: 'center', display: 'table-cell' },
      { field: 'productionNumber', header: 'Số lượng sản xuất', width: '5%', textAlign: 'center', display: 'table-cell' },
      { field: 'quantityReached', header: 'Số lượng đạt', width: '5%', textAlign: 'center', display: 'table-cell' },
      { field: 'description', header: 'Diễn giải', width: '15%', textAlign: 'center', display: 'table-cell' },
      { field: 'setting', header: 'Thao tác', width: '17%', textAlign: 'center', display: 'table-cell' }
    ];
    this.selectedColumns = this.cols;

    this.colNotUsed = [
      { field: 'productName', header: 'Tên NVL', width: '20%', textAlign: 'center', display: 'table-cell' },
      { field: 'lotNoName', header: 'LOT.NO', width: '20%', textAlign: 'center', display: 'table-cell' },
      { field: 'productUnitName', header: 'Đơn vị tính', width: '15%', textAlign: 'center', display: 'table-cell' },
      { field: 'productionNumber', header: 'Số lượng đã xuất', width: '20%', textAlign: 'center', display: 'table-cell' },
      { field: 'quantityNotProduced', header: 'Số lượng chưa sử dụng', width: '25%', textAlign: 'center', display: 'table-cell' },
    ];
  }

  initForm() {
    this.productionNumberReuse = new FormControl(null, [Validators.required, forbiddenNumber]);
    this.selectWareHouseTSD = new FormControl(null, [Validators.required]);
    this.selectWareHouseCSX = new FormControl(null, [Validators.required]);
    this.comfirmCancelForm = new FormGroup({
      productionNumberReuse: this.productionNumberReuse,
      selectWareHouseTSD: this.selectWareHouseTSD,
      selectWareHouseCSX: this.selectWareHouseCSX,
    });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  async getMasterData() {
    this.loading = true;
    let [productResponse, categoryResponse, warehouseTSDResponse, warehouseCSXResponse]: any = await Promise.all([
      this.productService.searchProductAsync(1, '', ''),
      this.categoryService.getAllCategoryAsync(),
      this.warehouseService.getListWareHouseAsync(2, null),
      this.warehouseService.getListWareHouseAsync(3, null)
    ]);
    if (productResponse.statusCode == 200) {
      this.productList = productResponse.productList;
    }

    if (warehouseCSXResponse.statusCode == 200) {
      this.wareHouseTSD = warehouseTSDResponse.listWareHouse;
    }

    if (warehouseCSXResponse.statusCode == 200) {
      this.wareHouseCSX = warehouseCSXResponse.listWareHouse;
    }

    if (categoryResponse.statusCode == 200) {
      this.categoryTypeModellist = categoryResponse.categoryTypeList;
      this.statusList = [{ categoryId: null, categoryName: "Tất cả", categoryCode: null }];

      let statusLst = categoryResponse.categoryTypeList.find(c => c.categoryTypeCode == 'LSX')?.categoryList ?? [];
      statusLst.forEach(item => {
        this.statusList.push({ categoryId: item.categoryId, categoryName: item.categoryName, categoryCode: item.categoryCode });
      });

      this.selectStatus = this.statusList.find(s => s.categoryCode == 'TTLNDCSX');
    }

    this.searchFilter();
    this.loading = false;
  }

  ngOnDestroy() {
    $("body").removeClass("sidebar-collapse");
    if (this.id_page) {
      clearInterval(this.id_page);
    }
  }

  selectPaidDate() {
    //let paidDate: Date = this.paidDate.value;
    //this.maxVouchersDate = paidDate;
    //if (paidDate < this.vouchersDate.value) {
    //  this.vouchersDate.setValue(paidDate);
    //}
  }
  refreshFilter() {
    this.lotNo = null;
    this.selectProduct = [];
    this.selectStatus = this.statusList.find(s => s.categoryCode == 'TTLNDCSX'); // this.statusList[0];
    this.startDate = null;
    this.endDate = null;

    this.searchFilter();
  }

  async searchFilter() {
    this.loading = true;
    var statusId = this.selectStatus != null ? this.selectStatus.categoryId : null;
    var lstProductId = [];  
    if (this.selectProduct != null && this.selectProduct != undefined) {
      this.selectProduct.forEach(item => {
        lstProductId.push(item.productId)
      });
    }
    var startDate = (this.startDate != null && this.startDate != undefined) ? convertToUTCTime(this.startDate) : this.startDate;
    var endDate = (this.endDate != null && this.endDate != undefined) ? convertToUTCTime(this.endDate) : this.endDate;

    let [resultResponse]: any = await Promise.all([
      this.manufactureService.getProductionProcessDetailByProductIdAsync(this.lotNo, lstProductId, statusId, startDate, endDate),
    ]);
    if (resultResponse.statusCode == 200) {
      var result = resultResponse.models;
      this.listProductionTracking = [];
      result.forEach(item => {
        item.level = this.level = 1;
        let nodeRoot: TreeNode = { data: item, children: this.mappingTreeData(item.listChildProductionProcessDetail) }
        if (nodeRoot.children != null && nodeRoot.children != undefined && nodeRoot.children.length > 0) {
          nodeRoot.data.statusName = '';
        }
        this.listProductionTracking.push(nodeRoot);
      });
      this.chooseRowData = null;
      this.first = 0;
    }

    this.loading = false;
  }

  mappingTreeData(lstChildren) {
    let result: Array<TreeNode> = [];
    this.level += 1;
    if (lstChildren != null) {
      lstChildren.forEach(item => {
        item.level = this.level;
        let nodeRoot: TreeNode = { data: item, children: this.mappingTreeData(item.listChildProductionProcessDetail) };
        result.push(nodeRoot);
      });
    }
    return result;
  }

  goToDetailLo(rowData) {
    let type = 1;
    if (rowData.statusCode != 'TTLNCSX' && (rowData.listChildProductionProcessDetail == null || rowData.listChildProductionProcessDetail == undefined || rowData.listChildProductionProcessDetail.length == 0)) {
      type = 3;
    }
    else {
      if (rowData.listChildProductionProcessDetail != null && rowData.listChildProductionProcessDetail != undefined && rowData.listChildProductionProcessDetail.length > 0) {
        type = 2;
      }
      else {
        type = 1;
      }
    }
    this.router.navigate(['/manufacture/lot-no/information', { id: rowData.id, type: type }]);
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

  changeStatusManufacture(rowData, action, isActive) {
    var id = rowData.id;
    var noteComfirm = '';
    var status = null;
    if (rowData == null) {
      status = this.statusList.find(c => c.categoryCode == 'TTLNBD');
      noteComfirm = 'Bạn chắc chắn muốn bắt đầu sản xuất lô ' + rowData.lotNoName + ' của sản phẩm ' + rowData.productName;
    }
    else {
      this.chooseRowData = rowData;
      console.log(this.chooseRowData)
      switch (action) {
        case 'BD':
          if (isActive) {
            this.cancelStart();
          }
          else {
            if (rowData.level == 1) {
              this.displayStart = true;
            }
            else {
              isActive = true;
            }
          }
          noteComfirm = 'Bạn chắc chắn muốn bắt đầu sản xuất lô ' + rowData.lotNoName + ' của sản phẩm ' + rowData.productName;
          status = this.statusList.find(c => c.categoryCode == 'TTLNBD');
          break;
        case 'TT':
          if (rowData.productInputs == null || rowData.productInputs == undefined || rowData.productInputs.length == 0) {
            noteComfirm = 'Bạn chắc chắn muốn tiếp tục sản xuất lô ' + rowData.lotNoName + ' của sản phẩm ' + rowData.productName;
            status = this.statusList.find(c => c.categoryCode == 'TTLNBD');
          }
          else {
            noteComfirm = 'Bạn chắc chắn muốn tiếp tục sản xuất lô ' + rowData.lotNoName + ' của sản phẩm ' + rowData.productName;
            status = this.statusList.find(c => c.categoryCode == 'TTLNDCSX');
          }
          break;
        case 'TD':
          noteComfirm = 'Bạn chắc chắn muốn tạm dừng sản xuất lô ' + rowData.lotNoName + ' của sản phẩm ' + rowData.productName;
          status = this.statusList.find(c => c.categoryCode == 'TTLNTD');
          break;
        case 'H':
          this.listSpecifications = (this.chooseRowData.productInputs == null || this.chooseRowData.productInputs == undefined) ? [] : this.chooseRowData.productInputs;
          this.displayCancelLo = true;
          this.productionNumberReuse.setValue(0);
          this.productionNumberRemaining = this.chooseRowData.productionNumber;
          status = this.statusList.find(c => c.categoryCode == 'TTLNH');
          break;
      }
    }
    if (status != null && status != undefined && isActive) {
      this.confirmationService.confirm({
        message: noteComfirm,
        accept: () => {
          this.loading = true;
          this.manufactureService.saveStatusProductionProcessDetailById(id, status.categoryId, rowData.startDate, rowData.endDate).subscribe(response => {
            let result: any = response;
            if (result.statusCode == 200) {
              this.searchFilter();
              this.showToast("success", "Thông báo", "Cập nhập trạng thái sản xuất thành công.");
            }
            else {
              this.clearToast();
              this.showToast("error", "Thông báo", result.message);
            }

            this.loading = false;
          });
        },
      });
    }
  }

  createLoChildren(model) {
    var numLoChildren = 0;
    if (model.listChildProductionProcessDetail != null && model.listChildProductionProcessDetail != undefined) {
      model.listChildProductionProcessDetail.forEach(item => {
        numLoChildren += item.productionNumber;
      });
    }
    this.numberNeedManufacturingDialog = model.productionNumber - numLoChildren;
    this.displayCreateLo = true;
  }

  cancelStart() {
    this.chooseRowData = null;
    this.displayStart = false;
    this.displayCancelLo = false;
  }

  cancelCretaLo() {
    this.displayCreateLo = false;
    this.cancelStart();
  }

  createLoNo() {
    if (this.productionNumber > this.numberNeedManufacturingDialog || this.productionNumber < 1) {
      this.clearToast();
      this.showToast("error", "Thông báo", "Số lượng sản xuất phải lớn hơn 0 và nhỏ hơn hoặc bằng số lượng cần sản xuất.");
    }
    else {
      this.loading = true;
      var request = { ...this.chooseRowData };
      request.productionNumber = this.productionNumber;
      request.prentId = this.chooseRowData.id;
      request.id = 0;

      var statustNewLotNo = this.statusList.find(s => s.categoryCode == 'TTLNCSX');
      request.statusCode = 'TTLNCSX';
      request.statusId = statustNewLotNo?.categoryId;
      request.statusName = statustNewLotNo?.categoryName;

      this.manufactureService.createProductionProcessDetail(request).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.showToast("success", "Thông báo", "Tạo lô con thành công");
          this.searchFilter();
        }
        else {
          this.clearToast();
          this.showToast("error", "Thông báo", result.message);
        }
        this.cancelCretaLo();
        this.loading = false;
      });
    }
  }

  changeNumberReuse() {
    this.productionNumberRemaining = this.chooseRowData.productionNumber - this.productionNumberReuse.value;
  }

  onRowRemove(rowdata) {
    this.confirmationService.confirm({
      message: "Bạn chắc chắn muốn xóa",
      accept: () => {
        this.loading = true;
        this.manufactureService.deleteProductionProcessDetailById(rowdata.id).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.searchFilter();
            this.showToast("success", "Thông báo", "Xóa thành công");
          }
          else {
            this.clearToast();
            this.showToast("error", "Thông báo", result.message);
          }

          this.loading = false;
        });
      },
    });
  }
  comfirmCancel() {
    if (this.chooseRowData != null && this.chooseRowData.statusCode != 'TTLNBD' && (this.chooseRowData.stageFinish == null || this.chooseRowData.stageFinish == undefined || this.chooseRowData.stageFinish == '')) {
      if (!this.comfirmCancelForm.valid) {
        Object.keys(this.comfirmCancelForm.controls).forEach(key => {
          if (this.comfirmCancelForm.controls[key].valid == false) {
            this.comfirmCancelForm.controls[key].markAsTouched();
          }
        });
      } else {
        this.manufactureService.cancelProductionProcessDetailById(this.chooseRowData.id, this.selectWareHouseTSD.value.warehouseId, this.productionNumberReuse.value, this.productionNumberRemaining, this.selectWareHouseCSX.value.warehouseId, this.listSpecifications).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.cancelStart();
            this.searchFilter();
            this.showToast("success", "Thông báo", "Hủy thành công");
          }
          else {
            this.clearToast();
            this.showToast("error", "Thông báo", result.message);
          }
          this.loading = false;
        });
      }
    }
    else {
      this.loading = true;
      let status = this.statusList.find(c => c.categoryCode == 'TTLNH');
      this.manufactureService.saveStatusProductionProcessDetailById(this.chooseRowData.id, status.categoryId, null, null).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.cancelStart();
          this.searchFilter();
          this.showToast("success", "Thông báo", "Cập nhập trạng thái sản xuất thành công.");
        }
        else {
          this.clearToast();
          this.showToast("error", "Thông báo", result.message);
        }

        this.loading = false;
      });
    }
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
};

function forbiddenNumber(control: FormControl) {
  let text = control.value;
  if (text == 0) {
    return {
      forbiddenNumber: {
        parsedDomain: text
      }
    }
  }
  return null;
}
