
import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { NoteModel } from '../../../shared/models/note.model';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { NoteService } from '../../../shared/services/note.service';
import { EmployeeService } from '../../services/employee.service';
import { Vacancies } from '../../models/recruitment-vacancies.model';
import { Table } from 'primeng/table';
import { EmployeeModel, CreateEmployeeModel } from '../../models/employee.model';
import { ContactModel } from '../../../../app/shared/models/contact.model';
import { UserModel } from '../../../../app/shared/models/user.model';
import { saveAs } from "file-saver";
import { Workbook } from 'exceljs';
import * as XLSX from 'xlsx';
import { CandidateImportDetailComponent } from '../candidate-import-detail/candidate-import-detail.component';
import { GetPermission } from '../../../shared/permission/get-permission';
import { TemplateVacanciesEmailComponent } from './../../../shared/components/template-vacancies-email/template-vacancies-email.component';

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
}

class EmployeeCandidateModel {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeCodeName: string;
  phone: string;
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

class CandidateModel {
  candidateId: string;
  vacanciesId: string;
  statusId: string;
  recruitmentCampaignId: string;
  fullName: string;
  dateOfBirth: Date;
  sex: number;
  address: string;
  phone: string;
  email: string;
  recruitmentChannel: string;
  applicationDate: Date;
}
interface FileNameExists {
  oldFileName: string;
  newFileName: string
}

class InterviewSheduleModel {
  interviewScheduleId: string;
  vacanciesId: string;
  candidateId: string;
  fullName: string;
  interviewTitle: string;
  interviewDate: Date;
  address: string;
  email: string;
  interviewScheduleType: number;
  listEmployeeId: Array<any> = [];
}

class SaleBiddingDetail {
  saleBiddingDetailId: string
  saleBiddingId: string;
  category: string;
  content: string;
  note: string;
  file: File[];
  listFile: Array<FileInFolder>;
  index: number;
}

class SaleBidding {
  saleBiddingId: string;
  saleBiddingName: string;
  saleBiddingCode: string;
  leadId: string;
  customerId: string;
  valueBid: number;
  startDate: Date;
  address: string;
  bidStartDate: Date;
  personInChargeId: string;
  effecTime: number;
  endDate: Date;
  typeContractId: string;
  formOfBid: string;
  currencyUnitId: string;
  ros: number;
  provisionalGrossProfit: number;
  typeContractName: string;
  slowDay: number;
  contactId: string;
  employeeId: string; // Nh??n vi??n b??n h??ng
  statusId: string;
  leadName: string;
  leadCode: string;
  updatedById: string;
}

class InforExportExcel {
  companyName: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  textTotalMoney: string
}

interface Employee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeCodeName: string;
  isManager: boolean;
  positionId: string;
  organizationId: string;
}

class emailPVModel {
  listCandidate: Array<candidateSenEmailPVModel> = []; // danh s??ch email ???ng vi??n
  vancaciesName: string; // V??? tr?? tuy???n d???ng
  personInChagerName: string = ''; // t??n ng?????i ph??? tr??ch
  personInChagerPhone: string = null; // S??T ng?????i ph??? tr??ch
  workplace: string;
  subject: string;
  sendContent: string;
}
class candidateSenEmailPVModel {
  email: string;
  fullName: string;
  interviewTime: Date;
  addressOrLink: string;
  interviewScheduleType: number;
  listInterviewerEmail: Array<string> = []; //danh s??ch email Ng?????i PV
}

class CategoryModel {
  categoryId: string;
  categoryName: string;
  constructor() { }
}

class importCustomerByExcelModel {
  //candidateId: string;
  candidateName: string;
  dateOfBirth: Date;
  phone: string;
  sex: number;
  chanelCode: string;
  email: string;
  address: string;
  applicationDate: Date;
}

class ColumnExcel {
  code: string;
  name: string;
  width: number;
}

@Component({
  selector: 'app-tuyen-dung-detail',
  templateUrl: './tuyen-dung-detail.component.html',
  styleUrls: ['./tuyen-dung-detail.component.css']
})
export class TuyenDungDetailComponent implements OnInit {

  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;
  loading: boolean = false;
  today: Date = new Date();
  statusCode: string = null;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  currentEmployeeCodeName = localStorage.getItem('EmployeeCodeName');
  auth = JSON.parse(localStorage.getItem('auth'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  viTriTuyenDungId: string = '';

  /*Valid Form*/
  isInvalidForm: boolean = false;
  isFromTo: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;

  selectedChienDich: any = null;
  // Danh sach
  actions: MenuItem[] = [];
  colsCandidate: any[];
  selectedInterviewColumns: any[];
  listCandidate: Array<any> = [];
  selectedCandidate: Array<any> = [];
  listPhuTrachViTriTuyenDung: Array<EmployeeCandidateModel> = [];
  listEmployeeInterview: Array<EmployeeCandidateModel> = [];
  listChienDich: Array<any> = [];
  listKinhNghiem: Array<any> = [];
  listMucUuTien: Array<any> = [
    {
      name: 'Cao',
      value: 1,
    },
    {
      name: 'Trung b??nh',
      value: 2,
    },
    {
      name: 'Th???p',
      value: 3,
    },
  ];
  listLoaiTienTe: Array<any> = [
    {
      name: 'VND',
      value: 'VND',
    },
    {
      name: 'USD',
      value: 'USD',
    },
  ];
  listLoaiCongViec: Array<any> = []
  listKieuLuong: Array<any> = [
    {
      name: 'Trong kho???ng',
      value: 1,
    },
    {
      name: 'Th???a thu???n',
      value: 2,
    },
  ]
  listChanel: Array<CategoryModel> = []
  // T??i li???u li??n quan
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  colsFile: any[];

  listCandidatePV: Array<InterviewSheduleModel> = [];
  // FORM
  thongTinViTriTuyenDungFormGroup: FormGroup;
  tenViTriTuyenDungFormControl: FormControl;
  soLuongFormControl: FormControl;
  mucUuTienFormControl: FormControl;
  nguoiPhuTrachFormControl: FormControl;
  loaiCongViecFormControl: FormControl;
  noiLamViecFormControl: FormControl;
  kinhNghiemFormControl: FormControl;
  loaiTienTeFormControl: FormControl;
  kieuLuongFormControl: FormControl;
  tuFormControl: FormControl;
  denFormControl: FormControl;
  viTriTuyenDungFormControl: FormControl;
  yeuCauChuyenMonFormControl: FormControl;
  quyenLoiUngVienFormControl: FormControl;

  //Note
  listNoteDocumentModel: Array<NoteDocumentModel> = [];
  listUpdateNoteDocument: Array<NoteDocument> = [];
  noteHistory: Array<Note> = [];

  isAprovalQuote: boolean = false;
  noteId: string = null;
  noteContent: string = '';
  isEditNote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  uploadedNoteFiles: any[] = [];
  /*End : Note*/
  recruitmentCampaignId: string = '00000000-0000-0000-0000-000000000000';
  vacanciesId: string = '00000000-0000-0000-0000-000000000000';

  viTriTuyenDung: Vacancies = new Vacancies();
  displayAddCandidate: boolean = false;
  isUpdate: boolean = false;
  candidateViewDialogId: string = '00000000-0000-0000-0000-000000000000';
  statusIdDialog: string = '00000000-0000-0000-0000-000000000000';
  displayAddInterviewSche: boolean = false;

  // Dialog Th??m ???ng vi??n
  createCandidateForm: FormGroup;
  vacanciesControl: FormControl;
  fullNameControl: FormControl;
  dateOfBirthControl: FormControl;
  phoneControl: FormControl;
  genderControl: FormControl;
  addressControl: FormControl;
  emailControl: FormControl;
  chanelControl: FormControl;
  applicationDateCandidateControl: FormControl;
  listDeleteNoteDocument: Array<NoteDocument> = [];
  // L???ch PV
  interViewForm: FormGroup;
  titleFormControl: FormControl;
  applicationDateControl: FormControl;
  addressOrLinkControl: FormControl;
  interViewNameControl: FormControl;

  emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';
  genderModel: string = "1";
  filterCandidateInterviewGlobal: string = '';
  filterCandidateGlobal: string = '';

  @ViewChild('myTable') myTableCandidate: Table;
  @ViewChild('myTable') myTableInterview: Table;
  listInterviewType: Array<any> = [
    {
      categoryName: 'Tr???c ti???p',
      categoryId: 1,
    },
    {
      categoryName: 'Online',
      categoryId: 2,
    },
  ];

  // Show dialog g???i email
  displayOfferEmail: boolean = false;
  displayRejectEmail: boolean = false;
  password: string = this.systemParameterList.find(x => x.systemKey == "DefaultUserPassword").systemValueString;

  userModel: UserModel = {
    UserId: null, Password: this.password, UserName: '', EmployeeId: '', EmployeeCode: '', Disabled: false, CreatedById: 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', CreatedDate: null, UpdatedById: null, UpdatedDate: null, Active: true
  };
  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i
  employeeModel = new CreateEmployeeModel()
  contactModel = new ContactModel()

  salebiddingModel: SaleBidding = new SaleBidding();
  month: string = '';
  year: number = (new Date()).getFullYear();
  inforExportExcel: InforExportExcel;
  listFileResult: Array<FileInFolder> = [];
  listFile: Array<FileInFolder> = [];
  headerPopupCandidate: string = 'Th??m nhanh ???ng vi??n';
  fileName: string = '';
  displayChooseFileImportDialog: boolean = false;
  importFileExcel: any = null;
  showDialog: boolean = false;

  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  actionEdit: boolean = true;

  actionAddUngVien: boolean = true;

  isManagerOfHR: boolean = false;

  isGD: boolean = false;
  isNguoiPhuTrach: boolean = false;

  // Import ???ng vi??n
  importCandidateForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private imageService: ImageUploadService,
    private confirmationService: ConfirmationService,
    private employeeService: EmployeeService,
    private def: ChangeDetectorRef,
    private getPermission: GetPermission,

  ) { }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    this.setControlDialog();

    let resource = "hrm/employee/chi-tiet-cong-viec-tuyen-dung/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      this.showMessage('warn', 'B???n kh??ng c?? quy???n truy c???p');
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;

      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
    }

