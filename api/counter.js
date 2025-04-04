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
  console.log(`[Counter API] Received request: ${req.method} ${req.url}`); // Added log
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
    return;
  }

  console.log('[Counter API] Processing request...'); // Added log
  try {
    // Get current counter data
    console.log('[Counter API] Fetching current counter data...'); // Added log
    let counterData = await getCounterData();
    console.log('[Counter API] Current counter data fetched:', JSON.stringify(counterData)); // Added log
    
    if (req.method === 'POST') {
      console.log('[Counter API] Processing POST request. Body:', req.body); // Added log
      const { action, language } = req.body;
      const validLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko'];
      
      // Validate language
      if (!validLanguages.includes(language)) {
        console.warn(`[Counter API] Invalid language received: ${language}`); // Added log
        return res.status(400).json({ error: 'Invalid language' });
      }
      console.log(`[Counter API] Action: ${action}, Language: ${language}`); // Added log

      if (action === 'visit') {
        console.log('[Counter API] Incrementing visit count...'); // Added log
        // Increment total visits
        counterData.total.visits += 1;
        // Increment language-specific visits
        counterData.languages[language].visits += 1;
        console.log('[Counter API] Visit count incremented.'); // Added log
      } else if (action === 'audio') {
        console.log('[Counter API] Incrementing audio generation count...'); // Added log
        // Increment total audio generations
        counterData.total.audioGenerated += 1;
        // Increment language-specific audio generations
        counterData.languages[language].audioGenerated += 1;
        console.log('[Counter API] Audio generation count incremented.'); // Added log
      } else {
        console.warn(`[Counter API] Invalid action received: ${action}`); // Added log
        return res.status(400).json({ error: 'Invalid action' });
      }

      console.log('[Counter API] Updated counter data:', JSON.stringify(counterData)); // Added log
      // Save updated counter data
      console.log('[Counter API] Attempting to update counter data in blob storage...'); // Added log
      const success = await updateCounterData(counterData);
      if (!success) {
        console.error('[Counter API] Failed to update counter data in blob storage.'); // Added log
        return res.status(500).json({ error: 'Failed to update counter data' });
      }
      console.log('[Counter API] Successfully updated counter data in blob storage.'); // Added log

      return res.status(200).json({ success: true, data: counterData });
    } else if (req.method === 'GET') {
      console.log('[Counter API] Processing GET request.'); // Added log
      // Return counter data for GET requests
      return res.status(200).json(counterData);
    } else {
      console.warn(`[Counter API] Method not allowed: ${req.method}`); // Added log
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Counter API] Error processing request:', error); // Modified log
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
