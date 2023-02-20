using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TN.TNM.Common;
using TN.TNM.DataAccess.ConstType;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.ConfigProduction;
using TN.TNM.DataAccess.Messages.Results.ConfigProduction;
using TN.TNM.DataAccess.Models.ConfigProduction;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class ConfigProductionDAO : BaseDAO, IConfigProductionDataAccess
    {
        public ConfigProductionDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
        }

        public DeleteConfigProductionResult DeleteConfigProduction(DeleteConfigProductionParameter parameter)
        {
            var result = new DeleteConfigProductionResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Xóa cấu hình sản xuất thành công",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entConfigProduction = context.ConfigProduction.FirstOrDefault(f => f.Id == parameter.ConfigProductionId);
                    if (entConfigProduction != null)
                    {
                        var entCheck = context.ProductionProcessDetail.FirstOrDefault(f => f.ConfigProductionId == entConfigProduction.Id);
                        if (entCheck == null)
                        {
                            var entitiesConfigStage = context.ConfigStage.Where(w => w.ConfigProductionId == entConfigProduction.Id).ToList();
                            if (entitiesConfigStage != null)
                            {
                                var listConfigStageId = entitiesConfigStage.Select(s => s.Id).ToList();
                                var entitiesConfigStepByStepStage = context.ConfigStepByStepStage.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                if (entitiesConfigStepByStepStage != null)
                                {
                                    #region Remove ConfigStepByStepStage
                                    context.ConfigStepByStepStage.RemoveRange(entitiesConfigStepByStepStage);
                                    context.SaveChanges();
                                    #endregion
                                }

                                var entitiesConfigContentStage = context.ConfigContentStage.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                if (entitiesConfigContentStage != null)
                                {
                                    #region Remove ConfigContentStage
                                    context.ConfigContentStage.RemoveRange(entitiesConfigContentStage);
                                    context.SaveChanges();
                                    #endregion
                                }

                                var entitiesConfigSpecificationsStage = context.ConfigSpecificationsStage.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                if (entitiesConfigSpecificationsStage != null)
                                {
                                    var listConfigSpecificationsStageId = entitiesConfigSpecificationsStage.Select(s => s.Id).ToList();
                                    var entitiesConfigSpecificationsStageValue = context.ConfigSpecificationsStageValue.Where(w => listConfigSpecificationsStageId.Contains(w.ConfigSpecificationsStageId)).ToList();
                                    if (entitiesConfigSpecificationsStageValue != null)
                                    {
                                        #region Remove ConfigSpecificationsStageValue
                                        context.ConfigSpecificationsStageValue.RemoveRange(entitiesConfigSpecificationsStageValue);
                                        context.SaveChanges();
                                        #endregion
                                    }

                                    #region Remove ConfigSpecificationsStage
                                    context.ConfigSpecificationsStage.RemoveRange(entitiesConfigSpecificationsStage);
                                    context.SaveChanges();
                                    #endregion
                                }

                                var entitiesConfigErrorItem = context.ConfigErrorItem.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                if (entitiesConfigErrorItem != null)
                                {
                                    #region Remove ConfigErrorItem
                                    context.ConfigErrorItem.RemoveRange(entitiesConfigErrorItem);
                                    context.SaveChanges();
                                    #endregion
                                }

                                var entitiesConfigStageProductInput = context.ConfigStageProductInput.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                if (entitiesConfigStageProductInput != null)
                                {
                                    #region Remove ConfigStageProductInput
                                    context.ConfigStageProductInput.RemoveRange(entitiesConfigStageProductInput);
                                    context.SaveChanges();
                                    #endregion
                                }

                                #region Remove ConfigStage
                                context.ConfigStage.RemoveRange(entitiesConfigStage);
                                context.SaveChanges();
                                #endregion
                            }
                            #region Remove ConfigProduction
                            context.ConfigProduction.Remove(entConfigProduction);
                            context.SaveChanges();
                            #endregion
                        }
                        else
                        {
                            result.Message = "Quy trình " + entConfigProduction.Code + " đã được kết hợp với lệnh sản xuất, bạn không thể xóa!";
                            result.StatusCode = HttpStatusCode.ExpectationFailed;
                        }
                    }
                    else
                    {
                        result.Message = "Không tồn tại mã quy trình này!";
                        result.StatusCode = HttpStatusCode.ExpectationFailed;
                    }
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    result.Message = ex.Message;
                    result.StatusCode = HttpStatusCode.ExpectationFailed;
                }
            }
            return result;
        }

        public GetAllConfigProductionResult GetAllConfigProduction(GetAllConfigProductionParameter parameter)
        {
            var result = new GetAllConfigProductionResult 
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Nhận tất cả cấu hình sản xuất thành công",
                ConfigProductions = new List<ConfigProductionModel>(),
            };
            try
            {
                var listConfigProduction = new List<ConfigProductionModel>();

                var configProductionList = context.ConfigProduction.Where(w => w.Code.Contains(parameter.Code.Trim())).ToList();
                var listProductId = configProductionList.Select(s => s.ProductId).Distinct().ToList();
                var productList = context.Product
                    .Where(w => w.ProductCode.Contains(parameter.ProductCode.Trim()) && w.ProductName.Contains(parameter.ProductName.Trim()) && listProductId.Contains(w.ProductId))
                    .Select(s => new { s.ProductId, s.ProductCode, s.ProductName }).ToList();

                //var lisConfigProductionId = configProductionList.Select(s => s.Id).ToList();
                //var configStageList = context.ConfigStage.Where(w => lisConfigProductionId.Contains(w.ConfigProductionId)).ToList();

                configProductionList.ForEach(item =>
                {
                    
                    var product = productList.FirstOrDefault(f => f.ProductId == item.ProductId);
                    if (product != null)
                    {
                        var addItem = new ConfigProductionModel(item);                        
                        #region Add Productcode and ProductName
                        addItem.ProductCode = product.ProductCode;
                        addItem.ProductName = product.ProductName;
                        #endregion

                        #region The list ConfigStage (Cấu hình công đoạn)
                        //var ConfigStagesList = configStageList.Where(s => s.ConfigProductionId == item.Id).ToList();

                        //#region Get list masterdata by StageNameId or StageGroupId
                        //var listStage = ConfigStagesList.Select(s => s.StageNameId).Distinct().ToList();
                        //var listStageGroup = ConfigStagesList.Select(s => s.StageGroupId).Distinct().ToList();
                        //var categoryList = context.Category.Where(w => listStage.Contains(w.CategoryId) || listStageGroup.Contains(w.CategoryId)).Select(s => new { s.CategoryId, s.CategoryCode, s.CategoryName }).ToList();
                        //#endregion

                        //#region Get list Organization by DepartmentId
                        //var listDepartment = ConfigStagesList.Select(s => s.DepartmentId).Distinct().ToList();

                        //var organizationList = context.Organization.Where(w => listDepartment.Contains(w.OrganizationId)).Select(s => new { s.OrganizationId, s.OrganizationCode, s.OrganizationName }).ToList();
                        //#endregion

                        //#region Get List Employee by OrganizationId
                        //var listOrganization = organizationList.Select(s => s.OrganizationId).ToList();
                        //var employeeList = context.Employee.Where(w => listOrganization.Contains(w.OrganizationId.Value)).Select(s => new { s.EmployeeId, s.EmployeeCode, s.EmployeeName }).ToList();
                        //#endregion

                        //#region Get list ConfigStepByStepStage by ConfigStage.Id
                        //var listConfigStage = ConfigStagesList.Select(s => s.Id).ToList();
                        //var configStepByStepStageList = context.ConfigStepByStepStage.Where(w => listConfigStage.Contains(w.ConfigStageId)).ToList();
                        //#endregion

                        //#region Get list ConfigContentStage by ConfigStage.Id
                        //var configContentStageList = context.ConfigContentStage.Where(w => listConfigStage.Contains(w.ConfigStageId)).ToList();
                        //#endregion

                        //#region Get list ConfigSpecificationsStage by ConfigStage.Id
                        //var configSpecificationsStageList = context.ConfigSpecificationsStage.Where(w => listConfigStage.Contains(w.ConfigStageId)).ToList();
                        //#endregion

                        //#region Get List ConfigErrorItem by ConfigStage.Id
                        //var configErrorItemList =context.ConfigErrorItem.Where(w => listConfigStage.Contains(w.ConfigStageId)).ToList();
                        //#endregion

                        //var addConfigStages = new List<ConfigStageModel>();
                        //ConfigStagesList.ForEach(itemConfigStage =>
                        //{
                        //    var stageName = categoryList.FirstOrDefault(f => f.CategoryId == itemConfigStage.StageNameId);
                        //    var stageGroup = categoryList.FirstOrDefault(f => f.CategoryId == itemConfigStage.StageGroupId);
                        //    var department = organizationList.FirstOrDefault(f => f.OrganizationId == itemConfigStage.DepartmentId);
                        //    if (stageName != null && stageGroup != null && department != null)
                        //    {
                        //        var addItemConfigStage = new ConfigStageModel(itemConfigStage);

                        //        addItemConfigStage.StageName = stageName.CategoryName;
                        //        addItemConfigStage.StageGroupName = stageGroup.CategoryName;

                        //        var personInCharge = employeeList.Where(w => itemConfigStage.PersonInChargeId.Contains(w.EmployeeId)).ToList();
                        //        if (personInCharge != null)
                        //        {
                        //            addItemConfigStage.PersonInChargeName = personInCharge.Select(s => s.EmployeeName).ToArray();
                        //        }
                        //        var personVerifier = employeeList.FirstOrDefault(f => f.EmployeeId == itemConfigStage.PersonVerifierId);
                        //        if (personVerifier != null)
                        //        {
                        //            addItemConfigStage.PersonVerifierName = personVerifier.EmployeeName;
                        //        }
                        //        addItemConfigStage.DepartmentName = department.OrganizationName;

                        //        #region Add list ConfigStepByStepStage by itemConfigStage.Id (Danh sách các bước thực hiện)
                        //        var addConfigStepByStepStageList = new List<ConfigStepByStepStageModel>();
                        //        var dbConfigStepByStepStageList = configStepByStepStageList.Where(w => w.ConfigStageId == itemConfigStage.Id).ToList();
                        //        dbConfigStepByStepStageList.ForEach(itemConfigStepByStepStage =>
                        //        {
                        //            var addConfigStepByStepStage = new ConfigStepByStepStageModel(itemConfigStepByStepStage);
                        //            addConfigStepByStepStage.MappingId = addConfigStepByStepStage.Id;
                        //            addConfigStepByStepStageList.Add(addConfigStepByStepStage);
                        //        });
                        //        addItemConfigStage.ConfigStepByStepStages = addConfigStepByStepStageList;
                        //        #endregion

                        //        #region Add list ConfigContentStage by itemConfigStage.Id (Danh sách nội dung kiểm tra)
                        //        var addConfigContentStageList = new List<ConfigContentStageModel>();
                        //        var dbConfigContentStageList = configContentStageList.Where(w => w.ConfigStageId == itemConfigStage.Id).ToList();
                        //        dbConfigContentStageList.ForEach(itemConfigContentStage =>
                        //        {
                        //            var addConfigContentStage = new ConfigContentStageModel(itemConfigContentStage);
                        //            addConfigContentStage.MappingId= addConfigContentStage.Id;
                        //            //addConfigContentStage.ConfigStepByStepStageIdMapping = addConfigContentStage.ConfigStepByStepStageId;
                        //            addConfigContentStageList.Add(addConfigContentStage);
                        //        });
                        //        addItemConfigStage.ConfigContentStages = addConfigContentStageList;
                        //        #endregion

                        //        #region Add list ConfigSpecificationsStage by itemConfigStage.Id (Danh sách quy cách)
                        //        var addConfigSpecificationsStageList = new List<ConfigSpecificationsStageModel>();
                        //        var dbConfigSpecificationsStageList = configSpecificationsStageList.Where(w => w.ConfigStageId == itemConfigStage.Id).ToList();

                        //        #region Get list ConfigSpecificationsStageValue by ConfigSpecificationsStage.Id (List Giá trị quy cách)
                        //        var listConfigSpecificationsStage = dbConfigSpecificationsStageList.Select(s => s.Id).ToList();
                        //        var configSpecificationsStageValueList = context.ConfigSpecificationsStageValue.Where(w => listConfigSpecificationsStage.Contains(w.ConfigSpecificationsStageId)).ToList();
                        //        #endregion

                        //        dbConfigSpecificationsStageList.ForEach(itemConfigSpecificationsStage =>
                        //        {
                        //            var addConfigSpecificationsStage = new ConfigSpecificationsStageModel(itemConfigSpecificationsStage);
                        //            var addConfigSpecificationsStageValues = new List<ConfigSpecificationsStageValueModel>();
                        //            var dbconfigSpecificationsStageValueList = configSpecificationsStageValueList.Where(w => w.ConfigSpecificationsStageId == itemConfigSpecificationsStage.Id).ToList();
                        //            dbconfigSpecificationsStageValueList.ForEach(itemConfigSpecificationsStageValue =>
                        //            {
                        //                addConfigSpecificationsStageValues.Add(new ConfigSpecificationsStageValueModel(itemConfigSpecificationsStageValue));
                        //            });
                        //            addConfigSpecificationsStage.ConfigSpecificationsStageValues = addConfigSpecificationsStageValues;
                        //            addConfigSpecificationsStage.ConfigContentStageIdMapping = addConfigSpecificationsStage.ConfigContentStageId;
                        //            addConfigSpecificationsStage.ConfigStepByStepStageIdMapping = addConfigSpecificationsStage.ConfigStepByStepStageId;
                        //            addConfigSpecificationsStageList.Add(addConfigSpecificationsStage);
                        //        });
                        //        addItemConfigStage.ConfigSpecificationsStages = addConfigSpecificationsStageList;
                        //        #endregion

                        //        #region Add List ConfigErrorItem by itemConfigStage.Id (Danh sách hạng mục lỗi)
                        //        var addConfigErrorItemList = new List<ConfigErrorItemModel>();
                        //        var dbConfigErrorItemList = configErrorItemList.Where(w => w.ConfigStageId == itemConfigStage.Id).ToList();
                        //        dbConfigErrorItemList.ForEach(itemConfigErrorItem =>
                        //        {
                        //            var addConfigErrorItem = new ConfigErrorItemModel(itemConfigErrorItem);
                        //            addConfigErrorItemList.Add(addConfigErrorItem);
                        //        });
                        //        addItemConfigStage.ConfigErrorItems = addConfigErrorItemList;
                        //        #endregion

                        //        addConfigStages.Add(addItemConfigStage);
                        //    }
                            
                        //});
                        //addItem.ConfigStages = addConfigStages;
                        #endregion
                        listConfigProduction.Add(addItem);
                    }
                });

                result.ConfigProductions = listConfigProduction.Where(w => w.ProductCode.Contains(parameter.ProductCode) && w.ProductName.Contains(parameter.ProductName)).ToList();
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetConfigProductionByIdResult GetConfigProductionById(GetConfigProductionByIdParameter parameter)
        {
            var result = new GetConfigProductionByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Nhận sản xuất cấu hình theo Id thành công",
                
            };
            try
            {
                var entConfigProduction = context.ConfigProduction.FirstOrDefault(w => w.Id == parameter.ConfigProductionId);
                if (entConfigProduction != null)
                {
                    var model = new ConfigProductionModel(entConfigProduction);
                    var product = context.Product.FirstOrDefault(f => f.ProductId == model.ProductId);
                    if (product != null)
                    {
                        model.ProductCode = product.ProductCode;
                        model.ProductName = product.ProductName;
                    }

                    #region The list ConfigStage (Cấu hình công đoạn)                    
                    var ConfigStagesList = context.ConfigStage.Where(w => w.ConfigProductionId == model.Id).OrderBy(o => o.SortOrder).ToList();

                    #region Get list masterdata by StageNameId or StageGroupId
                    var listStage = ConfigStagesList.Select(s => s.StageNameId).Distinct().ToList();
                    var listStageGroup = ConfigStagesList.Select(s => s.StageGroupId).Distinct().ToList();
                    var categoryList = context.Category.Where(w => listStage.Contains(w.CategoryId) || listStageGroup.Contains(w.CategoryId)).Select(s => new { s.CategoryId, s.CategoryCode, s.CategoryName }).ToList();
                    #endregion

                    #region Get list Organization by DepartmentId
                    var listDepartment = ConfigStagesList.Select(s => s.DepartmentId).Distinct().ToList();

                    var organizationList = context.Organization.Where(w => listDepartment.Contains(w.OrganizationId)).Select(s => new { s.OrganizationId, s.OrganizationCode, s.OrganizationName }).ToList();
                    #endregion

                    #region Get List Employee by OrganizationId
                    //var listOrganization = organizationList.Select(s => s.OrganizationId).ToList();
                    //var employeeList = context.Employee.Where(w => listOrganization.Contains(w.OrganizationId.Value)).Select(s => new { s.EmployeeId, s.EmployeeCode, s.EmployeeName }).ToList();
                    var employeeList = context.Employee.Select(s => new { s.EmployeeId, s.EmployeeCode, s.EmployeeName }).ToList();
                    #endregion

                    #region Get list ConfigStepByStepStage by ConfigStage.Id
                    var listConfigStage = ConfigStagesList.Select(s => s.Id).ToList();
                    var configStepByStepStageList = context.ConfigStepByStepStage.Where(w => listConfigStage.Contains(w.ConfigStageId)).OrderBy(o => o.Id).ToList();
                    #endregion

                    #region Get list ConfigContentStage by ConfigStage.Id
                    var configContentStageList = context.ConfigContentStage.Where(w => listConfigStage.Contains(w.ConfigStageId)).OrderBy(o => o.Id).ToList();
                    #endregion

                    #region Get list ConfigSpecificationsStage by ConfigStage.Id
                    var configSpecificationsStageList = context.ConfigSpecificationsStage.Where(w => listConfigStage.Contains(w.ConfigStageId)).OrderBy(o => o.Id).ToList();
                    #endregion

                    #region Get List ConfigErrorItem by ConfigStage.Id
                    var configErrorItemList = context.ConfigErrorItem.Where(w => listConfigStage.Contains(w.ConfigStageId)).OrderBy(o => o.Id).ToList();
                    #endregion

                    #region Get List ConfigStageProductInput by ConfigStage.Id
                    var configStageProductInputList = context.ConfigStageProductInput.Where(w => listConfigStage.Contains(w.ConfigStageId)).OrderBy(o => o.Id).ToList();
                    var listProductId = configStageProductInputList.Select(s => s.ProductId).ToList();
                    var productList = context.Product.Where(w => listProductId.Contains(w.ProductId)).Select(s => new { s.ProductId, s.ProductCode, s.ProductName }).ToList();
                    #endregion

                    var addConfigStages = new List<ConfigStageModel>();
                    ConfigStagesList.ForEach(itemConfigStage =>
                    {
                        var stageName = categoryList.FirstOrDefault(f => f.CategoryId == itemConfigStage.StageNameId);
                        var stageGroup = categoryList.FirstOrDefault(f => f.CategoryId == itemConfigStage.StageGroupId);
                        var department = organizationList.FirstOrDefault(f => f.OrganizationId == itemConfigStage.DepartmentId);
                        if (stageName != null && stageGroup != null && department != null)
                        {
                            var addItemConfigStage = new ConfigStageModel(itemConfigStage);

                            addItemConfigStage.StageName = stageName.CategoryName;
                            addItemConfigStage.StageGroupName = stageGroup.CategoryName;

                            var personInCharge = employeeList.Where(w => itemConfigStage.PersonInChargeId.Contains(w.EmployeeId)).ToList();
                            if (personInCharge != null)
                            {
                                addItemConfigStage.PersonInChargeName = personInCharge.Select(s => s.EmployeeName).ToArray();
                            }
                            var personVerifier = employeeList.FirstOrDefault(f => f.EmployeeId == itemConfigStage.PersonVerifierId);
                            if (personVerifier != null)
                            {
                                addItemConfigStage.PersonVerifierName = personVerifier.EmployeeName;
                            }
                            addItemConfigStage.DepartmentName = department.OrganizationName;

                            #region Add list ConfigStepByStepStage by itemConfigStage.Id (Danh sách các bước thực hiện)
                            var addConfigStepByStepStageList = new List<ConfigStepByStepStageModel>();
                            var dbConfigStepByStepStageList = configStepByStepStageList.Where(w => w.ConfigStageId == itemConfigStage.Id).OrderBy(o => o.Id).ToList();
                            dbConfigStepByStepStageList.ForEach(itemConfigStepByStepStage =>
                            {
                                var addConfigStepByStepStage = new ConfigStepByStepStageModel(itemConfigStepByStepStage);
                                addConfigStepByStepStage.MappingId = addConfigStepByStepStage.Id;
                                addConfigStepByStepStageList.Add(addConfigStepByStepStage);
                            });
                            addItemConfigStage.ConfigStepByStepStages = addConfigStepByStepStageList;
                            #endregion

                            #region Add list ConfigContentStage by itemConfigStage.Id (Danh sách nội dung kiểm tra)
                            var addConfigContentStageList = new List<ConfigContentStageModel>();
                            var dbConfigContentStageList = configContentStageList.Where(w => w.ConfigStageId == itemConfigStage.Id).OrderBy(o => o.Id).ToList();
                            dbConfigContentStageList.ForEach(itemConfigContentStage =>
                            {
                                var addConfigContentStage = new ConfigContentStageModel(itemConfigContentStage);
                                addConfigContentStage.MappingId = addConfigContentStage.Id;
                                //addConfigContentStage.ConfigStepByStepStageIdMapping = addConfigContentStage.ConfigStepByStepStageId;
                                addConfigContentStageList.Add(addConfigContentStage);
                            });
                            addItemConfigStage.ConfigContentStages = addConfigContentStageList;
                            #endregion

                            #region Add list ConfigSpecificationsStage by itemConfigStage.Id (Danh sách quy cách)
                            var addConfigSpecificationsStageList = new List<ConfigSpecificationsStageModel>();
                            var dbConfigSpecificationsStageList = configSpecificationsStageList.Where(w => w.ConfigStageId == itemConfigStage.Id).OrderBy(o => o.Id).ToList();

                            #region Get list ConfigSpecificationsStageValue by ConfigSpecificationsStage.Id (List Giá trị quy cách)
                            var listConfigSpecificationsStage = dbConfigSpecificationsStageList.Select(s => s.Id).ToList();
                            var configSpecificationsStageValueList = context.ConfigSpecificationsStageValue.Where(w => listConfigSpecificationsStage.Contains(w.ConfigSpecificationsStageId)).ToList();
                            #endregion

                            dbConfigSpecificationsStageList.ForEach(itemConfigSpecificationsStage =>
                            {
                                var addConfigSpecificationsStage = new ConfigSpecificationsStageModel(itemConfigSpecificationsStage);
                                var addConfigSpecificationsStageValues = new List<ConfigSpecificationsStageValueModel>();
                                var dbconfigSpecificationsStageValueList = configSpecificationsStageValueList.Where(w => w.ConfigSpecificationsStageId == itemConfigSpecificationsStage.Id).ToList();
                                dbconfigSpecificationsStageValueList.ForEach(itemConfigSpecificationsStageValue =>
                                {
                                    addConfigSpecificationsStageValues.Add(new ConfigSpecificationsStageValueModel(itemConfigSpecificationsStageValue));
                                });
                                addConfigSpecificationsStage.ConfigSpecificationsStageValues = addConfigSpecificationsStageValues;
                                addConfigSpecificationsStage.ConfigContentStageIdMapping = addConfigSpecificationsStage.ConfigContentStageId;
                                addConfigSpecificationsStage.ConfigStepByStepStageIdMapping = addConfigSpecificationsStage.ConfigStepByStepStageId;
                                addConfigSpecificationsStageList.Add(addConfigSpecificationsStage);
                            });
                            addItemConfigStage.ConfigSpecificationsStages = addConfigSpecificationsStageList;
                            #endregion

                            #region Add List ConfigErrorItem by itemConfigStage.Id (Danh sách hạng mục lỗi)
                            var addConfigErrorItemList = new List<ConfigErrorItemModel>();
                            var dbConfigErrorItemList = configErrorItemList.Where(w => w.ConfigStageId == itemConfigStage.Id).OrderBy(o => o.Id).ToList();
                            dbConfigErrorItemList.ForEach(itemConfigErrorItem =>
                            {
                                var addConfigErrorItem = new ConfigErrorItemModel(itemConfigErrorItem);
                                addConfigErrorItemList.Add(addConfigErrorItem);
                            });
                            addItemConfigStage.ConfigErrorItems = addConfigErrorItemList;
                            #endregion

                            #region Add List ConfigStageProductInput by itemConfigStage.Id (Danh sách vật liệu đầu vào)
                            var addConfigStageProductInputList = new List<ConfigStageProductInputModel>();
                            var dbConfigStageProductInputList = configStageProductInputList.Where(w => w.ConfigStageId == itemConfigStage.Id).OrderBy(o => o.Id).ToList();
                            dbConfigStageProductInputList.ForEach(itemConfigStageProductInput =>
                            {
                                var addConfigStageProductInput = new ConfigStageProductInputModel(itemConfigStageProductInput);
                                var entProduct = productList.FirstOrDefault(f => f.ProductId == addConfigStageProductInput.ProductId);
                                if (entProduct != null)
                                {
                                    addConfigStageProductInput.ProductCode = entProduct.ProductCode;
                                    addConfigStageProductInput.ProductName = entProduct.ProductName;
                                }
                                addConfigStageProductInputList.Add(addConfigStageProductInput);
                            });
                            addItemConfigStage.ConfigStageProductInputs = addConfigStageProductInputList;
                            #endregion


                            addConfigStages.Add(addItemConfigStage);
                        }

                    });
                    model.ConfigStages = addConfigStages;
                    #endregion

                    var entStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_NOT_PRODUCED);
                    if (entStatus != null)
                    {
                        var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.ConfigProductionId == entConfigProduction.Id && f.StatusId != entStatus.CategoryId);
                        if (entProductionProcessDetail != null)
                        {
                            model.IsUsed = true;
                        }
                        else
                        {
                            model.IsUsed = false;
                        }
                    }
                    result.ConfigProductionModel= model;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public SaveConfigProductionResult SaveConfigProduction(SaveConfigProductionParameter parameter)
        {
            var result = new SaveConfigProductionResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lưu cấu hình sản xuất thành công",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var model = parameter.Model;
                    if (model != null)
                    {
                        var entCheck = context.ProductionProcessDetail.FirstOrDefault(f => f.ConfigProductionId == model.Id);
                        if (entCheck == null)
                        {

                            #region Create or Update info to ConfigProduction table
                            var entConfigProduction = context.ConfigProduction.FirstOrDefault(x => x.Id == model.Id);
                            if (entConfigProduction == null)
                            {
                                #region Tạo Mã quy trình sản phẩm 
                                var product = context.Product.FirstOrDefault(x => x.ProductId == model.ProductId);
                                var productCount = context.ConfigProduction.Where(w => w.ProductId == model.ProductId).Count();
                                if (product != null)
                                {
                                    productCount = productCount + 1;
                                    model.Code = product.ProductCode + "-QT" + productCount.ToString();
                                }
                                #endregion

                                entConfigProduction = new Entities.ConfigProduction();
                                entConfigProduction.ProductId = model.ProductId;
                                entConfigProduction.Code = model.Code;
                                entConfigProduction.Description = model.Description != null ? model.Description : string.Empty;
                                entConfigProduction.ProductionNumber = model.ProductionNumber;
                                entConfigProduction.Ltv = model.Ltv;
                                entConfigProduction.Pc = model.Pc;
                                entConfigProduction.Availability = model.Availability;
                                entConfigProduction.InspectionStageId = model.InspectionStageId;
                                entConfigProduction.CreatedBy = parameter.UserId;
                                entConfigProduction.CreatedDate = DateTime.Now;
                                context.ConfigProduction.Add(entConfigProduction);
                                context.SaveChanges();
                                model.Id = entConfigProduction.Id;
                            }
                            else
                            {
                                entConfigProduction.ProductId = model.ProductId;
                                entConfigProduction.Code = model.Code;
                                entConfigProduction.Description = model.Description != null ? model.Description : string.Empty;
                                entConfigProduction.ProductionNumber = model.ProductionNumber;
                                entConfigProduction.Ltv = model.Ltv;
                                entConfigProduction.Pc = model.Pc;
                                entConfigProduction.Availability = model.Availability;
                                entConfigProduction.InspectionStageId = model.InspectionStageId;
                                entConfigProduction.UpdatedBy = parameter.UserId;
                                entConfigProduction.UpdatedDate = DateTime.Now;
                                context.ConfigProduction.Update(entConfigProduction);
                                context.SaveChanges();
                            }
                            #endregion

                            if (model.Id > 0)
                            {
                                if (model.ConfigStages != null)
                                {
                                    model.ConfigStages.ForEach(itemConfigStage =>
                                    {
                                        #region Create or Update info to ConfigStage table
                                        itemConfigStage.ConfigProductionId = model.Id;
                                        var entConfigStage = context.ConfigStage.FirstOrDefault(x => x.Id == itemConfigStage.Id);
                                        if (entConfigStage == null)
                                        {
                                            entConfigStage = new Entities.ConfigStage();
                                            entConfigStage.ConfigProductionId = itemConfigStage.ConfigProductionId;
                                            entConfigStage.StageNameId = itemConfigStage.StageNameId;
                                            entConfigStage.StageGroupId = itemConfigStage.StageGroupId;
                                            entConfigStage.DepartmentId = itemConfigStage.DepartmentId;
                                            entConfigStage.NumberPeople = itemConfigStage.NumberPeople;
                                            entConfigStage.PersonInChargeId = itemConfigStage.PersonInChargeId;
                                            entConfigStage.PersonVerifierId = itemConfigStage.PersonVerifierId;
                                            entConfigStage.Binding = itemConfigStage.Binding;
                                            entConfigStage.PreviousStageNameId = itemConfigStage.PreviousStageNameId;
                                            entConfigStage.FromTime = itemConfigStage.FromTime;
                                            entConfigStage.ToTime = itemConfigStage.ToTime;
                                            entConfigStage.SortOrder = itemConfigStage.SortOrder;
                                            entConfigStage.IsStageWithoutNg = itemConfigStage.IsStageWithoutNg;
                                            entConfigStage.CreatedBy = parameter.UserId;
                                            entConfigStage.CreatedDate = DateTime.Now;
                                            if (itemConfigStage.ConfigStageProductInputs != null)
                                            {
                                                if (itemConfigStage.ConfigStageProductInputs.Count > 0)
                                                {
                                                    entConfigStage.IsStageWithoutProduct = false;
                                                }
                                            }
                                            context.ConfigStage.Add(entConfigStage);
                                            context.SaveChanges();
                                        }
                                        else
                                        {
                                            entConfigStage.ConfigProductionId = itemConfigStage.ConfigProductionId;
                                            entConfigStage.StageNameId = itemConfigStage.StageNameId;
                                            entConfigStage.StageGroupId = itemConfigStage.StageGroupId;
                                            entConfigStage.DepartmentId = itemConfigStage.DepartmentId;
                                            entConfigStage.NumberPeople = itemConfigStage.NumberPeople;
                                            entConfigStage.PersonInChargeId = itemConfigStage.PersonInChargeId;
                                            entConfigStage.PersonVerifierId = itemConfigStage.PersonVerifierId;
                                            entConfigStage.Binding = itemConfigStage.Binding;
                                            entConfigStage.PreviousStageNameId = itemConfigStage.PreviousStageNameId;
                                            entConfigStage.FromTime = itemConfigStage.FromTime;
                                            entConfigStage.ToTime = itemConfigStage.ToTime;
                                            entConfigStage.SortOrder = itemConfigStage.SortOrder;
                                            entConfigStage.IsStageWithoutNg = itemConfigStage.IsStageWithoutNg;
                                            entConfigStage.UpdatedBy = parameter.UserId;
                                            entConfigStage.UpdatedDate = DateTime.Now;
                                            if (itemConfigStage.ConfigStageProductInputs != null)
                                            {
                                                if (itemConfigStage.ConfigStageProductInputs.Count > 0)
                                                {
                                                    entConfigStage.IsStageWithoutProduct = true;
                                                }
                                            }
                                            context.ConfigStage.Update(entConfigStage);
                                            context.SaveChanges();
                                        }

                                        itemConfigStage.Id = entConfigStage.Id;

                                        if (itemConfigStage.Id > 0)
                                        {
                                            #region Create or Update info to ConfigStepByStepStage table
                                            if (itemConfigStage.ConfigStepByStepStages != null)
                                            {
                                                itemConfigStage.ConfigStepByStepStages.ForEach(itemConfigStepByStepStage =>
                                                {
                                                    itemConfigStepByStepStage.ConfigStageId = itemConfigStage.Id;
                                                    var entConfigStepByStepStage = context.ConfigStepByStepStage.FirstOrDefault(x => x.Id == itemConfigStepByStepStage.Id);
                                                    if (entConfigStepByStepStage == null)
                                                    {
                                                        entConfigStepByStepStage = new Entities.ConfigStepByStepStage();
                                                        entConfigStepByStepStage.ConfigStageId = itemConfigStepByStepStage.ConfigStageId;
                                                        entConfigStepByStepStage.Name = itemConfigStepByStepStage.Name;
                                                        entConfigStepByStepStage.IsShowTextBox = itemConfigStepByStepStage.IsShowTextBox;
                                                        entConfigStepByStepStage.CreatedBy = parameter.UserId;
                                                        entConfigStepByStepStage.CreatedDate = DateTime.Now;
                                                        context.ConfigStepByStepStage.Add(entConfigStepByStepStage);
                                                        context.SaveChanges();
                                                    }
                                                    else
                                                    {

                                                        entConfigStepByStepStage.ConfigStageId = itemConfigStepByStepStage.ConfigStageId;
                                                        entConfigStepByStepStage.Name = itemConfigStepByStepStage.Name;
                                                        entConfigStepByStepStage.IsShowTextBox = itemConfigStepByStepStage.IsShowTextBox;
                                                        entConfigStepByStepStage.UpdatedBy = parameter.UserId;
                                                        entConfigStepByStepStage.CreatedDate = DateTime.Now;
                                                        context.ConfigStepByStepStage.Update(entConfigStepByStepStage);
                                                        context.SaveChanges();
                                                    }

                                                    itemConfigStepByStepStage.Id = entConfigStepByStepStage.Id;
                                                });

                                                #region Remove ConfigStepByStepStage
                                                var entitiesConfigStepByStepStage = context.ConfigStepByStepStage.Where(w => w.ConfigStageId == itemConfigStage.Id && !itemConfigStage.ConfigStepByStepStages.Select(s => s.Id).Contains(w.Id)).ToList();
                                                if (entitiesConfigStepByStepStage != null)
                                                {
                                                    context.ConfigStepByStepStage.RemoveRange(entitiesConfigStepByStepStage);
                                                    context.SaveChanges();
                                                }
                                                #endregion
                                            }
                                            #endregion

                                            #region Create or Update info to ConfigContentStage table
                                            if (itemConfigStage.ConfigContentStages != null)
                                            {
                                                itemConfigStage.ConfigContentStages.ForEach(itemConfigContentStage =>
                                                {
                                                    itemConfigContentStage.ConfigStageId = itemConfigStage.Id;
                                                    var entConfigContentStage = context.ConfigContentStage.FirstOrDefault(x => x.Id == itemConfigContentStage.Id);
                                                    if (entConfigContentStage == null)
                                                    {
                                                        entConfigContentStage = new Entities.ConfigContentStage();
                                                        entConfigContentStage.ConfigStageId = itemConfigContentStage.ConfigStageId;
                                                        entConfigContentStage.ContentId = itemConfigContentStage.ContentId;
                                                        entConfigContentStage.IsContentValues = itemConfigContentStage.IsContentValues;
                                                        entConfigContentStage.CreatedBy = parameter.UserId;
                                                        entConfigContentStage.CreatedDate = DateTime.Now;
                                                        context.ConfigContentStage.Add(entConfigContentStage);
                                                        context.SaveChanges();
                                                    }
                                                    else
                                                    {
                                                        entConfigContentStage.ConfigStageId = itemConfigContentStage.ConfigStageId;
                                                        entConfigContentStage.ContentId = itemConfigContentStage.ContentId;
                                                        entConfigContentStage.IsContentValues = itemConfigContentStage.IsContentValues;
                                                        entConfigContentStage.UpdatedBy = parameter.UserId;
                                                        entConfigContentStage.UpdatedDate = DateTime.Now;
                                                        context.ConfigContentStage.Update(entConfigContentStage);
                                                        context.SaveChanges();
                                                    }


                                                    itemConfigContentStage.Id = entConfigContentStage.Id;
                                                });

                                                #region Remove ConfigContentStage
                                                var entitiesConfigContentStage = context.ConfigContentStage.Where(w => w.ConfigStageId == itemConfigStage.Id && !itemConfigStage.ConfigContentStages.Select(s => s.Id).Contains(w.Id)).ToList();
                                                if (entitiesConfigContentStage != null)
                                                {
                                                    context.ConfigContentStage.RemoveRange(entitiesConfigContentStage);
                                                    context.SaveChanges();
                                                }
                                                #endregion
                                            }
                                            #endregion

                                            #region Create or Update info to ConfigSpecificationsStage table
                                            if (itemConfigStage.ConfigSpecificationsStages != null)
                                            {
                                                itemConfigStage.ConfigSpecificationsStages.ForEach(itemConfigSpecificationsStage =>
                                                {
                                                    itemConfigSpecificationsStage.ConfigStageId = itemConfigStage.Id;
                                                    var entConfigSpecificationsStage = context.ConfigSpecificationsStage.FirstOrDefault(x => x.Id == itemConfigSpecificationsStage.Id);
                                                    if (entConfigSpecificationsStage == null)
                                                    {
                                                        entConfigSpecificationsStage = new ConfigSpecificationsStage();
                                                        entConfigSpecificationsStage.ConfigStageId = itemConfigSpecificationsStage.ConfigStageId;
                                                        //ConfigStepByStepStageID
                                                        if (!itemConfigSpecificationsStage.ConfigStepByStepStageId.HasValue && itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping.HasValue)
                                                        {
                                                            var stepByStep = itemConfigStage.ConfigStepByStepStages.FirstOrDefault(f => f.MappingId == itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping.Value);
                                                            if (stepByStep != null)
                                                                entConfigSpecificationsStage.ConfigStepByStepStageId = stepByStep.Id;
                                                        }
                                                        else
                                                        {
                                                            entConfigSpecificationsStage.ConfigStepByStepStageId = itemConfigSpecificationsStage.ConfigStepByStepStageId;
                                                        }
                                                        //ConfigContentStageID
                                                        if (!itemConfigSpecificationsStage.ConfigContentStageId.HasValue && itemConfigSpecificationsStage.ConfigContentStageIdMapping.HasValue)
                                                        {
                                                            var stepByStep = itemConfigStage.ConfigContentStages.FirstOrDefault(f => f.MappingId == itemConfigSpecificationsStage.ConfigContentStageIdMapping.Value);
                                                            if (stepByStep != null)
                                                                entConfigSpecificationsStage.ConfigContentStageId = stepByStep.Id;
                                                        }
                                                        else
                                                        {
                                                            entConfigSpecificationsStage.ConfigContentStageId = itemConfigSpecificationsStage.ConfigContentStageId;
                                                        }
                                                        entConfigSpecificationsStage.SpecificationsId = itemConfigSpecificationsStage.SpecificationsId;
                                                        entConfigSpecificationsStage.NumberOfSamples = itemConfigSpecificationsStage.NumberOfSamples;
                                                        entConfigSpecificationsStage.IsHaveValues = itemConfigSpecificationsStage.IsHaveValues;
                                                        entConfigSpecificationsStage.CreatedBy = parameter.UserId;
                                                        entConfigSpecificationsStage.CreatedDate = DateTime.Now;
                                                        context.ConfigSpecificationsStage.Add(entConfigSpecificationsStage);
                                                        context.SaveChanges();
                                                    }
                                                    else
                                                    {
                                                        entConfigSpecificationsStage.ConfigStageId = itemConfigSpecificationsStage.ConfigStageId;
                                                        //ConfigStepByStepStageID
                                                        if (!itemConfigSpecificationsStage.ConfigStepByStepStageId.HasValue && itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping.HasValue)
                                                        {
                                                            var stepByStep = itemConfigStage.ConfigStepByStepStages.FirstOrDefault(f => f.MappingId == itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping.Value);
                                                            if (stepByStep != null)
                                                            {
                                                                entConfigSpecificationsStage.ConfigStepByStepStageId = stepByStep.Id;
                                                                itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping = stepByStep.Id;
                                                            }
                                                            else
                                                            {
                                                                entConfigSpecificationsStage.ConfigStepByStepStageId = null;
                                                                itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping = null;
                                                            }
                                                        }
                                                        else
                                                        {
                                                            entConfigSpecificationsStage.ConfigStepByStepStageId = itemConfigSpecificationsStage.ConfigStepByStepStageId;
                                                            itemConfigSpecificationsStage.ConfigStepByStepStageIdMapping = itemConfigSpecificationsStage.ConfigStepByStepStageId;
                                                        }
                                                        //ConfigContentStageID
                                                        if (!itemConfigSpecificationsStage.ConfigContentStageId.HasValue && itemConfigSpecificationsStage.ConfigContentStageIdMapping.HasValue)
                                                        {
                                                            var tmpConfigSpecificationsStage = itemConfigStage.ConfigContentStages.FirstOrDefault(f => f.MappingId == itemConfigSpecificationsStage.ConfigContentStageIdMapping.Value);
                                                            if (tmpConfigSpecificationsStage != null)
                                                            {
                                                                entConfigSpecificationsStage.ConfigContentStageId = tmpConfigSpecificationsStage.Id;
                                                                itemConfigSpecificationsStage.ConfigContentStageIdMapping = tmpConfigSpecificationsStage.Id;
                                                            }
                                                            else
                                                            {
                                                                entConfigSpecificationsStage.ConfigContentStageId = null;
                                                            }
                                                        }
                                                        else
                                                        {
                                                            entConfigSpecificationsStage.ConfigContentStageId = itemConfigSpecificationsStage.ConfigContentStageId;
                                                        }
                                                        entConfigSpecificationsStage.SpecificationsId = itemConfigSpecificationsStage.SpecificationsId;
                                                        entConfigSpecificationsStage.NumberOfSamples = itemConfigSpecificationsStage.NumberOfSamples;
                                                        entConfigSpecificationsStage.IsHaveValues = itemConfigSpecificationsStage.IsHaveValues;
                                                        entConfigSpecificationsStage.UpdatedBy = parameter.UserId;
                                                        entConfigSpecificationsStage.UpdatedDate = DateTime.Now;
                                                        context.ConfigSpecificationsStage.Update(entConfigSpecificationsStage);
                                                        context.SaveChanges();
                                                    }
                                                    itemConfigSpecificationsStage.Id = entConfigSpecificationsStage.Id;
                                                    #region Create or Update info to ConfigSpecificationsStageValue table
                                                    if (itemConfigSpecificationsStage.ConfigSpecificationsStageValues != null)
                                                    {
                                                        itemConfigSpecificationsStage.ConfigSpecificationsStageValues.ForEach(itemConfigSpecificationsStageValue =>
                                                        {
                                                            itemConfigSpecificationsStageValue.ConfigSpecificationsStageId = itemConfigSpecificationsStage.Id;
                                                            var entConfigSpecificationsStageValue = context.ConfigSpecificationsStageValue.FirstOrDefault(x => x.Id == itemConfigSpecificationsStageValue.Id);
                                                            if (entConfigSpecificationsStageValue == null)
                                                            {
                                                                entConfigSpecificationsStageValue = new ConfigSpecificationsStageValue();
                                                                entConfigSpecificationsStageValue.ConfigSpecificationsStageId = itemConfigSpecificationsStageValue.ConfigSpecificationsStageId;
                                                                entConfigSpecificationsStageValue.FieldTypeId = itemConfigSpecificationsStageValue.FieldTypeId;
                                                                entConfigSpecificationsStageValue.FirstName = itemConfigSpecificationsStageValue.FirstName;
                                                                entConfigSpecificationsStageValue.LastName = itemConfigSpecificationsStageValue.LastName;
                                                                entConfigSpecificationsStageValue.LineOrder = itemConfigSpecificationsStageValue.LineOrder;
                                                                entConfigSpecificationsStageValue.SortLineOrder = itemConfigSpecificationsStageValue.SortLineOrder;
                                                                entConfigSpecificationsStageValue.ProductId = itemConfigSpecificationsStageValue.ProductId;
                                                                entConfigSpecificationsStageValue.InfoFormula = itemConfigSpecificationsStageValue.InfoFormula;
                                                                entConfigSpecificationsStageValue.Formula = itemConfigSpecificationsStageValue.Formula;
                                                                entConfigSpecificationsStageValue.FormulaValue = itemConfigSpecificationsStageValue.FormulaValue;
                                                                entConfigSpecificationsStageValue.CreatedBy = parameter.UserId;
                                                                entConfigSpecificationsStageValue.CreatedDate = DateTime.Now;

                                                                context.ConfigSpecificationsStageValue.Add(entConfigSpecificationsStageValue);
                                                                context.SaveChanges();
                                                            }
                                                            else
                                                            {
                                                                entConfigSpecificationsStageValue.ConfigSpecificationsStageId = itemConfigSpecificationsStageValue.ConfigSpecificationsStageId;
                                                                entConfigSpecificationsStageValue.FieldTypeId = itemConfigSpecificationsStageValue.FieldTypeId;
                                                                entConfigSpecificationsStageValue.FirstName = itemConfigSpecificationsStageValue.FirstName;
                                                                entConfigSpecificationsStageValue.LastName = itemConfigSpecificationsStageValue.LastName;
                                                                entConfigSpecificationsStageValue.LineOrder = itemConfigSpecificationsStageValue.LineOrder;
                                                                entConfigSpecificationsStageValue.SortLineOrder = itemConfigSpecificationsStageValue.SortLineOrder;
                                                                entConfigSpecificationsStageValue.ProductId = itemConfigSpecificationsStageValue.ProductId;
                                                                entConfigSpecificationsStageValue.InfoFormula = itemConfigSpecificationsStageValue.InfoFormula;
                                                                entConfigSpecificationsStageValue.Formula = itemConfigSpecificationsStageValue.Formula;
                                                                entConfigSpecificationsStageValue.FormulaValue = itemConfigSpecificationsStageValue.FormulaValue;
                                                                entConfigSpecificationsStageValue.UpdatedBy = parameter.UserId;
                                                                entConfigSpecificationsStageValue.UpdatedDate = DateTime.Now;
                                                                context.ConfigSpecificationsStageValue.Update(entConfigSpecificationsStageValue);
                                                                context.SaveChanges();
                                                            }

                                                            itemConfigSpecificationsStageValue.Id = entConfigSpecificationsStageValue.Id;
                                                        });
                                                        #region Remove ConfigSpecificationsStageValue
                                                        var entitiesConfigSpecificationsStageValue = context.ConfigSpecificationsStageValue.Where(w => w.ConfigSpecificationsStageId == itemConfigSpecificationsStage.Id && !itemConfigSpecificationsStage.ConfigSpecificationsStageValues.Select(s => s.Id).Contains(w.Id)).ToList();
                                                        if (entitiesConfigSpecificationsStageValue != null)
                                                        {
                                                            context.ConfigSpecificationsStageValue.RemoveRange(entitiesConfigSpecificationsStageValue);
                                                            context.SaveChanges();
                                                        }
                                                        #endregion
                                                    }
                                                    #endregion
                                                });
                                                #region Remove ConfigSpecificationsStage
                                                var entitiesConfigSpecificationsStage = context.ConfigSpecificationsStage.Where(w => w.ConfigStageId == itemConfigStage.Id && !itemConfigStage.ConfigSpecificationsStages.Select(s => s.Id).Contains(w.Id)).ToList();
                                                if (entitiesConfigSpecificationsStage != null)
                                                {
                                                    context.ConfigSpecificationsStage.RemoveRange(entitiesConfigSpecificationsStage);
                                                    context.SaveChanges();
                                                }
                                                #endregion
                                            }
                                            #endregion

                                            #region Create or Update info to ConfigErrorItem table
                                            if (itemConfigStage.ConfigErrorItems != null)
                                            {
                                                itemConfigStage.ConfigErrorItems.ForEach(itemConfigErrorItem =>
                                                {
                                                    itemConfigErrorItem.ConfigStageId = itemConfigStage.Id;
                                                    var entConfigErrorItem = context.ConfigErrorItem.FirstOrDefault(x => x.Id == itemConfigErrorItem.Id);
                                                    if (entConfigErrorItem == null)
                                                    {
                                                        entConfigErrorItem = new Entities.ConfigErrorItem();
                                                        entConfigErrorItem.ConfigStageId = itemConfigErrorItem.ConfigStageId;
                                                        entConfigErrorItem.ErrorItemId = itemConfigErrorItem.ErrorItemId;
                                                        entConfigErrorItem.CreatedBy = parameter.UserId;
                                                        entConfigErrorItem.CreatedDate = DateTime.Now;
                                                        context.ConfigErrorItem.Add(entConfigErrorItem);
                                                        context.SaveChanges();
                                                    }
                                                    else
                                                    {

                                                        entConfigErrorItem.ConfigStageId = itemConfigErrorItem.ConfigStageId;
                                                        entConfigErrorItem.ErrorItemId = itemConfigErrorItem.ErrorItemId;
                                                        entConfigErrorItem.UpdatedBy = parameter.UserId;
                                                        entConfigErrorItem.UpdatedDate = DateTime.Now;
                                                        context.ConfigErrorItem.Update(entConfigErrorItem);
                                                        context.SaveChanges();
                                                    }

                                                    itemConfigErrorItem.Id = entConfigErrorItem.Id;
                                                });

                                                #region Remove ConfigErrorItem
                                                var entitiesConfigErrorItem = context.ConfigErrorItem.Where(w => w.ConfigStageId == itemConfigStage.Id && !itemConfigStage.ConfigErrorItems.Select(s => s.Id).Contains(w.Id)).ToList();
                                                if (entitiesConfigErrorItem != null)
                                                {
                                                    context.ConfigErrorItem.RemoveRange(entitiesConfigErrorItem);
                                                    context.SaveChanges();
                                                }
                                                #endregion
                                            }
                                            #endregion

                                            #region Create or Update info to ConfigStageProductInput table
                                            if (itemConfigStage.ConfigStageProductInputs != null)
                                            {
                                                itemConfigStage.ConfigStageProductInputs.ForEach(itemConfigStageProductInput =>
                                                {
                                                    itemConfigStageProductInput.ConfigStageId = itemConfigStage.Id;
                                                    var entConfigStageProductInput = context.ConfigStageProductInput.FirstOrDefault(x => x.Id == itemConfigStageProductInput.Id);
                                                    if (entConfigStageProductInput == null)
                                                    {
                                                        entConfigStageProductInput = new Entities.ConfigStageProductInput();
                                                        entConfigStageProductInput.ConfigStageId = itemConfigStageProductInput.ConfigStageId;
                                                        entConfigStageProductInput.ProductId = itemConfigStageProductInput.ProductId;
                                                        entConfigStageProductInput.CreatedBy = parameter.UserId;
                                                        entConfigStageProductInput.CreatedDate = DateTime.Now;
                                                        context.ConfigStageProductInput.Add(entConfigStageProductInput);
                                                        context.SaveChanges();
                                                    }
                                                    else
                                                    {

                                                        entConfigStageProductInput.ConfigStageId = itemConfigStageProductInput.ConfigStageId;
                                                        entConfigStageProductInput.ProductId = itemConfigStageProductInput.ProductId;
                                                        entConfigStageProductInput.UpdatedBy = parameter.UserId;
                                                        entConfigStageProductInput.UpdatedDate = DateTime.Now;
                                                        context.ConfigStageProductInput.Update(entConfigStageProductInput);
                                                        context.SaveChanges();
                                                    }

                                                    itemConfigStageProductInput.Id = entConfigStageProductInput.Id;
                                                });

                                                #region Remove ConfigStageProductInput
                                                var entitiesConfigStageProductInput = context.ConfigStageProductInput.Where(w => w.ConfigStageId == itemConfigStage.Id && !itemConfigStage.ConfigStageProductInputs.Select(s => s.Id).Contains(w.Id)).ToList();
                                                if (entitiesConfigStageProductInput != null)
                                                {
                                                    context.ConfigStageProductInput.RemoveRange(entitiesConfigStageProductInput);
                                                    context.SaveChanges();
                                                }
                                                #endregion
                                            }
                                            #endregion
                                        }
                                        #endregion
                                    });

                                    #region Remove ConfigStage
                                    var entitiesConfigStage = context.ConfigStage.Where(w => w.ConfigProductionId == model.Id && !model.ConfigStages.Select(s => s.Id).Contains(w.Id)).ToList();
                                    if (entitiesConfigStage != null)
                                    {
                                        context.ConfigStage.RemoveRange(entitiesConfigStage);
                                        context.SaveChanges();
                                    }
                                    #endregion
                                }
                            }
                            result.Model = model;
                        }
                        else
                        {
                            result.Message = "Bạn không thể thay đổi quy trình " + model.Code + " khi quy trình đã được kết hợp với lệnh sản xuất!";
                            result.StatusCode = HttpStatusCode.ExpectationFailed;
                        }

                    }
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    result.Message = ex.Message;
                    result.StatusCode = HttpStatusCode.ExpectationFailed;
                }
            }
            return result;
        }

        public SaveConfigStageForPersonResult SaveConfigStageForPerson(SaveConfigStageForPersonParameter parameter)
        {
            var result = new SaveConfigStageForPersonResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Cập nhật lại danh sách người thực hiện và người xác nhận thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var ent = context.ConfigStage.FirstOrDefault(f => f.Id == parameter.ConfigStageId);
                    if (ent != null)
                    {
                        ent.PersonInChargeId = parameter.PersonInChargeId;
                        ent.PersonVerifierId = parameter.PersonVerifierId;
                        context.ConfigStage.Update(ent);
                        context.SaveChanges();
                        #region Cập nhật lại PersonInChargeId và PersonVerifierId cho các công đoạn sản xuất
                        var entities = context.ProductionProcessStage.Where(w => w.ConfigStageId == ent.Id).ToList();
                        if (entities != null)
                        {
                            entities.ForEach(item =>
                            {
                                item.PersonInChargeId = ent.PersonInChargeId;
                                item.PersonVerifierId = ent.PersonVerifierId;
                                item.UpdatedBy = parameter.UserId;
                                item.UpdatedDate = DateTime.Now;
                            });
                            context.ProductionProcessStage.UpdateRange(entities);
                            context.SaveChanges();
                        }
                        #endregion
                    }
                    transaction.Commit();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    result.Message = ex.Message;
                    result.StatusCode = HttpStatusCode.ExpectationFailed;
                }
            }
            return result;
        }
    }
}
