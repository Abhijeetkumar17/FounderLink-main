const AVATAR_STORAGE_KEY = 'profile-avatars';

type AvatarMap = Record<string, string>;

const readAvatarMap = (): AvatarMap => {
  try {
    return JSON.parse(localStorage.getItem(AVATAR_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export const getStoredAvatar = (userId?: string | number | null) => {
  if (userId === undefined || userId === null) {
    return null;
  }

  const avatars = readAvatarMap();
  return avatars[String(userId)] || null;
};

export const saveStoredAvatar = (userId: string | number, imageDataUrl: string) => {
  const avatars = readAvatarMap();
  avatars[String(userId)] = imageDataUrl;
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
};

export const removeStoredAvatar = (userId: string | number) => {
  const avatars = readAvatarMap();
  delete avatars[String(userId)];
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
};

export const getAvatarSrc = (userId: string | number | null | undefined, displayName?: string, fallback = 'U') => {
  const storedAvatar = getStoredAvatar(userId);
  if (storedAvatar) {
    return storedAvatar;
  }

  const name = encodeURIComponent(displayName || fallback);
  return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
};
