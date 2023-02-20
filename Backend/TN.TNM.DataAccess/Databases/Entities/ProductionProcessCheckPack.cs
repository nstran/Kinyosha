using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessCheckPack
    {
        public long Id { get; set; }
        public long ProductionProcessId { get; set; }
        public long LotNoId { get; set; }
        public Guid ProductId { get; set; }
        public decimal TotalProduction { get; set; }
        public decimal TotalReached { get; set; }
        public decimal TotalPending { get; set; }
        public decimal TotalReuse { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
