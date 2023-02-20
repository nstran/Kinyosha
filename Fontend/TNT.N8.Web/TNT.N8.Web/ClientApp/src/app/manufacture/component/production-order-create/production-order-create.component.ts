import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';
import { ManufactureService } from '../../services/manufacture.service';
import { ProductService } from '../../../product/services/product.service';
import { MessageService, TreeNode } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import 'moment/locale/pt-br';
import * as $ from 'jquery';
import { element } from 'protractor';

@Component({
  selector: 'app-production-order-create',
  templateUrl: './production-order-create.component.html',
  styleUrls: ['./production-order-create.component.css']
})
export class ProductionOrderCreateComponent implements OnInit {
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  @ViewChild('myTable') myTable: Table;

  loading: boolean = false;

  colsFinishedProduct: any;
  colsNVLProduct: any;
  currentUserName: string = localStorage.getItem('UserFullName');
  dateTimeNow: Date = new Date();
  customer: string;
  selectProduct: any;
  selectProcedure: any;
  selectNVL: any;
  productList: any = [];
  nvlList: any = [];
  productionProcess: any;
  productionProcessCode: string;
  createName: string;
  description: string;
  dateCreate: Date = new Date();
  finishedProductList: any = [];
  nvlProductList: any = [];
  configProductList: any = [];
  numberManufacturing: number;
  isValidate: boolean = false;
  emtyGuid: string = '00000000-0000-0000-0000-000000000000';
  productionProcessId: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private manufactureService: ManufactureService,
    private messageService: MessageService,
    private getPermission: GetPermission,
    private productService: ProductService,
    private confirmationService: ConfirmationService,
  ) { }

  async ngOnInit() {
    this.initTable();
    let resource = "man/manufacture/production-order/detail";
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

    this.route.params.subscribe(params => { this.productionProcessId = params['productionOrderId'] });

    this.getMasterData()
  }

  async getMasterData() {
    this.loading = true;
    let [productResponse, productionProcessResponse, productNVLResponse]: any = await Promise.all([
      this.productService.searchProductAsync(1, '', ''),
      this.manufactureService.getProductionProcessById(this.productionProcessId),
      this.productService.searchProductAsync(0, '', ''),
    ]);
    this.productList = productResponse.productList;
    this.nvlList = productNVLResponse.productList;

    if (productionProcessResponse.statusCode == 200) {
      this.productionProcess = productionProcessResponse.model;
      this.finishedProductList = (this.productionProcess != null && this.productionProcess != undefined) ? this.productionProcess.detailModels : null;
      this.productionProcessCode = (this.productionProcess != null && this.productionProcess != undefined) ? this.productionProcess.productionCode : "";
      this.createName = (this.productionProcess != null && this.productionProcess != undefined) ? this.productionProcess.userName : "";
      this.dateCreate = (this.productionProcess != null && this.productionProcess != undefined) ? this.productionProcess.createdDate : new Date();
      this.description = (this.productionProcess != null && this.productionProcess != undefined) ? this.productionProcess.description : "";
    }
    else {
      this.clearToast();
      this.showToast("error", "Thông báo", productionProcessResponse.message);
    }

    this.loading = false;
  }

  async getConfigByProduct() {
    if (this.selectProduct != null && this.selectProduct != undefined) {
      let [getAllConfigProductionResponse]: any = await Promise.all([
        this.manufactureService.getAllConfigProductionAsync('', this.selectProduct.productCode, '', true, 0, 0),
      ]);
      this.configProductList = getAllConfigProductionResponse.configProductions.filter(c => c.availability == true);
      if (this.configProductList != null && this.configProductList != undefined && this.configProductList.length > 0) {
        this.selectProcedure = this.configProductList[0];
      }
      else {
        this.selectProcedure = null;
      }
    }
  }

  initTable() {
    this.colsFinishedProduct = [
      { field: 'stt', header: 'STT', width: '5%' },
      { field: 'productCode', header: 'Mã sản phẩm', textAlign: 'left', display: 'table-cell', width: '15%' },
      { field: 'productName', header: 'Tên sản phẩm', textAlign: 'left', display: 'table-cell', width: '20%' },
      { field: 'lotNoName', header: 'LOT.NO', textAlign: 'right', display: 'table-cell', width: '10%' },
      { field: 'productionNumber', header: 'Số lượng sản phẩm', textAlign: 'right', display: 'table-cell', width: '10%' },
      { field: 'startDate', header: 'Ngày bắt đầu', textAlign: 'right', display: 'table-cell', width: '15%' },
      { field: 'statusName', header: 'Trạng thái', textAlign: 'right', display: 'table-cell', width: '15%' },
      { field: 'setting', header: 'Thao tác', display: 'table-cell', width: '10%' },
    ];

    this.colsNVLProduct = [
      { field: 'stt', header: 'STT', width: '10%' },
      { field: 'productCode', header: 'Mã NVL', textAlign: 'left', display: 'table-cell', width: '30%' },
      { field: 'productName', header: 'Tên NVL', textAlign: 'left', display: 'table-cell', width: '30%' },
      { field: 'productUnitName', header: 'Đơn vị tính', textAlign: 'right', display: 'table-cell', width: '30%' },
    ];
  }

  goToOrderList() {
    this.router.navigate(['/manufacture/production-order/list']);
  }

  remoteDetail(rowdata) {
    if (rowdata.statusCode == 'TTLNCSX') {
      this.confirmationService.confirm({
        message: "Bạn có chắc chắn muốn xóa?",
        accept: () => {
          this.loading = true;
          this.manufactureService.deleteProductionProcessDetailById(rowdata.id).subscribe(response => {
            let result: any = response;
            if (result.statusCode == 200) {
              var remove = this.finishedProductList.indexOf(rowdata);
              if (remove > -1) {
                this.finishedProductList.splice(remove, 1);
              }
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
    else {
      this.showToast("warn", "Thông báo", "Lô đang sản xuất, không được phép xóa.");
    }
  }

  // Lưu lệnh sản xuất
  async saveProductionOrder() {
    this.loading = true;
    this.productionProcess.description = this.description;
    let [createResponse]: any = await Promise.all([
      this.manufactureService.saveProductionProcessAsync(this.productionProcess)
    ]);

    this.loading = false;
    if (createResponse.statusCode == 200) {
      this.showToast("success", "Thông báo", "Chỉnh sửa thành công");
    }
    else {
      this.clearToast();
      this.showToast("error", "Thông báo", createResponse.message);
    }
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

  async goCreateLotNo() {
    if ((this.selectProduct == null || this.selectProduct == undefined)
      || (this.selectProcedure == null || this.selectProcedure == undefined)
      || (this.numberManufacturing == null || this.numberManufacturing == undefined || this.numberManufacturing == 0)) {
      this.isValidate = true;
    }
    else {
      this.isValidate = false;
      this.loading = true;
      let [lotNoResponse]: any = await Promise.all([
        this.manufactureService.createLotNoAsync(this.productionProcess.id, this.selectProcedure.id, this.customer, this.selectProduct.productId, this.numberManufacturing)
      ]);

      this.loading = false;
      if (lotNoResponse.statusCode == 200) {
        if (lotNoResponse.model != null) {
          this.customer = '';
          this.finishedProductList = lotNoResponse.model.detailModels;
        }
      }
    }
  }

  async getInforByNVL() {
    this.loading = true;
    let [inforResponse]: any = await Promise.all([
      this.manufactureService.getConfigurationProductByProductId(this.selectNVL.productid, null, null)
    ]);

    this.loading = false;
    if (inforResponse.statusCode == 200) {
      this.nvlProductList = inforResponse.models;
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
}
