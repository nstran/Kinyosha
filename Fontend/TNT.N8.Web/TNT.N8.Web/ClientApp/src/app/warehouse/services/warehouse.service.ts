import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import { WarehouseModel } from '../models/warehouse.model';
import { ProductQuantityInWarehouseModel, Serial } from '../../product/models/product.model';
import { InventoryReceivingVoucherModel } from '../models/InventoryReceivingVoucher.model';
import { InventoryReceivingVoucherMapping } from '../models/inventoryReceivingVoucherMapping.model';
import { SanPhamPhieuNhapKhoModel } from '../models/sanPhamPhieuNhapKhoModel.model';

@Injectable()
export class WarehouseService {
  userId: string = JSON.parse(localStorage.getItem("auth")).UserId;

  constructor(private httpClient: HttpClient) {}

  createWareHouse(wareHouse: WarehouseModel) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateWareHouse";
    return this.httpClient
      .post(url, {
        WareHouse: wareHouse,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  createWareHouseAsync(wareHouse: WarehouseModel) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateWareHouse";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WareHouse: wareHouse,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  updateWareHouse(wareHouse: WarehouseModel) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateWareHouse";
    return this.httpClient
      .post(url, { WareHouse: wareHouse })
      .map((response: Response) => {
        return <any>response;
      });
  }

  searchWareHouse() {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/searchWareHouse";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  downloadTemplateSerial() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/downloadTemplateSerial";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  searchWareHouseAsync() {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/searchWareHouse";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getWareHouseCha() {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getWareHouseCha";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  getVendorOrderDetailByVenderOrderId(listId: any[], typeWarehouseVocher: any) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getVendorOrderDetailByVenderOrderId";
    return this.httpClient
      .post(url, {
        TypeWarehouseVocher: typeWarehouseVocher,
        ListVendorOrderId: listId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  createOrUpdateInventoryVoucher(
    inventoryReceivingVoucher: any,
    inventoryReceivingVoucherMapping: Array<any>,
    fileList: File[],
    noteContent: string,
    userId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createOrUpdateInventoryVoucher";

    let formData: FormData = new FormData();
    if (fileList !== null) {
      for (var i = 0; i < fileList.length; i++) {
        formData.append("fileList", fileList[i]);
      }
    }

    formData.append(
      "inventoryReceivingVoucher",
      JSON.stringify(inventoryReceivingVoucher)
    );

    formData.append(
      "inventoryReceivingVoucherMapping",
      JSON.stringify(inventoryReceivingVoucherMapping)
    );

    formData.append("noteContent", noteContent);

    formData.append("UserId", userId);

    return this.httpClient.post(url, formData).pipe(
      map((response: Response) => {
        return response;
      })
    );
  }

  createUpdateInventoryVoucher(
    inventoryDeliveryVoucher: any,
    inventoryyDeliveryVoucherMapping: Array<any>,
    noteContent: string,
    screenType: number
  ) {
    debugger;
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateInventoryDeliveryVoucher";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucher: inventoryDeliveryVoucher,
        InventoryyDeliveryVoucherMapping: inventoryyDeliveryVoucherMapping,
        NoteContent: noteContent,
        ScreenType: screenType,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  removeWareHouse(wareHouseId: string) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/removeWareHouse";
    return this.httpClient
      .post(url, {
        WareHouseId: wareHouseId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getInventoryReceivingVoucherById(id: string, userId: any) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getInventoryReceivingVoucherById";

    return this.httpClient.post(url, { Id: id }).map((response: Response) => {
      return <any>response;
    });
  }

  getListInventoryReceivingVoucher(
    voucherCode: string,
    listStatusSelectedId: Array<any>,
    listWarehouseSelectedId: Array<any>,
    listCreateVoucherSelectedId: Array<any>,
    listStorekeeperSelectedId: Array<any>,
    listVendorSelectedId: Array<any>,
    listProductSelectedId: Array<any>,
    listCreateDate: Array<Date>,
    listInventoryReceivingDate: Array<Date>,
    serial: string,
    userId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getListInventoryReceivingVoucher";

    return this.httpClient
      .post(url, {
        VoucherCode: voucherCode,
        listStatusSelectedId: listStatusSelectedId,
        listWarehouseSelectedId: listWarehouseSelectedId,
        listCreateVoucherSelectedId: listCreateVoucherSelectedId,
        listStorekeeperSelectedId: listStorekeeperSelectedId,
        listVendorSelectedId: listVendorSelectedId,
        listProductSelectedId: listProductSelectedId,
        listCreateDate: listCreateDate,
        listInventoryReceivingDate: listInventoryReceivingDate,
        serial: serial,
        UserId: userId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getListCustomerOrderByIdCustomerId(customerId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getListCustomerOrderByIdCustomerId";

    return this.httpClient
      .post(url, { CustomerId: customerId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getCustomerOrderDetailByCustomerOrderId(
    listCustomerOrderId: Array<any>,
    typeWarehouseVocher: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getCustomerOrderDetailByCustomerOrderId";

    return this.httpClient
      .post(url, {
        TypeWarehouseVocher: typeWarehouseVocher,
        ListCustomerOrderId: listCustomerOrderId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  checkQuantityActualReceivingVoucher(objectId: any, type: number) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/checkQuantityActualReceivingVoucher";

    return this.httpClient
      .post(url, { ObjectId: objectId, Type: type })
      .map((response: Response) => {
        return <any>response;
      });
  }

  filterVendor() {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/filterVendor";

    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  filterCustomer() {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/filterCustomer";

    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  changeStatusInventoryReceivingVoucher(inventoryReceivingVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/changeStatusInventoryReceivingVoucher";

    return this.httpClient
      .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  deleteInventoryReceivingVoucher(inventoryReceivingVoucherId: any) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/deleteInventoryReceivingVoucher";

    return this.httpClient
      .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  deleteInventoryReceivingVoucherAysnc(inventoryReceivingVoucherId: any) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/deleteInventoryReceivingVoucher";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  inventoryDeliveryVoucherFilterVendorOrder() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/inventoryDeliveryVoucherFilterVendorOrder";

    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  inventoryDeliveryVoucherFilterVendorOrderAsyc() {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/inventoryDeliveryVoucherFilterVendorOrder";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getInventoryInfoSXAsync(
    organizationId: string,
    warehouseType: number,
    fromNgay: Date,
    toNgay: Date,
    warehouseId: string
  ) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getInventoryInfoSX";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          OrganizationId: organizationId,
          WarehouseType: warehouseType,
          FromNgay: fromNgay,
          ToNgay: toNgay,
          WarehouseId: warehouseId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  inventoryDeliveryVoucherFilterCustomerOrder() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/inventoryDeliveryVoucherFilterCustomerOrder";

    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  inventoryDeliveryVoucherFilterCustomerOrderAsyc() {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/inventoryDeliveryVoucherFilterCustomerOrder";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getTop10WarehouseFromReceivingVoucher() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getTop10WarehouseFromReceivingVoucher";

    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  getTop10WarehouseFromReceivingVoucherAsync() {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getTop10WarehouseFromReceivingVoucher";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getInventoryDeliveryVoucherByIdAsync(id: string, warehouseType: number) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getInventoryDeliveryVoucherById";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          Id: id,
          WarehouseType: warehouseType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchInventoryDeliveryVoucherSX(
    organizationId: string,
    warehouseType: number,
    fromData: any,
    toDate: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInventoryDeliveryVoucherSX";

    return this.httpClient
      .post(url, {
        OrganizationId: organizationId,
        WarehouseType: warehouseType,
        FromDate: fromData,
        ToDate: toDate,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  searchInventoryDeliveryVoucherSXAsync(
    organizationId: string,
    warehouseType: number,
    fromData: any,
    toDate: any
  ) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInventoryDeliveryVoucherSX";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          OrganizationId: organizationId,
          WarehouseType: warehouseType,
          FromDate: fromData,
          ToDate: toDate,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getSerial(warehouseId: any, productId: any) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getSerial";

    return this.httpClient
      .post(url, { WarehouseId: warehouseId, ProductId: productId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getSerialAsync(warehouseId: any, productId: any) {
    let url = localStorage.getItem("ApiEndPoint") + "/api/warehouse/getSerial";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { WarehouseId: warehouseId, ProductId: productId })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  createUpdateInventoryDeliveryVoucher(
    inventoryReceivingVoucher: any,
    inventoryReceivingVoucherMapping: Array<any>,
    fileList: File[],
    noteContent: string,
    userId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateInventoryDeliveryVoucher";

    let formData: FormData = new FormData();
    if (fileList !== null) {
      for (var i = 0; i < fileList.length; i++) {
        formData.append("fileList", fileList[i]);
      }
    }

    formData.append(
      "inventoryDeliveryVoucher",
      JSON.stringify(inventoryReceivingVoucher)
    );

    formData.append(
      "inventoryyDeliveryVoucherMapping",
      JSON.stringify(inventoryReceivingVoucherMapping)
    );

    formData.append("noteContent", noteContent);

    formData.append("UserId", userId);

    return this.httpClient.post(url, formData).pipe(
      map((response: Response) => {
        return response;
      })
    );
  }

  getInventoryDeliveryVoucherById(id: string, warehouseType: number) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getInventoryDeliveryVoucherById";
    return this.httpClient
      .post(url, { Id: id, WarehouseType: warehouseType })
      .map((response: Response) => {
        return <any>response;
      });
  }

  deleteInventoryDeliveryVoucher(inventoryDeliveryVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/deleteInventoryDeliveryVoucher";
    return this.httpClient
      .post(url, { InventoryDeliveryVoucherId: inventoryDeliveryVoucherId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  changeStatusInventoryDeliveryVoucher(
    inventoryDeliveryVoucherId: string,
    inventoryyDeliveryVoucherMapping: string
    // userId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/changeStatusInventoryDeliveryVoucher";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucherId: inventoryDeliveryVoucherId,
        inventoryyDeliveryVoucherMapping: inventoryyDeliveryVoucherMapping,
        // UserId: userId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  filterCustomerInInventoryDeliveryVoucher() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/filterCustomerInInventoryDeliveryVoucher";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  searchInventoryDeliveryVoucherNVLCCDC(
    warehouseType: number,
    fromDate: any,
    toDate: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInventoryDeliveryVoucherNVLCCDC";

    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        FromDate: fromDate,
        ToDate: toDate,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  searchInventoryDeliveryVoucherNVLCCDCAsync(
    warehouseType: number,
    fromDate: any,
    toDate: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInventoryDeliveryVoucherNVLCCDC";
    return new Promise<any>((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
          FromDate: fromDate,
          ToDate: toDate,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchInventoryDeliveryVoucher(
    voucherCode: string,
    listStatusSelectedId: Array<any>,
    listWarehouseSelectedId: Array<any>,
    listCreateVoucherSelectedId: Array<any>,
    listStorekeeperSelectedId: Array<any>,
    listCustomerSelectedId: Array<any>,
    listProductSelectedId: Array<any>,
    listCreateDate: Array<Date>,
    listInventoryReceivingDate: Array<Date>,
    serial: string,
    userId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInventoryDeliveryVoucher";

    return this.httpClient
      .post(url, {
        VoucherCode: voucherCode,
        listStatusSelectedId: listStatusSelectedId,
        listWarehouseSelectedId: listWarehouseSelectedId,
        listCreateVoucherSelectedId: listCreateVoucherSelectedId,
        listStorekeeperSelectedId: listStorekeeperSelectedId,
        listCustomerSelectedId: listCustomerSelectedId,
        listProductSelectedId: listProductSelectedId,
        listCreateDate: listCreateDate,
        listInventoryReceivingDate: listInventoryReceivingDate,
        serial: serial,
        UserId: userId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  filterProduct(listProductCategory: Array<any>, listProductId: Array<any>) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/filterProduct";
    return this.httpClient
      .post(url, {
        ListProductCategory: listProductCategory,
        ListProductId: listProductId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getProductNameAndProductCode(query: any) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getProductNameAndProductCode";
    return this.httpClient
      .post(url, { Query: query })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getInventoryInfo(
    warehouseType: number,
    fromNgay: Date,
    toNgay: Date,
    warehouseId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getInventoryInfo";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        FromNgay: fromNgay,
        ToNgay: toNgay,
        WarehouseId: warehouseId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getInventoryInfoAsync(
    warehouseType: number,
    fromNgay: Date,
    toNgay: Date,
    warehouseId: string,
    checkTK: boolean
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getInventoryInfo";
    return new Promise<any>((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
          FromNgay: fromNgay,
          ToNgay: toNgay,
          WarehouseId: warehouseId,
          CheckTK: checkTK,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getVendorInvenoryReceiving() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getVendorInvenoryReceiving";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  getCustomerDelivery() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getCustomerDelivery";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  inStockReport(
    lstProduct: Array<any>,
    lstWarehouse: Array<any>,
    fromQuantity: any,
    toQuantity: any,
    serialCode: any,
    userId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/inStockReport";
    return this.httpClient
      .post(url, {
        lstProduct: lstProduct,
        lstWarehouse: lstWarehouse,
        FromQuantity: fromQuantity,
        ToQuantity: toQuantity,
        SerialCode: serialCode,
        UserId: userId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  createUpdateWarehouseMasterdata(warehouseId: string, userId: string) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateWarehouseMasterdata";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseId: warehouseId,
          UserId: userId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////

  getMasterDataSearchInStockReport() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getMasterDataSearchInStockReport";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  searchInventoryDeliveryVoucherRequest(warehouseType) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInventoryDeliveryVoucherRequest";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  danhSachThanhPhamNhan(
    warehouseType: any,
    fromDate: any,
    toDate: any,
    organizationId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/SearchListPhieuNhapKhoTP";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        FromDate: fromDate,
        ToDate: toDate,
        OrganizationId: organizationId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  danhSachThanhPhamXuat(
    warehouseType: any,
    fromDate: any,
    toDate: any,
    organizationId: string
  ) {
    const url = localStorage.getItem("ApiEndPoint") + "/api/warehouse/searchInventoryDeliveryVoucherTP";
    return this.httpClient
      .post(url, { WarehouseType: warehouseType, FromDate: fromDate, ToDate: toDate, OrganizationId: organizationId})
      .map((response: Response) => {
        return <any>response;
      });
  }

  getMasterCreatePhieuNhapKhoNVLCCDC(warehouseType: any) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/GetMasterCreatePhieuNhapKhoNVLCCDC";
    return this.httpClient
      .post(url, { WarehouseType: warehouseType })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getMasterCreatePhieuNhapKhoNVLCCDCAsync(warehouseType: any) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getMasterCreatePhieuNhapKhoNVLCCDC";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getDetailPhieuNhapKhoNVLCCDC(loaiNVL, inventoryReceivingVoucherId) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getDetailPhieuNhapKhoNVLCCDC";
    return this.httpClient
      .post(url, {
        WarehouseType: loaiNVL,
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getDetailPhieuNhapKhoNVLCCDCAsync(loaiNVL, inventoryReceivingVoucherId) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getDetailPhieuNhapKhoNVLCCDC";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: loaiNVL,
          InventoryReceivingVoucherId: inventoryReceivingVoucherId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getDetailNhapKhoSXAsync(loaiNVL, inventoryReceivingVoucherId) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/GetDetailPhieuNhapKhoSX";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: loaiNVL,
          InventoryReceivingVoucherId: inventoryReceivingVoucherId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchInStockReport(
    FromDate: Date,
    ProductNameCode: string,
    ProductCategoryId: string,
    WarehouseId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchInStockReport";
    return this.httpClient
      .post(url, {
        FromDate: FromDate,
        ProductNameCode: ProductNameCode,
        ProductCategoryId: ProductCategoryId,
        WarehouseId: WarehouseId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getMasterInventoryDeliveryVoucherRequest() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/GetMasterInventoryDeliveryVoucher";
    return this.httpClient.post(url, {}).map((response: Response) => {
      return <any>response;
    });
  }

  getMasterInventoryDeliveryVoucherRequestAsync(
    warehouseType: number,
    productType: number
  ) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/GetMasterInventoryDeliveryVoucher";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
          ProductType: productType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getMasterThanhPhamXuatAsync(warehouseType: number) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/GetMasterInventoryDeliveryVoucher";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getListWareHouse(warehouseType: any, organizationId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "api/warehouse/getListWareHouse";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        OrganizationId: organizationId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getListWareHouseAsync(warehouseType: any, organizationId: string) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getListWareHouse";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
          OrganizationId: organizationId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getVendorAsync() {
    let url = localStorage.getItem("ApiEndPoint") + "/api/vendor/getAllVendor";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getVendorOrderByVendorId(vendorId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getVendorOrderByVendorId";
    return this.httpClient
      .post(url, { VendorId: vendorId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getDanhSachSanPhamCuaPhieu(
    listObjectId: Array<string>,
    objectType: number,
    warehouseId: string,
    inventoryReceivingVoucherId?: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getDanhSachSanPhamCuaPhieu";
    return this.httpClient
      .post(url, {
        ListObjectId: listObjectId,
        ObjectType: objectType,
        WarehouseId: warehouseId,
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
      })
      .map((response: Response) => {
        return <any>response;
      });
  }

  getDanhSachKhoCon(warehouseId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getDanhSachKhoCon";
    return this.httpClient
      .post(url, { WarehouseId: warehouseId })
      .map((response: Response) => {
        return <any>response;
      });
  }

  createItemInventoryReport(inventoryReport: ProductQuantityInWarehouseModel) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createItemInventoryReport";
    return this.httpClient.post(url, { InventoryReport: inventoryReport }).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  updateItemInventoryReport(inventoryReport: ProductQuantityInWarehouseModel) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/updateItemInventoryReport";
    return this.httpClient.post(url, { InventoryReport: inventoryReport }).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  createUpdateSerial(
    listSerial: Array<Serial>,
    warehouseId: string,
    productId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/createUpdateSerial";
    return this.httpClient
      .post(url, {
        ListSerial: listSerial,
        WarehouseId: warehouseId,
        ProductId: productId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  deleteItemInventoryReport(inventoryReportId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/deleteItemInventoryReport";
    return this.httpClient
      .post(url, { InventoryReportId: inventoryReportId })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  /*Lấy Số giữ trước của sản phẩm theo kho*/
  getSoGTCuaSanPhamTheoKho(
    productId: string,
    warehouseId: string,
    quantityRequest: number
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getSoGTCuaSanPhamTheoKho";
    return this.httpClient
      .post(url, {
        ProductId: productId,
        WarehouseId: warehouseId,
        QuantityRequest: quantityRequest,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  createPhieuNhapKho(
    warehouseType: number,
    inventoryReceivingVoucher: InventoryReceivingVoucherModel,
    listInventoryReceivingVoucherMapping: Array<InventoryReceivingVoucherMapping>
    // , listFile: Array<any>
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createPhieuNhapKhoNVLCCDC";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        InventoryReceivingVoucher: inventoryReceivingVoucher,
        ListInventoryReceivingVoucherMapping:
          listInventoryReceivingVoucherMapping,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  createPhieuNhapKhoTP(
    warehouseType: number,
    inventoryReceivingVoucher: InventoryReceivingVoucherModel,
    listInventoryReceivingVoucherMapping: Array<InventoryReceivingVoucherMapping>
    // , listFile: Array<any>
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createPhieuNhapKhoTP";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        InventoryReceivingVoucher: inventoryReceivingVoucher,
        ListInventoryReceivingVoucherMapping:
          listInventoryReceivingVoucherMapping,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  updateNhapKho(
    inventoryReceivingVoucher: InventoryReceivingVoucherModel,
    listInventoryReceivingVoucherMapping: Array<InventoryReceivingVoucherMapping>
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/suaPhieuNhapKho";
    return this.httpClient
      .post(url, {
        InventoryReceivingVoucher: inventoryReceivingVoucher,
        ListInventoryReceivingVoucherMapping:
          listInventoryReceivingVoucherMapping,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  guiNhapKho(InventoryReceivingVoucherId) {
    var userId = JSON.parse(localStorage.getItem("auth")).UserId;
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/changeStatusInventoryReceivingVoucher";
    return this.httpClient
      .post(url, {
        InventoryReceivingVoucherId,
        UserId: userId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  guiNhapKhoTP(InventoryReceivingVoucherId) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/changeStatusInventoryReceivingVoucherTP";
    return this.httpClient
      .post(url, {
        InventoryReceivingVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  guiDeNghiXuat(inventoryDeliveryVoucherId) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/ChangeStatusInventoryDeliveryVoucherRequest";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucherId: inventoryDeliveryVoucherId,
        inventoryyDeliveryVoucherMapping: "",
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  guiTrangThaiThanhPhamXuat(inventoryDeliveryVoucherId) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/ChangeStatusInventoryDeliveryVoucherRequest";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucherId: inventoryDeliveryVoucherId,
        inventoryyDeliveryVoucherMapping: "",
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  huyDeNghiXuat(inventoryDeliveryVoucherId) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/changeStatusCancelInventoryDeliveryVoucherRequest";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucherId: inventoryDeliveryVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  pheDuyetPhieuXuat(inventoryDeliveryVoucherId) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/ChangeStatusInventoryDeliveryVoucher";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucherId: inventoryDeliveryVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  searchListPhieuNhapKhoNVLCCDC(warehouseType, fromDate: Date, toDate: Date) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchListPhieuNhapKhoNVLCCDC";
    return this.httpClient
      .post(url, {
        WarehouseType: warehouseType,
        FromDate: fromDate,
        ToDate: toDate,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  searchListPhieuNhapKhoNVLCCDCAsync(
    warehouseType,
    fromDate: Date,
    toDate: Date
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchListPhieuNhapKhoNVLCCDC";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
          FromDate: fromDate,
          ToDate: toDate,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getMasterDataListPhieuNhapKhoAsync(warehouseType, productType) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getMasterDataListPhieuNhapKho";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseType: warehouseType,
          ProductType: productType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchListPhieuNhapKhoSXAsync(
    organizationId: any,
    warehouseType: any,
    fromDate: Date,
    toDate: Date
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchListPhieuNhapKhoSX";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          OrganizationId: organizationId,
          WarehouseType: warehouseType,
          FromDate: fromDate,
          ToDate: toDate,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchListPhieuNhapKhoSX(
    organizationId: any,
    warehouseType: any,
    fromDate: Date,
    toDate: Date
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchListPhieuNhapKhoSX";
    return this.httpClient
      .post(url, {
        OrganizationId: organizationId,
        WarehouseType: warehouseType,
        FromDate: fromDate,
        ToDate: toDate,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  getAllOrganizationAsync() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/organization/getAllOrganization";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  taoPhieuXuatKho(
    inventoryDeliveryVoucher: any,
    inventoryyDeliveryVoucherMapping: Array<any>,
    noteContent: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateInventoryDeliveryVoucherRequest";
    return this.httpClient
      .post(url, {
        InventoryDeliveryVoucher: inventoryDeliveryVoucher,
        InventoryyDeliveryVoucherMapping: inventoryyDeliveryVoucherMapping,
        NoteContent: noteContent,
        // UserId: this.userId
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  taoThanhPhamXuat(
    inventoryDeliveryVoucher: any,
    inventoryyDeliveryVoucherMapping: Array<any>,
    noteContent: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/CreateUpdateInventoryDeliveryVoucher";
    return this.httpClient
      .post(url, {
        ScreenType: 3,
        InventoryDeliveryVoucher: inventoryDeliveryVoucher,
        InventoryyDeliveryVoucherMapping: inventoryyDeliveryVoucherMapping,
        NoteContent: noteContent,
        // UserId: this.userId
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  taoPhieuXuatKhoAsync(
    inventoryDeliveryVoucher: any,
    inventoryyDeliveryVoucherMapping: Array<any>,
    noteContent: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/createUpdateInventoryDeliveryVoucherRequest";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          InventoryDeliveryVoucher: inventoryDeliveryVoucher,
          InventoryyDeliveryVoucherMapping: inventoryyDeliveryVoucherMapping,
          NoteContent: noteContent,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getDetailPhieuNhapKhoTPAsync(
    inventoryReceivingVoucherId: string,
    warehouseType: number
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/GetDetailPhieuNhapKhoTP";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          InventoryReceivingVoucherId: inventoryReceivingVoucherId,
          WarehouseType: warehouseType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getInventoryInfoTPAsync(month: any, fromNgay: any, toNgay: any) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getInventoryInfoTP";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          Month: month,
          FromNgay: fromNgay,
          ToNgay: toNgay,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }
  getChiTietBaoCaoTPAsync(productId: any, fromNgay: any, toNgay: any) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/getChiTietBaoCaoTP";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductId: productId,
          FromNgay: fromNgay,
          ToNgay: toNgay,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getDetailPhieuNhapKho(inventoryReceivingVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getDetailPhieuNhapKho";
    return this.httpClient
      .post(url, {
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  suaPhieuNhapKho(
    inventoryReceivingVoucher: InventoryReceivingVoucherModel,
    listInventoryReceivingVoucherMapping: Array<InventoryReceivingVoucherMapping>
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/suaPhieuNhapKho";
    return this.httpClient
      .post(url, {
        InventoryReceivingVoucher: inventoryReceivingVoucher,
        ListInventoryReceivingVoucherMapping:
          listInventoryReceivingVoucherMapping,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  kiemTraKhaDungPhieuNhapKho(
    listSanPhamPhieuNhapKho: Array<SanPhamPhieuNhapKhoModel>,
    inventoryReceivingVoucherId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/kiemTraKhaDungPhieuNhapKho";
    return this.httpClient
      .post(url, {
        ListSanPhamPhieuNhapKho: listSanPhamPhieuNhapKho,
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  danhDauCanLamPhieuNhapKho(
    inventoryReceivingVoucherId: string,
    check: boolean
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/danhDauCanLamPhieuNhapKho";
    return this.httpClient
      .post(url, {
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
        Check: check,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  nhanBanPhieuNhapKho(inventoryReceivingVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/nhanBanPhieuNhapKho";
    return this.httpClient
      .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  xoaPhieuNhapKho(inventoryReceivingVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/xoaPhieuNhapKho";
    return this.httpClient
      .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  huyPhieuNhapKho(inventoryReceivingVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/huyPhieuNhapKho";
    return this.httpClient
      .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  khongGiuPhanPhieuNhapKho(
    listSanPhamPhieuNhapKho: Array<SanPhamPhieuNhapKhoModel>,
    inventoryReceivingVoucherId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/khongGiuPhanPhieuNhapKho";
    return this.httpClient
      .post(url, {
        ListSanPhamPhieuNhapKho: listSanPhamPhieuNhapKho,
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  kiemTraNhapKho(
    listSanPhamPhieuNhapKho: Array<SanPhamPhieuNhapKhoModel>,
    inventoryReceivingVoucherId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/warehouse/kiemTraNhapKho";
    return this.httpClient
      .post(url, {
        ListSanPhamPhieuNhapKho: listSanPhamPhieuNhapKho,
        InventoryReceivingVoucherId: inventoryReceivingVoucherId,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  datVeNhapPhieuNhapKho(inventoryReceivingVoucherId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/datVeNhapPhieuNhapKho";
    return this.httpClient
      .post(url, { InventoryReceivingVoucherId: inventoryReceivingVoucherId })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  getListProductPhieuNhapKho() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getListProductPhieuNhapKho";
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  getMasterDataListPhieuNhapKho() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getMasterDataListPhieuNhapKho";
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  searchListPhieuNhapKho(
    maPhieu: string,
    fromNgayLapPhieu: Date,
    toNgayLapPhieu: Date,
    fromNgayNhapKho: Date,
    toNgayNhapKho: Date,
    listStatusId: Array<string>,
    listWarehouseId: Array<string>,
    listEmployeeId: Array<string>,
    listProductId: Array<string>,
    serialCode: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/searchListPhieuNhapKho";
    return this.httpClient
      .post(url, {
        MaPhieu: maPhieu,
        FromNgayLapPhieu: fromNgayLapPhieu,
        ToNgayLapPhieu: toNgayLapPhieu,
        FromNgayNhapKho: fromNgayNhapKho,
        ToNgayNhapKho: toNgayNhapKho,
        ListStatusId: listStatusId,
        ListWarehouseId: listWarehouseId,
        ListEmployeeId: listEmployeeId,
        ListProductId: listProductId,
        SerialCode: serialCode,
      })
      .pipe(
        map((response: Response) => {
          return <any>response;
        })
      );
  }

  getEmployeeByOrganizationId(organizationId: string) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getEmployeeByOrganizationId";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          OrganizationId: organizationId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getInventoryStockByWarehouseAsync(warehouseId, inventoryType) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/warehouse/getInventoryStockByWarehouse";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          WarehouseId: warehouseId,
          InventoryType: inventoryType,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }
}
