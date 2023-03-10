import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { WarehouseService } from '../../../services/warehouse.service';
import * as XLSX from 'xlsx';
import { SerialModel } from '../../../models/serials.model';

import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';


type AOA = any[][];


@Component({
  selector: 'app-pop-create-serial',
  templateUrl: './pop-create-serial.component.html',
  styleUrls: ['./pop-create-serial.component.css']
})
export class PopupCreateSerialComponent implements OnInit {
  popupForm: FormGroup;
  serialControl: FormControl;
  listSerialReturn: Array<SerialModel> = [];
  listserial = [];
  listserialProduct = [];
  lstSerialGet: Array<any> = [];
  dateNow: any;
  displayedColumns = ['serial', 'date'];
  dataObject: any;
  displayDialog: Boolean = false;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  rows = 10;
  lstSerialOld: Array<any> = [];

  constructor(
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public services: WarehouseService,
    private confirmationService: ConfirmationService,
    public messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.dataObject = this.config.data.object;
    if (this.dataObject.listSerial != null) {
      this.lstSerialOld.push.apply(this.lstSerialOld, this.dataObject.listSerial);
    };

    this.serialControl = new FormControl('', [Validators.required]);
    this.dateNow = Date.now();
    this.getMasterData();
  }

  async getMasterData() {
    let resultGetTop10: any = await this.services.getSerialAsync(null, null);
    this.lstSerialGet = resultGetTop10.lstSerial;
  };


  addRowSerial() {
    if (this.dataObject.listSerial == null) { this.dataObject.listSerial = [] };
    if (this.dataObject.listSerial.length >= this.dataObject.quantity) {
        this.messageService.clear();
        this.messageService.add({ key: 'error', severity: 'error', summary: "S??? l?????ng row c?? d??? li???u kh??ng ???????c l???p h??n s??? l?????ng nh???p", detail: 'Th??m Serial' });
        return;
    }
    else {
      this.dataObject.totalSerial += 1;

      //var serial: SerialModel = {
      //  SerialId: this.emptyGuid,
      //  SerialCode: '',
      //  ProductId: this.dataObject.productId,
      //  StatusId: this.emptyGuid,
      //  Active: true,
      //  WarehouseId: this.dataObject.wareHouseId,
      //  CreatedDate: new Date()
      //}
      var serial = {
        SerialId: this.emptyGuid,
        SerialCode: '',
        ProductId: this.dataObject.productId,
        StatusId: this.emptyGuid,
        Active: true,
        WarehouseId: this.dataObject.wareHouseId,
        CreatedDate: new Date(),
        error: false
      }


      this.dataObject.listSerial.unshift(serial);
    }
  }

  setValueSerial(stt: number) {
    this.listserial[stt - 1].serial = this.serialControl.value;
  }

  download() {
    this.services.downloadTemplateSerial().subscribe(response => {
      const result = <any>response;
      if (result.excelFile != null && result.statusCode === 202 || result.statusCode === 200) {
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
        const fileName = result.nameFile + ".xlsm";
        link.download = fileName;
        link.click();

      } else {

      }

    }, error => { });
  }

  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      let data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      data.shift();
      data.sort();
      ///
      if (data.length > 0) {
        for (var i = 0; i < data.length; ++i) {
          let checkexistSerial = this.lstSerialGet.find(f => f.serialCode == data[i][0]);
          if (checkexistSerial != null) {
            this.messageService.clear();
            this.messageService.add({ key: 'error', severity: 'error', summary: "S??? serial " + data[i][0] + " ???? tr??ng v???i s??? serial c???a s???n ph???m ???? l??u trong h??? th???ng", detail: 'Th??m Serial' });
            return;
          }
          if (data[i][0] == null || data[i][0] == '') {
            this.messageService.clear();
            this.messageService.add({ key: 'error', severity: 'error', summary: "File excel kh??ng ???????c ch???a d??ng tr???ng", detail: 'Th??m Serial' });
            return;
          }
          if (String(data[i][0]).length > 30) {
            this.messageService.clear();
            this.messageService.add({ key: 'error', severity: 'error', summary: "S??? Serial t???i ??a 30 k?? t???. M???i ki???m tra l???i", detail: 'Th??m Serial' });
            return;
          }
          if (String(data[i][0]).indexOf(' ') >= 0) {
            this.messageService.clear();
            this.messageService.add({ key: 'error', severity: 'error', summary: "S??? serial kh??ng ch???a k?? t??? space ?????u cu???i", detail: 'Th??m Serial' });
            return;
          }

        }

      }
      //check duplicate trong file excel
      let DataNoDuplicate = Array.from(new Set(data.map(a => a[0])));
      if (data.length > DataNoDuplicate.length) {
        this.messageService.clear();
        this.messageService.add({ key: 'error', severity: 'error', summary: "File excel t???n t???i s??? serial tr??ng nhau", detail: 'Th??m Serial' });
        return;
      }
      ////
      if (this.dataObject.listSerial == null) { this.dataObject.listSerial = [] };

