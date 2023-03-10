import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { EmployeeService } from '../../../../../services/employee.service';
import { FormatDateService } from '../../../../../../shared/services/formatDate.services';
import { DataService } from '../../../../../../shared/services/data.service';

import { BaoHiemXaHoiModel } from '../../../../../models/thong-tin-bao-hiem.model';
import { BaoHiemLoftCareModel } from '../../../../../models/thong-tin-bao-hiem.model';
import { ThongTinThueVaGiamTruModel } from '../../../../../models/thong-tin-bao-hiem.model';
import { LichSuThanhToanBaoHiemModel } from '../../../../../models/lich-su-thanh-toan-bao-hiem.model';

import { ThemMoiLichsuThanhtoanBaohiemComponent } from '../them-moi-lichsu-thanhtoan-baohiem/them-moi-lichsu-thanhtoan-baohiem.component';

@Component({
  selector: 'app-bao-hiem-va-thue',
  templateUrl: './bao-hiem-va-thue.component.html',
  styleUrls: ['./bao-hiem-va-thue.component.css']
})
export class BaoHiemVaThueComponent implements OnInit {
  loading: boolean = false;
  isEdit: boolean = false;

  @Input() actionEdit: boolean;
  @Input() employeeId: string;

  isShowButton: boolean = false;

  baoHiemXaHoi: BaoHiemXaHoiModel;
  baoHiemLoftCare: BaoHiemLoftCareModel;
  thongTinThueVaGiamTru: ThongTinThueVaGiamTruModel;
  listDoiTuongPhuThuoc: any = [];
  listQuyenLoi = [];
  listLoaiBaoHiem = [];
  listLichSuThanhToanBaoHiem: Array<LichSuThanhToanBaoHiemModel> = [];

  baoHiemXaHoiClone: BaoHiemXaHoiModel;
  baoHiemLoftCareClone: BaoHiemLoftCareModel;
  thongTinThueVaGiamTruClone: ThongTinThueVaGiamTruModel;

  cols: Array<any> = [];
  cols2: Array<any> = [];

  baoHiemForm: FormGroup;

  submitted: boolean = false;

  error = {
    SoSoBhxh: '',
    MaTheBhyt: '',
    MaTheBhLoftCare: '',
    MaSoThueCaNhan: ''
  }

  constructor(
    public messageService: MessageService,
    private employeeService: EmployeeService,
    private formatDateService: FormatDateService,
    private dataService: DataService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initTable();

    this.getThongTinBaoHiemVaThue();
  }

  initForm() {
    this.baoHiemForm = new FormGroup({
      SoSoBhxh: new FormControl(''),
      MaTheBhyt: new FormControl(''),
      MucDongBhxh: new FormControl({ value: null, disabled: true }),
      TyLeDongBhxh: new FormControl({ value: null, disabled: true }),
      TyLeDongBhyt: new FormControl({ value: null, disabled: true }),
      TyLeDongBhtn: new FormControl({ value: null, disabled: true }),
      TyLeDongBhtnnn: new FormControl({ value: null, disabled: true }),
      MaTheBhLoftCare: new FormControl(''),
      NhomBhLoftCare: new FormControl({ value: null, disabled: true }),
      MaSoThueCaNhan: new FormControl(''),
      SoNguoiDangKyPhuThuoc: new FormControl(''),
      DoiTuongPhuThuoc: new FormControl(''),
      // ThangNopDangKyGiamTru: new FormControl(''),
    });

    this.baoHiemForm.disable();
  }

  initTable() {
    this.cols = [
      { field: 'tenQuyenLoi', header: 'Quy???n l???i', textAlign: 'center' },
      { field: 'doiTuong', header: '?????i t?????ng', textAlign: 'left' },
      { field: 'mucHuong', header: 'M???c h?????ng', textAlign: 'right' },
      { field: 'donVi', header: '????n v???', textAlign: 'left' },
      { field: 'lePhi', header: 'L??? ph?? (%)', textAlign: 'center' },
      { field: 'phiCoDinh', header: 'Ph?? c??? ?????nh', textAlign: 'right' },
      { field: 'phiTheoLuong', header: 'Ph?? theo l????ng (%)', textAlign: 'center' },
      { field: 'mucGiam', header: 'M???c gi???m (%)', textAlign: 'center' }
    ];

    this.cols2 = [
      { field: 'stt', header: 'STT', textAlign: 'center', width: '50px' },
      { field: 'ngayThanhToan', header: 'Ng??y', textAlign: 'center', width: '15%' },
      { field: 'loaiBaoHiemName', header: 'Lo???i b???o hi???m', textAlign: 'left', width: '15%' },
      { field: 'soTienThanhToan', header: 'S??? ti???n thanh to??n', textAlign: 'right', width: '15%' },
      { field: 'ghiChu', header: 'Ghi ch??', textAlign: 'left' },
      { field: 'action', header: 'Thao t??c', textAlign: 'center', width: '100px' }
    ];
  }

