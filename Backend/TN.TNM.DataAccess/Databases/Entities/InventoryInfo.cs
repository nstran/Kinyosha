using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class InventoryInfo
    {
        public Guid InventoryInfoId { get; set; }
        public Guid ProductId { get; set; }
        public long LotNoId { get; set; }
        public DateTime? InventoryInfoDate { get; set; }
        public decimal? InventoryInfoAmount { get; set; }
        public Guid? WarehouseId { get; set; }
    }
}
