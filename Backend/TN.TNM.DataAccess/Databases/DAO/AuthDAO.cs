using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using TN.TNM.Common;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Jwt;
using TN.TNM.DataAccess.Messages.Parameters.Admin;
using TN.TNM.DataAccess.Messages.Parameters.Admin.Permission;
using TN.TNM.DataAccess.Messages.Parameters.Users;
using TN.TNM.DataAccess.Messages.Results.Admin;
using TN.TNM.DataAccess.Messages.Results.Admin.Permission;
using TN.TNM.DataAccess.Messages.Results.Users;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.ActionResource;
using TN.TNM.DataAccess.Models.Admin;
using TN.TNM.DataAccess.Models.MenuBuild;
using TN.TNM.DataAccess.Models.Permission;
using TN.TNM.DataAccess.Models.User;

/// <summary>
/// Authentication Data Access Object
/// Use to authenticate and authorize user
/// 
/// Author: thanhhh@tringhiatech.vn
/// Date: 14/06/2018
/// </summary>
namespace TN.TNM.DataAccess.Databases.DAO
{
    public class AuthDAO : BaseDAO, IAuthDataAccess
    {
        public AuthDAO(TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
        }

        public GetMenuByModuleCodeResult GetMenuByModuleCode(GetMenuByModuleCodeParameter parameter)
        {
            try
            {
                ////Get list menu directly by User Id
                //var perByUser = from p in this.context.Permission
                //                join pM in this.context.PermissionMapping on p.PermissionId equals pM.PermissionId
                //                join pR in this.context.Permission on p.ParentId equals pR.PermissionId
                //                where pR.PermissionCode == parameter.ModuleCode && pM.UserId == parameter.UserId && "S".Equals(p.Type)
                //                orderby p.Sort ascending
                //                select p;

                ////Get list menu by group where user in
                //var perByGroup = from p in this.context.Permission
                //                 join pR in this.context.Permission on p.ParentId equals pR.PermissionId
                //                 join pM in this.context.PermissionMapping on p.PermissionId equals pM.PermissionId
                //                 join uG in this.context.GroupUser on pM.GroupId equals uG.GroupId
                //                 where pR.PermissionCode == parameter.ModuleCode && uG.UserId == parameter.UserId && "S".Equals(p.Type)
                //                 orderby p.Sort ascending
                //                 select p;

                //var permissions = perByUser.Union(perByGroup);
                //return new GetMenuByModuleCodeResult
                //{
                //    Permissions = permissions.ToList()
                //};

                //Lay ra permission cha theo module code truyen vao

                var parentPermissionId = context.Permission.FirstOrDefault(p => p.PermissionCode == parameter.ModuleCode) != null ? context.Permission.FirstOrDefault(p => p.PermissionCode == parameter.ModuleCode).PermissionId : Guid.Empty;

                //Lay ra cac permission con cua permission cha
                List<Permission> perChildList = new List<Permission>();
                if (parentPermissionId != Guid.Empty)
                {
                    perChildList = context.Permission.Where(p => p.ParentId == parentPermissionId && p.Type.Equals("S")).ToList();
                }

                //Lay nhom quyen cua user theo user ID
                var permissionSetOfUser = context.PermissionMapping.FirstOrDefault(pm => pm.UserId == parameter.UserId);
                if (permissionSetOfUser != null)
                {
                    var permissionSetOfUserId = permissionSetOfUser.PermissionSetId;
                    var permissionIdList = context.PermissionSet.FirstOrDefault(ps => ps.PermissionSetId == permissionSetOfUserId).PermissionId.Split(";").ToList();

                    //Kiem tra neu nhom quyen con khong ton tai trong nhom quyen cua user => remove khoi danh sach hien thi
                    if (perChildList.Count > 0)
                    {
                        List<Permission> newList = new List<Permission>();
                        List<Permission> listRemove = new List<Permission>();
                        perChildList.ForEach(perChild =>
                        {
                            if (permissionIdList.IndexOf(perChild.PermissionId.ToString()) == -1)
                            {
                                listRemove.Add(perChild);
                            }
                            else
                            {
                                newList.Add(perChild);
                            }
                        });

                        perChildList = newList;
                    }
                }
                var listPermissionEntityModel = new List<PermissionEntityModel>();
                perChildList.ForEach(item =>
                {
                    listPermissionEntityModel.Add(new PermissionEntityModel(item));
                });
                return new GetMenuByModuleCodeResult
                {
                    Permissions = listPermissionEntityModel,
                    MessageCode="Success",
                    StatusCode=HttpStatusCode.OK
                };
            }
            catch(Exception e)
            {
                return new GetMenuByModuleCodeResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
            
        }

        public LoginResult Login(LoginParameter paramater,string secretKey, string issuer, string audience)
        {
            try
            {             
                User user = new User();
                paramater.User.Password = AuthUtil.GetHashingPassword(paramater.User.Password);
                var a = context.User.ToList();
                user = context.User.FirstOrDefault(u =>
                    u.UserName == paramater.User.UserName && u.Password == paramater.User.Password);

                // check login bằng account vendor
                var externalUser = context.ExternalUser.FirstOrDefault(u =>
                 u.UserName == paramater.User.UserName && u.Password == paramater.User.Password);

                if (externalUser != null)
                {
                    user = new User()
                    {
                        Active = externalUser.Active,
                        CreatedById = externalUser.CreatedById,
                        CreatedDate = externalUser.CreatedDate,
                        Disabled = externalUser.Disabled,
                        Employee = context.Employee.FirstOrDefault(x => x.EmployeeId == externalUser.EmployeeId),
                        EmployeeId = externalUser.EmployeeId,
                        GroupUser = null,
                        IsAdmin = false,
                        Password = externalUser.Password,
                        PermissionMapping = null,
                        ResetCode = null,
                        ResetCodeDate = null,
                        TenantId = externalUser.TenantId,
                        UpdatedById = externalUser.UpdatedById,
                        UpdatedDate = externalUser.UpdatedDate,
                        UserId = externalUser.ExternalUserId,
                        UserName = externalUser.UserName
                    };
                }

                if (user == null)
                {
                    LogHelper.LoginAuditTrace(context, paramater.User.UserName, 0);

                    return new LoginResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.WRONG_USER_PASSWORD
                    };
                }
                var token = new JwtTokenBuilder()
                                    .AddSecurityKey(JwtSecurityKey.Create(secretKey))
                                    .AddSubject(user.UserName)
                                    .AddIssuer(issuer)
                                    .AddAudience(audience)
                                    .AddClaim("MembershipId", user.UserId.ToString())
                                    .AddExpiry(60 * 24 * 365)
                                    .Build();
                LogHelper.LoginAuditTrace(context, paramater.User.UserName, 1);

                if (user.Active == false)
                {
                    var currentUserFail = new AuthEntityModel
                    {
                        UserId = user.UserId,
                        UserName = user.UserName,
                        EmployeeId = user.EmployeeId.Value,
                        Token = token.Value,
                        LoginTime = new DateTime(),
                    };
                    return new LoginResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.INACTIVE_USER,
                        CurrentUser = currentUserFail
                    };
                }

                bool isAdmin = user.IsAdmin == null ? false : user.IsAdmin.Value;
                var empId = user.EmployeeId;
                string userFullName = externalUser != null ? externalUser.UserName : "";
                string userAvatar = "";
                string userEmail = "";
                bool isManager = false;
                bool isOrder = false;
                bool isCashier = false;
                Guid? positionId = Guid.Empty;
                Guid? organizationId = Guid.Empty;
                List<string> perCodeList = new List<string>();
                List<SystemParameter> systemParameterList = new List<SystemParameter>();
                List<string> listTextActionResource = new List<string>();
                var ListMenuBuild = new List<MenuBuildEntityModel>();
                string employeeCode = "";
                string employeeName = "";
                string employeeCodeName = "";

                if (empId != null)
                {
                    var emp = context.Employee.FirstOrDefault(e => e.EmployeeId == empId);
                    employeeCode = emp?.EmployeeCode;
                    employeeName = emp?.EmployeeName;
                    employeeCodeName = employeeCode + " - " + employeeName;
                    userFullName = emp?.EmployeeName;
                    userAvatar = context.Contact.FirstOrDefault(c => c.ObjectId == empId && c.ObjectType == "EMP")?
                        .AvatarUrl;
                    userEmail = context.Contact.FirstOrDefault(c => c.ObjectId == empId && c.ObjectType == "EMP")?.Email;
                    var manager = context.Employee.FirstOrDefault(e => e.EmployeeId == empId);
                    if (manager != null)
                    {
                        isManager = manager.IsManager;
                        positionId = manager.PositionId;
                        isOrder = manager.IsOrder ?? false;
                        isCashier = manager.IsCashier ?? false;
                        organizationId = manager.OrganizationId;
                    }

                    if (user != null)
                    {
                        var permissionSetOfUser = context.PermissionMapping.FirstOrDefault(pm => pm.UserId == user.UserId);
                        if (permissionSetOfUser != null)
                        {
                            var permissionSetOfUserId = permissionSetOfUser.PermissionSetId;
                            var permissionIdList = context.PermissionSet
                                .FirstOrDefault(ps => ps.PermissionSetId == permissionSetOfUserId).PermissionId.Split(";")
                                .ToList();
                            permissionIdList.ForEach(perId =>
                            {
                                if (!string.IsNullOrEmpty(perId))
                                {
                                    var perCode = context.Permission.FirstOrDefault(p => p.PermissionId == Guid.Parse(perId))
                                        .PermissionCode;
                                    perCodeList.Add(perCode);
                                }
                            });
                        }
                    }

                    systemParameterList = context.SystemParameter.ToList();

                    //Lấy list User Role
                    var listUserRole = context.UserRole.Where(e => e.UserId == user.UserId).ToList();
                    List<Guid> listRoleId = new List<Guid>();
                    if (listUserRole.Count > 0)
                    {
                        listUserRole.ForEach(item =>
                        {
                            listRoleId.Add(item.RoleId.Value);
                        });
                    }

                    //Lấy list Action Resource Id
                    var listActionResource =
                        context.RoleAndPermission.Where(e => listRoleId.Contains(e.RoleId.Value)).ToList();
                    List<Guid> listActionResourceId = new List<Guid>();
                    if (listActionResource.Count > 0)
                    {
                        listActionResource.ForEach(item =>
                        {
                            listActionResourceId.Add(item.ActionResourceId.Value);
                        });
                    }

                    //Lấy list text action resource
                    listTextActionResource = context.ActionResource
                        .Where(e => listActionResourceId.Contains(e.ActionResourceId)).Select(x => x.ActionResource1)
                        .ToList();

                    #region Lấy list MenuBuid

                    ListMenuBuild = context.MenuBuild.Where(x => x.IsShow == true).Select(y => new MenuBuildEntityModel
                    {
                        MenuBuildId = y.MenuBuildId,
                        ParentId = y.ParentId,
                        Name = y.Name,
                        Code = y.Code,
                        CodeParent = y.CodeParent,
                        Path = y.Path,
                        NameIcon = y.NameIcon,
                        Level = y.Level,
                        IndexOrder = y.IndexOrder,
                        IsPageDetail = y.IsPageDetail
                    }).OrderBy(z => z.IndexOrder).ToList();

                    //Lấy list đường dẫn mặc định gắn với nhóm quyền
                    //Nếu user được phân duy nhất 1 quyền
                    if (listRoleId.Count == 1)
                    {
                        var roleId = listRoleId.FirstOrDefault();

                        var listRoleAndMenuBuild = context.RoleAndMenuBuild.Where(x => x.RoleId == roleId).ToList();
                        ListMenuBuild.ForEach(item =>
                        {
                            //Lấy ra các sub menu module
                            if (item.Level == 1)
                            {
                                var existsDefaultPath = listRoleAndMenuBuild.FirstOrDefault(x => x.Code == item.Code);

                                //Nếu tồn tại đường dẫn mặc định đã được cấu hình
                                if (existsDefaultPath != null)
                                {
                                    item.Path = existsDefaultPath.Path;
                                }
                            }
                        });
                    }

                    #endregion

                }
                
                var currentUser = new AuthEntityModel
                {
                    UserId = user.UserId,
                    UserName = user.UserName,
                    EmployeeId = user.EmployeeId.Value,
                    Token = token.Value,
                    LoginTime = new DateTime(),
                    PositionId = positionId,
                    OrganizationId = organizationId
                };
                return new LoginResult
                {
                    StatusCode = HttpStatusCode.OK,
                    CurrentUser = currentUser,
                    UserFullName = userFullName,
                    UserAvatar = userAvatar,
                    UserEmail = userEmail,
                    IsManager = isManager,
                    PermissionList = perCodeList,
                    PositionId = positionId,
                    OrganizationId = organizationId,
                    ListPermissionResource = listTextActionResource,
                    IsAdmin = isAdmin,
                    SystemParameterList = systemParameterList,
                    IsOrder = isOrder,
                    IsCashier = isCashier,
                    ListMenuBuild = ListMenuBuild,
                    EmployeeCode = employeeCode,
                    EmployeeName = employeeName,
                    EmployeeCodeName = employeeCodeName
                };
            }
            catch(Exception e)
            {
                return new LoginResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode=e.Message
                };
            }         
        }

        public GetUserPermissionResult GetUserPermission(GetUserPermissionParameter parameter)
        {
            try
            {
                //Lấy list User Role
                List<Guid> listRoleId = context.UserRole.Where(e => e.UserId == parameter.UserId)
                    .Select(y => y.RoleId.Value).ToList();

                //Lấy list Action Resource Id
                List<Guid> listActionResourceId = context.RoleAndPermission.Where(e => listRoleId.Contains(e.RoleId.Value))
                    .Select(y => y.ActionResourceId.Value).ToList();

                //Lấy list text action resource
                var _listActionResource = context.ActionResource
                    .Where(e => listActionResourceId.Contains(e.ActionResourceId)).Select(x => x.ActionResource1)
                    .ToList();

                string[] array = _listActionResource.ToArray();
                string listPermissionResource = String.Join(", ", array);

                return new GetUserPermissionResult()
                {
                    ListPermissionResource = listPermissionResource,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                };
            }
            catch (Exception e)
            {
                return new GetUserPermissionResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreatePermissionResult CreatePermission(CreatePermissionParameter parameter)
        {
            try
            {
                string permissionList = string.Join(";", parameter.PermissionIdList);

                parameter.PermissionIdList.ToList().ForEach(permissionId =>
                {
                    var permission = context.Permission.FirstOrDefault(p => p.PermissionId == Guid.Parse(permissionId) && p.ParentId == null);
                    if (permission != null)
                    {
                        var permissionAsMenu = context.Permission.Where(p => p.ParentId == Guid.Parse(permissionId) && p.Type == "S").Select(p => p.PermissionId).ToList();
                        string permissionAsMenuString = string.Join(";", permissionAsMenu);
                        permissionList += ";" + permissionAsMenuString;
                    }
                });

                PermissionSet ps = new PermissionSet()
                {
                    PermissionSetId = Guid.NewGuid(),
                    PermissionSetName = parameter.PermissionSetName.Trim(),
                    PermissionSetCode = parameter.PermissionSetCode.Trim(),
                    PermissionSetDescription = parameter.PermissionSetDescription.Trim(),
                    PermissionId = permissionList,
                    CreatedById = parameter.UserId,
                    CreatedDate = DateTime.Now,
                    Active = true
                };

                context.PermissionSet.Add(ps);
                context.SaveChanges();
                return new CreatePermissionResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = CommonMessage.Permission.CREATE_SUCCESS
                };
            }
            catch(Exception e)
            {
                return new CreatePermissionResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
            
        }

        public EditPermissionByIdResult EditPermissionById(EditPermissionByIdParameter parameter)
        {
            try
            {
                var permission = context.PermissionSet.FirstOrDefault(p => p.PermissionSetId == parameter.PermissionSetId);
                permission.PermissionSetName = parameter.PermissionSetName.Trim();
                permission.PermissionSetDescription = parameter.PermissionSetDescription.Trim();
                permission.PermissionSetCode = parameter.PermissionSetCode.Trim();
                permission.PermissionId = string.Join(";", parameter.PermissionIdList.ToList());

                context.PermissionSet.Update(permission);
                context.SaveChanges();
                return new EditPermissionByIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = CommonMessage.Permission.EDIT_SUCCESS
                };
            }
            catch (Exception e)
            {
                return new EditPermissionByIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetAllPermissionResult GetAllPermission(GetAllPermissionParameter parameter)
        {
            try
            {
                var perLst = context.PermissionSet.Select(p => new PermissionSetEntityModel()
                {
                    PermissionSetId = p.PermissionSetId,
                    PermissionSetName = p.PermissionSetName,
                    PermissionSetCode = p.PermissionSetCode,
                    PermissionSetDescription = p.PermissionSetDescription,
                    NumberOfUserHasPermission = context.PermissionMapping.Where(pm => pm.PermissionSetId == p.PermissionSetId).Count(),
                    CreatedById = p.CreatedById,
                    CreatedDate = p.CreatedDate
                }).OrderByDescending(ps => ps.CreatedDate).ToList();

                return new GetAllPermissionResult
                {
                    PermissionList = perLst,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success"
                };
            }
            catch(Exception e)
            {
                return new GetAllPermissionResult
                {
                    MessageCode=e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }          
        }

        public GetPermissionByIdResult GetPermissionById(GetPermissionByIdParameter parameter)
        {
            try
            {
                var permissionSet = context.PermissionSet.FirstOrDefault(ps => ps.PermissionSetId == parameter.PermissionSetId);
                var permissionIdList = permissionSet.PermissionId.Split(";").ToList();
                List<PermissionEntityModel> permissionList = new List<PermissionEntityModel>();
                permissionIdList.ForEach(permissionId =>
                {
                    var permission = context.Permission.FirstOrDefault(p => p.PermissionId.ToString() == permissionId);

                    if (permission != null)
                    {
                        PermissionEntityModel pem = new PermissionEntityModel()
                        {
                            PermissionId = permission.PermissionId,
                            PermissionName = permission.PermissionName,
                            PermissionCode = permission.PermissionCode,
                            ParentId = permission.ParentId
                        };

                        permissionList.Add(pem);
                    }
                });

                PermissionSetEntityModel psem = new PermissionSetEntityModel()
                {
                    PermissionSetId = permissionSet.PermissionSetId,
                    PermissionSetName = permissionSet.PermissionSetName,
                    PermissionSetDescription = permissionSet.PermissionSetDescription,
                    PermissionSetCode = permissionSet.PermissionSetCode,
                    NumberOfUserHasPermission = context.PermissionMapping.Where(pm => pm.PermissionSetId == permissionSet.PermissionSetId).Count(),
                    PermissionList = permissionList
                };

                return new GetPermissionByIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    Permission = psem
                };
            }
            catch (Exception e)
            {
                return new GetPermissionByIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode=e.Message,
                };
            }          
        }

        public DeletePermissionByIdResult DeletePermissionById(DeletePermissionByIdParameter parameter)
        {
            try
            {
                var permissionMapping = context.PermissionMapping.Where(pm => pm.PermissionSetId == parameter.PermissionSetId).ToList();
                if (permissionMapping.Count > 0)
                {
                    return new DeletePermissionByIdResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Permission.HAS_USER
                    };
                }

                var permission = context.PermissionSet.FirstOrDefault(p => p.PermissionSetId == parameter.PermissionSetId);
                if (permission == null)
                {
                    return new DeletePermissionByIdResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Permission.NOT_EXIST
                    };
                }

                context.PermissionSet.Remove(permission);
                context.SaveChanges();
                return new DeletePermissionByIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = CommonMessage.Permission.DELETE_SUCCESS
                };
            } catch (Exception e)
            {
                return new DeletePermissionByIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }           
        }

        public ChangePasswordResult ChangePassword(ChangePasswordParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(u => u.UserId == parameter.UserId);
                var currentPass = user.Password;
                var oldPass = AuthUtil.GetHashingPassword(parameter.OldPassword);

                if (oldPass != currentPass)
                {
                    return new ChangePasswordResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Password.NOT_CORRECT
                    };
                }

                var newPass = AuthUtil.GetHashingPassword(parameter.NewPassword);
                if (newPass == currentPass)
                {
                    return new ChangePasswordResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Password.DUPLICATE
                    };
                }

                user.Password = newPass;

                context.User.Update(user);
                context.SaveChanges();

                return new ChangePasswordResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = CommonMessage.Password.CHANGE_FAIL
                };
            }
            catch(Exception e)
            {
                return new ChangePasswordResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }        
        }

        public GetPermissionByCodeResult GetPermissionByCode(GetPermissionByCodeParameter parameter)
        {
            try
            {
                var parentPermission = context.Permission.Where(p => parameter.PerCode.IndexOf(p.PermissionCode) > -1).Select(parent => new PermissionEntityModel()
                {
                    PermissionId = parent.PermissionId,
                    PermissionName = parent.PermissionName,
                    PermissionChildList = context.Permission.Where(p => p.ParentId == parent.PermissionId && p.Type == "P").Select(p => new PermissionEntityModel()
                    {
                        PermissionId = p.PermissionId,
                        PermissionName = p.PermissionName,
                        PermissionCode = p.PermissionCode,
                        ParentId = p.ParentId,
                        PermissionDescription = p.PermissionDescription,
                        Sort = p.Sort
                    }).OrderBy(p => p.Sort).ToList()
                }).ToList();
                return new GetPermissionByCodeResult()
                {
                    PermissionList = parentPermission,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success"
                };
            }
            catch(Exception e)
            {
                return new GetPermissionByCodeResult()
                {
                   MessageCode=e.Message,
                   StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
            
        }

        private List<PermissionEntityModel> GetChildren(Guid? id, List<PermissionEntityModel> list)
        {
            return list.Where(p => p.ParentId == id)
                .Select(p => new PermissionEntityModel()
                {
                    PermissionId = p.PermissionId,
                    PermissionName = p.PermissionName,
                    PermissionCode = p.PermissionCode,
                    ParentId = p.ParentId,
                    PermissionDescription = p.PermissionDescription,
                    PermissionChildList = GetChildren(p.PermissionId, list)
                }).ToList();
        }

        public EditUserProfileResult EditUserProfile(EditUserProfileParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(u => u.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(e => e.EmployeeId == user.EmployeeId);
                var contact = context.Contact.FirstOrDefault(c => c.ObjectId == employee.EmployeeId);

                user.UserName = parameter.Username;
                contact.FirstName = parameter.FirstName;
                contact.LastName = parameter.LastName;
                contact.Email = parameter.Email;
                contact.AvatarUrl = parameter.AvatarUrl;

                context.User.Update(user);
                context.Contact.Update(contact);
                context.SaveChanges();
                return new EditUserProfileResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = CommonMessage.User.CHANGE_SUCCESS
                };
            }
            catch(Exception e)
            {
                return new EditUserProfileResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = e.Message
                };
            }
            
        }

        public GetUserProfileResult GetUserProfile(GetUserProfileParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(u => u.UserId == parameter.UserId);
                var employee = context.Employee.FirstOrDefault(e => e.EmployeeId == user.EmployeeId);
                var contact = context.Contact.FirstOrDefault(c => c.ObjectId == employee.EmployeeId);
                return new GetUserProfileResult()
                {
                    Status = true,
                    AvatarUrl = contact.AvatarUrl,
                    Email = contact.Email,
                    FirstName = contact.FirstName,
                    LastName = contact.LastName,
                    Username = user.UserName,
                    MessageCode = "Success",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch(Exception e)
            {
                return new GetUserProfileResult()
                {
                    MessageCode=e.Message,
                    StatusCode=HttpStatusCode.ExpectationFailed
                };
            }
            
        }

        public GetUserProfileByEmailResult GetUserProfileByEmail(GetUserProfileByEmailParameter parameter)
        {
            try
            {
                var contact = context.Contact.FirstOrDefault(c => c.Email == parameter.UserEmail
            || c.OtherEmail == parameter.UserEmail
            || c.WorkEmail == parameter.UserEmail);
                var employee = context.Employee.FirstOrDefault(e => e.EmployeeId == contact.ObjectId);
                var user = context.User.FirstOrDefault(u => u.EmployeeId == employee.EmployeeId);

                if (user.Active == false)
                {
                    return new GetUserProfileByEmailResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.INACTIVE_USER,
                        AvatarUrl = contact.AvatarUrl,
                        Email = contact.Email,
                        FirstName = contact.FirstName,
                        LastName = contact.LastName,
                        UserName = user.UserName,
                        FullName = employee.EmployeeName,
                        UserId = user.UserId,
                        EmployeeId = employee.EmployeeId,
                        PermissionList = new List<string>(),
                        IsManager = false
                    };
                }

                var empId = user.EmployeeId;
                bool isManager = false;
                Guid? positionId = Guid.Empty;
                List<string> perCodeList = new List<string>();
                if (empId != null)
                {
                    isManager = employee.IsManager;
                    positionId = employee.PositionId;

                    var permissionSetOfUser = context.PermissionMapping.FirstOrDefault(pm => pm.UserId == user.UserId);
                    if (permissionSetOfUser != null)
                    {
                        var permissionSetOfUserId = permissionSetOfUser.PermissionSetId;
                        var permissionIdList = context.PermissionSet.FirstOrDefault(ps => ps.PermissionSetId == permissionSetOfUserId).PermissionId.Split(";").ToList();
                        permissionIdList.ForEach(perId =>
                        {
                            if (!string.IsNullOrEmpty(perId))
                            {
                                var perCode = context.Permission.FirstOrDefault(p => p.PermissionId == Guid.Parse(perId)).PermissionCode;
                                var parentId = context.Permission.FirstOrDefault(p => p.PermissionId == Guid.Parse(perId)).ParentId;

                                if (parentId != null)
                                {
                                    var parentCode = context.Permission.FirstOrDefault(p => p.PermissionId == Guid.Parse(parentId.ToString())).PermissionCode;
                                    if (perCodeList.IndexOf(parentCode.ToString()) == -1)
                                    {
                                        perCodeList.Add(parentCode.ToString());
                                    }
                                }
                                perCodeList.Add(perCode);
                            }
                        });
                    }
                }
                this.iAuditTrace.Trace(ActionName.LOGIN, ObjectName.USER, $"User {user.UserName} login", user.UserId);

                return new GetUserProfileByEmailResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    AvatarUrl = contact.AvatarUrl,
                    Email = contact.Email,
                    FirstName = contact.FirstName,
                    LastName = contact.LastName,
                    UserName = user.UserName,
                    FullName = employee.EmployeeName,
                    UserId = user.UserId,
                    PermissionList = perCodeList,
                    IsManager = isManager,
                    PositionId = positionId,
                    EmployeeId = employee.EmployeeId,
                };
            }
            catch(Exception e)
            {
                return new GetUserProfileByEmailResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode=e.Message
                };
            }
            
        }

        public GetModuleByPermissionSetIdResult GetModuleByPermissionSetId(GetModuleByPermissionSetIdParameter parameter)
        {
            try
            {
                var permissionSet = context.PermissionSet.FirstOrDefault(ps => ps.PermissionSetId == parameter.PermissionSetId);
                List<PermissionEntityModel> permissionList = new List<PermissionEntityModel>();
                if (permissionSet != null)
                {
                    var permissionIdList = permissionSet.PermissionId.Split(";").ToList();

                    if (permissionIdList.Count > 0)
                    {
                        permissionIdList.ForEach(perId =>
                        {
                            var parent = context.Permission.FirstOrDefault(p => p.PermissionId == Guid.Parse(perId) && p.ParentId == null);
                            if (parent != null)
                            {
                                PermissionEntityModel pm = new PermissionEntityModel()
                                {
                                    PermissionId = parent.PermissionId,
                                    PermissionName = parent.PermissionName
                                };
                                permissionList.Add(pm);
                            }
                        });
                    }
                }

                return new GetModuleByPermissionSetIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    PermissionListAsModule = permissionList
                };
            }
            catch(Exception e)
            {
                return new GetModuleByPermissionSetIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode=e.Message
                };
            }        
        }

        public GetAllPermissionSetNameAndCodeResult GetAllPermissionSetNameAndCode(
            GetAllPermissionSetNameAndCodeParameter parameter)
        {
            try
            {
                List<string> nameList = context.PermissionSet.Select(ps => ps.PermissionSetName.ToLower()).Distinct().ToList();
                List<string> codeList = context.PermissionSet.Select(ps => ps.PermissionSetCode.ToLower()).Distinct().ToList();

                return new GetAllPermissionSetNameAndCodeResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    PermissionSetNameList = nameList,
                    PermissionSetCodeList = codeList,
                    MessageCode="Success"
                };
            }
            catch(Exception e)
            {
                return new GetAllPermissionSetNameAndCodeResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode =e.Message
                };
            }           
        }

        public GetAllUserResult GetAllUser(GetAllUserParameter parameter)
        {
            try
            {
                var ListUserObject = (from u in context.User
                                      join e in context.Employee on u.EmployeeId equals e.EmployeeId
                                      where e.Active == true
                                      select new UserEntityModel
                                      {
                                          UserId = u.UserId,
                                          UserName = e.EmployeeName,
                                          EmployeeId = e.EmployeeId
                                      }).ToList();

                return new GetAllUserResult
                {
                    MessageCode = "Sucess",
                    StatusCode = HttpStatusCode.OK,
                    lstUserEntityModel = ListUserObject
                };
            }
            catch (Exception ex)
            {

                return new GetAllUserResult
                {
                    MessageCode = ex.ToString(),
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetCheckUserNameResult GetCheckUserName(GetCheckUserNameParameter parameter)
        {
            try
            {
                parameter.UserName = parameter.UserName.Trim();
                var user = context.User.FirstOrDefault(u => u.UserName == parameter.UserName);

                if (user == null)
                {
                    return new GetCheckUserNameResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.USER_NOT_EXIST
                    };
                }

                if (user.Active == false)
                {
                    return new GetCheckUserNameResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.INACTIVE_USER
                    };
                }

                var emp = context.Employee.FirstOrDefault(e => e.EmployeeId == user.EmployeeId);
                var contact = context.Contact.FirstOrDefault(c => c.ObjectId == emp.EmployeeId && c.ObjectType == "EMP");
                var Email = contact.Email;
                if (Email != null)
                {
                    Email = Email.Trim();
                }
                //if (string.IsNullOrEmpty(Email))
                //{
                //    Email = contact.WorkEmail.Trim();
                //    if (string.IsNullOrEmpty(Email))
                //    {
                //        Email = contact.OtherEmail.Trim();
                //    }
                //}
                //if (Email == null || Email.Trim() == "")
                //{

                //}
                if (string.IsNullOrEmpty(Email))
                {
                    return new GetCheckUserNameResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Contact.EMAIL_DOES_NOT_EXIST
                    };
                }

                return new GetCheckUserNameResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    UserId = user.UserId,
                    UserName = user.UserName,
                    FullName = emp.EmployeeName,
                    EmailAddress = Email
                };
            }
            catch(Exception e)
            {
                return new GetCheckUserNameResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode=e.Message
                };
            }    
        }

        public GetCheckResetCodeUserResult GetCheckResetCodeUser(GetCheckResetCodeUserParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(u => u.ResetCode == parameter.Code);

                if (user == null)
                {
                    return new GetCheckResetCodeUserResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.RESET_CODE_ERR
                    };
                }
                else if (user.Active == false)
                {
                    return new GetCheckResetCodeUserResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.INACTIVE_USER
                    };
                }
                var curr_time = DateTime.Now;
                TimeSpan range_time = Convert.ToDateTime(curr_time) - Convert.ToDateTime(user.ResetCodeDate);
                int sum_day = range_time.Days;
                if (sum_day > 2)
                {
                    return new GetCheckResetCodeUserResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.DATELINE_RESET_PASS
                    };
                }

                return new GetCheckResetCodeUserResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    UserId = user.UserId,
                    UserName = user.UserName
                };
            }
            catch (Exception e)
            {
                return new GetCheckResetCodeUserResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode= e.Message
                };
            }
            
        }

        public ResetPasswordResult ResetPassword(ResetPasswordParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(u => u.UserId == parameter.UserId);

                if (user == null)
                {
                    return new ResetPasswordResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.USER_NOT_EXIST
                    };
                }
                else if (user.Active == false)
                {
                    return new ResetPasswordResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.INACTIVE_USER
                    };
                }

                var currentPass = user.Password;
                var newPass = AuthUtil.GetHashingPassword(parameter.Password);

                if (currentPass == newPass)
                {
                    return new ResetPasswordResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Password.DUPLICATE
                    };
                }

                user.ResetCode = null;
                user.ResetCodeDate = null;
                user.UpdatedById = parameter.UserId;
                user.UpdatedDate = DateTime.Now;
                user.Password = newPass;
                context.User.Update(user);
                context.SaveChanges();

                return new ResetPasswordResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success"
                };
            }
            catch(Exception e)
            {
                return new ResetPasswordResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode =e.Message
                };
            }           
        }

        public GetPositionCodeByPositionIdResult GetPositionCodeByPositionId(GetPositionCodeByPositionIdParameter parameter)
        {
            try
            {
                var position = context.Position.FirstOrDefault(p => p.PositionId == parameter.PositionId);
                var employee = context.Employee.FirstOrDefault(e => e.EmployeeId == parameter.EmployeeId);
                var organization = context.Organization.FirstOrDefault(o => o.OrganizationId == employee.OrganizationId);
                var OrganizationId = organization.OrganizationId;
                var OrganizationName = organization.OrganizationName;
                var organizationIdList = (from or in context.Organization
                                          select new
                                          {
                                              or.OrganizationId,
                                              or.OrganizationCode,
                                              or.OrganizationName
                                          }
                                          ).ToList();

                List<dynamic> lstResult = new List<dynamic>();
                organizationIdList.ForEach(item =>
                {
                    var sampleObject = new ExpandoObject() as IDictionary<string, Object>;
                    sampleObject.Add("OrganizationId", item.OrganizationId);
                    sampleObject.Add("OrganizationCode", item.OrganizationCode);
                    sampleObject.Add("OrganizationName", item.OrganizationName);
                    lstResult.Add(sampleObject);
                });

                if (position == null)
                {
                    return new GetPositionCodeByPositionIdResult()
                    {
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = CommonMessage.Login.POSITION_NOT_EXIST
                    };
                }

                var PositionCode = position.PositionCode;
                if (string.IsNullOrEmpty(PositionCode))
                {
                    return new GetPositionCodeByPositionIdResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = CommonMessage.Login.POSITION_NOT_EXIST
                    };
                }

                return new GetPositionCodeByPositionIdResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode="Success",
                    PositionCode = PositionCode,
                    OrganizationId = OrganizationId,
                    OrganizationName = OrganizationName,
                    lstResult = lstResult
                };
            }
            catch(Exception e)
            {
                return new GetPositionCodeByPositionIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
            
        }

        public GetAllRoleResult GetAllRole(GetAllRoleParameter parameter)
        {
            try
            {
                List<RoleEntityModel> listRoleResult = new List<RoleEntityModel>();
                var listRole = context.Role.ToList();
                if (listRole.Count > 0)
                {
                    listRole.ForEach(item =>
                    {
                        RoleEntityModel role = new RoleEntityModel();
                        role.RoleId = item.RoleId;
                        role.RoleValue = item.RoleValue;
                        role.Description = item.Description;
                        var userNumber = context.UserRole.Where(e => e.RoleId == item.RoleId).ToList().Count();
                        role.UserNumber = userNumber;
                        listRoleResult.Add(role);
                    });
                }

                return new GetAllRoleResult
                {
                    ListRole = listRoleResult,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lấy dữ liệu thành công"
                };
            }
            catch (Exception e)
            {
                return new GetAllRoleResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetCreatePermissionResult GetCreatePermission(GetCreatePermissionParameter parameter)
        {
            try
            {
                List<ActionResourceEntityModel> listActionResourceEntityModel = new List<ActionResourceEntityModel>();

                var listActionResource = context.ActionResource.ToList();
                listActionResource.ForEach(item =>
                {
                    listActionResourceEntityModel.Add(new ActionResourceEntityModel(item));
                });

                var ListMenuBuild = new List<MenuBuildEntityModel>();

                #region Lấy Module_Mapping, Resource_Mapping, Action_Mapping

                GetPermissionMapping(out List<PermissionTempModel> module_Mapping,
                    out List<PermissionTempModel> resource_Mapping,
                    out List<PermissionTempModel> action_Mapping);

                #endregion

                return new GetCreatePermissionResult
                {
                    ListActionResource = listActionResourceEntityModel,
                    ListMenuBuild = ListMenuBuild,
                    Module_Mapping = module_Mapping,
                    Resource_Mapping = resource_Mapping,
                    Action_Mapping = action_Mapping,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lấy dữ liệu thành công"
                };
            }
            catch (Exception e)
            {
                return new GetCreatePermissionResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreateRoleAndPermissionResult CreateRoleAndPermission(CreateRoleAndPermissionParameter parameter)
        {
            try
            {
                //Tạo Role
                Role role = new Role();
                role.RoleId = Guid.NewGuid();
                role.RoleValue = parameter.RoleValue;
                role.Description = parameter.Description;
                context.Role.Add(role);

                //Lấy list ActionResourceId từ mảng
                var listActionResourceId = context.ActionResource
                    .Where(e => parameter.ListActionResource.Contains(e.ActionResource1)).ToList();

                if (listActionResourceId.Count > 0)
                {
                    List<RoleAndPermission> listRoleAndPermission = new List<RoleAndPermission>();
                    listActionResourceId.ForEach(item =>
                    {
                        RoleAndPermission roleAndPermission = new RoleAndPermission();
                        roleAndPermission.RoleAndPermissionId = Guid.NewGuid();
                        roleAndPermission.ActionResourceId = item.ActionResourceId;
                        roleAndPermission.RoleId = role.RoleId;
                        listRoleAndPermission.Add(roleAndPermission);
                    });
                    context.RoleAndPermission.AddRange(listRoleAndPermission);
                }

                #region Lưu đường dẫn mặc định của Sub menu module tương ứng với Role

                if (parameter.ListMenuBuild.Count > 0)
                {
                    var listAllMenuBuild = context.MenuBuild.ToList();

                    var ListRoleAndMenuBuild = new List<RoleAndMenuBuild>();
                    parameter.ListMenuBuild.ForEach(item =>
                    {
                        var RoleAndMenuBuild = new RoleAndMenuBuild();
                        RoleAndMenuBuild.RoleAndMenuBuildId = Guid.NewGuid();

                        var subMenu = listAllMenuBuild.FirstOrDefault(x => x.Code == item.Code);
                        RoleAndMenuBuild.MenuBuildId = subMenu.MenuBuildId;
                        RoleAndMenuBuild.RoleId = role.RoleId;
                        RoleAndMenuBuild.Code = item.Code;
                        RoleAndMenuBuild.Path = item.Path;

                        ListRoleAndMenuBuild.Add(RoleAndMenuBuild);
                    });

                    context.RoleAndMenuBuild.AddRange(ListRoleAndMenuBuild);
                }

                #endregion

                context.SaveChanges();

                return new CreateRoleAndPermissionResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công"
                };
            }
            catch (Exception e)
            {
                return new CreateRoleAndPermissionResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetDetailPermissionResult GetDetailPermission(GetDetailPermissionParameter parameter)
        {
            try
            {
                var role = context.Role.FirstOrDefault(e => e.RoleId == parameter.RoleId);
                if (role == null)
                {
                    return new GetDetailPermissionResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tồn tại nhóm quyền này"
                    };
                }

                List<ActionResourceEntityModel> listActionResourceEntityModel = new List<ActionResourceEntityModel>();
                List<ActionResourceEntityModel> listCurrentActionResourceEntityModel = new List<ActionResourceEntityModel>();
                var listActionResource = context.ActionResource.ToList();
                listActionResource.ForEach(item =>
                {
                    listActionResourceEntityModel.Add(new ActionResourceEntityModel(item));
                });
                List<RoleAndPermission> listRoleAndPermission = new List<RoleAndPermission>();
                listRoleAndPermission = context.RoleAndPermission.Where(e => e.RoleId == role.RoleId).ToList();

                if (listRoleAndPermission.Count > 0)
                {
                    List<Guid> listActionResourceId = new List<Guid>();
                    listRoleAndPermission.ForEach(item =>
                    {
                        if (item.ActionResourceId != Guid.Empty && item.ActionResourceId != null)
                        {
                            listActionResourceId.Add(item.ActionResourceId.Value);
                        }
                    });

                    if (listActionResourceId.Count > 0)
                    {
                        var listCurrentActionResource = context.ActionResource.Where(e => listActionResourceId.Contains(e.ActionResourceId)).ToList();
                        listCurrentActionResource.ForEach(item =>
                        {
                            listCurrentActionResourceEntityModel.Add(new ActionResourceEntityModel(item));
                        });
                    }
                }

                #region Lấy list MenuBuid -> Giang comment: ko sử dụng nữa

                var ListMenuBuild = new List<MenuBuildEntityModel>();

                #endregion

                #region Lấy Module_Mapping, Resource_Mapping, Action_Mapping

                GetPermissionMapping(out List<PermissionTempModel> module_Mapping,
                    out List<PermissionTempModel> resource_Mapping,
                    out List<PermissionTempModel> action_Mapping);

                #endregion

                return new GetDetailPermissionResult
                {
                    Role = role,
                    ListActionResource = listActionResourceEntityModel,
                    ListCurrentActionResource = listCurrentActionResourceEntityModel,
                    ListMenuBuild = ListMenuBuild,
                    Module_Mapping = module_Mapping,
                    Resource_Mapping = resource_Mapping,
                    Action_Mapping = action_Mapping,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lấy dữ liệu thành công"
                };
            }
            catch (Exception e)
            {
                return new GetDetailPermissionResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public EditRoleAndPermissionResult EditRoleAndPermission(EditRoleAndPermissionParameter parameter)
        {
            try
            {
                var role = context.Role.FirstOrDefault(e => e.RoleId == parameter.RoleId);
                if (role == null)
                {
                    return new EditRoleAndPermissionResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tồn tại nhóm quyền"
                    };
                }
                role.RoleValue = parameter.RoleValue;
                role.Description = parameter.Description;
                context.Update(role);

                var listActionResource = context.ActionResource.Where(e => parameter.ListActionResource.Contains(e.ActionResource1)).ToList();
                List<Guid> listActionResourceId = new List<Guid>();
                if (listActionResource.Count > 0)
                {
                    listActionResource.ForEach(item =>
                    {
                        listActionResourceId.Add(item.ActionResourceId);
                    });
                }
                //Xóa trong bảng RoleAndPermission
                var listRoleAndPermissionOld = context.RoleAndPermission.Where(e => e.RoleId == role.RoleId).ToList();
                context.RoleAndPermission.RemoveRange(listRoleAndPermissionOld);

                //Thêm mới trong bảng RoleAndPermission
                List<RoleAndPermission> listRoleAndPermission = new List<RoleAndPermission>();
                if (listActionResourceId.Count > 0)
                {
                    listActionResourceId.ForEach(item =>
                    {
                        RoleAndPermission roleAndPermission = new RoleAndPermission();
                        roleAndPermission.RoleAndPermissionId = Guid.NewGuid();
                        roleAndPermission.ActionResourceId = item;
                        roleAndPermission.RoleId = role.RoleId;
                        listRoleAndPermission.Add(roleAndPermission);
                    });
                    context.RoleAndPermission.AddRange(listRoleAndPermission);
                }

                #region Lưu đường dẫn mặc định của Sub menu module tương ứng với Role

                //Xóa dữ liệu mặc định cũ
                var listOldRoleAndMenuBuild =
                    context.RoleAndMenuBuild.Where(x => x.RoleId == parameter.RoleId).ToList();
                context.RoleAndMenuBuild.RemoveRange(listOldRoleAndMenuBuild);

                if (parameter.ListMenuBuild.Count > 0)
                {
                    var listAllMenuBuild = context.MenuBuild.ToList();

                    var ListRoleAndMenuBuild = new List<RoleAndMenuBuild>();
                    parameter.ListMenuBuild.ForEach(item =>
                    {
                        var RoleAndMenuBuild = new RoleAndMenuBuild();
                        RoleAndMenuBuild.RoleAndMenuBuildId = Guid.NewGuid();

                        var subMenu = listAllMenuBuild.FirstOrDefault(x => x.Code == item.Code);
                        RoleAndMenuBuild.MenuBuildId = subMenu.MenuBuildId;
                        RoleAndMenuBuild.RoleId = role.RoleId;
                        RoleAndMenuBuild.Code = item.Code;
                        RoleAndMenuBuild.Path = item.Path;

                        ListRoleAndMenuBuild.Add(RoleAndMenuBuild);
                    });

                    context.RoleAndMenuBuild.AddRange(ListRoleAndMenuBuild);
                }

                #endregion

                context.SaveChanges();

                return new EditRoleAndPermissionResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công"
                };
            }
            catch (Exception e)
            {
                return new EditRoleAndPermissionResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public AddUserRoleResult AddUserRole(AddUserRoleParameter parameter)
        {
            try
            {
                var user = context.User.FirstOrDefault(e => e.EmployeeId == parameter.EmployeeId);
                var role = context.Role.FirstOrDefault(e => e.RoleId == parameter.RoleId);
                if (user == null)
                {
                    return new AddUserRoleResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tồn tại User này trên hệ thống"
                    };
                }
                if (role == null)
                {
                    return new AddUserRoleResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tồn tại Nhóm quyền này trên hệ thống"
                    };
                }
                var listUserRoleOld = context.UserRole.Where(e => e.UserId == user.UserId).ToList();
                if (listUserRoleOld.Count > 0)
                {
                    context.UserRole.RemoveRange(listUserRoleOld);
                }

                //Add lại role cho user
                //Hiện tại chỉ là 1:1
                UserRole userRole = new UserRole();
                userRole.UserRoleId = Guid.NewGuid();
                userRole.UserId = user.UserId;
                userRole.RoleId = role.RoleId;
                context.UserRole.Add(userRole);
                context.SaveChanges();

                return new AddUserRoleResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công"
                };
            }
            catch (Exception e)
            {
                return new AddUserRoleResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public DeleteRoleResult DeleteRole(DeleteRoleParameter parameter)
        {
            try
            {
                //Delete Role
                var role = context.Role.FirstOrDefault(e => e.RoleId == parameter.RoleId);
                if (role == null)
                {
                    return new DeleteRoleResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Nhóm quyền này không tồn tại"
                    };
                }
                context.Role.Remove(role);

                //Delete RoleAndPermission
                List<RoleAndPermission> listRoleAndPermission = new List<RoleAndPermission>();
                listRoleAndPermission = context.RoleAndPermission.Where(e => e.RoleId == parameter.RoleId).ToList();
                if (listRoleAndPermission.Count > 0)
                {
                    context.RoleAndPermission.RemoveRange(listRoleAndPermission);
                }

                //Delete User Role
                List<UserRole> listUserRole = new List<UserRole>();
                listUserRole = context.UserRole.Where(e => e.RoleId == parameter.RoleId).ToList();
                if (listUserRole.Count > 0)
                {
                    context.UserRole.RemoveRange(listUserRole);
                }

                context.SaveChanges();
                return new DeleteRoleResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa nhóm quyền thành công"
                };
            }
            catch (Exception e)
            {
                return new DeleteRoleResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        private void GetPermissionMapping(out List<PermissionTempModel> module_Mapping,
         out List<PermissionTempModel> resource_Mapping, out List<PermissionTempModel> action_Mapping)
        {
            module_Mapping = new List<PermissionTempModel>()
            {
                new PermissionTempModel()
                {
                    Key = "sys",
                    Name = "Module Quản lý hệ thống"
                },
                new PermissionTempModel()
                {
                    Key = "sal",
                    Name = "Module Quản lý hàng hóa"
                },
                new PermissionTempModel()
                {
                    Key = "hrm",
                    Name = "Module Quản trị nhân sự"
                },
                new PermissionTempModel()
                {
                    Key = "war",
                    Name = "Module Quản lý Kho"
                },
                new PermissionTempModel()
                {
                    Key = "man",
                    Name = "Module Quản lý sản xuất"
                },
                #region comment module
                //new PermissionTempModel()
                //{
                //    Key = "crm",
                //    Name = "Module Quản trị quan hệ khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "buy",
                //    Name = "Module Quản lý mua hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "acc",
                //    Name = "Module Quản lý tài chính"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "pro",
                //    Name = "Module Quản lý dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sos",
                //    Name = "Tình huống khẩn nguy"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "ass",
                //    Name = "Quản lý tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "rec",
                //    Name = "Quản lý tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary",
                //    Name = "Module quản lý lương"
                //},
                #endregion
            };

            resource_Mapping = new List<PermissionTempModel>()
            {
                #region Module Hàng hóa
                new PermissionTempModel()
                {
                    Key = "product/create",
                    Name = "Tạo mới sản phẩm/dịch vụ"
                },
                new PermissionTempModel()
                {
                    Key = "product/list",
                    Name = "Tìm kiếm sản phẩm dịch vụ"
                },
                new PermissionTempModel()
                {
                    Key = "product/detail",
                    Name = "Chi tiết sản phẩm/dịch vụ"
                },

                #endregion

                #region Module sản xuất
                new PermissionTempModel()
                {
                    Key = "manufacture/process-management/list",
                    Name = "Quản lý danh mục"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/product-order-workflow/create",
                    Name = "Tạo mới quy trình"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/product-order-workflow/detail",
                    Name = "Chi tiết quy trình"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/product-order-workflow/list",
                    Name = "Danh sách quy trình"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/production-order/create",
                    Name = "Tạo mới lệnh sản xuất"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/production-order/detail",
                    Name = "Chi tiết lệnh sản xuất"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/production-order/list",
                    Name = "Danh sách lệnh sản xuất"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/track-production/track",
                    Name = "Theo dõi sản xuất"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/lot-no/information",
                    Name = "Thông tin lô"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/inventory-of-defective-goods/create-update",
                    Name = "Bảng kiểm kê hàng lỗi"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/hr-report/list",
                    Name = "Báo cáo nhân sự"
                },
                new PermissionTempModel()
                {
                    Key = "manufacture/manufacture-report/list",
                    Name = "Nhật ký sản xuất"
                },
                #endregion

                #region Module Nhân sự  
                new PermissionTempModel()
                {
                    Key = "employee/request/list",
                    Name = "Đề xuất xin nghỉ"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-de-xuat-tang-luong",
                    Name = "Danh sách đề xuất tăng lương"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-de-nghi-tam-ung",
                    Name = "Danh sách tạm ứng"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-de-nghi-hoan-ung",
                    Name = "Danh sách hoàn ứng"
                },
                new PermissionTempModel()
                {
                    Key = "employee/quy-luong",
                    Name = "Cấu hình mức đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-ky-danh-gia",
                    Name = "Danh sách kỳ đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/chi-tiet-phieu-danh-gia",
                    Name = "Chi tiết phiếu đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-de-xuat-tang-luong",
                    Name = "Tạo đề xuất tăng lương"
                },
                new PermissionTempModel()
                {
                    Key = "employee/de-xuat-chuc-vu-detail",
                    Name = "Chi tiết đề xuất chức vụ"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-ho-so-cong-tac",
                    Name = "Danh sách hồ sơ công tác"
                },
                new PermissionTempModel()
                {
                    Key = "employee/employee-quit-work",
                    Name = "Danh sách nhân viên đã nghỉ việc"
                },
                new PermissionTempModel()
                {
                    Key = "employee/detail",
                    Name = "Chi tiết nhân viên"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-de-xuat-ot",
                    Name = "Danh sách kế hoạch OT"
                },
                new PermissionTempModel()
                {
                    Key = "employee/de-xuat-tang-luong-detail",
                    Name = "Chi tiết đề xuất tăng lương"
                },
                new PermissionTempModel()
                {
                    Key = "employee/kehoach-ot-detail",
                    Name = "Chi tiết kế hoạch OT"
                },
                new PermissionTempModel()
                {
                    Key = "employee/chi-tiet-de-nghi-tam-hoan-ung",
                    Name = "Chi tiết tạm ứng"
                },
                new PermissionTempModel()
                {
                    Key = "employee/bao-cao-nhan-su",
                    Name = "Báo cáo nhân sự"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-de-xuat-cong-tac",
                    Name = "Tạo đề xuất công tác"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-de-nghi-tam-hoan-ung",
                    Name = "Tạo mới tạm ứng"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-de-xuat-chuc-vu",
                    Name = "Danh sách đề xuất chức vụ"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-de-xuat-cong-tac",
                    Name = "Danh sách đề xuất công tác"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-phieu-danh-gia",
                    Name = "Tạo phiếu đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/de-xuat-cong-tac-chi-tiet",
                    Name = "Chi tiết đề xuất công tác"
                },
                new PermissionTempModel()
                {
                    Key = "employee/create",
                    Name = "Tạo mới nhân viên"
                },
                new PermissionTempModel()
                {
                    Key = "employee/chi-tiet-ky-danh-gia",
                    Name = "Chi tiết kỳ đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/request/create",
                    Name = "Tạo đề xuất xin nghỉ"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-ho-so-cong-tac",
                    Name = "Tạo hồ sơ công tác"
                },
                new PermissionTempModel()
                {
                    Key = "employee/chi-tiet-ho-so-cong-tac",
                    Name = "Chi tiết hồ sơ công tác"
                },
                new PermissionTempModel()
                {
                    Key = "employee/list",
                    Name = "Tìm kiếm nhân viên"
                },
                new PermissionTempModel()
                {
                    Key = "employee/request/detail",
                    Name = "Xem chi tiết đề xuất xin nghỉ"
                },
                new PermissionTempModel()
                {
                    Key = "employee/cauhinh-baohiem",
                    Name = "Cấu hình bảo hiểm"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-ky-danh-gia",
                    Name = "Tạo kỳ đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-cong-viec-tuyen-dung",
                    Name = "Tạo vị trí tuyển dụng"
                },
                new PermissionTempModel()
                {
                    Key = "employee/cauhinh-checklist",
                    Name = "Cấu hình checklist"
                },
                new PermissionTempModel()
                {
                    Key = "employee/tao-de-xuat-chuc-vu",
                    Name = "Tạo đề xuất chức vụ"
                },
                new PermissionTempModel()
                {
                    Key = "employee/kehoach-ot-create",
                    Name = "Tạo mới kế hoạch OT"
                },
                new PermissionTempModel()
                {
                    Key = "employee/danh-sach-phieu-danh-gia",
                    Name = "Cấu hình phiếu đánh giá"
                },
                new PermissionTempModel()
                {
                    Key = "employee/dashboard",
                    Name = "Dashboard nhân viên"
                },
                #endregion

                #region Module QL Hệ thống
                new PermissionTempModel()
                {
                    Key = "admin/masterdata",
                    Name = "Quản lý danh mục dữ liệu"
                },
                new PermissionTempModel()
                {
                    Key = "admin/permission-detail",
                    Name = "Xem chi tiết thông tin nhóm quyền"
                },
                new PermissionTempModel()
                {
                    Key = "admin/permission-create",
                    Name = "Tạo mới nhóm quyền"
                },
                new PermissionTempModel()
                {
                    Key = "admin/workflow/workflow-list",
                    Name = "Danh sách quy trình làm việc"
                },
                new PermissionTempModel()
                {
                    Key = "admin/config-level-customer",
                    Name = "Cấu hình phân hạng khách hàng"
                },
                new PermissionTempModel()
                {
                    Key = "admin/organization",
                    Name = "Quản lý tổ chức"
                },
                new PermissionTempModel()
                {
                    Key = "admin/company-config",
                    Name = "Cấu hình hệ thống"
                },
                new PermissionTempModel()
                {
                    Key = "admin/email-configuration",
                    Name = "Quản lý mẫu Email"
                },
                new PermissionTempModel()
                {
                    Key = "admin/workflow/workflow-detail",
                    Name = "Xem chi tiết thông tin quy trình"
                },
                new PermissionTempModel()
                {
                    Key = "admin/workflow/workflow-create",
                    Name = "Tạo mới quy trình làm việc"
                },
                new PermissionTempModel()
                {
                    Key = "admin/permission",
                    Name = "Quản lý nhóm quyền"
                },
                new PermissionTempModel()
                {
                    Key = "admin/system-parameter",
                    Name = "Tham số hệ thống"
                },
                new PermissionTempModel()
                {
                    Key = "admin/folder-config",
                    Name = "Cấu hình thư mục"
                },
                new PermissionTempModel()
                {
                    Key = "admin/business-goals",
                    Name = "Kế hoạch kinh doanh"
                },
                new PermissionTempModel()
                {
                    Key = "admin/notifi-setting-list",
                    Name = "Quản lý thông báo"
                },
                new PermissionTempModel()
                {
                    Key = "admin/audit-trace",
                    Name = "Nhật ký hệ thống"
                },
                #endregion

                #region Module Kho NVL, CCDC

                // Danh sách kho
                new PermissionTempModel()
                {
                    Key = "warehouse/list",
                    Name = "Danh sách kho"
                },

                // phiếu đề nghị xuất kho
                new PermissionTempModel()
                {
                    Key = "warehouse/de-nghi-xuat-kho/create",
                    Name = "Tạo phiếu đề nghị xuất kho"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/de-nghi-xuat-kho/detail",
                    Name = "Chi tiết phiếu đề nghị xuất kho"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/de-nghi-xuat-kho/list",
                    Name = "Danh sách phiếu đề nghị xuất kho"
                },

                // Phiếu nhập kho, kho NVL CCDC
                new PermissionTempModel()
                {
                    Key = "warehouse/inventory-receiving-voucher/create",
                    Name = "Tạo phiếu nhập kho"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/inventory-receiving-voucher/detail",
                    Name = "Chi tiết phiếu nhập kho"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/inventory-receiving-voucher/list",
                    Name = "Danh sách phiếu nhập kho"
                },

                // Phiếu xuất kho, kho NVL CCDC

                new PermissionTempModel()
                {
                    Key = "warehouse/inventory-delivery-voucher/create-update",
                    Name = "Tạo phiếu xuất kho"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/inventory-delivery-voucher/detail",
                    Name = "Chi tiết phiếu xuất kho"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/inventory-delivery-voucher/list",
                    Name = "Danh sách phiếu xuất kho"
                },

                // Báo cáo tồn kho kho NVL, CCDC
                new PermissionTempModel()
                {
                    Key = "warehouse/in-stock-report/list",
                    Name = "Báo cáo tồn kho"
                },

                // Kiểm kê kho
                new PermissionTempModel()
                {
                    Key = "warehouse/kiem-ke-kho/detail",
                    Name = "Chi tiết đợt kiểm kê"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/kiem-ke-kho/list",
                    Name = "Danh sách đợt kiểm kê"
                },

                // Danh sách kho xuất kho thành phẩm
                new PermissionTempModel()
                {
                    Key = "warehouse/thanh-pham-xuat/list",
                    Name = "Danh sách xuất kho thành phẩm"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/thanh-pham-xuat/create",
                    Name = "Tạo mới danh sách xuất kho, kho thành phẩm"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/thanh-pham-xuat/detail",
                    Name = "Chi tiết xuất kho, kho thành phẩm"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/thanh-pham-nhap/list",
                    Name = "Danh sách nhập kho, kho thành phẩm"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/thanh-pham-nhap/detail",
                    Name = "Chi tiết nhập kho, kho thành phẩm"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/kho-thanh-pham/bao-cao-ton-kho",
                    Name = "Báo cáo tồn kho, kho thành phẩm"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/kho-san-xuat-nhap/detail",
                    Name = "Chi tiết phiếu nhập kho, kho sản xuất"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/danh-sach-xuat-kho/list",
                    Name = "Danh sách xuất kho, kho sản xuất"
                },

                new PermissionTempModel()
                {
                    Key = "warehouse/tao-moi-xuat-kho/create",
                    Name = "Tạo phiếu xuất kho, kho sản xuất"
                },

                
                #endregion

                #region comment 
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/technique-request/create",
                //    Name = "Tạo mới tiến trình"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/technique-request/detail",
                //    Name = "Chi tiết tiến trình"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/technique-request/list",
                //    Name = "Danh sách tiến trình"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/total-production-order/create",
                //    Name = "Tạo mới lệnh tổng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/total-production-order/detail",
                //    Name = "Chi tiết lệnh tổng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/total-production-order/list",
                //    Name = "Danh sách lệnh tổng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/report/quanlity-control",
                //    Name = "Báo cáo theo QC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "manufacture/report/manufacture",
                //    Name = "Báo cáo sản xuất"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/dashboard-chien-dich",
                //    Name = "Dashboard chiến dịch tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/tao-chien-dich",
                //    Name = "Tạo chiến dịch tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/chi-tiet-chien-dich",
                //    Name = "Chi tiết chiến dịch tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/danh-sach-chien-dich",
                //    Name = "Dánh sách chiến dịch tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/dashboard-tuyen-dung",
                //    Name = "Dashboard vị trí tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/chi-tiet-cong-viec-tuyen-dung",
                //    Name = "Chi tiết vị trí tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/danh-sach-cong-viec-tuyen-dung",
                //    Name = "Dánh sách vị trí tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/bao-cao-cong-viec-tuyen-dung",
                //    Name = "Báo cáo vị trí tuyển dụng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/dashboard-ung-vien",
                //    Name = "Dashboard ứng viên"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/tao-ung-vien",
                //    Name = "Tạo ứng viên"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/chi-tiet-ung-vien",
                //    Name = "Chi tiết ứng viên"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/danh-sach-ung-vien",
                //    Name = "Dánh sách ứng viên"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/create",
                //    Name = "Tạo mới khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/request-approval",
                //    Name = "Phê duyệt khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/dashboard",
                //    Name = "Dashboard khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/list",
                //    Name = "Tìm kiếm khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/detail",
                //    Name = "Chi tiết khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/list-contact-customer",
                //    Name = "Danh sách liên hệ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "lead/create-lead",
                //    Name = "Tạo mới Cơ hội"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "lead/dashboard",
                //    Name = "Dashboard Cơ hội"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "lead/list",
                //    Name = "Tìm kiếm Cơ hội"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "lead/detail",
                //    Name = "Chi tiết Cơ hội"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "lead/approval",
                //    Name = "Phê duyệt khách hàng ngừng theo dõi"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "lead/report-lead",
                //    Name = "Báo cáo cơ hội"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sale-bidding/dashboard",
                //    Name = "Dashboard hồ sơ thầu"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sale-bidding/list",
                //    Name = "Danh sách hồ sơ thầu"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sale-bidding/create",
                //    Name = "Tạo mới hồ sơ thầu"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sale-bidding/approved",
                //    Name = "Phê duyệt hồ sơ thầu"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sale-bidding/detail",
                //    Name = "Chi tiết hồ sơ thầu"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/quote-dashboard",
                //    Name = "Dashboard báo giá"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/quote-create",
                //    Name = "Tạo mới báo giá"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/quote-list",
                //    Name = "Tìm kiếm báo giá"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/quote-detail",
                //    Name = "Chi tiết báo giá"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/quote-approval",
                //    Name = "Phê duyệt báo giá"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/care-create",
                //    Name = "Tạo chương trình chăm sóc"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/care-dashboard",
                //    Name = "Dashboard chăm sóc khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/care-list",
                //    Name = "Theo dõi chăm sóc khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/care-detail",
                //    Name = "Chi tiết chăm sóc khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "admin/list-product-category",
                //    Name = "Quản lý danh mục"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "product/create",
                //    Name = "Tạo mới sản phẩm/dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "product/list",
                //    Name = "Tìm kiếm sản phẩm dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "product/detail",
                //    Name = "Chi tiết sản phẩm/dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "product/price-list",
                //    Name = "Danh mục giá bán"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/dashboard",
                //    Name = "Dashboard bán hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/contract-create",
                //    Name = "Tạo hợp đồng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/contract-list",
                //    Name = "Danh sách hợp đồng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/contract-detail",
                //    Name = "Chi tiết hợp đồng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/contract-dashboard",
                //    Name = "Dashboard hợp đồng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "bill-sale/create",
                //    Name = "Tạo hóa đơn"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "bill-sale/detail",
                //    Name = "Chi tiết hóa đơn"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "bill-sale/list",
                //    Name = "Danh sách hóa đơn"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "order/create",
                //    Name = "Tạo mới đơn hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "order/list-profit-according-customers",
                //    Name = "Báo cáo lợi nhuận theo khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "order/list",
                //    Name = "Tìm kiếm đơn hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "order/order-detail",
                //    Name = "Chi tiết đơn hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/top-revenue",
                //    Name = "Báo cáo doanh số theo nhân viên"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "sales/product-revenue",
                //    Name = "Báo cáo lợi nhuận theo sản phẩm"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/list-vendor-price",
                //    Name = "Bảng giá nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/create",
                //    Name = "Tạo mới nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/list",
                //    Name = "Tìm kiếm nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/detail",
                //    Name = "Xem chi tiết nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/list-vendor-quote",
                //    Name = "Danh sách giấy đề nghị báo giá NCC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/vendor-quote-create",
                //    Name = "Tạo đề nghị báo giá NCC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/vendor-quote-detail",
                //    Name = "Xem chi tiết đề nghị báo giá NCC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "procurement-request/create",
                //    Name = "Tạo đề xuất mua hàng sản phẩm/dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "procurement-request/list",
                //    Name = "Tìm kiếm đề xuất mua hàng sản phẩm/dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "procurement-request/list-report",
                //    Name = "Báo cáo tình trạng đề xuất mua hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "procurement-request/view",
                //    Name = "Xem chi tiết đề xuất mua hàng sản phẩm/dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/create-order",
                //    Name = "Đặt hàng nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/list-order",
                //    Name = "Tìm kiếm quản lý mua hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/detail-order",
                //    Name = "Xem chi tiết thông tin đặt hàng nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/vendor-order-report",
                //    Name = "Báo cáo tình trạng đơn hàng mua"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-receipts-create",
                //    Name = "Tạo phiếu thu tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-receipts-list",
                //    Name = "Danh sách phiếu thu tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-receipts-view",
                //    Name = "Xem chi tiết phiếu thu tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-payments-create",
                //    Name = "Tạo phiếu chi tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-payments-list",
                //    Name = "Danh sách phiếu chi tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-payments-view",
                //    Name = "Xem chi tiết phiếu chi tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cash-book",
                //    Name = "Sổ quỹ tiền mặt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-receipts-create",
                //    Name = "Tạo báo có"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-receipts-list",
                //    Name = "Danh sách báo có ngân hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-receipts-detail",
                //    Name = "Xem chi tiết thông tin báo có"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-payments-create",
                //    Name = "Tạo phiếu UNC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-payments-list",
                //    Name = "Danh sách UNC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-payments-detail",
                //    Name = "Xem chi tiết thông tin UNC"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/bank-book",
                //    Name = "Sổ quỹ ngân hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/receivable-vendor-report",
                //    Name = "Công nợ nhà cung cấp"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/receivable-customer-report",
                //    Name = "Công nợ khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/sales-report",
                //    Name = "Báo cáo kết quả kinh doanh"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/receivable-customer-detail",
                //    Name = "Xem chi tiết Công nợ khách hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "accounting/cost-create",
                //    Name = "Tạo chi phí"
                //},
                
                //new PermissionTempModel()
                //{
                //    Key = "customer/potential-customer-list",
                //    Name = "Danh sách tiềm năng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/potential-customer-create",
                //    Name = "Tạo mới tiềm năng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/potential-customer-dashboard",
                //    Name = "Dashboard tiềm năng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/potential-customer-detail",
                //    Name = "Chi tiết tiềm năng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "customer/potential-customer-request-approval",
                //    Name = "Phê duyệt tiềm năng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "order/pay-order-service",
                //    Name = "Thanh toán đơn hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "order/order-service-create",
                //    Name = "Tạo đơn hàng dịch vụ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "promotion/create",
                //    Name = "Tạo mới Chương trình khuyến mại"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "promotion/detail",
                //    Name = "Chi tiết Chương trình khuyến mại"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "promotion/list",
                //    Name = "Danh sách Chương trình khuyến mại"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/dashboard",
                //    Name = "Dashboard dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/create",
                //    Name = "Tạo mới dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/list",
                //    Name = "Tìm kiếm dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/scope",
                //    Name = "Hạng mục dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/resource",
                //    Name = "Nguồn lực dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/milestone",
                //    Name = "Mốc dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/list-project-task",
                //    Name = "Danh sách công việc"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/create-project-task",
                //    Name = "Tạo công việc"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/detail-dashboard",
                //    Name = "Dashboard chi tiết dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/detail",
                //    Name = "Chi tiết dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/document",
                //    Name = "Quản lý tài liệu"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/search-time-sheet",
                //    Name = "Danh sách timesheet"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/bc-su-dung-nguon-luc",
                //    Name = "Báo cáo sử dụng nguồn lực"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "project/bc-tong-hop-cac-du-an",
                //    Name = "Báo cáo tổng hợp các dự án"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "tinhHuongKhanNguy/actions",
                //    Name = "Kích hoạt"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/dashboard",
                //    Name = "Dashboard"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "vendor/dashboard/create",
                //    Name = "Tạo mới đơn hàng"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/create",
                //    Name = "Tạo tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/list",
                //    Name = "Danh sách tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/phan-bo-tai-san",
                //    Name = "Phân bổ tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/thu-hoi-tai-san",
                //    Name = "Thu hồi tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/yeu-cau-cap-phat-tai-san",
                //    Name = "Tạo mới cấp phát"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/danh-sach-yeu-cau-cap-phat",
                //    Name = "Danh sách cấp phát"
                //},

                //new PermissionTempModel()
                //{
                //    Key = "salary/cau-hinh-chung",
                //    Name = "Cấu hình chung"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/bao-cao-phan-bo",
                //    Name = "Báo cáo phân bổ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/bao-cao-khau-hao",
                //    Name = "Báo cáo khấu hao"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary/tk-cham-cong",
                //    Name = "Chấm công"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/detail",
                //    Name = "Chi tiết tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/chi-tiet-yeu-cau-cap-phat",
                //    Name = "Chi tiết cấp phát"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/bao-cao-phan-bo",
                //    Name = "Báo cáo phân bổ"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/bao-cao-khau-hao",
                //    Name = "Báo cáo khấu hao"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary/ky-luong-detail",
                //    Name = "Chi tiết kỳ lương"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary/ky-luong-list",
                //    Name = "Danh sách kỳ lương"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary/phieu-luong-list",
                //    Name = "Danh sách phiếu lương"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary/phieu-luong-detail",
                //    Name = "Chi tiết phiếu lương"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/danh-sach-dot-kiem-ke",
                //    Name = "Kiểm kê tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "asset/chi-tiet-dot-kiem-ke",
                //    Name = "Chi tiết kiểm kê tài sản"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "employee/quy-luong",
                //    Name = "Cấu hình chung đánh giá"
                //},
                //new PermissionTempModel()
                //{
                //    Key = "salary/bao-cao-chi-phi",
                //    Name = "Báo cáo chi phí"
                //},
                #endregion
            };

            action_Mapping = new List<PermissionTempModel>()
            {
                new PermissionTempModel()
                {
                    Key = "view",
                    Name = "Xem"
                },
                new PermissionTempModel()
                {
                    Key = "add",
                    Name = "Thêm"
                },
                new PermissionTempModel()
                {
                    Key = "edit",
                    Name = "Sửa"
                },
                new PermissionTempModel()
                {
                    Key = "delete",
                    Name = "Xóa"
                },
                new PermissionTempModel()
                {
                    Key = "import",
                    Name = "Tải lên"
                },
                new PermissionTempModel()
                {
                    Key = "print",
                    Name = "In file"
                },
                new PermissionTempModel()
                {
                    Key = "balance",
                    Name = "Cân bằng kho"
                },
                new PermissionTempModel()
                {
                    Key = "download",
                    Name = "Tải xuống"
                },
                new PermissionTempModel()
                {
                    Key = "sms",
                    Name = "Gửi sms"
                },
                new PermissionTempModel()
                {
                    Key = "email",
                    Name = "Gửi email"
                },
                new PermissionTempModel()
                {
                    Key = "warehouse",
                    Name = "Nhập kho"
                },
                new PermissionTempModel()
                {
                    Key = "export",
                    Name = "Xuất kho"
                },
                new PermissionTempModel()
                {
                    Key = "approve",
                    Name = "Phê duyệt"
                },
                new PermissionTempModel()
                {
                    Key = "send_approve",
                    Name = "Gửi phê duyệt"
                },
                new PermissionTempModel()
                {
                    Key = "reject",
                    Name = "Từ chối"
                },
                new PermissionTempModel()
                {
                    Key = "confirm",
                    Name = "Xác nhận"
                },
                new PermissionTempModel()
                {
                    Key = "re-pass",
                    Name = "Đặt lại mật khẩu"
                },
                new PermissionTempModel()
                {
                    Key = "delete-file",
                    Name = "Xóa File"
                },
                new PermissionTempModel()
                {
                    Key = "payment",
                    Name = "Thanh toán"
                },
                new PermissionTempModel()
                {
                    Key = "editnote",
                    Name = "Sửa/Xóa ghi chú"
                },
                new PermissionTempModel()
                {
                    Key = "copyscope",
                    Name = "Copy hạng mục"
                },
                new PermissionTempModel()
                {
                    Key = "cap-phat",
                    Name = "Cấp phát"
                },
                new PermissionTempModel()
                {
                    Key = "thu-hoi",
                    Name = "Thu hồi"
                },
                new PermissionTempModel()
                {
                    Key = "complete",
                    Name = "Hoàn thành"
                },
                new PermissionTempModel()
                {
                    Key = "edit-complete",
                    Name = "Sửa phiếu đã hoàn thành"
                },
            };
        }
    }
}
