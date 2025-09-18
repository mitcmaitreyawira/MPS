# Award Popup Components

A collection of reusable popup components designed specifically for awards management with consistent UI that matches the existing design system.

## Components

### 1. AwardPopup (Base Component)

The main popup component that provides the foundation for all other popup variants.

#### Props

```typescript
interface AwardPopupProps {
  isOpen: boolean;                    // Controls popup visibility
  onClose: () => void;               // Called when popup should close
  title: string;                     // Popup title displayed in header
  children: React.ReactNode;         // Main content area
  actions?: AwardPopupAction[];      // Action buttons in footer
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Popup size (default: 'md')
  showCloseButton?: boolean;         // Show X button in header (default: true)
  closeOnOverlayClick?: boolean;     // Close when clicking overlay (default: true)
  className?: string;                // Additional CSS classes
}

interface AwardPopupAction {
  label: string;                     // Button text
  onClick: () => void;              // Button click handler
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'danger-ghost';
  disabled?: boolean;               // Disable button
  loading?: boolean;                // Show loading state
}
```

#### Basic Usage

```tsx
import { AwardPopup } from '../components/ui/AwardPopup';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Popup</button>
      
      <AwardPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Award Popup"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsOpen(false),
            variant: 'neutral'
          },
          {
            label: 'Save',
            onClick: handleSave,
            variant: 'primary'
          }
        ]}
      >
        <p>Your content goes here...</p>
      </AwardPopup>
    </>
  );
};
```

### 2. AwardDetailPopup

Specialized popup for displaying award details with built-in styling and actions.

#### Props

```typescript
interface AwardDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  award: {
    name: string;
    description: string;
    icon: string;
    type: string;
    tier: string;
    recipientName?: string;
    awardedOn?: string;
    awardedBy?: string;
  };
  onEdit?: () => void;              // Optional edit handler
  onDelete?: () => void;            // Optional delete handler
  onRevoke?: () => void;            // Optional revoke handler
  isLoading?: boolean;              // Loading state for actions
}
```

#### Usage

```tsx
import { AwardDetailPopup } from '../components/ui/AwardPopup';

const award = {
  name: 'Excellence in Mathematics',
  description: 'Outstanding performance in mathematical studies',
  icon: '🏆',
  type: 'academic',
  tier: 'gold',
  recipientName: 'John Smith',
  awardedOn: '2024-01-15T10:30:00Z',
  awardedBy: 'Dr. Sarah Johnson'
};

<AwardDetailPopup
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  award={award}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onRevoke={handleRevoke}
/>
```

### 3. ConfirmationPopup

A confirmation dialog with different visual variants for different types of actions.

#### Props

```typescript
interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;            // Default: 'Confirm'
  cancelLabel?: string;             // Default: 'Cancel'
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info'; // Default: 'info'
  isLoading?: boolean;
}
```

#### Usage

```tsx
import { ConfirmationPopup } from '../components/ui/AwardPopup';

<ConfirmationPopup
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Confirm Deletion"
  message="Are you sure you want to delete this award? This action cannot be undone."
  confirmLabel="Delete Award"
  cancelLabel="Keep Award"
  onConfirm={handleDelete}
  variant="danger"
  isLoading={isDeleting}
/>
```

## Features

### Responsive Design
- Automatically adapts to different screen sizes
- Mobile-friendly with proper touch targets
- Scrollable content area when needed

### Accessibility
- Proper ARIA attributes
- Keyboard navigation support (ESC to close)
- Focus management
- Screen reader friendly

### Consistent Styling
- Matches existing design system
- Uses application's color palette
- Consistent spacing and typography
- Hover and focus states

### User Experience
- Smooth animations and transitions
- Loading states for async operations
- Overlay click to close (configurable)
- Body scroll lock when open

## Size Options

- `sm`: max-width: 384px (24rem) - For simple confirmations
- `md`: max-width: 512px (32rem) - Default size for most use cases
- `lg`: max-width: 768px (48rem) - For forms and detailed content
- `xl`: max-width: 1024px (64rem) - For complex layouts

## Action Button Variants

- `primary`: Blue background, white text - For main actions
- `secondary`: Gray background, white text - For secondary actions
- `danger`: Red background, white text - For destructive actions
- `neutral`: Light gray background, dark text - For cancel/neutral actions
- `danger-ghost`: Red text, light red background - For less prominent destructive actions

## Best Practices

### 1. Use Appropriate Sizes
```tsx
// Simple confirmation
<AwardPopup size="sm" title="Confirm Action">
  <p>Are you sure?</p>
</AwardPopup>

// Form with multiple fields
<AwardPopup size="lg" title="Create Award">
  <form>...</form>
</AwardPopup>
```

### 2. Handle Loading States
```tsx
const actions = [
  {
    label: 'Save',
    onClick: handleSave,
    variant: 'primary',
    loading: isSaving,  // Shows spinner and disables button
    disabled: !isValid  // Disables button when form is invalid
  }
];
```

### 3. Prevent Accidental Closes During Operations
```tsx
<AwardPopup
  isOpen={isOpen}
  onClose={handleClose}
  closeOnOverlayClick={!isLoading}  // Prevent closing during operations
  showCloseButton={!isLoading}      // Hide close button during operations
>
```

### 4. Use Semantic Action Labels
```tsx
// Good
actions={[
  { label: 'Cancel', variant: 'neutral' },
  { label: 'Delete Award', variant: 'danger' }
]}

// Avoid generic labels when possible
actions={[
  { label: 'No', variant: 'neutral' },
  { label: 'Yes', variant: 'danger' }
]}
```

## Integration with Existing Components

The popup components are designed to work seamlessly with the existing UI components:

```tsx
import { AwardPopup } from '../components/ui/AwardPopup';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

// Use existing Button component for triggers
<Button onClick={() => setShowPopup(true)} variant="primary">
  Open Award Details
</Button>

// Popup content can include other UI components
<AwardPopup isOpen={showPopup} onClose={handleClose} title="Award Form">
  <Card>
    <form>...</form>
  </Card>
</AwardPopup>
```

## Examples

See `AwardPopupExamples.tsx` for comprehensive examples of all popup variants and use cases.

## Customization

The components use Tailwind CSS classes and can be customized by:

1. **Adding custom className**: Pass additional classes via the `className` prop
2. **Extending the component**: Create wrapper components for specific use cases
3. **Modifying the base styles**: Update the component source for global changes

```tsx
// Custom styling
<AwardPopup
  className="custom-popup-styles"
  title="Custom Popup"
>
  <div className="custom-content">
    Content with custom styling
  </div>
</AwardPopup>
```