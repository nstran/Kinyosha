using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class SearchListPhieuNhapKhoParameter : BaseParameter
    {
        public Guid? OrganizationId { get; set; } //bộ phận
        public int WarehouseType { get; set; } //kho
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}
