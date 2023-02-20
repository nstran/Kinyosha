using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using TN.TNM.Common;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Enum;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.AuditTrace;
using TN.TNM.DataAccess.Messages.Parameters.Asset;
using TN.TNM.DataAccess.Messages.Parameters.Employee;
using TN.TNM.DataAccess.Messages.Parameters.WareHouse;
using TN.TNM.DataAccess.Messages.Results.Admin.AuditTrace;
using TN.TNM.DataAccess.Messages.Results.Asset;
using TN.TNM.DataAccess.Messages.Results.Employee;
using TN.TNM.DataAccess.Messages.Results.WareHouse;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Address;
using TN.TNM.DataAccess.Models.Asset;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Folder;
using TN.TNM.DataAccess.Models.Note;
using static TN.TNM.Common.CommonMessage;
using TN.TNM.DataAccess.Models.WareHouse;
using OfficeOpenXml.FormulaParsing.Excel.Functions.DateTime;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Logical;
using Org.BouncyCastle.Asn1.Ocsp;
using TN.TNM.DataAccess.Models.Product;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Math;
using Microsoft.CodeAnalysis;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Information;
using TN.TNM.DataAccess.Models.DynamicColumnTable;

/// <summary>
/// Authentication Data Access Object
/// </summary>
namespace TN.TNM.DataAccess.Databases.DAO
{
    public class AssetDAO : BaseDAO, IAssetDataAccess
    {
        private readonly IHostingEnvironment hostingEnvironment;
        public AssetDAO(TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IHostingEnvironment _hostingEnvironment)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
            this.hostingEnvironment = _hostingEnvironment;
        }

        public CreateOrUpdateAssetResult CreateOrUpdateAsset(CreateOrUpdateAssetParameter parameter)
        {
            try
            {
                // Thêm mới tài sản
                if (parameter.TaiSan.TaiSanId == 0)
                {

                    var maLoaiTaiSan = context.Category.FirstOrDefault(x => x.CategoryId == parameter.TaiSan.PhanLoaiTaiSanId)?.CategoryCode;
                    var countTaiSanCungPhanLoai = context.TaiSan.Where(x => x.PhanLoaiTaiSanId == parameter.TaiSan.PhanLoaiTaiSanId).Count();
                    parameter.TaiSan.MaTaiSan = maLoaiTaiSan + countTaiSanCungPhanLoai.ToString();
                    parameter.TaiSan.CreatedById = parameter.UserId;
                    parameter.TaiSan.CreatedDate = DateTime.Now;
                    parameter.TaiSan.UpdatedById = parameter.UserId;
                    parameter.TaiSan.UpdatedDate = DateTime.Now;
                    context.TaiSan.Add(parameter.TaiSan);
                }
                else
                {
                    var taiSanEntity = context.TaiSan.FirstOrDefault(p => p.TaiSanId == parameter.TaiSan.TaiSanId);
                    if (taiSanEntity != null)
                    {
                        taiSanEntity.MaTaiSan = parameter.TaiSan.MaTaiSan;
                        taiSanEntity.TenTaiSan = parameter.TaiSan.TenTaiSan;
                        taiSanEntity.MaCode = parameter.TaiSan.MaTaiSan;
                        taiSanEntity.PhanLoaiTaiSanId = parameter.TaiSan.PhanLoaiTaiSanId;
                        taiSanEntity.NgayVaoSo = parameter.TaiSan.NgayVaoSo;
                        taiSanEntity.DonViTinhId = parameter.TaiSan.DonViTinhId;
                        taiSanEntity.SoLuong = parameter.TaiSan.SoLuong;
                        taiSanEntity.MoTa = parameter.TaiSan.MoTa;
                        taiSanEntity.KhuVucTaiSanId = parameter.TaiSan.KhuVucTaiSanId;

                        taiSanEntity.MucDichId = parameter.TaiSan.MucDichId;
                        taiSanEntity.ViTriVanPhongId = parameter.TaiSan.ViTriVanPhongId;
                        taiSanEntity.ViTriTs = parameter.TaiSan.ViTriTs;
                        taiSanEntity.ExpenseUnit = parameter.TaiSan.ExpenseUnit;


                        taiSanEntity.SoSerial = parameter.TaiSan.SoSerial;
                        taiSanEntity.SoHieu = parameter.TaiSan.SoHieu;
                        taiSanEntity.ThongTinNoiMua = parameter.TaiSan.ThongTinNoiMua;
                        taiSanEntity.ThongTinNoiBaoHanh = parameter.TaiSan.ThongTinNoiBaoHanh;
                        taiSanEntity.NamSx = parameter.TaiSan.NamSx;
                        taiSanEntity.NuocSxid = parameter.TaiSan.NuocSxid;
                        taiSanEntity.HangSxid = parameter.TaiSan.HangSxid;
                        taiSanEntity.NgayMua = parameter.TaiSan.NgayMua;
                        taiSanEntity.ThoiHanBaoHanh = parameter.TaiSan.ThoiHanBaoHanh;
                        taiSanEntity.BaoDuongDinhKy = parameter.TaiSan.BaoDuongDinhKy;
                        taiSanEntity.Model = parameter.TaiSan.Model;

                        taiSanEntity.GiaTriNguyenGia = parameter.TaiSan.GiaTriNguyenGia;
                        taiSanEntity.GiaTriTinhKhauHao = parameter.TaiSan.GiaTriTinhKhauHao;
                        taiSanEntity.ThoiGianKhauHao = parameter.TaiSan.ThoiGianKhauHao;
                        taiSanEntity.ThoiDiemBdtinhKhauHao = parameter.TaiSan.ThoiDiemBdtinhKhauHao;
                        taiSanEntity.PhuongPhapTinhKhauHao = parameter.TaiSan.PhuongPhapTinhKhauHao;

                        parameter.TaiSan.UpdatedById = parameter.UserId;
                        parameter.TaiSan.UpdatedDate = DateTime.Now;
                        context.TaiSan.Update(taiSanEntity);
                    }
                }
                context.SaveChanges();
                var listTaiSanChuaPhanBo = new List<AssetEntityModel>();
                if (parameter.IsQuick)
                {
                    #region Lấy danh Tài sản chưa phân bổ
                    listTaiSanChuaPhanBo = context.TaiSan.Where(x => x.HienTrangTaiSan == 0).Select(y => new AssetEntityModel
                    {
                        TaiSanId = y.TaiSanId,
                        MaTaiSan = y.MaTaiSan,
                        TenTaiSan = y.TenTaiSan,
                        TenTaiSanCode = y.MaTaiSan + " - " + y.TenTaiSan,
                        MaCode = y.MaCode,
                        PhanLoaiTaiSanId = y.PhanLoaiTaiSanId,
                    }).OrderByDescending(z => z.CreatedDate).ThenByDescending(z => z.NgayVaoSo).ToList();

                    #endregion
                }
                return new CreateOrUpdateAssetResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    Message = parameter.TaiSan.TaiSanId == 0 ? "Thêm mới tài sản thành công." : "Cập nhập tài sản thành công",
                    AssetId = parameter.TaiSan.TaiSanId,
                    ListTaiSanChuaPhanBo = listTaiSanChuaPhanBo
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdateAssetResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }

        }

        public GetMasterDataAssetFormResult GetMasterDataAssetForm(GetMasterDataAssetFormParameter parameter)
        {
            try
            {
                var ListMaTS = new List<string>();
                var ListPhanLoaiTS = new List<CategoryEntityModel>();
                var ListDonVi = new List<CategoryEntityModel>();
                var ListHienTrangTS = new List<CategoryEntityModel>();
                var ListNuocSX = new List<CategoryEntityModel>();
                var ListHangSX = new List<CategoryEntityModel>();
                var listEmployee = new List<EmployeeEntityModel>();
                var ListProvinceEntityModel = new List<ProvinceEntityModel>();
                #region Common data

                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();

                #endregion

                #region List mã tài sản

                ListMaTS = context.TaiSan.Select(x => x.MaTaiSan).ToList();

                #endregion

                #region Lấy danh sách Phân loại tài sản

                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                ListPhanLoaiTS = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy khu vực tài sản
                ListProvinceEntityModel = context.Province.Where(x => x.IsShowAsset == true).Select(p => new ProvinceEntityModel()
                {
                    ProvinceId = p.ProvinceId,
                    ProvinceName = p.ProvinceName,
                    ProvinceCode = p.ProvinceCode,
                }).OrderBy(p => p.ProvinceName).ToList();
                #endregion

                #region Lấy danh sách Đơn vị

                var donViId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DVTS")?.CategoryTypeId;
                ListDonVi = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == donViId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Hiện trạng tài sản

                var hienTrangId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "HTTS")?.CategoryTypeId;
                ListHienTrangTS = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == hienTrangId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Nước sản xuất

                var sanXuatId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "NSX")?.CategoryTypeId;
                ListNuocSX = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == sanXuatId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Hãng sản xuất

