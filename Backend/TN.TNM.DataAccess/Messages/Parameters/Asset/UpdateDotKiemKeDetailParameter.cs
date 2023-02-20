using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Asset;

namespace TN.TNM.DataAccess.Messages.Parameters.Asset
{
    public class UpdateDotKiemKeDetailParameter : BaseParameter
    {
        public List<DotKiemKeChiTietEntityModel> ListDotKiemKeChiTiet { get; set; }
    }
}
