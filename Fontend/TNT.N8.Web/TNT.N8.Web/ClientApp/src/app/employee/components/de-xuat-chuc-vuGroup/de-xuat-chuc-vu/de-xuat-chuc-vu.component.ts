import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeService } from '../../../services/employee.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DialogService, FileUpload } from 'primeng';
import { DeXuatChucVuModel, NhanVienDeXuatThayDoiChucVu } from '../../../models/de-xuat-chuc-vu';
import { ImportNvDeXuatChucVuComponent } from '../importNv-de-xuat-chuc-vu/importNv-de-xuat-chuc-vu.component';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';


class importNVByExcelModel {
  empId: string;
  empCode: string;
  empName: string;
  oranganizationName: string;
  positionName: string;
  chucVuDeXuat: string;
  chucVuDeXuatId: string;
  lydo: string;
  phongBanId: string;
  chucVuId: string;
}

class EmployeeInterface {
  nhanVienDeXuatThayDoiChucVuId: number;
  deXuatThayDoiChucVuId: number;
  employeeId: string;
  employeeName: string;
  organizationName: string;
  PhongBanId: string;
  employeeCode: string;
  DateOfBirth: Date;
  lyDoDeXuat: string;
  positionName: string;
  chucVuHienTaiId: string;
  chucVuDeXuatId: string;
  positionNameDx: string;
  trangThai: number;
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
  selector: 'app-de-xuat-chuc-vu',
  templateUrl: './de-xuat-chuc-vu.component.html',
  styleUrls: ['./de-xuat-chuc-vu.component.css']
})
export class DeXuatChucVuComponent implements OnInit {
  auth = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  arrayDocumentModel: Array<any> = [];
  statusCode: string = null;

  displayChooseFileImportDialog: boolean = false;
  fileName: string = '';
  importFileExcel: any = null;

  colsListEmp: any[];
  selectedColumns: any[];

  listEmpAdd: any[]; // List nh??n vi??n ch???n ????? th??m ????? xu???t
  listEmpSelected: Array<EmployeeInterface> = new Array<EmployeeInterface>();  // List nh??n vi??n ???????c ch???n th??m ????? xu???t

  today = new Date();

  //Form c???a phi???u ????? xu???t t??ng l????ng
  deXuatTangLuongFormGroup: FormGroup;
  tenDeXuatFormControl: FormControl;
  ngayDeXuatFormControl: FormControl;
  nguoiDeXuatFormControl: FormControl;

  //Ds nh??n vi??n ???????c ????? xu???t
  nhanVienFormGroup: FormGroup;
  EmployeeIdFormControl: FormControl;
  EmployeeNameFormControl: FormControl;
  OranganizationIdFormControl: FormControl;
  OranganizationNameFormControl: FormControl;
  ChucVuDXFormControl: FormControl;
  EmployeeCodeFormControl: FormControl;
  PositisionIdFormControl: FormControl;
  PositisionNameFormControl: FormControl;
  DateOfBirthFormControl: FormControl;
  ChucVuCuFormControl: FormControl;
  LyDoDXFormControl: FormControl;

  IsEditNV: boolean = false;

  loginEmpId: string = '';

  filterGlobal: string;

