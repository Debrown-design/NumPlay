//const API_BASE_URL = 'mongodb+srv://dev:dev@cluster0.ilwwy5p.mongodb.net/?appName=Cluster0';

const LOCAL_KEYS = {
  USER: 'num_play_user_v1',
  NINJA: 'num_play_ninja_v1',
  RACER: 'num_play_racer_v1',
  BOXER: 'num_play_boxer_v1',
};

export const storageService = {
  checkConnection: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { 
        signal: AbortSignal.timeout(1000) 
      });
      return { online: res.ok, mode: res.ok ? 'MongoDB' : 'Local' };
    } catch {
      return { online: false, mode: 'Local' };
    }
  },

  saveUser: async (user) => {
    localStorage.setItem(LOCAL_KEYS.USER, JSON.stringify(user));
    try {
      await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    } catch (e) {}
  },
  
  loadUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/current`, {
        signal: AbortSignal.timeout(1500)
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.name) return data;
      }
    } catch (e) {}
    
    const local = localStorage.getItem(LOCAL_KEYS.USER);
    return local ? JSON.parse(local) : null;
  },

  saveNinjaProgress: async (progress) => {
    localStorage.setItem(LOCAL_KEYS.NINJA, JSON.stringify(progress));
    try {
      await fetch(`${API_BASE_URL}/progress/ninja`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
      });
    } catch (e) {}
  },

  loadNinjaProgress: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/current`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.ninjaProgress) return data.ninjaProgress;
      }
    } catch (e) {}
    const local = localStorage.getItem(LOCAL_KEYS.NINJA);
    return local ? JSON.parse(local) : null;
  },

  saveRacerProgress: async (progress) => {
    localStorage.setItem(LOCAL_KEYS.RACER, JSON.stringify(progress));
    try {
      await fetch(`${API_BASE_URL}/progress/racer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
      });
    } catch (e) {}
  },

  loadRacerProgress: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/current`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.racerProgress) return data.racerProgress;
      }
    } catch (e) {}
    const local = localStorage.getItem(LOCAL_KEYS.RACER);
    return local ? JSON.parse(local) : null;
  },

  clearAll: async () => {
    localStorage.clear();
    try {
      await fetch(`${API_BASE_URL}/user/session`, { method: 'DELETE' });
    } catch (e) {}
  }
};