# Facebook Groups Management

This document explains how to set up and use the Facebook Groups management feature in the Smart Tutors admin dashboard.

## Overview

The Facebook Groups feature allows administrators to manage collections of Facebook groups that can be used for posting tuition requirements. Each collection contains multiple Facebook groups with their details including member counts and target locations.

## Setup Instructions

### 1. Import Existing Data

To import the existing Facebook group data from the sample file:

```bash
npm run import-facebook-groups
```

This will:
- Connect to your MongoDB database
- Clear any existing Facebook group collections
- Import all collections from `data_sample/smart.fbgroupcollections.json`
- Display a summary of imported data

### 2. Access the Admin Dashboard

1. Navigate to `/dashboard/facebook-groups` in your application
2. You'll see all imported Facebook group collections
3. Each collection shows:
   - Collection name and slug
   - Creation date
   - List of Facebook groups with member counts and locations

## Data Structure

### Facebook Group Collection
```typescript
{
  _id: string;
  collectionName: string;  // e.g., "Mirpur", "All Top Groups"
  slug: string;            // URL-friendly version of collection name
  groups: FacebookGroup[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Facebook Group
```typescript
{
  _id: string;
  name: string;           // Group name
  link: string;           // Facebook group URL
  memberCount: number;    // Number of members
  locations: string[];    // Target locations (e.g., ["Mirpur", "Dhaka"])
}
```

## API Endpoints

### Get All Collections
```
GET /api/facebook-groups
```

### Get Single Collection
```
GET /api/facebook-groups/[id]
```

### Create Collection
```
POST /api/facebook-groups
Content-Type: application/json

{
  "collectionName": "New Collection",
  "groups": [
    {
      "name": "Group Name",
      "link": "https://facebook.com/groups/...",
      "memberCount": 1000,
      "locations": ["Location1", "Location2"]
    }
  ]
}
```

### Update Collection
```
PUT /api/facebook-groups/[id]
Content-Type: application/json

{
  "collectionName": "Updated Name",
  "groups": [...]
}
```

### Delete Collection
```
DELETE /api/facebook-groups/[id]
```

## Usage Examples

### Creating a New Collection
1. Click "Add Collection" in the admin dashboard
2. Enter collection name (e.g., "New Area")
3. Add Facebook groups with their details
4. Save the collection

### Editing a Collection
1. Click "Edit" on any collection
2. Modify collection name or groups
3. Add/remove groups as needed
4. Update the collection

### Deleting a Collection
1. Click "Delete" on any collection
2. Confirm the deletion
3. Collection and all its groups will be removed

## Integration with Social Media Posting

The Facebook Groups collections can be used for:

1. **Targeted Posting**: Post tuition requirements to specific location-based groups
2. **Member Count Analysis**: Choose groups with higher member counts for better reach
3. **Location Matching**: Match tuition locations with appropriate Facebook groups
4. **Automated Posting**: Use these collections for automated social media posting features

## Sample Collections

The imported data includes collections for:

- **Mirpur**: Location-specific groups for Mirpur area
- **All Top Groups**: High-member-count general tuition groups
- **Dhanmondi**: Location-specific groups for Dhanmondi area
- **Medical**: Groups focused on medical students
- **DU**: Dhaka University specific groups
- **Uttara**: Location-specific groups for Uttara area
- And many more...

## Next Steps

1. **Enhanced UI**: Add create/edit modals for better user experience
2. **Bulk Operations**: Add bulk import/export functionality
3. **Analytics**: Add analytics for group performance
4. **Integration**: Integrate with social media posting automation
5. **Validation**: Add validation for Facebook group URLs and member counts

## Troubleshooting

### Import Issues
- Ensure MongoDB is running and accessible
- Check your `MONGODB_URI` environment variable
- Verify the sample data file exists at `data_sample/smart.fbgroupcollections.json`

### API Issues
- Check server logs for detailed error messages
- Ensure all required fields are provided in API requests
- Verify collection names are unique

### Database Issues
- Check MongoDB connection
- Verify database permissions
- Check for duplicate collection names or slugs 