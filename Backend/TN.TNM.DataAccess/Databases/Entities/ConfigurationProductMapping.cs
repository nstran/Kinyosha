using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigurationProductMapping
    {
        public Guid ConfigurationProductMappingId { get; set; }
        public Guid ConfigurationProductId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? StageGroupId { get; set; }
        public bool? ReuseNg { get; set; }
        public decimal? Quota { get; set; }
        public decimal? Consumption { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
    }
}
