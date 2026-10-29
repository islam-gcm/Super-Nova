import { api } from './Api';

export const endpoints = {
  public: {
    departments: (options) => api('/departments', options),
    events: (options) => api('/events?type=event', options),
    achievements: (options) => api('/content/achievement', options),
    leaders: (options) => api('/content/leader', options),
    workshops: (options) => api('/events?type=workshop', options),
    socials: (options) => api('/content/socials', options),
  },
};