  async getThongTinBaoHiemVaThue() {
    this.loading = true;
    let result: any = await this.employeeService.getThongTinBaoHiemVaThue(this.employeeId);
    this.loading = false;

    if (result.statusCode == 200) {
      this.baoHiemXaHoi = result.baoHiemXaHoi;
      this.baoHiemLoftCare = result.baoHiemLoftCare;
      this.thongTinThueVaGiamTru = result.thongTinThueVaGiamTru;
      this.listDoiTuongPhuThuoc = result.listDoiTuongPhuThuoc;
      this.listQuyenLoi = result.baoHiemLoftCare.listQuyenLoi;
      this.listLoaiBaoHiem = result.listLoaiBaoHiem;
      this.listLichSuThanhToanBaoHiem = result.listLichSuThanhToanBaoHiem;

      this.isShowButton = result.isShowButton;

      this.baoHiemXaHoiClone = result.baoHiemXaHoi;
      this.baoHiemLoftCareClone = result.baoHiemLoftCare;
      this.thongTinThueVaGiamTruClone = result.thongTinThueVaGiamTru;

      this.mapDataToForm(this.baoHiemXaHoi, this.baoHiemLoftCare, this.thongTinThueVaGiamTru);

    }
    else {
      this.showMessage('error', result.messageCode);
    }
  }

  mapDataToForm(baoHiemXaHoi: BaoHiemXaHoiModel, baoHiemLoftCare: BaoHiemLoftCareModel, thongTinThueVaGiamTru: ThongTinThueVaGiamTruModel) {
    this.baoHiemForm.setValue({
      SoSoBhxh: baoHiemXaHoi?.soSoBhxh,
      MaTheBhyt: baoHiemXaHoi?.maTheBhyt,
      MucDongBhxh: baoHiemXaHoi?.mucDongBhxh,
      TyLeDongBhxh: baoHiemXaHoi?.tyLeDongBhxh,
      TyLeDongBhyt: baoHiemXaHoi?.tyLeDongBhyt,
      TyLeDongBhtn: baoHiemXaHoi?.tyLeDongBhtn,
      TyLeDongBhtnnn: baoHiemXaHoi?.tyLeDongBhtnnn,
      MaTheBhLoftCare: baoHiemLoftCare?.maTheBhLoftCare,
      NhomBhLoftCare: baoHiemLoftCare?.nhomBhLoftCare,
      MaSoThueCaNhan: thongTinThueVaGiamTru?.maSoThueCaNhan,
      SoNguoiDangKyPhuThuoc: thongTinThueVaGiamTru?.soNguoiDangKyPhuThuoc,
      DoiTuongPhuThuoc: thongTinThueVaGiamTru?.listDoiTuongPhuThuocId ? this.listDoiTuongPhuThuoc.filter(x => thongTinThueVaGiamTru.listDoiTuongPhuThuocId.includes(x.categoryId)).map(x => x.categoryName) : null,
      // ThangNopDangKyGiamTru: thongTinThueVaGiamTru?.thangNopDangKyGiamTru ? new Date(thongTinThueVaGiamTru?.thangNopDangKyGiamTru) : null,
    });
  }


  enabledForm() {
    this.isEdit = true;
    this.baoHiemForm.enable();
    this.baoHiemForm.get('MucDongBhxh').disable();
    this.baoHiemForm.get('TyLeDongBhxh').disable();
    this.baoHiemForm.get('TyLeDongBhyt').disable();
    this.baoHiemForm.get('TyLeDongBhtn').disable();
    this.baoHiemForm.get('TyLeDongBhtnnn').disable();
    this.baoHiemForm.get('SoNguoiDangKyPhuThuoc').disable();
    this.baoHiemForm.get('DoiTuongPhuThuoc').disable();
    this.baoHiemForm.get('NhomBhLoftCare').disable();
  }

