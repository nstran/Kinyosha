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
import { NumberFormat } from '@syncfusion/ej2-base/src/intl/number-formatter';

@Component({
  selector: 'app-lot-no-information',
  templateUrl: './lot-no-infomation.component.html',
  styleUrls: ['./lot-no-infomation.component.css']
})


export class LotNoInformationComponent implements OnInit {
  loading: boolean = false;
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  typePage: number;
  idLotNo: number;

  displayCreateLo: boolean = false;

  inforModel: any = {
    startDate: null,
    endDate: null,
    description: null,
    listChildProductionProcessDetail: [],
    importExportModels: [],
    processStageModels: [],
  };

  // My table
  @ViewChild('myTable') myTable: Table;
  @ViewChild('myTableManu') myTableManu: Table;
  listProductionTracking: any = [];
  selectedColumns: any;
  listProductionLoChil: TreeNode[] = [];
  level: number = 0;

  comfirmCancelForm: FormGroup;
  productionNumberReuse: FormControl;
  selectWareHouseTSD: FormControl;
  selectWareHouseCSX: FormControl;

  selectedPersonInChange: any;
  selectedVerifine: any;
  selectedStatus: any;
  selectedWarehouse: any;
  listImportExportWare: any;

  selectedLoNoChil: any;
  listLoNoChil: any;

  numberNeedManufacturing: number;
  productionNumber: number;
  categoryTypeModellist: any;
  statusList: any;
  statusLotNoList: any;
  errorItemList: any;
  numberNeedManufacturingDialog: number = 0;

  displayStart: boolean = false;
  chooseRowData: any = null;
  chooseRowDataItemQC: any = null;

  listInfoError: any = [];

  displayCancelLo: boolean = false;
  productionNumberRemaining: number;

  displaySample: boolean = false;
  displayListNg: boolean = false;
  displayListError: boolean = false;
  displayStatisticalError: boolean = false;
  selectedStatisticalError: any;
  listStatisticalError: any = [];

  listSpecifications: any;
  colNotUsed: any;

  wareHouseTSD: any;
  wareHouseCSX: any;
  customerList: any;

  colError: any;
  displayViewNg: boolean = false;
  displayViewQC: boolean = false;

  // Filter
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  innerWidth: number = 0;

  //QC
  implementationDate: Date;
  selectedColumnsQC: any;
  startEmp: any = null;
  endEmp: any = null;
  isSaveQC: boolean = false;
  valueSearch: string;

  activeEdit: boolean = true;

  emtyGuid: string = '00000000-0000-0000-0000-000000000000'
  auth: any = JSON.parse(localStorage.getItem("auth"));

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
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    this.initForm();
    let resource = "man/manufacture/lot-no/information";
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
    this.route.params.subscribe(params => { this.idLotNo = params['id']; this.typePage = params['type'] });

    this.initTable();
    this.getMasterData();
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

