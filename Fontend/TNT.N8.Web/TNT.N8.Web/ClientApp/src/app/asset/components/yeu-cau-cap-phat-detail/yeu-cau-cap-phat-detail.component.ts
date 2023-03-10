import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService, TreeNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { AssetService } from '../../services/asset.service';
import { Paginator, Table } from 'primeng';
import { DatePipe } from '@angular/common';
import { YeuCauCapPhatModel } from '../../models/yeu-cau-cap-phat';
import { YeuCauCapPhatChiTietModel } from '../../models/yeu-cau-cap-phat-chi-tiet';
import { NoteDocumentModel } from '../../../../app/shared/models/note-document.model';
import { EmployeeService } from '../../../../app/employee/services/employee.service';
import { NoteService } from '../../../../app/shared/services/note.service';
import { QuyTrinhService } from '../../../../app/admin/services/quy-trinh.service';
import * as XLSX from 'xlsx';
import { YeuCauCapPhatImportDetailComponent } from '../yeu-cau-cap-phat-import-detail/yeu-cau-cap-phat-import-detail.component';
import { TaiSanModel } from '../../models/taisan.model';
import { EncrDecrService } from '../../../shared/services/encrDecr.service';

class CategoryModel {
  categoryId: string;
  categoryCode: string;
  categoryName: string;

  constructor() {
    this.categoryId = '00000000-0000-0000-0000-000000000000';
    this.categoryCode = '';
    this.categoryName = '';
  }
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

class importAssetByExcelModel {
  // Lo???i t??i s???n
  // S??? l?????ng
  // M?? t???
  // m?? Nh??n vi??n
  // T??n nh??n vi??n
  // M?? m???c ????ch s??? d???ng
  // S??? d???ng t??? ng??y
  // S??? d???ng ?????n ng??y
  // L?? do
  maLoaiTaiSan: String;
  soLuong: String;
  moTa: String;
  employeeCode: String;
  tenNhanVien: String;
  maMucDichSuDung: String;
  mucDichSuDung: String;
  ngayBatDau: Date;
  ngayKetThuc: Date;
  lyDo: String;
}

@Component({
  selector: 'app-yeu-cau-cap-phat-detail',
  templateUrl: './yeu-cau-cap-phat-detail.component.html',
  styleUrls: ['./yeu-cau-cap-phat-detail.component.css']
})
export class YeuCauCapPhatDetailComponent implements OnInit {
  /*??i???u ki???n hi???n th??? c??c button*/
  isShowGuiPheDuyet: boolean = false;
  isShowPheDuyet: boolean = false;
  isShowTuChoi: boolean = false;
  isShowHuyYeuCauPheDuyet: boolean = false;
  isShowLuu: boolean = false;
  isShowXoa: boolean = false;
  isShowHuy: boolean = false;
  isShowPhanBo: boolean = false;
  isShowDatVeMoi: boolean = false;
  isShowHoanThanh: boolean = false;
  trangThai: number = 1;
  /*End*/

  today: Date = new Date();
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  @ViewChild('paginator', { static: true }) paginator: Paginator
  @ViewChild('myTable') myTable: Table;
  filterGlobal: string = '';

  /* End */
  /*Khai b??o bi???n*/
  auth: any = JSON.parse(localStorage.getItem("auth"));
  employeeId: string = JSON.parse(localStorage.getItem('auth')).EmployeeId;
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  awaitResult: boolean = false;
  /* Action*/
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionCapPhat: boolean = true;
  /*END*/
  // Label tr??n form
  nguoiDeXuat: string = '';
  maYeuCau: string = '';
  /* Form */
  yeuCauCapPhatForm: FormGroup;

  loaiTaiSanControl: FormControl;
  moTaControl: FormControl;
  nhanVienControl: FormControl;
  mucDichSuDungControl: FormControl;
  ngayBatDauControl: FormControl;
  ngayKetThucControl: FormControl;
  lyDoControl: FormControl;
  soLuongControl: FormControl;

  // Th??ng tin chung
  ngayDeXuatControl: FormControl;
  // D??? li???u masterdata
  listLoaiTS: Array<CategoryModel> = new Array<CategoryModel>();
  listMucDichSuDung: Array<CategoryModel> = new Array<CategoryModel>();
  listEmployee: Array<EmployeeModel> = new Array<EmployeeModel>();

  // notification
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;

  // T??i li???u li??n quan
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  colsFile: any[];
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  employeeModel: EmployeeModel = new EmployeeModel();
  isUpdate: boolean = false;

  selectedColumns: any[];
  cols: any[];

  listTaiSanYeuCauTemp: Array<YeuCauCapPhatChiTietModel> = new Array<YeuCauCapPhatChiTietModel>();
  yeuCauCapPhatTaiSanId: number = 0;
  yeuCauCapPhat: YeuCauCapPhatModel = new YeuCauCapPhatModel();

  trangThaiYC: string = 'M???i';
  yeuCauCapPhatTaiSanChiTietId: number = 0;
  disableForm: boolean = false;
  statusCode: string = null;

  ngayDeXuat = new Date();
  awaitResponseApprove: boolean = false;
  displayReject: boolean = false;
  descriptionReject: string = '';

  //#region   QUY TR??NH PH?? DUY???T
  listFormatStatusSupport: Array<any> = []; // Thanh tr???ng th??i
  showLyDoTuChoi: boolean = false;
  tuChoiForm: FormGroup;
  lyDoTuChoiControl: FormControl;
  //#endregion

  // Excel
  displayChooseFileImportDialog: boolean = false;
  fileName: string = '';
  importFileExcel: any = null;

  // Ph??n b??? t??i s???n
  taoPhanBoForm: FormGroup;
  taiSanPhanBoControl: FormControl;
  ngayBatDauPhanBoControl: FormControl;
  ngayKetThucPhanBoControl: FormControl;
  yeuCauCapPhatChiTietModel: YeuCauCapPhatChiTietModel = new YeuCauCapPhatChiTietModel();
  listTaiSanChuaPhanBo: Array<TaiSanModel> = new Array<TaiSanModel>();
  listTaiSanChuaPhanBoDefault: Array<TaiSanModel> = new Array<TaiSanModel>();

  listDonVi: Array<CategoryModel> = new Array<CategoryModel>();

  qrCode: any = "Loft3Di";
  displayCreateAsset: boolean = false;
  taoNhanhTSForm: FormGroup;
  maTaiSanControl: FormControl;
  tenTaiSanControl: FormControl;
  donViControl: FormControl;

  colsItem: any;
  dataTree: Array<TreeNode> = [];
  selectedColumnsPB: any[];
  isAddAsset: boolean = true;
  displayQRCode: boolean = false;