  chucVuList: any = [];
  colsFile: any[];
  actionAdd:boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private employeeService: EmployeeService,
    private def: ChangeDetectorRef,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private encrDecrService: EncrDecrService,
    private getPermission: GetPermission,
  ) { }

  async ngOnInit() {
    this.setForm();
    this.setCols();
    await this._getPermission();
    this.getMasterData();
  }

  setForm() {
    this.tenDeXuatFormControl = new FormControl(null, [Validators.required]);
    this.ngayDeXuatFormControl = new FormControl(null, [Validators.required]);
    this.nguoiDeXuatFormControl = new FormControl(null, [Validators.required]);

    this.deXuatTangLuongFormGroup = new FormGroup({
      tenDeXuatFormControl: this.tenDeXuatFormControl,
      ngayDeXuatFormControl: this.ngayDeXuatFormControl,
      nguoiDeXuatFormControl: this.nguoiDeXuatFormControl
    });

    this.EmployeeIdFormControl = new FormControl(null, [Validators.required]);
    this.EmployeeNameFormControl = new FormControl(null);
    this.OranganizationIdFormControl = new FormControl();
    this.OranganizationNameFormControl = new FormControl(null);
    this.ChucVuCuFormControl = new FormControl(null);
    this.ChucVuDXFormControl = new FormControl(null, [Validators.required]);
    this.EmployeeCodeFormControl = new FormControl(null);
    this.PositisionIdFormControl = new FormControl(null);
    this.PositisionNameFormControl = new FormControl(null);
    this.DateOfBirthFormControl = new FormControl(null);
    this.LyDoDXFormControl = new FormControl(null, [Validators.required]);

    this.nhanVienFormGroup = new FormGroup({
      EmployeeIdFormControl: this.EmployeeIdFormControl,
      EmployeeNameFormControl: this.EmployeeNameFormControl,
      OranganizationIdFormControl: this.OranganizationIdFormControl,
      OranganizationNameFormControl: this.OranganizationNameFormControl,
      ChucVuDXFormControl: this.ChucVuDXFormControl,
      EmployeeCodeFormControl: this.EmployeeCodeFormControl,
      PositisionIdFormControl: this.PositisionIdFormControl,
      PositisionNameFormControl: this.PositisionNameFormControl,
      DateOfBirthFormControl: this.DateOfBirthFormControl,
      ChucVuCuFormControl: this.ChucVuCuFormControl,
      LyDoDXFormControl: this.LyDoDXFormControl,
    });
    this.ngayDeXuatFormControl.setValue(new Date());
  }

  setCols() {
    this.colsListEmp = [
      { field: 'employeeCode', header: 'M?? nh??n vi??n', textAlign: 'left', display: 'table-cell', width: "125px" },
      { field: 'employeeName', header: 'H??? t??n', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'organizationName', header: 'Ph??ng ban', textAlign: 'left', display: 'table-cell', width: '200px' },
      { field: 'positionName', header: 'Ch???c v???', textAlign: 'center', display: 'table-cell', width: '95px' },
      { field: 'positionNameDx', header: 'Ch???c v??? ????? xu???t', textAlign: 'left', display: 'table-cell', width: '150px' },
      { field: 'trangThai', header: 'Tr???ng th??i', textAlign: 'left', display: 'table-cell', width: '100px' },
    ];

    this.selectedColumns = this.colsListEmp;

    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', type: 'string' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', type: 'number' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right', type: 'date' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', type: 'string' },
    ];
  }

  async _getPermission() {
    this.loading = true;
    let resource = "hrm/employee/tao-de-xuat-chuc-vu/";
    let permission: any = await this.getPermission.getPermission(resource);

    if (permission.status == false) { 
      this.router.navigate(["/home"]);
      return;
    }

    let listCurrentActionResource = permission.listCurrentActionResource;
    if (listCurrentActionResource.indexOf("view") == -1) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p v??o ???????ng d???n n??y vui l??ng quay l???i trang ch???' };
      this.showMessage(msg);
    }
    if (listCurrentActionResource.indexOf("add") == -1) {
      this.actionAdd = false;
    }

  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.employeeService.getMasterDataCreateDeXuatChucVu();
    this.loading = false;

    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'L???y th??ng tin kh??ng th??nh c??ng' };
      this.showMessage(msg);
      return;
    }

    this.listEmpAdd = result.listEmp;
    this.chucVuList = result.listPosition;

    if (this.listEmpAdd.length != 0) {
      this.setDefaultValue(this.listEmpAdd[0]);
      this.nguoiDeXuatFormControl.setValue(this.listEmpAdd.find(x => x.employeeId == result.loginEmployeeID));
      this.nguoiDeXuatFormControl.disable();
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  thoat() {
    this.router.navigate(['/employee/danh-sach-de-xuat-chuc-vu']);
  }

  refreshFilter() {
    this.filterGlobal = '';
  }

  async TaiFileMauDeXuatCV() {
    let result: any = await this.employeeService.downloadTemplateImportDXCV();

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
      this.showMessage(msg);
    }
  }

  changeEmplyee(emp) {
    //check xem nh??n vi??n c?? t???n t???i trong list ch??a
    var checkExist = this.listEmpSelected.find(x => x.employeeId == emp.value.employeeId);
    if (checkExist) {
      this.updateEmp(checkExist);
    } else {
      this.IsEditNV = false;
      this.EmployeeIdFormControl.setValue(emp.value);
      this.OranganizationIdFormControl.setValue(emp.value.organizationId);
      this.OranganizationNameFormControl.setValue(emp.value.organizationName);
      this.EmployeeCodeFormControl.setValue(emp.value.employeeCode);
      this.PositisionIdFormControl.setValue(emp.value.positionId);
      this.PositisionNameFormControl.setValue(emp.value.positionName);
      this.DateOfBirthFormControl.setValue(new Date(emp.value.dateOfBirth));
      this.LyDoDXFormControl.setValue("");
      this.ChucVuCuFormControl.setValue(emp.value.positionId);
      // this.ChucVuDXFormControl.setValue(this.chucVuList[0]);
    }
  }

  setDefaultValue(emp) {
    this.LyDoDXFormControl.setValue("");
  }

  AddEmp() {
    if (!this.nhanVienFormGroup.valid) {
      Object.keys(this.nhanVienFormGroup.controls).forEach(key => {
        if (this.nhanVienFormGroup.controls[key].valid == false) {
          this.nhanVienFormGroup.controls[key].markAsTouched();
        }
      });
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Vui l??ng nh???p ?????y ????? th??ng tin c??c tr?????ng d??? li???u.' };
      this.showMessage(msg);
      return;
    }

    let newEmp = new EmployeeInterface();

    newEmp.employeeId = this.EmployeeIdFormControl.value.employeeId;
    newEmp.employeeName = this.EmployeeIdFormControl.value.employeeName;
    newEmp.PhongBanId = this.OranganizationIdFormControl.value;
    newEmp.organizationName = this.OranganizationNameFormControl.value;
    newEmp.employeeCode = this.EmployeeCodeFormControl.value;
    newEmp.chucVuHienTaiId = this.PositisionIdFormControl.value;
    newEmp.positionName = this.PositisionNameFormControl.value;
    newEmp.lyDoDeXuat = this.LyDoDXFormControl.value;
    newEmp.positionNameDx = this.ChucVuDXFormControl.value.positionName;
    newEmp.chucVuDeXuatId = this.ChucVuDXFormControl.value.positionId;
    newEmp.trangThai = 1; //tr???ng th??i m???i
    var checkExist = this.listEmpSelected.filter(x => x.employeeId == this.EmployeeIdFormControl.value.employeeId);
    if (checkExist.length != 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Nh??n vi??n ???? t???n t???i trong danh s??ch ????? xu???t' };
      this.showMessage(msg);
      return;
    }

    this.listEmpSelected.push(newEmp);
    this.def.detectChanges();
    this.clearEmp();
  }


  async EditEmp() {
    if (!this.nhanVienFormGroup.valid) {
      Object.keys(this.nhanVienFormGroup.controls).forEach(key => {
        if (this.nhanVienFormGroup.controls[key].valid == false) {
          this.nhanVienFormGroup.controls[key].markAsTouched();
        }
      });
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Vui l??ng nh???p ?????y ????? th??ng tin c??c tr?????ng d??? li???u.' };
      this.showMessage(msg);
      return;
    }
    this.IsEditNV = false;

    let newEmp = new EmployeeInterface();
    newEmp.employeeId = this.EmployeeIdFormControl.value.employeeId;
    newEmp.employeeName = this.EmployeeIdFormControl.value.employeeName;
    newEmp.PhongBanId = this.OranganizationIdFormControl.value;
    newEmp.organizationName = this.OranganizationNameFormControl.value;
    newEmp.employeeCode = this.EmployeeCodeFormControl.value;
    newEmp.chucVuHienTaiId = this.PositisionIdFormControl.value;
    newEmp.positionName = this.PositisionNameFormControl.value;
    newEmp.lyDoDeXuat = this.LyDoDXFormControl.value;
    newEmp.positionNameDx = this.ChucVuDXFormControl.value.positionName;
    newEmp.chucVuDeXuatId = this.ChucVuDXFormControl.value.positionId;
    newEmp.trangThai = 1; // tr???ng th??i m???i
    this.listEmpSelected = await this.listEmpSelected.filter(x => x.employeeId != newEmp.employeeId);
    this.listEmpSelected.push(newEmp);
    this.def.detectChanges();
    this.clearEmp();
  }

  removeEmp(rowData) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a ????? xu???t n??y?',
      accept: () => {
        this.loading = true;
        this.listEmpSelected = this.listEmpSelected.filter(x => x.employeeId != rowData.employeeId);
        this.loading = false;
      }
    });
  }

  updateEmp(rowData) {
    this.IsEditNV = true;
    this.EmployeeIdFormControl.setValue(this.listEmpAdd.find(x => x.employeeId == rowData.employeeId));
    this.OranganizationIdFormControl.setValue(rowData.OrganizationId);
    this.OranganizationNameFormControl.setValue(rowData.organizationName);
    this.ChucVuDXFormControl.setValue(this.chucVuList.find(x => x.positionId == rowData.chucVuDeXuatId));
    this.EmployeeCodeFormControl.setValue(rowData.employeeCode);
    this.PositisionIdFormControl.setValue(rowData.PositionId);
    this.PositisionNameFormControl.setValue(rowData.positionName);
    this.DateOfBirthFormControl.setValue(rowData.DateOfBirth);
    this.ChucVuCuFormControl.setValue(rowData.positionId);
    this.LyDoDXFormControl.setValue(rowData.lyDoDeXuat);
  }

  clearEmp() {
    this.IsEditNV = false;
    this.nhanVienFormGroup.reset();
  }

  async taoMoiDeXuatTangLuong() {
    if (!this.deXuatTangLuongFormGroup.valid) {
      Object.keys(this.deXuatTangLuongFormGroup.controls).forEach(key => {
        if (this.deXuatTangLuongFormGroup.controls[key].valid == false) {
          this.deXuatTangLuongFormGroup.controls[key].markAsTouched();
        }
      });
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Vui l??ng nh???p ?????y ????? th??ng tin c??c tr?????ng d??? li???u.' };
      this.showMessage(msg);
      return;
    }
    if (this.listEmpSelected.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'H??y ch???n nh??n vi??n ???????c ????? xu???t thay ?????i ch???c v???!' };
      this.showMessage(msg);
      return;
    }

    let deXuatTangLuong = new DeXuatChucVuModel();
    deXuatTangLuong.tenDeXuat = this.tenDeXuatFormControl.value;
    deXuatTangLuong.ngayDeXuat = this.ngayDeXuatFormControl.value;
    deXuatTangLuong.nguoiDeXuatId = this.nguoiDeXuatFormControl.value.employeeId;

    let listEmp = [];
    this.listEmpSelected.forEach(val => {
      var newObj = new NhanVienDeXuatThayDoiChucVu();
      newObj.nhanVienDeXuatThayDoiChucVuId = 0;
      newObj.deXuatThayDoiChucVuId = 0;
      newObj.chucVuDeXuatId = val.chucVuDeXuatId;
      newObj.chucVuHienTaiId = val.chucVuHienTaiId;
      newObj.employeeId = val.employeeId;
      newObj.lyDoDeXuat = val.lyDoDeXuat;
      listEmp.push(newObj);
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
      fileUpload.FileInFolder.objectType = 'DXCV';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    let result: any = await this.employeeService.taoDeXuatChucVu(deXuatTangLuong, listEmp, listFileUploadModel, "DXCV");
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
      this.showMessage(msg);
      return;
    }
    let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
    this.showMessage(msg);

    this.router.navigate(['/employee/de-xuat-chuc-vu-detail', { deXuatTLId: this.encrDecrService.set(result.deXuatId) }]);

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
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });
      let sheetName = 'DoiChucVuNV_DeXuat';
      if (!workbook.Sheets[sheetName]) {
        let mgs = { severity: 'error', summary: 'Th??ng b??o:', detail: "File kh??ng h???p l???" };
        this.showMessage(mgs);
        return;
      }

      //l???y data t??? file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[sheetName];
      /* save data */
      let listCustomerRawData: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
      /* remove header */
      listCustomerRawData = listCustomerRawData.filter((e, index) => index != 0 && index != 1);
      /* n???u kh??ng nh???p  tr?????ng required th?? lo???i b??? */
      listCustomerRawData = listCustomerRawData.filter(e => (e[0] && e[1]));
      /* chuy???n t??? raw data sang model */
      let listEmpImport: Array<importNVByExcelModel> = [];
      listCustomerRawData?.forEach(_rawData => {
        /*
        empId: number;
        empCode: string;
        empName: string;
        oranganizationName: string;
        positionName: string;
        chucVuDeXuat: number;
        chucVuDeXuatId: number;
        lydo: string;
       */
        let customer = new importNVByExcelModel();
        customer.empCode = _rawData[0] ? _rawData[0].toString().trim() : '';
        customer.chucVuDeXuat = _rawData[1] ? _rawData[1].toString().trim() : '';
        customer.lydo = _rawData[2] ? _rawData[2] : "";
        listEmpImport = [...listEmpImport, customer];
      });
      /* t???t dialog import file, b???t dialog chi ti???t kh??ch h??ng import */
      this.displayChooseFileImportDialog = false;
      this.openDetailImportDialog(listEmpImport);
    }
  }

  importEmp() {
    this.displayChooseFileImportDialog = true;
  }

  openDetailImportDialog(listCustomerImport) {
    let ref = this.dialogService.open(ImportNvDeXuatChucVuComponent, {
      data: {
        listEmpImport: listCustomerImport,
        listAdded: this.listEmpSelected,
        listAllEmp: this.listEmpAdd,
        listPosition: this.chucVuList,
      },
      header: 'Nh???p excel danh s??ch nh??n vi??n ????? xu???t thay ?????i ch???c v???',
      width: '85%',
      height: '450px',
      baseZIndex: 1050,
      contentStyle: {
        "max-height": "800px",
        // "over-flow": "hidden"
      }
    });
    ref.onClose.subscribe((result: any) => {
      if (result.status) {
        this.listEmpSelected = this.listEmpSelected.concat(result.returnList);
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

  chooseFile(event: any) {
    this.fileName = event.target?.files[0]?.name;
    this.importFileExcel = event.target;
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

}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}
