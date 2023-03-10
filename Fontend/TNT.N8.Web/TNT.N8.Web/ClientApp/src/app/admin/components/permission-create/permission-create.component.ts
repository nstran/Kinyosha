import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SuccessComponent } from '../../../shared/toast/success/success.component';
import { FailComponent } from '../../../shared/toast/fail/fail.component';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import * as $ from 'jquery';
import { ngxLoadingAnimationTypes, NgxLoadingComponent } from 'ngx-loading';
import { EmployeeService } from '../../../employee/services/employee.service';
import { WarningComponent } from '../../../shared/toast/warning/warning.component';
import { GetPermission } from '../../../shared/permission/get-permission';

//SERVICES
import { PermissionService } from '../../../shared/services/permission.service';

import { MenuModule } from '../../../admin/models/menu-module.model';
import { MenuSubModule } from '../../../admin/models/menu-sub-module.model';
import { MenuPage } from '../../../admin/models/menu-page.model';
import { MenuBuild } from '../../../admin/models/menu-build.model';

@Component({
  selector: 'app-permission-create',
  templateUrl: './permission-create.component.html',
  styleUrls: ['./permission-create.component.css']
})
export class PermissionCreateComponent implements OnInit, AfterViewChecked {
  @ViewChild('ngxLoading') ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  loadingConfig: any = {
    'animationType': ngxLoadingAnimationTypes.circle,
    'backdropBackgroundColour': 'rgba(0,0,0,0.1)',
    'backdropBorderRadius': '4px',
    'primaryColour': '#ffffff',
    'secondaryColour': '#999999',
    'tertiaryColour': '#ffffff'
  }
  loading: boolean = false;

  /*Create Permission Form*/
  createPermissionForm: FormGroup;
  roleValueControl: FormControl;
  roleDescriptionControl: FormControl;
  /*End*/

  /*Role value*/
  roleValue: string = null;
  roleDescription: string = null;
  /*End*/

  /*Tree data*/
  listActionResource: Array<any> = [];
  listTreeData: Array<any> = [];
  newListActionResource: Array<string> = [];
  /*End*/

  actionAdd: boolean = true;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  warningConfig: MatSnackBarConfig = { panelClass: 'warning-dialog', horizontalPosition: 'end', duration: 5000 };
  successConfig: MatSnackBarConfig = { panelClass: 'success-dialog', horizontalPosition: 'end', duration: 5000 };
  failConfig: MatSnackBarConfig = { panelClass: 'fail-dialog', horizontalPosition: 'end', duration: 5000 };

  listMenuModule: Array<MenuModule> = [];

  module_maping: Array<any> = [];
  resource_maping: Array<any> = [];
  action_maping: Array<any> = [];

  constructor(
    private permissisonService: PermissionService,
    private getPermission: GetPermission,
    private translate: TranslateService,
    public snackBar: MatSnackBar,
    private employeeService: EmployeeService,
    private router: Router,
    public dialog: MatDialog,
    private el: ElementRef,
    public ref: ChangeDetectorRef
  ) {
    // this.listMenuModule = JSON.parse(localStorage.getItem('ListMenuModule'));
    // this.listMenuSubModule = JSON.parse(localStorage.getItem('ListMenuSubModule'));
    // this.listMenuPage = JSON.parse(localStorage.getItem('ListMenuPage'));

    // this.listMenuModule.forEach(menuModule => {
    //   menuModule.children = this.listMenuSubModule.filter(x => x.codeParent == menuModule.code);

    //   menuModule.children.forEach(subMenuModule => {
    //     subMenuModule.children = this.listMenuPage.filter(x => x.codeParent == subMenuModule.code);
    //   });
    // });
  }

