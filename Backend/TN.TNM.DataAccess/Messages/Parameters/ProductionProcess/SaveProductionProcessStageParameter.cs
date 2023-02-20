using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class SaveProductionProcessStageParameter : BaseParameter
    {        
        public ProductionProcessStageModel Model { get; set; }
    }
}
