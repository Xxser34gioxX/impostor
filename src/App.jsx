import React, { useState, useEffect, useMemo } from 'react';
import WORD_BANK from './file/words.json';

const DEFAULT_PLAYERS = 4;
const MIN_PLAYERS = 3;

// WORD_BANK imported from JSON file

function randInt(max) {
  return Math.floor(Math.random() * max);
}

export default function App() {
  const [players, setPlayers] = useState(() =>
    Array.from({ length: DEFAULT_PLAYERS }).map((_, i) => ({
      id: i + 1,
      name: `Jugador ${i + 1}`,
      clicked: false,
      roleRevealed: null, // null | 'impostor' | 'word'
      alive: true,
      points: 0,
      lastGain: 0
    }))
  );

  const [startingPlayer, setStartingPlayer] = useState(null);
  const [showClassForAll, setShowClassForAll] = useState(true);
  const [numImpostors, setNumImpostors] = useState(1);
  const [randomImpostors, setRandomImpostors] = useState(false);
  const [minImpostors, setMinImpostors] = useState(1);
  const [maxImpostors, setMaxImpostors] = useState(2);
  const [selectedWord, setSelectedWord] = useState(null);
  const [impostorIds, setImpostorIds] = useState([]);
  const [remainingImpostors, setRemainingImpostors] = useState(0);
  const [starting, setStarting] = useState(false); // show a short animation when starting
  const [revealImpostors, setRevealImpostors] = useState(false);
  const [revealStarter, setRevealStarter] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentBigCard, setCurrentBigCard] = useState(null); // player id for big view
  const [firstPlayerId, setFirstPlayerId] = useState(null);
  const [resultsShown, setResultsShown] = useState(false);
  const [victoryDialog, setVictoryDialog] = useState(false);
  const [impostorVictoryDialog, setImpostorVictoryDialog] = useState(false);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);
  const [eliminatedImpostors, setEliminatedImpostors] = useState([]);

  const [gameStartedMessage, setGameStartedMessage] = useState(false);
  const [flipped, setFlipped] = useState(false);
  
  // categories available (derived from WORD_BANK)
  const allCategories = useMemo(() => Array.from(new Set(WORD_BANK.map(w => w.category))).sort(), []);
  // counts per category (used in UI)
  const categoryCounts = useMemo(() => {
    const map = {};
    WORD_BANK.forEach(w => { map[w.category] = (map[w.category] || 0) + 1; });
    return map;
  }, []);
  const [selectedCategories, setSelectedCategories] = useState(() => allCategories.slice());

  const offensiveWords = ["Pervertido", "Inutil", "Adicto", "Borracho", "Mamado", "Esther", "Populista", "Comunista", 
    "Demócrata", "Dictador", "El Caudillo", "Franco", "Lesviana", "Maricon", "Transexual", "Travesti", "Pene", "Vagina", 
    "After", "Relacion rota", "PP", "PSOE", "VOX", "Pajearse", "Vaper", "Cigarros", "Porro", "Preservativo", "Puticlub", 
    "Póker", "Ruleta", "Blackjack", "Tragaperras", "Durex", "Pornhub", "Follar"
  ];

  const [lightMode, setLightMode] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set(allCategories));
  function updatePlayer(id, patch) {
    setPlayers(p => p.map(pl => (pl.id === id ? { ...pl, ...patch } : pl)));
  }

  function addPlayer() {
    setPlayers(p => {
      const nextId = p.length ? Math.max(...p.map(x => x.id)) + 1 : 1;
      return [...p, { id: nextId, name: `Jugador ${nextId}`, clicked: false, roleRevealed: null }];
    });
  }

  function removePlayer(id) {
    setPlayers(p => p.filter(x => x.id !== id));
  }
  
  useEffect(() => {
    // adjust max impostors: at most players - 1, at least 1
    const max = Math.max(1, players.length - 1);
    if (numImpostors > max) setNumImpostors(max);
  }, [players, numImpostors]);

  function startGame() {
    if (players.length < MIN_PLAYERS) return alert(`Necesitas al menos ${MIN_PLAYERS} jugadores`);
  // pick random word from selected categories
  const wordPool = WORD_BANK.filter(w => selectedCategories.includes(w.category) && (!lightMode || !offensiveWords.includes(w.word)));
  setGameStartedMessage(true);
  if (wordPool.length === 0) return alert('No hay palabras en las categorías seleccionadas. Selecciona al menos una categoría.');
  const pick = wordPool[randInt(wordPool.length)];
    setSelectedWord(pick);
    // choose impostors
    const ids = players.map(p => p.id);
    let numToChoose = numImpostors;
    if (randomImpostors) {
      numToChoose = randInt(maxImpostors - minImpostors + 1) + minImpostors;
    }
    const chosen = [];
    // shuffle copy
    const idPool = [...ids];
    while (chosen.length < numToChoose) {
      const idx = randInt(idPool.length);
      chosen.push(idPool[idx]);
      idPool.splice(idx, 1);
    }
    setImpostorIds(chosen);
    setRemainingImpostors(numToChoose);
    // reset players clicked and roleRevealed
    setPlayers(p => p.map(pl => ({ ...pl, clicked: false, roleRevealed: null })));
    setEliminatedPlayers([]);
    setEliminatedImpostors([]);
    setVictoryDialog(false);
    setImpostorVictoryDialog(false);
    setStarted(true);
    setRevealImpostors(false);
    setRevealStarter(false);
    setResultsShown(false);
    const starterId = ids[randInt(ids.length)];
    const starter = players.find(p => p.id === starterId);
    setStartingPlayer(starter.name);

  }

  /* {gameStartedMessage && (
  <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
    <div className="font-bold text-green-700">La partida se ha iniciado</div>
    <div className="text-sm text-slate-700 mt-1">
      Jugadores: {players.length}
    </div>
  </div>
  )} */

  function startWithAnimation() {
    // play a short animation/feedback before starting the game
    if (players.length < MIN_PLAYERS) return alert(`Necesitas al menos ${MIN_PLAYERS} jugadores`);
    setStarting(true);
    // small delay so users see animation (800ms)
    setTimeout(() => {
      setStarting(false);
      startGame();
    }, 800);
  }

  function endToMenu() {
    // reset everything
    setStarted(false);
    setSelectedWord(null);
    setImpostorIds([]);
    setRemainingImpostors(0);
    setVictoryDialog(false);
    setImpostorVictoryDialog(false);
    setEliminatedPlayers([]);
    setEliminatedImpostors([]);
    setCurrentBigCard(null);
    setResultsShown(false);
    setRevealImpostors(false);
    setRevealStarter(false);
  }

  function revealForPlayer(id) {
    const isImpostor = impostorIds.includes(id);
    updatePlayer(id, { clicked: true, roleRevealed: isImpostor ? 'impostor' : 'word' });
    if (isImpostor) setRemainingImpostors(prev => prev - 1);
  }

  function eliminatePlayer(id) {
    setEliminatedPlayers(prev => {
      const newEliminated = [...prev, id];
      const activeCount = players.length - newEliminated.length;
      const newRemaining = remainingImpostors - (impostorIds.includes(id) ? 1 : 0);
      if (activeCount === newRemaining){
        endGame("impostors");
      }  
      return newEliminated;
    });
    if (impostorIds.includes(id)) {
      setEliminatedImpostors(prev => [...prev, id]);
      setRemainingImpostors(prev => {
        const newRemaining = prev - 1;
        if (newRemaining === 0){
          endGame("players");
        } 
        return newRemaining;
      });
    }
  }

  function allRevealed() {
    return players.every(p => p.clicked);
  }

  function showResults() {
    setResultsShown(true);
  }

  function applyPoints(winnerType) {
    setPlayers(prevPlayers =>
      prevPlayers.map(p => {
        if (winnerType === "players") {
          const isNotImpostor = !impostorIds.includes(p.id);
          const gain = isNotImpostor ? 200 : 0;

          return {
            ...p,
            points: p.points + gain,
            lastGain: gain
          };
        }

        if (winnerType === "impostors") {
          const isImpostor = impostorIds.includes(p.id);
          const gain = isImpostor ? 500 : 0;

          return {
            ...p,
            points: p.points + gain,
            lastGain: gain
          };
        }
        return p;
      })
    );
  }

  const endGame = (winner) => {
    if (winner === "players") {
      applyPoints("players")
      setVictoryDialog(true)
    }

    if (winner === "impostors") {
      applyPoints("impostors")
      setImpostorVictoryDialog(true)
    }
  }

  function newGameKeepPlayers() {
    // go back to lobby so users can change settings before starting
    setSelectedWord(null);
    setImpostorIds([]);
    setRemainingImpostors(0);
    setVictoryDialog(false);
    setImpostorVictoryDialog(false);
    setEliminatedPlayers([]);
    setEliminatedImpostors([]);
    setStarted(false);
    setCurrentBigCard(null);
    setResultsShown(false);
    setRevealImpostors(false);
    setRevealStarter(false);
  }

  function toggleCategory(cat){
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c=>c!==cat) : [...prev, cat]);
  }

  function selectAllCategories(){ setSelectedCategories(allCategories.slice()); }

  function clearAllCategories(){ setSelectedCategories([]); }

  function toggleExpanded(cat) {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) {
        newSet.delete(cat);
      } else {
        newSet.add(cat);
      }
      return newSet;
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      {starting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3 shadow-xl">
            <div className="w-14 h-14 border-4 border-t-red-600 border-slate-200 rounded-full animate-spin" />
            <div className="font-semibold">Iniciando partida…</div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">Juego del impostor</h1>
          {started ? (
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={endToMenu}>Ir al menú</button>
          ) : (
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setMostrarModal(true)}>Ver Categorías</button>
          )}
        </div>

        {!started && (
          <div>
            <section className="mb-4">
              <h2 className="font-semibold">Jugadores</h2>
              <div className="mt-2 border rounded-lg p-2 max-h-64 overflow-auto">
                {players.map((pl, idx) => (
                  <div key={pl.id} className="flex items-center gap-2 py-2">
                    <div className="flex-1">
                      <input
                        className="w-full bg-slate-50 rounded px-2 py-1"
                        value={pl.name}
                        onChange={e => updatePlayer(pl.id, { name: e.target.value })}
                      />
                      <div className="text-xs text-slate-500">ID: {pl.id}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button className="px-3 py-1 rounded bg-slate-200 text-sm" onClick={() => addPlayer()}>+</button>
                      {players.length > MIN_PLAYERS && (
                        <button className="px-3 py-1 rounded bg-rose-200 text-sm" onClick={() => removePlayer(pl.id)}>-</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="flex-1 rounded px-3 py-2 bg-blue-500 text-white" onClick={addPlayer}>Añadir jugador</button>
                <button className="flex-1 rounded px-3 py-2 bg-amber-400 text-black" onClick={() => {
                  if (!confirm('¿Estás seguro que quieres resetear los nombres de todos los jugadores?')) return;
                  setPlayers(p => p.map((pl, i) => ({ ...pl, name: `Jugador ${i + 1}` })));
                }}>Reset nombres</button>
              </div>
            </section>

            <section className="mb-4">
              <h2 className="font-semibold">Opciones</h2>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex items-center justify-between gap-2">
                  <span>Mostrar categoría/clase a todos</span>
                  <input type="checkbox" checked={showClassForAll} onChange={e => setShowClassForAll(e.target.checked)} />
                </label>

                {!randomImpostors && (
                  <label className="flex items-center justify-between gap-2">
                    <span>Número de impostores</span>
                    <select value={numImpostors} onChange={e => setNumImpostors(Number(e.target.value))} className="bg-slate-50 rounded px-2 py-1">
                      {Array.from({ length: Math.max(1, players.length - 1) }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="flex items-center justify-between gap-2">
                  <span>¿Impostores aleatorios?</span>
                  <input type="checkbox" checked={randomImpostors} onChange={e => setRandomImpostors(e.target.checked)} />
                </label>
                {randomImpostors && (
                  <>
                    <label className="flex items-center justify-between gap-2 ml-4">
                      <span>Mínimo de impostores</span>
                      <select
                        value={minImpostors}
                        onChange={e => setMinImpostors(Number(e.target.value))}
                        className="bg-slate-50 rounded px-2 py-1"
                      >
                        {Array.from(
                          { length: Math.max(1, maxImpostors - 1) },
                          (_, i) => i + 1
                        ).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center justify-between gap-2 ml-4">
                      <span>Máximo impostores</span>
                      <select
                        value={maxImpostors}
                        onChange={e => setMaxImpostors(Number(e.target.value))}
                        className="bg-slate-50 rounded px-2 py-1"
                      >
                        {Array.from(
                          { length: Math.max(1, players.length - minImpostors) },
                          (_, i) => i + minImpostors + 1
                        ).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
              </div>
            </section>

            <section className="mb-4">
              <h2 className="text-sm uppercase text-blue-600">Categorías (elige las que entran en la partida)</h2>
              <label className="flex items-center justify-between gap-2 mb-2">
                <span>Modo Light (sin palabras ofensivas)</span>
                <input type="checkbox" checked={lightMode} onChange={e => setLightMode(e.target.checked)} />
              </label>
              <div className="mt-2 border rounded-lg p-2 max-h-44 overflow-auto">
                <div className="flex gap-2 mb-2">
                  <button className="px-2 py-1 bg-slate-200 rounded" onClick={selectAllCategories}>Seleccionar todo</button>
                  <button className="px-2 py-1 bg-slate-200 rounded" onClick={clearAllCategories}>Limpiar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allCategories.map(cat => {
                    const count = WORD_BANK.filter(w => w.category === cat && (!lightMode || !offensiveWords.includes(w.word))).length;
                    return (
                      <label key={cat} className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={()=>toggleCategory(cat)} />
                        <span className="text-xs font-bold uppercase text-blue-600">{cat} <span className="text-xs text-slate-400">({count})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="flex gap-2">
              <button className="flex-1 rounded px-3 py-2 bg-green-500 text-white" onClick={startWithAnimation}>Iniciar partida</button>
              <button className="flex-1 rounded px-3 py-2 bg-slate-200" onClick={() => {
                if (!confirm('¿Estás seguro que quieres volver al número mínimo de jugadores? Se eliminarán los jugadores extra.')) return;
                setPlayers(p => p.slice(0, MIN_PLAYERS));
              }}>Volver mínimo</button>
            </div>
          </div>
        )}

        {started && (
          <div>
            <div className="mb-3">
              <div className="text-sm">Jugadores: {players.length}</div>
              {revealImpostors && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-semibold text-red-700">Información de Impostores</div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-black">Impostores restantes: {remainingImpostors}</div>
                  </div>
                  <ul className="list-disc list-inside">
                    {impostorIds.map(id => (
                      <li key={id} className={`flex items-center justify-between ${eliminatedImpostors.includes(id) ? 'text-red-600 line-through' : ''}`}>
                        <span>{players.find(p => p.id === id)?.name}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="font-semibold text-blue-600">Información de la palabra</div>
                  <div><span className="text-green-600">Categoría:</span> {selectedWord?.category}</div>
                  <div><span className="text-yellow-600">Palabra:</span> {selectedWord?.word}</div>
                </div>
              )}
              {revealStarter && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-semibold text-black">Impostores restantes: {remainingImpostors}</div>
                  {startingPlayer && (<div className="font-semibold text-green-600"> Empieza: {startingPlayer}</div>
                  )}
                  <div className="font-semibold text-red-600">Elimina los impostores:</div>
                  {(() => {
                    const activePlayers = players.filter(p => !eliminatedPlayers.includes(p.id));
                    return (
                      <ul className="list-disc list-inside mt-2">
                        {activePlayers.map(p => (
                          <li key={p.id} className="flex items-center justify-between">
                            <span className="text-blue-600">{p.name}</span>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              onClick={() => eliminatePlayer(p.id)}
                            >
                              Eliminar a jugador
                            </button>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
              <div className="text-xs text-slate-500">(Pulsa tu casilla para ver tu rol en privado)</div>
            </div>

            <div className="border rounded-lg p-2 max-h-64 overflow-auto mb-3">
              {/* grid of small clickable cards */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {players.map(pl => (
                    <div key={pl.id} className="flex flex-col items-center gap-1">
                      <button
                        className={`w-20 h-20 rounded-lg shadow-sm flex items-center justify-center transition-all duration-150 ${pl.clicked ? 'bg-green-800 scale-95' : 'bg-green-200 hover:scale-105'}`}
                        onClick={() => setCurrentBigCard(pl.id)}
                      >
                        {/* empty square (revealed state indicated by bg) */}
                        <span className="sr-only">Jugador {pl.id}</span>
                      </button>
                      <div className={`text-base text-center truncate w-24 ${pl.clicked ? 'text-green-800' : 'text-green-600'}`}>{pl.name}</div>
                    </div>
                  ))}
                </div>
            </div>

           
            {/* big card modal-ish area */}
            {currentBigCard && (
              <div className="fixed inset-0 flex items-end md:items-center justify-center p-4" onClick={() => setCurrentBigCard(null)}>
                <div className="w-full max-w-md pointer-events-auto bg-white rounded-2xl shadow-2xl p-4" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">{players.find(p => p.id === currentBigCard)?.name}</div>
                      <div className="text-xs text-slate-500">{players.find(p => p.id === currentBigCard)?.name}</div>
                    </div>
                    <div>
                      <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={() => setCurrentBigCard(null)}>Cerrar</button>
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="mt-3">
                    <div className="text-xl font-bold">Categoría: <span className="text-blue-600 font-bold text-2xl">{showClassForAll ? selectedWord?.category : (selectedWord ? '???' : '')}</span></div>

                    {/* big card area: click on the card to reveal (or use button) */}
                    <div className="mt-3">
                      <div
                        className="p-4 bg-slate-50 rounded cursor-pointer select-none"
                        onClick={() => {
                          const pl = players.find(p => p.id === currentBigCard);
                          if(pl && !pl.clicked) revealForPlayer(currentBigCard);
                        }}
                      >
                        {players.find(p => p.id === currentBigCard)?.clicked ? (
                        players.find(p => p.id === currentBigCard)?.roleRevealed === 'impostor' ? (
                          <div className="text-red-600 font-bold text-xl text-center">Eres IMPOSTOR</div>
                        ) : (
                          <div className="text-center">
                            <div className="text-slate-600 text-sm">Palabra:</div>
                            <div className="font-semibold text-xl">{selectedWord?.word}</div>
                          </div>
                        )
                      ) : (
                        <div className="text-center">
                          <div className="bg-blue-500 text-white text-xl px-4 py-2 rounded">Pulsa para ver tu rol</div>
                          <div className="mt-2 text-sm text-slate-500">(Se mostrará privadamente en esta pantalla)</div>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded px-3 py-2 bg-red-600 text-white" onClick={() => setRevealImpostors(prev => !prev)}>Revelar impostores</button>
              <button className="flex-1 rounded px-3 py-2 bg-green-600 text-white" onClick={() => setRevealStarter(true)}>Revelar quién empieza</button>
              <button className="flex-1 rounded px-3 py-2 bg-violet-600 text-white" onClick={() => { newGameKeepPlayers(); startWithAnimation(); }}>Siguiente partida</button>
            </div>

            {resultsShown && (
              <div className="mt-4 border rounded-lg p-3 bg-slate-50">
                <h3 className="font-semibold mb-2">Resultados</h3>
                <div className="mb-2">Palabra: <span className="font-bold">{selectedWord?.word}</span></div>
                <div className="mb-2">Categoría: <span className="font-bold">{selectedWord?.category}</span></div>
                <div className="mb-2">Impostor{impostorIds.length > 1 ? 'es' : ''}:</div>
                <ul className="list-disc list-inside">
                  {impostorIds.map(id => (
                    <li key={id}>{players.find(p => p.id === id)?.name} (Jugador {id})</li>
                  ))}
                </ul>

                <div className="mt-3 flex gap-2">
                  <button className="flex-1 rounded px-3 py-2 bg-green-500 text-white" onClick={newGameKeepPlayers}>Nueva partida</button>
                  <button className="flex-1 rounded px-3 py-2 bg-blue-500 text-white" onClick={endToMenu}>Salir al menú</button>
                </div>
              </div>
            )}

          </div>
        )}

        <footer className="mt-4 text-xs text-slate-500 text-center">Diseñado para móvil. Responsive y sencillo. Puedes convertirlo en PWA o envolverlo en WebView.</footer>
      </div>

      {victoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">¡Felicidades!</h2>
              <p className="mb-6">Eliminasteis a todos los impostores.</p>

              {/* LISTA DE JUGADORES + PUNTOS */}
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "10px",
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#f8f8f8"
                }}
              >
                {players.map(p => {
                  
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid #e5e5e5"
                      }}
                    >
                      <span>{p.name}</span>
                      <span>
                        {p.points - p.lastGain} + {p.lastGain} = <b>{p.points}</b>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* BOTONES */}
              <div className="flex gap-4 justify-center">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => { setVictoryDialog(false); endToMenu(); }}
                >
                  Ir al menú
                </button>

                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => { setVictoryDialog(false); newGameKeepPlayers(); startWithAnimation(); }}
                >
                  Siguiente partida
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


      {impostorVictoryDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
          <div className="bg-white p-6 rounded-xl max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">¡Los impostores ganan!</h2>
              <p className="mb-6">Los impostores han sobrevivido y ganado la partida.</p>

              {/* LISTA DE JUGADORES + PUNTOS */}
              <div style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginTop: "10px",
                  marginBottom: "20px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: "#f8f8f8"
                }}
              >
                {players.map(p => {

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid #e5e5e5"
                      }}
                    >
                      <span>{p.name}</span>
                      <span>
                        {p.points - p.lastGain} + {p.lastGain} = <b>{p.points}</b>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => { setImpostorVictoryDialog(false); endToMenu(); }}>Ir al menú</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => { setImpostorVictoryDialog(false); newGameKeepPlayers(); startWithAnimation(); }}>Siguiente partida</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMostrarModal(false)}>
          <div className="bg-white p-6 rounded-xl max-w-4xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Categorías y Palabras</h2>
              <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
            {allCategories.map(cat => {
              const isExpanded = expandedCategories.has(cat);
              const wordsInCat = WORD_BANK.filter(w => w.category === cat && (!lightMode || !offensiveWords.includes(w.word)));
              return (
                <div key={cat} className="mb-6">
                  <h3 className="text-lg font-bold uppercase text-blue-600 mb-2 cursor-pointer flex items-center gap-2 justify-between" onClick={() => toggleExpanded(cat)}>
                    <span className="flex items-center gap-2">
                      <span>{isExpanded ? '▼' : '▶'}</span> CATEGORÍA: {cat.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-500">({wordsInCat.length})</span>
                  </h3>
                  {isExpanded && (
                    <ul className="text-sm list-disc list-inside">
                      {wordsInCat.map(w => <li key={w.word}>{w.word}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
    
