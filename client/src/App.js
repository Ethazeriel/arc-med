import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Input a species code:
        </p>
        <form action="/species" method="post">
        <label for="code">Code:</label>
        <input type="text" id="code" name="code" />
        <input type="submit" value="Submit" />
        </form>
      </header>
    </div>
  );
}

export default App;
