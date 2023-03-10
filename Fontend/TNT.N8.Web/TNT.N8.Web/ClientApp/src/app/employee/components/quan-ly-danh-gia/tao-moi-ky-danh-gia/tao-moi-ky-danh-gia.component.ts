import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng';
import { EmployeeService } from '../../../services/employee.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService, FileUpload } from 'primeng';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { ChonNhieuDvDialogComponent } from '../../../../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';


class CauHinhPhieDanhGiaMapping {
  id: any;
  mauPhieuDanhGia: any;
  chucVu: any
}

class KyDanhGiaPhieuChucVuMapping {
  kyDanhGiaId: any;
  phieuDanhGiaId: any;
  positionId: any;
}

class PhongBanMapping {
  id: any
  phongBan: any;
  quyLuong: any
}



class NguoiDanhGiaMapping {
  parentId: any;
  level: any;
  kyDanhGia: any;
  nguoiDanhGiaId: any;
  nguoiDuocDanhGiaId: any;
  organizationId: any;
  quyLuong: any;
  xemLuong: any;
}


class KyDanhGia {
  TenKyDanhGia: any;
  ThoiGianBatDau: Date;
  ThoiGianKetThuc: Date;
  LyDo: string;
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

class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}




@Component({
  selector: 'app-tao-moi-ky-danh-gia',
  templateUrl: './tao-moi-ky-danh-gia.component.html',
  styleUrls: ['./tao-moi-ky-danh-gia.component.css']
})
export class TaoMoiKyDanhGiaComponent implements OnInit {

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  statusCode: string = null;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  loginFullName: any = localStorage.getItem("UserFullName");

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
  colsFile: Array<any>


  phongBanControl: FormControl
  phongBanNameControl: FormControl
  quyLuongControl: FormControl
  formPhongBan: FormGroup


  //edit table
  displayModal: boolean = false
  displayModal1: boolean = false



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
  @ViewChild('dt') myTable: Table;
  @ViewChild('dtNhanVien') nhanVienTable: Table;


  actionAdd: boolean = true;

  constructor(
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private router: Router,
    private encrDecrService: EncrDecrService,
    private getPermission: GetPermission,
    public dialogService: DialogService,

  ) { }

