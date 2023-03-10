import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
// import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { PopupComponent } from '../../../shared/components/popup/popup.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxLoadingComponent, ngxLoadingAnimationTypes } from 'ngx-loading';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

//ADAPTER Date: dd/mm/yyyy
import { AppDateAdapter, APP_DATE_FORMATS } from '../../../shared/adapter/date.adapter';

//MODELS
import { CustomerCareModel } from '../../models/customer-care.model';
import { CustomerCareFeedBack } from '../../models/customer-care-feed-back.model';

//SEVICES
import { CustomerService } from "../../services/customer.service";
import { EmployeeService } from "../../../employee/services/employee.service";
import { CategoryService } from '../../../shared/services/category.service';
import { ProductService } from '../../../product/services/product.service';
import { QuoteService } from '../../services/quote.service';
import { CustomerCareService } from '../../services/customer-care.service';

//DIALOG COMPONENT
import { SuccessComponent } from '../../../shared/toast/success/success.component';
import { FailComponent } from '../../../shared/toast/fail/fail.component';
import { TemplateEmailDialogComponent } from '../template-email-dialog/template-email-dialog.component';
import { TemplateSmsDialogComponent } from '../template-sms-dialog/template-sms-dialog.component';
import { GetPermission } from '../../../shared/permission/get-permission';
import { WarningComponent } from '../../../shared/toast/warning/warning.component';

import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ForderConfigurationService } from '../../../admin/components/folder-configuration/services/folder-configuration.service';

const ELEMENT_CRITERIA = [
  {
    criteriaId: 1,
    criteriaName: 'Lo???i kh??ch h??ng',
    field: 'CustomerType'
  },
  {
    criteriaId: 2,
    criteriaName: '????? tu???i',
    field: 'Age'
  },
  {
    criteriaId: 3,
    criteriaName: 'Gi???i t??nh',
    field: 'Gender'
  },
  // {
  //   criteriaId: 4,
  //   criteriaName: 'Doanh thu',
  //   field: 'TotalSaleValue'
  // },
  {
    criteriaId: 5,
    criteriaName: 'S???n ph???m',
    field: 'ProductId'
  },
  // {
  //   criteriaId: 6,
  //   criteriaName: 'S??? ??i???m hi???n c??',
  //   field: 'Point'
  // },
  {
    criteriaId: 7,
    criteriaName: 'Ng??y sinh nh???t',
    field: 'BirthDay'
  },
  {
    criteriaId: 8,
    criteriaName: 'Nh??m kh??ch h??ng',
    field: 'CustomerGroupId'
  },
];

const ELEMENT_CONDITION_GROUP = [
  {
    conditionId: 1,
    conditionName: 'B???ng',
    criteriaId: 1,
    operator: '='
  },
  {
    conditionId: 2,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 1,
    operator: '!='
  }
];

const ELEMENT_CONDITION_AGE = [
  {
    conditionId: 3,
    conditionName: 'B???ng',
    criteriaId: 2,
    operator: '='
  },
  {
    conditionId: 4,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 2,
    operator: '!='
  },
  {
    conditionId: 5,
    conditionName: 'L???n h??n',
    criteriaId: 2,
    operator: '>'
  },
  {
    conditionId: 6,
    conditionName: 'Nh??? h??n',
    criteriaId: 2,
    operator: '<'
  },
  {
    conditionId: 7,
    conditionName: 'Trong kho???ng',
    criteriaId: 2,
    operator: '<>'
  }
];

const ELEMENT_CONDITION_SEX = [
  {
    conditionId: 8,
    conditionName: 'B???ng',
    criteriaId: 3,
    operator: '='
  },
  {
    conditionId: 9,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 3,
    operator: '!='
  }
];

const ELEMENT_CONDITION_REVENUE = [
  {
    conditionId: 10,
    conditionName: 'B???ng',
    criteriaId: 4,
    operator: '='
  },
  {
    conditionId: 11,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 4,
    operator: '!='
  },
  {
    conditionId: 12,
    conditionName: 'L???n h??n',
    criteriaId: 4,
    operator: '>'
  },
  {
    conditionId: 13,
    conditionName: 'Nh??? h??n',
    criteriaId: 4,
    operator: '<'
  },
  {
    conditionId: 14,
    conditionName: 'Trong kho???ng',
    criteriaId: 4,
    operator: '<>'
  },
  // {
  //   conditionId: 15,
  //   conditionName: 'Ph??t sinh trong kho???ng',
  //   criteriaId: 4,
  //   operator: '<>'
  // },
  // {
  //   conditionId: 16,
  //   conditionName: 'Kh??ng ph??t sinh trong kho???ng',
  //   criteriaId: 4,
  //   operator: '<>'
  // }
];

const ELEMENT_CONDITION_PRODUCT = [
  {
    conditionId: 17,
    conditionName: 'Bao g???m',
    criteriaId: 5,
    operator: 'in'
  }
];

const ELEMENT_CONDITION_POINT = [
  {
    conditionId: 18,
    conditionName: 'B???ng',
    criteriaId: 6,
    operator: '='
  },
  {
    conditionId: 19,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 6,
    operator: '!='
  },
  {
    conditionId: 20,
    conditionName: 'L???n h??n',
    criteriaId: 6,
    operator: '>'
  },
  {
    conditionId: 21,
    conditionName: 'Nh??? h??n',
    criteriaId: 6,
    operator: '<'
  },
  {
    conditionId: 22,
    conditionName: 'Trong kho???ng',
    criteriaId: 6,
    operator: '<>'
  }
];

const ELEMENT_CONDITION_BIRTHDAY = [
  {
    conditionId: 23,
    conditionName: 'Trong th??ng',
    criteriaId: 7,
    operator: '='
  }
];

const ELEMENT_CONDITION_CUSTOMER_GROUP = [
  {
    conditionId: 24,
    conditionName: 'B???ng',
    criteriaId: 8,
    operator: '='
  }
];

const ELEMENT_CONDITION_CREATEDDATE = [
  {
    conditionId: 25,
    conditionName: 'Trong ng??y',
    criteriaId: 9,
    operator: '='
  }
];

const ELEMENT_ALL_CONDITIONS = [
  {
    conditionId: 1,
    conditionName: 'B???ng',
    criteriaId: 1,
    operator: '='
  },
  {
    conditionId: 2,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 1,
    operator: '!='
  },
  {
    conditionId: 3,
    conditionName: 'B???ng',
    criteriaId: 2,
    operator: '='
  },
  {
    conditionId: 4,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 2,
    operator: '!='
  },
  {
    conditionId: 5,
    conditionName: 'L???n h??n',
    criteriaId: 2,
    operator: '>'
  },
  {
    conditionId: 6,
    conditionName: 'Nh??? h??n',
    criteriaId: 2,
    operator: '<'
  },
  {
    conditionId: 7,
    conditionName: 'Trong kho???ng',
    criteriaId: 2,
    operator: '<>'
  },
  {
    conditionId: 8,
    conditionName: 'B???ng',
    criteriaId: 3,
    operator: '='
  },
  {
    conditionId: 9,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 3,
    operator: '!='
  },
  {
    conditionId: 10,
    conditionName: 'B???ng',
    criteriaId: 4,
    operator: '='
  },
  {
    conditionId: 11,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 4,
    operator: '!='
  },
  {
    conditionId: 12,
    conditionName: 'L???n h??n',
    criteriaId: 4,
    operator: '>'
  },
  {
    conditionId: 13,
    conditionName: 'Nh??? h??n',
    criteriaId: 4,
    operator: '<'
  },
  {
    conditionId: 14,
    conditionName: 'Trong kho???ng',
    criteriaId: 4,
    operator: '<>'
  },
  {
    conditionId: 15,
    conditionName: 'Ph??t sinh trong kho???ng',
    criteriaId: 4,
    operator: '<<>>'
  },
  {
    conditionId: 16,
    conditionName: 'Kh??ng ph??t sinh trong kho???ng',
    criteriaId: 4,
    operator: '><'
  },
  {
    conditionId: 17,
    conditionName: 'Bao g???m',
    criteriaId: 5,
    operator: 'in'
  },
  {
    conditionId: 18,
    conditionName: 'B???ng',
    criteriaId: 6,
    operator: '='
  },
  {
    conditionId: 19,
    conditionName: 'Kh??ng b???ng',
    criteriaId: 6,
    operator: '!='
  },
  {
    conditionId: 20,
    conditionName: 'L???n h??n',
    criteriaId: 6,
    operator: '>'
  },
  {
    conditionId: 21,
    conditionName: 'Nh??? h??n',
    criteriaId: 6,
    operator: '<'
  },
  {
    conditionId: 22,
    conditionName: 'Trong kho???ng',
    criteriaId: 6,
    operator: '<>'
  },
  {
    conditionId: 23,
    conditionName: 'Trong th??ng',
    criteriaId: 7,
    operator: '='
  },
  {
    conditionId: 24,
    conditionName: 'B???ng',
    criteriaId: 8,
    operator: '='
  },
  // {
  //   conditionId: 25,
  //   conditionName: 'Trong ng??y',
  //   criteriaId: 9,
  //   operator: '='
  // },
];

const ELEMENT_VALUE_GROUP = [
  {
    valueGroupId: 1,
    valueGroupName: "Doanh nghi???p"
  },
  {
    valueGroupId: 2,
    valueGroupName: "C?? nh??n"
  },
  // {
  //   valueGroupId: 3,
  //   valueGroupName: "H??? kinh doanh c?? th???"
  // }
];

const ELEMENT_VALUE_SEX = [
  {
    valueSexId: "NAM",
    valueSexName: "Nam"
  },
  {
    valueSexId: "NU",
    valueSexName: "N???"
  }
];

const ELEMENT_VALUE_BIRTHDAY = [
  {
    valueBirthDayId: 1,
    valueBirthDayName: "1"
  },
  {
    valueBirthDayId: 2,
    valueBirthDayName: "2"
  },
  {
    valueBirthDayId: 3,
    valueBirthDayName: "3"
  },
  {
    valueBirthDayId: 4,
    valueBirthDayName: "4"
  },
  {
    valueBirthDayId: 5,
    valueBirthDayName: "5"
  },
  {
    valueBirthDayId: 6,
    valueBirthDayName: "6"
  },
  {
    valueBirthDayId: 7,
    valueBirthDayName: "7"
  },
  {
    valueBirthDayId: 8,
    valueBirthDayName: "8"
  },
  {
    valueBirthDayId: 9,
    valueBirthDayName: "9"
  },
  {
    valueBirthDayId: 10,
    valueBirthDayName: "10"
  },
  {
    valueBirthDayId: 11,
    valueBirthDayName: "11"
  },
  {
    valueBirthDayId: 12,
    valueBirthDayName: "12"
  }
];

const ELEMENT_CUSTOMER_PER = [
  {
    categoryId: 0,
    categoryName: "-- Kh??ng ch???n --"
  },
  {
    categoryId: 2,
    categoryName: "Kh??ch h??ng c?? nh??n"
  }
];

const ELEMENT_CUSTOMER_ENTERPRISE = [
  {
    categoryId: 0,
    categoryName: "-- Kh??ng ch???n --"
  },
  {
    categoryId: 1,
    categoryName: "Kh??ch h??ng doanh nghi???p"
  }
];

const ELEMENT_CUSTOMER_TYPE = [
  {
    categoryId: 1,
    categoryName: "Kh??ch h??ng doanh nghi???p"
  },
  {
    categoryId: 2,
    categoryName: "Kh??ch h??ng c?? nh??n"
  }
];

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
}

class FileUploadModel {
  FileInFolder: FileInFolder;
  FileSave: File;
}

