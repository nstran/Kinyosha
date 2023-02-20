using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class InventoryReceivingVoucher
    {
        public Guid InventoryReceivingVoucherId { get; set; }
        public string InventoryReceivingVoucherCode { get; set; }
        public Guid StatusId { get; set; }
        public int InventoryReceivingVoucherType { get; set; }
        public Guid WarehouseId { get; set; }
        public string ShiperName { get; set; }
        public DateTime InventoryReceivingVoucherDate { get; set; }
        public TimeSpan InventoryReceivingVoucherTime { get; set; }
        public bool Active { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
        public string ProducerName { get; set; }
        public DateTime? OrderDate { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public int? InventoryReceivingVoucherCategory { get; set; }
        public int? BoxGreen { get; set; }
        public int? BoxGreenMax { get; set; }
        public int? PalletMax { get; set; }
        public int? PalletNormal { get; set; }
        public int? BoxBlue { get; set; }
        public int? PalletSmall { get; set; }
        public Guid? ObjectId { get; set; }
        public Guid? WarehouseCategoryTypeId { get; set; }
        public Guid? VendorId { get; set; }
        public string InvoiceNumber { get; set; }
        public string OrderNumber { get; set; }
    }
}
