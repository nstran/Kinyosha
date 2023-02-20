using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TN.TNM.Common;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.Company;
using TN.TNM.DataAccess.Messages.Parameters.CompanyConfig;
using TN.TNM.DataAccess.Messages.Results.Admin.Category;
using TN.TNM.DataAccess.Messages.Results.Admin.Company;
using TN.TNM.DataAccess.Messages.Results.CompanyConfig;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.BankAccount;
using TN.TNM.DataAccess.Models.Company;
using TN.TNM.DataAccess.Models.SystemParameter;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class CompanyDAO : BaseDAO, ICompanyDataAccess
    {
        public CompanyDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
        }

        public GetAllCompanyResult GetAllCompany(GetAllCompanyParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.GETALL, ObjectName.COMPANY, "GetAllCompany", parameter.UserId);
                var company = context.Company.ToList();
                var listCompanyEntityModel = new List<CompanyEntityModel>();
                company.ForEach(item =>
                {
                    listCompanyEntityModel.Add(new CompanyEntityModel(item));
                });
                return new GetAllCompanyResult
                {
                    Company = listCompanyEntityModel
                };
            }
            catch (Exception e)
            {
                return new GetAllCompanyResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetCompanyConfigResults GetCompanyConfig(GetCompanyConfigParameter parameter)
        {
            try
            {
                var companyConfig = context.CompanyConfiguration.FirstOrDefault();
                var listBankAccount = context.BankAccount.Where(item => item.ObjectType == "COM").Select(c => new BankAccountEntityModel
                {
                    BankAccountId = c.BankAccountId,
                    ObjectId = c.ObjectId,
                    ObjectType = c.ObjectType,
                    AccountNumber = c.AccountNumber,
                    BankName = c.BankName,
                    BankDetail = c.BankDetail,
                    BranchName = c.BranchName,
                    AccountName = c.AccountName,
                    Active = c.Active,
                    CreatedDate = c.CreatedDate
                }).OrderBy(z => z.CreatedDate).ToList();

                return new GetCompanyConfigResults
                {
                    CompanyConfig = new CompanyConfigEntityModel(companyConfig),
                    ListBankAccount = listBankAccount,
                    MessageCode = "Success",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new GetCompanyConfigResults
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }
        public EditCompanyConfigResults EditCompanyConfig(EditCompanyConfigParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.UPDATE, ObjectName.COMPANY, "Edit Company Config", parameter.UserId);
                var CompanyConfiguration = context.CompanyConfiguration.FirstOrDefault(c => c.CompanyId == parameter.CompanyConfigurationObject.CompanyId);
                if (CompanyConfiguration == null)
                {
                    return new EditCompanyConfigResults
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Company Config không tồn tại trong hệ thống"
                    };
                }
                CompanyConfiguration.CompanyName = parameter.CompanyConfigurationObject.CompanyName?.Trim();
                CompanyConfiguration.TaxCode = parameter.CompanyConfigurationObject.TaxCode?.Trim();
                CompanyConfiguration.Email = parameter.CompanyConfigurationObject.Email?.Trim();
                CompanyConfiguration.ContactName = parameter.CompanyConfigurationObject.ContactName?.Trim();
                CompanyConfiguration.ContactRole = parameter.CompanyConfigurationObject.ContactRole?.Trim();
                CompanyConfiguration.CompanyAddress = parameter.CompanyConfigurationObject.CompanyAddress?.Trim();
                CompanyConfiguration.Website = parameter.CompanyConfigurationObject.Website?.Trim();
                CompanyConfiguration.Phone = parameter.CompanyConfigurationObject.Phone?.Trim();
                context.CompanyConfiguration.Update(CompanyConfiguration);
                context.SaveChanges();
                return new EditCompanyConfigResults
                {
                    StatusCode = HttpStatusCode.OK,
                    CompanyID = parameter.CompanyConfigurationObject.CompanyId
                };
            }
            catch (Exception e)
            {
                return new EditCompanyConfigResults
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetAllSystemParameterResult GetAllSystemParameter(GetAllSystemParameterParameter parameter)
        {
            try
            {
                var systemParameterList = context.SystemParameter.OrderBy(w => w.SystemGroupCode).ToList();
                var listSystemParamterEntityModel = new List<SystemParameterEntityModel>();
                systemParameterList.ForEach(item =>
                {
                    listSystemParamterEntityModel.Add(new SystemParameterEntityModel(item));
                });

                var listEmailNhanSu = context.EmailNhanSu.Select(y => new EmailNhanSuModel(y))
                    .OrderByDescending(z => z.EmailNhanSuId).ToList();

                return new GetAllSystemParameterResult
                {
                    systemParameterList = listSystemParamterEntityModel,
                    ListEmailNhanSu = listEmailNhanSu,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "OK"
                };
            }
            catch (Exception)
            {
                return new GetAllSystemParameterResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public ChangeSystemParameterResult ChangeSystemParameter(ChangeSystemParameterParameter parameter)
        {
            try
            {
                var systemParameter = context.SystemParameter.FirstOrDefault(e => e.SystemKey == parameter.SystemKey);
                if (systemParameter == null)
                {
                    return new ChangeSystemParameterResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tồn tại tham số này trên hệ thống"
                    };
                }
                systemParameter.SystemValue = parameter.SystemValue;
                if (parameter.SystemValueString != null)
                    systemParameter.SystemValueString = parameter.SystemValueString.Trim();
                if (parameter.Description != null) systemParameter.Description = parameter.Description.Trim();
                context.SystemParameter.Update(systemParameter);
                context.SaveChanges();

                List<SystemParameterEntityModel> systemParameterListEntityModel = new List<SystemParameterEntityModel>();
                var systemParameterList = context.SystemParameter.ToList();
                systemParameterList.ForEach(item =>
                {
                    systemParameterListEntityModel.Add(new SystemParameterEntityModel(item));
                });
                return new ChangeSystemParameterResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công",
                    SystemParameterList = systemParameterListEntityModel
                };
            }
            catch (Exception)
            {
                return new ChangeSystemParameterResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public CreateOrUpdateEmailNhanSuResult CreateOrUpdateEmailNhanSu(CreateOrUpdateEmailNhanSuParameter parameter)
        {
            try
            {
                string mess = "";

                //Create
                if (parameter.EmailNhanSu.EmailNhanSuId == null)
                {
                    var count = context.EmailNhanSu.Count();
                    if (count > 0)
                    {
                        return new CreateOrUpdateEmailNhanSuResult()
                        {
                            StatusCode = HttpStatusCode.Conflict,
                            MessageCode = "Email đã được cấu hình bạn không thể tạo mới thêm"
                        };
                    }

                    var exists = context.EmailNhanSu.FirstOrDefault(x =>
                        x.Email.Trim().ToLower() == parameter.EmailNhanSu.Email.Trim().ToLower());

                    if (exists != null)
                    {
                        return new CreateOrUpdateEmailNhanSuResult()
                        {
                            StatusCode = HttpStatusCode.Conflict,
                            MessageCode = "Email đã được cấu hình"
                        };
                    }

                    context.EmailNhanSu.Add(parameter.EmailNhanSu.ToEntity());
                    context.SaveChanges();

                    mess = "Tạo mới thành công";
                }
                //Update
                else
                {
                    var exists = context.EmailNhanSu.FirstOrDefault(x =>
                        x.Email.Trim().ToLower() == parameter.EmailNhanSu.Email.Trim().ToLower() &&
                        x.EmailNhanSuId != parameter.EmailNhanSu.EmailNhanSuId);

                    if (exists != null)
                    {
                        return new CreateOrUpdateEmailNhanSuResult()
                        {
                            StatusCode = HttpStatusCode.Conflict,
                            MessageCode = "Email đã được cấu hình"
                        };
                    }

                    var emailNhanSu =
                        context.EmailNhanSu.FirstOrDefault(x => x.EmailNhanSuId == parameter.EmailNhanSu.EmailNhanSuId);
                    emailNhanSu.Email = parameter.EmailNhanSu.Email.Trim();
                    emailNhanSu.Password = parameter.EmailNhanSu.Password.Trim();

                    context.EmailNhanSu.Update(emailNhanSu);
                    context.SaveChanges();

                    mess = "Cập nhật thành công";
                }

                return new CreateOrUpdateEmailNhanSuResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = mess
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdateEmailNhanSuResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetListEmailNhanSuResult GetListEmailNhanSu(GetListEmailNhanSuParameter parameter)
        {
            try
            {
                var listEmailNhanSu = context.EmailNhanSu.Select(y => new EmailNhanSuModel(y))
                    .OrderByDescending(z => z.EmailNhanSuId).ToList();

                return new GetListEmailNhanSuResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "OK",
                    ListEmailNhanSu = listEmailNhanSu
                };
            }
            catch (Exception e)
            {
                return new GetListEmailNhanSuResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public DeleteEmailNhanSuResult DeleteEmailNhanSu(DeleteEmailNhanSuParameter parameter)
        {
            try
            {
                var email = context.EmailNhanSu.FirstOrDefault(x => x.EmailNhanSuId == parameter.EmailNhanSuId);

                if (email == null)
                {
                    return new DeleteEmailNhanSuResult()
                    {
                        StatusCode = HttpStatusCode.NotFound,
                        MessageCode = "Email không tồn tại trên hệ thống"
                    };
                }

                context.EmailNhanSu.Remove(email);
                context.SaveChanges();

                return new DeleteEmailNhanSuResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công"
                };
            }
            catch (Exception e)
            {
                return new DeleteEmailNhanSuResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
    }
}
