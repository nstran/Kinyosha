import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { VendorOrderModel } from '../../models/vendorOrder.model';
import { VendorOrderDetailModel } from '../../models/vendorOrderDetail.model';
import { VendorOrderProductDetailProductAttributeValueModel } from '../../models/vendorOrderProductDetailProductAttributeValue.model';
import { VendorService } from "../../services/vendor.service";
import { GetPermission } from '../../../shared/permission/get-permission';
import { AddVendorOrderProductComponent } from '../add-vendor-order-product/add-vendor-order-product.component';
import { PopupAddEditCostVendorOrderComponent } from '../../components/popup-add-edit-cost-vendor-order/popup-add-edit-cost-vendor-order.component';

import * as $ from 'jquery';

import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

import { QuickCreateVendorComponent } from '../../../shared/components/quick-create-vendor/quick-create-vendor.component';

class DiscountType {
  name: string;
  code: string;
  value: boolean;
}

interface ConfigDialogOrderDetail {
  isCreate: boolean;
  vendor: vendorCreateOrderModel;
  vendorOrderDetail: VendorOrderDetailModel,
  isProcurementRequestItem: boolean;
  quantityApproval: number;
  isEdit: boolean;
  type: string;
}

interface ResultDialog {
  status: boolean,
  vendorOrderDetail: VendorOrderDetailModel
}

class orderStatus {
  orderStatusId: string;
  orderStatusCode: string;
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
  vendorCode: string;
  vendorName: string;
  vendorPhone: string;
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

@Component({
  selector: 'app-create-vendor-order',
  templateUrl: './create-vendor-order.component.html',
  styleUrls: ['./create-vendor-order.component.css'],
  providers: [ConfirmationService, MessageService, DialogService]
})
export class CreateVendorOrderComponent implements OnInit {
  /*Khai b??o bi???n*/
  loading: boolean = false;
  awaitResult: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();
  auth: any = JSON.parse(localStorage.getItem("auth"));
  createPermission: string = "vendor-order/create";
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  userPermission: any = localStorage.getItem("UserPermission").split(',');
  actionAdd: boolean = true;
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
  //routing
  vendorId: string;
  procurementId: string;
  /* Form */
  createOrderForm: FormGroup;
  orderDateControl: FormControl;
  orderStatusControl: FormControl;
  ordererControl: FormControl;
  descriptionControl: FormControl;
  noteControl: FormControl;
  vendorControl: FormControl;
  vendorContactControl: FormControl;
  paymentControl: FormControl;
  bankAccountControl: FormControl;
  // receivedDateControl: FormControl; ngay nhan
  // receivedHourControl: FormControl; gio nhan
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
  listOrderStatus: Array<orderStatus> = [];
  listEmployee: Array<employeeModel> = [];
  listPaymentMethod: Array<paymentMethod> = [];
  listVendorCreateOrderModel: Array<vendorCreateOrderModel> = [];
  listBankAccount: Array<bankAccount> = [];
  listProcurementRequest: Array<any> = [];
  listCurrentVendorContact: Array<vendorContact> = [];
  listCurrentBankAccount: Array<bankAccount> = [];
  objProcurementRequest: any;
  listContract: Array<any> = [];
  listWareHouse: Array<any> = [];
  listCostModel: Array<CostModel> = [];
  listVendorOrderProcurementRequestMapping: Array<VendorOrderProcurementRequestMapping> = [];
  listVendorOrderCostDetail: Array<VendorOrderCostDetail> = [];

  optionCustomer: string = '2';
  listCustomer: Array<any> = [];
  customerEmail: string = '';
  customerPhone: string = '';
  fullAddress: string = '';
  leadName: string = '';
  leadEmail: string = '';
  leadPhone: string = '';
  leadFullAddress: string = '';

  //table
  cols: any[];
  selectedColumns: any[];
  selectedItem: any;

  colsCost: any[];
  selectedColumnsCost: any[];
  selectedItemCost: any;

