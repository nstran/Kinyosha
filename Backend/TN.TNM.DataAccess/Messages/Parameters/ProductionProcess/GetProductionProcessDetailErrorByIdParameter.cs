using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetProductionProcessDetailErrorByIdParameter : BaseParameter
    {        
        public long ProductionProcessDetailId { get; set; }
    }
}
