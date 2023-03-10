import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms'

import { LeadImportModel } from '../../models/lead.model'

//SERVICES
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { LeadService } from "../../services/lead.service";

interface ResultDialog {
  status: boolean
}


class Note {
  public code: string;
  public name: string;
}

class provinceModel {
  provinceId: string;
  provinceName: string;
  provinceCode: string;
  provinceType: string;
}

class districtModel {
  districtId: string;
  districtName: string;
  districtType: string;
  districtCode: string;
  provinceId: string;
}

class wardModel {
  wardId: string;
  wardName: string;
  wardCode: string;
  districtId: string;
  wardType: string;
}

class genderModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isDefault: boolean;
}

class interestedGroupModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isDefault: boolean;
}

class paymentMethodModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isDefault: boolean;
}

class potentialModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  isDefault: boolean;
}

class leadModel {
  index: string;
  leadName: string;
  leadGender: string; //gender code
  leadPhone: string;
  identity: string;
  address: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  email: string;

  leadGenderName: string;
  interestedGroupCode: string;
  potentialCode: string;
  paymentMethodCode: string;
  companyName: string;

  provinceName: string;
  districtName: string;
  wardName: string;
  interestedGroupName: string;
  potentialName: string;
  paymentMethodName: string;

  //check status
  status: string;
  noteArray: Array<string>;
  listNoteId: Array<string>;

  //list id
  provinceId: string;
  districtId: string;
  wardId: string;
  interestedGroupId: string;
  potentialId: string;
  paymentMethodId: string;
}

@Component({
  selector: 'app-lead-import-detail',
  templateUrl: './lead-import-detail.component.html',
  styleUrls: ['./lead-import-detail.component.css'],
  providers: [ConfirmationService, MessageService, DialogService]
})
export class LeadImportDetailComponent implements OnInit {
  auth: any = JSON.parse(localStorage.getItem('auth'));
  userId = this.auth.UserId;
  loading: boolean = false;

