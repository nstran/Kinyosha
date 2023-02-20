using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetProductionProcessDetailByIdResult : BaseResult
    {
        public ProductionProcessDetailModel Model { get; set; }
    }
}
