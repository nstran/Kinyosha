using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class ConfirmProductionProcessStageByIdParameter : BaseParameter
    {        
        public long ProductionProcessStageId { get; set; }
        public Guid? WarehouseId { get; set; }
    }
}