      if ((this.dataObject.listSerial.length + data.length) > this.dataObject.quantity) {
        this.messageService.clear();
        this.messageService.add({ key: 'error', severity: 'error', summary: "S??? l?????ng row c?? d??? li???u kh??ng ???????c l???p h??n s??? l?????ng nh???p", detail: 'Th??m Serial' });
        return;
      }
      else {

        this.listserialProduct = [];
        for (let i = 0; i < data.length; i++) {

          //var serial: SerialModel = {
          //  SerialId: this.emptyGuid,
          //  SerialCode: data[i][0],
          //  ProductId: this.dataObject.productId,
          //  StatusId: this.emptyGuid,
          //  Active: true,
          //  WarehouseId: this.dataObject.wareHouseId,
          //  CreatedDate: new Date()
          //}
          var serial = {
            SerialId: this.emptyGuid,
            SerialCode: data[i][0],
            ProductId: this.dataObject.productId,
            StatusId: this.emptyGuid,
            Active: true,
            WarehouseId: this.dataObject.wareHouseId,
            CreatedDate: new Date(),
            error: false
          }

          this.dataObject.listSerial.push(serial);
        }
        this.dataObject.totalSerial = this.dataObject.listSerial.length;

      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  onCancelClick() {
    this.confirmationService.confirm({
      message: 'C??c thay ?????i s??? kh??ng ???????c l??u l???i.H??nh ?????ng n??y kh??ng th??? ???????c ho??n t??c ,b???n c?? ch???c ch???n mu???n h???y?',
      header: 'Th??ng b??o',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        //if (this.dataObject.listSerial == null) { this.dataObject.listSerial = [] };
        //var arrayTemp = [];
        //for (var i = 0; i < this.dataObject.listSerial.length; ++i) {
        //  if (this.dataObject.listSerial[i].SerialId !== '' && this.dataObject.listSerial[i].SerialId !== null
        //    && this.dataObject.listSerial[i].SerialId !== this.emptyGuid) {
        //    arrayTemp.push(this.dataObject.listSerial[i]);
        //  }
        //}
        //this.dataObject.listSerial = [];
        //this.dataObject.listSerial.push.apply(this.dataObject.listSerial, arrayTemp);
        //this.dataObject.totalSerial = arrayTemp.length;
        this.dataObject.listSerial = [];
        this.dataObject.listSerial.push.apply(this.dataObject.listSerial, this.lstSerialOld);
        this.dataObject.totalSerial = this.lstSerialOld.length;

        this.ref.close();
      },
      reject: () => {
        return;
      }
    });
  }

  onSaveClick() {
    var isError = false;
    for (let i = 0; i < this.dataObject.listSerial.length; i++) {
      if (this.dataObject.listSerial[i].error == true) {
        isError = true;
        break;
      }
    }
    if (isError == true) {
      this.messageService.clear();
      this.messageService.add({ key: 'error', severity: 'error', summary: "C?? l???i trong danh s??ch ", detail: 'Th??m Serial' });
      return;
    }

    for (let i = 0; i < this.dataObject.listSerial.length; i++) {
      if (this.dataObject.listSerial[i].SerialCode == '' || this.dataObject.listSerial[i].SerialCode == null) {
        this.messageService.clear();
        this.messageService.add({ key: 'error', severity: 'error', summary: "S??? Serial Code kh??ng ???????c ????? tr???ng ", detail: 'Th??m Serial' });
        this.dataObject.listSerial[i].error = true;
        return;
      }
    }

    this.ref.close();
  }
  pageChange(event: any) {
  }
  changeText(rowData: any) {
    rowData.error = false;
    rowData.SerialCode = rowData.SerialCode.trim();
    if (rowData.SerialCode.length > 30) {
      this.messageService.clear();
      this.messageService.add({ key: 'error', severity: 'error', summary: "S??? Serial t???i ??a 30 k?? t???. M???i ki???m tra l???i", detail: 'Th??m Serial' });
      rowData.error = true;
      return;
    }
    let checkExistInSystem = this.lstSerialGet.find(f => f.serialCode == rowData.SerialCode);
    if (checkExistInSystem != null) {
      this.messageService.clear();
      this.messageService.add({ key: 'error', severity: 'error', summary: "S??? Serial ???? t???n t???i trong h??? th???ng", detail: 'Th??m Serial' });
      rowData.error = true;
      return;
    }

    let DataNoDuplicate = Array.from(new Set(this.dataObject.listSerial.map(a => a.SerialCode)));
    if (this.dataObject.listSerial.length > DataNoDuplicate.length) {
      this.messageService.clear();
      this.messageService.add({ key: 'error', severity: 'error', summary: "S??? Serial kh??ng ???????c l???p l???i trong danh s??ch", detail: 'Th??m Serial' });
      rowData.error = true;
      return;
    }
  }
  cancelRow(rowData: any) {
    var index = this.dataObject.listSerial.findIndex(f => f.SerialCode == rowData.SerialCode);
    this.dataObject.listSerial.splice(index, 1);
    this.dataObject.totalSerial = this.dataObject.listSerial.length;

  }
  clearAllData() {
    this.dataObject.listSerial = [];
    this.dataObject.totalSerial = this.dataObject.listSerial.length;
  }

}
