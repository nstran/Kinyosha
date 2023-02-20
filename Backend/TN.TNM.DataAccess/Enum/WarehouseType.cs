using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Enum
{
    public enum WarehouseType
    {
        NVL = 0, //Kho nguyên vật liệu
        CCDC = 1, //CCDC
        TSK = 2, // Kho tai su dung
        CSX = 3,// Kho chờ sản xuất
        KTP = 4, // Kho thanh pham
        KH = 5, // Kho Hủy
    }
    public enum ScreenType
    {
        DNX = 0,
        NVL = 1,
        SX = 2,
        TP = 3
    }
    public enum InventoryDeliveryVoucherType
    {
        KSX = 0, // Kho sản xuất
        KHC = 1, // Kho hành chính
        XYC = 2, // Xuất lại
        XH = 3, // Xuất khác
        XSX = 4, // Xuất sản xuất
        XTL = 5, // Xuất trả lại nguyên vật liệu KHO NVL, CCDC
        XKK = 6, // Xuất kiểm kê
        XTP = 7,// Xuat thanh pham
        XNG=8, //Xuat NG
        TLNVL=9, //Xuất trả nguyên vật liệu KHO CSX
        TLCCDC=10,//Xuất trả lại CCDC KHO CSX 
        TLTSD = 11, //Xuất trả NVL TSD
        XBH = 12, //Xuất bán hàng
    }

    public enum InventoryReceivingVoucherType
    {
        PNM = 0, // Phiếu nhập mới
        PNK = 1, // Phiếu nhập khác
        PNL = 2, // Phiếu nhập lại, sử dụng cho dropdown "Từ phiếu nhập lại" trong tạo mới phiếu xuất Kho CCDC, NVL
        NKK = 3, //Nhập kiểm kê
        PNNG = 4, //Nhập NG
        PNTP = 5, //Nhập NG
        TPSDG = 6, // thành phẩm sau đóng gói
        TPKTL = 7, // sau kiểm tra
    }
}
