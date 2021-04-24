import './GameView.css';


const score = 1234;
const stopwatch = '12:34';

function GameView() {

  return (
    <div className="App">
    <div className="menu_top">
        <header className="widok_gry_header">
            <h3 className="klondike_title">Klondike</h3>
        </header>
        <div className="points_time">
        <p className="score_points">Punkty: {score}</p>
        <p className="score_time">Czas: {stopwatch}</p>
        </div>

        </div>
        <div className="karty_container">
        <div className="karty_top">
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img id="druga_top" src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img id="ostatnia_karta" src="./images/sample_karta.jpg" alt="karta"></img>
        </div>

        <div className="karty_bottom">
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img src="./images/sample_karta.jpg" alt="karta"></img>
        <img id="ostatnia_karta" src="./images/sample_karta.jpg" alt="karta"></img>
        </div>
        </div>
        <div className="bottom_section">
        <button className="undo_button">Cofnij</button>
        <div className="info_section">
        <p className="moves_left">Ilość ruchów do wykonania: 1234</p>
        <p className="is_possible">Czy możliwe jest skończenie partii: TAK/NIE</p>
        <p className="moves_done">Ruchy: 1234</p>

      </div>
      </div>
    </div>
  );
}

export default GameView;