import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as $ from 'jquery';

/* COMPONENTS */
import { PopupComponent } from '../../../../shared/components/popup/popup.component';
/*End*/

/* MODELS */
import { WarehouseModel } from '../../../models/warehouse.model'
/*End*/

/* SERVICES */
import { WarehouseService } from "../../../services/warehouse.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
/*End*/

/* Primeng API */
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from "primeng/dynamicdialog";
import { ChonNhieuDvDialogComponent } from "../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component";

/* end PrimeNg API */

interface DialogResult {
  status: boolean;
  message: string;
}

class keeperModel {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
}

class warehouseModel {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseParent: string;
  warehouseAddress: string;
  warehousePhone: string;
  storagekeeper: string;
  warehouseDescription: string;
  active: boolean;
  createdDate: Date;
  createdById: string;
  updatedDate: Date;
  updatedById: string;
  wareHouseType: string;
  warehouseCodeName: string;
  departmentName: string;
  department: string;
}

@Component({
  selector: "app-warehouse-create-update",
  templateUrl: "./warehouse-create-update.component.html",
  styleUrls: ["./warehouse-create-update.component.css"],
  providers: [DialogService, ConfirmationService, MessageService],
})
export class WarehouseCreateUpdateComponent implements OnInit {
  loading: boolean = false;
  auth: any = JSON.parse(localStorage.getItem("auth"));
  emptyGuid = "00000000-0000-0000-0000-000000000000";
  systemParameterList = JSON.parse(localStorage.getItem("systemParameterList"));
  //master data
  // listKeeper: Array<keeperModel> = [];
  listWarehouseCode: Array<string> = [];
  // master data edit
  WarehouseEntityModel: warehouseModel;
  listCategoryEntityModel: Array<any> = [];
  listOrganization: Array<any> = [];

  submitted: boolean = false;

  listSelectedDonVi: Array<any> = [];
  error: any = {
    EmployeeCode: "",
    IsAccessable: "",
    FirstName: "",
    LastName: "",
    TenTiengAnh: "",
    Gender: "",
    DateOfBirth: "",
    QuocTich: "",
    DanToc: "",
    TonGiao: "",
    OrganizationId: "",
    StartedDate: "",
    PositionId: "",
    ViTriLamViec: "",
    Phone: "",
    OtherPhone: "",
    WorkPhone: "",
    Email: "",
    WorkEmail: "",
  };

  //pop up
  isEdit: boolean = false;
  editedWarehouseModel: warehouseModel;
  listWarehouseNameEqualLevel: Array<string> = [];

  parentId: string;
  //forms
  createWarehouseForm: FormGroup;
  constructor(
    private warehouseService: WarehouseService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private el: ElementRef
  ) {}

  async ngOnInit() {
    this.initForm();
    this.getMasterdata();
    this.isEdit = this.config.data.isEdit;
    this.listWarehouseNameEqualLevel =
      this.config.data.listWarehouseNameEqualLevel;
    this.parentId = this.config.data.parentId;

    if (this.isEdit == true) {
      this.editedWarehouseModel = this.config.data.editedWarehouseModel;
      this.listWarehouseNameEqualLevel =
        this.listWarehouseNameEqualLevel.filter(
          (e) => e !== this.editedWarehouseModel.warehouseName
        );
    }

    this.createWarehouseForm
      .get("WarehouseName")
      .setValidators([
        Validators.required,
        checkDuplicateCode(this.listWarehouseNameEqualLevel),
        checkBlankString(),
      ]);
    this.createWarehouseForm.updateValueAndValidity();
  }

