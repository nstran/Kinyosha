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

class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}

class CauHoiPhieuDanhGiaMapping {
  cauHoiPhieuDanhGiaMappingId: number;
  phieuDanhGiaId: number;
  noiDungCauHoi: string;
  tiLe: number;
  danhSachItem: any;
  parentId: number;
  nguoiDanhGia: number;
  isFarther: Boolean;
  stt: number;
  cauTraLoi: any;
  isValid: Boolean;
}

class PhieuDanhGia {
  TenPhieuDanhGia: string;
  ThangDiemDanhGiaId: string;
  CachTinhTong: string;
  HoatDong: string;
}


@Component({
  selector: 'app-tao-phieu-danh-gia',
  templateUrl: './tao-phieu-danh-gia.component.html',
  styleUrls: ['./tao-phieu-danh-gia.component.css']
})



export class TaoPhieuDanhGiaComponent implements OnInit {
  auth = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  statusCode: string = null;

  colsBangDanhGia: any[];
  colsBangDanhGiaQuanLy: any[];

  listEmpAdd: any[]; // List nh??n vi??n ch???n ????? th??m ????? xu???t

  listNoiDungDanhGiaNV: Array<any> = new Array<any>();
  listNoiDungDanhGiaQL: Array<any> = new Array<any>();

  today = new Date();
  clonedData: { [s: string]: any; } = {}

  //Form c???a phi???u ????nh gi??
  phieuDanhGiaFormGroup: FormGroup;
  tenPhieuDanhGiaFormControl: FormControl;
  ngayTaoFormControl: FormControl;
  nguoiTaoFormControl: FormControl;
  hoatDongControl: FormControl;
  thangDiemDanhGiaControl: FormControl;

  cachTinhFormGroup: FormGroup;
  cachTinhControl: FormControl;

  editing: boolean = false;

  colsFile: any[];

  listTinhTheo = [
    { value: 1, name: "T???ng ??i???m th??nh ph???n*Tr???ng s???" },
    { value: 2, name: "Trung b??nh c???ng ??i???m th??nh ph???n*Tr???ng s???" },
  ];

  listMucDanhGia = [
    { mucDanhGiaId: '00000000-0000-0000-0000-000000000000', tenMucDanhGia: "Thang ??i???m ????nh gi?? cho nh??n vi??n" },
    { mucDanhGiaId: '00000000-0000-0000-0000-000000000000', tenMucDanhGia: "Thang ??i???m ????nh gi?? cho qu???n l??" },
    { mucDanhGiaId: '00000000-0000-0000-0000-000000000000', tenMucDanhGia: "Thang ??i???m ????nh gi?? cho gi??m ?????c" },
    { mucDanhGiaId: '00000000-0000-0000-0000-000000000000', tenMucDanhGia: "Thang ??i???m ????nh gi?? cho lao c??ng" },
  ];

  listDangCauTraLoi = [];
  listDangCauTraLoiQl = [];
  listItemCauTraLoi = [];

