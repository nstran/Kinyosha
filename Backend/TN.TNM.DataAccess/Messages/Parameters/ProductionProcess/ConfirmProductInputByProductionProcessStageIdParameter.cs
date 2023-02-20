using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class ConfirmProductInputByProductionProcessStageIdParameter : BaseParameter
    {
        public long ProductionProcessStageId { get; set; }
        public Guid WarehouseId { get; set; }
        public DateTime[] SelectImplementationDate { get; set; }
        public List<ProductionProcessStageProductInputModel> Models { get; set; }
    }
}
