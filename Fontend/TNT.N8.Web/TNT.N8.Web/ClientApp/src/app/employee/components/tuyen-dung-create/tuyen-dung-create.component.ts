import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ImageUploadService } from '../../../../app/shared/services/imageupload.service';
import { Vacancies } from '../../models/recruitment-vacancies.model';
import { EmployeeService } from '../../services/employee.service';
import { GetPermission } from '../../../shared/permission/get-permission';

class EmployeeModel {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeCodeName: string;
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeCodeName: string;
  isManager: boolean;
  positionId: string;
  organizationId: string;
}

class FileInFolder {
  fileInFolderId: string;
  folderId: string;
  fileName: string;
  objectId: string;
  objectType: string;
  size: string;
  active: boolean;
  fileExtension: string;
  createdById: string;
  createdDate: Date;
  uploadByName: string;
}

class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}

@Component({
  selector: 'app-tuyen-dung-create',
  templateUrl: './tuyen-dung-create.component.html',
  styleUrls: ['./tuyen-dung-create.component.css']
})
export class TuyenDungCreateComponent implements OnInit {

  loading: boolean = false;
  today: Date = new Date();
  statusCode: string = null;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  currentEmployeeCodeName = localStorage.getItem('EmployeeCodeName');

  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  selectedChienDich: any = null;

  // Danh sach
  listPhuTrachViTriTuyenDung: Array<EmployeeModel> = [];
  listKinhNghiem: Array<any> = [];
  listMucUuTien: Array<any> = [
    {
      name: 'Cao',
      value: 1,
    },
    {
      name: 'Trung b??nh',
      value: 2,
    },
    {
      name: 'Th???p',
      value: 3,
    },
  ];
  listLoaiTienTe: Array<any> = [
    {
      name: 'VND',
      value: 'VND',
    },
    {
      name: 'USD',
      value: 'USD',
    },
  ];
  listLoaiCongViec: Array<any> = []
  listKieuLuong: Array<any> = [
    {
      name: 'Trong kho???ng',
      value: 1,
    },
    {
      name: 'Th???a thu???n',
      value: 2,
    },
  ]

  // T??i li???u li??n quan
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  colsFile: any[];

  // FORM
  thongTinChiTietVTTD: FormGroup;
  thongTinViTriTuyenDungFormGroup: FormGroup;
  tenViTriTuyenDungFormControl: FormControl;
  soLuongFormControl: FormControl;
  mucUuTienFormControl: FormControl;
  nguoiPhuTrachFormControl: FormControl;
  loaiCongViecFormControl: FormControl;
  noiLamViecFormControl: FormControl;
  kinhNghiemFormControl: FormControl;
  loaiTienTeFormControl: FormControl;
  kieuLuongFormControl: FormControl;
  tuFormControl: FormControl;
  denFormControl: FormControl;
  viTriTuyenDungFormControl: FormControl;
  yeuCauChuyenMonFormControl: FormControl;
  quyenLoiUngVienFormControl: FormControl;

  // Danh s??ch chi???n d???ch tuy???n d???ng
  listChienDich: Array<any> = [];

  /*Valid Form*/
  isInvalidForm: boolean = false;
  isFromTo: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  /*End*/
  /*Get Current EmployeeId*/
  auth = JSON.parse(localStorage.getItem('auth'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  /*End*/
  isValidChienDich: boolean = false;
  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i
  soLuong: number = 0;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private employeeService: EmployeeService,
    private imageService: ImageUploadService,
    private getPermission: GetPermission,
    private def: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    let resource = "hrm/employee/tao-cong-viec-tuyen-dung/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p' };
      this.showMessage(msg);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;

      if (listCurrentActionResource.indexOf("view") == -1) {
        this.router.navigate(['/home']);
      }

      this.getMasterdata();
    }
  }