  initTable() {
    this.selectedColumns = [
      { field: 'stageName', header: 'Công đoạn', textAlign: 'left', display: 'table-cell', width: '20%' },
      { field: 'startDate', header: 'Ngày thực hiện', textAlign: 'center', display: 'table-cell', width: '15%' },
      { field: 'performerName', header: 'Phụ trách', textAlign: 'left', display: 'table-cell', width: '20%' },
      { field: 'statusName', header: 'Trạng thái', textAlign: 'left', display: 'table-cell', width: '15%' },
      { field: 'totalReached', header: 'Số lượng đạt', textAlign: 'center', display: 'table-cell', width: '15%' },
      { field: 'totalNotReached', header: 'Số lượng NG', textAlign: 'center', display: 'table-cell', width: '15%' },
    ];

    this.selectedWarehouse = [
      { field: 'stt', header: 'STT', textAlign: 'center', display: 'table-cell', width: '10%' },
      { field: 'stageName', header: 'Công đoạn', textAlign: 'left', display: 'table-cell', width: '30%' },
      { field: 'inventoryVoucherCode', header: 'Mã phiếu xuất/nhập', textAlign: 'left', display: 'table-cell', width: '20%' },
      { field: 'warehouseName', header: 'Kho xuất/nhập', textAlign: 'left', display: 'table-cell', width: '20%' },
      { field: 'inventoryVoucherDate', header: 'Ngày xuất nhập', textAlign: 'center', display: 'table-cell', width: '20%' },
    ];

    this.selectedLoNoChil = [
      { field: 'lotNoName', header: 'LOT.NO', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'startDate', header: 'Ngày bắt đầu', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'endDate', header: 'Ngày dự kiến kết thúc/Ngày kết thúc', width: '10%', textAlign: 'left', display: 'table-cell' },
      { field: 'stageProgress', header: 'Công đoạn đang thực hiện', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'statusName', header: 'Trạng thái', width: '8%', textAlign: 'center', display: 'table-cell' },
      { field: 'productionNumber', header: 'Số lượng sản xuất', width: '5%', textAlign: 'center', display: 'table-cell' },
      { field: 'quantityReached', header: 'Số lượng đạt', width: '5%', textAlign: 'center', display: 'table-cell' },
      { field: 'description', header: 'Diễn giải', width: '15%', textAlign: 'center', display: 'table-cell' },
      { field: 'setting', header: 'Thao tác', width: '17%', textAlign: 'center', display: 'table-cell' }
    ];

    this.colNotUsed = [
      { field: 'productName', header: 'Tên NVL', width: '20%', textAlign: 'center', display: 'table-cell' },
      { field: 'lotNoName', header: 'LOT.NO', width: '20%', textAlign: 'center', display: 'table-cell' },
      { field: 'productUnitName', header: 'Đơn vị tính', width: '15%', textAlign: 'center', display: 'table-cell' },
      { field: 'productionNumber', header: 'Số lượng đã xuất', width: '20%', textAlign: 'center', display: 'table-cell' },
      { field: 'quantityNotProduced', header: 'Số lượng chưa sử dụng', width: '25%', textAlign: 'center', display: 'table-cell' },
    ];

    this.colError = [
      { field: 'errorItemName', header: 'Hạng mục lỗi', width: '60%', textAlign: 'left', display: 'table-cell' },
      { field: 'errorNumber', header: 'Số lượng', width: '40%', textAlign: 'center', display: 'table-cell' },
    ]

    this.selectedColumnsQC = [
      { field: 'stepByStepStageName', header: 'Công đoạn máy', width: '13%', textAlign: 'left', display: 'table-cell' },
      { field: 'contentStageName', header: 'Nội dung kiểm tra', width: '13%', textAlign: 'left', display: 'table-cell' },
      { field: 'specificationsStageName', header: 'Quy cách/Ghi chú', width: '20%', textAlign: 'left', display: 'table-cell' },
      { field: 'numberOfSamples', header: 'Số mẫu thử', width: '10%', textAlign: 'center', display: 'table-cell' },
      { field: 'response', header: 'Kết quả', width: '44%', textAlign: 'left', display: 'table-cell' },
    ];

    this.selectedStatisticalError = [
      { field: 'stageName', header: 'Công đoạn', width: '13%', textAlign: 'left', display: 'table-cell' },
      { field: 'totalNotReached', header: 'Số lượng', width: '13%', textAlign: 'center', display: 'table-cell' }
    ];
  }

