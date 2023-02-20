using System;
using System.Collections.Generic;
using System.Linq;
using TN.TNM.Common;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.Product;
using TN.TNM.DataAccess.Messages.Results.Admin.Product;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.Product;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.WareHouse;
using System.Net;
using TN.TNM.DataAccess.Models.ProductAttributeCategory;
using TN.TNM.DataAccess.Models.ProductAttributeCategoryValue;
using TN.TNM.DataAccess.Models.ProductCategory;
using TN.TNM.DataAccess.Enum;
using TN.TNM.DataAccess.ConstType;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class ProductDAO : BaseDAO, IProductDataAccess
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public ProductDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IHostingEnvironment hostingEnvironment)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
            _hostingEnvironment = hostingEnvironment;
        }
        public SearchProductResult SearchProduct(SearchProductParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.SEARCH, ObjectName.PRODUCT, "Search product", parameter.UserId);
                var commonProduct = context.Product.ToList();
                var commonCategoryType = context.CategoryType.ToList();
                var commonCategory = context.Category.ToList();

                var productUnitTypeId = commonCategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                var listAllProductUnit = commonCategory.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                var productList = commonProduct.Where(c => c.Active == true && c.ProductType == parameter.ProductType)
                                  .Select(m => new ProductEntityModel
                                  {
                                      ProductId = m.ProductId,
                                      ProductCategoryId = m.ProductCategoryId,
                                      ProductName = m.ProductName,
                                      ProductCode = m.ProductCode,
                                      ProductUnitId = m.ProductUnitId,
                                      Quantity = getQuantityInventoryByProductId(m.ProductId),
                                      ProductUnitName = listAllProductUnit.FirstOrDefault(c => c.CategoryId == m.ProductUnitId)?.CategoryName ?? "",
                                      AccountingCode = m.AccountingCode,
                                  }).ToList();

                #region Kiểm tra điều kiện xóa sản phẩm
                productList.ForEach(item =>
                {
                    var CanDelete = true;
                    var checkDelivery = context.InventoryDeliveryVoucherMapping.FirstOrDefault(f => f.ProductId == item.ProductId);
                    var checkReceiving = context.InventoryReceivingVoucherMapping.FirstOrDefault(f => f.ProductId == item.ProductId);
                    if (checkDelivery != null || checkReceiving != null)
                    {
                        CanDelete = false;
                    }
                });

                #endregion

                return new SearchProductResult
                {
                    StatusCode = HttpStatusCode.OK,
                    ProductList = productList
                };
            }
            catch (Exception ex)
            {
                return new SearchProductResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.ToString()
                };
            }
        }

        public decimal getQuantityInventoryByProductId(Guid productId)
        {
            var product = context.InventoryReport.Where(x => x.ProductId == productId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
            if (product != null)
            {
                return product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
            }

            return 0;
        }

        public void ListChildProductCategory(Guid ProductCategoryID, List<Guid> listResult, List<ProductCategory> commonProductCategory)
        {
            var listProductCategoryChil = commonProductCategory.Where(item => item.ParentId == ProductCategoryID).ToList();
            if (listProductCategoryChil.Count > 0)
            {
                for (int i = 0; i < listProductCategoryChil.Count; ++i)
                {
                    listResult.Add(listProductCategoryChil[i].ProductCategoryId);
                    ListChildProductCategory(listProductCategoryChil[i].ProductCategoryId, listResult, commonProductCategory);
                }
            }
        }
        public CreateProductResult CreateProduct(CreateProductParameter parameter)
        {
            try
            {
                //Check trùng mã sản phẩm
                var existsCode = context.Product.FirstOrDefault(x =>
                    x.Active == true && x.ProductCode == parameter.Product.ProductCode.Trim());

                if (existsCode != null)
                {
                    return new CreateProductResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Mã sản phẩm đã tồn tại"
                    };
                }

                #region Add Product
                var productId = Guid.NewGuid();
                var newProduct = new Databases.Entities.Product
                {
                    ProductId = productId,
                    ProductCategoryId = parameter.Product.ProductCategoryId, // Nhóm sản phẩm
                    ProductName = parameter.Product.ProductName.Trim(),
                    ProductCode = parameter.Product.ProductCode.Trim(),
                    ShortName = parameter.Product.ShortName?.Trim(),
                    ProductUnitId = parameter.Product.ProductUnitId,
                    AccountingCode = parameter.Product.AccountingCode,
                    CreatedDate = DateTime.Now,
                    CreatedById = parameter.UserId,
                    UpdatedById = null,
                    UpdatedDate = null,
                    Active = true,
                    MinimumInventoryQuantity = parameter.Product.MinimumInventoryQuantity, //Số lượng tối thiểu Or Số Sản phẩm trên 1 lô hàng
                    //PropertyId = parameter.Product.PropertyId, // Tính chất sản phẩm
                    Department = parameter.Product.Department,
                    ProductType = parameter.Product.ProductType, //NVL or Thanh Pham
                    ReferencedId = parameter.Product.ReferencedId, // luu NVL tai su dung
                };
                context.Product.Add(newProduct);

                #region Add Mapping Product and Vendors
                if (parameter.ListProductVendorMapping.Count > 0)
                {
                    var listProductVendorMapping = new List<ProductVendorMapping>();
                    parameter.ListProductVendorMapping.ForEach(vendor =>
                    {
                        var productVendorObj = new ProductVendorMapping
                        {
                            ProductVendorMappingId = Guid.NewGuid(),
                            ProductId = productId,
                            VendorId = vendor.VendorId,
                            VendorProductName = vendor.VendorProductName,
                            VendorProductCode = vendor.VendorProductCode,
                            MiniumQuantity = vendor.MiniumQuantity,
                            //UnitPriceId = vendor.MoneyUnitId,
                            Price = vendor.Price,
                            FromDate = vendor.FromDate,
                            ToDate = vendor.ToDate,
                            OrderNumber = vendor.OrderNumber,
                            CreatedById = parameter.UserId,
                            CreatedDate = DateTime.Now,
                            UpdatedById = null,
                            UpdatedDate = null,
                            Active = true
                        };
                        listProductVendorMapping.Add(productVendorObj);
                    });
                    context.ProductVendorMapping.AddRange(listProductVendorMapping);
                }
                #endregion

                #region Update Product BOM nếu thêm thành phẩm
                //if (parameter.Product.ProductType == (int)ProductType.ThanhPham)
                //{
                //    parameter.ListConfigurationProductEntity?.ForEach(bom =>
                //    {
                //        var newConfigurationProduct = new Databases.Entities.ConfigurationProduct()
                //        {
                //            ConfigurationProductId = Guid.NewGuid(),
                //            ProductId = newProduct.ProductId, //lấy theo id sản phẩm vừa tạo
                //            ConfigurationName = bom.ConfigurationName,
                //            StartDate = bom.StartDate,
                //            EndDate = bom.EndDate
                //        };
                //        context.ConfigurationProduct.Add(newConfigurationProduct);

                //        bom.ListConfigurationProductMapping?.ForEach(bommap =>
                //        {
                //            var newConfigurationProductMapping = new Databases.Entities.ConfigurationProductMapping()
                //            {
                //                ConfigurationProductMappingId = Guid.NewGuid(),
                //                ConfigurationProductId = newConfigurationProduct.ConfigurationProductId,
                //                ProductId = newProduct.ProductId, //lấy theo id sản phẩm vừa tạo
                //                StageGroupId = bommap.StageGroupId,
                //                ReuseNg = bommap.ReuseNg,
                //                Quota = bommap.Quota,
                //                Consumption = bommap.Consumption,
                //                CreatedById = parameter.UserId,
                //                CreatedDate = DateTime.Now
                //            };
                //            context.ConfigurationProductMapping.Add(newConfigurationProductMapping);
                //        });
                //    });
                //}
                #endregion

                var productResponse = new DataAccess.Models.Product.ProductEntityModel()
                {
                    ProductId = newProduct.ProductId,
                    ProductName = newProduct.ProductName,
                    ProductCode = newProduct.ProductCode,
                };

                #endregion

                context.SaveChanges();

                #region Lưu nhật ký hệ thống

                LogHelper.AuditTrace(context, ActionName.Create, ObjectName.PRODUCT, productId, parameter.UserId);

                #endregion

                return new CreateProductResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Tạo sản phẩm/dịch vụ thành công",
                    ProductId = productId,
                    NewProduct = productResponse
                };
            }
            catch (Exception ex)
            {
                return new CreateProductResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.ToString()
                };
            }
        }

        public ImportProductResult ImportProduct(ImportProductParameter parameter)
        {
            var products = new List<Product>();
            parameter.ListProduct.ForEach(item =>
            {
                var productId = Guid.NewGuid();
                var newProduct = new Databases.Entities.Product
                {
                    ProductId = Guid.NewGuid(),
                    ProductCategoryId = item.ProductCategoryId,
                    ProductName = item.ProductName.Trim(),
                    ProductCode = item.ProductCode.Trim(),
                    Price1 = item.Price1,
                    CreatedDate = DateTime.Now,
                    ProductUnitId = item.ProductUnitId,
                    ProductDescription = item.ProductDescription?.Trim(),
                    Vat = item.Vat,
                    ProductMoneyUnitId = item.ProductMoneyUnitId,
                    GuaranteeTime = item.GuaranteeTime,
                    ExWarehousePrice = item.ExWarehousePrice,
                    CreatedById = parameter.UserId,
                    //default values
                    UpdatedById = null,
                    Price2 = 0,
                    UpdatedDate = null,
                    Active = true,
                    Quantity = 0,
                    Guarantee = null,
                    GuaranteeDatetime = null,
                    MinimumInventoryQuantity = item.MinimumInventoryQuantity, //trường số lượng tồn kho tối thiểu chuyển qua dùng ở bảng InventoryReport, trường QuantityMinimun
                    CalculateInventoryPricesId = item.CalculateInventoryPricesId,
                    PropertyId = item.PropertyId,
                    WarehouseAccountId = item.WarehouseAccountId,
                    RevenueAccountId = item.RevenueAccountId,
                    PayableAccountId = item.PayableAccountId,
                    ImportTax = item.ImportTax,
                    ProductType = item.ProductType,
                    CostPriceAccountId = item.CostPriceAccountId,
                    AccountReturnsId = item.AccountReturnsId,
                    FolowInventory = item.FolowInventory,
                    ManagerSerialNumber = item.ManagerSerialNumber,
                    Department = item.Department,
                    ReferencedId = item.ReferencedId,
                    AccountingCode = item.AccountingCode

                };
                
                products.Add(newProduct);
                context.Product.Add(newProduct);
                context.SaveChanges();


                var vendor = context.Vendor.FirstOrDefault(x => x.VendorId == item.VendorId);
                if(vendor != null)
                {
                    var productVendorObj = new ProductVendorMapping
                    {
                        ProductVendorMappingId = Guid.NewGuid(),
                        ProductId = newProduct.ProductId,
                        VendorId = vendor.VendorId,
                        VendorProductName = vendor.VendorName,
                        VendorProductCode = vendor.VendorCode,
                        CreatedById = parameter.UserId,
                        CreatedDate = DateTime.Now,
                        Active = true
                    };
                    //listProductVendorMapping.Add(productVendorObj);
                    context.ProductVendorMapping.Add(productVendorObj);
                    context.SaveChanges();
                }    

                #region Add Mapping Product and Vendors
                //if (parameter.ListProductVendorMapping.Count > 0) 
                //{
                //    var listProductVendorMapping = new List<ProductVendorMapping>();
                //    parameter.ListProductVendorMapping.ForEach(vendor =>
                //    {
                //        var productVendorObj = new ProductVendorMapping
                //        {
                //            ProductVendorMappingId = Guid.NewGuid(),
                //            ProductId = newProduct.ProductId,
                //            VendorId = vendor.VendorId,
                //            VendorProductName = vendor.VendorProductName,
                //            VendorProductCode = vendor.VendorProductCode,
                //            MiniumQuantity = vendor.MiniumQuantity,
                //            Price = vendor.Price,
                //            FromDate = vendor.FromDate,
                //            ToDate = vendor.ToDate,
                //            OrderNumber = vendor.OrderNumber,
                //            CreatedById = parameter.UserId,
                //            CreatedDate = DateTime.Now,
                //            UpdatedById = null,
                //            UpdatedDate = null,
                //            Active = true
                //        };
                //        //listProductVendorMapping.Add(productVendorObj);
                //        context.ProductVendorMapping.Add(productVendorObj);
                //        context.SaveChanges();
                //    });
                    
                //}

                #endregion
            });
            //context.Product.AddRange(products);
            //context.SaveChanges();

            return new ImportProductResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = CommonMessage.Product.IMPORT_SUCCESS,
            };
        }

        public GetProductByIDResult GetProductByID(GetProductByIDParameter parameter)
        {
            try
            {
                #region Add by Dung
                var productResponse = new ProductEntityModel();
                var Product = context.Product.Where(m => m.ProductId == parameter.ProductId).FirstOrDefault();
                if (Product == null)
                {
                    return new GetProductByIDResult
                    {
                        MessageCode = "Sản phẩm không tồn tại trong hệ thống",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                if (Product != null)
                {
                    productResponse.ProductId = Product.ProductId;
                    productResponse.ProductCategoryId = Product.ProductCategoryId;
                    productResponse.ProductName = Product.ProductName;
                    productResponse.ProductCode = Product.ProductCode;
                    productResponse.ShortName = Product.ShortName;
                    productResponse.ProductUnitId = Product.ProductUnitId;
                    productResponse.Department = Product.Department;
                    productResponse.MinimumInventoryQuantity = Product.MinimumInventoryQuantity;
                    productResponse.ProductType = Product.ProductType;
                    productResponse.ReferencedId = Product.ReferencedId;
                    productResponse.AccountingCode = Product.AccountingCode;
                }
                var listVendorMappingResult = context.ProductVendorMapping
                .Where(c => c.ProductId == parameter.ProductId).OrderBy(x => x.OrderNumber).ToList();
                //chuyển sang entitymodel
                var listVendorMapping = new List<ProductVendorMappingEntityModel>();
                listVendorMappingResult.ForEach(item =>
                {
                    listVendorMapping.Add(new ProductVendorMappingEntityModel(item));
                });
                #endregion

                #region Lấy Product BOM
                var productBOMEntity = context.ConfigurationProduct.Where(w => w.ProductId == parameter.ProductId).ToList();

                var listProductBOM = new List<DataAccess.Models.Product.ConfigurationProductEntityModel>();
                productBOMEntity?.ForEach(bom =>
                {
                    var productBOM = new ConfigurationProductEntityModel()
                    {
                        ConfigurationProductId = bom.ConfigurationProductId,
                        ProductId = bom.ProductId,
                        ConfigurationName = bom.ConfigurationName,
                        StartDate = bom.StartDate,
                        EndDate = bom.EndDate,
                        ListConfigurationProductMapping = new List<ConfigurationProductMappingEntityModel>()
                    };

                    var productBOMMapEntity = context.ConfigurationProductMapping.Where(w => w.ConfigurationProductId == bom.ConfigurationProductId).ToList();

                    productBOMMapEntity?.ForEach(bommap =>
                    {
                        var productBOMMap = new ConfigurationProductMappingEntityModel()
                        {
                            ConfigurationProductMappingId = bommap.ConfigurationProductMappingId,
                            ConfigurationProductId = bommap.ConfigurationProductId,
                            ProductId = bommap.ProductId,
                            StageGroupId = bommap.StageGroupId,
                            ReuseNg = bommap.ReuseNg,
                            Quota = bommap.Quota,
                            Consumption = bommap.Consumption,
                            CreatedById = bommap.CreatedById,
                            CreatedDate = bommap.CreatedDate,
                            UpdatedById = bommap.UpdatedById,
                            UpdatedDate = bommap.UpdatedDate
                        };

                        productBOM.ListConfigurationProductMapping.Add(productBOMMap);

                    });

                    listProductBOM.Add(productBOM);
                });
                #endregion

                #region Kiểm tra điều kiện xóa sản phẩm
                var CanDelete = true;
                var checkVendorOrderDetail = context.VendorOrderDetail.FirstOrDefault(f => f.ProductId == parameter.ProductId);
                var checkCustomerOrderDetail = context.CustomerOrderDetail.FirstOrDefault(f => f.ProductId == parameter.ProductId);
                var checkQuoteDetail = context.QuoteDetail.FirstOrDefault(f => f.ProductId == parameter.ProductId);
                var checkProcurementRequestItem = context.ProcurementRequestItem.FirstOrDefault(f => f.ProductId == parameter.ProductId);

                if (checkVendorOrderDetail != null || checkCustomerOrderDetail != null || checkQuoteDetail != null || checkProcurementRequestItem != null)
                {
                    CanDelete = false;
                }
                #endregion

                return new GetProductByIDResult
                {
                    Product = productResponse,
                    LstProductVendorMapping = listVendorMapping,
                    StatusCode = HttpStatusCode.OK,
                    CanDelete = CanDelete,
                    ListConfigurationProduct = listProductBOM
                };
            }
            catch (Exception ex)
            {
                return new GetProductByIDResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.ToString(),
                };
            }
        }

        public UpdateProductResult UpdateProduct(UpdateProductParameter parameter)
        {
            try
            {
                #region Update Product
                var product = context.Product.Where(w => w.ProductId == parameter.Product.ProductId).FirstOrDefault();
                if (product != null)
                {
                    product.ProductCategoryId = parameter.Product.ProductCategoryId;
                    product.ProductCode = parameter.Product.ProductCode.Trim();
                    product.ProductName = parameter.Product.ProductName.Trim();
                    product.ShortName = parameter.Product.ShortName?.Trim();
                    product.ProductUnitId = parameter.Product.ProductUnitId;
                    product.AccountingCode = parameter.Product.AccountingCode.Trim();
                    product.UpdatedById = parameter.UserId;
                    product.UpdatedDate = DateTime.Now;
                    product.MinimumInventoryQuantity = parameter.Product.MinimumInventoryQuantity; //Số lượng tối thiểu Or Số Sản phẩm trên 1 lô hàng
                    product.Department = parameter.Product.Department;
                    product.ReferencedId = parameter.Product.ReferencedId; // luu NVL tai su dung
                    context.Product.Update(product);
                }
                #endregion

                #region Update Product Mapping Vendor
                //delete old records
                var oldList = context.ProductVendorMapping.Where(w => w.ProductId == parameter.Product.ProductId).ToList();
                if (oldList != null)
                {
                    context.ProductVendorMapping.RemoveRange(oldList);
                }
                var newList = new List<ProductVendorMapping>();
                parameter.ListProductVendorMapping.ForEach(vendor =>
                {
                    newList.Add(new ProductVendorMapping
                    {
                        ProductVendorMappingId = Guid.NewGuid(),
                        ProductId = parameter.Product.ProductId,
                        VendorId = vendor.VendorId,
                        VendorProductName = vendor.VendorProductName,
                        VendorProductCode = vendor.VendorProductCode,
                        MiniumQuantity = vendor.MiniumQuantity,
                        //UnitPriceId = vendor.MoneyUnitId,
                        Price = vendor.Price,
                        FromDate = vendor.FromDate,
                        ToDate = vendor.ToDate,
                        OrderNumber = vendor.OrderNumber,
                        ExchangeRate = vendor.ExchangeRate,
                        CreatedById = parameter.UserId,
                        CreatedDate = DateTime.Now,
                        UpdatedById = null,
                        UpdatedDate = null,
                        Active = true
                    });
                });
                context.ProductVendorMapping.AddRange(newList);
                #endregion

                //#region Update Product BOM
                ////delete old product BOM

                //var listOldBOMMap = context.ConfigurationProductMapping.Where(w => w.ProductId == parameter.Product.ProductId).ToList();
                //context.ConfigurationProductMapping.RemoveRange(listOldBOMMap);

                //var listOldBOM = context.ConfigurationProduct.Where(w => w.ProductId == parameter.Product.ProductId).ToList();
                //context.ConfigurationProduct.RemoveRange(listOldBOM);

                //parameter.ListConfigurationProductEntity?.ForEach(bom =>
                //{
                //    var newConfigurationProduct = new Databases.Entities.ConfigurationProduct()
                //    {
                //        ConfigurationProductId = Guid.NewGuid(),
                //        ProductId = parameter.Product.ProductId, //lấy theo id sản phẩm vừa tạo
                //        ConfigurationName = bom.ConfigurationName,
                //        StartDate = bom.StartDate,
                //        EndDate = bom.EndDate
                //    };
                //    context.ConfigurationProduct.Add(newConfigurationProduct);

                //    bom.ListConfigurationProductMapping?.ForEach(bommap =>
                //    {
                //        var newConfigurationProductMapping = new Databases.Entities.ConfigurationProductMapping()
                //        {
                //            ConfigurationProductMappingId = Guid.NewGuid(),
                //            ConfigurationProductId = newConfigurationProduct.ConfigurationProductId,
                //            ProductId = parameter.Product.ProductId, //lấy theo id sản phẩm vừa tạo
                //            StageGroupId = bommap.StageGroupId,
                //            ReuseNg = bommap.ReuseNg,
                //            Quota = bommap.Quota,
                //            Consumption = bommap.Consumption,
                //            CreatedById = parameter.UserId,
                //            CreatedDate = DateTime.Now
                //        };
                //        context.ConfigurationProductMapping.Add(newConfigurationProductMapping);
                //    });
                //});

                //#endregion
                context.SaveChanges();

                #region Lưu nhật ký hệ thống

                LogHelper.AuditTrace(context, ActionName.UPDATE, ObjectName.PRODUCT, product.ProductId, parameter.UserId);

                #endregion

                return new UpdateProductResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Chỉnh sửa sản phẩm/dịch vụ thành công",
                    ProductId = parameter.Product.ProductId
                };
            }
            catch (Exception ex)
            {
                return new UpdateProductResult
                {
                    MessageCode = ex.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public string getListNameVendor(Guid ProductId)
        {
            string Result = string.Empty;
            var listVendorId = context.ProductVendorMapping.Where(c => c.ProductId == ProductId)?.Select(c => c.VendorId).ToList() ?? new List<Guid>();
            if (listVendorId.Count != 0)
            {
                var listVendor = context.Vendor.Where(c => listVendorId.Contains(c.VendorId)).Select(c => c.VendorName).ToList();
                Result = string.Join(";", listVendor);
            }
            else
            {
                Result = "";
            }

            return Result;
        }

        public GetProductByVendorIDResult GetProductByVendorID(GetProductByVendorIDParameter parameter)
        {
            try
            {
                var listProductResult = (from product in context.Product
                                         join productvendormapping in context.ProductVendorMapping on product.ProductId equals
                                             productvendormapping.ProductId
                                         where productvendormapping.VendorId == parameter.VendorId && product.Active == true
                                         select product).ToList();
                var listProduct = new List<ProductEntityModel>();
                listProductResult.ForEach(item =>
                {
                    listProduct.Add(new ProductEntityModel(item));
                });
                return new GetProductByVendorIDResult
                {
                    lstProduct = listProduct,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new GetProductByVendorIDResult
                {
                    MessageCode = ex.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetProductAttributeByProductIDResult GetProductAttributeByProductID(GetProductAttributeByProductIDParameter parameter)
        {
            try
            {
                var lstProductAtribute = (from pattributecategory in context.ProductAttributeCategory
                                          join productattribute in context.ProductAttribute on pattributecategory.ProductAttributeCategoryId equals productattribute.ProductAttributeCategoryId
                                          where productattribute.ProductId == parameter.ProductId
                                          select new ProductAttributeCategoryEntityModel
                                          {
                                              Active = pattributecategory.Active,
                                              CreatedById = pattributecategory.CreatedById,
                                              CreatedDate = pattributecategory.CreatedDate,
                                              ProductAttributeCategoryId = pattributecategory.ProductAttributeCategoryId,
                                              ProductAttributeCategoryName = pattributecategory.ProductAttributeCategoryName,
                                              UpdatedById = pattributecategory.UpdatedById,
                                              UpdatedDate = pattributecategory.UpdatedDate,
                                              ProductAttributeCategoryValue = (context.ProductAttributeCategoryValue.Where(m => m.ProductAttributeCategoryId == pattributecategory.ProductAttributeCategoryId))
                                              .Select(y => new ProductAttributeCategoryValueEntityModel
                                              {
                                                  ProductAttributeCategoryValueId = y.ProductAttributeCategoryValueId,
                                                  ProductAttributeCategoryValue1 = y.ProductAttributeCategoryValue1,
                                                  ProductAttributeCategoryId = y.ProductAttributeCategoryId,
                                                  CreatedById = y.CreatedById,
                                                  CreatedDate = y.CreatedDate,
                                                  UpdatedById = y.UpdatedById,
                                                  UpdatedDate = y.UpdatedDate,
                                              }).ToList(),
                                          }).ToList();

                return new GetProductAttributeByProductIDResult
                {
                    lstProductAttributeCategory = lstProductAtribute,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new GetProductAttributeByProductIDResult
                {
                    MessageCode = ex.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetAllProductCodeResult GetAllProductCode(GetAllProductCodeParameter parameter)
        {
            try
            {
                var ListCode = context.Product.Select(item => new { code = item.ProductCode.ToLower() }).ToList();
                List<string> result = new List<string>();
                foreach (var item in ListCode)
                {
                    result.Add(item.code.Trim());
                }
                return new GetAllProductCodeResult
                {
                    MessageCode = "Success",
                    StatusCode = HttpStatusCode.OK,
                    ListProductCode = result
                };
            }
            catch (Exception ex)
            {

                return new GetAllProductCodeResult
                {
                    MessageCode = ex.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public UpdateActiveProductResult UpdateActiveProduct(UpdateActiveProductParameter parameter)
        {
            try
            {
                var productUpdate = context.Product.FirstOrDefault(item => item.ProductId == parameter.ProductId);
                productUpdate.Active = false;
                productUpdate.UpdatedById = parameter.UserId;
                productUpdate.UpdatedDate = DateTime.Now;

                context.Product.Update(productUpdate);
                context.SaveChanges();

                #region Lưu nhật ký hệ thống

                LogHelper.AuditTrace(context, ActionName.DELETE, ObjectName.PRODUCT, productUpdate.ProductId, parameter.UserId);

                #endregion

                return new UpdateActiveProductResult
                {
                    MessageCode = CommonMessage.ProductCategory.DELETE_SUCCESS,
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {

                return new UpdateActiveProductResult
                {
                    MessageCode = CommonMessage.ProductCategory.DELETE_FAIL,
                    StatusCode = HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public int CountProductInformation(
            Guid productId,
            List<VendorOrderDetail> vendorOrderDetails,
            //List<VendorOrderProductDetailProductAttributeValue> vendorOrderProductDetailProductAttributeValues,
            List<CustomerOrderDetail> customerOrderDetails,
            //List<OrderProductDetailProductAttributeValue> orderProductDetailProductAttributeValues,
            List<QuoteDetail> quoteDetails,
            //List<QuoteProductDetailProductAttributeValue> quoteProductDetailProductAttributeValues,
            List<ProcurementRequestItem> procurementRequestItems)
        //List<ProductAttribute> productAttributes)
        {
            int count = vendorOrderDetails.Where(q => q.ProductId == productId).Count(); //đơn đặt hàng nhà cung cấp
            //count += vendorOrderProductDetailProductAttributeValues.Where(q => q.ProductId == productId).Count();
            count += customerOrderDetails.Where(q => q.ProductId == productId).Count(); //đơn hàng
            //count += orderProductDetailProductAttributeValues.Where(q => q.ProductId == productId).Count();
            count += quoteDetails.Where(q => q.ProductId == productId).Count();//báo giá
            //count += quoteProductDetailProductAttributeValues.Where(q => q.ProductId == productId).Count();
            count += procurementRequestItems.Where(q => q.ProductId == productId).Count(); //đề xuất mua hàng   
            //count += productAttributes.Where(q => q.ProductId == productId).Count();
            //count += productVendorMappings.Where(q => q.ProductId == productId).Count(); Comment by Dung
            //tìm theo điều kiện đơn đặt hàng nhà cung cấp
            //count += vendorOrderDetail.Where(w => w.ProductId == productId).Count();
            return count;
        }

        public GetListProductResult GetListProduct(GetListProductParameter parameter)
        {
            try
            {
                var listVendor = new List<VendorEntityModel>();
                var listUnitEntity = new List<CategoryEntityModel>();
                var listPropertyEntity = new List<CategoryEntityModel>();
                var listOrganizationEntity = new List<OrganizationEntityModel>();
                var listStageGroupEntity = new List<CategoryEntityModel>();

                if (parameter.ProductType == (int)ProductType.ThanhPham)
                {
                    //Lấy bộ phận quản lý thành phẩm
                    listOrganizationEntity = context.Organization.Select(o => new OrganizationEntityModel()
                    {
                        OrganizationId = o.OrganizationId,
                        OrganizationName = o.OrganizationName,
                        Level = o.Level,
                        ParentId = o.ParentId,
                        IsFinancialIndependence = o.IsFinancialIndependence
                    }).ToList();

                    var stageCode = "DNH"; // nhóm công đoạn
                    var stageId = context.CategoryType.Where(w => w.CategoryTypeCode == stageCode).FirstOrDefault().CategoryTypeId;
                    var listStageEntityResult = context.Category.Where(w => w.CategoryTypeId == stageId).ToList();
                    listStageEntityResult.ForEach(item =>
                    {
                        listStageGroupEntity.Add(new CategoryEntityModel(item));
                    });
                }

                var unitCode = "DNH"; //đơn vị tính
                var propertyCode = parameter.ProductType == (int)ProductType.ThanhPham ? "TP" : "NVL"; //Nhóm sản phẩm

                var unitId = context.CategoryType.Where(w => w.CategoryTypeCode == unitCode).FirstOrDefault().CategoryTypeId;
                var propertyId = context.CategoryType.Where(c => c.CategoryTypeCode == propertyCode).FirstOrDefault().CategoryTypeId;

                var listUnitEntityResult = context.Category.Where(w => w.CategoryTypeId == unitId).ToList();
                listUnitEntityResult.ForEach(item =>
                {
                    listUnitEntity.Add(new CategoryEntityModel(item));
                });

                var listPropertyEntityResult = context.Category.Where(c => c.CategoryTypeId == propertyId).ToList();
                listPropertyEntityResult.ForEach(item =>
                {
                    listPropertyEntity.Add(new CategoryEntityModel(item));
                });

                var listVendorEntity = context.Vendor.Where(w => w.Active == true).ToList();

                listVendorEntity?.ForEach(e =>
                {
                    listVendor.Add(new VendorEntityModel
                    {
                        VendorId = e.VendorId,
                        VendorName = e.VendorName
                    });
                });

                return new GetListProductResult
                {
                    StatusCode = HttpStatusCode.OK,
                    ListVendor = listVendor,
                    ListUnit = listUnitEntity,
                    ListOrganization = listOrganizationEntity,
                    ListProperty = listPropertyEntity,
                    ListStageGroup = listStageGroupEntity,
                };
            }
            catch (Exception ex)
            {

                return new GetListProductResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.ToString()
                };
            }
        }

        public GetMasterdataCreateProductResult GetMasterdataCreateProduct(GetMasterdataCreateProductParameter parameter)
        {
            try
            {
                var listVendor = new List<VendorEntityModel>();
                var ListProductUnitEntityModel = new List<CategoryEntityModel>();
                var ListPropertyEntityModel = new List<CategoryEntityModel>();
                var listProductCode = new List<string>();
                var listProductUnitName = new List<string>();
                var listOrganizationEntity = new List<OrganizationEntityModel>();
                var listStageGroupEntity = new List<CategoryEntityModel>();
                var listProductNVL = new List<ProductEntityModel>();

                if (parameter.ProductType == (int)ProductType.ThanhPham)
                {
                    //Lấy bộ phận quản lý thành phẩmimportProduct
                    listOrganizationEntity = context.Organization.Select(o => new OrganizationEntityModel()
                    {
                        OrganizationId = o.OrganizationId,
                        OrganizationCode = o.OrganizationCode,
                        OrganizationName = o.OrganizationName,
                        Level = o.Level,
                        ParentId = o.ParentId
                    }).ToList();

                    var stageCode = GroupType.GROUP_STAGE; // nhóm công đoạn
                    var stageId = context.CategoryType.Where(w => w.CategoryTypeCode == stageCode).FirstOrDefault().CategoryTypeId;
                    var listStageEntityResult = context.Category.Where(w => w.CategoryTypeId == stageId).ToList();
                    listStageEntityResult.ForEach(item =>
                    {
                        listStageGroupEntity.Add(new CategoryEntityModel(item));
                    });
                }

                #region Get data from Database
                var unitCode = "DNH"; //đơn vị tính
                var propertyCode = parameter.ProductType == (int)ProductType.ThanhPham ? "TP" : "NVL"; //Nhóm sản phẩm

                var unitId = context.CategoryType.Where(w => w.CategoryTypeCode == unitCode).FirstOrDefault().CategoryTypeId;
                var propertyId = context.CategoryType.Where(c => c.CategoryTypeCode == propertyCode).FirstOrDefault().CategoryTypeId;

                var listUnitEntity = context.Category.Where(w => w.Active == true && w.CategoryTypeId == unitId).ToList();
                var listPropertyEntity = context.Category.Where(c => c.Active == true && c.CategoryTypeId == propertyId).ToList();

                var productCodeEntity = context.Product.Select(w => new { w.ProductCode }).ToList();
                #endregion

                #region Patch to Response
                listPropertyEntity?.ForEach(e =>
                {
                    ListPropertyEntityModel.Add(new CategoryEntityModel
                    {
                        CategoryId = e.CategoryId,
                        CategoryName = e.CategoryName,
                        CategoryCode = e.CategoryCode,
                        IsDefault = e.IsDefauld
                    });
                });

                listUnitEntity?.ForEach(e =>
                {
                    ListProductUnitEntityModel.Add(new CategoryEntityModel
                    {
                        CategoryId = e.CategoryId,
                        CategoryName = e.CategoryName,
                        CategoryCode = e.CategoryCode,
                        IsDefault = e.IsDefauld
                    });
                });

                productCodeEntity?.ForEach(productCode =>
                {
                    listProductCode.Add(productCode.ProductCode?.Trim());
                });
                #endregion

                var categoryType = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "DNH");
                listProductUnitName = context.Category.Where(c => c.CategoryTypeId == categoryType.CategoryTypeId && c.Active == true).Select(c => c.CategoryName).ToList();

                listProductNVL = context.Product.Where(x => x.Active == true && x.ProductType == (int)ProductType.NVL).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId,
                    ProductUnitName = listUnitEntity.FirstOrDefault(x => x.CategoryId == y.ProductUnitId).CategoryName,
                }).OrderBy(z => z.ProductName).ToList(); //chỉ lấy ra các product là NVL

                #region Lấy nhà cung cấp
                var listVendorEntity = context.Vendor.Where(w => w.Active == true).OrderBy(w => w.VendorName).ToList();

                listVendorEntity?.ForEach(e =>
                {
                    listVendor.Add(new VendorEntityModel
                    {
                        VendorId = e.VendorId,
                        VendorName = e.VendorName,
                        VendorCode = e.VendorCode,
                    });
                });

                listVendor = listVendor.OrderBy(w => w.VendorName).ToList();
                #endregion

                return new GetMasterdataCreateProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListProductUnit = ListProductUnitEntityModel,
                    ListProductCode = listProductCode,
                    ListProductUnitName = listProductUnitName,
                    ListProperty = ListPropertyEntityModel,
                    ListStageGroup = listStageGroupEntity,
                    ListOrganization = listOrganizationEntity,
                    ListProductEntityModel = listProductNVL,
                    ListVendor = listVendor
                };
            }
            catch (Exception ex)
            {

                return new GetMasterdataCreateProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message,
                };
            }
        }

        public AddSerialNumberResult AddSerialNumber(AddSerialNumberParameter parameter)
        {
            try
            {
                var listSerialEntity = context.Serial.Where(x => x.ProductId != parameter.ProductId)
                    .Select(w => new { w.SerialCode }).ToList();
                var ListSerialNumber = new List<string>();

                listSerialEntity.ForEach(serial =>
                {
                    ListSerialNumber.Add(serial.SerialCode?.Trim());
                });

                return new AddSerialNumberResult
                {
                    ListSerialNumber = ListSerialNumber,
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {

                return new AddSerialNumberResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.ToString()
                };
            }
        }

        public GetMasterDataVendorDialogResult GetMasterDataVendorDialog(GetMasterDataVendorDialogParameter parameter)
        {
            var ListProductMoneyUnit = new List<CategoryEntityModel>();
            var ListVendor = new List<VendorEntityModel>();
            var listProduct = new List<ProductEntityModel>();
            var listSuggestedSupplierQuote = new List<SuggestedSupplierQuotesEntityModel>();

            var moneyUnitCode = "DTI"; //đơn vị tiền
            var moneyUnitId = context.CategoryType.Where(w => w.Active == true && w.CategoryTypeCode == moneyUnitCode).FirstOrDefault().CategoryTypeId; ;
            var listMoneyUnitEntity = context.Category.Where(w => w.Active == true && w.CategoryTypeId == moneyUnitId).ToList();
            var vendorEntity = context.Vendor.Where(w => w.Active == true).OrderBy(w => w.VendorName).ToList();


            var listProductResult = context.Product.Where(w => w.Active == true).OrderBy(w => w.ProductName).ToList();
            listProductResult.ForEach(item =>
            {
                listProduct.Add(new ProductEntityModel(item));
            });

            var listSuggestedSupplierQuoteResult = context.SuggestedSupplierQuotes.Where(c => c.Active == true).OrderBy(w => w.SuggestedSupplierQuote).ToList();
            listSuggestedSupplierQuoteResult.ForEach(item =>
            {
                listSuggestedSupplierQuote.Add(new SuggestedSupplierQuotesEntityModel(item));
            });


            listMoneyUnitEntity?.ForEach(e =>
            {
                ListProductMoneyUnit.Add(new CategoryEntityModel
                {
                    CategoryId = e.CategoryId,
                    CategoryName = e.CategoryName,
                    CategoryCode = e.CategoryCode,
                    IsDefauld = e.IsDefauld
                });
            });

            vendorEntity?.ForEach(e =>
            {
                ListVendor.Add(new VendorEntityModel
                {
                    VendorId = e.VendorId,
                    VendorName = e.VendorName,
                    VendorCode = e.VendorCode
                });
            });

            ListVendor = ListVendor.OrderBy(w => w.VendorName).ToList();

            return new GetMasterDataVendorDialogResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "",
                ListProductMoneyUnit = ListProductMoneyUnit,
                ListVendor = ListVendor,
                ListProduct = listProduct,
                ListSuggestedSupplierQuote = listSuggestedSupplierQuote,
            };
        }

        public DownloadTemplateProductServiceResult DownloadTemplateProductService(DownloadTemplateProductServiceParameter parameter)
        {
            try
            {
                string rootFolder = _hostingEnvironment.WebRootPath + "\\ExcelTemplate";
                string fileName = @"Template_import_nvl.xlsx";

                //FileInfo file = new FileInfo(Path.Combine(rootFolder, fileName));
                string newFilePath = Path.Combine(rootFolder, fileName);
                byte[] data = File.ReadAllBytes(newFilePath);

                return new DownloadTemplateProductServiceResult
                {
                    TemplateExcel = data,
                    MessageCode = string.Format("Đã dowload file Template_Import_NVL"),
                    FileName = "Template_Import_NVL",
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception)
            {
                return new DownloadTemplateProductServiceResult
                {
                    MessageCode = "Đã có lỗi xảy ra trong quá trình download",
                    StatusCode = HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public GetMasterDataPriceProductResult GetMasterDataPriceList(GetMasterDataPriceProductParameter parameter)
        {
            try
            {
                var groupCustomerId = context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "NHA").CategoryTypeId;
                var groupCustomerAll = context.Category.Where(c => c.CategoryTypeId == groupCustomerId).ToList();
                var groupCustomer = groupCustomerAll.Where(c => c.Active == true && c.CategoryTypeId == groupCustomerId).ToList();
                var listCategoryCustomer = new List<CategoryEntityModel>();
                groupCustomer.ForEach(item =>
                {
                    var newCategoryCustomer = new CategoryEntityModel()
                    {
                        CategoryId = item.CategoryId,
                        CategoryName = item.CategoryName,
                        CategoryCode = item.CategoryCode,
                    };
                    listCategoryCustomer.Add(newCategoryCustomer);
                });
                var listProduct = context.Product.ToList();
                var products = listProduct.Where(c => c.Active == true).ToList();
                var listProductEntityModel = new List<ProductEntityModel>();
                products.ForEach(item =>
                {
                    var newProduct = new ProductEntityModel()
                    {
                        ProductId = item.ProductId,
                        ProductCode = item.ProductCode,
                        ProductName = item.ProductName,
                    };
                    listProductEntityModel.Add(newProduct);
                });
                var listPrice = context.PriceProduct.Where(c => c.Active == true).OrderByDescending(x => x.EffectiveDate).ToList();
                var listPriceEntityModel = new List<PriceProductEntityModel>();

                listPrice.ForEach(item =>
                {
                    var newPriceProduct = new PriceProductEntityModel
                    {
                        PriceProductId = item.PriceProductId,
                        ProductId = item.ProductId,
                        ProductCode = listProduct.FirstOrDefault(c => c.ProductId == item.ProductId)?.ProductCode ?? "",
                        ProductName = listProduct.FirstOrDefault(c => c.ProductId == item.ProductId)?.ProductName ?? "",
                        EffectiveDate = item.EffectiveDate,
                        PriceVnd = item.PriceVnd,
                        MinQuantity = item.MinQuantity,
                        PriceForeignMoney = item.PriceForeignMoney,
                        CustomerGroupCategory = item.CustomerGroupCategory,
                        CustomerGroupCategoryName = groupCustomerAll.FirstOrDefault(c => c.CategoryId == item.CustomerGroupCategory)?.CategoryName ?? "",
                        CreatedById = item.CreatedById,
                        CreatedDate = item.CreatedDate,
                        TiLeChietKhau = item.TiLeChietKhau,
                        NgayHetHan = item.NgayHetHan
                    };

                    listPriceEntityModel.Add(newPriceProduct);
                });
                listPriceEntityModel = listPriceEntityModel.OrderByDescending(c => c.EffectiveDate).ToList();

                return new GetMasterDataPriceProductResult
                {
                    ListProduct = listProductEntityModel,
                    ListPrice = listPriceEntityModel,
                    ListCategory = listCategoryCustomer,
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "success"
                };
            }
            catch (Exception ex)
            {
                return new GetMasterDataPriceProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }

        }

        public CreateOrUpdatePriceProductResult CreateOrUpdatePriceProduct(CreateOrUpdatePriceProductParameter parameter)
        {
            try
            {
                var priceProduct = context.PriceProduct.FirstOrDefault(c => c.PriceProductId == parameter.PriceProduct.PriceProductId);

                var groupCustomerId = context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "NHA").CategoryTypeId;
                var groupCustomerAll = context.Category.Where(c => c.CategoryTypeId == groupCustomerId).ToList();

                var listProduct = context.Product.ToList();
                var products = listProduct.Where(c => c.Active == true).ToList();
                string message = "";
                if (priceProduct == null)
                {
                    var newPriceProduct = new PriceProduct
                    {
                        PriceProductId = Guid.NewGuid(),
                        ProductId = parameter.PriceProduct.ProductId,
                        EffectiveDate = parameter.PriceProduct.EffectiveDate,
                        PriceVnd = parameter.PriceProduct.PriceVnd,
                        MinQuantity = parameter.PriceProduct.MinQuantity,
                        PriceForeignMoney = parameter.PriceProduct.PriceForeignMoney,
                        NgayHetHan = parameter.PriceProduct.NgayHetHan,
                        TiLeChietKhau = parameter.PriceProduct.TiLeChietKhau.Value,
                        Active = true,
                        CreatedById = parameter.UserId,
                        CreatedDate = DateTime.Now,
                        CustomerGroupCategory = parameter.PriceProduct.CustomerGroupCategory,
                        UpdatedById = null,
                        UpdatedDate = null
                    };
                    context.PriceProduct.Add(newPriceProduct);
                    message = Common.CommonMessage.PriceProduct.CREATE_SUCCESS;
                }
                else
                {
                    priceProduct.ProductId = parameter.PriceProduct.ProductId;
                    priceProduct.EffectiveDate = parameter.PriceProduct.EffectiveDate;
                    priceProduct.PriceVnd = parameter.PriceProduct.PriceVnd;
                    priceProduct.MinQuantity = parameter.PriceProduct.MinQuantity;
                    priceProduct.PriceForeignMoney = parameter.PriceProduct.PriceForeignMoney;
                    priceProduct.CustomerGroupCategory = parameter.PriceProduct.CustomerGroupCategory;
                    priceProduct.UpdatedById = parameter.UserId;
                    priceProduct.UpdatedDate = DateTime.Now;
                    priceProduct.TiLeChietKhau = parameter.PriceProduct.TiLeChietKhau.Value;
                    priceProduct.NgayHetHan = parameter.PriceProduct.NgayHetHan;
                    context.PriceProduct.Update(priceProduct);
                    message = Common.CommonMessage.PriceProduct.UPDATE_SUCCESS;
                }
                context.SaveChanges();

                var listPrice = context.PriceProduct.Where(c => c.Active == true).OrderByDescending(x => x.EffectiveDate).ToList();
                var listPriceEntityModel = new List<PriceProductEntityModel>();
                listPrice.ForEach(item =>
                {
                    var newPriceProduct = new PriceProductEntityModel
                    {
                        PriceProductId = item.PriceProductId,
                        ProductId = item.ProductId,
                        ProductCode = listProduct.FirstOrDefault(c => c.ProductId == item.ProductId)?.ProductCode ?? "",
                        ProductName = listProduct.FirstOrDefault(c => c.ProductId == item.ProductId)?.ProductName ?? "",
                        EffectiveDate = item.EffectiveDate,
                        PriceVnd = item.PriceVnd,
                        MinQuantity = item.MinQuantity,
                        NgayHetHan = item.NgayHetHan,
                        TiLeChietKhau = item.TiLeChietKhau,
                        PriceForeignMoney = item.PriceForeignMoney,
                        CustomerGroupCategory = item.CustomerGroupCategory,
                        CustomerGroupCategoryName = groupCustomerAll.FirstOrDefault(c => c.CategoryId == item.CustomerGroupCategory)?.CategoryName ?? "",
                        CreatedById = item.CreatedById,
                        CreatedDate = item.CreatedDate,
                    };

                    listPriceEntityModel.Add(newPriceProduct);
                });
                listPriceEntityModel = listPriceEntityModel.OrderByDescending(c => c.EffectiveDate).ToList();

                return new CreateOrUpdatePriceProductResult
                {
                    ListPrice = listPriceEntityModel,
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = message
                };
            }
            catch (Exception ex)
            {
                return new CreateOrUpdatePriceProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public DeletePriceProductResult DeletePriceProduct(DeletePriceProductParameter parameter)
        {
            try
            {
                var priceProduct = context.PriceProduct.FirstOrDefault(c => c.PriceProductId == parameter.PriceProductId);
                if (priceProduct == null)
                {
                    return new DeletePriceProductResult
                    {
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.PriceProduct.DELETE_FAIL
                    };
                }
                else
                {
                    priceProduct.Active = false;
                    context.PriceProduct.Update(priceProduct);
                    context.SaveChanges();
                    return new DeletePriceProductResult
                    {
                        StatusCode = System.Net.HttpStatusCode.OK,
                        MessageCode = CommonMessage.PriceProduct.DELETE_SUCCESS
                    };
                }
            }
            catch (Exception ex)
            {
                return new DeletePriceProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public GetDataQuickCreateProductResult GetDataQuickCreateProduct(GetDataQuickCreateProductParameter parameter)
        {
            try
            {
                //var listProductCode = new List<string>();
                //var ListProductUnit = new List<DataAccess.Databases.Entities.Category>();

                //var unitCode = "DNH"; //đơn vị tính
                //var priceInvetoryCode = "GTK";
                //var propertyCode = "TC";

                //var unitId = context.CategoryType.Where(w => w.CategoryTypeCode == unitCode).FirstOrDefault().CategoryTypeId;

                //var priceInventoryId = context.CategoryType.Where(c => c.CategoryTypeCode == priceInvetoryCode).FirstOrDefault().CategoryTypeId;

                //var productCodeEntity = context.Product.Select(w => new { w.ProductCode }).ToList();
                //var listUnitEntity = context.Category.Where(w => w.Active == true && w.CategoryTypeId == unitId).ToList();


                //productCodeEntity?.ForEach(productCode =>
                //{
                //    listProductCode.Add(productCode.ProductCode?.Trim());
                //});

                //listUnitEntity?.ForEach(e =>
                //{
                //    ListProductUnit.Add(new Category
                //    {
                //        CategoryId = e.CategoryId,
                //        CategoryName = e.CategoryName,
                //        CategoryCode = e.CategoryCode,
                //        IsDefauld = e.IsDefauld
                //    });
                //});

                //var propertyId = context.CategoryType.Where(c => c.CategoryTypeCode == propertyCode).FirstOrDefault().CategoryTypeId;
                //var listPriceInventoryEntity = context.Category.Where(c => c.Active == true && c.CategoryTypeId == priceInventoryId).ToList();
                //var listPropertyEntity = context.Category.Where(c => c.Active == true && c.CategoryTypeId == propertyId).ToList();

                #region Mã sản phẩm
                var listProductCode = context.Product.Where(w => w.Active == true).Select(w => w.ProductCode).ToList() ?? new List<string>();
                #endregion

                #region Đơn vị tính
                var listProductUnit = new List<DataAccess.Models.CategoryEntityModel>();

                var unitCode = "DNH"; //đơn vị tính
                var unitId = context.CategoryType.Where(w => w.CategoryTypeCode == unitCode).FirstOrDefault().CategoryTypeId;
                var listUnitEntity = context.Category.Where(w => w.Active == true && w.CategoryTypeId == unitId).ToList();
                listUnitEntity?.ForEach(e =>
                {
                    listProductUnit.Add(new DataAccess.Models.CategoryEntityModel
                    {
                        CategoryId = e.CategoryId,
                        CategoryName = e.CategoryName,
                        CategoryCode = e.CategoryCode,
                    });
                });
                #endregion

                #region Cách tính tồn kho
                var listPriceInventory = new List<DataAccess.Models.CategoryEntityModel>();

                var priceInvetoryCode = "GTK";
                var priceInventoryId = context.CategoryType.Where(c => c.CategoryTypeCode == priceInvetoryCode).FirstOrDefault().CategoryTypeId;
                var listPriceInventoryEntity = context.Category.Where(c => c.Active == true && c.CategoryTypeId == priceInventoryId).ToList();
                listPriceInventoryEntity?.ForEach(e =>
                {
                    listPriceInventory.Add(new DataAccess.Models.CategoryEntityModel
                    {
                        CategoryId = e.CategoryId,
                        CategoryName = e.CategoryName,
                        CategoryCode = e.CategoryCode,
                    });
                });
                #endregion

                #region Tính chất
                var listProperty = new List<DataAccess.Models.CategoryEntityModel>();

                var propertyCode = "TC";
                var propertyId = context.CategoryType.Where(c => c.CategoryTypeCode == propertyCode).FirstOrDefault().CategoryTypeId;
                var listPropertyEntity = context.Category.Where(c => c.Active == true && c.CategoryTypeId == propertyId).ToList();
                listPropertyEntity?.ForEach(e =>
                {
                    listProperty.Add(new DataAccess.Models.CategoryEntityModel
                    {
                        CategoryId = e.CategoryId,
                        CategoryName = e.CategoryName,
                        CategoryCode = e.CategoryCode,
                    });
                });
                #endregion

                // lấy list loại hình kinh doanh: Chỉ bán ra, chỉ mua vào và cả 2.
                var loaiHinhTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "HHKD")?.CategoryTypeId;
                var listLoaiHinh = context.Category.Where(x => x.CategoryTypeId == loaiHinhTypeId).Select(c => new CategoryEntityModel()
                {
                    CategoryTypeId = c.CategoryTypeId,
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    CategoryCode = c.CategoryCode,
                }).ToList();

                return new GetDataQuickCreateProductResult
                {
                    ListProductCode = listProductCode,
                    ListProductUnit = listProductUnit,
                    ListPriceInventory = listPriceInventory,
                    ListProperty = listProperty,
                    ListLoaiHinh = listLoaiHinh,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = ""
                };
            }
            catch (Exception ex)
            {
                return new GetDataQuickCreateProductResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public GetDataCreateUpdateBOMResult GetDataCreateUpdateBOM(GetDataCreateUpdateBOMParameter parameter)
        {
            try
            {
                #region Lấy danh sách sản phẩm
                var listProductEntity = context.Product.Where(w => w.Active == true).ToList();
                var unitTypeCodeId = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == "DNH").CategoryTypeId;
                var listProductUnitEntity = context.Category.Where(w => w.CategoryTypeId == unitTypeCodeId && w.Active == true).ToList();

                var listProduct = new List<DataAccess.Models.Product.ProductEntityModel>();

                listProductEntity?.ForEach(product =>
                {
                    var productUnitName = listProductUnitEntity.FirstOrDefault(f => f.CategoryId == product.ProductUnitId)?.CategoryName ?? "";

                    listProduct.Add(new ProductEntityModel()
                    {
                        ProductId = product.ProductId,
                        ProductName = product.ProductName,
                        ProductCode = product.ProductCode,
                        ProductUnitId = product.ProductUnitId,
                        ProductUnitName = productUnitName
                    });
                });
                #endregion

                return new GetDataCreateUpdateBOMResult
                {
                    ListProduct = listProduct,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = ""
                };
            }
            catch (Exception ex)
            {
                return new GetDataCreateUpdateBOMResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public DownloadPriceProductTemplateResult DownloadPriceProductTemplate(DownloadPriceProductTemplateParameter parameter)
        {
            try
            {
                string rootFolder = _hostingEnvironment.WebRootPath + "\\ExcelTemplate";
                string fileName = @"Template_import_Bng_gi_bn.xlsx";

                //FileInfo file = new FileInfo(Path.Combine(rootFolder, fileName));
                string newFilePath = Path.Combine(rootFolder, fileName);
                byte[] data = File.ReadAllBytes(newFilePath);

                return new DownloadPriceProductTemplateResult
                {
                    TemplateExcel = data,
                    MessageCode = string.Format("Đã dowload file Template_import_Bng_gi_bn"),
                    FileName = "Template_import_Bng_gi_bn",
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception ex)
            {
                return new DownloadPriceProductTemplateResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public ImportPriceProductResult ImportPriceProduct(ImportPriceProductParamter parameter)
        {
            try
            {
                if (parameter.ListPriceProduct == null)
                {
                    return new ImportPriceProductResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "not foud",
                    };
                }
                var list = new List<PriceProduct>();
                parameter.ListPriceProduct.ForEach(item =>
                {
                    var priceProduct = new PriceProduct
                    {
                        PriceProductId = Guid.NewGuid(),
                        ProductId = item.ProductId,
                        EffectiveDate = item.EffectiveDate,
                        MinQuantity = item.MinQuantity,
                        PriceVnd = item.PriceVnd,
                        PriceForeignMoney = item.PriceForeignMoney,
                        CustomerGroupCategory = item.CustomerGroupCategory,
                        Active = true,
                        CreatedById = parameter.UserId,
                        CreatedDate = DateTime.Now,
                        UpdatedById = null,
                        UpdatedDate = null
                    };
                    list.Add(priceProduct);
                });
                context.PriceProduct.AddRange(list);
                context.SaveChanges();

                return new ImportPriceProductResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                };
            }
            catch (Exception ex)
            {
                return new ImportPriceProductResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message,
                };
            }
        }

        public CreateThuocTinhSanPhamResult CreateThuocTinhSanPham(CreateThuocTinhSanPhamParameter parameter)
        {
            try
            {
                var listProductAttributeCategoryValue = new List<ProductAttributeCategoryValue>();
                var listProductAttribute = new List<ProductAttribute>();

                //định nghĩa product attribute category
                var attributeCategoryObj = new ProductAttributeCategory
                {
                    ProductAttributeCategoryId = Guid.NewGuid(),
                    ProductAttributeCategoryName = parameter.ThuocTinh.ProductAttributeCategoryName?.Trim(),
                    CreatedById = parameter.UserId,
                    CreatedDate = DateTime.Now,
                    Active = true
                };

                //gắn category với sản phẩm
                var productAttribute = new ProductAttribute
                {
                    ProductAttributeId = Guid.NewGuid(),
                    ProductId = parameter.ProductId,
                    ProductAttributeCategoryId = attributeCategoryObj.ProductAttributeCategoryId,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = null,
                    Active = true,
                    UpdatedBy = null,
                    CreatedBy = parameter.UserId
                };
                listProductAttribute.Add(productAttribute);

                //định nghĩa product attribute value
                if (parameter.ThuocTinh.ProductAttributeCategoryValue.Count > 0)
                {
                    List<ProductAttributeCategoryValueEntityModel> listAttributeValue =
                        parameter.ThuocTinh.ProductAttributeCategoryValue.ToList();

                    listAttributeValue.ForEach(attriButeValue =>
                    {
                        var attributeValue = new ProductAttributeCategoryValue
                        {
                            ProductAttributeCategoryValueId = Guid.NewGuid(),
                            ProductAttributeCategoryValue1 =
                                attriButeValue.ProductAttributeCategoryValue1?.Trim(),
                            ProductAttributeCategoryId = attributeCategoryObj.ProductAttributeCategoryId,
                            CreatedById = parameter.UserId,
                            CreatedDate = DateTime.Now,
                            Active = true
                        };
                        listProductAttributeCategoryValue.Add(attributeValue);
                    });
                }

                context.ProductAttributeCategory.Add(attributeCategoryObj);
                context.ProductAttributeCategoryValue.AddRange(listProductAttributeCategoryValue);
                context.ProductAttribute.AddRange(listProductAttribute);
                context.SaveChanges();

                return new CreateThuocTinhSanPhamResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ProductAttributeCategoryId = attributeCategoryObj.ProductAttributeCategoryId
                };
            }
            catch (Exception e)
            {
                return new CreateThuocTinhSanPhamResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public DeleteThuocTinhSanPhamResult DeleteThuocTinhSanPham(DeleteThuocTinhSanPhamParameter parameter)
        {
            try
            {
                var thuocTinh = context.ProductAttributeCategory.FirstOrDefault(x =>
                    x.ProductAttributeCategoryId == parameter.ProductAttributeCategoryId);

                if (thuocTinh == null)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Thuộc tính không tồn tại trên hệ thống",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var attribute = context.ProductAttribute.FirstOrDefault(x =>
                    x.ProductAttributeCategoryId == parameter.ProductAttributeCategoryId);
                var listGiaTriThuocTinh = context.ProductAttributeCategoryValue
                    .Where(x => x.ProductAttributeCategoryId == parameter.ProductAttributeCategoryId).ToList();

                #region Kiểm tra thuộc tính đã được sử dụng hay chưa

                var count_order = context.OrderProductDetailProductAttributeValue.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_order > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var count_quote = context.QuoteProductDetailProductAttributeValue.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_quote > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var count_contract = context.ContractDetailProductAttribute.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_contract > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var count_lead = context.LeadProductDetailProductAttributeValue.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_lead > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var count_vendor_order = context.VendorOrderProductDetailProductAttributeValue.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_vendor_order > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var count_hst = context.SaleBiddingDetailProductAttribute.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_hst > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                var count_hoa_don = context.BillOfSaleCostProductAttribute.Count(x =>
                    x.ProductAttributeCategoryId == thuocTinh.ProductAttributeCategoryId);

                if (count_hoa_don > 0)
                {
                    return new DeleteThuocTinhSanPhamResult()
                    {
                        MessageCode = "Không thể xóa vì Thuộc tính đã được sử dụng",
                        StatusCode = HttpStatusCode.ExpectationFailed
                    };
                }

                #endregion

                context.ProductAttribute.Remove(attribute);
                context.ProductAttributeCategoryValue.RemoveRange(listGiaTriThuocTinh);
                context.ProductAttributeCategory.Remove(thuocTinh);
                context.SaveChanges();

                return new DeleteThuocTinhSanPhamResult()
                {
                    MessageCode = "Xóa thành công",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new DeleteThuocTinhSanPhamResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public DownloadTemplateThanhPhamServiceResult DownloadTemplateThanhPhamService(DownloadTemplateThanhPhamServiceParameter parameter)
        {
            try
            {
                string rootFolder = _hostingEnvironment.WebRootPath + "\\ExcelTemplate";
                string fileName = @"Template_import_thanhpham.xlsx";

                //FileInfo file = new FileInfo(Path.Combine(rootFolder, fileName));
                string newFilePath = Path.Combine(rootFolder, fileName);
                byte[] data = File.ReadAllBytes(newFilePath);

                return new DownloadTemplateThanhPhamServiceResult
                {
                    TemplateExcel = data,
                    MessageCode = string.Format("Đã dowload file Template_Import_TP"),
                    FileName = "Template_Import_TP",
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception)
            {
                return new DownloadTemplateThanhPhamServiceResult
                {
                    MessageCode = "Đã có lỗi xảy ra trong quá trình download",
                    StatusCode = HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public UpdateConfigurationProductMappingResult UpdateConfigurationProductMapping(UpdateConfigurationProductMappingParameter parameter)
        {
            try
            {
                #region Update Product BOM
                //delete old product BOM

                var listOldBOM = context.ConfigurationProduct.Where(w => w.ProductId == parameter.ProductId).ToList();
                var listOldBOMId = context.ConfigurationProduct.Where(w => w.ProductId == parameter.ProductId).Select(x=>x.ConfigurationProductId).ToList();
                var listOldBOMMap = context.ConfigurationProductMapping.Where(w => listOldBOMId.Contains(w.ConfigurationProductId)).ToList();

                context.ConfigurationProductMapping.RemoveRange(listOldBOMMap);
                context.ConfigurationProduct.RemoveRange(listOldBOM);

                parameter.ListConfigurationProductEntity?.ForEach(bom =>
                {
                    var newConfigurationProduct = new Databases.Entities.ConfigurationProduct()
                    {
                        ConfigurationProductId = Guid.NewGuid(),
                        ProductId = parameter.ProductId, //lấy theo id sản phẩm vừa tạo
                        ConfigurationName = bom.ConfigurationName,
                        StartDate = bom.StartDate,
                        EndDate = bom.EndDate
                    };
                    context.ConfigurationProduct.Add(newConfigurationProduct);
                    context.SaveChanges();

                    bom.ListConfigurationProductMapping?.ForEach(bommap =>
                    {
                        var newConfigurationProductMapping = new Databases.Entities.ConfigurationProductMapping()
                        {
                            ConfigurationProductMappingId = Guid.NewGuid(),
                            ConfigurationProductId = newConfigurationProduct.ConfigurationProductId,
                            ProductId = bommap.ProductId,
                            StageGroupId = bommap.StageGroupId,
                            ReuseNg = bommap.ReuseNg,
                            Quota = bommap.Quota,
                            Consumption = bommap.Consumption,
                            CreatedById = parameter.UserId,
                            CreatedDate = DateTime.Now
                        };
                        context.ConfigurationProductMapping.Add(newConfigurationProductMapping);
                        context.SaveChanges();
                    });
                });

                #endregion

                #region Lấy Product BOM
                var productBOMEntity = context.ConfigurationProduct.Where(w => w.ProductId == parameter.ProductId).ToList();

                var listProductBOM = new List<DataAccess.Models.Product.ConfigurationProductEntityModel>();
                productBOMEntity?.ForEach(bom =>
                {
                    var productBOM = new ConfigurationProductEntityModel()
                    {
                        ConfigurationProductId = bom.ConfigurationProductId,
                        ProductId = bom.ProductId,
                        ConfigurationName = bom.ConfigurationName,
                        StartDate = bom.StartDate,
                        EndDate = bom.EndDate,
                        ListConfigurationProductMapping = new List<ConfigurationProductMappingEntityModel>()
                    };

                    var productBOMMapEntity = context.ConfigurationProductMapping.Where(w => w.ConfigurationProductId == bom.ConfigurationProductId).ToList();

                    productBOMMapEntity?.ForEach(bommap =>
                    {
                        var productBOMMap = new ConfigurationProductMappingEntityModel()
                        {
                            ConfigurationProductMappingId = bommap.ConfigurationProductMappingId,
                            ConfigurationProductId = bommap.ConfigurationProductId,
                            ProductId = bommap.ProductId,
                            StageGroupId = bommap.StageGroupId,
                            ReuseNg = bommap.ReuseNg,
                            Quota = bommap.Quota,
                            Consumption = bommap.Consumption,
                            CreatedById = bommap.CreatedById,
                            CreatedDate = bommap.CreatedDate,
                            UpdatedById = bommap.UpdatedById,
                            UpdatedDate = bommap.UpdatedDate
                        };

                        productBOM.ListConfigurationProductMapping.Add(productBOMMap);

                    });

                    listProductBOM.Add(productBOM);
                });
                #endregion

                return new UpdateConfigurationProductMappingResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    ListConfigurationProductEntity = listProductBOM
                };
            }
            catch (Exception ex)
            {
                return new UpdateConfigurationProductMappingResult
                {
                    MessageCode = ex.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public DeleteConfigurationProductResult DeleteConfigurationProduct(DeleteConfigurationProductParameter parameter)
        {
            try
            {
                var listOldBOMMap = context.ConfigurationProductMapping.Where(w => w.ConfigurationProductId == parameter.ConfigurationProductId).ToList();
                context.ConfigurationProductMapping.RemoveRange(listOldBOMMap);

                var listOldBOMId = context.ConfigurationProduct.Where(x => x.ConfigurationProductId == parameter.ConfigurationProductId).ToList();
                context.ConfigurationProduct.RemoveRange(listOldBOMId);

                context.SaveChanges();
                return new DeleteConfigurationProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "Xóa cấu hình định mức thành công."
                };
            }
            catch (Exception ex)
            {
                return new DeleteConfigurationProductResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }
    }
}