  refreshNote: number = 0;

  constructor(
    private assetService: AssetService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private getPermission: GetPermission,
    private el: ElementRef,
    private ref: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private noteService: NoteService,
    private quyTrinhService: QuyTrinhService,
    private encrDecrService: EncrDecrService,
  ) {

  }

  async ngOnInit() {
    this.setTable();
    this.setForm();
    let resource = "hrm/asset/chi-tiet-yeu-cau-cap-phat";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      this.showToast('warn', 'Th??ng b??o', 'B???n kh??ng c?? quy???n truy c???p');
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("cap-phat") == -1) {
        this.actionCapPhat = false;
      }
      if (listCurrentActionResource.indexOf("view") == -1) {
        this.router.navigate(['/home']);
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }

      this.route.params.subscribe(params => {
        this.yeuCauCapPhatTaiSanId = Number(this.encrDecrService.get(params['requestId']));
      });


      this.getMasterData();
    }
  }

  setForm() {
    this.ngayDeXuatControl = new FormControl(null, [Validators.required]);
    this.loaiTaiSanControl = new FormControl(null, [Validators.required]);
    this.nhanVienControl = new FormControl(null, [Validators.required]);
    this.mucDichSuDungControl = new FormControl(null, [Validators.required]);
    this.ngayBatDauControl = new FormControl(null, [Validators.required]);
    this.ngayKetThucControl = new FormControl(null);
    this.lyDoControl = new FormControl('');
    this.moTaControl = new FormControl('');
    this.soLuongControl = new FormControl(null, [Validators.required, Validators.min(0.00000000001)]);

    this.yeuCauCapPhatForm = new FormGroup({
      loaiTaiSanControl: this.loaiTaiSanControl,
      nhanVienControl: this.nhanVienControl,
      mucDichSuDungControl: this.mucDichSuDungControl,
      ngayBatDauControl: this.ngayBatDauControl,
      ngayKetThucControl: this.ngayKetThucControl,
      lyDoControl: this.lyDoControl,
      moTaControl: this.moTaControl,
      soLuongControl: this.soLuongControl
    });

    this.lyDoTuChoiControl = new FormControl(null, [Validators.required]);
    this.tuChoiForm = new FormGroup({
      lyDoTuChoiControl: this.lyDoTuChoiControl,
    });

    // Ph??n b??? t??i s???n
    this.taiSanPhanBoControl = new FormControl(null, [Validators.required]);
    this.ngayBatDauPhanBoControl = new FormControl(null, [Validators.required]);
    this.ngayKetThucPhanBoControl = new FormControl(null);

    this.taoPhanBoForm = new FormGroup({
      taiSanPhanBoControl: this.taiSanPhanBoControl,
      ngayBatDauPhanBoControl: this.ngayBatDauPhanBoControl,
      ngayKetThucPhanBoControl: this.ngayKetThucPhanBoControl,
    });

    // T???o nhanh t??i s???n
    this.maTaiSanControl = new FormControl(null, [Validators.required]);
    this.tenTaiSanControl = new FormControl(null, [Validators.required]);
    this.donViControl = new FormControl(null, [Validators.required]);
    this.taoNhanhTSForm = new FormGroup({
      maTaiSanControl: this.maTaiSanControl,
      tenTaiSanControl: this.tenTaiSanControl,
      donViControl: this.donViControl
    });
  }

  async getMasterData() {
    this.loading = true;
    let [result, resultDetail]: any = await Promise.all([
      this.assetService.getMasterDataYeuCauCapPhatForm(),
      this.assetService.getDataYeuCauCapPhatDetail(this.yeuCauCapPhatTaiSanId, this.auth.UserId)
    ]);

    await this.getDuLieuQuyTrinh();

    if (result.statusCode === 200 && resultDetail.statusCode == 200) {
      this.loading = false;

      this.listLoaiTS = result.listLoaiTSPB;
      this.listMucDichSuDung = result.listMucDichSuDung;
      this.listEmployee = result.listEmployee;
      this.listDonVi = result.listDonVi;
      this.listTaiSanChuaPhanBoDefault = result.listTaiSanChuaPhanBo;
      this.listTaiSanChuaPhanBo = result.listTaiSanChuaPhanBo;
      this.trangThaiYC = resultDetail.yeuCauCapPhat.trangThaiString
      this.mapDataFromModelToForm(resultDetail);

      this.arrayDocumentModel = resultDetail.listFileInFolder;
      this.ref.detectChanges();
    }
    else
      this.loading = false;
  }

  mapDataFromModelToForm(resultDetail: any) {
    this.isShowGuiPheDuyet = resultDetail.isShowGuiPheDuyet;
    this.isShowPheDuyet = resultDetail.isShowPheDuyet;
    this.isShowTuChoi = resultDetail.isShowTuChoi;
    this.isShowHuyYeuCauPheDuyet = resultDetail.isShowHuyYeuCauPheDuyet;
    this.isShowLuu = resultDetail.isShowLuu;
    this.isShowXoa = resultDetail.isShowXoa;
    this.isShowHuy = resultDetail.isShowHuy;
    this.isShowPhanBo = resultDetail.isShowPhanBo;
    this.isShowDatVeMoi = resultDetail.isShowDatVeMoi;
    this.trangThai = resultDetail.yeuCauCapPhat.trangThai;
    this.isShowHoanThanh = resultDetail.isShowHoanThanh;

    if (this.trangThai == 1)
      this.selectedColumns = this.cols.filter(e => e.field == "loaiTaiSan" || e.field == "soLuong" || e.field == "moTa"
        || e.field == "tenNhanVien" || e.field == "phongBan" || e.field == "viTriLamViec"
        || e.field == "mucDichSuDung" || e.field == "ngayBatDau" || e.field == "ngayKetThuc" || e.field == "lyDo"
      );
    else {
      this.selectedColumns = this.cols.filter(e => e.field == "loaiTaiSan" || e.field == "soLuong" || e.field == "moTa"
        || e.field == "tenNhanVien" || e.field == "phongBan" || e.field == "viTriLamViec"
        || e.field == "mucDichSuDung" || e.field == "soLuongPheDuyet" || e.field == "ngayBatDau" || e.field == "ngayKetThuc" || e.field == "lyDo"
      );
    }
    // Ng?????i ????? xu???t
    this.yeuCauCapPhat.nguoiDeXuat = resultDetail.yeuCauCapPhat.nguoiDeXuat;
    this.yeuCauCapPhat.nguoiDeXuatId = resultDetail.yeuCauCapPhat.nguoiDeXuatId;

    // M?? y??u c???u
    this.yeuCauCapPhat.maYeuCau = resultDetail.yeuCauCapPhat.maYeuCau;

    // Ng??y ????? xu???t
    let ngayDeXuat = resultDetail.yeuCauCapPhat.ngayDeXuat ? new Date(resultDetail.yeuCauCapPhat.ngayDeXuat) : null;
    this.yeuCauCapPhat.ngayDeXuat = ngayDeXuat;

    // Y??u c???u c???p ph??t
    this.yeuCauCapPhat.yeuCauCapPhatTaiSanId = resultDetail.yeuCauCapPhat.yeuCauCapPhatTaiSanId;

    // Danh s??ch t??i s???n y??u c???u
    this.listTaiSanYeuCauTemp = resultDetail.yeuCauCapPhat.listYeuCauCapPhatTaiSanChiTiet;

    if (this.isShowPhanBo || this.isShowHoanThanh) {
      this.rebuildYeuCauCPTree();
    }
    if (this.isShowHoanThanh) {
      this.taoPhanBoForm.disable();
    }

    if (this.trangThai != 1)
      this.yeuCauCapPhatForm.disable();
    this.ref.detectChanges();
  }

  setTable() {
    this.colsFile = [
      { field: 'fileFullName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', color: '#f44336' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', color: '#f44336' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'center', color: '#f44336' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', color: '#f44336' },
    ];

    this.cols = [
      { field: 'loaiTaiSan', header: 'Lo???i t??i s???n', width: '150px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'soLuong', header: 'SL', width: '50px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'soLuongPheDuyet', header: 'SL ph?? duy???t', width: '70px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'moTa', header: 'M?? t???', width: '150px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'tenNhanVien', header: 'NV y??u c???u', width: '150px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'phongBan', header: 'Ph??ng ban', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'viTriLamViec', header: 'V??? tr?? l??m vi???c', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'mucDichSuDung', header: 'M???c ????ch s??? d???ng', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'ngayBatDau', header: 'T??? ng??y', width: '100px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'ngayKetThuc', header: '?????n ng??y', width: '100px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'lyDo', header: 'L?? do', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
    ];

    this.selectedColumns = this.cols;

    this.colsItem = [
      // { field: '#', header: '#', width: '30px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'loaiTaiSan', header: 'Lo???i t??i s???n', width: '100px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'maTaiSan', header: 'M?? t??i s???n', width: '120px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'soLuong', header: 'SL y??u c???u', width: '50px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'soLuongPheDuyet', header: 'SL ph?? duy???t', width: '70px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'moTa', header: 'M?? t???', width: '120px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'tenNhanVien', header: 'NV y??u c???u', width: '140px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'phongBan', header: 'Ph??ng ban', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'viTriLamViec', header: 'V??? tr?? l??m vi???c', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'mucDichSuDung', header: 'M???c ????ch s??? d???ng', width: '100px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
      { field: 'ngayBatDau', header: 'T??? ng??y', width: '100px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'ngayKetThuc', header: '?????n ng??y', width: '100px', textAlign: 'center', display: 'table-cell', color: '#f44336' },
      { field: 'lyDo', header: 'L?? do', width: '60px', textAlign: 'left', display: 'table-cell', color: '#f44336' },
    ];
    this.selectedColumnsPB = this.colsItem;
  }

  //Function reset to??n b??? c??c value ???? nh???p tr??n form
  resetFieldValue() {
    this.listTaiSanYeuCauTemp = [];
    this.yeuCauCapPhatForm.reset();
    this.clearAllFile();
    this.arrayDocumentModel = [];
    this.ngayDeXuat = new Date();
  }

  mapFormDataToModel(): Array<YeuCauCapPhatChiTietModel> {
    let lstPhanBo = new Array<YeuCauCapPhatChiTietModel>();
    this.listTaiSanYeuCauTemp.forEach(taisan => {
      lstPhanBo.push(taisan)
    });

    return lstPhanBo;
  }

  mapFormToYCCapPhatModelTemp(isUpdate: boolean = false): YeuCauCapPhatChiTietModel {

    let yeuCauChiTietModel = new YeuCauCapPhatChiTietModel();
    if (!isUpdate) {
      const maxValueOfY = Math.max(...this.listTaiSanYeuCauTemp.map(o => o.yeuCauCapPhatTaiSanId), 0);
      yeuCauChiTietModel.yeuCauCapPhatTaiSanId = maxValueOfY + 1;
    }
    // lo???i T??i s???n
    let loaiTS = this.yeuCauCapPhatForm.get('loaiTaiSanControl').value;
    if (loaiTS != null && loaiTS != undefined) {
      yeuCauChiTietModel.loaiTaiSanId = loaiTS ? loaiTS.categoryId : 0;
      yeuCauChiTietModel.loaiTaiSan = loaiTS.categoryName;
    }

    // Nh??n vi??n
    let nhanVien = this.yeuCauCapPhatForm.get('nhanVienControl').value
    if (nhanVien != null && nhanVien != undefined) {
      yeuCauChiTietModel.nhanVienYeuCauId = nhanVien ? nhanVien.employeeId : this.emptyGuid;
      yeuCauChiTietModel.tenNhanVien = nhanVien.employeeName;
      yeuCauChiTietModel.phongBan = nhanVien.organizationName;
      yeuCauChiTietModel.viTriLamViec = nhanVien.positionName;
    }

    // M???c ????ch s??? d???ng
    let mucDichSD = this.yeuCauCapPhatForm.get('mucDichSuDungControl').value

    if (mucDichSD != null && mucDichSD != undefined) {
      yeuCauChiTietModel.mucDichSuDungId = mucDichSD ? mucDichSD.categoryId : this.emptyGuid;
      yeuCauChiTietModel.mucDichSuDung = mucDichSD.categoryName;
    }

    var datePipe = new DatePipe("en-US");
    // T??? ng??y
    let ngayBatDau = this.yeuCauCapPhatForm.get('ngayBatDauControl').value ? convertToUTCTime(this.yeuCauCapPhatForm.get('ngayBatDauControl').value) : null;
    yeuCauChiTietModel.ngayBatDau = ngayBatDau;
    if (this.yeuCauCapPhatForm.get('ngayBatDauControl').value != null) {

      yeuCauChiTietModel.ngayBatDauString = datePipe.transform(this.yeuCauCapPhatForm.get('ngayBatDauControl').value, 'dd/MM/yyyy');
    }

    // ?????n ng??y
    let ngayKetThuc = this.yeuCauCapPhatForm.get('ngayKetThucControl').value ? convertToUTCTime(this.yeuCauCapPhatForm.get('ngayKetThucControl').value) : null;
    yeuCauChiTietModel.ngayKetThuc = ngayKetThuc;
    if (this.yeuCauCapPhatForm.get('ngayKetThucControl').value != null) {

      yeuCauChiTietModel.ngayKetThucString = datePipe.transform(this.yeuCauCapPhatForm.get('ngayKetThucControl').value, 'dd/MM/yyyy');
    }

    // So luong
    yeuCauChiTietModel.soLuong = this.soLuongControl.value;

    // M?? t???
    yeuCauChiTietModel.moTa = this.moTaControl.value == null ? "" : this.moTaControl.value;

    // L?? do
    yeuCauChiTietModel.lyDo = this.lyDoControl.value == null ? "" : this.lyDoControl.value;

    yeuCauChiTietModel.createdById = this.auth.UserId;
    yeuCauChiTietModel.createdDate = convertToUTCTime(new Date());
    yeuCauChiTietModel.updatedById = null;
    yeuCauChiTietModel.updatedDate = null;
    return yeuCauChiTietModel;
  }

  cancel() {
    this.router.navigate(['/asset/danh-sach-yeu-cau-cap-phat']);
  }

  async createYeuCauTemp() {

    if (!this.yeuCauCapPhatForm.valid) {
      Object.keys(this.yeuCauCapPhatForm.controls).forEach(key => {
        if (!this.yeuCauCapPhatForm.controls[key].valid) {
          this.yeuCauCapPhatForm.controls[key].markAsTouched();
        }
      });

      this.emitStatusChangeForm = this.yeuCauCapPhatForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });

      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }
    }
    else {
      this.loading = true;
      let yeuCauCPModel = this.mapFormToYCCapPhatModelTemp();
      yeuCauCPModel.yeuCauCapPhatTaiSanChiTietId = 0;
      yeuCauCPModel.yeuCauCapPhatTaiSanId = this.yeuCauCapPhatTaiSanId;
      let result: any = await this.assetService.createOrUpdateChiTietYeuCauCapPhat(yeuCauCPModel, this.auth.UserId);
      this.loading = false;
      if (result.statusCode === 200) {
        this.refreshForm();
        this.listTaiSanYeuCauTemp = result.listTaiSanYeuCau;

      }
      else
        this.showToast('error', 'Th??ng b??o', result.messageCode);
    }
  }

  async updateYeuCauTemp() {
    if (!this.yeuCauCapPhatForm.valid) {
      Object.keys(this.yeuCauCapPhatForm.controls).forEach(key => {
        if (!this.yeuCauCapPhatForm.controls[key].valid) {
          this.yeuCauCapPhatForm.controls[key].markAsTouched();
        }
      });

      this.emitStatusChangeForm = this.yeuCauCapPhatForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });

      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }
    }
    else {
      this.loading = true;
      let yeuCauCPModel = this.mapFormToYCCapPhatModelTemp();
      yeuCauCPModel.yeuCauCapPhatTaiSanChiTietId = this.yeuCauCapPhatTaiSanChiTietId;
      yeuCauCPModel.yeuCauCapPhatTaiSanId = this.yeuCauCapPhatTaiSanId;
      let result: any = await this.assetService.createOrUpdateChiTietYeuCauCapPhat(yeuCauCPModel, this.auth.UserId);
      this.loading = false;
      if (result.statusCode === 200) {
        this.refreshForm();
        this.listTaiSanYeuCauTemp = result.listTaiSanYeuCau;
      }
      else
        this.showToast('error', 'Th??ng b??o', result.messageCode);
    }
  }

  delAssetTemp(rowData: any) {
    if (!rowData.isNewLine) {
      this.confirmationService.confirm({
        message: `B???n c?? ch???c ch???n x??a d??ng n??y?`,
        accept: async () => {
          this.loading = true;
          let result: any = await this.assetService.deleteChiTietYeuCauCapPhat(rowData.yeuCauCapPhatTaiSanChiTietId);
          this.loading = false;
          if (result.statusCode === 200) {
            this.listTaiSanYeuCauTemp = this.listTaiSanYeuCauTemp.filter(x => x != rowData);
            this.refreshForm();
            this.showToast('success', 'Th??ng b??o', 'X??a d??? li???u th??nh c??ng');
          }
          else
            this.showToast('error', 'Th??ng b??o', result.messageCode);
        }
      });
    }
    else {
      this.listTaiSanYeuCauTemp = this.listTaiSanYeuCauTemp.filter(e => e != rowData);
    }
  }

  /*Hi???n th??? l???i th??ng tin t??i s???n*/
  reShowAsset(rowData: any) {
    this.isUpdate = true;

    this.yeuCauCapPhatTaiSanChiTietId = rowData.yeuCauCapPhatTaiSanChiTietId;

    // Lo???i t??i s???n ph??n b???
    let phanLoai = this.listLoaiTS.find(c => c.categoryId == rowData.loaiTaiSanId);
    this.yeuCauCapPhatForm.controls['loaiTaiSanControl'].setValue(phanLoai);

    // S??? l?????ng
    this.yeuCauCapPhatForm.controls['soLuongControl'].setValue(rowData.soLuong);

    // M?? t???
    this.yeuCauCapPhatForm.controls['moTaControl'].setValue(rowData.moTa);

    // M?? nh??n vi??n
    let nhanVien = this.listEmployee.find(c => c.employeeId == rowData.nhanVienYeuCauId);
    this.yeuCauCapPhatForm.controls['nhanVienControl'].setValue(nhanVien);

    this.employeeModel = nhanVien;

    // M???c ????ch s??? d???ng
    let mucDich = this.listMucDichSuDung.find(c => c.categoryId == rowData.mucDichSuDungId);
    this.yeuCauCapPhatForm.controls['mucDichSuDungControl'].setValue(mucDich);

    // S??? d???ng t??? ng??y
    this.yeuCauCapPhatForm.controls['ngayBatDauControl'].setValue(new Date(rowData.ngayBatDau));

    if (rowData.ngayKetThuc) {
      this.yeuCauCapPhatForm.controls['ngayKetThucControl'].setValue(new Date(rowData.ngayKetThuc));
    }

    this.yeuCauCapPhatForm.controls['lyDoControl'].setValue(rowData.lyDo);

    this.yeuCauCapPhatForm.controls['loaiTaiSanControl'].updateValueAndValidity();
    this.yeuCauCapPhatForm.controls['mucDichSuDungControl'].updateValueAndValidity();
    this.yeuCauCapPhatForm.controls['nhanVienControl'].updateValueAndValidity();
    this.yeuCauCapPhatForm.controls['mucDichSuDungControl'].updateValueAndValidity();
  }

  thayDoiNhanVien(event: any) {
    let nhanVien = this.listEmployee.find(x => x.employeeId == event.value.employeeId);
    this.employeeModel = nhanVien;
  }

  refreshForm() {
    this.yeuCauCapPhatForm.reset();
    this.soLuongControl.setValue(0);
    this.employeeModel = new EmployeeModel();
    this.isUpdate = false;
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  //#region  GHI CH??

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

  /*Event Khi click x??a to??n b??? file*/
  clearAllFile() {
    this.uploadedFiles = [];
  }

  /*Event khi x??a 1 file ???? l??u tr??n server*/
  deleteFile(file: any) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a t??i li???u?',
      accept: () => {
        this.employeeService.deleteFile(file.fileInFolderId).subscribe(res => {
          let result: any = res;
          if (result.statusCode == 200) {
            let index = this.arrayDocumentModel.indexOf(file);
            this.arrayDocumentModel.splice(index, 1);
            this.showToast('success', 'Th??ng b??o', 'X??a file th??nh c??ng');
          } else {
            this.showToast('success', 'Th??ng b??o', result.message);
          }
        })
      }
    });
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
      fileUpload.FileInFolder.objectNumber = this.yeuCauCapPhatTaiSanId;
      fileUpload.FileInFolder.objectType = 'YCCAPPHAT';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });


    this.assetService.uploadFile("YCCAPPHAT", listFileUploadModel, this.yeuCauCapPhatTaiSanId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        this.uploadedFiles = [];

        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }

        this.arrayDocumentModel = result.listFileInFolder;

        this.showToast('success', 'Th??ng b??o', "Th??m file th??nh c??ng");
      } else {
        this.showToast('error', 'Th??ng b??o', result.message);
      }
    });
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  // t???o y??u c???u
  async taoYeuCauCapPhat() {
    if (this.listTaiSanYeuCauTemp.length > 0) {
      {
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
          fileUpload.FileInFolder.objectType = 'YCCAPPHAT';
          fileUpload.FileSave = item;
          listFileUploadModel.push(fileUpload);
        });

        this.loading = true;
        this.awaitResult = true;

        this.listTaiSanYeuCauTemp.forEach(chitiet => {
          chitiet.ngayBatDau = new Date(chitiet.ngayBatDau);
          if (chitiet.ngayKetThuc != null)
            chitiet.ngayKetThuc = new Date(chitiet.ngayKetThuc);
          chitiet.createdDate = new Date(chitiet.createdDate);
        });

        this.assetService.createOrYeuCauCapPhat(this.yeuCauCapPhat, this.listTaiSanYeuCauTemp, 'YCCAPPHAT', listFileUploadModel, this.auth.UserId).subscribe(async response => {

          this.loading = false;
          let result = <any>response;

          if (result.statusCode == 200) {
            this.showToast('success', 'Th??ng b??o', "C???p nh???p y??u c???u c???p ph??t th??nh c??ng.");
            this.resetFieldValue();
            await this.getMasterData();
            this.awaitResult = false;

            return true;
          }
          else {
            this.awaitResult = false;
            this.clearToast();
            this.showToast('error', 'Th??ng b??o', "???? x??? ra l???i trong qu?? tr??nh l??u th??ng tin.");
            return false;
          }
        });
      }
    }
    else {
      this.showToast('error', 'Th??ng b??o', 'Danh s??ch t??i s???n y??u c???u kh??ng ???????c tr???ng.');
      return false;
    }
  }

  //#region QUY TR??NH PH?? DUY???T

  async getDuLieuQuyTrinh() {
    this.quyTrinhService.getDuLieuQuyTrinh(this.emptyGuid, 20, this.yeuCauCapPhatTaiSanId).subscribe(res => {
      let result: any = res;
      if (result.statusCode == 200) {

        this.listFormatStatusSupport = result.listDuLieuQuyTrinh;
      }
      else {
        this.showToast('error', 'Th??ng b??o:', result.message);
      }
    });
  }

  // Chuy???n y??u c???u v??? tr???ng th??i m???i sau khi b??? t??? ch???i ph?? duy???t
  async datVeMoi() {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n s??? d???ng l???i Y??u c???u c???p ph??t n??y?',
      accept: async () => {

        let res: any = await this.assetService.datVeMoiYeuCauCapPhatTS(this.yeuCauCapPhatTaiSanId);
        if (res.statusCode === 200) {
          this.showToast('success', 'Th??ng b??o:', "C???p nh???p y??u c???u c???p ph??t t??i s???n th??nh c??ng.");
          this.getMasterData();
        } else {
          this.showToast('success', 'Th??ng b??o:', res.messageCode);
        }
      }
    });
  }

  // G???i ph?? duy???t
  async guiPheDuyet() {

    this.loading = true;
    this.quyTrinhService.guiPheDuyet(this.emptyGuid, 20, this.yeuCauCapPhatTaiSanId).subscribe(async res => {
      let result: any = res;
      if (result.statusCode == 200) {
        this.showToast('success', 'Th??ng b??o:', "G???i ph?? duy???t th??nh c??ng.");
        await this.getMasterData();
        this.ref.detectChanges();
      }
      else {
        this.loading = false;
        this.showToast('error', 'Th??ng b??o:', result.message);
      }
    });
  }

  // Ph?? duy???t
  async pheDuyet() {
    var isError = false;
    let tongSLPD = 0;

    let currentBuoc = this.listFormatStatusSupport.findIndex(x => x.isCurrent);
    if (this.listFormatStatusSupport.length - 1 == currentBuoc) {
      for (let i = 0; i < this.listTaiSanYeuCauTemp.length; i++) {
        let soLuongPD = this.listTaiSanYeuCauTemp[i].soLuongPheDuyet;
        let soLuong = this.listTaiSanYeuCauTemp[i].soLuong;

        tongSLPD += soLuongPD;
        if (soLuongPD > soLuong || soLuongPD <= 0 || soLuongPD == null) {
          isError = true;
        }
      }
      if (tongSLPD == 0) {
        this.showToast('error', 'Th??ng b??o:', 'T???ng s??? l?????ng t??i s???n ph?? duy???t ph???i l???n h??n 0.');
        return;
      }

      if (isError == true) {
        this.showToast('error', 'Th??ng b??o:', 'S??? l?????ng ph?? duy???t l???n h??n s??? l?????ng y??u c???u.');
        return;
      }
    }

    this.confirmationService.confirm({
      message: 'B???n ch???c ch???c mu???n ph?? duy???t y??u c???u c???p ph??t n??y?',
      accept: async () => {
        await this.taoYeuCauCapPhat();
        this.loading = true;

        this.quyTrinhService.pheDuyet(this.emptyGuid, 20, '', this.yeuCauCapPhatTaiSanId).subscribe(res => {
          let result: any = res;

          if (result.statusCode == 200) {
            this.getMasterData();
            this.ref.detectChanges();
          }
          else {
            this.loading = false;
            this.showToast('error', 'Th??ng b??o:', result.messageCode);
          }
        });
      }
    });
  }

  openDialogReject() {
    this.showLyDoTuChoi = true;
    this.tuChoiForm.reset();
  }

  // T??? ch???i ph?? duy???t
  async tuChoi() {

    if (!this.tuChoiForm.valid) {
      Object.keys(this.tuChoiForm.controls).forEach(key => {
        if (!this.tuChoiForm.controls[key].valid) {
          this.tuChoiForm.controls[key].markAsTouched();
        }
      });

      this.emitStatusChangeForm = this.tuChoiForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });

      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }
    }
    else {
      this.loading = true;
      this.quyTrinhService.tuChoi(this.emptyGuid, 20, this.lyDoTuChoiControl.value, this.yeuCauCapPhatTaiSanId).subscribe(res => {
        let result: any = res;

        if (result.statusCode == 200) {
          this.showToast('success', 'Th??ng b??o:', result.messageCode);

          this.getMasterData();
        }
        else {
          this.loading = false;
          this.showToast('error', 'Th??ng b??o:', result.messageCode);
        }
      });
      this.showLyDoTuChoi = false;
    }
  }

  huyYeuCacXacNhan() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n h???y y??u c???u x??c nh???n y??u c???u n??y kh??ng?',
      accept: async () => {
        // await this.createOrUpdate(false);

        this.loading = true;
        this.quyTrinhService.huyYeuCauPheDuyet(this.emptyGuid, 20, this.yeuCauCapPhatTaiSanId).subscribe(res => {
          let result: any = res;

          if (result.statusCode != 200) {
            this.loading = false;
            this.showToast('success', 'Th??ng b??o:', result.messageCode);
            return;
          }

          this.showToast('error', 'Th??ng b??o:', result.messageCode);
          this.getMasterData();
        });
      }
    });
  }

  kiemTraSoLuong(rowdata: any) {
    let soLuongPD = 0;
    soLuongPD = rowdata.soLuongPheDuyet ? parseFloat(rowdata.soLuongPheDuyet.replace(/,/g, '')) : null;

    if (soLuongPD > rowdata.soLuong || soLuongPD <= 0 || soLuongPD == null) {
      rowdata.error = true;
      this.showToast('error', 'Th??ng b??o:', 'S??? l?????ng th???c xu???t c???n l???n h??n 0 v?? nh??? h??n ho???c b???ng s??? l?????ng c???n xu???t');
      return;
    }
    else {
      rowdata.error = false;
    }
  }

  closeDialog() {
    this.showLyDoTuChoi = false;
  }

  //#endregion


  //#region FUNCTION EXCEL
  importAsset() {
    this.displayChooseFileImportDialog = true;
  }

  importExcel() {
    if (this.fileName == "") {
      this.showToast('error', 'Th??ng b??o:', "Ch??a ch???n file c???n nh???p");
      return;
    }
    this.loading = true
    const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(targetFiles.files[0]);

    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });
      let code = 'YeuCauTaiSan';
      if (!workbook.Sheets[code]) {
        this.showToast('error', 'Th??ng b??o:', "File kh??ng h???p l???");
        return;
      }

      //l???y data t??? file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
      /* save data */
      let listAssetRawData: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
      /* remove header */
      listAssetRawData = listAssetRawData.filter((e, index) => index != 0);
      /* n???u kh??ng nh???p  tr?????ng required th?? lo???i b??? */
      listAssetRawData = listAssetRawData.filter(e => (e[0] && e[1]));

      /* chuy???n t??? raw data sang model */
      let listAssetImport: Array<importAssetByExcelModel> = [];
      listAssetRawData?.forEach(_rawData => {
        /*
        Lo???i t??i s???n
        S??? l?????ng
        M?? t???
        m?? Nh??n vi??n
        T??n nh??n vi??n
        M?? m???c ????ch s??? d???ng
        S??? d???ng t??? ng??y
        S??? d???ng ?????n ng??y
        L?? do
       */
        let asset = new importAssetByExcelModel();
        asset.maLoaiTaiSan = _rawData[0] ? _rawData[0].toString().trim() : '';
        asset.soLuong = _rawData[1] ? _rawData[1].toString().trim() : '';
        asset.moTa = _rawData[2] ? _rawData[2].toString().trim() : '';
        asset.employeeCode = _rawData[3] ? _rawData[3].toString().trim() : '';
        asset.maMucDichSuDung = _rawData[4] ? _rawData[4].toString().trim() : '';

        let ngayBD = new Date(_rawData[5].replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
        asset.ngayBatDau = convertToUTCTime(ngayBD);

        if (_rawData[6] != undefined) {
          let ngayKT = new Date(_rawData[6].replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
          asset.ngayKetThuc = convertToUTCTime(ngayKT);
        }

        asset.lyDo = _rawData[7] ? _rawData[7].toString().trim() : '';
        listAssetImport = [...listAssetImport, asset];
      });
      /* t???t dialog import file, b???t dialog chi ti???t t??i s???n import */
      this.displayChooseFileImportDialog = false;
      this.loading = false
      this.openDetailImportDialog(listAssetImport);
    }
  }

  openDetailImportDialog(listAssetImport) {
    let ref = this.dialogService.open(YeuCauCapPhatImportDetailComponent, {
      data: {
        listAssetImport: listAssetImport
      },
      header: 'Nh???p excel danh s??ch y??u c???u t??i s???n',
      width: '85%',
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px",
      }
    });
    ref.onClose.subscribe((result: any) => {
      if (result?.status) {
        result.listAsset.forEach(item => {

          let taiSanYCTemp = new YeuCauCapPhatChiTietModel();

          // lo???i T??i s???n
          let loaiTS = this.listLoaiTS.find(x => x.categoryCode == item.maLoaiTaiSan);
          if (loaiTS != null && loaiTS != undefined) {
            taiSanYCTemp.loaiTaiSanId = loaiTS ? loaiTS.categoryId : '';
            taiSanYCTemp.loaiTaiSan = loaiTS.categoryName;
          }

          // Nh??n vi??n
          let nhanVien = this.listEmployee.find(x => x.employeeCode == item.employeeCode)
          if (nhanVien != null && nhanVien != undefined) {
            taiSanYCTemp.nhanVienYeuCauId = nhanVien ? nhanVien.employeeId : this.emptyGuid;
            taiSanYCTemp.tenNhanVien = nhanVien.employeeName;
            taiSanYCTemp.phongBan = nhanVien.organizationName;
            taiSanYCTemp.viTriLamViec = nhanVien.positionName;
          }

          // M???c ????ch s??? d???ng
          let mucDichSD = this.listMucDichSuDung.find(x => x.categoryCode == item.maMucDichSuDung)

          if (mucDichSD != null && mucDichSD != undefined) {
            taiSanYCTemp.mucDichSuDungId = mucDichSD ? mucDichSD.categoryId : this.emptyGuid;
            taiSanYCTemp.mucDichSuDung = mucDichSD.categoryName;
          }

          var datePipe = new DatePipe("en-US");
          // T??? ng??y
          let ngayBatDau = item.ngayBatDau ? convertToUTCTime(item.ngayBatDau) : null;
          taiSanYCTemp.ngayBatDau = ngayBatDau;

          if (ngayBatDau != null) {
            taiSanYCTemp.ngayBatDauString = datePipe.transform(ngayBatDau, 'dd/MM/yyyy');
          }

          // ?????n ng??y
          let ngayKetThuc = item.ngayKetThuc ? convertToUTCTime(item.ngayKetThuc) : null;
          taiSanYCTemp.ngayKetThuc = ngayKetThuc;

          if (ngayKetThuc != null) {
            taiSanYCTemp.ngayKetThucString = datePipe.transform(ngayKetThuc, 'dd/MM/yyyy');
          }

          // So luong
          taiSanYCTemp.soLuong = Number(item.soLuong);

          // M?? t???
          taiSanYCTemp.moTa = item.moTa;

          // L?? do
          taiSanYCTemp.lyDo = item.lyDo;

          taiSanYCTemp.createdById = this.auth.UserId;
          taiSanYCTemp.createdDate = convertToUTCTime(new Date());
          taiSanYCTemp.updatedById = null;
          taiSanYCTemp.updatedDate = null;

          this.listTaiSanYeuCauTemp.push(taiSanYCTemp)
        });
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

  onClickImportBtn(event: any) {
    /* clear value c???a file input */
    event.target.value = ''
  }

  async downloadTemplateExcel() {
    let result: any = await this.assetService.downloadTemplateAsset(2);

    if (result.excelFile != null && result.statusCode === 200) {
      const binaryString = window.atob(result.excelFile);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);
      for (let idx = 0; idx < binaryLen; idx++) {
        const ascii = binaryString.charCodeAt(idx);
        bytes[idx] = ascii;
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const fileName = result.nameFile + ".xlsx";
      link.download = fileName;
      link.click();
    } else {
      this.displayChooseFileImportDialog = false;

      this.showToast('error', 'Th??ng b??o:', 'Download file th???t b???i');
    }
  }

  chooseFile(event: any) {
    this.fileName = event.target?.files[0]?.name;
    this.importFileExcel = event.target;
  }

  //#endregion

  //#region PH??N B??? T??I S???N
  showQRCode() {
    this.displayQRCode = true;
    this.qrCode = this.yeuCauCapPhatChiTietModel.maTaiSan;
  }

  closeQRCode() {
    this.displayQRCode = false;
  }
  openAddAssetDialog() {
    this.taoNhanhTSForm.reset();
    this.displayCreateAsset = true;
  }

  closeTaoTS() {
    this.displayCreateAsset = false;
  }

  taoNhanhTS() {
    if (!this.taoNhanhTSForm.valid) {
      Object.keys(this.taoNhanhTSForm.controls).forEach(key => {
        if (!this.taoNhanhTSForm.controls[key].valid) {
          this.taoNhanhTSForm.controls[key].markAsTouched();
        }
      });

      this.emitStatusChangeForm = this.taoNhanhTSForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });

      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }
    }
    else {
      this.loading = true;
      this.awaitResult = true;
      let donVi = this.taoNhanhTSForm.get('donViControl').value;

      let taiSanModel = new TaiSanModel();
      taiSanModel.maTaiSan = this.maTaiSanControl.value.trim()
      taiSanModel.tenTaiSan = this.tenTaiSanControl.value.trim()
      // ????n v???
      taiSanModel.donViTinhId = donVi ? donVi.categoryId : this.emptyGuid
      taiSanModel.soLuong = 1,
        // Ph??n lo???i t??i s???n
        taiSanModel.phanLoaiTaiSanId = this.yeuCauCapPhatChiTietModel.loaiTaiSanId

      this.assetService.createOrUpdateAsset(taiSanModel, this.auth.UserId, true).subscribe(response => {
        this.loading = false;
        this.awaitResult = false;
        let result = <any>response;
        if (result.statusCode == 200) {
          this.displayCreateAsset = false;
          this.clearToast();
          this.showToast('success', 'Th??ng b??o', 'T???o nhanh t??i s???n th??nh c??ng.');
          // Th??m v??o danh s??ch s???n ph???m ph??n b???


          this.listTaiSanChuaPhanBo = result.listTaiSanChuaPhanBo;
          this.listTaiSanChuaPhanBoDefault = result.listTaiSanChuaPhanBo;

          this.ref.detectChanges();
        }
        else {
          this.clearToast();
          this.showToast('error', 'Th??ng b??o', result.message);
        }
      });
    }
  }

  capPhatTaiSanOnRow(rowData: any, isParent: boolean) {

    this.yeuCauCapPhatChiTietModel = this.listTaiSanYeuCauTemp.find(x => x.yeuCauCapPhatTaiSanChiTietId == rowData.yeuCauCapPhatTaiSanChiTietId);
    this.yeuCauCapPhatChiTietModel.maTaiSan = '';
    // S??? d???ng t??? ng??y
    this.taoPhanBoForm.controls['ngayBatDauPhanBoControl'].setValue(new Date(rowData.ngayBatDau));

    if (rowData.ngayKetThuc) {
      this.taoPhanBoForm.controls['ngayKetThucPhanBoControl'].setValue(new Date(rowData.ngayKetThuc));
    }

    this.isAddAsset = isParent;

    this.ref.detectChanges();
  }

  capNhapPhanBo() {

    if (this.taiSanPhanBoControl.value != null) {
      let taisan = this.listTaiSanChuaPhanBoDefault.find(x => x.taiSanId == this.taiSanPhanBoControl.value.taiSanId)

      let indexTSEdit = this.listTaiSanYeuCauTemp.findIndex(x => x.isUpdate == true)
      if (indexTSEdit != -1) {
        this.listTaiSanYeuCauTemp[indexTSEdit].taiSanId = taisan.taiSanId;
        this.listTaiSanYeuCauTemp[indexTSEdit].maTaiSan = taisan.maTaiSan;
        this.listTaiSanYeuCauTemp[indexTSEdit].isUpdate = false;
      }
      else {
        let taiSanPB = new YeuCauCapPhatChiTietModel();
        taiSanPB.taiSanId = taisan.taiSanId;
        taiSanPB.capPhatTaiSanId = 0;
        taiSanPB.maTaiSan = taisan.maTaiSan;
        taiSanPB.isUpdate = false;
        taiSanPB.loaiTaiSanId = taisan.phanLoaiTaiSanId;
        taiSanPB.mucDichSuDungId = this.yeuCauCapPhatChiTietModel.mucDichSuDungId;
        taiSanPB.nhanVienYeuCauId = this.yeuCauCapPhatChiTietModel.nhanVienYeuCauId;
        taiSanPB.lyDo = this.yeuCauCapPhatChiTietModel.lyDo;
        taiSanPB.ngayBatDau = this.yeuCauCapPhatChiTietModel.ngayBatDau;
        taiSanPB.ngayKetThuc = this.yeuCauCapPhatChiTietModel.ngayKetThuc;
        taiSanPB.createdById = this.auth.UserId;
        taiSanPB.parentPartId = this.yeuCauCapPhatChiTietModel.yeuCauCapPhatTaiSanChiTietId;
        taiSanPB.yeuCauCapPhatTaiSanChiTietId = this.yeuCauCapPhatChiTietModel.yeuCauCapPhatTaiSanChiTietId;
        this.listTaiSanYeuCauTemp.push(taiSanPB)

        // Remove t??i s???n ???? ch???n ra kh???i danh s??ch t??i s???n ph??n b???
        this.listTaiSanChuaPhanBo = this.listTaiSanChuaPhanBo.filter(x => x.taiSanId != taisan.taiSanId);
      }
      this.rebuildYeuCauCPTree();
      this.taoPhanBoForm.reset();
      this.yeuCauCapPhatChiTietModel = new YeuCauCapPhatChiTietModel();
    }
  }

  suaTaiSanOnRow(rowData: any, isParent: boolean) {
    let taisan = this.listTaiSanChuaPhanBoDefault.find(x => x.taiSanId == rowData.taiSanId)
    this.listTaiSanChuaPhanBo.push(taisan);
    this.taiSanPhanBoControl.setValue(taisan);

    this.yeuCauCapPhatChiTietModel = this.listTaiSanYeuCauTemp.find(x => x.yeuCauCapPhatTaiSanChiTietId == rowData.parentPartId);

    // S??? d???ng t??? ng??y
    this.taoPhanBoForm.controls['ngayBatDauPhanBoControl'].setValue(new Date(rowData.ngayBatDau));

    if (rowData.ngayKetThuc) {
      this.taoPhanBoForm.controls['ngayKetThucPhanBoControl'].setValue(new Date(rowData.ngayKetThuc));
    }
    rowData.isUpdate = true;

    this.ref.detectChanges();
  }

  thayDoiTaiSanPhanBo(event: any) {
    this.yeuCauCapPhatChiTietModel.maTaiSan = event.value.maTaiSan
    this.yeuCauCapPhatChiTietModel.taiSanId = event.value.taiSanId
  }
  // ph??n b??? t??i s???n sau khi ho??n th??nh quy tr??nh ph?? duy???t
  async phanBoYeuCauCP() {
    if (this.listTaiSanYeuCauTemp.length > 0) {
      this.loading = true;
      this.awaitResult = true;
      let yeuCauCapPhat = this.listTaiSanYeuCauTemp.filter(x => x.capPhatTaiSanId === 0)
      this.assetService.taoPhanBoTaiSan(yeuCauCapPhat, this.auth.UserId).subscribe(async response => {
        this.loading = false;
        let result = <any>response;
        if (result.statusCode == 200) {
          let lstParent = this.listTaiSanYeuCauTemp.filter(a => a.yeuCauCapPhatTaiSanId !== 0);
          let totalChild = 0;
          let totalPheDuyet = 0;
          lstParent?.forEach(chitiet => {
            totalChild += chitiet.totalChild;
            totalPheDuyet += chitiet.soLuongPheDuyet;
          });
          // S??? l?????ng t??i s???n c???p ph??t = s??? l?????ng duy???t => Ho??n th??nh
          if (totalChild == totalPheDuyet) {
            let res: any = await this.assetService.capNhapTrangThaiYeuCauCapPhat(this.yeuCauCapPhatTaiSanId, 5);
            if (res.statusCode === 200) {
              this.showToast('success', 'Th??ng b??o', "Ho??n th??nh phi???u c???p ph??t t??i s???n.");
              this.getMasterData();
            }
          }
          else {
            this.showToast('success', 'Th??ng b??o', "C???p nh???p phi???u c???p ph??t th??nh c??ng.");
          }
          this.awaitResult = false;
        }
        else {
          let lstTaiSanId = result.listAssetId;
          let mes = 'T??i s???n ???? ???????c ph??n b???: ';
          lstTaiSanId.forEach(id => {
            var taisan = this.listTaiSanChuaPhanBo.filter(x => x.taiSanId == id)[0];
            mes += + ' ' + taisan.maTaiSan + ' - ' + taisan.tenTaiSan;
          });
          this.clearToast();
          this.showToast('error', 'Th??ng b??o', mes);
        }
      });
    }
    else {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', "Vui l??ng ch???n t??i s???n ????? c???p ph??t!");
    }

  }

  rebuildYeuCauCPTree() {

    this.dataTree = [];
    let newDataTree = [];
    this.listTaiSanYeuCauTemp.forEach((item: YeuCauCapPhatChiTietModel) => {
      item.totalChild = 0;
      let parent_item: TreeNode = {
        data: {},
        children: []
      };

      //L???y c??c item cha
      if (item.parentPartId == null) {
        parent_item.data = item;

        //Th??m v??o dataTree
        newDataTree.push(parent_item);
        let count = 0;
        let listItemLv1 = this.listTaiSanYeuCauTemp.filter(x => x.parentPartId == item.yeuCauCapPhatTaiSanChiTietId);
        listItemLv1.forEach((item_lv1: YeuCauCapPhatChiTietModel) => {
          let _item_lv1: TreeNode = {
            data: {},
            children: []
          };
          count++;
          _item_lv1.data = item_lv1;

          //Th??m v??o dataTree
          let find_item_lv0 = newDataTree.find(x => x.data.yeuCauCapPhatTaiSanChiTietId == item_lv1.parentPartId);
          find_item_lv0.children.push(_item_lv1);
        });

        parent_item.data.totalChild = count;
      }
    });
    this.dataTree = [...newDataTree];

  }

  xemChiTietTaiSan(rowData: any) {

    let url = this.router.serializeUrl(this.router.createUrlTree(['/asset/detail', { assetId: this.encrDecrService.set(rowData.taiSanId) }]));
    window.open(url, '_blank');
  }
  //#endregion
  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
