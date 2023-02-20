using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class CreateProductionProcessDetailParameter : BaseParameter
    {        
        public ProductionProcessDetailModel ProcessDetailModel { get; set; }
    }
}
