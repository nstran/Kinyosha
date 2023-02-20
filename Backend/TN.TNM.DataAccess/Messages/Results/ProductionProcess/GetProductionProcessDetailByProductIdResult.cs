using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetProductionProcessDetailByProductIdResult : BaseResult
    {
        public List<ProductionProcessDetailModel> Models { get; set; }
    }
}
