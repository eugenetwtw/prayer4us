import fs from 'fs';
import path from 'path';

// Get counter file path
const counterFilePath = path.join(process.cwd(), 'counter.json');

// Function to read counter data
function readCounterData() {
  try {
    const data = fs.readFileSync(counterFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading counter data:', error);
    return null;
  }
}

// Function to write counter data
function writeCounterData(data) {
  try {
    fs.writeFileSync(counterFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing counter data:', error);
    return false;
  }
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Read counter data
  const counterData = readCounterData();
  if (!counterData) {
    return res.status(500).json({ error: 'Failed to read counter data' });
  }

  if (req.method === 'POST') {
    const { action, language } = req.body;
    const validLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko'];
    
    // Validate language
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    if (action === 'visit') {
      // Increment total visits
      counterData.total.visits += 1;
      
      // Increment language-specific visits
      counterData.languages[language].visits += 1;
    } else if (action === 'audio') {
      // Increment total audio generations
      counterData.total.audioGenerated += 1;
      
      // Increment language-specific audio generations
      counterData.languages[language].audioGenerated += 1;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Save updated counter data
    if (!writeCounterData(counterData)) {
      return res.status(500).json({ error: 'Failed to update counter data' });
    }

    return res.status(200).json({ success: true, data: counterData });
  } else if (req.method === 'GET') {
    // Return counter data for GET requests
    return res.status(200).json(counterData);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
