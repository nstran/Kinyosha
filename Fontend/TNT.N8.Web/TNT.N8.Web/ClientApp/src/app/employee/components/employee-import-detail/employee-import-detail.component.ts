import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms'

//SERVICES
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';

import { EmployeeService } from '../../services/employee.service';
import { CommonService } from '../../../shared/services/common.service';




class importEmployeeModel {
  EmployeeCode: string;
  EmployeeName: string;
  HoTenTiengAnh: string;
  FirstName: string;
  LastName: string;
  DateOfBirth: Date;
  Gender: string;
  OtherPhone: string;
  Phone: string;


  Email: string;
  model: string;
  QuocTich: string;
  DanToc: string;
  TonGiao: number;
  CodeMayChamCong: string;
  TenMayChamCong: string;


  MaTest: string;
  DiemTest: string;

  GradeTestingName: string;
  GradeTestingId: any;

  DeptCodeValueName: string;
  DeptCodeValueId: any;

  SubCode1ValueName: string;
  SubCode1ValueId: any;

  SubCode2ValueName: string;
  SubCode2ValueId: any;

  OrganizationIdName: string;
  OrganizationId: any;

  ProvinceIdName: string;
  ProvinceId: any;

  SocialInsuranceNumber: string;
  MaSoThueCaNhan: string;
  HealthInsuranceNumber: string;

  IdentityId: string;
  IdentityIddateOfIssue: Date;
  IdentityIdplaceOfIssue: string;
  NoiCapCmndtiengAnh: string;
  HoKhauThuongTruTv: string;
  HoKhauThuongTruTa: string;
  Address: string;
  AddressTiengAnh: string;

  BankCode: string;
  BankOwnerName: string;
  BankAccount: string;
  BankName: string;
  BienSo: string;
  LoaiXe: string;

  DienThoaiEmailLienHe: string;
  KinhNghiemLamViec: string;

  KyNangTayNgheName: string;
  KyNangTayNgheId: any;

  TomTatHocVan: string;
  ChuyenNganhHoc: string;
  TenTruongHocCaoNhat: string;

  BangCapCaoNhatDatDuocIdName: string;
  BangCapCaoNhatDatDuocId: any;

  PhuongThucTuyenDungIdName: string;
  PhuongThucTuyenDungId: any;

  CoPhi: string;
  MucPhi: number;

  NguonTuyenDungIdName: string;
  NguonTuyenDungId: any;

  SoPhepConLai: number;
  SoPhepDaSuDung: number;

  listStatus = [];
  isValid: boolean;
}

interface ResultDialog {
  status: boolean,
  statusImport: boolean
}

class Note {
  public code: string;
  public name: string;
}

class EmployeeEntityModel {
  EmployeeCode: string;
  EmployeeName: string;
  HoTenTiengAnh: string;
  FirstName: string;
  LastName: string;
  DateOfBirth: Date;
  Gender: string;
  OtherPhone: string;
  Phone: string;

  Email: string;
  model: string;
  QuocTich: string;
  DanToc: string;
  TonGiao: number;
  CodeMayChamCong: string;
  TenMayChamCong: string;


  MaTest: string;
  DiemTest: string;

  GradeTesting: any;

  DeptCodeValue: any;

  SubCode1: any;

  SubCode2: any;

  OrganizationId: any;

  ProvinceId: any;

  SocialInsuranceNumber: string;
  MaSoThueCaNhan: string;
  HealthInsuranceNumber: string;

  IdentityId: string;
  IdentityIddateOfIssue: Date;
  IdentityIdplaceOfIssue: string;
  NoiCapCmndtiengAnh: string;
  HoKhauThuongTruTv: string;
  HoKhauThuongTruTa: string;
  Address: string;
  AddressTiengAnh: string;

  BankCode: string;
  BankOwnerName: string;
  BankAccount: string;
  BankName: string;
  BienSo: string;
  LoaiXe: string;

  // DienThoaiEmailLienHe: string;
  // KinhNghiemLamViec: string;

  KyNangTayNghe: any;

  TomTatHocVan: string;
  ChuyenNganhHoc: string;
  TenTruongHocCaoNhat: string;

  BangCapCaoNhatDatDuocId: any;

  PhuongThucTuyenDungId: any;

  CoPhi: boolean;
  MucPhi: number;

  NguonTuyenDungId: any;

