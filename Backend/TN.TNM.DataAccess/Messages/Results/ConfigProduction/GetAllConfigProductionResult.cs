using System.Collections.Generic;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ConfigProduction;

namespace TN.TNM.DataAccess.Messages.Results.ConfigProduction
{
    public class GetAllConfigProductionResult : BaseResult
    {
        public List<ConfigProductionModel> ConfigProductions { get; set; }
    }
}
