import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProjectModel } from '../../models/project.model';
import { DatePipe } from '@angular/common';
import { DialogService } from 'primeng/dynamicdialog';
import { ProjectResourceModel } from '../../models/ProjectResource.model';
import { AddProjectResourceDialogComponent } from '../add-project-resource-dialog/add-project-resource-dialog.component';
import { ContactModel, contactModel } from '../../../../../src/app/shared/models/contact.model';
import { ProjectTaskModel } from '../../models/ProjectTask.model';
import { VendorModel } from '../../../../app/vendor/models/vendor.model';
import { ProjectVendorModel } from '../../models/ProjectVendor.model';
import { NoteService } from '../../../shared/services/note.service';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { NoteModel } from '../../../shared/models/note.model';
import * as $ from 'jquery';
import { Paginator } from 'primeng/paginator';
import { GetPermission } from '../../../shared/permission/get-permission';
import { timeStamp } from 'console';

class Project {
  projectId: string;
  projectCode: string;
  projectName: string;
  projectCodeName: string;
}

interface Employee {
  EmployeeId: string;
  EmployeeName: string;
}

interface Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isDefault: boolean;
}


class NoteDocument {
  active: boolean;
  base64Url: string;
  createdById: string;
  createdDate: Date;
  documentName: string;
  documentSize: string;
  documentUrl: string;
  noteDocumentId: string;
  noteId: string;
  updatedById: string;
  updatedDate: Date;
}
class Note {
  active: boolean;
  createdById: string;
  createdDate: Date;
  description: string;
  noteDocList: Array<NoteDocument>;
  noteId: string;
  noteTitle: string;
  objectId: string;
  objectType: string;
  responsibleAvatar: string;
  responsibleName: string;
  type: string;
  updatedById: string;
  updatedDate: Date;
  constructor() {
    this.noteDocList = [];
  }
}


class provinceModel {
  provinceId: string;
  provinceName: string;
  provinceType: string;
  provinceCode: string;
}

class districtModel {
  districtId: string;
  districtName: string;
  districtType: string;
  districtCode: string;
  provinceId: string;
}

class wardModel {
  wardId: string;
  wardCode: string;
  wardType: string;
  wardName: string;
  districtId: string;
}
@Component({
  selector: 'app-project-resource',
  templateUrl: './project-resource.component.html',
  styleUrls: ['./project-resource.component.css'],
  providers: [
    DatePipe
  ]
})

