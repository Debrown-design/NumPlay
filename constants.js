export const AppStage = {
    WELCOME: "WELCOME",
    ARCADE: "ARCADE",
    GAME_DETAILS: "GAME_DETAILS",
    NINJA_DASHBOARD: "NINJA_DASHBOARD",
    NINJA_GAME: "NINJA_GAME",
    RACER_DASHBOARD: "RACER_DASHBOARD",
    RACER_GAME: "RACER_GAME",
    BOXING_DASHBOARD: "BOXING_DASHBOARD",
    BOXING_GAME: "BOXING_GAME",
    FLASHCARD_DASHBOARD: "FLASHCARD_DASHBOARD",
    FLASHCARD_GAME: "FLASHCARD_GAME"
};

export const INITIAL_NINJA_PROGRESS = {
    level: 1,
    currentScore: 0,
    highScore: 0,
    lifetimeScore: 0,
    totalRoundsPlayed: 0,
    lives: 3,
    livesLostAt: [],
    unlockedSwords: ['basic'],
    equippedSwordId: 'basic',
    history: []
};

export const INITIAL_RACER_PROGRESS = {
    wins: 0,
    totalRaces: 0,
    rankPoints: 0,
    currentSessionScore: 0,
    unlockedCars: ['velocity-vector'],
    equippedCarId: 'velocity-vector',
    history: []
};