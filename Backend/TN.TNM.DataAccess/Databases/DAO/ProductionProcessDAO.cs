using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using TN.TNM.Common;
using TN.TNM.DataAccess.ConstType;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Enum;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.ProductionProcess;
using TN.TNM.DataAccess.Messages.Results.ProductionProcess;
using TN.TNM.DataAccess.Models.ConfigProduction;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.ProductionProcess;
using TN.TNM.DataAccess.Models.WareHouse;
//using static System.Windows.Forms.VisualStyles.VisualStyleElement;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class ProductionProcessDAO : BaseDAO, IProductionProcessDataAccess
    {
        public ProductionProcessDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
        }

        public CreateProductionProcessDetailResult CreateProductionProcessDetail(CreateProductionProcessDetailParameter parameter)
        {
            var result = new CreateProductionProcessDetailResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Tạo Lo con thành công",
            };
            using (var transaction = context.Database.BeginTransaction()) 
            {
                try
                {
                    var processDetailModel = parameter.ProcessDetailModel;
                    var entProductionProcessDetail = new Entities.ProductionProcessDetail();
                    entProductionProcessDetail.ProductionProcessId = processDetailModel.ProductionProcessId;
                    entProductionProcessDetail.ConfigProductionId = processDetailModel.ConfigProductionId;
                    entProductionProcessDetail.CustomerName = processDetailModel.CustomerName;
                    entProductionProcessDetail.ProductId = processDetailModel.ProductId;

                    #region Tạo lot.no con
                    var countLoChild = context.ProductionProcessDetail.Where(w => w.PrentId == processDetailModel.PrentId).Count();
                    countLoChild++;
                    var entLotNo = new Entities.LotNo();
                    entLotNo.LotNoName = processDetailModel.LotNoName + countLoChild;
                    entLotNo.LotNoType = 2;
                    context.LotNo.Add(entLotNo);
                    context.SaveChanges();
                    processDetailModel.LotNoId = entLotNo.LotNoId;
                    processDetailModel.LotNoName = entLotNo.LotNoName;
                    #endregion

                    entProductionProcessDetail.LotNoId = processDetailModel.LotNoId;
                    entProductionProcessDetail.ProductionNumber = processDetailModel.ProductionNumber;
                    entProductionProcessDetail.TotalReached = processDetailModel.QuantityReached;
                    entProductionProcessDetail.StartDate = processDetailModel.StartDate;
                    entProductionProcessDetail.EndDate = processDetailModel.EndDate;
                    entProductionProcessDetail.StatusId = processDetailModel.StatusId;
                    entProductionProcessDetail.Ltv = processDetailModel.Ltv;
                    entProductionProcessDetail.Pc = processDetailModel.Pc;
                    entProductionProcessDetail.Description = processDetailModel.Description;
                    entProductionProcessDetail.IsHaveSubLo = false;
                    entProductionProcessDetail.PrentId = processDetailModel.PrentId;
                    entProductionProcessDetail.CreatedBy = parameter.UserId;
                    entProductionProcessDetail.CreatedDate = DateTime.Now;

                    context.ProductionProcessDetail.Add(entProductionProcessDetail);
                    context.SaveChanges();
                    processDetailModel.Id = entProductionProcessDetail.Id;
                    transaction.Commit();
                    result.ProcessDetailModel = processDetailModel;
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

        public DeleteProductionProcessResult DeleteProductionProcess(DeleteProductionProcessParameter parameter)
        {
            var result = new DeleteProductionProcessResult 
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Xóa lệnh sản xuất thành công",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entProductionProcess = context.ProductionProcess.FirstOrDefault(f => f.Id == parameter.ProductionProcessId);
                    if (entProductionProcess != null)
                    {
                        var listProductionProcessDetail = context.ProductionProcessDetail.Where(f => f.ProductionProcessId == entProductionProcess.Id).ToList();

                        var entStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_NOT_PRODUCED);

                        var entCheck = listProductionProcessDetail.FirstOrDefault(f => f.StatusId != entStatus.CategoryId); //Guid.NewGuid(): thay bằng Id trạng thái chưa bắt đầu
                        if (entCheck == null)
                        {
                            #region Remove ProductionProcessDetail
                            context.ProductionProcessDetail.RemoveRange(listProductionProcessDetail);
                            context.SaveChanges();
                            #endregion
                            #region Remove ProductionProcess
                            context.ProductionProcess.Remove(entProductionProcess);
                            context.SaveChanges();
                            #endregion
                        }
                        else
                        {
                            result.Message = "Mã lệnh " + entProductionProcess.ProductionCode + " đã được đi vào sản xuất sản xuất, bạn không thể xóa!";
                            result.StatusCode = HttpStatusCode.ExpectationFailed;
                        }
                    }
                    else
                    {
                        result.Message = "Không tồn tại mã lệnh sản xuất này!";
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

        public DeleteProductionProcessDetailByIdResult DeleteProductionProcessDetailById(DeleteProductionProcessDetailByIdParameter parameter)
        {
            var result = new DeleteProductionProcessDetailByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Xóa Lo thành công",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_NOT_PRODUCED);
                    var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId && f.StatusId == entStatus.CategoryId);
                    if (entProductionProcessDetail != null)
                    {

                        var listProductionProcessDetail = context.ProductionProcessDetail.Where(f => f.PrentId == entProductionProcessDetail.Id && f.StatusId == entStatus.CategoryId).ToList();
                        listProductionProcessDetail.Add(entProductionProcessDetail);
                        #region Remove ProductionProcessDetail
                        context.ProductionProcessDetail.RemoveRange(listProductionProcessDetail);
                        context.SaveChanges();
                        #endregion
                    }
                    else
                    {
                        result.Message = "Lô đang trong quá trình sản xuất bạn không thể xóa!";
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
        public GetAllProductionProcessResult GetAllProductionProcess(GetAllProductionProcessParameter parameter)
        {
            var result = new GetAllProductionProcessResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy lệnh sản xuất thành công!",
                TotalProductionProcess = 0
            };
            try
            {
                var models = new List<ProductionProcessModel>();
                var entitiesProductionProcess = context.ProductionProcess.Where(p => p.ProductionCode.Contains(parameter.ProductionCode)).OrderByDescending(b=>b.Id).ToList();
                var listProductionProcessId = entitiesProductionProcess.Select(s => s.Id).Distinct().ToList();
                var entitiesProductionProcessDetail = context.ProductionProcessDetail.Where(p => listProductionProcessId.Contains(p.ProductionProcessId) && !p.PrentId.HasValue).OrderByDescending(o=>o.Id).ToList();
                var listProductId = entitiesProductionProcessDetail.Select(s => s.ProductId).Distinct().ToList();
                var listLotNoId = entitiesProductionProcessDetail.Select(s => s.LotNoId).Distinct().ToList();
                var listStatusId = entitiesProductionProcessDetail.Select(s => s.StatusId).Distinct().ToList();
                var entitiesProduct = context.Product.Where(p => listProductId.Contains(p.ProductId)).ToList();
                var entitiesLotNo = context.LotNo.Where(p => listLotNoId.Contains(p.LotNoId)).ToList();
                var entitiesStatus = context.Category.Where(p => listStatusId.Contains(p.CategoryId)).ToList();

                entitiesProductionProcess.ForEach(item =>
                {
                    var addItem = new ProductionProcessModel(item);
                    var addProductionProcessDetail = new List<ProductionProcessDetailModel>();

                    var listLo = entitiesProductionProcessDetail.Where(w => w.ProductionProcessId == addItem.Id && !w.PrentId.HasValue).ToList();

                    listLo.ForEach(ent =>
                    {
                        var addEnt = new ProductionProcessDetailModel(ent);
                        var itemProduct = entitiesProduct.FirstOrDefault(f => f.ProductId == ent.ProductId);
                        if (itemProduct != null)
                        {
                            addEnt.ProductCode = itemProduct.ProductCode;
                            addEnt.ProductName = itemProduct.ProductName;
                        }
                        var itemLotNo = entitiesLotNo.FirstOrDefault(f => f.LotNoId == ent.LotNoId);
                        if (itemLotNo != null)
                        {
                            addEnt.LotNoName = itemLotNo.LotNoName;
                        }

                        var itemStatus = entitiesStatus.FirstOrDefault(f => f.CategoryId == ent.StatusId);
                        if (itemStatus != null)
                        {
                            addEnt.StatusCode = itemStatus.CategoryCode;
                            addEnt.StatusName = itemStatus.CategoryName;
                        }
                        addProductionProcessDetail.Add(addEnt);
                    });
                    addItem.DetailModels = addProductionProcessDetail;
                    models.Add(addItem);
                });
                result.ProcessModels = models;
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }
        public GetProductionProcessByIdResult GetProductionProcessById(GetProductionProcessByIdParameter parameter)
        {
            var result = new GetProductionProcessByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy lệnh sản xuất theo Id thành công",
            };
            try
            {
                var models = new List<ProductionProcessModel>();
                var entProductionProcess = context.ProductionProcess.FirstOrDefault(f => f.Id == parameter.Id);
                var entitiesProductionProcessDetail = context.ProductionProcessDetail.Where(p => p.ProductionProcessId == entProductionProcess.Id).OrderByDescending(o => o.Id).ToList();
                var listProductId = entitiesProductionProcessDetail.Select(s => s.ProductId).Distinct().ToList();
                var listLotNoId = entitiesProductionProcessDetail.Select(s => s.LotNoId).Distinct().ToList();
                var listStatusId = entitiesProductionProcessDetail.Select(s => s.StatusId).Distinct().ToList();
                var entitiesProduct = context.Product.Where(p => listProductId.Contains(p.ProductId)).ToList();
                var entitiesLotNo = context.LotNo.Where(p => listLotNoId.Contains(p.LotNoId)).ToList();
                var entitiesStatus = context.Category.Where(p => listStatusId.Contains(p.CategoryId)).ToList();

                var model = new ProductionProcessModel(entProductionProcess);
                var entUser = context.User.FirstOrDefault(f => f.UserId == model.CreatedBy);
                if (entUser != null)
                {
                    model.UserName = entUser.UserName;
                }
                var addProductionProcessDetail = new List<ProductionProcessDetailModel>();

                var prentProductionProcessDetail = entitiesProductionProcessDetail.Where(w => !w.PrentId.HasValue).ToList();

                prentProductionProcessDetail.ForEach(ent =>
                {
                    var addEnt = new ProductionProcessDetailModel(ent);
                    var itemProduct = entitiesProduct.FirstOrDefault(f => f.ProductId == ent.ProductId);
                    if (itemProduct != null)
                    {
                        addEnt.ProductCode = itemProduct.ProductCode;
                        addEnt.ProductName = itemProduct.ProductName;
                    }
                    var itemLotNo = entitiesLotNo.FirstOrDefault(f => f.LotNoId == ent.LotNoId);
                    if (itemLotNo != null)
                    {
                        addEnt.LotNoName = itemLotNo.LotNoName;
                    }

                    var itemStatus = entitiesStatus.FirstOrDefault(f => f.CategoryId == ent.StatusId);
                    if (itemStatus != null)
                    {
                        addEnt.StatusCode = itemStatus.CategoryCode;
                        addEnt.StatusName = itemStatus.CategoryName;
                    }

                    var childProductionProcessDetail = entitiesProductionProcessDetail.Where(w => w.PrentId == addEnt.Id).ToList();
                    if (childProductionProcessDetail.Count>0)
                    {
                        var childs = new List<ProductionProcessDetailModel>();

                        childProductionProcessDetail.ForEach(entChild =>
                        {
                            var child = new ProductionProcessDetailModel(entChild);
                            var itemProductChild = entitiesProduct.FirstOrDefault(f => f.ProductId == entChild.ProductId);
                            if (itemProductChild != null)
                            {
                                child.ProductCode = itemProductChild.ProductCode;
                                child.ProductName = itemProductChild.ProductName;
                            }
                            var itemLotNoChild = entitiesLotNo.FirstOrDefault(f => f.LotNoId == entChild.LotNoId);
                            if (itemLotNoChild != null)
                            {
                                child.LotNoName = itemLotNoChild.LotNoName;
                            }

                            var itemStatusChild = entitiesStatus.FirstOrDefault(f => f.CategoryId == entChild.StatusId);
                            if (itemStatusChild != null)
                            {
                                child.StatusCode = itemStatusChild.CategoryCode;
                                child.StatusName = itemStatusChild.CategoryName;
                            }
                            childs.Add(child);
                        });
                        addEnt.ListChildProductionProcessDetail=childs;
                    }
                    

                    addProductionProcessDetail.Add(addEnt);
                });
                model.DetailModels = addProductionProcessDetail;                
                result.Model = model;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }
        public GetConfigProductionByProductIdResult GetConfigProductionByProductId(GetConfigProductionByProductIdParameter parameter)
        {
            var result = new GetConfigProductionByProductIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy cấu hình sản xuất theo sản phẩm",
            };
            try
            {
                var models = new List<ConfigProductionModel>();
                var entitiesConfigProduction = context.ConfigProduction.Where(f => f.ProductId == parameter.ProductId).ToList();
                if (entitiesConfigProduction != null)
                {
                    entitiesConfigProduction.ForEach(item =>
                    {
                        var model = new ConfigProductionModel(item);
                        models.Add(model);
                    });
                }
                result.ConfigProductionModels = models;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetConfigurationProductByProductIdResult GetConfigurationProductByProductId(GetConfigurationProductByProductIdParameter parameter)
        {
            var result = new GetConfigurationProductByProductIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy danh sách nguyên vật liệu theo sản phẩm thành công",
            };
            try
            {
                var entConfigurationProduct = context.ConfigurationProduct.FirstOrDefault(f => f.ProductId == parameter.ProductId && (!parameter.StartDate.HasValue || f.StartDate >= parameter.StartDate) && (!parameter.EndDate.HasValue || f.EndDate >= parameter.EndDate));
                if (entConfigurationProduct != null)
                {
                    var entities = context.ConfigurationProductMapping.Where(w => w.ConfigurationProductId == entConfigurationProduct.ConfigurationProductId).ToList();

                    var listProductId = entities.Select(s => s.ProductId).Distinct().ToList();
                    var listStageGroupId = entities.Select(s => s.StageGroupId).Distinct().ToList();
                    var products = context.Product.Where(w => listProductId.Contains(w.ProductId)).ToList();
                    var stageGroups = context.Category.Where(w => listStageGroupId.Contains(w.CategoryId)).ToList();
                    var listProductUnitId = products.Select(s => s.ProductUnitId).Distinct().ToList();
                    var productUnits = context.Category.Where(w => listProductUnitId.Contains(w.CategoryId)).ToList();

                    var models = new List<ConfigurationProductMappingEntityModel>();
                    if (entities != null)
                    {
                        entities.ForEach(item =>
                        {
                            var model = new ConfigurationProductMappingEntityModel(item);
                            var product = products.FirstOrDefault(f => f.PropertyId == item.ProductId);
                            if (product != null)
                            {
                                model.ProductCode = product.ProductCode;
                                model.ProductName = product.ProductName;
                                var productUnit = productUnits.FirstOrDefault(f => f.CategoryId == product.ProductUnitId);
                                if (productUnit != null)
                                {
                                    model.ProductUnitCode = productUnit.CategoryCode;
                                    model.ProductUnitName = productUnit.CategoryName;
                                }
                            }
                            var stageGroup = stageGroups.FirstOrDefault(f => f.CategoryId == item.StageGroupId);
                            if (stageGroup != null)
                            {
                                model.StageGroupCode = stageGroup.CategoryCode;
                                model.StageGroupName = stageGroup.CategoryName;
                            }                            
                            models.Add(model);
                        });
                    }
                    result.Models = models;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetProductionProcessDetailByIdResult GetProductionProcessDetailById(GetProductionProcessDetailByIdParameter parameter)
        {
            var result = new GetProductionProcessDetailByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Nhận thông tin lo theo Id thành công",
            };
            try
            {
                var ent = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId);
                if (ent != null)
                {
                    var modelProductionProcessDetail = new ProductionProcessDetailModel(ent);
                    var product = context.Product.FirstOrDefault(w => ent.ProductId == w.ProductId);
                    if (product != null)
                    {
                        modelProductionProcessDetail.ProductCode = product.ProductCode;
                        modelProductionProcessDetail.ProductName = product.ProductName;
                    }
                    var lotNo = context.LotNo.FirstOrDefault(l => ent.LotNoId == l.LotNoId);
                    if (lotNo != null)
                    {
                        modelProductionProcessDetail.LotNoName = lotNo.LotNoName;
                    }
                    var statu = context.Category.FirstOrDefault(c => ent.StatusId ==c.CategoryId);
                    if (statu != null)
                    {
                        modelProductionProcessDetail.StatusCode = statu.CategoryCode;
                        modelProductionProcessDetail.StatusName = statu.CategoryName;
                    }
                    #region Lấy thông tin (Danh sách lô con)
                    var entitiesProductionProcessDetail = context.ProductionProcessDetail.Where(w => w.PrentId == modelProductionProcessDetail.Id).OrderByDescending(o=>o.Id).ToList();
                    if (entitiesProductionProcessDetail != null) 
                    {
                        var listProductId = entitiesProductionProcessDetail.Select(s => s.ProductId).Distinct().ToList();
                        var listLotNoId = entitiesProductionProcessDetail.Select(s => s.LotNoId).Distinct().ToList();
                        var listStatuId = entitiesProductionProcessDetail.Select(s => s.StatusId).Distinct().ToList();
                        var products = context.Product.Where(w => listProductId.Contains(w.ProductId)).Select(s => new { s.ProductId, s.ProductCode, s.ProductName }).ToList();
                        var lotNos = context.LotNo.Where(l => listLotNoId.Contains(l.LotNoId)).ToList();
                        var status = context.Category.Where(c => listStatuId.Contains(c.CategoryId)).ToList();

                        var statusStageProgress = context.Category.FirstOrDefault(c => c.CategoryCode == ProcessStageStatusType.STAGE_BEGIN);
                        var statusStageFinish = context.Category.FirstOrDefault(c => c.CategoryCode == ProcessStageStatusType.STAGE_FINISH);

                        var childModels = new List<ProductionProcessDetailModel>();
                        entitiesProductionProcessDetail.ForEach(item =>
                        {
                            var modelChild = new ProductionProcessDetailModel(item);
                            var productChild = products.FirstOrDefault(p => p.ProductId == item.ProductId);
                            if (productChild != null)
                            {
                                modelChild.ProductCode = productChild.ProductCode;
                                modelChild.ProductName = productChild.ProductName;
                            }
                            var lotNoChild = lotNos.FirstOrDefault(f => f.LotNoId == item.LotNoId);
                            if (lotNoChild != null)
                            {
                                modelChild.LotNoName = lotNoChild.LotNoName;
                            }
                            var statuChild = status.FirstOrDefault(f => f.CategoryId == item.StatusId);
                            if (statuChild != null)
                            {
                                modelChild.StatusCode = statuChild.CategoryCode;
                                modelChild.StatusName = statuChild.CategoryName;
                            }
                            #region Có công đoạn hoàn thành
                            var entitiesStageFinish = context.ProductionProcessStage.Where(w => w.StatusId == statusStageFinish.CategoryId && w.ProductionProcessDetailId == item.Id).Select(s => s.StageNameId).ToList();
                            if (entitiesStageFinish.Count > 0)
                            {
                                var listStageFinish = context.Category.Where(c => entitiesStageFinish.Contains(c.CategoryId)).Select(s => s.CategoryName).ToList();
                                modelChild.StageFinish = string.Join(",", listStageFinish);
                            }
                            else
                            {
                                modelChild.StageFinish = string.Empty;
                            }
                            #endregion
                            #region Công đoạn đang thực hiện
                            modelChild.StageProgress = string.Empty;
                            var listProductionProcessStage = context.ProductionProcessStage.Where(w => w.StatusId == statusStageProgress.CategoryId && w.ProductionProcessDetailId == modelChild.Id).Select(s => new { s.Id, s.StageNameId, s.TotalProduction }).ToList();
                            var listStageNameId = listProductionProcessStage.Select(s => s.StageNameId).ToList();
                            var listStageId = listProductionProcessStage.Select(s => s.Id).ToList();

                            var entQuantityProduction = listProductionProcessStage.OrderByDescending(o => o.TotalProduction).FirstOrDefault();
                            if (entQuantityProduction != null)
                            {
                                modelChild.TotalQuantityProduction = entQuantityProduction.TotalProduction;
                            }                            
                            if (listStageNameId != null)
                            {
                                var productInputModels = new List<ProductionProcessStageProductInputModel>();
                                var listStageProgress = context.Category.Where(c => listStageNameId.Contains(c.CategoryId)).Select(s => s.CategoryName).ToList();
                                if (listStageProgress != null)
                                {
                                    modelChild.StageProgress = string.Join(",", listStageProgress);
                                }
                               
                                var entitiesProductInput = context.ProductionProcessStageProductInput.Where(w=> listStageId.Contains(w.ProductionProcessStageId)).ToList();
                                entitiesProductInput.ForEach(entProductInput => 
                                {
                                    var itemProductInput = new ProductionProcessStageProductInputModel(entProductInput);

                                    var entProduct = context.Product.FirstOrDefault(f => f.ProductId == entProductInput.ProductId);
                                    if (entProduct != null)
                                    {
                                        itemProductInput.ProductCode = entProduct.ProductCode;
                                        itemProductInput.ProductName = entProduct.ProductName;
                                        var entProductUnit = context.Category.FirstOrDefault(f => f.CategoryId == entProduct.ProductUnitId);
                                        if (entProductUnit != null)
                                        {
                                            itemProductInput.ProductUnitName = entProductUnit.CategoryName;
                                        }
                                    }                                    
                                    var entLotNo = context.LotNo.FirstOrDefault(f => f.LotNoId == entProductInput.LotNoId);
                                    if (entLotNo != null)
                                    {
                                        itemProductInput.LotNoName = entLotNo.LotNoName;
                                    }

                                    productInputModels.Add(itemProductInput);
                                });
                                modelChild.ProductInputs = productInputModels;
                            }
                            #endregion
                            childModels.Add(modelChild);
                        });
                        modelProductionProcessDetail.ListChildProductionProcessDetail = childModels;
                    }
                    #endregion

                    #region Lấy danh sách công đoạn
                    var entitiesProductionProcessStage = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == modelProductionProcessDetail.Id).OrderBy(o=>o.SortOrder).ToList();
                    if (entitiesProductionProcessStage != null)
                    {
                        var listStageNameId = entitiesProductionProcessStage.Select(s => s.StageNameId).Distinct().ToList();
                        var listStageGroupId = entitiesProductionProcessStage.Select(s => s.StageGroupId).Distinct().ToList();
                        var listDepartmentId = entitiesProductionProcessStage.Select(s => s.DepartmentId).Distinct().ToList();
                        var listStatusId = entitiesProductionProcessStage.Select(s => s.StatusId).Distinct().ToList();
                        #region list EmployeeId
                        var listPersonInChargeId = entitiesProductionProcessStage.Select(s => s.PersonInChargeId).Distinct().ToList();
                        //var listPersonVerifierId = entitiesProductionProcessStage.Where(w => w.PersonVerifierId.HasValue).Select(s => s.PersonVerifierId.Value).Distinct().ToList();
                        //var listStartPerformerId = entitiesProductionProcessStage.Where(w => w.SelectStartPerformerId).Select(s => s.StartPerformerId.Value).Distinct().ToList();
                        //var listEndPerformerId = entitiesProductionProcessStage.Where(w => w.SelectEndPerformerId).Select(s => s.EndPerformerId.Value).Distinct().ToList();

                        var listEmployeeId = new List<Guid>();
                        //listEmployeeId.AddRange(listPersonVerifierId);
                        //listEmployeeId.AddRange(listStartPerformerId);
                        //listEmployeeId.AddRange(listEndPerformerId);
                        if (listPersonInChargeId != null)
                        {
                            listPersonInChargeId.ForEach(items =>
                            {
                                foreach(Guid item in items)
                                {
                                    listEmployeeId.Add(item);
                                }
                            });
                        }
                        listEmployeeId = listEmployeeId.Distinct().ToList();
                        #endregion

                        var entitiesCategory = context.Category.Where(w => listStageNameId.Contains(w.CategoryId) || listStageGroupId.Contains(w.CategoryId) || listStatusId.Contains(w.CategoryId))
                            .Select(s => new { s.CategoryId, s.CategoryCode, s.CategoryName }).ToList();
                        var entitiesOrganization = context.Organization.Where(w => listDepartmentId.Contains(w.OrganizationId)).Select(s => new { s.OrganizationId, s.OrganizationCode, s.OrganizationName }).ToList();
                        var entitiesEmployee = context.Employee.Where(w => listEmployeeId.Contains(w.EmployeeId)).Select(s => new { s.EmployeeId, s.EmployeeCode, s.EmployeeName }).ToList();

                        var processStageModels = new List<ProductionProcessStageModel>();
                        entitiesProductionProcessStage.ForEach(item =>
                        {
                            var modelProcessStage = new ProductionProcessStageModel(item);

                            var stage = entitiesCategory.FirstOrDefault(f => f.CategoryId == item.StageNameId);
                            if (stage != null)
                            {
                                modelProcessStage.StageCode = stage.CategoryCode;
                                modelProcessStage.StageName = stage.CategoryName;
                            }
                            var stageGroup = entitiesCategory.FirstOrDefault(f => f.CategoryId == item.StageGroupId);
                            if (stageGroup != null)
                            {
                                modelProcessStage.StageGroupCode = stageGroup.CategoryCode;
                                modelProcessStage.StageGroupName = stageGroup.CategoryName;
                            }
                            var status = entitiesCategory.FirstOrDefault(f => f.CategoryId == item.StatusId);
                            if (status != null)
                            {
                                modelProcessStage.StatusCode = status.CategoryCode;
                                modelProcessStage.StatusName = status.CategoryName;
                            }
                            var department = entitiesOrganization.FirstOrDefault(f => f.OrganizationId == item.DepartmentId);
                            if (department != null)
                            {
                                modelProcessStage.DepartmentCode = department.OrganizationCode;
                                modelProcessStage.DepartmentName = department.OrganizationName;
                            }
                            var personVerifier = entitiesEmployee.FirstOrDefault(f => f.EmployeeId == item.PersonVerifierId);
                            if (personVerifier != null)
                            {
                                modelProcessStage.PersonVerifierCode = personVerifier.EmployeeCode;
                                modelProcessStage.PersonVerifierName = personVerifier.EmployeeName;
                            }
                            var performers = entitiesEmployee.Where(w => item.PersonInChargeId.Contains(w.EmployeeId)).ToList();//Where(w => w.EmployeeId == item.StartPerformerId || w.EmployeeId == item.EndPerformerId).
                            if (performers!=null)
                            {
                                var employeeModels = new List<PersonInChargeModel>();
                                performers.ForEach(performer =>
                                {
                                    var itemEmployee = new PersonInChargeModel();
                                    itemEmployee.EmployeeId = performer.EmployeeId;
                                    itemEmployee.EmployeeCode = performer.EmployeeCode;
                                    itemEmployee.EmployeeName = performer.EmployeeName;
                                    if (string.IsNullOrEmpty(modelProcessStage.PerformerCode))
                                    {
                                        modelProcessStage.PerformerCode = performer.EmployeeCode;
                                        modelProcessStage.PerformerName = performer.EmployeeName;
                                    }
                                    else
                                    {
                                        modelProcessStage.PerformerCode = modelProcessStage.PerformerCode + ", " + performer.EmployeeCode;
                                        modelProcessStage.PerformerName = modelProcessStage.PerformerName + ", " + performer.EmployeeName;
                                    }
                                    employeeModels.Add(itemEmployee);
                                });
                                modelProcessStage.PersonInChargeModels = employeeModels;
                            }

                            #region Thống kê hạng mục lỗi
                            var entitiesProductionProcessErrorStage = context.ProductionProcessErrorStage.Where(w => w.ProductionProcessStageId == modelProcessStage.Id).ToList();
                            var listErrorItemId = entitiesProductionProcessErrorStage.Select(w => w.ErrorItemId).ToList();
                            var entitiesErrorItem = context.Category.Where(w => listErrorItemId.Contains(w.CategoryId)).ToList();
                            var processErrorStageModels = new List<ProductionProcessErrorStageModel>();

                            entitiesProductionProcessErrorStage.ForEach(entProcessErrorStage =>
                            {
                                var itemProcessErrorStage = new ProductionProcessErrorStageModel(entProcessErrorStage);
                                var entErrorItem = entitiesErrorItem.FirstOrDefault(f => f.CategoryId == itemProcessErrorStage.ErrorItemId);
                                if (entErrorItem != null)
                                {
                                    itemProcessErrorStage.ErrorItemCode = entErrorItem.CategoryCode;
                                    itemProcessErrorStage.ErrorItemName = entErrorItem.CategoryName;
                                }
                                processErrorStageModels.Add(itemProcessErrorStage);
                            });

                            modelProcessStage.ProcessErrorStageModels = processErrorStageModels;
                            #endregion

                            processStageModels.Add(modelProcessStage);
                        });
                        modelProductionProcessDetail.ProcessStageModels = processStageModels;
                    }
                    #endregion

                    #region Thông tin xuất/nhập kho
                    var entitiesProductionProcessStageImportExport = context.ProductionProcessStageImportExport.Where(w => w.ProductionProcessDetailId == parameter.ProductionProcessDetailId).OrderBy(o => o.Id).ToList();
                    if (entitiesProductionProcessStageImportExport != null)
                    {                        
                        var listImportExportStageNameId = entitiesProductionProcessStageImportExport.Select(s => s.StageNameId).Distinct().ToList();
                        var listImportExportWarehouseId = entitiesProductionProcessStageImportExport.Select(s => s.WarehouseId).Distinct().ToList();

                        var entitiesImportExportWarehouse = context.Warehouse.Where(w => listImportExportWarehouseId.Contains(w.WarehouseId)).Select(s => new { s.WarehouseId, s.WarehouseCode, s.WarehouseName }).ToList();
                        var entitiesImportExportStageName = context.Category.Where(w => listImportExportStageNameId.Contains(w.CategoryId)).Select(s => new { s.CategoryId, s.CategoryCode, s.CategoryName }).ToList();

                        var importExportModels = new List<ProductionProcessStageImportExportModel>();
                        entitiesProductionProcessStageImportExport.ForEach(entImportExport =>
                        {
                            var importExportModel = new ProductionProcessStageImportExportModel(entImportExport);

                            var entStage = entitiesImportExportStageName.FirstOrDefault(f => f.CategoryId == entImportExport.StageNameId);
                            if (entStage != null)
                            {
                                importExportModel.StageName = entStage.CategoryName;
                            }
                            var entWarehouse = entitiesImportExportWarehouse.FirstOrDefault(f=>f.WarehouseId== entImportExport.WarehouseId);
                            if (entWarehouse != null)
                            {
                                importExportModel.WarehouseName = entWarehouse.WarehouseName;
                            }

                            var wareHouse = context.Warehouse.FirstOrDefault(c => c.WarehouseId == entImportExport.WarehouseId);
                            var wareHouseType = context.Category.FirstOrDefault(w => w.CategoryId == wareHouse.WareHouseType).CategoryCode;

                            if (entImportExport.IsExport)
                            {
                                importExportModel.InventoryScreenType = context.InventoryDeliveryVoucher.FirstOrDefault(f => f.InventoryDeliveryVoucherId == entImportExport.InventoryVoucherId)?.InventoryDeliveryVoucherScreenType ?? 0;
                                if(importExportModel.InventoryScreenType == 0)
                                {
                                    importExportModel.InventoryScreenType = wareHouseType == "KTP" ? (int)ScreenType.TP : ((wareHouseType == "CSX" || wareHouseType == "TSK") ? (int)ScreenType.SX : (int)ScreenType.NVL);
                                }
                                
                            }
                            else
                            {
                                importExportModel.InventoryScreenType = wareHouseType == "KTP" ? (int)ScreenType.TP : ((wareHouseType == "CSX" || wareHouseType == "TSK") ? (int)ScreenType.SX : (int)ScreenType.NVL);
                                importExportModel.WarehouseType = wareHouseType == "CSX" ? 3 : (wareHouseType == "TSK" ? 2 : 0);
                            }
                            importExportModels.Add(importExportModel);
                        });
                        modelProductionProcessDetail.ImportExportModels = importExportModels;
                    }
                    #endregion

                    result.Model = modelProductionProcessDetail;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetProductionProcessDetailByIdAndUserIdResult GetProductionProcessDetailByIdAndUserId(GetProductionProcessDetailByIdAndUserIdParameter parameter)
        {
            var result = new GetProductionProcessDetailByIdAndUserIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Nhận thông tin lo theo Id thành công",
            };
            try
            {
                var ent = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId);
                if (ent != null)
                {
                    var modelProductionProcessDetail = new ProductionProcessDetailModel(ent);
                    var product = context.Product.FirstOrDefault(w => ent.ProductId == w.ProductId);
                    if (product != null)
                    {
                        modelProductionProcessDetail.ProductCode = product.ProductCode;
                        modelProductionProcessDetail.ProductName = product.ProductName;
                        modelProductionProcessDetail.DepartmentId = product.Department;
                    }
                    var lotNo = context.LotNo.FirstOrDefault(l => ent.LotNoId == l.LotNoId);
                    if (lotNo != null)
                    {
                        modelProductionProcessDetail.LotNoName = lotNo.LotNoName;
                    }
                    var statu = context.Category.FirstOrDefault(c => ent.StatusId == c.CategoryId);
                    if (statu != null)
                    {
                        modelProductionProcessDetail.StatusCode = statu.CategoryCode;
                        modelProductionProcessDetail.StatusName = statu.CategoryName;
                    }

                    Guid? employeeId = null;//Id người thực hiện công đoạn                    
                    var user = context.User.FirstOrDefault(f => f.UserId == parameter.UserId);
                    if (user != null)
                    {
                        employeeId = user.EmployeeId;
                    }
                    #region Lấy danh sách công đoạn
                    var entitiesProductionProcessStage = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == modelProductionProcessDetail.Id && (!employeeId.HasValue || w.PersonInChargeId.Contains(employeeId.Value))).OrderBy(o => o.SortOrder).ToList();
                    if (entitiesProductionProcessStage != null)
                    {
                        var listStageNameId = entitiesProductionProcessStage.Select(s => s.StageNameId).Distinct().ToList();
                        var listStageGroupId = entitiesProductionProcessStage.Select(s => s.StageGroupId).Distinct().ToList();
                        var listDepartmentId = entitiesProductionProcessStage.Select(s => s.DepartmentId).Distinct().ToList();
                        var listStatusId = entitiesProductionProcessStage.Select(s => s.StatusId).Distinct().ToList();
                        #region list EmployeeId
                        var listPersonInChargeId = entitiesProductionProcessStage.Select(s => s.PersonInChargeId).Distinct().ToList();
                        var listEmployeeId = new List<Guid>();
                        if (listPersonInChargeId != null)
                        {
                            listPersonInChargeId.ForEach(items =>
                            {
                                foreach (Guid item in items)
                                {
                                    listEmployeeId.Add(item);
                                }
                            });
                        }
                        listEmployeeId = listEmployeeId.Distinct().ToList();
                        #endregion

                        var entitiesCategory = context.Category.Where(w => listStageNameId.Contains(w.CategoryId) || listStageGroupId.Contains(w.CategoryId) || listStatusId.Contains(w.CategoryId))
                            .Select(s => new { s.CategoryId, s.CategoryCode, s.CategoryName }).ToList();
                        var entitiesOrganization = context.Organization.Where(w => listDepartmentId.Contains(w.OrganizationId)).Select(s => new { s.OrganizationId, s.OrganizationCode, s.OrganizationName }).ToList();
                        var entitiesEmployee = context.Employee.Where(w => listEmployeeId.Contains(w.EmployeeId)).Select(s => new { s.EmployeeId, s.EmployeeCode, s.EmployeeName }).ToList();

                        var processStageModels = new List<ProductionProcessStageModel>();
                        entitiesProductionProcessStage.ForEach(item =>
                        {
                            var modelProcessStage = new ProductionProcessStageModel(item);

                            #region Kiểm tra có phải là công đoạn cuối cùng không
                            var chkCount = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == modelProcessStage.ProductionProcessDetailId && w.SortOrder > modelProcessStage.SortOrder).OrderBy(o => o.SortOrder).Count();
                            if (chkCount > 0)
                            {
                                modelProcessStage.IsEndStage = false;
                            }
                            else
                            {
                                modelProcessStage.IsEndStage = true;
                            }
                            #endregion

                            var stage = entitiesCategory.FirstOrDefault(f => f.CategoryId == item.StageNameId);
                            if (stage != null)
                            {
                                modelProcessStage.StageCode = stage.CategoryCode;
                                modelProcessStage.StageName = stage.CategoryName;
                            }
                            var stageGroup = entitiesCategory.FirstOrDefault(f => f.CategoryId == item.StageGroupId);
                            if (stageGroup != null)
                            {
                                modelProcessStage.StageGroupCode = stageGroup.CategoryCode;
                                modelProcessStage.StageGroupName = stageGroup.CategoryName;
                            }
                            var status = entitiesCategory.FirstOrDefault(f => f.CategoryId == item.StatusId);
                            if (status != null)
                            {
                                modelProcessStage.StatusCode = status.CategoryCode;
                                modelProcessStage.StatusName = status.CategoryName;
                            }
                            var department = entitiesOrganization.FirstOrDefault(f => f.OrganizationId == item.DepartmentId);
                            if (department != null)
                            {
                                modelProcessStage.DepartmentCode = department.OrganizationCode;
                                modelProcessStage.DepartmentName = department.OrganizationName;
                            }
                            var personVerifier = entitiesEmployee.FirstOrDefault(f => f.EmployeeId == item.PersonVerifierId);
                            if (personVerifier != null)
                            {
                                modelProcessStage.PersonVerifierCode = personVerifier.EmployeeCode;
                                modelProcessStage.PersonVerifierName = personVerifier.EmployeeName;
                            }
                            var performers = entitiesEmployee.Where(w => item.PersonInChargeId.Contains(w.EmployeeId)).ToList();//Where(w => w.EmployeeId == item.StartPerformerId || w.EmployeeId == item.EndPerformerId).
                            if (performers != null)
                            {
                                var employeeModels = new List<PersonInChargeModel>();
                                performers.ForEach(performer =>
                                {
                                    var itemEmployee = new PersonInChargeModel();
                                    itemEmployee.EmployeeId = performer.EmployeeId;
                                    itemEmployee.EmployeeCode = performer.EmployeeCode;
                                    itemEmployee.EmployeeName = performer.EmployeeName;
                                    if (string.IsNullOrEmpty(modelProcessStage.PerformerCode))
                                    {
                                        modelProcessStage.PerformerCode = performer.EmployeeCode;
                                        modelProcessStage.PerformerName = performer.EmployeeName;
                                    }
                                    else
                                    {
                                        modelProcessStage.PerformerCode = modelProcessStage.PerformerCode + ", " + performer.EmployeeCode;
                                        modelProcessStage.PerformerName = modelProcessStage.PerformerName + ", " + performer.EmployeeName;
                                    }
                                    employeeModels.Add(itemEmployee);
                                });
                                modelProcessStage.PersonInChargeModels = employeeModels;
                            }

                            #region Thống kê hạng mục lỗi
                            var entitiesProductionProcessErrorStage = context.ProductionProcessErrorStage.Where(w => w.ProductionProcessStageId == modelProcessStage.Id).ToList();
                            var listErrorItemId = entitiesProductionProcessErrorStage.Select(w => w.ErrorItemId).ToList();
                            var entitiesErrorItem = context.Category.Where(w => listErrorItemId.Contains(w.CategoryId)).ToList();
                            var processErrorStageModels = new List<ProductionProcessErrorStageModel>();

                            #region Danh sách NG
                            var entitiesProductionProcessListNg = context.ProductionProcessListNg.Where(w => w.ProductionProcessStageId == modelProcessStage.Id).ToList();
                            var processListNgModels = new List<ProductionProcessListNgModel>();
                            entitiesProductionProcessListNg.ForEach(itemNg =>
                            {
                                var modelNg = new ProductionProcessListNgModel(itemNg);
                                processListNgModels.Add(modelNg);
                            });
                            modelProcessStage.ProcessListNgModels = processListNgModels;
                            #endregion

                            entitiesProductionProcessErrorStage.ForEach(entProcessErrorStage =>
                            {
                                var itemProcessErrorStage = new ProductionProcessErrorStageModel(entProcessErrorStage);
                                var entErrorItem = entitiesErrorItem.FirstOrDefault(f => f.CategoryId == itemProcessErrorStage.ErrorItemId);
                                if (entErrorItem != null)
                                {
                                    itemProcessErrorStage.ErrorItemCode = entErrorItem.CategoryCode;
                                    itemProcessErrorStage.ErrorItemName = entErrorItem.CategoryName;
                                }
                                processErrorStageModels.Add(itemProcessErrorStage);
                            });

                            modelProcessStage.ProcessErrorStageModels = processErrorStageModels;
                            #endregion

                            processStageModels.Add(modelProcessStage);
                        });
                        modelProductionProcessDetail.ProcessStageModels = processStageModels;
                    }
                    #endregion

                    result.Model = modelProductionProcessDetail;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetProductionProcessDetailByProductIdResult GetProductionProcessDetailByProductId(GetProductionProcessDetailByProductIdParameter parameter)
        {
            var result = new GetProductionProcessDetailByProductIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Nhận danh sách Lô theo sản phẩm thành công",
            };
            try
            {
                var models = new List<ProductionProcessDetailModel>();
                var entities = context.ProductionProcessDetail
                    .Where(w => (parameter.ListProductId == null || parameter.ListProductId.Count == 0 || parameter.ListProductId.Contains(w.ProductId)))
                    .OrderByDescending(o => o.CreatedDate).ToList();
                if (entities != null)
                {
                    var listProductId = entities.Select(s => s.ProductId).Distinct().ToList();
                    var listLotNoId = entities.Select(s => s.LotNoId).Distinct().ToList();
                    var listStatuId = entities.Select(s => s.StatusId).Distinct().ToList();
                    var products = context.Product.Where(w => listProductId.Contains(w.ProductId)).Select(s => new { s.ProductId, s.ProductCode, s.ProductName }).ToList();
                    var lotNos = context.LotNo.Where(l => listLotNoId.Contains(l.LotNoId)).ToList();

                    var lotName = parameter.LotName;
                    if (!string.IsNullOrEmpty(lotName))
                    {
                        if (lotName.Length > 4)
                        {
                            lotName = lotName.Substring(0, 4);
                        }
                    }

                    var lotNosPrent = lotNos.Where(w => string.IsNullOrEmpty(lotName) || (!string.IsNullOrEmpty(lotName) && w.LotNoName.Contains(lotName))).ToList();
                    var lotNosChild = lotNos.Where(w => string.IsNullOrEmpty(parameter.LotName) || (!string.IsNullOrEmpty(parameter.LotName) && w.LotNoName.Contains(parameter.LotName))).ToList();

                    var status = context.Category.Where(c => listStatuId.Contains(c.CategoryId)).ToList();

                    var statusStageProgress = context.Category.FirstOrDefault(c => c.CategoryCode == ProcessStageStatusType.STAGE_BEGIN);

                    var statusStageFinish = context.Category.FirstOrDefault(c => c.CategoryCode == ProcessStageStatusType.STAGE_FINISH);
                                        
                    var entitiesChild = entities.Where(w => w.PrentId.HasValue
                                            && (!parameter.StatusId.HasValue || w.StatusId == parameter.StatusId)
                                            && (!parameter.StartDate.HasValue || (w.StartDate.HasValue && w.StartDate.Value.Date >= parameter.StartDate.Value.Date))
                                            && (!parameter.EndDate.HasValue || (w.StartDate.HasValue && w.StartDate.Value.Date <= parameter.EndDate.Value.Date))).ToList();
                    var listLoId = entitiesChild.Select(s => s.PrentId.Value).Distinct().ToList();
                    var entitiesPrent = entities.Where(w => (!w.PrentId.HasValue 
                                            && (!parameter.StatusId.HasValue || w.StatusId == parameter.StatusId)
                                            && (!parameter.StartDate.HasValue || (w.StartDate.HasValue && w.StartDate.Value.Date >= parameter.StartDate.Value.Date))
                                            && (!parameter.EndDate.HasValue || (w.StartDate.HasValue && w.StartDate.Value.Date <= parameter.EndDate.Value.Date))) || listLoId.Contains(w.Id)).ToList();

                    entitiesPrent.ForEach(item =>
                    {
                        var lotNo = lotNosPrent.FirstOrDefault(f => f.LotNoId == item.LotNoId);
                        if(lotNo != null)
                        {
                            var model = new ProductionProcessDetailModel(item);
                            var product = products.FirstOrDefault(p => p.ProductId == item.ProductId);
                            if (product != null)
                            {
                                model.ProductCode = product.ProductCode;
                                model.ProductName = product.ProductName;
                            }

                            if (lotNo != null)
                            {
                                model.LotNoName = lotNo.LotNoName;
                            }
                            var statu = status.FirstOrDefault(f => f.CategoryId == item.StatusId);
                            if (statu != null)
                            {
                                model.StatusCode = statu.CategoryCode;
                                model.StatusName = statu.CategoryName;
                            }
                            #region Có công đoạn hoàn thành
                            var entitiesStageFinish = context.ProductionProcessStage.Where(w => w.StatusId == statusStageFinish.CategoryId && w.ProductionProcessDetailId == model.Id).Select(s => s.StageNameId).ToList();
                            if (entitiesStageFinish.Count > 0)
                            {
                                var listStageFinish = context.Category.Where(c => entitiesStageFinish.Contains(c.CategoryId)).Select(s => s.CategoryName).ToList();
                                model.StageFinish = string.Join(",", listStageFinish);
                            }
                            else
                            {
                                model.StageFinish = string.Empty;
                            }
                            #endregion

                            #region Công đoạn đang thực hiện 
                            model.StageProgress = string.Empty;
                            var listProductionProcessStage = context.ProductionProcessStage.Where(w => w.StatusId == statusStageProgress.CategoryId && w.ProductionProcessDetailId == model.Id).Select(s => new { s.Id, s.StageNameId, s.TotalProduction }).ToList();
                            var listStageNameId = listProductionProcessStage.Select(s => s.StageNameId).ToList();
                            var listStageId = listProductionProcessStage.Select(s => s.Id).ToList();

                            var entQuantityProduction = listProductionProcessStage.OrderByDescending(o => o.TotalProduction).FirstOrDefault();
                            if (entQuantityProduction != null)
                            {
                                model.TotalQuantityProduction = entQuantityProduction.TotalProduction;
                            }
                            if (listStageNameId != null)
                            {
                                var productInputModels = new List<ProductionProcessStageProductInputModel>();
                                var listStageProgress = context.Category.Where(c => listStageNameId.Contains(c.CategoryId)).Select(s => s.CategoryName).ToList();
                                if (listStageProgress != null)
                                {
                                    model.StageProgress = string.Join(",", listStageProgress);
                                }

                                var entitiesProductInput = context.ProductionProcessStageProductInput.Where(w => listStageId.Contains(w.ProductionProcessStageId)).ToList();
                                entitiesProductInput.ForEach(entProductInput =>
                                {
                                    var itemProductInput = new ProductionProcessStageProductInputModel(entProductInput);

                                    var entProduct = context.Product.FirstOrDefault(f => f.ProductId == entProductInput.ProductId);
                                    if (entProduct != null)
                                    {
                                        itemProductInput.ProductCode = entProduct.ProductCode;
                                        itemProductInput.ProductName = entProduct.ProductName;
                                        var entProductUnit = context.Category.FirstOrDefault(f => f.CategoryId == entProduct.ProductUnitId);
                                        if (entProductUnit != null)
                                        {
                                            itemProductInput.ProductUnitName = entProductUnit.CategoryName;
                                        }
                                    }
                                    var entLotNo = context.LotNo.FirstOrDefault(f => f.LotNoId == entProductInput.LotNoId);
                                    if (entLotNo != null)
                                    {
                                        itemProductInput.LotNoName = entLotNo.LotNoName;
                                    }

                                    productInputModels.Add(itemProductInput);
                                });
                                model.ProductInputs = productInputModels;
                            }
                            #endregion

                            var entitiesChild1 = entitiesChild.Where(w => w.PrentId == item.Id).OrderByDescending(o => o.Id).ToList();
                            if (entitiesChild1 != null)
                            {
                                model.ListChildProductionProcessDetail = new List<ProductionProcessDetailModel>();
                                entitiesChild1.ForEach(itemChild =>
                                {
                                    var lotNo1 = lotNosChild.FirstOrDefault(f => f.LotNoId == itemChild.LotNoId);
                                    if (lotNo1 != null)
                                    {
                                        var model1 = new ProductionProcessDetailModel(itemChild);
                                        var product1 = products.FirstOrDefault(p => p.ProductId == itemChild.ProductId);
                                        if (product1 != null)
                                        {
                                            model1.ProductCode = product1.ProductCode;
                                            model1.ProductName = product1.ProductName;
                                        }


                                        model1.LotNoName = lotNo1.LotNoName;
                                        var statu1 = status.FirstOrDefault(f => f.CategoryId == itemChild.StatusId);
                                        if (statu1 != null)
                                        {
                                            model1.StatusCode = statu1.CategoryCode;
                                            model1.StatusName = statu1.CategoryName;
                                        }
                                        #region Có công đoạn hoàn thành
                                        var entitiesStageFinish1 = context.ProductionProcessStage.Where(w => w.StatusId == statusStageFinish.CategoryId && w.ProductionProcessDetailId == model1.Id).Select(s => s.StageNameId).ToList();
                                        if (entitiesStageFinish1.Count > 0)
                                        {
                                            var listStageFinish = context.Category.Where(c => entitiesStageFinish1.Contains(c.CategoryId)).Select(s => s.CategoryName).ToList();
                                            model1.StageFinish = string.Join(",", listStageFinish);
                                        }
                                        else
                                        {
                                            model1.StageFinish = string.Empty;
                                        }
                                        #endregion
                                        #region Công đoạn đang thực hiện                                
                                        model1.StageProgress = string.Empty;
                                        var listProductionProcessStage1 = context.ProductionProcessStage.Where(w => w.StatusId == statusStageProgress.CategoryId && w.ProductionProcessDetailId == model1.Id).Select(s => new { s.Id, s.StageNameId, s.TotalProduction }).ToList();
                                        var listStageNameId1 = listProductionProcessStage1.Select(s => s.StageNameId).ToList();
                                        var listStageId1 = listProductionProcessStage1.Select(s => s.Id).ToList();

                                        var entQuantityProduction1 = listProductionProcessStage1.OrderByDescending(o => o.TotalProduction).FirstOrDefault();
                                        if (entQuantityProduction1 != null)
                                        {
                                            model1.TotalQuantityProduction = entQuantityProduction1.TotalProduction;
                                        }
                                        if (listStageNameId1 != null)
                                        {
                                            var productInputModels = new List<ProductionProcessStageProductInputModel>();
                                            var listStageProgress = context.Category.Where(c => listStageNameId1.Contains(c.CategoryId)).Select(s => s.CategoryName).ToList();
                                            if (listStageProgress != null)
                                            {
                                                model1.StageProgress = string.Join(",", listStageProgress);
                                            }

                                            var entitiesProductInput = context.ProductionProcessStageProductInput.Where(w => listStageId1.Contains(w.ProductionProcessStageId)).ToList();
                                            entitiesProductInput.ForEach(entProductInput =>
                                            {
                                                var itemProductInput = new ProductionProcessStageProductInputModel(entProductInput);

                                                var entProduct = context.Product.FirstOrDefault(f => f.ProductId == entProductInput.ProductId);
                                                if (entProduct != null)
                                                {
                                                    itemProductInput.ProductCode = entProduct.ProductCode;
                                                    itemProductInput.ProductName = entProduct.ProductName;
                                                    var entProductUnit = context.Category.FirstOrDefault(f => f.CategoryId == entProduct.ProductUnitId);
                                                    if (entProductUnit != null)
                                                    {
                                                        itemProductInput.ProductUnitName = entProductUnit.CategoryName;
                                                    }
                                                }
                                                var entLotNo = context.LotNo.FirstOrDefault(f => f.LotNoId == entProductInput.LotNoId);
                                                if (entLotNo != null)
                                                {
                                                    itemProductInput.LotNoName = entLotNo.LotNoName;
                                                }

                                                productInputModels.Add(itemProductInput);
                                            });
                                            model1.ProductInputs = productInputModels;
                                        }

                                        model.ListChildProductionProcessDetail.Add(model1);
                                        #endregion
                                    }
                                });
                            }
                            models.Add(model);
                        }
                    });
                }
                result.Models = models;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetProductionProcessStageByIdResult GetProductionProcessStageById(GetProductionProcessStageByIdParameter parameter)
        {
            var result = new GetProductionProcessStageByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy công đoạn sản xuất theo Id thành công",
            };

            try
            {
                var entProcessStage = context.ProductionProcessStage.FirstOrDefault(f => f.Id == parameter.Id);
                if (entProcessStage != null)
                {
                    var model = new ProductionProcessStageModel(entProcessStage);
                    var entitiesCategory = context.Category.Where(w => w.CategoryId == model.StageNameId || w.CategoryId == model.StageGroupId || w.CategoryId == model.PreviousStageNameId || w.CategoryId == model.StatusId).ToList();
                    var entOrganization = context.Organization.FirstOrDefault(f => f.OrganizationId == model.DepartmentId);
                    var entitiesEmployee = context.Employee.Where(w=>model.PersonInChargeId.Contains(w.EmployeeId)).ToList();//|| model.SelectStartPerformerId.Contains(w.EmployeeId) || model.SelectEndPerformerId(w.EmployeeId)

                    #region Kiểm tra có phải là công đoạn cuối cùng không
                    var chkCount = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == entProcessStage.ProductionProcessDetailId && w.SortOrder > entProcessStage.SortOrder).OrderBy(o => o.SortOrder).Count();
                    if (chkCount > 0)
                    {
                        model.IsEndStage = false;
                    }
                    else
                    {
                        model.IsEndStage = true;
                    }
                    #endregion
                    var entStage = entitiesCategory.FirstOrDefault(f => f.CategoryId == model.StageNameId);
                    if (entStage != null)
                    {
                        model.StageCode = entStage.CategoryCode;
                        model.StageName = entStage.CategoryName;
                    }
                    var entStageGroup = entitiesCategory.FirstOrDefault(f => f.CategoryId == model.StageGroupId);
                    if (entStageGroup != null)
                    {
                        model.StageGroupCode = entStage.CategoryCode;
                        model.StageGroupName = entStage.CategoryName;
                    }
                    var status = entitiesCategory.FirstOrDefault(f => f.CategoryId == model.StatusId);
                    if (status != null)
                    {
                        model.StatusCode = status.CategoryCode;
                        model.StatusName = status.CategoryName;
                    }
                    if (entOrganization != null)
                    {
                        model.DepartmentCode = entOrganization.OrganizationCode;
                        model.DepartmentName = entOrganization.OrganizationName;
                    }

                    var employeeModels = new List<PersonInChargeModel>();
                    entitiesEmployee.ForEach(item =>{
                        var itemEmployee = new PersonInChargeModel();
                        itemEmployee.EmployeeId = item.EmployeeId;
                        itemEmployee.EmployeeCode = item.EmployeeCode;
                        itemEmployee.EmployeeName = item.EmployeeName;
                        if (string.IsNullOrEmpty(model.PerformerCode))
                        {
                            model.PerformerCode = item.EmployeeCode;
                            model.PerformerName = item.EmployeeName;
                        }
                        else
                        {
                            model.PerformerCode = model.PerformerCode + ", " + item.EmployeeCode;
                            model.PerformerName = model.PerformerName + ", " + item.EmployeeName;
                        }
                        employeeModels.Add(itemEmployee);
                    });
                    model.PersonInChargeModels = employeeModels;

                    var entitiesProductionProcessStageDetail = context.ProductionProcessStageDetail.Where(w => w.ProductionProcessStageId == model.Id).OrderBy(o=>o.Id).ToList();

                    var listProductionProcessStageDetailId = entitiesProductionProcessStageDetail.Select(s => s.Id).ToList();
                    var listConfigStepByStepStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigStepByStepStageId).ToList();
                    var listConfigContentStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigContentStageId).ToList();
                    var listConfigSpecificationsStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigSpecificationsStageId).ToList();

                    var entitiesProductionProcessStageDetailValue = context.ProductionProcessStageDetailValue.Where(w => listProductionProcessStageDetailId.Contains(w.ProductionProcessStageDetailId.Value)).OrderBy(o => o.Id).ToList();
                    var entitiesConfigStepByStepStage = context.ConfigStepByStepStage.Where(w => listConfigStepByStepStageId.Contains(w.Id)).ToList();
                    var entitiesConfigContentStage = context.ConfigContentStage.Where(w => listConfigContentStageId.Contains(w.Id)).ToList();
                    var entitiesConfigSpecificationsStage = context.ConfigSpecificationsStage.Where(w=> listConfigSpecificationsStageId.Contains(w.Id)).ToList();

                    #region List ProductionProcessStageDetail - Chi tiết công đoạn
                    if (entitiesProductionProcessStageDetail != null)
                    {
                        var processStageDetailModels = new List<ProductionProcessStageDetailModel>();
                        entitiesProductionProcessStageDetail.ForEach(ent =>
                        {
                            var item = new ProductionProcessStageDetailModel(ent);

                            var entConfigStepByStepStage = entitiesConfigStepByStepStage.FirstOrDefault(f => f.Id == item.ConfigStepByStepStageId);
                            if (entConfigStepByStepStage != null)
                            {
                                item.StepByStepStageName = entConfigStepByStepStage.Name;
                            }
                            var entConfigContentStage = entitiesConfigContentStage.FirstOrDefault(f => f.Id == item.ConfigContentStageId);
                            if (entConfigContentStage != null)
                            {
                                var entCategory = context.Category.FirstOrDefault(f => f.CategoryId == entConfigContentStage.ContentId);
                                if (entCategory != null)
                                {
                                    item.ContentStageName = entCategory.CategoryName;
                                }
                            }
                            var entConfigSpecificationsStage = entitiesConfigSpecificationsStage.FirstOrDefault(f => f.Id == item.ConfigSpecificationsStageId);
                            if (entConfigSpecificationsStage != null)
                            {
                                var entCategory = context.Category.FirstOrDefault(f => f.CategoryId == entConfigSpecificationsStage.SpecificationsId);
                                if (entCategory != null)
                                {
                                    item.SpecificationsStageName = entCategory.CategoryName;
                                }
                            }
                            //item.ProcessStageDetailValueModels
                            var processStageDetailValueModels = new List<ProductionProcessStageDetailValueModel>();
                            var tempStageDetailValue = entitiesProductionProcessStageDetailValue.Where(w => w.ProductionProcessStageDetailId == item.Id).ToList();
                            if(tempStageDetailValue != null)
                            {
                                tempStageDetailValue.ForEach(entValue =>
                                {
                                    var itemValue = new ProductionProcessStageDetailValueModel(entValue);
                                    var entFieldType = context.Category.FirstOrDefault(f => f.CategoryId == entValue.FieldTypeId);
                                    if(entFieldType!=null)
                                    {
                                        itemValue.FieldTypeCode = entFieldType.CategoryCode;
                                        itemValue.FieldTypeName = entFieldType.CategoryName;
                                    }    
                                    processStageDetailValueModels.Add(itemValue);
                                });
                            }
                            item.ProcessStageDetailValueModels = processStageDetailValueModels;
                            processStageDetailModels.Add(item);
                        });

                        model.ProcessStageDetailModels = processStageDetailModels;
                    }
                    #endregion

                    #region List ProductionProcessErrorStage - Danh sách hạng mục lỗi
                    var entitiesProductionProcessErrorStage = context.ProductionProcessErrorStage.Where(w => w.ProductionProcessStageId == model.Id).ToList();
                    var listErrorItemId = entitiesProductionProcessErrorStage.Select(w => w.ErrorItemId).ToList();
                    var entitiesErrorItem = context.Category.Where(w => listErrorItemId.Contains(w.CategoryId)).ToList();
                    var processErrorStageModels = new List<ProductionProcessErrorStageModel>();

                    entitiesProductionProcessErrorStage.ForEach(entProcessErrorStage =>
                    {
                        var itemProcessErrorStage = new ProductionProcessErrorStageModel(entProcessErrorStage);
                        var entErrorItem = entitiesErrorItem.FirstOrDefault(f => f.CategoryId == itemProcessErrorStage.ErrorItemId);
                        if (entErrorItem != null)
                        {
                            itemProcessErrorStage.ErrorItemCode = entErrorItem.CategoryCode;
                            itemProcessErrorStage.ErrorItemName = entErrorItem.CategoryName;
                        }
                        processErrorStageModels.Add(itemProcessErrorStage);
                    });

                    model.ProcessErrorStageModels= processErrorStageModels;
                    #endregion
                    #region Danh sách NG
                    var entitiesProductionProcessListNg = context.ProductionProcessListNg.Where(w => w.ProductionProcessStageId == model.Id).ToList();
                    var processListNgModels = new List<ProductionProcessListNgModel>();
                    entitiesProductionProcessListNg.ForEach(itemNg =>
                    {
                        var modelNg = new ProductionProcessListNgModel(itemNg);
                        processListNgModels.Add(modelNg);
                    });
                    model.ProcessListNgModels = processListNgModels;
                    #endregion
                    result.Model = model;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        //Lấy danh sách lô đang sản xuất theo userId(employeeId) trong công đoạn sản xuất
        public GetProductionProductByUserIdResult GetProductionProductByUserId(GetProductionProductByUserIdParameter parameter)
        {
            var result = new GetProductionProductByUserIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy danh sách Lô đang sản xuất thành công!",
            };
            try
            {
                Guid? employeeId = null;//Id người thực hiện công đoạn
                List<Guid> statusId = new List<Guid>();//Id trạng thái lô đang sản xuất
                var models = new List<ProductEntityModel>();
                var user = context.User.FirstOrDefault(f => f.UserId == parameter.UserId);
                if (user != null)
                {
                    employeeId = user.EmployeeId;
                }
                #region StatusId Lấy trạng thái lo đang sản xuất ProcessStatusType.LO_PRODUCTION
                var entStatus = context.Category.Where(f => f.CategoryCode == ProcessStatusType.LO_PRODUCTION || f.CategoryCode == ProcessStatusType.LO_BEGIN).ToList();
                if (entStatus != null)
                {
                    statusId = entStatus.Select(s=>s.CategoryId).ToList();
                }
                var entGroupType = context.CategoryType.Where(f => f.CategoryTypeCode == GroupType.STAGE || f.CategoryTypeCode == GroupType.GROUP_STAGE).ToList();
                List<Category> entitiesStages = new List<Category>();
                if (entGroupType != null)
                {
                    var listCategoryTypeId = entGroupType.Select(S => S.CategoryTypeId).ToList();
                    entitiesStages = context.Category.Where(f => listCategoryTypeId.Contains(f.CategoryTypeId)).ToList();
                }
                var entitiesProductionProcessDetail = context.ProductionProcessDetail.Where(w => statusId.Contains(w.StatusId) && (parameter.ProductionProcessDetailId == 0 || w.Id == parameter.ProductionProcessDetailId));
                var listProductId = entitiesProductionProcessDetail.Select(s => s.ProductId).Distinct().ToList();
                var listLotNoId = entitiesProductionProcessDetail.Select(s => s.LotNoId).Distinct().ToList();
                var listProductionProcessDetailId = entitiesProductionProcessDetail.Select(s => s.Id).Distinct().ToList();
                

                var entitiesProduct = context.Product.Where(w => listProductId.Contains(w.ProductId)).ToList();
                var entitiesLotNo = context.LotNo.Where(w => listLotNoId.Contains(w.LotNoId)).ToList();
                var entitiesProductionProcessStage = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)).ToList();
                var listStatusId = entitiesProductionProcessStage.Select(s => s.StatusId).Distinct().ToList();
                var entitiesStatus = context.Category.Where(w => listStatusId.Contains(w.CategoryId)).ToList();

                if (entitiesProduct != null)
                {
                    entitiesProduct.ForEach(ent =>
                    {
                        var item = new ProductEntityModel(ent);
                        var loOfProducts = new List<ProductionProcessDetailModel>();
                        var listLoOfProduct = entitiesProductionProcessDetail.Where(w => w.ProductId == item.ProductId).ToList();
                        if (listLoOfProduct != null)
                        {
                            listLoOfProduct.ForEach(entLo =>
                            {
                                var itemLo = new ProductionProcessDetailModel(entLo);
                                var entLotNo = entitiesLotNo.FirstOrDefault(f => f.LotNoId == itemLo.LotNoId);
                                if (entLotNo != null)
                                {
                                    itemLo.LotNoName = entLotNo.LotNoName;
                                }
                                var entLoStatus = entStatus.FirstOrDefault(f => f.CategoryId == itemLo.StatusId);
                                if (entLoStatus != null)
                                {
                                    itemLo.StatusCode = entLoStatus.CategoryCode;
                                    itemLo.StatusName = entLoStatus.CategoryName;
                                }                               

                                #region Lấy công đoạn sản xuất
                                var listProcessStage = entitiesProductionProcessStage.Where(w => w.ProductionProcessDetailId == itemLo.Id
                                                       && (!employeeId.HasValue || w.PersonInChargeId.Contains(employeeId.Value))).OrderBy(o => o.SortOrder).ToList();//|| w.SelectPersonVerifierId == employeeId.Value || w.SelectStartPerformerId == employeeId || w.SelectEndPerformerId == employeeId
                                var processStageModels = new List<ProductionProcessStageModel>();
                                if (listProcessStage != null)
                                {
                                    listProcessStage.ForEach(entProcessStage =>
                                    {
                                        var itemProcessStage = new ProductionProcessStageModel(entProcessStage);
                                        var entStage = entitiesStages.FirstOrDefault(f => f.CategoryId == itemProcessStage.StageNameId);
                                        if (entStage != null)
                                        {
                                            itemProcessStage.StageCode = entStage.CategoryCode;
                                            itemProcessStage.StageName = entStage.CategoryName;
                                        }
                                        var entStageGroup = entitiesStages.FirstOrDefault(f => f.CategoryId == itemProcessStage.StageGroupId);
                                        if (entStageGroup != null)
                                        {
                                            itemProcessStage.StageGroupCode = entStageGroup.CategoryCode;
                                            itemProcessStage.StageGroupName = entStageGroup.CategoryName;
                                        }
                                        var entStageStatus = entitiesStatus.FirstOrDefault(f => f.CategoryId == itemProcessStage.StatusId);
                                        if (entStageStatus != null)
                                        {
                                            itemProcessStage.StatusCode = entStageStatus.CategoryCode;
                                            itemProcessStage.StatusName = entStageStatus.CategoryName;
                                        }
                                        processStageModels.Add(itemProcessStage);
                                    });
                                }
                                #endregion
                                itemLo.ProcessStageModels = processStageModels;
                                if (processStageModels.Count > 0)
                                {
                                    loOfProducts.Add(itemLo);
                                }
                            });
                        }
                        item.LoProductionProcess = loOfProducts;
                        if (loOfProducts.Count > 0)
                        {
                            models.Add(item);
                        }
                    });
                }
                result.Models = models;
                #endregion

            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetTimeSheetDailyResult GetTimeSheetDaily(GetTimeSheetDailyParameter parameter)
        {
            var result = new GetTimeSheetDailyResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Báo cáo nhân sự theo ngày thành công!",
            };
            try
            {
                var models = new List<TimeSheetModel>();
                var ent = context.TimeSheetDaily.FirstOrDefault(f => f.TimeSheetDate.Date == parameter.TimeSheetDate.Date);
                if (ent != null)
                {
                    var modelCore1 = new TimeSheetModel();
                    modelCore1.Shift = ShiftType.CoreShift1;
                    modelCore1.Nv = ent.Nv1coreCa1;
                    modelCore1.Vm = ent.Vm1coreCa1;
                    modelCore1.Dm = ent.Dm1coreCa1;
                    modelCore1.Vs = ent.Vs1coreCa1;
                    modelCore1.Ot = ent.Ot1coreCa1;
                    modelCore1.User = ent.UserCoreCa1;
                    modelCore1.Gc = ent.Gc1coreCa1;
                    if (modelCore1.User.HasValue)
                    {
                        var entUser = context.User.FirstOrDefault(f=>f.UserId== modelCore1.User.Value);
                        if (entUser != null)
                        {
                            var entEmployee = context.Employee.FirstOrDefault(f=>f.EmployeeId==entUser.EmployeeId);
                            if (entEmployee != null)
                            {
                                modelCore1.UserName = entEmployee.EmployeeName;
                            }
                        }
                    }
                    models.Add(modelCore1);

                    var modelCore2 = new TimeSheetModel();
                    modelCore2.Shift = ShiftType.CoreShift2;
                    modelCore2.Nv = ent.Nv1coreCa2;
                    modelCore2.Vm = ent.Vm1coreCa2;
                    modelCore2.Dm = ent.Dm1coreCa2;
                    modelCore2.Vs = ent.Vs1coreCa2;
                    modelCore2.Ot = ent.Ot1coreCa2;
                    modelCore2.User = ent.UserCoreCa2;
                    modelCore2.Gc = ent.Gc1coreCa2;
                    if (modelCore2.User.HasValue)
                    {
                        var entUser = context.User.FirstOrDefault(f => f.UserId == modelCore2.User.Value);
                        if (entUser != null)
                        {
                            var entEmployee = context.Employee.FirstOrDefault(f => f.EmployeeId == entUser.EmployeeId);
                            if (entEmployee != null)
                            {
                                modelCore2.UserName = entEmployee.EmployeeName;
                            }
                        }
                    }
                    models.Add(modelCore2);

                    var modelCore3 = new TimeSheetModel();
                    modelCore3.Shift = ShiftType.CoreShift3;
                    modelCore3.Nv = ent.Nv1coreCa3;
                    modelCore3.Vm = ent.Vm1coreCa3;
                    modelCore3.Dm = ent.Dm1coreCa3;
                    modelCore3.Vs = ent.Vs1coreCa3;
                    modelCore3.Ot = ent.Ot1coreCa3;
                    modelCore3.User = ent.UserCoreCa3;
                    modelCore3.Gc = ent.Gc1coreCa3;
                    if (modelCore3.User.HasValue)
                    {
                        var entUser = context.User.FirstOrDefault(f => f.UserId == modelCore3.User.Value);
                        if (entUser != null)
                        {
                            var entEmployee = context.Employee.FirstOrDefault(f => f.EmployeeId == entUser.EmployeeId);
                            if (entEmployee != null)
                            {
                                modelCore3.UserName = entEmployee.EmployeeName;
                            }
                        }
                    }
                    models.Add(modelCore3);

                    var modelIsnVisual1 = new TimeSheetModel();
                    modelIsnVisual1.Shift = ShiftType.IsnVisualShift1;
                    modelIsnVisual1.Nv = ent.Nv7isnVisualCa1;
                    modelIsnVisual1.Vm = ent.Vm7isnVisualCa1;
                    modelIsnVisual1.Dm = ent.Dm7isnVisualCa1;
                    modelIsnVisual1.Vs = ent.Vs7isnVisualCa1;
                    modelIsnVisual1.Ot = ent.Ot7isnVisualCa1;
                    modelIsnVisual1.User = ent.UserIsnVisualCa1;
                    modelIsnVisual1.Gc = ent.Gc7isnVisualCa1;
                    if (modelIsnVisual1.User.HasValue)
                    {
                        var entUser = context.User.FirstOrDefault(f => f.UserId == modelIsnVisual1.User.Value);
                        if (entUser != null)
                        {
                            var entEmployee = context.Employee.FirstOrDefault(f => f.EmployeeId == entUser.EmployeeId);
                            if (entEmployee != null)
                            {
                                modelIsnVisual1.UserName = entEmployee.EmployeeName;
                            }
                        }
                    }
                    models.Add(modelIsnVisual1);

                    var modelIsnVisual2 = new TimeSheetModel();
                    modelIsnVisual2.Shift = ShiftType.IsnVisualShift2;
                    modelIsnVisual2.Nv = ent.Nv7isnVisualCa2;
                    modelIsnVisual2.Vm = ent.Vm7isnVisualCa2;
                    modelIsnVisual2.Dm = ent.Dm7isnVisualCa2;
                    modelIsnVisual2.Vs = ent.Vs7isnVisualCa2;
                    modelIsnVisual2.Ot = ent.Ot7isnVisualCa2;
                    modelIsnVisual2.User = ent.UserIsnVisualCa2;
                    modelIsnVisual2.Gc = ent.Gc7isnVisualCa2;
                    if (modelIsnVisual2.User.HasValue)
                    {
                        var entUser = context.User.FirstOrDefault(f => f.UserId == modelIsnVisual2.User.Value);
                        if (entUser != null)
                        {
                            var entEmployee = context.Employee.FirstOrDefault(f => f.EmployeeId == entUser.EmployeeId);
                            if (entEmployee != null)
                            {
                                modelIsnVisual2.UserName = entEmployee.EmployeeName;
                            }
                        }
                    }
                    models.Add(modelIsnVisual2);

                    var modelIsnVisual3 = new TimeSheetModel();
                    modelIsnVisual3.Shift = ShiftType.IsnVisualShift3;
                    modelIsnVisual3.Nv = ent.Nv7isnVisualCa3;
                    modelIsnVisual3.Vm = ent.Vm7isnVisualCa3;
                    modelIsnVisual3.Dm = ent.Dm7isnVisualCa3;
                    modelIsnVisual3.Vs = ent.Vs7isnVisualCa3;
                    modelIsnVisual3.Ot = ent.Ot7isnVisualCa3;
                    modelIsnVisual3.User = ent.UserIsnVisualCa3;
                    modelIsnVisual3.Gc = ent.Gc7isnVisualCa3;
                    if (modelIsnVisual3.User.HasValue)
                    {
                        var entUser = context.User.FirstOrDefault(f => f.UserId == modelIsnVisual3.User.Value);
                        if (entUser != null)
                        {
                            var entEmployee = context.Employee.FirstOrDefault(f => f.EmployeeId == entUser.EmployeeId);
                            if (entEmployee != null)
                            {
                                modelIsnVisual3.UserName = entEmployee.EmployeeName;
                            }
                        }
                    }
                    models.Add(modelIsnVisual3);
                    result.Models = models;
                    result.TimeSheetDate = parameter.TimeSheetDate;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetTimeSheetDailyMonthResult GetTimeSheetDailyMonth(GetTimeSheetDailyMonthParameter parameter)
        {
            var result = new GetTimeSheetDailyMonthResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy báo cáo nhân sự theo tháng thành công",
            };
            try
            {
                var entities = context.TimeSheetDaily.Where(f => f.TimeSheetDate.Year == parameter.TimeSheetDate.Year && f.TimeSheetDate.Month == parameter.TimeSheetDate.Month).OrderBy(o => o.TimeSheetDate).ToList();
                if (entities != null)
                {
                    var models = new List<TimeSheetDailyModel>();
                    entities.ForEach(item =>
                    {
                        var model = new TimeSheetDailyModel(item);
                        models.Add(model);
                    });                    
                    result.Models = models;
                }
                else
                {
                    var model = new TimeSheetDailyModel();
                    model.TimeSheetDate = parameter.TimeSheetDate;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public SaveProductionProcessResult SaveProductionProcess(SaveProductionProcessParameter parameter)
        {
            var result = new SaveProductionProcessResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lưu lệnh sản xuất thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var model = parameter.ProcessModel;
                    if (model != null)
                    {
                        #region Tạo mã lệnh                        
                        model.ProductionCode = DateTime.Now.ToString("ddMMyyyy");
                        #endregion
                        var ent = context.ProductionProcess.FirstOrDefault(f => f.ProductionCode == model.ProductionCode);
                        if (ent == null)
                        {
                            ent = new Entities.ProductionProcess();
                            ent.ProductionCode = model.ProductionCode;
                            ent.Description = model.Description;
                            ent.CreatedBy = parameter.UserId;
                            ent.CreatedDate = DateTime.Now;
                            context.ProductionProcess.Add(ent);
                            context.SaveChanges();
                        }
                        else
                        {
                            ent.Description = model.Description;
                            ent.UpdatedBy = parameter.UserId;
                            ent.UpdatedDate = DateTime.Now;
                            context.ProductionProcess.Update(ent);
                            context.SaveChanges();
                        }
                        model = new ProductionProcessModel(ent);
                        var entUser = context.User.FirstOrDefault(f => f.UserId == model.CreatedBy);
                        if (entUser != null)
                        {
                            model.UserName = entUser.UserName;
                        }
                    }
                    result.Model = model;
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

        public CreateLotNoResult CreateLotNo(CreateLotNoParameter parameter)
        {
            var result = new CreateLotNoResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Tạo Lô sản xuất thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    if (parameter.ProductionProcessId > 0 && parameter.ConfigProductionId > 0 && parameter.ProductNumber > 0 && parameter.ProductId != null)
                    {
                        var entProductionProcess = context.ProductionProcess.FirstOrDefault(f => f.Id == parameter.ProductionProcessId);
                        var entConfigProduction = context.ConfigProduction.FirstOrDefault(f => f.Id == parameter.ConfigProductionId);
                        var entProduct = context.Product.FirstOrDefault(f => f.ProductId == parameter.ProductId);
                        var entStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_NOT_PRODUCED);
                        if (entProductionProcess != null && entConfigProduction != null && entProduct != null)
                        {
                            var oldLotNo = string.Empty;
                            var entOldProductionProcessDetail = context.ProductionProcessDetail.Where(w => w.ProductId == parameter.ProductId && !w.PrentId.HasValue).OrderByDescending(o => o.Id).FirstOrDefault();
                            if (entOldProductionProcessDetail != null)
                            {
                                var entOldLotno = context.LotNo.FirstOrDefault(f => f.LotNoId == entOldProductionProcessDetail.LotNoId);
                                if (entOldLotno != null)
                                {
                                    oldLotNo = entOldLotno.LotNoName;
                                }
                            }
                            var lotNocount = parameter.ProductNumber / entConfigProduction.ProductionNumber + (parameter.ProductNumber % entConfigProduction.ProductionNumber > 0 ? 1 : 0);
                            for (var i = 0; i < lotNocount; i++)
                            {
                                oldLotNo = CreateLotNoName(oldLotNo);
                                var entNewLotNo = new Entities.LotNo();
                                entNewLotNo.LotNoType = 1;
                                entNewLotNo.LotNoName = oldLotNo;
                                context.LotNo.Add(entNewLotNo);
                                context.SaveChanges();

                                var entNewProductionProcessDetail = new Entities.ProductionProcessDetail();
                                entNewProductionProcessDetail.ProductionProcessId = parameter.ProductionProcessId;
                                entNewProductionProcessDetail.ConfigProductionId = parameter.ConfigProductionId;
                                entNewProductionProcessDetail.CustomerName = parameter.CustomerName;
                                entNewProductionProcessDetail.ProductId = parameter.ProductId;
                                entNewProductionProcessDetail.LotNoId = entNewLotNo.LotNoId;
                                entNewProductionProcessDetail.ProductionNumber = parameter.ProductNumber - entConfigProduction.ProductionNumber >= 0 ? entConfigProduction.ProductionNumber : parameter.ProductNumber;
                                entNewProductionProcessDetail.TotalReached = 0;
                                entNewProductionProcessDetail.TotalPending = 0;
                                entNewProductionProcessDetail.StatusId = entStatus.CategoryId;
                                entNewProductionProcessDetail.Ltv = entConfigProduction.Ltv;
                                entNewProductionProcessDetail.Pc = entConfigProduction.Pc;
                                entNewProductionProcessDetail.Description = string.Empty;
                                entNewProductionProcessDetail.IsHaveSubLo = false;
                                entNewProductionProcessDetail.CreatedBy = parameter.UserId;
                                entNewProductionProcessDetail.CreatedDate = DateTime.Now;

                                context.ProductionProcessDetail.Add(entNewProductionProcessDetail);
                                context.SaveChanges();

                                var entProductLotNoMapping = context.ProductLotNoMapping.FirstOrDefault(x => x.ProductId == parameter.ProductId && x.LotNoId == entNewLotNo.LotNoId);
                                if (entProductLotNoMapping == null)
                                {
                                    entProductLotNoMapping = new Entities.ProductLotNoMapping();
                                    entProductLotNoMapping.ProductLotNoMappingId =Guid.NewGuid();
                                    entProductLotNoMapping.ProductId=parameter.ProductId;
                                    entProductLotNoMapping.LotNoId = entNewLotNo.LotNoId;
                                    context.ProductLotNoMapping.Add(entProductLotNoMapping);
                                    context.SaveChanges();
                                }

                                parameter.ProductNumber = parameter.ProductNumber - entConfigProduction.ProductionNumber;
                            }
                        }
                        var getModel = GetProductionProcessById(new GetProductionProcessByIdParameter { Id = parameter.ProductionProcessId, UserId = parameter.UserId });
                        result.Model = getModel.Model;
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
        private string CreateLotNoName(string oldLotNo)
        {
            var result = string.Empty;
            var today = DateTime.Now;
            var nam = today.Year.ToString().Substring(3);
            var month = string.Empty;
            switch (today.Month)
            {
                case 10:
                    month = "X";
                    break;
                case 11:
                    month = "Y";
                    break;
                case 12:
                    month = "Z";
                    break;
                default:
                    month = today.Month.ToString();
                    break;
            }
            if (string.IsNullOrEmpty(oldLotNo))
            {
                result = nam + month + "-A";
            }
            else
            {
                var oldnam = oldLotNo.Substring(0, 1);
                var oldmonth = oldLotNo.Substring(1, 1);
                var oldCharacter = oldLotNo.Substring(3);

                char[] characters = oldCharacter.ToCharArray();
                if (nam == oldnam)
                {
                    if (month == oldmonth)
                    {
                        var endChars = string.Empty;
                        var lenCharacters = characters.Length;
                        var endChar = characters[lenCharacters - 1];
                        if (lenCharacters == 1)
                        {
                            if (endChar == 'Z')
                            {
                                endChars = "AA";
                            }
                            else
                            {
                                endChars = Convert.ToChar(Convert.ToInt32(endChar) + 1).ToString();
                            }
                        }
                        else
                        {
                            var blCheck = false;
                            for (int i = lenCharacters - 1; i >= 0; i--)
                            {
                                if (characters[i] == 'Z')
                                {
                                    endChars = "A" + endChars;
                                }
                                else if (!blCheck)
                                {
                                    endChars = Convert.ToChar(Convert.ToInt32(characters[i]) + 1).ToString() + endChars;
                                    blCheck = true;
                                }
                                else
                                {
                                    endChars = characters[i].ToString() + endChars;
                                }
                            }
                            if (!blCheck)
                            {
                                endChars = "A" + endChars;
                            }
                        }
                        result = nam + month + "-" + endChars;
                    }
                    else
                    {
                        result = nam + month + "-A";
                    }
                }
                else
                {
                    result = nam + month + "-A";
                }
            }
            return result;
        }
        public SaveStatusProductionProcessDetailByIdResult SaveStatusProductionProcessDetailById(SaveStatusProductionProcessDetailByIdParameter parameter)
        {
            var result = new SaveStatusProductionProcessDetailByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Cập nhật bắt đầu lô sản xuất thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var ent = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId);
                    if (ent != null)
                    {
                        var checkStatus = context.Category.FirstOrDefault(f => f.CategoryId == parameter.StatusId);
                        if (checkStatus != null)
                        {
                            ent.StatusId = parameter.StatusId;
                            if (parameter.StartDate != null)
                            {
                                ent.StartDate = parameter.StartDate;
                            }
                            if (parameter.EndDate != null)
                            {
                                ent.EndDate = parameter.EndDate;
                            }
                            if (checkStatus.CategoryCode == ProcessStatusType.LO_BEGIN)
                            {
                                #region Tạo các công đoạn sản xuất
                                var entitiesConfigStage = context.ConfigStage.Where(w => w.ConfigProductionId == ent.ConfigProductionId).ToList();
                                var listConfigStageId = entitiesConfigStage.Select(s => s.Id).ToList();

                                var entitiesConfigContentStage = context.ConfigContentStage.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                var entitiesConfigErrorItem = context.ConfigErrorItem.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                var entitiesConfigStepByStepStage = context.ConfigStepByStepStage.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();

                                var entitiesConfigSpecificationsStage = context.ConfigSpecificationsStage.Where(w => listConfigStageId.Contains(w.ConfigStageId)).ToList();
                                var listConfigSpecificationsStageId = entitiesConfigSpecificationsStage.Select(s => s.Id).ToList();

                                var entitiesConfigSpecificationsStageValue = context.ConfigSpecificationsStageValue.Where(w => listConfigSpecificationsStageId.Contains(w.ConfigSpecificationsStageId)).ToList();

                                var entProcessStageStatusType = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStageStatusType.STAGE_NOT_BEGIN);
                                entitiesConfigStage.ForEach(entStage =>
                                {
                                    var entProductionProcessStage = new ProductionProcessStage();
                                    entProductionProcessStage.ProductionProcessDetailId = ent.Id;
                                    entProductionProcessStage.ConfigStageId = entStage.Id;
                                    entProductionProcessStage.StageNameId = entStage.StageNameId;
                                    entProductionProcessStage.StageGroupId = entStage.StageGroupId;
                                    entProductionProcessStage.NumberPeople = entStage.NumberPeople;
                                    entProductionProcessStage.DepartmentId = entStage.DepartmentId;
                                    entProductionProcessStage.PersonInChargeId = entStage.PersonInChargeId;
                                    entProductionProcessStage.PersonVerifierId = entStage.PersonVerifierId;
                                    entProductionProcessStage.IsStageWithoutNg = entStage.IsStageWithoutNg;
                                    entProductionProcessStage.IsStageWithoutProduct = entStage.IsStageWithoutProduct;
                                    entProductionProcessStage.Binding = entStage.Binding;
                                    entProductionProcessStage.PreviousStageNameId = entStage.PreviousStageNameId;
                                    entProductionProcessStage.FromTime = entStage.FromTime;
                                    entProductionProcessStage.ToTime = entStage.ToTime;
                                    entProductionProcessStage.SortOrder = entStage.SortOrder;
                                    entProductionProcessStage.Availability = false;
                                    entProductionProcessStage.TotalProduction = ent.ProductionNumber;
                                    entProductionProcessStage.TotalReached = 0;
                                    entProductionProcessStage.TotalPending = 0;
                                    entProductionProcessStage.TotalNotReached = 0;
                                    entProductionProcessStage.TotalReuse = 0;
                                    entProductionProcessStage.TotalCancel = 0;
                                    entProductionProcessStage.StatusId = entProcessStageStatusType.CategoryId;
                                    entProductionProcessStage.CreatedDate = DateTime.Now;
                                    entProductionProcessStage.CreatedBy = parameter.UserId;

                                    context.ProductionProcessStage.Add(entProductionProcessStage);
                                    context.SaveChanges();

                                    var entitiesAddConfigSpecificationsStage = entitiesConfigSpecificationsStage.Where(w => w.ConfigStageId == entProductionProcessStage.ConfigStageId).OrderBy(o => o.Id).ToList();
                                    entitiesAddConfigSpecificationsStage.ForEach(entSpecificationsStage =>
                                    {
                                        var entProductionProcessStageDetail = new ProductionProcessStageDetail();
                                        entProductionProcessStageDetail.ProductionProcessStageId = entProductionProcessStage.Id;
                                        entProductionProcessStageDetail.ConfigStepByStepStageId = entSpecificationsStage.ConfigStepByStepStageId;
                                        entProductionProcessStageDetail.ConfigContentStageId = entSpecificationsStage.ConfigContentStageId;
                                        entProductionProcessStageDetail.ConfigSpecificationsStageId = entSpecificationsStage.Id;
                                        entProductionProcessStageDetail.SpecificationsId = entSpecificationsStage.SpecificationsId;
                                        entProductionProcessStageDetail.IsHaveValues = entSpecificationsStage.IsHaveValues;
                                        entProductionProcessStageDetail.NumberOfSamples = entSpecificationsStage.NumberOfSamples;
                                        var entStepByStepStage = entitiesConfigStepByStepStage.FirstOrDefault(f => f.Id == entSpecificationsStage.ConfigStepByStepStageId);
                                        if (entStepByStepStage != null)
                                        {
                                            entProductionProcessStageDetail.IsShowTextBox = entStepByStepStage.IsShowTextBox;
                                        }
                                        var entContentStage = entitiesConfigContentStage.FirstOrDefault(f => f.Id == entSpecificationsStage.ConfigContentStageId);
                                        if (entContentStage != null)
                                        {
                                            entProductionProcessStageDetail.IsContentValues = entContentStage.IsContentValues;
                                        }
                                        entProductionProcessStageDetail.CreatedBy = parameter.UserId;
                                        entProductionProcessStageDetail.CreatedDate = DateTime.Now;
                                        context.ProductionProcessStageDetail.Add(entProductionProcessStageDetail);
                                        context.SaveChanges();

                                        var entitiesAddConfigSpecificationsStageValue = entitiesConfigSpecificationsStageValue.Where(w => w.ConfigSpecificationsStageId == entProductionProcessStageDetail.ConfigSpecificationsStageId).OrderBy(o => o.Id).ToList();
                                        entitiesAddConfigSpecificationsStageValue.ForEach(entSpecificationsStageValue =>
                                        {
                                            var entProductionProcessStageDetailValue = new ProductionProcessStageDetailValue();
                                            entProductionProcessStageDetailValue.ProductionProcessStageDetailId = entProductionProcessStageDetail.Id;
                                            entProductionProcessStageDetailValue.FieldTypeId = entSpecificationsStageValue.FieldTypeId;
                                            entProductionProcessStageDetailValue.FirstName = entSpecificationsStageValue.FirstName;
                                            entProductionProcessStageDetailValue.LastName = entSpecificationsStageValue.LastName;
                                            entProductionProcessStageDetailValue.LineOrder = entSpecificationsStageValue.LineOrder;
                                            entProductionProcessStageDetailValue.SortLineOrder = entSpecificationsStageValue.SortLineOrder;
                                            entProductionProcessStageDetailValue.ProductId = entSpecificationsStageValue.ProductId;
                                            entProductionProcessStageDetailValue.InfoFormula = entSpecificationsStageValue.InfoFormula;
                                            entProductionProcessStageDetailValue.Formula = entSpecificationsStageValue.Formula;
                                            entProductionProcessStageDetailValue.FormulaValue = entSpecificationsStageValue.FormulaValue;

                                            entProductionProcessStageDetailValue.CreatedBy = parameter.UserId;
                                            entProductionProcessStageDetailValue.CreatedDate = DateTime.Now;

                                            context.ProductionProcessStageDetailValue.Add(entProductionProcessStageDetailValue);
                                            context.SaveChanges();
                                        });
                                    });

                                    var entitiesAddConfigErrorItem = entitiesConfigErrorItem.Where(w => w.ConfigStageId == entProductionProcessStage.ConfigStageId).ToList();
                                    entitiesAddConfigErrorItem.ForEach(entErrorItem =>
                                    {
                                        var entProductionProcessErrorStage = new ProductionProcessErrorStage();
                                        entProductionProcessErrorStage.ProductionProcessStageId = entProductionProcessStage.Id;
                                        entProductionProcessErrorStage.StageGroupId = entProductionProcessStage.StageGroupId;
                                        entProductionProcessErrorStage.ErrorItemId = entErrorItem.ErrorItemId;
                                        entProductionProcessErrorStage.CreatedBy = parameter.UserId;
                                        entProductionProcessErrorStage.CreatedDate = DateTime.Now;
                                        context.ProductionProcessErrorStage.Add(entProductionProcessErrorStage);
                                        context.SaveChanges();
                                    });
                                    
                                });
                                #endregion
                                ent.StartDate = DateTime.Now;
                            }
                            else if (checkStatus.CategoryCode == ProcessStatusType.LO_PAUSE)
                            {
                                ent.EndDate = DateTime.Now;
                            }
                            else if (checkStatus.CategoryCode == ProcessStatusType.LO_PRODUCTION)
                            {

                            }

                            ent.UpdatedBy = parameter.UserId;
                            ent.UpdatedDate = DateTime.Now;
                            context.ProductionProcessDetail.Update(ent);
                            context.SaveChanges();
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

        public SaveTimeSheetDailyResult SaveTimeSheetDaily(SaveTimeSheetDailyParameter parameter)
        {
            var result = new SaveTimeSheetDailyResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lưu báo cáo nhân sự thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var models = parameter.Models;
                    var ent = context.TimeSheetDaily.FirstOrDefault(f => f.TimeSheetDate.Date == parameter.TimeSheetDate.Date);
                    if (ent == null)
                    {
                        ent = new TimeSheetDaily();
                        ent.TimeSheetDate = parameter.TimeSheetDate;
                        foreach(var item in models)
                        {
                            switch(item.Shift)
                            {
                                case ShiftType.CoreShift1:
                                    ent.Nv1coreCa1 = item.Nv;
                                    ent.Vm1coreCa1 = item.Vm;
                                    ent.Dm1coreCa1 = item.Dm;
                                    ent.Vs1coreCa1 = item.Vs;
                                    ent.Ot1coreCa1 = item.Ot;
                                    ent.Gc1coreCa1 = item.Gc;
                                    ent.UserCoreCa1 = item.User;
                                    break;
                                case ShiftType.CoreShift2:
                                    ent.Nv1coreCa2 = item.Nv;
                                    ent.Vm1coreCa2 = item.Vm;
                                    ent.Dm1coreCa2 = item.Dm;
                                    ent.Vs1coreCa2 = item.Vs;
                                    ent.Ot1coreCa2 = item.Ot;
                                    ent.Gc1coreCa2 = item.Gc;
                                    ent.UserCoreCa2 = item.User;
                                    break;
                                case ShiftType.CoreShift3:
                                    ent.Nv1coreCa3 = item.Nv;
                                    ent.Vm1coreCa3 = item.Vm;
                                    ent.Dm1coreCa3 = item.Dm;
                                    ent.Vs1coreCa3 = item.Vs;
                                    ent.Ot1coreCa3 = item.Ot;
                                    ent.Gc1coreCa3 = item.Gc;
                                    ent.UserCoreCa3 = item.User;
                                    break;
                                case ShiftType.IsnVisualShift1:
                                    ent.Nv7isnVisualCa1 = item.Nv;
                                    ent.Vm7isnVisualCa1 = item.Vm;
                                    ent.Dm7isnVisualCa1 = item.Dm;
                                    ent.Vs7isnVisualCa1 = item.Vs;
                                    ent.Ot7isnVisualCa1 = item.Ot;
                                    ent.Gc7isnVisualCa1 = item.Gc;
                                    ent.UserIsnVisualCa1 = item.User;
                                    break;
                                case ShiftType.IsnVisualShift2:
                                    ent.Nv7isnVisualCa2 = item.Nv;
                                    ent.Vm7isnVisualCa2 = item.Vm;
                                    ent.Dm7isnVisualCa2 = item.Dm;
                                    ent.Vs7isnVisualCa2 = item.Vs;
                                    ent.Ot7isnVisualCa2 = item.Ot;
                                    ent.Gc7isnVisualCa2 = item.Gc;
                                    ent.UserIsnVisualCa2 = item.User;
                                    break;
                                case ShiftType.IsnVisualShift3:
                                    ent.Nv7isnVisualCa3 = item.Nv;
                                    ent.Vm7isnVisualCa3 = item.Vm;
                                    ent.Dm7isnVisualCa3 = item.Dm;
                                    ent.Vs7isnVisualCa3 = item.Vs;
                                    ent.Ot7isnVisualCa3 = item.Ot;
                                    ent.Gc7isnVisualCa3 = item.Gc;
                                    ent.UserIsnVisualCa3 = item.User;
                                    break;
                            }
                        }
                        context.TimeSheetDaily.Add(ent);
                        context.SaveChanges();
                    }
                    else
                    {
                        foreach (var item in models)
                        {
                            switch (item.Shift)
                            {
                                case ShiftType.CoreShift1:
                                    ent.Nv1coreCa1 = item.Nv;
                                    ent.Vm1coreCa1 = item.Vm;
                                    ent.Dm1coreCa1 = item.Dm;
                                    ent.Vs1coreCa1 = item.Vs;
                                    ent.Ot1coreCa1 = item.Ot;
                                    ent.Gc1coreCa1 = item.Gc;
                                    ent.UserCoreCa1 = item.User;
                                    break;
                                case ShiftType.CoreShift2:
                                    ent.Nv1coreCa2 = item.Nv;
                                    ent.Vm1coreCa2 = item.Vm;
                                    ent.Dm1coreCa2 = item.Dm;
                                    ent.Vs1coreCa2 = item.Vs;
                                    ent.Ot1coreCa2 = item.Ot;
                                    ent.Gc1coreCa2 = item.Gc;
                                    ent.UserCoreCa2 = item.User;
                                    break;
                                case ShiftType.CoreShift3:
                                    ent.Nv1coreCa3 = item.Nv;
                                    ent.Vm1coreCa3 = item.Vm;
                                    ent.Dm1coreCa3 = item.Dm;
                                    ent.Vs1coreCa3 = item.Vs;
                                    ent.Ot1coreCa3 = item.Ot;
                                    ent.Gc1coreCa3 = item.Gc;
                                    ent.UserCoreCa3 = item.User;
                                    break;
                                case ShiftType.IsnVisualShift1:
                                    ent.Nv7isnVisualCa1 = item.Nv;
                                    ent.Vm7isnVisualCa1 = item.Vm;
                                    ent.Dm7isnVisualCa1 = item.Dm;
                                    ent.Vs7isnVisualCa1 = item.Vs;
                                    ent.Ot7isnVisualCa1 = item.Ot;
                                    ent.Gc7isnVisualCa1 = item.Gc;
                                    ent.UserIsnVisualCa1 = item.User;
                                    break;
                                case ShiftType.IsnVisualShift2:
                                    ent.Nv7isnVisualCa2 = item.Nv;
                                    ent.Vm7isnVisualCa2 = item.Vm;
                                    ent.Dm7isnVisualCa2 = item.Dm;
                                    ent.Vs7isnVisualCa2 = item.Vs;
                                    ent.Ot7isnVisualCa2 = item.Ot;
                                    ent.Gc7isnVisualCa2 = item.Gc;
                                    ent.UserIsnVisualCa2 = item.User;
                                    break;
                                case ShiftType.IsnVisualShift3:
                                    ent.Nv7isnVisualCa3 = item.Nv;
                                    ent.Vm7isnVisualCa3 = item.Vm;
                                    ent.Dm7isnVisualCa3 = item.Dm;
                                    ent.Vs7isnVisualCa3 = item.Vs;
                                    ent.Ot7isnVisualCa3 = item.Ot;
                                    ent.Gc7isnVisualCa3 = item.Gc;
                                    ent.UserIsnVisualCa3 = item.User;
                                    break;
                            }
                        }
                        context.TimeSheetDaily.Update(ent);
                        context.SaveChanges();
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

        public SaveProductionProcessErrorStageResult SaveProductionProcessErrorStage(SaveProductionProcessErrorStageParameter parameter)
        {
            var result = new SaveProductionProcessErrorStageResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lưu danh mục lỗi thành  công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    if (parameter.ProcessErrorStageModels != null)
                    {
                        var listId = parameter.ProcessErrorStageModels.Select(s => s.Id).ToList();
                        var entities = context.ProductionProcessErrorStage.Where(w => listId.Contains(w.Id)).ToList();
                        entities.ForEach(ent =>
                        {
                            var item = parameter.ProcessErrorStageModels.FirstOrDefault(f => f.Id == ent.Id);
                            if (item != null)
                            {
                                ent.ErrorNumber = item.ErrorNumber;
                                ent.UpdatedBy = parameter.UserId;
                                ent.UpdatedDate = DateTime.Now;
                            }
                        });
                        context.ProductionProcessErrorStage.UpdateRange(entities);
                        context.SaveChanges();
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

        public SaveProductionProcessStageResult SaveProductionProcessStage(SaveProductionProcessStageParameter parameter)
        {
            var result = new SaveProductionProcessStageResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lưu công đoạn thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    if (parameter.Model != null)
                    {
                        var ent = context.ProductionProcessStage.FirstOrDefault(f => f.Id == parameter.Model.Id);
                        if (ent != null)
                        {
                            //ent.SelectPersonInChargeId = parameter.Model.SelectPersonInChargeId;
                            ent.SelectImplementationDate = parameter.Model.SelectImplementationDate;
                            ent.SelectStartPerformerId = parameter.Model.SelectStartPerformerId;
                            ent.SelectEndPerformerId = parameter.Model.SelectEndPerformerId;
                            ent.IsStageWithoutNg = parameter.Model.IsStageWithoutNg;
                            ent.Alert = parameter.Model.Alert;
                            ent.StartDate = parameter.Model.StartDate;
                            ent.EndDate = parameter.Model.EndDate;
                            ent.TotalReached = parameter.Model.TotalReached;
                            ent.TotalPending = parameter.Model.TotalPending;
                            ent.TotalNotReached = parameter.Model.TotalReuse + parameter.Model.TotalCancel;
                            ent.TotalReuse = parameter.Model.TotalReuse;
                            ent.TotalCancel = parameter.Model.TotalCancel;
                            ent.StatusId = parameter.Model.StatusId;
                            ent.Availability = parameter.Model.Availability;
                            ent.UpdatedBy = parameter.UserId;
                            ent.UpdatedDate = DateTime.Now;
                            context.ProductionProcessStage.Update(ent);
                            context.SaveChanges();
                            if (parameter.Model.ProcessStageDetailModels != null)
                            {
                                var listProcessStageDetailId = parameter.Model.ProcessStageDetailModels.Select(s => s.Id).ToList();
                                var entitiesProcessStageDetail = context.ProductionProcessStageDetail.Where(w => listProcessStageDetailId.Contains(w.Id)).ToList();
                                var entitiesProductionProcessStageDetailValue = context.ProductionProcessStageDetailValue.Where(w => listProcessStageDetailId.Contains(w.ProductionProcessStageDetailId.Value)).ToList();

                                entitiesProcessStageDetail.ForEach(entProcessStageDetail =>
                                {
                                    var itemProcessStageDetail = parameter.Model.ProcessStageDetailModels.FirstOrDefault(f => f.Id == entProcessStageDetail.Id);
                                    if (itemProcessStageDetail != null)
                                    {
                                        entProcessStageDetail.SpecificationsStageValues = itemProcessStageDetail.SpecificationsStageValues;
                                        entProcessStageDetail.NewNumberOfSamples = itemProcessStageDetail.NewNumberOfSamples;
                                        entProcessStageDetail.MachineNumber = itemProcessStageDetail.MachineNumber;
                                        entProcessStageDetail.ContenValues = itemProcessStageDetail.ContenValues;
                                        entProcessStageDetail.UpdatedBy = parameter.UserId;
                                        entProcessStageDetail.UpdatedDate = DateTime.Now;

                                        var entitiesChild = entitiesProductionProcessStageDetailValue.Where(w => w.ProductionProcessStageDetailId == itemProcessStageDetail.Id).ToList();
                                        entitiesChild.ForEach(entProcessStageDetailValue =>
                                        {
                                            var itemProcessStageDetailValue = itemProcessStageDetail.ProcessStageDetailValueModels.FirstOrDefault(f => f.Id == entProcessStageDetailValue.Id);
                                            if (itemProcessStageDetailValue != null)
                                            {
                                                entProcessStageDetailValue.Value = itemProcessStageDetailValue.Value;
                                                entProcessStageDetailValue.UpdatedBy = parameter.UserId;
                                                entProcessStageDetailValue.UpdatedDate = DateTime.Now;
                                            }
                                        });
                                    }
                                });
                                context.ProductionProcessStageDetail.UpdateRange(entitiesProcessStageDetail);
                                context.ProductionProcessStageDetailValue.UpdateRange(entitiesProductionProcessStageDetailValue);
                                context.SaveChanges();
                            }
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

        public GetProductInputByProductionProcessStageIdResult GetProductInputByProductionProcessStageId(GetProductInputByProductionProcessStageIdParameter parameter)
        {
            var result = new GetProductInputByProductionProcessStageIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy danh sách nguyên vật liệu đầu vào công đoạn thành công!",
            };
            try
            {
                var models =new List<ProductionProcessStageProductInputModel>();
                var entProductionProcessStage = context.ProductionProcessStage.FirstOrDefault(f => f.Id == parameter.ProductionProcessStageId);
                if (entProductionProcessStage!=null && parameter.WarehouseId !=null)
                {
                    var listProductId = context.ConfigStageProductInput.Where(w => w.ConfigStageId == entProductionProcessStage.ConfigStageId).Select(s => s.ProductId).ToList();
                    var entitiesProduct = context.Product.Where(w => listProductId.Contains(w.ProductId)).Select(s => new { s.ProductId, s.ProductCode, s.ProductName, s.ProductUnitId }).ToList();
                    var listProductUnitId = entitiesProduct.Select(s => s.ProductUnitId).Distinct().ToList();
                    var entitiesProductUnit = context.Category.Where(w => listProductUnitId.Contains(w.CategoryId)).ToList();

                    var entitiesInventoryReport = context.InventoryReport.Where(w => w.WarehouseId == parameter.WarehouseId && listProductId.Contains(w.ProductId))
                                   .Select(s => new { s.WarehouseId, s.ProductId, s.LotNoId }).Distinct().ToList();
                    if(entitiesInventoryReport!=null)
                    {
                        entitiesInventoryReport.ForEach(item =>
                        {
                            var model = new ProductionProcessStageProductInputModel();
                            model.ProductionProcessStageId = parameter.ProductionProcessStageId;
                            model.ProductId = item.ProductId;
                            var entProduct = entitiesProduct.FirstOrDefault(f => f.ProductId == item.ProductId);
                            if(entProduct!=null) 
                            {
                                model.ProductCode = entProduct.ProductCode;
                                model.ProductName = entProduct.ProductName;
                                var entProductUnit = entitiesProductUnit.FirstOrDefault(f => f.CategoryId == entProduct.ProductUnitId);
                                if (entProductUnit != null)
                                {
                                    model.ProductUnitName = entProductUnit.CategoryName;
                                }
                            }                            
                            model.LotNoId= item.LotNoId.Value;
                            var entLotNo = context.LotNo.FirstOrDefault(f => f.LotNoId == item.LotNoId.Value);
                            if (entLotNo != null)
                            {
                                model.LotNoName = entLotNo.LotNoName;
                            }
                            var entInventory = context.InventoryReport.Where(w => w.ProductId == item.ProductId && w.WarehouseId == parameter.WarehouseId && w.LotNoId == item.LotNoId).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
                            if (entInventory != null)
                            {
                                model.InventoryNumber = (entInventory.StartQuantity + entInventory.QuantityReceiving) - entInventory.QuantityDelivery;
                            }
                            else
                            {
                                model.InventoryNumber = 0;
                            }
                            model.ProductionNumber = 0;
                            model.WarehouseId= item.WarehouseId;
                            models.Add(model);
                        });                        
                    }    
                }
                result.Models = models;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }
        //Xác nhận: Bắt đầu công đoạn sản xuất
        public ConfirmProductInputByProductionProcessStageIdResult ConfirmProductInputByProductionProcessStageId(ConfirmProductInputByProductionProcessStageIdParameter parameter)
        {
            var result = new ConfirmProductInputByProductionProcessStageIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Xác nhận bắt đầu công đoạn sản xuất thành công!",
            }; 
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entProductionProcessStage = context.ProductionProcessStage.FirstOrDefault(f => f.Id == parameter.ProductionProcessStageId);

                    var wareHouse = context.Warehouse.FirstOrDefault(c => c.WarehouseId == parameter.WarehouseId);
                    var wareHouseType = context.Category.FirstOrDefault(w => w.CategoryId == wareHouse.WareHouseType).CategoryCode;

                    var models = parameter.Models;
                    if (entProductionProcessStage != null)
                    {
                        #region Tạo phiếu xuất kho và cập nhật bảng tồn kho
                        if (models != null && models.Count > 0)
                        {
                            var entitiesProductInput = new List<Entities.ProductionProcessStageProductInput>();
                            models.ForEach(item =>
                            {
                                var ent = new Entities.ProductionProcessStageProductInput();
                                ent.ProductionProcessStageId = parameter.ProductionProcessStageId;
                                ent.ProductId = item.ProductId;
                                ent.LotNoId = item.LotNoId;
                                ent.ProductionNumber = item.ProductionNumber;
                                ent.WarehouseId = parameter.WarehouseId;
                                ent.CreatedBy = parameter.UserId;
                                ent.CreatedDate = DateTime.Now;
                                ent.UpdatedBy = parameter.UserId;
                                ent.UpdatedDate = DateTime.Now;
                                entitiesProductInput.Add(ent);
                            });
                            context.ProductionProcessStageProductInput.AddRange(entitiesProductInput);
                            context.SaveChanges();
                            #region Trạng nhập kho    
                            Guid deliveryStatusId = Guid.NewGuid();
                            var entCategoryType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == WarehouseTicketType.DELIVERY_TYPE);
                            if (entCategoryType != null)
                            {
                                var entCategory = context.Category.FirstOrDefault(w => w.CategoryTypeId == entCategoryType.CategoryTypeId && w.CategoryCode == WarehouseDeliveryStatus.OUT_OF_STOCK_TYPE);
                                if (entCategory != null)
                                {
                                    deliveryStatusId = entCategory.CategoryId;
                                }
                            }
                            #endregion

                            var stt = context.ProductionProcessStageImportExport.Where(w => w.ProductionProcessDetailId == entProductionProcessStage.ProductionProcessDetailId && w.IsExport == true).Count();
                            var entInventoryDeliveryVoucher = new Entities.InventoryDeliveryVoucher();
                            entInventoryDeliveryVoucher.InventoryDeliveryVoucherId = Guid.NewGuid();
                            entInventoryDeliveryVoucher.InventoryDeliveryVoucherCode = "PX" + DateTime.Now.ToString("ddMMyyyy") + (stt + 1).ToString();
                            entInventoryDeliveryVoucher.StatusId = deliveryStatusId;//trạng thái
                            entInventoryDeliveryVoucher.InventoryDeliveryVoucherType = (int)InventoryDeliveryVoucherType.XSX;
                            entInventoryDeliveryVoucher.WarehouseId = parameter.WarehouseId;//Kho xuất
                            entInventoryDeliveryVoucher.Reason = string.Empty;
                            entInventoryDeliveryVoucher.InventoryDeliveryVoucherDate = DateTime.Now;
                            entInventoryDeliveryVoucher.InventoryDeliveryVoucherTime = DateTime.Now.TimeOfDay;
                            entInventoryDeliveryVoucher.Active = true;
                            entInventoryDeliveryVoucher.CreatedDate = DateTime.Now;
                            entInventoryDeliveryVoucher.CreatedById = parameter.UserId;
                            entInventoryDeliveryVoucher.UpdatedDate = DateTime.Now;
                            entInventoryDeliveryVoucher.UpdatedById = parameter.UserId;
                            entInventoryDeliveryVoucher.Description = string.Empty;
                            entInventoryDeliveryVoucher.InventoryDeliveryVoucherScreenType = wareHouseType == "KTP" ? (int)ScreenType.TP : ((wareHouseType == "CSX" || wareHouseType == "TSK") ? (int)ScreenType.SX : (int)ScreenType.NVL);
                            entInventoryDeliveryVoucher.Note = string.Empty;
                            context.InventoryDeliveryVoucher.Add(entInventoryDeliveryVoucher);
                            context.SaveChanges();

                            var entitiesInventoryDeliveryVoucherMapping = new List<Entities.InventoryDeliveryVoucherMapping>();
                            models.ForEach(item =>
                            {
                                var entInventoryDeliveryVoucherMapping = new Entities.InventoryDeliveryVoucherMapping();
                                entInventoryDeliveryVoucherMapping.InventoryDeliveryVoucherMappingId = Guid.NewGuid();
                                entInventoryDeliveryVoucherMapping.InventoryDeliveryVoucherId = entInventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                                entInventoryDeliveryVoucherMapping.ProductId = item.ProductId;
                                entInventoryDeliveryVoucherMapping.LotNoId = item.LotNoId;
                                entInventoryDeliveryVoucherMapping.QuantityDelivery = item.ProductionNumber;
                                entInventoryDeliveryVoucherMapping.QuantityRequest = 0;
                                entInventoryDeliveryVoucherMapping.QuantityInventory = 0;
                                entInventoryDeliveryVoucherMapping.WarehouseId = item.WarehouseId.Value;
                                entInventoryDeliveryVoucherMapping.Description = string.Empty;
                                entInventoryDeliveryVoucherMapping.Active = true;
                                entInventoryDeliveryVoucherMapping.CreatedDate = DateTime.Now;
                                entInventoryDeliveryVoucherMapping.CreatedById = parameter.UserId;
                                entInventoryDeliveryVoucherMapping.UpdatedDate = DateTime.Now;
                                entInventoryDeliveryVoucherMapping.UpdatedById = parameter.UserId;
                                entitiesInventoryDeliveryVoucherMapping.Add(entInventoryDeliveryVoucherMapping);
                                #region Cập nhật kho
                                UpdateInventoryReport(item.ProductId, item.LotNoId, item.WarehouseId.Value, parameter.UserId, entInventoryDeliveryVoucher.InventoryDeliveryVoucherDate.Value,
                                                        0, item.ProductionNumber);
                                #endregion
                            });
                            context.InventoryDeliveryVoucherMapping.AddRange(entitiesInventoryDeliveryVoucherMapping);
                            context.SaveChanges();

                            var entProductionProcessStageImportExport = new Entities.ProductionProcessStageImportExport();
                            entProductionProcessStageImportExport.ProductionProcessDetailId = entProductionProcessStage.ProductionProcessDetailId;
                            entProductionProcessStageImportExport.ProductionProcessStageId = entProductionProcessStage.Id;
                            entProductionProcessStageImportExport.InventoryVoucherId = entInventoryDeliveryVoucher.InventoryDeliveryVoucherId;
                            entProductionProcessStageImportExport.InventoryVoucherCode = entInventoryDeliveryVoucher.InventoryDeliveryVoucherCode;
                            entProductionProcessStageImportExport.WarehouseId = entInventoryDeliveryVoucher.WarehouseId;
                            entProductionProcessStageImportExport.InventoryVoucherDate = entInventoryDeliveryVoucher.InventoryDeliveryVoucherDate.Value;
                            entProductionProcessStageImportExport.StageNameId = entProductionProcessStage.StageNameId.Value;
                            entProductionProcessStageImportExport.IsExport = true;
                            context.ProductionProcessStageImportExport.Add(entProductionProcessStageImportExport);
                            context.SaveChanges();
                        }
                        #endregion

                        #region cập nhật trạng thái công đoạn
                        var entCategoryTypeStageStatus = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStageStatus);
                        if (entCategoryTypeStageStatus != null)
                        {
                            var entStageStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStageStatusType.STAGE_BEGIN);
                            if (entStageStatus != null)
                            {
                                if(parameter.SelectImplementationDate!=null && parameter.SelectImplementationDate.Length > 0)
                                {
                                    entProductionProcessStage.StartDate = parameter.SelectImplementationDate.Min(date => date);
                                    entProductionProcessStage.SelectImplementationDate = parameter.SelectImplementationDate;
                                }
                                else
                                {
                                    entProductionProcessStage.StartDate = DateTime.Now;
                                    entProductionProcessStage.SelectImplementationDate = new DateTime[] { entProductionProcessStage.StartDate.Value };
                                }                               
                                entProductionProcessStage.StatusId = entStageStatus.CategoryId;
                                entProductionProcessStage.UpdatedBy = parameter.UserId;
                                entProductionProcessStage.UpdatedDate = DateTime.Now;
                                context.ProductionProcessStage.Update(entProductionProcessStage);
                                context.SaveChanges();

                                var ListProductionProcessStageDetailId = context.ProductionProcessStageDetail.Where(f => f.ProductionProcessStageId == entProductionProcessStage.Id).Select(s=>s.Id).ToList();
                                var entitiesProductionProcessStageDetailValues = context.ProductionProcessStageDetailValue.Where(f => ListProductionProcessStageDetailId.Contains(f.ProductionProcessStageDetailId.Value) && f.ProductId.HasValue).ToList();

                                var entitiesProductionProcessStageDetail = context.ProductionProcessStageDetail.Where(w => w.ProductionProcessStageId == entProductionProcessStage.Id).OrderBy(o => o.Id).ToList();
                                var listConfigSpecificationsStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigSpecificationsStageId).ToList();
                                var entitiesConfigSpecificationsStage = context.ConfigSpecificationsStage.Where(w => listConfigSpecificationsStageId.Contains(w.Id)).ToList();

                                entitiesProductionProcessStageDetailValues.ForEach(itemValue =>
                                {
                                    if (itemValue.InfoFormula.HasValue)
                                    {
                                        if(itemValue.InfoFormula.Value == (int)InfoFormulaType.LotNo)
                                        {
                                            var listProductName = models.Where(f => f.ProductId == itemValue.ProductId.Value).Select(s => s.LotNoName).ToList();                                            
                                            itemValue.Value = string.Join(",", listProductName);
                                        }
                                        else if (itemValue.Formula.HasValue)
                                        {
                                            var totalNumber = models.Where(f => f.ProductId == itemValue.ProductId.Value).Sum(s => s.ProductionNumber);
                                            switch ((FormulaType)itemValue.Formula.Value) 
                                            {
                                                case FormulaType.Add:
                                                    if (itemValue.FormulaValue.HasValue)
                                                    {
                                                        itemValue.Value = (totalNumber + itemValue.FormulaValue.Value).ToString();
                                                    }
                                                    break;
                                                case FormulaType.Sub:
                                                    if (itemValue.FormulaValue.HasValue)
                                                    {
                                                        itemValue.Value = (totalNumber - itemValue.FormulaValue.Value).ToString();
                                                    }
                                                    break;
                                                case FormulaType.Multi:
                                                    if (itemValue.FormulaValue.HasValue)
                                                    {
                                                        itemValue.Value = (totalNumber * itemValue.FormulaValue.Value).ToString();
                                                    }
                                                    break;
                                                case FormulaType.Div:
                                                    if (itemValue.FormulaValue.HasValue)
                                                    {
                                                        itemValue.Value = (totalNumber / itemValue.FormulaValue.Value).ToString();
                                                    }
                                                    break;
                                            }
                                        }
                                    }
                                    
                                });
                                context.ProductionProcessStageDetail.Where(f => f.ProductionProcessStageId == entProductionProcessStage.Id).ToList().ForEach(ent =>
                                {
                                    var item = new ProductionProcessStageDetailModel(ent);

                                    var entConfigSpecificationsStage = entitiesConfigSpecificationsStage.FirstOrDefault(f => f.Id == item.ConfigSpecificationsStageId);
                                    if (entConfigSpecificationsStage != null)
                                    {
                                        var entCategory = context.Category.FirstOrDefault(f => f.CategoryId == entConfigSpecificationsStage.SpecificationsId);
                                        if (entCategory != null && entCategory.CategoryName == "Thời gian bắt đầu")
                                        {
                                            var processStageDetailValues = context.ProductionProcessStageDetailValue.Where(f => f.ProductionProcessStageDetailId == item.Id).ToList();
                                            processStageDetailValues.ForEach(value => value.Value = String.Format("{0}:{1}",DateTime.Now.Hour,DateTime.Now.Minute));
                                        }
                                    }

                                });
                                context.SaveChanges();
                            }
                        }
                       
                        var entCategoryTypeStatus = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStatus);
                        if (entCategoryTypeStatus != null)
                        {
                            var entStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_PRODUCTION);
                            if (entStatus != null)
                            {
                                var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == entProductionProcessStage.ProductionProcessDetailId);
                                if (entProductionProcessDetail != null)
                                {
                                    entProductionProcessDetail.StartDate= DateTime.Now;
                                    entProductionProcessDetail.StatusId = entStatus.CategoryId;
                                    entProductionProcessDetail.UpdatedBy = parameter.UserId;
                                    entProductionProcessDetail.UpdatedDate = DateTime.Now;
                                    context.ProductionProcessDetail.Update(entProductionProcessDetail);
                                    context.SaveChanges();
                                }
                            }
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

        public ImportNGResult ImportNG(ImportNGParameter parameter)
        {
            var result = new ImportNGResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Nhập NG thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entProductionProcessStage = context.ProductionProcessStage.FirstOrDefault(f => f.Id == parameter.ProductionProcessStageId);
                    if (entProductionProcessStage != null)
                    {
                        var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == entProductionProcessStage.ProductionProcessDetailId);
                        if (entProductionProcessDetail != null)
                        {
                            if (parameter.TotalReuse > 0)
                            {
                                var entReuse = new Entities.ProductionProcessListNg();
                                entReuse.ProductionProcessStageId = parameter.ProductionProcessStageId;
                                entReuse.ProductId = entProductionProcessDetail.ProductId;
                                entReuse.LotNoId = entProductionProcessDetail.LotNoId;
                                entReuse.WarehouseId = parameter.WarehouseId;
                                entReuse.NumberNg = parameter.TotalReuse;
                                entReuse.CreatedBy = parameter.UserId;
                                entReuse.CreatedDate = DateTime.Now;
                                context.ProductionProcessListNg.Add(entReuse);
                                context.SaveChanges();
                            }

                            if (parameter.TotalCancel > 0)
                            {
                                var entCancel = new Entities.ProductionProcessListNg();
                                entCancel.ProductionProcessStageId = parameter.ProductionProcessStageId;
                                entCancel.ProductId = entProductionProcessDetail.ProductId;
                                entCancel.LotNoId = entProductionProcessDetail.LotNoId;
                                entCancel.WarehouseId = parameter.WarehouseId;
                                entCancel.NumberNg = parameter.TotalCancel;
                                entCancel.CreatedBy = parameter.UserId;
                                entCancel.CreatedDate = DateTime.Now;
                                context.ProductionProcessListNg.Add(entCancel);
                                context.SaveChanges();
                            }


                            #region Nhập kho NG 
                            #region Trạng nhập kho    
                            Guid statusId = Guid.NewGuid();
                            var entCategoryType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == WarehouseTicketType.RECEIVING_TYPE);
                            if (entCategoryType != null)
                            {
                                var entCategory = context.Category.FirstOrDefault(w => w.CategoryTypeId == entCategoryType.CategoryTypeId && w.CategoryCode == WarehouseRecevingStatus.OUT_OF_STOCK_TYPE);
                                if (entCategory != null)
                                {
                                    statusId = entCategory.CategoryId;
                                }
                            }
                            #endregion
                            var entInventoryReceivingVoucher = new Entities.InventoryReceivingVoucher();
                            entInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                            entInventoryReceivingVoucher.InventoryReceivingVoucherCode = "NG" + DateTime.Now.ToString("yyyyMMdd") + "CD" + entProductionProcessStage.Id.ToString();
                            entInventoryReceivingVoucher.StatusId = statusId;
                            entInventoryReceivingVoucher.Active = true;
                            entInventoryReceivingVoucher.InventoryReceivingVoucherType = (int)InventoryReceivingVoucherType.PNNG;
                            entInventoryReceivingVoucher.WarehouseId = parameter.WarehouseId;
                            entInventoryReceivingVoucher.InventoryReceivingVoucherDate = DateTime.Now;
                            entInventoryReceivingVoucher.InventoryReceivingVoucherTime = DateTime.Now.TimeOfDay;
                            entInventoryReceivingVoucher.CreatedById = parameter.UserId;
                            entInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                            context.InventoryReceivingVoucher.Add(entInventoryReceivingVoucher);
                            context.SaveChanges();

                            if (parameter.TotalReuse > 0)
                            {
                                var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                entInventoryReceivingVoucherMapping.ProductId = entProductionProcessDetail.ProductId;
                                entInventoryReceivingVoucherMapping.LotNoId = entProductionProcessDetail.LotNoId;
                                entInventoryReceivingVoucherMapping.WarehouseId = parameter.WarehouseId;
                                entInventoryReceivingVoucherMapping.Description = "Reuse";
                                entInventoryReceivingVoucherMapping.QuantityActual = parameter.TotalReuse;
                                entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                context.InventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);
                                context.SaveChanges();
                            }
                            if (parameter.TotalCancel > 0)
                            {
                                var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                entInventoryReceivingVoucherMapping.ProductId = entProductionProcessDetail.ProductId;
                                entInventoryReceivingVoucherMapping.LotNoId = entProductionProcessDetail.LotNoId;
                                entInventoryReceivingVoucherMapping.WarehouseId = parameter.WarehouseId;
                                entInventoryReceivingVoucherMapping.Description = "Cancel";
                                entInventoryReceivingVoucherMapping.QuantityActual = parameter.TotalCancel;
                                entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                context.InventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);
                                context.SaveChanges();
                            }

                            #region Nhập Kho
                            UpdateInventoryReport(entProductionProcessDetail.ProductId, entProductionProcessDetail.LotNoId, parameter.WarehouseId, parameter.UserId,
                                entInventoryReceivingVoucher.InventoryReceivingVoucherDate,0, 0, parameter.TotalReuse, 0, 0, 0, parameter.TotalCancel, 0);
                            #endregion


                            var entProductionProcessStageImportExport = new Entities.ProductionProcessStageImportExport();
                            entProductionProcessStageImportExport.ProductionProcessDetailId = entProductionProcessStage.ProductionProcessDetailId;
                            entProductionProcessStageImportExport.ProductionProcessStageId = entProductionProcessStage.Id;
                            entProductionProcessStageImportExport.InventoryVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                            entProductionProcessStageImportExport.InventoryVoucherCode = entInventoryReceivingVoucher.InventoryReceivingVoucherCode;
                            entProductionProcessStageImportExport.WarehouseId = entInventoryReceivingVoucher.WarehouseId;
                            entProductionProcessStageImportExport.InventoryVoucherDate = entInventoryReceivingVoucher.InventoryReceivingVoucherDate;
                            entProductionProcessStageImportExport.StageNameId = entProductionProcessStage.StageNameId.Value;
                            entProductionProcessStageImportExport.IsExport = false;
                            context.ProductionProcessStageImportExport.Add(entProductionProcessStageImportExport);
                            context.SaveChanges();
                            #endregion
                        }
                        entProductionProcessStage.TotalNotReached = parameter.TotalReuse + parameter.TotalCancel;
                        entProductionProcessStage.TotalReuse = parameter.TotalReuse;
                        entProductionProcessStage.TotalCancel = parameter.TotalCancel;
                        entProductionProcessStage.UpdatedBy = parameter.UserId;
                        entProductionProcessStage.UpdatedDate = DateTime.Now;
                        context.ProductionProcessStage.Update(entProductionProcessStage);
                        context.SaveChanges();
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

        public ConfirmProductionProcessStageByIdResult ConfirmProductionProcessStageById(ConfirmProductionProcessStageByIdParameter parameter)
        {
            var result = new ConfirmProductionProcessStageByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Xác nhận công đoạn thành công",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entProductionProcessStage = context.ProductionProcessStage.FirstOrDefault(f => f.Id == parameter.ProductionProcessStageId);
                    var entProcessStatusType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStatus);
                    var entProcessStageStatusType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStageStatus);
                    var entStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStageStatusType.STAGE_CONFIRMED && f.CategoryTypeId == entProcessStageStatusType.CategoryTypeId);
                    if (entProductionProcessStage != null && entStatus != null)
                    {
                        if (entProductionProcessStage.TotalNotReached > 0)
                        {
                            var countListNg = context.ProductionProcessListNg.Where(w => w.ProductionProcessStageId == parameter.ProductionProcessStageId).Count();
                            var countError = context.ProductionProcessErrorStage.Where(w => w.ProductionProcessStageId == parameter.ProductionProcessStageId && w.ErrorNumber > 0).Count();
                            if (countListNg == 0 || countError == 0)
                            {
                                result.StatusCode = HttpStatusCode.ExpectationFailed;
                                result.MessageCode = "Bạn cần cập nhật bảng danh mục lỗi và Nhập kho NG trước khi Xác nhận!";
                                return result;
                            }
                        }
                        entProductionProcessStage.StatusId = entStatus.CategoryId;
                        entProductionProcessStage.UpdatedBy = parameter.UserId;
                        entProductionProcessStage.UpdatedDate = DateTime.Now;
                        context.ProductionProcessStage.Update(entProductionProcessStage);
                        context.SaveChanges();

                        var entities = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == entProductionProcessStage.ProductionProcessDetailId && w.SortOrder > entProductionProcessStage.SortOrder).OrderBy(o => o.SortOrder).ToList();
                        if (entities.Count > 0)//Không phải công đoạn cuối cùng
                        {
                            entities.ForEach(item =>
                            {
                                item.TotalProduction = entProductionProcessStage.TotalReached;
                            });
                            context.ProductionProcessStage.UpdateRange(entities);
                            context.SaveChanges();
                        }
                        else if (parameter.WarehouseId != null)//Công đoạn cuối cùng lô sản xuất -> Nhập kho thành phẩm
                        {
                            var entStatusLotNo = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_FINISH && f.CategoryTypeId == entProcessStatusType.CategoryTypeId);
                            var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == entProductionProcessStage.ProductionProcessDetailId);
                            if (entProductionProcessDetail != null)
                            {
                                
                                entProductionProcessDetail.TotalReached = (int)entProductionProcessStage.TotalReached.Value;
                                entProductionProcessDetail.TotalPending = entProductionProcessStage.TotalPending;
                                entProductionProcessDetail.EndDate = DateTime.Now;
                                entProductionProcessDetail.StatusId = entStatusLotNo.CategoryId;
                                entProductionProcessDetail.UpdatedBy = parameter.UserId;
                                entProductionProcessDetail.UpdatedDate = DateTime.Now;
                                context.ProductionProcessDetail.Update(entProductionProcessDetail);
                                context.SaveChanges();
                                long lotNoId = entProductionProcessDetail.LotNoId;
                                if (entProductionProcessDetail.PrentId.HasValue)
                                {
                                    if (entProductionProcessDetail.PrentId.Value > 0)
                                    {
                                        var entPrent = context.ProductionProcessDetail.FirstOrDefault(x => x.Id == entProductionProcessDetail.PrentId.Value);
                                        if (entPrent != null)
                                        {
                                            entPrent.TotalReached += entProductionProcessDetail.TotalReached;
                                            entPrent.TotalPending += entProductionProcessDetail.TotalPending;
                                            entPrent.EndDate = DateTime.Now;
                                            entPrent.UpdatedBy = parameter.UserId;
                                            entPrent.UpdatedDate = DateTime.Now;
                                            context.ProductionProcessDetail.Update(entPrent);
                                            context.SaveChanges();
                                            lotNoId = entPrent.LotNoId;
                                        }
                                    }
                                }

                                #region Tạo phiếu nhập kho
                                #region Trạng thái nhập kho    
                                Guid statusId = Guid.NewGuid();
                                var entCategoryType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == WarehouseTicketType.RECEIVING_TYPE);
                                if (entCategoryType != null)
                                {
                                    var entCategory = context.Category.FirstOrDefault(w => w.CategoryTypeId == entCategoryType.CategoryTypeId && w.CategoryCode == WarehouseRecevingStatus.OUT_OF_STOCK_TYPE);
                                    if (entCategory != null)
                                    {
                                        statusId = entCategory.CategoryId;
                                    }
                                }
                                #endregion

                                var entInventoryReceivingVoucher = new Entities.InventoryReceivingVoucher();
                                entInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                                entInventoryReceivingVoucher.InventoryReceivingVoucherCode = "TP" + DateTime.Now.ToString("yyyyMMdd") + "LO" + entProductionProcessDetail.Id.ToString();
                                entInventoryReceivingVoucher.StatusId = statusId;
                                entInventoryReceivingVoucher.Active = true;
                                entInventoryReceivingVoucher.InventoryReceivingVoucherType = (int)InventoryReceivingVoucherType.TPSDG;
                                entInventoryReceivingVoucher.WarehouseId = parameter.WarehouseId.Value;
                                entInventoryReceivingVoucher.InventoryReceivingVoucherDate = DateTime.Now;
                                entInventoryReceivingVoucher.InventoryReceivingVoucherTime = DateTime.Now.TimeOfDay;
                                entInventoryReceivingVoucher.CreatedById = parameter.UserId;
                                entInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                                context.InventoryReceivingVoucher.Add(entInventoryReceivingVoucher);
                                context.SaveChanges();

                                var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                entInventoryReceivingVoucherMapping.ProductId = entProductionProcessDetail.ProductId;
                                entInventoryReceivingVoucherMapping.LotNoId = lotNoId;
                                entInventoryReceivingVoucherMapping.WarehouseId = parameter.WarehouseId.Value;
                                entInventoryReceivingVoucherMapping.Description = "SLOK"; //so luong OK
                                entInventoryReceivingVoucherMapping.QuantityActual = 0;
                                entInventoryReceivingVoucherMapping.QuantityOk = entProductionProcessDetail.TotalReached;
                                entInventoryReceivingVoucherMapping.QuantityPending = entProductionProcessDetail.TotalPending.HasValue ? entProductionProcessDetail.TotalPending.Value : 0;
                                entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                context.InventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);
                                context.SaveChanges();

                                //if (entProductionProcessDetail.TotalReached > 0)
                                //{

                                //}
                                //if (entProductionProcessDetail.TotalPending > 0)
                                //{
                                //    var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                //    entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                //    entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                //    entInventoryReceivingVoucherMapping.ProductId = entProductionProcessDetail.ProductId;
                                //    entInventoryReceivingVoucherMapping.LotNoId = lotNoId;
                                //    entInventoryReceivingVoucherMapping.WarehouseId = parameter.WarehouseId.Value;
                                //    entInventoryReceivingVoucherMapping.Description = "SLPD"; // So luong pending
                                //    entInventoryReceivingVoucherMapping.QuantityActual = entProductionProcessDetail.TotalPending.Value;
                                //    entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                //    entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                //    context.InventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);
                                //    context.SaveChanges();
                                //}

                                #region Cập nhật bảng tồn kho
                                decimal productionNumber = GetProductionNumber(entProductionProcessDetail.Id);                                
                                UpdateInventoryReport(entProductionProcessDetail.ProductId, lotNoId, parameter.WarehouseId.Value, parameter.UserId,
                                    entInventoryReceivingVoucher.InventoryReceivingVoucherDate, entProductionProcessDetail.TotalReached,
                                    0, 0, 0, entProductionProcessDetail.TotalPending.Value, 0, 0, productionNumber);
                                #endregion
                                #region Thêm phiếu nhập kho vào công đoạn
                                if (entProductionProcessStage != null)
                                {
                                    var entProductionProcessStageImportExport = new Entities.ProductionProcessStageImportExport();
                                    entProductionProcessStageImportExport.ProductionProcessDetailId = entProductionProcessDetail.Id;
                                    entProductionProcessStageImportExport.ProductionProcessStageId = entProductionProcessStage.Id;
                                    entProductionProcessStageImportExport.InventoryVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                    entProductionProcessStageImportExport.InventoryVoucherCode = entInventoryReceivingVoucher.InventoryReceivingVoucherCode;
                                    entProductionProcessStageImportExport.WarehouseId = entInventoryReceivingVoucher.WarehouseId;
                                    entProductionProcessStageImportExport.InventoryVoucherDate = entInventoryReceivingVoucher.InventoryReceivingVoucherDate;
                                    entProductionProcessStageImportExport.StageNameId = entProductionProcessStage.StageNameId.Value;
                                    entProductionProcessStageImportExport.IsExport = false;
                                    context.ProductionProcessStageImportExport.Add(entProductionProcessStageImportExport);
                                    context.SaveChanges();
                                }
                                #endregion

                                #endregion
                            }
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

        private decimal GetProductionNumber(long productionProcessDetailId)
        {
            decimal productionNumber = 0;
            var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == productionProcessDetailId);
            if (entProductionProcessDetail.PrentId.HasValue)
            {
                productionNumber = GetProductionNumber(entProductionProcessDetail.PrentId.Value);
            }
            else
            {
                productionNumber = entProductionProcessDetail.ProductionNumber;
            }
            return productionNumber;
        }

        public CancelProductionProcessDetailByIdResult CancelProductionProcessDetailById(CancelProductionProcessDetailByIdParameter parameter)
        {
            var result = new CancelProductionProcessDetailByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Hủy lô thành công!",
            };
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId);
                    if (entProductionProcessDetail != null)
                    {
                        var entStatus = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStatus);
                        if (entStatus != null)
                        {
                            var entProcessStatusCancel = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_CANCEL && f.CategoryTypeId == entStatus.CategoryTypeId);
                            if (entProcessStatusCancel != null)
                            {
                                entProductionProcessDetail.StatusId = entProcessStatusCancel.CategoryId;
                                entProductionProcessDetail.UpdatedBy = parameter.UserId;
                                entProductionProcessDetail.UpdatedDate = DateTime.Now;
                                context.ProductionProcessDetail.Update(entProductionProcessDetail);
                                context.SaveChanges();

                                var statusStageProgress = context.Category.Where(c => c.CategoryCode == ProcessStageStatusType.STAGE_BEGIN || c.CategoryCode == ProcessStageStatusType.STAGE_PAUSE).Select(s => s.CategoryId).ToList();

                                var entProductionProcessStage = context.ProductionProcessStage.FirstOrDefault(w => statusStageProgress.Contains(w.StatusId.Value) && w.ProductionProcessDetailId == entProductionProcessDetail.Id && !w.IsStageWithoutNg);


                                #region Trạng thái nhập kho    
                                Guid statusId = Guid.NewGuid();
                                var entCategoryType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == WarehouseTicketType.RECEIVING_TYPE);
                                if (entCategoryType != null)
                                {
                                    var entCategory = context.Category.FirstOrDefault(w => w.CategoryTypeId == entCategoryType.CategoryTypeId && w.CategoryCode == WarehouseRecevingStatus.OUT_OF_STOCK_TYPE);
                                    if (entCategory != null)
                                    {
                                        statusId = entCategory.CategoryId;
                                    }
                                }
                                #endregion

                                #region Danh sách bán thành phẩm (Thành phẩm tái sử dụng, hủy)                            
                                if (parameter.TotalReuse > 0 || parameter.TotalCancel > 0)
                                {
                                    #region Phiếu nhập kho
                                    var entInventoryReceivingVoucher = new Entities.InventoryReceivingVoucher();
                                    entInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                                    entInventoryReceivingVoucher.InventoryReceivingVoucherCode = "NG" + DateTime.Now.ToString("yyyyMMdd") + "CD" + entProductionProcessDetail.Id.ToString();
                                    entInventoryReceivingVoucher.StatusId = statusId;
                                    entInventoryReceivingVoucher.Active = true;
                                    entInventoryReceivingVoucher.InventoryReceivingVoucherType = (int)InventoryReceivingVoucherType.PNNG;
                                    entInventoryReceivingVoucher.WarehouseId = parameter.TPWarehouseId;
                                    entInventoryReceivingVoucher.InventoryReceivingVoucherDate = DateTime.Now;
                                    entInventoryReceivingVoucher.InventoryReceivingVoucherTime = DateTime.Now.TimeOfDay;
                                    entInventoryReceivingVoucher.CreatedById = parameter.UserId;
                                    entInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                                    context.InventoryReceivingVoucher.Add(entInventoryReceivingVoucher);
                                    context.SaveChanges();

                                    if (parameter.TotalReuse > 0)
                                    {
                                        var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                        entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                        entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                        entInventoryReceivingVoucherMapping.ProductId = entProductionProcessDetail.ProductId;
                                        entInventoryReceivingVoucherMapping.LotNoId = entProductionProcessDetail.LotNoId;
                                        entInventoryReceivingVoucherMapping.WarehouseId = parameter.TPWarehouseId;
                                        entInventoryReceivingVoucherMapping.Description = "";
                                        entInventoryReceivingVoucherMapping.QuantityActual = parameter.TotalReuse;
                                        entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                        entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                        context.InventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);
                                        context.SaveChanges();
                                    }
                                    if (parameter.TotalCancel > 0)
                                    {
                                        var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                        entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                        entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                        entInventoryReceivingVoucherMapping.ProductId = entProductionProcessDetail.ProductId;
                                        entInventoryReceivingVoucherMapping.LotNoId = entProductionProcessDetail.LotNoId;
                                        entInventoryReceivingVoucherMapping.WarehouseId = parameter.TPWarehouseId;
                                        entInventoryReceivingVoucherMapping.Description = "";
                                        entInventoryReceivingVoucherMapping.QuantityActual = parameter.TotalCancel;
                                        entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                        entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                        context.InventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);
                                        context.SaveChanges();
                                    }

                                    #endregion

                                    #region Cập nhật bảng tồn kho
                                    UpdateInventoryReport(entProductionProcessDetail.ProductId, entProductionProcessDetail.LotNoId, parameter.TPWarehouseId, parameter.UserId,
                                        entInventoryReceivingVoucher.InventoryReceivingVoucherDate, 0, 0, parameter.TotalReuse, 0, 0, 0, parameter.TotalCancel);
                                    #endregion

                                    #region Thêm phiếu nhập kho vào công đoạn
                                    if (entProductionProcessStage != null)
                                    {
                                        var entProductionProcessStageImportExport = new Entities.ProductionProcessStageImportExport();
                                        entProductionProcessStageImportExport.ProductionProcessDetailId = entProductionProcessDetail.Id;
                                        entProductionProcessStageImportExport.ProductionProcessStageId = entProductionProcessStage.Id;
                                        entProductionProcessStageImportExport.InventoryVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                        entProductionProcessStageImportExport.InventoryVoucherCode = entInventoryReceivingVoucher.InventoryReceivingVoucherCode;
                                        entProductionProcessStageImportExport.WarehouseId = entInventoryReceivingVoucher.WarehouseId;
                                        entProductionProcessStageImportExport.InventoryVoucherDate = entInventoryReceivingVoucher.InventoryReceivingVoucherDate;
                                        entProductionProcessStageImportExport.StageNameId = entProductionProcessStage.StageNameId.Value;
                                        entProductionProcessStageImportExport.IsExport = false;
                                        context.ProductionProcessStageImportExport.Add(entProductionProcessStageImportExport);
                                        context.SaveChanges();

                                        entProductionProcessStage.TotalReuse = parameter.TotalReuse;
                                        entProductionProcessStage.TotalCancel = parameter.TotalCancel;
                                        entProductionProcessStage.UpdatedBy = parameter.UserId;
                                        entProductionProcessStage.UpdatedDate = DateTime.Now;
                                        context.ProductionProcessStage.Add(entProductionProcessStage);
                                        context.SaveChanges();
                                    }
                                    #endregion
                                }
                                #endregion

                                #region Danh sách nguyên vật liệu chưa sử dụng
                                if (parameter.ProductInputModels != null)
                                {
                                    if (parameter.ProductInputModels.Count > 0)
                                    {
                                        #region Cập nhật bảng NVL đầu vào
                                        var listId = parameter.ProductInputModels.Select(s => s.Id).ToList();
                                        var entitiesProductInput = context.ProductionProcessStageProductInput.Where(w => listId.Contains(w.Id)).ToList();
                                        entitiesProductInput.ForEach(entProductInput =>
                                        {
                                            var itemProductInput = parameter.ProductInputModels.FirstOrDefault(f => f.Id == entProductInput.Id);
                                            if (itemProductInput != null)
                                            {
                                                entProductInput.QuantityNotProduced = itemProductInput.QuantityNotProduced;
                                                entProductInput.UpdatedBy = parameter.UserId;
                                                entProductInput.UpdatedDate = DateTime.Now;
                                            }
                                        });
                                        context.ProductionProcessStageProductInput.UpdateRange(entitiesProductInput);
                                        context.SaveChanges();
                                        #endregion

                                        #region Phiếu nhập kho
                                        var entInventoryReceivingVoucher = new Entities.InventoryReceivingVoucher();
                                        entInventoryReceivingVoucher.InventoryReceivingVoucherId = Guid.NewGuid();
                                        entInventoryReceivingVoucher.InventoryReceivingVoucherCode = "NG" + DateTime.Now.ToString("yyyyMMdd") + "CD" + entProductionProcessDetail.Id.ToString();
                                        entInventoryReceivingVoucher.StatusId = statusId;
                                        entInventoryReceivingVoucher.Active = true;
                                        entInventoryReceivingVoucher.InventoryReceivingVoucherType = (int)InventoryReceivingVoucherType.PNL;
                                        entInventoryReceivingVoucher.WarehouseId = parameter.NVLWarehouseId;
                                        entInventoryReceivingVoucher.InventoryReceivingVoucherDate = DateTime.Now;
                                        entInventoryReceivingVoucher.InventoryReceivingVoucherTime = DateTime.Now.TimeOfDay;
                                        entInventoryReceivingVoucher.CreatedById = parameter.UserId;
                                        entInventoryReceivingVoucher.CreatedDate = DateTime.Now;
                                        context.InventoryReceivingVoucher.Add(entInventoryReceivingVoucher);
                                        context.SaveChanges();

                                        var entitiesInventoryReceivingVoucherMapping = new List<InventoryReceivingVoucherMapping>();
                                        parameter.ProductInputModels.ForEach(itemDetail =>
                                        {
                                            if (itemDetail.QuantityNotProduced > 0)
                                            {
                                                var entInventoryReceivingVoucherMapping = new Entities.InventoryReceivingVoucherMapping();
                                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherMappingId = Guid.NewGuid();
                                                entInventoryReceivingVoucherMapping.InventoryReceivingVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                                entInventoryReceivingVoucherMapping.ProductId = itemDetail.ProductId;
                                                entInventoryReceivingVoucherMapping.LotNoId = itemDetail.LotNoId;
                                                entInventoryReceivingVoucherMapping.WarehouseId = parameter.NVLWarehouseId;
                                                entInventoryReceivingVoucherMapping.Description = "";
                                                entInventoryReceivingVoucherMapping.QuantityActual = itemDetail.QuantityNotProduced;
                                                entInventoryReceivingVoucherMapping.CreatedById = parameter.UserId;
                                                entInventoryReceivingVoucherMapping.CreatedDate = DateTime.Now;
                                                entitiesInventoryReceivingVoucherMapping.Add(entInventoryReceivingVoucherMapping);

                                                #region Cập nhật bảng tồn kho
                                                UpdateInventoryReport(itemDetail.ProductId, itemDetail.LotNoId, parameter.NVLWarehouseId, parameter.UserId,
                                                    entInventoryReceivingVoucher.InventoryReceivingVoucherDate, itemDetail.QuantityNotProduced);
                                                #endregion
                                            }
                                        });
                                        context.InventoryReceivingVoucherMapping.AddRange(entitiesInventoryReceivingVoucherMapping);
                                        context.SaveChanges();

                                        #region Thêm phiếu nhập kho vào công đoạn
                                        var entProductionProcessStageImportExport = new Entities.ProductionProcessStageImportExport();
                                        entProductionProcessStageImportExport.ProductionProcessDetailId = entProductionProcessDetail.Id;
                                        entProductionProcessStageImportExport.ProductionProcessStageId = entProductionProcessStage.Id;
                                        entProductionProcessStageImportExport.InventoryVoucherId = entInventoryReceivingVoucher.InventoryReceivingVoucherId;
                                        entProductionProcessStageImportExport.InventoryVoucherCode = entInventoryReceivingVoucher.InventoryReceivingVoucherCode;
                                        entProductionProcessStageImportExport.WarehouseId = entInventoryReceivingVoucher.WarehouseId;
                                        entProductionProcessStageImportExport.InventoryVoucherDate = entInventoryReceivingVoucher.InventoryReceivingVoucherDate;
                                        entProductionProcessStageImportExport.StageNameId = entProductionProcessStage.StageNameId.Value;
                                        entProductionProcessStageImportExport.IsExport = false;
                                        context.ProductionProcessStageImportExport.Add(entProductionProcessStageImportExport);
                                        context.SaveChanges();
                                        #endregion
                                        #endregion
                                    }
                                }
                                #endregion
                            }
                            else
                            {
                                result.Message = "Không tồn tại trạng thái hủy";
                                result.StatusCode = HttpStatusCode.ExpectationFailed;
                            }
                        }
                        else
                        {
                            result.Message = "Không tồn tại loại trạng thái";
                            result.StatusCode = HttpStatusCode.ExpectationFailed;
                        }
                    }
                    else
                    {
                        result.Message = "Không tồn tại lô hàng này";
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

        public void UpdateInventoryReport(Guid productId,long lotNoId, Guid warehouseId, Guid userId, DateTime inventoryReportDate,
            decimal quantityReceiving = 0, decimal quantityDelivery = 0, decimal reuseReceiving = 0, decimal reuseDelivery = 0,
            decimal pendingReceiving = 0, decimal pendingDelivery = 0, decimal cancelReceiving = 0, decimal cancelDelivery = 0, decimal productionNumber = 0)
        {
            var now = DateTime.Now.Date;
            var entCurrentInventoryReport = context.InventoryReport.FirstOrDefault(w => w.ProductId == productId
                                                                && w.LotNoId == lotNoId
                                                                && w.InventoryReportDate.Date == inventoryReportDate.Date
                                                                && w.WarehouseId == warehouseId);
            var entPrevInventoryReport = context.InventoryReport.Where(w => w.ProductId == productId
                                                                && w.LotNoId == lotNoId
                                                                && w.InventoryReportDate.Date < inventoryReportDate.Date
                                                                && w.WarehouseId == warehouseId).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
            if (entCurrentInventoryReport != null)
            {
                if (entPrevInventoryReport != null)
                {
                    entCurrentInventoryReport.StartQuantity = (entPrevInventoryReport.StartQuantity + entPrevInventoryReport.QuantityReceiving) - entPrevInventoryReport.QuantityDelivery;
                    entCurrentInventoryReport.StartPending = (entPrevInventoryReport.StartPending + entPrevInventoryReport.PendingReceiving) - entPrevInventoryReport.PendingDelivery;
                    entCurrentInventoryReport.StartCancel = (entPrevInventoryReport.StartCancel + entPrevInventoryReport.CancelReceiving) - entPrevInventoryReport.CancelDelivery;
                    entCurrentInventoryReport.StartReuse = (entPrevInventoryReport.StartReuse + entPrevInventoryReport.ReuseReceiving) - entPrevInventoryReport.ReuseDelivery;
                }
                else
                {
                    entCurrentInventoryReport.StartQuantity = 0;
                    entCurrentInventoryReport.StartPending = 0;
                    entCurrentInventoryReport.StartCancel = 0;
                    entCurrentInventoryReport.StartReuse = 0;
                }
                entCurrentInventoryReport.ProductionNumber += productionNumber;
                entCurrentInventoryReport.QuantityReceiving += quantityReceiving;
                entCurrentInventoryReport.QuantityDelivery += quantityDelivery;
                entCurrentInventoryReport.ReuseReceiving += reuseReceiving;
                entCurrentInventoryReport.ReuseDelivery += reuseDelivery;
                entCurrentInventoryReport.PendingReceiving += pendingReceiving;
                entCurrentInventoryReport.PendingDelivery += pendingDelivery;
                entCurrentInventoryReport.CancelReceiving += cancelReceiving;
                entCurrentInventoryReport.CancelDelivery += cancelDelivery;
                entCurrentInventoryReport.UpdatedById = userId;
                entCurrentInventoryReport.UpdatedDate = now;
                context.InventoryReport.Update(entCurrentInventoryReport);
                context.SaveChanges();
            }
            else
            {
                entCurrentInventoryReport = new InventoryReport();
                entCurrentInventoryReport.InventoryReportId = Guid.NewGuid();
                entCurrentInventoryReport.WarehouseId = warehouseId;
                entCurrentInventoryReport.ProductId = productId;
                entCurrentInventoryReport.LotNoId = lotNoId;
                entCurrentInventoryReport.Active = true;
                entCurrentInventoryReport.InventoryReportDate = inventoryReportDate;
                if (entPrevInventoryReport != null)
                {
                    entCurrentInventoryReport.StartQuantity = (entPrevInventoryReport.StartQuantity + entPrevInventoryReport.QuantityReceiving) - entPrevInventoryReport.QuantityDelivery;
                    entCurrentInventoryReport.StartPending = (entPrevInventoryReport.StartPending + entPrevInventoryReport.PendingReceiving) - entPrevInventoryReport.PendingDelivery;
                    entCurrentInventoryReport.StartCancel = (entPrevInventoryReport.StartCancel + entPrevInventoryReport.CancelReceiving) - entPrevInventoryReport.CancelDelivery;
                    entCurrentInventoryReport.StartReuse = (entPrevInventoryReport.StartReuse + entPrevInventoryReport.ReuseReceiving) - entPrevInventoryReport.ReuseDelivery;
                }
                else
                {
                    entCurrentInventoryReport.StartQuantity = 0;
                    entCurrentInventoryReport.StartPending = 0;
                    entCurrentInventoryReport.StartCancel = 0;
                    entCurrentInventoryReport.StartReuse = 0;
                }
                entCurrentInventoryReport.ProductionNumber = productionNumber;
                entCurrentInventoryReport.QuantityReceiving = quantityReceiving;
                entCurrentInventoryReport.QuantityDelivery = quantityDelivery;
                entCurrentInventoryReport.ReuseReceiving = reuseReceiving;
                entCurrentInventoryReport.ReuseDelivery = reuseDelivery;
                entCurrentInventoryReport.PendingReceiving = pendingReceiving;
                entCurrentInventoryReport.PendingDelivery = pendingDelivery;
                entCurrentInventoryReport.CancelReceiving = cancelReceiving;
                entCurrentInventoryReport.CancelDelivery = cancelDelivery;
                entCurrentInventoryReport.CreatedDate = now;
                entCurrentInventoryReport.CreatedById = userId;
                context.InventoryReport.Add(entCurrentInventoryReport);
                context.SaveChanges();
            }
            #region Cập nhật lại tồn kho nếu không phải ngày hiện tại            
            var reportDate = inventoryReportDate.Date;
            reportDate = reportDate.AddDays(1);
            while (reportDate <= now)
            {
                var entCurrentUpdateInventoryReport = context.InventoryReport.FirstOrDefault(w => w.ProductId == productId
                                                                && w.LotNoId == lotNoId
                                                                && w.InventoryReportDate.Date == reportDate
                                                                && w.WarehouseId == warehouseId);
                if (entCurrentUpdateInventoryReport != null)
                {
                    var entPrevUpdateInventoryReport = context.InventoryReport.Where(w => w.ProductId == productId
                                                                    && w.LotNoId == lotNoId
                                                                    && w.InventoryReportDate.Date < reportDate
                                                                    && w.WarehouseId == warehouseId).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
                    if (entPrevUpdateInventoryReport != null)
                    {
                        entCurrentUpdateInventoryReport.StartQuantity = (entPrevUpdateInventoryReport.StartQuantity + entPrevUpdateInventoryReport.QuantityReceiving) - entPrevUpdateInventoryReport.QuantityDelivery;
                        entCurrentUpdateInventoryReport.StartPending = (entPrevUpdateInventoryReport.StartPending + entPrevUpdateInventoryReport.PendingReceiving) - entPrevUpdateInventoryReport.PendingDelivery;
                        entCurrentUpdateInventoryReport.StartCancel = (entPrevUpdateInventoryReport.StartCancel + entPrevUpdateInventoryReport.CancelReceiving) - entPrevUpdateInventoryReport.CancelDelivery;
                        entCurrentUpdateInventoryReport.StartReuse = (entPrevUpdateInventoryReport.StartReuse + entPrevUpdateInventoryReport.ReuseReceiving) - entPrevUpdateInventoryReport.ReuseDelivery;
                        entCurrentInventoryReport.UpdatedById = userId;
                        entCurrentInventoryReport.UpdatedDate = now;
                        context.InventoryReport.Update(entCurrentInventoryReport);
                        context.SaveChanges();
                    }
                }
                reportDate = reportDate.AddDays(1);
            }
            #endregion
        }

        public GetMainResult GetMain(GetMainParameter parameter)
        {
            var result = new GetMainResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy dữ liệu trang chủ thành công!",
            };
            try
            {
                var models = new List<MainProductModel>();
                var entCategoryType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStatus);
                if (entCategoryType != null)
                {
                    var entWaitingStatus = context.Category.Where(w => w.CategoryTypeId == entCategoryType.CategoryTypeId && (w.CategoryCode == ProcessStatusType.LO_NOT_PRODUCED || w.CategoryCode == ProcessStatusType.LO_BEGIN)).ToList();

                    var listWaitingStatusId = entWaitingStatus.Select(s => s.CategoryId).ToList();

                    var entProductionStatus = context.Category.Where(w => w.CategoryTypeId == entCategoryType.CategoryTypeId && (w.CategoryCode == ProcessStatusType.LO_PRODUCTION || w.CategoryCode == ProcessStatusType.LO_PAUSE)).ToList();

                    var listProductionStatusId = entProductionStatus.Select(s => s.CategoryId).ToList();

                    var entitiesProductionProcessDetail = context.ProductionProcessDetail.Where(w => listWaitingStatusId.Contains(w.StatusId) || listProductionStatusId.Contains(w.StatusId)).ToList();

                    var listProductId = entitiesProductionProcessDetail.Select(s => s.ProductId).Distinct().ToList();
                    var listLotNoId = entitiesProductionProcessDetail.Select(s => s.LotNoId).Distinct().ToList();
                    var listProductionProcessDetailId = entitiesProductionProcessDetail.Select(s=>s.Id).ToList();

                    var entitiesProduct = context.Product.Where(w => listProductId.Contains(w.ProductId)).ToList();
                    var entitiesLotNo = context.LotNo.Where(w => listLotNoId.Contains(w.LotNoId)).ToList();

                    var entStageCategoryType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStageStatus);

                    var entStageStatus = context.Category.Where(w => w.CategoryCode == ProcessStageStatusType.STAGE_BEGIN || w.CategoryCode == ProcessStageStatusType.STAGE_FINISH || w.CategoryCode == ProcessStageStatusType.STAGE_PAUSE).ToList();
                    var listStageStatus = entStageStatus.Select(s => s.CategoryId).ToList();

                    var entitiesProductionProcessStage = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId) && listStageStatus.Contains(w.StatusId.Value)).ToList();

                    var entGroupStageType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.GROUP_STAGE);
                    var entitiesGroupStage = context.Category.Where(w => w.CategoryTypeId == entGroupStageType.CategoryTypeId).ToList();

                    entitiesProduct.ForEach(itemProduct => 
                    {
                        var groupModels = new List<StageGroupModel>();
                        var model = new MainProductModel();
                        model.ProductId= itemProduct.ProductId;
                        model.ProductCode= itemProduct.ProductCode;
                        model.ProductName= itemProduct.ProductName;

                        var listLoWaiting = entitiesProductionProcessDetail.Where(w => listWaitingStatusId.Contains(w.StatusId) && w.ProductId == itemProduct.ProductId).ToList();
                        model.TotalWaiting = listLoWaiting.Count();
                        var listLoProductionProcessDetail = entitiesProductionProcessDetail.Where(w => listProductionStatusId.Contains(w.StatusId) && w.ProductId == itemProduct.ProductId).ToList();
                        model.TotalProduction = listLoProductionProcessDetail.Count();

                        entitiesGroupStage.ForEach(itemGroup =>
                        {
                            var groupModel = new StageGroupModel();
                            groupModel.StageNameId = itemGroup.CategoryId;
                            groupModel.StageCode = itemGroup.CategoryCode;
                            groupModel.StageName = itemGroup.CategoryName;
                            var lotNoModels = new List<LotNoModel>();
                            listLoProductionProcessDetail.ForEach(itemProductionProcessDetail =>
                            {    
                                var entStage = entitiesProductionProcessStage.FirstOrDefault(f => f.ProductionProcessDetailId == itemProductionProcessDetail.Id && f.StageGroupId ==itemGroup.CategoryId);
                                if (entStage != null)
                                {
                                    var lotNoModel = new LotNoModel();
                                    lotNoModel.LotNoId = itemProductionProcessDetail.LotNoId;
                                    var entLotNo = entitiesLotNo.FirstOrDefault(f => f.LotNoId == itemProductionProcessDetail.LotNoId);
                                    if (entLotNo != null)
                                    {
                                        lotNoModel.LotNoName = entLotNo.LotNoName;
                                    }
                                    lotNoModel.TotalQuantity = entStage.TotalProduction.HasValue ? entStage.TotalProduction.Value : 0;
                                    entStageStatus.ForEach(itemStageStatus =>
                                    {
                                        //if(itemStageStatus.CategoryId == entStage.StatusId)
                                        if(itemStageStatus.CategoryId == itemProductionProcessDetail.StatusId)
                                            {
                                            lotNoModel.Description = itemStageStatus.CategoryName;
                                        }
                                    });                                    
                                    lotNoModels.Add(lotNoModel);
                                }
                            });
                            groupModel.LotNoModels = lotNoModels;
                            groupModels.Add(groupModel);
                        });
                        model.GroupModels = groupModels;

                        models.Add(model);
                    });
                }
                
                result.Models = models;
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public ProductionReportResult ProductionReport(ProductionReportParameter parameter)
        {
            var result = new ProductionReportResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy dữ liệu báo cáo sản xuất thành công!",
            };
            try
            {
                var reportModels = new List<ProductionReportModel>();

                if (parameter.StartDate.HasValue && parameter.EndDate.HasValue && parameter.EndDate.Value >= parameter.StartDate.Value)
                {
                    var entities = context.Product.Where(w => w.ProductType == (int)ProductType.ThanhPham).ToList();
                    var entType = context.CategoryType.FirstOrDefault(w => w.CategoryTypeCode == "KHO");
                    var entWarehouseType = context.Category.FirstOrDefault(w => w.CategoryCode == WareHouseTypeCode.STOCK_KTP && w.CategoryTypeId == entType.CategoryTypeId);
                    var entitiesWarehouse = context.Warehouse.Where(w => w.WareHouseType == entWarehouseType.CategoryId); //Danh sách kho thành phẩm
                    var listWarehouseId = entitiesWarehouse.Select(s => s.WarehouseId).ToList();

                    var entProcessTypeStatus = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStatus);
                    var entPendingStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_PAUSE && f.CategoryTypeId == entProcessTypeStatus.CategoryTypeId);//Lô tạm dừng sản xuất
                    var entProductionStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStatusType.LO_PRODUCTION && f.CategoryTypeId == entProcessTypeStatus.CategoryTypeId);// Lô đang sản xuất

                    var entStageTypeStatus = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.ProcessStageStatus);
                    var entStageConfirmedStatus = context.Category.FirstOrDefault(f => f.CategoryCode == ProcessStageStatusType.STAGE_CONFIRMED && f.CategoryTypeId == entStageTypeStatus.CategoryTypeId);//Công đoạn hoàn thành sản xuất

                    var entStageType = context.CategoryType.FirstOrDefault(f => f.CategoryTypeCode == GroupType.STAGE);

                    var entStageCore = context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.CORE && f.CategoryTypeId == entStageType.CategoryTypeId); //sơn phủ primer lõi (Số lượng OK ở công đoạn Phủ primer Lõi có trạng thái "Hoàn thành" trong  ngày tương ứng)
                    var entStageFromLtv = context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.FROMLTV && f.CategoryTypeId == entStageType.CategoryTypeId); //LTV (Số lượng OK trong công đoạn cuối cùng ở trạng thái " Hoàn thành" thuộc nhóm LTV trong  ngày tương ứng)
                    var entStageFromCf = context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.FROMCF && f.CategoryTypeId == entStageType.CategoryTypeId); //CF (Số lượng OK trong công đoạn cuối cùng ở trạng thái " Hoàn thành" thuộc nhóm CF trong  ngày tương ứng)
                    var entStageFini = context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.FINI && f.CategoryTypeId == entStageType.CategoryTypeId); //Hoàn thiện (Số lượng OK trong công đoạn cuối cùng ở trạng thái " Hoàn thành" thuộc nhóm Hoàn thiện trong  ngày tương ứng)
                    var entStageInsVisual = context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.INSVISUAL && f.CategoryTypeId == entStageType.CategoryTypeId);//KTra ngoại quan (Số lượng OK trong công đoạn Kiểm tra ngoại quan ở trạng thái " Hoàn thành" trong  ngày tương ứng)
                    var entStagePacking = context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.PACKING && f.CategoryTypeId == entStageType.CategoryTypeId);//Đóng gói (Số lượng OK trong công đoạn Đóng gói ở trạng thái "Đã xác nhận" trong  ngày tương ứng)
                    var entStagePfa= context.Category.FirstOrDefault(f => f.CategoryCode == StageCode.PFA && f.CategoryTypeId == entStageType.CategoryTypeId); //Số lượng OK trong công đoạn cuối cùng ở trạng thái " Hoàn thành" thuộc nhóm PFA  trong  ngày tương ứng

                    entities.ForEach(item =>
                    {
                        var model = new ProductionReportModel();
                        model.ProductId = item.ProductId;
                        model.ProductCode = item.ProductCode;
                        model.ProductName = item.ProductName;
                        var reportDetailModels = new List<ProductionReportDetailModel>();
                        for(DateTime startDate = parameter.StartDate.Value; startDate <= parameter.EndDate.Value; startDate= startDate.Date.AddDays(1))
                        {
                            var detailModel = new ProductionReportDetailModel();
                            detailModel.ReportDate = startDate;

                            #region Id Lo đang sản xuất listProductionProcessDetailId
                            var listProductionProcessDetailId = context.ProductionProcessDetail.Where(w => w.StatusId == entProductionStatus.CategoryId 
                                                                                                && w.ProductId == item.ProductId 
                                                                                                && (w.StartDate.HasValue && w.StartDate.Value.Date <= startDate.Date)).Select(s => s.Id).ToList();
                            #endregion

                            #region Get Total Core is done (sơn phủ primer lõi (Số lượng OK ở công đoạn Phủ primer Lõi có trạng thái "Đã xác nhận" trong  ngày tương ứng))
                            decimal core = 0;
                            if (entStageCore != null && entStageConfirmedStatus != null)
                            {
                                var entitiesCore = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStageCore.CategoryId //Công đoạn sơn phủ primer
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesCore.ForEach(itemCore =>
                                {
                                    if (itemCore.TotalReached.HasValue)
                                    {
                                        core += itemCore.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.Core = core;
                            #endregion

                            #region Get Total FromLtv is done (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm LTV trong  ngày tương ứng)
                            decimal fromLtv = 0;
                            if (entStageFromLtv != null && entStageConfirmedStatus != null)
                            {
                                var entitiesFromLtv = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStageFromLtv.CategoryId //FromLtv
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesFromLtv.ForEach(itemFromLtv =>
                                {
                                    if (itemFromLtv.TotalReached.HasValue)
                                    {
                                        fromLtv += itemFromLtv.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.FromLtv = fromLtv;
                            #endregion

                            #region Get Total FromCf is done (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm CF trong  ngày tương ứng)
                            decimal fromCf = 0;
                            if (entStageFromCf != null && entStageConfirmedStatus != null)
                            {
                                var entitiesFromCf = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStageFromCf.CategoryId //FromCf
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesFromCf.ForEach(itemFromCf =>
                                {
                                    if (itemFromCf.TotalReached.HasValue)
                                    {
                                        fromCf += itemFromCf.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.FromCf = fromCf;
                            #endregion

                            #region Get Total Fini is done (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm Hoàn thiện trong  ngày tương ứng)
                            decimal fini = 0;
                            if (entStageFini != null && entStageConfirmedStatus != null)
                            {
                                var entitiesFini = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStageFini.CategoryId //fini
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesFini.ForEach(itemFini =>
                                {
                                    if (itemFini.TotalReached.HasValue)
                                    {
                                        fini += itemFini.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.Fini = fini;
                            #endregion

                            #region Get Total InsHardness
                            decimal insHardness = 0;

                            detailModel.InsHardness = insHardness;
                            #endregion

                            #region Get Total InsLaser
                            decimal insLaser = 0;

                            detailModel.InsLaser = insLaser;
                            #endregion

                            #region Get Total InsVisual is done (Số lượng OK trong công đoạn Kiểm tra ngoại quan ở trạng thái "Đã xác nhận" trong  ngày tương ứng)
                            decimal insVisual = 0;
                            if (entStageInsVisual != null && entStageConfirmedStatus != null)
                            {
                                var entitiesInsVisual = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStageInsVisual.CategoryId //InsVisual
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesInsVisual.ForEach(itemInsVisual =>
                                {
                                    if (itemInsVisual.TotalReached.HasValue)
                                    {
                                        insVisual += itemInsVisual.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.InsVisual = insVisual;
                            #endregion

                            #region Get Total Packing is done (Số lượng OK trong công đoạn Đóng gói ở trạng thái "Đã xác nhận" trong  ngày tương ứng)
                            decimal packing = 0;
                            if (entStagePacking != null && entStageConfirmedStatus != null)
                            {
                                var entitiesPacking = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStagePacking.CategoryId //Packing
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesPacking.ForEach(itemPacking =>
                                {
                                    if (itemPacking.TotalReached.HasValue)
                                    {
                                        packing += itemPacking.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.Packing = packing;
                            #endregion

                            #region Get Total Shiping is done (Số lượng trong phiếu xuất kho thành phẩm loại  phiếu "Xuất bán hàng" trạng thái "Đã xuất kho" trong  ngày tương ứng)
                            decimal shiping = 0;
                            var entitiesShiping = context.InventoryReport.Where(w => w.ProductId == item.ProductId && w.InventoryReportDate.Date == startDate.Date && listWarehouseId.Contains(w.WarehouseId)).ToList();
                            entitiesShiping.ForEach(itemShipping =>
                            {
                                shiping += itemShipping.QuantityDelivery;
                            });
                            detailModel.Shiping = shiping;
                            #endregion

                            #region Get Total Pending is done (Số lượng OK trong các lô ở trạng thái "Tạm dừng" trong  ngày tương ứng)
                            decimal pending = 0;
                            var entitiesPending = context.ProductionProcessDetail.Where(w => w.ProductId == item.ProductId && w.StatusId == entPendingStatus.CategoryId && w.EndDate.Value == startDate).ToList();
                            entitiesPending.ForEach(itemPending =>
                            {
                                pending += itemPending.ProductionNumber;
                            });
                            detailModel.Pending = pending;
                            #endregion

                            #region Get Total Stock is done (Số lượng tồn kho trong kho thành phẩm trong  ngày tương ứng)
                            decimal stock = 0;
                            var entitiesStock = context.InventoryReport.Where(w => w.ProductId == item.ProductId && listWarehouseId.Contains(w.WarehouseId) && (w.StartQuantity + w.QuantityReceiving > w.QuantityDelivery)).Select(s => new { s.ProductId, s.LotNoId, s.WarehouseId }).Distinct().ToList();
                            entitiesStock.ForEach(itemStock =>
                            {
                                var entStock = context.InventoryReport.Where(w => w.ProductId == itemStock.ProductId && w.LotNoId == itemStock.LotNoId && w.WarehouseId == itemStock.WarehouseId && w.InventoryReportDate.Date <= startDate.Date).OrderByDescending(o => o.InventoryReportDate).FirstOrDefault();
                                if (entStock != null)
                                {
                                    stock += (entStock.StartQuantity + entStock.QuantityReceiving) - entStock.QuantityDelivery;
                                }
                            });
                            detailModel.Stock = stock;
                            #endregion

                            #region Get Total Pfa is done (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm PFA  trong  ngày tương ứng)
                            decimal pfa = 0;
                            if (entStagePfa != null && entStageConfirmedStatus != null)
                            {
                                var entitiesPfa = context.ProductionProcessStage.Where(w => listProductionProcessDetailId.Contains(w.ProductionProcessDetailId)
                                                                                                    && (w.EndDate.HasValue && w.EndDate.Value.Date == startDate.Date)
                                                                                                    && w.StageNameId == entStagePfa.CategoryId //Pfa
                                                                                                    && w.StatusId == entStageConfirmedStatus.CategoryId //Trạng thái Đã xác nhận
                                                                                                    ).ToList();
                                entitiesPfa.ForEach(itemPfa =>
                                {
                                    if (itemPfa.TotalReached.HasValue)
                                    {
                                        pfa += itemPfa.TotalReached.Value;
                                    }
                                });
                            }
                            detailModel.Pfa = pfa;
                            #endregion

                            reportDetailModels.Add(detailModel);
                        }
                        model.ReportDetailModels = reportDetailModels.OrderByDescending(o => o.ReportDate).ToList();
                        reportModels.Add(model);
                    });
                }
                result.ReportModels = reportModels;
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetProductionProcessDetailErrorByIdResult GetProductionProcessDetailErrorById(GetProductionProcessDetailErrorByIdParameter parameter)
        {
            var result = new GetProductionProcessDetailErrorByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy dữ liệu bảng kiểm tra hàng lỗi thành công!",
            };
            try
            {
                var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId);
                if (entProductionProcessDetail != null)
                {
                    var entProduct = context.Product.FirstOrDefault(f => f.ProductId == entProductionProcessDetail.ProductId);
                    var entLotNo = context.LotNo.FirstOrDefault(f => f.LotNoId == entProductionProcessDetail.LotNoId);
                    var entitiesProductionProcessStage = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == parameter.ProductionProcessDetailId).OrderByDescending(o => o.SortOrder).ToList();
                    var listProductionProcessStageId = entitiesProductionProcessStage.Select(s => s.Id).ToList();

                    var entitiesErrorStage = context.ProductionProcessErrorStage.Where(w => listProductionProcessStageId.Contains(w.ProductionProcessStageId)).ToList();
                    var listStageGroupId = entitiesErrorStage.Select(s => s.StageGroupId).Distinct().ToList();
                    var listErrorItemId = entitiesErrorStage.Select(s => s.ErrorItemId).Distinct().ToList();

                    var entitiesStageGroup = context.Category.Where(w => listStageGroupId.Contains(w.CategoryId)).ToList();
                    var entitiesError = context.Category.Where(w => listErrorItemId.Contains(w.CategoryId)).ToList();

                    var entType = context.CategoryType.FirstOrDefault(w => w.CategoryTypeCode == "KHO");
                    var entWarehouseType = context.Category.FirstOrDefault(w => w.CategoryCode == WareHouseTypeCode.STOCK_KTP && w.CategoryTypeId == entType.CategoryTypeId);
                    var entitiesWarehouse = context.Warehouse.Where(w => w.WareHouseType == entWarehouseType.CategoryId); //Danh sách kho thành phẩm
                    var listWarehouseId = entitiesWarehouse.Select(s => s.WarehouseId).ToList();

                    var entInventoryReport = context.InventoryReport.Where(w => w.ProductId == entProductionProcessDetail.ProductId
                                                            && w.LotNoId == entProductionProcessDetail.LotNoId
                                                            && listWarehouseId.Contains(w.WarehouseId)
                                                            && w.QuantityDelivery > 0).OrderBy(o => o.InventoryReportDate).FirstOrDefault();

                    result.ProductionProcessDetailId = parameter.ProductionProcessDetailId;
                    result.CustomerName = entProductionProcessDetail.CustomerName;
                    if (entProduct != null)
                    {
                        result.ProductId = entProduct.ProductId;
                        result.ProductCode = entProduct.ProductCode;
                        result.ProductName = entProduct.ProductName;
                    }
                    if (entLotNo != null)
                    {
                        result.LotNoId = entLotNo.LotNoId;
                        result.LotNoName = entLotNo.LotNoName;
                    }
                    result.ProductionNumber = entProductionProcessDetail.ProductionNumber;
                    result.TotalReached = entProductionProcessDetail.TotalReached;
                    if (entInventoryReport != null)
                    {
                        result.DateShipping = entInventoryReport.InventoryReportDate;
                    }
                    if (entitiesProductionProcessStage.Count > 1)
                    {
                        var entProductionProcessStage = entitiesProductionProcessStage[1];
                        if (entProductionProcessStage.EndDate.HasValue)
                        {
                            result.CheckDate = entProductionProcessStage.EndDate.Value;                            
                        }
                        else if(entProductionProcessStage.StartDate.HasValue)
                        {
                            result.CheckDate = entProductionProcessStage.StartDate.Value;
                        }
                        if (entProductionProcessStage.TotalReached.HasValue)
                        {
                            result.TotalCheckReached = entProductionProcessStage.TotalReached.Value;
                        }
                    }
                    var errorStageModels = new List<ProductionProcessErrorStageModel>();
                    entitiesErrorStage.ForEach(item =>
                    {
                        var errorStageModel = new ProductionProcessErrorStageModel(item);
                        var entStageGroup = entitiesStageGroup.FirstOrDefault(f => f.CategoryId == item.StageGroupId);
                        if (entStageGroup != null)
                        {
                            errorStageModel.StageGroupCode = entStageGroup.CategoryCode;
                            errorStageModel.StageGroupName = entStageGroup.CategoryName;
                        }
                        var entError = entitiesError.FirstOrDefault(f => f.CategoryId == item.ErrorItemId);
                        if (entError != null)
                        {
                            errorStageModel.ErrorItemCode = entError.CategoryCode;
                            errorStageModel.ErrorItemName = entError.CategoryName;
                        }
                        errorStageModels.Add(errorStageModel);
                    });                    
                    result.ErrorStageModels = errorStageModels;
                }
            }
            catch(Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }

        public GetReportSpecificationByIdResult GetReportSpecificationById(GetReportSpecificationByIdParameter parameter)
        {
            var result = new GetReportSpecificationByIdResult
            {
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Lấy dữ liệu bảng kiểm tra QC thành công!",
            };
            try
            {
                var entProductionProcessDetail = context.ProductionProcessDetail.FirstOrDefault(f => f.Id == parameter.ProductionProcessDetailId);
                if (entProductionProcessDetail != null)
                {
                    #region Thông tin lô sản xuất
                    var modelProductionProcessDetail = new ProductionProcessDetailModel(entProductionProcessDetail);
                    var product = context.Product.FirstOrDefault(w => entProductionProcessDetail.ProductId == w.ProductId);
                    if (product != null)
                    {
                        modelProductionProcessDetail.ProductCode = product.ProductCode;
                        modelProductionProcessDetail.ProductName = product.ProductName;
                    }
                    var lotNo = context.LotNo.FirstOrDefault(l => entProductionProcessDetail.LotNoId == l.LotNoId);
                    if (lotNo != null)
                    {
                        modelProductionProcessDetail.LotNoName = lotNo.LotNoName;
                    }
                    var statu = context.Category.FirstOrDefault(c => entProductionProcessDetail.StatusId == c.CategoryId);
                    if (statu != null)
                    {
                        modelProductionProcessDetail.StatusCode = statu.CategoryCode;
                        modelProductionProcessDetail.StatusName = statu.CategoryName;
                    }
                    #endregion

                    var entitiesProductionProcessStage = context.ProductionProcessStage.Where(w => w.ProductionProcessDetailId == parameter.ProductionProcessDetailId).OrderByDescending(o => o.SortOrder).ToList();
                    var listProductionProcessStageId = entitiesProductionProcessStage.Select(s => s.Id).ToList();

                    var listStageNameId = entitiesProductionProcessStage.Select(s => s.StageNameId).Distinct().ToList();
                    var listStageGroupId = entitiesProductionProcessStage.Select(s => s.StageGroupId).Distinct().ToList();
                    var listDepartmentId = entitiesProductionProcessStage.Select(s => s.DepartmentId).Distinct().ToList();
                    var listStatusId = entitiesProductionProcessStage.Select(s => s.StatusId).Distinct().ToList();
                    
                    var listPersonInChargeId = entitiesProductionProcessStage.Select(s => s.PersonInChargeId).Distinct().ToList();
                    var listPersonVerifierId = entitiesProductionProcessStage.Where(w => w.PersonVerifierId.HasValue).Select(s => s.PersonVerifierId.Value).Distinct().ToList();
                    var listEmployeeId = new List<Guid>();
                    listPersonInChargeId.ForEach(item =>
                    {
                        listEmployeeId.AddRange(item);
                    });                    
                    listEmployeeId.AddRange(listPersonVerifierId);
                    listEmployeeId = listEmployeeId.Distinct().ToList();

                    var entitiesProductionProcessStageDetail = context.ProductionProcessStageDetail.Where(w => listProductionProcessStageId.Contains(w.ProductionProcessStageId.Value)).ToList();
                    var listProductionProcessStageDetailId = entitiesProductionProcessStageDetail.Select(s => s.Id).ToList();
                    var listSpecificationsId = entitiesProductionProcessStageDetail.Select(s => s.SpecificationsId).Distinct().ToList();

                    var entitiesProductionProcessStageDetailValue = context.ProductionProcessStageDetailValue.Where(w => listProductionProcessStageDetailId.Contains(w.ProductionProcessStageDetailId.Value)).ToList();
                    var listFieldTypeId = entitiesProductionProcessStageDetailValue.Select(s => s.FieldTypeId).Distinct().ToList();

                    var entitiesCategory = context.Category.Where(w => listStageNameId.Contains(w.CategoryId) 
                                                            || listStageGroupId.Contains(w.CategoryId) 
                                                            || listStatusId.Contains(w.CategoryId)
                                                            || listSpecificationsId.Contains(w.CategoryId)
                                                            || listFieldTypeId.Contains(w.CategoryId))
                            .Select(s => new { s.CategoryId, s.CategoryCode, s.CategoryName }).ToList();
                    var entitiesOrganization = context.Organization.Where(w => listDepartmentId.Contains(w.OrganizationId)).Select(s => new { s.OrganizationId, s.OrganizationCode, s.OrganizationName }).ToList();
                    var entitiesEmployee = context.Employee.Where(w => listEmployeeId.Contains(w.EmployeeId)).Select(s => new { s.EmployeeId, s.EmployeeCode, s.EmployeeName }).ToList();

                    var listConfigStepByStepStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigStepByStepStageId).ToList();
                    var listConfigContentStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigContentStageId).ToList();
                    var listConfigSpecificationsStageId = entitiesProductionProcessStageDetail.Select(s => s.ConfigSpecificationsStageId).ToList();

                    var entitiesConfigStepByStepStage = context.ConfigStepByStepStage.Where(w => listConfigStepByStepStageId.Contains(w.Id)).ToList();
                    var entitiesConfigContentStage = context.ConfigContentStage.Where(w => listConfigContentStageId.Contains(w.Id)).ToList();
                    var entitiesConfigSpecificationsStage = context.ConfigSpecificationsStage.Where(w => listConfigSpecificationsStageId.Contains(w.Id)).ToList();

                    var processStageModels = new List<ProductionProcessStageModel>();
                    entitiesProductionProcessStage.ForEach(itemStage =>
                    {
                        var modelProcessStage = new ProductionProcessStageModel(itemStage);
                        #region Thông tin công đoạn
                        var stage = entitiesCategory.FirstOrDefault(f => f.CategoryId == itemStage.StageNameId);
                        if (stage != null)
                        {
                            modelProcessStage.StageCode = stage.CategoryCode;
                            modelProcessStage.StageName = stage.CategoryName;
                        }
                        var stageGroup = entitiesCategory.FirstOrDefault(f => f.CategoryId == itemStage.StageGroupId);
                        if (stageGroup != null)
                        {
                            modelProcessStage.StageGroupCode = stageGroup.CategoryCode;
                            modelProcessStage.StageGroupName = stageGroup.CategoryName;
                        }
                        var status = entitiesCategory.FirstOrDefault(f => f.CategoryId == itemStage.StatusId);
                        if (status != null)
                        {
                            modelProcessStage.StatusCode = status.CategoryCode;
                            modelProcessStage.StatusName = status.CategoryName;
                        }
                        var department = entitiesOrganization.FirstOrDefault(f => f.OrganizationId == itemStage.DepartmentId);
                        if (department != null)
                        {
                            modelProcessStage.DepartmentCode = department.OrganizationCode;
                            modelProcessStage.DepartmentName = department.OrganizationName;
                        }
                        var curentPersonVerifier = entitiesEmployee.FirstOrDefault(f => f.EmployeeId == itemStage.PersonVerifierId);
                        if (curentPersonVerifier != null)
                        {
                            modelProcessStage.PersonVerifierCode = curentPersonVerifier.EmployeeCode;
                            modelProcessStage.PersonVerifierName = curentPersonVerifier.EmployeeName;
                        }

                        var curentPerformers = entitiesEmployee.Where(f => itemStage.SelectStartPerformerId.Contains(f.EmployeeId) || itemStage.SelectEndPerformerId.Contains(f.EmployeeId)).ToList();
                        if (curentPerformers != null)
                        {
                            curentPerformers.ForEach(itemPerformer =>
                            {
                                if (string.IsNullOrEmpty(modelProcessStage.PerformerCode))
                                {
                                    modelProcessStage.PerformerCode = itemPerformer.EmployeeCode;
                                    modelProcessStage.PerformerName = itemPerformer.EmployeeName;
                                }
                                else
                                {
                                    modelProcessStage.PerformerCode = modelProcessStage.PerformerCode + ", " + itemPerformer.EmployeeCode;
                                    modelProcessStage.PerformerName = modelProcessStage.PerformerCode + ", " + itemPerformer.EmployeeName;
                                }
                            });
                        }
                        #endregion

                        var processStageDetailModels = new List<ProductionProcessStageDetailModel>();
                        var curentProductionProcessStageDetail = entitiesProductionProcessStageDetail.Where(w => w.ProductionProcessStageId == itemStage.Id).ToList();
                        curentProductionProcessStageDetail.ForEach(itemStageDetail =>
                        {
                            var modelStageDetail = new ProductionProcessStageDetailModel(itemStageDetail);
                            #region Thông tin chi tiết công đoạn
                            var entConfigStepByStepStage = entitiesConfigStepByStepStage.FirstOrDefault(f => f.Id == modelStageDetail.ConfigStepByStepStageId);
                            if (entConfigStepByStepStage != null)
                            {
                                modelStageDetail.StepByStepStageName = entConfigStepByStepStage.Name;
                            }
                            var entConfigContentStage = entitiesConfigContentStage.FirstOrDefault(f => f.Id == modelStageDetail.ConfigContentStageId);
                            if (entConfigContentStage != null)
                            {
                                var entCategory = entitiesCategory.FirstOrDefault(f => f.CategoryId == entConfigContentStage.ContentId);
                                if (entCategory != null)
                                {
                                    modelStageDetail.ContentStageName = entCategory.CategoryName;
                                }
                            }
                            var entConfigSpecificationsStage = entitiesConfigSpecificationsStage.FirstOrDefault(f => f.Id == modelStageDetail.ConfigSpecificationsStageId);
                            if (entConfigSpecificationsStage != null)
                            {
                                var entCategory = entitiesCategory.FirstOrDefault(f => f.CategoryId == entConfigSpecificationsStage.SpecificationsId);
                                if (entCategory != null)
                                {
                                    modelStageDetail.SpecificationsStageName = entCategory.CategoryName;
                                }
                            }
                            #endregion

                            var processStageDetailValueModels = new List<ProductionProcessStageDetailValueModel>();
                            var curentStageDetailValue = entitiesProductionProcessStageDetailValue.Where(w => w.ProductionProcessStageDetailId == modelStageDetail.Id).ToList();
                            if (curentStageDetailValue != null)
                            {
                                curentStageDetailValue.ForEach(itemStageDetailValue =>
                                {
                                    var modelStageDetailValue = new ProductionProcessStageDetailValueModel(itemStageDetailValue);
                                    var entFieldType = entitiesCategory.FirstOrDefault(f => f.CategoryId == modelStageDetailValue.FieldTypeId);
                                    if (entFieldType != null)
                                    {
                                        modelStageDetailValue.FieldTypeCode = entFieldType.CategoryCode;
                                        modelStageDetailValue.FieldTypeName = entFieldType.CategoryName;
                                    }
                                    processStageDetailValueModels.Add(modelStageDetailValue);
                                });
                            }
                            modelStageDetail.ProcessStageDetailValueModels = processStageDetailValueModels;
                            processStageDetailModels.Add(modelStageDetail);
                        });
                        modelProcessStage.ProcessStageDetailModels = processStageDetailModels;
                        processStageModels.Add(modelProcessStage);
                    });
                    modelProductionProcessDetail.ProcessStageModels = processStageModels;
                }
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
                result.StatusCode = HttpStatusCode.ExpectationFailed;
            }
            return result;
        }
    }
}