  actionAdd: boolean = true;
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
    private getPermission: GetPermission,

  ) { }

  async ngOnInit() {
    this.setCols();
    this.setForm();

    let resource = "hrm/employee/tao-phieu-danh-gia/";
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

      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
    }
    this.getMasterData();
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

    this.thangDiemDanhGiaControl.setValue(this.listMucDanhGia[0]);

    this.cachTinhControl = new FormControl(null, [Validators.required]);

    this.cachTinhFormGroup = new FormGroup({
      cachTinhControl: this.cachTinhControl
    });

    this.ngayTaoFormControl.setValue(this.today);
    this.ngayTaoFormControl.disable();
    this.cachTinhControl.setValue(this.listTinhTheo.find(x => x.value == 2));
  }

  setCols() {



    this.colsBangDanhGia = [
      { field: 'stt', header: 'Stt', width: "20px", textAlign: 'left', color: '#f44336' },
      { field: 'noiDungCauHoi', header: 'N???i dung ????nh gi??', textAlign: 'left', display: 'table-cell', width: "125px" },
      { field: 'tiLe', header: 'T??? l??? (%)', textAlign: 'left', width: "80px" },
      { field: 'cauTraLoi', header: 'C??u tr??? l???i', textAlign: 'left', display: 'table-cell', width: '200px' },
      { field: 'action', header: 'Thao t??c', width: '60px', textAlign: 'center', color: '#f44336' },
    ];


    this.colsBangDanhGiaQuanLy = [
      { field: 'stt', header: 'Stt', width: "20px", textAlign: 'left', color: '#f44336' },
      { field: 'noiDungCauHoi', header: 'N???i dung ????nh gi??', textAlign: 'left', display: 'table-cell', width: "125px" },
      { field: 'cauTraLoi', header: 'C??u tr??? l???i', textAlign: 'left', display: 'table-cell', width: '200px' },
      { field: 'action', header: 'Thao t??c', width: '60px', textAlign: 'center', color: '#f44336' },
    ];

    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', type: 'string' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', type: 'number' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right', type: 'date' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', type: 'string' },
    ];

  }
  async getMasterData() {
    this.loading = true;
    let result: any = await this.employeeService.getMasterDataCreatePhieuDanhGia();
    this.loading = false;
    console.log(result)
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'L???y th??ng tin kh??ng th??nh c??ng' };
      this.showMessage(msg);
      return;
    }
    this.listDangCauTraLoi = result.listDangCauTraLoi;
    this.listDangCauTraLoiQl = result.listDangCauTraLoi.filter(x => x.values != 1 && x.value != 3);

    this.listEmpAdd = result.listEmp;
    this.listItemCauTraLoi = result.listItemCauTraLoi;

    this.listMucDanhGia = result.listThangDiemDanhGia;
    if (this.listMucDanhGia.length != 0) {
      this.thangDiemDanhGiaControl.setValue(this.listMucDanhGia[0]);
    }
    if (this.listEmpAdd.length != 0) {
      this.setDefaultValue(this.listEmpAdd[0]);
      this.nguoiTaoFormControl.setValue(this.listEmpAdd.find(x => x.employeeId == result.loginEmployeeID));
      this.nguoiTaoFormControl.disable();
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  thoat() {
    this.router.navigate(['/employee/danh-sach-phieu-danh-gia']);
  }



  setDefaultValue(emp) {

  }




  async taoPhieuDanhGia() {

    if (!this.phieuDanhGiaFormGroup.valid) {
      Object.keys(this.phieuDanhGiaFormGroup.controls).forEach(key => {
        if (!this.phieuDanhGiaFormGroup.controls[key].valid) {
          this.phieuDanhGiaFormGroup.controls[key].markAsTouched();
        }
      });
      return;
    }

    if (!this.cachTinhFormGroup.valid) {
      Object.keys(this.cachTinhFormGroup.controls).forEach(key => {
        if (!this.cachTinhFormGroup.controls[key].valid) {
          this.cachTinhFormGroup.controls[key].markAsTouched();
        }
      });
      return;
    }

    let phieuDanhGia = new PhieuDanhGia();
    phieuDanhGia.TenPhieuDanhGia = this.tenPhieuDanhGiaFormControl.value;
    phieuDanhGia.HoatDong = this.hoatDongControl.value;
    phieuDanhGia.ThangDiemDanhGiaId = this.thangDiemDanhGiaControl.value.mucDanhGiaId;
    phieuDanhGia.CachTinhTong = this.cachTinhControl.value.value;

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
      fileUpload.FileInFolder.objectType = 'PHIEUDANHGIA';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    if (!(this.listNoiDungDanhGiaNV != null && this.listNoiDungDanhGiaNV.length > 0)) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "Nh???p th??ng tin c??u h???i t??? ????nh gi?? nh??n vi??n" };
      this.showMessage(msg);
      return;
    }


    let check = this.checkListCauHoi();
    if (!check) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "Vui l??ng nh???p ?????y ????? th??ng tin" };
      this.showMessage(msg);
      return;
    }

    var percent: number = 0
    this.listNoiDungDanhGiaNV.filter(x => x.parentId == 0 || x.parentId == null)?.forEach(parent => {
      percent += parseFloat(parent.tiLe);
    });
    if (percent != 100) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "T???ng t??? l??? n???i dung ????nh gi?? ph???i b???ng 100%" };
      this.showMessage(msg);
      return;
    }


    this.employeeService.taoPhieuDanhGia(phieuDanhGia, this.listNoiDungDanhGiaNV, this.listNoiDungDanhGiaQL, listFileUploadModel, "PHIEUDANHGIA").subscribe(response => {
      this.loading = false;
      let result = <any>response;
      if (result.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o phi???u ????nh gi?? th??nh c??ng!' };
        this.showMessage(msg);

        setTimeout(() => {
          this.router.navigate(['/employee/chi-tiet-phieu-danh-gia', { phieuDanhGiaId: this.encrDecrService.set(result.phieuDanhGiaId) }]);
        }, 1000)

      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
        this.showMessage(msg);
      }
    });
  }

  checkListCauHoi() {
    //Check list c??u h???i nh??n vi??n
    let check = false;
    let indexParent = 1;
    this.listNoiDungDanhGiaNV.filter(x => x.parentId == 0)?.forEach(parent => {
      let oldIndexParent = parent.cauHoiPhieuDanhGiaMappingId;
      parent.cauHoiPhieuDanhGiaMappingId = indexParent;
      let indexCon = 0.1; // ????nh stt t??ng d???n cho index con
      if (parent.noiDungCauHoi == null || parent.noiDungCauHoi.trim() == ''
        || parent.tiLe > 100
      ) {
        // parent.isValid = false;
        check = true;
      }
      if (!this.listNoiDungDanhGiaNV.find(x => x.parentId == oldIndexParent)) {
        check = true;
      }

      this.listNoiDungDanhGiaNV.filter(x => x.parentId == oldIndexParent)?.forEach(child => {

        child.cauHoiPhieuDanhGiaMappingId = indexParent + indexCon;
        child.parentId = parent.cauHoiPhieuDanhGiaMappingId;
        if (
          child.noiDungCauHoi == null || child.noiDungCauHoi.trim() == ''
          || child.cauTraLoi == null
        ) {
          // parent.isValid = false;
          check = true;

        }
        if (child.cauTraLoi != null) {
          if (child.cauTraLoi.value == 2 || child.cauTraLoi.value == 0) {
            if (child.danhSachItem == null || child.danhSachItem.length == 0) {
              check = true;
            }
          }
        }
        indexCon += 0.1;
      });

      indexParent++;
    });

    //Check list c??u h???i qu???n l??
    if (this.listNoiDungDanhGiaQL != null && this.listNoiDungDanhGiaQL.length > 0) {
      let indexParentQL = 1;
      this.listNoiDungDanhGiaQL.filter(x => x.parentId == 0)?.forEach(parent => {
        let oldIndexParent = parent.cauHoiPhieuDanhGiaMappingId;
        parent.cauHoiPhieuDanhGiaMappingId = indexParentQL;
        let indexCon = 0.1; // ????nh stt t??ng d???n cho index con
        if (!this.listNoiDungDanhGiaQL.find(x => x.parentId == oldIndexParent)) {
          check = true;
        }

        this.listNoiDungDanhGiaQL.filter(x => x.parentId == oldIndexParent)?.forEach(child => {
          child.cauHoiPhieuDanhGiaMappingId = indexParentQL + indexCon;
          child.parentId = parent.cauHoiPhieuDanhGiaMappingId;
          if (
            child.noiDungCauHoi == null || child.noiDungCauHoi.trim() == ''
            || child.cauTraLoi == null
          ) {
            // parent.isValid = false;
            check = true;
          }
          if (child.cauTraLoi != null) {
            if (child.cauTraLoi.value == 2 || child.cauTraLoi.value == 0) {
              if (child.danhSachItem == null || child.danhSachItem.length == 0) check = true;
            }
          }
          indexCon += 0.1;
        });

        indexParentQL++;
      });
    }

    if (check) return false;

    return true;

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
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        let index = this.arrayDocumentModel.indexOf(file);
        this.arrayDocumentModel.splice(index, 1);
      }
    });
  }


  // Th??m d??ng con thu???c n???i dung cha
  addRowChild(rowData: any, type) {
    let noiDUngTT: CauHoiPhieuDanhGiaMapping = {
      cauHoiPhieuDanhGiaMappingId: 0,
      phieuDanhGiaId: 0,
      noiDungCauHoi: '',
      tiLe: 0,
      cauTraLoi: null,
      danhSachItem: null,
      isValid: true,
      parentId: rowData.cauHoiPhieuDanhGiaMappingId,
      stt: 0,
      nguoiDanhGia: type == 'NV' ? 1 : 2,
      isFarther: false
    }
    if (type == 'NV') this.listNoiDungDanhGiaNV.push(noiDUngTT);
    if (type == 'QL') this.listNoiDungDanhGiaQL.push(noiDUngTT);
    this.sapXepLaiDanhSachNoiDung(type);
  }


  // Th??m n???i dung cha
  addRow(type) {
    let noiDUngTT: CauHoiPhieuDanhGiaMapping = {
      cauHoiPhieuDanhGiaMappingId: type == 'NV' ? this.listNoiDungDanhGiaNV.filter(x => x.parentId == 0).length + 1 : this.listNoiDungDanhGiaQL.filter(x => x.parentId == 0).length + 1,
      phieuDanhGiaId: 0,
      noiDungCauHoi: '',
      tiLe: 0,
      cauTraLoi: null,
      isValid: true,
      danhSachItem: null,
      parentId: 0,
      stt: 0,
      nguoiDanhGia: type == 'NV' ? 1 : 2,
      isFarther: true
    }
    if (type == 'NV') this.listNoiDungDanhGiaNV.push(noiDUngTT);
    if (type == 'QL') this.listNoiDungDanhGiaQL.push(noiDUngTT);
    this.sapXepLaiDanhSachNoiDung(type);
    this.ref.detectChanges();
  }


  // S???p x???p l???i v??? tr?? th??? t??? c???a list n???i dung
  sapXepLaiDanhSachNoiDung(type) {
    if (type == 'NV') {
      let listNoiDungTTNew: Array<any> = new Array<any>();
      let indexParent = 1;
      this.listNoiDungDanhGiaNV.filter(x => x.parentId == 0)?.forEach(parent => {
        let oldIndexParent = parent.cauHoiPhieuDanhGiaMappingId;
        parent.cauHoiPhieuDanhGiaMappingId = indexParent;
        parent.stt = indexParent;
        listNoiDungTTNew.push(parent);
        let indexCon = 0.1; // ????nh stt t??ng d???n cho index con
        this.listNoiDungDanhGiaNV.filter(x => x.parentId == oldIndexParent)?.forEach(child => {
          child.cauHoiPhieuDanhGiaMappingId = indexParent + indexCon;
          child.stt = indexParent + indexCon;
          child.parentId = parent.cauHoiPhieuDanhGiaMappingId;
          indexCon += 0.1;
          listNoiDungTTNew.push(child);
        });
        indexParent++;
      });
      this.listNoiDungDanhGiaNV = listNoiDungTTNew;
      this.ref.detectChanges();
    }
    if (type == 'QL') {
      let listNoiDungTTNew: Array<any> = new Array<any>();
      let indexParent = 1;
      this.listNoiDungDanhGiaQL.filter(x => x.parentId == 0)?.forEach(parent => {
        let oldIndexParent = parent.cauHoiPhieuDanhGiaMappingId;
        parent.cauHoiPhieuDanhGiaMappingId = indexParent;
        parent.stt = indexParent;
        listNoiDungTTNew.push(parent);

        let indexCon = 0.1; // ????nh stt t??ng d???n cho index con
        this.listNoiDungDanhGiaQL.filter(x => x.parentId == oldIndexParent)?.forEach(child => {
          child.cauHoiPhieuDanhGiaMappingId = indexParent + indexCon;
          child.stt = indexParent + indexCon;
          child.parentId = parent.cauHoiPhieuDanhGiaMappingId;
          indexCon += 0.1;
          listNoiDungTTNew.push(child);
        });
        indexParent++;
      });
      this.listNoiDungDanhGiaQL = listNoiDungTTNew;
      this.ref.detectChanges();
    }

  }


  onRowEditInit(rowData: any) {
    this.clonedData[rowData.cauHoiPhieuDanhGiaMappingId] = { ...rowData };
    this.ref.detectChanges();
  }

  async onRowRemove(rowData: any, type) {
    this.confirmationService.confirm({
      message: `B???n c?? ch???c ch???n x??a d??ng n??y?`,
      accept: async () => {
        if (type == 'NV') this.listNoiDungDanhGiaNV = this.listNoiDungDanhGiaNV.filter(e => e != rowData);
        if (type == 'QL') this.listNoiDungDanhGiaQL = this.listNoiDungDanhGiaQL.filter(e => e != rowData);

      }
    });
  }

  onRowEditSave(rowData: any) {

  }


  //#region Thao t??c chung
  onRowEditCancel(rowData: any) {
    Object.keys(this.clonedData).forEach(key => {
      if (key == rowData.cauHoiPhieuDanhGiaMappingId && rowData.cauHoiPhieuDanhGiaMappingId != 0) {
        rowData.cauHoiPhieuDanhGiaMappingId = this.clonedData[key].cauHoiPhieuDanhGiaMappingId;
        rowData.noiDungDanhGia = this.clonedData[key].noiDungDanhGia;
        rowData.tiLe = this.clonedData[key].tiLe;
        rowData.cauTraLoi = this.clonedData[key].cauTraLoi;
        rowData.parentId = this.clonedData[key].parentId;
      }
    });
  }

  /** X??? l?? row con */
  onRowEditSaveChild(rowData: any) {
    if (
      !rowData.noiDungCauHoi || rowData.noiDungCauHoi == '' || rowData.noiDungCauHoi == 0 ||
      !rowData.cauTraLoi || rowData.cauTraLoi == ''
    ) {

      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'H??y nh???p ?????y ????? th??ng tin!' };
      this.showMessage(msg);
      return;
    }
    if ((rowData.cauTraLoi.value == 2 || rowData.cauTraLoi.value == 0) && (!rowData.danhSachItem || rowData.danhSachItem == '')) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'H??y nh???p ?????y ????? th??ng tin!' };
      this.showMessage(msg);
      return;
    }
    this.editing = !this.editing;
  }

  onRowEditCancelChild(rowData: any) {
    this.editing = !this.editing;

    Object.keys(this.clonedData).forEach(key => {
      if (key == rowData.cauHoiPhieuDanhGiaMappingId && rowData.cauHoiPhieuDanhGiaMappingId != 0) {
        rowData.cauHoiPhieuDanhGiaMappingId = this.clonedData[key].cauHoiPhieuDanhGiaMappingId;
        rowData.noiDungDanhGia = this.clonedData[key].noiDungDanhGia;
        rowData.phongBan = this.clonedData[key].phongBan;
        rowData.tiLe = this.clonedData[key].tiLe;
        rowData.cauTraLoi = this.clonedData[key].cauTraLoi;
        rowData.parentId = this.clonedData[key].parentId;
      }
      // else {
      //   this.listNoiDungTT = this.listNoiDungTT.filter(e => e != rowData);
      // }
    });
  }

  async onRowRemoveChild(rowData: any, type) {

    this.confirmationService.confirm({
      message: `B???n c?? ch???c ch???n x??a d??ng n??y?`,
      accept: async () => {
        if (type == "NV") this.listNoiDungDanhGiaNV = this.listNoiDungDanhGiaNV.filter(e => e != rowData);
        if (type == "QL") this.listNoiDungDanhGiaQL = this.listNoiDungDanhGiaQL.filter(e => e != rowData);
        this.sapXepLaiDanhSachNoiDung(type);
      }
    });
  }

  onRowEditInitChild(rowData: any) {

    this.editing = !this.editing;

    this.clonedData[rowData.cauHoiPhieuDanhGiaMappingId] = { ...rowData };
    this.ref.detectChanges();
  }



  onRowEditCancelParent(rowData: any) {

    this.editing = !this.editing;

    Object.keys(this.clonedData).forEach(key => {
      if (key == rowData.cauHoiPhieuDanhGiaMappingId && rowData.cauHoiPhieuDanhGiaMappingId != 0) {
        rowData.cauHoiPhieuDanhGiaMappingId = this.clonedData[key].cauHoiPhieuDanhGiaMappingId;
        rowData.noiDungDanhGia = this.clonedData[key].noiDungDanhGia;
        rowData.tiLe = this.clonedData[key].tiLe;
        rowData.cauTraLoi = this.clonedData[key].cauTraLoi;
        rowData.parentId = this.clonedData[key].parentId;
      }
      // else {
      //   this.listNoiDungTT = this.listNoiDungTT.filter(e => e != rowData);
      // }
    });
  }



  /**X??? l?? row cha */
  onRowEditSaveParent(rowData: any, event) {

    if (
      !rowData.noiDungCauHoi || rowData.noiDungCauHoi == '' || rowData.noiDungCauHoi == 0
    ) {

      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'H??y nh???p ?????y ????? th??ng tin!' };
      this.showMessage(msg);
      event.preventDefault();
      return;
    }
  }

  onRowEditSaveParent1(rowData: any, event) {

    // if (
    //   !rowData.tiLe || rowData.tiLe == '' || rowData.tiLe == 0 ||
    //   !rowData.noiDungCauHoi || rowData.noiDungCauHoi == '' || rowData.noiDungCauHoi == 0
    // ) {

    //   let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'H??y nh???p ?????y ????? th??ng tin!' };
    //   this.showMessage(msg);
    //   event.preventDefault();
    //   return;
    // }
  }


  async onRowRemoveParent(rowData: any, type) {
    if (type == "NV") {
      // Ki???m tra xem c?? row con
      if (this.listNoiDungDanhGiaNV.filter(x => x.parentId == rowData.cauHoiPhieuDanhGiaMappingId).length > 0) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'T???n t???i n???i dung ????nh gi?? con. Vui l??ng ki???m tra l???i' };
        this.showMessage(msg);
        return;
      }
    }

    if (type == "QL") {
      // Ki???m tra xem c?? row con
      if (this.listNoiDungDanhGiaQL.filter(x => x.parentId == rowData.cauHoiPhieuDanhGiaMappingId).length > 0) {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'T???n t???i n???i dung ????nh gi?? con. Vui l??ng ki???m tra l???i' };
        this.showMessage(msg);
        return;
      }
    }

    this.confirmationService.confirm({
      message: `B???n c?? ch???c ch???n x??a d??ng n??y?`,
      accept: async () => {
        if (type == "NV") this.listNoiDungDanhGiaNV = this.listNoiDungDanhGiaNV.filter(e => e != rowData);
        if (type == "QL") this.listNoiDungDanhGiaQL = this.listNoiDungDanhGiaQL.filter(e => e != rowData);
      }
    });
  }


  onRowEditInitParent(rowData: any) {

    this.editing = !this.editing;

    this.clonedData[rowData.cauHoiPhieuDanhGiaMappingId] = { ...rowData };
    this.ref.detectChanges();
  }


}


function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}
