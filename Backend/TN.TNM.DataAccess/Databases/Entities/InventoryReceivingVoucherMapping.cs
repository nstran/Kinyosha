using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class InventoryReceivingVoucherMapping
    {
        public Guid InventoryReceivingVoucherMappingId { get; set; }
        public Guid InventoryReceivingVoucherId { get; set; }
        public Guid? ObjectId { get; set; }
        public Guid ProductId { get; set; }
        public decimal QuantityActual { get; set; }
        public Guid WarehouseId { get; set; }
        public string Description { get; set; }
        public bool? Active { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
        public Guid? UnitId { get; set; }
        public bool? PackagingStatus { get; set; }
        public bool? ProductStatus { get; set; }
        public long? LotNoId { get; set; }
        public decimal? QuantityOk { get; set; }
        public decimal? QuantityPending { get; set; }
        public decimal? QuantityNg { get; set; }
        public decimal? QuantityProduct { get; set; }
    }
}
