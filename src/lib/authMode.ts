export const isAuthDisabled = (): boolean => {
  return import.meta.env.VITE_AUTH_DISABLED === 'true';
};

export const demoAuthUser = {
  id: 'local-demo-user',
  email: 'demo@nudgr.local',
  fullName: 'Local Demo',
};
