import { Component, OnInit, ElementRef, HostListener, ViewChild, Renderer2, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ContactModel } from '../../../../shared/models/contact.model';
import { UserModel } from '../../../../shared/models/user.model';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { OrganizationService } from '../../../../shared/services/organization.service';
import { PositionService } from '../../../../shared/services/position.service';
import { EmployeeService } from '../../../services/employee.service';
import { EmailConfigService } from '../../../../admin/services/email-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HandleFileService } from './../../../../shared/services/handleFile.service';
import { FormatDateService } from './../../../../shared/services/formatDate.services';
import { ValidaytorsService } from './../../../../shared/services/validaytors.service';

import { CreateEmployeeModel } from '../../../models/employee.model';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { DialogService } from 'primeng/dynamicdialog';

import { MessageService } from 'primeng/api';
import { ChonNhieuDvDialogComponent } from './../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';

@Component({
  selector: 'app-employee-create',
  templateUrl: './employee-create.component.html',
  styleUrls: ['./employee-create.component.css']
})
export class EmployeeCreateComponent implements OnInit, AfterViewChecked {
  /*Khai bao bien*/
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  password: string = this.systemParameterList.find(x => x.systemKey == "DefaultUserPassword").systemValueString;
  isManager: boolean = null;
  employeeId: string = null;
  currentOrganizationId: string = '';

  loading: boolean = false;
  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i

  submitted: boolean = false;
  listOrganization: Array<any> = [];
  listPosition: Array<any> = [];
  genders = [{
    value: 'NAM', viewValue: 'Nam'
  },
  {
    value: 'NU', viewValue: 'N???'
  }];

  error: any = {
    EmployeeCode: '',
    IsAccessable: '',
    FirstName: '',
    LastName: '',
    TenTiengAnh: '',
    Gender: '',
    DateOfBirth: '',
    QuocTich: '',
    DanToc: '',
    TonGiao: '',
    OrganizationId: '',
    StartedDate: '',
    PositionId: '',
    ViTriLamViec: '',
    Phone: '',
    OtherPhone: '',
    WorkPhone: '',
    Email: '',
    WorkEmail: '',
  }

  defaultLimitedFileSize = parseInt(this.systemParameterList.find(x => x.systemKey == "LimitedFileSize").systemValueString) * 1000000; //1MB = 1000000 byte
  uploadedFiles = [];
  currentLogoUrl: any = '/assets/images/no-avatar.png';
  newLogoUrl: any = null;
  extLogo: any = null;

  roles: Array<string> = [];
  isAccessable: Boolean = true;
  toastMessage: string;
  empAccountList: Array<any> = [];
  empIdentityList: Array<any> = [];
  orgNameDisplay: string;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  employeeModel = new CreateEmployeeModel()
  contactModel = new ContactModel()
  userModel: UserModel = {
    UserId: this.emptyGuid,
    Password: this.password,
    UserName: '',
    EmployeeCode: '',
    EmployeeId: '',
    Disabled: false,
    CreatedById: 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA',
    CreatedDate: new Date(),
    UpdatedById: null,
    UpdatedDate: null,
    Active: true
  };

