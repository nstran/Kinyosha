import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from 'primeng/api';

import { EmployeeService } from './../../../../services/employee.service';
import { ValidaytorsService } from './../../../../../shared/services/validaytors.service';
import { DataService } from './../../../../../shared/services/data.service';

import { ThongTinKhacModel } from './../../../../models/thong-tin-khac.model';

@Component({
  selector: 'app-thong-tin-khac',
  templateUrl: './thong-tin-khac.component.html',
  styleUrls: ['./thong-tin-khac.component.css']
})
export class ThongTinKhacComponent implements OnInit {
  loading: boolean = false;
  isEdit: boolean = false;

  @Input() actionEdit: boolean;
  @Input() employeeId: string;

  isShowButtonSua: boolean = false;

  thongTinKhac: ThongTinKhacModel;
  thongTinKhacClone: ThongTinKhacModel;

  formGroup: FormGroup;
  submitted: boolean = false;

  error = {
    TenChuTaiKhoan: '',
    SoTaiKhoan: '',
    TenNganHang: '',
    DiaChiNganHang: '',
  }

  constructor(
    public messageService: MessageService,
    private employeeService: EmployeeService,
    private validaytorsService: ValidaytorsService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.getThongTinKhac();
  }

  initForm() {
    this.formGroup = new FormGroup({
      BienSoXe: new FormControl(''),
      LoaiXe: new FormControl(''),
      TenChuTaiKhoan: new FormControl('', [Validators.required, this.validaytorsService.forbiddenSpaceText]),
      SoTaiKhoan: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{1,}$/), this.validaytorsService.forbiddenSpaceText]),
      TenNganHang: new FormControl('', [Validators.required, this.validaytorsService.forbiddenSpaceText]),
      DiaChiNganHang: new FormControl('', [Validators.required, this.validaytorsService.forbiddenSpaceText])
    });

    this.formGroup.disable();
  }

  async getThongTinKhac() {
    this.loading = true;
    let result: any = await this.employeeService.getThongTinKhac(this.employeeId);
    this.loading = false;

    if (result.statusCode == 200) {
      this.thongTinKhac = result.thongTinKhac;
      this.isShowButtonSua = result.isShowButtonSua;

      this.thongTinKhacClone = result.thongTinKhac;

      this.mapDataToForm(this.thongTinKhac);

    }
    else {
      this.showMessage('error', result.messageCode);
    }
  }

  mapDataToForm(thongTinKhac: ThongTinKhacModel) {
    this.formGroup.setValue({
      BienSoXe: thongTinKhac ?.bienSo,
      LoaiXe: thongTinKhac ?.loaiXe,
      TenChuTaiKhoan: thongTinKhac ?.bankOwnerName,
      SoTaiKhoan: thongTinKhac ?.bankAccount,
      TenNganHang: thongTinKhac ?.bankName,
      DiaChiNganHang: thongTinKhac ?.bankAddress
    });
  }


  enabledForm() {
    this.isEdit = true;
    this.formGroup.enable();
  }

  async saveForm() {
    this.submitted = true;

    if (!this.formGroup.valid) {
      if (this.formGroup.get('TenChuTaiKhoan').errors ?.required || this.formGroup.get('TenChuTaiKhoan').errors ?.forbiddenSpaceText) {
        this.error['TenChuTaiKhoan'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.formGroup.get('SoTaiKhoan').errors ?.required || this.formGroup.get('SoTaiKhoan').errors ?.forbiddenSpaceText) {
        this.error['SoTaiKhoan'] = 'Kh??ng ???????c ????? tr???ng';
      } else if (this.formGroup.get('SoTaiKhoan').errors ?.pattern) {
        this.error['SoTaiKhoan'] = 'Ch??? ???????c nh???p s???';
      }

      if (this.formGroup.get('TenNganHang').errors ?.required || this.formGroup.get('TenNganHang').errors ?.forbiddenSpaceText) {
        this.error['TenNganHang'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.formGroup.get('DiaChiNganHang').errors ?.required || this.formGroup.get('DiaChiNganHang').errors ?.forbiddenSpaceText) {
        this.error['DiaChiNganHang'] = 'Kh??ng ???????c ????? tr???ng';
      }

      return;
    }

    let formData = this.formGroup.value;

    let thongTinKhac: ThongTinKhacModel = {
      employeeId: this.employeeId,
      bienSo: formData ?.BienSoXe ? formData ?.BienSoXe.trim() : null,
      loaiXe: formData ?.LoaiXe ? formData ?.LoaiXe.trim() : null,
      bankOwnerName: formData ?.TenChuTaiKhoan ? formData ?.TenChuTaiKhoan.trim() : null,
      bankAccount: formData ?.SoTaiKhoan ? formData ?.SoTaiKhoan.trim() : null,
      bankName: formData ?.TenNganHang ? formData ?.TenNganHang.trim() : null,
      bankAddress: formData ?.DiaChiNganHang ? formData ?.DiaChiNganHang.trim() : null
    };

    this.loading = true;
    let result: any = await this.employeeService.saveThongTinKhac(thongTinKhac);
    this.loading = false;

    if (result.statusCode == 200) {
      this.isEdit = false;
      this.formGroup.disable();
      this.getThongTinKhac();
      this.showMessage('success', result.messageCode);
      this.dataService.changeMessage("Update success"); //thay ?????i message ????? call l???i api getListNote trong component NoteTimeline
    }
    else {
      this.showMessage('error', result.messageCode);
    }
  }

  disabledForm() {
    this.isEdit = false;
    this.mapDataToForm(this.thongTinKhacClone);
    this.formGroup.disable();
    this.error = {
      TenChuTaiKhoan: '',
      SoTaiKhoan: '',
      TenNganHang: '',
      DiaChiNganHang: '',
    }
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
  }

}
