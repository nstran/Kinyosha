using TN.TNM.DataAccess.Models.ConfigProduction;

namespace TN.TNM.DataAccess.Messages.Parameters.ConfigProduction
{
    public class SaveConfigProductionParameter : BaseParameter
    {
        public ConfigProductionModel  Model { get; set; }
    }
}
