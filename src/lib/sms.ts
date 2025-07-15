interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface SMSConfig {
  apiKey: string;
  senderId: string;
  baseUrl: string;
}

class SMSService {
  private config: SMSConfig;

  constructor() {
    this.config = {
      apiKey: process.env.BULKSMS_API_KEY || 'DoyenvLFAPk4rKHh9gxL',
      senderId: process.env.BULKSMS_SENDER_ID || '8809617622564',
      baseUrl: 'http://bulksmsbd.net/api'
    };
  }

  /**
   * Send SMS to a single number
   */
  async sendSMS(number: string, message: string): Promise<SMSResponse> {
    try {
      // Format phone number first
      const formattedNumber = this.formatPhoneNumber(number);
      
      // Validate phone number format (Bangladesh)
      if (!this.isValidBangladeshNumber(formattedNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Use format: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX'
        };
      }

      // Validate message length
      if (!message || message.length > 160) {
        return {
          success: false,
          error: 'Message is required and must be 160 characters or less'
        };
      }

      const url = `${this.config.baseUrl}/smsapi`;
      const params = new URLSearchParams({
        api_key: this.config.apiKey,
        senderid: this.config.senderId,
        number: formattedNumber,
        message: message
      });

      console.log('Sending SMS to:', formattedNumber);
      console.log('SMS API URL:', url);

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const result = await response.text();
      console.log('SMS API raw response:', result);
      
      // Parse the response - handle both numeric and JSON responses
      let responseCode: number;
      let responseData: any = null;
      
      try {
        // Try to parse as JSON first
        const jsonResult = JSON.parse(result);
        responseCode = jsonResult.response_code || jsonResult.code || 0;
        responseData = jsonResult;
      } catch (e) {
        // If not JSON, try to parse as number
        responseCode = parseInt(result);
        if (isNaN(responseCode)) {
          console.error('Invalid SMS API response:', result);
          return {
            success: false,
            error: `Invalid response from SMS service: ${result}`
          };
        }
      }
      
      if (responseCode === 202) {
        return {
          success: true,
          message: 'SMS sent successfully',
          data: { responseCode, result, responseData }
        };
      } else {
        const errorMessage = this.getErrorMessage(responseCode);
        return {
          success: false,
          error: errorMessage || `SMS sending failed with code: ${responseCode}`
        };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: 'Failed to send SMS. Please try again.'
      };
    }
  }

  /**
   * Send SMS to multiple numbers with different messages
   */
  async sendBulkSMS(messages: Array<{ to: string; message: string }>): Promise<SMSResponse> {
    try {
      // Validate and format all messages
      for (const msg of messages) {
        const formattedNumber = this.formatPhoneNumber(msg.to);
        if (!this.isValidBangladeshNumber(formattedNumber)) {
          return {
            success: false,
            error: `Invalid phone number format: ${msg.to}. Use format: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX`
          };
        }
        if (!msg.message || msg.message.length > 160) {
          return {
            success: false,
            error: 'All messages are required and must be 160 characters or less'
          };
        }
      }

      // Format all numbers
      const formattedMessages = messages.map(msg => ({
        to: this.formatPhoneNumber(msg.to),
        message: msg.message
      }));

      const url = `${this.config.baseUrl}/smsapimany`;
      const requestBody = {
        api_key: this.config.apiKey,
        senderid: this.config.senderId,
        messages: formattedMessages
      };

      console.log('Sending bulk SMS with different messages to:', formattedMessages.map(m => m.to));
      console.log('SMS API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.text();
      console.log('Bulk SMS API raw response:', result);
      
      // Parse the response - handle both numeric and JSON responses
      let responseCode: number;
      let responseData: any = null;
      
      try {
        // Try to parse as JSON first
        const jsonResult = JSON.parse(result);
        responseCode = jsonResult.response_code || jsonResult.code || 0;
        responseData = jsonResult;
      } catch (e) {
        // If not JSON, try to parse as number
        responseCode = parseInt(result);
        if (isNaN(responseCode)) {
          console.error('Invalid bulk SMS API response:', result);
          return {
            success: false,
            error: `Invalid response from SMS service: ${result}`
          };
        }
      }
      
      if (responseCode === 202) {
        return {
          success: true,
          message: 'Bulk SMS sent successfully',
          data: { responseCode, result, responseData, count: messages.length }
        };
      } else {
        const errorMessage = this.getErrorMessage(responseCode);
        return {
          success: false,
          error: errorMessage || `Bulk SMS sending failed with code: ${responseCode}`
        };
      }
    } catch (error) {
      console.error('Bulk SMS sending error:', error);
      return {
        success: false,
        error: 'Failed to send bulk SMS. Please try again.'
      };
    }
  }

  /**
   * Send SMS to multiple numbers with the same message
   */
  async sendBulkSMSSameMessage(numbers: string[], message: string): Promise<SMSResponse> {
    try {
      // Validate and format all numbers
      const formattedNumbers: string[] = [];
      for (const number of numbers) {
        const formattedNumber = this.formatPhoneNumber(number);
        if (!this.isValidBangladeshNumber(formattedNumber)) {
          return {
            success: false,
            error: `Invalid phone number format: ${number}. Use format: 88017XXXXXXXX, 88018XXXXXXXX, 88019XXXXXXXX, or 017XXXXXXXX`
          };
        }
        formattedNumbers.push(formattedNumber);
      }

      // Validate message
      if (!message || message.length > 160) {
        return {
          success: false,
          error: 'Message is required and must be 160 characters or less'
        };
      }

      const url = `${this.config.baseUrl}/smsapi`;
      const params = new URLSearchParams({
        api_key: this.config.apiKey,
        senderid: this.config.senderId,
        number: formattedNumbers.join(','),
        message: message
      });

      console.log('Sending bulk SMS to:', formattedNumbers);
      console.log('SMS API URL:', url);

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const result = await response.text();
      console.log('Bulk SMS API raw response:', result);
      
      // Parse the response - handle both numeric and JSON responses
      let responseCode: number;
      let responseData: any = null;
      
      try {
        // Try to parse as JSON first
        const jsonResult = JSON.parse(result);
        responseCode = jsonResult.response_code || jsonResult.code || 0;
        responseData = jsonResult;
      } catch (e) {
        // If not JSON, try to parse as number
        responseCode = parseInt(result);
        if (isNaN(responseCode)) {
          console.error('Invalid bulk SMS API response:', result);
          return {
            success: false,
            error: `Invalid response from SMS service: ${result}`
          };
        }
      }
      
      if (responseCode === 202) {
        return {
          success: true,
          message: 'Bulk SMS sent successfully',
          data: { responseCode, result, responseData, count: numbers.length }
        };
      } else {
        const errorMessage = this.getErrorMessage(responseCode);
        return {
          success: false,
          error: errorMessage || `Bulk SMS sending failed with code: ${responseCode}`
        };
      }
    } catch (error) {
      console.error('Bulk SMS sending error:', error);
      return {
        success: false,
        error: 'Failed to send bulk SMS. Please try again.'
      };
    }
  }

  /**
   * Check SMS balance
   */
  async checkBalance(): Promise<SMSResponse> {
    try {
      const url = `${this.config.baseUrl}/getBalanceApi`;
      
      console.log('SMS Balance URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          api_key: this.config.apiKey
        })
      });

