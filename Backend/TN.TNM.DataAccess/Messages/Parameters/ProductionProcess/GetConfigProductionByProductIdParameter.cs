using System;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetConfigProductionByProductIdParameter : BaseParameter
    {        
        public Guid ProductId { get; set; }

    }
}
