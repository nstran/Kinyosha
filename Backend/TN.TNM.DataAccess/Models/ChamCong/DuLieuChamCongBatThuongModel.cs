using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.ChamCong
{
    public class DuLieuChamCongBatThuongModel
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string Email { get; set; }
        public DateTime NgayChamCong { get; set; }
        public int CaChamCong { get; set; }
        public TimeSpan? VaoSang { get; set; }
        public TimeSpan? RaSang { get; set; }
        public TimeSpan? VaoChieu { get; set; }
        public TimeSpan? RaChieu { get; set; }
        public TimeSpan? VaoToi { get; set; }
        public TimeSpan? RaToi { get; set; }
    }
}
