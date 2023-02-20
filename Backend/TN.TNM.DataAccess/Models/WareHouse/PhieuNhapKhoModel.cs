using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.WareHouse
{
    public class PhieuNhapKhoModel
    {
        public Guid? InventoryReceivingVoucherId { get; set; }
        public string InventoryReceivingVoucherCode { get; set; }
        public Guid? StatusId { get; set; }
        public int? InventoryReceivingVoucherType { get; set; }
        public string InventoryReceivingVoucherTypeName { get; set; }
        public Guid? WarehouseId { get; set; }
        public string WarehouseName { get; set; }
        public string ShiperName { get; set; }
        public Guid? Storekeeper { get; set; }
        public DateTime? InventoryReceivingVoucherDate { get; set; }
        public TimeSpan? InventoryReceivingVoucherTime { get; set; }
        public int? LicenseNumber { get; set; }
        public bool? Active { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
        public Guid? PartnersId { get; set; }
        public string StatusName { get; set; }
        public int IntStatus { get; set; }
        public string StatusCode { get; set; }
        public string EmployeeCodeName { get; set; } //Người lập phiếu
        public decimal? TotalQuantityActual { get; set; }   //Tổng số lượng thực nhập
        public string ProducerName { get; set; }
        public string OrderNumber { get; set; }
        public DateTime? OrderDate { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public int? InventoryReceivingVoucherCategory { get; set; }
        public int? BoxGreen { get; set; }
        public int? BoxGreenMax { get; set; }
        public int? PalletMax { get; set; }
        public int? PalletNormal { get; set; }
        public int? BoxBlue { get; set; }
        public int? PalletSmall { get; set; }
        public int? WareHouseType { get; set; }
        public string EmployeeDepartment { get; set; } //Bộ phận người tạo
        public Guid? VendorId { get; set; }
        public Guid? ObjectId { get; set; }
        public string FromInventoryDeliveryVoucherCode { get; set; }
        public string WarehouseDelivery { get; set; }
        public string WarehouseReceiving { get; set; }

        public Guid ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public Guid? StateId { get; set; } // Công đoạn ID
        public string StateName { get; set; }// Công đoạn Name
        public string StateCode { get; set; }// Công đoạn Mã
        public string LotNoName { get; set; }// Lô sản xuất
        public long LotNoId { get; set; }// Lô sản xuất
    }
}
