ALTER TABLE IF EXISTS public."ConfigStepByStepStage"
    ADD COLUMN "IsShowTextBox" boolean DEFAULT FALSE;
	
ALTER TABLE IF EXISTS public."ProductionProcessStageDetail"
    ADD COLUMN "IsShowTextBox" boolean DEFAULT FALSE;
ALTER TABLE IF EXISTS public."ProductionProcessStageDetail"
    ADD COLUMN "MachineNumber" character varying(250) COLLATE pg_catalog."default";