using System;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetTimeSheetDailyParameter : BaseParameter
    {        
        public DateTime TimeSheetDate { get; set; }
    }
}
