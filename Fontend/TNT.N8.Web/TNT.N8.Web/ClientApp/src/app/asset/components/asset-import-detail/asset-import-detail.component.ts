import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms'

//SERVICES
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AssetService } from '../../services/asset.service';
//MODELS
import { TaiSanModel } from '../../models/taisan.model';



interface ResultDialog {
  status: boolean,
  statusImport: boolean
}

class Note {
  public code: string;
  public name: string;
}

class importTaiSanModel {
  maTaiSan: string;
  empCode: string;
  serialNumber: string;
  ownerShip: string;
  legalCode: string;
  assetType: string;
  moTa: string;
  fullName: string;
  account: string;
  userDepartment: string;
  expenseUnit: string;
  nguyenGia: number;
  khauHaoLuyKe: number;
  giaTriConLai: number;
  tgianKhauHao: number;
  tgianDaKhauHao: number;
  tgianConLai: number;
  khauHaoKyHt: number;
  ngayNhapKho: Date;
  tgianKtKhauHao: Date;
  locationBuilding: string;
  floor: string;
  seatCode: string;
  hienTrangTaiSan: string;
  mucDich: string;
  userConfirm: boolean;

  assetTypeId: any;
  locationBuildingId: any;
  floorId: any;
  hienTrangTaiSanId: any;
  mucDichId: any;

  listStatus: Array<Note>;
  isValid: boolean;
}