      const result = await response.text();
      console.log('SMS Balance API raw response:', result);
      
      // Check if response is HTML (error page)
      if (result.includes('<html') || result.includes('<!DOCTYPE')) {
        return {
          success: false,
          error: 'API returned HTML error page. Please check your API configuration.'
        };
      }
      
      // Try to parse as JSON first
      try {
        const jsonResult = JSON.parse(result);
        if (jsonResult.balance !== undefined) {
          return {
            success: true,
            message: 'Balance retrieved successfully',
            data: { balance: jsonResult.balance, result }
          };
        }
      } catch (e) {
        // Not JSON, continue with other parsing methods
      }
      
      // Try to parse as number (plain text response)
      const balance = parseFloat(result);
      if (!isNaN(balance)) {
        return {
          success: true,
          message: 'Balance retrieved successfully',
          data: { balance, result }
        };
      } else {
        // If not a number, it might be an error code
        const errorCode = parseInt(result);
        if (!isNaN(errorCode)) {
          const errorMessage = this.getErrorMessage(errorCode);
          return {
            success: false,
            error: errorMessage || `Failed to get balance. Error code: ${errorCode}`
          };
        } else {
          return {
            success: false,
            error: `Failed to get balance. Unexpected response: ${result}`
          };
        }
      }
    } catch (error) {
      console.error('Balance check error:', error);
      return {
        success: false,
        error: 'Failed to check balance. Please try again.'
      };
    }
  }

  /**
   * Validate Bangladesh phone number format
   */
  private isValidBangladeshNumber(number: string): boolean {
    // Remove any spaces or special characters
    const cleanNumber = number.replace(/[\s\-\(\)]/g, '');
    
    // Check if it starts with 880 and has 11 digits total
    const bangladeshRegex = /^8801[3-9]\d{8}$/;
    
    // Also accept numbers that start with 01 (local format)
    const localRegex = /^01[3-9]\d{8}$/;
    
    return bangladeshRegex.test(cleanNumber) || localRegex.test(cleanNumber);
  }

  /**
   * Get error message from response code
   */
  private getErrorMessage(code: number): string {
    // Handle NaN and invalid codes
    if (isNaN(code) || code === 0) {
      return 'Invalid response from SMS service';
    }
    
    const errorMessages: { [key: number]: string } = {
      1001: 'Invalid Number',
      1002: 'Sender ID not correct or disabled',
      1003: 'Please provide all required fields or contact your system administrator',
      1005: 'Internal Error',
      1006: 'Balance validity not available',
      1007: 'Insufficient balance',
      1011: 'User ID not found',
      1012: 'Masking SMS must be sent in Bengali',
      1013: 'Sender ID has not found gateway by API key',
      1014: 'Sender type name not found using this sender by API key',
      1015: 'Sender ID has not found any valid gateway by API key',
      1016: 'Sender type name active price info not found by this sender ID',
      1017: 'Sender type name price info not found by this sender ID',
      1018: 'The owner of this account is disabled',
      1019: 'The sender type name price of this account is disabled',
      1020: 'The parent of this account is not found',
      1021: 'The parent active sender type name price of this account is not found',
      1031: 'Your account is not verified. Please contact administrator',
      1032: 'IP not whitelisted'
    };

    return errorMessages[code] || `Unknown error with code: ${code}`;
  }

  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(number: string): string {
    // Remove any spaces or special characters
    let cleanNumber = number.replace(/[\s\-\(\)]/g, '');
    
    // If it starts with 01, convert to 880 format
    if (cleanNumber.startsWith('01') && cleanNumber.length === 11) {
      cleanNumber = '880' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('1') && cleanNumber.length === 11 && !cleanNumber.startsWith('880')) {
      cleanNumber = '880' + cleanNumber;
    }
    
    return cleanNumber;
  }
}

// Create singleton instance
const smsService = new SMSService();

export default smsService;
export type { SMSResponse }; 