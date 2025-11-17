# Uploads Directory

This directory contains all uploaded files from users.

## Structure

Files are stored with unique UUID-based names to prevent conflicts and ensure security:
- Original filename: `document.pdf`
- Stored filename: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`

## File Management

- **Maximum file size**: 100MB
- **Allowed types**: All file types are supported
- **Access control**: Files are protected by permission system
- **Public links**: Files can be shared via unique public links

## Important Notes

⚠️ **Do not manually modify files in this directory**

- Files are managed automatically by the application
- Deleting files manually may cause database inconsistencies
- File paths are stored in the database and linked to file metadata

## Backup

Make sure to include this directory in your backup strategy:
```bash
# Example backup command
tar -czf backup-$(date +%Y%m%d).tar.gz ./uploads
```

## Development

In development mode, this directory is created automatically if it doesn't exist.

For production deployment, ensure:
1. Proper file permissions (readable/writable by application)
2. Sufficient disk space
3. Regular cleanup of orphaned files
4. Backup automation