  async ngOnInit() {
    this.setForm();
    let resource = "sys/admin/permission-create/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.snackBar.openFromComponent(WarningComponent, { data: "B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???", ...this.warningConfig });
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      //this.setForm();
      this.getMasterData();
    }
  }

  ngAfterViewChecked() {
    this.ref.detectChanges();
  }

  setForm() {
    this.roleValueControl = new FormControl('', [Validators.required]);
    this.roleDescriptionControl = new FormControl('');

    this.createPermissionForm = new FormGroup({
      roleValueControl: this.roleValueControl,
      roleDescriptionControl: this.roleDescriptionControl
    });
  }

  getMasterData() {
    this.loading = true;
    this.permissisonService.getCreatePermission().subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.module_maping = result.module_Mapping;
        this.action_maping = result.action_Mapping;
        this.resource_maping = result.resource_Mapping;

        this.listActionResource = result.listActionResource;
        if (this.listActionResource.length > 0) {

          console.log(this.listActionResource)
          this.listActionResource.forEach(item => {
            let option: any =
            {
              key: '',
              name: '',
              checked: false,
              indeterminate: false,
              children: []
            };

            let moduleKey = item.actionResource1.trim().slice(0, item.actionResource1.trim().indexOf('/'));
            let moduleName = this.module_maping.find(e => e.key == moduleKey)?.name;

            if (moduleName != null && moduleName != undefined) {
              option.key = moduleKey;
              option.name = moduleName;
              option.children = [];

              if (this.listTreeData.length > 0) {
                if (this.checkModuleKey(moduleKey)) {
                  //N???u ch??a t???n t???i module
                  this.listTreeData.push(option);

                  //map resource
                  let resourceKey = item.actionResource1.trim().slice(item.actionResource1.trim().indexOf('/') + 1, item.actionResource1.trim().lastIndexOf('/'));
                  let resourceName = this.resource_maping.find(e => e.key == resourceKey)?.name;
                  if (resourceName != null && resourceName != undefined) {
                    if (this.checkResourceKey(moduleKey, resourceKey)) {
                      //N???u ch??a t???n t???i resource
                      let resource: any =
                      {
                        key: '',
                        name: '',
                        toggle: '',
                        checked: false,
                        indeterminate: false,
                        children: []
                      };
                      resource.key = resourceKey;
                      resource.name = resourceName;
                      resource.toggle = resourceKey.replace(/\//g, '');

                      this.listTreeData.find(e => e.key == moduleKey).children.push(resource);

                      let actionKey = item.actionResource1.trim().slice(item.actionResource1.trim().lastIndexOf('/') + 1);
                      let actionName = this.action_maping.find(e => e.key == actionKey)?.name;
                      if (actionName != null && actionName != undefined) {
                        let action: any =
                        {
                          key: '',
                          name: '',
                          checked: false,
                        };
                        action.key = actionKey;
                        action.name = actionName;

                        this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).children.push(action);
                      }
                    }
                    else {
                      //N???u ???? t???n t???i resource
                      let actionKey = item.actionResource1.trim().slice(item.actionResource1.trim().lastIndexOf('/') + 1);
                      let actionName = this.action_maping.find(e => e.key == actionKey)?.name;
                      if (actionName != null && actionName != undefined) {
                        let action: any =
                        {
                          key: '',
                          name: '',
                          checked: false,
                        };
                        action.key = actionKey;
                        action.name = actionName;

                        this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).children.push(action);
                      }
                    }
                  }
                }
                else {
                  //N???u ???? t???n t???i module
                  //map resource
                  let resourceKey = item.actionResource1.trim().slice(item.actionResource1.trim().indexOf('/') + 1, item.actionResource1.trim().lastIndexOf('/'));
                  let resourceName = this.resource_maping.find(e => e.key == resourceKey)?.name;
                  if (resourceName != null && resourceName != undefined) {
                    if (this.checkResourceKey(moduleKey, resourceKey)) {
                      //N???u ch??a t???n t???i resource
                      let resource: any =
                      {
                        key: '',
                        name: '',
                        checked: false,
                        indeterminate: false,
                        children: []
                      };
                      resource.key = resourceKey;
                      resource.name = resourceName;
                      resource.toggle = resourceKey.replace(/\//g, '');

                      this.listTreeData.find(e => e.key == moduleKey).children.push(resource);

                      let actionKey = item.actionResource1.trim().slice(item.actionResource1.trim().lastIndexOf('/') + 1);
                      let actionName = this.action_maping.find(e => e.key == actionKey)?.name;
                      if (actionName != null && actionName != undefined) {
                        let action: any =
                        {
                          key: '',
                          name: '',
                          checked: false,
                        };
                        action.key = actionKey;
                        action.name = actionName;

                        this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).children.push(action);
                      }
                    }
                    else {
                      //N???u ???? t???n t???i resource
                      let actionKey = item.actionResource1.trim().slice(item.actionResource1.trim().lastIndexOf('/') + 1);
                      let actionName = this.action_maping.find(e => e.key == actionKey)?.name;
                      if (actionName != null && actionName != undefined) {
                        let action: any =
                        {
                          key: '',
                          name: '',
                          checked: false,
                        };
                        action.key = actionKey;
                        action.name = actionName;

                        this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).children.push(action);
                      }
                    }
                  }
                }
              }
              else {
                //N???u l?? b???n ghi ?????u ti??n c???a module
                this.listTreeData.push(option);

                let resourceKey = item.actionResource1.trim().slice(item.actionResource1.trim().indexOf('/') + 1, item.actionResource1.trim().lastIndexOf('/'));
                let resourceName = this.resource_maping.find(e => e.key == resourceKey)?.name;
                if (resourceName != null && resourceName != undefined) {
                  //N???u ch??a t???n t???i resource
                  let resource: any =
                  {
                    key: '',
                    name: '',
                    checked: false,
                    indeterminate: false,
                    children: []
                  };
                  resource.key = resourceKey;
                  resource.name = resourceName;
                  resource.toggle = resourceKey.replace(/\//g, '');

                  this.listTreeData.find(e => e.key == moduleKey).children.push(resource);

                  let actionKey = item.actionResource1.trim().slice(item.actionResource1.trim().lastIndexOf('/') + 1);
                  let actionName = this.action_maping.find(e => e.key == actionKey)?.name;
                  if (actionName != null && actionName != undefined) {
                    let action: any =
                    {
                      key: '',
                      name: '',
                      checked: false,
                    };
                    action.key = actionKey;
                    action.name = actionName;

                    this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).children.push(action);
                  }
                }
              }
            }
          });
        }

        /*Build tree M??n h??nh m???c ?????nh*/
        let listMenuBuild: Array<MenuBuild> = result.listMenuBuild;

        listMenuBuild.forEach(item => {
          if (item.level == 0) {
            let menuModule = new MenuModule();
            menuModule.code = item.code;
            menuModule.name = item.name;
            this.listMenuModule.push(menuModule);
          }
        });

        let listMenuSubModule: Array<MenuSubModule> = [];
        listMenuBuild.forEach(item => {
          if (item.level == 1) {
            let menuSubModule = new MenuSubModule();
            menuSubModule.indexOrder = item.indexOrder;
            menuSubModule.name = item.name;
            menuSubModule.code = item.code;
            menuSubModule.codeParent = item.codeParent;
            menuSubModule.path = item.path ?? '';

            listMenuSubModule.push(menuSubModule);
          }
        });

        let listMenuPage: Array<MenuPage> = [];
        listMenuBuild.forEach(item => {
          if (item.level == 2) {
            let menuPage = new MenuPage();
            menuPage.name = item.name;
            menuPage.codeParent = item.codeParent;
            menuPage.nameIcon = item.nameIcon;
            menuPage.path = item.path;

            //N???u l?? m??n h??nh chi ti???t th?? kh??ng hi???n th???
            if (item.isPageDetail) {
              menuPage.isShow = false;
            }

            listMenuPage.push(menuPage);
          }
        });

        this.listMenuModule.forEach(menuModule => {
          menuModule.children = listMenuSubModule.filter(x => x.codeParent == menuModule.code);

          menuModule.children.forEach(subMenuModule => {
            subMenuModule.children = listMenuPage.filter(x => x.codeParent == subMenuModule.code);
          });
        });
      }
      else {
        this.snackBar.openFromComponent(FailComponent, { data: result.messageCode, ...this.failConfig });
      }
    });
  }

  checkModuleKey(moduleKey) {
    let result = true;  //Ch??a t???n t???i module n??y trong m???ng
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        result = false; //???? t???n t???i module n??y trong m???ng
      }
    });
    return result;
  }

  checkResourceKey(moduleKey, resourceKey) {
    let result = true; //Ch??a t???n t???i resource n??y trong m???ng
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          if (resource.key == resourceKey) {
            result = false;
          }
        });
      }
    });
    return result;
  }

  changeIcon(event: any) {
    let curText = $(event.target).text().trim();
    if (curText === 'arrow_right' || curText === 'arrow_drop_down') $(event.target).text(curText === 'arrow_right' ? 'arrow_drop_down' : 'arrow_right');
    if (curText === 'add' || curText === 'remove') $(event.target).text(curText === 'add' ? 'remove' : 'add');
  }

  changeModule(elementModule) {
    //Sau khi click ch???n v??o module
    //Ki???m tra tr???ng th??i tr?????c khi ???????c click c???a module l?? g??
    let beforeChecked = !elementModule.checked;
    if (beforeChecked) {
      //Module ??ang ??? tr???ng th??i check
      //Chuy???n module sang tr???ng th??i uncheck
      this.unSelectedModule(elementModule.key);
    }
    else {
      //Chuy???n module sang tr???ng th??i check
      this.selectedModule(elementModule.key);
    }
  }

  changeResource(moduleKey, resourceKey) {
    //Sau khi click ki???m tra tr???ng th??i tr?????c khi ???????c click c???a resource l?? g??
    let beforeChecked = !this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).checked;
    if (beforeChecked) {
      //Resource ??ang ??? tr???ng th??i check
      //Chuy???n Resource sang tr???ng th??i uncheck
      this.unSelectedResource(moduleKey, resourceKey);

      //Thay ?????i tr???ng th??i c???a Module
      this.setStatusModuleAfterCheckResource(moduleKey);
    }
    else {
      //Resource ??ang ??? tr???ng th??i uncheck
      this.selectedResource(moduleKey, resourceKey);
      //Thay ?????i tr???ng th??i c???a Module
      this.setStatusModuleAfterCheckResource(moduleKey);
    }
  }

  changeAction(moduleKey, resourceKey, actionKey) {
    //Thay ?????i tr???ng th??i c???a resource
    this.setStatusResourceAfterChangeAction(moduleKey, resourceKey);
    //Thay ?????i tr???ng th??i c???a Module
    this.setStatusModuleAfterCheckResource(moduleKey);
  }

  selectedModule(moduleKey) {
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.checked = true;
        item.indeterminate = false;
        item.children.forEach(resource => {
          resource.checked = true;
          resource.indeterminate = false;
          resource.children.forEach(action => {
            action.checked = true;
          });
        });
      }
    });
  }

  unSelectedModule(moduleKey) {
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.checked = false;
        item.indeterminate = false;
        item.children.forEach(resource => {
          resource.checked = false;
          resource.indeterminate = false;
          resource.children.forEach(action => {
            action.checked = false;
          });
        });
      }
    });
  }

  selectedResource(moduleKey, resourceKey) {
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          if (resource.key == resourceKey) {
            resource.checked = true;
            resource.indeterminate = false;
            resource.children.forEach(action => {
              action.checked = true;
            });
          }
        });
      }
    });
  }

  unSelectedResource(moduleKey, resourceKey) {
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          if (resource.key == resourceKey) {
            resource.checked = false;
            resource.indeterminate = false;
            resource.children.forEach(action => {
              action.checked = false;
            });
          }
        });
      }
    });
  }

  checkSelectedResource(moduleKey) {
    let totalResource = this.listTreeData.find(e => e.key == moduleKey).children.length;
    let unChecked = 0;
    let checked = 0;
    let indeterminate = 0;

    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          if (resource.checked == false && resource.indeterminate == false) {
            unChecked++;
          }
          else if (resource.checked == false && resource.indeterminate == true) {
            indeterminate++;
          }
          else if (resource.checked == true) {
            checked++;
          }
        });
      }
    });

    if (indeterminate > 0 && indeterminate <= totalResource) {
      //C?? resource ??ang ??? tr???ng th??i indeterminate
      return 2;
    }

    if (checked == totalResource) {
      //T???t c??? resource ?????u ??? tr???ng th??i check
      return 1;
    }
    else if (checked > 0 && checked < totalResource) {
      //C?? c??? resource ??ang ??? tr???ng th??i check v?? resource ??ang ??? tr???ng th??i uncheck
      return 2;
    }
    else if (unChecked == totalResource) {
      //T???t c??? resource ?????u ??? tr???ng th??i uncheck
      return 0;
    }
  }

  setStatusModuleAfterCheckResource(moduleKey) {
    let statusModule = this.checkSelectedResource(moduleKey);
    if (statusModule == 0) {
      //T???t c??? resource ?????u ??? tr???ng th??i uncheck
      //uncheck module
      this.unSelectedModule(moduleKey);
    }
    else if (statusModule == 1) {
      //T???t c??? resource ?????u ???????c check
      //check module
      this.selectedModule(moduleKey);
    }
    else if (statusModule == 2) {
      //C?? resource ??ang ??? tr???ng th??i check v?? uncheck, indeterminate
      //?????i tr???ng th??i c???a module th??nh indeterminate
      this.listTreeData.find(e => e.key == moduleKey).checked = false;
      this.listTreeData.find(e => e.key == moduleKey).indeterminate = true;
    }
  }

  checkSelectedAction(moduleKey, resourceKey) {
    let totalAction = this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).children.length;
    let unChecked = 0;
    let checked = 0;

    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          if (resource.key == resourceKey) {
            resource.children.forEach(action => {
              if (action.checked == false) {
                unChecked++;
              }
              else if (action.checked == true) {
                checked++;
              }
            });
          }
        });
      }
    });

    if (checked == totalAction) {
      //T???t c??? resource ?????u ??? tr???ng th??i check
      return 1;
    }
    else if (checked > 0 && checked < totalAction) {
      //C?? resource ??ang ??? tr???ng th??i check v?? uncheck
      return 2;
    }
    else if (unChecked == totalAction) {
      //T???t c??? resource ?????u ??? tr???ng th??i uncheck
      return 0;
    }
  }

  setStatusResourceAfterChangeAction(moduleKey, resourceKey) {
    let statusResource = this.checkSelectedAction(moduleKey, resourceKey);
    if (statusResource == 0) {
      //T???t c??? action ?????u ??? tr???ng th??i uncheck
      //uncheck resource
      this.unSelectedResource(moduleKey, resourceKey);
    }
    else if (statusResource == 1) {
      //T???t c??? action ?????u ???????c check
      //check resource
      this.selectedResource(moduleKey, resourceKey);
    }
    else if (statusResource == 2) {
      //C?? action ??ang ??? tr???ng th??i check v?? uncheck, indeterminate
      //?????i tr???ng th??i c???a module th??nh indeterminate
      this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).checked = false;
      this.listTreeData.find(e => e.key == moduleKey).children.find(f => f.key == resourceKey).indeterminate = true;
    }
  }

  btnSaveClick() {
    if (!this.createPermissionForm.valid) {
      Object.keys(this.createPermissionForm.controls).forEach(key => {
        if (!this.createPermissionForm.controls[key].valid) {
          this.createPermissionForm.controls[key].markAsTouched();
        }
      });
    }
    else {
      this.newListActionResource = [];
      this.listTreeData.forEach(item => {
        if (item.checked == true && item.indeterminate == false) {
          //N???u l?? ch???n t???t c??? resource con b??n trong th?? list ra
          this.getListActionResourceByModuleKey(item.key);
        }
        else if (item.checked == false && item.indeterminate == true) {
          //N???u l?? ch???n m???t s??? ph???n t??? resource b??n trong
          //Ki???m tra ti???p trong resource
          item.children.forEach(resource => {
            if (resource.checked == true && resource.indeterminate == false) {
              //N???u l?? ch???n t???t c??? action con b??n trong th?? list ra
              this.getListActionResourceByResource(item.key, resource.key);
            }
            else if (resource.checked == false && resource.indeterminate == true) {
              //N???u l?? ch???n m???t s??? action b??n trong
              //Ki???m tra ti???p trong action
              resource.children.forEach(action => {
                if (action.checked == true) {
                  //N???u action ???????c check th?? list ra
                  let actionResource = item.key + '/' + resource.key + '/' + action.key;
                  this.newListActionResource.push(actionResource);
                }
              });
            }
          });
        }
      });

      /*L???y c??c sub menu module v?? ???????ng d???n m???c ?????nh ???? ch???n*/
      let listMenuBuild: Array<MenuBuild> = [];
      this.listMenuModule.forEach(menuModule => {
        menuModule.children.forEach(_subMenuModule => {
          if (_subMenuModule.path.trim() != '') {
            let menuBuild = new MenuBuild();
            menuBuild.code = _subMenuModule.code;
            menuBuild.path = _subMenuModule.path;

            listMenuBuild.push(menuBuild);
          }
        });
      });
      /*End*/

      this.permissisonService.createRoleAndPermission(this.roleValue, this.roleDescription, this.newListActionResource, listMenuBuild).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.snackBar.openFromComponent(SuccessComponent, { data: result.messageCode, ...this.successConfig });
          this.router.navigate(['/admin/permission']);
        }
        else {
          this.snackBar.openFromComponent(FailComponent, { data: result.messageCode, ...this.failConfig });
        }
      });
    }
  }

  getListActionResourceByModuleKey(moduleKey) {
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          resource.children.forEach(action => {
            let actionResource = moduleKey + '/' + resource.key + '/' + action.key;
            this.newListActionResource.push(actionResource);
          });
        });
      }
    });
  }

  getListActionResourceByResource(moduleKey, resourceKey) {
    this.listTreeData.forEach(item => {
      if (item.key == moduleKey) {
        item.children.forEach(resource => {
          if (resource.key == resourceKey) {
            resource.children.forEach(action => {
              let actionResource = moduleKey + '/' + resource.key + '/' + action.key;
              this.newListActionResource.push(actionResource);
            });
          }
        });
      }
    });
  }

  btnCancel() {
    this.router.navigate(['/admin/permission']);
  }

}
