using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ConfigProduction;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetConfigurationProductByProductIdResult : BaseResult
    {
        public List<ConfigurationProductMappingEntityModel> Models { get; set; }
    }
}
