using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Results.Admin.Product
{
    public class UpdateConfigurationProductMappingResult : BaseResult
    {
        public List<ConfigurationProductEntityModel> ListConfigurationProductEntity { get; set; }
    }
}
