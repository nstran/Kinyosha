import { Component, OnInit } from '@angular/core';
import { MessageService} from 'primeng/api';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';

import { EmployeeService } from './../../../../../services/employee.service';
import { DataService } from './../../../../../../shared/services/data.service';

import { HopDongNhanSuModel } from './../../../../../models/hop-dong-nhan-su.model';

@Component({
  selector: 'app-them-moi-hop-dong',
  templateUrl: './them-moi-hop-dong.component.html',
  styleUrls: ['./them-moi-hop-dong.component.css']
})
export class ThemMoiHopDongComponent implements OnInit {
  loading: boolean = false;
  listPosition = [];
  listLoaiHopDong = [];
  employeeId: any;
  isAdd: boolean = false;
  hopDongNhanSu: any;

  submitted: boolean = false;
  hopDongForm: FormGroup;

  minDateNgayKetThucHopDong: any = null;

  error: any = {
    loaiHopDong: '',
    soHopDong: '',
    soPhuLuc: '',
    ngayKyHopDong: '',
    ngayBatDauLamViec: '',
    position: '',
    mucLuong: '',
    ngayKetThucHopDong: ''
  }

  constructor(
    public messageService: MessageService,
    private employeeService: EmployeeService,
    public data: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.listPosition = this.data.data.listPosition;
    this.listLoaiHopDong = this.data.data.listLoaiHopDong;
    this.employeeId = this.data.data.employeeId;
    this.isAdd = this.data.data.isAdd;
    this.hopDongNhanSu = this.data.data.hopDongNhanSu;

    this.initForm();
    if(!this.isAdd) {
      this.setForm();
    }
  }

  initForm() {
    this.hopDongForm = new FormGroup({
      loaiHopDong: new FormControl('', [Validators.required]),
      soHopDong: new FormControl('', [Validators.required, forbiddenSpaceText]),
      soPhuLuc: new FormControl('', [Validators.required, forbiddenSpaceText]),
      ngayKyHopDong: new FormControl('', [Validators.required]),
      ngayBatDauLamViec: new FormControl('', [Validators.required]),
      ngayKetThucHopDong: new FormControl(''),
      position: new FormControl('', [Validators.required]),
      mucLuong: new FormControl(0, [Validators.required]),
    });
  }

  setForm() {
    this.hopDongForm.setValue({
      loaiHopDong: this.hopDongNhanSu?.loaiHopDongId ? this.listLoaiHopDong.find(x => x.categoryId == this.hopDongNhanSu.loaiHopDongId) : null,
      soHopDong: this.hopDongNhanSu?.soHopDong,
      soPhuLuc: this.hopDongNhanSu?.soPhuLuc,
      ngayKyHopDong: this.hopDongNhanSu?.ngayKyHopDong ? new Date(this.hopDongNhanSu?.ngayKyHopDong) : null,
      ngayBatDauLamViec: this.hopDongNhanSu?.ngayBatDauLamViec ? new Date(this.hopDongNhanSu?.ngayBatDauLamViec) : null,
      ngayKetThucHopDong: this.hopDongNhanSu?.ngayKetThucHopDong ? new Date(this.hopDongNhanSu?.ngayKetThucHopDong) : null,
      position: this.hopDongNhanSu?.positionId ? this.listPosition.find(x => x.positionId == this.hopDongNhanSu.positionId) : null,
      mucLuong: this.hopDongNhanSu?.mucLuong,
    })

    if(this.hopDongNhanSu.isPhatSinhKyLuong) {
      this.hopDongForm.get('ngayKyHopDong').disable();
      this.hopDongForm.get('position').disable();
      this.hopDongForm.get('mucLuong').disable();
    }

    this.onChangeDate();
  }

  onChangeDate() {
    let ngayKyHopDong = this.hopDongForm.get('ngayKyHopDong').value;
    let ngayKetThucHopDong = this.hopDongForm.get('ngayKetThucHopDong').value;

    this.minDateNgayKetThucHopDong = new Date(ngayKyHopDong.getTime() + (1000 * 60 * 60 * 24)); // set min date ng??y k???t th??c H?? ph???i l???n h??n ng??y k?? H??

    if (ngayKetThucHopDong && (ngayKyHopDong.getTime() > ngayKetThucHopDong.getTime())) {
      this.hopDongForm.patchValue({ ngayKetThucHopDong: null });
    }
  }

  onChangeDateNgayKetThucHD() {
    // if(this.hopDongForm.get('ngayKetThucHopDong').value) {
    //   this.error['ngayKetThucHopDong'] = null;
    // }
  }

  async save() {
    this.submitted = true;
    if (!this.hopDongForm.valid) {
      if (this.hopDongForm.get('loaiHopDong').errors?.required) {
        this.error['loaiHopDong'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.hopDongForm.get('soHopDong').errors?.required || this.hopDongForm.get('soHopDong').errors?.forbiddenSpaceText) {
        this.error['soHopDong'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.hopDongForm.get('soPhuLuc').errors?.required || this.hopDongForm.get('soPhuLuc').errors?.forbiddenSpaceText) {
        this.error['soPhuLuc'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.hopDongForm.get('ngayKyHopDong').errors?.required) {
        this.error['ngayKyHopDong'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.hopDongForm.get('ngayBatDauLamViec').errors?.required) {
        this.error['ngayBatDauLamViec'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.hopDongForm.get('position').errors?.required) {
        this.error['position'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.hopDongForm.get('mucLuong').errors?.required) {
        this.error['mucLuong'] = 'Kh??ng ???????c ????? tr???ng';
      }

      return;
    }

    // if(this.hopDongForm.get('loaiHopDong').value.categoryCode != 'HDVTH' && !this.hopDongForm.get('ngayKetThucHopDong').value) {
    //   this.error['ngayKetThucHopDong'] = 'Kh??ng ???????c ????? tr???ng';
    //   return;
    // } else {
    //   this.error['ngayKetThucHopDong'] = null;
    // }


    let formData = this.hopDongForm.value;

    let dataInput: HopDongNhanSuModel = {
      loaiHopDongId: formData.loaiHopDong.categoryId,
      soHopDong: formData.soHopDong.trim(),
      soPhuLuc: formData.soPhuLuc.trim(),
      ngayKyHopDong: formData.ngayKyHopDong ? convertToUTCTime(formData.ngayKyHopDong) : null,
      ngayBatDauLamViec: formData.ngayBatDauLamViec ? convertToUTCTime(formData.ngayBatDauLamViec) : null,
      ngayKetThucHopDong: formData.ngayKetThucHopDong ? convertToUTCTime(formData.ngayKetThucHopDong) : null,
      positionId: formData.position.positionId,
      mucLuong: formData.mucLuong,
      employeeId: this.employeeId
    };

    if(!this.isAdd) {
      dataInput = {...dataInput, hopDongNhanSuId: this.hopDongNhanSu.hopDongNhanSuId}
    }

    this.loading = true;
    let result: any;
    if(this.isAdd) {
      result = await this.employeeService.createHopDongNhanSu(dataInput);
    } else {
      result = await this.employeeService.updateHopDongNhanSu(dataInput);
    }
    this.loading = false;

    if (result.statusCode != 200) {
      this.showMessage('error', result.messageCode);
      return;
    }

    this.showMessage('success', this.isAdd ? 'T???o m???i h???p ?????ng th??nh c??ng' : 'C???p nh???t h???p ?????ng th??nh c??ng');
    this.cancel();
    this.dataService.changeMessage("Update success"); //thay ?????i message ????? call l???i api getListNote trong component NoteTimeline
  }

  cancel() {
    this.ref.close();
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
  }

}
function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

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
