import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// PRIMENG
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';

// Customize
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { NoteService } from '../../../shared/services/note.service';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { NoteModel } from '../../../shared/models/note.model';
import { EmployeeService } from '../../services/employee.service';
import { DatePipe } from '@angular/common';
import { TemplateVacanciesEmailComponent } from './../../../shared/components/template-vacancies-email/template-vacancies-email.component';
import { ContactModel } from '../../../../app/shared/models/contact.model';
import { UserModel } from '../../../../app/shared/models/user.model';
import { Table } from 'primeng/table';
import { CandidateAssessment } from '../../models/candidate-assessment.model'
import { CandidateAssessmentDetail } from '../../models/candidate-assessment-detail.model'
import { GetPermission } from '../../../shared/permission/get-permission';
import { CreateEmployeeModel } from '../../models/employee.model';

class CategoryModel {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  sortOrder: number;
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


class FileNameExists {
  oldFileName: string;
  newFileName: string
}

class CandidateModel {
  candidateId: string;
  fullName: string;
  dateOfBirth: Date;
  phone: string;
  address: string;
  avatar: string;
  email: string;
  recruitmentChannel: string;
  sex: number;
  statusId: number;
  statusName: string;
  applicationDate: Date;
  phuongThucTuyenDungId: string;
  mucPhi: number;
  tomTatHocVan: string;
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
class VacancyModel {
  vacanciesId: string;
  recruitmentCampaignId: string;
  vacanciesName: string;
  quantity: number;
  priority: number;
  priorityName: string;
  personInChargeId: string;
  personInChargeCode: string;
  personInChargeName: string;
  typeOfWork: string;
  typeOfWorkName: string;
  placeOfWork: string;
  experienceId: string;
  experienceName: string;
  currency: string;
  salarType: number;
  salaryFrom: number;
  salaryTo: number;
  salaryLable: string;
}

class RecruitmentCampaignModel {
  recruitmentCampaignId: string;
  recruitmentCampaignName: string;
  startDate: Date;
  endDateDate: Date;
  statusName: string;
  personInChargeId: string;
  personInChargeName: string;
  recruitmentQuantity: number;
  placeOfWork: string;
}

class OverviewCandidate {
  overviewCandidateId: string;
  candidateId: string;
  educationAndWorkExpName: string;
  certificatePlace: string;
  specializedTraining: string;
  jobDescription: string;
  startDate: Date;
  endDate: Date;
  phone: string;
  type: string;
  proficiencyLevel: string;
  isNewLine: boolean;
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
@Component({
  selector: 'app-ung-vien-detail',
  templateUrl: './ung-vien-detail.component.html',
  styleUrls: ['./ung-vien-detail.component.css'],
  providers: [DatePipe],
})
export class UngVienDetailComponent implements OnInit {

  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  loading: boolean = false;
  awaitResult: boolean = false; //Kh??a n??t l??u, l??u v?? th??m m???i
  showDanhGia: boolean = false;
  displayAddInterviewSche: boolean = false;
  today: Date = new Date();
  statusCode: string = null;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  currentEmployeeCodeName = localStorage.getItem('EmployeeCodeName');
  auth = JSON.parse(localStorage.getItem('auth'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  viTriTuyenDungId: string = '';
  candidateId: string = '';
  selectedFilter: any;
  candidateModel: CandidateModel = {
    candidateId: '00000000-0000-0000-0000-000000000000',
    fullName: '',
    dateOfBirth: null,
    phone: '',
    address: '',
    avatar: '',
    email: '',
    recruitmentChannel: '00000000-0000-0000-0000-000000000000',
    sex: 0,
    statusId: 0,
    statusName: '',
    applicationDate: null,
    phuongThucTuyenDungId: '00000000-0000-0000-0000-000000000000',
    mucPhi: null,
    tomTatHocVan: '',
  }

  VacancyModel: VacancyModel = {
    vacanciesId: '00000000-0000-0000-0000-000000000000',
    recruitmentCampaignId: '00000000-0000-0000-0000-000000000000',
    vacanciesName: '',
    quantity: 0,
    priority: 0,
    priorityName: '',
    personInChargeId: '00000000-0000-0000-0000-000000000000',
    personInChargeCode: '',
    personInChargeName: '',
    typeOfWork: '00000000-0000-0000-0000-000000000000',
    typeOfWorkName: '',
    placeOfWork: '',
    experienceId: '00000000-0000-0000-0000-000000000000',
    experienceName: '',
    currency: '',
    salarType: 0,
    salaryFrom: 0,
    salaryTo: 0,
    salaryLable: '',
  }
  displayOfferEmail: boolean = false;
  displayRejectEmail: boolean = false;
  RecruitmentCampaignModel: RecruitmentCampaignModel = {
    recruitmentCampaignId: '00000000-0000-0000-0000-000000000000',
    recruitmentCampaignName: '',
    startDate: null,
    endDateDate: null,
    statusName: '',
    personInChargeId: '00000000-0000-0000-0000-000000000000',
    personInChargeName: '',
    recruitmentQuantity: 0,
    placeOfWork: '',
  }
  employeeModel = new CreateEmployeeModel()
  selectedChienDich: any = null;
  selectedViTri: any = null;
  month: string = '';
  year: number = (new Date()).getFullYear();
  // Danh sach
  actions: MenuItem[] = [];
  listEmployeeModels: Array<any> = [];
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
  listQuizStatus: Array<any> = [
    {
      value: 1,
      name: '?????t'
    },
    {
      value: 2,
      name: 'Kh??ng ?????t'
    },
  ];
  listCandidatePV: Array<InterviewSheduleModel> = [];
  listOverviewCandidate: Array<any> = [];
  listNguoiPhongVan: Array<any> = [];
  listThoiLuong: Array<any> = [];
  listChienDich: Array<any> = [];
  listVitri: Array<any> = [];
  listViTriTuyenDung: Array<any> = [];
  listKenhTuyenDung: Array<any> = [];
  listPhuongThucTuyenDung: Array<any> = [];
  listCertificate: Array<any> = [];
  listHocVan: Array<any> = [];
  listKinhNghiem: Array<any> = [];
  listNgoaiNgu: Array<any> = [];
  listTinHoc: Array<any> = [];
  listNguoiThamKhao: Array<any> = [];
  listLichHenPv: Array<any> = [];
  listDiemTest: Array<any> = [];
  listDanhGia: Array<any> = [];
  colsHocVan: any[];
  colsKinhNghiem: any[];
  colsNgoaiNgu: any[];
  colsTinHoc: any[];
  colsNguoiThamKhao: any[];
  colsLichHenPv: any[];
  colsDiemTest: any[];
  colsDanhGia: any[];
  listSessionReview: Array<CategoryModel> = [];
  selectedInterviewColumns: any[];
  selectedCandidateAss: any;
  clonedData: { [s: string]: any; } = {}
  contactModel = new ContactModel();

  // H??? s??
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  colsFile: any[];

  isNguoiPhongVan: boolean = false;
  isNVPhuTrach: boolean = false;
  isTruongBoPhan: boolean = false;
  loginEmp: string = '';
  // FORM
  thongTinUngVIenFormGroup: FormGroup;
  hoTenFormControl: FormControl;
  ngaySinhFormControl: FormControl;
  soDienThoaiFormControl: FormControl;
  chienDichUngTuyenFormControl: FormControl;
  viTriUngTuyenFormControl: FormControl;
  gioiTinhFormControl: FormControl;
  diaChiFormControl: FormControl;
  emailFormControl: FormControl;
  kenhTuyenDungFormControl: FormControl;
  ngayUngTuyenFormControl: FormControl;
  phuongThucTuyenDungFormControl: FormControl;
  coPhiFormControl: FormControl;
  mucPhiFormControl: FormControl;
  tomTatHocVanFormControl: FormControl;

  danhGiaFormGroup: FormGroup;
  hocVanFormControl: FormControl;
  hocVanNhanXetFormControl: FormControl;
  dungMaoFormControl: FormControl;
  dungMaoNhanXetFormControl: FormControl;
  kienThucFormControl: FormControl;
  kienThucNhanXetFormControl: FormControl;
  kinhNghiemFormControl: FormControl;
  kinhNghiemNhanXetFormControl: FormControl;
  nangLucFormControl: FormControl;
  nangLucNhanXetFormControl: FormControl;
  phamChatFormControl: FormControl;
  phamChatNhanXetFormControl: FormControl;
  giaDinhFormControl: FormControl;
  giaDinhNhanXetFormControl: FormControl;
  yeuCauFormControl: FormControl;
  yeuCauNhanXetFormControl: FormControl;
  danhGiaKhacFormControl: FormControl;

  henPhongVanFormGroup: FormGroup;
  fullNameFormControl: FormControl;
  vacancyNameFormControl: FormControl;
  interViewNameFormControl: FormControl;
  interviewTypeFormControl: FormControl;
  tieuDeFormControl: FormControl;
  addressFormControl: FormControl;
  interviewDateFormControl: FormControl;


  isSuaDanhGia: boolean = true;
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionEdit: boolean = true;

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

  password: string = this.systemParameterList.find(x => x.systemKey == "DefaultUserPassword").systemValueString;
  mobNumberPattern = "^[0-9]*$";
  userModel: UserModel = {
    UserId: null, Password: this.password, UserName: '', EmployeeId: '', EmployeeCode: '', Disabled: false, CreatedById: 'DE2D55BF-E224-4ADA-95E8-7769ECC494EA', CreatedDate: null, UpdatedById: null, UpdatedDate: null, Active: true
  };
  @ViewChild('dtHoSo') dtHoSo: Table;

  constructor(
    private router: Router,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    private noteService: NoteService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private employeeService: EmployeeService,
    private imageService: ImageUploadService,
    private confirmationService: ConfirmationService,
    private def: ChangeDetectorRef,
    private getPermission: GetPermission,
  ) { }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    let resource = "hrm/employee/chi-tiet-ung-vien/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
      this.showMessage('warn', 'B???n kh??ng c?? quy???n truy c???p');
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
      this.candidateId = params['candidateId'];

      this.getMasterdata();
    });
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  setForm() {
    this.hoTenFormControl = new FormControl(null, [Validators.required]);
    this.ngaySinhFormControl = new FormControl(null, [Validators.required]);
    this.soDienThoaiFormControl = new FormControl('', [Validators.required, Validators.pattern(this.getPhonePattern())]);
    this.viTriUngTuyenFormControl = new FormControl(null, [Validators.required]);
    this.chienDichUngTuyenFormControl = new FormControl(null, [Validators.required]);
    this.gioiTinhFormControl = new FormControl(1, [Validators.required]);
    this.diaChiFormControl = new FormControl(null);
    this.emailFormControl = new FormControl(null);
    this.phuongThucTuyenDungFormControl = new FormControl(null);
    this.kenhTuyenDungFormControl = new FormControl(null);
    this.ngayUngTuyenFormControl = new FormControl(null);
    this.coPhiFormControl = new FormControl(1, [Validators.required]);
    this.mucPhiFormControl = new FormControl(0);
    this.tomTatHocVanFormControl = new FormControl('');

    this.thongTinUngVIenFormGroup = new FormGroup({
      hoTenFormControl: this.hoTenFormControl,
      ngaySinhFormControl: this.ngaySinhFormControl,
      soDienThoaiFormControl: this.soDienThoaiFormControl,
      chienDichUngTuyenFormControl: this.chienDichUngTuyenFormControl,
      viTriUngTuyenFormControl: this.viTriUngTuyenFormControl,
      gioiTinhFormControl: this.gioiTinhFormControl,
      diaChiFormControl: this.diaChiFormControl,
      emailFormControl: this.emailFormControl,
      kenhTuyenDungFormControl: this.kenhTuyenDungFormControl,
      ngayUngTuyenFormControl: this.ngayUngTuyenFormControl,
      phuongThucTuyenDungFormControl: this.phuongThucTuyenDungFormControl,
      coPhiFormControl: this.coPhiFormControl,
      mucPhiFormControl: this.mucPhiFormControl,
      tomTatHocVanFormControl: this.tomTatHocVanFormControl,
    });

    this.hocVanFormControl = new FormControl(null, [Validators.required]);
    this.hocVanNhanXetFormControl = new FormControl(null);
    this.dungMaoFormControl = new FormControl(null, [Validators.required]);
    this.dungMaoNhanXetFormControl = new FormControl(null);
    this.kienThucFormControl = new FormControl(null, [Validators.required]);
    this.kienThucNhanXetFormControl = new FormControl(null);
    this.kinhNghiemFormControl = new FormControl(null, [Validators.required]);
    this.kinhNghiemNhanXetFormControl = new FormControl(null);
    this.nangLucFormControl = new FormControl(null, [Validators.required]);
    this.nangLucNhanXetFormControl = new FormControl(null);
    this.phamChatFormControl = new FormControl(null, [Validators.required]);
    this.phamChatNhanXetFormControl = new FormControl(null);
    this.giaDinhFormControl = new FormControl(null, [Validators.required]);
    this.giaDinhNhanXetFormControl = new FormControl(null);
    this.yeuCauFormControl = new FormControl(null, [Validators.required]);
    this.yeuCauNhanXetFormControl = new FormControl(null);
    this.danhGiaKhacFormControl = new FormControl(null);

    this.danhGiaFormGroup = new FormGroup({
      hocVanFormControl: this.hocVanFormControl,
      hocVanNhanXetFormControl: this.hocVanNhanXetFormControl,
      dungMaoFormControl: this.dungMaoFormControl,
      dungMaoNhanXetFormControl: this.dungMaoNhanXetFormControl,
      kienThucFormControl: this.kienThucFormControl,
      kienThucNhanXetFormControl: this.kienThucNhanXetFormControl,
      kinhNghiemFormControl: this.kinhNghiemFormControl,
      kinhNghiemNhanXetFormControl: this.kinhNghiemNhanXetFormControl,
      nangLucFormControl: this.nangLucFormControl,
      nangLucNhanXetFormControl: this.nangLucNhanXetFormControl,
      phamChatFormControl: this.phamChatFormControl,
      phamChatNhanXetFormControl: this.phamChatNhanXetFormControl,
      giaDinhFormControl: this.giaDinhFormControl,
      giaDinhNhanXetFormControl: this.giaDinhNhanXetFormControl,
      yeuCauFormControl: this.yeuCauFormControl,
      yeuCauNhanXetFormControl: this.yeuCauNhanXetFormControl,
      danhGiaKhacFormControl: this.danhGiaKhacFormControl,
    });


    this.interViewNameFormControl = new FormControl(null, [Validators.required]);
    this.interviewTypeFormControl = new FormControl(1, [Validators.required]);
    this.tieuDeFormControl = new FormControl(null, [Validators.required]);
    this.addressFormControl = new FormControl(null, [Validators.required]);
    this.interviewDateFormControl = new FormControl(null, [Validators.required]);


    this.henPhongVanFormGroup = new FormGroup({
      interViewNameFormControl: this.interViewNameFormControl,
      interviewTypeFormControl: this.interviewTypeFormControl,
      tieuDeFormControl: this.tieuDeFormControl,
      addressFormControl: this.addressFormControl,
      interviewDateFormControl: this.interviewDateFormControl,
    });
  }

