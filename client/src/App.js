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

function Critter(critter) {
  return (
    <div className="Critter">
      <header className="App-header">
        <p>Code: {critter.id}</p><br />
        <p>Name: {critter.name}</p><br />
        <p>Scientific name: {critter.sciname}</p><br />
        <p>Type: {critter.category.detail}</p><br />
      </header>
    </div>
  );
}
export default App;
export {Critter};
