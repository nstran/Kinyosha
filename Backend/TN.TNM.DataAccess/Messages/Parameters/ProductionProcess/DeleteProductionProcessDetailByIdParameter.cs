using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class DeleteProductionProcessDetailByIdParameter : BaseParameter
    {
        public long ProductionProcessDetailId { get; set; }
    }
}
