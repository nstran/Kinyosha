import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EmployeeService } from "../../services/employee.service";
import { EmployeeListService } from '../../services/employee-list/employee-list.service';
import { OrganizationService } from "../../../shared/services/organization.service";
import { EmployeeModel } from "../../models/employee.model";
import { ContactModel } from "../../../shared/models/contact.model";
import { UserModel } from '../../../shared/models/user.model';
import * as $ from 'jquery';
import { GetPermission } from '../../../shared/permission/get-permission';
import { OrganizationDialogComponent } from '../../../shared/components/organization-dialog/organization-dialog.component';
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";

import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { EmployeeImportDetailComponent } from '../employee-import-detail/employee-import-detail.component';
import { Workbook } from 'exceljs';
import { HopDongImportDetailComponent } from '../employee-profile/employee-details/hop-dong/hop-dong-import-detail/hop-dong-import-detail.component';
import { HopDongNhanSuModel } from '../../models/hop-dong-nhan-su.model';

interface Employee {
  index: number,
  employeeId: string,
  employeeName: string,
  organizationId: string,
  organizationName: string,
  employeeCode: string,
  positionId: string,
  createdById: string,
  createdDate: string,
  active: boolean,
  username: string,
  contactId: string,
}

class importTaiSanModel {
  maTaiSan: string;
  tenTaiSan: string;
  phanLoaiTaiSanId: string;
  donViTinhId: string;
  khuVucTaiSanId: string;
  ngayVaoSo: Date;
  moTa: string;
  soSerial: string;
  model: string;
  soHieu: string;
  thongTinNoiMua: string;
  namSx: number;
  nuocSxid: string;
  hangSxid: string;
  ngayMua: Date;
  thoiHanBaoHanh: number;
  baoDuongDinhKy: number;
  thongTinNoiBaoHanh: string;
  giaTriNguyenGia: number;
  giaTriTinhKhauHao: number;
  thoiGianKhauHao: number;
  thoiDiemBdtinhKhauHao: Date;

  nuocSxCode: string;
  hangSxCode: string;
  phanLoaiTaiSanCode: string;
  donViTinhCode: string;
  khuVucTaiSanCode: string;
}

class importCustomerModel {
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
  DeptCodeValueName: number;
  SubCode1Value: number;
  SubCode2Value: number;

  OrganizationIdName: string;
  ProvinceId: string;
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
  KyNangTayNghe: string;
  TomTatHocVan: string;
  ChuyenNganhHoc: string;
  TenTruongHocCaoNhat: string;
  BangCapCaoNhatDatDuocId: string;

  PhuongThucTuyenDungId: string;
  CoPhi: string;
  MucPhi: number;
  NguonTuyenDungId: string;
  SoPhepConLai: number;
  SoPhepDaSuDung: number;
}

class importHopDongModel {

  EmployeeCode: string;

  LoaiHopDong: string;
  LoaiHopDongId: string;

  SoHopDong: string;
  SoPhuLuc: string;

  NgayKyHD: Date;
  NgayBDLamViec: Date;
  NgayKetThucHD: Date;

  ChucVu: string;
  ChucVuId: string;

  MucLuong: number;
}



