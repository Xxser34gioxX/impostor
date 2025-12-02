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
      roleRevealed: null // null | 'impostor' | 'word'
    }))
  );

  const [showClassForAll, setShowClassForAll] = useState(true);
  const [numImpostors, setNumImpostors] = useState(1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [impostorIds, setImpostorIds] = useState([]);
  const [starting, setStarting] = useState(false); // show a short animation when starting
  const [revealImpostors, setRevealImpostors] = useState(false);
  const [revealStarter, setRevealStarter] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentBigCard, setCurrentBigCard] = useState(null); // player id for big view
  const [firstPlayerId, setFirstPlayerId] = useState(null);
  const [resultsShown, setResultsShown] = useState(false);
  // categories available (derived from WORD_BANK)
  const allCategories = useMemo(() => Array.from(new Set(WORD_BANK.map(w => w.category))).sort(), []);
  // counts per category (used in UI)
  const categoryCounts = useMemo(() => {
    const map = {};
    WORD_BANK.forEach(w => { map[w.category] = (map[w.category] || 0) + 1; });
    return map;
  }, []);
  const [selectedCategories, setSelectedCategories] = useState(() => allCategories.slice());

  // helpers to modify players
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
  const wordPool = WORD_BANK.filter(w => selectedCategories.includes(w.category));
  if (wordPool.length === 0) return alert('No hay palabras en las categorías seleccionadas. Selecciona al menos una categoría.');
  const pick = wordPool[randInt(wordPool.length)];
    setSelectedWord(pick);
    // choose impostors
    const ids = players.map(p => p.id);
    const chosen = [];
    // shuffle copy
    const idPool = [...ids];
    while (chosen.length < numImpostors) {
      const idx = randInt(idPool.length);
      chosen.push(idPool[idx]);
      idPool.splice(idx, 1);
    }
    setImpostorIds(chosen);
    // reset players clicked and roleRevealed
    setPlayers(p => p.map(pl => ({ ...pl, clicked: false, roleRevealed: null })));
    setStarted(true);
    setRevealImpostors(false);
    setRevealStarter(false);
    setResultsShown(false);
    setFirstPlayerId(ids[randInt(ids.length)]);
  }

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
    setCurrentBigCard(null);
    setResultsShown(false);
    setRevealImpostors(false);
    setRevealStarter(false);
  }

  function revealForPlayer(id) {
    const isImpostor = impostorIds.includes(id);
    updatePlayer(id, { clicked: true, roleRevealed: isImpostor ? 'impostor' : 'word' });
  }

  function allRevealed() {
    return players.every(p => p.clicked);
  }

  function showResults() {
    setResultsShown(true);
  }

  function newGameKeepPlayers() {
    // go back to lobby so users can change settings before starting
    setSelectedWord(null);
    setImpostorIds([]);
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
        <h1 className="text-2xl font-bold text-center mb-3">Juego del impostor — réplica móvil</h1>

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

                <label className="flex items-center justify-between gap-2">
                  <span>Número de impostores</span>
                  <select value={numImpostors} onChange={e => setNumImpostors(Number(e.target.value))} className="bg-slate-50 rounded px-2 py-1">
                    {Array.from({ length: Math.max(1, players.length - 1) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="mb-4">
              <h2 className="font-semibold">Categorías (elige las que entran en la partida)</h2>
              <div className="mt-2 border rounded-lg p-2 max-h-44 overflow-auto">
                <div className="flex gap-2 mb-2">
                  <button className="px-2 py-1 bg-slate-200 rounded" onClick={selectAllCategories}>Seleccionar todo</button>
                  <button className="px-2 py-1 bg-slate-200 rounded" onClick={clearAllCategories}>Limpiar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {allCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={()=>toggleCategory(cat)} />
                      <span className="text-sm truncate">{cat} <span className="text-xs text-slate-400">({categoryCounts[cat] || 0})</span></span>
                    </label>
                  ))}
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
              {revealImpostors && <div className="text-sm text-red-600 font-semibold mt-1">Impostores: {numImpostors}</div>}
              {revealStarter && <div className="text-sm text-green-600 font-semibold mt-1">Empieza: Jugador {firstPlayerId}</div>}
              <div className="text-xs text-slate-500">(Pulsa tu casilla para ver tu rol en privado)</div>
            </div>

            <div className="border rounded-lg p-2 max-h-64 overflow-auto mb-3">
              {/* grid of small clickable cards */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {players.map(pl => (
                    <div key={pl.id} className="flex flex-col items-center gap-1">
                      <button
                        className={`w-16 h-16 rounded-lg shadow-sm flex items-center justify-center transition-all duration-150 ${pl.clicked ? 'bg-slate-100 scale-95' : 'bg-white hover:scale-105'}`}
                        onClick={() => setCurrentBigCard(pl.id)}
                      >
                        {/* empty square (revealed state indicated by bg) */}
                        <span className="sr-only">Jugador {pl.id}</span>
                      </button>
                      <div className="text-xs text-center truncate w-20">{pl.name}</div>
                    </div>
                  ))}
                </div>
            </div>

            {/* big card modal-ish area */}
            {currentBigCard && (
              <div className="fixed inset-0 flex items-end md:items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-md pointer-events-auto bg-white rounded-2xl shadow-2xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">{players.find(p => p.id === currentBigCard)?.name}</div>
                      <div className="text-xs text-slate-500">Jugador {currentBigCard}</div>
                    </div>
                    <div>
                      <button className="px-3 py-1 rounded bg-slate-200" onClick={() => setCurrentBigCard(null)}>Cerrar</button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm">Categoría: <span className="font-semibold">{showClassForAll ? selectedWord?.category : (selectedWord ? '???' : '')}</span></div>

                    {/* big card area: click on the card to reveal (or use button) */}
                    <div className="mt-3">
                      <div
                        className="p-4 bg-slate-50 rounded cursor-pointer select-none"
                        onClick={() => {
                          // if not clicked yet, reveal; if already clicked do nothing
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
                            <div className="text-slate-600 text-sm">Pulsa para ver tu rol</div>
                            <div className="mt-2 text-xs text-slate-500">(Se mostrará privadamente en esta pantalla)</div>
                          </div>
                        )}
                      </div>

                      {!players.find(p => p.id === currentBigCard)?.clicked && (
                        <div className="mt-3">
                          <button className="w-full rounded px-3 py-2 bg-blue-500 text-white" onClick={() => { revealForPlayer(currentBigCard); }}>
                            Ver mi rol (privado)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-2">
            {/* controls during the running game: reveal impostors & reveal starter + view results */}
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded px-3 py-2 bg-red-600 text-white" onClick={() => setRevealImpostors(true)}>Revelar impostores</button>
              <button className="flex-1 rounded px-3 py-2 bg-green-600 text-white" onClick={() => setRevealStarter(true)}>Revelar quién empieza</button>
              <button className="flex-1 rounded px-3 py-2 bg-violet-600 text-white" onClick={() => { if (!allRevealed()) return alert('Todos deben ver su rol antes de ver resultados'); showResults(); }}>Ver resultados</button>
            </div>
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
    </div>
  );
}
