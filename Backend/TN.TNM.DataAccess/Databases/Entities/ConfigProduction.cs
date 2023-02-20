using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigProduction
    {
        public long Id { get; set; }
        public Guid ProductId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int ProductionNumber { get; set; }
        public int Ltv { get; set; }
        public int Pc { get; set; }
        public bool Availability { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid[] InspectionStageId { get; set; }
    }
}
