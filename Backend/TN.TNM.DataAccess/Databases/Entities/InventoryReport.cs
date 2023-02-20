using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class InventoryReport
    {
        public Guid InventoryReportId { get; set; }
        public Guid WarehouseId { get; set; }
        public Guid ProductId { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? QuantityMinimum { get; set; }
        public bool Active { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
        public decimal StartQuantity { get; set; }
        public decimal? QuantityMaximum { get; set; }
        public decimal? OpeningBalance { get; set; }
        public string Note { get; set; }
        public DateTime InventoryReportDate { get; set; }
        public long? LotNoId { get; set; }
        public decimal QuantityReceiving { get; set; }
        public decimal QuantityDelivery { get; set; }
        public decimal StartReuse { get; set; }
        public decimal ReuseReceiving { get; set; }
        public decimal ReuseDelivery { get; set; }
        public decimal StartPending { get; set; }
        public decimal PendingReceiving { get; set; }
        public decimal PendingDelivery { get; set; }
        public decimal StartCancel { get; set; }
        public decimal CancelReceiving { get; set; }
        public decimal CancelDelivery { get; set; }
        public decimal? ProductionNumber { get; set; }
    }
}
