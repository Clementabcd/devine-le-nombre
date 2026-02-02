import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, BarChart3, RefreshCw, Zap, Flame, Snowflake, TrendingUp } from 'lucide-react';

export default function GuessTheNumber() {
  const levels = {
    easy: { min: 1, max: 50, name: 'Facile', color: '#10b981', icon: '🌱' },
    medium: { min: 1, max: 100, name: 'Moyen', color: '#f59e0b', icon: '⚡' },
    hard: { min: 1, max: 200, name: 'Difficile', color: '#ef4444', icon: '🔥' },
    expert: { min: 1, max: 500, name: 'Expert', color: '#8b5cf6', icon: '💎' }
  };

  const [currentLevel, setCurrentLevel] = useState('easy');
  const [targetNumber, setTargetNumber] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '', emoji: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [bestScores, setBestScores] = useState({});
  const [firstGuess, setFirstGuess] = useState(true);
  const [particles, setParticles] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('bestScores');
    if (saved) setBestScores(JSON.parse(saved));
    initGame();
  }, []);

  useEffect(() => {
    if (currentLevel) initGame();
  }, [currentLevel]);

  const initGame = () => {
    const level = levels[currentLevel];
    const range = level.max - level.min;
    const mid = Math.floor((level.max + level.min) / 2);
    const excludeRange = Math.min(5, Math.floor(range * 0.05)); // 5% du range ou 5 max
    
    let num;
    do {
      num = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
    } while (Math.abs(num - mid) < excludeRange && range > 20);

    setTargetNumber(num);
    setAttempts(0);
    setGuessHistory([]);
    setInputValue('');
    setFeedback({ message: '', type: '', emoji: '' });
    setShowWin(false);
    setFirstGuess(true);
    setParticles([]);
  };

  const makeGuess = () => {
    const guess = parseInt(inputValue);
    const level = levels[currentLevel];

    if (isNaN(guess) || guess < level.min || guess > level.max) {
      setFeedback({ 
        message: `Entre un nombre entre ${level.min} et ${level.max}`, 
        type: 'cold', 
        emoji: '🤔' 
      });
      return;
    }

    if (firstGuess && guess === targetNumber) {
      setFeedback({ 
        message: 'Pas de chance au premier coup ! 😉', 
        type: 'cold', 
        emoji: '🎲' 
      });
      setFirstGuess(false);
      return;
    }

    setFirstGuess(false);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuessHistory([...guessHistory, guess]);

    if (guess === targetNumber) {
      handleWin(newAttempts);
    } else {
      handleHint(guess);
    }

    setInputValue('');
  };

  const handleWin = (finalAttempts) => {
    setShowWin(true);
    createFireworks();
    
    const currentBest = bestScores[currentLevel];
    if (!currentBest || finalAttempts < currentBest) {
      const newBestScores = { ...bestScores, [currentLevel]: finalAttempts };
      setBestScores(newBestScores);
      localStorage.setItem('bestScores', JSON.stringify(newBestScores));
    }

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  };

  const handleHint = (guess) => {
    const diff = Math.abs(guess - targetNumber);
    const level = levels[currentLevel];
    const range = level.max - level.min;

    let message, type, emoji;

    if (diff <= range * 0.02) {
      message = guess < targetNumber ? 'BRÛLANT ! Un peu plus haut !' : 'BRÛLANT ! Un peu plus bas !';
      type = 'hot';
      emoji = '🔥';
      createHeatParticles();
    } else if (diff <= range * 0.05) {
      message = guess < targetNumber ? 'Chaud ! Monte encore !' : 'Chaud ! Descends encore !';
      type = 'warm';
      emoji = '♨️';
    } else if (diff <= range * 0.15) {
      message = guess < targetNumber ? 'Tiède... Plus haut' : 'Tiède... Plus bas';
      type = 'warm';
      emoji = '😊';
    } else {
      message = guess < targetNumber ? 'Froid ! Beaucoup plus haut' : 'Froid ! Beaucoup plus bas';
      type = 'cold';
      emoji = '❄️';
      createColdParticles();
    }

    setFeedback({ message, type, emoji });
  };

  const createFireworks = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'];
    const newParticles = [];

    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60;
      newParticles.push({
        id: Math.random(),
        x: 50,
        y: 50,
        tx: 50 + Math.cos(angle) * (30 + Math.random() * 20),
        ty: 50 + Math.sin(angle) * (30 + Math.random() * 20),
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        duration: 1 + Math.random() * 0.5
      });
    }

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  const createHeatParticles = () => {
    const colors = ['#ff6b6b', '#ff8787', '#ffa07a'];
    const newParticles = [];

    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: 100,
        tx: Math.random() * 100,
        ty: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
        duration: 1
      });
    }

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);
  };

  const createColdParticles = () => {
    const colors = ['#a8dadc', '#457b9d', '#e0f2fe'];
    const newParticles = [];

    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: -10,
        tx: Math.random() * 100,
        ty: 110,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
        duration: 1.5
      });
    }

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1700);
  };

  const levelColor = levels[currentLevel].color;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        
        @keyframes particleMove {
          from {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.6); }
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Particles Container */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9999 }}>
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: p.color,
              animation: `particleMove ${p.duration}s ease-out forwards`,
              animationDelay: `${p.delay}s`,
              '--tx': `${p.tx - p.x}vw`,
              '--ty': `${p.ty - p.y}vh`
            }}
          />
        ))}
      </div>

      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite'
      }} />

      {/* Main Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '50px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'visible',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        {/* Header Icons */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setShowStats(true)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: `linear-gradient(135deg, ${levelColor}20, ${levelColor}10)`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: levelColor
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <BarChart3 size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: `linear-gradient(135deg, ${levelColor}20, ${levelColor}10)`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              color: levelColor
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          animation: 'slideUp 0.6s ease'
        }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '8px',
            animation: 'float 3s ease-in-out infinite'
          }}>
            {levels[currentLevel].icon}
          </div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            background: `linear-gradient(135deg, ${levelColor}, ${levelColor}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-1px'
          }}>
            Devine le Nombre
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            fontWeight: '600',
            marginTop: '8px'
          }}>
            {levels[currentLevel].name} • {levels[currentLevel].min}-{levels[currentLevel].max}
          </p>
        </div>

        {/* Game Area */}
        {!showWin ? (
          <div style={{ animation: 'scaleIn 0.5s ease' }}>
            {/* Input */}
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && makeGuess()}
                placeholder="?"
                min={levels[currentLevel].min}
                max={levels[currentLevel].max}
                style={{
                  width: '100%',
                  padding: '28px',
                  fontSize: '56px',
                  fontWeight: '800',
                  border: `3px solid ${levelColor}40`,
                  borderRadius: '20px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                  color: levelColor,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: `0 4px 20px ${levelColor}20`
                }}
                onFocus={e => {
                  e.target.style.borderColor = levelColor;
                  e.target.style.boxShadow = `0 8px 30px ${levelColor}30`;
                  e.target.style.transform = 'scale(1.02)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = `${levelColor}40`;
                  e.target.style.boxShadow = `0 4px 20px ${levelColor}20`;
                  e.target.style.transform = 'scale(1)';
                }}
              />
            </div>

            {/* Guess Button */}
            <button
              onClick={makeGuess}
              style={{
                width: '100%',
                padding: '22px',
                fontSize: '22px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${levelColor}, ${levelColor}dd)`,
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '30px',
                boxShadow: `0 8px 25px ${levelColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 12px 35px ${levelColor}50`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${levelColor}40`;
              }}
            >
              <Zap size={24} />
              Deviner
            </button>

            {/* Feedback */}
            {feedback.message && (
              <div style={{
                padding: '28px',
                borderRadius: '20px',
                textAlign: 'center',
                background: feedback.type === 'hot' 
                  ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
                  : feedback.type === 'warm'
                  ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                  : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                border: `2px solid ${
                  feedback.type === 'hot' ? '#ef4444' 
                  : feedback.type === 'warm' ? '#f59e0b' 
                  : '#3b82f6'
                }30`,
                animation: feedback.type === 'hot' 
                  ? 'shake 0.5s ease' 
                  : feedback.type === 'warm'
                  ? 'pulse 0.5s ease'
                  : 'slideUp 0.4s ease'
              }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '12px',
                  animation: 'scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }}>
                  {feedback.emoji}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: feedback.type === 'hot' 
                    ? '#991b1b' 
                    : feedback.type === 'warm' 
                    ? '#92400e' 
                    : '#1e40af'
                }}>
                  {feedback.message}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Win Screen
          <div style={{
            textAlign: 'center',
            animation: 'scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
              animation: 'scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#10b981',
              margin: '0 0 16px 0',
              animation: 'slideUp 0.6s ease 0.2s backwards'
            }}>
              BRAVO !
            </h2>
            <p style={{
              fontSize: '22px',
              color: '#64748b',
              fontWeight: '600',
              marginBottom: '36px',
              animation: 'slideUp 0.6s ease 0.3s backwards'
            }}>
              Tu as trouvé {targetNumber} en <strong style={{ color: levelColor }}>{attempts}</strong> tentative{attempts > 1 ? 's' : ''} !
            </p>
            <button
              onClick={initGame}
              style={{
                padding: '20px 40px',
                fontSize: '20px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${levelColor}, ${levelColor}dd)`,
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 8px 25px ${levelColor}40`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'slideUp 0.6s ease 0.4s backwards'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = `0 12px 35px ${levelColor}50`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${levelColor}40`;
              }}
            >
              <RefreshCw size={24} />
              Rejouer
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'scaleIn 0.3s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '32px',
              padding: '40px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              animation: 'slideUp 0.3s ease',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#1e293b',
                margin: 0
              }}>
                ⚙️ Niveaux
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              {Object.entries(levels).map(([key, level]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentLevel(key);
                    setShowSettings(false);
                  }}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    border: currentLevel === key ? `3px solid ${level.color}` : '3px solid #e2e8f0',
                    background: currentLevel === key 
                      ? `linear-gradient(135deg, ${level.color}15, ${level.color}08)`
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                    {level.icon}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: level.color,
                    marginBottom: '4px'
                  }}>
                    {level.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '600'
                  }}>
                    {level.min}-{level.max}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div
          onClick={() => setShowStats(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'scaleIn 0.3s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '32px',
              padding: '40px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              animation: 'slideUp 0.3s ease',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#1e293b',
                margin: 0
              }}>
                📊 Statistiques
              </h3>
              <button
                onClick={() => setShowStats(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '24px',
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${levelColor}15, ${levelColor}08)`,
                border: `2px solid ${levelColor}30`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
                  Tentatives
                </div>
                <div style={{ fontSize: '40px', fontWeight: '800', color: levelColor }}>
                  {attempts}
                </div>
              </div>

              <div style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: '2px solid #fbbf2430',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                  Meilleur score
                </div>
                <div style={{ fontSize: '40px', fontWeight: '800', color: '#b45309' }}>
                  {bestScores[currentLevel] || '-'}
                </div>
              </div>
            </div>

            {guessHistory.length > 0 && (
              <div style={{
                padding: '24px',
                borderRadius: '20px',
                background: '#f8fafc',
                border: '2px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '16px'
                }}>
                  📝 Historique
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                  gap: '10px'
                }}>
                  {guessHistory.map((guess, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'white',
                        border: `2px solid ${levelColor}30`,
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: levelColor
                      }}
                    >
                      {guess}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
