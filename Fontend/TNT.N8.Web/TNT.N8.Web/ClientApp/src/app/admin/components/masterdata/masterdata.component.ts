import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CategoryService } from "../../../shared/services/category.service";
import { ProvinceService } from "../../../shared/services/province.service";
import { TranslateService } from '@ngx-translate/core';
import { MasterdataDialogComponent } from '../masterdata-dialog/masterdata-dialog.component';

import { EmployeeService } from '../../../employee/services/employee.service';
import { Router } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';


interface CategoryTypeModel {
  categoryTypeId: string,
  categoryTypeName: string;
  categoryTypeCode: string;
  categoryList: Array<CategoryModel>;
  active: boolean,
}

interface CategoryModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  categoryTypeId: CategoryTypeModel["categoryTypeId"];
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: string;
  active: Boolean;
  isEdit: Boolean;
  isDefault: Boolean;
  statusName: string;
  potentialName: string;
  sortOrder: string;
  categoryTypeName: string;
}

@Component({
  selector: 'app-masterdata',
  templateUrl: './masterdata.component.html',
  styleUrls: ['./masterdata.component.css']
})
export class MasterdataComponent implements OnInit {
  loading: boolean = false;
  masterDataCodeDisplay: string; // dialog
  masterDataParentDisplay: string; // dialog
  selectedCategoryTypeId: string; // dialog
  selectedCategoryId: string; // dialog
  selectedCategoryName: string; // dialog
  selectedSortOrder: number; // dialog

  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  // longhdh
  categoryTypeModellist: Array<CategoryTypeModel> = [];
  categoryTypeModel: CategoryTypeModel;
  selectedCategoryType = new FormControl('');
  colHeader: any[];
  categoryModelDefaultList: Array<CategoryModel> = [];
  categoryModelEditList: Array<CategoryModel> = [];
  checkItem: Array<CategoryModel> = [];
  selectAllDefault: boolean;
  selectAllEdit: boolean;
  displayModal: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private getPermission: GetPermission,
    private router: Router,
    private categoryService: CategoryService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
  ) {
    this.translate.setDefaultLang('vi');
  }

  async ngOnInit() {
    this.initTable();

    let resource = "sys/admin/masterdata/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.messageService.add({ severity: 'warn', summary: "Th??ng b??o", detail: "B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???" })
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      } if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      } if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      this.getMasterData();
    }
  }

  /* #region  t???o header cho table */
  initTable() {
    this.colHeader = [
      { field: 'categoryName', header: 'T??n d??? li???u', textAlign: 'left', display: 'table-cell', colWidth: 'auto' },
      { field: 'categoryCode', header: 'M?? d??? li???u', textAlign: 'left', display: 'table-cell', colWidth: '15%' },
      { field: 'sortOrder', header: 'Th??? t???', textAlign: 'center', display: 'table-cell', colWidth: '10%' },
    ];
  }
  /* #endregion */

  getMasterData() {
    this.loading = true;
    this.categoryService.getAllCategory().subscribe(res => {
      let result = <any>res;
      this.categoryTypeModellist = result.categoryTypeList;
      if (!this.selectedCategoryType.value) {
        this.selectedCategoryType.setValue(this.categoryTypeModellist[0]);
        this.categoryTypeModel = this.selectedCategoryType.value;
      } else {
        this.categoryTypeModel = this.categoryTypeModellist.find(c => c.categoryTypeId == this.selectedCategoryType.value.categoryTypeId);
      }

      this.categoryModelDefaultList = this.categoryTypeModel.categoryList.filter(c => c.isEdit == false);
      this.categoryModelEditList = this.categoryTypeModel.categoryList.filter(c => c.isEdit == true);
      this.checkItem = this.categoryTypeModel.categoryList.filter(c => c.isDefault == true);
      this.selectAllDefault = this.categoryModelDefaultList.filter(c => c.active == true).length == this.categoryModelDefaultList.length ? true : false;
      this.selectAllEdit = this.categoryModelEditList.filter(c => c.active == true).length == this.categoryModelEditList.length && this.categoryModelEditList.length != 0 ? true : false;

      this.loading = false;
    });

  }

  /* #region  is all default category selected */
  isAllDefaultSelected() {
    let numcategoryDefault = this.categoryModelDefaultList.length;
    let numcategoryDefaultSelected = this.categoryModelDefaultList.filter(c => c.active == true).length;
    return numcategoryDefaultSelected == numcategoryDefault
  }
  /* #endregion */

  /* #region  checkbox cho ho???t ?????ng c???a d??? li???u m???c ?????nh */
  masterToggleDdefault() {
    if (this.isAllDefaultSelected()) {
      this.categoryModelDefaultList.forEach(val => {
        val.active = false;
      })
    } else {
      this.categoryModelDefaultList.forEach(val => {
        if (!val.active) {
          val.active = true;
        }
      })
    }
    this.updateActiveDefault("all");
  }
  /* #endregion */

  /* #region  is all default category selected */
  isAllEditSelected() {
    let numcategoryEdit = this.categoryModelEditList.length;
    let numcategoryEditSelected = this.categoryModelEditList.filter(c => c.active == true).length;
    return numcategoryEditSelected == numcategoryEdit
  }
  /* #endregion */

  /* #region  checkbox cho ho???t ?????ng c???a d??? li???u t??y ch???nh */
  masterToggleEdit() {
    if (this.isAllEditSelected()) {
      this.categoryModelEditList.forEach(val => {
        val.active = false;
      })
    } else {
      this.categoryModelEditList.forEach(val => {
        if (!val.active) {
          val.active = true;
        }
      })
    }
    this.updateActiveEdit("all");
  }
  /* #endregion */

  /* #region  update active cho d??? li???u m???c ?????nh */
  updateActiveDefault(id: string) {
    if (id === "all") {
      this.categoryModelDefaultList.forEach(val => {
        if (val.categoryId != null || val.categoryId != '') {
          this.categoryService.updateStatusIsActive(val.categoryId, val.active).subscribe(res => { });
        }
      })
    } else {
      if (this.isAllDefaultSelected()) {
        this.selectAllDefault = true;
      } else {
        this.selectAllDefault = false;
      }
      let active = this.categoryModelDefaultList.find(c => c.categoryId == id).active;
      this.categoryService.updateStatusIsActive(id, active).subscribe(res => { });
    }
  }
  /* #endregion */

  /* #region  update active cho d??? li???u t??y ch???nh */
  updateActiveEdit(id: string) {
    if (id === "all") {
      this.categoryModelEditList.forEach(val => {
        if (val.categoryId != null || val.categoryId != '') {
          this.categoryService.updateStatusIsActive(val.categoryId, val.active).subscribe(res => { });
        }
      })
    } else {
      this.selectAllEdit = this.isAllEditSelected() ? true : false;
      let active = this.categoryModelEditList.find(c => c.categoryId == id).active;
      this.categoryService.updateStatusIsActive(id, active).subscribe(res => { });
    }
  }
  /* #endregion */

  /* #region  update isDefault cho categoryModel */
  updateIsDefault(id: string) {
    this.categoryModelDefaultList.forEach(val => {
      val.isDefault = false;
    });
    this.categoryModelDefaultList.find(c => c.categoryId == id).isDefault = true;
    let cagetoryTypeId = this.categoryModelDefaultList.find(c => c.categoryId == id).categoryTypeId;
    this.categoryService.updateStatusIsDefault(id, cagetoryTypeId).subscribe(res => { });
  }
  /* #endregion */

  /* #region  delete m???t d??? li???u t??y ch???nh */
  deleteMasterDataById(id: string, count: number) {
    if (count !== 0) {
      this.displayModal = true;
    } else {

      this.confirmationService.confirm({
        message: 'B???n c?? ch???c ch???n mu???n x??a?',
        accept: () => {
          this.selectedCategoryId = id;
          this.categoryService.deleteCategoryById(this.selectedCategoryId).subscribe(res => {
            let result = <any>res;
            if (result.statusCode === 202 || result.statusCode === 200) {
              this.messageService.add({ severity: "success", summary: "Th??ng b??o", detail: result.messageCode })
              this.getMasterData();
            } else {
              this.messageService.add({ severity: "error", summary: "Th??ng b??o", detail: result.messageCode })
            }
          });
        }
      });
    }
  }
  /* #endregion */

  /* #region  m??? dialog th??m ho???c s???a m???t category t??y ch???nh */
  openMasterDataDialog(mode: string, id: string, isDefault: boolean = false) {

    if (id != "create") {
      var getbyId = this.categoryTypeModel.categoryList.find(c => c.categoryId == id);
      this.selectedCategoryId = id;
      this.selectedCategoryName = getbyId.categoryName;
      this.masterDataCodeDisplay = getbyId.categoryCode;
    }
    this.selectedCategoryTypeId = this.categoryTypeModel.categoryTypeId;
    this.masterDataParentDisplay = this.categoryTypeModellist.find(t => t.categoryTypeId == this.selectedCategoryTypeId).categoryTypeName;

    this.selectedSortOrder = id === "create" ? 0 : Number(getbyId.sortOrder);

    let currentGroupData = this.selectedCategoryType.value;
    let ref = this.dialogService.open(MasterdataDialogComponent, {
      header: 'TH??NG TIN D??? LI???U',
      width: '600px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      },
      data: { selectedCategoryId: this.selectedCategoryId, selectedCategoryName: this.selectedCategoryName, mode: mode, selectedCategoryCode: this.masterDataCodeDisplay, selectedCategoryType: this.masterDataParentDisplay, selectedCategoryTypeId: this.selectedCategoryTypeId, sortOrder: this.selectedSortOrder, isDefault: isDefault }
    });

    ref.onClose.subscribe(result => {
      if (result) {
        if (result.categoryCreated || result.categoryEdited) {
          this.messageService.add({ severity: "success", summary: "Th??ng b??o", detail: result.message })
          this.loading = true;

          this.categoryService.getAllCategory().subscribe(res => {
            let result = <any>res;
            this.categoryTypeModellist = result.categoryTypeList;
            if (!this.selectedCategoryType.value) {
              this.selectedCategoryType.setValue(currentGroupData);
              this.categoryTypeModel = this.selectedCategoryType.value;
            } else {
              this.categoryTypeModel = this.categoryTypeModellist.find(c => c.categoryTypeId == this.selectedCategoryType.value.categoryTypeId);
            }

            this.categoryModelDefaultList = this.categoryTypeModel.categoryList.filter(c => c.isEdit == false);
            this.categoryModelEditList = this.categoryTypeModel.categoryList.filter(c => c.isEdit == true);
            this.checkItem = this.categoryTypeModel.categoryList.filter(c => c.isDefault == true);
            this.selectAllDefault = this.categoryModelDefaultList.filter(c => c.active == true).length == this.categoryModelDefaultList.length ? true : false;
            this.selectAllEdit = this.categoryModelEditList.filter(c => c.active == true).length == this.categoryModelEditList.length && this.categoryModelEditList.length != 0 ? true : false;

            this.loading = false;
          });
        }
      }
    });
  }
  /* #endregion */

  selectItemChange() {
    this.categoryTypeModel = this.selectedCategoryType.value;
    this.categoryModelDefaultList = this.categoryTypeModel.categoryList.filter(c => c.isEdit == false);
    this.categoryModelEditList = this.categoryTypeModel.categoryList.filter(c => c.isEdit == true);
    this.checkItem = this.categoryTypeModel.categoryList.filter(c => c.isDefault == true);
    this.selectAllDefault = this.categoryModelDefaultList.filter(c => c.active == true).length == this.categoryModelDefaultList.length ? true : false;
    this.selectAllEdit = this.categoryModelEditList.filter(c => c.active == true).length == this.categoryModelEditList.length && this.categoryModelEditList.length != 0 ? true : false;
  }
}
