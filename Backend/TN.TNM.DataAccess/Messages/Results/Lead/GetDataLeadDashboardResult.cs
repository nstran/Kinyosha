﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Lead;

namespace TN.TNM.DataAccess.Messages.Results.Lead
{
    public class GetDataLeadDashboardResult: BaseResult
    {
        public LeadDashBoardEntityModel LeadDashBoard { get; set; }
    }
}
