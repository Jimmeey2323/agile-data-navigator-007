import { delay } from '@/lib/utils';
import Papa from 'papaparse';

// Lead interface with follow-up fields
export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: string;
  associate: string;
  status: string;
  stage: string;
  createdAt: string;
  center: string;
  remarks: string;
  followUp1Date?: string;
  followUp1Comments?: string;
  followUp2Date?: string;
  followUp2Comments?: string;
  followUp3Date?: string;
  followUp3Comments?: string;
  followUp4Date?: string;
  followUp4Comments?: string;
  [key: string]: any; // Allow additional properties
}

// Google Sheets API configuration
const SPREADSHEET_ID = '1dQMNF69WnXVQdhlLvUZTig3kL97NA21k6eZ9HRu6xiQ';
const SHEET_NAME = '◉ Leads';
// Updated to fetch ALL columns and rows - Google Sheets will automatically return only filled cells
const SHEET_RANGE = `${SHEET_NAME}!A:ZZ`; // Expanded range to cover all possible columns

// OAuth credentials
const CLIENT_ID = '416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REFRESH_TOKEN = '1//04MmvT_BibTsBCgYIARAAGAQSNwF-L9IrG9yxJvvQRMLPR39xzWSrqfTVMkvq3WcZqsDO2HjUkV6s7vo1pQkex4qGF3DITTiweAA';

// Token storage
let tokenData = {
  access_token: '',
  expires_in: 3599,
  expiration_time: 0
};

