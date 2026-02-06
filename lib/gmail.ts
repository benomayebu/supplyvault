import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Gmail OAuth configuration
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

/**
 * Create OAuth2 client for Gmail API
 */
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate Gmail OAuth authorization URL
 */
export function getAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
    state: state,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Create Gmail client with refresh token
 */
export function createGmailClient(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetch emails with attachments from Gmail
 */
export async function fetchEmailsWithAttachments(
  refreshToken: string,
  options: {
    maxResults?: number;
    pageToken?: string;
    query?: string;
  } = {}
) {
  const gmail = createGmailClient(refreshToken);
  
  // Build query to find emails with attachments (PDFs or images)
  const defaultQuery = 'has:attachment (filename:pdf OR filename:jpg OR filename:jpeg OR filename:png)';
  const query = options.query || defaultQuery;

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      q: query,
    });

    return {
      messages: response.data.messages || [],
      nextPageToken: response.data.nextPageToken,
      resultSizeEstimate: response.data.resultSizeEstimate || 0,
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw new Error('Failed to fetch emails from Gmail');
  }
}

/**
 * Get email message details including attachments
 */
export async function getEmailMessage(refreshToken: string, messageId: string) {
  const gmail = createGmailClient(refreshToken);

  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const message = response.data;
    const headers = message.payload?.headers || [];
    
    // Extract useful headers
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject');
    const from = getHeader('From');
    const date = getHeader('Date');

    // Parse sender email and name
    const fromMatch = from.match(/(.*?)\s*<(.+?)>/);
    const senderName = fromMatch ? fromMatch[1].trim().replace(/"/g, '') : from;
    const senderEmail = fromMatch ? fromMatch[2].trim() : from;

    // Extract attachments
    const attachments: Array<{
      filename: string;
      mimeType: string;
      attachmentId: string;
      size: number;
    }> = [];

    const extractAttachments = (parts: any[] | undefined) => {
      if (!parts) return;
      
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType || 'application/octet-stream',
            attachmentId: part.body.attachmentId,
            size: part.body.size || 0,
          });
        }
        
        // Recursively check nested parts
        if (part.parts) {
          extractAttachments(part.parts);
        }
      }
    };

    extractAttachments(message.payload?.parts);

    return {
      id: message.id!,
      threadId: message.threadId!,
      subject,
      senderName,
      senderEmail,
      date: new Date(date || message.internalDate ? Number(message.internalDate) : Date.now()),
      attachments,
      snippet: message.snippet || '',
    };
  } catch (error) {
    console.error('Error fetching email message:', error);
    throw new Error('Failed to fetch email message');
  }
}

/**
 * Download email attachment
 */
export async function downloadAttachment(
  refreshToken: string,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const gmail = createGmailClient(refreshToken);

  try {
    const response = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: messageId,
      id: attachmentId,
    });

    const attachmentData = response.data.data;
    if (!attachmentData) {
      throw new Error('No attachment data received');
    }

    // Decode base64url to buffer
    const buffer = Buffer.from(attachmentData, 'base64url');
    return buffer;
  } catch (error) {
    console.error('Error downloading attachment:', error);
    throw new Error('Failed to download attachment');
  }
}

/**
 * Set up Gmail push notifications (optional for Phase 1)
 */
export async function setupGmailWatch(
  refreshToken: string,
  topicName: string
) {
  const gmail = createGmailClient(refreshToken);

  try {
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: topicName,
        labelIds: ['INBOX'],
      },
    });

    return {
      historyId: response.data.historyId!,
      expiration: response.data.expiration!,
    };
  } catch (error) {
    console.error('Error setting up Gmail watch:', error);
    throw new Error('Failed to setup Gmail watch');
  }
}