  createEmpForm: FormGroup;
  actionAdd: boolean = true;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  /*Ket thuc*/

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  fixed: boolean = false;
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageXOffset;
    if (num > 100) {
      this.fixed = true;
    } else {
      this.fixed = false;
    }
  }

  listDonVi: Array<any> = [];
  listSelectedDonVi: Array<any> = [];

  /*Khai bao contructor*/
  constructor(private translate: TranslateService,
    private getPermission: GetPermission,
    private organizationService: OrganizationService,
    private positionService: PositionService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    public builder: FormBuilder,
    private emailConfigService: EmailConfigService,
    private renderer: Renderer2,
    private messageService: MessageService,
    public dialogService: DialogService,
    public changeRef: ChangeDetectorRef,
    private handleFileService: HandleFileService,
    private domSanitizer: DomSanitizer,
    private formatDateService: FormatDateService,
    private validaytorsService: ValidaytorsService
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
        if (!this.toggleButton.nativeElement.contains(e.target) &&
          !this.notifi.nativeElement.contains(e.target) &&
          !this.save.nativeElement.contains(e.target) &&
          !this.saveAndCreate.nativeElement.contains(e.target)) {
          this.isOpenNotifiError = false;
        }
      }
    });
    translate.setDefaultLang('vi');
  }
  /*Ket thuc*/

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Notification:', detail: detail };
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  /*Function chay khi page load*/
  async ngOnInit() {
    this.initForm();
    let resource = "hrm/employee/create/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.showMessage('warn', 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???');
      this.router.navigate(['/home']);
    }
    else {
      this.getMasterDataEmployeeDetail();

      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      this.isManager = localStorage.getItem('IsManager') === "true" ? true : false;
      this.employeeId = JSON.parse(localStorage.getItem('auth')).EmployeeId;

      // let result: any = await this.organizationService.getOrganizationByEmployeeId(this.employeeId);
      // this.currentOrganizationId = result.organization.organizationId;

      // this.contactModel.Gender = 'NAM';
      // this.organizationService.getAllOrganization().subscribe(response => {
      //   let result = <any>response;
      //   this.listDonVi = result.listAll;
      // });

      // this.positionService.getAllPosition().subscribe(response => {
      //   let result = <any>response;
      //   this.roles = result.listPosition;
      // });

      // await this.getAllEmpAccount();
      // await this.getAllEmpIdentity();
    }
  }

  async getMasterDataEmployeeDetail() {
    try {
      this.loading = true;
      let result: any = await this.employeeService.getMasterDataEmployeeDetail();
      this.loading = false;

      if (result.statusCode == 200) {
        this.listOrganization = result.listOrganization;
        this.listPosition = result.listPosition;
      }
      else {
        this.showMessage('error', result.messageCode);
      }
    }
    catch (e) {
      this.loading = false;
      this.showMessage('error', e);
    }
  }

  initForm() {
    let emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';
    this.createEmpForm = new FormGroup({
      EmployeeCode: new FormControl('', [Validators.required, Validators.pattern(this.validaytorsService.regex.username), checkDuplicateUsername(this.empAccountList), Validators.maxLength(250), forbiddenSpaceText]),
      IsAccessable: new FormControl('true'),
      FirstName: new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]),
      LastName: new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]),
      TenTiengAnh: new FormControl('', [Validators.maxLength(250), forbiddenSpaceText]),
      Gender: new FormControl('NAM'),
      DateOfBirth: new FormControl('', [Validators.required]),
      QuocTich: new FormControl('', [Validators.required, forbiddenSpaceText]),
      DanToc: new FormControl('', [Validators.required, forbiddenSpaceText]),
      TonGiao: new FormControl('', [Validators.required, forbiddenSpaceText]),
      OrganizationId: new FormControl({ value: null, disabled: true }, [Validators.required]),
      StartedDate: new FormControl({ value: null, disabled: true }),
      PositionId: new FormControl({ value: null, disabled: true }),
      ViTriLamViec: new FormControl(''),
      Phone: new FormControl('', [Validators.required, Validators.pattern(this.getPhonePattern())]),
      OtherPhone: new FormControl('', [Validators.pattern(this.getPhonePattern())]),
      WorkPhone: new FormControl('', [Validators.pattern(this.getPhonePattern())]),
      Email: new FormControl('', [Validators.required, Validators.pattern(emailPattern)]),
      WorkEmail: new FormControl('', [Validators.required, Validators.pattern(emailPattern)])
    });
  }
  /*Ket thuc*/

  /*Quay tro lai Employee List*/
  goBack() {
    this.router.navigate(['/employee/list']);
  }
  /*Ket thuc*/

  uploadImage() {
    document.getElementById('imageProfile').click();
  }

  transform(url) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  changeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async handleFileUpload(event) {
    if (event.target.files.length > 0) {
      if (event.target.files[0].size > this.defaultLimitedFileSize) {
        this.showMessage('error', 'K??ch th?????c ???nh qu?? l???n');
        return;
      }
      this.newLogoUrl = await this.changeFile(event.target.files[0]);
      let index = event.target.files[0].name.lastIndexOf('.');
      this.extLogo = event.target.files[0].name.substring(index + 1);

      this.changeRef.detectChanges();
      setTimeout(() => {
        this.currentLogoUrl = this.newLogoUrl;
        this.uploadedFiles = this.handleFileService.convertFileName(event.target);
      }, 500)
    }
    else {
      this.currentLogoUrl = '/assets/images/no-avatar.png';
    }
  }

  setValueForRequiredHidden() {
    if (this.createEmpForm.get('TenTiengAnh').value == null || this.createEmpForm.get('TenTiengAnh').value == undefined || this.createEmpForm.get('TenTiengAnh').value == '') {
      this.createEmpForm.get('TenTiengAnh').setValue('TTA_Default');
    }
    if (this.createEmpForm.get('DateOfBirth').value == null || this.createEmpForm.get('DateOfBirth').value == undefined || this.createEmpForm.get('DateOfBirth').value == '') {
      this.createEmpForm.get('DateOfBirth').setValue(new Date());
    }
    if (this.createEmpForm.get('QuocTich').value == null || this.createEmpForm.get('QuocTich').value == undefined || this.createEmpForm.get('QuocTich').value == '') {
      this.createEmpForm.get('QuocTich').setValue('QT_Default');
    }
    if (this.createEmpForm.get('DanToc').value == null || this.createEmpForm.get('DanToc').value == undefined || this.createEmpForm.get('DanToc').value == '') {
      this.createEmpForm.get('DanToc').setValue('DT_Default');
    }
    if (this.createEmpForm.get('TonGiao').value == null || this.createEmpForm.get('TonGiao').value == undefined || this.createEmpForm.get('TonGiao').value == '') {
      this.createEmpForm.get('TonGiao').setValue('TG_Default');
    }
    if (this.createEmpForm.get('StartedDate').value == null || this.createEmpForm.get('StartedDate').value == undefined || this.createEmpForm.get('StartedDate').value == '') {
      this.createEmpForm.get('StartedDate').setValue(new Date());
    }
    if (this.createEmpForm.get('ViTriLamViec').value == null || this.createEmpForm.get('ViTriLamViec').value == undefined || this.createEmpForm.get('ViTriLamViec').value == '') {
      this.createEmpForm.get('ViTriLamViec').setValue('VTLV_Default');
    }
    if (this.createEmpForm.get('PositionId').value == null || this.createEmpForm.get('PositionId').value == undefined || this.createEmpForm.get('PositionId').value == '') {
      this.createEmpForm.get('PositionId').setValue(this.listPosition[0]);
    }
  }

  /*Tao Employee moi*/
  @HostListener('submit', ['$event'])
  createEmployee(value: boolean) {
    this.submitted = true;

    let OrganizationId = this.createEmpForm.get('OrganizationId').value;
    this.setValueForRequiredHidden();
    if (!this.createEmpForm.valid || !OrganizationId) {
      if (this.createEmpForm.get('EmployeeCode').errors?.required || this.createEmpForm.get('EmployeeCode').errors?.forbiddenSpaceText) {
        this.error['EmployeeCode'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('EmployeeCode').hasError('duplicateCode')) {
        this.error['EmployeeCode'] = 'M?? nh??n vi??n ???? t???n t???i';
      } else if (this.createEmpForm.get('EmployeeCode').errors?.maxlength) {
        this.error['EmployeeCode'] = 'Kh??ng v?????t qu?? 250 k?? t???';
      } else if (this.createEmpForm.get('EmployeeCode').errors?.pattern) {
        this.error['EmployeeCode'] = 'M?? nh??n vi??n kh??ng ????ng ?????nh d???ng';
      }


      if (this.createEmpForm.get('FirstName').errors?.required || this.createEmpForm.get('FirstName').errors?.forbiddenSpaceText) {
        this.error['FirstName'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('FirstName').errors?.maxlength) {
        this.error['FirstName'] = 'Kh??ng v?????t qu?? 250 k?? t???';
      }

      if (this.createEmpForm.get('LastName').errors?.required || this.createEmpForm.get('LastName').errors?.forbiddenSpaceText) {
        this.error['LastName'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('LastName').errors?.maxlength) {
        this.error['LastName'] = 'Kh??ng v?????t qu?? 250 k?? t???';
      }

      if (this.createEmpForm.get('TenTiengAnh').errors?.required || this.createEmpForm.get('TenTiengAnh').errors?.forbiddenSpaceText) {
        this.error['TenTiengAnh'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('TenTiengAnh').errors?.maxlength) {
        this.error['TenTiengAnh'] = 'Kh??ng v?????t qu?? 250 k?? t???';
      }

      if (this.createEmpForm.get('DateOfBirth').errors?.required) {
        this.error['DateOfBirth'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.createEmpForm.get('QuocTich').errors?.required || this.createEmpForm.get('QuocTich').errors?.forbiddenSpaceText) {
        this.error['QuocTich'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.createEmpForm.get('DanToc').errors?.required || this.createEmpForm.get('DanToc').errors?.forbiddenSpaceText) {
        this.error['DanToc'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.createEmpForm.get('TonGiao').errors?.required || this.createEmpForm.get('TonGiao').errors?.forbiddenSpaceText) {
        this.error['TonGiao'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.createEmpForm.get('StartedDate').errors?.required) {
        this.error['StartedDate'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.createEmpForm.get('PositionId').errors?.required) {
        this.error['PositionId'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.createEmpForm.get('Phone').errors?.required) {
        this.error['Phone'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('Phone').errors?.pattern) {
        this.error['Phone'] = 'Kh??ng ????ng ?????nh d???ng';
      }

      if (this.createEmpForm.get('OtherPhone').errors?.pattern) {
        this.error['OtherPhone'] = 'Kh??ng ????ng ?????nh d???ng';
      }

      if (this.createEmpForm.get('WorkPhone').errors?.pattern) {
        this.error['WorkPhone'] = 'Kh??ng ????ng ?????nh d???ng';
      }

      if (this.createEmpForm.get('Email').errors?.required) {
        this.error['Email'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('Email').errors?.pattern) {
        this.error['Email'] = 'Kh??ng ????ng ?????nh d???ng';
      }

      if (this.createEmpForm.get('WorkEmail').errors?.required) {
        this.error['WorkEmail'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.createEmpForm.get('WorkEmail').errors?.pattern) {
        this.error['WorkEmail'] = 'Kh??ng ????ng ?????nh d???ng';
      }

      if (!OrganizationId) {
        this.error['OrganizationId'] = 'Kh??ng ???????c ????? tr???ng';
        return;
      } else {
        this.error['OrganizationId'] = null;
      }

      return;
    } else {
      let data = this.createEmpForm.value;
      // L???y gi?? tr??? cho employee model
      this.employeeModel.HoTenTiengAnh = data.TenTiengAnh?.trim();
      this.employeeModel.QuocTich = data.QuocTich.trim();
      this.employeeModel.DanToc = data.DanToc.trim();
      this.employeeModel.TonGiao = data.TonGiao.trim();
      // this.employeeModel.StartDateMayChamCong = data.StartedDate ? this.formatDateService.convertToUTCTime(data.StartedDate) : null;
      // this.employeeModel.PositionId = data.PositionId ?.positionId;
      this.employeeModel.CreatedDate = new Date();
      this.employeeModel.ViTriLamViec = data.ViTriLamViec?.trim();
      this.isAccessable = data.IsAccessable == 'true' ? true : false;
      this.employeeModel.EmployeeCode = data.EmployeeCode?.trim();

      // L???y gi?? tr??? cho contact employee
      this.contactModel.ContactId = this.emptyGuid;
      this.contactModel.ObjectId = this.emptyGuid;
      this.contactModel.FirstName = data.FirstName.trim();
      this.contactModel.LastName = data.LastName.trim();
      this.contactModel.Gender = data.Gender.trim();
      this.contactModel.DateOfBirth = data.DateOfBirth ? this.formatDateService.convertToUTCTime(data.DateOfBirth) : null;
      this.contactModel.Phone = data.Phone.trim();
      this.contactModel.OtherPhone = data.OtherPhone.trim();
      this.contactModel.WorkPhone = data.WorkPhone.trim();
      this.contactModel.Email = data.Email.trim();
      this.contactModel.WorkEmail = data.WorkEmail.trim();

      this.userModel.EmployeeCode = data.EmployeeCode.trim();

      //List Ph??ng ban
      let listPhongBanId = this.listSelectedDonVi.map(item => item.organizationId);

      //file image avatar
      let firstIndexOf = this.newLogoUrl ? this.newLogoUrl.indexOf(",") : null;
      let imageBase64 = firstIndexOf ? this.newLogoUrl.substring(firstIndexOf + 1) : null;
      let fileBase64 = {
        "Extension": this.extLogo, /*?????nh d???ng ???nh (jpg, png,...)*/
        "Base64": imageBase64 /*?????nh d???ng base64 c???a ???nh*/
      }

      this.loading = true;
      this.awaitResult = true;
      this.employeeService.createEmployee(this.employeeModel, this.contactModel, this.userModel, this.isAccessable, listPhongBanId, false, fileBase64).subscribe(response => {
        let result = <any>response;
        this.loading = false;
        if (result.statusCode === 202 || result.statusCode === 200) {
          this.showMessage("success", "T???o nh??n vi??n th??nh c??ng");

          //L??u v?? th??m m???i
          if (value) {
            this.resetFieldValue();
            this.awaitResult = false;
          }
          //L??u
          else {
            this.resetFieldValue();
            this.router.navigate(['/employee/detail', { employeeId: result.employeeId, contactId: result.contactId }]);
            this.awaitResult = false;
          }
        }
        else {
          this.showMessage('error', result.messageCode);
          this.awaitResult = false;
        };
      });
    }
  }
  /*Ket thuc*/

  khoiTaoWorkEmail() {
    let hoTenDemConTrol = this.createEmpForm.get('FirstName').value;
    let tenControl = this.createEmpForm.get('LastName').value;
    let hoTenDem = hoTenDemConTrol ? this.convert_vi_to_en(hoTenDemConTrol) : "";
    let ten = tenControl ? this.convert_vi_to_en(tenControl) : "";
    var workEmail = ten + hoTenDem + "@loft3di.com.vn";
    workEmail = workEmail.split(" ").join("");
    this.createEmpForm.get('WorkEmail').setValue(workEmail);
  }

  convert_vi_to_en(str) {
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "a");
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, "e");
    str = str.replace(/??|??|???|???|??/g, "i");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "o");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, "u");
    str = str.replace(/???|??|???|???|???/g, "y");
    str = str.replace(/??/g, "d");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "A");
    str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, "E");
    str = str.replace(/??|??|???|???|??/g, "I");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "O");
    str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, "U");
    str = str.replace(/???|??|???|???|???/g, "Y");
    str = str.replace(/??/g, "D");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/  +/g, ' ');
    return str;
  }

  openOrgPopup() {
    let listSelectedId = this.listSelectedDonVi.map(item => item.organizationId);
    let selectedId = null;
    if (listSelectedId.length > 0) {
      selectedId = listSelectedId[0]
    }

    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 2,
        selectedId: selectedId
      },
      header: 'Ch???n ????n v???',
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
          this.listSelectedDonVi = result;
          let listSelectedTenDonVi = this.listSelectedDonVi.map(x => x.organizationName);
          this.createEmpForm.controls.OrganizationId.patchValue(listSelectedTenDonVi);
          this.error['OrganizationId'] = null;
        }
        else {
          this.listSelectedDonVi = [];
          this.createEmpForm.controls.OrganizationId.patchValue(null);
          this.error['OrganizationId'] = 'Kh??ng ???????c ????? tr???ng';
        }
      }
    });
  }

  //Function reset to??n b??? c??c value ???? nh???p tr??n form
  resetFieldValue() {
    // this.listSelectedDonVi = [];
    // this.createEmpForm.reset();
    // this.employeeModel.PositionId = '';
    // this.employeeModel.OrganizationId = '';
    // this.contactModel.Gender = 'NAM';
    // this.isAccessable = true;
    // this.createEmpForm.controls['formPositionId'].setValue('');
    // this.createEmpForm.controls['formOrganizationId'].setValue([]);
    // this.createEmpForm.controls['formGender'].setValue(this.genders[0]);
    // this.createEmpForm.controls['formIsAccess'].setValue(true);
  }
  //K???t th??c

  /*Function lay ra toan bo Employee Account de check Account trung lap*/
  async getAllEmpAccount() {
    var result: any = await this.employeeService.getAllEmpAccount();
    this.empAccountList = result.empAccountList;
  }
  /*Ket thuc*/

  /*Function lay ra toan bo Employee Account de check Account trung lap*/
  async getAllEmpIdentity() {
    var result: any = await this.employeeService.getAllEmpIdentity(this.emptyGuid);
    this.empIdentityList = result.empIdentityList;
  }

  /*Ket thuc*/
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

  cancel() {
    this.router.navigate(['/employee/dashboard']);
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  ngAfterViewChecked() {
    this.changeRef.detectChanges();
  }
}

function checkDuplicateUsername(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value != undefined) {
      if (array.indexOf(control.value.toLowerCase()) !== -1 && control.value.toLowerCase() !== "") {
        return { 'checkDuplicateUsername': true };
      }
      return null;
    }
  }
}

function checkDuplicateIdentity(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value != undefined) {
      if (array.indexOf(control.value.toLowerCase()) !== -1 && control.value.toLowerCase() !== "") {
        return { 'checkDuplicateIdentity': true };
      }
      return null;
    }
  }
}

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
}
