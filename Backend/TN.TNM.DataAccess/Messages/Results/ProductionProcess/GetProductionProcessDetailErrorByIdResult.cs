using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ProductionProcess;

namespace TN.TNM.DataAccess.Messages.Results.ProductionProcess
{
    public class GetProductionProcessDetailErrorByIdResult : BaseResult
    {
        public long ProductionProcessDetailId { get; set; }
        public string CustomerName { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public long LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal ProductionNumber { get; set; }//Số lượng sản xuất
        public decimal TotalReached { get; set; } //Số lượng đạt: => Theo công đoạn đóng gói
        public DateTime? DateShipping { get; set; }//Ngày xuất hàng: Theo phiếu xuất có ngày sớm nhất của lô tương ứng.
        public DateTime? CheckDate { get; set; }//Ngày kết thúc kiểm tra: => Theo công đoạn liền trước công đoạn đóng gói
        public decimal TotalCheckReached { get; set; }//Số lượng đạt => Theo công đoạn liền trước công đoạn đóng gói
        public List<ProductionProcessErrorStageModel> ErrorStageModels { get; set; }
    }
}
