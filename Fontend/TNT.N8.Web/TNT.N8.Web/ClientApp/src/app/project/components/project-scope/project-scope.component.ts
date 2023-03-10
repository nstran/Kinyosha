import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { MessageService, TreeNode, ConfirmationService } from 'primeng/api';
import { ProjectModel } from '../../models/project.model';
import { DatePipe } from '@angular/common';
import { ProjectScopeModel } from '../../models/ProjectScope.model';
import { ProjectTaskModel } from '../../models/ProjectTask.model';
import { AddProjectScopeDialogComponent } from '../add-project-scope-dialog/add-project-scope-dialog.component';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { ProjectResourceModel } from '../../models/ProjectResource.model';
import { MenuItem } from 'primeng/api';
import { AddTaskScopeDialogComponent } from '../add-task-scope-dialog/add-task-scope-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NoteService } from '../../../shared/services/note.service';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { NoteModel } from '../../../shared/models/note.model';
import { FileUpload, Table } from 'primeng';
import * as $ from 'jquery';
import { Paginator } from 'primeng/paginator';
import { GetPermission } from '../../../shared/permission/get-permission';
import { async } from 'q';

class Project {
  projectId: string;
  projectCode: string;
  projectName: string;
  projectCodeName: string;
  projectStatusPlan: boolean;
}


class Category {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
}

class PhanTram {
  label: string;
  value: number;
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
  categoryTypeName: string;
  listEmployee: Array<string>;
}

class Employee {
  public employeeId: string;
  public employeeName: string;
  public employeeCode: string;
  public active: boolean
}

class ProjectScopeFillter {
  public projectSopeId: string;
  public projectScopeName: string;
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
@Component({
  selector: 'app-project-scope',
  templateUrl: './project-scope.component.html',
  styleUrls: ['./project-scope.component.css'],
  providers: [
    DatePipe
  ]
})

export class ProjectScopeComponent implements OnInit {
  constructor(
    private projectService: ProjectService,
    public ref: DynamicDialogRef,
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private imageService: ImageUploadService,
    private getPermission: GetPermission,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) {
    this.innerWidth = window.innerWidth;
  }
  @ViewChild('fileUpload') fileUpload: FileUpload;
  @ViewChild('fileUploadNote') fileUploadNote: FileUpload;
  listResourceType: Array<CategoryModel> = [];
  loading: boolean = false;
  project: ProjectModel = new ProjectModel();
  isShow: boolean = true;
  data: TreeNode[];
  dataCopy: TreeNode[];
  selectedColumns: any[];
  selectedNode: TreeNode;
  projectId: string = '8A765839-5692-4CEB-9EEF-912FEE254A41';
  listProjectScopes: Array<ProjectScopeModel> = [];
  listProjectTasks: Array<ProjectTaskModel> = [];
  listProjectTasksDefault: Array<ProjectTaskModel> = [];
  listEmployee: Array<ProjectTaskModel> = [];