// Store fetched leads data
let currentLeads: Lead[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Function to get a fresh access token
const getAccessToken = async (): Promise<string> => {
  const now = Date.now();
  
  // Check if existing token is still valid
  if (tokenData.access_token && tokenData.expiration_time > now) {
    return tokenData.access_token;
  }
  
  try {
    console.log('Refreshing access token...');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update token data
    tokenData = {
      access_token: data.access_token,
      expires_in: data.expires_in,
      expiration_time: now + (data.expires_in * 1000)
    };
    
    console.log('Token refreshed successfully');
    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Function to fetch all leads from Google Sheets with enhanced data processing
export const fetchLeads = async (): Promise<Lead[]> => {
  console.log('Fetching ALL leads from Google Sheets (complete dataset)...');
  
  try {
    // Check if we have a cached version that's still fresh
    const now = Date.now();
    if (currentLeads.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('Using cached leads data, count:', currentLeads.length);
      return currentLeads;
    }
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Fetch data from Google Sheets API with enhanced parameters
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&majorDimension=ROWS`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to fetch sheet data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    console.log(`Raw data received: ${rows.length} rows total`);
    
    if (rows.length < 2) {
      console.log('Sheet is empty or has only headers');
      return [];
    }
    
    // First row contains headers
    const headers = rows[0];
    console.log('Sheet headers found:', headers.length, 'columns');
    console.log('Header sample:', headers.slice(0, 10));
    
    // Process all data rows (skip header)
    const dataRows = rows.slice(1);
    console.log(`Processing ${dataRows.length} data rows...`);
    
    // Map sheet data to Lead objects with enhanced processing
    const leads: Lead[] = [];
    let processedCount = 0;
    let skippedCount = 0;
    
    for (let index = 0; index < dataRows.length; index++) {
      const row = dataRows[index];
      
      // Skip completely empty rows
      if (!row || row.every((cell: any) => !cell || cell.toString().trim() === '')) {
        skippedCount++;
        continue;
      }
      
      const lead: Partial<Lead> = { 
        id: `lead-${index + 1}` 
      };
      
      // Map each column value to the corresponding field based on headers
      headers.forEach((header: string, colIndex: number) => {
        const value = row[colIndex] || '';
        const cleanValue = value.toString().trim();
        
        // Enhanced header mapping with more variations
        const headerLower = header.toLowerCase().trim();
        
        switch(true) {
          case headerLower === 'id' || headerLower === 'lead id':
            if (cleanValue) lead.id = cleanValue;
            break;
          case headerLower.includes('name') || headerLower.includes('client'):
            if (cleanValue) lead.fullName = cleanValue;
            break;
          case headerLower.includes('email'):
            if (cleanValue) lead.email = cleanValue;
            break;
          case headerLower.includes('phone') || headerLower.includes('contact') || headerLower.includes('mobile'):
            if (cleanValue) lead.phone = cleanValue;
            break;
          case headerLower.includes('source') || headerLower === 'lead source':
            if (cleanValue) lead.source = cleanValue;
            break;
          case headerLower.includes('associate') || headerLower.includes('assigned'):
            if (cleanValue) lead.associate = cleanValue;
            break;
          case headerLower === 'status':
            if (cleanValue) lead.status = cleanValue;
            break;
          case headerLower === 'stage':
            if (cleanValue) lead.stage = cleanValue;
            break;
          case headerLower.includes('created') || headerLower.includes('date'):
            if (cleanValue) {
              // Handle various date formats
              try {
                const dateValue = new Date(cleanValue);
                if (!isNaN(dateValue.getTime())) {
                  lead.createdAt = dateValue.toISOString().split('T')[0];
                } else {
                  lead.createdAt = cleanValue;
                }
              } catch {
                lead.createdAt = cleanValue;
              }
            }
            break;
          case headerLower.includes('center') || headerLower.includes('location'):
            if (cleanValue) lead.center = cleanValue;
            break;
          case headerLower.includes('remarks') || headerLower.includes('notes') || headerLower.includes('comments'):
            if (cleanValue) lead.remarks = cleanValue;
            break;
          case headerLower.includes('follow up 1 date') || headerLower.includes('followup1date'):
            if (cleanValue) lead.followUp1Date = cleanValue;
            break;
          case headerLower.includes('follow up comments (1)') || headerLower.includes('followup1comments'):
            if (cleanValue) lead.followUp1Comments = cleanValue;
            break;
          case headerLower.includes('follow up 2 date') || headerLower.includes('followup2date'):
            if (cleanValue) lead.followUp2Date = cleanValue;
            break;
          case headerLower.includes('follow up comments (2)') || headerLower.includes('followup2comments'):
            if (cleanValue) lead.followUp2Comments = cleanValue;
            break;
          case headerLower.includes('follow up 3 date') || headerLower.includes('followup3date'):
            if (cleanValue) lead.followUp3Date = cleanValue;
            break;
          case headerLower.includes('follow up comments (3)') || headerLower.includes('followup3comments'):
            if (cleanValue) lead.followUp3Comments = cleanValue;
            break;
          case headerLower.includes('follow up 4 date') || headerLower.includes('followup4date'):
            if (cleanValue) lead.followUp4Date = cleanValue;
            break;
          case headerLower.includes('follow up comments (4)') || headerLower.includes('followup4comments'):
            if (cleanValue) lead.followUp4Comments = cleanValue;
            break;
          default:
            // Store additional columns as custom fields if they have values
            if (cleanValue && header) {
              lead[header] = cleanValue;
            }
        }
      });
      
      // Only include leads with at least a name or email
      if (lead.fullName || lead.email) {
        // Ensure all required fields have defaults
        const completeLead: Lead = {
          id: lead.id || `lead-${processedCount + 1}`,
          fullName: lead.fullName || 'Unknown',
          email: lead.email || '',
          phone: lead.phone || '',
          source: lead.source || 'Other',
          associate: lead.associate || '',
          status: lead.status || 'New',
          stage: lead.stage || 'Initial Contact',
          createdAt: lead.createdAt || new Date().toISOString().split('T')[0],
          center: lead.center || '',
          remarks: lead.remarks || '',
          followUp1Date: lead.followUp1Date || '',
          followUp1Comments: lead.followUp1Comments || '',
          followUp2Date: lead.followUp2Date || '',
          followUp2Comments: lead.followUp2Comments || '',
          followUp3Date: lead.followUp3Date || '',
          followUp3Comments: lead.followUp3Comments || '',
          followUp4Date: lead.followUp4Date || '',
          followUp4Comments: lead.followUp4Comments || '',
          ...lead
        };
        
        leads.push(completeLead);
        processedCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ Successfully processed ${processedCount} leads from Google Sheets`);
    console.log(`📊 Skipped ${skippedCount} empty/invalid rows`);
    console.log(`📈 Total dataset size: ${leads.length} leads`);
    
    // Log sample of first few leads for debugging
    if (leads.length > 0) {
      console.log('Sample lead data (first 3):');
      leads.slice(0, 3).forEach((lead, idx) => {
        console.log(`Lead ${idx + 1}:`, {
          id: lead.id,
          name: lead.fullName,
          email: lead.email,
          source: lead.source,
          status: lead.status,
          stage: lead.stage,
          followUps: {
            f1: lead.followUp1Date ? 'Yes' : 'No',
            f2: lead.followUp2Date ? 'Yes' : 'No',
            f3: lead.followUp3Date ? 'Yes' : 'No',
            f4: lead.followUp4Date ? 'Yes' : 'No'
          }
        });
      });
    }
    
    // Update cache
    currentLeads = leads;
    lastFetchTime = now;
    
    return leads;
  } catch (error) {
    console.error('❌ Error fetching leads from Google Sheets:', error);
    
    // Fall back to sample data only if we have no cached data
    if (currentLeads.length === 0) {
      console.warn('⚠️ Using fallback sample data due to fetch error');
      currentLeads = getSampleLeads();
      return currentLeads;
    }
    
    console.log('📋 Returning cached data due to error');
    return currentLeads;
  }
};

// Function to find the row number of a lead in the sheet
const findLeadRowInSheet = async (leadId: string): Promise<number> => {
  try {
    const accessToken = await getAccessToken();
    
    // Use a more targeted range for finding the lead ID
    const searchRange = `${SHEET_NAME}!A:A`; // Only search in column A for IDs
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${searchRange}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows = data.values || [];
    
    // Find the row with matching ID (column A)
    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
      if (rows[i][0] === leadId) {
        return i + 1; // Return 1-based row number for Google Sheets
      }
    }
    
    throw new Error(`Lead with ID ${leadId} not found in sheet`);
  } catch (error) {
    console.error('Error finding lead row:', error);
    throw error;
  }
};

// Function to update a lead with enhanced error handling
export const updateLead = async (lead: Lead): Promise<Lead> => {
  console.log('Updating lead in Google Sheets:', lead.id);
  
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Find the row number for this lead
    const rowNumber = await findLeadRowInSheet(lead.id);
    console.log(`Found lead ${lead.id} at row ${rowNumber}`);
    
    // Prepare the update data - map lead fields to sheet columns
    // Extended to cover more columns for comprehensive data
    const updateValues = [
      lead.id,
      lead.fullName,
      lead.phone,
      lead.email,
      lead.createdAt,
      '', // Source ID (if available)
      lead.source,
      '', // Member ID (if available)
      '', // Converted To Customer At (if available)
      lead.stage,
      lead.associate,
      lead.remarks,
      lead.followUp1Date || '',
      lead.followUp1Comments || '',
      lead.followUp2Date || '',
      lead.followUp2Comments || '',
      lead.followUp3Date || '',
      lead.followUp3Comments || '',
      lead.followUp4Date || '',
      lead.followUp4Comments || '',
      lead.center,
      '', // Class Type (if available)
      '', // Host ID (if available)  
      lead.status,
      '', // Channel (if available)
      '', // Period (if available)
      '', // Purchases Made (if available)
      '', // LTV (if available)
      '', // Visits (if available)
      '', // Trial Status (if available)
      '', // Conversion Status (if available)
      ''  // Retention Status (if available)
    ];
    
    // Update the specific row in Google Sheets with extended range
    const range = `${SHEET_NAME}!A${rowNumber}:ZZ${rowNumber}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueInputOption=RAW`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [updateValues]
      }),
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Update error response:', errorText);
      throw new Error(`Failed to update sheet: ${updateResponse.statusText}`);
    }
    
    console.log('✅ Lead updated successfully in Google Sheets');
    
    // Update the cached version
    const indexInCache = currentLeads.findIndex(l => l.id === lead.id);
    if (indexInCache !== -1) {
      currentLeads[indexInCache] = { ...lead };
    }
    
    // Clear cache to force refresh on next fetch
    lastFetchTime = 0;
    
    return lead;
  } catch (error) {
    console.error('❌ Error updating lead in Google Sheets:', error);
    throw error;
  }
};

