import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Reminder } from '../../types';
import { fetchReminders } from '../../services/api';

const CONTAINER_W = 150;
const CONTAINER_H = 130;
const FEET_OFFSET_Y = 108;

interface MascotExpression {
  head: string;
  face: string;
  torso: string;
  zzz?: string;
}

const EXPRESSIONS: Record<string, MascotExpression> = {
  happy:      { head: '{ \\_/ }',    face: '(> \u203F <)',      torso: '/[  O  ]\\' },
  shocked:    { head: '{ \\_/ }',    face: '(\u2070 \u250F\u2510 \u2070)', torso: '/[  !  ]\\' },
  thinking:   { head: '{ \\_/ }',    face: '(\u2022 _ \u2022)',  torso: '/[  ?  ]\\' },
  dizzy:      { head: '{ \\_/ }',    face: '(@ \u203F @)',      torso: '/[  %  ]\\' },
  triumphant: { head: '\\ _   _ /',  face: '\\(^O^)/',          torso: '[  O  ]'   },
  sleeping:   { head: '{ \\_/ }',    face: '(- \u203F -)',      torso: '/[  -  ]\\', zzz: 'z z z' },
};

type ExpressionKey = keyof typeof EXPRESSIONS;

const TIPS = [
  "Tip: When dealing with subsets, combinations, or permutations, think Backtracking!",
  "Trick: Need to find the middle of a linked list? Use the Two-Pointer technique (Fast and Slow pointers).",
  "Joke: Why did the developer go broke? Because they used up all their caches!",
  "Tip: If a problem asks for the \"Kth largest/smallest\" element, a Heap (Priority Queue) is usually your best friend.",
  "Joke: There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
  "Trick: Before jumping into a complex Dynamic Programming table, see if you can solve it with simple Recursion + Memoization first.",
  "Joke: Why do programmers prefer dark mode? Because light attracts bugs.",
  "Tip: Premature optimization is the root of all evil. Get it working first, then make it fast!",
  "Trick: Write down your edge cases (empty arrays, negative numbers, null values) before writing a single line of code.",
  "Joke: \"It works on my machine\" is a valid developer excuse until you hit production.",
  "Tip: If your code has too many nested loops, try using a Hash Map to trade space complexity for a much faster time complexity.",
  "Joke: Remember that a triple-nested loop is just O(N\u00B3) shorthand for \"Please fire me.\"",
  "Trick: If you get stuck on a problem for more than 20 minutes, explain your code out loud to a rubber duck (or to me!).",
  "Tip: Commit early, commit often, and keep your commit messages meaningful. \"Fixing stuff\" doesn't help your future self!",
  "Joke: git commit -m \"added changes\" \u2192 git commit -m \"fixed bugs\" \u2192 git commit -m \"please work\" \u2192 git push --force",
  "Trick: Use .gitignore properly from day one so you don't accidentally push your node_modules or secret API keys to GitHub.",
  "Joke: There are 10 types of people in the world: those who understand binary, and those who don't."
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const BracketBuddy: React.FC = () => {
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);

  // Screen size check (disable completely on mobile/tablet < 768px)
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Mascot movement state
  const [isSummoned, setIsSummoned] = useState<boolean>(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [moveDuration, setMoveDuration] = useState<number>(0.8);

  // Thought/Tip bubble state
  const [tipText, setTipText] = useState<string>('');
  const [summonExpression, setSummonExpression] = useState<ExpressionKey>('happy');
  const [bubbleVisible, setBubbleVisible] = useState<boolean>(false);
  const [opacityFading, setOpacityFading] = useState<boolean>(false);

  // Active reminder hover state
  const [reminderHovered, setReminderHovered] = useState<boolean>(false);
  const [anchorCoords, setAnchorCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const walkEndTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSummonedRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    currentPosRef.current = pos;
  }, [pos]);

  useEffect(() => {
    isSummonedRef.current = isSummoned;
  }, [isSummoned]);

  // Handle window resize for mobile check
  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      if (small) {
        setIsSummoned(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Fetch reminders on mount
  useEffect(() => {
    let mounted = true;
    fetchReminders()
      .then((reminders) => {
        if (!mounted) return;
        const now = Date.now();
        const activeList = reminders.filter((r) => {
          const start = new Date(r.startAt).getTime();
          const end = new Date(r.endAt).getTime();
          return now >= start && now <= end;
        });

        if (activeList.length > 0) {
          activeList.sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());
          setActiveReminder(activeList[0]);
        } else {
          setActiveReminder(null);
        }
      })
      .catch(() => {
        // quiet fallback
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Compute anchor position for active reminder
  const computeAnchorPosition = useCallback(() => {
    if (!activeReminder) return;

    let targetX = window.innerWidth - CONTAINER_W - 24;
    let targetY = window.innerHeight - CONTAINER_H - 24;

    if (activeReminder.targetSection && activeReminder.targetSection !== 'global') {
      const el = document.getElementById(activeReminder.targetSection);
      if (el) {
        const rect = el.getBoundingClientRect();
        targetX = Math.max(16, Math.min(window.innerWidth - CONTAINER_W - 16, rect.right - CONTAINER_W - 24));
        targetY = Math.max(80, Math.min(window.innerHeight - CONTAINER_H - 20, rect.top + 24));
      }
    }

    setAnchorCoords({ x: targetX, y: targetY });
  }, [activeReminder]);

  useEffect(() => {
    if (activeReminder && !isSmallScreen) {
      computeAnchorPosition();
      window.addEventListener('resize', computeAnchorPosition);
      return () => window.removeEventListener('resize', computeAnchorPosition);
    }
  }, [activeReminder, isSmallScreen, computeAnchorPosition]);

  // 3. Arrival Callback (Stops walk, shows speech bubble, arms auto-dismiss)
  const handleArrival = useCallback(() => {
    if (walkEndTimerRef.current) {
      clearTimeout(walkEndTimerRef.current);
      walkEndTimerRef.current = null;
    }

    setIsWalking(false);
    const randomTip = pickRandom(TIPS);
    const expr = pickRandom(Object.keys(EXPRESSIONS) as ExpressionKey[]);
    setTipText(randomTip);
    setSummonExpression(expr);
    setBubbleVisible(true);

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setOpacityFading(true);
      dismissTimerRef.current = setTimeout(() => {
        setIsSummoned(false);
        setBubbleVisible(false);
        setOpacityFading(false);
        setIsWalking(false);
      }, 500);
    }, 5000);
  }, []);

  // 4. Natural Walking Handler
  const walkTo = useCallback((targetX: number, targetY: number) => {
    const maxX = window.innerWidth - CONTAINER_W - 12;
    const maxY = window.innerHeight - CONTAINER_H - 12;
    const clampedX = Math.max(12, Math.min(maxX, targetX));
    const clampedY = Math.max(12, Math.min(maxY, targetY));

    // Get true current pixel position
    let startX = currentPosRef.current.x;
    let startY = currentPosRef.current.y;

    // If mid-walk, read live transform matrix so redirection is seamless
    if (containerRef.current) {
      const style = window.getComputedStyle(containerRef.current);
      if (style.transform && style.transform !== 'none') {
        try {
          const matrix = new DOMMatrixReadOnly(style.transform);
          if (!isNaN(matrix.m41) && !isNaN(matrix.m42)) {
            startX = matrix.m41;
            startY = matrix.m42;
          }
        } catch {
          // Fallback to currentPosRef
        }
      }
    }

    const distance = Math.hypot(clampedX - startX, clampedY - startY);
    // Tiny 4px threshold prevents micro-jitter while ensuring any real click walks
    if (distance < 4) {
      handleArrival();
      return;
    }

    // Natural walk speed based on distance
    const duration = Math.min(2.2, Math.max(0.35, distance / 360));

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (walkEndTimerRef.current) clearTimeout(walkEndTimerRef.current);

    setBubbleVisible(false);
    setOpacityFading(false);
    setIsWalking(true);
    setMoveDuration(duration);
    setPos({ x: clampedX, y: clampedY });
    currentPosRef.current = { x: clampedX, y: clampedY };

    // Guaranteed fallback timer in case transitionend does not fire
    walkEndTimerRef.current = setTimeout(() => {
      handleArrival();
    }, duration * 1000 + 40);
  }, [handleArrival]);

  // 5. Right-Click Context Menu Listener (Desktop Only)
  useEffect(() => {
    if (isSmallScreen) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Never intercept inside inputs/textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      e.preventDefault();

      const maxX = window.innerWidth - CONTAINER_W - 12;
      const maxY = window.innerHeight - CONTAINER_H - 12;
      const targetX = Math.max(12, Math.min(maxX, e.clientX - CONTAINER_W / 2));
      const targetY = Math.max(12, Math.min(maxY, e.clientY - FEET_OFFSET_Y));

      if (!isSummonedRef.current) {
        // First summon: appear right at click location and greet
        currentPosRef.current = { x: targetX, y: targetY };
        setPos({ x: targetX, y: targetY });
        setIsSummoned(true);
        setIsWalking(false);
        handleArrival();
      } else {
        // Already on screen: smoothly walk to the new location!
        walkTo(targetX, targetY);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isSmallScreen, walkTo, handleArrival]);

  // Cleanup timers on full unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (walkEndTimerRef.current) clearTimeout(walkEndTimerRef.current);
    };
  }, []);

  // ==========================================
  // Completely disabled / removed on small screens
  // ==========================================
  if (isSmallScreen) {
    return null;
  }

  // ==========================================
  // STATE 1: Summoned Mascot (Natural Walking + Tip Bubble)
  // ==========================================
  if (isSummoned) {
    const expr = isWalking ? EXPRESSIONS.happy : EXPRESSIONS[summonExpression] || EXPRESSIONS.happy;

    return (
      <div
        id="mascot-summoned"
        ref={containerRef}
        onTransitionEnd={(e) => {
          // Strictly ensure the event comes from the container itself, NOT child scaleX or bubble transforms!
          if (e.target === e.currentTarget && e.propertyName === 'transform') {
            handleArrival();
          }
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${CONTAINER_W}px`,
          height: `${CONTAINER_H}px`,
          zIndex: 99999,
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition: `transform ${moveDuration}s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.5s ease`,
          opacity: opacityFading ? 0 : 1,
          pointerEvents: 'none', // Strictly never blocks clicks to buttons underneath!
        }}
      >
        {/* Speech / Tip Bubble */}
        {bubbleVisible && !isWalking && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '100%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              maxWidth: '240px',
              minWidth: '180px',
              background: '#0d1f16',
              color: '#baffdd',
              border: '1px solid rgba(61, 255, 160, 0.55)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: '1.4',
              textAlign: 'center',
              boxShadow: '0 0 16px rgba(61, 255, 160, 0.25)',
              whiteSpace: 'normal',
              pointerEvents: 'none',
              animation: 'bubble-pop 0.25s ease-out',
            }}
          >
            {tipText}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                border: '6px solid transparent',
                borderTopColor: '#0d1f16',
              }}
            />
          </div>
        )}

        {/* Mascot Rig with Natural Walking Bounce & Footsteps */}
        <div
          style={{
            animation: isWalking
              ? 'walk-bounce 0.32s infinite alternate ease-in-out'
              : 'summon-hop 0.4s ease-out',
          }}
        >
          <svg
            style={{
              filter: isWalking
                ? 'drop-shadow(0 0 10px rgba(60, 255, 150, 0.85))'
                : 'drop-shadow(0 0 7px rgba(60, 255, 150, 0.65))',
            }}
            viewBox="0 0 150 130"
            width="150"
            height="130"
          >
            <text className="ascii-line" x="75" y="26" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              {expr.head}
            </text>
            <text className="ascii-line" x="75" y="50" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              {expr.face}
            </text>
            {Boolean(expr.zzz) && (
              <text className="ascii-line" x="118" y="34" fontSize="12" fontFamily="monospace" fill="#3dffa0" textAnchor="start">
                {expr.zzz}
              </text>
            )}
            <text className="ascii-line" x="75" y="76" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              {expr.torso}
            </text>
            <text
              className="ascii-line leg-left"
              x="58"
              y="104"
              fontSize="19"
              fontFamily="monospace"
              fill="#3dffa0"
              textAnchor="middle"
              style={{
                animation: isWalking ? 'step-a 0.32s infinite alternate ease-in-out' : 'none',
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
            >
              /_/
            </text>
            <text
              className="ascii-line leg-right"
              x="92"
              y="104"
              fontSize="19"
              fontFamily="monospace"
              fill="#3dffa0"
              textAnchor="middle"
              style={{
                animation: isWalking ? 'step-b 0.32s infinite alternate ease-in-out' : 'none',
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
            >
              \_\
            </text>
          </svg>
        </div>

        <style>{`
          @keyframes walk-bounce {
            0%   { transform: translateY(0) rotate(-3deg); }
            100% { transform: translateY(-7px) rotate(3deg); }
          }
          @keyframes step-a {
            0%   { transform: translateY(3px); }
            100% { transform: translateY(-3px); }
          }
          @keyframes step-b {
            0%   { transform: translateY(-3px); }
            100% { transform: translateY(3px); }
          }
          @keyframes summon-hop {
            0%   { transform: translateY(8px) scale(0.95); }
            50%  { transform: translateY(-6px) scale(1.04); }
            100% { transform: translateY(0) scale(1); }
          }
          @keyframes bubble-pop {
            from { opacity: 0; transform: translateX(-50%) scale(0.92); }
            to   { opacity: 1; transform: translateX(-50%) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // STATE 2: Active reminder window is currently open (Desktop only)
  // ==========================================
  if (activeReminder) {
    const expr = EXPRESSIONS.happy;

    return (
      <div
        id="mascot-active-reminder"
        onMouseEnter={() => setReminderHovered(true)}
        onMouseLeave={() => setReminderHovered(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${CONTAINER_W}px`,
          height: `${CONTAINER_H}px`,
          zIndex: 9990,
          transform: `translate3d(${anchorCoords.x}px, ${anchorCoords.y}px, 0)`,
          transition: 'transform 0.4s ease',
          pointerEvents: 'none', // Prevent intercepting clicks
          cursor: 'pointer',
        }}
      >
        {/* Speech Bubble: shows ON HOVER ONLY */}
        {reminderHovered && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '100%',
              transform: 'translateX(-50%)',
              marginBottom: '10px',
              maxWidth: '240px',
              minWidth: '170px',
              background: '#0d1f16',
              color: '#baffdd',
              border: '1px solid rgba(61, 255, 160, 0.55)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: '1.4',
              textAlign: 'center',
              boxShadow: '0 0 16px rgba(61, 255, 160, 0.25)',
              whiteSpace: 'normal',
              pointerEvents: 'none',
              animation: 'bubble-pop 0.2s ease-out',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '3px',
                fontWeight: 700,
              }}
            >
              Reminder
            </div>
            {activeReminder.text}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                border: '6px solid transparent',
                borderTopColor: '#0d1f16',
              }}
            />
          </div>
        )}

        {/* ASCII SVG with soft idle glow breathe only */}
        <div style={{ pointerEvents: 'auto' }}>
          <svg
            style={{
              filter: 'drop-shadow(0 0 6px rgba(60, 255, 150, 0.55))',
              animation: 'glow-breathe 2.6s ease-in-out infinite',
            }}
            viewBox="0 0 150 130"
            width="150"
            height="130"
          >
            <text className="ascii-line" x="75" y="26" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              {expr.head}
            </text>
            <text className="ascii-line" x="75" y="50" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              {expr.face}
            </text>
            <text className="ascii-line" x="75" y="76" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              {expr.torso}
            </text>
            <text className="ascii-line" x="58" y="104" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              /_/
            </text>
            <text className="ascii-line" x="92" y="104" fontSize="19" fontFamily="monospace" fill="#3dffa0" textAnchor="middle">
              \_\
            </text>
          </svg>
        </div>

        <style>{`
          @keyframes glow-breathe {
            0%, 100% { filter: drop-shadow(0 0 4px rgba(60, 255, 150, 0.45)); }
            50%      { filter: drop-shadow(0 0 10px rgba(60, 255, 150, 0.85)); }
          }
          @keyframes bubble-pop {
            from { opacity: 0; transform: translateX(-50%) scale(0.95); }
            to   { opacity: 1; transform: translateX(-50%) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // Default state when NOT summoned & NO active reminder:
  // MUST NOT BE RENDERED ANYWHERE ON SCREEN.
  // ==========================================
  return null;
};