  async ngOnInit() {
    this.initForm()
    this.initTable()
    //Danh sach
    let resource0 = "hrm/employee/tao-ky-danh-gia/";
    let permission0: any = await this.getPermission.getPermission(resource0);
    if (permission0.status == false) {
      this.router.navigate(['/home']);
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p' };
      this.showMessage(msg);
    }
    else {
      let listCurrentActionResource = permission0.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("view") == -1) {
        this.router.navigate(['/home']);
      }
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
    }
    this.getMasterData()
  }

  async getMasterData() {
    let result: any = await this.employeeService.getMasterDataTaoKyDanhGia();
    this.loading = false;

    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }

    console.log('res: ', result)

    this.soTienChoPhep = result.soTienQuyLuongConLai
    this.listPhongBan = result.listPhongBan;
    this.mauPhieuDanhGia = result.listPhieuDanhGia;


    this.chucVu = result.listChucVu;

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
    ];

    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', type: 'string' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', type: 'number' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right', type: 'date' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', type: 'string' },
    ];

  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  checkDate() {
    if (this.thoiGianBatDauControl) {
      this.minDate = (this.thoiGianBatDauControl.value)
    } else {
      this.maxDate = (this.thoiGianKetThucControl.value);
    }
  }

  initForm() {
    this.tenKyDanhGiaControl = new FormControl(null, [Validators.required]);
    this.ngayTaoControl = new FormControl(new Date, [Validators.required]);
    this.nguoiTaoControl = new FormControl(null, [Validators.required]);
    this.thoiGianBatDauControl = new FormControl(null, [Validators.required]);
    this.thoiGianKetThucControl = new FormControl(null, [Validators.required]);
    this.lyDoDanhGiaControl = new FormControl(null, [Validators.required]);

    //phong ban
    this.phongBanControl = new FormControl(null, [Validators.required])
    this.phongBanNameControl = new FormControl(null)
    this.quyLuongControl = new FormControl(null, [Validators.required])
    this.formPhongBan = new FormGroup({
      phongBanControl: this.phongBanControl,
      phongBanNameControl: this.phongBanNameControl,
      quyLuongControl: this.quyLuongControl,
    })



    this.formThongTinKyDanhGia = new FormGroup({
      tenKyDanhGiaControl: this.tenKyDanhGiaControl,
      ngayTaoControl: this.ngayTaoControl,
      nguoiTaoControl: this.nguoiTaoControl,
      thoiGianBatDauControl: this.thoiGianBatDauControl,
      thoiGianKetThucControl: this.thoiGianKetThucControl,
      lyDoDanhGiaControl: this.lyDoDanhGiaControl,
    });

    this.ngayTaoControl.disable();
    this.nguoiTaoControl.disable();

    this.nguoiTaoControl.setValue(this.loginFullName);

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


  xoaPhieuDanhGia(index: any) {
    this.listPhieuDanhGiaTable = this.listPhieuDanhGiaTable.filter(c => c != index);
  }

  addPhongBan() {
    this.displayModal = !this.displayModal;
    this.formPhongBan.reset();
    this.phongBanControl.enable();
    this.ref.detectChanges();
  }

  xoaPhongBan(index) {
    this.listPhongBanTable = this.listPhongBanTable.filter(c => c != index);
  }

  editRow(rowData, index) {
    this.indexUpdate = index
    this.displayModal1 = !this.displayModal1;
    let thongTinPhongBan = this.listPhongBan.find(x => x.organizationId == rowData.phongBanId);
    this.phongBanControl.setValue(thongTinPhongBan);
    this.phongBanNameControl.setValue([thongTinPhongBan.organizationName]);
    this.quyLuongControl.setValue(rowData.quyLuong);
    this.phongBanControl.disable();
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
      return;
    }

    if (this.listPhieuDanhGiaTable == null || this.listPhieuDanhGiaTable.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Vui l??ng th??m c???u h??nh phi???u ????nh gi??!' };
      this.showMessage(msg);
      return;
    }

    if (this.listPhongBanTable == null || this.listPhongBanTable.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Vui l??ng th??m ph??ng ban tham gia k??? ????nh gi??!' };
      this.showMessage(msg);
      return;
    }


    //K??? ????nh gi??
    var thongTinKyDanhGia = new KyDanhGia();
    thongTinKyDanhGia.TenKyDanhGia = this.tenKyDanhGiaControl.value;
    thongTinKyDanhGia.ThoiGianBatDau = convertToUTCTime(new Date(this.thoiGianBatDauControl.value));
    thongTinKyDanhGia.ThoiGianKetThuc = convertToUTCTime(new Date(this.thoiGianKetThucControl.value));
    thongTinKyDanhGia.LyDo = this.lyDoDanhGiaControl.value;

    let checkValidatePhieuChucVu = false;
    let listKyDanhGiaPhieuChucVuMapping: Array<KyDanhGiaPhieuChucVuMapping> = [];
    this.listPhieuDanhGiaTable.forEach(key => {
      if (key.mauPhieuDanhGia == null || key.chucVu == null) {
        checkValidatePhieuChucVu = true;
      } else {
        key.chucVu.forEach(element => {
          let obj = new KyDanhGiaPhieuChucVuMapping();
          obj.kyDanhGiaId = null;
          obj.phieuDanhGiaId = key.mauPhieuDanhGia.phieuDanhGiaId;
          obj.positionId = element.positionId;
          listKyDanhGiaPhieuChucVuMapping.push(obj);
        });
      }
    });

    if (checkValidatePhieuChucVu) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Vui l??ng ki???m tra c???u h??nh phi???u!' };
      this.showMessage(msg);
      return;
    }

    let listNguoiDanhGiaMapping: Array<NguoiDanhGiaMapping> = [];
    this.listPhongBanTable.forEach(key => {
      let obj = new NguoiDanhGiaMapping();
      obj.parentId = null;
      obj.level = 0;
      obj.kyDanhGia = null;
      obj.nguoiDanhGiaId = this.emptyGuid;
      obj.nguoiDuocDanhGiaId = this.emptyGuid;
      obj.organizationId = key.phongBanId;
      obj.quyLuong = key.quyLuong;
      obj.xemLuong = null;
      listNguoiDanhGiaMapping.push(obj);
    });

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


    let result: any = await this.employeeService.taoKyDanhGia(thongTinKyDanhGia, listKyDanhGiaPhieuChucVuMapping, listNguoiDanhGiaMapping, listFileUploadModel, "KYDANHGIA");
    this.loading = false;

    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }

    let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'T???o k??? ????nh gi?? th??nh c??ng' };
    this.showMessage(msg);
    this.router.navigate(['/employee/chi-tiet-ky-danh-gia', { kyDanhGiaId: this.encrDecrService.set(result.kyDanhGiaId) }]);

  }

  addPhongBanToList() {
    if (!this.formPhongBan.valid) {
      Object.keys(this.formPhongBan.controls).forEach(key => {
        if (!this.formPhongBan.controls[key].valid) {
          this.formPhongBan.controls[key].markAsTouched();
        }
      });
      return;
    }
    if (this.quyLuongControl.value > this.soTienChoPhep) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Qu??? l????ng c???a n??m kh??ng ????? chi' };
      this.showMessage(msg);
      return
    }

    let thongTinPhongBan = this.listPhongBan.find(x => x.organizationId == this.phongBanControl.value.organizationId);
    //N???u kh??ng t???n t???i th?? th??m m???i
    let newObj = {
      phongBan: this.phongBanControl.value.organizationName,
      phongBanId: this.phongBanControl.value.organizationId,
      quyLuong: this.quyLuongControl.value,
      nguoiPhuTrach: thongTinPhongBan.nguoiPhuTrachName,
      nguoiPhuTrachId: thongTinPhongBan.nguoiPhuTrachId,
    };
    this.listPhongBanTable.push(newObj);
    this.displayModal = false;
  }

  updatePhongBanToList() {

    if (!this.formPhongBan.valid) {
      Object.keys(this.formPhongBan.controls).forEach(key => {
        if (!this.formPhongBan.controls[key].valid) {
          this.formPhongBan.controls[key].markAsTouched();
        }
      });
      return;
    }
    if (this.quyLuongControl.value > this.soTienChoPhep) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Qu??? l????ng c???a n??m kh??ng ????? chi' };
      this.showMessage(msg);
      return
    }
    let thongTinPhongBan = this.listPhongBan.find(x => x.organizationId == this.phongBanControl.value.organizationId);
    // let objIndex = this.listPhongBanTable.findIndex(x => x.phongBanId == this.phongBanControl.value.organizationId);
    //N???u t???n t???i th?? c???p nh???t
    this.listPhongBanTable[this.indexUpdate].phongBan = this.phongBanControl.value.organizationName;
    this.listPhongBanTable[this.indexUpdate].phongBanId = this.phongBanControl.value.organizationId;
    this.listPhongBanTable[this.indexUpdate].quyLuong = this.quyLuongControl.value;
    this.listPhongBanTable[this.indexUpdate].nguoiPhuTrach = thongTinPhongBan.nguoiPhuTrachName;
    this.listPhongBanTable[this.indexUpdate].nguoiPhuTrachId = thongTinPhongBan.nguoiPhuTrachId;
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

  chonPhongBan(event) {
    let checkExistInList = this.listPhongBanTable.find(x => x.phongBanId == event.value.organizationId);
    if (checkExistInList) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Ph??ng ban ???? ???????c ??p d???ng!' };
      this.showMessage(msg);
      this.phongBanControl.setValue(null);
      this.phongBanNameControl.setValue(null);
      return;
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



}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