  async saveForm() {
    this.submitted = true;

    if (!this.baoHiemForm.valid) {
      if (this.baoHiemForm.get('SoSoBhxh').errors?.required || this.baoHiemForm.get('SoSoBhxh').errors?.forbiddenSpaceText) {
        this.error['SoSoBhxh'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.baoHiemForm.get('MaTheBhyt').errors?.required || this.baoHiemForm.get('MaTheBhyt').errors?.forbiddenSpaceText) {
        this.error['MaTheBhyt'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.baoHiemForm.get('MaTheBhLoftCare').errors?.required || this.baoHiemForm.get('MaTheBhLoftCare').errors?.forbiddenSpaceText) {
        this.error['MaTheBhLoftCare'] = 'Kh??ng ???????c ????? tr???ng';
      }

      if (this.baoHiemForm.get('MaSoThueCaNhan').errors?.required || this.baoHiemForm.get('MaSoThueCaNhan').errors?.forbiddenSpaceText) {
        this.error['MaSoThueCaNhan'] = 'Kh??ng ???????c ????? tr???ng';
      }

      return;
    }

    let formData = this.baoHiemForm.value;

    let baoHiemXaHoi: BaoHiemXaHoiModel = {
      soSoBhxh: formData.SoSoBhxh ? formData.SoSoBhxh.trim() : "",
      maTheBhyt: formData.MaTheBhyt ? formData.MaTheBhyt.trim() : "",
    };
    let baoHiemLoftCare: BaoHiemLoftCareModel = {
      maTheBhLoftCare: formData.MaTheBhLoftCare
    };
    let thongTinThueVaGiamTru: ThongTinThueVaGiamTruModel = {
      maSoThueCaNhan: formData.MaSoThueCaNhan ? formData.MaSoThueCaNhan.trim() : "",
      soNguoiDangKyPhuThuoc: formData.SoNguoiDangKyPhuThuoc,
      // thangNopDangKyGiamTru: formData.ThangNopDangKyGiamTru ? this.formatDateService.convertToUTCTime(formData.ThangNopDangKyGiamTru) : null,
      // listDoiTuongPhuThuocId: formData.DoiTuongPhuThuoc?.map(x => x.categoryId)
    };

    // console.log(thongTinThueVaGiamTru);return
    this.loading = true;
    let result: any = await this.employeeService.saveThongTinBaoHiemVaThue(this.employeeId, baoHiemXaHoi, baoHiemLoftCare, thongTinThueVaGiamTru);
    this.loading = false;

    if (result.statusCode == 200) {
      this.isEdit = false;
      this.baoHiemForm.disable();
      this.getThongTinBaoHiemVaThue();
      this.showMessage('success', result.messageCode);
      this.dataService.changeMessage("Update success"); //thay ?????i message ????? call l???i api getListNote trong component NoteTimeline
    }
    else {
      this.showMessage('error', result.messageCode);
    }
  }

  disabledForm() {
    this.isEdit = false;
    this.mapDataToForm(this.baoHiemXaHoiClone, this.baoHiemLoftCareClone, this.thongTinThueVaGiamTruClone);
    this.baoHiemForm.disable();
    this.error = {
      SoSoBhxh: '',
      MaTheBhyt: '',
      MaTheBhLoftCare: '',
      MaSoThueCaNhan: ''
    }
  }

  addLichSu(rowData = null) {
    let isAdd: boolean = true;
    if (rowData) {
      isAdd = false;
    }
    let ref = this.dialogService.open(ThemMoiLichsuThanhtoanBaohiemComponent, {
      data: {
        isAdd: isAdd,
        employeeId: this.employeeId,
        listLoaiBaoHiem: this.listLoaiBaoHiem,
        lichSuThanhToanBaoHiem: rowData
      },
      header: isAdd ? 'Th??m m???i l???ch s??? thanh to??n quy???n l???i b???o hi???m' : 'C???p nh???t l???ch s??? thanh to??n quy???n l???i b???o hi???m',
      width: '690px',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "300px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      this.getThongTinBaoHiemVaThue();
    });
  }

  deleteLichSu(data) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a, d??? li???u s??? kh??ng th??? ho??n t??c?',
      accept: async () => {
        try {
          this.loading = true;
          let result: any = await this.employeeService.deleteLichSuThanhToanBaoHiemById(data.lichSuThanhToanBaoHiemId);
          this.loading = false;

          if (result.statusCode != 200) {
            this.showMessage('error', result.messageCode);
            return;
          }
          this.showMessage('success', "X??a d??? li???u th??nh c??ng");
          this.getThongTinBaoHiemVaThue();
        } catch (error) {
          this.showMessage('error', error);
        }
      }
    });
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
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
