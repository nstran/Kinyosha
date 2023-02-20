
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductModel, ProductModel2, ProductQuantityInWarehouseModel, ProductAttributeCategory, ProductImageModel, InventoryReportModel, ProductVendorMappingModel, PriceProductModel, DetailProductModel } from '../models/product.model';
import { VendorModel } from '../../vendor/models/vendor.model';
import { ProductAttributeCategoryModel } from '../models/productAttributeCategory.model';
@Injectable()
export class ProductService {
  constructor(private httpClient: HttpClient) {}

  searchProduct(
    productName: string,
    productCode: string,
    listProductCategory: Array<string>,
    listVendor: Array<string>
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/searchProduct";
    return this.httpClient
      .post(url, {
        ProductName: productName,
        ProductCode: productCode,
        ListProductCategory: listProductCategory,
        ListVendor: listVendor,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  createProduct(product: ProductModel, ListConfigurationProductEntity: null) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/createProduct";
    return this.httpClient
      .post(url, {
        Product: product,
        listConfigurationProductEntity: ListConfigurationProductEntity,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  createProductAsync(
    product: ProductModel,
    ListConfigurationProductEntity: any,
    ListProductVendorMapping: Array<ProductVendorMappingModel>,
    userId: string
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/createProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          Product: product,
          ListConfigurationProductEntity: ListConfigurationProductEntity,
          ListProductVendorMapping: ListProductVendorMapping,
          UserId: userId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  updateConfigurationProductMappingAsync(
    productId: any,
    listConfigurationProductEntity: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/updateConfigurationProductMapping";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductId: productId,
          ListConfigurationProductEntity: listConfigurationProductEntity
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  deleteConfigurationProductAsync(
    configurationProductId: any
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/deleteConfigurationProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ConfigurationProductId: configurationProductId
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getProductByID(productId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/GetProductByID";
    return this.httpClient
      .post(url, {
        ProductId: productId,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  updateProductAsync(
    product: ProductModel2,
    listProductVendorMapping: Array<any>
  ) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/UpdateProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          Product: product,
          // ListConfigurationProductEntity: listConfigurationProductEntity,
          ListProductVendorMapping: listProductVendorMapping,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  updateActiveProduct(productId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/updateActiveProduct";
    return this.httpClient
      .post(url, {
        ProductId: productId,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }

  getProductAttributeByProductID(productId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/getProductAttributeByProductID";
    return this.httpClient
      .post(url, {
        ProductId: productId,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }
  getProductByVendorID(vendorId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/getProductByVendorID";
    return this.httpClient
      .post(url, {
        VendorId: vendorId,
      })
      .pipe(
        map((response: Response) => {
          return response;
        })
      );
  }
  getProductByVendorIDAsync(vendorId: string) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/getProductByVendorID";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { VendorId: vendorId })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }
  getListCodeAsync() {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/getAllProductCode";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchProductAsync(
    productType: number,
    productName: string,
    productCode: string
  ) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/searchProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductType: productType,
          ProductName: productName,
          ProductCode: productCode,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  searchProductKinyoshaAsync(
    productType: number,
    productName: string,
    productCode: string,
    listProductCategory: Array<string>,
    listVendor: Array<string>
  ) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/searchProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductType: productType,
          ProductName: productName,
          ProductCode: productCode,
          //ListProductCategory: listProductCategory,
          //ListVendor: listVendor,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getListProduct(productType: number) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/getListProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { ProductType: productType })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  // getMasterdataCreateProduct(productType: number) {
  //   const url =
  //     localStorage.getItem("ApiEndPoint") +
  //     "/api/Product/getMasterdataCreateProduct";
  //   return this.httpClient
  //     .post(url, {
  //       ProductType: productType,
  //     })
  //     .pipe(
  //       map((response: Response) => {
  //         return response;
  //       })
  //     );
  // }

  getMasterdataCreateProduct(productType: number) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/getMasterdataCreateProduct";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { ProductType: productType })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  addSerialNumber(productId: string) {
    let url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/dddSerialNumber";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { ProductId: productId })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getProductByIDAsync(productId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/GetProductByID";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductId: productId,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  downloadProductImage(listImageUrl: Array<string>) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/file/downloadProductImage";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ListFileUrl: listImageUrl,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getMasterDataVendorDialog() {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/getMasterDataVendorDialog";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  downloadTemplateProduct() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/downloadTemplateProductService";
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  downloadTemplateProductTP() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/downloadTemplateThanhPhamService";
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  importProduct(listProduct: Array<DetailProductModel>) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/importProduct";
    return this.httpClient.post(url, { ListProduct: listProduct }).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  importProductAsync(listProduct: any, listProductVendorMapping: any) {
    let url = localStorage.getItem("ApiEndPoint") + "/api/Product/importProduct";
   
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, { ListProduct: listProduct, ListProductVendorMapping: listProductVendorMapping })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  getMasterDataPriceList() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/getMasterDataPriceList";
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  createOrUpdatePriceProduct(priceProduct: PriceProductModel) {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/createOrUpdatePriceProduct";
    return this.httpClient.post(url, { PriceProduct: priceProduct }).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  deletePriceProduct(priceProductId: string) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/deletePriceProduct";
    return this.httpClient.post(url, { PriceProductId: priceProductId }).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  getDataCreateUpdateBOM() {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/getDataCreateUpdateBOM";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {})
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  downloadPriceProductTemplate() {
    const url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/downloadPriceProductTemplate";
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  importPriceProduct(list: Array<PriceProductModel>) {
    const url =
      localStorage.getItem("ApiEndPoint") + "/api/Product/importPriceProduct";
    return this.httpClient.post(url, { ListPriceProduct: list }).pipe(
      map((response: Response) => {
        return <any>response;
      })
    );
  }

  createThuocTinhSanPham(productId: string, thuocTinh: any) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/createThuocTinhSanPham";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductId: productId,
          ThuocTinh: thuocTinh,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  deleteThuocTinhSanPham(id: string) {
    let url =
      localStorage.getItem("ApiEndPoint") +
      "/api/Product/deleteThuocTinhSanPham";
    return new Promise((resolve, reject) => {
      return this.httpClient
        .post(url, {
          ProductAttributeCategoryId: id,
        })
        .toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }
}
