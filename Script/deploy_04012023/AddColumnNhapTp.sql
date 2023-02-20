ALTER TABLE IF EXISTS public."InventoryReceivingVoucherMapping"
ADD COLUMN "QuantityProduct" numeric DEFAULT 0;

ALTER TABLE IF EXISTS public."InventoryReport"
ADD COLUMN "ProductionNumber" numeric DEFAULT 0;
