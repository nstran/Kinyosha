import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import * as $ from 'jquery';
import { VendorOrderModel } from '../../models/vendorOrder.model';
import { VendorOrderDetailModel } from '../../models/vendorOrderDetail.model';
import { VendorOrderProductDetailProductAttributeValueModel } from '../../models/vendorOrderProductDetailProductAttributeValue.model';
import { VendorService } from "../../services/vendor.service";
import { GetPermission } from '../../../shared/permission/get-permission';

import { AddVendorOrderProductComponent } from '../add-vendor-order-product/add-vendor-order-product.component';
import { PopupAddEditCostVendorOrderComponent } from '../../components/popup-add-edit-cost-vendor-order/popup-add-edit-cost-vendor-order.component';

import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

import { TranslateService } from '@ngx-translate/core';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { NoteModel } from '../../../shared/models/note.model';
import { NoteService } from '../../../shared/services/note.service';
import { ForderConfigurationService } from '../../../admin/components/folder-configuration/services/folder-configuration.service';
import { QuickCreateVendorComponent } from '../../../shared/components/quick-create-vendor/quick-create-vendor.component';
import { ContractService } from '../../../sales/services/contract.service';

class DiscountType {
  name: string;
  code: string;
  value: boolean;
}

interface ConfigDialogOrderDetail {
  isCreate: boolean;
  vendor: vendorCreateOrderModel;
  vendorOrderDetail: VendorOrderDetailModel;
  isProcurementRequestItem: boolean;
  quantityApproval: number;
  isEdit: boolean;
  type: string;
}

interface ResultDialog {
  status: boolean,
  vendorOrderDetail: VendorOrderDetailModel
}

class PurchaseOrderStatus {
  purchaseOrderStatusId: string;
  purchaseOrderStatusCode: string;
  description: string;
}

class employeeModel {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
}

class paymentMethod {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
}

class vendorCreateOrderModel {
  fullAddressVendor: string;
  listVendorContact: Array<vendorContact>;
  paymentId: string;
  vendorEmail: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  vendorCode: string;
  constructor() {
    this.listVendorContact = [];
  }
}

class vendorContact {
  contactId: string;
  fullName: string;
  phone: string;
  email: string;
}

class bankAccount {
  bankAccountId: string;
  objectId: string;
  accountName: string; //ch??? t??i kho???n
  accountNumber: string; //s??? t??i kho???n
  bankName: string; //t??n ng??n h??ng
  branchName: string; //chi nh??nh
}

class Warehouse {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
}

interface CostModel {
  index: number,
  costId: string,
  costCode: string,
  costName: string,
  costCodeName: string,
  unitPrice: any,
  statusId: string,
  organizationId: string
}

interface ResultCostDialog {
  status: boolean,  //L??u th?? true, H???y l?? false
  costModel: CostModel,
}

class VendorOrderProcurementRequestMapping {
  vendorOrderProcurementRequestMappingId: string;
  vendorOrderId: string;
  procurementRequestId: string;
  active: boolean;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: Date;

  constructor() {
    this.vendorOrderProcurementRequestMappingId = null;
    this.vendorOrderId = null;
    this.procurementRequestId = null;
    this.active = null;
    this.createdById = null;
    this.createdDate = null;
    this.updatedById = null;
    this.updatedDate = null;
  }
}

class VendorOrderCostDetail {
  vendorOrderCostDetailId: string;
  costId: string;
  vendorOrderId: string;
  unitPrice: number;
  costName: string;
  active: boolean;
  createdById: string;
  createdDate: Date;

  constructor() {
    this.vendorOrderCostDetailId = null;
    this.costId = null;
    this.vendorOrderId = null;
    this.unitPrice = null;
    this.costName = null;
    this.active = null;
    this.createdById = null;
    this.createdDate = null;
  }
}

/* Begin: Ghi ch?? */
interface NoteDocument {
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

interface Note {
  active: boolean;
  createdById: string;
  createdDate: Date;
  description: string;
  noteDocList: Array<NoteDocument>;
  listFile: Array<FileInFolder>
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

interface FileNameExists {
  oldFileName: string;
  newFileName: string
}

class FileInFolder {
  fileInFolderId: string;
  folderId: string;
  fileName: string;
  objectId: string;
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
/* End: Ghi ch?? */

class ItemInvalidModel {
  procurementRequestItemId: string;
  remainQuantity: number;
}

class SoDuSanPhamTrongKho {
  productId: string;
  warehouseId: string;
  warehouseName: string;
  sucChua: number;
}

@Component({
  selector: 'app-detail-vendor-order',
  templateUrl: './detail-vendor-order.component.html',
  styleUrls: ['./detail-vendor-order.component.css'],
  providers: [ConfirmationService, MessageService, DialogService]
})
export class DetailVendorOrderComponent implements OnInit {
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  userPermission: any = localStorage.getItem("UserPermission").split(',');
  isManager: boolean = localStorage.getItem('IsManager') == "true" ? true : false;
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;

  //permission
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionSendApprove: boolean = true;
  actionApprove: boolean = true;
  actionReject: boolean = true;

  auth: any = JSON.parse(localStorage.getItem("auth"));
  fixed: boolean = false;
  withFiexd: string = "";
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }

  /* Form */
  createOrderForm: FormGroup;
  orderCodeControl: FormControl;
  orderDateControl: FormControl;
  orderStatusControl: FormControl;
  ordererControl: FormControl;
  descriptionControl: FormControl;
  noteControl: FormControl;
  vendorControl: FormControl;
  vendorContactControl: FormControl;
  paymentControl: FormControl;
  bankAccountControl: FormControl;
  // receivedDateControl: FormControl;
  // receivedHourControl: FormControl;
  // recipientNameControl: FormControl;
  // shipperNameControl: FormControl;
  // locationOfShipmentControl: FormControl;
  // placeOfDeliveryControl: FormControl;
  // shippingNoteControl: FormControl;
  // recipientPhoneControl: FormControl;
  // recipientEmailControl: FormControl;
  discountTypeControl: FormControl;
  discountValueControl: FormControl;
  procurementRequestControl: FormControl;
  contractControl: FormControl;
  warehouseControl: FormControl;
  totalCostControl: FormControl;
  paymentMethodTotalPanelControl: FormControl;
  /* End */

  /* Valid Form */
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  /* End */
  //master data
  listOrderStatus: Array<PurchaseOrderStatus> = [];
  listEmployee: Array<employeeModel> = [];
  listPaymentMethod: Array<paymentMethod> = [];
  listVendorCreateOrderModel: Array<vendorCreateOrderModel> = [];
  listBankAccount: Array<bankAccount> = [];
  vendorOrderById: VendorOrderModel;
  listVendorOrderDetailById: Array<VendorOrderDetailModel> = [];
  listProcurementRequest: Array<any> = [];
  listContract: Array<any> = [];
  listWareHouse: Array<any> = [];
  listProcurementRequestId: Array<string> = [];
  isShowPopupTonKho: boolean = false;

  listCurrentVendorContact: Array<vendorContact> = [];
  listCurrentBankAccount: Array<bankAccount> = [];
  listSucChuaSanPhamTrongKho: Array<SoDuSanPhamTrongKho> = [];

  optionCustomer: string = '2';
  listCustomer: Array<any> = [];
  customerEmail: string = '';
  customerPhone: string = '';
  fullAddress: string = '';
  leadName: string = '';
  leadEmail: string = '';
  leadPhone: string = '';
  leadFullAddress: string = '';
  displayApprovalReject: boolean = false;
  isApproval: boolean = false;
  descriptionApprovalReject: string = '';

  statusName: string;
  statusCode: string;
  actionAdd: boolean = true;
  //table
  cols: any[];
  selectedColumns: any[];
  selectedItem: any;

  colsCost: any[];
  selectedColumnsCost: any[];
  selectedItemCost: any;
  selectedColumnsReceiving: any[];
  selectedColumnsKiemTraTonKho: any[];

  file: File[];
  listFile: Array<FileInFolder> = [];
  colsFile: any[];

  listCostModel: Array<CostModel> = [];

  selectedCostType: string = '0';

  /*Data popup inline*/
  display: boolean = false;
  popupProductName: string = '';
  popupCost: any = 0;

  listInventoryReceivingVoucher: Array<any> = [];

  listVendorOrderDetail: Array<VendorOrderDetailModel> = [];
  discountTypeList: Array<DiscountType> = [
    { "name": "Theo %", "code": "PT", "value": true },
    { "name": "S??? ti???n", "code": "ST", "value": false }
  ];

  totalAmountBeforeVat: number = 0; //t???ng th??nh ti???n tr?????c thu???
  totalAmountVat: number = 0; //T???ng ti???n thu???
  totalAmountCost: number = 0; //T???ng ti???n chi ph?? mua h??ng
  totalAmountBeforeDiscount: number = 0;
  totalAmountAferDiscount: number = 0; //t???ng ti???n sau khi tr??? chi???t kh???u
  discountPerOrder: number = 0; //chi???t kh???u theo ????n h??ng
  dataRow: VendorOrderDetailModel = null;

  TotalPayment: number = 0; // t???ng ti???n ???? thanh to??n
  TotalPaymentLeft: number = 0; // T???ng ti???n c??n ph???i thanh to??n

  vendorOrderId: string = this.emptyGuid;

  /* Begin: Ghi ch?? */
  noteContent: string = '';
  @ViewChild('fileNoteUpload', { static: true }) fileNoteUpload: FileUpload;
  listUpdateFileNote: Array<FileInFolder> = [];
  colsNoteFile: Array<any> = [];
  noteHistory: Array<Note> = [];

  messageConfirm: string = '';
  messageTitle: string = '';
  messageError: string = '';

  noteId: string = null;

  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  isEditNote: boolean = false;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  /* End: Ghi ch?? */

  isInvalidItem: boolean = false;
  isOpenPopupInvalidItem: boolean = false;
  isUserSendAproval: boolean = false; // c?? ph???i ng?????i g???i ph?? duy???t kh??ng
  listItemInvalidModel: Array<ItemInvalidModel> = [];

  isPayment: boolean = true;

