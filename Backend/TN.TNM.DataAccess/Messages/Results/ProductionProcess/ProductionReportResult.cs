using System.Collections.Generic;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class ProductionReportResult : BaseResult
    {
        public List<ProductionReportModel> ReportModels { get; set; }
    }
}
