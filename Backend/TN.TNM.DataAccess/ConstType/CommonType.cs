using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.ConstType
{
    //Trạng thái lo sản xuất
    public static class ProcessStatusType
    {        
        public const string LO_NOT_PRODUCED = "TTLNCSX";//Chưa sản xuất
        public const string LO_BEGIN = "TTLNBD"; //Bắt đầu
        public const string LO_PRODUCTION = "TTLNDCSX";//Đang sản xuất
        public const string LO_PAUSE = "TTLNTD";//Tạm dừng
        public const string LO_FINISH = "TTLNHT";//Hoàn thành
        public const string LO_CANCEL = "TTLNH";//Hủy
    }
    //trạng thái công đoạn sản xuất
    public static class ProcessStageStatusType
    {
        public const string STAGE_NOT_BEGIN = "TTCDCBD";//Chưa bắt đầu
        public const string STAGE_BEGIN = "TTCDDTH";//Đang thực hiện
        public const string STAGE_FINISH = "TTCDHT";//Hoàn thành
        public const string STAGE_PAUSE = "TTCDTD";//Tạm dừng
        public const string STAGE_CONFIRMED = "TTCDDXN";//Đã xác nhận
        public const string STAGE_CANCEL = "TTCDH";//Hủy
    }
    //Trạng thái xuất kho
    public static class DeliveryStatusType
    {
        public const string DELIVERY_NEW = "TPHN";//Mới
        public const string DELIVERY_OUT_OF_STOCK = "NHK";//Đã xuất kho
    }
    //Trạng thái nhập kho
    public static class ReceivingStatusType
    {
        public const string RECEIVING_NEW = "TPHXN";//Mới
        public const string RECEIVING_WAIT = "TPHXCXN";//Chờ xác nhận
        public const string RECEIVING_OUT_OF_STOCK = "NHK";//Đã nhập kho
    }

    public static class GroupType
    {
        public const string GROUP_STAGE = "NCD";//Nhóm danh mục công đoạn
        public const string STAGE = "CD";// Danh mục công đoạn
        public const string TEST_CONTENT = "NDKT";//Danh mục ndung ktra
        public const string SPECIFICATIONS = "QC";//Danh mục quy cách
        public const string TEST_ERROR = "KTL";//Danh mục ktra lỗi
        public const string RESULT = "KKQ";//Kiểu kết quả
        public const string ProcessStatus = "LSX";//Trạng thái lô sản xuất
        public const string ProcessStageStatus = "TTCDSX";//Trạng thái công đoạn sản xuất
    }   
    public static class WarehouseTicketType
    {
        public const string RECEIVING_TYPE = "TPH";//Loại phiếu nhập
        public const string DELIVERY_TYPE = "TPHX"; //Loại phiếu xuất
    }
    public static class WarehouseDeliveryStatus //Trạng thái phiếu xuất kho
    {
        public const string NEW_TYPE = "TPHN";//Mới
        public const string CANCEL_TYPE = "HUY";//Hủy
        public const string READY_TYPE = "SAS";//Sẵn sàng
        public const string DRAFT_TYPE = "NHA";//Nháp
        public const string OUT_OF_STOCK_TYPE = "NHK";//Đã xuất kho
        public const string WAITING_TYPE = "CXK";//Chờ xuất kho
    }
    public static class WarehouseRecevingStatus //Trạng thái nhập kho
    {
        public const string READY_TYPE = "SAS";//Sẵn sàng
        public const string CANCEL_TYPE = "HUY";//Đã Hủy
        public const string WAITING_RECEIVING_TYPE = "CHO";//Chờ nhập kho
        public const string OUT_OF_STOCK_TYPE = "NHK";//Đã nhập kho
        public const string DRAFT_TYPE = "NHA";//Nháp
        public const string NEW_TYPE = "TPHXN";//Mới
        public const string WAITING_TYPE = "TPHXCXN";//Chờ xác nhận
    }
    public static class WareHouseTypeCode
    {
        public const string STOCK_NVL = "NVL"; //Kho nguyên vật liệu
        public const string STOCK_CCDC = "CCDC"; //CCDC
        public const string STOCK_TSK = "TSK"; //Kho tai su dung
        public const string STOCK_CSX = "CSX";//Kho chờ sản xuất
        public const string STOCK_KTP = "KTP"; //Kho thanh pham
    }

    public static class StageCode
    {
        public const string CORE = "Core";
        public const string FROMLTV = "FromLtv";
        public const string FROMCF = "FromCf";
        public const string FINI = "Fini";
        public const string INSVISUAL = "InsVisual";
        public const string PACKING = "Packing";
        public const string PFA = "Pfa";
    }
}
