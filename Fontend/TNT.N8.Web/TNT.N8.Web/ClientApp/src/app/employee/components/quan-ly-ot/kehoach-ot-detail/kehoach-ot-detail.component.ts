import { CommonService } from './../../../../shared/services/common.service';
import { CauHinhOtCaNgay } from './../../../../salary/models/cau-hinh-ot-ca-ngay.model';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { EmployeeService } from '../../../services/employee.service';
import { KeHoachOtModel } from '../../../models/keHoach-Ot.model';
//import { EmployeeModel } from '../../models/employee.model';
import { QuyTrinhService } from '../../../../../../src/app/admin/services/quy-trinh.service';
import { ChonNhieuDvDialogComponent } from '../../../../../../src/app/shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { NoteDocumentModel } from '../../../../../app/shared/models/note-document.model';
import { ForderConfigurationService } from '../../../../admin/components/folder-configuration/services/folder-configuration.service';
import { ImageUploadService } from '../../../../shared/services/imageupload.service';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';

class KeHoachOtPhongBanEntityModel {
  id: number;
  OrganizationId: SVGStringList;
  KeHoachOtId: number;
}

class phongBanList {
  organizationId: string;
  organizationName: string;
  soLuongDangKy: number;
  soLuongDaDuyet: number;
  trangThai: number;
}

class NoteModel {
  NoteId: string;
  NoteTitle: string;
  Description: string;
  Type: string;
  ObjectId: string;
  ObjectNumber: number;
  ObjectType: string;
  Active: Boolean;
  CreatedById: string;
  CreatedDate: Date;
  UpdatedById: string;
  UpdatedDate: Date;
  constructor() { }
}

class EmployeeModel {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeLastname: string;
  employeeFirstname: string;
  startedDate: Date;
  organizationId: string;
  positionId: string;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: Date;
  active: Boolean;
  username: string;
  identity: string;
  organizationName: string;
  avatarUrl: string;
  positionName: string;
  contactId: string;
  isManager: boolean;
  permissionSetId: string;
  probationEndDate: Date;
  probationStartDate: Date;
  trainingStartDate: Date;
  contractType: string;
  contractEndDate: Date;
  isTakeCare: boolean;
  isXuLyPhanHoi: boolean;
  organizationLevel: number;
}

class Note {
  active: boolean;
  createdById: string;
  createdDate: Date;
  description: string;
  noteDocList: Array<NoteDocument>;
  noteId: string;
  noteTitle: string;
  objectId: string;
  objectType: string;
  responsibleAvatar: string;
  responsibleName: string;
  type: string;
  updatedById: string;
  updatedDate: Date;
  constructor() {
    this.noteDocList = [];
  }
}

class NoteDocument {
  active: boolean;
  base64Url: string;
  createdById: string;
  createdDate: Date;
  documentName: string;
  documentSize: string;
  documentUrl: string;
  noteDocumentId: string;
  noteId: string;
  updatedById: string;
  updatedDate: Date;
}

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

@Component({
  selector: 'app-kehoach-ot-detail',
  templateUrl: './kehoach-ot-detail.component.html',
  styleUrls: ['./kehoach-ot-detail.component.css']
})
export class KeHoachOtDetailComponent implements OnInit {
  loading: boolean = false;
  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i
  statusCode: string = null;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  @ViewChild('fileUpload') fileUpload: FileUpload;
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  newKeHoachOtId: number = 0;
  keHoachOtModel: KeHoachOtModel = new KeHoachOtModel();
  currentEmployeeCodeName = localStorage.getItem('EmployeeCodeName');
  auth = JSON.parse(localStorage.getItem('auth'));

  cauHinhOtCaNgay: CauHinhOtCaNgay = null;
  gioBatDau: string = null;
  gioKetThuc: string = null;
  listLoaiOt: Array<any> = [];
  listLoaiCaOt: Array<any> = [];
  listPhongBan: Array<any> = []; // ch??? c?? Id c???a ph??ng ban
  listPhongBanIn4: Array<any> = [];
  listAllViTri: Array<any> = [];
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  colsFile: any[];

  //Note
  listNoteDocumentModel: Array<NoteDocumentModel> = [];
  listUpdateNoteDocument: Array<NoteDocument> = [];
  noteHistory: Array<Note> = [];
  isAprovalQuote: boolean = false;
  noteId: string = null;
  noteContent: string = '';
  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;

  // FORM GROUP k??? ho???ch OT
  keHoachOtFormGroup: FormGroup;
  loaiOtFormControl: FormControl;
  tenKeHoachFormControl: FormControl;
  ngayDeXuatFormControl: FormControl;
  nguoiDeXuatIdFormControl: FormControl;
  donViIdFormControl: FormControl;
  donViNameIdFormControl: FormControl;
  diaDiemFormControl: FormControl
  ngayBatDauFormControl: FormControl;
  ngayKetThucFormControl: FormControl;
  gioBatDauFormControl: FormControl;
  gioKetThucFormControl: FormControl;
  lyDoFormControl: FormControl;
  hanPheDuyetKeHoachFormControl: FormControl;
  hanDangKyOTFormControl: FormControl;
  hanPheDuyetDangKyFormControl: FormControl;
  loaiCaOtControl: FormControl;

  // FORM GROUP pop-up gia h???n th??m ????ng k?? OT
  giaHanThemPopUpFromGroup: FormGroup;
  hanDangKyOTPopUpFormControl: FormControl;
  hanPheDuyetDangKyOTPopUpFormControl: FormControl;

