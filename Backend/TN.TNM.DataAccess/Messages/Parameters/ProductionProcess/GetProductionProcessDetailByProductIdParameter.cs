using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetProductionProcessDetailByProductIdParameter : BaseParameter
    {        
        public string LotName { get; set; }
        public List<Guid> ListProductId { get; set; }
        public Guid? StatusId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set;}
    }
}
