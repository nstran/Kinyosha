using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.QuyTrinh;
using TN.TNM.DataAccess.Messages.Results.QuyTrinh;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.QuyTrinh;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.ConstType.Note;
using TN.TNM.Common.NotificationSetting;
using TN.TNM.DataAccess.Models.DeXuatXinNghiModel;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class QuyTrinhDAO : BaseDAO, IQuyTrinhDataAccess
    {
        public QuyTrinhDAO(TNTN8Context _context)
        {
            this.context = _context;
        }

        public CreateQuyTrinhResult CreateQuyTrinh(CreateQuyTrinhParameter parameter)
        {
            try
            {
                var exist = context.QuyTrinh.FirstOrDefault(x => x.DoiTuongApDung == parameter.QuyTrinh.DoiTuongApDung);
                if (exist != null)
                {
                    return new CreateQuyTrinhResult()
                    {
                        MessageCode = "Đã tồn tại Quy trình cho đối tượng này",
                        StatusCode = System.Net.HttpStatusCode.Conflict
                    };
                }

                //Nếu quy trình có trạng thái Hoạt động
                if (parameter.QuyTrinh.HoatDong)
                {
                    //Update trạng thái Hoạt động các đối tượng áp dụng -> false
                    var listQuyTrinh = context.QuyTrinh
                        .Where(x => x.DoiTuongApDung == parameter.QuyTrinh.DoiTuongApDung).ToList();
                    listQuyTrinh.ForEach(item => { item.HoatDong = false; });
                    context.QuyTrinh.UpdateRange(listQuyTrinh);
                }

                var quyTrinh = new QuyTrinh();
                quyTrinh.Id = Guid.NewGuid();
                quyTrinh.TenQuyTrinh = parameter.QuyTrinh.TenQuyTrinh;
                quyTrinh.MaQuyTrinh = GenCode();
                quyTrinh.DoiTuongApDung = parameter.QuyTrinh.DoiTuongApDung;
                quyTrinh.HoatDong = parameter.QuyTrinh.HoatDong;
                quyTrinh.MoTa = parameter.QuyTrinh.MoTa;
                quyTrinh.CreatedById = parameter.UserId;
                quyTrinh.CreatedDate = DateTime.Now;

                var listCauHinhQuyTrinh = new List<CauHinhQuyTrinh>();
                var listCacBuocQuyTrinh = new List<CacBuocQuyTrinh>();
                var listPhongBanTrongCacBuocQuyTrinh = new List<PhongBanTrongCacBuocQuyTrinh>();

                parameter.ListCauHinhQuyTrinh.ForEach(cauHinh =>
                {
                    var newCauHinh = new CauHinhQuyTrinh();
                    newCauHinh.Id = Guid.NewGuid();
                    newCauHinh.SoTienTu = cauHinh.SoTienTu;
                    newCauHinh.TenCauHinh = cauHinh.TenCauHinh;
                    newCauHinh.QuyTrinh = cauHinh.QuyTrinh;
                    newCauHinh.QuyTrinhId = quyTrinh.Id;

                    listCauHinhQuyTrinh.Add(newCauHinh);

                    cauHinh.ListCacBuocQuyTrinh.ForEach(buoc =>
                    {
                        var newBuoc = new CacBuocQuyTrinh();
                        newBuoc.Id = Guid.NewGuid();
                        newBuoc.Stt = buoc.Stt;
                        newBuoc.LoaiPheDuyet = buoc.LoaiPheDuyet;
                        newBuoc.CauHinhQuyTrinhId = newCauHinh.Id;

                        listCacBuocQuyTrinh.Add(newBuoc);

                        buoc.ListPhongBanTrongCacBuocQuyTrinh.ForEach(phongBan =>
                        {
                            var newPhongBan = new PhongBanTrongCacBuocQuyTrinh();
                            newPhongBan.Id = Guid.NewGuid();
                            newPhongBan.OrganizationId = phongBan.OrganizationId;
                            newPhongBan.CacBuocQuyTrinhId = newBuoc.Id;

                            listPhongBanTrongCacBuocQuyTrinh.Add(newPhongBan);
                        });
                    });
                });

                context.QuyTrinh.Add(quyTrinh);
                context.CauHinhQuyTrinh.AddRange(listCauHinhQuyTrinh);
                context.CacBuocQuyTrinh.AddRange(listCacBuocQuyTrinh);
                context.PhongBanTrongCacBuocQuyTrinh.AddRange(listPhongBanTrongCacBuocQuyTrinh);
                context.SaveChanges();

                return new CreateQuyTrinhResult()
                {
                    Status = true,
                    Message = "Tạo thành công",
                    MessageCode = "Tạo thành công",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Id = quyTrinh.Id
                };
            }
            catch (Exception e)
            {
                return new CreateQuyTrinhResult()
                {
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed
                };
            }
        }

        public SearchQuyTrinhResult SearchQuyTrinh(SearchQuyTrinhParameter parameter)
        {
            try
            {
                var ListQuyTrinh = new List<QuyTrinhModel>();
                var listUserId = context.User.Where(x => parameter.ListEmployeeId.Contains(x.EmployeeId.Value)).Select(
                    y => y.UserId).ToList();

                ListQuyTrinh = context.QuyTrinh.Where(x =>
                        (listUserId.Count == 0 || listUserId.Contains(x.CreatedById)) &&
                        (parameter.TenQuyTrinh == null || parameter.TenQuyTrinh.Trim() == "" ||
                         x.TenQuyTrinh.Contains(parameter.TenQuyTrinh)) &&
                        (parameter.MaQuyTrinh == null || parameter.MaQuyTrinh.Trim() == "" ||
                         x.MaQuyTrinh.Contains(parameter.MaQuyTrinh)) &&
                        (parameter.CreatedDateFrom == null ||
                         x.CreatedDate.Date >= parameter.CreatedDateFrom.Value.Date) &&
                        (parameter.CreatedDateTo == null || 
                         x.CreatedDate.Date <= parameter.CreatedDateTo.Value.Date) &&
                        (parameter.ListTrangThai.Count == 0 || parameter.ListTrangThai.Contains(x.HoatDong)))
                    .Select(y => new QuyTrinhModel
                    {
                        Id = y.Id,
                        TenQuyTrinh = y.TenQuyTrinh,
                        MaQuyTrinh = y.MaQuyTrinh,
                        HoatDong = y.HoatDong,
                        DoiTuongApDung = y.DoiTuongApDung,
                        CreatedDate = y.CreatedDate,
                        CreatedById = y.CreatedById
                    }).OrderByDescending(z => z.CreatedDate).ToList();

                var listCreatedId = ListQuyTrinh.Select(y => y.CreatedById).Distinct().ToList();
                var listCreated = context.User.Where(x => listCreatedId.Contains(x.UserId)).Select(y => new
                {
                    y.UserId,
                    y.EmployeeId
                }).ToList();
                var listEmployeeId = context.User.Where(x => listCreatedId.Contains(x.UserId)).Select(y => y.EmployeeId)
                    .ToList();
                var listEmployee = context.Employee.Where(x => listEmployeeId.Contains(x.EmployeeId)).Select(y => new
                {
                    y.EmployeeId,
                    y.EmployeeCode,
                    y.EmployeeName
                }).ToList();

                ListQuyTrinh.ForEach(item =>
                {
                    var user = listCreated.FirstOrDefault(x => x.UserId == item.CreatedById);
                    var emp = listEmployee.FirstOrDefault(x => x.EmployeeId == user?.EmployeeId);
                    item.NguoiTao = emp?.EmployeeCode + " - " + emp?.EmployeeName;
                    item.NgayTao = item.CreatedDate.ToString("dd/MM/yyyy");
                    item.TenDoiTuongApDung = GetDoiTuongApDung(item.DoiTuongApDung);
                });

                return new SearchQuyTrinhResult()
                {
                    Status = true,
                    Message = "Success",
                    ListQuyTrinh = ListQuyTrinh,
                    MessageCode = "success",
                    StatusCode = System.Net.HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchQuyTrinhResult()
                {
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetMasterDataSearchQuyTrinhResult GetMasterDataSearchQuyTrinh(GetMasterDataSearchQuyTrinhParameter parameter)
        {
            try
            {
                var ListEmployee = new List<EmployeeEntityModel>();
                ListEmployee = context.Employee.Where(x => x.Active == true).Select(y => new EmployeeEntityModel
                {
                    EmployeeId = y.EmployeeId,
                    EmployeeCode = y.EmployeeCode,
                    EmployeeName = y.EmployeeName,
                    EmployeeCodeName = y.EmployeeCode + " - " + y.EmployeeName
                }).OrderBy(z => z.EmployeeName).ToList();

                return new GetMasterDataSearchQuyTrinhResult()
                {
                    MessageCode = "Success",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ListEmployee = ListEmployee
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataSearchQuyTrinhResult()
                {
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public GetDetailQuyTrinhResult GetDetailQuyTrinh(GetDetailQuyTrinhParameter parameter)
        {
            try
            {
                var QuyTrinh = new QuyTrinhModel();
                var ListCauHinhQuyTrinh = new List<CauHinhQuyTrinhModel>();
                var listDoiTuongApDung = GeneralList.GetTrangThais("DoiTuongApDungQuyTrinhPheDuyet");

                QuyTrinh = context.QuyTrinh.Where(x => x.Id == parameter.Id).Select(y => new QuyTrinhModel
                {
                    Id = y.Id,
                    TenQuyTrinh = y.TenQuyTrinh,
                    MaQuyTrinh = y.MaQuyTrinh,
                    CreatedDate = y.CreatedDate,
                    CreatedById = y.CreatedById,
                    MoTa = y.MoTa,
                    HoatDong = y.HoatDong,
                    DoiTuongApDung = y.DoiTuongApDung
                }).FirstOrDefault();

                if (QuyTrinh == null)
                {
                    return new GetDetailQuyTrinhResult()
                    {
                        Status = false,
                        Message = "Quy trình không tồn tại trên hệ thống",
                        MessageCode = "Quy trình không tồn tại trên hệ thống",
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                    };
                }

                var userCreated = context.User.FirstOrDefault(x => x.UserId == QuyTrinh.CreatedById);
                var employeeCreated = context.Employee.FirstOrDefault(x => x.EmployeeId == userCreated.EmployeeId);
                QuyTrinh.NguoiTao = employeeCreated?.EmployeeCode + " - " + employeeCreated?.EmployeeName;
                QuyTrinh.NgayTao = QuyTrinh.CreatedDate.ToString("dd/MM/yyyy");

                ListCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == QuyTrinh.Id).Select(y =>
                    new CauHinhQuyTrinhModel
                    {
                        Id = y.Id,
                        SoTienTu = y.SoTienTu,
                        TenCauHinh = y.TenCauHinh,
                        LoaiCauHinh = y.LoaiCauHinh,
                        QuyTrinh = y.QuyTrinh,
                        ListCacBuocQuyTrinh = new List<CacBuocQuyTrinhModel>()
                    }).OrderBy(z => z.SoTienTu).ToList();

                var listCauHinhQuyTrinhId = ListCauHinhQuyTrinh.Select(y => y.Id).ToList();
                var listCacBuocQuyTrinh = context.CacBuocQuyTrinh
                    .Where(x => listCauHinhQuyTrinhId.Contains(x.CauHinhQuyTrinhId)).ToList();
                var listCacBuocQuyTrinhId = listCacBuocQuyTrinh.Select(y => y.Id).ToList();
                var listPhongBanTrongCacBuoc = context.PhongBanTrongCacBuocQuyTrinh
                    .Where(x => listCacBuocQuyTrinhId.Contains(x.CacBuocQuyTrinhId)).ToList();

                ListCauHinhQuyTrinh.ForEach(cauHinh =>
                {
                    cauHinh.ListCacBuocQuyTrinh = listCacBuocQuyTrinh.Where(x => x.CauHinhQuyTrinhId == cauHinh.Id)
                        .Select(y => new CacBuocQuyTrinhModel
                        {
                            Id = y.Id,
                            CauHinhQuyTrinhId = y.CauHinhQuyTrinhId,
                            LoaiPheDuyet = y.LoaiPheDuyet,
                            Stt = y.Stt,
                            ListPhongBanTrongCacBuocQuyTrinh = new List<PhongBanTrongCacBuocQuyTrinhModel>()
                        }).OrderBy(z => z.Stt).ToList();

                    cauHinh.ListCacBuocQuyTrinh.ForEach(buoc =>
                    {
                        buoc.ListPhongBanTrongCacBuocQuyTrinh = listPhongBanTrongCacBuoc
                            .Where(x => x.CacBuocQuyTrinhId == buoc.Id).Select(y =>
                                new PhongBanTrongCacBuocQuyTrinhModel
                                {
                                    Id = y.Id,
                                    OrganizationId = y.OrganizationId,
                                    CacBuocQuyTrinhId = y.CacBuocQuyTrinhId
                                }).ToList();
                    });
                });

                return new GetDetailQuyTrinhResult()
                {
                    Status = true,
                    Message = "Success",
                    MessageCode = "Success",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    QuyTrinh = QuyTrinh,
                    ListCauHinhQuyTrinh = ListCauHinhQuyTrinh,
                    ListDoiTuongApDung = listDoiTuongApDung
                };
            }
            catch (Exception e)
            {
                return new GetDetailQuyTrinhResult()
                {
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public UpdateQuyTrinhResult UpdateQuyTrinh(UpdateQuyTrinhParameter parameter)
        {
            try
            {
                var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.Id == parameter.QuyTrinh.Id);
                if (quyTrinh == null)
                {
                    return new UpdateQuyTrinhResult()
                    {
                        Status = false,
                        Message = "Quy trình không tồn tại trên hệ thống",
                        MessageCode = "Quy trình không tồn tại trên hệ thống",
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                    };
                }

                var existQuyTrinh = context.QuyTrinh
                    .FirstOrDefault(x => x.Id != quyTrinh.Id &&
                                         x.DoiTuongApDung == parameter.QuyTrinh.DoiTuongApDung);

                if (existQuyTrinh != null)
                {
                    return new UpdateQuyTrinhResult()
                    {
                        MessageCode = "Đã tồn tại Quy trình cho đối tượng này",
                        StatusCode = System.Net.HttpStatusCode.Conflict
                    };
                }

                //Nếu quy trình có trạng thái Hoạt động
                if (parameter.QuyTrinh.HoatDong)
                {
                    //Update trạng thái Hoạt động các đối tượng áp dụng -> false
                    var listQuyTrinh = context.QuyTrinh
                        .Where(x => x.DoiTuongApDung == parameter.QuyTrinh.DoiTuongApDung).ToList();
                    listQuyTrinh.ForEach(item => { item.HoatDong = false; });
                    context.QuyTrinh.UpdateRange(listQuyTrinh);
                }

                if (quyTrinh.HoatDong && quyTrinh.HoatDong != parameter.QuyTrinh.HoatDong)
                {
                    return new UpdateQuyTrinhResult()
                    {
                        Status = false,
                        Message = "Cần có ít nhất một quy trình gắn với " + GetDoiTuongApDung(quyTrinh.DoiTuongApDung) + " hoạt động",
                        MessageCode = "Cần có ít nhất một quy trình gắn với " +
                                      GetDoiTuongApDung(quyTrinh.DoiTuongApDung) + " hoạt động",
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                    };
                }

                /*
                 * Kiểm tra xem quy trình có thay đổi hay không?
                 * Nếu thay đổi thì tiền hành xóa CacBuocApDung của các đối tượng đang áp dụng quy trình
                 * để áp dụng các bước thực hiện theo quy trình mới cập nhật
                 */
                var listCode = new List<string>();
                CheckResetQuyTrinh(parameter.QuyTrinh, parameter.UserId,
                    parameter.ListCauHinhQuyTrinh, true, out listCode);

                quyTrinh.TenQuyTrinh = parameter.QuyTrinh.TenQuyTrinh;
                quyTrinh.DoiTuongApDung = parameter.QuyTrinh.DoiTuongApDung;
                quyTrinh.HoatDong = parameter.QuyTrinh.HoatDong;
                quyTrinh.MoTa = parameter.QuyTrinh.MoTa;

                context.QuyTrinh.Update(quyTrinh);

                #region Xóa cấu hình cũ

                var _listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id).ToList();
                var _listCauHinhQuyTrinhId = _listCauHinhQuyTrinh.Select(y => y.Id).ToList();
                var _listCacBuoc = context.CacBuocQuyTrinh
                    .Where(x => _listCauHinhQuyTrinhId.Contains(x.CauHinhQuyTrinhId)).ToList();
                var _listCacBuocId = _listCacBuoc.Select(y => y.Id).ToList();
                var _listPhongBan = context.PhongBanTrongCacBuocQuyTrinh
                    .Where(x => _listCacBuocId.Contains(x.CacBuocQuyTrinhId)).ToList();

                context.CauHinhQuyTrinh.RemoveRange(_listCauHinhQuyTrinh);
                context.CacBuocQuyTrinh.RemoveRange(_listCacBuoc);
                context.PhongBanTrongCacBuocQuyTrinh.RemoveRange(_listPhongBan);

                #endregion

                #region Thêm cấu hình mới

                var listCauHinhQuyTrinh = new List<CauHinhQuyTrinh>();
                var listCacBuocQuyTrinh = new List<CacBuocQuyTrinh>();
                var listPhongBanTrongCacBuocQuyTrinh = new List<PhongBanTrongCacBuocQuyTrinh>();

                parameter.ListCauHinhQuyTrinh.ForEach(cauHinh =>
                {
                    var newCauHinh = new CauHinhQuyTrinh();
                    newCauHinh.Id = Guid.NewGuid();
                    newCauHinh.SoTienTu = cauHinh.SoTienTu;
                    newCauHinh.TenCauHinh = cauHinh.TenCauHinh;
                    newCauHinh.LoaiCauHinh = cauHinh.LoaiCauHinh;
                    newCauHinh.QuyTrinh = cauHinh.QuyTrinh;
                    newCauHinh.QuyTrinhId = quyTrinh.Id;

                    listCauHinhQuyTrinh.Add(newCauHinh);

                    cauHinh.ListCacBuocQuyTrinh.ForEach(buoc =>
                    {
                        var newBuoc = new CacBuocQuyTrinh();
                        newBuoc.Id = Guid.NewGuid();
                        newBuoc.Stt = buoc.Stt;
                        newBuoc.LoaiPheDuyet = buoc.LoaiPheDuyet;
                        newBuoc.CauHinhQuyTrinhId = newCauHinh.Id;

                        listCacBuocQuyTrinh.Add(newBuoc);

                        buoc.ListPhongBanTrongCacBuocQuyTrinh.ForEach(phongBan =>
                        {
                            var newPhongBan = new PhongBanTrongCacBuocQuyTrinh();
                            newPhongBan.Id = Guid.NewGuid();
                            newPhongBan.OrganizationId = phongBan.OrganizationId;
                            newPhongBan.CacBuocQuyTrinhId = newBuoc.Id;

                            listPhongBanTrongCacBuocQuyTrinh.Add(newPhongBan);
                        });
                    });
                });

                context.CauHinhQuyTrinh.AddRange(listCauHinhQuyTrinh);
                context.CacBuocQuyTrinh.AddRange(listCacBuocQuyTrinh);
                context.PhongBanTrongCacBuocQuyTrinh.AddRange(listPhongBanTrongCacBuocQuyTrinh);

                #endregion

                #region Xóa các bước áp dụng trong bảng PhongBanPheDuyetDoiTuong

                //Nếu đối mở thông tin thì xóa bảng phòng ban phê duyệt của đối tượng áp dụng để tiến hành thực hiện quy trình phê duyệt mới
                if (parameter.IsResetDoiTuong == true)
                {
                    var listPheDuyet = context.PhongBanPheDuyetDoiTuong.Where(x => x.DoiTuongApDung == quyTrinh.DoiTuongApDung).ToList();
                    context.PhongBanPheDuyetDoiTuong.RemoveRange(listPheDuyet);
                }

                #endregion

                context.SaveChanges();

                return new UpdateQuyTrinhResult()
                {
                    Status = true,
                    Message = "Lưu thành công",
                    MessageCode = "Lưu thành công",
                    StatusCode = System.Net.HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new UpdateQuyTrinhResult()
                {
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public DeleteQuyTrinhResult DeleteQuyTrinh(DeleteQuyTrinhParameter parameter)
        {
            try
            {
                var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.Id == parameter.Id);
                if (quyTrinh == null)
                {
                    return new DeleteQuyTrinhResult()
                    {
                        Status = false,
                        Message = "Quy trình không tồn tại trên hệ thống",
                        MessageCode = "Quy trình không tồn tại trên hệ thống",
                        StatusCode = System.Net.HttpStatusCode.NotFound,
                    };
                }

                if (quyTrinh.HoatDong)
                {
                    return new DeleteQuyTrinhResult()
                    {
                        Status = false,
                        Message = "Không thể xóa Quy trình có trạng thái Hoạt động",
                        MessageCode = "Không thể xóa Quy trình có trạng thái Hoạt động",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,

                    };
                }

                var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id).ToList();
                var listCauHinhQuyTrinhId = listCauHinhQuyTrinh.Select(y => y.Id).ToList();
                var listCacBuoc = context.CacBuocQuyTrinh
                    .Where(x => listCauHinhQuyTrinhId.Contains(x.CauHinhQuyTrinhId)).ToList();
                var listCacBuocId = listCacBuoc.Select(y => y.Id).ToList();
                var listPhongBan = context.PhongBanTrongCacBuocQuyTrinh
                    .Where(x => listCacBuocId.Contains(x.CacBuocQuyTrinhId)).ToList();

                context.QuyTrinh.Remove(quyTrinh);
                context.CauHinhQuyTrinh.RemoveRange(listCauHinhQuyTrinh);
                context.CacBuocQuyTrinh.RemoveRange(listCacBuoc);
                context.PhongBanTrongCacBuocQuyTrinh.RemoveRange(listPhongBan);
                context.SaveChanges();

                return new DeleteQuyTrinhResult()
                {
                    Status = true,
                    Message = "Xóa thành công",
                    MessageCode = "Xóa thành công",
                    StatusCode = System.Net.HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new DeleteQuyTrinhResult()
                {
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public CheckTrangThaiQuyTrinhResult CheckTrangThaiQuyTrinh(CheckTrangThaiQuyTrinhParameter parameter)
        {
            try
            {
                bool exists = false;

                /* Tại một thời điểm: Đối với 1 loại đối tượng chỉ có một Quy trình có trạng thái Hoạt động */

                //Tạo mới
                if (parameter.Id == null)
                {
                    var count = context.QuyTrinh.Count(x => x.HoatDong && x.DoiTuongApDung == parameter.DoiTuongApDung);
                    
                    if (count >= 1)
                    {
                        exists = true;
                    }
                }
                //Cập nhật
                else
                {
                    var count = context.QuyTrinh.Count(x =>
                        x.HoatDong && x.DoiTuongApDung == parameter.DoiTuongApDung && x.Id != parameter.Id);

                    if (count >= 1)
                    {
                        exists = true;
                    }
                }

                return new CheckTrangThaiQuyTrinhResult()
                {
                    Status = true,
                    Message = "Success",
                    MessageCode = "Success",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Exists = exists
                };
            }
            catch (Exception e)
            {
                return new CheckTrangThaiQuyTrinhResult()
                {
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        public GuiPheDuyetResult GuiPheDuyet(GuiPheDuyetParameter parameter)
        {
            var buoc1 = new CacBuocQuyTrinh();
            var note = new Note();
            try
            {
                int count;
                //Kiểm tra Báo giá đã đc áp dụng quy trình chưa?
                if (parameter.ObjectId != Guid.Empty)
                {
                    count = context.CacBuocApDung.Count(x => x.ObjectId == parameter.ObjectId &&
                                                     x.DoiTuongApDung == parameter.DoiTuongApDung);
                }
                else
                {
                    //Áp dụng cho id là kiểu int
                    count = context.CacBuocApDung.Count(x => x.ObjectNumber == parameter.ObjectNumber &&
                                                       x.DoiTuongApDung == parameter.DoiTuongApDung);
                }

                if (count > 0)
                {
                    return new GuiPheDuyetResult()
                    {
                        Status = false,
                        Message = "Đã được gửi phê duyệt",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = "Đã được gửi phê duyệt"
                    };
                }

                #region Đăng ký quy trình

                //Lấy quy trình
                var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong && 
                                                                    x.DoiTuongApDung == parameter.DoiTuongApDung);
                if (quyTrinh == null)
                {
                    return new GuiPheDuyetResult()
                    {
                        Status = false,
                        Message = "Chưa có quy trình phê duyệt",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = "Chưa có quy trình phê duyệt"
                    };
                }
                //Chọn cấu hình quy trình
                var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                    .OrderByDescending(z => z.SoTienTu).ToList();
                var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                //Nếu chỉ có một cấu hình
                if (listCauHinhQuyTrinh.Count == 1)
                {
                    cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                    
                    //Đề xuất xin nghỉ
                    if (parameter.DoiTuongApDung == 9)
                    {
                        var dxxn = context.DeXuatXinNghi.FirstOrDefault(
                            x => x.DeXuatXinNghiId == parameter.ObjectNumber);
                        if (dxxn == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.NotFound,
                                MessageCode = "Đề xuất xin nghỉ không tồn tại trên hệ thống!"
                            };
                        }

                        var thanhVienPhongBan = context.ThanhVienPhongBan.FirstOrDefault(x =>
                            x.IsPhongBanChinh == true && x.EmployeeId == dxxn.EmployeeId);
                        bool isQuanLy = thanhVienPhongBan != null && (thanhVienPhongBan.IsManager == 1 ? true : false);

                        //Nếu người đề xuất là quản lý
                        if (isQuanLy)
                        {
                            //Lấy cấu hình cho quản lý
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.LoaiCauHinh == 2);

                            if (cauHinhQuyTrinh == null)
                            {
                                return new GuiPheDuyetResult()
                                {
                                    StatusCode = System.Net.HttpStatusCode.NotFound,
                                    MessageCode = "Chưa có cấu hình Đề xuất xin nghỉ cho Quản lý"
                                };
                            }
                        }
                        //Nếu người đề xuất là nhân viên
                        else
                        {
                            //Lấy cấu hình cho nhân viên
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.LoaiCauHinh == 1);

                            if (cauHinhQuyTrinh == null)
                            {
                                return new GuiPheDuyetResult()
                                {
                                    StatusCode = System.Net.HttpStatusCode.NotFound,
                                    MessageCode = "Chưa có cấu hình Đề xuất xin nghỉ cho Nhân viên"
                                };
                            }
                        }

                        //Nếu loại đề xuất là Nghỉ phép
                        if (dxxn.LoaiDeXuatId == 1)
                        {
                            //Kiểm tra số ngày phép còn lại
                            var dxxnModel = CommonHelper.GetInforDeXuatXinNghi(context, new DeXuatXinNghiModel(dxxn));

                            var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == dxxn.EmployeeId);

                            if (dxxnModel.TongNgayNghi > (emp?.SoNgayPhepConLai ?? 0))
                            {
                                return new GuiPheDuyetResult()
                                {
                                    StatusCode = System.Net.HttpStatusCode.NotFound,
                                    MessageCode = "Bạn không có đủ số ngày nghỉ phép"
                                };
                            }

                            emp.SoNgayDaNghiPhep = emp.SoNgayDaNghiPhep + dxxnModel.TongNgayNghi;
                            emp.SoNgayPhepConLai = emp.SoNgayPhepConLai - dxxnModel.TongNgayNghi;
                            context.Employee.Update(emp);
                        }
                    }
                }
                //Nếu có nhiều hơn 1 cấu hình
                else if (listCauHinhQuyTrinh.Count > 1)
                {
                    //Cơ hội
                    if (parameter.DoiTuongApDung == 1)
                    {

                    }
                    //Hồ sơ thầu
                    else if (parameter.DoiTuongApDung == 2)
                    {

                    }
                    //Báo giá
                    else if (parameter.DoiTuongApDung == 3)
                    {
                        var quote = context.Quote.FirstOrDefault(x => x.QuoteId == parameter.ObjectId);
                        if (quote == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                Status = false,
                                Message = "Báo giá không tồn tại trên hệ thống",
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Báo giá không tồn tại trên hệ thống"
                            };
                        }

                        var listSp = context.QuoteDetail.Where(x => x.QuoteId == quote.QuoteId)
                            .Select(y => new SanPhamBaoGia
                            {
                                SoLuong = y.Quantity ?? 0, 
                                DonGia = y.UnitPrice ?? 0,
                                TyGia = y.ExchangeRate ?? 0,
                                ThanhTienNhanCong = y.UnitLaborNumber * y.UnitLaborPrice,
                                LoaiChietKhau = y.DiscountType ?? true,
                                GiaTriChietKhau = y.DiscountValue ?? 0,
                                PhanTramThue = y.Vat ?? 0
                            }).ToList();
                        var tongChiPhi = context.QuoteCostDetail.Where(x => x.QuoteId == quote.QuoteId &&
                                                                            x.IsInclude == false)
                            .Sum(s => s.Quantity * s.UnitPrice) ?? 0;

                        var tongThanhToan = TongThanhToanBaoGia(quote.DiscountType ?? true,
                            quote.DiscountValue ?? 0, listSp, tongChiPhi);

                        cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.SoTienTu <= tongThanhToan);
                    }
                    //Hợp đồng
                    else if (parameter.DoiTuongApDung == 4)
                    {

                    }
                    //Đơn hàng bán
                    else if (parameter.DoiTuongApDung == 5)
                    {

                    }
                    //Hóa đơn
                    else if (parameter.DoiTuongApDung == 6)
                    {

                    }
                    //Đề xuất mua hàng
                    else if (parameter.DoiTuongApDung == 7)
                    {

                    }
                    //Đơn hàng mua
                    else if (parameter.DoiTuongApDung == 8)
                    {

                    }
                    //Đề xuất xin nghỉ
                    else if (parameter.DoiTuongApDung == 9)
                    {

                        var dxxn = context.DeXuatXinNghi.FirstOrDefault(
                            x => x.DeXuatXinNghiId == parameter.ObjectNumber);
                        if (dxxn == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.NotFound,
                                MessageCode = "Đề xuất xin nghỉ không tồn tại trên hệ thống!"
                            };
                        }

                        var thanhVienPhongBan = context.ThanhVienPhongBan.FirstOrDefault(x =>
                            x.IsPhongBanChinh == true && x.EmployeeId == dxxn.EmployeeId);
                        bool isQuanLy = thanhVienPhongBan != null && (thanhVienPhongBan.IsManager == 1 ? true : false);

                        //Nếu người đề xuất là quản lý
                        if (isQuanLy)
                        {
                            //Lấy cấu hình cho quản lý
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.LoaiCauHinh == 2);

                            if (cauHinhQuyTrinh == null)
                            {
                                return new GuiPheDuyetResult()
                                {
                                    StatusCode = System.Net.HttpStatusCode.NotFound,
                                    MessageCode = "Chưa có cấu hình Đề xuất xin nghỉ cho Quản lý"
                                };
                            }
                        }
                        //Nếu người đề xuất là nhân viên
                        else
                        {
                            //Lấy cấu hình cho nhân viên
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.LoaiCauHinh == 1);

                            if (cauHinhQuyTrinh == null)
                            {
                                return new GuiPheDuyetResult()
                                {
                                    StatusCode = System.Net.HttpStatusCode.NotFound,
                                    MessageCode = "Chưa có cấu hình Đề xuất xin nghỉ cho Nhân viên"
                                };
                            }
                        }

                        //Nếu loại đề xuất là Nghỉ phép
                        if (dxxn.LoaiDeXuatId == 1)
                        {
                            //Kiểm tra số ngày phép còn lại
                            var dxxnModel = CommonHelper.GetInforDeXuatXinNghi(context, new DeXuatXinNghiModel(dxxn));

                            var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == dxxn.EmployeeId);

                            if (dxxnModel.TongNgayNghi > (emp?.SoNgayPhepConLai ?? 0))
                            {
                                return new GuiPheDuyetResult()
                                {
                                    StatusCode = System.Net.HttpStatusCode.NotFound,
                                    MessageCode = "Bạn không có đủ số ngày nghỉ phép"
                                };
                            }

                            emp.SoNgayDaNghiPhep = emp.SoNgayDaNghiPhep + dxxnModel.TongNgayNghi;
                            emp.SoNgayPhepConLai = emp.SoNgayPhepConLai - dxxnModel.TongNgayNghi;
                            context.Employee.Update(emp);
                        }
                    }
                    //Đề xuất tăng lương
                    else if (parameter.DoiTuongApDung == 10)
                    {
                        var deXuatTangLuong = context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == parameter.ObjectNumber);
                        if (deXuatTangLuong == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đề xuất tăng lương không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    //Đề xuất chức vụ
                    else if (parameter.DoiTuongApDung == 11)
                    {
                        var deXuatChucVu = context.DeXuatThayDoiChucVu.FirstOrDefault(x => x.DeXuatThayDoiChucVuId == parameter.ObjectNumber);
                        if (deXuatChucVu == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đề xuất thay đổi chức vụ không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    //Đề xuất kế hoạch OT
                    else if (parameter.DoiTuongApDung == 12)
                    {
                        var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);
                        if (deXuatKeHoachOT == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đề xuất thay đổi chức vụ không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    //Đăng ký OT
                    else if (parameter.DoiTuongApDung == 13)
                    {
                        var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);
                        if (deXuatKeHoachOT == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đề xuất thay đổi chức vụ không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    //Kỳ lương
                    else if (parameter.DoiTuongApDung == 14)
                    {
                        var kyLuong = context.KyLuong.FirstOrDefault(
                            x => x.KyLuongId == parameter.ObjectNumber);
                        if (kyLuong == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.NotFound,
                                MessageCode = "Kỳ lương không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    //Yêu cầu cấp phát
                    else if (parameter.DoiTuongApDung == 20)
                    {
                        var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.ObjectNumber);
                        if (yeuCau == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Yêu cầu cấp phát tài sản không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    // Đề nghị tạm ứng
                    else if (parameter.DoiTuongApDung == 21)
                    {
                        var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber);
                        if (deNghi == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đề nghị tạm ứng không tồn tại trên hệ thống!"
                            };
                        }
                    }
                    // Đề nghị hoàn ứng
                    else if (parameter.DoiTuongApDung == 22)
                    {
                        var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber);
                        if (deNghi == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                MessageCode = "Đề nghị hoàn ứng không tồn tại trên hệ thống!",
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            };
                        }
                    }
                    // Đề xuất công tác
                    else if (parameter.DoiTuongApDung == 30)
                    {
                        var deXuatCongTac = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == parameter.ObjectNumber);
                        if (deXuatCongTac == null)
                        {
                            return new GuiPheDuyetResult()
                            {
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đề xuất công tác không tồn tại trên hệ thống!"
                            };
                        }
                    }
                }
                //Nếu không có cấu hình
                else
                {
                    return new GuiPheDuyetResult()
                    {
                        Status = false,
                        Message = "Quy trình chưa có cấu hình quy trình phê duyệt",
                        MessageCode = "Quy trình chưa có cấu hình quy trình phê duyệt",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    };
                }

                if (cauHinhQuyTrinh == null)
                {
                    return new GuiPheDuyetResult()
                    {
                        MessageCode = "Quy trình chưa có cấu hình quy trình phê duyệt",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    };
                }

                buoc1 = context.CacBuocQuyTrinh.FirstOrDefault(x =>
                    x.CauHinhQuyTrinhId == cauHinhQuyTrinh.Id && x.Stt == 1);
                if (buoc1 == null)
                {
                    return new GuiPheDuyetResult()
                    {
                        MessageCode = "Quy trình không tồn tại bước 1",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    };
                }

                //Kiểm tra trạng thái của đối tượng trước khi Gửi phê duyệt
                var checkTrangThai = KiemTraTrangThaiDoiTuongGuiPheDuyet(parameter.ObjectId, parameter.ObjectNumber,
                    parameter.DoiTuongApDung);
                if (!checkTrangThai)
                {
                    return new GuiPheDuyetResult()
                    {
                        MessageCode = "Trạng thái hiện tại không thể gửi phê duyệt",
                        StatusCode = System.Net.HttpStatusCode.Conflict,
                    };
                }

                //Thêm vào bảng mapping list phòng ban của người phê duyệt
                XuLyPhongBanPheDuyetDoiTuong(parameter.DoiTuongApDung, cauHinhQuyTrinh, parameter.ObjectNumber,
                    parameter.ObjectId);

                //Chuyển trạng thái đối tượng => Chờ phê duyệt
                ChuyenTrangThaiDoiTuong(parameter.ObjectId.Value, parameter.DoiTuongApDung, parameter.UserId, 1, parameter.ObjectNumber.Value);

                //Thêm ghi chú
                ThemGhiChu(parameter.ObjectId.Value, parameter.DoiTuongApDung, parameter.UserId, 1, null, parameter.ObjectNumber.Value);

                var cacBuocApDung = new CacBuocApDung();
                cacBuocApDung.Id = Guid.NewGuid();
                cacBuocApDung.ObjectId = parameter.ObjectId.Value;
                cacBuocApDung.DoiTuongApDung = parameter.DoiTuongApDung;
                cacBuocApDung.QuyTrinhId = quyTrinh.Id;
                cacBuocApDung.CauHinhQuyTrinhId = cauHinhQuyTrinh.Id;
                cacBuocApDung.CacBuocQuyTrinhId = buoc1.Id;
                cacBuocApDung.Stt = buoc1.Stt;
                cacBuocApDung.LoaiPheDuyet = buoc1.LoaiPheDuyet;
                cacBuocApDung.TrangThai = 0;
                cacBuocApDung.ObjectNumber = parameter.ObjectNumber;

                context.CacBuocApDung.Add(cacBuocApDung);
                context.SaveChanges();

                #endregion
            }
            catch (Exception e)
            {
                return new GuiPheDuyetResult()
                {
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Status = false,
                    Message = e.Message
                };
            }

            #region Gửi email

            //Gửi mail: áp dụng cho objectnumber != null
            if (parameter.ObjectNumber != null && parameter.ObjectNumber != 0)
            {
                //Lấy thông tin Người phê duyệt
                var listEmail = GetListEmail(parameter.UserId, buoc1.LoaiPheDuyet, buoc1);

                // Đề xuất xin nghỉ
                if (parameter.DoiTuongApDung == 9)
                {
                    var deXuat = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.RequestDetail, "APPRO_REQUEST", deXuat,
                        deXuat, true, null, null, listEmail);
                }

                // Đề xuất Tăng lương
                if (parameter.DoiTuongApDung == 10)
                {
                    var deXuatTangLuong = context.DeXuatTangLuong.FirstOrDefault(x =>
                        x.DeXuatTangLuongId == parameter.ObjectNumber && x.Active == true);

                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatTangLuongDetail, "SEND_APPROVAL",
                        deXuatTangLuong, deXuatTangLuong, true, null, null, listEmail);
                }

                // Đề xuất chức vụ
                if (parameter.DoiTuongApDung == 11)
                {
                    var deXuatChucVu = context.DeXuatThayDoiChucVu.FirstOrDefault(x =>
                        x.DeXuatThayDoiChucVuId == parameter.ObjectNumber && x.Active == true);

                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatChucVuDetail, "SEND_APPROVAL",
                        deXuatChucVu, deXuatChucVu, true, null, null, listEmail);
                }

                // Đề xuất kế hoạch OT
                if (parameter.DoiTuongApDung == 12)
                {
                    var keHoachOt = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatKeHoachOTDetail, "SEND_APPROVAL",
                        keHoachOt, keHoachOt, true, null, null, listEmail);
                }

                // Đề xuất đăng ký OT
                if (parameter.DoiTuongApDung == 13)
                {
                    var keHoachOt = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatDangKyOTDetail, "SEND_APPROVAL",
                        keHoachOt, keHoachOt, true, null, null, listEmail);
                }

                // Kỳ lương
                if (parameter.DoiTuongApDung == 14)
                {
                    var kyLuong = context.KyLuong.FirstOrDefault(x => x.KyLuongId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.KyLuong, "SEND_APPROVAL",
                        kyLuong, kyLuong, true, null, null, listEmail);
                }

                // Đề xuất công tác
                if (parameter.DoiTuongApDung == 30)
                {
                    var deXuatCongTac = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatCongTac, "DXCT_REQUESTORACCEPT",
                        deXuatCongTac, deXuatCongTac, true, note, null, listEmail);
                }

                // Đề xuất tạm ứng
                if (parameter.DoiTuongApDung == 21)
                {
                    var deXuatCongTac = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.DeNghiTamUng, "DXTU_REQUESTORACCEPT",
                        deXuatCongTac, deXuatCongTac, true, note, null, listEmail);
                }

                // Đề xuất hoàn ứng
                if (parameter.DoiTuongApDung == 22)
                {
                    var deXuatCongTac = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.DeNghiHoanUng, "DXHU_REQUESTORACCEPT",
                        deXuatCongTac, deXuatCongTac, true, note, null, listEmail);
                }

                // Đề xuất cấp phát
                if (parameter.DoiTuongApDung == 20)
                {
                    var deXuatCongTac = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.ObjectNumber);

                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatCapPhatTs, "DXCPTS_REQUESTORACCEPT",
                        deXuatCongTac, deXuatCongTac, true, note, null, listEmail);
                }
            }

            #endregion

            return new GuiPheDuyetResult()
            {
                MessageCode = "Gửi phê duyệt thành công",
                StatusCode = System.Net.HttpStatusCode.OK,
            };
        }

        public PheDuyetResult PheDuyet(PheDuyetParameter parameter)
        {
            object doiTuongModel = new object();
            string typeModel = "";
            string actionCode = "";
            bool isError = false;
            string message = "";
            int tienTrinhPheDuyet = -1; //1: Là bước cuối cùng, 0; Không phải là bước cuối cùng
            var listEmail = new List<string>();

            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                if (user == null)
                {
                    return new PheDuyetResult()
                    {
                        Status = false,
                        Message = "Người phê duyệt không tồn tại trên hệ thống",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = "Người phê duyệt không tồn tại trên hệ thống"
                    };
                }

                //Cơ hội
                if (parameter.DoiTuongApDung == 1)
                {

                }
                //Hồ sơ thầu
                else if (parameter.DoiTuongApDung == 2)
                {

                }
                //Báo giá
                else if (parameter.DoiTuongApDung == 3)
                {
                    var quote = context.Quote.FirstOrDefault(x => x.QuoteId == parameter.ObjectId);
                    if (quote == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            Status = false,
                            Message = "Báo giá không tồn tại trên hệ thống",
                            MessageCode = "Báo giá không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy bước hiện tại của Đối tượng
                    var buocHienTai = context.CacBuocApDung.Where(x => x.ObjectId == parameter.ObjectId &&
                                                                       x.DoiTuongApDung == parameter.DoiTuongApDung &&
                                                                       x.TrangThai == 0)
                        .OrderByDescending(z => z.Stt)
                        .FirstOrDefault();

                    if (buocHienTai == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Phê duyệt thất bại, không tồn tại bước phê duyệt",
                            Status = false,
                            Message = "Phê duyệt thất bại, không tồn tại bước phê duyệt"
                        };
                    }

                    //Lấy Quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.Id == buocHienTai.QuyTrinhId);
                    if (quyTrinh == null)
                    {
                        return new PheDuyetResult()
                        {
                            Status = false,
                            Message = "Quy trình không tồn tại",
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Quy trình không tồn tại"
                        };
                    }

                    //Lấy list Các bước trong Quy trình theo Cấu hình
                    var listCacBuoc = context.CacBuocQuyTrinh
                        .Where(x => x.CauHinhQuyTrinhId == buocHienTai.CauHinhQuyTrinhId).OrderByDescending(z => z.Stt)
                        .ToList();

                    int tongSoBuoc = listCacBuoc.Count;

                    //Nếu là phê duyệt trưởng bộ phận
                    if (buocHienTai.LoaiPheDuyet == 1)
                    {
                        if (buocHienTai.TrangThai == 1)
                        {
                            return new PheDuyetResult()
                            {
                                Status = false,
                                Message = "Bước hiện tại được phê duyệt",
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Bước hiện tại được phê duyệt"
                            };
                        }

                        //Đổi trạng thái của bước hiện tại => Đã xong
                        buocHienTai.TrangThai = 1;
                        context.CacBuocApDung.Update(buocHienTai);

                        //Nếu đây là bước cuối cùng của Quy trình => Phê duyệt
                        if (buocHienTai.Stt == tongSoBuoc)
                        {
                            ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 2, parameter.ObjectNumber.Value);
                        }
                        //Nếu không phải bước cuối cùng
                        else
                        {
                            var buocTiepTheo = listCacBuoc.FirstOrDefault(x => x.Stt == buocHienTai.Stt + 1);

                            //Thêm bước tiếp vào lịch sử
                            var cacBuocApDung = new CacBuocApDung();
                            cacBuocApDung.Id = Guid.NewGuid();
                            cacBuocApDung.ObjectId = parameter.ObjectId;
                            cacBuocApDung.DoiTuongApDung = parameter.DoiTuongApDung;
                            cacBuocApDung.QuyTrinhId = quyTrinh.Id;
                            cacBuocApDung.CauHinhQuyTrinhId = buocTiepTheo.CauHinhQuyTrinhId;
                            cacBuocApDung.CacBuocQuyTrinhId = buocTiepTheo.Id;
                            cacBuocApDung.Stt = buocTiepTheo.Stt;
                            cacBuocApDung.LoaiPheDuyet = buocTiepTheo.LoaiPheDuyet;
                            cacBuocApDung.TrangThai = 0;

                            context.CacBuocApDung.Add(cacBuocApDung);
                        }

                        //Thêm vào lịch sử
                        var lichSuPheDuyet = new LichSuPheDuyet();
                        lichSuPheDuyet.Id = Guid.NewGuid();
                        lichSuPheDuyet.ObjectId = parameter.ObjectId;
                        lichSuPheDuyet.DoiTuongApDung = parameter.DoiTuongApDung;
                        lichSuPheDuyet.NgayTao = DateTime.Now;
                        lichSuPheDuyet.EmployeeId = user.EmployeeId.Value;
                        lichSuPheDuyet.OrganizationId = null;
                        lichSuPheDuyet.LyDo = parameter.Mota;
                        lichSuPheDuyet.TrangThai = 1;

                        context.LichSuPheDuyet.Add(lichSuPheDuyet);
                    }
                    //Nếu là phòng ban phê duyệt
                    else if (buocHienTai.LoaiPheDuyet == 2)
                    {
                        //Lấy các phòng ban đã phê duyệt bước hiện tại
                        var listDonViIdDaPheDuyet = context.PhongBanApDung
                            .Where(x => x.CacBuocApDungId == buocHienTai.Id && 
                                        x.CacBuocQuyTrinhId == buocHienTai.CacBuocQuyTrinhId)
                            .Select(y => y.OrganizationId).ToList();

                        //Lấy các phòng chưa phê duyệt ở bước hiện tại
                        var listDonViId = context.PhongBanTrongCacBuocQuyTrinh
                            .Where(x => x.CacBuocQuyTrinhId == buocHienTai.CacBuocQuyTrinhId &&
                                        !listDonViIdDaPheDuyet.Contains(x.OrganizationId))
                            .Select(y => y.OrganizationId).ToList();

                        //Lấy phòng ban mà người phê duyệt là Trưởng bộ phận
                        var listDonViId_NguoiPheDuyet =
                            context.ThanhVienPhongBan.Where(x => x.EmployeeId == user.EmployeeId &&
                                                                 x.IsManager == 1)
                                .Select(y => y.OrganizationId).ToList();

                        //Lấy phòng ban sẽ phê duyệt bước hiện tại
                        var listDonViIdPheDuyet = listDonViId_NguoiPheDuyet.Where(x => listDonViId.Contains(x)).ToList();
                        if (listDonViIdPheDuyet.Count == 0)
                        {
                            return new PheDuyetResult()
                            {
                                Status = false,
                                Message = "Phê duyệt thất bại, phòng ban người dùng không hợp lệ",
                                StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                                MessageCode = "Phê duyệt thất bại, phòng ban người dùng không hợp lệ"
                            };
                        }

                        var listPhongBanApDung = new List<PhongBanApDung>();
                        var listLichSuPheDuyet = new List<LichSuPheDuyet>();
                        listDonViIdPheDuyet.ForEach(donViId =>
                        {
                            var phongBanApDung = new PhongBanApDung();
                            phongBanApDung.Id = Guid.NewGuid();
                            phongBanApDung.CacBuocApDungId = buocHienTai.Id;
                            phongBanApDung.OrganizationId = donViId;
                            phongBanApDung.CacBuocQuyTrinhId = buocHienTai.CacBuocQuyTrinhId;

                            listPhongBanApDung.Add(phongBanApDung);

                            var lichSuPheDuyet = new LichSuPheDuyet();
                            lichSuPheDuyet.Id = Guid.NewGuid();
                            lichSuPheDuyet.ObjectId = parameter.ObjectId;
                            lichSuPheDuyet.DoiTuongApDung = parameter.DoiTuongApDung;
                            lichSuPheDuyet.NgayTao = DateTime.Now;
                            lichSuPheDuyet.EmployeeId = user.EmployeeId.Value;
                            lichSuPheDuyet.OrganizationId = donViId;
                            lichSuPheDuyet.LyDo = parameter.Mota;
                            lichSuPheDuyet.TrangThai = 1;

                            listLichSuPheDuyet.Add(lichSuPheDuyet);
                        });

                        context.PhongBanApDung.AddRange(listPhongBanApDung);
                        context.LichSuPheDuyet.AddRange(listLichSuPheDuyet);

                        // Nếu tất cả phòng ban đều đã phê duyệt:
                        // (Số phòng ban chưa phê duyệt == Số phòng ban phê duyệt ở bước hiện tại)
                        if (listDonViId.Count == listPhongBanApDung.Count)
                        {
                            //Đổi trạng thái của bước hiện tại => Đã xong
                            buocHienTai.TrangThai = 1;
                            context.CacBuocApDung.Update(buocHienTai);

                            //Nếu đây là bước cuối cùng của Quy trình => Phê duyệt
                            if (buocHienTai.Stt == tongSoBuoc)
                            {
                                ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId,
                                   2, parameter.ObjectNumber.Value);
                            }
                            //Nếu không phải bước cuối cùng
                            else
                            {
                                var buocTiepTheo = listCacBuoc.FirstOrDefault(x => x.Stt == buocHienTai.Stt + 1);

                                //Thêm bước tiếp vào lịch sử
                                var cacBuocApDung = new CacBuocApDung();
                                cacBuocApDung.Id = Guid.NewGuid();
                                cacBuocApDung.ObjectId = parameter.ObjectId;
                                cacBuocApDung.DoiTuongApDung = parameter.DoiTuongApDung;
                                cacBuocApDung.QuyTrinhId = quyTrinh.Id;
                                cacBuocApDung.CauHinhQuyTrinhId = buocTiepTheo.CauHinhQuyTrinhId;
                                cacBuocApDung.CacBuocQuyTrinhId = buocTiepTheo.Id;
                                cacBuocApDung.Stt = buocTiepTheo.Stt;
                                cacBuocApDung.LoaiPheDuyet = buocTiepTheo.LoaiPheDuyet;
                                cacBuocApDung.TrangThai = 0;

                                context.CacBuocApDung.Add(cacBuocApDung);
                            }
                        }
                    }

                    //Thêm ghi chú
                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 2,
                        parameter.Mota, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Hợp đồng
                else if (parameter.DoiTuongApDung == 4)
                {

                }
                //Đơn hàng bán
                else if (parameter.DoiTuongApDung == 5)
                {

                }
                //Hóa đơn
                else if (parameter.DoiTuongApDung == 6)
                {

                }
                //Đề xuất mua hàng
                else if (parameter.DoiTuongApDung == 7)
                {

                }
                //Đơn hàng mua
                else if (parameter.DoiTuongApDung == 8)
                {

                }
                //Đề xuất xin nghỉ
                else if (parameter.DoiTuongApDung == 9)
                {
                    var dxxn = context.DeXuatXinNghi.FirstOrDefault(x =>
                        x.DeXuatXinNghiId == parameter.ObjectNumber.Value);
                    if (dxxn == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất không tồn tại trên hệ thống"
                        };
                    }

                    //Nếu trạng thái khác Chờ phê duyệt
                    if (dxxn.TrangThaiId != 2)
                    {
                        return new PheDuyetResult()
                        {
                            MessageCode = "Chỉ được phê duyệt đề xuất ở trạng thái Chờ phê duyệt",
                            StatusCode = System.Net.HttpStatusCode.Conflict
                        };
                    }

                    doiTuongModel = dxxn;
                    typeModel = TypeModel.RequestDetail;
                    actionCode = "APPRO_REQUEST";

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "APPRO_REQUEST_FINAL";
                        UpdateDuLieuChamCong(dxxn, parameter.UserId);
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                //Đề xuất tăng lương
                else if (parameter.DoiTuongApDung == 10)
                {
                    var deXuatTangLuong = context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == parameter.ObjectNumber.Value);
                    if (deXuatTangLuong == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất tăng lương không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deXuatTangLuong;
                    typeModel = TypeModel.DeXuatTangLuongDetail;
                    actionCode = "SEND_APPROVAL"; // Gửi thông báo cần phê duyệt đến bước tiếp theo

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "APPROVAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                //Đề xuất chức vụ
                else if (parameter.DoiTuongApDung == 11)
                {
                    var deXuatChucVu = context.DeXuatThayDoiChucVu.FirstOrDefault(x => x.DeXuatThayDoiChucVuId == parameter.ObjectNumber.Value);
                    if (deXuatChucVu == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất thay đổi chức vụ không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deXuatChucVu;
                    typeModel = TypeModel.DeXuatChucVuDetail;
                    actionCode = "SEND_APPROVAL"; // Gửi thông báo cần phê duyệt đến bước tiếp theo

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "APPROVAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                //Đề xuất kế hoạch OT
                else if (parameter.DoiTuongApDung == 12)
                {
                    var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber.Value);
                    if (deXuatKeHoachOT == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deXuatKeHoachOT;
                    typeModel = TypeModel.DeXuatKeHoachOTDetail;
                    actionCode = "SEND_APPROVAL"; // Gửi thông báo cần phê duyệt đến bước tiếp theo

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "APPROVAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                //đăng ký OT
                else if (parameter.DoiTuongApDung == 13)
                {
                    var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber.Value);
                    if (deXuatKeHoachOT == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deXuatKeHoachOT;
                    typeModel = TypeModel.DeXuatDangKyOTDetail;
                    actionCode = "SEND_APPROVAL"; // Gửi thông báo cần phê duyệt đến bước tiếp theo

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "APPROVAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                //Kỳ lương
                else if (parameter.DoiTuongApDung == 14)
                {
                    var kyLuong = context.KyLuong.FirstOrDefault(x =>
                        x.KyLuongId == parameter.ObjectNumber.Value);
                    if (kyLuong == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Kỳ lương không tồn tại trên hệ thống"
                        };
                    }

                    //Nếu trạng thái khác Chờ phê duyệt
                    if (kyLuong.TrangThai != 2)
                    {
                        return new PheDuyetResult()
                        {
                            MessageCode = "Chỉ được phê duyệt đề xuất ở trạng thái Chờ phê duyệt",
                            StatusCode = System.Net.HttpStatusCode.Conflict
                        };
                    }

                    doiTuongModel = kyLuong;
                    typeModel = TypeModel.KyLuong;
                    actionCode = "SEND_APPROVAL";

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "APPRO_REQUEST_FINAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                //Yêu cầu cấp phát
                else if (parameter.DoiTuongApDung == 20)
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.ObjectNumber.Value);
                    if (yeuCau == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = yeuCau;
                    typeModel = TypeModel.DeXuatCapPhatTs;
                    actionCode = "DXCPTS_REQUESTORACCEPT"; // Gửi thông báo cần phê duyệt đến bước tiếp theo

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "DXCPTS_ACCEPTFINAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                // Đề nghị tạm ứng
                else if (parameter.DoiTuongApDung == 21)
                {
                    var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber.Value);
                    if (deNghi == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deNghi;
                    typeModel = TypeModel.DeNghiTamUng;
                    actionCode = "DXTU_REQUESTORACCEPT"; // Gửi thông báo cần phê duyệt đến bước tiếp theo



                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "DXTU_ACCEPTFINAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                // Đề nghị hoàn ứng
                else if (parameter.DoiTuongApDung == 22)
                {
                    var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber.Value);
                    if (deNghi == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deNghi;
                    typeModel = TypeModel.DeNghiHoanUng;
                    actionCode = "DXHU_REQUESTORACCEPT"; // Gửi thông báo cần phê duyệt đến bước tiếp theo


                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "DXHU_ACCEPTFINAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }
                // đề xuất công tác
                else if (parameter.DoiTuongApDung == 30)
                {
                    var deXuatCongTac = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == parameter.ObjectNumber.Value);
                    if (deXuatCongTac == null)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất công tác không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deXuatCongTac;
                    typeModel = TypeModel.DeXuatCongTac;
                    actionCode = "DXCT_REQUESTORACCEPT"; // Gửi thông báo cần phê duyệt đến bước tiếp theo

                    XuLyPheDuyet(out isError, out message, out tienTrinhPheDuyet, out listEmail, user,
                        parameter.ObjectId, parameter.ObjectNumber, parameter.Mota, parameter.DoiTuongApDung,
                        doiTuongModel);

                    //Nếu là bước cuối cùng
                    if (tienTrinhPheDuyet == 1)
                    {
                        actionCode = "DXCT_ACCEPTFINAL";
                    }

                    if (isError)
                    {
                        return new PheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = message
                        };
                    }
                }

                context.SaveChanges();
            }
            catch (Exception e)
            {
                return new PheDuyetResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message
                };
            }

            #region Gửi email khi phê duyệt

            //Nếu là bước cuối cùng
            if (tienTrinhPheDuyet == 1)
            {
                //Gửi mail phê duyệt cho người phụ trách (người tạo) đối tượng
                NotificationHelper.AccessNotification(context, typeModel, actionCode,
                    doiTuongModel, doiTuongModel, true, null, null, new List<string>());
            }
            //Nếu không phải là bước cuối cùng
            else if (tienTrinhPheDuyet == 0)
            {
                //Gửi mail phê duyệt cho người phê duyệt của đối tượng áp dụng
                NotificationHelper.AccessNotification(context, typeModel, actionCode,
                    doiTuongModel, doiTuongModel, true, null, null, listEmail);
            }

            #endregion

            return new PheDuyetResult()
            {
                StatusCode = System.Net.HttpStatusCode.OK,
                Status = true,
                Message = "Phê duyệt thành công",
                MessageCode = "Phê duyệt thành công"
            };
        }

        public HuyYeuCauPheDuyetResult HuyYeuCauPheDuyet(HuyYeuCauPheDuyetParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                if (user == null)
                {
                    return new HuyYeuCauPheDuyetResult()
                    {
                        Status = false,
                        Message = "Người dùng không tồn tại trên hệ thống",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = "Người dùng không tồn tại trên hệ thống"
                    };
                }

                //Cơ hội
                if (parameter.DoiTuongApDung == 1)
                {

                }
                //Hồ sơ thầu
                else if (parameter.DoiTuongApDung == 2)
                {

                }
                //Báo giá
                else if (parameter.DoiTuongApDung == 3)
                {
                    var quote = context.Quote.FirstOrDefault(x => x.QuoteId == parameter.ObjectId);
                    if (quote == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            Status = false,
                            Message = "Báo giá không tồn tại trên hệ thống",
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Báo giá không tồn tại trên hệ thống"
                        };
                    }

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectId == parameter.ObjectId &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Hợp đồng
                else if (parameter.DoiTuongApDung == 4)
                {

                }
                //Đơn hàng bán
                else if (parameter.DoiTuongApDung == 5)
                {

                }
                //Hóa đơn
                else if (parameter.DoiTuongApDung == 6)
                {

                }
                //Đề xuất mua hàng
                else if (parameter.DoiTuongApDung == 7)
                {

                }
                //Đơn hàng mua
                else if (parameter.DoiTuongApDung == 8)
                {

                }
                //Đề xuất xin nghỉ
                else if (parameter.DoiTuongApDung == 9)
                {

                }
                //Đề xuất tăng lương
                else if (parameter.DoiTuongApDung == 10)
                {
                    var deXuatTangLuong = context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == parameter.ObjectNumber.Value);
                    if (deXuatTangLuong == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất tăng lương không tồn tại trên hệ thống"
                        };
                    }

                    #region Gửi email cho người phê duyệt ở bước hiện tại trước khi reset quy trình

                    //Lấy bước hiện tại
                    var buocHienTai = context.CacBuocApDung.FirstOrDefault(x =>
                        x.TrangThai == 0 && x.ObjectNumber == parameter.ObjectNumber &&
                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    var buoc = context.CacBuocQuyTrinh
                        .FirstOrDefault(x => x.CauHinhQuyTrinhId == buocHienTai.CauHinhQuyTrinhId &&
                                             x.Stt == buocHienTai.Stt);

                    //Lấy thông tin Người phê duyệt
                    var listEmail = GetListEmail(parameter.UserId, buoc.LoaiPheDuyet, buoc);

                    //Gửi mail thông báo đã hủy phê duyệt cho đề xuất tăng lương.
                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatTangLuongDetail, "CANCEL_APPROVAL",
                        deXuatTangLuong, deXuatTangLuong, true, null, null, listEmail);

                    #endregion

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Đề xuất chức vụ
                else if (parameter.DoiTuongApDung == 11)
                {
                    var deXuatChucVu = context.DeXuatThayDoiChucVu.FirstOrDefault(x => x.DeXuatThayDoiChucVuId == parameter.ObjectNumber.Value);
                    if (deXuatChucVu == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất thay đổi chức vụ không tồn tại trên hệ thống"
                        };
                    }

                    #region Gửi email cho người phê duyệt ở bước hiện tại trước khi reset quy trình

                    //Lấy bước hiện tại
                    var buocHienTai = context.CacBuocApDung.FirstOrDefault(x =>
                        x.TrangThai == 0 && x.ObjectNumber == parameter.ObjectNumber &&
                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    var buoc = context.CacBuocQuyTrinh
                        .FirstOrDefault(x => x.CauHinhQuyTrinhId == buocHienTai.CauHinhQuyTrinhId &&
                                             x.Stt == buocHienTai.Stt);

                    //Lấy thông tin Người phê duyệt
                    var listEmail = GetListEmail(parameter.UserId, buoc.LoaiPheDuyet, buoc);

                    //Gửi mail thông báo đã hủy phê duyệt cho đề xuất chức vụ.
                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatChucVuDetail, "CANCEL_APPROVAL",
                        deXuatChucVu, deXuatChucVu, true, null, null, listEmail);

                    #endregion

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Đề xuất kế hoạch OT
                else if (parameter.DoiTuongApDung == 12)
                {
                    var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber.Value);
                    if (deXuatKeHoachOT == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống"
                        };
                    }

                    #region Gửi email cho người phê duyệt ở bước hiện tại trước khi reset quy trình

                    //Lấy bước hiện tại
                    var buocHienTai = context.CacBuocApDung.FirstOrDefault(x =>
                        x.TrangThai == 0 && x.ObjectNumber == parameter.ObjectNumber &&
                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    var buoc = context.CacBuocQuyTrinh
                        .FirstOrDefault(x => x.CauHinhQuyTrinhId == buocHienTai.CauHinhQuyTrinhId &&
                                             x.Stt == buocHienTai.Stt);

                    //Lấy thông tin Người phê duyệt
                    var listEmail = GetListEmail(parameter.UserId, buoc.LoaiPheDuyet, buoc);

                    //Gửi mail thông báo đã hủy phê duyệt cho đề xuất kế hoạch OT
                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatKeHoachOTDetail, "CANCEL_APPROVAL", deXuatKeHoachOT,
                        deXuatKeHoachOT, true, null, null, listEmail);

                    #endregion

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Đề xuất đăng ký OT
                else if (parameter.DoiTuongApDung == 13)
                {
                    var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber.Value);
                    if (deXuatKeHoachOT == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống"
                        };
                    }

                    #region Gửi email cho người phê duyệt ở bước hiện tại trước khi reset quy trình

                    //Lấy bước hiện tại
                    var buocHienTai = context.CacBuocApDung.FirstOrDefault(x =>
                        x.TrangThai == 0 && x.ObjectNumber == parameter.ObjectNumber &&
                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    var buoc = context.CacBuocQuyTrinh
                        .FirstOrDefault(x => x.CauHinhQuyTrinhId == buocHienTai.CauHinhQuyTrinhId &&
                                             x.Stt == buocHienTai.Stt);

                    //Lấy thông tin Người phê duyệt
                    var listEmail = GetListEmail(parameter.UserId, buoc.LoaiPheDuyet, buoc);

                    //Gửi mail thông báo đã hủy phê duyệt cho đề xuất đăng ký OT.
                    NotificationHelper.AccessNotification(context, TypeModel.DeXuatDangKyOTDetail, "CANCEL_APPROVAL",
                        deXuatKeHoachOT, deXuatKeHoachOT, true, null, null, listEmail);

                    #endregion

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Đề xuất công tác
                else if (parameter.DoiTuongApDung == 30)
                {
                    var deXuatCongTac = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == parameter.ObjectNumber.Value);
                    if (deXuatCongTac == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất công tác không tồn tại trên hệ thống"
                        };
                    }

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                //Yêu cầu cấp phát
                else if (parameter.DoiTuongApDung == 20)
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.ObjectNumber.Value);
                    if (yeuCau == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }
                // Đề nghị tạm ứng (21) hoặc Đề nghị hoàn ứng (22)
                else if (parameter.DoiTuongApDung == 21 || parameter.DoiTuongApDung == 22)
                {
                    var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber.Value);
                    if (deNghi == null)
                    {
                        return new HuyYeuCauPheDuyetResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung = context.CacBuocApDung.Where(x => x.ObjectNumber == parameter.ObjectNumber.Value &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 4, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 4, null, parameter.ObjectNumber.Value);

                    context.SaveChanges();
                }

                return new HuyYeuCauPheDuyetResult()
                {
                    Status = true,
                    Message = "Hủy yêu cầu phê duyệt thành công",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "Hủy yêu cầu phê duyệt thành công"
                };
            }
            catch (Exception e)
            {
                return new HuyYeuCauPheDuyetResult()
                {
                    Status = false,
                    Message = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TuChoiResult TuChoi(TuChoiParameter parameter)
        {
            var doiTuongModel = new object();
            var typeModel = "";
            var actionCode = "";

            try
            {
                var user = context.User.FirstOrDefault(x => x.UserId == parameter.UserId);
                if (user == null)
                {
                    return new TuChoiResult()
                    {
                        Status = false,
                        Message = "Người dùng không tồn tại trên hệ thống",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = "Người dùng không tồn tại trên hệ thống"
                    };
                }

                //Cơ hội
                if (parameter.DoiTuongApDung == 1)
                {

                }
                //Hồ sơ thầu
                else if (parameter.DoiTuongApDung == 2)
                {

                }
                //Báo giá
                else if (parameter.DoiTuongApDung == 3)
                {
                    var quote = context.Quote.FirstOrDefault(x => x.QuoteId == parameter.ObjectId);
                    if (quote == null)
                    {
                        return new TuChoiResult()
                        {
                            Status = false,
                            Message = "Báo giá không tồn tại trên hệ thống",
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Báo giá không tồn tại trên hệ thống"
                        };
                    }

                    //Xóa hết các bước áp dụng
                    var listCacBuocApDung1 = context.CacBuocApDung.Where(x => x.ObjectId == parameter.ObjectId &&
                                                                             x.DoiTuongApDung ==
                                                                             parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung1);

                    //Xóa hết các phòng ban áp dụng
                    var listCacBuocApDungId1 = listCacBuocApDung1.Select(y => y.Id).ToList();
                    var listPhongBanApDung1 = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId1.Contains(x.CacBuocApDungId)).ToList();
                    context.PhongBanApDung.RemoveRange(listPhongBanApDung1);

                    ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                        parameter.UserId, 3, parameter.ObjectNumber.Value);

                    ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 3, parameter.Mota, parameter.ObjectNumber.Value);

                    //Thêm vào lịch sử
                    var lichSuPheDuyet_new = new LichSuPheDuyet();
                    lichSuPheDuyet_new.Id = Guid.NewGuid();
                    lichSuPheDuyet_new.ObjectId = parameter.ObjectId;
                    lichSuPheDuyet_new.DoiTuongApDung = parameter.DoiTuongApDung;
                    lichSuPheDuyet_new.NgayTao = DateTime.Now;
                    lichSuPheDuyet_new.EmployeeId = user.EmployeeId.Value;
                    lichSuPheDuyet_new.OrganizationId = null;
                    lichSuPheDuyet_new.LyDo = parameter.Mota;
                    lichSuPheDuyet_new.TrangThai = 0;

                    context.LichSuPheDuyet.Add(lichSuPheDuyet_new);

                    context.SaveChanges();
                }
                //Hợp đồng
                else if (parameter.DoiTuongApDung == 4)
                {

                }
                //Đơn hàng bán
                else if (parameter.DoiTuongApDung == 5)
                {

                }
                //Hóa đơn
                else if (parameter.DoiTuongApDung == 6)
                {

                }
                //Đề xuất mua hàng
                else if (parameter.DoiTuongApDung == 7)
                {

                }
                //Đơn hàng mua
                else if (parameter.DoiTuongApDung == 8)
                {

                }
                //Đề xuất xin nghỉ
                else if (parameter.DoiTuongApDung == 9)
                {
                    var dxxn = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == parameter.ObjectNumber);
                    if (dxxn == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất không tồn tại trên hệ thống"
                        };
                    }

                    //Nếu trạng thái khác Chờ phê duyệt
                    if (dxxn.TrangThaiId != 2)
                    {
                        return new TuChoiResult()
                        {
                            MessageCode = "Chỉ được từ chối đề xuất ở trạng thái Chờ phê duyệt",
                            StatusCode = System.Net.HttpStatusCode.Conflict
                        };
                    }

                    if (!String.IsNullOrWhiteSpace(parameter.Mota))
                    {
                        dxxn.LyDoTuChoi = parameter.Mota.Trim();
                        context.DeXuatXinNghi.Update(dxxn);
                    }

                    //Cộng lại số ngày xin nghỉ
                    var dxxnModel = CommonHelper.GetInforDeXuatXinNghi(context, new DeXuatXinNghiModel(dxxn));
                    var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == dxxn.EmployeeId);
                    emp.SoNgayDaNghiPhep = emp.SoNgayDaNghiPhep - dxxnModel.TongNgayNghi;
                    emp.SoNgayPhepConLai = emp.SoNgayPhepConLai + dxxnModel.TongNgayNghi;
                    context.Employee.Update(emp);

                    doiTuongModel = dxxn;
                    typeModel = TypeModel.RequestDetail;
                    actionCode = "REJECT_REQUEST";
                }
                //Đề xuất tăng lương
                else if (parameter.DoiTuongApDung == 10)
                {
                    var deXuatTangLuong =
                        context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == parameter.ObjectNumber);
                    if (deXuatTangLuong == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất tăng lương không tồn tại trên hệ thống"
                        };
                    }

                    doiTuongModel = deXuatTangLuong;
                    typeModel = TypeModel.DeXuatTangLuongDetail;
                    actionCode = "REJECT";
                }
                //Đề xuất chức vụ
                else if (parameter.DoiTuongApDung == 11)
                {
                    var deXuatChucVu =
                        context.DeXuatThayDoiChucVu.FirstOrDefault(x =>
                            x.DeXuatThayDoiChucVuId == parameter.ObjectNumber);
                    if (deXuatChucVu == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất thay đổi chức vụ không tồn tại trên hệ thống!"
                        };
                    }

                    doiTuongModel = deXuatChucVu;
                    typeModel = TypeModel.DeXuatChucVuDetail;
                    actionCode = "REJECT";
                }
                //Đề xuất kế hoạch OT
                else if (parameter.DoiTuongApDung == 12)
                {
                    var deXuatKehoachOT =
                        context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);
                    if (deXuatKehoachOT == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống!"
                        };
                    }

                    doiTuongModel = deXuatKehoachOT;
                    typeModel = TypeModel.DeXuatKeHoachOTDetail;
                    actionCode = "REJECT";
                }
                //Đăng ký OT
                else if (parameter.DoiTuongApDung == 13)
                {
                    var deXuatKehoachOT =
                        context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);
                    if (deXuatKehoachOT == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống!"
                        };
                    }

                    doiTuongModel = deXuatKehoachOT;
                    typeModel = TypeModel.DeXuatDangKyOTDetail;
                    actionCode = "REJECT";
                }
                //Kỳ lương
                else if (parameter.DoiTuongApDung == 14)
                {
                    var kyLuong = context.KyLuong.FirstOrDefault(x => x.KyLuongId == parameter.ObjectNumber);
                    if (kyLuong == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Kỳ lương không tồn tại trên hệ thống"
                        };
                    }

                    //Nếu trạng thái khác Chờ phê duyệt
                    if (kyLuong.TrangThai != 2)
                    {
                        return new TuChoiResult()
                        {
                            MessageCode = "Chỉ được từ chối đề xuất ở trạng thái Chờ phê duyệt",
                            StatusCode = System.Net.HttpStatusCode.Conflict
                        };
                    }

                    if (!String.IsNullOrWhiteSpace(parameter.Mota))
                    {
                        kyLuong.LyDoTuChoi = parameter.Mota.Trim();
                        context.KyLuong.Update(kyLuong);
                    }

                    doiTuongModel = kyLuong;
                    typeModel = TypeModel.KyLuong;
                    actionCode = "REJECT";
                }
                //Yêu cầu cấp phát
                else if (parameter.DoiTuongApDung == 20)
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x =>
                        x.YeuCauCapPhatTaiSanId == parameter.ObjectNumber.Value);
                    if (yeuCau == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }
                    doiTuongModel = yeuCau;
                    typeModel = TypeModel.DeXuatCapPhatTs;
                    actionCode = "DXCPTS_REJECT";

                }
                //Đề nghị tạm ứng (21) hoặc Đề nghị hoàn ứng (22) 
                else if (parameter.DoiTuongApDung == 21 || parameter.DoiTuongApDung == 22)
                {
                    var deNghi =
                        context.DeNghiTamHoanUng.FirstOrDefault(x =>
                            x.DeNghiTamHoanUngId == parameter.ObjectNumber.Value);
                    if (deNghi == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề nghị không tồn tại trên hệ thống"
                        };
                    }
                    doiTuongModel = deNghi;
                    if (parameter.DoiTuongApDung == 21)
                    {
                        typeModel = TypeModel.DeNghiTamUng;
                        actionCode = "DXTU_REJECT";
                    }
                    else
                    {
                        typeModel = TypeModel.DeNghiHoanUng;
                        actionCode = "DXHU_REJECT";
                    }


                }
                //Đề xuất công tác
                else if (parameter.DoiTuongApDung == 30)
                {
                    var deXuatCongTac =
                        context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == parameter.ObjectNumber);
                    if (deXuatCongTac == null)
                    {
                        return new TuChoiResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất công tác không tồn tại trên hệ thống!"
                        };
                    }
                    doiTuongModel = deXuatCongTac;
                    typeModel = TypeModel.DeXuatCongTac;
                    actionCode = "DXCT_REJECT";
                }

                var listCacBuocApDung = new List<CacBuocApDung>();

                //Xóa hết các bước áp dụng
                if (parameter.ObjectId != Guid.Empty)
                {
                    listCacBuocApDung = context.CacBuocApDung.Where(x =>
                        x.ObjectId == parameter.ObjectId &&
                        x.DoiTuongApDung ==
                        parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                }
                else if (parameter.ObjectNumber != null && parameter.ObjectNumber != 0)
                {
                    listCacBuocApDung = context.CacBuocApDung.Where(x =>
                        x.ObjectNumber == parameter.ObjectNumber.Value &&
                        x.DoiTuongApDung ==
                        parameter.DoiTuongApDung).ToList();
                    context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                }

                //Xóa hết các phòng ban áp dụng
                var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();
                var listPhongBanApDung = context.PhongBanApDung
                    .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();
                context.PhongBanApDung.RemoveRange(listPhongBanApDung);

                ChuyenTrangThaiDoiTuong(parameter.ObjectId, parameter.DoiTuongApDung,
                    parameter.UserId, 3, parameter.ObjectNumber.Value);

                ThemGhiChu(parameter.ObjectId, parameter.DoiTuongApDung, parameter.UserId, 3, parameter.Mota,
                    parameter.ObjectNumber.Value);

                //Thêm vào lịch sử
                var lichSuPheDuyet = new LichSuPheDuyet();
                lichSuPheDuyet.Id = Guid.NewGuid();
                lichSuPheDuyet.ObjectId = parameter.ObjectId;
                lichSuPheDuyet.DoiTuongApDung = parameter.DoiTuongApDung;
                lichSuPheDuyet.NgayTao = DateTime.Now;
                lichSuPheDuyet.EmployeeId = user.EmployeeId.Value;
                lichSuPheDuyet.OrganizationId = null;
                lichSuPheDuyet.LyDo = parameter.Mota;
                lichSuPheDuyet.TrangThai = 0;
                lichSuPheDuyet.ObjectNumber = parameter.ObjectNumber;

                context.LichSuPheDuyet.Add(lichSuPheDuyet);
                context.SaveChanges();
            }
            catch (Exception e)
            {
                return new TuChoiResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Status = false,
                    Message = e.Message,
                    MessageCode = e.Message
                };
            }

            #region Gửi email

            NotificationHelper.AccessNotification(context, typeModel, actionCode, doiTuongModel, doiTuongModel,
                true, null, null, new List<string>());

            #endregion

            return new TuChoiResult()
            {
                StatusCode = System.Net.HttpStatusCode.OK,
                Status = true,
                Message = "Từ chối thành công",
                MessageCode = "Từ chối thành công"
            };
        }

        public GetLichSuPheDuyetResult GetLichSuPheDuyet(GetLichSuPheDuyetParameter parameter)
        {
            try
            {
                var ListLichSuPheDuyet = new List<LichSuPheDuyetModel>();

                ListLichSuPheDuyet = context.LichSuPheDuyet
                    .Where(x => x.ObjectId == parameter.ObjectId && x.DoiTuongApDung == parameter.DoiTuongApDung)
                    .Select(y => new LichSuPheDuyetModel
                    {
                        Id = y.Id,
                        NgayTao = y.NgayTao,
                        EmployeeId = y.EmployeeId,
                        OrganizationId = y.OrganizationId,
                        LyDo = y.LyDo,
                        TrangThai = y.TrangThai
                    }).OrderByDescending(z => z.NgayTao).ToList();

                var listEmployeeId = ListLichSuPheDuyet.Select(y => y.EmployeeId).ToList();
                var listEmployee = context.Employee.Where(x => listEmployeeId.Contains(x.EmployeeId))
                    .Select(y => new {y.EmployeeId, y.EmployeeCode, y.EmployeeName}).ToList();
                var listDonViId = ListLichSuPheDuyet.Select(y => y.OrganizationId).ToList();
                var listDonVi = context.Organization.Where(x => listDonViId.Contains(x.OrganizationId))
                    .Select(y => new {y.OrganizationId, y.OrganizationName}).ToList();

                ListLichSuPheDuyet.ForEach(item =>
                {
                    item.NgayTaoString = item.NgayTao.ToString("dd/MM/yyyy HH:mm");
                    item.TenTrangThai = item.TrangThai == 0 ? "Từ chối" : "Phê duyệt";

                    var nguoiPheDuyet = listEmployee.FirstOrDefault(x => x.EmployeeId == item.EmployeeId);
                    item.NguoiPheDuyet = nguoiPheDuyet?.EmployeeCode + " - " + nguoiPheDuyet?.EmployeeName;

                    var donVi = listDonVi.FirstOrDefault(x => x.OrganizationId == item.OrganizationId);
                    item.TenDonVi = donVi?.OrganizationName;
                });

                return new GetLichSuPheDuyetResult()
                {
                    Status = true,
                    Message = "Success",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListLichSuPheDuyet = ListLichSuPheDuyet
                };
            }
            catch (Exception e)
            {
                return new GetLichSuPheDuyetResult()
                {
                    Status = false,
                    Message = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetDuLieuQuyTrinhResult GetDuLieuQuyTrinh(GetDuLieuQuyTrinhParameter parameter)
        {
            try
            {
                var listDonVi = context.Organization.Select(y => new { y.OrganizationId, y.OrganizationName })
                    .ToList();

                var listDuLieuQuyTrinh = new List<DuLieuQuyTrinhModel>();

                //Cơ hội
                if (parameter.DoiTuongApDung == 1)
                {

                }
                //Hồ sơ thầu
                else if (parameter.DoiTuongApDung == 2)
                {

                }
                //Báo giá
                else if (parameter.DoiTuongApDung == 3)
                {
                    var quote = context.Quote.FirstOrDefault(x => x.QuoteId == parameter.ObjectId);
                    if (quote == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            Status = false,
                            Message = "Báo giá không tồn tại trên hệ thống",
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Báo giá không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }
                        //Nếu có nhiều hơn 1 cấu hình
                        else if (listCauHinhQuyTrinh.Count > 1)
                        {
                            var listSp = context.QuoteDetail.Where(x => x.QuoteId == quote.QuoteId)
                                .Select(y => new SanPhamBaoGia
                                {
                                    SoLuong = y.Quantity ?? 0,
                                    DonGia = y.UnitPrice ?? 0,
                                    TyGia = y.ExchangeRate ?? 0,
                                    ThanhTienNhanCong = y.UnitLaborNumber * y.UnitLaborPrice,
                                    LoaiChietKhau = y.DiscountType ?? true,
                                    GiaTriChietKhau = y.DiscountValue ?? 0,
                                    PhanTramThue = y.Vat ?? 0
                                }).ToList();
                            var tongChiPhi = context.QuoteCostDetail.Where(x => x.QuoteId == quote.QuoteId &&
                                                                                x.IsInclude == false)
                                                 .Sum(s => s.Quantity * s.UnitPrice) ?? 0;

                            var tongThanhToan = TongThanhToanBaoGia(quote.DiscountType ?? true,
                                quote.DiscountValue ?? 0, listSp, tongChiPhi);

                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.SoTienTu <= tongThanhToan);
                        }

                        var listCacBuoc = context.CacBuocQuyTrinh
                        .Where(x => x.CauHinhQuyTrinhId == cauHinhQuyTrinh.Id)
                        .OrderBy(z => z.Stt).ToList();
                        var listCacBuocHienTai = context.CacBuocApDung.Where(x => x.ObjectId == quote.QuoteId &&
                                                                                  x.DoiTuongApDung == 3)
                            .OrderBy(z => z.Stt).ToList();
                        var sttBuocApDungCuoi = listCacBuocHienTai.Count;

                        var listCacBuocId = listCacBuoc.Select(y => y.Id).ToList();
                        var listPhongBanTrongCacBuoc = context.PhongBanTrongCacBuocQuyTrinh
                            .Where(x => listCacBuocId.Contains(x.CacBuocQuyTrinhId)).ToList();
                        var listlistCacBuocHienTaiId = listCacBuocHienTai.Select(y => y.Id).ToList();
                        var listPhongBanDaPheDuyet = context.PhongBanApDung
                            .Where(x => listlistCacBuocHienTaiId.Contains(x.CacBuocApDungId)).ToList();

                        listCacBuoc.ForEach(buoc =>
                        {
                            var buocApDung = listCacBuocHienTai.FirstOrDefault(x => x.Stt == buoc.Stt);

                            var duLieu = new DuLieuQuyTrinhModel();

                            if (buocApDung != null)
                            {
                                //Nếu bước đã đc hoàn thành
                                if (buocApDung.TrangThai == 1)
                                {
                                    duLieu.IsComplete = true;
                                }
                                //Nếu bước chưa hoàn thành
                                else
                                {
                                    //
                                    if (buoc.Stt == sttBuocApDungCuoi)
                                    {
                                        duLieu.IsCurrent = true;
                                        duLieu.IsActive = true;
                                    }
                                }
                            }

                            //Phê duyệt trưởng bộ phận
                            if (buoc.LoaiPheDuyet == 1)
                            {
                                duLieu.NodeName = "Phê duyệt trưởng bộ phận";
                            }
                            //Phòng ban phê duyệt
                            else if (buoc.LoaiPheDuyet == 2)
                            {
                                //Lấy list Phòng ban
                                var listPhongBan = listPhongBanTrongCacBuoc.Where(x => x.CacBuocQuyTrinhId == buoc.Id)
                                    .ToList();

                                //Nếu bước chỉ có 1 phòng ban phê duyệt
                                if (listPhongBan.Count == 1)
                                {
                                    var donViId = listPhongBan.Select(y => y.OrganizationId).FirstOrDefault();
                                    var donVi = listDonVi.FirstOrDefault(x => x.OrganizationId == donViId);
                                    duLieu.NodeName = donVi?.OrganizationName;
                                }
                                //Nếu bước có nhiều hơn 1 phòng ban phê duyệt
                                else if (listPhongBan.Count > 1)
                                {
                                    duLieu.NodeName = "Phòng ban phê duyệt";

                                    listPhongBan.ForEach(donViPheDuyet =>
                                    {
                                        var newDonViPheDuyet = new DuLieuPhongBanPheDuyetModel();
                                        newDonViPheDuyet.OrganizationId = donViPheDuyet.OrganizationId;
                                        newDonViPheDuyet.TrangThai = 0;

                                        var donVi = listDonVi.FirstOrDefault(x =>
                                            x.OrganizationId == donViPheDuyet.OrganizationId);
                                        newDonViPheDuyet.TenDonVi = donVi?.OrganizationName;

                                        duLieu.ListDonVi.Add(newDonViPheDuyet);
                                    });

                                    //
                                    if (buocApDung != null)
                                    {
                                        var listDonViDaDuyet = listPhongBanDaPheDuyet
                                            .Where(x => x.CacBuocApDungId == buocApDung.Id)
                                            .ToList();

                                        duLieu.ListDonVi.ForEach(donVi =>
                                        {
                                            var donViDaDuyet = listDonViDaDuyet.FirstOrDefault(x =>
                                                x.OrganizationId == donVi.OrganizationId);

                                            if (donViDaDuyet != null)
                                            {
                                                donVi.TrangThai = 1;
                                            }
                                        });
                                    }
                                }
                            }

                            listDuLieuQuyTrinh.Add(duLieu);
                        });
                    }
                }
                //Hợp đồng
                else if (parameter.DoiTuongApDung == 4)
                {

                }
                //Đơn hàng bán
                else if (parameter.DoiTuongApDung == 5)
                {

                }
                //Hóa đơn
                else if (parameter.DoiTuongApDung == 6)
                {

                }
                //Đề xuất mua hàng
                else if (parameter.DoiTuongApDung == 7)
                {

                }
                //Đơn hàng mua
                else if (parameter.DoiTuongApDung == 8)
                {

                }
                //Đề xuất xin nghỉ
                else if (parameter.DoiTuongApDung == 9)
                {
                    var dxxn = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == parameter.ObjectNumber);
                    if (dxxn == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất không tồn tại trên hệ thống"
                        };
                    }

                    var thanhVienPhongBan = context.ThanhVienPhongBan.FirstOrDefault(x =>
                        x.IsPhongBanChinh == true && x.EmployeeId == dxxn.EmployeeId);
                    bool isQuanLy = thanhVienPhongBan != null && (thanhVienPhongBan.IsManager == 1 ? true : false);

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu người đề xuất là quản lý
                        if (isQuanLy)
                        {
                            //Lấy cấu hình cho quản lý
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.LoaiCauHinh == 2);
                        }
                        //Nếu người đề xuất là nhân viên
                        else
                        {
                            //Lấy cấu hình cho nhân viên
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault(x => x.LoaiCauHinh == 1);
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Đề xuất tăng lương 
                else if (parameter.DoiTuongApDung == 10)
                {
                    var deXuatTangLuong = context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == parameter.ObjectNumber);
                    if (deXuatTangLuong == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất tăng lương không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Đề xuất chức vụ
                else if (parameter.DoiTuongApDung == 11)
                {
                    var deXuatChucVu = context.DeXuatThayDoiChucVu.FirstOrDefault(x => x.DeXuatThayDoiChucVuId == parameter.ObjectNumber);
                    if (deXuatChucVu == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất chức vụ không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Đề xuất kế hoạch OT
                else if (parameter.DoiTuongApDung == 12)
                {
                    var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);
                    if (deXuatKeHoachOT == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Đăng ký OT
                else if (parameter.DoiTuongApDung == 13)
                {
                    var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == parameter.ObjectNumber);
                    if (deXuatKeHoachOT == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất kế hoạch OT không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Kỳ lương
                else if (parameter.DoiTuongApDung == 14)
                {
                    var kyLuong = context.KyLuong.FirstOrDefault(x => x.KyLuongId == parameter.ObjectNumber);
                    if (kyLuong == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Kỳ lương không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Yêu cầu cấp phát
                else if (parameter.DoiTuongApDung == 20)
                {
                    var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == parameter.ObjectNumber);
                    if (yeuCau == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Yêu cầu cấp phát không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                //Yêu cầu cấp phát
                else if (parameter.DoiTuongApDung == 21 || parameter.DoiTuongApDung == 22)
                {
                    var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == parameter.ObjectNumber);
                    if (deNghi == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề nghị không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }
                // đề xuất công tác
                else if (parameter.DoiTuongApDung == 30)
                {
                    var deXuatCongTac = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == parameter.ObjectNumber);
                    if (deXuatCongTac == null)
                    {
                        return new GetDuLieuQuyTrinhResult()
                        {
                            StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đề xuất công tác không tồn tại trên hệ thống"
                        };
                    }

                    //Lấy quy trình
                    var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.HoatDong &&
                                                                        x.DoiTuongApDung == parameter.DoiTuongApDung);

                    if (quyTrinh != null)
                    {
                        //Chọn cấu hình quy trình
                        var listCauHinhQuyTrinh = context.CauHinhQuyTrinh.Where(x => x.QuyTrinhId == quyTrinh.Id)
                            .OrderByDescending(z => z.SoTienTu).ToList();
                        var cauHinhQuyTrinh = new CauHinhQuyTrinh();

                        //Nếu chỉ có một cấu hình
                        if (listCauHinhQuyTrinh.Count == 1)
                        {
                            cauHinhQuyTrinh = listCauHinhQuyTrinh.FirstOrDefault();
                        }

                        //Sau khi lấy được cấu hình quy trình
                        if (cauHinhQuyTrinh != null)
                        {
                            listDuLieuQuyTrinh = GetListDuLieuQuyTrinhByObject(parameter.ObjectId, parameter.ObjectNumber,
                                parameter.DoiTuongApDung, cauHinhQuyTrinh.Id);
                        }
                    }
                }

                return new GetDuLieuQuyTrinhResult()
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Message = "Success",
                    MessageCode = "Success",
                    ListDuLieuQuyTrinh = listDuLieuQuyTrinh
                };
            }
            catch (Exception e)
            {
                return new GetDuLieuQuyTrinhResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Message = e.Message,
                    MessageCode = e.Message
                };
            }
        }

        public GetMasterDataCreateQuyTrinhResult GetMasterDataCreateQuyTrinh(GetMasterDataCreateQuyTrinhParameter parameter)
        {
            try
            {
                var listDoiTuongApDung = GeneralList.GetTrangThais("DoiTuongApDungQuyTrinhPheDuyet");

                return new GetMasterDataCreateQuyTrinhResult()
                {
                    MessageCode = "OK",
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ListDoiTuongApDung = listDoiTuongApDung
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataCreateQuyTrinhResult()
                {
                    MessageCode = e.Message,
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed
                };
            }
        }

        public CheckUpdateQuyTrinhResult CheckUpdateQuyTrinh(CheckUpdateQuyTrinhParameter parameter)
        {
            try
            {
                var listCode = new List<string>();
                bool checkChange = CheckResetQuyTrinh(parameter.QuyTrinh, parameter.UserId,
                    parameter.ListCauHinhQuyTrinh, false, out listCode);

                return new CheckUpdateQuyTrinhResult()
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "OK",
                    IsResetDoiTuong = checkChange,
                    ListDoiTuong = listCode
                };
            }
            catch (Exception e)
            {
                return new CheckUpdateQuyTrinhResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        private string GenCode()
        {
            var code = "";
            var max = 0;
            var listMaQuyTrinh = context.QuyTrinh.Select(y => y.MaQuyTrinh.Substring(3)).ToList();
            var listNumber = listMaQuyTrinh.Select(y => Int32.Parse(y)).ToList();

            if (listNumber.Count == 0)
            {
                max = 1;
            }
            else
            {
                var maxCurrent = listNumber.OrderByDescending(z => z).FirstOrDefault();
                max = maxCurrent + 1;
            }

            if (max <= 9999)
            {
                code = "QT-" + max.ToString("D4");
            }
            else
            {
                code = "QT-" + max;
            }

            return code;
        }

        private string GetDoiTuongApDung(int code)
        {
            //switch (code)
            //{
            //    case 1:
            //        return "Cơ hội";
            //    case 2:
            //        return "Hồ sơ thầu";
            //    case 3:
            //        return "Báo giá";
            //    case 4:
            //        return "Hợp đồng";
            //    case 5:
            //        return "Đơn hàng bán";
            //    case 6:
            //        return "Hóa đơn";
            //    case 7:
            //        return "Đề xuất mua hàng";
            //    case 8:
            //        return "Đơn hàng mua";
            //    case 9:
            //        return "Đề xuất xin nghỉ";
            //    default:
            //        return "";
            //}
            var listDoiTuongApDung = GeneralList.GetTrangThais("DoiTuongApDungQuyTrinhPheDuyet");
            return listDoiTuongApDung.FirstOrDefault(x => x.Value == code).Name;
        }

        private decimal TongThanhToanBaoGia(
            bool loaiChietKhau, decimal giaTriChietKhau, List<SanPhamBaoGia> listSp, decimal tongChiPhi)
        {
            decimal tongGiaTriHangHoaBanRa = 0;
            decimal tongThue = 0;

            listSp.ForEach(item =>
            {
                decimal thanhTienChietKhau = 0;

                //Chiết khấu theo %
                if (item.LoaiChietKhau)
                {
                    thanhTienChietKhau = (item.SoLuong * item.DonGia * item.TyGia + item.ThanhTienNhanCong) *
                                         item.GiaTriChietKhau / 100;
                }
                //Chiết khấu theo số tiền
                else
                {
                    thanhTienChietKhau = item.GiaTriChietKhau;
                }

                tongGiaTriHangHoaBanRa += (item.SoLuong * item.DonGia * item.TyGia) + item.ThanhTienNhanCong -
                                          thanhTienChietKhau;

                tongThue += ((item.SoLuong * item.DonGia * item.TyGia) + item.ThanhTienNhanCong -
                             thanhTienChietKhau) * item.PhanTramThue / 100;
            });

            decimal tongTienSauThue = tongChiPhi + tongGiaTriHangHoaBanRa + tongThue;
            decimal thanhTienChietKhauBaoGia = 0;

            //Chiết khấu theo %
            if (loaiChietKhau)
            {
                thanhTienChietKhauBaoGia = tongTienSauThue * giaTriChietKhau / 100;
            }
            //Chiết khấu theo số tiền
            else
            {
                thanhTienChietKhauBaoGia = giaTriChietKhau;
            }

            decimal tongThanhToan = tongTienSauThue - thanhTienChietKhauBaoGia;

            return tongThanhToan;
        }

        private void ChuyenTrangThaiDoiTuong(Guid ObjectId, int DoiTuongApDung, Guid UserId, int Action, int ObjectNumber)
        {
            /*
             * Action = 1: Gửi phê duyệt
             * Action = 2: Phê duyệt
             * Action = 3: Từ chối
             * Action = 4: Hủy yêu cầu phê duyệt
             */

            //Cơ hội
            if (DoiTuongApDung == 1)
            {

            }
            //Hồ sơ thầu
            else if (DoiTuongApDung == 2)
            {

            }
            //Báo giá
            else if (DoiTuongApDung == 3)
            {
                var categoryType = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TGI");
                var trangThai = new Category();

                if (Action == 1)
                {
                    trangThai = context.Category.FirstOrDefault(c =>
                        c.CategoryTypeId == categoryType.CategoryTypeId && c.CategoryCode == "DLY");
                }
                else if (Action == 2)
                {
                    trangThai = context.Category.FirstOrDefault(c =>
                        c.CategoryTypeId == categoryType.CategoryTypeId && c.CategoryCode == "CHO");
                }
                else if (Action == 3 || Action == 4)
                {
                    trangThai = context.Category.FirstOrDefault(c =>
                        c.CategoryTypeId == categoryType.CategoryTypeId && c.CategoryCode == "MTA");
                }
                
                var quote = context.Quote.FirstOrDefault(x => x.QuoteId == ObjectId);

                quote.UpdatedById = UserId;
                quote.UpdatedDate = DateTime.Now;
                quote.StatusId = trangThai?.CategoryId;

                context.Quote.Update(quote);
            }
            //Hợp đồng
            else if (DoiTuongApDung == 4)
            {

            }
            //Đơn hàng bán
            else if (DoiTuongApDung == 5)
            {

            }
            //Hóa đơn
            else if (DoiTuongApDung == 6)
            {

            }
            //Đề xuất mua hàng
            else if (DoiTuongApDung == 7)
            {

            }
            //Đơn hàng mua
            else if (DoiTuongApDung == 8)
            {

            }
            //Đề xuất xin nghỉ
            else if (DoiTuongApDung == 9)
            {
                var dxxn = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("TrangThaiDeXuatXinNghi");

                if (Action == 1)
                {
                    dxxn.TrangThaiId = listTrangThai.FirstOrDefault(x => x.Value == 2).Value;
                }
                else if (Action == 2)
                {
                    dxxn.TrangThaiId = listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }
                else if (Action == 3)
                {
                    dxxn.TrangThaiId = listTrangThai.FirstOrDefault(x => x.Value == 1).Value;
                }
                else if (Action == 4)
                {
                    dxxn.TrangThaiId = listTrangThai.FirstOrDefault(x => x.Value == 0).Value;
                }

                context.DeXuatXinNghi.Update(dxxn);
            }
            //Đề xuất tăng lương
            else if (DoiTuongApDung == 10)
            {
                //Cho đề xuất
                var deXuatTangLuongNV = context.DeXuatTangLuongNhanVien.Where(x => x.DeXuatTangLuongId == ObjectNumber).ToList();
                var deXuatTangLuong = context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("DXTangLuong");
                var listTrangThaiNV = GeneralList.GetTrangThais("DXTangLuongNhanVien");

                if (Action == 1)
                {
                    deXuatTangLuong.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 2).Value;

                    deXuatTangLuongNV.ForEach(item =>
                    {
                        item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 2).Value;
                        item.UpdatedById = UserId;
                        item.UpdatedDate = DateTime.Now;
                    });
                }
                else if (Action == 2)
                {
                    deXuatTangLuong.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;

                    deXuatTangLuongNV.ForEach(item =>
                    {
                        if (item.TrangThai == 2)
                        {
                            item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 3).Value;
                        }
                        item.UpdatedById = UserId;
                        item.UpdatedDate = DateTime.Now;
                    });
                }
                else if (Action == 3)
                {
                    deXuatTangLuong.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                }
                else if (Action == 4)
                {
                    deXuatTangLuong.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 1).Value;

                    deXuatTangLuongNV.ForEach(item =>
                    {
                        item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 1).Value;
                        item.UpdatedById = UserId;
                        item.UpdatedDate = DateTime.Now;
                    });
                }

                deXuatTangLuong.UpdatedById = UserId;
                deXuatTangLuong.UpdatedDate = DateTime.Now;

                context.DeXuatTangLuong.Update(deXuatTangLuong);
                context.DeXuatTangLuongNhanVien.UpdateRange(deXuatTangLuongNV);
            }
            //Đề xuất chức vụ
            else if (DoiTuongApDung == 11)
            {
                var deXuatThayDoiChucVu = context.DeXuatThayDoiChucVu.FirstOrDefault(x => x.DeXuatThayDoiChucVuId == ObjectNumber);
                var deXuatChucVuNV = context.NhanVienDeXuatThayDoiChucVu.Where(x => x.DeXuatThayDoiChucVuId == ObjectNumber).ToList();
                var listTrangThaiNV = GeneralList.GetTrangThais("DXThayDoiChucVuNhanVien");
                var listTrangThai = GeneralList.GetTrangThais("DXThayDoiChucVu");

                if (Action == 1)
                {
                    deXuatThayDoiChucVu.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 2).Value;

                    deXuatChucVuNV.ForEach(item =>
                    {
                        item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 2).Value;
                        item.UpdatedById = UserId;
                        item.UpdatedDate = DateTime.Now;
                    });
                }
                else if (Action == 2)
                {
                    deXuatThayDoiChucVu.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;

                    deXuatChucVuNV.ForEach(item =>
                    {
                        if (item.TrangThai == 2)
                        {
                            item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 3).Value;
                        }
                        item.UpdatedById = UserId;
                        item.UpdatedDate = DateTime.Now;
                    });
                }
                else if (Action == 3)
                {
                    deXuatThayDoiChucVu.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                }
                else if (Action == 4)
                {
                    deXuatThayDoiChucVu.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 1).Value;

                    deXuatChucVuNV.ForEach(item =>
                    {
                        item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 1).Value;
                        item.UpdatedById = UserId;
                        item.UpdatedDate = DateTime.Now;
                    });
                }

                deXuatThayDoiChucVu.UpdatedById = UserId;
                deXuatThayDoiChucVu.UpdatedDate = DateTime.Now;

                context.DeXuatThayDoiChucVu.Update(deXuatThayDoiChucVu);
                context.NhanVienDeXuatThayDoiChucVu.UpdateRange(deXuatChucVuNV);
            }
            //Đề xuất kế hoạch OT
            else if (DoiTuongApDung == 12)
            {
                var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("TrangThaiKeHoachOt");
                if (Action == 1)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 2).Value;
                }
                else if (Action == 2)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }
                else if (Action == 3)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 8).Value;
                }
                else if (Action == 4)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 1).Value;
                }

                deXuatKeHoachOT.UpdatedById = UserId;
                deXuatKeHoachOT.UpdatedDate = DateTime.Now;
                context.KeHoachOt.Update(deXuatKeHoachOT);
            }
            //Đăng ký OT
            else if (DoiTuongApDung == 13)
            {
                var deXuatKeHoachOT = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("TrangThaiKeHoachOt");
                if (Action == 1)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                }
                else if (Action == 2)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 5).Value;

                    //Chuyển trạng thái của NV đăng ký OT từ Chờ phê duyệt sang phê duyệt.
                    var listDangKyOTNv = context.KeHoachOtThanhVien
                        .Where(x => x.KeHoachOtId == ObjectNumber && x.TrangThai == 2).ToList();
                    listDangKyOTNv.ForEach(item =>
                    {
                        item.TrangThai = 3;
                    });
                    context.KeHoachOtThanhVien.UpdateRange(listDangKyOTNv);
                }
                else if (Action == 3)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 9).Value;
                }
                else if (Action == 4)
                {
                    deXuatKeHoachOT.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }

                deXuatKeHoachOT.UpdatedById = UserId;
                deXuatKeHoachOT.UpdatedDate = DateTime.Now;
                context.KeHoachOt.Update(deXuatKeHoachOT);
            }
            //Kỳ lương
            else if (DoiTuongApDung == 14)
            {
                var kyLuong = context.KyLuong.FirstOrDefault(x => x.KyLuongId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("TrangThaiKyLuong");

                if (Action == 1)
                {
                    kyLuong.TrangThai = listTrangThai.FirstOrDefault(x => x.Value == 2).Value;
                }
                else if (Action == 2)
                {
                    kyLuong.TrangThai = listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }
                else if (Action == 3)
                {
                    kyLuong.TrangThai = listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                }
                else if (Action == 4)
                {
                    kyLuong.TrangThai = listTrangThai.FirstOrDefault(x => x.Value == 1).Value;
                }

                context.KyLuong.Update(kyLuong);
            }
            //Yêu cầu cấp phát tài sản
            else if (DoiTuongApDung == 20)
            {
                var yeuCau = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("YCCapPhat");
                if (Action == 1)
                {
                    yeuCau.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 2).Value;
                }
                else if (Action == 2)
                {
                    yeuCau.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }
                else if (Action == 3)
                {
                    yeuCau.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                }
                else if (Action == 4)
                {
                    yeuCau.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 1).Value;
                }

                yeuCau.UpdatedById = UserId;
                yeuCau.UpdatedDate = DateTime.Now;
                context.YeuCauCapPhatTaiSan.Update(yeuCau);
            }
            else if (DoiTuongApDung == 21 || DoiTuongApDung == 22)
            {
                var deNghi = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("DNHoanTamUng");
                if (Action == 1)
                {
                    deNghi.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 2).Value;
                }
                else if (Action == 2)
                {
                    deNghi.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }
                else if (Action == 3)
                {
                    deNghi.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                    deNghi.NguoiPheDuyetId = context.User.FirstOrDefault(x => x.UserId == UserId).EmployeeId.Value;
                }
                else if (Action == 4)
                {
                    deNghi.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 1).Value;
                }

                deNghi.UpdatedById = UserId;
                deNghi.UpdatedDate = DateTime.Now;
                context.DeNghiTamHoanUng.Update(deNghi);
            }
            else if (DoiTuongApDung == 30)
            {
                var deXuatCongTac = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == ObjectNumber);
                var listTrangThai = GeneralList.GetTrangThais("DEXUATCT");
                if (Action == 1)
                {
                    deXuatCongTac.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 2).Value;
                }
                else if (Action == 2)
                {
                    deXuatCongTac.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 3).Value;
                }
                else if (Action == 3)
                {
                    deXuatCongTac.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 4).Value;
                }
                // chuyển về trạng thái tạo mới
                else if (Action == 4)
                {
                    deXuatCongTac.TrangThai = (byte)listTrangThai.FirstOrDefault(x => x.Value == 1).Value;
                }

                deXuatCongTac.UpdatedById = UserId;
                deXuatCongTac.UpdatedDate = DateTime.Now;
                context.DeXuatCongTac.Update(deXuatCongTac);
            }
        }

        public void ThemGhiChu(Guid ObjectId, int DoiTuongApDung, Guid UserId, int Action, string Mota, int? ObjectNumber)
        {
            /*
             * Action = 1: Gửi phê duyệt
             * Action = 2: Phê duyệt
             * Action = 3: Từ chối
             * Action = 4: Hủy yêu cầu phê duyệt (hoặc Đặt về mới)
             */

            Note note = new Note();
            note.NoteId = Guid.NewGuid();
            note.ObjectId = ObjectId;
            note.Type = "ADD";
            note.Active = true;
            note.CreatedById = UserId;
            note.CreatedDate = DateTime.Now;
            note.NoteTitle = "Đã thêm ghi chú";
            note.ObjectNumber = ObjectNumber;

            //Cơ hội
            if (DoiTuongApDung == 1)
            {

            }
            //Hồ sơ thầu
            else if (DoiTuongApDung == 2)
            {

            }
            //Báo giá
            else if (DoiTuongApDung == 3)
            {
                note.ObjectType = "QUOTE";

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            //Hợp đồng
            else if (DoiTuongApDung == 4)
            {

            }
            //Đơn hàng bán
            else if (DoiTuongApDung == 5)
            {

            }
            //Hóa đơn
            else if (DoiTuongApDung == 6)
            {

            }
            //Đề xuất mua hàng
            else if (DoiTuongApDung == 7)
            {

            }
            //Đơn hàng mua
            else if (DoiTuongApDung == 8)
            {

            }
            //Đề xuất xin nghỉ
            else if (DoiTuongApDung == 9)
            {
                note.ObjectType = NoteObjectType.DXXN;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã đặt về mới";
                }

                context.Note.Add(note);
            }
            //Đề xuất tăng lương
            else if (DoiTuongApDung == 10)
            {
                note.ObjectType = NoteObjectType.DXTL;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            //Đề xuất chức vụ
            else if (DoiTuongApDung == 11)
            {
                note.ObjectType = NoteObjectType.DXCV;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            //Đề xuất kế hoạch OT
            else if (DoiTuongApDung == 12)
            {
                note.ObjectType = NoteObjectType.DXKHOT;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            //Đăng ký OT
            else if (DoiTuongApDung == 13)
            {
                note.ObjectType = NoteObjectType.DXKHOT;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            //Kỳ lương
            else if (DoiTuongApDung == 14)
            {
                note.ObjectType = NoteObjectType.KYLUONG;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã đặt về mới";
                }

                context.Note.Add(note);
            }
            // Yêu cầu cấp phát tài sản
            else if (DoiTuongApDung == 20)
            {
                note.ObjectType = NoteObjectType.YCCAPPHAT;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            // Đề nghị tạm ứng
            else if (DoiTuongApDung == 21)
            {
                note.ObjectType = NoteObjectType.DENGHIHOANTAMUNG;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            // Đề nghị hoàn ứng
            else if (DoiTuongApDung == 22)
            {
                note.ObjectType = NoteObjectType.DENGHIHOANTAMUNG;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
            // Đề xuất công tác
            else if (DoiTuongApDung == 30)
            {
                note.ObjectType = NoteObjectType.DEXUATCT;

                if (Action == 1)
                {
                    note.Description = "Đã gửi phê duyệt thành công";
                }
                else if (Action == 2)
                {
                    note.Description = "Đã phê duyệt thành công";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã phê duyệt thành công với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 3)
                {
                    note.Description = "Đã bị từ chối";

                    if (!string.IsNullOrEmpty(Mota))
                    {
                        note.Description = "Đã bị từ chối với lý do: " +
                                           Mota.Trim();
                    }
                }
                else if (Action == 4)
                {
                    note.Description = "Đã hủy yêu cầu phê duyệt";
                }

                context.Note.Add(note);
            }
        }



        private List<string> GetListEmail(Guid userId, int loaiPheDuyet, CacBuocQuyTrinh buoc)
        {
            var result = new List<string>();

            // phê duyệt trưởng bộ phận
            if (loaiPheDuyet == 1)
            {
                //lấy email trưởng bộ phận của nv gửi phê duyệt
                var userInfor = context.User.FirstOrDefault(x => x.UserId == userId);
                var empOrg = context.Employee.FirstOrDefault(x => x.EmployeeId == userInfor.EmployeeId)?.OrganizationId;
                var listEmpIdTruongBoPhan = context.ThanhVienPhongBan
                    .Where(x => x.IsManager == 1 &&
                                x.OrganizationId == empOrg).Select(y => y.EmployeeId).ToList();

                //Lấy mail từ bảng contact 
                var listEmailTruongBoPhan =
                    context.Contact.Where(x => listEmpIdTruongBoPhan.Contains(x.ObjectId)).ToList();

                listEmailTruongBoPhan.ForEach(item =>
                {
                    if (!String.IsNullOrEmpty(item.WorkEmail))
                    {
                        result.Add(item.WorkEmail.Trim());
                    }
                    else if (!String.IsNullOrEmpty(item.Email))
                    {
                        result.Add(item.Email.Trim());
                    }
                });
            }
            // phê duyệt phòng ban
            else if (loaiPheDuyet == 2)
            {
                //Lấy thông tin về các phòng ban phê duyệt
                var listPhongBanPheDuyetTrongBuoc = context.PhongBanTrongCacBuocQuyTrinh
                    .Where(x => x.CacBuocQuyTrinhId == buoc.Id).Select(y => y.OrganizationId).ToList();

                var listEmpIdTruongBoPhan = context.ThanhVienPhongBan.Where(x =>
                    listPhongBanPheDuyetTrongBuoc.Contains(x.OrganizationId) &&
                    x.IsManager == 1).Select(y => y.EmployeeId).ToList();

                //Lấy mail từ bảng contact 
                var listEmailTruongBoPhan =
                    context.Contact.Where(x => listEmpIdTruongBoPhan.Contains(x.ObjectId)).ToList();

                listEmailTruongBoPhan.ForEach(item =>
                {
                    if (!String.IsNullOrEmpty(item.WorkEmail))
                    {
                        result.Add(item.WorkEmail.Trim());
                    }
                    else if (!String.IsNullOrEmpty(item.Email))
                    {
                        result.Add(item.Email.Trim());
                    }
                });
            }

            result = result.Where(x => x != null).Select(y => y).Distinct().ToList();

            return result;
        }

        private List<DuLieuQuyTrinhModel> GetListDuLieuQuyTrinhByObject(Guid objectId, int? objectNumber, int doiTuongApDung, Guid cauHinhQuyTrinhId)
        {
            var list = new List<DuLieuQuyTrinhModel>();
            var listCacBuocHienTai = new List<CacBuocApDung>();

            var listDonVi = context.Organization.Select(y => new { y.OrganizationId, y.OrganizationName })
                .ToList();

            if (objectId != Guid.Empty)
            {
                listCacBuocHienTai = context.CacBuocApDung.Where(x => x.ObjectId == objectId &&
                                                                          x.DoiTuongApDung == doiTuongApDung)
                    .OrderBy(z => z.Stt).ToList();
            }
            else if (objectNumber != null && objectNumber != 0)
            {
                listCacBuocHienTai = context.CacBuocApDung.Where(x => x.ObjectNumber == objectNumber &&
                                                                      x.DoiTuongApDung == doiTuongApDung)
                    .OrderBy(z => z.Stt).ToList();
            }

            var listCacBuoc = context.CacBuocQuyTrinh
                    .Where(x => x.CauHinhQuyTrinhId == cauHinhQuyTrinhId)
                    .OrderBy(z => z.Stt).ToList();

            var sttBuocApDungCuoi = listCacBuocHienTai.Count;

            var listCacBuocId = listCacBuoc.Select(y => y.Id).ToList();
            var listPhongBanTrongCacBuoc = context.PhongBanTrongCacBuocQuyTrinh
                .Where(x => listCacBuocId.Contains(x.CacBuocQuyTrinhId)).ToList();
            var listlistCacBuocHienTaiId = listCacBuocHienTai.Select(y => y.Id).ToList();
            var listPhongBanDaPheDuyet = context.PhongBanApDung
                .Where(x => listlistCacBuocHienTaiId.Contains(x.CacBuocApDungId)).ToList();

            listCacBuoc.ForEach(buoc =>
            {
                var buocApDung = listCacBuocHienTai.FirstOrDefault(x => x.Stt == buoc.Stt);

                var duLieu = new DuLieuQuyTrinhModel();

                //Nếu có dữ liệu
                if (buocApDung != null)
                {
                    //Nếu bước đã đc hoàn thành
                    if (buocApDung.TrangThai == 1)
                    {
                        duLieu.IsComplete = true;
                    }
                    //Nếu bước chưa hoàn thành
                    else
                    {
                        //Bước hiện tại
                        if (buoc.Stt == sttBuocApDungCuoi)
                        {
                            duLieu.IsCurrent = true;
                            duLieu.IsActive = true;
                        }
                    }
                }

                //Phê duyệt trưởng bộ phận
                if (buoc.LoaiPheDuyet == 1)
                {
                    duLieu.NodeName = "Phê duyệt trưởng bộ phận";
                    duLieu.Tooltip = duLieu.NodeName;
                }
                //Phòng ban phê duyệt
                else if (buoc.LoaiPheDuyet == 2)
                {
                    //Lấy list Phòng ban
                    var listPhongBan = listPhongBanTrongCacBuoc.Where(x => x.CacBuocQuyTrinhId == buoc.Id)
                        .ToList();

                    //Nếu bước chỉ có 1 phòng ban phê duyệt
                    if (listPhongBan.Count == 1)
                    {
                        var donViId = listPhongBan.Select(y => y.OrganizationId).FirstOrDefault();
                        var donVi = listDonVi.FirstOrDefault(x => x.OrganizationId == donViId);
                        duLieu.NodeName = donVi?.OrganizationName;
                        duLieu.Tooltip = duLieu.NodeName;
                    }
                    //Nếu bước có nhiều hơn 1 phòng ban phê duyệt
                    else if (listPhongBan.Count > 1)
                    {
                        duLieu.NodeName = "Phòng ban phê duyệt";

                        listPhongBan.ForEach(donViPheDuyet =>
                        {
                            var newDonViPheDuyet = new DuLieuPhongBanPheDuyetModel();
                            newDonViPheDuyet.OrganizationId = donViPheDuyet.OrganizationId;
                            newDonViPheDuyet.TrangThai = 0;

                            var donVi = listDonVi.FirstOrDefault(x =>
                                x.OrganizationId == donViPheDuyet.OrganizationId);
                            newDonViPheDuyet.TenDonVi = donVi?.OrganizationName;

                            duLieu.ListDonVi.Add(newDonViPheDuyet);
                        });

                        //Nếu có dữ liệu
                        if (buocApDung != null)
                        {
                            var listDonViDaDuyet = listPhongBanDaPheDuyet
                                .Where(x => x.CacBuocApDungId == buocApDung.Id)
                                .ToList();

                            duLieu.ListDonVi.ForEach(donVi =>
                            {
                                var donViDaDuyet = listDonViDaDuyet.FirstOrDefault(x =>
                                    x.OrganizationId == donVi.OrganizationId);

                                if (donViDaDuyet != null)
                                {
                                    donVi.TrangThai = 1;
                                }
                            });
                        }

                        duLieu.Tooltip = duLieu.ListDonVi
                            .Select(y =>
                                y.TrangThai == 0
                                    ? "<p>- " + y.TenDonVi + ": Chưa phê duyệt</p>"
                                    : "<p>- " + y.TenDonVi + ": Đã phê duyệt</p>")
                            .ToArray().Join(" ");
                    }
                }
                //Phê duyệt trưởng bộ phận cấp trên
                else if (buoc.LoaiPheDuyet == 3)
                {
                    duLieu.NodeName = "Phê duyệt trưởng bộ phận cấp trên";
                    duLieu.Tooltip = duLieu.NodeName;
                }

                list.Add(duLieu);
            });

            return list;
        }

        private void XuLyPheDuyet(out bool isError, out string message, out int tienTrinhPheDuyet, out List<string> listEmail,
            User user, Guid objectId, int? objectNumber, string moTa, int doiTuongApDung, object doiTuongModel)
        {
            isError = false;
            message = "";
            tienTrinhPheDuyet = -1; //1: Là bước cuối cùng, 0; Không phải là bước cuối cùng
            listEmail = new List<string>();

            //Lấy bước hiện tại của Đối tượng
            var buocHienTai = new CacBuocApDung();

            if (objectId != Guid.Empty)
            {
                buocHienTai = context.CacBuocApDung.Where(x => x.ObjectId == objectId &&
                                                               x.DoiTuongApDung == doiTuongApDung &&
                                                               x.TrangThai == 0)
                    .OrderByDescending(z => z.Stt)
                    .FirstOrDefault();
            }
            else if (objectNumber != null && objectNumber != 0)
            {
                buocHienTai = context.CacBuocApDung.Where(x => x.ObjectNumber == objectNumber &&
                                                               x.DoiTuongApDung == doiTuongApDung &&
                                                               x.TrangThai == 0)
                    .OrderByDescending(z => z.Stt)
                    .FirstOrDefault();
            }

            if (buocHienTai == null)
            {
                isError = true;
                message = "Phê duyệt thất bại, không tồn tại bước phê duyệt";
                return;
            }

            if (buocHienTai.TrangThai == 1)
            {
                isError = true;
                message = "Bước hiện tại đã được phê duyệt";
                return;
            }

            //Lấy Quy trình
            var quyTrinh = context.QuyTrinh.FirstOrDefault(x => x.Id == buocHienTai.QuyTrinhId);
            if (quyTrinh == null)
            {
                isError = true;
                message = "Quy trình không tồn tại";
                return;
            }

            //Lấy list Các bước trong Quy trình theo Cấu hình
            var listCacBuoc = context.CacBuocQuyTrinh
                .Where(x => x.CauHinhQuyTrinhId == buocHienTai.CauHinhQuyTrinhId).OrderByDescending(z => z.Stt)
                .ToList();

            int tongSoBuoc = listCacBuoc.Count;

            //Nếu là phê duyệt trưởng bộ phận hoặc là phê duyệt trưởng bộ phận cấp trên
            if (buocHienTai.LoaiPheDuyet == 1 || buocHienTai.LoaiPheDuyet == 3)
            {
                //Đổi trạng thái của bước hiện tại => Đã xong
                buocHienTai.TrangThai = 1;
                context.CacBuocApDung.Update(buocHienTai);

                //Nếu đây là bước cuối cùng của Quy trình => Phê duyệt
                if (buocHienTai.Stt == tongSoBuoc)
                {
                    tienTrinhPheDuyet = 1;
                    ChuyenTrangThaiDoiTuong(objectId, doiTuongApDung, user.UserId, 2, objectNumber.Value);
                }
                //Nếu không phải bước cuối cùng
                else
                {
                    tienTrinhPheDuyet = 0;

                    #region Các case xử lý đặc biệt theo đối tượng áp dụng

                    XuLyDacBietKhiPheDuyet(doiTuongApDung, doiTuongModel, user.UserId);

                    #endregion

                    var buocTiepTheo = listCacBuoc.FirstOrDefault(x => x.Stt == buocHienTai.Stt + 1);

                    //Lấy thông tin Người phê duyệt
                    listEmail = GetListEmail(user.UserId, buocTiepTheo.LoaiPheDuyet, buocTiepTheo);

                    //Thêm bước tiếp vào lịch sử
                    var cacBuocApDung = new CacBuocApDung();
                    cacBuocApDung.Id = Guid.NewGuid();
                    cacBuocApDung.ObjectId = objectId;
                    cacBuocApDung.DoiTuongApDung = doiTuongApDung;
                    cacBuocApDung.QuyTrinhId = quyTrinh.Id;
                    cacBuocApDung.CauHinhQuyTrinhId = buocTiepTheo.CauHinhQuyTrinhId;
                    cacBuocApDung.CacBuocQuyTrinhId = buocTiepTheo.Id;
                    cacBuocApDung.Stt = buocTiepTheo.Stt;
                    cacBuocApDung.LoaiPheDuyet = buocTiepTheo.LoaiPheDuyet;
                    cacBuocApDung.TrangThai = 0;
                    cacBuocApDung.ObjectNumber = objectNumber;
                    context.CacBuocApDung.Add(cacBuocApDung);
                }

                //Thêm vào lịch sử
                var lichSuPheDuyet = new LichSuPheDuyet();
                lichSuPheDuyet.Id = Guid.NewGuid();
                lichSuPheDuyet.ObjectId = objectId;
                lichSuPheDuyet.DoiTuongApDung = doiTuongApDung;
                lichSuPheDuyet.NgayTao = DateTime.Now;
                lichSuPheDuyet.EmployeeId = user.EmployeeId.Value;
                lichSuPheDuyet.OrganizationId = null;
                lichSuPheDuyet.LyDo = moTa;
                lichSuPheDuyet.TrangThai = 1;
                lichSuPheDuyet.ObjectNumber = objectNumber;

                context.LichSuPheDuyet.Add(lichSuPheDuyet);
            }
            //Nếu là phòng ban phê duyệt
            else if (buocHienTai.LoaiPheDuyet == 2)
            {
                //Lấy các phòng ban đã phê duyệt bước hiện tại
                var listDonViIdDaPheDuyet = context.PhongBanApDung
                    .Where(x => x.CacBuocApDungId == buocHienTai.Id &&
                                x.CacBuocQuyTrinhId == buocHienTai.CacBuocQuyTrinhId)
                    .Select(y => y.OrganizationId).ToList();

                //Lấy các phòng chưa phê duyệt ở bước hiện tại
                var listDonViId = context.PhongBanTrongCacBuocQuyTrinh
                    .Where(x => x.CacBuocQuyTrinhId == buocHienTai.CacBuocQuyTrinhId &&
                                !listDonViIdDaPheDuyet.Contains(x.OrganizationId))
                    .Select(y => y.OrganizationId).ToList();

                //Lấy phòng ban mà người phê duyệt là Trưởng bộ phận
                var listDonViId_NguoiPheDuyet =
                    context.ThanhVienPhongBan.Where(x => x.EmployeeId == user.EmployeeId &&
                                                         x.IsManager == 1)
                        .Select(y => y.OrganizationId).ToList();

                //Lấy phòng ban sẽ phê duyệt bước hiện tại
                var listDonViIdPheDuyet = listDonViId_NguoiPheDuyet.Where(x => listDonViId.Contains(x)).ToList();
                if (listDonViIdPheDuyet.Count == 0)
                {
                    isError = true;
                    message = "Phê duyệt thất bại, phòng ban người dùng không hợp lệ";
                    return;
                }

                var listPhongBanApDung = new List<PhongBanApDung>();
                var listLichSuPheDuyet = new List<LichSuPheDuyet>();

                listDonViIdPheDuyet.ForEach(donViId =>
                {
                    var phongBanApDung = new PhongBanApDung();
                    phongBanApDung.Id = Guid.NewGuid();
                    phongBanApDung.CacBuocApDungId = buocHienTai.Id;
                    phongBanApDung.OrganizationId = donViId;
                    phongBanApDung.CacBuocQuyTrinhId = buocHienTai.CacBuocQuyTrinhId;

                    listPhongBanApDung.Add(phongBanApDung);

                    var lichSuPheDuyet = new LichSuPheDuyet();
                    lichSuPheDuyet.Id = Guid.NewGuid();
                    lichSuPheDuyet.ObjectId = objectId;
                    lichSuPheDuyet.DoiTuongApDung = doiTuongApDung;
                    lichSuPheDuyet.NgayTao = DateTime.Now;
                    lichSuPheDuyet.EmployeeId = user.EmployeeId.Value;
                    lichSuPheDuyet.OrganizationId = donViId;
                    lichSuPheDuyet.LyDo = moTa;
                    lichSuPheDuyet.TrangThai = 1;
                    lichSuPheDuyet.ObjectNumber = objectNumber;

                    listLichSuPheDuyet.Add(lichSuPheDuyet);
                });

                context.PhongBanApDung.AddRange(listPhongBanApDung);
                context.LichSuPheDuyet.AddRange(listLichSuPheDuyet);

                // Nếu tất cả phòng ban đều đã phê duyệt:
                // (Số phòng ban chưa phê duyệt == Số phòng ban phê duyệt ở bước hiện tại)
                if (listDonViId.Count == listPhongBanApDung.Count)
                {
                    //Đổi trạng thái của bước hiện tại => Đã xong
                    buocHienTai.TrangThai = 1;
                    context.CacBuocApDung.Update(buocHienTai);

                    //Nếu đây là bước cuối cùng của Quy trình => Phê duyệt
                    if (buocHienTai.Stt == tongSoBuoc)
                    {
                        tienTrinhPheDuyet = 1;
                        ChuyenTrangThaiDoiTuong(objectId, doiTuongApDung, user.UserId, 2, objectNumber.Value);
                    }
                    //Nếu không phải bước cuối cùng
                    else
                    {
                        tienTrinhPheDuyet = 0;

                        #region Các case xử lý đặc biệt theo đối tượng áp dụng

                        XuLyDacBietKhiPheDuyet(doiTuongApDung, doiTuongModel, user.UserId);

                        #endregion

                        var buocTiepTheo = listCacBuoc.FirstOrDefault(x => x.Stt == buocHienTai.Stt + 1);

                        //Lấy thông tin Người phê duyệt
                        listEmail = GetListEmail(user.UserId, buocTiepTheo.LoaiPheDuyet, buocTiepTheo);

                        //Thêm bước tiếp vào lịch sử
                        var cacBuocApDung = new CacBuocApDung();
                        cacBuocApDung.Id = Guid.NewGuid();
                        cacBuocApDung.ObjectId = objectId;
                        cacBuocApDung.DoiTuongApDung = doiTuongApDung;
                        cacBuocApDung.QuyTrinhId = quyTrinh.Id;
                        cacBuocApDung.CauHinhQuyTrinhId = buocTiepTheo.CauHinhQuyTrinhId;
                        cacBuocApDung.CacBuocQuyTrinhId = buocTiepTheo.Id;
                        cacBuocApDung.Stt = buocTiepTheo.Stt;
                        cacBuocApDung.LoaiPheDuyet = buocTiepTheo.LoaiPheDuyet;
                        cacBuocApDung.TrangThai = 0;
                        cacBuocApDung.ObjectNumber = objectNumber;

                        context.CacBuocApDung.Add(cacBuocApDung);
                    }
                }
            }

            ThemGhiChu(objectId, doiTuongApDung, user.UserId, 2, moTa, objectNumber.Value);

            context.SaveChanges();
        }

        private void XuLyDacBietKhiPheDuyet(int doiTuongApDung, object doiTuongModel, Guid userId)
        {
            //Đề xuất tăng lương
            if (doiTuongApDung == 10)
            {
                #region Chuyển trạng thái nhân viên trong đề xuất

                var deXuatTangLuong = doiTuongModel as DeXuatTangLuong;

                var listTrangThaiNV = GeneralList.GetTrangThais("DXTangLuongNhanVien");
                var deXuatTangLuongNV = context.DeXuatTangLuongNhanVien
                    .Where(x => x.DeXuatTangLuongId == deXuatTangLuong.DeXuatTangLuongId).ToList();

                //Danh sách nhân viên được đề xuất
                deXuatTangLuongNV.ForEach(item =>
                {
                    //Chuyển trạng thái nhân viên Phê duyệt => Chờ phê duyệt sau khi quy trình chuyển sang bước mới
                    if (item.TrangThai == 3)
                    {
                        item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 2).Value;
                    }
                    item.UpdatedById = userId;
                    item.UpdatedDate = DateTime.Now;
                });

                context.DeXuatTangLuongNhanVien.UpdateRange(deXuatTangLuongNV);

                #endregion
            }
            //Đề xuất thay đổi chức vụ
            else if (doiTuongApDung == 11)
            {
                #region Chuyển trạng thái nhân viên trong đề xuất

                var deXuatThayDoiChucVu = doiTuongModel as DeXuatThayDoiChucVu;

                var listTrangThaiNV = GeneralList.GetTrangThais("DXThayDoiChucVuNhanVien");
                var listNhanVienDeXuat = context.NhanVienDeXuatThayDoiChucVu
                    .Where(x => x.DeXuatThayDoiChucVuId == deXuatThayDoiChucVu.DeXuatThayDoiChucVuId).ToList();

                //Danh sách nhân viên được đề xuất
                listNhanVienDeXuat.ForEach(item =>
                {
                    //Chuyển trạng thái nhân viên Phê duyệt => Chờ phê duyệt sau khi quy trình chuyển sang bước mới
                    if (item.TrangThai == 3)
                    {
                        item.TrangThai = (byte)listTrangThaiNV.FirstOrDefault(x => x.Value == 2).Value;
                    }
                    item.UpdatedById = userId;
                    item.UpdatedDate = DateTime.Now;
                });

                context.NhanVienDeXuatThayDoiChucVu.UpdateRange(listNhanVienDeXuat);

                #endregion
            }
        }

        private bool KiemTraTrangThaiDoiTuongGuiPheDuyet(Guid? ObjectId, int? ObjectNumber, int DoiTuongApDung)
        {
            bool result = true;

            switch (DoiTuongApDung)
            {
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    break;
                case 6:
                    break;
                case 7:
                    break;
                case 8:
                    break;
                case 9:

                    #region Đề xuất xin nghỉ

                    var dxxn = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == ObjectNumber);

                    //Nếu trạng thái khác Mới
                    if (dxxn.TrangThaiId != 0) result = false;

                    #endregion

                    break;
                case 10:
                    break;
                case 11:
                    break;
                case 12:
                    break;
                case 13:
                    break;
                case 14:

                    #region Kỳ lương

                    var kyLuong = context.KyLuong.FirstOrDefault(x => x.KyLuongId == ObjectNumber);

                    //Nếu trạng thái khác Mới
                    if (kyLuong.TrangThai != 1) result = false;

                    #endregion

                    break;
                case 20:
                    break;
                case 21:
                    break;
                case 22:
                    break;
                case 30:
                    break;
            }

            return result;
        }

        private bool CheckResetQuyTrinh(QuyTrinhModel QuyTrinh, Guid UserId, List<CauHinhQuyTrinhModel> ListCauHinhQuyTrinh,
            bool isReset, out List<string> ListCode)
        {
            bool checkChange = false;
            ListCode = new List<string>();

            var paramGetDetail = new GetDetailQuyTrinhParameter();
            paramGetDetail.Id = QuyTrinh.Id.Value;
            paramGetDetail.UserId = UserId;
            var detailQuyTrinhOld = GetDetailQuyTrinh(paramGetDetail);

            var lisOldCauHinhQuyTrinh = detailQuyTrinhOld.ListCauHinhQuyTrinh.OrderBy(z => z.SoTienTu).ToList();
            var listNewCauHinhQuyTrinh = ListCauHinhQuyTrinh.OrderBy(z => z.SoTienTu).ToList();

            //Nếu số lượng cấu hình giống nhau
            if (listNewCauHinhQuyTrinh.Count == lisOldCauHinhQuyTrinh.Count)
            {
                for (int i = 0; i < listNewCauHinhQuyTrinh.Count; i++)
                {
                    var oldCauHinh = lisOldCauHinhQuyTrinh[i];
                    var newCauHinh = listNewCauHinhQuyTrinh[i];

                    //Nếu số tiền thay đổi
                    if (oldCauHinh.SoTienTu != newCauHinh.SoTienTu)
                    {
                        checkChange = true;
                        break;
                    }
                    //Nếu số lượng các bước trong cấu hình thay đổi
                    else if (oldCauHinh.ListCacBuocQuyTrinh.Count != newCauHinh.ListCacBuocQuyTrinh.Count)
                    {
                        checkChange = true;
                        break;
                    }
                    //Nếu số tiền không thay đổi và số lượng các bước trong cấu hình không thay đổi
                    else
                    {
                        var listOldCacBuocQuyTrinh = oldCauHinh.ListCacBuocQuyTrinh.OrderBy(z => z.Stt).ToList();
                        var listNewCacBuocQuyTrinh = newCauHinh.ListCacBuocQuyTrinh.OrderBy(z => z.Stt).ToList();

                        for (int j = 0; j < listOldCacBuocQuyTrinh.Count; j++)
                        {
                            var oldCacBuocQuyTrinh = listOldCacBuocQuyTrinh[j];
                            var newCacBuocQuyTrinh = listNewCacBuocQuyTrinh[j];

                            //Nếu loại phê duyệt thay đổi
                            if (oldCacBuocQuyTrinh.LoaiPheDuyet != newCacBuocQuyTrinh.LoaiPheDuyet)
                            {
                                checkChange = true;
                                break;
                            }
                            //Nếu số lượng phòng ban trong bước thay đổi
                            else if (oldCacBuocQuyTrinh.ListPhongBanTrongCacBuocQuyTrinh.Count !=
                                     newCacBuocQuyTrinh.ListPhongBanTrongCacBuocQuyTrinh.Count)
                            {
                                checkChange = true;
                                break;
                            }
                            /*
                             * Nếu loại phê duyệt không thay đổi và Số lượng phòng ban trong bước không thay đổi và
                             * Số lượng phòng ban trong bước > 0
                             */
                            else if (oldCacBuocQuyTrinh.ListPhongBanTrongCacBuocQuyTrinh.Count > 0)
                            {
                                var listOldIdPhongBanTrongCacBuoc =
                                    oldCacBuocQuyTrinh.ListPhongBanTrongCacBuocQuyTrinh
                                        .Select(y => y.OrganizationId).ToList();
                                var listNewIdPhongBanTrongCacBuoc =
                                    newCacBuocQuyTrinh.ListPhongBanTrongCacBuocQuyTrinh
                                        .Select(y => y.OrganizationId).ToList();

                                for (int k = 0; k < listOldIdPhongBanTrongCacBuoc.Count; k++)
                                {
                                    var phongBanId = listOldIdPhongBanTrongCacBuoc[k];

                                    var exists = listNewIdPhongBanTrongCacBuoc.Contains(phongBanId);

                                    //Nếu có phòng ban không tồn tại
                                    if (!exists)
                                    {
                                        checkChange = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            //Nếu số lượng cấu hình khác nhau
            else
            {
                checkChange = true;
            }

            if (checkChange)
            {
                if (QuyTrinh.DoiTuongApDung == 1)
                {

                }
                else if (QuyTrinh.DoiTuongApDung == 2)
                {

                }
                //Báo giá
                else if (QuyTrinh.DoiTuongApDung == 3)
                {
                    var categoryType = context.CategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TGI");
                    var statusChoPheDuyet = context.Category.FirstOrDefault(c =>
                        c.CategoryTypeId == categoryType.CategoryTypeId && c.CategoryCode == "CHO");

                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.Quote.Where(x => x.StatusId == statusChoPheDuyet.CategoryId).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.QuoteId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => listObjectId.Contains(x.ObjectId)).ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.QuoteCode).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            var trangThai = context.Category.FirstOrDefault(c =>
                                c.CategoryTypeId == categoryType.CategoryTypeId && c.CategoryCode == "MTA");

                            //Đổi trạng thái => Mới (Nháp)
                            listDoiTuong.ForEach(item => { item.StatusId = trangThai?.CategoryId; });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.Quote.UpdateRange(listDoiTuong);
                        }
                    }
                }
                else if (QuyTrinh.DoiTuongApDung == 4)
                {

                }
                else if (QuyTrinh.DoiTuongApDung == 5)
                {

                }
                else if (QuyTrinh.DoiTuongApDung == 6)
                {

                }
                else if (QuyTrinh.DoiTuongApDung == 7)
                {

                }
                else if (QuyTrinh.DoiTuongApDung == 8)
                {

                }
                //Đề xuất xin nghỉ
                else if (QuyTrinh.DoiTuongApDung == 9)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.DeXuatXinNghi.Where(x => x.TrangThaiId == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.DeXuatXinNghiId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 9)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.Code).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThaiId = 0;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.DeXuatXinNghiId;
                                note.ObjectType = NoteObjectType.DXXN;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.DeXuatXinNghi.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Đề xuất tăng lương
                else if (QuyTrinh.DoiTuongApDung == 10)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.DeXuatTangLuong.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.DeXuatTangLuongId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 10)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.TenDeXuat).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.DeXuatTangLuongId;
                                note.ObjectType = NoteObjectType.DXTL;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.DeXuatTangLuong.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Đề xuất chức vụ
                else if (QuyTrinh.DoiTuongApDung == 11)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.DeXuatThayDoiChucVu.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.DeXuatThayDoiChucVuId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 11)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.TenDeXuat).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.DeXuatThayDoiChucVuId;
                                note.ObjectType = NoteObjectType.DXCV;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.DeXuatThayDoiChucVu.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Đề xuất kế hoạch OT 
                else if (QuyTrinh.DoiTuongApDung == 12)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.KeHoachOt.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.KeHoachOtId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 12)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.TenKeHoach).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.KeHoachOtId;
                                note.ObjectType = NoteObjectType.DXKHOT;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.KeHoachOt.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Đề xuất đăng ký OT
                else if (QuyTrinh.DoiTuongApDung == 13)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.KeHoachOt.Where(x => x.TrangThai == 4).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.KeHoachOtId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 13)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.TenKeHoach).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => chờ đăng ký OT
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 3;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về chờ đăng ký OT vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.KeHoachOtId;
                                note.ObjectType = NoteObjectType.DKOT;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.KeHoachOt.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Kỳ lương
                else if (QuyTrinh.DoiTuongApDung == 14)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.KyLuong.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.KyLuongId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 14)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.TenKyLuong).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.KyLuongId;
                                note.ObjectType = NoteObjectType.KYLUONG;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.KyLuong.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Yêu cầu cấp phát
                else if (QuyTrinh.DoiTuongApDung == 20)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.YeuCauCapPhatTaiSan.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.YeuCauCapPhatTaiSanId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == 20)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.MaYeuCau).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.YeuCauCapPhatTaiSanId;
                                note.ObjectType = NoteObjectType.YCCAPPHAT;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.YeuCauCapPhatTaiSan.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Đề nghị tạm ứng/hoàn ứng
                else if (QuyTrinh.DoiTuongApDung == 21 || QuyTrinh.DoiTuongApDung == 22)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.DeNghiTamHoanUng.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.DeNghiTamHoanUngId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == QuyTrinh.DoiTuongApDung)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.MaDeNghi).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.DeNghiTamHoanUngId;
                                note.ObjectType = NoteObjectType.DENGHIHOANTAMUNG;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.DeNghiTamHoanUng.UpdateRange(listDoiTuong);
                        }
                    }
                }
                //Đề xuất công tác
                else if (QuyTrinh.DoiTuongApDung == 30)
                {
                    //Lấy list đối tượng có trạng thái Chờ phê duyệt
                    var listDoiTuong = context.DeXuatCongTac.Where(x => x.TrangThai == 2).ToList();
                    var listObjectId = listDoiTuong.Select(x => x.DeXuatCongTacId).ToList();

                    var listCacBuocApDung = context.CacBuocApDung
                        .Where(x => x.ObjectNumber != null && listObjectId.Contains(x.ObjectNumber.Value) && x.DoiTuongApDung == QuyTrinh.DoiTuongApDung)
                        .ToList();
                    var listCacBuocApDungId = listCacBuocApDung.Select(y => y.Id).ToList();

                    var listPhongBanApDung = context.PhongBanApDung
                        .Where(x => listCacBuocApDungId.Contains(x.CacBuocApDungId)).ToList();

                    //Nếu không có đối tượng nào thì cho cập nhật quy trình
                    if (listDoiTuong.Count == 0)
                    {
                        checkChange = false;
                    }
                    //Nếu có đối tượng đang thực hiện chưa xong quy trình
                    else
                    {
                        ListCode = listDoiTuong.Select(y => y.TenDeXuat).ToList();

                        //Nếu muốn đổi trạng thái và reset các bước của quy trình
                        if (isReset)
                        {
                            //Đổi trạng thái => Mới
                            listDoiTuong.ForEach(item =>
                            {
                                item.TrangThai = 1;

                                //Thêm ghi chú
                                Note note = new Note();
                                note.NoteId = Guid.NewGuid();
                                note.ObjectId = Guid.Empty;
                                note.Description = "Đề xuất đã được chuyển trạng thái về Mới vì quy trình phê duyệt đã được thay đổi";
                                note.Type = "ADD";
                                note.Active = true;
                                note.CreatedById = UserId;
                                note.CreatedDate = DateTime.Now;
                                note.NoteTitle = "Đã thêm ghi chú";
                                note.ObjectNumber = item.DeXuatCongTacId;
                                note.ObjectType = NoteObjectType.DENGHIHOANTAMUNG;

                                context.Note.Add(note);
                            });

                            context.CacBuocApDung.RemoveRange(listCacBuocApDung);
                            context.PhongBanApDung.RemoveRange(listPhongBanApDung);
                            context.DeXuatCongTac.UpdateRange(listDoiTuong);
                        }
                    }
                }
            }

            return checkChange;
        }

        private void UpdateDuLieuChamCong(DeXuatXinNghi dxxn, Guid userId)
        {
            //Nếu không phải Đi muộn, Về sớm
            if (dxxn.LoaiDeXuatId != 12 && dxxn.LoaiDeXuatId != 13)
            {
                var listDxnnChiTiet = context.DeXuatXinNghiChiTiet
                    .Where(x => x.DeXuatXinNghiId == dxxn.DeXuatXinNghiId)
                    .ToList();

                var listDate = listDxnnChiTiet.Select(y => y.Ngay.Date).OrderBy(z => z).Distinct().ToList();

                var listChamCong = context.ChamCong.Where(x => x.EmployeeId == dxxn.EmployeeId).ToList();
                var listCreateChamCong = new List<ChamCong>();
                var listUpdateChamCong = new List<ChamCong>();

                listDate.ForEach(date =>
                {
                    var existsChamCong = listChamCong.FirstOrDefault(x => x.NgayChamCong.Date == date);
                    var listXinNghi = listDxnnChiTiet.Where(x => x.Ngay.Date == date).ToList();
                    var caSang = listXinNghi.FirstOrDefault(x => x.LoaiCaLamViecId == 1);
                    var caChieu = listXinNghi.FirstOrDefault(x => x.LoaiCaLamViecId == 2);

                    //Nếu đã có dữ liệu chấm công
                    if (existsChamCong != null)
                    {
                        //Nếu nghỉ ca sáng
                        if (caSang != null)
                        {
                            existsChamCong.KyHieuVaoSang = dxxn.LoaiDeXuatId;
                            existsChamCong.KyHieuRaSang = dxxn.LoaiDeXuatId;
                        }

                        //Nếu nghỉ ca chiều
                        if (caChieu != null)
                        {
                            existsChamCong.KyHieuVaoChieu = dxxn.LoaiDeXuatId;
                            existsChamCong.KyHieuRaChieu = dxxn.LoaiDeXuatId;
                        }

                        listUpdateChamCong.Add(existsChamCong);
                    }
                    //Nếu chưa có dữ liệu chấm công
                    else
                    {
                        var chamCong = new ChamCong();
                        chamCong.EmployeeId = dxxn.EmployeeId;
                        chamCong.NgayChamCong = date;
                        chamCong.CreatedDate = DateTime.Now;
                        chamCong.CreatedById = userId;

                        //Nếu nghỉ ca sáng
                        if (caSang != null)
                        {
                            chamCong.KyHieuVaoSang = dxxn.LoaiDeXuatId;
                            chamCong.KyHieuRaSang = dxxn.LoaiDeXuatId;
                        }

                        //Nếu nghỉ ca chiều
                        if (caChieu != null)
                        {
                            chamCong.KyHieuVaoChieu = dxxn.LoaiDeXuatId;
                            chamCong.KyHieuRaChieu = dxxn.LoaiDeXuatId;
                        }

                        listCreateChamCong.Add(chamCong);
                    }
                });

                context.ChamCong.UpdateRange(listUpdateChamCong);
                context.ChamCong.AddRange(listCreateChamCong);
            }
        }

        private void XuLyPhongBanPheDuyetDoiTuong(int doiTuongApDung, CauHinhQuyTrinh cauHinhQuyTrinh, int? objectNumber, Guid? objectId)
        {
            #region Xóa list data cũ

            var listOld = new List<PhongBanPheDuyetDoiTuong>();
            //Xóa data trong bảng mapping
            if (objectId != null && objectId != Guid.Empty)
            {
                listOld = context.PhongBanPheDuyetDoiTuong.Where(x =>
                        x.DoiTuongApDung == doiTuongApDung && x.ObjectId == objectId)
                    .ToList();
            }
            //Xóa data
            else if (objectNumber != null && objectNumber != 0)
            {
                listOld = context.PhongBanPheDuyetDoiTuong.Where(x =>
                        x.DoiTuongApDung == doiTuongApDung && x.ObjectNumber == objectNumber)
                    .ToList();
            }

            context.PhongBanPheDuyetDoiTuong.RemoveRange(listOld);

            #endregion

            //Lấy list các bước trong quy trình
            var listCacBuocQuyTrinh = context.CacBuocQuyTrinh.Where(x => x.CauHinhQuyTrinhId == cauHinhQuyTrinh.Id)
                .ToList();
            var listCacBuocQuyTrinhId = listCacBuocQuyTrinh.Select(y => y.Id).ToList();

            //Lấy list phòng ban phê duyệt
            var listPhongBanId = context.PhongBanTrongCacBuocQuyTrinh
                .Where(x => listCacBuocQuyTrinhId.Contains(x.CacBuocQuyTrinhId)).Select(y => y.OrganizationId)
                .ToList();

            //Kiểm tra xem có loại phê duyệt trưởng bộ phận (1) hay không?
            var count = listCacBuocQuyTrinh.Count(x => x.LoaiPheDuyet == 1);

            Guid? userId = null;

            //Đề xuất xin nghỉ
            if (doiTuongApDung == 9 && count > 0)
            {
                //Lấy đối tượng
                userId = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == objectNumber)?.CreatedById;
            }
            //Đề xuất tăng lương
            else if (doiTuongApDung == 10 && count > 0)
            {
                //Lấy đối tượng
                userId = context.DeXuatTangLuong.FirstOrDefault(x => x.DeXuatTangLuongId == objectNumber)?.CreatedById;
            }
            //Đề xuất chức vụ
            else if (doiTuongApDung == 11 && count > 0)
            {
                //Lấy đối tượng
                userId = context.DeXuatThayDoiChucVu.FirstOrDefault(x => x.DeXuatThayDoiChucVuId == objectNumber)?.CreatedById;
            }
            //Đề xuất kế hoạch OT hoặc Đăng ký OT
            else if ((doiTuongApDung == 12 || doiTuongApDung == 13) && count > 0)
            {
                //Lấy đối tượng
                userId = context.KeHoachOt.FirstOrDefault(x => x.KeHoachOtId == objectNumber)?.CreatedById;
            }
            //Kỳ lương
            else if (doiTuongApDung == 14 && count > 0)
            {
                //Lấy đối tượng
                userId = context.KyLuong.FirstOrDefault(x => x.KyLuongId == objectNumber)?.CreatedById;
            }
            //Yêu cầu cấp phát
            else if (doiTuongApDung == 20 && count > 0)
            {
                //Lấy đối tượng
                userId = context.YeuCauCapPhatTaiSan.FirstOrDefault(x => x.YeuCauCapPhatTaiSanId == objectNumber)?.CreatedById;
            }
            //Đề nghị tạm/hoàn ứng
            else if ((doiTuongApDung == 21 || doiTuongApDung == 22) && count > 0)
            {
                //Lấy đối tượng
                userId = context.DeNghiTamHoanUng.FirstOrDefault(x => x.DeNghiTamHoanUngId == objectNumber)?.CreatedById;
            }
            //Đề xuất công tác
            else if (doiTuongApDung == 30 && count > 0)
            {
                //Lấy đối tượng
                userId = context.DeXuatCongTac.FirstOrDefault(x => x.DeXuatCongTacId == objectNumber)?.CreatedById;
            }

            if (userId != Guid.Empty && userId != null)
            {
                var user = context.User.FirstOrDefault(x => x.UserId == userId);

                var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId);

                //Thêm phòng ban vào list
                if (emp?.OrganizationId != null) listPhongBanId.Add(emp.OrganizationId.Value);
            }

            listPhongBanId = listPhongBanId.Distinct().ToList();

            var list = new List<PhongBanPheDuyetDoiTuong>();
            //Thêm vào bảng mapping
            listPhongBanId.ForEach(item =>
            {
                var newItem = new PhongBanPheDuyetDoiTuong();
                newItem.DoiTuongApDung = doiTuongApDung;
                newItem.OrganizationId = item;
                newItem.ObjectNumber = objectNumber;
                newItem.ObjectId = objectId;
                newItem.IsPheDuyetCapTren = false;

                list.Add(newItem);
            });

            //Kiểm tra xem có loại phê duyệt Trưởng bộ phận cấp trên (3) hay không?
            var _count = listCacBuocQuyTrinh.Count(x => x.LoaiPheDuyet == 3);

            //Đề xuất xin nghỉ
            if (doiTuongApDung == 9 && _count > 0)
            {
                var empId = context.DeXuatXinNghi.FirstOrDefault(x => x.DeXuatXinNghiId == objectNumber)?.EmployeeId;
                var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == empId);

                //Lấy phòng ban chính của nhân viên
                var thanhVienPhongBan =
                    context.ThanhVienPhongBan.FirstOrDefault(x => x.IsPhongBanChinh == true && x.EmployeeId == empId);

                var phongBan =
                    context.Organization.FirstOrDefault(x => x.OrganizationId == thanhVienPhongBan.OrganizationId);

                //Nếu là root
                if (phongBan?.Level == 0)
                {
                    listPhongBanId.Add(emp.OrganizationId.Value);
                }
                //Nếu không phải root
                else if (phongBan?.Level > 0)
                {
                    //Lấy phòng ban cha trực thuộc
                    var phongBanCha = context.Organization.FirstOrDefault(x => x.OrganizationId == phongBan.ParentId);

                    var exists = list.FirstOrDefault(x => x.OrganizationId == phongBanCha.OrganizationId);

                    //Nếu phòng ban cha chưa có trong danh sách
                    if (exists == null)
                    {
                        var newItem = new PhongBanPheDuyetDoiTuong();
                        newItem.DoiTuongApDung = doiTuongApDung;
                        newItem.OrganizationId = phongBanCha.OrganizationId;
                        newItem.ObjectNumber = objectNumber;
                        newItem.ObjectId = objectId;
                        newItem.IsPheDuyetCapTren = true;

                        list.Add(newItem);
                    }
                    //Nếu phòng ban cha đã có trong danh sách
                    else
                    {
                        exists.IsPheDuyetCapTren = true;
                    }
                }
            }

            context.PhongBanPheDuyetDoiTuong.AddRange(list);
        }
    }

    public class SanPhamBaoGia
    {
        public decimal SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal TyGia { get; set; }
        public decimal ThanhTienNhanCong { get; set; }
        public bool LoaiChietKhau { get; set; }
        public decimal GiaTriChietKhau { get; set; }
        public decimal PhanTramThue { get; set; }
    }
}
