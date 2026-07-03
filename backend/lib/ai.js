import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateSmartTasks(projectName, clientName, projectValue) {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not set. Falling back to default tasks.');
    return getFallbackTasks(projectName, clientName);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `
      You are an expert project manager for a digital agency.
      A new project was just created.
      Client Name: ${clientName}
      Project Name: ${projectName}
      Project Budget/Value: ₹${projectValue}

      Generate exactly 5 essential tasks for this project. 
      Respond ONLY with a valid JSON array of objects. Do not include markdown code blocks, just raw JSON.
      Format:
      [
        { "title": "Task 1 description", "priority": "high" },
        { "title": "Task 2 description", "priority": "medium" }
      ]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up potential markdown formatting
    if (text.startsWith('\`\`\`json')) {
      text = text.substring(7);
    }
    if (text.endsWith('\`\`\`')) {
      text = text.substring(0, text.length - 3);
    }

    const aiTasks = JSON.parse(text);
    
    return aiTasks.map((t, i) => ({
      id: `t${Date.now()}_${i}`,
      title: t.title,
      status: 'todo',
      assignee: '',
      priority: t.priority || 'medium',
      dueDate: '',
      projectId: ''
    }));

  } catch (error) {
    console.error('AI Task Generation Error:', error.message);
    return getFallbackTasks(projectName, clientName);
  }
}

export async function getAiInsights(promptText, contextData) {
  if (!genAI) {
    return "I am currently offline. Please add your GEMINI_API_KEY to the .env file and restart the server to enable AI assistance.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const systemInstruction = `
      You are 'NexGo AI', a highly intelligent, concise, and professional business assistant for the founder of a digital agency.
      You have access to the latest state of the agency's dashboard, including what all other founders are working on.
      Here is the current state context (JSON):
      ${JSON.stringify(contextData)}

      CRITICAL RULE: You are a read-only conversational assistant. You DO NOT have the ability to click buttons, add tasks, mark tasks as done, edit projects, or perform any actions on the dashboard.
      If a user asks you to perform an action (e.g., "add a task", "mark this as done"), politely explain that you cannot make changes to the dashboard and that they must do it manually themselves. Do NOT pretend to perform actions.

      Answer the user's prompt directly, clearly, and proactively based ONLY on the provided context. 
      Crucially, you have visibility into all active projects and the tasks assigned to ALL founders. Cross-reference this information to ensure you never suggest a task that someone else is already doing.
      Format your response with Markdown (bullet points, bold text). Keep it under 150 words unless asked for a long report.
    `;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'I understand. I am ready to assist.' }] }
      ]
    });

    const result = await chat.sendMessage(promptText);
    return result.response.text();
  } catch (error) {
    console.error('AI Insight Error:', error.message);
    return "I encountered an error while processing your request. Please try again.";
  }
}

function getFallbackTasks(projectName, clientName) {
  return [
    { id: `t${Date.now()}_1`, title: `Discovery & Requirements — ${clientName}`, status: 'todo', assignee: '', priority: 'high', dueDate: '', projectId: '' },
    { id: `t${Date.now()}_2`, title: 'Design Mockups & Wireframes', status: 'todo', assignee: '', priority: 'high', dueDate: '', projectId: '' },
    { id: `t${Date.now()}_3`, title: 'Development & Implementation', status: 'todo', assignee: '', priority: 'critical', dueDate: '', projectId: '' },
    { id: `t${Date.now()}_4`, title: 'Testing & Quality Assurance', status: 'todo', assignee: '', priority: 'medium', dueDate: '', projectId: '' },
    { id: `t${Date.now()}_5`, title: 'Launch & Client Handoff', status: 'todo', assignee: '', priority: 'high', dueDate: '', projectId: '' }
  ];
}

export async function generateDraftCheckin(activities) {
  if (!process.env.GEMINI_API_KEY) return 'Completed all assigned tasks for the day.';
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `Based on the following activity logs for a user today, draft a concise, professional 3-4 bullet point summary of what they accomplished. Keep it short and to the point. Start each point with an action verb. Activities: ${JSON.stringify(activities)}`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI Draft Error:', error.message);
    return 'Completed all assigned tasks for the day.';
  }
}