                var hangSXId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "HSX")?.CategoryTypeId;
                ListHangSX = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == hangSXId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách nhân viên đang hoạt động
                var listAllUser = context.User.ToList();

                var listAllEmployee = context.Employee.Select(y =>
                           new EmployeeEntityModel
                           {
                               EmployeeId = y.EmployeeId,
                               Active = y.Active,
                               EmployeeCode = y.EmployeeCode,
                               EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                           }).ToList();

                listAllEmployee.ForEach(emp =>
                {
                    var trangThaiId = 0;
                    var user = listAllUser.FirstOrDefault(x => x.EmployeeId == emp.EmployeeId);

                    if (emp.Active == true && user.Active == true)
                    {
                        trangThaiId = 1; //Đang hoạt động - Được phê duyệt
                        listEmployee.Add(emp);
                    }
                    else if (emp.Active == true && user.Active == false)
                    {
                        trangThaiId = 2; //Đang hoạt động - Không được truy cập
                        listEmployee.Add(emp);
                    }
                    else
                    {
                        trangThaiId = 3; //Ngừng hoạt động
                        emp.SoNamLamViec = 0;
                    }
                    emp.TrangThaiId = trangThaiId;
                });

                #endregion

                #region Lấy danh sách Mục đích sử dụng khi mà phân bổ TS
                var listMucDichSuDung = new List<CategoryEntityModel>();
                var mucDichId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "MDSD")?.CategoryTypeId;
                listMucDichSuDung = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == mucDichId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Mục đích sử dụng tài sản
                var mucDich_TaiSanId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "ASS_MD")?.CategoryTypeId;
                var listMucDichUser = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == mucDich_TaiSanId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();
                #endregion

                #region Lấy danh sách vị trí văn phòng
                var viTriVpCateId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "ASS_VITRI")?.CategoryTypeId;
                var listViTriVP = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == viTriVpCateId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                return new GetMasterDataAssetFormResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    ListPhanLoaiTS = ListPhanLoaiTS,
                    ListDonVi = ListDonVi,
                    ListHienTrangTS = ListHienTrangTS,
                    ListNuocSX = ListNuocSX,
                    ListHangSX = ListHangSX,
                    ListEmployee = listEmployee,
                    ListMucDichSuDung = listMucDichSuDung,
                    ListProvinceModel = ListProvinceEntityModel,
                    ListMaTS = ListMaTS,
                    ListMucDichUser = listMucDichUser,
                    ListViTriVP = listViTriVP,
                };

            }
            catch (Exception e)
            {
                return new GetMasterDataAssetFormResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }

        public GetAllAssetListResult GetAllAssetList(GetAllAssetListParameter parameter)
        {
            var user = context.User.FirstOrDefault(c => c.UserId == parameter.UserId);
            if (user == null)
            {
                return new GetAllAssetListResult
                {
                    Message = "Nhân viên không tồn tại trong hệ thống",
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
            var listAllEmp = context.Employee.ToList();
            var employee = listAllEmp.FirstOrDefault(c => c.EmployeeId == user.EmployeeId);
            if (employee == null)
            {
                return new GetAllAssetListResult
                {
                    Message = "Nhân viên không tồn tại trong hệ thống",
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }

            #region Lấy danh sách Phân loại tài sản
            var listAllCategoryType = context.CategoryType.ToList();
            var listAllCategory = context.Category.ToList();

            var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
            var listPhanLoai = listAllCategory
                .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                .Select(y => new CategoryEntityModel()
                {
                    CategoryId = y.CategoryId,
                    CategoryCode = y.CategoryCode,
                    CategoryName = y.CategoryName
                }).ToList();

            #endregion

            var listEmployee = new List<EmployeeEntityModel>();

            #region Lấy danh sách nhân viên
            listEmployee = listAllEmp.Select(y =>
                       new EmployeeEntityModel
                       {
                           EmployeeId = y.EmployeeId,
                           EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                       }).ToList();
            #endregion

            var listAsset = new List<AssetEntityModel>();
            var listAllAsset = context.TaiSan.Select(y => new AssetEntityModel
            {
                TaiSanId = y.TaiSanId,
                MaTaiSan = y.MaTaiSan,
                TenTaiSan = y.TenTaiSan,
                NgayVaoSo = y.NgayVaoSo,
                HienTrangTaiSan = y.HienTrangTaiSan.Value,
                MaCode = y.MaCode,
                SoSerial = y.SoSerial,
                Model = y.Model,
                PhanLoaiTaiSanId = y.PhanLoaiTaiSanId,
                MoTa = y.MoTa,
                GiaTriNguyenGia = y.GiaTriNguyenGia,
                GiaTriTinhKhauHao = y.GiaTriTinhKhauHao,
                ThoiGianKhauHao = y.ThoiGianKhauHao,
                ThoiDiemBDTinhKhauHao = y.ThoiDiemBdtinhKhauHao,
                KhuVucTaiSanId = y.KhuVucTaiSanId,
                ViTriVanPhongId = y.ViTriVanPhongId,
                MucDichId = y.MucDichId,
                ViTriTs = y.ViTriTs,
                ExpenseUnit = y.ExpenseUnit
            }).OrderByDescending(z => z.CreatedDate).ThenByDescending(z => z.NgayVaoSo).ToList();

            listAsset = listAllAsset.Where(x =>
                    (parameter.TenTaiSan == null || parameter.TenTaiSan == "" || x.TenTaiSan.Contains(parameter.TenTaiSan))
                    && (parameter.MaTaiSan == null || parameter.MaTaiSan == "" || x.MaTaiSan.Contains(parameter.MaTaiSan))
                    && (parameter.ListTrangThai == null || parameter.ListTrangThai.Count == 0 || parameter.ListTrangThai.Contains(x.HienTrangTaiSan))
                    && (parameter.ListLoaiTS == null || parameter.ListLoaiTS.Count == 0 || parameter.ListLoaiTS.Contains(x.PhanLoaiTaiSanId.Value))
                    && (parameter.ListProvinceId == null || parameter.ListProvinceId.Count == 0 || (x.KhuVucTaiSanId != null && parameter.ListProvinceId.Contains(x.KhuVucTaiSanId.Value)))
                    ).ToList();

            if (parameter.ListEmployee != null && parameter.ListEmployee.Count() > 0)
            {
                var lstTaiSanId = listAllAsset?.Where(x => x.HienTrangTaiSan == 1).Select(x => x.TaiSanId).ToList();
                var lstCapPhat = context.CapPhatTaiSan.Where(x => lstTaiSanId.Contains(x.TaiSanId) && parameter.ListEmployee.Contains(x.NguoiSuDungId)).ToList();
                var lstTaiSanCapPhatId = lstCapPhat.Select(x => x.TaiSanId).ToList();

                if (lstTaiSanCapPhatId.Count() > 0)
                {
                    listAsset = listAsset.Where(x => lstTaiSanCapPhatId.Contains(x.TaiSanId)).ToList();
                }
                else
                    listAsset = new List<AssetEntityModel>();
            }
            var listSubCode1 = GeneralList.GetSubCode1().ToList();
            if (listAsset.Count() > 0)
            {
                var lstTaiSanId = listAsset.Select(x => x.TaiSanId).ToList();
                var lstPhanBo = context.CapPhatTaiSan.Where(x => lstTaiSanId.Contains(x.TaiSanId)).OrderByDescending(a => a.CreatedDate).ToList();
                var lstPosition = context.Position.Where(x => x.Active == true).ToList();
                var lstOrganization = context.Organization.ToList();

                listAsset.ForEach(p =>
                {
                    switch (p.HienTrangTaiSan)
                    {
                        case 1:
                            p.HienTrangTaiSanString = "Đang sử dụng";
                            p.BackgroundColorForStatus = "#0F62FE";
                            break;
                        case 0:
                            p.HienTrangTaiSanString = "Không sử dụng";
                            p.BackgroundColorForStatus = "#FFC000";
                            break;
                    }
                    p.PhanLoaiTaiSan = listPhanLoai.FirstOrDefault(x => x.CategoryId == p.PhanLoaiTaiSanId)?.CategoryName;

                    // Phân bổ tài sản
                    var phanbo = lstPhanBo.Where(x => x.TaiSanId == p.TaiSanId && p.HienTrangTaiSan == 1).OrderByDescending(x => x.NgayBatDau).ToList().FirstOrDefault();
                    if (phanbo != null)
                    {
                        var emp = listAllEmp.FirstOrDefault(x => x.EmployeeId == phanbo.NguoiSuDungId);
                        if (emp != null)
                        {
                            p.Account = emp?.EmployeeCode + " - " + emp?.EmployeeName;
                            var subCode = listSubCode1.FirstOrDefault(x => x.Value == emp?.DeptCodeValue)?.Name;
                            p.Dept = subCode + " - " + emp?.DiaDiemLamviec;
                            p.MaNV = emp.EmployeeCode;
                            p.HoVaTen = emp?.EmployeeName;
                            p.PhongBan = lstOrganization.FirstOrDefault(x => x.OrganizationId == emp.OrganizationId)?.OrganizationName;
                            p.ViTriLamViec = lstPosition.FirstOrDefault(x => x.PositionId == emp.PositionId)?.PositionName;
                        }
                    }
                });
            }

            var companyConfigEntity = context.CompanyConfiguration.FirstOrDefault();
            var companyConfig = new CompanyConfigEntityModel();
            companyConfig.CompanyId = companyConfigEntity.CompanyId;
            companyConfig.CompanyName = companyConfigEntity.CompanyName;
            companyConfig.Email = companyConfigEntity.Email;
            companyConfig.Phone = companyConfigEntity.Phone;
            companyConfig.TaxCode = companyConfigEntity.TaxCode;
            companyConfig.CompanyAddress = companyConfigEntity.CompanyAddress;
            companyConfig.CompanyAddress = companyConfigEntity.CompanyAddress;

            var listProvince = context.Province.Where(x => x.IsShowAsset == true).Select(x => new ProvinceEntityModel
            {
                ProvinceId = x.ProvinceId,
                ProvinceName = x.ProvinceName
            }).ToList();

            // lấy danh sách khu vực
            return new GetAllAssetListResult()
            {
                StatusCode = HttpStatusCode.OK,
                Status = true,
                ListAsset = listAsset,
                CompanyConfig = companyConfig,
                ListEmployee = listEmployee,
                ListLoaiTaiSan = listPhanLoai,
                ListKhuVuc = listProvince
            };
        }

        public GetMasterDataPhanBoTSFormResult GetMasterDataPhanBoTSForm(GetMasterDataAssetFormParameter parameter)
        {
            try
            {
                var listLoaiTSPB = new List<CategoryEntityModel>();
                var listMucDichSuDung = new List<CategoryEntityModel>();
                var listEmployee = new List<EmployeeEntityModel>();
                var listTaiSan = new List<AssetEntityModel>();

                #region Common data
                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();
                #endregion

                #region Lấy danh sách Phân loại tài sản
                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                listLoaiTSPB = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Mục đích sử dụng

                var donViId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "MDSD")?.CategoryTypeId;
                listMucDichSuDung = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == donViId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách nhân viên
                listEmployee = context.Employee.Select(y =>
                           new EmployeeEntityModel
                           {
                               EmployeeId = y.EmployeeId,
                               EmployeeCode = y.EmployeeCode,
                               EmployeeName = y.EmployeeName,
                               EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                               OrganizationId = y.OrganizationId,
                               PositionId = y.PositionId,
                               ProvinceName = y.ViTriLamViec
                           }).ToList();

                var listPosition = context.Position.ToList();
                var listOrganization = context.Organization.ToList();

                listEmployee?.ForEach(item =>
                {
                    var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                    item.OrganizationName = phongBan?.OrganizationName;

                    var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                    item.PositionName = chucVu?.PositionName;
                });
                #endregion

                #region Lấy danh Tài sản chưa phân bổ
                listTaiSan = context.TaiSan.Where(x => x.HienTrangTaiSan == 0).Select(y => new AssetEntityModel
                {
                    TaiSanId = y.TaiSanId,
                    MaTaiSan = y.MaTaiSan,
                    TenTaiSan = y.TenTaiSan,
                    SoSerial = y.SoSerial,
                    ViTriTs = y.ViTriTs,
                    TenTaiSanCode = y.MaTaiSan + " - " + y.TenTaiSan,
                    MaCode = y.MaCode,
                    PhanLoaiTaiSanId = y.PhanLoaiTaiSanId,
                }).OrderByDescending(z => z.CreatedDate).ThenByDescending(z => z.NgayVaoSo).ToList();

                #endregion

                return new GetMasterDataPhanBoTSFormResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    ListLoaiTSPB = listLoaiTSPB,
                    ListMucDichSuDung = listMucDichSuDung,
                    ListEmployee = listEmployee,
                    ListTaiSan = listTaiSan
                };

            }
            catch (Exception e)
            {
                return new GetMasterDataPhanBoTSFormResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }
        public TaoPhanBoTaiSanResult TaoPhanBoTaiSan(TaoPhanBoTaiSanParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var listPhanBo = new List<CapPhatTaiSan>();
                    // Kiểm tra xem tài sản đã được phân bổ hay chưa
                    var lstTaiSanId = parameter.ListPhanBo.Select(x => x.TaiSanId).ToList();
                    var lstCapPhatTonTai = new List<int>();

                    var lstEmpId = parameter.ListPhanBo.Select(x => x.NguoiSuDungId).ToList();

                    var lstCapPhat = context.CapPhatTaiSan.Where(x => x.LoaiCapPhat == 1 && lstEmpId.Contains(x.NguoiSuDungId)).ToList();

                    var listTaiSan = context.TaiSan.Where(x => lstTaiSanId.Contains(x.TaiSanId)).ToList();

                    // Danh sách tài sản đã được cấp phát
                    lstTaiSanId.ForEach(taiSanId =>
                    {
                        if (listTaiSan.FirstOrDefault(x => x.HienTrangTaiSan == 1) != null)
                        {
                            lstCapPhatTonTai.Add(taiSanId);
                        }
                    });

                    if (lstCapPhatTonTai.Count() == 0)
                    {
                        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                        var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);
                        parameter.ListPhanBo.ForEach(item =>
                        {
                            CapPhatTaiSan capPhat = new CapPhatTaiSan();
                            capPhat.TaiSanId = item.TaiSanId;
                            capPhat.NguoiSuDungId = item.NguoiSuDungId;
                            capPhat.NguoiCapPhatId = emp.EmployeeId;

                            capPhat.MucDichSuDungId = item.MucDichSuDungId;
                            capPhat.NgayBatDau = item.NgayBatDau;
                            capPhat.NgayKetThuc = item.NgayKetThuc;
                            capPhat.LyDo = item.LyDo;
                            capPhat.LoaiCapPhat = 1; // cấp phát - 0 là thu hồi
                            capPhat.TrangThai = true;

                            capPhat.YeuCauCapPhatTaiSanChiTietId = item.YeuCauCapPhatTaiSanChiTietId;

                            capPhat.CreatedById = parameter.UserId;
                            capPhat.CreatedDate = DateTime.Now;
                            capPhat.UpdatedById = parameter.UserId;
                            capPhat.UpdatedDate = DateTime.Now;

                            listPhanBo.Add(capPhat);
                        });

                        listTaiSan.ForEach(taisan =>
                        {
                            taisan.HienTrangTaiSan = 1;
                        });

                        context.TaiSan.UpdateRange(listTaiSan);
                        context.CapPhatTaiSan.AddRange(listPhanBo);
                        context.SaveChanges();

                        transaction.Commit();
                        return new TaoPhanBoTaiSanResult()
                        {
                            Status = true,
                            StatusCode = HttpStatusCode.OK,
                            Message = "Cấp phát tài sản thành công.",
                        };
                    }
                    else
                    {
                        return new TaoPhanBoTaiSanResult()
                        {
                            ListAssetId = lstCapPhatTonTai,
                            StatusCode = HttpStatusCode.Forbidden,
                            Status = false
                        };
                    }

                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new TaoPhanBoTaiSanResult()
                    {
                        Message = e.Message,
                        StatusCode = HttpStatusCode.Forbidden,
                        Status = false
                    };
                }
            }
        }

        public TaoPhanBoTaiSanResult TaoThuHoiTaiSan(TaoPhanBoTaiSanParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var listThuHoi = new List<CapPhatTaiSan>();
                    // Kiểm tra xem tài sản đã được thu hồi hay chưa
                    var lstTaiSanId = parameter.ListPhanBo.Select(x => x.TaiSanId).ToList();

                    var lstEmpId = parameter.ListPhanBo.Select(x => x.NguoiSuDungId).ToList();

                    // Danh sách tài sản đang được cấp phát
                    var listTaiSan = context.TaiSan.Where(x => lstTaiSanId.Contains(x.TaiSanId)).ToList();

                    var lstThuHoiTonTai = new List<int>();
                    // Lấy danh sách thu hổi
                    var lstThuHoi = context.CapPhatTaiSan.Where(x => x.LoaiCapPhat == 0 && lstEmpId.Contains(x.NguoiSuDungId)).ToList();

                    // Danh sách tài sản đã được thu hồi
                    lstTaiSanId.ForEach(taiSanId =>
                    {
                        if (listTaiSan.FirstOrDefault(x => x.HienTrangTaiSan == 0) != null)
                        {
                            lstThuHoiTonTai.Add(taiSanId);
                        }
                    });

                    if (lstThuHoiTonTai.Count() == 0)
                    {
                        var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                        var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);
                        parameter.ListPhanBo.ForEach(item =>
                        {
                            CapPhatTaiSan thuHoi = new CapPhatTaiSan();
                            thuHoi.TaiSanId = item.TaiSanId;
                            thuHoi.NguoiSuDungId = item.NguoiSuDungId;
                            thuHoi.NguoiCapPhatId = emp.EmployeeId;

                            thuHoi.MucDichSuDungId = item.MucDichSuDungId;
                            thuHoi.NgayBatDau = item.NgayBatDau;
                            thuHoi.NgayKetThuc = null;
                            thuHoi.LyDo = item.LyDo;
                            thuHoi.LoaiCapPhat = 0; // 0 là thu hồi - 1 là cấp phát
                            thuHoi.TrangThai = false;

                            thuHoi.CreatedById = parameter.UserId;
                            thuHoi.CreatedDate = DateTime.Now;
                            thuHoi.UpdatedById = parameter.UserId;
                            thuHoi.UpdatedDate = DateTime.Now;

                            listThuHoi.Add(thuHoi);
                        });

                        listTaiSan.ForEach(taisan =>
                        {
                            taisan.HienTrangTaiSan = 0;
                        });
                        context.TaiSan.UpdateRange(listTaiSan);
                        context.CapPhatTaiSan.AddRange(listThuHoi);

                        context.SaveChanges();
                        transaction.Commit();

                        return new TaoPhanBoTaiSanResult()
                        {
                            Status = true,
                            StatusCode = HttpStatusCode.OK,
                            Message = "Thu hồi tài sản thành công.",
                        };
                    }
                    else
                    {
                        return new TaoPhanBoTaiSanResult()
                        {
                            ListAssetId = lstThuHoiTonTai,
                            StatusCode = HttpStatusCode.Forbidden,
                            Status = false
                        };
                    }

                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new TaoPhanBoTaiSanResult()
                    {
                        Message = e.Message,
                        StatusCode = HttpStatusCode.Forbidden,
                        Status = false
                    };
                }
            }
        }
        public GetMasterDataPhanBoTSFormResult GetMasterDataThuHoiTSForm(GetMasterDataAssetFormParameter parameter)
        {
            try
            {
                var listLoaiTS = new List<CategoryEntityModel>();
                var listEmployee = new List<EmployeeEntityModel>();
                var listTaiSan = new List<AssetEntityModel>();

                #region Common data
                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();
                #endregion

                #region Lấy danh sách Phân loại tài sản
                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                listLoaiTS = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách nhân viên
                listEmployee = context.Employee.Select(y =>
                           new EmployeeEntityModel
                           {
                               EmployeeId = y.EmployeeId,
                               EmployeeCode = y.EmployeeCode,
                               EmployeeName = y.EmployeeName,
                               EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                               OrganizationId = y.OrganizationId,
                               PositionId = y.PositionId
                           }).ToList();

                var listPosition = context.Position.ToList();
                var listOrganization = context.Organization.ToList();

                listEmployee?.ForEach(item =>
                {
                    var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                    item.OrganizationName = phongBan?.OrganizationName;

                    var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                    item.PositionName = chucVu?.PositionName;
                });
                #endregion

                #region Lấy danh Tài sản đã phẩn bổ
                var lstAllTaiSanCapPhat = context.CapPhatTaiSan.Where(x => x.LoaiCapPhat == 1).ToList();
                var lstTaiSanDaCapPhatId = lstAllTaiSanCapPhat.Select(x => x.TaiSanId).ToList();

                var lstAllTaiSanPhanBo = context.TaiSan.Where(x => x.HienTrangTaiSan == 1).ToList();

                listTaiSan = (from taisan in lstAllTaiSanPhanBo
                              select new AssetEntityModel
                              {
                                  TaiSanId = taisan.TaiSanId,
                                  MaTaiSan = taisan.MaTaiSan,
                                  TenTaiSan = taisan.TenTaiSan,
                                  TenTaiSanCode = taisan.MaTaiSan + " - " + taisan.TenTaiSan,
                                  MaCode = taisan.MaCode,
                                  PhanLoaiTaiSanId = taisan.PhanLoaiTaiSanId,
                              }).OrderBy(x => x.TenTaiSan).ToList();

                listTaiSan.ForEach(ts =>
                {
                    ts.NguoiSuDungId = lstAllTaiSanCapPhat.OrderByDescending(x => x.NgayBatDau).FirstOrDefault(x => x.TaiSanId == ts.TaiSanId)?.NguoiSuDungId;
                    if (ts.NguoiSuDungId != null)
                    {
                        var nhanvien = listEmployee.FirstOrDefault(x => x.EmployeeId == ts.NguoiSuDungId);
                        ts.MaNV = nhanvien.EmployeeCode;
                        ts.HoVaTen = nhanvien.EmployeeName;
                        ts.ViTriLamViec = nhanvien?.PositionName;
                        ts.PhongBan = nhanvien?.OrganizationName;
                    }
                });

                #endregion
                return new GetMasterDataPhanBoTSFormResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    ListLoaiTSPB = listLoaiTS,
                    ListEmployee = listEmployee,
                    ListTaiSan = listTaiSan
                };

            }
            catch (Exception e)
            {
                return new GetMasterDataPhanBoTSFormResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }

        public CreateOrUpdateBaoDuongResult CreateOrUpdateBaoDuong(CreateOrUpdateBaoDuongParameter parameter)
        {
            try
            {
                if (parameter.BaoDuong.BaoDuongTaiSanId == 0)
                {
                    parameter.BaoDuong.CreatedById = parameter.UserId;
                    parameter.BaoDuong.CreatedDate = DateTime.Now;
                    context.BaoDuongTaiSan.Add(parameter.BaoDuong);
                }
                else
                {
                    var baoDuong = context.BaoDuongTaiSan.FirstOrDefault(x => x.BaoDuongTaiSanId == parameter.BaoDuong.BaoDuongTaiSanId);
                    if (baoDuong != null)
                    {
                        baoDuong.MoTa = parameter.BaoDuong.MoTa;
                        baoDuong.TuNgay = parameter.BaoDuong.TuNgay;
                        baoDuong.DenNgay = parameter.BaoDuong.DenNgay;
                        baoDuong.NguoiPhuTrachId = parameter.BaoDuong.NguoiPhuTrachId;
                        baoDuong.UpdatedById = parameter.UserId;
                        baoDuong.UpdatedDate = DateTime.Now;

                        context.BaoDuongTaiSan.Update(baoDuong);
                    }
                }

                context.SaveChanges();

                #region Lấy danh sách nhân viên
                var listEmployee = new List<EmployeeEntityModel>();
                listEmployee = context.Employee.Select(y =>
                           new EmployeeEntityModel
                           {
                               EmployeeId = y.EmployeeId,
                               EmployeeName = y.EmployeeName,
                           }).ToList();
                #endregion
                #region Bảo dưỡng, bảo trì
                var listBaoDuong = new List<BaoDuongEntityModel>();
                listBaoDuong = context.BaoDuongTaiSan.Where(x => x.TaiSanId == parameter.BaoDuong.TaiSanId).Select(y =>
                           new BaoDuongEntityModel
                           {
                               TaiSanId = y.TaiSanId,
                               BaoDuongTaiSanId = y.BaoDuongTaiSanId,
                               TuNgay = y.TuNgay,
                               DenNgay = y.DenNgay,
                               NguoiPhuTrachId = y.NguoiPhuTrachId,
                               MoTa = y.MoTa
                           }).ToList();

                listBaoDuong.ForEach(baoduong =>
                {
                    baoduong.NguoiPhuTrach = listEmployee.FirstOrDefault(x => x.EmployeeId == baoduong.NguoiPhuTrachId)?.EmployeeName;
                });
                #endregion
                return new CreateOrUpdateBaoDuongResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    Message = parameter.BaoDuong.BaoDuongTaiSanId == 0 ? "Thêm mới bảo dưỡng thành công." : "Cập nhập bảo dưỡng thành công.",
                    BaoDuongId = parameter.BaoDuong.TaiSanId,
                    ListBaoDuong = listBaoDuong
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdateBaoDuongResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }

        public DeleteBaoDuongResult DeleteBaoDuong(DeleteBaoDuongParameter parameter)
        {
            try
            {
                var baoduong = context.BaoDuongTaiSan.FirstOrDefault(x => x.BaoDuongTaiSanId == parameter.BaoDuongId);

                if (baoduong != null)
                {
                    context.BaoDuongTaiSan.Remove(baoduong);
                    context.SaveChanges();
                }
                else
                {
                    return new DeleteBaoDuongResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = "Không tồn tại bảo dưỡng!"
                    };
                }

                return new DeleteBaoDuongResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa bảo dưỡng thành công"
                };
            }
            catch (Exception e)
            {
                return new DeleteBaoDuongResult
                {
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public GetDataAssetDetailResult GetDataAssetDetail(GetDataAssetDetailParameter parameter)
        {
            try
            {
                int pageSize = 10;
                int pageIndex = 1;
                var taiSanDetail = context.TaiSan.Where(x => x.TaiSanId == parameter.TaiSanId).Select(taiSan => new AssetEntityModel
                {
                    TaiSanId = taiSan.TaiSanId,
                    MaTaiSan = taiSan.MaTaiSan,
                    TenTaiSan = taiSan.TenTaiSan,
                    MaCode = taiSan.MaCode,
                    PhanLoaiTaiSanId = taiSan.PhanLoaiTaiSanId,
                    NgayVaoSo = taiSan.NgayVaoSo,
                    HienTrangTaiSan = taiSan.HienTrangTaiSan.Value,
                    DonViTinhId = taiSan.DonViTinhId,
                    SoLuong = taiSan.SoLuong,
                    MoTa = taiSan.MoTa,

                    SoSerial = taiSan.SoSerial,
                    Model = taiSan.Model,
                    SoHieu = taiSan.SoHieu,
                    ThongTinNoiMua = taiSan.ThongTinNoiMua,
                    NamSX = taiSan.NamSx,
                    HangSXId = taiSan.HangSxid,
                    NuocSXId = taiSan.NuocSxid,
                    NgayMua = taiSan.NgayMua,
                    ThoiHanBaoHanh = taiSan.ThoiHanBaoHanh,
                    BaoDuongDinhKy = taiSan.BaoDuongDinhKy,
                    ThongTinNoiBaoHanh = taiSan.ThongTinNoiBaoHanh,
                    KhuVucTaiSanId = taiSan.KhuVucTaiSanId,
                    GiaTriNguyenGia = taiSan.GiaTriNguyenGia,
                    GiaTriTinhKhauHao = taiSan.GiaTriTinhKhauHao,
                    TiLeKhauHao = taiSan.TiLeKhauHao.Value,
                    ThoiGianKhauHao = taiSan.ThoiGianKhauHao,
                    ThoiDiemBDTinhKhauHao = taiSan.ThoiDiemBdtinhKhauHao,
                    PhuongPhapTinhKhauHao = taiSan.PhuongPhapTinhKhauHao,

                    ViTriVanPhongId = taiSan.ViTriVanPhongId,
                    MucDichId = taiSan.MucDichId,
                    ViTriTs = taiSan.ViTriTs,
                    ExpenseUnit = taiSan.ExpenseUnit,
                }).ToList();

                if (taiSanDetail.Count() == 0)
                {
                    return new GetDataAssetDetailResult()
                    {
                        Message = "Không tồn tại tài sản!",
                        StatusCode = HttpStatusCode.FailedDependency,
                        Status = false
                    };
                }
                var user = context.User.FirstOrDefault(c => c.UserId == parameter.UserId);
                var listTaiSanPhanBo = new List<AssetEntityModel>();
                var listEmployee = new List<EmployeeEntityModel>();
                var listBaoDuong = new List<BaoDuongEntityModel>();

                #region Lấy danh sách nhân viên
                listEmployee = context.Employee.Select(y =>
                           new EmployeeEntityModel
                           {
                               EmployeeId = y.EmployeeId,
                               OrganizationId = y.OrganizationId,
                               PositionId = y.PositionId,
                               EmployeeCode = y.EmployeeCode,
                               EmployeeName = y.EmployeeName,
                               EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                           }).ToList();

                var listPosition = context.Position.ToList();
                var listOrganization = context.Organization.ToList();

                listEmployee?.ForEach(item =>
                {
                    var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                    item.OrganizationName = phongBan?.OrganizationName;

                    var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                    item.PositionName = chucVu?.PositionName;
                });
                #endregion

                #region Bảo dưỡng, bảo trì
                listBaoDuong = context.BaoDuongTaiSan.Where(x => x.TaiSanId == parameter.TaiSanId).Select(y =>
                           new BaoDuongEntityModel
                           {
                               TaiSanId = y.TaiSanId,
                               BaoDuongTaiSanId = y.BaoDuongTaiSanId,
                               TuNgay = y.TuNgay,
                               DenNgay = y.DenNgay,
                               NguoiPhuTrachId = y.NguoiPhuTrachId,
                               MoTa = y.MoTa
                           }).ToList();

                listBaoDuong.ForEach(baoduong =>
                {
                    baoduong.NguoiPhuTrach = listEmployee.FirstOrDefault(x => x.EmployeeId == baoduong.NguoiPhuTrachId)?.EmployeeName;
                });
                #endregion

                #region Lấy danh lịch sử phẩn bổ và thu hồi

                var lstAllTaiSanCapPhat = context.CapPhatTaiSan.ToList();
                var lstTaiSanDaCapPhatId = lstAllTaiSanCapPhat.Select(x => x.TaiSanId).ToList();

                listTaiSanPhanBo = (from taisan in taiSanDetail
                                    join capphat in lstAllTaiSanCapPhat on taisan.TaiSanId equals capphat.TaiSanId
                                    //into cu
                                    //from x in cu.DefaultIfEmpty()
                                    select new AssetEntityModel
                                    {
                                        TaiSanId = taisan.TaiSanId,
                                        MaTaiSan = taisan.MaTaiSan,
                                        TenTaiSan = taisan.TenTaiSan,
                                        TenTaiSanCode = taisan.MaTaiSan + " - " + taisan.TenTaiSan,
                                        MaCode = taisan.MaCode,
                                        PhanLoaiTaiSanId = taisan.PhanLoaiTaiSanId,
                                        NguoiSuDungId = capphat.NguoiSuDungId,
                                        NgayBatDau = capphat.NgayBatDau,
                                        NgayKetThuc = capphat.NgayKetThuc,
                                        LoaiCapPhat = capphat.LoaiCapPhat == 0 ? "Thu hồi" : "Cấp phát",
                                        LyDo = capphat.LyDo
                                    }).OrderBy(x => x.CreatedDate).ToList();

                listTaiSanPhanBo.ForEach(ts =>
                {
                    if (ts.NguoiSuDungId != Guid.Empty)
                    {
                        var nhanvien = listEmployee.FirstOrDefault(x => x.EmployeeId == ts.NguoiSuDungId);
                        ts.MaNV = nhanvien.EmployeeCode;
                        ts.HoVaTen = nhanvien.EmployeeName;
                        ts.ViTriLamViec = nhanvien?.PositionName;
                        ts.PhongBan = nhanvien?.OrganizationName;
                        ts.NguoiCapPhat = listEmployee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId).EmployeeName;
                    }
                });

                taiSanDetail.FirstOrDefault().NguoiSuDungId = listTaiSanPhanBo.Count() == 0 ? Guid.Empty : listTaiSanPhanBo?.OrderByDescending(x => x.CreatedDate).FirstOrDefault().NguoiSuDungId;

                #endregion

                #region Lấy dách file đinh kèm 
                var objectType = "ASSET";
                var folderCommon = context.Folder.ToList();
                var folder = folderCommon.FirstOrDefault(x => x.FolderType == objectType);

                var listFileResult = context.FileInFolder
                                .Where(x => x.ObjectNumber == parameter.TaiSanId && x.FolderId == folder.FolderId).Select(y =>
                                    new FileInFolderEntityModel
                                    {
                                        Size = y.Size,
                                        ObjectId = y.ObjectId,
                                        Active = y.Active,
                                        FileExtension = y.FileExtension,
                                        FileInFolderId = y.FileInFolderId,
                                        FileName = y.FileName,
                                        FolderId = y.FolderId,
                                        ObjectType = y.ObjectType,
                                        ObjectNumber = y.ObjectNumber,
                                        CreatedById = y.CreatedById,
                                        CreatedDate = y.CreatedDate,
                                        UpdatedById = y.UpdatedById,
                                        UpdatedDate = y.UpdatedDate
                                    }).OrderBy(z => z.CreatedDate).ToList();

                listFileResult.ForEach(x =>
                {
                    x.UploadByName = context.User.FirstOrDefault(u => u.UserId == x.CreatedById)?.UserName;
                });
                #endregion

                #region Lấy thông tin ghi chú
                var listNote = new List<NoteEntityModel>();

                var folderUrl = folderCommon.FirstOrDefault(x => x.FolderType == objectType)?.Url;
                var webRootPath = hostingEnvironment.WebRootPath + "\\";
                // list ghi chú 
                listNote = context.Note.Where(x =>
                        x.ObjectNumber == parameter.TaiSanId && x.ObjectType == objectType && x.Active == true)
                    .Select(y => new NoteEntityModel
                    {
                        NoteId = y.NoteId,
                        Description = y.Description,
                        Type = y.Type,
                        ObjectNumber = y.ObjectNumber,
                        ObjectType = y.ObjectType,
                        NoteTitle = y.NoteTitle,
                        Active = y.Active,
                        CreatedById = y.CreatedById,
                        CreatedDate = y.CreatedDate,
                        UpdatedById = y.UpdatedById,
                        UpdatedDate = y.UpdatedDate,
                        ResponsibleName = "",
                        ResponsibleAvatar = "",
                        NoteDocList = new List<NoteDocumentEntityModel>()
                    }).ToList();


                if (listNote.Count > 0)
                {
                    var listNoteId = listNote.Select(x => x.NoteId).ToList();
                    var listUser = context.User.ToList();
                    var _listAllEmployee = context.Employee.ToList();
                    var listNoteDocument = context.NoteDocument.Where(x => listNoteId.Contains(x.NoteId)).Select(
                        y => new NoteDocumentEntityModel
                        {
                            DocumentName = y.DocumentName,
                            DocumentSize = y.DocumentSize,
                            DocumentUrl = y.DocumentUrl,
                            CreatedById = y.CreatedById,
                            CreatedDate = y.CreatedDate,
                            UpdatedById = y.UpdatedById,
                            UpdatedDate = y.UpdatedDate,
                            NoteDocumentId = y.NoteDocumentId,
                            NoteId = y.NoteId
                        }
                    ).ToList();

                    var listFileInFolder = context.FileInFolder.Where(x => listNoteId.Contains((Guid)x.ObjectId))
                        .ToList();

                    listFileInFolder.ForEach(item =>
                    {
                        var file = new NoteDocumentEntityModel
                        {
                            DocumentName = item.FileName.Substring(0, item.FileName.LastIndexOf("_")),
                            DocumentSize = item.Size,
                            CreatedById = item.CreatedById,
                            CreatedDate = item.CreatedDate,
                            UpdatedById = item.UpdatedById,
                            UpdatedDate = item.UpdatedDate,
                            NoteDocumentId = item.FileInFolderId,
                            NoteId = (Guid)item.ObjectId
                        };

                        var fileName = $"{item.FileName}.{item.FileExtension}";
                        var folderName = ConvertFolderUrl(folderUrl);

                        file.DocumentUrl = Path.Combine(webRootPath, folderName, fileName);

                        listNoteDocument.Add(file);
                    });

                    listNote.ForEach(item =>
                    {
                        var _user = listUser.FirstOrDefault(x => x.UserId == item.CreatedById);
                        if (_user != null)
                        {
                            var _employee = _listAllEmployee.FirstOrDefault(x => x.EmployeeId == _user.EmployeeId);
                            item.ResponsibleName = _employee.EmployeeName;
                            item.NoteDocList = listNoteDocument.Where(x => x.NoteId == item.NoteId)
                                .OrderBy(z => z.UpdatedDate).ToList();
                        }
                    });

                    // Sắp xếp lại listnote
                    listNote = listNote.OrderByDescending(x => x.CreatedDate).ToList();

                    listNote = listNote
                        .Skip(pageSize * (pageIndex - 1))
                        .Take(pageSize).ToList();
                }

                #endregion



                return new GetDataAssetDetailResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    ListTaiSanPhanBo = listTaiSanPhanBo,
                    ListBaoDuong = listBaoDuong,
                    AssetDetail = taiSanDetail.FirstOrDefault(),
                    ListFileInFolder = listFileResult,
                    ListNote = listNote,
                };

            }
            catch (Exception e)
            {
                return new GetDataAssetDetailResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }

        public UploadFileVacanciesResult UploadFile(UploadFileAssetParameter parameter)
        {
            var folder = context.Folder.FirstOrDefault(x => x.FolderType == parameter.FolderType);

            if (folder == null)
            {
                return new UploadFileVacanciesResult()
                {
                    Status = false,
                    Message = "Thư mục upload không tồn tại"
                };
            }

            var listFileDelete = new List<string>();
            try
            {
                var listFileResult = new List<FileInFolderEntityModel>();
                if (parameter.ListFile != null && parameter.ListFile.Count > 0)
                {
                    bool isSave = true;
                    parameter.ListFile.ForEach(item =>
                    {
                        if (folder == null)
                        {
                            isSave = false;
                        }
                        string folderName = ConvertFolderUrl(folder.Url);
                        string webRootPath = hostingEnvironment.WebRootPath;
                        string newPath = Path.Combine(webRootPath, folderName);

                        if (!Directory.Exists(newPath))
                        {
                            isSave = false;
                        }

                        if (isSave)
                        {
                            var file = new FileInFolder()
                            {
                                Active = true,
                                CreatedById = parameter.UserId,
                                CreatedDate = DateTime.Now,
                                FileInFolderId = Guid.NewGuid(),
                                FileName = item.FileInFolder.FileName + "_" + Guid.NewGuid().ToString(),
                                FolderId = folder.FolderId,
                                ObjectId = item.FileInFolder.ObjectId,
                                ObjectType = item.FileInFolder.ObjectType,
                                ObjectNumber = parameter.ObjectNumber,
                                Size = item.FileInFolder.Size,
                                FileExtension =
                                    item.FileSave.FileName.Substring(item.FileSave.FileName.LastIndexOf(".") + 1)
                            };
                            context.Add(file);

                            string fileName = file.FileName + "." + file.FileExtension;

                            if (isSave)
                            {
                                string fullPath = Path.Combine(newPath, fileName);
                                using (var stream = new FileStream(fullPath, FileMode.Create))
                                {
                                    item.FileSave.CopyTo(stream);
                                    listFileDelete.Add(fullPath);
                                }
                            }
                        }
                    });
                    if (!isSave)
                    {
                        listFileDelete.ForEach(item =>
                        {
                            File.Delete(item);
                        });

                        return new UploadFileVacanciesResult()
                        {
                            Status = false,
                            Message = "Bạn phải cấu hình thư mục để lưu"
                        };
                    }
                }

                context.SaveChanges();

                #region Lấy danh sách file
                var listCommonFolders = context.Folder.Where(x => x.ObjectNumber == parameter.ObjectNumber && x.FolderType == parameter.FolderType)
               .Select(y => new FolderEntityModel
               {
                   FolderId = y.FolderId,
                   ParentId = y.ParentId,
                   Name = y.Name,
               }).ToList();

                listCommonFolders.ForEach(item =>
                {
                    item.HasChild = context.Folder.FirstOrDefault(x => x.ParentId == item.FolderId) != null;
                });

                var listCommonFile = context.FileInFolder.Where(x => x.ObjectNumber == parameter.ObjectNumber).ToList();

                var webRootPathR = hostingEnvironment.WebRootPath + "\\";

                var folderObject = context.Folder.FirstOrDefault(x => x.FolderType == parameter.FolderType);
                listFileResult = GetAllFile(folderObject.FolderId, listCommonFolders, listCommonFile);


                listFileResult.ForEach(x =>
                {
                    x.UploadByName = context.User.FirstOrDefault(u => u.UserId == x.CreatedById)?.UserName;
                    x.FileFullName = $"{x.FileName}.{x.FileExtension}";
                    var folderUrl = context.Folder.FirstOrDefault(item => item.FolderId == x.FolderId)?.Url;
                    x.FileUrl = Path.Combine(webRootPathR, folderUrl, x.FileFullName);
                });

                listFileResult = listFileResult.OrderBy(x => x.CreatedDate).ToList();
                #endregion

                return new UploadFileVacanciesResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    ListFileInFolder = listFileResult
                };
            }
            catch (Exception ex)
            {
                listFileDelete.ForEach(item =>
                {
                    Directory.Delete(item);
                });

                return new UploadFileVacanciesResult()
                {
                    StatusCode = HttpStatusCode.Forbidden,
                    Message = ex.Message
                };
            }
        }
        private List<FileInFolderEntityModel> GetAllFile(Guid folderId, List<FolderEntityModel> listCommonFolders, List<FileInFolder> listCommonFile)
        {
            var listResult = new List<FileInFolderEntityModel>();

            var listFile = listCommonFile.Where(x => x.FolderId == folderId).ToList();

            listFile.ForEach(item =>
            {
                var fileInFolder = new FileInFolderEntityModel
                {
                    FileInFolderId = item.FileInFolderId,
                    FolderId = item.FolderId,
                    FileName = item.FileName,
                    ObjectId = item.ObjectId,
                    ObjectType = item.ObjectType,
                    FileExtension = item.FileExtension,
                    Size = item.Size,
                    Active = item.Active,
                    CreatedById = item.CreatedById,
                    CreatedDate = item.CreatedDate,
                    UpdatedById = item.UpdatedById,
                    UpdatedDate = item.UpdatedDate
                };

                listResult.Add(fileInFolder);
            });

            var folder = listCommonFolders.FirstOrDefault(x => x.FolderId == folderId);

            if (folder != null && folder.HasChild)
            {
                var listFolderChild = listCommonFolders.Where(x => x.ParentId == folderId).ToList();

                listFolderChild.ForEach(item =>
                {
                    listResult.AddRange(GetAllFile(item.FolderId, listCommonFolders, listCommonFile));
                });
            }

            return listResult;
        }
        private string ConvertFolderUrl(string url)
        {
            var stringResult = url.Split(@"\");
            string result = "";
            for (int i = 0; i < stringResult.Length; i++)
            {
                result = result + stringResult[i] + "\\";
            }

            result = result.Substring(0, result.Length - 1);

            return result;
        }

        public DownloadTemplateAssetResult DownloadTemplateAsset(DownloadTemplateAssetParameter parameter)
        {
            try
            {
                string rootFolder = hostingEnvironment.WebRootPath + "\\ExcelTemplate";
                string fileName = @"";
                var mess = "";
                if (parameter.PhanLoai == 1)
                {
                    fileName = @"Template_PhanBo_TaiSan.xlsx";
                    mess = "Template_PhanBo_TaiSan";
                }
                else if (parameter.PhanLoai == 0)
                {
                    fileName = @"Template_ThuHoi_TaiSan.xlsx";
                    mess = "Template_ThuHoi_TaiSan";
                }
                else if (parameter.PhanLoai == 2)
                {
                    fileName = @"Template_YeuCauTaiSan.xlsx";
                    mess = "Template_YeuCauTaiSan";
                }
                //FileInfo file = new FileInfo(Path.Combine(rootFolder, fileName));
                string newFilePath = Path.Combine(rootFolder, fileName);
                byte[] data = File.ReadAllBytes(newFilePath);

                return new DownloadTemplateAssetResult
                {
                    ExcelFile = data,
                    MessageCode = string.Format("Đã dowload file {0}", mess),
                    NameFile = mess,
                    StatusCode = System.Net.HttpStatusCode.OK
                };

            }
            catch (Exception)
            {
                return new DownloadTemplateAssetResult
                {
                    MessageCode = "Đã có lỗi xảy ra trong quá trình download",
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed
                };
            }
        }

        #region YÊU CẦU CẤP PHÁT
        public GetMasterDataPhanBoTSFormResult GetMasterDataYeuCauCapPhatForm(GetMasterDataAssetFormParameter parameter)
        {
            try
            {
                #region Check permision: manager
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId && x.Active == true);
                if (user == null)
                {
                    return new GetMasterDataPhanBoTSFormResult
                    {
                        Status = false,
                        Message = "User không có quyền truy xuất dữ liệu trong hệ thống"
                    };
                }
                if (user.EmployeeId == null || user.EmployeeId == Guid.Empty)
                {
                    return new GetMasterDataPhanBoTSFormResult
                    {
                        Status = false,
                        Message = "Lỗi dữ liệu"
                    };
                }

                #endregion

                var listLoaiTS = new List<CategoryEntityModel>();
                var listMucDichSuDung = new List<CategoryEntityModel>();
                var listEmployee = new List<EmployeeEntityModel>();
                var ListDonVi = new List<CategoryEntityModel>();
                #region Common data
                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();
                #endregion

                #region Lấy danh sách Phân loại tài sản
                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                listLoaiTS = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Mục đích sử dụng

                var mucDichId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "MDSD")?.CategoryTypeId;
                listMucDichSuDung = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == mucDichId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách nhân viên
                var listAllUser = context.User.ToList();
                var listAllEmployee = context.Employee.Select(y =>
                         new EmployeeEntityModel
                         {
                             EmployeeId = y.EmployeeId,
                             EmployeeCode = y.EmployeeCode,
                             EmployeeName = y.EmployeeName,
                             EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                             OrganizationId = y.OrganizationId,
                             PositionId = y.PositionId,
                             IsManager = y.IsManager,
                             Active = y.Active
                         }).OrderBy(x => x.EmployeeCode).ToList();

                var listPosition = context.Position.ToList();
                var listOrganization = context.Organization.ToList();

                listAllEmployee?.ForEach(item =>
                {
                    var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                    item.OrganizationName = phongBan?.OrganizationName;

                    var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                    item.PositionName = chucVu?.PositionName;

                    var trangThaiId = 0;
                    var userInfor = listAllUser.FirstOrDefault(x => x.EmployeeId == item.EmployeeId);

                    if (item.Active == true && userInfor.Active == true)
                    {
                        trangThaiId = 1; //Đang hoạt động - Được phê duyệt
                        listEmployee.Add(item);
                    }
                    else if (item.Active == true && userInfor.Active == false)
                    {
                        trangThaiId = 2; //Đang hoạt động - Không được truy cập
                        listEmployee.Add(item);
                    }
                    else
                    {
                        trangThaiId = 3; //Ngừng hoạt động
                        item.SoNamLamViec = 0;
                    }
                    item.TrangThaiId = trangThaiId;

                });

                var employeeId = user.EmployeeId;
                var employeeLogin = listEmployee.FirstOrDefault(x => x.EmployeeId == employeeId);
                var isManager = employeeLogin.IsManager;

                if (isManager == true)
                {
                    //Lấy list phòng ban con của user
                    List<Guid?> listGetAllChild = new List<Guid?>();    //List phòng ban: chính nó và các phòng ban cấp dưới của nó
                    if (employeeLogin.OrganizationId != null)
                    {
                        listGetAllChild.Add(employeeLogin.OrganizationId.Value);
                        listGetAllChild = getOrganizationChildrenId(employeeLogin.OrganizationId.Value, listGetAllChild);
                    }
                    //Lấy danh sách nhân viên EmployyeeId mà user phụ trách
                    var listEmployeeInChargeByManager = listEmployee.Where(x => (listGetAllChild == null || listGetAllChild.Count == 0 || listGetAllChild.Contains(x.OrganizationId))).ToList();
                    List<Guid> listEmployeeInChargeByManagerId = new List<Guid>();

                    listEmployeeInChargeByManager.ForEach(item =>
                    {
                        if (item.EmployeeId != null && item.EmployeeId != Guid.Empty)
                            listEmployeeInChargeByManagerId.Add(item.EmployeeId.Value);
                    });

                    listEmployee = listEmployee.Where(x => listEmployeeInChargeByManagerId.Contains(x.EmployeeId.Value)).ToList();
                }
                else
                {
                    //Nếu không phải quản lý
                    listEmployee = listEmployee.Where(x => x.EmployeeId == employeeId).ToList();
                }


                #endregion

                #region Lấy danh sách Đơn vị

                var donViId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DVTS")?.CategoryTypeId;
                ListDonVi = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == donViId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh Tài sản chưa phân bổ
                var listTaiSanChuaPhanBo = new List<AssetEntityModel>();
                listTaiSanChuaPhanBo = context.TaiSan.Where(x => x.HienTrangTaiSan == 0).Select(y => new AssetEntityModel
                {
                    TaiSanId = y.TaiSanId,
                    MaTaiSan = y.MaTaiSan,
                    TenTaiSan = y.TenTaiSan,
                    TenTaiSanCode = y.MaTaiSan + " - " + y.TenTaiSan,
                    MaCode = y.MaCode,
                    PhanLoaiTaiSanId = y.PhanLoaiTaiSanId,
                }).OrderByDescending(z => z.CreatedDate).ThenByDescending(z => z.NgayVaoSo).ToList();

                #endregion

                return new GetMasterDataPhanBoTSFormResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    ListLoaiTSPB = listLoaiTS,
                    ListMucDichSuDung = listMucDichSuDung,
                    ListEmployee = listEmployee,
                    ListDonVi = ListDonVi,
                    ListTaiSanChuaPhanBo = listTaiSanChuaPhanBo
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataPhanBoTSFormResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }

        public CreateOrYeuCauCapPhatResult CreateOrYeuCauCapPhat(CreateOrYeuCauCapPhatParameter parameter)
        {

            var folder = context.Folder.FirstOrDefault(x => x.FolderType == parameter.FolderType);

            if (folder == null)
            {
                return new CreateOrYeuCauCapPhatResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Thư mục upload không tồn tại"
                };
            }

            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var user = context.User.FirstOrDefault(c => c.UserId == parameter.UserId);
                    if (user == null)
                    {
                        return new CreateOrYeuCauCapPhatResult
                        {
                            MessageCode = "Nhân viên không tồn tại trong hệ thống",
                            StatusCode = HttpStatusCode.ExpectationFailed,
                        };
                    }
                    var employee = context.Employee.FirstOrDefault(c => c.EmployeeId == user.EmployeeId);
                    if (employee == null)
                    {
                        return new CreateOrYeuCauCapPhatResult
                        {
                            MessageCode = "Nhân viên không tồn tại tong hệ thống",
                            StatusCode = HttpStatusCode.ExpectationFailed
                        };
                    }

                    // Tạo mới
                    if (parameter.YeuCauCapPhatTaiSan.YeuCauCapPhatTaiSanId == 0)
                    {
                        var yeuCauCapPhatTaiSan = new YeuCauCapPhatTaiSan
                        {
                            MaYeuCau = GenerateYeuCauCapPhatCode(),
                            NgayDeXuat = parameter.YeuCauCapPhatTaiSan.NgayDeXuat,
                            NguoiDeXuatId = parameter.YeuCauCapPhatTaiSan.NguoiDeXuatId,
                            TrangThai = 1,// 1 tạo mới
                            CreatedById = parameter.UserId,
                            CreatedDate = DateTime.Now,
                            UpdatedById = parameter.UserId,
                            UpdatedDate = DateTime.Now,
                            Active = true
                        };
                        context.YeuCauCapPhatTaiSan.Add(yeuCauCapPhatTaiSan);
                        context.SaveChanges();

                        if (parameter.ListFile?.Count > 0)
                        {
                            var isSave = true;
                            parameter.ListFile?.ForEach(item =>
                            {
                                if (folder == null)
                                {
                                    isSave = false;
                                }

                                var folderName = ConvertFolderUrl(folder.Url);
                                var webRootPath = hostingEnvironment.WebRootPath;
                                var newPath = Path.Combine(webRootPath, folderName);

                                if (!Directory.Exists(newPath))
                                {
                                    isSave = false;
                                }

                                if (isSave)
                                {
                                    var file = new FileInFolder()
                                    {
                                        Active = true,
                                        CreatedById = parameter.UserId,
                                        CreatedDate = DateTime.Now,
                                        UpdatedById = parameter.UserId,
                                        UpdatedDate = DateTime.Now,
                                        FileInFolderId = Guid.NewGuid(),
                                        FileName = $"{item.FileInFolder.FileName}_{Guid.NewGuid()}",
                                        FolderId = folder.FolderId,
                                        ObjectNumber = yeuCauCapPhatTaiSan.YeuCauCapPhatTaiSanId,
                                        ObjectType = item.FileInFolder.ObjectType,
                                        Size = item.FileInFolder.Size,
                                        FileExtension = item.FileSave.FileName.Substring(
                                            item.FileSave.FileName.LastIndexOf(".", StringComparison.Ordinal) + 1),
                                    };

                                    context.FileInFolder.Add(file);
                                }
                            });

                            if (!isSave)
                            {

                                return new CreateOrYeuCauCapPhatResult()
                                {
                                    StatusCode = HttpStatusCode.ExpectationFailed,
                                    MessageCode = "Bạn phải cấu hình thư mục để lưu"
                                };
                            }
                            context.SaveChanges();
                        }

                        #region Chi tiết tài sản yêu cầu
                        if (parameter.ListYeuCauCapPhatTaiSanChiTiet?.Count != 0)
                        {
                            var listYeuCauChiTiet = new List<YeuCauCapPhatTaiSanChiTiet>();
                            parameter.ListYeuCauCapPhatTaiSanChiTiet?.ForEach(item =>
                            {
                                var yeuCauChiTiet = new YeuCauCapPhatTaiSanChiTiet
                                {
                                    TaiSanId = item.TaiSanId,
                                    YeuCauCapPhatTaiSanId = yeuCauCapPhatTaiSan.YeuCauCapPhatTaiSanId,
                                    LoaiTaiSanId = item.LoaiTaiSanId,
                                    MoTa = item.MoTa == null ? "" : item.MoTa,
                                    SoLuong = item.SoLuong == null ? 0 : item.SoLuong.Value,
                                    SoLuongPheDuyet = item.SoLuongPheDuyet == null ? 0 : item.SoLuongPheDuyet.Value,
                                    NhanVienYeuCauId = item.NhanVienYeuCauId,
                                    MucDichSuDungId = item.MucDichSuDungId,
                                    NgayBatDau = item.NgayBatDau,
                                    NgayKetThuc = item.NgayKetThuc,
                                    LyDo = item.LyDo == null ? "" : item.LyDo,
                                    TrangThai = 1,
                                    CreatedById = parameter.UserId,
                                    CreatedDate = DateTime.Now,
                                    UpdatedById = parameter.UserId,
                                    UpdatedDate = DateTime.Now
                                };
                                listYeuCauChiTiet.Add(yeuCauChiTiet);
                            });

                            context.YeuCauCapPhatTaiSanChiTiet.AddRange(listYeuCauChiTiet);
                            context.SaveChanges();
                        };
                        #endregion

                        transaction.Commit();
                        return new CreateOrYeuCauCapPhatResult
                        {
                            MessageCode = "Success",
                            StatusCode = HttpStatusCode.OK,
                            YeuCauCapPhatTaiSanId = yeuCauCapPhatTaiSan.YeuCauCapPhatTaiSanId
                        };
                    }
                    // Cập nhật
                    else
                    {
                        var oldYeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(c => c.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSan.YeuCauCapPhatTaiSanId);
                        if (oldYeuCau == null)
                        {
                            return new CreateOrYeuCauCapPhatResult
                            {
                                MessageCode = "Yêu cầu cấp phát không tồn tại trong hệ thống",
                                StatusCode = HttpStatusCode.ExpectationFailed,
                            };
                        }

                        oldYeuCau.NgayDeXuat = parameter.YeuCauCapPhatTaiSan.NgayDeXuat;
                        oldYeuCau.UpdatedById = parameter.UserId;
                        oldYeuCau.UpdatedDate = DateTime.Now;

                        context.YeuCauCapPhatTaiSan.Update(oldYeuCau);
                        context.SaveChanges();

                        if (parameter.ListFile?.Count > 0)
                        {
                            var isSave = true;
                            parameter.ListFile?.ForEach(item =>
                            {
                                if (folder == null)
                                {
                                    isSave = false;
                                }

                                var folderName = ConvertFolderUrl(folder.Url);
                                var webRootPath = hostingEnvironment.WebRootPath;
                                var newPath = Path.Combine(webRootPath, folderName);

                                if (!Directory.Exists(newPath))
                                {
                                    isSave = false;
                                }

                                if (isSave)
                                {
                                    var file = new FileInFolder()
                                    {
                                        Active = true,
                                        CreatedById = parameter.UserId,
                                        CreatedDate = DateTime.Now,
                                        UpdatedById = parameter.UserId,
                                        UpdatedDate = DateTime.Now,
                                        FileInFolderId = Guid.NewGuid(),
                                        FileName = $"{item.FileInFolder.FileName}_{Guid.NewGuid()}",
                                        FolderId = folder.FolderId,
                                        ObjectNumber = oldYeuCau.YeuCauCapPhatTaiSanId,
                                        ObjectType = item.FileInFolder.ObjectType,
                                        Size = item.FileInFolder.Size,
                                        FileExtension = item.FileSave.FileName.Substring(
                                            item.FileSave.FileName.LastIndexOf(".", StringComparison.Ordinal) + 1),
                                    };

                                    context.FileInFolder.Add(file);
                                }
                            });

                            if (!isSave)
                            {
                                return new CreateOrYeuCauCapPhatResult()
                                {
                                    StatusCode = HttpStatusCode.ExpectationFailed,
                                    MessageCode = "Bạn phải cấu hình thư mục để lưu"
                                };
                            }
                            context.SaveChanges();
                        }

                        #region Chi tiết tài sản yêu cầu
                        if (parameter.ListYeuCauCapPhatTaiSanChiTiet?.Count != 0)
                        {
                            var lstIDChiTiet = parameter.ListYeuCauCapPhatTaiSanChiTiet.Select(x => x.YeuCauCapPhatTaiSanChiTietId).ToList();
                            var lstOldChiTiet = context.YeuCauCapPhatTaiSanChiTiet.Where(x => lstIDChiTiet.Contains(x.YeuCauCapPhatTaiSanChiTietId)).ToList();
                            lstOldChiTiet?.ForEach(chitiet =>
                            {
                                var soLuongPD = parameter.ListYeuCauCapPhatTaiSanChiTiet.FirstOrDefault(x => x.YeuCauCapPhatTaiSanChiTietId == chitiet.YeuCauCapPhatTaiSanChiTietId)?.SoLuongPheDuyet.Value;
                                chitiet.SoLuongPheDuyet = soLuongPD;
                            });

                            context.YeuCauCapPhatTaiSanChiTiet.UpdateRange(lstOldChiTiet);
                            context.SaveChanges();
                        };
                        #endregion
                    }
                    transaction.Commit();
                    return new CreateOrYeuCauCapPhatResult
                    {
                        MessageCode = "Success",
                        StatusCode = HttpStatusCode.OK
                    };
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return new CreateOrYeuCauCapPhatResult
                    {
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }
            }
        }

        private string GenerateYeuCauCapPhatCode()
        {
            var strCode = string.Empty;
            var date = DateTime.Now.ToString("yyyy");
            var countYeuCauCapPhat = context.YeuCauCapPhatTaiSan.Count() == 0 ? 0 : context.YeuCauCapPhatTaiSan.Max(x => x.YeuCauCapPhatTaiSanId);
            strCode = $"YC" + date + "-" + (countYeuCauCapPhat + 1);
            return strCode;
        }

        public GetAllYeuCauCapPhatTSListResult GetAllYeuCauCapPhatTSList(GetAllYeuCauCapPhatTSListParameter parameter)
        {
            var user = context.User.FirstOrDefault(c => c.UserId == parameter.UserId);
            if (user == null)
            {
                return new GetAllYeuCauCapPhatTSListResult
                {
                    Message = "Nhân viên không tồn tại trong hệ thống",
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
            var employee = context.Employee.FirstOrDefault(c => c.EmployeeId == user.EmployeeId);
            if (employee == null)
            {
                return new GetAllYeuCauCapPhatTSListResult
                {
                    Message = "Nhân viên không tồn tại trong hệ thống",
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }

            var listEmployee = new List<EmployeeEntityModel>();
            #region Lấy danh sách nhân viên
            listEmployee = context.Employee.Where(x => x.Active == true).Select(y =>
                       new EmployeeEntityModel
                       {
                           EmployeeId = y.EmployeeId,
                           EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                       }).ToList();
            #endregion

            var listYeuCauCP = new List<YeuCauCapPhatTaiSanEntityModel>();
            var listAllYeuCauCP = context.YeuCauCapPhatTaiSan.Where(x => x.Active == true).Select(y => new YeuCauCapPhatTaiSanEntityModel
            {
                YeuCauCapPhatTaiSanId = y.YeuCauCapPhatTaiSanId,
                MaYeuCau = y.MaYeuCau,
                NgayDeXuat = y.NgayDeXuat,
                TrangThai = y.TrangThai,
                NguoiDeXuatId = y.NguoiDeXuatId,
                CreatedDate = y.CreatedDate,
            }).OrderByDescending(z => z.CreatedDate).ToList();

            #region Phân quyền dữ liệu theo quy trình phê duyệt

            var thanhVienPhongBan =
                  context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == employee.EmployeeId);

            var isAccess = context.Organization.FirstOrDefault(x => x.OrganizationId == employee.OrganizationId)?.IsAccess;
            //Nếu k được xem dữ liệu phòng ban khác
            if (isAccess != true)
            {
                //Nếu là trưởng bộ phận (IsManager = 1)
                if (thanhVienPhongBan.IsManager == 1)
                {
                    //Lấy ra list đối tượng id mà người dùng phụ trách phê duyệt
                    var listId = context.PhongBanPheDuyetDoiTuong
                        .Where(x => x.DoiTuongApDung == 20 &&
                                    x.OrganizationId == thanhVienPhongBan.OrganizationId).Select(y => y.ObjectNumber)
                        .ToList();

                    var listEmpIdCungOrg = listEmployee.Where(x => x.OrganizationId == employee.OrganizationId).Select(x => x.EmployeeId).ToList();
                    listYeuCauCP = listAllYeuCauCP.Where(x =>
                         (parameter.MaYeuCau == null || parameter.MaYeuCau == "" || x.MaYeuCau.ToLower().Contains(parameter.MaYeuCau.ToLower())) &&
                         (parameter.ListEmployee == null || parameter.ListEmployee.Count() == 0 || parameter.ListEmployee.Contains(x.NguoiDeXuatId)) &&
                         (parameter.TrangThai == null || x.TrangThai == parameter.TrangThai) &&
                         (listId.Contains(x.YeuCauCapPhatTaiSanId) || //Cần phê duyệt
                            x.NguoiDeXuatId == employee.EmployeeId) || //Người đề xuất
                            (listEmpIdCungOrg.Contains(x.NguoiDeXuatId) && x.TrangThai != 1) //Cùng phòng ban và trạng thái kahsc mơis
                         ).ToList();
                }
                //Nếu là nhân viên thường (IsManager = 0)
                else
                {
                    listYeuCauCP = listAllYeuCauCP.Where(x =>
                        (parameter.MaYeuCau == null || parameter.MaYeuCau == "" || x.MaYeuCau.ToLower().Contains(parameter.MaYeuCau.ToLower())) &&
                        (parameter.ListEmployee == null || parameter.ListEmployee.Count() == 0 || parameter.ListEmployee.Contains(x.NguoiDeXuatId)) &&
                        (parameter.TrangThai == null || x.TrangThai == parameter.TrangThai) &&
                        x.NguoiDeXuatId == employee.EmployeeId).ToList();
                }
            }
            else
            {
                listYeuCauCP = listAllYeuCauCP.Where(x =>
                      (parameter.MaYeuCau == null || parameter.MaYeuCau == "" || x.MaYeuCau.ToLower().Contains(parameter.MaYeuCau.ToLower())) &&
                      (parameter.ListEmployee == null || parameter.ListEmployee.Count() == 0 || parameter.ListEmployee.Contains(x.NguoiDeXuatId)) &&
                      (parameter.TrangThai == null || x.TrangThai == parameter.TrangThai) &&
                       (x.NguoiDeXuatId == user.EmployeeId || // Theo người tạo
                     (x.NguoiDeXuatId != user.EmployeeId && x.TrangThai != 1))  // cùng phòng ban khác trạng thái mới
                     ).ToList();
            }
            #endregion


            if (listYeuCauCP.Count() > 0)
            {
                var lstYeuCauCPId = listYeuCauCP.Select(x => x.YeuCauCapPhatTaiSanId).ToList();
                var lstPhongBan = context.Organization.Where(x => x.Active == true).ToList();

                var lstYeuCauCapPhatChiTiet = context.YeuCauCapPhatTaiSanChiTiet.Where(x => lstYeuCauCPId.Contains(x.YeuCauCapPhatTaiSanId)).ToList();
                listYeuCauCP.ForEach(p =>
                {
                    switch (p.TrangThai)
                    {
                        case 1:
                            p.TrangThaiString = "Mới";
                            p.BackgroundColorForStatus = "#8ec3f4";
                            break;
                        case 2:
                            p.TrangThaiString = "Chờ phê duyệt";
                            p.BackgroundColorForStatus = "#f29505";
                            break;
                        case 3:
                            p.TrangThaiString = "Đã duyệt";
                            p.BackgroundColorForStatus = "#05f235";
                            break;
                        case 4:
                            p.TrangThaiString = "Từ chối";
                            p.BackgroundColorForStatus = "#797979";
                            break;
                        case 5:
                            p.TrangThaiString = "Hoàn thành";
                            p.BackgroundColorForStatus = "#50f296";
                            break;
                    }
                    var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == p.NguoiDeXuatId);
                    p.NguoiDeXuat = emp.EmployeeName;
                    p.PhongBan = lstPhongBan.FirstOrDefault(x => x.OrganizationId == emp.OrganizationId)?.OrganizationName;

                    p.SoLuong = lstYeuCauCapPhatChiTiet.Where(x => x.YeuCauCapPhatTaiSanId == p.YeuCauCapPhatTaiSanId).Sum(x => x.SoLuong);
                });
            }


            return new GetAllYeuCauCapPhatTSListResult()
            {
                StatusCode = HttpStatusCode.OK,
                Status = true,
                ListEmployee = listEmployee,
                ListYeuCauCapPhatTaiSan = listYeuCauCP
            };
        }
        public XoaYeuCauCapPhatResult XoaYeuCauCapPhat(XoaYeuCauCapPhatParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanId);

                    if (yeuCau != null)
                    {
                        // Xóa chi tiết
                        var lstChiTiet = context.YeuCauCapPhatTaiSanChiTiet.Where(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanId).ToList();
                        if (lstChiTiet != null)
                        {
                            lstChiTiet.ForEach(chitiet =>
                            {
                                chitiet.Active = false;
                            });
                            context.YeuCauCapPhatTaiSanChiTiet.UpdateRange(lstChiTiet);
                        }

                        yeuCau.Active = false;
                        context.YeuCauCapPhatTaiSan.Update(yeuCau);
                        context.SaveChanges();
                        transaction.Commit();
                    }
                    else
                    {
                        return new XoaYeuCauCapPhatResult
                        {
                            StatusCode = HttpStatusCode.FailedDependency,
                            MessageCode = "Không tồn tại yêu cầu cấp phát!"
                        };
                    }

                    return new XoaYeuCauCapPhatResult
                    {
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = "Xóa yêu cầu cấp phát thành công"
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new XoaYeuCauCapPhatResult
                    {
                        MessageCode = e.Message,
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    };
                }
            }
        }

        public GetDataYeuCauCapPhatDetailResult GetDataYeuCauCapPhatDetail(GetDataYeuCauCapPhatDetailParameter parameter)
        {
            try
            {
                int pageSize = 10;
                int pageIndex = 1;
                var listAllEmp = context.Employee.ToList();
                var yeuCauCapPhat = context.YeuCauCapPhatTaiSan.Where(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanId).Select(yeuCau => new YeuCauCapPhatTaiSanEntityModel
                {
                    YeuCauCapPhatTaiSanId = yeuCau.YeuCauCapPhatTaiSanId,
                    MaYeuCau = yeuCau.MaYeuCau,
                    NgayDeXuat = yeuCau.NgayDeXuat,
                    NguoiDeXuatId = yeuCau.NguoiDeXuatId,
                    TrangThai = yeuCau.TrangThai,
                    CreatedById = yeuCau.CreatedById
                }).FirstOrDefault();
                yeuCauCapPhat.NguoiDeXuat = listAllEmp.FirstOrDefault(x => x.EmployeeId == yeuCauCapPhat.NguoiDeXuatId)?.EmployeeName;

                if (yeuCauCapPhat == null)
                {
                    return new GetDataYeuCauCapPhatDetailResult()
                    {
                        Message = "Không tồn tại yêu cầu!",
                        StatusCode = HttpStatusCode.FailedDependency,
                        Status = false
                    };
                }
                var user = context.User.FirstOrDefault(c => c.UserId == parameter.UserId);
                var employee = listAllEmp.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                var listEmployee = new List<EmployeeEntityModel>();

                #region Common data
                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();
                #endregion

                #region Lấy danh sách nhân viên
                listEmployee = listAllEmp.Select(y =>
                           new EmployeeEntityModel
                           {
                               EmployeeId = y.EmployeeId,
                               OrganizationId = y.OrganizationId,
                               PositionId = y.PositionId,
                               EmployeeCode = y.EmployeeCode,
                               EmployeeName = y.EmployeeName,
                               EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                           }).ToList();

                var listPosition = context.Position.ToList();
                var listOrganization = context.Organization.ToList();

                listEmployee?.ForEach(item =>
                {
                    var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                    item.OrganizationName = phongBan?.OrganizationName;

                    var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                    item.PositionName = chucVu?.PositionName;
                });
                #endregion

                #region Lấy dách file đinh kèm 
                var webRootPath = hostingEnvironment.WebRootPath + "\\";

                var objectType = "YCCAPPHAT";
                var folderCommon = context.Folder.ToList();
                var folder = folderCommon.FirstOrDefault(x => x.FolderType == objectType);

                var listFileResult = context.FileInFolder
                                .Where(x => x.ObjectNumber == parameter.YeuCauCapPhatTaiSanId && x.FolderId == folder.FolderId).Select(y =>
                                    new FileInFolderEntityModel
                                    {
                                        Size = y.Size,
                                        ObjectId = y.ObjectId,
                                        Active = y.Active,
                                        FileExtension = y.FileExtension,
                                        FileInFolderId = y.FileInFolderId,
                                        FileName = y.FileName,
                                        FolderId = y.FolderId,
                                        ObjectType = y.ObjectType,
                                        ObjectNumber = y.ObjectNumber,
                                        CreatedById = y.CreatedById,
                                        CreatedDate = y.CreatedDate,
                                        UpdatedById = y.UpdatedById,
                                        UpdatedDate = y.UpdatedDate
                                    }).OrderBy(z => z.CreatedDate).ToList();

                listFileResult.ForEach(x =>
                {
                    x.UploadByName = context.User.FirstOrDefault(u => u.UserId == x.CreatedById)?.UserName;
                    x.FileFullName = $"{x.FileName}.{x.FileExtension}";
                    var folderUrlTL = context.Folder.FirstOrDefault(item => item.FolderId == x.FolderId)?.Url;
                    x.FileUrl = Path.Combine(webRootPath, folderUrlTL, x.FileFullName);
                });
                #endregion

                #region Lấy danh sách Mục đích sử dụng
                var listMucDichSuDung = new List<CategoryEntityModel>();
                var donViId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "MDSD")?.CategoryTypeId;
                listMucDichSuDung = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == donViId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Lấy danh sách Phân loại tài sản
                var listLoaiTS = new List<CategoryEntityModel>();
                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                listLoaiTS = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion

                #region Chi tiết Yêu cầu cấp phát
                var lstChiTiepCapPhat = context.YeuCauCapPhatTaiSanChiTiet.Where(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanId)
                    .Select(chitiet => new YeuCauCapPhatTaiSanChiTietEntityModel
                    {
                        YeuCauCapPhatTaiSanChiTietId = chitiet.YeuCauCapPhatTaiSanChiTietId,
                        YeuCauCapPhatTaiSanId = chitiet.YeuCauCapPhatTaiSanId,
                        LoaiTaiSanId = chitiet.LoaiTaiSanId,
                        MoTa = chitiet.MoTa,
                        NhanVienYeuCauId = chitiet.NhanVienYeuCauId,
                        MucDichSuDungId = chitiet.MucDichSuDungId,
                        NgayBatDau = chitiet.NgayBatDau,
                        NgayKetThuc = chitiet.NgayKetThuc,
                        LyDo = chitiet.LyDo,
                        SoLuong = chitiet.SoLuong,
                        SoLuongPheDuyet = chitiet.SoLuongPheDuyet,
                        CreatedDate = chitiet.CreatedDate,
                        CreatedById = chitiet.CreatedById
                    }).ToList();
                List<YeuCauCapPhatTaiSanChiTietEntityModel> lstChild = new List<YeuCauCapPhatTaiSanChiTietEntityModel>();
                lstChiTiepCapPhat.ForEach(ct =>
                {
                    var nhanvien = listEmployee.FirstOrDefault(x => x.EmployeeId == ct.NhanVienYeuCauId);
                    if (nhanvien != null)
                    {
                        ct.MaNV = nhanvien.EmployeeCode;
                        ct.TenNhanVien = nhanvien.EmployeeName;
                        ct.PhongBan = nhanvien?.OrganizationName;
                        ct.ViTriLamViec = nhanvien?.PositionName;
                        ct.LoaiTaiSan = listLoaiTS.FirstOrDefault(x => x.CategoryId == ct.LoaiTaiSanId)?.CategoryName;
                        ct.MucDichSuDung = listMucDichSuDung.FirstOrDefault(x => x.CategoryId == ct.MucDichSuDungId).CategoryName;
                    }
                    // Lấy các tài sản đã cấp phát thuộc chi tiết yêu cầu cấp phát
                    var lstTaiSan = context.CapPhatTaiSan.Where(x => x.YeuCauCapPhatTaiSanChiTietId == ct.YeuCauCapPhatTaiSanChiTietId).ToList();
                    if (lstTaiSan.Count() > 0)
                    {
                        var lstTaiSanDaCapPhat = (from capphat in lstTaiSan
                                                  join taisan in context.TaiSan.Where(x => lstTaiSan.Select(a => a.TaiSanId).Contains(x.TaiSanId)).ToList() on capphat.TaiSanId equals taisan.TaiSanId
                                                  into cu
                                                  from ts in cu.DefaultIfEmpty()
                                                  select new YeuCauCapPhatTaiSanChiTietEntityModel
                                                  {
                                                      YeuCauCapPhatTaiSanChiTietId = ct.YeuCauCapPhatTaiSanChiTietId,
                                                      CapPhatTaiSanId = capphat.CapPhatTaiSanId,
                                                      LoaiTaiSanId = ts.PhanLoaiTaiSanId == null ? Guid.Empty : ts.PhanLoaiTaiSanId.Value,
                                                      NhanVienYeuCauId = capphat.NguoiSuDungId,
                                                      MucDichSuDungId = capphat.MucDichSuDungId,
                                                      NgayBatDau = capphat.NgayBatDau,
                                                      NgayKetThuc = capphat.NgayKetThuc,
                                                      SoLuong = 0,
                                                      SoLuongPheDuyet = 0,
                                                      CreatedDate = capphat.CreatedDate,
                                                      CreatedById = capphat.CreatedById,
                                                      ParentPartId = ct.YeuCauCapPhatTaiSanChiTietId,
                                                      MaTaiSan = ts.MaTaiSan,
                                                      TaiSanId = ts.TaiSanId
                                                  }).OrderBy(x => x.TaiSanId).ToList();
                        ct.TotalChild = lstTaiSanDaCapPhat.Count();
                        lstChild.AddRange(lstTaiSanDaCapPhat);
                    }
                });

                lstChiTiepCapPhat.AddRange(lstChild);
                #endregion

                yeuCauCapPhat.NguoiDeXuat = listEmployee.FirstOrDefault(a => a.EmployeeId == yeuCauCapPhat.NguoiDeXuatId).EmployeeName;
                switch (yeuCauCapPhat.TrangThai)
                {
                    case 1:
                        yeuCauCapPhat.TrangThaiString = "Mới";
                        break;
                    case 2:
                        yeuCauCapPhat.TrangThaiString = "Chờ phê duyệt";
                        break;
                    case 3:
                        yeuCauCapPhat.TrangThaiString = "Đã duyệt";
                        break;
                    case 4:
                        yeuCauCapPhat.TrangThaiString = "Từ chối";
                        break;
                    case 5:
                        yeuCauCapPhat.TrangThaiString = "Hoàn thành";
                        break;
                }
                yeuCauCapPhat.ListYeuCauCapPhatTaiSanChiTiet = new List<YeuCauCapPhatTaiSanChiTietEntityModel>();
                yeuCauCapPhat.ListYeuCauCapPhatTaiSanChiTiet = lstChiTiepCapPhat;

                #region Điều kiện hiển thị các button

                bool isShowGuiPheDuyet = false;
                bool isShowPheDuyet = false;
                bool isShowTuChoi = false;
                bool isShowHuyYeuCauPheDuyet = false;
                bool isShowLuu = false;
                bool isShowXoa = false;
                bool isShowHuy = false;
                bool isShowPhanBo = false;
                bool isShowDatVeMoi = false;
                bool isShowHoanThanh = false;

                if (yeuCauCapPhat.YeuCauCapPhatTaiSanId != 0)
                {
                    #region Điều kiện hiển thị các button theo quy trình 

                    //Trạng thái Mới
                    if (yeuCauCapPhat.TrangThai == 1)
                    {
                        if (yeuCauCapPhat.CreatedById == user.UserId)
                        {
                            isShowGuiPheDuyet = true;
                            isShowXoa = true;
                        }
                        else if (yeuCauCapPhat.NguoiDeXuatId == employee.EmployeeId)
                        {
                            isShowGuiPheDuyet = true;
                            isShowXoa = true;
                        }
                        else
                        {
                            var phongBanNguoiDangNhap =
                                context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == employee.EmployeeId);

                            var empCreate = context.User.FirstOrDefault(x => x.UserId == yeuCauCapPhat.CreatedById);
                            var phongBanNguoiTao =
                                context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == empCreate.EmployeeId);

                            var phongBanNhanVienBanHang =
                                context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == yeuCauCapPhat.NguoiDeXuatId);

                            //Trưởng bộ phận
                            if (phongBanNguoiDangNhap?.IsManager == 1)
                            {
                                if (phongBanNguoiDangNhap?.OrganizationId == phongBanNguoiTao?.OrganizationId ||
                                    phongBanNguoiDangNhap?.OrganizationId == phongBanNhanVienBanHang?.OrganizationId)
                                {
                                    isShowGuiPheDuyet = true;
                                    isShowXoa = true;
                                }
                            }
                        }
                    }

                    // Trạng thái Chờ phê duyệt
                    if (yeuCauCapPhat.TrangThai == 2)
                    {
                        var buocHienTai = context.CacBuocApDung.Where(x => x.ObjectNumber == yeuCauCapPhat.YeuCauCapPhatTaiSanId &&
                                                                           x.DoiTuongApDung == 20 &&
                                                                           x.TrangThai == 0)
                            .OrderByDescending(z => z.Stt)
                            .FirstOrDefault();

                        //Nếu là phê duyệt trưởng bộ phận
                        if (buocHienTai?.LoaiPheDuyet == 1)
                        {
                            var listDonViId_NguoiPhuTrach = context.ThanhVienPhongBan
                                .Where(x => x.EmployeeId == yeuCauCapPhat.NguoiDeXuatId)
                                .Select(y => y.OrganizationId).ToList();

                            var countPheDuyet = context.ThanhVienPhongBan.Count(x =>
                                x.EmployeeId == employee.EmployeeId &&
                                x.IsManager == 1 &&
                                listDonViId_NguoiPhuTrach.Contains(
                                    x.OrganizationId));

                            if (countPheDuyet > 0)
                            {
                                isShowPheDuyet = true;
                                isShowTuChoi = true;
                            }
                        }
                        //Nếu là phòng ban phê duyệt
                        else if (buocHienTai?.LoaiPheDuyet == 2)
                        {
                            //Lấy list Phòng ban đã phê duyệt ở bước hiện tại
                            var listDonViIdDaPheDuyet = context.PhongBanApDung
                                .Where(x => x.CacBuocApDungId == buocHienTai.Id &&
                                            x.CacBuocQuyTrinhId == buocHienTai.CacBuocQuyTrinhId)
                                .Select(y => y.OrganizationId).ToList();

                            //Lấy list Phòng ban chưa phê duyệt ở bước hiện tại
                            var listDonViId = context.PhongBanTrongCacBuocQuyTrinh
                                .Where(x => x.CacBuocQuyTrinhId == buocHienTai.CacBuocQuyTrinhId &&
                                            !listDonViIdDaPheDuyet.Contains(x.OrganizationId))
                                .Select(y => y.OrganizationId).ToList();

                            var countPheDuyet = context.ThanhVienPhongBan.Count(x =>
                                x.EmployeeId == employee.EmployeeId &&
                                x.IsManager == 1 &&
                                listDonViId.Contains(
                                    x.OrganizationId));

                            if (countPheDuyet > 0)
                            {
                                isShowPheDuyet = true;
                                isShowTuChoi = true;
                            }
                        }
                    }

                    // Trạng thái Chờ phê duyệt
                    if (yeuCauCapPhat.TrangThai == 2 && user.UserId == yeuCauCapPhat.NguoiGuiXacNhanId)
                    {
                        var count =
                            context.CacBuocApDung.Count(x => x.ObjectNumber == yeuCauCapPhat.YeuCauCapPhatTaiSanId &&
                                                             x.DoiTuongApDung == 20 && x.TrangThai == 1);

                        if (count == 0)
                        {
                            isShowHuyYeuCauPheDuyet = true;
                        }
                    }

                    // Khác Từ chối phê duyệt
                    if (yeuCauCapPhat.TrangThai != 4)
                    {
                        if (yeuCauCapPhat.CreatedById == user.UserId)
                        {
                            isShowLuu = true;
                        }
                        else if (yeuCauCapPhat.NguoiDeXuatId == employee.EmployeeId)
                        {
                            isShowLuu = true;
                        }
                        else
                        {
                            var phongBanNguoiDangNhap =
                                context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == employee.EmployeeId);

                            var empCreate = context.User.FirstOrDefault(x => x.UserId == yeuCauCapPhat.CreatedById);
                            var phongBanNguoiTao =
                                context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == empCreate.EmployeeId);

                            var phongBanNhanVienBanHang =
                                context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == yeuCauCapPhat.NguoiDeXuatId);

                            //Trưởng bộ phận
                            if (phongBanNguoiDangNhap?.IsManager == 1)
                            {
                                if (phongBanNguoiDangNhap?.OrganizationId == phongBanNguoiTao?.OrganizationId ||
                                    phongBanNguoiDangNhap?.OrganizationId == phongBanNhanVienBanHang?.OrganizationId)
                                {
                                    isShowLuu = true;
                                }
                            }
                        }
                    }

                    // Đã duyệt
                    if (yeuCauCapPhat.TrangThai == 3)
                    {
                        var phongBanNguoiDangNhap =
                            context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == employee.EmployeeId);

                        var empCreate = context.User.FirstOrDefault(x => x.UserId == yeuCauCapPhat.CreatedById);
                        var phongBanNguoiTao =
                            context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == empCreate.EmployeeId);

                        var phongBanNhanVienBanHang =
                            context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == yeuCauCapPhat.NguoiDeXuatId);

                        //Trưởng bộ phận
                        if (phongBanNguoiDangNhap?.IsManager == 1)
                        {
                            if (phongBanNguoiDangNhap?.OrganizationId == phongBanNguoiTao?.OrganizationId ||
                                phongBanNguoiDangNhap?.OrganizationId == phongBanNhanVienBanHang?.OrganizationId)
                            {
                                isShowHuy = true;
                            }
                            var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.DoiTuongApDung == 20 && x.HoatDong);

                            var cauHinhQuyTrinh = context.CauHinhQuyTrinh.FirstOrDefault(x => x.QuyTrinhId == quyTrinh.Id);
                            var listIdCacBuocQuyTrinh = context.CacBuocQuyTrinh
                                .Where(x => x.CauHinhQuyTrinhId == cauHinhQuyTrinh.Id).Select(y => y.Id).ToList();
                            var listIdPhongBanTrongCacBuocQuyTrinh = context.PhongBanTrongCacBuocQuyTrinh
                                .Where(x => listIdCacBuocQuyTrinh.Contains(x.CacBuocQuyTrinhId)).Select(y => y.OrganizationId)
                                .ToList();

                            if (listIdPhongBanTrongCacBuocQuyTrinh.Contains(phongBanNguoiDangNhap.OrganizationId))
                            {
                                isShowHuy = true;
                            }
                        }
                    }

                    // Đã duyệt => Khi Yêu cầu cấp phát hoàn thành quy trình phê duyệt => Check xem ai có quyền phân bổ tài sản
                    if (yeuCauCapPhat.TrangThai == 3)
                    {
                        var phongBanNguoiDangNhap =
                            context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == employee.EmployeeId);

                        var empCreate = context.User.FirstOrDefault(x => x.UserId == yeuCauCapPhat.CreatedById);
                        var phongBanNguoiTao =
                            context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == empCreate.EmployeeId);

                        var phongBanNhanVienBanHang =
                            context.ThanhVienPhongBan.FirstOrDefault(x => x.EmployeeId == yeuCauCapPhat.NguoiDeXuatId);

                        //Trưởng bộ phận phòng ban người tạo hoặc Trưởng bộ phận phòng ban của nhân viên bán hàng
                        if (phongBanNguoiDangNhap?.IsManager == 1)
                        {
                            if (phongBanNguoiDangNhap?.OrganizationId == phongBanNguoiTao?.OrganizationId ||
                                phongBanNguoiDangNhap?.OrganizationId == phongBanNhanVienBanHang?.OrganizationId)
                            {
                                isShowPhanBo = true;
                            }
                        }
                    }

                    // Hoàn thành
                    if (yeuCauCapPhat.TrangThai == 5)
                    {
                        isShowHoanThanh = true;
                    }

                    #endregion
                }

                #endregion

                if (yeuCauCapPhat.TrangThai == 4) // Từ chối
                {
                    isShowDatVeMoi = true;
                }

                return new GetDataYeuCauCapPhatDetailResult()
                {
                    Status = true,
                    StatusCode = HttpStatusCode.OK,
                    YeuCauCapPhat = yeuCauCapPhat,
                    ListFileInFolder = listFileResult,
                    IsShowGuiPheDuyet = isShowGuiPheDuyet,
                    IsShowPheDuyet = isShowPheDuyet,
                    IsShowTuChoi = isShowTuChoi,
                    IsShowLuu = isShowLuu,
                    IsShowXoa = isShowXoa,
                    IsShowHuy = isShowHuy,
                    IsShowDatVeMoi = isShowDatVeMoi,
                    IsShowHuyYeuCauPheDuyet = isShowHuyYeuCauPheDuyet,
                    IsShowPhanBo = isShowPhanBo,
                    IsShowHoanThanh = isShowHoanThanh
                };

            }
            catch (Exception e)
            {
                return new GetDataYeuCauCapPhatDetailResult()
                {
                    Message = e.Message,
                    StatusCode = HttpStatusCode.Forbidden,
                    Status = false
                };
            }
        }
        public DeleteChiTietYeuCauCapPhatResult DeleteChiTietYeuCauCapPhat(DeleteChiTietYeuCauCapPhatParameter parameter)
        {
            try
            {
                var chiTiet = context.YeuCauCapPhatTaiSanChiTiet.FirstOrDefault(x => x.YeuCauCapPhatTaiSanChiTietId == parameter.YeuCauCapPhatTaiSanChiTietId);

                if (chiTiet != null)
                {
                    context.YeuCauCapPhatTaiSanChiTiet.Remove(chiTiet);
                    context.SaveChanges();
                }
                else
                {
                    return new DeleteChiTietYeuCauCapPhatResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = "Không tồn tại dữ liệu!"
                    };
                }

                return new DeleteChiTietYeuCauCapPhatResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa dữ liệu thành công"
                };
            }
            catch (Exception e)
            {
                return new DeleteChiTietYeuCauCapPhatResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public CreateOrUpdateChiTietYeuCauCapPhatResult CreateOrUpdateChiTietYeuCauCapPhat(CreateOrUpdateChiTietYeuCauCapPhatParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    // Tạo mới
                    if (parameter.YeuCauCapPhatTaiSanChiTiet.YeuCauCapPhatTaiSanChiTietId == 0)
                    {
                        var chiTiet = new YeuCauCapPhatTaiSanChiTiet
                        {
                            YeuCauCapPhatTaiSanId = parameter.YeuCauCapPhatTaiSanChiTiet.YeuCauCapPhatTaiSanId,
                            LoaiTaiSanId = parameter.YeuCauCapPhatTaiSanChiTiet.LoaiTaiSanId,
                            SoLuong = parameter.YeuCauCapPhatTaiSanChiTiet.SoLuong,
                            MoTa = parameter.YeuCauCapPhatTaiSanChiTiet.MoTa,
                            MucDichSuDungId = parameter.YeuCauCapPhatTaiSanChiTiet.MucDichSuDungId,
                            NhanVienYeuCauId = parameter.YeuCauCapPhatTaiSanChiTiet.NhanVienYeuCauId,
                            NgayBatDau = parameter.YeuCauCapPhatTaiSanChiTiet.NgayBatDau,
                            NgayKetThuc = parameter.YeuCauCapPhatTaiSanChiTiet.NgayKetThuc,
                            LyDo = parameter.YeuCauCapPhatTaiSanChiTiet.LyDo,
                            TrangThai = 1,//Mới
                            SoLuongPheDuyet = 0,
                            UpdatedById = parameter.UserId,
                            UpdatedDate = DateTime.Now,
                            CreatedById = parameter.UserId,
                            CreatedDate = DateTime.Now,
                        };
                        context.YeuCauCapPhatTaiSanChiTiet.Add(chiTiet);
                        context.SaveChanges();
                    }
                    else
                    {
                        var chiTiet = context.YeuCauCapPhatTaiSanChiTiet.FirstOrDefault(x => x.YeuCauCapPhatTaiSanChiTietId == parameter.YeuCauCapPhatTaiSanChiTiet.YeuCauCapPhatTaiSanChiTietId);

                        if (chiTiet == null)
                        {
                            return new CreateOrUpdateChiTietYeuCauCapPhatResult()
                            {
                                StatusCode = HttpStatusCode.ExpectationFailed,
                                MessageCode = "Không tồn tại dữ liệu"
                            };
                        }
                        chiTiet.LoaiTaiSanId = parameter.YeuCauCapPhatTaiSanChiTiet.LoaiTaiSanId;
                        chiTiet.SoLuong = parameter.YeuCauCapPhatTaiSanChiTiet.SoLuong;
                        chiTiet.MoTa = parameter.YeuCauCapPhatTaiSanChiTiet.MoTa;
                        chiTiet.MucDichSuDungId = parameter.YeuCauCapPhatTaiSanChiTiet.MucDichSuDungId;
                        chiTiet.NhanVienYeuCauId = parameter.YeuCauCapPhatTaiSanChiTiet.NhanVienYeuCauId;
                        chiTiet.NgayBatDau = parameter.YeuCauCapPhatTaiSanChiTiet.NgayBatDau;
                        chiTiet.NgayKetThuc = parameter.YeuCauCapPhatTaiSanChiTiet.NgayKetThuc;
                        chiTiet.LyDo = parameter.YeuCauCapPhatTaiSanChiTiet.LyDo;
                        chiTiet.TrangThai = 1;//Mới
                        chiTiet.SoLuongPheDuyet = 0;
                        chiTiet.UpdatedById = parameter.UserId;
                        chiTiet.UpdatedDate = DateTime.Now;

                        context.YeuCauCapPhatTaiSanChiTiet.Update(chiTiet);
                        context.SaveChanges();
                    }
                    transaction.Commit();

                    #region Common data
                    var listAllCategoryType = context.CategoryType.ToList();
                    var listAllCategory = context.Category.ToList();
                    #endregion

                    var listEmployee = new List<EmployeeEntityModel>();
                    #region Lấy danh sách nhân viên
                    listEmployee = context.Employee.Select(y =>
                               new EmployeeEntityModel
                               {
                                   EmployeeId = y.EmployeeId,
                                   OrganizationId = y.OrganizationId,
                                   PositionId = y.PositionId,
                                   EmployeeCode = y.EmployeeCode,
                                   EmployeeName = y.EmployeeName,
                                   EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                               }).ToList();

                    var listPosition = context.Position.ToList();
                    var listOrganization = context.Organization.ToList();

                    listEmployee?.ForEach(item =>
                    {
                        var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                        item.OrganizationName = phongBan?.OrganizationName;

                        var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                        item.PositionName = chucVu?.PositionName;
                    });
                    #endregion

                    #region Lấy danh sách Mục đích sử dụng
                    var listMucDichSuDung = new List<CategoryEntityModel>();
                    var donViId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "MDSD")?.CategoryTypeId;
                    listMucDichSuDung = listAllCategory
                        .Where(x => x.Active == true && x.CategoryTypeId == donViId)
                        .Select(y => new CategoryEntityModel()
                        {
                            CategoryId = y.CategoryId,
                            CategoryCode = y.CategoryCode,
                            CategoryName = y.CategoryName
                        }).ToList();

                    #endregion
                    #region Lấy danh sách Phân loại tài sản
                    var listLoaiTS = new List<CategoryEntityModel>();
                    var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                    listLoaiTS = listAllCategory
                        .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                        .Select(y => new CategoryEntityModel()
                        {
                            CategoryId = y.CategoryId,
                            CategoryCode = y.CategoryCode,
                            CategoryName = y.CategoryName
                        }).ToList();

                    #endregion

                    #region Chi tiết Yêu cầu cấp phát
                    var lstChiTiepCapPhat = context.YeuCauCapPhatTaiSanChiTiet.Where(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanChiTiet.YeuCauCapPhatTaiSanId)
                        .Select(chitiet => new YeuCauCapPhatTaiSanChiTietEntityModel
                        {
                            YeuCauCapPhatTaiSanChiTietId = chitiet.YeuCauCapPhatTaiSanChiTietId,
                            YeuCauCapPhatTaiSanId = chitiet.YeuCauCapPhatTaiSanId,
                            LoaiTaiSanId = chitiet.LoaiTaiSanId,
                            MoTa = chitiet.MoTa,
                            NhanVienYeuCauId = chitiet.NhanVienYeuCauId,
                            MucDichSuDungId = chitiet.MucDichSuDungId,
                            NgayBatDau = chitiet.NgayBatDau,
                            NgayKetThuc = chitiet.NgayKetThuc,
                            LyDo = chitiet.LyDo,
                            SoLuong = chitiet.SoLuong,
                            CreatedDate = chitiet.CreatedDate,
                            CreatedById = chitiet.CreatedById
                        }).ToList();

                    lstChiTiepCapPhat.ForEach(ct =>
                    {
                        var nhanvien = listEmployee.FirstOrDefault(x => x.EmployeeId == ct.NhanVienYeuCauId);
                        if (nhanvien != null)
                        {
                            ct.MaNV = nhanvien.EmployeeCode;
                            ct.TenNhanVien = nhanvien.EmployeeName;
                            ct.PhongBan = nhanvien?.OrganizationName;
                            ct.ViTriLamViec = nhanvien?.PositionName;
                            ct.LoaiTaiSan = listLoaiTS.FirstOrDefault(x => x.CategoryId == ct.LoaiTaiSanId)?.CategoryName;
                            ct.MucDichSuDung = listMucDichSuDung.FirstOrDefault(x => x.CategoryId == ct.MucDichSuDungId).CategoryName;
                        }
                    });
                    #endregion
                    return new CreateOrUpdateChiTietYeuCauCapPhatResult
                    {
                        MessageCode = "Success",
                        StatusCode = HttpStatusCode.OK,
                        ListTaiSanYeuCau = lstChiTiepCapPhat
                    };
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return new CreateOrUpdateChiTietYeuCauCapPhatResult
                    {
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }
            }
        }

        public DatVeMoiYeuCauCapPhatTSResult DatVeMoiYeuCauCapPhatTS(DatVeMoiYeuCauCapPhatTSParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanId && x.Active == true);
                    if (yeuCau == null)
                    {
                        return new DatVeMoiYeuCauCapPhatTSResult
                        {
                            StatusCode = HttpStatusCode.BadRequest,
                            Message = "Yêu cầu cấp phát không tồn tại trong hệ thống",
                        };
                    }
                    yeuCau.TrangThai = 1; // tt mới
                    context.YeuCauCapPhatTaiSan.Update(yeuCau);
                    context.SaveChanges();

                    var lstYeuCauCapPhat = context.YeuCauCapPhatTaiSanChiTiet.Where(x => x.YeuCauCapPhatTaiSanId == yeuCau.YeuCauCapPhatTaiSanId && x.Active == true).ToList();
                    lstYeuCauCapPhat.ForEach(item =>
                    {
                        item.TrangThai = 1; // tt mới
                        item.Active = true;
                    });
                    context.YeuCauCapPhatTaiSanChiTiet.UpdateRange(lstYeuCauCapPhat);
                    context.SaveChanges();

                    //Xóa các bước áp dụng của phê duyệt để làm mới
                    var listBuocPheDuyet = context.CacBuocApDung.Where(x => x.ObjectNumber == yeuCau.YeuCauCapPhatTaiSanId).ToList();
                    context.CacBuocApDung.RemoveRange(listBuocPheDuyet);
                    context.SaveChanges();
                    transaction.Commit();
                    return new DatVeMoiYeuCauCapPhatTSResult
                    {
                        StatusCode = HttpStatusCode.OK,
                        Message = "Đặt về mới yêu cầu cấp phát thành công",
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new DatVeMoiYeuCauCapPhatTSResult()
                    {
                        StatusCode = HttpStatusCode.Forbidden,
                        Message = e.Message
                    };
                }
            }
        }

        public CapNhapTrangThaiYeuCauCapPhatResult CapNhapTrangThaiYeuCauCapPhat(CapNhapTrangThaiYeuCauCapPhatParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.YeuCauCapPhatTaiSanId && x.Active == true);
                    if (yeuCau == null)
                    {
                        return new CapNhapTrangThaiYeuCauCapPhatResult
                        {
                            StatusCode = HttpStatusCode.BadRequest,
                            Message = "Yêu cầu cấp phát không tồn tại trong hệ thống",
                        };
                    }
                    yeuCau.TrangThai = parameter.Type; // 5: Trạng thái hoàn thành phê duyệt
                    context.YeuCauCapPhatTaiSan.Update(yeuCau);
                    context.SaveChanges();

                    transaction.Commit();
                    return new CapNhapTrangThaiYeuCauCapPhatResult
                    {
                        StatusCode = HttpStatusCode.OK,
                        Message = "Cập nhập thành công cấp phát tài sản",
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new CapNhapTrangThaiYeuCauCapPhatResult()
                    {
                        StatusCode = HttpStatusCode.Forbidden,
                        Message = e.Message
                    };
                }
            }
        }

        #endregion

        #region Báo cáo      
        public BaoCaoPhanBoResult BaoCaoPhanBo(BaoCaoPhanBoParameter parameter)
        {
            try
            {
                var listLoaiTSPB = new List<CategoryEntityModel>();

                #region Common data
                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();
                var listAllEmployee = context.Employee.Where(x => x.Active == true).ToList();
                var lstPosition = context.Position.ToList();
                var lstOrganization = context.Organization.ToList();
                #endregion

                #region Lấy danh sách Phân loại tài sản
                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                listLoaiTSPB = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();

                #endregion
                // Danh sách tài sản đang được sử dụng
                var lstTaiSan = context.TaiSan.Where(x => x.HienTrangTaiSan == 1).Select(x => new BaoCaoPhanBoEntityModel
                {
                    TaiSanId = x.TaiSanId,
                    MaTaiSan = x.MaTaiSan,
                    TenTaiSan = x.TenTaiSan,
                    PhanLoaiTaiSanId = x.PhanLoaiTaiSanId,
                    HienTrangTaiSan = x.HienTrangTaiSan.Value,
                    NgayVaoSo = x.NgayVaoSo,
                    MoTa = x.MoTa
                }).ToList();

                if (lstTaiSan.Count > 0)
                {
                    var lstTaiSanId = lstTaiSan.Select(a => a.TaiSanId).ToList();
                    var lstAllCapPhat = context.CapPhatTaiSan.Where(x => lstTaiSanId.Contains(x.TaiSanId)).ToList();
                    lstTaiSan?.ForEach(item =>
                    {
                        switch (item.HienTrangTaiSan)
                        {
                            case 1:
                                item.HienTrangTaiSanString = "Đang sử dụng";
                                item.BackgroundColorForStatus = "#0F62FE";
                                break;
                            case 0:
                                item.HienTrangTaiSanString = "Không sử dụng";
                                item.BackgroundColorForStatus = "#FFC000";
                                break;
                        }
                        item.PhanLoaiTaiSan = listLoaiTSPB.FirstOrDefault(x => x.CategoryId == item.PhanLoaiTaiSanId)?.CategoryName;

                        var capPhat = lstAllCapPhat.Where(x => x.TaiSanId == item.TaiSanId).OrderByDescending(x => x.CreatedDate).FirstOrDefault();

                        var emp = listAllEmployee.FirstOrDefault(x => x.EmployeeId == capPhat?.NguoiSuDungId);
                        if (emp != null)
                        {
                            item.MaNhanVien = listAllEmployee.FirstOrDefault(x => x.EmployeeId == capPhat.NguoiSuDungId).EmployeeCode;
                            item.TenNhanVien = listAllEmployee.FirstOrDefault(x => x.EmployeeId == capPhat.NguoiSuDungId).EmployeeName;
                            item.ViTriLamViec = lstPosition.FirstOrDefault(x => x.PositionId == emp.PositionId)?.PositionName;
                            item.PhongBan = lstOrganization.FirstOrDefault(x => x.OrganizationId == emp.OrganizationId)?.OrganizationName;
                            item.NguoiSuDungId = capPhat.NguoiSuDungId;
                            item.OrganizationId = emp.OrganizationId;
                        }

                    });
                }

                lstTaiSan = lstTaiSan.Where(x =>
                       (parameter.ListEmployeeId == null || parameter.ListEmployeeId.Count() == 0 || parameter.ListEmployeeId.Contains(x.NguoiSuDungId)) &&
                       (parameter.ListOrganizationId == null || parameter.ListOrganizationId.Count() == 0 || parameter.ListOrganizationId.Contains(x.OrganizationId)) &&
                       (parameter.ListPhanLoaiTaiSanId == null || parameter.ListPhanLoaiTaiSanId.Count() == 0 || parameter.ListPhanLoaiTaiSanId.Contains(x.PhanLoaiTaiSanId)) &&
                       (parameter.ListHienTrangTaiSan == null || parameter.ListHienTrangTaiSan.Count() == 0 || parameter.ListHienTrangTaiSan.Contains(x.HienTrangTaiSan))
                       ).OrderByDescending(x => x.TenTaiSan)
                       .ToList();

                return new BaoCaoPhanBoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    Status = true,
                    ListTaiSanPhanBo = lstTaiSan,
                };
            }
            catch (Exception e)
            {
                return new BaoCaoPhanBoResult()
                {
                    StatusCode = HttpStatusCode.Forbidden,
                    Message = e.Message
                };
            }
        }
        public BaoCaoKhauHaoResult BaoCaoKhauHao(BaoCaoKhauHaoParameter parameter)
        {
            try
            {
                #region Lấy danh sách khấu hao tài sản
                var listAllCategoryType = context.CategoryType.ToList();
                var listAllCategory = context.Category.ToList();
                var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
                var listPhanLoai = listAllCategory
                    .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                    .Select(y => new CategoryEntityModel()
                    {
                        CategoryId = y.CategoryId,
                        CategoryCode = y.CategoryCode,
                        CategoryName = y.CategoryName
                    }).ToList();
                #endregion
                var listAssetAll = (from ts in context.TaiSan
                                    join PhanLoai in listPhanLoai on ts.PhanLoaiTaiSanId equals PhanLoai.CategoryId
                                     into cu
                                    from x in cu.DefaultIfEmpty()
                                        //where
                                        //(parameter.ListEmployeeId == null || parameter.ListEmployeeId.Contains((Guid)e.EmployeeId)) &&
                                        // (parameter.ListOrganizationId == null || parameter.ListOrganizationId.Contains((Guid)e.OrganizationId)) &&
                                        //  (parameter.ListPhanLoaiTaiSanId == null || parameter.ListPhanLoaiTaiSanId.Contains((Guid)ts.PhanLoaiTaiSanId)) &&
                                        //  (parameter.ListHienTrangTaiSan == null || parameter.ListHienTrangTaiSan.Contains(ts.HienTrangTaiSan.Value))
                                    select new BaoCaoKhauHaoEntityModel
                                    {
                                        MaTaiSan = ts.MaTaiSan,
                                        TenTaiSan = ts.TenTaiSan,
                                        LoaiTaiSanStr = x.CategoryName,
                                        HienTrangTaiSanStr = ts.HienTrangTaiSan == 1 ? "Đang sử dụng" : "Không sử dụng",
                                        HienTrangTaiSan = (int)ts.HienTrangTaiSan,
                                        PhanLoaiTaiSanId = ts.PhanLoaiTaiSanId,
                                        PhuongPhapTinhKhauHao = (int)ts.PhuongPhapTinhKhauHao,
                                        NgayVaoSo = ts.NgayVaoSo,
                                        ThoiGianKhauHao = (int)ts.ThoiGianKhauHao,
                                        GiaTriNguyenGia = (decimal)ts.GiaTriNguyenGia,
                                        GiaTriTinhKhauHao = (decimal)ts.GiaTriTinhKhauHao,
                                        ThoiDiemBdtinhKhauHao = (DateTime)ts.ThoiDiemBdtinhKhauHao,
                                        //TiLeKhauHaoTheoThang =ts. ,
                                        //TiLeKhauHaoTheoNam = ,
                                        //GiaTriKhauHaoTheoThang = ,
                                        //GiaTriKhauHaoTheoNam = ,
                                        //ThoiGianKhauHaoDen = ,
                                        //GiaTriKhauHaoLuyKe = ,
                                        //GiaTriConLai = ,
                                    }).OrderBy(x => x.MaTaiSan).ToList();
                listAssetAll.ForEach(x =>
                {
                    if (x.ThoiGianKhauHao > 0 && x.ThoiDiemBdtinhKhauHao != null)
                    {
                        DateTime dt = (DateTime)x.ThoiDiemBdtinhKhauHao; //                            
                        dt.AddMonths(x.ThoiGianKhauHao);
                        x.ThoiDiemKTKhauHao = dt;
                    }

                    x.TiLeKhauHaoTheoThang = (100 / x.ThoiGianKhauHao);
                    //Giá trị khấu hao theo tháng = (Giá trị tính khấu hao* tỉ lệ khấu hao theo tháng)/100
                    x.GiaTriKhauHaoTheoThang = x.GiaTriTinhKhauHao * x.TiLeKhauHaoTheoThang / 100;

                    //Tỉ lệ khấu hao theo năm = (100 / (Thời gian khấu hao / 12))
                    x.TiLeKhauHaoTheoNam = 100 / x.ThoiGianKhauHao / 12;

                    //Giá trị khấu hao theo năm = (Giá trị tính khấu hao* tỉ lệ khấu hao theo năm)/100
                    x.GiaTriKhauHaoTheoNam = x.GiaTriTinhKhauHao * x.TiLeKhauHaoTheoNam / 100;
                    //Giá trị khấu hao lũy kế = Gía trị tính khấu hao  - [ giá trị khấu hao theo tháng * (tháng hiện tại - tháng bắt đầu tính khấu hao)]
                    x.GiaTriKhauHaoLuyKe = x.GiaTriTinhKhauHao - x.GiaTriKhauHaoTheoThang * (((DateTime)x.ThoiDiemBdtinhKhauHao - DateTime.Now).Days / 31);

                    //Giá trị còn lại = Giá trị tính khấu hao - Giá trị khấu hao lũy kế
                    x.GiaTriConLai = x.GiaTriTinhKhauHao - x.GiaTriKhauHaoLuyKe;
                });
                var listAsset = listAssetAll.Where(x =>
                  (parameter.ListPhanLoaiTaiSanId == null || parameter.ListPhanLoaiTaiSanId.Count() == 0 || parameter.ListPhanLoaiTaiSanId.Contains((Guid)x.PhanLoaiTaiSanId)) &&
                  (parameter.ListHienTrangTaiSan == null || parameter.ListHienTrangTaiSan.Count() == 0 || parameter.ListHienTrangTaiSan.Contains(x.HienTrangTaiSan)) &&
                  (parameter.ThoiGianKhauHaoDen == null || parameter.ThoiGianKhauHaoDen > x.ThoiDiemKTKhauHao)).ToList();
                var companyConfigEntity = context.CompanyConfiguration.FirstOrDefault();
                var companyConfig = new CompanyConfigEntityModel();
                companyConfig.CompanyId = companyConfigEntity.CompanyId;
                companyConfig.CompanyName = companyConfigEntity.CompanyName;
                companyConfig.Email = companyConfigEntity.Email;
                companyConfig.Phone = companyConfigEntity.Phone;
                companyConfig.TaxCode = companyConfigEntity.TaxCode;
                companyConfig.CompanyAddress = companyConfigEntity.CompanyAddress;
                companyConfig.CompanyAddress = companyConfigEntity.CompanyAddress;

                return new BaoCaoKhauHaoResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    Status = true,
                    ListAsset = listAsset,
                    CompanyConfig = companyConfig,
                    ListPhanLoaiTaiSan = listPhanLoai

                };
            }
            catch (Exception e)
            {
                return new BaoCaoKhauHaoResult()
                {
                    StatusCode = HttpStatusCode.Forbidden,
                    Message = e.Message
                };
            }
        }

        public BaoCaoPhanBoResult GetMasterDataBaoCaoPhanBo(BaoCaoPhanBoParameter parameter)
        {
            var listLoaiTSPB = new List<CategoryEntityModel>();
            var listEmployee = new List<EmployeeEntityModel>();
            var listOrganization = new List<OrganizationEntityModel>();
            #region Common data
            var listAllCategoryType = context.CategoryType.ToList();
            var listAllCategory = context.Category.ToList();
            #endregion

            #region Lấy danh sách Phân loại tài sản
            var phanLoaiTSId = listAllCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PLTS")?.CategoryTypeId;
            listLoaiTSPB = listAllCategory
                .Where(x => x.Active == true && x.CategoryTypeId == phanLoaiTSId)
                .Select(y => new CategoryEntityModel()
                {
                    CategoryId = y.CategoryId,
                    CategoryCode = y.CategoryCode,
                    CategoryName = y.CategoryName
                }).ToList();

            #endregion

            #region Danh sách phòng ban
            listOrganization = context.Organization.Where(x => x.Active == true).Select(y => new OrganizationEntityModel
            {
                OrganizationName = y.OrganizationName,
                OrganizationId = y.OrganizationId
            }).ToList();
            #endregion

            #region Lấy danh sách nhân viên
            listEmployee = context.Employee.Where(x => x.Active == true).Select(y =>
                       new EmployeeEntityModel
                       {
                           EmployeeId = y.EmployeeId,
                           EmployeeCode = y.EmployeeCode,
                           EmployeeName = y.EmployeeName,
                           EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName,
                           OrganizationId = y.OrganizationId,
                           PositionId = y.PositionId
                       }).ToList();

            var listPosition = context.Position.ToList();

            listEmployee?.ForEach(item =>
            {
                var phongBan = listOrganization.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                item.OrganizationName = phongBan?.OrganizationName;

                var chucVu = listPosition.FirstOrDefault(x => x.PositionId == item.PositionId);
                item.PositionName = chucVu?.PositionName;
            });
            #endregion

            var companyConfigEntity = context.CompanyConfiguration.FirstOrDefault();
            var companyConfig = new CompanyConfigEntityModel();
            companyConfig.CompanyId = companyConfigEntity.CompanyId;
            companyConfig.CompanyName = companyConfigEntity.CompanyName;
            companyConfig.Email = companyConfigEntity.Email;
            companyConfig.Phone = companyConfigEntity.Phone;
            companyConfig.TaxCode = companyConfigEntity.TaxCode;
            companyConfig.CompanyAddress = companyConfigEntity.CompanyAddress;
            companyConfig.CompanyAddress = companyConfigEntity.CompanyAddress;
            return new BaoCaoPhanBoResult()
            {
                StatusCode = HttpStatusCode.OK,
                Status = true,
                CompanyConfig = companyConfig,
                ListPhanLoaiTaiSan = listLoaiTSPB,
                ListOrganization = listOrganization,
                ListEmployee = listEmployee
            };
        }


        #endregion

        public ImportAssetResult ImportAsset(ImportAssetParameter parameter)
        {
            using (var trans = context.Database.BeginTransaction())
            {
                try
                {
                    var listAllEmp = context.Employee.ToList();
                    var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                    var listAllTaiSan = context.TaiSan.ToList();
                    var listFail = new List<TaiSan>();
                    var listFailEmpCode = new List<String>();
                    parameter.ListTaiSan.ForEach(item =>
                    {
                        var listAssetCode = listAllTaiSan.Where(a => a.TaiSanId != item.TaiSanId).Select(x => x.MaTaiSan).ToList();
                        var duplicateCode = false;
                        if (listAssetCode.Count > 0)
                        {
                            listAssetCode.ForEach(x =>
                            {
                                if (x.Equals(item.MaTaiSan))
                                {
                                    duplicateCode = true;
                                }
                            });
                        }
                        if (duplicateCode)
                        {
                            listFail.Add(item);
                        }
                        item.CreatedById = parameter.UserId;
                        item.CreatedDate = DateTime.Now;
                        item.UpdatedById = parameter.UserId;
                        item.UpdatedDate = DateTime.Now;
                        context.TaiSan.Add(item);
                        context.SaveChanges();

                        var emp = listAllEmp.FirstOrDefault(x => x.EmployeeCode.ToUpper().Trim() == item.TenTaiSan.ToUpper().Trim());
                        if (emp != null)
                        {
                            CapPhatTaiSan capPhat = new CapPhatTaiSan();
                            capPhat.TaiSanId = item.TaiSanId;
                            capPhat.NguoiSuDungId = emp.EmployeeId;
                            capPhat.NguoiCapPhatId = user.EmployeeId.Value;

                            capPhat.MucDichSuDungId = Guid.Empty;
                            capPhat.NgayBatDau = DateTime.Now;
                            capPhat.NgayKetThuc = null;
                            capPhat.LyDo = "";
                            capPhat.LoaiCapPhat = 1; // cấp phát - 0 là thu hồi
                            capPhat.TrangThai = true;

                            capPhat.YeuCauCapPhatTaiSanChiTietId = null;

                            capPhat.CreatedById = parameter.UserId;
                            capPhat.CreatedDate = DateTime.Now;
                            capPhat.UpdatedById = parameter.UserId;
                            capPhat.UpdatedDate = DateTime.Now;
                            context.CapPhatTaiSan.Add(capPhat);
                        }
                        else if (emp == null)
                        {
                            listFailEmpCode.Add(item.TenTaiSan);
                        }
                    });

                    if (listFailEmpCode.Count > 0)
                    {
                        trans.Rollback();
                        return new ImportAssetResult()
                        {
                            Status = true,
                            ListFailEmpCode = listFailEmpCode,
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            Message = "Danh sách tài sản nhập lỗi do không tìm thấy mã nhân viên!",
                        };
                    }

                    if (listFail.Count > 0)
                    {
                        trans.Rollback();
                        return new ImportAssetResult()
                        {
                            Status = true,
                            ListFail = listFail,
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            Message = "Danh sách tài sản nhập lỗi do trùng mã tài sản!",
                        };
                    }
                    context.SaveChanges();
                    trans.Commit();

                    return new ImportAssetResult()
                    {
                        Status = true,
                        StatusCode = HttpStatusCode.OK,
                        Message = "Nhập danh sách tài sản thành công!",
                    };
                }
                catch (Exception e)
                {
                    trans.Rollback();
                    return new ImportAssetResult()
                    {
                        Message = e.Message,
                        StatusCode = HttpStatusCode.Forbidden,
                        Status = false,
                    };
                }
            }
        }
        private List<Guid?> getOrganizationChildrenId(Guid? id, List<Guid?> list)
        {
            var Organization = context.Organization.Where(o => o.ParentId == id).ToList();
            Organization.ForEach(item =>
            {
                list.Add(item.OrganizationId);
                getOrganizationChildrenId(item.OrganizationId, list);
            });

            return list;
        }


        public DownloadTemplateImportResult DownloadTemplateImportAsset(DownloadTemplateImportParameter parameter)
        {
            try
            {
                string rootFolder = hostingEnvironment.WebRootPath + "\\ExcelTemplate";
                string fileName = @"Template_Import_Nhap_tai_san.xlsx";

                string newFilePath = Path.Combine(rootFolder, fileName);
                byte[] data = File.ReadAllBytes(newFilePath);

                return new DownloadTemplateImportResult
                {
                    TemplateExcel = data,
                    Message = string.Format("Đã dowload file Template_Import_Nhap_tai_san"),
                    FileName = "Template_Import_Nhap_tai_san",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new DownloadTemplateImportResult
                {
                    Message = "Đã có lỗi xảy ra trong quá trình download",
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }


        public DotKiemKeSearchResult DotKiemKeSearch(DotKiemKeSearchParameter parameter)
        {
            try
            {
                var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
                var listWarehouse = context.Warehouse.ToList();
                var listAllChiTietDotKiemKe = context.DotKiemKeChiTiet.ToList();
                var listDotKiemKe = context.DotKiemKe
                    .Select(x => new DotKiemKeEntityModel
                    {
                        DotKiemKeId = x.DotKiemKeId,
                        WarehouseId = x.WarehouseId,
                        WarehouseName = listWarehouse.FirstOrDefault(y => y.WarehouseId == x.WarehouseId).WarehouseName,
                        TenDotKiemKe = "Tháng " + x.ThangKiemKe.Value.Month + "/" + x.ThangKiemKe.Value.Year,
                        TenTrangThai = listTrangThaiKiemKe.FirstOrDefault(y => y.Value == x.TrangThaiId).Name,
                        ThangKiemKe = x.ThangKiemKe.Value,
                    }).ToList();

                var listDotKiemKeGroup = new List<DotKiemKeEntityModel>();

                var groupedCustomerList = listDotKiemKe
                    .GroupBy(u => u.ThangKiemKe.Month)
                    .Select(grp => grp.ToList().OrderByDescending(x=>x.ThangKiemKe))
                    .ToList();

                groupedCustomerList.ForEach(item =>
                {
                    var data = new DotKiemKeEntityModel()
                    {
                        DotKiemKeId = 0,
                        TenDotKiemKe = item.FirstOrDefault().TenDotKiemKe,
                        ListDotKiemKeChild = new List<DotKiemKeEntityModel>()
                    };
                    
                    item.ToList().ForEach(child =>
                    {
                        var childItem = new DotKiemKeEntityModel()
                        {
                            DotKiemKeId = child.DotKiemKeId,
                            WarehouseId = child.WarehouseId,
                            TenDotKiemKe = child.WarehouseName,
                            TenTrangThai = child.TenTrangThai,
                        };
                        data.ListDotKiemKeChild.Add(childItem);
                    });

                    listDotKiemKeGroup.Add(data);
                });



                return new DotKiemKeSearchResult
                {
                    ListDotKiemKe = listDotKiemKeGroup,
                    Message = "",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new DotKiemKeSearchResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public TaoDotKiemKeResult TaoDotKiemKe(TaoDotKiemKeParameter parameter)
        {
            try
            {
                var ngayHienTai = DateTime.Now.Date;
                var listTrangThaiKiemKe = GeneralList.GetTrangThais("DotKiemKe").ToList();
                var message = "";

                var existsCode = context.DotKiemKe.FirstOrDefault(x => x.ThangKiemKe == parameter.ThangKiemKe && x.WarehouseId == parameter.WarehouseId);
                if (existsCode != null)
                {
                    return new TaoDotKiemKeResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Đợt kiểm kê đã tồn tại"
                    };
                }

                if (parameter.DotKiemKeId == null)
                {
                    message = "Tạo mới đợt kiểm kê thành công!";
                    var newDotKiemKe = new DotKiemKe();
                    newDotKiemKe.TenDotKiemKe = "Tháng " + parameter.ThangKiemKe.Month + "/" + parameter.ThangKiemKe.Year;
                    newDotKiemKe.ThangKiemKe = parameter.ThangKiemKe;
                    newDotKiemKe.WarehouseId = parameter.WarehouseId;
                    newDotKiemKe.CreatedById = parameter.UserId;
                    newDotKiemKe.CreatedDate = DateTime.Now;
                    newDotKiemKe.TrangThaiId = listTrangThaiKiemKe.FirstOrDefault(x => x.Value == 1).Value; //đang thực hiện
                    context.DotKiemKe.Add(newDotKiemKe);
                    context.SaveChanges();
                }
               
                return new TaoDotKiemKeResult
                {
                    Message = message,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new TaoDotKiemKeResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public DeleteDotKiemKeResult DeleteDotKiemKe(DeleteDotKiemKeParameter parameter)
        {
            try
            {
                var dotKiemKe = context.DotKiemKe.FirstOrDefault(x => x.DotKiemKeId == parameter.DotKiemKeId);
                if (dotKiemKe == null)
                {
                    return new DeleteDotKiemKeResult
                    {
                        Message = "Đợt kiểm kê không tồn tại trên hệ thống!",
                        StatusCode = HttpStatusCode.OK
                    };
                }

                context.DotKiemKe.Remove(dotKiemKe);
                context.SaveChanges();
                return new DeleteDotKiemKeResult
                {
                    Message = "Xóa đợt kiểm kê thành công!",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new DeleteDotKiemKeResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public DotKiemKeDetailResult DotKiemKeDetail(DotKiemKeDetailParameter parameter)
        {
            try
            {
                var category = context.Category.ToList();
                var listWarehouse = context.Warehouse.ToList();
                var listOrganization = context.Organization.ToList();
               var dotKiemKe = context.DotKiemKe.Where(x => x.DotKiemKeId == parameter.DotKiemKeId).Select(item =>
                    new DotKiemKeEntityModel()
                    {
                        DotKiemKeId = item.DotKiemKeId,
                        TenDotKiemKe = "Tháng " + item.ThangKiemKe.Value.Month + "/" + item.ThangKiemKe.Value.Year,
                        WarehouseName = listWarehouse.FirstOrDefault(y => y.WarehouseId == item.WarehouseId).WarehouseName,
                        TrangThaiId = item.TrangThaiId,
                        CreatedById = item.CreatedById,
                        WarehouseId = item.WarehouseId,
                        ThangKiemKe = item.ThangKiemKe.Value
                    }).FirstOrDefault();

                if (dotKiemKe == null)
                {
                    return new DotKiemKeDetailResult
                    {
                        Message = "Đợt kiểm kê không tồn tại trên hệ thống!",
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }

                var listDotKiemKeChiTiet = context.DotKiemKeChiTiet.Where(x => x.DotKiemKeId == parameter.DotKiemKeId).Select(x => new DotKiemKeChiTietEntityModel
                {
                    DotKiemKeChiTietId = x.DotKiemKeChiTietId,
                    DotKiemKeId = x.DotKiemKeId,
                    ProductId = x.ProductId,
                    ProductCode = x.ProductCode,
                    ProductName = context.Product.FirstOrDefault(p=>p.ProductId == x.ProductId).ProductName,
                    ProductUnit = x.ProductUnit,
                    ProductUnitName = category.FirstOrDefault(y => y.CategoryId == x.ProductUnit).CategoryName,
                    TenLoaihang = category.FirstOrDefault(y => y.CategoryId == x.Loaihang).CategoryName,
                    Tondauky = x.Tondauky,
                    Toncuoiky = x.Toncuoiky,
                    Nhapkho = x.Nhapkho,
                    Xuatkho = x.Xuatkho,
                    Checkkiemtra = x.Checkkiemtra,
                    Ckecknhapga = x.Ckecknhapga,
                    Checktra = x.Checktra,
                    Checkpending = x.Checkpending,
                    CheckTncc = x.CheckTncc,
                    Note = x.Note,
                    ListDotKiemKeChiTietChildEntityModel = context.DotKiemKeChiTietChild.Where(y => y.DotKiemKeChiTietId == x.DotKiemKeChiTietId)
                    .Select(item => new DotKiemKeChiTietChildEntityModel()
                    {
                        DotKiemKeChiTietId = item.DotKiemKeChiTietId,
                        OrganizationId = item.OrganizationId,
                        OrganizationCode = listOrganization.FirstOrDefault(y => y.OrganizationId == item.OrganizationId).OrganizationCode,
                        SoLuong = item.SoLuong 
                    }).ToList(),

                }).ToList();

                //Xoa data dot kiem ke
                if (parameter.RefreshData == true)
                {
                    var listOldItemDetail = context.DotKiemKeChiTiet.Where(x => x.DotKiemKeId == parameter.DotKiemKeId).ToList();
                    var listOldItemDetailId = listOldItemDetail.Select(x => x.DotKiemKeChiTietId).ToList();
                    var listOldItemDetailChild = context.DotKiemKeChiTietChild.Where(x => listOldItemDetailId.Contains(x.DotKiemKeChiTietId)).ToList();
                    context.DotKiemKeChiTietChild.RemoveRange(listOldItemDetailChild);
                    context.DotKiemKeChiTiet.RemoveRange(listOldItemDetail);
                    context.SaveChanges();

                    listDotKiemKeChiTiet = new List<DotKiemKeChiTietEntityModel>();
                }

                List<Guid?> listOrganizationId = new List<Guid?>();
                if (listDotKiemKeChiTiet.Count == 0 || dotKiemKe.TrangThaiId != 2)
                {
                    listDotKiemKeChiTiet = new List<DotKiemKeChiTietEntityModel>();

                    var warehouse = context.Warehouse.FirstOrDefault(x => x.WarehouseId == dotKiemKe.WarehouseId);
                    var categories = context.Category.Where(ct => ct.Active == true).ToList();
                    var warehouseType = categories.FirstOrDefault(x => x.CategoryId == warehouse.WareHouseType).CategoryCode; // lấy loại kho 
                    var lotno = context.LotNo.ToList();
                    var inventory = context.InventoryReport.ToList();
                    var listProduct = new List<Entities.Product>();
                    if (warehouseType == ProductType.NVL.ToString())
                        listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.NVL && x.Active == true).ToList();
                    else
                        listProduct = context.Product.Where(x => x.ProductType == (int)ProductType.CCDC && x.Active == true).ToList();

                    var firstDayOfMonth = new DateTime(dotKiemKe.ThangKiemKe.Year, dotKiemKe.ThangKiemKe.Month, 1);
                    var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

                    // Trạng thái phiếu xuất kho
                    var statusTypeXuatKhoId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX").CategoryTypeId;
                    var daXuatKhoStatusId = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHK" && ct.CategoryTypeId == statusTypeXuatKhoId)?.CategoryId; // Id trạng thái đã xuất kho

                  
                    var listAllInventoryDeliveryVoucher = context.InventoryDeliveryVoucher
                        .Where(x => x.StatusId == daXuatKhoStatusId && x.InventoryDeliveryVoucherScreenType == (int)ScreenType.NVL && x.InventoryDeliveryVoucherDate >= firstDayOfMonth && x.InventoryDeliveryVoucherDate <= lastDayOfMonth).ToList();
                    var listPhieuXuatKhoId = listAllInventoryDeliveryVoucher.Select(m => m.InventoryDeliveryVoucherId).ToList();
                    var listAllInventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(c => listPhieuXuatKhoId.Contains(c.InventoryDeliveryVoucherId)).ToList();

                    listAllInventoryDeliveryVoucher.ForEach(delivery =>
                    {
                        var organizationId = listWarehouse.FirstOrDefault(x => x.WarehouseId == delivery.WarehouseReceivingId)?.Department; // lay bo phan kho
                        if (!listOrganizationId.Contains(organizationId) && organizationId != null && organizationId != Guid.Empty)
                        {
                            listOrganizationId.Add(organizationId);
                        }
                    });

                    listProduct.ForEach(item =>
                    {
                        var tonDauKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate < firstDayOfMonth).OrderByDescending(x=>x.InventoryReportDate).FirstOrDefault()?.StartQuantity ?? 0;
                        var tongnhapkho = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate >= firstDayOfMonth && x.InventoryReportDate <= lastDayOfMonth)?
                            .Sum(x => x.QuantityReceiving) ?? 0;
                        var tongxuatkho = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate >= firstDayOfMonth && x.InventoryReportDate <= lastDayOfMonth)?
                             .Sum(x => x.QuantityDelivery) ?? 0;

                        var itemTonCuoiKy = inventory.Where(x => x.ProductId == item.ProductId && x.WarehouseId == parameter.WarehouseId && x.InventoryReportDate <= lastDayOfMonth).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                        var dotKiemKeChiTiet = new DotKiemKeChiTietEntityModel();

                        dotKiemKeChiTiet.DotKiemKeId = dotKiemKe.DotKiemKeId;
                        dotKiemKeChiTiet.ProductId = item.ProductId;
                        dotKiemKeChiTiet.ProductCode = item.ProductCode;
                        dotKiemKeChiTiet.ProductName = item.ProductName;
                        dotKiemKeChiTiet.ProductUnit = item.ProductUnitId;
                        dotKiemKeChiTiet.ProductUnitName = categories.FirstOrDefault(c => c.CategoryId == item.ProductUnitId).CategoryName;
                        dotKiemKeChiTiet.Loaihang = item.ProductCategoryId;
                        dotKiemKeChiTiet.TenLoaihang = categories.FirstOrDefault(c => c.CategoryId == item.ProductCategoryId)?.CategoryName;
                        dotKiemKeChiTiet.Tondauky = tonDauKy;
                        dotKiemKeChiTiet.Toncuoiky = tonDauKy + tongnhapkho - tongxuatkho;
                        dotKiemKeChiTiet.Nhapkho = tongnhapkho;
                        dotKiemKeChiTiet.Xuatkho = tongxuatkho;
                        

                        var listChild = new List<DotKiemKeChiTietChildEntityModel>();
                        listAllInventoryDeliveryVoucher.Where(x=>x.WarehouseReceivingId != Guid.Empty && x.WarehouseReceivingId != null).ToList().ForEach(delivery =>
                        {
                            var organizationId = listWarehouse.FirstOrDefault(x => x.WarehouseId == delivery.WarehouseReceivingId)?.Department; // lay bo phan kho

                            if (organizationId != Guid.Empty)
                            {
                                var newChild = listChild.FirstOrDefault(x => x.OrganizationId == organizationId);
                                if (newChild != null)
                                {
                                    newChild.SoLuong += listAllInventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == delivery.InventoryDeliveryVoucherId && x.ProductId == item.ProductId).Sum(x => x.QuantityDelivery);
                                }
                                else
                                {
                                    newChild = new DotKiemKeChiTietChildEntityModel();
                                    newChild.OrganizationId = listOrganization.FirstOrDefault(x => x.OrganizationId == organizationId)?.OrganizationId ?? Guid.Empty;
                                    newChild.OrganizationCode = listOrganization.FirstOrDefault(x => x.OrganizationId == organizationId)?.OrganizationCode;
                                    newChild.SoLuong = listAllInventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == delivery.InventoryDeliveryVoucherId && x.ProductId == item.ProductId).Sum(x => x.QuantityDelivery);

                                    listChild.Add(newChild);
                                }
                            }
                        });

                        dotKiemKeChiTiet.ListDotKiemKeChiTietChildEntityModel = listChild;
                        listDotKiemKeChiTiet.Add(dotKiemKeChiTiet);
                    });
                }
                else
                {
                    listDotKiemKeChiTiet.ForEach(item =>
                    {
                        if(item.ListDotKiemKeChiTietChildEntityModel != null)
                        {
                            item.ListDotKiemKeChiTietChildEntityModel.ForEach(data =>
                            {
                                var isExitOrg = listOrganizationId.Where(c => c == data.OrganizationId).ToList();
                                if(isExitOrg.Count == 0)
                                {
                                    listOrganizationId.Add(data.OrganizationId);
                                }
                            });
                        }
                    });
                }

                var listDataHeader = new List<List<DataHeaderModel>>();
                var listHeader = new List<DataHeaderModel>()
                    {
                        new DataHeaderModel(){ColumnKey = "indexNo_0", ColumnValue = "No",Rowspan = 2, Colspan = 0, Width = "20px"},
                        new DataHeaderModel(){ColumnKey = "index_1", ColumnValue = "Mã vật tư",Rowspan = 2, Colspan = 0, Width = "40px"},
                        new DataHeaderModel(){ColumnKey = "index_2", ColumnValue = "Tên NVL, CCDC",Rowspan = 2, Colspan = 0, Width = "60px"},
                        new DataHeaderModel(){ColumnKey = "index_3", ColumnValue = "Đơn vị",Rowspan = 2, Colspan = 0, Width = "40px"},
                        new DataHeaderModel(){ColumnKey = "index_4", ColumnValue = "Tồn đầu kỳ",Rowspan = 2, Colspan = 0, Width = "40px"},
                        new DataHeaderModel(){ColumnKey = "index_5", ColumnValue = "Nhập kho",Rowspan = 2, Colspan = 0, Width = "40px"},
                        new DataHeaderModel(){ColumnKey = "index_6", ColumnValue = "Xuất kho",Rowspan = 2, Colspan = 0, Width = "40px"},
                        new DataHeaderModel(){ColumnKey = "index_7", ColumnValue = "Tồn cuối kỳ",Rowspan = 2, Colspan = 0, Width = "40px"},

                         new DataHeaderModel(){ColumnKey = "index_8", ColumnValue = "Check",Rowspan = 0, Colspan = 5, Width = "380px"},

                         new DataHeaderModel(){ColumnKey = "index_14", ColumnValue = "Tổng",Rowspan = 2, Colspan = 0, Width = "40px"},
                         new DataHeaderModel(){ColumnKey = "index_15", ColumnValue = "Chênh lệch",Rowspan = 2, Colspan = 0, Width = "40px"},
                         new DataHeaderModel(){ColumnKey = "index_16", ColumnValue = "Loại hàng",Rowspan = 2, Colspan = 0, Width = "40px"},
                         new DataHeaderModel(){ColumnKey = "indexNote_17", ColumnValue = "Note",Rowspan = 2, Colspan = 0, Width = "40px"},
                    };

              
                var listHeader2 = new List<DataHeaderModel>()
                    {
                         new DataHeaderModel(){ColumnKey = "index$_9", ColumnValue = "Kiểm tra",Rowspan = 0, Colspan = 0, Width = "40px"},
                         new DataHeaderModel(){ColumnKey = "index$_10", ColumnValue = "Nhập lõi TSD /\r\n\r\nNhập gá KVN SX",Rowspan = 0, Colspan = 0, Width = "120px"},
                         new DataHeaderModel(){ColumnKey = "index$_11", ColumnValue = "BP.TRẢ",Rowspan = 0, Colspan = 0, Width = "40px"},
                         new DataHeaderModel(){ColumnKey = "index$_12", ColumnValue = "Pending",Rowspan = 0, Colspan = 0, Width = "40px"},
                         new DataHeaderModel(){ColumnKey = "index$_13", ColumnValue = "TNCC",Rowspan = 0, Colspan = 0, Width = "40px"},
                    };

                if (listOrganizationId.Count > 0)
                {
                    listHeader.Add(new DataHeaderModel() { ColumnKey = "index_18", ColumnValue = "Bộ phận lấy hàng", Rowspan = 0, Colspan = listOrganizationId.Count, Width = (listOrganizationId.Count * 40) + "px" });
                    int index = 19;
                    listOrganizationId.ForEach(orgId =>
                    {
                        if(orgId.Value != Guid.Empty && orgId.Value != null)
                        {
                            string orgName = listOrganization.FirstOrDefault(x => x.OrganizationId == orgId.Value)?.OrganizationName;
                            listHeader2.Add(new DataHeaderModel() { ColumnKey = "index_"+ index, ColumnValue = orgName, Rowspan = 0, Colspan = 0, Width = "40px" });
                            index++;
                        }
                    });
                }

                listDataHeader.Add(listHeader);
                listDataHeader.Add(listHeader2);

                var listData = new List<List<DataRowModel>>();
               
                listDotKiemKeChiTiet.ForEach(item =>
                {
                    int index = 0;
                    var listDataRow = new List<DataRowModel>();

                    var dataRow = new DataRowModel();
                    dataRow.ColumnKey = "indexNo_" + index;
                    dataRow.ColumnValue = (index + 1).ToString();
                    dataRow.Width = "20px";
                    dataRow.TextAlign = "center";
                    listDataRow.Add(dataRow);

                    index++;
                    var mavt = new DataRowModel();
                    mavt.ColumnKey = "index_" + index;
                    mavt.ColumnValue = item.ProductCode;
                    mavt.Width = "40px";
                    mavt.TextAlign = "center";

                    listDataRow.Add(mavt);

                    index++;
                    var tenvt = new DataRowModel();
                    tenvt.ColumnKey = "index_" + index;
                    tenvt.ColumnValue = item.ProductName;
                    tenvt.Width = "60px";
                    tenvt.TextAlign = "center";

                    listDataRow.Add(tenvt);

                    index++;
                    var donvi = new DataRowModel();
                    donvi.ColumnKey = "index_" + index;
                    donvi.ColumnValue = item.ProductUnitName;
                    donvi.Width = "40px";
                    donvi.TextAlign = "center";

                    listDataRow.Add(donvi);

                    index++;
                    var tondauky = new DataRowModel();
                    tondauky.ColumnKey = "index_" + index;
                    tondauky.ColumnValue = item.Tondauky.ToString();
                    tondauky.Width = "40px";
                    tondauky.TextAlign = "center";

                    listDataRow.Add(tondauky);

                    index++;
                    var nhapkho = new DataRowModel();
                    nhapkho.ColumnKey = "index_" + index;
                    nhapkho.ColumnValue = item.Nhapkho.ToString();
                    nhapkho.Width = "40px";
                    nhapkho.TextAlign = "center";

                    listDataRow.Add(nhapkho);

                    index++;
                    var xuatkho = new DataRowModel();
                    xuatkho.ColumnKey = "index_" + index;
                    xuatkho.ColumnValue = item.Xuatkho.ToString();
                    xuatkho.Width = "40px";
                    xuatkho.TextAlign = "center";

                    listDataRow.Add(xuatkho);

                    index++;
                    var toncuoiky = new DataRowModel();
                    toncuoiky.ColumnKey = "index_" + index;
                    toncuoiky.ColumnValue = item.Toncuoiky.ToString();
                    toncuoiky.Width = "40px";
                    toncuoiky.TextAlign = "center";

                    listDataRow.Add(toncuoiky);

                    index++;
                    var kiemtra = new DataRowModel();
                    kiemtra.ColumnKey = "index$_" + index;
                    kiemtra.ColumnValue = item.Checkkiemtra.ToString();
                    kiemtra.Width = "40px";
                    kiemtra.TextAlign = "center";

                    listDataRow.Add(kiemtra);

                    index++;
                    var nhaploi = new DataRowModel();
                    nhaploi.ColumnKey = "index$_" + index;
                    nhaploi.ColumnValue = item.Ckecknhapga.ToString();
                    nhaploi.Width = "120px";
                    nhaploi.TextAlign = "center";

                    listDataRow.Add(nhaploi);

                    index++;
                    var checktra = new DataRowModel();
                    checktra.ColumnKey = "index$_" + index;
                    checktra.ColumnValue = item.Checktra.ToString();
                    checktra.Width = "40px";
                    checktra.TextAlign = "center";

                    listDataRow.Add(checktra);

                    index++;
                    var pending = new DataRowModel();
                    pending.ColumnKey = "index$_" + index;
                    pending.ColumnValue = item.Checkpending.ToString();
                    pending.Width = "40px";
                    pending.TextAlign = "center";

                    listDataRow.Add(pending);

                    index++;
                    var tncc = new DataRowModel();
                    tncc.ColumnKey = "index$_" + index;
                    tncc.ColumnValue = item.CheckTncc.ToString();
                    tncc.Width = "40px";
                    tncc.TextAlign = "center";

                    listDataRow.Add(tncc);

                    index++;
                    var tong = new DataRowModel();
                    tong.ColumnKey = "index_" + index;
                    tong.ColumnValue = item.Tong.ToString();
                    tong.Width = "40px";
                    tong.TextAlign = "center";

                    listDataRow.Add(tong);

                    index++;
                    var chenhlech = new DataRowModel();
                    chenhlech.ColumnKey = "index_" + index;
                    chenhlech.ColumnValue = item.Chenhlech.ToString();
                    chenhlech.Width = "40px";
                    chenhlech.TextAlign = "center";

                    listDataRow.Add(chenhlech);

                    index++;
                    var loaihang = new DataRowModel();
                    loaihang.ColumnKey = "index_" + index;
                    loaihang.ColumnValue = item.TenLoaihang ?? "";
                    loaihang.Width = "40px";
                    loaihang.TextAlign = "center";

                    listDataRow.Add(loaihang);

                    index++;
                    var note = new DataRowModel();
                    note.ColumnKey = "indexNote_" + index;
                    note.ColumnValue = item.Note ?? "";
                    note.Width = "40px";
                    note.TextAlign = "center";

                    listDataRow.Add(note);

                    if (listOrganizationId.Count > 0)
                    {
                        item.ListDotKiemKeChiTietChildEntityModel.ForEach(element =>
                        {
                            index++;
                            var org = new DataRowModel();
                            org.ColumnKey = "index_" + index;
                            org.ColumnValue = element.SoLuong.ToString();
                            org.Width = "40px";
                            org.TextAlign = "center";

                            listDataRow.Add(org);
                        });
                    }
                    
                    listData.Add(listDataRow);
                });

                return new DotKiemKeDetailResult
                {
                    DotKiemKe = dotKiemKe,
                    ListDotKiemKeChiTiet = listDotKiemKeChiTiet,
                    ListDataHeader = listDataHeader,
                    ListData = listData,
                    Message = "",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new DotKiemKeDetailResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public static int GetMonthDifference(DateTime startDate, DateTime endDate)
        {
            int monthsApart = 12 * (startDate.Year - endDate.Year) + startDate.Month - endDate.Month;
            return Math.Abs(monthsApart);
        }

        public UpdateKhauHaoMobileResult UpdateKhauHaoMobile(UpdateKhauHaoMobileParameter parameter)
        {
            try
            {
                var taiSan = context.TaiSan.FirstOrDefault(x => x.TaiSanId == parameter.TaiSanId);
                if (taiSan == null)
                {
                    return new UpdateKhauHaoMobileResult
                    {
                        Message = "Tài sản không tồn tại trên hệ thống!",
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }
                taiSan.GiaTriNguyenGia = parameter.GiaTriNguyenGia != null ? parameter.GiaTriNguyenGia : taiSan.GiaTriNguyenGia;
                taiSan.GiaTriTinhKhauHao = parameter.GiaTriTinhKhauHao != null ? parameter.GiaTriTinhKhauHao : taiSan.GiaTriTinhKhauHao;
                taiSan.ThoiGianKhauHao = parameter.ThoiGianKhauHao != null ? parameter.ThoiGianKhauHao : taiSan.ThoiGianKhauHao;
                taiSan.ThoiDiemBdtinhKhauHao = parameter.ThoiDiemDatDauTinhKhauHao != null ? parameter.ThoiDiemDatDauTinhKhauHao : taiSan.ThoiDiemBdtinhKhauHao;
                context.TaiSan.Update(taiSan);
                context.SaveChanges();
                return new UpdateKhauHaoMobileResult
                {
                    Message = "Cập nhật khấu hao thành công!",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new UpdateKhauHaoMobileResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }


        public AddTaiSanToDotKiemKeResult AddTaiSanToDotKiemKe(AddTaiSanToDotKiemKeParameter parameter)
        {
            try
            {
                var dotKiemKe = context.DotKiemKe.FirstOrDefault(x => x.DotKiemKeId == parameter.DotKiemKeId);
                if (dotKiemKe == null)
                {
                    return new AddTaiSanToDotKiemKeResult
                    {
                        Message = "Đợt kiểm kê không tồn tại trên hệ thống",
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }

                var nguoiKiemKeEmpId = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                if (nguoiKiemKeEmpId == null)
                {
                    return new AddTaiSanToDotKiemKeResult
                    {
                        Message = "Người kiểm kê không tồn tại trên hệ thống!",
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }

                //Kiểm tra xem tài sản có trong đợt kiểm kê chưa
                var checKTaiSanDotKiemKe = context.DotKiemKeChiTiet.FirstOrDefault(x => x.DotKiemKeId == parameter.DotKiemKeId);
                //Chưa có thì thêm mới
                if (checKTaiSanDotKiemKe == null)
                {
                    var newDotKiemKeChiTiet = new DotKiemKeChiTiet();
                    newDotKiemKeChiTiet.DotKiemKeId = parameter.DotKiemKeId;
                    //newDotKiemKeChiTiet.TaiSanId = parameter.TaiSanId;
                    //newDotKiemKeChiTiet.NguoiKiemKeId = nguoiKiemKeEmpId.EmployeeId.Value;
                    newDotKiemKeChiTiet.CreatedById = parameter.UserId;
                    newDotKiemKeChiTiet.CreatedDate = DateTime.Now;
                    context.DotKiemKeChiTiet.Add(newDotKiemKeChiTiet);
                }
                //có r thì cập nhật
                else
                {
                    //checKTaiSanDotKiemKe.NguoiKiemKeId = nguoiKiemKeEmpId.EmployeeId.Value;
                    checKTaiSanDotKiemKe.CreatedById = parameter.UserId;
                    checKTaiSanDotKiemKe.CreatedDate = DateTime.Now;
                    context.DotKiemKeChiTiet.Update(checKTaiSanDotKiemKe);
                }
                context.SaveChanges();
                return new AddTaiSanToDotKiemKeResult
                {
                    Message = "Thêm tài sản kiểm kê thành công!",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new AddTaiSanToDotKiemKeResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public GetMasterDataAddTaiSanVaoDotKiemKeResult GetMasterDataAddTaiSanVaoDotKiemKe(GetMasterDataAddTaiSanVaoDotKiemKeParameter parameter)
        {
            try
            {
                var listDotKiemKe = context.DotKiemKe.Where(x => x.TrangThaiId == 2).Select(x => new DotKiemKeEntityModel
                {
                    DotKiemKeId = x.DotKiemKeId,
                    //TenDoiKiemKe = x.TenDoiKiemKe,
                    //NgayBatDau = x.NgayBatDau,
                    //NgayKetThuc = x.NgayKetThuc,
                    TrangThaiId = x.TrangThaiId,
                    CreatedById = x.CreatedById,
                    CreatedDate = x.CreatedDate
                }).ToList();//Đang thực hiện

                return new GetMasterDataAddTaiSanVaoDotKiemKeResult
                {
                    ListDotKiemKe = listDotKiemKe,
                    Message = "Lấy thông tin thành công!",
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
            catch (Exception ex)
            {
                return new GetMasterDataAddTaiSanVaoDotKiemKeResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public SearchWareHouseResult SearchListWareHouse(SearchWareHouseParameter parameter)
        {
            try
            {
                return new SearchWareHouseResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "",
                    //listWareHouse = listWareHouse
                };
            }
            catch (Exception ex)
            {
                return new SearchWareHouseResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public UpdateDotKiemKeDetailResult UpdateDotKiemKeDetail(UpdateDotKiemKeDetailParameter parameter)
        {
            try
            {
                parameter.ListDotKiemKeChiTiet.ForEach(item =>
                {
                    var chitiet = context.DotKiemKeChiTiet.FirstOrDefault(x => x.DotKiemKeChiTietId == item.DotKiemKeChiTietId);
                    if (chitiet == null)
                    {
                        chitiet = new DotKiemKeChiTiet();
                        chitiet.DotKiemKeId = item.DotKiemKeId;
                        chitiet.ProductId = item.ProductId;
                        chitiet.ProductCode = item.ProductCode;
                        chitiet.ProductUnit = item.ProductUnit;
                        chitiet.Loaihang = item.Loaihang;
                        chitiet.Tondauky = item.Tondauky;
                        chitiet.Toncuoiky = item.Toncuoiky;
                        chitiet.Nhapkho = item.Nhapkho;
                        chitiet.Xuatkho = item.Xuatkho;
                        chitiet.Checkkiemtra = item.Checkkiemtra;
                        chitiet.Ckecknhapga = item.Ckecknhapga;
                        chitiet.Checktra = item.Checktra;
                        chitiet.Checkpending = item.Checkpending;
                        chitiet.CheckTncc = item.CheckTncc;
                        chitiet.Note = item.Note;

                        chitiet.CreatedById = parameter.UserId;
                        chitiet.CreatedDate = DateTime.Now;
                        context.DotKiemKeChiTiet.Add(chitiet);
                        context.SaveChanges();

                        item.ListDotKiemKeChiTietChildEntityModel.ForEach(x =>
                        {
                            var newChild = new DotKiemKeChiTietChild();
                            newChild.DotKiemKeChiTietId = chitiet.DotKiemKeChiTietId;
                            newChild.OrganizationId = x.OrganizationId;
                            newChild.SoLuong = x.SoLuong;
                            context.DotKiemKeChiTietChild.Add(newChild);
                            context.SaveChanges();
                        });
                    }
                    else
                    {
                        chitiet.DotKiemKeId = item.DotKiemKeId;
                        chitiet.ProductId = item.ProductId;
                        chitiet.ProductCode = item.ProductCode;
                        chitiet.ProductUnit = item.ProductUnit;
                        chitiet.Loaihang = item.Loaihang;
                        chitiet.Tondauky = item.Tondauky;
                        chitiet.Toncuoiky = item.Toncuoiky;
                        chitiet.Nhapkho = item.Nhapkho;
                        chitiet.Xuatkho = item.Xuatkho;
                        chitiet.Checkkiemtra = item.Checkkiemtra;
                        chitiet.Ckecknhapga = item.Ckecknhapga;
                        chitiet.Checktra = item.Checktra;
                        chitiet.Checkpending = item.Checkpending;
                        chitiet.CheckTncc = item.CheckTncc;
                        chitiet.Loaihang = item.Loaihang;
                        chitiet.Note = item.Note;

                        chitiet.UpdatedById = parameter.UserId;
                        chitiet.UpdatedDate = DateTime.Now;
                        context.DotKiemKeChiTiet.Update(chitiet);
                        context.SaveChanges();
                        item.ListDotKiemKeChiTietChildEntityModel.ForEach(x =>
                        {
                            var child = context.DotKiemKeChiTietChild.FirstOrDefault(y => y.DotKiemKeChiTietId == x.DotKiemKeChiTietId && x.OrganizationId == x.OrganizationId);
                            if (child == null)
                            {
                                var newChild = new DotKiemKeChiTietChild();
                                newChild.DotKiemKeChiTietId = item.DotKiemKeChiTietId;
                                newChild.OrganizationId = x.OrganizationId;
                                newChild.SoLuong = x.SoLuong;
                                context.DotKiemKeChiTietChild.Add(newChild);
                                context.SaveChanges();
                            }
                            else
                            {
                                child.SoLuong = x.SoLuong;
                                context.DotKiemKeChiTietChild.Update(child);
                                context.SaveChanges();
                            }
                        });
                    }
                });

                return new UpdateDotKiemKeDetailResult
                {
                    Message = "Cập nhật kiểm kê thành công!",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new UpdateDotKiemKeDetailResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public ChangeTrangThaiDotKiemKeResult ChangeTrangThaiDotKiemKe(ChangeTrangThaiDotKiemKeParameter parameter)
        {
            try
            {
                var dotKiemKe = context.DotKiemKe.FirstOrDefault(x => x.DotKiemKeId == parameter.DotKiemKeId);
                if (dotKiemKe == null)
                {
                    return new ChangeTrangThaiDotKiemKeResult
                    {
                        Message = "Đợt kiểm kê không tồn tại trên hệ thống!",
                        StatusCode = HttpStatusCode.Forbidden
                    };
                }
                else
                {
                    dotKiemKe.TrangThaiId = 2; //Hoàn thành
                    context.DotKiemKe.Update(dotKiemKe);
                }

                context.SaveChanges();
                return new ChangeTrangThaiDotKiemKeResult
                {
                    Message = "Thay đổi trạng thái kiểm kê thành công!",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new ChangeTrangThaiDotKiemKeResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public CanBangDotKiemKeDetailResult CanBangDotKiemKeDetail(CanBangDotKiemKeDetailParameter parameter)
        {
            try
            {
                parameter.ListDotKiemKeChiTiet.ForEach(item =>
                {
                    var chitiet = context.DotKiemKeChiTiet.FirstOrDefault(x => x.DotKiemKeChiTietId == item.DotKiemKeChiTietId);
                    if (chitiet == null)
                    {
                        chitiet = new DotKiemKeChiTiet();
                        chitiet.DotKiemKeId = item.DotKiemKeId;
                        chitiet.ProductId = item.ProductId;
                        chitiet.ProductCode = item.ProductCode;
                        chitiet.ProductUnit = item.ProductUnit;
                        chitiet.Loaihang = item.Loaihang;
                        chitiet.Tondauky = item.Tondauky;
                        chitiet.Toncuoiky = item.Toncuoiky;
                        chitiet.Nhapkho = item.Nhapkho;
                        chitiet.Xuatkho = item.Xuatkho;
                        chitiet.Checkkiemtra = item.Checkkiemtra;
                        chitiet.Ckecknhapga = item.Ckecknhapga;
                        chitiet.Checktra = item.Checktra;
                        chitiet.Checkpending = item.Checkpending;
                        chitiet.CheckTncc = item.CheckTncc;
                        chitiet.Note = item.Note;

                        chitiet.CreatedById = parameter.UserId;
                        chitiet.CreatedDate = DateTime.Now;
                        context.DotKiemKeChiTiet.Add(chitiet);
                        context.SaveChanges();

                        //cap nhap lai id vao list
                        item.DotKiemKeChiTietId = chitiet.DotKiemKeChiTietId;

                        if(item.ListDotKiemKeChiTietChildEntityModel != null)
                        {
                            item.ListDotKiemKeChiTietChildEntityModel.ForEach(x =>
                            {
                                var newChild = new DotKiemKeChiTietChild();
                                newChild.DotKiemKeChiTietId = chitiet.DotKiemKeChiTietId;
                                newChild.OrganizationId = x.OrganizationId;
                                newChild.SoLuong = x.SoLuong;
                                context.DotKiemKeChiTietChild.Add(newChild);
                                context.SaveChanges();
                            });
                        }
                    }
                    else
                    {
                        chitiet.DotKiemKeId = item.DotKiemKeId;
                        chitiet.ProductId = item.ProductId;
                        chitiet.ProductCode = item.ProductCode;
                        chitiet.ProductUnit = item.ProductUnit;
                        chitiet.Loaihang = item.Loaihang;
                        chitiet.Tondauky = item.Tondauky;
                        chitiet.Toncuoiky = item.Toncuoiky;
                        chitiet.Nhapkho = item.Nhapkho;
                        chitiet.Xuatkho = item.Xuatkho;
                        chitiet.Checkkiemtra = item.Checkkiemtra;
                        chitiet.Ckecknhapga = item.Ckecknhapga;
                        chitiet.Checktra = item.Checktra;
                        chitiet.Checkpending = item.Checkpending;
                        chitiet.CheckTncc = item.CheckTncc;
                        chitiet.Note = item.Note;

                        chitiet.UpdatedById = parameter.UserId;
                        chitiet.UpdatedDate = DateTime.Now;
                        context.DotKiemKeChiTiet.Update(chitiet);
                        context.SaveChanges();

                        item.ListDotKiemKeChiTietChildEntityModel.ForEach(x =>
                        {
                            var child = context.DotKiemKeChiTietChild.FirstOrDefault(y => y.DotKiemKeChiTietId == x.DotKiemKeChiTietId && x.OrganizationId == x.OrganizationId);
                            if (child == null)
                            {
                                var newChild = new DotKiemKeChiTietChild();
                                newChild.DotKiemKeChiTietId = item.DotKiemKeChiTietId;
                                newChild.OrganizationId = x.OrganizationId;
                                newChild.SoLuong = x.SoLuong;
                                context.DotKiemKeChiTietChild.Add(newChild);
                                context.SaveChanges();
                            }
                            else
                            {
                                child.SoLuong = x.SoLuong;
                                context.DotKiemKeChiTietChild.Update(child);
                                context.SaveChanges();
                            }
                        });
                    }


                });

                var productUnitTypeId = context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DNH")?.CategoryTypeId;
                var listAllProductUnit = context.Category.Where(c => c.CategoryTypeId == productUnitTypeId).ToList() ?? new List<Category>();
                var listLotNo = context.LotNo.ToList();
                //get danh sach nhap xuat can bang
                var listNhapCanBang = parameter.ListDotKiemKeChiTiet.Where(x => x.Chenhlech > 0)
                    .Select(item => new PhieuCanBang()
                    {
                        DotKiemKeChiTietId = item.DotKiemKeChiTietId,
                        ProductId = item.ProductId,
                        ProductCode = item.ProductCode,
                        ProductName = item.ProductName,
                        SoLuongCanNhap = item.Chenhlech,
                        TrangThaiId = 0, //Chua cap nhat LotNo
                        TrangThaiName = "Chưa cập nhật Lot.No",
                        DonVi = item.ProductUnitName,
                        ListProductLotNoPhieuCanBang = new List<ProductLotNoPhieuCanBang>()
                    }).ToList();

                var listXuatCanBang = new List<PhieuCanBang>();

                var dotkiemke = context.DotKiemKe.FirstOrDefault(x => x.DotKiemKeId == parameter.ListDotKiemKeChiTiet[0].DotKiemKeId);
                if(dotkiemke != null)
                {
                    var firstDayOfMonth = new DateTime(dotkiemke.ThangKiemKe.Value.Year, dotkiemke.ThangKiemKe.Value.Month, 1);
                    var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

                    parameter.ListDotKiemKeChiTiet.Where(x => x.Chenhlech < 0).ToList().ForEach(item =>
                    {
                        var phieucanbang = new PhieuCanBang();
                        phieucanbang.DotKiemKeChiTietId = item.DotKiemKeChiTietId;
                        phieucanbang.ProductId = item.ProductId;
                        phieucanbang.ProductCode = item.ProductCode;
                        phieucanbang.ProductName = item.ProductName;
                        phieucanbang.SoLuongCanXuat = Math.Abs(item.Chenhlech);
                        phieucanbang.DonVi = item.ProductUnitName;
                        phieucanbang.TrangThaiId = 0; //Chua cap nhat LotNo
                        phieucanbang.TrangThaiName = "Chưa cập nhật Lot.No";
                        phieucanbang.ListProductLotNoPhieuCanBang = new List<ProductLotNoPhieuCanBang>();

                        context.ProductLotNoMapping.Where(x => x.ProductId == item.ProductId).ToList().ForEach(lot =>
                        {
                            var itemInventoryReport = context.InventoryReport.Where(x => x.ProductId == item.ProductId
                            && x.LotNoId == lot.LotNoId && x.WarehouseId == dotkiemke.WarehouseId
                            && x.InventoryReportDate >= firstDayOfMonth && x.InventoryReportDate <= lastDayOfMonth).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                            var soluongton = 0m;
                            if (itemInventoryReport != null)
                            {
                                soluongton = itemInventoryReport.StartQuantity + itemInventoryReport.QuantityReceiving - itemInventoryReport.QuantityDelivery;
                            }

                            var productLotNoPhieuCanBang = new ProductLotNoPhieuCanBang();
                            productLotNoPhieuCanBang.ProductId = item.ProductId;
                            productLotNoPhieuCanBang.LotNoId = lot.LotNoId;
                            productLotNoPhieuCanBang.LotNoName = listLotNo.FirstOrDefault(x => x.LotNoId == lot.LotNoId).LotNoName;
                            productLotNoPhieuCanBang.SoLuongTon = soluongton;

                            phieucanbang.ListProductLotNoPhieuCanBang.Add(productLotNoPhieuCanBang);
                        });

                        listXuatCanBang.Add(phieucanbang);
                    });
                }
                
                return new CanBangDotKiemKeDetailResult
                {
                    ListNhapCanBang = listNhapCanBang,
                    ListXuatCanBang = listXuatCanBang,
                    Message = "",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new CanBangDotKiemKeDetailResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }
        public decimal getQuantityInventoryByProductLotNo(Guid productId, long lotNoId)
        {
            var product = context.InventoryReport.Where(x => x.ProductId == productId && x.LotNoId == lotNoId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();
            if (product != null)
            {
                return product.StartQuantity + product.QuantityReceiving - product.QuantityDelivery;
            }

            return 0;
        }

        public TaoPhieuXuatCanBangKhoResult TaoPhieuXuatCanBangKho(TaoPhieuXuatCanBangKhoParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                var categoryTypeId = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TPHX" && ct.Active == true).CategoryTypeId;
                var categoryId = context.Category.FirstOrDefault(ct => ct.CategoryCode == "NHA" && ct.CategoryTypeId == categoryTypeId && ct.Active == true).CategoryId;

                var datenow = DateTime.Now;
                var totalInvertoryCreate = context.InventoryDeliveryVoucher.Where(c => Convert.ToDateTime(c.CreatedDate).Day == datenow.Day && Convert.ToDateTime(c.CreatedDate).Month == datenow.Month && Convert.ToDateTime(c.CreatedDate).Year == datenow.Year).Count();

                var newInventoryDeliveryVoucher = new InventoryDeliveryVoucher();
                newInventoryDeliveryVoucher.InventoryDeliveryVoucherId = Guid.NewGuid();
                newInventoryDeliveryVoucher.InventoryDeliveryVoucherCode = "PX-" + ConverCreateId(totalInvertoryCreate + 1);
                newInventoryDeliveryVoucher.StatusId = categoryId; // Đã Xuất
                newInventoryDeliveryVoucher.Active = true;
                newInventoryDeliveryVoucher.CreatedDate = DateTime.Now;
                newInventoryDeliveryVoucher.CreatedById = parameter.UserId;
                newInventoryDeliveryVoucher.InventoryDeliveryVoucherType = (int)InventoryDeliveryVoucherType.XKK; //Xuất kiểm kê
                newInventoryDeliveryVoucher.InventoryDeliveryVoucherDate = DateTime.Now;
                newInventoryDeliveryVoucher.InventoryDeliveryVoucherTime = DateTime.Now.TimeOfDay;
                newInventoryDeliveryVoucher.WarehouseId = parameter.WarehouseId;
                newInventoryDeliveryVoucher.WarehouseReceivingId = Guid.Empty;

                context.InventoryDeliveryVoucher.Add(newInventoryDeliveryVoucher);

                parameter.ListXuatCanBang.ForEach(product =>
                {
                    product.ListProductLotNoPhieuCanBang.ForEach(item =>
                    {
                        if (item.ProductId != null)
                        {
                            InventoryDeliveryVoucherMapping voucherMapping = new InventoryDeliveryVoucherMapping();
                            voucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                            voucherMapping.InventoryDeliveryVoucherId = newInventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            voucherMapping.ProductId = (Guid)item.ProductId;
                            voucherMapping.QuantityRequest = (decimal)item.SoLuong;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.QuantityDelivery = (decimal)item.SoLuong;
                            voucherMapping.QuantityInventory = (decimal)item.SoLuongTon;
                            voucherMapping.ProductId = item.ProductId;
                            voucherMapping.Active = true;
                            voucherMapping.CreatedDate = DateTime.Now;
                            voucherMapping.CreatedById = parameter.UserId;
                            voucherMapping.LotNoId = item.LotNoId;
                            voucherMapping.WarehouseId = parameter.WarehouseId;
                            context.InventoryDeliveryVoucherMapping.Add(voucherMapping);

                            context.SaveChanges();
                        }
                    });

                    //Update bang chi tiet kiem ke
                    var itemDetail = context.DotKiemKeChiTiet.FirstOrDefault(x => x.DotKiemKeChiTietId == product.DotKiemKeChiTietId);
                    if (itemDetail != null)
                    {
                        itemDetail.Xuatkho += product.SoLuongCanXuat;
                        itemDetail.Toncuoiky -= product.SoLuongCanXuat;
                        context.DotKiemKeChiTiet.Update(itemDetail);
                    }
                    context.SaveChanges();
                });

                //update lai ton kho
                var listInventoryDeliveryVoucherMapping = context.InventoryDeliveryVoucherMapping.Where(x => x.InventoryDeliveryVoucherId == newInventoryDeliveryVoucher.InventoryDeliveryVoucherId).ToList();
                listInventoryDeliveryVoucherMapping.ForEach(voucherMapping =>
                {
                    var inventoryReportByProduct = context.InventoryReport.FirstOrDefault(wh =>
                        wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId && wh.InventoryReportDate.Date == DateTime.Now.Date);
                    if (inventoryReportByProduct == null)
                    {
                        InventoryReport inventoryReport = new InventoryReport();
                        inventoryReport.InventoryReportId = Guid.NewGuid();
                        inventoryReport.WarehouseId = voucherMapping.WarehouseId;
                        inventoryReport.ProductId = voucherMapping.ProductId;
                        inventoryReport.LotNoId = voucherMapping.LotNoId;
                        inventoryReport.QuantityMinimum = 0;
                        inventoryReport.Active = true;
                        inventoryReport.CreatedDate = DateTime.Now;
                        inventoryReport.InventoryReportDate = DateTime.Now;
                        inventoryReport.QuantityDelivery = voucherMapping.QuantityDelivery;

                        var report = context.InventoryReport.Where(wh =>
                        wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                        if (report != null)
                            inventoryReport.StartQuantity = report.StartQuantity + report.QuantityReceiving - report.QuantityDelivery;

                        context.InventoryReport.Add(inventoryReport);
                    }
                    else
                    {
                        inventoryReportByProduct.QuantityDelivery += voucherMapping.QuantityDelivery;
                        context.InventoryReport.Update(inventoryReportByProduct);
                    }
                });
                context.SaveChanges();

                var note = new TN.TNM.DataAccess.Databases.Entities.Note();
                note.ObjectId = newInventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                note.NoteId = Guid.NewGuid();
                note.Active = true;
                note.CreatedById = parameter.UserId;
                note.CreatedDate = DateTime.Now;
                note.ObjectType = "WH";
                note.Description = employee.EmployeeName.Trim() + " Xuất kiểm kê cho đợt kiểm kê [Tháng x]";
                note.NoteTitle = "Đã tạo phiếu xuất";
                note.Type = "ADD";
                context.Note.Add(note);

                context.SaveChanges();

                return new TaoPhieuXuatCanBangKhoResult
                {
                    Message = "",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new TaoPhieuXuatCanBangKhoResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public TaoPhieuNhapCanBangKhoResult TaoPhieuNhapCanBangKho(TaoPhieuNhapCanBangKhoParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                var statusTypeId_PNK = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TPH")
                    ?.CategoryTypeId;
                var statusId_Nhap_PNK = context.Category
                    .FirstOrDefault(x => x.CategoryCode == "NHK" && x.CategoryTypeId == statusTypeId_PNK)
                    .CategoryId;

                var datenow = DateTime.Now;
                string year = datenow.Year.ToString().Substring(datenow.Year.ToString().Length - 2, 2);
                string month = datenow.Month < 10 ? "0" + datenow.Month.ToString() : datenow.Month.ToString();
                string day = datenow.Day < 10 ? "0" + datenow.Day.ToString() : datenow.Day.ToString();

                var Code = "PN " + year + month + day + "0001";

                var newInventoryReceivingVoucher = new InventoryReceivingVoucher();
                newInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                newInventoryReceivingVoucher.InventoryReceivingVoucherCode = Code;
                newInventoryReceivingVoucher.InventoryReceivingVoucherDate = DateTime.Now;
                newInventoryReceivingVoucher.InventoryReceivingVoucherTime = DateTime.Now.TimeOfDay;
                newInventoryReceivingVoucher.StatusId = statusId_Nhap_PNK; // Đã nhập
                newInventoryReceivingVoucher.InventoryReceivingVoucherType = (int)InventoryReceivingVoucherType.NKK; //type nhập kiểm kê
                newInventoryReceivingVoucher.Active = true;
                newInventoryReceivingVoucher.CreatedById = parameter.UserId;
                newInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                newInventoryReceivingVoucher.WarehouseId = parameter.WarehouseId;

                context.InventoryReceivingVoucher.Add(newInventoryReceivingVoucher);

                parameter.ListNhapCanBang.ForEach(product =>
                {
                    product.ListProductLotNoPhieuCanBang.ForEach(item =>
                    {
                        var existsLotNo = context.LotNo.FirstOrDefault(x => x.LotNoName == item.LotNoName);
                        if (existsLotNo != null)
                        {
                            item.LotNoId = existsLotNo.LotNoId;
                        }
                        else if (item.LotNoId == null)
                        {
                            var newLotNo = new LotNo();
                            newLotNo.LotNoName = item.LotNoName;
                            context.LotNo.Add(newLotNo);
                            context.SaveChanges();

                            item.LotNoId = newLotNo.LotNoId;
                        }

                        //Check ProductLotNoMapping
                        var existsProductLotNo = context.ProductLotNoMapping.FirstOrDefault(x =>
                            x.ProductId == item.ProductId && x.LotNoId == item.LotNoId);

                        if (existsProductLotNo == null)
                        {
                            var newProductLotNo = new ProductLotNoMapping();
                            newProductLotNo.ProductLotNoMappingId = Guid.NewGuid();
                            newProductLotNo.ProductId = item.ProductId;
                            newProductLotNo.LotNoId = item.LotNoId.Value;
                            context.ProductLotNoMapping.Add(newProductLotNo);
                            context.SaveChanges();
                        }

                        var newInventoryReceivingVoucherMapping = new InventoryReceivingVoucherMapping();

                        newInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                        newInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
                        newInventoryReceivingVoucherMapping.Active = true;
                        newInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                        newInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                        newInventoryReceivingVoucherMapping.ProductId = item.ProductId;
                        newInventoryReceivingVoucherMapping.LotNoId = item.LotNoId;
                        newInventoryReceivingVoucherMapping.QuantityActual = item.SoLuong;
                        newInventoryReceivingVoucherMapping.WarehouseId = parameter.WarehouseId;
                        context.InventoryReceivingVoucherMapping.Add(newInventoryReceivingVoucherMapping);
                        context.SaveChanges();
                    });

                    //Update bang chi tiet kiem ke
                    var itemDetail = context.DotKiemKeChiTiet.FirstOrDefault(x => x.DotKiemKeChiTietId == product.DotKiemKeChiTietId);
                    if (itemDetail != null)
                    {
                        itemDetail.Nhapkho += product.SoLuongCanNhap;
                        itemDetail.Toncuoiky += product.SoLuongCanNhap;
                        context.DotKiemKeChiTiet.Update(itemDetail);
                    }
                    context.SaveChanges();

                });

                //update vao bang Ton kho
                var listInventoryReceivingVoucherMapping = context.InventoryReceivingVoucherMapping.Where(x => x.InventoryReceivingVoucherId == newInventoryReceivingVoucher.InventoryReceivingVoucherId).ToList();
                listInventoryReceivingVoucherMapping.ForEach(voucherMapping =>
                {
                    var inventoryReportByProduct = context.InventoryReport.FirstOrDefault(wh =>
                        wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId && wh.InventoryReportDate.Date == DateTime.Now.Date);
                    if (inventoryReportByProduct == null)
                    {
                        InventoryReport inventoryReport = new InventoryReport();
                        inventoryReport.InventoryReportId = Guid.NewGuid();
                        inventoryReport.WarehouseId = voucherMapping.WarehouseId;
                        inventoryReport.ProductId = voucherMapping.ProductId;
                        inventoryReport.LotNoId = voucherMapping.LotNoId;
                        inventoryReport.QuantityMinimum = 0;
                        inventoryReport.Active = true;
                        inventoryReport.CreatedDate = DateTime.Now;
                        inventoryReport.InventoryReportDate = DateTime.Now;
                        inventoryReport.QuantityReceiving = voucherMapping.QuantityActual;

                        var report = context.InventoryReport.Where(wh =>
                       wh.ProductId == voucherMapping.ProductId && wh.WarehouseId == voucherMapping.WarehouseId && wh.LotNoId == voucherMapping.LotNoId).OrderByDescending(x => x.InventoryReportDate).FirstOrDefault();

                        if (report != null)
                            inventoryReport.StartQuantity = report.QuantityReceiving + report.StartQuantity - report.QuantityDelivery;

                        context.InventoryReport.Add(inventoryReport);
                    }
                    else
                    {
                        inventoryReportByProduct.QuantityReceiving += voucherMapping.QuantityActual;
                        context.InventoryReport.Update(inventoryReportByProduct);
                    }
                });
                context.SaveChanges();

                #region Thêm vào Dòng thời gian

                var note = new TN.TNM.DataAccess.Databases.Entities.Note();
                note.NoteId = Guid.NewGuid();
                note.Description = employee.EmployeeName.Trim() + " Nhập kiểm kê cho đợt kiểm kê [Tháng x]";
                note.Type = "NEW";
                note.ObjectId = newInventoryReceivingVoucher.InventoryReceivingVoucherId;
                note.ObjectType = "PNK";
                note.Active = true;
                note.NoteTitle = "Đã tạo phiếu nhập kho";
                note.CreatedDate = DateTime.Now;
                note.CreatedById = parameter.UserId;

                context.Note.Add(note);
                #endregion
                return new TaoPhieuNhapCanBangKhoResult
                {
                    Message = "",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception ex)
            {
                return new TaoPhieuNhapCanBangKhoResult
                {
                    Message = ex.Message,
                    StatusCode = HttpStatusCode.Forbidden
                };
            }
        }

        public string ConverCreateId(int totalRecordCreate)
        {
            var datenow = DateTime.Now;
            string year = datenow.Year.ToString().Substring(datenow.Year.ToString().Length - 2, 2);
            string month = datenow.Month < 10 ? "0" + datenow.Month.ToString() : datenow.Month.ToString();
            string day = datenow.Day < 10 ? "0" + datenow.Day.ToString() : datenow.Day.ToString();
            string total = "";
            if (totalRecordCreate > 999)
            {
                total = totalRecordCreate.ToString();
            }
            else if (totalRecordCreate > 99 && totalRecordCreate < 1000)
            {
                total = "0" + totalRecordCreate.ToString();
            }
            else if (totalRecordCreate > 9 && totalRecordCreate < 100)
            {
                total = "00" + totalRecordCreate.ToString();
            }
            else
            {
                total = "000" + totalRecordCreate.ToString();
            }
            var result = year + month + day + total;

            return result;
        }
    }
}