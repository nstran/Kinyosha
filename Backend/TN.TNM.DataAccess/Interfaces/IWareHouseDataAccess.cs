using TN.TNM.DataAccess.Messages.Parameters.Employee;
using TN.TNM.DataAccess.Messages.Parameters.WareHouse;
using TN.TNM.DataAccess.Messages.Results.Employee;
using TN.TNM.DataAccess.Messages.Results.WareHouse;

namespace TN.TNM.DataAccess.Interfaces
{
    public interface IWareHouseDataAccess
    {
        CreateUpdateWareHouseResult CreateUpdateWareHouse(CreateUpdateWareHouseParameter parameter);
        SearchWareHouseResult SearchWareHouse(SearchWareHouseParameter parameter);
        GetWareHouseChaResult GetWareHouseCha(GetWareHouseChaParameter parameter);
        GetListWareHouseResult GetListWareHouse(GetListWareHouseParameter parameter);
        GetVendorOrderByVendorIdResult GetVendorOrderByVendorId(GetVendorOrderByVendorIdParameter parameter);
        GetVendorOrderDetailByVenderOrderIdResult GetVendorOrderDetailByVenderOrderId(GetVendorOrderDetailByVenderOrderIdParameter parameter);
        DownloadTemplateSerialResult DownloadTemplateSerial(DownloadTemplateSerialParameter parameter);
        //CreateOrUpdateInventoryVoucherResult CreateOrUpdateInventoryVoucher(CreateOrUpdateInventoryVoucherParameter parameter);
        RemoveWareHouseResult RemoveWareHouse(RemoveWareHouseParameter parameter);
        //GetInventoryReceivingVoucherByIdResult GetInventoryReceivingVoucherById(GetInventoryReceivingVoucherByIdParameter parameter);
        GetListInventoryReceivingVoucherResult GetListInventoryReceivingVoucher(GetListInventoryReceivingVoucherParameter parameter);
        GetListCustomerOrderByIdCustomerIdResult GetListCustomerOrderByIdCustomerId(GetListCustomerOrderByIdCustomerIdParameter parameter);
        GetCustomerOrderDetailByCustomerOrderIdResult GetCustomerOrderDetailByCustomerOrderId(GetCustomerOrderDetailByCustomerOrderIdParameter parameter);
        CheckQuantityActualReceivingVoucherResult CheckQuantityActualReceivingVoucher(CheckQuantityActualReceivingVoucherParameter parameter);
        FilterVendorResult FilterVendor(FilterVendorParameter parameter);
        FilterCustomerResult FilterCustomer(FilterCustomerParameter parameter);
        ChangeStatusInventoryReceivingVoucherResult ChangeStatusInventoryReceivingVoucher(ChangeStatusInventoryReceivingVoucherParameter parameter);
        ChangeStatusInventoryReceivingVoucherResult ChangeStatusInventoryReceivingVoucherTP(ChangeStatusInventoryReceivingVoucherParameter parameter);
        ChangeStatusInventoryReceivingVoucherResult ChangeStatusInventoryReceivingVoucherProduction(ChangeStatusInventoryReceivingVoucherParameter parameter);
        DeleteInventoryReceivingVoucherResult DeleteInventoryReceivingVoucher(DeleteInventoryReceivingVoucherParameter parameter);
        InventoryDeliveryVoucherFilterCustomerOrderResult InventoryDeliveryVoucherFilterCustomerOrder(InventoryDeliveryVoucherFilterCustomerOrderParameter parameter);
        InventoryDeliveryVoucherFilterVendorOrderResult InventoryDeliveryVoucherFilterVendorOrder(InventoryDeliveryVoucherFilterVendorOrderParameter parameter);
        GetTop10WarehouseFromReceivingVoucherResult GetTop10WarehouseFromReceivingVoucher(GetTop10WarehouseFromReceivingVoucherParameter parameter);
        GetSerialResult GetSerial(GetSerialParameter parameter);
        CreateUpdateInventoryDeliveryVoucherResult CreateUpdateInventoryDeliveryVoucher(CreateUpdateInventoryDeliveryVoucherParameter parameter);
        CreateUpdateInventoryDeliveryVoucherResult CreateUpdateInventoryDeliveryVoucherRequest(CreateUpdateInventoryDeliveryVoucherParameter parameter);
        GetInventoryDeliveryVoucherByIdResult GetInventoryDeliveryVoucherById(GetInventoryDeliveryVoucherByIdParameter parameter);
        DeleteInventoryDeliveryVoucherResult DeleteInventoryDeliveryVoucher(DeleteInventoryDeliveryVoucherParameter parameter);
        ChangeStatusInventoryDeliveryVoucherResult ChangeStatusInventoryDeliveryVoucher(ChangeStatusInventoryDeliveryVoucherParameter parameter);
        ChangeStatusInventoryDeliveryVoucherResult ChangeStatusInventoryDeliveryVoucherRequest(ChangeStatusInventoryDeliveryVoucherParameter parameter);
        ChangeStatusInventoryDeliveryVoucherResult ChangeStatusCancelInventoryDeliveryVoucherRequest(ChangeStatusInventoryDeliveryVoucherParameter parameter);
        FilterCustomerInInventoryDeliveryVoucherResult FilterCustomerInInventoryDeliveryVoucher(FilterCustomerInInventoryDeliveryVoucherParameter parameter);
        SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucher(SearchInventoryDeliveryVoucherParameter parameter);
        SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherNVLCCDC(SearchInventoryDeliveryVoucherParameter parameter);
        SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherSX(SearchInventoryDeliveryVoucherParameter parameter);
        SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherTP(SearchInventoryDeliveryVoucherParameter parameter);
        FilterProductResult FilterProduct(FilterProductParameter parameter);
        GetProductNameAndProductCodeResult GetProductNameAndProductCode(GetProductNameAndProductCodeParameter parameter);
        GetVendorInvenoryReceivingResult GetVendorInvenoryReceiving(GetVendorInvenoryReceivingParameter parameter);
        GetCustomerDeliveryResult GetCustomerDelivery(GetCustomerDeliveryParameter parameter);
        InStockReportResult InStockReport(InStockReportParameter parameter);
        CreateUpdateWarehouseMasterdataResult CreateUpdateWarehouseMasterdata(CreateUpdateWarehouseMasterdataParameter parameter);

