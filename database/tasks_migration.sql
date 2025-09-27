-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flower_id UUID REFERENCES flowers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL, -- 'watering', 'fertilizing', 'health_check', 'rotate', 'repot'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME, -- Optional specific time
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'overdue', 'cancelled'
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for the tasks table
-- Policy 1: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" ON tasks
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own tasks
CREATE POLICY "Users can view their own tasks" ON tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON tasks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_flower_id_idx ON tasks(flower_id);
CREATE INDEX IF NOT EXISTS tasks_scheduled_date_idx ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_task_type_idx ON tasks(task_type);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate tasks for a new flower
CREATE OR REPLACE FUNCTION generate_flower_tasks(
    p_flower_id UUID,
    p_user_id UUID,
    p_flower_name VARCHAR(255)
)
RETURNS VOID AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    task_date DATE;
    i INTEGER;
BEGIN
    -- Generate tasks for the next 3 months (90 days)
    FOR i IN 0..89 LOOP
        task_date := current_date + (i || ' days')::INTERVAL;
        
        -- Watering tasks (every 3-7 days, depending on plant type)
        IF i % 5 = 0 THEN
            INSERT INTO tasks (flower_id, user_id, task_type, title, description, scheduled_date, priority)
            VALUES (
                p_flower_id,
                p_user_id,
                'watering',
                'Water ' || p_flower_name,
                'Check soil moisture and water if needed',
                task_date,
                CASE 
                    WHEN i % 10 = 0 THEN 'high'
                    ELSE 'normal'
                END
            );
        END IF;
        
        -- Health check tasks (every 2 weeks)
        IF i % 14 = 0 THEN
            INSERT INTO tasks (flower_id, user_id, task_type, title, description, scheduled_date, priority)
            VALUES (
                p_flower_id,
                p_user_id,
                'health_check',
                'Health check - ' || p_flower_name,
                'Inspect plant for signs of disease, pests, or stress',
                task_date,
                'normal'
            );
        END IF;
        
        -- Fertilizing tasks (every 4 weeks)
        IF i % 28 = 0 THEN
            INSERT INTO tasks (flower_id, user_id, task_type, title, description, scheduled_date, priority)
            VALUES (
                p_flower_id,
                p_user_id,
                'fertilizing',
                'Fertilize ' || p_flower_name,
                'Apply appropriate fertilizer according to plant needs',
                task_date,
                'normal'
            );
        END IF;
        
        -- Rotate tasks (every 2 weeks, alternating with health checks)
        IF i % 14 = 7 THEN
            INSERT INTO tasks (flower_id, user_id, task_type, title, description, scheduled_date, priority)
            VALUES (
                p_flower_id,
                p_user_id,
                'rotate',
                'Rotate ' || p_flower_name,
                'Rotate plant to ensure even growth and light exposure',
                task_date,
                'low'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tasks for a specific date range
CREATE OR REPLACE FUNCTION get_tasks_for_date_range(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    id UUID,
    flower_id UUID,
    task_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    scheduled_date DATE,
    scheduled_time TIME,
    priority VARCHAR(20),
    status VARCHAR(20),
    completed_at TIMESTAMP WITH TIME ZONE,
    flower_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.flower_id,
        t.task_type,
        t.title,
        t.description,
        t.scheduled_date,
        t.scheduled_time,
        t.priority,
        t.status,
        t.completed_at,
        f.name as flower_name
    FROM tasks t
    LEFT JOIN flowers f ON t.flower_id = f.id
    WHERE t.user_id = p_user_id
        AND t.scheduled_date BETWEEN p_start_date AND p_end_date
    ORDER BY t.scheduled_date, t.scheduled_time NULLS LAST, t.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get task statistics for a month
CREATE OR REPLACE FUNCTION get_monthly_task_stats(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    total_tasks INTEGER,
    completed_tasks INTEGER,
    overdue_tasks INTEGER,
    watering_tasks INTEGER,
    health_check_tasks INTEGER,
    fertilizing_tasks INTEGER
) AS $$
DECLARE
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := DATE(p_year || '-' || p_month || '-01');
    end_date := (start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'overdue')::INTEGER as overdue_tasks,
        COUNT(*) FILTER (WHERE task_type = 'watering')::INTEGER as watering_tasks,
        COUNT(*) FILTER (WHERE task_type = 'health_check')::INTEGER as health_check_tasks,
        COUNT(*) FILTER (WHERE task_type = 'fertilizing')::INTEGER as fertilizing_tasks
    FROM tasks
    WHERE user_id = p_user_id
        AND scheduled_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
