import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { VendorService } from '../../services/vendor.service';

import { VendorOrderDetailModel } from '../../models/vendorOrderDetail.model';
import { VendorOrderProductDetailProductAttributeValueModel } from '../../models/vendorOrderProductDetailProductAttributeValue.model';

import { QuickCreateProductComponent } from '../../../shared/components/quick-create-product/quick-create-product.component';
import { CustomerOrderService } from '../../../order/services/customer-order.service';
import { ifStmt } from '@angular/compiler/src/output/output_ast';

interface ConfigDialogOrderDetail {
  isCreate: boolean;
  vendor: vendorCreateOrderModel;
  vendorOrderDetail: VendorOrderDetailModel;
  isProcurementRequestItem: boolean;
  quantityApproval: number;
  isEdit: boolean;
}

class vendorCreateOrderModel {
  fullAddressVendor: string;
  paymentId: string;
  vendorEmail: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
}

interface ResultDialog {
  status: boolean,
  vendorOrderDetail: VendorOrderDetailModel
}

class DiscountType {
  name: string;
  code: string;
  value: boolean;
}

class productModel {
  productId: string;
  productCode: string;
  productName: string;
  productCodeName: string;
  productUnitId: string;
  productUnitName: string;
  productMoneyUnitId: string;
  price1: number;
  folowInventory: boolean;
  listProductAttributeCategory: Array<productAttributeCategory>;
  fixedPrice: number;
  minimumInventoryQuantity: number;

  constructor() {
    this.folowInventory = false;
    this.listProductAttributeCategory = [];
  }
}

class productAttributeCategory {
  productAttributeCategoryId: string;
  productAttributeCategoryName: string;
  productAttributeCategoryValue: Array<productAttributeCategoryValueModel>;
  selectedProductAttributeCategory: productAttributeCategoryValueModel;
  constructor() {
    this.productAttributeCategoryValue = [];
  }
}

class productAttributeCategoryValueModel {
  productAttributeCategoryValueId: string;
  productAttributeCategoryValue1: string;
}

class moneyUnit {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isDefault: boolean;
}

class warehouseModel {
  public warehouseId: string;
  public warehouseName: string;
  public warehouseCode: string;
  public warehouseParent: string;
  public warehouseNameByLevel: string;
  public listWarehouseNameByLevel: Array<string>;//th??m m???i label theo ph??n c???p
  constructor() {
    this.listWarehouseNameByLevel = [];
  }
}

@Component({
  selector: 'app-add-vendor-order-product',
  templateUrl: './add-vendor-order-product.component.html',
  styleUrls: ['./add-vendor-order-product.component.css'],
  providers: [ConfirmationService, MessageService, DialogService]
})
export class AddVendorOrderProductComponent implements OnInit {
  auth: any = JSON.parse(localStorage.getItem("auth"));
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();  //S??? ch??? s??? th???p ph??n sau d???u ph???y
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  loading: boolean = false;
  /* routing varriable */
  configData: ConfigDialogOrderDetail;
  /* master data */
  listUnitMoney: Array<moneyUnit> = [];
  listProduct: Array<productModel> = [];
  /*C??c bi???n ??i???u ki???n*/
  isCreate: boolean = true; //true: T???o m???i s???n ph???m d???ch v???(ho???c chi ph?? ph??t sinh), false: S???a s???n ph???m d???ch v???(ho???c chi ph?? ph??t sinh)
  selectedOrderDetailType: number = 0;  //0: S???n ph???m d???ch v???, 1: Chi ph?? ph??t sinh
  isShowRadioProduct: boolean = true;
  isShowRadioOC: boolean = true;
  /*End*/
  /*C??c bi???n nh???n gi?? tr??? tr??? v???*/
  unitMoneyLabel: string = 'VND';
  unitMoneyOCLabel: string = 'VND';
  listAttrProduct: Array<productAttributeCategory> = [];

  // listProduct: Array<Product> = [];
  amountProduct: number = 0;  //amountProduct = quantityProduct * priceProduct (s???n ph???m d???ch v???)
  amountVatProduct: number = 0; //ti???n thu??? GTGT (s???n ph???m d???ch v???)
  amountDiscountProduct: number = 0; //ti???n chi???t kh???u (s???n ph???m d???ch v???)
  amountOC: number = 0;
  amountVatOC: number = 0;
  amountDiscountOC: number = 0;
  discountTypeList: Array<DiscountType> = [
    { "name": "Theo %", "code": "PT", "value": true },
    { "name": "S??? ti???n", "code": "ST", "value": false }
  ];
  cols: any[];
  // customerOrderDetailModel = new CustomerOrderDetail();
  // guaranteeDatetime: Date = null;
  /*End*/

  /*Form s???n ph???m d???ch v???*/
  productForm: FormGroup;
  vendorControl: FormControl;
  productControl: FormControl;
  unitProductControl: FormControl;
  quantityProductControl: FormControl;
  priceProductControl: FormControl;
  unitMoneyProductControl: FormControl;
  exchangeRateProductControl: FormControl;
  vatProductControl: FormControl;
  discountTypeProductControl: FormControl;
  discountValueProductControl: FormControl;
  warehouseControl: FormControl;
  /*End*/

  /*Form chi ph?? kh??c*/
  otherCostsForm: FormGroup; //otherCosts s??? k?? hi???u t???t l?? OC v?? ??c th??m v??o h???u t??? c???a control
  descriptionOCControl: FormControl;
  unitOCControl: FormControl;
  quantityOCControl: FormControl;
  priceOCControl: FormControl;
  unitMoneyOCControl: FormControl;
  exchangeRateOCControl: FormControl;
  vatOCControl: FormControl;
  discountTypeOCControl: FormControl;
  discountValueOCControl: FormControl;
  /*End*/

  /*KHO*/
  listWarehouse: Array<warehouseModel> = [];
  warehouse: any = null;
  listWarehouseLevel0: Array<warehouseModel> = []; //danh s??ch kho cha
  listWarehouseInventory: Array<warehouseModel> = [];
  isShowInventory: boolean = false;
  inventoryNumber: number = 0;


