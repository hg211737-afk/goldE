import JSZip from 'jszip';
import { ScriptProject, ScriptGenerationConfig, ScriptFile } from '../types';

const STORAGE_KEY = 'polyglot_script_studio_projects_v1';
const ACTIVE_PROJECT_KEY = 'polyglot_script_studio_active_id';

export async function generatePolyglotScript(config: ScriptGenerationConfig): Promise<ScriptProject> {
  const response = await fetch('/api/gemini/generate-script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to generate script: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  if (!result.project) {
    throw new Error(result.error || 'No script project returned from engine.');
  }

  // Save to history automatically
  saveProjectToHistory(result.project);
  return result.project;
}

export async function refinePolyglotScript(
  currentProject: ScriptProject,
  refinementInstruction: string
): Promise<ScriptProject> {
  const response = await fetch('/api/gemini/refine-script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentProject, refinementInstruction }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refine script: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  if (!result.project) {
    throw new Error(result.error || 'Failed to refine project.');
  }

  saveProjectToHistory(result.project);
  return result.project;
}

export async function explainCodeWithAI(file: ScriptFile): Promise<string> {
  try {
    const response = await fetch('/api/gemini/explain-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: file.code, filename: file.filename, language: file.language }),
    });
    if (!response.ok) return file.explanation || 'ملف برمجي متكامل يخدم منظومة دمج اللغات.';
    const data = await response.json();
    return data.explanation || file.explanation;
  } catch {
    return file.explanation || 'ملف برمجي متكامل يخدم منظومة دمج اللغات.';
  }
}

// Storage Management
export function getSavedProjects(): ScriptProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveProjectToHistory(project: ScriptProject): void {
  try {
    const list = getSavedProjects();
    const filtered = list.filter((p) => p.id !== project.id);
    filtered.unshift(project);
    // Keep last 25 projects
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 25)));
    localStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
  } catch (err) {
    console.warn('Failed to save project to localStorage:', err);
  }
}

export function deleteProjectFromHistory(id: string): ScriptProject[] {
  try {
    const list = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}

// Download single file
export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Download entire project as a clean ZIP file
export async function downloadProjectAsZip(project: ScriptProject): Promise<void> {
  const zip = new JSZip();

  // Add all script files safely
  (project.files || []).forEach((file, idx) => {
    const filename = file.filename || `file-${idx + 1}.txt`;
    const code = typeof file.code === 'string' ? file.code : '';
    zip.file(filename, code);
  });

  // Add a comprehensive README.md
  const languagesList = Array.isArray(project.languages) ? project.languages.join(', ') : 'Polyglot';
  const prerequisites = Array.isArray(project.executionGuide?.prerequisites)
    ? project.executionGuide.prerequisites.map((p) => `   - ${p}`).join('\n')
    : '   - Standard runtime for selected languages';
  const installCommands = Array.isArray(project.executionGuide?.installCommands)
    ? project.executionGuide.installCommands.join('\n')
    : '# No install needed';
  const runCommand = project.executionGuide?.runCommand || '# Execute entrypoint file';
  const expectedOutput = project.executionGuide?.expectedOutput || 'Script runs successfully';

  const readmeContent = `# ${project.titleEn || project.title || 'Polyglot Script Project'}
## ${project.title || 'Polyglot Script'}

> **Paradigm:** ${project.paradigm || 'Subprocess Pipes'}
> **Languages:** ${languagesList}

### Description / الوصف
${project.description || ''}

### Architecture & Data Flow
\`\`\`
${project.dataFlowDiagram || 'Architecture flow'}
\`\`\`

### Communication Mechanism
${project.communicationMechanism || ''}

### Execution Guide / طريقة التشغيل
1. Prerequisites:
${prerequisites}

2. Setup / Install:
\`\`\`bash
${installCommands}
\`\`\`

3. Run:
\`\`\`bash
${runCommand}
\`\`\`

4. Expected Output:
${expectedOutput}

---
*Generated by Polyglot Script Studio*
`;
  zip.file('README.md', readmeContent);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (project.titleEn || 'polyglot_script')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 30);
  a.download = `${safeTitle}_bundle.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
