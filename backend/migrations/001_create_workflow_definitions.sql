-- 001_create_workflow_definitions.sql

CREATE TABLE public.workflows (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT chk_workflows_name CHECK (char_length(btrim(name)) > 0)
);

CREATE TABLE public.workflow_steps (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    position INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    step_type TEXT NOT NULL,
    config JSONB NOT NULL,
    max_attempts INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    CONSTRAINT chk_workflow_steps_max_attempts CHECK (max_attempts > 0),
    CONSTRAINT chk_workflow_steps_position CHECK (position > 0),
    CONSTRAINT chk_workflow_steps_config_type CHECK (jsonb_typeof(config) = 'object'),
    CONSTRAINT chk_workflow_steps_name CHECK (char_length(btrim(name)) > 0),
    CONSTRAINT chk_workflow_steps_step_type CHECK (char_length(btrim(step_type)) > 0),

    CONSTRAINT uq_workflow_steps_position UNIQUE (workflow_id, position),
    CONSTRAINT uq_workflow_steps_workflow_id_id UNIQUE (workflow_id, id),

    CONSTRAINT fk_workflow_steps_workflow FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE RESTRICT
);