using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using TN.TNM.Common;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Enum;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Employee;
using TN.TNM.DataAccess.Messages.Parameters.WareHouse;
using TN.TNM.DataAccess.Messages.Results.Admin.Product;
using TN.TNM.DataAccess.Messages.Results.Employee;
using TN.TNM.DataAccess.Messages.Results.Salary;
using TN.TNM.DataAccess.Messages.Results.WareHouse;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.DynamicColumnTable;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Folder;
using TN.TNM.DataAccess.Models.Note;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.ProductCategory;
using TN.TNM.DataAccess.Models.Salary;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.WareHouse;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
//using static System.Windows.Forms.VisualStyles.VisualStyleElement.Header;
//using static System.Windows.Forms.VisualStyles.VisualStyleElement.ListView;
using static Microsoft.AspNetCore.Hosting.Internal.HostingApplication;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class WareHouseDAO : BaseDAO, IWareHouseDataAccess
    {
        private readonly IHostingEnvironment hostingEnvironment;

        public WareHouseDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IHostingEnvironment _hostingEnvironment, ILogger<WareHouseDAO> _logger)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
            this.hostingEnvironment = _hostingEnvironment;
            this.logger = _logger;
        }

        public CreateUpdateWareHouseResult CreateUpdateWareHouse(CreateUpdateWareHouseParameter parameter)
        {
            try
            {
                parameter.Warehouse.WarehouseCode = parameter.Warehouse.WarehouseCode.Trim();
                parameter.Warehouse.WarehouseName = parameter.Warehouse.WarehouseName.Trim();
                parameter.Warehouse.WarehouseAddress = parameter.Warehouse.WarehouseAddress?.Trim();
                parameter.Warehouse.WarehousePhone = parameter.Warehouse.WarehousePhone?.Trim();
                parameter.Warehouse.WarehouseDescription = parameter.Warehouse.WarehouseDescription?.Trim();

                if (parameter.Warehouse.WarehouseId == Guid.Empty)
                {
                    //Tạo mới
                    parameter.Warehouse.WarehouseId = Guid.NewGuid();
                    parameter.Warehouse.CreatedById = parameter.Warehouse.CreatedById;
                    parameter.Warehouse.CreatedDate = DateTime.Now;
                    parameter.Warehouse.UpdatedById = null;
                    parameter.Warehouse.UpdatedDate = null;
                    context.Warehouse.Add(parameter.Warehouse.ToEntity());
                    context.SaveChanges();
                }
                else
                {
                    //Sửa               
                    parameter.Warehouse.UpdatedById = parameter.Warehouse.UpdatedById;
                    parameter.Warehouse.UpdatedDate = DateTime.Now;
                    context.Warehouse.Update(parameter.Warehouse.ToEntity());
                    context.SaveChanges();
                }
                return new CreateUpdateWareHouseResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Tạo mới/Cập nhật thành công",
                    WarehouseId = parameter.Warehouse.WarehouseId
                };
            }
            catch (Exception e)
            {
                return new CreateUpdateWareHouseResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public SearchWareHouseResult SearchWareHouse(SearchWareHouseParameter parameter)
        {
            try
            {
                var listWareHouseEntity = context.Warehouse.Where(w => w.Active == true).ToList();
                var listWarehouseId = listWareHouseEntity.Select(w => w.WarehouseId).ToList(); // danh sách kho ID
                var listStorageKeeperId = listWareHouseEntity.Where(w => w.Storagekeeper != null).Select(w => w.Storagekeeper).ToList();//danh sách thủ kho ID
                var listEmployeeEntity = context.Employee.Where(w => listStorageKeeperId.Contains(w.EmployeeId)).ToList();
                var listInventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(w => listWarehouseId.Contains(w.WarehouseId)).ToList(); //nhập kho theo từng sản phẩm
                var listInventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(w => listWarehouseId.Contains(w.WarehouseId)).ToList(); //xuất kho theo sản phẩm
                var listInventoryReportEntity = context.InventoryReport.Where(w => listWarehouseId.Contains(w.WarehouseId)).ToList();//Tồn kho                                                                                                                               

                #region Kiểm tra phiếu nhập kho có trạng thái Nháp
                var statusTypeId = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == "TPH").CategoryTypeId;
                var statusId = context.Category.FirstOrDefault(f => f.CategoryTypeId == statusTypeId && f.CategoryCode == "NHA").CategoryId; // Id trạng thái nháp
                var listReceivingVoucher = context.InventoryReceivingVoucher.Where(w => w.StatusId == statusId).Select(w => w.InventoryReceivingVoucherId);
                var listReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(w => listReceivingVoucher.Contains(w.InventoryReceivingVoucherId)).ToList(); //danh sách chi tiết phiếu nhập kho có trạng thái (của phiếu tổng) là nháp  
                #endregion

                var categoryKho = context.Category.ToList();

                var listWareHouse = new List<WareHouseEntityModel>();

                listWareHouseEntity.ForEach(item =>
                {
                    //thêm tên thủ kho
                    var storagekeeperName = "";
                    var storagekeeper = listEmployeeEntity.Where(w => w.EmployeeId == item.Storagekeeper).FirstOrDefault();
                    if (storagekeeper != null)
                    {
                        storagekeeperName = storagekeeper.EmployeeName;
                    }
                    //kiểm tra có kho con hay là không
                    var hasChild = false;
                    var childWarehouse = listWareHouseEntity.Where(w => w != item && w.WarehouseParent == item.WarehouseId).FirstOrDefault();
                    if (childWarehouse != null)
                    {
                        hasChild = true;
                    }
                    //kiểm tra điều kiện thêm kho con
                    var canAddChild = true;
                    var canRemove = true;

                    var isHasReceivingVoucher = listInventoryReceivingVoucherMapping.Where(w => w.WarehouseId == item.WarehouseId).FirstOrDefault();
                    var isHasDeliveryVoucher = listInventoryDeliveryVoucherMapping.Where(w => w.WarehouseId == item.WarehouseId).FirstOrDefault();
                    var isHasInventoryReport = listInventoryReportEntity.Where(w => w.WarehouseId == item.WarehouseId).FirstOrDefault();

                    var isHasReceivingVoucherMapping = listReceivingVoucherMapping.FirstOrDefault(w => w.WarehouseId == item.WarehouseId);

                    var inventoryReportByWarehouse = listInventoryReportEntity.Where(w => w.WarehouseId == item.WarehouseId)
                                                                              .GroupBy(w => w.WarehouseId)
                                                                              .Select(s =>
                                                                               new
                                                                               {
                                                                                   SumQuanty = s.Sum(sum => sum.Quantity),
                                                                                   SumStartQuantity = s.Sum(sum => sum.StartQuantity),
                                                                               }).FirstOrDefault();
                    //tồn kho = số lượng + tồn kho đầu kỳ
                    decimal? _inventory = 0;
                    //= inventoryReportByWarehouse.SumQuanty + inventoryReportByWarehouse.SumStartQuantity;

                    if (inventoryReportByWarehouse != null)
                    {
                        _inventory = inventoryReportByWarehouse.SumQuanty + inventoryReportByWarehouse.SumStartQuantity;
                    }
                    //điều kiện không thể thêm kho: số lượng tồn kho > 0 hoặc tồn tại phiếu nhập kho ở trạng thái nháp
                    if (isHasReceivingVoucherMapping != null || _inventory > 0)
                    {
                        canAddChild = false;
                    }
                    //điều kiện không thể xóa kho: có con hoặc tồn tại phiếu nhập hoăc tồn tại phiếu xuất hoặc tồn tại tồn kho
                    if (hasChild == true || isHasReceivingVoucher != null || isHasDeliveryVoucher != null || isHasInventoryReport != null)
                    {
                        canRemove = false;
                    }

                    var listOrg = context.Organization.ToList();

                    var temp = new WareHouseEntityModel()
                    {
                        WarehouseId = item.WarehouseId,
                        WarehouseCode = item.WarehouseCode,
                        WarehouseName = item.WarehouseName,
                        WarehouseParent = item.WarehouseParent,
                        WarehouseParentName = null,
                        WarehouseAddress = item.WarehouseAddress,
                        WarehousePhone = item.WarehousePhone,
                        Storagekeeper = item.Storagekeeper,
                        StoragekeeperName = storagekeeperName,
                        HasChild = hasChild,
                        WarehouseDescription = item.WarehouseDescription,
                        WareHouseType = item.WareHouseType,
                        WarehouseCodeName = categoryKho.FirstOrDefault(x => x.CategoryId == item.WareHouseType)?.CategoryName,
                        Department = item.Department,
                        DepartmentName = listOrg.FirstOrDefault(x => x.OrganizationId == item.Department)?.OrganizationName,
                        Active = item.Active,
                        CreatedDate = item.CreatedDate,
                        CreatedById = item.CreatedById,
                        UpdatedDate = item.UpdatedDate,
                        UpdatedById = item.UpdatedById,
                        TenantId = item.TenantId,
                        CanAddChild = canAddChild,
                        CanRemove = canRemove,
                    };
                    listWareHouse.Add(temp);

                });

                listWareHouse = listWareHouse.OrderBy(w => w.WarehouseName).ToList();

                return new SearchWareHouseResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    listWareHouse = listWareHouse
                };
            }
            catch (Exception e)
            {
                return new SearchWareHouseResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetWareHouseChaResult GetWareHouseCha(GetWareHouseChaParameter parameter)
        {
            try
            {
                /*Do something..*/
                var listWareHouse = context.Warehouse.Where(x => x.Active)
                    .OrderBy(x => x.WarehouseName).ToList();
                /*End*/
                var listWareHourseEntityModel = new List<WareHouseEntityModel>();
                listWareHouse.ForEach(item =>
                {
                    listWareHourseEntityModel.Add(new WareHouseEntityModel(item));
                });
                return new GetWareHouseChaResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    listWareHouse = listWareHourseEntityModel
                };
            }
            catch (Exception e)
            {
                return new GetWareHouseChaResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetVendorOrderByVendorIdResult GetVendorOrderByVendorId(GetVendorOrderByVendorIdParameter parameter)
        {
            try
            {
                //Lấy Id các trạng thái đơn hàng: Đơn hàng mua
                var listStatusCode = new List<string>() { "PURC" };
                var listStatusId = context.PurchaseOrderStatus
                    .Where(ct => listStatusCode.Contains(ct.PurchaseOrderStatusCode) && ct.Active)
                    .Select(ct => ct.PurchaseOrderStatusId).ToList();

                #region Lấy list Đơn hàng mua

                var listVendorOrder = context.VendorOrder
                    .Where(x => x.Active == true && listStatusId.Contains(x.StatusId) &&
                                x.VendorId == parameter.VendorId)
                    .Select(y => new VendorOrderEntityModel
                    {
                        VendorOrderId = y.VendorOrderId,
                        VendorOrderCode = y.VendorOrderCode,
                        Amount = y.Amount,
                        Description = y.Description,
                        VendorDescripton = "",
                        VendorId = y.VendorId
                    }).ToList();

                var listAllVendor = context.Vendor.ToList();
                listVendorOrder.ForEach(item =>
                {
                    var vendor = listAllVendor.FirstOrDefault(x => x.VendorId == item.VendorId);
                    var vendorName = "";

                    if (vendor != null)
                    {
                        vendorName = vendor.VendorName;
                    }

                    item.VendorDescripton = item.VendorOrderCode + " - " + vendorName + " - " + item.Description +
                                            " - " + item.Amount.ToString("#,#");
                });

                #endregion

                return new GetVendorOrderByVendorIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    ListVendorOrder = listVendorOrder
                };
            }
            catch (Exception e)
            {
                return new GetVendorOrderByVendorIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetVendorOrderDetailByVenderOrderIdResult GetVendorOrderDetailByVenderOrderId(GetVendorOrderDetailByVenderOrderIdParameter parameter)
        {
            try
            {
                var vendorOrders = context.VendorOrder.Where(vo => vo.Active == true).ToList();
                var vendorOrderDetails = context.VendorOrderDetail.Where(vo => vo.Active == true).ToList();
                var categoryTypeIdUnit = context.CategoryType.FirstOrDefault(cty => cty.Active == true && cty.CategoryTypeCode == "DNH").CategoryTypeId;
                var categories = context.Category.Where(ct => ct.Active == true && ct.CategoryTypeId == categoryTypeIdUnit).ToList();
                var product = context.Product.Where(p => p.Active == true).ToList();
                var warehouseSerial = context.Serial.Where(p => p.Active == true).ToList();
                var result = new List<GetVendorOrderDetailByVenderOrderIdEntityModel>();
                //TypeWarehouseVocher =1:phieu nhap kho
                if (parameter.TypeWarehouseVocher == 1)
                {
                    var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                    var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                    //Lọc những đơn hàng đã nhập kho hết
                    var listInventoryReceivingVoucher = context.InventoryReceivingVoucher.Where(wh => wh.StatusId == categoryIdNHK).Select(s => s.InventoryReceivingVoucherId).ToList();
                    var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(wh => listInventoryReceivingVoucher.Contains(wh.InventoryReceivingVoucherId)).ToList();

                    parameter.ListVendorOrderId.ForEach(item =>
                    {
                        var vendorOrderDetail = vendorOrderDetails.Where(vod => vod.VendorOrderId == item).ToList();
                        vendorOrderDetail.ForEach(detail =>
                        {
                            if (detail.ProductId != null)
                            {
                                decimal quantityInventoryReceiving = inventoryReceivingVoucherMapping.Where(i => i.ProductId == detail.ProductId && i.ObjectId == detail.VendorOrderDetailId).Sum(i => i.QuantityActual);
                                if (quantityInventoryReceiving < detail.Quantity)
                                {
                                    GetVendorOrderDetailByVenderOrderIdEntityModel obj = new GetVendorOrderDetailByVenderOrderIdEntityModel();
                                    obj.VendorOrderId = item;
                                    obj.VendorOrderDetailId = detail.VendorOrderDetailId;
                                    obj.VendorOrderCode = vendorOrders.FirstOrDefault(vo => vo.VendorOrderId == item).VendorOrderCode;
                                    obj.ProductId = detail.ProductId;
                                    obj.ProductName = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductName;
                                    obj.ProductCode = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductCode;
                                    obj.UnitId = detail.UnitId;
                                    obj.UnitName = detail.UnitId == null ? "" : categories.FirstOrDefault(c => c.CategoryId == detail.UnitId).CategoryName;
                                    obj.QuantityRequire = detail.Quantity - quantityInventoryReceiving;
                                    obj.Quantity = detail.Quantity - quantityInventoryReceiving;
                                    obj.Note = "";
                                    obj.TotalSerial = 0;
                                    obj.Price = detail.UnitPrice;
                                    obj.ListSerial = new List<Serial>();
                                    obj.WareHouseId = Guid.Empty;
                                    obj.WareHouseName = "";
                                    obj.CurrencyUnit = detail.CurrencyUnit;
                                    obj.ExchangeRate = detail.ExchangeRate;
                                    obj.Vat = detail.Vat;
                                    obj.DiscountType = detail.DiscountType;
                                    obj.DiscountValue = detail.DiscountValue;
                                    obj.SumAmount = SumAmount(detail.Quantity, detail.UnitPrice, detail.ExchangeRate, detail.Vat, detail.DiscountValue, detail.DiscountType);
                                    obj.NameMoneyUnit = detail.CurrencyUnit != null ? context.Category.FirstOrDefault(c => c.CategoryId == detail.CurrencyUnit).CategoryName : "";
                                    result.Add(obj);
                                }
                            }
                        });

                    });
                }
                else
                {
                    var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                    var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                    //Lọc những đơn hàng đã nhập kho hết
                    var listInventoryDeliveryVoucher = context.InventoryDeliveryVoucher.Where(wh => wh.StatusId == categoryIdNHK).ToList();
                    var listInventoryDeliveryVoucherId = listInventoryDeliveryVoucher.Select(s => s.InventoryDeliveryVoucherId).ToList();
                    var inventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(wh => listInventoryDeliveryVoucherId.Contains(wh.InventoryDeliveryVoucherId)).ToList();

                    //var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.ToList();

                    parameter.ListVendorOrderId.ForEach(item =>
                    {
                        var vendorOrderDetail = vendorOrderDetails.Where(vod => vod.VendorOrderId == item).ToList();
                        vendorOrderDetail.ForEach(detail =>
                        {
                            if (detail.ProductId != null)
                            {

                                var lstInventoryDeliveryVoucherId = listInventoryDeliveryVoucher.Where(wh => wh.ObjectId == item).Select(s => s.InventoryDeliveryVoucherId).ToList();
                                decimal quantityInventoryReceiving = inventoryDeliveryVoucherMapping.Where(i => i.ProductId == detail.ProductId && lstInventoryDeliveryVoucherId.Contains(i.InventoryDeliveryVoucherId)).Sum(i => i.QuantityDelivery);

                                if (quantityInventoryReceiving < detail.Quantity)
                                {
                                    GetVendorOrderDetailByVenderOrderIdEntityModel obj = new GetVendorOrderDetailByVenderOrderIdEntityModel();
                                    obj.VendorOrderId = item;
                                    obj.VendorOrderDetailId = detail.VendorOrderDetailId;
                                    obj.VendorOrderCode = vendorOrders.FirstOrDefault(vo => vo.VendorOrderId == item).VendorOrderCode;
                                    obj.ProductId = detail.ProductId;
                                    obj.ProductName = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductName;
                                    obj.ProductCode = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductCode;
                                    obj.UnitId = detail.UnitId;
                                    obj.UnitName = detail.UnitId == null ? "" : categories.FirstOrDefault(c => c.CategoryId == detail.UnitId).CategoryName;
                                    obj.QuantityRequire = detail.Quantity - quantityInventoryReceiving;
                                    obj.Quantity = detail.Quantity - quantityInventoryReceiving;
                                    obj.Note = "";
                                    obj.TotalSerial = 0;
                                    obj.Price = detail.UnitPrice;
                                    obj.ListSerial = new List<Serial>();
                                    obj.WareHouseId = Guid.Empty;
                                    obj.WareHouseName = "";
                                    obj.CurrencyUnit = detail.CurrencyUnit;
                                    obj.ExchangeRate = detail.ExchangeRate;
                                    obj.Vat = detail.Vat;
                                    obj.DiscountType = detail.DiscountType;
                                    obj.DiscountValue = detail.DiscountValue;
                                    obj.SumAmount = SumAmount(detail.Quantity, detail.UnitPrice, detail.ExchangeRate, detail.Vat, detail.DiscountValue, detail.DiscountType);
                                    obj.NameMoneyUnit = detail.CurrencyUnit != null ? context.Category.FirstOrDefault(c => c.CategoryId == detail.CurrencyUnit).CategoryName : "";
                                    result.Add(obj);
                                }
                            }
                        });

                    });
                }

                /*End*/

                return new GetVendorOrderDetailByVenderOrderIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    ListOrderProduct = result
                };
            }
            catch (Exception e)
            {
                return new GetVendorOrderDetailByVenderOrderIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public DownloadTemplateSerialResult DownloadTemplateSerial(DownloadTemplateSerialParameter parameter)
        {
            try
            {
                string rootFolder = hostingEnvironment.WebRootPath + "\\ExcelTemplate";
                string fileName = @"4.Inv_ImportSerial.xlsx";

                //FileInfo file = new FileInfo(Path.Combine(rootFolder, fileName));
                string newFilePath = Path.Combine(rootFolder, fileName);
                byte[] data = File.ReadAllBytes(newFilePath);

                string token = string.Empty;
                return new DownloadTemplateSerialResult
                {
                    ExcelFile = data,
                    MessageCode = string.Format("Đã dowload file 4.Inv_ImportSerial"),
                    NameFile = token, //"4.Inv_ImportSerial",
                    StatusCode = HttpStatusCode.OK
                };

            }
            catch (Exception)
            {
                return new DownloadTemplateSerialResult
                {
                    MessageCode = "Đã có lỗi xảy ra trong quá trình download",
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public string ConverCreateId(int totalRecordCreate)
        {
            var datenow = DateTime.Now;
            string year = datenow.Year.ToString().Substring(datenow.Year.ToString().Length - 2, 2);
            string month = datenow.Month < 10 ? "0" + datenow.Month.ToString() : datenow.Month.ToString();
            string day = datenow.Day < 10 ? "0" + datenow.Day.ToString() : datenow.Day.ToString();
            string total = "";
            if (totalRecordCreate > 999)
            {
                total = totalRecordCreate.ToString();
            }
            else if (totalRecordCreate > 99 && totalRecordCreate < 1000)
            {
                total = "0" + totalRecordCreate.ToString();
            }
            else if (totalRecordCreate > 9 && totalRecordCreate < 100)
            {
                total = "00" + totalRecordCreate.ToString();
            }
            else
            {
                total = "000" + totalRecordCreate.ToString();
            }
            var result = day + month + year + total;

            return result;
        }
        public string ConverCreateId2(int totalRecordCreate)
        {
            var datenow = DateTime.Now;
            string year = datenow.Year.ToString().Substring(datenow.Year.ToString().Length - 2, 2);
            string month = datenow.Month < 10 ? "0" + datenow.Month.ToString() : datenow.Month.ToString();
            string day = datenow.Day < 10 ? "0" + datenow.Day.ToString() : datenow.Day.ToString();
            string total = "";
            if (totalRecordCreate > 999)
            {
                total = totalRecordCreate.ToString();
            }
            else if (totalRecordCreate > 99 && totalRecordCreate < 1000)
            {
                total = "0" + totalRecordCreate.ToString();
            }
            else if (totalRecordCreate > 9 && totalRecordCreate < 100)
            {
                total = "00" + totalRecordCreate.ToString();
            }
            else
            {
                total = "000" + totalRecordCreate.ToString();
            }
            var result = year + total;

            return result;
        }

        //public CreateOrUpdateInventoryVoucherResult CreateOrUpdateInventoryVoucher(CreateOrUpdateInventoryVoucherParameter parameter)
        //{
        //    try
        //    {
        //        var inventoryReceivingVoucher = JsonConvert.DeserializeObject<InventoryReceivingVoucher>(parameter.inventoryReceivingVoucher);
        //        var listInventoryReceivingVoucherMappingEntityModel = JsonConvert.DeserializeObject<List<GetVendorOrderDetailByVenderOrderIdEntityModel>>(parameter.inventoryReceivingVoucher);
        //        if (inventoryReceivingVoucher.InventoryReceivingVoucherId == Guid.Empty)
        //        {

        //            var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
        //            var categoryId = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHA" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

        //            var categoryTypeIdSerial = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TSE" && ct.Active == true).CategoryTypeId;
        //            var categoryListSerial = context.Category.Where(ct => ct.CategoryTypeId == categoryTypeIdSerial && ct.Active == true).ToList();

        //            //var inventoryReports = context.InventoryReport.Where(w => w.Active == true).ToList();

        //            var datenow = DateTime.Now;
        //            var totalInvertoryCreate = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();
        //            inventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
        //            inventoryReceivingVoucher.InventoryReceivingVoucherCode = "PN-" + ConverCreateId(totalInvertoryCreate + 1);
        //            inventoryReceivingVoucher.StatusId = categoryId;
        //            inventoryReceivingVoucher.ShiperName = !string.IsNullOrEmpty(inventoryReceivingVoucher.ShiperName) ? inventoryReceivingVoucher.ShiperName.Trim() : string.Empty;
        //            inventoryReceivingVoucher.Active = true;
        //            inventoryReceivingVoucher.CreatedDate = DateTime.Now;
        //            inventoryReceivingVoucher.CreatedById = parameter.UserId;
        //            context.InventoryReceivingVoucher.Add(inventoryReceivingVoucher);

        //            var note = new Note();
        //            note.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //            note.NoteId = Guid.NewGuid();
        //            note.Active = true;
        //            note.CreatedById = parameter.UserId;
        //            note.CreatedDate = DateTime.Now;
        //            note.ObjectType = "WH";
        //            note.Description = string.IsNullOrEmpty(parameter.noteContent) ? string.Empty : parameter.noteContent;
        //            note.NoteTitle = "đã tạo";
        //            note.Type = "ADD";
        //            context.Note.Add(note);
        //            if (parameter.fileList != null)
        //            {
        //                string folderName = "FileUpload";
        //                string webRootPath = hostingEnvironment.WebRootPath;

        //                //upload file to Server
        //                if (parameter.fileList != null && parameter.fileList.Count > 0)
        //                {

        //                    string checkexistPath = Path.Combine(webRootPath, folderName);
        //                    if (!Directory.Exists(checkexistPath))
        //                    {
        //                        Directory.CreateDirectory(checkexistPath);
        //                    }
        //                    foreach (IFormFile item in parameter.fileList)
        //                    {
        //                        if (item.Length > 0)
        //                        {
        //                            string fileName = item.FileName.Trim();
        //                            string fullPath = Path.Combine(checkexistPath, fileName);
        //                            using (var stream = new FileStream(fullPath, FileMode.Create))
        //                            {
        //                                item.CopyTo(stream);
        //                            }
        //                        }
        //                    }
        //                }
        //                // Add note
        //                var noteAttach = new Note();
        //                noteAttach.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //                noteAttach.NoteId = Guid.NewGuid();
        //                noteAttach.Active = true;
        //                noteAttach.CreatedById = parameter.UserId;
        //                noteAttach.CreatedDate = DateTime.Now;
        //                noteAttach.ObjectType = "WH";
        //                noteAttach.NoteTitle = "đã thêm tài liệu";
        //                noteAttach.Type = "ADD";

        //                // add noteDocument
        //                List<NoteDocument> docList = new List<NoteDocument>();
        //                string newPath = Path.Combine(webRootPath, folderName);
        //                foreach (var file in parameter.fileList)
        //                {
        //                    NoteDocument noteDoc = new NoteDocument()
        //                    {
        //                        NoteDocumentId = Guid.NewGuid(),
        //                        NoteId = noteAttach.NoteId,
        //                        DocumentName = file.FileName,
        //                        DocumentSize = file.Length.ToString(),
        //                        DocumentUrl = Path.Combine(newPath, file.FileName),
        //                        CreatedById = parameter.UserId,
        //                        CreatedDate = DateTime.Now,
        //                        Active = true
        //                    };
        //                    docList.Add(noteDoc);
        //                }

        //                if (docList.Count > 0)
        //                {
        //                    docList.ForEach(dl => { context.NoteDocument.Add(dl); });
        //                }
        //                context.Note.Add(noteAttach);
        //            }

        //            listInventoryReceivingVoucherMappingEntityModel.ForEach(item =>
        //            {
        //                if (item.ProductId != null)
        //                {
        //                    InventoryReceivingVoucherMapping voucherMapping = new InventoryReceivingVoucherMapping();
        //                    voucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //                    voucherMapping.InventoryReceivingVoucherId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //                    voucherMapping.ObjectId = item.VendorOrderDetailId;
        //                    voucherMapping.ProductId = (Guid)item.ProductId;
        //                    voucherMapping.QuantityActual = (decimal)item.Quantity;
        //                    voucherMapping.UnitId = item.UnitId;
        //                    voucherMapping.WarehouseId = item.WareHouseId;
        //                    voucherMapping.Description = item.Note;
        //                    voucherMapping.Active = true;
        //                    voucherMapping.CreatedDate = DateTime.Now;
        //                    voucherMapping.CreatedById = parameter.UserId;

        //                    if (item.ListSerial != null)
        //                    {
        //                        item.ListSerial.ForEach(itemSerial =>
        //                        {
        //                            Serial serial = new Serial();
        //                            serial.SerialId = Guid.NewGuid();
        //                            serial.SerialCode = itemSerial.SerialCode;
        //                            serial.WarehouseId = item.WareHouseId;
        //                            serial.ProductId = (Guid)item.ProductId;
        //                            serial.Active = true;
        //                            serial.CreatedDate = DateTime.Now;
        //                            serial.StatusId = categoryListSerial.FirstOrDefault(sr => sr.CategoryCode == "CXU").CategoryId;
        //                            context.Serial.Add(serial);

        //                            InventoryReceivingVoucherSerialMapping mapserial = new InventoryReceivingVoucherSerialMapping();
        //                            mapserial.InventoryReceivingVoucherSerialMappingId = Guid.NewGuid();
        //                            mapserial.InventoryReceivingVoucherMappingId = voucherMapping.InventoryReceivingVoucherMappingId;
        //                            mapserial.SerialId = serial.SerialId;
        //                            mapserial.Active = true;
        //                            mapserial.CreatedDate = DateTime.Now;
        //                            context.InventoryReceivingVoucherSerialMapping.Add(mapserial);
        //                        });

        //                    }

        //                    //var inventoryReportByProduct = inventoryReports.FirstOrDefault(wh => wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId);
        //                    //if (inventoryReportByProduct == null)
        //                    //{
        //                    //    InventoryReport inventoryReport = new InventoryReport();
        //                    //    inventoryReport.InventoryReportId = Guid.NewGuid();
        //                    //    inventoryReport.WarehouseId = item.WareHouseId;
        //                    //    inventoryReport.ProductId = voucherMapping.ProductId;
        //                    //    inventoryReport.Quantity = voucherMapping.QuantityActual;
        //                    //    inventoryReport.QuantityMinimum = 0;
        //                    //    inventoryReport.Active = true;
        //                    //    inventoryReport.CreatedDate = DateTime.Now;
        //                    //    context.InventoryReport.Add(inventoryReport);
        //                    //}
        //                    //else
        //                    //{
        //                    //    inventoryReportByProduct.Quantity += voucherMapping.QuantityActual;
        //                    //    context.InventoryReport.Update(inventoryReportByProduct);
        //                    //}

        //                    context.InventoryReceivingVoucherMapping.Add(voucherMapping);

        //                }
        //            });

        //            context.SaveChanges();
        //            return new CreateOrUpdateInventoryVoucherResult
        //            {
        //                InventoryReceivingVoucherId = inventoryReceivingVoucher.InventoryReceivingVoucherId,
        //                MessageCode = "Tạo thành công",
        //                StatusCode = HttpStatusCode.OK
        //            };
        //        }
        //        else
        //        {
        //            var categoryTypeIdSerial = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TSE" && ct.Active == true).CategoryTypeId;
        //            var categoryListSerial = context.Category.Where(ct => ct.CategoryTypeId == categoryTypeIdSerial && ct.Active == true).ToList();

        //            //var inventoryReports = context.InventoryReport.Where(w => w.Active == true).ToList();
        //            inventoryReceivingVoucher.ShiperName = inventoryReceivingVoucher.ShiperName.Trim();
        //            inventoryReceivingVoucher.UpdatedDate = DateTime.Now;
        //            inventoryReceivingVoucher.UpdatedById = parameter.UserId;
        //            context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);

        //            var note = new Note();
        //            note.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //            note.NoteId = Guid.NewGuid();
        //            note.Active = true;
        //            note.CreatedById = parameter.UserId;
        //            note.CreatedDate = DateTime.Now;
        //            note.ObjectType = "WH";
        //            note.Description = string.IsNullOrEmpty(parameter.noteContent) ? string.Empty : parameter.noteContent;
        //            note.NoteTitle = "Đã chỉnh sửa phiếu nhập kho này";
        //            note.Type = "EDT";
        //            context.Note.Add(note);
        //            if (parameter.fileList != null)
        //            {
        //                string folderName = "FileUpload";
        //                string webRootPath = hostingEnvironment.WebRootPath;

        //                //upload file to Server
        //                if (parameter.fileList != null && parameter.fileList.Count > 0)
        //                {

        //                    string checkexistPath = Path.Combine(webRootPath, folderName);
        //                    if (!Directory.Exists(checkexistPath))
        //                    {
        //                        Directory.CreateDirectory(checkexistPath);
        //                    }
        //                    foreach (IFormFile item in parameter.fileList)
        //                    {
        //                        if (item.Length > 0)
        //                        {
        //                            string fileName = item.FileName.Trim();
        //                            string fullPath = Path.Combine(checkexistPath, fileName);
        //                            using (var stream = new FileStream(fullPath, FileMode.Create))
        //                            {
        //                                item.CopyTo(stream);
        //                            }
        //                        }
        //                    }
        //                }
        //                // Add note
        //                var noteAttach = new Note();
        //                noteAttach.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //                noteAttach.NoteId = Guid.NewGuid();
        //                noteAttach.Active = true;
        //                noteAttach.CreatedById = parameter.UserId;
        //                noteAttach.CreatedDate = DateTime.Now;
        //                noteAttach.ObjectType = "WH";
        //                noteAttach.NoteTitle = "đã thêm tài liệu";
        //                noteAttach.Type = "ADD";

        //                // add noteDocument
        //                List<NoteDocument> docList = new List<NoteDocument>();
        //                string newPath = Path.Combine(webRootPath, folderName);
        //                foreach (var file in parameter.fileList)
        //                {
        //                    NoteDocument noteDoc = new NoteDocument()
        //                    {
        //                        NoteDocumentId = Guid.NewGuid(),
        //                        NoteId = noteAttach.NoteId,
        //                        DocumentName = file.FileName,
        //                        DocumentSize = file.Length.ToString(),
        //                        DocumentUrl = Path.Combine(newPath, file.FileName),
        //                        CreatedById = parameter.UserId,
        //                        CreatedDate = DateTime.Now,
        //                        Active = true
        //                    };
        //                    docList.Add(noteDoc);
        //                }

        //                if (docList.Count > 0)
        //                {
        //                    docList.ForEach(dl => { context.NoteDocument.Add(dl); });
        //                }
        //                context.Note.Add(noteAttach);
        //            }
        //            context.SaveChanges();

        //            //delete item relationship
        //            var InventoryReceivingVoucherMappingObject = context.InventoryReceivingVoucherMapping.Where(wh => wh.InventoryReceivingVoucherId == inventoryReceivingVoucher.InventoryReceivingVoucherId).ToList();
        //            var lstInventoryReceivingVoucherMappingId = InventoryReceivingVoucherMappingObject.Select(s => s.InventoryReceivingVoucherMappingId).ToList().Distinct();
        //            var InventoryReceivingVoucherSerialMappingObject = context.InventoryReceivingVoucherSerialMapping
        //                                                            .Where(wh => lstInventoryReceivingVoucherMappingId
        //                                                            .Contains(wh.InventoryReceivingVoucherSerialMappingId)).ToList();
        //            //update lai Quantity trong inventoryReports
        //            InventoryReceivingVoucherMappingObject.ForEach(item =>
        //            {
        //                var inventoryReportByProduct = context.InventoryReport.FirstOrDefault(wh => wh.ProductId == item.ProductId && wh.WarehouseId == item.WarehouseId);
        //                if (inventoryReportByProduct != null)
        //                {
        //                    inventoryReportByProduct.Quantity = inventoryReportByProduct.Quantity - item.QuantityActual;
        //                    context.InventoryReport.Update(inventoryReportByProduct);
        //                    context.SaveChanges();
        //                }

        //            });

        //            context.InventoryReceivingVoucherSerialMapping.RemoveRange(InventoryReceivingVoucherSerialMappingObject);
        //            context.InventoryReceivingVoucherMapping.RemoveRange(InventoryReceivingVoucherMappingObject);
        //            context.SaveChanges();

        //            //tao lai tu dau

        //            listInventoryReceivingVoucherMappingEntityModel.ForEach(item =>
        //            {
        //                if (item.ProductId != null)
        //                {
        //                    InventoryReceivingVoucherMapping voucherMapping = new InventoryReceivingVoucherMapping();
        //                    voucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //                    voucherMapping.InventoryReceivingVoucherId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //                    voucherMapping.ObjectId = item.VendorOrderDetailId;
        //                    voucherMapping.ProductId = (Guid)item.ProductId;
        //                    voucherMapping.QuantityActual = (decimal)item.Quantity;
        //                    voucherMapping.UnitId = item.UnitId;
        //                    voucherMapping.WarehouseId = item.WareHouseId;
        //                    voucherMapping.Description = item.Note;
        //                    voucherMapping.Active = true;
        //                    voucherMapping.CreatedDate = DateTime.Now;
        //                    voucherMapping.CreatedById = parameter.UserId;

        //                    if (item.ListSerial != null)
        //                    {
        //                        item.ListSerial.ForEach(itemSerial =>
        //                        {
        //                            Serial serial = new Serial();
        //                            serial.SerialId = Guid.NewGuid();
        //                            serial.SerialCode = itemSerial.SerialCode;
        //                            serial.WarehouseId = item.WareHouseId;
        //                            serial.ProductId = (Guid)item.ProductId;
        //                            serial.Active = true;
        //                            serial.CreatedById = parameter.UserId;
        //                            serial.CreatedDate = DateTime.Now;
        //                            serial.StatusId = categoryListSerial.FirstOrDefault(sr => sr.CategoryCode == "CXU").CategoryId;
        //                            context.Serial.Add(serial);

        //                            InventoryReceivingVoucherSerialMapping mapserial = new InventoryReceivingVoucherSerialMapping();
        //                            mapserial.InventoryReceivingVoucherSerialMappingId = Guid.NewGuid();
        //                            mapserial.InventoryReceivingVoucherMappingId = voucherMapping.InventoryReceivingVoucherMappingId;
        //                            mapserial.SerialId = serial.SerialId;
        //                            mapserial.Active = true;
        //                            mapserial.CreatedDate = DateTime.Now;
        //                            context.InventoryReceivingVoucherSerialMapping.Add(mapserial);
        //                        });

        //                        //var inventoryReportByProduct = inventoryReports.FirstOrDefault(wh => wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId);
        //                        //if (inventoryReportByProduct == null)
        //                        //{
        //                        //    InventoryReport inventoryReport = new InventoryReport();
        //                        //    inventoryReport.InventoryReportId = Guid.NewGuid();
        //                        //    inventoryReport.WarehouseId = item.WareHouseId;
        //                        //    inventoryReport.ProductId = voucherMapping.ProductId;
        //                        //    inventoryReport.Quantity = voucherMapping.QuantityActual;
        //                        //    inventoryReport.QuantityMinimum = 0;
        //                        //    inventoryReport.Active = true;
        //                        //    inventoryReport.CreatedDate = DateTime.Now;
        //                        //    context.InventoryReport.Add(inventoryReport);
        //                        //}
        //                        //else
        //                        //{
        //                        //    inventoryReportByProduct.Quantity += voucherMapping.QuantityActual;
        //                        //    context.InventoryReport.Update(inventoryReportByProduct);
        //                        //}

        //                    }
        //                    context.InventoryReceivingVoucherMapping.Add(voucherMapping);

        //                }
        //            });

        //            context.SaveChanges();
        //            return new CreateOrUpdateInventoryVoucherResult
        //            {
        //                MessageCode = "Cập nhập thành công",
        //                StatusCode = HttpStatusCode.OK,
        //                InventoryReceivingVoucherId = inventoryReceivingVoucher.InventoryReceivingVoucherId
        //            };
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        this.logger.LogError("CreateOrUpdateInventoryVoucherDAO:" + e.ToString());

        //        return new CreateOrUpdateInventoryVoucherResult
        //        {
        //            MessageCode = "Đã có lỗi xảy ra trong quá trình cập nhập",
        //            StatusCode = HttpStatusCode.ExpectationFailed
        //        };
        //    }
        //}

        public RemoveWareHouseResult RemoveWareHouse(RemoveWareHouseParameter parameter)
        {
            try
            {
                var RemoveWareHouse = context.Warehouse.Where(wh => wh.WarehouseId == parameter.WareHouseId).FirstOrDefault();
                if (RemoveWareHouse == null)
                {
                    return new RemoveWareHouseResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Ware House không tồn tại trong hệ thống",
                    };
                }
                context.Warehouse.Remove(RemoveWareHouse);
                context.SaveChanges();

                return new RemoveWareHouseResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công",
                    WareHouseId = RemoveWareHouse.WarehouseId
                };
            }
            catch (Exception e)
            {
                return new RemoveWareHouseResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetListInventoryReceivingVoucherResult GetListInventoryReceivingVoucher(GetListInventoryReceivingVoucherParameter parameter)
        {

            try
            {
                return new GetListInventoryReceivingVoucherResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new GetListInventoryReceivingVoucherResult
                {
                    MessageCode = "Có lỗi xảy ra trong quá trình lọc",
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }

        }

        public GetListCustomerOrderByIdCustomerIdResult GetListCustomerOrderByIdCustomerId(GetListCustomerOrderByIdCustomerIdParameter parameter)
        {
            try
            {
                //Lấy Id các trạng thái đơn hàng: Đang xử lý, Đã thanh toán, Đã giao hàng và đã đóng
                var listStatusCode = new List<string>() { "RTN" };
                var listStatusId = context.OrderStatus.Where(ct => listStatusCode.Contains(ct.OrderStatusCode) && ct.Active == true).Select(ct => ct.OrderStatusId).ToList();
                //Lọc những đơn hàng đã nhập kho hết
                var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                var listInventoryReceivingVoucher = context.InventoryReceivingVoucher.Where(wh => wh.StatusId == categoryIdNHK).Select(s => s.InventoryReceivingVoucherId).ToList();
                var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(wh => listInventoryReceivingVoucher.Contains(wh.InventoryReceivingVoucherId)).ToList();
                //var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.ToList();
                var customerOrderDetail = context.CustomerOrderDetail.ToList();

                var result = new List<CustomerOrderEntityModel>();


                //var result = new List<CustomerOrder>();
                //Lấy các đơn hàng có các trạng thái trên
                //Thiếu điều kiện thêm trường vào VendorOderDetail: số lượng đã nhập, Trạng thái nhậps
                var listCustomerOrder = context.CustomerOrder.Where(x => x.Active == true && listStatusId.Contains(x.StatusId.Value) && x.CustomerId == parameter.CustomerId).OrderBy(x => x.OrderDate).ToList();

                listCustomerOrder.ForEach(item =>
                {
                    var productCustomerOrder = customerOrderDetail.Where(v => v.OrderId == item.OrderId).ToList();
                    productCustomerOrder.ForEach(proitem =>
                    {
                        if (proitem.ProductId != null)
                        {
                            decimal quantityInventoryReceiving = inventoryReceivingVoucherMapping.Where(i => i.ProductId == proitem.ProductId && i.ObjectId == proitem.OrderDetailId).Sum(i => i.QuantityActual);
                            if (quantityInventoryReceiving < proitem.Quantity)
                            {
                                result.Add(new CustomerOrderEntityModel(item));
                            }
                        }
                    });
                });

                result = result.Distinct().ToList();
                return new GetListCustomerOrderByIdCustomerIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    listCustomerOrder = result
                };
            }
            catch (Exception e)
            {

                return new GetListCustomerOrderByIdCustomerIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra",
                };

            }
        }

        public CheckQuantityActualReceivingVoucherResult CheckQuantityActualReceivingVoucher(CheckQuantityActualReceivingVoucherParameter parameter)
        {
            try
            {
                decimal SumTotalQuantityActual = context.InventoryReceivingVoucherMapping.Where(wh => wh.ObjectId == parameter.ObjectId).Sum(s => s.QuantityActual);
                decimal? Quantity = 0;
                bool IsEnoughX = false;
                if (parameter.Type == 1)
                {
                    Quantity = context.VendorOrderDetail.FirstOrDefault(f => f.VendorOrderDetailId == parameter.ObjectId).Quantity;
                }
                else
                {
                    Quantity = context.CustomerOrderDetail.FirstOrDefault(f => f.OrderDetailId == parameter.ObjectId).Quantity;
                }

                if (Quantity.HasValue)
                {
                    if (SumTotalQuantityActual == Quantity)
                    {
                        IsEnoughX = true;
                    }
                    else
                    {
                        IsEnoughX = false;
                    }
                }

                return new CheckQuantityActualReceivingVoucherResult
                {
                    IsEnough = IsEnoughX,
                    SumTotalQuantityActual = SumTotalQuantityActual,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new CheckQuantityActualReceivingVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };

            }

        }
        //Method Prive
        private decimal SumAmount(decimal? Quantity, decimal? UnitPrice, decimal? ExchangeRate, decimal? Vat, decimal? DiscountValue, bool? DiscountType)
        {
            decimal result = 0;
            decimal CaculateVAT = 0;
            decimal CacuDiscount = 0;

            if (Vat != null)
            {
                CaculateVAT = (Quantity.Value * UnitPrice.Value * ExchangeRate.Value * Vat.Value) / 100;
            }
            if (DiscountValue != null)
            {
                if (DiscountType == true)
                {
                    CacuDiscount = ((Quantity.Value * UnitPrice.Value * ExchangeRate.Value * DiscountValue.Value) / 100);
                }
                else
                {
                    CacuDiscount = DiscountValue.Value;
                }
            }
            result = (Quantity.Value * UnitPrice.Value * ExchangeRate.Value) + CaculateVAT - CacuDiscount;
            return result;
        }

        public GetCustomerOrderDetailByCustomerOrderIdResult GetCustomerOrderDetailByCustomerOrderId(GetCustomerOrderDetailByCustomerOrderIdParameter parameter)
        {
            try
            {
                var customerOrders = context.CustomerOrder.Where(co => co.Active == true).ToList();
                var customerOrderDetails = context.CustomerOrderDetail.Where(vo => vo.Active == true).ToList();
                var categoryTypeIdUnit = context.CategoryType.FirstOrDefault(cty => cty.Active == true && cty.CategoryTypeCode == "DNH").CategoryTypeId;
                var categories = context.Category.Where(ct => ct.Active == true && ct.CategoryTypeId == categoryTypeIdUnit).ToList();
                var product = context.Product.Where(p => p.Active == true).ToList();
                var warehouseSerial = context.Serial.Where(p => p.Active == true).ToList();
                var result = new List<GetVendorOrderDetailByVenderOrderIdEntityModel>();
                //TypeWarehouseVocher:1 phiếu nhập

                if (parameter.TypeWarehouseVocher == 1)
                {
                    var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                    var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                    //Lọc những đơn hàng đã nhập kho hết
                    var listInventoryReceivingVoucher = context.InventoryReceivingVoucher.Where(wh => wh.StatusId == categoryIdNHK).Select(s => s.InventoryReceivingVoucherId).ToList();
                    var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(wh => listInventoryReceivingVoucher.Contains(wh.InventoryReceivingVoucherId)).ToList();

                    //var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.ToList();

                    parameter.ListCustomerOrderId.ForEach(item =>
                    {
                        var customerOrderDetail = customerOrderDetails.Where(vod => vod.OrderId == item).ToList();
                        customerOrderDetail.ForEach(detail =>
                        {
                            if (detail.ProductId != null)
                            {
                                decimal quantityInventoryReceiving = inventoryReceivingVoucherMapping.Where(i => i.ProductId == detail.ProductId && i.ObjectId == detail.OrderDetailId).Sum(i => i.QuantityActual);
                                if (quantityInventoryReceiving < detail.Quantity)
                                {

                                    GetVendorOrderDetailByVenderOrderIdEntityModel obj = new GetVendorOrderDetailByVenderOrderIdEntityModel();
                                    obj.VendorOrderId = item;
                                    obj.VendorOrderDetailId = detail.OrderDetailId;
                                    obj.VendorOrderCode = customerOrders.FirstOrDefault(vo => vo.OrderId == item).OrderCode;
                                    obj.ProductId = detail.ProductId;
                                    obj.ProductName = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductName;
                                    obj.ProductCode = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductCode;
                                    obj.UnitId = detail.UnitId;
                                    obj.UnitName = detail.UnitId == null ? "" : categories.FirstOrDefault(c => c.CategoryId == detail.UnitId).CategoryName;
                                    obj.QuantityRequire = detail.Quantity - quantityInventoryReceiving;
                                    obj.Quantity = detail.Quantity - quantityInventoryReceiving;
                                    obj.Note = "";
                                    obj.TotalSerial = 0;
                                    obj.Price = detail.UnitPrice;
                                    obj.ListSerial = new List<Serial>();
                                    obj.WareHouseId = Guid.Empty;
                                    obj.WareHouseName = "";
                                    obj.CurrencyUnit = detail.CurrencyUnit;
                                    obj.ExchangeRate = detail.ExchangeRate;
                                    obj.Vat = detail.Vat;
                                    obj.DiscountType = detail.DiscountType;
                                    obj.DiscountValue = detail.DiscountValue;
                                    obj.SumAmount = SumAmount(detail.Quantity, detail.UnitPrice, detail.ExchangeRate, detail.Vat, detail.DiscountValue, detail.DiscountType);
                                    obj.NameMoneyUnit = detail.CurrencyUnit != null ? context.Category.FirstOrDefault(c => c.CategoryId == detail.CurrencyUnit).CategoryName : "";
                                    result.Add(obj);
                                }
                            }
                        });

                    });
                }
                else
                {
                    var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                    var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                    //Lọc những đơn hàng đã nhập kho hết
                    var listInventoryDeliveryVoucher = context.InventoryDeliveryVoucher.Where(wh => wh.StatusId == categoryIdNHK).ToList();
                    var listInventoryDeliveryVoucherId = listInventoryDeliveryVoucher.Select(s => s.InventoryDeliveryVoucherId).ToList();
                    var inventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(wh => listInventoryDeliveryVoucherId.Contains(wh.InventoryDeliveryVoucherId)).ToList();

                    //var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.ToList();

                    parameter.ListCustomerOrderId.ForEach(item =>
                    {
                        var lstInventoryDeliveryVoucherId = listInventoryDeliveryVoucher.Where(wh => wh.ObjectId == item).Select(s => s.InventoryDeliveryVoucherId).ToList();

                        var customerOrderDetail = customerOrderDetails.Where(vod => vod.OrderId == item).ToList();
                        customerOrderDetail.ForEach(detail =>
                        {
                            if (detail.ProductId != null)
                            {
                                decimal quantityInventoryReceiving = inventoryDeliveryVoucherMapping.Where(i => i.ProductId == detail.ProductId && lstInventoryDeliveryVoucherId.Contains(i.InventoryDeliveryVoucherId)).Sum(i => i.QuantityDelivery);
                                if (quantityInventoryReceiving < detail.Quantity)
                                {

                                    GetVendorOrderDetailByVenderOrderIdEntityModel obj = new GetVendorOrderDetailByVenderOrderIdEntityModel();
                                    obj.VendorOrderId = item;
                                    obj.VendorOrderDetailId = detail.OrderDetailId;
                                    obj.VendorOrderCode = customerOrders.FirstOrDefault(vo => vo.OrderId == item).OrderCode;
                                    obj.ProductId = detail.ProductId;
                                    obj.ProductName = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductName;
                                    obj.ProductCode = detail.ProductId == null ? "" : product.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductCode;
                                    obj.UnitId = detail.UnitId;
                                    obj.UnitName = detail.UnitId == null ? "" : categories.FirstOrDefault(c => c.CategoryId == detail.UnitId).CategoryName;
                                    obj.QuantityRequire = detail.Quantity - quantityInventoryReceiving;
                                    obj.Quantity = detail.Quantity - quantityInventoryReceiving;
                                    obj.Note = "";
                                    obj.TotalSerial = 0;
                                    obj.Price = detail.UnitPrice;
                                    obj.ListSerial = new List<Serial>();
                                    obj.WareHouseId = Guid.Empty;
                                    obj.WareHouseName = "";
                                    obj.CurrencyUnit = detail.CurrencyUnit;
                                    obj.ExchangeRate = detail.ExchangeRate;
                                    obj.Vat = detail.Vat;
                                    obj.DiscountType = detail.DiscountType;
                                    obj.DiscountValue = detail.DiscountValue;
                                    obj.SumAmount = SumAmount(detail.Quantity, detail.UnitPrice, detail.ExchangeRate, detail.Vat, detail.DiscountValue, detail.DiscountType);
                                    obj.NameMoneyUnit = detail.CurrencyUnit != null ? context.Category.FirstOrDefault(c => c.CategoryId == detail.CurrencyUnit).CategoryName : "";
                                    result.Add(obj);
                                }
                            }
                        });

                    });
                }
                /*End*/

                return new GetCustomerOrderDetailByCustomerOrderIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    ListOrderProduct = result
                };
            }
            catch (Exception e)
            {
                return new GetCustomerOrderDetailByCustomerOrderIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }

        }
        /// <summary>
        /// Loc nha cung cap
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public FilterVendorResult FilterVendor(FilterVendorParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                //Lọc những đơn hàng chưa nhập kho hết
                var listInventoryReceivingVoucher = context.InventoryReceivingVoucher
                    .Where(wh => wh.StatusId == categoryIdNHK).Select(s => s.InventoryReceivingVoucherId).ToList();
                var listInventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping
                    .Where(wh => listInventoryReceivingVoucher.Contains(wh.InventoryReceivingVoucherId)).ToList();

                //Lấy Id các trạng thái đơn hàng: Đang xử lý, Đã thanh toán, Đã giao hàng và đã đóng
                var listStatusCode = new List<string>() { "PURC" };
                var listStatusId = context.PurchaseOrderStatus
                    .Where(ct => listStatusCode.Contains(ct.PurchaseOrderStatusCode) && ct.Active)
                    .Select(ct => ct.PurchaseOrderStatusId).ToList();
                var listVendorOrder = context.VendorOrder
                    .Where(x => x.Active == true && listStatusId.Contains(x.StatusId)).OrderBy(x => x.VendorOrderDate)
                    .ToList();
                var listVendorOrderId = listVendorOrder.Select(s => s.VendorOrderId).ToList();
                var listVendorOrderDetails = context.VendorOrderDetail
                    .Where(wh => listVendorOrderId.Contains(wh.VendorOrderId)).ToList();

                var listResultValidate = new List<VendorOrder>();
                listVendorOrder.ForEach(vendororder =>
                {
                    bool IsEnough = true;
                    var lstOrderDetails = listVendorOrderDetails
                        .Where(wh => wh.VendorOrderId == vendororder.VendorOrderId).ToList();
                    if (lstOrderDetails.Count > 0)
                    {
                        lstOrderDetails.ForEach(item =>
                        {
                            var SumQualityActual = listInventoryReceivingVoucherMapping
                                .Where(wh => wh.ObjectId == item.VendorOrderDetailId).Sum(s => s.QuantityActual);
                            if (SumQualityActual < item.Quantity)
                            {
                                IsEnough = false;
                            };
                        });
                    }
                    if (!IsEnough)
                    {
                        listResultValidate.Add(vendororder);
                    }
                });
                ///DS vendor co don
                var listVendorID = listResultValidate.Select(s => s.VendorId).Distinct().ToList();
                var VendorList = context.Vendor.Where(wh => listVendorID.Contains(wh.VendorId))
                    .Select(v => new VendorEntityModel
                    {
                        VendorId = v.VendorId,
                        VendorName = v.VendorName,
                        VendorGroupId = v.VendorGroupId,
                        VendorCode = v.VendorCode,
                        TotalPurchaseValue = v.TotalPurchaseValue,
                        TotalPayableValue = v.TotalPayableValue,
                        NearestDateTransaction = v.NearestDateTransaction,
                        PaymentId = v.PaymentId,
                        CreatedById = v.CreatedById,
                        CreatedDate = v.CreatedDate,
                        UpdatedById = v.UpdatedById,
                        UpdatedDate = v.UpdatedDate,
                        Active = v.Active,
                    }).OrderByDescending(v => v.CreatedDate).ToList();

                return new FilterVendorResult
                {
                    VendorList = VendorList,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new FilterVendorResult
                {
                    VendorList = new List<VendorEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            };
        }
        /// <summary>
        /// Loc khach hang
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public FilterCustomerResult FilterCustomer(FilterCustomerParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                //Lọc những đơn hàng chưa nhập kho hết
                var listInventoryReceivingVoucher = context.InventoryReceivingVoucher.Where(wh => wh.StatusId == categoryIdNHK).Select(s => s.InventoryReceivingVoucherId).ToList();
                var listInventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(wh => listInventoryReceivingVoucher.Contains(wh.InventoryReceivingVoucherId)).ToList();
                //Lấy Id các trạng thái đơn hàng: Đang xử lý, Đã thanh toán, Đã giao hàng và đã đóng
                var listStatusCode = new List<string>() { "RTN" };
                var listStatusId = context.OrderStatus.Where(ct => listStatusCode.Contains(ct.OrderStatusCode) && ct.Active == true).Select(ct => ct.OrderStatusId).ToList();
                var listCustomerOrder = context.CustomerOrder.Where(x => x.Active == true && listStatusId.Contains(x.StatusId.Value)).OrderBy(x => x.OrderDate).ToList();
                var listCustomerOrderId = listCustomerOrder.Select(s => s.OrderId).ToList();
                var listCustomerorderDetail = context.CustomerOrderDetail.Where(wh => listCustomerOrderId.Contains(wh.OrderId)).ToList();
                var listResultValidate = new List<CustomerOrder>();

                listCustomerOrder.ForEach(customerorder =>
                {
                    bool IsEnough = true;
                    var lstOrderDetails = listCustomerorderDetail.Where(wh => wh.OrderId == customerorder.OrderId).ToList();
                    if (lstOrderDetails.Count > 0)
                    {
                        lstOrderDetails.ForEach(item =>
                        {
                            var SumQualityActual = listInventoryReceivingVoucherMapping.Where(wh => wh.ObjectId == item.OrderDetailId).Sum(s => s.QuantityActual);
                            if (SumQualityActual < item.Quantity)
                            {
                                IsEnough = false;
                                return;
                            };
                        });

                    }
                    if (!IsEnough)
                    {
                        listResultValidate.Add(customerorder);
                    }
                });


                var listCustomerID = listResultValidate.Select(s => s.CustomerId).Distinct().ToList();

                var CustomerList = context.Customer.Where(wh => listCustomerID.Contains(wh.CustomerId))
                                  .Select(c => new CustomerEntityModel
                                  {
                                      CustomerId = c.CustomerId,
                                      CustomerCode = c.CustomerCode,
                                      CustomerName = c.CustomerName,
                                  }).OrderByDescending(date => date.CreatedDate).ToList();

                return new FilterCustomerResult
                {
                    Customer = CustomerList,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new FilterCustomerResult
                {
                    Customer = new List<CustomerEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            };
        }
        public ChangeStatusInventoryReceivingVoucherResult ChangeStatusInventoryReceivingVoucherProduction(ChangeStatusInventoryReceivingVoucherParameter parameter)
        {
            var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
            var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

            var InventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(f =>
               f.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

            InventoryReceivingVoucher.StatusId = categoryIdNHK;

            context.InventoryReceivingVoucher.Update(InventoryReceivingVoucher);
            context.SaveChanges();

            return new ChangeStatusInventoryReceivingVoucherResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Đã nhập kho thành công"
            };
        }
        public ChangeStatusInventoryReceivingVoucherResult ChangeStatusInventoryReceivingVoucher(ChangeStatusInventoryReceivingVoucherParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                var InventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(f =>
                    f.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);
                var inventoryReceivingVoucherMappingEntity = context.InventoryReceivingVoucherMapping
                    .Where(wh =>
                        wh.InventoryReceivingVoucherId == InventoryReceivingVoucher.InventoryReceivingVoucherId)
                    .ToList();

                InventoryReceivingVoucher.StatusId = categoryIdNHK; // Đã nhập
                TimeSpan today = new TimeSpan(DateTime.Now.Hour, DateTime.Now.Minute, DateTime.Now.Second);
                InventoryReceivingVoucher.InventoryReceivingVoucherTime = today;
                InventoryReceivingVoucher.UpdatedById = parameter.UserId;
                InventoryReceivingVoucher.UpdatedDate = DateTime.Now;
                context.InventoryReceivingVoucher.Update(InventoryReceivingVoucher);
                context.SaveChanges();

               

                //update vao bang Ton kho
                inventoryReceivingVoucherMappingEntity.ForEach(voucherMapping =>
                {

                    UpdateInventoryReport(voucherMapping.ProductId, voucherMapping.LotNoId.Value, voucherMapping.WarehouseId, parameter.UserId, InventoryReceivingVoucher.InventoryReceivingVoucherDate, voucherMapping.QuantityActual, 0, 0, 0, 0, 0, 0, 0, 0);
                    //var inventoryReportByProduct = context.InventoryReport.FirstOrDefault(wh =>
                    //    wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == InventoryReceivingVoucher.WarehouseId && wh.LotNoId == voucherMapping.LotNoId && wh.InventoryReportDate.Date == DateTime.Now.Date);
                    //if (inventoryReportByProduct == null)
                    //{
                    //        //UpdateInventoryReport(voucherMapping.ProductId, voucherMapping.LotNoId.Value, InventoryReceivingVoucher.WarehouseId, parameter.UserId, InventoryReceivingVoucher.InventoryReceivingVoucherDate,
                    //        //    voucherMapping.QuantityActual, 0, 0, 0, 0, 0, 0, 0);

                    //        InventoryReport inventoryReport = new InventoryReport();
                    //        inventoryReport.InventoryReportId = Guid.NewGuid();
                    //        inventoryReport.WarehouseId = InventoryReceivingVoucher.WarehouseId;
                    //        inventoryReport.ProductId = voucherMapping.ProductId;
                    //        inventoryReport.LotNoId = voucherMapping.LotNoId;
                    //        inventoryReport.QuantityMinimum = 0;
                    //        inventoryReport.Active = true;
                    //        inventoryReport.CreatedDate = DateTime.Now;
                    //        inventoryReport.InventoryReportDate = DateTime.Now;
                    //        inventoryReport.QuantityReceiving = voucherMapping.QuantityActual;

                    //        var report = context.InventoryReport.Where(wh =>
                    //       wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == InventoryReceivingVoucher.WarehouseId && wh.LotNoId == voucherMapping.LotNoId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                    //        if (report != null)
                    //            inventoryReport.StartQuantity = report.QuantityReceiving + report.StartQuantity - report.QuantityDelivery;

                    //        context.InventoryReport.Add(inventoryReport);
                    //    }
                    //    else
                    //    {
                    //        inventoryReportByProduct.QuantityReceiving += voucherMapping.QuantityActual;
                    //        context.InventoryReport.Update(inventoryReportByProduct);
                    //    }


                });
                context.SaveChanges();

                return new ChangeStatusInventoryReceivingVoucherResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Đã nhập kho thành công"
                };
            }
            catch (Exception)
            {
                return new ChangeStatusInventoryReceivingVoucherResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi khi tiến hành nhập kho"
                };
            }
        }

        public ChangeStatusInventoryReceivingVoucherResult ChangeStatusInventoryReceivingVoucherTP(ChangeStatusInventoryReceivingVoucherParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                var InventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(f =>
                    f.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);
                var inventoryReceivingVoucherMappingEntity = context.InventoryReceivingVoucherMapping
                    .Where(wh =>
                        wh.InventoryReceivingVoucherId == InventoryReceivingVoucher.InventoryReceivingVoucherId)
                    .ToList();

                InventoryReceivingVoucher.StatusId = categoryIdNHK; // Đã nhập
                TimeSpan today = new TimeSpan(DateTime.Now.Hour, DateTime.Now.Minute, DateTime.Now.Second);
                InventoryReceivingVoucher.InventoryReceivingVoucherTime = today;
                InventoryReceivingVoucher.UpdatedById = parameter.UserId;
                InventoryReceivingVoucher.UpdatedDate = DateTime.Now;
                context.InventoryReceivingVoucher.Update(InventoryReceivingVoucher);
                context.SaveChanges();

                //update vao bang Ton kho 
                inventoryReceivingVoucherMappingEntity.ForEach(voucherMapping =>
                {
                    UpdateInventoryReport(voucherMapping.ProductId, voucherMapping.LotNoId.Value, InventoryReceivingVoucher.WarehouseId, parameter.UserId, InventoryReceivingVoucher.InventoryReceivingVoucherDate.Date, voucherMapping.QuantityOk ?? 0, 0, voucherMapping.QuantityNg ?? 0, 0, voucherMapping.QuantityPending ?? 0, 0, 0, 0, voucherMapping.QuantityProduct ?? 0);
                });

                return new ChangeStatusInventoryReceivingVoucherResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Đã nhập kho thành công"
                };
            }
            catch (Exception)
            {
                return new ChangeStatusInventoryReceivingVoucherResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi khi tiến hành nhập kho"
                };
            }
        }

        private void UpdateInventoryReport(Guid productId, long LotNoId, Guid warehouseId, Guid userId, DateTime inventoryReportDate,
            decimal quantityReceiving = 0, decimal quantityDelivery = 0, decimal reuseReceiving = 0, decimal reuseDelivery = 0,
            decimal pendingReceiving = 0, decimal pendingDelivery = 0, decimal cancelReceiving = 0, decimal cancelDelivery = 0, decimal productionNumber = 0)
        {
            var now = DateTime.Now.Date;
            var _list = context.InventoryReport.Where(w => w.ProductId == productId && 
                                                           w.LotNoId == LotNoId &&
                                                           w.WarehouseId == warehouseId).ToList();
            var entCurrentInventoryReport = _list.FirstOrDefault(x => x.InventoryReportDate.Date == inventoryReportDate.Date);

            var lstentInventoryReport = context.InventoryReport.Where(w => w.ProductId == productId
                                                                && w.WarehouseId == warehouseId).OrderByDescending(o => o.InventoryReportDate).ToList();

            var entInventoryReport = lstentInventoryReport.Where(w => w.InventoryReportDate.Date < inventoryReportDate.Date).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
            if (entCurrentInventoryReport != null)
            {
                if(entInventoryReport != null)
                {
                    entCurrentInventoryReport.StartQuantity = (entInventoryReport.StartQuantity + entInventoryReport.QuantityReceiving) - entInventoryReport.QuantityDelivery;
                    entCurrentInventoryReport.StartPending = (entInventoryReport.StartPending + entInventoryReport.PendingReceiving) - entInventoryReport.PendingDelivery;
                    entCurrentInventoryReport.StartCancel = (entInventoryReport.StartCancel + entInventoryReport.CancelReceiving) - entInventoryReport.CancelDelivery;
                    entCurrentInventoryReport.StartReuse = (entInventoryReport.StartReuse + entInventoryReport.ReuseReceiving) - entInventoryReport.ReuseDelivery;
                }
                else
                {
                    entCurrentInventoryReport.StartQuantity = 0;
                    entCurrentInventoryReport.StartPending = 0;
                    entCurrentInventoryReport.StartCancel = 0;
                    entCurrentInventoryReport.StartReuse = 0;
                }
                entCurrentInventoryReport.ProductionNumber += productionNumber;
                entCurrentInventoryReport.QuantityReceiving += quantityReceiving;
                entCurrentInventoryReport.QuantityDelivery += quantityDelivery;
                entCurrentInventoryReport.ReuseReceiving += reuseReceiving;
                entCurrentInventoryReport.ReuseDelivery += reuseDelivery;
                entCurrentInventoryReport.PendingReceiving += pendingReceiving;
                entCurrentInventoryReport.PendingDelivery += pendingDelivery;
                entCurrentInventoryReport.CancelReceiving += cancelReceiving;
                entCurrentInventoryReport.CancelDelivery += cancelDelivery;
                entCurrentInventoryReport.UpdatedById = userId;
                entCurrentInventoryReport.UpdatedDate = now;
                context.InventoryReport.Update(entCurrentInventoryReport);
                context.SaveChanges();
            }
            else
            {
                entCurrentInventoryReport = new InventoryReport();
                entCurrentInventoryReport.InventoryReportId = Guid.NewGuid();
                entCurrentInventoryReport.WarehouseId = warehouseId;
                entCurrentInventoryReport.ProductId = productId;
                entCurrentInventoryReport.LotNoId = LotNoId;
                entCurrentInventoryReport.Active = true;
                entCurrentInventoryReport.InventoryReportDate = inventoryReportDate.Date;
                if (entInventoryReport != null)
                {
                    entCurrentInventoryReport.StartQuantity = (entInventoryReport.StartQuantity + entInventoryReport.QuantityReceiving) - entInventoryReport.QuantityDelivery;
                    entCurrentInventoryReport.StartPending = (entInventoryReport.StartPending + entInventoryReport.PendingReceiving) - entInventoryReport.PendingDelivery;
                    entCurrentInventoryReport.StartCancel = (entInventoryReport.StartCancel + entInventoryReport.CancelReceiving) - entInventoryReport.CancelDelivery;
                    entCurrentInventoryReport.StartReuse = (entInventoryReport.StartReuse + entInventoryReport.ReuseReceiving) - entInventoryReport.ReuseDelivery;
                } 
                else
                {
                    entCurrentInventoryReport.StartQuantity = 0;
                    entCurrentInventoryReport.StartPending = 0;
                    entCurrentInventoryReport.StartCancel = 0;
                    entCurrentInventoryReport.StartReuse = 0;
                }
                entCurrentInventoryReport.ProductionNumber += productionNumber;
                entCurrentInventoryReport.QuantityReceiving += quantityReceiving;
                entCurrentInventoryReport.QuantityDelivery += quantityDelivery;
                entCurrentInventoryReport.ReuseReceiving += reuseReceiving;
                entCurrentInventoryReport.ReuseDelivery += reuseDelivery;
                entCurrentInventoryReport.PendingReceiving += pendingReceiving;
                entCurrentInventoryReport.PendingDelivery += pendingDelivery;
                entCurrentInventoryReport.CancelReceiving += cancelReceiving;
                entCurrentInventoryReport.CancelDelivery += cancelDelivery;
                entCurrentInventoryReport.CreatedById = userId;
                entCurrentInventoryReport.CreatedDate = now;
                context.InventoryReport.Add(entCurrentInventoryReport);
                context.SaveChanges();
            }

            #region Cập nhật lại tồn kho nếu không phải ngày hiện tại

            var reportDate = inventoryReportDate.Date;
            reportDate = reportDate.AddDays(1);

            var inventoryReportMaxDate = context.InventoryReport.Where(w => w.ProductId == productId
                                                                            && w.LotNoId == LotNoId
                                                                            && w.WarehouseId == warehouseId).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
            if(inventoryReportMaxDate != null)
            {
                while (reportDate <= inventoryReportMaxDate.InventoryReportDate.Date)
                {
                    var lstentCurrentUpdateInventoryReport = context.InventoryReport.Where(w => w.ProductId == productId && w.LotNoId == LotNoId && w.WarehouseId == warehouseId).ToList();
                    var entCurrentUpdateInventoryReport = lstentCurrentUpdateInventoryReport.FirstOrDefault(w => w.InventoryReportDate.Date == reportDate);
                    if (entCurrentUpdateInventoryReport != null)
                    {
                        var lstentUpdateInventoryReport = context.InventoryReport.Where(w => w.ProductId == productId
                                                                                        && w.LotNoId == LotNoId
                                                                                        && w.WarehouseId == warehouseId).OrderByDescending(o => o.InventoryReportDate).ToList();
                        var entUpdateInventoryReport = lstentUpdateInventoryReport.Where(w => w.InventoryReportDate.Date < reportDate).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
                        if (entUpdateInventoryReport != null)
                        {
                            entCurrentUpdateInventoryReport.StartQuantity = (entUpdateInventoryReport.StartQuantity + entUpdateInventoryReport.QuantityReceiving) - entUpdateInventoryReport.QuantityDelivery;
                            entCurrentUpdateInventoryReport.StartPending = (entUpdateInventoryReport.StartPending + entUpdateInventoryReport.PendingReceiving) - entUpdateInventoryReport.PendingDelivery;
                            entCurrentUpdateInventoryReport.StartCancel = (entUpdateInventoryReport.StartCancel + entUpdateInventoryReport.CancelReceiving) - entUpdateInventoryReport.CancelDelivery;
                            entCurrentUpdateInventoryReport.StartReuse = (entUpdateInventoryReport.StartReuse + entUpdateInventoryReport.ReuseReceiving) - entUpdateInventoryReport.ReuseDelivery;
                            entCurrentUpdateInventoryReport.UpdatedById = userId;
                            entCurrentUpdateInventoryReport.UpdatedDate = now;
                            context.InventoryReport.Update(entCurrentUpdateInventoryReport);
                            context.SaveChanges();
                        }
                    }
                    reportDate = reportDate.AddDays(1);
                }
            }

            #endregion

            //if (entInventoryReport != null)
            //{
            //    if (entInventoryReport.InventoryReportDate.Date == DateTime.Now.Date)
            //    {
            //        entInventoryReport.ProductionNumber += productionNumber;
            //        entInventoryReport.QuantityReceiving += quantityReceiving;
            //        entInventoryReport.QuantityDelivery += quantityDelivery;
            //        entInventoryReport.ReuseReceiving += reuseReceiving;
            //        entInventoryReport.ReuseDelivery += reuseDelivery;
            //        entInventoryReport.PendingReceiving += pendingReceiving;
            //        entInventoryReport.PendingDelivery += pendingDelivery;
            //        entInventoryReport.CancelReceiving += cancelReceiving;
            //        entInventoryReport.CancelDelivery += cancelDelivery;
            //        entInventoryReport.UpdatedById = userId;
            //        entInventoryReport.UpdatedDate = DateTime.Now;
            //        context.InventoryReport.Update(entInventoryReport);
            //        context.SaveChanges();
            //    }
            //    else
            //    {
            //        var entAddInventoryReport = new InventoryReport();
            //        entAddInventoryReport.InventoryReportId = Guid.NewGuid();
            //        entAddInventoryReport.WarehouseId = warehouseId;
            //        entAddInventoryReport.ProductId = entInventoryReport.ProductId;
            //        entAddInventoryReport.LotNoId = entInventoryReport.LotNoId;
            //        entAddInventoryReport.Active = true;
            //        entAddInventoryReport.InventoryReportDate = DateTime.Now;
            //        entAddInventoryReport.StartQuantity = (entInventoryReport.StartQuantity + entInventoryReport.QuantityReceiving) - entInventoryReport.QuantityDelivery;
            //        entAddInventoryReport.QuantityReceiving = quantityReceiving;
            //        entAddInventoryReport.QuantityDelivery = quantityDelivery;
            //        entAddInventoryReport.StartReuse = (entInventoryReport.StartReuse + entInventoryReport.ReuseReceiving) - entInventoryReport.ReuseDelivery;
            //        entAddInventoryReport.ReuseReceiving = reuseReceiving;
            //        entAddInventoryReport.ReuseDelivery = reuseDelivery;
            //        entAddInventoryReport.StartPending = (entInventoryReport.StartPending + entInventoryReport.PendingReceiving) - entInventoryReport.PendingDelivery;
            //        entAddInventoryReport.PendingReceiving = pendingReceiving;
            //        entAddInventoryReport.PendingDelivery = pendingDelivery;
            //        entAddInventoryReport.StartCancel = (entInventoryReport.StartCancel + entInventoryReport.CancelReceiving) - entInventoryReport.CancelDelivery;
            //        entAddInventoryReport.CancelReceiving = cancelReceiving;
            //        entAddInventoryReport.CancelDelivery = cancelDelivery;
            //        entAddInventoryReport.ProductionNumber = productionNumber;
            //        entAddInventoryReport.CreatedDate = DateTime.Now;
            //        entAddInventoryReport.CreatedById = userId;
            //        context.InventoryReport.Add(entAddInventoryReport);
            //        context.SaveChanges();
            //    }
            //}
            //else
            //{
            //    entInventoryReport = new InventoryReport();
            //    entInventoryReport.InventoryReportId = Guid.NewGuid();
            //    entInventoryReport.WarehouseId = warehouseId;
            //    entInventoryReport.ProductId = productId;
            //    entInventoryReport.LotNoId = LotNoId;
            //    entInventoryReport.Active = true;
            //    entInventoryReport.InventoryReportDate = DateTime.Now;
            //    entInventoryReport.StartQuantity = 0;
            //    entInventoryReport.QuantityReceiving = quantityReceiving;
            //    entInventoryReport.QuantityDelivery = quantityDelivery;
            //    entInventoryReport.StartReuse = 0;
            //    entInventoryReport.ReuseReceiving = reuseReceiving;
            //    entInventoryReport.ReuseDelivery = reuseDelivery;
            //    entInventoryReport.StartPending = 0;
            //    entInventoryReport.PendingReceiving = pendingReceiving;
            //    entInventoryReport.PendingDelivery = pendingDelivery;
            //    entInventoryReport.StartCancel = 0;
            //    entInventoryReport.CancelReceiving = cancelReceiving;
            //    entInventoryReport.CancelDelivery = cancelDelivery;
            //    entInventoryReport.ProductionNumber = productionNumber;
            //    entInventoryReport.CreatedDate = DateTime.Now;
            //    entInventoryReport.CreatedById = userId;
            //    context.InventoryReport.Add(entInventoryReport);
            //    context.SaveChanges();
            //}
        }

        public InventoryDeliveryVoucherFilterCustomerOrderResult InventoryDeliveryVoucherFilterCustomerOrder(InventoryDeliveryVoucherFilterCustomerOrderParameter parameter)
        {
            try
            {
                var listStatusCode = context.SystemParameter.FirstOrDefault(x => x.SystemKey == "IDO")
                    ?.SystemValueString.Split(';').ToList();
                var lstCustomerOrder = context.CustomerOrder.ToList();
                var listStatusId = context.OrderStatus
                    .Where(ct => listStatusCode.Contains(ct.OrderStatusCode) && ct.Active == true)
                    .Select(ct => ct.OrderStatusId).ToList();
                var listCustomerOrder = lstCustomerOrder
                    .Where(x => x.Active == true && listStatusId.Contains(x.StatusId.Value)).OrderBy(x => x.OrderDate)
                    .ToList();

                //check cac don hang da nhap kho het chua
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                //Lọc những đơn hàng đã nhập kho hết
                var result = new List<CustomerOrderEntityModel>();
                listCustomerOrder.ForEach(cusOrder =>
                {
                    if (!checkCustomerOrderIsEnough(cusOrder, categoryIdNHK))
                    {
                        result.Add(new CustomerOrderEntityModel(cusOrder));
                    }
                });

                return new InventoryDeliveryVoucherFilterCustomerOrderResult
                {
                    listCustomerOrder = result,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new InventoryDeliveryVoucherFilterCustomerOrderResult
                {
                    MessageCode = e.Message,
                    listCustomerOrder = new List<CustomerOrderEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public InventoryDeliveryVoucherFilterVendorOrderResult InventoryDeliveryVoucherFilterVendorOrder(InventoryDeliveryVoucherFilterVendorOrderParameter parameter)
        {
            try
            {
                var listStatusCode = new List<string>() { "RTN" };
                var listStatusId = context.OrderStatus.Where(ct => listStatusCode.Contains(ct.OrderStatusCode) && ct.Active == true).Select(ct => ct.OrderStatusId).ToList();
                var listVendorOrder = context.VendorOrder.Where(x => x.Active == true && listStatusId.Contains(x.StatusId)).OrderBy(x => x.VendorOrderDate).ToList();
                var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;
                var result = new List<VendorOrderEntityModel>();
                listVendorOrder.ForEach(venOrder =>
                {
                    if (!checkVendorOrderIsEnough(venOrder, categoryIdNHK))
                    {
                        result.Add(new VendorOrderEntityModel(venOrder));
                    }
                });

                return new InventoryDeliveryVoucherFilterVendorOrderResult
                {
                    listVendorOrder = result,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };

            }
            catch (Exception e)
            {

                return new InventoryDeliveryVoucherFilterVendorOrderResult
                {
                    MessageCode = e.Message,
                    listVendorOrder = new List<VendorOrderEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }

        }
        public DeleteInventoryReceivingVoucherResult DeleteInventoryReceivingVoucher(DeleteInventoryReceivingVoucherParameter parameter)
        {
            try
            {
                var InventoryReceivingVoucherEntity = context.InventoryReceivingVoucher.FirstOrDefault(f => f.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);
                var InventoryReceivingVoucherMappingObject = context.InventoryReceivingVoucherMapping.Where(wh => wh.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).ToList();
                var lstInventoryReceivingVoucherMappingId = InventoryReceivingVoucherMappingObject.Select(s => s.InventoryReceivingVoucherMappingId).ToList().Distinct();

                context.InventoryReceivingVoucherMapping.RemoveRange(InventoryReceivingVoucherMappingObject);
                context.InventoryReceivingVoucher.Remove(InventoryReceivingVoucherEntity);
                context.SaveChanges();
                return new DeleteInventoryReceivingVoucherResult
                {
                    MessageCode = "Đã xóa phiếu nhập kho",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new DeleteInventoryReceivingVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };

            }
            //delete item relationship

        }

        public GetTop10WarehouseFromReceivingVoucherResult GetTop10WarehouseFromReceivingVoucher(GetTop10WarehouseFromReceivingVoucherParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                var lstTop10InventoryReceivingVoucher = context.InventoryReceivingVoucher
                                                        .Where(wh => wh.StatusId == categoryIdNHK)
                                                        .OrderByDescending(or => or.InventoryReceivingVoucherDate)
                                                        .Select(s => s.InventoryReceivingVoucherId)
                                                        .Take(10).ToList();
                var listInventoryReceivingVoucherMap = context.InventoryReceivingVoucherMapping
                                                       .Where(wh => lstTop10InventoryReceivingVoucher.Contains(wh.InventoryReceivingVoucherId)).ToList();
                var listInventoryReceivingVoucherMapEntityModel = new List<InventoryReceivingVoucherMappingEntityModel>();
                listInventoryReceivingVoucherMap.ForEach(item =>
                {
                    listInventoryReceivingVoucherMapEntityModel.Add(new InventoryReceivingVoucherMappingEntityModel(item));
                });
                return new GetTop10WarehouseFromReceivingVoucherResult
                {
                    lstInventoryReceivingVoucherMapping = listInventoryReceivingVoucherMapEntityModel,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new GetTop10WarehouseFromReceivingVoucherResult
                {
                    lstInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMappingEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetSerialResult GetSerial(GetSerialParameter parameter)
        {
            try
            {
                var categoryTypeStatusSerialId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TSE" && ct.Active == true).CategoryTypeId;
                var categoryIdDXU = context.Category.FirstOrDefault(ct => ct.CategoryCode == "CXU" && ct.CategoryTypeId == categoryTypeStatusSerialId && ct.Active == true).CategoryId;

                var lstInventoryReceivingVoucherSerialMappingSerialId = context.InventoryReceivingVoucherSerialMapping.Select(s => s.SerialId).ToList();
                var lstSerialReceivingVoucher = context.Serial.Where(wh => lstInventoryReceivingVoucherSerialMappingSerialId.Contains(wh.SerialId)
                                                && wh.StatusId == categoryIdDXU).ToList();
                var lstResultSerial = lstSerialReceivingVoucher
                                      .Where(wh => (parameter.ProductId == null || wh.ProductId == parameter.ProductId)
                                            && (parameter.WarehouseId == null || wh.WarehouseId == parameter.WarehouseId))
                                      .OrderBy(or => or.SerialCode)
                                      .ToList();
                var lstResultSerialEntityModel = new List<SerialEntityModel>();
                lstResultSerial.ForEach(item =>
                {
                    lstResultSerialEntityModel.Add(new SerialEntityModel(item));
                });
                return new GetSerialResult
                {
                    lstSerial = lstResultSerialEntityModel,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new GetSerialResult
                {
                    lstSerial = new List<SerialEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }

        }

        public CreateUpdateInventoryDeliveryVoucherResult CreateUpdateInventoryDeliveryVoucher(CreateUpdateInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var inventoryDeliveryVoucher = parameter.InventoryDeliveryVoucher;
                var listInventoryDeliveryVoucherMapping = parameter.InventoryyDeliveryVoucherMapping;

                if (inventoryDeliveryVoucher.InventoryDeliveryVoucherId == Guid.Empty)
                {
                    var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                    var categoryId = context.Category.FirstOrDefault(ct => ct.CategoryCode == "TPHN" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                    var inventoryReports = context.InventoryReport.Where(w => w.Active == true).ToList();

                    var datenow = DateTime.Now;
                    var totalInvertoryCreate = context.InventoryDeliveryVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();
                    inventoryDeliveryVoucher.InventoryDeliveryVoucherId = Guid.NewGuid();
                    inventoryDeliveryVoucher.InventoryDeliveryVoucherCode = "PX-" + ConverCreateId(totalInvertoryCreate + 1);

                    inventoryDeliveryVoucher.StatusId = categoryId;
                    inventoryDeliveryVoucher.Active = true;
                    inventoryDeliveryVoucher.CreatedDate = DateTime.Now;
                    inventoryDeliveryVoucher.CreatedById = parameter.UserId;
                    inventoryDeliveryVoucher.InventoryDeliveryVoucherScreenType = parameter.ScreenType;
                    context.InventoryDeliveryVoucher.Add(inventoryDeliveryVoucher);

                    var note = new Note();
                    note.ObjectId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                    note.NoteId = Guid.NewGuid();
                    note.Active = true;
                    note.CreatedById = parameter.UserId;
                    note.CreatedDate = DateTime.Now;
                    note.ObjectType = "WH";
                    note.Description = string.IsNullOrEmpty(parameter.NoteContent) ? string.Empty : parameter.NoteContent;
                    note.NoteTitle = "đã tạo";
                    note.Type = "ADD";
                    context.Note.Add(note);

                    listInventoryDeliveryVoucherMapping.ForEach(item =>
                    {
                        if (item.ProductId != null)
                        {
                            InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                            voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                            voucherMapping.InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            voucherMapping.ProductId = (Guid)item.ProductId;
                            //voucherMapping.QuantityRequest = (decimal)item.QuantityRequire;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.QuantityDelivery = (decimal)item.QuantityDelivery;
                            voucherMapping.ProductReuse = item.ProductReuse;
                            voucherMapping.QuantityInventory = (decimal)item.QuantityInventory;
                            voucherMapping.UnitId = item.UnitId;
                            voucherMapping.WarehouseId = inventoryDeliveryVoucher.WarehouseId;
                            voucherMapping.Description = item.Note;
                            voucherMapping.Active = true;
                            voucherMapping.CreatedDate = DateTime.Now;
                            voucherMapping.CreatedById = parameter.UserId;

                            context.InventoryDeliveryVoucherMapping.Add(voucherMapping);

                        }
                    });

                    context.SaveChanges();

                    // Tạo phiếu nhập trả lại từ xuất kho sản xuất
                    //if(parameter.ScreenType == 2)
                    //{
                    //    CreatePhieuNhapKhoNVLCCDC(new CreatePhieuNhapKhoParameter
                    //    {
                    //        WarehouseType = 
                    //    });

                    //        //......
                    //}

                    return new CreateUpdateInventoryDeliveryVoucherResult
                    {
                        InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId,
                        MessageCode = "Tạo thành công",
                        StatusCode = HttpStatusCode.OK
                    };
                }
                else
                {
                    var InventoryDeliveryVoucher = context.InventoryDeliveryVoucher.FirstOrDefault(f => f.InventoryDeliveryVoucherId == inventoryDeliveryVoucher.InventoryDeliveryVoucherId);

                    InventoryDeliveryVoucher.InventoryDeliveryVoucherType = inventoryDeliveryVoucher.InventoryDeliveryVoucherType;
                    InventoryDeliveryVoucher.WarehouseId = inventoryDeliveryVoucher.WarehouseId;
                    InventoryDeliveryVoucher.WarehouseReceivingId = inventoryDeliveryVoucher.WarehouseReceivingId;
                    InventoryDeliveryVoucher.UpdatedDate = DateTime.Now;
                    InventoryDeliveryVoucher.UpdatedById = parameter.UserId;
                    InventoryDeliveryVoucher.ReceiverId = inventoryDeliveryVoucher.ReceiverId;
                    InventoryDeliveryVoucher.ObjectId = inventoryDeliveryVoucher.ObjectId;
                    InventoryDeliveryVoucher.InventoryDeliveryVoucherDate = inventoryDeliveryVoucher.InventoryDeliveryVoucherDate;
                    InventoryDeliveryVoucher.OrganizationId = inventoryDeliveryVoucher.OrganizationId;
                    context.InventoryDeliveryVoucher.Update(InventoryDeliveryVoucher);
                    context.SaveChanges();

                    var note = new Note();
                    note.ObjectId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                    note.NoteId = Guid.NewGuid();
                    note.Active = true;
                    note.CreatedById = parameter.UserId;
                    note.CreatedDate = DateTime.Now;
                    note.ObjectType = "WH";
                    note.Description = string.IsNullOrEmpty(parameter.NoteContent) ? string.Empty : parameter.NoteContent;
                    note.NoteTitle = "Đã chỉnh sửa phiếu xuất kho này";
                    note.Type = "EDT";
                    context.Note.Add(note);

                    context.SaveChanges();

                    //delete item relationship
                    var InventoryDeliveryVoucherMappingObject = context.InventoryDeliveryVoucherMapping.Where(wh => wh.InventoryDeliveryVoucherId == inventoryDeliveryVoucher.InventoryDeliveryVoucherId).ToList();
                    var lstInventoryDeliveryVoucherMappingId = InventoryDeliveryVoucherMappingObject.Select(s => s.InventoryDeliveryVoucherMappingId).ToList().Distinct();
                    var InventorDeliveryVoucherSerialMappingObject = context.InventoryDeliveryVoucherSerialMapping
                                                                    .Where(wh => lstInventoryDeliveryVoucherMappingId
                                                                    .Contains(wh.InventoryDeliveryVoucherSerialMappingId)).ToList();

                    context.InventoryDeliveryVoucherSerialMapping.RemoveRange(InventorDeliveryVoucherSerialMappingObject);
                    context.InventoryDeliveryVoucherMapping.RemoveRange(InventoryDeliveryVoucherMappingObject);
                    context.SaveChanges();

                    //tao lai tu dau
                    listInventoryDeliveryVoucherMapping.ForEach(item =>
                    {
                        if (item.ProductId != null)
                        {
                            InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                            voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                            voucherMapping.InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            voucherMapping.ProductId = (Guid)item.ProductId;
                            //voucherMapping.QuantityRequest = (decimal)item.QuantityRequire;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.QuantityDelivery = (decimal)item.QuantityDelivery;
                            voucherMapping.ProductReuse = item.ProductReuse;
                            voucherMapping.QuantityInventory = (decimal)item.QuantityInventory;
                            voucherMapping.UnitId = item.UnitId;
                            voucherMapping.WarehouseId = inventoryDeliveryVoucher.WarehouseId;
                            voucherMapping.Description = item.Note;
                            voucherMapping.Active = true;
                            voucherMapping.CreatedDate = DateTime.Now;
                            voucherMapping.CreatedById = parameter.UserId;

                            context.InventoryDeliveryVoucherMapping.Add(voucherMapping);

                        }
                    });

                    context.SaveChanges();

                    return new CreateUpdateInventoryDeliveryVoucherResult
                    {
                        MessageCode = "Cập nhật thành công",
                        StatusCode = HttpStatusCode.OK
                    };
                }
            }
            catch (Exception e)
            {

                return new CreateUpdateInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };

            }
        }
        public CreateUpdateInventoryDeliveryVoucherResult CreateUpdateInventoryDeliveryVoucherRequest(CreateUpdateInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var listOrganizationentity = context.Organization.Where(w => w.Active == true).OrderBy(w => w.OrganizationName).ToList();
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);
                var employeeId = user.EmployeeId;
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == employeeId);

                var inventoryDeliveryVoucher = parameter.InventoryDeliveryVoucher;
                var listInventoryDeliveryVoucherMapping = parameter.InventoryyDeliveryVoucherMapping;
                if (inventoryDeliveryVoucher.InventoryDeliveryVoucherId == Guid.Empty)
                {
                    var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                    var categoryId = context.Category.FirstOrDefault(ct => ct.CategoryCode == "TPHN" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                    var datenow = DateTime.Now;
                    var totalInvertoryCreate = context.InventoryDeliveryVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();
                    inventoryDeliveryVoucher.InventoryDeliveryVoucherId = Guid.NewGuid();
                    inventoryDeliveryVoucher.InventoryDeliveryVoucherCode = "DN-" + ConverCreateId(totalInvertoryCreate + 1);

                    inventoryDeliveryVoucher.StatusId = categoryId;
                    inventoryDeliveryVoucher.Active = true;
                    inventoryDeliveryVoucher.CreatedDate = DateTime.Now;
                    inventoryDeliveryVoucher.CreatedById = parameter.UserId;
                    inventoryDeliveryVoucher.InventoryDeliveryVoucherScreenType = (int)ScreenType.DNX;
                    inventoryDeliveryVoucher.OrganizationId = employee.OrganizationId;
                    context.InventoryDeliveryVoucher.Add(inventoryDeliveryVoucher);

                    var note = new Note();
                    note.ObjectId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                    note.NoteId = Guid.NewGuid();
                    note.Active = true;
                    note.CreatedById = parameter.UserId;
                    note.CreatedDate = DateTime.Now;
                    note.ObjectType = "WH";
                    note.Description = string.IsNullOrEmpty(parameter.NoteContent) ? string.Empty : parameter.NoteContent;
                    note.NoteTitle = "đã tạo";
                    note.Type = "ADD";
                    context.Note.Add(note);

                    listInventoryDeliveryVoucherMapping.ForEach(item =>
                    {
                        if (item.ProductId != null)
                        {
                            InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                            voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                            voucherMapping.InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            voucherMapping.ProductId = (Guid)item.ProductId;
                            voucherMapping.QuantityRequest = (decimal)item.QuantityRequire;
                            voucherMapping.QuantityDelivery = (decimal)item.QuantityDelivery;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.ProductReuse = item.ProductReuse;
                            voucherMapping.QuantityInventory = item.QuantityInventory ?? 0;
                            voucherMapping.UnitId = item.UnitId;
                            voucherMapping.WarehouseId = inventoryDeliveryVoucher.WarehouseId;
                            voucherMapping.Description = item.Note;
                            voucherMapping.Active = true;
                            voucherMapping.CreatedDate = DateTime.Now;
                            voucherMapping.CreatedById = parameter.UserId;

                            context.InventoryDeliveryVoucherMapping.Add(voucherMapping);

                        }
                    });

                    context.SaveChanges();
                    return new CreateUpdateInventoryDeliveryVoucherResult
                    {
                        InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId,
                        MessageCode = "Tạo thành công",
                        StatusCode = HttpStatusCode.OK
                    };
                }
                else
                {
                    var InventoryDeliveryVoucher = context.InventoryDeliveryVoucher.FirstOrDefault(f => f.InventoryDeliveryVoucherId == inventoryDeliveryVoucher.InventoryDeliveryVoucherId);

                    InventoryDeliveryVoucher.InventoryDeliveryVoucherType = inventoryDeliveryVoucher.InventoryDeliveryVoucherType;
                    InventoryDeliveryVoucher.InventoryDeliveryVoucherReason = inventoryDeliveryVoucher.InventoryDeliveryVoucherReason;
                    InventoryDeliveryVoucher.Day = inventoryDeliveryVoucher.Day;
                    InventoryDeliveryVoucher.DateFrom = inventoryDeliveryVoucher.DateFrom;
                    InventoryDeliveryVoucher.DateTo = inventoryDeliveryVoucher.DateTo;
                    InventoryDeliveryVoucher.Month = inventoryDeliveryVoucher.Month;
                    InventoryDeliveryVoucher.WarehouseId = inventoryDeliveryVoucher.WarehouseId;
                    InventoryDeliveryVoucher.WarehouseReceivingId = inventoryDeliveryVoucher.WarehouseReceivingId;
                    InventoryDeliveryVoucher.UpdatedDate = DateTime.Now;
                    InventoryDeliveryVoucher.UpdatedById = parameter.UserId;
                    InventoryDeliveryVoucher.WarehouseCategory = inventoryDeliveryVoucher.WarehouseCategory;
                    context.InventoryDeliveryVoucher.Update(InventoryDeliveryVoucher);
                    context.SaveChanges();

                    var note = new Note();
                    note.ObjectId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                    note.NoteId = Guid.NewGuid();
                    note.Active = true;
                    note.CreatedById = parameter.UserId;
                    note.CreatedDate = DateTime.Now;
                    note.ObjectType = "WH";
                    note.Description = string.IsNullOrEmpty(parameter.NoteContent) ? string.Empty : parameter.NoteContent;
                    note.NoteTitle = "Đã chỉnh sửa phiếu đề nghị xuất kho này";
                    note.Type = "EDT";
                    context.Note.Add(note);

                    context.SaveChanges();

                    //delete item relationship
                    var InventoryDeliveryVoucherMappingObject = context.InventoryDeliveryVoucherMapping.Where(wh => wh.InventoryDeliveryVoucherId == inventoryDeliveryVoucher.InventoryDeliveryVoucherId).ToList();

                    context.InventoryDeliveryVoucherMapping.RemoveRange(InventoryDeliveryVoucherMappingObject);
                    context.SaveChanges();

                    //tao lai tu dau
                    listInventoryDeliveryVoucherMapping.ForEach(item =>
                    {
                        if (item.ProductId != null)
                        {
                            InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                            voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                            voucherMapping.InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            voucherMapping.ProductId = (Guid)item.ProductId;
                            voucherMapping.QuantityRequest = (decimal)item.QuantityRequire;
                            voucherMapping.QuantityDelivery = (decimal)item.QuantityDelivery;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.ProductReuse = item.ProductReuse;
                            voucherMapping.QuantityInventory = item.QuantityInventory ?? 0;
                            voucherMapping.UnitId = item.UnitId;
                            voucherMapping.WarehouseId = inventoryDeliveryVoucher.WarehouseId;
                            voucherMapping.Description = item.Note;
                            voucherMapping.Active = true;
                            voucherMapping.CreatedDate = DateTime.Now;
                            voucherMapping.CreatedById = parameter.UserId;

                            context.InventoryDeliveryVoucherMapping.Add(voucherMapping);

                        }
                    });

                    context.SaveChanges();

                    return new CreateUpdateInventoryDeliveryVoucherResult
                    {
                        InventoryDeliveryVoucherId = inventoryDeliveryVoucher.InventoryDeliveryVoucherId,
                        MessageCode = "Cập nhật thành công",
                        StatusCode = HttpStatusCode.OK
                    };
                }
            }
            catch (Exception e)
            {

                return new CreateUpdateInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };

            }
        }

        public GetInventoryDeliveryVoucherByIdResult GetInventoryDeliveryVoucherById(GetInventoryDeliveryVoucherByIdParameter parameter)
        {
            try
            {
                Employee defaultEmpty = new Employee();

                var InventoryDeliveryVoucherEntity = context.InventoryDeliveryVoucher.Where(wh => wh.InventoryDeliveryVoucherId == parameter.Id)
                                                     .Select(s => new InventoryDeliveryVoucherEntityModel
                                                     {
                                                         InventoryDeliveryVoucherId = s.InventoryDeliveryVoucherId,
                                                         InventoryDeliveryVoucherCode = s.InventoryDeliveryVoucherCode,
                                                         StatusId = s.StatusId,
                                                         InventoryDeliveryVoucherType = s.InventoryDeliveryVoucherType,

                                                         //ObjectId = s.ObjectId,
                                                         InventoryDeliveryVoucherReason = s.InventoryDeliveryVoucherReason,
                                                         InventoryDeliveryVoucherDate = s.InventoryDeliveryVoucherDate,
                                                         InventoryDeliveryVoucherTime = s.InventoryDeliveryVoucherTime,
                                                         Active = s.Active,
                                                         CreatedDate = s.CreatedDate,
                                                         CreatedById = s.CreatedById,
                                                         UpdatedById = s.UpdatedById,
                                                         UpdatedDate = s.UpdatedDate,

                                                         Day = s.Day,
                                                         DateFrom = s.DateFrom,
                                                         DateTo = s.DateTo,
                                                         Month = s.Month,
                                                         WarehouseId = s.WarehouseId, //Kho xuất
                                                         WarehouseReceivingId = s.WarehouseReceivingId, //Kho nhận
                                                         Note = s.Note,
                                                         ReceiverId = s.ReceiverId,
                                                         OrganizationId = s.OrganizationId,
                                                         WarehouseCategory = s.WarehouseCategory,
                                                         OrderNumber = s.OrderNumber,
                                                     }).FirstOrDefault();

                var userCreate = context.User.FirstOrDefault(f => f.UserId == InventoryDeliveryVoucherEntity.CreatedById);
                var employeeDefault = (userCreate != null) ? context.Employee.Where(f => f.EmployeeId == userCreate.EmployeeId).DefaultIfEmpty(defaultEmpty).FirstOrDefault() : null;
                InventoryDeliveryVoucherEntity.NameCreate = (employeeDefault != null) ? employeeDefault.EmployeeCode + "-" + employeeDefault.EmployeeName : "";
                //nguoi xuat kho
                InventoryDeliveryVoucherEntity.NameStatus = context.Category.FirstOrDefault(f => f.CategoryId == InventoryDeliveryVoucherEntity.StatusId).CategoryName;

                switch (InventoryDeliveryVoucherEntity.NameStatus)
                {
                    case "Mới":
                        InventoryDeliveryVoucherEntity.IntStatusDnx = 0;
                        break;
                    case "Chờ xuất kho":
                        InventoryDeliveryVoucherEntity.IntStatusDnx = 1;
                        break;
                    case "Đã xuất kho":
                        InventoryDeliveryVoucherEntity.IntStatusDnx = 2;
                        break;
                    case "Đã hủy":
                        InventoryDeliveryVoucherEntity.IntStatusDnx = 3;
                        break;
                }

                #region Lấy tên kho đề nghị
                // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KHC)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KSX)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XYC)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất lại";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất khác";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XSX)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất sản xuất";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XTL)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL kho NVL, CCDC";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLNVL)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL kho CSX";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLCCDC)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherTypeText = "Xuất trả lại CCDC kho CSX";
                }
                #endregion
                #region Lấy tên loại phiếu
                // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReason == 1)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng ngày";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReason == 2)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tuần";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReason == 3)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tháng";
                }
                else if (InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReason == 4)
                {
                    InventoryDeliveryVoucherEntity.InventoryDeliveryVoucherReasonText = "Xuất văn phòng phẩm";
                }
                #endregion

                #region Lấy bộ phận
                InventoryDeliveryVoucherEntity.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == InventoryDeliveryVoucherEntity.OrganizationId)?.OrganizationName;

                #endregion
                ///
                var ListInventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(wh => wh.InventoryDeliveryVoucherId == parameter.Id).ToList();
                var categories = context.Category.Where(ct => ct.Active == true).ToList();
                var ListInventoryDeliveryVoucherMappingId = ListInventoryDeliveryVoucherMapping.Select(s => s.ProductId).Distinct().ToList();
                //var listProduct = context.Product.Where(p => p.Active == true && ListInventoryDeliveryVoucherMappingId.Contains(p.ProductId)).ToList();

                //var listproduct = context.Product.Where(p => p.Active == true).ToList();
                var listLotNo = context.LotNo.ToList();
                var listInventoryReport = context.InventoryReport.ToList();
                var listProductLotNoMapping = context.ProductLotNoMapping.ToList();
                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct = context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();

                // Trạng thái phiếu nhập kho
                var statusTypeNhapKhoId = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == "TPH").CategoryTypeId;
                var daNhapKhoStatusId = context.Category.FirstOrDefault(f => f.CategoryTypeId == statusTypeNhapKhoId && f.CategoryCode == "NHK")?.CategoryId; // Id trạng thái đã nhập kho

                var listAllInventoryReceivingVoucher = context.InventoryReceivingVoucher.ToList();
                var lstProductId = new List<Entities.Product>();
                if (parameter.WarehouseType == (int)WarehouseType.KTP)
                    lstProductId = context.Product.Where(x => (int)x.ProductType == (int)ProductType.ThanhPham && x.Active == true).ToList();
                else if (parameter.WarehouseType == (int)WarehouseType.NVL)
                    lstProductId = context.Product.Where(x => (int)x.ProductType == (int)ProductType.NVL && x.Active == true).ToList();
                else if (parameter.WarehouseType == (int)WarehouseType.CCDC)
                    lstProductId = context.Product.Where(x => (int)x.ProductType == (int)ProductType.CCDC && x.Active == true).ToList();
                else
                    lstProductId = context.Product.ToList();

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var typekhoId = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;
                var listWareHouseId = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == typekhoId).Select(x => x.WarehouseId).ToList();

                var listPhieuNhapKhoId = listAllInventoryReceivingVoucher.Where(c => listWareHouseId.Contains(c.WarehouseId) && c.StatusId == daNhapKhoStatusId)
               .Select(m => m.InventoryReceivingVoucherId).ToList();
                var listAllInventoryReceivingVoucherMappingId = context.InventoryReceivingVoucherMapping.Where(x => listPhieuNhapKhoId.Contains(x.InventoryReceivingVoucherId)).Select(x => x.ProductId).Distinct().ToList();

                //Lay danh sach san pham trong phieu da nhap
                var listProducts = lstProductId.Where(c => listAllInventoryReceivingVoucherMappingId.Contains(c.ProductId)).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId
                }).ToList();

                //var listProducts = lstProductId.Where(c => ListInventoryDeliveryVoucherMappingId.Contains(c.ProductId)).Select(y => new ProductEntityModel
                //{
                //    ProductId = y.ProductId,
                //    ProductName = y.ProductName,
                //    ProductCode = y.ProductCode,
                //    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                //    ProductUnitId = y.ProductUnitId,
                //}).ToList();
                //var listItemDetail = new List<InventoryDeliveryVoucherMappingEntityModel>();

                //listItemDetail.ForEach(detail =>
                //{
                //    InventoryDeliveryVoucherMappingEntityModel obj = new InventoryDeliveryVoucherMappingEntityModel();

                //    obj.InventoryDeliveryVoucherMappingId = detail.InventoryDeliveryVoucherMappingId;
                //    obj.ProductId = detail.ProductId;
                //    obj.ProductName = detail.ProductId == null ? "" : listProduct.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductName;
                //    obj.ProductCode = detail.ProductId == null ? "" : listProduct.FirstOrDefault(p => p.ProductId == detail.ProductId).ProductCode;
                //    obj.LotNoId = detail.LotNoId;
                //    obj.UnitId = detail.UnitId;
                //    obj.UnitName = detail.UnitId == null ? "" : categories.FirstOrDefault(c => c.CategoryId == detail.UnitId).CategoryName;
                //    obj.QuantityRequire = detail.QuantityRequest;
                //    obj.QuantityDelivery = detail.QuantityDelivery == 0 ? detail.QuantityRequest : detail.QuantityDelivery;
                //    obj.Note = detail.Description;
                //    //obj.ListSerial = new List<Serial>();
                //    obj.WarehouseId = detail.WarehouseId;
                //    obj.WareHouseName = (detail.WarehouseId != Guid.Empty) ? context.Warehouse.FirstOrDefault(f => f.WarehouseId == detail.WarehouseId).WarehouseName : "";

                //    //Lay so luong ton san pham trong tat ca cac kho cung loai
                //    //decimal soluongton = 0;
                //    //listWareHouseId.ForEach(khoid =>
                //    //{

                //    //    var product = listInventoryReport.Where(x => x.ProductId == detail.ProductId && x.WarehouseId == khoid).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                //    //    if (product != null)
                //    //    {
                //    //        soluongton += product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
                //    //    }
                //    //});
                //    //obj.QuantityInventory = soluongton;

                //    //listItemDetail.Add(obj);
                //});

                var listItemDetail = new List<InventoryDeliveryVoucherMappingEntityModel>();
                ListInventoryDeliveryVoucherMapping.ForEach(detail =>
                {
                    var pro = listProducts.FirstOrDefault(x => x.ProductId == detail.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == pro?.ProductUnitId);

                    InventoryDeliveryVoucherMappingEntityModel obj = new InventoryDeliveryVoucherMappingEntityModel();

                    obj.InventoryDeliveryVoucherMappingId = detail.InventoryDeliveryVoucherMappingId;
                    obj.ProductId = detail.ProductId;
                    obj.ProductName = detail.ProductId == null ? "" : listProducts.FirstOrDefault(p => p.ProductId == detail.ProductId)?.ProductName;
                    obj.ProductCode = detail.ProductId == null ? "" : listProducts.FirstOrDefault(p => p.ProductId == detail.ProductId)?.ProductCode;
                    obj.LotNoId = detail.LotNoId;
                    obj.LotNoName = listLotNo.FirstOrDefault(lo => lo.LotNoId == detail.LotNoId).LotNoName;
                    obj.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                    obj.QuantityRequire = detail.QuantityRequest;
                    obj.QuantityDelivery = detail.QuantityDelivery == 0 ? detail.QuantityRequest : detail.QuantityDelivery;
                    obj.Note = detail.Description;
                    obj.WarehouseId = detail.WarehouseId;
                    obj.WareHouseName = (detail.WarehouseId != Guid.Empty) ? context.Warehouse.FirstOrDefault(f => f.WarehouseId == detail.WarehouseId).WarehouseName : "";

                    //Lay so luong ton san pham trong tat ca cac kho cung loai
                    decimal soluongton_lotlo = 0;
                    listWareHouseId.ForEach(khoid =>
                    {
                        var product = listInventoryReport.Where(x => x.ProductId == detail.ProductId && x.LotNoId == detail.LotNoId && x.WarehouseId == khoid).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        if (product != null)
                        {
                            soluongton_lotlo += product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
                        }
                    });
                    obj.QuantityInventory = soluongton_lotlo;

                    listItemDetail.Add(obj);
                });

                var listItemGroup = listItemDetail.GroupBy(w => w.ProductId)
                                                                           .Select(s =>
                                                                            new InventoryDeliveryVoucherMappingEntityModel
                                                                            {
                                                                                ProductId = s.Key,
                                                                                QuantityRequire = s.Sum(sum => sum.QuantityRequire),
                                                                                QuantityDelivery = s.Sum(sum => sum.QuantityDelivery)
                                                                            }).ToList();

                listItemGroup.ForEach(item =>
                {
                    var product = listProducts.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);

                    if (product != null)
                    {
                        item.ProductCode = product.ProductCode.Trim();
                        item.ProductName = product.ProductName.Trim();
                        item.UnitName = unit != null ? unit.CategoryName.Trim() : "";

                        //Lay so luong ton san pham trong tat ca cac kho cung loai
                        decimal soluongton = 0;
                        listWareHouseId.ForEach(khoid =>
                        {
                            var reportProducts = listInventoryReport.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid).ToList();
                            reportProducts.ForEach(p =>
                            {
                                soluongton += p.StartQuantity + p.QuantityReceiving - p.QuantityDelivery;
                            });
                        });

                        item.QuantityInventory = soluongton;
                    }
                });

                listProducts.ForEach(item =>
                {
                    //Lay so luong ton san pham trong tat ca cac kho cung loai
                    //decimal soluongton = 0;
                    //listWareHouseId.ForEach(khoid =>
                    //{
                    //    var product = listInventoryReport.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                    //    if (product != null)
                    //    {
                    //        soluongton += product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
                    //    }
                    //});

                    item.ProductUnitName = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId).CategoryName;

                    var listProductLotNoMappingEntityModel = new List<ProductLotNoMappingEntityModel>();
                    listProductLotNoMapping.Where(x => x.ProductId == item.ProductId).ToList().ForEach(lo =>
                    {
                        var plot = new ProductLotNoMappingEntityModel();
                        plot.ProductId = item.ProductId;
                        plot.LotNoId = lo.LotNoId;
                        plot.LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lo.LotNoId)?.LotNoName;

                        //Lay so luong ton san pham trong tat ca cac kho cung loai
                        decimal soluongton_lotlo = 0;
                        listWareHouseId.ForEach(khoid =>
                        {
                            var product = listInventoryReport.Where(x => x.ProductId == item.ProductId && x.LotNoId == lo.LotNoId && x.WarehouseId == khoid).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                            if (product != null)
                            {
                                soluongton_lotlo += product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
                            }
                        });
                        plot.QuantityInventory = soluongton_lotlo;

                        item.QuantityInventory += soluongton_lotlo; // So luong ton hang hoa, vat tu
                        listProductLotNoMappingEntityModel.Add(plot);
                    });

                    item.ListProductLotNoMapping = listProductLotNoMappingEntityModel;
                });

                #region get Tháng kiểm kê
                var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
                var listAllWarehouse = context.Warehouse.ToList();
                var listAllChiTietDotKiemKe = context.DotKiemKeChiTiet.ToList();
                var listDotKiemKe = context.DotKiemKe.Where(x => x.TrangThaiId == 2).OrderByDescending(x => x.ThangKiemKe)
                    .Select(x => new DotKiemKeEntityModel
                    {
                        DotKiemKeId = x.DotKiemKeId,
                        WarehouseId = x.WarehouseId,
                        WarehouseName = listAllWarehouse.FirstOrDefault(y => y.WarehouseId == x.WarehouseId).WarehouseName,
                        TenDotKiemKe = "Tháng " + x.ThangKiemKe.Value.Month + "/" + x.ThangKiemKe.Value.Year,
                        TenTrangThai = listTrangThaiKiemKe.FirstOrDefault(y => y.Value == x.TrangThaiId).Name,
                        ThangKiemKe = x.ThangKiemKe.Value,
                    }).ToList();
                #endregion

                // Get công đoạn theo mã phiếu
                var stateByInvertory = context.ProductionProcessStageImportExport.FirstOrDefault(w => w.InventoryVoucherId == parameter.Id);
                if (stateByInvertory != null)
                {
                    InventoryDeliveryVoucherEntity.StateId = stateByInvertory.StageNameId;
                    var stateItem = categories.FirstOrDefault(c => c.CategoryId == stateByInvertory.StageNameId);
                    if (stateItem != null)
                    {
                        InventoryDeliveryVoucherEntity.StateCode = stateItem.CategoryCode;
                        InventoryDeliveryVoucherEntity.StateName = stateItem.CategoryName;
                    }

                    var productionProcessItem = context.ProductionProcessDetail.FirstOrDefault(w => w.Id == stateByInvertory.ProductionProcessDetailId);
                    if (productionProcessItem != null)
                    {
                        InventoryDeliveryVoucherEntity.ProductId = productionProcessItem.ProductId;
                        var productItem = context.Product.FirstOrDefault(x => x.ProductId == productionProcessItem.ProductId);
                        if (productItem != null)
                        {
                            InventoryDeliveryVoucherEntity.ProductCode = productItem.ProductCode;
                            InventoryDeliveryVoucherEntity.ProductName = productItem.ProductName;
                        }

                        InventoryDeliveryVoucherEntity.LotNoId = productionProcessItem.LotNoId;
                        var lotNoItem = context.LotNo.FirstOrDefault(c => c.LotNoId == productionProcessItem.LotNoId);
                        if (lotNoItem != null)
                        {
                            InventoryDeliveryVoucherEntity.LotNoName = lotNoItem.LotNoName;
                        }
                    }
                }
                if (InventoryDeliveryVoucherEntity.WarehouseReceivingId != null && InventoryDeliveryVoucherEntity.WarehouseReceivingId != Guid.Empty)
                {
                    InventoryDeliveryVoucherEntity.WarehouseReceivingText = context.Warehouse.FirstOrDefault(c => c.WarehouseId == InventoryDeliveryVoucherEntity.WarehouseReceivingId)?.WarehouseName;
                }
                if (InventoryDeliveryVoucherEntity.WarehouseId != null && InventoryDeliveryVoucherEntity.WarehouseId != Guid.Empty)
                {
                    InventoryDeliveryVoucherEntity.WarehouseName = context.Warehouse.FirstOrDefault(c => c.WarehouseId == InventoryDeliveryVoucherEntity.WarehouseId)?.WarehouseName;
                }


                return new GetInventoryDeliveryVoucherByIdResult
                {
                    inventoryDeliveryVoucher = InventoryDeliveryVoucherEntity,
                    inventoryDeliveryVoucherMappingModel = listItemDetail,
                    ListProduct = listProducts,
                    ListItemGroup = listItemGroup,
                    ListDotKiemKe = listDotKiemKe,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new GetInventoryDeliveryVoucherByIdResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public DeleteInventoryDeliveryVoucherResult DeleteInventoryDeliveryVoucher(DeleteInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var InventoryDeliveryVoucherEntity = context.InventoryDeliveryVoucher.FirstOrDefault(f => f.InventoryDeliveryVoucherId == parameter.InventoryDeliveryVoucherId);
                var InventoryDeliveryVoucherMappingObject = context.InventoryDeliveryVoucherMapping.Where(wh => wh.InventoryDeliveryVoucherId == parameter.InventoryDeliveryVoucherId).ToList();

                var lstInventoryDeliveryVoucherMappingId = InventoryDeliveryVoucherMappingObject.Select(s => s.InventoryDeliveryVoucherMappingId).ToList().Distinct();

                context.InventoryDeliveryVoucherMapping.RemoveRange(InventoryDeliveryVoucherMappingObject);
                context.InventoryDeliveryVoucher.Remove(InventoryDeliveryVoucherEntity);
                context.SaveChanges();
                return new DeleteInventoryDeliveryVoucherResult
                {
                    MessageCode = "Đã xóa phiếu xuất kho",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new DeleteInventoryDeliveryVoucherResult
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };

            }
        }

        public ChangeStatusInventoryDeliveryVoucherResult ChangeStatusInventoryDeliveryVoucher(ChangeStatusInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "NHK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                var InventoryDeliveryVoucher = context.InventoryDeliveryVoucher.FirstOrDefault(f =>
                    f.InventoryDeliveryVoucherId == parameter.InventoryDeliveryVoucherId);
                if (InventoryDeliveryVoucher == null)
                {
                    return new ChangeStatusInventoryDeliveryVoucherResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu xuất kho không tồn tại trong hệ thống"
                    };
                }

                InventoryDeliveryVoucher.StatusId = categoryIdNHK; // đã xuat
                InventoryDeliveryVoucher.UpdatedById = parameter.UserId;
                InventoryDeliveryVoucher.UpdatedDate = DateTime.Now;
                context.InventoryDeliveryVoucher.Update(InventoryDeliveryVoucher);
                context.SaveChanges();

                var inventoryDeliveryMappingVoucherEntity = context.InventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == InventoryDeliveryVoucher.InventoryDeliveryVoucherId).ToList();

                var datenow = DateTime.Now;
                var totalInvertoryCreate = context.InventoryDeliveryVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();
                #region Tạo phiếu xuất kho nguyên vật liệu và đặt status là đã xuất cho phiếu đề nghị
                if (InventoryDeliveryVoucher.InventoryDeliveryVoucherScreenType == (int)ScreenType.DNX)
                {
                    var newInventoryDeliveryVoucher = new InventoryDeliveryVoucher();
                    newInventoryDeliveryVoucher.InventoryDeliveryVoucherId = Guid.NewGuid();
                    newInventoryDeliveryVoucher.InventoryDeliveryVoucherCode = "PX-" + ConverCreateId(totalInvertoryCreate + 1);
                    newInventoryDeliveryVoucher.InventoryDeliveryVoucherType = InventoryDeliveryVoucher.InventoryDeliveryVoucherType;
                    newInventoryDeliveryVoucher.InventoryDeliveryVoucherScreenType = (int)ScreenType.NVL;
                    newInventoryDeliveryVoucher.InventoryDeliveryVoucherDate = InventoryDeliveryVoucher.InventoryDeliveryVoucherDate;
                    newInventoryDeliveryVoucher.WarehouseId = InventoryDeliveryVoucher.WarehouseId;
                    newInventoryDeliveryVoucher.WarehouseReceivingId = InventoryDeliveryVoucher.WarehouseReceivingId;
                    newInventoryDeliveryVoucher.OrganizationId = context.Warehouse.FirstOrDefault(x => x.WarehouseId == InventoryDeliveryVoucher.WarehouseReceivingId).Department; //bo phan cua kho nhan
                    newInventoryDeliveryVoucher.CreatedDate = DateTime.Now;
                    newInventoryDeliveryVoucher.CreatedById = parameter.UserId;
                    newInventoryDeliveryVoucher.StatusId = categoryIdNHK; // đã xuat
                    newInventoryDeliveryVoucher.InventoryDeliveryVoucherReason = InventoryDeliveryVoucher.InventoryDeliveryVoucherReason;
                    newInventoryDeliveryVoucher.Day = InventoryDeliveryVoucher.Day;
                    newInventoryDeliveryVoucher.DateFrom = InventoryDeliveryVoucher.DateFrom;
                    newInventoryDeliveryVoucher.DateTo = InventoryDeliveryVoucher.DateTo;
                    newInventoryDeliveryVoucher.Month = InventoryDeliveryVoucher.Month;
                    newInventoryDeliveryVoucher.WarehouseCategory = InventoryDeliveryVoucher.WarehouseCategory;

                    context.InventoryDeliveryVoucher.Add(newInventoryDeliveryVoucher);
                    context.SaveChanges();

                    inventoryDeliveryMappingVoucherEntity.ForEach(item =>
                    {
                        if (item.ProductId != null)
                        {
                            InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                            voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                            voucherMapping.InventoryDeliveryVoucherId = newInventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            voucherMapping.ProductId = (Guid)item.ProductId;
                            voucherMapping.QuantityRequest = (decimal)item.QuantityRequest;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.QuantityDelivery = (decimal)item.QuantityDelivery;
                            voucherMapping.ProductReuse = item.ProductReuse;
                            voucherMapping.QuantityInventory = (decimal)item.QuantityInventory;
                            voucherMapping.UnitId = item.UnitId;
                            voucherMapping.WarehouseId = newInventoryDeliveryVoucher.WarehouseId;
                            voucherMapping.Description = item.Description;
                            voucherMapping.Active = true;
                            voucherMapping.CreatedDate = DateTime.Now;
                            voucherMapping.CreatedById = parameter.UserId;
                            context.InventoryDeliveryVoucherMapping.Add(voucherMapping);
                        }
                    });
                    context.SaveChanges();

                    var note = new Note();
                    note.ObjectId = newInventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                    note.NoteId = Guid.NewGuid();
                    note.Active = true;
                    note.CreatedById = parameter.UserId;
                    note.CreatedDate = DateTime.Now;
                    note.ObjectType = "WH";
                    note.Description = "";
                    note.NoteTitle = "đã tạo phiếu xuất kho";
                    note.Type = "ADD";
                    context.Note.Add(note);

                    inventoryDeliveryMappingVoucherEntity = context.InventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == newInventoryDeliveryVoucher.InventoryDeliveryVoucherId).ToList();
                }

                //update lai ton kho
                inventoryDeliveryMappingVoucherEntity.ForEach(voucherMapping =>
                {
                    UpdateInventoryReport(voucherMapping.ProductId, voucherMapping.LotNoId.Value, voucherMapping.WarehouseId, parameter.UserId, InventoryDeliveryVoucher.InventoryDeliveryVoucherDate.Value.Date, 0, voucherMapping.QuantityDelivery, 0, 0, 0, 0, 0, 0, 0);
                    //var inventoryReportByProduct = context.InventoryReport.FirstOrDefault(wh =>
                    //    wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId && wh.InventoryReportDate.Date == DateTime.Now.Date);
                    //if (inventoryReportByProduct == null)
                    //{
                    //    InventoryReport inventoryReport = new InventoryReport();
                    //    inventoryReport.InventoryReportId = Guid.NewGuid();
                    //    inventoryReport.WarehouseId = InventoryDeliveryVoucher.WarehouseId;
                    //    inventoryReport.ProductId = voucherMapping.ProductId;
                    //    inventoryReport.LotNoId = voucherMapping.LotNoId;
                    //    inventoryReport.QuantityMinimum = 0;
                    //    inventoryReport.Active = true;
                    //    inventoryReport.CreatedDate = DateTime.Now;
                    //    inventoryReport.InventoryReportDate = DateTime.Now;
                    //    inventoryReport.QuantityDelivery = voucherMapping.QuantityDelivery;

                    //    var report = context.InventoryReport.Where(wh =>
                    //    wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                    //    if (report != null)
                    //        inventoryReport.StartQuantity = report.StartQuantity + report.QuantityReceiving - report.QuantityDelivery;

                    //    context.InventoryReport.Add(inventoryReport);
                    //}
                    //else
                    //{
                    //    inventoryReportByProduct.QuantityDelivery += voucherMapping.QuantityDelivery;
                    //    context.InventoryReport.Update(inventoryReportByProduct);
                    //}
                });
                context.SaveChanges();

                #endregion
                #region Tạo phiếu nhập kho chờ sản suất nếu có chọn kho nhận trong phiếu xuất nguyên vật liệu
                if (InventoryDeliveryVoucher.WarehouseReceivingId != null)
                {
                    var categoryTypeId_KSX = context.CategoryType
                        .FirstOrDefault(ct => ct.CategoryTypeCode == "TPH" && ct.Active == true).CategoryTypeId;
                    var categoryIdKSX = context.Category.FirstOrDefault(ct =>
                        ct.CategoryCode == "CHO" && ct.CategoryTypeId == categoryTypeId_KSX && ct.Active == true).CategoryId; // cho nhap kho

                    var pnk_sanxuat = new InventoryReceivingVoucher();
                    pnk_sanxuat.InventoryReceivingVoucherId = Guid.NewGuid();
                    pnk_sanxuat.InventoryReceivingVoucherCode = "PN-" + ConverCreateId(totalInvertoryCreate + 1);
                    pnk_sanxuat.ObjectId = InventoryDeliveryVoucher.InventoryDeliveryVoucherId; //Id phieu xuat
                    pnk_sanxuat.InventoryReceivingVoucherType = (int) InventoryReceivingVoucherType.PNL; 
                    pnk_sanxuat.StatusId = categoryIdKSX; //trạng thái chờ xác nhận
                    pnk_sanxuat.InventoryReceivingVoucherDate = DateTime.Now;
                    pnk_sanxuat.CreatedById = parameter.UserId;
                    pnk_sanxuat.CreatedDate = DateTime.Now;
                    pnk_sanxuat.WarehouseId = InventoryDeliveryVoucher.WarehouseReceivingId.Value;
                    context.InventoryReceivingVoucher.Add(pnk_sanxuat);
                    context.SaveChanges();

                    var listInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
                    inventoryDeliveryMappingVoucherEntity.ForEach(item =>
                    {
                        var inventoryReceivingVoucherMapping = new InventoryReceivingVoucherMapping();
                        inventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                        inventoryReceivingVoucherMapping.InventoryReceivingVoucherId = pnk_sanxuat.InventoryReceivingVoucherId;
                        inventoryReceivingVoucherMapping.ProductId = item.ProductId;
                        inventoryReceivingVoucherMapping.LotNoId = item.LotNoId;
                        inventoryReceivingVoucherMapping.QuantityActual = (decimal)item.QuantityDelivery; //so luong nhap
                        inventoryReceivingVoucherMapping.WarehouseId = pnk_sanxuat.WarehouseId;
                        inventoryReceivingVoucherMapping.Active = true;
                        inventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                        inventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                        listInventoryReceivingVoucherMapping.Add(inventoryReceivingVoucherMapping);

                        //update lai ton kho sản xuất
                        UpdateInventoryReport(item.ProductId, item.LotNoId.Value, pnk_sanxuat.WarehouseId, parameter.UserId, DateTime.Now,
                            (InventoryDeliveryVoucher.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLCCDC || InventoryDeliveryVoucher.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLNVL) ? inventoryReceivingVoucherMapping.QuantityActual : 0, 0,
                            (InventoryDeliveryVoucher.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLTSD || InventoryDeliveryVoucher.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH) ? inventoryReceivingVoucherMapping.QuantityActual : 0, 0, 
                            0, 0, 0, 0, 0);
                    });

                    context.InventoryReceivingVoucherMapping.AddRange(listInventoryReceivingVoucherMapping);
                    context.SaveChanges();

                    


                    //var inventoryReceivingMappingVoucherEntity = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == pnk_sanxuat.InventoryReceivingVoucherId).ToList();
                    //inventoryReceivingMappingVoucherEntity.ForEach(voucherMapping =>
                    //{
                    //    var inventoryReportByProduct = context.InventoryReport.FirstOrDefault(wh =>
                    //        wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId && wh.InventoryReportDate.Date == DateTime.Now.Date);
                    //    if (inventoryReportByProduct == null)
                    //    {
                    //        InventoryReport inventoryReport = new InventoryReport();
                    //        inventoryReport.InventoryReportId = Guid.NewGuid();
                    //        inventoryReport.WarehouseId = pnk_sanxuat.WarehouseId;
                    //        inventoryReport.ProductId = voucherMapping.ProductId;
                    //        inventoryReport.LotNoId = voucherMapping.LotNoId;
                    //        inventoryReport.QuantityMinimum = 0;
                    //        inventoryReport.Active = true;
                    //        inventoryReport.CreatedDate = DateTime.Now;
                    //        inventoryReport.InventoryReportDate = DateTime.Now;
                    //        inventoryReport.QuantityReceiving = voucherMapping.QuantityActual;

                    //        var report = context.InventoryReport.Where(wh =>
                    //        wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                    //        if (report != null)
                    //            inventoryReport.StartQuantity = report.QuantityReceiving + report.StartQuantity - report.QuantityDelivery;


                    //        context.InventoryReport.Add(inventoryReport);
                    //    }
                    //    else
                    //    {
                    //        inventoryReportByProduct.QuantityReceiving += voucherMapping.QuantityActual;
                    //        context.InventoryReport.Update(inventoryReportByProduct);
                    //    }
                    //});
                    //context.SaveChanges();
                }

                #endregion

                return new ChangeStatusInventoryDeliveryVoucherResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Đã xuất kho thành công"
                };
            }
            catch (Exception e)
            {
                return new ChangeStatusInventoryDeliveryVoucherResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
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

        public decimal getQuantityInventoryByProductLotNo(Guid productId, long lotNoId)
        {
            var product = context.InventoryReport.Where(x => x.ProductId == productId && x.LotNoId == lotNoId).OrderByDescending(x => x.InventoryReportDate)?.FirstOrDefault();
            if (product != null)
            {
                return product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
            }

            return 0;
        }

        public ChangeStatusInventoryDeliveryVoucherResult ChangeStatusCancelInventoryDeliveryVoucherRequest(ChangeStatusInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "HUY" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId; // Sửa trạng thái thành da huy
                var InventoryDeliveryVoucher = context.InventoryDeliveryVoucher.FirstOrDefault(f =>
                    f.InventoryDeliveryVoucherId == parameter.InventoryDeliveryVoucherId);
                if (InventoryDeliveryVoucher == null)
                {
                    return new ChangeStatusInventoryDeliveryVoucherResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu đề nghị xuất kho không tồn tại trong hệ thống"
                    };
                }
                InventoryDeliveryVoucher.StatusId = categoryIdNHK;
                InventoryDeliveryVoucher.UpdatedById = parameter.UserId;
                InventoryDeliveryVoucher.UpdatedDate = DateTime.Now;
                InventoryDeliveryVoucher.ObjectId = null;
                context.InventoryDeliveryVoucher.Update(InventoryDeliveryVoucher);
                context.SaveChanges();

                return new ChangeStatusInventoryDeliveryVoucherResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Đã hủy phiếu phê duyệt"
                };
            }
            catch (Exception e)
            {
                return new ChangeStatusInventoryDeliveryVoucherResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        public ChangeStatusInventoryDeliveryVoucherResult ChangeStatusInventoryDeliveryVoucherRequest(ChangeStatusInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category.FirstOrDefault(ct =>
                    ct.CategoryCode == "CXK" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId; // Sửa trạng thái thành chờ phê duyệt phiếu đề nghị
                //var listInventoryDeliveryVoucherMapping = JsonConvert.DeserializeObject<List<InventoryDeliveryVoucherMappingEntityModel>>(parameter.inventoryyDeliveryVoucherMapping);

                var InventoryDeliveryVoucher = context.InventoryDeliveryVoucher.FirstOrDefault(f =>
                    f.InventoryDeliveryVoucherId == parameter.InventoryDeliveryVoucherId);
                if (InventoryDeliveryVoucher == null)
                {
                    return new ChangeStatusInventoryDeliveryVoucherResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu đề nghị xuất kho không tồn tại trong hệ thống"
                    };
                }
                InventoryDeliveryVoucher.StatusId = categoryIdNHK;
                InventoryDeliveryVoucher.UpdatedById = parameter.UserId;
                InventoryDeliveryVoucher.UpdatedDate = DateTime.Now;
                InventoryDeliveryVoucher.ObjectId = null;
                context.InventoryDeliveryVoucher.Update(InventoryDeliveryVoucher);
                context.SaveChanges();

                //delete item relationship
                //var InventoryDeliveryVoucherMappingObject = context.InventoryDeliveryVoucherMapping.Where(wh => wh.InventoryDeliveryVoucherId == InventoryDeliveryVoucher.InventoryDeliveryVoucherId).ToList();

                ////context.InventoryDeliveryVoucherSerialMapping.RemoveRange(InventorDeliveryVoucherSerialMappingObject);
                //context.InventoryDeliveryVoucherMapping.RemoveRange(InventoryDeliveryVoucherMappingObject);
                ////tao lai tu dau
                //listInventoryDeliveryVoucherMapping.ForEach(item =>
                //{
                //    if (item.ProductId != null)
                //    {
                //        InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                //        voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                //        voucherMapping.InventoryDeliveryVoucherId = InventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                //        voucherMapping.ProductId = (Guid)item.ProductId;
                //        voucherMapping.QuantityRequest = (decimal)item.QuantityRequire;
                //        voucherMapping.LotNoId = item.LotNoId;
                //        voucherMapping.ProductReuse = item.ProductReuse;
                //        voucherMapping.QuantityDelivery = item.QuantityDelivery;
                //        if (item.QuantityInventory != null)
                //        {
                //            voucherMapping.QuantityInventory = (decimal)item.QuantityInventory;
                //        }
                //        voucherMapping.UnitId = item.UnitId;
                //        voucherMapping.WarehouseId = item.WarehouseId;
                //        voucherMapping.Description = item.Note;
                //        voucherMapping.Active = true;
                //        voucherMapping.CreatedDate = DateTime.Now;
                //        voucherMapping.CreatedById = parameter.UserId;

                //        context.InventoryDeliveryVoucherMapping.Add(voucherMapping);

                //    }
                //});

                //context.SaveChanges();



                return new ChangeStatusInventoryDeliveryVoucherResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Đã thay đổi trạng thái chờ phê duyệt"
                };
            }
            catch (Exception e)
            {
                return new ChangeStatusInventoryDeliveryVoucherResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        public FilterCustomerInInventoryDeliveryVoucherResult FilterCustomerInInventoryDeliveryVoucher(FilterCustomerInInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var listObjectId = context.InventoryDeliveryVoucher.Where(wh => wh.InventoryDeliveryVoucherType == 1).Select(s => s.ObjectId).Distinct().ToList();
                var ListCustomerId = context.CustomerOrder.Where(wh => listObjectId.Contains(wh.OrderId)).Select(s => s.CustomerId).Distinct().ToList();
                var listCustomer = context.Customer.Where(wh => ListCustomerId.Contains(wh.CustomerId))
                                                      .Select(c => new CustomerEntityModel
                                                      {
                                                          CustomerId = c.CustomerId,
                                                          CustomerCode = c.CustomerCode,
                                                          CustomerName = c.CustomerName,
                                                      }).OrderByDescending(date => date.CreatedDate).ToList();
                return new FilterCustomerInInventoryDeliveryVoucherResult
                {
                    LstCustomer = listCustomer,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new FilterCustomerInInventoryDeliveryVoucherResult
                {
                    LstCustomer = new List<CustomerEntityModel>(),
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        public SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucher(SearchInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var listAllUser = context.User.ToList();
                var listAllEmployee = context.Employee.ToList();
                var listAllContact = context.Contact.ToList();

                var listPhieuXuatKho = new List<InventoryDeliveryVoucherEntityModel>();

                listPhieuXuatKho = context.InventoryDeliveryVoucher.Where(x => x.InventoryDeliveryVoucherScreenType == (int)ScreenType.NVL) // lấy danh sách cho màn hình xuất kho NVL, CCDC
                 .Select(y => new InventoryDeliveryVoucherEntityModel
                 {
                     InventoryDeliveryVoucherId = y.InventoryDeliveryVoucherId,
                     InventoryDeliveryVoucherCode = y.InventoryDeliveryVoucherCode,
                     StatusId = y.StatusId,
                     InventoryDeliveryVoucherType = y.InventoryDeliveryVoucherType,
                     WarehouseId = y.WarehouseId,
                     InventoryDeliveryVoucherReason = y.InventoryDeliveryVoucherReason,
                     InventoryDeliveryVoucherDate = y.InventoryDeliveryVoucherDate,
                     CreatedById = y.CreatedById,
                     CreatedDate = y.CreatedDate,
                     ReceiverId = y.ReceiverId,
                     WarehouseCategory = y.WarehouseCategory // NVL or CCDC
                 }).ToList();

                if (listPhieuXuatKho.Count > 0)
                {
                    listPhieuXuatKho.ForEach(item =>
                    {
                        #region Lấy bộ phận người nhận
                        item.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == item.ReceiverId).OrganizationName;
                        #endregion

                        #region Lấy tên loại phiếu
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherReason == 1)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng ngày";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 2)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tuần";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 3)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tháng";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 4)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất văn phòng phẩm";
                        }

                        #endregion
                        #region Lấy tên kho đề nghị
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KHC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho hành chính";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XYC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất hủy";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XTL)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL";
                        }
                        #endregion

                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.NameStatus = status?.CategoryName;
                        switch (item.NameStatus)
                        {
                            case "Mới":
                                item.IntStatusDnx = 0;
                                break;
                            case "Chờ xuất kho":
                                item.IntStatusDnx = 1;
                                break;
                            case "Đã xuất kho":
                                item.IntStatusDnx = 2;
                                break;
                            case "Đã hủy":
                                item.IntStatusDnx = 3;
                                break;
                        }
                        #endregion
                    });
                }

                listPhieuXuatKho = listPhieuXuatKho.OrderByDescending(z => z.CreatedDate).ToList();

                return new SearchInventoryDeliveryVoucherResult
                {
                    lstResult = listPhieuXuatKho,
                    MessageCode = "Đã lọc xong danh sách phiếu xuất",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public FilterProductResult FilterProduct(FilterProductParameter parameter)
        {
            try
            {
                var commonProductCategory = context.ProductCategory.ToList();
                var commonProduct = context.Product.ToList();
                var commonProductVendorMapping = context.ProductVendorMapping.ToList();

                var vendorOrderDetails = context.VendorOrderDetail.ToList();
                //var vendorOrderProductDetailProductAttributeValues = context.VendorOrderProductDetailProductAttributeValue.ToList();
                var customerOrderDetails = context.CustomerOrderDetail.ToList();
                //var orderProductDetailProductAttributeValues = context.OrderProductDetailProductAttributeValue.ToList();
                var quoteDetails = context.QuoteDetail.ToList();
                //var quoteProductDetailProductAttributeValues = context.QuoteProductDetailProductAttributeValue.ToList();
                var procurementRequestItems = context.ProcurementRequestItem.ToList();
                //var productAttributes = context.ProductAttribute.ToList();
                var productVendorMappings = context.ProductVendorMapping.ToList();


                if (parameter.ListProductCategory.Count > 0)
                {
                    List<Guid> listGuidTemp = parameter.ListProductCategory;
                    for (int i = 0; i < listGuidTemp.Count; ++i)
                    {
                        ListChildProductCategory(listGuidTemp[i], parameter.ListProductCategory, commonProductCategory);
                    }
                }
                var productList = (from itemproduct in commonProduct
                                   join itemProductCategory in commonProductCategory on itemproduct.ProductCategoryId equals itemProductCategory.ProductCategoryId
                                   join itemproductvendormap in commonProductVendorMapping on itemproduct.ProductId equals itemproductvendormap.ProductId
                                   where (itemproduct.Active == true) &&
                                   (parameter.ListProductCategory.Count == 0 || parameter.ListProductCategory.Contains(itemproduct.ProductCategoryId)) &&
                                   (parameter.ListProductId.Count == 0 || parameter.ListProductId.Contains(itemproduct.ProductId))
                                   select new ProductEntityModel
                                   {
                                       ProductId = itemproduct.ProductId,
                                       ProductCategoryId = itemproduct.ProductCategoryId,
                                       ProductName = itemproduct.ProductName,
                                       ProductCode = itemproduct.ProductCode,
                                       ProductDescription = itemproduct.ProductDescription,
                                       ProductUnitId = itemproduct.ProductUnitId,
                                       Quantity = itemproduct.Quantity,
                                       Price1 = itemproduct.Price1,
                                       Price2 = itemproduct.Price2,
                                       Active = itemproduct.Active,
                                       ProductMoneyUnitId = itemproduct.ProductMoneyUnitId,
                                       CreatedById = itemproduct.CreatedById,
                                       CreatedDate = itemproduct.CreatedDate,
                                       UpdatedById = itemproduct.UpdatedById,
                                       UpdatedDate = itemproduct.UpdatedDate,
                                       ProductCategoryName = itemProductCategory.ProductCategoryName,
                                       MinimumInventoryQuantity = itemproduct.MinimumInventoryQuantity,
                                       GuaranteeTime = itemproduct.GuaranteeTime,
                                   }
                                ).ToList();
                var resultGroup = productList.GroupBy(x => x.ProductId).Select(y => y.First()).ToList();
                return new FilterProductResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ProductList = resultGroup
                };

            }
            catch (Exception e)
            {
                return new FilterProductResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                    ProductList = new List<ProductEntityModel>()
                };

            }
        }

        public GetProductNameAndProductCodeResult GetProductNameAndProductCode(GetProductNameAndProductCodeParameter parameter)
        {
            try
            {
                var productList = context.Product.Where(wh =>
                   parameter.Query == null || parameter.Query == string.Empty
                   || wh.ProductCode.Contains(parameter.Query) || wh.ProductName.Contains(parameter.Query)
                ).Select(s => new ProductEntityModel
                {
                    ProductId = s.ProductId,
                    ProductName = string.Format("{0}-{1}", s.ProductCode.Trim(), s.ProductName.Trim())
                }).ToList();
                return new GetProductNameAndProductCodeResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ProductList = productList
                };

            }
            catch (Exception e)
            {
                return new GetProductNameAndProductCodeResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                    ProductList = new List<ProductEntityModel>()
                };
            }
        }

        public GetVendorInvenoryReceivingResult GetVendorInvenoryReceiving(GetVendorInvenoryReceivingParameter parameter)
        {
            try
            {
                var commonVendor = context.Vendor.Where(v => v.Active == true).ToList();

                var listIRVID = context.InventoryReceivingVoucher.Where(wh => wh.InventoryReceivingVoucherType == 1).Select(s => s.InventoryReceivingVoucherId).ToList();
                var listObjectId = context.InventoryReceivingVoucherMapping.Where(wh => listIRVID.Contains(wh.InventoryReceivingVoucherId)).Select(s => s.ObjectId).ToList();
                var listVendorOrderId = context.VendorOrderDetail.Where(wh => listObjectId.Contains(wh.VendorOrderDetailId)).Select(s => s.VendorOrderId).Distinct().ToList();
                var listVendorId = context.VendorOrder.Where(wh => listVendorOrderId.Contains(wh.VendorOrderId)).Select(s => s.VendorId).Distinct().ToList();
                var vendorList = commonVendor.Where(wh => listVendorId.Contains(wh.VendorId))
                .Select(v => new VendorEntityModel
                {
                    VendorId = v.VendorId,
                    VendorName = string.Format("{0}-{1}", v.VendorCode, v.VendorName),
                    VendorCode = v.VendorCode,
                }).OrderByDescending(v => v.CreatedDate).ToList();

                return new GetVendorInvenoryReceivingResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    VendorList = vendorList
                };
            }
            catch (Exception e)
            {
                return new GetVendorInvenoryReceivingResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                    VendorList = new List<VendorEntityModel>()
                };
            }
        }

        public GetCustomerDeliveryResult GetCustomerDelivery(GetCustomerDeliveryParameter parameter)
        {
            try
            {
                var commonCustomer = context.Customer.Where(v => v.Active == true).ToList();

                var listCustomerOrder = context.InventoryDeliveryVoucher.Where(wh => wh.InventoryDeliveryVoucherType == 1).Select(s => s.ObjectId).Distinct().ToList();
                var listCustomerId = context.CustomerOrder.Where(wh => listCustomerOrder.Contains(wh.OrderId)).Select(s => s.CustomerId).Distinct().ToList();
                var customerList = commonCustomer.Where(wh => listCustomerId.Contains(wh.CustomerId))
                                    .Select(v => new CustomerEntityModel
                                    {
                                        CustomerId = v.CustomerId,
                                        CustomerName = string.Format("{0}-{1}", v.CustomerCode, v.CustomerName),
                                        CustomerCode = v.CustomerCode,
                                    }).OrderByDescending(v => v.CreatedDate).ToList();
                return new GetCustomerDeliveryResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    Customer = customerList
                };

            }
            catch (Exception e)
            {
                return new GetCustomerDeliveryResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode=e.Message,
                    Customer = new List<CustomerEntityModel>()
                };
            }
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
        private List<Guid?> getOrganizationChildrenId(Guid? id, List<Guid?> list)
        {
            var Organization = context.Organization.Where(o => o.ParentId == id).ToList();
            Organization.ForEach(item =>
            {
                list.Add(item.OrganizationId);
                getOrganizationChildrenId(item.OrganizationId, list);
            });

            return list;
        }
        //kiem tra da nhap kho het chua tai 1 customerOrder
        private bool checkCustomerOrderIsEnough(CustomerOrder CustomerOrder, Guid statusId)
        {
            bool result = true;
            var customerOrderDetails =
                context.CustomerOrderDetail.Where(wh => wh.OrderId == CustomerOrder.OrderId).ToList();
            var InventoryDeliveryVoucherEntity = context.InventoryDeliveryVoucher
                .Where(wh => wh.ObjectId == CustomerOrder.OrderId && wh.StatusId == statusId).ToList();
            var lstInventoryDeliveryVoucherId =
                InventoryDeliveryVoucherEntity.Select(s => s.InventoryDeliveryVoucherId).ToList();
            if (InventoryDeliveryVoucherEntity.Count > 0)
            {
                var lstInventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping
                    .Where(wh => lstInventoryDeliveryVoucherId.Contains(wh.InventoryDeliveryVoucherId)).ToList();

                customerOrderDetails.ForEach(item =>
                {
                    if (item.ProductId != null)
                    {
                        decimal quantityInventoryReceiving = lstInventoryDeliveryVoucherMapping.Where(i =>
                                i.ProductId == item.ProductId
                                && lstInventoryDeliveryVoucherId.Contains(i.InventoryDeliveryVoucherId))
                            .Sum(i => i.QuantityDelivery);
                        if (quantityInventoryReceiving < item.Quantity)
                        {
                            result = false;
                        }
                    }
                });
            }
            else
            {
                result = false;
            }
            return result;
        }
        private bool checkVendorOrderIsEnough(VendorOrder vendorOrder, Guid statusId)
        {
            bool result = true;
            var vendorOrderDetails = context.VendorOrderDetail.Where(wh => wh.VendorOrderId == vendorOrder.VendorOrderId).ToList();
            var InventoryDeliveryVoucherEntity = context.InventoryDeliveryVoucher.Where(wh => wh.ObjectId == vendorOrder.VendorOrderId && wh.StatusId == statusId).ToList();
            var lstInventoryDeliveryVoucherId = InventoryDeliveryVoucherEntity.Select(s => s.InventoryDeliveryVoucherId).ToList();
            if (InventoryDeliveryVoucherEntity.Count > 0)
            {
                var lstInventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping
                                                        .Where(wh => lstInventoryDeliveryVoucherId.Contains(wh.InventoryDeliveryVoucherId)).ToList();

                vendorOrderDetails.ForEach(item =>
                {
                    if (item.ProductId != null)
                    {
                        decimal quantityInventoryReceiving = lstInventoryDeliveryVoucherMapping.Where(i => i.ProductId == item.ProductId && lstInventoryDeliveryVoucherId.Contains(i.InventoryDeliveryVoucherId)).Sum(i => i.QuantityDelivery);
                        if (quantityInventoryReceiving < item.Quantity)
                        {
                            result = false;
                            return;
                        }
                    }
                });
            }
            else
            {
                result = false;
            }
            return result;
        }

        public InStockReportResult InStockReport(InStockReportParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "DNH" && ct.Active == true).CategoryTypeId;
                var categoryIdNHK = context.Category
                    .Where(ct => ct.CategoryTypeId == categoryTypeId && ct.Active == true).ToList();

                //
                var lstInventoryReport = context.InventoryReport.Where(wh =>
                    (parameter.lstProduct == null || parameter.lstProduct.Count == 0 ||
                     parameter.lstProduct.Contains(wh.ProductId))
                    && (parameter.lstWarehouse == null || parameter.lstWarehouse.Count == 0 ||
                        parameter.lstWarehouse.Contains(wh.WarehouseId))
                    && ((parameter.FromQuantity == null || parameter.FromQuantity <= wh.Quantity) &&
                        (parameter.FromQuantity == null || parameter.ToQuantity >= wh.Quantity))
                ).ToList();

                var lstProductId = lstInventoryReport.Select(s => s.ProductId).Distinct().ToList();
                var lstWareHouseId = lstInventoryReport.Select(s => s.WarehouseId).Distinct().ToList();

                var lstProduct = context.Product.Where(wh => lstProductId.Contains(wh.ProductId)).ToList();
                var lstWarehouse = context.Warehouse.Where(wh => lstWareHouseId.Contains(wh.WarehouseId)).ToList();
                var lstProductCategory = context.ProductCategory.ToList();

                var lstResult = (from inventoryR in lstInventoryReport
                                 join product in lstProduct on inventoryR.ProductId equals product.ProductId
                                 join categoryUnint in categoryIdNHK on product.ProductUnitId equals categoryUnint.CategoryId
                                 join warehouse in lstWarehouse on inventoryR.WarehouseId equals warehouse.WarehouseId
                                 join productCategory in lstProductCategory on product.ProductCategoryId equals productCategory
                                     .ProductCategoryId
                                 select new InStockEntityModel
                                 {
                                     ProductId = inventoryR.ProductId,
                                     ProductCode = product.ProductCode,
                                     ProductName = product.ProductName,
                                     ProductGroup = productCategory.ProductCategoryName,
                                     ProductUnitName = categoryUnint.CategoryName,
                                     QuantityInStock = inventoryR.Quantity??0,
                                     WareHouseId = warehouse.WarehouseId,
                                     WareHouseName = warehouse.WarehouseName,
                                     ProductPrice = product.Price1,
                                     lstSerial = new List<Serial>()
                                 }).ToList();

                //Lấy danh sách Serial
                var categoryTypeStatusSerialId = context.CategoryType
                    .FirstOrDefault(ct => ct.CategoryTypeCode == "TSE" && ct.Active == true).CategoryTypeId;
                var categoryIdDXU = context.Category.FirstOrDefault(ct =>
                        ct.CategoryCode == "CXU" && ct.CategoryTypeId == categoryTypeStatusSerialId &&
                        ct.Active == true)
                    .CategoryId;

                var lstInventoryReceivingVoucherSerialMappingSerialId = context.InventoryReceivingVoucherSerialMapping
                    .Select(s => s.SerialId).ToList();
                var lstSerialReceivingVoucher = context.Serial.Where(wh =>
                    lstInventoryReceivingVoucherSerialMappingSerialId.Contains(wh.SerialId)
                    && wh.StatusId == categoryIdDXU
                    && (parameter.SerialCode == null || wh.SerialCode.Contains(parameter.SerialCode.Trim()))
                ).ToList();

                var listRmove = new List<InStockEntityModel>();
                lstResult.ForEach(item =>
                {
                    var lstResultSerial = lstSerialReceivingVoucher
                        .Where(wh => (item.ProductId == null || wh.ProductId == item.ProductId)
                                     && (item.WareHouseId == null || wh.WarehouseId == item.WareHouseId)).ToList();
                    if (parameter.SerialCode != null && parameter.SerialCode != "" && parameter.SerialCode != string.Empty)
                    {
                        if (lstResultSerial.Count == 0)
                        {
                            listRmove.Add(item);
                        }
                        else
                        {
                            item.lstSerial = lstResultSerial;
                        }
                    }
                    else
                    {
                        item.lstSerial = lstResultSerial;
                    }
                });

                if (listRmove.Count > 0)
                {
                    listRmove.ForEach(item =>
                    {
                        lstResult.Remove(item);
                    });
                }

                return new InStockReportResult
                {
                    lstResult = lstResult,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success"
                };
            }
            catch (Exception e)
            {
                return new InStockReportResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public CreateUpdateWarehouseMasterdataResult CreateUpdateWarehouseMasterdata(CreateUpdateWarehouseMasterdataParameter parameter)
        {
            try
            {
                var listOrganizationEntity = new List<OrganizationEntityModel>();
                var listCategoryEntity = new List<CategoryEntityModel>();

                //Lấy bộ phận quản lý thành phẩm
                listOrganizationEntity = context.Organization.Select(o => new OrganizationEntityModel()
                {
                    OrganizationId = o.OrganizationId,
                    OrganizationName = o.OrganizationName,
                    Level = o.Level,
                    ParentId = o.ParentId,
                    IsFinancialIndependence = o.IsFinancialIndependence
                }).ToList();

                var loaikho_id = context.CategoryType.FirstOrDefault(x => x.Active == true && x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var categories = context.Category.Where(x => x.CategoryTypeId == loaikho_id).Select(item => new CategoryEntityModel()
                {
                    CategoryId = item.CategoryId,
                    CategoryName = item.CategoryName
                }).ToList();

                //listCategoryTypeEntity = context.CategoryType.Where(x => x.Active == true && x.CategoryTypeCode == "KHO")
                //    .Select(item => new CategoryTypeEntityModel()
                //    {
                //        CategoryTypeId = item.CategoryTypeId,
                //        CategoryTypeCode = item.CategoryTypeCode,
                //        CategoryTypeName = item.CategoryTypeName
                //    }).ToList();

                #region Get Warehouse by Id
                var WarehouseEntityModel = new WareHouseEntityModel();
                if (parameter.WarehouseId != null)
                {
                    var warehouseById = context.Warehouse.Where(w => w.WarehouseId == parameter.WarehouseId).FirstOrDefault();
                    if (warehouseById != null)
                    {
                        WarehouseEntityModel.WarehouseId = warehouseById.WarehouseId;
                        WarehouseEntityModel.WarehouseCode = warehouseById.WarehouseCode;
                        WarehouseEntityModel.WarehouseName = warehouseById.WarehouseName;
                        WarehouseEntityModel.WarehouseParent = warehouseById.WarehouseParent;
                        WarehouseEntityModel.WarehouseAddress = warehouseById.WarehouseAddress;
                        WarehouseEntityModel.Storagekeeper = warehouseById.Storagekeeper;
                        WarehouseEntityModel.WarehouseDescription = warehouseById.WarehouseDescription;
                        WarehouseEntityModel.Department = warehouseById.Department;
                        WarehouseEntityModel.WareHouseType = warehouseById.WareHouseType;
                        WarehouseEntityModel.WareHouseTypeName = context.Category.FirstOrDefault(x => x.CategoryId == warehouseById.WareHouseType)?.CategoryName;
                    }
                }
                #endregion

                return new CreateUpdateWarehouseMasterdataResult
                {
                    WarehouseEntityModel = WarehouseEntityModel,
                    ListCategoryEntityModel = categories,
                    ListOrganization = listOrganizationEntity,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success"
                };
            }
            catch (Exception e)
            {
                return new CreateUpdateWarehouseMasterdataResult
                {
                    MessageCode = e.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetMasterDataSearchInStockReportResult GetMasterDataSearchInStockReport(
            GetMasterDataSearchInStockReportParameter parameter)
        {
            try
            {
                var listAllProductCategory = context.ProductCategory.Where(x => x.Active == true).Select(y =>
                    new ProductCategoryEntityModel
                    {
                        ProductCategoryId = y.ProductCategoryId,
                        ParentId = y.ParentId,
                        ProductCategoryCode = y.ProductCategoryCode,
                        ProductCategoryName = y.ProductCategoryName,
                        ProductCategoryCodeName = y.ProductCategoryCode.Trim() + " - " + y.ProductCategoryName.Trim(),
                        ProductCategoryLevel = y.ProductCategoryLevel
                    }).OrderBy(z => z.ProductCategoryName).ToList();

                var listWareHouse = new List<WareHouseEntityModel>();
                listWareHouse = context.Warehouse.Where(x => x.Active).Select(y =>
                    new WareHouseEntityModel
                    {
                        WarehouseId = y.WarehouseId,
                        WarehouseCode = y.WarehouseCode,
                        WarehouseName = y.WarehouseName,
                        WarehouseCodeName = y.WarehouseCode.Trim() + " - " + y.WarehouseName.Trim()
                    }).OrderBy(z => z.WarehouseName).ToList();

                return new GetMasterDataSearchInStockReportResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListProductCategory = listAllProductCategory,
                    ListWareHouse = listWareHouse
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataSearchInStockReportResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public SearchInStockReportResult SearchInStockReport(SearchInStockReportParameter parameter)
        //{
        //    try
        //    {
        //        var listResult = new List<InStockEntityModel>();
        //        var listAllInventoryReport = context.InventoryReport.Where(x => x.Active).ToList();
        //        var listAllWarehouse = context.Warehouse.Where(x => x.Active).ToList();
        //        var listAllProduct = context.Product.Where(x => x.Active == true).ToList();

        //        #region Lấy list Đơn vị tính của sản phẩm

        //        var statusTypeDVT = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH")
        //            ?.CategoryTypeId;
        //        var listDVT = context.Category.Where(x => x.Active == true && x.CategoryTypeId == statusTypeDVT)
        //            .ToList();

        //        #endregion

        //        var currentWarehouse = listAllWarehouse.FirstOrDefault(x => x.WarehouseId == parameter.WarehouseId);

        //        if (currentWarehouse != null)
        //        {
        //            //Kiểm tra xem kho là kho cha hay không?
        //            var hasParent =
        //                listAllWarehouse.FirstOrDefault(x => x.WarehouseParent == currentWarehouse.WarehouseId);

        //            //Nếu không là kho cha thì
        //            if (hasParent == null)
        //            {
        //                var listWarehouseId = new List<Guid>();
        //                listWarehouseId.Add(currentWarehouse.WarehouseId);

        //                listResult = GetListResult(listWarehouseId, parameter.FromDate, listAllProduct,
        //                    parameter.ProductCategoryId,
        //                    parameter.ProductNameCode, listDVT, listAllInventoryReport);
        //            }
        //            //Nếu là kho cha thì
        //            else
        //            {
        //                #region Lấy tất cả kho con cấp cuối cùng của nó

        //                var listWarehouseId = GetListWarehouseChild(listAllWarehouse, currentWarehouse.WarehouseId,
        //                    new List<Guid>());

        //                listResult = GetListResult(listWarehouseId, parameter.FromDate, listAllProduct,
        //                    parameter.ProductCategoryId,
        //                    parameter.ProductNameCode, listDVT, listAllInventoryReport);

        //                #endregion
        //            }
        //        }
        //        else
        //        {
        //            var listWarehouseId = context.Warehouse.Where(c => c.Active == true).Select(m => m.WarehouseId).ToList();
        //            listResult = GetListResult(listWarehouseId, parameter.FromDate, listAllProduct,
        //                    parameter.ProductCategoryId,
        //                    parameter.ProductNameCode, listDVT, listAllInventoryReport);
        //        }

        //        return new SearchInStockReportResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            ListResult = listResult
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new SearchInStockReportResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public GetDanhSachSanPhamCuaPhieuResult GetDanhSachSanPhamCuaPhieu(GetDanhSachSanPhamCuaPhieuParameter parameter)
        //{
        //    try
        //    {
        //        var listItemDetail = new List<SanPhamPhieuNhapKhoModel>();

        //        //Lấy Id các trạng thái đơn hàng: Đơn hàng mua
        //        var listStatusCode = new List<string>() { "PURC" };
        //        var listStatusId = context.PurchaseOrderStatus
        //            .Where(ct => listStatusCode.Contains(ct.PurchaseOrderStatusCode) && ct.Active)
        //            .Select(ct => ct.PurchaseOrderStatusId).ToList();

        //        //Nếu là phiếu mua hàng
        //        if (parameter.ObjectType == 1)
        //        {
        //            //Lấy đơn hàng mua theo Id
        //            var listVendorOrder = context.VendorOrder
        //                .Where(x => parameter.ListObjectId.Contains(x.VendorOrderId) &&
        //                            listStatusId.Contains(x.StatusId)).ToList();
        //            var listVendorOrderId = listVendorOrder.Select(y => y.VendorOrderId).ToList();

        //            //Lấy list sản phẩm của đơn hàng mua
        //            var listVendorOrderDetail = context.VendorOrderDetail
        //                .Where(x => listVendorOrderId.Contains(x.VendorOrderId)).OrderBy(z => z.VendorOrderId).ToList();

        //            #region Lấy số lượng cần nhập hiện tại

        //            //Trạng thái của Phiếu nhập kho
        //            var statusPhieuNhapKhoType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH");
        //            var statusNhapKho = context.Category.FirstOrDefault(x =>
        //                x.CategoryTypeId == statusPhieuNhapKhoType.CategoryTypeId && x.CategoryCode == "NHK");

        //            //Lấy list Id phiếu nhập kho có trạng thái Nhập kho và loại phiếu nhập kho là Phiếu mua hàng
        //            var listPhieuNhapKhoId = context.InventoryReceivingVoucher
        //                .Where(x => x.StatusId == statusNhapKho.CategoryId && x.InventoryReceivingVoucherType == 1)
        //                .Select(y => y.InventoryReceivingVoucherId)
        //                .ToList();

        //            //Lấy list sản phẩm đã nhập kho
        //            var listSanPhamDaNhapKho = context.InventoryReceivingVoucherMapping
        //                .Where(x => listPhieuNhapKhoId.Contains(x.InventoryReceivingVoucherId) &&
        //                            x.ObjectId != null &&
        //                            listVendorOrderId.Contains(x.ObjectId.Value)).ToList();

        //            //Lấy list sản phẩm của phiếu nhập kho (nếu là màn hình chi tiết)
        //            var listSanPhamCuaPhieuNhap = context.InventoryReceivingVoucherMapping
        //                .Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).ToList();

        //            listVendorOrderDetail.ForEach(item =>
        //            {
        //                var tongSoLuongDaNhap = listSanPhamDaNhapKho.Where(x =>
        //                        x.ObjectDetailId == item.VendorOrderDetailId) //x.ProductId == item.ProductId && x.ObjectId == item.VendorOrderId
        //                    .Sum(s => s.QuantityActual);
        //                var soLuongCanNhap = item.Quantity - tongSoLuongDaNhap;

        //                //Nếu sản phẩm trong Đơn hàng mua chưa được nhập kho hết
        //                if (soLuongCanNhap > 0)
        //                {
        //                    //Lấy lại số thực nhập nếu có
        //                    var _item = listSanPhamCuaPhieuNhap.FirstOrDefault(x =>
        //                        x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId &&
        //                        x.ObjectDetailId == item.VendorOrderDetailId && x.WarehouseId == parameter.WarehouseId);
        //                    decimal soThucNhap = _item == null ? 0 : _item.QuantityActual;

        //                    var sanPhamNhapKho = new SanPhamPhieuNhapKhoModel();
        //                    sanPhamNhapKho.ObjectId = item.VendorOrderId;
        //                    sanPhamNhapKho.ObjectDetailId = item.VendorOrderDetailId;
        //                    sanPhamNhapKho.ProductId = item.ProductId;
        //                    sanPhamNhapKho.QuantityRequest = soLuongCanNhap.Value;
        //                    sanPhamNhapKho.QuantityReservation = 0;
        //                    sanPhamNhapKho.QuantityActual = soThucNhap;
        //                    sanPhamNhapKho.PriceAverage = false;
        //                    sanPhamNhapKho.PriceProduct = item.PriceWarehouse ?? 0;
        //                    sanPhamNhapKho.WarehouseId = parameter.WarehouseId;
        //                    sanPhamNhapKho.OrderCode = "";
        //                    sanPhamNhapKho.ProductCode = "";
        //                    sanPhamNhapKho.Description = "";
        //                    sanPhamNhapKho.UnitName = "";
        //                    sanPhamNhapKho.WarehouseName = "";
        //                    sanPhamNhapKho.WarehouseCodeName = "";

        //                    listItemDetail.Add(sanPhamNhapKho);
        //                }
        //            });

        //            //Lấy thêm thông tin cho list sản phẩm
        //            if (listItemDetail.Count > 0)
        //            {
        //                var _listVendorOrderId = listItemDetail.Select(y => y.ObjectId).ToList();
        //                var listAllVendorOrder = context.VendorOrder
        //                    .Where(x => _listVendorOrderId.Contains(x.VendorOrderId)).Select(y => new VendorOrder
        //                    {
        //                        VendorOrderId = y.VendorOrderId,
        //                        VendorOrderCode = y.VendorOrderCode
        //                    }).ToList();

        //                var _listProductId = listItemDetail.Select(y => y.ProductId).ToList();
        //                var listAllProduct = context.Product.Where(x => _listProductId.Contains(x.ProductId)).Select(
        //                    y => new Product
        //                    {
        //                        ProductId = y.ProductId,
        //                        ProductCode = y.ProductCode,
        //                        ProductName = y.ProductName,
        //                        ProductUnitId = y.ProductUnitId
        //                    }).ToList();

        //                //Đơn vị tính
        //                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
        //                var listUnitProduct =
        //                    context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();

        //                listItemDetail.ForEach(item =>
        //                {
        //                    var vendor = listAllVendorOrder.FirstOrDefault(x => x.VendorOrderId == item.ObjectId);

        //                    if (vendor != null)
        //                    {
        //                        item.OrderCode = vendor.VendorOrderCode;
        //                    }

        //                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);

        //                    if (product != null)
        //                    {
        //                        item.ProductCode = product.ProductCode;
        //                        item.Description = product.ProductName;

        //                        var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product.ProductUnitId);

        //                        if (unit != null)
        //                        {
        //                            item.UnitName = unit.CategoryName;
        //                        }
        //                    }
        //                });

        //                #region Tính số giữ trước

        //                var systemType = context.SystemParameter.FirstOrDefault(x => x.SystemKey == "HIM")
        //                    ?.SystemValueString;

        //                if (!String.IsNullOrEmpty(systemType))
        //                {
        //                    if (systemType.Trim() == "1" || systemType.Trim() == "2")
        //                    {
        //                        listItemDetail.ForEach(item =>
        //                        {
        //                            item.QuantityReservation = item.QuantityRequest;
        //                        });
        //                    }
        //                }

        //                #endregion
        //            }

        //            #endregion
        //        }
        //        //Nếu là phiếu xuất kho
        //        else if (parameter.ObjectType == 2)
        //        {

        //        }
        //        //Nếu là phiếu kiểm kê
        //        else if (parameter.ObjectType == 3)
        //        {

        //        }
        //        //Nếu là điều chuyển
        //        else if (parameter.ObjectType == 4)
        //        {

        //        }
        //        else
        //        {
        //            return new GetDanhSachSanPhamCuaPhieuResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Không tồn tại loại phiếu",
        //                ListItemDetail = listItemDetail
        //            };
        //        }

        //        return new GetDanhSachSanPhamCuaPhieuResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            ListItemDetail = listItemDetail
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new GetDanhSachSanPhamCuaPhieuResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public GetDanhSachKhoConResult GetDanhSachKhoCon(GetDanhSachKhoConParameter parameter)
        //{
        //    try
        //    {
        //        var listAllWarehouse = context.Warehouse.Where(x => x.Active).ToList();

        //        var listWarehouse = new List<WareHouseEntityModel>();

        //        var listResultId = getListWarehouseChildrenId(listAllWarehouse, parameter.WarehouseId, new List<Guid?>());
        //        listResultId.Add(parameter.WarehouseId);

        //        listWarehouse = listAllWarehouse.Where(x => listResultId.Contains(x.WarehouseId)).Select(y =>
        //            new WareHouseEntityModel
        //            {
        //                WarehouseId = y.WarehouseId,
        //                WarehouseParent = y.WarehouseParent,
        //                WarehouseCode = y.WarehouseCode,
        //                WarehouseName = y.WarehouseName,
        //                WarehouseCodeName = y.WarehouseCode + " - " + y.WarehouseName
        //            }).ToList();

        //        //Phân loại kho: Có kho con (hasChild = true) và Không có kho con (hasChild = false)
        //        listWarehouse.ForEach(item =>
        //        {
        //            var hasChild = listAllWarehouse.FirstOrDefault(x => x.WarehouseParent == item.WarehouseId);

        //            if (hasChild != null)
        //            {
        //                item.HasChild = true;
        //            }
        //            else
        //            {
        //                item.HasChild = false;
        //            }
        //        });

        //        return new GetDanhSachKhoConResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            ListWarehouse = listWarehouse
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new GetDanhSachKhoConResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public CreateItemInventoryReportResult CreateItemInventoryReport(CreateItemInventoryReportParameter parameter)
        {
            try
            {
                var InventoryReportId = Guid.Empty;

                var inventoryReport = new InventoryReport();

                inventoryReport.InventoryReportId = Guid.NewGuid();
                inventoryReport.WarehouseId = parameter.InventoryReport.WarehouseId;
                inventoryReport.ProductId = parameter.InventoryReport.ProductId;
                inventoryReport.Quantity = parameter.InventoryReport.Quantity;
                inventoryReport.QuantityMinimum = parameter.InventoryReport.QuantityMinimum;
                inventoryReport.QuantityMaximum = parameter.InventoryReport.QuantityMaximum;
                inventoryReport.StartQuantity = parameter.InventoryReport.StartQuantity;
                inventoryReport.OpeningBalance = parameter.InventoryReport.OpeningBalance;
                inventoryReport.Note = parameter.InventoryReport.Note;
                inventoryReport.Active = true;
                inventoryReport.CreatedById = parameter.UserId;
                inventoryReport.CreatedDate = DateTime.Now;

                context.InventoryReport.Add(inventoryReport);
                context.SaveChanges();

                InventoryReportId = inventoryReport.InventoryReportId;

                return new CreateItemInventoryReportResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    InventoryReportId = InventoryReportId
                };
            }
            catch (Exception e)
            {
                return new CreateItemInventoryReportResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public UpdateItemInventoryReportResult UpdateItemInventoryReport(UpdateItemInventoryReportParameter parameter)
        {
            try
            {
                var inventoryReport = context.InventoryReport.FirstOrDefault(x =>
                    x.InventoryReportId == parameter.InventoryReport.InventoryReportId);

                if (inventoryReport == null)
                {
                    return new UpdateItemInventoryReportResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Dữ liệu không tồn tại trên hệ thống"
                    };
                }

                inventoryReport.QuantityMinimum = parameter.InventoryReport.QuantityMinimum;
                inventoryReport.QuantityMaximum = parameter.InventoryReport.QuantityMaximum;
                inventoryReport.StartQuantity = parameter.InventoryReport.StartQuantity;
                inventoryReport.OpeningBalance = parameter.InventoryReport.OpeningBalance;

                context.InventoryReport.Update(inventoryReport);
                context.SaveChanges();

                return new UpdateItemInventoryReportResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new UpdateItemInventoryReportResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public CreateUpdateSerialResult CreateUpdateSerial(CreateUpdateSerialParameter parameter)
        //{
        //    try
        //    {
        //        using (var transaction = context.Database.BeginTransaction())
        //        {
        //            var listSerial = new List<SerialEntityModel>();

        //            #region Thêm serial

        //            var SERIAL_STATUS_CODE = "TSE";
        //            var serialStatusId = context.CategoryType
        //                .FirstOrDefault(w => w.CategoryTypeCode == SERIAL_STATUS_CODE)?.CategoryTypeId;
        //            var NEW_SERIAL_STATUS_CODE = "CXU"; //Mặc định trạng thái mới của serial: Chưa xuất;
        //            var statusId = context.Category.FirstOrDefault(w =>
        //                    w.CategoryTypeId == serialStatusId && w.CategoryCode == NEW_SERIAL_STATUS_CODE)?
        //                .CategoryId;

        //            var listOldSerial = context.Serial.Where(x =>
        //                x.ProductId == parameter.ProductId &&
        //                x.WarehouseId == parameter.WarehouseId).ToList();

        //            context.Serial.RemoveRange(listOldSerial);
        //            context.SaveChanges();

        //            var listNewSerial = new List<Serial>();
        //            parameter.ListSerial.ForEach(item =>
        //            {
        //                var newSerial = new Serial();
        //                newSerial.SerialId = item.SerialId.Value == Guid.Empty ? Guid.NewGuid() : item.SerialId.Value;
        //                newSerial.SerialCode = item.SerialCode;
        //                newSerial.ProductId = item.ProductId.Value;
        //                newSerial.WarehouseId = item.WarehouseId;
        //                newSerial.StatusId = item.SerialId.Value == Guid.Empty ? statusId.Value : item.StatusId.Value;
        //                newSerial.CreatedDate = DateTime.Now;
        //                newSerial.CreatedById = parameter.UserId;
        //                newSerial.Active = true;

        //                listNewSerial.Add(newSerial);
        //            });

        //            context.Serial.AddRange(listNewSerial);
        //            context.SaveChanges();

        //            transaction.Commit();

        //            listSerial = context.Serial
        //                .Where(x => x.WarehouseId == parameter.WarehouseId && x.ProductId == parameter.ProductId)
        //                .Select(y => new SerialEntityModel
        //                {
        //                    SerialId = y.SerialId,
        //                    WarehouseId = y.WarehouseId,
        //                    ProductId = y.ProductId,
        //                    SerialCode = y.SerialCode,
        //                    StatusId = y.StatusId,
        //                    CreatedDate = y.CreatedDate
        //                }).OrderBy(z => z.SerialCode).ToList();

        //            #endregion

        //            return new CreateUpdateSerialResult()
        //            {
        //                StatusCode = HttpStatusCode.OK,
        //                MessageCode = "Success",
        //                ListSerial = listSerial
        //            };
        //        }
        //    }
        //    catch (Exception e)
        //    {
        //        return new CreateUpdateSerialResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public DeleteItemInventoryReportResult DeleteItemInventoryReport(DeleteItemInventoryReportParameter parameter)
        {
            try
            {
                var inventoryReport =
                    context.InventoryReport.FirstOrDefault(x => x.InventoryReportId == parameter.InventoryReportId);

                if (inventoryReport == null)
                {
                    return new DeleteItemInventoryReportResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Dữ liệu không tồn tại trên hệ thống"
                    };
                }

                context.InventoryReport.Remove(inventoryReport);

                var listSerial = context.Serial.Where(x =>
                    x.WarehouseId == inventoryReport.WarehouseId && x.ProductId == inventoryReport.ProductId).ToList();

                context.Serial.RemoveRange(listSerial);

                context.SaveChanges();

                return new DeleteItemInventoryReportResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new DeleteItemInventoryReportResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public GetSoGTCuaSanPhamTheoKhoResult GetSoGTCuaSanPhamTheoKho(GetSoGTCuaSanPhamTheoKhoParameter parameter)
        //{
        //    try
        //    {
        //        decimal quantityReservation = parameter.QuantityRequest;
        //        var systemType = context.SystemParameter.FirstOrDefault(x => x.SystemKey == "HIM")
        //            ?.SystemValueString;

        //        if (!String.IsNullOrEmpty(systemType))
        //        {
        //            if (systemType.Trim() == "3")
        //            {
        //                var warehouse =
        //                            context.Warehouse.FirstOrDefault(x => x.WarehouseParent == parameter.WarehouseId);

        //                var listAllInventoryReceivingVoucher = context.InventoryReceivingVoucher.ToList();
        //                var listAllInventoryReceivingVoucherMapping =
        //                    context.InventoryReceivingVoucherMapping.ToList();
        //                var listAllInventoryDeliveryVoucher = context.InventoryDeliveryVoucher.ToList();
        //                var listAllInventoryDeliveryVoucherMapping =
        //                    context.InventoryDeliveryVoucherMapping.ToList();
        //                var listAllInventoryReport = context.InventoryReport.ToList();

        //                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //                    ?.CategoryTypeId;
        //                var statusId_PNK = context.Category
        //                    .FirstOrDefault(x => x.CategoryCode == "NHK" && x.CategoryTypeId == statusTypeId_PNK)
        //                    ?.CategoryId;
        //                var statusId_SanSang_PNK = context.Category
        //                    .FirstOrDefault(x => x.CategoryCode == "SAS" && x.CategoryTypeId == statusTypeId_PNK)
        //                    ?.CategoryId;

        //                var statusTypeId_PXK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
        //                    ?.CategoryTypeId;
        //                var statusId_PXK = context.Category
        //                    .FirstOrDefault(x => x.CategoryCode == "NHK" && x.CategoryTypeId == statusTypeId_PXK)
        //                    ?.CategoryId;
        //                var statusId_SanSang_PXK = context.Category
        //                    .FirstOrDefault(x => x.CategoryCode == "SAS" && x.CategoryTypeId == statusTypeId_PXK)
        //                    ?.CategoryId;

        //                //Nếu kho được chọn có Kho con thì Số giữ trước = 0
        //                if (warehouse != null)
        //                {
        //                    quantityReservation = 0;
        //                }
        //                else
        //                {
        //                    //Số tồn kho tối đa của sản phẩm
        //                    var inventoryReport = listAllInventoryReport.FirstOrDefault(x =>
        //                        x.WarehouseId == parameter.WarehouseId && x.ProductId == parameter.ProductId);

        //                    var quantityMaximum = inventoryReport != null
        //                        ? inventoryReport.QuantityMaximum
        //                        : null;

        //                    //Số tồn kho thực tế của sản phẩm
        //                    var quantityInStock = GetSoTonKhoThucTe(parameter.WarehouseId,
        //                        parameter.ProductId,
        //                        statusId_PNK.Value, statusId_PXK.Value,
        //                        listAllInventoryReceivingVoucher,
        //                        listAllInventoryReceivingVoucherMapping,
        //                        listAllInventoryDeliveryVoucher,
        //                        listAllInventoryDeliveryVoucherMapping,
        //                        listAllInventoryReport);

        //                    #region Số giữ trước của sản phẩm trên phiếu nhập kho

        //                    var listIdPhieuNK = listAllInventoryReceivingVoucher
        //                        .Where(x => x.StatusId == statusId_SanSang_PNK)
        //                        .Select(y => y.InventoryReceivingVoucherId).ToList();

        //                    var quantityReservation_NK = listAllInventoryReceivingVoucherMapping
        //                        .Where(x => listIdPhieuNK.Contains(x.InventoryReceivingVoucherId) &&
        //                                    x.ProductId == parameter.ProductId).Sum(s => s.QuantityReservation);

        //                    #endregion

        //                    #region Số giữ trước của sản phẩm trên phiếu xuất kho

        //                    var listIdPhieuXK = listAllInventoryDeliveryVoucher
        //                        .Where(x => x.StatusId == statusId_SanSang_PXK)
        //                        .Select(y => y.InventoryDeliveryVoucherId).ToList();

        //                    var quantityReservation_XK = listAllInventoryDeliveryVoucherMapping
        //                        .Where(x => listIdPhieuXK.Contains(x.InventoryDeliveryVoucherId) &&
        //                                    x.ProductId == parameter.ProductId).Sum(s => s.QuantityReservation);

        //                    #endregion

        //                    /*
        //                     * Số tồn kho kinh doanh của sản phẩm = Số tồn kho thực tế +
        //                     *                                      Số giữ trước của sản phẩm trên phiếu nhập kho -
        //                     *                                      Số giữ trước của sản phẩm trên phiếu xuất kho
        //                     */
        //                    var so_ton_kho_kinh_doanh =
        //                        quantityInStock + quantityReservation_NK - quantityReservation_XK;

        //                    #region Số giữ trước

        //                    decimal so_B = 0;

        //                    /*
        //                     * Nếu số lượng tồn kho tối đa có giá trị null hoặc có giá trị bằng 0
        //                     * thì Số B = Số tồn kho kinh doanh của sản phẩm
        //                     */
        //                    if (quantityMaximum == null || quantityMaximum == 0)
        //                    {
        //                        so_B = so_ton_kho_kinh_doanh;
        //                    }
        //                    /*
        //                     * Số B = Số lượng tồn kho tối đa - Số tồn kho kinh doanh của sản phẩm
        //                     * 
        //                     */
        //                    else
        //                    {
        //                        so_B = quantityMaximum.Value - so_ton_kho_kinh_doanh;
        //                    }

        //                    /*
        //                     * A là Số cần nhập
        //                     * Nếu B = 0
        //                     */
        //                    if (so_B == 0)
        //                    {
        //                        var product_exists = listAllInventoryReceivingVoucherMapping
        //                            .FirstOrDefault(x =>
        //                                listIdPhieuNK.Contains(x.InventoryReceivingVoucherId) &&
        //                                x.ProductId == parameter.ProductId);

        //                        //Nếu sản phẩm chưa nhập kho bao giờ thì Số giữ trước = A
        //                        if (product_exists == null)
        //                        {
        //                            quantityReservation = parameter.QuantityRequest;
        //                        }
        //                        //Ngược lại Số giữ trước = 0
        //                        else
        //                        {
        //                            quantityReservation = 0;
        //                        }
        //                    }
        //                    else
        //                    {
        //                        /*
        //                         * Nếu B != 0
        //                         * Nếu B >= A: Số giữ trước = A
        //                         * Nếu B < A: Số giữ trước = B
        //                         */
        //                        if (so_B >= parameter.QuantityRequest)
        //                        {
        //                            quantityReservation = parameter.QuantityRequest;
        //                        }
        //                        else
        //                        {
        //                            quantityReservation = so_B;
        //                        }
        //                    }

        //                    #endregion
        //                }
        //            }
        //        }

        //        return new GetSoGTCuaSanPhamTheoKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            QuantityReservation = quantityReservation
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new GetSoGTCuaSanPhamTheoKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public CreatePhieuNhapKhoResult CreatePhieuNhapKho(CreatePhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
        //        var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var statusId_Nhap_PNK = context.Category
        //            .FirstOrDefault(x => x.CategoryCode == "NHA" && x.CategoryTypeId == statusTypeId_PNK)
        //            ?.CategoryId;

        //        var Code = "";
        //        var datenow = DateTime.Now;
        //        string year = datenow.Year.ToString().Substring(datenow.Year.ToString().Length - 2, 2);
        //        string month = datenow.Month < 10 ? "0" + datenow.Month.ToString() : datenow.Month.ToString();
        //        string day = datenow.Day < 10 ? "0" + datenow.Day.ToString() : datenow.Day.ToString();

        //        var listCodeToDay = context.InventoryReceivingVoucher.Where(c =>
        //            Convert.ToDateTime(c.CreatedDate).Day == datenow.Day &&
        //            Convert.ToDateTime(c.CreatedDate).Month == datenow.Month &&
        //            Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Select(y => new
        //            {
        //                InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode
        //            }).ToList();

        //        if (listCodeToDay.Count == 0)
        //        {
        //            Code = "PN-" + year + month + day + "0001";
        //        }
        //        else
        //        {
        //            var listNumber = new List<int>();
        //            listCodeToDay.ForEach(item =>
        //            {
        //                var stringNumber = item.InventoryReceivingVoucherCode.Substring(9);
        //                var number = Int32.Parse(stringNumber);
        //                listNumber.Add(number);
        //            });

        //            var maxNumber = listNumber.OrderByDescending(x => x).FirstOrDefault();
        //            var newNumber = maxNumber + 1;

        //            if (newNumber > 9999)
        //            {
        //                Code = "PN-" + year + month + day + newNumber;
        //            }
        //            else
        //            {
        //                Code = "PN-" + year + month + day + newNumber.ToString("D4");
        //            }
        //        }

        //        parameter.InventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;

        //        var existsCode = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherCode == Code);

        //        if (existsCode != null)
        //        {
        //            return new CreatePhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Mã phiếu nhập kho đã tồn tại"
        //            };
        //        }

        //        parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
        //        parameter.InventoryReceivingVoucher.StatusId = statusId_Nhap_PNK.Value;
        //        parameter.InventoryReceivingVoucher.Active = true;
        //        parameter.InventoryReceivingVoucher.CreatedById = parameter.UserId;
        //        parameter.InventoryReceivingVoucher.CreatedDate = DateTime.Now;
        //        parameter.InventoryReceivingVoucher.WarehouseCategoryTypeId = context.Category.FirstOrDefault(x => x.CategoryId == parameter.InventoryReceivingVoucher.WarehouseId)?.CategoryTypeId;
        //        context.InventoryReceivingVoucher.Add(parameter.InventoryReceivingVoucher.ToEntity());

        //        var listInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
        //        parameter.ListInventoryReceivingVoucherMapping.ForEach(item =>
        //        {
        //            if (item.LotNoId == null)
        //            {
        //                var newLotNo = new LotNo();
        //                newLotNo.LotNoName = item.LotNoName;
        //                newLotNo.LotNoType = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherCategory; //NVL or Thanh pham
        //                context.LotNo.Add(newLotNo);

        //                item.LotNoId = newLotNo.LotNoId;
        //            }

        //            //Check ProductLotNoMapping
        //            var existsProductLotNo = context.ProductLotNoMapping.FirstOrDefault(x =>
        //                x.ProductId == item.ProductId && x.LotNoId == item.LotNoId);

        //            if(existsProductLotNo == null)
        //            {
        //                var newProductLotNo = new ProductLotNoMapping();
        //                newProductLotNo.ProductId = item.ProductId;
        //                newProductLotNo.LotNoId = item.LotNoId.Value;
        //                context.ProductLotNoMapping.Add(newProductLotNo);
        //            }

        //            item.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //            item.InventoryReceivingVoucherId = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId;
        //            item.Active = true;
        //            item.CreatedById = parameter.UserId;
        //            item.CreatedDate = DateTime.Now;

        //            listInventoryReceivingVoucherMapping.Add(item.ToEntity());
        //        });

        //        context.InventoryReceivingVoucherMapping.AddRange(listInventoryReceivingVoucherMapping);

        //        #region Thêm vào Dòng thời gian

        //        var note = new Note();
        //        note.NoteId = Guid.NewGuid();
        //        note.Description = employee.EmployeeName.Trim() + " đã tạo phiếu nhập kho";
        //        note.Type = "NEW";
        //        note.ObjectId = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId.Value;
        //        note.ObjectType = "PNK";
        //        note.Active = true;
        //        note.NoteTitle = "Đã tạo phiếu nhập kho";
        //        note.CreatedDate = DateTime.Now;
        //        note.CreatedById = parameter.UserId;

        //        context.Note.Add(note);

        //        #endregion

        //        context.SaveChanges();

        //        return new CreatePhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            InventoryReceivingVoucherId = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId.Value
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new CreatePhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //Đã Tách API riêng
        //public GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKho(GetDetailPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        return new GetDetailPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new GetDetailPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public SuaPhieuNhapKhoResult SuaPhieuNhapKho(SuaPhieuNhapKhoParameter parameter)
        {
            try
            {
                using (var transaction = context.Database.BeginTransaction())
                {
                    var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
                    x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId);

                    if (inventoryReceivingVoucher == null)
                    {
                        return new SuaPhieuNhapKhoResult()
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
                        };
                    }

                    inventoryReceivingVoucher.WarehouseId = parameter.InventoryReceivingVoucher.WarehouseId;
                    inventoryReceivingVoucher.ShiperName = parameter.InventoryReceivingVoucher.ShiperName;
                    inventoryReceivingVoucher.InventoryReceivingVoucherDate =
                        parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate;
                    inventoryReceivingVoucher.Description = parameter.InventoryReceivingVoucher.Description;
                    inventoryReceivingVoucher.Note = parameter.InventoryReceivingVoucher.Note;
                    inventoryReceivingVoucher.WarehouseCategoryTypeId = parameter.InventoryReceivingVoucher.WarehouseCategoryTypeId;
                    inventoryReceivingVoucher.InventoryReceivingVoucherType = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherType;
                    inventoryReceivingVoucher.ProducerName = parameter.InventoryReceivingVoucher.ProducerName;
                    inventoryReceivingVoucher.OrderNumber = parameter.InventoryReceivingVoucher.OrderNumber;
                    inventoryReceivingVoucher.WarehouseId = parameter.InventoryReceivingVoucher.WarehouseId;
                    inventoryReceivingVoucher.OrderDate = parameter.InventoryReceivingVoucher.OrderDate;
                    inventoryReceivingVoucher.InvoiceNumber = parameter.InventoryReceivingVoucher.InvoiceNumber;
                    inventoryReceivingVoucher.InvoiceDate = parameter.InventoryReceivingVoucher.InvoiceDate;
                    inventoryReceivingVoucher.BoxGreen = parameter.InventoryReceivingVoucher.BoxGreen;
                    inventoryReceivingVoucher.BoxGreenMax = parameter.InventoryReceivingVoucher.BoxGreenMax;
                    inventoryReceivingVoucher.PalletMax = parameter.InventoryReceivingVoucher.PalletMax;
                    inventoryReceivingVoucher.PalletNormal = parameter.InventoryReceivingVoucher.PalletNormal;
                    inventoryReceivingVoucher.BoxBlue = parameter.InventoryReceivingVoucher.BoxBlue;
                    inventoryReceivingVoucher.PalletSmall = parameter.InventoryReceivingVoucher.PalletSmall;
                    inventoryReceivingVoucher.VendorId = parameter.InventoryReceivingVoucher.VendorId;

                    context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);
                    context.SaveChanges();

                    #region Thêm sản phẩm

                    var listOldItemDetail = context.InventoryReceivingVoucherMapping.Where(x =>
                            x.InventoryReceivingVoucherId ==
                            parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId)
                        .ToList();

                    context.InventoryReceivingVoucherMapping.RemoveRange(listOldItemDetail);
                    context.SaveChanges();

                    var listInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
                    parameter.ListInventoryReceivingVoucherMapping.ForEach(item =>
                    {
                        var existsLotNo = context.LotNo.FirstOrDefault(x => x.LotNoName == item.LotNoName);
                        if (existsLotNo != null)
                        {
                            item.LotNoId = existsLotNo.LotNoId;
                        }
                        else if (item.LotNoId == null)
                        {
                            var newLotNo = new LotNo();
                            newLotNo.LotNoName = item.LotNoName;
                            context.LotNo.Add(newLotNo);
                            context.SaveChanges();

                            item.LotNoId = newLotNo.LotNoId;
                        }
                        else
                        {
                            //sua ten LotNo
                            var lotno = context.LotNo.FirstOrDefault(x => x.LotNoId == item.LotNoId);
                            lotno.LotNoName = item.LotNoName;
                            context.LotNo.Update(lotno);
                        }

                        //Check ProductLotNoMapping
                        var existsProductLotNo = context.ProductLotNoMapping.FirstOrDefault(x =>
                            x.ProductId == item.ProductId && x.LotNoId == item.LotNoId);

                        if (existsProductLotNo == null)
                        {
                            var newProductLotNo = new ProductLotNoMapping();
                            newProductLotNo.ProductLotNoMappingId = Guid.NewGuid();
                            newProductLotNo.ProductId = item.ProductId;
                            newProductLotNo.LotNoId = item.LotNoId.Value;
                            context.ProductLotNoMapping.Add(newProductLotNo);

                            context.SaveChanges();
                        }

                        var inventoryReceivingVoucherMapping = new InventoryReceivingVoucherMapping();
                        inventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                        inventoryReceivingVoucherMapping.InventoryReceivingVoucherId =
                            parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId.Value;
                        //inventoryReceivingVoucherMapping.ObjectId = item.ObjectId;
                        inventoryReceivingVoucherMapping.ProductId = item.ProductId;
                        inventoryReceivingVoucherMapping.LotNoId = item.LotNoId;
                        //inventoryReceivingVoucherMapping.QuantityRequest = item.QuantityRequest;
                        inventoryReceivingVoucherMapping.QuantityActual = item.QuantityActual.Value; //so luong nhap
                        inventoryReceivingVoucherMapping.WarehouseId = parameter.InventoryReceivingVoucher.WarehouseId;
                        //inventoryReceivingVoucherMapping.PriceProduct = item.PriceProduct;
                        //inventoryReceivingVoucherMapping.WarehouseId = item.WarehouseId.Value;
                        inventoryReceivingVoucherMapping.Description = item.Description;
                        inventoryReceivingVoucherMapping.Active = true;
                        inventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                        inventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                        //inventoryReceivingVoucherMapping.QuantityReservation = item.QuantityReservation;
                        //inventoryReceivingVoucherMapping.PriceAverage = item.PriceAverage;

                        inventoryReceivingVoucherMapping.PackagingStatus = item.PackagingStatus;
                        inventoryReceivingVoucherMapping.ProductStatus = item.ProductStatus;

                        listInventoryReceivingVoucherMapping.Add(inventoryReceivingVoucherMapping);

                       
                    });

                    context.InventoryReceivingVoucherMapping.AddRange(listInventoryReceivingVoucherMapping);
                    context.SaveChanges();

                    //listOldItemDetail.ForEach(voucherMapping =>
                    //{
                    //    UpdateInventoryReport(voucherMapping.ProductId, voucherMapping.LotNoId.Value, inventoryReceivingVoucher.WarehouseId, parameter.UserId, inventoryReceivingVoucher.InventoryReceivingVoucherDate, voucherMapping.QuantityActual, 0, 0, 0, 0, 0, 0, 0, 0);
                    //});

                    #endregion

                    transaction.Commit();

                    return new SuaPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = "Success"
                    };
                }
            }
            catch (Exception e)
            {
                return new SuaPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public KiemTraKhaDungPhieuNhapKhoResult KiemTraKhaDungPhieuNhapKho(KiemTraKhaDungPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var systemType = context.SystemParameter.FirstOrDefault(x => x.SystemKey == "HIM")
        //            ?.SystemValueString;

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var listStatusPNK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
        //        var statusId_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "NHK")?.CategoryId;
        //        var statusId_SanSang_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "SAS")?.CategoryId;

        //        var statusTypeId_PXK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
        //            ?.CategoryTypeId;
        //        var listStatusPXK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PXK).ToList();
        //        var statusId_PXK = listStatusPXK.FirstOrDefault(x => x.CategoryCode == "NHK")?.CategoryId;
        //        var statusId_SanSang_PXK = listStatusPXK.FirstOrDefault(x => x.CategoryCode == "SAS")?.CategoryId;

        //        if (!String.IsNullOrEmpty(systemType))
        //        {
        //            if (systemType.Trim() == "3")
        //            {
        //                var listAllWarehouse = context.Warehouse.ToList();
        //                var listAllInventoryReceivingVoucher = context.InventoryReceivingVoucher.ToList();
        //                var listAllInventoryReceivingVoucherMapping =
        //                    context.InventoryReceivingVoucherMapping.ToList();
        //                var listAllInventoryDeliveryVoucher = context.InventoryDeliveryVoucher.ToList();
        //                var listAllInventoryDeliveryVoucherMapping =
        //                    context.InventoryDeliveryVoucherMapping.ToList();
        //                var listAllInventoryReport = context.InventoryReport.ToList();

        //                parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //                {
        //                    //Nếu vị trí của sản phẩm (Kho) không hợp lệ (Có kho con) thì Số giữ trước bằng 0
        //                    var warehouseChild = listAllWarehouse.FirstOrDefault(x => x.WarehouseParent == item.WarehouseId);

        //                    if (warehouseChild != null)
        //                    {
        //                        item.QuantityReservation = 0;
        //                    }
        //                    else
        //                    {
        //                        //Số tồn kho tối đa của sản phẩm
        //                        var inventoryReport = listAllInventoryReport.FirstOrDefault(x =>
        //                            x.WarehouseId == item.WarehouseId && x.ProductId == item.ProductId);

        //                        var quantityMaximum = inventoryReport != null
        //                            ? inventoryReport.QuantityMaximum
        //                            : null;

        //                        //Số tồn kho thực tế của sản phẩm
        //                        var quantityInStock = GetSoTonKhoThucTe(item.WarehouseId.Value,
        //                            item.ProductId.Value,
        //                            statusId_PNK.Value, statusId_PXK.Value,
        //                            listAllInventoryReceivingVoucher,
        //                            listAllInventoryReceivingVoucherMapping,
        //                            listAllInventoryDeliveryVoucher,
        //                            listAllInventoryDeliveryVoucherMapping,
        //                            listAllInventoryReport);

        //                        #region Số giữ trước của sản phẩm trên phiếu nhập kho

        //                        var listIdPhieuNK = listAllInventoryReceivingVoucher
        //                            .Where(x => x.StatusId == statusId_SanSang_PNK && x.InventoryReceivingVoucherId !=
        //                                        parameter.InventoryReceivingVoucherId)
        //                            .Select(y => y.InventoryReceivingVoucherId).ToList();

        //                        var quantityReservation_NK = listAllInventoryReceivingVoucherMapping
        //                            .Where(x => listIdPhieuNK.Contains(x.InventoryReceivingVoucherId) &&
        //                                        x.ProductId == item.ProductId).Sum(s => s.QuantityReservation);

        //                        #endregion

        //                        #region Số giữ trước của sản phẩm trên phiếu xuất kho

        //                        var listIdPhieuXK = listAllInventoryDeliveryVoucher
        //                            .Where(x => x.StatusId == statusId_SanSang_PXK)
        //                            .Select(y => y.InventoryDeliveryVoucherId).ToList();

        //                        var quantityReservation_XK = listAllInventoryDeliveryVoucherMapping
        //                            .Where(x => listIdPhieuXK.Contains(x.InventoryDeliveryVoucherId) &&
        //                                        x.ProductId == item.ProductId).Sum(s => s.QuantityReservation);

        //                        #endregion

        //                        /*
        //                         * Số tồn kho kinh doanh của sản phẩm = Số tồn kho thực tế +
        //                         *                                      Số giữ trước của sản phẩm trên phiếu nhập kho -
        //                         *                                      Số giữ trước của sản phẩm trên phiếu xuất kho
        //                         */
        //                        var so_ton_kho_kinh_doanh =
        //                            quantityInStock + quantityReservation_NK - quantityReservation_XK;

        //                        #region Số giữ trước

        //                        //Nếu không khai báo tồn kho tối đa thì Số giữ trước = Số cần nhập
        //                        if (quantityMaximum == null)
        //                        {
        //                            item.QuantityReservation = item.QuantityRequest;
        //                        }
        //                        //Ngược lại nếu có khai báo số tồn kho tối đa
        //                        else
        //                        {
        //                            decimal so_B = 0;
        //                            so_B = quantityMaximum.Value - so_ton_kho_kinh_doanh;

        //                            if (so_B >= item.QuantityRequest)
        //                            {
        //                                item.QuantityReservation = item.QuantityRequest;
        //                            }
        //                            else if (so_B >= 0 && so_B < item.QuantityRequest)
        //                            {
        //                                item.QuantityReservation = so_B;
        //                            }
        //                            else if (so_B < 0)
        //                            {
        //                                item.QuantityReservation = 0;
        //                            }
        //                        }

        //                        #endregion
        //                    }
        //                });
        //            }
        //            else
        //            {
        //                parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //                {
        //                    item.QuantityReservation = item.QuantityRequest;
        //                });
        //            }
        //        }

        //        #region Lưu list sản phẩm

        //        var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

        //        var listOldSanPham = context.InventoryReceivingVoucherMapping.Where(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).ToList();

        //        context.InventoryReceivingVoucherMapping.RemoveRange(listOldSanPham);

        //        var status = listStatusPNK.FirstOrDefault(x => x.CategoryId == inventoryReceivingVoucher.StatusId);

        //        var listNewSanPham = new List<InventoryReceivingVoucherMapping>();
        //        parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //        {
        //            var newSanPham = new InventoryReceivingVoucherMapping();
        //            newSanPham.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //            newSanPham.InventoryReceivingVoucherId = parameter.InventoryReceivingVoucherId;
        //            newSanPham.ObjectId = item.ObjectId;
        //            newSanPham.ProductId = item.ProductId.Value;
        //            newSanPham.QuantityRequest = item.QuantityRequest;
        //            newSanPham.QuantityActual = item.QuantityActual;
        //            newSanPham.QuantitySerial = 0;
        //            newSanPham.PriceProduct = item.PriceProduct;
        //            newSanPham.WarehouseId = item.WarehouseId.Value;
        //            newSanPham.Description = item.Description;
        //            newSanPham.Active = true;
        //            newSanPham.CreatedDate = DateTime.Now;
        //            newSanPham.CreatedById = parameter.UserId;
        //            newSanPham.QuantityReservation = item.QuantityReservation;
        //            newSanPham.PriceAverage = item.PriceAverage;
        //            newSanPham.ObjectDetailId = item.ObjectDetailId;

        //            listNewSanPham.Add(newSanPham);
        //        });

        //        context.InventoryReceivingVoucherMapping.AddRange(listNewSanPham);

        //        if (status.CategoryCode == "CHO")
        //        {
        //            //Nếu có ít nhất 1 sản phẩm có Số giữ trước > 0 thì chuyển trạng thái phiếu nhập kho -> Sẵn sàng
        //            var check = false;
        //            parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //            {
        //                if (item.QuantityReservation > 0)
        //                {
        //                    check = true;
        //                }
        //            });

        //            if (check == true)
        //            {
        //                inventoryReceivingVoucher.StatusId = statusId_SanSang_PNK.Value;
        //                context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);
        //            }
        //        }

        //        context.SaveChanges();

        //        #endregion

        //        return new KiemTraKhaDungPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            ListSanPhamPhieuNhapKho = parameter.ListSanPhamPhieuNhapKho
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new KiemTraKhaDungPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public DanhDauCanLamPhieuNhapKhoResult DanhDauCanLamPhieuNhapKho(DanhDauCanLamPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

        //        if (inventoryReceivingVoucher == null)
        //        {
        //            return new DanhDauCanLamPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
        //            };
        //        }

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var listStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
        //        var statusId_NHAP_PNK = listStatus.FirstOrDefault(x => x.CategoryCode == "NHA")?.CategoryId;
        //        var statusId_SS_PNK = listStatus.FirstOrDefault(x => x.CategoryCode == "SAS")?.CategoryId;
        //        var statusId_CHO_PNK = listStatus.FirstOrDefault(x => x.CategoryCode == "CHO")?.CategoryId;

        //        var status = listStatus.FirstOrDefault(x => x.CategoryId == inventoryReceivingVoucher.StatusId);

        //        if (inventoryReceivingVoucher.StatusId != statusId_NHAP_PNK)
        //        {
        //            return new DanhDauCanLamPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Không thể đánh dấu cần làm với phiếu nhập kho có trạng thái " + status.CategoryName
        //            };
        //        }

        //        if (parameter.Check)
        //        {
        //            inventoryReceivingVoucher.StatusId = statusId_SS_PNK.Value;
        //        }
        //        else
        //        {
        //            inventoryReceivingVoucher.StatusId = statusId_CHO_PNK.Value;
        //        }

        //        context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);
        //        context.SaveChanges();

        //        return new DanhDauCanLamPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success"
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new DanhDauCanLamPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public NhanBanPhieuNhapKhoResult NhanBanPhieuNhapKho(NhanBanPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
        //        var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

        //        var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

        //        if (inventoryReceivingVoucher == null)
        //        {
        //            return new NhanBanPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
        //            };
        //        }

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var listStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
        //        var statusId_NHAP_PNK = listStatus.FirstOrDefault(x => x.CategoryCode == "NHA")?.CategoryId;
        //        var statusId_HUY_PNK = listStatus.FirstOrDefault(x => x.CategoryCode == "HUY")?.CategoryId;

        //        var status = listStatus.FirstOrDefault(x => x.CategoryId == inventoryReceivingVoucher.StatusId);

        //        //Không được nhân bản phiếu nhập kho có trạng thái hủy
        //        if (inventoryReceivingVoucher.StatusId == statusId_HUY_PNK)
        //        {
        //            return new NhanBanPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Không thể nhân bản phiếu nhập kho có trạng thái " + status.CategoryName
        //            };
        //        }

        //        #region Lấy mã phiếu nhập kho

        //        var Code = "";
        //        var datenow = DateTime.Now;
        //        string year = datenow.Year.ToString().Substring(datenow.Year.ToString().Length - 2, 2);
        //        string month = datenow.Month < 10 ? "0" + datenow.Month.ToString() : datenow.Month.ToString();
        //        string day = datenow.Day < 10 ? "0" + datenow.Day.ToString() : datenow.Day.ToString();

        //        var listCodeToDay = context.InventoryReceivingVoucher.Where(c =>
        //            Convert.ToDateTime(c.CreatedDate).Day == datenow.Day &&
        //            Convert.ToDateTime(c.CreatedDate).Month == datenow.Month &&
        //            Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Select(y => new
        //            {
        //                InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode
        //            }).ToList();

        //        if (listCodeToDay.Count == 0)
        //        {

        //            Code = "PN-" + year + month + day + "0001";
        //        }
        //        else
        //        {
        //            var listNumber = new List<int>();
        //            listCodeToDay.ForEach(item =>
        //            {
        //                var stringNumber = item.InventoryReceivingVoucherCode.Substring(9);
        //                var number = Int32.Parse(stringNumber);
        //                listNumber.Add(number);
        //            });

        //            var maxNumber = listNumber.OrderByDescending(x => x).FirstOrDefault();
        //            var newNumber = maxNumber + 1;

        //            if (newNumber > 9999)
        //            {
        //                Code = "PN-" + year + month + day + newNumber;
        //            }
        //            else
        //            {
        //                Code = "PN-" + year + month + day + newNumber.ToString("D4");
        //            }
        //        }

        //        //Kiểm tra mã nếu trùng thì báo lỗi
        //        var existCode =
        //            context.InventoryReceivingVoucher.FirstOrDefault(x => x.InventoryReceivingVoucherCode == Code);

        //        if (existCode != null)
        //        {
        //            return new NhanBanPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Nhân bản thất bại, mã phiếu nhập kho mới đã tồn tại"
        //            };
        //        }

        //        #endregion

        //        var newPhieuNhapKho = new InventoryReceivingVoucher();
        //        newPhieuNhapKho.InventoryReceivingVoucherId = Guid.NewGuid();
        //        newPhieuNhapKho.InventoryReceivingVoucherCode = Code;
        //        newPhieuNhapKho.StatusId = statusId_NHAP_PNK.Value;
        //        newPhieuNhapKho.InventoryReceivingVoucherType = inventoryReceivingVoucher.InventoryReceivingVoucherType;
        //        newPhieuNhapKho.WarehouseId = inventoryReceivingVoucher.WarehouseId;
        //        newPhieuNhapKho.ShiperName = inventoryReceivingVoucher.ShiperName;
        //        //newPhieuNhapKho.Storekeeper = inventoryReceivingVoucher.Storekeeper;
        //        newPhieuNhapKho.InventoryReceivingVoucherDate = inventoryReceivingVoucher.InventoryReceivingVoucherDate;
        //        newPhieuNhapKho.InventoryReceivingVoucherTime = inventoryReceivingVoucher.InventoryReceivingVoucherTime;
        //        //newPhieuNhapKho.LicenseNumber = inventoryReceivingVoucher.LicenseNumber;
        //        newPhieuNhapKho.Active = inventoryReceivingVoucher.Active;
        //        newPhieuNhapKho.CreatedDate = DateTime.Now;
        //        newPhieuNhapKho.CreatedById = parameter.UserId;
        //        //newPhieuNhapKho.ExpectedDate = inventoryReceivingVoucher.ExpectedDate;
        //        newPhieuNhapKho.Description = inventoryReceivingVoucher.Description;
        //        newPhieuNhapKho.Note = inventoryReceivingVoucher.Note;
        //        //newPhieuNhapKho.PartnersId = inventoryReceivingVoucher.PartnersId;

        //        context.InventoryReceivingVoucher.Add(newPhieuNhapKho);

        //        var listOldSanPham = context.InventoryReceivingVoucherMapping
        //            .Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).ToList();

        //        var listNewSanPham = new List<InventoryReceivingVoucherMapping>();
        //        listOldSanPham.ForEach(item =>
        //        {
        //            var sanPham = new InventoryReceivingVoucherMapping();
        //            sanPham.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //            sanPham.InventoryReceivingVoucherId = newPhieuNhapKho.InventoryReceivingVoucherId;
        //            sanPham.ObjectId = item.ObjectId;
        //            sanPham.ProductId = item.ProductId;
        //            sanPham.QuantityRequest = item.QuantityRequest;
        //            sanPham.QuantityActual = 0;
        //            sanPham.QuantitySerial = item.QuantitySerial;
        //            sanPham.PriceProduct = item.PriceProduct;
        //            sanPham.WarehouseId = item.WarehouseId;
        //            sanPham.Description = item.Description;
        //            sanPham.Active = true;
        //            sanPham.CreatedDate = DateTime.Now;
        //            sanPham.CreatedById = parameter.UserId;
        //            sanPham.QuantityReservation = 0;
        //            sanPham.PriceAverage = false;
        //            sanPham.ObjectDetailId = item.ObjectDetailId;

        //            listNewSanPham.Add(sanPham);
        //        });

        //        context.InventoryReceivingVoucherMapping.AddRange(listNewSanPham);

        //        #region Thêm vào Dòng thời gian

        //        var note = new Note();
        //        note.NoteId = Guid.NewGuid();
        //        note.Description = employee.EmployeeName.Trim() + " đã tạo phiếu nhập kho";
        //        note.Type = "NEW";
        //        note.ObjectId = newPhieuNhapKho.InventoryReceivingVoucherId;
        //        note.ObjectType = "PNK";
        //        note.Active = true;
        //        note.NoteTitle = "Đã tạo phiếu nhập kho";
        //        note.CreatedDate = DateTime.Now;
        //        note.CreatedById = parameter.UserId;

        //        context.Note.Add(note);

        //        #endregion

        //        context.SaveChanges();

        //        return new NhanBanPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            InventoryReceivingVoucherId = newPhieuNhapKho.InventoryReceivingVoucherId
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new NhanBanPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public XoaPhieuNhapKhoResult XoaPhieuNhapKho(XoaPhieuNhapKhoParameter parameter)
        {
            try
            {
                var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
                    x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

                if (inventoryReceivingVoucher == null)
                {
                    return new XoaPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
                    };
                }

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var status_NHAP_PNK = context.Category
                    .FirstOrDefault(x => x.CategoryCode == "NHA" && x.CategoryTypeId == statusTypeId_PNK);

                if (inventoryReceivingVoucher.StatusId != status_NHAP_PNK?.CategoryId)
                {
                    return new XoaPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không thể xóa phiếu nhập kho ở trạng thái khác " + status_NHAP_PNK?.CategoryName
                    };
                }

                context.InventoryReceivingVoucher.Remove(inventoryReceivingVoucher);

                var listSanPham = context.InventoryReceivingVoucherMapping
                    .Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).ToList();

                context.InventoryReceivingVoucherMapping.RemoveRange(listSanPham);
                context.SaveChanges();

                return new XoaPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new XoaPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public HuyPhieuNhapKhoResult HuyPhieuNhapKho(HuyPhieuNhapKhoParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
                    x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

                if (inventoryReceivingVoucher == null)
                {
                    return new HuyPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
                    };
                }

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var listStatus_PNK = context.Category
                    .Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                var status_NHAP_PNK = listStatus_PNK
                    .FirstOrDefault(x => x.CategoryCode == "NHA");

                var status_HUY_PNK = listStatus_PNK
                    .FirstOrDefault(x => x.CategoryCode == "HUY");

                var status = listStatus_PNK.FirstOrDefault(x => x.CategoryId == inventoryReceivingVoucher.StatusId);

                //Không được hủy phiếu nhập kho ở trạng thái nháp
                if (inventoryReceivingVoucher.StatusId == status_NHAP_PNK?.CategoryId)
                {
                    return new HuyPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không thể hủy Phiếu nhập kho ở trạng thái " + status?.CategoryName
                    };
                }

                #region Kiểm tra đã phát sinh phiếu xuất kho chưa?

                //Trạng thái của Phiếu xuất kho
                var statusPhieuXuatKhoType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX");
                var status_XuatKho_PXK = context.Category.FirstOrDefault(x =>
                    x.CategoryTypeId == statusPhieuXuatKhoType.CategoryTypeId && x.CategoryCode == "NHK");

                //Lấy list Phiếu xuất kho có trạng thái Đã xuất kho
                var listPhieuXuatKhoId = context.InventoryDeliveryVoucher
                    .Where(x => x.StatusId == status_XuatKho_PXK.CategoryId).Select(y => y.InventoryDeliveryVoucherId)
                    .ToList();

                //Lấy list ProductId của các phiếu xuất kho
                var listProductId = context.InventoryDeliveryVoucherMapping
                    .Where(x => listPhieuXuatKhoId.Contains(x.InventoryDeliveryVoucherId)).Select(y => y.ProductId)
                    .Distinct().ToList();

                //Nếu trong Phiếu xuất kho hiện tại có ít nhất 1 sản phẩm đã xuất kho thì không có Hủy phiếu
                var listCurrentProductId = context.InventoryReceivingVoucherMapping
                    .Where(x => x.InventoryReceivingVoucherId == inventoryReceivingVoucher.InventoryReceivingVoucherId)
                    .Select(y => y.ProductId).Distinct().ToList();

                var productExists = false;
                listCurrentProductId.ForEach(item =>
                {
                    var product = listProductId.FirstOrDefault(x => x == item);

                    if (product != Guid.Empty)
                    {
                        productExists = true;
                    }
                });

                if (productExists)
                {
                    return new HuyPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không thể hủy phiếu vì tồn tại sản phẩm đã xuất kho"
                    };
                }

                #endregion

                #region Xóa trong Sổ kho

                var listSoKho = context.SoKho.Where(x =>
                    x.LoaiPhieu == 1 && x.PhieuId == inventoryReceivingVoucher.InventoryReceivingVoucherId).ToList();
                context.SoKho.RemoveRange(listSoKho);

                #endregion

                inventoryReceivingVoucher.StatusId = status_HUY_PNK.CategoryId;
                context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);

                #region Thêm vào Dòng thời gian

                var note = new Note();
                note.NoteId = Guid.NewGuid();
                note.Description = employee.EmployeeName.Trim() + " đã Hủy phiếu nhập kho";
                note.Type = "ADD";
                note.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
                note.ObjectType = "PNK";
                note.Active = true;
                note.NoteTitle = "Đã hủy phiếu nhập kho";
                note.CreatedDate = DateTime.Now;
                note.CreatedById = parameter.UserId;

                context.Note.Add(note);

                #endregion

                context.SaveChanges();

                return new HuyPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new HuyPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public KhongGiuPhanPhieuNhapKhoResult KhongGiuPhanPhieuNhapKho(KhongGiuPhanPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var listStatusPNK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
        //        var statusId_SanSang_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "SAS")?.CategoryId;
        //        var statusId_Cho_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "CHO")?.CategoryId;

        //        var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

        //        //Nếu phiếu nhập kho có trạng thái Sẵn sàng thì chuyển sang trạng thái Chờ nhập kho
        //        if (inventoryReceivingVoucher.StatusId == statusId_SanSang_PNK)
        //        {
        //            inventoryReceivingVoucher.StatusId = statusId_Cho_PNK.Value;
        //            context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);
        //        }
        //        else
        //        {
        //            var listOldSanPham = context.InventoryReceivingVoucherMapping.Where(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).ToList();

        //            context.InventoryReceivingVoucherMapping.RemoveRange(listOldSanPham);

        //            var listNewSanPham = new List<InventoryReceivingVoucherMapping>();
        //            parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //            {
        //                var newSanPham = new InventoryReceivingVoucherMapping();
        //                newSanPham.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //                newSanPham.InventoryReceivingVoucherId = parameter.InventoryReceivingVoucherId;
        //                newSanPham.ObjectId = item.ObjectId;
        //                newSanPham.ProductId = item.ProductId.Value;
        //                newSanPham.QuantityRequest = item.QuantityRequest;
        //                newSanPham.QuantityActual = item.QuantityActual;
        //                newSanPham.QuantitySerial = 0;
        //                newSanPham.PriceProduct = item.PriceProduct;
        //                newSanPham.WarehouseId = item.WarehouseId.Value;
        //                newSanPham.Description = item.Description;
        //                newSanPham.Active = true;
        //                newSanPham.CreatedDate = DateTime.Now;
        //                newSanPham.CreatedById = parameter.UserId;
        //                newSanPham.QuantityReservation = 0;
        //                newSanPham.PriceAverage = item.PriceAverage;
        //                newSanPham.ObjectDetailId = item.ObjectDetailId;

        //                listNewSanPham.Add(newSanPham);
        //            });

        //            context.InventoryReceivingVoucherMapping.AddRange(listNewSanPham);
        //        }

        //        context.SaveChanges();

        //        return new KhongGiuPhanPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success"
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new KhongGiuPhanPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public KiemTraNhapKhoResult KiemTraNhapKho(KiemTraNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
        //        var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

        //        /*
        //         * mode = 1: Nhập kho thành công
        //         * mode = 2: Nhập kho thành công và hiển thị popup cảnh báo
        //         * mode = 3: Không nhập kho và hiển thị popup cảnh báo
        //         */
        //        int mode = 0;
        //        var listMaSanPhamKhongHopLe = new List<string>();

        //        var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

        //        if (inventoryReceivingVoucher == null)
        //        {
        //            return new KiemTraNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
        //            };
        //        }

        //        var systemType = context.SystemParameter.FirstOrDefault(x => x.SystemKey == "HIM")
        //            ?.SystemValueString;

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var listStatusPNK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
        //        var statusId_DNK_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "NHK")?.CategoryId;

        //        var statusTypeId_PXK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
        //            ?.CategoryTypeId;
        //        var listStatusPXK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PXK).ToList();
        //        var statusId_DXK_PXK = listStatusPXK.FirstOrDefault(x => x.CategoryCode == "NHK")?.CategoryId;

        //        #region Lọc ra các sản phẩm có Số lượng thực nhập = 0

        //        var listIdSanPhamKhongHopLe = parameter.ListSanPhamPhieuNhapKho.Where(x => x.QuantityActual == 0)
        //            .Select(y => y.InventoryReceivingVoucherMappingId).ToList();

        //        parameter.ListSanPhamPhieuNhapKho =
        //            parameter.ListSanPhamPhieuNhapKho.Where(x => x.QuantityActual > 0).ToList();

        //        #endregion

        //        #region Kiểm tra tồn kho tối đa của list sản phẩm

        //        var listAllInventoryReceivingVoucher = context.InventoryReceivingVoucher.ToList();
        //        var listAllInventoryReceivingVoucherMapping =
        //            context.InventoryReceivingVoucherMapping.ToList();
        //        var listAllInventoryDeliveryVoucher = context.InventoryDeliveryVoucher.ToList();
        //        var listAllInventoryDeliveryVoucherMapping =
        //            context.InventoryDeliveryVoucherMapping.ToList();
        //        var listAllInventoryReport = context.InventoryReport.ToList();

        //        var checkTonKhoToiDa = false;
        //        var listSanPhamCoTonKhoToiDa = new List<Guid?>();
        //        parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //        {
        //            var tonKhoToiDa = listAllInventoryReport.FirstOrDefault(x =>
        //                x.WarehouseId == item.WarehouseId && x.ProductId == item.ProductId);

        //            if (tonKhoToiDa != null)
        //            {
        //                checkTonKhoToiDa = true;
        //                listSanPhamCoTonKhoToiDa.Add(item.InventoryReceivingVoucherMappingId);
        //            }
        //        });

        //        //Nếu chưa có sản phẩm nào khai báo tồn kho tối đa
        //        if (!checkTonKhoToiDa)
        //        {
        //            mode = 1;
        //        }
        //        else
        //        {
        //            var vuotQuaTonKhoToiDa = false;
        //            parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //            {
        //                var sanPham =
        //                    listSanPhamCoTonKhoToiDa.FirstOrDefault(x => x == item.InventoryReceivingVoucherMappingId);

        //                if (sanPham != null && sanPham != Guid.Empty)
        //                {
        //                    //Số tồn kho thực tế của sản phẩm
        //                    var quantityInStock = GetSoTonKhoThucTe(item.WarehouseId.Value,
        //                        item.ProductId.Value,
        //                        statusId_DNK_PNK.Value, statusId_DXK_PXK.Value,
        //                        listAllInventoryReceivingVoucher,
        //                        listAllInventoryReceivingVoucherMapping,
        //                        listAllInventoryDeliveryVoucher,
        //                        listAllInventoryDeliveryVoucherMapping,
        //                        listAllInventoryReport);

        //                    var SoTonKhoToiDa = listAllInventoryReport.FirstOrDefault(x =>
        //                        x.WarehouseId == item.WarehouseId && x.ProductId == item.ProductId).QuantityMaximum;

        //                    if (quantityInStock + item.QuantityActual > SoTonKhoToiDa)
        //                    {
        //                        listMaSanPhamKhongHopLe.Add(item.ProductCode.Trim());
        //                        vuotQuaTonKhoToiDa = true;
        //                    }
        //                }
        //            });

        //            //Nếu có sản phẩm vượt quá số lượng tồn kho tối đa
        //            if (vuotQuaTonKhoToiDa)
        //            {
        //                if (systemType.Trim() == "1")
        //                {
        //                    mode = 1;
        //                }
        //                else if (systemType.Trim() == "2")
        //                {
        //                    mode = 2;
        //                }
        //                else if (systemType.Trim() == "3")
        //                {
        //                    mode = 3;
        //                }
        //            }
        //            //Nếu tất cả sản phẩm đều hợp lệ
        //            else
        //            {
        //                mode = 1;
        //            }
        //        }

        //        if (mode == 1 || mode == 2)
        //        {
        //            //Chuyển trạng thái phiếu nhập kho => Đã nhập kho
        //            inventoryReceivingVoucher.StatusId = statusId_DNK_PNK.Value;
        //            context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);

        //            //Xóa các sản phẩm có Số lượng thực nhập = 0;
        //            var listSanPhamKhongHopLe = context.InventoryReceivingVoucherMapping
        //                .Where(x => listIdSanPhamKhongHopLe.Contains(x.InventoryReceivingVoucherMappingId)).ToList();
        //            context.InventoryReceivingVoucherMapping.RemoveRange(listSanPhamKhongHopLe);

        //            #region Thêm vào Sổ kho

        //            var listSoKho = new List<SoKho>();
        //            parameter.ListSanPhamPhieuNhapKho.ForEach(item =>
        //            {
        //                var soKho = new SoKho();
        //                soKho.SoKhoId = Guid.NewGuid();
        //                soKho.LoaiPhieu = 1;
        //                soKho.PhieuId = item.InventoryReceivingVoucherId.Value;
        //                soKho.ChiTietPhieuId = item.InventoryReceivingVoucherMappingId.Value;
        //                soKho.ChiTietLoaiPhieu = inventoryReceivingVoucher.InventoryReceivingVoucherType;
        //                soKho.NgayChungTu = inventoryReceivingVoucher.InventoryReceivingVoucherDate;
        //                soKho.SoChungTu = inventoryReceivingVoucher.InventoryReceivingVoucherCode;
        //                soKho.ProductId = item.ProductId.Value;
        //                soKho.SoLuong = item.QuantityActual;
        //                soKho.Gia = item.PriceProduct;
        //                soKho.ThanhTien = item.QuantityActual * item.PriceProduct;
        //                //soKho.DoiTac = inventoryReceivingVoucher.PartnersId;
        //                soKho.WarehouseId = item.WarehouseId.Value;
        //                soKho.CheckGia = item.PriceAverage;
        //                soKho.CreatedDate = DateTime.Now;
        //                soKho.CreatedById = parameter.UserId;

        //                listSoKho.Add(soKho);
        //            });

        //            context.SoKho.AddRange(listSoKho);

        //            #endregion

        //            #region Thêm vào Dòng thời gian

        //            var note = new Note();
        //            note.NoteId = Guid.NewGuid();
        //            note.Description = employee.EmployeeName.Trim() + " đã Nhập kho cho phiếu nhập kho";
        //            note.Type = "ADD";
        //            note.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //            note.ObjectType = "PNK";
        //            note.Active = true;
        //            note.NoteTitle = "Đã nhập kho";
        //            note.CreatedDate = DateTime.Now;
        //            note.CreatedById = parameter.UserId;

        //            context.Note.Add(note);

        //            #endregion

        //            context.SaveChanges();
        //        }

        //        #endregion

        //        return new KiemTraNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            Mode = mode,
        //            ListMaSanPhamKhongHopLe = listMaSanPhamKhongHopLe
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new KiemTraNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public DatVeNhapPhieuNhapKhoResult DatVeNhapPhieuNhapKho(DatVeNhapPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
        //        var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

        //        var inventoryReceivingVoucher = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId);

        //        if (inventoryReceivingVoucher == null)
        //        {
        //            return new DatVeNhapPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
        //            };
        //        }

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var listStatusPNK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
        //        var statusId_HUY_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "HUY")?.CategoryId;
        //        var statusId_NHAP_PNK = listStatusPNK.FirstOrDefault(x => x.CategoryCode == "NHA")?.CategoryId;

        //        //Chỉ được đặt về nháp phiếu nhập kho có trạng thái Hủy
        //        if (inventoryReceivingVoucher.StatusId != statusId_HUY_PNK)
        //        {
        //            var status = listStatusPNK.FirstOrDefault(x => x.CategoryId == inventoryReceivingVoucher.StatusId);

        //            return new DatVeNhapPhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Không thể đặt về nháp Phiếu nhập kho có trạng thái " + status.CategoryName
        //            };
        //        }

        //        //Đổi trạng thái phiếu nhập kho -> Nháp
        //        inventoryReceivingVoucher.StatusId = statusId_NHAP_PNK.Value;
        //        context.InventoryReceivingVoucher.Update(inventoryReceivingVoucher);

        //        #region Thêm vào Dòng thời gian

        //        var note = new Note();
        //        note.NoteId = Guid.NewGuid();
        //        note.Description = employee.EmployeeName.Trim() + " đã chuyển trạng thái phiếu nhập kho sang Nháp";
        //        note.Type = "ADD";
        //        note.ObjectId = inventoryReceivingVoucher.InventoryReceivingVoucherId;
        //        note.ObjectType = "PNK";
        //        note.Active = true;
        //        note.NoteTitle = "Đã đặt về nháp phiếu nhập kho";
        //        note.CreatedDate = DateTime.Now;
        //        note.CreatedById = parameter.UserId;

        //        context.Note.Add(note);

        //        #endregion

        //        context.SaveChanges();

        //        return new DatVeNhapPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success"
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new DatVeNhapPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public GetListProductPhieuNhapKhoResult GetListProductPhieuNhapKho(GetListProductPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listProduct = new List<ProductEntityModel>();

                listProduct = context.Product.Where(x => x.Active == true).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId,
                    ProductUnitName = ""
                }).Where(x => x.ProductType == parameter.ProductType).OrderBy(z => z.ProductName).ToList();

                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct =
                    context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();

                listProduct.ForEach(item =>
                {
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId);

                    if (unit != null)
                    {
                        item.ProductUnitName = unit.CategoryName ?? "";
                    }
                });

                return new GetListProductPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListProduct = listProduct
                };
            }
            catch (Exception e)
            {
                return new GetListProductPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetMasterDataListPhieuNhapKhoResult GetMasterDataListPhieuNhapKho(GetMasterDataListPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listVendor = new List<VendorEntityModel>();
                var listProduct = new List<ProductEntityModel>();

                #region Lấy list sản phẩm

                listProduct = context.Product.Where(x => x.Active == true && x.ProductType == parameter.ProductType).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductCode = y.ProductCode,
                    ProductName = y.ProductName,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim()
                }).OrderBy(z => z.ProductName).ToList();

                #endregion

                #region Lấy nhà cung cấp
                var listVendorEntity = context.Vendor.Where(w => w.Active == true).ToList();

                listVendorEntity?.ForEach(e =>
                {
                    listVendor.Add(new VendorEntityModel
                    {
                        VendorId = e.VendorId,
                        VendorName = e.VendorName
                    });
                });
                #endregion

                return new GetMasterDataListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListProduct = listProduct,
                    ListVendor = listVendor,
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public SearchListPhieuNhapKhoResult SearchListPhieuNhapKho(SearchListPhieuNhapKhoParameter parameter)
        {
            try
            {


                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    //ListPhieuNhapKho = listPhieuNhapKho
                };
            }
            catch (Exception e)
            {
                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        private List<Guid> getWarehouseParentWarehouse(List<Warehouse> listAllWarehouse, Guid WarehouseParent, List<Guid> listResult)
        {
            var parent = listAllWarehouse.FirstOrDefault(x => x.WarehouseId == WarehouseParent);

            if (parent != null)
            {
                listResult.Add(parent.WarehouseId);

                if (parent.WarehouseParent != null)
                {
                    getWarehouseParentWarehouse(listAllWarehouse, parent.WarehouseParent.Value, listResult);
                }
            }

            return listResult;
        }

        /*Model để convert tên các kho con*/
        public class WarehouseTemporaryModel
        {
            public Guid WarehouseId { get; set; }
            public Guid? WarehouseParent { get; set; }
            public string WarehouseName { get; set; }
            public List<Guid> ListWarehouseParent { get; set; } //List các id kho cha
            public Guid? FirstParentId { get; set; } //Dùng để group các kho con theo kho cha gốc
        }

        private List<Guid?> getOrganizationChildrenId(List<Organization> organizationList, Guid? id, List<Guid?> list)
        {
            var organizations = organizationList.Where(o => o.ParentId == id).ToList();
            organizations.ForEach(item =>
            {
                list.Add(item.OrganizationId);
                getOrganizationChildrenId(organizationList, item.OrganizationId, list);
            });

            return list;
        }

        private List<Guid?> getListWarehouseChildrenId(List<Warehouse> ListWarehouse, Guid? id, List<Guid?> list)
        {
            var _listWarehouse = ListWarehouse.Where(o => o.WarehouseParent == id).ToList();
            _listWarehouse.ForEach(item =>
            {
                list.Add(item.WarehouseId);
                getListWarehouseChildrenId(ListWarehouse, item.WarehouseId, list);
            });

            return list;
        }

        private List<ProductCategoryEntityModel> GetListChildProductCategory(List<ProductCategoryEntityModel> listAll,
            List<ProductCategoryEntityModel> listParent, List<ProductCategoryEntityModel> result)
        {
            listParent.ForEach(item =>
            {
                var hasValue = result.FirstOrDefault(x => x.ProductCategoryId == item.ProductCategoryId);
                if (hasValue == null)
                {
                    result.Add(item);
                }

                var listChild = listAll.Where(x => x.ParentId == item.ProductCategoryId).ToList();

                listChild.ForEach(child =>
                {
                    var hasChildValue = result.FirstOrDefault(x => x.ProductCategoryId == child.ProductCategoryId);
                    if (hasChildValue == null)
                    {
                        result.Add(child);
                    }
                    GetListChildProductCategory(listAll, listChild, result);
                });
            });

            return result;
        }

        //private List<Guid> GetListWarehouseChild(List<Warehouse> listWarehouse, Guid warehouseId, List<Guid> listResult)
        //{
        //    var listWarehouseChild = listWarehouse.Where(x => x.WarehouseParent == warehouseId).ToList();

        //    listWarehouseChild.ForEach(item =>
        //    {
        //        var hasChild = listWarehouse.FirstOrDefault(x => x.WarehouseParent == item.WarehouseId);

        //        if (hasChild == null)
        //        {
        //            var hasValue = listResult.FirstOrDefault(x => x == item.WarehouseId);

        //            if (hasValue == Guid.Empty)
        //            {
        //                listResult.Add(item.WarehouseId);
        //            }
        //        }
        //        else
        //        {
        //            GetListWarehouseChild(listWarehouse, item.WarehouseId, listResult);
        //        }
        //    });

        //    return listResult;
        //}

        //private List<InStockEntityModel> GetListResult(List<Guid> ListWarehouseId, DateTime FromDate,
        //    List<Product> ListAllProduct, Guid? ProductCategoryId, string ProductNameCode, List<Category> ListDVT,
        //    List<InventoryReport> ListAllInventoryReport)
        //{
        //    var listResult = new List<InStockEntityModel>();

        //    #region Lấy tất cả phiếu nhập kho theo điều kiện
        //    /*
        //     * - Kho được chọn (WarehouseId)
        //     * - Có trạng thái Nhập kho
        //     * - Có thời gian nhập kho bé hơn thời gian được chọn (fromDate)
        //     */
        //    var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //        ?.CategoryTypeId;
        //    var statusId_PNK = context.Category
        //        .FirstOrDefault(x => x.CategoryCode == "NHK" && x.CategoryTypeId == statusTypeId_PNK)
        //        ?.CategoryId;
        //    var listInventoryReceivingVoucher = context.InventoryReceivingVoucher
        //        .Where(x => x.Active && x.StatusId == statusId_PNK && x.InventoryReceivingVoucherDate != null &&
        //                    x.InventoryReceivingVoucherDate.Date <= FromDate.Date).ToList();

        //    #region Lấy tất cả sản phẩm đã nhập kho theo các phiếu nhập kho bên trên

        //    var listInventoryReceivingVoucherId = listInventoryReceivingVoucher
        //        .Select(y => y.InventoryReceivingVoucherId).ToList();

        //    var listProductReceivingVoucher = context.InventoryReceivingVoucherMapping
        //        .Where(x => ListWarehouseId.Contains(x.WarehouseId) &&
        //                    listInventoryReceivingVoucherId.Contains(x.InventoryReceivingVoucherId)).ToList();

        //    #endregion

        //    #endregion

        //    #region Lấy tất cả phiếu xuất kho theo điều kiện
        //    /*
        //     * - Kho được chọn (WarehouseId)
        //     * - Có trạng thái Xuất kho
        //     * - Có thời gian xuất kho bé hơn thời gian được chọn (fromDate)
        //     */
        //    var statusTypeId_PXK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
        //        ?.CategoryTypeId;
        //    var statusId_PXK = context.Category
        //        .FirstOrDefault(x => x.CategoryCode == "NHK" && x.CategoryTypeId == statusTypeId_PXK)
        //        ?.CategoryId;
        //    var listInventoryDeliveryVoucher = context.InventoryDeliveryVoucher
        //        .Where(x => x.Active && x.StatusId == statusId_PXK &&
        //                    (x.InventoryDeliveryVoucherDate != null &&
        //                     x.InventoryDeliveryVoucherDate.Value.Date <= FromDate.Date)).ToList();

        //    #region Lấy tất cả sản phẩm đã xuất kho theo các phiếu xuất kho bên trên

        //    var listInventoryDeliveryVoucherId = listInventoryDeliveryVoucher
        //        .Select(y => y.InventoryDeliveryVoucherId).ToList();

        //    var listProductDeliveryVoucher = context.InventoryDeliveryVoucherMapping
        //        .Where(x => ListWarehouseId.Contains(x.WarehouseId) &&
        //                    listInventoryDeliveryVoucherId.Contains(x.InventoryDeliveryVoucherId)).ToList();

        //    #endregion

        //    #endregion

        //    //Lấy list danh sách sản phẩm dịch vụ
        //    var listProduct = ListAllProduct.Where(x =>
        //            (ProductCategoryId == null ||
        //             x.ProductCategoryId == ProductCategoryId) &&
        //            (ProductNameCode.Trim() == "" || ProductNameCode == null ||
        //             x.ProductName.Contains(ProductNameCode.Trim()) ||
        //             x.ProductCode.Contains(ProductNameCode.Trim())))
        //        .ToList();

        //    var listProductId = listProduct.Select(y => y.ProductId).ToList();

        //    #region Lọc ra các sản cần lấy trong list sản phẩm Nhập kho 

        //    listProductReceivingVoucher = listProductReceivingVoucher
        //        .Where(x => listProductId.Contains(x.ProductId)).ToList();

        //    #endregion

        //    #region Lọc ra các sản cần lấy trong list sản phẩm Xuất kho

        //    listProductDeliveryVoucher = listProductDeliveryVoucher
        //        .Where(x => listProductId.Contains(x.ProductId)).ToList();

        //    #endregion

        //    if (listProduct.Count > 0)
        //    {
        //        listProduct.ForEach(_prod =>
        //        {
        //            var item = new InStockEntityModel();
        //            item.ProductId = _prod.ProductId;
        //            item.ProductCode = _prod.ProductCode?.Trim();
        //            item.ProductName = _prod.ProductName?.Trim();

        //            var dvt = ListDVT.FirstOrDefault(x => x.CategoryId == _prod.ProductUnitId)
        //                ?.CategoryName;

        //            item.ProductUnitName = dvt ?? "";
        //            item.QuantityInStock = 0;
        //            item.QuantityInStockMaximum = 0;
        //            item.ProductPrice = 0;
        //            item.WareHouseId = Guid.Empty;
        //            item.WareHouseName = "";
        //            item.lstSerial = new List<Serial>();

        //            #region Số tồn kho ban đầu

        //            //Kiểm tra trong bảng InventoryReport
        //            var quantityInitialReport = ListAllInventoryReport.Where(x =>
        //                    ListWarehouseId.Contains(x.WarehouseId) && x.ProductId == _prod.ProductId)
        //                .Sum(y => y.StartQuantity);

        //            var quantityInitial = quantityInitialReport;

        //            #endregion

        //            #region Số tồn kho tối đa

        //            var quantityMaximumReport = ListAllInventoryReport.Where(x =>
        //                    ListWarehouseId.Contains(x.WarehouseId) && x.ProductId == _prod.ProductId)
        //                .Sum(y => y.QuantityMaximum);

        //            var quantityMaximum = quantityMaximumReport != null ? (quantityMaximumReport ?? 0) : 0;

        //            #endregion

        //            //Số lượng nhập kho của sản phẩm
        //            decimal quantityReceivingInStock = listProductReceivingVoucher
        //                .Where(x => x.ProductId == _prod.ProductId)
        //                .Sum(y => y.QuantityActual);

        //            //Số lượng xuất kho của sản phẩm
        //            decimal quantityDeliveryInStock = listProductDeliveryVoucher
        //                .Where(x => x.ProductId == _prod.ProductId)
        //                .Sum(y => y.QuantityActual);

        //            //Số tồn kho = Số tồn kho ban đầu + Số lượng nhập kho - Số lượng xuất kho
        //            item.QuantityInStock =
        //                quantityInitial + quantityReceivingInStock - quantityDeliveryInStock;
        //            item.QuantityDeliveryInStock = quantityDeliveryInStock;
        //            item.QuantityReceivingInStock = quantityReceivingInStock;
        //            item.QuantityInitial = quantityInitial;

        //            // Số tồn kho tối đa
        //            item.QuantityInStockMaximum = quantityMaximum;

        //            listResult.Add(item);
        //        });
        //    }

        //    return listResult;
        //}

        //private decimal GetSoTonKhoThucTe(Guid WarehouseId, Guid ProductId,
        //    Guid StatusPNKId, Guid StatusPXKId,
        //    List<InventoryReceivingVoucher> ListAllInventoryReceivingVoucher,
        //    List<InventoryReceivingVoucherMapping> ListAllInventoryReceivingVoucherMapping,
        //    List<InventoryDeliveryVoucher> ListAllInventoryDeliveryVoucher,
        //    List<InventoryDeliveryVoucherMapping> ListAllInventoryDeliveryVoucherMapping,
        //    List<InventoryReport> ListAllInventoryReport)
        //{
        //    decimal result = 0;

        //    #region Lấy tất cả phiếu nhập kho theo điều kiện
        //    /*
        //     * - Kho được chọn (WarehouseId)
        //     * - Có trạng thái Nhập kho
        //     * - Có thời gian nhập kho bé hơn thời gian được chọn (fromDate)
        //     */

        //    var listInventoryReceivingVoucher = ListAllInventoryReceivingVoucher
        //        .Where(x => x.Active && x.StatusId == StatusPNKId).ToList();

        //    #region Lấy tất cả sản phẩm đã nhập kho theo các phiếu nhập kho bên trên

        //    var listInventoryReceivingVoucherId = listInventoryReceivingVoucher
        //        .Select(y => y.InventoryReceivingVoucherId).ToList();

        //    var listProductReceivingVoucher = ListAllInventoryReceivingVoucherMapping
        //        .Where(x => x.WarehouseId == WarehouseId &&
        //                    listInventoryReceivingVoucherId.Contains(x.InventoryReceivingVoucherId)).ToList();

        //    #endregion

        //    #endregion

        //    #region Lấy tất cả phiếu xuất kho theo điều kiện
        //    /*
        //     * - Kho được chọn (WarehouseId)
        //     * - Có trạng thái Xuất kho
        //     * - Có thời gian xuất kho bé hơn thời gian được chọn (fromDate)
        //     */

        //    var listInventoryDeliveryVoucher = ListAllInventoryDeliveryVoucher
        //        .Where(x => x.Active && x.StatusId == StatusPXKId &&
        //                    x.InventoryDeliveryVoucherDate != null).ToList();

        //    #region Lấy tất cả sản phẩm đã xuất kho theo các phiếu xuất kho bên trên

        //    var listInventoryDeliveryVoucherId = listInventoryDeliveryVoucher
        //        .Select(y => y.InventoryDeliveryVoucherId).ToList();

        //    var listProductDeliveryVoucher = ListAllInventoryDeliveryVoucherMapping
        //        .Where(x => x.WarehouseId == WarehouseId &&
        //                    listInventoryDeliveryVoucherId.Contains(x.InventoryDeliveryVoucherId)).ToList();

        //    #endregion

        //    #endregion

        //    #region Số tồn kho ban đầu

        //    //Kiểm tra trong bảng InventoryReport
        //    var quantityInitialReport = ListAllInventoryReport.Where(x =>
        //            x.WarehouseId == WarehouseId && x.ProductId == ProductId)
        //        .Sum(y => y.StartQuantity);

        //    var quantityInitial = quantityInitialReport;

        //    #endregion

        //    #region Số tồn kho tối đa

        //    var quantityMaximumReport = ListAllInventoryReport.Where(x =>
        //            x.WarehouseId == WarehouseId && x.ProductId == ProductId)
        //        .Sum(y => y.QuantityMaximum);

        //    var quantityMaximum = quantityMaximumReport != null ? (quantityMaximumReport ?? 0) : 0;

        //    #endregion

        //    #region Số tồn kho thực tế

        //    //Số lượng nhập kho của sản phẩm
        //    decimal quantityReceivingInStock = listProductReceivingVoucher
        //        .Where(x => x.ProductId == ProductId)
        //        .Sum(y => y.QuantityActual);

        //    //Số lượng xuất kho của sản phẩm
        //    decimal quantityDeliveryInStock = listProductDeliveryVoucher
        //        .Where(x => x.ProductId == ProductId)
        //        .Sum(y => y.QuantityActual);

        //    //Số tồn kho = Số tồn kho ban đầu + Số lượng nhập kho - Số lượng xuất kho
        //    result = quantityInitial + quantityReceivingInStock - quantityDeliveryInStock;

        //    #endregion

        //    return result;
        //}
        public GetInventoryInfoTPResult GetInventoryInfoTP(GetInventoryInfoTPParameter parameter)
        {
            try
            {
                DateTime fromDate;
                DateTime toDate;

                if (parameter.Month != null)
                {
                    fromDate = new DateTime(parameter.Month.Value.Year, parameter.Month.Value.Month, 1);
                    toDate = fromDate.AddMonths(1).AddDays(-1);
                }
                else
                {
                    fromDate = parameter.FromNgay.Value;
                    toDate = parameter.ToNgay.Value;
                }

                var listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.ThanhPham && x.Active == true).ToList();
                var categories = context.Category.Where(ct => ct.Active == true).ToList();
                var lotno = context.LotNo.ToList();
                var inventory = context.InventoryReport.ToList();

                var listDataTongHop = new List<InventoryInfoTPEntityModel>();
                //var listInventoryInfoTPEntityModelDetail = new List<InventoryInfoTPEntityModel>();

                //Get all kho co loai la thanh pham
                var loaikho_id = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var khotp = context.Category.FirstOrDefault(x => x.CategoryCode == "KTP" && x.CategoryTypeId == loaikho_id)?.CategoryId;

                var listWareHouseId = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == khotp).Select(x => x.WarehouseId).ToList();

                listProduct.ForEach(item =>
                {
                    decimal tonhientai = 0;
                    decimal tonthangtruoc = 0;
                    decimal tonthangnay = 0;
                    decimal xuatthangnay = 0;
                    decimal sanxuatthangnay = 0;
                    decimal pending = 0;

                    //Lay so luong ton san pham trong tat ca cac kho cung loai
                    decimal tondauky = 0;
                    decimal nhapkho = 0;
                    decimal xuatkho = 0;
                    decimal toncuoiky = 0;
                    listWareHouseId.ForEach(khoid =>
                    {
                        var itemTonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date < fromDate.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= toDate.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                        // xuatthangnay += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate.Date && x.InventoryReportDate.Date <= toDate.Date)
                        //.Sum(x => x.QuantityDelivery);
                        // sanxuatthangnay += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate.Date && x.InventoryReportDate.Date <= toDate.Date)
                        // .Sum(x => x.QuantityReceiving);

                        if (itemTonDauKy != null)
                            tonthangtruoc += itemTonDauKy.StartQuantity;
                        if (itemTonCuoiKy != null)
                            tonthangnay += itemTonCuoiKy.StartQuantity;

                        //var itemTonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date == fromDate).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        //var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= toDate).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        //if (itemTonDauKy != null)
                        //    sanxuatthangnay += itemTonDauKy.StartQuantity + itemTonDauKy.QuantityReceiving;
                        //if (itemTonCuoiKy != null)
                        //    toncuoiky += (itemTonCuoiKy.StartQuantity + itemTonCuoiKy.QuantityReceiving - itemTonCuoiKy.QuantityDelivery);

                        sanxuatthangnay += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                       .Sum(x => x.ProductionNumber ?? 0);

                        xuatthangnay += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                        .Sum(x => x.QuantityDelivery);

                        pending += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                        .Sum(x => x.PendingReceiving);
                    });

                    var newInventoryInfoTp = new InventoryInfoTPEntityModel()
                    {
                        InventoryInfoTPEntityModelId = Guid.NewGuid(),
                        ProductId = item.ProductId,
                        ProductName = item.ProductName,
                        ProductCode = item.ProductCode,
                        TonThangTruoc = tonthangtruoc,
                        TonThangNay = tonthangnay,
                        SanXuatThangNay = sanxuatthangnay,
                        XuatDiThangNay = xuatthangnay,
                        MauTest = 0,
                        Pending = pending,
                    };

                    var listProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == newInventoryInfoTp.ProductId).ToList();
                    var ListLotnoTongHop = new List<InventoryInfoProductTPEntityModel>();
                    listProductLotNoMapping.ForEach(map =>
                    {
                        decimal tondauky_map = 0;
                        decimal nhapkho_map = 0;
                        decimal productionNumber_map = 0;
                        decimal xuatkho_map = 0;
                        decimal toncuoiky_map = 0;
                        decimal quantityNg_map = 0;
                        decimal quantityOk_map = 0;

                        listWareHouseId.ForEach(khoid =>
                        {
                            var itemTonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date < fromDate.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                            var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= toDate).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                            if (itemTonDauKy != null)
                                tondauky_map += itemTonDauKy.StartQuantity;
                            if (itemTonCuoiKy != null)
                                toncuoiky_map += itemTonCuoiKy.StartQuantity;

                            xuatkho_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                           .Sum(x => x.QuantityDelivery);
                            nhapkho_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                            .Sum(x => x.QuantityReceiving);

                            quantityNg_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                            .Sum(x => x.ReuseReceiving);

                            quantityOk_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                            .Sum(x => x.QuantityReceiving);

                            productionNumber_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                            .Sum(x => x.ProductionNumber ?? 0);
                        });

                        var itemMap = new InventoryInfoProductTPEntityModel();
                        itemMap.LotNoName = lotno.FirstOrDefault(x => x.LotNoId == map.LotNoId)?.LotNoName;
                        itemMap.Date = fromDate;
                        itemMap.StartInventory = tondauky_map;
                        itemMap.EndInventory = toncuoiky_map;
                        itemMap.QuantityDelivery = xuatkho_map;
                        itemMap.QuantityReceiving = nhapkho_map;
                        itemMap.QuantityOK = quantityOk_map;
                        itemMap.QuantityNG = quantityNg_map;
                        itemMap.ProductionNumber = productionNumber_map;

                        newInventoryInfoTp.ListInventoryInfoProductTPEntityModel.Add(itemMap);
                    });

                    listDataTongHop.Add(newInventoryInfoTp);
                });
                #region Header

                var listDataHeader = new List<List<DataHeaderModel>>();
                var listDataHeader2 = new List<List<DataHeaderModel>>();

                var listHeader1 = new List<DataHeaderModel>()
                        {
                            new DataHeaderModel()
                            {
                                ColumnKey = "boPhan",
                                ColumnValue = "Bộ phận",
                                Rowspan = 0,
                                Colspan = 0,
                                Width = "120px",
                            }
                        };

                var _dataHeader = new DataHeaderModel();
                _dataHeader.ColumnKey = "index_Cf" + 0;
                _dataHeader.ColumnValue = "CF";
                _dataHeader.Rowspan = 0;
                _dataHeader.Colspan = listProduct.Count;
                _dataHeader.Width = "240px";

                listHeader1.Add(_dataHeader);

                listDataHeader.Add(listHeader1);

                /* tr2 */
                var listHeader2 = new List<DataHeaderModel>()
                        {
                             new DataHeaderModel()
                                    {
                                        ColumnKey = "sanPham",
                                        ColumnValue = "Sản phẩm",
                                        Rowspan = 0,
                                        Colspan = 0,
                                        Width = "120px",
                                    }
                        };
                int _indexCa = 0;


                listProduct.ForEach(product =>
                {
                    _dataHeader = new DataHeaderModel();
                    _dataHeader.ColumnKey = product.ProductId.ToString();
                    _dataHeader.ColumnValue = product.ProductName;
                    _dataHeader.Rowspan = 0;
                    _dataHeader.Colspan = 0;
                    _dataHeader.Width = "120px";

                    listHeader2.Add(_dataHeader);

                });

                listDataHeader.Add(listHeader2);

                /* tr3 */
                var listHeader3 = new List<DataHeaderModel>()
                {
                     new DataHeaderModel()
                                    {
                                        ColumnKey = "tonkho",
                                        ColumnValue = "Tồn kho hiện tại",
                                        Rowspan = 0,
                                        Colspan = 0,
                                        Width = "120px",
                                    }
                };
                listProduct.ForEach(product =>
                    {

                        _dataHeader = new DataHeaderModel();
                        _dataHeader.ColumnKey = "key";
                        _dataHeader.ColumnValue = "10";
                        _dataHeader.Rowspan = 0;
                        _dataHeader.Colspan = 0;
                        _dataHeader.Width = "120px";

                        listHeader3.Add(_dataHeader);

                    });

                listDataHeader.Add(listHeader3);

                #endregion

                var listHeader21 = new List<DataHeaderModel>()
                    {
                        new DataHeaderModel()
                        {
                            ColumnKey = "ngay",
                            ColumnValue = "Ngày",
                            Rowspan = 2,
                            Colspan = 0,
                            Width = "40px",
                        }
                    };

                listProduct.ForEach(product =>
                {
                    _dataHeader = new DataHeaderModel();
                    _dataHeader.ColumnKey = "index_code" + _indexCa;
                    _dataHeader.ColumnValue = product.ProductName;
                    _dataHeader.Rowspan = 0;
                    _dataHeader.Colspan = 3;
                    _dataHeader.Width = "150px";

                    listHeader21.Add(_dataHeader);
                });

                listDataHeader2.Add(listHeader21);

                var listHeader22 = new List<DataHeaderModel>();
                listProduct.ForEach(product =>
                {
                    for (int i = 1; i <= 3; i++)
                    {
                        _dataHeader = new DataHeaderModel();
                        _dataHeader.ColumnKey = "key";
                        _dataHeader.ColumnValue = i == 1 ? "Số lượng đầu vào" : i == 2 ? "Số lượng xuất" : "Tồn kho";
                        _dataHeader.Rowspan = 0;
                        _dataHeader.Colspan = 0;
                        _dataHeader.Width = "50px";

                        listHeader22.Add(_dataHeader);
                    }
                });

                listDataHeader2.Add(listHeader22);


                var listData = new List<List<DataRowModel>>();
                if (parameter.Month == null) //Tab chi tiet bao cao
                {

                    for (var date = fromDate; date <= toDate; date = date.AddDays(1))
                    {
                        var listDataRow = new List<DataRowModel>();

                        var dataRow = new DataRowModel();
                        dataRow.ColumnKey = "ngay";
                        dataRow.ColumnValue = date.ToString("dd/MM/yyyy");
                        dataRow.Width = "40px";
                        dataRow.TextAlign = "center";
                        listDataRow.Add(dataRow);

                        int index = 0;
                        listProduct.ForEach(product =>
                        {
                            index++;
                            var dauvao = new DataRowModel();
                            dauvao.ColumnKey = "index_" + index;
                            dauvao.ColumnValue = "1";
                            dauvao.Width = "50px";
                            dauvao.TextAlign = "center";

                            listDataRow.Add(dauvao);

                            index++;
                            var xuat = new DataRowModel();
                            xuat.ColumnKey = "index_" + index;
                            xuat.ColumnValue = "2";
                            xuat.Width = "50px";
                            xuat.TextAlign = "center";

                            listDataRow.Add(xuat);

                            index++;
                            var tonkho = new DataRowModel();
                            tonkho.ColumnKey = "index_" + index;
                            tonkho.ColumnValue = "3";
                            tonkho.Width = "50px";
                            tonkho.TextAlign = "center";

                            listDataRow.Add(tonkho);
                        });

                        listData.Add(listDataRow);
                    }
                }

                return new GetInventoryInfoTPResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListDataTongHop = listDataTongHop,
                    ListData = listData,
                    ListDataHeader = listDataHeader,
                    ListDataHeader2 = listDataHeader2,
                };
            }
            catch (Exception e)
            {
                return new GetInventoryInfoTPResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetInventoryInfoResult GetInventoryInfo(GetInventoryInfoParameter parameter)
        {
            try
            {
                var categories = context.Category.Where(ct => ct.Active == true).ToList();
                var lotno = context.LotNo.ToList();
                var inventory = context.InventoryReport.ToList();
                var listInventoryInfoEntityModel = new List<InventoryInfoEntityModel>();

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var loaikhoId = new Guid();
                var listProduct = new List<Entities.Product>();
                if (parameter.WarehouseType == (int)WarehouseType.NVL)
                {
                    loaikhoId = context.Category.FirstOrDefault(x => x.CategoryCode == "NVL" && x.CategoryTypeId == categoryTypeId).CategoryId;
                    listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.NVL && x.Active == true).ToList();
                }
                else
                {
                    loaikhoId = context.Category.FirstOrDefault(x => x.CategoryCode == "CCDC" && x.CategoryTypeId == categoryTypeId).CategoryId;
                    listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.CCDC && x.Active == true).ToList();
                }

                var listWareHouseId = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == loaikhoId).Select(x => x.WarehouseId).ToList();

                var lstProductId = listProduct.Select(p => p.ProductId).ToList();

                // Get Phiếu nhập
                var inventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(ir => lstProductId.Contains(ir.ProductId)).ToList();
                var lstInventoryReceivingId = inventoryReceivingVoucherMapping.Select(irv => irv.InventoryReceivingVoucherId).ToList();
                var inventoryReceivingVoucher = context.InventoryReceivingVoucher.Where(ir => lstInventoryReceivingId.Contains(ir.InventoryReceivingVoucherId)).ToList();

                // Get Phiếu xuất
                var inventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(ir => lstProductId.Contains(ir.ProductId)).ToList();
                var lstInventoryDeliveryId = inventoryDeliveryVoucherMapping.Select(irv => irv.InventoryDeliveryVoucherId).ToList();
                var inventoryDeliveryVoucher = context.InventoryDeliveryVoucher.Where(ir => lstInventoryDeliveryId.Contains(ir.InventoryDeliveryVoucherId) && ir.InventoryDeliveryVoucherScreenType == (int)ScreenType.NVL).ToList();

                #region get Tháng kiểm kê
                var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
                var listAllWarehouse = context.Warehouse.ToList();
                var listAllChiTietDotKiemKe = context.DotKiemKeChiTiet.ToList();
                var listDotKiemKe = context.DotKiemKe.Where(x => x.TrangThaiId == 2 && x.ThangKiemKe < parameter.FromNgay).OrderByDescending(x => x.ThangKiemKe)
                    .Select(x => new DotKiemKeEntityModel
                    {
                        DotKiemKeId = x.DotKiemKeId,
                        WarehouseId = x.WarehouseId,
                        WarehouseName = listAllWarehouse.FirstOrDefault(y => y.WarehouseId == x.WarehouseId).WarehouseName,
                        TenDotKiemKe = "Tháng " + x.ThangKiemKe.Value.Month + "/" + x.ThangKiemKe.Value.Year,
                        TenTrangThai = listTrangThaiKiemKe.FirstOrDefault(y => y.Value == x.TrangThaiId).Name,
                        ThangKiemKe = x.ThangKiemKe.Value,
                    }).ToList();
                #endregion

                listProduct.ForEach(item =>
                {
                    //Lay so luong ton san pham trong tat ca cac kho cung loai
                    decimal tondauky = 0;
                    decimal nhapkho = 0;
                    decimal xuatkho = 0;
                    decimal toncuoiky = 0;
                    listWareHouseId.ForEach(khoid =>
                    {
                        var itemTonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date == parameter.FromNgay.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= parameter.ToNgay.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        if (itemTonDauKy != null)
                            tondauky += itemTonDauKy.StartQuantity;
                        if (itemTonCuoiKy != null)
                            toncuoiky += (itemTonCuoiKy.StartQuantity + itemTonCuoiKy.QuantityReceiving - itemTonCuoiKy.QuantityDelivery);

                        xuatkho += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date)
                       .Sum(x => x.QuantityDelivery);

                        nhapkho += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date)
                        .Sum(x => x.QuantityReceiving);
                    });

                    var newInventoryInfo = new InventoryInfoEntityModel()
                    {
                        InventoryInfoEntityModelId = Guid.NewGuid(),
                        ProductId = item.ProductId,
                        ProductName = item.ProductName,
                        ProductCode = item.ProductCode,
                        ProductUnitId = item.ProductUnitId,
                        ProductUnitName = categories.FirstOrDefault(c => c.CategoryId == item.ProductUnitId)?.CategoryName,
                        ProductCategoryId = item.ProductCategoryId,
                        ProductCategoryName = categories.FirstOrDefault(c => c.CategoryId == item.ProductCategoryId)?.CategoryName,
                        VendorName = getListNameVendor(item.ProductId),
                        //WarehouseId = parameter.WarehouseId,
                        StartInventory = tondauky,
                        EndInventory = tondauky + nhapkho - xuatkho,
                        QuantityDelivery = xuatkho,
                        QuantityReceiving = nhapkho,
                    };

                    var listProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == newInventoryInfo.ProductId).ToList();
                    listProductLotNoMapping.ForEach(map =>
                    {
                        decimal tondauky_map = 0;
                        decimal nhapkho_map = 0;
                        decimal xuatkho_map = 0;
                        decimal toncuoiky_map = 0;
                        listWareHouseId.ForEach(khoid =>
                        {
                            var itemTonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date == parameter.FromNgay.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                            var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= parameter.ToNgay.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                            if (itemTonDauKy != null)
                                tondauky_map += itemTonDauKy.StartQuantity;
                            if (itemTonCuoiKy != null)
                                toncuoiky_map += itemTonCuoiKy.StartQuantity;

                            xuatkho_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date)
                           .Sum(x => x.QuantityDelivery);
                            nhapkho_map += inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date)
                            .Sum(x => x.QuantityReceiving);
                        });

                        var newInventoryInfoLotNo = new InventoryInfoLotNoEntityModel();
                        newInventoryInfoLotNo.InventoryInfoLotNoEntityModelId = Guid.NewGuid();
                        newInventoryInfoLotNo.InventoryInfoEntityModelId = newInventoryInfo.InventoryInfoEntityModelId;
                        newInventoryInfoLotNo.ProductId = map.ProductId;
                        newInventoryInfoLotNo.LotNoId = map.LotNoId;
                        newInventoryInfoLotNo.LotNoName = lotno.FirstOrDefault(x => x.LotNoId == map.LotNoId)?.LotNoName;
                        //newInventoryInfoLotNo.WarehouseId = parameter.WarehouseId;
                        newInventoryInfoLotNo.StartInventory = tondauky_map;//inventory.FirstOrDefault(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate == parameter.FromNgay).StartQuantity;
                        newInventoryInfoLotNo.EndInventory = tondauky_map + nhapkho_map - xuatkho_map;//inventory.FirstOrDefault(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate == parameter.ToNgay).StartQuantity;
                        newInventoryInfoLotNo.QuantityDelivery = xuatkho_map;//inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate >= parameter.FromNgay && x.InventoryReportDate <= parameter.ToNgay)
                        //.Sum(x => x.QuantityDelivery);
                        newInventoryInfoLotNo.QuantityReceiving = nhapkho_map;//inventory.Where(x => x.ProductId == item.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate >= parameter.FromNgay && x.InventoryReportDate <= parameter.ToNgay)
                        //.Sum(x => x.QuantityReceiving);

                        var listInventoryInfoProduct = inventory.Where(x => x.ProductId == newInventoryInfoLotNo.ProductId && x.LotNoId == newInventoryInfoLotNo.LotNoId && listWareHouseId.Contains(x.WarehouseId) && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date).ToList();

                        #region Ngocpt
                        // Nhập kho
                        var lstNKByItem = inventoryReceivingVoucher.Where(x => listWareHouseId.Contains(x.WarehouseId) && x.InventoryReceivingVoucherDate.Date >= parameter.FromNgay.Date && x.InventoryReceivingVoucherDate.Date <= parameter.ToNgay.Date).ToList();
                        var lstNkId = lstNKByItem.Select(x => x.InventoryReceivingVoucherId).ToList();

                        var nkMapping = inventoryReceivingVoucherMapping.Where(m => m.ProductId == newInventoryInfoLotNo.ProductId && m.LotNoId == newInventoryInfoLotNo.LotNoId && lstNkId.Contains(m.InventoryReceivingVoucherId))
                        .Select(m => new
                        {
                            ProductId = m.ProductId,
                            LotNoId = m.LotNoId,
                            Quantity = m.QuantityActual,
                            InventoryDate = lstNKByItem.FirstOrDefault(ir => ir.InventoryReceivingVoucherId == m.InventoryReceivingVoucherId).InventoryReceivingVoucherDate.Date,
                            WarehouseId = lstNKByItem.FirstOrDefault(ir => ir.InventoryReceivingVoucherId == m.InventoryReceivingVoucherId).WarehouseId,
                        }).ToList();

                        var mappingNKGroup = nkMapping.GroupBy(w => new { w.InventoryDate, w.ProductId, w.LotNoId }).Select(w => new InventoryByLotNo
                        {
                            ProductId = w.First().ProductId,
                            LotNoId = w.First().LotNoId,
                            Quantity = w.Sum(c => c.Quantity),
                            InventoryDate = w.First().InventoryDate,
                            WarehouseId = w.First().WarehouseId
                        }).ToList().OrderBy(w => w.InventoryDate).ToList();

                        var dateNKLst = mappingNKGroup.Select(x => new { x.InventoryDate, x.ProductId }).ToList();

                        // Xuất kho
                        var lstXKByItem = inventoryDeliveryVoucher.Where(x => listWareHouseId.Contains(x.WarehouseId) && x.InventoryDeliveryVoucherDate.Value.Date >= parameter.FromNgay.Date && x.InventoryDeliveryVoucherDate.Value.Date <= parameter.ToNgay.Date).ToList();
                        var lstXkId = lstXKByItem.Select(x => x.InventoryDeliveryVoucherId).ToList();

                        var xkMapping = inventoryDeliveryVoucherMapping.Where(m => m.ProductId == newInventoryInfoLotNo.ProductId && m.LotNoId == newInventoryInfoLotNo.LotNoId && lstXkId.Contains(m.InventoryDeliveryVoucherId))
                        .Select(m => new
                        {
                            ProductId = m.ProductId,
                            LotNoId = m.LotNoId,
                            Quantity = m.QuantityDelivery,
                            InventoryDate = lstXKByItem.FirstOrDefault(ir => ir.InventoryDeliveryVoucherId == m.InventoryDeliveryVoucherId).InventoryDeliveryVoucherDate.Value.Date,
                            WarehouseId = lstXKByItem.FirstOrDefault(ir => ir.InventoryDeliveryVoucherId == m.InventoryDeliveryVoucherId).WarehouseId,
                        }).ToList();

                        var mappingXKGroup = xkMapping.GroupBy(w => new { w.InventoryDate, w.ProductId, w.LotNoId }).Select(w => new InventoryByLotNo
                        {
                            ProductId = w.First().ProductId,
                            LotNoId = w.First().LotNoId,
                            Quantity = w.Sum(c => c.Quantity),
                            InventoryDate = w.First().InventoryDate,
                            WarehouseId = w.First().WarehouseId
                        }).ToList().OrderBy(w => w.InventoryDate).ToList();

                        var dateXKLst = mappingXKGroup.Select(x => new { x.InventoryDate, x.ProductId }).ToList();
                        var dateLst = dateNKLst.Concat(dateXKLst).ToList();

                        var tonDK = newInventoryInfoLotNo.StartInventory;
                        newInventoryInfoLotNo.ListInventoryInfoProductEntityModel = new List<InventoryInfoProductEntityModel>();
                        var ProductUnitName = categories.FirstOrDefault(c => c.CategoryId == item.ProductUnitId)?.CategoryName;

                        newInventoryInfoLotNo.ListInventoryInfoProductEntityModel = CalInventory(tonDK, 0, 0, mappingNKGroup, mappingXKGroup, newInventoryInfoLotNo.ListInventoryInfoProductEntityModel, item.ProductName, item.ProductCode, ProductUnitName, newInventoryInfoLotNo.InventoryInfoLotNoEntityModelId);

                        #endregion
                        #region ngocpt comment code a Luyện
                        //listInventoryInfoProduct.ForEach(report =>
                        //{
                        //    var newInventoryInfoProduct = new InventoryInfoProductEntityModel();
                        //    newInventoryInfoProduct.InventoryInfoProductEntityModelId = Guid.NewGuid();
                        //    newInventoryInfoProduct.ProductName = item.ProductName;
                        //    newInventoryInfoProduct.ProductCode = item.ProductCode;
                        //    newInventoryInfoProduct.ProductUnitName = categories.FirstOrDefault(c => c.CategoryId == item.ProductUnitId)?.CategoryName;
                        //    newInventoryInfoProduct.InventoryInfoLotNoEntityModelId = newInventoryInfoLotNo.InventoryInfoLotNoEntityModelId;
                        //    newInventoryInfoProduct.InventoryReceivingVoucherDate = report.QuantityReceiving > 0 ? report.InventoryReportDate.ToShortDateString() : "";
                        //    newInventoryInfoProduct.InventoryDeliveryVoucherDate = report.QuantityDelivery > 0 ? report.InventoryReportDate.ToShortDateString() : "";
                        //    newInventoryInfoProduct.QuantityReceiving = report.QuantityReceiving;
                        //    newInventoryInfoProduct.QuantityDelivery = report.QuantityDelivery;
                        //    newInventoryInfoProduct.QuanlityInventory = report.StartQuantity + report.QuantityReceiving - report.QuantityDelivery;

                        //    newInventoryInfoLotNo.ListInventoryInfoProductEntityModel.Add(newInventoryInfoProduct);
                        //});
                        #endregion

                        newInventoryInfo.ListInventoryInfoLotNoEntityModel.Add(newInventoryInfoLotNo);
                    });
                    if ((parameter.CheckTK && newInventoryInfo.EndInventory < item.MinimumInventoryQuantity) || !parameter.CheckTK)
                    {
                        listInventoryInfoEntityModel.Add(newInventoryInfo);
                    }
                });

                return new GetInventoryInfoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListInventoryInfoEntityModel = listInventoryInfoEntityModel
                };
            }
            catch (Exception e)
            {
                return new GetInventoryInfoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public List<InventoryInfoProductEntityModel> CalInventory(decimal tonKhoDK, int indexNK, int indexXK, List<InventoryByLotNo> nhapKho, List<InventoryByLotNo> xuatKho, List<InventoryInfoProductEntityModel> response,
            string ProductName, string ProductCode, string ProductUnitName, Guid InventoryInfoLotNoEntityModelId)
        {
            try
            {

                if (indexNK < nhapKho.Count() || indexXK < xuatKho.Count())
                {
                    if (tonKhoDK > 0 && indexXK < xuatKho.Count())
                    {
                        var newInventoryInfoProduct = new InventoryInfoProductEntityModel();
                        newInventoryInfoProduct.ProductName = ProductName;
                        newInventoryInfoProduct.ProductCode = ProductCode;
                        newInventoryInfoProduct.ProductUnitName = ProductUnitName;
                        newInventoryInfoProduct.InventoryInfoLotNoEntityModelId = InventoryInfoLotNoEntityModelId;

                        newInventoryInfoProduct.InventoryReceivingVoucherDate = "";
                        newInventoryInfoProduct.QuantityReceiving = 0;
                        newInventoryInfoProduct.InventoryDeliveryVoucherDate = (indexXK < xuatKho.Count() && xuatKho[indexXK].InventoryDate != null) ? xuatKho[indexXK].InventoryDate.ToShortDateString() : "";
                        newInventoryInfoProduct.QuantityDelivery = (indexXK < xuatKho.Count() && xuatKho[indexXK].Quantity != null) ? xuatKho[indexXK].Quantity : 0;
                        newInventoryInfoProduct.QuanlityInventory = tonKhoDK + newInventoryInfoProduct.QuantityReceiving - newInventoryInfoProduct.QuantityDelivery;
                        tonKhoDK = newInventoryInfoProduct.QuanlityInventory;
                        indexXK++;

                        if (tonKhoDK < 0)
                        {
                            newInventoryInfoProduct.InventoryReceivingVoucherDate = (indexNK < nhapKho.Count() && nhapKho[indexNK].InventoryDate != null) ? nhapKho[indexNK].InventoryDate.ToShortDateString() : "";
                            newInventoryInfoProduct.QuantityReceiving = (indexNK < nhapKho.Count() && nhapKho[indexNK].Quantity != null) ? nhapKho[indexNK].Quantity : 0;
                            indexNK++;
                        }
                        response.Add(newInventoryInfoProduct);

                        if (indexNK < nhapKho.Count() || indexXK < xuatKho.Count())
                        {
                            CalInventory(tonKhoDK, indexNK, indexXK, nhapKho, xuatKho, response, ProductName, ProductCode, ProductUnitName, InventoryInfoLotNoEntityModelId);
                        }
                    }
                    else
                    {
                        var newInventoryInfoProduct = new InventoryInfoProductEntityModel();
                        newInventoryInfoProduct.InventoryInfoProductEntityModelId = Guid.NewGuid();
                        newInventoryInfoProduct.ProductName = ProductName;
                        newInventoryInfoProduct.ProductCode = ProductCode;
                        newInventoryInfoProduct.ProductUnitName = ProductUnitName;
                        newInventoryInfoProduct.InventoryInfoLotNoEntityModelId = InventoryInfoLotNoEntityModelId;

                        newInventoryInfoProduct.InventoryReceivingVoucherDate = (indexNK < nhapKho.Count() && nhapKho[indexNK].InventoryDate != null) ? nhapKho[indexNK].InventoryDate.ToShortDateString() : "";
                        newInventoryInfoProduct.QuantityReceiving = (indexNK < nhapKho.Count() && nhapKho[indexNK].Quantity != null) ? nhapKho[indexNK].Quantity : 0;
                        newInventoryInfoProduct.InventoryDeliveryVoucherDate = (indexXK < xuatKho.Count() && xuatKho[indexXK].InventoryDate != null) ? xuatKho[indexXK].InventoryDate.ToShortDateString() : "";
                        newInventoryInfoProduct.QuantityDelivery = (indexXK < xuatKho.Count() && xuatKho[indexXK].Quantity != null) ? xuatKho[indexXK].Quantity : 0;
                        newInventoryInfoProduct.QuanlityInventory = tonKhoDK + newInventoryInfoProduct.QuantityReceiving - newInventoryInfoProduct.QuantityDelivery;
                        tonKhoDK = newInventoryInfoProduct.QuanlityInventory;
                        indexXK++;
                        indexNK++;

                        response.Add(newInventoryInfoProduct);

                        if (indexNK < nhapKho.Count() || indexXK < xuatKho.Count())
                        {
                            CalInventory(tonKhoDK, indexNK, indexXK, nhapKho, xuatKho, response, ProductName, ProductCode, ProductUnitName, InventoryInfoLotNoEntityModelId);
                        }
                    }
                }
                return response;
            }
            catch (Exception ex)
            {
                return new List<InventoryInfoProductEntityModel>();
            }
        }

        public GetInventoryInfoResult GetInventoryInfoSX(GetInventoryInfoParameter parameter)
        {
            try
            {
                var categories = context.Category.Where(ct => ct.Active == true).ToList();
                var lotno = context.LotNo.ToList();
                var inventory = context.InventoryReport.ToList();
                var listInventoryInfoEntityModel = new List<InventoryInfoEntityModel>();

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var loaikhoSX = new Guid();
                var listProduct = new List<Entities.Product>();
                //if (parameter.WarehouseType == (int)WarehouseType.NVL)
                //{
                //    loaikhoId = context.Category.FirstOrDefault(x => x.CategoryCode == "NVL" && x.CategoryTypeId == categoryTypeId).CategoryId;
                //    listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.NVL && x.Active == true).ToList();
                //}
                //else
                //{

                //    listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.CCDC && x.Active == true).ToList();
                //}

                loaikhoSX = context.Category.FirstOrDefault(x => x.CategoryCode == "CSX" && x.CategoryTypeId == categoryTypeId).CategoryId;
                var listWareHouseId = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == loaikhoSX && x.Department == parameter.OrganizationId).Select(x => x.WarehouseId).ToList();

                var products = inventory.Where(x => listWareHouseId.Contains(x.WarehouseId) && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date).ToList();

                var productGroup = products.GroupBy(w => w.ProductId)
                                                                      .Select(s =>
                                                                       new InventoryInfoEntityModel
                                                                       {
                                                                           ProductId = s.Key,
                                                                           StartInventory = s.Sum(sum => sum.StartQuantity),
                                                                           QuantityDelivery = s.Sum(sum => sum.QuantityDelivery),
                                                                           QuantityReceiving = s.Sum(sum => sum.QuantityReceiving)
                                                                       }).ToList();

                //Lay so luong ton san pham trong tat ca cac kho cung loai
                decimal tondauky = 0;
                decimal nhapkho = 0;
                decimal xuatkho = 0;
                decimal toncuoiky = 0;

                productGroup.ForEach(item =>
                {
                    var product = context.Product.FirstOrDefault(x => x.ProductId == item.ProductId);
                    if (product != null)
                    {
                        var newInventoryInfo = new InventoryInfoEntityModel()
                        {
                            InventoryInfoEntityModelId = Guid.NewGuid(),
                            ProductId = product.ProductId,
                            ProductName = product.ProductName,
                            ProductCode = product.ProductCode,
                            ProductUnitId = product.ProductUnitId,
                            ProductUnitName = categories.FirstOrDefault(c => c.CategoryId == product.ProductUnitId)?.CategoryName,
                            ProductCategoryId = product.ProductCategoryId,
                            ProductCategoryName = categories.FirstOrDefault(c => c.CategoryId == product.ProductCategoryId)?.CategoryName,
                            VendorName = getListNameVendor(product.ProductId),
                            StartInventory = item.StartInventory,
                            EndInventory = item.StartInventory+ item.QuantityReceiving - item.QuantityDelivery,
                            QuantityDelivery = item.QuantityDelivery,
                            QuantityReceiving = item.QuantityReceiving,
                        };

                        listInventoryInfoEntityModel.Add(newInventoryInfo);
                    }
                });



                //listProduct.ForEach(item =>
                //{
                //    //Lay so luong ton san pham trong tat ca cac kho cung loai
                //    decimal tondauky = 0;
                //    decimal nhapkho = 0;
                //    decimal xuatkho = 0;
                //    decimal toncuoiky = 0;
                //    listWareHouseId.ForEach(khoid =>
                //    {
                //        var itemTonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date == parameter.FromNgay.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                //        var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= parameter.ToNgay.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                //        if (itemTonDauKy != null)
                //            tondauky += itemTonDauKy.StartQuantity;
                //        //if (itemTonCuoiKy != null)
                //        //    toncuoiky += itemTonCuoiKy.StartQuantity;

                //        xuatkho += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date)
                //       .Sum(x => x.QuantityDelivery);
                //        nhapkho += inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= parameter.FromNgay.Date && x.InventoryReportDate.Date <= parameter.ToNgay.Date)
                //        .Sum(x => x.QuantityReceiving);
                //    });

                //    var newInventoryInfo = new InventoryInfoEntityModel()
                //    {
                //        InventoryInfoEntityModelId = Guid.NewGuid(),
                //        ProductId = item.ProductId,
                //        ProductName = item.ProductName,
                //        ProductCode = item.ProductCode,
                //        ProductUnitId = item.ProductUnitId,
                //        ProductUnitName = categories.FirstOrDefault(c => c.CategoryId == item.ProductUnitId)?.CategoryName,
                //        ProductCategoryId = item.ProductCategoryId,
                //        ProductCategoryName = categories.FirstOrDefault(c => c.CategoryId == item.ProductCategoryId)?.CategoryName,
                //        VendorName = getListNameVendor(item.ProductId),
                //        //WarehouseId = parameter.WarehouseId,
                //        StartInventory = tondauky,
                //        EndInventory = tondauky + nhapkho - xuatkho,
                //        QuantityDelivery = xuatkho,
                //        QuantityReceiving = nhapkho,
                //    };

                //    listInventoryInfoEntityModel.Add(newInventoryInfo);
                //});

                return new GetInventoryInfoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListInventoryInfoEntityModel = listInventoryInfoEntityModel
                };
            }
            catch (Exception e)
            {
                return new GetInventoryInfoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
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

        public GetMasterInventoryDeliveryVoucherResult GetMasterInventoryDeliveryVoucher(GetMasterInventoryDeliveryVoucherParameter parameter)
        {
            var categories = context.Category.Where(ct => ct.Active == true).ToList();
            var listproduct = context.Product.Where(p => p.Active == true).ToList();
            var listLotNo = context.LotNo.ToList();
            var listInventoryReport = context.InventoryReport.ToList();
            var listProductLotNoMapping = context.ProductLotNoMapping.ToList();
            // Trạng thái phiếu nhập kho
            var statusTypeNhapKhoId = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == "TPH").CategoryTypeId;
            var daNhapKhoStatusId = context.Category.FirstOrDefault(f => f.CategoryTypeId == statusTypeNhapKhoId && f.CategoryCode == "NHK")?.CategoryId; // Id trạng thái đã nhập kho

            var listAllInventoryReceivingVoucher = context.InventoryReceivingVoucher.ToList();
            var lstProductId = context.Product.Where(x => x.ProductType == parameter.ProductType && x.Active == true).ToList();

            var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
            var typekhoId = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;
            var listWareHouseId = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == typekhoId).Select(x => x.WarehouseId).ToList();


            // Nhập kho 
            var listPhieuNhapKhoId = listAllInventoryReceivingVoucher.Where(c => listWareHouseId.Contains(c.WarehouseId) && c.StatusId == daNhapKhoStatusId)
                .Select(m => m.InventoryReceivingVoucherId).ToList();
            var listAllInventoryReceivingVoucherMappingId = context.InventoryReceivingVoucherMapping.Where(x => listPhieuNhapKhoId.Contains(x.InventoryReceivingVoucherId)).Select(x => x.ProductId).Distinct().ToList();

            //Lay danh sach san pham trong phieu da nhap
            var listProducts = lstProductId.Where(c => listAllInventoryReceivingVoucherMappingId.Contains(c.ProductId)).Select(y => new ProductEntityModel
            {
                ProductId = y.ProductId,
                ProductName = y.ProductName,
                ProductCode = y.ProductCode,
                ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                ProductUnitId = y.ProductUnitId
            }).ToList();

            //Đơn vị tính
            var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
            var listUnitProduct =
                context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();

            listProducts.ForEach(item =>
            {
                //item.QuantityInventory = soluongton; // So luong ton hang hoa, vat tu
                item.ProductUnitName = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId).CategoryName;

                var listProductLotNoMappingEntityModel = new List<ProductLotNoMappingEntityModel>();
                listProductLotNoMapping.Where(x => x.ProductId == item.ProductId).ToList().ForEach(lo =>
                {
                    var plot = new ProductLotNoMappingEntityModel();
                    plot.ProductId = item.ProductId;
                    plot.LotNoId = lo.LotNoId;
                    plot.LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lo.LotNoId)?.LotNoName;

                    //Lay so luong ton san pham trong tat ca cac kho cung loai
                    decimal soluongton_lotlo = 0;
                    listWareHouseId.ForEach(khoid =>
                    {
                        var product = listInventoryReport.Where(x => x.ProductId == item.ProductId && x.LotNoId == lo.LotNoId && x.WarehouseId == khoid).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        if (product != null)
                        {
                            soluongton_lotlo += product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
                        }
                    });
                    plot.QuantityInventory = soluongton_lotlo;
                    item.QuantityInventory += soluongton_lotlo; //so luong ton product

                    listProductLotNoMappingEntityModel.Add(plot);
                });

                item.ListProductLotNoMapping = listProductLotNoMappingEntityModel;
            });

            var EmployeeDepartment = "";
            var EmployeeDepartmentId = Guid.Empty;
            var NameCreate = "";
            var listAllUser = context.User.ToList();

            var listAllEmployee = context.Employee.ToList();
            List<EmployeeEntityModel> listEmployee = listAllEmployee.Select(item => new EmployeeEntityModel()
            {
                EmployeeId = item.EmployeeId,
                EmployeeName = item.EmployeeName,
                EmployeeCode = item.EmployeeCode,
                OrganizationId = item.OrganizationId
            }).ToList();

            var userCurrent = listAllUser.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);

            var employeeId = userCurrent.EmployeeId;
            var employee = listAllEmployee.FirstOrDefault(x => x.EmployeeId == employeeId);

            if (userCurrent != null)
            {
                #region Lấy bộ phận người tạo
                var department = context.Organization.FirstOrDefault(x => x.OrganizationId == employee.OrganizationId);
                EmployeeDepartment = department?.OrganizationName;
                EmployeeDepartmentId = department?.OrganizationId ?? Guid.Empty;
                NameCreate = employee.EmployeeName;
                #endregion
            }

            var listPhieuNhapLai = context.InventoryReceivingVoucher.Where(x => x.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNL).ToList();

            var listOrganizationEntity = new List<OrganizationEntityModel>();
            //Lấy bộ phận quản lý thành phẩm
            listOrganizationEntity = context.Organization.Select(o => new OrganizationEntityModel()
            {
                OrganizationId = o.OrganizationId,
                OrganizationCode = o.OrganizationCode,
                OrganizationName = o.OrganizationName,
                Level = o.Level,
                ParentId = o.ParentId
            }).ToList();

            #region get Tháng kiểm kê
            var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
            var listAllWarehouse = context.Warehouse.ToList();
            var listAllChiTietDotKiemKe = context.DotKiemKeChiTiet.ToList();
            var listDotKiemKe = context.DotKiemKe.Where(x => x.TrangThaiId == 2).OrderByDescending(x => x.ThangKiemKe)
                .Select(x => new DotKiemKeEntityModel
                {
                    DotKiemKeId = x.DotKiemKeId,
                    WarehouseId = x.WarehouseId,
                    WarehouseName = listAllWarehouse.FirstOrDefault(y => y.WarehouseId == x.WarehouseId).WarehouseName,
                    TenDotKiemKe = "Tháng " + x.ThangKiemKe.Value.Month + "/" + x.ThangKiemKe.Value.Year,
                    TenTrangThai = listTrangThaiKiemKe.FirstOrDefault(y => y.Value == x.TrangThaiId).Name,
                    ThangKiemKe = x.ThangKiemKe.Value,
                }).ToList();
            #endregion

            return new GetMasterInventoryDeliveryVoucherResult()
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Success",
                //ListWarehouseReceiving = listWarehouseReciving,
                //ListWarehouseDelivery = listWarehouseDelivery,
                EmployeeDepartment = EmployeeDepartment,
                EmployeeDepartmentId = EmployeeDepartmentId,
                NameCreate = NameCreate,
                ListProduct = listProducts,
                ListPhieuNhapLai = listPhieuNhapLai,
                ListOrganization = listOrganizationEntity,
                ListEmployee = listEmployee,
                ListDotKiemKe = listDotKiemKe
            };
        }

        public CreatePhieuNhapKhoResult CreatePhieuNhapKhoNVLCCDC(CreatePhieuNhapKhoParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var statusId_Nhap_PNK = context.Category
                    .FirstOrDefault(x => x.CategoryCode == "NHA" && x.CategoryTypeId == statusTypeId_PNK)
                    ?.CategoryId;

                var Code = "";
                var datenow = DateTime.Now;
                var totalInvertoryCreate = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month
                    && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();

                if (parameter.InventoryReceivingVoucher.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                {
                    if (parameter.WarehouseType == (int)WarehouseType.NVL)
                    {
                        var item = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Year == datenow.Year && c.InventoryReceivingVoucherCode.StartsWith("VL")).OrderByDescending(x => x.CreatedDate).FirstOrDefault();
                        if (item != null)
                        {
                            var max_number = int.Parse(item.InventoryReceivingVoucherCode.Split(" ")[1]);
                            Code = "VL " + (max_number + 1);
                        }
                        else
                        {
                            totalInvertoryCreate = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Year == datenow.Year && c.InventoryReceivingVoucherCode.StartsWith("VL")).Count();

                            Code = "VL " + ConverCreateId2(totalInvertoryCreate + 1);
                        }
                    }
                    else
                    {
                        var item = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Year == datenow.Year && c.InventoryReceivingVoucherCode.StartsWith("DC")).OrderByDescending(x => x.CreatedDate).FirstOrDefault();
                        if (item != null)
                        {
                            var max_number = int.Parse(item.InventoryReceivingVoucherCode.Split(" ")[1]);
                            Code = "DC " + (max_number + 1);
                        }
                        else
                        {
                            totalInvertoryCreate = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Year == datenow.Year && c.InventoryReceivingVoucherCode.StartsWith("DC")).Count();

                            Code = "DC " + ConverCreateId2(totalInvertoryCreate + 1);
                        }
                    }
                }
                else
                {
                    Code = "PN " + ConverCreateId(totalInvertoryCreate + 1);
                }

                //parameter.InventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;

                var existsCode = context.InventoryReceivingVoucher.FirstOrDefault(x =>
                    x.InventoryReceivingVoucherCode == Code);

                if (existsCode != null)
                {
                    return new CreatePhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Mã phiếu nhập kho đã tồn tại"
                    };
                }

                var newInventoryReceivingVoucher = new InventoryReceivingVoucher();
                newInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                newInventoryReceivingVoucher.StatusId = statusId_Nhap_PNK.Value; // Mới
                newInventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;
                newInventoryReceivingVoucher.Active = true;
                newInventoryReceivingVoucher.CreatedById = parameter.UserId;
                newInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                newInventoryReceivingVoucher.InventoryReceivingVoucherType = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherType;
                newInventoryReceivingVoucher.InventoryReceivingVoucherDate = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate;
                newInventoryReceivingVoucher.WarehouseId = parameter.InventoryReceivingVoucher.WarehouseId;
                newInventoryReceivingVoucher.InventoryReceivingVoucherTime = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate.TimeOfDay;
                newInventoryReceivingVoucher.Description = parameter.InventoryReceivingVoucher.Description;
                newInventoryReceivingVoucher.Note = parameter.InventoryReceivingVoucher.Note;
                newInventoryReceivingVoucher.ProducerName = parameter.InventoryReceivingVoucher.ProducerName;
                newInventoryReceivingVoucher.ShiperName = parameter.InventoryReceivingVoucher.ShiperName;
                newInventoryReceivingVoucher.OrderNumber = parameter.InventoryReceivingVoucher.OrderNumber;
                newInventoryReceivingVoucher.OrderDate = parameter.InventoryReceivingVoucher.OrderDate;
                newInventoryReceivingVoucher.InvoiceNumber = parameter.InventoryReceivingVoucher.InvoiceNumber;
                newInventoryReceivingVoucher.InvoiceDate = parameter.InventoryReceivingVoucher.InvoiceDate;
                newInventoryReceivingVoucher.VendorId = parameter.InventoryReceivingVoucher.VendorId;
                newInventoryReceivingVoucher.BoxGreen = parameter.InventoryReceivingVoucher.BoxGreen;
                newInventoryReceivingVoucher.BoxGreenMax = parameter.InventoryReceivingVoucher.BoxGreenMax;
                newInventoryReceivingVoucher.PalletMax = parameter.InventoryReceivingVoucher.PalletMax;
                newInventoryReceivingVoucher.PalletNormal = parameter.InventoryReceivingVoucher.PalletNormal;
                newInventoryReceivingVoucher.BoxBlue = parameter.InventoryReceivingVoucher.BoxBlue;
                newInventoryReceivingVoucher.PalletSmall = parameter.InventoryReceivingVoucher.PalletSmall;
                context.InventoryReceivingVoucher.Add(newInventoryReceivingVoucher);

                context.SaveChanges();

                var listInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
                parameter.ListInventoryReceivingVoucherMapping.ForEach(item =>
                {
                    var existsLotNo = context.LotNo.FirstOrDefault(x => x.LotNoName == item.LotNoName);
                    if (existsLotNo != null)
                    {
                        item.LotNoId = existsLotNo.LotNoId;
                    }
                    else if (item.LotNoId == null)
                    {
                        var newLotNo = new LotNo();
                        newLotNo.LotNoName = item.LotNoName;
                        context.LotNo.Add(newLotNo);
                        context.SaveChanges();

                        item.LotNoId = newLotNo.LotNoId;
                    }

                    //Check ProductLotNoMapping
                    var existsProductLotNo = context.ProductLotNoMapping.FirstOrDefault(x =>
                        x.ProductId == item.ProductId && x.LotNoId == item.LotNoId);

                    if (existsProductLotNo == null)
                    {
                        var newProductLotNo = new ProductLotNoMapping();
                        newProductLotNo.ProductLotNoMappingId = Guid.NewGuid();
                        newProductLotNo.ProductId = item.ProductId;
                        newProductLotNo.LotNoId = item.LotNoId.Value;
                        context.ProductLotNoMapping.Add(newProductLotNo);
                        context.SaveChanges();
                    }

                    item.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                    item.InventoryReceivingVoucherId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
                    item.Active = true;
                    item.CreatedById = parameter.UserId;
                    item.CreatedDate = DateTime.Now;

                    listInventoryReceivingVoucherMapping.Add(item.ToEntity());
                });

                context.InventoryReceivingVoucherMapping.AddRange(listInventoryReceivingVoucherMapping);

                #region Thêm vào Dòng thời gian

                var note = new Note();
                note.NoteId = Guid.NewGuid();
                note.Description = employee.EmployeeName.Trim() + " đã tạo phiếu nhập kho";
                note.Type = "NEW";
                note.ObjectId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
                note.ObjectType = "PNK";
                note.Active = true;
                note.NoteTitle = "Đã tạo phiếu nhập kho";
                note.CreatedDate = DateTime.Now;
                note.CreatedById = parameter.UserId;

                context.Note.Add(note);

                #endregion

                context.SaveChanges();

                return new CreatePhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thêm mới thành công",
                    InventoryReceivingVoucherId = newInventoryReceivingVoucher.InventoryReceivingVoucherId
                };
            }
            catch (Exception e)
            {
                return new CreatePhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreatePhieuNhapKhoResult CreatePhieuNhapKhoTP(CreatePhieuNhapKhoParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var statusId_Nhap_PNK = context.Category
                    .FirstOrDefault(x => x.CategoryCode == "NHA" && x.CategoryTypeId == statusTypeId_PNK)
                    ?.CategoryId;

                var Code = "";
                var datenow = DateTime.Now;
                var totalInvertoryCreate = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month
                    && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();

                Code = "TP " + ConverCreateId(totalInvertoryCreate + 1);

                var existsCode = context.InventoryReceivingVoucher.FirstOrDefault(x =>
                    x.InventoryReceivingVoucherCode == Code);

                if (existsCode != null)
                {
                    return new CreatePhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Mã phiếu nhập kho đã tồn tại"
                    };
                }

                var newInventoryReceivingVoucher = new InventoryReceivingVoucher();
                newInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                newInventoryReceivingVoucher.StatusId = statusId_Nhap_PNK.Value; // Mới
                newInventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;
                newInventoryReceivingVoucher.Active = true;
                newInventoryReceivingVoucher.CreatedById = parameter.UserId;
                newInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                newInventoryReceivingVoucher.InventoryReceivingVoucherType = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherType;
                newInventoryReceivingVoucher.InventoryReceivingVoucherDate = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate;
                newInventoryReceivingVoucher.WarehouseId = parameter.InventoryReceivingVoucher.WarehouseId;
                newInventoryReceivingVoucher.InventoryReceivingVoucherTime = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate.TimeOfDay;
                newInventoryReceivingVoucher.Note = parameter.InventoryReceivingVoucher.Note;

                context.InventoryReceivingVoucher.Add(newInventoryReceivingVoucher);

                context.SaveChanges();

                var listInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
                parameter.ListInventoryReceivingVoucherMapping.ForEach(item =>
                {
                    var existsLotNo = context.LotNo.FirstOrDefault(x => x.LotNoName == item.LotNoName);
                    if (existsLotNo != null)
                    {
                        item.LotNoId = existsLotNo.LotNoId;
                    }
                    else if (item.LotNoId == null)
                    {
                        var newLotNo = new LotNo();
                        newLotNo.LotNoName = item.LotNoName;
                        context.LotNo.Add(newLotNo);
                        context.SaveChanges();

                        item.LotNoId = newLotNo.LotNoId;
                    }

                    //Check ProductLotNoMapping
                    var existsProductLotNo = context.ProductLotNoMapping.FirstOrDefault(x =>
                        x.ProductId == item.ProductId && x.LotNoId == item.LotNoId);

                    if (existsProductLotNo == null)
                    {
                        var newProductLotNo = new ProductLotNoMapping();
                        newProductLotNo.ProductLotNoMappingId = Guid.NewGuid();
                        newProductLotNo.ProductId = item.ProductId;
                        newProductLotNo.LotNoId = item.LotNoId.Value;
                        context.ProductLotNoMapping.Add(newProductLotNo);
                        context.SaveChanges();
                    }

                    item.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                    item.InventoryReceivingVoucherId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
                    item.Active = true;
                    item.CreatedById = parameter.UserId;
                    item.CreatedDate = DateTime.Now;

                    listInventoryReceivingVoucherMapping.Add(item.ToEntity());
                });

                context.InventoryReceivingVoucherMapping.AddRange(listInventoryReceivingVoucherMapping);

                #region Thêm vào Dòng thời gian

                var note = new Note();
                note.NoteId = Guid.NewGuid();
                note.Description = employee.EmployeeName.Trim() + " đã tạo phiếu nhập kho";
                note.Type = "NEW";
                note.ObjectId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
                note.ObjectType = "PNK";
                note.Active = true;
                note.NoteTitle = "Đã tạo phiếu nhập kho";
                note.CreatedDate = DateTime.Now;
                note.CreatedById = parameter.UserId;

                context.Note.Add(note);

                #endregion

                context.SaveChanges();

                return new CreatePhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thêm mới thành công",
                    InventoryReceivingVoucherId = newInventoryReceivingVoucher.InventoryReceivingVoucherId
                };
            }
            catch (Exception e)
            {
                return new CreatePhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public CreatePhieuNhapKhoResult CreatePhieuNhapKhoCCDC(CreatePhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
        //        var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

        //        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //            ?.CategoryTypeId;
        //        var statusId_Nhap_PNK = context.Category
        //            .FirstOrDefault(x => x.CategoryCode == "NHA" && x.CategoryTypeId == statusTypeId_PNK)
        //            ?.CategoryId;

        //        var Code = "";
        //        var datenow = DateTime.Now;
        //        var totalInvertoryCreate = context.InventoryReceivingVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();

        //        if (parameter.InventoryReceivingVoucher.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
        //        {
        //            Code = "DC " + ConverCreateId(totalInvertoryCreate + 1);
        //        }
        //        else
        //        {


        //            Code = "PN " + ConverCreateId(totalInvertoryCreate + 1);
        //        }

        //        parameter.InventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;

        //        var existsCode = context.InventoryReceivingVoucher.FirstOrDefault(x =>
        //            x.InventoryReceivingVoucherCode == Code);

        //        if (existsCode != null)
        //        {
        //            return new CreatePhieuNhapKhoResult()
        //            {
        //                StatusCode = HttpStatusCode.ExpectationFailed,
        //                MessageCode = "Mã phiếu nhập kho đã tồn tại"
        //            };
        //        }

        //        var newInventoryReceivingVoucher = new InventoryReceivingVoucher();
        //        newInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
        //        newInventoryReceivingVoucher.StatusId = statusId_Nhap_PNK.Value; // Mới
        //        newInventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;
        //        newInventoryReceivingVoucher.Active = true;
        //        newInventoryReceivingVoucher.CreatedById = parameter.UserId;
        //        newInventoryReceivingVoucher.CreatedDate = DateTime.Now;
        //        newInventoryReceivingVoucher.InventoryReceivingVoucherType = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherType;
        //        newInventoryReceivingVoucher.InventoryReceivingVoucherDate = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate;
        //        newInventoryReceivingVoucher.WarehouseId = parameter.InventoryReceivingVoucher.WarehouseId;
        //        newInventoryReceivingVoucher.InventoryReceivingVoucherTime = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherDate.TimeOfDay;
        //        newInventoryReceivingVoucher.Description = parameter.InventoryReceivingVoucher.Description;
        //        newInventoryReceivingVoucher.Note = parameter.InventoryReceivingVoucher.Note;
        //        newInventoryReceivingVoucher.ProducerName = parameter.InventoryReceivingVoucher.ProducerName;
        //        newInventoryReceivingVoucher.ShiperName = parameter.InventoryReceivingVoucher.ShiperName;
        //        newInventoryReceivingVoucher.OrderNumber = parameter.InventoryReceivingVoucher.OrderNumber;
        //        newInventoryReceivingVoucher.OrderDate = parameter.InventoryReceivingVoucher.OrderDate;
        //        newInventoryReceivingVoucher.InvoiceNumber = parameter.InventoryReceivingVoucher.InvoiceNumber;
        //        newInventoryReceivingVoucher.InvoiceDate = parameter.InventoryReceivingVoucher.InvoiceDate;
        //        newInventoryReceivingVoucher.PartnersName = parameter.InventoryReceivingVoucher.PartnersName;
        //        newInventoryReceivingVoucher.BoxGreen = parameter.InventoryReceivingVoucher.BoxGreen;
        //        newInventoryReceivingVoucher.BoxGreenMax = parameter.InventoryReceivingVoucher.BoxGreenMax;
        //        newInventoryReceivingVoucher.PalletMax = parameter.InventoryReceivingVoucher.PalletMax;
        //        newInventoryReceivingVoucher.PalletNormal = parameter.InventoryReceivingVoucher.PalletNormal;
        //        newInventoryReceivingVoucher.BoxBlue = parameter.InventoryReceivingVoucher.BoxBlue;
        //        newInventoryReceivingVoucher.PalletSmall = parameter.InventoryReceivingVoucher.PalletSmall;
        //        context.InventoryReceivingVoucher.Add(newInventoryReceivingVoucher);

        //        context.SaveChanges();

        //        var listInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
        //        parameter.ListInventoryReceivingVoucherMapping.ForEach(item =>
        //        {
        //            if (item.LotNoId == null)
        //            {
        //                var newLotNo = new LotNo();
        //                newLotNo.LotNoName = item.LotNoName;
        //                context.LotNo.Add(newLotNo);
        //                context.SaveChanges();

        //                item.LotNoId = newLotNo.LotNoId;
        //            }

        //            //Check ProductLotNoMapping
        //            var existsProductLotNo = context.ProductLotNoMapping.FirstOrDefault(x =>
        //                x.ProductId == item.ProductId && x.LotNoId == item.LotNoId);

        //            if (existsProductLotNo == null)
        //            {
        //                var newProductLotNo = new ProductLotNoMapping();
        //                newProductLotNo.ProductLotNoMappingId = Guid.NewGuid();
        //                newProductLotNo.ProductId = item.ProductId;
        //                newProductLotNo.LotNoId = item.LotNoId.Value;
        //                context.ProductLotNoMapping.Add(newProductLotNo);
        //                context.SaveChanges();
        //            }

        //            item.InventoryReceivingVoucherMappingId = Guid.NewGuid();
        //            item.InventoryReceivingVoucherId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
        //            item.Active = true;
        //            item.CreatedById = parameter.UserId;
        //            item.CreatedDate = DateTime.Now;

        //            listInventoryReceivingVoucherMapping.Add(item.ToEntity());
        //        });

        //        context.InventoryReceivingVoucherMapping.AddRange(listInventoryReceivingVoucherMapping);

        //        #region Thêm vào Dòng thời gian

        //        var note = new Note();
        //        note.NoteId = Guid.NewGuid();
        //        note.Description = employee.EmployeeName.Trim() + " đã tạo phiếu nhập kho";
        //        note.Type = "NEW";
        //        note.ObjectId = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId.Value;
        //        note.ObjectType = "PNK";
        //        note.Active = true;
        //        note.NoteTitle = "Đã tạo phiếu nhập kho";
        //        note.CreatedDate = DateTime.Now;
        //        note.CreatedById = parameter.UserId;

        //        context.Note.Add(note);

        //        #endregion

        //        context.SaveChanges();

        //        return new CreatePhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            InventoryReceivingVoucherId = parameter.InventoryReceivingVoucher.InventoryReceivingVoucherId.Value
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new CreatePhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        //public SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoCCDC(SearchListPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();
        //        var loaikho_id = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "CCDC")?.CategoryTypeId;

        //        var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id).Select(x => x.WarehouseId).ToList();

        //        //Lấy tất cả phiếu có loại kho là CCDC
        //        listPhieuNhapKho = context.InventoryReceivingVoucher.Where(x => listkho.Contains(x.WarehouseId))
        //             .Select(y => new InventoryReceivingVoucherEntityModel
        //             {
        //                 InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
        //                 InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
        //                 StatusId = y.StatusId,
        //                 InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
        //                 WarehouseId = y.WarehouseId,
        //                 InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
        //                 OrderNumber = y.OrderNumber,
        //                 InvoiceNumber = y.InvoiceNumber,
        //                 //PartnersId = y.PartnersId,
        //                 PartnersName = y.PartnersName,
        //                 CreatedById = y.CreatedById,
        //                 CreatedDate = y.CreatedDate
        //             }).ToList();

        //        #region Các trường hợp Ngày nhập kho và Ngày lập phiếu
        //        //if (parameter.FromNgayNhapKho != null && parameter.ToNgayNhapKho != null)
        //        //{
        //        //    listPhieuNhapKho = context.InventoryReceivingVoucher
        //        //        .Where(x =>
        //        //            (x.InventoryReceivingVoucherDate.Date >= parameter.FromNgayNhapKho.Value.Date &&
        //        //             x.InventoryReceivingVoucherDate.Date <= parameter.ToNgayNhapKho.Value.Date))
        //        //        .Select(y => new InventoryReceivingVoucherEntityModel
        //        //        {
        //        //            InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
        //        //            InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
        //        //            StatusId = y.StatusId,
        //        //            InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
        //        //            WarehouseId = y.WarehouseId,
        //        //            InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
        //        //            OrderNumber = y.OrderNumber,
        //        //            InvoiceNumber = y.InvoiceNumber,
        //        //            PartnersId = y.PartnersId,
        //        //            PartnersName = y.PartnersName,
        //        //            CreatedById = y.CreatedById,
        //        //            CreatedDate = y.CreatedDate
        //        //        }).ToList();
        //        //}
        //        #endregion

        //        //Nếu có điều kiện tìm kiếm theo sản phẩm
        //        //if (parameter.ListProductId != null && parameter.ListProductId.Count > 0)
        //        //{
        //        //    var listPhieuNhapKhoId = listPhieuNhapKho.Select(y => y.InventoryReceivingVoucherId).ToList();

        //        //    //Lấy list Id phiếu nhập kho thỏa mãn
        //        //    var listResultId = context.InventoryReceivingVoucherMapping
        //        //        .Where(x => listPhieuNhapKhoId.Contains(x.InventoryReceivingVoucherId) && parameter.ListProductId.Contains(x.ProductId))
        //        //        .Select(y => y.InventoryReceivingVoucherId).Distinct().ToList();

        //        //    listPhieuNhapKho = listPhieuNhapKho.Where(x => listResultId.Contains(x.InventoryReceivingVoucherId.Value))
        //        //        .ToList();
        //        //}

        //        //Nếu có điều kiện tìm kiếm theo nhà cung cấp
        //        //if (parameter.ListVendorId != null && parameter.ListVendorId.Count > 0)
        //        //{
        //        //    var listDoiTacId = listPhieuNhapKho.Select(y => y.PartnersId).ToList();

        //        //    var listResultId = context.Vendor.Where(x => parameter.ListVendorId.Contains(x.VendorId)).Select(y => y.VendorId).Distinct().ToList();

        //        //    listPhieuNhapKho = listPhieuNhapKho.Where(x => listResultId.Contains(x.PartnersId.Value))
        //        //        .ToList();
        //        //}

        //        if (listPhieuNhapKho.Count > 0)
        //        {
        //            //var listDoiTacId = listPhieuNhapKho.Select(y => y.PartnersId).Distinct().ToList();
        //            //var listDoiTacNhaCungCap = context.Vendor.Where(x => listDoiTacId.Contains(x.VendorId)).ToList();

        //            listPhieuNhapKho.ForEach(item =>
        //            {
        //                //#region Lấy tên Đối tác
        //                //var doitac = listDoiTacNhaCungCap.FirstOrDefault(x => x.VendorId == item.PartnersId);
        //                //item.PartnersName = doitac == null ? "" : doitac.VendorName.Trim();

        //                //#endregion

        //                #region Lấy tên loại phiếu

        //                if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
        //                {
        //                    item.InventoryReceivingVoucherTypeName = "Nhập mới NVL";
        //                }
        //                else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
        //                {
        //                    item.InventoryReceivingVoucherTypeName = "Nhập trả lại NVL";
        //                }

        //                #endregion

        //                #region Lấy tên trạng thái

        //                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //                ?.CategoryTypeId;
        //                var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

        //                var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
        //                item.StatusName = status?.CategoryName;

        //                #endregion
        //            });

        //            listPhieuNhapKho = listPhieuNhapKho.OrderByDescending(z => z.CreatedDate).ToList();
        //        }

        //        return new SearchListPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            ListPhieuNhapKho = listPhieuNhapKho
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new SearchListPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoNVLCCDC(SearchListPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();
                
                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id).Select(x => x.WarehouseId).ToList();
                if (parameter.FromDate != null && parameter.ToDate != null)
                {
                    listPhieuNhapKho = context.InventoryReceivingVoucher.Where(x => listkho.Contains(x.WarehouseId) && x.InventoryReceivingVoucherDate.Date >= parameter.FromDate.Date && x.InventoryReceivingVoucherDate.Date <= parameter.ToDate.Date)
                         .Select(y => new InventoryReceivingVoucherEntityModel
                         {
                             InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                             InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
                             StatusId = y.StatusId,
                             InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
                             InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
                             OrderNumber = y.OrderNumber,
                             InvoiceNumber = y.InvoiceNumber,
                             VendorId = y.VendorId,
                             CreatedById = y.CreatedById,
                             CreatedDate = y.CreatedDate
                         }).ToList();
                }

                List<ChiTietSanPhamPhieuNhapKho> chiTietSanPhamPhieuNhapKhos = new List<ChiTietSanPhamPhieuNhapKho>();
                if (listPhieuNhapKho.Count > 0)
                {
                    var productUnitTypeId = context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                    var listAllProductUnit = context.Category.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                    listPhieuNhapKho.ForEach(item =>
                    {
                        #region Lấy tên loại phiếu

                        if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                        {
                            item.InventoryReceivingVoucherTypeName = "Nhập mới";
                        }
                        else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
                        {
                            item.InventoryReceivingVoucherTypeName = "Nhập khác";
                        }
                        else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.NKK)
                        {
                            item.InventoryReceivingVoucherTypeName = "Nhập kiểm kê";
                        }

                        #endregion

                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.StatusName = status?.CategoryName;

                        switch (item.StatusName)
                        {
                            case "Mới":
                                item.IntStatus = 0;
                                break;
                            case "Đã nhập kho":
                                item.IntStatus = 1;
                                break;
                        }

                        #endregion

                        item.VendorName = context.Vendor.FirstOrDefault(x => x.VendorId == item.VendorId)?.VendorName ?? "";

                        var listPhieuNhapKhoMapping = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == item.InventoryReceivingVoucherId).ToList();

                        var listMappingGroup = listPhieuNhapKhoMapping.GroupBy(w => w.ProductId)
                                                                           .Select(s =>
                                                                            new ChiTietSanPhamPhieuNhapKho
                                                                            {
                                                                                ProductId = s.Key,
                                                                                Quantity = s.Sum(sum => sum.QuantityActual)
                                                                            }).ToList();

                        listMappingGroup.ForEach(map =>
                        {
                            var product = context.Product.FirstOrDefault(x => x.ProductId == map.ProductId);

                            var chitiet = new ChiTietSanPhamPhieuNhapKho();
                            chitiet.InventoryReceivingVoucherId = item.InventoryReceivingVoucherId;
                            chitiet.ProductId = product.ProductId;
                            chitiet.TenPhieuNhap = item.InventoryReceivingVoucherCode;
                            chitiet.NgayNhap = item.InventoryReceivingVoucherDate;
                            chitiet.ProductName = product.ProductName;
                            chitiet.ProductUnitName = listAllProductUnit.FirstOrDefault(c => c.CategoryId == product.ProductUnitId)?.CategoryName ?? "";
                            chitiet.Quantity = map.Quantity;
                            chitiet.ProductCategoryName = context.Category.FirstOrDefault(c => c.Active == true && c.CategoryId == product.ProductCategoryId)?.CategoryName;

                            if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                            {
                                chitiet.LoaiPhieu = "Nhập mới";
                            }
                            else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
                            {
                                chitiet.LoaiPhieu = "Nhập khác";
                            }
                            else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNL)
                            {
                                chitiet.LoaiPhieu = "Nhập trả lại";
                            }

                            chiTietSanPhamPhieuNhapKhos.Add(chitiet);
                        });


                        //listPhieuNhapKhoMapping.ForEach(map =>
                        //{

                        //});
                    });

                    listPhieuNhapKho = listPhieuNhapKho.OrderByDescending(z => z.CreatedDate).ToList();


                    //Theo NVL
                }

                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListPhieuNhapKho = listPhieuNhapKho,
                    ChiTietSanPhamPhieuNhapKhos = chiTietSanPhamPhieuNhapKhos
                };
            }
            catch (Exception e)
            {
                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoSX(SearchListPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();
                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id && x.Department == parameter.OrganizationId).Select(x => x.WarehouseId).ToList();

                //Lấy tất cả phiếu có loại kho là chờ sản xuất
                listPhieuNhapKho = context.InventoryReceivingVoucher.Where(x => listkho.Contains(x.WarehouseId) && x.InventoryReceivingVoucherDate.Date >= parameter.FromDate.Date && x.InventoryReceivingVoucherDate.Date <= parameter.ToDate.Date)
                     .Select(y => new InventoryReceivingVoucherEntityModel
                     {
                         InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                         InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
                         StatusId = y.StatusId,
                         InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
                         WarehouseId = y.WarehouseId,
                         InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
                         OrderNumber = y.OrderNumber,
                         InvoiceNumber = y.InvoiceNumber,
                         CreatedById = y.CreatedById,
                         CreatedDate = y.CreatedDate
                     }).ToList();

                List<ChiTietSanPhamPhieuNhapKho> chiTietSanPhamPhieuNhapKhos = new List<ChiTietSanPhamPhieuNhapKho>();
                if (listPhieuNhapKho.Count > 0)
                {
                    var commonCategoryType = context.CategoryType.ToList();
                    var commonCategory = context.Category.ToList();
                    var productUnitTypeId = commonCategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                    var listAllProductUnit = commonCategory.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                    listPhieuNhapKho.ForEach(item =>
                    {
                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.StatusName = status?.CategoryName;

                        #endregion

                        var listPhieuNhapKhoMapping = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == item.InventoryReceivingVoucherId).ToList();

                        var listMappingGroup = listPhieuNhapKhoMapping.GroupBy(w => w.ProductId)
                                                                           .Select(s =>
                                                                            new ChiTietSanPhamPhieuNhapKho
                                                                            {
                                                                                ProductId = s.Key,
                                                                                Quantity = s.Sum(sum => sum.QuantityActual)
                                                                            }).ToList();

                        listMappingGroup.ForEach(map =>
                        {
                            var product = context.Product.FirstOrDefault(x => x.ProductId == map.ProductId);

                            var chitiet = new ChiTietSanPhamPhieuNhapKho();
                            chitiet.InventoryReceivingVoucherId = item.InventoryReceivingVoucherId;
                            chitiet.ProductId = product.ProductId;
                            chitiet.TenPhieuNhap = item.InventoryReceivingVoucherCode;
                            chitiet.NgayNhap = item.InventoryReceivingVoucherDate;
                            chitiet.ProductName = product.ProductName;
                            chitiet.ProductUnitName = listAllProductUnit.FirstOrDefault(c => c.CategoryId == product.ProductUnitId)?.CategoryName ?? "";
                            chitiet.Quantity = map.Quantity;
                            chitiet.ProductCategoryName = context.Category.FirstOrDefault(c => c.Active == true && c.CategoryId == product.ProductCategoryId)?.CategoryName;

                            if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                            {
                                chitiet.LoaiPhieu = "Nhập mới NVL";
                            }
                            else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
                            {
                                chitiet.LoaiPhieu = "Nhập trả lại NVL";
                            }

                            chiTietSanPhamPhieuNhapKhos.Add(chitiet);
                        });
                    });

                    listPhieuNhapKho = listPhieuNhapKho.OrderByDescending(z => z.CreatedDate).ToList();
                }


                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListPhieuNhapKho = listPhieuNhapKho,
                    ChiTietSanPhamPhieuNhapKhos = chiTietSanPhamPhieuNhapKhos
                };
            }
            catch (Exception e)
            {
                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        //public SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoTSD(SearchListPhieuNhapKhoParameter parameter)
        //{
        //    try
        //    {
        //        var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();

        //            var loaikho_id = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TSD")?.CategoryTypeId;

        //            var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id).Select(x => x.WarehouseId).ToList();

        //            //Lấy tất cả phiếu có loại kho là tái sử dụng
        //            listPhieuNhapKho = context.InventoryReceivingVoucher.Where(x => listkho.Contains(x.WarehouseId))
        //                 .Select(y => new InventoryReceivingVoucherEntityModel
        //                 {
        //                     InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
        //                     InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
        //                     StatusId = y.StatusId,
        //                     InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
        //                     WarehouseId = y.WarehouseId,
        //                     InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
        //                     OrderNumber = y.OrderNumber,
        //                     InvoiceNumber = y.InvoiceNumber,
        //                     CreatedById = y.CreatedById,
        //                     CreatedDate = y.CreatedDate
        //                 }).ToList();

        //            #region Các trường hợp Ngày nhập kho và Ngày lập phiếu
        //            if (parameter.FromDate != null && parameter.ToDate != null)
        //            {
        //                listPhieuNhapKho = listPhieuNhapKho.Where(x =>
        //                        x.InventoryReceivingVoucherDate >= parameter.FromDate.Value.Date &&
        //                         x.InventoryReceivingVoucherDate <= parameter.ToDate.Value.Date).ToList();
        //            }
        //            #endregion

        //            if (listPhieuNhapKho.Count > 0)
        //            {
        //                //var listDoiTacId = listPhieuNhapKho.Select(y => y.PartnersId).Distinct().ToList();
        //                //var listDoiTacNhaCungCap = context.Vendor.Where(x => listDoiTacId.Contains(x.VendorId)).ToList();

        //                listPhieuNhapKho.ForEach(item =>
        //                {
        //                    #region Lấy tên trạng thái

        //                    var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
        //                    ?.CategoryTypeId;
        //                    var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

        //                    var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
        //                    item.StatusName = status?.CategoryName;

        //                    #endregion
        //                });

        //                listPhieuNhapKho = listPhieuNhapKho.OrderByDescending(z => z.CreatedDate).ToList();
        //            }


        //        return new SearchListPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.OK,
        //            MessageCode = "Success",
        //            ListPhieuNhapKho = listPhieuNhapKho
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new SearchListPhieuNhapKhoResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoTP(SearchListPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id).Select(x => x.WarehouseId).ToList();

                //Lấy tất cả phiếu có loại kho là thanh pham
                listPhieuNhapKho = context.InventoryReceivingVoucher.Where(x => listkho.Contains(x.WarehouseId))
                     .Select(y => new InventoryReceivingVoucherEntityModel
                     {
                         InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                         InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
                         StatusId = y.StatusId,
                         InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
                         WarehouseId = y.WarehouseId,
                         InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
                         OrderNumber = y.OrderNumber,
                         InvoiceNumber = y.InvoiceNumber,
                         CreatedById = y.CreatedById,
                         CreatedDate = y.CreatedDate
                     }).ToList();

                #region Các trường hợp Ngày nhập kho và Ngày lập phiếu
                //if (parameter.FromDate != null && parameter.ToDate != null)
                //{
                //    listPhieuNhapKho = listPhieuNhapKho.Where(x =>
                //            x.InventoryReceivingVoucherDate >= parameter.FromDate.Date &&
                //             x.InventoryReceivingVoucherDate <= parameter.ToDate.Date).ToList();
                //}
                #endregion

                List<ChiTietSanPhamPhieuNhapKho> chiTietSanPhamPhieuNhapKhos = new List<ChiTietSanPhamPhieuNhapKho>();

                if (listPhieuNhapKho.Count > 0)
                {
                    var productUnitTypeId = context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                    var listAllProductUnit = context.Category.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                    listPhieuNhapKho.ForEach(item =>
                    {

                        #region Lấy tên loại phiếu

                        if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.TPSDG)
                        {
                            item.InventoryReceivingVoucherTypeName = "Nhập thành phẩm sau đóng gói";
                        }
                        else if (item.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.TPKTL)
                        {
                            item.InventoryReceivingVoucherTypeName = "Nhập thành phẩm sau kiểm tra";
                        }

                        #endregion

                        #region Lấy tên trạng thái
                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                            ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.StatusName = status?.CategoryName;

                        switch (item.StatusName)
                        {
                            case "Mới":
                                item.IntStatus = 0;
                                break;
                            case "Đã nhập kho":
                                item.IntStatus = 1;
                                break;
                        }

                        //Lay ra so luong nhap
                        var listMapping = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == item.InventoryReceivingVoucherId).ToList();
                        listMapping.ForEach(map =>
                        {
                            item.QuantityActual += map.QuantityOk ?? 0;
                        });

                        #endregion
                        var chitiet = new ChiTietSanPhamPhieuNhapKho();
                        chitiet.InventoryReceivingVoucherId = item.InventoryReceivingVoucherId;
                        chitiet.TenPhieuNhap = item.InventoryReceivingVoucherCode;
                        chitiet.NgayNhap = item.InventoryReceivingVoucherDate;
                        chitiet.LoaiPhieu = item.InventoryReceivingVoucherTypeName;
                        chitiet.ProductName = "";
                        chitiet.QuantityOk = 0;

                        var listPhieuNhapKhoMapping = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == item.InventoryReceivingVoucherId).ToList();
                        listPhieuNhapKhoMapping.ForEach(detail =>
                        {
                            var productByid = context.Product.FirstOrDefault(p => p.ProductId == detail.ProductId);
                            if (productByid != null)
                            {
                                chitiet.ProductName += string.IsNullOrEmpty(chitiet.ProductName) ? productByid.ProductName : ", " + productByid.ProductName;
                            }
                            chitiet.QuantityOk += detail.QuantityOk;
                        });

                        chiTietSanPhamPhieuNhapKhos.Add(chitiet);
                    });

                    chiTietSanPhamPhieuNhapKhos = chiTietSanPhamPhieuNhapKhos.OrderByDescending(w => w.NgayNhap).ToList();
                    listPhieuNhapKho = listPhieuNhapKho.OrderByDescending(z => z.CreatedDate).ToList();
                }

                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListPhieuNhapKho = listPhieuNhapKho,
                    ChiTietSanPhamPhieuNhapKhos = chiTietSanPhamPhieuNhapKhos
                };
            }
            catch (Exception e)
            {
                return new SearchListPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetMasterDataPhieuNhapKhoResult GetMasterCreatePhieuNhapKhoNVLCCDC(GetMasterDataPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listWarehouse = new List<WareHouseEntityModel>();
                var listProduct = new List<ProductEntityModel>();
                var productType = parameter.WarehouseType == 0 ? (int)ProductType.NVL : parameter.WarehouseType == 4 ? (int)ProductType.ThanhPham : (int)ProductType.CCDC;

                listProduct = context.Product.Where(x => x.Active == true && x.ProductType == productType).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId,
                    ProductUnitName = ""
                }).OrderBy(z => z.ProductName).ToList();

                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct =
                    context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();

                var listLotNo = context.LotNo.ToList();

                listProduct.ForEach(item =>
                {
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId);

                    if (unit != null)
                    {
                        item.ProductUnitName = unit.CategoryName ?? "";
                    }

                    item.ListProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == item.ProductId).Select(lo => new ProductLotNoMappingEntityModel()
                    {
                        ProductId = item.ProductId,
                        LotNoId = lo.LotNoId,
                        LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lo.LotNoId).LotNoName
                    }).ToList();

                });

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var typekhoId = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                listWarehouse = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == typekhoId).Select(y =>
                    new WareHouseEntityModel
                    {
                        WarehouseId = y.WarehouseId,
                        WarehouseParent = y.WarehouseParent,
                        HasChild = false,
                        WarehouseCode = y.WarehouseCode,
                        WarehouseName = y.WarehouseName,
                        WarehouseCodeName = y.WarehouseCode.Trim() + " - " + y.WarehouseName.Trim()
                    }).OrderBy(z => z.WarehouseName).ToList();

                var EmployeeDepartment = "";
                var NameCreate = "";
                var listAllUser = context.User.ToList();

                var listAllEmployee = context.Employee.ToList();
                var userCurrent = listAllUser.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);

                var employeeId = userCurrent.EmployeeId;
                var employee = listAllEmployee.FirstOrDefault(x => x.EmployeeId == employeeId);

                if (userCurrent != null)
                {
                    #region Lấy bộ phận người tạo
                    EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == employee.OrganizationId).OrganizationName;
                    NameCreate = employee.EmployeeName;
                    #endregion
                }
                #region get Tháng kiểm kê
                var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
                var listAllWarehouse = context.Warehouse.ToList();
                var listAllChiTietDotKiemKe = context.DotKiemKeChiTiet.ToList();
                var listDotKiemKe = context.DotKiemKe.Where(x => x.TrangThaiId == 2).OrderByDescending(x => x.ThangKiemKe)
                    .Select(x => new DotKiemKeEntityModel
                    {
                        DotKiemKeId = x.DotKiemKeId,
                        WarehouseId = x.WarehouseId,
                        WarehouseName = listAllWarehouse.FirstOrDefault(y => y.WarehouseId == x.WarehouseId).WarehouseName,
                        TenDotKiemKe = "Tháng " + x.ThangKiemKe.Value.Month + "/" + x.ThangKiemKe.Value.Year,
                        TenTrangThai = listTrangThaiKiemKe.FirstOrDefault(y => y.Value == x.TrangThaiId).Name,
                        ThangKiemKe = x.ThangKiemKe.Value,
                    }).ToList();
                #endregion

                return new GetMasterDataPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListWarehouse = listWarehouse,
                    ListProduct = listProduct,
                    EmployeeDepartment = EmployeeDepartment,
                    NameCreate = NameCreate,
                    ListDotKiemKe = listDotKiemKe,
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoNVLCCDC(GetDetailPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listWarehouse = new List<WareHouseEntityModel>();
                var listProduct = new List<ProductEntityModel>();
                var ListInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMappingEntityModel>();

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                listWarehouse = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == loaikho_id).Select(y =>
                    new WareHouseEntityModel
                    {
                        WarehouseId = y.WarehouseId,
                        WarehouseParent = y.WarehouseParent,
                        HasChild = false,
                        WarehouseCode = y.WarehouseCode,
                        WarehouseName = y.WarehouseName,
                        WarehouseCodeName = y.WarehouseCode.Trim() + " - " + y.WarehouseName.Trim()
                    }).OrderBy(z => z.WarehouseName).ToList();

                var phieuNhapKho = context.InventoryReceivingVoucher.Where(x =>
                    x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(y =>
                    new PhieuNhapKhoModel
                    {
                        InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                        InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
                        StatusId = y.StatusId,
                        InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
                        WarehouseId = y.WarehouseId,
                        ShiperName = y.ShiperName,
                        InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
                        InventoryReceivingVoucherTime = y.InventoryReceivingVoucherTime,
                        Description = y.Description,
                        Note = y.Note,
                        VendorId = y.VendorId,
                        StatusName = "",
                        StatusCode = "",
                        EmployeeCodeName = "",
                        TotalQuantityActual = 0,
                        ProducerName = y.ProducerName,
                        OrderNumber = y.OrderNumber,
                        OrderDate = y.OrderDate,
                        InvoiceNumber = y.InvoiceNumber,
                        InvoiceDate = y.InvoiceDate,
                        InventoryReceivingVoucherCategory = y.InventoryReceivingVoucherCategory,
                        BoxGreen = y.BoxGreen,
                        BoxGreenMax = y.BoxGreenMax,
                        PalletMax = y.PalletMax,
                        PalletNormal = y.PalletNormal,
                        BoxBlue = y.BoxBlue,
                        PalletSmall = y.PalletSmall,
                        CreatedById = y.CreatedById,
                        CreatedDate = y.CreatedDate
                    }).FirstOrDefault();

                if (phieuNhapKho == null)
                {
                    return new GetDetailPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
                    };
                }

                var listItemDetail = context.InventoryReceivingVoucherMapping
                    .Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(y =>
                        new SanPhamPhieuNhapKhoModel
                        {
                            InventoryReceivingVoucherMappingId = y.InventoryReceivingVoucherMappingId,
                            InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                            ProductId = y.ProductId,
                            LotNoId = y.LotNoId,
                            LotNoName = context.LotNo.FirstOrDefault(x => x.LotNoId == y.LotNoId).LotNoName,
                            QuantityActual = y.QuantityActual,
                            ProductCode = "",
                            Description = y.Description,
                            UnitName = "",
                            PackagingStatus = y.PackagingStatus,
                            ProductStatus = y.ProductStatus
                        }).ToList();

                var listItemGroup = listItemDetail.GroupBy(w => w.ProductId)
                                                                             .Select(s =>
                                                                              new SanPhamPhieuNhapKhoModel
                                                                              {
                                                                                  ProductId = s.Key,
                                                                                  QuantityActual = s.Sum(sum => sum.QuantityActual)
                                                                              }).ToList();


                #region chi tiet nguyen vat lieu nhap kho
                var listAllProduct = context.Product.ToList();
                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct =
                    context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();
                var listLotNo = context.LotNo.ToList();
                listItemDetail.ForEach(item =>
                {
                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);

                    item.ProductName = product.ProductName.Trim();
                    item.ProductCode = product.ProductCode.Trim();
                    item.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                    item.LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == item.LotNoId)?.LotNoName;
                });

                listItemGroup.ForEach(item =>
                {
                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);

                    item.ProductCode = product.ProductCode.Trim();
                    item.ProductName = product.ProductName.Trim();
                    item.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                });
                #endregion

                var producType = parameter.WarehouseType == (int)WarehouseType.NVL ? 0 : 2;

                listProduct = context.Product.Where(x => x.Active == true && x.ProductType == producType).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId,
                    ProductUnitName = ""
                }).OrderBy(z => z.ProductName).ToList();


                listProduct.ForEach(item =>
                {
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId);

                    if (unit != null)
                    {
                        item.ProductUnitName = unit.CategoryName ?? "";
                    }

                    item.ListProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == item.ProductId).Select(lo => new ProductLotNoMappingEntityModel()
                    {
                        ProductId = item.ProductId,
                        LotNoId = lo.LotNoId,
                        LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lo.LotNoId).LotNoName
                    }).ToList();
                });

                #region Lấy tên loại phiếu

                if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập mới";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập khác";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNL)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập lại";
                }
                #endregion

                #region Lấy tên trạng thái Phiếu nhập kho

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var listStatus_PNK = context.Category
                    .Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                var status = listStatus_PNK.FirstOrDefault(x => x.CategoryId == phieuNhapKho.StatusId);
                phieuNhapKho.StatusName = status != null ? status.CategoryName.Trim() : "";
                phieuNhapKho.StatusCode = status != null ? status.CategoryCode.Trim() : "";


                switch (phieuNhapKho.StatusName)
                {
                    case "Mới":
                        phieuNhapKho.IntStatus = 0;
                        break;
                    case "Đã nhập kho":
                        phieuNhapKho.IntStatus = 1;
                        break;
                }
                #endregion

                #region Lấy tên người lập phiếu nhập kho

                var userCreated = context.User.FirstOrDefault(x => x.UserId == phieuNhapKho.CreatedById);
                var employeeCreated = context.Employee.FirstOrDefault(x => x.EmployeeId == userCreated.EmployeeId);
                phieuNhapKho.EmployeeCodeName =
                    employeeCreated.EmployeeCode.Trim() + " - " + employeeCreated.EmployeeName.Trim();

                #endregion

                #region Lấy bộ phận người tạo

                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);
                var employeeId = user.EmployeeId;
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == employeeId);

                phieuNhapKho.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == employee.OrganizationId).OrganizationName;

                #endregion

                #region Lấy list ghi chú

                var noteHistory = new List<NoteEntityModel>();

                noteHistory = context.Note
                    .Where(x => x.ObjectId == parameter.InventoryReceivingVoucherId && x.ObjectType == "PNK" &&
                                x.Active == true).Select(
                        y => new NoteEntityModel
                        {
                            NoteId = y.NoteId,
                            Description = y.Description,
                            Type = y.Type,
                            ObjectId = y.ObjectId,
                            ObjectType = y.ObjectType,
                            NoteTitle = y.NoteTitle,
                            Active = y.Active,
                            CreatedById = y.CreatedById,
                            CreatedDate = y.CreatedDate,
                            UpdatedById = y.UpdatedById,
                            UpdatedDate = y.UpdatedDate,
                            ResponsibleName = "",
                            ResponsibleAvatar = "",
                            NoteDocList = new List<NoteDocumentEntityModel>()
                        }).ToList();

                if (noteHistory.Count > 0)
                {
                    var listNoteId = noteHistory.Select(x => x.NoteId).ToList();
                    var listUser = context.User.ToList();
                    var _listAllEmployee = context.Employee.ToList();
                    var listNoteDocument = context.NoteDocument.Where(x => listNoteId.Contains(x.NoteId)).Select(
                        y => new NoteDocumentEntityModel
                        {
                            DocumentName = y.DocumentName,
                            DocumentSize = y.DocumentSize,
                            DocumentUrl = y.DocumentUrl,
                            CreatedById = y.CreatedById,
                            CreatedDate = y.CreatedDate,
                            UpdatedById = y.UpdatedById,
                            UpdatedDate = y.UpdatedDate,
                            NoteDocumentId = y.NoteDocumentId,
                            NoteId = y.NoteId
                        }).ToList();

                    noteHistory.ForEach(item =>
                    {
                        var _user = listUser.FirstOrDefault(x => x.UserId == item.CreatedById);
                        var _employee = _listAllEmployee.FirstOrDefault(x => x.EmployeeId == _user.EmployeeId);
                        item.ResponsibleName = _employee.EmployeeName;
                        item.NoteDocList = listNoteDocument.Where(x => x.NoteId == item.NoteId)
                            .OrderByDescending(z => z.UpdatedDate).ToList();
                    });

                    //Sắp xếp lại listNote
                    noteHistory = noteHistory.OrderByDescending(x => x.CreatedDate).ToList();
                }

                #endregion

                #region get Tháng kiểm kê
                var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
                var listAllWarehouse = context.Warehouse.ToList();
                var listAllChiTietDotKiemKe = context.DotKiemKeChiTiet.ToList();
                var listDotKiemKe = context.DotKiemKe.Where(x => x.TrangThaiId == 2).OrderByDescending(x => x.ThangKiemKe)
                    .Select(x => new DotKiemKeEntityModel
                    {
                        DotKiemKeId = x.DotKiemKeId,
                        WarehouseId = x.WarehouseId,
                        WarehouseName = listAllWarehouse.FirstOrDefault(y => y.WarehouseId == x.WarehouseId).WarehouseName,
                        TenDotKiemKe = "Tháng " + x.ThangKiemKe.Value.Month + "/" + x.ThangKiemKe.Value.Year,
                        TenTrangThai = listTrangThaiKiemKe.FirstOrDefault(y => y.Value == x.TrangThaiId).Name,
                        ThangKiemKe = x.ThangKiemKe.Value,
                    }).ToList();
                #endregion

                return new GetDetailPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListWarehouse = listWarehouse,
                    PhieuNhapKho = phieuNhapKho,
                    ListItemDetail = listItemDetail,
                    ListProduct = listProduct,
                    NoteHistory = noteHistory,
                    ListItemGroup = listItemGroup,
                    ListDotKiemKe = listDotKiemKe,
                };
            }
            catch (Exception e)
            {
                return new GetDetailPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoSX(GetDetailPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listWarehouse = new List<WareHouseEntityModel>();
                var listProduct = new List<ProductEntityModel>();
                var ListInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMappingEntityModel>();

                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                var phieuNhapKho = context.InventoryReceivingVoucher.Where(x =>
                    x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(y =>
                    new PhieuNhapKhoModel
                    {
                        InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                        InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
                        StatusId = y.StatusId,
                        InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
                        WarehouseId = y.WarehouseId,
                        InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
                        InventoryReceivingVoucherTime = y.InventoryReceivingVoucherTime,
                        Description = y.Description,
                        StatusName = "",
                        StatusCode = "",
                        CreatedById = y.CreatedById,
                        CreatedDate = y.CreatedDate,
                        ObjectId = y.ObjectId,
                        ProductName = "",
                        ProductCode = "",
                        StateId = Guid.Empty,
                        StateName = "",
                        StateCode = "",
                        LotNoName = "",
                        LotNoId = 0,
                    }).FirstOrDefault();

                if (phieuNhapKho == null)
                {
                    return new GetDetailPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
                    };
                }

                #region Lấy tên loại phiếu

                if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập mới NVL";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập trả lại NVL";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNNG)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập NG";
                } 
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNTP)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập NG";
                }

                //Lay phieu xuat kho
                var phieuXuatKho = context.InventoryDeliveryVoucher.FirstOrDefault(x => x.InventoryDeliveryVoucherId == phieuNhapKho.ObjectId);
                if (phieuXuatKho != null)
                {
                    phieuNhapKho.FromInventoryDeliveryVoucherCode = phieuXuatKho.InventoryDeliveryVoucherCode;
                    phieuNhapKho.WarehouseDelivery = context.Warehouse.FirstOrDefault(x => x.WarehouseId == phieuXuatKho.WarehouseId).WarehouseName;
                    phieuNhapKho.WarehouseReceiving = context.Warehouse.FirstOrDefault(x => x.WarehouseId == phieuXuatKho.WarehouseReceivingId).WarehouseName;
                }
                #endregion

                var listItemDetail = context.InventoryReceivingVoucherMapping
                    .Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(y =>
                        new SanPhamPhieuNhapKhoModel
                        {
                            InventoryReceivingVoucherMappingId = y.InventoryReceivingVoucherMappingId,
                            InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                            ProductId = y.ProductId,
                            ProductName = context.Product.FirstOrDefault(x => x.ProductId == y.ProductId).ProductName,
                            LotNoId = y.LotNoId,
                            LotNoName = context.LotNo.FirstOrDefault(x => x.LotNoId == y.LotNoId).LotNoName,
                            QuantityActual = y.QuantityActual,
                            Description = y.Description,
                        }).ToList();

                var listItemGroup = listItemDetail.GroupBy(w => w.ProductId)
                                                                            .Select(s =>
                                                                             new SanPhamPhieuNhapKhoModel
                                                                             {
                                                                                 ProductId = s.Key,
                                                                                 QuantityActual = s.Sum(sum => sum.QuantityActual)
                                                                             }).ToList();


                #region chi tiet nguyen vat lieu nhap kho
                var listProductId = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(x => x.ProductId).Distinct().ToList();

                var listAllProduct = context.Product.Where(x => x.Active == true).ToList();
                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct = context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();
                var listLotNo = context.LotNo.ToList();

                listItemDetail.ForEach(item =>
                {
                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);

                    item.ProductCode = product.ProductCode.Trim();
                    item.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                    item.LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == item.LotNoId)?.LotNoName;
                });

                listItemGroup.ForEach(item =>
                {
                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);

                    item.ProductCode = product.ProductCode.Trim();
                    item.ProductName = product.ProductName.Trim();
                    item.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                });


                #endregion


                listProduct = context.Product.Where(x => listProductId.Contains(x.ProductId)).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId,
                    ProductUnitName = ""
                }).OrderBy(z => z.ProductName).ToList();


                listProduct.ForEach(item =>
                {
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId);

                    if (unit != null)
                    {
                        item.ProductUnitName = unit.CategoryName ?? "";
                    }

                    item.ListProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == item.ProductId).Select(lo => new ProductLotNoMappingEntityModel()
                    {
                        ProductId = item.ProductId,
                        LotNoId = lo.LotNoId,
                        LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lo.LotNoId).LotNoName
                    }).ToList();
                });

                #region Lấy tên trạng thái Phiếu nhập kho

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var listStatus_PNK = context.Category
                    .Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                var status = listStatus_PNK.FirstOrDefault(x => x.CategoryId == phieuNhapKho.StatusId);
                phieuNhapKho.StatusName = status != null ? status.CategoryName.Trim() : "";
                phieuNhapKho.StatusCode = status != null ? status.CategoryCode.Trim() : "";


                switch (phieuNhapKho.StatusName)
                {
                    case "Mới":
                        phieuNhapKho.IntStatus = 0;
                        break;
                    case "Đã nhập kho":
                        phieuNhapKho.IntStatus = 1;
                        break;
                }
                #endregion

                //#region Lấy tên người lập phiếu nhập kho

                //var userCreated = context.User.FirstOrDefault(x => x.UserId == phieuNhapKho.CreatedById);
                //var employeeCreated = context.Employee.FirstOrDefault(x => x.EmployeeId == userCreated.EmployeeId);
                //phieuNhapKho.EmployeeCodeName =
                //    employeeCreated.EmployeeCode.Trim() + " - " + employeeCreated.EmployeeName.Trim();

                //#endregion

                #region Lấy bộ phận người tạo

                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);
                var employeeId = user.EmployeeId;
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == employeeId);

                phieuNhapKho.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == employee.OrganizationId).OrganizationName;

                #endregion

                #region Get Lô

                var stageByInventory = context.ProductionProcessStageImportExport.FirstOrDefault(w => w.InventoryVoucherId == parameter.InventoryReceivingVoucherId);
                if (stageByInventory != null)
                {
                    phieuNhapKho.StateId = stageByInventory.StageNameId;
                    var stateItem = context.Category.FirstOrDefault(c => c.CategoryId == stageByInventory.StageNameId);
                    if (stateItem != null)
                    {
                        phieuNhapKho.StateCode = stateItem.CategoryCode;
                        phieuNhapKho.StateName = stateItem.CategoryName;
                    }

                    var productionProcessItem = context.ProductionProcessDetail.FirstOrDefault(w => w.Id == stageByInventory.ProductionProcessDetailId);
                    if (productionProcessItem != null)
                    {
                        phieuNhapKho.ProductId = productionProcessItem.ProductId;
                        var productItem = context.Product.FirstOrDefault(x => x.ProductId == productionProcessItem.ProductId);
                        if (productItem != null)
                        {
                            phieuNhapKho.ProductCode = productItem.ProductCode;
                            phieuNhapKho.ProductName = productItem.ProductName;
                        }

                        phieuNhapKho.LotNoId = productionProcessItem.LotNoId;
                        var lotNoItem = context.LotNo.FirstOrDefault(c => c.LotNoId == productionProcessItem.LotNoId);
                        if (lotNoItem != null)
                        {
                            phieuNhapKho.LotNoName = lotNoItem.LotNoName;
                        }
                    }
                }
                phieuNhapKho.WarehouseName = context.Warehouse.FirstOrDefault(w => w.WarehouseId == phieuNhapKho.WarehouseId)?.WarehouseName ?? string.Empty;
                #endregion

                return new GetDetailPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    //ListWarehouse = listWarehouse,
                    PhieuNhapKho = phieuNhapKho,
                    ListItemDetail = listItemDetail,
                    ListProduct = listProduct,
                    ListItemGroup = listItemGroup,
                    //NoteHistory = noteHistory
                };
            }
            catch (Exception e)
            {
                return new GetDetailPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        public GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoTSD(GetDetailPhieuNhapKhoParameter parameter)
        {
            throw new NotImplementedException();
        }
        public GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoTP(GetDetailPhieuNhapKhoParameter parameter)
        {
            try
            {
                var listProduct = new List<ProductEntityModel>();
                var ListInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMappingEntityModel>();

                var phieuNhapKho = context.InventoryReceivingVoucher.Where(x =>
                    x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(y =>
                    new PhieuNhapKhoModel
                    {
                        InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                        InventoryReceivingVoucherCode = y.InventoryReceivingVoucherCode,
                        StatusId = y.StatusId,
                        InventoryReceivingVoucherType = y.InventoryReceivingVoucherType,
                        WarehouseId = y.WarehouseId,
                        InventoryReceivingVoucherDate = y.InventoryReceivingVoucherDate,
                        Description = y.Description,
                        Note = y.Note,
                        StatusName = "",
                        StatusCode = "",
                        InventoryReceivingVoucherCategory = y.InventoryReceivingVoucherCategory,
                        CreatedById = y.CreatedById,
                        CreatedDate = y.CreatedDate
                    }).FirstOrDefault();

                if (phieuNhapKho == null)
                {
                    return new GetDetailPhieuNhapKhoResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phiếu nhập kho không tồn tại trên hệ thống"
                    };
                }

                var listItemDetail = context.InventoryReceivingVoucherMapping
                    .Where(x => x.InventoryReceivingVoucherId == parameter.InventoryReceivingVoucherId).Select(y =>
                        new SanPhamPhieuNhapKhoModel
                        {
                            InventoryReceivingVoucherMappingId = y.InventoryReceivingVoucherMappingId,
                            InventoryReceivingVoucherId = y.InventoryReceivingVoucherId,
                            ProductId = y.ProductId,
                            LotNoId = y.LotNoId,
                            LotNoName = context.LotNo.FirstOrDefault(x => x.LotNoId == y.LotNoId).LotNoName,
                            QuantityActual = y.QuantityActual,
                            QuantityProduct = y.QuantityProduct ?? 0,
                            QuantityOK = y.QuantityOk ?? 0,
                            QuantityNG = y.QuantityNg ?? 0,
                            QuantityPending = y.QuantityPending ?? 0,
                            ProductCode = "",
                            Description = y.Description,
                            UnitName = "",
                        }).ToList();

                var listItemGroup = listItemDetail.GroupBy(w => w.ProductId)
                                                                             .Select(s =>
                                                                              new SanPhamPhieuNhapKhoModel
                                                                              {
                                                                                  ProductId = s.Key,
                                                                                  QuantityProduct = s.Sum(sum => sum.QuantityProduct),
                                                                                  QuantityOK = s.Sum(sum => sum.QuantityOK),
                                                                                  QuantityPending = s.Sum(sum => sum.QuantityPending),
                                                                                  QuantityNG = s.Sum(sum => sum.QuantityNG),
                                                                              }).ToList();


                #region Lấy tên loại phiếu
                if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNM)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập mới";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNK)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập khác";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.PNL)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập lại";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.TPSDG)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập thành phẩm sau đóng gói";
                }
                else if (phieuNhapKho.InventoryReceivingVoucherType == (int)InventoryReceivingVoucherType.TPKTL)
                {
                    phieuNhapKho.InventoryReceivingVoucherTypeName = "Nhập thành phẩm sau kiểm tra";
                }
                #endregion

                #region Lấy tên trạng thái phiếu nhập kho
                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")?.CategoryTypeId;
                var listStatus_PNK = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();
                var status = listStatus_PNK.FirstOrDefault(x => x.CategoryId == phieuNhapKho.StatusId);
                phieuNhapKho.StatusName = status != null ? status.CategoryName.Trim() : "";
                phieuNhapKho.StatusCode = status != null ? status.CategoryCode.Trim() : "";

                switch (phieuNhapKho.StatusName)
                {
                    case "Mới":
                        phieuNhapKho.IntStatus = 0;
                        break;
                    case "Đã nhập kho":
                        phieuNhapKho.IntStatus = 1;
                        break;
                }
                #endregion

                #region chi tiet nguyen vat lieu nhap kho
                var listAllProduct = context.Product.Where(x => x.Active == true).ToList();
                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct =
                    context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();
                var listLotNo = context.LotNo.ToList();
                listItemDetail.ForEach(item =>
                {
                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);

                    item.ProductName = product.ProductName.Trim();
                    item.ProductCode = product.ProductCode.Trim();
                    item.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                    item.LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == item.LotNoId)?.LotNoName;
                });


                listItemGroup.ForEach(item =>
                {
                    var product = listAllProduct.FirstOrDefault(x => x.ProductId == item.ProductId);
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == product?.ProductUnitId);


                    item.ProductCode = product.ProductCode.Trim();
                    item.ProductName = product.ProductName.Trim();
                    item.UnitName = unit != null ? unit.CategoryName.Trim() : "";
                });

                listProduct = context.Product.Where(x => x.Active == true && x.ProductType == (int)ProductType.ThanhPham).Select(y => new ProductEntityModel
                {
                    ProductId = y.ProductId,
                    ProductName = y.ProductName,
                    ProductCode = y.ProductCode,
                    ProductCodeName = y.ProductCode.Trim() + " - " + y.ProductName.Trim(),
                    ProductUnitId = y.ProductUnitId,
                    ProductUnitName = ""
                }).OrderBy(z => z.ProductName).ToList();


                listProduct.ForEach(item =>
                {
                    var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == item.ProductUnitId);

                    if (unit != null)
                    {
                        item.ProductUnitName = unit.CategoryName ?? "";
                    }

                    item.ListProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == item.ProductId).Select(lo => new ProductLotNoMappingEntityModel()
                    {
                        ProductId = item.ProductId,
                        LotNoId = lo.LotNoId,
                        LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lo.LotNoId).LotNoName
                    }).ToList();
                });
                #endregion

                return new GetDetailPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    //ListWarehouse = listWarehouse,
                    PhieuNhapKho = phieuNhapKho,
                    ListItemDetail = listItemDetail,
                    ListItemGroup = listItemGroup,
                    ListProduct = listProduct,
                    //NoteHistory = noteHistory
                };
            }
            catch (Exception e)
            {
                return new GetDetailPhieuNhapKhoResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherRequest(SearchInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var listAllUser = context.User.ToList();
                var listAllEmployee = context.Employee.ToList();
                var listAllContact = context.Contact.ToList();
                //check isManager
                var userCurrent = listAllUser.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);
                if (userCurrent == null)
                {
                    return new SearchInventoryDeliveryVoucherResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "User không có quyền truy xuất dữ liệu trong hệ thống"
                    };
                }
                if (userCurrent.EmployeeId == null || userCurrent.EmployeeId == Guid.Empty)
                {
                    return new SearchInventoryDeliveryVoucherResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Lỗi dữ liệu"
                    };
                }

                var employeeId = userCurrent.EmployeeId;
                var employee = listAllEmployee.FirstOrDefault(x => x.EmployeeId == employeeId);
                var isManager = employee.IsManager;
                var listPhieuXuatKho = new List<InventoryDeliveryVoucherEntityModel>();

                listPhieuXuatKho = context.InventoryDeliveryVoucher.Where(x => x.InventoryDeliveryVoucherScreenType == (int)ScreenType.DNX) // lấy danh sách cho màn hình đề nghị xuất kho
               .Select(y => new InventoryDeliveryVoucherEntityModel
               {
                   InventoryDeliveryVoucherId = y.InventoryDeliveryVoucherId,
                   InventoryDeliveryVoucherCode = y.InventoryDeliveryVoucherCode,
                   StatusId = y.StatusId,
                   InventoryDeliveryVoucherType = y.InventoryDeliveryVoucherType,
                   WarehouseId = y.WarehouseId,
                   WarehouseReceivingId = y.WarehouseReceivingId,
                   InventoryDeliveryVoucherReason = y.InventoryDeliveryVoucherReason,
                   InventoryDeliveryVoucherDate = y.InventoryDeliveryVoucherDate,
                   CreatedById = y.CreatedById,
                   CreatedDate = y.CreatedDate,
                   OrganizationId = y.OrganizationId,
                   WarehouseCategory = y.WarehouseCategory// NVL or CCDC
               }).ToList();

                if (listPhieuXuatKho.Count > 0)
                {
                    listPhieuXuatKho.ForEach(item =>
                    {
                        #region Lấy bộ phận người tạo
                        item.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId).OrganizationName;
                        item.NameCreate = listAllUser.FirstOrDefault(x => x.UserId == item.CreatedById).UserName;
                        #endregion

                        #region Lấy tên loại phiếu
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherReason == 1)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng ngày";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 2)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tuần";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 3)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tháng";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 4)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất văn phòng phẩm";
                        }

                        #endregion
                        #region Lấy tên kho đề nghị
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KHC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho hành chính";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XYC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất hủy";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XTL)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL";
                        }
                        #endregion

                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.NameStatus = status?.CategoryName;

                        switch (item.NameStatus)
                        {
                            case "Mới":
                                item.IntStatusDnx = 0;
                                break;
                            case "Chờ xuất kho":
                                item.IntStatusDnx = 1;
                                break;
                            case "Đã xuất kho":
                                item.IntStatusDnx = 2;
                                break;
                            case "Đã hủy":
                                item.IntStatusDnx = 3;
                                break;
                        }
                        #endregion
                    });
                }

                listPhieuXuatKho = listPhieuXuatKho.OrderByDescending(z => z.CreatedDate).ToList();

                return new SearchInventoryDeliveryVoucherResult
                {
                    lstResult = listPhieuXuatKho,
                    MessageCode = "Đã lọc xong danh sách phiếu nhập",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }

        }

        public SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherSX(SearchInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                //var listWarehouse = context.Warehouse.ToList();
                //var listOrganization = context.Organization.ToList();

                var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();
                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id && x.Department == parameter.OrganizationId).Select(x => x.WarehouseId).ToList();

                var listPhieuXuatKho = context.InventoryDeliveryVoucher.Where(x => x.InventoryDeliveryVoucherScreenType == (int)ScreenType.SX && listkho.Contains(x.WarehouseId)
                && x.InventoryDeliveryVoucherDate >= parameter.FromDate && x.InventoryDeliveryVoucherDate <= parameter.ToDate) // lấy danh sách cho màn hình xuất kho SAN XUAT
                  .Select(y => new InventoryDeliveryVoucherEntityModel
                  {
                      InventoryDeliveryVoucherId = y.InventoryDeliveryVoucherId,
                      InventoryDeliveryVoucherCode = y.InventoryDeliveryVoucherCode,
                      StatusId = y.StatusId,
                      InventoryDeliveryVoucherType = y.InventoryDeliveryVoucherType,
                      WarehouseReceivingId = y.WarehouseReceivingId,
                      InventoryDeliveryVoucherReason = y.InventoryDeliveryVoucherReason,
                      InventoryDeliveryVoucherDate = y.InventoryDeliveryVoucherDate,
                      CreatedById = y.CreatedById,
                      CreatedDate = y.CreatedDate,
                      OrganizationId = y.OrganizationId,
                  }).ToList();

                List<ChiTietSanPhamPhieuXuatKho> chiTietSanPhamPhieuXuatKhos = new List<ChiTietSanPhamPhieuXuatKho>();
                if (listPhieuXuatKho.Count > 0)
                {
                    var commonCategoryType = context.CategoryType.ToList();
                    var commonCategory = context.Category.ToList();
                    var productUnitTypeId = commonCategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                    var listAllProductUnit = commonCategory.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                    listPhieuXuatKho.ForEach(item =>
                    {
                        #region Lấy bộ phận
                        item.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId)?.OrganizationName;

                        #endregion

                        #region Lấy tên loại phiếu
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherReason == 1)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng ngày";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 2)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tuần";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 3)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tháng";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 4)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất văn phòng phẩm";
                        }

                        #endregion
                        #region Lấy tên kho đề nghị
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KHC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho hành chính";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XYC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất khác";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XTL)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL kho NVL, CCDC";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLNVL)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL kho CSX";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.TLCCDC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại CCDC kho CSX";
                        }
                        #endregion

                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.NameStatus = status?.CategoryName;

                        item.DepartmentName = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId)?.OrganizationName;
                        #endregion

                        var listPhieuXuatKhoMapping = context.InventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == item.InventoryDeliveryVoucherId).ToList();

                        listPhieuXuatKhoMapping.ForEach(map =>
                        {
                            var product = context.Product.FirstOrDefault(x => x.ProductId == map.ProductId);

                            var chitiet = new ChiTietSanPhamPhieuXuatKho();
                            chitiet.ProductId = product.ProductId;
                            chitiet.TenPhieuXuat = item.InventoryDeliveryVoucherCode;
                            chitiet.NgayXuat = item.InventoryDeliveryVoucherDate;
                            chitiet.ProductName = product.ProductName;
                            chitiet.ProductUnitName = listAllProductUnit.FirstOrDefault(c => c.CategoryId == product.ProductUnitId)?.CategoryName ?? "";
                            chitiet.Quantity = map.QuantityDelivery;
                            chitiet.ProductCategoryName = context.Category.FirstOrDefault(c => c.Active == true && c.CategoryId == product.ProductCategoryId)?.CategoryName ?? "";
                            chitiet.OrganizationName = item.EmployeeDepartment;
                            chiTietSanPhamPhieuXuatKhos.Add(chitiet);
                        });
                    });
                }

                listPhieuXuatKho = listPhieuXuatKho.OrderByDescending(z => z.CreatedDate).ToList();

                return new SearchInventoryDeliveryVoucherResult
                {
                    lstResult = listPhieuXuatKho,
                    ChiTietSanPhamPhieuXuatKhos = chiTietSanPhamPhieuXuatKhos,
                    MessageCode = "Đã lọc xong danh sách phiếu xuất",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherTP(SearchInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                //var listWarehouse = context.Warehouse.ToList();
                //var listOrganization = context.Organization.ToList();

                var listPhieuNhapKho = new List<InventoryReceivingVoucherEntityModel>();
                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var loaikho_id = context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                var listkho = context.Warehouse.Where(x => x.WareHouseType == loaikho_id).Select(x => x.WarehouseId).ToList();
                var lstInventoryType = new List<int>() { (int)InventoryDeliveryVoucherType.XBH, (int)InventoryDeliveryVoucherType.XNG };

                var listPhieuXuatKho = context.InventoryDeliveryVoucher.Where(x => x.InventoryDeliveryVoucherScreenType == (int)ScreenType.TP && listkho.Contains(x.WarehouseId)
                && lstInventoryType.Contains(x.InventoryDeliveryVoucherType)) // lấy danh sách cho màn hình xuất kho SAN XUAT
                  .Select(y => new InventoryDeliveryVoucherEntityModel
                  {
                      InventoryDeliveryVoucherId = y.InventoryDeliveryVoucherId,
                      InventoryDeliveryVoucherCode = y.InventoryDeliveryVoucherCode,
                      StatusId = y.StatusId,
                      InventoryDeliveryVoucherType = y.InventoryDeliveryVoucherType,
                      WarehouseReceivingId = y.WarehouseReceivingId,
                      InventoryDeliveryVoucherReason = y.InventoryDeliveryVoucherReason,
                      InventoryDeliveryVoucherDate = y.InventoryDeliveryVoucherDate,
                      CreatedById = y.CreatedById,
                      CreatedDate = y.CreatedDate,
                      OrganizationId = y.OrganizationId,
                  }).ToList();

                List<ChiTietSanPhamPhieuXuatKho> chiTietSanPhamPhieuXuatKhos = new List<ChiTietSanPhamPhieuXuatKho>();
                if (listPhieuXuatKho.Count > 0)
                {
                    var commonCategoryType = context.CategoryType.ToList();
                    var commonCategory = context.Category.ToList();
                    var productUnitTypeId = commonCategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                    var listAllProductUnit = commonCategory.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                    listPhieuXuatKho.ForEach(item =>
                    {
                        #region Lấy bộ phận
                        item.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId)?.OrganizationName;

                        #endregion

                        #region Lấy tên loại phiếu
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherReason == 1)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng ngày";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 2)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tuần";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 3)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tháng";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 4)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất văn phòng phẩm";
                        }

                        #endregion
                        #region Lấy tên kho đề nghị
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KHC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho hành chính";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Kho sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XYC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất khác";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XTL)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XNG)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất NG";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XBH)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất bán hàng";
                        }
                        #endregion

                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.NameStatus = status?.CategoryName;

                        item.DepartmentName = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId)?.OrganizationName;
                        #endregion

                        var listPhieuXuatKhoMapping = context.InventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == item.InventoryDeliveryVoucherId).ToList();

                        listPhieuXuatKhoMapping.ForEach(map =>
                        {
                            var product = context.Product.FirstOrDefault(x => x.ProductId == map.ProductId);

                            var chitiet = new ChiTietSanPhamPhieuXuatKho();
                            chitiet.ProductId = product.ProductId;
                            chitiet.TenPhieuXuat = item.InventoryDeliveryVoucherCode;
                            chitiet.NgayXuat = item.InventoryDeliveryVoucherDate;
                            chitiet.ProductName = product.ProductName;
                            chitiet.ProductUnitName = listAllProductUnit.FirstOrDefault(c => c.CategoryId == product.ProductUnitId)?.CategoryName ?? "";
                            chitiet.Quantity = map.QuantityDelivery;
                            chitiet.ProductCategoryName = context.Category.FirstOrDefault(c => c.Active == true && c.CategoryId == product.ProductCategoryId)?.CategoryName ?? "";
                            chitiet.OrganizationName = item.EmployeeDepartment;
                            chiTietSanPhamPhieuXuatKhos.Add(chitiet);
                        });
                    });
                }

                listPhieuXuatKho = listPhieuXuatKho.OrderByDescending(z => z.CreatedDate).ToList();

                return new SearchInventoryDeliveryVoucherResult
                {
                    lstResult = listPhieuXuatKho,
                    ChiTietSanPhamPhieuXuatKhos = chiTietSanPhamPhieuXuatKhos,
                    MessageCode = "Đã lọc xong danh sách phiếu xuất",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetListWareHouseResult GetListWareHouse(GetListWareHouseParameter parameter)
        {
            try
            {
                var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;

                var typekhoId = parameter.WarehouseType == null ? Guid.Empty : context.Category.FirstOrDefault(x => x.CategoryCode == ((WarehouseType)parameter.WarehouseType).ToString() && x.CategoryTypeId == categoryTypeId).CategoryId;

                List<Warehouse> listWareHouse = new List<Warehouse>();
                /*Do something..*/
                if (parameter.OrganizationId != null && parameter.OrganizationId != Guid.Empty)
                {
                    var listOrganization = new List<Guid>() { parameter.OrganizationId.Value };
                    //listOrganization = GetWareHouseChild(parameter.OrganizationId.Value, listOrganization);

                    listWareHouse = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && (typekhoId == Guid.Empty || (typekhoId != Guid.Empty && x.WareHouseType == typekhoId)) && x.Department.HasValue && listOrganization.Contains(x.Department.Value))
                   .OrderBy(x => x.WarehouseName).ToList();
                }
                else
                {
                    listWareHouse = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && (typekhoId == Guid.Empty || (typekhoId != Guid.Empty && x.WareHouseType == typekhoId)))
                    .OrderBy(x => x.WarehouseName).ToList();
                }
                /*End*/
                var listWareHourseEntityModel = new List<WareHouseEntityModel>();
                listWareHouse.ForEach(item =>
                {
                    listWareHourseEntityModel.Add(new WareHouseEntityModel(item));
                });
                return new GetListWareHouseResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    listWareHouse = listWareHourseEntityModel
                };
            }
            catch (Exception e)
            {
                return new GetListWareHouseResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public List<Guid> GetWareHouseChild(Guid OrganizationId, List<Guid> ListOrganization)
        {
            ListOrganization.Add(OrganizationId);

            var childernOrg = context.Organization.Where(o => o.ParentId == OrganizationId).ToList();
            if (childernOrg != null && childernOrg.Count > 0)
            {
                childernOrg.ForEach(item =>
                {
                    ListOrganization = GetWareHouseChild(item.OrganizationId, ListOrganization);
                });
            }

            return ListOrganization;
        }

        public SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherNVLCCDC(SearchInventoryDeliveryVoucherParameter parameter)
        {
            try
            {
                var listWarehouse = context.Warehouse.ToList();
                var listOrganization = context.Organization.ToList();


                var listPhieuXuatKho = context.InventoryDeliveryVoucher.Where(x => x.InventoryDeliveryVoucherScreenType == (int)ScreenType.NVL && x.WarehouseCategory == parameter.WarehouseType &&  x.InventoryDeliveryVoucherDate.Value.Date >= parameter.FromDate.Value.Date && x.InventoryDeliveryVoucherDate.Value.Date <= parameter.ToDate.Value.Date) // lấy danh sách cho màn hình xuất kho NVL, CCDC
                  .Select(y => new InventoryDeliveryVoucherEntityModel
                  {
                      InventoryDeliveryVoucherId = y.InventoryDeliveryVoucherId,
                      InventoryDeliveryVoucherCode = y.InventoryDeliveryVoucherCode,
                      StatusId = y.StatusId,
                      InventoryDeliveryVoucherType = y.InventoryDeliveryVoucherType,
                      WarehouseReceivingId = y.WarehouseReceivingId,
                      InventoryDeliveryVoucherReason = y.InventoryDeliveryVoucherReason,
                      InventoryDeliveryVoucherDate = y.InventoryDeliveryVoucherDate,
                      CreatedById = y.CreatedById,
                      CreatedDate = y.CreatedDate,
                      OrganizationId = y.OrganizationId,
                  }).ToList();

                List<ChiTietSanPhamPhieuXuatKho> chiTietSanPhamPhieuXuatKhos = new List<ChiTietSanPhamPhieuXuatKho>();
                if (listPhieuXuatKho.Count > 0)
                {
                    var commonCategoryType = context.CategoryType.ToList();
                    var commonCategory = context.Category.ToList();
                    var productUnitTypeId = commonCategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                    var listAllProductUnit = commonCategory.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();

                    listPhieuXuatKho.ForEach(item =>
                    {
                        #region Lấy bộ phận
                        item.EmployeeDepartment = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId)?.OrganizationName;

                        #endregion

                        #region Lấy tên loại phiếu
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherReason == 1)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng ngày";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 2)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tuần";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 3)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất vật tư tiêu hao hàng tháng";
                        }
                        else if (item.InventoryDeliveryVoucherReason == 4)
                        {
                            item.InventoryDeliveryVoucherReasonText = "Xuất văn phòng phẩm";
                        }

                        #endregion
                        #region Lấy tên kho đề nghị
                        // Xuất hàng ngày = 1, hàng tuần =2, hàng tháng =3, xuất văn phòng phẩm = 4
                        if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KHC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";//"Kho hành chính";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.KSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất theo yêu cầu";//"Kho sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XYC)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất lại";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XH)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất khác";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XSX)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất sản xuất";
                        }
                        else if (item.InventoryDeliveryVoucherType == (int)InventoryDeliveryVoucherType.XTL)
                        {
                            item.InventoryDeliveryVoucherTypeText = "Xuất trả lại NVL";
                        }
                        #endregion

                        #region Lấy tên trạng thái

                        var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPHX")
                        ?.CategoryTypeId;
                        var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusTypeId_PNK).ToList();

                        var status = listAllStatus.FirstOrDefault(x => x.CategoryId == item.StatusId);
                        item.NameStatus = status?.CategoryName;

                        item.DepartmentName = context.Organization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId)?.OrganizationName;
                        #endregion

                        var listPhieuXuatKhoMapping = context.InventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == item.InventoryDeliveryVoucherId).ToList();

                        var listMappingGroup = listPhieuXuatKhoMapping.GroupBy(w => w.ProductId)
                                                                          .Select(s =>
                                                                           new ChiTietSanPhamPhieuXuatKho
                                                                           {
                                                                               ProductId = s.Key,
                                                                               Quantity = s.Sum(sum => sum.QuantityDelivery)
                                                                           }).ToList();

                        listMappingGroup.ForEach(map =>
                        {
                            var product = context.Product.FirstOrDefault(x => x.ProductId == map.ProductId);

                            var chitiet = new ChiTietSanPhamPhieuXuatKho();
                            chitiet.InventoryDeliveryVoucherId = item.InventoryDeliveryVoucherId;
                            chitiet.ProductId = product.ProductId;
                            chitiet.TenPhieuXuat = item.InventoryDeliveryVoucherCode;
                            chitiet.NgayXuat = item.InventoryDeliveryVoucherDate == null ? item.InventoryDeliveryVoucherDate : item.InventoryDeliveryVoucherDate.Value.Date;
                            chitiet.ProductName = product.ProductName;
                            chitiet.ProductUnitName = listAllProductUnit.FirstOrDefault(c => c.CategoryId == product.ProductUnitId)?.CategoryName ?? "";
                            chitiet.Quantity = map.Quantity;
                            chitiet.ProductCategoryName = context.Category.FirstOrDefault(c => c.Active == true && c.CategoryId == product.ProductCategoryId)?.CategoryName ?? "";
                            chitiet.OrganizationName = item.EmployeeDepartment;
                            chiTietSanPhamPhieuXuatKhos.Add(chitiet);
                        });
                    });
                }

                listPhieuXuatKho = listPhieuXuatKho.OrderByDescending(z => z.CreatedDate).ToList();

                var chiTietSanPhamPhieuXuatKhosGroup = chiTietSanPhamPhieuXuatKhos.GroupBy(w => new { w.NgayXuat, w.ProductName, w.OrganizationName }).Select(w => new ChiTietSanPhamPhieuXuatKho
                {
                    ProductId = w.First().ProductId,
                    ProductName = w.First().ProductName,
                    NgayXuat = w.First().NgayXuat,
                    Quantity = w.Sum(c => c.Quantity),
                    ProductUnitName = w.First().ProductUnitName,
                    ProductCategoryName = w.First().ProductCategoryName,
                    TenPhieuXuat = w.First().TenPhieuXuat,
                    OrganizationName = w.First().OrganizationName,
                    InventoryDeliveryVoucherId = w.First().InventoryDeliveryVoucherId,
                }).ToList();

                return new SearchInventoryDeliveryVoucherResult
                {
                    lstResult = listPhieuXuatKho,
                    ChiTietSanPhamPhieuXuatKhos = chiTietSanPhamPhieuXuatKhosGroup,
                    MessageCode = "Đã lọc xong danh sách phiếu xuất",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchInventoryDeliveryVoucherResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetEmployeeByOrganizationIdResult GetEmployeeByOrganizationId(GetEmployeeByOrganizationIdParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.GETBYID, ObjectName.EMPLOYEE, "Get Employee By OrganizationId", parameter.UserId);
                var listEmployee = (from employee in context.Employee
                                    where parameter.OrganizationId == employee.OrganizationId && employee.Active == true
                                    select new
                                    {
                                        employee.EmployeeId,
                                        employee.EmployeeName
                                    }
                                    ).ToList();

                List<dynamic> lstResult = new List<dynamic>();
                listEmployee.ForEach(item =>
                {
                    var sampleObject = new ExpandoObject() as IDictionary<string, Object>;
                    sampleObject.Add("EmployeeId", item.EmployeeId);
                    sampleObject.Add("EmployeeName", item.EmployeeName);
                    lstResult.Add(sampleObject);
                });

                return new GetEmployeeByOrganizationIdResult()
                {
                    listEmployee = lstResult,
                    MessageCode = "Đã lọc được kho nhận",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new GetEmployeeByOrganizationIdResult
                {
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public GetInventoryInfoTPResult GetChiTietBaoCaoTP(GetInventoryInfoTPParameter parameter)
        {
            try
            {
                DateTime fromDate = parameter.FromNgay.Value;
                DateTime toDate = parameter.ToNgay.Value;

                var listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.ThanhPham && x.Active == true).ToList();
                var categories = context.Category.Where(ct => ct.Active == true).ToList();
                var lotno = context.LotNo.ToList();
                var inventory = context.InventoryReport.ToList();

                var listChiTietLotno = new List<InventoryInfoProductTPEntityModel>();
                //Get all kho co loai la thanh pham
                var loaikho_id = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "KHO")?.CategoryTypeId;
                var khotp = context.Category.FirstOrDefault(x => x.CategoryCode == "KTP" && x.CategoryTypeId == loaikho_id)?.CategoryId;

                var listWareHouseId = context.Warehouse.Where(x => x.Active && x.WarehouseParent == null && x.WareHouseType == khotp).Select(x => x.WarehouseId).ToList();

                var listProductLotNoMapping = context.ProductLotNoMapping.Where(x => x.ProductId == parameter.ProductId).ToList();
                var ListLotnoTongHop = new List<InventoryInfoProductTPEntityModel>();
                listProductLotNoMapping.ForEach(map =>
                {
                    decimal tondauky_map = 0;
                    decimal nhapkho_map = 0;
                    decimal xuatkho_map = 0;
                    decimal toncuoiky_map = 0;

                    listWareHouseId.ForEach(khoid =>
                    {
                        var itemTonDauKy = inventory.Where(x => x.ProductId == parameter.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date < fromDate.Date).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        var itemTonCuoiKy = inventory.Where(x => x.ProductId == parameter.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date <= toDate).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
                        if (itemTonDauKy != null)
                            tondauky_map += itemTonDauKy.StartQuantity;
                        if (itemTonCuoiKy != null)
                            toncuoiky_map += itemTonCuoiKy.StartQuantity;

                        xuatkho_map += inventory.Where(x => x.ProductId == parameter.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                       .Sum(x => x.QuantityDelivery);
                        nhapkho_map += inventory.Where(x => x.ProductId == parameter.ProductId && x.LotNoId == map.LotNoId && x.WarehouseId == khoid && x.InventoryReportDate.Date >= fromDate && x.InventoryReportDate.Date <= toDate)
                        .Sum(x => x.QuantityReceiving);
                    });

                    var itemMap = new InventoryInfoProductTPEntityModel();
                    itemMap.LotNoName = lotno.FirstOrDefault(x => x.LotNoId == map.LotNoId)?.LotNoName;
                    itemMap.Date = fromDate;
                    itemMap.StartInventory = tondauky_map;
                    itemMap.EndInventory = toncuoiky_map;
                    itemMap.QuantityDelivery = xuatkho_map;
                    itemMap.QuantityReceiving = nhapkho_map;
                    itemMap.QuantityOK = 0;
                    itemMap.QuantityNG = 0;

                    listChiTietLotno.Add(itemMap);
                });

                return new GetInventoryInfoTPResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListChiTietLotno = listChiTietLotno,
                };
            }
            catch (Exception e)
            {
                return new GetInventoryInfoTPResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetInventoryStockByWarehouseResult GetInventoryStockByWarehouse(GetInventoryStockByWarehouseParameter parameter)
        {
            try
            {
                var listItemDetail = new List<InventoryDeliveryVoucherMappingEntityModel>();
                var listProducts = context.Product.ToList();
                if (parameter.InventoryType == (int)InventoryDeliveryVoucherType.TLNVL || parameter.InventoryType == (int)InventoryDeliveryVoucherType.XH || parameter.InventoryType == (int)InventoryDeliveryVoucherType.TLTSD)
                {
                    listProducts = listProducts.Where(x => x.ProductType == 0 && x.Active == true).ToList();
                }
                if (parameter.InventoryType == (int)InventoryDeliveryVoucherType.TLCCDC)
                {
                    listProducts = listProducts.Where(x => x.ProductType == 2 && x.Active == true).ToList();
                }
                var inventoryStock = context.InventoryReport.Where(ir => ir.WarehouseId == parameter.WarehouseId && ir.InventoryReportDate.Date == DateTime.Now.Date).ToList();

                var listLotNo = context.LotNo.ToList();
                var listWarehouse = context.Warehouse.ToList();
                //Đơn vị tính
                var unitProductType = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DNH");
                var listUnitProduct = context.Category.Where(x => x.CategoryTypeId == unitProductType.CategoryTypeId).ToList();

                inventoryStock.ForEach(item =>
                {

                    var pro = listProducts.FirstOrDefault(x => x.ProductId == item.ProductId);
                    if(pro != null)
                    {
                        var unit = listUnitProduct.FirstOrDefault(x => x.CategoryId == pro?.ProductUnitId);

                        InventoryDeliveryVoucherMappingEntityModel obj = new InventoryDeliveryVoucherMappingEntityModel();

                        obj.InventoryDeliveryVoucherMappingId = Guid.Empty;
                        obj.ProductId = item.ProductId;
                        obj.ProductName = item.ProductId == null ? "" : pro?.ProductName;
                        obj.ProductCode = item.ProductId == null ? "" : pro?.ProductCode;
                        obj.LotNoId = item.LotNoId;
                        obj.LotNoName = listLotNo.FirstOrDefault(lo => lo.LotNoId == item.LotNoId).LotNoName;
                        obj.UnitName = unit != null ? unit.CategoryName.Trim() : "";

                        if (parameter.InventoryType == (int)InventoryDeliveryVoucherType.TLNVL || parameter.InventoryType == (int)InventoryDeliveryVoucherType.TLCCDC)
                        {
                            obj.QuantityRequire = item.QuantityReceiving;
                            obj.QuantityDelivery = item.QuantityDelivery;
                            obj.QuantityInventory = item.QuantityReceiving + item.StartQuantity - item.QuantityDelivery;
                        }
                        if (parameter.InventoryType == (int)InventoryDeliveryVoucherType.TLTSD)
                        {
                            obj.QuantityRequire = item.ReuseReceiving;
                            obj.QuantityDelivery = item.ReuseDelivery;
                            obj.QuantityInventory = item.ReuseReceiving + item.StartReuse - item.ReuseDelivery;
                        }
                        if (parameter.InventoryType == (int)InventoryDeliveryVoucherType.XH)
                        {
                            obj.QuantityRequire = item.CancelReceiving;
                            obj.QuantityDelivery = item.CancelDelivery;
                            obj.QuantityInventory = item.CancelReceiving + item.StartCancel - item.CancelDelivery;
                        }

                        obj.Note = "";
                        obj.WarehouseId = item.WarehouseId;
                        obj.WareHouseName = (item.WarehouseId != Guid.Empty) ? listWarehouse.FirstOrDefault(f => f.WarehouseId == item.WarehouseId).WarehouseName : "";

                        if (obj.QuantityInventory > 0)
                        {
                            listItemDetail.Add(obj);
                        }
                    }
                });

                return new GetInventoryStockByWarehouseResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    inventoryDeliveryVoucherMappingModel = listItemDetail,
                };
            }
            catch (Exception e)
            {
                return new GetInventoryStockByWarehouseResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
    }

    public class InventoryByLotNo
    {
        public Guid ProductId { get; set; }
        public long? LotNoId { get; set; }
        public decimal Quantity { get; set; }
        public DateTime InventoryDate { get; set; }
        public Guid WarehouseId { get; set; }
    }
}

