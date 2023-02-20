using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class TrackBox
    {
        public Guid TrackBoxId { get; set; }
        public DateTime? Date { get; set; }
        public int? BoxGreen { get; set; }
        public int? BoxGreenMax { get; set; }
        public int? PalletMax { get; set; }
        public int? PalletNormal { get; set; }
        public int? BoxBlue { get; set; }
        public int? PalletSmall { get; set; }
    }
}
