using System.Collections.Generic;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetAllProductionProcessResult : BaseResult
    {
        public List<ProductionProcessModel> ProcessModels { get; set; }
        public int TotalProductionProcess { get; set; }
    }
}