  isBank: boolean = true;

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

  selectedCostType: string = '0';

  /*Data popup inline*/
  display: boolean = false;
  popupProductName: string = '';
  popupCost: any = 0;

  /*Data popup T???o nhanh nh?? cung c???p*/
  listVendorGroup: Array<any> = [];

  isShow: boolean = true;
  colLeft: number = 9;

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private getPermission: GetPermission,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private el: ElementRef,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private renderer: Renderer2,
  ) {
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
    this.setTable();
    let resource = "buy/vendor/create-order/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }

      this.route.params.subscribe(params => {
        if (params['vendorId']) {
          //??i t??? nh?? cung c???p
          this.vendorId = params['vendorId'];
        }
        if (params['procurementId']) {
          //??i t??? ????? xu???t mua h??ng
          this.procurementId = params['procurementId'];
        }
      });

      //this.setForm();

      this.getMasterData();
    }
  }

  setForm() {
    let emailPattern = '^([" +"]?)+[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]+([" +"]?){2,64}';

    this.orderDateControl = new FormControl(new Date(), [Validators.required]);
    this.orderStatusControl = new FormControl(null); //, [Validators.required]);
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

    this.createOrderForm = new FormGroup({
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
      totalCostControl: this.totalCostControl,
    });
  }

  resetForm() {
    this.createOrderForm.reset();

    this.orderDateControl.setValue((new Date()));
    this.orderStatusControl.setValue(null);
    let emp = this.listEmployee.find(c => c.employeeId == this.auth.EmployeeId);
    this.ordererControl.setValue(emp);
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
      { field: 'orderNumber', header: '#', width: '140px', textAlign: 'center', color: '#f44336' },
      { field: 'description', header: 'T??n h??ng', width: '500px', textAlign: 'left', color: '#f44336' },
      // { field: 'vendorName', header: 'Nh?? cung c???p', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'S??? l?????ng', width: '80px', textAlign: 'right', color: '#f44336' },
      { field: 'unitName', header: '????n v??? t??nh', width: '90px', textAlign: 'left', color: '#f44336' },
      { field: 'unitPrice', header: '????n gi??', width: '140px', textAlign: 'right', color: '#f44336' },
      { field: 'currencyUnitName', header: '????n v??? ti???n', width: '90px', textAlign: 'left', color: '#f44336' },
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
  }

  resetTable() {
    this.listVendorOrderDetail = [];
    this.listCostModel = [];
  }

  resetSumarySection() {
    this.totalAmountBeforeDiscount = 0;
    this.discountTypeControl.setValue(this.discountTypeList.find(x => x.code == "PT"));
    this.discountValueControl.setValue('0');
    this.totalAmountBeforeVat = 0;  //T???ng th??nh ti???n tr?????c thu???
    this.totalAmountVat = 0;  //T???ng ti???n thu???
    this.totalAmountCost = 0; //T???ng ti???n chi ph?? mua h??ng
    this.discountPerOrder = 0;  //T???ng ti???n chi???t kh???u
    this.totalAmountAferDiscount = 0; //T???ng thanh to??n
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

  cancel() {
    this.confirmationService.confirm({
      message: `C??c thay ?????i s??? kh??ng ???????c l??u l???i. H??nh ?????ng n??y kh??ng th??? ???????c ho??n t??c, b???n c?? ch???c ch???n mu???n hu????`,
      accept: () => {
        this.router.navigate(['vendor/list-order']);
      }
    });
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  /*Th??m s???n ph???m d???ch v???*/
  addCustomerOrderDetail() {
    const currentVendor: vendorCreateOrderModel = this.vendorControl.value;
    // if (!currentVendor) {
    //   let msg = { severity: 'warn', summary: 'Th??ng b??o:', detail: 'Ch???n nh?? cung c???p' };
    //   this.showMessage(msg);
    //   return false;
    // }

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
        "max-height": "600px"
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
    //Ki???m tra xem item c?? ph???i l?? t??? ????? xu???t hay kh??ng
    let isProcurementRequestItem = dataRow.procurementRequestItemId ? true : false;
    let quantityApproval = 0;
    if (isProcurementRequestItem) {
      let result: any = await this.vendorService.getQuantityApproval(dataRow.vendorOrderDetailId, dataRow.procurementRequestItemId, dataRow.productId);
      // quantityApproval = dataRow.quantity;
      quantityApproval = result.quantityApproval;
    }
    const currentVendor: vendorCreateOrderModel = this.vendorControl.value;
    let data: ConfigDialogOrderDetail = {
      isCreate: false,
      vendor: currentVendor,
      vendorOrderDetail: dataRow,
      isProcurementRequestItem: isProcurementRequestItem,
      quantityApproval: quantityApproval,
      isEdit: true,
      type: 'BUY'
    }

    let ref = this.dialogService.open(AddVendorOrderProductComponent, {
      data: data,
      header: 'Ch???nh s???a s???n ph???m d???ch v???',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          let vendorOrderDetail = result.vendorOrderDetail;
          let index = this.listVendorOrderDetail.indexOf(dataRow);
          if (index !== -1) {
            this.listVendorOrderDetail[index] = vendorOrderDetail;
            this.allocation();
            this.getSumarySection();
            this.setValidatorForDiscount();
          }
        }
      }
    });
  }

  /*X??a m???t s???n ph???m d???ch v???*/
  deleteItem(dataRow: VendorOrderDetailModel, event: Event) {
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

  patchVendorData(vendorId: string) {
    this.listCurrentVendorContact = [];
    this.vendorContactControl.reset();
    let currentVendor: vendorCreateOrderModel = this.listVendorCreateOrderModel.find(e => e.vendorId == vendorId);

    this.vendorControl.setValue(currentVendor);

    this.listCurrentVendorContact = currentVendor.listVendorContact;
    if (this.listCurrentVendorContact.length === 1) {
      this.vendorContactControl.setValue(this.listCurrentVendorContact[0]);
    }

    let payment = this.listPaymentMethod.find(e => e.categoryId == currentVendor.paymentId);
    if (payment) {
      this.paymentControl.setValue(payment);
      if (payment.categoryCode == "BANK") {
        //show t??i kho???n ng??n h??ng
        this.listCurrentBankAccount = this.listBankAccount.filter(e => e.objectId == currentVendor.vendorId);
        if (this.listCurrentBankAccount.length == 1) {
          this.bankAccountControl.setValue(this.listCurrentBankAccount[0]);
        }
      }
    }
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
      if (this.vendorControl.value) {
        //show t??i kho???n ng??n h??ng
        this.listCurrentBankAccount = this.listBankAccount.filter(e => e.objectId == currentVendor.vendorId);
        if (this.listCurrentBankAccount.length == 1) {
          this.bankAccountControl.setValue(this.listCurrentBankAccount[0]);
        }
      }
    }
    else {
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

  async getMasterData() {
    this.loading = true;
    let result: any = await this.vendorService.getDataCreateVendorOrder(this.auth.UserId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listEmployee = result.listEmployeeModel;
      this.listOrderStatus = result.listOrderStatus;
      this.listPaymentMethod = result.listPaymentMethod;
      this.listVendorCreateOrderModel = result.vendorCreateOrderModel;
      this.listVendorCreateOrderModel.forEach(item => {
        item.vendorName = item.vendorCode + ' - ' + item.vendorName;
      });
      this.listBankAccount = result.listBankAccount;
      this.listProcurementRequest = result.listProcurementRequest;
      this.listWareHouse = result.listWareHouse;
      this.listVendorGroup = result.listVendorGroup;
      this.setDefaultFormValues();

      if (this.vendorId) this.patchVendorData(this.vendorId);
    } else {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  setDefaultFormValues() {
    // set user ????ng nh???p l?? ng?????i t???o
    let emp = this.listEmployee.find(c => c.employeeId == this.auth.EmployeeId);
    this.ordererControl.setValue(emp);
    if (this.procurementId !== null && this.procurementId !== undefined && this.procurementId !== '') {
      this.objProcurementRequest = this.listProcurementRequest.find(p => p.procurementRequestId == this.procurementId);

      if (this.objProcurementRequest !== null && this.objProcurementRequest !== undefined) {
        this.procurementRequestControl.setValue([this.objProcurementRequest]);
        let vendorId = null;
        this.objProcurementRequest.listDetail.forEach(order => {
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
          vendorOrderDetail.orderDetailType = order.orderDetailType;
          vendorOrderDetail.isReshow = true;
          vendorOrderDetail.procurementRequestItemId = order.procurementRequestItemId;
          vendorOrderDetail.procurementRequestId = order.procurementRequestId;
          vendorOrderDetail.procurementCode = order.procurementCode;
          vendorOrderDetail.warehouseId = order.warehouseId;

          this.listVendorOrderDetail.push(vendorOrderDetail);


          if (vendorId === null && order.vendorId !== null && order.vendorId !== undefined && order.vendorId !== '') {
            vendorId = order.vendorId;
          }
        });
        if (vendorId !== null) {
          let objVendor = this.listVendorCreateOrderModel.find(v => v.vendorId === vendorId);
          this.vendorControl.setValue(objVendor);
          this.patchVendorData(objVendor.vendorId);
        }
        this.allocation();
        this.getSumarySection();
      }
    }
  }

  async createOrder(type: boolean) {
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

      this.listVendorOrderProcurementRequestMapping = [];
      let listSelectedProcurementRequest = this.procurementRequestControl.value;

      if (listSelectedProcurementRequest.length > 0) {
        listSelectedProcurementRequest.forEach(item => {
          let vendorOrderProcurementRequestMapping = new VendorOrderProcurementRequestMapping();

          vendorOrderProcurementRequestMapping.vendorOrderProcurementRequestMappingId = this.emptyGuid;
          vendorOrderProcurementRequestMapping.vendorOrderId = this.emptyGuid;
          vendorOrderProcurementRequestMapping.procurementRequestId = item.procurementRequestId;
          vendorOrderProcurementRequestMapping.active = true;
          vendorOrderProcurementRequestMapping.createdById = this.auth.UserId;
          vendorOrderProcurementRequestMapping.createdDate = new Date();

          this.listVendorOrderProcurementRequestMapping = [...this.listVendorOrderProcurementRequestMapping, vendorOrderProcurementRequestMapping];
        });
      }

      this.listVendorOrderCostDetail = [];
      if (this.listCostModel.length > 0) {
        this.listCostModel.forEach(item => {
          let vendorOrderCostDetail = new VendorOrderCostDetail();

          vendorOrderCostDetail.vendorOrderCostDetailId = this.emptyGuid;
          vendorOrderCostDetail.costId = item.costId;
          vendorOrderCostDetail.vendorOrderId = this.emptyGuid;
          vendorOrderCostDetail.unitPrice = item.unitPrice;
          vendorOrderCostDetail.costName = item.costName;
          vendorOrderCostDetail.active = true;
          vendorOrderCostDetail.createdById = this.auth.UserId;
          vendorOrderCostDetail.createdDate = new Date();

          this.listVendorOrderCostDetail = [...this.listVendorOrderCostDetail, vendorOrderCostDetail];
        });
      }

      let countVendor = this.listVendorOrderDetail.filter(v => v.vendorId == vendorOrder.vendorId);
      if (countVendor.length !== this.listVendorOrderDetail.length) {
        var objectVendorId = countVendor.map(c => c.vendorId);
        var lstObj = this.listVendorOrderDetail.filter(c => objectVendorId.indexOf(c.vendorId));
        var messageProduct = ``;

        lstObj.forEach(item => {
          if (item.description !== null && item.description !== undefined && item.description !== '') {
            messageProduct = messageProduct + `<div style="padding-left: 30px;"> - ` + item.description + `</div>`;
          }
        });

        this.confirmationService.confirm({
          message: `C??c s???n ph???m d???ch v???: <br/>` + messageProduct +
            `<br/>??ang ???????c b??n b???i nh?? cung c???p kh??c nh?? cung c???p ???? ch???n!<br/>B???n c?? ch???c ch???n mu???n t???o ????n ?????t h??ng n??y?`,
          accept: async () => {
            this.awaitResult = true;
            let result: any = await this.vendorService.createVendorOrderAsync(vendorOrder, listVendorOrderDetail,
              this.listVendorOrderProcurementRequestMapping, this.listVendorOrderCostDetail);
            this.loading = false;
            if (result.statusCode == 200 || result.statusCode == 202) {
              if (type == true) {
                this.resetForm();
                this.resetTable();
                this.resetSumarySection();
                this.awaitResult = false;
                let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o ????n h??ng mua th??nh c??ng' };
                this.showMessage(msg);
              } else {
                let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o ????n h??ng mua th??nh c??ng' };
                this.showMessage(msg);
                setTimeout(time => {
                  this.router.navigate(['/vendor/detail-order', { vendorOrderId: result.vendorOrderId }]);
                }, 2000);
              }
            } else {
              let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
              this.showMessage(msg);
            }
          }
        });
      }
      else {
        this.awaitResult = true;
        let result: any = await this.vendorService.createVendorOrderAsync(vendorOrder, listVendorOrderDetail,
          this.listVendorOrderProcurementRequestMapping, this.listVendorOrderCostDetail);
        this.loading = false;
        if (result.statusCode == 200 || result.statusCode == 202) {
          if (type == true) {
            this.resetForm();
            this.resetTable();
            this.resetSumarySection();
            this.awaitResult = false;
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o ????n h??ng mua th??nh c??ng' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'T???o ????n h??ng mua th??nh c??ng' };
            this.showMessage(msg);
            setTimeout(time => {
              this.router.navigate(['/vendor/detail-order', { vendorOrderId: result.vendorOrderId }]);
            }, 2000);
          }
        } else {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      }
    }
  }

  mapFormtoVendorOrder(): VendorOrderModel {
    let vendorOrderModel: VendorOrderModel = new VendorOrderModel();
    vendorOrderModel.vendorOrderId = this.emptyGuid;
    vendorOrderModel.statusId = this.emptyGuid;
    vendorOrderModel.vendorOrderCode = '';
    let orderDate = this.orderDateControl.value;
    vendorOrderModel.vendorOrderDate = orderDate ? convertToUTCTime(orderDate) : null; // new Date();
    vendorOrderModel.customerOrderId = null;

    //ng?????i order
    let orderer: employeeModel = this.ordererControl.value;
    vendorOrderModel.orderer = orderer ? orderer.employeeId : null;
    vendorOrderModel.description = this.descriptionControl.value;
    vendorOrderModel.note = this.noteControl.value;

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

    //th??ng tin nh???n
    // vendorOrderModel.recipientName = this.recipientNameControl.value;
    // vendorOrderModel.shipperName = this.shipperNameControl.value;
    // vendorOrderModel.locationOfShipment = this.locationOfShipmentControl.value;
    // vendorOrderModel.placeOfDelivery = this.placeOfDeliveryControl.value;
    // vendorOrderModel.recipientPhone = this.recipientPhoneControl.value;
    // vendorOrderModel.recipientEmail = this.recipientEmailControl.value;
    // vendorOrderModel.shippingNote = this.shippingNoteControl.value;

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
  }

  mapOrderDetail(): Array<VendorOrderDetailModel> {
    let selectedVendor: vendorCreateOrderModel = this.vendorControl.value;
    let listVendorOrderDetail: Array<VendorOrderDetailModel> = [];
    this.listVendorOrderDetail.forEach(order => {
      let vendorOrderDetail: VendorOrderDetailModel = new VendorOrderDetailModel();
      vendorOrderDetail.vendorOrderDetailId = this.emptyGuid;
      vendorOrderDetail.vendorId = selectedVendor.vendorId;
      vendorOrderDetail.vendorOrderId = this.emptyGuid;
      vendorOrderDetail.productId = order.productId;
      vendorOrderDetail.quantity = order.quantity;
      vendorOrderDetail.unitPrice = order.unitPrice;
      vendorOrderDetail.currencyUnit = order.currencyUnit;
      vendorOrderDetail.exchangeRate = order.exchangeRate;
      vendorOrderDetail.vat = order.vat;
      vendorOrderDetail.discountType = order.discountType;
      vendorOrderDetail.discountValue = order.discountValue;
      vendorOrderDetail.unitId = order.productUnitId;
      vendorOrderDetail.incurredUnit = order.productId == null ? order.unitName : null;
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
        productAttr.vendorOrderProductDetailProductAttributeValueId = this.emptyGuid
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

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
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
          vendorOrderDetail.warehouseId = order.warehouseId;

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
      style: {
        "min-width": '30%'
      },
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

            //Gi?? nh???p kho cho t???ng s???n ph???m
            item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount + item.cost) / item.quantity, 0);

            //Gi?? tr??? nh???p kho cho t???ng s???n ph???m
            item.priceValueWarehouse = this.roundNumber(item.quantity * item.priceWarehouse, 0);
          });
        }
        //N???u Theo gi?? tr???
        else if (this.selectedCostType == '1') {
          //L???y t???ng th??nh ti???n
          let totalAmount = 0;
          this.listVendorOrderDetail.forEach(item => {
            totalAmount += (item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount);
            item.isEditCost = false;
          });

          //T??nh Chi ph?? mua h??ng, Gi?? nh???p kho, Gi?? tr??? nh???p kho
          this.listVendorOrderDetail.forEach(item => {
            //Chi ph?? mua h??ng cho t???ng s???n ph???m
            item.cost = this.roundNumber(totalCost * (item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount) / totalAmount, 0);

            //Gi?? nh???p kho cho t???ng s???n ph???m
            item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount + item.cost) / item.quantity, 0);

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

        //gi?? nh???p kho:
        this.dataRow.priceWarehouse = this.roundNumber((this.dataRow.quantity * this.dataRow.unitPrice * this.dataRow.exchangeRate - this.dataRow.sumAmountDiscount + this.dataRow.cost) / this.dataRow.quantity, 0);

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
          reaminTotalAmount += (item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount);
        });

        this.listVendorOrderDetail.forEach((item, index) => {
          if (item.isEditCost != true) {
            if (this.selectedCostType == '0') {
              //chi ph?? mua h??ng:
              item.cost = this.roundNumber(remainTotalCost * item.quantity / remainTotalQuantity, 0);

              //gi?? nh???p kho:
              item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount + item.cost) / item.quantity, 0);

              //gi?? tr??? nh???p kho:
              item.priceValueWarehouse = this.roundNumber(item.quantity * item.priceWarehouse, 0);
            } else if (this.selectedCostType == '1') {
              //chi ph?? mua h??ng:
              item.cost = this.roundNumber(remainTotalCost * (item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount) / reaminTotalAmount, 0);

              //gi?? nh???p kho:
              item.priceWarehouse = this.roundNumber((item.quantity * item.unitPrice * item.exchangeRate - item.sumAmountDiscount + item.cost) / item.quantity, 0);

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

  /* M??? popup T???o nhanh nh?? cung c???p */
  openQuickCreVendorModal() {
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

  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 9 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }
}


function checkDuplicateCode(array: Array<any>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } => {
    if (control.value !== null) {
      if (array.indexOf(control.value.toLowerCase()) !== -1 && control.value.toLowerCase() !== "") {
        return { 'duplicateCode': true };
      }
      return null;
    }
  }
}

function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
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


