import React, { Component } from 'react';
import { clickCell } from '../actions';

import '../styles/menu.css';
import coral from '../img/coral.png';
import clownfish from '../img/clownfish.png';

import { changeIndex, resetGame, changeSuggester, changeNumSuggestions, changeSuggestionDelay } from '../actions';
import sleep from '../utils/sleep';

import { isWinner } from '../utils/winner-loser';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

class Menu extends Component {

    constructor(props) {
        super(props);

        this.state = {
            runningSuggestions: false,
        };
    }

    /**
       Method acts as a simple bot for running suggester as many times as user defined and with proper delay.
       @method delegateToSuggester
       @param {Suggester} A suggester object.
       @param {Integer} numSuggestions Number of times to ask for suggestions
       @param {Game} Game object.
       @return {void}
    */
    async delegateToSuggester(suggester, numSuggestions, delay) {
        for (let i = 0; i < numSuggestions; i++) {

            const game = this.props.currentGame;

            // No more need for suggestions.
            if (isWinner(game.board)) {
                break;
            }

            let suggestion = suggester.nextSuggestion(game);
            if (suggestion.type === 'clownfish') {
                this.props.store.dispatch(clickCell(suggestion));
            }
            this.props.store.dispatch(clickCell(suggestion));

            if (delay && numSuggestions > 1) {
                this.setState({
                    runningSuggestions: true,
                });

                await sleep(delay);
            }
        }

        this.setState({
            runningSuggestions: false,
        })
    }

    render() {

        const { currentGame, games, store, suggesters, suggester, numSuggestions, suggestionDelay } = this.props;
        const currentIndex = games.map(game => game.title).indexOf(currentGame.title);

        // Create a series of options to render in select component.
        const gameOptions = games.map((game, i) => {
            return {
                value: i,
                label: game.title,
            };
        });

        const selectedGameOption = gameOptions[currentIndex];

        // Create a series of suggester options to render in select component.
        const suggesterOptions = suggesters.map((suggester, i) => {
            return {
                value: i,
                label: suggester.getName(),
            };
        });

        let selectedSuggester = null;
        if (suggester) {
            selectedSuggester = suggesterOptions.find(option => option.label === suggester.getName());
        }

        const suggestButtonDisabled = (selectedSuggester === null);
        const disabledClass = (suggestButtonDisabled || this.state.runningSuggestions) ? 'disabled' : null
        const suggestButtonClassNames = `green-button ${disabledClass}`;
        const makeSuggestionText = numSuggestions <= 1 ? 'Play a suggestion' : `Play ${numSuggestions} suggestions`;
        const suggestButtonTitle = this.state.runningSuggestions ? 'Running' : makeSuggestionText;

        return (
            <nav>
              <h2>
                <img src={coral} /> <span>Coral and</span>  <span>clownfish</span> <img src={clownfish} />
              </h2>
              <div className='menu-label'>
                Select a game
              </div>
              <Select name="games"
                      value={selectedGameOption}
                      clearable={false}
                      options={gameOptions}
                      disabled={this.state.runningSuggestions}
                      onChange={event => store.dispatch(changeIndex(event.value))}
              />
                <button className='reset-button'
                        disabled={this.state.runningSuggestions}
                        onClick={() => store.dispatch(resetGame(currentGame))}>
                  Reset
                </button>

              <h3>Suggestions welcome</h3>

              <div className='menu-label'>
                Select a suggester
              </div>
              <Select name="suggesters"
                      value={selectedSuggester}
                      clearable={false}
                      disabled={this.state.runningSuggestions}
                      options={suggesterOptions}
                      onChange={event => store.dispatch(changeSuggester(suggesters[event.value]))}

               />
              <div className='menu-label'>
                How many suggestions?
              </div>

              <input type='number'
                     min="1"
                     value={numSuggestions}
                     disabled={this.state.runningSuggestions}
                     onChange={event => store.dispatch(changeNumSuggestions(event.target.value))}
                     className='number-suggestions' />

              <div className='menu-label'>
                Time between each suggestion? (ms)
              </div>

              <input type='number'
                     min="1"
                     disabled={this.state.runningSuggestions}
                     value={suggestionDelay}
                     onChange={event => store.dispatch(changeSuggestionDelay(event.target.value))}
                     className='number-suggestions' />

                <button className={suggestButtonClassNames}
                      disabled={suggestButtonDisabled}
                        onClick={() => this.delegateToSuggester(suggester, numSuggestions, suggestionDelay)}
                      >
                  {suggestButtonTitle}
              </button>

            </nav>
        );
    }
}

export default Menu;
