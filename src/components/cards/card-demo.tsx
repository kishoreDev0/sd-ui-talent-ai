import React from 'react';
import {
  EventCard,
  TaskCard,
  ActivityCard,
  MeetingCard,
  PeopleListCard,
  StatusCard,
  NavigationCard,
  DateSelectorCard,
  CardGrid,
  GridItem,
} from './index';
import { Zap, Bed, Dumbbell, Video, Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';

/**
 * Demo component showing how to use the card layout system
 * This can be used as a reference or as an actual dashboard page
 */
const CardLayoutDemo: React.FC = () => {
  const role = useUserRole();
  const participants = [
    { name: 'Alice', alt: 'Alice' },
    { name: 'Bob', alt: 'Bob' },
    { name: 'Charlie', alt: 'Charlie' },
  ];

  const people = [
    { name: 'Jane Cooper', notificationCount: 5 },
    { name: 'Monty Rodriguez', notificationCount: 11 },
    { name: 'Tara Monzo', notificationCount: 27 },
  ];

  const dates = [
    { day: 15, hasDot: true },
    { day: 16, selected: true, hasDot: true },
    { day: 17, hasDot: true },
    { day: 18, hasDot: true },
    { day: 19, hasDot: true },
    { day: 20, hasDot: true },
  ];

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Dashboard Cards Layout
          </h1>

          <CardGrid columns={3} gap="md">
            {/* Large Event Card */}
            <GridItem colSpan={2} rowSpan={2}>
              <EventCard
                title="Club Meeting"
                time="09:00 - 12:30"
                description="Design and research for a user roadmap in a design project that I have to do with friends."
                category="Personal"
                icon={Zap}
                iconColor="text-purple-600"
                participants={participants}
                variant="large"
              />
            </GridItem>

            {/* Task Card */}
            <GridItem>
              <TaskCard
                number="05"
                label="New Task"
                avatar={{ name: 'User', alt: 'User' }}
              />
            </GridItem>

            {/* Navigation Card */}
            <GridItem>
              <NavigationCard
                title="Design App"
                time="09:00-12:00"
                nextLabel="Next Task"
              />
            </GridItem>

            {/* People List Card */}
            <GridItem rowSpan={2}>
              <PeopleListCard people={people} />
            </GridItem>

            {/* Activity Card */}
            <GridItem>
              <ActivityCard
                activity="Tennis"
                duration="45 Min"
                icon={Dumbbell}
                iconColor="text-yellow-600"
              />
            </GridItem>

            {/* Meeting Card */}
            <GridItem>
              <MeetingCard
                title="Client Meeting"
                time="09:00 - 10:00 PM"
                participants={participants.slice(0, 1)}
              />
            </GridItem>

            {/* Video Call Card */}
            <GridItem colSpan={2}>
              <MeetingCard
                title="Video Call"
                time="09:00 - 10:00 PM"
                participants={participants}
                status="active"
                showJoinButton={true}
                onJoin={() => console.log('Joining call...')}
              />
            </GridItem>

            {/* Bedtime Card */}
            <GridItem>
              <ActivityCard
                activity="Bedtime"
                duration="09:00 - 06:00 A.m."
                icon={Bed}
                iconColor="text-blue-600"
              />
            </GridItem>

            {/* Daily Yoga Card */}
            <GridItem>
              <ActivityCard
                activity="Daily Yoga"
                duration="6:15 - 7:00 A.m."
                icon={Dumbbell}
                iconColor="text-red-600"
              />
            </GridItem>

            {/* Reading Book Card */}
            <GridItem>
              <StatusCard title="Reading Book" date="21 June" status="done" />
            </GridItem>

            {/* Meeting Team Card */}
            <GridItem>
              <ActivityCard
                activity="Meeting Team"
                duration="30 Min"
                icon={Video}
                iconColor="text-green-600"
              />
            </GridItem>

            {/* CS Study Card */}
            <GridItem>
              <EventCard
                title="CS Study"
                time="09:00 - 12:30"
                category="Personal"
              />
            </GridItem>

            {/* UX Writing Card */}
            <GridItem>
              <EventCard
                title="UX Writing"
                time="13:00 - 15:00"
                category="Work"
              />
            </GridItem>

            {/* Cycling Card */}
            <GridItem>
              <ActivityCard
                activity="Cycling"
                duration="30 Min"
                icon={Zap}
                iconColor="text-blue-600"
              />
            </GridItem>

            {/* Date Selector Card */}
            <GridItem colSpan={2}>
              <DateSelectorCard
                title="Week Days"
                dates={dates}
                nextLabel="Next Task >>"
              />
            </GridItem>
          </CardGrid>
        </div>
      </div>
    </MainLayout>
  );
};

export default CardLayoutDemo;
