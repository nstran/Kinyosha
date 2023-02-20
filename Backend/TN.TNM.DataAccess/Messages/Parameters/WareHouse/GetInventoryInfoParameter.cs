using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.WareHouse
{
    public class GetInventoryInfoParameter : BaseParameter
    {
        public Guid? OrganizationId { get; set; } //bộ phận
        public int WarehouseType { get; set; }
        public DateTime FromNgay { get; set; }
        public DateTime ToNgay { get; set; }
        public Guid WarehouseId { get; set; }
        public bool CheckTK { get; set; }
    }
}
