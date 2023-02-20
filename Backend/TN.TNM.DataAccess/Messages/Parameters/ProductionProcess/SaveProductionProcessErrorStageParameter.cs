using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class SaveProductionProcessErrorStageParameter : BaseParameter
    {        
        public List<ProductionProcessErrorStageModel> ProcessErrorStageModels { get; set; }
    }
}
