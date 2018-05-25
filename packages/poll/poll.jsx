import React from 'react';
import Button from '../components/button';
import ShareButtons from'../components/share-buttons';
import { Link } from'react-router-dom';
import createRequest from'core/create-request';
import responseStatuses from 'core/constants';

const API_HOST = 'http://localhost:3000';

class chosenPoll extends React.Component {
    constructor(props) {
        super(props);
        this.state = ( {
            poll: {},
            message: '',
            selectedOption: '',
            showChart: false,
            isToggleOn: false,
            selectedId: 0
        });

        this.sendVote = this.sendVote.bind(this);
        this.viewResults = this.viewResults.bind(this);
        this.showURL = this.showURL.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.URL = API_HOST + this.props.match.url;
        this.handleClick = this.handleClick.bind(this);
        // this.refreshResults = this.refreshResults.bind(this);
        this.hideMessage = this.hideMessage.bind(this);
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        createRequest('fetchPoll', {id}).then((response) => {
            this.setState({ poll: response.data || [] });
        });

    };

    handleOnChange(event) {
        this.setState({ selectedOption: event.target.value, selectedId: event.target.id});
    }

    handleClick() {
        this.setState({showChart: !this.state.showChart});
        this.setState({isToggleOn: !this.state.isToggleOn});
    }

    renderOptions() {
        let i = 0;
        if (this.state.poll.options) {
            return this.state.poll.options.map(item =>
                <div key ={i++} className="option-wrapper">
                    <input className="radio" id={i} value={item.option} name="radio" type="radio" onChange={this.handleOnChange}/>
                    <label className="option-label" htmlFor={i}>{item.option}</label>
                    <br/>
                </div>
            );
        }
    }

    sendVote() {
        if(this.state.selectedOption === '') {
            this.setState({ message: "Please choose one answer!" });
            this.hideMessage();
            return;
        }

        const id = this.props.match.params.id;

        this.setState({ message: "Thanks for your vote." });

            let index = this.state.selectedId;

            createRequest('updatePoll', { id, index}).then((response) => {
                if (response.status === responseStatuses.OK) {
                    //console.log(response);
                } else {
                    console.log('NOT OK');
                }

            });

        createRequest('fetchPoll', {id}).then((response) => {
            this.setState({ poll: response.data || [] });
        });

        this.hideMessage();

    }

    viewResults() {
        const data = this.state.poll.options;
        let bars = [];
        let totalVotes = 0;

        if (!data) {
            return;
        }

        for (let item in data) {
            if (data.hasOwnProperty(item)) {
                if (data[item].votes !== 0) {
                    bars.push(
                        <div key={item} className="bar-wrapper">

                            <p>{data[item].option}</p>

                            <div className="bar" style={{width: data[item].votes * 30}}>
                                {data[item].votes}
                            </div>
                        </div>
                    );
                    totalVotes += data[item].votes;
                }
            }
        }

        return (
            <div className="main-wrapper main-wrapper_chart">
                <div className="chart-title">{this.state.poll.title}</div>
                {bars}
                <div className="chart-title">{totalVotes} total votes.</div>
            </div>
        )
    }

    showURL() {
        const id = this.props.match.params.id;
        return (
            <div className="url-block">
                <Link className="url-link" to={`/polls/${id}`}>{this.URL}</Link>
            </div>
        )
    }

    hideMessage() {
        setTimeout(function() {
            this.setState({message: ''});
        }.bind(this), 1000);
    }

    /*refreshResults() {
        this.state.selectedOptions = {};
        for (const prop of Object.getOwnPropertyNames(this.state.selectedOptions)) {
            delete this.state.selectedOptions[prop];
        }
        // console.log(this.state.selectedOptions);
        this.setState({showChart: false});
        this.setState({isToggleOn: false});
    }*/

    render() {
        return (
            <div>
                <div className="main-wrapper">
                    <h2 className="main-title">{this.state.poll.title}</h2>
                    <div className="poll-subtitle">Choose one answer</div>
                    <div className="poll-list">
                        {this.renderOptions()}
                    </div>
                    <Button className="button button__vote" type="submit" value="Vote" onClick={this.sendVote}/>
                    <Button className="button" type="submit" value={this.state.isToggleOn ? 'Hide results' : 'Show results'}
                            onClick={this.handleClick}/>
                    <p className="vote-text">{this.state.message}</p>
                </div>
                <div className="share-wrapper">
                    <h2 className="main-title main-title_small">Share this link</h2>
                    {this.showURL()}
                    <ShareButtons url={this.URL}/>
                </div>
                <div className="chart-block" style={{display: this.state.showChart ? 'block' : 'none' }}>
                    {this.viewResults()}
                </div>
            </div>
        )
    }
}

export default chosenPoll;
