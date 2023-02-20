using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Annotations;
using Hangfire.Server;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TN.TNM.DataAccess.Databases;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Project;
using TN.TNM.DataAccess.Models.Task;

namespace TN.TNM.Api.RecurringJobs
{
    public class RecurringJobsService : BackgroundService
    {
        private readonly IBackgroundJobClient _backgroundJobs;
        private readonly IRecurringJobManager _recurringJobs;
        private readonly ILogger<RecurringJobScheduler> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public RecurringJobsService(
            [NotNull] IBackgroundJobClient backgroundJobs,
            [NotNull] IRecurringJobManager recurringJobs,
            [NotNull] ILogger<RecurringJobScheduler> logger,
            [NotNull] IServiceScopeFactory scopeFactory)
        {
            _backgroundJobs = backgroundJobs ?? throw new ArgumentNullException(nameof(backgroundJobs));
            _recurringJobs = recurringJobs ?? throw new ArgumentNullException(nameof(recurringJobs));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _scopeFactory = scopeFactory;
        }

        protected override System.Threading.Tasks.Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                //_recurringJobs.AddOrUpdate("Cập nhật trạng thái công việc",
                //    () => UpdateStatusTask(),
                //    "*/2 * * * *", TimeZoneInfo.Local); //Cập nhật lúc 2p/1 lần
                RecurringJob.RemoveIfExists("StatusTask");
                _recurringJobs.AddOrUpdate("StatusTask",
                    () => UpdateStatusTask(),
                    "*/59 * * * *", TimeZoneInfo.Local); //Cập nhật lúc 1h sáng
                RecurringJob.RemoveIfExists("EVMDaily");
                _recurringJobs.AddOrUpdate("EVMDaily",
                    () => CalculatorProjectCostEveryDay(),
                    "*/59 * * * *", TimeZoneInfo.Local);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }

