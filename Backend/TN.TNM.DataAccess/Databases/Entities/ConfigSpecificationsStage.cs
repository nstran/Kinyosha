using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigSpecificationsStage
    {
        public long Id { get; set; }
        public long ConfigStageId { get; set; }
        public long? ConfigStepByStepStageId { get; set; }
        public long? ConfigContentStageId { get; set; }
        public Guid SpecificationsId { get; set; }
        public bool IsHaveValues { get; set; }
        public int NumberOfSamples { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
