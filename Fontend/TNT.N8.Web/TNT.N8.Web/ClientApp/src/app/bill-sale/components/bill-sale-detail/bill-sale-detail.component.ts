import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import * as $ from 'jquery';
import { PopupAddEditCostQuoteDialogComponent } from '../../../shared/components/add-edit-cost-quote/add-edit-cost-quote.component';
import { BillSaleService } from '../../services/bill-sale.service';
import { BillSaleDialogComponent } from '../bill-sale-dialog/bill-sale-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { NoteDocumentModel } from '../../../shared/models/note-document.model';
import { NoteModel } from '../../../shared/models/note.model';
import { NoteService } from '../../../shared/services/note.service';
import { ImageUploadService } from '../../../shared/services/imageupload.service';

class BillSale {
  billOfSaLeId: string;
  billOfSaLeCode: string;
  orderId: string;
  billDate: Date;
  endDate: Date;
  statusId: string;
  termsOfPaymentId: string;
  customerId: string;
  customerName: string;
  debtAccountId: string;
  mst: string;
  paymentMethodId: string;
  employeeId: string;
  description: string;
  customerAddress: string;
  note: string;
  accountBankId: string;
  invoiceSymbol: string;
  discountType: boolean;
  discountValue: number;
  listCost: Array<BillSaleCostModel> = [];
  listBillSaleDetail: Array<BillSaleDetailModel> = [];

}

class Category {
  active: boolean;
  categoryCode: string;
  categoryId: string;
  categoryName: string;
  categoryTypeCode: string;
  categoryTypeId: string;
  categoryTypeName: string;
  countCategoryById: number;
  createdById: string;
  createdDate: Date;
  isDefauld: boolean;
  isDefault: boolean;
  isEdit: boolean;
  updatedById: string;
  updatedDate: Date;
}

class Employee {
  employeeCode: string;
  employeeId: string;
  employeeName: string;
}

class Customer {
  customerCode: string;
  customerGroup: string;
  customerGroupId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  fullAddress: string;
  personInCharge: string;
  personInChargeId: string;
  taxCode: string;
  name: string;
  listBankAccount: Array<BankAccountModel>;
}

class Order {
  customerId: string;
  customerName: string;
  orderCode: string;
  orderContractId: string;
  orderId: string;
  orderStatusName: null
  paymentMethod: string;
  placeOfDelivery: string;
  seller: string;
}

interface ResultCostDialog {
  status: boolean,  //Lưu thì true, Hủy là false
  quoteDetailModel: any,
}

class BillSaleCostModel {
  billOfSaleCostId: string;
  billOfSaleId: string;
  orderCostId: string;
  orderId: string;
  costId: string;
  quantity: number;
  unitPrice: number;
  costName: string;
  costCode: string;
  sumAmount: number;
  isInclude: boolean;

  constructor() {
    this.isInclude = true;
  }
}
class BillSaleCost {
  billOfSaleCostId: string;
  billOfSaleId: string;
  orderCostId: string;
  orderId: string;
  costId: string;
  quantity: number;
  unitPrice: number;
  costName: string;
  costCode: string;
  sumAmount: number;
  isInclude: boolean;

  constructor() {
    this.isInclude = true;
  }
}

class BillSaleDetailModel {
  billOfSaleDetailId: string;
  billOfSaleId: string;
  vendorId: string;
  vendorName: string;
  productId: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  currencyUnit: string;
  currencyUnitlabel: string;
  exchangeRate: number;
  warehouseId: string;
  warehouseCode: string;
  moneyForGoods: number;
  accountId: string;
  accountDiscountId: string;
  vat: number;
  discountType: boolean;
  discountValue: number;
  description: string;
  orderDetailType: number;
  unitId: string;
  unitName: string;
  businessInventory: number;
  productName: string;
  actualInventory: number;
  incurredUnit: string;
  costsQuoteType: number;
  orderDetailId: string;
  orderId: string;
  explainStr: string;
  vatValue: number;
  orderNumber: number;
  unitLaborNumber: number;
  unitLaborPrice: number;
  sumUnitLabor: number;
  listBillSaleDetailProductAttribute: Array<BillSaleDetailProductAttributeModel> = [];
}

class BillSaleDetailProductAttributeModel {
  billOfSaleCostProductAttributeId: string;
  orderProductDetailProductAttributeValueId: string;
  orderDetailId: string;
  billOfSaleDetailId: string;
  productId: string;
  productAttributeCategoryId: string;
  productAttributeCategoryValueId: string;
}

class OrderBillModel {
  orderId: string;
  orderCode: string;
  orderDate: Date;
  customerName: string;
  customerCode: string;
  totalOrder: number;
  totalQuantity: number;
  customerId: string;
}
class BankAccountModel {
  bankAccountId: string;
  objectId: string;
  objectType: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  bankDetail: string;
  accountName: string;
  name: string;
}

interface DiscountType {
  name: string;
  code: string;
  value: boolean;
}

interface ResultDialog {
  status: boolean,
  billSaleDetailModel: BillSaleDetailModel,
}

interface FileNameExists {
  oldFileName: string;
  newFileName: string
}

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

