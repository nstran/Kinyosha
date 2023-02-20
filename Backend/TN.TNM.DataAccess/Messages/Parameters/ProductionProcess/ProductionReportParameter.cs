using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class ProductionReportParameter : BaseParameter
    {        
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
