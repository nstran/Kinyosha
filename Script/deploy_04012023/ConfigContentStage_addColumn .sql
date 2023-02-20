ALTER TABLE IF EXISTS public."ConfigContentStage"
    ADD COLUMN "IsContentValues" boolean DEFAULT FALSE;	
ALTER TABLE IF EXISTS public."ProductionProcessStageDetail"
    ADD COLUMN "IsContentValues" boolean DEFAULT FALSE;
ALTER TABLE IF EXISTS public."ProductionProcessStageDetail"
    ADD COLUMN "ContenValues" character varying(250) COLLATE pg_catalog."default"
	