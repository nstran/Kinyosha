import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { OrderListModule } from 'primeng/orderlist';
import { ManufactureService } from '../../services/manufacture.service';
import { ProductService } from '../../../product/services/product.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import * as $ from 'jquery';
import { DialogService } from 'primeng';
import { CategoryService } from '../../../shared/services/category.service';
import { OrganizationService } from '../../../shared/services/organization.service';
import { OrganizationModel } from '../../../shared/models/organization.model';
import { async } from '@angular/core/testing';
import { EmployeeService } from '../../../employee/services/employee.service';
import { mobileRemoveFunction } from '@syncfusion/ej2-inputs';
import { ChonNhieuDvDialogComponent } from '../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';
import { Table } from 'primeng/table';

class StageGroup {
  stt: number; // STT
  stage: string; // Tên công đoạn
  stageGroup: string; // Nhóm công đoạn
  id: string;
}

class Specifications {
  stt: number;
  stepContent: any; // Các bước thuwch hiện
  content: any; // Nội dung kiểm tra
  specifications: any; // Quy cách
  isHaveValues: boolean; // IsHasValue
  numberOfSamples: any; // số mẫu thử
  listSetting: Array<any>;
  id: any;
  disable: boolean;
}

class ProductOrderWorkflow {
  productOrderWorkflowId: string;
  code: string;
  name: string;
  isDefault: boolean;
  description: string;
  active: boolean;
  createdDate: Date;
  createdById: string;

  constructor() {
    this.productOrderWorkflowId = '00000000-0000-0000-0000-000000000000';
    this.code = null;
    this.name = null;
    this.description = null;
    this.isDefault = false;
    this.active = true;
    this.createdDate = convertToUTCTime(new Date());
    this.createdById = '00000000-0000-0000-0000-000000000000';
  }
}

// Thông tin chung
class ConfigProductionModel {
  id: number;
  productId: string;
  code: string;
  description: string;
  productionNumber: number;
  ltv: number;
  pc: number;
  availability: boolean;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  productCode: string;
  productName: string;
  inspectionStageId: string[];
  configStages: Array<ConfigStageModel>;
}

//Danh sách công đoạn
class ConfigStageModel {
  stt: number;
  id: number;
  configProductionId: number;
  stageNameId: string;
  stageGroupId: string;
  departmentId: string;
  numberPeople: number;
  personInChargeId: string[];
  personVerifierId: string;
  binding: boolean;
  previousStageNameId: string;
  fromTime: number;
  toTime: number;
  sortOrder: number;
  isStageWithoutNG: boolean;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  stageName: string;
  stageGroupName: string;
  departmentName: string;
  personInChargeName: string[];
  personVerifierName: string;
  configStepByStepStages: Array<ConfigStepByStepStageModel>;
  configContentStages: Array<ConfigContentStageModel>;
  configSpecificationsStages: Array<ConfigSpecificationsStageModel>;
  configErrorItems: Array<ConfigErrorItemModel>;
  configStageProductInputs: Array<ConfigStageProductInputModel>;
}

//Danh sách các bước thực hiện
class ConfigStepByStepStageModel {
  id: number;
  configStageId: number;
  name: string;
  isShowTextBox: boolean;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  mappingId: number;
}

//Danh sách nội dung kiểm tra
class ConfigContentStageModel {
  id: number;
  configStageId: number;
  isContentValues: boolean;
  contentId: string;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  mappingId: number;
}

//Danh sách quy cách
class ConfigSpecificationsStageModel {
  id: number;
  configStageId: number;
  configStepByStepStageId: number;
  configContentStageId: number;
  specificationsId: string;
  isHaveValues: boolean;
  numberOfSamples: number;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  configStepByStepStageIdMapping: number;
  configContentStageIdMapping: number;
  configSpecificationsStageValues: Array<ConfigSpecificationsStageValueModel>;
}

class ConfigSpecificationsStageValueModel {
  id: number;
  configSpecificationsStageId: number;
  fieldTypeId: string;
  firstName: string;
  lastName: string;
  lineOrder: number;
  sortLineOrder: number;
  productId: string;
  infoFormula: number;
  formula: number;
  formulaValue: number;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
}

class ConfigErrorItemModel {
  id: number;
  configStageId: number;
  errorItemId: string;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  errorItemName: string;
}
// Danh sách NVL đầu vào
class ConfigStageProductInputModel {
  id: number;
  configStageId: number;
  productId: string;
  createdBy: string;
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  productCode: string;
  productName: string;
}

@Component({
  selector: 'app-product-order-workflow-create',
  templateUrl: './product-order-workflow-create.component.html',
  styleUrls: ['./product-order-workflow-create.component.css']
})
export class ProductOrderWorkflowCreateComponent implements OnInit {
  loading: boolean = false;
  checkRequired: boolean = false;
  awaitResult: boolean = false;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(sessionStorage.getItem("auth"));
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionDelete: boolean = true;
  actions: MenuItem[] = [];

