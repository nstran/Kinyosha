﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Salary
{
    public class GetDataExportOTParameter: BaseParameter
    {
        public int BaoCaoNumber { get; set; }
        public DateTime TuNgay { get; set; }
        public DateTime DenNgay { get; set; }
        public List<Guid> ListEmployeeId { get; set; }
        public int IsShowOption { get; set; }
    }
}
