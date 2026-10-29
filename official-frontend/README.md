SuperNova Frontend — Technical Notes
1. API request flow
All public requests go through:

services/Api.js
services/Endpoints.js

Endpoints.js defines the available requests:

departments: (options) => api('/departments', options),
events: (options) => api('/events?type=event', options),
achievements: (options) => api('/content/achievement', options),
leaders: (options) => api('/content/leader', options),
workshops: (options) => api('/events?type=workshop', options),
socials: (options) => api('/content/socials', options),

The api() function:

Reads VITE_API_BASE_URL.
Validates that the URL is correctly formatted.
Requires HTTPS in production.
Sends an Accept: application/json header.
Automatically stringifies JSON request bodies.
Aborts requests after the timeout.
Parses JSON or text responses.
Throws an error for non-successful responses.
Example:

const response = await endpoints.public.events({
  signal: controller.signal,
});

2. Request cancellation and retry
Each list component creates an AbortController:

const controller = new AbortController();

The signal is passed to api():

endpoints.public.events({
  signal: controller.signal,
});

The request is cancelled when the component unmounts:

return () => controller.abort();

The retryKey state triggers a new request when the user clicks Try again:

setRetryKey((value) => value + 1);

Abort errors are ignored because they are expected during unmounting:

if (err.name === 'AbortError') return;

3. Response verification and normalization
The API may return an array directly or wrap it inside data, events, items, or another property.

Each list has an extractList() function that finds the first valid array:

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  const candidates = [
    response?.data,
    response?.items,
    response?.data?.items,
  ];
  return candidates.find(Array.isArray) || [];
};

This prevents the UI from crashing when the backend response is empty or has a different wrapper.

Events and workshops also verify the item type:

const type = String(item?.type ?? '').toLowerCase();
return !type || type === 'workshop';

4. URL verification
Cards use isSafeUrl() before rendering API-provided images or links:

const isSafeUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value, 'https://supernova.local');
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

Links accept only http: and https:. Images also accept PNG, JPEG, and WebP data URLs produced by the Virtual Club's local image picker; javascript: and file: are rejected.

If an image fails to load, the card displays a gradient fallback:

onError={() => setImageFailed(true)}

5. Date verification
Cards validate dates before displaying them:

const date = new Date(dateString);
if (Number.isNaN(date.getTime())) {
  return null;
}

Invalid dates are not rendered in the card.

6. List components
Each list follows the same state flow:

const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [retryKey, setRetryKey] = useState(0);

The component displays:

Loading state while fetch() is running
Error state when the request fails
Retry button after an error
Empty state when the response contains no items
Cards when valid data is returned
List files:

EventsList.jsx
AchievementsList.jsx
DepartmentsList.jsx
LeadersList.jsx
WorkshopsList.jsx

7. Department interaction
DepartmentsList.jsx stores the opened card index:

const [openIndex, setOpenIndex] = useState(null);

Only one department can be expanded at a time:

setOpenIndex(openIndex === index ? null : index);

DepartmentCard.jsx supports:

Mouse click
Enter key
Space key
aria-expanded
8. Leaders carousel
LeadersList.jsx stores the active leader:

const [activeIndex, setActiveIndex] = useState(0);

Previous and next buttons update the index with wraparound:

setActiveIndex((previous) =>
  previous > 0 ? previous - 1 : safeLeaders.length - 1
);

Cards receive an offset to calculate their position, rotation, scale, and opacity.

9. Horizontal scrolling
Events, workshops, and achievements use a scroll container:

const scrollRef = useRef(null);

The navigation buttons call:

scrollRef.current?.scrollBy({
  left: 360,
  behavior: 'smooth',
});

10. Theme verification
ThemeContext.jsx determines the initial theme in this order:

Saved localStorage value
Browser system preference
Light mode fallback
The theme is applied to the document root:

root.classList.toggle('dark', theme === 'dark');
root.style.colorScheme = theme;

Cards use explicit transitions instead of transition-all, preventing delayed or abnormal animations during theme switching.

11. Main technical files
context/ThemeContext.jsx
services/Api.js
services/Endpoints.js
components/events/EventsList.jsx
components/achievements/AchievementsList.jsx
components/departments/DepartmentsList.jsx
components/leaders/LeadersList.jsx
components/workshops/WorkshopsList.jsx

The frontend requires VITE_API_BASE_URL and expects the API endpoints listed in services/Endpoints.js.