    //Cho t???o ???ng vi??n
    let resource2 = "hrm/employee/tao-ung-vien/";
    let permission2: any = await this.getPermission.getPermission(resource2);
    if (permission2.status == false) {
      this.actionAddUngVien = false;
    }
    else {
      let listCurrentActionResource = permission2.listCurrentActionResource;

      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAddUngVien = false;
      }
    }

    this.route.params.subscribe(params => {
      this.recruitmentCampaignId = params['recruitmentCampaignId'];
      this.vacanciesId = params['vacanciesId'];
    });

    this.getMasterData();
  }

  setTable() {
    this.colsFile = [
      { field: 'fileFullName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', color: '#f44336' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', color: '#f44336' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'center', color: '#f44336' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', color: '#f44336' },
    ];

    this.colsCandidate = [
      { field: 'index', header: '#', width: '5%', textAlign: 'center', color: '#f44336', excelWidth: 23 },
      { field: 'fullName', header: 'T??n', width: '20%', textAlign: 'left', color: '#f44336', excelWidth: 30 },
      { field: 'applicationDate', header: 'Ng??y ???ng tuy???n', width: '10%', textAlign: 'center', color: '#f44336', excelWidth: 20 },
      { field: 'email', header: 'Email', width: '15%', textAlign: 'left', color: '#f44336', excelWidth: 30 },
      { field: 'phone', header: 'S??T', width: '15%', textAlign: 'left', color: '#f44336', excelWidth: 20 },
      { field: 'recruitmentChannelName', header: 'Ngu???n ????ng tuy???n', width: '15%', textAlign: 'left', color: '#f44336', excelWidth: 50 },
      { field: 'statusName', header: 'Tr???ng th??i', width: '10%', textAlign: 'center', color: '#f44336', excelWidth: 20 },
      { field: 'thaoTac', header: 'Thao t??c', width: '10%', textAlign: 'center', color: '#f44336', excelWidth: 10 },
    ];
    this.selectedInterviewColumns = [
      { field: 'index', header: 'STT', width: '10%', textAlign: 'center', color: '#f44336' },
      { field: 'fullName', header: 'T??n', width: '20%', textAlign: 'left', color: '#f44336' },
      { field: 'interViewName', header: 'Ng?????i ph???ng v???n', width: '18%', textAlign: 'left', color: '#f44336' },
      { field: 'interviewType', header: 'Loa??? ph???ng v???n', width: '12%', textAlign: 'center', color: '#f44336' },
      { field: 'address', header: '?????a ch???/ Link', width: '25%', textAlign: 'left', color: '#f44336' },
      { field: 'interviewDate', header: 'Ng??y ph???ng v???n', width: '15%', textAlign: 'left', color: '#f44336' },
    ];
  }

  setForm() {
    this.tenViTriTuyenDungFormControl = new FormControl(null, [Validators.required]);
    this.soLuongFormControl = new FormControl(null);
    this.mucUuTienFormControl = new FormControl(null, [Validators.required]);
    this.nguoiPhuTrachFormControl = new FormControl(null);
    this.loaiCongViecFormControl = new FormControl(null);
    this.noiLamViecFormControl = new FormControl(null);
    this.kinhNghiemFormControl = new FormControl(null);
    this.loaiTienTeFormControl = new FormControl(null);
    this.kieuLuongFormControl = new FormControl(null);
    this.tuFormControl = new FormControl(null);
    this.denFormControl = new FormControl(null);
    this.viTriTuyenDungFormControl = new FormControl(null);
    this.yeuCauChuyenMonFormControl = new FormControl(null);
    this.quyenLoiUngVienFormControl = new FormControl(null);

    this.thongTinViTriTuyenDungFormGroup = new FormGroup({
      tenViTriTuyenDungFormControl: this.tenViTriTuyenDungFormControl,
      soLuongFormControl: this.soLuongFormControl,
      mucUuTienFormControl: this.mucUuTienFormControl,
      nguoiPhuTrachFormControl: this.nguoiPhuTrachFormControl,
      loaiCongViecFormControl: this.loaiCongViecFormControl,
      noiLamViecFormControl: this.noiLamViecFormControl,
      kinhNghiemFormControl: this.kinhNghiemFormControl,
      loaiTienTeFormControl: this.loaiTienTeFormControl,
      kieuLuongFormControl: this.kieuLuongFormControl,
      tuFormControl: this.tuFormControl,
      denFormControl: this.denFormControl,
      viTriTuyenDungFormControl: this.viTriTuyenDungFormControl,
      yeuCauChuyenMonFormControl: this.yeuCauChuyenMonFormControl,
      quyenLoiUngVienFormControl: this.quyenLoiUngVienFormControl,
    });
  }
  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }
  setControlDialog() {
    this.vacanciesControl = new FormControl('');
    this.fullNameControl = new FormControl('', Validators.required);
    this.phoneControl = new FormControl('', [Validators.required, Validators.pattern(this.getPhonePattern())]);
    this.dateOfBirthControl = new FormControl(null, Validators.required);
    this.genderControl = new FormControl(1, [Validators.required]);
    this.addressControl = new FormControl('');
    this.emailControl = new FormControl(null);
    this.chanelControl = new FormControl(null);
    this.applicationDateCandidateControl = new FormControl(null);

    this.titleFormControl = new FormControl('', Validators.required);
    this.addressOrLinkControl = new FormControl('', Validators.required);
    this.applicationDateControl = new FormControl(null, Validators.required);
    this.interViewNameControl = new FormControl(null, Validators.required);

    this.createCandidateForm = new FormGroup({
      vacanciesControl: this.vacanciesControl,
      fullNameControl: this.fullNameControl,
      phoneControl: this.phoneControl,
      dateOfBirthControl: this.dateOfBirthControl,
      genderControl: this.genderControl,
      addressControl: this.addressControl,
      emailControl: this.emailControl,
      chanelControl: this.chanelControl,
      applicationDateCandidateControl: this.applicationDateCandidateControl
    });

    this.interViewForm = new FormGroup({
      interViewNameControl: this.interViewNameControl,
      titleFormControl: this.titleFormControl,
      addressOrLinkControl: this.addressOrLinkControl,
      applicationDateControl: this.applicationDateControl,
    });
  }

  async getMasterData() {
    this.loading = true;

    let result: any = await this.employeeService.getMasterDataVacancies(this.vacanciesId, this.recruitmentCampaignId);
    if (result.statusCode == 200) {

      this.listPhuTrachViTriTuyenDung = result.listEmployeePTTD;
      this.listChienDich = result.listEmployeeRecruit;
      this.listKinhNghiem = result.listKinhNghiem;
      this.listLoaiCongViec = result.listLoaiCV;
      this.noteHistory = result.listNote;
      this.listChanel = result.listChanel;
      this.listEmployeeInterview = result.listAllEmployee;
      this.viTriTuyenDung = result.viTriTuyenDung;

      this.isManagerOfHR = result.isManagerOfHR;
      this.isGD = result.isGD;
      this.isNguoiPhuTrach = result.isNguoiPhuTrach;

      let data = result.listCandidate
      this.listCandidate = data.filter(x => x.status != 7);
      this.setColorOfStatusCandidate();
      this.inforExportExcel = result.inforExportExcel;
      this.listFileResult = result.listFileResult;
      this.setDefaultValueForm();
      this.handleNoteContent();
      this.loading = false;
    }
    else
      this.loading = false;
  }

  setColorOfStatusCandidate() {
    this.listCandidate.forEach(item => {
      switch (item.statusCode) {
        case "UVMOI":
          item.backgroundColorForStatus = '#c4c3d0';
          break;
        case "UVHPV":
          item.backgroundColorForStatus = '#87cefa';
          break;
        case "UVDPV":
          item.backgroundColorForStatus = '#29ab87';
          break;
        case "UVGOF":
          item.backgroundColorForStatus = '#4cbb17';
          break;
        case "UVTC":
          item.backgroundColorForStatus = '#ee6363';
          break;
        case "UVKD":
          item.backgroundColorForStatus = '#FF0000';
          break;
      }
    });
  }

  async setDefaultValueForm() {

    // set d??? li???u Chi???n d???ch
    let reCamp = this.listChienDich.find(e => e.recruitmentCampaignId == this.recruitmentCampaignId);
    if (reCamp) {
      this.selectedChienDich = reCamp;
    }
    // t??n v??? tr??
    this.tenViTriTuyenDungFormControl.setValue(this.viTriTuyenDung.vacanciesName);

    // S??? l?????ng tuy???n d???ng
    this.soLuongFormControl.setValue(this.viTriTuyenDung.quantity);

    // M???c ??u ti??n
    let uuTien = this.listMucUuTien.find(e => e.value == this.viTriTuyenDung.priority);
    if (uuTien) {
      this.mucUuTienFormControl.setValue(uuTien);
    }

    // Loai ti???n t???
    let loaiTien = this.listLoaiTienTe.find(e => e.value == this.viTriTuyenDung.currency);
    if (loaiTien) {
      this.loaiTienTeFormControl.setValue(loaiTien);
    }

    // Ng?????i ph??? tr??ch
    let nguoiPT = this.listPhuTrachViTriTuyenDung.find(e => e.employeeId == this.viTriTuyenDung.personInChargeId);
    if (nguoiPT) {
      this.nguoiPhuTrachFormControl.setValue(nguoiPT);
    }
    // Lo???i CV
    let loaiCV = this.listLoaiCongViec.find(e => e.categoryId == this.viTriTuyenDung.typeOfWork);
    if (loaiCV) {
      this.loaiCongViecFormControl.setValue(loaiCV);
    }
    // Ki???u l????ng
    let kieuLuong = this.listKieuLuong.find(e => e.value == this.viTriTuyenDung.salarType);
    if (kieuLuong) {
      this.kieuLuongFormControl.setValue(kieuLuong);
      if (kieuLuong.value == 1) {
        // Kho???ng ti???n
        this.tuFormControl.setValue(this.viTriTuyenDung.salaryFrom);
        this.denFormControl.setValue(this.viTriTuyenDung.salaryTo);
        this.isFromTo = true;
      }
    }
    // N??i l??m vi???c
    this.noiLamViecFormControl.setValue(this.viTriTuyenDung.placeOfWork);

    // Kinh nghi???m
    let kingNghiem = this.listKinhNghiem.find(e => e.categoryId == this.viTriTuyenDung.experienceId);
    if (kingNghiem) {
      this.kinhNghiemFormControl.setValue(kingNghiem);
    }

    // V??? tr?? tuy???n d???ng
    this.viTriTuyenDungFormControl.setValue(this.viTriTuyenDung.vacanciesDes);
    // Y??u c???u chuy???n m??n
    this.yeuCauChuyenMonFormControl.setValue(this.viTriTuyenDung.professionalRequirements);
    // Quy???n l???i ???ng vi??n
    this.quyenLoiUngVienFormControl.setValue(this.viTriTuyenDung.candidateBenefits);

    // T??i li???u li??n quan

    // this.listCandidate.forEach(item => {
    //   this.actions = [];

    // });
  }

  changeSalary(event: any) {

    if (event.value.value == "1")
      this.isFromTo = true;
    else
      this.isFromTo = false;
  }


  goBackToList() {
    this.router.navigate(['/employee/danh-sach-cong-viec-tuyen-dung']);
  }

  goDetailCandidate(rowData) {
    let url = this.router.serializeUrl(this.router.createUrlTree(['/employee/chi-tiet-ung-vien', { candidateId: rowData.candidateId }]));
    window.open(url, '_blank');
    // this.headerPopupCandidate = "Th??ng tin ???ng vi??n";
    // // show popup chi ti???t ???ng vi??n
    // this.displayAddCandidate = true;
    // this.isUpdate = true;
    // this.createCandidateForm.reset();
    // this.candidateViewDialogId = rowData.candidateId;
    // this.statusIdDialog = rowData.status;
    // this.vacanciesControl.setValue(this.viTriTuyenDung.vacanciesName);
    // this.fullNameControl.setValue(rowData.fullName);
    // this.dateOfBirthControl.setValue(rowData.dateOfBirth ? new Date(rowData.dateOfBirth) : null);
    // this.phoneControl.setValue(rowData.phone);

    // this.genderControl.setValue(rowData.sex);
    // // K??nh
    // let kenhtd = this.listChanel.find(x => x.categoryId == rowData.recruitmentChannelId);
    // this.chanelControl.setValue(kenhtd ? kenhtd : null);

    // this.emailControl.setValue(rowData.email);

    // this.addressControl.setValue(rowData.address);
    // // Ng??y ???ng tuy???n
    // this.applicationDateCandidateControl.setValue(rowData.applicationDate ? new Date(rowData.applicationDate) : null);
  }

  btn_updateVacancies() {

    let viTriTyenDung: Vacancies = this.mapDataToModel();
    this.updateVacancies(viTriTyenDung);
  }


  updateVacancies(viTriTyenDung: any) {
    this.employeeService.updateVacancies(viTriTyenDung).subscribe(response => {
      let result = <any>response;
      this.loading = false;
      if (result.statusCode == 200) {
        let messageCode = "C???p nh???p chi???n d???ch th??nh c??ng";
        let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: messageCode };
        this.showMessageN(mgs);
        this.getMasterData();
      } else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessageN(mgs);
      }
    });
  }

  mapDataToModel(): Vacancies {
    let viTriTD = new Vacancies();

    viTriTD.vacanciesId = this.vacanciesId;
    // M?? chi???n d???ch
    viTriTD.recruitmentCampaignId = this.recruitmentCampaignId;

    viTriTD.vacanciesName = this.tenViTriTuyenDungFormControl.value?.trim();

    // Ng?????i ph??? tr??ch tuy???n d???ng
    let personInCharge: Employee = this.nguoiPhuTrachFormControl.value != null ? this.nguoiPhuTrachFormControl.value : null;
    if (personInCharge) {
      viTriTD.personInChargeId = personInCharge.employeeId;
    } else {
      viTriTD.personInChargeId = this.emptyGuid;
    }

    // Lo???i c??ng vi???c
    let loaiCV = this.loaiCongViecFormControl.value != null ? this.loaiCongViecFormControl.value : null;
    if (loaiCV) {
      viTriTD.typeOfWork = loaiCV.categoryId;
    } else {
      viTriTD.typeOfWork = this.emptyGuid;
    }

    // Kinh Nghi???m
    let kinhNghiem = this.kinhNghiemFormControl.value != null ? this.kinhNghiemFormControl.value : null;
    if (kinhNghiem) {
      viTriTD.experienceId = kinhNghiem.categoryId;
    } else {
      viTriTD.experienceId = this.emptyGuid;
    }

    viTriTD.quantity = this.soLuongFormControl == null ? 0 : ParseStringToFloat(this.soLuongFormControl.value);
    viTriTD.placeOfWork = this.noiLamViecFormControl.value;

    // M???c ??u ti??n
    let mucUuTien = this.mucUuTienFormControl.value != null ? this.mucUuTienFormControl.value : null;
    if (mucUuTien) {
      viTriTD.priority = mucUuTien.value;
    } else {
      viTriTD.priority = 0;
    }

    // Lo???i ti???n t???
    let loaiTien = this.loaiTienTeFormControl.value != null ? this.loaiTienTeFormControl.value : null;
    if (loaiTien) {
      viTriTD.currency = loaiTien.value;
    } else {
      viTriTD.currency = '';
    }

    // Ki???u l????ng
    viTriTD.salarType = this.kieuLuongFormControl.value != null ? this.kieuLuongFormControl.value.value : null;

    let luongTu = this.tuFormControl.value != null ? ParseStringToFloat(this.tuFormControl.value) : 0;
    viTriTD.salaryFrom = luongTu;

    let luongDen = this.denFormControl.value != null ? ParseStringToFloat(this.denFormControl.value) : 0;
    viTriTD.salaryTo = luongDen;

    viTriTD.vacanciesDes = this.thongTinViTriTuyenDungFormGroup.get('viTriTuyenDungFormControl').value != null ? this.thongTinViTriTuyenDungFormGroup.get('viTriTuyenDungFormControl').value : null;

    viTriTD.professionalRequirements = this.thongTinViTriTuyenDungFormGroup.get('yeuCauChuyenMonFormControl').value
      != null ? this.thongTinViTriTuyenDungFormGroup.get('yeuCauChuyenMonFormControl').value : null;

    viTriTD.candidateBenefits = this.thongTinViTriTuyenDungFormGroup.get('quyenLoiUngVienFormControl').value
      != null ? this.thongTinViTriTuyenDungFormGroup.get('quyenLoiUngVienFormControl').value : null;

    return viTriTD;
  }

  //#region   GHI CH??
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
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.employeeService.deleteFile(file.fileInFolderId).subscribe(res => {
          let result: any = res;
          if (result.statusCode == 200) {
            this.listFileResult = this.listFileResult.filter(x => x.fileInFolderId != file.fileInFolderId);

            let msg = { severity: 'success', summary: 'Th??ng b??o', detail: 'X??a file th??nh c??ng' };
            this.showMessageN(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
            this.showMessageN(msg);
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
      fileUpload.FileInFolder.objectId = this.vacanciesId;
      fileUpload.FileInFolder.objectType = 'VACANCIES';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    this.employeeService.uploadFile("VACANCIES", listFileUploadModel, this.vacanciesId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        this.uploadedFiles = [];

        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }

        this.listFileResult = result.listFileInFolder;
        let msg = { severity: 'success', summary: 'Th??ng b??o', detail: "Th??m file th??nh c??ng" };
        this.showMessageN(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessageN(msg);
      }
    });
  }


  // Event thay ?????i n???i dung ghi ch??
  currentTextChange: string = '';
  changeNoteContent(event) {
    let htmlValue = event.htmlValue;
    this.currentTextChange = event.textValue;
  }

  /*Event S????a ghi chu??*/
  onClickEditNote(noteId: string, noteDes: string) {
    this.noteContent = noteDes;
    this.noteId = noteId;
    this.listUpdateNoteDocument = this.noteHistory.find(x => x.noteId == this.noteId).noteDocList;
    this.isEditNote = true;
  }
  /*End*/

  /*Event X??a ghi ch??*/
  onClickDeleteNote(noteId: string) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a ghi ch?? n??y?',
      accept: () => {
        this.loading = true;
        this.noteService.disableNote(noteId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            let note = this.noteHistory.find(x => x.noteId == noteId);
            let index = this.noteHistory.lastIndexOf(note);
            this.noteHistory.splice(index, 1);

            this.showMessage('success', 'X??a ghi ch?? th??nh c??ng');
          } else {
            this.showMessage('error', result.messageCode);
          }
        });
      }
    });
  }

  /* Event th??m file d?????c ch???n v??o list file note */
  handleNoteFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= this.defaultLimitedFileSize) {
        if (type.indexOf('/') != -1) {
          type = type.slice(0, type.indexOf('/'));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedNoteFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf('.'));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedNoteFiles.push(file);
          }
        }
      }
    }
  }

  /*Event khi click x??a t???ng file */
  removeNoteFile(event) {
    let index = this.uploadedNoteFiles.indexOf(event.file);
    this.uploadedNoteFiles.splice(index, 1);
  }
  /*End*/

  /*Event khi click x??a to??n b??? file */
  clearAllNoteFile() {
    this.uploadedNoteFiles = [];
  }

  cancelNote() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c mu???n h???y ghi ch?? n??y?',
      accept: () => {
        this.noteId = null;
        this.noteContent = null;
        this.uploadedNoteFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();
        }
        this.listUpdateNoteDocument = [];
        this.isEditNote = false;
      }
    });
  }

  /*L??u file v?? ghi ch?? v??o Db*/
  async saveNote() {
    let objectType = 'VACANCIES';
    this.loading = true;
    this.listNoteDocumentModel = [];

    let listFileUploadModel: Array<FileUploadModel> = [];
    this.uploadedNoteFiles.forEach(item => {
      let fileUpload: FileUploadModel = new FileUploadModel();
      fileUpload.FileInFolder = new FileInFolder();
      fileUpload.FileInFolder.active = true;
      let index = item.name.lastIndexOf(".");
      let name = item.name.substring(0, index);
      fileUpload.FileInFolder.fileName = name;
      fileUpload.FileInFolder.fileExtension = item.name.substring(index + 1);
      fileUpload.FileInFolder.size = item.size;
      fileUpload.FileInFolder.objectType = objectType;
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    let noteModel = new NoteModel();
    if (!this.noteId) {
      /*T???o m???i ghi ch??*/
      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.vacanciesId;
      noteModel.ObjectType = objectType;
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi ch??*/
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.vacanciesId;
      noteModel.ObjectType = objectType;
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    }
    if (noteModel.Description == "" && this.listNoteDocumentModel.length == 0) {

      this.loading = false;
      return;
    }

    this.listDeleteNoteDocument.forEach(item => {
      // X??a file v???t l??
      let result: any = this.imageService.deleteFileForOptionAsync(objectType, item.documentName);

      // x??a file trong DB
      this.noteService.deleteNoteDocument(item.noteId, item.noteDocumentId).subscribe(response => {
        let result: any = response;
        // this.loading = false;
        if (result.statusCode != 200) {
          let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
          this.showMessageN(msg);
        }
      });
    })

    this.noteHistory = [];
    this.noteService.createNoteForAllRecruitmentCampaign(noteModel, objectType, listFileUploadModel).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedNoteFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();  //X??a to??n b??? file trong control
        }
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;

        /*Reshow Time Line*/
        this.noteHistory = result.listNote;
        this.handleNoteContent();

        this.showMessage('success', 'Th??m ghi ch?? th??nh c??ng');
      } else {
        this.showMessage('error', result.messageCode);
      }
    });
  }

  /** X??? l?? v?? hi???n th??? l???i n???i dung ghi ch?? */
  handleNoteContent() {
    this.noteHistory.forEach(element => {
      setTimeout(() => {
        let count = 0;
        if (element.description == null) {
          element.description = "";
        }

        let des = $.parseHTML(element.description);
        let newTextContent = '';
        for (let i = 0; i < des.length; i++) {
          count += des[i].textContent.length;
          newTextContent += des[i].textContent;
        }

        if (count > 250) {
          newTextContent = newTextContent.substr(0, 250) + '<b>...</b>';
          $('#' + element.noteId).find('.short-content').append($.parseHTML(newTextContent));
        } else {
          $('#' + element.noteId).find('.short-content').append($.parseHTML(element.description));
        }

        $('#' + element.noteId).find('.full-content').append($.parseHTML(element.description));
      }, 1000);
    });
  }
  /*End*/

  /*Event M??? r???ng/Thu g???n n???i dung c???a ghi ch??*/
  toggle_note_label: string = 'M??? r???ng';
  trigger_node(nodeid: string, event) {
    // noteContent
    let shortcontent_ = $('#' + nodeid).find('.short-content');
    let fullcontent_ = $('#' + nodeid).find('.full-content');
    if (shortcontent_.css("display") === "none") {
      fullcontent_.css("display", "none");
      shortcontent_.css("display", "block");
    } else {
      fullcontent_.css("display", "block");
      shortcontent_.css("display", "none");
    }
    // noteFile
    let shortcontent_file = $('#' + nodeid).find('.short-content-file');
    let fullcontent_file = $('#' + nodeid).find('.full-content-file');
    let continue_ = $('#' + nodeid).find('.continue')
    if (shortcontent_file.css("display") === "none") {
      continue_.css("display", "block");
      fullcontent_file.css("display", "none");
      shortcontent_file.css("display", "block");
    } else {
      continue_.css("display", "none");
      fullcontent_file.css("display", "block");
      shortcontent_file.css("display", "none");
    }
    let curr = $(event.target);

    if (curr.attr('class').indexOf('pi-chevron-right') != -1) {
      this.toggle_note_label = 'Thu g???n';
      curr.removeClass('pi-chevron-right');
      curr.addClass('pi-chevron-down');
    } else {
      this.toggle_note_label = 'M??? r???ng';
      curr.removeClass('pi-chevron-down');
      curr.addClass('pi-chevron-right');
    }
  }
  /*End */

  /*Ki???m tra noteText > 250 k?? t??? ho???c noteDocument > 3 th?? ???n ??i m???t ph???n n???i dung*/
  tooLong(note): boolean {
    if (note.noteDocList.length > 3) return true;
    var des = $.parseHTML(note.description);
    var count = 0;
    for (var i = 0; i < des.length; i++) {
      count += des[i].textContent.length;
      if (count > 250) return true;
    }
    return false;
  }

  //#endregion

  //#region   DANH S??CH ???NG VI??N

  onChangeAction(rowData: any) {
    this.actions = [];

    // H???n PV
    let item1: MenuItem = {
      id: '1', label: 'H???n ph???ng v???n', command: () => {
        this.addInterviewSchedule(rowData);
      }
    }

    // G???i offer
    let item2: MenuItem = {
      id: '2', label: 'G???i offer', command: () => {
        this.listCandidatePV = []
        this.listCandidatePV.push(rowData);

        let emailData = new emailPVModel();
        emailData = this.getInfomationContentEmail();

        let ref = this.dialogService.open(TemplateVacanciesEmailComponent, {
          data: {
            emailType: 'OFFER',
            emailData: emailData
          },
          header: 'G???i email offer',
          width: '65%',
          baseZIndex: 1030,
          contentStyle: {
            "min-height": "190px",
            "max-height": "800px",
            "overflow": "auto"
          }
        });

        ref.onClose.subscribe(async (result: any) => {
          if (result) {
            if (result.status) {
              this.loading = true;
              let lstCandidateId: Array<string> = []

              lstCandidateId.push(rowData.candidateId);
              let result: any = await this.employeeService.updateStatusCandidateFromVacancies(lstCandidateId, 4, this.vacanciesId);
              if (result.statusCode == 200) {
                let data = result.listCandidate
                this.listCandidate = data.filter(x => x.status != 7);
                this.setColorOfStatusCandidate();
                this.loading = false;
                this.showMessage('success', 'C???p nh???p tr???ng th??i th??nh c??ng.');
              }
              else
                this.loading = false;
            }
          }
          this.listCandidatePV = []
        });
      }
    }

    // T??? ch???i offer
    let item3: MenuItem = {
      id: '3', label: 'T??? ch???i offer', command: async () => {
        await this.updateCandidate(rowData, 5);
      }
    }

    // Kh??ng ?????t
    let item4: MenuItem = {
      id: '4', label: 'Kh??ng ?????t', command: async () => {
        this.listCandidatePV.push(rowData)
        let emailData = new emailPVModel();
        emailData = this.getInfomationContentEmail();

        let ref = this.dialogService.open(TemplateVacanciesEmailComponent, {
          data: {
            emailType: 'FAIL',
            emailData: emailData
          },
          header: 'G???i email th??ng b??o k???t qu??? - Kh??ng ?????t',
          width: '65%',
          baseZIndex: 1030,
          contentStyle: {
            "min-height": "190px",
            "max-height": "800px",
            "overflow": "auto"
          }
        });

        ref.onClose.subscribe(async (result: any) => {
          if (result) {
            if (result.status) {
              this.loading = true;
              let lstCandidateId: Array<string> = []
              lstCandidateId.push(rowData.candidateId);
              let result: any = await this.employeeService.updateStatusCandidateFromVacancies(lstCandidateId, 6, this.vacanciesId);
              if (result.statusCode == 200) {
                let data = result.listCandidate
                this.listCandidate = data.filter(x => x.status != 7);
                this.setColorOfStatusCandidate();
                this.loading = false;
                this.showMessage('success', 'C???p nh???p tr???ng th??i th??nh c??ng.');
              }
              else
                this.loading = false;
            }
            else
              this.loading = false;
          }
          this.listCandidatePV = []
        });
      }
    }

    // Chuy???n th??nh NV
    let item5: MenuItem = {
      id: '5', label: 'Chuy???n th??nh NV', command: async () => {
        this.convertToEmployee(rowData);
      }
    }

    // X??a
    let item6: MenuItem = {
      id: '6', label: 'X??a', command: async () => {
        this.deleteCandidate(rowData);
      }
    }

    // ?????t PV
    let item7: MenuItem = {
      id: '7', label: '?????t ph???ng v???n', command: async () => {
        this.updateCandidate(rowData, 3);
      }
    }

    // Tr???ng th??i c???a t???ng d??ng
    switch (rowData.status) {
      case 1:// M???i
        this.actions.push(item1);// h???n PV
        this.actions.push(item5);// Chuy???n NV
        this.actions.push(item6);// X??a
        break;
      case 2:  // H???n ph???ng v???n
        this.actions.push(item1);// h???n PV
        this.actions.push(item7);// ?????t PV
        this.actions.push(item4);// Kh??ng ?????t
        this.actions.push(item2);// G???i offer
        break;

      case 3: // ?????t ph???ng v???n
        this.actions.push(item1);//h???n PV
        this.actions.push(item2);// G???i offer
        this.actions.push(item4);// Kh??ng ?????t
        this.actions.push(item5);// Chuy???n NV
        break;

      case 4:// G???i offer
        this.actions.push(item1);//h???n PV
        this.actions.push(item2);// G???i offer
        this.actions.push(item3);// T??? ch???i Offer
        this.actions.push(item5);// Chuy???n NV
        break;

      case 5: // T??? ch???i offer
        this.actions.push(item1);//h???n PV
        this.actions.push(item2);// G???i offer
        this.actions.push(item5);// Chuy???n NV
        break;
      case 6: // Khoogn ?????t
        this.actions.push(item2);// G???i offer
        this.actions.push(item7);// ?????t PV
        break;
    }

    //N???u l?? ng?????i ph??? tr??ch ho???c tr?????ng nhan s??? m???i ???????c thao t??c v???i ???ng vi??n
    if (this.isManagerOfHR || this.isNguoiPhuTrach) {
    } else {
      this.actions = [];
    }
  }

  // T???o l???ch PV cho 1 ho???c nhi???u -- N??t tr??n header
  addInterviewSchedule(rowData: any) {

    this.listCandidatePV = []
    let interview = new InterviewSheduleModel();
    this.interViewForm.reset();
    // Ti??u ????? ph???ng v???n
    let title = 'Ph???ng v???n ' + this.viTriTuyenDung.vacanciesName;
    this.titleFormControl.setValue(title);
    if (rowData !== null && rowData != undefined) {
      this.displayAddInterviewSche = true;
      interview.candidateId = rowData.candidateId;
      interview.fullName = rowData?.fullName;
      interview.email = rowData?.email;
      interview.interviewScheduleType = 1; // 1 Tr???c ti???p -- 2 Online
      this.listCandidatePV.push(interview)
    }
    else {
      if (this.selectedCandidate.length > 0) {
        this.displayAddInterviewSche = true;
        this.selectedCandidate.forEach(can => {
          interview = new InterviewSheduleModel();
          interview.candidateId = can.candidateId;
          interview.fullName = can?.fullName;
          interview.email = can?.email;
          interview.interviewScheduleType = 1; // 1 Tr???c ti???p -- 2 Online
          this.listCandidatePV.push(interview)
        });
      }
      else {
        if (this.listCandidate.filter(x => x.statusCode == "UVMOI").length > 0) {
          this.displayAddInterviewSche = true;
          this.listCandidate.filter(x => x.statusCode == "UVMOI").forEach(candi => {
            interview = new InterviewSheduleModel();
            interview.candidateId = candi.candidateId;
            interview.fullName = candi?.fullName;
            interview.email = candi?.email;
            interview.interviewScheduleType = 1; // 1 Tr???c ti???p -- 2 Online
            this.listCandidatePV.push(interview)
          });
        }
        else
          this.showMessage('error', 'Vui l??ng ch???n ???ng vi??n c?? tr???ng th??i m???i.');
      }
    }
  }

  getInfomationContentEmail(emailType: string = null) {

    let emailData = new emailPVModel();
    let candi = new candidateSenEmailPVModel();
    this.listCandidatePV.forEach(item => {
      if (item.email !== null) {
        candi = new candidateSenEmailPVModel()
        candi.email = item.email;
        candi.fullName = item.fullName;
        candi.interviewTime = item.interviewDate;
        candi.addressOrLink = item.address;
        candi.interviewScheduleType = item.interviewScheduleType;
        if (emailType == "PHONG_VAN")
          item.listEmployeeId.forEach(emp => {
            candi.listInterviewerEmail.push(emp.email);
          });
        emailData.listCandidate.push(candi)
      }
    });

    // V??? tr?? tuy??n d???ng
    emailData.vancaciesName = this.selectedChienDich.recruitmentCampaignName;
    let nguoiPT = this.listPhuTrachViTriTuyenDung.find(e => e.employeeId == this.viTriTuyenDung.personInChargeId);
    if (nguoiPT != undefined) {
      // Ng?????i ph??? tr??ch
      emailData.personInChagerName = nguoiPT.employeeName;
      emailData.personInChagerPhone = nguoiPT.phone;
    }

    emailData.workplace = this.viTriTuyenDung.placeOfWork;

    this.listCandidatePV = []
    return emailData;
  }

  // T???O L???CH PV SAU G???I EMAIL CHO 1 HO???C NHI???U NG?????I
  async saveAddIntervivewSheDialog() {

    if (!this.interViewForm.valid) {
      Object.keys(this.interViewForm.controls).forEach(key => {
        if (this.interViewForm.controls[key].valid == false) {
          this.interViewForm.controls[key].markAsTouched();
        }
      });
      this.showMessage('error', 'Vui l??ng nh???p ?????y ????? th??ng tin c??c tr?????ng d??? li???u.');
    }
    else {
      let lstInterviewModel: Array<InterviewSheduleModel> = this.mappingInterviewSheduleFormToModel();

      // let emailData = new emailPVModel();
      // emailData = this.getInfomationContentEmail("PHONG_VAN");
      // // show popup g???i email
      // let ref = this.dialogService.open(TemplateVacanciesEmailComponent, {
      //   data: {
      //     emailData: emailData,
      //     emailType: 'PHONG_VAN'
      //   },
      //   header: 'G???i email m???i tham d??? ph???ng v???n',
      //   width: '65%',
      //   baseZIndex: 1030,
      //   contentStyle: {
      //     "min-height": "190px",
      //     "max-height": "800px",
      //     "overflow": "auto"
      //   }
      // });

      // ref.onClose.subscribe(async (result: any) => {

      //   if (result) {
      //     if (result.status) {
      this.loading = true;
      // T???o l???ch PV
      let result: any = await this.employeeService.createInterviewSchedule(lstInterviewModel);

      if (result.statusCode == 200) {
        this.loading = false;
        this.displayAddInterviewSche = false;
        this.listCandidate = []
        let data = result.listCandidate
        this.listCandidate = data.filter(x => x.status != 7);
        this.setColorOfStatusCandidate();
        this.showMessage('success', 'T???o l???ch ph???ng v???n th??nh c??ng.');
      }

      this.month = ((new Date).getMonth() + 1).toString();
      this.year = (new Date).getFullYear();

      let listInvalidEmail: Array<string> = result.listInvalidEmail;
      if (listInvalidEmail != null && listInvalidEmail != undefined) {
        let message = `G???i email th??nh c??ng. C?? <strong>${listInvalidEmail.length} email</strong> kh??ng h???p l???:<br/>`
        listInvalidEmail.forEach(item => {
          message += `<div style="padding-left: 30px;"> -<strong>${item}</strong></div>`
        });
        if (listInvalidEmail.length > 0) {
          this.confirmationService.confirm({
            message: message,
            rejectVisible: false,
          });
        }
      }
      let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'G???i email th??nh c??ng' };
      this.showMessageN(msg);
      //     }
      //   }
      // });
      //}
      // else {
      //   this.loading = false;
      //   this.showMessage('error', 'T???o l???ch ph???ng v???n th???t b???i.');
      // }
    }
  }

  mappingInterviewSheduleFormToModel() {

    let lstInterviewModel = new Array<InterviewSheduleModel>();
    this.listCandidatePV.forEach(item => {
      let interviewModel = new InterviewSheduleModel();
      interviewModel.interviewScheduleId = this.emptyGuid;
      interviewModel.vacanciesId = this.vacanciesId;
      interviewModel.candidateId = item.candidateId;

      interviewModel.interviewTitle = this.interViewForm.get('titleFormControl').value == null ? null : this.interViewForm.get('titleFormControl').value;
      interviewModel.interviewDate = item.interviewDate;
      interviewModel.address = item.address;
      interviewModel.interviewScheduleType = item.interviewScheduleType;

      item.listEmployeeId.forEach(emp => {
        interviewModel.listEmployeeId.push(emp.employeeId);
      });
      lstInterviewModel.push(interviewModel);
    });
    return lstInterviewModel;
  }

  cancelAddIntervivewSheDialog() {
    this.confirmationService.confirm({
      message: 'B???n c?? mu???n tho??t kh??ng?',
      accept: async () => {
        this.displayAddInterviewSche = false;
      }
    });
  }

  // CHUY???N TH??NH NV / TH??? VI???C
  convertToEmployee(rowData: any) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n chuy???n ???ng vi??n th??nh nh??n vi??n kh??ng?"',
      accept: () => {

        // Split t??n ???ng vi??n
        let tenKhongDau = cleanAccents(rowData.fullName);
        let splitTenKD = tenKhongDau.split(" ");
        let name = '';
        let ho = '';
        let tenDem = '';
        let chuCaiDau = '';
        let chuCaiSau = '';

        if (splitTenKD.length == 1)
          name = splitTenKD[0];
        else {
          name = splitTenKD[splitTenKD.length - 1];
          ho = splitTenKD[0];
          chuCaiDau = ho.charAt(0);
          if (splitTenKD.length > 2) {
            tenDem = splitTenKD[1];
            chuCaiSau = tenDem.charAt(0);
          }
        }

        let accountName = name + chuCaiDau + chuCaiSau;
        let lstCandidateId: Array<string> = [];
        lstCandidateId.push(rowData.candidateId);

        // L???y gi?? tr??? cho employee model
        this.employeeModel.HoTenTiengAnh = rowData.fullName.trim();
        this.employeeModel.CreatedDate = new Date();
        this.employeeModel.QuocTich = '';
        this.employeeModel.DanToc = '';
        this.employeeModel.TonGiao = '';
        this.employeeModel.StartDateMayChamCong = new Date();
        this.employeeModel.PositionId = this.emptyGuid;
        let isAccessable = true;

        // L???y gi?? tr??? cho contact employee
        this.contactModel.ContactId = this.emptyGuid;
        this.contactModel.ObjectId = this.emptyGuid;

        this.contactModel.CreatedDate = new Date();
        this.contactModel.CreatedById = this.auth.UserId;
        this.contactModel.FirstName = rowData.fullName.trim()
        this.contactModel.LastName = '';
        this.contactModel.Email = rowData.email;
        this.contactModel.Phone = rowData.phone?.value;
        this.contactModel.Gender = rowData.sex;
        this.contactModel.CreatedById = this.auth.UserId;
        this.contactModel.CreatedDate = new Date();

        // Accoutn ????ng nh???p
        this.userModel.UserName = accountName;
        //this.userModel.Password = "1";

        //List Ph??ng ban
        let listPhongBanId: Array<any> = [];

        let fileBase64 = {
          "Extension": null, /*?????nh d???ng ???nh (jpg, png,...)*/
          "Base64": null /*?????nh d???ng base64 c???a ???nh*/
        }

        this.loading = true;
        this.awaitResult = true;

        this.employeeService.createEmployee(this.employeeModel, this.contactModel, this.userModel, isAccessable, listPhongBanId, true, fileBase64, rowData.candidateId).subscribe(response => {
          let result = <any>response;
          this.loading = false;
          if (result.statusCode === 202 || result.statusCode === 200) {
            // remove ???ng vi??n kh???i danh s??ch
            this.listCandidate = this.listCandidate.filter(e => e != rowData);
            let mgs = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Chuy???n ?????i NV th??nh c??ng.' };
            this.showMessageN(mgs);
          }
          else {
            let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessageN(mgs);
            this.awaitResult = false;
          };
        });

        this.displayRejectEmail = true;
      }
    });
  }

  // UPDATE TR???NG TH??I
  async updateCandidate(rowData: any, status: number) {
    let mes = '';
    switch (status) {
      case 3: //?????t
        mes = "X??c nh???n PV ?????t cho ???ng vi??n?";
        break;
      case 6: // Kh??ng ?????t
        mes = "X??c nh???n PV kh??ng ?????t ???ng vi??n?";
        break;
      case 5:// T??? ch???i OFFER
        mes = "X??c nh???n T??? ch???i offer ???ng vi??n?";
        break;
    }

    this.confirmationService.confirm({
      message: mes,
      accept: async () => {
        let lstCandidateId: Array<string> = []
        lstCandidateId.push(rowData.candidateId);
        let result: any = await this.employeeService.updateStatusCandidateFromVacancies(lstCandidateId, status, this.vacanciesId);
        if (result.statusCode == 200) {
          let data = result.listCandidate
          this.listCandidate = data.filter(x => x.status != 7);
          this.setColorOfStatusCandidate();
          this.showMessage('success', 'C???p nh???p tr???ng th??i th??nh c??ng.');
        }
      }
    });
  }

  // Th??m nhanh ???ng vi??n
  addCandidate() {
    this.displayAddCandidate = true;
    this.createCandidateForm.reset();
    this.vacanciesControl.setValue(this.viTriTuyenDung.vacanciesName);
  }

  // ????ng dialog th??m UV
  cancelAddCandidateDialog() {

    if (this.createCandidateForm.dirty) {
      this.confirmationService.confirm({
        message: 'B???n c?? mu???n h???y b??? c??c thay ?????i?',
        accept: () => {
          this.displayAddCandidate = false;
          this.statusIdDialog = this.emptyGuid;
          this.isUpdate = false;
        }
      });
    }
    else {
      this.displayAddCandidate = false;
      this.statusIdDialog = this.emptyGuid;
      this.isUpdate = false;
    }
  }

  // Th??m nhanh ???ng vi??n
  async saveAddCandidateDialog() {

    if (!this.createCandidateForm.valid) {
      Object.keys(this.createCandidateForm.controls).forEach(key => {
        if (!this.createCandidateForm.controls[key].valid) {
          this.createCandidateForm.controls[key].markAsTouched();
        }
      });
    }
    else {
      let candidateModel: CandidateModel = this.mappingCandidateFormToModel();
      this.loading = true;
      if (this.isUpdate) {
        candidateModel.statusId = this.statusIdDialog;
        this.employeeService.updateCandidate(candidateModel, this.vacanciesId, null, []).subscribe(res => {
          let result = <any>res;
          if (result.statusCode == 200) {
            this.statusIdDialog = this.emptyGuid;
            this.isUpdate = false;
            this.displayAddCandidate = false;
            let data = result.listCandidate
            this.listCandidate = data.filter(x => x.status != 7);
            this.setColorOfStatusCandidate();
            this.showMessage('success', "C???p nh???p ???ng vi??n th??nh c??ng");
          }
        });
      }
      else
        this.employeeService.createCandidate(candidateModel, this.vacanciesId, null, []).subscribe(res => {
          let result = <any>res;

          if (result.statusCode == 200) {
            this.loading = false;
            this.statusIdDialog = this.emptyGuid;
            this.displayAddCandidate = false;
            this.candidateViewDialogId = this.emptyGuid;
            let data = result.listCandidate
            this.listCandidate = data.filter(x => x.status != 7);
            this.setColorOfStatusCandidate();
            this.showMessage('success', "T???o ???ng vi??n th??nh c??ng");
          }
          else {
            this.loading = false;
            this.showMessage('error', "T???o ???ng vi??n th???t b???i");
          }
        });
      this.loading = false;
    }
  }

  mappingCandidateFormToModel() {
    let candidateModel = new CandidateModel();
    candidateModel.candidateId = this.isUpdate == true ? this.candidateViewDialogId : this.emptyGuid;
    candidateModel.vacanciesId = this.vacanciesId;
    candidateModel.recruitmentCampaignId = this.recruitmentCampaignId;

    candidateModel.fullName = this.createCandidateForm.get('fullNameControl').value == null ? null : this.createCandidateForm.get('fullNameControl').value;

    candidateModel.dateOfBirth = this.createCandidateForm.get('dateOfBirthControl').value == "" || this.createCandidateForm.get('dateOfBirthControl').value == null ? null : convertToUTCTime(this.createCandidateForm.get('dateOfBirthControl').value);

    candidateModel.sex = this.createCandidateForm.get('genderControl').value == null ? null : this.createCandidateForm.get('genderControl').value;

    candidateModel.address = this.createCandidateForm.get('addressControl').value == null ? '' : this.createCandidateForm.get('addressControl').value;

    candidateModel.phone = this.createCandidateForm.get('phoneControl').value;

    candidateModel.email = this.emailControl.value ? this.emailControl.value : '';

    candidateModel.recruitmentChannel = this.createCandidateForm.get('chanelControl').value == null ? null : this.createCandidateForm.get('chanelControl').value.categoryId;

    candidateModel.applicationDate = this.createCandidateForm.get('applicationDateCandidateControl').value == "" || this.createCandidateForm.get('applicationDateCandidateControl').value == null ? null : convertToUTCTime(this.createCandidateForm.get('applicationDateCandidateControl').value);
    return candidateModel;
  }

  // delete ???ng vi??n 1 ho???c nhi???u
  async deleteCandidate(rowData: any) {

    let selectedCandidateId = [];
    if (rowData != null) {
      selectedCandidateId.push(rowData.candidateId);
    }
    else {
      this.selectedCandidate.forEach(item => {
        selectedCandidateId.push(item.candidateId);
      });
    }

    if (selectedCandidateId.length > 0) {
      this.confirmationService.confirm({
        message: 'B???n c?? mu???n x??a ???ng vi??n?',
        accept: async () => {
          this.loading = true;
          let result: any = await this.employeeService.deleteCandidates(selectedCandidateId, this.vacanciesId);
          if (result.statusCode == 200) {
            this.noteHistory = result.listNote;
            let data = result.listCandidate
            this.listCandidate = data.filter(x => x.status != 7);
            this.setColorOfStatusCandidate();
            this.handleNoteContent();
            this.loading = false;
            this.showMessage('success', "X??a th??nh c??ng ???ng vi??n.");
          }
          else {
            this.loading = false;
            this.showMessage('error', "T???n t???i ???ng vi??n tr???ng th??i kh??c M???i.");
          }
        }
      });
    }
    else
      this.showMessage('error', "Vui l??ng ch???n ???ng vi??n ????? x??a.");
  }

  //#endregion

  //#region XU???T EXCEL
  exportExcel() {
    let title = 'DANH S??CH ???NG VI??N ' + this.viTriTuyenDung.vacanciesName.toUpperCase();
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('DS_UNGVIEN');

    let imgBase64 = this.getBase64Logo();

    /* Image */
    var imgLogo = workbook.addImage({
      base64: imgBase64,
      extension: 'png',
    });

    worksheet.addImage(imgLogo, {
      tl: { col: 0, row: 0 },
      ext: { width: 155, height: 100 }
    });


    let dataRow1 = [];
    dataRow1[2] = this.inforExportExcel.companyName.toUpperCase();  //T??n c??ng ty
    let row1 = worksheet.addRow(dataRow1);
    row1.font = { name: 'Times New Roman', size: 10, bold: true };
    worksheet.mergeCells(`B${row1.number}:E${row1.number}`);
    row1.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow2 = [];
    dataRow2[2] = '?????a ch???: ' + this.inforExportExcel.address;  //?????a ch???
    let row2 = worksheet.addRow(dataRow2);
    row2.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`B${row2.number}:E${row2.number}`);
    row2.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow3 = [];
    dataRow3[2] = '??i???n tho???i: ' + this.inforExportExcel.phone;  //S??? ??i???n tho???i
    let row3 = worksheet.addRow(dataRow3);
    row3.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`B${row3.number}:E${row3.number}`);
    row3.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow4 = [];
    dataRow4[2] = 'Email: ' + this.inforExportExcel.email;
    let row4 = worksheet.addRow(dataRow4);
    row4.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`B${row4.number}:E${row4.number}`);
    row4.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow5 = [];
    dataRow5[2] = 'Website d???ch v???: ' + this.inforExportExcel.website;  //?????a ch??? website
    let row5 = worksheet.addRow(dataRow5);
    row5.font = { name: 'Times New Roman', size: 11, color: { argb: '003366' } };
    worksheet.mergeCells(`B${row5.number}:E${row5.number}`);
    row5.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    /* title */
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { family: 4, size: 16, bold: true };
    titleRow.height = 25;
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
    /* subtitle */
    //let filterData = this.getDataFilterForm();

    /* header */
    const header = this.colsCandidate.map(e => e.header);
    let headerRow = worksheet.addRow(header);
    headerRow.font = { bold: true };
    header.forEach((item, index) => {
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    });

    /* data table */
    let data = this.listCandidate.map((item, index) => {
      let row = [];

      row.push(index + 1);
      row.push(item.fullName);
      row.push(new Date(item.applicationDate).getDate() + '/' + new Date(item.applicationDate).getMonth() + '/' + new Date(item.applicationDate).getUTCFullYear());
      row.push(item.email);
      row.push(item.phone);
      row.push(item.recruitmentChannelName);
      row.push(item.statusName);

      return row;
    });

    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      this.colsCandidate.forEach((item, index) => {
        row.getCell(index + 1).alignment = { vertical: 'bottom', horizontal: item.textAlign, wrapText: true };
        row.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });
    });

    /* set width */
    this.colsCandidate.forEach((item, index) => {
      worksheet.getColumn(index + 1).width = item.excelWidth;
    });
    worksheet.addRow([]);
    /* k?? t??n */
    let footer1 = [];
    footer1[4] = 'Ng??y.....th??ng.....n??m..........';
    let rowFooter1 = worksheet.addRow(footer1);
    worksheet.mergeCells(`H${rowFooter1.number}:F${rowFooter1.number}`);
    rowFooter1.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    let footer2 = [];
    footer2[4] = 'NG?????I L???P';
    let rowFooter2 = worksheet.addRow(footer2);
    worksheet.mergeCells(`H${rowFooter2.number}:F${rowFooter2.number}`);
    rowFooter2.font = { bold: true };
    rowFooter2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    let footer3 = [];
    footer3[4] = '(K??, h??? t??n)';
    let rowFooter3 = worksheet.addRow(footer3);
    worksheet.mergeCells(`H${rowFooter3.number}:F${rowFooter3.number}`);
    rowFooter3.font = { italic: true };
    rowFooter3.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    this.exportToExel(workbook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    });
  }

  getBase64Logo() {
    let base64Logo = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "Logo");
    return base64Logo?.systemValueString;
  }

  //#endregion

  //#region   IMPORT EXCEL

  chooseFile(event: any) {
    this.fileName = event.target?.files[0]?.name;
    this.importFileExcel = event.target;
  }

  importCandidate() {
    this.displayChooseFileImportDialog = true;
  }

  // T???i file excel ???ng vi??n l??n Grid
  importExcel() {
    if (this.fileName == "") {
      let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "Ch??a ch???n file c???n nh???p" };
      this.showMessageN(mgs);
      return;
    }

    const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(targetFiles.files[0]);
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });
      let code = 'UngVien';
      if (!workbook.Sheets[code]) {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
        this.showMessageN(mgs);
        return;
      }

      //l???y data t??? file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
      /* save data */
      let listCandidateRawData: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
      /* remove header */
      listCandidateRawData = listCandidateRawData.filter((e, index) => index != 0);
      /* n???u kh??ng nh???p  tr?????ng required th?? lo???i b??? */
      listCandidateRawData = listCandidateRawData.filter(e => (e[0] && e[1]));
      /* chuy???n t??? raw data sang model */
      let listCandidateDataImport: Array<importCustomerByExcelModel> = [];

      listCandidateRawData?.forEach(_rawData => {
        /*
        M?? c??ng lao ?????ng
        T??n c??ng lao ?????ng
        Lo???i c??ng vi???c
        Model xe
        T??nh ch???t
       */
        let candidate = new importCustomerByExcelModel();
        candidate.candidateName = _rawData[1] ? _rawData[1].toString().trim() : '';
        candidate.dateOfBirth = _rawData[2] ? _rawData[2].toString().trim() : null;
        candidate.phone = _rawData[3] ? _rawData[3].toString().trim() : '';
        candidate.sex = _rawData[4] ? _rawData[4].toString().trim() : 1;
        candidate.chanelCode = _rawData[5] ? _rawData[5].toString().trim() : '';
        candidate.email = _rawData[6] ? _rawData[6].toString().trim() : '';
        candidate.address = _rawData[7] ? _rawData[7].toString().trim() : '';
        candidate.applicationDate = _rawData[8] ? _rawData[8] : null;

        listCandidateDataImport = [...listCandidateDataImport, candidate];
      });
      /* t???t dialog import file, b???t dialog chi ti???t kh??ch h??ng import */
      this.displayChooseFileImportDialog = false;
      this.openDetailImportDialog(listCandidateDataImport);
    }
  }

  // Show th??ng tin danh s??ch ???ng vi??n trong excel l??n dialog
  openDetailImportDialog(listCandidateDataImport) {

    let ref = this.dialogService.open(CandidateImportDetailComponent, {
      data: {
        listCandidateDataImport: listCandidateDataImport,
        vacanciesId: this.vacanciesId,
        listCandidateAdd: this.listCandidate
      },
      header: 'Nh???p excel danh s??ch ???ng vi??n cho v??? tr?? ' + this.viTriTuyenDung.vacanciesName,
      width: '85%',
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px",
        // "over-flow": "hidden"
      }
    });
    ref.onClose.subscribe((result: any) => {
      if (result?.status) {
        this.listCandidate = result.listCandidateReturn;
        this.setColorOfStatusCandidate();
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

  async downloadTemplateExcel() {
    let result: any = await this.employeeService.downloadTemplateImportCandidate();

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
      this.showMessageN(msg);
    }
  }


  //#endregion

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
    }, error => { });
  }

  downloadFile(fileInfor: FileInFolder) {

    this.imageService.downloadFile(fileInfor.fileName, fileInfor.fileUrl).subscribe(response => {
      var result = <any>response;
      var binaryString = atob(result.fileAsBase64);
      var fileType = result.fileType;
      var name = fileInfor.fileFullName;

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

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
  }
  showMessageN(msg: any) {
    this.messageService.add(msg);
  }
  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  chonTuKhoUngVien() {

  }
}
function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

const cleanAccents = (str: string): string => {
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "a");
  str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, "e");
  str = str.replace(/??|??|???|???|??/g, "i");
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "o");
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, "u");
  str = str.replace(/???|??|???|???|???/g, "y");
  str = str.replace(/??/g, "d");
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "A");
  str = str.replace(/??|??|???|???|???|??|???|???|???|???|???/g, "E");
  str = str.replace(/??|??|???|???|??/g, "I");
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???|??|???|???|???|???|???/g, "O");
  str = str.replace(/??|??|???|???|??|??|???|???|???|???|???/g, "U");
  str = str.replace(/???|??|???|???|???/g, "Y");
  str = str.replace(/??/g, "D");
  // Combining Diacritical Marks
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // huy???n, s???c, h???i, ng??, n???ng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // m?? ?? (??), m?? ??, m?? ?? (??)

  return str;
}
function ParseStringToFloat(str: string) {
  if (str === "" || str == null) return 0;
  str = str.toString().replace(/,/g, '');
  return parseFloat(str);
}