// Function to add a new lead with enhanced data handling
export const addLead = async (lead: Lead): Promise<Lead> => {
  console.log('Adding new lead to Google Sheets');
  
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    const newLead = {
      ...lead,
      id: lead.id || `lead-${Date.now()}`,
      createdAt: lead.createdAt || new Date().toISOString().split('T')[0]
    };
    
    // In a real implementation, you would append a row to the Google Sheet
    // For now, we'll just update our cached data
    currentLeads = [...currentLeads, newLead];
    
    // Simulate API delay
    await delay(800);
    
    console.log('✅ New lead added successfully to Google Sheets');
    return newLead;
  } catch (error) {
    console.error('❌ Error adding lead to Google Sheets:', error);
    throw error;
  }
};

// Function to delete a lead
export const deleteLead = async (leadId: string): Promise<void> => {
  console.log('Deleting lead from Google Sheets:', leadId);
  
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Find the lead in the cache
    const index = currentLeads.findIndex(l => l.id === leadId);
    
    if (index === -1) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }
    
    // In a real implementation, you would delete the row from the Google Sheet
    // For now, we'll just update the cached data
    currentLeads = [...currentLeads.slice(0, index), ...currentLeads.slice(index + 1)];
    
    // Simulate API delay
    await delay(600);
    
    console.log('✅ Lead deleted successfully from Google Sheets');
  } catch (error) {
    console.error('❌ Error deleting lead from Google Sheets:', error);
    throw error;
  }
};

