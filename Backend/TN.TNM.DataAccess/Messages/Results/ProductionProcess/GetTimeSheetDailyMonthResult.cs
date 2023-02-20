using System;
using System.Collections.Generic;
using System.Linq;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetTimeSheetDailyMonthResult : BaseResult
    {
        public List<TimeSheetDailyModel> Models { get; set; }        
    }
}