        GetMasterDataSearchInStockReportResult GetMasterDataSearchInStockReport(
            GetMasterDataSearchInStockReportParameter parameter);

        //SearchInStockReportResult SearchInStockReport(SearchInStockReportParameter parameter);
        //GetDanhSachSanPhamCuaPhieuResult GetDanhSachSanPhamCuaPhieu(GetDanhSachSanPhamCuaPhieuParameter parameter);
        //GetDanhSachKhoConResult GetDanhSachKhoCon(GetDanhSachKhoConParameter parameter);
        CreateItemInventoryReportResult CreateItemInventoryReport(CreateItemInventoryReportParameter parameter);
        UpdateItemInventoryReportResult UpdateItemInventoryReport(UpdateItemInventoryReportParameter parameter);
        //CreateUpdateSerialResult CreateUpdateSerial(CreateUpdateSerialParameter parameter);
        DeleteItemInventoryReportResult DeleteItemInventoryReport(DeleteItemInventoryReportParameter parameter);
        //GetSoGTCuaSanPhamTheoKhoResult GetSoGTCuaSanPhamTheoKho(GetSoGTCuaSanPhamTheoKhoParameter parameter);
        //CreatePhieuNhapKhoResult CreatePhieuNhapKho(CreatePhieuNhapKhoParameter parameter);
        //GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKho(GetDetailPhieuNhapKhoParameter parameter);
        SuaPhieuNhapKhoResult SuaPhieuNhapKho(SuaPhieuNhapKhoParameter parameter);
        //KiemTraKhaDungPhieuNhapKhoResult KiemTraKhaDungPhieuNhapKho(KiemTraKhaDungPhieuNhapKhoParameter parameter);
        //DanhDauCanLamPhieuNhapKhoResult DanhDauCanLamPhieuNhapKho(DanhDauCanLamPhieuNhapKhoParameter parameter);
        //NhanBanPhieuNhapKhoResult NhanBanPhieuNhapKho(NhanBanPhieuNhapKhoParameter parameter);
        XoaPhieuNhapKhoResult XoaPhieuNhapKho(XoaPhieuNhapKhoParameter parameter);
        HuyPhieuNhapKhoResult HuyPhieuNhapKho(HuyPhieuNhapKhoParameter parameter);
        //KhongGiuPhanPhieuNhapKhoResult KhongGiuPhanPhieuNhapKho(KhongGiuPhanPhieuNhapKhoParameter parameter);
        //KiemTraNhapKhoResult KiemTraNhapKho(KiemTraNhapKhoParameter parameter);
        //DatVeNhapPhieuNhapKhoResult DatVeNhapPhieuNhapKho(DatVeNhapPhieuNhapKhoParameter parameter);
        GetListProductPhieuNhapKhoResult GetListProductPhieuNhapKho(GetListProductPhieuNhapKhoParameter parameter);

