import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, Trophy, RotateCcw, Play, Pause, Zap, Shield, Sparkles, 
  ChevronLeft, ChevronRight, ArrowUp, Compass, Swords, Music, RefreshCw
} from "lucide-react";
import { GameChoice } from "../types";

// Simple synthesizer function using Web Audio API for realistic arcade retro sound effects!
function playSynthSound(type: "laser" | "explosion" | "powerup" | "rotate" | "clear" | "bossHit") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === "laser") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "explosion") {
      // Noise buffer or standard complex square wave
      osc.type = "square";
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(10, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "powerup") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.1);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "rotate") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "clear") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "bossHit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.setValueAtTime(320, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    console.warn("Web Audio Context blocked or unsupported:", err);
  }
}

export default function GameCabin() {
  const [activeGame, setActiveGame] = useState<GameChoice>("shooter");
  const [highScores, setHighScores] = useState({ shooter: 0, tetris: 0 });

  // Load high scores on mount
  useEffect(() => {
    const sShooter = localStorage.getItem("clev_hs_shooter") || "0";
    const sTetris = localStorage.getItem("clev_hs_tetris") || "0";
    setHighScores({
      shooter: parseInt(sShooter, 10),
      tetris: parseInt(sTetris, 10)
    });
  }, []);

  // ----------------------------------------------------
  // COSMIC STRIKE (SPACE SHOOTER) GAME STATE & ENGINE
  // ----------------------------------------------------
  const shooterCanvasRef = useRef<HTMLCanvasElement>(null);
  const [shooterScore, setShooterScore] = useState(0);
  const [shooterLevel, setShooterLevel] = useState(1);
  const [shooterLives, setShooterLives] = useState(3);
  const [isShooterOver, setIsShooterOver] = useState(false);
  const [isShooterActive, setIsShooterActive] = useState(false);
  const [shieldPower, setShieldPower] = useState(100);
  const [isBossFight, setIsBossFight] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [weaponMode, setWeaponMode] = useState<"single" | "double" | "triple">("single");

  // Keyboard state tracker for smooth canvas rendering updates
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (activeGame === "shooter") {
        keysPressed.current[e.key] = true;
        // Prevent default spacebar scrolling
        if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (activeGame === "shooter") {
        keysPressed.current[e.key] = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeGame]);

  // Main shooter engine loop
  useEffect(() => {
    if (activeGame !== "shooter" || !isShooterActive || isShooterOver) return;

    const canvas = shooterCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Entities definitions
    let playerX = canvas.width / 2;
    const playerY = canvas.height - 45;
    const playerSpeed = 5;
    const playerRadius = 15;

    let lasers: { x: number; y: number; vx: number; vy: number; power: number }[] = [];
    let enemyLasers: { x: number; y: number; vy: number }[] = [];
    let enemies: { x: number; y: number; vx: number; vy: number; type: "asteroid" | "scout" | "elite"; hp: number; maxHp: number; points: number }[] = [];
    let powerups: { x: number; y: number; vy: number; type: "shield" | "triple" | "extra_life" }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number }[] = [];
    
    // Starfield definitions for fluid scrolling
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 1
      });
    }

    // Boss fight triggers
    let bossObj: { x: number; y: number; vx: number; size: number; direction: number } | null = null;
    let localBossHp = 100;
    let localIsBossFight = false;

    let framesCount = 0;
    let nextLaserAvailable = 0;
    let localScore = 0;
    let localLevel = 1;
    let localLives = 3;
    let localShield = 100;
    let localWeapon: "single" | "double" | "triple" = "single";

    // Setup helper: Spawn explosion particles
    const spawnExplosion = (x: number, y: number, color: string, count = 12) => {
      playSynthSound("explosion");
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          color,
          life: 0,
          maxLife: Math.random() * 30 + 15
        });
      }
    };

    const triggerBossMode = () => {
      localIsBossFight = true;
      setIsBossFight(true);
      setBossHp(100);
      localBossHp = 100;
      bossObj = {
        x: canvas.width / 2,
        y: -100, // descend
        vx: 2,
        size: 40,
        direction: 1
      };
    };

    const spawnEnemy = () => {
      if (localIsBossFight) return;
      const typeRand = Math.random();
      let type: "asteroid" | "scout" | "elite" = "asteroid";
      let hp = 1;
      let points = 10;
      let vx = 0;
      let vy = Math.random() * 1.5 + 1;

      if (typeRand > 0.85) {
        type = "elite";
        hp = 3;
        points = 50;
        vx = Math.random() > 0.5 ? 1 : -1;
        vy = Math.random() * 1 + 1;
      } else if (typeRand > 0.6) {
        type = "scout";
        hp = 2;
        points = 25;
        vx = Math.random() > 0.5 ? 1.5 : -1.5;
        vy = Math.random() * 1 + 1.5;
      }

      enemies.push({
        x: Math.random() * (canvas.width - 30) + 15,
        y: -20,
        vx,
        vy,
        type,
        hp,
        maxHp: hp,
        points
      });
    };

    const fireLaser = () => {
      if (framesCount < nextLaserAvailable) return;
      nextLaserAvailable = framesCount + 10; // rate of fire
      playSynthSound("laser");

      if (localWeapon === "single") {
        lasers.push({ x: playerX, y: playerY - 15, vx: 0, vy: -7, power: 1 });
      } else if (localWeapon === "double") {
        lasers.push({ x: playerX - 10, y: playerY - 10, vx: 0, vy: -7, power: 1 });
        lasers.push({ x: playerX + 10, y: playerY - 10, vx: 0, vy: -7, power: 1 });
      } else if (localWeapon === "triple") {
        lasers.push({ x: playerX, y: playerY - 15, vx: 0, vy: -7, power: 1.5 });
        lasers.push({ x: playerX - 15, y: playerY - 10, vx: -1.5, vy: -6.5, power: 1 });
        lasers.push({ x: playerX + 15, y: playerY - 10, vx: 1.5, vy: -6.5, power: 1 });
      }
    };

    // Game loop tick
    const tick = () => {
      framesCount++;
      ctx.fillStyle = "#070a13";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw stars (Background)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // 2. Control inputs
      if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"]) {
        playerX = Math.max(playerRadius + 5, playerX - playerSpeed);
      }
      if (keysPressed.current["ArrowRight"] || keysPressed.current["d"]) {
        playerX = Math.min(canvas.width - playerRadius - 5, playerX + playerSpeed);
      }
      if (keysPressed.current[" "] || keysPressed.current["ArrowUp"] || keysPressed.current["w"]) {
        fireLaser();
      }

      // 3. Spawning enemies logic
      if (!localIsBossFight) {
        if (framesCount % Math.max(15, 45 - localLevel * 5) === 0) {
          spawnEnemy();
        }
        // Trigger boss fight at points threshold (e.g. level * 500 points)
        if (localScore > localLevel * 500) {
          triggerBossMode();
        }
      }

      // 4. Update lasers
      lasers.forEach(laser => {
        laser.x += laser.vx;
        laser.y += laser.vy;
      });
      lasers = lasers.filter(l => l.y > -10 && l.x > -10 && l.x < canvas.width + 10);

      // 5. Update enemy lasers
      enemyLasers.forEach(el => {
        el.y += el.vy;
      });
      enemyLasers = enemyLasers.filter(el => el.y < canvas.height + 10);

      // 6. Update powerups
      powerups.forEach(pw => {
        pw.y += pw.vy;
      });
      powerups = powerups.filter(pw => pw.y < canvas.height + 20);

      // 7. Update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
      });
      particles = particles.filter(p => p.life < p.maxLife);

      // 8. Draw Player
      // Jet flames animation
      ctx.fillStyle = framesCount % 4 < 2 ? "#f97316" : "#ef4444";
      ctx.beginPath();
      ctx.moveTo(playerX - 6, playerY + 12);
      ctx.lineTo(playerX, playerY + 22 + (framesCount % 6));
      ctx.lineTo(playerX + 6, playerY + 12);
      ctx.closePath();
      ctx.fill();

      // Main ship
      ctx.fillStyle = "#14b8a6"; // Neon teal
      ctx.beginPath();
      ctx.moveTo(playerX, playerY - 18);
      ctx.lineTo(playerX - 16, playerY + 12);
      ctx.lineTo(playerX - 6, playerY + 6);
      ctx.lineTo(playerX + 6, playerY + 6);
      ctx.lineTo(playerX + 16, playerY + 12);
      ctx.closePath();
      ctx.fill();

      // Cockpit dome
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(playerX, playerY - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Shield active ring
      if (localShield > 0) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 + (localShield / 100) * 0.35})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(playerX, playerY, playerRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 9. Process Boss Fight Actions
      if (localIsBossFight && bossObj) {
        // Boss descends slowly then sweeps side-to-side
        if (bossObj.y < 80) {
          bossObj.y += 1.5;
        } else {
          bossObj.x += bossObj.vx;
          if (bossObj.x < bossObj.size || bossObj.x > canvas.width - bossObj.size) {
            bossObj.vx = -bossObj.vx;
          }
          
          // Fire spiral or spread patterns
          if (framesCount % Math.max(20, 45 - localLevel * 5) === 0) {
            const spreadCount = 3 + localLevel;
            for (let i = 0; i < spreadCount; i++) {
              const speed = 4;
              const angle = (Math.PI / (spreadCount - 1)) * i;
              // Downward cone shooting
              enemyLasers.push({
                x: bossObj.x,
                y: bossObj.y + 20,
                vy: Math.sin(angle) * speed + 1
              });
            }
          }
        }

        // Draw massive Boss Battleship
        ctx.fillStyle = "#ec4899"; // Cyber pink
        ctx.beginPath();
        ctx.moveTo(bossObj.x, bossObj.y - 30);
        ctx.lineTo(bossObj.x - 55, bossObj.y - 10);
        ctx.lineTo(bossObj.x - 30, bossObj.y + 25);
        ctx.lineTo(bossObj.x - 10, bossObj.y + 35);
        ctx.lineTo(bossObj.x + 10, bossObj.y + 35);
        ctx.lineTo(bossObj.x + 30, bossObj.y + 25);
        ctx.lineTo(bossObj.x + 55, bossObj.y - 10);
        ctx.closePath();
        ctx.fill();

        // Glowing core dome
        ctx.fillStyle = framesCount % 10 < 5 ? "#ef4444" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(bossObj.x, bossObj.y + 5, 12, 0, Math.PI * 2);
        ctx.fill();

        // Boss life percentage bar
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(bossObj.x - 40, bossObj.y - 45, 80, 5);
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(bossObj.x - 40, bossObj.y - 45, 80 * (localBossHp / 100), 5);
      }

      // 10. Draw standard Enemies
      enemies.forEach(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Wrap scout horizontal boundary
        if (enemy.type === "scout" || enemy.type === "elite") {
          if (enemy.x < 15 || enemy.x > canvas.width - 15) {
            enemy.vx = -enemy.vx;
          }
          // Scouts/Elites shoot lasers occasionally
          if (framesCount % 120 === 0 && Math.random() > 0.4) {
            enemyLasers.push({
              x: enemy.x,
              y: enemy.y + 10,
              vy: 4.5
            });
          }
        }

        // Draw enemies differently
        if (enemy.type === "asteroid") {
          ctx.fillStyle = "#4b5563"; // gray
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, 14, 0, Math.PI * 2);
          ctx.fill();
          // Asteroid detail
          ctx.fillStyle = "#374151";
          ctx.beginPath();
          ctx.arc(enemy.x - 4, enemy.y - 3, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (enemy.type === "scout") {
          ctx.fillStyle = "#eab308"; // yellow glider
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + 14);
          ctx.lineTo(enemy.x - 12, enemy.y - 10);
          ctx.lineTo(enemy.x + 12, enemy.y - 10);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = "#f97316"; // orange elite
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y - 10);
          ctx.lineTo(enemy.x - 16, enemy.y + 6);
          ctx.lineTo(enemy.x - 6, enemy.y + 12);
          ctx.lineTo(enemy.x + 6, enemy.y + 12);
          ctx.lineTo(enemy.x + 16, enemy.y + 6);
          ctx.closePath();
          ctx.fill();
        }
      });

      // 11. Draw elements
      // lasers
      ctx.fillStyle = "#22d3ee";
      lasers.forEach(l => {
        ctx.fillRect(l.x - 2, l.y - 10, 4, 12);
      });

      // enemy lasers
      ctx.fillStyle = "#f43f5e";
      enemyLasers.forEach(el => {
        ctx.fillRect(el.x - 1.5, el.y, 3, 10);
      });

      // particles
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // powerups
      powerups.forEach(pw => {
        ctx.save();
        if (pw.type === "shield") {
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(pw.x, pw.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
        } else if (pw.type === "triple") {
          ctx.fillStyle = "#a855f7";
          ctx.beginPath();
          ctx.moveTo(pw.x, pw.y - 8);
          ctx.lineTo(pw.x - 8, pw.y + 8);
          ctx.lineTo(pw.x + 8, pw.y + 8);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = "#ef4444";
          // Heart-ish shape
          ctx.beginPath();
          ctx.arc(pw.x - 3, pw.y - 2, 4, 0, Math.PI * 2);
          ctx.arc(pw.x + 3, pw.y - 2, 4, 0, Math.PI * 2);
          ctx.moveTo(pw.x - 7, pw.y - 1);
          ctx.lineTo(pw.x, pw.y + 7);
          ctx.lineTo(pw.x + 7, pw.y - 1);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      // 12. Check laser colliders with enemies
      lasers.forEach((l, lIdx) => {
        // Boss fight hits
        if (localIsBossFight && bossObj && Math.abs(l.x - bossObj.x) < 50 && Math.abs(l.y - bossObj.y) < 35) {
          lasers.splice(lIdx, 1);
          localBossHp = Math.max(0, localBossHp - 1.5 * l.power);
          setBossHp(Math.round(localBossHp));
          playSynthSound("bossHit");
          
          // Flash hit effect
          particles.push({
            x: l.x,
            y: l.y - 10,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * -3 - 1,
            size: 2.5,
            color: "#ffffff",
            life: 0,
            maxLife: 15
          });

          if (localBossHp <= 0) {
            // Defeated Boss! Next level!
            spawnExplosion(bossObj.x, bossObj.y, "#ec4899", 50);
            localScore += 500;
            setShooterScore(localScore);
            
            localLevel++;
            setShooterLevel(localLevel);
            localIsBossFight = false;
            setIsBossFight(false);
            bossObj = null;
            localWeapon = localLevel === 2 ? "double" : "triple";
            setWeaponMode(localWeapon);
            playSynthSound("clear");
          }
        }

        // Standard enemies hits
        enemies.forEach((enemy, eIdx) => {
          const dist = Math.hypot(l.x - enemy.x, l.y - enemy.y);
          if (dist < playerRadius + 2) {
            // hit!
            lasers.splice(lIdx, 1);
            enemy.hp -= l.power;
            
            if (enemy.hp <= 0) {
              spawnExplosion(enemy.x, enemy.y, enemy.type === "asteroid" ? "#6b7280" : enemy.type === "scout" ? "#eab308" : "#f97316", 12);
              localScore += enemy.points;
              setShooterScore(localScore);
              
              // Keep high score live
              if (localScore > highScores.shooter) {
                setHighScores(prev => ({ ...prev, shooter: localScore }));
                localStorage.setItem("clev_hs_shooter", localScore.toString());
              }

              // Powerup drop randomly
              if (Math.random() > 0.88) {
                const types: ("shield" | "triple" | "extra_life")[] = ["shield", "triple", "extra_life"];
                powerups.push({
                  x: enemy.x,
                  y: enemy.y,
                  vy: 2.2,
                  type: types[Math.floor(Math.random() * types.length)]
                });
              }

              enemies.splice(eIdx, 1);
            }
          }
        });
      });

      // 13. Collisions: Enemies vs Player
      enemies.forEach((enemy, eIdx) => {
        const distToPlayer = Math.hypot(enemy.x - playerX, enemy.y - playerY);
        if (distToPlayer < playerRadius + 12) {
          // Crash!
          enemies.splice(eIdx, 1);
          spawnExplosion(enemy.x, enemy.y, "#ef4444", 25);
          
          if (localShield > 0) {
            localShield = Math.max(0, localShield - 40);
            setShieldPower(localShield);
          } else {
            localLives--;
            setShooterLives(localLives);
            localShield = 100;
            setShieldPower(100);
            if (localLives <= 0) {
              setIsShooterOver(true);
            }
          }
        }
      });

      // 14. Collisions: Enemy lasers vs Player
      enemyLasers.forEach((el, elIdx) => {
        const distToPlayer = Math.hypot(el.x - playerX, el.y - playerY);
        if (distToPlayer < playerRadius + 6) {
          enemyLasers.splice(elIdx, 1);
          spawnExplosion(playerX, playerY - 10, "#38bdf8", 6);
          
          if (localShield > 0) {
            localShield = Math.max(0, localShield - 15);
            setShieldPower(localShield);
          } else {
            localLives--;
            setShooterLives(localLives);
            localShield = 100;
            setShieldPower(100);
            if (localLives <= 0) {
              setIsShooterOver(true);
            }
          }
        }
      });

      // 15. Collisions: Powerups vs Player
      powerups.forEach((pw, pwIdx) => {
        const dist = Math.hypot(pw.x - playerX, pw.y - playerY);
        if (dist < playerRadius + 10) {
          powerups.splice(pwIdx, 1);
          playSynthSound("powerup");
          
          if (pw.type === "shield") {
            localShield = Math.min(100, localShield + 35);
            setShieldPower(localShield);
          } else if (pw.type === "triple") {
            localWeapon = "triple";
            setWeaponMode("triple");
          } else {
            localLives++;
            setShooterLives(localLives);
          }
        }
      });

      // Out of bounds screen sweep
      enemies = enemies.filter(enemy => enemy.y < canvas.height + 20);

      // Loop request
      if (!isShooterOver) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeGame, isShooterActive, isShooterOver]);

  // Touch triggers for Space shooter on cellphones
  const triggerMobileMove = (dir: "left" | "right") => {
    if (dir === "left") {
      keysPressed.current["ArrowLeft"] = true;
      setTimeout(() => { keysPressed.current["ArrowLeft"] = false; }, 200);
    } else {
      keysPressed.current["ArrowRight"] = true;
      setTimeout(() => { keysPressed.current["ArrowRight"] = false; }, 200);
    }
  };

  const startShooter = () => {
    setShooterScore(0);
    setShooterLevel(1);
    setShooterLives(3);
    setShieldPower(100);
    setIsBossFight(false);
    setIsShooterOver(false);
    setIsShooterActive(true);
    setWeaponMode("single");
  };

  // ----------------------------------------------------
  // NEON TETRIS CASCADE GAME STATE & ENGINE
  // ----------------------------------------------------
  const [tetrisScore, setTetrisScore] = useState(0);
  const [tetrisLines, setTetrisLines] = useState(0);
  const [tetrisLevel, setTetrisLevel] = useState(1);
  const [isTetrisOver, setIsTetrisOver] = useState(false);
  const [isTetrisActive, setIsTetrisActive] = useState(false);
  
  // Matrix grid states
  const COLS = 10;
  const ROWS = 20;
  const [tetrisGrid, setTetrisGrid] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(""))
  );

  // Pieces definitions
  const TETROMINOES = {
    I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: "#22d3ee" }, // cyan
    O: { shape: [[1, 1], [1, 1]], color: "#facc15" }, // yellow
    T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: "#c084fc" }, // purple
    S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: "#4ade80" }, // green
    Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: "#f87171" }, // red
    J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: "#60a5fa" }, // blue
    L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: "#f97316" }  // orange
  };

  type BlockType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
  const blockTypes: BlockType[] = ["I", "O", "T", "S", "Z", "J", "L"];

  const currentPiece = useRef<{ shape: number[][]; color: string; x: number; y: number; type: BlockType }>({
    shape: [], color: "", x: 0, y: 0, type: "O"
  });
  const nextPiece = useRef<{ shape: number[][]; color: string; type: BlockType }>({
    shape: [], color: "", type: "I"
  });
  const holdPiece = useRef<{ shape: number[][]; color: string; type: BlockType } | null>(null);
  const canHold = useRef<boolean>(true);

  const initRandomPiece = (type?: BlockType): { shape: number[][]; color: string; type: BlockType } => {
    const t = type || blockTypes[Math.floor(Math.random() * blockTypes.length)];
    const data = TETROMINOES[t];
    return {
      shape: JSON.parse(JSON.stringify(data.shape)),
      color: data.color,
      type: t
    };
  };

  const spawnTetrisPiece = () => {
    const nextObj = nextPiece.current.color ? nextPiece.current : initRandomPiece();
    currentPiece.current = {
      shape: nextObj.shape,
      color: nextObj.color,
      type: nextObj.type,
      x: Math.floor((COLS - nextObj.shape[0].length) / 2),
      y: nextObj.type === "I" ? -1 : 0
    };

    nextPiece.current = initRandomPiece();
    canHold.current = true;

    // Check collision on spawn
    if (checkCollision(currentPiece.current.shape, currentPiece.current.x, currentPiece.current.y)) {
      setIsTetrisOver(true);
      setIsTetrisActive(false);
    }
  };

  const checkCollision = (shape: number[][], x: number, y: number, grid = tetrisGrid): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const nextX = x + c;
          const nextY = y + r;

          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
            return true;
          }
          if (nextY >= 0 && grid[nextY][nextX] !== "") {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotatePiece = () => {
    if (!isTetrisActive || isTetrisOver) return;
    const shape = currentPiece.current.shape;
    const N = shape.length;
    const rotated = Array(N).fill(0).map(() => Array(N).fill(0));
    
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        rotated[c][N - 1 - r] = shape[r][c];
      }
    }

    // Attempt rotation with wall kick offsets
    const originalX = currentPiece.current.x;
    const originalY = currentPiece.current.y;
    
    let rotatedSuccess = false;
    const offsets = [0, -1, 1, -2, 2];
    
    for (const offset of offsets) {
      if (!checkCollision(rotated, originalX + offset, originalY)) {
        currentPiece.current.shape = rotated;
        currentPiece.current.x += offset;
        rotatedSuccess = true;
        playSynthSound("rotate");
        break;
      }
    }

    if (rotatedSuccess) {
      drawUpdatedGrid();
    }
  };

  const moveLeft = () => {
    if (!isTetrisActive || isTetrisOver) return;
    if (!checkCollision(currentPiece.current.shape, currentPiece.current.x - 1, currentPiece.current.y)) {
      currentPiece.current.x -= 1;
      drawUpdatedGrid();
    }
  };

  const moveRight = () => {
    if (!isTetrisActive || isTetrisOver) return;
    if (!checkCollision(currentPiece.current.shape, currentPiece.current.x + 1, currentPiece.current.y)) {
      currentPiece.current.x += 1;
      drawUpdatedGrid();
    }
  };

  const moveDown = () => {
    if (!isTetrisActive || isTetrisOver) return false;
    if (!checkCollision(currentPiece.current.shape, currentPiece.current.x, currentPiece.current.y + 1)) {
      currentPiece.current.y += 1;
      drawUpdatedGrid();
      return true;
    } else {
      lockPiece();
      return false;
    }
  };

  const hardDrop = () => {
    if (!isTetrisActive || isTetrisOver) return;
    let drops = 0;
    while (!checkCollision(currentPiece.current.shape, currentPiece.current.x, currentPiece.current.y + 1)) {
      currentPiece.current.y += 1;
      drops++;
    }
    lockPiece();
    setTetrisScore(prev => prev + drops * 2);
  };

  const triggerHold = () => {
    if (!isTetrisActive || isTetrisOver || !canHold.current) return;
    
    playSynthSound("powerup");
    const currentType = currentPiece.current.type;
    
    if (holdPiece.current === null) {
      holdPiece.current = {
        shape: TETROMINOES[currentType].shape,
        color: TETROMINOES[currentType].color,
        type: currentType
      };
      spawnTetrisPiece();
    } else {
      const holdType = holdPiece.current.type;
      holdPiece.current = {
        shape: TETROMINOES[currentType].shape,
        color: TETROMINOES[currentType].color,
        type: currentType
      };
      
      currentPiece.current = {
        shape: TETROMINOES[holdType].shape,
        color: TETROMINOES[holdType].color,
        type: holdType,
        x: Math.floor((COLS - TETROMINOES[holdType].shape[0].length) / 2),
        y: holdType === "I" ? -1 : 0
      };
    }
    canHold.current = false;
    drawUpdatedGrid();
  };

  const lockPiece = () => {
    setTetrisGrid(prevGrid => {
      const copy = prevGrid.map(row => [...row]);
      const { shape, color, x, y } = currentPiece.current;

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const gridY = y + r;
            const gridX = x + c;
            if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
              copy[gridY][gridX] = color;
            }
          }
        }
      }

      // 14. Check line clears
      let linesClearedThisTurn = 0;
      const clearedGrid = copy.filter(row => {
        const isRowFull = row.every(cell => cell !== "");
        if (isRowFull) {
          linesClearedThisTurn++;
        }
        return !isRowFull;
      });

      while (clearedGrid.length < ROWS) {
        clearedGrid.unshift(Array(COLS).fill(""));
      }

      if (linesClearedThisTurn > 0) {
        playSynthSound("clear");
        
        // Multiplier Tetris scoring rules
        const pointsMapping = [0, 100, 300, 500, 800];
        const earned = pointsMapping[Math.min(linesClearedThisTurn, 4)] * tetrisLevel;
        
        setTetrisScore(score => {
          const nextScore = score + earned;
          if (nextScore > highScores.tetris) {
            setHighScores(prev => ({ ...prev, tetris: nextScore }));
            localStorage.setItem("clev_hs_tetris", nextScore.toString());
          }
          return nextScore;
        });

        setTetrisLines(lines => {
          const nextLines = lines + linesClearedThisTurn;
          const nextLvl = Math.floor(nextLines / 10) + 1;
          setTetrisLevel(nextLvl);
          return nextLines;
        });
      } else {
        playSynthSound("rotate");
      }

      return clearedGrid;
    });

    spawnTetrisPiece();
  };

  // Ghost block preview coordinates
  const getGhostY = (): number => {
    if (!isTetrisActive || isTetrisOver) return 0;
    const { shape, x, y } = currentPiece.current;
    if (!shape || shape.length === 0) return y;
    let ghostY = y;
    let limit = 0;
    while (!checkCollision(shape, x, ghostY + 1) && limit < ROWS + 2) {
      ghostY++;
      limit++;
    }
    return ghostY;
  };

  const drawUpdatedGrid = () => {
    // Force React re-render of active game matrix
    setTetrisGrid(prev => [...prev]);
  };

  // Keyboard hooks for Tetris
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (activeGame !== "tetris" || !isTetrisActive || isTetrisOver) return;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
        case "d":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          moveDown();
          break;
        case "ArrowUp":
        case "w":
          e.preventDefault();
          rotatePiece();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "c":
        case "Shift":
          e.preventDefault();
          triggerHold();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGame, isTetrisActive, isTetrisOver]);

  // Game ticks for Tetris gravity drop
  useEffect(() => {
    if (activeGame !== "tetris" || !isTetrisActive || isTetrisOver) return;
    
    // Decrement drop speed as level climbs
    const intervalTime = Math.max(100, 800 - (tetrisLevel - 1) * 100);
    const gravityId = setInterval(() => {
      moveDown();
    }, intervalTime);

    return () => clearInterval(gravityId);
  }, [activeGame, isTetrisActive, isTetrisOver, tetrisLevel]);

  const startTetris = () => {
    setTetrisGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill("")));
    setTetrisScore(0);
    setTetrisLines(0);
    setTetrisLevel(1);
    setIsTetrisOver(false);
    
    // Spawn initial pieces
    nextPiece.current = initRandomPiece();
    holdPiece.current = null;
    spawnTetrisPiece();
    
    setIsTetrisActive(true);
  };

  return (
    <section 
      id="games" 
      className="py-20 bg-[#070a13] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.04),transparent)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Game Cabin</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            CLEV Playable Web Arcade
          </h2>
          <p className="mt-4 text-gray-400 font-sans text-sm sm:text-base">
            We develop fully optimized high-performance web games with beautiful graphics, Web Audio API synthesizers, and fluid responsive controls. Play our arcade hit Cosmic Strike below!
          </p>
        </div>

        {/* Game cabin content frame */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0b0f19]/80 border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative">
          
          {/* Controls & game selectors */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-display uppercase tracking-widest text-cyan-400">ARCADE ENGINE</h3>
              
              {/* Launcher Info */}
              <div className="flex flex-col space-y-2.5">
                <div className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/15 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div className="flex items-center space-x-3">
                    <Swords className="w-5 h-5 text-cyan-400" />
                    <div>
                      <strong className="block text-white text-xs">COSMIC STRIKE</strong>
                      <span className="text-[10px] text-cyan-400 font-mono">HTML5 Canvas Shooter</span>
                    </div>
                  </div>
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Hardware Limitations Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-900/45 border border-cyan-500/10 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
                🌐 WEB BROWSER NOTE
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                As this game runs directly inside a sandboxed web browser environment, certain custom 3D hardware graphics overlays, volumetric shaders, and native design assets couldn't be added. We've optimized the remaining elements to deliver a smooth, responsive, 60fps retro experience.
              </p>
            </div>

            {/* Scorecard Widget */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-gray-800 space-y-3.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest flex items-center">
                <Trophy className="w-3.5 h-3.5 text-yellow-500 mr-1.5 animate-bounce" />
                HALL OF CHAMPIONS
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-400">
                  <span>Cosmic Strike High Score:</span>
                  <strong className="text-white">{highScores.shooter} PTS</strong>
                </div>
              </div>
            </div>

            {/* Quality assurance certification */}
            <div className="text-[10px] font-mono text-gray-500 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Full 60fps Web Audio Integrated System</span>
            </div>
          </div>

          {/* Core Simulator viewport screen */}
          <div className="lg:col-span-8 flex flex-col bg-slate-950/80 border border-gray-800 rounded-xl p-4 min-h-[420px] justify-center items-center relative overflow-hidden">
            
            {/* ----------------------------------------------------
                COSMIC STRIKE SPACE SHOOTER VIEWPORT
                ---------------------------------------------------- */}
            {activeGame === "shooter" && (
              <div className="w-full flex flex-col items-center space-y-4">
                
                {/* HUD Panel */}
                <div className="w-full flex justify-between items-center text-xs font-mono text-gray-300 border-b border-gray-800 pb-2">
                  <div className="flex space-x-3">
                    <span>Level: <strong className="text-cyan-400">{shooterLevel}</strong></span>
                    <span>Score: <strong className="text-emerald-400">{shooterScore}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Shield:</span>
                    <div className="w-16 bg-slate-800 rounded overflow-hidden h-2 border border-gray-700">
                      <div className="bg-cyan-400 h-full transition-all" style={{ width: `${shieldPower}%` }} />
                    </div>
                    <span className="text-[10px]">x{shooterLives} ❤️</span>
                  </div>
                </div>

                {/* Canvas Game Stage */}
                <div className="relative border border-gray-800 bg-[#070a13] rounded-lg overflow-hidden w-full max-w-[360px] h-[340px] flex items-center justify-center">
                  <canvas
                    ref={shooterCanvasRef}
                    width={360}
                    height={340}
                    className="w-full h-full block"
                  />

                  {/* Menu overlays */}
                  {!isShooterActive && !isShooterOver && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-4 text-center p-6">
                      <Swords className="w-12 h-12 text-cyan-400 animate-pulse" />
                      <div>
                        <h4 className="font-display font-bold text-white text-base">COSMIC STRIKE</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-[260px] leading-relaxed">
                          Dodge asteroids, destroy alien spaceships, gather power-ups, and survive complex boss spiral waves.
                        </p>
                      </div>
                      <button
                        onClick={startShooter}
                        className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      >
                        Bypass Shields & Fly
                      </button>
                      <span className="text-[10px] text-gray-500 font-mono">Controls: Arrow keys to Move | Space to Fire</span>
                    </div>
                  )}

                  {isShooterOver && (
                    <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-4 text-center p-6">
                      <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                      <div>
                        <h4 className="font-display font-bold text-red-500 text-base">CORE ENGINE COMPROMISED</h4>
                        <p className="text-xs text-gray-300 mt-1">Spaceship destroyed in battle!</p>
                        <p className="text-xs font-mono text-cyan-400 mt-1">Final Score: {shooterScore} PTS</p>
                      </div>
                      <button
                        onClick={startShooter}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all"
                      >
                        Launch Reserve Fighter
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile D-Pad Control Buttons (extremely user-friendly!) */}
                {isShooterActive && !isShooterOver && (
                  <div className="flex space-x-3 w-full max-w-[280px]">
                    <button 
                      onClick={() => triggerMobileMove("left")}
                      className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 active:bg-cyan-950 text-white rounded-lg font-mono font-bold text-xs flex justify-center items-center space-x-1 border border-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4 text-cyan-400" />
                      <span>LEFT</span>
                    </button>
                    <button 
                      onClick={() => triggerMobileMove("right")}
                      className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 active:bg-cyan-950 text-white rounded-lg font-mono font-bold text-xs flex justify-center items-center space-x-1 border border-gray-700"
                    >
                      <span>RIGHT</span>
                      <ChevronRight className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>
                )}
              </div>
            )}



          </div>
        </div>

      </div>
    </section>
  );
}
