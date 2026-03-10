// ── Configuration ──────────────────────────────────────────────────────
var NOTIFICATION_EMAIL = 'ceo@fenzo.co, suriya@dsignxt.com'; // ← Change this to your email
var SHEET_NAME_LEADS = 'Website Leads'; // The name of the tab in your Google Sheet

// ── Handle POST requests ───────────────────────────────────────────────
function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var timestamp = new Date();

        // ── Append to Sheet ─────────────────────────────────────────
        var sheet = ss.getSheetByName(SHEET_NAME_LEADS);

        // Create the sheet if it doesn't exist
        if (!sheet) {
            sheet = ss.insertSheet(SHEET_NAME_LEADS);
            // Add headers
            sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Event Type', 'Date', 'Location', 'Budget', 'Venue', 'Message', 'Source']);
            sheet.getRange("A1:K1").setFontWeight("bold");
        }

        sheet.appendRow([
            timestamp,
            data.name || '',
            data.phone || '',
            data.email || '',
            data.eventType || '',
            data.date || '',
            data.location || '',
            data.budget || '',
            data.venue || '',
            data.message || '',
            data.source || '' // E.g., 'Main Form' or 'Popup Modal'
        ]);

        // ── Send Email Notification ────────────────────────────────────────
        var subject = '🎉 New Event Lead: ' + (data.name || 'Unknown');
        var body = 'New event planning enquiry received from the website!\n\n'
            + 'Name: ' + (data.name || '-') + '\n'
            + 'Phone: ' + (data.phone || '-') + '\n'
            + 'Email: ' + (data.email || '-') + '\n'
            + 'Event Type: ' + (data.eventType || '-') + '\n'
            + 'Date: ' + (data.date || '-') + '\n'
            + 'Location: ' + (data.location || '-') + '\n'
            + 'Budget: ' + (data.budget || '-') + '\n'
            + 'Venue: ' + (data.venue || '-') + '\n'
            + 'Message: ' + (data.message || '-') + '\n'
            + 'Source: ' + (data.source || '-') + '\n'
            + 'Time: ' + timestamp.toLocaleString('en-IN');

        MailApp.sendEmail({
            to: NOTIFICATION_EMAIL,
            subject: subject,
            body: body
        });

        return ContentService.createTextOutput(
            JSON.stringify({ status: 'success' })
        ).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(
            JSON.stringify({ status: 'error', message: err.toString() })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

// ── Handle GET requests (health check) ────────────────────────────────
function doGet(e) {
    return ContentService.createTextOutput('Timeline Stories form handler is running.');
}
