ALTER TABLE IF EXISTS public."ConfigStage"
    ADD COLUMN "IsStageWithoutProduct" boolean NOT NULL DEFAULT TRUE;	

ALTER TABLE IF EXISTS public."ProductionProcessStage"
    ADD COLUMN "IsStageWithoutProduct" boolean NOT NULL DEFAULT TRUE;	
		