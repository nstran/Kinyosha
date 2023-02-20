using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigSpecificationsStageValue
    {
        public long Id { get; set; }
        public long ConfigSpecificationsStageId { get; set; }
        public Guid FieldTypeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int LineOrder { get; set; }
        public int SortLineOrder { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? ProductId { get; set; }
        public int? InfoFormula { get; set; }
        public int? Formula { get; set; }
        public decimal? FormulaValue { get; set; }
    }
}
