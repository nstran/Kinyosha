using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class DeleteProductionProcessParameter : BaseParameter
    {
        public long ProductionProcessId { get; set; }
    }
}
