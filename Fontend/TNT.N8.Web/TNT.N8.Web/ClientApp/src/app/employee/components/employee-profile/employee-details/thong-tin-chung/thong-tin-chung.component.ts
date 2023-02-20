import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Time, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogService } from 'primeng/dynamicdialog';

import { EmployeeService } from './../../../../services/employee.service';
import { HandleFileService } from './../../../../../shared/services/handleFile.service';
import { FormatDateService } from './../../../../../shared/services/formatDate.services';
import { DataService } from './../../../../../shared/services/data.service';
import { CommonService } from '../../../../../shared/services/common.service';

import { ChonNhieuDvDialogComponent } from './../../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';

class ThongTinChung {
  employeeId: string;
  employeeCode: string;
  avatarUrl: string;
  userName: string; //Tên đăng nhập
  trangThaiId: number;
  organizationId: string;
  organizationName: string;
  startDateMayChamCong: Date;
  quocTich: string;
  danToc: string;
  tonGiao: string;
  positionId: string;
  dateOfBirth: Date;
  phone: string;
  workPhone: string;
  otherPhone: string;
  email: string;
  workEmail: string;
  firstName: string;
  lastName: string;
  tenTiengAnh: string;
  gioiTinh: string;
  soNgayDaNghiPhep: number;
  soNgayPhepConLai: number;
  isOverviewer: boolean;
  viTriLamViec: string;
  isNhanSu: boolean;
  ngayNghiViec: Date;
}

@Component({
  selector: 'app-thong-tin-chung',
  templateUrl: './thong-tin-chung.component.html',
  styleUrls: ['./thong-tin-chung.component.css'],
  providers: [DatePipe]
})
export class ThongTinChungComponent implements OnInit {
  loading = false;
  isEdit = false;
  @Input() listPosition: Array<any>;
  @Input() actionEdit: boolean;
  @Input() employeeId: string;
  @Input() listLoaiHopDong: Array<any>;
  @Input() listOrganization: Array<any>;

  isShowButtonSua = false;

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  apiEndPoint = localStorage.getItem('ApiEndPoint');

  submitted: boolean = false;

  listGioiTinh = [
    { code: 'NAM', name: 'Nam' },
    { code: 'NU', name: 'Nữ' },
  ];

  listTrangThai = [
    {
      id: 1, text: 'Đang hoạt động - Được phép truy cập'
    },
    {
      id: 2, text: 'Đang hoạt động - Không được phép truy cập'
    },
    {
      id: 3, text: 'Ngừng hoạt động'
    }
  ];

  defaultLimitedFileSize = 2000000; //2MB
  uploadedFiles = [];
  currentLogoUrl: any = '/assets/images/no-avatar.png';
  newLogoUrl: any = null;
  extLogo: any = null;

  thongTinChung = new ThongTinChung();
  thongTinChungClone = new ThongTinChung();

  thongTinChungForm: FormGroup;

  listSelectedDonVi: Array<any> = [];

  error: any = {
    TrangThai: '',
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
    SoNgayDaNghiPhep: '',
    SoNgayPhepConLai: ''
  }