  setTable() {
    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', type: 'string' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', type: 'number' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right', type: 'date' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', type: 'string' },
    ];
  }

  async getMasterdata() {
    this.loading = true;

    let result: any = await this.employeeService.getMasterDataVacanciesCreate();
    if (result.statusCode == 200) {
      this.listPhuTrachViTriTuyenDung = result.listEmployee;
      this.listChienDich = result.listEmployeeRecruit;
      this.listKinhNghiem = result.listKinhNghiem;
      this.listLoaiCongViec = result.listLoaiCV;
      this.loading = false;
    }
    else
      this.loading = false;
  }

  setForm() {
    this.tenViTriTuyenDungFormControl = new FormControl(null, [Validators.required]);
    this.soLuongFormControl = new FormControl(null, [Validators.required]);
    this.mucUuTienFormControl = new FormControl(null, [Validators.required]);
    this.nguoiPhuTrachFormControl = new FormControl(null);
    this.loaiCongViecFormControl = new FormControl(null);
    this.noiLamViecFormControl = new FormControl(null);
    this.kinhNghiemFormControl = new FormControl(null);
    this.loaiTienTeFormControl = new FormControl(null);
    this.kieuLuongFormControl = new FormControl(null);
    this.tuFormControl = new FormControl(0);
    this.denFormControl = new FormControl(0);

    this.viTriTuyenDungFormControl = new FormControl(null);
    this.yeuCauChuyenMonFormControl = new FormControl(null);
    this.quyenLoiUngVienFormControl = new FormControl(null);

    this.thongTinViTriTuyenDungFormGroup = new FormGroup({
      tenViTriTuyenDungFormControl: this.tenViTriTuyenDungFormControl,
      soLuongFormControl: this.soLuongFormControl,
      mucUuTienFormControl: this.mucUuTienFormControl,
      nguoiPhuTrachFormControl: this.nguoiPhuTrachFormControl,
      loaiCongViecFormControl: this.loaiCongViecFormControl,
      noiLamViecFormControl: this.noiLamViecFormControl,
      kinhNghiemFormControl: this.kinhNghiemFormControl,
      loaiTienTeFormControl: this.loaiTienTeFormControl,
      kieuLuongFormControl: this.kieuLuongFormControl,
      tuFormControl: this.tuFormControl,
      denFormControl: this.denFormControl,
      viTriTuyenDungFormControl: this.viTriTuyenDungFormControl,
      yeuCauChuyenMonFormControl: this.yeuCauChuyenMonFormControl,
      quyenLoiUngVienFormControl: this.quyenLoiUngVienFormControl,
    });
  }

  // T???o chi???n d???ch
  btn_createVacancies(value: boolean) {
    if (this.selectedChienDich == null) {
      this.isValidChienDich = true;
    }
    else
      this.isValidChienDich = false;

    if (!this.thongTinViTriTuyenDungFormGroup.valid) {
      Object.keys(this.thongTinViTriTuyenDungFormGroup.controls).forEach(key => {
        if (this.thongTinViTriTuyenDungFormGroup.controls[key].valid == false) {
          this.thongTinViTriTuyenDungFormGroup.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
      this.isOpenNotifiError = true;  //Hi???n th??? message l???i
      this.emitStatusChangeForm = this.thongTinViTriTuyenDungFormGroup.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });
    }
    else {
      if (this.selectedChienDich == null) {
        this.isValidChienDich = true;
        this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
        this.isOpenNotifiError = true;  //Hi???n th??? message l???i
        setTimeout(() => {
          this.isValidChienDich = false;
          this.isInvalidForm = false;
          this.isOpenNotifiError = false;
        }, 4000);
      }
      else {
        if (this.soLuongFormControl.value == 0) {
          this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
          this.isOpenNotifiError = true;  //Hi???n th??? message l???i
          return;
        }
        this.isInvalidForm = false;  //Hi???n th??? icon-warning-active
        this.isOpenNotifiError = false;  //Hi???n th??? message l???i
        // File t??i li???u
        let listFileUploadModel: Array<FileUploadModel> = [];
        this.uploadedFiles.forEach(item => {
          let fileUpload: FileUploadModel = new FileUploadModel();
          fileUpload.FileInFolder = new FileInFolder();
          fileUpload.FileInFolder.active = true;
          let index = item.name.lastIndexOf(".");
          let name = item.name.substring(0, index);
          fileUpload.FileInFolder.fileName = name;
          fileUpload.FileInFolder.fileExtension = item.name.substring(index + 1);
          fileUpload.FileInFolder.size = item.size;
          fileUpload.FileInFolder.objectId = '';
          fileUpload.FileInFolder.objectType = 'VACANCIES';
          fileUpload.FileSave = item;
          listFileUploadModel.push(fileUpload);
        });

        /*Binding data for v??? tr?? tuy???n d???ng model*/
        let viTriTyenDung: Vacancies = this.mapDataToModel();
        this.awaitResult = false;
        //this.loading = true;
        this.createVacancies(viTriTyenDung, listFileUploadModel);
      }
    }
  }

  createVacancies(viTriTyenDung: any, listFileUploadModel: Array<FileUploadModel>) {
    this.employeeService.createVacancies(viTriTyenDung, "VACANCIES", listFileUploadModel).subscribe(response => {

      let result = <any>response;
      this.loading = false;
      if (result.statusCode == 200) {
        let messageCode = "T???o v??? tr?? chi???n d???ch th??nh c??ng";
        let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: messageCode };
        this.showMessage(mgs);

        setTimeout(() => {
          this.router.navigate(['/employee/chi-tiet-cong-viec-tuyen-dung', { vacanciesId: result.vacanciesId, recruitmentCampaignId: this.selectedChienDich.recruitmentCampaignId }]);
        }, 1000);
      } else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }

  changeSalary(event: any) {
    if (event.value.value == "1")
      this.isFromTo = true;
    else
      this.isFromTo = false;
  }
  mapDataToModel(): Vacancies {
    let viTriTD = new Vacancies();

    viTriTD.vacanciesId = this.emptyGuid;
    // M?? chi???n d???ch
    viTriTD.recruitmentCampaignId = this.selectedChienDich.recruitmentCampaignId;

    viTriTD.vacanciesName = this.tenViTriTuyenDungFormControl.value ?.trim();

    // Ng?????i ph??? tr??ch tuy???n d???ng
    let personInCharge: Employee = this.nguoiPhuTrachFormControl.value != null ? this.nguoiPhuTrachFormControl.value : null;
    if (personInCharge) {
      viTriTD.personInChargeId = personInCharge.employeeId;
    } else {
      viTriTD.personInChargeId = this.emptyGuid;
    }

    // Lo???i c??ng vi???c
    let loaiCV = this.loaiCongViecFormControl.value != null ? this.loaiCongViecFormControl.value : null;
    if (loaiCV) {
      viTriTD.typeOfWork = loaiCV.categoryId;
    } else {
      viTriTD.typeOfWork = this.emptyGuid;
    }

    // Kinh Nghi???m
    let kinhNghiem = this.kinhNghiemFormControl.value != null ? this.kinhNghiemFormControl.value : null;
    if (kinhNghiem) {
      viTriTD.experienceId = kinhNghiem.categoryId;
    } else {
      viTriTD.experienceId = this.emptyGuid;
    }

    viTriTD.quantity = this.soLuongFormControl == null ? 0 : ParseStringToFloat(this.soLuongFormControl.value);
    viTriTD.placeOfWork = this.noiLamViecFormControl.value == null ? null : this.noiLamViecFormControl.value;

    // M???c ??u ti??n
    let mucUuTien = this.mucUuTienFormControl.value != null ? this.mucUuTienFormControl.value : null;
    if (mucUuTien) {
      viTriTD.priority = mucUuTien.value;
    } else {
      viTriTD.priority = 0;
    }

    // Lo???i ti???n t???
    let loaiTien = this.loaiTienTeFormControl.value != null ? this.loaiTienTeFormControl.value : null;
    if (loaiTien) {
      viTriTD.currency = loaiTien.value;
    } else {
      viTriTD.currency = '';
    }

    // Ki???u l????ng
    viTriTD.salarType = this.kieuLuongFormControl.value != null ? this.kieuLuongFormControl.value.value : null;

    let luongTu = this.tuFormControl.value != null ? ParseStringToFloat(this.tuFormControl.value) : 0;
    viTriTD.salaryFrom = luongTu;

    let luongDen = this.denFormControl.value != null ? ParseStringToFloat(this.denFormControl.value) : 0;
    viTriTD.salaryTo = luongDen;

    viTriTD.vacanciesDes = this.viTriTuyenDungFormControl.value;

    viTriTD.professionalRequirements = this.yeuCauChuyenMonFormControl.value;

    viTriTD.candidateBenefits = this.quyenLoiUngVienFormControl.value;

    return viTriTD;
  }

  // Upload file to server
  uploadFiles(files: File[]) {
    this.imageService.uploadFile(files).subscribe(response => { });
  }

  goBackToList() {
    this.router.navigate(['/employee/danh-sach-cong-viec-tuyen-dung']);
  }

  create(isSaveNew) {
    this.router.navigate(['/employee/chi-tiet-cong-viec-tuyen-dung']);
  }

  changeFromMoney() {
    /*B???t validator ki???m tra Gi?? s???n ph???m*/
    this.tuFormControl.setValidators([compareNumberValidator(ParseStringToFloat(this.denFormControl.value))]);
    this.tuFormControl.updateValueAndValidity();

    this.denFormControl.clearValidators();
    this.denFormControl.updateValueAndValidity();
    this.def.detectChanges();
  }

  changeToMoney() {
    this.denFormControl.setValidators([compareNumberValidatorLess(ParseStringToFloat(this.tuFormControl.value))]);
    this.denFormControl.updateValueAndValidity();

    this.tuFormControl.clearValidators();
    this.tuFormControl.updateValueAndValidity();

    this.def.detectChanges();
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

  /*Event khi x??a 1 file ???? l??u tr??n server*/
  deleteFile(file: any) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        let index = this.arrayDocumentModel.indexOf(file);
        this.arrayDocumentModel.splice(index, 1);
      }
    });
  }

  /*Event upload list file*/
  /*Event upload list file*/
  myUploader(event: any) {
    // let listFileUploadModel: Array<FileUploadModel> = [];
    // this.uploadedFiles.forEach(item => {
    //   let fileUpload: FileUploadModel = new FileUploadModel();
    //   fileUpload.FileInFolder = new FileInFolder();
    //   fileUpload.FileInFolder.active = true;
    //   let index = item.name.lastIndexOf(".");
    //   let name = item.name.substring(0, index);
    //   fileUpload.FileInFolder.fileName = name;
    //   fileUpload.FileInFolder.fileExtension = item.name.substring(index, item.name.length - index);
    //   fileUpload.FileInFolder.size = item.size;
    //   fileUpload.FileInFolder.objectId = this.contractId;
    //   fileUpload.FileInFolder.objectType = 'QLHD';
    //   fileUpload.FileSave = item;
    //   listFileUploadModel.push(fileUpload);
    // });

    // this.contractService.uploadFile("QLHD", listFileUploadModel, this.contractId).subscribe(response => {
    //   let result: any = response;
    //   this.loading = false;
    //   if (result.statusCode == 200) {
    //     this.uploadedFiles = [];
    //     if (this.fileUpload) {
    //       this.fileUpload.clear();  //X??a to??n b??? file trong control
    //     }

    //     this.listFile = result.listFileInFolder;

    //     let msg = { severity: 'success', summary: 'Th??ng b??o', detail: "Th??m file th??nh c??ng" };
    //     this.showMessage(msg);
    //   } else {
    //     let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
    //     this.showMessage(msg);
    //   }
    // });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }
  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }
}
function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
function ParseStringToFloat(str: string) {
  if (str === "" || str == null) return 0;
  str = str.toString().replace(/,/g, '');
  return parseFloat(str);
}
//So s??nh gi?? tr??? nh???p v??o v???i m???t gi?? tr??? x??c ?????nh
function compareNumberValidator(number: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (parseFloat(control.value.replace(/,/g, '')) >= number)) {
      return { 'numberInvalid': true };
    }
    return null;
  };
}

//So s??nh gi?? tr??? nh???p v??o v???i m???t gi?? tr??? x??c ?????nh
function compareNumberValidatorLess(number: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (parseFloat(control.value.replace(/,/g, '')) < number)) {
      return { 'numberInvalid': true };
    }
    return null;
  };
}
