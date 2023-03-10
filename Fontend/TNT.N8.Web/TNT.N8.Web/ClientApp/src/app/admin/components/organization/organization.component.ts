import { Component, OnInit, ElementRef } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { OrganizationService } from "../../../shared/services/organization.service";
import { OrganizationModel } from "../../../shared/models/organization.model";
import { SuccessComponent } from '../../../shared/toast/success/success.component';
import { FailComponent } from '../../../shared/toast/fail/fail.component';
import { TranslateService } from '@ngx-translate/core';
import { EmployeeService } from '../../../employee/services/employee.service';
import { Router } from '@angular/router';
import { WarningComponent } from '../../../shared/toast/warning/warning.component';
import { GetPermission } from '../../../shared/permission/get-permission';
import * as $ from 'jquery';
import { TreeNode } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ChonNvDialogComponent } from './../chon-nv-dialog/chon-nv-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';

class Organization {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  address: string;
  phone: string;
  parentId: string;
  parentName: string;
  level: Number;
  isFinancialIndependence: boolean;
  orgChildList: Array<Organization>;
  children: Array<any>;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: Date;
  active: Boolean;

  constructor() { }
}

class ThanhVienPhongBan {
  id: string;
  employeeId: string;
  organizationId: string;
  isManager: number;
  organizationName: string;
  employeeCodeName: string;
}

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css']
})
export class OrganizationComponent implements OnInit {
  organizationModel: OrganizationModel = {
    OrganizationId: '',
    OrganizationName: '',
    OrganizationCode: '',
    Address: '',
    Phone: '',
    ParentId: '',
    ParentName: '',
    IsFinancialIndependence: false,
    Level: 1,
    CreatedById: '',
    CreatedDate: null,
    UpdatedById: '',
    UpdatedDate: null,
    Active: true,
    IsAccess: false
  };

  toastMessage: string;
  listOrganization: Array<Organization>;
  listGeographicalArea: Array<any> = [];
  listProvince: Array<any> = [];
  listDistrict: Array<any> = [];
  listCurrentDistrict: Array<any> = [];
  listWard: Array<any> = [];
  listCurrentWard: Array<any> = [];
  listSatellite: Array<any> = [];
  selectedOrgId: string = '';
  selectedOrgName: string;
  reloadAfterCreate: boolean = false;

  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  successConfig: MatSnackBarConfig = { panelClass: 'success-dialog', horizontalPosition: 'end', duration: 5000 };
  failConfig: MatSnackBarConfig = { panelClass: 'fail-dialog', horizontalPosition: 'end', duration: 5000 };
  warningConfig: MatSnackBarConfig = { panelClass: 'warning-dialog', horizontalPosition: 'end', duration: 5000 };

  loading: boolean = false;

  data: TreeNode[];
  selectedNode: TreeNode;

  organizationId: string = null;
  organizationParentName: string = null;
  isEnableForm: boolean = false;

  listCreProvince: Array<any> = [];
  listCreDistrict: Array<any> = [];
  listCreCurrentDistrict: Array<any> = [];
  listCreWard: Array<any> = [];
  listCreCurrentWard: Array<any> = [];

  organizationForm: FormGroup;
  organizationNameControl: FormControl;
  organizationCodeControl: FormControl;
  organizationPhoneControl: FormControl;
  organizationAddressControl: FormControl;
  financialIndependenceControl: FormControl;
  isAccessControl: FormControl;
  geographicalAreaControl: FormControl;
  provinceControl: FormControl;
  districtControl: FormControl;
  wardControl: FormControl;
  satelliteControl: FormControl;
  organizationOtherCodeControl: FormControl;

  displayModal: boolean = false;
  orgCreateForm: FormGroup;
  orgNameControl: FormControl;
  orgCodeControl: FormControl;
  orgPhoneControl: FormControl;
  orgAddressControl: FormControl;
  orgFinancialIndependenceControl: FormControl;
  orgGeographicalAreaControl: FormControl;
  orgProvinceControl: FormControl;
  orgDistrictControl: FormControl;
  orgWardControl: FormControl;
  orgSatelliteControl: FormControl;
  orgOtherCodeControl: FormControl;

