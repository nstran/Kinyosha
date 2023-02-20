using TN.TNM.DataAccess.Models.ConfigProduction;

namespace TN.TNM.DataAccess.Messages.Parameters.ConfigProduction
{
    public class DeleteConfigProductionParameter : BaseParameter
    {
        public long ConfigProductionId { get; set; }
    }
}
