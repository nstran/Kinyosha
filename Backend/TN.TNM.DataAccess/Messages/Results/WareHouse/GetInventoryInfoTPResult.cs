using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.DynamicColumnTable;
using TN.TNM.DataAccess.Models.WareHouse;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetInventoryInfoTPResult : BaseResult
    {
        public List<InventoryInfoTPEntityModel> ListInventoryInfoTPEntityModelDetail { get; set; }
        public List<InventoryInfoTPEntityModel> ListDataTongHop { get; set; }
        public List<List<DataRowModel>> ListData { get; set; }
        public List<List<DataHeaderModel>> ListDataHeader { get; set; }
        public List<List<DataHeaderModel>> ListDataHeader2 { get; set; }
        public List<InventoryInfoProductTPEntityModel> ListChiTietLotno { get; set; }
    }
}
