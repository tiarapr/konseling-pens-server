module.exports = (content, appName, options = {}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || appName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-container {
      background-color: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      color: #2c3e50;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .content {
      margin: 20px 0;
    }
    .detail {
      background: #f8fafc;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #3b82f6;
    }
    .footer {
      font-size: 12px;
      color: #777;
      margin-top: 30px;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3b82f6;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 10px 0;
    }
    .button:hover {
      background-color: #2563eb;
      color: #FFFFFF;
    }
    .text-muted {
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h2>${appName}</h2>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p>Terima kasih,<br>Tim ${appName}</p>
      <p class="text-muted">Email ini dikirim secara otomatis. Mohon tidak membalas.</p>
    </div>
  </div>
</body>
</html>
`;