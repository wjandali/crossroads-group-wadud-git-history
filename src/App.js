import React, { Component } from 'react';
import {
  Button,
  Container,
  Navbar,
  Row
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import moment from 'moment';

import InfiniteScroll from 'react-infinite-scroller';
import GitHub from 'github-api';

import './App.css';

const TIME_WINDOW = 2;

class App extends Component {

  constructor() {
    super()

    // use the current time as a reference
    const now = moment();

    // for infinite function with the Github API (which has until/since options)
    // this is strictly because I wanted to tack on infinite scroll and multiple requests
    // otherwise I'd just fetch and display in one go
    const since = moment(now).subtract(TIME_WINDOW, 'hours');
    const until = moment(now);
    const requestsMade = 0;

    const gh = new GitHub({
      username: 'wjandali',
    });

    this.state = {
      requestsMade,
      since,
      until,
      commits: [],
      total: null,
      repository: gh.getRepo('wjandali', 'crossroads-group-wadud-git-history')
    }
  }

  componentDidMount() {
    this.fetchTotal();
    this.fetchCommits();
  }

  fetchTotal() {
    this.state.repository.listCommits().then((response) => {
      this.setState({...this.state, total: response.data.length});
    });
  }

  fetchCommits(count) {
    let { since, until } = this.state; 

    // replace until with the previous timestamp so that we fetch the next batch a time slice back
    until = moment(since);
    since.subtract(TIME_WINDOW, 'hours');

    const requestsMade = this.state.requestsMade + 1;

    this.state.repository.listCommits({since, until}).then((response) => {
      this.setState(
        {
          ...this.state,
          requestsMade,
          commits: this.state.commits.concat(response.data),
          until,
          since
        }
      );
    });
  }

  renderCommit(commit) {
    const { sha, commit: { author, message } } = commit;

    return (
      <div key={sha}>
        {sha}
      </div>
    );

  }
  
  render() {
    return (
      <div style={{height: '700px', overflow: 'auto'}}>
        <Container fluid={true}>
          <InfiniteScroll
            loadMore={this.fetchCommits.bind(this)}
            hasMore={this.state.requestsMade < 5 || !this.state.total || this.state.commits.length >= this.state.total}
            loader={<div className="loader" key={0}>Loading ...</div>}
          >
            { this.state.commits.map((commit) => this.renderCommit(commit)) }
          </InfiniteScroll>
        </Container>
      </div>
    );
  }
}

export default App;
