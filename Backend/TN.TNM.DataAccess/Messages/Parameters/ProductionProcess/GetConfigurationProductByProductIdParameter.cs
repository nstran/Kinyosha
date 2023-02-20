﻿using System;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetConfigurationProductByProductIdParameter : BaseParameter
    {        
        public Guid ProductId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set;}
    }
}
