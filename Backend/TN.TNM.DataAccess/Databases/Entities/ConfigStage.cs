using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigStage
    {
        public long Id { get; set; }
        public long ConfigProductionId { get; set; }
        public Guid StageNameId { get; set; }
        public Guid StageGroupId { get; set; }
        public int NumberPeople { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid[] PersonInChargeId { get; set; }
        public Guid PersonVerifierId { get; set; }
        public bool Binding { get; set; }
        public Guid? PreviousStageNameId { get; set; }
        public int? FromTime { get; set; }
        public int? ToTime { get; set; }
        public bool IsStageWithoutNg { get; set; }
        public int? SortOrder { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? IsStageWithoutProduct { get; set; }
    }
}
