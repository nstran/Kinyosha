using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class CreateLotNoParameter : BaseParameter
    {
        public long ProductionProcessId { get; set; }
        public long ConfigProductionId { get; set; }
        public string CustomerName { get; set; }
        public Guid ProductId { get; set; }        
        public int ProductNumber { get; set; }
    }
}