            return System.Threading.Tasks.Task.CompletedTask;
        }

        #region Cập nhật trạng thái tự động cho công việc theo ngày bắt đầu thực tế và ngày kết thúc thực tế (TH ngày bắt đầu/ngày kết thúc thực tế > ngày hiện tại)
        public void UpdateStatusTask()
        {
            var currentTime = DateTime.Now;
            using (var scope = _scopeFactory.CreateScope())
            {
                var _context = scope.ServiceProvider.GetRequiredService<TenantContext>();
                var listTenant = _context.Tenants.ToList();
                var listAllTask = _context.Task.ToList();

                #region Trạng thái công việc

                var typeStatusTaskId = _context.CategoryType.Where(c => c.CategoryTypeCode == "TTCV")
                    .Select(x => x.CategoryTypeId).ToList();
                var listStatus = _context.Category.Where(c => typeStatusTaskId.Contains(c.CategoryTypeId) && c.Active == true).ToList();
                
                // moi
                var newStatusId = listStatus.Where(c => c.CategoryCode == "NEW").Select(x => x.CategoryId).ToList();
                
                // dang lam
                var listDangLamStatus = listStatus.Where(c => c.CategoryCode == "DL").ToList();
                var dangLamStatusId = listDangLamStatus.Select(x => x.CategoryId).ToList();
                
                // hoan thanh
                var listHoanThanhStatusId = listStatus.Where(c => c.CategoryCode == "HT").ToList();
                var hoanThanhStatusId = listHoanThanhStatusId.Select(x => x.CategoryId).ToList();
                
                // dong
                var dongStatusId = listStatus.Where(c => c.CategoryCode == "CLOSE").Select(x => x.CategoryId).ToList();
                #endregion

                #region Update công việc trạng thái mới nhưng có ngày bắt đầu thực tế

                var listdlTask = listAllTask.Where(c =>
                    c.Status != null && newStatusId.Contains((Guid) c.Status) && c.ActualStartTime != null &&
                    c.ActualStartTime.Value.Date == currentTime.Date).ToList();
                listdlTask.ForEach(item =>
                {
                    item.Status = listDangLamStatus.FirstOrDefault(x => x.TenantId == item.TenantId)?.CategoryId;
                });

                _context.Task.UpdateRange(listdlTask);
                #endregion

                #region Update công việc trạng thái đang thực hiện, hoàn thành nhưng có ngày kết thúc thực tế

                var listWillCloseTask = listAllTask.Where(c =>
                    c.Status != null && dangLamStatusId.Contains((Guid) c.Status) && c.ActualEndTime != null &&
                    c.ActualEndTime.Value.Date == currentTime.Date).ToList();

                listWillCloseTask.ForEach(item =>
                {
                    item.Status = listHoanThanhStatusId.FirstOrDefault(x => x.TenantId == item.TenantId)?.CategoryId;
                    item.TaskComplate = 100;
                });
                _context.Task.UpdateRange(listWillCloseTask);
                _context.SaveChanges();
                #endregion

                var guid = Guid.NewGuid();
                var note = new Note
                {
                    NoteId = guid,
                    ObjectType = "LOGHANGFIRE",
                    ObjectId = guid,
                    Type = "HAF",
                    Active = true,
                    CreatedById = guid,
                    CreatedDate = DateTime.Now,
                    NoteTitle = "StatusTask",
                    Description = DateTime.Now.ToString() + " - Chạy xong Job update trạng thái"
                };
                _context.Note.Add(note);

                _context.SaveChanges();
            };
        }
        #endregion
        
        public void CalculatorProjectCostEveryDay()
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var _context = scope.ServiceProvider.GetRequiredService<TenantContext>();

                    var listProjectCostReport = new List<ProjectCostReport>();
                    // Trạng thái của Project của tất cả tenant
                    var listTypeStatusProjectId = _context.CategoryType.Where(c => c.CategoryTypeCode == "DAT")
                        .Select(m => m.CategoryTypeId).ToList();
                    // Tất cả các trạng thái khác Đóng
                    var listStatusProjectId = _context.Category
                        .Where(c => listTypeStatusProjectId.Contains(c.CategoryTypeId) && c.CategoryCode != "DON")
                        .Select(m => m.CategoryId).ToList();

                    #region Trạng thái công việc

                    var lstTypeStatusTaskId = _context.CategoryType.Where(c => c.CategoryTypeCode == "TTCV")
                        .Select(m => m.CategoryTypeId).ToList();
                    var listTaskStatus = _context.Category.Where(c => lstTypeStatusTaskId.Contains(c.CategoryTypeId))
                        .ToList();

                    #endregion

                    // Lấy tất cả dự án của trạng thái khác Đóng
                    var listAllProject = _context.Project.Where(c => listStatusProjectId.Contains(c.ProjectStatus.Value))
                        .ToList();

                    #region Common Data

                    var listAllTask = _context.Task.ToList();
                    var listAllEmployee = _context.Employee.ToList();
                    var listAllProjectResorce = _context.ProjectResource.ToList();
                    //var listAllTaskResourceMapping = _context.TaskResourceMapping.ToList();

                    //var currentDate = DateTime.Now.Date;

                    #endregion

                    //// Đề xuất xin nghỉ - Nghỉ Phép
                    //var listAbsentPermissionId = _context.Category.Where(ct => ct.CategoryCode.Trim() == "NP")
                    //    .Select(m => m.CategoryId).ToList();
                    //// Đề xuất xin nghỉ - Nghỉ Không Phép
                    //var listAbsentWithoutPermissionId = _context.Category.Where(ct => ct.CategoryCode.Trim() == "NKL")
                    //    .Select(m => m.CategoryId).ToList();

                    //var listCaSangId = _context.Category.Where(c => c.CategoryCode == "SAN").Select(m => m.CategoryId)
                    //    .ToList();
                    //var listCaChieuId = _context.Category.Where(c => c.CategoryCode == "CHI").Select(m => m.CategoryId)
                    //    .ToList();

                    //var listTypeTrangThaiDeXuatPheDuyet = _context.CategoryType.Where(c => c.CategoryTypeCode == "DDU")
                    //    .Select(m => m.CategoryTypeId).ToList();
                    //var listDaPheDuyetDeXuatId = _context.Category
                    //    .Where(c => listTypeTrangThaiDeXuatPheDuyet.Contains(c.CategoryTypeId) &&
                    //                c.CategoryCode == "Approved").Select(m => m.CategoryId).ToList();

                    var nguonLucTypeId = _context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "NCNL")?.CategoryTypeId;
                    var nguonLucNoiBoId = _context.Category
                        .FirstOrDefault(x => x.CategoryCode == "NB" && x.CategoryTypeId == nguonLucTypeId)?.CategoryId;

                    Guid tennatId = Guid.Empty;
                    listAllProject.ForEach(item =>
                    {
                        var listTaskOfProject = listAllTask.Where(c => c.ProjectId == item.ProjectId).Select(m =>
                            new TaskEntityModel
                            {
                                TaskId = m.TaskId,
                                EstimateHour = m.EstimateHour,
                                ActualHour = m.ActualHour,
                                Description = m.Description,
                                Status = m.Status,
                                IncludeWeekend = m.IncludeWeekend,
                                TaskComplate = m.TaskComplate,
                                ProjectId = m.ProjectId,
                                StatusCode = listTaskStatus.FirstOrDefault(c => c.CategoryId == m.Status)?.CategoryCode,
                                CompleteDate = m.CompleteDate
                            }).ToList();

                        //var listResourceOfProject = listAllProjectResorce.Where(c => c.ProjectId == item.ProjectId)
                        //    .Select(p => new ProjectResourceEntityModel()
                        //    {
                        //        ProjectResourceId = p.ProjectResourceId,
                        //        TenantId = p.TenantId,
                        //        ResourceType = p.ResourceType,
                        //        IsCreateVendor = p.IsCreateVendor,
                        //        ResourceRole = p.ResourceRole,
                        //        ObjectId = p.ObjectId,
                        //        Allowcation = p.Allowcation,
                        //        StartTime = p.StartTime,
                        //        EndTime = p.EndTime,
                        //        CreateDate = p.CreateDate,
                        //        EmployeeRole = p.EmployeeRole,
                        //        IsOverload = p.IsOverload,
                        //        IncludeWeekend = p.IncludeWeekend,
                        //    }).ToList();

                        #region

                        //var listResourceOfProjectId = listResourceOfProject.Select(m => m.ProjectResourceId).ToList();
                        //var listObjectIdOfProject = listResourceOfProject.Select(m => m.ObjectId).ToList();

                        //var listEmployeeRequest = _context.EmployeeRequest.Where(c =>
                        //    listObjectIdOfProject.Contains(c.OfferEmployeeId) &&
                        //    listDaPheDuyetDeXuatId.Contains(c.StatusId.Value)).ToList();

                        // Tính số ngày nghỉ
                        //listResourceOfProject.ForEach(resource =>
                        //{
                        //    double amountAbsentWithoutPermission = 0;
                        //    if (resource.EndTime != null && resource.StartTime != null)
                        //    {
                        //        TimeSpan ts = (DateTime) resource.EndTime - (DateTime) resource.StartTime;
                        //        var numberWeeken = TotalHoliday(resource.StartTime.Value, resource.EndTime.Value,
                        //            resource.IncludeWeekend ?? false);

                        //        var listEmployeeRequetsOfResource = listEmployeeRequest
                        //            .Where(c => c.OfferEmployeeId == resource.ObjectId).ToList();

                        //        listEmployeeRequetsOfResource.ForEach(empRe =>
                        //        {
                        //            if (listAbsentWithoutPermissionId.Contains(empRe.TypeRequest.Value) &&
                        //                resource.EndTime.Value.Date <= currentDate)
                        //            {
                        //                for (var date = empRe.StartDate.Value.Date;
                        //                    (date <= empRe.EnDate.Value.Date && date >= resource.StartTime.Value.Date
                        //                                                     && date <= DateTime.Now.Date &&
                        //                                                     date <= resource.EndTime.Value.Date);
                        //                    date = date.AddDays(1))
                        //                {

                        //                    if (listAbsentWithoutPermissionId.Contains(empRe.TypeRequest.Value))
                        //                    {
                        //                        if (empRe.StartTypeTime == empRe.EndTypeTime)
                        //                        {
                        //                            amountAbsentWithoutPermission += 0.5;
                        //                        }
                        //                        else
                        //                        {
                        //                            amountAbsentWithoutPermission++;
                        //                        }
                        //                    }
                        //                }
                        //            }
                        //        });

                        //        resource.WorkDay = (ts.TotalDays + 1 - amountAbsentWithoutPermission - numberWeeken) *
                        //                           (resource.Allowcation == null ? 0 : resource.Allowcation) / 100;
                        //    }
                        //    else
                        //    {
                        //        resource.WorkDay = 0;
                        //    }
                        //});

                        //var listEmployeeOfProject = listAllEmployee.Where(c => listObjectIdOfProject.Contains(c.EmployeeId))
                        //    .ToList();

                        #endregion

                        decimal AC = 0;
                        decimal EV = 0;
                        decimal PV = 0;

                        #region Tính AC

                        var listNguonLucThuocNhomNguonLuc = listAllProjectResorce.Where(x =>
                            x.ProjectId == item.ProjectId &&
                            x.ResourceRole == nguonLucNoiBoId).ToList();

                        listNguonLucThuocNhomNguonLuc.ForEach(nhanLuc =>
                        {
                            if (nhanLuc.EndTime != null && nhanLuc.StartTime != null &&
                                DateTime.Now.Date <= nhanLuc.EndTime.Value.Date &&
                                DateTime.Now.Date >= nhanLuc.StartTime.Value.Date &&
                                DateTime.Now.DayOfWeek != DayOfWeek.Saturday &&
                                DateTime.Now.DayOfWeek != DayOfWeek.Sunday)
                            {
                                decimal chiPhiTheoGio =
                                    listAllEmployee.FirstOrDefault(x => x.EmployeeId == nhanLuc.ObjectId)?.ChiPhiTheoGio ??
                                    0;

                                //Tính theo ngày để không phải trừ thứ 7 và CN khi tính
                                AC += Math.Round(8 * nhanLuc.Allowcation * chiPhiTheoGio / 100, 0);
                            }
                        });

                        #endregion

                        #region Tính PV, EV

                        listTaskOfProject.ForEach(task =>
                        {
                            //Tính PV
                            if (task.PlanStartTime != null && task.PlanEndTime != null &&
                                DateTime.Now.Date <= task.PlanEndTime.Value.Date &&
                                DateTime.Now.Date >= task.PlanStartTime.Value.Date &&
                                DateTime.Now.DayOfWeek != DayOfWeek.Saturday &&
                                DateTime.Now.DayOfWeek != DayOfWeek.Sunday &&
                                (task.StatusCode == "NEW" || task.StatusCode == "DL" ||
                                    (task.StatusCode == "HT" || task.StatusCode == "CLOSE") &&
                                    task.CompleteDate != null && DateTime.Now.Date == task.CompleteDate.Value.Date
                                ))
                            {
                                decimal percent = 0;
                                switch (task.StatusCode)
                                {
                                    case "NEW":
                                        percent = 0;
                                        break;
                                    case "DL":
                                        percent = 50;
                                        break;
                                    case "HT":
                                        percent = 100;
                                        break;
                                    case "CLOSE":
                                        percent = 100;
                                        break;
                                    default:
                                        percent = 0;
                                        break;
                                }

                                PV += Math.Round((task.EstimateHour ?? 0) * percent * item.GiaBanTheoGio / 100, 0);
                            }

                            //Tính EV
                            if (task.PlanStartTime != null && task.PlanEndTime != null &&
                                DateTime.Now.Date <= task.PlanEndTime.Value.Date &&
                                DateTime.Now.Date >= task.PlanStartTime.Value.Date &&
                                DateTime.Now.DayOfWeek != DayOfWeek.Saturday &&
                                DateTime.Now.DayOfWeek != DayOfWeek.Sunday)
                            {
                                EV += Math.Round((task.TaskComplate ?? 0) / 100 * (task.EstimateHour ?? 0) * item.GiaBanTheoGio, 0);
                            }
                        });

                        #endregion

                        var projectCostResport = new ProjectCostReport
                        {
                            ProjectCostReportId = Guid.NewGuid(),
                            ProjectId = item.ProjectId,
                            Date = DateTime.Now,
                            Ac = AC,
                            Pv = PV,
                            Ev = EV,
                            Active = true
                        };
                        listProjectCostReport.Add(projectCostResport);

                        //if (tennatId != (Guid) item.TenantId)
                        //{
                        //    tennatId = (Guid) item.TenantId;
                        //    var guid = Guid.NewGuid();
                        //    var note = new Note
                        //    {
                        //        NoteId = guid,
                        //        ObjectType = "LOGHANGFIRE",
                        //        ObjectId = guid,
                        //        Type = "HAF",
                        //        Active = true,
                        //        CreatedById = guid,
                        //        CreatedDate = DateTime.Now,
                        //        NoteTitle = "EVMDaily",
                        //        Description = DateTime.Now.ToString() + " - " + item.TenantId.ToString() +
                        //                      " - Chạy xong Job EVM - " + item.ProjectName
                        //    };
                        //    _context.Note.Add(note);
                        //}
                    });

                    var listAlProjectId = listAllProject.Select(m => m.ProjectId).ToList();
                    var lstDelProjectCostReport = _context.ProjectCostReport
                        .Where(c => c.Date.Date == DateTime.Now.Date && listAlProjectId.Contains(c.ProjectId)).ToList();

                    if (lstDelProjectCostReport.Count > 0)
                        _context.ProjectCostReport.RemoveRange(lstDelProjectCostReport);

                    if (listProjectCostReport.Count > 0)
                        _context.ProjectCostReport.AddRange(listProjectCostReport);

                    _context.SaveChanges();
                }
            }
            catch (Exception)
            {

            }
        }

        private int TotalHoliday(DateTime startDate, DateTime endDate, bool includeWeekend)
        {
            int total = 0;
            while (startDate != endDate)
            {
                if (includeWeekend == false)
                {
                    if (startDate.DayOfWeek == DayOfWeek.Saturday || startDate.DayOfWeek == DayOfWeek.Sunday)
                    {
                        total += 1;
                    }
                }

                startDate = startDate.AddDays(1);
            }

            if (endDate.DayOfWeek == DayOfWeek.Saturday || endDate.DayOfWeek == DayOfWeek.Sunday)
            {
                if (includeWeekend == false)
                {
                    total += 1;
                }
            }

            return total;
        }

    }
}
