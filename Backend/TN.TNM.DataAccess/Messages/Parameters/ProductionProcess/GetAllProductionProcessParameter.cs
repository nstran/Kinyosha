namespace TN.TNM.DataAccess.Messages.Parameters.ProductionProcess
{
    public class GetAllProductionProcessParameter : BaseParameter
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string ProductionCode { get; set; }

    }
}