  listNote: Array<Note> = [
    { code: "required_name", name: "Kh??ng ???????c ????? tr???ng t??n kh??ch h??ng" },
    { code: "required_phone", name: "Kh??ng ???????c ????? tr???ng s??? ??i???n tho???i" },

    { code: "duplicate_email", name: "Tr??ng email" },
    { code: "duplicate_phone", name: "Tr??ng s??? ??i???n tho???i" },

    { code: "exist_email", name: "Email ???? ???????c ????ng k??" },
    { code: "exist_phone", name: "S??? ??i???n tho???i ???? ???????c ????ng k??" },

    { code: "invalid_province", name: "T???nh/Th??nh ph??? kh??ng h???p l???" },
    { code: "invalid_district", name: "Qu???n/Huy???n kh??ng h???p l???" },
    { code: "invalid_ward", name: "X??/Ph?????ng kh??ng h???p l???" },
  ]
  //routing data
  listImportLead: Array<leadModel> = [];
  //master data
  listProvince: Array<provinceModel> = [];
  listDistrict: Array<districtModel> = [];
  listWard: Array<wardModel> = [];
  listDistrictByProvince: Array<districtModel> = [];
  listWardByDistrict: Array<wardModel> = [];
  listGender: Array<genderModel> = [];
  listInterestedGroup: Array<interestedGroupModel> = [];
  listPotential: Array<potentialModel> = [];
  listPaymentMethod: Array<paymentMethodModel> = [];
  listEmailLead: Array<string> = [];
  listEmailCustomer: Array<string> = [];
  listPhoneLead: Array<string> = [];
  listPhoneCustomer: Array<string> = [];
  //table
  rows: number = 10;
  colsListLead: any[];
  selectedColumns: any[];
  listSelectedLead: Array<leadModel> = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
    private leadService: LeadService
  ) { }

  ngOnInit() {
    this.listImportLead = this.config.data.listImportLead;
    this.initTable();
    this.getMasterdata();
  }

  initTable() {
    this.colsListLead = [
      { field: 'check', header: '', textAlign: 'center', width: "1rem" },
      { field: 'leadName', header: 'T??n', textAlign: 'left', display: 'table-cell' },
      { field: 'leadGenderName', header: 'Gi???i t??nh', textAlign: 'left', display: 'table-cell' },
      { field: 'leadPhone', header: '??i???n tho???i', textAlign: 'left', display: 'table-cell' },
      { field: 'identity', header: 'S??? CMND/H??? chi???u', textAlign: 'left', display: 'table-cell' },
      { field: 'address', header: '?????a ch???', textAlign: 'center', display: 'table-cell' },
      { field: 'provinceName', header: 'T???nh/Th??nh ph???', textAlign: 'center', display: 'table-cell' },
      { field: 'districtName', header: 'Qu???n/Huy???n', textAlign: 'center', display: 'table-cell' },
      { field: 'wardName', header: 'X??/Ph?????ng', textAlign: 'center', display: 'table-cell' },
      { field: 'email', header: 'Email', textAlign: 'left', display: 'table-cell' },
      { field: 'interestedGroupName', header: 'Nhu c???u s???n ph???m', textAlign: 'center', display: 'table-cell' },
      { field: 'potentialName', header: 'M???c ????? ti???m n??ng', textAlign: 'center', display: 'table-cell' },
      { field: 'paymentMethodName', header: 'Ph????ng th???c thanh to??n', textAlign: 'center', display: 'table-cell' },
      { field: 'companyName', header: 'C??ng ty', textAlign: 'cenleftter', display: 'table-cell' },
      { field: 'status', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell' },
      { field: 'note', header: 'Ghi ch??', textAlign: 'left', display: 'table-cell' }
    ];
    this.selectedColumns = this.colsListLead;
  }

  async getMasterdata() {
    this.loading = true;
    let result: any = await this.leadService.importLeadDetail();
    this.loading = false;
    if (result.statusCode === 200) {
      this.listProvince = result.listProvince;
      this.listDistrict = result.listDistrict;
      this.listWard = result.listWard;

      this.listDistrictByProvince = this.listDistrict;
      this.listWardByDistrict = this.listWard;

      this.listGender = result.listGender;
      this.listInterestedGroup = result.listInterestedGroup;
      this.listPotential = result.listPotential;
      this.listPaymentMethod = result.listPaymentMethod;
      this.listEmailLead = result.listEmailLead;
      this.listEmailCustomer = result.listEmailCustomer;
      this.listPhoneLead = result.listPhoneLead;
      this.listPhoneCustomer = result.listPhoneCustomer;
      //x??? l?? data t??? file exel ?????y l??n
      this.validateData();
      //ki???m tra tr???ng th??i
      this.checkStatus();

    } else {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', result.messageCode);
    }
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  onCancel() {
    let result: ResultDialog = {
      status: false
    };
    this.ref.close(result);
  }

  changeGender(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedGender: genderModel = event.value;
    rowData.leadGender = selectedGender.categoryCode;
    this.checkStatus();
  }

  changeProvince(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedProvince: provinceModel = event.value;
    rowData.provinceCode = selectedProvince.provinceCode;
    rowData.provinceId = selectedProvince.provinceId;

    this.listDistrictByProvince = [];
    let currentProvince: provinceModel = event.value;
    this.listDistrictByProvince = this.listDistrict.filter(e => e.provinceId === currentProvince.provinceId);
    this.checkStatus();
    return false;
  }

  onClickDistrict(rowData: leadModel) {
    this.listDistrictByProvince = [];
    let _provinceId = rowData.provinceId;
    this.listDistrictByProvince = this.listDistrict.filter(e => e.provinceId === _provinceId);
    this.checkStatus();
  }

  changeDistrict(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedDistrict: districtModel = event.value;
    rowData.districtName = selectedDistrict.districtName;
    rowData.districtId = selectedDistrict.districtId;

    this.listWardByDistrict = [];
    let currentDistrict: districtModel = event.value;
    this.listWardByDistrict = this.listWard.filter(e => e.districtId === currentDistrict.districtId);
    this.checkStatus();
    return false
  }

  onClickWard(rowData: leadModel) {
    this.listWardByDistrict = [];
    let _district = rowData.districtId;
    this.listWardByDistrict = this.listWard.filter(e => e.districtId === _district);
    this.checkStatus();
  }

  changeWard(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedWard: wardModel = event.value;
    rowData.wardName = selectedWard.wardName;
    rowData.wardId = selectedWard.wardId;
    this.checkStatus();
    return false
  }

  changeGroup(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedGroup: interestedGroupModel = event.value;
    rowData.interestedGroupCode = selectedGroup.categoryCode;
    rowData.interestedGroupId = selectedGroup.categoryId;
    this.checkStatus();
  }

  changePotential(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedPotential: potentialModel = event.value;
    rowData.potentialCode = selectedPotential.categoryCode;
    rowData.potentialId = selectedPotential.categoryId;
    this.checkStatus();
  }

  changePayment(event: any, rowData: leadModel) {
    if (event.originalEvent === undefined || event.value === null) return;
    let selectedPayment: paymentMethodModel = event.value;
    rowData.paymentMethodCode = selectedPayment.categoryCode;
    rowData.paymentMethodId = selectedPayment.categoryId;
    this.checkStatus();
  }

  validateData() {
    this.listImportLead.forEach(lead => {

      let _gender = this.listGender.find(e => e.categoryCode == lead.leadGender);
      lead.leadGenderName = _gender ? _gender.categoryName : '';

      let _province = this.listProvince.find(e => e.provinceCode == lead.provinceCode);
      lead.provinceName = _province ? _province.provinceName : '';
      lead.provinceId = _province ? _province.provinceId : null;

      let _district = this.listDistrict.find(e => e.districtCode == lead.districtCode);
      lead.districtName = _district ? _district.districtName : '';
      lead.districtId = _district ? _district.districtId : null;

      let _ward = this.listWard.find(e => e.wardCode == lead.wardCode);
      lead.wardName = _ward ? _ward.wardName : '';
      lead.wardId = _ward ? _ward.wardId : null;

      let _interestedGroup = this.listInterestedGroup.find(e => e.categoryCode == lead.interestedGroupCode);
      lead.interestedGroupName = _interestedGroup ? _interestedGroup.categoryName : '';
      lead.interestedGroupId = _interestedGroup ? _interestedGroup.categoryId : null;

      let _potential = this.listPotential.find(e => e.categoryCode == lead.potentialCode);
      lead.potentialName = _potential ? _potential.categoryName : '';
      lead.potentialId = _potential ? _potential.categoryId : null;

      let _paymentMethod = this.listPaymentMethod.find(e => e.categoryCode == lead.paymentMethodCode);
      lead.paymentMethodName = _paymentMethod ? _paymentMethod.categoryName : '';
      lead.paymentMethodId = _paymentMethod ? _paymentMethod.categoryId : null;
    });
  }

  checkStatus() {
    this.listImportLead.forEach(lead => {
      lead.noteArray = [];
      lead.listNoteId = [];

      let valid = true;

      //check ten khach hang
      if (lead.leadName.trim() === "") {
        valid = false;
        //th??m note n???u ch??a t???n t???i
        let noteId = lead.listNoteId.find(e => e == "required_name");
        if (noteId === undefined) {
          lead.listNoteId.push("required_name");
        }
      }

      //check phone
      if (lead.leadPhone.trim() === "") {
        valid = false;
        //th??m note n???u ch??a t???n t???i
        let noteId = lead.listNoteId.find(e => e == "required_phone");
        if (noteId === undefined) {
          lead.listNoteId.push("required_phone");
        }
      }

      //check so dien thoai
      let otherPhone = this.listImportLead.filter(e => (e !== lead && (lead.leadPhone.trim() !== ""))).map(e => e.leadPhone);
      if (otherPhone.includes(lead.leadPhone)) {
        valid = false;
        let noteId = lead.listNoteId.find(e => e == "duplicate_phone");
        if (noteId === undefined) {
          lead.listNoteId.push("duplicate_phone");
        }
      }

      let checkPhoneLead = this.listPhoneLead.find(e => (e === lead.leadPhone) && (lead.leadPhone.trim() !== ""));
      let checkPhoneCustomer = this.listPhoneCustomer.find(e => (e === lead.leadPhone) && (lead.leadPhone.trim() !== ""));
      if (checkPhoneLead !== undefined || checkPhoneCustomer !== undefined) {
        valid = false;
        let noteId = lead.listNoteId.find(e => e == "exist_phone");
        if (noteId === undefined) {
          lead.listNoteId.push("exist_phone");
        }
      }

      //check trung email
      let otherEmail = this.listImportLead.filter(e => (e !== lead && (lead.email.trim() !== ""))).map(e => e.email);
      if (otherEmail.includes(lead.email)) {
        valid = false;
        let noteId = lead.listNoteId.find(e => e == "duplicate_email");
        if (noteId === undefined) {
          lead.listNoteId.push("duplicate_email");
        }
      }

      let checkEmailLead = this.listEmailLead.find(e => (e === lead.email) && (lead.email.trim() !== ""));
      let checkEmailCustomer = this.listEmailCustomer.find(e => (e === lead.email) && (lead.email.trim() !== ""));

      if (checkEmailLead !== undefined || checkEmailCustomer !== undefined) {
        valid = false;
        let noteId = lead.listNoteId.find(e => e == "exist_email");
        if (noteId === undefined) {
          lead.listNoteId.push("exist_email");
        }
      }

      //check province
      let _province = undefined;
      if(lead.provinceId == null){
        _province = this.listProvince.find(e => e.provinceName.toLowerCase() == lead.provinceCode.toLowerCase());
      }
      else{
        _province = this.listProvince.find(e => e.provinceId == lead.provinceId);
      }
      
      if (_province === undefined) {
        valid = false;
        let noteId = lead.listNoteId.find(e => e == "invalid_province");
        if (noteId === undefined) {
          lead.listNoteId.push("invalid_province");
        }
      } else {
        lead.provinceId = _province.provinceId;
        lead.provinceCode = _province.provinceCode;
        lead.provinceCode = _province.provinceCode;
        //ki???m tra qu???n huy???n n???u t???nh/th??nh ph??? h???p l???
        let listDistrictById = this.listDistrict.filter(e => e.provinceId == _province.provinceId);
        let _district = undefined;
        if(lead.districtId == null){
          _district = listDistrictById.find(e => e.districtName.toLowerCase() == lead.districtCode.toLowerCase());
        }
        else{
          _district = listDistrictById.find(e => e.districtId == lead.districtId);
        }
         
        if (_district === undefined) {
          valid = false;
          let noteId = lead.listNoteId.find(e => e == "invalid_district");
          if (noteId === undefined) {
            lead.listNoteId.push("invalid_district");
          }
        } else {          
          lead.districtId = _district.districtId;
          lead.districtName = _district.districtName;
          lead.districtCode = _district.districtCode;
          //ki???m tra X?? ph?????ng n???u qu???n huy???n h???p l???
          let listWardByDistrict = this.listWard.filter(e => e.districtId == _district.districtId);
          let _ward = undefined;
          if(lead.wardId == null){
            _ward = listWardByDistrict.find(e => e.wardName.toLowerCase() == lead.wardCode.toLowerCase());
          }
          else{
            _ward = listWardByDistrict.find(e => e.wardId == lead.wardId);
          }
         
          if (_ward === undefined) {
            valid = false;
            let noteId = lead.listNoteId.find(e => e == "invalid_ward");
            if (noteId === undefined) {
              lead.listNoteId.push("invalid_ward");
            }
          }
          else{                 
            lead.wardId = _ward.wardId;
            lead.wardName = _ward.wardName;
            lead.wardCode = _ward.wardCode;
          }
        }
      }

      //sumary
      lead.status = valid === true ? "VALID" : "INVALID";
      lead.noteArray = this.listNote.filter(e => lead.listNoteId.includes(e.code)).map(e => e.name);
    });
  }

  async importCustomer() {

    if (this.listSelectedLead.length == 0) {
      this.clearToast();
      this.showToast('warn', 'Th??ng b??o', 'Ch???n danh s??ch c???n import');
      return;
    }

    let inValidRecord = this.listSelectedLead.find(e => e.status === "INVALID");
    if (inValidRecord !== undefined) {
      this.showToast('error', 'Th??ng b??o', 'Danh s??ch kh??ng h???p l???');
      return;
    }

    let listLead = this.mappingDataToModel(this.listSelectedLead);
    this.loading = true;
    let result: any = await this.leadService.importListLead(listLead, this.userId);
    if (result.statusCode === 200) {
      let result: ResultDialog = {
        status: true
      }
      this.ref.close(result)
    } else {
      this.clearToast();
      this.showToast('error', 'Th??ng b??o', result.messageCode);
    }

    this.loading = false;
  }

  mappingDataToModel(listLead: Array<leadModel>): Array<LeadImportModel> {
    let result: Array<LeadImportModel> = [];

    listLead.forEach(e => {
      let newLead = new LeadImportModel();
      newLead.FullName = ValidateString(e.leadName);
      newLead.Gender = ValidateString(e.leadGender);
      newLead.Phone =  ValidateString(e.leadPhone);
      newLead.Identity = ValidateString(e.identity);
      newLead.Address = ValidateString(e.address);
      newLead.ProvinceId = e.provinceId;
      newLead.DistrictId = e.districtId;
      newLead.WardId = e.wardId;
      newLead.Email = ValidateString(e.email);
      newLead.InterestedGroupId = e.interestedGroupId;
      newLead.PotentialId = e.potentialId;
      newLead.PaymentMethodId = e.paymentMethodId;
      newLead.CompanyName =ValidateString(e.companyName);

      result.push(newLead);
    });

    return result;
  }

}

function ValidateString(str: string) {
  if (!str) return "";
  return str.trim();
}