@Component({
  selector: 'app-bill-sale-detail',
  templateUrl: './bill-sale-detail.component.html',
  styleUrls: ['./bill-sale-detail.component.css']
})
export class BillSaleDetailComponent implements OnInit {
  billSaleModel: BillSale = new BillSale();
  listBanking: Array<Category> = [];
  listStatus: Array<Category> = [];
  listMoney: Array<Category> = [];
  listEmployee: Array<Employee> = [];
  listCustomer: Array<Customer> = [];
  listOrder: Array<Order> = [];
  listInforOrder: Array<OrderBillModel> = [];
  order: OrderBillModel;
  billSaleDetailModel: BillSaleDetailModel = new BillSaleDetailModel();
  messageConfirm: string = '';
  stepStatus: MenuItem[];
  activeIndex: number = 0;
  listCustomerCommon: Array<Customer> = [];
  listOrderCommon: Array<Order> = [];
  colsDelivery: any[];
  selectedColumnsDelivery: any[];
  customerSelected: Customer = new Customer();
  listBank: Array<BankAccountModel> = [];
  bankSelected: BankAccountModel = null;
  paymentMethd: string = '1';
  actionImport: boolean = true;

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];
  /* End */
  /*Khai báo biến*/
  auth: any = JSON.parse(localStorage.getItem("auth"));
  employeeId: string = JSON.parse(localStorage.getItem('auth')).EmployeeId;
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  awaitResult: boolean = false;
  billSaleId: string = null;
  orderCode: string = null;
  discountValue: string = "0";
  statusBill: Category = new Category();
  exchangeRate: number = 1;
  amountBill: number = 0;
  collectMoney: Date = new Date();
  startDate: Date = null;
  maxEndDate: Date = new Date();
  /* Form */
  createBillForm: FormGroup;
  orderControl: FormControl;
  billDateControl: FormControl;
  endDateControl: FormControl;
  termsOfPaymentControl: FormControl;
  customerControl: FormControl;
  descriptionControl: FormControl;
  noteControl: FormControl;
  customerMSTControl: FormControl;
  customerAddressControl: FormControl;
  paymentMethodControl: FormControl;
  employeeControl: FormControl;
  bankAccountControl: FormControl;
  customerNameControl: FormControl;
  invoiceSymbolControl: FormControl;
  debtAccountControl: FormControl;
  /* End */

  cols: any;
  selectedColumns: any;
  colsCost: any;
  colsOrder: any;
  selectedColumnsCost: any;
  selectedColumnsOrder: any;
  TotalSumAmountCost: number;
  selectedItem: any;
  TotalSumAmountProduct: number;
  TotalSumVatProduct: number;
  CustomerOrderTotalDiscount
  CustomerOrderAmountAfterDiscount: number;
  TotalPriceInitial: number;
  AmountPriceProfit: any;
  discountTypeList: Array<DiscountType> = [
    { "name": "Theo %", "code": "PT", "value": true },
    { "name": "Số tiền", "code": "ST", "value": false }
  ];

  colLeft: number = 8;
  isShow: boolean = true;

  /*NOTE*/
  listNoteDocumentModel: Array<NoteDocumentModel> = [];
  listUpdateNoteDocument: Array<NoteDocument> = [];
  noteHistory: Array<Note> = [];

  noteId: string = null;
  noteContent: string = '';
  isEditNote: boolean = false;
  actionEdit: boolean = true;
  defaultAvatar: string = '/assets/images/no-avatar.png';
  uploadedNoteFiles: any[] = [];
  /*End : Note*/
  moneySelected: Category;
  actionConfirm: boolean = true;

  @ViewChild('fileNoteUpload') fileNoteUpload: FileUpload;
  discountType: DiscountType = { "name": "Theo %", "code": "PT", "value": true };
  minYear: number = 2010;
  currentYear: number = (new Date()).getFullYear();
  displayDialog: boolean = false;
  fixed: boolean = false;
  withFiexd: string = "";
  withFiexdCol: string = "";
  withColCN: number = 0;
  listInventoryDeliveryVoucher: Array<any> = [];
  withCol: number = 0;
  defaultNumberType = this.getDefaultNumberType();
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
      var colT = 0;
      if (this.withColCN != width) {
        colT = this.withColCN - width;
        this.withColCN = width;
        this.withCol = $('#parentTH').width();
      }
      this.withFiexdCol = (this.withCol) + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
      this.withCol = $('#parentTH').width();
      this.withColCN = $('#parent').width();
      this.withFiexdCol = "";
    }
  }

  constructor(
    private translate: TranslateService,
    private billSaleService: BillSaleService,
    private messageService: MessageService,
    private router: Router,
    private noteService: NoteService,
    private route: ActivatedRoute,
    private imageService: ImageUploadService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private getPermission: GetPermission,
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
    this.setTable();
    this.setForm();
    let resource = "sal/bill-sale/detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false; //Thêm sản phẩm dịch vụ, Tạo đơn hàng
      }

      if (listCurrentActionResource.indexOf("edit") == -1) {
        //Sửa báo giá, sửa sản phẩm dịch vụ
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("confirm") == -1) {
        //Sửa báo giá, sửa sản phẩm dịch vụ
        this.actionConfirm = false;
      }
      this.route.params.subscribe(params => { this.billSaleId = params['billSaleId'] });
      // this.setTable();
      // this.setForm();
      this.getMasterData();
    }
  }

  setForm() {
    this.orderControl = new FormControl(null, [Validators.required]); // Số hóa đơn
    this.invoiceSymbolControl = new FormControl(null, [Validators.required, forbiddenSpaceText]); // Kí hiệu hóa đơn
    this.employeeControl = new FormControl(null, [Validators.required]); // Nhân viên bán hàng
    this.endDateControl = new FormControl(null); // Ngày hết hạn
    this.termsOfPaymentControl = new FormControl(null);
    this.billDateControl = new FormControl(new Date(), [Validators.required]); // Ngày hóa đơn
    this.descriptionControl = new FormControl(null);
    this.noteControl = new FormControl(null);
    this.customerControl = new FormControl(null, [Validators.required]);
    this.customerMSTControl = new FormControl(null);
    this.customerAddressControl = new FormControl(null, [Validators.required]);
    this.paymentMethodControl = new FormControl(null, [Validators.required]);
    this.bankAccountControl = new FormControl(null);
    this.debtAccountControl = new FormControl(null); // Tài khoản nợ
    this.customerNameControl = new FormControl(null, [Validators.required, forbiddenSpaceText]);

    this.createBillForm = new FormGroup({
      descriptionControl: this.descriptionControl,
      noteControl: this.noteControl,
      customerControl: this.customerControl,
      customerMSTControl: this.customerMSTControl,
      customerAddressControl: this.customerAddressControl,
      paymentMethodControl: this.paymentMethodControl,
      bankAccountControl: this.bankAccountControl,
      orderControl: this.orderControl,
      invoiceSymbolControl: this.invoiceSymbolControl,
      employeeControl: this.employeeControl,
      endDateControl: this.endDateControl,
      termsOfPaymentControl: this.termsOfPaymentControl,
      billDateControl: this.billDateControl,
      customerNameControl: this.customerNameControl,
      debtAccountControl: this.debtAccountControl
    });
  }

  getMasterData() {
    this.loading = true;
    this.billSaleService.getMasterDataBillSaleCreateEdit(false, this.billSaleId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.billSaleModel = result.billSale;
        this.billSaleModel.discountType = this.billSaleModel.discountType == null ? false : this.billSaleModel.discountType;
        this.discountType = this.discountTypeList.find(x => x.value == this.billSaleModel.discountType);
        this.discountValue = this.billSaleModel.discountValue == null ? "0" : this.billSaleModel.discountValue.toString();
        this.listBanking = result.listBanking;
        this.listStatus = result.listStatus;
        this.listMoney = result.listMoney;
        if (this.billSaleModel == null) {
          this.billSaleModel = new BillSale();
        }
        else {
          if (this.billSaleModel.listCost == null) {
            this.billSaleModel.listCost = [];
          } else {
            this.billSaleModel.listCost = result.billSale.listCost;
            this.billSaleModel.listCost.forEach(item => {
              item.sumAmount = item.quantity * item.unitPrice;
            });
          }
          if (this.billSaleModel.listBillSaleDetail == null) {
            this.billSaleModel.listBillSaleDetail = [];
          } else {
            this.billSaleModel.listBillSaleDetail = result.billSale.listBillSaleDetail;
            this.billSaleModel.listBillSaleDetail.forEach((item, index) => {
              item.orderNumber = item.orderNumber ? item.orderNumber : index + 1;
              if (item.productName == null) {
                item.explainStr = item.description;
              }
              else {
                item.explainStr = item.productName;
              }
              item.currencyUnitlabel = this.listMoney.find(x => x.categoryId == item.currencyUnit) ?.categoryName
            });
          }
        }



        this.listEmployee = result.listEmployee;
        this.listCustomer = result.listCustomer;
        this.listCustomerCommon = result.listCustomer;
        this.listCustomer.forEach(item => {
          let name: string;
          if (item.customerName == null) {
            name = "";
          } else {
            name = item.customerName;
          }
          item.name = item.customerCode + '-' + name;
        });
        this.listOrder = result.listOrder;
        this.order = result.order;
        this.listOrderCommon = result.listOrder;
        this.listInforOrder = [];
        if (this.order == null) {
          this.listInforOrder = [];
        } else {
          this.listInforOrder.push(this.order);
        }
        this.listCustomer.forEach(item => {
          item.listBankAccount.forEach(bank => {
            if (bank.bankName == null) {
              bank.name = " - " + bank.accountName;
            }
            else {
              bank.name = bank.bankName + " - " + bank.accountName;
            }
          });
        });

        this.listInventoryDeliveryVoucher = result.listInventoryDeliveryVoucher;
        this.caculatorBillSale();
        // Set giá trị cho hóa đơn
        let orderTemp = this.listOrder.find(x => x.orderId == this.billSaleModel.orderId);
        this.orderControl.setValue(orderTemp);

        this.invoiceSymbolControl.setValue(this.billSaleModel.invoiceSymbol);
        this.employeeControl.setValue(this.listEmployee.find(x => x.employeeId == this.billSaleModel.employeeId));
        this.endDateControl.setValue(this.billSaleModel.endDate == null ? null : new Date(this.billSaleModel.endDate));
        this.billDateControl.setValue(this.billSaleModel.billDate == null ? null : new Date(this.billSaleModel.billDate));
        this.descriptionControl.setValue(this.billSaleModel.description);
        this.noteControl.setValue(this.billSaleModel.note);
        let customer = this.listCustomer.find(x => x.customerId == this.billSaleModel.customerId);
        this.customerControl.setValue(customer);
        this.customerMSTControl.setValue(this.billSaleModel.mst);
        this.customerAddressControl.setValue(this.billSaleModel.customerAddress);
        this.paymentMethodControl.setValue(this.listBanking.find(x => x.categoryId == this.billSaleModel.paymentMethodId));
        this.bankAccountControl.setValue(customer.listBankAccount.find(x => x.bankAccountId == this.billSaleModel.accountBankId));
        this.customerNameControl.setValue(this.billSaleModel.customerName);
        this.statusBill = this.listStatus.find(x => x.categoryId == this.billSaleModel.statusId);
        // Gán note
        this.noteHistory = result.listNote;
        this.handleNoteContent();
        // Lấy danh sách trạng thái hồ sơ thầu
        this.stepStatus = [
          {
            label: this.listStatus.find(x => x.categoryCode == 'NEW').categoryName
          },
          {
            label: this.listStatus.find(x => x.categoryCode == 'CONFIRM').categoryName
          },
          {
            label: this.listStatus.find(x => x.categoryCode == 'Pay').categoryName
          },
          {
            label: this.listStatus.find(x => x.categoryCode == 'CANC').categoryName
          }
        ];
        this.setStatusActive(this.statusBill.categoryCode);
      }
    });
  }

  showTotalBillSale() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 8 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  setStatusActive(code: string) {
    switch (code) {
      case 'NEW':
        this.activeIndex = 0;
        break;

      case 'CONFIRM':
        this.activeIndex = 1;
        break;

      case 'Pay':
        this.activeIndex = 2;
        break;

      case 'CANC':
        this.activeIndex = 3;
        break;

      default:
        break;

    }
  }

  setTable() {
    this.cols = [
      { field: 'Move', header: '#', width: '50px', textAlign: 'center', color: '#f44336' },
      { field: 'productCode', header: 'Mã sản phẩm/dịch vụ', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'explainStr', header: 'Tên sản phẩm/dịch vụ', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'vendorName', header: 'Nhà cung cấp', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'unitName', header: 'Đơn vị tính', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'warehouseCode', header: 'Mã kho', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'actualInventory', header: 'Tồn kho thực tế', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'businessInventory', header: 'Tồn kho kinh doanh', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'quantity', header: 'Số lượng', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'exchangeRate', header: 'tỷ giá', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'currencyUnitlabel', header: 'Đơn vị tiền', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'unitPrice', header: 'Đơn giá', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'discountValue', header: 'Chiết khấu', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'moneyForGoods', header: 'Tiền hàng', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'vat', header: 'Thuế suất', width: '30px', textAlign: 'right', color: '#f44336' },
      { field: 'vatValue', header: 'Tiền thuế', width: '30px', textAlign: 'right', color: '#f44336' },
      { field: 'account', header: 'Tài khoản doanh thu', width: '30px', textAlign: 'right', color: '#f44336' },
      { field: 'accountDiscount', header: 'Tài khoản chiết khấu', width: '30px', textAlign: 'right', color: '#f44336' },
      { field: 'delete', header: 'Xóa', width: '60px', textAlign: 'center', color: '#f44336' }
    ];
    this.selectedColumns = this.cols;

    this.colsCost = [
      { field: 'costCode', header: 'Mã chi phí', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'costName', header: 'Tên chi phí', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'Số lượng', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'unitPrice', header: 'Đơn giá', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'isInclude', header: 'Bao gồm trong giá bán', width: '195px', textAlign: 'right', color: '#f44336' },
      { field: 'sumAmount', header: 'Thành tiền (VND)', width: '60px', textAlign: 'right', color: '#f44336' },
      { field: 'delete', header: 'Xóa', width: '60px', textAlign: 'center', color: '#f44336' }
    ];
    this.selectedColumnsCost = this.colsCost;

    this.colsOrder = [
      { field: 'orderCode', header: 'Số đơn hàng', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'orderDate', header: 'Ngày đặt hàng', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'customerCode', header: 'Mã khách hàng', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'customerName', header: 'Tên khách hàng', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'totalOrder', header: 'Tổng số tiền trên đơn hàng', width: '60px', textAlign: 'right', color: '#f44336' },
      { field: 'totalQuantity', header: 'Tổng số lượng trên đơn hàng', width: '60px', textAlign: 'right', color: '#f44336' },
    ];
    this.selectedColumnsOrder = this.colsOrder;

    this.colsDelivery = [
      { field: 'inventoryDeliveryVoucherCode', header: 'Mã phiếu nhập', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'inventoryDeliveryVoucherType', header: 'Loại phiếu nhập', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'createdDate', header: 'Ngày lập phiếu', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'inventoryDeliveryVoucherDate', header: 'Ngày xuất kho', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'nameCreate', header: 'Người lập phiếu', width: '50px', textAlign: 'left', color: '#f44336' },
      { field: 'nameStatus', header: 'Trạng thái', width: '50px', textAlign: 'left', color: '#f44336' },
    ];
    this.selectedColumnsDelivery = this.colsDelivery;
  }
  cancel() {
    this.router.navigate(['/bill-sale/list']);
  }

  showDialog() {
    this.displayDialog = true;
    this.moneySelected = this.listMoney.find(x => x.isDefault == true);
    this.customerSelected = this.customerControl.value;
    this.listBank = this.customerSelected.listBankAccount;
    this.exchangeRate = 1;
    this.collectMoney = new Date();
    this.amountBill = 0;
  }


  changeOrder() {
    let id = this.orderControl.value ? this.orderControl.value.orderId : null;
    if (this.orderControl.value) {
      this.listCustomer = this.listCustomerCommon.filter(x => x.customerId == this.orderControl.value.customerId);
      this.customerNameControl.setValue(this.orderControl.value.customerName);
      let employee = this.listEmployee.find(x => x.employeeId == this.orderControl.value.seller);
      this.employeeControl.setValue(employee);
      if (this.listCustomer.length == 1) {
        this.customerControl.setValue(this.listCustomer[0]);
        this.customerAddressControl.setValue(this.customerControl.value.fullAddress);
        this.customerMSTControl.setValue(this.customerControl.value.taxCode);
        let paymentMethod = this.listBanking.find(x => x.categoryId == this.orderControl.value.paymentMethod);
        this.paymentMethodControl.setValue(paymentMethod);
        let bankAccount = this.customerControl.value.listBankAccount.find(x => x.bankAccountId == this.orderControl.value.bankAccountId);
        this.bankAccountControl.setValue(bankAccount);
        this.discountType = this.discountTypeList.find(x => x.value == this.orderControl.value.discountType);
        this.discountValue = this.orderControl.value.discountValue;
      } else {
        this.customerAddressControl.setValue(null);
        this.customerMSTControl.setValue(null);
      }


      this.loading = true;
      this.billSaleService.getOrderByOrderId(id).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.order = result.order;
          this.listInforOrder = [];
          this.billSaleModel.listBillSaleDetail = [];
          this.billSaleModel.listBillSaleDetail = result.listBillSaleDetail;
          this.billSaleModel.listCost = result.listCost;
          this.caculatorBillSale();
          if (this.order == null) {
            this.listInforOrder = [];
          } else {
            this.listInforOrder.push(this.order);
          }
        }
      });
    } else {
      this.resetForm();
    }

  }
  /*Thêm sản phẩm dịch vụ*/
  addCustomerOrderDetail() {
    let customerGroupId = null;
    if (this.customerControl.value) {
      customerGroupId = this.customerControl.value.customerGroupId;
    }
    let orderDate = this.billDateControl.value;
    if (orderDate) {
      orderDate = convertToUTCTime(orderDate);
    } else {
      orderDate = convertToUTCTime(new Date());
    }
    let ref = this.dialogService.open(BillSaleDialogComponent, {
      data: {
        isCreate: true,
        warehouse: null,
        customerGroupId: customerGroupId,
        orderDate: orderDate
      },
      header: 'Thêm sản phẩm dịch vụ',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          let billSaleDetailModel: BillSaleDetailModel = result.billSaleDetailModel;

          billSaleDetailModel.orderNumber = this.billSaleModel.listBillSaleDetail.length + 1;
          billSaleDetailModel.currencyUnitlabel = this.listMoney.find(x => x.categoryId == result.billSaleDetailModel.currencyUnit) ?.categoryName;
          if (billSaleDetailModel.discountType) {
            billSaleDetailModel.vatValue = this.roundNumber((((billSaleDetailModel.quantity * billSaleDetailModel.unitPrice * billSaleDetailModel.exchangeRate) - ((billSaleDetailModel.discountValue * billSaleDetailModel.quantity * billSaleDetailModel.unitPrice * billSaleDetailModel.exchangeRate) / 100)) * (billSaleDetailModel.vat / 100)), parseInt(this.defaultNumberType, 10));
          } else {
            billSaleDetailModel.vatValue = this.roundNumber((((billSaleDetailModel.quantity * billSaleDetailModel.unitPrice * billSaleDetailModel.exchangeRate) - (billSaleDetailModel.discountValue)) * (billSaleDetailModel.vat / 100)), parseInt(this.defaultNumberType, 10));
          }
          billSaleDetailModel.moneyForGoods = parseFloat(result.billSaleDetailModel.moneyForGoods.toString().replace(/,/g, ''));
          this.billSaleModel.listBillSaleDetail.push(billSaleDetailModel)
          this.caculatorBillSale();
          this.restartCustomerOrderDetailModel();
        }
      }
    });

  }

  saveBillSale(isAdd: boolean) {
    if (!this.createBillForm.valid) {
      Object.keys(this.createBillForm.controls).forEach(key => {
        if (this.createBillForm.controls[key].valid == false) {
          this.createBillForm.controls[key].markAsTouched();
        }
      });
      this.isInvalidForm = true;
      this.isOpenNotifiError = true;
    } else {
      this.loading = true;
      this.billSaleModel.description = this.descriptionControl.value;
      this.billSaleModel.note = this.noteControl.value;
      this.billSaleModel.employeeId = this.employeeControl.value ? this.employeeControl.value.employeeId : null;
      let endDate = this.endDateControl.value;
      if (this.endDateControl.value) {
        endDate = convertToUTCTime(endDate);
      }
      this.billSaleModel.endDate = endDate;
      this.billSaleModel.invoiceSymbol = this.invoiceSymbolControl.value;
      this.billSaleModel.mst = this.customerMSTControl.value;
      this.billSaleModel.orderId = this.orderControl.value ? this.orderControl.value.orderId : null;
      this.billSaleModel.paymentMethodId = this.paymentMethodControl.value ? this.paymentMethodControl.value.categoryId : null;
      this.billSaleModel.termsOfPaymentId = this.termsOfPaymentControl.value;
      this.billSaleModel.accountBankId = this.bankAccountControl.value ? this.bankAccountControl.value.bankAccountId : null;
      let billDate = this.billDateControl.value;
      if (this.billDateControl.value) {
        billDate = convertToUTCTime(billDate);
      }
      this.billSaleModel.billDate = billDate;
      this.billSaleModel.customerAddress = this.customerAddressControl.value;
      this.billSaleModel.customerId = this.customerControl.value ? this.customerControl.value.customerId : null;
      this.billSaleModel.customerName = this.customerNameControl.value;
      this.billSaleModel.debtAccountId = this.debtAccountControl.value ? this.debtAccountControl.value.employeeId : null;
      this.billSaleModel.orderId = this.orderControl.value.orderId;
      this.billSaleModel.discountValue = parseFloat(this.discountValue.replace(/,/g, ''));
      this.billSaleModel.discountType = this.discountType.value;
      this.billSaleService.addOrEditBillSale(false, this.billSaleModel).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          let msg = { severity: 'success', summary: 'Thông báo', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  updateStatusBillSale(type: number) {
    let statusUpdate: Category = null;
    if (type == 1) {
      statusUpdate = this.listStatus.find(x => x.categoryCode == "CANC");
    }

    if (type == 2) {
      statusUpdate = this.listStatus.find(x => x.categoryCode == "NEW");
    }

    if (type == 3) {
      statusUpdate = this.listStatus.find(x => x.categoryCode == "CONFIRM");
    }

    if (statusUpdate != null && statusUpdate != undefined) {
      this.loading = true;
      this.billSaleService.updateStatus(this.billSaleModel.billOfSaLeId, statusUpdate.categoryId, null).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          let msg = { severity: 'success', summary: 'Thông báo', detail: result.messageCode };
          this.showMessage(msg);
          if (type == 1) {
            this.activeIndex = 3;
          }

          if (type == 2) {
            this.activeIndex = 0;
          }

          if (type == 3) {
            this.activeIndex = 1;
          }
          this.statusBill = statusUpdate;
          let note: Note = result.note;
          this.noteHistory.push(note);
          this.handleNoteContent();
        } else {
          let msg = { severity: 'error', summary: 'Thông báo', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }

  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  changeCustomer() {
    if (this.customerControl.value) {
      this.customerNameControl.setValue(this.customerControl.value.customerName);
      this.customerAddressControl.setValue(this.customerControl.value.fullAddress);
      this.customerMSTControl.setValue(this.customerControl.value.taxCode);
      this.listOrder = this.listOrderCommon.filter(x => x.customerId == this.customerControl.value.customerId);
      if (this.listOrder.length == 1) {
        this.orderControl.setValue(this.listOrder[0]);
        let employee = this.listEmployee.find(x => x.employeeId == this.listOrder[0].seller);
        this.employeeControl.setValue(employee);
        this.customerNameControl.setValue(this.listOrder[0].customerName);
        let paymentMethod = this.listBanking.find(x => x.categoryId == this.orderControl.value.paymentMethod);
        this.paymentMethodControl.setValue(paymentMethod);
        let bankAccount = this.customerControl.value.listBankAccount.find(x => x.bankAccountId == this.orderControl.value.bankAccountId);
        this.bankAccountControl.setValue(bankAccount);
        this.discountType = this.discountTypeList.find(x => x.value == this.orderControl.value.discountType);
        this.discountValue = this.orderControl.value.discountValue;

        this.loading = true;
        this.billSaleService.getOrderByOrderId(this.orderControl.value.orderId).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.order = result.order;
            this.listInforOrder = [];
            this.billSaleModel.listBillSaleDetail = [];
            this.billSaleModel.listBillSaleDetail = result.listBillSaleDetail;
            this.billSaleModel.listCost = result.listCost;
            this.caculatorBillSale();

            if (this.order == null) {
              this.listInforOrder = [];
            } else {
              this.listInforOrder.push(this.order);
            }
          }
        });
      } else {
        this.paymentMethodControl.setValue(null);
        this.bankAccountControl.setValue(null);
        this.discountType = this.discountTypeList.find(x => x.value == true);
        this.discountValue = '0';
        this.listInventoryDeliveryVoucher = [];
        this.listInforOrder = [];
        this.billSaleModel.listBillSaleDetail = [];
        this.employeeControl.setValue(null);
        this.caculatorBillSale();
      }
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.listOrder = this.listOrderCommon.filter(x => x != null);
    this.listCustomer = this.listCustomerCommon.filter(x => x != null);
    this.customerControl.setValue(null);
    this.customerNameControl.setValue(null);
    this.customerAddressControl.setValue(null);
    this.customerMSTControl.setValue(null);
    this.paymentMethodControl.setValue(null);
    this.bankAccountControl.setValue(null);
    this.discountType = this.discountTypeList.find(x => x.value == true);
    this.discountValue = '0';
    this.listInventoryDeliveryVoucher = [];
    this.listInforOrder = [];
    this.employeeControl.setValue(null);
    this.billSaleModel.listBillSaleDetail = [];
  }

  addCostQuote() {
    let ref = this.dialogService.open(PopupAddEditCostQuoteDialogComponent, {
      data: {
        isCreate: true
      },
      header: 'Thêm chi phí',
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
          let cost = new BillSaleCostModel();
          cost.costId = result.quoteDetailModel.costId;
          cost.costName = result.quoteDetailModel.costName;
          cost.quantity = result.quoteDetailModel.quantity;
          cost.unitPrice = result.quoteDetailModel.unitPrice;
          cost.costCode = result.quoteDetailModel.costCode;
          cost.isInclude = result.quoteDetailModel.isInclude;
          cost.sumAmount = result.quoteDetailModel.sumAmount;
          this.billSaleModel.listCost.push(cost);
          this.caculatorBillSale();
        }
      }
    });
  }

  onRowCostSelect(dataRow) {
    //Nếu có quyền sửa thì mới cho sửa
    let isEdit = this.statusBill.categoryCode == "NEW" && this.actionEdit;
    var index = this.billSaleModel.listCost.indexOf(dataRow);
    let cost = this.billSaleModel.listCost[index];
    var OldArray: BillSaleCost = new BillSaleCost();
    OldArray.billOfSaleCostId = cost.billOfSaleCostId;
    OldArray.billOfSaleId = cost.billOfSaleId;
    OldArray.costCode = cost.costCode;
    OldArray.costId = cost.costId;
    OldArray.costName = cost.costName;
    OldArray.orderCostId = cost.orderCostId;
    OldArray.orderId = cost.orderId;
    OldArray.quantity = cost.quantity;
    OldArray.sumAmount = cost.sumAmount;
    OldArray.unitPrice = cost.unitPrice;
    OldArray.isInclude = cost.isInclude;
    let titlePopup = 'Sửa chi phí';

    let ref = this.dialogService.open(PopupAddEditCostQuoteDialogComponent, {
      data: {
        isCreate: false,
        quoteDetailModel: OldArray,
        isEdit: isEdit
      },
      header: titlePopup,
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
          this.billSaleModel.listCost.splice(index, 1);
          cost.costCode = result.quoteDetailModel.costCode;
          cost.costId = result.quoteDetailModel.costId;
          cost.costName = result.quoteDetailModel.costName;
          cost.quantity = result.quoteDetailModel.quantity;
          cost.sumAmount = result.quoteDetailModel.sumAmount;
          cost.unitPrice = result.quoteDetailModel.unitPrice;
          cost.isInclude = result.quoteDetailModel.isInclude;

          this.billSaleModel.listCost.push(cost);

          // /*Tính lại tổng tiền của đơn hàng*/

          this.caculatorBillSale();
          this.restartCustomerOrderDetailModel();
        }
      }
    });
  }

  // caculatorCost() {
  //   this.TotalSumAmountCost = 0;
  //   let notIncludeCost = 0;
  //   this.billSaleModel.listCost.forEach(item => {
  //     this.TotalSumAmountCost = this.TotalSumAmountCost + item.sumAmount;
  //     if(!item.isInclude){
  //       notIncludeCost += item.sumAmount;
  //     }
  //   });
  //   if (this.discountType.value) {
  //     this.CustomerOrderTotalDiscount = (this.TotalSumAmountProduct + this.TotalSumVatProduct + notIncludeCost) * parseFloat(this.discountValue.replace(/,/g, '')) / 100;
  //   } else {
  //     this.CustomerOrderTotalDiscount = this.discountValue.replace(/,/g, '');
  //   }
  //   this.CustomerOrderAmountAfterDiscount = this.TotalSumAmountProduct + this.TotalSumVatProduct + this.TotalSumAmountCost - this.CustomerOrderTotalDiscount;
  // }

  // caculatorQuote() {
  //   /*Tính lại tổng tiền của đơn hàng*/
  //   this.CustomerOrderTotalDiscount = 0
  //   this.TotalSumVatProduct = 0;
  //   this.TotalSumAmountProduct = 0
  //   this.CustomerOrderAmountAfterDiscount = 0;

  //   this.billSaleModel.listBillSaleDetail.forEach(item => {
  //     let discount = 0;
  //     let price = item.quantity * item.unitPrice * item.exchangeRate;
  //     let unitLabor = item.unitLaborNumber * item.unitLaborPrice * item.exchangeRate;

  //     if (item.discountType) {
  //       discount = ((price + unitLabor) * item.discountValue) / 100;
  //     }
  //     else {
  //       discount = item.discountValue;
  //     }
  //     item.vatValue = ((price + unitLabor - discount) * item.vat) / 100;

  //     this.TotalSumAmountProduct = this.TotalSumAmountProduct + price + unitLabor - discount;
  //     this.TotalSumVatProduct = this.TotalSumVatProduct + (((price + unitLabor - discount) * item.vat) / 100);
  //   });

  //   if (this.discountType.value) {
  //     this.CustomerOrderTotalDiscount = this.TotalSumAmountProduct * parseFloat(this.discountValue.replace(/,/g, '')) / 100;
  //   } else {
  //     this.CustomerOrderTotalDiscount = this.discountValue;
  //   }

  //   this.CustomerOrderAmountAfterDiscount = this.TotalSumAmountProduct + this.TotalSumVatProduct + this.TotalSumAmountCost - this.CustomerOrderTotalDiscount;
  // }

  caculatorBillSale() {
    /*Tính lại tổng tiền của hóa đơn*/
    this.CustomerOrderTotalDiscount = 0
    this.TotalSumVatProduct = 0;
    this.TotalSumAmountProduct = 0
    this.CustomerOrderAmountAfterDiscount = 0;
    this.TotalSumAmountCost = 0;
    let notIncludeCost = 0;


    this.billSaleModel.listCost.forEach(item => {
      item.sumAmount = item.quantity * item.unitPrice;
      if (!item.isInclude) {
        notIncludeCost += item.sumAmount;
      }
      this.TotalSumAmountCost = this.TotalSumAmountCost + item.sumAmount;
    });

    this.billSaleModel.listBillSaleDetail.forEach(item => {
      let discount = 0;

      let price = item.quantity * item.unitPrice * item.exchangeRate;

      let unitLabor = item.unitLaborNumber * item.unitLaborPrice * item.exchangeRate;

      if (item.discountType) {
        discount = (price + unitLabor) * item.discountValue / 100;
      }
      else {
        discount = item.discountValue;
      }

      item.vatValue = (price + unitLabor - discount) * item.vat / 100;

      this.TotalSumAmountProduct += price + unitLabor - discount;
      this.TotalSumVatProduct += (price + unitLabor - discount) * item.vat / 100;
    });

    if (this.discountType.value) {
      this.CustomerOrderTotalDiscount = (this.TotalSumAmountProduct + this.TotalSumVatProduct + notIncludeCost) * parseFloat(this.discountValue.replace(/,/g, '')) / 100;
    } else {
      this.CustomerOrderTotalDiscount = parseFloat(this.discountValue.replace(/,/g, ''));;
    }

    this.CustomerOrderAmountAfterDiscount = this.TotalSumAmountProduct + this.TotalSumVatProduct + notIncludeCost - this.CustomerOrderTotalDiscount;
  }

  changeDiscountValue() {
    let discountValue = 0;
    if (this.discountValue.trim() == '') {
      discountValue = 0;
      this.discountValue = '0';
    } else {
      discountValue = parseFloat(this.discountValue.replace(/,/g, ''));
    }

    let discountType = this.discountType;
    let codeDiscountType = discountType.code;
    //Nếu loại chiết khấu là theo % thì giá trị discountValue không được lớn hơn 100%
    if (codeDiscountType == "PT") {
      if (discountValue > 100) {
        discountValue = 100;
        this.discountValue = '100';
      }
    }
    else {
      if (discountValue > this.TotalSumAmountProduct) {
        discountValue = this.TotalSumAmountProduct;
        this.discountValue = this.TotalSumAmountProduct.toString();
      }
    }

    /*Tính lại tổng tiền của đơn hàng*/
    this.caculatorBillSale();
  }

  changeDiscountType(value) {
    this.discountValue = '0';
    this.caculatorBillSale();
  }
  restartCustomerOrderDetailModel() {
    var item: BillSaleDetailModel = {
      billOfSaleDetailId: this.emptyGuid,
      billOfSaleId: this.emptyGuid,
      vendorId: this.emptyGuid,
      vendorName: null,
      productId: this.emptyGuid,
      productCode: null,
      quantity: 0,
      unitPrice: 0,
      currencyUnit: null,
      currencyUnitlabel: null,
      exchangeRate: 0,
      warehouseId: this.emptyGuid,
      warehouseCode: null,
      moneyForGoods: 0,
      accountId: this.emptyGuid,
      accountDiscountId: this.emptyGuid,
      vat: 0,
      discountType: false,
      discountValue: 0,
      description: null,
      orderDetailType: 0,
      unitId: this.emptyGuid,
      unitName: null,
      businessInventory: 0,
      productName: null,
      actualInventory: 0,
      incurredUnit: null,
      costsQuoteType: 0,
      orderDetailId: this.emptyGuid,
      explainStr: null,
      orderId: this.emptyGuid,
      vatValue: 0,
      orderNumber: 0,
      unitLaborNumber: 0,
      unitLaborPrice: 0,
      sumUnitLabor: 0,
      listBillSaleDetailProductAttribute: [],
    };

    this.billSaleDetailModel = item;
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case 0: {
        result = result;
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

  /*Sửa một sản phẩm dịch vụ*/
  onRowSelect(dataRow) {
    var index = this.billSaleModel.listBillSaleDetail.indexOf(dataRow);
    var OldArray = this.billSaleModel.listBillSaleDetail[index];
    let customerGroupId = null;
    if (this.customerControl.value) {
      customerGroupId = this.customerControl.value.customerGroupId;
    }
    let orderDate = this.billDateControl.value;
    if (orderDate) {
      orderDate = convertToUTCTime(orderDate);
    } else {
      orderDate = convertToUTCTime(new Date());
    }
    let isEdit = this.statusBill.categoryCode == "NEW" && this.actionEdit;

    let ref = this.dialogService.open(BillSaleDialogComponent, {
      data: {
        isCreate: false,
        billSaleDetailModel: OldArray,
        warehouse: null,
        customerGroupId: customerGroupId,
        isEdit: isEdit,
        orderDate: orderDate
      },
      header: 'Sửa sản phẩm dịch vụ',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          this.billSaleModel.listBillSaleDetail.splice(index, 1);
          this.billSaleModel.listBillSaleDetail.push(result.billSaleDetailModel);
          this.billSaleModel.listBillSaleDetail.forEach(item => {
            item.currencyUnitlabel = this.listMoney.find(x => x.categoryId == item.currencyUnit) ?.categoryName;
          })

          this.caculatorBillSale();
          this.restartCustomerOrderDetailModel();
        }
      }
    });
  }

  /*Xóa một sản phẩm dịch vụ*/
  deleteItem(dataRow, event: Event) {
    this.translate.get('order.messages_confirm.delete_confirm').subscribe(value => { this.messageConfirm = value; });
    this.confirmationService.confirm({
      message: this.messageConfirm,
      accept: () => {
        this.billSaleModel.listBillSaleDetail = this.billSaleModel.listBillSaleDetail.filter(x => x != dataRow);

        //Đánh lại số OrderNumber
        this.billSaleModel.listBillSaleDetail.forEach((item, index) => {
          item.orderNumber = index + 1;
        });
        this.caculatorBillSale();
      }
    });
  }

  /*Xóa một sản phẩm dịch vụ*/
  deleteCostItem(dataRow) {
    this.translate.get('order.messages_confirm.delete_confirm').subscribe(value => { this.messageConfirm = value; });
    this.confirmationService.confirm({
      message: this.messageConfirm,
      accept: () => {
        this.billSaleModel.listCost = this.billSaleModel.listCost.filter(x => x != dataRow);
        this.caculatorBillSale();
      }
    });
  }

  // Event thay đổi nội dung ghi chú
  currentTextChange: string = '';
  changeNoteContent(event) {
    let htmlValue = event.htmlValue;
    this.currentTextChange = event.textValue;
  }

  cancelNote() {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn hủy ghi chú này?',
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

  /*Lưu file và ghi chú vào Db*/
  async saveNote() {
    this.loading = true;
    this.listNoteDocumentModel = [];

    /*Upload file mới nếu có*/
    if (this.uploadedNoteFiles.length > 0) {
      let listFileNameExists: Array<FileNameExists> = [];
      let result: any = await this.imageService.uploadFileForOptionAsync(this.uploadedNoteFiles, 'BILL');

      listFileNameExists = result.listFileNameExists;

      for (var x = 0; x < this.uploadedNoteFiles.length; ++x) {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = this.uploadedNoteFiles[x].name;
        let fileExists = listFileNameExists.find(f => f.oldFileName == this.uploadedNoteFiles[x].name);
        if (fileExists) {
          noteDocument.DocumentName = fileExists.newFileName;
        }
        noteDocument.DocumentSize = this.uploadedNoteFiles[x].size.toString();
        this.listNoteDocumentModel.push(noteDocument);
      }
    }
    let noteModel = new NoteModel();
    if (!this.noteId) {
      /*Tạo mới ghi chú*/
      noteModel.NoteId = this.emptyGuid;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.billSaleModel.billOfSaLeId;
      noteModel.ObjectType = 'BILL';
      noteModel.NoteTitle = 'đã thêm ghi chú';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();
    } else {
      /*Update ghi chú*/
      noteModel.NoteId = this.noteId;
      noteModel.Description = this.noteContent != null ? this.noteContent.trim() : "";
      noteModel.Type = 'ADD';
      noteModel.ObjectId = this.billSaleModel.billOfSaLeId;
      noteModel.ObjectType = 'BILL';
      noteModel.NoteTitle = 'đã thêm ghi chú';
      noteModel.Active = true;
      noteModel.CreatedById = this.emptyGuid;
      noteModel.CreatedDate = new Date();

      //Thêm file cũ đã lưu nếu có
      this.listUpdateNoteDocument.forEach(item => {
        let noteDocument = new NoteDocumentModel();
        noteDocument.DocumentName = item.documentName;
        noteDocument.DocumentSize = item.documentSize;
        noteDocument.UpdatedById = item.updatedById;
        noteDocument.UpdatedDate = item.updatedDate;

        this.listNoteDocumentModel.push(noteDocument);
      });
    }
    if (noteModel.Description == "" && this.listNoteDocumentModel.length == 0) {

      this.loading = false;
      return;
    }

    this.noteService.createNoteForBillSaleDetail(noteModel, this.listNoteDocumentModel).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedNoteFiles = [];
        if (this.fileNoteUpload) {
          this.fileNoteUpload.clear();  //Xóa toàn bộ file trong control
        }
        this.noteContent = null;
        this.listUpdateNoteDocument = [];
        this.noteId = null;
        this.isEditNote = false;

        /*Reshow Time Line*/
        this.noteHistory = result.listNote;
        this.handleNoteContent();
        let messageCode = "Thêm ghi chú thành công";
        let mgs = { severity: 'success', summary: 'Thông báo:', detail: messageCode };
        this.showMessage(mgs);
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*Xử lý và hiển thị lại nội dung ghi chú*/
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

  /*Event Mở rộng/Thu gọn nội dung của ghi chú*/
  toggle_note_label: string = 'Mở rộng';
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
      this.toggle_note_label = 'Thu gọn';
      curr.removeClass('pi-chevron-right');
      curr.addClass('pi-chevron-down');
    } else {
      this.toggle_note_label = 'Mở rộng';
      curr.removeClass('pi-chevron-down');
      curr.addClass('pi-chevron-right');
    }
  }
  /*End */

  /*Kiểm tra noteText > 250 ký tự hoặc noteDocument > 3 thì ẩn đi một phần nội dung*/
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
    }, error => { });
  }

  /*Event Sửa ghi chú*/
  onClickEditNote(noteId: string, noteDes: string) {
    this.noteContent = noteDes;
    this.noteId = noteId;
    this.listUpdateNoteDocument = this.noteHistory.find(x => x.noteId == this.noteId).noteDocList;
    this.isEditNote = true;
  }
  /*End*/

  /*Event Xóa ghi chú*/
  onClickDeleteNote(noteId: string) {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa ghi chú này?',
      accept: () => {
        this.loading = true;
        this.noteService.disableNote(noteId).subscribe(response => {
          let result: any = response;
          this.loading = false;

          if (result.statusCode == 200) {
            let note = this.noteHistory.find(x => x.noteId == noteId);
            let index = this.noteHistory.lastIndexOf(note);
            this.noteHistory.splice(index, 1);

            let msg = { severity: 'success', summary: 'Thông báo:', detail: 'Xóa ghi chú thành công' };
            this.showMessage(msg);
          } else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }
  /*End*/

  /* Event thêm file dược chọn vào list file note */
  handleNoteFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= 10000000) {
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

  /*Event khi click xóa từng file */
  removeNoteFile(event) {
    let index = this.uploadedNoteFiles.indexOf(event.file);
    this.uploadedNoteFiles.splice(index, 1);
  }

  /*Event khi click xóa toàn bộ file */
  clearAllNoteFile() {
    this.uploadedNoteFiles = [];
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  /* Chuyển item lên một cấp */
  moveUp(data: BillSaleDetailModel) {
    let currentOrderNumber = data.orderNumber;
    let preOrderNumber = currentOrderNumber - 1;
    let pre_data = this.billSaleModel.listBillSaleDetail.find(x => x.orderNumber == preOrderNumber);

    //Đổi số OrderNumber của 2 item
    pre_data.orderNumber = currentOrderNumber;
    data.orderNumber = preOrderNumber;

    //Xóa 2 item
    this.billSaleModel.listBillSaleDetail = this.billSaleModel.listBillSaleDetail.filter(x =>
      x.orderNumber != preOrderNumber && x.orderNumber != currentOrderNumber);

    //Thêm lại item trước với số OrderNumber đã thay đổi
    this.billSaleModel.listBillSaleDetail = [...this.billSaleModel.listBillSaleDetail, pre_data, data];

    //Sắp xếp lại danh sách sản phẩm/dịch vụ theo số OrderNumber
    this.billSaleModel.listBillSaleDetail.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }

  /* Chuyển item xuống một cấp */
  moveDown(data: BillSaleDetailModel) {
    let currentOrderNumber = data.orderNumber;
    let nextOrderNumber = currentOrderNumber + 1;
    let next_data = this.billSaleModel.listBillSaleDetail.find(x => x.orderNumber == nextOrderNumber);

    //Đổi số OrderNumber của 2 item
    next_data.orderNumber = currentOrderNumber;
    data.orderNumber = nextOrderNumber;

    //Xóa 2 item
    this.billSaleModel.listBillSaleDetail = this.billSaleModel.listBillSaleDetail.filter(x =>
      x.orderNumber != nextOrderNumber && x.orderNumber != currentOrderNumber);

    //Thêm lại item trước với số OrderNumber đã thay đổi
    this.billSaleModel.listBillSaleDetail = [...this.billSaleModel.listBillSaleDetail, next_data, data];

    //Sắp xếp lại danh sách sản phẩm/dịch vụ theo số OrderNumber
    this.billSaleModel.listBillSaleDetail.sort((a, b) =>
      (a.orderNumber > b.orderNumber) ? 1 : ((b.orderNumber > a.orderNumber) ? -1 : 0));
  }
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