  // FORM GROUP pop-up gia h???n th??m KH OT
  giaHanThemKhotPopUpFromGroup: FormGroup;
  hanPheDuyeKhotFormControl: FormControl;
  hanDangKyOTGiaHanKhotFormControl: FormControl;
  hanPheDuyetDangKyOTGiaHanKhotFormControl: FormControl;

  deXuatOTId = null;

  listEmp: any = [];
  toDay = new Date();

  keHoachOT: any = null;
  filterGlobal: string = '';
  filterGlobal1: string = '';

  showLyDoTuChoi: boolean = false;
  lyDoTuChoi = "";

  fileName = "";
  listFormatStatusSupport: Array<any> = []; // Thanh tr???ng th??i

  giaHanThemType: string = null;

  isShowWorkFollowContract: boolean = true;
  //Hi???n th??? tr???ng th??i c??c n??t
  IsShowGuiXacNhan: boolean = false;
  IsShowXacNhan: boolean = false;
  IsShowTuChoi: boolean = false;
  IsShowLuu: boolean = false;
  IsShowXoa: boolean = false;
  IsShowHuy: boolean = false;
  IsShowHuyYeuCauXacNhan: boolean = false;
  IsShowHoanThanh: boolean = false;
  IsShowDatVeMoi: boolean = false;
  IsHetHanDangKyOT: boolean = false;
  IsHetHanKeHoachOT: boolean = false;
  IsShowDangKyOT: boolean = false;
  IsShowHuyDangKyOT: boolean = false;
  IsShowOtKeHoachKhac: boolean = false;
  IsPheDuyetTemLead: boolean = false;
  IsNguoiTao: boolean = false;

  isShowGiaHanKHOT: boolean = false;

  trangThaiDeXuat: number = 1;

  listSelectedDonVi: any = [];
  dangKyOTColumns: any;
  dangKyOTList: any; // b???ng danh s??ch ????ng k?? OT

  thanhVienOTColumns: any;
  thanhVienOTListShow: any; // hi???n th??? listNV oT theo ph??ng ban
  thanhVienOTAllColumns: any;
  thanhVienOTList: any; //Th??nh vi??n ph??ng ban ????ng k?? OT

  IsShowPheDuyetDangKyOTTheoPhongBan: boolean = false; // hi???n th??? n??t ph?? duy???t n???u tr???ng th??i == 2: ch??? ph?? duy???t
  userTbpOrganizationId: string = null;

  showChiTietNvOtPhonngBan: boolean = false; // xem chi ti???t NV OT c???a ph??ng ban
  phongBan: any; // th??ng tin ph??ng ban ??ang xem chi ti???t
  selectedEmpCheckBoxPheDuyetTong: any = [];

  tuChoiType = ""; //Chia lo???i t??? ch???i (cho t??? ch???i ph?? duy???t k??? ho???ch OT v?? ????ng k?? OT) v?? ( t??? ch???i nh??n vi??n OT)
  selectedEmpCheckBox: any; //list th??nh vi??n ph?? duy???t OT

  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionDownLoad: boolean = true;
  actionUpLoad: boolean = true;
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  pageSize = 20;

