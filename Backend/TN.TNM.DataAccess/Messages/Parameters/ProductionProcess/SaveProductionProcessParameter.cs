using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class SaveProductionProcessParameter : BaseParameter
    {        
        public ProductionProcessModel ProcessModel { get; set; }
    }
}
