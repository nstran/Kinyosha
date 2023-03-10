import { QuyTrinhService } from './../../../../admin/services/quy-trinh.service';
import { FormatDateService } from './../../../../shared/services/formatDate.services';
import { ValidaytorsService } from './../../../../shared/services/validaytors.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EmployeeRequestService } from '../../../services/employee-request/employee-request.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { MessageService, ConfirmationService } from "primeng/api";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-detail-employee-request',
  templateUrl: './detail-employee-request.component.html',
  styleUrls: ['./detail-employee-request.component.css'],
  providers: []
})
export class DetailEmployeeRequestComponent implements OnInit {
  loading: boolean = false;
  awaitResponse: boolean = false;
  emptyGuid = '00000000-0000-0000-0000-000000000000';
  isEdit: boolean = false;

  actionEdit: boolean = true;
  actionDelete: boolean = true;

  deXuatXinNghiId: number = 0;
  deXuatXinNghi: any = null;
  deXuatXinNghiClone: any = null;
  listKyHieuChamCong: Array<any> = [];
  listLoaiCaLamViec: Array<any> = [];
  listDuLieuQuyTrinh: Array<any> = [];

  isShowGuiPheDuyet: boolean = false;
  isShowPheDuyet: boolean = false;
  isShowTuChoi: boolean = false;
  isShowDatVeMoi: boolean = false;
  isShowXoa: boolean = false;
  isShowSua: boolean = false;

  dxxnForm: FormGroup;
  loaiDeXuatControl: FormControl;
  ngayNghiControl: FormControl;
  tuCaControl: FormControl;
  caControl: FormControl;
  denCaControl: FormControl;
  lyDoControl: FormControl;

  isShowTuDen: boolean = false;

  showLyDoTuChoi: boolean = false;

  lyDoTuChoiForm: FormGroup;
  lyDoTuChoiControl: FormControl;

  refreshNote: number = 0;

  constructor(
    private getPermission: GetPermission,
    private router: Router,
    private route: ActivatedRoute,
    private employeeRequestService: EmployeeRequestService,
    private messageService: MessageService,
    private validaytorsService: ValidaytorsService,
    private formatDateService: FormatDateService,
    private confirmationService: ConfirmationService,
    private quyTrinhService: QuyTrinhService,
    private encrDecrService: EncrDecrService
  ) { }

  async ngOnInit() {
    this.setForm();
    let resource = "hrm/employee/request/detail/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      return;
    }

    this.route.params.subscribe(params => {
      this.deXuatXinNghiId = Number(this.encrDecrService.get(params['deXuatXinNghiId']));
    });