  selectedScope: any;
  selectedScopeName: string;
  selectedScopeCode: string;
  selectedScopeId: string;
  scopeDescription: string;
  /*Get Current EmployeeId*/
  auth = JSON.parse(localStorage.getItem('auth'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  /*End*/

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionDelete: boolean = true;
  actionEdit: boolean = true;
  actionDeleteScope: boolean = false;
  actionEditScope: boolean = false;
  actionEditNote: boolean = true;
  actionCopyScope: boolean = true;
  /*End*/
  totalPercent: string = "0"; // Ti???n ????? d??? ??n
  listAction: MenuItem[]; // Them hang muc hay workpackage
  listVendor: Array<any> = []; // Nha thau
  parentName: string;// Tr???c thu???c h???ng m???c
  listStatus: Array<CategoryModel> = [];
  listResourceScope: Array<any> = [];
  isEdit: boolean = false;
  totalEstimateTime: number = 0;

  /* Search value */
  listWorkpackage: Array<ProjectScopeFillter> = [];
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  selectedStatus: Array<Category> = [];
  selectedWorkpackage: Array<ProjectScopeFillter> = [];
  selectedPic: Array<Employee> = [];
  startFromDate: Date = null;
  startToDate: Date = null;
  endToDate: Date = null;
  endFromDate: Date = null;
  fromPercent: number = 0;
  toPercent: number = 0;

  /* FORM CONTROL */
  createTaskScopeForm: FormGroup;
  descriptionControl: FormControl;
  scopeProjectForm: FormGroup;
  projectScopeForm: FormGroup;
  projectScopeDescriptionControl: FormControl;
  projectScopeNameControl: FormControl;
  resourceTypeControl: FormControl;
  /*END: FORM CONTROL*/
  cloneProjectScope: FormGroup;
  projectControl: FormControl;
  oldProjectId: string = null;
  newProjectId: string = null;
  listProject: Array<any> = [];
  displayCopyScope: boolean = false;

  listProjectTitle: Array<Project> = [];
  selectedProject: Project = null;
  isApproveProject: boolean = false;

  /*START: BI???N L??U GI?? TR??? TR??? V???*/
  listResource: Array<ProjectResourceModel> = [];
  projectScope: ProjectScopeModel = null;
  //START: BI???N ??I???U KI???N
  fixed: boolean = false;
  //END : BI???N ??I???U KI???N
  leftColNumber: number = 12;
  rightColNumber: number = 0;
  lstNode: Array<any> = []; // C??y h???ng m???c ??? dialog
  isOpenNotifiError: boolean = false;
  isInvalidForm: boolean = false;
  isDelete: boolean = false;
  noteHistory: Array<Note> = [];

  /*NOTE*/
  noteContent: string = '';
  noteId: string;
  listUpdateNoteDocument: Array<NoteDocument> = [];
  isEditNote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  /*END*/
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  listNoteDocumentModel: Array<NoteDocumentModel> = [];

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.systemParameterList.find((systemParameter: { systemKey: string; }) => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  isSendEmailControl: FormControl;
  levelScope: number = 0;
  totalRecordsNote: number = 0;
  @ViewChild('paginator', { static: true }) paginator: Paginator

  tools: object = {
    type: 'Expand',
    items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', 'OrderedList', 'UnorderedList',
      'Outdent', 'Indent', '|',
      'CreateLink']
  };

  isReadonly: boolean = true;
  thoiGianUocLuong: number = 0;

  async ngOnInit() {
    this.initForm();
    this.setForm();
    this.setTable();
    this.route.params.subscribe(async params => {
      let resource = "pro/project/scope";
      this.projectId = params['projectId'];
      this.projectService.getPermission(this.projectId, this.auth.UserId).subscribe(async response => {
        let result: any = response;
        if (result.statusCode == 200) {
          let permission: any = this.getPermission.getPermissionLocal(result.permissionStr, resource);
          if (permission.status == false) {
            this.router.navigate(['/home']);
          }
          else {
            let listCurrentActionResource = permission.listCurrentActionResource;
            if (listCurrentActionResource.indexOf("editnote") == -1) {
              this.actionEditNote = false;
            }
            if (listCurrentActionResource.indexOf("copyscope") == -1) {
              this.actionCopyScope = false;
            }

            await this.getMasterData();
          }
        }
      });
    });
  }

  // l???y th??ng tin g??i c??ng vi???c tr???c thu???c
  async getListWorkPackage(): Promise<void> {
    // G??i c??ng vi???c tr???c thu???c
    if (this.listProjectScopes.length > 0)
      this.listProjectScopes.forEach(item => {
        var obj = new ProjectScopeFillter();
        obj.projectSopeId = item.projectScopeId;
        obj.projectScopeName = item.projectScopeName;
        this.listWorkpackage.push(obj);
      });
  }

  // L???y d??? li???u form
  async getMasterData() {
    this.loading = true;
    let result: any = await this.projectService.getProjectScope(this.projectId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.project = result.project;

      this.listProjectScopes = result.listProjectScope || [];
      this.listProjectTasks = result.listProjectTask || [];
      this.listProjectTasksDefault = result.listProjectTask || [];
      this.listResourceType = result.listResource || [];
      this.listStatus = result.listStatus || [];
      this.listVendor = result.listVendor;

      this.listProjectTitle = result.listProject;
      this.listProjectTitle.forEach(item => {
        item.projectCodeName = `[${item.projectCode}]: ${item.projectName}`;
      });
      this.selectedProject = this.listProjectTitle.find(c => c.projectId == this.projectId);
      this.isApproveProject = this.selectedProject.projectStatusPlan;

      this.handleEmployeeContent();
      this.isSendEmailControl.setValue(true);
      // Ti???n ????? d??? ??n
      this.totalPercent = this.project.taskComplate.toFixed(2);
      this.totalEstimateTime = this.project.estimateCompleteTime;

      this.totalRecordsNote = result.totalRecordsNote;
      this.noteHistory = result.listNote;
      this.data = this.list_to_tree();
      this.handleNoteContent();
      this.isDelete = false;
      this.isEdit = false;
      this.loading = false;
    } else {
      this.loading = false;
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  initForm() {
    this.projectScopeNameControl = new FormControl(null, [Validators.required]);
    this.projectScopeDescriptionControl = new FormControl;
    this.resourceTypeControl = new FormControl(null, [Validators.required]);
    this.descriptionControl = new FormControl('');
    this.isSendEmailControl = new FormControl(false);

    this.projectScopeForm = new FormGroup({
      isSendEmailControl: this.isSendEmailControl
    });

    this.scopeProjectForm = new FormGroup({
      resourceTypeControl: this.resourceTypeControl,
      projectScopeNameControl: this.projectScopeNameControl,
      projectScopeDescriptionControl: this.projectScopeDescriptionControl,
    });
    this.disableControls();

    this.projectControl = new FormControl(null);
    this.cloneProjectScope = new FormGroup({
      projectControl: this.projectControl,

    });
  }

  // HI???n th??? dialog b??? l???c cho tab danh s??ch c??ng vi???c
  async showFilter() {
    // if (this.innerWidth < 1024) {
    //   this.isShowFilterTop = !this.isShowFilterTop;
    // } else {
    await this.getListWorkPackage().then(res => {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 9;
        this.rightColNumber = 3;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
    );
    //}
  }
  // Thi???t l???p form
  setForm(type: any = 0) {
    this.listAction = [];
    let optionTask = {
      label: 'C??ng vi???c', icon: 'pi pi-tasks', command: () => {
        this.add_Task();
      }
    };
    let optionWorkpackage = {
      label: 'G??i c??ng vi???c', icon: 'pi pi-project-diagram', command: () => {
        this.addProjectScope();
      }
    };

    if (type == 0) {
      this.listAction.push(optionTask);
      this.listAction.push(optionWorkpackage);
    }
    else {
      // Kh??ng ph???i l?? node cu???i
      this.listAction.push(optionWorkpackage);
    }
  }

  setTable() {
    this.selectedColumns = [
      { field: 'taskName', header: 'T??n c??ng vi???c', width: '20%', textAlign: 'left', color: '#f44336' },
      { field: 'projectScopeName', header: 'G??i c??ng vi???c tr???c thu???c', width: '13%', textAlign: 'left', color: '#f44336' },
      { field: 'employee', header: 'Ng?????i ph??? tr??ch', width: '24%', textAlign: 'left', color: '#f44336' },
      { field: 'statusName', header: 'Tr???ng th??i', width: '13%', textAlign: 'center', color: '#f44336' },
      { field: 'taskComplate', header: '% ho??n th??nh', width: '5%', textAlign: 'center', color: '#f44336' },
      { field: 'planStartTime', header: 'Ng??y b???t ?????u', width: '10%', textAlign: 'center', color: '#f44336' },
      { field: 'planEndTime', header: 'Ng??y k???t th??c', width: '10%', textAlign: 'center', color: '#f44336' }
    ];
  }

  // Build c??y h???ng m???c c??ng vi???c
  list_to_tree(projectId: string = null) {
    let list: Array<TreeNode> = [];
    var map = {}, node, roots = [], i;
    if (this.listProjectScopes !== null && this.listProjectScopes.length > 0) {
      this.listProjectScopes.filter(x => projectId !== null ? x.projectId == projectId : true).forEach(item => {

        let node: TreeNode = {
          label: item.projectScopeCode == null || item.projectScopeCode == "" ? item.projectScopeName : (item.projectScopeCode + '. ' + item.projectScopeName),
          expanded: true,
          data: {
            'projectScopeId': item.projectScopeId,
            'parentId': item.parentId,
            'projectScopeName': item.projectScopeName,
            'description': item.description,
            'projectId': item.projectId,
            'projectScopeCode': item.projectScopeCode,
            'ischange': false,
            'resourceType': item.resourceType,
            'level': item.level,
            'colorScope': item.styleClass
          },
          styleClass: item.styleClass,
          children: []
        };

        list = [...list, node];
      });
      for (i = 0; i < list.length; i += 1) {
        map[list[i].data.projectScopeId] = i; // initialize the map
        list[i].children = []; // initialize the children
      }

      for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.data.parentId !== undefined && node.data.parentId !== null) {
          // if you have dangling branches check that map[node.parentId] exists
          list[map[node.data.parentId]].children.push(node);
        } else {

          roots.push(node);
        }
      }
      return roots;
    }
  }

  // ????? quy l???y danh s??ch c??ng vi???c thu???c node cha v?? c??c node con
  recursiveNodeScope = (data) => {
    this.lstNode.push(data.data.projectScopeId);
    if (data.children != null) {
      data.children.forEach(chil => {
        this.recursiveNodeScope(chil);
      });
    }

  }

  // X??a c??ng vi???c
  delete_Task(rowData: any) {


    if (rowData.statusName !== "M???i") {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', 'Ch??? ???????c x??a c??ng vi???c ??? tr???ng th??i M???i');
    }
    else {
      this.confirmationService.confirm({
        header: "X??c nh???n",
        message: 'B???n c?? ch???c mu???n x??a?',
        accept: () => {
          this.deleteTask(rowData.taskId);
        }
      })
    }
  }

  async deleteTask(taskId: any) {
    this.loading = true;
    await this.projectService.deleteTask(taskId).subscribe(async response => {
      let result = <any>response;

      this.loading = false;
      if (result.statusCode === 200 || result.statusCode === 202) {
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a c??ng vi???c th??nh c??ng!' };
        this.showMessage(msg);
        await this.reloadProjectTask();
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
      this.loading = false;
    });
  }

  // Th??m m???i c??ng vi???c
  add_Task() {
    let width = '';
    if (window.innerWidth < 500) {
      width = '100%';
    } else {
      width = '80%';
    }
    // N???u kh??ng ch???n node n??o th?? m???c ?????nh node ?????u ti??n
    let ref = this.dialogService.open(AddTaskScopeDialogComponent, {
      data: {
        projectId: this.projectId,
        projectScope: this.selectedScope == null || this.selectedScope == undefined ? this.data[0] : this.selectedScope
      },
      header: 'Th??m c??ng vi???c',
      width: width,
      height: '100%',
      baseZIndex: 1030,
      contentStyle: {
        "overflow-x": "hidden",
        "min-height": "300px",
        "max-height": "800px",
        "overflow": "true",
        "overflow-y": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {
      if (result) {
        if (result.status === true) {
          this.isDelete = false;
          this.ref.close();
          await this.reloadProjectTask();
        }
      }
    });
  }

  async reloadProjectTask() {
    let result: any = await this.projectService.getProjectScope(this.projectId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listProjectTasks = result.listProjectTask || [];
      this.listProjectTasksDefault = result.listProjectTask || [];
      if (this.listProjectTasksDefault.length > 0) {
        if (this.lstNode.length > 0) {
          // Danh s??ch c??ng vi???c thu???c g??i node v?? con c???a node
          this.listProjectTasks = this.listProjectTasksDefault.filter(x => this.lstNode.find(a => a == x.projectScopeId));
        }
      }
      this.handleEmployeeContent();
      this.noteHistory = result.listNote;
      this.handleNoteContent();
      this.totalPercent = result.project.taskComplate.toFixed(2);
      this.totalEstimateTime = result.project.estimateCompleteTime;
      this.listProjectScopes = result.listProjectScope || [];
      this.data = this.list_to_tree();
      this.loading = false;
    }
  }

  // Ch???nh s???a c??ng vi???c
  edit_Task(rowData: any) {
    let ref = this.dialogService.open(AddTaskScopeDialogComponent, {
      data: {
        taskId: rowData.taskId,
        projectId: this.projectId,
        projectScope: this.listProjectScopes.filter(x => x.projectScopeId == rowData.projectScopeId)[0]
      },
      header: 'Ch???nh s???a c??ng vi???c',
      width: '80%',
      height: '100%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "300px",
        "max-height": "800px",
        "overflow-x": "hidden",
        "overflow": "true",
        "overflow-y": "auto"
      }
    });
    ref.onClose.subscribe(async (result: any) => {
      if (result) {
        if (result.status === true) {
          this.ref.close();
          await this.reloadProjectTask();
        }
      }
    });
  }

  //#region  Thao t??c cho h???ng m???c

  // X??a h???ng m???c
  delete_projectResource() {
    this.confirmationService.confirm({
      header: "X??c nh???n",
      message: 'B???n c?? ch???c ch???n mu???n x??a h???ng m???c d??? ??n n??y?',
      accept: () => {
        this.deleteProjectScope();
      }
    })
  }


  deleteProjectScope() {
    this.projectService.deleteProjectScope(this.selectedNode.data.projectScopeId, this.projectId, this.data[0].data.projectScopeId).subscribe(async response => {
      let result: any = response;

      if (result.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'X??a h???ng m???c th??nh c??ng' };
        this.showMessage(msg);
        await this.getMasterData();
        this.getListWorkPackage();
        this.actionDeleteScope = false;
        this.actionEditScope = false;
        this.selectedNode = null;
        this.clearData();
        //
        // this.noteHistory.forEach(note => {
        //   var des = $.parseHTML(note.description);
        //   note.description = des[0].innerText;
        // });
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  // Ch???nh s???a h???ng m???c
  editProjectScope() {
    if (this.selectedScopeId != undefined && this.selectedScopeId != null) {
      // check xem da co nguon luc voi node da chon hay chua
      // Ch??a c?? ngu???n l???c th?? enable v?? b???t require
      if (this.selectedScope.resourceType == null || this.selectedScope.resourceType == undefined) {
        this.enableControls(true);
      }
      else {
        this.enableControls();
      }
      this.isEdit = true;
    }
    else {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', "Vui l??ng ch???n h???ng m???c/ g??i c??ng vi???c");
    }
  }

  // L??u Thay doi thong tin hang muc
  saveProjectScope() {
    if (this.scopeProjectForm.touched) {
      let projectScopes = new Array<ProjectScopeModel>();
      projectScopes = this.listProjectScopes.filter(p => p.ischange == true);

      if (this.selectedScopeId !== undefined || projectScopes.length > 0) {
        if (!this.scopeProjectForm.valid) {
          Object.keys(this.scopeProjectForm.controls).forEach(key => {
            if (!this.scopeProjectForm.controls[key].valid) {
              this.scopeProjectForm.controls[key].markAsTouched();
              this.scopeProjectForm.controls["resourceTypeControl"].markAsTouched();
            }
          });
          this.isInvalidForm = true;
          this.isOpenNotifiError = true;
        }
        else {
          this.isInvalidForm = false;
          this.isOpenNotifiError = false;
          if (this.selectedScopeId !== null) {
            this.selectedScope.projectId = this.projectId;
            this.selectedScope.description = this.scopeProjectForm.get('projectScopeDescriptionControl').value;
            this.selectedScope.projectScopeName = this.scopeProjectForm.get('projectScopeNameControl').value;
            let sourceType = this.scopeProjectForm.get('resourceTypeControl').value;
            if (sourceType != null)
              this.selectedScope.resourceType = sourceType.categoryId;
            projectScopes[0] = this.selectedScope;
          }
        }
      }

      if (projectScopes.length > 0) {

        let projectScopeName = this.projectScopeNameControl.value;

        this.loading = true;

        this.projectService.updateProjectScope(projectScopes[0], this.auth.UserId, this.data[0].data.projectScopeId).subscribe(response => {
          let result: any = response;

          if (result.statusCode === 202 || result.statusCode === 200) {
            this.noteHistory = result.listNote;
            this.selectedNode.label = projectScopeName;
            this.listProjectScopes = result.listProjectScope;
            this.data = this.list_to_tree();
            this.handleNoteContent();
            this.isDelete = false;
            this.loading = false;
            this.isEdit = false;

            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t h???ng m???c/ g??i c??ng vi???c th??nh c??ng' };
            this.showMessage(msg);
          }
        });
        this.disableControls();
      }
    }
  }

  // disable control H???ng m???c
  disableControls() {
    this.scopeProjectForm.get('projectScopeNameControl').disable();
    this.isReadonly = true
    this.scopeProjectForm.get('resourceTypeControl').disable();
  }

  // enable control H???ng m???c
  enableControls(isExitsResource: boolean = false) {
    if (isExitsResource)
      this.scopeProjectForm.get('resourceTypeControl').enable();
    else
      this.scopeProjectForm.get('resourceTypeControl').disable();
    this.scopeProjectForm.get('projectScopeNameControl').enable();
    this.isReadonly = false
  }
  //#endregion

  createGUID() {
    var u = '', i = 0;
    while (i++ < 36) {
      var c = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'[i - 1], r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      u += (c == '-' || c == '4') ? c : v.toString(16)
    }
    return u;
  }

  //#region T??c v??? x??? l?? tr??n c??y H???ng m???c
  // Th??m m???i h???ng m???c
  async addProjectScope() {

    var parentId: any;
    var parentName: any;
    var parentCode: any;
    // Check xem c?? l???a ch???n node n??o hay ch??a
    if (this.selectedNode == undefined || this.selectedScope == null) {
    }
    else {
      parentId = this.selectedScope == null || this.selectedNode == undefined ? null : this.selectedScope.projectScopeId;

      if (parentId == null) {
        parentName = this.listProjectScopes.filter(x => x.projectScopeId == this.selectedScope.projectScopeId)[0].projectScopeName;
        parentCode = this.listProjectScopes.filter(x => x.projectScopeId == this.selectedScope.projectScopeId)[0].projectScopeCode;
      }
      else {
        parentName = this.listProjectScopes.filter(x => x.projectScopeId == parentId)[0].projectScopeName;
      }
    }

    let ref = this.dialogService.open(AddProjectScopeDialogComponent, {
      data: {
        parentId: parentId,
        listResourceType: this.listResourceType,
        parentName: parentName,
        listVendor: this.listVendor,
        projectScopeCode: parentCode,
        level: this.levelScope,
        projectId: this.projectId
      },
      header: 'Th??ng tin g??i c??ng vi???c',
      width: '80%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "400px",
        "max-height": "700px",
        "overflow-x": "hidden"
      }
    });

    ref.onClose.subscribe(async (result: any) => {

      if (result) {
        if (result.status === true) {
          this.loading = true;
          let newScope = result.scopeModel;

          let newProjectScope: ProjectScopeModel = new ProjectScopeModel();
          let count = this.listProjectScopes.filter(p => p.parentId == newScope.parentScopeId).length + 1;
          newProjectScope.parentId = newScope.parentScopeId;
          newProjectScope.projectId = this.projectId;
          //newProjectScope.projectScopeId = this.createGUID();
          newProjectScope.projectScopeName = newScope.projectScopeName;

          if (newProjectScope.parentId == undefined) newProjectScope.projectScopeCode = '';
          else newProjectScope.projectScopeCode = newScope.parentScopeCode == '' || newScope.parentScopeCode == undefined ? count.toString() : newScope.parentScopeCode + '.' + count;
          newProjectScope.description = newScope.projectScopeDescription;
          newProjectScope.ischange = true;
          newProjectScope.level = newScope.levelScope;
          newProjectScope.resourceType = newScope.resourceType;

          if (newScope.isExternal == 1) {
            newProjectScope.supplyId = newScope.supplyId;
            newProjectScope.listTask = [];
          }
          else
            newProjectScope.listTask = newScope.listTaskId;

          // L??u v??o DB
          await this.projectService.updateProjectScope(newProjectScope, this.auth.UserId, this.data[0].data.projectScopeId).subscribe(async response => {
            this.loading = false;
            let result = <any>response;

            if (result.statusCode === 202 || result.statusCode === 200) {
              this.clearToast();
              this.isEdit = false;

              await this.getMasterData();
              this.selectedNode = null;
              this.selectedScope = null;
              this.showToast('success', 'Th??ng b??o', 'Th??m h???ng m???c/ g??i c??ng vi???c th??nh c??ng');
            }
            else {
              this.clearToast();
              this.showToast('error', 'Th??ng b??o', result.messageCode);
            }
            this.loading = false;
          }, error => { this.loading = false; });
        }
      }
      else
        this.loading = false;
    });
    // }
    this.clearData();
  }


  // L???a ch???n 1 node trong c??y h???ng m???c
  async onNodeSelect(event) {
    this.actionEditScope = true;
    this.actionDeleteScope = event.node.children.length == 0;
    this.selectedScope = event.node.data;
    if (this.selectedScopeId != this.selectedScope.projectScopeId)
      this.isEdit = false;
    if (this.selectedScope.parentId == null || this.selectedScope.parentId == undefined)
      this.isDelete = false;

    this.selectedScopeId = this.selectedScope.projectScopeId;
    this.projectScopeNameControl.setValue(this.selectedScope.projectScopeName);

    let toSelectResource: CategoryModel = this.listResourceType.find(x => x.categoryId == this.selectedScope.resourceType);
    this.resourceTypeControl.setValue(toSelectResource);
    this.projectScopeDescriptionControl.setValue(this.selectedScope.description);
    this.parentName = this.listProjectScopes.find(x => x.projectScopeId == this.selectedScope.parentId) == null ? "" : this.listProjectScopes.find(x => x.projectScopeId == this.selectedScope.parentId).projectScopeName;
    this.listResourceScope = this.listProjectScopes.find(x => x.projectScopeId == this.selectedScopeId).listEmployee;

    this.levelScope = event.node.data.level;

    this.listWorkpackage = [];
    if (this.listProjectTasksDefault.length > 0) {

      this.lstNode = [];
      // Danh s??ch c??ng vi???c thu???c con c???a node ?????y
      //this.recursiveNodeScope(event.node);
      this.lstNode.push(event.node.data.projectScopeId);
      let listScopeId: Array<string> = this.listProjectScopes.filter(x => x.parentId == event.node.data.projectScopeId).map(c => c.projectScopeId);

      while (listScopeId.length != 0) {
        this.lstNode.push.apply(this.lstNode, listScopeId);
        listScopeId = this.listProjectScopes.filter(x => listScopeId.includes(x.parentId)).map(c => c.projectScopeId);
      }

      // Danh s??ch c??ng vi???c thu???c g??i node v?? con c???a node
      this.listProjectTasks = this.listProjectTasksDefault.filter(x => this.lstNode.find(a => a == x.projectScopeId));
    }
    this.handleEmployeeContent();
    this.listProjectTasks.forEach(item => {
      this.listProjectScopes.filter(x => x.projectScopeId == item.projectScopeId).forEach(scope => {
        var obj = new ProjectScopeFillter();
        obj.projectSopeId = scope.projectScopeId;
        obj.projectScopeName = scope.projectScopeName;
        this.listWorkpackage.push(obj);
      });
    });

    // Check xem node c?? con hay kh??ng
    // Node cu???i hi???n th??? 2 l???a ch???n
    if (this.listProjectScopes.filter(x => x.parentId == this.selectedScope.projectScopeId).length == 0 && this.listProjectTasks.length == 0 && this.selectedScope.parentId != null && this.selectedScope.parentId != undefined)
      this.isDelete = true;
    else {
      // ch??? hi???n th??? th??m g??i c??ng vi???c
      this.isDelete = false;
    }
    if (this.listProjectScopes.filter(x => x.parentId == this.selectedScope.projectScopeId).length == 0)
      this.setForm(0);
    else
      this.setForm(1);
    this.disableControls();

    //T??nh th???i gian ?????c l?????ng c??ng vi???c c???a H???ng m???c
    let result: any = await this.projectService.getThoiGianUocLuongHangMuc(this.selectedScope.projectScopeId);
    if (result.statusCode != 200) {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', result.messageCode);
    }

    this.thoiGianUocLuong = result.thoiGianUocLuong;
  }

  // B??? ch???n node trong c??y h???ng m???c
  onNodeUnselect(event) {

    this.selectedNode = null;
    this.parentName = null;
    this.selectedScopeId = null;
    this.actionDeleteScope = false;
    this.actionEditScope = false;
    this.selectedScopeName = null;
    this.isEdit = false;
    this.scopeProjectForm.reset();
    this.listWorkpackage = [];
    this.listWorkpackage = [];
    this.selectedScope = null;
    this.listResourceScope = [];
    this.thoiGianUocLuong = 0;
    this.setForm(0);
    this.isDelete = false;
    if (this.listProjectTasksDefault.length > 0) {
      this.lstNode = [];
      // Danh s??ch c??ng vi???c thu???c con c???a node ?????y
      //this.recursiveNodeScope(this.data[0]);
      this.lstNode.push(this.data[0].data.projectScopeId);
      // Danh s??ch c??ng vi???c thu???c g??i node v?? con c???a node
      this.listProjectTasks = this.listProjectTasksDefault.filter(x => this.lstNode.find(a => a == x.projectScopeId));
    }

    this.listProjectTasks.forEach(item => {
      this.listProjectScopes.filter(x => x.projectScopeId == item.projectScopeId).forEach(scope => {
        var obj = new ProjectScopeFillter();
        obj.projectSopeId = scope.projectScopeId;
        obj.projectScopeName = scope.projectScopeName;
        this.listWorkpackage.push(obj);
      });
    });

    this.disableControls();
  }
  //#endregion


  // Clear d??? li???u c?? trong c??c ?? nh???p li???u
  clearData() {
    this.selectedNode = null;
    this.parentName = null;
    this.selectedScopeId = null;
    this.actionDeleteScope = false;
    this.actionEditScope = false;
    this.isEdit = false;
    this.scopeProjectForm.reset();
    this.listWorkpackage = [];
    this.selectedScope = null;
    this.listResourceScope = [];
    this.isDelete = false;
  }

  // N??t tho??t
  cancel() {
    this.confirmationService.confirm({
      message: 'B???n c?? mu???n l??u c??c thay ?????i?',
      accept: () => {
        // Chuy???n v??? th??ng tin d??? ??n
        this.router.navigate(['/project/detail', { 'projectId': this.projectId }]);
      }
    });
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

  // T??m ki???m b??? l???c
  searchTask() {
    let listStatusId: Array<string> = [];
    if (this.selectedStatus) {
      listStatusId = this.selectedStatus.map(c => c.categoryId);
    }
    let listWorkpackageId: Array<string> = [];
    if (this.selectedWorkpackage) {
      listWorkpackageId = this.selectedWorkpackage.map(c => c.projectSopeId);
    }

    let ListEmployeeId: Array<string> = [];
    if (this.selectedPic) {
      ListEmployeeId = this.selectedPic.map(c => c.employeeId);
    }

    let fromPercent = this.fromPercent == null ? 0 : this.fromPercent;
    let toPercent = this.toPercent == null ? 0 : this.toPercent;

    let fromStartDate = this.startFromDate;
    if (fromStartDate) {
      fromStartDate.setHours(0, 0, 0, 0);
      fromStartDate = convertToUTCTime(fromStartDate);
    }
    let toStartDate: Date = this.startToDate;
    if (toStartDate) {
      toStartDate.setHours(23, 59, 59, 999);
      toStartDate = convertToUTCTime(toStartDate);
    }

    let fromEndDate = this.endFromDate;
    if (fromEndDate) {
      fromEndDate.setHours(0, 0, 0, 0);
      fromEndDate = convertToUTCTime(fromEndDate);
    }
    let toEndDate: Date = this.endToDate;
    if (toEndDate) {
      toEndDate.setHours(23, 59, 59, 999);
      toEndDate = convertToUTCTime(toEndDate);
    }
    this.loading = true;
    this.projectService.searchTaskFromProjectScope(this.projectId, listStatusId, listWorkpackageId, ListEmployeeId, fromStartDate, toStartDate,
      fromEndDate, toEndDate, fromPercent, toPercent, this.auth.UserId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listProjectTasks = result.listTask || [];

          if (this.listProjectTasksDefault.length > 0) {
            if (this.lstNode.length > 0) {
              // Danh s??ch c??ng vi???c thu???c g??i node v?? con c???a node
              this.listProjectTasks = this.listProjectTasks.filter(x => this.lstNode.find(a => a == x.projectScopeId));
            }
          }
          this.handleEmployeeContent();

          if (this.listProjectTasks.length == 0) {
            this.clearToast();
            this.showToast('warn', 'Th??ng b??o', "Kh??ng t??m th???y b???n ghi n??o!");
          }
        } else {
          this.clearToast();
          this.showToast('error', 'Th??ng b??o', result.messageCode);
        }
      });
  }


  /*Event thay ?????i n???i dung ghi ch??*/
  currentTextChange: string = '';
  changeNoteContent(event) {
    let htmlValue = event.htmlValue;
    this.currentTextChange = event.textValue;
  }

  /*X??? l?? v?? hi???n th??? l???i n???i dung ghi ch??*/
  async handleNoteContent() {
    this.loading = true;
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
    this.loading = false;
  }
  /*End*/

  /*X??? l?? v?? hi???n th??? l???i ng?????i ph??? tr??ch*/
  handleEmployeeContent() {
    if (this.listProjectTasks.length > 0) {
      this.listProjectTasks.forEach(element => {
        setTimeout(() => {
          if (element.employee == null) {
            element.employee = "";
          }

          let des = element.employee.split(',');
          let content = '';
          let newTextContent = '';
          for (let i = 0; i < des.length; i++) {
            content = des[i].trimStart();

            if (i === des.length - 1) {
              if (des[i].length > 30)
                newTextContent += content.substr(0, 30) + '<b>...</b>' + "</br>";
              else
                newTextContent += content;
            }
            else {
              if (des[i].length > 30)
                newTextContent += content.substr(0, 30) + '<b>...</b>' + "," + "</br>";
              else {
                newTextContent += content + "," + "</br>";
              }
            }
          }
          $('#' + element.taskId).text('');
          $('#' + element.taskId).append($.parseHTML(newTextContent));
          this.loading = false;
        }, 1000);
      });
    }
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
    // if (note.noteDocList.length > 3) return true;
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
    // noteFile
    let shortcontent_file = $('#' + nodeid).find('.short-content-file');
    let fullcontent_file = $('#' + nodeid).find('.full-content-file');
    let continue_ = $('#' + nodeid).find('.continue')
    if (shortcontent_file.css("display") === "none") {
      continue_.css("display", "block");
      fullcontent_file.css("display", "none");
      shortcontent_file.css("display", "block");
    } else {
      continue_.css("display", "none");
      fullcontent_file.css("display", "block");
      shortcontent_file.css("display", "none");
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
        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }
        this.listUpdateNoteDocument = [];
        this.isEditNote = false;
      }
    });
  }

  async uploadFilesAsync(files: File[]) {
    await this.imageService.uploadFileAsync(files);
  }


  /*Event L??u c??c file ???????c ch???n*/
  handleFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= this.defaultLimitedFileSize) {
        if (type.indexOf('/') != -1) {
          type = type.slice(0, type.indexOf('/'));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf('.'));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedFiles.push(file);
          }
        }
      }
    }
  }

  /*Event Khi click x??a t???ng file*/
  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event Khi click x??a to??n b??? file*/
  clearAllFile() {
    this.uploadedFiles = [];
  }
  /*L??u file v?? ghi ch?? v??o Db*/
  async saveNote() {

    this.loading = true;
    this.listNoteDocumentModel = [];
    /*Upload file m???i n???u c??*/
    if (this.uploadedFiles.length > 0) {
      await this.uploadFilesAsync(this.uploadedFiles);
      for (var x = 0; x < this.uploadedFiles.length; ++x) {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = this.uploadedFiles[x].name;
        noteDocument.DocumentSize = this.uploadedFiles[x].size.toString();
        this.listNoteDocumentModel.push(noteDocument);
      }
    }
    let noteModel = new NoteModel();
    if (!this.noteId) {
      /*T???o m???i ghi ch??*/
      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'NEW';
      noteModel.ObjectId = this.projectId;
      noteModel.ObjectType = 'PROSCOPE';
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.auth.UserId;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi ch??*/
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'EDT';
      noteModel.ObjectId = this.projectId;
      noteModel.ObjectType = 'PROSCOPE';
      noteModel.NoteTitle = '???? s???a ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.auth.UserId;
      noteModel.CreatedDate = new Date();
      //Th??m file c?? ???? l??u n???u c??
      // this.listUpdateNoteDocument.forEach(item => {
      //   let noteDocument = new NoteDocumentModel();
      //   noteDocument.DocumentName = item.documentName;
      //   noteDocument.DocumentSize = item.documentSize;
      //   this.listNoteDocumentModel.push(noteDocument);
      // });
    }
    this.noteService.createNoteForProjectScope(noteModel).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedFiles = [];
        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;
        this.paginator.changePage(0);
        this.clearToast();
        this.showToast('success', 'Th??ng b??o', "L??u ghi ch?? th??nh c??ng!");
        //this.fileUploadNote.clear();
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

  copyProjectResource() {
    /* check xem h???ng m???c hi???n t???i c?? task hay ch??a
    N???u ch??a th?? cho ph??p copy
    N???u c?? task r???i th?? show th??ng b??o c?? r???i
*/

    if (this.listProjectTasks.length > 0) {
      this.clearToast();
      this.showToast('warn', 'Th??ng b??o', "H???ng m???c c?? c??ng vi???c kh??ng th??? copy t??? h???ng m???c kh??c!");
    }
    else {

      this.loading = true;
      this.projectControl = new FormControl(null);
      this.cloneProjectScope = new FormGroup({
        projectControl: this.projectControl,

      });
      this.newProjectId = null;
      this.dataCopy = null;
      this.displayCopyScope = true;
      this.getCopyScopeMasterData();
      this.loading = false;
    }
  }

  getCopyScopeMasterData() {
    this.projectService.getMasterDataListCloneProjectScope().subscribe(response => {
      let result: any = response;
      if (result.statusCode == 200) {
        this.listProjectScopes = result.listProjectScope;
        this.listProject = result.listProject.filter(x => x.projectId !== this.projectId);
      } else {
        this.clearToast();
        this.showToast('error', 'Th??ng b??o', result.messageCode);
      }
    });
  }

  async saveCopy() {
    // check permission c?? ???????c x??a hay kh??ng

    // show confirm c?? ch???c ch???n mu???n copy
    this.confirmationService.confirm({
      message: 'T???t c??? h???ng m???c hi???n t???i s??? b??? x??a b???, b???n c?? ch???c mu???n ti???p t???c copy',

      accept: async () => {
        // save h???ng m???c v??o d??? ??n m???i

        this.loading = true;
        let resultClone: any = await this.projectService.cloneProjectScope(this.newProjectId, this.projectId, this.auth.UserId);
        if (resultClone.statusCode == 200) {
          this.confirmationService.close();
          await this.getMasterData();
          this.displayCopyScope = false;
        }
        else {
          this.confirmationService.close();
        }
        this.ref.close();
        this.loading = false;
      },
      reject: () => {
        this.confirmationService.close();
      }
    });
  }

  changeProject(event: any) {

    if (event.value != null) {
      this.newProjectId = event.value.projectId;
      this.dataCopy = this.list_to_tree(event.value.projectId);
    }
    else {
      this.newProjectId = null;
      this.dataCopy = null;
    }
  }

  cancelCopy() {
    this.confirmationService.confirm({
      message: 'B???n c?? mu???n h???y b??? c??c thay ?????i?',
      accept: () => {
        this.displayCopyScope = false;
      }
    });
  }

  async paginate(event) {
    //event.first = Index of the first record
    //event.rows = Number of rows to display in new page
    //event.page = Index of the new page
    //event.pageCount = Total number of pages

    let result: any = await this.projectService.pagingProjectNote(this.projectId, event.rows, event.page, "PROSCOPE");
    if (result.statusCode == 200) {

      this.noteHistory = result.noteEntityList;
      this.totalRecordsNote = result.totalRecordsNote;
      await this.handleNoteContent();
    }
  }

  onChangeProject(projectId: string) {
    this.router.navigate(['/project/scope', { 'projectId': projectId }]);
  }
}


function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
