# Design Guidelines: Florida Highway Patrol - Troop Management System

## Design Approach

**Selected System**: Material Design principles adapted for government/law enforcement context
**Rationale**: This is a utility-focused, information-dense management system requiring professional authority, clear data hierarchy, and efficient workflows. Material Design's structured approach to forms, data displays, and state management aligns perfectly with these needs.

**Key Design Principles**:
- Professional authority with clean, structured layouts
- Clear visual hierarchy for rapid information processing
- Efficient task completion with minimal cognitive load
- Trustworthy, stable interface appropriate for law enforcement context

---

## Typography

**Font Family**: 
- Primary: Inter (via Google Fonts) - clean, professional, excellent readability
- Monospace: JetBrains Mono (for badge numbers, IDs, timestamps)

**Type Scale**:
- Page Titles: text-3xl font-bold (30px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-xl font-semibold (20px)
- Body Text: text-base (16px)
- Supporting Text: text-sm (14px)
- Labels/Captions: text-xs font-medium uppercase tracking-wide (12px)

**Hierarchy Implementation**:
- Use font-semibold for all headers and important labels
- Use font-medium for interactive elements (buttons, tabs)
- Use font-normal for body content and descriptions
- Apply uppercase + tracking-wide for category labels and status badges

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Micro spacing (within components): p-2, gap-2
- Standard spacing (between elements): p-4, gap-4, mb-4
- Section spacing: p-6, mb-6
- Major sections: p-8, mb-8

**Container Structure**:
- Max width: max-w-7xl mx-auto for main content
- Dashboard grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Side padding: px-4 md:px-6 lg:px-8

**Responsive Breakpoints**:
- Mobile: Base (single column)
- Tablet: md: (2 columns for cards)
- Desktop: lg: (3 columns, expanded tables)

---

## Component Library

### Navigation & Header
- **Top Navbar**: Full-width with elevated shadow (shadow-md)
- Height: h-16
- Layout: Flex justify-between with logo left, navigation center, user menu right
- Logo area includes "Florida Highway Patrol" text with badge icon
- Navigation links: text-sm font-medium with hover:underline
- User menu: Avatar + dropdown with role badge (Trooper/Supervisor)

### Dashboard Cards
- **Statistics Cards**: Elevated cards with shadow-lg rounded-lg
- Structure: Icon (top-left) + Label (text-sm uppercase tracking-wide) + Large Number (text-4xl font-bold) + Trend indicator
- Padding: p-6
- Grid: 4 cards across on desktop, 2 on tablet, 1 on mobile
- Include subtle border-l-4 for category accent

### Forms & Input Fields
- **Text Inputs**: Full width with rounded-md border-2
- Height: h-12 for standard inputs
- Label: text-sm font-medium mb-2
- Focus state: ring-2 ring-offset-2
- Error state: border-red-500 with text-sm text-red-600 message below
- Helper text: text-xs mt-1

**Form Layout**:
- Single column on mobile
- Two columns (grid-cols-2 gap-4) for related fields on desktop
- Full width for textareas and large inputs
- Submit buttons: Full width on mobile, auto width (px-8) on desktop, aligned right

### Modals
- **Overlay**: Fixed inset-0 with backdrop blur
- **Modal Container**: max-w-md to max-w-2xl depending on content
- **Structure**: 
  - Header: p-6 with text-xl font-semibold + close button
  - Body: p-6 with form or content
  - Footer: p-6 flex justify-end gap-3 for action buttons
- Rounded: rounded-xl
- Shadow: shadow-2xl

### Tables & Data Lists
- **Table Structure**: Full width with rounded-lg overflow-hidden
- Header: Sticky top with font-semibold text-sm uppercase tracking-wide
- Row padding: px-6 py-4
- Alternating rows with subtle background
- Hover state: Subtle highlight on rows
- Actions column: Right-aligned with icon buttons

**Mobile Adaptation**: Convert to stacked cards on mobile with key-value pairs

### Buttons
- **Primary Action**: px-6 py-3 rounded-lg font-medium with shadow-md
- **Secondary Action**: px-6 py-3 rounded-lg font-medium with border-2
- **Danger Action**: Same structure with red treatment
- **Icon Buttons**: p-2 rounded-lg for table actions
- Disabled state: opacity-50 cursor-not-allowed

### Status Badges
- **Design**: Inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
- **Types**: 
  - Pending: Yellow treatment
  - Approved: Green treatment  
  - Denied: Red treatment
  - Active: Blue treatment

### Strike Display
- **Strike Cards**: Individual cards with border-l-4 red accent
- Structure: Date (top-right text-xs) + Reason (text-base font-medium) + Issuing Supervisor (text-sm) + Full description
- Padding: p-4
- Stack vertically with gap-3

### Charts & Visualizations
- Use simple bar charts and line graphs for analytics
- Container: p-6 with rounded-lg shadow
- Keep charts clean with minimal gridlines
- Label axes clearly with text-sm

---

## Page-Specific Layouts

### Home/Landing
- **Hero Section**: h-96 with gradient background
- Center-aligned content with text-5xl heading
- Subtitle: text-xl max-w-2xl mx-auto
- CTA buttons: Large primary + secondary side by side
- Features grid below: 3 columns with icon + title + description cards

### Trooper Dashboard
- **Top Section**: Welcome banner with trooper name + badge number
- **Grid Layout**: 
  - Left column (2/3): Recent reports table + Submit new report button
  - Right column (1/3): Profile summary card + Strikes list
- Statistics row: 3 cards showing report count, pending, approved

### Supervisor Dashboard  
- **Tabs Navigation**: Horizontal tabs (Pending Profiles | Reports | Analytics)
- **Pending Profiles Section**: Grid of profile cards (2 cols on desktop)
- Each card: Avatar + Name + Badge + Details + Approve/Deny buttons
- **Reports Section**: Filterable table with status filters as pills above
- **Analytics Section**: 4 statistics cards + visualization charts below

### Profile Editor
- **Layout**: Single column form with sections
- Sections: Personal Info | Contact | Department Details | Profile Photo
- Photo upload: Large circular preview with upload button beneath
- Section dividers: border-t with pt-6 mt-6

---

## Images

**Hero Image**: 
- Place a professional stock photo of Florida highway patrol vehicles or law enforcement professionals in action
- Dimensions: Full width, 400px height (h-96)
- Treatment: Overlay with gradient (dark bottom to transparent top) for text readability
- Buttons on hero: Use backdrop-blur-sm on button backgrounds

**Profile Photos**:
- Circular avatars: w-12 h-12 for navbar, w-24 h-24 for profile cards, w-32 h-32 for profile editor
- Default placeholder: Use initials on solid background when no photo uploaded

**Department Badge/Logo**:
- Place Florida Highway Patrol badge icon in navbar (left side, h-10 w-10)
- Use as watermark on empty states

---

## Interaction Patterns

**Loading States**: 
- Skeleton screens for tables and cards (animate-pulse with gray backgrounds)
- Spinner for form submissions (centered in button with text)

**Empty States**:
- Center-aligned with icon + heading + description + CTA button
- Example: "No reports yet" with "Submit your first report" button

**Notifications/Toasts**:
- Fixed top-right position
- Slide in animation
- Auto-dismiss after 5 seconds
- Success (green), Error (red), Info (blue) variants

**Form Validation**:
- Real-time validation on blur
- Show error messages below fields immediately
- Disable submit until valid

**Role-Based UI**:
- Show/hide navigation items based on role
- Supervisor-only sections clearly marked
- Different dashboard layouts per role type

---

This design creates a professional, efficient management system with clear authority, optimized for data-heavy workflows while maintaining visual polish and usability.