@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ListComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @HostListener('document:keyup', ['$event'])
  handleDeleteKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchEmployee();
    }
  }

  excelExport: Array<any> = [];
  userPermission: any = localStorage.getItem("UserPermission").split(',');
  createPermission: string = 'employee/create';

  units: Array<string> = [];
  listEmp: Array<Employee> = [];
  isManager: boolean = null;
  employeeId: string = null;

  currentOrganizationId: string = '';
  messages: any;

  selection: Array<any>;

  employeeModel = new EmployeeModel()
  contactModel = new ContactModel()
  userModel: UserModel = {
    UserId: null, Password: '123', UserName: '', EmployeeId: '', EmployeeCode: '', Disabled: false, CreatedById: 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', CreatedDate: null, UpdatedById: null, UpdatedDate: null, Active: true
  };
  empOrganizationNameDisplay = '';
  fromContractExpiryDate: Date = null;
  toContractExpiryDate: Date = null;
  fromBirthDay: Date = null;
  toBirthDay: Date = null;

  actionAdd: boolean = true;
  actionDownload: boolean = true;
  loading: boolean = false;
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  minYear: number = 2000;
  currentYear: number = (new Date()).getFullYear();
  maxEndDate: Date = new Date();
  filterGlobal: string;

  leftColNumber: number = 12;
  rightColNumber: number = 0;

  nowDate: Date = new Date();
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  @ViewChild('myTable') myTable: Table;
  colsList: any;
  selectedColumns: any[];

  isNhanSu: boolean = false;

  //import varriables
  displayChooseFileImportDialog: boolean = false;
  value: boolean = false;
  fileName: string = '';
  importFileExcel: any = null;

  //import contact
  displayChooseFileImportHopDong: boolean = false;

  listPosition = [];
  listLoaiHopDong = [];

  listHopDong: Array<HopDongNhanSuModel> = [];
  isShowButton: boolean = false;


  constructor(
    private translate: TranslateService,
    private getPermission: GetPermission,
    private organizationService: OrganizationService,
    private employeeListService: EmployeeListService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    public dialogService: DialogService,
  ) {
    translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  goToCreate() {
    this.router.navigate(['/employee/create']);
  }

  async ngOnInit() {
    let resource = "hrm/employee/list/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
      this.isManager = localStorage.getItem('IsManager') === "true" ? true : false;
      this.employeeId = JSON.parse(localStorage.getItem('auth')).EmployeeId;
      this.initTable();
      this.contactModel.FirstName = "";
      this.contactModel.LastName = "";
      this.userModel.UserName = "";
      this.contactModel.IdentityID = "";

      //N???u t??? Dashboard Nh??n s??? sang
      let ttt = this.route.params.subscribe(params => {
        let type = params['type'];
        let d = new Date();
        if (type == 'contract') {
          this.fromContractExpiryDate = new Date();
          this.toContractExpiryDate = new Date(d.setDate(d.getDate() + 30));
        } else if (type == 'birthday') {
          this.fromBirthDay = new Date();
          this.toBirthDay = new Date(d.setDate(d.getDate() + 14));
        }
      });

      this.searchEmployee();
    }
  }

  initTable() {
    this.colsList = [
      { field: 'employeeName', header: 'T??n', textAlign: 'left', display: 'table-cell', width: '15%' },
      { field: 'username', header: 'T??n t??i kho???n', textAlign: 'left', display: 'table-cell', width: '15%' },
      { field: 'employeeCode', header: 'M??', textAlign: 'left', display: 'table-cell', width: '15%' },
      { field: 'organizationName', header: '????n v???', textAlign: 'left', display: 'table-cell', width: '15%' },
      { field: 'isTruongBoPhan', header: 'Tr?????ng b??? ph???n', textAlign: 'center', display: 'table-cell', width: '15%' },
      { field: 'email', header: 'Email', textAlign: 'left', display: 'table-cell', width: '15%' },
      //{ field: 'numberChildren', header: 'S??? l?????ng con c??i', textAlign: 'right', display: 'table-cell', width: '15%' },
      //{ field: 'soPhepConLai', header: 'S??? ng??y ngh??? ph??p c??n l???i', textAlign: 'right', display: 'table-cell', width: '15%' },
    ];

    this.selectedColumns = this.colsList;
  }
  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  searchEmployee() {
    let fromContractExpiryDate = null;
    if (this.fromContractExpiryDate) {
      fromContractExpiryDate = this.fromContractExpiryDate;
      fromContractExpiryDate.setHours(0, 0, 0, 0);
      fromContractExpiryDate = convertToUTCTime(fromContractExpiryDate);
    }

    let toContractExpiryDate = null;
    if (this.toContractExpiryDate) {
      toContractExpiryDate = this.toContractExpiryDate;
      toContractExpiryDate.setHours(23, 59, 59, 999);
      toContractExpiryDate = convertToUTCTime(toContractExpiryDate);
    }

    let fromBirthDay = null;
    if (this.fromBirthDay) {
      fromBirthDay = this.fromBirthDay;
      fromBirthDay.setHours(0, 0, 0, 0);
      fromBirthDay = convertToUTCTime(fromBirthDay);
    }

    let toBirthDay = null;
    if (this.toBirthDay) {
      toBirthDay = this.toBirthDay;
      toBirthDay.setHours(23, 59, 59, 999);
      toBirthDay = convertToUTCTime(toBirthDay);
    }
    this.loading = true;
    this.employeeListService.searchEmployeeFromList(this.isManager, this.employeeId, this.contactModel.FirstName, this.contactModel.LastName,
      this.userModel.UserName, this.contactModel.IdentityID, [], this.employeeModel.OrganizationId, this.fromContractExpiryDate,
      this.toContractExpiryDate, this.fromBirthDay, this.toBirthDay, false).subscribe(response => {
        let result = <any>response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listEmp = result.employeeList;
          this.isNhanSu = result.isNhanSu;
          if (this.listEmp.length === 0) {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Kh??ng t??m th???y nh??n vi??n n??o!' };
            this.showMessage(msg);
          }
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
        this.currentOrganizationId = result.currentOrganizationId;
        // this.selection = new SelectionModel<EmployeeModel>(true, []);
        this.setIndex();
      }, error => { });
  };

  setIndex() {
    this.listEmp.forEach((item, index) => {
      item.index = index + 1;
    });
  }
  onViewDetail(rowData: any) {
    let currentUser = JSON.parse(localStorage.getItem('auth'));
    if (currentUser?.EmployeeId == rowData.employeeId || this.isNhanSu) {
      this.router.navigate(['/employee/detail', { employeeId: rowData.employeeId, contactId: rowData.contactId }]);
    } else {
      this.showMessage({ severity: 'warn', summary: 'Th??ng b??o:', detail: "B???n kh??ng c?? quy???n Qu???n l?? nh??n s???" })
    }

  }

  refreshFilter() {
    this.contactModel.FirstName = '';
    this.contactModel.LastName = '';
    this.userModel.UserName = '';
    this.contactModel.IdentityID = '';
    this.employeeModel.OrganizationId = this.currentOrganizationId;
    this.empOrganizationNameDisplay = '';
    this.fromContractExpiryDate = null;
    this.toContractExpiryDate = null;
    this.fromBirthDay = null;
    this.toBirthDay = null;

    this.filterGlobal = '';
    this.isShowFilterLeft = false;
    this.leftColNumber = 12;
    this.rightColNumber = 0;
    this.listEmp = [];
    this.searchEmployee();
  }

  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 8;
        this.rightColNumber = 4;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
  }

  dateFieldFormat: string = 'DD/MM/YYYY';
  sortColumnInList(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];

      /**Customize sort date */
      if (event.field == 'createdDate') {
        const date1 = moment(value1, this.dateFieldFormat);
        const date2 = moment(value2, this.dateFieldFormat);

        let result: number = -1;
        if (moment(date2).isBefore(date1, 'day')) { result = 1; }

        return result * event.order;
      }
      /**End */

      let result = null;

      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
    });
  }

  openOrgPopup() {
    let ref = this.dialogService.open(OrganizationDialogComponent, {
      data: {
        chooseFinancialIndependence: false
      },
      header: 'Ch???n ????n v???',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.employeeModel.OrganizationId = result.selectedOrgId;
          this.employeeModel.OrganizationName = result.selectedOrgName;
        }
      }
    });
  }


  async exportExcel() {
    if (this.selection == null) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o', detail: 'Vui l??ng ch???n nh??n vi??n!' };
      this.showMessage(mgs);
      return;
    }
    if (this.selection.length == 0) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o', detail: 'Vui l??ng ch???n nh??n vi??n!' };
      this.showMessage(mgs);
      return;
    }
    let listEmpId = this.selection.map(x => x.employeeId);
    this.loading = true;
    let listEmp = [];
    let result: any = await this.employeeService.getMasterDateImportEmployee(2, listEmpId);
    this.loading = false;
    if (result.statusCode === 200) {
      console.log(result);
      listEmp = result.listEmployeeExport;
      let mgs = { severity: 'success', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
    } else {
      let mgs = { severity: 'error', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
    }
    let title = `Danh s??ch nh??n vi??n`;
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);
    worksheet.addRow([]);
    /* title */
    let dataHeaderMain = ["", "Danh s??ch nh??n vi??n".toUpperCase()];
    let headerMain = worksheet.addRow(dataHeaderMain);
    headerMain.font = { size: 18, bold: true };
    headerMain.getCell(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.mergeCells(`B${2}:E${2}`);
    worksheet.addRow([]);

    let excel = [
      { name: '', key: '' },
      { name: 'STT', key: 'index' },
      { name: 'T??n', key: 'employeeName' },
      { name: 'T??n t??i kho???n', key: 'username' },
      { name: 'M??', key: 'employeeCode' },
      { name: 'Ph??ng ban', key: 'organizationName' },
      { name: 'Ch???c v???', key: 'positionName' },
      { name: 'FirstName', key: 'firstName' },
      { name: 'LastName', key: 'lastName' },
      { name: 'H??? t??n ti???ng anh', key: 'hoTenTiengAnh' },
      { name: 'Ng??y-Th??ng-N??m sinh', key: 'dateOfBirth' },
      { name: 'Gi???i t??nh', key: 'gender' },
      { name: 'S??? ??i???n tho???i nh?? ri??ng', key: 'otherPhone' },
      { name: 'S??? di ?????ng c?? nh??n', key: 'phone' },
      { name: 'Email c?? nh??n', key: 'email' },
      { name: 'Email c??ng ty', key: 'workEmail' },
      { name: '?????a ch??? ti???ng vi???t', key: 'address' },
      { name: '?????a ch??? ti???ng anh', key: 'addressTiengAnh' },
      { name: 'Qu???c t???ch', key: 'quocTich' },
      { name: 'D??n t???c', key: 'danToc' },
      { name: 'T??n gi??o', key: 'tonGiao' },
      { name: 'Code m??y ch???m c??ng', key: 'codeMayChamCong' },
      { name: 'H??? t??n m??y ch???m c??ng', key: 'tenMayChamCong' },
      { name: 'Ng??y b???t ?????u ch???m c??ng', key: 'startDateMayChamCong' },
      { name: 'M?? testing', key: 'maTest' },
      { name: '??i???m test', key: 'diemTest' },
      { name: 'GRADE TESTING', key: 'gradeTesting' },
      { name: 'DEPT-CODE', key: 'deptCode' },
      { name: 'SUBCODE1', key: 'subCode1Name' },
      { name: 'SUBCODE2', key: 'subCode2Name' },
      { name: '?????a ??i???m l??m vi???c', key: 'provinceName' },
      { name: 'S??? s??? BHXH', key: 'soSoBHXH' },
      { name: 'M?? s??? thu???', key: 'maSoThueCaNhan' },
      { name: 'M?? th??? BHYT', key: 'maTheBHYT' },
      { name: 'S??? CMTND/H??? chi???u', key: 'identity' },
      { name: 'Ng??y-Th??ng-N??m-C???p', key: 'identityIddateOfIssue' },
      { name: 'N??i c???p ti???ng vi???t', key: 'identityIdplaceOfIssue' },
      { name: 'N??i c???p ti???ng anh', key: 'noiCapCmndtiengAnh' },
      { name: 'N??i ??? hi???n t???i ti???ng vi???t', key: 'hoKhauThuongTruTv' },
      { name: 'N??i ??? hi???n t???i ti???ng anh', key: 'hoKhauThuongTruTa' },
      { name: 'BANK CODE', key: 'bankCode' },
      { name: 'Ch??? t??i kho???n', key: 'bankOwnerName' },
      { name: 'S??? t??i kho???n', key: 'bankAccount' },
      { name: 'T??n ng??n h??ng', key: 'bankName' },
      { name: '?????a ch??? ng??n h??ng', key: 'bankAddress' },
      { name: 'Bi???n s??? xe', key: 'bienSo' },
      { name: 'Lo???i xe', key: 'loaiXe' },
      { name: 'Chuy??n ng??nh h???c', key: 'chuyenNganhHoc' },
      { name: 'T??n tr?????ng h???c cao nh???t', key: 'tenTruongHocCaoNhat' },
      { name: 'B???ng c???p cao nh???t ?????i ???????c', key: 'bangCapCaoNhatDatDuocName' },
      { name: 'K??? n??ng tay ngh???', key: 'kyNangTayNghe' },
      { name: 'T??m t???t h???c v???n', key: 'tomTatHocVan' },
      { name: 'Ph????ng th???c tuy???n d???ng', key: 'phuongThucTuyenDungName' },
      { name: 'Ngu???n tuy???n d???ng', key: 'nguonTuyenDungName' },
      { name: 'M???c ph??', key: 'mucPhi' },
      { name: 'M?? th??? b???o hi???m loft-care', key: 'maTheBHLoftCare' },
      { name: 'Th??ng n???p ????ng k?? gi???m tr???', key: 'thangNopDangKyGiamTru' },
      { name: 'Lo???i h???p ?????ng', key: 'contractName' },
      { name: 'Ng??y h???t h???n h???p ?????ng', key: 'contractEndDate' },
      { name: 'Ng??y k???t th??c th??? vi???c', key: 'probationEndDate' },
      { name: 'Ng??y b???t ?????u th??? vi???c', key: 'probationStartDate' },
      { name: 'Ng??y b???t ?????u ????o t???o ', key: 'trainingStartDate' },
      { name: 'Chi ph?? theo gi???', key: 'chiPhiTheoGio' },
      { name: 'C???p b???c', key: 'capBacName' },
      { name: 'S??? l?????ng con c??i', key: 'numberChildren' },
    ]

    let dataHeaderRow1: Array<string> = excel.map(x => x.name);
    let headerRow1 = worksheet.addRow(dataHeaderRow1);
    headerRow1.font = { name: 'Time New Roman', size: 10, bold: true };
    headerRow1.height = 30;
    dataHeaderRow1.forEach((item, index) => {
      if (index + 2 < dataHeaderRow1.length + 1) {
        headerRow1.getCell(index + 2).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        headerRow1.getCell(index + 2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRow1.getCell(index + 2).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '8DB4E2' }
        };
      }
    });

    //????? data
    let data: Array<any> = [];
    let key = excel.map(x => x.key);
    listEmp?.forEach((item, index) => {
      let array_Row: Array<any> = [];
      key.forEach((itemKey, indexKey) => {
        if (itemKey == 'index') {
          array_Row[indexKey + 1] = index + 1;
        } else {
          if (itemKey == 'dateOfBirth' || itemKey == 'startDateMayChamCong' || itemKey == 'identityIddateOfIssue' || itemKey == 'contractEndDate'
            || itemKey == 'probationEndDate' || itemKey == 'probationStartDate' || itemKey == 'trainingStartDate') {
            array_Row[indexKey + 1] = item[itemKey] != null ? new Date(item[itemKey]).toLocaleDateString("en-US") : '';
          } else {
            array_Row[indexKey + 1] = item[itemKey];
          }
        }
      })
      data.push(array_Row);
    });

    //K??? vi???n b???ng
    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };
      for (let i = 2; i <= key.length; i++) {
        row.getCell(i).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getColumn(i).width = 30;
      }
      row.height = 30;
    });
    this.exportToExel(workBook, title);
  }


  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }


  onpenDialogChoseFileExcel() {
    this.displayChooseFileImportDialog = true;
  }

  async downloadTemplateExcel() {
    this.loading = true;
    let result: any = await this.employeeService.downloadTemplateImportEmployee();
    this.loading = false;
    if (result.templateExcel != null && result.statusCode === 200) {
      const binaryString = window.atob(result.templateExcel);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      for (let idx = 0; idx < binaryLen; idx++) {
        const ascii = binaryString.charCodeAt(idx);
        bytes[idx] = ascii;
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const fileName = result.fileName + ".xls";
      link.download = fileName;
      link.click();
    } else {
      this.displayChooseFileImportDialog = false;
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Download file th???t b???i' };
      this.showMessage(msg);
    }
  }

  chooseFile(event: any) {
    this.fileName = event.target?.files[0]?.name;
    this.importFileExcel = event.target;
  }

  importExcel() {
    if (this.fileName == "") {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "Ch??a ch???n file c???n nh???p" };
      this.showMessage(mgs);
      return;
    }

    const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(targetFiles.files[0]);
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellText: true });
      let code = 'Import_NhanVien';
      if (!workbook.Sheets[code]) {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
        this.showMessage(mgs);
        return;
      }


      let columns = [
        { field: 'EmployeeCode', type: 'text', isRequired: true },
        { field: 'EmployeeName', type: 'text', isRequired: true },
        { field: 'HoTenTiengAnh', type: 'text', isRequired: true },
        { field: 'FirstName', type: 'text', isRequired: true },
        { field: 'LastName', type: 'text', isRequired: true },
        { field: 'DateOfBirth', type: 'date', isRequired: true },

        { field: 'Gender', type: 'text', isRequired: true },
        { field: 'OtherPhone', type: 'text', isRequired: false },
        { field: 'Phone', type: 'text', isRequired: true },
        { field: 'Email', type: 'text', isRequired: true },

        { field: 'QuocTich', type: 'text', isRequired: false },
        { field: 'DanToc', type: 'text', isRequired: false },
        { field: 'TonGiao', type: 'text', isRequired: false },
        { field: 'CodeMayChamCong', type: 'text', isRequired: false },
        { field: 'TenMayChamCong', type: 'text', isRequired: false },

        { field: 'MaTest', type: 'text', isRequired: false },
        { field: 'DiemTest', type: 'text', isRequired: false },
        { field: 'GradeTestingName', type: 'text', isRequired: false },
        { field: 'DeptCodeValueName', type: 'text', isRequired: true },
        { field: 'SubCode1ValueName', type: 'text', isRequired: true },

        { field: 'SubCode2ValueName', type: 'text', isRequired: true },
        { field: 'OrganizationIdName', type: 'text', isRequired: false },
        { field: 'ProvinceIdName', type: 'text', isRequired: true },
        { field: 'SocialInsuranceNumber', type: 'text', isRequired: false },
        { field: 'MaSoThueCaNhan', type: 'text', isRequired: false },

        { field: 'HealthInsuranceNumber', type: 'text', isRequired: false },
        { field: 'IdentityId', type: 'text', isRequired: false },
        { field: 'IdentityIddateOfIssue', type: 'date', isRequired: false },
        { field: 'IdentityIdplaceOfIssue', type: 'text', isRequired: false },
        { field: 'NoiCapCmndtiengAnh', type: 'text', isRequired: false },

        { field: 'HoKhauThuongTruTv', type: 'text', isRequired: false },
        { field: 'HoKhauThuongTruTa', type: 'text', isRequired: false },
        { field: 'Address', type: 'text', isRequired: false },
        { field: 'AddressTiengAnh', type: 'text', isRequired: false },
        { field: 'BankCode', type: 'text', isRequired: false },

        { field: 'BankOwnerName', type: 'text', isRequired: false },
        { field: 'BankAccount', type: 'text', isRequired: false },
        { field: 'BankName', type: 'text', isRequired: false },
        { field: 'BienSo', type: 'text', isRequired: false },
        { field: 'LoaiXe', type: 'text', isRequired: false },

        { field: 'DienThoaiEmailLienHe', type: 'text', isRequired: false },
        { field: 'KinhNghiemLamViec', type: 'text', isRequired: false },
        { field: 'KyNangTayNgheName', type: 'text', isRequired: false },
        { field: 'TomTatHocVan', type: 'text', isRequired: false },
        { field: 'ChuyenNganhHoc', type: 'text', isRequired: false },

        { field: 'TenTruongHocCaoNhat', type: 'text', isRequired: false },
        { field: 'BangCapCaoNhatDatDuocIdName', type: 'text', isRequired: false },
        { field: 'PhuongThucTuyenDungIdName', type: 'text', isRequired: false },
        { field: 'CoPhi', type: 'text', isRequired: false },
        { field: 'MucPhi', type: 'text', isRequired: false },

        { field: 'NguonTuyenDungIdName', type: 'text', isRequired: false },
        { field: 'SoPhepConLai', type: 'text', isRequired: false },
        { field: 'SoPhepDaSuDung', type: 'text', isRequired: false },
      ];

      //l???y data t??? file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
      /* save data */
      let listTaiSanRawData: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
      /* remove header */
      listTaiSanRawData = listTaiSanRawData.filter((e, index) => index != 0);
      /* n???u kh??ng nh???p 2 tr?????ng required: t??n + m?? kh??ch h??ng th?? lo???i b??? */
      listTaiSanRawData = listTaiSanRawData.filter(e => (e[1] && e[4]));
      /* chuy???n t??? raw data sang model */
      let listTaiSanRawImport: Array<importTaiSanModel> = [];
      listTaiSanRawData?.forEach(_rawData => {
        let customer = new importTaiSanModel();
        columns.forEach((item, index) => {
          if (item.type == 'text') customer[item.field] = _rawData[index + 1] ? _rawData[index + 1].toString().trim() : '';
          if (item.type == 'date') customer[item.field] = _rawData[index + 1] ? my_date(_rawData[index + 1].toString().trim()) : null;
        });
        listTaiSanRawImport = [...listTaiSanRawImport, customer];
      });
      /* t???t dialog import file, b???t dialog chi ti???t kh??ch h??ng import */
      this.displayChooseFileImportDialog = false;
      console.log('listTaiSanRawImport', listTaiSanRawImport)
      this.openDetailImportDialog(listTaiSanRawImport);
    }
  }

  openDetailImportDialog(listTaiSanRawImport) {
    let ref = this.dialogService.open(EmployeeImportDetailComponent, {
      data: {
        listTaiSanImport: listTaiSanRawImport
      },
      header: 'Import nh??n vi??n',
      width: '85%',
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px",
        // "over-flow": "hidden"
      }
    });
    ref.onClose.subscribe((result: any) => {
      if (result?.status) {
        this.searchEmployee();
      }
    });
  }

  onClickImportBtn(event: any) {
    /* clear value c???a file input */
    event.target.value = ''
  }

  closeChooseFileImportDialog() {
    this.cancelFile();
  }

  cancelFile() {
    let fileInput = $("#importFileProduct")
    fileInput.replaceWith(fileInput.val('').clone(true));
    this.fileName = "";
  }

  importHopDong() {
    if (this.fileName == "") {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "Ch??a ch???n file c???n nh???p" };
      this.messageService.add(mgs);
      return;
    }

    const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(targetFiles.files[0]);
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellText: true });
      let code = 'ImpotHDNS';
      if (!workbook.Sheets[code]) {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
        this.messageService.add(mgs);
        return;
      }
      let columns = [
        { field: 'EmployeeCode', type: 'text', isRequired: true },
        { field: 'LoaiHopDong', type: 'text', isRequired: true },
        { field: 'SoHopDong', type: 'text', isRequired: true },
        { field: 'SoPhuLuc', type: 'text', isRequired: true },
        { field: 'NgayKyHD', type: 'date', isRequired: true },
        { field: 'NgayBDLamViec', type: 'date', isRequired: true },
        { field: 'NgayKetThucHD', type: 'date', isRequired: true },
        { field: 'ChucVu', type: 'text', isRequired: true },
        { field: 'MucLuong', type: 'text', isRequired: false },
      ];

      //l???y data t??? file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
      /* save data */
      let listTaiSanRawData: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
      /* remove header */
      listTaiSanRawData = listTaiSanRawData.filter((e, index) => index != 0);
      /* n???u kh??ng nh???p 2 tr?????ng required: t??n + m?? kh??ch h??ng th?? lo???i b??? */
      listTaiSanRawData = listTaiSanRawData.filter(e => (e[1] && e[4]));
      /* chuy???n t??? raw data sang model */
      let listTaiSanRawImport: Array<importHopDongModel> = [];
      listTaiSanRawData?.forEach(_rawData => {
        let customer = new importHopDongModel();
        columns.forEach((item, index) => {
          if (item.type == 'text') customer[item.field] = _rawData[index] ? _rawData[index].toString().trim() : '';
          if (item.type == 'date') customer[item.field] = _rawData[index] ? my_date(_rawData[index].toString().trim()) : null;
        });
        listTaiSanRawImport = [...listTaiSanRawImport, customer];
      });
      /* t???t dialog import file, b???t dialog chi ti???t kh??ch h??ng import */
      this.displayChooseFileImportHopDong = false;
      console.log('listTaiSanRawImport', listTaiSanRawImport)
      this.openDetailImportDialogHopDong(listTaiSanRawImport);
    }
  }

  openDetailImportDialogHopDong(listTaiSanRawImport) {
    let ref = this.dialogService.open(HopDongImportDetailComponent, {
      data: {
        listTaiSanImport: listTaiSanRawImport,
        employeeId: this.employeeId
      },
      header: 'Import h???p ?????ng nh??n vi??n',
      width: '85%',
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px",
        // "over-flow": "hidden"
      }
    });
    ref.onClose.subscribe((result: any) => {
      if (result?.statusCode == 200) {
        this.getListHopDongNhanSu();
      }
    });
  }

  async getListHopDongNhanSu() {
    this.loading = true;
    let result: any = await this.employeeService.getListHopDongNhanSu(this.employeeId);
    this.loading = false;

    if (result.statusCode == 200) {
      this.listHopDong = result.listHopDongNhanSu;
      this.listPosition = result.listChucVu;
      this.listLoaiHopDong = result.listLoaiHopDongNhanSu;

      this.isShowButton = result.isShowButton;
    }
    else {
      this.showMessage(result.messageCode);
    }
  }

  async downloadTemplateExcelHopDong() {
    this.loading = true;
    let result: any = await this.employeeService.downloadTemplateImportHDNS();
    this.loading = false;
    if (result.templateExcel != null && result.statusCode === 200) {
      const binaryString = window.atob(result.templateExcel);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      for (let idx = 0; idx < binaryLen; idx++) {
        const ascii = binaryString.charCodeAt(idx);
        bytes[idx] = ascii;
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const fileName = result.fileName + ".xlsx";
      link.download = fileName;
      link.click();
    } else {
      this.displayChooseFileImportDialog = false;
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Download file th???t b???i' };
      this.messageService.add(msg);
    }
  }

  /*End*/
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function my_date(date_string) {
  var date_components = date_string.split("/");
  if (date_components.length == 0) return null;
  var day = date_components[0];
  var month = date_components[1];
  var year = date_components[2];
  return new Date(year, month - 1, day);
}