  openOrgPopup() {
    let listSelectedId = this.listSelectedDonVi.map(
      (item) => item.organizationId
    );
    let selectedId = null;
    if (listSelectedId.length > 0) {
      selectedId = listSelectedId[0];
    }

    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 2,
        selectedId: selectedId,
      },
      header: "Chọn đơn vị",
      width: "40%",
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        overflow: "auto",
      },
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result?.length > 0) {
          this.listSelectedDonVi = result;
          let listSelectedTenDonVi = this.listSelectedDonVi.map(
            (x) => x.organizationName
          );
          this.createWarehouseForm.controls.Department.patchValue(
            listSelectedTenDonVi
          );
          // this.error["OrganizationId"] = null;
        } else {
          this.listSelectedDonVi = [];
          this.createWarehouseForm.controls.Department.patchValue(null);
          // this.error["OrganizationId"] = "Không được để trống";
        }
      }
    });
  }

  async getMasterdata() {
    this.loading = true;
    let result: any =
      await this.warehouseService.createUpdateWarehouseMasterdata(
        null,
        this.auth.UserId
      );
    this.loading = false;
    if (result.statusCode === 200) {
      this.listCategoryEntityModel = result.listCategoryEntityModel;
      this.listOrganization = this.listOrganization;
      if (this.isEdit == true) {
        this.mappingModelToForm(this.editedWarehouseModel);
        this.listWarehouseCode = this.listWarehouseCode.filter(
          (e) => e !== this.editedWarehouseModel.warehouseCode
        );
      }
    } else {
      this.clearToast();
      this.showToast("error", "Thông báo", result.messageCode);
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
    });
  }

  clearToast() {
    this.messageService.clear();
  }

  openProductCategoryDialog() {}

  initForm() {
    this.createWarehouseForm = new FormGroup({
      WarehouseName: new FormControl("", Validators.required),
      WarehouseCode: new FormControl("", Validators.required),
      WarehouseAddress: new FormControl(""),
      WarehousePhone: new FormControl("", [
        Validators.pattern(this.getPhonePattern()),
      ]),
      WareHouseType: new FormControl(null),
      WarehouseDescription: new FormControl(""),
      Department: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
    });
  }

  resetForm() {
    this.createWarehouseForm.reset();
    this.createWarehouseForm.patchValue({
      WarehouseName: new FormControl("", Validators.required),
      WarehouseCode: new FormControl("", Validators.required),
      WarehouseAddress: new FormControl(""),
      WarehousePhone: new FormControl(""),
      WareHouseType: new FormControl(""),
      WarehouseDescription: new FormControl(""),
      Department: new FormControl(""),
    });
  }

  cancel() {
    this.ref.close();
    // this.confirmationService.confirm({
    //   message:
    //     "Các thay đổi sẽ không được lưu lại. Hành động này không thể được hoàn tác, bạn có chắc chắn muốn hủy?",
    //   accept: () => {
    //     this.ref.close();
    //   },
    // });
  }

  // getdataAfterMasterdata() {
  //   let keeperValue = this.editedWarehouseModel.storagekeeper;
  //   if (keeperValue == null) {
  //     this.createWarehouseForm.get('Keeper').setValue(null);
  //   } else {
  //     this.createWarehouseForm.get('Keeper').setValue(this.listKeeper.find(e => e.employeeId == keeperValue));
  //   }
  // }

  async createWarehouse() {
    if (!this.createWarehouseForm.valid) {
      Object.keys(this.createWarehouseForm.controls).forEach((key) => {
        if (!this.createWarehouseForm.controls[key].valid) {
          this.createWarehouseForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector(
        ".form-control.ng-invalid"
      );
      if (target) {
        $("html,body").animate({ scrollTop: $(target).offset().top }, "slow");
        target.focus();
      }
    } else {
      //valid
      let warehouse: WarehouseModel = this.mappingFormToModel();
      this.loading = true;
      let result: any = await this.warehouseService.createWareHouseAsync(
        warehouse
      );
      this.loading = false;
      if (result.statusCode === 200) {
        if (this.isEdit == false) {
          //tao moi
          let resultDialog: DialogResult = {
            status: true,
            message: "Tạo thành công",
          };
          this.ref.close(resultDialog);
        } else {
          //edit
          let resultDialog: DialogResult = {
            status: true,
            message: "Chỉnh sửa thành công",
          };
          this.ref.close(resultDialog);
        }
      } else {
        let resultDialog: DialogResult = {
          status: false,
          message: result.messageCode,
        };
        this.ref.close(resultDialog);
      }
    }
  }

  mappingModelToForm(editedWarehouseModel: warehouseModel) {
   
    this.createWarehouseForm
      .get("WarehouseName")
      .setValue(editedWarehouseModel.warehouseName);
    this.createWarehouseForm
      .get("WarehouseCode")
      .setValue(editedWarehouseModel.warehouseCode);
    this.createWarehouseForm
      .get("WarehouseAddress")
      .setValue(editedWarehouseModel.warehouseAddress);
    this.createWarehouseForm
      .get("WarehousePhone")
      .setValue(editedWarehouseModel.warehousePhone);
    this.createWarehouseForm
      .get("WarehouseDescription")
      .setValue(editedWarehouseModel.warehouseDescription);
    
    var obj = this.listCategoryEntityModel.find(c => c.categoryId == editedWarehouseModel.wareHouseType);

    this.createWarehouseForm
      .get("WareHouseType")
      .setValue(obj);
    var objDepartment = this.listSelectedDonVi.find(c => c.organizationId == editedWarehouseModel.department).departmentName
    
    this.createWarehouseForm.get("Department").setValue(objDepartment);
  }

  mappingFormToModel(): WarehouseModel {
    let warehouseModel = new WarehouseModel();
    if (this.isEdit == false) {
      warehouseModel.WarehouseId = this.emptyGuid;
    } else {
      warehouseModel.WarehouseId = this.editedWarehouseModel.warehouseId;
    }
    //form values
    warehouseModel.WarehouseCode =
      this.createWarehouseForm.get("WarehouseCode").value;
    warehouseModel.WarehouseName =
      this.createWarehouseForm.get("WarehouseName").value;
    warehouseModel.WareHouseType =
      this.createWarehouseForm.get("WareHouseType")?.value?.categoryId;
    warehouseModel.Department =
      this.listSelectedDonVi != null && this.listSelectedDonVi.length > 0
        ? this.listSelectedDonVi[0]?.organizationId
        : this.emptyGuid;
    
    warehouseModel.WarehouseAddress = this.createWarehouseForm
      .get("WarehouseAddress")
      .value.trim();
    warehouseModel.WarehousePhone = this.createWarehouseForm
      .get("WarehousePhone")
      .value.trim();
    warehouseModel.WarehouseDescription = this.createWarehouseForm
      .get("WarehouseDescription")
      .value.trim();
    //default value
    warehouseModel.WarehouseParent = this.parentId;
    warehouseModel.Active = true;
    warehouseModel.CreatedDate = new Date();
    warehouseModel.CreatedById = this.auth.UserId;
    warehouseModel.UpdatedDate = new Date();
    warehouseModel.UpdatedById = this.auth.UserId;

    return warehouseModel;
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(
      (systemParameter) => systemParameter.systemKey == "DefaultPhoneType"
    );
    return phonePatternObj.systemValueString;
  }
  /*end*/
}

function checkBlankString(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() === "") {
        return { 'blankString': true };
      }
    }
    return null;
  }
}

function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      if (control.value.trim() !== "") {
        let duplicateCode = array.find(e => e.trim().toLowerCase() === control.value.trim().toLowerCase());
        if (duplicateCode !== undefined) {
          return { 'duplicateCode': true };
        }
      }
    }
    return null;
  }
}
