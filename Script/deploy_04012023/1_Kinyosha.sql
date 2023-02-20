ALTER TABLE IF EXISTS public."InventoryReceivingVoucher"
ADD COLUMN "VendorId" uuid;	

ALTER TABLE IF EXISTS public."InventoryReceivingVoucher"	
	DROP COLUMN "PartnersName";