  //s???n ph???m b??n n??o: B??n b??n h??ng hay b??n mua h??ng
  loaiSanPham = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private vendorService: VendorService,
    public dialogService: DialogService,
    private customerOrderService: CustomerOrderService,
  ) {
    if (this.config) {
      this.configData = this.config.data;
      this.loaiSanPham = this.config.data.type;
    }
  }

  ngOnInit() {
    this.setForm();
    this.setTable();
    this.getMasterdata();
  }

  setForm() {
    /*Form S???n ph???m d???ch v???*/

    //N???u s???n ph???m t??? Phi???u ????? xu???t
    if (this.configData.isProcurementRequestItem) {
      this.productControl = new FormControl({ value: null, disabled: true }, [Validators.required]);
      this.quantityProductControl = new FormControl('1', [compareWhitZeroValidator(), Validators.max(this.configData.quantityApproval)]);
    }
    //N???u s???n ph???m kh??ng t??? Phi???u ????? xu???t
    else {
      this.productControl = new FormControl(null, [Validators.required]);
      this.quantityProductControl = new FormControl('1', [compareWhitZeroValidator()]);
    }

    this.unitProductControl = new FormControl({ value: '', disabled: true });
    // this.vendorControl = new FormControl(null, [Validators.required]);
    this.priceProductControl = new FormControl('0');
    this.unitMoneyProductControl = new FormControl(null);
    this.exchangeRateProductControl = new FormControl('1');
    this.vatProductControl = new FormControl('0');
    this.discountTypeProductControl = new FormControl(null);
    this.discountValueProductControl = new FormControl('0');
    this.warehouseControl = new FormControl(null);

    this.productForm = new FormGroup({
      productControl: this.productControl,
      unitProductControl: this.unitProductControl,
      // vendorControl: this.vendorControl,
      quantityProductControl: this.quantityProductControl,
      priceProductControl: this.priceProductControl,
      unitMoneyProductControl: this.unitMoneyProductControl,
      exchangeRateProductControl: this.exchangeRateProductControl,
      vatProductControl: this.vatProductControl,
      discountTypeProductControl: this.discountTypeProductControl,
      discountValueProductControl: this.discountValueProductControl,
      warehouseControl: this.warehouseControl
    });
    /*End*/

    /*Form Chi ph?? kh??c*/
    this.descriptionOCControl = new FormControl('', [Validators.required, forbiddenSpaceText]);
    this.unitOCControl = new FormControl('', [Validators.required, Validators.maxLength(50), forbiddenSpaceText]);
    this.quantityOCControl = new FormControl('1', [compareWhitZeroValidator()]);
    this.priceOCControl = new FormControl('0');
    this.unitMoneyOCControl = new FormControl(null);
    this.exchangeRateOCControl = new FormControl('1');
    this.vatOCControl = new FormControl('0');
    this.discountTypeOCControl = new FormControl(null);
    this.discountValueOCControl = new FormControl('0');

    this.otherCostsForm = new FormGroup({
      descriptionOCControl: this.descriptionOCControl,
      unitOCControl: this.unitOCControl,
      quantityOCControl: this.quantityOCControl,
      priceOCControl: this.priceOCControl,
      unitMoneyOCControl: this.unitMoneyOCControl,
      exchangeRateOCControl: this.exchangeRateOCControl,
      vatOCControl: this.vatOCControl,
      discountTypeOCControl: this.discountTypeOCControl,
      discountValueOCControl: this.discountValueOCControl
    });
    /*End*/
  }

  setTable() {
    this.cols = [
      { field: 'productAttributeCategoryName', header: 'T??n thu???c t??nh', width: '50%', textAlign: 'left', color: '#f44336' },
      { field: 'selectedProductAttributeCategory', header: 'Gi?? tr???', width: '50%', textAlign: 'left', color: '#f44336' },
    ];
  }

  async getMasterdata() {
    this.loading = true;
    let vendorId = this.configData.vendor != null ? this.configData.vendor.vendorId : this.emptyGuid;
    let result: any = await this.vendorService.getDataAddVendorOrderDetail(vendorId, this.auth.UserId);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listUnitMoney = result.listMoneyUnit;
      this.listProduct = result.listProductByVendorId;

      this.listWarehouse = result.listWarehouse;
      this.listWarehouseLevel0 = this.listWarehouse.filter(e => e.warehouseParent == null); //l???y kho n??t 0

      this.listProduct.forEach(item => {
        item.productCodeName = item.productCode + ' - ' + item.productName;
      });

      this.setDefaultValueForm();
    } else {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  /*Event set gi?? tr??? m???c ?????nh cho c??c control*/
  setDefaultValueForm() {
    // this.vendorControl.setValue(this.configData.vendor.vendorName);
    /*Form S???n ph???m d???ch v???*/

    //????n v??? ti???n
    let toSelectUnitMoneyProduct = this.listUnitMoney.find(x => x.isDefault == true);
    if (toSelectUnitMoneyProduct) {
      this.unitMoneyProductControl.setValue(toSelectUnitMoneyProduct);
      this.unitMoneyLabel = toSelectUnitMoneyProduct.categoryCode;
    } else {
      this.unitMoneyProductControl.setValue(this.listUnitMoney[0]);
      this.unitMoneyLabel = this.listUnitMoney[0].categoryCode;
    }

    //Lo???i chi???t kh???u
    let toSelectDiscountTypeProduct = this.discountTypeList.find(x => x.code == 'PT');
    this.discountTypeProductControl.setValue(toSelectDiscountTypeProduct);

    /*End: Form S???n ph???m d???ch v???*/

    /*Form Chi ph?? kh??c (OC)*/

    //????n v??? ti???n
    let toSelectUnitMoneyOC = this.listUnitMoney.find(x => x.isDefault == true);
    if (toSelectUnitMoneyOC) {
      this.unitMoneyOCControl.setValue(toSelectUnitMoneyOC);
      this.unitMoneyOCLabel = toSelectUnitMoneyOC.categoryCode;
    } else {
      this.unitMoneyOCControl.setValue(this.listUnitMoney[0]);
      this.unitMoneyOCLabel = this.listUnitMoney[0].categoryCode;
    }

    //Lo???i chi???t kh???u
    let toSelectDiscountTypeOC = this.discountTypeList.find(x => x.code == 'PT');
    this.discountTypeOCControl.setValue(toSelectDiscountTypeOC);

    /*End: Form Chi ph?? kh??c*/

    if (this.configData.isCreate == false) {
      /* CHINH SUA */
      let editModel: VendorOrderDetailModel = this.configData.vendorOrderDetail;
      this.selectedOrderDetailType = editModel.orderDetailType;
      if (editModel.orderDetailType == 0) {
        /* s???n ph???m d???ch v??? */
        let toSelectProduct = this.listProduct.find(x => x.productId == editModel.productId);
        this.productControl.setValue(toSelectProduct);
        // Kho
        if (toSelectProduct.folowInventory == true) {
          this.getListWarehouseStartQuantity();
          this.isShowInventory = true;
          let warehouse = this.listWarehouseInventory.find(c => c.warehouseId == editModel.warehouseId);
          this.warehouseControl.setValue(warehouse);
          this.customerOrderService.getInventoryNumber(warehouse?.warehouseId, toSelectProduct.productId).subscribe(response => {
            let result: any = response;
            if (result.statusCode == 200) {
              this.inventoryNumber = result.inventoryNumber;
            }
          });
        } else {
          this.isShowInventory = false;
        }

        //????n v??? t??nh
        this.unitProductControl.setValue(editModel.unitName);
        //????n v??? ti???n
        this.quantityProductControl.setValue(editModel.quantity.toString());
        this.priceProductControl.setValue(editModel.unitPrice.toString());
        this.unitMoneyProductControl.setValue(this.listUnitMoney.find(x => x.categoryId == editModel.currencyUnit));
        this.unitMoneyLabel = this.listUnitMoney.find(x => x.categoryId == editModel.currencyUnit).categoryCode;
        let toSelectExchangeRate = editModel.exchangeRate != null ? editModel.exchangeRate.toString() : '1';
        this.exchangeRateProductControl.setValue(toSelectExchangeRate);
        let toSelectVat = editModel.vat != null ? editModel.vat.toString() : '0';
        this.vatProductControl.setValue(toSelectVat);
        this.discountTypeProductControl.setValue(this.discountTypeList.find(x => x.value == editModel.discountType));
        let discountValue = editModel.discountValue != null ? editModel.discountValue.toString() : '0';
        this.discountValueProductControl.setValue(discountValue);
        //   /*T???t validator ki???m tra Chi???t kh???u*/
        this.discountValueProductControl.setValidators(null);
        this.discountValueProductControl.updateValueAndValidity();
        this.calculatorAmountProduct();

        //map table thu???c t??nh
        this.listAttrProduct = [];

        editModel.listVendorOrderProductDetailProductAttributeValue.forEach(e => {
          let newItem: productAttributeCategory = new productAttributeCategory();
          newItem.productAttributeCategoryId = e.productAttributeCategoryId; //id thu???c t??nh
          newItem.productAttributeCategoryName = e.productAttributeCategoryName; //t??n thu???c t??nh
          newItem.productAttributeCategoryValue = e.productAttributeCategoryValue;
          // newItem.selectedProductAttributeCategory = e.productAttributeCategoryValue
          let selectedAttribute = newItem.productAttributeCategoryValue.find(attr => attr.productAttributeCategoryValueId == e.productAttributeCategoryValueId);
          newItem.selectedProductAttributeCategory = selectedAttribute ? selectedAttribute : null;

          this.listAttrProduct = [...this.listAttrProduct, newItem];
        });
      } else {
        // chi ph?? kh??c

        let description = editModel.description != null ? editModel.description.trim() : '';
        this.descriptionOCControl.setValue(description);

        let unitOC = editModel.incurredUnit != null ? editModel.incurredUnit.trim() : '';
        this.unitOCControl.setValue(unitOC);

        this.quantityOCControl.setValue(editModel.quantity.toString());

        this.priceOCControl.setValue(editModel.unitPrice.toString());

        this.unitMoneyOCControl.setValue(this.listUnitMoney.find(x => x.categoryId == editModel.currencyUnit));
        this.unitMoneyOCLabel = this.listUnitMoney.find(x => x.categoryId == editModel.currencyUnit).categoryCode;

        let toSelectExchangeRate = editModel.exchangeRate != null ? editModel.exchangeRate.toString() : '1';
        this.exchangeRateOCControl.setValue(toSelectExchangeRate);

        let toSelectVat = editModel.vat != null ? editModel.vat.toString() : '0';
        this.vatOCControl.setValue(toSelectVat);

        this.discountTypeOCControl.setValue(this.discountTypeList.find(x => x.value == editModel.discountType));

        let discountValue = editModel.discountValue != null ? editModel.discountValue.toString() : '0';
        this.discountValueOCControl.setValue(discountValue);
        /*T???t validator ki???m tra Chi???t kh???u*/
        this.discountValueOCControl.setValidators(null);
        this.discountValueOCControl.updateValueAndValidity();
        /*End*/

        //G??n gi?? tr??? l???i cho c??c bi???n l??u s??? th??nh ti???n
        this.calculatorAmountOC();
      }
    }
  }
  /*End*/

  /*Event khi thay ?????i OrderDetailType (S???n ph???m d???ch v??? ho???c Chi ph?? ph??t sinh)*/
  changeOrderDetailType(orderDetailType: number) {
    this.selectedOrderDetailType = orderDetailType; //thay ?????i ki???u d??? li???u t??? text => number
  }
  /*End*/

  /*Event khi thay ?????i s???n ph???m d???ch v???*/
  changeProduct(event: any) {
    /*reset v?? setValue c??c control c??n l???i*/
    this.unitProductControl.setValue('');
    this.quantityProductControl.setValue('1');
    this.priceProductControl.setValue('0');
    this.unitMoneyProductControl.setValue(this.listUnitMoney.find(x => x.isDefault == true));
    this.exchangeRateProductControl.setValue('1');
    this.unitMoneyLabel = this.listUnitMoney.find(x => x.isDefault == true).categoryCode;
    this.amountProduct = 0;
    this.vatProductControl.setValue('0');
    this.amountVatProduct = 0;
    this.discountTypeProductControl.setValue(this.discountTypeList.find(x => x.code == 'PT'));
    this.discountValueProductControl.setValue('0');

    /*T???t validator ki???m tra Chi???t kh???u*/
    this.discountValueProductControl.setValidators(null);
    this.discountValueProductControl.updateValueAndValidity();
    /*End*/

    this.amountDiscountProduct = 0;
    this.listAttrProduct = [];
    this.warehouseControl.reset();
    /*End*/

    this.inventoryNumber = 0;
    this.listWarehouseInventory = [];
    this.isShowInventory = false;
    let product: productModel = event.value;
    if (product) {
      if (product.folowInventory == true) {
        this.isShowInventory = true;
        this.loading = true;
        this.customerOrderService.getInventoryNumber(null, product.productId).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.inventoryNumber = result.inventoryNumber;
          }
        });
        this.getListWarehouseStartQuantity();
      } else {
        this.isShowInventory = false;
      }
      //L???y ????n v??? t??nh
      this.unitProductControl.setValue(product.productUnitName);

      //set gi?? tr??? cho ????n gi?? n???u s???n ph???m c?? gi?? tr??? ????n gi??(price1)
      if (product.price1 != null) {
        this.priceProductControl.setValue(product.price1.toString());
      }

      // set gi?? tr??? cho ????n gi?? g???n v???i NCC theo s??? l?????ng
      if (product.fixedPrice != null && product.minimumInventoryQuantity != null) {
        let soluong = this.quantityProductControl.value;
        if (soluong >= product.minimumInventoryQuantity) {
          this.priceProductControl.setValue(product.fixedPrice.toString());
        }
      }

      product.listProductAttributeCategory.forEach(e => {
        let newRecord: productAttributeCategory = new productAttributeCategory();
        newRecord.productAttributeCategoryName = e.productAttributeCategoryName; //name
        newRecord.productAttributeCategoryValue = e.productAttributeCategoryValue; //list option
        newRecord.productAttributeCategoryId = e.productAttributeCategoryId; //id
        this.listAttrProduct = [...this.listAttrProduct, newRecord];
      });
    }
  }
  /*End*/

  /*Event khi thay ?????i S??? l?????ng*/
  changeQuantityProduct() {
    let quantity = this.quantityProductControl.value;
    if (!quantity) {
      this.quantityProductControl.setValue('1');
    }

    let product = this.productControl.value;
    if (product) {
      // set gi?? tr??? cho ????n gi?? g???n v???i NCC theo s??? l?????ng
      if (product.fixedPrice != null && product.minimumInventoryQuantity != null) {
        let soluong = this.quantityProductControl.value;
        if (soluong >= product.minimumInventoryQuantity) {
          this.priceProductControl.setValue(product.fixedPrice.toString());
        }
      }
    }

    this.calculatorAmountProduct();
  }
  /*End*/

  /*Event khi thay ?????i ????n gi??*/
  changePriceProduct() {
    let price = this.priceProductControl.value;
    if (!price) {
      this.priceProductControl.setValue('0');
    }

    this.calculatorAmountProduct();
  }
  /*End*/

  /*Event khi thay ?????i lo???i ????n v??? ti???n: VND, USD,..v..v..*/
  changeUnitMoneyProduct(unitMoney: moneyUnit) {
    this.unitMoneyLabel = unitMoney.categoryCode;
    this.exchangeRateProductControl.setValue('1');

    this.calculatorAmountProduct();
  }
  /*End*/

  /*Event khi thay ?????i t??? gi??*/
  changeExchangeRateProduct() {
    let exchangeRate = this.exchangeRateProductControl.value;
    if (!exchangeRate) {
      this.exchangeRateProductControl.setValue('1');
    } else {
      exchangeRate = parseFloat(this.exchangeRateProductControl.value.replace(/,/g, ''));
      if (exchangeRate == 0) {
        this.exchangeRateProductControl.setValue('1');
      }
    }

    this.calculatorAmountProduct();
  }
  /*End*/

  /*Event khi thay ?????i gi?? tr??? thu??? GTGT*/
  changeVatProduct() {
    let vat = this.vatProductControl.value;
    if (!vat) {
      this.vatProductControl.setValue('0');
    } else {
      vat = parseFloat(this.vatProductControl.value.replace(/,/g, ''));
      if (vat > 100) {
        this.vatProductControl.setValue('100');
      }
    }

    this.calculatorAmountProduct();
  }
  /*End*/

  /*Event khi thay ?????i lo???i Chi???t kh???u (theo %, theo S??? ti???n)*/
  changeDiscountTypeProduct(discountType: DiscountType) {
    this.discountValueProductControl.setValue('0');

    if (discountType.code == 'PT') {
      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators(null);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    }

    this.calculatorAmountProduct();
  }
  /*End*/

  /*Event khi thay ?????i gi?? tr??? Chi???t kh???u*/
  changeDiscountValueProduct() {
    let discountValue = 0;
    if (this.discountValueProductControl.value.trim() == '') {
      discountValue = 0;
      this.discountValueProductControl.setValue('0');
    } else {
      discountValue = parseFloat(this.discountValueProductControl.value.replace(/,/g, ''));
    }

    let discountType: DiscountType = this.discountTypeProductControl.value;
    if (discountType.code == 'PT') {
      if (discountValue > 100) {
        discountValue = 100;
        this.discountValueProductControl.setValue('100');
      }

      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators(null);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    } else if (discountType.code == 'ST') {
      /*B???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators([compareNumberValidator(this.amountProduct)]);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    }

    this.calculatorAmountProduct();
  }
  /*End*/

  /*T??nh c??c gi?? tr???: amountProduct, amountVatProduct, amountDiscountProduct*/
  calculatorAmountProduct() {
    let quantity: number = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));
    let price: number = parseFloat(this.priceProductControl.value.replace(/,/g, ''));
    let exchangeRate: number = parseFloat(this.exchangeRateProductControl.value.replace(/,/g, ''));
    let vat: number = parseFloat(this.vatProductControl.value.replace(/,/g, ''));
    let discountType: DiscountType = this.discountTypeProductControl.value;
    let discountValue: number = parseFloat(this.discountValueProductControl.value.replace(/,/g, ''));

    this.amountProduct = this.roundNumber((quantity * price * exchangeRate), parseInt(this.defaultNumberType, 10));

    if (discountType.code == 'PT') {
      this.amountDiscountProduct = this.roundNumber(((discountValue * quantity * price * exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
      this.amountVatProduct = this.roundNumber((((quantity * price * exchangeRate) - ((discountValue * quantity * price * exchangeRate) / 100)) * (vat / 100)), parseInt(this.defaultNumberType, 10));
      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators(null);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    } else if (discountType.code == 'ST') {
      this.amountDiscountProduct = discountValue;
      this.amountVatProduct = this.roundNumber((((quantity * price * exchangeRate) - (discountValue)) * (vat / 100)), parseInt(this.defaultNumberType, 10));
      /*B???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators([compareNumberValidator(this.amountProduct)]);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    }
  }
  /*End*/

  /*Event thay ?????i s??? l?????ng (OC)*/
  changeQuantityOC() {
    let quantity = this.quantityOCControl.value;
    if (!quantity) {
      this.quantityOCControl.setValue('1');
    }

    this.calculatorAmountOC();
  }
  /*End*/

  /*Event thay ?????i ????n gi?? (OC)*/
  changePriceOC() {
    let price = this.priceOCControl.value;
    if (!price) {
      this.priceOCControl.setValue('0');
    }

    this.calculatorAmountOC();
  }
  /*End*/

  /*Event thay ?????i ????n v??? ti???n (OC)*/
  changeUnitMoneyOC(unitMoney: moneyUnit) {
    this.unitMoneyOCLabel = unitMoney.categoryCode;
    this.exchangeRateOCControl.setValue('1');

    this.calculatorAmountOC();
  }
  /*End*/

  /*Event thay ?????i t??? gi?? (OC)*/
  changeExchangeRateOC() {
    let exchangeRate = this.exchangeRateOCControl.value;
    if (!exchangeRate) {
      this.exchangeRateOCControl.setValue('1');
    } else {
      exchangeRate = parseFloat(this.exchangeRateOCControl.value.replace(/,/g, ''));
      if (exchangeRate == 0) {
        this.exchangeRateOCControl.setValue('1');
      }
    }

    this.calculatorAmountOC();
  }
  /*End*/

  /*Event thay ?????i gi?? tr??? thu??? VAT (OC)*/
  changeVatOC() {
    let vat = this.vatOCControl.value;
    if (!vat) {
      this.vatOCControl.setValue('0');
    } else {
      vat = parseFloat(this.vatOCControl.value.replace(/,/g, ''));
      if (vat > 100) {
        this.vatOCControl.setValue('100');
      }
    }

    this.calculatorAmountOC();
  }
  /*End*/

  changeDiscountTypeOC(discountType: DiscountType) {
    this.discountValueOCControl.setValue('0');

    if (discountType.code == 'PT') {
      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueOCControl.setValidators(null);
      this.discountValueOCControl.updateValueAndValidity();
      /*End*/
    }

    this.calculatorAmountOC();
  }

  changeDiscountValueOC() {
    let discountValue = 0;
    if (this.discountValueOCControl.value.trim() == '') {
      discountValue = 0;
      this.discountValueOCControl.setValue('0');
    } else {
      discountValue = parseFloat(this.discountValueOCControl.value.replace(/,/g, ''));
    }

    let discountType: DiscountType = this.discountTypeOCControl.value;
    if (discountType.code == 'PT') {
      if (discountValue > 100) {
        discountValue = 100;
        this.discountValueOCControl.setValue('100');
      }

      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueOCControl.setValidators(null);
      this.discountValueOCControl.updateValueAndValidity();
      /*End*/
    } else if (discountType.code == 'ST') {
      /*B???t validator ki???m tra Chi???t kh???u*/
      this.discountValueOCControl.setValidators([compareNumberValidator(this.amountOC)]);
      this.discountValueOCControl.updateValueAndValidity();
      /*End*/
    }

    this.calculatorAmountOC();
  }

  calculatorAmountOC() {
    let quantity: number = parseFloat(this.quantityOCControl.value.replace(/,/g, ''));
    let price: number = parseFloat(this.priceOCControl.value.replace(/,/g, ''));
    let exchangeRate: number = parseFloat(this.exchangeRateOCControl.value.replace(/,/g, ''));
    let vat: number = parseFloat(this.vatOCControl.value.replace(/,/g, ''));
    let discountType: DiscountType = this.discountTypeOCControl.value;
    let discountValue: number = parseFloat(this.discountValueOCControl.value.replace(/,/g, ''));

    this.amountOC = this.roundNumber((quantity * price * exchangeRate), parseInt(this.defaultNumberType, 10));

    if (discountType.code == 'PT') {
      this.amountDiscountOC = this.roundNumber(((discountValue * quantity * price * exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
      this.amountVatOC = this.roundNumber((((quantity * price * exchangeRate) - ((discountValue * quantity * price * exchangeRate) / 100)) * (vat / 100)), parseInt(this.defaultNumberType, 10));
      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueOCControl.setValidators(null);
      this.discountValueOCControl.updateValueAndValidity();
      /*End*/
    } else if (discountType.code == 'ST') {
      this.amountDiscountOC = discountValue;
      this.amountVatOC = this.roundNumber((((quantity * price * exchangeRate) - (discountValue)) * (vat / 100)), parseInt(this.defaultNumberType, 10));

      /*B???t validator ki???m tra Chi???t kh???u*/
      this.discountValueOCControl.setValidators([compareNumberValidator(this.amountOC)]);
      this.discountValueOCControl.updateValueAndValidity();
      /*End*/
    }
  }

  /* M??? popup T???o nhanh s???n ph???m */
  openQuickCreProductDialog() {
    let ref = this.dialogService.open(QuickCreateProductComponent, {
      data: {
        type: this.loaiSanPham,
      },
      header: 'T???o nhanh s???n ph???m',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        'overflow-x': 'hidden'
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        let newProduct: productModel = result.newProduct;
        this.listProduct = [newProduct, ...this.listProduct];
        this.productControl.setValue(newProduct ? newProduct : null);
        let event = {
          value: newProduct ? newProduct : null
        }
        this.changeProduct(event);
      }
    });
  }

  /*Event H???y dialog*/
  cancel() {
    let result: ResultDialog = {
      status: false,  //H???y
      vendorOrderDetail: null
    };
    this.ref.close(result);
  }
  /*End*/

  /*Event L??u dialog*/
  save() {
    if (this.selectedOrderDetailType == 0) {
      /*N???u l?? th??m S???n ph???m d???ch v???*/

      //reset Form Chi ph?? kh??c
      this.resetOtherCostsForm();

      //T???ng s??? thu???c t??nh:
      let countTotalAttrProduct = this.listAttrProduct.length;
      //T???ng s??? thu???c t??nh ???? ??i???n gi?? tr???:
      let countCurrentAttrProduct = this.listAttrProduct.filter(x => x.selectedProductAttributeCategory != null).length;
      // ????n gi?? 
      let price = parseFloat(this.priceProductControl.value.replace(/,/g, ''));
      // s??? l?????ng
      let quantity = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));


      if (countCurrentAttrProduct < countTotalAttrProduct) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'B???n ph???i ch???n ?????y ????? thu???c t??nh cho s???n ph???m/d???ch v???' };
        this.showMessage(msg);
      } else if (quantity > 999999) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? l?????ng kh??ng ???????c l??n h??n 999,999' };
        this.showMessage(msg);
      } else if (price > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: '????n gi?? kh??ng ???????c l??n h??n 999,000,000,000 VND' };
        this.showMessage(msg);
      } else if (this.amountProduct > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'Th??nh ti???n (VND) kh??ng ???????c l??n h??n 999,000,000,000 VND' };
        this.showMessage(msg);
      } else if (!this.productForm.valid) {
        Object.keys(this.productForm.controls).forEach(key => {
          if (this.productForm.controls[key].valid == false) {
            this.productForm.controls[key].markAsTouched();
          }
        });
      } else {
        let productOrderModel = this.mapProductFormToModel();
        let result: ResultDialog = {
          status: true,
          vendorOrderDetail: productOrderModel
        }
        this.ref.close(result);
      }
    } else if (this.selectedOrderDetailType == 1) {
      /*N???u l?? th??m Chi ph?? kh??c*/

      //reset Form S???n ph???m d???ch v???
      this.resetProductForm();

      // ????n gi?? 
      let price = parseFloat(this.priceOCControl.value.replace(/,/g, ''));
      // s??? l?????ng
      let quantity = parseFloat(this.quantityOCControl.value.replace(/,/g, ''));

      if (!this.otherCostsForm.valid) {
        Object.keys(this.otherCostsForm.controls).forEach(key => {
          if (this.otherCostsForm.controls[key].valid == false) {
            this.otherCostsForm.controls[key].markAsTouched();
          }
        });
      } else if (quantity > 999999) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? l?????ng kh??ng ???????c l??n h??n 999,999' };
        this.showMessage(msg);
      } else if (price > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: '????n gi?? kh??ng ???????c l??n h??n 999,000,000,000 VND' };
        this.showMessage(msg);
      } else if (this.amountOC > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'Th??nh ti???n (VND) kh??ng ???????c l??n h??n 999,000,000,000 VND' };
        this.showMessage(msg);
      } else {
        let otherCostDetailModel: VendorOrderDetailModel = new VendorOrderDetailModel();
        otherCostDetailModel.description = this.descriptionOCControl.value.trim();
        let discountType: DiscountType = this.discountTypeOCControl.value;
        otherCostDetailModel.discountType = discountType.value;  //Lo???i chi???t kh???u
        let discountValue = parseFloat(this.discountValueOCControl.value.replace(/,/g, ''));
        otherCostDetailModel.discountValue = discountValue;  //G??a tr??? chi???t kh???u
        let exchangeRate = parseFloat(this.exchangeRateOCControl.value.replace(/,/g, ''));
        otherCostDetailModel.exchangeRate = exchangeRate;  //T??? gi??
        otherCostDetailModel.incurredUnit = this.unitOCControl.value != null ? this.unitOCControl.value.trim() : '';
        otherCostDetailModel.unitName = otherCostDetailModel.incurredUnit;
        let currency: moneyUnit = this.unitMoneyOCControl.value;
        otherCostDetailModel.currencyUnit = currency.categoryId; //currency.categoryCode;
        otherCostDetailModel.currencyUnitName = currency.categoryName;
        otherCostDetailModel.vendorId = this.configData.vendor == null ? null : this.configData.vendor.vendorId;
        otherCostDetailModel.vendorName = this.configData.vendor == null ? null : this.configData.vendor.vendorName;
        otherCostDetailModel.orderDetailType = this.selectedOrderDetailType;
        otherCostDetailModel.productId = null;
        otherCostDetailModel.quantity = parseFloat(this.quantityOCControl.value.replace(/,/g, ''));
        otherCostDetailModel.sumAmount = this.roundNumber((this.amountOC + this.amountVatOC - this.amountDiscountOC), parseInt(this.defaultNumberType, 10));
        otherCostDetailModel.productUnitId = null;
        otherCostDetailModel.unitPrice = parseFloat(this.priceOCControl.value.replace(/,/g, ''));
        otherCostDetailModel.vat = parseFloat(this.vatOCControl.value.replace(/,/g, ''));
        otherCostDetailModel.sumAmountDiscount = this.amountDiscountProduct;
        otherCostDetailModel.procurementRequestItemId = null;
        otherCostDetailModel.procurementRequestId = null;
        otherCostDetailModel.procurementCode = null;

        if (this.configData.isCreate) {
          otherCostDetailModel.isReshow = false;
        } else {
          otherCostDetailModel.isReshow = this.configData.vendorOrderDetail.isReshow;
        }

        let result: ResultDialog = {
          status: true,
          vendorOrderDetail: otherCostDetailModel
        }
        this.ref.close(result);
      }
    }
  }
  /*End*/

  /*  Map form s???n ph???m/ d???ch v??? */
  mapProductFormToModel(): VendorOrderDetailModel {
    let vendorOrderDetail = new VendorOrderDetailModel();
    vendorOrderDetail.vendorOrderDetailId = this.emptyGuid;
    vendorOrderDetail.vendorOrderId = this.emptyGuid;

    //lo???i sp/dv
    vendorOrderDetail.orderDetailType = this.selectedOrderDetailType;

    let _product: productModel = this.productControl.value;
    vendorOrderDetail.productId = _product.productId;
    vendorOrderDetail.productUnitId = _product.productUnitId;
    vendorOrderDetail.description = this.buildDescription();
    vendorOrderDetail.vendorId = this.configData.vendor == null ? null : this.configData.vendor.vendorId;
    vendorOrderDetail.vendorName = this.configData.vendor == null ? null : this.configData.vendor.vendorName;
    vendorOrderDetail.quantity = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));
    vendorOrderDetail.unitName = this.unitProductControl.value;
    vendorOrderDetail.unitPrice = parseFloat(this.priceProductControl.value.replace(/,/g, ''));
    vendorOrderDetail.warehouseId = this.warehouseControl.value ? this.warehouseControl.value.warehouseId : null;
    vendorOrderDetail.folowInventory = _product.folowInventory;

    let currency: moneyUnit = this.unitMoneyProductControl.value;
    vendorOrderDetail.currencyUnit = currency.categoryId;
    vendorOrderDetail.currencyUnitName = currency.categoryName;

    vendorOrderDetail.exchangeRate = parseFloat(this.exchangeRateProductControl.value.replace(/,/g, ''));

    let discountType: DiscountType = this.discountTypeProductControl.value;
    vendorOrderDetail.discountType = discountType.value;

    let discountValue = parseFloat(this.discountValueProductControl.value.replace(/,/g, ''));
    vendorOrderDetail.discountValue = discountValue;  //G??a tr??? chi???t kh???u

    let exchangeRate = parseFloat(this.exchangeRateProductControl.value.replace(/,/g, ''));
    vendorOrderDetail.exchangeRate = exchangeRate;  //T??? gi??

    vendorOrderDetail.sumAmountDiscount = this.amountDiscountProduct;
    vendorOrderDetail.sumAmountVat = this.amountVatProduct;
    vendorOrderDetail.vat = parseFloat(this.vatProductControl.value.replace(/,/g, ''));
    vendorOrderDetail.sumAmount = this.roundNumber((this.amountProduct + this.amountVatProduct - this.amountDiscountProduct), parseInt(this.defaultNumberType, 10));

    if (this.configData.isCreate) {
      vendorOrderDetail.isReshow = false;
      vendorOrderDetail.procurementRequestItemId = null;
      vendorOrderDetail.procurementRequestId = null;
      vendorOrderDetail.procurementCode = null;
    } else {
      vendorOrderDetail.isReshow = this.configData.vendorOrderDetail.isReshow;
      vendorOrderDetail.procurementRequestItemId = this.configData.vendorOrderDetail.procurementRequestItemId;
      vendorOrderDetail.procurementRequestId = this.configData.vendorOrderDetail.procurementRequestId;
      vendorOrderDetail.procurementCode = this.configData.vendorOrderDetail.procurementCode;
    }

    vendorOrderDetail.listVendorOrderProductDetailProductAttributeValue = [];

    this.listAttrProduct.forEach(e => {
      let item: VendorOrderProductDetailProductAttributeValueModel = new VendorOrderProductDetailProductAttributeValueModel();
      item.orderProductDetailProductAttributeValueId = this.emptyGuid;
      item.vendorOrderDetailId = this.emptyGuid;
      item.productId = _product.productId;

      item.productAttributeCategoryId = e.productAttributeCategoryId; //t??n thu???c t??nh
      item.productAttributeCategoryName = e.productAttributeCategoryName; //id thu???c t??nh
      item.productAttributeCategoryValue = e.productAttributeCategoryValue; //danh s??ch gi?? tr??? thu???c t??nh
      item.productAttributeCategoryValueId = e.selectedProductAttributeCategory.productAttributeCategoryValueId //thu???c t??nh ???? ???????c ch???n

      vendorOrderDetail.listVendorOrderProductDetailProductAttributeValue.push(item);
    });
    return vendorOrderDetail;
  }

  buildDescription(): string {
    let _product: productModel = this.productControl.value;
    let _productName = _product ? _product.productName : '';

    let listAttrName: Array<string> = [];
    this.listAttrProduct.forEach(e => {
      let newAttrName = e.productAttributeCategoryName + ":" + e.selectedProductAttributeCategory.productAttributeCategoryValue1;
      listAttrName.push(newAttrName);
    });

    let attrName = '';
    if (listAttrName.length > 0) {
      attrName = "(" + listAttrName.join(', ') + ")";
    }
    let result = _productName + " " + attrName;

    return result;
  }


  /*Reset form chi ph?? kh??c*/
  resetOtherCostsForm() {
    this.descriptionOCControl.reset();
    this.unitOCControl.setValue('');
    this.quantityOCControl.setValue('1');
    this.priceOCControl.setValue('0');
    this.vatOCControl.setValue('0');
    this.discountTypeOCControl.setValue(null);
    this.discountValueOCControl.setValue('0');
    /*T???t validator ki???m tra Chi???t kh???u*/
    this.discountValueOCControl.setValidators(null);
    this.discountValueOCControl.updateValueAndValidity();
    /*End*/
    let toSelectUnitMoneyOC = this.listUnitMoney.find(x => x.isDefault == true);
    if (toSelectUnitMoneyOC === undefined) toSelectUnitMoneyOC = this.listUnitMoney[0];

    this.unitMoneyOCControl.setValue(toSelectUnitMoneyOC);
    this.unitMoneyOCLabel = toSelectUnitMoneyOC.categoryCode;
    this.exchangeRateOCControl.setValue('1');

    //g??n gi?? tr??? m???c ?????nh cho lo???i chi???t kh???u
    let toSelectDiscountTypeOC = this.discountTypeList.find(x => x.code == 'PT');
    this.discountTypeOCControl.setValue(toSelectDiscountTypeOC);

    //G??n gi?? tr??? l???i cho c??c bi???n l??u s??? th??nh ti???n
    this.amountOC = 0;
    this.amountVatOC = 0;
    this.amountDiscountOC = 0;
  }
  /*End*/

  /*Reset form s???n ph???m d???ch v???*/
  resetProductForm() {
    this.productControl.reset();
    this.unitProductControl.setValue('');
    // this.vendorControl.reset();
    this.quantityProductControl.setValue('1');
    this.priceProductControl.setValue('0');
    let defaultMoney = this.listUnitMoney.find(x => x.isDefault == true);
    this.unitMoneyProductControl.setValue(defaultMoney ? defaultMoney : null);
    this.exchangeRateProductControl.setValue('1');
    this.unitMoneyLabel = this.listUnitMoney.find(x => x.isDefault == true).categoryCode;
    this.vatProductControl.setValue('0');
    this.discountTypeProductControl.setValue(this.discountTypeList.find(x => x.code == 'PT'));
    this.discountValueProductControl.setValue('0');
    /*T???t validator ki???m tra Chi???t kh???u*/
    this.discountValueProductControl.setValidators(null);
    this.discountValueProductControl.updateValueAndValidity();
    /*End*/
    this.listAttrProduct = [];  //list group thu???c t??nh c???a s???n ph???m
    //G??n gi?? tr??? l???i cho c??c bi???n l??u s??? th??nh ti???n
    this.amountProduct = 0;
    this.amountVatProduct = 0;
    this.amountDiscountProduct = 0;
  }
  /*End*/

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case -1: {
        result = result;
        break;
      }
      case 0: {
        result = Math.round(number);
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

  getListWarehouseStartQuantity() {
    this.listWarehouseInventory = [];

    this.listWarehouseLevel0.forEach(warehouse => {
      this.getLastWarehouse(warehouse);
    });

    this.listWarehouseInventory.forEach(warehouse => {
      let listParentId = this.getListParentId(warehouse, []);
      let listParentName: Array<string> = [];
      listParentId.forEach(warehouseId => {
        let warehouse = this.listWarehouse.find(e => e.warehouseId == warehouseId);
        listParentName.push(warehouse.warehouseName);
      });
      warehouse.warehouseNameByLevel = listParentName.reverse().join(' > ');
    });
  }

  getLastWarehouse(currentWarehouse: warehouseModel) {
    let findChildWarehouse = this.listWarehouse.filter(e => e.warehouseParent === currentWarehouse.warehouseId);
    if (findChildWarehouse.length === 0) {
      this.listWarehouseInventory = [...this.listWarehouseInventory, currentWarehouse];
      return;
    }
    findChildWarehouse.forEach(warehouse => {
      this.getLastWarehouse(warehouse);
    });
  }

  getListParentId(currentWarehouse: warehouseModel, listParentIdReponse: Array<string>): Array<string> {
    listParentIdReponse.push(currentWarehouse.warehouseId);
    let parent = this.listWarehouse.find(e => e.warehouseId == currentWarehouse.warehouseParent);
    if (parent === undefined) return listParentIdReponse;
    listParentIdReponse.push(parent.warehouseId);
    //find parent of parent
    let parentOfParent = this.listWarehouse.find(e => e.warehouseId == parent.warehouseParent);
    if (parentOfParent === undefined) {
      return listParentIdReponse;
    } else {
      this.getListParentId(parentOfParent, listParentIdReponse);
    }
    return listParentIdReponse;
  }

  changeWarehouse(warehouse: warehouseModel) {
    let warehouseId = null;
    if (!warehouse) {
      this.inventoryNumber = 0;
    } else {
      warehouseId = warehouse.warehouseId;
    }
    let productId = this.productControl.value.productId;
    this.loading = true;
    this.customerOrderService.getInventoryNumber(warehouseId, productId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.inventoryNumber = result.inventoryNumber;
      }
    });
  }

}

//So s??nh gi?? tr??? nh???p v??o v???i m???t gi?? tr??? x??c ?????nh
function compareNumberValidator(number: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (parseFloat(control.value.replace(/,/g, '')) > number)) {
      return { 'numberInvalid': true };
    }
    return null;
  };
}

//Valid when is zero
function compareWhitZeroValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== undefined && (parseFloat(control.value.replace(/,/g, '')) == 0)) {
      return { 'zeroInvalid': true };
    }
    return null;
  };
}

//Kh??ng ???????c nh???p ch??? c?? kho???ng tr???ng
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
