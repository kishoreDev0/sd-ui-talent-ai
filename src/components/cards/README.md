# Card Layout System

A flexible, reusable card layout system inspired by modern dashboard designs. This system provides various card types and a responsive grid layout.

## Components

### Card Types

1. **EventCard** - For displaying events, meetings, or scheduled items
2. **TaskCard** - For displaying task counts or task information
3. **ActivityCard** - For displaying activities with duration
4. **MeetingCard** - For displaying meeting information with participants
5. **PeopleListCard** - For displaying a list of people with notifications
6. **StatusCard** - For displaying items with status (done, pending, active)
7. **NavigationCard** - For navigation items with "Next Task" functionality
8. **DateSelectorCard** - For date selection with visual indicators

### Layout Components

- **CardGrid** - Responsive grid container for cards
- **GridItem** - Grid item with span support for flexible layouts

## Usage

### Basic Example

```tsx
import { EventCard, TaskCard, CardGrid, GridItem } from '@/components/cards';
import { Zap } from 'lucide-react';

function MyDashboard() {
  return (
    <div className="p-6 bg-gray-50">
      <CardGrid columns={3} gap="md">
        <GridItem colSpan={2}>
          <EventCard
            title="Club Meeting"
            time="09:00 - 12:30"
            description="Design and research for a user roadmap"
            category="Personal"
            icon={Zap}
            iconColor="text-purple-600"
            participants={[
              { name: 'Alice' },
              { name: 'Bob' },
              { name: 'Charlie' },
            ]}
            variant="large"
          />
        </GridItem>

        <GridItem>
          <TaskCard number="05" label="New Task" avatar={{ name: 'User' }} />
        </GridItem>
      </CardGrid>
    </div>
  );
}
```

### Event Card

```tsx
<EventCard
  title="Meeting Title"
  time="09:00 - 12:30"
  description="Optional description text"
  category="Personal"
  icon={Zap}
  iconColor="text-purple-600"
  participants={[{ name: 'Alice', src: '/avatar1.jpg' }, { name: 'Bob' }]}
  variant="large" // or "default"
  onClick={() => console.log('Card clicked')}
/>
```

### Task Card

```tsx
<TaskCard
  number="05"
  label="New Task"
  avatar={{ name: 'User', src: '/avatar.jpg' }}
  status="pending" // or "completed" | "in-progress"
  onClick={() => console.log('Task clicked')}
/>
```

### Activity Card

```tsx
<ActivityCard
  activity="Tennis"
  duration="45 Min"
  icon={Dumbbell}
  iconColor="text-yellow-600"
  onClick={() => console.log('Activity clicked')}
/>
```

### Meeting Card

```tsx
<MeetingCard
  title="Video Call"
  time="09:00 - 10:00 PM"
  participants={[{ name: 'Alice' }, { name: 'Bob' }]}
  status="active" // or "upcoming" | "completed"
  showJoinButton={true}
  onJoin={() => console.log('Joining call...')}
/>
```

### People List Card

```tsx
<PeopleListCard
  people={[
    { name: 'Jane Cooper', notificationCount: 5 },
    { name: 'Monty Rodriguez', notificationCount: 11 },
    { name: 'Tara Monzo', notificationCount: 27 },
  ]}
  onClick={() => console.log('People list clicked')}
/>
```

### Status Card

```tsx
<StatusCard
  title="Reading Book"
  date="21 June"
  status="done" // or "pending" | "active"
  icon={CheckCircle2}
  onClick={() => console.log('Status clicked')}
/>
```

### Navigation Card

```tsx
<NavigationCard
  title="Design App"
  time="09:00-12:00"
  nextLabel="Next Task"
  showArrow={true}
  onClick={() => console.log('Navigation clicked')}
/>
```

### Date Selector Card

```tsx
<DateSelectorCard
  title="Week Days"
  dates={[
    { day: 15, hasDot: true },
    { day: 16, selected: true, hasDot: true },
    { day: 17, hasDot: true },
  ]}
  nextLabel="Next Task >>"
  onClick={() => console.log('Date selector clicked')}
/>
```

### Card Grid

```tsx
<CardGrid columns={3} gap="md">
  {/* Your cards here */}
</CardGrid>
```

**Props:**

- `columns`: 1 | 2 | 3 | 4 | 5 | 6 (default: 3)
- `gap`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: Additional CSS classes

### Grid Item

```tsx
<GridItem colSpan={2} rowSpan={2}>
  {/* Your card here */}
</GridItem>
```

**Props:**

- `colSpan`: 1 | 2 | 3 | 4 | 5 | 6 (default: 1)
- `rowSpan`: 1 | 2 | 3 (default: 1)
- `className`: Additional CSS classes

## Features

- ✅ Fully responsive grid system
- ✅ Smooth animations with Framer Motion
- ✅ Hover and click interactions
- ✅ Flexible card sizing with GridItem
- ✅ TypeScript support
- ✅ Customizable colors and icons
- ✅ Avatar support with fallbacks
- ✅ Notification badges
- ✅ Status indicators

## Styling

All cards use Tailwind CSS classes and can be customized with:

- Custom `className` prop
- Icon colors via `iconColor` prop
- Variant prop for different sizes (where applicable)

## Examples

See `card-demo.tsx` for a complete example implementation.
