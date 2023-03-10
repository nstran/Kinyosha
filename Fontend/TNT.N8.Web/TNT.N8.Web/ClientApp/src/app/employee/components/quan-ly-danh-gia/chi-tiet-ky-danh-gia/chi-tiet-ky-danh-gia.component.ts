import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Checkbox, FileUpload, Table } from 'primeng';
import { EmployeeService } from '../../../services/employee.service';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { ForderConfigurationService } from '../../../../admin/components/folder-configuration/services/folder-configuration.service';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { ChonNhieuDvDialogComponent } from '../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TeacherSalaryListComponent } from '../../employee-salary/teacher-salary-list/teacher-salary-list.component';


class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}
class FileInFolder {
  fileInFolderId: string;
  folderId: string;
  fileFullName: string;
  fileName: string;
  objectId: string;
  objectNumber: number;
  fileUrl: string;
  objectType: string;
  size: string;
  active: boolean;
  fileExtension: string;
  createdById: string;
  createdDate: Date;
  uploadByName: string;
}

class CauHinhPhieDanhGiaMapping {
  id: any;
  mauPhieuDanhGia: any;
  chucVu: any
}

class PhongBanMapping {
  id: any
  phongBan: any;
  quyLuong: any
}

class KyDanhGia {
  KyDanhGiaId: any;
  TenKyDanhGia: any;
  ThoiGianBatDau: Date;
  ThoiGianKetThuc: Date;
  LyDo: string;
  TrangThaiDanhGia: number
}

class note {
  nhanVienKyDanhGiaId: number;
  orgParentId: string;
  parentId: number;
  level: number;
  kyDanhGiaId: number;
  nguoiDanhGiaId: string;
  nguoiDuocDanhGiaId: string;
  organizationId: string;
  quyLuong: number;
  xemLuong: boolean;
  isEmp: boolean;
  nguoiDanhGiaName: string;
  nguoiDuocDanhGiaName: string;
  organizationName: string;
  isTruongBoPhan: boolean;
  chucVu: string;
}

class NhanVienKyDanhGia {
  NhanVienKyDanhGiaId: number;
  ParentId: number;
  Level: number;
  KyDanhGiaId: string;
  RootOrgId: string;
  NguoiDanhGiaId: string;
  NguoiDuocDanhGiaId: string;
  OrganizationId: string;
  PositionId: string;
  XemLuong: boolean;
  TrangThai: number;
  CreatedById: string;
  CreatedDate: Date;
}

class NoiDungKyDanhGiaEntityModel {
  NoiDungKyDanhGiaId: number;
  KyDanhGiaId: number;
  PhieuDanhGiaId: number;
  PositionId: string;
}

@Component({
  selector: 'app-chi-tiet-ky-danh-gia',
  templateUrl: './chi-tiet-ky-danh-gia.component.html',
  styleUrls: ['./chi-tiet-ky-danh-gia.component.css']
})
export class ChiTietKyDanhGiaComponent implements OnInit {

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  loginFullName: any = localStorage.getItem("UserFullName");
  loginEmpId: any = JSON.parse(localStorage.getItem('auth')).EmployeeId

  loading: boolean = false
  colsPhieuDanhGia: Array<any>
  listPhieuDanhGia: Array<CauHinhPhieDanhGiaMapping> = new Array<CauHinhPhieDanhGiaMapping>();
  listPhieuDanhGiaTable: Array<CauHinhPhieDanhGiaMapping> = new Array<CauHinhPhieDanhGiaMapping>();
  listPhongBanTable: Array<any> = [];
  mauPhieuDanhGia: Array<any>
  chucVu: Array<any>
  selectedCars1: any
  minDate: Date
  maxDate: Date
  today = new Date();
  clonedData: { [s: string]: PhongBanMapping; } = {}

  indexUpdate: any
  soTienChoPhep: number

  //init bi???n ph??ng ban
  colsPhongBan: Array<any>
  listPhongBan: Array<any>

  colsPhongBanGanNguoiDanhGia: Array<any>
  listAddEmp: Array<any>

  listCauHinhPhieuDanhGia: Array<any>
  listNhanVienKyDanhGia: Array<any>
  kyDanhGia: Array<any>

  selectedEmpCheckBox: Array<any>
  selectedEmpDanhGiaCheckBox: Array<any>
  phongBanControl: FormControl
  phongBanNameControl: FormControl
  quyLuongControl: FormControl
  formPhongBan: FormGroup

  listAllEmp: FormGroup


  displayModal: boolean = false
  displayModal1: boolean = false
  displayModalChonNguoiDanhGia: boolean = false
  displayModalDanhGiaChung: boolean = false

  isShowQuyLuongVaMucTang: boolean = false
  kyDanhGiaId: any;
  trangThaiKyDanhGia: any = 0;
  trangThaiPhongBan: any = 0;
  soTienQuyLuongConLai: any = 0;


  //Form ch???n ng?????i ????nh gi??
  chonNguoiDanhGiaGroup: FormGroup
  nguoiDanhGiaControl: FormControl;
  xemLuongControl: FormControl;

  //Form ????nh gi?? chung
  danhGiaChungGroup: FormGroup
  mucDanhGiaControl: FormControl;
  luongDeXuatControl: FormControl;


  //form th??ng tin k??? ????nh gi??
  formThongTinKyDanhGia: FormGroup
  tenKyDanhGiaControl: FormControl;
  ngayTaoControl: FormControl;
  nguoiTaoControl: FormControl;
  thoiGianBatDauControl: FormControl;
  thoiGianKetThucControl: FormControl;
  lyDoDanhGiaControl: FormControl;

  //form phi???u ????nh gi??
  mauPhieuDanhGiaControl: FormControl;
  chucVuControl: FormControl;
  statusCode: string = null;
  isAprovalQuote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  @ViewChild('e') e: ElementRef;
  @ViewChild('e2') e2: ElementRef;


  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  colsFile: any[];

