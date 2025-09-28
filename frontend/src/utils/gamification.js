// Gamification utility functions and centralized state

// Centralized gamification state
let gamificationState = {
  xp: 650,
  streak: 2,
  tokens: 1000,
  level: 0 // Will be calculated dynamically
};

// Update level based on current XP
const updateLevel = () => {
  gamificationState.level = Math.floor(gamificationState.xp / 100);
};

// Initialize level
updateLevel();

/**
 * Get current gamification state
 * @returns {object} - Current gamification state
 */
export const getGamificationState = () => {
  return { ...gamificationState };
};

/**
 * Update XP and recalculate level
 * @param {number} newXP - New XP value
 */
export const setXP = (newXP) => {
  gamificationState.xp = newXP;
  updateLevel();
  
  // Dispatch custom event to notify components of the update
  window.dispatchEvent(new CustomEvent('gamificationUpdate'));
};

/**
 * Update streak
 * @param {number} newStreak - New streak value
 */
export const setStreak = (newStreak) => {
  gamificationState.streak = newStreak;
  
  // Dispatch custom event to notify components of the update
  window.dispatchEvent(new CustomEvent('gamificationUpdate'));
};

/**
 * Add XP and update state
 * @param {number} xpToAdd - XP to add
 * @returns {object} - Updated gamification state
 */
export const addXP = (xpToAdd) => {
  gamificationState.xp += xpToAdd;
  updateLevel();
  
  // Dispatch custom event to notify components of the update
  window.dispatchEvent(new CustomEvent('gamificationUpdate'));
  
  return { ...gamificationState };
};

/**
 * Add tokens and update state
 * @param {number} tokensToAdd - Tokens to add
 * @returns {object} - Updated gamification state
 */
export const addTokens = (tokensToAdd) => {
  gamificationState.tokens += tokensToAdd;
  
  // Dispatch custom event to notify components of the update
  window.dispatchEvent(new CustomEvent('gamificationUpdate'));
  
  return { ...gamificationState };
};

/**
 * Calculate level based on XP
 * Every 100 XP = 1 level (0-99 = level 0, 100-199 = level 1, etc.)
 * @param {number} xp - Total XP
 * @returns {number} - Current level
 */
export const calculateLevel = (xp) => {
  return Math.floor(xp / 100);
};

/**
 * Calculate XP needed for next level
 * @param {number} xp - Current XP
 * @returns {number} - XP needed for next level
 */
export const getXPForNextLevel = (xp) => {
  const currentLevel = calculateLevel(xp);
  const nextLevelXP = (currentLevel + 1) * 100;
  return nextLevelXP - xp;
};

/**
 * Calculate progress percentage to next level
 * @param {number} xp - Current XP
 * @returns {number} - Progress percentage (0-100)
 */
export const getLevelProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  const currentLevelXP = currentLevel * 100;
  const nextLevelXP = (currentLevel + 1) * 100;
  const progressXP = xp - currentLevelXP;
  const totalXPNeeded = nextLevelXP - currentLevelXP;
  
  return Math.min((progressXP / totalXPNeeded) * 100, 100);
};


/**
 * Get gamification stats object
 * @param {number} xp - Current XP
 * @returns {object} - Complete gamification stats
 */
export const getGamificationStats = (xp) => {
  return {
    xp: xp,
    level: calculateLevel(xp),
    progress: getLevelProgress(xp),
    xpForNextLevel: getXPForNextLevel(xp)
  };
};

/**
 * Get gamification stats from centralized state
 * @returns {object} - Complete gamification stats
 */
export const getGamificationStatsFromState = () => {
  return {
    xp: gamificationState.xp,
    level: gamificationState.level,
    streak: gamificationState.streak,
    tokens: gamificationState.tokens,
    progress: getLevelProgress(gamificationState.xp),
    xpForNextLevel: getXPForNextLevel(gamificationState.xp)
  };
};