  constructor(
    public messageService: MessageService,
    public employeeService: EmployeeService,
    public datePipe: DatePipe,
    public dialogService: DialogService,
    public changeRef: ChangeDetectorRef,
    private handleFileService: HandleFileService,
    private domSanitizer: DomSanitizer,
    private formatDateService: FormatDateService,
    private dataService: DataService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    let emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';
    this.thongTinChungForm = new FormGroup({
      TrangThai: new FormControl('', [Validators.required]),
      FirstName: new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]),
      LastName: new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]),
      TenTiengAnh: new FormControl('', [Validators.maxLength(250), forbiddenSpaceText]),
      Gender: new FormControl(''),
      DateOfBirth: new FormControl('', [Validators.required]),
      QuocTich: new FormControl('', [Validators.required, forbiddenSpaceText]),
      DanToc: new FormControl('', [Validators.required, forbiddenSpaceText]),
      TonGiao: new FormControl('', [Validators.required, forbiddenSpaceText]),
      OrganizationId: new FormControl({ value: null, disabled: true }, [Validators.required]),
      StartedDate: new FormControl({ value: null, disabled: true }),
      PositionId: new FormControl({ value: null, disabled: true }),
      ViTriLamViec: new FormControl(''),
      Phone: new FormControl('', [Validators.required, Validators.pattern(this.getPhonePattern()), forbiddenSpaceText]),
      OtherPhone: new FormControl('', [Validators.pattern(this.getPhonePattern())]),
      WorkPhone: new FormControl('', [Validators.pattern(this.getPhonePattern())]),
      Email: new FormControl('', [Validators.required, Validators.pattern(emailPattern)]),
      WorkEmail: new FormControl('', [Validators.required, Validators.pattern(emailPattern)]),
      PhongVan: new FormControl(''),
      IsNhanSu: new FormControl(''),
      NgayNghiViec: new FormControl(''),
      SoNgayDaNghiPhep: new FormControl('0', [Validators.required]),
      SoNgayPhepConLai: new FormControl('0', [Validators.required]),
    });

    this.thongTinChungForm.disable();
  }

  async getThongTinChungThanhVien() {
    this.loading = true;
    let result: any = await this.employeeService.getThongTinChungThanhVien(this.employeeId);
    this.loading = false;

    if (result.statusCode == 200) {
      this.thongTinChung = result.thongTinChung;
      this.thongTinChungClone = result.thongTinChung;

      this.isShowButtonSua = result.isShowButtonSua;

      this.currentLogoUrl = this.thongTinChung.avatarUrl ? this.apiEndPoint + '/' + this.thongTinChung.avatarUrl : '/assets/images/no-avatar.png';
      this.listSelectedDonVi = this.thongTinChung.organizationId ? [{ organizationId: this.thongTinChung.organizationId, organizationName: this.thongTinChung.organizationName }] : [];

      this.mapDataToForm(this.thongTinChung);
    }
    else {
      this.showMessage('error', result.messageCode);
    }
  }

  /* Nếu Input có thay đổi */
  ngOnChanges(changes: SimpleChanges) {
    if (this.listLoaiHopDong?.length > 0) {
      this.getThongTinChungThanhVien();
    }
  }

  mapDataToForm(thongTinChung: ThongTinChung) {
    this.thongTinChungForm.setValue({
      TrangThai: thongTinChung?.trangThaiId ? this.listTrangThai.find(x => x.id == thongTinChung.trangThaiId) : null,
      FirstName: thongTinChung?.firstName ?? null,
      LastName: thongTinChung?.lastName ?? null,
      TenTiengAnh: thongTinChung?.tenTiengAnh ?? null,
      Gender: thongTinChung?.gioiTinh ?? null,
      DateOfBirth: thongTinChung?.dateOfBirth ? new Date(thongTinChung.dateOfBirth) : null,
      QuocTich: thongTinChung?.quocTich ?? null,
      DanToc: thongTinChung?.danToc ?? null,
      TonGiao: thongTinChung?.tonGiao ?? null,
      OrganizationId: thongTinChung?.organizationName ?? null,
      StartedDate: thongTinChung?.startDateMayChamCong ? new Date(thongTinChung.startDateMayChamCong) : null,
      PositionId: thongTinChung?.positionId ? this.listPosition.find(x => x.positionId == thongTinChung.positionId) : null,
      ViTriLamViec: thongTinChung?.viTriLamViec ?? null,
      Phone: thongTinChung?.phone ?? null,
      OtherPhone: thongTinChung?.otherPhone ?? null,
      WorkPhone: thongTinChung?.workPhone ?? null,
      Email: thongTinChung?.email ?? null,
      WorkEmail: thongTinChung?.workEmail ?? null,
      PhongVan: thongTinChung?.isOverviewer ?? null,
      IsNhanSu: thongTinChung?.isNhanSu ?? null,
      NgayNghiViec: thongTinChung?.ngayNghiViec ? new Date(thongTinChung.ngayNghiViec) : null,
      SoNgayDaNghiPhep: thongTinChung?.soNgayDaNghiPhep ?? 0,
      SoNgayPhepConLai: thongTinChung?.soNgayPhepConLai ?? 0,
    });

  }

  enabledForm() {
    this.isEdit = true;
    this.thongTinChungForm.enable();
    this.thongTinChungForm.get('StartedDate').disable();
    this.thongTinChungForm.get('PositionId').disable();
  }

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
        this.showMessage('error', 'Kích thước ảnh quá lớn');
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

  changeTrangThai() {
    if (this.thongTinChungForm.get('TrangThai')?.value.id == 3) {
      this.thongTinChungForm.get('NgayNghiViec').setValidators([Validators.required]);
      this.thongTinChungForm.get('NgayNghiViec').updateValueAndValidity();
    }
    else {
      this.thongTinChungForm.get('NgayNghiViec').setValidators([]);
      this.thongTinChungForm.get('NgayNghiViec').updateValueAndValidity();
    }
  }

  setValueForRequiredHidden() {
    if (this.thongTinChungForm.get('TenTiengAnh').value == null || this.thongTinChungForm.get('TenTiengAnh').value == undefined || this.thongTinChungForm.get('TenTiengAnh').value == '') {
      this.thongTinChungForm.get('TenTiengAnh').setValue('TTA_Default');
    }
    if (this.thongTinChungForm.get('DateOfBirth').value == null || this.thongTinChungForm.get('DateOfBirth').value == undefined || this.thongTinChungForm.get('DateOfBirth').value == '') {
      this.thongTinChungForm.get('DateOfBirth').setValue(new Date());
    }
    if (this.thongTinChungForm.get('QuocTich').value == null || this.thongTinChungForm.get('QuocTich').value == undefined || this.thongTinChungForm.get('QuocTich').value == '') {
      this.thongTinChungForm.get('QuocTich').setValue('QT_Default');
    }
    if (this.thongTinChungForm.get('DanToc').value == null || this.thongTinChungForm.get('DanToc').value == undefined || this.thongTinChungForm.get('DanToc').value == '') {
      this.thongTinChungForm.get('DanToc').setValue('DT_Default');
    }
    if (this.thongTinChungForm.get('TonGiao').value == null || this.thongTinChungForm.get('TonGiao').value == undefined || this.thongTinChungForm.get('TonGiao').value == '') {
      this.thongTinChungForm.get('TonGiao').setValue('TG_Default');
    }
    if (this.thongTinChungForm.get('StartedDate').value == null || this.thongTinChungForm.get('StartedDate').value == undefined || this.thongTinChungForm.get('StartedDate').value == '') {
      this.thongTinChungForm.get('StartedDate').setValue(new Date());
    }
    if (this.thongTinChungForm.get('ViTriLamViec').value == null || this.thongTinChungForm.get('ViTriLamViec').value == undefined || this.thongTinChungForm.get('ViTriLamViec').value == '') {
      this.thongTinChungForm.get('ViTriLamViec').setValue('VTLV_Default');
    }
    if (this.thongTinChungForm.get('PositionId').value == null || this.thongTinChungForm.get('PositionId').value == undefined || this.thongTinChungForm.get('PositionId').value == '') {
      this.thongTinChungForm.get('PositionId').setValue(this.listPosition[0]);
    }
  }

  async saveForm() {
    this.submitted = true;
    let OrganizationId = this.thongTinChungForm.get('OrganizationId').value;
    this.setValueForRequiredHidden();
    if (!this.thongTinChungForm.valid || !OrganizationId) {
      if (this.thongTinChungForm.get('FirstName').errors?.required || this.thongTinChungForm.get('FirstName').errors?.forbiddenSpaceText) {
        this.error['FirstName'] = 'Không được để trống';
      } else if (this.thongTinChungForm.get('FirstName').errors?.maxlength) {
        this.error['FirstName'] = 'Không vượt quá 250 kí tự';
      }

      if (this.thongTinChungForm.get('LastName').errors?.required || this.thongTinChungForm.get('LastName').errors?.forbiddenSpaceText) {
        this.error['LastName'] = 'Không được để trống';
      } else if (this.thongTinChungForm.get('LastName').errors?.maxlength) {
        this.error['LastName'] = 'Không vượt quá 250 kí tự';
      }

      if (this.thongTinChungForm.get('TenTiengAnh').errors?.required || this.thongTinChungForm.get('TenTiengAnh').errors?.forbiddenSpaceText) {
        this.error['TenTiengAnh'] = 'Không được để trống';
      } else if (this.thongTinChungForm.get('TenTiengAnh').errors?.maxlength) {
        this.error['TenTiengAnh'] = 'Không vượt quá 250 kí tự';
      }

      if (this.thongTinChungForm.get('DateOfBirth').errors?.required) {
        this.error['DateOfBirth'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('QuocTich').errors?.required || this.thongTinChungForm.get('QuocTich').errors?.forbiddenSpaceText) {
        this.error['QuocTich'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('DanToc').errors?.required || this.thongTinChungForm.get('DanToc').errors?.forbiddenSpaceText) {
        this.error['DanToc'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('TonGiao').errors?.required || this.thongTinChungForm.get('TonGiao').errors?.forbiddenSpaceText) {
        this.error['TonGiao'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('StartedDate').errors?.required) {
        this.error['StartedDate'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('PositionId').errors?.required) {
        this.error['PositionId'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('Phone').errors?.required) {
        this.error['Phone'] = 'Không được để trống';
      } else if (this.thongTinChungForm.get('Phone').errors?.pattern) {
        this.error['Phone'] = 'Không đúng định dạng';
      }

      if (this.thongTinChungForm.get('OtherPhone').errors?.pattern) {
        this.error['OtherPhone'] = 'Không đúng định dạng';
      }

      if (this.thongTinChungForm.get('WorkPhone').errors?.pattern) {
        this.error['WorkPhone'] = 'Không đúng định dạng';
      }

      if (this.thongTinChungForm.get('Email').errors?.required) {
        this.error['Email'] = 'Không được để trống';
      } else if (this.thongTinChungForm.get('Email').errors?.pattern) {
        this.error['Email'] = 'Không đúng định dạng';
      }

      if (this.thongTinChungForm.get('WorkEmail').errors?.required) {
        this.error['WorkEmail'] = 'Không được để trống';
      } else if (this.thongTinChungForm.get('WorkEmail').errors?.pattern) {
        this.error['WorkEmail'] = 'Không đúng định dạng';
      }

      if (this.thongTinChungForm.get('TrangThai').errors?.required) {
        this.error['TrangThai'] = 'Không được để trống';
      }

      if (!OrganizationId) {
        this.error['OrganizationId'] = 'Không được để trống';
      } else {
        this.error['OrganizationId'] = null;
      }

      if (this.thongTinChungForm.get('NgayNghiViec').errors?.required) {
        this.error['NgayNghiViec'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('SoNgayDaNghiPhep').errors?.required) {
        this.error['SoNgayDaNghiPhep'] = 'Không được để trống';
      }

      if (this.thongTinChungForm.get('SoNgayPhepConLai').errors?.required) {
        this.error['SoNgayPhepConLai'] = 'Không được để trống';
      }

      return;
    }

    let data = this.thongTinChungForm.value;
    // Lấy giá trị cho employee model
    let thongTinChung = {
      EmployeeId: this.employeeId,
      TenTiengAnh: data.TenTiengAnh?.trim(),
      QuocTich: data.QuocTich.trim(),
      DanToc: data.DanToc.trim(),
      TonGiao: data.TonGiao.trim(),
      StartDateMayChamCong: data.StartedDate ? this.formatDateService.convertToUTCTime(data.StartedDate) : null,
      PositionId: data.PositionId?.positionId,
      FirstName: data.FirstName.trim(),
      LastName: data.LastName.trim(),
      GioiTinh: data.Gender,
      DateOfBirth: data.DateOfBirth ? this.formatDateService.convertToUTCTime(data.DateOfBirth) : null,
      Phone: data.Phone.trim(),
      OtherPhone: data.OtherPhone?.trim(),
      WorkPhone: data.WorkPhone?.trim(),
      Email: data.Email.trim(),
      WorkEmail: data.WorkEmail.trim(),
      TrangThaiId: data.TrangThai?.id,
      IsOverviewer: data?.PhongVan,
      ViTriLamViec: data.ViTriLamViec?.trim(),
      IsNhanSu: data?.IsNhanSu,
      NgayNghiViec: data.NgayNghiViec ? this.formatDateService.convertToUTCTime(data.NgayNghiViec) : null,
      SoNgayDaNghiPhep: this.commonService.convertStringToNumber(data.SoNgayDaNghiPhep),
      SoNgayPhepConLai: this.commonService.convertStringToNumber(data.SoNgayPhepConLai)
    }

    //List Phòng ban
    let listPhongBanId = this.listSelectedDonVi.map(item => item.organizationId);

    //file image avatar
    let firstIndexOf = this.newLogoUrl ? this.newLogoUrl.indexOf(",") : null;
    let imageBase64 = firstIndexOf ? this.newLogoUrl.substring(firstIndexOf + 1) : null;
    let fileBase64 = {
      "Extension": this.extLogo, /*Định dạng ảnh (jpg, png,...)*/
      "Base64": imageBase64 /*Định dạng base64 của ảnh*/
    }
    this.loading = true;
    let result: any = await this.employeeService.saveThongTinChungThanhVien(thongTinChung, listPhongBanId, fileBase64);
    this.loading = false;

    if (result.statusCode == 200) {
      this.isEdit = false;
      this.thongTinChungForm.disable();
      this.showMessage('success', result.messageCode);
      this.getThongTinChungThanhVien();
      this.dataService.changeMessage("Update success"); //thay đổi message để call lại api getListNote trong component NoteTimeline
    }
    else {
      this.showMessage('error', result.messageCode);
    }
  }

  disabledForm() {
    this.isEdit = false;
    this.mapDataToForm(this.thongTinChungClone);
    this.thongTinChungForm.disable();
    this.error = {
      TrangThai: '',
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
      SoNgayDaNghiPhep: '',
      SoNgayPhepConLai: ''
    }
  }

  convertDateToTime(date: any) {
    if (date) {
      return this.datePipe.transform(new Date(date), 'HH:mm:ss');
    }
    else {
      return null;
    }
  }

  convertTimeToDate(time: string) {
    if (time) {
      let listTime = time.split(':');
      let hour = parseInt(listTime[0]);
      let minute = parseInt(listTime[1]);
      let second = parseInt(listTime[2]);

      let newDate = new Date();
      newDate.setHours(hour);
      newDate.setMinutes(minute);
      newDate.setSeconds(second);

      return newDate
    }
    else {
      return null;
    }
  }

  openOrgPopup() {
    if (!this.isEdit) return;
    
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
          this.listSelectedDonVi = result;
          let listSelectedTenDonVi = this.listSelectedDonVi.map(x => x.organizationName);
          this.thongTinChungForm.controls.OrganizationId.patchValue(listSelectedTenDonVi);
          this.error['OrganizationId'] = null;
        }
        else {
          this.listSelectedDonVi = [];
          this.thongTinChungForm.controls.OrganizationId.patchValue(null);
          this.error['OrganizationId'] = 'Không được để trống';
        }
      }
    });
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Thông báo:', detail: detail };
    this.messageService.add(msg);
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
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
};
