using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class ImportNGParameter : BaseParameter
    {        
        public long ProductionProcessStageId { get; set; }
        public int TotalReuse { get; set; } //Số lượng tái sử dụng
        public int TotalCancel { get; set; } //Số lượng Hủy
        public Guid WarehouseId { get; set; } //Kho nhập
    }
}
