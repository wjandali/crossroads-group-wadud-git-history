import React, { Component } from 'react';
import {
  Col,
  Container,
  Navbar,
  Row
} from 'react-bootstrap';

import moment from 'moment';

import InfiniteScroll from 'react-infinite-scroller';
import GitHub from 'github-api';

import './App.scss';

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
    const { sha, commit: { author: { name, email, date }, message } } = commit;

    return (
      <Row key={sha} className="commitContainer border text-primary">
        <Col xs={12} className="fieldsWrapper font-weight-bold">
          <Row className="shaContainer">
            <Col xs={12} className="sha">
              <p className="font-weight-bold">
                Commit: { sha }
              </p>
            </Col>
          </Row>
          <Row className="authorContainer">
            <Col xs={12} className="author">
              <p>
                Author: { name }, { email }
              </p>
            </Col>
          </Row>
          <Row className="messageContainer">
            <Col xs={12} className="message">
              <p>
                Message: { message }
              </p>
            </Col>
          </Row>
          <Row className="dateContainer">
            <Col className="date">
              <p>
                Submitted: { date }
              </p>
            </Col>
          </Row>
        </Col>
      </Row>
    );

  }
  
  render() {
    return (
      <div style={{height: '100%', width: '100%', overflow: 'auto'}}>
        <Container fluid={true}>
          <InfiniteScroll
            useWindow={true}
            loadMore={this.fetchCommits.bind(this)}
            hasMore={this.state.requestsMade < MAX_REQUESTS && this.state.commits.length < this.state.total}
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
