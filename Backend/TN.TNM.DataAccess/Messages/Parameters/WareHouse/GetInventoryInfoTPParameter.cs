using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetInventoryInfoTPParameter : BaseParameter
    {
        public DateTime? Month { get; set; }
        public DateTime? FromNgay { get; set; }
        public DateTime? ToNgay { get; set; }
        public Guid ProductId { get; set; }
    }
}
