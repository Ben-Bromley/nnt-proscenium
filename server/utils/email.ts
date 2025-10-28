import resend from './resend'

interface ReservationEmailData {
  to: string
  reservationCode: string
  customerName: string
  performanceTitle: string
  performanceDate: string
  showTitle: string
  venueName: string
  totalPrice: number
  tickets: Array<{
    quantity: number
    name: string
    price: number
  }>
}

/**
 * Sends a reservation confirmation email to the customer
 */
export async function sendReservationConfirmationEmail(data: ReservationEmailData) {
  const performanceDateTime = new Date(data.performanceDate)
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(performanceDateTime)

  const formattedTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(performanceDateTime)

  const ticketsList = data.tickets
    .map(ticket => `${ticket.quantity}x ${ticket.name} - £${ticket.price.toFixed(2)}`)
    .join('\n')

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservation Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #ffffff;
      padding: 30px 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .code-box {
      background: #f9fafb;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .code-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .code-value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
    }
    .info-section {
      margin: 25px 0;
    }
    .info-section h2 {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-size: 14px;
    }
    .info-value {
      color: #1f2937;
      font-weight: 500;
      font-size: 14px;
    }
    .tickets-list {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .ticket-item {
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      margin-top: 15px;
      border-top: 2px solid #e5e7eb;
      font-weight: bold;
      font-size: 18px;
    }
    .alert-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-box h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #1e40af;
    }
    .alert-box ul {
      margin: 0;
      padding-left: 20px;
    }
    .alert-box li {
      margin-bottom: 8px;
      color: #1e40af;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 Reservation Confirmed!</h1>
  </div>
  
  <div class="content">
    <p>Dear ${data.customerName},</p>
    
    <p>Thank you for your reservation! Your tickets have been successfully reserved.</p>
    
    <div class="code-box">
      <div class="code-label">Reservation Code</div>
      <div class="code-value">${data.reservationCode}</div>
    </div>
    
    <p style="text-align: center; color: #6b7280; font-size: 14px;">
      Please quote this code when collecting your tickets
    </p>
    
    <div class="info-section">
      <h2>Performance Details</h2>
      <div class="info-row">
        <span class="info-label">Show</span>
        <span class="info-value">${data.showTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Performance</span>
        <span class="info-value">${data.performanceTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${formattedDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time</span>
        <span class="info-value">${formattedTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Venue</span>
        <span class="info-value">${data.venueName}</span>
      </div>
    </div>
    
    <div class="info-section">
      <h2>Your Tickets</h2>
      <div class="tickets-list">
        ${data.tickets.map(ticket => `
          <div class="ticket-item">
            ${ticket.quantity}x ${ticket.name} - £${ticket.price.toFixed(2)}
          </div>
        `).join('')}
      </div>
      <div class="total-row">
        <span>Total Amount</span>
        <span>£${data.totalPrice.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="alert-box">
      <h3>⚠️ Important Information</h3>
      <ul>
        <li><strong>Collect & Pay:</strong> Tickets must be collected and paid for at the venue before the performance</li>
        <li><strong>Arrival Time:</strong> Please arrive at least 15 minutes before the start time</li>
        <li><strong>Reservation Code:</strong> Bring your reservation code when collecting tickets</li>
        <li><strong>Deadline:</strong> Reservations are held until 10 minutes before the performance start time</li>
      </ul>
    </div>
    
    <p>If you have any questions or need to make changes to your reservation, please contact us as soon as possible.</p>
    
    <p>We look forward to seeing you at the show!</p>
  </div>
  
  <div class="footer">
    <p>This is an automated confirmation email. Please do not reply to this message.</p>
  </div>
</body>
</html>
  `

  const textContent = `
RESERVATION CONFIRMED

Dear ${data.customerName},

Thank you for your reservation! Your tickets have been successfully reserved.

RESERVATION CODE: ${data.reservationCode}
Please quote this code when collecting your tickets.

PERFORMANCE DETAILS
-------------------
Show: ${data.showTitle}
Performance: ${data.performanceTitle}
Date: ${formattedDate}
Time: ${formattedTime}
Venue: ${data.venueName}

YOUR TICKETS
------------
${ticketsList}

Total Amount: £${data.totalPrice.toFixed(2)}

IMPORTANT INFORMATION
---------------------
- Tickets must be collected and paid for at the venue before the performance
- Please arrive at least 15 minutes before the start time
- Bring your reservation code when collecting tickets
- Reservations are held until 10 minutes before the performance start time

If you have any questions or need to make changes to your reservation, please contact us as soon as possible.

We look forward to seeing you at the show!
  `.trim()

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Proscenium <noreply@proscenium.app>',
      to: data.to,
      subject: `Reservation Confirmed - ${data.reservationCode}`,
      html: htmlContent,
      text: textContent,
    })

    if (error) {
      console.error('Failed to send reservation confirmation email:', error)
      throw error
    }

    console.log('✅ Reservation confirmation email sent:', emailData)
    return emailData
  }
  catch (error) {
    console.error('Error sending reservation confirmation email:', error)
    throw error
  }
}
