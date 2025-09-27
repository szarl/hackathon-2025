import {
  getTasksForDateRange,
  getMonthlyTaskStats,
  getUpcomingTasks,
  updateTaskStatus,
  type TaskRecord,
  type TaskStats,
} from '@/services/actions/flowerActions';
import Link from 'next/link';

interface CalendarPageProps {
  params: { userId: string };
}

// Icons
function BackIcon() {
  return (
    <svg className='size-4' viewBox='0 0 24 24' fill='none'>
      <path
        d='M19 12H5M12 19L5 12L12 5'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className='size-4' viewBox='0 0 24 24' fill='none'>
      <path d='M15 18L9 12L15 6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className='size-4' viewBox='0 0 24 24' fill='none'>
      <path d='M9 18L15 12L9 6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function WateringIcon() {
  return (
    <svg className='size-3' viewBox='0 0 24 24' fill='none'>
      <path d='M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z' fill='currentColor' />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg className='size-3' viewBox='0 0 24 24' fill='none'>
      <path
        d='M22 12H18L15 21L9 3L6 12H2'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function FertilizerIcon() {
  return (
    <svg className='size-3' viewBox='0 0 24 24' fill='none'>
      <path d='M12 2L2 7L12 12L22 7L12 2Z' fill='currentColor' />
      <path d='M2 17L12 22L22 17' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M2 12L12 17L22 12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg className='size-3' viewBox='0 0 24 24' fill='none'>
      <path d='M23 4V10H17' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M20.49 15A9 9 0 1 1 5.64 5.64L23 4'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function getTaskIcon(taskType: string) {
  switch (taskType) {
    case 'watering':
      return <WateringIcon />;
    case 'health_check':
      return <HealthIcon />;
    case 'fertilizing':
      return <FertilizerIcon />;
    case 'rotate':
      return <RotateIcon />;
    default:
      return <WateringIcon />;
  }
}

function getTaskIconBg(taskType: string) {
  switch (taskType) {
    case 'watering':
      return 'bg-blue-100';
    case 'health_check':
      return 'bg-orange-100';
    case 'fertilizing':
      return 'bg-green-100';
    case 'rotate':
      return 'bg-purple-100';
    default:
      return 'bg-blue-100';
  }
}

function getTaskIconColor(taskType: string) {
  switch (taskType) {
    case 'watering':
      return 'text-blue-600';
    case 'health_check':
      return 'text-orange-600';
    case 'fertilizing':
      return 'text-green-600';
    case 'rotate':
      return 'text-purple-600';
    default:
      return 'text-blue-600';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'normal':
      return 'bg-gray-400';
    case 'low':
      return 'bg-gray-300';
    default:
      return 'bg-gray-400';
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(time: string | null) {
  if (!time) return 'Any time';
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getRelativeDate(date: string) {
  const today = new Date();
  const taskDate = new Date(date);
  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  return formatDate(date);
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { userId } = await params;

  // Get current month data
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Get first and last day of current month
  const firstDay = new Date(currentYear, currentMonth - 1, 1);
  const lastDay = new Date(currentYear, currentMonth, 0);

  // Get tasks for current month
  const [tasks, stats, upcomingTasks] = await Promise.all([
    getTasksForDateRange(userId, firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]),
    getMonthlyTaskStats(userId, currentYear, currentMonth),
    getUpcomingTasks(userId, 5),
  ]);

  // Group tasks by date
  const tasksByDate = tasks.reduce(
    (acc, task) => {
      const date = task.scheduled_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    },
    {} as Record<string, TaskRecord[]>,
  );

  // Generate calendar days
  const calendarDays = [];
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

  for (let i = 0; i < 42; i++) {
    // 6 weeks * 7 days
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = tasksByDate[dateStr] || [];

    calendarDays.push({
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentMonth - 1,
      tasks: dayTasks,
    });
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className='min-h-screen bg-[#f7f9f8]'>
      {/* Header */}
      <div className='border-b border-[rgba(17,17,17,0.1)] bg-white px-6 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            href={`/${userId}/dashboard`}
            className='flex items-center gap-2 text-[#111111] transition-opacity hover:opacity-70'
          >
            <BackIcon />
            <span className='text-sm font-medium'>Back</span>
          </Link>

          <div className='flex items-center gap-2'>
            <button className='rounded-md p-2 transition-colors hover:bg-gray-100'>
              <ChevronLeftIcon />
            </button>
            <h1 className='min-w-[85px] text-center text-sm font-medium text-[#111111]'>
              {monthNames[currentMonth - 1]} {currentYear}
            </h1>
            <button className='rounded-md p-2 transition-colors hover:bg-gray-100'>
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        <div className='mt-6'>
          <h2 className='mb-1 text-xl font-normal text-[#111111]'>Plant Care Calendar</h2>
          <p className='text-sm text-[#9aa3a7]'>Track your plant care schedule</p>
        </div>
      </div>

      <div className='space-y-4 p-6'>
        {/* Calendar */}
        <div className='rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
          {/* Day headers */}
          <div className='mb-4 grid grid-cols-7 gap-1'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className='text-center'>
                <span className='text-xs font-medium text-[#9aa3a7]'>{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className='grid grid-cols-7 gap-1'>
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`flex aspect-square flex-col items-center justify-center rounded-md transition-colors hover:bg-gray-50 ${
                  !day.isCurrentMonth ? 'text-gray-400' : 'text-[#111111]'
                }`}
              >
                <span className='mb-1 text-sm font-medium'>{day.day}</span>
                <div className='flex gap-1'>
                  {day.tasks.slice(0, 2).map((task, taskIndex) => (
                    <div key={taskIndex} className={`h-1.5 w-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className='mt-4 flex items-center justify-center gap-4 border-t border-[rgba(17,17,17,0.1)] pt-4'>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-[#ed6c02]' />
              <span className='text-xs text-[#9aa3a7]'>Urgent</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-[#2e7d32]' />
              <span className='text-xs text-[#9aa3a7]'>Completed</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-2 w-2 rounded-full bg-[#9aa3a7]' />
              <span className='text-xs text-[#9aa3a7]'>Scheduled</span>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className='rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
          <h3 className='mb-4 text-base font-normal text-[#111111]'>Upcoming Tasks</h3>
          <div className='space-y-3'>
            {upcomingTasks.map((task) => (
              <div key={task.id} className='flex items-center gap-3 rounded-lg bg-[rgba(247,249,248,0.5)] p-3'>
                <div className={`${getTaskIconBg(task.task_type)} ${getTaskIconColor(task.task_type)} rounded-lg p-2`}>
                  {getTaskIcon(task.task_type)}
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-medium text-[#111111]'>{task.title}</h4>
                  <p className='text-xs text-[#9aa3a7]'>
                    {formatDate(task.scheduled_date)} • {task.flower_name} • {formatTime(task.scheduled_time)}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='rounded-md bg-white px-2 py-1 text-xs text-[#111111]'>
                    {getRelativeDate(task.scheduled_date)}
                  </span>
                  <form
                    action={async () => {
                      'use server';
                      await updateTaskStatus(task.id, userId, 'completed');
                    }}
                  >
                    <button className='rounded-md border border-[rgba(17,17,17,0.1)] bg-[#f7f9f8] px-3 py-1 text-sm font-medium text-[#111111] transition-colors hover:bg-gray-100'>
                      Done
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Summary */}
        {stats && (
          <div className='rounded-xl border border-[rgba(17,17,17,0.1)] bg-white p-4'>
            <h3 className='mb-4 text-base font-normal text-[#111111]'>{monthNames[currentMonth - 1]} Summary</h3>

            <div className='mb-4 grid grid-cols-2 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-medium text-[#2a7f62]'>{stats.completed_tasks}</div>
                <div className='text-xs text-[#9aa3a7]'>Tasks completed</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-medium text-[#ed6c02]'>{stats.total_tasks - stats.completed_tasks}</div>
                <div className='text-xs text-[#9aa3a7]'>Tasks remaining</div>
              </div>
            </div>

            <div className='space-y-2 border-t border-[rgba(17,17,17,0.1)] pt-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-[#111111]'>Watering tasks:</span>
                <span className='text-sm text-[#111111]'>{stats.watering_tasks}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-[#111111]'>Health checks:</span>
                <span className='text-sm text-[#111111]'>{stats.health_check_tasks}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-[#111111]'>Fertilizing:</span>
                <span className='text-sm text-[#111111]'>{stats.fertilizing_tasks}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
