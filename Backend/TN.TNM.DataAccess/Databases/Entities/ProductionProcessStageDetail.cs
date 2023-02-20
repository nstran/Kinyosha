using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessStageDetail
    {
        public long Id { get; set; }
        public long? ProductionProcessStageId { get; set; }
        public long? ConfigStepByStepStageId { get; set; }
        public long? ConfigContentStageId { get; set; }
        public long? ConfigSpecificationsStageId { get; set; }
        public Guid SpecificationsId { get; set; }
        public bool IsHaveValues { get; set; }
        public string SpecificationsStageValues { get; set; }
        public int NumberOfSamples { get; set; }
        public int? NewNumberOfSamples { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? IsShowTextBox { get; set; }
        public string MachineNumber { get; set; }
        public bool? IsContentValues { get; set; }
        public string ContenValues { get; set; }
    }
}
