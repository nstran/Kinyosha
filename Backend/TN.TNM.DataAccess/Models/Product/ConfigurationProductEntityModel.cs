using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Product
{
    public class ConfigurationProductEntityModel
    {
        public Guid ConfigurationProductId { get; set; }
        public Guid? ProductId { get; set; }
        public string ConfigurationName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<ConfigurationProductMappingEntityModel> ListConfigurationProductMapping { get; set; }
    }
}
