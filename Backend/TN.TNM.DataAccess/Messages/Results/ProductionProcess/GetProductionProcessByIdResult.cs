using System.Collections.Generic;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetProductionProcessByIdResult : BaseResult
    {
        public ProductionProcessModel Model { get; set; }
    }
}