  async getMasterData() {
    this.loading = true;
    let [detailResponse, categoryResponse, warehouseTSDResponse, warehouseCSXResponse, customerResponse]: any = await Promise.all([
      this.manufactureService.getProductionProcessDetailByIdAsync(this.idLotNo),
      this.categoryService.getAllCategoryAsync(),
      this.warehouseService.getListWareHouseAsync(2, null),
      this.warehouseService.getListWareHouseAsync(3, null),
      this.customerCareService.getMasterDataCustomerCareListAsync(this.auth.UserId)
    ]);

    this.customerList = [{ employeeId: '', employeeCode: '', employeeName: 'Tất cả' }];
    this.statusList = [{ categoryId: '', categoryCode: '', categoryName: 'Tất cả' }];

    if (customerResponse.statusCode == 200) {
      this.customerList = this.customerList.concat(customerResponse.listEmployee);
    }

    if (warehouseCSXResponse.statusCode == 200) {
      this.wareHouseTSD = warehouseTSDResponse.listWareHouse;
    }

    if (warehouseCSXResponse.statusCode == 200) {
      this.wareHouseCSX = warehouseCSXResponse.listWareHouse;
    }

    if (categoryResponse.statusCode == 200) {
      this.categoryTypeModellist = categoryResponse.categoryTypeList;

      this.statusList = [{ categoryId: '', categoryCode: '', categoryName: 'Tất cả' }]
      var lstStatus = categoryResponse.categoryTypeList.find(c => c.categoryTypeCode == 'TTCDSX')?.categoryList ?? [];
      this.statusList = this.statusList.concat(lstStatus);
      //this.errorItemList = categoryResponse.categoryTypeList.find(c => c.categoryTypeCode == 'KTL')?.categoryList ?? [];
      this.statusLotNoList = categoryResponse.categoryTypeList.find(c => c.categoryTypeCode == 'LSX')?.categoryList ?? [];
    }

    this.selectedPersonInChange = this.customerList[0];
    this.selectedVerifine = this.customerList[0];
    this.selectedStatus = this.statusList[0];

    if (detailResponse.statusCode == 200) {
      if (detailResponse.model != null && detailResponse.model != undefined) {
        this.inforModel = detailResponse.model;
        this.listProductionTracking = [...this.inforModel.processStageModels];
        if (this.inforModel != null && this.inforModel != undefined) {
          if (this.inforModel.startDate != null && this.inforModel.startDate != undefined) {
            this.inforModel.startDate = new Date(this.inforModel.startDate);
          }
          if (this.inforModel.endDate != null && this.inforModel.endDate != undefined) {
            this.inforModel.endDate = new Date(this.inforModel.endDate);
          }

          this.listProductionLoChil = [];
          var numLoChildren = 0;
          this.inforModel.listChildProductionProcessDetail.forEach(item => {
            numLoChildren += item.productionNumber;
            item.level = this.level = 1;
            let nodeRoot: TreeNode = { data: item, children: this.mappingTreeData(item.listChildProductionProcessDetail) }
            this.listProductionLoChil.push(nodeRoot);
          });
          this.numberNeedManufacturing = this.inforModel.productionNumber - numLoChildren;
        }
        this.chooseRowData = null;
      }
    }
    else {
      this.clearToast();
      this.showToast("error", "Thông báo", detailResponse.message);
    }

    this.loading = false;
  }

  refreshFilter() {
    //this.isShowFilterTop = false;
    //this.isShowFilterLeft = false;
    this.selectedPersonInChange = this.customerList[0];
    this.selectedVerifine = this.customerList[0];
    this.selectedStatus = this.statusList[0];
    this.myTableManu.reset();
    this.listProductionTracking = [...this.inforModel.processStageModels];
  }

