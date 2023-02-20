ALTER TABLE IF EXISTS public."ConfigSpecificationsStageValue"
    ADD COLUMN "ProductId" uuid;	
	
ALTER TABLE IF EXISTS public."ConfigSpecificationsStageValue"
    ADD COLUMN "InfoFormula" integer;
	
ALTER TABLE IF EXISTS public."ConfigSpecificationsStageValue"
    ADD COLUMN "Formula" integer;
	
ALTER TABLE IF EXISTS public."ConfigSpecificationsStageValue"
    ADD COLUMN "FormulaValue" numeric;	
	
	
ALTER TABLE IF EXISTS public."ProductionProcessStageDetailValue"
    ADD COLUMN "ProductId" uuid;	
	
ALTER TABLE IF EXISTS public."ProductionProcessStageDetailValue"
    ADD COLUMN "InfoFormula" integer;
	
ALTER TABLE IF EXISTS public."ProductionProcessStageDetailValue"
    ADD COLUMN "Formula" integer;
	
ALTER TABLE IF EXISTS public."ProductionProcessStageDetailValue"
    ADD COLUMN "FormulaValue" numeric;		
	
	
ALTER TABLE IF EXISTS public."InventoryReceivingVoucher"	
DROP COLUMN "InvoiceNumber";	

ALTER TABLE IF EXISTS public."InventoryReceivingVoucher"
ADD COLUMN  "InvoiceNumber" character varying(250) COLLATE pg_catalog."default";	

ALTER TABLE IF EXISTS public."InventoryReceivingVoucher"	
DROP COLUMN "OrderNumber";	
ALTER TABLE IF EXISTS public."InventoryReceivingVoucher"
ADD COLUMN "OrderNumber" character varying(250) COLLATE pg_catalog."default";
	