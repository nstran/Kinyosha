using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ConfigProduction;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetConfigProductionByProductIdResult : BaseResult
    {
        public List<ConfigProductionModel> ConfigProductionModels { get; set; }
    }
}
