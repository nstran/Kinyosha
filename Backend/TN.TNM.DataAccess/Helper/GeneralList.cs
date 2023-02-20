using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Helper
{
    public static class GeneralList
    {
        public static List<TrangThaiGeneral> GetTrangThais(string LoaiTrangThai)
        {
            switch (LoaiTrangThai)
            {
                case "LoaiGiamTru":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Giảm trừ bản thân" },
                        new TrangThaiGeneral() { Value = 2, Name = "Giảm trừ người phụ thuộc" }
                    };
                case "LoaiNghiLe":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Nghỉ lễ" },
                        new TrangThaiGeneral() { Value = 2, Name = "Nghỉ bù" },
                        new TrangThaiGeneral() { Value = 3, Name = "Làm bù" }
                    };
                case "DXTangLuong":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "DXTangLuongNhanVien":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "DXThayDoiChucVu":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "DXThayDoiChucVuNhanVien":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "NgayLamViecTrongTuan":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Thứ 2" },
                        new TrangThaiGeneral() { Value = 2, Name = "Thứ 3" },
                        new TrangThaiGeneral() { Value = 3, Name = "Thứ 4" },
                        new TrangThaiGeneral() { Value = 4, Name = "Thứ 5" },
                        new TrangThaiGeneral() { Value = 5, Name = "Thứ 6" },
                        new TrangThaiGeneral() { Value = 6, Name = "Thứ 7" },
                        new TrangThaiGeneral() { Value = 0, Name = "Chủ nhật" },
                    };
                case "LoaiCaLamViec":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Ca sáng" },
                        new TrangThaiGeneral() { Value = 2, Name = "Ca chiều" }
                    };
                case "LoaiDongBaoHiem":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Full lương" },
                        new TrangThaiGeneral() { Value = 2, Name = "Mức đóng" }
                    };
                case "DonViBaoHiemLoft":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Tháng lương" },
                        new TrangThaiGeneral() { Value = 2, Name = "VNĐ" }
                    };
                case "DoiTuongBaoHiemLoft":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Bản thân" },
                        new TrangThaiGeneral() { Value = 2, Name = "Người thân" }
                    };
                case "LoaiCaOt":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Ca sáng" },
                        new TrangThaiGeneral() { Value = 2, Name = "Ca chiều" },
                        new TrangThaiGeneral() { Value = 3, Name = "Ca tối" },
                        new TrangThaiGeneral() { Value = 4, Name = "Cả ngày" },
                    };
                case "TrangThaiKeHoachOt":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Tạo mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 8, Name = "Từ chối kế hoạch OT" },

                        new TrangThaiGeneral() { Value = 3, Name = "Đăng ký OT" },
                        new TrangThaiGeneral() { Value = 4, Name = "Chờ phê duyệt đăng ký OT" },
                        new TrangThaiGeneral() { Value = 5, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 9, Name = "Từ chối đăng ký OT" },

                        new TrangThaiGeneral() { Value = 6, Name = "Đang thực hiện" },
                        new TrangThaiGeneral() { Value = 7, Name = "Hoàn thành" },
                        new TrangThaiGeneral() { Value = 10, Name = "Hết hạn phê duyệt kế hoạch OT" },
                        new TrangThaiGeneral() { Value = 11, Name = "Hết hạn phê duyệt đăng ký OT" },
                    };
                case "TrangThaiThanhVienDangKyOt":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Đăng ký OT" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "TrangThaiPhongBanDangKyOt":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Đăng ký OT" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                    };
                case "YCCapPhat":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "DEXUATCT":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "TokenTinhLuong":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { ValueText = "[luong_thuc_te]", Name = "Lương thực tế" },
                        new TrangThaiGeneral() { ValueText = "[khoan_bu_tu_thang_truoc]", Name = "Khoản bù trừ tháng trước" },
                        new TrangThaiGeneral() { ValueText = "[luong_ot_tinh_thue]", Name = "Lương OT tính thuế" },
                        new TrangThaiGeneral() { ValueText = "[luong_ot_khong_tinh_thue]", Name = "Lương OT không tính thuế" },
                        new TrangThaiGeneral() { ValueText = "[tong_tro_cap_tinh_thue]", Name = "Tổng trợ cấp tính thuế" },
                        new TrangThaiGeneral() { ValueText = "[tong_tro_cap_khong_tinh_thue]", Name = "Tổng trợ cấp không tính thuế" },
                        new TrangThaiGeneral() { ValueText = "[khau_tru_da_thanh_toan]", Name = "Khấu trừ đã thanh toán" },
                        new TrangThaiGeneral() { ValueText = "[thu_nhap_chi_dua_vao_tinh_thue]", Name = "Thu nhập chỉ đưa vào tính thuế" },
                        new TrangThaiGeneral() { ValueText = "[thue_tncn]", Name = "Thuế TNCN" },
                        new TrangThaiGeneral() { ValueText = "[bhxh]", Name = "BHXH" },
                        new TrangThaiGeneral() { ValueText = "[cac_khoan_giam_tru_sau_thue]", Name = "Các khoản giảm trừ sau thuế" },
                        new TrangThaiGeneral() { ValueText = "[cac_khoan_hoan_lai_sau_thue]", Name = "Các khoản hoàn lại sau thuế" },
                    };
                case "DNHoanTamUng":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" }
                    };
                case "KyHieuChamCong":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0, ValueText = null, Name = "Xóa ký hiệu" },
                        new TrangThaiGeneral() { Value = 1, ValueText = "AL", Name = "Nghỉ phép" },
                        new TrangThaiGeneral() { Value = 2, ValueText = "PH", Name = "Nghỉ lễ" },
                        new TrangThaiGeneral() { Value = 3, ValueText = "R", Name = "Nghỉ bù" },
                        new TrangThaiGeneral() { Value = 4, ValueText = "OP", Name = "Nghỉ hưởng nguyên lương" },
                        new TrangThaiGeneral() { Value = 5, ValueText = "M", Name = "Nghỉ cưới/Sinh con/Tang chế" },
                        new TrangThaiGeneral() { Value = 6, ValueText = "B", Name = "Đi công tác" },
                        new TrangThaiGeneral() { Value = 7, ValueText = "T", Name = "Nghỉ đào tạo/hội thảo" },
                        new TrangThaiGeneral() { Value = 8, ValueText = "U", Name = "Nghỉ không hưởng lương" },
                        new TrangThaiGeneral() { Value = 9, ValueText = "BV", Name = "Tự ý nghỉ không hưởng lương" },
                        new TrangThaiGeneral() { Value = 10, ValueText = "UP", Name = "Không có dữ liệu bảng công" },
                        new TrangThaiGeneral() { Value = 11, ValueText = "BH", Name = "Nghỉ hưởng BHXH" },
                        new TrangThaiGeneral() { Value = 12, ValueText = "DM", Name = "Đi muộn" },
                        new TrangThaiGeneral() { Value = 13, ValueText = "VS", Name = "Về sớm" },
                        new TrangThaiGeneral() { Value = 14, ValueText = "TN", Name = "Làm tại nhà" },
                    };
                case "PhieuDanhGia":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0,  Name = "Mới" },
                        new TrangThaiGeneral() { Value = 1,  Name = "Có hiệu lực" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Hết hiệu lực" },
                    };
                case "TrangThaiDeXuatXinNghi":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0,  Name = "Mới" },
                        new TrangThaiGeneral() { Value = 1,  Name = "Từ chối" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3,  Name = "Đã phê duyệt" },
                    };
                case "DoiTuongApDungQuyTrinhPheDuyet":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1,  Name = "Cơ hội" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Hồ sơ thầu" },
                        new TrangThaiGeneral() { Value = 3,  Name = "Báo giá" },
                        new TrangThaiGeneral() { Value = 4,  Name = "Hợp đồng" },
                        new TrangThaiGeneral() { Value = 5,  Name = "Đơn hàng bán" },
                        new TrangThaiGeneral() { Value = 6,  Name = "Hóa đơn" },
                        new TrangThaiGeneral() { Value = 7,  Name = "Đề xuất mua hàng" },
                        new TrangThaiGeneral() { Value = 8,  Name = "Đơn hàng mua" },
                        new TrangThaiGeneral() { Value = 9,  Name = "Đề xuất xin nghỉ" },
                        new TrangThaiGeneral() { Value = 10,  Name = "Đề xuất tăng lương" },
                        new TrangThaiGeneral() { Value = 11,  Name = "Đề xuất chức vụ" },
                        new TrangThaiGeneral() { Value = 12,  Name = "Đề xuất kế hoạch OT" },
                        new TrangThaiGeneral() { Value = 13,  Name = "Đăng ký OT" },
                        new TrangThaiGeneral() { Value = 14,  Name = "Kỳ lương" },
                        new TrangThaiGeneral() { Value = 20,  Name = "Yêu cầu cấp phát" },
                        new TrangThaiGeneral() { Value = 21,  Name = "Đề nghị tạm ứng" },
                        new TrangThaiGeneral() { Value = 22,  Name = "Đề nghị hoàn ứng" },
                        new TrangThaiGeneral() { Value = 30,  Name = "Đề xuất công tác" },
                    };
                case "TrangThaiKyDanhGia":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0,  Name = "Mới" },
                        new TrangThaiGeneral() { Value = 1,  Name = "Chưa bắt đầu" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Đang thực hiện" },
                        new TrangThaiGeneral() { Value = 3,  Name = "Hoàn thành" },
                    };
                case "DangCauTraLoi":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0,  Name = "Chọn đáp án" },
                        new TrangThaiGeneral() { Value = 1,  Name = "Text + Chọn điểm đánh giá" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Text + Chọn đáp án" },
                        new TrangThaiGeneral() { Value = 3,  Name = "Chọn điểm đánh giá" },
                        new TrangThaiGeneral() { Value = 4,  Name = "Text" },
                        new TrangThaiGeneral() { Value = 5,  Name = "Text + Lựa chọn Yes/No" },
                        new TrangThaiGeneral() { Value = 6,  Name = "Lựa chọn YES/NO" },
                    };
                case "TrangThaiTuDanhGia":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1,  Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Hoàn thành tự đánh giá" },
                        new TrangThaiGeneral() { Value = 3,  Name = "Hoàn thành quản lý đánh giá" },
                        new TrangThaiGeneral() { Value = 4,  Name = "Hoàn thành trưởng phòng đánh giá" },
                    };
                case "CachTinhDiemPhieuDanhGia":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1,  Name = "Tổng điểm thành phần*Trọng số" },
                        new TrangThaiGeneral() { Value = 2,  Name = "Trung bình cộng điểm thành phần*Trọng số" },
                    };
                case "LoaiDeXuatTangLuong":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Đề xuất tăng lương adhoc" },
                        new TrangThaiGeneral() { Value = 2, Name = "Đề xuất tăng lương sau đánh giá" },
                    };
                case "TroCap_LoaiNgayNghi":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Nghỉ báo trước" },
                        new TrangThaiGeneral() { Value = 2, Name = "Nghỉ đột xuất" },
                    };
                case "TroCap_HinhThucTru":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Theo số lần" },
                        new TrangThaiGeneral() { Value = 2, Name = "Theo % mức trợ cấp" },
                    };
                case "TrangThaiKyLuong":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 2, Name = "Chờ phê duyệt" },
                        new TrangThaiGeneral() { Value = 3, Name = "Đã phê duyệt" },
                        new TrangThaiGeneral() { Value = 4, Name = "Từ chối" },
                        new TrangThaiGeneral() { Value = 5, Name = "Hoàn thành" },
                    };
                case "DotKiemKe":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Đang thực hiện" },
                        new TrangThaiGeneral() { Value = 2, Name = "Hoàn thành" }
                    };
                case "TinhTrangTaiSan":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0, Name = "Không sử dụng" },
                        new TrangThaiGeneral() { Value = 1, Name = "Đang sử dụng" },
                    };
                case "TrangThaiHoSoCongTac":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 0, Name = "Mới" },
                        new TrangThaiGeneral() { Value = 1, Name = "Hoàn thành" },
                    };
                case "PhongBanKyDanhGia":
                    return new List<TrangThaiGeneral>()
                    {
                        new TrangThaiGeneral() { Value = 1, Name = "Đang gán người đánh giá" },
                        new TrangThaiGeneral() { Value = 2, Name = "Đang đánh giá" },
                        new TrangThaiGeneral() { Value = 3, Name = "Hoàn thành" },
                        new TrangThaiGeneral() { Value = 4, Name = "Đã tạo đề xuất tăng lương" },
                    };

                default:
                    return new List<TrangThaiGeneral>();
            }
        }

        public static List<BaseType> GetDeptCode()
        {
            return new List<BaseType>()
            {
                new BaseType() { Value = 1, Name = "Cost of sales" },
                new BaseType() { Value = 2, Name = "Operations" },
                new BaseType() { Value = 3, Name = "General & Administrative" }
            };
        }

        public static List<BaseType> GetSubCode1()
        {
            return new List<BaseType>()
            {
                new BaseType() { Value = 1, Name = "COS" },
                new BaseType() { Value = 2, Name = "OPS" },
                new BaseType() { Value = 3, Name = "G&A" }
            };
        }

        public static List<BaseType> GetSubCode2()
        {
            return new List<BaseType>()
            {
                new BaseType() { Value = 1, Name = "G&A-HR" },
                new BaseType() { Value = 2, Name = "G&A-ACC" },
                new BaseType() { Value = 3, Name = "COS-3D" },
                new BaseType() { Value = 4, Name = "OPS-PM" },
                new BaseType() { Value = 5, Name = "OPS-IT" },
                new BaseType() { Value = 6, Name = "CM" },
                new BaseType() { Value = 7, Name = "HRD" },
                new BaseType() { Value = 8, Name = "G&A-AD" },
                new BaseType() { Value = 9, Name = "COS-QA" },
            };
        }

        public static List<BaseType> GetLoaiBaoHiem()
        {
            return new List<BaseType>()
            {
                new BaseType() { Value = 1, Name = "BHXH" },
                new BaseType() { Value = 2, Name = "BH Loftcare" }
            };
        }

        public static List<BaseType> GetKyNangTayNghe()
        {
            return new List<BaseType>()
            {
                new BaseType() { Value = 1, Name = "Other" },
                new BaseType() { Value = 2, Name = "Interior design" }
            };
        }

    }
    public partial class TrangThaiGeneral
    {
        public int Value { get; set; }
        public string ValueText { get; set; }
        public string Name { get; set; }
    }

    public partial class BaseType
    {
        public string Name { get; set; }
        public int Value { get; set; }
        public string Key { get; set; }
    }

    public partial class ThongKeTaiSanChartModel
    {
        public string Name { get; set; }
        public List<int> Data { get; set; }
        public string Stack { get; set; }
    }


    public partial class DataPieChartModel
    {
        public string Name { get; set; }
        public int Y { get; set; }
        public string Drilldown { get; set; }
        
    }

    public partial class ThongKeNhanSuChartModel
    {
        public string Name { get; set; }
        public List<int> Data { get; set; }
        public string Stack { get; set; }
    }

    public partial class DoTuoi
    {
        public string Name { get; set; }
        public int Value1 { get; set; }
        public int Value2 { get; set; }
    }
    //Model cho xuất template Due date contract
    public partial class templateDueDateContract
    {
        public string maNhanVien { get; set; }
        public string hoTen { get; set; }
        public string hoTenTiengAnh { get; set; }
        public int luongThuViec { get; set; }
        public int luongHopDong { get; set; }
    }

    //Model cho xuất template Meal Allowance
    public partial class templateMealAllowance
    {
        public string code { get; set; }
        public string maPhong { get; set; }
        public string name { get; set; }
        public string duocTraTienAn { get; set; }
        public int soTienAnTB { get; set; }
        public double soNgayLamViec { get; set; }
        public int soTienAnDuocTra { get; set; }
        public int soTienAnThieu { get; set; }
        public int soTienAnThua { get; set; }
        public int sumTienAnDuocTra { get; set; }
        public string ghiChu { get; set; }
    }

    //Model cho xuất template Trợ cấp chuyên cần
    public partial class templateTroCapChuyenCan
    {
        public string maNV { get; set; }
        public string maPhong { get; set; }
        public string name { get; set; }
        public string typeOfContact { get; set; }
        public string chuyenCan { get; set; }
        public double ngayNghiDotXuat { get; set; }
        public int ngayNghi { get; set; }
        public double ngayLamViec { get; set; }
        public int troCapTheoNgayLam { get; set; }
        public int troCapChuyenCan { get; set; }
        public int soLanDMVS { get; set; }
        public int soNgayLamViec { get; set; }
        public int troCapDMVS { get; set; }
        public int troCapChuyenCanNgayCong { get; set; }
        public string ghiChu { get; set; }
    }

}
