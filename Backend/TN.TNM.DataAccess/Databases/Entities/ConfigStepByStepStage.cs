using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigStepByStepStage
    {
        public long Id { get; set; }
        public long ConfigStageId { get; set; }
        public string Name { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? IsShowTextBox { get; set; }
    }
}