        GetMasterDataListPhieuNhapKhoResult GetMasterDataListPhieuNhapKho(
            GetMasterDataListPhieuNhapKhoParameter parameter);

        SearchListPhieuNhapKhoResult SearchListPhieuNhapKho(SearchListPhieuNhapKhoParameter parameter);
        GetInventoryInfoResult GetInventoryInfo(GetInventoryInfoParameter parameter);
        GetInventoryInfoResult GetInventoryInfoSX(GetInventoryInfoParameter parameter);
        GetInventoryInfoTPResult GetInventoryInfoTP(GetInventoryInfoTPParameter parameter);
        GetInventoryInfoTPResult GetChiTietBaoCaoTP(GetInventoryInfoTPParameter parameter);
        CreatePhieuNhapKhoResult CreatePhieuNhapKhoNVLCCDC(CreatePhieuNhapKhoParameter parameter);
        CreatePhieuNhapKhoResult CreatePhieuNhapKhoTP(CreatePhieuNhapKhoParameter parameter);
        //CreatePhieuNhapKhoResult CreatePhieuNhapKhoCCDC(CreatePhieuNhapKhoParameter parameter);
        //SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoCCDC(SearchListPhieuNhapKhoParameter parameter);
        SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoNVLCCDC(SearchListPhieuNhapKhoParameter parameter);
        SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoSX(SearchListPhieuNhapKhoParameter parameter);
        //SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoTSD(SearchListPhieuNhapKhoParameter parameter);
        SearchListPhieuNhapKhoResult SearchListPhieuNhapKhoTP(SearchListPhieuNhapKhoParameter parameter);
        GetMasterDataPhieuNhapKhoResult GetMasterCreatePhieuNhapKhoNVLCCDC(GetMasterDataPhieuNhapKhoParameter parameter);
        //GetMasterDataPhieuNhapKhoResult GetMasterCreatePhieuNhapKhoCCDC(GetMasterDataPhieuNhapKhoParameter parameter);
        //GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoCCDC(GetDetailPhieuNhapKhoParameter parameter);
        GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoNVLCCDC(GetDetailPhieuNhapKhoParameter parameter);
        GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoSX(GetDetailPhieuNhapKhoParameter parameter);
        GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoTSD(GetDetailPhieuNhapKhoParameter parameter);
        GetDetailPhieuNhapKhoResult GetDetailPhieuNhapKhoTP(GetDetailPhieuNhapKhoParameter parameter);
        GetMasterInventoryDeliveryVoucherResult GetMasterInventoryDeliveryVoucher(GetMasterInventoryDeliveryVoucherParameter parameter);
        SearchInventoryDeliveryVoucherResult SearchInventoryDeliveryVoucherRequest(SearchInventoryDeliveryVoucherParameter parameter);
        GetEmployeeByOrganizationIdResult GetEmployeeByOrganizationId(GetEmployeeByOrganizationIdParameter parameter);
        GetInventoryStockByWarehouseResult GetInventoryStockByWarehouse(GetInventoryStockByWarehouseParameter parameter);
    }
}