  setTable() {
    this.colsFile = [
      { field: 'fileFullName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left' },
    ];

    this.colsHocVan = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'certificate', header: 'T??n b???ng c???p/ch???ng ch???', width: '200px', textAlign: 'left' },
      { field: 'certificatePlace', header: 'Tr?????ng/trung t??m ????o t???o', width: '150px', textAlign: 'left' },
      { field: 'specializedTraining', header: 'Chuy??n ng??nh ????o t???o', width: '150px', textAlign: 'left' },
      { field: 'startDate', header: 'Th???i gian b???t ?????u', width: '100px', textAlign: 'center' },
      { field: 'endDate', header: 'Th???i gian k???t th??c', width: '100px', textAlign: 'center' },
      { field: 'action', header: 'Thao t??c', width: '70px', textAlign: 'center' },
    ];

    this.colsKinhNghiem = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'educationAndWorkExpName', header: 'T??n doanh nghi???p', width: '150px', textAlign: 'left' },
      { field: 'certificatePlace', header: 'Ch???c danh', width: '100px', textAlign: 'left' },
      { field: 'jobDescription', header: 'M?? t??? c??ng vi???c', width: '150px', textAlign: 'left' },
      { field: 'startDate', header: 'Th???i gian b???t ?????u', width: '100px', textAlign: 'center' },
      { field: 'endDate', header: 'Th???i gian k???t th??c', width: '100px', textAlign: 'center' },
      { field: 'action', header: 'Thao t??c', width: '70px', textAlign: 'center' },
    ];

