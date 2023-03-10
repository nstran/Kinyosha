import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { CustomerOrderService } from '../../../order/services/customer-order.service';
import { QuickCreateProductComponent } from '../../../shared/components/quick-create-product/quick-create-product.component';

interface ResultDialog {
  status: boolean,
  billSaleDetailModel: BillSaleDetailModel,
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
  unitLaborPrice: number;
  unitLaborNumber: number;
  sumAmountLabor: number;
  guaranteeTime: number;
  orderNumber: number;
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

interface Category {
  categoryId: string,
  categoryCode: string,
  categoryName: string,
  isDefault: boolean;
}

interface Vendor {
  vendorId: string,
  vendorCode: string,
  vendorName: string
}

interface Product {
  productId: string,
  productCode: string,
  productName: string,
  productUnitId: string,
  price1: number,
  guaranteeTime: number;
  name: string;
  productCodeName: string;
}

interface DiscountType {
  name: string;
  code: string;
  value: boolean;
}

interface ObjectAttrNameProduct {
  productAttributeCategoryId: string,
  productAttributeCategoryName: string  //M??u s???c
}

interface ObjectAttrValueProduct {
  productAttributeCategoryValueId: string,
  productAttributeCategoryValue: string, //?????, V??ng, Xanh, Tr???ng...
  productAttributeCategoryId: string
}

interface GroupAttrProduct {
  AttrName: ObjectAttrNameProduct,
  AttrValue: Array<ObjectAttrValueProduct>,
  SelectedAttrValue: ObjectAttrValueProduct
}

@Component({
  selector: 'app-bill-sale-dialog',
  templateUrl: './bill-sale-dialog.component.html',
  styleUrls: ['./bill-sale-dialog.component.css'],
  providers: [DialogService]
})
export class BillSaleDialogComponent implements OnInit {
  @ViewChild('priceInitial') priceInitialElement: ElementRef;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();  //S??? ch??? s??? th???p ph??n sau d???u ph???y
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  loading: boolean = false;

  /*C??c bi???n ??i???u ki???n*/
  isCreate: boolean = true; //true: T???o m???i s???n ph???m d???ch v???(ho???c chi ph?? ph??t sinh), false: S???a s???n ph???m d???ch v???(ho???c chi ph?? ph??t sinh)
  selectedOrderDetailType: number = 0;  //0: S???n ph???m d???ch v???, 1: Chi ph?? ph??t sinh
  isShowRadioProduct: boolean = true;
  isShowRadioOC: boolean = true;
  /*End*/

  /*C??c bi???n nh???n gi?? tr??? tr??? v???*/
  listUnitMoney: Array<Category> = [];
  unitMoneyLabel: string = 'VND';
  unitMoneyOCLabel: string = 'VND';
  listUnitProduct: Array<Category> = [];
  listVendor: Array<Vendor> = [];
  listProduct: Array<Product> = [];
  listWarehouse: Array<any> = [];
  sumAmountLabor: number = 0; //th??nh ti???n nh??n c??ng
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
  listObjectAttrNameProduct: Array<ObjectAttrNameProduct> = [];
  listObjectAttrValueProduct: Array<ObjectAttrValueProduct> = [];
  listAttrProduct: Array<GroupAttrProduct> = [];
  billSaleDetailModel = new BillSaleDetailModel();
  guaranteeDatetime: Date = null;
  IsPriceInitial: boolean = false;
  warehouse: any = null;
  /*End*/

  /*Form s???n ph???m d???ch v???*/
  productForm: FormGroup;
  productControl: FormControl;
  unitProductControl: FormControl;
  vendorControl: FormControl;
  quantityProductControl: FormControl;
  priceProductControl: FormControl;
  unitMoneyProductControl: FormControl;
  exchangeRateProductControl: FormControl;
  // guaranteeTimeProductControl: FormControl;
  expirationDateProductControl: FormControl;
  vatProductControl: FormControl;
  discountTypeProductControl: FormControl;
  discountValueProductControl: FormControl;
  nameProductControl: FormControl;
  priceInitialControl: FormControl;
  warrantyPeriodControl: FormControl;
  warehouseIdControl: FormControl;
  actualInventoryControl: FormControl;
  businessInventoryControl: FormControl;
  moneyForGoodsControl: FormControl;
  unitLaborNumberControl: FormControl;
  unitLaborPriceControl: FormControl;
  /*End*/

  /*Form chi ph?? kh??c*/
  otherCostsForm: FormGroup; //otherCosts s??? k?? hi???u t???t l?? OC v?? ??c th??m v??o h???u t??? c???a control
  descriptionOCControl: FormControl;
  unitOCControl: FormControl;
  // quantityOCControl: FormControl;
  // priceOCControl: FormControl;
  // unitMoneyOCControl: FormControl;
  // exchangeRateOCControl: FormControl;
  // vatOCControl: FormControl;
  // discountTypeOCControl: FormControl;
  // discountValueOCControl: FormControl;
  /*End*/

  customerGroupId: string = null;
  orderDate: Date = null;
  isEdit: boolean = true;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private customerOrderService: CustomerOrderService,
    public dialogService: DialogService,
  ) {
    this.isCreate = this.config.data.isCreate;
    this.warehouse = this.config.data.warehouse;
    this.customerGroupId = this.config.data.customerGroupId;
    this.orderDate = this.config.data.orderDate;

    if (!this.isCreate) {
      //N???u l?? s???a
      this.billSaleDetailModel = this.config.data.billSaleDetailModel;
      let edit: boolean = this.config.data.isEdit;
      if (edit != true && edit != false) {
        this.isEdit = true;
      } else {
        this.isEdit = this.config.data.isEdit;
      }
      this.selectedOrderDetailType = this.billSaleDetailModel.orderDetailType;
      if (this.selectedOrderDetailType == 0) {
        //???n button radio S???n ph???m d???ch v???
        this.isShowRadioOC = false;
      } else if (this.selectedOrderDetailType == 1) {
        //???n button radio Chi ph?? kh??c
        this.isShowRadioProduct = false;
      }
    }
  }

