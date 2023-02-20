using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessStageProductInput
    {
        public long Id { get; set; }
        public long ProductionProcessStageId { get; set; }
        public Guid ProductId { get; set; }
        public long LotNoId { get; set; }
        public decimal ProductionNumber { get; set; }
        public decimal QuantityNotProduced { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? WarehouseId { get; set; }
    }
}
