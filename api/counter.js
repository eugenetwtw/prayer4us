import { put, list, del, get } from '@vercel/blob';

const COUNTER_FILENAME = 'counter.json';

// Initialize counter data structure
const initialData = {
  total: {
    visits: 0,
    audioGenerated: 0
  },
  languages: {
    'zh-Hant': {
      visits: 0,
      audioGenerated: 0
    },
    'zh-Hans': {
      visits: 0,
      audioGenerated: 0
    },
    'en': {
      visits: 0,
      audioGenerated: 0
    },
    'ja': {
      visits: 0,
      audioGenerated: 0
    },
    'ko': {
      visits: 0,
      audioGenerated: 0
    }
  }
};

// Function to read counter data from Blob or initialize if not exists
async function getCounterData() {
  try {
    // Check for blob token in development mode
    if (process.env.NODE_ENV === 'development' && !process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('⚠️ BLOB_READ_WRITE_TOKEN is missing. Please set it in .env.local file.');
      return initialData;
    }

    // List blobs to see if counter exists
    const blobs = await list();
    const counterBlob = blobs.blobs.find(blob => blob.pathname === COUNTER_FILENAME);
    
    if (!counterBlob) {
      // Counter doesn't exist yet, create initial data
      return initialData;
    }
    
    // Counter exists, fetch it
    const blob = await get(COUNTER_FILENAME);
    if (!blob) {
      // If blob not found for some reason, return initial data
      return initialData;
    }
    
    // Parse the JSON data
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error reading counter data:', error);
    // Return initial data in case of error
    return initialData;
  }
}

// Function to update counter data in Blob storage
async function updateCounterData(data) {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Upload to Blob storage (will overwrite any existing file)
    await put(COUNTER_FILENAME, jsonData, {
      contentType: 'application/json',
      access: 'public', // Make it publicly accessible for easier debugging if needed
    });
    
    return true;
  } catch (error) {
    console.error('Error updating counter data:', error);
    return false;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get current counter data
    let counterData = await getCounterData();
    
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
      const success = await updateCounterData(counterData);
      if (!success) {
        return res.status(500).json({ error: 'Failed to update counter data' });
      }

      return res.status(200).json({ success: true, data: counterData });
    } else if (req.method === 'GET') {
      // Return counter data for GET requests
      return res.status(200).json(counterData);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Counter API error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
