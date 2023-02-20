using TN.TNM.DataAccess.Messages.Parameters.ProductionProcess;
using TN.TNM.DataAccess.Messages.Results.ProductionProcess;

namespace TN.TNM.DataAccess.Interfaces
{
    public interface IProductionProcessDataAccess
    {
        /// <summary>
        /// Get all ProductionProcess
        /// </summary>
        /// <param name="parameter"></param>
        /// Code: Mã lệnh sản xuất
        /// <returns>Result</returns>
        /// The list ProductionProcess
        GetAllProductionProcessResult GetAllProductionProcess(GetAllProductionProcessParameter parameter);
        /// <summary>
        /// GetProductionProcessById
        /// </summary>
        /// <param name="parameter"></param>
        /// Id: Mã lệnh sản xuất
        /// <returns>Result</returns>
        /// The ProductionProcessModel
        GetProductionProcessByIdResult GetProductionProcessById(GetProductionProcessByIdParameter parameter);
        /// <summary>
        /// Save ProductionProcess
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcess
        /// <returns>Result</returns>
        /// ProductionProcess
        SaveProductionProcessResult SaveProductionProcess(SaveProductionProcessParameter parameter);
        /// <summary>
        /// CreateLotNo - tạo lô sản xuất
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessId: Id lệnh sản xuất
        /// ConfigProductionId: Id cấu hình sản xuất
        /// CustomerName: Tên khách hàng
        /// ProductId: Id sản phẩm
        /// ProductNumber: số lượng sản xuất
        /// <returns>Result</returns>
        /// List LotNo theo lệnh sản xuất
        CreateLotNoResult CreateLotNo(CreateLotNoParameter parameter);
        /// <summary>
        /// Delete ProductionProcess
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessId
        /// <returns>Result</returns>
        /// 
        DeleteProductionProcessResult DeleteProductionProcess(DeleteProductionProcessParameter parameter);
        /// <summary>
        /// Delete ProductionProcessDetailById
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId
        /// <returns>Result</returns>
        /// 
        DeleteProductionProcessDetailByIdResult DeleteProductionProcessDetailById(DeleteProductionProcessDetailByIdParameter parameter);
        /// <summary>
        /// Get all ConfigProduction By ProductId
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductId: Mã sản phẩm
        /// <returns>Result</returns>
        /// The list ConfigProduction
        GetConfigProductionByProductIdResult GetConfigProductionByProductId(GetConfigProductionByProductIdParameter parameter);
        /// <summary>
        /// Get all ConfigurationProduct By ProductId
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductId: Mã sản phẩm
        /// <returns>Result</returns>
        /// The list ConfigurationProduct
        GetConfigurationProductByProductIdResult GetConfigurationProductByProductId(GetConfigurationProductByProductIdParameter parameter);
        /// <summary>
        /// Get all ProductionProcessDetail By ProductId
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductId: Mã sản phẩm
        /// <returns>Result</returns>
        /// The list ProductionProcessDetail
        GetProductionProcessDetailByProductIdResult GetProductionProcessDetailByProductId(GetProductionProcessDetailByProductIdParameter parameter);
        /// <summary>
        /// Get ProductionProcessDetail By Id Màn hình (THÔNG TIN LÔ)
        /// </summary>
        /// <param name="parameter"></param>
        /// Id: Mã lô sản xuất
        /// <returns>Result</returns>
        /// The ProductionProcessDetail
        GetProductionProcessDetailByIdResult GetProductionProcessDetailById(GetProductionProcessDetailByIdParameter parameter);
        /// <summary>
        /// Get ProductionProcessDetail By Id and UserId (Ipad)
        /// </summary>
        /// <param name="parameter"></param>
        /// Id: Mã lô sản xuất
        /// <returns>Result</returns>
        /// The ProductionProcessDetail
        GetProductionProcessDetailByIdAndUserIdResult GetProductionProcessDetailByIdAndUserId(GetProductionProcessDetailByIdAndUserIdParameter parameter);
        /// <summary>
        /// Get TimeSheetDaily
        /// </summary>
        /// <param name="parameter"></param>
        /// TimeSheetDate: Ngày
        /// <returns>Result</returns>
        /// The TimeSheetDailyModel
        GetTimeSheetDailyResult GetTimeSheetDaily(GetTimeSheetDailyParameter parameter);
        /// <summary>
        /// Get TimeSheetDailyMonth
        /// </summary>
        /// <param name="parameter"></param>
        /// TimeSheetDate: Tháng/năm
        /// <returns>Result</returns>
        /// The List TimeSheetDailyModel
        GetTimeSheetDailyMonthResult GetTimeSheetDailyMonth(GetTimeSheetDailyMonthParameter parameter);
        /// <summary>
        /// Save TimeSheetDaily
        /// </summary>
        /// <param name="parameter"></param>
        /// Model: TimeSheetDailyModel
        /// <returns>Result</returns>
        /// The TimeSheetDailyModel
        SaveTimeSheetDailyResult SaveTimeSheetDaily(SaveTimeSheetDailyParameter parameter);
        /// <summary>
        /// Save Status ProductionProcessDetail By Id
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId:
        /// StatusId
        /// <returns>Result</returns>
        /// 
        SaveStatusProductionProcessDetailByIdResult SaveStatusProductionProcessDetailById(SaveStatusProductionProcessDetailByIdParameter parameter);
        /// <summary>
        /// Create ProductionProcessDetail
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailModel:
        /// <returns>Result</returns>
        /// 
        CreateProductionProcessDetailResult CreateProductionProcessDetail(CreateProductionProcessDetailParameter parameter);

