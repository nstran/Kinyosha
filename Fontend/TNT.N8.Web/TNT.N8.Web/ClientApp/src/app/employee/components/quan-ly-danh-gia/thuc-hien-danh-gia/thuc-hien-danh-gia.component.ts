import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EmployeeService } from '../../../services/employee.service';
import { Row, Workbook, Worksheet } from 'exceljs';
import { saveAs } from "file-saver";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { interactionSettingsStore } from '@fullcalendar/core';
import * as XLSX from 'xlsx';
import { DialogService, FileUpload } from 'primeng';
import { max } from 'moment';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';
import { Location } from '@angular/common';


class DanhGiaNhanVien {
  DanhGiaNhanVienId: number;
  NhanVienKyDanhGiaId: number;
  OrganizationId: string;
  PositionId: string;
  TongDiemTuDanhGia: number;
  TongDiemDanhGia: number;
  TongKetQua: number;
  MucLuongCu: number;
  MucLuongDeXuatQuanLy: number;
  MucLuongDeXuatTruongPhong: number;
  NhanXetTruongPhong: string;
  MucDanhGiaMasterDataId: string;
  TrangThaiId: number;
  TenantId: string;
}


@Component({
  selector: 'app-thuc-hien-danh-gia',
  templateUrl: './thuc-hien-danh-gia.component.html',
  styleUrls: ['./thuc-hien-danh-gia.component.css']
})

export class ThucHienDanhGiaComponent implements OnInit {
  auth = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;

  today = new Date();

  trangThaiDanhGia: number = 0;

  mucLuongCu: number = 1214234;
  mucLuongDeXuatQL: number = 56347123;
  mucLuongDeXuatTruongPhong: number = 56347123;
  mucTangQL: number = this.mucLuongDeXuatQL - this.mucLuongCu;
  mucTangTruongPhong: number = this.mucLuongDeXuatTruongPhong - this.mucLuongCu;

  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionDownLoad: boolean = true;
  actionUpLoad: boolean = true;
  isManagerOfHR: boolean = false;
  isGD: boolean = false;
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  statusCode: string = null;
  pageSize = 20;


  diemTuDanhGia: string = 'B (4.5)';
  diemDanhGia: string = 'B (4.3)';
  ketQua: string = 'B(4.4)';

  //Ng?????i ????nh gi??
  nguoiDanhGiaName: string = '';
  nguoiDanhGiaCode: string = '';
  nguoiDanhGiaPositionName: string = '';
  nguoiDanhGiaOrganizationName: string = '';

  //Nh??n vi??n t??? ????nh gi??
  tenNhanVien: string = '';
  maNhanVien: string = '';
  positionName: string = '';
  organizationName: string = '';

  listCauHoiMappingNV: Array<any> = [];
  listCauHoiMappingQL: Array<any> = [];
  listMucDanhGia: Array<any> = [];
  listThangDiemChose: Array<any> = [];

  nhanXetTruongPhong: string = '';
  mucDanhGiaMasterDataTruongPhong: any = null;

  isNhanVienTuDanhGia: boolean = false;
  isQuanLyDanhGia: boolean = false;
  isTruongPhongDanhGia: boolean = false;

  //Form c???a phi???u ????nh gi??
  phieuDanhGiaFormGroup: FormGroup;
  tenPhieuDanhGiaFormControl: FormControl;
  ngayTaoFormControl: FormControl;
  nguoiTaoFormControl: FormControl;
  hoatDongControl: FormControl;
  thangDiemDanhGiaControl: FormControl;

  noiDungTuDanhGiaCols = [];
  quanLyDanhGiaCols = [];

  listMucDiemDanhGiaChose = [];
  danhGiaNhanVien: any = null;

  danhGiaNhanVienId: any;

