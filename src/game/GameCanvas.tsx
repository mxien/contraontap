import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SubjectId, GameDifficulty, Question, GameStats, WeaponType, DayNightPhase } from '../types/game';
import { SUBJECTS } from '../data/defaultQuestions';
import { QuestionStore } from '../services/questionStore';
import { sound } from '../services/soundService';
import { QuizGateModal } from '../components/QuizGateModal';
import { GameOverModal } from '../components/GameOverModal';
import { VictoryModal } from '../components/VictoryModal';
import { 
  Shield, Zap, Heart, ArrowUp, ArrowDown, ArrowLeft, 
  ArrowRight, Crosshair, Pause, Play, Volume2, VolumeX, Sun, Moon, Sunset 
} from 'lucide-react';

interface GameCanvasProps {
  subjectId: SubjectId;
  difficulty: GameDifficulty;
  onExit: () => void;
}

// Helper to interpolate between two RGB colors
function interpolateColor(color1: [number, number, number], color2: [number, number, number], factor: number): string {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * factor);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * factor);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

// Sky color palettes for Day, Sunset, Night (Top and Bottom stops)
const SKY_PALETTES = {
  DAY: {
    top: [2, 132, 199] as [number, number, number], // #0284c7
    mid: [56, 189, 248] as [number, number, number], // #38bdf8
    bottom: [186, 230, 253] as [number, number, number] // #bae6fd
  },
  SUNSET: {
    top: [76, 29, 149] as [number, number, number], // #4c1d95 (deep purple)
    mid: [234, 88, 12] as [number, number, number], // #ea580c (fiery orange)
    bottom: [253, 224, 71] as [number, number, number] // #fde047 (golden amber)
  },
  NIGHT: {
    top: [2, 6, 23] as [number, number, number], // #020617 (deep obsidian)
    mid: [15, 23, 42] as [number, number, number], // #0f172a (midnight blue)
    bottom: [30, 41, 59] as [number, number, number] // #1e293b (slate dark)
  }
};

// Particle for explosions and debris
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

// Floating combat text
interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

// Bullet
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isPlayer: boolean;
  type: WeaponType;
  damage: number;
  piercing?: boolean;
}

// Item Drop
interface ItemDrop {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'MUSHROOM' | 'SPREAD' | 'LASER';
  onGround: boolean;
}

// Supply Pod flying in the sky
interface SupplyPod {
  id: string;
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  hp: number;
}

// Enemy
interface Enemy {
  id: string;
  type: 'TROOPER' | 'TURRET' | 'BOSS';
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  shootCooldown: number;
  onGround: boolean;
  facing: number; // -1: left, 1: right
}

// Seal Gate
interface SealGate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unlocked: boolean;
  question: Question;
}

