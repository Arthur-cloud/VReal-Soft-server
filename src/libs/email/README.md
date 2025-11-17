# Email Library

Professional email notification system for VReal using Nodemailer and Handlebars templates.

## Features

- 📧 **Multiple Email Templates**: Share notifications, invitations, permission changes, access revoked
- 🎨 **Beautiful HTML Emails**: Responsive, professional design with gradients and proper styling
- 🔧 **SMTP Configuration**: Flexible SMTP settings via environment variables
- 📝 **Handlebars Templates**: Easy to customize and maintain email templates
- 🚀 **Async Delivery**: Non-blocking email sending with error handling
- 📊 **Logging**: Built-in logging for debugging and monitoring

## Email Types

### 1. Share Notification (`share-notification.hbs`)
Sent when a file/folder is shared with an existing user.

**Variables:**
- `recipientName` - Name of the recipient
- `ownerName` - Name of the person sharing
- `resourceName` - Name of the file/folder
- `resourceType` - 'file' or 'folder'
- `permission` - Permission level label
- `permissionDescription` - What the permission allows
- `accessUrl` - Link to access the resource

### 2. Invite Notification (`invite-notification.hbs`)
Sent when a file/folder is shared with a non-registered user.

**Variables:**
- `ownerName` - Name of the person inviting
- `resourceName` - Name of the file/folder
- `resourceType` - 'file' or 'folder'
- `permission` - Permission level
- `signupUrl` - Link to create account
- `accessUrl` - Link to access after signup

### 3. Permission Changed (`permission-changed.hbs`)
Sent when a user's permission level is updated.

**Variables:**
- `recipientName` - Name of the recipient
- `ownerName` - Name of the resource owner
- `resourceName` - Name of the file/folder
- `oldPermission` - Previous permission level
- `newPermission` - New permission level
- `permissionDescription` - What the new permission allows

### 4. Access Revoked (`access-revoked.hbs`)
Sent when a user's access is removed.

**Variables:**
- `recipientName` - Name of the recipient
- `ownerName` - Name of the resource owner
- `resourceName` - Name of the file/folder
- `resourceType` - 'file' or 'folder'

## Environment Variables

Add these to your `.env` file:

```env
# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@vreal.com
EMAIL_FROM_NAME=VReal
```

### Gmail Setup

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use this password in `EMAIL_PASSWORD`

### Other SMTP Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

**Amazon SES:**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

## Usage

### Import the Module

```typescript
import { EmailModule } from '@app/email';

@Module({
  imports: [EmailModule],
})
export class YourModule {}
```

### Inject the Service

```typescript
import { EmailService } from '@app/email';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async shareResource() {
    await this.emailService.sendShareNotification({
      recipientEmail: 'user@example.com',
      recipientName: 'John Doe',
      ownerName: 'Jane Smith',
      resourceName: 'Project Files',
      resourceType: 'folder',
      permission: 'edit',
      accessUrl: 'https://vreal.com/dashboard',
    });
  }
}
```

## Template Customization

Templates are located in `src/libs/email/src/templates/`.

### Template Structure

```handlebars
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Your styles */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{title}}</h1>
    </div>
    <div class="content">
      <p>{{message}}</p>
    </div>
  </div>
</body>
</html>
```

### Permission Labels

The service automatically converts permission codes to user-friendly labels:

- `view` → "View Only"
- `edit` → "Can Edit"
- `delete` → "Can Delete"
- `share` → "Can Share"
- `manage` → "Full Access"

## Error Handling

Email sending failures are logged but don't throw errors to prevent blocking the main operation:

```typescript
try {
  await this.emailService.sendShareNotification(data);
} catch (error) {
  // Logged but doesn't fail the request
  console.error('Failed to send email:', error);
}
```

## Testing

### Test Email Locally

Use a service like [Mailtrap](https://mailtrap.io) for development:

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=test@vreal.com
```

### Preview Templates

Use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) to preview templates across email clients.

## Architecture

```
src/libs/email/
├── src/
│   ├── email.module.ts      # NestJS module with MailerModule config
│   ├── email.service.ts     # Email sending service
│   ├── index.ts             # Exports
│   └── templates/           # Handlebars templates
│       ├── share-notification.hbs
│       ├── invite-notification.hbs
│       ├── permission-changed.hbs
│       └── access-revoked.hbs
└── tsconfig.lib.json        # TypeScript config
```

## Best Practices

1. **Non-blocking**: Always use try-catch for email operations
2. **Logging**: Log all email attempts and failures
3. **Rate Limiting**: Consider implementing rate limits for production
4. **Unsubscribe**: Add unsubscribe links for compliance
5. **Testing**: Test templates with different email clients
6. **Personalization**: Use recipient names when available
7. **Responsive**: Templates are mobile-friendly by default

## License

MIT
