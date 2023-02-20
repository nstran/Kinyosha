using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetProductionProcessStageByIdParameter : BaseParameter
    {        
        public long Id { get; set; }
    }
}
