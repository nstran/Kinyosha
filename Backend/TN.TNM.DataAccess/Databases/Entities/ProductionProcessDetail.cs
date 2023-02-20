using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessDetail
    {
        public long Id { get; set; }
        public long ProductionProcessId { get; set; }
        public long ConfigProductionId { get; set; }
        public string CustomerName { get; set; }
        public Guid ProductId { get; set; }
        public long LotNoId { get; set; }
        public int ProductionNumber { get; set; }
        public int TotalReached { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid StatusId { get; set; }
        public int Ltv { get; set; }
        public int Pc { get; set; }
        public string Description { get; set; }
        public bool IsHaveSubLo { get; set; }
        public long? PrentId { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public decimal? TotalPending { get; set; }
    }
}
