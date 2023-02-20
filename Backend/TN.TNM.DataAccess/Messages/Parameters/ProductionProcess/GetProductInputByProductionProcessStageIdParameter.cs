using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetProductInputByProductionProcessStageIdParameter : BaseParameter
    {        
        public long ProductionProcessStageId { get; set; } //Id công đoạn sản xuất
        public Guid WarehouseId { get; set; } //Id kho hàng
    }
}
