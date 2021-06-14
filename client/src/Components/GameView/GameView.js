import React, { useState, useEffect } from "react";
import styles from "./GameViewCyberpunk.module.css";
import CustomDragLayer from "./CustomDrag/Custom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { isDroppable, shuffleCards, numMoves } from "../../utils/card";
import Deck from "./Deck/Deck";
import Buttons from "./Buttons/Buttons";
import FinalColumns from "./FinalColumns/FinalColumns";
import MainColumns from "./MainColumns/MainColumns";
import GameMusic from "./Music/Audio";
import "../CardMotives/CardMotives.css";
import cardRight from "../../soundtrack/SoundDesign/card_right.mp3";
import Statistics from "./Statistics/Statistics";
import { Link, useLocation } from "react-router-dom";

import socket from '../Mutiplayer/socketConfig';
import agent from '../../agent/agent';

function GameView({cardset_id, effect, volume }) {
  const location = useLocation();

  const [draggingCard, setDraggingCard] = useState({ title: "", array: [] });
  const [startCardIndex, setStartCardIndex] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [moveNumbers, setMoveNumbers] = useState(0);
  const [possiblemoveNumbers, setPossibleMoveNumbers] = useState(0);
  const [gameNumber, setGameNumber] = useState(0);
  const [isGameEnded, setGameEnd] = useState(false);
  const [bonus, setBonus] = useState(1200);
  const [gameTime, setGameTime] = useState(location.handicap);
  const [points, setPoints] = useState(0);
  const [playMusic, setPlayMusic] = useState(false);

  const [mainColumn1, setMainColumn1] = useState([]);
  const [mainColumn2, setMainColumn2] = useState([]);
  const [mainColumn3, setMainColumn3] = useState([]);
  const [mainColumn4, setMainColumn4] = useState([]);
  const [mainColumn5, setMainColumn5] = useState([]);
  const [mainColumn6, setMainColumn6] = useState([]);
  const [mainColumn7, setMainColumn7] = useState([]);

  const [finalColumn1, setFinalColumn1] = useState([]);
  const [finalColumn2, setFinalColumn2] = useState([]);
  const [finalColumn3, setFinalColumn3] = useState([]);
  const [finalColumn4, setFinalColumn4] = useState([]);

  const [startColumn1, setStartColumn1] = useState([]);
  const [startColumn2, setStartColumn2] = useState([]);

  const [history, setHistory] = useState([]);
  const [playersOnEndGame, setPlayersOnEndGame] = useState([]);
  const [startTime, setStartTime] = useState(new Date());

  const startColumns = {
    startColumn1: {
      get: startColumn1,
      set: setStartColumn1,
    },
    startColumn2: {
      get: startColumn2,
      set: setStartColumn2,
    },
  };

  const mainColumns = {
    mainColumn1: {
      set: setMainColumn1,
      get: mainColumn1,
    },
    mainColumn2: {
      set: setMainColumn2,
      get: mainColumn2,
    },
    mainColumn3: {
      set: setMainColumn3,
      get: mainColumn3,
    },
    mainColumn4: {
      set: setMainColumn4,
      get: mainColumn4,
    },
    mainColumn5: {
      set: setMainColumn5,
      get: mainColumn5,
    },
    mainColumn6: {
      set: setMainColumn6,
      get: mainColumn6,
    },
    mainColumn7: {
      set: setMainColumn7,
      get: mainColumn7,
    },
  };

  const finalColumns = {
    finalColumn1: {
      set: setFinalColumn1,
      get: finalColumn1,
    },
    finalColumn2: {
      set: setFinalColumn2,
      get: finalColumn2,
    },
    finalColumn3: {
      set: setFinalColumn3,
      get: finalColumn3,
    },
    finalColumn4: {
      set: setFinalColumn4,
      get: finalColumn4,
    },
  };

  const columns = { ...finalColumns, ...mainColumns, ...startColumns };

  useEffect(() => {
    const initialShuffle = shuffleCards();
    Object.entries(initialShuffle).map(([key, item]) => {
      columns[key].set(item);
    });
    setLoading(false);
    
    startTimer();
  }, []);

  let timer;

  const startTimer = () => {
    timer = setInterval(() => {
      const reducedBonus = bonus - 1;
      setGameTime((prev) => prev + 1);
      if (reducedBonus < 0) {
        setBonus(0);
      } else setBonus(reducedBonus);
    }, 1000);
  };

  useEffect(() => {
    socket.on('write-to-end-list', ({ player, score }) => {
      setPlayersOnEndGame(prev => ([
        ...prev, {name: player, score: score}
      ]));
    });
  
    return () => {
      socket.off('write-to-end-list');
    }
  }, []);

  useEffect(() => {
    if (gameNumber > 0) {
      const initialShuffle = shuffleCards();
      Object.entries(initialShuffle).map(([key, item]) => {
        columns[key].set(item);
      });
      setMoveNumbers(0);

      Object.entries(finalColumns).map(([key, column]) => {
        column.set([]);
      });
      setStartCardIndex(0);
      setStartColumn2([]);
    }
  }, [gameNumber]);

  useEffect(
    () => {
      if(isGameEnded){
        clearInterval(timer);

        if(location.time === Number.MAX_SAFE_INTEGER){
          setPlayersOnEndGame(prev => ([
            ...prev, {name: location.players[0].username, score: points + bonus}
          ]));
        }
        else{
          socket.emit('end-game', { score: points + bonus });
        }
      }
    }
  , [isGameEnded]);

  useEffect(() => {
    if (!isLoading) {
      const mainColumnsArr = Object.keys(mainColumns).map(function (key) {
        return mainColumns[key].get;
      });
      const finalColumnsArr = Object.keys(finalColumns).map(function (key) {
        return finalColumns[key].get;
      });

      const possibleMoves = numMoves(
        mainColumnsArr,
        finalColumnsArr,
        startColumn1
      );

      if(gameTime === location.time){
        setGameEnd(true);
      }

      if (possibleMoves === 0) {
        setGameEnd(true);
      } else setPossibleMoveNumbers(possibleMoves);
    }
  }, [moveNumbers, isLoading, gameNumber, gameTime]);

  const cardSound = (src) => {
    let beep = new Audio(src);
    beep.volume=(effect/100);
    beep.play();   
  };

  const saveScore = (isWin, completionTime) => {
    if(location.players[0].room !== null){
      agent.post("/game/insert-game-occur", {
        player_id: JSON.parse(localStorage.getItem("user")).id,
        game_id: location.id, 
        points: points + bonus, 
        completion_time: completionTime, 
        moves: moveNumbers, 
        starting_distribution: '', 
        is_win: isWin
      });

      if(location.time !== Number.MAX_SAFE_INTEGER){
        socket.emit("lobby-leave");
      }
    }
  }

  const handleDrop = (currentCards, draggingCards) => {
    const selectedCard = currentCards.array[currentCards.array.length - 1] || null;
    const dropTarget = draggingCards.array[0];
    const dragArrayLength = draggingCards.array.length;
    const carriedArray = columns[draggingCard.title].get;
    const carriedArrayLength = carriedArray.length;
    const sliceEnd = carriedArrayLength - dragArrayLength;
    const carriedTarget = draggingCard.target;
    setMoveNumbers((prev) => prev + 1);
    if (isDroppable(selectedCard, dropTarget)) {
      if (draggingCards.title.includes("finalColumn")) {
        const newPoints = points - 10;
        if (newPoints < 0) setPoints(0);
        else setPoints(newPoints);       
      }
      let newHistoryStep;
      if (draggingCards.title === "startColumn2") {
        const source = columns["startColumn1"].get;
        const index = draggingCard.cardIndex;
        source.splice(index - 1, 1);
        columns[draggingCard.title].set([]);
        columns["startColumn1"].set(source);
        columns[currentCards.title].set([
          ...currentCards.array,
          ...draggingCards.array,
        ]);
        newHistoryStep = {
          source: draggingCard.title,
          target: currentCards.title,
          draggedCards: draggingCard.array,
          cardIndex: index,
        };
      } else {
        columns[currentCards.title].set([
          ...currentCards.array,
          ...draggingCards.array,
        ]);

        const reducedColumn = carriedArray.slice(0, sliceEnd);
        let reversed = null;
        if (
          reducedColumn.length > 0 &&
          !reducedColumn[reducedColumn.length - 1].isVisible
        ) {
          reversed = reducedColumn.length - 1;
        }
        if (reducedColumn.length > 0)
          reducedColumn[reducedColumn.length - 1].isVisible = true;
        columns[draggingCard.title].set(reducedColumn);

        newHistoryStep = {
          source: draggingCard.title,
          target: currentCards.title,
          draggedCards: draggingCard.array,
          reversed,
        };
      }
      cardSound(cardRight);
      setHistory([...history, newHistoryStep]);
    } else {
      carriedTarget.style.opacity = 1;
      let sibling = carriedTarget.nextElementSibling;
      while (sibling !== null) {
        sibling.style.opacity = 1;
        sibling = sibling.nextElementSibling;
      }
    }
    setDraggingCard({ title: "", array: [] });
  };
  window.addEventListener("click", function(event) {
    setPlayMusic(true);
  });
  if (isLoading) return <div>loading...</div>;

   const compareScore = (a, b) => {
    if (a.score < b.score) { return -1; }
    if (a.score > b.score) { return 1; }
    return 0;
  }
  
  if (isGameEnded) { 
    playersOnEndGame.sort(compareScore);
    playersOnEndGame.reverse();

    let isWin = playersOnEndGame[0].name === (JSON.parse(localStorage.getItem("user"))).username // tutaj albo gdzies indziej powinno sprawdzać czy ziomek wygrał
    let completionTime = gameTime;
   
    return (
      <div className={styles.stats}>
        <p className={styles.stats__h1}>Gra zakończona</p>
        <p>Lista wyników</p>
        <table className={styles.stats__table}>
          <thead>
            <tr>
              <td className={styles.stats__cell__header}>
                Gracz
              </td>
              <td className={styles.stats__cell__header}>
                Wynik
              </td>
            </tr>
          </thead>
          <tbody>
            {
              playersOnEndGame.map((player, index) => (
                <tr key={index}>
                  <td className={styles.stats__cell}>{player.name}</td>
                  <td className={styles.stats__cell}>{player.score}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
        <Link to="/">
          <button onClick={() => {
            saveScore(isWin, completionTime);

            localStorage.removeItem("gameInfo");
          }}>Zakończ grę</button>
        </Link>
      </div>
    )
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {playMusic ? volume > 0 && <GameMusic musicVolume={volume} cardset={cardset_id}/>: <></>}
      {isGameEnded && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>Gra zakończona</div>
        </div>
      )}
      <CustomDragLayer draggingCard={draggingCard} />
      <div className={styles.container}>
        <div className={styles.cardTop}>
          <Deck
            startColumn1={startColumn1}
            startColumn2={startColumn2}
            startCardIndex={startCardIndex}
            handleDrop={handleDrop}
            setDraggingCard={setDraggingCard}
            draggingCard={draggingCard}
            setStartCardIndex={setStartCardIndex}
            setStartColumn2={setStartColumn2}
            setHistory={setHistory}
            history={history}
            points={points}
            setPoints={setPoints}
            effect={effect}
          />
          <Buttons
            history={history}
            startCardIndex={startCardIndex}
            startColumn1={startColumn1}
            setStartCardIndex={setStartCardIndex}
            setStartColumn2={setStartColumn2}
            columns={columns}
            setHistory={setHistory}
            setMoveNumbers={setMoveNumbers}
            setGameNumber={setGameNumber}
            points={points}
            setPoints={setPoints}
            effect={effect}
          />
          <FinalColumns
            finalColumns={finalColumns}
            columns={columns}
            draggingCard={draggingCard}
            setHistory={setHistory}
            history={history}
            setDraggingCard={setDraggingCard}
            setMoveNumbers={setMoveNumbers}
            setPoints={setPoints}
            handleDrop={handleDrop}
            effect={effect}
          />
        </div>
        <MainColumns
          mainColumns={mainColumns}
          setDraggingCard={setDraggingCard}
          handleDrop={handleDrop}
          draggingCard={draggingCard}
          effect={effect}
        />
        <Statistics
          points={points}
          gameTime={gameTime}
          possiblemoveNumbers={possiblemoveNumbers}
          moveNumbers={moveNumbers}
        />
      </div>
    </DndProvider>
  );
}

export default GameView;
