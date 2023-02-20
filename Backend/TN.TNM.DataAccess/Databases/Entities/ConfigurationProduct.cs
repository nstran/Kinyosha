using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ConfigurationProduct
    {
        public Guid ConfigurationProductId { get; set; }
        public Guid? ProductId { get; set; }
        public string ConfigurationName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