  cachTinhDiem: number = 1;
  // { value: 1, name: "T???ng ??i???m th??nh ph???n*Tr???ng s???" },
  // { value: 2, name: "Trung b??nh c???ng ??i???m th??nh ph???n*Tr???ng s???" },
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private employeeService: EmployeeService,
    private def: ChangeDetectorRef,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private ref: ChangeDetectorRef,
    private encrDecrService: EncrDecrService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.setForm();
    this.route.params.subscribe(params => {
      if (params['danhGiaNhanVienId']) {
        this.danhGiaNhanVienId = Number(this.encrDecrService.get(params['danhGiaNhanVienId']));
      }
    });
    this.getMasterData();
    this.setCols();
  }


  setForm() {
    this.tenPhieuDanhGiaFormControl = new FormControl(null, [Validators.required]);
    this.ngayTaoFormControl = new FormControl(null, [Validators.required]);
    this.nguoiTaoFormControl = new FormControl(null, [Validators.required]);
    this.hoatDongControl = new FormControl(null);
    this.thangDiemDanhGiaControl = new FormControl(null, [Validators.required]);

    this.phieuDanhGiaFormGroup = new FormGroup({
      tenPhieuDanhGiaFormControl: this.tenPhieuDanhGiaFormControl,
      ngayTaoFormControl: this.ngayTaoFormControl,
      nguoiTaoFormControl: this.nguoiTaoFormControl,
      hoatDongControl: this.hoatDongControl,
      thangDiemDanhGiaControl: this.thangDiemDanhGiaControl,
    });

  }

  setCols() {

    this.noiDungTuDanhGiaCols = [
      { field: 'stt', header: '#', width: '10px', textAlign: 'center', type: 'string' },
      { field: 'noiDungCauHoi', header: 'N???i dung t??? ????nh gi??', width: '250px', textAlign: 'left', type: 'string' },
      { field: 'tiLe', header: 'Tr???ng s??? (%)', width: '70px', textAlign: 'center', type: 'number' },
      { field: 'diemTuDanhGia', header: '??i???m t??? ????nh gi??', width: '70px', textAlign: 'center', type: 'date' },
      { field: 'diemDanhGia', header: '??i???m ????nh gi??', width: '70px', textAlign: 'center', type: 'string' },
      { field: 'ketQua', header: 'K???t qu???', width: '70px', textAlign: 'center', type: 'string' },
    ];

    this.quanLyDanhGiaCols = [
      { field: 'stt', header: '#', width: '10px', textAlign: 'center', type: 'string' },
      { field: 'noiDungCauHoi', header: 'N???i dung ????nh gi??', width: '400px', textAlign: 'left', type: 'string' },
    ];

  }
  async getMasterData() {
    this.loading = true;
    let result: any = await this.employeeService.thucHienDanhGiaDetail(this.danhGiaNhanVienId);
    this.loading = false;
    console.log(result)
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }
    this.resetAllField();
    this.trangThaiDanhGia = result.danhGiaNhanVien.trangThaiId
    this.danhGiaNhanVien = result.danhGiaNhanVien
    this.listCauHoiMappingNV = result.listCauTraLoiMapping.filter(x => x.nguoiDanhGia == 1);
    this.listCauHoiMappingQL = result.listCauTraLoiMapping.filter(x => x.nguoiDanhGia == 2);
    this.cachTinhDiem = result.cachTinhDiem;
    this.listThangDiemChose = [];
    let diemToiDa = result.thangDiemDanhGia.diemDanhGia;
    for (let a = 1; a <= diemToiDa; a++) {
      this.listThangDiemChose.push({ value: a });
    }
    this.setDiemDefault();

    //Ng?????i ???????c ????nh gi?? infor
    this.tenNhanVien = result.danhGiaNhanVien.employeeName;
    this.maNhanVien = result.danhGiaNhanVien.employeeCode;
    this.positionName = result.danhGiaNhanVien.positionName;
    this.organizationName = result.danhGiaNhanVien.organizationName;
    //Qu???n l?? ????nh gi?? infor
    this.nguoiDanhGiaName = result.danhGiaNhanVien.nguoiDanhGiaName;
    this.nguoiDanhGiaCode = result.danhGiaNhanVien.nguoiDanhGiaCode;
    this.nguoiDanhGiaPositionName = result.danhGiaNhanVien.nguoiDanhGiaPositionName;
    this.nguoiDanhGiaOrganizationName = result.danhGiaNhanVien.nguoiDanhGiaOrganizationName;

    this.mucLuongCu = result.danhGiaNhanVien.mucLuongCu;
    this.mucLuongDeXuatQL = result.danhGiaNhanVien.mucLuongDeXuatQuanLy;
    this.mucLuongDeXuatTruongPhong = result.danhGiaNhanVien.mucLuongDeXuatTruongPhong;
    this.nhanXetTruongPhong = result.danhGiaNhanVien.nhanXetTruongPhong;
    this.listMucDanhGia = result.listMucDanhGia;
    this.isNhanVienTuDanhGia = result.isNhanVienTuDanhGia;
    this.isQuanLyDanhGia = result.isQuanLyDanhGia;
    this.isTruongPhongDanhGia = result.isTruongPhongDanhGia;
    this.mucDanhGiaMasterDataTruongPhong = this.listMucDanhGia.find(x => x.mucDanhGiaMasterDataId == result.danhGiaNhanVien.mucDanhGiaMasterDataId);
    this.tinhTongDiem();
  }

  resetAllField() {
    this.trangThaiDanhGia = 0;
    this.danhGiaNhanVien = null;
    this.listCauHoiMappingNV = [];
    this.listCauHoiMappingQL = [];
    this.cachTinhDiem = null
    this.listThangDiemChose = [];

    this.mucLuongCu = 0;
    this.mucLuongDeXuatQL = 0;
    this.mucLuongDeXuatTruongPhong = 0;
    this.listMucDanhGia = [];
  }

  setDiemDefault() {
    this.listCauHoiMappingNV.forEach((item, index) => {
      this.listCauHoiMappingNV[index].diemDanhGia = item.diemDanhGia != null ? this.listThangDiemChose.find(x => x.value == item.diemDanhGia) : null;
      this.listCauHoiMappingNV[index].ketQua = item.ketQua != null ? this.listThangDiemChose.find(x => x.value == item.ketQua) : null;
      this.listCauHoiMappingNV[index].diemTuDanhGia = item.diemTuDanhGia != null ? this.listThangDiemChose.find(x => x.value == item.diemTuDanhGia) : null;
    })
  }

  tinhTongDiem() {
    let diemDanhGia = 0;
    let diemTuDanhGia = 0;
    let ketQua = 0;

    //T???ng ??i???m c???a t???ng n???i dung
    let tongDiemNoiDungDiemDanhGia = [];
    let tongDiemNoiDungDiemTuDanhGia = [];
    let tongDiemNoiDungKetQua = [];
    //T??? l??? ??i???m c???a t???ng n???i dung
    let tiLeDiemNoiDung = [];
    //S??? c??u h???i c???a t???ng n???i dung
    let listCountCauHoiNoiDung = [];

    let stt = 1;

    let countCauHoiNoiDung = 0;
    let currentStt = 1;
    this.listCauHoiMappingNV.forEach((item, index) => {
      //N???u l?? n???i dung ti???p theo
      if (item.stt - currentStt == 1) {
        listCountCauHoiNoiDung.push(countCauHoiNoiDung);
        tongDiemNoiDungDiemDanhGia.push(diemDanhGia);
        tongDiemNoiDungDiemTuDanhGia.push(diemTuDanhGia);
        tongDiemNoiDungKetQua.push(ketQua);
      }
      //N???u chuy???n sang n???i dung ti???p theo th?? reset ch??? s???
      if (item.stt - currentStt == 1) {
        currentStt++;
        stt++;
        countCauHoiNoiDung = 0;
        diemDanhGia = 0;
        diemTuDanhGia = 0;
        ketQua = 0;
      }
      //Th??m t??? l??? v??o array
      if (item.stt - stt == 0) {
        tiLeDiemNoiDung.push(item.tiLe);
      }
      //N???i dung b???t ?????u t??? 1
      if (item.stt - stt >= 0) {
        if (item.loaiCauTraLoiId == 1 || item.loaiCauTraLoiId == 3) {
          diemDanhGia += item.diemDanhGia != null ? item.diemDanhGia.value : 0;
          diemTuDanhGia += item.diemTuDanhGia != null ? item.diemTuDanhGia.value : 0;
          ketQua += item.ketQua != null ? item.ketQua.value : 0;
          countCauHoiNoiDung++;
        }
      }

      // N???u l?? n???i dung cu???i c??ng 
      if (index == this.listCauHoiMappingNV.length - 1) {
        listCountCauHoiNoiDung.push(countCauHoiNoiDung);
        tongDiemNoiDungDiemDanhGia.push(diemDanhGia);
        tongDiemNoiDungDiemTuDanhGia.push(diemTuDanhGia);
        tongDiemNoiDungKetQua.push(ketQua);
      }

    })
    let diemDanhGiaResult = 0;
    let diemTuDanhGiaResult = 0;
    let ketQuaResult = 0;
    for (let i = 0; i < tongDiemNoiDungDiemDanhGia.length; i++) {
      if (this.cachTinhDiem == 2) {
        if (tiLeDiemNoiDung[i] != 0 && listCountCauHoiNoiDung[i] != 0) {
          if (tongDiemNoiDungDiemDanhGia[i] != 0) diemDanhGiaResult += tiLeDiemNoiDung[i] * tongDiemNoiDungDiemDanhGia[i] / 100 / listCountCauHoiNoiDung[i];
          if (tongDiemNoiDungDiemTuDanhGia[i] != 0) diemTuDanhGiaResult += tiLeDiemNoiDung[i] * tongDiemNoiDungDiemTuDanhGia[i] / 100 / listCountCauHoiNoiDung[i];
          if (tongDiemNoiDungKetQua[i] != 0) ketQuaResult += tiLeDiemNoiDung[i] * tongDiemNoiDungKetQua[i] / 100 / listCountCauHoiNoiDung[i];
        }
      }
      if (this.cachTinhDiem == 1) {
        if (tiLeDiemNoiDung[i] != 0 && listCountCauHoiNoiDung[i] != 0) {
          diemDanhGiaResult += tiLeDiemNoiDung[i] * tongDiemNoiDungDiemDanhGia[i] / 100;
          diemTuDanhGiaResult += tiLeDiemNoiDung[i] * tongDiemNoiDungDiemTuDanhGia[i] / 100;
          ketQuaResult += tiLeDiemNoiDung[i] * tongDiemNoiDungKetQua[i] / 100;
        }
      }
    }

    this.danhGiaNhanVien.tongDiemTuDanhGia = diemTuDanhGiaResult;
    this.danhGiaNhanVien.tongDiemDanhGia = diemDanhGiaResult;
    this.danhGiaNhanVien.tongKetQua = ketQuaResult;

    let diemDanhGiaCate = this.listMucDanhGia.find(x => x.diemTu <= diemDanhGiaResult && x.diemDen >= diemDanhGiaResult);
    let diemTuDanhGiaCate = this.listMucDanhGia.find(x => x.diemTu <= diemTuDanhGiaResult && x.diemDen >= diemTuDanhGiaResult);
    let diemKetQuaCate = this.listMucDanhGia.find(x => x.diemTu <= ketQuaResult && x.diemDen >= ketQuaResult);

    // if(diemKetQuaCate){
    //   this.mucDanhGiaMasterDataTruongPhong = diemKetQuaCate;
    // }

    this.diemTuDanhGia = diemTuDanhGiaCate ? diemTuDanhGiaCate.mucDanhGiaMasterDataName + " ( " + diemTuDanhGiaResult + " )" : "";
    this.diemDanhGia = diemDanhGiaCate ? diemDanhGiaCate.mucDanhGiaMasterDataName + " ( " + diemDanhGiaResult + " )" : "";
    this.ketQua = diemKetQuaCate ? diemKetQuaCate.mucDanhGiaMasterDataName + " ( " + ketQuaResult + " )" : "";
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  thoat() {
    this.location.back(); // <-- go back to previous location on cancel
  }

  setDefaultValue() {

  }

  luuDanhGia() {

  }

  async luuOrHoanThanhDanhGia(isClickHoanThanh: boolean) {
    //N???u l?? b?????c 3 th?? b???t ng?????i d??ng ch???n m???c ????nh gi?? r submit
    if (this.trangThaiDanhGia == 3 && this.mucDanhGiaMasterDataTruongPhong == null) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: "Ch???n m???c ????nh gi?? cho nh??n vi??n" };
      this.showMessage(msg);
      return;
    }
    var danhGiaNhanVien = new DanhGiaNhanVien();
    danhGiaNhanVien.DanhGiaNhanVienId = this.danhGiaNhanVien.danhGiaNhanVienId;
    danhGiaNhanVien.NhanVienKyDanhGiaId = this.danhGiaNhanVien.nhanVienKyDanhGiaId;
    danhGiaNhanVien.OrganizationId = this.danhGiaNhanVien.organizationId;
    danhGiaNhanVien.PositionId = this.danhGiaNhanVien.positionId;
    danhGiaNhanVien.TongDiemTuDanhGia = this.danhGiaNhanVien.tongDiemTuDanhGia;
    danhGiaNhanVien.TongDiemDanhGia = this.danhGiaNhanVien.tongDiemDanhGia;
    danhGiaNhanVien.TongKetQua = this.danhGiaNhanVien.tongKetQua;
    danhGiaNhanVien.MucLuongCu = this.danhGiaNhanVien.mucLuongCu;
    danhGiaNhanVien.MucLuongDeXuatQuanLy = this.mucLuongDeXuatQL;
    danhGiaNhanVien.MucLuongDeXuatTruongPhong = this.mucLuongDeXuatTruongPhong;
    danhGiaNhanVien.NhanXetTruongPhong = this.nhanXetTruongPhong;
    danhGiaNhanVien.MucDanhGiaMasterDataId = this.mucDanhGiaMasterDataTruongPhong != null ? this.mucDanhGiaMasterDataTruongPhong.mucDanhGiaMasterDataId : null;
    danhGiaNhanVien.TrangThaiId = this.danhGiaNhanVien.trangThaiId;
    danhGiaNhanVien.TenantId = this.danhGiaNhanVien.tenantId;
    
    //Ki???m tra xem nh??n vi??n, qu???n l?? d?? nh???p ?????y ????? c??u tr??? l???i hay ch??a
    let checkCauTraLoiNV = false;
    let _listCauHoiMappingNV = this.listCauHoiMappingNV;
    _listCauHoiMappingNV.forEach(item => {
      //Nh??n vi??n t??? ????nh gi??
      if (this.trangThaiDanhGia == 1) {
        // <!-- Nh???p c??u tr??? l???i text -->
        if (item.loaiCauTraLoiId == 1 || item.loaiCauTraLoiId == 2 || item.loaiCauTraLoiId == 4 || item.loaiCauTraLoiId == 5) {
          if(!item.cauTraLoiText) checkCauTraLoiNV = true;
        }
        // <!-- Danh m???c item -->
        if (item.loaiCauTraLoiId == 0 || item.loaiCauTraLoiId == 2) {
          if(item.listDanhMucItemChose == null || item.listDanhMucItemChose.length == 0) checkCauTraLoiNV = true;
        }
        // <!-- L???a ch???n Yes/No -->
        if (item.loaiCauTraLoiId == 5 || item.loaiCauTraLoiId == 6) {
          if(item.cauTraLoiLuaChon == null) checkCauTraLoiNV = true;
        }
        //Ch???n ??i???m ????nh gi??
        if (item.loaiCauTraLoiId == 1 || item.loaiCauTraLoiId == 3) {
          //??i???m t??? ????nh gi??
          if(!item.diemTuDanhGia) checkCauTraLoiNV = true;
        }
      }
      //Qu???n l?? ????nh gi??
      else if (this.trangThaiDanhGia == 2) {
        //Ch???n ??i???m ????nh gi??
        if (item.loaiCauTraLoiId == 1 || item.loaiCauTraLoiId == 3) {
          //QU???n l?? ????nh gi??
          if(!item.diemDanhGia) checkCauTraLoiNV = true;
        }
      }
    });

    //Ki???m tra xem qu???n l?? ???? nh???p ?????u ????? c??u tr??? l???i hay ch??a
    let checkCauTraLoiQL = false;
    let _listCauHoiMappingQL = this.listCauHoiMappingQL;
    _listCauHoiMappingQL.forEach(item => {
      //Qu???n l?? c??u tr??? l???i ????nh gi?? 
      if (this.trangThaiDanhGia == 2) {
        // <!-- Nh???p c??u tr??? l???i text -->
        if (item.loaiCauTraLoiId == 1 || item.loaiCauTraLoiId == 2 || item.loaiCauTraLoiId == 4 || item.loaiCauTraLoiId == 5) {
          if(!item.cauTraLoiText) checkCauTraLoiQL = true;
        }
        // <!-- Danh m???c item -->
        if (item.loaiCauTraLoiId == 0 || item.loaiCauTraLoiId == 2) {
          if(item.listDanhMucItemChose == null || item.listDanhMucItemChose.length == 0) checkCauTraLoiQL = true;
        }
        // <!-- L???a ch???n Yes/No -->
        if (item.loaiCauTraLoiId == 5 || item.loaiCauTraLoiId == 6) {
          if(item.cauTraLoiLuaChon == null) checkCauTraLoiQL = true;
        }
      }
    });
    if (checkCauTraLoiNV) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "H??y nh???p ?????y ????? th??ng tin c??u tr??? l???i m???c nh??n vi??n t??? ????nh gi??!" };
      this.showMessage(msg);
      return;
    }
    if (checkCauTraLoiQL) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "H??y nh???p ?????y ????? th??ng tin c??u tr??? l???i m???c qu???n l?? ????nh gi??!" };
      this.showMessage(msg);
      return;
    }
    let listCauTraLoi = _listCauHoiMappingNV.concat(_listCauHoiMappingQL);
    listCauTraLoi.forEach(item => {
      if (item.loaiCauTraLoiId == 5 || item.loaiCauTraLoiId == 6) {
        item.cauTraLoiLuaChon = item.cauTraLoiLuaChon == "0" ? false : true;
      }
      if (item.loaiCauTraLoiId == 1 || item.loaiCauTraLoiId == 3) {
        item.diemTuDanhGia = item.diemTuDanhGia != null ? item.diemTuDanhGia.value : null;
        item.diemDanhGia = item.diemDanhGia != null ? item.diemDanhGia.value : null;
        item.ketQua = item.ketQua != null ? item.ketQua.value : null;
      }
    });
    this.loading = true;
    let result: any = await this.employeeService.luuOrHoanThanhDanhGia(danhGiaNhanVien, listCauTraLoi, isClickHoanThanh);
    this.loading = false;
    console.log(result)
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }
    let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
    this.showMessage(msg);
    this.getMasterData();
  }
}
