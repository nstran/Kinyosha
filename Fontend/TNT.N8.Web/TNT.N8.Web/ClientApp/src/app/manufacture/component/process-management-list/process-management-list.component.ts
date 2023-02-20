import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';
import { FormControl, Validators, FormGroup } from '@angular/forms';

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
import { CategoryService } from "../../../shared/services/category.service";

class StageGroup {
  stt: number; // STT
  name: string; // Tên nhóm công đoạn
  description: string; // Mô tả
}

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
  sortOrder: number;
  categoryTypeName: string;
}


@Component({
  selector: 'app-process-management-list',
  templateUrl: './process-management-list.component.html',
  styleUrls: ['./process-management-list.component.css']
})

export class ProcessManagementListComponent implements OnInit {
  loading: boolean = false;
  /* file section */
  colsStageGroup: any = [];
  colsStage: any = [];
  colsTestContent: any = [];
  colsErrorCheckingItem: any = [];
  colsSpecifications: any = [];
  labelName: string = '';
  categoryTypeCode: string = 'NCD';
  display: boolean = false;
  categoryTypeModellist: Array<CategoryTypeModel> = [];
  categoryModelList: Array<CategoryModel> = [];
  selectedIndex: any;
  listStageGroup: Array<StageGroup> = [];

  @ViewChild('myTableNCD') myTableNCD: Table;
  @ViewChild('myTableCD') myTableCD: Table;
  @ViewChild('myTableNDKT') myTableNDKT: Table;
  @ViewChild('myTableQC') myTableQC: Table;
  @ViewChild('myTableKTL') myTableKTL: Table;

  categoryName = new FormControl('');
  description = new FormControl('');
  categoryForm: FormGroup;

  rowDataChoose: any = null;
  isSave: boolean = true;

  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  constructor(
    private manufactureService: ManufactureService,
    private messageService: MessageService,
    private categoryService: CategoryService,
    private router: Router,
    private getPermission: GetPermission,
    private confirmationService: ConfirmationService,
  ) {
    
  }

  async ngOnInit() {
    this.initTable();
    let resource = "man/manufacture/process-management/list";
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
    this.getMasterData();
    this.setForm();
  }

  getMasterData() {
    this.loading = true;
    this.categoryService.getAllCategory().subscribe(res => {
      let result = <any>res;
      this.categoryTypeModellist = result.categoryTypeList;

      this.categoryModelList = this.categoryTypeModellist.find(c => c.categoryTypeCode == this.categoryTypeCode)?.categoryList ?? [];

      this.categoryModelList.forEach((item, index) => {
        item.sortOrder = index + 1;
      });
      this.loading = false;
    });

  }

  setForm() {
    this.categoryName = new FormControl('', [Validators.required]);
    this.description = new FormControl('');

    this.categoryForm = new FormGroup({
      categoryName: this.categoryName,
      description: this.description,
    });
  }

  initTable() {
    /*Table*/
    this.colsStageGroup = [
      { field: 'sortOrder', header: 'STT', width: '5%', textAlign: 'center', type: 'number' },
      { field: 'categoryName', header: 'Tên nhóm công đoạn', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'description', header: 'Mô tả', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '15%', textAlign: 'center', type: 'string' },
    ];

    this.colsStage = [
      { field: 'sortOrder', header: 'STT', width: '5%', textAlign: 'center', type: 'number' },
      { field: 'categoryName', header: 'Tên quy trình/công đoạn', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'description', header: 'Mô tả', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '15%', textAlign: 'center', type: 'string' },
    ];

    this.colsTestContent = [
      { field: 'sortOrder', header: 'STT', width: '5%', textAlign: 'center', type: 'number' },
      { field: 'categoryName', header: 'Tên nội dung kiểm tra', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'description', header: 'Mô tả', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '15%', textAlign: 'center', type: 'string' },
    ];

    this.colsSpecifications = [
      { field: 'sortOrder', header: 'STT', width: '5%', textAlign: 'center', type: 'number' },
      { field: 'categoryName', header: 'Tên quy cách/ghi chú/tham khảo', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'description', header: 'Mô tả', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '15%', textAlign: 'center', type: 'string' },
    ];

    this.colsErrorCheckingItem = [
      { field: 'sortOrder', header: 'STT', width: '5%', textAlign: 'center', type: 'number' },
      { field: 'categoryName', header: 'Tên danh mục', width: '35%', textAlign: 'left', type: 'string' },
      { field: 'description', header: 'Mô tả', width: '40%', textAlign: 'left', type: 'string' },
      { field: 'setting', header: 'Thao tác', width: '15%', textAlign: 'center', type: 'string' },
    ];
  }

