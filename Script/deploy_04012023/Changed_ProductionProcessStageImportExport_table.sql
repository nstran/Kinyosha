DROP TABLE IF EXISTS public."ProductionProcessStageImportExport";

CREATE TABLE IF NOT EXISTS public."ProductionProcessStageImportExport"
(
    "Id" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "ProductionProcessDetailId" bigint NOT NULL,
    "ProductionProcessStageId" bigint NOT NULL,
    "InventoryVoucherId" uuid NOT NULL,
    "InventoryVoucherCode" character varying(30) COLLATE pg_catalog."default" NOT NULL,
    "WarehouseId" uuid NOT NULL,
    "InventoryVoucherDate" date NOT NULL,
    "StageNameId" uuid NOT NULL,
    "IsExport" boolean NOT NULL,
    CONSTRAINT "ProductionProcessStageImportExport_pkey" PRIMARY KEY ("Id")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."ProductionProcessStageImportExport"
    OWNER to postgres;