using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TN.TNM.DataAccess.Enum;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Models.ProductionProcess
{
    public class ProductionProcessModel : BaseModel<Databases.Entities.ProductionProcess>
    {
        public ProductionProcessModel()
        {

        }
        public override DataAccess.Databases.Entities.ProductionProcess ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcess();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessModel(Databases.Entities.ProductionProcess model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public string ProductionCode { get; set; } //Mã lện sản xuất
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string Description { get; set; }
        public string UserName { get; set; }
        public List<ProductionProcessDetailModel> DetailModels { get; set; }//danh sách lô sản xuất
        public int ProductCount //Số lượng sản phẩm
        {
            get
            {
                if (DetailModels != null)
                {
                    return DetailModels.Where(w => !w.PrentId.HasValue).Sum(s=>s.ProductionNumber);
                }
                else
                {
                    return 0;
                }    
            }
        }

        public int LotNoCount //Số lượng LotNo
        {
            get
            {
                if (DetailModels != null)
                {
                    return DetailModels.Where(w => !w.PrentId.HasValue).Select(s => s.LotNoId).Distinct().Count();
                }
                else
                {
                    return 0;
                }
            }
        }
    }

    public class ProductionProcessDetailModel : BaseModel<Databases.Entities.ProductionProcessDetail>
    {
        public ProductionProcessDetailModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessDetail ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessDetail();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessDetailModel(Databases.Entities.ProductionProcessDetail model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ProductionProcessId { get; set; }
        public long ConfigProductionId { get; set; }//Id cấu hình sản xuất
        public Guid ProductId { get; set; } //Id sản phẩm
        public Guid? DepartmentId { get; set; } //Id bộ phận
        public long LotNoId { get; set; } //Id lotNo
        public int ProductionNumber { get; set; }//Số lượng sản xuất
        public int QuantityReached { get; set; }//Số lượng đạt
        public decimal? TotalPending { get; set; }//Số lượng chờ kiểm tra
        public DateTime? StartDate { get; set; }//Ngày bắt đầu sản xuất
        public DateTime? EndDate { get; set; }//Ngày kết thúc sản xuất
        public Guid StatusId { get; set; }//Trạng thái sản xuất
        public int Ltv { get; set; }
        public int Pc { get; set; }
        public string Description { get; set; }
        public string StageProgress { get; set; }//Công đoạn đang thực hiện
        public decimal? TotalQuantityProduction { get; set; }//Số lượng đang sản xuất (Công đoạn đang sản xuất)
        public long? PrentId { get; set; }//Lô cha liên quan
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string CustomerName { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string LotNoName { get; set; }
        public string StatusCode { get; set; }
        public string StatusName { get; set; }
        public List<ProductionProcessDetailModel> ListChildProductionProcessDetail { get; set; }
        public List<ProductionProcessStageModel> ProcessStageModels { get; set; }
        public List<ProductionProcessStageImportExportModel> ImportExportModels { get; set; }
        public List<ProductionProcessStageProductInputModel> ProductInputs { get; set; }//Danh sách sản phẩm đầu vào công đoạn đang sản xuất
        public string StageFinish { get; set; }//List tên công đoạn hoàn thành
    }

    public class ProductionProcessStageModel : BaseModel<Databases.Entities.ProductionProcessStage>
    {
        public ProductionProcessStageModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessStage ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessStage();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessStageModel(Databases.Entities.ProductionProcessStage model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ProductionProcessDetailId { get; set; }
        public long ConfigStageId { get; set; }//Mã cấu hình công đoạn
        public Guid? StageNameId { get; set; } //Id công đoạn
        public Guid? StageGroupId { get; set; }//Id nhóm công đoạn
        public int NumberPeople { get; set; } //Số người thực hiện
        public Guid? DepartmentId { get; set; }//Id Bộ phận
        public Guid[] PersonInChargeId { get; set; }//Danh sách người phụ trách
        public Guid? PersonVerifierId { get; set; }//Id người xác nhận
        //public Guid[] SelectPersonInChargeId { get; set; }//Chọn Người Phụ Trách
        public DateTime[] SelectImplementationDate { get; set; }//Chọn ngày thực hiện
        public Guid[] SelectStartPerformerId { get; set; }//Người bắt đầu công đoạn
        public Guid[] SelectEndPerformerId { get; set; }//Người kết thúc công đoạn
        public bool Alert { get; set; }
        public bool? Binding { get; set; } //Ràng buộc công đoạn
        public Guid? PreviousStageNameId { get; set; }//Công đoạn hoàn thành trước
        public int? FromTime { get; set; }//Thời gian từ
        public int? ToTime { get; set; }//Thời gian đến
        public int? SortOrder { get; set; }//Thứ tự công đoạn        
        public DateTime? StartDate { get; set; }//Ngày bắt đầu
        public DateTime? EndDate { get; set; }//Ngày kết thúc
        public DateTimeOffset? StartTime { get; set; }//Time bắt đầu
        public DateTimeOffset? EndTime { get; set; }//Time kết thúc
        public bool IsStageWithoutNg { get; set; }//Công đoạn không có NG
        public bool IsStageWithoutProduct { get; set; }//Công đoạn không có sản phẩm        
        public bool? Availability { get; set; }//Xác nhận
        public decimal? TotalProduction { get; set; }//Tổng số sản xuất
        public decimal? TotalReached { get; set; }//Tổng số lượng đạt
        public decimal? TotalPending { get; set; }//Số lượng chờ kiểm tra
        public decimal? TotalNotReached { get; set; }//Tổng số lượng không đạt (Số lượng NG) = TotalReuse + TotalCancel
        public decimal? TotalReuse { get; set; }//Số lượng tái sử dụng
        public decimal? TotalCancel { get; set; }//Số lượng Hủy
        public Guid? StatusId { get; set; } //trạng thái công đoạn
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string StageName { get; set; } //Tên công đoạn
        public string StageCode { get; set; } //Mã công đoạn
        public string StageGroupCode { get; set; }//Mã nhóm công đoạn
        public string StageGroupName { get; set; }//Mã nhóm công đoạnPerformerName
        public string DepartmentCode { get; set; }//Mã Bộ phận
        public string DepartmentName { get; set; }//Tên Bộ phận
        public string PersonVerifierCode { get; set; }//Mã người xác nhận
        public string PersonVerifierName { get; set; }//tên người xác nhận
        public string PerformerCode { get; set; }//Mã danh sách người thực hiện => StartPerformerId;EndPerformerId
        public string PerformerName { get; set; }//Tên danh sách người thực hiện => StartPerformerId;EndPerformerId
        public string StatusCode { get; set; }//Mã Trạng thái
        public string StatusName { get; set; }//Trạng thái
        public bool IsEndStage { get; set; }//=true: công đoạn cuối cùng; =false công đoạn trước cuối
        public List<ProductionProcessStageDetailModel> ProcessStageDetailModels { get; set; }//Chi tiết trong công đoạn
        public List<ProductionProcessErrorStageModel> ProcessErrorStageModels { get; set; }//Danh mục lỗi trong công đoạn
        public List<ProductionProcessListNgModel> ProcessListNgModels { get; set; }//Danh sách NG
        public List<PersonInChargeModel> PersonInChargeModels { get; set; }
    }

    public class PersonInChargeModel
    {
        public Guid? EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
    }

    public class ProductionProcessStageDetailModel : BaseModel<Databases.Entities.ProductionProcessStageDetail>
    {
        public ProductionProcessStageDetailModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessStageDetail ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessStageDetail();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessStageDetailModel(Databases.Entities.ProductionProcessStageDetail model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long? ProductionProcessStageId { get; set; } //Id công đoạn sản xuất
        public long? ConfigStepByStepStageId { get; set; } //Id các bước sản xuất trong công đoạn ConfigStepByStepStage.Id
        public long? ConfigContentStageId { get; set; }//Id Nội dung sản xuất ConfigContentStage.Id
        public long? ConfigSpecificationsStageId { get; set; }//Id quy cách sản xuất ConfigSpecificationsStage.Id
        public Guid SpecificationsId { get; set; }//Id quy cách ConfigSpecificationsStage.SpecificationsId
        public bool IsHaveValues { get; set; }//True - Nhập thêm nội dung vào quy cách sản xuất
        public string SpecificationsStageValues { get; set; }//Nội dung nhập thêm        
        public int NumberOfSamples { get; set; } //Số mẫu thử từ cấu hình
        public int? NewNumberOfSamples { get; set; } //Số mẫu thử mới
        public bool? IsShowTextBox { get; set; }//True - xuất hiện nhập MachineNumber
        public string MachineNumber { get; set; }//Số máy
        public bool? IsContentValues { get; set; }//True - xuất hiện nhập ContenValues
        public string ContenValues { get; set; }//
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string StepByStepStageName { get; set; }
        public string ContentStageName { get; set; }
        public string SpecificationsStageName { get; set; }
        public List<ProductionProcessStageDetailValueModel> ProcessStageDetailValueModels { get; set; }              
    }

    public class ProductionProcessStageDetailValueModel : BaseModel<Databases.Entities.ProductionProcessStageDetailValue>
    {
        public ProductionProcessStageDetailValueModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessStageDetailValue ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessStageDetailValue();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessStageDetailValueModel(Databases.Entities.ProductionProcessStageDetailValue model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long? ProductionProcessStageDetailId { get; set; }
        public Guid FieldTypeId { get; set; } //Trường dữ liệu
        public string FirstName { get; set; }//Tên hiển thị đầu trường dữ liệu
        public string LastName { get; set; }//Tên hiển thị sau trường dữ liệu
        public int LineOrder { get; set; }
        public int SortLineOrder { get; set; }
        public string Value { get; set; }//Giá trị trường dữ liệu
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string FieldTypeCode { get; set; }
        public string FieldTypeName { get; set; }
        public Guid? ProductId { get; set; }
        public int? InfoFormula { get; set; }
        public int? Formula { get; set; }
        public decimal? FormulaValue { get; set; }
    }

    public class ProductionProcessErrorStageModel : BaseModel<Databases.Entities.ProductionProcessErrorStage>
    {
        public ProductionProcessErrorStageModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessErrorStage ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessErrorStage();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessErrorStageModel(Databases.Entities.ProductionProcessErrorStage model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ProductionProcessStageId { get; set; }
        public Guid? StageGroupId { get; set; }
        public Guid? ErrorItemId { get; set; }
        public int? ErrorNumber { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string StageGroupCode { get; set; }//Mã nhóm công đoạn
        public string StageGroupName { get; set; }//Tên nhóm công đoạn
        public string ErrorItemCode { get; set; }//Mã hạng mục lỗi
        public string ErrorItemName { get; set; }//Tên hạng mục lỗi
    }

    public class ProductionProcessListNgModel : BaseModel<Databases.Entities.ProductionProcessListNg>
    {
        public ProductionProcessListNgModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessListNg ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessListNg();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessListNgModel(Databases.Entities.ProductionProcessListNg model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ProductionProcessStageId { get; set; }//Công đoạn sản xuất
        public long? LotNoId { get; set; } //LotNo
        public int NumberNg { get; set; }//Số lượng
        public Guid WarehouseId { get; set; } //Kho nhập sản phẩm tái sử dụng
        public Guid ProductId { get; set; } //Tên sản phẩm
        public Guid CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }        
    }    

    public class TimeSheetDailyModel : BaseModel<Databases.Entities.TimeSheetDaily>
    {
        public TimeSheetDailyModel()
        {

        }

        public override DataAccess.Databases.Entities.TimeSheetDaily ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.TimeSheetDaily();
            Mapper(this, entity);
            return entity;
        }

        public TimeSheetDailyModel(Databases.Entities.TimeSheetDaily model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public DateTime TimeSheetDate { get; set; } //Ngày báo cáo
        public int Nv1coreCa1 { get; set; } //Tổng nhân viên 1Core ca 1
        public int Vm1coreCa1 { get; set; }//Vắng mặt 1Core ca 1
        public int Dm1coreCa1 { get; set; }//Đi muôn 1Core ca 1
        public int Vs1coreCa1 { get; set; }//Về sớm 1Core ca 1
        public int Ot1coreCa1 { get; set; }//OT 1Core ca 1
        public Guid? UserCoreCa1 { get; set; }//Người cập nhật 1core ca 1
        public string UserCoreCa1Name { get; set; }//Người cập nhật 1core ca 1
        public string Gc1coreCa1 { get; set; }//Ghi chú 1Core ca 1

        public int Nv1coreCa2 { get; set; }//Tổng nhân viên 1Core ca 2
        public int Vm1coreCa2 { get; set; }//Vắng mặt 1Core ca 2
        public int Dm1coreCa2 { get; set; }//Đi muôn 1Core ca 2
        public int Vs1coreCa2 { get; set; }//Về sớm 1Core ca 2
        public int Ot1coreCa2 { get; set; }//OT 1Core ca 2
        public Guid? UserCoreCa2 { get; set; }//Người cập nhật 1core ca 2
        public string UserCoreCa2Name { get; set; }//Người cập nhật 1core ca 2
        public string Gc1coreCa2 { get; set; }//Ghi chú 1Core ca 2

        public int Nv1coreCa3 { get; set; }//Tổng nhân viên 1Core ca 3
        public int Vm1coreCa3 { get; set; }//Vắng mặt 1Core ca 3
        public int Dm1coreCa3 { get; set; }//Đi muôn 1Core ca 3
        public int Vs1coreCa3 { get; set; }//Về sớm 1Core ca 3
        public int Ot1coreCa3 { get; set; }//OT 1Core ca 3
        public Guid? UserCoreCa3 { get; set; }//Người cập nhật 1core ca 3
        public string UserCoreCa3Name { get; set; }//Người cập nhật 1core ca 3
        public string Gc1coreCa3 { get; set; }//Ghi chú 1Core ca 3

        public int Nv7isnVisualCa1 { get; set; }//Tổng nhân viên 7 Isn(Visual) ca 1
        public int Vm7isnVisualCa1 { get; set; }//Vắng mặt 7 Isn(Visual) ca 1
        public int Dm7isnVisualCa1 { get; set; }//Đi muôn 7 Isn(Visual) ca 1
        public int Vs7isnVisualCa1 { get; set; }//Về sớm 7 Isn(Visual) ca 1
        public int Ot7isnVisualCa1 { get; set; }//OT 7 Isn(Visual) ca 1
        public Guid? UserIsnVisualCa1 { get; set; }//Người cập nhật Isn(Visual) ca 1
        public string UserIsnVisualCa1Name { get; set; }//Người cập nhật Isn(Visual) ca 1
        public string Gc7isnVisualCa1 { get; set; }//Ghi chú 7 Isn(Visual) ca 1

        public int Nv7isnVisualCa2 { get; set; }//Tổng nhân viên 7 Isn(Visual) ca 2
        public int Vm7isnVisualCa2 { get; set; }//Vắng mặt 7 Isn(Visual) ca 2
        public int Dm7isnVisualCa2 { get; set; }//Đi muôn 7 Isn(Visual) ca 2
        public int Vs7isnVisualCa2 { get; set; }//Về sớm 7 Isn(Visual) ca 2
        public int Ot7isnVisualCa2 { get; set; }//OT 7 Isn(Visual) ca 2
        public Guid? UserIsnVisualCa2 { get; set; }//Người cập nhật Isn(Visual) ca 2
        public string UserIsnVisualCa2Name { get; set; }//Người cập nhật Isn(Visual) ca 2
        public string Gc7isnVisualCa2 { get; set; }//Ghi chú 7 Isn(Visual) ca 2
        
        public int Nv7isnVisualCa3 { get; set; }//Tổng nhân viên 7 Isn(Visual) ca 3
        public int Vm7isnVisualCa3 { get; set; }//Vắng mặt 7 Isn(Visual) ca 3
        public int Dm7isnVisualCa3 { get; set; }//Đi muôn 7 Isn(Visual) ca 3
        public int Vs7isnVisualCa3 { get; set; }//Về sớm 7 Isn(Visual) ca 3        
        public int Ot7isnVisualCa3 { get; set; }//OT 7 Isn(Visual) ca 3        
        public Guid? UserIsnVisualCa3 { get; set; }//Người cập nhật Isn(Visual) ca 3
        public string UserIsnVisualCa3Name { get; set; }//Người cập nhật Isn(Visual) ca 3
        public string Gc7isnVisualCa3 { get; set; }//Ghi chú 7 Isn(Visual) ca 3
    }

    public class TimeSheetModel
    {
        public TimeSheetModel()
        {

        }        
        public ShiftType Shift { get; set; }//Ca làm việc        
        public int Nv { get; set; } //Tổng nhân viên 1Core ca 1
        public int Vm { get; set; }//Vắng mặt 1Core ca 1
        public int Dm { get; set; }//Đi muôn 1Core ca 1
        public int Vs { get; set; }//Về sớm 1Core ca 1
        public int Ot { get; set; }//OT 1Core ca 1
        public Guid? User { get; set; }//Người cập nhật 1core ca 1
        public string UserName { get; set; }//Người cập nhật 1core ca 1
        public string Gc { get; set; }//Ghi chú 1Core ca 1
    }

    public class ProductionProcessStageProductInputModel : BaseModel<Databases.Entities.ProductionProcessStageProductInput>
    {
        public ProductionProcessStageProductInputModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessStageProductInput ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessStageProductInput();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessStageProductInputModel(Databases.Entities.ProductionProcessStageProductInput model)
        {
            Mapper(model, this);
        }

        public long Id { get; set; }
        public long ProductionProcessStageId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductUnitName { get; set; }
        public long LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal ProductionNumber { get; set; }//Số lượng sản xuất
        public decimal InventoryNumber { get; set; }//Số lượng tồn kho hiện tại
        public decimal QuantityNotProduced { get; set; }//Số lượng chưa sản xuất
        public Guid? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? WarehouseId { get; set; }

    }

    public class ProductionProcessStageImportExportModel : BaseModel<Databases.Entities.ProductionProcessStageImportExport>
    {
        public ProductionProcessStageImportExportModel()
        {

        }

        public override DataAccess.Databases.Entities.ProductionProcessStageImportExport ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.ProductionProcessStageImportExport();
            Mapper(this, entity);
            return entity;
        }

        public ProductionProcessStageImportExportModel(Databases.Entities.ProductionProcessStageImportExport model)
        {
            Mapper(model, this);
        }
        public long Id { get; set; }
        public long ProductionProcessDetailId { get; set; }//Id lô sản xuất
        public long ProductionProcessStageId { get; set; }//Id công đoạn sản xuất
        public Guid InventoryVoucherId { get; set; }//Id phiếu xuất/Nhập
        public string InventoryVoucherCode { get; set; }//Mã phiếu xuất/Nhập
        public Guid WarehouseId { get; set; }//Id Kho xuất/nhập
        public DateTime InventoryVoucherDate { get; set; }//Ngày Xuất/Nhập
        public Guid StageNameId { get; set; }//Id tên công đoạn
        public bool IsExport { get; set; }//True: xuất, False: Nhập
        public string StageName { get; set; }//tên công đoạn
        public string WarehouseName { get; set; }//tên kho
        public int InventoryScreenType { get; set; }//loại kho
        public int WarehouseType { get; set; }//loại kho
    }

    public class MainProductModel
    {
        public MainProductModel() { }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal TotalWaiting { get; set; }
        public decimal TotalProduction { get; set; }
        public List<StageGroupModel> GroupModels { get; set; }        
    }

    public class StageGroupModel
    {
        public StageGroupModel() { }
        public Guid StageNameId { get; set; }
        public string StageCode { get; set; }
        public string StageName { get; set; }
        public List<LotNoModel> LotNoModels { get; set; }
        public int TotalLotNo 
        {
            get 
            {
                if (LotNoModels == null) return 0;
                else return LotNoModels.Count;
            } 
        }
    }
    public class LotNoModel
    {
        public LotNoModel() { }
        public long LotNoId { get; set; }
        public string LotNoName { get; set; }
        public decimal TotalQuantity { get; set; }
        public string Description { get; set; }
    }

    public class ProductionReportModel
    {
        public ProductionReportModel() { }
        public Guid ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public List<ProductionReportDetailModel> ReportDetailModels { get; set; }
    }
    public class ProductionReportDetailModel
    {
        public ProductionReportDetailModel() { }
        public DateTime ReportDate { get; set; }
        public decimal Core { get; set; }//sơn phủ primer lõi (Số lượng OK ở công đoạn Phủ primer Lõi có trạng thái "Đã xác nhận" trong  ngày tương ứng)
        public decimal FromLtv { get; set; }//LTV (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm LTV trong  ngày tương ứng)
        public decimal FromCf { get; set; }//CF (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm CF trong  ngày tương ứng)
        public decimal Fini { get; set; }//Hoàn thiện (Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm Hoàn thiện trong  ngày tương ứng)
        public decimal InsHardness { get; set; }//Đo độ cứng (Lấy từ file đo độ cứng của QA ( Hiện chưa làm nên để trống giá trị cột này) trong  ngày tương ứng)
        public decimal InsLaser { get; set; }//Đo đường kính (Lấy từ file đo đường kính của QA ( ( Hiện chưa làm nên để trống giá trị cột này)) trong  ngày tương ứng)
        public decimal InsVisual { get; set; }//KTra ngoại quan (Số lượng OK trong công đoạn Kiểm tra ngoại quan ở trạng thái "Đã xác nhận" trong  ngày tương ứng)
        public decimal Packing { get; set; }//Đóng gói (Số lượng OK trong công đoạn Đóng gói ở trạng thái "Đã xác nhận" trong  ngày tương ứng)
        public decimal Shiping { get; set; }//Xuất hàng (Số lượng trong phiếu xuất kho thành phẩm loại  phiếu "Xuất bán hàng" trạng thái "Đã xuất kho" trong  ngày tương ứng)
        public decimal Pending { get; set; }//Cấm sử dụng (Số lượng OK trong các lô ở trạng thái "Tạm dừng" trong  ngày tương ứng)
        public decimal Stock { get; set; }//Tồn kho (Số lượng tồn kho trong kho thành phẩm trong  ngày tương ứng)
        public decimal Pfa { get; set; }//Số lượng OK trong công đoạn cuối cùng ở trạng thái "Đã xác nhận" thuộc nhóm PFA  trong  ngày tương ứng
    }
}
