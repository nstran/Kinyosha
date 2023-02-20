using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class CreateProductionProcessDetailResult : BaseResult
    {
        public ProductionProcessDetailModel ProcessDetailModel { get; set; }
    }
}