  searchStage() {
    this.listProductionTracking = [];
    if (this.selectedPersonInChange.employeeId == '' && this.selectedVerifine.employeeId == '' && this.selectedStatus.categoryId == '') {
      this.listProductionTracking = [...this.inforModel.processStageModels];
    }
    else {
      this.listProductionTracking = this.inforModel.processStageModels.filter(c => (this.selectedPersonInChange.employeeId != '' && c.personInChargeId.indexOf(this.selectedPersonInChange.employeeId) > -1)
        || (this.selectedPersonInChange.employeeId == '' && this.selectedStatus.categoryId == '' && this.selectedVerifine.employeeId != '' && c.personVerifierId == this.selectedVerifine.employeeId)
        || (this.selectedPersonInChange.employeeId == '' && this.selectedVerifine.employeeId == '' && this.selectedStatus.categoryId != '' && c.statusId == this.selectedStatus.categoryId));
    }
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

  createLoChildren(model) {
    var numLoChildren = 0;
    if (model.listChildProductionProcessDetail != null && model.listChildProductionProcessDetail != undefined) {
      model.listChildProductionProcessDetail.forEach(item => {
        numLoChildren += item.productionNumber;
      });
    }
    this.numberNeedManufacturingDialog = model.productionNumber - numLoChildren;
    this.displayCreateLo = true;
    this.productionNumber = null;
  }

  cancelCretaLo() {
    this.displayCreateLo = false;
  }

  onRowRemove(rowdata) {
    this.confirmationService.confirm({
      message: "Bạn chắc chắn muốn xóa",
      accept: () => {
        this.loading = true;
        this.manufactureService.deleteProductionProcessDetailById(rowdata.id).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.getMasterData();
            this.showToast("success", "Thông báo", "Xóa thành công");
          }
          else {
            this.loading = false;
            this.clearToast();
            this.showToast("error", "Thông báo", result.message);
          }
        });
      },
    });
  }

  createLoNo() {
    if (this.productionNumber > this.numberNeedManufacturingDialog || this.productionNumber < 1) {
      this.clearToast();
      this.showToast("error", "Thông báo", "Số lượng sản xuất phải lớn hơn 0 và nhỏ hơn hoặc bằng số lượng cần sản xuất.");
    }
    else {
      this.loading = true;
      var request = { ...this.inforModel };
      var statustNewLotNo = this.statusLotNoList.find(s => s.categoryCode == 'TTLNCSX');
      request.productionNumber = this.productionNumber;
      request.prentId = this.idLotNo;
      request.id = 0;
      request.statusCode = 'TTLNCSX';
      request.statusId = statustNewLotNo?.categoryId;
      request.statusName = statustNewLotNo?.categoryName;

      this.manufactureService.createProductionProcessDetail(request).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.showToast("success", "Thông báo", "Tạo lô con thành công");
          if (this.typePage == 1) {
            this.router.navigate(['/manufacture/lot-no/information', { id: this.idLotNo, type: 2 }]).then(() => {
              window.location.reload();
            });
          }
          else if (this.typePage == 2) {
            this.cancelCretaLo();
            this.getMasterData();
          }
        }
        else {
          this.clearToast();
          this.showToast("error", "Thông báo", result.message);
          this.loading = false;
        }
      });
    }
  }

  goToDetailLo(rowData) {
    let type = 1;
    if (rowData.statusCode != 'TTLNCSX') {
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
    this.router.navigate(['/manufacture/lot-no/information', { id: rowData.id, type: type }]).then(() => {
      window.location.reload();
    });
  }

  gotoInventoryVoucherDetail(rowData) {
    if (rowData.isExport)
      if (rowData.inventoryScreenType == 2) {
        this.router.navigate(['warehouse/chi-tiet-phieu-xuat/detail', { inventoryDeliveryVoucherId: rowData.inventoryVoucherId, warehouseType: rowData.warehouseType }])
      }
      else if (rowData.inventoryScreenType == 3) {
        this.router.navigate(['warehouse/thanh-pham-xuat/detail', { inventoryDeliveryVoucherId: rowData.inventoryVoucherId }])
      }
      else {
        this.router.navigate(['warehouse/inventory-delivery-voucher/detail', { inventoryDeliveryVoucherId: rowData.inventoryVoucherId }])
      }
    else {
      if (rowData.inventoryScreenType == 2) {
        this.router.navigate(['warehouse/kho-san-xuat-nhap/detail', { inventoryReceivingVoucherId: rowData.inventoryVoucherId, loaiVL: rowData.warehouseType }])
      }
      else if (rowData.inventoryScreenType == 3) {
        this.router.navigate(['warehouse/thanh-pham-nhap/detail', { inventoryReceivingVoucherId: rowData.inventoryVoucherId }])
      }
      else {
        this.router.navigate(["/warehouse/inventory-receiving-voucher/detail", { inventoryReceivingVoucherId: rowData.inventoryVoucherId }]);
      }
    }
  }

  gotoStageDetail(rowData) {
    this.loading = true;
    this.manufactureService.getProductionProcessStageById(rowData.id).subscribe(response => {
      let result: any = response;
      if (result.statusCode == 200) {
        this.displayViewQC = true;
        this.chooseRowData = result.model;
        console.log(this.chooseRowData)
        if (this.chooseRowData != null && this.chooseRowData != undefined) {
          if (this.chooseRowData.binding == true) {
            var pressConfig = this.listProductionTracking.find(c => c.stageNameId == this.chooseRowData.previousStageNameId);
            if (pressConfig != null && pressConfig != undefined && pressConfig.statusCode == 'TTCDDXN') {
              if (pressConfig.endDate != null && pressConfig.endDate != undefined) {
                let endDate = new Date(pressConfig.endDate);
                let dateNow = new Date();
                let fromDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours() + (this.chooseRowData.fromTime != null ? this.chooseRowData.fromTime : 0), endDate.getMinutes(), endDate.getSeconds());
                let toDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours() + (this.chooseRowData.toTime != null ? this.chooseRowData.toTime : 0), endDate.getMinutes(), endDate.getSeconds());
                if (fromDate <= dateNow && dateNow <= toDate) {
                  this.activeEdit = true;
                }
                else {
                  this.activeEdit = false;
                }
              }
              else {
                this.activeEdit = false;
              }
            }
            else {
              this.activeEdit = false;
            }
          } else {
            this.activeEdit = true;
          }
          if (this.chooseRowData.processStageDetailModels != null && this.chooseRowData.processStageDetailModels != undefined) {
            this.chooseRowData.processStageDetailModels.forEach(item => {
              item.groupLineOrder = [];
              
              if (item.processStageDetailValueModels != null && item.processStageDetailValueModels != undefined && item.processStageDetailValueModels.length > 0) {
                var maxLine = item.processStageDetailValueModels.reduce(function (prev, current) {
                  return (prev.lineOrder > current.lineOrder) ? prev : current
                }).lineOrder;

                if (item.processStageDetailValueModels != null && item.processStageDetailValueModels != undefined) {
                  item.processStageDetailValueModels.forEach(gr => {
                    if ((gr.fieldTypeCode == 'HM' || gr.fieldTypeCode == 'DMY' || gr.fieldTypeCode == 'DMHM') && (gr.value != null && gr.value != undefined)) {
                      var value = gr.value;
                      if (gr.fieldTypeCode == 'DMY') {
                        if (checkFormatDate(gr.value)) {
                          value = formatDate(gr.value)
                        }
                      }
                      if (gr.fieldTypeCode == 'HM') {
                        if (checkFormatHM(gr.value)) {
                          value = formatDateHM(gr.value)
                        }
                      }
                      gr.value = new Date(value);
                    }
                  });

                  for (var i = 1; i <= maxLine; i++) {
                    item.groupLineOrder.push(item.processStageDetailValueModels.filter(c => c.lineOrder == i).sort((a, b) => a.sortLineOrder > b.sortLineOrder ? 1 : -1));
                  }
                }
              }
            });
          }
          if (this.chooseRowData.selectImplementationDate != null && this.chooseRowData.selectImplementationDate != undefined) {
            if (this.chooseRowData.selectImplementationDate.length > 0) {
              var listDate = [... this.chooseRowData.selectImplementationDate];
              this.chooseRowData.selectImplementationDate = [];

              if (listDate != null && listDate != undefined) {
                listDate.forEach(item => {
                  var date = new Date(item);
                  this.chooseRowData.selectImplementationDate.push(date);
                });
              }
            }
            else {
              this.chooseRowData.selectImplementationDate = null;
            }
          }
          if (this.chooseRowData.selectStartPerformerId != null && this.chooseRowData.selectStartPerformerId != undefined) {
            this.startEmp = [];
            this.chooseRowData.selectStartPerformerId.forEach(item => {
              var empl = this.chooseRowData.personInChargeModels.find(c => c.employeeId == item);
              this.startEmp.push(empl);
            });
          }
          if (this.chooseRowData.selectEndPerformerId != null && this.chooseRowData.selectEndPerformerId != undefined) {
            this.endEmp = [];
            this.chooseRowData.selectEndPerformerId.forEach(item => {
              var empl = this.chooseRowData.personInChargeModels.find(c => c.employeeId == item);
              this.endEmp.push(empl);
            });
          }
        }
      }
      else {
        this.clearToast();
        this.showToast("error", "Thông báo", result.message);
      }
      this.loading = false;
    });
  }

  gotoViewNgDetail(rowData) {
    this.chooseRowData = rowData;
    this.listInfoError = rowData.processErrorStageModels;
    this.displayViewNg = true;
  }

  changeStatusManufacture(rowData, action, isActive) {
    var id = rowData == null ? this.inforModel.id : rowData.id;
    var noteComfirm = '';
    var status = null;
    if (rowData == null) {
      noteComfirm = 'Bạn chắc chắn muốn bắt đầu sản xuất lô ' + this.inforModel.lotNoName + ' của sản phẩm ' + this.inforModel.productName;
      status = this.statusLotNoList.find(c => c.categoryCode == 'TTLNBD');
    }
    else {
      this.chooseRowData = rowData;
      switch (action) {
        case 'BD':
          noteComfirm = 'Bạn chắc chắn muốn bắt đầu sản xuất lô ' + rowData.lotNoName + ' của sản phẩm ' + rowData.productName;
          status = this.statusLotNoList.find(c => c.categoryCode == 'TTLNBD');
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
          status = this.statusLotNoList.find(c => c.categoryCode == 'TTLNTD');
          break;
        case 'H':
          this.displayCancelLo = true;
          this.productionNumberReuse.setValue(0);
          this.productionNumberRemaining = this.chooseRowData.productionNumber;
          status = this.statusLotNoList.find(c => c.categoryCode == 'TTLNH');
          break;
      }
    }

    if (status != null && status != undefined && isActive) {
      this.confirmationService.confirm({
        message: noteComfirm,
        accept: () => {
          this.loading = true;
          let startDate = (this.inforModel.startDate == null || this.inforModel.startDate == undefined) ? this.inforModel.startDate : convertToUTCTime(this.inforModel.startDate);
          let endDate = (this.inforModel.endDate == null || this.inforModel.endDate == undefined) ? this.inforModel.endDate : convertToUTCTime(this.inforModel.endDate);
          this.manufactureService.saveStatusProductionProcessDetailById(id, status.categoryId, startDate, endDate).subscribe(response => {
            let result: any = response;
            if (result.statusCode == 200) {
              this.showToast("success", "Thông báo", "Cập nhập trạng thái sản xuất thành công.");
              if (rowData == null) {
                this.router.navigate(['/manufacture/lot-no/information', { id: this.idLotNo, type: 3 }]).then(() => {
                  window.location.reload();
                });
              }
              else {
                this.getMasterData();
              }
            }
            else {
              this.loading = false;
              this.clearToast();
              this.showToast("error", "Thông báo", result.message);
            }
          });
        },
      });
    }
  }

  cancelStart() {
    this.chooseRowData = null;
    this.displayStart = false;
    this.displayCancelLo = false;
    this.displayViewQC = false;
  }

  backPage() {
    this.router.navigate(['/manufacture/track-production/track']);
  }

  changeNumberReuse() {
    this.productionNumberRemaining = this.chooseRowData.productionNumber - (this.productionNumberReuse.value != null && this.productionNumberReuse.value != undefined ? this.productionNumberReuse.value : 0);
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
            this.getMasterData();
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
      this.manufactureService.saveStatusProductionProcessDetailById(this.chooseRowData.id, status.categoryId, this.inforModel.startDate, this.inforModel.endDate).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.showToast("success", "Thông báo", "Cập nhập trạng thái sản xuất thành công.");
          this.cancelStart();
          this.getMasterData();
        }
        else {
          this.clearToast();
          this.showToast("error", "Thông báo", result.message);
        }
        this.loading = false;
      });
    }
  }

  mappingDataQC(data) {
    data.selectPersonInChargeId = [];
    data.selectStartPerformerId = [];
    data.selectEndPerformerId = [];
    data.processListNgModels = [];
    this.startEmp.forEach(item => {
      data.selectStartPerformerId.push(item.employeeId);
    });
    if (data.numberPeople == 2) {
      this.endEmp.forEach(item => {
        data.selectEndPerformerId.push(item.employeeId);
      });
    }

    if (data.selectImplementationDate != null && data.selectImplementationDate != undefined) {
      var lstDate = [...data.selectImplementationDate];
      data.selectImplementationDate = [];
      lstDate.forEach(item => {
        data.selectImplementationDate.push(convertToUTCTime(item));
      });
    }

    return data;
  }

  saveStageQC() {
    this.isSaveQC = true;
    if (this.isSaveQC && (this.chooseRowData.selectImplementationDate == null || this.chooseRowData.selectImplementationDate == undefined
      || this.startEmp == null || this.startEmp == undefined || (this.chooseRowData.numberPeople == 2 && (this.endEmp == null || this.endEmp == undefined)))) {
      return;
    }
    else {
      this.chooseRowData = this.mappingDataQC(this.chooseRowData);

      this.loading = true;
      this.manufactureService.saveProductionProcessStage(this.chooseRowData).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.cancelStart();
          this.getMasterData();
          this.showToast("success", "Thông báo", "Lưu thành công");
        }
        else {
          this.clearToast();
          this.showToast("error", "Thông báo", result.message);
        }

        this.isSaveQC = false;
        this.loading = false;
      });
    }
  }

  onClickSample(rowData) {
    if (this.chooseRowData.statusCode == 'TTCDDTH') {
      this.chooseRowDataItemQC = rowData;
      this.displaySample = true;
    }
  }
  cancelSample() {
    this.displaySample = false;
    this.chooseRowDataItemQC = null;
  }
  comfirmSample() {
    this.chooseRowData.processStageDetailModels.forEach(item => {
      if (item.id == this.chooseRowDataItemQC.id) {
        item = this.chooseRowDataItemQC;
      }
    });
    this.cancelSample();
  }

  viewListNg() {
    this.displayListNg = true;
  }

  cancelError() {
    this.displayListError = false;
  }

  openListError() {
    this.displayListError = true;
  }

  saveError() {
    this.loading = true;
    this.manufactureService.saveProductionProcessErrorStage(this.chooseRowData.processErrorStageModels).subscribe(response => {
      let result: any = response;
      if (result.statusCode == 200) {
        this.cancelError();
        this.showToast("success", "Thông báo", "Lưu thành công");
      }
      else {
        this.clearToast();
        this.showToast("error", "Thông báo", result.message);
      }

      this.loading = false;
    });
  }

  showDialogNg() {
    if (this.inforModel.processStageModels != null && this.inforModel.processStageModels != undefined) {
      this.errorItemList = [];
      this.inforModel.processStageModels.forEach(item => {
        if (item.processErrorStageModels != null && item.processErrorStageModels != undefined) {
          item.processErrorStageModels.forEach(dt => {
            var isExit = this.errorItemList.find(c => c.categoryId == dt.errorItemId);
            if (isExit == null || isExit == undefined) {
              this.errorItemList.push({ categoryId: dt.errorItemId, categoryCode: dt.errorItemCode, categoryName: dt.errorItemName })
            }
          });
        }
      });
    }

    this.displayStatisticalError = true;
  }

  goToInventoryOfDefectiveGoods() {
    this.router.navigate(['/manufacture/inventory-of-defective-goods/create-update', { loNoId: this.inforModel.id }]);
  }

  changeErrorItem(event) {
    this.listStatisticalError = [];
    this.inforModel.processStageModels.forEach(item => {
      var errItem = item.processErrorStageModels.find(c => c.errorItemId == event.value.categoryId);
      if (errItem != null && errItem != undefined && errItem.errorNumber > 0) {
        this.listStatisticalError.push(item);
      }
    })
  }
}

function checkFormatHM(str: string) {
  var strSlip = str.split(':');
  if (strSlip != null && strSlip != undefined && strSlip.length > 0 && strSlip[0].length <= 2) {
    return true;
  }
  else {
    return false;
  }
}

function checkFormatDate(str: string) {
  var strSlip = str.split('/');
  if (strSlip != null && strSlip != undefined && strSlip.length > 0 && strSlip[0].length == 2) {
    return true;
  }
  else {
    return false;
  }
}

function formatDateHM(str: string) {
  var dateNow = new Date();
  var strSlip = str.split(':');
  return new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDay(), parseInt(strSlip[0]), parseInt(strSlip[1]));
}

function formatDate(str: string) {
  var strSlip = str.split('/');
  if (strSlip != null && strSlip != undefined && strSlip.length == 3) {
    return strSlip[2] + '/' + strSlip[1] + '/' + strSlip[0];
  }
  else {
    return str;
  }
}

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

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), 10, 10, 5));
};
