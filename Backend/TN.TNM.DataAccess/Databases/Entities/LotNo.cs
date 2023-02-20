using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class LotNo
    {
        public long LotNoId { get; set; }
        public string LotNoName { get; set; }
        public int? LotNoType { get; set; }
    }
}
