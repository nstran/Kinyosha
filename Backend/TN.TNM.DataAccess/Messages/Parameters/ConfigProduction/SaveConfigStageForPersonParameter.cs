using System;
using TN.TNM.DataAccess.Models.ConfigProduction;

namespace TN.TNM.DataAccess.Messages.Parameters.ConfigProduction
{
    public class SaveConfigStageForPersonParameter : BaseParameter
    {
        public long ConfigStageId { get; set; }
        public Guid[] PersonInChargeId { get; set; }
        public Guid PersonVerifierId { get; set; }
    }
}