  danhGiaCols: any[];
  /*End : Note*/
  file: File[];

  showAddNhanVien: boolean = false;
  showDanhGiaNhanVien: boolean = false;

  listThangDiemDanhGia: Array<any> = [];
  listMucDanhGia: Array<any> = [];

  listMucDiemDanhGiaChose: Array<any> = [];

  filterGlobal: string = '';
  ganNguoiDanhGiaOrDanhGiaChung: number = 0;

  @ViewChild('dt') myTable: Table;

  @ViewChild('ganNV') ganNV: Table;

  @ViewChild('danhGiaNV') danhGiaNV: Table;

  @ViewChild('dtNhanVien') nhanVienTable: Table;



  listChucVuDaChon: Array<any> = [];

  listAllEmpDanhGia: Array<any> = [];
  listAllEmpDanhGiaChose: Array<any> = [];
  isTruongPhong: boolean = false;

  empIdTruongPhong = "";
  tongMucTang: number = 0;
  quyLuongConLai: number = 0;

  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  actionEdit: boolean = true;

  //Ph??ng ban ??ang ch???n ????? g??n ng?????i ????nh gi??
  orgId: string = null;

  listEmpDanhGiaNhanVien: Array<any> = [];




  constructor(
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private folderService: ForderConfigurationService,
    private encrDecrService: EncrDecrService,
    private getPermission: GetPermission,
    public dialogService: DialogService,
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.initForm();
    this.initTable();
    let resource = "hrm/employee/chi-tiet-ky-danh-gia/";
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

      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
    }

    this.route.params.subscribe(params => {
      if (params['kyDanhGiaId']) {
        this.kyDanhGiaId = Number(this.encrDecrService.get(params['kyDanhGiaId']));
      }
    });