  cols: Array<any> = [];
  listEmployeeCreate: Array<ThanhVienPhongBan> = [];
  listEmployeeEdit: Array<ThanhVienPhongBan> = [];
  listEmployeeEditClone: Array<ThanhVienPhongBan> = [];

  constructor(private el: ElementRef,
    private getPermission: GetPermission,
    public dialog: MatDialog,
    private organizationService: OrganizationService,
    private translate: TranslateService,
    private employeeService: EmployeeService,
    private router: Router,
    public snackBar: MatSnackBar,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {
    translate.setDefaultLang('vi');
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  async  ngOnInit() {
    this.initTable();
    this.setForm();
    this.organizationForm.disable();

    let resource = "sys/admin/organization/";
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
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      this.getAllOrganization();
    }
  }

  initTable() {
    this.cols = [
      { field: 'employeeCodeName', header: 'Nh??n vi??n', textAlign: 'left', display: 'table-cell' },
      { field: 'truongBoPhan', header: 'Tr?????ng b??? ph???n', textAlign: 'center', display: 'table-cell' },
      { field: 'nguoiTheoDoi', header: 'Ng?????i theo d??i', textAlign: 'center', display: 'table-cell' },
      { field: 'nhanVien', header: 'Nh??n vi??n', textAlign: 'center', display: 'table-cell' },
      { field: 'actions', header: 'Thao t??c', textAlign: 'center', display: 'table-cell' },
    ];
  }

  setForm() {
    this.organizationNameControl = new FormControl('', [Validators.required]);
    this.organizationCodeControl = new FormControl('', [Validators.required]);
    this.organizationPhoneControl = new FormControl('');
    this.organizationAddressControl = new FormControl('');
    this.financialIndependenceControl = new FormControl(false);
    this.isAccessControl = new FormControl(false);
    this.geographicalAreaControl = new FormControl(null);
    this.provinceControl = new FormControl(null);
    this.districtControl = new FormControl(null);
    this.wardControl = new FormControl(null);
    this.satelliteControl = new FormControl(null);
    this.organizationOtherCodeControl = new FormControl({ value: null, disabled: true });

    this.organizationForm = new FormGroup({
      organizationNameControl: this.organizationNameControl,
      organizationCodeControl: this.organizationCodeControl,
      organizationPhoneControl: this.organizationPhoneControl,
      organizationAddressControl: this.organizationAddressControl,
      financialIndependenceControl: this.financialIndependenceControl,
      isAccessControl: this.isAccessControl,
      geographicalAreaControl: this.geographicalAreaControl,
      provinceControl: this.provinceControl,
      districtControl: this.districtControl,
      wardControl: this.wardControl,
      satelliteControl: this.satelliteControl,
      organizationOtherCodeControl: this.organizationOtherCodeControl
    });

    this.orgNameControl = new FormControl('', [Validators.required]);
    this.orgCodeControl = new FormControl('', [Validators.required]);
    this.orgPhoneControl = new FormControl('');
    this.orgAddressControl = new FormControl('');
    this.orgFinancialIndependenceControl = new FormControl(false);
    this.orgGeographicalAreaControl = new FormControl(null);
    this.orgProvinceControl = new FormControl(null);
    this.orgDistrictControl = new FormControl(null);
    this.orgWardControl = new FormControl(null);
    this.orgSatelliteControl = new FormControl(null);
    this.orgOtherCodeControl = new FormControl({ value: null, disabled: true });

    this.orgCreateForm = new FormGroup({
      orgNameControl: this.orgNameControl,
      orgCodeControl: this.orgCodeControl,
      orgPhoneControl: this.orgPhoneControl,
      orgAddressControl: this.orgAddressControl,
      orgFinancialIndependenceControl: this.orgFinancialIndependenceControl,
      orgGeographicalAreaControl: this.orgGeographicalAreaControl,
      orgProvinceControl: this.orgProvinceControl,
      orgDistrictControl: this.orgDistrictControl,
      orgWardControl: this.orgWardControl,
      orgSatelliteControl: this.orgSatelliteControl,
      orgOtherCodeControl: this.orgOtherCodeControl
    });
  }

  getAllOrganization() {
    this.loading = true;
    this.organizationService.getAllOrganization().subscribe(response => {
      let result = <any>response;
      this.loading = false;
      this.listOrganization = result.listAll;
      this.listGeographicalArea = result.listGeographicalArea;
      this.listProvince = result.listProvince;
      this.listCreProvince = result.listProvince;
      this.listDistrict = result.listDistrict;
      this.listCreDistrict = result.listDistrict;
      this.listWard = result.listWard;
      this.listCreWard = result.listWard;
      this.listSatellite = result.listSatellite;

      /* Convert data to type TreeNode */
      this.data = this.list_to_tree();

      this.onNodeUnselect(1);
    });
  }

  list_to_tree() {
    let list: Array<TreeNode> = [];
    this.listOrganization.forEach(item => {
      let node: TreeNode = {
        label: item.organizationName,
        expanded: true,
        data: {
          'organizationId': item.organizationId,
          'parentId': item.parentId,
          'isFinancialIndependence': item.isFinancialIndependence,
          'level': item.level
        },
        children: []
      };

      list = [...list, node];
    });

    var map = {}, node, roots = [], i;

    for (i = 0; i < list.length; i += 1) {
      map[list[i].data.organizationId] = i; // initialize the map
      list[i].children = []; // initialize the children
    }

    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.data.level !== 0) {
        // if you have dangling branches check that map[node.parentId] exists
        list[map[node.data.parentId]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  /* Enable form: Ch???nh s???a */
  updateOrg() {
    if (this.selectedNode) {
      this.organizationForm.enable();

      this.organizationOtherCodeControl.disable();
      this.isEnableForm = true;
    } else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n ch??a ch???n ????n v???' };
      this.showMessage(msg);
    }
  }

  /* L??u thay ?????i ph??ng ban */
  saveOrg() {
    if (!this.organizationForm.valid) {
      Object.keys(this.organizationForm.controls).forEach(key => {
        if (this.organizationForm.controls[key].valid == false) {
          this.organizationForm.controls[key].markAsTouched();
        }
      });
    } else {
      let organizationName = this.organizationNameControl.value;
      let organizationCode = this.organizationCodeControl.value;
      let organizationPhone = this.organizationPhoneControl.value;
      let organizationAddress = this.organizationAddressControl.value;
      let isFinancialIndependence = this.financialIndependenceControl.value;
      let isAccess = this.isAccessControl.value;
      let GeographicalAreaId = this.geographicalAreaControl.value ?.geographicalAreaId;
      let ProvinceId = this.provinceControl.value ?.provinceId;
      let DistrictId = this.districtControl.value ?.districtId;
      let WardId = this.wardControl.value ?.wardId;
      let SatelliteId = this.satelliteControl.value ?.satelliteId;
      let organizationOtherCode = this.organizationOtherCodeControl.value;

      this.loading = true;
      this.organizationService.updateOrganizationById(
        this.organizationId,
        organizationName,
        organizationCode,
        organizationPhone,
        organizationAddress,
        isFinancialIndependence,
        GeographicalAreaId,
        ProvinceId,
        DistrictId,
        WardId,
        SatelliteId,
        organizationOtherCode,
        this.listEmployeeEdit,
        isAccess
      ).subscribe(response => {
        let result: any = response;
        this.loading = false;

        if (result.statusCode == 200) {
          //Thay ?????i tr??n tree
          this.selectedNode.label = organizationName;
          this.selectedNode.data.isFinancialIndependence = isFinancialIndependence;

          this.organizationForm.disable();
          this.isEnableForm = false;

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Ch???nh s???a th??nh c??ng' };
          this.showMessage(msg);

          this.organizationService.getOrganizationById(this.selectedNode.data.organizationId).subscribe(response => {
            let _result: any = response;

            if (_result.statusCode == 200) {
              this.mapDataToForm(_result.organization, _result.listThanhVienPhongBan);
            }
            else {
              let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: _result.messageCode };
              this.showMessage(msg);
            }
          });
        }
        else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  /* Disable form: H???y ch???nh s???a */
  cancelUpdateOrg() {
    this.organizationForm.disable();
    this.isEnableForm = false;
    this.listEmployeeEdit = this.listEmployeeEditClone.map(item => Object.assign({}, item));
  }

  getOrganizationById(orgId: string) {
    this.organizationService.getOrganizationById(orgId).subscribe(response => {
      let result = <any>response;
      if (result.statusCode === 202 || result.statusCode === 200) {
        this.organizationModel = <OrganizationModel>({
          OrganizationId: result.organization.organizationId,
          OrganizationName: result.organization.organizationName,
          OrganizationCode: result.organization.organizationCode,
          Phone: result.organization.phone,
          Address: result.organization.address,
          IsFinancialIndependence: result.organization.isFinancialIndependence,
          ParentId: result.organization.parentId,
          ParentName: result.organization.parentName,
          Level: result.organization.level,
          UpdatedById: result.organization.updatedById,
          UpdatedDate: result.organization.updatedDate,
          Active: result.organization.active,
          IsAccess: result.organization.isAccess,
        });
      }
      else {
        this.snackBar.openFromComponent(FailComponent, { data: result.messageCode, ...this.failConfig });
      }
    });
  }

  /* X??a ????n v??? */
  deleteOrganizationById() {
    if (this.selectedNode) {
      this.confirmationService.confirm({
        message: 'Ba??n co?? mu????n xo??a ????n v??? na??y kh??ng?',
        accept: () => {
          this.organizationService.deleteOrganizationById(this.selectedNode.data.organizationId).subscribe(response => {
            let result = <any>response;
            if (result.statusCode === 200) {
              let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.messageCode };
              this.showMessage(msg);

              this.getAllOrganization();
            }
            else {
              let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
              this.showMessage(msg);
            }
          });
        }
      });
    }
    else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n ch??a ch???n ????n v???' };
      this.showMessage(msg);
    }
  }

  hasChild(org): boolean {
    return ((org.orgChildList.length > 0) ? true : false);
  }

  onNodeSelect(event) {
    this.object_code = {
      organizationCode: '',
      geographicalAreaCode: '',
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      satelliteCode: ''
    }

    let organizationId = event.node.data.organizationId;

    if (organizationId) {
      this.organizationId = organizationId;
      this.loading = true;
      this.organizationService.getOrganizationById(organizationId).subscribe(response => {
        let result: any = response;
        this.loading = false;

        if (result.statusCode == 200) {
          this.mapDataToForm(result.organization, result.listThanhVienPhongBan);
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  onNodeUnselect(event) {
    this.isEnableForm = false;
    this.organizationId = null;
    this.organizationParentName = null;
    this.object_code = {
      organizationCode: '',
      geographicalAreaCode: '',
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      satelliteCode: ''
    }
    this.selectedNode = null;
    this.organizationForm.reset();
    this.organizationForm.disable();
  }

  mapDataToForm(orgInformation, listThanhVienPhongBan) {
    this.organizationParentName = orgInformation.parentName ? orgInformation.parentName : '';
    this.organizationNameControl.setValue(orgInformation.organizationName ? orgInformation.organizationName : '');
    this.organizationCodeControl.setValue(orgInformation.organizationCode ? orgInformation.organizationCode : '');
    this.organizationPhoneControl.setValue(orgInformation.phone ? orgInformation.phone : '');
    this.organizationAddressControl.setValue(orgInformation.address ? orgInformation.address : '');
    this.financialIndependenceControl.setValue(orgInformation.isFinancialIndependence ? orgInformation.isFinancialIndependence : false);

    this.isAccessControl.setValue(orgInformation.isAccess ? orgInformation.isAccess : false);

    let geographicalArea = this.listGeographicalArea.find(x => x.geographicalAreaId == orgInformation.geographicalAreaId);
    this.geographicalAreaControl.setValue(geographicalArea ? geographicalArea : null);

    let province = this.listProvince.find(x => x.provinceId == orgInformation.provinceId);
    if (province) {
      this.provinceControl.setValue(province ? province : null);
      this.listCurrentDistrict = this.listDistrict.filter(x => x.provinceId == province.provinceId);
    } else {
      this.listCurrentDistrict = [];
      this.listCurrentWard = [];
    }

    let district = this.listDistrict.find(x => x.districtId == orgInformation.districtId);
    if (district) {
      this.districtControl.setValue(district ? district : null);
      this.listCurrentWard = this.listWard.filter(x => x.districtId == district.districtId);
    } else {
      this.listCurrentWard = [];
    }

    let ward = this.listWard.find(x => x.wardId == orgInformation.wardId);
    this.wardControl.setValue(ward ? ward : null);

    let satellite = this.listSatellite.find(x => x.satelliteId == orgInformation.satelliteId);
    this.satelliteControl.setValue(satellite ? satellite : null);

    this.organizationOtherCodeControl.setValue(orgInformation.organizationOtherCode ? orgInformation.organizationOtherCode : '');

    this.listEmployeeEdit = listThanhVienPhongBan;
    this.listEmployeeEditClone = listThanhVienPhongBan.map(item => Object.assign({}, item));
  }

  object_code = {
    organizationCode: '',
    geographicalAreaCode: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    satelliteCode: ''
  };

  changeCode(mode: number) {
    if (mode == 1) {
      //M?? ????n v???
      let organizationCode = this.organizationCodeControl.value;

      if (organizationCode) {
        this.object_code.organizationCode = organizationCode;
      } else {
        this.object_code.organizationCode = '';
      }

      //Khu v???c
      let geographicalArea = this.geographicalAreaControl.value;

      if (geographicalArea) {
        this.object_code.geographicalAreaCode = geographicalArea.geographicalAreaCode;
      } else {
        this.object_code.geographicalAreaCode = '';
      }

      //T???nh
      let province = this.provinceControl.value;

      if (province) {
        this.object_code.provinceCode = province.provinceCode;
      } else {
        this.object_code.provinceCode = '';
      }

      //Huy???n
      let district = this.districtControl.value;

      if (district) {
        this.object_code.districtCode = district.districtCode;
      } else {
        this.object_code.districtCode = '';
      }

      //X??
      let ward = this.wardControl.value;

      if (ward) {
        this.object_code.wardCode = ward.wardCode;
      } else {
        this.object_code.wardCode = '';
      }

      //V??? tinh
      let satellite = this.satelliteControl.value;

      if (satellite) {
        this.object_code.satelliteCode = satellite.satelliteCode;
      } else {
        this.object_code.satelliteCode = '';
      }

      this.reBuildCode(1);
    } else {
      //M?? ????n v???
      let organizationCode = this.orgCodeControl.value;

      if (organizationCode) {
        this.object_code.organizationCode = organizationCode;
      } else {
        this.object_code.organizationCode = '';
      }

      //Khu v???c
      let geographicalArea = this.orgGeographicalAreaControl.value;

      if (geographicalArea) {
        this.object_code.geographicalAreaCode = geographicalArea.geographicalAreaCode;
      } else {
        this.object_code.geographicalAreaCode = '';
      }

      //T???nh
      let province = this.orgProvinceControl.value;

      if (province) {
        this.object_code.provinceCode = province.provinceCode;
      } else {
        this.object_code.provinceCode = '';
      }

      //Huy???n
      let district = this.orgDistrictControl.value;

      if (district) {
        this.object_code.districtCode = district.districtCode;
      } else {
        this.object_code.districtCode = '';
      }

      //X??
      let ward = this.orgWardControl.value;

      if (ward) {
        this.object_code.wardCode = ward.wardCode;
      } else {
        this.object_code.wardCode = '';
      }

      //V??? tinh
      let satellite = this.orgSatelliteControl.value;

      if (satellite) {
        this.object_code.satelliteCode = satellite.satelliteCode;
      } else {
        this.object_code.satelliteCode = '';
      }

      this.reBuildCode(2);
    }
  }

  reBuildCode(mode: number) {
    let code = '';
    let organizationCode = this.object_code.organizationCode != '' ? this.object_code.organizationCode.trim() : '';
    let geographicalAreaCode = this.object_code.geographicalAreaCode != '' ? ' - ' + this.object_code.geographicalAreaCode.trim() : '';
    let provinceCode = this.object_code.provinceCode != '' ? ' - ' + this.object_code.provinceCode.trim() : '';
    let districtCode = this.object_code.districtCode != '' ? ' - ' + this.object_code.districtCode.trim() : '';
    let wardCode = this.object_code.wardCode != '' ? ' - ' + this.object_code.wardCode.trim() : '';
    let satelliteCode = this.object_code.satelliteCode != '' ? ' - ' + this.object_code.satelliteCode.trim() : '';

    if (mode == 1) {
      code = organizationCode + geographicalAreaCode + provinceCode + districtCode + wardCode + satelliteCode;

      this.organizationOtherCodeControl.setValue(code);
    } else {
      code = organizationCode + geographicalAreaCode + provinceCode + districtCode + wardCode + satelliteCode;

      this.orgOtherCodeControl.setValue(code);
    }
  }

  /* M??? popup Th??m m???i Ph??ng ban */
  openPoupCreateOrg() {
    if (this.selectedNode) {
      this.awaitResponse = false;
      this.displayModal = true;
    } else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n ch??a ch???n v??? tr?? ph??ng ban' };
      this.showMessage(msg);
    }
  }

  /* ????ng popup Th??m m???i Ph??ng ban */
  closePopup() {
    this.displayModal = false;
    this.object_code = {
      organizationCode: '',
      geographicalAreaCode: '',
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      satelliteCode: ''
    }
    this.orgCreateForm.reset();
  }

  /* Th??m m???i ph??ng ban */
  awaitResponse: boolean = false;
  createOrg() {
    if (!this.orgCreateForm.valid) {
      Object.keys(this.orgCreateForm.controls).forEach(key => {
        if (this.orgCreateForm.controls[key].valid == false) {
          this.orgCreateForm.controls[key].markAsTouched();
        }
      });
    } else {
      let organizationName = this.orgNameControl.value;
      let organizationCode = this.orgCodeControl.value;
      let organizationPhone = this.orgPhoneControl.value;
      let organizationAddress = this.orgAddressControl.value;
      let isFinancialIndependence = this.orgFinancialIndependenceControl.value ? this.orgFinancialIndependenceControl.value : false;
      let GeographicalAreaId = this.orgGeographicalAreaControl.value ?.geographicalAreaId;
      let ProvinceId = this.orgProvinceControl.value ?.provinceId;
      let DistrictId = this.orgDistrictControl.value ?.districtId;
      let WardId = this.orgWardControl.value ?.wardId;
      let SatelliteId = this.orgSatelliteControl.value ?.satelliteId;
      let organizationOtherCode = this.orgOtherCodeControl.value;
      let level = this.selectedNode.data.level + 1;
      let parentId = this.selectedNode.data.organizationId;

      this.awaitResponse = true;
      this.organizationService.createOrganization(
        organizationName,
        organizationCode,
        organizationPhone,
        organizationAddress,
        level,
        parentId,
        isFinancialIndependence,
        GeographicalAreaId,
        ProvinceId,
        DistrictId,
        WardId,
        SatelliteId,
        organizationOtherCode,
        this.listEmployeeCreate
      ).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.closePopup();

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Th??m th??nh c??ng' };
          this.showMessage(msg);

          this.getAllOrganization();
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  /* M??? popup Th??m nh??n vi??n */
  openPopup() {
    let listEmployeeId = this.listEmployeeCreate.map(x => x.employeeId);

    let ref = this.dialogService.open(ChonNvDialogComponent, {
      data: {
        listEmployeeId: listEmployeeId
      },
      header: 'Ch???n nh??n vi??n',
      width: '60%',
      baseZIndex: 10001,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result ?.length > 0) {
          let listId: Array<string> = result.map(x => x.employeeId);

          //L???y ra c??c nh??n vi??n ???? ???????c th??m
          let listOld = this.listEmployeeCreate.filter(x => listId.includes(x.employeeId));

          //L???y ra list c??c nh??n vi??n ???????c ch???n m???i
          let listOldId = listOld.map(x => x.employeeId);
          let listNewId = listId.filter(x => !listOldId.includes(x));

          //Th??m c??c nh??n m???i m???i ???????c ch???n v??o grid
          listNewId.forEach(id => {
            let newItem = new ThanhVienPhongBan();
            newItem.employeeId = id;
            newItem.isManager = 0;
            newItem.employeeCodeName = result.find(x => x.employeeId == id).employeeCodeName;

            listOld = [...listOld, newItem];
          });

          this.listEmployeeCreate = listOld;
        }
        else {
          this.listEmployeeCreate = [];
        }
      }
    });
  }

  xoaNhanVienNew(rowData: ThanhVienPhongBan) {
    this.listEmployeeCreate = this.listEmployeeCreate.filter(x => x != rowData);
  }

  xoaNhanVienEdit(rowData: ThanhVienPhongBan) {
    //N???u ???? l??u tr??n db
    if (rowData.id) {
      //Ki???m tra xem Nh??n vi??n c?? c??n g???n v???i ph??ng ban n??o kh??ng?
      this.organizationService.deleteNhanVienThuocDonVi(rowData.id).subscribe(res => {
        let result: any = res;
        if (result.statusCode == 200) {
          this.listEmployeeEdit = this.listEmployeeEdit.filter(x => x != rowData);
        }
        else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
    else {
      this.listEmployeeEdit = this.listEmployeeEdit.filter(x => x != rowData);
    }
  }

  openPopupEdit() {
    let listEmployeeId = this.listEmployeeEdit.map(x => x.employeeId);

    let ref = this.dialogService.open(ChonNvDialogComponent, {
      data: {
        listEmployeeId: listEmployeeId
      },
      header: 'Ch???n nh??n vi??n',
      width: '60%',
      baseZIndex: 10001,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result ?.length > 0) {
          let listId: Array<string> = result.map(x => x.employeeId);

          //L???y ra c??c nh??n vi??n ???? ???????c th??m
          let listOld = this.listEmployeeEdit.filter(x => listId.includes(x.employeeId));

          //L???y ra list c??c nh??n vi??n ???????c ch???n m???i
          let listOldId = listOld.map(x => x.employeeId);
          let listNewId = listId.filter(x => !listOldId.includes(x));

          //Th??m c??c nh??n m???i m???i ???????c ch???n v??o grid
          listNewId.forEach(id => {
            let newItem = new ThanhVienPhongBan();
            newItem.employeeId = id;
            newItem.isManager = 0;
            newItem.employeeCodeName = result.find(x => x.employeeId == id).employeeCodeName;

            listOld = [...listOld, newItem];
          });

          this.listEmployeeEdit = listOld;
        }
        else {
          this.listEmployeeEdit = [];
        }
      }
    });
  }

  /*Event thay ?????i T???nh/Th??nh ph??? */
  changeProvince(mode: number) {
    if (mode == 1) {
      let toSelectedProvince = this.provinceControl.value;
      this.districtControl.setValue(null);
      this.wardControl.setValue(null);
      if (toSelectedProvince) {
        this.listCurrentDistrict = this.listDistrict.filter(x => x.provinceId == toSelectedProvince.provinceId);
        this.listCurrentWard = [];
      } else {
        this.listCurrentDistrict = [];
        this.listCurrentWard = [];
      }

      this.changeCode(1);
    } else {
      let toSelectedProvince = this.orgProvinceControl.value;
      this.orgDistrictControl.setValue(null);
      this.orgWardControl.setValue(null);
      if (toSelectedProvince) {
        this.listCreCurrentDistrict = this.listDistrict.filter(x => x.provinceId == toSelectedProvince.provinceId);
        this.listCreCurrentWard = [];
      } else {
        this.listCreCurrentDistrict = [];
        this.listCreCurrentWard = [];
      }

      this.changeCode(2);
    }
  }

  /*Event thay ?????i Qu???n/Huy???n */
  changeDistrict(mode: number) {
    if (mode == 1) {
      let toSelectedDistrict = this.districtControl.value;
      this.wardControl.setValue(null);
      if (toSelectedDistrict) {
        this.listCurrentWard = this.listWard.filter(x => x.districtId == toSelectedDistrict.districtId);
      } else {
        this.listCurrentWard = [];
      }

      this.changeCode(1);
    } else {
      let toSelectedDistrict = this.orgDistrictControl.value;
      this.orgWardControl.setValue(null);
      if (toSelectedDistrict) {
        this.listCreCurrentWard = this.listWard.filter(x => x.districtId == toSelectedDistrict.districtId);
      } else {
        this.listCreCurrentWard = [];
      }

      this.changeCode(2);
    }
  }
}