// Platform
interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'GROUND' | 'FLOATING' | 'BRIDGE';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  subjectId,
  difficulty,
  onExit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const subject = SUBJECTS.find(s => s.id === subjectId) || SUBJECTS[0];

  // React state for UI overlays
  const [activeQuizGate, setActiveQuizGate] = useState<{ gateIndex: number; question: Question } | null>(null);
  const [gameState, setGameState] = useState<'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'>('PLAYING');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    enemiesKilled: 0,
    questionsAnswered: 0,
    firstTryCorrect: 0,
    timeElapsed: 0
  });

  // HUD stats for smooth React display
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMana, setPlayerMana] = useState(100);
  const [playerWeapon, setPlayerWeapon] = useState<WeaponType>('NORMAL');
  const [shieldActive, setShieldActive] = useState(false);
  const [dayNightPhase, setDayNightPhase] = useState<DayNightPhase>('DAY');
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Input states (Keyboard & Touch)
  const keys = useRef<{ [key: string]: boolean }>({});

  // Engine ref state holding continuous physics and game entities
  const engineRef = useRef({
    cameraX: 0,
    worldWidth: 4200,
    worldHeight: 720,
    player: {
      x: 120,
      y: 400,
      width: 32,
      height: 60,
      crouchHeight: 34,
      vx: 0,
      vy: 0,
      hp: 100,
      mana: 100,
      isGrounded: false,
      isCrouching: false,
      isAimingUp: false,
      facing: 1, // 1: right, -1: left
      weapon: 'NORMAL' as WeaponType,
      shieldTimer: 0,
      invulnerableTimer: 0,
      shootCooldown: 0,
      walkFrame: 0
    },
    platforms: [] as Platform[],
    enemies: [] as Enemy[],
    bullets: [] as Bullet[],
    itemDrops: [] as ItemDrop[],
    supplyPods: [] as SupplyPod[],
    sealGates: [] as SealGate[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    timeElapsed: 0,
    lastFrameTime: 0,
    nextPodTime: 12,
    nextPatrolTime: 4,
    gateBreachedCount: 0,
    totalGates: 3,
    score: 0,
    enemiesKilled: 0,
    firstTryCount: 0,
    isPaused: false
  });

  // Setup World Map & Platforms
  const initWorld = useCallback(() => {
    const qList = QuestionStore.getBySubject(subjectId);
    // Shuffle questions
    const shuffled = [...qList].sort(() => 0.5 - Math.random());
    const totalGates = Math.min(3, Math.max(1, shuffled.length));

    // Reset Engine State
    const eng = engineRef.current;
    eng.cameraX = 0;
    eng.timeElapsed = 0;
    eng.score = 0;
    eng.enemiesKilled = 0;
    eng.gateBreachedCount = 0;
    eng.firstTryCount = 0;
    eng.totalGates = totalGates;
    eng.isPaused = false;
    eng.nextPodTime = 8;
    eng.nextPatrolTime = 2;

    eng.player = {
      x: 150,
      y: 400,
      width: 32,
      height: 60,
      crouchHeight: 34,
      vx: 0,
      vy: 0,
      hp: 100,
      mana: 100,
      isGrounded: false,
      isCrouching: false,
      isAimingUp: false,
      facing: 1,
      weapon: 'NORMAL',
      shieldTimer: 0,
      invulnerableTimer: 0,
      shootCooldown: 0,
      walkFrame: 0
    };

    // Platforms across 4200px map
    eng.platforms = [
      // Section 1 Ground
      { x: 0, y: 560, width: 1100, height: 160, type: 'GROUND' },
      // Elevated ledges Section 1
      { x: 260, y: 440, width: 180, height: 24, type: 'FLOATING' },
      { x: 500, y: 350, width: 220, height: 24, type: 'FLOATING' },
      { x: 780, y: 450, width: 180, height: 24, type: 'FLOATING' },

      // Section 2 Bridge & Terrain
      { x: 1150, y: 560, width: 1150, height: 160, type: 'GROUND' },
      { x: 1350, y: 440, width: 220, height: 24, type: 'FLOATING' },
      { x: 1650, y: 340, width: 240, height: 24, type: 'FLOATING' },
      { x: 1960, y: 430, width: 200, height: 24, type: 'FLOATING' },

      // Section 3 Fortress
      { x: 2350, y: 560, width: 1850, height: 160, type: 'GROUND' },
      { x: 2500, y: 450, width: 220, height: 24, type: 'FLOATING' },
      { x: 2800, y: 360, width: 260, height: 24, type: 'FLOATING' },
      { x: 3120, y: 460, width: 220, height: 24, type: 'FLOATING' },
      { x: 3450, y: 380, width: 300, height: 24, type: 'FLOATING' },
    ];

    // Seal Gates at positions x = 1000, 2250, 3600
    const gatePositions = [1050, 2280, 3700];
    eng.sealGates = gatePositions.slice(0, totalGates).map((gx, idx) => ({
      id: `gate-${idx}`,
      x: gx,
      y: 360,
      width: 44,
      height: 200,
      unlocked: false,
      question: shuffled[idx % shuffled.length] || qList[0]
    }));

    // Pre-populate high-ground Turrets
    eng.enemies = [
      {
        id: 'turret-1',
        type: 'TURRET',
        x: 600,
        y: 310,
        width: 36,
        height: 38,
        vx: 0,
        vy: 0,
        hp: difficulty === 'easy' ? 40 : difficulty === 'medium' ? 60 : 80,
        maxHp: difficulty === 'easy' ? 40 : difficulty === 'medium' ? 60 : 80,
        shootCooldown: 90,
        onGround: true,
        facing: -1
      },
      {
        id: 'turret-2',
        type: 'TURRET',
        x: 1750,
        y: 300,
        width: 36,
        height: 38,
        vx: 0,
        vy: 0,
        hp: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 70 : 100,
        maxHp: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 70 : 100,
        shootCooldown: 80,
        onGround: true,
        facing: -1
      },
      {
        id: 'turret-3',
        type: 'TURRET',
        x: 2900,
        y: 320,
        width: 36,
        height: 38,
        vx: 0,
        vy: 0,
        hp: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 80 : 120,
        maxHp: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 80 : 120,
        shootCooldown: 70,
        onGround: true,
        facing: -1
      },
      // Boss at end of stage
      {
        id: 'boss-main',
        type: 'BOSS',
        x: 3950,
        y: 430,
        width: 90,
        height: 130,
        vx: 0,
        vy: 0,
        hp: difficulty === 'easy' ? 180 : difficulty === 'medium' ? 260 : 360,
        maxHp: difficulty === 'easy' ? 180 : difficulty === 'medium' ? 260 : 360,
        shootCooldown: 60,
        onGround: true,
        facing: -1
      }
    ];

    eng.bullets = [];
    eng.itemDrops = [];
    eng.supplyPods = [];
    eng.particles = [];
    eng.floatingTexts = [];

    setPlayerHp(100);
    setPlayerMana(100);
    setPlayerWeapon('NORMAL');
    setShieldActive(false);
    setGameState('PLAYING');
    setActiveQuizGate(null);
  }, [subjectId, difficulty]);

  useEffect(() => {
    initWorld();
  }, [initWorld]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not process game controls if paused or quiz modal is open
      if (engineRef.current.isPaused) return;

      keys.current[e.code] = true;
      keys.current[e.key.toLowerCase()] = true;

      // Quick key for shield
      if ((e.code === 'KeyK' || e.key.toLowerCase() === 'k') && !e.repeat) {
        triggerShield();
      }

      // Quick shoot trigger
      if ((e.code === 'KeyJ' || e.key.toLowerCase() === 'j') && !e.repeat) {
        triggerShoot();
      }

      // Pause toggle
      if (e.code === 'KeyP' || e.key.toLowerCase() === 'p') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Trigger Mana Shield Skill (Phần 3)
  const triggerShield = () => {
    const eng = engineRef.current;
    if (eng.isPaused || gameState !== 'PLAYING') return;

    if (eng.player.mana >= 30 && eng.player.shieldTimer <= 0) {
      eng.player.mana -= 30;
      eng.player.shieldTimer = 360; // 6 seconds at 60 FPS
      sound.playShield();
      addFloatingText(eng.player.x, eng.player.y - 30, 'KHIÊN HỘ THỂ BẢO VỆ!', '#38bdf8');
      setPlayerMana(Math.max(0, Math.floor(eng.player.mana)));
      setShieldActive(true);
    }
  };

  // Trigger Shoot (Phần 3)
  const triggerShoot = () => {
    const eng = engineRef.current;
    if (eng.isPaused || gameState !== 'PLAYING') return;
    if (eng.player.shootCooldown > 0) return;

    const p = eng.player;
    const currentH = p.isCrouching ? p.crouchHeight : p.height;
    const bulletOriginY = p.y - currentH * 0.55;
    const bulletOriginX = p.facing > 0 ? p.x + p.width * 0.6 : p.x - p.width * 0.6;

    const speed = 14;

    if (p.weapon === 'NORMAL') {
      let vx = p.facing * speed;
      let vy = 0;
      if (p.isAimingUp) {
        vx = p.facing * speed * 0.7;
        vy = -speed * 0.7;
      }
      eng.bullets.push({
        x: bulletOriginX,
        y: bulletOriginY,
        vx,
        vy,
        radius: 4,
        isPlayer: true,
        type: 'NORMAL',
        damage: 15
      });
      p.shootCooldown = 9;
      sound.playShoot('NORMAL');
    } else if (p.weapon === 'SPREAD') {
      // 3 Spread shots
      const angles = p.isAimingUp 
        ? [-0.3, -0.6, -0.9] 
        : [-0.22, 0, 0.22];
      
      angles.forEach(ang => {
        const rad = p.facing > 0 ? ang : Math.PI - ang;
        eng.bullets.push({
          x: bulletOriginX,
          y: bulletOriginY,
          vx: Math.cos(rad) * speed,
          vy: Math.sin(rad) * speed,
          radius: 5,
          isPlayer: true,
          type: 'SPREAD',
          damage: 14
        });
      });
      p.shootCooldown = 13;
      sound.playShoot('SPREAD');
    } else if (p.weapon === 'LASER') {
      // High-damage piercing laser
      let vx = p.facing * (speed * 1.5);
      let vy = 0;
      if (p.isAimingUp) {
        vx = p.facing * (speed * 1.5) * 0.7;
        vy = -(speed * 1.5) * 0.7;
      }
      eng.bullets.push({
        x: bulletOriginX,
        y: bulletOriginY,
        vx,
        vy,
        radius: 6,
        isPlayer: true,
        type: 'LASER',
        damage: 35,
        piercing: true
      });
      p.shootCooldown = 16;
      sound.playShoot('LASER');
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    engineRef.current.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.2
    });
  };

  const addExplosion = (x: number, y: number, color: string = '#f59e0b', count: number = 18) => {
    sound.playExplosion();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      engineRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 25 + 15
      });
    }
  };

  const togglePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      engineRef.current.isPaused = true;
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      engineRef.current.isPaused = false;
    }
  };

  // Called when player touches a Seal Gate (Phần 4)
  const triggerQuizGate = (gate: SealGate, gateIdx: number) => {
    engineRef.current.isPaused = true;
    keys.current = {};
    sound.playSealTrigger();
    setActiveQuizGate({
      gateIndex: gateIdx,
      question: gate.question
    });
  };

  // Called when player answers correctly in the QuizGateModal
  const handleAnswerCorrect = (firstTry: boolean) => {
    const eng = engineRef.current;
    keys.current = {};
    if (activeQuizGate) {
      const g = eng.sealGates[activeQuizGate.gateIndex];
      if (g) {
        g.unlocked = true;
        addExplosion(g.x + g.width / 2, g.y + g.height / 2, '#38bdf8', 35);
        addFloatingText(g.x, g.y + 40, '+1000 ĐIỂM GIẢI PHONG ẤN!', '#fbbf24');
        eng.score += 1000;
        eng.gateBreachedCount += 1;
        if (firstTry) {
          eng.firstTryCount += 1;
          eng.score += 500;
          addFloatingText(g.x, g.y + 10, 'THƯỞNG ĐÚNG LẦN 1: +500', '#34d399');
        }
      }
    }
    setActiveQuizGate(null);
    eng.isPaused = false;
  };

  // MAIN GAME LOOP (Animation Frame)
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      const eng = engineRef.current;
      const canvas = canvasRef.current;

      if (!eng.lastFrameTime) eng.lastFrameTime = timestamp;
      const dt = Math.min((timestamp - eng.lastFrameTime) / 1000, 0.1);
      eng.lastFrameTime = timestamp;

      if (canvas && !eng.isPaused && gameState === 'PLAYING') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          updateGame(dt);
          renderGame(ctx, canvas);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // UPDATE GAME PHYSICS & LOGIC
  const updateGame = (dt: number) => {
    const eng = engineRef.current;
    eng.timeElapsed += dt;

    // Periodic HUD state sync (every ~0.2s)
    if (Math.floor(eng.timeElapsed * 5) % 3 === 0) {
      setPlayerHp(Math.max(0, Math.floor(eng.player.hp)));
      setPlayerMana(Math.max(0, Math.min(100, Math.floor(eng.player.mana))));
      setPlayerWeapon(eng.player.weapon);
      setShieldActive(eng.player.shieldTimer > 0);
      setStats({
        score: eng.score,
        enemiesKilled: eng.enemiesKilled,
        questionsAnswered: eng.gateBreachedCount,
        firstTryCorrect: eng.firstTryCount,
        timeElapsed: Math.floor(eng.timeElapsed)
      });
    }

    // Day - Night Cycle (Phần 6: 35s per phase: 35s Sáng xanh → 35s Hoàng hôn đỏ cam → 35s Đêm tối tĩnh mịch)
    const cyclePeriod = 105;
    const cycleTime = eng.timeElapsed % cyclePeriod;
    let phase: DayNightPhase = 'DAY';
    if (cycleTime >= 35 && cycleTime < 70) {
      phase = 'SUNSET';
    } else if (cycleTime >= 70) {
      phase = 'NIGHT';
    }
    if (phase !== dayNightPhase) {
      setDayNightPhase(phase);
    }

    // Regenerate Mana gradually
    if (eng.player.mana < 100) {
      eng.player.mana = Math.min(100, eng.player.mana + dt * 4);
    }

    // Shield Timer countdown
    if (eng.player.shieldTimer > 0) {
      eng.player.shieldTimer -= 1;
    }
    if (eng.player.invulnerableTimer > 0) {
      eng.player.invulnerableTimer -= 1;
    }
    if (eng.player.shootCooldown > 0) {
      eng.player.shootCooldown -= 1;
    }

    // --- PLAYER CONTROLS (Phần 3) ---
    const p = eng.player;
    const k = keys.current;

    // Left / Right
    const moveLeft = k['KeyA'] || k['ArrowLeft'] || k['a'];
    const moveRight = k['KeyD'] || k['ArrowRight'] || k['d'];
    const moveDown = k['KeyS'] || k['ArrowDown'] || k['s'];
    const moveUp = k['KeyW'] || k['ArrowUp'] || k['w'];
    const jumpKey = moveUp || k['Space'];

    p.isCrouching = !!moveDown && p.isGrounded;
    p.isAimingUp = !!moveUp && !p.isCrouching;

    const moveSpeed = p.isCrouching ? 0 : 5.8;

    if (moveLeft && !moveRight) {
      p.vx = -moveSpeed;
      p.facing = -1;
      p.walkFrame += 0.25;
    } else if (moveRight && !moveLeft) {
      p.vx = moveSpeed;
      p.facing = 1;
      p.walkFrame += 0.25;
    } else {
      p.vx = 0;
    }

    // Jump
    if (jumpKey && p.isGrounded && !p.isCrouching) {
      p.vy = -14.5;
      p.isGrounded = false;
      sound.playJump();
    }

    // Continuous shoot if J is held down
    if (k['KeyJ'] || k['j']) {
      triggerShoot();
    }

    // Gravity
    p.vy += 0.72; // gravity constant
    if (p.vy > 16) p.vy = 16; // terminal fall velocity

    // Update Player Position
    p.x += p.vx;
    p.y += p.vy;

    // Boundary constraints
    if (p.x < 30) p.x = 30;
    if (p.x > eng.worldWidth - 50) p.x = eng.worldWidth - 50;

    // Platform Collisions (Standing on tops of platforms)
    const currentH = p.isCrouching ? p.crouchHeight : p.height;
    p.isGrounded = false;

    for (const plat of eng.platforms) {
      // Check landing on top of platform
      if (
        p.x + p.width * 0.4 > plat.x &&
        p.x - p.width * 0.4 < plat.x + plat.width &&
        p.y >= plat.y &&
        p.y - p.vy <= plat.y + 12
      ) {
        p.y = plat.y;
        p.vy = 0;
        p.isGrounded = true;
        break;
      }
    }

    // Fall into bottom pit check
    if (p.y > 680) {
      p.hp -= 25;
      p.y = 420;
      p.x = Math.max(100, p.x - 150);
      p.vy = 0;
      sound.playPlayerHit();
      addFloatingText(p.x, p.y - 20, '-25 HP RƠI VỰC', '#ef4444');
      if (p.hp <= 0) {
        handleGameOver();
      }
    }

    // Update Camera smoothly tracking player (centering player horizontally)
    const targetCamX = p.x - 380;
    eng.cameraX += (targetCamX - eng.cameraX) * 0.1;
    if (eng.cameraX < 0) eng.cameraX = 0;
    if (eng.cameraX > eng.worldWidth - 960) eng.cameraX = eng.worldWidth - 960;

    // --- CHECK SEAL GATES (Phần 4) ---
    eng.sealGates.forEach((gate, gIdx) => {
      if (!gate.unlocked) {
        // Prevent player from passing through gate
        if (p.x + p.width * 0.5 >= gate.x && p.x - p.width * 0.5 <= gate.x + gate.width) {
          if (p.y >= gate.y && p.y - currentH <= gate.y + gate.height) {
            // Push player back
            p.x = gate.x - p.width * 0.5 - 2;
            p.vx = 0;
            triggerQuizGate(gate, gIdx);
          }
        }
      }
    });

    // Victory check: All gates breached & reached extraction landing zone (Phần 6)
    const allGatesCleared = eng.sealGates.every(g => g.unlocked);
    if (allGatesCleared && p.x >= eng.worldWidth - 140) {
      handleVictory();
      return;
    }

    // --- SPAWN FLYING SUPPLY PODS (Phần 5) ---
    if (eng.timeElapsed >= eng.nextPodTime) {
      eng.supplyPods.push({
        id: 'pod-' + Math.random(),
        x: eng.cameraX + 980,
        y: 120 + Math.random() * 80,
        vx: -2.8,
        width: 48,
        height: 28,
        hp: 1
      });
      eng.nextPodTime = eng.timeElapsed + 14 + Math.random() * 8;
    }

    // Update Supply Pods
    for (let i = eng.supplyPods.length - 1; i >= 0; i--) {
      const pod = eng.supplyPods[i];
      pod.x += pod.vx;
      if (pod.x < eng.cameraX - 100) {
        eng.supplyPods.splice(i, 1);
      }
    }

    // --- SPAWN PATROL TROOPERS (Phần 6) ---
    if (eng.timeElapsed >= eng.nextPatrolTime && eng.enemies.length < 9) {
      const spawnX = Math.min(eng.worldWidth - 80, eng.cameraX + 960 + Math.random() * 80);
      eng.enemies.push({
        id: 'patrol-' + Math.random(),
        type: 'TROOPER',
        x: spawnX,
        y: 500,
        width: 28,
        height: 52,
        vx: -(2.2 + (difficulty === 'hard' ? 0.8 : 0)),
        vy: 0,
        hp: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40,
        maxHp: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40,
        shootCooldown: 40 + Math.floor(Math.random() * 40),
        onGround: false,
        facing: -1
      });
      eng.nextPatrolTime = eng.timeElapsed + (difficulty === 'hard' ? 3 : 5);
    }

    // --- UPDATE ENEMIES ---
    for (let i = eng.enemies.length - 1; i >= 0; i--) {
      const em = eng.enemies[i];

      if (em.type === 'TROOPER') {
        em.vy += 0.7;
        em.x += em.vx;
        em.y += em.vy;

        // Ground collision for trooper
        for (const plat of eng.platforms) {
          if (
            em.x + em.width * 0.4 > plat.x &&
            em.x - em.width * 0.4 < plat.x + plat.width &&
            em.y >= plat.y &&
            em.y - em.vy <= plat.y + 12
          ) {
            em.y = plat.y;
            em.vy = 0;
            break;
          }
        }

        // Trooper AI: face player and fire red bullets
        em.facing = p.x < em.x ? -1 : 1;
        em.shootCooldown--;
        if (em.shootCooldown <= 0 && Math.abs(em.x - p.x) < 550) {
          const bSpeed = difficulty === 'hard' ? 7.5 : 5.5;
          eng.bullets.push({
            x: em.x + em.facing * 18,
            y: em.y - 28, // height at chest level so crouched player can duck under!
            vx: em.facing * bSpeed,
            vy: 0,
            radius: 4,
            isPlayer: false,
            type: 'NORMAL',
            damage: difficulty === 'hard' ? 18 : 12
          });
          em.shootCooldown = difficulty === 'hard' ? 70 : 100;
        }

        // Cleanup out of bounds
        if (em.x < eng.cameraX - 250 || em.y > 700) {
          eng.enemies.splice(i, 1);
          continue;
        }
      } else if (em.type === 'TURRET') {
        em.shootCooldown--;
        if (em.shootCooldown <= 0 && Math.abs(em.x - p.x) < 650) {
          const angle = Math.atan2(p.y - 30 - em.y, p.x - em.x);
          const bSpeed = difficulty === 'hard' ? 6.5 : 4.8;
          eng.bullets.push({
            x: em.x,
            y: em.y,
            vx: Math.cos(angle) * bSpeed,
            vy: Math.sin(angle) * bSpeed,
            radius: 5,
            isPlayer: false,
            type: 'NORMAL',
            damage: difficulty === 'hard' ? 20 : 15
          });
          em.shootCooldown = difficulty === 'hard' ? 65 : 95;
        }
      } else if (em.type === 'BOSS') {
        em.shootCooldown--;
        if (em.shootCooldown <= 0 && Math.abs(em.x - p.x) < 700) {
          // Boss triple spread blast
          const baseAngle = Math.atan2(p.y - 30 - (em.y - 60), p.x - em.x);
          [-0.2, 0, 0.2].forEach(spread => {
            eng.bullets.push({
              x: em.x - 30,
              y: em.y - 60,
              vx: Math.cos(baseAngle + spread) * 6,
              vy: Math.sin(baseAngle + spread) * 6,
              radius: 6,
              isPlayer: false,
              type: 'NORMAL',
              damage: 18
            });
          });
          em.shootCooldown = 65;
        }
      }
    }

    // --- UPDATE BULLETS ---
    for (let i = eng.bullets.length - 1; i >= 0; i--) {
      const b = eng.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // Check bullet vs Player
      if (!b.isPlayer) {
        const pCurrentH = p.isCrouching ? p.crouchHeight : p.height;
        // Hitbox: if player is crouching, upper bullets miss!
        if (
          b.x >= p.x - p.width * 0.45 &&
          b.x <= p.x + p.width * 0.45 &&
          b.y >= p.y - pCurrentH &&
          b.y <= p.y
        ) {
          // If shield is active, absorb damage completely!
          if (p.shieldTimer > 0) {
            addExplosion(b.x, b.y, '#38bdf8', 6);
            addFloatingText(p.x, p.y - 40, 'KHIÊN CHẶN ĐẠN!', '#38bdf8');
          } else if (p.invulnerableTimer <= 0) {
            p.hp -= b.damage;
            p.invulnerableTimer = 35; // short flash immunity
            sound.playPlayerHit();
            addFloatingText(p.x, p.y - 30, `-${b.damage} HP`, '#ef4444');
            if (p.hp <= 0) {
              handleGameOver();
            }
          }
          eng.bullets.splice(i, 1);
          continue;
        }
      }

      // Check Player bullets vs Supply Pods (Phần 5)
      if (b.isPlayer) {
        for (let j = eng.supplyPods.length - 1; j >= 0; j--) {
          const pod = eng.supplyPods[j];
          if (
            b.x >= pod.x - pod.width / 2 &&
            b.x <= pod.x + pod.width / 2 &&
            b.y >= pod.y - pod.height / 2 &&
            b.y <= pod.y + pod.height / 2
          ) {
            addExplosion(pod.x, pod.y, '#f59e0b', 20);
            sound.playExplosion();
            // Drop item!
            const itemTypes: ('MUSHROOM' | 'SPREAD' | 'LASER')[] = ['MUSHROOM', 'SPREAD', 'LASER'];
            const chosenItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            eng.itemDrops.push({
              id: 'item-' + Math.random(),
              x: pod.x,
              y: pod.y,
              vx: 0,
              vy: 1.5,
              type: chosenItem,
              onGround: false
            });
            eng.supplyPods.splice(j, 1);
            if (!b.piercing) {
              eng.bullets.splice(i, 1);
              break;
            }
          }
        }
      }

      // Check Player bullets vs Enemies
      if (b.isPlayer) {
        for (let j = eng.enemies.length - 1; j >= 0; j--) {
          const em = eng.enemies[j];
          const emH = em.height;
          const emW = em.width;

          if (
            b.x >= em.x - emW / 2 &&
            b.x <= em.x + emW / 2 &&
            b.y >= em.y - emH &&
            b.y <= em.y
          ) {
            em.hp -= b.damage;
            addExplosion(b.x, b.y, '#f97316', 5);

            if (em.hp <= 0) {
              addExplosion(em.x, em.y - emH / 2, '#ef4444', 25);
              eng.score += em.type === 'BOSS' ? 2500 : em.type === 'TURRET' ? 250 : 100;
              eng.enemiesKilled += 1;
              addFloatingText(em.x, em.y - emH, `+${em.type === 'BOSS' ? 2500 : 150} ĐIỂM`, '#fbbf24');

              // If Boss is killed, victory!
              if (em.type === 'BOSS') {
                handleVictory();
              }
              eng.enemies.splice(j, 1);
            }

            if (!b.piercing) {
              eng.bullets.splice(i, 1);
              break;
            }
          }
        }
      }

      // Bullet out of screen bounds
      if (
        b.x < eng.cameraX - 100 ||
        b.x > eng.cameraX + 1100 ||
        b.y < -50 ||
        b.y > 750
      ) {
        eng.bullets.splice(i, 1);
      }
    }

    // --- UPDATE ITEM DROPS (Phần 5) ---
    for (let i = eng.itemDrops.length - 1; i >= 0; i--) {
      const item = eng.itemDrops[i];
      if (!item.onGround) {
        item.vy += 0.2;
        if (item.vy > 3.5) item.vy = 3.5;
        item.y += item.vy;

        // Platform collision
        for (const plat of eng.platforms) {
          if (
            item.x > plat.x &&
            item.x < plat.x + plat.width &&
            item.y >= plat.y &&
            item.y - item.vy <= plat.y + 10
          ) {
            item.y = plat.y;
            item.onGround = true;
            break;
          }
        }
      }

      // Check collection by player
      if (Math.abs(item.x - p.x) < 32 && Math.abs(item.y - (p.y - 25)) < 40) {
        sound.playPowerup();
        if (item.type === 'MUSHROOM') {
          p.hp = 100;
          p.mana = 100;
          addFloatingText(p.x, p.y - 40, '🍄 NẤM THẦN: 100% HP & MANA!', '#10b981');
        } else if (item.type === 'SPREAD') {
          p.weapon = 'SPREAD';
          addFloatingText(p.x, p.y - 40, '🔴 SÚNG S: ĐẠN CHÙM 3 TIA!', '#f97316');
        } else if (item.type === 'LASER') {
          p.weapon = 'LASER';
          addFloatingText(p.x, p.y - 40, '⚡ SÚNG L: TIA LASER XUYÊN THẤU!', '#06b6d4');
        }
        setPlayerWeapon(p.weapon);
        eng.itemDrops.splice(i, 1);
      }
    }

    // --- UPDATE PARTICLES ---
    for (let i = eng.particles.length - 1; i >= 0; i--) {
      const part = eng.particles[i];
      part.x += part.vx;
      part.y += part.vy;
      part.vy += 0.1;
      part.life += 1;
      part.alpha = 1 - part.life / part.maxLife;
      if (part.life >= part.maxLife) {
        eng.particles.splice(i, 1);
      }
    }

    // --- UPDATE FLOATING TEXT ---
    for (let i = eng.floatingTexts.length - 1; i >= 0; i--) {
      const ft = eng.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        eng.floatingTexts.splice(i, 1);
      }
    }
  };

  const handleGameOver = () => {
    const eng = engineRef.current;
    eng.isPaused = true;
    sound.playGameOver();
    setStats({
      score: eng.score,
      enemiesKilled: eng.enemiesKilled,
      questionsAnswered: eng.gateBreachedCount,
      firstTryCorrect: eng.firstTryCount,
      timeElapsed: Math.floor(eng.timeElapsed)
    });
    setGameState('GAMEOVER');
  };

  const handleVictory = () => {
    const eng = engineRef.current;
    eng.isPaused = true;
    sound.playVictory();
    setStats({
      score: eng.score,
      enemiesKilled: eng.enemiesKilled,
      questionsAnswered: eng.gateBreachedCount,
      firstTryCorrect: eng.firstTryCount,
      timeElapsed: Math.floor(eng.timeElapsed)
    });
    setGameState('VICTORY');
  };

  // RENDER CANVAS (Graphics, Day/Night, Characters, HUD, Light Aura)
  const renderGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const eng = engineRef.current;
    const p = eng.player;
    const camX = eng.cameraX;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. DYNAMIC SKY GRADIENT WITH SMOOTH INTERPOLATION (Phần 6: 35s per phase)
    const cyclePeriod = 105;
    const cycleTime = eng.timeElapsed % cyclePeriod;

    let topColor: string;
    let midColor: string;
    let bottomColor: string;

    if (cycleTime < 25) {
      // Pure Day (Sáng xanh)
      topColor = interpolateColor(SKY_PALETTES.DAY.top, SKY_PALETTES.DAY.top, 0);
      midColor = interpolateColor(SKY_PALETTES.DAY.mid, SKY_PALETTES.DAY.mid, 0);
      bottomColor = interpolateColor(SKY_PALETTES.DAY.bottom, SKY_PALETTES.DAY.bottom, 0);
    } else if (cycleTime < 40) {
      // Smooth Transition: Sáng xanh → Hoàng hôn đỏ cam (25s - 40s)
      const factor = (cycleTime - 25) / 15;
      topColor = interpolateColor(SKY_PALETTES.DAY.top, SKY_PALETTES.SUNSET.top, factor);
      midColor = interpolateColor(SKY_PALETTES.DAY.mid, SKY_PALETTES.SUNSET.mid, factor);
      bottomColor = interpolateColor(SKY_PALETTES.DAY.bottom, SKY_PALETTES.SUNSET.bottom, factor);
    } else if (cycleTime < 60) {
      // Pure Sunset (Hoàng hôn đỏ cam)
      topColor = interpolateColor(SKY_PALETTES.SUNSET.top, SKY_PALETTES.SUNSET.top, 0);
      midColor = interpolateColor(SKY_PALETTES.SUNSET.mid, SKY_PALETTES.SUNSET.mid, 0);
      bottomColor = interpolateColor(SKY_PALETTES.SUNSET.bottom, SKY_PALETTES.SUNSET.bottom, 0);
    } else if (cycleTime < 75) {
      // Smooth Transition: Hoàng hôn đỏ cam → Đêm tối tĩnh mịch (60s - 75s)
      const factor = (cycleTime - 60) / 15;
      topColor = interpolateColor(SKY_PALETTES.SUNSET.top, SKY_PALETTES.NIGHT.top, factor);
      midColor = interpolateColor(SKY_PALETTES.SUNSET.mid, SKY_PALETTES.NIGHT.mid, factor);
      bottomColor = interpolateColor(SKY_PALETTES.SUNSET.bottom, SKY_PALETTES.NIGHT.bottom, factor);
    } else if (cycleTime < 95) {
      // Pure Night (Đêm tối tĩnh mịch)
      topColor = interpolateColor(SKY_PALETTES.NIGHT.top, SKY_PALETTES.NIGHT.top, 0);
      midColor = interpolateColor(SKY_PALETTES.NIGHT.mid, SKY_PALETTES.NIGHT.mid, 0);
      bottomColor = interpolateColor(SKY_PALETTES.NIGHT.bottom, SKY_PALETTES.NIGHT.bottom, 0);
    } else {
      // Smooth Transition: Đêm tối → Rạng đông sáng xanh (95s - 105s)
      const factor = (cycleTime - 95) / 10;
      topColor = interpolateColor(SKY_PALETTES.NIGHT.top, SKY_PALETTES.DAY.top, factor);
      midColor = interpolateColor(SKY_PALETTES.NIGHT.mid, SKY_PALETTES.DAY.mid, factor);
      bottomColor = interpolateColor(SKY_PALETTES.NIGHT.bottom, SKY_PALETTES.DAY.bottom, factor);
    }

    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, topColor);
    skyGrad.addColorStop(0.5, midColor);
    skyGrad.addColorStop(1, bottomColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CELESTIAL BODIES (Sun / Sunset Sun / Moon / Stars)
    if (cycleTime < 35) {
      // Day Sun: Radiant golden sun in the sky
      const sunX = 140 + (cycleTime / 35) * 400;
      const sunY = 70 + (cycleTime / 35) * 60;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 65);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.5, 'rgba(251, 191, 36, 0.5)');
      sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();
    } else if (cycleTime >= 35 && cycleTime < 70) {
      // Sunset Sun: Large crimson-orange sun setting behind distant mountains
      const sunsetProg = (cycleTime - 35) / 35;
      const sunX = 540 + sunsetProg * 250;
      const sunY = 130 + sunsetProg * 170;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 80);
      sunGlow.addColorStop(0, 'rgba(254, 215, 170, 0.95)');
      sunGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.7)');
      sunGlow.addColorStop(1, 'rgba(225, 29, 72, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Night Moon: Crescent glowing moon
      const moonX = 780;
      const moonY = 85;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 60);
      moonGlow.addColorStop(0, 'rgba(241, 245, 249, 0.9)');
      moonGlow.addColorStop(0.4, 'rgba(148, 163, 184, 0.4)');
      moonGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Crescent shape
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.arc(moonX + 8, moonY - 4, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render stars if Night or Sunset (cycleTime > 40)
    if (cycleTime > 40) {
      const starAlpha = cycleTime < 65 ? ((cycleTime - 40) / 25) * 0.9 : 0.9;
      for (let s = 0; s < 55; s++) {
        const starX = ((s * 137 + 50) % canvas.width);
        const starY = ((s * 61 + 20) % 270);
        const twinkle = 0.5 + Math.sin(eng.timeElapsed * 5 + s) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * twinkle})`;
        const size = (s % 4 === 0) ? 2.5 : 1.5;
        ctx.fillRect(starX, starY, size, size);
      }
    }

    // Drifting clouds across the sky
    const cloudOffset = (eng.timeElapsed * 15) % (canvas.width + 300);
    ctx.fillStyle = cycleTime > 70 
      ? 'rgba(30, 41, 59, 0.35)' 
      : cycleTime > 35 
      ? 'rgba(251, 146, 60, 0.35)' 
      : 'rgba(255, 255, 255, 0.45)';
    
    // Draw 3 parallax cloud clusters
    [
      { x: cloudOffset - 150, y: 50, scale: 1 },
      { x: ((cloudOffset + 380) % (canvas.width + 300)) - 100, y: 90, scale: 0.8 },
      { x: ((cloudOffset + 720) % (canvas.width + 300)) - 100, y: 40, scale: 1.2 }
    ].forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 25 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 25 * c.scale, c.y - 10 * c.scale, 28 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 55 * c.scale, c.y, 22 * c.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Parallax Distant Mountains & Clouds
    ctx.fillStyle = cycleTime > 55 ? '#091e36' : cycleTime > 35 ? '#6b21a8' : '#0369a1';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let m = 0; m <= canvas.width; m += 120) {
      const peak = 340 + Math.sin((m + camX * 0.2) * 0.015) * 60;
      ctx.lineTo(m, peak);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    // Save camera offset transformation
    ctx.save();
    ctx.translate(-camX, 0);

    // 2. RENDER PLATFORMS
    eng.platforms.forEach(plat => {
      // Base rock / metal structure
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Top grass / hazard border
      ctx.fillStyle = plat.type === 'GROUND' ? '#15803d' : '#eab308';
      ctx.fillRect(plat.x, plat.y, plat.width, 6);

      // Tech details on platform side
      ctx.fillStyle = '#334155';
      for (let px = plat.x + 20; px < plat.x + plat.width - 20; px += 40) {
        ctx.fillRect(px, plat.y + 12, 16, 4);
      }
    });

    // 3. RENDER SEAL GATES (Phần 4: Holographic barrier)
    eng.sealGates.forEach((gate, idx) => {
      if (!gate.unlocked) {
        // High-tech energy field pillars
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(gate.x - 4, gate.y, 8, gate.height);
        ctx.fillRect(gate.x + gate.width - 4, gate.y, 8, gate.height);

        // Pulsing barrier laser grid
        const pulse = 0.4 + Math.sin(eng.timeElapsed * 8 + idx) * 0.3;
        ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
        ctx.fillRect(gate.x + 4, gate.y, gate.width - 8, gate.height);

        // Center Question Mark Holographic Emblem
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', gate.x + gate.width / 2, gate.y + gate.height / 2 + 8);

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`CỔNG ${idx + 1}`, gate.x + gate.width / 2, gate.y - 12);
      }
    });

    // 4. RENDER SUPPLY PODS (Phần 5: Flying with wings)
    eng.supplyPods.forEach(pod => {
      // Body
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(pod.x - pod.width / 2, pod.y - pod.height / 2, pod.width, pod.height);
      // Wing flaps
      const wingY = Math.sin(eng.timeElapsed * 15) * 8;
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.moveTo(pod.x - pod.width / 2, pod.y);
      ctx.lineTo(pod.x - pod.width / 2 - 14, pod.y + wingY);
      ctx.lineTo(pod.x, pod.y);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pod.x + pod.width / 2, pod.y);
      ctx.lineTo(pod.x + pod.width / 2 + 14, pod.y + wingY);
      ctx.lineTo(pod.x, pod.y);
      ctx.fill();

      // Text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('POD', pod.x, pod.y + 4);
    });

    // 5. RENDER ITEM DROPS (Phần 5)
    eng.itemDrops.forEach(item => {
      // Parachute if falling
      if (!item.onGround) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(item.x, item.y - 20, 14, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(item.x - 14, item.y - 20);
        ctx.lineTo(item.x, item.y - 8);
        ctx.moveTo(item.x + 14, item.y - 20);
        ctx.lineTo(item.x, item.y - 8);
        ctx.stroke();
      }

      // Item icon badge
      const glow = Math.sin(eng.timeElapsed * 10) * 4;
      ctx.save();
      ctx.shadowColor = item.type === 'MUSHROOM' ? '#10b981' : item.type === 'SPREAD' ? '#f97316' : '#06b6d4';
      ctx.shadowBlur = 10 + glow;

      ctx.fillStyle = item.type === 'MUSHROOM' ? '#10b981' : item.type === 'SPREAD' ? '#ea580c' : '#0891b2';
      ctx.beginPath();
      ctx.arc(item.x, item.y - 12, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const label = item.type === 'MUSHROOM' ? '🍄' : item.type === 'SPREAD' ? 'S' : 'L';
      ctx.fillText(label, item.x, item.y - 8);
      ctx.restore();
    });

    // 6. RENDER ENEMIES
    eng.enemies.forEach(em => {
      if (em.type === 'TROOPER') {
        // Red uniform Contra enemy trooper
        ctx.fillStyle = '#b91c1c'; // Red uniform
        ctx.fillRect(em.x - 10, em.y - 44, 20, 28);

        // Head & Helmet
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(em.x - 7, em.y - 52, 14, 10);
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(em.x - 8, em.y - 54, 16, 5);

        // Pants & Boots
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(em.x - 8, em.y - 16, 16, 16);

        // Weapon
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(em.x + (em.facing > 0 ? 4 : -18), em.y - 32, 14, 5);

        // Health bar
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(em.x - 14, em.y - 62, 28, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(em.x - 14, em.y - 62, (em.hp / em.maxHp) * 28, 4);
      } else if (em.type === 'TURRET') {
        // High ground cannon turret
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(em.x, em.y - 14, 18, 0, Math.PI * 2);
        ctx.fill();

        // Cannon barrel aiming at player
        const angle = Math.atan2(p.y - 30 - em.y, p.x - em.x);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(em.x, em.y - 14);
        ctx.lineTo(em.x + Math.cos(angle) * 24, em.y - 14 + Math.sin(angle) * 24);
        ctx.stroke();

        // Health bar
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(em.x - 16, em.y - 38, 32, 4);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(em.x - 16, em.y - 38, (em.hp / em.maxHp) * 32, 4);
      } else if (em.type === 'BOSS') {
        // Alien Mech Boss
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(em.x - 45, em.y - 130, 90, 130);

        // Glowing core
        const corePulse = 0.5 + Math.sin(eng.timeElapsed * 6) * 0.4;
        ctx.fillStyle = `rgba(239, 68, 68, ${corePulse})`;
        ctx.beginPath();
        ctx.arc(em.x, em.y - 70, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS CORE', em.x, em.y - 66);

        // Giant Boss Health Bar
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(em.x - 55, em.y - 145, 110, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(em.x - 55, em.y - 145, (em.hp / em.maxHp) * 110, 8);
      }
    });

    // 7. RENDER BULLETS
    eng.bullets.forEach(b => {
      ctx.save();
      if (b.isPlayer) {
        if (b.type === 'NORMAL') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (b.type === 'SPREAD') {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (b.type === 'LASER') {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      } else {
        // Enemy bullet: glowing red orb
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 8. RENDER CONTRA PLAYER (Commando with red headband)
    const isFlashing = p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0;
    if (!isFlashing) {
      ctx.save();
      ctx.translate(p.x, p.y);

      const f = p.facing;
      const legOffset = Math.sin(p.walkFrame) * 6;

      if (p.isCrouching) {
        // Crouching pose (Height reduced to 34px - ducking under enemy bullets!)
        // Blue pants
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-14 * f, -16, 26, 16);
        // Muscular torso
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-10 * f, -26, 20, 14);
        // Head & Red Headband
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(-6 * f, -34, 12, 10);
        ctx.fillStyle = '#dc2626'; // Red headband
        ctx.fillRect(-8 * f, -33, 16, 4);

        // Gun horizontal near ground
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, -22, 22 * f, 6);
      } else {
        // Standing / Running / Jumping pose
        // Legs & Boots
        ctx.fillStyle = '#1e3a8a'; // Blue camo trousers
        if (p.isGrounded) {
          ctx.fillRect(-10, -24, 8, 24 + legOffset);
          ctx.fillRect(2, -24, 8, 24 - legOffset);
        } else {
          // Jump tuck
          ctx.fillRect(-10, -20, 8, 16);
          ctx.fillRect(2, -20, 8, 16);
        }

        // Muscular Torso & Military Vest
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-10, -46, 20, 24);
        ctx.fillStyle = '#065f46'; // Tactical harness
        ctx.fillRect(-8, -44, 4, 20);
        ctx.fillRect(4, -44, 4, 20);

        // Head & Face
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(-6, -58, 14, 13);

        // Red Headband with flowing ribbon!
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-8, -56, 18, 4);
        // Headband tail fluttering behind
        const tailWiggle = Math.sin(eng.timeElapsed * 18) * 3;
        ctx.beginPath();
        ctx.moveTo(-7 * f, -55);
        ctx.lineTo((-18 * f), -53 + tailWiggle);
        ctx.lineTo((-16 * f), -49 + tailWiggle);
        ctx.closePath();
        ctx.fill();

        // Arms & Weapon
        ctx.fillStyle = '#0f172a';
        if (p.isAimingUp) {
          // Aiming diagonally up (45 degrees)
          ctx.save();
          ctx.translate(2 * f, -38);
          ctx.rotate(f * -Math.PI / 4);
          ctx.fillRect(0, -4, 26, 7);
          ctx.restore();
        } else {
          // Aiming forward straight
          ctx.fillRect(f > 0 ? 0 : -24, -38, 24, 6);
        }
      }

      // Energy Shield Aura (Phần 3)
      if (p.shieldTimer > 0) {
        const shieldPulse = Math.sin(eng.timeElapsed * 12) * 4;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -28, 38 + shieldPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();

        // Rotating energy nodes
        for (let i = 0; i < 3; i++) {
          const rot = eng.timeElapsed * 4 + (i * Math.PI * 2) / 3;
          const nx = Math.cos(rot) * 38;
          const ny = -28 + Math.sin(rot) * 38;
          ctx.fillStyle = '#7dd3fc';
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // 9. RENDER PARTICLES & FLOATING COMBAT TEXT
    eng.particles.forEach(part => {
      ctx.fillStyle = part.color;
      ctx.globalAlpha = Math.max(0, part.alpha);
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    eng.floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    });

    ctx.restore(); // Restore camera translation

    // 10. DYNAMIC NIGHT DARKNESS & PROTECTIVE AURA (Phần 6)
    if (cycleTime >= 65) {
      // Smooth fade-in of night darkness between 65s - 75s, fade-out between 98s - 105s
      const darkness = cycleTime < 75
        ? ((cycleTime - 65) / 10) * 0.82
        : cycleTime > 98
        ? (1 - (cycleTime - 98) / 7) * 0.82
        : 0.84;

      ctx.save();
      const playerScreenX = p.x - camX;
      const playerScreenY = p.y - 25;

      // Outer darkness mask with radial light cutout
      const lightRadius = 180;
      const spotGrad = ctx.createRadialGradient(
        playerScreenX, playerScreenY, 15,
        playerScreenX, playerScreenY, lightRadius
      );
      spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      spotGrad.addColorStop(0.5, `rgba(2, 6, 23, ${darkness * 0.25})`);
      spotGrad.addColorStop(0.85, `rgba(2, 6, 23, ${darkness * 0.8})`);
      spotGrad.addColorStop(1, `rgba(2, 6, 23, ${darkness})`);

      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // QUẦNG SÁNG BẢO VỆ (Protective Glowing Aura around Contra)
      const auraPulse = Math.sin(eng.timeElapsed * 6) * 3;
      const auraGrad = ctx.createRadialGradient(
        playerScreenX, playerScreenY, 20,
        playerScreenX, playerScreenY, 52 + auraPulse
      );
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      auraGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.12)');
      auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 52 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // Shimmering outer boundary ring of protective aura
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + Math.sin(eng.timeElapsed * 8) * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(playerScreenX, playerScreenY, 50 + auraPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tactical Flashlight Beam (illuminates forward direction)
      const beamAngle = p.isAimingUp 
        ? (p.facing > 0 ? -Math.PI / 4 : -3 * Math.PI / 4)
        : (p.facing > 0 ? 0 : Math.PI);

      const coneGrad = ctx.createRadialGradient(
        playerScreenX + Math.cos(beamAngle) * 30, playerScreenY + Math.sin(beamAngle) * 30, 10,
        playerScreenX + Math.cos(beamAngle) * 150, playerScreenY + Math.sin(beamAngle) * 150, 160
      );
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
      coneGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.06)');
      coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(playerScreenX, playerScreenY);
      ctx.arc(playerScreenX, playerScreenY, 260, beamAngle - 0.42, beamAngle + 0.42);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Top HUD Game Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur z-20 px-3 md:px-6 py-2 flex items-center justify-between">
        {/* Left: Player Vital Bars (Phần 3: HP = 100, Mana) */}
        <div className="flex items-center gap-3">
          {/* HP Bar */}
          <div className="space-y-0.5 min-w-[110px] sm:min-w-[140px]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1 font-bold text-red-400">
                <Heart className="w-3 h-3 fill-current text-red-500" />
                <span>HP</span>
              </span>
              <span className="font-bold tabular-nums text-white">{playerHp}/100</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className={`h-full transition-all duration-150 ${
                  playerHp > 50 ? 'bg-emerald-500' : playerHp > 25 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.max(0, playerHp)}%` }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div className="space-y-0.5 min-w-[90px] sm:min-w-[120px]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1 font-bold text-cyan-400">
                <Zap className="w-3 h-3 fill-current text-cyan-400" />
                <span>MANA</span>
              </span>
              <span className="font-bold tabular-nums text-white">{playerMana}/100</span>
            </div>
            <div className="h-2.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100"
                style={{ width: `${Math.max(0, playerMana)}%` }}
              />
            </div>
          </div>

          {/* Weapon Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono">
            <span className="text-neutral-500 font-bold">VŨ KHÍ:</span>
            <span className={`font-bold ${
              playerWeapon === 'SPREAD' ? 'text-orange-400' : playerWeapon === 'LASER' ? 'text-cyan-400' : 'text-amber-400'
            }`}>
              {playerWeapon === 'SPREAD' ? '🔴 SÚNG S (CHÙM)' : playerWeapon === 'LASER' ? '⚡ SÚNG L (LASER)' : 'PLASMA (CƠ BẢN)'}
            </span>
          </div>
        </div>

        {/* Center: Subject & Day/Night Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 text-xs font-semibold">
            <span>{subject.icon}</span>
            <span className="text-neutral-200">{subject.name}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono">
            {dayNightPhase === 'DAY' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">BAN NGÀY</span>
              </>
            ) : dayNightPhase === 'SUNSET' ? (
              <>
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-300">HOÀNG HÔN</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-300">ĐÊM TỐI (ĐÈN PIN)</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Score, Sound & Pause Buttons */}
        <div className="flex items-center gap-2">
          <div className="text-right px-2">
            <div className="text-[10px] text-neutral-400 font-mono">ĐIỂM SỐ</div>
            <div className="text-sm md:text-base font-bold font-mono text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <button
            onClick={handleToggleMute}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition border border-neutral-800 cursor-pointer"
            title="Bật/Tắt âm thanh"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={togglePause}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition border border-neutral-800 cursor-pointer"
            title="Tạm dừng"
          >
            {gameState === 'PAUSED' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onExit}
            className="px-2.5 py-1 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition cursor-pointer"
          >
            Thoát
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <canvas
          ref={canvasRef}
          width={960}
          height={600}
          className="max-w-full max-h-[75vh] md:max-h-[82vh] aspect-[16/10] object-contain shadow-2xl bg-neutral-950 border border-neutral-800"
        />

        {/* Virtual On-Screen Gamepad Controls for Touch / Quick Clicks */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-none md:hidden z-30 px-2">
          {/* Left D-Pad */}
          <div className="flex gap-2 pointer-events-auto">
            <button
              onMouseDown={() => { keys.current['KeyA'] = true; }}
              onMouseUp={() => { keys.current['KeyA'] = false; }}
              onTouchStart={() => { keys.current['KeyA'] = true; }}
              onTouchEnd={() => { keys.current['KeyA'] = false; }}
              className="w-12 h-12 rounded-xl bg-neutral-900/80 border border-neutral-700 text-white flex items-center justify-center active:bg-amber-500 active:text-neutral-950 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col gap-2">
              <button
                onMouseDown={() => { keys.current['KeyW'] = true; }}
                onMouseUp={() => { keys.current['KeyW'] = false; }}
                onTouchStart={() => { keys.current['KeyW'] = true; }}
                onTouchEnd={() => { keys.current['KeyW'] = false; }}
                className="w-12 h-12 rounded-xl bg-neutral-900/80 border border-neutral-700 text-white flex items-center justify-center active:bg-amber-500 active:text-neutral-950 transition"
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <button
                onMouseDown={() => { keys.current['KeyS'] = true; }}
                onMouseUp={() => { keys.current['KeyS'] = false; }}
                onTouchStart={() => { keys.current['KeyS'] = true; }}
                onTouchEnd={() => { keys.current['KeyS'] = false; }}
                className="w-12 h-12 rounded-xl bg-neutral-900/80 border border-neutral-700 text-white flex items-center justify-center active:bg-amber-500 active:text-neutral-950 transition"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
            </div>
            <button
              onMouseDown={() => { keys.current['KeyD'] = true; }}
              onMouseUp={() => { keys.current['KeyD'] = false; }}
              onTouchStart={() => { keys.current['KeyD'] = true; }}
              onTouchEnd={() => { keys.current['KeyD'] = false; }}
              className="w-12 h-12 rounded-xl bg-neutral-900/80 border border-neutral-700 text-white flex items-center justify-center active:bg-amber-500 active:text-neutral-950 transition"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex gap-2 pointer-events-auto">
            {/* Shield Button */}
            <button
              onClick={triggerShield}
              className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center text-xs font-bold border transition ${
                shieldActive
                  ? 'bg-cyan-500 text-neutral-950 border-cyan-300 shadow-lg shadow-cyan-500/30'
                  : 'bg-neutral-900/80 border-cyan-700/60 text-cyan-400 active:bg-cyan-600 active:text-white'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[9px]">KHIÊN (K)</span>
            </button>

            {/* Shoot Button */}
            <button
              onMouseDown={triggerShoot}
              onTouchStart={triggerShoot}
              className="w-15 h-15 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 border border-amber-400 text-white font-black flex flex-col items-center justify-center active:scale-95 shadow-lg shadow-red-500/30 transition"
            >
              <Crosshair className="w-6 h-6" />
              <span className="text-[10px]">BẮN (J)</span>
            </button>
          </div>
        </div>

        {/* Paused Screen Overlay */}
        {gameState === 'PAUSED' && !activeQuizGate && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-40 space-y-4">
            <h2 className="font-arcade text-2xl text-amber-400">TRÒ CHƠI TẠM DỪNG</h2>
            <p className="text-neutral-400 text-xs">Nhấn phím P hoặc bấm nút Tiếp tục để tiếp tục hành trình</p>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition cursor-pointer"
              >
                Tiếp Tục Chơi
              </button>
              <button
                onClick={onExit}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl border border-neutral-700 transition cursor-pointer"
              >
                Thoát Về Menu
              </button>
            </div>
          </div>
        )}
      </main>

      {/* QUIZ GATE MODAL (Phần 4: Chướng ngại vật trắc nghiệm bắt buộc) */}
      {activeQuizGate && (
        <QuizGateModal
          question={activeQuizGate.question}
          gateIndex={activeQuizGate.gateIndex}
          totalGates={engineRef.current.totalGates}
          onAnswerCorrect={handleAnswerCorrect}
        />
      )}

      {/* GAME OVER MODAL (Phần 6: Thất bại) */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          onRestart={initWorld}
          onHome={onExit}
        />
      )}

      {/* VICTORY MODAL (Phần 6: Chiến thắng) */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          stats={stats}
          subject={subject}
          onRestart={initWorld}
          onHome={onExit}
        />
      )}
    </div>
  );
};