@Component({
  selector: 'app-customer-care-create',
  templateUrl: './customer-care-create.component.html',
  styleUrls: ['./customer-care-create.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class CustomerCareCreateComponent implements OnInit {
  // Loading config
  @ViewChild('ngxLoading') ngxLoadingComponent: NgxLoadingComponent;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  loadingConfig: any = {
    'animationType': ngxLoadingAnimationTypes.circle,
    'backdropBackgroundColour': 'rgba(0,0,0,0.1)',
    'backdropBorderRadius': '4px',
    'primaryColour': '#ffffff',
    'secondaryColour': '#999999',
    'tertiaryColour': '#ffffff'
  }
  loading: boolean = false;

  isManager: boolean = null;
  employeeId: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem('auth'));
  userId = this.auth.UserId;
  step: number = 1;

  isSkip: boolean = false;

  /* Action*/
  actionAdd: boolean = true;
  /*END*/

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  /*Hi???n th??? l???i m???t list b??? l???c ???? ???????c l??u*/
  reShowListFilters: boolean = false;
  dataTest: Array<any> = [
    { criteriaId: 1, conditionId: 1, valueGroupId: 2 },
    { criteriaId: 2, conditionId: 7, valueAgeFirst: 22, valueAgeLast: 60 },
    { criteriaId: 3, conditionId: 8, valueSexId: "NAM" },
    { criteriaId: 4, conditionId: 14, valueRevenueFirst: 19000000, valueRevenueLast: 50000000 },
    {
      criteriaId: 5,
      conditionId: 17,
      listProducts: [
        { productId: 'd897b3e9-8a58-4abc-9c46-60e01f58d0e4', productName: "Kh???i nghi???p s??ng t???o" },
        { productId: '0f60c80a-e9e9-4f16-a121-8e0531e69849', productName: "Laptop" }
      ]
    },
    { criteriaId: 6, conditionId: 19, valuePoint: 5000 },
    { criteriaId: 4, conditionId: 15, valueDateRevenueFirst: new Date(), valueDateRevenueLast: new Date("09/01/2019") }
  ];
  /*End*/

  filterForm: FormGroup;
  rowFilterList: FormArray;

  /*Popup*/
  dialogPopup: MatDialogRef<PopupComponent>;
  /*End*/

  /*Flag show/hidden form controls for value*/
  listConditionForm: Array<number> = [];
  listValueAgeForm: Array<number> = [];
  listValueGroupForm: Array<number> = [];
  listValueAgeComboForm: Array<number> = [];
  listValueSexForm: Array<number> = [];
  listValueRevenueForm: Array<number> = [];
  listValueRevenueComboForm: Array<number> = [];
  listValueDateRevenueComboForm: Array<number> = [];
  listValueProductForm: Array<number> = [];
  listValuePointForm: Array<number> = [];
  listValuePointComboForm: Array<number> = [];
  listValueBirthDayForm: Array<number> = [];
  listValueCustomerGroupForm: Array<number> = [];
  listValueSendMailForm: Array<number> = [];
  listValueNotSendMailForm: Array<number> = [];
  /*End*/

  listParentCriteria: Array<any> = [];  //Lo???i kh??ch h??ng
  listCriteria: Array<any> = [];

  listParentCondition: Array<any> = [];
  listCondition: Array<any> = [];

  listParentGroup: Array<any> = [];
  listGroup: Array<any> = [];

  listParentSex: Array<any> = [];
  listSex: Array<any> = [];

  //setting for filter: product
  listDropdownList: Array<any> = [];
  listProducts: Array<any> = [];
  selectedItems: Array<any> = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'productId',
    textField: 'productName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  listParentBirthDay: Array<any> = [];
  listBirthDay: Array<any> = [];

  listParentCustomerGroup: Array<any> = []; //Nh??m kh??ch h??ng
  listCustomerGroup: Array<any> = [];

  //data
  listFilterModel: Array<any> = [];

  //total of index
  index: number = 0;

  /*RESULT FILTERED CUSTOMER*/
  resultFilteredCustomer: number = 0;
  listDataUser: Array<any> = [];
  displayedColumns: string[] = ['action', 'customerName', 'dateOfBirth', 'customerEmail', 'customerPhone', 'picName'];
  dataSource = new MatTableDataSource(this.listDataUser);
  pageSizeOptions = [5, 10, 15, 100];
  masterCheck: boolean = true;
  isNoData: number = 1;
  msgNoData: number = 1;

  sort: any;
  paginator: any;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  /*END*/

  /*T???O CH????NG TR??NH CH??M S??C KH??CH H??NG*/
  name: string = "{{name}}";
  hotline: string = "{{hotline}}";
  address: string = "{{address}}";

  listCustomerId: Array<string> = [];

  //Config editor
  editorConfig: any = {
    'editable': true,
    'height': '220px',
    'minHeight': '220px',
    'width': 'auto',
    'minWidth': '0',
    'translate': 'yes',
    'enableToolbar': true,
    'showToolbar': true,
    'toolbar': [
      ['bold', 'italic', 'underline'],
      ['fontName', 'fontSize', 'color'],
      ['justifyLeft', 'justifyCenter', 'justifyRight'],
      ['link', 'unlink'],
    ]
  };

  customerCareModel = new CustomerCareModel();

  listEmployeeCharge: Array<any> = [];
  listCustomerCareContactType: Array<any> = [];
  listStatusId: Array<any> = [];
  listGiftTypeId1: Array<any> = [];
  listGiftTypeId2: Array<any> = [];
  list_customer_types: Array<any> = [];

  filteredSeller: Observable<string[]>; //list nh??n ph??? tr??ch

  isSendSMS: boolean = false;
  isSendEmail: boolean = false;
  isSendGift: boolean = false;
  isSendPhone: boolean = false;
  isFaceToFace: boolean = false;

  isSendEmailAt: boolean = false;
  isSendSMSAt: boolean = false;

  isShowOptionsGiftType1: boolean = true;
  isShowOptionsGiftType2: boolean = true;
  isHasValueCustomerType: boolean = true; //Flag: B??o l???i ph???i ch???n ??t nh???t m???t lo???i kh??ch h??ng

  listDefaultIdCusPer: Array<any> = [];
  listDefaultIdCusEnterprise: Array<any> = [];
  SelectedTypeCustomer: Array<any> = [];
  customerType: Array<any> = [];

  tinhTrangEmail: Array<any> = [
    { name: 'C?? Email', value: 1 },
    { name: 'Kh??ng c?? Email', value: 2 },
  ];
  SelectedTinhTrangEmail = [];

  contentProcessCustomerCareForm: FormGroup;
  employeeChargeControl: FormControl;
  effecttiveFromDateControl: FormControl;
  effecttiveToDateControl: FormControl;
  customerCareTitleControl: FormControl;
  customerCareContentControl: FormControl;
  customerCareContactTypeControl: FormControl;
  expectedAmountControl: FormControl;
  statusIdControl: FormControl;
  customerCareContentEmailControl: FormControl;
  sendEmailDateControl: FormControl;
  sendEmailHourControl: FormControl;
  customerCareContentSMSControl: FormControl;
  sendDateControl: FormControl;
  sendHourControl: FormControl;
  giftCustomerType1Control: FormControl;
  giftTypeId1Control: FormControl;
  giftTotal1Control: FormControl;
  giftCustomerType2Control: FormControl;
  giftTypeId2Control: FormControl;
  giftTotal2Control: FormControl;

  dialogSelectTemplateEmail: MatDialogRef<TemplateEmailDialogComponent>;
  dialogSelectTemplateSMS: MatDialogRef<TemplateSmsDialogComponent>;
  /*END: T???O CH????NG TR??NH CH??M S??C KH??CH H??NG*/

  // check co phai kh tiem nang ko
  // isPotential: boolean = false;

  get rowFilterFormGroup() {
    return this.filterForm.get('rowFilters') as FormArray;
  }

  /*Get Global Parameter*/
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultLimitedFileSize = Number(this.systemParameterList.find(systemParameter => systemParameter.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  /*End*/

  /**G???i Mail Attchement */
  uploadedFiles: any[] = [];
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  attchementName: Array<any> = [];
  file: File[];
  /**END */

  /** l???c ???? g???i mail hay ch??a */
  selectedValue: boolean;
  isFilter: boolean = false;

  constructor(
    private fb: FormBuilder,
    private getPermission: GetPermission,
    public dialogPop: MatDialog,
    private customerService: CustomerService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private quoteService: QuoteService,
    private customerCareService: CustomerCareService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    public forderConfigurationService: ForderConfigurationService
  ) { }

  async ngOnInit() {
    this.customerType = [
      { name: 'Kh??ch h??ng', code: 'HDO' },
      { name: 'Ti???m n??ng', code: 'MOI' },
    ];
    //Check permission
    let resource = "crm/customer/care-create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      //Ki???m tra xem user ??ang ????ng nh???p l?? qu???n l?? hay nh??n vi??n
      this.isManager = localStorage.getItem('IsManager') === "true" ? true : false;
      this.employeeId = JSON.parse(localStorage.getItem('auth')).EmployeeId;

      this.filterForm = this.fb.group({
        rowFilters: this.fb.array([this.createFilter()])
      });

      // set rowFilterList to this field
      this.rowFilterList = this.filterForm.get('rowFilters') as FormArray;

      let ttt = this.route.params.subscribe(params => {
        let isEmptyObj = this.isEmpty(params);
        if (!isEmptyObj) {
          let ListFilter = params['ListFilter'];
          this.listFilterModel = JSON.parse(ListFilter);
          this.reShowListFilters = true;
        }
      });

      if (!this.reShowListFilters) {
        //N???u l?? t???o m???i b??? l???c l???n ?????u ti??n
        this.getMasterData();
      } else {
        //N???u l?? hi???n th??? l???i b??? l???c
        this.getReShowListFilters()
      }

      /*T???O CH????NG TR??NH CH??M S??C KH??CH H??NG*/
      this.getMasterDataForContentCustomerCare();
      let expectedAmountPattern = '^([0-9][0-9]{0,9}|10000000000)$';
      let greaterThanZero = '^([1-9]|[1-9][0-9]|[1][0-9][0-9]|20[0-0])$';
      let today = new Date();

      this.employeeChargeControl = new FormControl('', [Validators.required]);
      this.effecttiveFromDateControl = new FormControl(new Date(), [Validators.required]);
      this.effecttiveToDateControl = new FormControl(new Date(today.setDate(today.getDate() + 7)), [Validators.required]);
      this.customerCareTitleControl = new FormControl('', [Validators.required]);
      this.customerCareContentControl = new FormControl(null, [Validators.required]);
      this.customerCareContactTypeControl = new FormControl('', [Validators.required]);
      this.expectedAmountControl = new FormControl('', [Validators.required, Validators.pattern(expectedAmountPattern)]);
      this.statusIdControl = new FormControl('', [Validators.required]);
      this.customerCareContentEmailControl = new FormControl('', [Validators.required]);
      this.sendEmailDateControl = new FormControl(new Date(), [Validators.required]);
      this.sendEmailHourControl = new FormControl('00:00', [Validators.required]);
      this.customerCareContentSMSControl = new FormControl('', [Validators.required]);
      this.sendDateControl = new FormControl(new Date(), [Validators.required]);
      this.sendHourControl = new FormControl('00:00', [Validators.required]);
      this.giftCustomerType1Control = new FormControl('');
      this.giftTypeId1Control = new FormControl('');
      this.giftTotal1Control = new FormControl('', [Validators.required, Validators.pattern(greaterThanZero)]);
      this.giftCustomerType2Control = new FormControl('');
      this.giftTypeId2Control = new FormControl('');
      this.giftTotal2Control = new FormControl('', [Validators.required, Validators.pattern(greaterThanZero)]);

      this.contentProcessCustomerCareForm = new FormGroup({
        employeeChargeControl: this.employeeChargeControl,
        effecttiveFromDateControl: this.effecttiveFromDateControl,
        effecttiveToDateControl: this.effecttiveToDateControl,
        customerCareTitleControl: this.customerCareTitleControl,
        customerCareContentControl: this.customerCareContentControl,
        customerCareContactTypeControl: this.customerCareContactTypeControl,
        expectedAmountControl: this.expectedAmountControl,
        customerCareContentEmailControl: this.customerCareContentEmailControl,
        sendEmailDateControl: this.sendEmailDateControl,
        sendEmailHourControl: this.sendEmailHourControl,
        customerCareContentSMSControl: this.customerCareContentSMSControl,
        sendDateControl: this.sendDateControl,
        sendHourControl: this.sendHourControl,
        giftCustomerType1Control: this.giftCustomerType1Control,
        giftTypeId1Control: this.giftTypeId1Control,
        giftTotal1Control: this.giftTotal1Control,
        giftCustomerType2Control: this.giftCustomerType2Control,
        giftTypeId2Control: this.giftTypeId2Control,
        giftTotal2Control: this.giftTotal2Control,
        statusIdControl: this.statusIdControl
      });
      /*END: T???O CH????NG TR??NH CH??M S??C KH??CH H??NG*/
    }
  }

  async getMasterData() {
    //just using for filters form

    /*Get List Default Data*/
    this.listCriteria = await ELEMENT_CRITERIA;
    this.listGroup = ELEMENT_VALUE_GROUP;
    this.listSex = ELEMENT_VALUE_SEX;
    this.listBirthDay = ELEMENT_VALUE_BIRTHDAY;
    let result_list_product: any = await this.productService.searchProductAsync(0,'', '')
    this.listProducts = result_list_product.productList;
    let result_lst_customer_group: any = await this.categoryService.getAllCategoryByCategoryTypeCodeAsyc("NHA");
    let lstCustomerGroup: Array<any> = result_lst_customer_group.category;
    if (lstCustomerGroup.length > 0) {
      lstCustomerGroup.forEach(item => {
        let option = {
          valueCustomerGroupId: item.categoryId,
          valueCustomerGroupName: item.categoryName
        }
        this.listCustomerGroup.push(option);
      });
    }
    /*End*/

    let filter = {
      criteriaId: null
    }
    this.listFilterModel.push(filter);
    this.listParentCriteria.push(this.listCriteria);
    this.listParentCondition.push([]);
    this.listParentGroup.push([]);
    this.listParentSex.push([]);
    this.listDropdownList.push([]);
    this.selectedItems.push([]);
    this.listParentBirthDay.push([]);
    this.listParentCustomerGroup.push([]);
  }

  async getReShowListFilters() {
    /*Get List Default Data*/
    this.listCriteria = await ELEMENT_CRITERIA;
    this.listGroup = ELEMENT_VALUE_GROUP;
    this.listSex = ELEMENT_VALUE_SEX;
    this.listBirthDay = ELEMENT_VALUE_BIRTHDAY;
    let result_list_product: any = await this.productService.searchProductAsync(0,'', '');
    this.listProducts = result_list_product.productList;
    let result_lst_customer_group: any = await this.categoryService.getAllCategoryByCategoryTypeCodeAsyc("NHA");
    let lstCustomerGroup: Array<any> = result_lst_customer_group.category;
    if (lstCustomerGroup.length > 0) {
      lstCustomerGroup.forEach(item => {
        let option = {
          valueCustomerGroupId: item.categoryId,
          valueCustomerGroupName: item.categoryName
        }
        this.listCustomerGroup.push(option);
      });
    }
    /*End*/

    // this.listFilterModel = JSON.parse(JSON.stringify(this.dataTest));

    this.listParentCriteria.push(this.listCriteria);
    this.listParentCondition.push([]);
    this.listParentGroup.push([]);
    this.listParentSex.push([]);
    this.listDropdownList.push([]);
    this.selectedItems.push([]);
    this.listParentBirthDay.push([]);
    this.listParentCustomerGroup.push([]);

    this.listFilterModel.forEach((item, index) => {
      this.reAddFilter(item);
    });
    this.listFilterModel.unshift([]);
    this.removeFilter(0);
  }

  async getMasterDataForContentCustomerCare() {
    //List nh??n vi??n ph??? tr??ch
    this.employeeService.getEmployeeCareStaff(this.isManager, this.employeeId).subscribe(response => {
      let result = <any>response;
      this.listEmployeeCharge = result.employeeList.filter(e => e.active == true);
      this.customerCareModel.EmployeeCharge = this.employeeId;
      this.listEmployeeCharge.forEach(x => {
        x.employeeName = x.employeeCode + ' - ' + x.employeeName;
      })

      // set default cho nhan vien phu trach
      let emp = this.listEmployeeCharge.find(x => x.employeeId == this.employeeId);
      this.employeeChargeControl.setValue(emp);
    });

    //list H??nh th???c
    this.categoryService.getAllCategoryByCategoryTypeCode("HCS").subscribe(response => {
      let result = <any>response;
      this.listCustomerCareContactType = result.category;
      //H??nh th???c m???c ?????nh l?? G???i email
      let defaultId = '';
      if (this.listCustomerCareContactType.length > 0) {
        defaultId = this.listCustomerCareContactType.find(item => item.categoryCode == 'Email').categoryId //G???i email
      }
      this.customerCareModel.CustomerCareContactType = defaultId;
      this.isSendEmail = true;
      let contactType = this.listCustomerCareContactType.find(item => item.categoryCode == 'Email');
      this.customerCareContactTypeControl.setValue(contactType);
    })

    //list tr???ng th??i
    this.categoryService.getAllCategoryByCategoryTypeCode("TCS").subscribe(response => {
      let result = <any>response;
      this.listStatusId = result.category;
      //Tr???ng th??i m???c ?????nh l?? M???i t???o
      let defaultId = '';
      if (this.listStatusId.length > 0) {
        defaultId = this.listStatusId.find(item => item.categoryCode == 'New').categoryId;  //M???i t???o
      }
      this.customerCareModel.StatusId = defaultId;
      let status = this.listStatusId.find(item => item.categoryCode == 'New');
      this.statusIdControl.setValue(status);
    })

    //list lo???i qu??
    let list_gift_results: any = await this.categoryService.getAllCategoryByCategoryTypeCodeAsyc("LQU");
    this.listGiftTypeId1 = list_gift_results.category;
    this.listGiftTypeId2 = list_gift_results.category;
  }

  /* event khi thay doi nhan vien phu trach */
  // private _filterSeller(value: string, array: any) {
  //   return array.filter(state =>
  //     state.employeeName.toLowerCase().indexOf(value.toLowerCase()) >= 0 || state.employeeCode.toLowerCase().indexOf(value.toLowerCase()) >= 0);
  // }

  selectSeller(event: any) {
    this.customerCareModel.EmployeeCharge = event.value.employeeId;
  }
  /*End*/

  async setDefaultValueCustomerGift() {
    this.isHasValueCustomerType = true;

    let defaultId1 = '';
    let defaultId2 = '';

    if (this.listGiftTypeId1.length > 0) {
      defaultId1 = this.listGiftTypeId1[0].categoryId;
      this.customerCareModel.GiftTypeId1 = defaultId1;
    }

    if (this.listGiftTypeId2.length > 0) {
      defaultId2 = this.listGiftTypeId2[0].categoryId;
      this.customerCareModel.GiftTypeId2 = defaultId2;
    }

    //List Lo???i kh??ch h??ng
    this.list_customer_types = ELEMENT_CUSTOMER_TYPE;

    //Value dafault Ch???n Kh??ch h??ng c?? nh??n
    this.listDefaultIdCusPer = ELEMENT_CUSTOMER_PER;
    let giftType1 = this.listDefaultIdCusPer.find(x => x.categoryId != 0);
    this.customerCareModel.GiftCustomerType1 = giftType1.categoryId;
    this.giftCustomerType1Control.setValue(giftType1);

    //Value dafault Ch???n Kh??ch h??ng doanh nghi???p
    this.listDefaultIdCusEnterprise = ELEMENT_CUSTOMER_ENTERPRISE;
    let giftType2 = this.listDefaultIdCusEnterprise.find(x => x.categoryId != 0);
    this.customerCareModel.GiftCustomerType2 = giftType2.categoryId;
    this.giftCustomerType2Control.setValue(giftType2);

    //Value default S??? l?????ng qu??
    this.customerCareModel.GiftTotal1 = 1;
    this.customerCareModel.GiftTotal2 = 1;

    this.isShowOptionsGiftType1 = true;
    this.isShowOptionsGiftType2 = true;
  }

  /*B?????c 1:*/
  stepOne() {
    this.step = 1;
  }
  /*End*/

  /*B?????c 2:*/
  stepTwo() {
    let _title = "XA??C NH????N";
    let _content = "B???n ch???c ch???n mu???n t???o ch????ng tr??nh CSKH cho to??n b??? KH?";
    this.dialogPopup = this.dialogPop.open(PopupComponent,
      {
        width: '500px',
        height: 'auto',
        autoFocus: false,
        data: { title: _title, content: _content }
      });

    this.dialogPopup.afterClosed().subscribe(async result => {
      if (result) {
        let count_filter = this.rowFilterList.length;
        if (count_filter > 0) {
          //reset to??n b??? d??? li???u ???? l??u c???a list b??? l???c
          this.listFilterModel = [];

          //???n to??n b??? form control c???a list b??? l???c
          this.listConditionForm = [];
          this.listValueAgeForm = [];
          this.listValueGroupForm = [];
          this.listValueAgeComboForm = [];
          this.listValueSexForm = [];
          this.listValueRevenueForm = [];
          this.listValueRevenueComboForm = [];
          this.listValueDateRevenueComboForm = [];
          this.listValueProductForm = [];
          this.listValuePointForm = [];
          this.listValuePointComboForm = [];
          this.listValueBirthDayForm = [];
          this.listValueCustomerGroupForm = [];
          this.listValueSendMailForm = [];
          this.listValueNotSendMailForm = [];

          this.index = 0;

          //x??a c??c b??? l???c
          for (let i = 1; i < count_filter; i++) {
            this.rowFilterList.removeAt(1);
          }

          //Reset l???i value c???a dropdown list c???a b??? l???c
          this.rowFilterList.reset();

          // this.getMasterData();

          ////
          let filter = {
            criteriaId: null
          }
          this.listFilterModel.push(filter);
          this.listParentCriteria.push(this.listCriteria);
          this.listParentCondition.push([]);
          this.listParentGroup.push([]);
          this.listParentSex.push([]);
          this.listDropdownList.push([]);
          this.selectedItems.push([]);
          this.listParentBirthDay.push([]);
          this.listParentCustomerGroup.push([]);
          ////

          //reset k???t qu??? l???c
          this.listDataUser = [];
          this.resultFilteredCustomer = 0;
          this.isNoData = 1;
          this.msgNoData = 1;
          this.dataSource = new MatTableDataSource(this.listDataUser);

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.paginator._intl.itemsPerPageLabel = 'S???? kh??ch h??ng m????i trang: ';
        }

        this.isSkip = true;
        this.step = 2;
        this.listCustomerId = [];
        /*Get Customer List*/
        const result_customer_list: any = await this.customerService.getAllCustomerAsync();
        /*END*/

        result_customer_list.customerList.forEach((item, index) => {
          this.listCustomerId.push(item.customerId);
        });
      }
    });
  }
  /*End*/

  /*Reset l???i to??n b??? b??? l???c*/
  resetAllFilters() {
    let count_filter = this.rowFilterList.length;

    if (count_filter > 0) {
      let _title = "XA??C NH????N";
      let _content = "B???n c?? mu???n h???y b??? b??? l???c hi???n t???i?";
      this.dialogPopup = this.dialogPop.open(PopupComponent,
        {
          width: '500px',
          height: '300px',
          autoFocus: false,
          data: { title: _title, content: _content }
        });

      this.dialogPopup.afterClosed().subscribe(async result => {
        if (result) {
          //reset to??n b??? d??? li???u ???? l??u c???a list b??? l???c
          this.listFilterModel = [];

          //???n to??n b??? form control c???a list b??? l???c
          this.listConditionForm = [];
          this.listValueAgeForm = [];
          this.listValueGroupForm = [];
          this.listValueAgeComboForm = [];
          this.listValueSexForm = [];
          this.listValueRevenueForm = [];
          this.listValueRevenueComboForm = [];
          this.listValueDateRevenueComboForm = [];
          this.listValueProductForm = [];
          this.listValuePointForm = [];
          this.listValuePointComboForm = [];
          this.listValueBirthDayForm = [];
          this.listValueCustomerGroupForm = [];
          this.listValueSendMailForm = [];
          this.listValueNotSendMailForm = [];

          this.index = 0;

          //x??a c??c b??? l???c
          for (let i = 1; i < count_filter; i++) {
            this.rowFilterList.removeAt(1);
          }

          //Reset l???i value c???a dropdown list c???a b??? l???c
          this.rowFilterList.reset();

          this.getMasterData();

          //reset n???i dung CSKH
          this.resetFormContentCustomerCare();

          //reset k???t qu??? l???c
          this.listDataUser = [];
          this.resultFilteredCustomer = 0;
          this.isNoData = 1;
          this.msgNoData = 1;
          this.dataSource = new MatTableDataSource(this.listDataUser);

          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.paginator._intl.itemsPerPageLabel = 'S???? kh??ch h??ng m????i trang: ';

          //reset t???p kh??ch h??ng
          this.listCustomerId = [];
        }
      });
    }
  }
  /*End*/

  /*T???o m???t b??? l???c:*/
  createFilter(): FormGroup {
    let number_require = '^[0-9][0-9]*$'; //s??? nguy??n l??n h??n ho???c b???ng 0
    return this.fb.group({
      criteriaControl: ['', Validators.compose([Validators.required])],
      conditionControl: ['', Validators.compose([Validators.required])],
      valueAgeControl: ['', Validators.compose([Validators.pattern(number_require), Validators.required])],
      'valueAgeFirstControl': ['', Validators.compose([Validators.pattern(number_require), Validators.required])],
      'valueAgeLastControl': ['', Validators.compose([Validators.pattern(number_require), Validators.required])],
      valueListGroupControl: ['', Validators.compose([Validators.required])],
      valueListSexControl: ['', Validators.compose([Validators.required])],
      valueRevenueControl: ['', Validators.compose([Validators.pattern(number_require), Validators.required])],
      'valueRevenueFirstControl': ['', Validators.compose([Validators.pattern(number_require), Validators.required])],
      'valueRevenueLastControl': ['', Validators.compose([Validators.pattern(number_require), Validators.required])],
      valueDateRevenueFirstControl: ['', Validators.compose([Validators.required])],
      valueDateRevenueLastControl: ['', Validators.compose([Validators.required])],
      valueListProductControl: ['', Validators.compose([Validators.required])],
      valuePointControl: ['', Validators.compose([Validators.required])],
      valuePointFirstControl: ['', Validators.compose([Validators.required])],
      valuePointLastControl: ['', Validators.compose([Validators.required])],
      valueListBirthDayControl: ['', Validators.compose([Validators.required])],
      valueListCustomerGroupControl: ['', Validators.compose([Validators.required])],
      valueSendMailControl: ['', Validators.compose([Validators.pattern('^[1-9][0-9]*$'), Validators.required])],
      valueNotSendMailControl: ['', Validators.compose([Validators.pattern('^[0]*$'), Validators.required])],
    },
      {
        validator: [
          this.equalValueValidator('valueAgeFirstControl', 'valueAgeLastControl'),
          this.equalValueValidator('valueRevenueFirstControl', 'valueRevenueLastControl')
        ]
      }
    );
  }
  /*End*/

  equalValueValidator(targetKey: string, toMatchKey: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      if (target.valueChanges && toMatch.valueChanges) {
        const isMatch = target.value <= toMatch.value;
        // set equal value error on dirty controls
        if (!isMatch && target.valid && toMatch.valid) {
          toMatch.setErrors({ equalValue: targetKey });
          const message = "Gi?? tr??? ?????u ph???i nh??? h??n gi?? tr??? cu???i trong kho???ng";
          return { 'equalValue': message };
        }
        if (isMatch && toMatch.hasError('equalValue')) {
          toMatch.setErrors(null);
        }
      }

      return null;
    };
  }

  getFiltersFormGroup(index): FormGroup {
    this.rowFilterList = this.filterForm.get('rowFilters') as FormArray;
    const formGroup = this.rowFilterList.controls[index] as FormGroup;
    return formGroup;
  }

  /*Th??m m???t h??ng l???c*/
  addFilter() {
    this.index++; //L??u l???i gi?? tr??? index
    this.rowFilterList.push(this.createFilter());

    //Kh???i t???o c??c gi?? tr??? m???c ?????nh
    this.listParentCriteria[this.index] = this.listCriteria;
    this.listParentCondition[this.index] = [];
    this.listParentGroup[this.index] = [];
    this.listParentSex[this.index] = [];
    this.listDropdownList[this.index] = [];
    this.selectedItems[this.index] = [];
    this.listParentBirthDay[this.index] = [];
    this.listParentCustomerGroup[this.index] = [];

    let filter = {
      criteriaId: null
    }
    this.listFilterModel.push(filter);
  }
  /*End*/

  /*Th??m m???t h??ng l???c t??? ??i???u ki???n hi???n th??? l???i b??? l???c*/
  reAddFilter(option: any) {
    this.index++; //L??u l???i gi?? tr??? index
    this.rowFilterList.push(this.createFilter());

    /*Kh???i t???o c??c gi?? tr??? m???c ?????nh*/
    this.listParentCriteria[this.index] = this.listCriteria;
    let setValueDefaultCriteria = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["criteriaControl"].setValue(option.criteriaId);
    let criteriaName = this.listCriteria.find(item => item.criteriaId == option.criteriaId).criteriaName;

    this.listParentCondition[this.index] = [];
    this.listParentGroup[this.index] = [];
    this.listParentSex[this.index] = [];
    this.listDropdownList[this.index] = [];
    this.selectedItems[this.index] = [];
    this.listParentBirthDay[this.index] = [];
    this.listParentCustomerGroup[this.index] = [];

    switch (criteriaName) {
      case "Lo???i kh??ch h??ng": {
        this.listCondition = ELEMENT_CONDITION_GROUP;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;

        this.listParentGroup[this.index] = this.listGroup;
        let setValueDefaultGroup = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueListGroupControl"].setValue(option.valueGroupId);
        this.listValueGroupForm[this.index] = 1;
        break;
      }
      case "????? tu???i": {
        this.listCondition = ELEMENT_CONDITION_AGE;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;
        let conditionName = this.listParentCondition[this.index].find(item => item.conditionId == option.conditionId).conditionName;

        if (conditionName == "Trong kho???ng") {
          this.listValueAgeComboForm[this.index] = 1;
          let setValueDefaultAgeFirst = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueAgeFirstControl"].setValue(option.valueAgeFirst);
          let setValueDefaultAgeLast = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueAgeLastControl"].setValue(option.valueAgeLast);
        } else {
          this.listValueAgeForm[this.index] = 1;
          let setValueDefaultAge = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueAgeControl"].setValue(option.valueAge);
        }
        break;
      }
      case "Gi???i t??nh": {
        this.listCondition = ELEMENT_CONDITION_SEX;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;

        this.listParentSex[this.index] = this.listSex;
        let setValueDefaultSex = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueListSexControl"].setValue(option.valueSexId);
        this.listValueSexForm[this.index] = 1;
        break;
      }
      case "Doanh thu": {
        this.listCondition = ELEMENT_CONDITION_REVENUE;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;
        let conditionName = this.listParentCondition[this.index].find(item => item.conditionId == option.conditionId).conditionName;

        if (conditionName == "Trong kho???ng") {
          this.listValueRevenueComboForm[this.index] = 1;
          let setValueDefaultRevenueFirst = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueRevenueFirstControl"].setValue(option.valueRevenueFirst);
          let setValueDefaultRevenueLast = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueRevenueLastControl"].setValue(option.valueRevenueLast);
        } else if (conditionName == "Ph??t sinh trong kho???ng" || conditionName == "Kh??ng ph??t sinh trong kho???ng") {
          this.listValueDateRevenueComboForm[this.index] = 1;
          let setValueDefaultDateRevenueFirst = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueDateRevenueFirstControl"].setValue(option.valueDateRevenueFirst);
          let setValueDefaultDateRevenueLast = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueDateRevenueLastControl"].setValue(option.valueDateRevenueLast);
        } else {
          this.listValueRevenueForm[this.index] = 1;
          let setValueDefaultRevenue = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueRevenueControl"].setValue(option.valueRevenue);
        }
        break;
      }
      case "S??? ??i???m hi???n c??": {
        this.listCondition = ELEMENT_CONDITION_POINT;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;
        let conditionName = this.listParentCondition[this.index].find(item => item.conditionId == option.conditionId).conditionName;

        if (conditionName == "Trong kho???ng") {
          this.listValuePointComboForm[this.index] = 1;
          let setValueDefaultPointFirst = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valuePointFirstControl"].setValue(option.valuePointFirst);
          let setValueDefaultPointLast = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valuePointLastControl"].setValue(option.valuePointLast);
        } else {
          this.listValuePointForm[this.index] = 1;
          let setValueDefaultPoint = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valuePointControl"].setValue(option.valuePoint);
        }
        break;
      }
      case "S???n ph???m": {
        this.listCondition = ELEMENT_CONDITION_PRODUCT;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;

        this.listDropdownList[this.index] = this.listProducts;
        this.selectedItems[this.index] = option.listProducts;
        this.listValueProductForm[this.index] = 1;
        break;
      }
      case "Ng??y sinh nh???t": {
        this.listCondition = ELEMENT_CONDITION_BIRTHDAY;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;

        this.listParentBirthDay[this.index] = this.listBirthDay;
        let setValueDefaultBirthDay = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueListBirthDayControl"].setValue(option.valueBirthDayId);
        this.listValueBirthDayForm[this.index] = 1;
        break;
      }
      case "Nh??m kh??ch h??ng": {
        this.listCondition = ELEMENT_CONDITION_CUSTOMER_GROUP;
        this.listParentCondition[this.index] = this.listCondition;
        let setValueDefaultCondition = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["conditionControl"].setValue(option.conditionId);
        this.listConditionForm[this.index] = 1;

        this.listParentCustomerGroup[this.index] = this.listCustomerGroup;
        let setValueDefaultCustomerGroup = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(this.index)).controls["valueListCustomerGroupControl"].setValue(option.valueCustomerGroupId);
        this.listValueCustomerGroupForm[this.index] = 1;
        break;
      }
      default: {
        return;
      }
    }
    /*End*/
  }
  /*End*/

  /*Event: Khi thay ?????i Ti??u ch??*/
  changedCriteria(index, event: any) {
    //Reset d??? li???u c???a drop downd list
    this.listParentCondition[index] = [];
    this.listParentGroup[index] = [];
    this.listParentSex[index] = [];
    this.listDropdownList[index] = [];
    this.selectedItems[index] = [];
    this.listParentBirthDay[index] = [];
    this.listParentCustomerGroup[index] = [];

    //Reset d??? li???u ???? l??u c???a input
    if (this.listFilterModel[index]) {
      delete this.listFilterModel[index].conditionId;
      delete this.listFilterModel[index].valueGroupId;
      delete this.listFilterModel[index].valueAge;
      delete this.listFilterModel[index].valueAgeFirst;
      delete this.listFilterModel[index].valueAgeLast;
      delete this.listFilterModel[index].valueSexId;
      delete this.listFilterModel[index].valueRevenue;
      delete this.listFilterModel[index].valueRevenueFirst;
      delete this.listFilterModel[index].valueRevenueLast;
      delete this.listFilterModel[index].valueDateRevenueFirst;
      delete this.listFilterModel[index].valueDateRevenueLast;
      delete this.listFilterModel[index].valuePointFirst;
      delete this.listFilterModel[index].valuePointLast;
      delete this.listFilterModel[index].listProducts;
      delete this.listFilterModel[index].valueBirthDayId;
      delete this.listFilterModel[index].valueCustomerGroupId;
    }

    //Reset tr???ng th??i show/hidden c???a form control
    if (this.listConditionForm[index] == 1) {
      this.listConditionForm[index] = 0;
    }
    if (this.listValueGroupForm[index] == 1) {
      this.listValueGroupForm[index] = 0;
    }
    if (this.listValueAgeForm[index] == 1) {
      this.listValueAgeForm[index] = 0;
    }
    if (this.listValueAgeComboForm[index] == 1) {
      this.listValueAgeComboForm[index] = 0;
    }
    if (this.listValueSexForm[index] == 1) {
      this.listValueSexForm[index] = 0;
    }
    if (this.listValueRevenueForm[index] == 1) {
      this.listValueRevenueForm[index] = 0;
    }
    if (this.listValueRevenueComboForm[index] == 1) {
      this.listValueRevenueComboForm[index] = 0;
    }
    if (this.listValueDateRevenueComboForm[index] == 1) {
      this.listValueDateRevenueComboForm[index] = 0;
    }
    if (this.listValueProductForm[index] == 1) {
      this.listValueProductForm[index] = 0;
    }
    if (this.listValuePointForm[index] == 1) {
      this.listValuePointForm[index] = 0;
    }
    if (this.listValuePointComboForm[index] == 1) {
      this.listValuePointComboForm[index] = 0;
    }
    if (this.listValueBirthDayForm[index] == 1) {
      this.listValueBirthDayForm[index] = 0;
    }
    if (this.listValueCustomerGroupForm[index] == 1) {
      this.listValueCustomerGroupForm[index] = 0;
    }
    if (this.listValueSendMailForm[index] == 1) {
      this.listValueSendMailForm[index] = 0;
    }
    if (this.listValueNotSendMailForm[index] == 1) {
      this.listValueNotSendMailForm[index] = 0;
    }

    //Hi???n th??? form control: condition
    this.listConditionForm[index] = 1;
    //reset value c???a dropdown list
    var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["conditionControl"].setValue(null);


    let target = event.source.selected.viewValue;
    let selectedData = {
      value: event.value,
      text: target
    };

    //L??u gi?? tr??? ???? ch???n
    let count = this.listFilterModel.length;
    if (count != 0 && index < this.index) {
      this.listFilterModel[index].criteriaId = selectedData.value;
    } else if (count != 0 && index == this.index) {
      if (this.listFilterModel[index]) {
        this.listFilterModel[index].criteriaId = selectedData.value;
      } else {
        let filter = {
          criteriaId: selectedData.value,
          conditionId: null
        }
        this.listFilterModel.push(filter);
      }
    } else {
      let filter = {
        criteriaId: selectedData.value,
        conditionId: null
      }
      this.listFilterModel.push(filter);
    }

    //X??t c??c tr?????ng h???p ????? show form control: condition
    if (selectedData.text === 'Lo???i kh??ch h??ng') {
      this.listCondition = ELEMENT_CONDITION_GROUP;
    } else if (selectedData.text === '????? tu???i') {
      this.listCondition = ELEMENT_CONDITION_AGE;
    } else if (selectedData.text === 'Gi???i t??nh') {
      this.listCondition = ELEMENT_CONDITION_SEX;
    } else if (selectedData.text === 'Doanh thu') {
      this.listCondition = ELEMENT_CONDITION_REVENUE;
    } else if (selectedData.text === 'S???n ph???m') {
      this.listCondition = ELEMENT_CONDITION_PRODUCT;
    } else if (selectedData.text === 'S??? ??i???m hi???n c??') {
      this.listCondition = ELEMENT_CONDITION_POINT;
    } else if (selectedData.text === 'Ng??y sinh nh???t') {
      this.listCondition = ELEMENT_CONDITION_BIRTHDAY;
    } else if (selectedData.text === 'Nh??m kh??ch h??ng') {
      this.listCondition = ELEMENT_CONDITION_CUSTOMER_GROUP;
    }

    this.listParentCondition[index] = this.listCondition;
  }
  /*End*/

  /*Event: Khi thay ?????i ??i???u ki???n*/
  changedCondition(index, event: any) {
    let target = event.source.selected.viewValue;
    let selectedData = {
      value: event.value,
      text: target
    };

    //T??m t??n c???a Ti??u ch?? trong m???t b??? l???c
    let criteriaId = this.listFilterModel[index].criteriaId;
    let criteriaName = this.listCriteria.find(item => item.criteriaId == criteriaId).criteriaName;

    //T??m t??n c???a ??i???u ki???n trong m???t b??? l???c
    let conditionId = selectedData.value;
    let conditionName = this.listParentCondition[index].find(item => item.conditionId == conditionId).conditionName;

    //L??u gi?? tr??? ???? ch???n
    this.listFilterModel[index].conditionId = selectedData.value;

    //X??t c??c tr?????ng h???p ????? show form control: value
    if (criteriaName == 'Lo???i kh??ch h??ng') {
      this.listValueGroupForm[index] = 1;
      this.listParentGroup[index] = this.listGroup;

      //reset l???i c??c gi?? tr??? ???? l??u c???a b??? l???c
      this.resetFormValueGroup(index);

      //reset value c???a dropdown list
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueListGroupControl"].setValue(null)
    } else if (criteriaName == '????? tu???i' && conditionName != 'Trong kho???ng') {
      //reset l???i c??c gi?? tr??? ???? l??u c???a b??? l???c
      this.resetFormValueAge(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueAgeControl"].setValue(null);

      this.listValueAgeForm[index] = 1;
    } else if (criteriaName == '????? tu???i' && conditionName == 'Trong kho???ng') {
      //reset l???i c??c gi?? tr??? ???? l??u c???a b??? l???c
      this.resetFormValueAge(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueAgeFirstControl"].setValue(null);
      var b = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueAgeLastControl"].setValue(null);

      this.listValueAgeComboForm[index] = 1;
    } else if (criteriaName == 'Gi???i t??nh') {
      this.listValueSexForm[index] = 1;
      this.listParentSex[index] = this.listSex;

      //reset l???i c??c gi?? tr??? ???? l??u c???a b??? l???c
      this.resetFormValueSex(index);

      //reset value c???a dropdown list
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueListSexControl"].setValue(null)
    } else if (criteriaName == 'Doanh thu' &&
      (conditionName == 'B???ng' || conditionName == 'Kh??ng b???ng' || conditionName == 'L???n h??n' || conditionName == 'Nh??? h??n')) {
      //reset l???i value c???a b??? l???c
      this.resetFormValueRevenue(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueRevenueControl"].setValue(null);

      this.listValueRevenueForm[index] = 1;
    } else if (criteriaName == 'Doanh thu' && conditionName == 'Trong kho???ng') {
      //reset l???i value c???a b??? l???c
      this.resetFormValueRevenue(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueRevenueFirstControl"].setValue(null);
      var b = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueRevenueLastControl"].setValue(null);

      this.listValueRevenueComboForm[index] = 1;
    } else if (criteriaName == 'Doanh thu' && (conditionName == 'Ph??t sinh trong kho???ng' || conditionName == 'Kh??ng ph??t sinh trong kho???ng')) {
      //reset l???i value c???a b??? l???c
      this.resetFormValueRevenue(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueDateRevenueFirstControl"].setValue(null);
      var b = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueDateRevenueLastControl"].setValue(null);

      this.listValueDateRevenueComboForm[index] = 1;
    } else if (criteriaName == 'S???n ph???m') {
      this.listValueProductForm[index] = 1;
      this.listDropdownList[index] = this.listProducts;
      //reset value c???a dropdown list
      this.selectedItems[index] = [];
    } else if (criteriaName == 'S??? ??i???m hi???n c??' &&
      (conditionName == 'B???ng' || conditionName == 'Kh??ng b???ng' || conditionName == 'L???n h??n' || conditionName == 'Nh??? h??n')) {
      //reset l???i value c???a b??? l???c
      this.resetFormValuePoint(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valuePointControl"].setValue(null);

      this.listValuePointForm[index] = 1;
    } else if (criteriaName == 'S??? ??i???m hi???n c??' && conditionName == 'Trong kho???ng') {
      this.resetFormValuePoint(index);

      //reset l???i value c???a input
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valuePointFirstControl"].setValue(null);
      var b = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valuePointLastControl"].setValue(null);

      this.listValuePointComboForm[index] = 1;
    } else if (criteriaName == 'Ng??y sinh nh???t') {
      this.listValueBirthDayForm[index] = 1;
      this.listParentBirthDay[index] = this.listBirthDay;

      //reset l???i c??c gi?? tr??? ???? l??u c???a b??? l???c
      this.resetFormValueBirthDay(index);

      //reset value c???a dropdown list
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueListBirthDayControl"].setValue(null)
    } else if (criteriaName == 'Nh??m kh??ch h??ng') {
      this.listValueCustomerGroupForm[index] = 1;
      this.listParentCustomerGroup[index] = this.listCustomerGroup;

      //reset l???i c??c gi?? tr??? ???? l??u c???a b??? l???c
      this.resetFormValueCustomerGroup(index);

      //reset value c???a dropdown list
      var a = (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueListCustomerGroupControl"].setValue(null)
    }
  }
  /*End*/

  /*Event: Khi thay ?????i ??i???u ki???n: Lo???i kh??ch h??ng*/
  changedlistValueListGroup(index, event: any) {
    let target = event.source.selected.viewValue;
    let selectedData = {
      value: event.value,
      text: target
    };

    //L??u gi?? tr??? ???? ch???n
    this.listFilterModel[index].valueGroupId = selectedData.value;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a tu???i*/
  changedValueAge(index, event: any) {
    let age = Number(event.target.value);
    if (age == 0) {
      (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueAgeControl"].setValue(0);
    }
    this.listFilterModel[index].valueAge = age;
  }

  changedValueAgeFirst(index, event: any) {
    let age_first = Number(event.target.value);
    if (age_first == 0) {
      (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueAgeFirstControl"].setValue(0);
    }
    this.listFilterModel[index].valueAgeFirst = age_first;
  }

  changedValueAgeLast(index, event: any) {
    let age_last = Number(event.target.value);
    if (age_last == 0) {
      (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueAgeLastControl"].setValue(0);
    }
    this.listFilterModel[index].valueAgeLast = age_last;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a s??? l???n g???i mail*/
  changedValueSendMail(index, event: any) {
    let number = Number(event.target.value);
    if (number == 0) {
      (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueSendMailControl"].setValue(0);
    }
    this.listFilterModel[index].valueSendMail = number;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a s??? l???n g???i mail*/
  changedValueNotSendMail(index, event: any) {
    let number = Number(event.target.value);
    if (number == 0) {
      (<FormGroup>(<FormArray>this.filterForm.controls['rowFilters']).at(index)).controls["valueNotSendMailControl"].setValue(0);
    }
    this.listFilterModel[index].valueNotSendMail = number;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a Gi???i t??nh*/
  changedlistValueSex(index, event: any) {
    let target = event.source.selected.viewValue;
    let selectedData = {
      value: event.value,
      text: target
    };

    //L??u gi?? tr??? ???? ch???n
    this.listFilterModel[index].valueSexId = selectedData.value;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a Doanh thu*/
  changedValueRevenue(index, event: any) {
    let revenue = event.target.value;
    let str = '';
    if (revenue.indexOf(",") != -1) {
      let array_number = revenue.split(",");
      array_number.forEach(function (value, index) {
        str += value;
      });
      var result = Number(str);
    } else {
      if (revenue == '') {
        result = null;
      } else {
        result = Number(revenue);
      }
    }
    this.listFilterModel[index].valueRevenue = result;
  }

  changedValueRevenueFirst(index, event: any) {
    let revenue_first = (event.target.value);
    let str = '';
    if (revenue_first.indexOf(",") != -1) {
      let array_number = revenue_first.split(",");
      array_number.forEach(function (value, index) {
        str += value;
      });
      var result = Number(str);
    } else {
      if (revenue_first == '') {
        result = null;
      } else {
        result = Number(revenue_first);
      }
    }
    this.listFilterModel[index].valueRevenueFirst = result;
  }

  changedValueRevenueLast(index, event: any) {
    let revenue_last = (event.target.value);
    let str = '';
    if (revenue_last.indexOf(",") != -1) {
      let array_number = revenue_last.split(",");
      array_number.forEach(function (value, index) {
        str += value;
      });
      var result = Number(str);
    } else {
      if (revenue_last == '') {
        result = null;
      } else {
        result = Number(revenue_last);
      }
    }
    this.listFilterModel[index].valueRevenueLast = result;
  }

  setValueDateRevenueFirst(index, event: any) {
    let revenue_date_first = (event.target.value);
    this.listFilterModel[index].valueDateRevenueFirst = revenue_date_first;
  }

  setValueDateRevenueLast(index, event: any) {
    let revenue_date_last = (event.target.value);
    this.listFilterModel[index].valueDateRevenueLast = revenue_date_last;
  }
  /*End*/

  /*Event: Khi thay ?????i S???n ph???m*/
  onItemSelect(index, item: any) {
    this.listFilterModel[index].listProducts = this.selectedItems[index];
  }

  onSelectAll(index, items: any) {
    this.listFilterModel[index].listProducts = items;
  }

  onItemDeSelect(index, item: any) {
    this.listFilterModel[index].listProducts = this.selectedItems[index];
  }

  onFilterChange(index, item: any) {
    //tr??? v??? k?? t??? nh???p ??? ?? search
  }
  /*End*/

  /*Event: Khi thay ?????i ??i???m hi???n c??*/
  changedValuePoint(index, event: any) {
    let point = Number(event.target.value);
    this.listFilterModel[index].valuePoint = point;
  }

  changedValuePointFirst(index, event: any) {
    let point_first = Number(event.target.value);
    this.listFilterModel[index].valuePointFirst = point_first;
  }

  changedValuePointLast(index, event: any) {
    let point_last = Number(event.target.value);
    this.listFilterModel[index].valuePointLast = point_last;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a Ng??y sinh nh???t*/
  changedlistValueBirthDay(index, event: any) {
    let target = event.source.selected.viewValue;
    let selectedData = {
      value: event.value,
      text: target
    };

    //L??u gi?? tr??? ???? ch???n
    this.listFilterModel[index].valueBirthDayId = selectedData.value;
  }
  /*End*/

  /*Event: Khi thay ?????i gi?? tr??? c???a Nh??m kh??ch h??ng*/
  changedlistValueCustomerGroup(index, event: any) {
    let target = event.source.selected.viewValue;
    let selectedData = {
      value: event.value,
      text: target
    };

    //L??u gi?? tr??? ???? ch???n
    this.listFilterModel[index].valueCustomerGroupId = selectedData.value;
  }
  /*End*/

  /*X??a m???t row filter*/
  removeFilter(index) {
    this.rowFilterList.removeAt(index);
    this.listFilterModel.splice(index, 1);
    this.listConditionForm.splice(index, 1);
    this.listValueGroupForm.splice(index, 1);
    this.listValueAgeForm.splice(index, 1);
    this.listValueAgeComboForm.splice(index, 1);
    this.listValueSexForm.splice(index, 1);
    this.listValueRevenueForm.splice(index, 1);
    this.listValueRevenueComboForm.splice(index, 1);
    this.listValueDateRevenueComboForm.splice(index, 1);
    this.listValueProductForm.splice(index, 1);
    this.listValuePointForm.splice(index, 1);
    this.listValuePointComboForm.splice(index, 1);
    this.listValueBirthDayForm.splice(index, 1);
    this.listValueCustomerGroupForm.splice(index, 1);
    this.listValueSendMailForm.splice(index, 1);
    this.listValueNotSendMailForm.splice(index, 1);

    //X??a value c???a dropdown list theo index
    if (this.listParentCriteria[index]) {
      this.listParentCriteria.splice(index, 1);
    }
    if (this.listParentCondition[index]) {
      this.listParentCondition.splice(index, 1);
    }
    if (this.listParentGroup[index]) {
      this.listParentGroup.splice(index, 1);
    }
    if (this.listParentSex[index]) {
      this.listParentSex.splice(index, 1);
    }
    if (this.listDropdownList[index]) {
      this.listDropdownList.splice(index, 1);
    }
    if (this.selectedItems[index]) {
      this.selectedItems.splice(index, 1);
    }
    if (this.listParentBirthDay[index]) {
      this.listParentBirthDay.splice(index, 1);
    }
    if (this.listParentCustomerGroup[index]) {
      this.listParentCustomerGroup.splice(index, 1);
    }

    this.index--;
  }
  /*End*/

  /*Function Support*/
  resetFormValueGroup(index) {
    delete this.listFilterModel[index].valueGroupId;
  }

  resetFormValueAge(index) {
    this.listValueAgeForm[index] = 0;
    delete this.listFilterModel[index].valueAge;

    this.listValueAgeComboForm[index] = 0;
    delete this.listFilterModel[index].valueAgeFirst;
    delete this.listFilterModel[index].valueAgeLast;
  }

  resetFormValueSendMail(index) {
    this.listValueSendMailForm[index] = 0;
    delete this.listFilterModel[index].valueSendMail;
  }

  resetFormValueNotSendMail(index) {
    this.listValueNotSendMailForm[index] = 0;
    delete this.listFilterModel[index].valueNotSendMail;
  }

  resetFormValueSex(index) {
    delete this.listFilterModel[index].valueSexId;
  }

  resetFormValueRevenue(index) {
    this.listValueRevenueForm[index] = 0;
    delete this.listFilterModel[index].valueRevenue;

    this.listValueRevenueComboForm[index] = 0;
    delete this.listFilterModel[index].valueRevenueFirst;
    delete this.listFilterModel[index].valueRevenueLast;

    this.listValueDateRevenueComboForm[index] = 0;
    delete this.listFilterModel[index].valueDateRevenueFirst;
    delete this.listFilterModel[index].valueDateRevenueLast;
  }

  resetFormValuePoint(index) {
    this.listValuePointForm[index] = 0;
    delete this.listFilterModel[index].valuePoint;

    this.listValuePointComboForm[index] = 0;
    delete this.listFilterModel[index].valuePointFirst;
    delete this.listFilterModel[index].valuePointLast;
  }

  resetFormValueBirthDay(index) {
    delete this.listFilterModel[index].valueBirthDayId;
  }

  resetFormValueCustomerGroup(index) {
    delete this.listFilterModel[index].valueCustomerGroupId;
  }
  /*End*/

  /*Send Filters*/
  sendFilters() {
    //Hi???n th??? validate tr??n view
    this.rowFilterList = this.filterForm.get('rowFilters') as FormArray;

    for (let i = 0; i < (this.index + 1); i++) {
      let formGroup = this.rowFilterList.controls[i] as FormGroup;
      Object.keys(formGroup.controls).forEach((key, index) => {
        if (!formGroup.controls[key].valid) {
          formGroup.controls[key].markAsTouched();
        }
      });
    }

    //Ki???m tra validate theo d??? li???u tr??? v???
    let check = this.validateFilters();

    if (!check) {
      let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: '??i???u ki???n l???c kh??ng h???p l???' };
      this.showMessage(msg);
    } else {
      this.loading = true;
      this.masterCheck = true;
      /*X??? l?? b??? l???c th??nh c??u query*/
      let query: any = this.generateQuery(this.listFilterModel);
      let listTypeCustomerCode: Array<any> = [];
      this.SelectedTypeCustomer.forEach(x => {
        listTypeCustomerCode.push(x.code);
      })

      let sendMailCondition = null;
      if (this.selectedValue === undefined || this.selectedValue === null) {
        sendMailCondition = null;
      } else if (this.selectedValue) {
        sendMailCondition = true;
      } else {
        sendMailCondition = false;
      }

      //T??nh tr???ng email
      let listSelectedTinhTrangEmail: Array<number> = this.SelectedTinhTrangEmail.map(x => x.value);

      this.customerCareService.filterCustomer(this.basicRulesetToSQL(query), listTypeCustomerCode,
        sendMailCondition, listSelectedTinhTrangEmail, this.userId).subscribe(response => {
          let result = <any>response;

          if (result.statusCode == 200) {
            this.loading = false;
            this.listDataUser = result.listCustomer;

            //N???u c?? d??? li???u th?? show c??n kh??ng th?? th??ng b??o kh??ng c?? d??? li???u
            this.resultFilteredCustomer = this.listDataUser.length;
            if (this.resultFilteredCustomer > 0) {
              this.isNoData = 0;
              this.msgNoData = 0;
            } else {
              this.isNoData = 1;
              this.msgNoData = 1;
            }

            for (let item of this.listDataUser) {
              item.isChecked = true;
            }

            this.dataSource = new MatTableDataSource(this.listDataUser);

            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.paginator._intl.itemsPerPageLabel = 'S???? kh??ch h??ng m????i trang: ';
          } else {
            this.loading = false;
            this.listDataUser = [];
            this.resultFilteredCustomer = 0;
            this.isNoData = 1;
            this.msgNoData = 1;
            this.dataSource = new MatTableDataSource(this.listDataUser);

            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.paginator._intl.itemsPerPageLabel = 'S???? kh??ch h??ng m????i trang: ';

            let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'L???c kh??ch h??ng th???t b???i' };
            this.showMessage(msg);
          }
        }, error => { });
      /*End*/
    }
  }
  /*End*/

  /*X??? l?? k???t qu??? b??? l???c ????? generate ra query*/
  generateQuery(result: any) {
    let query = {
      condition: "and",
      rules: []
    }

    result.forEach((obj, index) => {
      let field = this.listCriteria.find(item => item.criteriaId == obj.criteriaId).field;
      let operator = ELEMENT_ALL_CONDITIONS.find(item => item.conditionId == obj.conditionId).operator;
      let criteriaName = this.listCriteria.find(item => item.criteriaId == obj.criteriaId).criteriaName;

      switch (criteriaName) {
        case "Lo???i kh??ch h??ng": {
          let value = obj.valueGroupId;
          let subQuery = {
            field: field,
            operator: operator,
            value: value
          };
          query.rules.push(subQuery);
          break;
        }
        case "????? tu???i": {
          if (operator == "<>") {
            let value1 = obj.valueAgeFirst;
            let subQuery1 = {
              field: field,
              operator: ">=",
              value: value1
            };
            query.rules.push(subQuery1);

            let value2 = obj.valueAgeLast;
            let subQuery2 = {
              field: field,
              operator: "<=",
              value: value2
            };
            query.rules.push(subQuery2);
          } else {
            let value = obj.valueAge;
            let subQuery = {
              field: field,
              operator: operator,
              value: value
            };
            query.rules.push(subQuery);
          }
          break;
        }
        case "Gi???i t??nh": {
          let value = obj.valueSexId;
          let subQuery = {
            field: field,
            operator: operator,
            value: value
          };
          query.rules.push(subQuery);
          break;
        }
        case "Doanh thu": {
          if (operator == "<>") {
            //Trong kho???ng
            let value1 = obj.valueRevenueFirst;
            let subQuery1 = {
              field: field,
              operator: ">=",
              value: value1
            };
            query.rules.push(subQuery1);

            let value2 = obj.valueRevenueLast;
            let subQuery2 = {
              field: field,
              operator: "<=",
              value: value2
            };
            query.rules.push(subQuery2);
          } else if (operator == "<<>>") {
            //Ph??t sinh trong kho???ng th???i gian
            let value1 = obj.valueDateRevenueFirst;
            let subQuery1 = {
              field: field,
              operator: ">=",
              value: value1
            };
            query.rules.push(subQuery1);

            let value2 = obj.valueDateRevenueLast;
            let subQuery2 = {
              field: field,
              operator: "<=",
              value: value2
            };
            query.rules.push(subQuery2);
          } else if (operator == "><") {
            //Kh??ng ph??t sinh trong kho???ng th???i gian
            let value1 = obj.valueDateRevenueFirst;
            let subQuery1 = {
              field: field,
              operator: "<=",
              value: value1
            };
            query.rules.push(subQuery1);

            let value2 = obj.valueDateRevenueLast;
            let subQuery2 = {
              field: field,
              operator: ">=",
              value: value2
            };
            query.rules.push(subQuery2);
          } else {
            let value = obj.valueRevenue;
            let subQuery = {
              field: field,
              operator: operator,
              value: value
            };
            query.rules.push(subQuery);
          }
          break;
        }
        case "S??? ??i???m hi???n c??": {
          if (operator == "<>") {
            let value1 = obj.valuePointFirst;
            let subQuery1 = {
              field: field,
              operator: ">=",
              value: value1
            };
            query.rules.push(subQuery1);

            let value2 = obj.valuePointLast;
            let subQuery2 = {
              field: field,
              operator: "<=",
              value: value2
            };
            query.rules.push(subQuery2);
          } else {
            let value = obj.valuePoint;
            let subQuery = {
              field: field,
              operator: operator,
              value: value
            };
            query.rules.push(subQuery);
          }
          break;
        }
        case "S???n ph???m": {
          let listProducts = obj.listProducts;
          let value: Array<any> = [];
          listProducts.forEach((product, key) => {
            value.push(product.productId);
          });

          let subQuery = {
            field: field,
            operator: operator,
            value: value
          };
          query.rules.push(subQuery);
          break;
        }
        case "Ng??y sinh nh???t": {
          let value = obj.valueBirthDayId;
          let subQuery = {
            field: field,
            operator: operator,
            value: value
          };
          query.rules.push(subQuery);
          break;
        }
        case "Nh??m kh??ch h??ng": {
          let value = obj.valueCustomerGroupId;
          let subQuery = {
            field: field,
            operator: operator,
            value: value
          };
          query.rules.push(subQuery);
          break;
        }

        default: {
          return;
        }
      }
    });

    return query;
  }

  valueToSQL(value) {
    switch (typeof value) {
      case 'string':
        return "'" + value + "'";
      case 'boolean':
        return value ? '1' : '0';
      case 'number':
        if (isFinite(value)) return value;
    }
  }

  isDefined(value) {
    return value !== undefined;
  }

  basicRulesetToSQL(ruleset) {
    return ruleset.rules.map((rule) => {
      if (rule.rules) {
        return "(" + this.basicRulesetToSQL(rule) + ")";
      }
      var column = rule.field,
        operator, value;

      switch (rule.operator) {
        case "is null":
        case "is not null":
          operator = rule.operator;
          value = "";
          break;
        case "in":
        case "not in":
          operator = rule.operator;
          if (Array.isArray(rule.value) && rule.value.length)
            value = "(" + rule.value.map(this.valueToSQL).filter(this.isDefined).join(", ") + ")";
          break;
        default:
          operator = rule.operator;
          value = this.valueToSQL(rule.value);
          break;
      }

      if (this.isDefined(column) && this.isDefined(value) && this.isDefined(operator)) {
        return "(" + (column + " " + operator + " " + value).trim() + ")";
      }
    }).filter(this.isDefined).join(" " + ruleset.condition + " ");
  }
  /*End*/

  /*Event: X??? l?? c??c n??t checkbox tr??n table result customer*/
  selectAll() {
    if (this.masterCheck) {
      for (var item of this.listDataUser) {
        if (item.isChecked) {
          item.isChecked = !item.isChecked;
        }
      }
    } else {
      for (var item of this.listDataUser) {
        item.isChecked = !item.isChecked;
      }
    }
    this.masterCheck = !this.masterCheck;

    if (this.listDataUser.find(item => item.isChecked == true) == undefined) {
      this.resultFilteredCustomer = 0;
    } else {
      var count = 0;
      this.listDataUser.forEach(item => {
        if (item.isChecked) {
          count++;
        }
      });
      this.resultFilteredCustomer = count;
    }

    if (this.resultFilteredCustomer == 0) {
      this.isNoData = 1;
    } else {
      this.isNoData = 0;
    }
  }

  changeChecked(customerId) {
    if (!this.masterCheck) {
      this.masterCheck = !this.masterCheck
    }
    for (var item of this.listDataUser) {
      if (item.customerId == customerId) {
        item.isChecked = !item.isChecked;
      }
    }
    var count = 0;
    if (this.masterCheck) {
      for (let item of this.listDataUser) {
        if (item.isChecked) {
          count++;
        }
      }
      if (count == 0) {
        this.masterCheck = false;
      }
    }
    this.resultFilteredCustomer = count;
    if (count == 0) {
      this.isNoData = 1;
    } else {
      this.isNoData = 0;
    }
  }
  /*End*/

  validateFilters() {
    let result = true;
    if (this.listFilterModel.length > 0) {
      //ki???m tra d??? li???u tr??? v??? ???? ????? ch??a
      this.listFilterModel.forEach((item, index) => {
        if (item.criteriaId == null) {
          result = false;
        } else {
          let criteriaId = item.criteriaId;
          let criteriaName = this.listCriteria.find(item => item.criteriaId == criteriaId).criteriaName;
          if (item.conditionId == null && item.criteriaId != 10) {
            result = false;
          } else {
            switch (criteriaName) {
              case "Lo???i kh??ch h??ng": {
                let valueGroupId = item.valueGroupId;
                if (valueGroupId == null) {
                  result = false;
                }
                break;
              }
              case "????? tu???i": {
                let conditionId = item.conditionId;
                let conditionName = this.listParentCondition[index].find(item => item.conditionId == conditionId).conditionName;

                if (conditionName == "Trong kho???ng") {
                  if (item.valueAgeFirst == null || item.valueAgeLast == null || item.valueAgeFirst < 0 || item.valueAgeLast < 0) {
                    result = false;
                  } else if (item.valueAgeFirst > item.valueAgeLast) {
                    result = false;
                  }
                } else {
                  if (item.valueAge == null || item.valueAge < 0) {
                    result = false;
                  }
                }
                break;
              }
              case "Gi???i t??nh": {
                let valueSexId = item.valueSexId;
                if (valueSexId == null) {
                  result = false;
                }
                break;
              }
              case "Doanh thu": {
                let conditionId = item.conditionId;
                let conditionName = this.listParentCondition[index].find(item => item.conditionId == conditionId).conditionName;

                if (conditionName == "Trong kho???ng") {
                  if (item.valueRevenueFirst == null || item.valueRevenueLast == null || item.valueRevenueFirst < 0 || item.valueRevenueLast < 0) {
                    result = false;
                  } else if (item.valueRevenueFirst > item.valueRevenueLast) {
                    result = false;
                  }
                } else if (conditionName == "Ph??t sinh trong kho???ng" || conditionName == "Kh??ng ph??t sinh trong kho???ng") {
                  if (item.valueDateRevenueFirst == null || item.valueDateRevenueLast == null) {
                    result = false;
                  }
                } else {
                  if (item.valueRevenue == null || item.valueRevenue < 0) {
                    result = false;
                  }
                }
                break;
              }
              case "S??? ??i???m hi???n c??": {
                let conditionId = item.conditionId;
                let conditionName = this.listParentCondition[index].find(item => item.conditionId == conditionId).conditionName;

                if (conditionName == "Trong kho???ng") {
                  if (item.valuePointFirst == null || item.valuePointLast == null) {
                    result = false;
                  }
                } else {
                  if (item.valuePoint == null) {
                    result = false;
                  }
                }
                break;
              }
              case "S???n ph???m": {
                if (!item.listProducts || item.listProducts.length == 0) {
                  result = false;
                }
                break;
              }
              case "Ng??y sinh nh???t": {
                let valueBirthDayId = item.valueBirthDayId;
                if (valueBirthDayId == null) {
                  result = false;
                }
                break;
              }
              case "Nh??m kh??ch h??ng": {
                let valueCustomerGroupId = item.valueCustomerGroupId;
                if (valueCustomerGroupId == null) {
                  result = false;
                }
                break;
              }

              default: {
                result = true;
              }
            }
          }
        }
      });
    } else {
      //ch??a t???o b??? l???c
      result = false;
    }

    return result;
  }

  goToFollowProcessCustomerCare() {
    //Redirect ?????n trang Theo d??i ch????ng tr??nh ch??m s??c kh??ch h??ng
    let _title = "XA??C NH????N";
    let _content = "B???n c?? mu???n h???y b??? s???a n???i dung ch????ng tr??nh CSKH?";
    this.dialogPopup = this.dialogPop.open(PopupComponent,
      {
        width: '500px',
        height: '300px',
        autoFocus: false,
        data: { title: _title, content: _content }
      });

    this.dialogPopup.afterClosed().subscribe(async result => {
      if (result) {
        this.router.navigate(['/customer/care-list', {}]);
      }
    });
  }

  goToCreateProcessCustomerCare() {
    //Sang b?????c 2 v???i t???p kh??ch h??ng ???? ???????c l???c ra
    this.isSkip = false;
    this.listCustomerId = [];
    this.listDataUser.forEach(item => {
      if (item.isChecked) {
        this.listCustomerId.push(item.customerId);
      }
    });
    this.step = 2;
  }

  /*EVENT: T???O CH????NG TR??NH CH??M S??C KH??CH H??NG*/

  //Thay ?????i H??nh th???c
  changedCustomerCareContactType(event: any) {
    let selectedData = event.value;

    if (selectedData.categoryCode == "SMS") {
      //N???u l?? G???i SMS
      this.isSendSMS = true;
      this.isSendEmail = false;
      this.isSendGift = false;

      if (this.customerCareModel.IsSendNow == null) {
        this.customerCareModel.IsSendNow = true;
      }
    } else if (selectedData.categoryCode == "Email") {
      //N???u l?? g???i email
      this.isSendEmail = true;
      this.isSendSMS = false;
      this.isSendGift = false;

      if (this.customerCareModel.IsSendEmailNow == null) {
        this.customerCareModel.IsSendEmailNow = true;
      }
    } else if (selectedData.categoryCode == "Gift") {
      //N???u l?? t???ng qu??
      this.isSendGift = true;
      this.isSendEmail = false;
      this.isSendSMS = false;

      if (this.customerCareModel.GiftCustomerType1 != null && this.customerCareModel.GiftCustomerType2 != null) {
        //N???u t???ng qu?? cho c??? 2 lo???i kh??ch h??ng
        this.isShowOptionsGiftType1 = true;
        this.isShowOptionsGiftType2 = true;
      } else if (this.customerCareModel.GiftCustomerType1 != null && this.customerCareModel.GiftCustomerType2 == null) {
        //N???u ch??? t???ng qu?? cho kh??ch h??ng c?? nh??n
        this.isShowOptionsGiftType1 = true;
        this.isShowOptionsGiftType2 = false;
      } else if (this.customerCareModel.GiftCustomerType1 == null && this.customerCareModel.GiftCustomerType2 != null) {
        //N???u ch??? t???ng qu?? cho kh??ch h??ng doanh nghi???p
        this.isShowOptionsGiftType1 = false;
        this.isShowOptionsGiftType2 = true;
      } else {
        //N???u ch??a t???ng qu?? cho lo???i n??o
        this.setDefaultValueCustomerGift();
      }
    } else if (selectedData.categoryCode == "CallPhone") {
      //N???u G???i ??i???n
      this.isSendEmail = false;
      this.isSendSMS = false;
      this.isSendGift = false;
    }
  }

  //Reset Customer Care Model
  resetCustomerCareModel() {
    //Reset value g???i email
    this.customerCareModel.IsSendEmailNow = null;
    this.customerCareModel.SendEmailDate = null;
    this.customerCareModel.SendEmailHour = null;
    this.customerCareModel.CustomerCareContentEmail = null;
    this.isSendEmailAt = false;
    this.isSendEmail = false;

    //Reset value g???i SMS
    this.customerCareContentSMSControl.reset();
    this.customerCareModel.IsSendNow = null;
    this.customerCareModel.SendDate = null;
    this.customerCareModel.SendHour = null;
    this.customerCareModel.CustomerCareContentSMS = null;
    this.isSendSMSAt = false;
    this.isSendSMS = false;

    //Reset value t???ng qu??
    this.giftTotal1Control.reset();
    this.giftTotal2Control.reset();
    this.customerCareModel.GiftCustomerType1 = null;
    this.customerCareModel.GiftTypeId1 = null;
    this.customerCareModel.GiftTotal1 = null;
    this.customerCareModel.GiftCustomerType2 = null;
    this.customerCareModel.GiftTypeId2 = null;
    this.customerCareModel.GiftTotal2 = null;
    this.isSendGift = false;
    this.isShowOptionsGiftType1 = false;
    this.isShowOptionsGiftType2 = false;
    this.isHasValueCustomerType = true;
  }

  //Reset Form Content Customer Care
  resetFormContentCustomerCare() {
    this.resetCustomerCareModel();
    this.contentProcessCustomerCareForm.reset();
    this.customerCareModel = new CustomerCareModel();
    this.getMasterDataForContentCustomerCare();
  }

  onChangeRadioSendEmail(event: any) {
    if (event.value == 'true') {
      //N???u l?? g???i ngay
      this.sendEmailDateControl.reset();
      this.sendEmailHourControl.reset();
      this.isSendEmailAt = false;
      this.customerCareModel.IsSendEmailNow = true;
      this.customerCareModel.SendEmailDate = null;
      this.customerCareModel.SendEmailHour = null;
    } else {
      //N???u l?? g???i v??o kho???ng th???i gian
      this.isSendEmailAt = true;
      this.customerCareModel.IsSendEmailNow = false;
      this.customerCareModel.SendEmailDate = convertToUTCTime(this.sendEmailDateControl.value);
      this.customerCareModel.SendEmailHour = this.sendEmailHourControl.value;
    }
  }

  //Ch???n email m???u
  selectEmailTemplate() {
    this.dialogSelectTemplateEmail = this.dialogPop.open(TemplateEmailDialogComponent,
      {
        width: '1200px',
        height: 'auto',
        autoFocus: false,
        data: {}
      });

    this.dialogSelectTemplateEmail.afterClosed().subscribe(result => {
      if (result) {
        this.customerCareModel.CustomerCareContentEmail = result.content;
      }
    }, error => { });
  }

  onChangeRadioSendSMS(event: any) {
    if (event.value == 'true') {
      //N???u l?? g???i ngay
      this.isSendSMSAt = false;
      this.customerCareModel.IsSendNow = true;
      this.customerCareModel.SendDate = null;
      this.customerCareModel.SendHour = null;
    } else {
      //N???u l?? g???i v??o kho???ng th???i gian
      this.isSendSMSAt = true;
      this.customerCareModel.IsSendNow = false;
      this.customerCareModel.SendDate = convertToUTCTime(this.sendDateControl.value);
      this.customerCareModel.SendHour = this.sendHourControl.value;
    }
  }

  //Ch???n tin nh???n m???u
  selectSMSTemplate() {
    this.dialogSelectTemplateSMS = this.dialogPop.open(TemplateSmsDialogComponent,
      {
        width: '1200px',
        height: 'auto',
        autoFocus: false,
        data: {}
      });

    this.dialogSelectTemplateSMS.afterClosed().subscribe(result => {
      if (result) {
        this.customerCareModel.CustomerCareContentSMS = result.content;
      }
    }, error => { });
  }

  changedGiftCustomerType1(event: any) {
    let selectedData = event.value;

    if (selectedData.categoryId == 0) {
      this.isShowOptionsGiftType1 = false;
      this.customerCareModel.GiftCustomerType1 = null;
      this.customerCareModel.GiftTypeId1 = null;
      this.customerCareModel.GiftTotal1 = null;

      if (this.isShowOptionsGiftType2 == false) {
        //N???u kh??ng ch???n Lo???i kh??ch h??ng n??o th?? b???t flag b??o l???i
        this.isHasValueCustomerType = false;
      }
    } else {
      this.isHasValueCustomerType = true; //Flag: B??o l???i ph???i ch???n ??t nh???t m???t lo???i kh??ch h??ng
      this.isShowOptionsGiftType1 = true;
      this.customerCareModel.GiftCustomerType1 = this.listDefaultIdCusPer[0].categoryId;

      let defaultId1 = '';
      if (this.listGiftTypeId1.length > 0) {
        defaultId1 = this.listGiftTypeId1[0].categoryId;
        this.customerCareModel.GiftTypeId1 = defaultId1;
      }
      this.customerCareModel.GiftTotal1 = 1;
    }
  }

  changedGiftCustomerType2(event: any) {
    let selectedData = event.value;

    if (selectedData.categoryId == 0) {
      this.isShowOptionsGiftType2 = false;
      this.customerCareModel.GiftCustomerType2 = null;
      this.customerCareModel.GiftTypeId2 = null;
      this.customerCareModel.GiftTotal2 = null;

      if (this.isShowOptionsGiftType1 == false) {
        //N???u kh??ng ch???n Lo???i kh??ch h??ng n??o th?? b???t flag b??o l???i
        this.isHasValueCustomerType = false;
      }
    } else {
      this.isHasValueCustomerType = true; //Flag: B??o l???i ph???i ch???n ??t nh???t m???t lo???i kh??ch h??ng
      this.isShowOptionsGiftType2 = true;
      this.customerCareModel.GiftCustomerType2 = this.listDefaultIdCusEnterprise[0].categoryId;

      let defaultId2 = '';
      if (this.listGiftTypeId1.length > 0) {
        defaultId2 = this.listGiftTypeId2[0].categoryId;
        this.customerCareModel.GiftTypeId2 = defaultId2;
      }
      this.customerCareModel.GiftTotal2 = 1;
    }
  }

  awaitRes: boolean = false;
  //L??u n???i dung ch????ng tr??nh ch??m s??c kh??ch h??ng
  saveContentCustomerCare() {
    Object.keys(this.contentProcessCustomerCareForm.controls).forEach(key => {
      if (!this.contentProcessCustomerCareForm.controls[key].valid) {
        this.contentProcessCustomerCareForm.controls[key].markAsTouched();
      }
    });

    let check = this.ValidateContentCustomerCare();
    if (check) {
      if (this.isSkip) {
        //N???u l?? b??? qua b?????c l???c th??
        this.listFilterModel = [];
      }
      let stringFilterModel = this.listFilterModel;
      var strFilterModel = JSON.stringify(stringFilterModel);
      //N???u t???t c??? d??? li???u nh???p ????ng
      if (this.isSendEmail) {
        //N???u l?? G???i email
        this.resetCustomerCareByContactType('isSendEmail');

        this.customerCareModel.CustomerCareContentEmail = this.customerCareContentEmailControl.value;
      } else if (this.isSendSMS) {
        //N???u l?? G???i SMS
        this.resetCustomerCareByContactType('isSendSMS');
        this.customerCareModel.CustomerCareContentSMS = this.customerCareContentSMSControl.value;
      } else if (this.isSendGift) {
        //N???u l?? G???i qu??
        this.resetCustomerCareByContactType('isSendGift');
        // lo???i KH
        this.customerCareModel.GiftCustomerType1 = this.giftCustomerType1Control.value.categoryId
        this.customerCareModel.GiftCustomerType2 = this.giftCustomerType2Control.value.categoryId

        // loai qua
        this.customerCareModel.GiftTypeId1 = this.giftTypeId1Control.value.categoryId
        this.customerCareModel.GiftTypeId2 = this.giftTypeId2Control.value.categoryId
      } else if (this.isSendEmail == false && this.isSendSMS == false && this.isSendGift == false) {
        //N???u l?? G???i ??i???n
        this.resetCustomerCareByContactType('isSendPhone');
      }

      if (this.listCustomerId.length == 1) {
        this.customerCareModel.CustomerCareType = 1;
      } else if (this.listCustomerId.length > 1) {
        this.customerCareModel.CustomerCareType = 2;
      }

      // thoi gian ap dung
      this.customerCareModel.EffecttiveFromDate = convertToUTCTime(this.effecttiveFromDateControl.value)
      this.customerCareModel.EffecttiveToDate = convertToUTCTime(this.effecttiveToDateControl.value)

      // hinh thuc
      this.customerCareModel.CustomerCareContactType = this.customerCareContactTypeControl.value.categoryId;

      // trang thai
      this.customerCareModel.StatusId = this.statusIdControl.value.categoryId

      this.customerCareModel.CreateById = this.userId;
      let listTypeCustomerCode: Array<any> = [];
      this.SelectedTypeCustomer.forEach(x => {
        if (x) {
          listTypeCustomerCode.push(x.code);
        }
      })

      // File ????nh k??m
      // this.file = new Array<File>();
      // this.uploadedFiles.forEach(item => {
      //   this.file.push(item);
      // });

      //T??nh tr???ng email
      let listSelectedTinhTrangEmail: Array<number> = [];
      if (this.listFilterModel?.length > 0) {
        listSelectedTinhTrangEmail = this.SelectedTinhTrangEmail.map(x => x.value);
      }

      this.customerCareModel.IsSentMail = this.selectedValue;
      this.customerCareModel.IsFilterSendMailCondition = this.isFilter;

      this.loading = true;
      this.awaitRes = true;
      this.customerCareService.createCustomerCare(
        this.customerCareModel,
        this.listCustomerId,
        listTypeCustomerCode,
        strFilterModel,
        this.file,
        listSelectedTinhTrangEmail
      ).subscribe(response => {
        let result = <any>response;
        this.loading = false;

        if (result.statusCode !== 200) {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: result.messageCode };
          this.showMessage(msg);
        } else {
          //this.uploadFlileToServer(result.customerCareId)

          let msg = { severity: 'success', summary: 'Th??ng b??o:', detail: 'L??u th??nh c??ng' };
          this.showMessage(msg);

          setTimeout(() => {
            this.router.navigate(['/customer/care-list', {}]);
          }, 1000);
        }
      });
    }
  }
  /*END*/

  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  async uploadFlileToServer(objectId: string) {
    if (this.uploadedFiles.length == 0) return;
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
      fileUpload.FileInFolder.objectId = objectId;
      fileUpload.FileInFolder.objectType = 'CSKH';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    this.forderConfigurationService.uploadFileByFolderType("CSKH",
      listFileUploadModel, this.emptyGuid).subscribe(res => {
        let result: any = res;
        if (result.statusCode != 200) {
          let msg = { severity: 'error', summary: 'Th??ng b??o:', detail: 'Th??m file ????nh k??m th???t b???i' };
          this.showMessage(msg);
        }
      });
    this.uploadedFiles = [];
  }

  /*Validate N???i dung CSKH*/
  ValidateContentCustomerCare() {
    let result = false; //M???c ?????nh tr??? v??? l???i d??? li???u

    if (this.effecttiveFromDateControl.valid && this.effecttiveToDateControl.valid &&
      this.customerCareTitleControl.valid && this.customerCareContentControl.valid &&
      this.expectedAmountControl.valid) {
      //N???u d??? li???u nh???p v??o ch??nh x??c th?? ki???m tra ti???p xem form ??ang ??? n???i dung n??o: Send Email, Send SMS, T???ng qu???
      if (this.isSendEmail) {
        if (this.isSendEmailAt) {
          if (this.sendEmailDateControl.valid && this.sendEmailHourControl.valid) {
            //T???o n???i dung CSKH
            result = true;
          }
        } else {
          if (this.customerCareContentEmailControl.valid) {
            //T???o n???i dung CSKH
            result = true;
          }
        }
      } else if (this.isSendSMS) {
        if (this.isSendSMSAt) {
          if (this.sendDateControl.valid && this.sendHourControl.valid) {
            //T???o n???i dung CSKH
            result = true;
          }
        } else {
          if (this.customerCareContentSMSControl.valid) {
            //T???o n???i dung CSKH
            result = true;
          }
        }
      } else if (this.isSendGift) {
        if (this.isHasValueCustomerType) {
          if (this.giftTotal1Control.valid && this.giftTotal2Control.valid) {
            //T???o n???i dung CSKH
            result = true;
          }
        }
      } else {
        result = true;
      }
    }
    return result;
  }
  /*End*/

  //Ki???m tra xem 1 object c?? null hay kh??ng
  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  resetCustomerCareByContactType(code: string) {
    if (code == 'isSendEmail') {
      this.customerCareModel.CustomerCareContentSMS = null;
      this.customerCareModel.IsSendNow = null;
      this.customerCareModel.SendDate = null;
      this.customerCareModel.SendHour = null;

      this.customerCareModel.CustomerCareVoucher = null;
      this.customerCareModel.DiscountAmount = null;
      this.customerCareModel.PercentDiscountAmount = null;

      this.customerCareModel.GiftCustomerType1 = null;
      this.customerCareModel.GiftTypeId1 = null;
      this.customerCareModel.GiftTotal1 = null;

      this.customerCareModel.GiftCustomerType2 = null;
      this.customerCareModel.GiftTypeId2 = null;
      this.customerCareModel.GiftTotal2 = null;
    } else if (code == 'isSendSMS') {
      this.customerCareModel.CustomerCareContentEmail = null;
      this.customerCareModel.IsSendEmailNow = null;
      this.customerCareModel.SendEmailDate = null;
      this.customerCareModel.SendEmailHour = null;

      this.customerCareModel.CustomerCareVoucher = null;
      this.customerCareModel.DiscountAmount = null;
      this.customerCareModel.PercentDiscountAmount = null;

      this.customerCareModel.GiftCustomerType1 = null;
      this.customerCareModel.GiftTypeId1 = null;
      this.customerCareModel.GiftTotal1 = null;

      this.customerCareModel.GiftCustomerType2 = null;
      this.customerCareModel.GiftTypeId2 = null;
      this.customerCareModel.GiftTotal2 = null;
    } else if (code == 'isSendGift') {
      this.customerCareModel.CustomerCareContentSMS = null;
      this.customerCareModel.IsSendNow = null;
      this.customerCareModel.SendDate = null;
      this.customerCareModel.SendHour = null;

      this.customerCareModel.CustomerCareContentEmail = null;
      this.customerCareModel.IsSendEmailNow = null;
      this.customerCareModel.SendEmailDate = null;
      this.customerCareModel.SendEmailHour = null;

      this.customerCareModel.CustomerCareVoucher = null;
      this.customerCareModel.DiscountAmount = null;
      this.customerCareModel.PercentDiscountAmount = null;
    } else if (code == 'isSendPhone') {
      this.customerCareModel.CustomerCareContentSMS = null;
      this.customerCareModel.IsSendNow = null;
      this.customerCareModel.SendDate = null;
      this.customerCareModel.SendHour = null;

      this.customerCareModel.CustomerCareContentEmail = null;
      this.customerCareModel.IsSendEmailNow = null;
      this.customerCareModel.SendEmailDate = null;
      this.customerCareModel.SendEmailHour = null;

      this.customerCareModel.CustomerCareVoucher = null;
      this.customerCareModel.DiscountAmount = null;
      this.customerCareModel.PercentDiscountAmount = null;

      this.customerCareModel.GiftCustomerType1 = null;
      this.customerCareModel.GiftTypeId1 = null;
      this.customerCareModel.GiftTotal1 = null;

      this.customerCareModel.GiftCustomerType2 = null;
      this.customerCareModel.GiftTypeId2 = null;
      this.customerCareModel.GiftTotal2 = null;
    }
  }

  replate_token(token: string) {
    let current_content = this.customerCareContentEmailControl.value;
    current_content = current_content + token;
    this.customerCareContentEmailControl.setValue(current_content);
  }

  replate_token_sms(token: string) {
    this.customerCareModel.CustomerCareContentSMS = this.customerCareModel.CustomerCareContentSMS + token;
  }

  goToCustomerDetail(customerId, contactId) {
    this.router.navigate(['/customer/detail', { customerId: customerId, contactId: contactId, defaultTab: 3 }]);
  }

  //Filter Validator ng??y kh??ng <= ng??y hi???n t???i
  myFilter = (d: Date): boolean => {
    let day = d;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return (day >= now);
  }

  /*X??a d??? li???u ?? ng?????i ph??? tr??ch*/
  clearDataEmployeeCharge() {
    this.employeeChargeControl.reset();
    this.customerCareModel.EmployeeCharge = null;
  }
  /*End*/

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

  handleChange() {
    if (this.isFilter) {
      this.selectedValue = null;
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
