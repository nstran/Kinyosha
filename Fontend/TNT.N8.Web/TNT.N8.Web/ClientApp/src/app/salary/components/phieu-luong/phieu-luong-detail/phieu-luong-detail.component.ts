import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';
import { ExportFileWordService } from '../../../../shared/services/exportFileWord.services';
import { SalaryService } from '../../../services/salary.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DecimalPipe } from '@angular/common';
import { GetPermission } from '../../../../shared/permission/get-permission';

@Component({
  selector: 'app-phieu-luong-detail',
  templateUrl: './phieu-luong-detail.component.html',
  styleUrls: ['./phieu-luong-detail.component.css'],
  providers: [DecimalPipe]
})
export class PhieuLuongDetailComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false;

  phieuLuongId: number = 0;
  data: any = null;
  titleName: Array<any> = [];
  engTitleName: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public exportFileWordService: ExportFileWordService,
    private getPermission: GetPermission,
    private encrDecrService: EncrDecrService,
    private salaryService: SalaryService,
    private messageService: MessageService,
    private decimalPipe: DecimalPipe
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.phieuLuongId = Number(this.encrDecrService.get(params['phieuLuongId']));
    });

    await this._getPermission();

    this.getMasterData();
  }

  async _getPermission() {
    let resource = "hrm/salary/phieu-luong-detail/";
    this.loading = true;
    let permission: any = await this.getPermission.getPermission(resource);
    this.loading = false;

    if (permission.status == false) {
      this.router.navigate(["/home"]);
      return;
    }
  }

  async getMasterData() {
    this.loading = true;
    this.awaitResult = true;
    let result: any = await this.salaryService.getPhieuLuongById(this.phieuLuongId);
    this.loading = false;
    this.awaitResult = false;

    if (result.statusCode != 200) {
      this.showMessage("error", result.messageCode);
      return;
    }

    this.data = result.phieuLuong;
    this.initTable();
  };

  initTable() {
    this.titleName = [
      'Nh??n vi??n-H???c vi??n/',
      'M?? l??u h??? s??/',
      'Email:',
      'Ng??y ti??u chu???n/',
      `L????ng c?? b???n tr?????c ??i???u ch???nh/`,
      `L????ng c?? b???n sau ??i???u ch???nh (n???u c??)/`,
      'M???c ??i???u ch???nh/',
      'S??? ng??y th???c t??? l??m vi???c/ h???c vi???c trong th??ng/',
      'S??? ng??y ngh??? ph??p trong th??ng/',
      'S??? ng??y ngh??? l???/ Ngh??? h?????ng nguy??n l????ng trong th??ng/',
      'S??? ng??y ngh??? kh??ng l????ng (C?? ph??p)/',
      'S??? ng??y tr??? ??i mu???n/ v??? s???m kh??ng l??m ????? c??ng/',
      'S??? ng??y kh??ng ???????c t??nh th?????ng chuy??n c???n/',
      'Bottom 10% - 10% KPI th???p nh???t c??ng ty kh??ng ???????c h??? tr??? ??T, x??ng, nh?? ???',
      `S??? l?????ng ng?????i ????ng k?? gi???m tr??? gia c???nh (${this.decimalPipe.transform(this.data?.cauHinhGiamTruNguoiPhuThuoc)} tri???u/ ng?????i)/`,
      `Gi???m tr??? gia c???nh b???n th??n & ng?????i th??n (${this.decimalPipe.transform(this.data?.cauHinhGiamTruCaNhan)} tri???u/ NV)/`,
      'I. CHI TI???T THU NH???P TR?????C THU???_VND/',
      '1. L????ng theo ng??y l??m vi???c-h???c vi???c t???m t??nh trong th??ng/',
      '2. H??? tr??? x??ng xe (Ch??? t??nh ng??y ??i l??m), ??i???u ch???nh/',
      '3. H??? tr??? ??i???n tho???i (Ch??? t??nh ng??y ??i l??m), ??i???u ch???nh/',
      '4. H??? tr??? ??n tr??a (T??nh theo ng??y l??m th???c t???), ??i???u ch???nh/',
      '5. H??? tr??? nh?? ??? (Ch??? t??nh ng??y ??i l??m), ??i???u ch???nh/',
      '6. Th?????ng chuy??n c???n (Kh??ng t??nh ng??y ngh???, mu???n/s???m), ??i???u ch???nh/',
      `7. Th?????ng KPI th??ng ${this.data?.thangTruoc} n??m ${this.data?.namTheoThangTruoc}/`,
      `8. Th?????ng th??nh t??ch cu???i n??m/`,
      '9. Ph??? c???p tr??ch nhi???m (n???u c??)/',
      '10. Tr??? c???p h???c vi???c (n???u c??)/',
      '11.1. OT t??nh thu??? TNCN/',
      '11.2. OT kh??ng t??nh thu??? TNCN/',
      `12. C??c kho???n thu nh???p t??nh thu??? TNCN th??ng ${this.data?.thangKetThucKyLuong}.${this.data?.namKetThucKyLuong} kh??ng c???ng v??o l????ng/`,
      '- L????ng th??ng 13/',
      '- Qu?? b???c th??m v?? c??c thu nh???p t??nh thu??? ???? ch??? b???ng ti???n m???t ho???c hi???n v???t/',
      'II. C??C KHO???N TR???_VND/',
      '1. T???ng Thu??? TNCN trong th??ng/',
      `2. B???o hi???m X?? h???i, Y t??? v?? Th???t nghi???p (${this.decimalPipe.transform(this.data?.phanTramBaoHiemNld)}%)/`,
      'III.THU NH???P TH???C NH???N/',
      'IV. C??C KHO???N C??NG TY PH???I TR???/',
      `1. B???o hi???m X?? h???i, Y t??? v?? Th???t nghi???p (${this.decimalPipe.transform(this.data?.phanTramBaoHiemCty)}%)/`,
      `2. Kinh ph?? c??ng ??o??n ${this.decimalPipe.transform(this.data?.phanTramKinhPhiCongDoanCty)}% th??ng n??y/`,
      'V. T???NG CHI PH?? NH??N VI??N-H???C VI??N/',
    ];

    this.engTitleName = [
      'Employee \'s name',
      'HR filing code',
      null,
      'Standard days',
      `Contract gross income`,
      `Contract gross income (if any)`,
      'Balance',
      'Working day of the month',
      'AL of the month',
      'Other paid leave',
      'Unpaid leave',
      'Leave early and come late days w/o pay',
      'Deduction days for attendance',
      null,
      'No. of dependent',
      'Deduction for family circumstance',
      'DETAIL GROSS INCOME',
      'GROSS income on working days',
      'Gasoline supporting fee and adjust if any',
      'Gell phone allowance and adjust if any',
      'Lunch allowance and adjust if any',
      'Housing allowance and adjust if any',
      'Bonus for compliance of regulation',
      `Bonus KPI in ${this.data?.thangTruocTiengAnh} ${this.data?.namTheoThangTruoc}`,
      `Year End rewards`,
      'Responsibility allowance (If any)',
      'Apprenticeship allowance (If any)',
      'Taxable income O.T',
      'Tax exempt O.T',
      'Other add to calculated',
      '13th monthy salary',
      'Tet gifts, Cash gift receiving during year-end meeting, Cash Tet bonus',
      'TOTAL DEDUCTION',
      'PIT',
      `SI, HI, UI (${this.decimalPipe.transform(this.data?.phanTramBaoHiemNld)}%)`,
      'NET INCOME TRANSFER TO EMPLOYEE',
      'CONTRIBUTION BY COMPANY',
      `SI, HI, UI (${this.decimalPipe.transform(this.data?.phanTramBaoHiemCty)}% from Jul 2017)`,
      `Union fee ${this.decimalPipe.transform(this.data?.phanTramKinhPhiCongDoanCty)}%`,
      'TOTAL DIRECT COST TO EMPLOYEE',
    ];
  }

  goBackToList() {
    this.router.navigate(['/salary/phieu-luong-list']);
  };

  exportFile() {
    let data = {
      template: 4,
      data: Object.assign({}, this.data, {
        baoHiem: this.decimalPipe.transform(this.data.baoHiem),
        cauHinhGiamTruCaNhan: this.decimalPipe.transform(this.data.cauHinhGiamTruCaNhan),
        cauHinhGiamTruNguoiPhuThuoc: this.decimalPipe.transform(this.data.cauHinhGiamTruNguoiPhuThuoc),
        cauHinhTroCapCc: this.decimalPipe.transform(this.data.cauHinhTroCapCc),
        cauHinhTroCapDmvs: this.decimalPipe.transform(this.data.cauHinhTroCapDmvs),
        ctyTraBh: this.decimalPipe.transform(this.data.ctyTraBh),
        giamTruGiaCanh: this.decimalPipe.transform(this.data.giamTruGiaCanh),
        kinhPhiCongDoan: this.decimalPipe.transform(this.data.kinhPhiCongDoan),
        luongCoBan: this.decimalPipe.transform(this.data.luongCoBan),
        luongCoBanSau: this.decimalPipe.transform(this.data.luongCoBanSau),
        luongThang13: this.decimalPipe.transform(this.data.luongThang13),
        luongTheoNgayHocViec: this.decimalPipe.transform(this.data.luongTheoNgayHocViec),
        mucDieuChinh: this.decimalPipe.transform(this.data.mucDieuChinh),
        ngayDmvs: this.decimalPipe.transform(this.data.ngayDmvs),
        ngayKhongHuongChuyenCan: this.decimalPipe.transform(this.data.ngayKhongHuongChuyenCan),
        ngayLamViecThucTe: this.decimalPipe.transform(this.data.ngayLamViecThucTe),
        ngayNghiKhongLuong: this.decimalPipe.transform(this.data.ngayNghiKhongLuong),
        ngayNghiLe: this.decimalPipe.transform(this.data.ngayNghiLe),
        ngayNghiPhep: this.decimalPipe.transform(this.data.ngayNghiPhep),
        nghiKhongPhep: this.decimalPipe.transform(this.data.nghiKhongPhep),
        otKhongTinhThue: this.decimalPipe.transform(this.data.otKhongTinhThue),
        otTinhThue: this.decimalPipe.transform(this.data.otTinhThue),
        phanTramBaoHiemCty: this.decimalPipe.transform(this.data.phanTramBaoHiemCty),
        phanTramBaoHiemNld: this.decimalPipe.transform(this.data.phanTramBaoHiemNld),
        phanTramKinhPhiCongDoanCty: this.decimalPipe.transform(this.data.phanTramKinhPhiCongDoanCty),
        quaBocTham: this.decimalPipe.transform(this.data.quaBocTham),
        soLanTruChuyenCan: this.decimalPipe.transform(this.data.soLanTruChuyenCan),
        soLuongDkGiamTruGiaCanh: this.decimalPipe.transform(this.data.soLuongDkGiamTruGiaCanh),
        soNgayLamViec: this.decimalPipe.transform(this.data.soNgayLamViec),
        thucNhan: this.decimalPipe.transform(this.data.thucNhan),
        thuongKpi: this.decimalPipe.transform(this.data.thuongKpi),
        tongChiPhiNhanVien: this.decimalPipe.transform(this.data.tongChiPhiNhanVien),
        tongSoNgayKhongTinhLuong: this.decimalPipe.transform(this.data.tongSoNgayKhongTinhLuong),
        tongThueTncn: this.decimalPipe.transform(this.data.tongThueTncn),
        troCapAnTrua: this.decimalPipe.transform(this.data.troCapAnTrua),
        troCapCcncTheoNgayLvtt: this.decimalPipe.transform(this.data.troCapCcncTheoNgayLvtt),
        troCapChuyenCan: this.decimalPipe.transform(this.data.troCapChuyenCan),
        troCapChuyenCanDmvs: this.decimalPipe.transform(this.data.troCapChuyenCanDmvs),
        troCapDiLai: this.decimalPipe.transform(this.data.troCapDiLai),
        troCapDienThoai: this.decimalPipe.transform(this.data.troCapDienThoai),
        troCapHocViec: this.decimalPipe.transform(this.data.troCapHocViec),
        troCapNhaO: this.decimalPipe.transform(this.data.troCapNhaO),
        troCapTrachNhiem: this.decimalPipe.transform(this.data.troCapTrachNhiem),
      })
    };
    this.exportFileWordService.saveFileWord(data, `Phi???u L????ng - ${this.data.employeeCode}_${this.data.employeeName}.docx`)
  };

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: "Th??ng b??o:", detail: detail };
    this.messageService.add(msg);
  }
}
