using iTextSharp.text;
using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class CancelProductionProcessDetailByIdParameter : BaseParameter
    {        
        public long ProductionProcessDetailId { get; set; }
        public Guid TPWarehouseId { get; set; }
        public decimal TotalReuse { get; set; }
        public decimal TotalCancel { get; set; }        
        public Guid NVLWarehouseId { get; set; }
        public List<ProductionProcessStageProductInputModel> ProductInputModels { get; set; }
    }
}
