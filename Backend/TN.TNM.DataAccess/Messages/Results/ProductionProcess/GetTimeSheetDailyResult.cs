using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetTimeSheetDailyResult : BaseResult
    {
        public DateTime TimeSheetDate { get; set; } //Ngày báo cáo
        public List<TimeSheetModel> Models { get; set; }
    }
}