  isShow: boolean = true;
  colLeft: number = 9;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private getPermission: GetPermission,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private renderer: Renderer2,
    private imageService: ImageUploadService,
    private noteService: NoteService,
    private folderService: ForderConfigurationService,
    private contractService: ContractService) {
    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (this.saveAndCreate) {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target) &&
            !this.saveAndCreate.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        } else {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm();
    let resource = "buy/vendor/detail-order/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("send_approve") == -1) {
        this.actionSendApprove = false;
      }
      if (listCurrentActionResource.indexOf("approve") == -1) {
        this.actionApprove = false;
      }
      if (listCurrentActionResource.indexOf("reject") == -1) {
        this.actionReject = false;
      }
      if (listCurrentActionResource.indexOf("payment") == -1) {
        this.isPayment = false;
      }
      this.route.params.subscribe(params => { this.vendorOrderId = params['vendorOrderId'] });
     // this.setForm();
      this.setTable();
      this.getMasterData();
    }
  }

  setForm() {
    let emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';

    this.orderCodeControl = new FormControl(null, [Validators.required]);
    this.orderDateControl = new FormControl(new Date(), [Validators.required]);
    this.orderStatusControl = new FormControl(null, [Validators.required]);
    this.ordererControl = new FormControl(null, [Validators.required]);
    this.descriptionControl = new FormControl(null);
    this.noteControl = new FormControl(null);
    this.vendorControl = new FormControl(null, [Validators.required]);
    this.vendorContactControl = new FormControl(null);
    this.paymentControl = new FormControl(null);
    this.bankAccountControl = new FormControl(null);
    // this.receivedDateControl = new FormControl(new Date(), [Validators.required]);
    // this.receivedHourControl = new FormControl(null);
    // this.recipientNameControl = new FormControl(null, [Validators.required, forbiddenSpaceText]);
    // this.shipperNameControl = new FormControl(null, [Validators.required, forbiddenSpaceText]);
    // this.locationOfShipmentControl = new FormControl(null);
    // this.placeOfDeliveryControl = new FormControl(null, [Validators.required, forbiddenSpaceText]);
    // this.recipientPhoneControl = new FormControl(null, [Validators.pattern(this.getPhonePattern())]);
    // this.recipientEmailControl = new FormControl(null, [Validators.pattern(emailPattern)]);
    // this.shippingNoteControl = new FormControl(null);
    this.discountTypeControl = new FormControl(this.discountTypeList.find(x => x.code == "PT"));
    this.discountValueControl = new FormControl('0', ValidationMaxValuePT(100));
    this.procurementRequestControl = new FormControl([]);
    this.contractControl = new FormControl(null);
    this.warehouseControl = new FormControl(null);
    this.totalCostControl = new FormControl({ value: '0', disabled: true });

    this.paymentMethodTotalPanelControl = new FormControl(null, Validators.required);

    this.createOrderForm = new FormGroup({
      orderCodeControl: this.orderCodeControl,
      orderDateControl: this.orderDateControl,
      orderStatusControl: this.orderStatusControl,
      ordererControl: this.ordererControl,
      descriptionControl: this.descriptionControl,
      noteControl: this.noteControl,
      vendorControl: this.vendorControl,
      vendorContactControl: this.vendorContactControl,
      paymentControl: this.paymentControl,
      bankAccountControl: this.bankAccountControl,
      // receivedDateControl: this.receivedDateControl,
      // receivedHourControl: this.receivedHourControl,
      // recipientNameControl: this.recipientNameControl,
      // shipperNameControl: this.shipperNameControl,
      // locationOfShipmentControl: this.locationOfShipmentControl,
      // placeOfDeliveryControl: this.placeOfDeliveryControl,
      // recipientPhoneControl: this.recipientPhoneControl,
      // recipientEmailControl: this.recipientEmailControl,
      // shippingNoteControl: this.shippingNoteControl,
      discountTypeControl: this.discountTypeControl,
      discountValueControl: this.discountValueControl,
      procurementRequestControl: this.procurementRequestControl,
      contractControl: this.contractControl,
      warehouseControl: this.warehouseControl,
      totalCostControl: this.totalCostControl
    });
  }

  resetForm() {
    this.createOrderForm.reset();

    this.orderDateControl.setValue((new Date()));
    this.orderStatusControl.setValue(null);
    this.ordererControl.setValue(null);
    this.descriptionControl.setValue(null);
    this.noteControl.setValue(null);
    this.vendorControl.setValue(null);
    this.vendorContactControl.setValue(null);
    this.paymentControl.setValue(null);
    this.bankAccountControl.setValue(null);
    // this.receivedDateControl.setValue(new Date());
    // this.receivedHourControl.setValue(null);
    // this.recipientNameControl.setValue(null);
    // this.shipperNameControl.setValue(null);
    // this.locationOfShipmentControl.setValue(null);
    // this.placeOfDeliveryControl.setValue(null);
    // this.recipientPhoneControl.setValue(null);
    // this.recipientEmailControl.setValue(null);
    // this.shippingNoteControl.setValue(null);
    this.discountTypeControl.setValue(this.discountTypeList.find(x => x.code == "PT"));
    this.discountValueControl.setValue('0');
    this.procurementRequestControl.setValue([]);
    this.contractControl.setValue(null);
    this.warehouseControl.setValue(null);
    this.totalCostControl.setValue('0');
  }

  setTable() {
    this.cols = [
      { field: 'description', header: 'T??n h??ng', width: '500px', textAlign: 'left', color: '#f44336' },
      // { field: 'vendorName', header: 'Nh?? cung c???p', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
      { field: 'unitName', header: '????n v??? t??nh', width: '90px', textAlign: 'left', color: '#f44336' },
      { field: 'unitPrice', header: '????n gi??', width: '150px', textAlign: 'right', color: '#f44336' },
      { field: 'currencyUnitName', header: '????n v??? ti???n', width: '100px', textAlign: 'left', color: '#f44336' },
      { field: 'exchangeRate', header: 'T??? gi??', width: '65px', textAlign: 'right', color: '#f44336' },
      { field: 'vat', header: 'Thu??? GTGT (%)', width: '120px', textAlign: 'right', color: '#f44336' },
      { field: 'discountValue', header: 'Chi???t kh???u', width: '140px', textAlign: 'right', color: '#f44336' },
      { field: 'sumAmount', header: 'Th??nh ti???n sau thu??? (VND)', width: '200px', textAlign: 'right', color: '#f44336' },
      { field: 'cost', header: 'Chi ph?? mua h??ng', width: '140px', textAlign: 'right', color: '#f44336' },
      { field: 'priceWarehouse', header: 'Gi?? nh???p kho', width: '140px', textAlign: 'right', color: '#f44336' },
      { field: 'priceValueWarehouse', header: 'Gi?? tr??? nh???p kho', width: '140px', textAlign: 'right', color: '#f44336' },
      { field: 'procurementCode', header: 'Phi???u ????? xu???t mua h??ng', width: '200px', textAlign: 'center', color: '#f44336' },
      { field: 'delete', header: 'Ch???c n??ng', width: '100px', textAlign: 'center', color: '#f44336' },
    ];
    this.selectedColumns = this.cols;

    this.colsCost = [
      { field: 'costCode', header: 'M?? chi ph??', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'costName', header: 'T??n chi ph??', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'unitPrice', header: 'S??? ti???n', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'delete', header: 'X??a', width: '60px', textAlign: 'center', color: '#f44336' }
    ];
    this.selectedColumnsCost = this.colsCost;

    this.colsNoteFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'left' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'left' },
    ];

    this.colsFile = [
      { field: 'fileName', header: 'T??n t??i li???u', width: '50%', textAlign: 'left', type: 'string' },
      { field: 'size', header: 'K??ch th?????c', width: '50%', textAlign: 'right', type: 'number' },
      { field: 'createdDate', header: 'Ng??y t???o', width: '50%', textAlign: 'right', type: 'date' },
      { field: 'uploadByName', header: 'Ng?????i Upload', width: '50%', textAlign: 'left', type: 'string' },
    ];

    this.selectedColumnsReceiving = [
      { field: 'inventoryReceivingVoucherCode', header: 'M?? phi???u nh???p', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'inventoryReceivingVoucherTypeName', header: 'Lo???i phi???u nh???p', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'createdDate', header: 'Ng??y l???p phi???u', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'inventoryReceivingVoucherDate', header: 'Ng??y nh???p kho', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'createdName', header: 'Ng?????i l???p phi???u', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'statusName', header: 'Tr???ng th??i', width: '50px', textAlign: 'left', color: '#f44336' },
    ];
    this.selectedColumnsKiemTraTonKho = [
      { field: 'stt', header: 'S??? th??? t???', width: '100px', textAlign: 'center', color: '#f44336' },
      { field: 'productCode', header: 'M?? s???n ph???m', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'productName', header: 'T??n s???n ph???m', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'warehouseName', header: 'T??n kho', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'soLuongDat', header: 'S??? l?????ng ?????t', width: '150px', textAlign: 'right', color: '#f44336' },
      { field: 'soLuongTonKho', header: 'S??? l?????ng t???n kho', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'soLuongTonKhoToiDa', header: 'S??? l?????ng t???n kho t???i ??a', width: '150px', textAlign: 'left', color: '#f44336' },

    ];
  }

  resetTable() {
    this.listVendorOrderDetail = [];
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  close() {
    this.confirmationService.confirm({
      message: `C??c thay ?????i s??? kh??ng ???????c l??u l???i. H??nh ?????ng n??y kh??ng th??? ???????c ho??n t??c, b???n c?? ch???c ch???n mu???n hu????`,
      accept: () => {
        setTimeout(() => {
          this.router.navigate(['vendor/list-order']);
        }, 500);
      }
    });
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  /*Th??m s???n ph???m d???ch v???*/
  addCustomerOrderDetail(): boolean {
    const currentVendor: vendorCreateOrderModel = this.vendorControl.value;
    if (!currentVendor) {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Ch???n nh?? cung c???p' };
      this.showMessage(msg);
      return false;
    }

    let data: ConfigDialogOrderDetail = {
      isCreate: true,
      vendor: currentVendor,
      vendorOrderDetail: null,
      isProcurementRequestItem: false,
      quantityApproval: 0,
      isEdit: true,
      type: 'BUY'
    }

    let ref = this.dialogService.open(AddVendorOrderProductComponent, {
      data: data,
      header: 'Th??m s???n ph???m d???ch v???',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        // "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          let vendorOrderDetail = result.vendorOrderDetail;
          vendorOrderDetail.orderNumber = this.listVendorOrderDetail.length + 1;
          this.listVendorOrderDetail = [...this.listVendorOrderDetail, vendorOrderDetail];
          this.allocation();
          this.getSumarySection();
          this.setValidatorForDiscount();
        }
      }
    });
  }

  /*S???a m???t s???n ph???m d???ch v???*/
  async onRowSelect(dataRow: VendorOrderDetailModel) {
    if (this.actionEdit) {
      //Ki???m tra xem item c?? ph???i l?? t??? ????? xu???t hay kh??ng
      let isProcurementRequestItem = dataRow.procurementRequestItemId ? true : false;
      let quantityApproval = 0;
      if (isProcurementRequestItem) {
        if (dataRow.vendorOrderDetailId && dataRow.vendorOrderDetailId != this.emptyGuid) {
          let result: any = await this.vendorService.getQuantityApproval(dataRow.vendorOrderDetailId, dataRow.procurementRequestItemId, dataRow.productId);
          //So cua chinh no
          quantityApproval = result.quantityApproval;
        }
        else {
          quantityApproval = dataRow.quantity;
        }
      }
      let isEdit = this.statusCode == 'DRA';
      const currentVendor: vendorCreateOrderModel = this.vendorControl.value;

      let data: ConfigDialogOrderDetail = {
        isCreate: false,
        vendor: currentVendor,
        vendorOrderDetail: dataRow,
        isProcurementRequestItem: isProcurementRequestItem,
        quantityApproval: quantityApproval,
        isEdit: isEdit,
        type: 'BUY'
      }

      let ref = this.dialogService.open(AddVendorOrderProductComponent, {
        data: data,
        header: 'Ch???nh s???a s???n ph???m d???ch v???',
        width: '70%',
        baseZIndex: 1030,
        contentStyle: {
          "min-height": "280px",
          "max-height": "600px",
          // "overflow": "auto"
        }
      });

      ref.onClose.subscribe((result: ResultDialog) => {
        if (result) {
          if (result.status) {
            let vendorOrderDetail = result.vendorOrderDetail;
            let index = this.listVendorOrderDetail.indexOf(dataRow);
            if (index !== -1) {
              this.listVendorOrderDetail[index] = vendorOrderDetail;
              this.listVendorOrderDetail[index].orderNumber = index + 1;
              this.allocation();
              this.getSumarySection();
              this.setValidatorForDiscount();
            }
          }
        }
      });
    }
  }

  buildDescription(productName: string, selectedAttributeName: string): string {
    let _selectedAttributeName = "";
    if (selectedAttributeName) _selectedAttributeName = "(" + selectedAttributeName + ")";
    let result = productName + " " + _selectedAttributeName;
    return result;
  }

  /*X??a m???t s???n ph???m d???ch v???*/
  deleteItem(dataRow: VendorOrderDetailModel) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.listVendorOrderDetail = this.listVendorOrderDetail.filter(e => e != dataRow);
        //????nh l???i s??? OrderNumber
        this.listVendorOrderDetail.forEach((item, index) => {
          item.orderNumber = index + 1;
        });
        this.allocation();
        this.getSumarySection();
        this.setValidatorForDiscount();

        //Ki???m tra list s???n ph???m trong phi???u ????? xu???t ???? b??? x??a h???t trong danh s??ch sp/dv ch??a?
        if (dataRow.procurementRequestId) {
          let listSelected = this.procurementRequestControl.value;
          if (listSelected.length > 0) {
            let hasValue = this.listVendorOrderDetail.find(x => x.procurementRequestId == dataRow.procurementRequestId);

            //N???u kh??ng c??n s???n ph???m n??o trong phi???u ????? xu???t th?? b??? checked trong listSelected
            if (!hasValue) {
              listSelected = listSelected.filter(x => x.procurementRequestId != dataRow.procurementRequestId);
              this.procurementRequestControl.setValue(listSelected);
            }
          }
        }
      }
    });
  }

  patchVendorOrderById(vendorOrder: VendorOrderModel, listProcurementRequestId: Array<string>) {
    this.orderDateControl.setValue(new Date(vendorOrder.vendorOrderDate));
    //m?? ????n h??ng
    let oderCode = vendorOrder.vendorOrderCode;
    this.orderCodeControl.setValue(oderCode ? oderCode : null);
    //tr???ng th??i
    let status = this.listOrderStatus.find(e => e.purchaseOrderStatusId == vendorOrder.statusId);
    this.orderStatusControl.setValue(status ? status : null);
    this.statusCode = status.purchaseOrderStatusCode;
    this.statusName = status.description;
    //ng?????i t???o
    let orderer = this.listEmployee.find(e => e.employeeId == vendorOrder.orderer);
    this.ordererControl.setValue(orderer ? orderer : null);
    //di???n gi???
    let description = vendorOrder.description;
    this.descriptionControl.setValue(description ? description : "");
    //Ghi ch??
    let note = vendorOrder.note;
    this.noteControl.setValue(note ? note : "");

    //Phi???u ????? xu???t mua h??ng

    let listSelectedProcurementRequest = this.listProcurementRequest.filter(x => listProcurementRequestId.includes(x.procurementRequestId));
    if (listSelectedProcurementRequest) this.procurementRequestControl.setValue(listSelectedProcurementRequest);

    //H???p ?????ng

    //M?? kho
    if (vendorOrder.warehouseId) {
      let warehouse = this.listWareHouse.find(x => x.warehouseId == vendorOrder.warehouseId);
      this.warehouseControl.setValue(warehouse ? warehouse : null);
    }

    //Th??ng tin nh?? cung c???p
    //nh?? cung c???p
    let vendor = this.listVendorCreateOrderModel.find(e => e.vendorId == vendorOrder.vendorId);
    this.vendorControl.setValue(vendor ? vendor : null);
    if (vendor) this.patchVendorData(vendor.vendorId);

    //Th??ng tin chi ph??
    this.selectedCostType = vendorOrder.typeCost;

    //Th??ng tin giao h??ng
    //ng??y nh???n
    // let receivedDate = vendorOrder.receivedDate;
    // this.receivedDateControl.setValue(receivedDate ? new Date(receivedDate) : null);

    //gi??? nh???n
    // let receivedHour: any = vendorOrder.receivedHour;
    // if (receivedHour) {
    //   receivedHour = convertTimeSpanToDate(receivedHour);
    //   this.receivedHourControl.setValue(receivedHour);
    // }

    //t??n ng?????i nh???n
    // let recipientName = vendorOrder.recipientName;
    // this.recipientNameControl.setValue(recipientName ? recipientName : '');

    //t??n ng?????i giao h??ng
    // let shipperName = vendorOrder.shipperName;
    // this.shipperNameControl.setValue(shipperName ? shipperName : '');

    //?????a ??i???m xu???t h??ng
    // let locationOfShipment = vendorOrder.locationOfShipment;
    // this.locationOfShipmentControl.setValue(locationOfShipment ? locationOfShipment : '');

    //?????a ??i???m giao h??ng
    // let placeOfDelivery = vendorOrder.placeOfDelivery;
    // this.placeOfDeliveryControl.setValue(placeOfDelivery ? placeOfDelivery : '');

    //s??? ??i???n tho???i
    // let recipientPhone = vendorOrder.recipientPhone;
    // this.recipientPhoneControl.setValue(recipientPhone ? recipientPhone : '');

    //email
    // let recipientEmail = vendorOrder.recipientEmail;
    // this.recipientEmailControl.setValue(recipientEmail ? recipientEmail : '');

    //ghi chu
    // let shippingNote = vendorOrder.shippingNote;
    // this.shippingNoteControl.setValue(shippingNote ? shippingNote : '');

    //sumary section
    let discountType = this.discountTypeList.find(e => e.value == vendorOrder.discountType);
    let discountValue = vendorOrder.discountValue;
    this.discountTypeControl.setValue(discountType ? discountType : null);
    this.discountValueControl.setValue(discountValue ? discountValue : 0);
    //this.getSumarySection();
    this.setValidatorForDiscount();
  }

  patchVendorOrderDetail(listVendorOrderDetail: Array<VendorOrderDetailModel>) {
    this.listVendorOrderDetail = listVendorOrderDetail;
    this.listVendorOrderDetail.forEach((orderdetail, index) => {
      //mapping l???i curency name v?? currency id
      orderdetail.currencyUnitName = orderdetail.currencyUnitName;
      orderdetail.sumAmount = this.calculatorAmountProduct(orderdetail);
      orderdetail.listVendorOrderProductDetailProductAttributeValue = orderdetail.vendorOrderProductDetailProductAttributeValue;

      /* s???n ph???m d???ch v??? */
      if (orderdetail.orderDetailType == 0) {
        orderdetail.description = orderdetail.productName; //this.buildDescription(orderdetail.productName, orderdetail.selectedAttributeName);
        orderdetail.productUnitId = orderdetail.unitId;
        orderdetail.orderNumber = orderdetail.orderNumber ? orderdetail.orderNumber : index + 1;
      }
      /* chi ph?? kh??c */
      else if (orderdetail.orderDetailType == 1) {
        orderdetail.description = orderdetail.description;
        orderdetail.unitName = orderdetail.incurredUnit;
      }
    });
  }

  isBank: boolean = true;
  patchVendorData(vendorId: string) {
    this.listCurrentVendorContact = [];
    this.vendorContactControl.reset();
    let currentVendor: vendorCreateOrderModel = this.listVendorCreateOrderModel.find(e => e.vendorId == vendorId);
    let vendor: VendorOrderModel = this.vendorOrderById;
    this.vendorControl.setValue(currentVendor);

    if (this.vendorOrderById) {

      this.listCurrentVendorContact = currentVendor.listVendorContact;
      if (this.listCurrentVendorContact.length > 0) {
        let vendorContact = this.listCurrentVendorContact.find(e => e.contactId == this.vendorOrderById.vendorContactId);
        this.vendorContactControl.setValue(vendorContact);
      }
      let payment = this.listPaymentMethod.find(e => e.categoryId == vendor.paymentMethod);
      if (payment) {
        // pttt tab thong tin nha cung cap
        this.paymentControl.setValue(payment);
        // pttt panel tong hop don hang
        this.paymentMethodTotalPanelControl.setValue(payment);

        if (payment.categoryCode == "BANK") {
          this.isBank = true;
          //show t??i kho???n ng??n h??ng
          this.listCurrentBankAccount = this.listBankAccount.filter(e => e.objectId == currentVendor.vendorId);
          if (this.listCurrentBankAccount.length > 0) {
            let bankAccountVendor = this.listCurrentBankAccount.find(e => e.bankAccountId == this.vendorOrderById.bankAccountId);
            this.bankAccountControl.setValue(bankAccountVendor);
          }
        } else {
          this.isBank = false;
        }
      }
    }

  }

  /*T??nh t???ng ti???n tr??n m???i s???n ph???m*/
  calculatorAmountProduct(vendorOrderDetail: VendorOrderDetailModel): number {
    let amount = vendorOrderDetail.quantity * vendorOrderDetail.unitPrice * vendorOrderDetail.exchangeRate;
    let amountCK = 0;
    if (vendorOrderDetail.discountType == true) {
      amountCK = amount * vendorOrderDetail.discountValue / 100;
    } else {
      amountCK = vendorOrderDetail.discountValue;
    }
    let amountTax = (amount - amountCK) * vendorOrderDetail.vat / 100;
    let amountProduct = this.roundNumber((amount - amountCK + amountTax), parseInt(this.defaultNumberType, 10));
    return amountProduct;
  }

  /* events */
  changeVendor(event: any): boolean {
    this.listCurrentVendorContact = [];
    // this.listVendorOrderDetail = [];
    this.vendorContactControl.reset();
    if (event.value === null) return false;
    let currentVendor: vendorCreateOrderModel = event.value;
    this.listCurrentVendorContact = currentVendor.listVendorContact;
    if (this.listCurrentVendorContact.length === 1) {
      this.vendorContactControl.setValue(this.listCurrentVendorContact[0]);
    }

    let payment = this.listPaymentMethod.find(e => e.categoryId == currentVendor.paymentId);
    if (payment) {
      this.paymentControl.setValue(payment);
      if (payment.categoryCode == "BANK") {
        this.isBank = true;
        //show t??i kho???n ng??n h??ng
        this.listCurrentBankAccount = this.listBankAccount.filter(e => e.objectId == currentVendor.vendorId);
        if (this.listCurrentBankAccount.length == 1) {
          this.bankAccountControl.setValue(this.listCurrentBankAccount[0]);
        }
      } else {
        this.isBank = false;
      }
    }
    return false;
  }

  changePaymentMethod(event: any): boolean {
    this.listCurrentBankAccount = [];
    this.bankAccountControl.reset();
    if (event.value === null) return false;
    let currentPaymentMethod: paymentMethod = event.value;
    let currentVendor: vendorCreateOrderModel = this.vendorControl.value;
    if (currentPaymentMethod.categoryCode == "BANK") {
      this.isBank = true;
      //show t??i kho???n ng??n h??ng
      if (this.vendorControl.value) {
        this.listCurrentBankAccount = this.listBankAccount.filter(e => e.objectId == currentVendor.vendorId);
        if (this.listCurrentBankAccount.length == 1) {
          this.bankAccountControl.setValue(this.listCurrentBankAccount[0]);
        }
      }
    } else {
      this.isBank = false;
    }
    return false;
  }

  changeDiscountType(event: any) {
    this.discountValueControl.reset();
    this.discountValueControl.setValue('0');
    this.setValidatorForDiscount();
    this.getSumarySection();
  }

  changeDiscountValue(event: any) {
    this.getSumarySection();
  }
  /* end events */

  /* Event: Click n??t Ph?? duy???t ho???c T??? ch???i ????n h??ng mua (approver = true: ph?? duy???t, approver = false: t??? ch???i) */
  approveOrReject(approver: boolean) {
    // Ph?? duy???t
    if (approver == true) {
      // Check t???n kho
      // let message = `Kho kh??ng ????? s???c ch???a c??c s???n ph???m : `;
      let isCheck = false;
      // console.log("List spham trong kho", this.listSucChuaSanPhamTrongKho)
      this.listSucChuaSanPhamTrongKho.forEach(item => {
        let lstPro = this.listVendorOrderDetail.filter(c => c.productId == item.productId && c.warehouseId == item.warehouseId);
        let sumQuantiy: number = 0;
        lstPro.forEach(pro => {
          sumQuantiy += pro.quantity;
        });

        item.warehouseName = this.listWareHouse.find(c => c.warehouseId == item.warehouseId) ?.warehouseName;
        if (item.sucChua != null && item.sucChua < sumQuantiy) {
          // message += ` <div style="padding-left: 30px;"> . <strong>${item.warehouseName} - ${lstPro[0].productName}</strong></div>`;
          isCheck = true;
        }
      });
      if (isCheck) {
        this.isShowPopupTonKho = true;

        // message += ` .B???n c?? mu???n ti???p t???c ph?? duy???t!`;
        // this.confirmationService.confirm({
        //   message: message,
        //   accept: () => {
        //     this.displayApprovalReject = true;
        //     this.isApproval = approver;
        //   }
        // });
      } else {
        this.displayApprovalReject = true;
        this.isApproval = approver;
      }
    }
    // T??? ch???i
    else {
      this.displayApprovalReject = true;
      this.isApproval = approver;
    }
  }

  closePopUpKiemTraTonKho(){
    this.isShowPopupTonKho = false;
    this.displayApprovalReject = true;
    this.isApproval = true;
  }

  /* L??u Ph?? duy???t ho???c T??? Ch???i */
  async aprrovalRejectVendorOrder() {
    this.vendorService.approvalOrRejectVendorOrder(this.vendorOrderId, this.isApproval,
      this.descriptionApprovalReject).subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          if (this.isApproval) {
            let listItemInvalidModel: Array<ItemInvalidModel> = result.listItemInvalidModel;

            if (listItemInvalidModel ?.length > 0) {
              this.isOpenPopupInvalidItem = true;

              //Highlight c??c item b??? l???i
              let listProcurementRequestItemId = listItemInvalidModel.map(x => x.procurementRequestItemId);
              this.listVendorOrderDetail.forEach(item => {
                if (listProcurementRequestItemId.includes(item.procurementRequestItemId)) {
                  item.isInvalidItemRequest = true;
                }
              });
            } else {
              this.showToast('success', 'Th??ng b??o', 'Ph?? duy???t th??nh c??ng');
              this.getMasterData();
            }
          }
          else {
            this.showToast('success', 'Th??ng b??o', 'T??? ch???i ph?? duy???t th??nh c??ng');
            this.getMasterData();
          }
          this.displayApprovalReject = false;
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.vendorService.getDataEditVendorOrder(this.vendorOrderId, this.auth.UserId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listEmployee = result.listEmployeeModel;
      this.listOrderStatus = result.listOrderStatus;
      this.listPaymentMethod = result.listPaymentMethod;
      this.listVendorCreateOrderModel = result.vendorCreateOrderModel;
      this.listBankAccount = result.listBankAccount;
      this.vendorOrderById = result.vendorOrderById;
      this.listProcurementRequest = result.listProcurementRequest ? result.listProcurementRequest : [];
      this.listWareHouse = result.listWareHouse ? result.listWareHouse : [];
      this.listProcurementRequestId = result.listProcurementRequestId;
      this.listFile = result.listFile;
      this.TotalPayment = result.vendorOrderById.totalPayment;
      this.listSucChuaSanPhamTrongKho = result.listSucChuaSanPhamTrongKho;
      this.listInventoryReceivingVoucher = result.listPhieuNhapKho;
      if (this.auth.UserId == this.vendorOrderById.updatedById) {
        this.isUserSendAproval = true;
      }

      /* Hi???n th??? l???i D??ng th???i gian */
      this.noteHistory = result.listNote;
      this.handleNoteContent();

      this.listVendorOrderDetailById = result.listVendorOrderDetailById;
      if (this.listVendorCreateOrderModel.length > 0) {
        this.listVendorCreateOrderModel.forEach(item => {
          item.vendorName = item.vendorCode + ' - ' + item.vendorName;
        });
      }

      if (this.listVendorOrderDetailById.length != 0) this.patchVendorOrderDetail(this.listVendorOrderDetailById);
      if (this.vendorOrderById) this.patchVendorOrderById(this.vendorOrderById, this.listProcurementRequestId);

      this.listCostModel = result.listVendorOrderCostDetail ? result.listVendorOrderCostDetail : [];
      this.mapDataCostToForm();

      this.getSumarySection();

      this.disableForm();
    } else {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  /* Disable Form */
  disableForm() {
    //N???u tr???ng th??i ????n h??ng mua kh??ng ph???i Nh??p th?? disable t???t c??? control v?? button
    if (this.statusCode != 'DRA') {
      this.createOrderForm.disable();
    } else {
      this.createOrderForm.enable();
    }
  }

  /* Hi???n th??? l???i Th??ng tin chi ph?? */
  mapDataCostToForm() {
    this.listCostModel.forEach((item, _index) => {
      item.index = _index + 1;
    });

    //T??nh l???i T???ng chi ph??
    this.setTotalCost();
  }

  async editOrder(isSendApproval: boolean) {
    if (!this.createOrderForm.valid) {
      Object.keys(this.createOrderForm.controls).forEach(key => {
        if (this.createOrderForm.controls[key].valid == false) {
          this.createOrderForm.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true;  //Hi???n th??? icon-warning-active
      this.isOpenNotifiError = true;  //Hi???n th??? message l???i
      this.emitStatusChangeForm = this.createOrderForm.statusChanges.subscribe((validity: string) => {
        switch (validity) {
          case "VALID":
            this.isInvalidForm = false;
            break;
          case "INVALID":
            this.isInvalidForm = true;
            break;
        }
      });
    } else if (this.listVendorOrderDetail.length == 0) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Ph???i c?? ??t nh???t m???t s???n ph???m d???ch v??? ???????c ch???n' };
      this.showMessage(msg);
    } else {
      //valid
      let vendorOrder = this.mapFormtoVendorOrder();
      let listVendorOrderDetail = this.mapOrderDetail();

      let listVendorOrderProcurementRequestMapping = [];
      let listSelectedProcurementRequest = this.procurementRequestControl.value;

      if (listSelectedProcurementRequest.length > 0) {
        listSelectedProcurementRequest.forEach(item => {
          let vendorOrderProcurementRequestMapping = new VendorOrderProcurementRequestMapping();

          vendorOrderProcurementRequestMapping.vendorOrderProcurementRequestMappingId = this.emptyGuid;
          vendorOrderProcurementRequestMapping.vendorOrderId = vendorOrder.vendorOrderId;
          vendorOrderProcurementRequestMapping.procurementRequestId = item.procurementRequestId;
          vendorOrderProcurementRequestMapping.active = true;
          vendorOrderProcurementRequestMapping.createdById = this.auth.UserId;
          vendorOrderProcurementRequestMapping.createdDate = new Date();

          listVendorOrderProcurementRequestMapping = [...listVendorOrderProcurementRequestMapping, vendorOrderProcurementRequestMapping];
        });
      }

      let listVendorOrderCostDetail = [];
      if (this.listCostModel.length > 0) {
        this.listCostModel.forEach(item => {
          let vendorOrderCostDetail = new VendorOrderCostDetail();

          vendorOrderCostDetail.vendorOrderCostDetailId = this.emptyGuid;
          vendorOrderCostDetail.costId = item.costId;
          vendorOrderCostDetail.vendorOrderId = vendorOrder.vendorOrderId;
          vendorOrderCostDetail.unitPrice = item.unitPrice;
          vendorOrderCostDetail.costName = item.costName;
          vendorOrderCostDetail.active = true;
          vendorOrderCostDetail.createdById = this.auth.UserId;
          vendorOrderCostDetail.createdDate = new Date();

          listVendorOrderCostDetail = [...listVendorOrderCostDetail, vendorOrderCostDetail];
        });
      }

      if (isSendApproval == true) {
        let checkWarehouseNull = this.listVendorOrderDetail.filter(c => c.folowInventory == true && (c.warehouseId == null || c.warehouseId == undefined) && c.productId != null);
        if (checkWarehouseNull.length != 0) {
          let nameProduct: string = '';
          checkWarehouseNull.forEach(item => {
            nameProduct += ` <div style="padding-left: 30px;"> -<strong>${item.description}</strong></div>`;
          });
          this.confirmationService.confirm({
            rejectVisible: false,
            message: `Vui l??ng ch???n M?? kho cho c??c s???n ph???m : ${nameProduct}`,
          });
          return;
        }
      }

      this.loading = true;
      let result: any = await this.vendorService.updateVendorOrderByIdAsync(vendorOrder, listVendorOrderDetail, this.auth.UserId, isSendApproval,
        listVendorOrderProcurementRequestMapping, listVendorOrderCostDetail);
      this.loading = false;
      if (result.statusCode == 200) {
        this.listItemInvalidModel = result.listItemInvalidModel;

        if (this.listItemInvalidModel.length > 0) {
          this.isInvalidItem = true;
          this.isOpenPopupInvalidItem = true;

          //Highlight c??c item b??? l???i
          let listProcurementRequestItemId = this.listItemInvalidModel.map(x => x.procurementRequestItemId);
          this.listVendorOrderDetail.forEach(item => {
            if (listProcurementRequestItemId.includes(item.procurementRequestItemId)) {
              item.isInvalidItemRequest = true;
            }
          });
        } else {
          this.isInvalidItem = false;
          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'Ch???nh s???a ????n h??ng mua th??nh c??ng' };
          this.showMessage(msg);
          this.getMasterData();
        }
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    }
  }

  mapFormtoVendorOrder(): VendorOrderModel {
    let vendorOrderModel: VendorOrderModel = new VendorOrderModel();
    vendorOrderModel.vendorOrderId = this.vendorOrderById.vendorOrderId;
    //m?? ????n h??ng
    vendorOrderModel.vendorOrderCode = this.vendorOrderById.vendorOrderCode;
    //status
    let status: PurchaseOrderStatus = this.orderStatusControl.value;
    vendorOrderModel.statusId = status.purchaseOrderStatusId;

    let orderDate = this.orderDateControl.value;
    vendorOrderModel.vendorOrderDate = orderDate ? convertToUTCTime(orderDate) : null; // new Date();

    vendorOrderModel.customerOrderId = null;
    //ng?????i order
    let orderer: employeeModel = this.ordererControl.value;
    vendorOrderModel.orderer = orderer ? orderer.employeeId : null;
    vendorOrderModel.description = this.descriptionControl.value.trim();
    vendorOrderModel.note = this.noteControl.value.trim();
    //nh?? cung c???p
    let vendor: vendorCreateOrderModel = this.vendorControl.value;
    vendorOrderModel.vendorId = vendor ? vendor.vendorId : null;
    //th??ng tin li??n h??? nh?? cung c???p
    let vendorContact: vendorContact = this.vendorContactControl.value;
    vendorOrderModel.vendorContactId = vendorContact ? vendorContact.contactId : null;
    //th??ng tin thanh to??n nh?? cung c???p
    let payment: paymentMethod = this.paymentControl.value;
    vendorOrderModel.paymentMethod = payment ? payment.categoryId : null;
    let bankAccount: bankAccount = this.bankAccountControl.value;
    vendorOrderModel.bankAccountId = bankAccount ? bankAccount.bankAccountId : null;
    //ng??y gi??? nh???n
    // let receivedDate = this.receivedDateControl.value;
    // vendorOrderModel.receivedDate = receivedDate ? convertToUTCTime(receivedDate) : null;
    // let receivedHour = this.receivedHourControl.value;
    // if (receivedHour) {
    //   receivedHour = convertDateToTimeSpan(receivedHour);
    //   vendorOrderModel.receivedHour = receivedHour;
    // }

    //th??ng giao h??ng
    // vendorOrderModel.recipientName = this.recipientNameControl.value.trim();
    // vendorOrderModel.shipperName = this.shipperNameControl.value.trim();
    // vendorOrderModel.locationOfShipment = this.locationOfShipmentControl.value.trim();
    // vendorOrderModel.placeOfDelivery = this.placeOfDeliveryControl.value.trim();
    // vendorOrderModel.recipientPhone = this.recipientPhoneControl.value.trim();
    // vendorOrderModel.recipientEmail = this.recipientEmailControl.value.trim();
    // vendorOrderModel.shippingNote = this.shippingNoteControl.value.trim();

    //t??nh t???ng ti???n s???n ph???m ????n h??ng
    let amountOrder = this.calculateAmountOrder();
    vendorOrderModel.amount = amountOrder;
    let discountType: DiscountType = this.discountTypeControl.value;
    vendorOrderModel.discountType = discountType.value;
    vendorOrderModel.discountValue = ParseStringToFloat(this.discountValueControl.value);
    vendorOrderModel.createdById = this.auth.UserId;
    vendorOrderModel.createdDate = new Date();
    vendorOrderModel.active = true;

    vendorOrderModel.contractId = this.contractControl.value == null ? null : this.contractControl.value.contractId;  //C???n s???a t??n:: contractId

    //M?? kho
    let warehouse: Warehouse = this.warehouseControl.value;
    vendorOrderModel.warehouseId = warehouse == null ? null : warehouse.warehouseId;

    //Lo???i chi ph??
    vendorOrderModel.typeCost = this.selectedCostType;

    return vendorOrderModel;
  }

  calculateAmountOrder(): number {
    let result: number = 0;
    let totalAmountBeforeVat = 0; //T???ng ti???n tr?????c thu???
    let totalAmountVat = 0; //T???ng ti???n thu???
    let totalAmountCost = ParseStringToFloat(this.totalCostControl.value.toString()); //T???ng chi ph?? mua h??ng
    let discountPerOrder = 0;

    this.listVendorOrderDetail.forEach(e => {
      //T???ng ti???n tr?????c thu???
      if (e.discountType == true) {
        let discountValue = 0;
        discountValue = (e.quantity * e.unitPrice * e.exchangeRate) * e.discountValue / 100;
        //T???ng ti???n tr?????c thu???
        totalAmountBeforeVat += (e.quantity * e.unitPrice * e.exchangeRate) - discountValue;

        //T???ng ti???n thu???
        totalAmountVat += ((e.quantity * e.unitPrice * e.exchangeRate - discountValue) * e.vat / 100);
      } else {
        //T???ng ti???n tr?????c thu???
        totalAmountBeforeVat += e.quantity * e.unitPrice * e.exchangeRate - e.discountValue;

        //T???ng ti???n thu???
        totalAmountVat += ((e.quantity * e.unitPrice * e.exchangeRate - e.discountValue) * e.vat / 100);
      }
    });

    let discountType: DiscountType = this.discountTypeControl.value;
    let discountValue = ParseStringToFloat(this.discountValueControl.value);

    //T???ng ti???n chi???t kh???u
    if (discountType.value == true) {
      discountPerOrder = ((totalAmountBeforeVat + totalAmountVat) * discountValue) / 100;
    } else {
      discountPerOrder = discountValue;
    }

    //T???ng thanh to??n
    result = totalAmountBeforeVat + totalAmountVat + totalAmountCost - discountPerOrder;

    return result;
  }

  getSumarySection() {
    let result: number = 0;
    this.totalAmountBeforeVat = 0; //T???ng ti???n tr?????c thu???
    this.totalAmountVat = 0; //T???ng ti???n thu???
    this.totalAmountCost = ParseStringToFloat(this.totalCostControl.value.toString()); //T???ng chi ph?? mua h??ng

    this.listVendorOrderDetail.forEach(e => {
      if (e.discountType == true) {
        let discountValue = 0;
        discountValue = (e.quantity * e.unitPrice * e.exchangeRate) * e.discountValue / 100;
        //T???ng ti???n tr?????c thu???
        this.totalAmountBeforeVat += (e.quantity * e.unitPrice * e.exchangeRate) - discountValue;

        //T???ng ti???n thu???
        this.totalAmountVat += ((e.quantity * e.unitPrice * e.exchangeRate - discountValue) * e.vat / 100);
      } else {
        //T???ng ti???n tr?????c thu???
        this.totalAmountBeforeVat += e.quantity * e.unitPrice * e.exchangeRate - e.discountValue;

        //T???ng ti???n thu???
        this.totalAmountVat += ((e.quantity * e.unitPrice * e.exchangeRate - e.discountValue) * e.vat / 100);
      }
    });

    result = this.totalAmountBeforeVat + this.totalAmountVat;

    let discountType: DiscountType = this.discountTypeControl.value;
    let discountValue = ParseStringToFloat(this.discountValueControl.value);

    //T???ng ti???n chi???t kh???u
    if (discountType.value == true) {
      this.discountPerOrder = (result * discountValue) / 100;
    } else {
      this.discountPerOrder = discountValue;
    }

    //T???ng thanh to??n
    this.totalAmountAferDiscount = result + this.totalAmountCost - this.discountPerOrder;

    //T???ng ???? thanh to??n
    // this.listPaymentInfor.forEach(item => {
    //   this.TotalPayment += item.amountCollected;
    // })

    //T???ng c??n ph???i thanh to??n
    this.TotalPaymentLeft = this.totalAmountAferDiscount - this.TotalPayment;
  }

  mapOrderDetail(): Array<VendorOrderDetailModel> {
    let selectedVendor: vendorCreateOrderModel = this.vendorControl.value;
    let listVendorOrderDetail: Array<VendorOrderDetailModel> = [];
    this.listVendorOrderDetail.forEach(order => {
      let vendorOrderDetail: VendorOrderDetailModel = new VendorOrderDetailModel();
      vendorOrderDetail.vendorOrderDetailId = this.emptyGuid;
      vendorOrderDetail.vendorId = selectedVendor.vendorId;
      vendorOrderDetail.vendorOrderId = this.vendorOrderById.vendorOrderId;
      vendorOrderDetail.productId = order.productId;
      vendorOrderDetail.quantity = order.quantity;
      vendorOrderDetail.unitPrice = order.unitPrice;
      vendorOrderDetail.currencyUnit = order.currencyUnit;
      vendorOrderDetail.exchangeRate = order.exchangeRate;
      vendorOrderDetail.vat = order.vat;
      vendorOrderDetail.discountType = order.discountType;
      vendorOrderDetail.discountValue = order.discountValue;
      vendorOrderDetail.unitId = order.productUnitId;
      vendorOrderDetail.incurredUnit = order.incurredUnit;
      if (order.orderDetailType == 0) {
        vendorOrderDetail.description = '';
      } else {
        vendorOrderDetail.description = order.description;
      }
      vendorOrderDetail.orderDetailType = order.orderDetailType;
      vendorOrderDetail.orderNumber = order.orderNumber;
      vendorOrderDetail.createdById = this.auth.UserId;
      vendorOrderDetail.createdDate = new Date();
      vendorOrderDetail.active = true;

      vendorOrderDetail.procurementRequestId = order.procurementRequestId;
      vendorOrderDetail.procurementRequestItemId = order.procurementRequestItemId;
      vendorOrderDetail.cost = order.cost;
      vendorOrderDetail.priceWarehouse = order.priceWarehouse;
      vendorOrderDetail.priceValueWarehouse = order.priceValueWarehouse;
      vendorOrderDetail.isEditCost = order.isEditCost == true ? order.isEditCost : false;
      vendorOrderDetail.warehouseId = order.warehouseId;

      //map thu???c t??nh
      vendorOrderDetail.vendorOrderProductDetailProductAttributeValue = [];
      order.listVendorOrderProductDetailProductAttributeValue.forEach(_productAttr => {
        let productAttr: VendorOrderProductDetailProductAttributeValueModel = new VendorOrderProductDetailProductAttributeValueModel();
        productAttr.vendorOrderDetailId = this.emptyGuid;
        productAttr.productId = order.productId;
        productAttr.vendorOrderProductDetailProductAttributeValueId = this.emptyGuid;
        productAttr.productAttributeCategoryId = _productAttr.productAttributeCategoryId;
        productAttr.productAttributeCategoryValueId = _productAttr.productAttributeCategoryValueId;
        vendorOrderDetail.vendorOrderProductDetailProductAttributeValue.push(productAttr);
      });
      listVendorOrderDetail.push(vendorOrderDetail);
    });

    return listVendorOrderDetail;
  }

  setValidatorForDiscount() {
    let discountType: DiscountType = this.discountTypeControl.value;
    if (discountType.value == true) {
      //ph???n tr??m
      this.discountValueControl.setValidators([ValidationMaxValuePT(100)]);
    } else {
      //s??? ti???n
      let totalAmountBeforeDiscount = this.calculateAmountOrder();
      this.discountValueControl.setValidators([ValidationMaxValueST(totalAmountBeforeDiscount)]);
    }
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  /* L??m tr??n 1 s??? */
  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case -1: {
        result = result;
        break;
      }
      case 0: {
        result = Math.round(result);
        break;
      }
      case 1: {
        result = Math.round(number * 10) / 10;
        break;
      }
      case 2: {
        result = Math.round(number * 100) / 100;
        break;
      }
      case 3: {
        result = Math.round(number * 1000) / 1000;
        break;
      }
      case 4: {
        result = Math.round(number * 10000) / 10000;
        break;
      }
      default: {
        result = result;
        break;
      }
    }
    return result;
  }

  /* Event thay ?????i Phi???u ????? xu???t mua h??ng */
  changeProcurementRequest(event: any) {
    let listSelected = event.value;
    if (listSelected.length > 0) {
      let listProductDetail = [];
      listSelected.forEach(item => {
        if (item.listDetail.length > 0) {
          item.listDetail.forEach(_product => {
            listProductDetail = [...listProductDetail, _product];
          });
        }
      });

      if (listProductDetail.length > 0) {
        let listProductByRequest: Array<VendorOrderDetailModel> = [];

        listProductDetail.forEach(order => {
          let vendorOrderDetail: VendorOrderDetailModel = new VendorOrderDetailModel();
          vendorOrderDetail.vendorOrderDetailId = this.emptyGuid;
          vendorOrderDetail.vendorOrderId = this.emptyGuid;
          vendorOrderDetail.description = order.productName;
          vendorOrderDetail.vendorId = order.vendorId;
          vendorOrderDetail.vendorName = order.vendorName;
          vendorOrderDetail.productId = order.productId;
          vendorOrderDetail.quantity = order.quantityApproval ? order.quantityApproval : order.quantity;
          vendorOrderDetail.unitName = order.unitName;
          vendorOrderDetail.unitPrice = order.unitPrice;
          vendorOrderDetail.productUnitId = order.productUnitId;
          vendorOrderDetail.incurredUnit = null;
          vendorOrderDetail.currencyUnit = order.currencyUnit;
          vendorOrderDetail.currencyUnitName = order.currencyUnitName;
          vendorOrderDetail.exchangeRate = (order.exchangeRate === null || order.exchangeRate === undefined) ? 1 : order.exchangeRate;
          vendorOrderDetail.vat = 0;
          vendorOrderDetail.discountType = false;
          vendorOrderDetail.discountValue = 0;
          vendorOrderDetail.sumAmountDiscount = 0;
          vendorOrderDetail.sumAmountVat = 0;
          vendorOrderDetail.sumAmount = (order.quantityApproval ? order.quantityApproval : order.quantity) * order.unitPrice * vendorOrderDetail.exchangeRate;
          vendorOrderDetail.productName = order.productName;
          vendorOrderDetail.selectedAttributeName = '';
          vendorOrderDetail.orderDetailType = 0;
          vendorOrderDetail.isReshow = true;
          vendorOrderDetail.procurementRequestItemId = order.procurementRequestItemId;
          vendorOrderDetail.procurementRequestId = order.procurementRequestId;
          vendorOrderDetail.procurementCode = order.procurementCode;

          listProductByRequest = [...listProductByRequest, vendorOrderDetail];
        });

        //N???u item c?? trong list listVendorOrderDetail m?? kh??ng c?? trong list listProductByRequest th??
        //x??a item ???? ??i (tr??? c??c item c?? isReshow = true)

        let listItemRemove: Array<VendorOrderDetailModel> = [];
        this.listVendorOrderDetail.forEach(item => {
          if (item.isReshow == true) {
            let hasValue = listProductByRequest.find(x => x.procurementRequestItemId == item.procurementRequestItemId);
            if (!hasValue) {
              listItemRemove = [...listItemRemove, item];
            }
          }
        });

        this.listVendorOrderDetail = this.listVendorOrderDetail.filter(x => !listItemRemove.includes(x));

        listProductByRequest.forEach(product => {
          let hasValue = this.listVendorOrderDetail.find(x => x.procurementRequestItemId == product.procurementRequestItemId);

          if (!hasValue) {
            this.listVendorOrderDetail = [...this.listVendorOrderDetail, product];
          }
        });
      }
    } else {
      this.listVendorOrderDetail = this.listVendorOrderDetail.filter(x => x.isReshow != true);
    }

    this.allocation();
    this.getSumarySection();
  }

  /* Th??m Chi ph?? */
  addCost() {
    let ref = this.dialogService.open(PopupAddEditCostVendorOrderComponent, {
      data: {
        isCreate: true,
        currentIndex: Math.max(...this.listCostModel.map(o => o.index), 0)
      },
      header: 'Th??m chi ph??',
      width: '30%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultCostDialog) => {
      if (result) {
        if (result.status) {
          this.listCostModel = [...this.listCostModel, result.costModel];

          //T??nh l???i t???ng chi ph??
          this.setTotalCost();
          this.allocation();
          this.getSumarySection();
        }
      }
    });
  }

  /* S???a Chi ph?? */
  onRowCostSelect(rowData: CostModel) {
    if (this.actionEdit && this.statusCode == 'DRA') {
      let ref = this.dialogService.open(PopupAddEditCostVendorOrderComponent, {
        data: {
          isCreate: false,
          currentIndex: rowData.index,
          costModel: rowData
        },
        header: 'S???a chi ph??',
        width: '30%',
        baseZIndex: 1030,
        contentStyle: {
          "min-height": "280px",
          "max-height": "600px",
          "overflow": "auto"
        }
      });

      ref.onClose.subscribe((result: ResultCostDialog) => {
        if (result) {
          if (result.status) {
            let modifyCost = this.listCostModel.find(x => x.index == result.costModel.index);
            let index = this.listCostModel.indexOf(modifyCost);
            this.listCostModel[index] = result.costModel;

            //T??nh l???i t???ng chi ph??
            this.setTotalCost();
            this.allocation();
            this.getSumarySection();
          }
        }
      });
    }
  }

  /* X??a Chi ph?? */
  deleteCostItem(rowData: CostModel) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.listCostModel = this.listCostModel.filter(e => e != rowData);

        //T??nh l???i t???ng chi ph??
        this.setTotalCost();
        this.allocation();
        this.getSumarySection();
      }
    });
  }

  /* T??nh t???ng chi ph?? */
  setTotalCost() {
    let totalCost = 0;
    this.listCostModel.map(x => x.unitPrice).forEach(cost => { totalCost += cost });
    this.totalCostControl.setValue(totalCost.toString());
  }

  /* Ph??n b??? Chi ph?? */
  allocation() {
    if (this.selectedCostType) {
      if (this.listVendorOrderDetail.length > 0) {
        //L???y T???ng chi ph??
        let totalCost = ParseStringToFloat(this.totalCostControl.value.toString());

        //N???u Theo s??? l?????ng
        if (this.selectedCostType == '0') {
          //L???y T???ng s??? l?????ng
          let totalQuantity = 0;
          this.listVendorOrderDetail.forEach(item => {
            totalQuantity += item.quantity;
            item.isEditCost = false;
          });

          //T??nh Chi ph?? mua h??ng, Gi?? nh???p kho, Gi?? tr??? nh???p kho
          this.listVendorOrderDetail.forEach(item => {
            //Chi ph?? mua h??ng cho t???ng s???n ph???m
            item.cost = this.roundNumber(totalCost * item.quantity / totalQuantity, 0);

            let sumAmountDiscount = 0;
            if (item.discountType == true) {
              sumAmountDiscount = this.roundNumber(((item.discountValue * item.quantity * item.unitPrice * item.exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
            } else {
              sumAmountDiscount = item.discountValue;
            }

            //Gi?? nh???p kho cho t???ng s???n ph???m
            item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount + item.cost) / item.quantity, 0);

            //Gi?? tr??? nh???p kho cho t???ng s???n ph???m
            item.priceValueWarehouse = this.roundNumber(item.quantity * item.priceWarehouse, 0);
          });
        }
        //N???u Theo gi?? tr???
        else if (this.selectedCostType == '1') {
          //L???y t???ng th??nh ti???n
          let totalAmount = 0;
          this.listVendorOrderDetail.forEach(item => {
            let sumAmountDiscount = 0;
            if (item.discountType == true) {
              sumAmountDiscount = this.roundNumber(((item.discountValue * item.quantity * item.unitPrice * item.exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
            } else {
              sumAmountDiscount = item.discountValue;
            }

            totalAmount += (item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount);
            item.isEditCost = false;
          });

          //T??nh Chi ph?? mua h??ng, Gi?? nh???p kho, Gi?? tr??? nh???p kho
          this.listVendorOrderDetail.forEach(item => {
            let sumAmountDiscount = 0;
            if (item.discountType == true) {
              sumAmountDiscount = this.roundNumber(((item.discountValue * item.quantity * item.unitPrice * item.exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
            } else {
              sumAmountDiscount = item.discountValue;
            }

            //Chi ph?? mua h??ng cho t???ng s???n ph???m
            item.cost = this.roundNumber(totalCost * (item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount) / totalAmount, 0);

            //Gi?? nh???p kho cho t???ng s???n ph???m
            item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount + item.cost) / item.quantity, 0);

            //Gi?? tr??? nh???p kho cho t???ng s???n ph???m
            item.priceValueWarehouse = this.roundNumber(item.quantity * item.priceWarehouse, 0);
          });
        }
      } else {
        let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n ch??a th??m s???n ph???m/d???ch v???' };
        this.showMessage(msg);
      }
    } else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n ch??a ch???n lo???i ph??n b???' };
      this.showMessage(msg);
    }
  }

  /* Event: B???t popup S???a chi ph?? mua h??ng c???a 1 s???n ph???m */
  editCost(dataRow: VendorOrderDetailModel) {
    this.dataRow = null;
    this.dataRow = dataRow;

    //N???u t???ng chi ph?? ??ang = 0 th?? kh??ng cho s???a
    let totalCost = ParseStringToFloat(this.totalCostControl.value.toString());
    if (totalCost > 0) {
      this.display = true;
      this.popupProductName = dataRow.description;
      this.popupCost = dataRow.cost ? dataRow.cost : 0;
    } else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Ch??a c?? t???ng chi ph??' };
      this.showMessage(msg);
    }
  }

  /* Event: Thay ?????i Chi ph?? mua h??ng trong popup */
  changePopupCost() {
    if (!this.popupCost || this.popupCost == '') {
      this.popupCost = 0;
    }
  }

  /* Event: H???y thay ?????i Chi ph?? mua h??ng trong popup */
  cancelPopup() {
    this.display = false;
    this.popupProductName = '';
    this.popupCost = 0;
    this.dataRow = null;
  }

  /* Event: L??u thay ?????i Chi ph?? mua h??ng trong popup */
  savePopup() {
    let _index = this.listVendorOrderDetail.indexOf(this.dataRow);

    let totalCost = ParseStringToFloat(this.totalCostControl.value.toString());
    let cost = ParseStringToFloat(this.popupCost.toString());

    //t???ng chi ph?? ???? s???a
    let _totalCostEdit = 0;
    this.listVendorOrderDetail.forEach((item, index) => {
      if (item.isEditCost == true && index != _index) {
        _totalCostEdit += item.cost;
      }
    });

    let count = this.listVendorOrderDetail.length;
    let count_edit = this.listVendorOrderDetail.filter(x => x.isEditCost == true).length;

    //N???u chi ph?? mua h??ng c???a s???n ph???m l???n h??n T???ng chi ph?? th?? kh??ng cho s???a
    if (cost <= totalCost) {
      if (cost + _totalCostEdit > totalCost) {
        let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Chi ph?? s???n ph???m v?????t qu?? chi ph?? c??n l???i' };
        this.showMessage(msg);
      }
      else if (this.dataRow.isEditCost != true && (count - count_edit) == 1) {
        let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'B???n ph???i ph??n b??? l???i ??? Th??ng tin chi ph??' };
        this.showMessage(msg);
      }
      else {
        this.display = false;

        /*Begin: T??nh l???i c??c lo???i chi ph?? c???a s???n ph???m ???????c s???a*/

        //chi ph?? mua h??ng:
        this.dataRow.cost = cost;

        let sumAmountDiscount = 0;
        if (this.dataRow.discountType == true) {
          sumAmountDiscount = this.roundNumber(((this.dataRow.discountValue * this.dataRow.quantity * this.dataRow.unitPrice * this.dataRow.exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
        } else {
          sumAmountDiscount = this.dataRow.discountValue;
        }

        //gi?? nh???p kho:
        this.dataRow.priceWarehouse = this.roundNumber((this.dataRow.quantity * this.dataRow.unitPrice * this.dataRow.exchangeRate - sumAmountDiscount + this.dataRow.cost) / this.dataRow.quantity, 0);

        //gi?? tr??? nh???p kho:
        this.dataRow.priceValueWarehouse = this.roundNumber(this.dataRow.quantity * this.dataRow.priceWarehouse, 0);

        this.dataRow.isEditCost = true;

        this.listVendorOrderDetail[_index] = this.dataRow;

        /*End: T??nh l???i c??c lo???i chi ph?? c???a s???n ph???m ???????c s???a*/

        /*Begin: T??nh l???i chi ph?? cho c??c s???n ph???m kh??c*/

        //t???ng chi ph?? ???? s???a
        let totalCostEdit = 0;
        this.listVendorOrderDetail.forEach(item => {
          if (item.isEditCost == true) {
            totalCostEdit += item.cost;
          }
        });

        let remainTotalCost = totalCost - totalCostEdit;
        let remainTotalQuantity = 0;
        let reaminTotalAmount = 0;

        this.listVendorOrderDetail.forEach((item, index) => {
          if (item.isEditCost != true) {
            remainTotalQuantity += item.quantity;
          }

          let sumAmountDiscount = 0;
          if (item.discountType == true) {
            sumAmountDiscount = this.roundNumber(((item.discountValue * item.quantity * item.unitPrice * item.exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
          } else {
            sumAmountDiscount = item.discountValue;
          }
          reaminTotalAmount += (item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount);
        });

        this.listVendorOrderDetail.forEach((item, index) => {
          if (item.isEditCost != true) {
            if (this.selectedCostType == '0') {
              //chi ph?? mua h??ng:
              item.cost = this.roundNumber(remainTotalCost * item.quantity / remainTotalQuantity, 0);

              let sumAmountDiscount = 0;
              if (item.discountType == true) {
                sumAmountDiscount = this.roundNumber(((item.discountValue * item.quantity * item.unitPrice * item.exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
              } else {
                sumAmountDiscount = item.discountValue;
              }

              //gi?? nh???p kho:
              item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount + item.cost) / item.quantity, 0);

              //gi?? tr??? nh???p kho:
              item.priceValueWarehouse = this.roundNumber(item.quantity * item.priceWarehouse, 0);
            } else if (this.selectedCostType == '1') {
              //chi ph?? mua h??ng:
              item.cost = this.roundNumber(remainTotalCost * (item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount) / reaminTotalAmount, 0);

              //gi?? nh???p kho:
              item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - sumAmountDiscount + item.cost) / item.quantity, 0);

              //gi?? tr??? nh???p kho:
              item.priceValueWarehouse = this.roundNumber(item.quantity * item.priceWarehouse, 0);
            }
          }
        });

        /*End: T??nh l???i chi ph?? cho c??c s???n ph???m kh??c*/

        this.getSumarySection();
      }
    }
    else {
      let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Chi ph?? s???n ph???m l???n h??n T???ng chi ph??' };
      this.showMessage(msg);
    }
  }

  /* BEGIN: Ch???c n??ng Ghi ch?? */

  /* Event thay ?????i n???i dung ghi ch?? */
  currentTextChange: string = '';
  changeNoteContent(event) {
    this.currentTextChange = event.textValue;
  }

  cancelNote() {
    this.translate.get('procurement-request.messages_confirm.cancel_confirm_note').subscribe(value => { this.messageTitle = value; });
    this.confirmationService.confirm({
      message: this.messageTitle,
      accept: () => {
        this.noteId = null;
        this.noteContent = null;
        this.uploadedFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();
        }
        this.listUpdateFileNote = [];
        this.isEditNote = false;
      }
    });
  }

  /* Event th??m file d?????c ch???n v??o list file note */
  handleNoteFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= 10000000) {
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

  /*Event khi click x??a t???ng file */
  removeNoteFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event khi click x??a to??n b??? file */
  clearAllNoteFile() {
    this.uploadedFiles = [];
  }

  /*Event khi x??a 1 file trong comment ???? l??u tr??n server*/
  deleteNoteFile(file: FileInFolder) {
    this.translate.get('procurement-request.messages_confirm.delete_confirm').subscribe(value => { this.messageTitle = value; });
    this.confirmationService.confirm({
      message: this.messageTitle,
      accept: () => {
        let index = this.listUpdateFileNote.indexOf(file);
        this.listUpdateFileNote.splice(index, 1);
      }
    });
  }

  downloadNoteFile(fileInfor: NoteDocument) {
    this.imageService.downloadFile(fileInfor.documentName, fileInfor.documentUrl).subscribe(response => {
      var result = <any>response;
      var binaryString = atob(result.fileAsBase64);
      var fileType = result.fileType;
      var name = fileInfor.documentName;

      var binaryLen = binaryString.length;
      var bytes = new Uint8Array(binaryLen);
      for (var idx = 0; idx < binaryLen; idx++) {
        var ascii = binaryString.charCodeAt(idx);
        bytes[idx] = ascii;
      }
      var file = new Blob([bytes], { type: fileType });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file);
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

  /*L??u file v?? ghi ch?? v??o Db*/
  async saveNote() {
    this.loading = true;

    let noteModel = new NoteModel();

    /*T???o m???i ghi ch??*/
    if (!this.noteId) {
      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.vendorOrderId;
      noteModel.ObjectType = 'VENDORORDER';
      noteModel.NoteTitle = this.messageTitle;
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    }
    /*Update ghi ch??*/
    else {
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.vendorOrderId;
      noteModel.ObjectType = 'VENDORORDER';
      noteModel.NoteTitle = this.messageTitle;
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    }

    let listFileNoteUploadModel: Array<FileUploadModel> = [];
    this.uploadedFiles.forEach(item => {
      let fileUpload: FileUploadModel = new FileUploadModel();
      fileUpload.FileInFolder = new FileInFolder();
      fileUpload.FileInFolder.active = true;
      let index = item.name.lastIndexOf(".");
      let name = item.name.substring(0, index);
      fileUpload.FileInFolder.fileName = name;
      fileUpload.FileInFolder.fileExtension = item.name.substring(index + 1);
      fileUpload.FileInFolder.size = item.size;
      fileUpload.FileInFolder.objectId = this.emptyGuid;
      fileUpload.FileInFolder.objectType = 'NOTE';
      fileUpload.FileSave = item;
      listFileNoteUploadModel.push(fileUpload)
    });

    this.noteService.createNoteForObject(noteModel, listFileNoteUploadModel, "QLMHCON").subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        /*Reshow Time Line*/
        this.noteHistory = result.listNote;

        this.uploadedFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();  //X??a to??n b??? file trong control
        }
        this.noteContent = null;
        this.listUpdateFileNote = [];
        this.noteId = null;
        this.isEditNote = false;

        this.handleNoteContent();

        let msg = { severity: 'success', summary: 'Th??ng b??o', detail: 'Th??m ghi ch?? th??nh c??ng' };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*X??? l?? v?? hi???n th??? l???i n???i dung ghi ch??*/
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

  /*Event S????a ghi chu??*/
  onClickEditNote(noteId: string, noteDes: string) {
    this.noteContent = noteDes;
    this.noteId = noteId;
    this.listUpdateFileNote = this.noteHistory.find(x => x.noteId == this.noteId).listFile;
    this.isEditNote = true;
  }
  /*End*/

  /*Event X??a ghi ch??*/
  onClickDeleteNote(noteId: string) {
    this.translate.get('procurement-request.messages_confirm.delete_confirm_note').subscribe(value => { this.messageTitle = value; });
    this.confirmationService.confirm({
      message: this.messageTitle,
      accept: () => {
        this.loading = true;
        this.noteService.disableNote(noteId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            let note = this.noteHistory.find(x => x.noteId == noteId);
            let index = this.noteHistory.lastIndexOf(note);
            this.noteHistory.splice(index, 1);

            this.translate.get('procurement-request.messages_title.title_info').subscribe(value => { this.messageTitle = value; });
            this.translate.get('procurement-request.create.del_note_success').subscribe(value => { this.messageConfirm = value; });
            let msg = { severity: 'success', summary: this.messageTitle, detail: this.messageConfirm };
            this.showMessage(msg);
          } else {
            this.translate.get('procurement-request.messages_title.title_info').subscribe(value => { this.messageTitle = value; });
            let msg = { severity: 'error', summary: this.messageTitle, detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
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
      this.translate.get('procurement-request.create.hiden').subscribe(value => { this.toggle_note_label = value; });
      curr.removeClass('pi-chevron-right');
      curr.addClass('pi-chevron-down');
    } else {
      this.translate.get('procurement-request.create.show').subscribe(value => { this.toggle_note_label = value; });
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

  /* N???u l?? ???nh th?? m??? tab m???i, n???u l?? t??i li???u th?? download */
  openItem(name, fileExtension, fileInFolderId) {
    this.folderService.downloadFile(fileInFolderId).subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        var binaryString = atob(result.fileAsBase64);
        var fileType = result.fileType;
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var idx = 0; idx < binaryLen; idx++) {
          var ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        var file = new Blob([bytes], { type: fileType });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        } else {
          var fileURL = URL.createObjectURL(file);
          if (fileType.indexOf('image') !== -1) {
            window.open(fileURL);
          } else {
            var anchor = document.createElement("a");
            anchor.download = name.substring(0, name.lastIndexOf('_')) + "." + fileExtension;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }

  /* END: Ch???c n??ng Ghi ch?? */


  /* X??a ????n h??ng mua */
  removeVendorOrder() {
    this.confirmationService.confirm({
      message: "B???n c?? ch???c ch???n mu???n x??a ????n h??ng mua n??y?",
      accept: () => {
        this.loading = true;
        this.vendorService.removeVendorOrder(this.vendorOrderId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            this.router.navigate(['vendor/list-order']);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }

  /* H???y ????n h??ng mua */
  cancelVendorOrder() {
    //Chuy???n ????n h??ng mua sang tr???ng th??i H???y
    this.vendorService.cancelVendorOrder(this.vendorOrderId).subscribe(response => {
      let result: any = response;

      if (result.statusCode == 200) {
        this.getMasterData();
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /* Chuy???n ????n h??ng mua v??? tr???ng th??i M???i t???o */
  draftVendorOrder(isCancelApproval: boolean) {
    this.vendorService.draftVendorOrder(this.vendorOrderId, isCancelApproval).subscribe(response => {
      let result: any = response;
      if (result.statusCode == 200) {
        this.getMasterData();
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /* M??? popup T???o nhanh nh?? cung c???p */
  openQuickCreVendorModal() {
    //this.displayModal = true;
    let ref = this.dialogService.open(QuickCreateVendorComponent, {
      data: {},
      header: 'T???o nhanh nh?? cung c???p',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        this.listVendorCreateOrderModel = [];
        this.listVendorCreateOrderModel = result.listVendor;
        //set lu??n nh?? cung c???p v???a t???o cho control nh?? cung c???p
        let newVendor = this.listVendorCreateOrderModel.find(x => x.vendorId == result.newVendorId);
        this.vendorControl.setValue(newVendor ? newVendor : null);

        //Hi???n th??? l???i th??ng tin c???a nh?? cung c???p v???a t???o
        let event = {
          value: newVendor ? newVendor : null
        }
        this.changeVendor(event);
      }
    });
  }

  /* C???p nh???t l???i s??? l?????ng th???c t??? ph?? duy???t */
  updateQuantityItem() {
    if (this.listItemInvalidModel.length > 0) {
      /* #region  X??a c??c item ???? ?????t h???t s??? l?????ng */
      let listItemInvalidRemove = this.listItemInvalidModel.filter(x => {
        if (x.remainQuantity == 0) {
          return true;
        }
      }).map(x => x.procurementRequestItemId);
      listItemInvalidRemove.forEach(_itemRequestId => {
        let vendorDetail = this.listVendorOrderDetail.find(x => x.procurementRequestItemId == _itemRequestId);

        /* #region  X??a item trong list s???n ph???m v?? t??nh to??n l???i t???ng s??? ti???n */
        this.listVendorOrderDetail = this.listVendorOrderDetail.filter(e => e != vendorDetail);
        this.allocation();
        this.getSumarySection();
        this.setValidatorForDiscount();

        //Ki???m tra list s???n ph???m trong phi???u ????? xu???t ???? b??? x??a h???t trong danh s??ch sp/dv ch??a?
        if (vendorDetail.procurementRequestId) {
          let listSelected = this.procurementRequestControl.value;
          if (listSelected.length > 0) {
            let hasValue = this.listVendorOrderDetail.find(x => x.procurementRequestId == vendorDetail.procurementRequestId);

            //N???u kh??ng c??n s???n ph???m n??o trong phi???u ????? xu???t th?? b??? checked trong listSelected
            if (!hasValue) {
              listSelected = listSelected.filter(x => x.procurementRequestId != vendorDetail.procurementRequestId);
              this.procurementRequestControl.setValue(listSelected);
            }
          }
        }
        /* #endregion */

        listItemInvalidRemove = listItemInvalidRemove.filter(x => x != _itemRequestId);
      });
      /* #endregion */

      /* #region  C???p nh???t l???i s??? l?????ng c??c item */
      let listChangeItem = this.listItemInvalidModel.filter(x => { if (x.remainQuantity > 0) return true });
      if (listChangeItem.length > 0) {
        this.listVendorOrderDetail.forEach(item => {
          let itemChange = listChangeItem.find(x => x.procurementRequestItemId == item.procurementRequestItemId);

          if (itemChange) {
            item.quantity = itemChange.remainQuantity;

            //T??nh l???i th??nh ti???n sau thu???
            let amount = item.quantity * item.exchangeRate * item.unitPrice;
            let discount = 0;
            if (item.discountType) {
              discount = this.roundNumber(amount * item.discountValue / 100, parseInt(this.defaultNumberType, 10));
            } else {
              discount = item.discountValue;
            }
            let amountVat = this.roundNumber((amount - discount) * item.vat / 100, parseInt(this.defaultNumberType, 10));
            item.sumAmount = amount - discount + amountVat;
            item.sumAmountDiscount = discount;

            item.isInvalidItemRequest = false;
          }
        });

        this.allocation();
        this.getSumarySection();
        this.setValidatorForDiscount();
      }
      /* #endregion */
    }
  }

  /* Chuy???n item l??n m???t c???p */
  moveUp(data: VendorOrderDetailModel) {
    let currentOrderNumber = data.orderNumber;
    let preOrderNumber = currentOrderNumber - 1;
    let pre_data = this.listVendorOrderDetail.find(x => x.orderNumber == preOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    pre_data.orderNumber = currentOrderNumber;
    data.orderNumber = preOrderNumber;

    //X??a 2 item
    this.listVendorOrderDetail = this.listVendorOrderDetail.filter(x =>
      x.orderNumber != preOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listVendorOrderDetail = [...this.listVendorOrderDetail, pre_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listVendorOrderDetail.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Chuy???n item xu???ng m???t c???p */
  moveDown(data: VendorOrderDetailModel) {
    let currentOrderNumber = data.orderNumber;
    let nextOrderNumber = currentOrderNumber + 1;
    let next_data = this.listVendorOrderDetail.find(x => x.orderNumber == nextOrderNumber);

    //?????i s??? OrderNumber c???a 2 item
    next_data.orderNumber = currentOrderNumber;
    data.orderNumber = nextOrderNumber;

    //X??a 2 item
    this.listVendorOrderDetail = this.listVendorOrderDetail.filter(x =>
      x.orderNumber != nextOrderNumber && x.orderNumber != currentOrderNumber);

    //Th??m l???i item tr?????c v???i s??? OrderNumber ???? thay ?????i
    this.listVendorOrderDetail = [...this.listVendorOrderDetail, next_data, data];

    //S???p x???p l???i danh s??ch s???n ph???m/d???ch v??? theo s??? OrderNumber
    this.listVendorOrderDetail.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  paymentAction() {
    if (!this.paymentMethodTotalPanelControl.valid) {
      Object.keys(this.paymentMethodTotalPanelControl).forEach(key => {
        if (this.paymentMethodTotalPanelControl.valid == false) {
          this.paymentMethodTotalPanelControl.markAsTouched();
        }
      });
    }
    else {
      let paymentMethod = this.paymentMethodTotalPanelControl.value;
      if (paymentMethod) {
        if (paymentMethod.categoryCode == 'CASH') {
          this.router.navigate(['/accounting/cash-payments-create', { vendorOrderId: this.vendorOrderId }]);
        } else {
          this.router.navigate(['/accounting/bank-payments-create', { vendorOrderId: this.vendorOrderId }]);
        }
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: "Ch???n ph????ng th???c thanh to??n tr?????c" };
        this.showMessage(msg);
      }
    }
  }

  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 9 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  /*Event upload list file*/
  myUploader(event: any) {
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
      fileUpload.FileInFolder.objectId = this.vendorOrderId;
      fileUpload.FileInFolder.objectType = 'QLMHCON';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    this.contractService.uploadFile("QLMHCON", listFileUploadModel, this.vendorOrderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedFiles = [];
        if (this.fileUpload) {
          this.fileUpload.clear();  //X??a to??n b??? file trong control
        }

        this.listFile = result.listFileInFolder;
        let msg = { severity: 'success', summary: 'Th??ng b??o', detail: "Th??m file th??nh c??ng" };
        this.showMessage(msg);
      } else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
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
  deleteFile(file: FileInFolder) {
    this.confirmationService.confirm({
      message: 'B???n ch???c ch???n mu???n x??a?',
      accept: () => {
        this.contractService.deleteFile(file.fileInFolderId).subscribe(res => {
          let result: any = res;

          if (result.statusCode == 200) {
            this.listFile = this.listFile.filter(x => x.fileInFolderId != file.fileInFolderId);

            let msg = { severity: 'success', summary: 'Th??ng b??o', detail: 'X??a file th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
            this.showMessage(msg);
          }
        })
        // let index = this.listFile.indexOf(file);
        // this.listFile.splice(index, 1);
      }
    });
  }

  downloadFile(data: FileInFolder) {
    this.folderService.downloadFile(data.fileInFolderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        var binaryString = atob(result.fileAsBase64);
        var fileType = result.fileType;
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var idx = 0; idx < binaryLen; idx++) {
          var ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        var file = new Blob([bytes], { type: fileType });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        } else {
          var fileURL = URL.createObjectURL(file);
          if (fileType.indexOf('image') !== -1) {
            window.open(fileURL);
          } else {
            var anchor = document.createElement("a");
            anchor.download = data.fileName.substring(0, data.fileName.lastIndexOf('_')) + "." + data.fileExtension;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      }
      else {
        let msg = { severity: 'error', summary: 'Th??ng b??o', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  goDetails(Id: any) {
    this.router.navigate(['/warehouse/inventory-receiving-voucher/detail', { inventoryReceivingVoucherId: Id }]);
  }
}

function ParseStringToFloat(str: any) {
  if (str === "") return 0;
  str = String(str).replace(/,/g, '');
  return parseFloat(str);
}

function forbiddenSpaceText(control: FormControl) {
  let text = control.value;
  if (text && text.trim() == "") {
    return {
      forbiddenSpaceText: {
        parsedDomain: text
      }
    }
  }
  return null;
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

function convertDateToTimeSpan(Time: Date): string {
  let result = '';
  let Hour = Time.getHours().toString();
  let Minute = Time.getMinutes().toString();
  result = Hour + ":" + Minute;

  return result;
}

function convertTimeSpanToDate(TimeSpan: string): Date {
  let result = new Date();
  let index = TimeSpan.indexOf(':');
  let hour = parseInt(TimeSpan.slice(0, index), 10);
  let minute = parseInt(TimeSpan.slice(index + 1, TimeSpan.length), 10);
  result.setHours(hour);
  result.setMinutes(minute);

  return result;
}

function ValidationMaxValuePT(max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      let value = ParseStringToFloat(control.value);
      if (value > max) return { 'maxValuePT': true }
    }
    return null;
  }
}

function ValidationMaxValueST(max: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null && control.value !== undefined) {
      let value = ParseStringToFloat(control.value);
      if (value > max) return { 'maxValueST': true }
    }
    return null;
  }
}