  SoPhepConLai: number;
  SoPhepDaSuDung: number;

}


@Component({
  selector: 'app-employee-import-detail',
  templateUrl: './employee-import-detail.component.html',
  styleUrls: ['./employee-import-detail.component.css']
})
export class EmployeeImportDetailComponent implements OnInit {
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem('auth'));
  userId = this.auth.UserId;
  loading: boolean = false;
  @ViewChild('myTable') myTable: Table;

  today: Date = new Date();

  listNote: Array<Note> = [
    /* required fields */
    { code: "required_UserName", name: "Nh???p m?? nh??n vi??n" },
    { code: "required_nameTV", name: "Nh???p h??? t??n ti???ng vi???t" },
    { code: "required_nameTA", name: "Nh???p h??? t??n ti???ng anh" },
    { code: "required_firstName", name: "Nh???p h???" },
    { code: "required_lastName", name: "Nh???p t??n" },
    { code: "required_birthDay", name: "Nh???p ng??y th??ng n??m sinh" },
    { code: "required_gioiTinh", name: "Nh???p gi???i t??nh" },
    { code: "required_sdtCaNhan", name: "Nh???p SDT c?? nh??n" },
    { code: "required_emailCaNhan", name: "Nh???p email c?? nh??n" },

    { code: "required_deptCode", name: "Nh???p DEPT-CODE" },
    { code: "required_SUB_CODE1", name: "Nh???p SUB-CODE1" },
    { code: "required_SUB_CODE2", name: "Nh???p SUB-CODE2" },

    // check m?? code
    { code: "wrong_GradeTestingName", name: "Grade Testing kh??ng ????ng " },
    { code: "wrong_DeptCodeValueName", name: "Dept Code kh??ng ????ng " },
    { code: "wrong_SubCode1ValueName", name: "SubCode1 kh??ng ????ng " },
    { code: "wrong_SubCode2ValueName", name: "SubCode2 kh??ng ????ng " },
    { code: "wrong_OrganizationIdName", name: "Ph??ng ban kh??ng ????ng " },
    { code: "wrong_ProvinceIdName", name: "?????a ??i???m l??m vi???c kh??ng ????ng " },
    { code: "wrong_BangCapCaoNhatDatDuocIdName", name: "B???ng c???p cao nh???t kh??ng ????ng " },
    { code: "wrong_PhuongThucTuyenDungIdName", name: "Ph????ng th???c tuy???n d???ng kh??ng ????ng " },
    { code: "wrong_NguonTuyenDungIdName", name: "Ngu???n tuy???n d???ng kh??ng ????ng " },
    { code: "wrong_KyNangTayNghe", name: "K??? n??ng t??i ngh??? kh??ng ????ng " },

    //Check m?? t??i s???n trong DB
    { code: "existEmpCode_inDB", name: "M?? nh??n vi??n ???? t???n t???i tr??n h??? th???ng" },
    { code: "existPhone_inDB", name: "S??? ??i???n tho???i c?? nh??n ???? t???n t???i tr??n h??? th???ng" },
    { code: "existEmail_inDB", name: "Email c?? nh??n ???? t???n t???i tr??n h??? th???ng" },
    { code: "existCodeMayChamCong_inDB", name: "Code m??y ch???m c??ng ???? t???n t???i tr??n h??? th???ng" },

    //Check m?? t??i s???n trong list
    { code: "existUserName_inList", name: "T??n t??i kho???n ???? t???n t???i trong danh s??ch nh???p excel" },
    { code: "existPhone_inList", name: "S??? ??i???n tho???i c?? nh??n ???? t???n t???i trong danh s??ch nh???p excel" },
    { code: "existEmail_inList", name: "Email c?? nh??n ???? t???n t???i trong danh s??ch nh???p excel" },
    { code: "existCodeMayChamCong_inList", name: "Code m??y ch???m c??ng ???? t???n t???i trong danh s??ch nh???p excel" },

    //Check s??? l??n h??n 0
    { code: "DiemTest_positive", name: "??i???m test ph???i l??n h??n 0" },
    { code: "SoPhepConLai_positive", name: "S??? ph??p c??n l???i ph???i l??n h??n 0" },
    { code: "SoPhepDaSuDung_positive", name: "S??? ph??p ???? s??? d???ng ph???i l??n h??n 0" },
  ]

  listTaiSanImport: Array<importEmployeeModel> = [];

  //table
  rows: number = 10;
  columns: Array<any> = [];
  selectedColumns: Array<any> = [];
  selectedEmployeeImport: Array<importEmployeeModel> = [];

  ListCapBac: Array<any> = [];
  ListDeptCode: Array<any> = [];
  ListSubCode1: Array<any> = [];
  ListSubCode2: Array<any> = [];
  ListPhongBan: Array<any> = [];
  ListBangCap: Array<any> = [];
  ListPTTD: Array<any> = [];
  ListKenhTd: Array<any> = [];
  ListProvince: Array<any> = [];
  ListEmployeeExportDate: Array<any> = [];
  ListKyNangTayNghe: Array<any> = [];

  //In list
  listUserName: Array<any> = [];
  listPhone: Array<any> = [];
  listEmail: Array<any> = [];
  listCodeMayChamCong: Array<any> = [];

  //In DB
  listEmpCodeDB: Array<any> = [];
  listPhoneDB: Array<any> = [];
  listEmailDB: Array<any> = [];
  listCodeMayChamCongDB: Array<any> = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    public employeeService: EmployeeService,
    public commonService: CommonService,
  ) {
    if (this.config.data) {
      this.listTaiSanImport = this.config.data.listTaiSanImport;
    }
  }

  async ngOnInit() {
    this.initTable();
    await this.getMasterdata();
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  initTable() {
    // numberInt
    // text
    this.columns = [
      { field: 'EmployeeCode', header: 'M?? nh??n vi??n', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: false },
      { field: 'EmployeeName', header: 'H??? t??n ti???ng Vi???t', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: false },
      { field: 'HoTenTiengAnh', header: 'H??? v?? t??n ti???ng Anh', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: false },
      { field: 'FirstName', header: 'First Name', textAlign: 'center', display: 'table-cell', width: '120px', type: 'text', isRequired: true, isList: false },
      { field: 'LastName', header: 'Last Name', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: true, isList: false },
      { field: 'DateOfBirth', header: 'Ng??y th??ng n??m sinh', textAlign: 'center', display: 'table-cell', width: '100px', type: 'date', isRequired: true, isList: false },

      { field: 'Gender', header: 'Gi???i t??nh', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: false },
      { field: 'OtherPhone', header: 'S??? ??i???n tho???i nh?? ri??ng', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'Phone', header: 'S??? Di ?????ng c?? nh??n', textAlign: 'left', display: 'table-cell', width: '120px', type: 'text', isRequired: true, isList: false },
      { field: 'Email', header: 'Email - Private', textAlign: 'left', display: 'table-cell', width: '100px', type: 'text', isRequired: true, isList: false },

      { field: 'QuocTich', header: 'Qu???c t???ch', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'DanToc', header: 'D??n t???c', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'TonGiao', header: 'T??n gi??o', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },


      { field: 'CodeMayChamCong', header: 'Code m??y ch???m c??ng', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'TenMayChamCong', header: 'H??? t??n m??y ch???m c??ng', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'MaTest', header: 'M?? testing', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'DiemTest', header: '??i???m test', textAlign: 'center', display: 'table-cell', width: '120px', type: 'text', isRequired: false, isList: false },
      { field: 'GradeTestingName', header: 'GRADE TESTING', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: true },

      { field: 'DeptCodeValueName', header: 'DEPT-CODE', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'SubCode1ValueName', header: 'SUB-CODE1', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'SubCode2ValueName', header: 'SUB-CODE2', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },

      { field: 'OrganizationIdName', header: 'Ph??ng ban', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: true },
      { field: 'ProvinceIdName', header: '?????a ??i???m l??m vi???c', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'SocialInsuranceNumber', header: 'S??? s??? BHXH', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },


      { field: 'MaSoThueCaNhan', header: 'M?? s??? thu???', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'HealthInsuranceNumber', header: 'M?? TH??? BHYT', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'IdentityId', header: 'S??? CMTND/ H??? chi???u', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'IdentityIddateOfIssue', header: 'Ng??y - Th??ng - N??m c???p', textAlign: 'center', display: 'table-cell', width: '150px', type: 'date', isRequired: false, isList: false },


      { field: 'IdentityIdplaceOfIssue', header: 'N??i c???p_ Ti???ng vi???t', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'NoiCapCmndtiengAnh', header: 'N??i c???p ti???ng Anh', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'HoKhauThuongTruTv', header: 'H??? kh???u th?????ng tr??_Ti???ng Vi???t', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'HoKhauThuongTruTa', header: 'H??? kh???u th?????ng tr??_Ti???ng Anh', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },

      { field: 'Address', header: 'N??i ??? hi???n t???i_Ti???ng Vi???t', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'AddressTiengAnh', header: 'N??i ??? hi???n t???i_Ti???ng Anh', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'BankCode', header: 'BANK CODE', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'BankOwnerName', header: 'Ch??? t??i kho???n ng??n h??ng', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'BankAccount', header: 'S??? t??i kho???n', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'BankName', header: 'T??n ng??n h??ng & ?????a ch??? ng??n h??ng', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'BienSo', header: 'Bi???n s??? xe ', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'LoaiXe', header: 'Lo???i xe', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'DienThoaiEmailLienHe', header: '??i???n tho???i v?? email li??n h???', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },

      { field: 'KinhNghiemLamViec', header: 'Kinh nghi???m l??m vi???c', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'KyNangTayNgheName', header: 'K??? n??ng, tay ngh???', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: true },
      { field: 'TomTatHocVan', header: 'T??m t???t h???c v???n', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'ChuyenNganhHoc', header: 'Chuy??n ng??nh h???c', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'TenTruongHocCaoNhat', header: 'T??n tr?????ng h???c cao nh???t ti???ng Vi???t', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'BangCapCaoNhatDatDuocIdName', header: 'B???NG C???P CAO NH???T ?????T ???????C Ti???ng Vi???t', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: true },

      { field: 'PhuongThucTuyenDungIdName', header: 'Ph????ng th???c tuy???n d???ng', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: true },
      { field: 'CoPhi', header: 'C?? ph??/ mi???n ph??', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'MucPhi', header: 'M???c ph??', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'NguonTuyenDungIdName', header: 'Qua ngu???n n??o', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: true },
      { field: 'SoPhepConLai', header: 'S???  ph??p c??n l???i', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'SoPhepDaSuDung', header: 'S??? ph??p ???? s??? d???ng', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },

      { field: 'listStatus', header: 'Tr???ng th??i', textAlign: 'left', display: 'table-cell', width: '250px', type: 'listStatus' },
    ];
  }

  async getMasterdata() {
    let result: any = await this.employeeService.getMasterDateImportEmployee(1);
    this.loading = false;
    if (result.statusCode == 200) {
      this.ListCapBac = result.listCapBac;
      this.ListDeptCode = result.listDeptCode;
      this.ListSubCode1 = result.listSubCode1;
      this.ListSubCode2 = result.listSubCode2;
      this.ListPhongBan = result.listPhongBan;
      this.ListKyNangTayNghe = result.listKyNangTayNghe;
      this.ListBangCap = result.listBangCap;
      this.ListPTTD = result.listPTTD;
      this.ListKenhTd = result.listKenhTd;
      this.ListProvince = result.listProvince;

      this.listEmpCodeDB = result.listEmpCode;
      this.listPhoneDB = result.listPhone;
      this.listEmailDB = result.listEmail;
      this.listCodeMayChamCongDB = result.listCodeMayChamCong;

      this.listUserName = this.listTaiSanImport.map(x => x.EmployeeCode.toUpperCase().trim());
      this.listPhone = this.listTaiSanImport.map(x => x.Phone.toUpperCase().trim());
      this.listEmail = this.listTaiSanImport.map(x => x.Email.toUpperCase().trim());
      this.listCodeMayChamCong = this.listTaiSanImport.map(x => x.CodeMayChamCong.toUpperCase().trim());
      this.checkStatus(true);
    }
    else {
      let mgs = { severity: 'error', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
    }
  }

  selectRow(checkValue) {
    if (checkValue) {
      this.selectedEmployeeImport = this.listTaiSanImport.filter(e => e.isValid);
    } else {
      this.selectedEmployeeImport = [];
    }
  }

  checkStatus(autoAdd: boolean) {

    this.listUserName = this.listTaiSanImport.map(x => x.EmployeeCode.toUpperCase().trim());
    this.listPhone = this.listTaiSanImport.map(x => x.Phone.toUpperCase().trim());
    this.listEmail = this.listTaiSanImport.map(x => x.Email.toUpperCase().trim());
    this.listCodeMayChamCong = this.listTaiSanImport.map(x => x.CodeMayChamCong.toUpperCase().trim());

    this.listTaiSanImport.forEach(employee => {
      employee.listStatus = [];
      employee.isValid = true;

      employee.NguonTuyenDungIdName = employee.NguonTuyenDungId != null ? employee.NguonTuyenDungId.categoryName : employee.NguonTuyenDungIdName;
      employee.PhuongThucTuyenDungIdName = employee.PhuongThucTuyenDungId != null ? employee.PhuongThucTuyenDungId.categoryName : employee.PhuongThucTuyenDungIdName;
      employee.BangCapCaoNhatDatDuocIdName = employee.BangCapCaoNhatDatDuocId != null ? employee.BangCapCaoNhatDatDuocId.categoryName : employee.BangCapCaoNhatDatDuocIdName;
      employee.KyNangTayNgheName = employee.KyNangTayNgheId != null ? employee.KyNangTayNgheId.name : employee.KyNangTayNgheName;
      employee.ProvinceIdName = employee.ProvinceId != null ? employee.ProvinceId.provinceName : employee.ProvinceIdName;
      employee.OrganizationIdName = employee.OrganizationId != null ? employee.OrganizationId.organizationName : employee.OrganizationIdName;
      employee.SubCode2ValueName = employee.SubCode2ValueId != null ? employee.SubCode2ValueId.name : employee.SubCode2ValueName;
      employee.SubCode1ValueName = employee.SubCode1ValueId != null ? employee.SubCode1ValueId.name : employee.SubCode1ValueName;
      employee.DeptCodeValueName = employee.DeptCodeValueId != null ? employee.DeptCodeValueId.name : employee.DeptCodeValueName;
      employee.GradeTestingName = employee.GradeTestingId != null ? employee.GradeTestingId.categoryName : employee.GradeTestingName;

      //Check duplicate in list
      if (employee.EmployeeCode) {
        let check = this.listUserName.filter(x => x.toUpperCase().trim() == employee.EmployeeCode.toUpperCase().trim());
        if (check.length > 1) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existUserName_inList")];
          employee.isValid = false;
        }
      }

      if (employee.Phone) {
        let check = this.listPhone.filter(x => x.toUpperCase().trim() == employee.Phone.toUpperCase().trim());
        if (check.length > 1) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existPhone_inList")];
          employee.isValid = false;
        }
      }

      if (employee.Email) {
        let check = this.listEmail.filter(x => x.toUpperCase().trim() == employee.Email.toUpperCase().trim());
        if (check.length > 1) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existEmail_inList")];
          employee.isValid = false;
        }
      }

      if (employee.CodeMayChamCong) {
        let check = this.listCodeMayChamCong.filter(x => x.toUpperCase().trim() == employee.CodeMayChamCong.toUpperCase().trim());
        if (check.length > 1) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existCodeMayChamCong_inList")];
          employee.isValid = false;
        }
      }

      //Check duplicate in DB
      if (employee.EmployeeCode) {
        let check = this.listEmpCodeDB.filter(x => x.toUpperCase().trim() == employee.EmployeeCode.toUpperCase().trim());
        if (check.length != 0) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existEmpCode_inDB")];
          employee.isValid = false;
        }
      }

      if (employee.Phone) {
        let check = this.listPhoneDB.filter(x => x.toUpperCase().trim() == employee.Phone.toUpperCase().trim());
        if (check.length != 0) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existPhone_inDB")];
          employee.isValid = false;
        }
      }

      if (employee.Email) {
        let check = this.listEmailDB.filter(x => x.toUpperCase().trim() == employee.Email.toUpperCase().trim());
        if (check.length != 0) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existEmail_inDB")];
          employee.isValid = false;
        }
      }

      if (employee.CodeMayChamCong) {
        let check = this.listCodeMayChamCongDB.filter(x => x.toUpperCase().trim() == employee.CodeMayChamCong.toUpperCase().trim());
        if (check.length != 0) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "existCodeMayChamCong_inDB")];
          employee.isValid = false;
        }
      }

      /* required fields */
      if (!employee?.EmployeeCode.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_UserName")];
        employee.isValid = false;
      }

      if (!employee?.EmployeeName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_nameTV")];
        employee.isValid = false;
      }

      if (!employee?.HoTenTiengAnh.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_nameTA")];
        employee.isValid = false;
      }

      if (!employee?.FirstName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_firstName")];
        employee.isValid = false;
      }

      if (!employee?.LastName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_lastName")];
        employee.isValid = false;
      }


      if (!employee?.DateOfBirth) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_birthDay")];
        employee.isValid = false;
      }

      if (!employee?.Gender.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_gioiTinh")];
        employee.isValid = false;
      }

      if (!employee?.Phone.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_sdtCaNhan")];
        employee.isValid = false;
      }

      if (!employee?.Email.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_emailCaNhan")];
        employee.isValid = false;
      }

      if (!employee?.DeptCodeValueName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_deptCode")];
        employee.isValid = false;
      }

      if (!employee?.SubCode1ValueName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_SUB_CODE1")];
        employee.isValid = false;
      }

      if (!employee?.SubCode2ValueName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_SUB_CODE2")];
        employee.isValid = false;
      }

      if (!employee?.ProvinceIdName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_diaDiemLamViec")];
        employee.isValid = false;
      }

      if (!employee?.SubCode2ValueName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_thoiGianKhauHao")];
        employee.isValid = false;
      }
      if (!employee?.SubCode2ValueName.trim()) {
        employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "required_thoiDiemBdTinhKhauHao")];
        employee.isValid = false;
      }

      //check t??n
      if (employee.GradeTestingName) {
        let GradeTesting = this.ListCapBac.find(x => x.categoryName.toLowerCase().trim() == employee.GradeTestingName.toLowerCase().trim());
        if (!GradeTesting) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_GradeTestingName")];
          employee.isValid = false;
        } else {
          employee.GradeTestingId = GradeTesting;
        }
      }


      if (employee.DeptCodeValueName) {
        let DeptCodeValue = this.ListDeptCode.find(x => x.name.toLowerCase().trim() == employee.DeptCodeValueName.toLowerCase().trim());
        if (!DeptCodeValue) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_DeptCodeValueName")];
          employee.isValid = false;
        } else {
          employee.DeptCodeValueId = DeptCodeValue;
        }
      }


      if (employee.SubCode1ValueName) {
        let SubCode1Value = this.ListSubCode1.find(x => x.name.toLowerCase().trim() == employee.SubCode1ValueName.toLowerCase().trim());
        if (!SubCode1Value) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_SubCode1ValueName")];
          employee.isValid = false;
        } else {
          employee.SubCode1ValueId = SubCode1Value;
        }
      }


      if (employee.SubCode2ValueName) {
        let SubCode2Value = this.ListSubCode2.find(x => x.name.toLowerCase().trim() == employee.SubCode2ValueName.toLowerCase().trim());
        if (!SubCode2Value) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_SubCode2ValueName")];
          employee.isValid = false;
        } else {
          employee.SubCode2ValueId = SubCode2Value;
        }
      }


      if (employee.OrganizationIdName) {
        let organizationName = this.ListPhongBan.find(x => x.organizationName.toLowerCase().trim() == employee.OrganizationIdName.toLowerCase().trim());
        if (!organizationName) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_OrganizationIdName")];
          employee.isValid = false;
        } else {
          employee.OrganizationId = organizationName;
        }
      }

      if (employee.ProvinceIdName) {
        let Province = this.ListProvince.find(x => x.provinceName.toLowerCase().trim() == employee.ProvinceIdName.toLowerCase().trim());
        if (!Province) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_ProvinceIdName")];
          employee.isValid = false;
        } else {
          employee.ProvinceId = Province;
        }
      }

      if (employee.KyNangTayNgheName) {
        let KyNangTayNgheName = this.ListKyNangTayNghe.find(x => x.name.toLowerCase().trim() == employee.KyNangTayNgheName.toLowerCase().trim());
        if (!KyNangTayNgheName) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_KyNangTayNghe")];
          employee.isValid = false;
        } else {
          employee.KyNangTayNgheId = KyNangTayNgheName;
        }
      }

      if (employee.BangCapCaoNhatDatDuocIdName) {
        let BangCapCaoNhatDatDuoc = this.ListBangCap.find(x => x.categoryName.toLowerCase().trim() == employee.BangCapCaoNhatDatDuocIdName.toLowerCase().trim());
        if (!BangCapCaoNhatDatDuoc) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_BangCapCaoNhatDatDuocIdName")];
          employee.isValid = false;
        } else {
          employee.BangCapCaoNhatDatDuocId = BangCapCaoNhatDatDuoc;
        }
      }

      if (employee.PhuongThucTuyenDungIdName) {
        let PhuongThucTuyenDung = this.ListPTTD.find(x => x.categoryName.toLowerCase().trim() == employee.PhuongThucTuyenDungIdName.toLowerCase().trim());
        if (!PhuongThucTuyenDung) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_PhuongThucTuyenDungIdName")];
          employee.isValid = false;
        } else {
          employee.PhuongThucTuyenDungId = PhuongThucTuyenDung;
        }
      }

      if (employee.NguonTuyenDungIdName) {
        let NguonTuyenDung = this.ListKenhTd.find(x => x.categoryName.toLowerCase().trim() == employee.NguonTuyenDungIdName.toLowerCase().trim());
        if (!NguonTuyenDung) {
          employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "wrong_NguonTuyenDungIdName")];
          employee.isValid = false;
        } else {
          employee.NguonTuyenDungId = NguonTuyenDung;
        }
      }

      //S??? ph???i l???n h??n 0
      if (employee.DiemTest) {
        if (Number(employee.DiemTest) != NaN) {
          if (Number(employee.DiemTest) < 0) {
            employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "DiemTest_positive")];
            employee.isValid = false;
          }
        }
      }

      if (employee.SoPhepConLai) {
        if (Number(employee.SoPhepConLai) != NaN) {
          if (Number(employee.SoPhepConLai) < 0) {
            employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "SoPhepConLai_positive")];
            employee.isValid = false;
          }
        }
      }

      if (employee.SoPhepDaSuDung) {
        if (Number(employee.SoPhepDaSuDung) != NaN) {
          if (Number(employee.SoPhepDaSuDung) < 0) {
            employee.listStatus = [...employee.listStatus, this.listNote.find(e => e.code == "SoPhepDaSuDung_positive")];
            employee.isValid = false;
          }
        }
      }

    });

    /* auto add to valid list */
    // if (autoAdd) this.selectedEmployeeImport = this.listTaiSanImport.filter(e => e.isValid);
  }

  onCancel() {
    let result: ResultDialog = {
      status: false,
      statusImport: false
    };
    this.ref.close(result);
  }

  async importCustomer() {
    /* check valid list selected */
    if (this.selectedEmployeeImport.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o', detail: 'Ch???n danh s??ch c???n import' };
      this.showMessage(msg);
      return;
    }
    let inValidRecord = this.selectedEmployeeImport.find(e => !e.isValid);
    if (inValidRecord) {
      let msg = { severity: 'error', summary: 'Th??ng b??o', detail: 'Danh s??ch kh??ng h???p l???' };
      this.showMessage(msg);
      return;
    }
    this.checkStatus(false);
    this.standardizedListCustomer();
    let listEmpAdditional: Array<EmployeeEntityModel> = [];
    this.selectedEmployeeImport.forEach(item => {
      var newEmp = this.mapFormToEmployeeModel(item);
      listEmpAdditional.push(newEmp);
    });
    console.log('listEmpAdditional', listEmpAdditional)
    this.loading = true;
    let result: any = await this.employeeService.importEmployee(listEmpAdditional);
    this.loading = false;
    if (result.statusCode === 200) {
      let mgs = { severity: 'success', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
      this.ref.close(result);
    } else {
      let mgs = { severity: 'error', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
      this.getMasterdata();
      this.checkStatus(true);
    }
  }

  standardizedListCustomer() {
    this.listTaiSanImport.forEach(customer => {
      // customer.materialID = customer.materialID?.trim() ?? "";
    });
  }

  mapFormToEmployeeModel(employee): EmployeeEntityModel {
    let employeeModel = new EmployeeEntityModel();
    employeeModel.EmployeeCode = employee.EmployeeCode.trim();
    employeeModel.EmployeeName = employee.EmployeeName.trim();
    employeeModel.HoTenTiengAnh = employee.HoTenTiengAnh.trim();
    employeeModel.FirstName = employee.FirstName;
    employeeModel.LastName = employee.LastName;
    employeeModel.DateOfBirth = convertToUTCTime(new Date(employee.DateOfBirth));
    employeeModel.Gender = employee.Gender;
    employeeModel.OtherPhone = employee.OtherPhone;
    employeeModel.Phone = employee.Phone;
    employeeModel.model = employee.model;
    employeeModel.Email = employee.Email;
    employeeModel.model = employee.model;
    employeeModel.QuocTich = employee.QuocTich;
    employeeModel.DanToc = employee.DanToc;
    employeeModel.TonGiao = employee.TonGiao;
    employeeModel.CodeMayChamCong = employee.CodeMayChamCong;
    employeeModel.TenMayChamCong = employee.TenMayChamCong;
    employeeModel.MaTest = employee.MaTest;
    employeeModel.DiemTest = employee.DiemTest;
    employeeModel.GradeTesting = employee.GradeTesting != null ? employee.GradeTesting.categoryName : '';
    employeeModel.DeptCodeValue = employee.DeptCodeValueId != null ? employee.DeptCodeValueId.value : '';
    employeeModel.SubCode1 = employee.SubCode1ValueId != null ? employee.SubCode1ValueId.value : '';
    employeeModel.SubCode2 = employee.SubCode2ValueId != null ? employee.SubCode2ValueId.value : '';
    employeeModel.OrganizationId = employee.OrganizationId != null ? employee.OrganizationId.organizationId : '';
    employeeModel.ProvinceId = employee.ProvinceId != null ? employee.ProvinceId.provinceId : "";
    employeeModel.SocialInsuranceNumber = employee.SocialInsuranceNumber;
    employeeModel.MaSoThueCaNhan = employee.MaSoThueCaNhan;
    employeeModel.HealthInsuranceNumber = employee.HealthInsuranceNumber;
    employeeModel.IdentityId = employee.IdentityId;
    employeeModel.IdentityIddateOfIssue = employee.IdentityIddateOfIssue != null ? convertToUTCTime(new Date(employee.IdentityIddateOfIssue)) : null;
    employeeModel.IdentityIdplaceOfIssue = employee.IdentityIdplaceOfIssue;
    employeeModel.NoiCapCmndtiengAnh = employee.NoiCapCmndtiengAnh;
    employeeModel.HoKhauThuongTruTv = employee.HoKhauThuongTruTv;
    employeeModel.HoKhauThuongTruTa = employee.HoKhauThuongTruTa;

    employeeModel.Address = employee.Address;
    employeeModel.AddressTiengAnh = employee.AddressTiengAnh;
    employeeModel.BankCode = employee.BankCode;
    employeeModel.BankOwnerName = employee.BankOwnerName;
    employeeModel.BankAccount = employee.BankAccount;
    employeeModel.BankName = employee.BankName;
    employeeModel.BienSo = employee.BienSo;
    employeeModel.LoaiXe = employee.LoaiXe;
    // employeeModel.DienThoaiEmailLienHe = employee.DienThoaiEmailLienHe;
    // employeeModel.KinhNghiemLamViec = employee.KinhNghiemLamViec;
    employeeModel.KyNangTayNghe = employee.KyNangTayNghe != null ? employee.KyNangTayNgheId.value : '';
    employeeModel.TomTatHocVan = employee.TomTatHocVan;
    employeeModel.ChuyenNganhHoc = employee.ChuyenNganhHoc;
    employeeModel.TenTruongHocCaoNhat = employee.TenTruongHocCaoNhat;
    employeeModel.BangCapCaoNhatDatDuocId = employee.BangCapCaoNhatDatDuocId != null ? employee.BangCapCaoNhatDatDuocId.categoryId : '';
    employeeModel.PhuongThucTuyenDungId = employee.PhuongThucTuyenDungId != null ? employee.PhuongThucTuyenDungId.categoryId : '';
    employeeModel.CoPhi = employee.CoPhi == 'C?? ph??' ? true : false;
    employeeModel.MucPhi = this.commonService.convertStringToNumber(employee.MucPhi.toString());
    employeeModel.NguonTuyenDungId = employee.NguonTuyenDungId != null ? employee.NguonTuyenDungId.categoryId : '';
    employeeModel.SoPhepConLai = employee.SoPhepConLai;
    employeeModel.SoPhepDaSuDung = employee.SoPhepDaSuDung;
    return employeeModel;
  }
  //end
}

function validateString(str: string) {
  if (str === undefined) return "";
  return str.trim();
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