    this.getMasterData();
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.employeeService.kyDanhGiaDetail(this.kyDanhGiaId);
    console.log('res : ', result)
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }

    this.listPhieuDanhGiaTable = [];
    this.listPhongBan = result.listPhongBan;
    this.mauPhieuDanhGia = result.listPhieuDanhGia;
    this.chucVu = result.listChucVu;
    this.listCauHinhPhieuDanhGia = result.listCauHinhPhieuDanhGia;
    this.listNhanVienKyDanhGia = result.listNhanVienKyDanhGia;
    this.kyDanhGia = result.kyDanhGia;
    this.arrayDocumentModel = result.listFileInFolder;
    this.uploadedFiles = [];

    this.listAllEmp = result.listAllEmp;

    this.listThangDiemDanhGia = result.listThangDiemDanhGia;
    this.listMucDanhGia = result.listMucDanhGia;

    this.soTienQuyLuongConLai = result.soTienQuyLuongConLai;
    this.setDefaultData(result);

    this.ref.detectChanges();
  }

  initTable() {
    this.colsPhieuDanhGia = [
      { field: 'mauPhieuDanhGia', header: 'M???u phi???u ????nh gi??' },
      { field: 'chucVu', header: 'Ch???c v???' },
    ];

    this.colsPhongBan = [
      { field: 'phongBan', header: 'Ph??ng ban' },
      { field: 'quyLuong', header: 'Qu??? l????ng' },
      { field: 'trangThaiPBName', header: 'Tr???ng th??i' },
    ];

    this.colsPhongBanGanNguoiDanhGia = [
      { field: 'employeeCodeName', header: 'Nh??n vi??n', textAlign: "left" },
      { field: 'organizationName', header: 'Ph??ng ban', textAlign: "left" },
      { field: 'positionName', header: 'Ch???c v???', textAlign: "left" },
      { field: 'thamGiaDanhGia', header: 'Tham gia ????nh gi??', textAlign: "center" },
      { field: 'nguoiDanhGiaName', header: 'Ng?????i ????nh gi??', textAlign: "left" },
      { field: 'xemLuong', header: 'Xem l????ng', textAlign: "center" },
    ];


    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', color: '#f44336' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', color: '#f44336' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'center', color: '#f44336' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', color: '#f44336' },
    ];

    this.danhGiaCols = [
      { field: 'nguoiDuocDanhGiaName', header: 'Nh??n vi??n', textAlign: 'left', width: '220px', height: '74px' },
      { field: 'organizationName', header: 'Ph??ng ban', textAlign: 'left', width: '180px', height: '74px' },
      { field: 'chucVu', header: 'Ch???c v???', textAlign: 'left', width: '180px', height: '74px' },
      { field: 'nguoiDanhGiaName', header: 'Ng?????i ????nh gi??', textAlign: 'center', width: '220px', height: '74px' },
      { field: 'xemLuong', header: 'Xem l????ng', textAlign: 'center', width: '100px', height: '74px' },
      { field: 'tongDiemTuDanhGiaName', header: '??i???m t??? ????nh gi??', textAlign: 'center', width: '100px', height: '74px' },
      { field: 'tongDiemDanhGiaName', header: 'Ph??? tr??ch ????nh gi??', textAlign: 'center', width: '100px', height: '74px' },
      { field: 'tongKetQuaName', header: 'M???c ????nh gi?? cu???i', textAlign: 'center', width: '100px', height: '74px' },
      { field: 'mucLuongCu', header: 'M???c l????ng c??', textAlign: 'center', width: '180px', height: '74px' },
      { field: 'mucLuongDeXuatQuanLy', header: 'M???c l????ng ph??? tr??ch ????? xu???t', textAlign: 'center', width: '180px', height: '74px' },
      { field: 'action', header: 'T??c v???', textAlign: 'center', width: '150px', height: '74px' },
    ];

  }


  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  setDefaultData(result) {

    let kyDanhGia = result.kyDanhGia;
    this.tenKyDanhGiaControl.setValue(kyDanhGia.tenKyDanhGia);
    this.ngayTaoControl.setValue(new Date(kyDanhGia.createdDate));
    this.nguoiTaoControl.setValue(kyDanhGia.nguoiTaoName);
    this.thoiGianBatDauControl.setValue(new Date(kyDanhGia.thoiGianBatDau));
    this.thoiGianKetThucControl.setValue(new Date(kyDanhGia.thoiGianKetThuc));
    this.lyDoDanhGiaControl.setValue(kyDanhGia.lyDo);
    this.trangThaiKyDanhGia = kyDanhGia.trangThaiDanhGia;

    //Kh??c tr???ng th??i m???i th?? diable
    if (this.trangThaiKyDanhGia != 0) {
      this.tenKyDanhGiaControl.disable();
      this.thoiGianBatDauControl.disable();
      this.thoiGianKetThucControl.disable();
      this.lyDoDanhGiaControl.disable();
      this.thoiGianKetThucControl.disable();
    }
    //Kh??c tr???ng th??i ho??n th??nh th?? diable form v?? enable th???i h???n ????ng k??
    if (this.trangThaiKyDanhGia == 3) {
      this.thoiGianKetThucControl.enable();
    }


    let listPhieu = [];
    result.listCauHinhPhieuDanhGia.map(x => {
      if (listPhieu.indexOf(x.phieuDanhGiaId) == -1) {
        listPhieu.push(x.phieuDanhGiaId);
      }
    });

    listPhieu.forEach((item, index) => {
      //L???y list ch???c mapping v???i phi???u
      let listChucVu = result.listCauHinhPhieuDanhGia.filter(x => x.phieuDanhGiaId == item).map(x => x.positionId);
      result.listCauHinhPhieuDanhGia.map(x => {
        if (listPhieu.indexOf(x.phieuDanhGiaId) == -1) {
          listPhieu.push(x.phieuDanhGiaId);
        }
      });

      let mauPhieuDanhGia = this.mauPhieuDanhGia.find(x => x.phieuDanhGiaId == item);
      let chucVu = this.chucVu.filter(x => listChucVu.indexOf(x.positionId) != -1);
      let noiDUngTT: CauHinhPhieDanhGiaMapping = {
        id: index,
        mauPhieuDanhGia: mauPhieuDanhGia,
        chucVu: chucVu,
      };
      this.listPhieuDanhGiaTable.push(noiDUngTT);
    });

    this.listPhongBanTable = [];
    result.listNhanVienKyDanhGia.forEach(x => {
      //List ph??ng ban ???????c add
      if (x.nguoiDuocDanhGiaId == this.emptyGuid && x.nguoiDanhGiaId == this.emptyGuid
        && x.rootOrgId == x.organizationId) {
        let obj = {
          nhanVienKyDanhGiaId: x.nhanVienKyDanhGiaId,
          phongBan: x.organizationName,
          phongBanId: x.organizationId,
          quyLuong: x.quyLuong,
          nguoiPhuTrach: x.nguoiDuocDanhGiaName,
          nguoiPhuTrachId: x.nguoiDuocDanhGiaId,
          nguoiDanhGia: x.nguoiDanhGiaName,
          nguoiDanhGiaId: x.nguoiDanhGiaId,
          trangThaiPBName: x.trangThaiPBName,
          trangThaiPBValue: x.trangThaiPBValue,
        }
        this.listPhongBanTable.push(obj);
      }
    });
  }

  checkDate() {
    if (this.thoiGianBatDauControl) {
      this.minDate = (this.thoiGianBatDauControl.value)
    } else {
      this.maxDate = (this.thoiGianKetThucControl.value);
    }
  }


  async xemChiTietPhongBan(data) {
    //N???u tr???ng th??i m???i th?? kh??ng cho xem chi ti??t
    if (this.trangThaiKyDanhGia == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: "Ch??? c?? th??? xem chi ti???t sau khi ???n n??t ho??n th??nh!" };
      this.showMessage(msg);
      return;
    }

    this.showAddNhanVien = false;
    this.showDanhGiaNhanVien = false;
    this.orgId = data.phongBanId;

    this.trangThaiPhongBan = data.trangThaiPBValue;
    let trangThai = data.trangThaiPBValue;
    //??ang g??n ng?????i ????nh gi??
    if (trangThai == 1) {
      let result: any = await this.employeeService.layNhanVienCungCapVaCapDuoiOrg(data.phongBanId, trangThai, this.kyDanhGiaId);
      console.log('res : ', result)
      this.loading = false;
      if (result.statusCode != 200) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
        return;
      }
      let listPostionIdKyDanhGia = [];
      this.listCauHinhPhieuDanhGia.forEach(item => {
        listPostionIdKyDanhGia.push(item.positionId);
      });
      //l???c ra c??c nh??n vi??n c?? v??? tr??? ???????c ??p d???ng trong k??? ????nh gi??
      this.listAddEmp = result.listEmp;
      this.listAddEmp = this.listAddEmp.filter(x => listPostionIdKyDanhGia.indexOf(x.positionId) != -1);
      this.isTruongPhong = result.isTruongPhong;
      this.listAllEmpDanhGia = result.listEmp;
      this.empIdTruongPhong = result.EmpIdTruongPhong;
      this.showAddNhanVien = true;
      setTimeout(() => {
        this.unTickNvThamGiaDanhGia();
      }, 100)
    }
    //??ang ????nh gi??
    if (trangThai == 2 || trangThai == 3 || trangThai == 4) {
      let result: any = await this.employeeService.layNhanVienCungCapVaCapDuoiOrg(data.phongBanId, trangThai, this.kyDanhGiaId);
      console.log('res : ', result)
      this.loading = false;
      if (result.statusCode != 200) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
        return;
      }
      this.showDanhGiaNhanVien = true;
      this.isTruongPhong = result.isTruongPhong;
      this.listEmpDanhGiaNhanVien = result.listNhanVienKyDanhGia;
      this.empIdTruongPhong = result.EmpIdTruongPhong;
      this.tongMucTang = result.tongMucTangQuanLy;
      this.quyLuongConLai = result.quyLuongConLai;
      this.isShowQuyLuongVaMucTang = result.isShowQuyLuongVaMucTang;
    }
  }

  quayLai() {
    this.showAddNhanVien = false;
    this.showDanhGiaNhanVien = false;
    this.isTruongPhong = false;
    this.trangThaiPhongBan = 0;
  }


  tickAllNv(checkValue) {
    
    this.selectedEmpCheckBox = this.listAddEmp;
    if (checkValue) {
      this.selectedEmpCheckBox = this.selectedEmpCheckBox.filter(x => x.thamGiaDanhGia == true);
    } else {
      this.selectedEmpCheckBox = [];
    }
  }

  unTickNv() {
    //n???u tick ????? => checkAll = true v?? ng?????i l???i
    if (this.selectedEmpCheckBox.length == this.listAddEmp.length) {
      this.e["checked"] = true;
    } else {
      this.e["checked"] = false;
    }
  }

  tickAllNvDanhGia(checkValue) {
    
    this.selectedEmpDanhGiaCheckBox = this.listEmpDanhGiaNhanVien;
    if (checkValue) {
      this.selectedEmpDanhGiaCheckBox = this.selectedEmpDanhGiaCheckBox.filter(x => x.trangThaiDanhGia == 3);
    } else {
      this.selectedEmpDanhGiaCheckBox = [];
    }
  }

  tickAllNvThamGiaDanhGia(checkValue) {
    
    if (checkValue) {
      this.listAddEmp.forEach(x => {
        x.thamGiaDanhGia = true;
      });
      this.e2["checked"] = true;
    } else {
      this.listAddEmp.forEach(x => {
        x.thamGiaDanhGia = false;
      });
      this.e2["checked"] = false;
    }
  }

  unTickNvThamGiaDanhGia() {
    
    //n???u tick ????? => checkAll = true v?? ng?????i l???i
    let untickAll = false;
    this.listAddEmp.forEach(x => {
      if (x.thamGiaDanhGia == false) untickAll = true;
    });
    //N???u xu???t hi???n 1 b???n ghi kh??ng tick tham gia k??? ????nh gi?? => untickAll
    if (untickAll) {
      this.e2["checked"] = false;
    }
    //N???u kh??ng xu???t hi???n b???n ghi kh??ng tick tham gia k??? ????nh gi?? => tickAll
    else {
      this.e2["checked"] = true;
    }
  }

  openOrgPopup() {
    let listSelectedId = this.phongBanControl.value != null ? this.phongBanControl.value.organizationId : null;

    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 2,
        listSelectedId: listSelectedId,
      },
      header: 'Ch???n ????n v???',
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
          let checkExistInList = this.listPhongBanTable.find(x => x.phongBanId == result[0].organizationId);
          if (checkExistInList) {
            let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Ph??ng ban ???? ???????c ??p d???ng!' };
            this.showMessage(msg);
            this.phongBanControl.setValue(null);
            this.phongBanNameControl.setValue(null)
            return;
          }
          this.phongBanControl.setValue(result[0]);
          this.phongBanNameControl.setValue([result[0].organizationName])
        }
      }
    });
  }


  async hoanThanhGanNguoiDanhGia() {
    
    let listEmpThamGiaKyDanhGiaSelected = this.listAddEmp.filter(x => x.thamGiaDanhGia == true);
    if (listEmpThamGiaKyDanhGiaSelected == null || listEmpThamGiaKyDanhGiaSelected.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: "H??y ch???n nh??n vi??n cho k??? ????nh gi??!" };
      this.showMessage(msg);
      return;
    }

    //accept

    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n x??c nh???n ho??n th??nh g??n ng?????i ????nh gi?? cho c??c nh??n vi??n tham gia ????nh gi???',
      accept: async () => {
        let listEmpThamGiaKyDanhGia = [];
        listEmpThamGiaKyDanhGiaSelected.forEach(item => {
          var newObj = new NhanVienKyDanhGia();
          newObj.NhanVienKyDanhGiaId = 0;
          newObj.ParentId = 0;
          newObj.RootOrgId = this.orgId// ph??ng ban root
          newObj.Level = item.organizationLevel;
          newObj.KyDanhGiaId = this.kyDanhGiaId;
          newObj.NguoiDanhGiaId = item.nguoiDanhGiaId;
          newObj.NguoiDuocDanhGiaId = item.employeeId;
          newObj.OrganizationId = item.organizationId;
          newObj.PositionId = item.positionId;
          newObj.XemLuong = item.xemLuong;
          newObj.TrangThai = 1; //m???i
          newObj.CreatedById = this.emptyGuid;
          newObj.CreatedDate = new Date();
          listEmpThamGiaKyDanhGia.push(newObj);
        })

        this.loading = true;
        let result: any = await this.employeeService.updateNguoiDanhGiaNhanVienKy(this.kyDanhGiaId, listEmpThamGiaKyDanhGia);
        this.loading = false;
        if (result.statusCode != 200) {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
          this.showMessage(msg);
          return;
        }
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
        this.displayModalChonNguoiDanhGia = false;
        //L???y ph??ng ban c???a nh??n vi??n
        let phongBanData = this.listPhongBanTable.find(x => x.phongBanId == this.orgId);
        phongBanData.trangThaiPBValue = 2;
        this.getMasterData();
        this.xemChiTietPhongBan(phongBanData);
      }
    });
  }

  async hoanThanhDanhGiaPhongBan() {
    var checkPhieuChuaHoanThanh = false;
    this.listEmpDanhGiaNhanVien.forEach(item => {
      if (item.trangThaiDanhGia != 4) checkPhieuChuaHoanThanh = true;
    })
    //N???u n?? phi???u c?? tr???ng th??i kh??c ho??n th??nh: 4
    if (checkPhieuChuaHoanThanh) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "B???n c???n ho??n th??nh ????nh gia cho t???t c??? nh??n vi??n trong danh s??ch" };
      this.showMessage(msg);
      return;
    }

    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n th???c hi???n thao t??c n??y!?',
      accept: async () => {
        this.loading = true;
        let result: any = await this.employeeService.hoanThanhDanhGiaPhongBan(this.kyDanhGiaId, this.orgId);
        this.loading = false;
        if (result.statusCode != 200) {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
          this.showMessage(msg);
          return;
        }

        var phongBanInfor = null;
        //G??n l???i tr???ng th??i cho ph??ng ban
        this.listPhongBanTable.forEach(item => {
          if (item.phongBanId == this.orgId) {
            item.trangThaiPBValue = 3;
            this.trangThaiPhongBan = 3;
            item.trangThaiPBName = "Ho??n th??nh";
            phongBanInfor = item;
          }
        });
        if (phongBanInfor != null) this.xemChiTietPhongBan(phongBanInfor);
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
      }
    });
  }



  initForm() {
    //k??? ????nh gi??
    this.tenKyDanhGiaControl = new FormControl(null, [Validators.required]);
    this.ngayTaoControl = new FormControl(new Date, [Validators.required]);
    this.nguoiTaoControl = new FormControl(null, [Validators.required]);
    this.thoiGianBatDauControl = new FormControl(null, [Validators.required]);
    this.thoiGianKetThucControl = new FormControl(null, [Validators.required]);
    this.lyDoDanhGiaControl = new FormControl(null, [Validators.required]);

    this.formThongTinKyDanhGia = new FormGroup({
      tenKyDanhGiaControl: this.tenKyDanhGiaControl,
      ngayTaoControl: this.ngayTaoControl,
      nguoiTaoControl: this.nguoiTaoControl,
      thoiGianBatDauControl: this.thoiGianBatDauControl,
      thoiGianKetThucControl: this.thoiGianKetThucControl,
      lyDoDanhGiaControl: this.lyDoDanhGiaControl,
    });

    //Phong ban tham gia
    this.phongBanControl = new FormControl(null, [Validators.required])
    this.phongBanNameControl = new FormControl(null)
    this.quyLuongControl = new FormControl(null, [Validators.required])


    this.formPhongBan = new FormGroup({
      phongBanControl: this.phongBanControl,
      phongBanNameControl: this.phongBanNameControl,
      quyLuongControl: this.quyLuongControl,
    })

    this.ngayTaoControl.disable();
    this.nguoiTaoControl.disable();
    this.nguoiTaoControl.setValue(this.loginFullName);

    //Ch???n ng?????i ????nh gi??
    this.nguoiDanhGiaControl = new FormControl(null)
    this.xemLuongControl = new FormControl(null)
    this.chonNguoiDanhGiaGroup = new FormGroup({
      nguoiDanhGiaControl: this.nguoiDanhGiaControl,
      xemLuongControl: this.xemLuongControl
    })

    //Form ????nh gi?? chung
    this.mucDanhGiaControl = new FormControl(null, [Validators.required])
    this.luongDeXuatControl = new FormControl(null)
    this.danhGiaChungGroup = new FormGroup({
      mucDanhGiaControl: this.mucDanhGiaControl,
      luongDeXuatControl: this.luongDeXuatControl
    })
  }

  addPhieuDanhGia() {
    let noiDUngTT: CauHinhPhieDanhGiaMapping = {
      id: null,
      mauPhieuDanhGia: null,
      chucVu: null,
    };
    this.listPhieuDanhGiaTable.push(noiDUngTT);
    this.sapXepPhieuDanhGia();
    this.ref.detectChanges();
  }

  sapXepPhieuDanhGia() {
    this.listPhieuDanhGiaTable.forEach((item, index) => {
      item.id = index;
    });
    this.ref.detectChanges();
  }

  async xoaPhieuDanhGiaCuaKy(rowData: any) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: async () => {
        if (rowData.mauPhieuDanhGia == null || rowData.chucVu == null) {
          this.listPhieuDanhGiaTable = this.listPhieuDanhGiaTable.filter(c => c != rowData);
        } else {
          this.loading = true;
          let result: any = await this.employeeService.xoaPhieuDanhGiaCuaKy(this.kyDanhGiaId, rowData.mauPhieuDanhGia.phieuDanhGiaId);
          this.loading = false;
          if (result.statusCode != 200) {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
            this.showMessage(msg);
            return;
          }
          this.listPhieuDanhGiaTable = this.listPhieuDanhGiaTable.filter(c => c != rowData);
          //Lo???i b??? c??c ch???c v??? trong list ???? ch???n khi x??a 1 d??ng
          rowData.chucVu.forEach(c => {
            this.listChucVuDaChon = this.listChucVuDaChon.filter(x => x != c.positionId);
          });
        }
      }
    });
  }


  async luuPhieuDanhGiaCuaKy(rowData: any) {
    if (rowData.mauPhieuDanhGia == null || rowData.chucVu == null || rowData.chucVu.length == 0) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "Vui l??ng ch???n ????? th??ng tin c???u h??nh phi???u!" };
      this.showMessage(msg);
      return;
    } else {
      let noiDungKyDanhGia = [];
      this.listPhieuDanhGiaTable.forEach(c => {
        c.chucVu.forEach(item => {
          let newNoiDung = new NoiDungKyDanhGiaEntityModel();
          newNoiDung.KyDanhGiaId = this.kyDanhGiaId;
          newNoiDung.NoiDungKyDanhGiaId = 0;
          newNoiDung.PhieuDanhGiaId = c.mauPhieuDanhGia.phieuDanhGiaId;
          newNoiDung.PositionId = item.positionId;
          noiDungKyDanhGia.push(newNoiDung);
        });
      })
      this.loading = true;
      let result: any = await this.employeeService.luuPhieuDanhGiaCuaKy(this.kyDanhGiaId, noiDungKyDanhGia);
      this.loading = false;
      if (result.statusCode != 200) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
        return;
      }
      let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      //Th??m c??c ch???c v??? trong list ???? ch???n khi th??m 1 d??ng
      rowData.chucVu.forEach(c => {
        this.listChucVuDaChon.push(c.positionId);
      });
    }
  }


  addPhongBan() {
    this.displayModal = !this.displayModal;
    this.formPhongBan.reset();
    this.phongBanControl.enable();
    this.ref.detectChanges();
  }

  async xoaPhongBanKyDanhGia(rowData) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: async () => {
        let organizationId = rowData.phongBanId;
        let kyDanhGiaId = this.kyDanhGiaId;
        this.loading = true;
        let result: any = await this.employeeService.xoaPhongBanKyDanhGia(kyDanhGiaId, organizationId);
        this.loading = false;
        if (result.statusCode != 200) {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
          this.showMessage(msg);
          return;
        }
        this.listPhongBanTable = this.listPhongBanTable.filter(c => c != rowData);
      }
    });
  }

  editRow(rowData, index) {
    this.indexUpdate = index
    this.displayModal1 = !this.displayModal1;
    let thongTinPhongBan = this.listPhongBan.find(x => x.organizationId == rowData.phongBanId);
    this.phongBanControl.setValue(thongTinPhongBan);
    this.phongBanNameControl.setValue([thongTinPhongBan.organizationName])
    this.quyLuongControl.setValue(rowData.quyLuong);
    this.phongBanControl.disable();
  }

  async chonPhieuDanhGia(event, rowData) {
    //N???u phi???u ???????c ch???n
    let phieuDanhGiaDaChon = this.listPhieuDanhGiaTable.map(x => x.mauPhieuDanhGia.phieuDanhGiaId);
    if (phieuDanhGiaDaChon.filter(x => x == event.value.phieuDanhGiaId).length != 1) {
      //C???p nh???t l???i dsach ch???c v??? c???a d??ng
      let objIndex = this.listPhieuDanhGiaTable.findIndex((obj => obj == rowData));
      this.listPhieuDanhGiaTable[objIndex].mauPhieuDanhGia = null;
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Phi???u ????nh gi?? ???? ???????c ??p d???ng!' };
      this.showMessage(msg);
      return;
    }
  }

  thoat() {
    this.router.navigate(['/employee/danh-sach-ky-danh-gia']);
  }

  async luuData() {
    if (!this.formThongTinKyDanhGia.valid) {
      Object.keys(this.formThongTinKyDanhGia.controls).forEach(key => {
        if (!this.formThongTinKyDanhGia.controls[key].valid) {
          this.formThongTinKyDanhGia.controls[key].markAsTouched();
        }
      });
      return false;
    }

    //K??? ????nh gi??
    var thongTinKyDanhGia = new KyDanhGia();
    thongTinKyDanhGia.KyDanhGiaId = this.kyDanhGiaId;
    thongTinKyDanhGia.TenKyDanhGia = this.tenKyDanhGiaControl.value;
    thongTinKyDanhGia.ThoiGianBatDau = convertToUTCTime(new Date(this.thoiGianBatDauControl.value));
    thongTinKyDanhGia.ThoiGianKetThuc = convertToUTCTime(new Date(this.thoiGianKetThucControl.value));
    thongTinKyDanhGia.LyDo = this.lyDoDanhGiaControl.value;
    thongTinKyDanhGia.TrangThaiDanhGia = this.trangThaiKyDanhGia;

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
      fileUpload.FileInFolder.objectNumber = 0;
      fileUpload.FileInFolder.objectType = 'KYDANHGIA';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    let result: any = await this.employeeService.capNhatKyDanhGia(thongTinKyDanhGia, listFileUploadModel, "KYDANHGIA");
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }

    let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'C???p nh???t k??? ????nh gi?? th??nh c??ng' };
    this.showMessage(msg);
    this.getMasterData();
  }

  async addPhongBanToList() {
    
    if (!this.formPhongBan.valid) {
      Object.keys(this.formPhongBan.controls).forEach(key => {
        if (!this.formPhongBan.controls[key].valid) {
          this.formPhongBan.controls[key].markAsTouched();
        }
      });
      return;
    }
    let thongTinPhongBan = this.listPhongBan.find(x => x.organizationId == this.phongBanControl.value.organizationId);
    let objIndex = this.listPhongBanTable.findIndex(x => x.phongBanId == this.phongBanControl.value.organizationId);

    let organizationId = this.phongBanControl.value.organizationId;
    let quyLuong = this.quyLuongControl.value;

    let soTienQuyDaThem = quyLuong;
    this.listPhongBanTable.forEach(item => {
      soTienQuyDaThem += item.quyLuong ?? 0;
    });

    //N???u s??? ti???n cho ph??ng ban l???n h??n s??? ti???n qu??? l????ng
    if (this.soTienQuyLuongConLai < soTienQuyDaThem) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "Qu??? l????ng c???a n??m kh??ng ????? chi!" };
      this.showMessage(msg);
      return;
    }

    this.loading = true;
    let result: any = await this.employeeService.createOrAddPhongBanKyDanhGia(this.kyDanhGiaId, organizationId, quyLuong);
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }

    //N???u t???n t???i th?? c???p nh???t
    if (objIndex != -1) {
      this.listPhongBanTable[objIndex].phongBan = this.phongBanControl.value.organizationName;
      this.listPhongBanTable[objIndex].phongBanId = this.phongBanControl.value.organizationId;
      this.listPhongBanTable[objIndex].quyLuong = this.quyLuongControl.value;
      this.listPhongBanTable[objIndex].nguoiPhuTrach = thongTinPhongBan.nguoiPhuTrachName;
      this.listPhongBanTable[objIndex].nguoiPhuTrachId = thongTinPhongBan.nguoiPhuTrachId;
    }
    //N???u kh??ng t???n t???i th?? th??m m???i
    else {
      let newObj = {
        nhanVienKyDanhGiaId: result.nhanVienKyDanhGiaId,
        phongBan: this.phongBanControl.value.organizationName,
        phongBanId: this.phongBanControl.value.organizationId,
        quyLuong: this.quyLuongControl.value,
        nguoiPhuTrach: thongTinPhongBan.nguoiPhuTrachName,
        nguoiPhuTrachId: thongTinPhongBan.nguoiPhuTrachId,
        trangThaiPBName: "??ang g??n ng?????i ????nh gi??",
      };
      this.listPhongBanTable.push(newObj);
    }
    this.displayModal = false;
    this.displayModal1 = false;
  }

  chonChucVu(event, rowData) {
    var check = false;
    var listChucVuDaChon = this.listPhieuDanhGiaTable.filter(x => x.id != rowData.id);
    //Ki???m tra trong phi???u kh??c xem ch???c v??? ???? ???????c ch???n hay ch??a
    listChucVuDaChon.forEach(x => {
      x.chucVu.forEach(chucVu => {
        //N???u t???n t???i ch???c v???
        if (rowData.chucVu.indexOf(chucVu) > -1) check = true;
      });
    });

    if (check) {
      let objIndex = this.listPhieuDanhGiaTable.findIndex((obj => obj == rowData));
      //N???u l?? tickAll
      if (rowData.chucVu.length == this.chucVu.length) {
        this.listPhieuDanhGiaTable[objIndex].chucVu = [];
      }
      //N???u l?? tick t???ng c??i 1
      else {
        this.listPhieuDanhGiaTable[objIndex].chucVu = rowData.chucVu.filter(item => item != event.itemValue);
      }
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Ch???c v??? ???? ???????c ??p d???ng!' };
      this.showMessage(msg);
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

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  /*Event khi x??a 1 file ???? l??u tr??n server*/
  deleteFile(file: any) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.employeeService.deleteFile(file.fileInFolderId).subscribe(res => {
          let result: any = res;
          if (result.statusCode == 200) {
            let index = this.arrayDocumentModel.indexOf(file);
            this.arrayDocumentModel.splice(index, 1);
            let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: "X??a file th??nh c??ng" };
            this.showMessage(mgs);
          } else {
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(mgs);
          }
        })
      }
    });
  }

  downloadFile(data: FileInFolder) {
    this.folderService.downloadFile(data.fileInFolderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        var binaryString = atob(result.fileAsBase64);
        var fileType = result.fileType;
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var idx = 0; idx < binaryLen; idx++) {
          var ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        var file = new Blob([bytes], { type: fileType });
        if ((window.navigator as any) && (window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveOrOpenBlob(file);
        } else {
          var fileURL = URL.createObjectURL(file);
          if (fileType.indexOf('image') !== -1) {
            window.open(fileURL);
          } else {
            var anchor = document.createElement("a");
            anchor.download = data.fileName.substring(0, data.fileName.lastIndexOf('_')) + "." + data.fileExtension;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      }
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }

  refreshFilter() {

  }

  async hoanThanh() {

    if (this.listPhieuDanhGiaTable == null || this.listPhieuDanhGiaTable.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'C???n c?? ??t nh???t m???t phi???u ????nh gi?? trong k??? ????nh gi??' };
      this.showMessage(msg);
      return;
    }
    let checkValidatePhieuChucVu = false;
    this.listPhieuDanhGiaTable.forEach(key => {
      if (key.mauPhieuDanhGia == null || key.chucVu == null) {
        checkValidatePhieuChucVu = true;
      }
    });

    if (checkValidatePhieuChucVu) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Vui l??ng ki???m tra c???u h??nh phi???u!' };
      this.showMessage(msg);
      return;
    }

    if (this.listPhongBanTable == null || this.listPhongBanTable.length == 0) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'C???n c?? ??t nh???t m???t ph??ng ban tham gia k??? ????nh gi??' };
      this.showMessage(msg);
      return;
    }

    this.loading = true;
    let result: any = await this.employeeService.hoanThanhkyDanhGia(this.kyDanhGiaId);
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }
    let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
    this.showMessage(msg);
    this.listPhieuDanhGiaTable = [];
    this.getMasterData();
  }


  async updateNguoiDanhGiaNhanVienKy() {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n x??c nh???n ho??n th??nh g??n ng?????i ????nh gi?? cho c??c nh??n vi??n tham gia ????nh gi???',
      accept: async () => {
        let tickXemLuong = this.xemLuongControl.value;
        let nguoiDanhGiaId = this.nguoiDanhGiaControl.value != null ? this.nguoiDanhGiaControl.value.employeeId : this.emptyGuid;
        let nguoiDanhGiaName = this.nguoiDanhGiaControl.value != null ? this.nguoiDanhGiaControl.value.employeeCodeName : "";

        let listNguoiDuocChon = [];
        this.selectedEmpCheckBox.forEach(item => {
          item.nguoiDanhGiaName = nguoiDanhGiaName;
          item.nguoiDanhGiaId = nguoiDanhGiaId;
          item.xemLuong = tickXemLuong;
          listNguoiDuocChon.push(item.employeeId);
        });

        this.listAddEmp.forEach(item => {
          if (listNguoiDuocChon.includes(item.employeeId)) {
            item.nguoiDanhGiaName = nguoiDanhGiaName;
            item.nguoiDanhGiaId = nguoiDanhGiaId;
            item.xemLuong = tickXemLuong;
          }
        });
        this.displayModalChonNguoiDanhGia = false;
      }
    });
  }

  showDanhGiaChung() {
    
    if (this.selectedEmpDanhGiaCheckBox == null || this.selectedEmpDanhGiaCheckBox.length == 0) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: "B???n c???n tick ch???n nh??n vi??n mu???n ????nh gi?? chung!" };
      this.showMessage(mgs);
      return;
    }

    //Ki???m tra n???u c?? nh??n vi??n ch??a ?????n b?????c tr?????ng b??? ph???n ????nh gi??: trangThai != 3
    let checkNvTuDanhGia = this.selectedEmpDanhGiaCheckBox.filter(x => x.trangThaiDanhGia != 3);
    if (checkNvTuDanhGia.length != 0) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: "C??c nh??n vi??n ???????c ch???n ch??a ho??n th??nh ????nh gi??!" };
      this.showMessage(mgs);
      return;
    }

    let listThangDiemDanhGia = this.selectedEmpDanhGiaCheckBox.map(x => x.listMucDanhGia[0].mucDanhGiaId);
    //Check xem distinct list muc danh gia. N???u List m???c ????nh gi?? nhi???u h??n 1 => c??c nh??n vi??n kh??ng c??ng thang ??i???m ????nh gi??.
    var unique = listThangDiemDanhGia.filter(onlyUnique);
    if (unique.length != 1) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: "Nh???ng ng?????i ???? ch???n kh??ng c??ng thang ??i???m ????nh gi??, Vui l??ng ch???n l???i!" };
      this.showMessage(mgs);
      return;
    }

    this.listMucDiemDanhGiaChose = [];
    this.listMucDiemDanhGiaChose = this.selectedEmpDanhGiaCheckBox[0].listMucDanhGia;
    this.displayModalDanhGiaChung = true;
  }

  async ganMucDanhGiaChung() {

    if (!this.danhGiaChungGroup.valid) {
      Object.keys(this.danhGiaChungGroup.controls).forEach(key => {
        if (!this.danhGiaChungGroup.controls[key].valid) {
          this.danhGiaChungGroup.controls[key].markAsTouched();
        }
      });
      return;
    }
    this.listMucDiemDanhGiaChose = [];
    let listNv = this.selectedEmpDanhGiaCheckBox;
    let mucDanhGiaMasterDataId = this.mucDanhGiaControl.value.mucDanhGiaMasterDataId;
    this.loading = true;
    let result: any = await this.employeeService.ganMucDanhGiaChung(listNv, mucDanhGiaMasterDataId);
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }
    this.displayModalDanhGiaChung = false;
    let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
    this.showMessage(msg);
    let phongBanData = this.listPhongBanTable.find(x => x.phongBanId == this.orgId);
    phongBanData.trangThaiPBValue = 2;
    this.getMasterData();
    this.xemChiTietPhongBan(phongBanData);
    this.selectedEmpDanhGiaCheckBox = [];
  }

  chonNguoiDanhGia() {
    
    if (this.selectedEmpCheckBox == null) {
      let mgs = { severity: 'warn', summary: 'Th??ng b??o:', detail: "Ch???n nh??n vi??n ????? g??n ng?????i ????nh gi??!" };
      this.showMessage(mgs);
      return;
    }

    //Nh??n vi??n ????nh gi?? l?? nh??n vi??n thu???c c??ng v?? c???p d?????i Org v?? kh??c v???i list ch???n g??n ng?????i ??n??h gi??
    let listEmpId = [];
    this.selectedEmpCheckBox.forEach(item => {
      listEmpId.push(item.employeeId);
    });

    this.listAllEmpDanhGiaChose = this.listAllEmpDanhGia.filter(x => !listEmpId.includes(x.employeeId));

    this.listMucDiemDanhGiaChose = [];
    this.displayModalChonNguoiDanhGia = true;
  }

  async tuDanhGia(rowData) {
    if (rowData.danhGiaNhanVienId != null) {
      this.router.navigate(['/employee/thuc-hien-danh-gia', { danhGiaNhanVienId: this.encrDecrService.set(rowData.danhGiaNhanVienId) }]);
    } else {
      this.loading = true;
      let result: any = await this.employeeService.taoPhieuTuDanhGiaNhanVien(rowData.nhanVienKyDanhGiaId);
      this.loading = false;
      if (result.statusCode != 200) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
        return;
      }
      this.router.navigate(['/employee/thuc-hien-danh-gia', { danhGiaNhanVienId: this.encrDecrService.set(result.danhGiaNhanVienId) }]);
    }
  }

  async capNhatDanhGiaNhanVienRow(rowData) {
    let danhGiaNhanVienId = rowData.danhGiaNhanVienId;
    let mucLuongDeXuatQuanLy = rowData.mucLuongDeXuatQuanLy;
    if (rowData.mucLuongCu > rowData.mucLuongDeXuatQuanLy) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "M???c ????? xu???t kh??ng ???????c nh??? h??n m???c l????ng c??" };
      this.showMessage(msg);
      return;
    }

    this.loading = true;
    let result: any = await this.employeeService.capNhatDanhGiaNhanVienRow(danhGiaNhanVienId, mucLuongDeXuatQuanLy);
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
    }
    //L???y ph??ng ban c???a nh??n vi??n
    let phongBanData = this.listPhongBanTable.find(x => x.phongBanId == rowData.rootOrgId)
    this.xemChiTietPhongBan(phongBanData);
  }

  async taoDeXuatTangLuongKyDanhGia() {
    this.loading = true;
    let result: any = await this.employeeService.taoDeXuatTangLuongKyDanhGia(this.kyDanhGiaId, this.orgId);
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }
    this.router.navigate(['/employee/de-xuat-tang-luong-detail', { deXuatTLId: this.encrDecrService.set(result.deXuatTangLuongId) }]);

  }

}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


