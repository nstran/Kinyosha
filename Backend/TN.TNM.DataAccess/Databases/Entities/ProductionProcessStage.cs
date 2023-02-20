using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductionProcessStage
    {
        public long Id { get; set; }
        public long ProductionProcessDetailId { get; set; }
        public long ConfigStageId { get; set; }
        public Guid? StageNameId { get; set; }
        public Guid? StageGroupId { get; set; }
        public int NumberPeople { get; set; }
        public Guid? DepartmentId { get; set; }
        public Guid[] PersonInChargeId { get; set; }
        public Guid? PersonVerifierId { get; set; }
        public bool? Binding { get; set; }
        public Guid? PreviousStageNameId { get; set; }
        public int? FromTime { get; set; }
        public int? ToTime { get; set; }
        public int? SortOrder { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTimeOffset? StartTime { get; set; }
        public DateTimeOffset? EndTime { get; set; }
        public bool IsStageWithoutNg { get; set; }
        public bool? Availability { get; set; }
        public decimal? TotalProduction { get; set; }
        public decimal? TotalReached { get; set; }
        public decimal? TotalNotReached { get; set; }
        public decimal? TotalReuse { get; set; }
        public decimal? TotalCancel { get; set; }
        public Guid? StatusId { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid[] SelectPersonInChargeId { get; set; }
        public DateTime[] SelectImplementationDate { get; set; }
        public decimal? TotalPending { get; set; }
        public bool? Alert { get; set; }
        public Guid[] SelectStartPerformerId { get; set; }
        public Guid[] SelectEndPerformerId { get; set; }
        public bool? IsStageWithoutProduct { get; set; }
    }
}