  addNew(type: string) {
    this.setForm();
    this.categoryTypeCode = type;
    this.categoryName.setValue("");
    this.description.setValue("");
    this.isSave = false;

    switch (type) {
      case 'NCD':
        this.labelName = 'nhóm công đoạn';
        break;
      case 'CD':
        this.labelName = 'công đoạn';
        break;
      case 'NDKT':
        this.labelName = 'nội dung kiểm tra';
        break;
      case 'QC':
        this.labelName = 'quy cách/ghi chú/tham khảo';
        break;
      case 'KTL':
        this.labelName = 'hạng mục kiểm tra lỗi';
        break;
    }
    this.display = true;
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
      if (this.rowDataChoose == null) {
        var categoryCode = this.categoryTypeCode;
        if (this.categoryModelList.length < 10) {
          categoryCode = this.categoryTypeCode + "000" + this.categoryModelList.length;
        }
        else if (this.categoryModelList.length >= 10 && this.categoryModelList.length < 100) {
          categoryCode = this.categoryTypeCode + "00" + this.categoryModelList.length;
        }
        else if (this.categoryModelList.length >= 100 && this.categoryModelList.length < 1000) {
          categoryCode = this.categoryTypeCode + "0" + this.categoryModelList.length;
        }
        else {
          categoryCode = this.categoryTypeCode + this.categoryModelList.length;
        }

        this.categoryService.createCategory(this.categoryName.value?.trim(), categoryCode, '', 1, this.categoryTypeCode, this.description.value?.trim())
          .subscribe(response => {
            let result = <any>response;
            if (result.statusCode === 202 || result.statusCode === 200) {
              this.getMasterData();
              this.display = false;
              this.isSave = false;
            } else {
              this.messageService.add({
                severity: 'error', summary: 'Thông báo', detail: result.messageCode
              });
              this.loading = false;
            }
          });
      }
      else {
        this.categoryService.editCategoryById(this.rowDataChoose.categoryId, this.categoryName.value?.trim(), this.rowDataChoose.categoryCode, this.rowDataChoose.sortOrder, this.description.value?.trim()).subscribe(response => {
          let result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.getMasterData();
            this.display = false;
            this.rowDataChoose = null;
            this.isSave = false;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
            this.loading = false;
          }
        });
      }
    }
  }

  cancelCategory() {
    this.display = false;
  }

  onChange(e) {
    switch (e.index) {
      case 0:
        this.categoryModelList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'NCD')?.categoryList ?? [];
        break;
      case 1:
        this.categoryModelList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'CD')?.categoryList ?? [];
        break;
      case 2:
        this.categoryModelList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'NDKT')?.categoryList ?? [];
        break;
      case 3:
        this.categoryModelList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'QC')?.categoryList ?? [];
        break;
      case 4:
        this.categoryModelList = this.categoryTypeModellist.find(c => c.categoryTypeCode == 'KTL')?.categoryList ?? [];
        break;
    }

    this.categoryModelList.forEach((item, index) => {
      item.sortOrder = index + 1;
    });
  }

  editRowData(rowData, type) {
    this.addNew(type);
    this.rowDataChoose = rowData;

    this.categoryName.setValue(rowData.categoryName);
    this.description.setValue(rowData.description);
  }

  removeRowData(rowData, type) {
    this.categoryTypeCode = type;
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.categoryService.deleteCategoryById(rowData.categoryId).subscribe(res => {
          let result = <any>res;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.messageService.add({ severity: "success", summary: "Thông báo", detail: result.messageCode })
            this.getMasterData();
          } else {
            this.messageService.add({ severity: "error", summary: "Thông báo", detail: result.messageCode });
            this.loading = false;
          }
        });
      }
    });
  }
}