  ngOnInit() {
    this.setForm();
    this.setTable();
    this.loading = true;
    this.customerOrderService.getMasterDataOrderDetailDialog().subscribe(response => {
      let result: any = response;
      this.loading = false;

      if (result.statusCode == 200) {
        this.listProduct = result.listProduct;
        this.listProduct.forEach(item => {
          let productCode = item.productCode == null ? "" : item.productCode;
          let productName = item.productName == null ? "" : item.productName;
          item.name = productCode + '-' + productName;
        });
        this.listUnitMoney = result.listUnitMoney;
        this.listUnitProduct = result.listUnitProduct;
        this.listWarehouse = result.listWareHouse;

        this.setDefaultValueForm();
      } else {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  setForm() {
    /*Form S???n ph???m d???ch v???*/
    this.productControl = new FormControl(null, [Validators.required]);
    this.unitProductControl = new FormControl({ value: '', disabled: true });
    this.vendorControl = new FormControl(null);
    this.priceInitialControl = new FormControl('0');
    this.quantityProductControl = new FormControl('0');
    this.warrantyPeriodControl = new FormControl(null);
    this.moneyForGoodsControl = new FormControl('0');
    this.priceProductControl = new FormControl('0');
    this.warehouseIdControl = new FormControl(null, [Validators.required]);
    this.actualInventoryControl = new FormControl(null);
    this.businessInventoryControl = new FormControl(null);
    this.unitMoneyProductControl = new FormControl(null);
    this.exchangeRateProductControl = new FormControl('1');
    this.nameProductControl = new FormControl(null, [Validators.required, forbiddenSpaceText]);
    // this.guaranteeTimeProductControl = new FormControl(null);
    this.expirationDateProductControl = new FormControl(null);
    this.vatProductControl = new FormControl('0');
    this.discountTypeProductControl = new FormControl(null);
    this.discountValueProductControl = new FormControl('0');
    this.unitLaborNumberControl = new FormControl('0');
    this.unitLaborPriceControl = new FormControl('0');

    this.productForm = new FormGroup({
      productControl: this.productControl,
      unitProductControl: this.unitProductControl,
      vendorControl: this.vendorControl,
      priceInitialControl: this.priceInitialControl,
      warrantyPeriodControl: this.warrantyPeriodControl,
      warehouseIdControl: this.warehouseIdControl,
      actualInventoryControl: this.actualInventoryControl,
      businessInventoryControl: this.businessInventoryControl,
      quantityProductControl: this.quantityProductControl,
      priceProductControl: this.priceProductControl,
      unitMoneyProductControl: this.unitMoneyProductControl,
      exchangeRateProductControl: this.exchangeRateProductControl,
      moneyForGoodsControl: this.moneyForGoodsControl,
      // guaranteeTimeProductControl: this.guaranteeTimeProductControl,
      expirationDateProductControl: this.expirationDateProductControl,
      vatProductControl: this.vatProductControl,
      discountTypeProductControl: this.discountTypeProductControl,
      discountValueProductControl: this.discountValueProductControl,
      nameProductControl: this.nameProductControl,
      unitLaborPriceControl: this.unitLaborPriceControl,
      unitLaborNumberControl: this.unitLaborNumberControl,
    });
    /*End*/

    /*Form Chi ph?? kh??c*/
    // this.quantityOCControl = new FormControl('0');
    // this.priceOCControl = new FormControl('0');
    // this.unitMoneyOCControl = new FormControl(null);
    // this.exchangeRateOCControl = new FormControl('1');
    // this.vatOCControl = new FormControl('0');
    // this.discountTypeOCControl = new FormControl(null);
    // this.discountValueOCControl = new FormControl('0');
    this.descriptionOCControl = new FormControl('', [Validators.required, forbiddenSpaceText]);
    this.unitOCControl = new FormControl('', [Validators.required, Validators.maxLength(50), forbiddenSpaceText]);

    this.otherCostsForm = new FormGroup({
      descriptionOCControl: this.descriptionOCControl,
      unitOCControl: this.unitOCControl,
      quantityProductControl: this.quantityProductControl,
      priceProductControl: this.priceProductControl,
      unitMoneyProductControl: this.unitMoneyProductControl,
      exchangeRateProductControl: this.exchangeRateProductControl,
      vatProductControl: this.vatProductControl,
      discountTypeProductControl: this.discountTypeProductControl,
      discountValueProductControl: this.discountValueProductControl,
      unitLaborNumberControl: this.unitLaborNumberControl,
      unitLaborPriceControl: this.unitLaborPriceControl,
      warrantyPeriodControl: this.warrantyPeriodControl,
      priceInitialControl: this.priceInitialControl,
    });
    /*End*/
  }

  setTable() {
    this.cols = [
      { field: 'AttrName', header: 'T??n thu???c t??nh', width: '50%', textAlign: 'left', color: '#f44336' },
      { field: 'AttrValue', header: 'Gi?? tr???', width: '50%', textAlign: 'left', color: '#f44336' },
    ];
  }

  /*Event set gi?? tr??? m???c ?????nh cho c??c control*/
  setDefaultValueForm() {
    if (this.isCreate) {
      /*Form S???n ph???m d???ch v???*/

      //????n v??? ti???n
      let toSelectUnitMoneyProduct = this.listUnitMoney.find(x => x.isDefault == true);
      this.unitMoneyProductControl.setValue(toSelectUnitMoneyProduct);
      this.unitMoneyLabel = toSelectUnitMoneyProduct.categoryCode;

      //Lo???i chi???t kh???u
      let toSelectDiscountTypeProduct = this.discountTypeList.find(x => x.code == 'PT');
      this.discountTypeProductControl.setValue(toSelectDiscountTypeProduct);

      /*End: Form S???n ph???m d???ch v???*/

      /*Form Chi ph?? kh??c (OC)*/

      //????n v??? ti???n
      // let toSelectUnitMoneyOC = this.listUnitMoney.find(x => x.isDefault == true);
      // this.unitMoneyOCControl.setValue(toSelectUnitMoneyOC);
      // this.unitMoneyOCLabel = toSelectUnitMoneyOC.categoryCode;

      //Lo???i chi???t kh???u
      // let toSelectDiscountTypeOC = this.discountTypeList.find(x => x.code == 'PT');
      // this.discountTypeOCControl.setValue(toSelectDiscountTypeOC);
      this.priceInitialControl.setValue("0");
      if (this.warehouse) {
        let wareHouseid = this.listWarehouse.find(c => c.warehouseId == this.warehouse);
        this.warehouseIdControl.setValue(wareHouseid);
      }
      /*End: Form Chi ph?? kh??c*/
    } else {
      if (this.selectedOrderDetailType == 0) {
        let toSelectProduct = this.listProduct.find(x => x.productId == this.billSaleDetailModel.productId);
        this.productControl.setValue(toSelectProduct);
        let productUnitName = this.listUnitProduct.find(x => x.categoryId == toSelectProduct.productUnitId).categoryName;
        this.unitProductControl.setValue(productUnitName);
        this.nameProductControl.setValue(this.billSaleDetailModel.productName)
        let wareHouse = this.listWarehouse.find(c => c.warehouseId == this.billSaleDetailModel.warehouseId);
        this.warehouseIdControl.setValue(wareHouse);
        this.actualInventoryControl.setValue(this.billSaleDetailModel.actualInventory);
        this.businessInventoryControl.setValue(this.billSaleDetailModel.businessInventory);

        if (this.warehouse) {
          let wareHouseid = this.listWarehouse.find(c => c.warehouseId == this.warehouse);
          this.warehouseIdControl.setValue(wareHouseid);
        }
        //L???y list nh?? cung c???p
        this.customerOrderService.getVendorByProductId(toSelectProduct.productId, this.customerGroupId, this.orderDate).subscribe(response => {
          let result: any = response;
          if (result.statusCode == 200) {
            this.listVendor = result.listVendor;
            this.listObjectAttrNameProduct = result.listObjectAttributeNameProduct;
            this.listObjectAttrValueProduct = result.listObjectAttributeValueProduct;
            /*Nh??m c??c thu???c t??nh c???a s???n ph???m l???i v?? map data*/
            this.listObjectAttrNameProduct.forEach(objectAttrName => {
              let objectGroup: GroupAttrProduct = {
                AttrName: {
                  productAttributeCategoryId: '',
                  productAttributeCategoryName: ''
                },
                AttrValue: [],
                SelectedAttrValue: {
                  productAttributeCategoryId: '',
                  productAttributeCategoryValueId: '',
                  productAttributeCategoryValue: '',
                }
              };
              objectGroup.AttrName = objectAttrName;
              objectGroup.AttrValue = this.listObjectAttrValueProduct.filter(x => x.productAttributeCategoryId == objectAttrName.productAttributeCategoryId);
              this.listAttrProduct.push(objectGroup);
            });

            //map data
            this.listAttrProduct.forEach(item => {
              item.SelectedAttrValue.productAttributeCategoryId = item.AttrName.productAttributeCategoryId;
              item.SelectedAttrValue.productAttributeCategoryValueId = this.billSaleDetailModel
                .listBillSaleDetailProductAttribute
                .find(x => x.productAttributeCategoryId == item.AttrName.productAttributeCategoryId)
                .productAttributeCategoryValueId;
              item.SelectedAttrValue.productAttributeCategoryValue = this.listObjectAttrValueProduct
                .find(x => x.productAttributeCategoryValueId == item.SelectedAttrValue.productAttributeCategoryValueId)
                .productAttributeCategoryValue;
            });
            /*End*/

            /*map data vendor*/
            if (this.listVendor.length >= 1) {
              let toSelectVendor = this.listVendor.find(x => x.vendorId == this.billSaleDetailModel.vendorId);
              this.vendorControl.setValue(toSelectVendor);
            }
            /*End*/
          } else {
            let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });

        this.quantityProductControl.setValue(this.billSaleDetailModel.quantity.toString());
        this.priceProductControl.setValue(this.billSaleDetailModel.unitPrice.toString());
        this.unitMoneyProductControl.setValue(this.listUnitMoney.find(x => x.categoryId == this.billSaleDetailModel.currencyUnit));
        let toSelectExchangeRate = this.billSaleDetailModel.exchangeRate != null ? this.billSaleDetailModel.exchangeRate.toString() : '0';
        this.exchangeRateProductControl.setValue(toSelectExchangeRate);
        this.unitMoneyLabel = this.listUnitMoney.find(x => x.categoryId == this.billSaleDetailModel.currencyUnit).categoryCode;
        let toSelectVat = this.billSaleDetailModel.vat != null ? this.billSaleDetailModel.vat.toString() : '0';
        this.vatProductControl.setValue(toSelectVat);
        this.discountTypeProductControl.setValue(this.discountTypeList.find(x => x.value == this.billSaleDetailModel.discountType));
        let discountValue = this.billSaleDetailModel.discountValue != null ? this.billSaleDetailModel.discountValue.toString() : '0';
        this.discountValueProductControl.setValue(discountValue);

        let unitLaborPrice = this.billSaleDetailModel.unitLaborPrice != null ? this.billSaleDetailModel.unitLaborPrice.toString() : '0';
        this.unitLaborPriceControl.setValue(unitLaborPrice);

        let unitLaborNumber = this.billSaleDetailModel.unitLaborNumber != null ? this.billSaleDetailModel.unitLaborNumber.toString() : '0';
        this.unitLaborNumberControl.setValue(unitLaborNumber);

        /*T???t validator ki???m tra Chi???t kh???u*/
        this.discountValueProductControl.setValidators(null);
        this.discountValueProductControl.updateValueAndValidity();
        /*End*/

        //G??n gi?? tr??? l???i cho c??c bi???n l??u s??? th??nh ti???n
        this.calculatorAmountProduct();

        // set l???i gi?? tr??? ti???n h??ng khi ch???nh s???a do ti???n h??ng c?? th??? ch???nh s???a
        this.moneyForGoodsControl.setValue(this.billSaleDetailModel.moneyForGoods);

      } else if (this.selectedOrderDetailType == 1) {

        // dien giai
        let description = this.billSaleDetailModel.description != null ? this.billSaleDetailModel.description.trim() : '';
        this.descriptionOCControl.setValue(description);

        // so luong
        this.quantityProductControl.setValue(this.billSaleDetailModel.quantity.toString());

        // don gia
        this.priceProductControl.setValue(this.billSaleDetailModel.unitPrice.toString());

        //don gi nhan cing 
        let unitLaborPrice = this.billSaleDetailModel.unitLaborPrice != null ? this.billSaleDetailModel.unitLaborPrice.toString() : '0';
        this.unitLaborPriceControl.setValue(unitLaborPrice);

        // so luong nhan cong
        let unitLaborNumber = this.billSaleDetailModel.unitLaborNumber != null ? this.billSaleDetailModel.unitLaborNumber.toString() : '0';
        this.unitLaborNumberControl.setValue(unitLaborNumber);

        // don vi tien
        this.unitMoneyProductControl.setValue(this.listUnitMoney.find(x => x.categoryId == this.billSaleDetailModel.currencyUnit));
        this.unitMoneyLabel = this.listUnitMoney.find(x => x.categoryId == this.billSaleDetailModel.currencyUnit).categoryCode;

        // don vi tinh
        let unitOC = this.billSaleDetailModel.incurredUnit != null ? this.billSaleDetailModel.incurredUnit.trim() : '';
        this.unitOCControl.setValue(unitOC);

        // ty gia
        let toSelectExchangeRate = this.billSaleDetailModel.exchangeRate != null ? this.billSaleDetailModel.exchangeRate.toString() : '1';
        this.exchangeRateProductControl.setValue(toSelectExchangeRate);

        // chiet khau theo sp/dv
        this.discountTypeProductControl.setValue(this.discountTypeList.find(x => x.value == this.billSaleDetailModel.discountType));

        // Chiet khau
        let discountValue = this.billSaleDetailModel.discountValue != null ? this.billSaleDetailModel.discountValue.toString() : '0';
        this.discountValueProductControl.setValue(discountValue);

        // thue GTGT
        let toSelectVat = this.billSaleDetailModel.vat != null ? this.billSaleDetailModel.vat.toString() : '0';
        this.vatProductControl.setValue(toSelectVat);

        // tg bao hanh
        let guaranteeTime = this.billSaleDetailModel.guaranteeTime != null ? this.billSaleDetailModel.guaranteeTime.toString() : '0';
        this.warrantyPeriodControl.setValue(guaranteeTime);

        /*T???t validator ki???m tra Chi???t kh???u*/
        this.discountValueProductControl.setValidators(null);
        this.discountValueProductControl.updateValueAndValidity();
        /*End*/
        //g??n gi?? tr??? m???c ?????nh cho ????n v??? ti???n
        let toSelectUnitMoneyOC = this.listUnitMoney.find(x => x.categoryId == this.billSaleDetailModel.currencyUnit);
        this.unitMoneyOCLabel = toSelectUnitMoneyOC.categoryCode;

        //G??n gi?? tr??? l???i cho c??c bi???n l??u s??? th??nh ti???n
        this.calculatorAmountProduct();
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
  changeProduct(product: Product) {
    /*reset v?? setValue c??c control c??n l???i*/
    this.unitProductControl.setValue('');
    this.vendorControl.reset();
    this.listVendor = [];
    this.quantityProductControl.setValue('0');
    this.priceProductControl.setValue('0');
    this.unitMoneyProductControl.setValue(this.listUnitMoney.find(x => x.isDefault == true));
    this.exchangeRateProductControl.setValue('1');
    this.unitMoneyLabel = this.listUnitMoney.find(x => x.isDefault == true).categoryCode;
    this.amountProduct = 0;
    this.nameProductControl.setValue(this.productControl.value == null ? null : this.productControl.value.productName);
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
    /*End*/

    if (product) {
      //L???y ????n v??? t??nh
      let productUnitId = product.productUnitId;
      let productUnitName = "";
      let productUnit = this.listUnitProduct.find(x => x.categoryId == productUnitId)
      if (productUnit) {
        productUnitName = productUnit.categoryName
      }
      this.unitProductControl.setValue(productUnitName);
      //L???y list nh?? cung c???p
      this.customerOrderService.getVendorByProductId(product.productId, this.customerGroupId, convertToUTCTime(new Date())).subscribe(response => {
        let result: any = response;
        if (result.statusCode == 200) {
          this.listVendor = result.listVendor;
          this.listObjectAttrNameProduct = result.listObjectAttributeNameProduct;
          this.listObjectAttrValueProduct = result.listObjectAttributeValueProduct;
          this.priceProductControl.setValue(result.priceProduct);
          /*Nh??m c??c thu???c t??nh c???a s???n ph???m l???i*/
          this.listObjectAttrNameProduct.forEach(objectAttrName => {
            let objectGroup: GroupAttrProduct = {
              AttrName: {
                productAttributeCategoryId: '',
                productAttributeCategoryName: ''
              },
              AttrValue: [],
              SelectedAttrValue: null
            };
            objectGroup.AttrName = objectAttrName;
            objectGroup.AttrValue = this.listObjectAttrValueProduct.filter(x => x.productAttributeCategoryId == objectAttrName.productAttributeCategoryId);
            this.listAttrProduct.push(objectGroup);
          });
          /*End*/

          /*N???u listVendor ch??? c?? 1 gi?? tr??? duy nh???t th?? l???y lu??n gi?? tr??? ???? l??m default value*/
          if (this.listVendor.length == 1) {
            let toSelectVendor = this.listVendor[0];
            this.vendorControl.setValue(toSelectVendor);
          }
          /*End*/
        } else {
          let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });

      //set gi?? tr??? cho ????n gi?? n???u s???n ph???m c?? gi?? tr??? ????n gi??(price1)
      if (product.price1 != null) {
        this.priceProductControl.setValue(product.price1.toString());
      }

    }
  }
  /*End*/

  /*Event khi thay ?????i S??? l?????ng*/
  changeQuantityProduct() {
    let quantity = this.quantityProductControl.value;
    if (!quantity) {
      this.quantityProductControl.setValue('0');
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
  changeUnitMoneyProduct(unitMoney: Category) {
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

    /*T??nh th??nh ti???n nh??n c??ng*/
    let unitLaborPrice = parseFloat(this.unitLaborPriceControl.value.replace(/,/g, ''));
    let unitLaborNumber = parseFloat(this.unitLaborNumberControl.value.replace(/,/g, ''));
    this.sumAmountLabor = unitLaborNumber * unitLaborPrice * exchangeRate;
    /*End*/

    this.amountProduct = this.roundNumber((quantity * price * exchangeRate), parseInt(this.defaultNumberType, 10));

    if (discountType.code == 'PT') {
      this.amountDiscountProduct = this.roundNumber(((((quantity * price * exchangeRate) + this.sumAmountLabor) * discountValue) / 100), parseInt(this.defaultNumberType, 10));
      this.amountVatProduct = this.roundNumber((((quantity * price * exchangeRate) + this.sumAmountLabor - this.amountDiscountProduct) * vat) / 100, parseInt(this.defaultNumberType, 10));

      /*T???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators(null);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    } else if (discountType.code == 'ST') {
      this.amountDiscountProduct = discountValue;
      this.amountVatProduct = this.roundNumber((((quantity * price * exchangeRate) + this.sumAmountLabor - this.amountDiscountProduct) * vat) / 100, parseInt(this.defaultNumberType, 10));

      /*B???t validator ki???m tra Chi???t kh???u*/
      this.discountValueProductControl.setValidators([compareNumberValidator(this.amountProduct)]);
      this.discountValueProductControl.updateValueAndValidity();
      /*End*/
    }

    this.moneyForGoodsControl.setValue(this.roundNumber(((quantity * price * exchangeRate) + this.sumAmountLabor - this.amountDiscountProduct + this.amountVatProduct), parseInt(this.defaultNumberType, 10)));
    this.amountProduct = this.roundNumber(((quantity * price * exchangeRate) + this.sumAmountLabor - this.amountDiscountProduct + this.amountVatProduct), parseInt(this.defaultNumberType, 10));
  }
  /*End*/

  /*Event thay ?????i s??? l?????ng (OC)*/
  // changeQuantityOC() {
  //   let quantity = this.quantityOCControl.value;
  //   if (!quantity) {
  //     this.quantityOCControl.setValue('0');
  //   }

  //   this.calculatorAmountOC();
  // }
  /*End*/

  /*Event thay ?????i ????n gi?? (OC)*/
  // changePriceOC() {
  //   let price = this.priceOCControl.value;
  //   if (!price) {
  //     this.priceOCControl.setValue('0');
  //   }

  //   this.calculatorAmountOC();
  // }
  /*End*/

  /*Event thay ?????i ????n v??? ti???n (OC)*/
  // changeUnitMoneyOC(unitMoney: Category) {
  //   this.unitMoneyOCLabel = unitMoney.categoryCode;
  //   this.exchangeRateOCControl.setValue('1');

  //   this.calculatorAmountOC();
  // }
  /*End*/

  /*Event thay ?????i t??? gi?? (OC)*/
  // changeExchangeRateOC() {
  //   let exchangeRate = this.exchangeRateOCControl.value;
  //   if (!exchangeRate) {
  //     this.exchangeRateOCControl.setValue('1');
  //   } else {
  //     exchangeRate = parseFloat(this.exchangeRateOCControl.value.replace(/,/g, ''));
  //     if (exchangeRate == 0) {
  //       this.exchangeRateOCControl.setValue('1');
  //     }
  //   }

  //   this.calculatorAmountOC();
  // }
  /*End*/

  /*Event thay ?????i gi?? tr??? thu??? VAT (OC)*/
  // changeVatOC() {
  //   let vat = this.vatOCControl.value;
  //   if (!vat) {
  //     this.vatOCControl.setValue('0');
  //   } else {
  //     vat = parseFloat(this.vatOCControl.value.replace(/,/g, ''));
  //     if (vat > 100) {
  //       this.vatOCControl.setValue('100');
  //     }
  //   }

  //   this.calculatorAmountOC();
  // }
  /*End*/

  // changeDiscountTypeOC(discountType: DiscountType) {
  //   this.discountValueOCControl.setValue('0');

  //   if (discountType.code == 'PT') {
  //     /*T???t validator ki???m tra Chi???t kh???u*/
  //     this.discountValueOCControl.setValidators(null);
  //     this.discountValueOCControl.updateValueAndValidity();
  //     /*End*/
  //   }

  //   this.calculatorAmountOC();
  // }

  // changeDiscountValueOC() {
  //   let discountValue = 0;
  //   if (this.discountValueOCControl.value.trim() == '') {
  //     discountValue = 0;
  //     this.discountValueOCControl.setValue('0');
  //   } else {
  //     discountValue = parseFloat(this.discountValueOCControl.value.replace(/,/g, ''));
  //   }

  //   let discountType: DiscountType = this.discountTypeOCControl.value;
  //   if (discountType.code == 'PT') {
  //     if (discountValue > 100) {
  //       discountValue = 100;
  //       this.discountValueOCControl.setValue('100');
  //     }

  //     /*T???t validator ki???m tra Chi???t kh???u*/
  //     this.discountValueOCControl.setValidators(null);
  //     this.discountValueOCControl.updateValueAndValidity();
  //     /*End*/
  //   } else if (discountType.code == 'ST') {
  //     /*B???t validator ki???m tra Chi???t kh???u*/
  //     this.discountValueOCControl.setValidators([compareNumberValidator(this.amountOC)]);
  //     this.discountValueOCControl.updateValueAndValidity();
  //     /*End*/
  //   }

  //   this.calculatorAmountOC();
  // }

  // calculatorAmountOC() {
  //   let quantity: number = parseFloat(this.quantityOCControl.value.replace(/,/g, ''));
  //   let price: number = parseFloat(this.priceOCControl.value.replace(/,/g, ''));
  //   let exchangeRate: number = parseFloat(this.exchangeRateOCControl.value.replace(/,/g, ''));
  //   let vat: number = parseFloat(this.vatOCControl.value.replace(/,/g, ''));
  //   let discountType: DiscountType = this.discountTypeOCControl.value;
  //   let discountValue: number = parseFloat(this.discountValueOCControl.value.replace(/,/g, ''));

  //   this.amountOC = this.roundNumber((quantity * price * exchangeRate), parseInt(this.defaultNumberType, 10));

  //   if (discountType.code == 'PT') {
  //     this.amountDiscountOC = this.roundNumber(((discountValue * quantity * price * exchangeRate) / 100), parseInt(this.defaultNumberType, 10));
  //     this.amountVatOC = this.roundNumber((((quantity * price * exchangeRate) - ((discountValue * quantity * price * exchangeRate) / 100)) * (vat / 100)), parseInt(this.defaultNumberType, 10));

  //     /*T???t validator ki???m tra Chi???t kh???u*/
  //     this.discountValueOCControl.setValidators(null);
  //     this.discountValueOCControl.updateValueAndValidity();
  //     /*End*/
  //   } else if (discountType.code == 'ST') {
  //     this.amountDiscountOC = discountValue;
  //     this.amountVatOC = this.roundNumber((((quantity * price * exchangeRate) - (discountValue)) * (vat / 100)), parseInt(this.defaultNumberType, 10));

  //     /*B???t validator ki???m tra Chi???t kh???u*/
  //     this.discountValueOCControl.setValidators([compareNumberValidator(this.amountOC)]);
  //     this.discountValueOCControl.updateValueAndValidity();
  //     /*End*/
  //   }
  // }

  /*Event H???y dialog*/
  cancel() {
    let result: ResultDialog = {
      status: false,  //H???y
      billSaleDetailModel: null
    };
    this.ref.close(result);
  }
  /*End*/

  /*Event L??u dialog*/
  save() {
    let result: ResultDialog = {
      status: true,  //L??u
      billSaleDetailModel: new BillSaleDetailModel()
    };

    if (this.selectedOrderDetailType == 0) {
      /*N???u l?? th??m S???n ph???m d???ch v???*/

      //T???ng s??? thu???c t??nh:
      let countTotalAttrProduct = this.listAttrProduct.length;
      //T???ng s??? thu???c t??nh ???? ??i???n gi?? tr???:
      let countCurrentAttrProduct = this.listAttrProduct.filter(x => x.SelectedAttrValue != null).length;
      //S??? l?????ng s???n ph???m
      let quantity = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));
      let priceInitialInp = parseFloat(this.priceInitialControl.value.replace(/,/g, ''));
      // ????n gi??
      let unitPrice = parseFloat(this.priceProductControl.value.replace(/,/g, ''));
      // Ti???n h??ng (VND)
      let amount = parseFloat(this.moneyForGoodsControl.value.replace(/,/g, ''));

      if (countCurrentAttrProduct < countTotalAttrProduct) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'B???n ph???i ch???n ?????y ????? thu???c t??nh cho s???n ph???m/d???ch v???' };
        this.showMessage(msg);
      } else if (!this.productForm.valid) {
        Object.keys(this.productForm.controls).forEach(key => {
          if (this.productForm.controls[key].valid == false) {
            this.productForm.controls[key].markAsTouched();
          }
        });
      } else if (quantity <= 0) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'B???n ch??a nh???p s??? l?????ng' };
        this.showMessage(msg);
      } else if (quantity > 999999) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? l?????ng kh??ng ???????c v?????t qu?? 999999' };
        this.showMessage(msg);
      } else if (unitPrice > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: '????n gi?? kh??ng ???????c v?????t qu?? 999,000,000,000 VND' };
        this.showMessage(msg);
      } else if (amount > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'Ti???n h??ng kh??ng ???????c v?????t qu?? 999,000,000,000 VND' };
        this.showMessage(msg);
      } else if (priceInitialInp <= 0 && this.IsPriceInitial) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'B???n ch??a nh???p gi?? v???n' };
        this.showMessage(msg);
      } else {
        let currencyUnit: Category = this.unitMoneyProductControl.value
        result.billSaleDetailModel.currencyUnit = currencyUnit.categoryId; //????n v??? ti???n

        result.billSaleDetailModel.description = '';
        let discountType: DiscountType = this.discountTypeProductControl.value;
        result.billSaleDetailModel.discountType = discountType.value;  //Lo???i chi???t kh???u

        let discountValue = parseFloat(this.discountValueProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.discountValue = discountValue;  //G??a tr??? chi???t kh???u

        let exchangeRate = parseFloat(this.exchangeRateProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.exchangeRate = exchangeRate;  //T??? gi??

        let unitLaborPrice = parseFloat(this.unitLaborPriceControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.unitLaborPrice = unitLaborPrice;  //????n gi?? nh??n c??ng

        let unitLaborNumber = parseFloat(this.unitLaborNumberControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.unitLaborNumber = unitLaborNumber;  //S??? l?????ng nh??n c??ng

        result.billSaleDetailModel.sumAmountLabor = this.sumAmountLabor; //Th??nh ti???n nh??n c??ng

        let product: Product = this.productControl.value;
        let productAllAttrName: string = '';
        if (this.listAttrProduct.length > 0) {
          this.listAttrProduct.forEach(item => {
            productAllAttrName += item.SelectedAttrValue.productAttributeCategoryValue + ';'
          });
          productAllAttrName = '(' + productAllAttrName + ')';
        }
        result.billSaleDetailModel.productName = this.nameProductControl.value;
        result.billSaleDetailModel.explainStr = this.nameProductControl.value;

        result.billSaleDetailModel.incurredUnit = 'CCCCC';
        let vendor: Vendor = this.vendorControl.value;
        if (vendor !== null && vendor !== undefined) {
          result.billSaleDetailModel.vendorName = vendor.vendorCode + ' - ' + vendor.vendorName;
          result.billSaleDetailModel.vendorId = vendor.vendorId;
        }
        result.billSaleDetailModel.orderDetailType = this.selectedOrderDetailType;
        result.billSaleDetailModel.productId = product.productId;
        result.billSaleDetailModel.unitName = this.unitProductControl.value;
        result.billSaleDetailModel.quantity = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.moneyForGoods = parseFloat(this.moneyForGoodsControl.value.replace(/,/g, ''));

        result.billSaleDetailModel.listBillSaleDetailProductAttribute = [];
        let listObjectSelectedProductAttr = this.listAttrProduct.map(x => x.SelectedAttrValue);
        listObjectSelectedProductAttr.forEach(item => {
          var option = new BillSaleDetailProductAttributeModel();
          option.productId = product.productId;
          option.productAttributeCategoryId = item.productAttributeCategoryId;
          option.productAttributeCategoryValueId = item.productAttributeCategoryValueId;

          result.billSaleDetailModel.listBillSaleDetailProductAttribute.push(option);
        });

        result.billSaleDetailModel.unitId = product.productUnitId;
        result.billSaleDetailModel.productCode = product.productCode;
        result.billSaleDetailModel.unitPrice = parseFloat(this.priceProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.vat = parseFloat(this.vatProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.warehouseId = this.warehouseIdControl.value ? this.warehouseIdControl.value.warehouseId : null;
        result.billSaleDetailModel.warehouseCode = this.warehouseIdControl.value ? this.warehouseIdControl.value.warehouseCode : null;
        result.billSaleDetailModel.actualInventory = this.actualInventoryControl.value ? parseFloat(this.actualInventoryControl.value.replace(/,/g, '')) : null;
        result.billSaleDetailModel.businessInventory = this.businessInventoryControl.value ? parseFloat(this.businessInventoryControl.value.replace(/,/g, '')) : null;

        //reset Form Chi ph?? kh??c
        this.resetOtherCostsForm();

        //N???u l?? s???a th?? g??n l???i gi?? tr??? s???p x???p
        if (!this.isCreate) {
          result.billSaleDetailModel.orderNumber = this.billSaleDetailModel.orderNumber;
        }

        this.ref.close(result);
      }
    } else if (this.selectedOrderDetailType == 1) {
      /*N???u l?? th??m Chi ph?? kh??c*/

      //S??? l?????ng
      let quantity = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));
      // ????n gi??
      let unitPrice = parseFloat(this.priceProductControl.value.replace(/,/g, ''));

      if (!this.otherCostsForm.valid) {
        Object.keys(this.otherCostsForm.controls).forEach(key => {
          if (this.otherCostsForm.controls[key].valid == false) {
            this.otherCostsForm.controls[key].markAsTouched();
          }
        });
      } else if (quantity <= 0) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'B???n ch??a nh???p s??? l?????ng' };
        this.showMessage(msg);
      } else if (quantity > 999999) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? l?????ng kh??ng ???????c v?????t qu?? 999,999' };
        this.showMessage(msg);
      } else if (unitPrice > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'S??? l?????ng kh??ng ???????c v?????t qu?? 999,000,000,000 VND' };
        this.showMessage(msg);
      } else if (this.amountOC > 999000000000) {
        let msg = { key: 'popup', severity: 'error', summary: 'Th??ng b??o:', detail: 'Th??nh ti???n (VND) kh??ng ???????c v?????t qu?? 999,000,000,000 VND' };
        this.showMessage(msg);
      } else {

        let currencyUnit: Category = this.unitMoneyProductControl.value
        result.billSaleDetailModel.currencyUnit = currencyUnit.categoryId; //????n v??? ti???n
        result.billSaleDetailModel.description = this.descriptionOCControl.value.trim();

        let discountType: DiscountType = this.discountTypeProductControl.value;
        result.billSaleDetailModel.discountType = discountType.value;  //Lo???i chi???t kh???u

        let discountValue = parseFloat(this.discountValueProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.discountValue = discountValue;  //G??a tr??? chi???t kh???u

        let exchangeRate = parseFloat(this.exchangeRateProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.exchangeRate = exchangeRate;  //T??? gi??

        let unitLaborPrice = parseFloat(this.unitLaborPriceControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.unitLaborPrice = unitLaborPrice;  //????n gi?? nh??n c??ng

        let unitLaborNumber = parseFloat(this.unitLaborNumberControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.unitLaborNumber = unitLaborNumber;  //S??? l?????ng nh??n c??ng

        result.billSaleDetailModel.sumAmountLabor = this.sumAmountLabor; //Th??nh ti???n nh??n c??ng

        result.billSaleDetailModel.explainStr = result.billSaleDetailModel.description;
        result.billSaleDetailModel.incurredUnit = this.unitOCControl.value != null ? this.unitOCControl.value.trim() : '';
        result.billSaleDetailModel.vendorName = "";
        result.billSaleDetailModel.orderDetailType = this.selectedOrderDetailType;
        result.billSaleDetailModel.productId = null;
        result.billSaleDetailModel.unitName = "";
        result.billSaleDetailModel.quantity = parseFloat(this.quantityProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.listBillSaleDetailProductAttribute = [];
        result.billSaleDetailModel.moneyForGoods = this.roundNumber((this.amountOC + this.amountVatOC - this.amountDiscountOC), 2);
        result.billSaleDetailModel.unitId = null;
        result.billSaleDetailModel.unitPrice = parseFloat(this.priceProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.vat = parseFloat(this.vatProductControl.value.replace(/,/g, ''));
        result.billSaleDetailModel.vendorId = null;
        result.billSaleDetailModel.warehouseId = null;
        result.billSaleDetailModel.actualInventory = 0;
        result.billSaleDetailModel.businessInventory = 0;
        result.billSaleDetailModel.guaranteeTime = parseFloat(this.warrantyPeriodControl.value.replace(/,/g, ''));

        //reset Form S???n ph???m d???ch v???
        this.resetProductForm();

        //N???u l?? s???a th?? g??n l???i gi?? tr??? s???p x???p
        if (!this.isCreate) {
          result.billSaleDetailModel.orderNumber = this.billSaleDetailModel.orderNumber;
        }

        this.ref.close(result);
      }
    }
  }
  /*End*/

  /*Reset form chi ph?? kh??c*/
  resetOtherCostsForm() {
    this.descriptionOCControl.reset();
    this.unitOCControl.setValue('');
    this.quantityProductControl.setValue('0');
    this.priceProductControl.setValue('0');
    this.exchangeRateProductControl.setValue('1');
    this.vatProductControl.setValue('0');
    this.discountTypeProductControl.setValue(null);
    this.discountValueProductControl.setValue('0');
    /*T???t validator ki???m tra Chi???t kh???u*/
    this.discountValueProductControl.setValidators(null);
    this.discountValueProductControl.updateValueAndValidity();
    /*End*/

    //g??n gi?? tr??? m???c ?????nh cho ????n v??? ti???n
    let toSelectUnitMoneyOC = this.listUnitMoney.find(x => x.isDefault == true);
    this.unitMoneyProductControl.setValue(toSelectUnitMoneyOC);
    this.unitMoneyOCLabel = toSelectUnitMoneyOC.categoryCode;

    //g??n gi?? tr??? m???c ?????nh cho lo???i chi???t kh???u
    let toSelectDiscountTypeOC = this.discountTypeList.find(x => x.code == 'PT');
    this.discountTypeProductControl.setValue(toSelectDiscountTypeOC);

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
    this.vendorControl.reset();
    this.listVendor = [];
    this.quantityProductControl.setValue('0');
    this.priceProductControl.setValue('0');
    this.unitMoneyProductControl.setValue(this.listUnitMoney.find(x => x.isDefault == true));
    this.exchangeRateProductControl.setValue('0');
    // this.guaranteeTimeProductControl.setValue(null);
    this.guaranteeDatetime = null;
    this.expirationDateProductControl.setValue(null);
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

  /* M??? popup T???o nhanh s???n ph???m */
  openQuickCreProductDialog() {
    let ref = this.dialogService.open(QuickCreateProductComponent, {
      data: {},
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
        let newProduct: Product = result.newProduct;
        newProduct.name = newProduct.productCodeName
        this.listProduct = [newProduct, ...this.listProduct];
        this.productControl.setValue(newProduct ? newProduct : null);
        this.changeProduct(newProduct ? newProduct : null);
      }
    });
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

  /*Thay ?????i ????n gi?? nh??n c??ng*/
  changeUnitLaborPrice() {
    let price = this.unitLaborPriceControl.value;

    if (price == '') {
      this.unitLaborPriceControl.setValue('0');
    }

    let number = this.unitLaborNumberControl.value;

    if (number == '') {
      this.unitLaborNumberControl.setValue('0');
    }

    this.calculatorAmountProduct();
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

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};