import { supabase } from '@/lib/supabaseClient';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return UUID_PATTERN.test(String(value || '').trim());
}

export async function saveMyProjectToDatabase({
  ownerId,
  projectId,
  name,
  cover,
  completed,
  lastEditedAt,
  folders = [],
  elements = [],
}) {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  if (!ownerId) {
    throw new Error('Missing owner id for project save.');
  }

  let persistedProjectId = projectId;

  if (isUuid(projectId)) {
    const { error: updateProjectError } = await supabase
      .from('projects')
      .update({
        title: name,
        description: completed ? 'completed' : null,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('owner_id', ownerId);

    if (updateProjectError) {
      throw updateProjectError;
    }
  } else {
    const { data: createdProject, error: createProjectError } = await supabase
      .from('projects')
      .insert({
        owner_id: ownerId,
        title: name,
        description: completed ? 'completed' : null,
      })
      .select('project_id')
      .single();

    if (createProjectError) {
      throw createProjectError;
    }

    persistedProjectId = createdProject.project_id;
  }

  const payload = {
    name,
    cover: cover || null,
    completed: Boolean(completed),
    lastEditedAt: Number(lastEditedAt) || Date.now(),
    folders: Array.isArray(folders) ? folders : [],
    elements: Array.isArray(elements) ? elements : [],
  };

  const { error: upsertDataError } = await supabase
    .from('my_project_data')
    .upsert(
      {
        project_id: persistedProjectId,
        owner_id: ownerId,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    );

  if (upsertDataError) {
    throw upsertDataError;
  }

  return { projectId: persistedProjectId };
}