    this.getData();
  }

  setForm() {
    this.loaiDeXuatControl = new FormControl(null, [Validators.required]);
    this.ngayNghiControl = new FormControl(null, [Validators.required]);
    this.tuCaControl = new FormControl(null, [Validators.required]);
    this.denCaControl = new FormControl(null, [Validators.required]);
    this.lyDoControl = new FormControl(null, [Validators.required, this.validaytorsService.forbiddenSpaceText]);
    this.caControl = new FormControl(null, [Validators.required]);

    this.dxxnForm = new FormGroup({
      loaiDeXuatControl: this.loaiDeXuatControl,
      ngayNghiControl: this.ngayNghiControl,
      tuCaControl: this.tuCaControl,
      denCaControl: this.denCaControl,
      lyDoControl: this.lyDoControl,
      caControl: this.caControl
    });

    this.dxxnForm.disable();

    this.lyDoTuChoiControl = new FormControl(null, [Validators.required, this.validaytorsService.forbiddenSpaceText]);

    this.lyDoTuChoiForm = new FormGroup({
      lyDoTuChoiControl: this.lyDoTuChoiControl
    });
  }

  async getData() {
    this.loading = true;
    this.awaitResponse = true;
    let result: any = await this.employeeRequestService.getEmployeeRequestById(this.deXuatXinNghiId);
    this.loading = false;
    this.awaitResponse = false;

    if (result.statusCode != 200) {
      this.showMessage("error", result.messageCode);
      return;
    }

    this.deXuatXinNghi = result.deXuatXinNghi;
    this.deXuatXinNghiClone = result.deXuatXinNghi;
    this.listKyHieuChamCong = result.listKyHieuChamCong;
    this.listLoaiCaLamViec = result.listLoaiCaLamViec;
    this.isShowGuiPheDuyet = result.isShowGuiPheDuyet;
    this.isShowPheDuyet = result.isShowPheDuyet;
    this.isShowTuChoi = result.isShowTuChoi;
    this.isShowDatVeMoi = result.isShowDatVeMoi;
    this.isShowXoa = result.isShowXoa;
    this.isShowSua = result.isShowSua;
    this.mapDataToForm(this.deXuatXinNghi);

    this.getDuLieuQuyTrinh();
  }

  mapDataToForm(deXuatXinNghi: any) {
    this.loaiDeXuatControl.setValue(this.listKyHieuChamCong.find(x => x.value == deXuatXinNghi.loaiDeXuatId));
    let listDate = deXuatXinNghi.listDate.length > 0 ? deXuatXinNghi.listDate.map(x => { return new Date(x) }) : null;
    this.ngayNghiControl.setValue(listDate);
    this.tuCaControl.setValue(this.listLoaiCaLamViec.find(x => x.value == deXuatXinNghi.tuCa));
    this.denCaControl.setValue(this.listLoaiCaLamViec.find(x => x.value == deXuatXinNghi.denCa));
    this.caControl.setValue(this.listLoaiCaLamViec.find(x => x.value == deXuatXinNghi.ca));
    this.lyDoControl.setValue(deXuatXinNghi.lyDo);

    this.changeLoaiDeXuat();
  }

  changeLoaiDeXuat() {
    let loaiDeXuat = this.loaiDeXuatControl.value;

    //N???u lo???i ????? xu???t l?? ??i mu???n ho???c V??? s???m
    if (loaiDeXuat.value == 12 || loaiDeXuat.value == 13) {
      this.isShowTuDen = false;
      this.caControl.setValidators([Validators.required]);
      this.tuCaControl.setValidators([]);
      this.denCaControl.setValidators([]);
    }
    else {
      this.isShowTuDen = true;
      this.caControl.setValidators([]);
      this.tuCaControl.setValidators([Validators.required]);
      this.denCaControl.setValidators([Validators.required]);
    }

    this.caControl.updateValueAndValidity();
    this.tuCaControl.updateValueAndValidity();
    this.denCaControl.updateValueAndValidity();

    this.tinhSoNgayNghi();
  }

  tinhSoNgayNghi() {
    this.deXuatXinNghi.tongNgayNghi = 0;

    let loaiDeXuat = this.loaiDeXuatControl.value;
    let listDate: Array<Date> = this.ngayNghiControl.value;

    if (!loaiDeXuat) {
      return;
    }

    if (!listDate) {
      return;
    }

    //S???p x???p l???i list ng??y theo th??? t??? l???n d???n
    listDate.sort(function (a, b) {
      return +(new Date(b)) - +(new Date(a));
    });
    listDate.reverse();

    //N???u lo???i ????? xu???t l?? ??i mu???n ho???c V??? s???m
    if (loaiDeXuat.value == 12 || loaiDeXuat.value == 13) {
      if (!this.caControl.value) {
        return;
      }
      this.deXuatXinNghi.tongNgayNghi = listDate.length;
    }
    else {
      if (!this.tuCaControl.value || !this.denCaControl.value) {
        return;
      }

      //N???u ch??? ch???n 1 ng??y
      if (listDate.length == 1) {
        if (this.tuCaControl.value.value > this.denCaControl.value.value) {
          return;
        }

        if (this.tuCaControl.value == this.denCaControl.value) {
          this.deXuatXinNghi.tongNgayNghi = 0.5;
        }
        else {
          this.deXuatXinNghi.tongNgayNghi = 1;
        }
      }
      //N???u ch???n nhi???u h??n 1 ng??y
      else if (listDate.length > 1) {
        for (let i = 0; i < listDate.length; i++) {
          //N???u l?? ng??y ?????u ti??n
          if (i == 0) {
            //N???u b???t ?????u t??? Ca s??ng
            if (this.tuCaControl.value.value == 1) this.deXuatXinNghi.tongNgayNghi = 1;
            //N???u b???t ?????u t??? Ca chi???u
            else if (this.tuCaControl.value.value == 2) this.deXuatXinNghi.tongNgayNghi = 0.5;
          }
          //N???u l?? ng??y cu???i c??ng
          else if (i == listDate.length - 1) {
            //N???u k???t th??c ?????n Ca s??ng
            if (this.denCaControl.value.value == 1) this.deXuatXinNghi.tongNgayNghi += 0.5;
            //N???u k???t th??c ?????n Ca chi???u
            else if (this.denCaControl.value.value == 2) this.deXuatXinNghi.tongNgayNghi += 1;
          }
          //N???u kh??ng ph???i ng??y ?????u ti??n ho???c ng??y cu???i c??ng
          else {
            this.deXuatXinNghi.tongNgayNghi += 1;
          }
        }
      }
    }
  }

  sua() {
    this.isEdit = true;
    this.dxxnForm.enable();
  }

  huySua() {
    this.mapDataToForm(this.deXuatXinNghiClone);
    this.isEdit = false;
    this.dxxnForm.disable();
  }

  async luuDeXuat() {
    if (!this.dxxnForm.valid) {
      Object.keys(this.dxxnForm.controls).forEach(key => {
        if (!this.dxxnForm.controls[key].valid) {
          this.dxxnForm.controls[key].markAsTouched();
        }
      });

      this.showMessage('warn', 'B???n ch??a nh???p ????? th??ng tin');
      return;
    }

    if (this.loaiDeXuatControl.value.value == 1 && this.deXuatXinNghi.tongNgayNghi > this.deXuatXinNghi.soNgayPhepConLai) {
      this.showMessage('warn', 'B???n kh??ng c?? ????? s??? ng??y ngh??? ph??p');
      return;
    }

    let listDate: Array<Date> = this.ngayNghiControl.value.map(item => {
      item = this.formatDateService.convertToUTCTime(item);
      return item;
    });

    let deXuatXinNghi = {
      deXuatXinNghiId: this.deXuatXinNghiId,
      loaiDeXuatId: this.loaiDeXuatControl.value.value,
      lyDo: this.lyDoControl.value,
      listDate: listDate,
      tuCa: this.tuCaControl.value ?.value,
      denCa: this.denCaControl.value ?.value,
      ca: this.caControl.value ?.value
    };

    this.loading = true;
    this.awaitResponse = true;
    let result: any = await this.employeeRequestService.editEmployeeRequestById(deXuatXinNghi);

    if (result.statusCode != 200) {
      this.loading = false;
      this.awaitResponse = false;
      this.showMessage("error", result.messageCode);
      return;
    }

    this.isEdit = false;
    this.dxxnForm.disable();
    this.showMessage("success", result.messageCode);
    this.getData();
  }

  guiPheDuyet() {
    this.loading = true;
    this.awaitResponse = true;
    this.quyTrinhService.guiPheDuyet(this.emptyGuid, 9, this.deXuatXinNghiId).subscribe(res => {
      let result: any = res;

      if (result.statusCode != 200) {
        this.loading = false;
        this.awaitResponse = false;
        this.showMessage("error", result.messageCode);
        return;
      }

      this.showMessage("success", result.messageCode);
      this.getData();
      this.refreshNote++;
    });
  }

  pheDuyet() {
    this.loading = true;
    this.awaitResponse = true;
    this.quyTrinhService.pheDuyet(this.emptyGuid, 9, null, this.deXuatXinNghiId).subscribe(res => {
      let result: any = res;

      if (result.statusCode != 200) {
        this.loading = false;
        this.awaitResponse = false;
        this.showMessage("error", result.messageCode);
        return;
      }

      this.showMessage("success", result.messageCode);
      this.getData();
      this.refreshNote++;
    });
  }

  showLyDoTuChoiDialog() {
    this.showLyDoTuChoi = true;
    this.lyDoTuChoiForm.reset();
  }

  closeLyDoTuChoi() {
    this.showLyDoTuChoi = false;
  }

  tuChoi() {
    if (!this.lyDoTuChoiForm.valid) {
      Object.keys(this.lyDoTuChoiForm.controls).forEach(key => {
        if (!this.lyDoTuChoiForm.controls[key].valid) {
          this.lyDoTuChoiForm.controls[key].markAsTouched();
        }
      });

      this.showMessage('warn', 'B???n ch??a nh???p ????? th??ng tin');
      return;
    }

    this.loading = true;
    this.awaitResponse = true;
    this.quyTrinhService.tuChoi(this.emptyGuid, 9, this.lyDoTuChoiControl.value ?.trim(), this.deXuatXinNghiId).subscribe(async res => {
      let result: any = res;

      if (result.statusCode != 200) {
        this.loading = false;
        this.awaitResponse = false;
        this.showMessage("error", result.messageCode);
        return;
      }

      this.showMessage("success", result.messageCode);
      await this.getData();
      this.refreshNote++;
      this.showLyDoTuChoi = false;
    });
  }

  async datVeMoi() {
    this.loading = true;
    this.awaitResponse = true;
    let result: any = await this.employeeRequestService.datVeMoiDeXuatXinNghi(this.deXuatXinNghiId);

    if (result.statusCode != 200) {
      this.loading = false;
      this.awaitResponse = false;
      this.showMessage("error", result.messageCode);
      return;
    }

    this.showMessage("success", result.messageCode);
    this.getData();
    this.refreshNote++;
  }

  xoa() {
    this.confirmationService.confirm({
      message: `D??? li???u kh??ng th??? ho??n t??c, b???n ch???c ch???n mu???n x??a?`,
      accept: async () => {
        this.loading = true;
        this.awaitResponse = true;
        let result: any = await this.employeeRequestService.deleteDeXuatXinNghiById(this.deXuatXinNghiId);

        if (result.statusCode != 200) {
          this.loading = false;
          this.awaitResponse = false;
          this.showMessage("error", result.messageCode);
          return;
        }

        this.showMessage("success", result.messageCode);
        setTimeout(() => {
          this.router.navigate(['/employee/request/list']);
        }, 1500);
      },
    });
  }

  getDuLieuQuyTrinh() {
    this.quyTrinhService.getDuLieuQuyTrinh(this.emptyGuid, 9, this.deXuatXinNghiId).subscribe(res => {
      let result: any = res;

      if (result.statusCode != 200) {
        this.showMessage("error", result.messageCode);
        return;
      }

      this.listDuLieuQuyTrinh = result.listDuLieuQuyTrinh;
    });
  }

  back() {
    this.router.navigate(['/employee/request/list']);
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: "Th??ng b??o:", detail: detail };
    this.messageService.add(msg);
  }
}