        /// <summary>
        /// GetProductionProductByUserId - Danh sách sản phẩm đang sản xuất
        /// </summary>
        /// <param name="parameter"></param>
        /// UserId:
        /// <returns>Result</returns>
        /// Model
        /// 
        GetProductionProductByUserIdResult GetProductionProductByUserId(GetProductionProductByUserIdParameter parameter);

        /// <summary>
        /// GetProductionProcessStageById - Lấy công đoạn sản xuất theo Id
        /// </summary>
        /// <param name="parameter"></param>
        /// Id: Id công đoạn sản xuất
        /// <returns>Result</returns>
        /// Model
        /// 
        GetProductionProcessStageByIdResult GetProductionProcessStageById(GetProductionProcessStageByIdParameter parameter);
        /// <summary>
        /// SaveProductionProcessErrorStage - Lưu danh sách hạng mục lỗi
        /// </summary>
        /// <param name="parameter"></param>
        /// Model: List ProductionProcessErrorStageModel
        /// <returns>Result</returns>
        /// 
        SaveProductionProcessErrorStageResult SaveProductionProcessErrorStage(SaveProductionProcessErrorStageParameter parameter);
        /// <summary>
        /// SaveProductionProcessStage - Lưu chi tiết công đoạn
        /// </summary>
        /// <param name="parameter"></param>
        /// Model: ProductionProcessStageModel
        /// <returns>Result</returns>
        /// 
        SaveProductionProcessStageResult SaveProductionProcessStage(SaveProductionProcessStageParameter parameter);
        /// <summary>
        /// GetProductInputByProductionProcessStageId - Danh sách nguyên vật liệu đầu vào công đoạn
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessStageId:  //Id công đoạn sản xuất
        /// WarehouseId: //Id kho hàng
        /// <returns>Result</returns>
        /// 
        GetProductInputByProductionProcessStageIdResult GetProductInputByProductionProcessStageId(GetProductInputByProductionProcessStageIdParameter parameter);
        /// <summary>
        /// ConfirmProductInputByProductionProcessStageId - Xác nhận danh sách nguyên vật liệu đầu vào công đoạn
        /// </summary>
        /// <param name="parameter"></param>
        /// List ProductionProcessStageProductInputModel
        /// <returns>Result</returns>
        /// 
        ConfirmProductInputByProductionProcessStageIdResult ConfirmProductInputByProductionProcessStageId(ConfirmProductInputByProductionProcessStageIdParameter parameter);
        /// <summary>
        /// ImportNG - Nhập kho NG
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessStageId: Id công đoạn sản xuất
        /// AmountReuse: số lượng tái sử dụng
        /// NumberCancel: số lượng Hủy
        /// WarehouseId: Kho nhập
        /// <returns>Result</returns>
        /// 
        ImportNGResult ImportNG(ImportNGParameter parameter);
        /// <summary>
        /// ChangeStatusProductionProcessStage - Thay đổi trạng thái
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessStageId: Id công đoạn sản xuất
        /// StatusId: Id trạng thái
        /// <returns>Result</returns>
        /// 
        ConfirmProductionProcessStageByIdResult ConfirmProductionProcessStageById(ConfirmProductionProcessStageByIdParameter parameter);
        /// <summary>
        /// CancelProductionProcessDetailById - Hủy lô
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId: Id Lô
        /// StatusId: Id trạng thái
        /// TPWarehouseId: Id kho thành phẩm
        /// QuantityReuse: số lượng tái thành phẩm
        /// QuantityCancel: số lượng hủy
        /// NVLWarehouseId: Id kho nguyên vật liệu
        /// ProductInputModels: danh sách nguyên vật liệu chưa sử dụng
        /// <returns>Result</returns>
        /// 
        CancelProductionProcessDetailByIdResult CancelProductionProcessDetailById(CancelProductionProcessDetailByIdParameter parameter);
        /// <summary>
        /// GetMain - Lấy dữ liệu trang chủ
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns>Result</returns>
        /// 
        GetMainResult GetMain(GetMainParameter parameter);
        /// <summary>
        /// ProductionReport - Báo cáo sản xuất
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns>Result</returns>
        /// 
        ProductionReportResult ProductionReport(ProductionReportParameter parameter);
        /// <summary>
        /// GetProductionProcessDetailErrorById - Bảng kiểm tra hàng lỗi theo lô sản xuất
        /// </summary>
        /// <param name="parameter"></param>
        /// <returns>Result</returns>
        /// 
        GetProductionProcessDetailErrorByIdResult GetProductionProcessDetailErrorById(GetProductionProcessDetailErrorByIdParameter parameter);
        /// <summary>
        /// GetReportSpecificationById - Bảng kiểm tra QC
        /// </summary>
        /// <param name="parameter"></param>
        /// ProductionProcessDetailId: Id lô sản xuất
        /// <returns>Result</returns>
        /// 
        GetReportSpecificationByIdResult GetReportSpecificationById(GetReportSpecificationByIdParameter parameter);
    }
}