  fixed: boolean = false;
  withFiexd: string = "";
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }
  displayCopyStage: boolean = false;
  displaySetting: boolean = false;
  displayCreateStage: boolean = false;

  listCode: Array<string> = [];

  productionProcesslist: Array<StageGroup> = [];
  orgList: Array<any>;
  employeeList: Array<any>;
  employeeByOrgList: Array<any> = [];

  /* Valid Form */
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  /* End */

  selectedProductionProcess = new FormControl('');
  /* FORM */
  productOrderWorkflowForm: FormGroup;
  nameControl: FormControl;
  isDefaultControl: FormControl;
  descriptionControl: FormControl;
  productNumberControl: FormControl;
  ltvControl: FormControl;
  pcControl: FormControl;

  stepStageForm: FormGroup;
  selectedStage = new FormControl('', [Validators.required]);
  selectedGroupStage = new FormControl('', [Validators.required]);
  organizationName = new FormControl('', [Validators.required]);
  selectedNumPerson = new FormControl('', [Validators.required]);
  selectedListEmployee = new FormControl('', [Validators.required]);
  sortOrderControl = new FormControl('');
  selectedVerifier = new FormControl('', [Validators.required]);
  selectedStageBefore = new FormControl(null);
  selectedFrom = new FormControl(null);
  selectedTo = new FormControl(null);
  /* END FORM */

  selectedOrg: any = null;

  /* file section */
  colsStage: any = [];
  colsSpecifications: any = [];
  colsSetting: any = [];

  stepProgress: Array<any> = [];
  stepProgressDetail: Array<any> = [];
  stepProgressQC: Array<any> = [];
  stepProgressDetailQC: Array<any> = [];

  listStageGroup: Array<StageGroup> = [];
  listSpecifications: Array<Specifications> = [];
  listSetting: Array<any> = [];
  productList: any = [];
  productNVLList: any = [];
  productCode: any;
  configCode: any;
  categoryTypeModellist: Array<any> = [];
  stageList: any = [];
  stageGroupList: any = [];
  stageGroupErrorList: any = [];
  contentTestList: any = [];
  specificationsList: any = [];
  numberOfPeoplePerforming: any = [];
  typeResult: any = [];
  stageConfigError: any = [];
  selectedConfigError: any = [];
  stageConfigErrorChoose: any = [];
  selectedConfigErrorChoose: any = [];
  choosedSttQC: number = 0;
  choosedRowStage: number = 0;
  saveActionStage: boolean = false;
  saveActionConfigStage: boolean = false;

  stageConfigNVL: any = [];
  selectedConfigNVL: any = [];
  stageConfigNVLChoose: any = [];
  selectedConfigNVLChoose: any = [];

  configErrorLst: any = [];

  configProductionData: ConfigProductionModel = new ConfigProductionModel();
  configStageModel: ConfigStageModel = new ConfigStageModel();

  isHasValueFinishedProduct: boolean = false;
  chooseDataQC: any = null;

  @ViewChild('myTable') myTable: Table;
  indexActive: number = 0;
  displayAddQC: boolean = false;
  isSave: boolean = true;

  categoryName = new FormControl('');
  description = new FormControl('');
  categoryForm: FormGroup;
  infoFormulaType: any = [{ id: 0, text: 'Lot.No' }, { id: 1, text: 'Số lượng' }];
  formulaType: any = [{ id: 0, text: 'Cộng' }, { id: 1, text: 'Trừ' }, { id: 1, text: 'Nhân' }, { id: 1, text: 'Chia' }];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private getPermission: GetPermission,
    private manufactureService: ManufactureService,
    private productService: ProductService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private renderer: Renderer2,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private organizationService: OrganizationService,
    private employeeService: EmployeeService,
  ) {
    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (this.saveAndCreate) {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target) &&
            !this.saveAndCreate.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        } else {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm()
    let resource = "man/manufacture/product-order-workflow/create";
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
    }
    this.initTable();
    this.getMasterData();
  }

  async getProduct() {
    let result_list_product: any = await this.productService.searchProductAsync(1, '', '')
    if (result_list_product != null) {
      this.productList = result_list_product.productList;
    }
    //this.productService.getProductByIDAsync(this.paramProductId),
  }

  list_to_tree(listData: Array<any>) {
    this.orgList = listData;
    listData.forEach((item) => {
      //if(item.)
    });

  }
  getCategory() {
    this.categoryService.getAllCategory().subscribe(res => {
      let result = <any>res;
      this.categoryTypeModellist = result.categoryTypeList;

    });
  }
  setCategory() {
    if (this.categoryTypeModellist != null || this.categoryTypeModellist != undefined) {
      this.stageGroupList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'NCD')?.categoryList ?? [];
      this.stageList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'CD')?.categoryList ?? [];
      this.contentTestList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'NDKT')?.categoryList ?? [];
      this.specificationsList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'QC')?.categoryList ?? [];
      this.numberOfPeoplePerforming = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'SNTHCD')?.categoryList ?? [];
      this.typeResult = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'KKQ')?.categoryList ?? [];
      this.stageConfigError = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'KTL')?.categoryList ?? [];
    }
  }
  initTable() {
    /*Table*/
    this.colsStage = [
      { field: 'stt', header: 'STT', width: '10%', textAlign: 'center', type: 'number' },
      { field: 'stageName', header: 'Tên công đoạn', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'stageGroupName', header: 'Nhóm công đoạn', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'departmentName', header: 'Bộ phận phụ trách', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'personInChargeName', header: 'Người phụ trách', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'personVerifierName', header: 'Người xác nhận', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '15%', textAlign: 'center', type: 'string' },
    ];
    this.colsSpecifications = [
      { field: 'stt', header: 'STT', width: '5%', textAlign: 'center', type: 'number' },
      { field: 'stepContent', header: 'Các bước thực hiện', width: '20%', textAlign: 'left', type: 'string' },
      { field: 'content', header: 'Nội dung kiểm tra', width: '20%', textAlign: 'left', type: 'string' },
      { field: 'specifications', header: 'Quy cách', width: '30%', textAlign: 'left', type: 'string' },
      //{ field: 'isHaveValues', header: 'Có giá trị nhập', width: '5%', textAlign: 'left', type: 'string' },
      { field: 'numberOfSamples', header: 'Số mẫu thử', width: '10%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '10%', textAlign: 'center', type: 'string' },
    ];
    this.colsSetting = [
      { field: 'type', header: 'Kiểu kết quả', width: '17%', textAlign: 'center', type: 'number' },
      { field: 'first', header: 'Tên đầu', width: '10%', textAlign: 'left', type: 'string' },
      { field: 'last', header: 'Tên cuối', width: '10%', textAlign: 'left', type: 'string' },
      { field: 'sort', header: 'Thứ tự trong dòng', width: '10%', textAlign: 'left', type: 'string' },
      { field: 'line', header: 'Dòng', width: '7%', textAlign: 'center', type: 'string' },
      { field: 'productName', header: 'Tên NVL', width: '17%', textAlign: 'center', type: 'string' },
      { field: 'dvt', header: 'ĐVT', width: '5%', textAlign: 'center', type: 'string' },
      { field: 'infor', header: 'Thông tin cần lấy', width: '17%', textAlign: 'center', type: 'string' },
      { field: 'valueDvt', header: 'Giá trị quy đổi theo ĐVT', width: '23%', textAlign: 'center', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '5%', textAlign: 'center', type: 'string' },
    ];
  }

  setForm() {
    this.categoryName = new FormControl('', [Validators.required]);
    this.description = new FormControl('');

    this.categoryForm = new FormGroup({
      categoryName: this.categoryName,
      description: this.description,
    });

    this.nameControl = new FormControl(null, [Validators.required]);
    this.descriptionControl = new FormControl(null);
    this.isDefaultControl = new FormControl(false);
    this.ltvControl = new FormControl(null);
    this.pcControl = new FormControl(null);
    this.productNumberControl = new FormControl(null, [Validators.required, forbiddenNumber]);

    this.productOrderWorkflowForm = new FormGroup({
      ltvControl: this.ltvControl,
      pcControl: this.pcControl,
      nameControl: this.nameControl,
      descriptionControl: this.descriptionControl,
      isDefaultControl: this.isDefaultControl,
      productNumberControl: this.productNumberControl,
    });

    this.setFormStage();
  }

  setFormStage() {
    this.selectedStage = new FormControl(null, [Validators.required]);
    this.selectedGroupStage = new FormControl(null, [Validators.required]);
    this.organizationName = new FormControl(null, [Validators.required]);
    this.selectedNumPerson = new FormControl(null, [Validators.required]);
    this.selectedListEmployee = new FormControl(null, [Validators.required]);
    this.sortOrderControl = new FormControl(null);
    this.selectedVerifier = new FormControl(null, [Validators.required]);
    this.selectedStageBefore = new FormControl(null);
    this.selectedFrom = new FormControl(null);
    this.selectedTo = new FormControl(null);
    this.stepStageForm = new FormGroup({
      selectedStage: this.selectedStage,
      selectedGroupStage: this.selectedGroupStage,
      organizationName: this.organizationName,
      selectedNumPerson: this.selectedNumPerson,
      selectedListEmployee: this.selectedListEmployee,
      sortOrderControl: this.sortOrderControl,
      selectedVerifier: this.selectedVerifier,
      selectedStageBefore: this.selectedStageBefore,
      selectedFrom: this.selectedFrom,
      selectedTo: this.selectedTo
    });

    this.stepProgress = [{ stt: 1, label: "", text: "", id: null, isHasValue: false }];
    this.stepProgressDetail = [{ stt: 1, content: "", id: null, isHasValue: false }];
    this.listSpecifications = [
      { stt: 1, stepContent: null, content: null, specifications: null, listSetting: [], isHaveValues: false, numberOfSamples: null, id: null, disable: false }
    ];

    this.stageConfigError = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'KTL')?.categoryList ?? [];
    this.stageConfigErrorChoose = [];

    this.stageConfigNVLChoose = [];

    this.stepProgressQC = [{ stt: 0, id: null, text: "", isHasValue: false }]
    this.stepProgress.forEach((item, index) => {
      this.stepProgressQC.push({ stt: item.stt, id: item.id, text: item.text, isHasValue: item.isHasValue });
    });

    this.stepProgressDetailQC = [{ stt: 0, id: null, text: "", isHasValue: false }];
    this.stepProgressDetail.forEach((item, index) => {
      this.stepProgressDetailQC.push({ stt: index + 1, id: item.id, text: item.content.categoryName, isHasValue: item.isHasValue });
    });

    this.listStageGroup = [];
    if (this.configProductionData.configStages != null || this.configProductionData.configStages != undefined) {
      this.configProductionData.configStages.forEach((item, index) => {
        this.listStageGroup.push({ stt: index + 1, stage: item.stageName, stageGroup: item.stageGroupName, id: item.stageNameId })
      });
    }

    this.isHasValueFinishedProduct = false;
  }

  async getMasterData() {
    this.loading = true;
    let [productResponse, nvlResponse, organizationResponse, categoryResponse]: any = await Promise.all([
      this.productService.searchProductAsync(1, '', ''),
      this.productService.searchProductAsync(0, '', ''),
      this.organizationService.getAllOrganizationAsync(),
      this.categoryService.getAllCategoryAsync()
    ]);
    this.orgList = organizationResponse.listAll != null ? organizationResponse.listAll : [];
    this.productList = productResponse.productList;

    var lstNewProduct = [{ productId: null, productName: null, productCode: null, productUnitName: null }];
    this.productNVLList = lstNewProduct.concat(nvlResponse.productList);

    this.categoryTypeModellist = categoryResponse.categoryTypeList;
    this.stageGroupErrorList = categoryResponse.categoryTypeList.find(c => c.categoryTypeCode == 'NCD')?.categoryList ?? [];
    this.setCategory();
    this.loading = false;
  }

  onChangeProduct(e) {
    this.productCode = this.nameControl.value.productCode;
  }

  onChangeOrg() {
    this.selectedListEmployee.setValue(null);
    this.selectedVerifier.setValue(null);
    this.employeeService.searchEmployee('', '', '', '', [], this.selectedOrg.organizationId).subscribe(response1 => {
      var result = <any>response1;
      this.employeeByOrgList = result.employeeList;
    });
    //this.employeeByOrgList = this.employeeList.filter(c =>)
  }

  setDefaultValueAndValidate() {
   
  }

  checkIsDefault() {
    let isDefault = this.isDefaultControl.value;
    if (isDefault == true) {
      this.loading = true;
      this.manufactureService.checkIsDefaultProductOrderWorkflow().subscribe(response => {
        let result: any = response;
        this.loading = false;

        if (result.statusCode == 200) {
          if (result.isDefaultExists) {
            this.confirmationService.confirm({
              message: 'Đã tồn tại quy trình mặc định bạn có muốn đặt quy trình này là mặc định?',
              accept: () => {
                //this.isDefaultControl.setValue(true);
              },
              reject: () => {
                this.isDefaultControl.setValue(false);
              }
            });
          }
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.message };
          this.showMessage(msg);
        }
      });
    }
  }

  createProductOrderWorkflow(mode) {
    if (!this.productOrderWorkflowForm.valid) {
      Object.keys(this.productOrderWorkflowForm.controls).forEach(key => {
        if (this.productOrderWorkflowForm.controls[key].valid == false) {
          this.productOrderWorkflowForm.controls[key].markAsTouched();
        }
      });
    } else {
      this.configProductionData.productId = this.nameControl.value.productId;
      this.configProductionData.description = this.descriptionControl.value == null ? null : this.descriptionControl.value.trim();
      this.configProductionData.ltv = this.ltvControl.value ?? 0;
      this.configProductionData.pc = this.pcControl.value ?? 0;
      this.configProductionData.productionNumber = this.productNumberControl.value;
      if (mode != null) {
        this.configProductionData.availability = mode;
      }
      else {
        this.configProductionData.availability = false;
      }

      this.loading = true;
      this.awaitResult = true;
      this.manufactureService.saveConfigProduction(this.configProductionData).subscribe(response => {
        let result: any = response;
        this.loading = false;

        if (result.statusCode == 200) {
          this.router.navigate(['/manufacture/product-order-workflow/detail', { productOrderWorkflowId: result.model.id }]);
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.message };
          this.showMessage(msg);
        }
      });
    }
  }

  resetForm() {
    this.nameControl.reset();
    this.descriptionControl.reset();
    this.isDefaultControl.setValue(false);
    this.pcControl.setValue(null);
    this.ltvControl.setValue(null);

    this.awaitResult = false;
  }

  backPage() {
    this.router.navigate(['/manufacture/product-order-workflow/list']);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  showCopyStageDialog() {
    this.displayCopyStage = true;
  }

  async showCreateStageDialog(event) {
    this.loading = true;
    let [nvlRespons, categoryResponse, productDetailResponse]: any = await Promise.all([
      this.productService.searchProductAsync(0, '', ''),
      this.categoryService.getAllCategoryAsync(),
      this.productService.getProductByIDAsync(this.nameControl.value?.productId),
    ]);

    this.stageConfigNVL = nvlRespons.productList;
    this.categoryTypeModellist = categoryResponse.categoryTypeList;
    this.setCategory();

    this.saveActionStage = false;
    this.setFormStage();

    if (event == null) {
      this.choosedRowStage = 0;
      this.employeeByOrgList = [];
      this.sortOrderControl.setValue((this.configProductionData.configStages == null || this.configProductionData.configStages == undefined) ? 1 : this.configProductionData.configStages.length + 1);
    }
    else {
      this.choosedRowStage = event.stt;

      this.sortOrderControl.setValue(event.sortOrder);

      this.isHasValueFinishedProduct = event.isStageWithoutNG;

      //mapping Thuộc nhóm công đoạn
      var org = this.orgList.find(c => c.organizationId == event.departmentId);
      this.organizationName.setValue(org?.organizationName);
      this.selectedOrg = org;

      let [employeeRespons]: any = await Promise.all([
        this.employeeService.searchEmployeeAsync('', '', '', '', [], event.departmentId)
      ]);
      this.employeeByOrgList = employeeRespons.employeeList;

      //mapping Tên quy trình/công đoạn
      var stage = this.stageList.find(c => c.categoryId == event.stageNameId);
      this.selectedStage.setValue(stage);

      //mapping Thuộc nhóm công đoạn
      var stageGroup = this.stageGroupList.find(c => c.categoryId == event.stageGroupId);
      this.selectedGroupStage.setValue(stageGroup);

      //mapping Số người thực hiện công đoạn
      var numPeople = this.numberOfPeoplePerforming.find(c => c.categoryCode == event.numberPeople);
      this.selectedNumPerson.setValue(numPeople);

      // mapping Danh sách người phụ trách
      var person = [];
      event.personInChargeId.forEach(item => {
        person.push(this.employeeByOrgList.find(c => c.employeeId == item));
      });
      this.selectedListEmployee.setValue(person);

      //mapping Người xác nhận
      var personVerifier = this.employeeByOrgList.find(c => c.employeeId == event.personVerifierId);
      this.selectedVerifier.setValue(personVerifier);

      this.checkRequired = (event.binding != null && event.binding != undefined) ? event.binding : false;
      if (this.checkRequired) {
        var pressStage = this.listStageGroup.find(c => c.id == event.previousStageNameId);
        this.selectedStageBefore.setValue(pressStage);
        this.selectedFrom.setValue(event.fromTime);
        this.selectedTo.setValue(event.toTime);
      }

      // mapping Các bước thực hiện
      if (event.configStepByStepStages != null && event.configStepByStepStages != undefined && event.configStepByStepStages.length != 0) {
        this.stepProgress = [];
        event.configStepByStepStages.forEach(item => {
          this.stepProgress.push({ stt: this.stepProgress.length + 1, label: item.name, text: item.name, id: item.id, isHasValue: item.isShowTextBox });
        });
      }

      // mapping Các nội dung/hạng mục kiểm tra
      if (event.configContentStages != null && event.configContentStages != undefined && event.configContentStages.length != 0) {
        this.stepProgressDetail = [];
        event.configContentStages.forEach(item => {
          var stage = this.contentTestList.find(c => c.categoryId == item.contentId);
          this.stepProgressDetail.push({ stt: this.stepProgressDetail.length, content: stage, id: item.id, isHasValue: item.isContentValues });
        });
      }

      //mapping Ds lỗi
      if (event.configErrorItems != null && event.configErrorItems != undefined && event.configErrorItems.length != 0) {
        this.stageConfigErrorChoose = [];
        event.configErrorItems.forEach(item => {
          var error = this.stageConfigError.find(c => c.categoryId == item.errorItemId);

          var removeErr = this.stageConfigError.indexOf(error);
          if (removeErr > -1) {
            this.stageConfigError.splice(removeErr, 1);
          }

          if (error != null && error != undefined) {
            error.id = item.id;
          }
          this.stageConfigErrorChoose.push(error);
        });
      }

      //mapping Ds nvl đầu vào
      if (event.configStageProductInputs != null && event.configStageProductInputs != undefined && event.configStageProductInputs.length != 0) {
        this.stageConfigNVLChoose = [];
        event.configStageProductInputs.forEach(item => {
          var nvl = this.stageConfigNVL.find(c => c.productId == item.productId);

          var removeNvl = this.stageConfigNVL.indexOf(nvl);
          if (removeNvl > -1) {
            this.stageConfigNVL.splice(removeNvl, 1);
          }
          if (nvl != null && nvl != undefined) {
            nvl.id = item.id;
          }
          this.stageConfigNVLChoose.push(nvl);
        });
      }

      //mapping quy cách
      this.stepProgressQC = [{ stt: 0, id: null, text: "", isHasValue: false }]
      this.stepProgress.forEach((item, index) => {
        this.stepProgressQC.push({ stt: index + 1, id: item.id, text: item.text, isHasValue: item.isHasValue });
      });

      this.stepProgressDetailQC = [{ stt: 0, id: null, text: "", isHasValue: false }];
      this.stepProgressDetail.forEach((item, index) => {
        this.stepProgressDetailQC.push({ stt: index + 1, id: item.id, text: item.content.categoryName, isHasValue: item.isHasValue });
      });

      if (event.configSpecificationsStages != null && event.configSpecificationsStages != undefined && event.configSpecificationsStages.length != 0) {
        this.listSpecifications = [];
        event.configSpecificationsStages.forEach(item => {
          item.configStepByStepStageIdMapping = (item.configStepByStepStageIdMapping == null || item.configStepByStepStageIdMapping == undefined) ? 0 : item.configStepByStepStageIdMapping;
          item.configContentStageIdMapping = (item.configContentStageIdMapping == null || item.configContentStageIdMapping == undefined) ? 0 : item.configContentStageIdMapping;

          var step = this.stepProgressQC.find(c => c.stt == item.configStepByStepStageIdMapping);
          var content = this.stepProgressDetailQC.find(c => c.stt == item.configContentStageIdMapping);
          var specifications = this.specificationsList.find(c => c.categoryId == item.specificationsId);

          var setting = [];
          if (item.configSpecificationsStageValues.length != 0) {
            item.configSpecificationsStageValues.forEach(set => {
              var type = this.typeResult.find(c => c.categoryId == set.fieldTypeId);
              var product = null;
              var productUnit = null;
              var infor = null;
              var formula = null;
              if (set.productId != null && set.productId != undefined) {
                product = this.productNVLList.find(c => c.productId == set.productId);
                productUnit = this.productNVLList.find(c => c.productId == set.productId)?.productUnitName;
              }
              if (set.infoFormula != null && set.infoFormula != undefined) {
                infor = this.infoFormulaType.find(c => c.id == set.infoFormula);
              }
              if (set.formula != null && set.formula != undefined) {
                formula = this.formulaType.find(c => c.id == set.formula);
              }
              setting.push({ type: type, first: set.firstName, last: set.lastName, sort: set.sortLineOrder, line: set.lineOrder, productName: product, dvt: productUnit, infor: infor, valueDvt: formula, formulaValue: set.formulaValue, setting: 1 });
            });
          }
          var disable = false;
          if (item.numberOfSamples == 10000) {
            disable = true;
            item.numberOfSamples = null;
          }
          this.listSpecifications.push({ stt: this.listSpecifications.length + 1, stepContent: step, content: content, specifications: specifications, listSetting: setting, isHaveValues: item.isHaveValues, numberOfSamples: item.numberOfSamples, id: item.id, disable: disable });
        });
      }
    }
    this.loading = false;
    this.indexActive = 0;
    this.displayCreateStage = true;
  }

  addStepStage() {
    this.stepProgress.push({ stt: this.stepProgress.length + 1, label: "", text: "", id: null, isHasValue: false });
  }

  addStepStageDetail() {
    this.stepProgressDetail.push({ stt: this.stepProgressDetail.length, content: "", id: null, isHasValue: false });
  }

  removeStepStage(num) {
    this.stepProgress.splice(num, 1);
  }

  removeStepStageDetail(num) {
    this.stepProgressDetail.splice(num, 1);
  }

  onBlurStep() {
    this.stepProgress.forEach((item) => {
      item.label = item.text;
    });
  }

  chooseStepProgress(value: any, num) {
    //this.stepProgressDetail[num].stage = value;
  }

  onChangeAction(rowData: any) {
    let statusCode = rowData.statusCode;
    this.actions = [];
    let assignedPersonInCharge: MenuItem = {
      id: '1', label: 'Xem chi tiết', icon: 'pi pi-pencil', command: () => {
        this.viewDetail(rowData);
      }
    }
    this.actions.push(assignedPersonInCharge);    
  }

  viewDetail(row) {
    this.displaySetting = true;
    this.saveActionConfigStage = false;
    this.listSetting = [...row.listSetting];
    this.choosedSttQC = row.stt;

    if (this.listSetting.length == 0) {
      this.listSetting.push({ type: null, first: null, last: null, sort: null, line: null, productName: null, dvt: null, infor: null, valueDvt: null, formulaValue: null });
    }
  }

  remoteDetail(row) {
    var err = this.listSpecifications.indexOf(row);
    if (err > -1) {
      this.listSpecifications.splice(err, 1);
    }
  }

  remoteSettingDetail(row) {
    var err = this.listSetting.indexOf(row);
    if (err > -1) {
      this.listSetting.splice(err, 1);
    }
  }

  addLineQC() {
    this.listSpecifications.push({ stt: this.listSpecifications.length + 1, stepContent: null, content: null, specifications: null, listSetting: [], isHaveValues: false, numberOfSamples: null, id: null, disable: false });
  }

  addLineSetting() {
    this.listSetting.push({ type: null, first: null, last: null, sort: null, line: null, productName: null, dvt: null, infor: null, valueDvt: null, formulaValue: null });
  }

  cancelCreateStage() {
    this.displayCreateStage = false;
  }

  validateStage() {
    var result = false;
    this.stepProgress.forEach(item => {
      if (item.text == null || item.text == undefined || item.text.trim() == '')
        result = true;
    });

    this.stepProgressDetail.forEach(item => {
      if (item.content == null || item.content == undefined || item.content == '')
        result = true;
    });
    return result;
  }

  saveCreateStage() {
    this.saveActionStage = true;
    if (!this.stepStageForm.valid || this.validateStage()) {
      Object.keys(this.stepStageForm.controls).forEach(key => {
        if (this.stepStageForm.controls[key].valid == false) {
          this.stepStageForm.controls[key].markAsTouched();
        }
      });
    }
    else {
      this.loading = true;
      if (this.configProductionData.configStages == null || this.configProductionData.configStages == undefined) {
        this.configProductionData.configStages = new Array<ConfigStageModel>();
      }
      if (this.choosedRowStage != 0) {
        this.configProductionData.configStages.forEach(config => {
          if (config.stt == this.choosedRowStage) {
            config.id = (config.id == null || config.id == undefined) ? 0 : config.id; // this.configProductionData.ConfigStages.length + 1;
            config.stageNameId = this.selectedStage.value.categoryId;
            config.stageName = this.selectedStage.value.categoryName;
            config.stageGroupId = this.selectedGroupStage.value.categoryId;
            config.stageGroupName = this.selectedGroupStage.value.categoryName;
            config.departmentId = this.selectedOrg?.organizationId;
            config.departmentName = this.selectedOrg?.organizationName;
            config.numberPeople = this.selectedNumPerson.value.categoryCode;
            config.sortOrder = this.sortOrderControl.value;
            config.personInChargeId = [];
            config.personInChargeName = [];
            this.selectedListEmployee.value.forEach(item => {
              config.personInChargeId.push(item.employeeId);
              config.personInChargeName.push(item.employeeName);
            });
            config.personVerifierId = this.selectedVerifier.value.employeeId;
            config.personVerifierName = this.selectedVerifier.value.employeeName;
            config.binding = this.checkRequired;
            if (this.checkRequired) {
              config.previousStageNameId = this.selectedStageBefore.value.id == null || this.selectedStageBefore.value.id == undefined ? this.selectedStageBefore.value.stt : this.selectedStageBefore.value.id;
              config.fromTime = this.selectedFrom.value;
              config.toTime = this.selectedTo.value;
            }
            config.createdBy = '00000000-0000-0000-0000-000000000000';
            config.createdDate = new Date();

            // mapping các bước thực hiện
            config.configStepByStepStages = new Array<ConfigStepByStepStageModel>();
            this.stepProgress.forEach((item, index) => {
              var configStep = new ConfigStepByStepStageModel();
              configStep.id = (item.id == null || item.id == undefined) ? 0 : item.id;
              configStep.configStageId = config.id;
              configStep.name = item.text;
              configStep.isShowTextBox = item.isHasValue;
              configStep.createdBy = '00000000-0000-0000-0000-000000000000';
              configStep.createdDate = new Date();
              configStep.mappingId = index + 1;

              config.configStepByStepStages.push(configStep);
            });

            // mapping nội dung hạng mục kiểm tra
            config.configContentStages = new Array<ConfigContentStageModel>();
            this.stepProgressDetail.forEach((item, index) => {
              var configContent = new ConfigContentStageModel();
              configContent.id = (item.id == null || item.id == undefined) ? 0 : item.id;
              configContent.configStageId = config.id;
              configContent.isContentValues = item.isHasValue;
              configContent.contentId = item.content.categoryId;
              configContent.createdBy = '00000000-0000-0000-0000-000000000000';
              configContent.createdDate = new Date();
              configContent.mappingId = index + 1;

              config.configContentStages.push(configContent);
            });

            // mapping quy cách
            config.configSpecificationsStages = new Array<ConfigSpecificationsStageModel>();
            this.listSpecifications.forEach((item, index) => {
              if (!((item.content == null || item.content == undefined || item.content == '') && (item.specifications == null || item.specifications == undefined || item.specifications == '')
                && (item.stepContent == null || item.stepContent == undefined || item.stepContent == ''))) {
                var configSpecifications = new ConfigSpecificationsStageModel();
                configSpecifications.id = (item.id != null && item.id != undefined) ? item.id : 0;
                configSpecifications.configStageId = config.id;
                //configSpecifications.ConfigStepByStepStageId = item.stepContent.id;
                //configSpecifications.ConfigContentStageId = item.content.id;
                configSpecifications.specificationsId = (item.specifications == null || item.specifications == undefined || item.specifications == '') ? '' : item.specifications.categoryId;
                configSpecifications.numberOfSamples = (item.disable == true ? 10000 : (item.numberOfSamples == null || item.numberOfSamples == undefined) ? 0 : item.numberOfSamples);
                configSpecifications.isHaveValues = item.isHaveValues;

                var mappingStepByStepStageId = 0;
                if (!(item.stepContent == null || item.stepContent == undefined || item.stepContent == '')) {
                  if (item.stepContent.id != null && item.stepContent.id != undefined && item.stepContent.id != 0) {
                    mappingStepByStepStageId = item.stepContent.id
                  }
                  else {
                    mappingStepByStepStageId = item.stepContent.stt
                  }
                }
                var mappingContentStageIdMappingId = 0;
                if (!(item.content == null || item.content == undefined || item.content == '')) {
                  if (item.content.id != null && item.content.id != undefined && item.content.id != 0) {
                    mappingContentStageIdMappingId = item.content.id
                  }
                  else {
                    mappingContentStageIdMappingId = item.content.stt
                  }
                }
                if (configSpecifications.id == 0) {
                  configSpecifications.configStepByStepStageIdMapping = mappingStepByStepStageId;
                  configSpecifications.configContentStageIdMapping = mappingContentStageIdMappingId;
                }
                else {
                  configSpecifications.configStepByStepStageId = mappingStepByStepStageId;
                  configSpecifications.configStepByStepStageIdMapping = mappingStepByStepStageId;
                  configSpecifications.configContentStageId = mappingContentStageIdMappingId;
                  configSpecifications.configContentStageIdMapping = mappingContentStageIdMappingId;
                }

                configSpecifications.createdBy = '00000000-0000-0000-0000-000000000000';
                configSpecifications.createdDate = new Date();

                configSpecifications.configSpecificationsStageValues = new Array<ConfigSpecificationsStageValueModel>();
                item.listSetting.forEach((setting, indx) => {
                  var configSetting = new ConfigSpecificationsStageValueModel();
                  configSetting.id = 0; // indx + 1;
                  configSetting.configSpecificationsStageId = configSpecifications.id;
                  configSetting.fieldTypeId = (setting.type == null || setting.type == undefined) ? null : setting.type.categoryId;
                  configSetting.firstName = setting.first;
                  configSetting.lastName = setting.last;
                  configSetting.lineOrder = setting.line;
                  configSetting.sortLineOrder = setting.sort;
                  configSetting.productId = setting.productName != null ? setting.productName.productId : setting.productName;
                  configSetting.infoFormula = setting.infor != null ? setting.infor.id : setting.infor;
                  configSetting.formula = setting.valueDvt != null ? setting.valueDvt.id : setting.valueDvt;
                  configSetting.formulaValue = setting.formulaValue;
                  configSetting.createdBy = '00000000-0000-0000-0000-000000000000';
                  configSetting.createdDate = new Date();
                  configSpecifications.configSpecificationsStageValues.push(configSetting);
                });

                config.configSpecificationsStages.push(configSpecifications);
              }
            });

            // mapping ds lỗi
            config.configErrorItems = new Array<ConfigErrorItemModel>();
            this.stageConfigErrorChoose.forEach((cfErr, indx) => {
              var configErr = new ConfigErrorItemModel();
              configErr.id = (cfErr.id == null || cfErr.id == undefined) ? 0 : cfErr.id;
              configErr.configStageId = config.id;
              configErr.errorItemId = cfErr.categoryId;
              configErr.errorItemName = cfErr.categoryName;
              configErr.createdBy = '00000000-0000-0000-0000-000000000000';
              configErr.createdDate = new Date();

              config.configErrorItems.push(configErr);
            });

            // mapping ds nvl đầu vào
            config.configStageProductInputs = new Array<ConfigStageProductInputModel>();
            this.stageConfigNVLChoose.forEach((cfNvl, indx) => {
              var configNvl = new ConfigStageProductInputModel();
              configNvl.id = (cfNvl.id == null || cfNvl.id == undefined) ? 0 : cfNvl.id;
              configNvl.configStageId = config.id;
              configNvl.productId = cfNvl.productId;
              configNvl.productName = cfNvl.productName;
              configNvl.productCode = cfNvl.productCode;
              configNvl.createdBy = '00000000-0000-0000-0000-000000000000';
              configNvl.createdDate = new Date();

              config.configStageProductInputs.push(configNvl);
            });

            config.isStageWithoutNG = this.isHasValueFinishedProduct;
          }
        });
      }
      else {
        var config = new ConfigStageModel();
        config.id = (config.id == null || config.id == undefined) ? 0 : config.id; // this.configProductionData.ConfigStages.length + 1;
        config.stageNameId = this.selectedStage.value.categoryId;
        config.stageName = this.selectedStage.value.categoryName;
        config.stageGroupId = this.selectedGroupStage.value.categoryId;
        config.stageGroupName = this.selectedGroupStage.value.categoryName;
        config.departmentId = this.selectedOrg?.organizationId;
        config.departmentName = this.selectedOrg?.organizationName;
        config.numberPeople = this.selectedNumPerson.value.categoryCode;
        config.sortOrder = this.sortOrderControl.value;
        config.personInChargeId = [];
        config.personInChargeName = [];
        this.selectedListEmployee.value.forEach(item => {
          config.personInChargeId.push(item.employeeId);
          config.personInChargeName.push(item.employeeName);
        });
        config.personVerifierId = this.selectedVerifier.value.employeeId;
        config.personVerifierName = this.selectedVerifier.value.employeeName;
        config.binding = this.checkRequired;
        if (this.checkRequired) {
          config.previousStageNameId = this.selectedStageBefore.value.id == null || this.selectedStageBefore.value.id == undefined ? this.selectedStageBefore.value.stt : this.selectedStageBefore.value.id;
          config.fromTime = this.selectedFrom.value;
          config.toTime = this.selectedTo.value;
        }
        config.createdBy = '00000000-0000-0000-0000-000000000000';
        config.createdDate = new Date();

        // mapping các bước thực hiện
        config.configStepByStepStages = new Array<ConfigStepByStepStageModel>();
        this.stepProgress.forEach((item, index) => {
          var configStep = new ConfigStepByStepStageModel();
          configStep.id = (item.id == null || item.id == undefined) ? 0 : item.id;
          configStep.configStageId = config.id;
          configStep.name = item.text;
          configStep.isShowTextBox = item.isHasValue;
          configStep.createdBy = '00000000-0000-0000-0000-000000000000';
          configStep.createdDate = new Date();
          configStep.mappingId = index + 1;

          config.configStepByStepStages.push(configStep);
        });

        // mapping nội dung hạng mục kiểm tra
        config.configContentStages = new Array<ConfigContentStageModel>();
        this.stepProgressDetail.forEach((item, index) => {
          var configContent = new ConfigContentStageModel();
          configContent.id = (item.id == null || item.id == undefined) ? 0 : item.id;
          configContent.configStageId = config.id;
          configContent.isContentValues = item.isHasValue;
          configContent.contentId = item.content.categoryId;
          configContent.createdBy = '00000000-0000-0000-0000-000000000000';
          configContent.createdDate = new Date();
          configContent.mappingId = index + 1;

          config.configContentStages.push(configContent);
        });

        // mapping quy cách
        config.configSpecificationsStages = new Array<ConfigSpecificationsStageModel>();
        this.listSpecifications.forEach((item, index) => {
          if (!((item.content == null || item.content == undefined || item.content == '') && (item.specifications == null || item.specifications == undefined || item.specifications == '')
            && (item.stepContent == null || item.stepContent == undefined || item.stepContent == ''))) {
            var configSpecifications = new ConfigSpecificationsStageModel();
            configSpecifications.id = (item.id != null && item.id != undefined) ? item.id : 0;
            configSpecifications.configStageId = config.id;
            //configSpecifications.ConfigStepByStepStageId = item.stepContent.id;
            //configSpecifications.ConfigContentStageId = item.content.id;
            configSpecifications.specificationsId = (item.specifications == null || item.specifications == undefined || item.specifications == '') ? '' : item.specifications.categoryId;
            configSpecifications.numberOfSamples = (item.disable == true ? 10000 : (item.numberOfSamples == null || item.numberOfSamples == undefined) ? 0 : item.numberOfSamples);
            configSpecifications.isHaveValues = item.isHaveValues;

            var mappingStepByStepStageId = 0;
            if (!(item.stepContent == null || item.stepContent == undefined || item.stepContent == '')) {
              if (item.stepContent.id != null && item.stepContent.id != undefined && item.stepContent.id != 0) {
                mappingStepByStepStageId = item.stepContent.id
              }
              else {
                mappingStepByStepStageId = item.stepContent.stt
              }
            }
            var mappingContentStageIdMappingId = 0;
            if (!(item.content == null || item.content == undefined || item.content == '')) {
              if (item.content.id != null && item.content.id != undefined && item.content.id != 0) {
                mappingContentStageIdMappingId = item.content.id
              }
              else {
                mappingContentStageIdMappingId = item.content.stt
              }
            }
            if (configSpecifications.id == 0) {
              configSpecifications.configStepByStepStageIdMapping = mappingStepByStepStageId;
              configSpecifications.configContentStageIdMapping = mappingContentStageIdMappingId;
            }
            else {
              configSpecifications.configStepByStepStageId = mappingStepByStepStageId;
              configSpecifications.configStepByStepStageIdMapping = mappingStepByStepStageId;
              configSpecifications.configContentStageId = mappingContentStageIdMappingId;
              configSpecifications.configContentStageIdMapping = mappingContentStageIdMappingId;
            }

            configSpecifications.createdBy = '00000000-0000-0000-0000-000000000000';
            configSpecifications.createdDate = new Date();

            configSpecifications.configSpecificationsStageValues = new Array<ConfigSpecificationsStageValueModel>();
            item.listSetting.forEach((setting, indx) => {
              var configSetting = new ConfigSpecificationsStageValueModel();
              configSetting.id = 0; // indx + 1;
              configSetting.configSpecificationsStageId = configSpecifications.id;
              configSetting.fieldTypeId = (setting.type == null || setting.type == undefined) ? null : setting.type.categoryId;
              configSetting.firstName = setting.first;
              configSetting.lastName = setting.last;
              configSetting.lineOrder = setting.line;
              configSetting.sortLineOrder = setting.sort;
              configSetting.productId = setting.productName != null ? setting.productName.productId : setting.productName;
              configSetting.infoFormula = setting.infor != null ? setting.infor.id : setting.infor;
              configSetting.formula = setting.valueDvt != null ? setting.valueDvt.id : setting.valueDvt;
              configSetting.formulaValue = setting.formulaValue;
              configSetting.createdBy = '00000000-0000-0000-0000-000000000000';
              configSetting.createdDate = new Date();
              configSpecifications.configSpecificationsStageValues.push(configSetting);
            });

            config.configSpecificationsStages.push(configSpecifications);
          }
        });

        // mapping ds lỗi
        config.configErrorItems = new Array<ConfigErrorItemModel>();
        this.stageConfigErrorChoose.forEach((cfErr, indx) => {
          var configErr = new ConfigErrorItemModel();
          configErr.id = (cfErr.id == null || cfErr.id == undefined) ? 0 : cfErr.id;
          configErr.configStageId = config.id;
          configErr.errorItemId = cfErr.categoryId;
          configErr.errorItemName = cfErr.categoryName;
          configErr.createdBy = '00000000-0000-0000-0000-000000000000';
          configErr.createdDate = new Date();

          config.configErrorItems.push(configErr);
        });

        // mapping ds nvl đầu vào
        config.configStageProductInputs = new Array<ConfigStageProductInputModel>();
        this.stageConfigNVLChoose.forEach((cfNvl, indx) => {
          var configNvl = new ConfigStageProductInputModel();
          configNvl.id = (cfNvl.id == null || cfNvl.id == undefined) ? 0 : cfNvl.id;
          configNvl.configStageId = config.id;
          configNvl.productId = cfNvl.productId;
          configNvl.productName = cfNvl.productName;
          configNvl.productCode = cfNvl.productCode;
          configNvl.createdBy = '00000000-0000-0000-0000-000000000000';
          configNvl.createdDate = new Date();

          config.configStageProductInputs.push(configNvl);
        });

        config.isStageWithoutNG = this.isHasValueFinishedProduct;

        this.configProductionData.configStages.push(config);

        this.configProductionData.configStages.forEach((item, index) => {
          item.stt = index + 1;
        });
      }

      this.myTable.reset();
      this.loading = false;
      this.displayCreateStage = false;
    }
  }

  cancelSetting() {
    this.displaySetting = false;
  }

  saveSetting() {
    this.saveActionConfigStage = true;
    if (!this.validateConfigStage()) {
      this.listSpecifications.forEach(item => {
        if (item.stt == this.choosedSttQC) {
          item.listSetting = this.listSetting
        }
      });
      this.cancelSetting();
    }
  }

  validateConfigStage() {
    var result = false;
    this.listSetting.forEach(item => {
      if (!result) {
        if (item.type == null || item.type == undefined || item.sort == null || item.sort == undefined || item.line == null || item.line == undefined
          || (item.productName != null && (item.infor == null || item.infor == undefined))) {
          result = true;
        }
      }
    });
    return result;
  }

  onChangeTabView(e) {
    this.stepProgressQC = [{ stt: 0, id: null, text: "", isHasValue: false }]
    this.stepProgress.forEach((item, index) => {
      this.stepProgressQC.push({ stt: index + 1, id: item.id, text: item.text, isHasValue: item.isHasValue });
    });

    this.stepProgressDetailQC = [{ stt: 0, id: null, text: "", isHasValue: false }];
    this.stepProgressDetail.forEach((item, index) => {
      this.stepProgressDetailQC.push({ stt: index + 1, id: item.id, text: item.content.categoryName, isHasValue: item.isHasValue });
    });
  }

  checkListError(e, item) {
    if (this.configProductionData.inspectionStageId == null || this.configProductionData.inspectionStageId == undefined) {
      this.configProductionData.inspectionStageId = [];
    }
    if (e.checked) {
      this.configProductionData.inspectionStageId.push(item.categoryId);
    } else {
      var num = this.configProductionData.inspectionStageId.indexOf(item.categoryId);
      if (num > -1) {
        this.configProductionData.inspectionStageId.splice(num, 1);
      }
    }
  }

  nextError() {
    this.selectedConfigError.forEach(item => {
      var err = this.stageConfigError.indexOf(item);
      if (err > -1) {
        this.stageConfigError.splice(err, 1);
      }
      this.stageConfigErrorChoose.push(item);
    });

    this.selectedConfigError = [];
  }

  pressError() {
    this.selectedConfigErrorChoose.forEach(item => {
      var err = this.stageConfigErrorChoose.indexOf(item);
      if (err > -1) {
        this.stageConfigErrorChoose.splice(err, 1);
      }
      this.stageConfigError.push(item);
    });

    this.selectedConfigErrorChoose = [];
  }

  nextNVL() {
    this.selectedConfigNVL.forEach(item => {
      var err = this.stageConfigNVL.indexOf(item);
      if (err > -1) {
        this.stageConfigNVL.splice(err, 1);
      }
      this.stageConfigNVLChoose.push(item);
    });

    this.selectedConfigNVL = [];
  }

  pressNVL() {
    this.selectedConfigNVLChoose.forEach(item => {
      var err = this.stageConfigNVLChoose.indexOf(item);
      if (err > -1) {
        this.stageConfigNVLChoose.splice(err, 1);
      }
      this.stageConfigNVL.push(item);
    });

    this.selectedConfigNVLChoose = [];
  }

  onRowRemove(event) {
    var err = this.configProductionData.configStages.indexOf(event);
    if (err > -1) {
      this.configProductionData.configStages.splice(err, 1);
    }
  }

  openOrgPopup() {
    let selectedId = null;
    if (this.selectedOrg != null && this.selectedOrg != undefined) {
      selectedId = this.orgList.find(c => c.organizationId == this.selectedOrg.organizationId);
    }
    
    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 2,
        selectedId: selectedId
      },
      header: 'Chọn đơn vị',
      width: '40%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result?.length > 0) {
          this.selectedOrg = result[0];
          this.organizationName.setValue(this.selectedOrg.organizationName);
          this.onChangeOrg();
        }
        else {
        }
      }
    });
  }

  changeStage() {
    var addStep = [{ stt: this.stepProgress.length + 1, label: this.selectedStage.value.categoryName, text: this.selectedStage.value.categoryName, id: null, isHasValue: false }];

    this.stepProgress = addStep.concat(this.stepProgress)
  }

  addCategory(rowdata) {
    this.chooseDataQC = rowdata;

    this.categoryName = new FormControl('', [Validators.required]);
    this.description = new FormControl('');

    this.categoryForm = new FormGroup({
      categoryName: this.categoryName,
      description: this.description,
    });

    this.categoryName.setValue("");
    this.description.setValue("");
    this.isSave = false;

    this.displayAddQC = true;
  }

  cancelCategory() {
    this.displayAddQC = false;
  }

  saveCategory() {
    this.isSave = true;
    if (!this.categoryForm.valid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        if (this.categoryForm.controls[key].valid == false) {
          this.categoryForm.controls[key].markAsTouched();
        }
      });
    } else {
      this.loading = true;
      var categoryCode = 'QC';
      if (this.specificationsList.length < 10) {
        categoryCode = categoryCode + "0000" + this.specificationsList.length;
      }
      else if (this.specificationsList.length >= 10 && this.specificationsList.length < 100) {
        categoryCode = categoryCode + "000" + this.specificationsList.length;
      }
      else if (this.specificationsList.length >= 100 && this.specificationsList.length < 1000) {
        categoryCode = categoryCode + "00" + this.specificationsList.length;
      }
      else if (this.specificationsList.length >= 1000 && this.specificationsList.length < 10000) {
        categoryCode = categoryCode + "0" + this.specificationsList.length;
      }
      else {
        categoryCode = categoryCode + this.specificationsList.length;
      }

      this.categoryService.createCategory(this.categoryName.value?.trim(), categoryCode, '', 1, 'QC', this.description.value?.trim())
        .subscribe(response => {
          let result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.categoryTypeModellist = result.categoryTypeList;
            this.setCategory();

            this.listSpecifications.forEach(item => {
              if (item.stt == this.chooseDataQC.stt) {
                item.specifications = this.specificationsList.find(c => c.categoryId == result.categoryId);
              }
            })
            this.isSave = false;
            this.cancelCategory();
          } else {
            this.messageService.add({
              severity: 'error', summary: 'Thông báo', detail: result.messageCode
            });
          }
          this.loading = false;
        });
    }
  }

  changeNVL(rowData) {
    console.log(rowData)
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

function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null) {
      if (array.indexOf(control.value.toLowerCase()) !== -1 && control.value.toLowerCase() !== "") {
        return { 'duplicateCode': true };
      }
      return null;
    }
  }
};

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
};

function forbiddenSpaceText(control: FormControl) {
  let text = control.value;
  if (text && text.trim() == "") {
    return {
      forbiddenSpaceText: {
        parsedDomain: text
      }
    }
  }
  return null;
};

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
