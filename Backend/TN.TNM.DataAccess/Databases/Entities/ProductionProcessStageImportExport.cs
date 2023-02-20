using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessStageImportExport
    {
        public long Id { get; set; }
        public long ProductionProcessDetailId { get; set; }
        public long ProductionProcessStageId { get; set; }
        public Guid InventoryVoucherId { get; set; }
        public string InventoryVoucherCode { get; set; }
        public Guid WarehouseId { get; set; }
        public DateTime InventoryVoucherDate { get; set; }
        public Guid StageNameId { get; set; }
        public bool IsExport { get; set; }
    }
}
