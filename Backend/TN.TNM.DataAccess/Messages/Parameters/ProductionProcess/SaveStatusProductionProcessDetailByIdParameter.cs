using System;

namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class SaveStatusProductionProcessDetailByIdParameter : BaseParameter
    {        
        public long ProductionProcessDetailId { get; set; }
        public Guid StatusId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