  isEdit: boolean = true;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private employeeService: EmployeeService,
    private confirmationService: ConfirmationService,
    private def: ChangeDetectorRef,
    private getPermission: GetPermission,
    private quyTrinhService: QuyTrinhService,
    public dialogService: DialogService,
    private ref: ChangeDetectorRef,
    private folderService: ForderConfigurationService,
    private imageService: ImageUploadService,
    private commonService: CommonService,
    private encrDecrService: EncrDecrService
  ) { }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    let resource = "hrm/employee/kehoach-ot-detail/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      this.showMessage("warn", 'B???n kh??ng c?? quy???n truy c???p');
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
      if (params['deXuatOTId']) {
        this.deXuatOTId = Number(this.encrDecrService.get(params['deXuatOTId']));
      }

    });

    this.getMasterData();
  }

  setForm() {
    this.loaiOtFormControl = new FormControl(null, [Validators.required]);
    this.tenKeHoachFormControl = new FormControl(null, [Validators.required]);
    this.ngayDeXuatFormControl = new FormControl(null, [Validators.required]);
    this.nguoiDeXuatIdFormControl = new FormControl(null, [Validators.required]);
    this.donViIdFormControl = new FormControl(null, [Validators.required]);
    this.donViNameIdFormControl = new FormControl(null, [Validators.required]);
    this.diaDiemFormControl = new FormControl(null, [Validators.required]);
    this.ngayBatDauFormControl = new FormControl(null, [Validators.required]);
    this.ngayKetThucFormControl = new FormControl(null, [Validators.required]);
    this.gioBatDauFormControl = new FormControl(null, [Validators.required, Validators.max(null)]);
    this.gioKetThucFormControl = new FormControl(null, [Validators.required]);
    this.lyDoFormControl = new FormControl(null, [Validators.required]);
    this.hanPheDuyetKeHoachFormControl = new FormControl(null, [Validators.required]);
    this.hanDangKyOTFormControl = new FormControl(null, [Validators.required]);
    this.hanPheDuyetDangKyFormControl = new FormControl(null, [Validators.required]);
    this.loaiCaOtControl = new FormControl(null, [Validators.required]);

    this.keHoachOtFormGroup = new FormGroup({
      loaiOtFormControl: this.loaiOtFormControl,
      tenKeHoachFormControl: this.tenKeHoachFormControl,
      ngayDeXuatFormControl: this.ngayDeXuatFormControl,
      nguoiDeXuatIdFormControl: this.nguoiDeXuatIdFormControl,
      donViIdFormControl: this.donViIdFormControl,
      diaDiemFormControl: this.diaDiemFormControl,
      ngayBatDauFormControl: this.ngayBatDauFormControl,
      ngayKetThucFormControl: this.ngayKetThucFormControl,
      gioBatDauFormControl: this.gioBatDauFormControl,
      gioKetThucFormControl: this.gioKetThucFormControl,
      lyDoFormControl: this.lyDoFormControl,
      hanPheDuyetKeHoachFormControl: this.hanPheDuyetKeHoachFormControl,
      hanDangKyOTFormControl: this.hanDangKyOTFormControl,
      hanPheDuyetDangKyFormControl: this.hanPheDuyetDangKyFormControl,
      donViNameIdFormControl: this.donViNameIdFormControl,
      loaiCaOtControl: this.loaiCaOtControl
    });

    // FORM GROUP pop-up gia h???n th??m ????ng k?? ot
    this.hanDangKyOTPopUpFormControl = new FormControl(null, [Validators.required]);
    this.hanPheDuyetDangKyOTPopUpFormControl = new FormControl(null, [Validators.required]);

    this.giaHanThemPopUpFromGroup = new FormGroup({
      hanDangKyOTPopUpFormControl: this.hanDangKyOTPopUpFormControl,
      hanPheDuyetDangKyOTPopUpFormControl: this.hanPheDuyetDangKyOTPopUpFormControl
    });

    // FORM GROUP pop-up gia h???n th??m
    this.hanPheDuyeKhotFormControl = new FormControl(null, [Validators.required]);
    this.hanDangKyOTGiaHanKhotFormControl = new FormControl(null, [Validators.required]);
    this.hanPheDuyetDangKyOTGiaHanKhotFormControl = new FormControl(null, [Validators.required]);

    this.giaHanThemKhotPopUpFromGroup = new FormGroup({
      hanPheDuyeKhotFormControl: this.hanPheDuyeKhotFormControl,
      hanDangKyOTGiaHanKhotFormControl: this.hanDangKyOTGiaHanKhotFormControl,
      hanPheDuyetDangKyOTGiaHanKhotFormControl: this.hanPheDuyetDangKyOTGiaHanKhotFormControl
    });
  }

  setTable() {
    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', type: 'string' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', type: 'number' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right', type: 'date' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', type: 'string' },
    ];

    this.dangKyOTColumns = [
      { field: 'organizationName', header: 'T??n ph??ng ban', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'soLuongDangKy', header: 'S??? l?????ng ????ng k??', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'soLuongDaDuyet', header: 'S??? l?????ng ???? duy???t', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'trangThai', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
    ];

    this.thanhVienOTColumns = [
      { field: 'employeeCode', header: 'M?? NV', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'employeeName', header: 'H??? t??n', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'positionName', header: 'Ch???c v???', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'trangThai', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'ghiChu', header: 'Ghi ch??', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
    ];

    this.thanhVienOTAllColumns = [
      { field: 'organizationName', header: 'Ph??ng ban', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'employeeCode', header: 'M?? NV', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'employeeName', header: 'H??? t??n', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'positionName', header: 'Ch???c v???', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'trangThai', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
      { field: 'ghiChu', header: 'Ghi ch??', textAlign: 'center', display: 'table-cell', width: '150px', type: 1 },
    ];
  }

  getMasterData() {
    this.loading = true;
    this.employeeService.getMasterKeHoachOTDetail(this.deXuatOTId).subscribe(response => {
      let result = <any>response;
      this.loading = false;

      if (result.statusCode == 200) {
        this.listLoaiOt = result.listLoaiOt;
        this.listLoaiCaOt = result.listLoaiCaOt;
        this.cauHinhOtCaNgay = result.cauHinhOtCaNgay;
        this.listPhongBan = result.listOrganization.map(x => x.organizationId); // list Id c???a c??c phong ban
        this.listPhongBanIn4 = result.listOrganization; //List th??ng tin c???a c??c ph??ng ban
        this.listEmp = result.currentEmp; // ng?????i ????ng nh???p hi???n t???i
        this.keHoachOT = result.keHoachOt; // th??ng tin k??? ho???ch OT
        this.userTbpOrganizationId = result.userTbpOrganizationId;

        this.thanhVienOTList = result.listOTThanhVien; // list nh??n vi??n OT
        //Tr???ng th??i c???a th??nh vi??n ????ng k?? OT
        // 1: Ch??? duy???t
        // 2: Ph?? duy???t
        // 3: T??? ch???i
        this.dangKyOTList = [];
        if (result.keHoachOt.trangThai != 1 && result.keHoachOt.trangThai != 2 && result.keHoachOt.trangThai != 8) {
          result.listPhongBanOT.forEach(obj => { // list c??c ph??ng ban ???????c OT
            var phongBanIn4 = new phongBanList();
            var checkEmpty = this.thanhVienOTList.find(x => x.organizationId == obj.organizationId); // ki???m tra xem ph??ng ban c?? th??nh vi??n hay kh??ng
            if (checkEmpty) {
              phongBanIn4.organizationId = checkEmpty.organizationId;
              phongBanIn4.organizationName = checkEmpty.organizationName;
              phongBanIn4.soLuongDangKy = this.thanhVienOTList.filter(x => x.organizationId == obj.organizationId) ? this.thanhVienOTList.filter(x => x.organizationId == obj.organizationId).length : 0;
              phongBanIn4.soLuongDaDuyet = this.thanhVienOTList.filter(x => x.organizationId == obj.organizationId) ? this.thanhVienOTList.filter(x => x.organizationId == obj.organizationId && x.trangThai == 3).length : 0;
              phongBanIn4.trangThai = obj.trangThai;
            } else {
              phongBanIn4.organizationId = obj.organizationId;
              phongBanIn4.organizationName = this.listPhongBanIn4.find(x => x.organizationId == obj.organizationId).organizationName;
              phongBanIn4.soLuongDangKy = 0
              phongBanIn4.soLuongDaDuyet = 0;
              phongBanIn4.trangThai = obj.trangThai;
            }
            this.dangKyOTList.push(phongBanIn4);
          });
        }

        this.setDefaultValue(result);
        this.getDuLieuQuyTrinh();
        this.arrayDocumentModel = result.listFileInFolder;
      } else {
        this.showMessage('error', result.messageCode);
      }
    });
  }

  changeGhiChu(data) {

    this.employeeService.saveGhiChuNhanVienKeHoachOT(data.thanVienOtId, data.ghiChu).subscribe(response => {
      let result = <any>response;
      this.loading = false;
      if (result.statusCode != 200) {
        this.showMessage('error', result.messageCode);
      }
    });

  }

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  getDuLieuQuyTrinh() {
    //?????i t?????ng ??p d???ng: 12: ????? xu???t k??? ho???ch OT
    //?????i t?????ng ??p d???ng: 13: ????ng k?? OT
    var DoiTuongApDung = 0;
    if (this.keHoachOT.trangThai == 1 || this.keHoachOT.trangThai == 2 || this.keHoachOT.trangThai == 8)//?????i t?????ng ??p d???ng l?? 12: ????? xu???t k??? ho???ch OT
    {
      DoiTuongApDung = 12;
    } else if (this.keHoachOT.trangThai == 3 || this.keHoachOT.trangThai == 4 || this.keHoachOT.trangThai == 4 || this.keHoachOT.trangThai == 9)// ?????i t?????ng ??p d???ng l?? 12: ????ng k?? OT
    {
      DoiTuongApDung = 13;
    }

    this.quyTrinhService.getDuLieuQuyTrinh(this.emptyGuid, DoiTuongApDung, this.deXuatOTId).subscribe(res => {
      let result: any = res;

      if (result.statusCode == 200) {
        this.listFormatStatusSupport = result.listDuLieuQuyTrinh;
      }
      else {
        this.showMessage('error', result.messageCode);
      }
    });
  }

  setDefaultValue(data) {
    this.loaiOtFormControl.setValue(this.listLoaiOt.find(x => x.categoryId == data.keHoachOt.loaiOtId));
    this.tenKeHoachFormControl.setValue(data.keHoachOt.tenKeHoach);
    this.ngayDeXuatFormControl.setValue(new Date(data.keHoachOt.ngayDeXuat));
    this.nguoiDeXuatIdFormControl.setValue(this.listEmp[0]);
    let listIdPhonngBanOT = data.listPhongBanOT.map(x => x.organizationId);
    let listPhongbanOT = this.listPhongBanIn4.filter(x => listIdPhonngBanOT.indexOf(x.organizationId) > -1);
    this.donViIdFormControl.setValue(listPhongbanOT);
    this.donViNameIdFormControl.setValue(listPhongbanOT.map(x => x.organizationName));
    this.listSelectedDonVi = listPhongbanOT;
    this.diaDiemFormControl.setValue(data.keHoachOt.diaDiem);
    this.ngayBatDauFormControl.setValue(new Date(data.keHoachOt.ngayBatDau));
    this.ngayKetThucFormControl.setValue(new Date(data.keHoachOt.ngayKetThuc));

    //N???u l?? ca t???i
    if (data.keHoachOt.loaiCaId == 3) {
      this.gioBatDauFormControl.setValue(this.commonService.convertTimeSpanToDate(data.keHoachOt.gioBatDau));
      this.gioKetThucFormControl.setValue(this.commonService.convertTimeSpanToDate(data.keHoachOt.gioKetThuc));
    }

    this.lyDoFormControl.setValue(data.keHoachOt.lyDo);
    this.hanPheDuyetKeHoachFormControl.setValue(new Date(data.keHoachOt.hanPheDuyetKeHoach));
    this.hanDangKyOTFormControl.setValue(new Date(data.keHoachOt.hanDangKy));
    this.hanPheDuyetDangKyFormControl.setValue(new Date(data.keHoachOt.hanPheDuyetDangKy));
    this.nguoiDeXuatIdFormControl.disable();
    this.loaiCaOtControl.setValue(this.listLoaiCaOt.find(x => x.value == data.keHoachOt.loaiCaId));
    this.trangThaiDeXuat = data.keHoachOt.trangThai;
    this.changeLoaiCaOt();

    //tr???ng th??i n??t
    this.IsShowGuiXacNhan = data.isShowGuiXacNhan;
    this.IsShowXacNhan = data.isShowXacNhan;
    this.IsShowTuChoi = data.isShowTuChoi;
    this.IsShowLuu = data.isShowLuu;
    this.IsShowXoa = data.isShowXoa;
    this.IsShowHuy = data.isShowHuy;
    this.IsShowHuyYeuCauXacNhan = data.isShowHuyYeuCauXacNhan;
    this.IsShowHoanThanh = data.isShowHoanThanh;
    this.IsShowDatVeMoi = data.isShowDatVeMoi;
    this.IsShowDangKyOT = data.isShowDangKyOT;
    this.IsShowHuyDangKyOT = data.isShowHuyDangKyOT;
    this.IsShowOtKeHoachKhac = data.isShowOtKeHoachKhac;
    this.IsPheDuyetTemLead = data.isPheDuyetTemLead;
    this.IsNguoiTao = data.isNguoiTao;
  }

  changeLoaiCaOt() {
    let loaiCaOt = this.loaiCaOtControl.value;

    if (!loaiCaOt || !this.cauHinhOtCaNgay) return;

    //N???u l?? ca t???i
    if (loaiCaOt.value == 3) {
      this.gioBatDauFormControl.setValidators([Validators.required]);
      this.gioKetThucFormControl.setValidators([Validators.required]);
    }
    //N???u kh??ng ph???i ca t???i
    else {
      this.gioBatDauFormControl.setValidators([]);
      this.gioKetThucFormControl.setValidators([]);
    }

    this.gioBatDauFormControl.updateValueAndValidity();
    this.gioKetThucFormControl.updateValueAndValidity();

    switch (loaiCaOt.value) {
      //Ca s??ng
      case 1:
        this.gioBatDau = this.cauHinhOtCaNgay ?.gioVaoSang.slice(0, this.cauHinhOtCaNgay ?.gioVaoSang.lastIndexOf(':'));
        this.gioKetThuc = this.cauHinhOtCaNgay ?.gioRaSang.slice(0, this.cauHinhOtCaNgay ?.gioRaSang.lastIndexOf(':'));
        break;

      //Ca chi???u
      case 2:
        this.gioBatDau = this.cauHinhOtCaNgay ?.gioVaoChieu.slice(0, this.cauHinhOtCaNgay ?.gioVaoChieu.lastIndexOf(':'));
        this.gioKetThuc = this.cauHinhOtCaNgay ?.gioRaChieu.slice(0, this.cauHinhOtCaNgay ?.gioRaChieu.lastIndexOf(':'));
        break;

      //Ca t???i
      case 3:
        this.gioBatDau = null;
        this.gioKetThuc = null;
        break;

      //C??? ng??y
      case 4:
        this.gioBatDau = this.cauHinhOtCaNgay ?.gioVaoSang.slice(0, this.cauHinhOtCaNgay ?.gioVaoSang.lastIndexOf(':'));
        this.gioKetThuc = this.cauHinhOtCaNgay ?.gioRaChieu.slice(0, this.cauHinhOtCaNgay ?.gioRaChieu.lastIndexOf(':'));
        break;

      default:
        this.gioBatDau = null;
        this.gioKetThuc = null;
        break;
    }
  }

  goBackToList() {
    this.router.navigate(['/employee/danh-sach-de-xuat-ot']);
  }

  update(guiXacNhan) {
    if (!this.keHoachOtFormGroup.valid) {
      Object.keys(this.keHoachOtFormGroup.controls).forEach(key => {
        if (this.keHoachOtFormGroup.controls[key].valid == false) {
          this.keHoachOtFormGroup.controls[key].markAsTouched();
        }
      });
      return;
    }

    let loaiCaOt = this.loaiCaOtControl.value;

    let gioBatDau = null;
    let gioKetThuc = null;

    //N???u l?? ca t???i
    if (loaiCaOt.value == 3) {
      gioBatDau = this.commonService.convertDateToTimeSpan(this.gioBatDauFormControl.value);
      gioKetThuc = this.commonService.convertDateToTimeSpan(this.gioKetThucFormControl.value);

      if (this.gioBatDauFormControl.value.getTime() > this.gioKetThucFormControl.value.getTime()) {
        this.showMessage('warn', 'Gi??? b???t ?????u kh??ng ???????c l???n h??n gi??? k???t th??c');
        return;
      }
    }
    //N???u kh??ng ph???i ca t???i
    else {
      gioBatDau = this.gioBatDau;
      gioKetThuc = this.gioKetThuc;
    }

    let keHoachOtModel = new KeHoachOtModel();
    keHoachOtModel.KeHoachOtId = this.deXuatOTId;
    keHoachOtModel.DiaDiem = this.diaDiemFormControl.value ? this.diaDiemFormControl.value : '';
    keHoachOtModel.GioBatDau = gioBatDau;
    keHoachOtModel.GioKetThuc = gioKetThuc;
    keHoachOtModel.LoaiOtId = this.loaiOtFormControl.value.categoryId;
    keHoachOtModel.LyDo = this.lyDoFormControl.value;
    keHoachOtModel.NgayBatDau = this.ngayBatDauFormControl.value;
    keHoachOtModel.NgayDeXuat = this.ngayDeXuatFormControl.value;
    keHoachOtModel.NgayKetThuc = this.ngayKetThucFormControl.value;
    keHoachOtModel.NguoiDeXuatId = this.nguoiDeXuatIdFormControl.value.employeeId;
    keHoachOtModel.TenKeHoach = this.tenKeHoachFormControl.value;
    keHoachOtModel.TrangThai = 1;
    keHoachOtModel.HanPheDuyetKeHoach = this.hanPheDuyetKeHoachFormControl.value;
    keHoachOtModel.HanDangKy = this.hanDangKyOTFormControl.value;
    keHoachOtModel.HanPheDuyetDangKy = this.hanPheDuyetDangKyFormControl.value;
    keHoachOtModel.LoaiCaId = this.loaiCaOtControl.value.value;

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
      fileUpload.FileInFolder.objectType = 'KEHOACHOT';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    let listPhongBan: Array<KeHoachOtPhongBanEntityModel> = [];
    if (this.donViIdFormControl.value) {
      this.donViIdFormControl.value.forEach(item => {

        var newObj = new KeHoachOtPhongBanEntityModel();
        newObj.OrganizationId = item.organizationId;
        listPhongBan.push(newObj);
      });
    }

    this.loading = true;
    this.awaitResult = true;
    this.employeeService.createOrUpdateKeHoachOt(keHoachOtModel, this.newKeHoachOtId, "KEHOACHOT", listFileUploadModel, listPhongBan).subscribe(response => {
      let result = <any>response;
      this.loading = false;
      if (result.statusCode === 202 || result.statusCode === 200) {
        this.showMessage('success', 'C???p nh???t k??? ho???ch OT th??nh c??ng');
        this.awaitResult = false;
        this.resetFieldValue();
        this.getMasterData();
        if (guiXacNhan == true) {
          this.guiXacNhan();
        }
      }
      else {
        this.showMessage('error', result.messageCode);
        this.awaitResult = false;
      };
    });


  }

  openItem(name, url) {
    this.imageService.downloadFile(name, url).subscribe(response => {
      var result = <any>response;
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
          anchor.download = name;
          anchor.href = fileURL;
          anchor.click();
        }
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
        this.showMessage('error', result.messageCode);
      }
    });
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

  /*Event Khi click x??a t???ng file*/
  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event upload list file*/
  myUploader(event) {
    let listFileUploadModel: Array<FileUploadModel> = [];
    this.uploadedFiles.forEach(item => {
      let fileUpload: FileUploadModel = new FileUploadModel();
      fileUpload.FileInFolder = new FileInFolder();
      fileUpload.FileInFolder.active = true;
      let index = item.name.lastIndexOf(".");
      let name = item.name.substring(0, index);
      fileUpload.FileInFolder.fileName = name;
      fileUpload.FileInFolder.fileExtension = item.name.substring(index, item.name.length - index);
      fileUpload.FileInFolder.size = item.size;
      fileUpload.FileInFolder.objectNumber = this.deXuatOTId;
      fileUpload.FileInFolder.objectType = 'KEHOACHOT';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    this.employeeService.uploadFile("KEHOACHOT", listFileUploadModel, null, this.deXuatOTId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        this.uploadedFiles = [];

        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }

        this.arrayDocumentModel = result.listFileInFolder;

        this.showMessage('success', "Th??m file th??nh c??ng");
      } else {
        this.showMessage('error', result.message);
      }
    });
  }

  /*Event Khi click x??a to??n b??? file*/
  clearAllFile() {
    this.uploadedFiles = [];
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
            this.showMessage("success", "X??a file th??nh c??ng");
          } else {
            this.showMessage("error", result.messageCode);
          }
        })
      }
    });
  }

  //Function reset to??n b??? c??c value ???? nh???p tr??n form
  resetFieldValue() {
    this.fileUpload.clear();
    this.keHoachOtFormGroup.reset();
    this.nguoiDeXuatIdFormControl.setValue(this.currentEmployeeCodeName);
    this.def.detectChanges();
  }
  //K???t th??c

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
  }

  changeTuNgay() {
    this.hanPheDuyetKeHoachFormControl.reset();
    this.hanDangKyOTFormControl.reset();
    this.hanPheDuyetDangKyFormControl.reset();
  }

  changeHanPheDuyetKH() {
    this.hanDangKyOTFormControl.reset();
    this.hanPheDuyetDangKyFormControl.reset();
  }

  changeHanDangKy() {
    this.hanPheDuyetDangKyFormControl.reset();
  }

  async guiXacNhan() {
    let DoiTuongApDung
    if (this.trangThaiDeXuat == 1) { // m???i c???a k??? ho???ch OT
      DoiTuongApDung = 12;
    }
    if (this.trangThaiDeXuat == 3) {// m???i c???a ????ng k?? OT
      DoiTuongApDung = 13;
    }

    this.loading = true;
    this.quyTrinhService.guiPheDuyet(this.emptyGuid, 12, this.deXuatOTId).subscribe(res => {
      let result: any = res;
      if (result.statusCode == 200) {
        this.showMessage("success", result.messageCode);
        this.getMasterData();
      }
      else {
        this.loading = false;
        this.showMessage("error", result.messageCode);
      }
    });
  }

  closeChooseFileImportDialog() {
    this.cancelFile();
  }

  cancelFile() {
    let fileInput = $("#importFileProduct")
    fileInput.replaceWith(fileInput.val('').clone(true));
    this.fileName = "";
  }

  onViewDetailPhongBan(rowData) {
    this.phongBan = rowData;
    this.showChiTietNvOtPhonngBan = false;
    if (rowData.trangThai == 2 && this.phongBan.organizationId == this.userTbpOrganizationId) {
      this.IsShowPheDuyetDangKyOTTheoPhongBan = true;
    }
    else {
      this.IsShowPheDuyetDangKyOTTheoPhongBan = false;
    }
    this.showChiTietNvOtPhonngBan = true;
    this.thanhVienOTListShow = this.thanhVienOTList.filter(x => x.organizationId == rowData.organizationId);
  }

  huyYeuCacXacNhan() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n h???y y??u c???u x??c nh???n k??? ho???ch OT n??y kh??ng?',
      accept: async () => {
        // await this.createOrUpdate(false);

        this.loading = true;
        let DoiTuongApDung
        if (this.trangThaiDeXuat == 2) { // ch??? ph?? duy???t c???a k??? ho???ch OT
          DoiTuongApDung = 12;
        }
        if (this.trangThaiDeXuat == 4) {// ch??? ph?? duy???t c???a ????ng k?? OT
          DoiTuongApDung = 13;
        }
        this.quyTrinhService.huyYeuCauPheDuyet(this.emptyGuid, DoiTuongApDung, this.deXuatOTId).subscribe(res => {
          let result: any = res;
          if (result.statusCode != 200) {
            this.loading = false;
            this.showMessage("error", result.messageCode);
            return;
          }

          this.showMessage("success", result.messageCode);
          this.getMasterData();
        });
      }
    });
  }

  async tuChoi() {
    if (this.lyDoTuChoi == null || this.lyDoTuChoi.trim() == '') {
      this.showMessage("warn", "H??y nh???p l?? do t??? ch???i");
      this.getMasterData();
      return;
    }

    this.loading = true;
    let DoiTuongApDung
    if (this.trangThaiDeXuat == 2) { // ch??? ph?? duy???t c???a k??? ho???ch OT
      DoiTuongApDung = 12;
    }
    if (this.trangThaiDeXuat == 4) {// ch??? ph?? duy???t c???a ????ng k?? OT
      DoiTuongApDung = 13;
    }
    this.quyTrinhService.tuChoi(this.emptyGuid, DoiTuongApDung, this.lyDoTuChoi, this.deXuatOTId).subscribe(res => {
      let result: any = res;

      if (result.statusCode == 200) {
        this.showMessage("success", result.messageCode);
        this.getMasterData();
      }
      else {
        this.loading = false;
        this.showMessage("error", result.messageCode);
      }
    });
    this.showLyDoTuChoi = false;
    this.lyDoTuChoi = "";
  }

  async xacNhan() {
    let DoiTuongApDung
    if (this.trangThaiDeXuat == 2) { // ch??? ph?? duy???t c???a k??? ho???ch OT
      DoiTuongApDung = 12;
    }
    if (this.trangThaiDeXuat == 4) {// ch??? ph?? duy???t c???a ????ng k?? OT
      DoiTuongApDung = 13;
    }

    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n ph?? duy???t k??? ho???ch OT n??y?',
      accept: async () => {
        this.loading = true;
        this.quyTrinhService.pheDuyet(this.emptyGuid, DoiTuongApDung, '', this.deXuatOTId).subscribe(res => {
          let result: any = res;
          if (result.statusCode == 200) {
            this.showMessage("success", result.messageCode);
            this.getMasterData();
          }
          else {
            this.loading = false;
            this.showMessage("error", result.messageCode);
          }
        });
      }
    });
  }

  async datVeMoi() {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n ?????t v??? tr???ng th??i m???i k??? ho???ch OT n??y?',
      accept: async () => {
        let res: any = await this.employeeService.datVeMoiKeHoachOt(this.deXuatOTId);
        if (res.statusCode === 200) {
          this.showMessage("success", "?????t v??? m???i k??? ho???ch OT th??nh c??ng");
          this.getMasterData();
        } else {
          this.showMessage("success", res.message);
        }
      }
    });
  }

  async DangKyOTOrHuyDangKyOT(type) {
    // type == true => ????ng k?? v?? ng?????c l???i
    let res: any = await this.employeeService.dangKyOTOrHuyDangKyOT(this.deXuatOTId, type);
    if (res.statusCode === 200) {
      this.showMessage("success", res.message);
      this.getMasterData();
    } else {
      this.showMessage("error", res.message);
    }
  }

  openOrgPopup() {
    let listSelectedId = this.listSelectedDonVi.map(item => item.organizationId);

    let ref = this.dialogService.open(ChonNhieuDvDialogComponent, {
      data: {
        mode: 1,
        listSelectedId: listSelectedId,
        type: 'KeHoachOt',
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
        if (result ?.length > 0) {
          this.listSelectedDonVi = result;
          let listSelectedTenDonVi = this.listSelectedDonVi.map(x => x.organizationName);
          this.donViIdFormControl.setValue(result);
          this.donViNameIdFormControl.setValue(listSelectedTenDonVi);
        }
        else {
          this.listSelectedDonVi = [];
          this.donViIdFormControl.setValue([]);
        }
      }
    });
  }

  pheDuyetThanhVienOT() {
    if (this.selectedEmpCheckBox == null && this.thanhVienOTListShow.length > 0) {
      this.showMessage("warn", "H??y ch???n nh??n vi??n ????ng k?? OT ????? ph?? duy???t!");
      return;
    }

    if (this.selectedEmpCheckBox != null || (this.selectedEmpCheckBox == null && this.thanhVienOTListShow.length == 0)) {
      this.confirmationService.confirm({
        message: 'B???n ch???c ch???n mu???n ph?? duy???t ????ng k?? OT cho c??c nh??n vi??n ???????c tick ch???n?',
        accept: () => {
          this.loading = true;
          let listIdPheDuyet = this.selectedEmpCheckBox ?.map(x => x.employeeId) || [];
          this.employeeService.pheDuyetNhanSuDangKyOT(listIdPheDuyet, this.thanhVienOTListShow, this.phongBan.organizationId, this.deXuatOTId).subscribe(res => {
            let result: any = res;
            if (result.statusCode != 200) {
              this.loading = false;
              this.showMessage("error", result.message);
              return;
            }
            this.selectedEmpCheckBox = null;
            this.loading = false;
            this.showMessage("success", result.message);
            this.showChiTietNvOtPhonngBan = false;
            this.getMasterData();
          });
        }
      });
    }
  }

  tuChoiNhanVienOTTongPheDuyet() {
    if (this.lyDoTuChoi == null || this.lyDoTuChoi.trim() == '') {
      this.showMessage("warn", "H??y nh???p l?? do t??? ch???i");
      this.getMasterData();
      return;
    }

    let listIdTuChoi = this.selectedEmpCheckBoxPheDuyetTong.map(x => x.employeeId);
    this.employeeService.tuChoiNhanVienOTTongPheDuyet(listIdTuChoi, this.thanhVienOTList, this.deXuatOTId).subscribe(res => {
      let result: any = res;
      if (result.statusCode != 200) {
        this.loading = false;
        this.showMessage("error", result.message);
        return;
      }
      this.showMessage("success", result.message);
      this.showLyDoTuChoi = false;
      this.lyDoTuChoi = '';

      this.getMasterData();
    });
  }

  isShowGiaHan: boolean = false;
  async dangKyThem() {
    this.giaHanThemType = "DangKyThem";
    let today = new Date();
    let thoiHanDangKyOT = new Date(this.keHoachOT.hanDangKy);
    if (thoiHanDangKyOT < today) {
      this.isShowGiaHan = true;
    } else {
      await this.giaHanThemKeHoachOT(1);
      this.getMasterData();
    }
  }

  async dangKyLai() {
    this.giaHanThemType = "DangKyLai";
    let today = new Date();
    let thoiHanDangKyOT = new Date(this.keHoachOT.hanDangKy);
    if (thoiHanDangKyOT < today) {
      this.isShowGiaHan = true;
    } else {
      await this.giaHanThemKeHoachOT(2);
      this.getMasterData();
    }
  }

  async giaHanThemKeHoachOT(type) {
    // ?????nh ngh??a type
    // 0: ????ng k?? c?? gia h???n v?? ph??n bi???t b???ng giaHanThemType Code  ( DangKyThem, DangKyLai )
    // 1: ????ng k?? th??m kh??ng c?? gia h???n th??m
    // 2: ????ng k?? l???i kh??ng c?? gia h???n th??m
    let giaHanDangKyOT = null;
    let giaHanPheDuyetDangKyOT = null;
    if (type == 0) {
      if (!this.giaHanThemPopUpFromGroup.valid) {
        Object.keys(this.giaHanThemPopUpFromGroup.controls).forEach(key => {
          if (this.giaHanThemPopUpFromGroup.controls[key].valid == false) {
            this.giaHanThemPopUpFromGroup.controls[key].markAsTouched();
          }
        });
        this.showMessage("error", "H??y nh???p ?????y ????? th??ng tin c???n thi???t");
        return;
      }
      giaHanDangKyOT = convertToUTCTime(this.hanDangKyOTPopUpFormControl.value);
      giaHanPheDuyetDangKyOT = convertToUTCTime(this.hanPheDuyetDangKyOTPopUpFormControl.value);
    }

    let res: any = await this.employeeService.giaHanThemKeHoachOT(this.deXuatOTId, type, this.giaHanThemType, giaHanDangKyOT, giaHanPheDuyetDangKyOT);
    if (res.statusCode === 200) {
      this.showMessage("success", "Gia h???n th??m th??nh c??ng");
      this.isShowGiaHan = false;
      this.getMasterData();
    } else {
      this.showMessage("error", res.message);
    }
  }

  tickAllNv(checkValue) {
    if (checkValue) {
      this.selectedEmpCheckBoxPheDuyetTong = this.thanhVienOTList.filter(x => x.trangThai == 2);//l???c ra nh???ng NV OT c?? tr???ng th??i l?? ch??? ph?? duy???t: 2
    } else {
      this.selectedEmpCheckBoxPheDuyetTong = [];
    }
  }

  editTime() {

  }

  giaHanThemPheDuyetKHOT() {
    if (!this.giaHanThemKhotPopUpFromGroup.valid) {
      Object.keys(this.giaHanThemKhotPopUpFromGroup.controls).forEach(key => {
        if (this.giaHanThemKhotPopUpFromGroup.controls[key].valid == false) {
          this.giaHanThemKhotPopUpFromGroup.controls[key].markAsTouched();
        }
      });
      this.showMessage("error", "H??y nh???p ?????y ????? th??ng tin c???n thi???t");
      return;
    }
    let keHoachOtId = this.deXuatOTId;
    let hanPheDuyetKhot = convertToUTCTime(new Date(this.hanPheDuyeKhotFormControl.value));
    let hanDangKyOt = convertToUTCTime(new Date(this.hanDangKyOTGiaHanKhotFormControl.value));
    let hanPheDuyetDangKyOt = convertToUTCTime(new Date(this.hanPheDuyetDangKyOTGiaHanKhotFormControl.value));

    this.employeeService.giaHanThemPheDuyetKHOT(keHoachOtId, hanPheDuyetKhot, hanDangKyOt, hanPheDuyetDangKyOt).subscribe(response => {
      let result = <any>response;
      this.loading = false;
      if (result.statusCode === 202 || result.statusCode === 200) {
        this.showMessage('success', result.message);
        this.getMasterData();
        this.isShowGiaHanKHOT = false;
      }
      else {
        this.showMessage('error', result.message);
      };
    });
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};