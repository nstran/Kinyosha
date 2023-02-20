using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigContentStage
    {
        public long Id { get; set; }
        public long ConfigStageId { get; set; }
        public long? ConfigStepByStepStageId { get; set; }
        public Guid? ContentId { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? IsContentValues { get; set; }
    }
}
