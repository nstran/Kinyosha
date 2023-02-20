using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessErrorStage
    {
        public long Id { get; set; }
        public long ProductionProcessStageId { get; set; }
        public Guid? StageGroupId { get; set; }
        public Guid? ErrorItemId { get; set; }
        public int? ErrorNumber { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