@Component({
  selector: 'app-asset-import-detail',
  templateUrl: './asset-import-detail.component.html',
  styleUrls: ['./asset-import-detail.component.css']
})
export class AssetImportDetailComponent implements OnInit {
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem('auth'));
  userId = this.auth.UserId;
  loading: boolean = false;
  @ViewChild('myTable') myTable: Table;

  today: Date = new Date();

  listTsStatus = [
    { value: 0, name: "Non-use" },
    { value: 1, name: "In-used" }
  ]

  listNote: Array<Note> = [
    /* required fields */
    { code: "required_AssetCode", name: "Nh???p AssetCode" },
    { code: "required_EmpCode", name: "Nh???p ID'EMP" },
    { code: "required_SerialNumber", name: "Nh???p Serial Number" },
    { code: "required_AssetType", name: "Nh???p AssetType" },
    { code: "required_NguyenGia", name: "Nh???p Nguy??n gi??" },
    { code: "required_TgKhauHao", name: "Nh???p TG kh???u hao" },
    { code: "required_NgayNhapKho", name: "Nh???p ng??y nh???p kho" },
    { code: "required_LocationBuilding", name: "Nh???p LocationBuilding" },
    { code: "required_Floor", name: "Nh???p Floor" },
    { code: "required_Status", name: "Nh???p Status" },
    { code: "required_Purpose", name: "Nh???p Purpose" },

    // check m?? code
    { code: "wrong_phanLoaiTs", name: "M?? ph??n lo???i t??i s???n kh??ng t???n t???i" },
    { code: "wrong_KhuVuc", name: "M?? khu v???c kh??ng t???n t???i" },
    { code: "wrong_VTVP", name: "M?? v??? tr?? v??n ph??ng kh??ng t???n t???i" },
    { code: "wrong_TTTS", name: "M?? tr???ng th??i t??i s???n kh??ng t???n t???i" },
    { code: "wrong_MucDichTs", name: "M?? m???c ????ch t??i s???n kh??ng t???n t???i" },

    { code: "wrong_EmployeeCode", name: "M?? nh??n vi??n kh??ng t???n t???i" },


    //Check m?? t??i s???n trong DB
    { code: "exist_inDB", name: "M?? t??i s???n ???? t???n t???i tr??n h??? th???ng" },

    //Check s??? l??n h??n 0
    { code: "giaTriNguyenGia_positive", name: "Gi?? tr??? nguy??n gi?? ph???i l???n h??n 0" },
    { code: "tgianKhauHao_positive", name: "Th???i gian kh???u hao ph???i l???n h??n 0" },
  ]

  listTaiSanImport: Array<importTaiSanModel> = [];

  //table
  rows: number = 10;
  columns: Array<any> = [];
  selectedColumns: Array<any> = [];
  selectedTaiSanImport: Array<importTaiSanModel> = [];

  listPhanLoaiTS: Array<any> = [];
  listKhuVuc: Array<any> = [];
  listMaTaiSan: Array<any> = [];
  listMucDichUser: Array<any> = [];
  listViTriVP: Array<any> = [];
  listEmployee: Array<any> = [];


  listPhuongPhapKhauHao = [
    {
      id: 1, name: 'Kh???u hao ???????ng th???ng'
    }];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private assetService: AssetService,
  ) {
    if (this.config.data) {
      this.listTaiSanImport = this.config.data.listTaiSanImport;
    }
  }

  async ngOnInit() {
    this.initTable();
    await this.getMasterdata();
    this.checkStatus(true);
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  initTable() {
    this.columns = [
      { field: 'maTaiSan', header: 'AssetCode', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: false },
      { field: 'empCode', header: "ID'EMP", textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: false },
      { field: 'serialNumber', header: 'Serial Number', textAlign: 'center', display: 'table-cell', width: '120px', type: 'text', isRequired: true, isList: false },
      { field: 'ownerShip', header: 'OwnerShip', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'legalCode', header: 'LegalCode', textAlign: 'center', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'assetType', header: 'AssetType', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'moTa', header: 'Description', textAlign: 'left', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'fullName', header: 'FullName', textAlign: 'left', display: 'table-cell', width: '120px', type: 'text', isRequired: false, isList: false },
      { field: 'account', header: 'Account', textAlign: 'left', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'userDepartment', header: 'UserDepartment', textAlign: 'left', display: 'table-cell', width: '100px', type: 'text', isRequired: false, isList: false },
      { field: 'expenseUnit', header: 'ExpenseUnit', textAlign: 'left', display: 'table-cell', width: '200px', type: 'text', isRequired: false, isList: false },
      { field: 'nguyenGia', header: 'Nguy??n gi??', textAlign: 'center', display: 'table-cell', width: '100px', type: 'number', isRequired: true, isList: false },
      { field: 'khauHaoLuyKe', header: 'Kh???u hao l??y k???', textAlign: 'center', display: 'table-cell', width: '100px', type: 'number', isRequired: false, isList: false },
      { field: 'giaTriConLai', header: 'Gi?? tr??? c??n l???i', textAlign: 'center', display: 'table-cell', width: '150px', type: 'number', isRequired: false, isList: false },
      { field: 'tgianKhauHao', header: 'TG Kh???u hao', textAlign: 'center', display: 'table-cell', width: '150px', type: 'number', isRequired: true, isList: false },
      { field: 'tgianDaKhauHao', header: 'TG ???? kh???u hao', textAlign: 'center', display: 'table-cell', width: '120px', type: 'number', isRequired: false, isList: false },
      { field: 'tgianConLai', header: 'TG c??n l???i', textAlign: 'center', display: 'table-cell', width: '100px', type: 'number', isRequired: false, isList: false },
      { field: 'khauHaoKyHt', header: 'Kh???u hao k??? hi???n t???i', textAlign: 'left', display: 'table-cell', width: '150px', type: 'number', isRequired: false, isList: false },
      { field: 'ngayNhapKho', header: 'Ng??y nh???p kho', textAlign: 'center', display: 'table-cell', width: '150px', type: 'date', isRequired: true, isList: false },
      { field: 'tgianKtKhauHao', header: 'Th???i gian kh???u hao', textAlign: 'center', display: 'table-cell', width: '150px', type: 'date', isRequired: false, isList: false },
      { field: 'locationBuilding', header: 'LocationBuilding', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'floor', header: 'Floor', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'seatCode', header: 'SeatCode', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'hienTrangTaiSan', header: 'Status', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'mucDich', header: 'Purpose', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: true, isList: true },
      { field: 'userConfirm', header: 'UserConfirm', textAlign: 'center', display: 'table-cell', width: '150px', type: 'text', isRequired: false, isList: false },
      { field: 'listStatus', header: 'Tr???ng th??i', textAlign: 'left', display: 'table-cell', width: '250px', type: 'listStatus' },
    ];
  }

  async getMasterdata() {
   
    this.loading = true;
    let result: any = await this.assetService.getMasterDataAssetForm();
    this.loading = false;
    if (result.statusCode == 200) {
      this.listPhanLoaiTS = result.listPhanLoaiTS;
      this.listKhuVuc = result.listProvinceModel;
      this.listMaTaiSan = result.listMaTS.map(x => x.toUpperCase().trim());
      this.listMucDichUser = result.listMucDichUser;
      this.listViTriVP = result.listViTriVP;
      this.listEmployee = result.listEmployee;
      this.listEmployee = this.listEmployee.map(item => item.employeeCode);
    }
  }

  checkStatus(autoAdd: boolean) {
   
    this.listTaiSanImport.forEach(taiSan => {
      taiSan.listStatus = [];
      taiSan.isValid = true;

      taiSan.assetType = taiSan.assetTypeId != null ? taiSan.assetTypeId.categoryName : taiSan.assetType;
      taiSan.locationBuilding = taiSan.locationBuildingId != null ? taiSan.locationBuildingId.provinceName : taiSan.locationBuilding;
      taiSan.floor = taiSan.floorId != null ? taiSan.floorId.categoryName : taiSan.floor;
      taiSan.hienTrangTaiSan = taiSan.hienTrangTaiSanId != null ? taiSan.hienTrangTaiSanId.name : taiSan.hienTrangTaiSan;
      taiSan.mucDich = taiSan.mucDichId != null ? taiSan.mucDichId.categoryName : taiSan.mucDich;

      /* required fields */
      if (!taiSan.maTaiSan?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_AssetCode")];
        taiSan.isValid = false;
      }


      if (!taiSan.empCode?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_EmpCode")];
        taiSan.isValid = false;
      }

      if (!taiSan.serialNumber?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_SerialNumber")];
        taiSan.isValid = false;
      }

      if (!taiSan.assetType?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_AssetType")];
        taiSan.isValid = false;
      }

      if (!taiSan.nguyenGia) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_NguyenGia")];
        taiSan.isValid = false;
      }

      if (!taiSan.tgianKhauHao) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_TgKhauHao")];
        taiSan.isValid = false;
      }

      if (!taiSan.ngayNhapKho) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_NgayNhapKho")];
        taiSan.isValid = false;
      }

      if (!taiSan.locationBuilding?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_LocationBuilding")];
        taiSan.isValid = false;
      }

      if (!taiSan.floor?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_Floor")];
        taiSan.isValid = false;
      }

      if (!taiSan.hienTrangTaiSan?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_Status")];
        taiSan.isValid = false;
      }

      if (!taiSan.mucDich?.trim()) {
        taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "required_Purpose")];
        taiSan.isValid = false;
      }


      //Check m?? t???n t???i trong db
      if (taiSan.maTaiSan) {
        if (this.listMaTaiSan.indexOf(taiSan.maTaiSan.toUpperCase().trim()) != -1) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "exist_inDB")];
          taiSan.isValid = false;
        }
      }

      //Check m?? t???n t???i trong list
      if (taiSan.maTaiSan) {
        if (this.listTaiSanImport.filter(x => x.maTaiSan.toUpperCase().trim() == taiSan.maTaiSan.toUpperCase().trim()).length > 1) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "exist_inDB")];
          taiSan.isValid = false;
        }
      }

      //check code

      //ph??n lo???i
      if (taiSan.assetType) {
        let data = this.listPhanLoaiTS.find(x => x.categoryName.toLowerCase().trim() == taiSan.assetType.toLowerCase().trim());
        if (!data) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "wrong_phanLoaiTs")];
          taiSan.isValid = false;
        } else {
          taiSan.assetTypeId = data;
        }
      }

      //v??ng
      if (taiSan.locationBuilding) {
        let data = this.listKhuVuc.find(x => x.provinceName.toLowerCase().trim() == taiSan.locationBuilding.toLowerCase().trim());
        if (!data) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "wrong_KhuVuc")];
          taiSan.isValid = false;
        } else {
          taiSan.locationBuildingId = data;
        }
      }

      //T???ng
      if (taiSan.floor) {
        let data = this.listViTriVP.find(x => x.categoryName.toLowerCase().trim() == taiSan.floor.toLowerCase().trim());
        if (!data) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "wrong_VTVP")];
          taiSan.isValid = false;
        } else {
          taiSan.floorId = data;
        }
      }

      //Hi???n tr???ng t??i s???n
      if (taiSan.hienTrangTaiSan) {
        let data = this.listTsStatus.find(x => x.name.toLowerCase().trim() == taiSan.hienTrangTaiSan.toLowerCase().trim());
        if (!data) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "wrong_TTTS")];
          taiSan.isValid = false;
        } else {
          taiSan.hienTrangTaiSanId = data;
        }
      }

      //M???c ????ch
      if (taiSan.mucDich) {
        let data = this.listMucDichUser.find(x => x.categoryName.toLowerCase().trim() == taiSan.mucDich.toLowerCase().trim());
        if (!data) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "wrong_MucDichTs")];
          taiSan.isValid = false;
        } else {
          taiSan.mucDichId = data;
        }
      }

      //Check m?? nh??n vi??n c?? t???n t???i tr??n h??? th???ng kh??ng
      if (taiSan.empCode) {
        let data = this.listEmployee.find(x => x.toLowerCase().trim() == taiSan.empCode.toLowerCase().trim());
        if (!data) {
          taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "wrong_EmployeeCode")];
          taiSan.isValid = false;
        }
      }


      //S??? ph???i l???n h??n 0
      if (taiSan.nguyenGia) {
        if (Number(taiSan.nguyenGia) != NaN) {
          if (Number(taiSan.nguyenGia) < 0) {
            taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "giaTriNguyenGia_positive")];
            taiSan.isValid = false;
          }
        }
      }

      if (taiSan.tgianKhauHao) {
        if (Number(taiSan.tgianKhauHao) != NaN) {
          if (Number(taiSan.tgianKhauHao) < 0) {
            taiSan.listStatus = [...taiSan.listStatus, this.listNote.find(e => e.code == "tgianKhauHao_positive")];
            taiSan.isValid = false;
          }
        }
      }
    });



    /* auto add to valid list */
    if (autoAdd) this.selectedTaiSanImport = this.listTaiSanImport.filter(e => e.isValid);
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
    if (this.selectedTaiSanImport.length == 0) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o', detail: 'Ch???n danh s??ch c???n import' };
      this.showMessage(msg);
      return;
    }
    let inValidRecord = this.selectedTaiSanImport.find(e => !e.isValid);
    if (inValidRecord) {
      let msg = { severity: 'error', summary: 'Th??ng b??o', detail: 'Danh s??ch kh??ng h???p l???' };
      this.showMessage(msg);
      return;
    }
    this.checkStatus(false);
    this.standardizedListCustomer();
    let listTaiSanAdditional: Array<TaiSanModel> = [];
    this.selectedTaiSanImport.forEach(item => {
      var newTaiSan = this.mapFormToTaiSanModel(item);
      listTaiSanAdditional.push(newTaiSan);
    });
    this.loading = true;
    let result: any = await this.assetService.importAsset(listTaiSanAdditional);
    this.loading = false;
    if (result.statusCode === 200) {
      let mgs = { severity: 'success', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
      this.ref.close(result);
    } else {
      let mgs = { severity: 'error', summary: 'Th??ng b??o', detail: result.message };
      this.showMessage(mgs);
      // this.ref.close(result);
    }
  }

  standardizedListCustomer() {
    this.listTaiSanImport.forEach(customer => {
      // customer.materialID = customer.materialID?.trim() ?? "";
    });
  }

  mapFormToTaiSanModel(taiSan): TaiSanModel {
   
    // empCode: string;

    let taiSanModel = new TaiSanModel();
    taiSanModel.maTaiSan = taiSan.maTaiSan.trim();
    taiSanModel.soSerial = taiSan.serialNumber.trim();
    taiSanModel.phanLoaiTaiSanId = taiSan.assetTypeId != null ? taiSan.assetTypeId.categoryId : "";
    taiSanModel.moTa = taiSan.moTa;
    taiSanModel.expenseUnit = taiSan.expenseUnit;
    taiSanModel.giaTriNguyenGia = taiSan.nguyenGia ? parseInt(taiSan.nguyenGia.toString().trim()) : null;

    taiSanModel.thoiGianKhauHao = taiSan.tgianKhauHao ? parseInt(taiSan.tgianKhauHao) : null;
    taiSanModel.ngayVaoSo = taiSan.ngayNhapKho != null ? convertToUTCTime(new Date(taiSan.ngayNhapKho)) : null;
    taiSanModel.khuVucTaiSanId = taiSan.locationBuildingId != null ? taiSan.locationBuildingId.provinceId : "";
    taiSanModel.viTriVanPhongId = taiSan.floorId != null ? taiSan.floorId.categoryId : "";
    taiSanModel.viTriTs = taiSan.seatCode;
    taiSanModel.mucDichId = taiSan.mucDichId != null ? taiSan.mucDichId.categoryId : "";

    taiSanModel.hienTrangTaiSan = taiSan.hienTrangTaiSanId != null ? taiSan.hienTrangTaiSanId.value : "";
    taiSanModel.userConfirm = taiSan.hienTrangTaiSanId != null ? taiSan.hienTrangTaiSanId.value : false;

    taiSanModel.tenTaiSan = taiSan.empCode; //L???y t???m t??n t??i s???n ????? l??u th??ng tin v??? empCode. T??n t??i s???n ??ang k c???n hi???n th???

    taiSanModel.createdById = this.auth.UserId;
    taiSanModel.createdDate = convertToUTCTime(new Date());
    taiSanModel.updatedById = null;
    taiSanModel.updatedDate = null;
    return taiSanModel;
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

