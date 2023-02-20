using iTextSharp.text;
using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class SaveTimeSheetDailyParameter : BaseParameter
    {   
        public DateTime TimeSheetDate { get; set; } //Ngày báo cáo
        public List<TimeSheetModel> Models { get; set; }
    }
}
