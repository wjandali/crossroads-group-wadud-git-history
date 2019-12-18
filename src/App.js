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

const TIME_WINDOW = 3;
const MAX_REQUESTS = 30;

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
      fetching: false,
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

    // replace until with the previous timestamp so that we fetch the next batch a time slice back
    let { requestsMade, fetching, since, until } = this.state;

    if (requestsMade >= MAX_REQUESTS || fetching) return;

    this.setState({
        ...this.state,
        fetching: true,
        requestsMade: requestsMade + 1,
    }, () => {
        this.state.repository.listCommits({since, until}).then((response) => {
          this.setState(
            {
              ...this.state,
              fetching: false,
              commits: this.state.commits.concat(response.data),
              until: moment(since),
              since: moment(since).subtract(TIME_WINDOW, 'hours')
            }
          );
        });
      }
    );
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
            hasMore={!this.state.fetching && this.state.requestsMade < MAX_REQUESTS && this.state.commits.length < this.state.total}
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
