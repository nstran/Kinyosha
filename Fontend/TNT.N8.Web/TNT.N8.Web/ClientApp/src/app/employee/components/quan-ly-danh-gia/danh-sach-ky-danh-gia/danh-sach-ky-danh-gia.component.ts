import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EmployeeService } from '../../../services/employee.service';
import { DialogService } from 'primeng';
import { EncrDecrService } from '../../../../shared/services/encrDecr.service';

@Component({
  selector: 'app-danh-sach-ky-danh-gia',
  templateUrl: './danh-sach-ky-danh-gia.component.html',
  styleUrls: ['./danh-sach-ky-danh-gia.component.css']
})
export class DanhSachKyDanhGiaComponent implements OnInit {
  auth = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  userPermission: any = localStorage.getItem("UserPermission").split(',');
  messages: any;

  nguoiDeXuatId = null;
  thoiGianDeXuat = null;
  trangThai = null;

  minYear: number = 2000;
  currentYear: number = (new Date()).getFullYear();
  filterGlobal: string;

  leftColNumber: number = 12;
  rightColNumber: number = 0;


  nowDate: Date = new Date();
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  @ViewChild('myTable') myTable: Table;
  colsList: any;
  selectedColumns: any[];

  listKyDanhGia: any[] = [];

  today = new Date();

  actionDelete: boolean = true;
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


  goToCreate() {
    this.router.navigate(['/employee/tao-moi-ky-danh-gia']);
  }

  async ngOnInit() {

    //Danh sach
    let resource0 = "hrm/employee/danh-sach-ky-danh-gia/";
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
        let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n kh??ng c?? quy???n truy c???p' };
        this.showMessage(msg);
      }
    }

    //Chi ti???t
    let resource = "hrm/employee/chi-tiet-ky-danh-gia/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.actionDelete = false;
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
    }

    this.getMasterData();
    this.initTable();
  }

  initTable() {
    this.colsList = [
      { field: 'maKyDanhGia', header: 'M?? k??? ????nh gi??', textAlign: 'left', display: 'table-cell' },
      { field: 'tenKyDanhGia', header: 'T??n k??? ????nh gi??', textAlign: 'left', display: 'table-cell' },
      { field: 'createdDate', header: 'Ng??y t???o', textAlign: 'left', display: 'table-cell' },
      { field: 'trangThaiDanhGia', header: 'Tr???ng th??i', textAlign: 'center', display: 'table-cell' },
    ];

    this.selectedColumns = this.colsList;
  }
  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  async getMasterData() {

    this.loading = true;
    let result: any = await this.employeeService.danhSachKyDanhGia();
    this.loading = false;
    if (result.statusCode != 200) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'L???y th??ng tin kh??ng th??nh c??ng' };
      this.showMessage(msg);
      return;
    }
    this.listKyDanhGia = result.listKyDanhGia;
  }



  deleteKyDanhGia(rowData: any) {
    this.confirmationService.confirm({
      message: 'B???n c?? ch???c ch???n mu???n x??a?',
      accept: () => {
        this.loading = true;
        this.employeeService.deleteKyDanhGia(rowData.kyDanhGiaId).subscribe(response => {
          let result = <any>response;
          this.loading = false;
          if (result.statusCode == 200) {
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: result.message };
            this.listKyDanhGia = this.listKyDanhGia.filter(item => item.kyDanhGiaId != rowData.kyDanhGiaId);
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.message };
            this.showMessage(msg);
          }
        }, error => { });
      }
    });
  }

  onViewDetail(rowData: any) {
    this.router.navigate(['/employee/chi-tiet-ky-danh-gia', { kyDanhGiaId: this.encrDecrService.set(rowData.kyDanhGiaId) }]);
  }

}