export class ProjectResourceComponent implements OnInit {

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private noteService: NoteService,
    private getPermission: GetPermission,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute) {
  }

  listProjectTitle: Array<Project> = [];
  selectedProject: Project = null;

  loading: boolean = false;
  projectId: string = 'DCB9271B-E84D-4C56-8145-63C16653505B';
  selectedColumns: any[];
  selectedColumnsExternal: any[];
  cols: any[];
  isInternal: boolean = true;
  selectedItem: any;
  selectedItemExternal: any;
  listProjectResources: Array<ProjectResourceModel> = [];
  listProjectResourcesInternal: Array<ProjectResourceModel> = [];
  listProjectResourcesExternal: Array<ProjectResourceModel> = [];

  listProjectResourcesInternalShow: Array<ProjectResourceModel> = [];
  listProjectResourcesExternalShow: Array<ProjectResourceModel> = [];


  listNguonLucThueNgoai: Array<Employee> = [];
  listNguonLucNoiBo: Array<Employee> = [];

  project: ProjectModel = new ProjectModel();
  resourceProjectForm: FormGroup;
  inforVendorForm: FormGroup;
  selectProjectResourceId: string; // Chon nha thau tren grid
  projectVendorId: string;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  isShow: boolean = true;


  SelectNVNB = [];//list nh??n vi??n n???i b???
  SelectNVTN = [];//list nh??n vi??n thu?? ngo??i
  HienTaiNB = false;
  HienTaiTN = false;

  vendorNameControl: FormControl; // T??n nh?? th???u
  contactControl: FormControl; // Ng?????i li??n h???
  paymentMethodControl: FormControl;  //Ph????ng th???c thanh to??n
  listPaymentMethod: Array<Category> = []; //list Ph????ng th???c thanh to??n
  listContact: Array<ContactModel> = []; // Danh s??ch ng?????i li??n h???
  listContactById: Array<contactModel> = []; // Danh s??ch ng?????i li??n h???
  vendorModel: VendorModel = new VendorModel();
  contactPerson: contactModel = new contactModel();
  paymentId: string;
  isContractor: boolean = false;
  totalPercent: string = "0"; // Ti???n ????? d??? ??n
  totalEstimateTime: number = 0;
  listProjectTasks: Array<ProjectTaskModel> = [];

  listProvince: Array<provinceModel> = [];
  listDistrict: Array<districtModel> = [];
  listCurrentDistrict: Array<districtModel> = [];
  listWard: Array<wardModel> = [];
  listCurrentWard: Array<wardModel> = [];
  fullAddress: string = "";
  auth: any = JSON.parse(localStorage.getItem("auth"));
  userPermission: any = localStorage.getItem("UserPermission").split(',');
  selectVendor: any;
  selectProjectResource: any;
  isEdit: boolean = false;

  /*NOTE*/
  noteContent: string = '';
  noteId: string;
  listUpdateNoteDocument: Array<NoteDocument> = [];
  isEditNote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  noteHistory: Array<Note> = [];
  /*END*/
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  listNoteDocumentModel: Array<NoteDocumentModel> = [];

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.systemParameterList.find((systemParameter: { systemKey: string; }) => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  isSendEmailControl: FormControl;
  totalWorkdays: number = 0;
  //actionDelete: boolean = true;
  actionEditNote: boolean = true;
  // actionEdit: boolean = true;

  totalRecordsNote: number = 0;
  @ViewChild('paginator', { static: true }) paginator: Paginator;

  displayPhanBo: boolean = false;
  employeeCodeName: string = null;
  listPhanBoNguonLuc: Array<any> = [];
  tongPhanTramRanhRoi: number = 0;
  listPermissionResourceActive: string = localStorage.getItem("ListPermissionResource");

  ngOnInit() {
    this.loading = true;
    this.initForm();
    this.setTable();
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      // let resource = "pro/project/resource";
      // this.projectService.getPermission(this.projectId, this.auth.UserId).subscribe(response => {
      //   let result: any = response;
      //   if (result.statusCode == 200) {
      //     let permission: any = this.getPermission.getPermission(result.permissionStr, resource);
      //     if (permission.status == false) {
      //       this.router.navigate(['/home']);
      //     }
      //     else {
      //       let listCurrentActionResource = permission.listCurrentActionResource;
      //       if (listCurrentActionResource.indexOf("edit") == -1) {
      //         this.actionEdit = false;
      //       }
      //       if (listCurrentActionResource.indexOf("delete") == -1) {
      //         this.actionDelete = false;
      //       }
      //       if (listCurrentActionResource.indexOf("editnote") == -1) {
      //         this.actionEditNote = false;
      //       }
      //       this.getMasterData();
      //     }
      //   }
      // });

      this.getMasterData();
    });
  }

  initForm() {
    this.paymentMethodControl = new FormControl(null);
    this.contactControl = new FormControl(null);
    this.vendorNameControl = new FormControl(null);
    this.isSendEmailControl = new FormControl(false);

    this.resourceProjectForm = new FormGroup({
      isSendEmailControl: this.isSendEmailControl
    });
    this.inforVendorForm = new FormGroup({
      paymentMethodControl: this.paymentMethodControl,
      contactControl: this.contactControl,
      vendorNameControl: this.vendorNameControl,

    });
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.projectService.getProjectResource(this.projectId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.project = result.project;

      this.listProjectTitle = result.listProject;
      this.listProjectTitle.forEach(item => {
        item.projectCodeName = `[${item.projectCode}]: ${item.projectName}`;
      });
      this.selectedProject = this.listProjectTitle.find(c => c.projectId == this.projectId);

      this.listProjectResources = result.listProjectResource || [];
      this.listProjectResourcesInternal = this.listProjectResources.filter(x => x.resourceRoleName == "NB");
      this.listProjectResourcesExternal = this.listProjectResources.filter(x => x.resourceRoleName == "TN");

      //Danh s??ch n???i b??? v?? thu?? ngo??i ????? hi???n th???
      this.listProjectResourcesInternalShow = this.listProjectResourcesInternal;
      this.listProjectResourcesExternalShow = this.listProjectResourcesExternal;

      let nguonLucNoiBo = [];
      let nguonLucThueNgoai = [];

      this.listProjectResourcesInternal.forEach(x => {
        nguonLucNoiBo.push({ EmployeeId: x.objectId, EmployeeName: x.nameResource })
      });

      this.listProjectResourcesExternal.forEach(x => {
        nguonLucThueNgoai.push({ EmployeeId: x.objectId, EmployeeName: x.nameResource })
      });

      this.listNguonLucNoiBo = nguonLucNoiBo.filter((v, i, a) => a.indexOf(v) === i);
      this.listNguonLucThueNgoai = nguonLucThueNgoai.filter((v, i, a) => a.indexOf(v) === i);

      this.listPaymentMethod = result.listPaymentMethod; //list Ph????ng th???c thanh to??n
      this.listProjectTasks = result.listProjectTask;

      this.totalRecordsNote = result.totalRecordsNote;
      this.noteHistory = result.listNote;
      this.handleNoteContent();
      this.isSendEmailControl.setValue(true);
      this.totalPercent = this.project.taskComplate.toFixed(2);
      this.totalEstimateTime = this.project.estimateCompleteTime;
      this.totalWorkdays = 0;
      this.listProjectResourcesInternal.forEach(a => this.totalWorkdays += a.workDay);
      this.totalWorkdays = Number(this.totalWorkdays.toFixed(2));
      this.loading = false;
      this.inforVendorForm.markAsUntouched();
    } else {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  cancel() {
    this.confirmationService.confirm({
      message: 'B???n c?? mu???n l??u c??c thay ?????i?',
      accept: () => {
        // Chuy???n v??? th??ng tin d??? ??n
        this.router.navigate(['/project/detail', { 'projectId': this.projectId }]);
      }
    });
  }

  // Thay ?????i ng?????i li??n h???
  changeContact(event: any) {
    if (event.value) {
      var contactId = event.value.contactId;
      this.contactPerson = this.listContactById.filter(x => x.contactId == contactId)[0];
    }
    else
      this.contactPerson = new contactModel();
    this.inforVendorForm.markAsTouched();
  }

  changePayment() {
    this.inforVendorForm.markAsTouched();
  }

  // Xem chi ti???t Nh?? th???u
  async goToDetailExternalResource(projectResourceId: any): Promise<void> {
    // Check thay doi data
    if (!this.inforVendorForm.touched || !this.isContractor) {
      this.isEdit = false;
      this.isContractor = true;
      this.loading = true;
      this.selectProjectResourceId = projectResourceId;
      await this.reloadDataProjectResource(projectResourceId);
    }
    else {
      this.confirmationService.confirm({
        header: "X??c nh???n",
        message: 'B???n c?? mu???n l??u c??c thay ?????i?',
        accept: () => {
          this.selectProjectResourceId = projectResourceId;
          this.saveVendor();
        },
        reject: () => {
          this.isEdit = false;
          this.inforVendorForm.markAsUntouched();
          this.goToDetailExternalResource(projectResourceId);
        }
      });
    }
  }

  async reloadDataProjectResource(projectResourceId: any, isDelete: boolean = false) {
    if (isDelete) {
      this.resetDataExternalResource();
    }
    else {
      try {
        this.disableControls();
        this.selectProjectResource = this.listProjectResourcesExternal.filter(x => x.projectResourceId == projectResourceId)[0];
        this.vendorNameControl.setValue(this.selectProjectResource.nameResource);
        // Th??ng tin chi ti???t nh?? th???u vs th??ng tin thanh to??n - ng?????i li??n h???
        this.selectVendor = this.selectProjectResource.listProjectVendor.filter(x => x.projectResourceId == projectResourceId).length !== 0 ? this.selectProjectResource.listProjectVendor.filter(x => x.projectResourceId == projectResourceId) : [];

        // filter danh s??ch li??n h??? c???a nh?? th???u
        this.listContactById = this.listProjectResources.filter(x => x.resourceRoleName == "TN").find(x => x.objectId == this.selectProjectResource.objectId).listContact.filter(a => a.objectType == "VEN_CON");
        if (this.listContactById.length > 0) {
          // Kh??ng c?? trong b???ng projectVendor => L???y tr?????ng ?????u ti??n c???a danh s??ch ng?????i li??n h???
          if (this.selectProjectResource.listContact.filter(x => x.contactId == this.selectVendor[0].contactId).length == 0) {
            this.contactPerson = this.listContactById.filter(x => x.objectType == "VEN_CON") != null ? this.listContactById.filter(x => x.objectType == "VEN_CON")[0] : new contactModel();
            this.inforVendorForm.controls['contactControl'].setValue(this.contactPerson);
            this.inforVendorForm.controls['paymentMethodControl'].setValue(this.listPaymentMethod[0]);
          }
          else {
            let toSelectContact = this.listContactById.find(c => c.contactId === this.selectVendor[0].contactId && c.objectType == "VEN_CON");
            this.inforVendorForm.controls['contactControl'].setValue(toSelectContact);
            this.contactPerson = toSelectContact == undefined ? new contactModel() : toSelectContact;
          }
        }
        else {
          // Nh?? thau khong co lien he
          this.contactPerson = new contactModel();
          this.inforVendorForm.controls['contactControl'].setValue(null);
        }

        let toSelectPaymentMethod = this.listPaymentMethod.find(c => c.categoryId === this.selectVendor[0].paymentMethodId);
        this.inforVendorForm.controls['paymentMethodControl'].setValue(toSelectPaymentMethod);

        var vendorModel = this.listProjectResources.filter(x => x.resourceRoleName == "TN").find(x => x.objectId == this.selectProjectResource.objectId).listContact.filter(a =>
          a.objectType == "VEN" &&
          a.objectId == this.selectProjectResource.objectId)[0];

        this.vendorModel = vendorModel == undefined || vendorModel == null ? new VendorModel() : vendorModel;
        if (vendorModel == undefined) {
          this.fullAddress = '';
        }
        else
          this.fullAddress = this.fullAddressBuilder(vendorModel.address, vendorModel.provinceId, vendorModel.districtId, vendorModel.wardId);

      } catch (error) {
        this.loading = false;
      }
      this.loading = false;
    }
  }
  editVendor() {
    this.isEdit = true;
    this.enableControls();
  }
  // disable control H???ng m???c
  disableControls() {
    this.inforVendorForm.get('vendorNameControl').disable();
    this.inforVendorForm.get('contactControl').disable();
    this.inforVendorForm.get('paymentMethodControl').disable();
  }
  // enable control H???ng m???c
  enableControls() {
    this.inforVendorForm.get('paymentMethodControl').enable();
    this.inforVendorForm.get('contactControl').enable();
  }

  fullAddressBuilder(address, provinceId, districtId, wardId): string {
    let arr: Array<string> = [];
    if (address) arr = [...arr, address];
    let _ward = this.listWard.find(e => e.wardId == wardId);
    if (_ward) arr = [...arr, `${_ward.wardType} ${_ward.wardName}`];
    let _district = this.listDistrict.find(e => e.districtId == districtId);
    if (_district) arr = [...arr, `${_district.districtType} ${_district.districtName}`];
    let _province = this.listProvince.find(e => e.provinceId == provinceId);
    if (_province) arr = [...arr, `${_province.provinceType} ${_province.provinceName}`];
    return arr.join(', ');
  }


  setTable() {

    // B???ng tab N???i b???
    this.selectedColumns = [
      { field: 'stt', header: 'STT', width: '5%', textAlign: 'center', color: '#f44336' },
      { field: 'resourceTypeName', header: 'Lo???i ngu???n l???c', width: '10%', textAlign: 'left', color: '#f44336' },
      { field: 'nameResource', header: 'T??n ngu???n l???c', width: '25%', textAlign: 'left', color: '#f44336' },
      { field: 'employeeRoleName', header: 'Vai tr??', width: '10%', textAlign: 'left', color: '#f44336' },
      { field: 'startTime', header: 'B???t ?????u', width: '10%', textAlign: 'right', color: '#f44336' },
      { field: 'endTime', header: 'K???t th??c', width: '10%', textAlign: 'right', color: '#f44336' },
      { field: 'allowcation', header: '% Ph??n b???', width: '10%', textAlign: 'center', color: '#f44336' },
      { field: 'workDay', header: 'S??? ng??y ph??n b???', width: '10%', textAlign: 'right', color: '#f44336' }
    ];

    // Tab b???ng thu?? ngo??i
    this.selectedColumnsExternal = [
      { field: 'resourceTypeName', header: 'Nh??m nh?? th???u', width: '20%', textAlign: 'left', color: '#f44336' },
      { field: 'startTime', header: 'B???t ?????u', width: '10%', textAlign: 'right', color: '#f44336' },
      { field: 'endTime', header: 'K???t th??c', width: '10%', textAlign: 'right', color: '#f44336' },
      { field: 'allowcation', header: '% Ph??n b???', width: '10%', textAlign: 'center', color: '#f44336' },
      { field: 'workDay', header: 'S??? ng??y ph??n b???', width: '10%', textAlign: 'right', color: '#f44336' },
    ];

    //Ph??n b??? ngu???n l???c c??c d??? ??n
    this.cols = [
      { field: 'stt', header: 'STT', width: '10%', textAlign: 'center' },
      { field: 'projectName', header: 'T??n d??? ??n', width: '60%', textAlign: 'left' },
      { field: 'phanTram', header: '% Ph??n b???', width: '30%', textAlign: 'right' },
    ];
  }

  // Th??m m???i ngu???n l???c
  async addProjectResource(isInternal: any) {

    let ref = this.dialogService.open(AddProjectResourceDialogComponent, {
      data: {
        projectId: this.projectId,
        isInternal: isInternal,
        projectStartDate: this.project.projectStartDate,
        projectEndDate: this.project.projectEndDate
      },
      header: isInternal ? 'Th??m ngu???n l???c n???i b???' : 'Th??m ngu???n l???c thu?? ngo??i',
      width: isInternal ? '70%' : '60%',
      baseZIndex: 999,
      contentStyle: {
        "min-height": "440px",
        "max-height": "1000px",
        "overflow-x": "hidden",
        "overflow": "true",
        "overflow-y": "auto"
      }
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result) {
        if (result.status === true) {
          await this.getMasterData();

          // Lua chon luon nguon luc moi them
          this.goToDetailExternalResource(result.projectResourceId);
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Th??m m???i ngu???n l???c th??nh c??ng' };
          this.showMessage(msg);
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
        this.loading = false;
      }
    });
  }

  // C???p nh???p th??ng tin nh?? th???u
  async saveVendor(): Promise<void> {

    if (this.inforVendorForm.touched) {
      let vendorModel = new ProjectVendorModel();
      vendorModel.paymentMethodId = this.inforVendorForm.get('paymentMethodControl').value.categoryId;
      vendorModel.contactId = this.inforVendorForm.get('contactControl').value !== undefined &&
        this.inforVendorForm.get('contactControl').value !== null ? this.inforVendorForm.get('contactControl').value.contactId : this.emptyGuid;
      vendorModel.projectId = this.projectId;
      vendorModel.vendorId = this.selectVendor[0].vendorId;
      if (this.selectVendor.length == 0) {
        vendorModel.projectVendorId = this.emptyGuid;
      }
      else {
        vendorModel.projectVendorId = this.selectVendor[0].projectVendorId;
      }

      let result: any = await this.projectService.updateProjectVendorResource(vendorModel, this.auth.UserId);

      if (result.statusCode === 202 || result.statusCode === 200) {
        await this.getMasterData();
        this.inforVendorForm.markAsUntouched();
        this.goToDetailExternalResource(this.selectProjectResourceId);
        this.isEdit = false;
        this.clearToast();
        this.showToast('success', 'Th??ng b??o', 'C???p nh???t th??ng tin nh?? th???u th??nh c??ng');
        this.loading = false;
      }

    }

  }

  /* S???a ngu???n l???c */
  showEditProjectResourceDialog(rowData: any, isInternal: any) {

    let ref = this.dialogService.open(AddProjectResourceDialogComponent, {
      data: {
        projectId: this.projectId,
        isInternal: isInternal,
        projectResourceId: rowData.projectResourceId,
        projectStartDate: this.project.projectStartDate,
        projectEndDate: this.project.projectEndDate
      },
      header: 'Th??ng tin ngu???n l???c',
      width: '60%',
      baseZIndex: 999,
      contentStyle: {
        "min-height": "350px",
        "max-height": "1000px",
        "overflow-x": "hidden",
        "overflow": "true",
        "overflow-y": "auto"
      }
    });

    ref.onClose.subscribe(async (result: any) => {
      if (result) {
        if (result.status === true) {
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???p ngu???n l???c th??nh c??ng' };
          this.showMessage(msg);
          await this.getMasterData();
          this.inforVendorForm.markAsUntouched();
          this.goToDetailExternalResource(this.selectProjectResourceId);
        }
        else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
        this.loading = false;
      }
    });
  }
  async editProjectResource(rowData: any, isInternal: any) {

    if (this.inforVendorForm.touched) {
      this.confirmationService.confirm({
        header: "X??c nh???n",
        message: 'B???n c?? mu???n l??u c??c thay ?????i?',
        accept: async () => {
          await this.saveVendor();
          this.showEditProjectResourceDialog(rowData, isInternal);
        },
        reject: () => {
          this.isEdit = false;
          this.inforVendorForm.markAsUntouched();
          this.goToDetailExternalResource(rowData.projectResourceId);
          this.showEditProjectResourceDialog(rowData, isInternal);
        }
      });
    }
    else
      this.showEditProjectResourceDialog(rowData, isInternal);

  }

  /* X??a ngu???n l???c */
  delete_ProjectResource(rowData: any) {
    this.confirmationService.confirm({
      header: "X??c nh???n",
      message: 'B???n c?? ch???c mu???n x??a?',
      accept: () => {
        this.deleteResource(rowData.projectResourceId);
      }
    })
  }

  async deleteResource(projectResourceId: any) {
    this.loading = true;
    await this.projectService.deleteProjectResource(projectResourceId).subscribe(async response => {
      let result = <any>response;
      if (result.statusCode === 200 || result.statusCode === 202) {
        await this.getMasterData();
        this.isEdit = false;
        this.inforVendorForm.markAsUntouched();
        this.changeDetectorRef.detectChanges();
        this.isContractor = false;
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a ngu???n l???c th??nh c??ng!' };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
      this.loading = false;
    });
  }
  /* end*/

  resetDataExternalResource() {
    this.vendorNameControl.setValue(null);
    this.contactControl.setValue(null);
    this.paymentMethodControl.setValue(null);
    this.listContactById = []
    this.paymentId = null;
    this.vendorModel = new VendorModel();
    this.fullAddress = "";
    this.contactPerson = new contactModel();
  }

  onRowSelect(dataRow) {
  }
  showMessage(msg: any) {
    this.messageService.add(msg);
  }
  clearToast() {
    this.messageService.clear();
  }
  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }



  /*Event thay ?????i n???i dung ghi ch??*/
  currentTextChange: string = '';
  changeNoteContent(event) {
    let htmlValue = event.htmlValue;
    this.currentTextChange = event.textValue;
  }

  /*X??? l?? v?? hi???n th??? l???i n???i dung ghi ch??*/
  handleNoteContent() {

    this.noteHistory.forEach(element => {
      setTimeout(() => {
        let count = 0;
        if (element.description == null) {
          element.description = "";
        }

        let des = $.parseHTML(element.description);
        let newTextContent = '';
        for (let i = 0; i < des.length; i++) {
          count += des[i].textContent.length;
          newTextContent += des[i].textContent;
        }

        if (count > 250) {
          newTextContent = newTextContent.substr(0, 250) + '<b>...</b>';
          $('#' + element.noteId).find('.short-content').append($.parseHTML(newTextContent));
        } else {
          $('#' + element.noteId).find('.short-content').append($.parseHTML(element.description));
        }

        $('#' + element.noteId).find('.full-content').append($.parseHTML(element.description));
      }, 1000);
    });
  }
  /*End*/

  /*Event S????a ghi chu??*/
  onClickEditNote(noteId: string, noteDes: string) {
    this.noteContent = noteDes;
    this.noteId = noteId;
    this.listUpdateNoteDocument = [];//this.noteHistory.find(x => x.noteId == this.noteId).noteDocList;
    this.isEditNote = true;
  }
  /*End*/

  /*Event X??a ghi ch??*/
  onClickDeleteNote(noteId: string) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a ghi ch?? n??y?',
      accept: () => {
        this.loading = true;
        this.noteService.disableNote(noteId).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            let note = this.noteHistory.find(x => x.noteId == noteId);
            let index = this.noteHistory.lastIndexOf(note);
            this.noteHistory.splice(index, 1);
            this.clearToast();
            this.showToast('success', 'Th??ng b??o', 'X??a ghi ch?? th??nh c??ng');
          } else {
            this.clearToast();
            this.showToast('error', 'Th??ng b??o', result.messageCode);
          }
        });
      }
    });
  }
  /*End*/

  /*Ki???m tra noteText > 250 k?? t??? ho???c noteDocument > 3 th?? ???n ??i m???t ph???n n???i dung*/
  tooLong(note): boolean {
    if (note.noteDocList.length > 3) return true;
    var des = $.parseHTML(note.description);
    var count = 0;
    for (var i = 0; i < des.length; i++) {
      count += des[i].textContent.length;
      if (count > 250) return true;
    }
    return false;
  }

  /*Event M??? r???ng/Thu g???n n???i dung c???a ghi ch??*/
  toggle_note_label: string = 'M??? r???ng';
  trigger_node(nodeid: string, event) {
    // noteContent
    let shortcontent_ = $('#' + nodeid).find('.short-content');
    let fullcontent_ = $('#' + nodeid).find('.full-content');
    if (shortcontent_.css("display") === "none") {
      fullcontent_.css("display", "none");
      shortcontent_.css("display", "block");
    } else {
      fullcontent_.css("display", "block");
      shortcontent_.css("display", "none");
    }

    let curr = $(event.target);

    if (curr.attr('class').indexOf('pi-chevron-right') != -1) {
      this.toggle_note_label = 'Thu g???n';
      curr.removeClass('pi-chevron-right');
      curr.addClass('pi-chevron-down');
    } else {
      this.toggle_note_label = 'M??? r???ng';
      curr.removeClass('pi-chevron-down');
      curr.addClass('pi-chevron-right');
    }
  }
  /*End */

  /*H???y s???a ghi ch??*/
  cancelNote() {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n h???y ghi ch?? n??y?',
      accept: () => {
        this.noteId = null;
        this.noteContent = null;
        this.uploadedFiles = [];
        // if (this.fileUpload) {
        //   this.fileUpload.clear();  //X??a to??n b??? file trong control
        // }
        this.listUpdateNoteDocument = [];
        this.isEditNote = false;
      }
    });
  }

  /*L??u file v?? ghi ch?? v??o Db*/
  async saveNote() {

    this.loading = true;
    this.listNoteDocumentModel = [];
    let noteModel = new NoteModel();
    if (!this.noteId) {
      /*T???o m???i ghi ch??*/
      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'NEW';
      noteModel.ObjectId = this.projectId;
      noteModel.ObjectType = 'PRORESOURCE';
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi ch??*/
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'EDT';
      noteModel.ObjectId = this.projectId;
      noteModel.ObjectType = 'PRORESOURCE';
      noteModel.NoteTitle = '???? s???a ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    }
    this.noteService.createNoteForProjectResource(noteModel).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedFiles = [];
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;
        this.paginator.changePage(0);
        this.clearToast();
        this.showToast('success', 'Th??ng b??o', "L??u ghi ch?? th??nh c??ng!");
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', result.messageCode);
      }
    });
  }

  async createNoteAfterEdit(type: string, noteTitle: string, noteBody: string) {
    let noteModel = new NoteModel();
    noteModel.NoteId = this.emptyGuid;
    noteModel.Description = noteBody;
    noteModel.Type = 'ADD';
    noteModel.ObjectId = this.projectId;
    noteModel.ObjectType = 'PRORESOURCE';
    noteModel.NoteTitle = noteTitle;
    noteModel.Active = true;
    noteModel.CreatedById = this.emptyGuid;
    noteModel.CreatedDate = new Date();
    this.noteService.createNoteForProjectResource(noteModel).subscribe(response => {
      let result: any = response;
      if (result.statusCode == 200) {
        this.uploadedFiles = [];
        // if (this.fileUpload) {
        //   this.fileUpload.clear();  //X??a to??n b??? file trong control
        // }
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;
        /*Reshow Time Line */

        this.noteHistory = result.listNote;
        this.handleNoteContent();
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', result.messageCode);
      }
    });
  }

  showProjectInfor() {
    this.isShow = !this.isShow;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  async paginate(event) {
    //event.first = Index of the first record
    //event.rows = Number of rows to display in new page
    //event.page = Index of the new page
    //event.pageCount = Total number of pages

    let result: any = await this.projectService.pagingProjectNote(this.projectId, event.rows, event.page, "PRORESOURCE");
    if (result.statusCode == 200) {
      this.noteHistory = result.noteEntityList;
      this.totalRecordsNote = result.totalRecordsNote
      await this.handleNoteContent();
    }
  }

  onChangeProject(projectId: string) {
    this.router.navigate(['/project/resource', { 'projectId': projectId }]);
  }

  async getPhanBoNguonLuc(data: any) {
    let result: any = await this.projectService.getPhanBoTheoNguonLuc(data.objectId);
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
      this.showMessage(msg);
      return;
    }

    this.employeeCodeName = result.employeeCodeName;
    this.listPhanBoNguonLuc = result.listPhanBoNguonLuc;
    this.tongPhanTramRanhRoi = 100 - this.listPhanBoNguonLuc.map(x => x.phanTram).reduce((a, b) => a + b, 0);
    this.displayPhanBo = true;
  }


  ChangeThoiGian(event, type) {

    var toDay = new Date();
    if (type == "NB") {
      this.HienTaiNB = event.checked;
      if (event.checked) {
        this.listProjectResourcesInternalShow = this.listProjectResourcesInternal.filter(x => new Date(x.endTime) >= toDay);
      } else {
        this.listProjectResourcesInternalShow = this.listProjectResourcesInternal;
      }
      if (this.SelectNVNB.length > 0) this.listProjectResourcesInternalShow = this.listProjectResourcesInternalShow.filter(x => this.SelectNVNB.includes(x.objectId));
      this.tinhWorDay(this.listProjectResourcesInternalShow);
    } else {
      this.HienTaiTN = event.checked;
      if (event.checked) {
        this.listProjectResourcesExternalShow = this.listProjectResourcesExternal.filter(x => new Date(x.endTime) >= toDay);
      } else {
        this.listProjectResourcesExternalShow = this.listProjectResourcesExternal;
      }
      if (this.SelectNVTN.length > 0) this.listProjectResourcesExternalShow = this.listProjectResourcesExternalShow.filter(x => this.SelectNVTN.includes(x.objectId));
      this.tinhWorDay(this.listProjectResourcesExternalShow);
    }
  }
  changeSelectNV(event, type) {
    var toDay = new Date();
    //L???y list employeeId
    let listEmpId = event.value.map(x => x.EmployeeId);
    if (type == "NB") {
      this.SelectNVNB = listEmpId;//list nh??n vi??n n???i b???
      if (listEmpId.length > 0) {
        this.listProjectResourcesInternalShow = this.listProjectResourcesInternal.filter(x => listEmpId.includes(x.objectId));
      } else {
        this.listProjectResourcesInternalShow = this.listProjectResourcesInternal;
      }
      if (this.HienTaiNB) this.listProjectResourcesInternalShow = this.listProjectResourcesInternalShow.filter(x => new Date(x.endTime) >= toDay);
      this.tinhWorDay(this.listProjectResourcesInternalShow);
    } else {
      this.SelectNVTN = listEmpId;//list nh??n vi??n thu?? ngo??i
      if (listEmpId.length > 0) {
        this.listProjectResourcesExternalShow = this.listProjectResourcesExternal.filter(x => listEmpId.includes(x.objectId));
      } else {
        this.listProjectResourcesExternalShow = this.listProjectResourcesExternal;
      }

      if (this.HienTaiTN) this.listProjectResourcesExternalShow = this.listProjectResourcesExternalShow.filter(x => new Date(x.endTime) >= toDay);
      this.tinhWorDay(this.listProjectResourcesExternalShow);
    }
  }

  tinhWorDay(list) {
    this.totalWorkdays = 0;
    list.forEach(a => this.totalWorkdays += a.workDay);
    this.totalWorkdays = Number(this.totalWorkdays.toFixed(2));
  }
}
