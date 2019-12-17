import React, { Component } from 'react';
import {
  Button,
  Container,
  Row
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import GitHub from 'github-api';

import './App.css';

class App extends Component {
  constructor() {
    super()

    const gh = new GitHub({
      username: 'wjandali',
      token: '088227f747cfb91f744baa3e56df843070f007b5'
    });

    this.state = {
      commits: [],
      repository: (gh.getRepo('wjandali', 'crossroads-group-wadud-git-history'))
    }
  }

  componentDidMount() {
    this.state.repository.listCommits((commits) => {
      window.x = arguments;
      console.log(arguments);
      console.log(commits);
    }).then((commits) => {
      console.log('commits:');
      console.log(commits);
    });
  }
  
  render() {
    return (
      <Container>
        <div className="App">
          <header className="App-header">
              <Button variant="primary">Primary</Button>
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </header>
        </div>
      </Container>
    );
  }
}

export default App;
