namespace TN.TNM.DataAccess.Messages.Parameters.ConfigProduction
{
    public class GetAllConfigProductionParameter : BaseParameter
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Code { get; set; } //Mã quy trình
        public string ProductCode { get; set; } //Mã sản phẩm
        public string ProductName { get; set; } //Tên sản phẩm
        public bool Availability { get; set; } //Quy trình hiệu lức
    }
}
