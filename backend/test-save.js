import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from './models/Project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testTaskSave() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create a dummy project
    const p = new Project({
      name: 'Test Project',
      client: 'Test Client',
      status: 'planning',
      tasks: [{ id: '1', title: 'Task 1', status: 'todo' }]
    });
    await p.save();
    
    console.log("Original Tasks:", p.tasks);
    
    // Simulate API update
    const updateData = {
      tasks: [{ id: '1', title: 'Task 1', status: 'done' }]
    };
    
    const updated = await Project.findByIdAndUpdate(p._id, updateData, { new: true });
    console.log("Updated Tasks in Memory:", updated.tasks);
    
    // Fetch from DB again to verify persistence
    const fetched = await Project.findById(p._id);
    console.log("Fetched Tasks from DB:", fetched.tasks);
    
    // Cleanup
    await Project.findByIdAndDelete(p._id);
    await mongoose.disconnect();
  } catch(e) {
    console.error(e);
  }
}

testTaskSave();