    this.colsNgoaiNgu = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'educationAndWorkExpName', header: 'T??n ngo???i ng???', width: '250px', textAlign: 'left' },
      { field: 'proficiencyLevel', header: 'M???c ????? th??nh th???o', width: '100px', textAlign: 'left' },
      { field: 'action', header: 'Thao t??c', width: '70px', textAlign: 'center' },
    ];

    this.colsTinHoc = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'educationAndWorkExpName', header: 'T??n ???ng d???ng', width: '250px', textAlign: 'left' },
      { field: 'proficiencyLevel', header: 'M???c ????? th??nh th???o', width: '100px', textAlign: 'left' },
      { field: 'action', header: 'Thao t??c', width: '70px', textAlign: 'center' },
    ];

    this.colsNguoiThamKhao = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'educationAndWorkExpName', header: 'T??n ng?????i tham kh???o', width: '200px', textAlign: 'left' },
      { field: 'phone', header: 'S??? ??i???n tho???i', width: '100px', textAlign: 'left' },
      { field: 'specializedTraining', header: 'T??n c??ng ty', width: '150px', textAlign: 'left' },
      { field: 'certificatePlace', header: 'Ch???c danh', width: '100px', textAlign: 'left' },
      { field: 'action', header: 'Thao t??c', width: '70px', textAlign: 'center' },
    ];

    this.colsLichHenPv = [
      { field: 'index', header: '#', width: '5%', textAlign: 'center' },
      { field: 'interviewTitle', header: 'Ti??u ?????', width: '35%', textAlign: 'left' },
      { field: 'interviewType', header: 'Loa??? ph???ng v???n', width: '10%', textAlign: 'center' },
      { field: 'address', header: '?????a ch???/ Link', width: '25%', textAlign: 'left' },
      { field: 'date', header: 'Ng??y ph???ng v???n', width: '15%px', textAlign: 'center' },
      { field: 'action', header: 'Thao t??c', width: '10%', textAlign: 'center' },
    ];

    this.colsDiemTest = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'quizName', header: 'T??n b??i test', width: '150px', textAlign: 'left' },
      { field: 'score', header: 'S??? ??i???m', width: '100px', textAlign: 'center' },
      { field: 'statusName', header: 'K???t qu???', width: '100px', textAlign: 'center' },
      { field: 'action', header: 'Thao t??c', width: '50px', textAlign: 'center' },
    ];

    this.colsDanhGia = [
      { field: 'index', header: '#', width: '30px', textAlign: 'center' },
      { field: 'employeeName', header: 'Ng?????i ????nh gi??', width: '150px', textAlign: 'left' },
      { field: 'statusName', header: 'Tr???ng th??i ????nh gi??', width: '100px', textAlign: 'center' },
      { field: 'createdDate', header: 'Th???i gian ????nh gi??', width: '100px', textAlign: 'center' },
      { field: 'action', header: 'Thao t??c', width: '50px', textAlign: 'center' },
    ];

    this.selectedInterviewColumns = [
      { field: 'index', header: 'STT', width: '30px', textAlign: 'center' },
      { field: 'fullName', header: 'T??n', width: '100px', textAlign: 'left' },
      { field: 'interViewName', header: 'Ng?????i ph???ng v???n', width: '150px', textAlign: 'left' },
      { field: 'interviewType', header: 'Loa??? ph???ng v???n', width: '100px', textAlign: 'left' },
      { field: 'address', header: '?????a ch???/ Link', width: '150px', textAlign: 'left' },
      { field: 'interviewDate', header: 'Ng??y ph???ng v???n', width: '100px', textAlign: 'center' },
    ];
  }

  async getMasterdata() {
    this.loading = true;
    let [createRes, detailRes]: any = await Promise.all([
      this.employeeService.getMasterCreateCandidateAsync(),
      this.employeeService.getMasterCandidateDetailAsync(this.candidateId)
    ]);
    this.loading = false;

    if (createRes.statusCode == 200 && detailRes.statusCode == 200) {
      this.isNguoiPhongVan = detailRes.isNguoiPhongVan;
      this.isNVPhuTrach = detailRes.isNVPhuTrach;
      this.isTruongBoPhan = detailRes.isTruongBoPhan;
      this.loginEmp = detailRes.loginEmp;


      this.listChienDich = createRes.listRecruitmentCampaign;
      this.listVitri = createRes.listVacancies;
      this.listViTriTuyenDung = this.listVitri;
      this.listKenhTuyenDung = createRes.listRecruitmentChannel;
      this.listCertificate = createRes.listCertificate;
      this.listPhuongThucTuyenDung = createRes.listPTTD;

      this.candidateModel = detailRes.candidateModel;
      this.listEmployeeModels = detailRes.listEmployeeModels;
      this.VacancyModel = detailRes.vacancyModel;
      this.RecruitmentCampaignModel = detailRes.recruitmentCampaignModel;
      this.arrayDocumentModel = detailRes.listFileInFolder;
      this.noteHistory = detailRes.listNote;
      this.handleNoteContent();
      this.listOverviewCandidate = detailRes.listOverviewCandidate;

      this.listSessionReview = detailRes.listSessionReview;
      this.listLichHenPv = detailRes.listInterviewSchedule;
      this.listDiemTest = detailRes.listQuiz;

      this.listDanhGia = detailRes.listCandidateAssessment;
      //--1 ?????t - 3 - Kh??ng ?????t-- 2 PV ti???p
      this.listDanhGia.forEach(item => {
        switch (item.status) {
          case 1:
            item.statusName = '?????t';
            break;
          case 2:
            item.statusName = 'PV ti???p';
            break;
          case 3:
            item.statusName = 'Kh??ng ?????t';
            break;
        }
        item.employeeName = item.employeeCode + ' - ' + item.employeeName;
      });
      this.listOverviewCandidate.forEach(item => {
        item.startDate = item.startDate ? new Date(item.startDate) : null;
        item.endDate = item.endDate ? new Date(item.endDate) : null;
        item.isNewLine = false;
      });

      this.listOverviewCandidate.forEach(item => {
        item.startDate = item.startDate ? new Date(item.startDate) : null;
        item.endDate = item.endDate ? new Date(item.endDate) : null;
        item.isNewLine = false;
      });

      this.listDiemTest.forEach(item => {
        switch (item.status) {
          case 1:
            item.statusName = '?????t';
            item.isNewLine = false;
            break;
          case 2:
            item.statusName = 'Kh??ng ?????t';
            item.isNewLine = false;
            break;
        }
      });

      this.listLichHenPv.forEach(item => {

        item.interviewDate = item.interviewDate ? new Date(item.interviewDate) : null;
        let inter = this.listInterviewType.find(c => c.categoryId == item.interviewScheduleType);
        item.scheduleType = inter;
      });
      this.listHocVan = this.listOverviewCandidate.filter(x => x.type == 'HV');
      this.listKinhNghiem = this.listOverviewCandidate.filter(x => x.type == 'KN');
      this.listNgoaiNgu = this.listOverviewCandidate.filter(x => x.type == 'NN');
      this.listTinHoc = this.listOverviewCandidate.filter(x => x.type == 'TH');
      this.listNguoiThamKhao = this.listOverviewCandidate.filter(x => x.type == 'NTK');

      this.mapDataToForm(this.candidateModel);
      this.def.detectChanges();
    }
    else if (createRes.statusCode != 200) {
      this.showMessage('error', createRes.messageCode);
    }
    else if (detailRes.statusCode != 200) {
      this.showMessage('error', detailRes.messageCode);
    }
  }
  changeCertification(event, rowData) {
    rowData.categoryId = event.categoryId;
  }
  onChangeChienDich(chienDichId: string) {
    this.listViTriTuyenDung = this.listVitri.filter(x => x.recruitmentCampaignId == chienDichId);
  }

  danhGia() {
    this.showDanhGia = true;
  }

  goBackToList() {
    this.router.navigate(['/employee/danh-sach-ung-vien']);
  }

  update() {
    if (!this.thongTinUngVIenFormGroup.valid) {
      Object.keys(this.thongTinUngVIenFormGroup.controls).forEach(key => {
        if (this.thongTinUngVIenFormGroup.controls[key].valid == false) {
          this.thongTinUngVIenFormGroup.controls[key].markAsTouched();
        }
      });
    } else {

      // ung vien
      let candidateModel = new CandidateModel();

      candidateModel.candidateId = this.candidateId;

      candidateModel.fullName = this.hoTenFormControl.value ? this.hoTenFormControl.value : '';

      let dob = this.ngaySinhFormControl.value ? convertToUTCTime(this.ngaySinhFormControl.value) : null;
      candidateModel.dateOfBirth = dob;

      candidateModel.phone = this.soDienThoaiFormControl.value ? this.soDienThoaiFormControl.value : '';

      candidateModel.email = this.emailFormControl.value ? this.emailFormControl.value : '';

      candidateModel.address = this.diaChiFormControl.value ? this.diaChiFormControl.value : '';

      let recruitmentChannel = this.kenhTuyenDungFormControl.value ? this.kenhTuyenDungFormControl.value.categoryId : this.emptyGuid;
      candidateModel.recruitmentChannel = recruitmentChannel;

      candidateModel.sex = this.gioiTinhFormControl.value ? this.gioiTinhFormControl.value : 1;

      candidateModel.statusId = this.candidateModel.statusId;

      let ngayUngTuyen = this.ngayUngTuyenFormControl.value ? convertToUTCTime(this.ngayUngTuyenFormControl.value) : null;
      candidateModel.applicationDate = ngayUngTuyen;

      let vacancies = this.viTriUngTuyenFormControl.value.vacanciesId;

      let PhuongThucTuyenDungId = this.phuongThucTuyenDungFormControl.value ? this.phuongThucTuyenDungFormControl.value.categoryId : this.emptyGuid;
      candidateModel.phuongThucTuyenDungId = PhuongThucTuyenDungId;

      candidateModel.mucPhi = (this.coPhiFormControl.value == 2 && this.mucPhiFormControl.value) ? this.mucPhiFormControl.value : 0;

      candidateModel.tomTatHocVan = this.tomTatHocVanFormControl.value ? this.tomTatHocVanFormControl.value : '';


      // list file
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
        fileUpload.FileInFolder.objectType = 'CDTD';
        fileUpload.FileSave = item;
        listFileUploadModel.push(fileUpload);
      });


      this.loading = true;
      this.awaitResult = true;

      this.employeeService.updateCandidate(candidateModel, vacancies, "UV", listFileUploadModel).subscribe(response => {
        let result = <any>response;
        this.loading = false;
        if (result.statusCode === 202 || result.statusCode === 200) {

          this.showMessage('success', 'C???p nh???t ???ng vi??n th??nh c??ng');
          setTimeout(() => {
            this.getMasterdata();
          }, 1000)
          this.awaitResult = false;
        }
        else {
          let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage('error', result.messageCode);
          this.awaitResult = false;
        };
      });
    }
  }

  mapDataToForm(candidateModel: CandidateModel) {
    this.hoTenFormControl.setValue(candidateModel.fullName);

    this.ngaySinhFormControl.setValue(candidateModel.dateOfBirth ? new Date(candidateModel.dateOfBirth) : null);

    this.gioiTinhFormControl.setValue(candidateModel.sex);

    this.soDienThoaiFormControl.setValue(candidateModel.phone);

    this.emailFormControl.setValue(candidateModel.email);

    this.ngayUngTuyenFormControl.setValue(candidateModel.applicationDate ? new Date(candidateModel.applicationDate) : null);

    this.diaChiFormControl.setValue(candidateModel.address);

    let chiendich = this.listChienDich.find(x => x.recruitmentCampaignId == this.RecruitmentCampaignModel.recruitmentCampaignId);
    this.chienDichUngTuyenFormControl.setValue(chiendich ? chiendich : null);

    let vitri = this.listViTriTuyenDung.find(x => x.vacanciesId == this.VacancyModel.vacanciesId);
    this.viTriUngTuyenFormControl.setValue(vitri ? vitri : null);

    let kenhtd = this.listKenhTuyenDung.find(x => x.categoryId == candidateModel.recruitmentChannel);
    this.kenhTuyenDungFormControl.setValue(kenhtd ? kenhtd : null);


    let phuongthuc = this.listPhuongThucTuyenDung.find(x => x.categoryId == candidateModel.phuongThucTuyenDungId);
    this.phuongThucTuyenDungFormControl.setValue(phuongthuc ? phuongthuc : null);
    this.coPhiFormControl.setValue((candidateModel.mucPhi && candidateModel.mucPhi > 0) ? 2 : 1);
    this.mucPhiFormControl.setValue((candidateModel.mucPhi && candidateModel.mucPhi > 0) ? candidateModel.mucPhi : null);

    this.tomTatHocVanFormControl.setValue(candidateModel.tomTatHocVan ? candidateModel.tomTatHocVan : null);
  }

  onChangeAction(candidateId: string) {

    this.actions = [];

    let item: MenuItem = {
      id: '0', label: '?????t ph???ng v???n', command: () => {
        this.confirmationService.confirm({
          message: `B???n c?? ch???c ch???n mu???n chuy???n tr???ng th??i cho ???ng vi??n n??y?`,
          accept: async () => {
            this.updateStatus(3);
          }
        });
      }
    }
    //this.actions.push(item);

    let item1: MenuItem = {
      id: '1', label: 'H???n ph???ng v???n', command: () => {
        this.addInterviewSchedule();
      }
    }
    // this.actions.push(item1);

    let item2: MenuItem = {
      id: '2', label: 'G???i offer', command: () => {
        this.listCandidatePV = []
        this.listCandidatePV = [
          {
            interviewScheduleId: this.emptyGuid,
            vacanciesId: this.VacancyModel.vacanciesId,
            candidateId: this.candidateId,
            fullName: this.candidateModel.fullName,
            interviewTitle: this.tieuDeFormControl.value,
            interviewDate: null,
            address: '',
            email: this.emailFormControl.value == null ? '' : this.emailFormControl.value,
            interviewScheduleType: 1,
            listEmployeeId: [],
          }
        ]

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

              lstCandidateId.push(this.candidateId);
              let result: any = await this.employeeService.updateStatusCandidateFromVacancies(lstCandidateId, 4, this.VacancyModel.vacanciesId);
              if (result.statusCode == 200) {

                this.loading = false;
                //this.showMessage('success', 'C???p nh???p tr???ng th??i th??nh c??ng.');
              }
              else
                this.loading = false;
            }
          }
          this.listCandidatePV = []
        });
      }
    }

    let item3: MenuItem = {
      id: '3', label: 'T??? ch???i offer', command: () => {
        this.confirmationService.confirm({
          message: `B???n c?? ch???c ch???n mu???n chuy???n tr???ng th??i cho ???ng vi??n n??y?`,
          accept: async () => {
            this.updateStatus(5);
          }
        });

      }
    }

    let item4: MenuItem = {
      id: '4', label: 'Kh??ng ?????t', command: () => {
        this.listCandidatePV = []
        this.listCandidatePV = [
          {
            interviewScheduleId: this.emptyGuid,
            vacanciesId: this.VacancyModel.vacanciesId,
            candidateId: this.candidateId,
            fullName: this.candidateModel.fullName,
            interviewTitle: this.tieuDeFormControl.value,
            interviewDate: null,
            address: '',
            email: this.emailFormControl.value == null ? '' : this.emailFormControl.value,
            interviewScheduleType: 1,
            listEmployeeId: [],
          }
        ]
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
              lstCandidateId.push(this.candidateId);
              let result: any = await this.employeeService.updateStatusCandidateFromVacancies(lstCandidateId, 6, this.VacancyModel.vacanciesId);
              if (result.statusCode == 200) {

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

    let item5: MenuItem = {
      id: '5', label: 'Chuy???n th??nh NV', command: () => {
        this.convertToEmployee();
      }
    }

    let item6: MenuItem = {
      id: '6', label: 'X??a', command: () => {
        this.confirmationService.confirm({
          message: `B???n c?? ch???c ch???n mu???n x??a ???ng vi??n n??y?`,
          accept: async () => {
            this.awaitResult = true;
            this.employeeService.deleteCandidate(this.candidateId, this.VacancyModel.vacanciesId).subscribe(response => {
              let result = <any>response;
              this.loading = false;
              if (result.statusCode === 202 || result.statusCode === 200) {
                this.showMessage('success', 'X??a ???ng vi??n th??nh c??ng');
                setTimeout(() => {
                  this.router.navigate(['/employee/danh-sach-ung-vien']);
                }, 500)
                this.awaitResult = false;
              }
              else {
                let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
                this.showMessage('error', result.messageCode);
                this.awaitResult = false;
              };
            });
          }
        });
      }
    }
    //this.actions.push(item6);


    // Tr???ng th??i c???a t???ng d??ng
    switch (this.candidateModel.statusId) {
      case 1:// M???i
        this.actions.push(item1);// h???n PV
        this.actions.push(item5);// Chuy???n NV
        this.actions.push(item6);// X??a
        break;
      case 2:  // H???n ph???ng v???n
        this.actions.push(item1);// h???n PV
        this.actions.push(item);// ?????t PV
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
        this.actions.push(item);// ?????t PV
        break;
    }
  }

  // CHUY???N TH??NH NV / TH??? VI???C
  convertToEmployee() {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n chuy???n ???ng vi??n th??nh nh??n vi??n kh??ng?',
      accept: () => {
        if (this.candidateModel.fullName == null || this.candidateModel.sex == null) {
          this.showMessage('error', 'Vui l??ng nh???p t??n v?? ch???n gi???i t??nh cho ???ng vi??n.');
          return;

        }
        // Split t??n ???ng vi??n
        let tenKhongDau = cleanAccents(this.candidateModel.fullName);
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
        lstCandidateId.push(this.candidateId);

        // L???y gi?? tr??? cho employee model
        this.employeeModel.HoTenTiengAnh = this.candidateModel.fullName.trim();
        this.employeeModel.CreatedDate = new Date();
        this.employeeModel.QuocTich = '';
        this.employeeModel.DanToc = '';
        this.employeeModel.TonGiao = '';
        this.employeeModel.StartDateMayChamCong = new Date();
        this.employeeModel.PositionId = this.emptyGuid;

        this.employeeModel.TomTatHocVan = this.candidateModel.tomTatHocVan;
        this.employeeModel.PhuongThucTuyenDungId = this.candidateModel.phuongThucTuyenDungId;
        this.employeeModel.MucPhi = this.candidateModel.mucPhi;
        let isAccessable = true;

        // L???y gi?? tr??? cho contact employee
        this.contactModel.ContactId = this.emptyGuid;
        this.contactModel.ObjectId = this.emptyGuid;

        this.contactModel.CreatedDate = new Date();
        this.contactModel.CreatedById = this.auth.UserId;
        this.contactModel.FirstName = this.candidateModel.fullName.trim()
        this.contactModel.LastName = '';
        this.contactModel.Email = this.candidateModel.email;
        this.contactModel.Phone = this.candidateModel.phone;
        this.contactModel.Gender = this.candidateModel.sex.toString();
        this.contactModel.CreatedById = this.auth.UserId;
        this.contactModel.CreatedDate = new Date();

        // Accoutn ????ng nh???p
        this.userModel.UserName = accountName;
        //this.userModel.Password = "1";

        //List Ph??ng ban
        let listPhongBanId: Array<any> = [];

        this.loading = true;
        this.awaitResult = true;

        let fileBase64 = {
          "Extension": null, /*?????nh d???ng ???nh (jpg, png,...)*/
          "Base64": null /*?????nh d???ng base64 c???a ???nh*/
        }

        this.employeeService.createEmployee(this.employeeModel, this.contactModel, this.userModel, isAccessable, listPhongBanId, true, fileBase64, this.candidateId).subscribe(response => {
          let result = <any>response;
          this.loading = false;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.showMessage('success', 'Chuy???n ?????i NV th??nh c??ng.');
            // chuy???n v??? danh s??ch ???ng vi??n
            setTimeout(() => {
              this.router.navigate(['/employee/detail', { employeeId: result.employeeId, contactId: result.contactId }]);
            }, 1000);
          }
          else {
            this.showMessage('error', result.message);
            this.awaitResult = false;
          };
        });
        this.displayRejectEmail = true;
      }
    });
  }

  // T???o l???ch PV cho 1 ho???c nhi???u -- N??t tr??n header
  addInterviewSchedule() {
    this.listCandidatePV = []
    this.displayAddInterviewSche = true;
    this.henPhongVanFormGroup.reset();
    // Ti??u ????? ph???ng v???n
    let title = 'Ph???ng v???n ' + this.listViTriTuyenDung.find(x => x.vacanciesId == this.VacancyModel.vacanciesId).vacanciesName;
    this.tieuDeFormControl.setValue(title);
    this.listCandidatePV = [
      {
        interviewScheduleId: this.emptyGuid,
        vacanciesId: this.VacancyModel.vacanciesId,
        candidateId: this.candidateId,
        fullName: this.candidateModel.fullName,
        interviewTitle: this.tieuDeFormControl.value,
        interviewDate: null,
        address: '',
        email: this.emailFormControl.value == null ? '' : this.emailFormControl.value,
        interviewScheduleType: 1,
        listEmployeeId: [],
      }
    ]
  }

  updateStatus(status: number) {
    this.loading = true;
    this.awaitResult = true;
    this.employeeService.updateCandidateStatus(this.candidateId, status).subscribe(response => {
      let result = <any>response;
      this.loading = false;
      if (result.statusCode === 202 || result.statusCode === 200) {
        this.showMessage('success', 'C???p nh???t tr???ng th??i ???ng vi??n th??nh c??ng');
        setTimeout(() => {
          this.getMasterdata();
        }, 1000)
        this.awaitResult = false;
      }
      else {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage('error', result.messageCode);
        this.awaitResult = false;
      };
    });
  }

  addRow(mode: string) {
    let overviewCandidate: OverviewCandidate = {
      overviewCandidateId: this.emptyGuid,
      candidateId: this.candidateId,
      educationAndWorkExpName: '',
      certificatePlace: '',
      specializedTraining: '',
      jobDescription: '',
      startDate: null,
      endDate: null,
      phone: '',
      type: '',
      proficiencyLevel: '',
      isNewLine: true,
    }

    switch (mode) {
      case 'HV':
        overviewCandidate.type = 'HV'
        this.listHocVan.push(overviewCandidate);
        break;
      case 'KN':
        overviewCandidate.type = 'KN'
        this.listKinhNghiem.push(overviewCandidate);
        break;
      case 'NN':
        overviewCandidate.type = 'NN'
        this.listNgoaiNgu.push(overviewCandidate);
        break;
      case 'TH':
        overviewCandidate.type = 'TH'
        this.listTinHoc.push(overviewCandidate);
        break
      case 'NTK':
        overviewCandidate.type = 'NTK'
        this.listNguoiThamKhao.push(overviewCandidate);
        break;
      case 'LH':
        this.henPhongVanFormGroup.reset();
        this.tieuDeFormControl.setValue(`Ph???ng v???n ${this.VacancyModel.vacanciesName} - ${this.datepipe.transform(this.today, 'dd/MM/yyyy')}`)
        this.listCandidatePV = [
          {
            interviewScheduleId: this.emptyGuid,
            vacanciesId: this.VacancyModel.vacanciesId,
            candidateId: this.candidateId,
            fullName: this.candidateModel.fullName,
            interviewTitle: this.tieuDeFormControl.value,
            interviewDate: null,
            address: '',
            email: this.emailFormControl.value == null ? '' : this.emailFormControl.value,
            interviewScheduleType: 1,
            listEmployeeId: [],
          }
        ]
        this.displayAddInterviewSche = true;
        break;
      case 'TEST':
        let test = {
          quizId: '',
          vacanciesId: '',
          candidateId: '',
          quizName: '',
          score: null,
          status: null,
          isNewLine: true,
        };
        this.listDiemTest.push(test);
        break;
      case 'DANHGIAUV':
        this.showDanhGia = true;
        this.resetReviewForm();
        break;
    }
  }
  resetReviewForm() {
    this.danhGiaFormGroup.reset();
    this.selectedCandidateAss = null;
    this.def.detectChanges()
  }

  closeReviewCandidate() {
    this.showDanhGia = false;
    this.selectedCandidateAss = null;
    this.def.detectChanges();
  }
  // Xem - s???a ????nh gi??
  showDetailReview(rowData: any) {
    //Ng?????i ph???ng v???n kh??ng xem ???????c ????nh gi?? c???a ng?????i kh??c
    if (this.loginEmp != rowData.employeeId && this.isNguoiPhongVan && !this.isTruongBoPhan && !this.isNVPhuTrach) {
      return this.showMessage('warn', 'Kh??ng th??? xem ????nh gi?? c???a ng?????i kh??c');
    }
    //Kh??ng ???????c s???a ????nh gi?? c???a ng?????i kh??c ( ???n button )
    if (this.loginEmp != rowData.employeeId) {
      this.isSuaDanhGia = false;
    }
    this.selectedCandidateAss = rowData;
    this.showDanhGia = true;
    rowData.candidateAssessmentDetail.forEach(detail => {
      switch (detail.sortOrder) {
        case 1:
          this.hocVanFormControl.setValue(detail.rating);
          this.hocVanNhanXetFormControl.setValue(detail.review);
          break;
        case 2:
          this.dungMaoFormControl.setValue(detail.rating);
          this.dungMaoNhanXetFormControl.setValue(detail.review);
          break;
        case 3:
          this.kienThucFormControl.setValue(detail.rating);
          this.kienThucNhanXetFormControl.setValue(detail.review);
          break;
        case 4:
          this.kinhNghiemFormControl.setValue(detail.rating);
          this.kinhNghiemNhanXetFormControl.setValue(detail.review);
          break;
        case 5:
          this.nangLucFormControl.setValue(detail.rating);
          this.nangLucNhanXetFormControl.setValue(detail.review);
          break;
        case 6:
          this.phamChatFormControl.setValue(detail.rating);
          this.phamChatNhanXetFormControl.setValue(detail.review);
          break;
        case 7:
          this.giaDinhFormControl.setValue(detail.rating);
          this.giaDinhNhanXetFormControl.setValue(detail.review);
          break;
        case 8:
          this.yeuCauFormControl.setValue(detail.rating);
          this.yeuCauNhanXetFormControl.setValue(detail.review);
          break;
      }
    });

    this.danhGiaKhacFormControl.setValue(rowData.otherReview);
  }

  deleteCandidateAss(rowData: any) {
    this.confirmationService.confirm({
      message: `B???n c?? ch???n mu???n x??a ????nh gi?? n??y kh??ng?`,
      accept: async () => {
        this.loading = true;
        if (this.loginEmp != rowData.employeeId) {
          this.loading = false;
          return this.showMessage('warn', 'Kh??ng th??? x??a ????nh gi?? c???a ng?????i kh??c');
        }
        //let result: any = this.employeeService.deleteCandidateAssessment(rowData.candidateAssessmentId);
        this.employeeService.deleteCandidateAssessment(rowData.candidateAssessmentId).subscribe(res => {
          let result: any = res;
          if (result.statusCode === 200) {

            this.loading = false;
            const index = this.listDanhGia.findIndex(obj => obj.candidateAssessmentId === rowData.candidateAssessmentId);
            this.listDanhGia.splice(index, 1);

            this.def.detectChanges();
            this.showMessage('success', 'X??a ????nh gi?? ???ng vi??n th??nh c??ng');
          }
          else {

            this.loading = false;
            this.showMessage('error', result.messageCode);
          };
        })
      }
    });
  }
  // ????nh gi?? ???ng vi??n
  reviewCandidate(type: number) {

    let candidateModel: CandidateAssessment = new CandidateAssessment();
    if (this.selectedCandidateAss != null) {
      candidateModel.CandidateAssessmentId = this.selectedCandidateAss.candidateAssessmentId;
      candidateModel.VacanciesId = this.selectedCandidateAss.vacanciesId;
      candidateModel.CandidateId = this.selectedCandidateAss.candidateId;
    }
    else {
      candidateModel.CandidateAssessmentId = this.emptyGuid;
      candidateModel.CandidateId = this.candidateId;
      candidateModel.VacanciesId = this.VacancyModel.vacanciesId;
    }
    candidateModel.Status = type; // 1 ?????t ---- 2 PV ti???p  --- 3 Kh??ng ?????t
    candidateModel.OtherReview = this.danhGiaKhacFormControl.value;
    candidateModel.EmployeeId = this.auth.UserId;

    let listDetailReview: Array<CandidateAssessmentDetail> = this.mappingCandidateAssessmentDetailToModel();
    this.awaitResult = true;

    this.employeeService.createOrUpdateCandidateAssessment(candidateModel, listDetailReview).subscribe(res => {
      let result: any = res;
      if (result.statusCode === 200) {
        this.loading = false;
        this.showDanhGia = false;
        this.listDanhGia = result.listCandidateAssessment;
        //--1 ?????t - 3 - Kh??ng ?????t-- 2 PV ti???p
        this.listDanhGia.forEach(item => {
          switch (item.status) {
            case 1:
              item.statusName = '?????t';
              break;
            case 2:
              item.statusName = 'PV ti???p';
              break;
            case 3:
              item.statusName = 'Kh??ng ?????t';
              break;
          }
          item.employeeName = item.employeeCode + ' - ' + item.employeeName;
        });
        this.def.detectChanges();
        this.showMessage('success', '????nh gi?? ???ng vi??n th??nh c??ng');
        this.awaitResult = false;
      }
      else {
        this.loading = false;
        this.showDanhGia = false;
        this.showMessage('error', "????nh gi?? ???ng vi??n th???t b???i.");
        this.awaitResult = false;
      };
    })
  }

  mappingCandidateAssessmentDetailToModel(): Array<CandidateAssessmentDetail> {

    let candidateAssessmentDetailModel = new Array<CandidateAssessmentDetail>();
    this.listSessionReview.forEach(session => {
      let obj = new CandidateAssessmentDetail();
      obj.CandidateAssessmentDetailId = this.emptyGuid;
      obj.CandidateAssessmentId = this.emptyGuid;
      obj.ReviewsSectionId = session.categoryId;
      obj.SortOrder = session.sortOrder;

      switch (session.sortOrder) {
        case 1:
          obj.Rating = this.hocVanFormControl.value;
          obj.Review = this.hocVanNhanXetFormControl.value;
          break;
        case 2:
          obj.Rating = this.dungMaoFormControl.value;
          obj.Review = this.dungMaoNhanXetFormControl.value;
          break;
        case 3:
          obj.Rating = this.kienThucFormControl.value;
          obj.Review = this.kienThucNhanXetFormControl.value;
          break;
        case 4:
          obj.Rating = this.kinhNghiemFormControl.value;
          obj.Review = this.kinhNghiemNhanXetFormControl.value;
          break;
        case 5:
          obj.Rating = this.nangLucFormControl.value;
          obj.Review = this.nangLucNhanXetFormControl.value;
          break;
        case 6:
          obj.Rating = this.phamChatFormControl.value;
          obj.Review = this.phamChatNhanXetFormControl.value;
          break;
        case 7:
          obj.Rating = this.giaDinhFormControl.value;
          obj.Review = this.giaDinhNhanXetFormControl.value;
          break;
        case 8:
          obj.Rating = this.yeuCauFormControl.value;
          obj.Review = this.yeuCauNhanXetFormControl.value;
          break;
      }
      candidateAssessmentDetailModel.push(obj);
    });

    return candidateAssessmentDetailModel;
  }

  onRowEditInit(rowData: any, mode: string) {

    switch (mode) {
      case 'TQ':
        this.clonedData[rowData.overviewCandidateId] = { ...rowData };
        break;
      case 'LH':
        this.clonedData[rowData.interviewScheduleId] = { ...rowData };
        break;
      case 'TEST':
        this.clonedData[rowData.quizId] = { ...rowData };
        break;
      case 'NX':
        this.clonedData[rowData.candidateAssessmentId] = { ...rowData };
        break;
      // Tab t???ng quan
      case 'HV':
        this.clonedData[rowData.overviewCandidateId] = { ...rowData };
        break;
      case 'KN':
        this.clonedData[rowData.overviewCandidateId] = { ...rowData };
        break;
      case 'NN':
        this.clonedData[rowData.overviewCandidateId] = { ...rowData };
        break;
      case 'TH':
        this.clonedData[rowData.overviewCandidateId] = { ...rowData };
        break;
      case 'NTK':
        this.clonedData[rowData.overviewCandidateId] = { ...rowData };
        break;
    }
    this.def.detectChanges();
  }

  onRowEditSave(rowData: any, type: string) {

    this.confirmationService.confirm({
      message: `B???n c?? ch???c ch???n mu???n thay ?????i`,
      accept: async () => {

        this.loading = true;
        switch (type) {
          case 'TQ':
            rowData.startDate = rowData.startDate ? convertToUTCTime(rowData.startDate) : null;
            rowData.endDate = rowData.endDate ? convertToUTCTime(rowData.endDate) : null;

            let result: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);
            this.loading = false;
            if (result.statusCode == 202 || result.statusCode == 200) {
              if (rowData.isNewLine) {
                rowData.overviewCandidateId = result.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', result.messageCode);
            }
            break;
          case 'LH':

            rowData.interviewScheduleType = rowData.interviewScheduleType.categoryId;
            let resultLH: any = await this.employeeService.updateInterviewScheduleAsync(rowData);

            this.loading = false;
            if (resultLH.statusCode == 202 || resultLH.statusCode == 200) {
              if (rowData.isNewLine) {
                // rowData.overviewCandidateId = resultLH.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', resultLH.messageCode);
            }
            break;
          case 'TEST':

            rowData.candidateId = this.candidateId;
            rowData.quizId = rowData.quizId == '' ? this.emptyGuid : rowData.quizId;
            rowData.vacanciesId = this.VacancyModel.vacanciesId;
            rowData.status = rowData.status.value
            rowData.score = ParseStringToFloat(rowData.score);
            let resultQuiz: any = await this.employeeService.createOrUpdateQuiz(rowData);

            this.loading = false;
            if (resultQuiz.statusCode == 202 || resultQuiz.statusCode == 200) {

              if (rowData.isNewLine) {
                rowData.quizId = resultQuiz.quizId;
                rowData.isNewLine = false;
              }
              switch (rowData.status) {
                case 1:
                  rowData.statusName = '?????t';
                  break;
                case 2:
                  rowData.statusName = 'Kh??ng ?????t';
                  break;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', resultQuiz.messageCode);
            }
            break;
          case 'NX':
            {
              rowData.startDate = rowData.startDate ? convertToUTCTime(rowData.startDate) : null;
              rowData.endDate = rowData.endDate ? convertToUTCTime(rowData.endDate) : null;

              let resultNX: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);

              this.loading = false;
              if (resultNX.statusCode == 202 || resultNX.statusCode == 200) {
                if (rowData.isNewLine) {
                  rowData.overviewCandidateId = resultNX.overviewCandidateId;
                  rowData.isNewLine = false;
                }
                this.showMessage('success', 'C???p nh???t th??nh c??ng');
              } else {
                this.loading = false;
                this.showMessage('error', resultNX.messageCode);
              }
              break;
            }

          // tab h???c v???n
          case 'HV':
            if (rowData.endDate == null) {
              this.loading = false;
              this.showMessage('error', "Vui l??ng nh???p ng??y k???t th??c.");
              return;
            }
            if (rowData.startDate == null) {
              this.loading = false;
              this.showMessage('error', "Vui l??ng nh???p ng??y b???t ?????u.");
              return;
            }

            if (rowData.overviewCandidateId != this.emptyGuid) {
              rowData.candidateId = this.candidateId;
              rowData.certificateId = rowData.categoryId;
              rowData.certificate = rowData.certificate.categoryName;
              rowData.educationAndWorkExpName = '';
              rowData.certificatePlace = rowData.certificatePlace;
              rowData.specializedTraining = rowData.specializedTraining;
              rowData.startDate = rowData.startDate ? convertToUTCTime(rowData.startDate) : null;
              rowData.endDate = rowData.endDate ? convertToUTCTime(rowData.endDate) : null;
              rowData.type = type;
              rowData.createdDate = new Date();
              rowData.createdById = this.auth.UserId;
            }
            else {
              rowData.overviewCandidateId = this.emptyGuid
              rowData.candidateId = this.candidateId;
              rowData.educationAndWorkExpName = '';
              rowData.certificate = rowData.certificate.categoryName;
              rowData.certificateId = rowData.categoryId;
              rowData.certificatePlace = rowData.certificatePlace;
              rowData.specializedTraining = rowData.specializedTraining;
              rowData.startDate = rowData.startDate ? convertToUTCTime(rowData.startDate) : null;
              rowData.endDate = rowData.endDate ? convertToUTCTime(rowData.endDate) : null;
              rowData.type = type;
              rowData.createdDate = new Date();
              rowData.createdById = this.auth.UserId;
            }
            if (CompareDateNow(rowData.endDate, rowData.startDate)) {
              this.loading = false;
              this.showMessage('error', "Th???i gian b???t ?????u ph???i l???n h??n ng??y k???t th??c.");
              return;
            }
            let hocVan: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);

            this.loading = false;
            if (hocVan.statusCode == 202 || hocVan.statusCode == 200) {
              if (rowData.isNewLine) {
                rowData.overviewCandidateId = hocVan.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', hocVan.message);
            }
            break;
          case 'KN':


            rowData.candidateId = this.candidateId;
            rowData.educationAndWorkExpName = rowData.educationAndWorkExpName;
            rowData.certificatePlace = rowData.certificatePlace;
            rowData.jobDescription = rowData.jobDescription;
            rowData.startDate = rowData.startDate ? convertToUTCTime(rowData.startDate) : null;
            rowData.endDate = rowData.endDate ? convertToUTCTime(rowData.endDate) : null;
            rowData.type = type;
            let kinhnghiem: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);

            this.loading = false;
            if (kinhnghiem.statusCode == 202 || kinhnghiem.statusCode == 200) {
              if (rowData.isNewLine) {
                rowData.overviewCandidateId = kinhnghiem.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', kinhnghiem.message);
            }
            break;
          case 'NN':

            rowData.candidateId = this.candidateId;
            rowData.educationAndWorkExpName = rowData.educationAndWorkExpName;
            rowData.proficiencyLevel = rowData.proficiencyLevel;
            rowData.type = type;
            let ngoaingu: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);

            this.loading = false;
            if (ngoaingu.statusCode == 202 || ngoaingu.statusCode == 200) {
              if (rowData.isNewLine) {
                rowData.overviewCandidateId = ngoaingu.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', ngoaingu.message);
            }
            break;
          case 'TH':

            rowData.candidateId = this.candidateId;
            rowData.educationAndWorkExpName = rowData.educationAndWorkExpName;
            rowData.proficiencyLevel = rowData.proficiencyLevel;
            rowData.type = type;
            let tinhoc: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);

            this.loading = false;
            if (tinhoc.statusCode == 202 || tinhoc.statusCode == 200) {
              if (rowData.isNewLine) {
                rowData.overviewCandidateId = tinhoc.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', tinhoc.message);
            }
            break;
          case 'NTK':

            if (! /^[0-9]+$/.test(rowData.phone)) {
              this.loading = false;
              this.showMessage('error', "Sai ?????nh d???ng s??? ??i???n tho???i!");
              return;
            }
            rowData.candidateId = this.candidateId;
            rowData.phone = rowData.phone;
            rowData.specializedTraining = rowData.specializedTraining;
            rowData.certificatePlace = rowData.certificatePlace;
            rowData.type = type;
            let nguoiLienHe: any = await this.employeeService.createOrUpdateCandidateDetailInfor(rowData);

            this.loading = false;
            if (nguoiLienHe.statusCode == 202 || nguoiLienHe.statusCode == 200) {
              if (rowData.isNewLine) {
                rowData.overviewCandidateId = nguoiLienHe.overviewCandidateId;
                rowData.isNewLine = false;
              }
              this.showMessage('success', 'C???p nh???t th??nh c??ng');
            } else {
              this.loading = false;
              this.showMessage('error', nguoiLienHe.message);
            }
            break;
          default:
            this.loading = false;
            break;
        }
      }
    });
  }

  onRowEditCancel(rowData: any, mode: string) {
    switch (mode) {
      case 'HV':
      case 'KN':
      case 'NN':
      case 'TH':
      case 'NTK':
        Object.keys(this.clonedData).forEach(key => {
          if (key == rowData.overviewCandidateId) {
            rowData.overviewCandidateId = this.clonedData[key].overviewCandidateId;
            rowData.candidateId = this.clonedData[key].candidateId;
            rowData.educationAndWorkExpName = this.clonedData[key].educationAndWorkExpName;
            rowData.certificatePlace = this.clonedData[key].certificatePlace;
            rowData.certificateId = this.clonedData[key].certificateId;
            rowData.certificate = this.clonedData[key].certificate;
            rowData.specializedTraining = this.clonedData[key].specializedTraining;
            rowData.jobDescription = this.clonedData[key].jobDescription;
            rowData.startDate = this.clonedData[key].startDate;
            rowData.endDate = this.clonedData[key].endDate;
            rowData.phone = this.clonedData[key].phone;
            rowData.type = this.clonedData[key].type;
          }
        });
        break;
      case 'TEST':
        Object.keys(this.clonedData).forEach(key => {
          if (key == rowData.QuizId) {
            rowData.VacanciesId = this.clonedData[key].VacanciesId;
            rowData.CandidateId = this.clonedData[key].CandidateId;
            rowData.QuizName = this.clonedData[key].QuizName;
            rowData.Score = this.clonedData[key].Score;
            rowData.Status = this.clonedData[key].Status;
          }
        });
        break;
    }
  }

  async onRowRemove(rowData: any, mode: string) {
    if (!rowData.isNewLine) {
      this.confirmationService.confirm({
        message: `B???n c?? ch???c ch???n x??a d??ng n??y?`,
        accept: async () => {
          switch (mode) {
            case 'HV':
              this.loading = true;
              let resultNV: any = await this.employeeService.deleteCandidateDetailInfor(rowData.overviewCandidateId);
              this.loading = false;

              if (resultNV.statusCode === 200 || resultNV.statusCode === 202) {
                this.listHocVan = this.listHocVan.filter(e => e != rowData);
                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultNV.messageCode);
              }
              break;
            case 'KN':
              this.loading = true;
              let resultKN: any = await this.employeeService.deleteCandidateDetailInfor(rowData.overviewCandidateId);
              this.loading = false;

              if (resultKN.statusCode === 200 || resultKN.statusCode === 202) {
                this.listKinhNghiem = this.listKinhNghiem.filter(e => e != rowData);
                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultKN.messageCode);
              }
              break;
            case 'NN':
              this.loading = true;
              let resultNN: any = await this.employeeService.deleteCandidateDetailInfor(rowData.overviewCandidateId);
              this.loading = false;

              if (resultNN.statusCode === 200 || resultNN.statusCode === 202) {
                this.listNgoaiNgu = this.listNgoaiNgu.filter(e => e != rowData);
                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultNN.messageCode);
              }
              break;
            case 'TH':
              this.loading = true;
              let resultTH: any = await this.employeeService.deleteCandidateDetailInfor(rowData.overviewCandidateId);
              this.loading = false;

              if (resultTH.statusCode === 200 || resultTH.statusCode === 202) {
                this.listTinHoc = this.listTinHoc.filter(e => e != rowData);

                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultTH.messageCode);
              }
              break
            case 'NTK':
              this.loading = true;
              let resultNTK: any = await this.employeeService.deleteCandidateDetailInfor(rowData.overviewCandidateId);
              this.loading = false;

              if (resultNTK.statusCode === 200 || resultNTK.statusCode === 202) {

                this.listNguoiThamKhao = this.listNguoiThamKhao.filter(e => e != rowData);
                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultNTK.messageCode);
              }
              break;
            case 'LH':
              this.loading = true;
              let resultLH: any = await this.employeeService.deleteInterviewScheduleAsync(rowData.interviewScheduleId);
              this.loading = false;

              if (resultLH.statusCode === 200 || resultLH.statusCode === 202) {
                this.listLichHenPv = this.listLichHenPv.filter(e => e != rowData);
                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultLH.messageCode);
              }
              break;
            case 'TEST':
              this.loading = true;
              let resultQuiz: any = await this.employeeService.deleteQuiz(rowData.quizId);
              this.loading = false;

              if (resultQuiz.statusCode === 200 || resultQuiz.statusCode === 202) {
                this.listDiemTest = this.listDiemTest.filter(e => e != rowData);
                this.showMessage('success', 'X??a d??? li???u th??nh c??ng');
              }
              else {
                this.showMessage('error', resultQuiz.messageCode);
              }
              break;
          }
        }
      });
    }
    else {
      switch (mode) {
        case 'HV':
          this.listHocVan = this.listHocVan.filter(e => e != rowData);
          break;
        case 'KN':
          this.listKinhNghiem = this.listKinhNghiem.filter(e => e != rowData);
          break;
        case 'NN':
          this.listNgoaiNgu = this.listNgoaiNgu.filter(e => e != rowData);
          break;
        case 'TH':
          this.listTinHoc = this.listTinHoc.filter(e => e != rowData);
          break
        case 'NTK':
          this.listNguoiThamKhao = this.listNguoiThamKhao.filter(e => e != rowData);
          break;
        case 'LH':
          this.listLichHenPv = this.listLichHenPv.filter(e => e != rowData);
          break;
        case 'TEST':
          this.listDiemTest = this.listDiemTest.filter(e => e != rowData);
          break;
      }
    }
  }

  async saveAddIntervivewSheDialog() {

    if (!this.henPhongVanFormGroup.valid) {
      Object.keys(this.henPhongVanFormGroup.controls).forEach(key => {
        if (this.henPhongVanFormGroup.controls[key].valid == false) {
          this.henPhongVanFormGroup.controls[key].markAsTouched();
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
      //     emailType: 'PHONG_VAN',
      //     screenType: "UNGVIEN"
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
      let resultInter: any = await this.employeeService.createInterviewSchedule(lstInterviewModel, "UNGVIEN");

      if (resultInter.statusCode == 200) {

        this.loading = false;
        this.displayAddInterviewSche = false;
        this.listLichHenPv = []
        this.listLichHenPv = resultInter.listInterviewSchedule;
        this.listLichHenPv.forEach(item => {
          item.interviewDate = item.interviewDate ? new Date(item.interviewDate) : null;
        });
        this.def.detectChanges();
        this.showMessage('success', 'T???o l???ch ph???ng v???n th??nh c??ng.');
      }

      this.month = ((new Date).getMonth() + 1).toString();
      this.year = (new Date).getFullYear();

      let listInvalidEmail: Array<string> = resultInter.listInvalidEmail;
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
      this.showMessage('success', 'G???i email th??nh c??ng');
      //     }
      //   }
      // });
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
    emailData.vancaciesName = this.VacancyModel.vacanciesName;

    let nguoiPT = this.listEmployeeModels.find(e => e.employeeId == this.VacancyModel.personInChargeId);
    if (nguoiPT != undefined) {
      // Ng?????i ph??? tr??ch
      emailData.personInChagerName = nguoiPT.employeeName;
      emailData.personInChagerPhone = nguoiPT.phone;
    }

    emailData.workplace = this.VacancyModel.placeOfWork;

    this.listCandidatePV = []
    return emailData;
  }

  mappingInterviewSheduleFormToModel() {

    let lstInterviewModel = new Array<InterviewSheduleModel>();
    this.listCandidatePV.forEach(item => {

      let interviewModel = new InterviewSheduleModel();
      interviewModel.interviewScheduleId = this.emptyGuid;
      interviewModel.vacanciesId = item.vacanciesId;
      interviewModel.candidateId = item.candidateId;
      interviewModel.interviewTitle = this.henPhongVanFormGroup.get('tieuDeFormControl').value == null ? null : this.henPhongVanFormGroup.get('tieuDeFormControl').value;
      interviewModel.interviewDate = item.interviewDate;
      interviewModel.address = item.address;
      interviewModel.interviewScheduleType = item.interviewScheduleType;

      let selectedEmployee = this.interViewNameFormControl.value
      selectedEmployee.forEach(emp => {
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
            this.showMessage('success', 'X??a file th??nh c??ng');
          } else {
            this.showMessage('success', result.message);
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
      fileUpload.FileInFolder.objectId = this.candidateId;
      fileUpload.FileInFolder.objectType = 'CANDIDATE';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });


    this.employeeService.uploadFile("CANDIDATE", listFileUploadModel, this.candidateId).subscribe(response => {
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
    this.loading = true;
    let objectType = 'CANDIDATE';
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
      noteModel.ObjectId = this.candidateId;
      noteModel.ObjectType = objectType;
      noteModel.NoteTitle = '???? th??m ghi ch??';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi ch??*/
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'EDT';
      noteModel.ObjectId = this.candidateId;
      noteModel.ObjectType = objectType;
      noteModel.NoteTitle = '???? th??m c???p nh???t';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    }

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
        this.noteId = null;
        this.isEditNote = false;

        /*Reshow Time Line*/
        this.noteHistory = result.listNote;
        this.handleNoteContent();
        // this.createOrUpdate(false);
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

        // $('#' + element.noteId).find('.note-title').append($.parseHTML(element.noteTitle));
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

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  showMessage(severity: string, detail: string) {
    let msg = { severity: severity, summary: 'Th??ng b??o:', detail: detail };
    this.messageService.add(msg);
  }

  // bow do thi cau rrong mo am qua
  taoLichHen() {

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

function CompareDateNow(date1: Date, date2: Date) {
  let leftDate = date1.setHours(0, 0, 0, 0);
  let rightDate = date2.setHours(0, 0, 0, 0);

  return leftDate <= rightDate;
}

function ParseStringToFloat(str: string) {
  if (str === "" || str == null) return 0;
  str = str.toString().replace(/,/g, '');
  return parseFloat(str);
}