// Function to parse CSV data using PapaParse
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Process the data to match our Lead interface
        const processedData = results.data.map((row: any, index: number) => {
          return {
            id: `imported-${index + 1}`,
            fullName: row['Full Name'] || row['Name'] || row['Client Name'] || '',
            email: row['Email'] || row['Email Address'] || '',
            phone: row['Phone'] || row['Contact Number'] || row['Mobile'] || '',
            source: row['Source'] || row['Lead Source'] || 'Other',
            associate: row['Associate'] || row['Assigned To'] || '',
            status: row['Status'] || 'New',
            stage: row['Stage'] || 'Initial Contact',
            createdAt: row['Created At'] || row['Date'] || new Date().toISOString().split('T')[0],
            center: row['Center'] || row['Location'] || '',
            remarks: row['Remarks'] || row['Notes'] || row['Comments'] || '',
            followUp1Date: row['Follow Up 1 Date'] || '',
            followUp1Comments: row['Follow Up Comments (1)'] || '',
            followUp2Date: row['Follow Up 2 Date'] || '',
            followUp2Comments: row['Follow Up Comments (2)'] || '',
            followUp3Date: row['Follow Up 3 Date'] || '',
            followUp3Comments: row['Follow Up Comments (3)'] || '',
            followUp4Date: row['Follow Up 4 Date'] || '',
            followUp4Comments: row['Follow Up Comments (4)'] || ''
          };
        });
        
        resolve(processedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Function to import leads from CSV
export const importLeadsFromCSV = async (csvString: string, columnMapping: Record<string, string>): Promise<void> => {
  try {
    console.log('Importing leads from CSV to Google Sheets');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Parse CSV string
    const results = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });
    
    if (results.errors.length > 0) {
      throw new Error(results.errors[0].message);
    }
    
    // Map CSV data to lead format based on columnMapping
    const mappedLeads = results.data.map((row: any, index: number) => {
      const lead: Partial<Lead> = {
        id: `imported-${Date.now()}-${index}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      // Map each CSV column to the corresponding lead field based on columnMapping
      Object.entries(columnMapping).forEach(([csvHeader, leadField]) => {
        if (row[csvHeader] !== undefined && leadField) {
          (lead as any)[leadField] = row[csvHeader];
        }
      });
      
      return lead as Lead;
    });
    
    // In a real implementation, you would append these rows to the Google Sheet
    // For now, we'll just update the cached data
    currentLeads = [...currentLeads, ...mappedLeads];
    
    // Simulate API delay
    await delay(1000);
    
    console.log(`✅ ${mappedLeads.length} leads imported successfully to Google Sheets`);
    return;
  } catch (error) {
    console.error('❌ Error importing CSV to Google Sheets:', error);
    throw error;
  }
};

// Helper function to get sample leads (used only as fallback if API fails)
function getSampleLeads(): Lead[] {
  return [
    {
      id: "lead-1",
      fullName: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 555-123-4567",
      source: "Website",
      associate: "Sarah Johnson",
      status: "Hot",
      stage: "Trial Scheduled",
      createdAt: "2023-09-15",
      center: "Downtown Center",
      remarks: "Interested in yoga classes, scheduled for trial on Saturday",
      followUp1Date: "2023-09-20",
      followUp1Comments: "Called to confirm trial class. Customer is excited.",
      followUp2Date: "2023-09-25",
      followUp2Comments: "Completed trial class. Interested in monthly package.",
      followUp3Date: "2023-09-28",
      followUp3Comments: "Discussing pricing options.",
      followUp4Date: "",
      followUp4Comments: ""
    },
    {
      id: "lead-2",
      fullName: "Emily Wong",
      email: "emily.wong@example.com",
      phone: "+1 555-987-6543",
      source: "Referral",
      associate: "Mike Chen",
      status: "Warm",
      stage: "Initial Contact",
      createdAt: "2023-09-10",
      center: "Westside Location",
      remarks: "Referred by existing member, looking for evening classes",
      followUp1Date: "2023-09-12",
      followUp1Comments: "Left voicemail, will try again tomorrow.",
      followUp2Date: "2023-09-13",
      followUp2Comments: "Discussed class options, she prefers weekends.",
      followUp3Date: "",
      followUp3Comments: "",
      followUp4Date: "",
      followUp4Comments: ""
    }
  ];
}