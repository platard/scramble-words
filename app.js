/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * mixElements()
 * Randomizes the order of the elements in a given array or string.
 * It creates a copy and does not modify the original input.
 * This function is inspired by Steve Griffith's array shuffle prototype.
 * @param {Array|string} source - The array or string to shuffle.
 * @return {Array|string} - The shuffled array or string.
 */
function mixElements(source) {
  const elementsCopy = [...source];
  const totalElements = elementsCopy.length;

  for (let i = 0; i < totalElements; i++) {
    const currentElement = elementsCopy[i];
    const randomIndex = Math.floor(Math.random() * totalElements);
    const randomElement = elementsCopy[randomIndex];
    elementsCopy[i] = randomElement;
    elementsCopy[randomIndex] = currentElement;
  }

  return typeof source === 'string' ? elementsCopy.join('') : elementsCopy;
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

// List of words to be used in the game
const listOfWords = [
  'CANADA', 'BRAZIL', 'AUSTRALIA', 'INDIA', 'MEXICO',
  'SPAIN', 'FRANCE', 'EGYPT', 'JAPAN', 'GERMANY',
  'ITALY', 'CHINA'
];

// Mapping words to an object with id, original word, and shuffled version
const mixedWordsList = listOfWords.map((word, index) => ({
  id: index,
  originalWord: word,
  mixedWord: mixElements(word)
}));

// React root element
const gameRoot = ReactDOM.createRoot(document.getElementById('root'));

// Component to display points
function PointsDisplay({ totalPoints }) {
  return (
    <div className="results">
      <h2>{totalPoints}</h2>
      <p>POINTS</p>
    </div>
  );
}

// Component to display strikes
function StrikesDisplay({ totalStrikes }) {
  return (
    <div className="results">
      <h2>{totalStrikes}</h2>
      <p>STRIKES</p>
    </div>
  );
}

// Main game component
function ScrambleGameComponent({
  mixedWordData,
  onInputChange,
  onCheckAnswer,
  remainingPasses,
  onUsePass,
  gameDisabled
}) {
  // Handler for form submission
  function handleFormSubmit(event) {
    event.preventDefault();
    onCheckAnswer();
  }

  return (
    <>
      <h2 className="scramble-letters">{mixedWordData.mixedWord}</h2>
      <form className="scramble-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="scrambleInput"
          onKeyPress={e => onInputChange(e)}
          disabled={gameDisabled}
        />
      </form>

      <div className="scramble-button">
        <button onClick={onUsePass} disabled={remainingPasses === 0 || gameDisabled || mixedWordData.id === mixedWordsList.length - 1}>
          <span className="scramble-pass">{remainingPasses}</span> Passes Remaining
        </button>
      </div>
    </>
  );
}

// Component to display messages
function MessageDisplay({ textMessage, messageType }) {
  return (
    <div className={messageType}>
      <p>{textMessage}</p>
    </div>
  );
}

// Main App component
function ScrambleApp() {
  // State hooks
  const [currentAnswer, setCurrentAnswer] = React.useState('');
  const [currentWord, setCurrentWord] = React.useState(() => JSON.parse(localStorage.getItem('currentWord')) || mixedWordsList[0]);
  const [scorePoints, setScorePoints] = React.useState(() => JSON.parse(localStorage.getItem('scorePoints')) || 0);
  const [countStrikes, setCountStrikes] = React.useState(() => JSON.parse(localStorage.getItem('countStrikes')) || 0);
  const [infoMessage, setInfoMessage] = React.useState('');
  const [infoMessageClass, setInfoMessageClass] = React.useState('');
  const [gameIsDisabled, setGameIsDisabled] = React.useState(false);
  const [passesLeft, setPassesLeft] = React.useState(() => JSON.parse(localStorage.getItem('passesLeft')) || 3);

  // Function to handle answer submission
  function handleAnswerSubmission(event) {
    if (event.code === 'Enter') {
      setCurrentAnswer(event.target.value.toUpperCase());
      event.target.parentElement.reset();
    }
  }

  // Function to check the submitted answer
  function checkAnswer() {
    const isCorrectAnswer = mixedWordsList.some(item => item.originalWord === currentAnswer);

    if (!isCorrectAnswer) {
      const newStrikes = countStrikes + 1;
      setCountStrikes(newStrikes);
      setInfoMessage('Wrong. Try again.');
      setInfoMessageClass('message danger');

      if (newStrikes > 1) {
        setGameIsDisabled(true);
        setInfoMessage('You lost.');
        setInfoMessageClass('message danger');
      }
    } else {
      const newPoints = scorePoints + 1;
      setScorePoints(newPoints);
      setInfoMessageClass('message success');

      const foundWord = mixedWordsList.find(item => item.originalWord === currentAnswer);
      if (foundWord.id === mixedWordsList.length - 2) {
        setInfoMessage('Correct. Last word.');
      } else {
        setInfoMessage('Correct. Next word.');
      }

      if (foundWord.id < mixedWordsList.length - 1) {
        goToNextWord();
      } else if (foundWord.id === mixedWordsList.length - 1) {
        setGameIsDisabled(true);
        setInfoMessage('You win!');
      }
    }
  }

  // Function to move to the next word
  function goToNextWord() {
    setCurrentWord(mixedWordsList[currentWord.id + 1]);
  }

  // Function to reset the game
  function resetGame() {
    setCurrentWord(mixedWordsList[0]);
    setGameIsDisabled(false);
    setInfoMessage('');
    setInfoMessageClass('');
    setScorePoints(0);
    setCountStrikes(0);
    setPassesLeft(3);
  }

  // Function to use a pass
  function usePass() {
    if (passesLeft > 0) {
      setPassesLeft(passesLeft - 1);
      setInfoMessage('You passed. Next word.');
      setInfoMessageClass('message info');
      goToNextWord();
    }
  }

  // Effects for local storage
  React.useEffect(() => {
    localStorage.setItem('scorePoints', JSON.stringify(scorePoints));
  }, [scorePoints]);

  React.useEffect(() => {
    localStorage.setItem('countStrikes', JSON.stringify(countStrikes));
  }, [countStrikes]);

  React.useEffect(() => {
    localStorage.setItem('passesLeft', JSON.stringify(passesLeft));
  }, [passesLeft]);

  React.useEffect(() => {
    localStorage.setItem('currentWord', JSON.stringify(currentWord));
  }, [currentWord]);

  // Main render
  return (
    <div className="container">
      <h1>Scramble game</h1>
      <div className="results-container">
        <PointsDisplay totalPoints={scorePoints} />
        <StrikesDisplay totalStrikes={countStrikes} />
      </div>
      <MessageDisplay
        textMessage={infoMessage}
        messageType={infoMessageClass}
      />
      <ScrambleGameComponent
        mixedWordData={currentWord}
        onInputChange={handleAnswerSubmission}
        onCheckAnswer={checkAnswer}
        remainingPasses={passesLeft}
        onUsePass={usePass}
        gameDisabled={gameIsDisabled}
      />
      {gameIsDisabled && (
        <div className="playAgain-button">
          <button onClick={resetGame}>Play Again?</button>
        </div>
      )}
    </div>
  );
}

// Render the App component to the root
gameRoot.render(<ScrambleApp />);
